# #352 — dsh history replay: SPEC

> **Status:** Current plan, 2026-10-17. The numbers come from dsh's git history.
> They stay estimates until the pilot (phase 1) measures them. Improve this file
> where the work shows it is wrong, in the same commit as the change.

Issue: [#352](https://github.com/Ephemeral-AI-Lab/layerfs/issues/352).

The experiment replays deepseek-harness's git history on LayerFS as multi-branch,
multi-agent development. It has three goals:

1. prove that main matches git at every checkpoint;
2. measure storage and latency as the file system and the history grow;
3. optimize for speed and compression, and fix every operation that slows down
   for a reason it should not.

It builds on the dsh plugin and its demos (#345, #346, #347).

## 1. Source facts

The source is the repository at `/Users/yifanxu/Ephemeral-AI-Lab/deepseek-harness`.
Read it only, through a separate clone; its `.git` holds stray tmp packs.

| Fact | Value |
| --- | --- |
| Commits | 22,395 (8,645 merges) |
| Mainline (first-parent) commits | 2,188 |
| Files at HEAD | 16,297 |
| Git pack | 303 MiB |
| Last 2,000 mainline steps | ~70 files, +1,889 / −613 lines each |
| Dates | 2026-06-10 to 2026-10-17 |

## 2. Plan shape

| Unit | Estimate |
| --- | --- |
| Ranges | ~230, each 30–100 dsh commits (target 60), ending at a mainline commit |
| Lanes per range | 2–4 LayerFS Branches, each grouping side branches by repository area |
| Agents | 5–10 plus a lead; always more agents than lanes, several per lane |
| Sandboxes | 4–8, long-lived; each holds many Workspaces |
| Workspaces per range | ~50–100, at least 70% one-shot (mount → exec → commit → unmount) |
| fs : Sandbox file mutations | 9 : 1 |
| LayerFS Commits | 150k–300k in total, one per fs mutation, Sandbox Commit, merge and publish |
| Bash calls | ~30k–40k: one per dsh commit's fs batch, one per one-shot Workspace |

`node_modules` is installed, because LayerFS stores ignored files. Installs run in
a Sandbox at each range that changes `package.json` or `pnpm-lock.yaml`, plus at
range 1.

### The two nested cycles

**Outer cycle (one per range, ends at a checkpoint):**

1. *Prepare.* Load range k's plan and oracle. Run the disk guard (§7). Check the
   binary against the run's manifest.
2. *Run the inner cycle* on every lane, agents in parallel.
3. *Consolidate.* The lead merges the lanes into main and publishes.
4. *Verify the checkpoint:*
   - tracked files match git (path, mode, SHA-256);
   - history matches the plan;
   - every planned conflict happened and was resolved;
   - ignored output exists;
   - the range's tests pass.
5. *Write the range outputs* (§3) and *evaluate the gates* (§5).
6. *Seal and snapshot.* Every range during the pilot, then every 5 ranges. Keep
   milestones.

**Inner cycle (one per step):**

1. *Implement.* One agent's bash call. It is either a batch of fs writes for one
   dsh commit (each write its own LayerFS Commit) or one one-shot Workspace.
2. *Verify the step.* Every call's outcome (Committed, Conflict, UpToDate,
   Merged) must match the plan.
3. *On a mismatch:* stop and keep the run. Diagnose, fix, classify the fix, and
   recover (§6).

### Agents and conflicts

Agents write file *content*, named by git blob id. They never apply patches. The
plan fabricates four kinds of conflict, each ordered by barriers and never by
pauses (the 5 agents demo lost its Conflict to pacing):

| Kind | Arrangement | Expected |
| --- | --- | --- |
| Same-lane Commit Conflict | B mounts, A commits the same file, B commits | B gets Conflict, remounts, rewrites, commits |
| Stale-Workspace clean merge | B mounts, A commits a *different* file, B commits | B merges cleanly |
| Decoy edit | Two agents edit one file; one edit is reverted before the checkpoint | The final tree still matches git |
| Merge/publish race | A lane publishes while the lead merges another lane | One wins; the other merges again |

### Scripts and players

One plan feeds two players.

```
dsh/tools/history/
  plan.mjs      read the dsh clone; write ranges, lanes, agents, steps and planned
                conflicts from a fixed seed
  oracle.mjs    each checkpoint: path, mode, SHA-256; history shape; expected conflicts
  run.mjs       headless player: measured mode, and fast-rebuild mode (no timing,
                Sandbox tests or agents)
  gates.mjs     the range outputs (§3) and the gate decision (§5)
  scenario.mjs  turn a window of ranges into a dsh scenario
dsh/scenarios/dsh-history/
  scenario.json the Live demo: a window of ~3 ranges seeded from a milestone snapshot
  run/          final.json like Crew's, small enough to commit
~/lfs-history/  outside the repository
  plan/ oracle/ all ranges (too large for git)
  snapshots/    sealed Store copies with manifests
  metrics/      one line per call, one summary per range
```

- The headless player extends `run-scenario.mjs` and `scenarios/shared/replay.mjs`.
  It has no model loop: agents run as concurrent tasks and every call is timed.
- Small files reach a Sandbox inside the exec command. The planner sends changes
  above a size cap through fs instead, so every step is self-contained.
- The Live demo needs one new feature: a demo seeded from a Store snapshot.
  `tools/restore-store.mjs` already restores one for the checks.
- Existing checks are reused: `check-scenario.mjs` for the plan, and check-demo's
  gates (expected, closed, order, final tree) at every checkpoint.

### Maximum speed, always

Iteration never waits on purpose. Every second goes to LayerFS work, the commands
and the checks.

- **The headless player runs with no delays.** `run.mjs` has no pauses, typing
  delays or playback holds. It never passes `--pace` to the `run-scenario.mjs`
  machinery.
- **The mock agent script runs at Max.** `dsh/scenarios/dsh-history/scenario.json`
  sets `"speed": 0`. Every dsh run during iteration, including P4's Live window,
  plays at Max. A slower speed is only for the owner to watch, set from the
  strip, and is never part of a gate.
- **Order comes from barriers only.** Agents run concurrently, as planned. A run
  that passes only at a lower speed is a bug in the plan or in LayerFS; slowing
  down is never a fix.
- **Agents run in parallel.** Lanes run concurrently up to the planned agent
  count. The lead's consolidation waits only for its own lanes.
- **No idle time between ranges.** The runner starts range k+1 as soon as range
  k's checkpoint, report and (when due) snapshot are written.

## 3. What each range produces

At each range's completion, the runner writes three things:

- `~/lfs-history/metrics/range-NNN.json`: the raw outputs, one file per attempt.
- `core/docs/issues/352/ranges/range-NNN.md`: the range's report, one file per
  range. `gates.mjs` generates it from the JSON, following
  [ranges/TEMPLATE.md](ranges/TEMPLATE.md). The lead writes its §7 (findings and
  action). A rerun adds an attempt to the same file and never replaces one.
- One row in `core/docs/issues/352/RANGES.md`, the index:

  | Range | dsh commits | Depth | Verdict | Worst speed ratio | Worst scaling slope | New stored bytes | Report |
  | --- | --- | --- | --- | --- | --- | --- | --- |

The sections below list what the report contains.

### a. Range

- Index; first and last dsh commit (full id).
- Mainline commits and side commits it covers.
- The checkpoint commit and its tree id.
- History depth before and after: LayerFS Commits, Layers, Branches.
- The binary id and Store snapshot id it ran on.

### b. Work done

| Count | Breakdown |
| --- | --- |
| Steps (bash calls) | total; per agent; fs batches vs one-shot Workspaces vs merges |
| Branches | lanes created, merged and published |
| Agents | active agents; each agent's steps, Commits and Conflicts |
| Commits | per Branch; total for the range; running total |
| Workspaces | created; one-shot share (gate: ≥70%); long-lived; open at range end (must be 0) |
| Sandbox operations | create, mount, exec, status, commit, unmount, close |
| fs operations | each write and read method |
| branch and project operations | fork, merge, publish, list_commits, diff_commits, diff_branches |
| Exec commands by kind | JS (node, npm, pnpm, test runners) vs other shell; exit codes |
| Conflicts | planned vs observed, by kind; time from Conflict to resolved Commit |
| File mutations | added, modified, deleted; through fs vs Sandbox (gate: ~9 : 1) |

### c. Operation latency table

Write one row per operation kind with these columns:

- n
- p50, p95, p99, max (ms)
- ratio of p50 and p95 to the baseline
- slope against history depth and against tree size
- the size class of its own input (bytes, files changed, entries in the directory, files in the scope)

Compare each kind only with calls of the same size class. Take the daemon phase
times from the call trace (`LAYERFS_TRACE`), so client queueing is separated
from daemon work.

| Group | Operations |
| --- | --- |
| Sandbox | **mount** (phases `store.bind`, `kernel.attach`; logical construction), **exec** (FUSE time vs the same command run natively on the same tree), **commit** (phases `capture`, `construct`, `merge`, `publish`, `install`), status, unmount, create, close |
| fs writes | write, edit, apply, mkdir, rm, cp, mv |
| fs reads | read, list, **stat**, **grep**, **glob**, **diff_files**, blame |
| History | **merge**, publish, fork, list_commits, **diff_commits**, **diff_branches** |
| One-shot Workspace | mount + exec + commit + unmount as one total |

Read-only calls are added to the plan on purpose, because dsh's history alone
produces few of them. Each step runs a fixed sample of reads (about 1 read call
per 2 writes). In addition, the **scale probes** run once per range:

| Probe | Input | Must not depend on |
| --- | --- | --- |
| `stat` / `read` on a fixed small file | one 2 KiB file | tree size, history depth |
| `list` of a fixed small directory | a 5-entry directory created at range 1 | total files, history depth |
| `list` of the largest real directory | grows with the tree | history depth (it may grow with that directory's entries) |
| `grep` / `glob` scoped to the small directory | 5 files | files outside the scope, history depth |
| `grep` / `glob` over the whole tree | grows with the tree | history depth |
| `diff_files` on two fixed files | two 8 KiB files | everything else |
| `diff_commits` of adjacent Commits | one file changed | history depth, tree size |
| `merge` with a fixed small change on each side | 2 + 2 files | history depth, tree size, distance to the merge base |
| `list_commits` first page | page of 20 | history depth |
| `fork` and `publish` | — | history depth, tree size |
| one-shot `mount` + `exec true` + `unmount` | — | tree size, history depth |
| one-shot `commit` of one 2 KiB file | one file | tree size, history depth |

### d. Storage

Read from `operator.store.stats()` and per-Commit `sizes`:

- **Size:** logical, canonical, stored, metadata, DB file pages and free pages,
  and WAL size before the seal. Report the new bytes in this range and the totals.
- **Deduplication:** logical / canonical, for the range and in total. Track
  growth per `node_modules` reinstall separately.
- **Compression:** canonical / stored.
- **Delta:** the share of objects stored as deltas; the depth distribution per
  role (whole-file, chunk, metadata); the share of objects at the depth cap; the
  share whose chain stopped at the chain-work budget instead of the depth cap.
- **Directory share:** metadata bytes as a share of the range's new bytes.
- **Efficiency:** the range's new stored bytes per changed git bytes.
- **Projection:** the Store size at ~230 ranges, against the disk budget.
- **Long history:** whether new bytes per changed byte or per-call latency rise
  with depth. Read this from the latency table's depth slope and from the internal
  counters (rows read, pages touched, ancestors walked per call). A counter that
  grows linearly with depth means the code is proportional to history. That is a
  bug to fix even while the latency is still small.

## 4. Optimization focus

The order is: **speed** first, then **storage compression**.

### Scaling rules

Each operation may grow only with its own input. Its input is what it reads or
changes: the file, the directory listed, the paths in the scope, or the changes
being merged. Neither the size of the whole file system nor the length of the
history is part of any operation's input.

| Operation | May grow with | Must stay flat with |
| --- | --- | --- |
| stat, read | file size, path depth | total files, history depth |
| list | entries in that directory (one page) | total files, history depth |
| grep, glob | files and bytes in the scope | files outside the scope, history depth |
| diff_files | the two files' sizes | everything else |
| diff_commits, diff_branches | entries changed between the two | tree size, history depth |
| fs writes | changed bytes, path depth | tree size, history depth |
| Sandbox commit | files changed in the overlay | tree size, history depth |
| merge | paths changed on both sides since the base | history depth; distance to the base beyond the changed paths |
| mount, fork, publish | nothing | tree size, history depth |
| exec (FUSE) | directories and files the command touches | untouched parts of the tree, history depth |
| list_commits | page size | history depth |
| blame | revisions of that file | other files' history |

So `ls` on a directory of 50,000 entries may be slow, but `ls` on a 5-entry
directory must stay as fast at range 230 as at range 1. A violation is an
*optimize* finding even when the time is still small.

### Logical construction and mount

Improving the speed of logical construction and mount is an explicit target:

- Break mount down into Branch lookup, bind, attach and the first access.
- Measure the first `lookup`/`readdir` on a fresh mount at each milestone.
- Mount should not construct anything in proportion to the tree.

Each fix must be compared on the same milestone snapshots with the probes (§6).

### Storage

Storage work comes after speed. AGENTS.md §3.9 applies: reject a ~50% speed loss
for a ~5% storage gain. Report raw deltas for both.

## 5. Gates per range

Thresholds compare against a baseline taken from ranges 1–5, for the same
operation kind and size class. Set the exact numbers after the pilot and record
them here.

| Metric | Pass | Watch | Act |
| --- | --- | --- | --- |
| Correctness: tree identity, history shape, planned conflicts, step outcomes | 100% | — | Stop: bug cycle |
| fs latency p50 / p95 per kind | ≤ 1.2× baseline | 1.2–1.5× | Optimize when > 1.5× and rising with depth for 3 ranges |
| Scaling rules (§4): depth or tree-size slope of a must-stay-flat probe | flat | sublinear | Optimize when linear |
| Internal counters per call: rows read, pages touched, ancestors walked | flat with depth | sublinear | Optimize when linear with depth |
| One-shot Workspace total; FUSE vs native exec | ≤ 1.2× baseline | 1.2–1.5× | Optimize when > 1.5× |
| Mount and logical construction | flat | rising | Optimize when rising for 3 ranges |
| Commit, merge, publish by depth and files changed | flat with depth | rising | Optimize when rising for 3 ranges |
| Concurrency: planned conflicts hit; Conflict to resolved Commit | as planned | slow resolution | Stop on an unplanned or missed conflict |
| Directory share of new bytes | < 50% | 50–70% | Optimize when > 70% |
| Deduplication per `node_modules` reinstall | ≤ 2× changed packages | 2–5× | Optimize when > 5× |
| Delta (§8): objects at the depth cap | < 10% | 10–25% | Evaluate deeper chains when > 25% and stored bytes grow faster than changed bytes |
| Store projection vs disk budget | < 80% | 80–100% | Stop when over budget |
| Health: Workspaces open at range end, overlay files left, daemon memory and open files | 0, 0, flat | rising for 1–2 ranges | Optimize when rising for 3 ranges (a leak) |
| Seal and snapshot: WAL before seal, seal and copy time | steady | growing | Optimize if it blocks the next range |
| Wall time per range; projected total | within budget | within 1.5× | Re-plan range size or test tiers |

- **Pass:** continue.
- **Watch:** continue, and run the probes at the next milestone.
- **Optimize:** finish the checkpoint and snapshot, then fix and recover (§6).
- **Stop:** the bug cycle, with no retry.

## 6. Fixes without redoing checkpoints

A checkpoint's proof (git's tree plus the plan) is never redone. Its
measurements are kept under the binary that took them. Only Store bytes are
rebuilt, and only mechanically.

| Kind of fix | Example | Recovery |
| --- | --- | --- |
| Code path only | FUSE, exec, a query | Restore the latest snapshot, fast-forward to range k, rerun range k measured |
| Data already written | A bug stored something wrong | Verify each snapshot with the fixed checker; resume from the last good one |
| Store format | A fundamental data structure | Migrate the latest good snapshot, or fast-rebuild it from the plan in the new format, checking every checkpoint's oracle |

Every optimization is compared old binary vs new binary, with the scale probes on
the same milestone snapshots. Label each latency series with its binary; never
merge series across binaries.

### Diagnosis playbook

The fixer follows these steps when a range ends as optimize or stop.

**What already exists:**
- per-call SQL work: statements, VM steps, full-scan steps, sorts, auto-index
  rows, reprepares, rows (`SqlWork`, `layerfs-persistence/src/backend/sqlite/connection.rs`);
- per-mount FUSE opcode counts (`layerfs-fuse/src/request/accounting.rs`);
- in the SDK call trace: phase timing trees, 42 storage counters and 31
  construction counters per exchange.

The builder confirms in P0–P1 that the SQL work and FUSE opcode counts reach the
per-call trace, and wires them in if they do not.

**Counters before time.** Counters are deterministic, so they show growth without
noise. Diagnose from counters first, and confirm with time.

#### D0. Where the time goes

Split each slow call's wall time before choosing a step:

```
client wall (trace ms)
 ├─ client / native queue   = ms − Σ daemon exchanges
 ├─ round trips             = daemon exchanges × per-exchange overhead
 └─ daemon exchange
     ├─ SQL                 (SqlWork)
     ├─ content / storage   (decode, construct, chain links, pack reads)
     └─ FUSE kernel ↔ daemon (opcode counts; exec only)
```

The largest share decides which step below to follow.

#### D1. Time and speed (a regression against the baseline)

1. **Confirm it.** Compare against the same operation kind, size class, binary and
   cache state. Compare p50 and p95 distributions, never single calls.
   Outside load (Docker CPU, host disk, swap) makes the range INELIGIBLE, not a
   finding.
2. **Find the phase.** Diff the phase tree against the baseline, and follow the
   phase that grew down to its leaf.
3. **Work or waiting.**
   - The leaf's counters grew too: the call does more work. Go to D2 or D5.
   - The counters are flat: the call waits (cache misses, I/O, a lock, WAL). Go to D4.
4. **Concurrency.** Re-time the call alone on a restored snapshot, as a diagnostic.
   If it is fast alone, look for Store arbitration contention or serialization
   between agents.

#### D2. Scale and complexity analysis

1. For each operation, fit latency **and** every counter against:
   - its own input (bytes, files changed, entries, files in scope);
   - tree size;
   - history depth.
2. Read the exponent of `log(counter)` against `log(variable)`:
   - about 0: independent, which depth always requires;
   - about 1: linear;
   - above 1: superlinear, always a bug.
3. Check each operation against the scaling rules (§4). For example, `stat` has
   exponent 0 on tree size and on depth; `list` may reach 1 only on its own
   directory's entries.
4. Separate depth from tree size with the controls:
   - the same probe on two milestone snapshots;
   - the squashed-history Store (same tree, no history);
   - the one-Commit-per-git-commit Store.
5. Lock the finding in with a test. Build Stores at two depths (for example 100
   and 10,000), and assert that the counter is equal at both.

#### D3. Round-trip detection

1. **Exchanges per call.** The trace has one `daemon` entry per control exchange
   (a mount makes about 3: lookup, bind, attach). Compare each method's count
   with its expected count.
2. **Exchanges that grow with input.** One exchange per file, per directory or per
   page, where one batched exchange would do, is the N+1 pattern. Fit exchanges
   against input size; any exponent above 0 is a candidate.
3. **Chatty callers.** Many same-kind calls in a row from one step (`stat` after
   `stat`) mean the player or the dsh plugin works per item. Fix it with a batch
   or paged method.
4. **Inside the daemon:**
   - statements per call that grow with input mean a query in a loop: batch it
     with `IN (...)`, a join, or a temporary table;
   - more transactions per call than needed is the same problem one level up.
5. **Across FUSE:** many requests per syscall is a kernel-cache problem (D6).

#### D4. Inefficient database work

1. **Read SqlWork per call:**
   - `fullscan_steps` > 0 on a hot path: an index is missing or unused;
   - `autoindex_rows` > 0: SQLite is building a temporary index;
   - `sorts` where order should come from an index: the index does not match the
     `ORDER BY`;
   - many VM steps per returned row: the query reads far more than it returns.
2. **Read the plan.** Run `EXPLAIN QUERY PLAN` on each statement in the slow
   phase, against a restored snapshot (see `layerfs-persistence/examples/explain_reservation.rs`).
   Look for `SCAN` where `SEARCH … USING INDEX` should be, and for
   `USE TEMP B-TREE`.
3. **History-proportional SQL.** Recursive ancestor walks, `MAX()` or `COUNT(*)`
   over history tables: VM steps rise with depth even when the plan looks right.
4. **Physical state:**
   - WAL size before the seal;
   - free pages and fragmentation;
   - page-cache misses, when the DB is larger than the cache;
   - 4 KiB pages touched per call.

   The page size stays 4 KiB. Fix with layout and caching instead: tighter rows,
   covering indexes, clustering hot rows, cache size, checkpoint cadence.
5. **Verify by counter:** full-scan steps drop to 0, and VM steps per call stop
   depending on depth.

#### D5. Algorithm

1. **Find the loop.** The counter that grew (rows read, pages touched, ancestors
   walked, chain links decoded, objects constructed) names it. Read that code
   path in the leaf phase.
2. **History-proportional patterns:**
   - walking ancestors to find a merge base or a file's last change, with no skip
     index or cached generation number;
   - rebuilding a tree from Layers instead of reading a materialized one;
   - hot files at the delta depth cap (each read decodes a long chain);
   - recomputing per call what could be cached per Commit (merge base, directory
     sizes, logical construction).
3. **Tree-proportional patterns:**
   - a diff or merge that visits unchanged subtrees instead of skipping equal
     subtree ids;
   - a mount that constructs eagerly instead of lazily.
4. **State the intended bound**, for example "merge = O(paths changed since the
   base)". Show that the counter fits it, using the depth test from D2.
