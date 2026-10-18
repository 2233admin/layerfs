# #352 — Crazy workload watch-out (range 15 onward)

> **Status:** Research, 2026-10-18, by the owner's liaison, for the owner and
> the lead. It neither selects fixes nor changes gates. A fix, gate or config
> change still needs a finding record, owner approval where the rules require
> it, and old-vs-new evidence. Sources: five read-only research passes
> (FUSE; overlay and Workspace; Commit and merge; mount, exec and daemon;
> long history and Store size), the dev P3 run `dev352-p3f` (RESULTS.md row
> 124, `598703040`), and range metrics r011–r014. Code locations were read
> between `2092ca0b8` and `a96de99e6`. The headline items marked **[V]** were
> re-checked in source by the liaison. **[E]** means measured, **[C]** read
> from code, **[I]** inferred.

## 1. What changes at range 15

Ranges 0–14 were agents editing a source tree of a few thousand files. From
range 15 the same Store also carries a package manager, a compiler and a test
runner. Later ranges add a real `.git` (F-031) and history 14 times longer.

| | Ranges 0–14 | Range 15 onward |
| --- | --- | --- |
| Files in the tree | ~2–16k tracked | + ~38k files and ~6k directories per `node_modules` [E: 38,155 creates, dev range 15] |
| Write pattern | one file per `fs.write` | bursts of tens of thousands of creates, symlinks, renames and chmods in one exec; `rm -rf` of the whole tree |
| Read pattern | grep, glob and read on source files | module resolution: huge numbers of failed `stat`/`open` probes, readdir of big folders |
| Commit size | one file, or a lane merge of ~100 files | one install Commit of ~45k entries; merges of Branches that both installed |
| FUSE requests | small | ~823k requests for one clean reinstall, ~21.6 per created file [E] |
| History | 14 ranges | 202 ranges; up to ~6k Commits between published Layers in one range (forecast) |
| Store | ~1 GB scale | ~5.8 GiB forecast at range 201 with `.git` (band 4.8–9.8) |

The dev run already shows the effect, LayerFS vs native [E]: install 13.0 vs
4.1 s, `tsc -b` 9.8 vs 6.4 s, vitest 5.6 vs 1.5 s, install Commit 20.2 s,
clean reinstall 44.7 s, of which ~31.6 s is `rm -rf node_modules` (F-032).

## 2. Stops and correctness (any one ends a range or the replay)

**S1. The 4,096-row ancestry cap will stop ranges 98, 112 and 129.** [V]
- `MAXIMUM_LINEAGE_ROWS = 4096` (`layerfs-history/src/contract/records.rs:24`).
  Publish (`layerfs-persistence/src/history/layerstack.rs:389`, `commit.rs:68`)
  and merge walk every Commit since the Branch's base Layer. Past the cap the
  call fails `Capacity`.
- Publish statements track the range's Commits almost exactly [E]: r011 960
  Commits / 977 statements, r013 866 / 883, r014 1,163 / 2,346 (two walks).
- Forecast with F-031's extra Commit per dsh commit: r98 ~6,251, r112 ~4,589,
  r129 ~4,293 Commits; r84 ~3,700 is within 12% [I].
- Below the cap the walk still runs inside the writer and grows with the
  range. Architecture 83 calls work that grows with history inside the lane a
  defect.
- Product view: a long-lived Branch with more than 4,096 unpublished Commits
  can never publish or merge again.
- **Check:** a plan pre-flight flagging any range over 3,000 Commits between
  Layers; a counter of nodes walked per publish and merge; a bounded test
  with 4,097 Commits on one Branch (expected `Capacity` today). The fix
  (stored generation numbers or distance to the Layer) is the owner's call.

**S2. A lane held longer than 2 s makes every other writer fail `Busy`.** [V]
- The writer admission window is 2 s
  (`layerfs-persistence/src/backend/sqlite/admission.rs:12`). It covers other
  Commits, Saves and inode serial reservations, in every process.
