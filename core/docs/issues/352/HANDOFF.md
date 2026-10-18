# Handoff prompt — #352

> **Status:** STOPPED by the user, 2026-10-18 (~08:40Z), before measured range 15.
> The open work is listed in the "unfinished tasks" GitHub issue ([#358](https://github.com/Ephemeral-AI-Lab/layerfs/issues/358)) and
> below. Nothing is merged into `main`. Branches: `dsh-history-replay` (replay
> tools and records), `dsh-352-f032-rm-rf` (#356 step 1 accepted; READDIRPLUS
> committed as unbuilt WIP, do not merge). P2 closed at range 14. [PROMPT.md](PROMPT.md)
> points here. Read "State" and "Next" first; the rest is how the run works.

You own LayerFS issue [#352](https://github.com/Ephemeral-AI-Lab/layerfs/issues/352)
(dsh history replay), in `/Users/yifanxu/Ephemeral-AI-Lab/layerfs` on branch
`dsh-history-replay`. You replay deepseek-harness's git history on LayerFS as
multi-agent, multi-Branch work, 202 ranges in phases P1–P5. For each range you
prove main matches git, record what [SPEC.md](SPEC.md) §3 lists, decide the
gates, and fix what they flag. **Keep going until the terminal pass**
([PROMPT.md](PROMPT.md)): no questions, no waiting; decide, record in
RESULTS.md, BUGS.md or OPTIMIZATIONS.md, continue. The only ends are the
terminal pass and a hard BLOCKED comment.

## Authority

You may, without asking: write the tools and docs SPEC names; change any code
(dsh, SDK, core, tools, tests) to fix a finding; commit and push
`dsh-history-replay` and comment on #352; create and remove (by literal name or
path) Docker volumes and containers named `layerfs-issue352-*`, folders under
`~/lfs-history/`, and the image `layerfs-352-runtime`. Never: change the SQLite
page size (4 KiB), run Durable, raise Docker Desktop's disk limit, merge into
`main`, touch Docker resources or folders that are not yours, weaken a gate or
oracle, edit a recorded outcome, relabel measurements across binaries, retry
automatically. [DEFER.md](DEFER.md) lists what is deferred or declined.

## Read first

1. Root `AGENTS.md`, `core/AGENTS.md` (measurement rules, 2-minute test
   ceiling, LOC line per commit).
2. [SPEC.md](SPEC.md) (plan, outputs, gates, fixes, disk),
   [SCRIPTS.md](SCRIPTS.md), [ROLES.md](ROLES.md), [REPORT_FORMAT.md](REPORT_FORMAT.md),
   [REBUILD.md](REBUILD.md) (fix kinds).
3. [LESSONS.md](LESSONS.md), especially S11 (validate gates offline) and S12
   (warm per-crate builds).
4. [RESULTS.md](RESULTS.md) decision log (newest rows near the bottom of the
   table, inserted before "Control-arm reports stay"), [BUGS.md](BUGS.md),
   [OPTIMIZATIONS.md](OPTIMIZATIONS.md), [fixes/](fixes/), [RANGES.md](RANGES.md).

## State (2026-10-18)

**Ranges 0–14 done; P1 and P2 closed.** P2 ran ranges 5–14. Verdicts and reports
are in [RANGES.md](RANGES.md); each range has a committed report and a #352
comment. Range 14's final attempt: attempt 2, watch (checkpoint ok; `diff_commits` 8.04 statements per entry after 014.a1, to watch at ranges 15–16).

**Main line:** run `p2-main-f` (volume `layerfs-issue352-p2-main-f`,
`~/lfs-history/runs/p2-main-f/`, `state.json` next: 15), forked from
`p2-main-e`'s range-13 snapshot with range 14 rerun measured. Earlier lines
(`p1-pilot-b`, `p2-main` … `p2-main-e`) are kept as evidence; recovery always
forks a snapshot (SPEC §7).

**Binaries (measured lane):** daemon `57141b57ac5359b8aee9a0b8d2d946536b0da6b71efd33a14d72cac7e9007aeb` (`core/target/issue352/daemon-57141b57/layerfs-daemon`) and Linux addon `438bae05ad7c25bd0c4e92a3b7d8e2611b66c65089306f6d71e170aea7fc3043` (`core/target/issue352/sdk-linux-438bae05/layerfs.node`), built
from `9815dbc95` (F-020 direct Store, F-026, F-028, 014.a1 memo eviction,
F-025 fix 1). Copies of every binary by id are under `core/target/issue352/`.
P2 baseline: `baseline-57141b57ac53-438bae05ad7c-p2.json` under `~/lfs-history/metrics/`. Image
`layerfs-352-runtime:node24` (`sha256:d3773b4eac6a…`).

**Runner:** every play runs in the container `layerfs-issue352-runner` via
`node dsh/tools/history/runner.mjs -- <run.mjs command>` (no `--network host`;
`LAYERFS_DAEMON_HOST=host.docker.internal`). Store calls run in-process in the
SDK (F-020, Linux only); the daemon serves Workspace calls.

**Calibration:** unit-test calibration for ranges 0–29 is in
`~/lfs-history/plan/tests-NNN.json`.

## Owner decisions of 2026-10-18 (binding)

| Decision | Where |
| --- | --- |
| One route: SDK Store calls in-process, Linux only; daemon serves Workspace calls (F-020) | [DIRECT_STORE.md](DIRECT_STORE.md), root AGENTS.md |
| One global DB, one writer, short holds; concurrent Commits expected to be uncommon | [architecture 83](../../architecture/83-store-concurrency-model.md) |
| Two speed series: gates judge uncontended calls; contended series reported and bounded | SPEC §5, RESULTS "Two-series gates" |
| One Commit per fs write stays (the replay is a load test) | DEFER.md declined; [architecture 85](../../architecture/85-commit-per-write-storage.md) |
| mtime-only change is not a change (F-027 item 2) | [STORAGE_BATCH_SPEC.md](STORAGE_BATCH_SPEC.md) |
| F-027 storage batch, items 1–3 | STORAGE_BATCH_SPEC.md, [STORAGE_STUDY.md](STORAGE_STUDY.md) |
| Real `pnpm install` per Workspace with a read-only pnpm store mount (built: `sandbox.create` volumes) | [INSTALLS.md](INSTALLS.md) |
| Quiet host: nothing compiles, tests or uses Docker while a measured range plays | RESULTS, owner directions row |
| Time-scaling gate: 5 samples, median; load recorded; time-only trip with flat counters is watch unless repeated next range | SPEC §3c/§5 (`a88169557`) |
| Command launcher declined; F-029 and Engine connection reuse as small fixes instead | DEFER.md, proposal §13 |
| Deferrals explicit; check every trigger at each phase close | [DEFER.md](DEFER.md) |
| fs-bench-pro frozen and left broken | root AGENTS.md |
| Migrations delete hard-to-adapt tests, re-cover surviving contracts | root AGENTS.md §4 |
| F-031 revised: from P3, full `dsh.git` clone and one git commit per replayed dsh commit | SPEC §2 "`.git` in Workspaces", BUGS F-031 |
| F-031 design approved with the liaison's revision: lane-private index, real `git add`/`git rm --cached` and `git write-tree`, `git commit-tree` with the original metadata and parents, lane-own ref; lead writes merge commits, main, index and the one explicit repack; auto-gc off as a recorded departure; `git status --porcelain` in a fixed share of one-shot calls; storage cost accepted with `.git` bytes reported separately; proved on a dev range first | BUGS F-031, [F031_DESIGN.md](F031_DESIGN.md) |
| F-031 option (c): lanes run real `git add`/`git commit` of their own changes with private index and ref (new ids); the lead writes main exactly as dsh (HEAD = checkpoint; checkpoint tree id = dsh); frozen plan unchanged | BUGS F-031 |
| `grep_tree` from P3: option (a), tracked files only, as a new labelled series; one labelled whole-tree sample at milestones tracks `fs.grep` throughput | RESULTS, SPEC §5 probes |
| Two-sided `node_modules` merges (watch-out S4): use the product's existing last-writer-wins rule file `/.lww`, holding every dsh `.gitignore` copied recursively (owner, 2026-10-18): the root file's patterns as written, then each nested `.gitignore`'s patterns rewritten with its folder prefix (unanchored `p` → `dir/**/p`, anchored `/p` or `a/p` → `dir/p`, negations kept), shallower folders first so deeper rules win as in git; regenerated whenever any `.gitignore` changes, so paths both sides changed under ignored, regenerated state (`node_modules`, build output) take the newer side instead of conflicting; the merged result then re-runs `pnpm install` in a Workspace, as developers do after `git merge`, checked by the on-top install oracle. `/.lww` is replay infrastructure, excluded from the tree check like `.lfs-probe/`. Counted per merge as its own category; any conflict outside `.gitignore`d paths stays a finding | [crazy_work_load_watch_out.md](crazy_work_load_watch_out.md) S4, `layerfs-content/src/merge/lww.rs` |
| F-032 (`rm -rf` of a base tree) is fixed before measured range 15, per-op timing first | BUGS F-032 |
| F-034: a new directory per mount is the model; no product change | BUGS F-034 |
| F-033: no history walk may fail `Capacity` on history or Commit counts; only resource limits remain; gate: merged before range 90 | BUGS F-033 |

## Crew queues (in order)

Start a fresh builder and a fresh fixer (exactly two subagents, ROLES.md),
pointed at this file and the records.

**Fixer** (playbook D0–D6, SPEC §6; S12 build rule; quiet host):
1. F-025 fix 1 old-vs-new timing table (pending; arms in
   [fixes/007-a2-f025-merge-in-lane.md](fixes/007-a2-f025-merge-in-lane.md)) and
   its recorded-merge replay.
2. F-029: no full `discovery::refresh()` per Sandbox call
   (`sdk/js/native/src/discovery.rs`); proof includes 1 Sandbox × 16 Workspaces
   at 16 concurrent (842 ms traced before).
3. Docker Engine connection reuse for create/inspect
   (`layerfs-sandbox/src/backend/docker/http.rs`); old vs new `exec true` p50/p90
   over 30 calls.
4. F-025 fix 4 (inode reservation pool, designed in F-020).
5. F-027 item 1 (done: merged 74b0bab83; record fixes/014), then F-032 (#356), then
   F-036 (owner decision: fixer, right after F-032; until then reading only, no
   product change; the frozen s4 volume is reached only through the lead;
   measured P3 waits for F-036), then F-043 (runner native memory;
   split file-backed vs anonymous first, recorded in BUGS; then a native heap
   profile; fix real growth only, no cap), then F-042 (#357, exec over committed
   content; RCA after #356's cache change, then fix; target set with the owner) (`rm -rf` over FUSE; per-op timing first; owner:
   before measured range 15), then F-027 items 2 (mtime-only) → 3.
6. (F-033 lineage caps moved to issue #353, session `local_334948d1`, branch
   `issue353-lineage-cap`; merge is an owner decision; the before-range-90 gate stays.)
7. Storage counters from the builder's note (`builder-storage-counters.md` in the
   shared notes).

Limits-audit findings: F-037, F-038, F-041 and S2 risk 1 are deferred as DEFER.md
D-6 (#355, 7fb928f91); the lead checks D-6 triggers at every range close
(merge > 50,000 candidate paths, merge-at-publish lane hold > 500 ms, any
Capacity/ObjectLimitExceeded/Busy from a merge) and reports a trip to the
liaison; `report.mjs check` gets a D-6 block (builder). F-039 and F-040 have no
fix owner until the owner assigns them; they are not in the fixer's queue. The replay works
around them: the generated `/.lww` is written inline with no `%include` (F-039);
Busy/EAGAIN in a range is recorded as F-040, not retried; LWW picks are counted
from the merge result, not the `truncated` flag (F-041).

**Builder:**
1. P3 development checks (`040170cb3`, `a0a159a8d`): clean-reinstall metadata,
   `tsc -b` remount; one dev range with INSTALLS.
2. Sandbox pool from P3: 4 shared Sandboxes, agent aN on pool[(N−1) mod 4]
   (SCRIPTS.md, RESULTS 2026-10-18). P2 played one Sandbox and daemon per
   agent, contrary to SPEC §2. Prove it on the P3 dev range with concurrent
   mounts in one Sandbox.
3. F-031 revised (`.git` from P3). **Design gate (owner, 2026-10-18): F-031 is not built until a short design is approved by the owner.** It must say (1) how lanes commit: which Workspace and Branch runs each `git commit`, and on which Git branch; (2) how a LayerFS merge of two Branches that both changed `.git` treats `.git/index`, `HEAD`, refs, `logs/`, `ORIG_HEAD` and packs written by auto-repack (conflict, rule or rebuild, with no retry or guessed resolution); (3) how dsh's merge commits are reproduced with their original parents (both parents' objects in one `.git`). The design names its proof and its expected Store and wall-time cost. Then build it, with its dev-range measurements (Store growth
   per git commit split into index, loose objects, packs; wall time added).
4. Metrics the P2 close found missing: per-Commit lane hold and uncontended
   `wait.writer` in range metrics (needed for DEFER D-1/D-2's triggers), and
   daemon RSS per daemon (max, median) with a one-time `smaps` breakdown,
   instead of the sum over all Sandboxes (RESULTS P2).
5. Calibrate ranges 30–50 before P4.

**Entry criteria for measured P3 (range 15):** F-025 fix 1 proven; F-029 merged
(shared Sandboxes depend on it); F-027 items 1–3 merged; the 4-Sandbox pool; F-031's design approved by the owner, then implemented and its dev range clean; P3 dev checks pass; then
one P3 re-baseline (`run.mjs rebaseline --phase p3`) on the final binaries, with
`.git` in place. Ranges 15–29 (SPEC §9).

## Open findings

F-025 (fix 1 merged, fix 4 pending; fixes 2–3 deferred D-1/D-2), F-027, F-029
and F-031 are open. F-001, F-005 and F-008 to F-028 are fixed or closed, except
F-002 (full-scan steps, bounded, watch). Watches:
directory share ~0.55, `list_largest` VM steps per entry (bounded residual),
thin-baseline classes. Full list: [BUGS.md](BUGS.md).

## Resources and disk

- Volumes: main lines `layerfs-issue352-p*`, re-baselines `-rb-p2-*`, diagnostics
  `-diag-*` (accepted findings; removable), `-pnpm-store` (read-only installs),
  `-cargo-target` (warm Linux build target, S12), `-rotest`.
- `~/lfs-history/` ~2.7 GB (runs 0.9, checkout 0.9, dsh.git 0.3, snapshots 0.3).
  Host free ~240 GiB at handoff. Never raise Docker's disk limit.
- Other agents' containers (issues 323/337 and others) are not yours.

## Next — exact first commands

```bash
cd /Users/yifanxu/Ephemeral-AI-Lab/layerfs && git fetch origin && git merge --ff-only origin/dsh-history-replay
```

```bash
python3 tools/production_loc.py | tail -1
```

```bash
cat ~/lfs-history/runs/p2-main-f/state.json
```

Then start the fixer on its queue item 1 and the builder on its item 1, and
work toward the P3 entry criteria. Per range afterwards: `runner.mjs -- play
--run <line> --from N --to N --mode measured` (one range per command, quiet
host announced to the crew), `report.mjs check NNN`, lead note, commit
`docs(#352): range NNN <verdict>` with the LOC line, push, `gh issue comment 352
--body-file ~/lfs-history/metrics/comment-NNN.md`.

## Standing rules

- Disposable / WAL / `synchronous=OFF` only; Durable is NOT_RUN.
- One attempt per operation; `rm` only with literal paths.
- Every test ≤120 s (`perl core/target/issue352/t115.pl <s> <cmd>` kills the
  process group); no command or background task over 2 minutes (5 extreme).
- Commit only your own paths; every commit carries `Production LOC: <before> ->
  <after> (delta ±N)` from `tools/production_loc.py` on the parent and staged
  trees, and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- One sample per case; never rerun an unchanged treatment; no warm-cache credit.

## Finish

At P5's end: the final RESULTS.md (latency vs depth, storage curves, history
cost vs tree size, the delta decision, every optimization with its table), push,
summary on #352. Leave the merge into `main` to the owner. Claim nothing that
was not run.