5. **Profile last.** Use `perf` or a sampling profiler in the container, only after
   counters have located the phase, on a restored snapshot, as a diagnostic.

#### D6. FUSE operations (exec)

1. **Native comparison.** Run the same command on the same tree natively (an
   exported copy) and in the Workspace. Track the ratio per command type:
   `node`, `pnpm install`, test runners, tree walks.
2. **Opcodes per command.** Count LOOKUP, GETATTR, READDIR, OPEN, READ, WRITE and
   RELEASE per exec. Normalize per syscall (`strace -c` in the container, as a
   diagnostic) and per file touched.
   - Many GETATTRs per file: the attribute cache is not working.
   - The same LOOKUPs repeated across commands: entries are not retained.
3. **Cache settings.**
   - Entry and attribute TTL are 60 s (`request/reply.rs`). A one-shot Workspace
     is a new mount, so it pays every lookup cold; optimize that case.
   - Readahead and `max_read` are negotiated.
   - Writeback caching is not negotiated, so every `write(2)` is a round trip;
     `pnpm install` will show it.
   - Check READDIRPLUS. Without it, `ls -l` and tree walks pay one LOOKUP per entry.
4. **Time per opcode.** Daemon time per opcode against the counts shows whether
   a few slow requests or many fast ones dominate. A LOOKUP or GETATTR that slows
   with depth is a Store read: go to D4 or D5.