- Two paths can hold the lane that long for an install Commit [C]:
  - **merge at publish:** if the Branch head moved while the install was
    constructing, the merge works from the install's side and visits every
    install path (`commit.rs:168-171`, `decide.rs:130-216`). At the measured
    0.31–0.47 ms per path, ~45k paths is ~14–22 s in the lane [I].
  - **unmerged Commits:** `logical.count` opens and decodes every changed
    file only to get its length (`statistics.rs:50-74` → `file/view.rs:28-43`),
    and `bindings` writes ~46k hint rows in ~12 transactions
    (`hints.rs:18-57`), both inside the lane.
- **Check:** trace `lane`, `logical.count`, `bindings`, `finish`, `publish`
  per Commit against changed inodes; record whether each exec Commit merged.
  Forced probe: one `fs.write` on the same Branch while an install Commit is
  constructing; count `Busy`.
- Related: D-1's reopen trigger names growth with history, tree or Branch
  count, not change size. Proposed extra trigger: any lane hold over 500 ms on
  a Commit-bearing call.

**S3. A create can fail `EAGAIN` while another Workspace commits.** [V]
- Each create takes an inode serial from a per-Workspace pool, refilled 1,024
  at a time (`layerfs-workspace/src/workspace/serials.rs:8`) through a Store
  write. If the 2 s admission wait (S2) gives up with the pool empty, the create
  answers `EAGAIN` (`layerfs-daemon/src/service/filesystem_port.rs:369`) and
  pnpm fails. F-025 fix 4 (the reservation pool, now being timed) is the
  relevant fix.
- **Check:** serial reservations, their writer wait and `EAGAIN` replies per
  mount; one install while another Workspace commits a `node_modules`-sized
  change. Any `EAGAIN` is a stop finding.

**S4. Two Branches that both installed always conflict when merged.** [C]
- Each mount gets a new `/workspaces/<N>`; pnpm writes that absolute path
  into `.modules.yaml`, `.pnpm-workspace-state-v1.json` and every `.bin` shim,
  plus timestamps in the two state files (INSTALLS §4). Both sides change
  them, so `merge3` reports Content or AddAdd conflicts and `branch.merge`
  refuses. Symlinks with different targets are mislabelled `ConflictKind::Type`.
- This is a real product case: agents on separate Branches that both install
  hit it too.
- **Owner decision before measured P3:** a merge rule for `node_modules`
  state (for example, conflicts there are expected and the merged result runs
  `pnpm install`, as developers do after `git merge`), or one fixed mount path
  per Workspace.
- **Check:** two lanes from one base each install the same lockfile, then
  `branch.merge`; count conflicts by path class.

**S5. One unexpected failure ends the whole mount.** [C]
- Any kept failure makes the mount terminal and every later request gets
  `EIO` (`layerfs-fuse/src/dispatch/requests.rs:235-241`), including FORGET,
  RELEASE and Store port errors. Low chance per request, ~1.7M requests per
  full install.
- **Check:** assert `terminal == 0` and kept failures `== 0` on every exec and
  unmount (the counters exist).

**S6. Harness stops that look like product failures.** [C]
- A `Busy` unmount from processes still holding files (vitest's esbuild
  service, pnpm children) throws in the closure's `finally`
  (`dsh/tools/history/closure.mjs:146`); unmount makes one plain `umount2`
  attempt and nothing retries it (correctly). **Check:** count processes with
  a cwd under the mount and zombies before each closure unmount.
- Exec keeps 1 MiB per stream and sets `truncated`
  (`sdk/js/native/src/exec.rs:18`); the closure parses vitest JSON and lister
  output without checking it (`closure.mjs:132,143`, `unit-tests.mjs:92-96`).
  Once vitest's JSON passes 1 MiB the range fails with a `JSON.parse` error,
  not a Mismatch. **Check:** log length and `truncated` for every closure exec.

## 3. Sandbox performance (mount, exec, Commit)

**P1. Heavy exec work is serialized inside each Workspace.** [V]
- Two FUSE receive loops per mount (`layerfs-fuse/src/dispatch/types.rs:7`),
  `max_background = 1` and `congestion_threshold = 1`
  (`layerfs-fuse/src/mount/profile.rs:45-46`), one Workspace state lock, one
  Store `ReadSession` mutex per Workspace. With async reads, readahead and
  77k RELEASEs share one background slot.
