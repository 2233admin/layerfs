# Range 013 a1 · oneshot_mount_exec grew in `exec true` launch, not in LayerFS

| | |
| --- | --- |
| Trigger | `oneshot_mount_exec` time exponent 2.30 on p2-main-d (ranges 11–13: 50.8, 66.8, 78.1 ms; depth 7,783 → 9,385); every SQL counter identical (50 statements, 1,134 VM steps, 60 full scans, 126 rows) |
| Playbook step | D0 (where the time goes), confirm only (coordinator, ≤2 min) |
| Kind | none: not a product finding. The growth is the executor's command launch (`docker exec` of `true`), whose spread covers it; no daemon, FUSE or Store work grew |
| Binaries | daemon `6d467539`, addon `7ec591f1` (unchanged) |
| Commits | this record only; no product or harness change |
| Recovery | fork p2-main-d range 11, fast-forward 12, rerun 13 measured (lead), with the builder's split probe (RESULTS.md, 2026-10-18) |

## Finding

The probe is mount, `exec true`, unmount, one sample per range. In the trace
(`~/lfs-history/runs/p2-main-d/trace/range-01{1,2,3}.*.jsonl`) mount is 9.7,
9.6, 8.2 ms and unmount 6.4, 6.9, 6.3 ms. All the growth is the exec: 33.3,
48.8, 62.4 ms, with about 1–2 ms of daemon observation and zero FUSE
requests. The sibling `oneshot_commit` exec fell over the same ranges (50.6,
39.7, 34.5 ms). Every play exec of the same aging daemon (150–237 per range)
does not grow either: p50 46.1, 47.5, 42.9 ms, minimum 23.7, 21.9, 19.7 ms.

## Confirm (fresh daemon per snapshot)

Forks `f020-d013-r11` and `f020-d013-r13` of p2-main-d's range-11 and
range-13 snapshots. Each has a fresh daemon `6d467539` and addon `7ec591f1`,
in the runner-like container (`core/target/f020/incontainer.sh`, default
bridge, `LAYERFS_DAEMON_HOST=host.docker.internal`). Each run makes one
Sandbox and one Workspace on a fork of main, then runs `exec true` 10× in a
row (`core/target/f020/exec10.mjs`). Timed at the client.

| Snapshot | min | median | max | mount | unmount |
| --- | --- | --- | --- | --- | --- |
| range 11 (depth 7,783) | 18.19 | 34.79 | 61.75 | 7.26 | 3.49 |
| range 13 (depth 9,385) | 24.43 | 40.99 | 47.48 | 7.44 | 4.06 |

The spreads overlap: range 13's maximum is below range 11's, and the range-13
probe's 62.4 ms lies within range 11's 10-call spread. Mount and unmount are
equal. The ten calls of one Sandbox vary 3.4× (18.2–61.8 ms) on one daemon,
so the one-sample exec cannot carry a time exponent.

Overlap, declared. The builder's calibration container was not running
during either 10× run. During the range-13 probe itself (03:00:23Z), the
fixer's 4-job Linux addon build ran in the same Docker VM (03:00:16–03:00:40Z).
That is interference on the recorded 62.4 ms.

Raw: `core/target/f020/d013-exec10.txt` in the fixer's worktree.

## Left open

- The probe split (mount+unmount judged as before; exec judged by its FUSE
  and daemon share; exec wall time reported, not scaled) is the builder's,
  per RESULTS.md 2026-10-18.
- Finding: `~/lfs-history/metrics/finding-013.a1.json` (fix kind "none";
  `checkFinding` takes it since `e78bbaa42`).
- Diagnostic volumes `layerfs-issue352-f020-d013-r11` and `-r13` were removed
  after this record was accepted.
