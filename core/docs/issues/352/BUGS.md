# #352 — Bugs

> **Status:** Current, kept by the lead and the fixer. One line per stop finding:
> range, playbook step, cause, fix kind, fix commit, recovery.

| Range.attempt | Step | Cause | Fix kind | Fix commit | Recovery |
| --- | --- | --- | --- | --- | --- |

## Open findings (before any range)

- **F-001 · fs request size cap.** One fs request carries at most 65,519 bytes, so
  `fs.write` cannot write a file over ~64 KiB. AGENTS.md rules out transport frames
  as a total-file cap. Workaround in the plan: those files go through a Sandbox
  `apply` step. Owner of the fix: the fixer, before P3's 9 : 1 split is measured.
  **Fixed** (fixer, D0, kind 1): write bodies stream after the call record and
  are written a record at a time (`layerfs-api` `base/stream.rs`, daemon
  `sdk/body.rs`); 64 MiB `fs.write` round-trips in ~1 s, daemon peak +14 MiB.
  Daemon `ed66aa0d`, addon `3da0f665`. The planner can drop its size clause.
  [fixes/000-pre-f001-streamed-write-bodies.md](fixes/000-pre-f001-streamed-write-bodies.md).
- **F-002 · full-scan steps on hot paths (lead, not yet a gate finding).** Dev runs
  show reader `fullscan_steps` of 58 at mount bind, 242 at a one-shot Commit and
  668 at a merge. To be read against depth in the pilot (playbook D4).
- **F-002, fixer's reading (002.a1).** The 242/668 at Commit and merge are each
  Save's read of the content-signature ring (`metadata_signatures.rs`, a scan and
  sort of at most 8,193 ring rows; 273 now). Bounded by the ring, not by depth;
  the 58 at mount bind is flat (schema checks). Left as is; the merge part is in
  [fixes/002-a1-merge-ancestry.md](fixes/002-a1-merge-ancestry.md).
- **F-003 · diff_commits walks both whole trees (fixer, 002.a1, not yet a gate
  finding).** `compare.rs` `changes()` reads both trees; probes give VM-step
  exponent 0.59 against depth with one changed file. A change-proportional diff
  needs per-directory change information the format lacks (SPEC §6 format kind).
  **Fixed** in `49499abac` (Store format: `binding_hint`, walk in
  `layerfs-content::compare`): [fixes/002-a1-diff-commits-change-walk.md](fixes/002-a1-diff-commits-change-walk.md).
- **F-004 · report.mjs rewrites earlier ranges' recorded reports (tooling, lead,
  2026-10-18).** After the same-binary gate change, `play` regenerated
  `ranges/range-000.md` and `range-001.md`, replacing their recorded check
  results and reasons with a re-evaluation under the new gate. The lead
  restored the committed versions; recorded outcomes are never edited. Fix
  (builder): `report.mjs` writes only the report of the range it just played and
  keeps every earlier attempt's recorded check rows as written. **Fixed** in
  `badd7494d` (stored gate results, `report.mjs check`, format rule F1–F8).