- The replay daemon's shared Store-read cache is 64 KiB and each Workspace
  pager is 1 MiB (`sdk/js/native/src/sandbox.rs:61-63`). Once `node_modules`
  is committed, nearly every tsc and vitest lookup and read goes to SQLite;
  a fresh one-shot Workspace starts with a cold kernel cache and a new reader.
- Failed lookups are answered as `ENOENT` errors, not cached negative entries
  (`layerfs-fuse/src/attributes.rs:102`), so every repeated failed module
  probe returns to the daemon [C; kernel effect I].
- Consistent with vitest at 3.7× and install at 3.2× native [E].
- **Check:** per install, tsc and vitest exec: FUSE requests by opcode,
  `ENOENT` lookups, time both loops are busy, lock wait, `ReadSession` wait,
  cache hits/misses, SQL pages read. Run tsc twice (fresh Workspace, then the
  same one) to split cold from steady cost. One labelled diagnostic arm with
  `cache_bytes` 64 MiB and `pager_kib` 16 MiB to size the effect; changing the
  defaults needs a finding.

**P2. The install Commit (20.2 s) is LayerFS's largest single cost.** [E]
- Longer than the install itself. Parts: the in-lane change-size steps (S2),
  and reclamation (P3). Construction memory is streamed and bounded [C]:
  64-row capture pages, waves of at most 512 objects / 4 MiB.
- **Check:** the per-phase trace in S2, plus time from the install job to the
  Commit reply.

**P3. Reclamation after a Commit runs before the Commit replies.** [V]
- `call_observed` and `reply_attempted` call `maintain()` after each job
  (`layerfs-store-service/src/overlay/owner.rs:402, 562`). The loop runs until
  no step makes progress; each step deletes at most 14 cells or 64 rows
  (`maintenance/ready.rs:29-32`, `garbage.rs:14-19`). Installing a Commit's
  base retires the whole captured generation, ~43k data steps for a 2.3 GiB
  install [I]. Any FUSE request that finishes a job meanwhile also drains it,
  so the next exec in a long-lived Workspace stalls.
- **Check:** maintenance rows and bytes per call; latency of an `exec true`
  and a `stat` right after the install Commit.

**P4. `rm -rf` of a committed tree: ~0.7 ms per entry (F-032).** [E]
- 40,145 unlinks and 6,187 rmdirs, +44k lookups, +18k readdirs, +46k forgets,
  ~31.6 s [E, per-op time inferred].
- Likely causes [C]: the link count of a committed directory lists the whole
  directory to count subdirectories (`base/links.rs:85-127`, cache keyed by
  content root, 16,384 entries daemon-wide); readdir of a committed directory
  looks up each entry separately (`operations/kernel_directory.rs:245`), the
  F-026 defect still present in the mount path; P3's inline reclamation.
- From range 16 every fresh Workspace that lists `node_modules/.pnpm` (~1,450
  entries) pays the per-entry readdir cost.
- **Check:** per-op timing first (queued with F-032); split `rm` from install
  time; `ls -f node_modules/.pnpm` in a fresh one-shot Workspace each range,
  with statements per entry gated flat against tree size.

**P5. Mount can wait on every Workspace in the daemon.** [C]
- `mount` holds the daemon registry mutex while `maintenance_failure()`
  locks each live Workspace in turn (`layerfs-daemon/src/control/operations.rs:139-164`,
  `overlay/workspaces.rs:297-302`). Status, Commit and unmount admission wait
  meanwhile. Worst while a neighbour runs pnpm.
- **Check:** time that call and the registry wait at 1 and 16 mounts, with a
  neighbour installing.

**P6. Unmount after an install.** [C]
- The overlay file (multi-GB after an install) is unlinked synchronously
  before the reply (`overlay/backing.rs:102-119`); SDK unmount still runs the
  full discovery refresh (F-029 left it); mount and unmount hold the
  per-Sandbox discovery guard across the daemon call, so other agents on that
  Sandbox wait, up to 60 s, then `Busy`.