5. **Mount and first access.** On a fresh mount, time the first `readdir` of the
   root and of a deep directory. Neither may depend on tree size or depth,
   because logical construction must be lazy.
6. **Overlay to Commit.** Count overlay files after exec. `capture` must follow
   files changed, not files read.

#### Recording a finding

Each finding goes to `BUGS.md` or `OPTIMIZATIONS.md` with:
- its playbook step (D0–D6);
- the counter that shows it, with its exponent before and after;
- the fix commit;
- the old-vs-new probe table on the same milestone snapshots.

## 7. Checkpoints, snapshots and disk

### Store rules

- **Store profile:** Disposable / WAL / `synchronous=OFF` only. Durable stays
  `NOT_RUN — disabled by owner until explicit reauthorization`. Latency therefore
  excludes fsync cost.
- **SQLite page size:** stays **4 KiB** (`profile.rs`, `PRAGMA page_size=4096`).
  Do not change it for storage gains. This is an owner rule.
- **The global Store is the central storage.** Workspace overlays are separate,
  throwaway databases and are never snapshotted.

There are two kinds of checkpoint:
- **Proof checkpoint:** every range; cheap and permanent.
- **Snapshot:** less often; expensive and disposable.

### Proof checkpoint (every range, never redone)

After consolidation, the runner verifies the range's oracle:
- tree identity;
- history shape;
- step outcomes;
- planned conflicts;
- ignored output;
- the range's tests.

