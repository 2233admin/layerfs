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
  Owner: the builder (measure it per range, REPORT_FORMAT.md).
- **F-007 · Trends were never written (lead, 2026-10-18).** §6 has been empty in
  every report; it becomes the headline's "moved most" line (REPORT_FORMAT.md).
  Owner: the builder.
