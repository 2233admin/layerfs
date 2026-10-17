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