It records the result in `ranges/range-NNN.md` and `RANGES.md`, with:
- the LayerFS main head Commit id and the depth;
- the binary and the plan version.

That record is the checkpoint. Git's tree and the plan never change, so a passed
proof is never rerun, even after a fix. Rebuilt Store bytes are checked against
the same oracle.

### Snapshot (sealed Store copy)

**When:**
- every range in the pilot (P1), then every 5 ranges;
- right after the checkpoint of a range whose gate is optimize, before the fix
  starts, so a restore never replays the range that triggered it.

**How:**
1. **Quiesce.** No Workspace mounted and no step in flight. Long-lived Sandboxes
   may stay, empty.
2. **Seal.** `Handles::seal()` checkpoints the WAL into the main file and closes
   the Store.
3. **Copy** from the Docker volume to `~/lfs-history/snapshots/range-NNN/`. Hash
   every file and write `manifest.json`.
4. **Reopen** and continue. Seal and copy time are recorded separately and are
   never part of operation latency.

**Manifest:**
- range, dsh commit and tree id, LayerFS main head Commit id, depth;
- daemon, SDK and image ids, and the plan version;
- the `store_policy` row (cutoff and depths), the schema version, and page size 4096;
- each file's size and SHA-256;
- seal time and copy time;
- the WAL size before the seal (a health signal; see §5).

