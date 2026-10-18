# #359 batch 3 (part) · F-B2 · orphan-domain probe only for orphan serials

| | |
| --- | --- |
| Trigger | #359 RCA R5/R6 (`COMMAND_COST_RCA_20261018.md` §6 F-B2): while any orphan exists, every inode read runs a `generation=-1` SELECT first. During `rm -rf`, each unlinked file still held by a kernel lookup is an orphan until its FORGET, so the probe runs on almost every read |
| Kind | code path only (overlay). No format change |
| Binaries | before: baseline daemon `d7ae4806` (rm-rf-nm) and batch 2 `e720bcad` (cp-rm-nm) → after: `811e5bca` (`8d0a32f10`), addon `837445b6` |
| Commits | `8d0a32f10` on local branch `issue359-impl` (not pushed) |
| Status | implemented; exactness and the per-read statement removal verified by tests; **wall-time effect not established** |

## Change

`Overlay::orphan_inode` (`layerfs-overlay/src/lifetime/orphan.rs`) asks the
journaled orphan map in memory before the SELECT, and reads nothing for a
serial the map does not hold.

This is exact because an orphan-domain inode row exists only while the map
holds its serial:

- it is written after the map entry (`detach_orphan`, `put_inode_domain`);
- it is deleted before the map entry (`reclaim_orphan`);
- rollback restores the map with the SQL (the map is journaled).

Not done: the visit-fence half (keeping row memory while orphans exist). It
needs a row-memory clear at the detach sites in `namespace/compound.rs`, whose
ownership is not yet confirmed by the liaison.

## Proof

- `layerfs-overlay` orphans tests:
  - while orphans exist, a non-orphan read costs the seek alone (inode-family
    attempts 2 → 1);
  - each orphan's own read is still answered by its probe;
  - a rolled-back release restores the exact open state.
- Overlay 14/14.
- Daemon `kernel_custody`, `kernel_mutation`, `kernel_coherence`,
  `mounted_links`, `mounted_cycles`, `mount_control`, `forced_unmount`, `fp31`
  and `mounted_concurrency` all pass in the pinned image.

## Performance (one sample per arm; not attributable)

| Case / step | Before ms | After ms | Requests served | Owner jobs | Owner hold ms (general) | Host load (1 min) |
| --- | ---: | ---: | --- | --- | --- | --- |
| rm-rf-nm / rm-committed | 27,592 (baseline) | 34,188 | 230,774 → 230,774 | 289,727 → 289,727 | 3,831 → 4,712 | 6.4 → 6.4 |
| cp-rm-nm / cp | 50,475 (batch 2) | 71,594 | 563,803 → 569,783 | 616,470 → 622,760 | 5,430 → 8,224 | 7.2 → 17.8 |
| cp-rm-nm / rm-created | 10,471 (batch 2) | 25,911 | 197,677 → 203,212 | 209,918 → 215,453 | 2,284 → 4,444 | 7.2 → 17.8 |

Request and job counts are unchanged, and so are Store statements. The
removed statements are overlay SQL, which the telemetry does not report.

The longer times and holds come with unchanged work. cp-rm-nm ran at load
17.8, with two non-#359 issue containers running throughout. They are host
interference, not a measured effect of F-B2, and no improvement is claimed
from them either.

Measurement breach, recorded: the two cases were started in one command,
which ran 149 s, over the 2-minute command rule. Each case kept its own
115 s alarm, and neither sample was cut short.

## Left open

- Overlay statement counts need a telemetry counter, or a mounted counting
  test, before this or F-B1/F-B3 can be judged by counts rather than wall
  time.
- The visit-fence half of F-B2 waits on `namespace/` ownership.
