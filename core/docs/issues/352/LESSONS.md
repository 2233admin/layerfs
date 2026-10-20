# #352 — Lessons: troubleshooting and speed

> **Status:** Current, 2026-10-19, from P0–P1 up to range 15's terminal attempt
> (P3: git and Node on, a4 `p3-main-d`, the new baseline in
> [BASELINE_R15.md](BASELINE_R15.md)). Kept by the lead; add a lesson when a
> range or a fix teaches one. Rules in HANDOFF.md, ROLES.md and AGENTS.md win
> over anything here.

## 1. Speed

Where the time went so far: a range plays in ~12–16 s (play ~10 s, seal ~3 s,
verify ~1 s); a fix took 50–65 min of fixer time; the first builder tasks took
15–55 min each. **The fixer and the builder are the bottleneck, not the replay.**
In P3 (range 15) measured attempts started ~23 min apart (a3 12:30, a4 12:53 UTC): lanes 128 s, the final
command 98–121 s, then report, check and comment; the time went to the four
attempts and the decisions between them, not to the replay.

| # | Lesson | Evidence |
| --- | --- | --- |
| S1 | **Fix a trip you can already see before rerunning.** If the fixer's own probes show another check over its act band, fix it in the same cycle | Range 2: `diff_commits` (exponent 0.59) would have tripped the rerun; fixing it first saved a whole stop–fix–rerun cycle |
| S2 | **Only what gates the next run is on the critical path.** Give a subagent a minimal, ordered list; defer the rest until real data exists | Overhead cuts, `recover` and the dev-loop command were moved after the pilot, which started about an hour sooner |
| S3 | **Store format changes as early as possible.** Recovery after a format change is a fast rebuild from the plan; it is seconds at range 2 and hours at range 150 | `binding_hint` (range 2): ranges 0–1 rebuilt and oracle-checked in seconds |
| S4 | **Decide placement before code is written.** The fixer states, for each new file, the crate and why (Content owns tree reading/comparison, Storage encoding, Persistence the database, the daemon only adapts) | The diff walk first landed in `layerfs-daemon/src/sdk/changes.rs` and had to move to `layerfs-content::compare` |
| S5 | **Seed the gate after a fix.** Same-binary gates need 3 points; the fixer's old-vs-new probes on the earlier snapshots, run with the new binary, seed them | Without seeds every fix would blind the gates for 3 ranges |
| S6 | **Snapshots only when due after the pilot.** Seal + copy is ~3.2 of ~15 s per range | Pilot stage times, ranges 0–2 |
| S7 | **Run the scout lane during optimize fixes** (ROLES.md §4) and batch up to 3 fixes per catch-up | The runner was idle for every minute of the fixer's work |
| S8 | **Development runs first, one range.** A dev run of range 0–2 found the probe-Branch effect and the base64 portability issue before any measured range | Builder's pre-pilot report |
| S9 | **Counters before time.** Deterministic counters (rows, statements, VM steps) show growth at range 2 while times are still tiny, and need no repeated samples | fork rows 16→23→30, merge statements 2,900→5,792 |
| S10 | **Rebuilds: keep the old daemon by id.** The old binary is needed for old-vs-new tables; copy it to `core/target/issue352/daemon-<id>/` before rebuilding | The fixer kept `daemon-0ef24121/` and could measure old against new |
| S11 | **Validate gates and probes offline before a measured run.** Dry-run gates.mjs over recorded metrics (seconds, no replay) and check every probe's input is fixed (SPEC §3c; the input size is recorded and a changed input is refused) before any re-baseline | Three re-baselines on daemons `71001f65`/`361bb09e` tripped on tooling: per-entry normalisation (F-012/F-013), a fixed cost spread over entries (F-013), a drifting probe input (F-014) |
| S12 | **Build only what changed, warm.** Iterate with `-p <crate>` (and `--test <name>`) in the long-lived checkout's warm target. In Linux, use a named Docker volume for `CARGO_TARGET_DIR` (no macOS bind mount). Never use `--workspace --all-targets` mid-fix (it pulls in fs-bench-pro, frozen, and every test/bench). A fresh worktree gets its target cloned (`cp -c`) from the main checkout. A whole-workspace Linux check runs once, before acceptance, at most 5 min | F-020: the Linux `cargo build --workspace --all-targets` took 15 m 25 s, cold target in a new worktree on a bind mount, `-j 4`, and included fs-bench-pro repair. Warm `-p` builds in the same fix took 10–90 s |
| S13 | **Dev slices before every measured P3 attempt.** Play one range on a `--label dev` fork (`f031-r1-slice-*`), fix what it shows, play the next slice. Each slice cost minutes; each measured attempt about 25 min with its report | Range 15 slices: d stop 1 (mount-path refresh cost); e js-yaml / empty folders (`r015-1-docs-rfc.mid`, PRUNE_EMPTY `55b584ec2d`); f devcheck reinstall shim (`cb3e20eb7e`); g racy git index (`--renormalize`, `153a1f6e30`); h F-056; i the zsh word-split bug; k confirmed lister v6; l confirmed the clean relink (Reinstall growth 62.8× on 11 packages, the link-unit question) |
| S14 | **Prove only at quiet points.** A proof that runs while a lane still writes compares a moving tree. End-only test points (one per lane end, plus the lead) cost fewer proofs and cannot race | a2 (`p3-main-b`) stopped on a lane point that raced a later write; `pointsBefore` (`1aea36058f`) holds a lane's later steps, then the owner chose end-only points (`b966ddb720`). a4: 5 points, 20 pass |
| S15 | **Split long stages under the 2-minute rule; declare any exception up front.** Lanes are cut into commands under 118 s (`--to` cut points); only range 15's final command got a declared 295 s alarm, and its expected time was stated before the run | a4 lanes: cuts at 20 and 41.1, played 128 s. Final command projected 100–120 s, measured 98 s (a3) and 121 s (a4) |
| S16 | **Ask for the decision before changing a gate, an oracle or the workload.** A stop that needs a different comparison or workload goes to the owner with options and their cost; one attempt later the decision is settled, not argued in a report | Lister v6 and end-only points (owner "proceed", after a2); the clean relink (owner's words recorded in NODE_RULE §4, after a3). Each decision cost one message and saved an attempt |
| S17 | **Measure what a decision costs, against the attempt before it.** Put the before/after table in the report the moment the decision lands | Clean relink vs a3's incremental repair: exec 26.1 s vs 1.57 s, Commit 11.8 s vs 58 ms, new stored 646,831 vs 22,038 B, final command 121 s vs 98 s (range-015 lead's note) |
| S18 | **A ratio on a millisecond is not a regression.** Judge time by its ratio and its absolute extra per call: under 5 ms extra, do not hold, optimize or escalate (owner 2026-10-20, `THRESHOLDS.absoluteFloorMs`) | Ranges 18–20: sub-ms probes and fs.write classes read 1.2–1.3× on 1–6 ms calls while the one real slowdown, `diff_commits`, went 6.4 s → 73 s per verify |