- **F-005 · chunks are never stored as deltas (lead, 2026-10-18, owner-tracked).**
  Range 4's chunk depth histogram is [0: 906], and [0: 2,419] since Init: every
  chunk object is FULL. Is it no base found, or are files rarely chunked
  (≥ 128 KiB)? It feeds the delta decision (SPEC §8). Owner: the fixer,
  diagnosis first.
  **Diagnosis (fixer, D5):** wiring defect. The chunk selector only takes the
  base its caller offers (`layerfs-storage/src/encoding/delta/select.rs:311-312,
  383-390`) and captured construction never offers one (`construct_runs` passes
  `None`, `layerfs-content/src/file/construction/runs.rs:93,100,103,125`;
  `stream_combined`, `file/edit/apply.rs:517`). Fix accepted: offer the old
  file's chunk at the same position as base; no Store format change. Lands after
  F-001, before P2's measured run.
  **Fixed** (fixer, D5, kind 1): the localized edit route offers each new chunk
  the old chunk sharing most of its bytes, aligned on unchanged chunks (fallback:
  the unchanged neighbour's successor). Range-4 fork, 1 MiB file: insert near the
  start 37,029 → 3,941 stored bytes (0/3 → 3/3 chunks as deltas), middle edit
  25,649 → 4,785; the append was already a delta. Files built without a base
  (new inodes) still store FULL. Daemon `cbfa5e7f`;
  [fixes/004-dev-f005-chunk-delta-base.md](fixes/004-dev-f005-chunk-delta-base.md).
- **F-006 · health cannot judge overlay files left (lead, 2026-10-18).** The
  health row reads "? overlays", so a leaked Workspace overlay would go unseen.
  Owner: the builder (measure it per range, REPORT_FORMAT.md). **Done** in
  `a1d975ffa` (measured per range in the report's health row).
- **F-007 · Trends were never written (lead, 2026-10-18).** §6 has been empty in
  every report; it becomes the headline's "moved most" line (REPORT_FORMAT.md).
  Owner: the builder. **Done** in `a1d975ffa` (the headline's top movers).
- **F-008 · Sandbox Commit refused `HeadMoved` under concurrent same-lane
  Commits (builder's P2 dev run, 2026-10-18; stop class, blocks P2).** A
  Sandbox Commit merges against the Branch head it read and fails at publish
  when another agent committed in between; the fs write path refuses a head
  move the same way. Range 5 (dev run `p2-dev`) stopped twice at r005.s0051.
  The plan expects such a Commit to merge cleanly (SPEC §2, stale clean merge).
  Owner: the fixer, first priority. A dev-only `--serialize-commits 1` aid
  exists and is refused for measured runs.
  **Fixed** (fixer, D1, code path): head read, merge and publish run inside the
  Store's publication lane (`layerfs-persistence` `lane.rs`,
  `HistoryCatalog::publish_lane`); fs writes merge too and conflict as
  `Conflict`. Daemon `18ab5415`; range 5 on a range-4 fork passes (old: STOP
  r005.s0048). [fixes/005-dev-f008-merge-at-publish.md](fixes/005-dev-f008-merge-at-publish.md).
- **F-009 · concurrent unmounts of two Workspaces in one Sandbox fail
  "Workspace absent" (builder, 2026-10-18).** Worked around in the player with
  one Sandbox per agent. Owner: the fixer.
  **Fixed** (fixer, D1, SDK addon): `refresh` skips a Workspace the daemon reports
  absent, and a process's own discovery mutations take turns before the OS lock.
  Addon `4e141e51`; [fixes/005-dev-f009-concurrent-unmount.md](fixes/005-dev-f009-concurrent-unmount.md).
- **F-010 · the checkpoint `diff_commits` is not O(changed) (builder,
  2026-10-18; owner's point 7).** Pages return ~20–27 entries; page 0 grew
  127 → 213 ms (401k → 703k VM steps) from range 5 to 7 (dev run); per entry
  3.3 → 6.5 → 13.0 ms against the ~11 ms one-file probe; later pages re-skip
  from the start. Dev ranges 7–11 gated optimize on it. Owner: the fixer.
  **Fixed** (fixer, D3, kind 1): `nextCursor`/`cursor` resume the change walk and
  `hunks: false` lists paths only; range-4 checkpoint 2,541 → 411 ms (2 pages
  instead of 12) with both. The player should adopt them.
  [fixes/007-dev-f010-diff-cursor.md](fixes/007-dev-f010-diff-cursor.md).
- **F-011 · old-format Stores are refused (lead, 2026-10-18, REBUILD.md).**
  `binding_hint` (002.a1) was handled as a Store-format change (kind 3, fast
  rebuild) although `diff_commits` already falls back to a full walk for roots
  without hints: it should have been kind 2. Forward fix: open older Stores,
  create the table when missing, record hints from then on. Nothing is rebuilt.
  Owner: the fixer, after F-005.
  **Fixed** (fixer, D0, kind 2): a writable open adds the table to a Store
  whose recorded schema is exactly the earlier one and records the current
  schema; trees saved before it diff by the full walk. p1-pilot's range-1
  snapshot (`0ef24121`) was refused by `cbfa5e7f` and passes its whole-tree
  checkpoint with `71001f65`; REBUILD.md §4 for the batch passes on a range-4
  fork written by `511dceed`.
  [fixes/002-a1-f011-binding-hint-migration.md](fixes/002-a1-f011-binding-hint-migration.md).
- **F-012 · checkpoint `diff_commits` per changed entry rises with depth
  (builder's re-baseline, daemon `71001f65`, 2026-10-18).** Per entry
  0.44 → 0.72 → 1.00 ms over ranges 0–2 (depth exponent 0.80, optimize in
  `p1-rebase` and `p1-control-b`; 0.61 and 0.42 with ranges 3 and 4); the
  one-file probe is flat (~11 ms, vm_steps 18–21k). Owner: the fixer, counter
  diagnosis before P2.
  **Diagnosis (fixer, D2/D3):** not depth. Replayed at depth 3,497, each
  checkpoint's counters equal the original's at depths 571–2,611 (range 1
  17,532 → 17,646 statements, range 3 27,462 → 27,624). Two causes: every page
  rebuilds the whole checkpoint's plan (range 3: 3 pages × ~26k statements), and
  statements per entry track tree files (~0.25 × files), which grows with depth
  in this replay. Actions: the fixer carries the plan in the cursor (kind 1); the
  builder makes the gate measure per checkpoint (all pages) per changed entry,
  keeping the one-file probe as the depth control. Not normalised by tree files:
  the per-entry tree-size growth is itself a §4 violation and is fixed in F-012.
  **Fixed** (fixer, D3, kind 1): the daemon keeps the 4 latest plans by root
  pair, so a later page reuses its difference's plan, and a bounded per-call
  object memo stops lookups re-reading B-tree upper pages. p1-rebase
  checkpoints, statements per entry 69 / 74 / 90 / 118 / 120 → 5.7 / 6.3 / 7.3 /
  6.6 / 8.0 (ranges 0–4); range 3 733 → 42 ms. Same 103 changes in a 400- and a
  30,100-file tree: 477 and 549 statements. Daemon `361bb09e`;
  [fixes/002-rebase-f012-diff-plan-memo.md](fixes/002-rebase-f012-diff-plan-memo.md).
- **F-013 · per-entry gate trips on a fixed per-checkpoint cost (tooling,
  lead, 2026-10-18).** `p1-rebase-b` (daemon `361bb09e`) gated optimize at
  range 2: checkpoint `diff_commits` ms per entry against tree files, exponent
  0.952. Total statements were flat (1,557 → 1,389 → 1,413 for 327, 240, 208
  entries) while tree files grew 255 → 373: per-entry cost = a/n + b rises as n
  falls. Fix (builder): judge the fixed part a and the marginal part b
  separately, each flat with tree size and depth; never normalise by tree files;
  unseparable points are "not judged" (watch). The recorded optimize verdict of
  that baseline run stays as recorded.
- **F-014 · the "one-file" `diff_commits` probe had a drifting input
  (tooling, builder, 2026-10-18).** It diffed the lane's newest Commit, which
  changed 4, 5, 15 and 60 files at ranges 0–3 (`p1-rebase-b`), so its raw
  statements (152, 146, 140, 239) tripped Counters against tree files (0.694).
  SPEC §3c defines one changed file. Fix (builder): a true one-file diff on the
  probe's own Branch, with a probe version in the metrics; gates never fit
  across versions; the other probes are checked for the same drift. Recorded
  values stay; the baseline is re-measured as `p1-rebase-c`.
- **F-016 · gate reads a bounded, periodic chain cost as depth growth
  (tooling, 007.a1, 2026-10-18).** `list_small` cycles with the metadata depth
  cap (8). Owner: the builder, after F-017; an unbounded series must still trip.
  **Fixed** (builder, gate): chain-reading probes are judged as a bound, the
  max over the latest cap period against the first (1.0× bounded), not a depth
  exponent; fewer than a period plus one point is not judged. `list_largest`
  is fitted per entry of its directory. gates.mjs header, SPEC §5.
- **F-017 · fs calls of all agents serialize on one Sandbox control
  connection (product, 007.a1 S1, 2026-10-18).** `registry.rs`
  `control: Mutex<Control>`; reads queue behind Commits (range 7: 1 ms work,
  19 ms p50 client). Owner: the fixer, now. **Fixed** (SDK addon `5baa0f5d`,
  kind 1): a bounded pool of up to 6 connections per Sandbox, queue wait in the
  trace; [fixes/007-a1-f017-control-connections.md](fixes/007-a1-f017-control-connections.md).
- **F-018 · SDK reads queue behind a Commit's publication lane (product,
  007.a1 F-017 tail, 2026-10-18).** History lookups (project, Branch, Commit,
  Layer) ran on the writer session, and traced calls read SQL counters
  through the writer's admission. Both waited for any Commit holding the lane,
  merges included; past 2 s a read failed `Busy`. **Fixed** (daemon
  `c25119ac`, kind 1): lookups use the control reader's read-only session, and
  counters are read under the state lock alone;
  [fixes/007-a1-f018-reads-behind-publication-lane.md](fixes/007-a1-f018-reads-behind-publication-lane.md).
- **F-020 · Store calls cross a Sandbox for no reason (product, owner direction
  2026-10-18, after 007.a1 F-017/F-018).** Every fs, branch, project and
  operator call takes a control round trip into a daemon in a Sandbox; on
  range 4 (`c25119ac`/`5baa0f5d`) fs.read is 4.48 ms p50 at the client for
  0.12 ms of traced work. Owner: the fixer, now (the builder keeps playing P2
  on the current route until the switch). Kind 1. Spec:
  [DIRECT_STORE_IMPL.md](DIRECT_STORE_IMPL.md); record:
  [fixes/007-a1-f020-direct-store-access.md](fixes/007-a1-f020-direct-store-access.md).
  One route, Linux only (owner): the daemon stops serving Store calls and the
  old-route tests are deleted, not converted. **Fixed on `dsh-352-f020`**
  (fixer; steps 1–3 `91cde4d50`, daemon host `ce83289f1`, proofs `373b0357c`),
  awaiting merge. Step 6 on range 12: read p50 6.08 → 2.84 ms, write p50
  14.73 → 11.81 ms, Workspace calls unchanged; isolated-call SQL equal; Store
  bytes +0.10% (interleaving; serial sequence equal). fs-bench-pro is a known
  break left for the owner.
- **F-021 · F4 judged the with-vs-without table by the before/after shape
  (tooling, builder, 2026-10-18, range 007 attempt 2).** The check read every
  table line after the before/after header, so the attempt-vs-rerun table
  failed the eight-column rule. **Fixed** (builder, `f061aab65`): each Finding
  table is checked by its own shape (REPORT_FORMAT.md §5 Findings items 3–4).
- **F-022 · a mount listed every Branch to find one (product, 009.a1,
  2026-10-18).** `layerfs-api` `mount_branch` paged `project.list_branches` and
  searched the items for the name, so a one-shot mount's VM steps grew with the
  Branches (about 7 per range). **Fixed** (daemon `58a60046`, addon
  `799e3ca6`, kind 1): `project.list_branches` takes `name` and answers from
  the index;
  [fixes/009-a1-mount-branch-lookup.md](fixes/009-a1-mount-branch-lookup.md).
- **F-025 · Commits queue behind in-lane merges whose path search walks the
  tree (product, owner direction 2026-10-18, from 007.a2's `fs.write` ≤512 KiB
  watch).** 20–30% of fs.* Commits merge at publish inside the lane, and
  `merge.paths` names changed inodes with two breadth-first walks from the
  root (`merge/decide.rs:147-148`), so its cost grows with the tree's
  directories (p50 28.6 → 56.1 ms from r9a2 to r11 on `58a60046`). Merged
  writes run 240 ms p50 at r11, and unmerged writes queued behind them reach
  271 ms p95. Owner: the fixer, now; fix 1 (top-down path naming) first,
  then lane narrowing, reads off the writer queue, and fixed per-call costs.
  Kind 1. The thin-baseline gate question goes to F-024 and does not close
  this. [fixes/007-a2-f025-merge-in-lane.md](fixes/007-a2-f025-merge-in-lane.md).
  **Fix 0 done** (daemon `bd6fbeee`, diagnostic): the untraced gap is the
  Store writer's admission queue. On a range-11 fork with six concurrent
  writers, 161 of a write's ~208 ms p50 is `wait.writer`: 100 ms in
  construct, 29 ms in the private Workspace's serial reservation (the gap),
  31 ms in producer, begin and lane.
  Owner 2026-10-18: one database, one writer, short holds is the design;
  fix 1 and fix 4 go ahead, fixes 2–3 are deferred; judged on the uncontended
  and contended series (SPEC §5).
  **Fix 1 done** (`3dff9c5cb`, merged `9815dbc95`; daemon `57141b57`, addon
  `438bae05`): changed inodes are named from the recorded bindings, not
  by walking the tree. On the same range-14 input, measured once per arm:
  - in-Commit merge p50 fell from 49.5 to 3.5 ms;
  - merged-Commit lane hold p50 fell from 51.6 to 6.3 ms;
  - merged-Commit p50 fell from 242 to 30 ms;
  - fs.write p95 fell from 428 to 42 ms;
  - the uncontended series is unchanged.
  All 35 recorded `branch.merge`s replay to the root they recorded, on both
  addons. Fix 4 is next.
  **Fix 4 done** (`04d07a293`; daemon `128a959c`, addon `74d08425`). An SDK
  file call reuses an idle reader, the Store's idle producer and pooled
  serials (4,096 per catalog reservation). Mounted Workspaces are unchanged.
  `fs.write` p50 went from 8.04 to 6.79 ms (create) and from 8.60 to 7.07 ms
  (edit). Merge naming counters were added: 0 of 35 recorded merges fall
  back, and per-inode naming cost is flat.
- **F-026 · a listing re-read the inode table per entry (product, 011.a1,
  2026-10-18).** `fs.list` looked each entry up separately from the inode
  table's root, so the cost per entry grew with the table (`list_largest`
  16.6 → 24.3 statements per entry, ranges 9 → 11). **Fixed** (daemon
  `0cc2a732`, kind 1): one memo per call, and each page's entries looked up
  together; [fixes/011-a1-list-entry-lookups.md](fixes/011-a1-list-entry-lookups.md).
- **F-028 · an apply step rewrote files it does not change (harness, lead,
  2026-10-18).** The Sandbox apply script rewrote and chmodded every regular
  file. That sets mtime, which the root records, so an all-identical apply
  (first r012.s0021; 22 in plans 0–98) would Commit where UpToDate is
  expected. **Fixed** (harness, owner-approved): a regular file whose blob and
  mode equal the lane's tree is not sent, rewritten or chmodded. `sandboxExpect`
  is unchanged. Whether mtime alone is a change stays with the owner;
  [fixes/012-pre-f028-apply-identical-files.md](fixes/012-pre-f028-apply-identical-files.md).
- **F-029 · every SDK call on a Sandbox refreshes discovery for all its
  mounts (product, liaison during 013.a1, 2026-10-18).** `registry::sandbox()`
  calls `discovery::refresh()` (`sdk/js/native/src/discovery.rs:411`), which
  reads the Sandbox's record folder and sends one daemon `workspace.status`
  per mounted Workspace before every call, exec included. Traced exec p50 is
  49.6 / 57.0 / 70.9 / 107.0 ms at 1 / 4 / 8 / 16 mounts in one Sandbox
  (untraced 46.3 → 51.6). It was not 013.a1's cause (the probe Sandbox has one
  mount), but it grows when agents share a Sandbox. Candidate fix: exec takes
  its mount's directory from the in-memory mount table, or refreshes only the
  named mount. Owner: the fixer, after F-027, together with Engine connection
  reuse. Exec launch itself, a fresh Docker exec per call (three Engine
  exchanges with `Connection: close`, then dockerd → containerd → runc), is
  the Sandbox's cost. A long-lived launcher is the owner's call.
  Owner read (2026-10-18): the growth is a reasonable range for 16 mounts.
  Untraced it is +5 ms (46.3 → 51.6, about 0.35 ms per mount), so this is
  low-priority cleanup at the end of the fixer's queue, not a performance
  problem.
  **Fixed** (`3e632716a`, addon `2e0c53df`, daemon unchanged). A call that
  names a mount takes it from the process's table, checks its record with
  one `stat`, and makes no daemon call. Close, unmount and the process calls
  still refresh in full. One sample per arm, old against new (p50):
  - 16 concurrent traced calls across 16 mounts: 845.9 → 56.0 ms;
  - sequential exec at 16 mounts: 109 → 19 ms.
  [fixes/013-a1-f029-sandbox-call-discovery.md](fixes/013-a1-f029-sandbox-call-discovery.md).
  **Engine connection reuse done** (`0126695f9`, addon `604df2b2`, daemon
  unchanged). Exec create and inspect share one kept-alive Engine
  connection; Start keeps its own Upgrade. Over 30 `exec true` calls, one
  sample per arm, p50/p90 went from 43.9/48.6 to 35.1/46.8 ms.
  [fixes/013-a1-engine-connection-reuse.md](fixes/013-a1-engine-connection-reuse.md).
- **F-030 · `daemon[].fuse.served` on traced exec lines is cumulative
  (tooling, liaison, 2026-10-18).** It rose 35 → 248 across calls, including
  `true` calls that make no requests. Readers must take differences per
  Workspace. Owner: the builder checks the `oneshot_exec` probe split
  (08de4f038) before range 13's rerun.
- **F-031 · the replay's Workspaces have no `.git` (harness coverage gap,
  liaison observation, builder check, 2026-10-18).** `git.mjs` checks out
  with `git --git-dir <bare> --work-tree`, so Init never saw a `.git`. The
  player never runs git, and SPEC does not mention it. AGENTS says a Workspace
  includes `.git` and its index. **Owner decision 2026-10-18 (replaces the
  lead's depth-1 plan, which stopped before any edit; corrected the same day):**
  from P3, a seed holding the full history up to range 15's start commit only
  (nothing later; proved by `git rev-list --all`; 1,545 commits, 9.35 MiB pack),
  checked out at the range start, and one `git commit` per
  replayed dsh commit with the original message, author and dates, so HEAD
  equals the replayed id. The proof adds HEAD = the checkpoint commit and a
  clean `git status`. See [SPEC §2, `.git` in Workspaces](SPEC.md). Owner: the
  builder, after the P3 dev checks, measuring Store growth per git commit
  (index, loose objects, packs) and the wall time added per range.
  **Design gate (owner, 2026-10-18): F-031 is not built until a short design is approved by the owner.** It must say (1) how lanes commit: which Workspace and Branch runs each `git commit`, and on which Git branch; (2) how a LayerFS merge of two Branches that both changed `.git` treats `.git/index`, `HEAD`, refs, `logs/`, `ORIG_HEAD` and packs written by auto-repack (conflict, rule or rebuild, with no retry or guessed resolution); (3) how dsh's merge commits are reproduced with their original parents (both parents' objects in one `.git`). The design names its proof and its expected Store and wall-time cost. **Owner decision 2026-10-18: design approved with a revision** ([F031_DESIGN.md](F031_DESIGN.md) `4b7a3ec1a`). Per replayed dsh commit, in its lane's one-shot Workspace: a lane-private index (`GIT_INDEX_FILE` under `.git/lanes/<lane>/`) set to the dsh parent with `git read-tree`, real `git add` / `git rm --cached` of the commit's changed paths, real `git write-tree` (tree ids must equal dsh), then `git commit-tree` with the original author, committer, dates, message and parents (the id must equal dsh; no commit after the seed is signed) and `git update-ref` of the lane's own ref. The lead's end-of-range exec is as designed (merge commits, main, shared index, one explicit `repack -d`). Auto-gc stays off, recorded as a departure from git defaults. A fixed share of one-shot calls runs `git status --porcelain` (agents do), which also checks that fresh mounts keep stat fields stable. Storage cost accepted; `.git` bytes are reported separately by source. Proof on a dev range first, adding stored bytes per index rewrite and `git status` time in a fresh one-shot Workspace.
- **F-032 · deleting a base tree over FUSE costs ~0.7 ms per entry (product,
  builder, item 9 dev range, 2026-10-18).** On dev fork `dev352-p3f`, range 15,
  the clean reinstall's `rm -rf node_modules` made 40,145 unlinks and 6,187
  rmdirs, plus lookup +43,951, readdir +18,014, opendir +12,307 and forget
  +45,966 against the first install. Inferred time is about 31.6 s, since the
  install's own create and write counts are identical (38,155 and 42,483); there
  is no per-op timing. The reinstall exec took 44.7 s against 13.0 s. A native
  `rm -rf` of the same tree takes about a second. Clean installs run only at
  milestones in measured ranges, but agents' `rm -rf` of large trees is
  ordinary work. Owner: the fixer, after item 7, with per-op timing first
  (D0). Not folded into F-027.
  **Owner decision 2026-10-18:** fixed before measured range 15 (moved ahead
  of measured P3; per-op timing first).
- **F-033 · `MAXIMUM_LINEAGE_ROWS` (4,096) refuses history walks with
  `Capacity` (product, liaison research, owner decision 2026-10-18).** The
  constant (`layerfs-history/src/contract/records.rs:24`) bounds three walks,
  each failing `Capacity("lineage work")` past 4,096 rows:
  (a) Commits since a Branch's base Layer, for publish and merge
  (`layerfs-persistence/src/history/ancestry.rs:70, :220`); the replay's
  forecast puts ranges 98, 112 and 129 over it with F-031;
  (b) Layers between two sides (`ancestry.rs:105, :125`,
  `layerstack.rs:389`), which grows with history: a Branch forked more than
  4,096 publishes ago cannot merge;
  (c) a Commit's first-parent depth (`commit.rs:68`), for fork-from-Commit
  (`branch.rs:185`) and Commit start checks.
  Finding 002 (`3f127ee3e`) removed the walks' growth with total history but
  kept the bound; v0.1.7 kept it deliberately (validation H02); it is not in
  the declared limits ([06-limits](../../architecture/06-limits.md)).
  **Owner decision:** none of the three walks may fail `Capacity` on history
  or Commit counts; only resource limits (disk, memory as admitted) remain.
  Answers stay exact (no guessed or negative answer for an unfinished walk),
  and the publication-lane work rule still holds (architecture 83): a fix may
  not move history-sized work into the lane. Tests that assert the 4,096
  refusal (v0.1.7 H02 and any successor) are deleted or replaced by tests of
  the new behaviour. Evidence first: the scale-experiments session
  (`dsh-352-scale-experiments`) confirms each case (a)–(c) with a bounded
  test. **Owner: the fixer, queued after that confirmation**; the lead
  places it in the item order. See
  [crazy_work_load_watch_out.md](crazy_work_load_watch_out.md) S1.
  **Moved out of the fixer's queue (owner, 2026-10-18):** GitHub issue #353,
  worked now in its own worktree session on branch `issue353-lineage-cap`
  (design note first, `core/docs/issues/353/DESIGN.md`); merging into this
  branch is a later owner decision. The before-range-90 gate stays.
- **F-034 · a fresh mount path per mount leaves absolute paths stale (product,
  builder, P3 dev range r016, 2026-10-18).** `sandbox.mount` takes no path, and
  the daemon picks a fresh directory for each mount and never reuses one
  (`layerfs-daemon/src/control/serving.rs:31`). Tools that record absolute paths
  in the tree keep the previous mount's root after a remount. pnpm's
  `node_modules/.bin` shims and workspace state are examples; so would be a Python
  venv, or any config holding `$PWD`. In `dev352-p3h`, r016's install on top of
  r015's committed `node_modules` left untouched shims pointing at `/workspaces/23`,
  a path that no longer exists. Per-tool-call mounting is the expected common case
  (AGENTS), so this affects ordinary agent work. **Owner decision needed:** a stable
  path per Workspace identity (for example, a mount path the caller names, or a
  stable bind such as `/workspace` inside the Sandbox onto the fresh directory),
  or accept it and document it. Until then dev runs count stale roots as their
  own category, and measured P3 does not start with it open.
  **Owner decision 2026-10-18: by design, no product change.** Each mount gets
  a new directory; that is the correct model. Absolute paths a tool records
  in the tree name the mount that ran it, as when a checkout is moved; a tool
  that needs them current is re-run in the new mount. Consequences for the
  replay: (1) stale roots are expected state, not a finding; (2) the oracle
  for an install on top of a previous one replays the same sequence natively
  and substitutes each recorded mount root by exact string (one listed entry
  per root, counted per install, INSTALLS.md), and any other difference stays
  a mismatch; (3) dev runs keep running one affected `.bin` entry, recording
  whether it works, as a fact about the model (not a gate); (4) the merge
  rule for `node_modules` state changed on two sides (watch-out S4) is still
  open. F-034 no longer blocks measured P3.