- **Check:** unmount phases with the overlay size just before it; guard wait
  per mount and unmount at 4 agents per Sandbox.

## 4. Disk and storage

**D1. Overlay files never shrink while mounted.** [V]
- `auto_vacuum=NONE` (`layerfs-overlay/src/database/profile.rs:60`); payload is
  stored raw; freed pages are reused but the file keeps its peak until
  terminal unmount. One install is ~2.3 GiB payload, ~3 GiB overlay peak
  (SPEC). Up to 16 can exist at once in the containers' writable layers.
- The disk guard (SPEC §7) projects one install peak.
- **Check:** per Workspace page count, free list and file size after install,
  after Commit and after reclamation; daemon total at range end; Docker VM free
  disk sampled during the range; the guard uses concurrent installs × peak.

**D2. Snapshots copy the whole Store every time.** [E]
- Every manifest has `newBytes == size`; consecutive snapshots share 0 of 41
  blocks; 353 references to 353 distinct blocks. 49–56 of 256 pages change per
  1 MiB block in one range, likely from inserts into hash-keyed indexes.
- At about one snapshot per range, P3–P5 need roughly 0.3–0.6 TB [I].
- The snapshot-time gate divides by `newBytes`, so it passes by construction.
- **Check:** gate `newBytes ÷ size`; measure page-level reuse on r013→r014
  before P3.

**D3. `.git` roughly doubles Store growth and trips D-3 by the letter.** [I]
- From F031_DESIGN's measurement: ~2.4 GiB of `.git` over ranges 15–201 (up to
  ~4.5), mostly loose zlib objects that LayerFS cannot deduplicate, plus ~729k
  short-lived object paths of metadata. Range-201 Store ~5.8 GiB (band
  4.8–9.8), ~4.3 GiB with F-027.
- D-3's trigger ("misses the design target by > 20%") will fire because the
  target has no `.git` line, although a zstd dictionary cannot shrink zlib data.
- **Check:** re-derive the design target with a `.git` line before judging
  D-3; report `.git` bytes per range by source (loose, pack, index, metadata).

**D4. A clean reinstall rewrites all metadata.** [E/C]
- +5.84 MB metadata, gate at 6.62× [E]. `rm -rf` plus reinstall creates new
  inode serials, so every inode row is new even with identical content
  (`workspace/serials.rs`). F-027 item 2 (mtime-only) does not remove serial
  churn [I].
- **Check:** after F-027 item 2, the reinstall check's metadata with changed
  inode and path counts.

## 5. Long history drift (SDK fs, branch, project and Commit)

**H1. The content-signature ring is scanned and sorted on every Save.** [V]
- `SELECT … FROM content_signature ORDER BY stamp LIMIT 8193`
  (`layerfs-persistence/src/backend/sqlite/metadata_signatures.rs:10`), no
  index on `stamp`. Full-scan steps per uncontended `fs.write` grow ~0.07 per
  Commit [E]: 786, 850, 882, 975 at r11–r14. The first install fills the ring
  (8,192 rows), plausibly +1–4 ms on the 8.8 ms p50 [I], and evicts the
  tracked files' signatures.
- **Check:** gate `fullscan_steps` and `sorts` per uncontended Commit; record
  the ring's row count each range.

**H2. WAL growth is not observed.** [C]
- `gates.mjs` expects `health.walBytes`, which range metrics lack; the WAL is
  read only at seal, where it is always the 4 MiB journal limit. Autocheckpoint
  (1,000 pages) runs inside the `COMMIT` that crosses it, so in the lane.
  Overlapping readers in up to 4 daemons and the SDK can prevent the WAL from
  resetting during a 2.3 GiB install Commit.
- **Check:** sample the `-wal` size about once a second, record the peak;
  uncontended `commit_ns` p99.

**H3. Caches against a many-GB Store.** [C/I]
- Store connections: 2 MiB page cache, no mmap. `object_location` reaches
  ~5M rows and likely a fourth B-tree level. Cheap while the OS page cache
  holds the Store; the risk is the Store plus installs exceeding the Docker
  VM's RAM.