## 2. Lead bookkeeping

- **Commit order per checkpoint:** `git add` the new report (it is untracked),
  `git commit -- <paths>`, `git push`, check the push, **then**
  `gh issue comment 352 --body-file …`. A `git commit -- <untracked path>`
  fails with "pathspec did not match"; the first three comments went out before
  their reports (RESULTS.md, process slip).
- **One commit per range, in order.** When several ranges finish in one runner
  pass, `report.mjs` has already written all rows into `RANGES.md`; commit each
  range with `RANGES.md` cut to its own row, then the next.
- `git push`, `gh` and Docker need the sandbox disabled.
- Record every decision in RESULTS.md's decision log the moment it is made.
- **Run `report.mjs check NNN` before every checkpoint commit** (format rule
  F1–F8, SPEC §3). The generated Finding block carries the before/after table;
  the lead writes the "Lead's note" (never empty unless pass). Range 002's first
  commit had an empty §7 and no table; the rule exists because of it.
- To amend an earlier report (lead annotations only, never recorded values),
  commit it on its own before checking the next range: F2 compares earlier
  reports with HEAD.
- **One issue comment per attempt that has a report**, rendered from the
  attempt's stored gates and finding (`report.mjs`), in attempt order. Before
  saying an attempt has no report, check `~/lfs-history/metrics/range-NNN.aK.json`
  and the report's Attempts table: range 15's a1 and a2 had both and were
  wrongly called report-less; their comments went out late, and rendering a3
  the same way reproduced its comment byte for byte.
