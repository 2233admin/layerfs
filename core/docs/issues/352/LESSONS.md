# #352 — Lessons: troubleshooting and speed

> **Status:** Current, 2026-10-18, from P0–P1 up to range 2's fix. Kept by the
> lead; add a lesson when a range or a fix teaches one. Rules in HANDOFF.md,
> ROLES.md and AGENTS.md win over anything here.

## 1. Speed

Where the time went so far: a range plays in ~12–16 s (play ~10 s, seal ~3 s,
verify ~1 s); a fix took 50–65 min of fixer time; the first builder tasks took
15–55 min each. **The fixer and the builder are the bottleneck, not the replay.**

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
