# #352 — handoff prompt: systemic and storage optimization (#359, #360)

> **Status:** Current, 2026-10-18. Paste the section below into a new session
> with its own worktree cut from `dsh-history-replay`. It covers two GitHub
> issues: #359 (systemic per-operation cost) and #360 (storage: F-027 items 2
> and 3). The replay lead lane is stopped; its prompt is
> [NEXT_LEAD_PROMPT.md](NEXT_LEAD_PROMPT.md). A first #359 session was stopped
> by the owner before doing any work; it left no commits or Docker resources.

---

You own LayerFS optimization work for #352, in two issues. Read both first:
`gh issue view 359` and `gh issue view 360`.

## 1. Why

The #352 replay found many slow commands. They share one cause: a file
operation turns into dozens to thousands of small Store reads.

| Measured (one sample each) | Value |
| --- | --- |
| `rm -rf` of the 40k-file dev tree | 15.3 s vs 0.36 s native |
| `vitest run`, first `pnpm install`, `tsc -b` | 3.7×, 3.2×, 1.5× native |
| One `stat` in a fresh Workspace | ~1,250 statements, ~1.3 MB read |
| One object fetch, one chain step | ~28 statements, ~6 statements |
| Whole-tree `fs.grep` | 9.3 s; 1.2 GB of packs read for 427 MB |

Storage overhead has the same shape. A file's 16-byte mode and mtime are stored
as four objects, so a `stat` walks all four, and each walk pays that per-object
read cost. Storage work and read-cost work therefore meet in the same
code.

## 2. Read first

1. Root `AGENTS.md` and `core/AGENTS.md`.
2. `docs/general/agent-measurement-policy.md`, `docs/general/benchmark_rules.md`
   and `benchmark_agent_report.md`.
3. In `core/docs/issues/352/`:
   - `STORAGE_BATCH_SPEC.md` and `STORAGE_STUDY.md`;
   - `REBUILD.md`;
   - `BUGS.md` F-027, F-032, F-035, F-042 and F-043;
   - `fixes/011-study-f027-storage-batch.md`, `014-f027-item1-sized-pack-directories.md`,
     `015-pre-f035-fs-read-calls.md` and `015-pre-f042-exec-base-reads.md`;
   - `NEXT_LEAD_PROMPT.md` §3–4.
4. The architecture notes 83 (Store concurrency) and 84 (global SQLite Store).

## 3. Order

1. **#359, measure (no product code).**
   - Build the cost table described in the issue: commands, cold and steady arms, counters per operation, and scaling probes.
   - Missing counters or spans go in their own declared commit.
   - Write `core/docs/issues/352/COST_MODEL.md`: the ranked table, shared causes with evidence, proposed budgets per operation, and a fix plan mapped onto #354, #356 and #357.
   - **Stop here and send the budgets to the owner for approval.** No fix starts before they're approved.
2. **#360 item 2: mode and mtime inside the inode, and an mtime-only change is not a change** (`STORAGE_BATCH_SPEC.md` §4, including §4.8).
   - Report storage by role, and statements per `stat`, old vs new.
   - Prove the format boundary (§4 proofs) and that nothing is lost (§6).
   - Item 2 can start while the owner reviews the #359 budgets, because it is already approved.
3. **#360 storage counters** from the builder's note (`builder-storage-counters.md` in the #352 shared notes; ask the owner's liaison if you can't find it).
4. **Systemic fixes** against the approved budgets, in the order the owner sets from `COST_MODEL.md`.
   - #354 already owns the Store read path. Its session's results are input here, not duplicated.
   - Agree file ownership with the liaison before touching its files.
5. **#360 item 3: inode branches as deltas, gated.**
   - Only after the read-path fix and a #359 baseline.
   - Accept only if the lookup-cost bound in spec §5 holds and the speed-vs-storage rule (AGENTS §3.9) passes. Report raw deltas either way.

## 4. Where and with whom

- **Your branch:** your own worktree branch, cut from `dsh-history-replay`. Push your branch only. Never merge into `main`. Merging into `dsh-history-replay` is the owner's decision.
- **Data:**
  - Use dev volume `layerfs-issue352-dev352-p3p` (clean at range 18) or a copy of it, and a copy of the range-14 Store.
  - Never touch the frozen F-036 state (volume `layerfs-issue352-scale-s4`, container `layerfs-issue352-scale-s4-b`) or the other dev volumes.
  - Name new Docker resources `layerfs-issue359-*` or `layerfs-issue360-*`, and use image `layerfs-352-runtime`.
- **Other sessions on the host:**
  - #353/#355 on `claude/issue353-lineage-cap-ec7c49` own the merge module, `commit_merge.rs`, `commit.rs`, `sdk/branch.rs` and `storage/merge_records.rs`.
  - #354 on `issue354-fs-read-calls` owns the Store read path and the SDK read calls.
- **Windows:** builds and correctness tests need no window. Every timed sample needs a quiet window from the owner's liaison session: say what it is and how long it takes, and report when you're done.

## 5. Rules

- One sample per arm.
- Each case in its own command, under 2 minutes; tests at most 120 s, built with `--no-run` first.
- Disposable/WAL/OFF only, 4 KiB pages, `LAYERFS_CONSTRUCTION_WORKERS=1` for Commit cases.
- No retries, no fsync, no new dependency.
- Caches bounded and declared, with no cache credit across measured phases (AGENTS §1).
- Results byte-identical. Kind 1 only: old Stores read unchanged, with no migration. Any Store format change beyond the approved items is an owner decision, with its storage cost.
- fs-bench-pro stays untouched.
- Every commit carries a Production LOC line from `tools/production_loc.py --root` on the parent tree.
- Tests that are tricky to adapt are deleted, not nursed, and listed in the commit.

## 6. Report

At each stop point (after #359's table, and after each item or fix), report to the owner's liaison:
- commits;
- the cases run and not run;
- old vs new tables;
- gaps.

Also comment a summary on the issue.
