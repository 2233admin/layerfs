# #352 — handoff prompt for the next lead

> **Status:** Current, 2026-10-18. Paste the section below into a new session
> started in `/Users/yifanxu/Ephemeral-AI-Lab/layerfs` on branch
> `dsh-history-replay` (head `bcc168232` when written). Owner decisions dated
> 2026-10-18 are recorded in HANDOFF.md, BUGS.md and DEFER.md; this prompt
> only routes to them.

---

You are the new lead of LayerFS #352, the deepseek-harness (dsh) git-history
replay. The previous lead lane was stopped by the owner on 2026-10-18 at a safe
point, before measured range 15. Builder and fixer are stopped; nothing runs.
You restart the lane from the records, not from memory.

## 1. Read first, in this order

1. Root `AGENTS.md` and `core/AGENTS.md`. Binding: Disposable/WAL/OFF only, 4 KiB
   pages, one attempt per operation (no retry), tests ≤120 s with an explicit
   timeout, no command over 2 minutes, one sample per arm, a production LOC line
   in every commit, fs-bench-pro frozen and untouched, never merge into `main`.
2. GitHub `Ephemeral-AI-Lab/layerfs#358`: the open-work list the stopped lane
   left. It is your starting backlog.
3. `core/docs/issues/352/HANDOFF.md` (owner-decision rows and fixer order),
   `RESULTS.md` (last rows), `BUGS.md` (F-001…F-043), `DEFER.md` (D-1…D-6),
   `INSTALLS.md` §1 and §4 (oracle rows), `REBUILD.md` (fix kinds),
   `crazy_work_load_watch_out.md` (risks before range 15).
4. Fix records in `core/docs/issues/352/fixes/`, especially `014` (F-027 item 1),
   `015-pre-f035` (#354), `015-pre-f042` (#357), and on branch
   `dsh-352-f032-rm-rf` the `016-pre-f036` notes.
5. `STORAGE_BATCH_SPEC.md` (F-027 items 2 and 3) and `F031_DESIGN.md`.

## 2. State at handoff

- **Replay:** main at the range-15 checkpoint. Measured range 15 has **not**
  started and is gated by the owner. Dev volume `layerfs-issue352-dev352-p3p` is
  clean at range 18; `-p3m/-p3n/-p3o/-p3q/-p3r/-p3s` are dirty or abandoned and
  kept for the owner's cleanup decision. Do not delete them.
- **Frozen evidence:** F-036 state (volume `layerfs-issue352-scale-s4`, container
  `layerfs-issue352-scale-s4-b`, `~/lfs-history/scale-experiments/s4/`). Do not
  touch until the F-036 diagnosis releases it.
- **Branch `dsh-352-f032-rm-rf`** (`bf1b45732`): #356 step 1 accepted
  (`2aed07094`); READDIRPLUS (`fb1f8a527`) is unbuilt WIP. Do not merge as is.
- **F-031 option (c)** is built, off by default (`gitplay.mjs`, `gitlanes.mjs`,
  two-command range `halves.mjs`, `a36177716`); its dev proof never completed.
- **Outside your lane, unmerged until the owner calls integration:**
  - #353 + #355 (lineage cap, merge at scale), branch
    `claude/issue353-lineage-cap-ec7c49`, session "#353 remove the 4,096
    lineage cap". Owner decisions: merge build state in a scratch table in the
    global Store, written before the publication lane; two-stage merge (heavy
    merge before the lane, only the H0→H1 change set in the lane, a large change
    set refused with a named error); F-008's tests unchanged.
  - #354 (fs read calls and the Store read path), branch
    `issue354-fs-read-calls`, session "#354 fs read calls". Autocommit reads
    allowed only for immutable objects; snapshot-choosing reads stay in one
    read transaction.
  - Windows and file-overlap checks for #353 and #354 currently go through the
    owner's liaison session. When you start timing, agree one window schedule
    with the liaison; do not measure over another session's timed sample.

## 3. Owner decisions in force (2026-10-18)

- Fixer order: #356, then F-036, then **F-043**, then F-042, then F-027 items 2
  and 3, then the storage counters.
- #356 target: `rm -rf` of the 40,145-file dev tree in about 3 s, flat per
  entry across folder sizes, no slower than creating it, `default_permissions`
  kept.
- F-043 (runner native memory 1.5–1.9 GB): split file-backed vs anonymous
  memory first and record it in BUGS, then a native heap profile; fix real
  growth only, no cap.
- F-042 (#357): RCA first (per-op counts and times) before any fix.
- F-031 option (c); vitest `results.json` normalization and the
  every-`node_modules` clean step from P3 stand (interim yes, not overridden).
- #355 is active in the #353 worktree (DEFER D-6 reopened).

## 4. Open for the owner (do not decide them yourself)

- **Systemic per-operation cost: approved and running.** #356, F-042 and #354
  share one cause: each file operation becomes dozens to thousands of SQL
  statements (about 1,250 per isolated `stat`, about 28 per object fetch, about
  6 per chain step, about 11 per removed entry). The owner approved a
  measurement-only study, GitHub #359, run by its own session on branch
  `issue359-cost-model`. It writes `COST_MODEL.md` with per-operation budgets
  for the owner to approve. Plan further per-symptom fixes against those
  budgets, and ask the owner how #359's results change the fixer order.
- **Storage order (liaison's recommendation, not approved):** F-027 item 2
  (mode and mtime in the inode value) early, before the P3 re-baseline, since
  it also cuts objects per `stat`. Item 3 (inode branches as deltas) after
  #354's read-path fix, and only if it passes the speed-vs-storage rule
  (AGENTS §3.9), because it adds delta chains on the most-read metadata.
- The P3 wall budget per range (a range with `.git` exceeds 2 minutes of wall
  time over its two commands); owners for F-039 and F-040; merge tracing spans
  before measured P3; integration of #353/#355 and #354 into the replay
  (before range 90; the lineage backfill at open grows with history).

## 5. First steps

1. Read §1. Confirm the tree is clean and level with origin, and that nothing
   of the lane is running (`docker ps` filtered to `layerfs-issue352-*`).
2. Post a short state check to the owner: what you read, what you will start,
   and the §4 questions.
3. Start no measurement, fixer or builder until the owner confirms the order.
   Then restart the fixer on #356 from `dsh-352-f032-rm-rf` (Linux build of
   READDIRPLUS and its mount tests first), and the builder on the F-031 (c)
   dev proof (r015 and r016 in halves, per-stage times, the FUSE `git status`
   check).
4. Commit with explicit paths (`git commit -- <paths>`): another session shares
   this checkout's index.