**Verification:**
- Every snapshot: check the file hashes against the manifest.
- Each milestone: restore into a fresh volume and LayerFS home. Run the oracle
  check on main and `PRAGMA quick_check`. A snapshot that was never restored is
  not proven restorable.

### Retention

| Kind | Kept |
| --- | --- |
| Rolling | The latest 2; delete older ones, with literal paths only |
| Milestones | Forever. About 6: range 5 (pilot end), then ~25%, 50%, 75% and 100% of the history, plus the demo seed if it is not one of these |
| Failed Store | One copy, `failed-NNN/`, until its diagnosis is in `BUGS.md` |

Milestones serve:
- the old-vs-new binary probes (§6);
- the Live demo seed (P4);
- data-fix verification.

### Uses

| Use | How |
| --- | --- |
| Code-path fix | Restore the latest snapshot; fast-forward later ranges with the fast-rebuild player; rerun the failing range measured |
| Data written wrong | Verify snapshots newest first with the fixed checker; resume from the newest good one |
| Store format change | Migrate the newest good snapshot, or fast-rebuild from the plan in the new format, checking every range's oracle |
| Probes | Both binaries run the same probes on the same milestone snapshots |
| Live demo | Seed the dsh demo from a milestone and play ~3 ranges from it |

**Snapshots stay valid.** Open uses the Store's recorded policy, so later default
changes (such as the delta depths) do not invalidate a snapshot.

