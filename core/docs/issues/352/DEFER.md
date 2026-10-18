# #352 — Deferred and declined work

> **Status:** Current, owner direction 2026-10-18. The one list of work that
> is known, specified or proposed, and **not** being done now. A deferred item
> is not in any queue: nobody works on it until its reopen trigger is
> **measured** and recorded in RESULTS.md, and then it is queued like a new
> finding. A declined item does not come back without a new owner decision.
> Add an entry whenever work is deferred or declined; never delete one: when
> an item is reopened or done, mark it and link where.

## Rules

1. **Deferred ≠ forgotten.** Each entry names the trigger that reopens it. The
   lead checks the triggers at each phase close (P2, P3, …) and records the
   check in RESULTS.md, even when nothing reopens.
2. **Who reopens.** Where the entry says "lead", the lead may reopen it on a
   measured trigger and tells the owner's liaison. Where it says "owner", only
   the owner reopens it.
3. **A trigger is a measurement,** from the replay's receipts or a recorded
   diagnostic, never an estimate. Name the range, the series and the value.
4. **No partial work on deferred items.** Do not fold a deferred item into
   another fix to get it done unasked.

## Deferred

| Id | Item | Deferred | Why | Reopen when (measured) | Who reopens | Specified in |
| --- | --- | --- | --- | --- | --- | --- |
| D-1 | **F-025 fix 2 · narrower publication lane:** validation before the lane against the base it publishes over (head check repeated inside); logical count and bindings out of the lane for unmerged Commits | owner, 2026-10-18 | Mainly speeds up Commits that wait for the lane; concurrent Commits are uncommon in real use (one global DB, short holds; [architecture 83](../../architecture/83-store-concurrency-model.md)); the replay's no-delay play exaggerates contention. Bound: unmerged lane hold ~5 → ~1 ms | After F-025 fix 1 lands: the **uncontended** `fs.write`/`fs.rm`/one-shot Commit series trips a speed gate, or the uncontended lane hold per Commit grows with history, tree size or Branch count | lead | [fixes/007-a2-f025-merge-in-lane.md](fixes/007-a2-f025-merge-in-lane.md) Fix 2 |
| D-2 | **F-025 fix 3 · Save's read-only lookups off the writer queue:** ring reads, base locates and object reads on a read session (F-018 pattern); writes stay on the writer | owner, 2026-10-18 | Only helps a Commit that overlaps another; F-018 already moved the important reads off the writer | After fix 1: uncontended Save time includes writer-queue wait, or the contended series' Save phase grows with contention range over range | lead | same record, Fix 3 |
| D-3 | **Shared 16 KiB zstd dictionary for metadata groups** | owner, 2026-10-18 (not in the F-027 batch) | −3.5% after F-027 items 1–3 (simulated); kind 2 (a format addition) | After F-027 and the post-F-027 recalibration (STORAGE_STUDY), metadata is still > 30% of the Store, or the range-201 forecast misses the design target by > 20% | owner | [STORAGE_STUDY.md](STORAGE_STUDY.md) §6 item 4 |
| D-4 | **Storage items each below 10%:** metadata or whole-file zstd level 19, merging a Save's three packs, F-005 chunk compaction, shorter `object_location` key, compact Commit row, inode-leaf delta cap 16, whole-file delta budget | owner, 2026-10-18 | Each saves < 10% (0.4–4%); several cost speed | The post-F-027 recalibration shows one of them ≥ 10% of the Store on its own | owner | STORAGE_STUDY §6, [STORAGE_BATCH_SPEC.md](STORAGE_BATCH_SPEC.md) §10 |
| D-5 | **Editor-style save recognition:** a file written as a new temp file and renamed over the old one gets no chunk recognition against the replaced file, so Commit hashes and re-chunks the whole file (storage still deduplicates chunks by id) | owner, 2026-10-18 (measure only) | The program already wrote the whole file; Commit cost matches its work; not a localized-edit violation | A measurement (after measured P3 starts) shows such a Commit costing more than ~1× the program's own write of that file, or chunks stored twice | owner | [architecture 85](../../architecture/85-commit-per-write-storage.md); liaison note 2026-10-18 |
| D-6 | **Reopened by the owner 2026-10-18:** implemented in the #353 worktree (`claude/issue353-lineage-cap-ec7c49`) after #353, as separate commits, both held unmerged until the owner calls integration. **Merge at scale (GitHub #355):** remove the merge path cap (F-037, A2) and the merge build budget (F-038, A3), merge at publish from the smaller side (watch-out S2 risk 1), and a truthful `truncated` flag (F-041) | owner, 2026-10-18 | #353 (lineage cap) goes first; no replay merge has come near the caps yet (largest recorded: 108 changed files at r014) | #353 merged; or measured: a merge with > 50,000 candidate paths, a lane hold from merge at publish > 500 ms, or any `Capacity` / `ObjectLimitExceeded` / `Busy` from a merge | owner | [#355](https://github.com/Ephemeral-AI-Lab/layerfs/issues/355); BUGS F-037, F-038, F-041 |

## Declined (not coming back without a new owner decision)

| Item | Declined | Decision instead | Record |
| --- | --- | --- | --- |
| One Commit per tool-call step in the replay (batch a step's file writes into one `fs.apply`) | owner, 2026-10-18 | One Commit per file write stays: the replay is a load test | STORAGE_STUDY §6 note; RESULTS.md `1a6924767` |
| Long-lived command launcher per Sandbox | owner, 2026-10-18 (approval withdrawn the same day, before any code) | One Docker exec per call; F-029 and Docker Engine connection reuse as small fixes | [proposal §13](../../architecture/proposal/sandbox-command-launcher.md); RESULTS.md `90fd8741d` |
| Sharding, a second database, concurrent writers, objects outside the Store | owner, 2026-10-18 (and 2026-10-13) | One global SQLite Store, one writer, short holds | [architecture 83](../../architecture/83-store-concurrency-model.md), [84](../../architecture/84-global-sqlite-store.md) |
| Durable Store profile | owner, 2026-10-07 | Disposable / WAL / synchronous=OFF only | root AGENTS.md |
| A daemon route for SDK Store calls | owner, 2026-10-18 | In-process Store calls, Linux only (F-020) | [DIRECT_STORE.md](DIRECT_STORE.md) |
| Maintaining fs-bench-pro | owner, 2026-10-18 | Frozen and left broken | root AGENTS.md; `core/benchmark/fs-bench-pro/AGENTS.md` |