- **Check:** SQLite cache misses per call (nothing counts them today); Docker
  VM memory against Store size per range.

**H4. Lane merges get more expensive as main carries installs.** [C/E]
- `branch.merge` takes candidates from base→ours; once main carries one lane's
  install, later lane merges walk those paths again. Range-14 lane merges
  already rise with accumulated change (50→138 ms) while staying ~0.36 ms per
  changed file [E].
- **Check:** merge paths and statements per lane merge, in order, at a range
  where two lanes install.

**H5. `fs.grep` at ~46 MB/s.** [E]
- 427 MB in ~9.3 s for the whole-tree probe. A watch item; the probe scope is
  an open owner decision (lead's options a/b/c).

**What should stay flat:** uncontended `fs.write` p50 has been flat (8.7,
10.0, 9.7, 8.7 ms at r11–r14). Expect one step at the first install (H1, a
deeper inode table), then slow drift from cache misses. Plot by size class
against depth and Store bytes: `fs.write` p50/p95, statements, `vm_steps`,
`fullscan_steps`, `sorts`, `commit_ns`, lane hold, Save time, RSS per daemon.

## 6. Memory

- A Workspace's open state grows with the files the kernel references,
  ~78k after an install in a long-lived Workspace; released only by FORGET
  (`layerfs-overlay/src/open/kernel.rs:18-38`) [C]. Tens of MB each, possibly
  hundreds at 16 [I]. dev P3 reported 285 MB daemon RSS with no Workspace
  open, unexplained [E].
- **Check:** daemon RSS and open-state counts after install, before and after
  unmount, at 1, 4 and 16 Workspaces; RSS must return to its baseline.

## 7. What looks safe

- UpToDate stays cheap: capture reads only the active generation; a large
  earlier overlay is not rescanned [C]. `tsc -b` after remount: 83/83 up to
  date, Commit UpToDate [E].
- Capture and base install are generation swaps, constant in tree size [C].
- The mount template is an empty schema; its copy does not grow [C].
- Construction streams in bounded pages and waves [C].
- Merge path naming is per changed file (0.31–0.47 ms), confirmed on all 35
  recorded merges [E].
- Normalized install fields are exactly the install root and two timestamps;
  no other difference from native [E].

## 8. Before measured range 15

Checks to add to the dev range (no gate change; record and report):
1. Flat-cost check: uncontended `fs.write` Commit, mount and lane hold before
   vs after the first install, same history point (S2, H1).
2. Forced contention: one `fs.write` during an install Commit's construction;
   one install while another Workspace commits (S2, S3).
3. A two-sided install merge (S4).
4. Per-phase Commit trace and time to reply for the install Commit (P2, P3).
5. Per-exec FUSE counters: opcode counts, `ENOENT` lookups, loop occupancy,
   cache hits/misses, `terminal` and kept failures (P1, S5).
6. `rm` vs install split and `ls -f node_modules/.pnpm` in a fresh Workspace
   (P4, with F-032's per-op timing).
7. Overlay sizes, Docker VM free disk and memory, `-wal` peak, daemon RSS
   (D1, H2, H3, §6).
8. Closure hygiene: leftover processes before unmount; `truncated` on every
   closure exec (S6).
9. Snapshot block reuse on r013→r014 (D2).

Owner decisions this raises:
1. **Ancestry cap (S1):** fix before P4/P5 reach it, and how.
2. **`node_modules` merge rule (S4):** before measured P3.
3. **F-032 (`rm -rf`):** before or after measured range 15 (liaison: before).
4. **Lane hold (S2):** add "lane hold > 500 ms" as a D-1 reopen trigger, and
   whether the merge-at-publish side choice is a fix before P3.
5. **Snapshots (D2):** method or frequency, since they are not incremental.
6. **D-3 target (D3):** re-derive with a `.git` line before it is judged.
7. **Cache sizes (P1):** approve a labelled diagnostic arm before any default
   change.