**Two meanings of "checkpoint":** SQLite's WAL checkpoint (merging the WAL into
the main file) is not a proof checkpoint. It runs inside the seal and
automatically during the run.

### Disk

- Docker Desktop's disk image is the real limit (64 GiB in use). The Mac has
  ~397 GiB free.
- Store estimate: 5–20 GiB at the end.
- **The disk guard** runs before each range. It projects the space the run will
  hold:
  - the working Store after the next range;
  - 2 rolling snapshots;
  - all milestones taken and planned;
  - a failed copy.

  The Docker disk and the host disk are checked separately. The guard stops when
  free space falls under 2× that projection. Over 80% of the budget is a watch
  item and over 100% is a stop (§5).

## 8. Delta depth

**The content model:**

- CAS plus CDC, with 8–32 KiB chunks;
- whole-file objects below 128 KiB (`small_file_threshold_bytes` 131072);
- chunked files at and above it;
- delta chains per role.

**Change made with this issue (owner request):** the default depths are doubled
for new Stores.

| Role | Old | New | Where |
| --- | --- | --- | --- |
| Chunk | 4 | **8** | `layerfs-content/src/contract/policy.rs` `DEFAULT_CHUNK_DELTA_MAX_DEPTH` |
| Whole-file | 8 | **16** | `DEFAULT_WHOLE_FILE_DELTA_MAX_DEPTH` |
| Metadata | 8 | 8 (unchanged) | `layerfs-storage/src/store/policy.rs`; see below |