- **Record an owner decision verbatim** (RESULTS decision log, the rule file it
  changes, the report's lead's note) and name who relayed it ("liaison under
  owner delegation 2026-10-19").

## 3. Troubleshooting

### Runner exit codes (`run.mjs play`)

| Code | Meaning | First move |
| --- | --- | --- |
| 0 | phase range done (pass or watch) | commit, comment, next |
| 1 | error (tooling) | read `~/lfs-history/runs/<run>/play.log`; a builder task |
| 2 | usage | check `--from` equals the run's next range |
| 3 | optimize | commit, comment "diagnosis pending", hand to the fixer |
| 4 | stop (gate, step differs from plan, failed checkpoint); the run is marked dirty | same; recover only by forking a snapshot |
| 5 | guard: disk, binary mismatch, missing calibration | disk: remove own obsolete data by literal path; binary: the run pins the daemon id it was made with; calibration: `calibrate-tests.mjs --from/--to` |

### Where to look

| Need | Command / place |
| --- | --- |
| A range's raw outputs | `~/lfs-history/metrics/range-NNN.aK.json` |
| Per-call trace (SQL work, FUSE opcodes, delta, phases) | `~/lfs-history/runs/<run>/trace/` |
| Files at a checkpoint | `inspect.mjs ls|cat --store <store.json> rN [path]` |
| Tree vs git | `inspect.mjs diff --store … --repo ~/lfs-history/dsh.git --plan ~/lfs-history/plan N` |
| Store figures (pages per table, objects, depth histograms) | `inspect.mjs stats` on a fork, never the live Store or snapshot blocks |
| A fork to experiment on | `run.mjs fork` / `snapshot.mjs fork` into a `layerfs-issue352-diag-*` volume |
| What was created | `~/lfs-history/ledger/ledger.jsonl` and `runs/<run>/ledger.jsonl`; `run.mjs cleanup --run <run>` removes by ledger |

### Known traps

| Trap | What happens | Handling |
| --- | --- | --- |
| Old-format Store | Daemon `511dceed…` and later refuse Stores without `binding_hint` | Fork only snapshots of the current format; otherwise fast-rebuild from the plan |
| A rerun's snapshot name | "a snapshot is never replaced" when a second line snaps a range | Manifests are per run: `range-NNN.<run>.json` |
| Probe and lane Branches accumulate (~7 per range; the SDK cannot delete a Branch) | Anything that scans all Branches grows with ranges | Lookups by name use the index (fixed in range 2); read Branch-count effects as findings, not noise |
| Mixed binaries in a trend | Exponents fitted across a fix are meaningless | Gates use same-daemon points only; "insufficient same-binary points" is a watch, not a pass |
| Whole-tree probes | grep/glob over the tree grow with tree size, which is allowed | Gates fit them per tree byte (`SCOPED`); a per-byte rise with depth still trips |
| fs request size | One fs request carries at most 65,519 bytes | Files over 60,000 bytes, executables, symlinks and modes go through a Sandbox `apply` step; F-001 open |
| Full-scan SQL steps (F-002) | 58 at mount bind, 242 per one-shot Commit, 668 per merge | Bounded (signature ring ≤ 8,192 rows), flat with depth; not a gate finding yet |
| Linux crate builds in Docker | No network for crates | Mount the host's `~/.cargo/registry` read-only into the build container |
| Host toolchain | Default Rust fails Clippy in untouched crates | `cargo +1.85.1` |
| Pre-existing Linux test failures | `mounted_commit` r5_8 and r5_5_install_survival, `kernel_mutation` unmount Busy, huge-namespace and `host_handoff` preconditions | Not caused by #352; do not count them as regressions, do not "fix" them inside a finding |
| SDK service Sandbox left open | It holds the run's volume in use | Close every Sandbox a script starts; containers are named `layerfs-issue352-<run>-<n>` |
| `report.mjs` rewrites earlier reports (F-004) | After a gate change, `play` regenerated `range-000.md`/`range-001.md` with new check rows | Before committing, `git diff` every report other than the range just played; restore any change (`git checkout -- <path>`); never commit a rewritten recorded outcome |
| Range 0 | A yarn project: no offline install, all 27 test candidates skipped | Expected; tests start at range 1 |
| Evidence of an unaccepted result cleaned up (F-017, 2026-10-18) | The fixer ran `run.mjs cleanup` on the old-vs-new diag runs before the lead accepted the result. The traces needed to attribute a p95 regression were gone, and the analysis cost a second pair of plays | Never clean up evidence of a result that has not been accepted: keep the diag run folders (traces, metrics, CPU samples) until the lead accepts, then clean up |
| A traced call reads SQL counters (F-018) | Before daemon `c25119ac`, reading a session's counters queued for the writer's admission, so every traced call waited for any Commit holding the publication lane. The replay always traces, so its latencies carried this wait | Fixed: counters are read under the state lock alone. Per-call SQL counters are still process-wide deltas: under concurrency they include other calls' work |
| The native oracle differs from LayerFS's environment | A proof stops on a difference the product did not make: the oracle ran at another path, from other roots, or with another command string | The native replay copies LayerFS's *environment* (mount path, lane roots, the exact recorded command, empty-folder pruning), never its internals. a1: no seq oracle without PRUNE_EMPTY (`e373fd3acb`); rb-p3 `-c`: oracle command string (`1249112f90`); a2: the repair lister did not know the lane roots; the mount-path refresh cost is only fair against native at a moved path |
| Comparing pnpm bookkeeping | `.modules.yaml`, `.pnpm/lock.yaml` and `.pnpm-workspace-state*.json` record paths and times; they differ even when the installed packages are equal | Compare installed results (lister v6, NODE_RULE §6): package files by blob id, links by realpath, shims by target, the `pnpm ls` set; state files counted only (a2 → `b966ddb720`) |
| Lane ordering race | A point's proof read a tree a later step of the same lane was already writing | `pointsBefore` holds later steps until the point settles; points are end-only (a2, `1aea36058f`) |
| Stale git index entries | A file rewritten within the index's mtime granularity stays "clean" in `git status` with the old blob (racy git), so the lane commit misses it | Run `git add --renormalize` in the lane's add step (slice g, `153a1f6e30`) |
| Empty folders taken for packages | dsh history leaves empty package folders that git does not track; tsdown and the workspace glob treat them as packages and the build differs from native | Prune empty directories in both replays, PRUNE_EMPTY (slice e: js-yaml, `r015-1-docs-rfc.mid`, `55b584ec2d`) |
| First install against no lockfile | The first range-2 install had no earlier installed tree; the growth comparison divided by ~0 (935479×) | Judge a first install as a first install (rb-p3 `-b`, `6b65d86e6f`); keep the dirty run as evidence |
| Link-unit denominators | Reinstall growth divides stored bytes by the raw bytes of changed packages; a link-only or tiny install has almost none, so the ratio is huge while the bytes are small | Read the absolute bytes; r003 12.51×, r004 266.97× (rb-p3 `-d`), slice l 62.8× on 11 packages. The gate-unit question (option (b), absolute bytes) is the owner's, not the lead's |
| Incremental repair after a newest-wins merge (F-057) | The merge keeps the newest pnpm state file, so a frozen install on top keeps stale hoisting (a3: `@cordisjs/plugin-loader` → `vendor/loader`) | Repair is a clean relink, LayerFS and native (`4b725d5229`); F-057 stays open for the product fix |
| Docker tag drift after a restart | After the 2026-10-19 reboot, `docker image inspect layerfs-352-runtime:node24` sometimes fails although the image is present | Re-tag by id before each command: `docker tag sha256:d3773b4e… layerfs-352-runtime:node24` (same image, the run pins the id) |
| Another agent's disk cleanup deletes volumes | A Codex agent's cleanup (aiming for 500 GB free) deleted Docker volumes it thought unused, including `layerfs-issue359-prep` | Before every run, `docker volume inspect` every volume the run needs (pnpm store, the run's and snapshot's volumes); a missing one is a guard, not a rerun. Record each needed volume in the run ledger |
| The lead's own session drops (ECONNRESET) | The lead's API connection dropped 7 times on 2026-10-19; the turn restarts without knowing whether its last command finished | After a restart, read the runner state first (`play.log`, the run ledger, `metrics/range-NNN.aK.json`, `git log`) and continue from it. Never replay a step or post a comment blind; one attempt stays one attempt |
| Shell quoting in helper commands | zsh does not word-split an unquoted `$args`, so slice i played its whole range in one command; a sed put `${ALARM}` inside single quotes, so three commands ran without an alarm | Write run helpers as bash scripts (`play.sh`) with arrays; test a new alarm with a 2 s alarm before relying on it |

### Diagnosis shortcuts (SPEC §6)

- Start from the counter the gate named; read its per-call SQL work
  (`writer`/`readers`), then the phase tree. Exponents near 0 are fine; ~0.5–1
  means the code walks something that grows.
- Separate tree size from depth with the same tree at two depths (a fresh Init
  of the checkpoint tree against the replayed Store).
- Write the regression test as "counter equal at two sizes" (10 vs 1,000
  Branches, depth 4 vs 60, 1 vs 600 projects).
- Measure old vs new on the same snapshots with a fresh daemon per case, one
  sample each; label every series with its binary.

## 4. Ranges 31–35 (the ranges 31–50 session, 2026-10-20)

| # | Lesson | Evidence |
| --- | --- | --- |
| R1 | **A session's run owns all it writes.** Fork with `--pnpm-store` and `--native-states` and use copies of the plan and oracle; the fork copies its chain's native-state tars. Nothing then depends on, or is changed under, another session's run | `p3-main-u` from r31 (`fe258e3843`); the r31–50 lockfile fetch went into the shared store once and was then copied |
| R2 | **Pin the SDK JS by folder when main moves.** A rebase that changes `sdk/js/src` changes the run's pinned digest. Keep a copy of the base commit's `sdk/js` in `core/target/` and point the run at it (`sdkJsPins`) | fix 056 (`6ee064ce91`) changed `sdk/js`; the run kept `e990c25c` from r33 |
| R3 | **Count LOC on origin/main's tree, after the rebase.** A docs commit's LOC line counted before the rebase names the old total | e5889c5ee9 recorded 104,629; main was 104,847 (fix 056), then 104,900 (fix 057) |
| R4 | **The first test-calibration command after the checkout moves is slow.** It moves the working tree and installs; keep it to about 15 files. An alarmed command leaves its container running, so remove it before the next | r31 and r33: 40–45 files hit the 115 s alarm; the next command then failed on the container name (exit 125) |
| R5 | **Lane trees are hybrids.** A lane applies only its own areas, so a root lane's `tsconfig.json` can reference packages other lanes add, and vitest cannot load natively or in LayerFS. P5 is then n/a at that point; the repair's tests still run on the merged checkpoint | r034-1-root.end and r034-2-packages-client.end ("Failed to load tsconfig") |
| R6 | **Read a thin class's ratio before calling it a regression.** The Speed row names the class with too few baseline calls; its ratio is the p95, the largest call | `sandbox.commit` "—": p95 = the repair's build Commit (778–925 ms) against pilot-sized 69 ms calls |
| R7 | **A gitignored test output is not a product difference.** Git cannot represent an ignored file, so the checkpoint check asks the checkpoint's own `.gitignore` files (`git check-ignore`) and records what it exempted (`checks.tree.gitIgnored`) | r038 a1 (fix 058); exempted `.sessions/session-query.db` at r38 and r40 |
| R8 | **A checkpoint stop needs a new attempt; plan its fork.** The run is dirty after it, so re-judging does not apply. Fork the last snapshot and set the fork's chain to the native state the stopped attempt started from | r038 a2 on `p3-main-v` (r037 snapshot, chain set to r37's native state); the later attempt's note goes after the earlier one's |