Why this is safe:

- Depth is a validated policy field in `0..=50`.
- Init records it in the `store_policy` row, and open uses the recorded row.
  Existing Stores and snapshots keep their old depths.
- A deeper chain is still bounded by the fixed chain-work budgets: 512 KiB
  canonical and 256 KiB encoded per chain. The selector skips a base that would
  exceed either one and stores the object without that base.
- The selector's off-by-one on cached depth walks is already fixed
  (`encoding/delta/select.rs`).

**Effective depth is smaller than the cap for large files:**

- A whole-file chain of 100 KiB files reaches its 512 KiB canonical budget at
  about 5 links.
- A chunk chain of 32 KiB chunks fits 8 links (9 × 32 KiB = 288 KiB).

Metadata stays at 8, because its own budget (8 × 8 KiB canonical) already stops
most chains before depth 8. Doubling its depth would change little.

**What the run must decide:**

1. The control arm. During the pilot, replay ranges 1–5 on a second Store created
   with the old depths. Use `StoragePolicy::new(1, 131072, 8, 4)` through the
   project Init request. Compare:
   - stored bytes per changed byte;
   - read latency at the deepest chains (`read`, `diff_files`, `blame`, exec
     reading files);
   - Commit latency and its `construct` phase.
2. Track the share of objects at the depth cap, and the share stopped by the
   budget instead (§3d), for every range.
3. Decide using AGENTS.md §3.9:
   - Keep the new depths if storage improves and read p95 stays within 1.2×.
   - Go deeper (or raise the budgets) if many objects sit at the cap and storage
     still grows faster than changed bytes.
   - Go back to the old depths if reads slow down by more than the storage gain
     justifies.

   Record the decision and its numbers in `RESULTS.md`.

## 9. Rollout

| Phase | Scope | Done when |
| --- | --- | --- |
| P0 · Plan and oracles | `plan.mjs` and `oracle.mjs` over the whole history, without LayerFS | Plan and oracle exist for every range; `check-scenario.mjs` passes |
| P1 · Pilot | First ~300 commits, fs only, one lane, snapshot every range, plus the delta control arm | Every checkpoint matches git; baselines and gate thresholds recorded |
| P2 · Multi-agent | Lanes, the 5–10 agent crew, one-shot Workspaces, planned conflicts | Every planned conflict hit and resolved; identity holds |
| P3 · Sandbox share | The 9 : 1 split, FUSE timing, `node_modules` installs, test tiers | Deduplication and FUSE gates pass |
| P4 · Recovery and demo | Milestone snapshots, probes, one kill and resume, one fast rebuild, the Live demo window seeded from a snapshot | Recovery proved; the demo passes check-demo in dsh |
| P5 · Full history | All ~230 ranges. Controls: squashed history, and one Commit per git commit | Latency-vs-depth and storage curves, with history cost separated from tree size and from Commit granularity |

## 10. Outputs in this folder

- `ranges/range-NNN.md`: one report per range (§3), following `ranges/TEMPLATE.md`.
- `RANGES.md`: the index, one row per range, linking its report.
- `RESULTS.md`: baselines, thresholds, the delta decision, and each phase's results.
- `BUGS.md`: each failure, its diagnosis, its fix kind and its recovery.
- `OPTIMIZATIONS.md`: each optimization with its old-vs-new probe table on the
  same snapshots.

## 11. Open decisions for the owner

- The Docker Desktop disk limit, if the pilot projects past 80% of it.
- Durable mode stays NOT_RUN unless reauthorized.
- Merging `dsh-history-replay` into main is for the owner, because it may carry
  core format changes.
