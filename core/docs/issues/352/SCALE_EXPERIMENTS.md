# #352 — Scale experiments S1, S3, S4 (correctness)

> **Status:** Experiment record, 2026-10-18, by a side session of the #352
> liaison, on branch `dsh-352-scale-experiments` (not merged). Runs the
> correctness experiments S1, S3 and S4 of
> [crazy_work_load_watch_out.md](crazy_work_load_watch_out.md). No product
> code changed and nothing was retried. Durations below are raw wall times
> from single unrepeated runs on a shared host. They are not measurements,
> and no gate reads them. Receipts are under
> `~/lfs-history/scale-experiments/`.

## Summary

| Exp. | Question | Outcome |
| --- | --- | --- |
| S1a | 4,097 Commits since a Branch's base Layer | **Capacity**: `branch.merge` and `branch.publish` refused `Capacity: lineage work` |
| S1b | 4,097 Layers between two sides | **Capacity**: merge and publish of a Branch forked before them refused |
| S1c | Fork from a Commit 4,098 first-parent steps back | **Capacity**: `branch.fork` refused |
| S3 | pnpm install while another daemon commits an install on the same Store | **No `EAGAIN`, no `EIO`**: both installs exit 0, both Commits Committed. Serial reservations and writer waits are not observable from the SDK |
| S4 | Two Branches install the same lockfile, then `branch.merge` | **Conflict, nothing created.** Same install root: 2 files (both state files, timestamps only). Different roots: 252 files (the `.bin` shims and the workspace-state file) |
| S4 + `/.lww` | The same merge with `/.lww` built from dsh's `.gitignore` | **Merged, 0 conflicts.** Every listed LWW pick takes the newer install (74 listed, about 253 in total, inferred). `pnpm install` in the merged result exits 0 but still differs from native in 48 of 1,452 groups: stale absolute install roots from mounting at a different path, not LWW. A first attempt with two concurrent first-install Commits hit **F-036** |

S1 is the confirmation step for F-033 (BUGS.md, `98f8973b9`).

## S1 · Lineage cap (F-033)

Test: `core/crates/layerfs-store-service/tests/scale_lineage_cap.rs`
(commit `9ee945370`). It drives each walk bounded by `MAXIMUM_LINEAGE_ROWS`
(4,096) one step past the bound, through the SDK dispatch
(`sdk::dispatch`, the in-process Store-call route of F-020), with the catalog
calls `is_ancestor` / `merge_base` alongside. The tests print the outcomes and
only assert that the calls return. After F-033 they should assert success.

```
cd core && cargo +1.85.1 test --locked -j 4 -p layerfs-store-service --test scale_lineage_cap --no-run
perl -e 'alarm 120; exec @ARGV' target/debug/deps/scale_lineage_cap-<hash> <test> --exact --nocapture --test-threads=1
```

Disposable profile, macOS host, each test about 20 s. Logs:
`~/lfs-history/scale-experiments/s1/s1{a,b,c}.log`.

**(a) `a_commits_since_the_layer`.** Two Branches forked from main. `big`
gets 4,097 one-file `fs.apply` Commits; `other` gets one.

| Commits since the Layer | Ancestry work (statements / rows) | `is_ancestor` ×2, `merge_base` |
| --- | --- | --- |
| 1,000 | 3,009 / 3,003 | Ok(false), Ok(false), Ok(main's Layer) |
| 2,000 | 6,009 / 6,003 | same |
| 4,000 | 12,009 / 12,003 | same |
| 4,097 | 12,295 / 12,289 | `Err(Capacity("lineage work"))` ×3 |

- `branch.merge(big, other)`: `SdkRefusal { code: "Capacity", message: "capacity: lineage work" }`, after 4,110 statements.
- `branch.publish(big)`: the same refusal, after 4,110 statements.
- The walk costs 3 statements per Commit since the Layer.

**(b) `b_layers_between_two_sides`.** Branch `x` is forked and committed
once. Then 4,097 rounds of fork, one Commit and `branch.publish` on main, all
`Added`, take 20.5 s. Then `y` is forked from the new main and committed once.

- `is_ancestor(y, x)`: Ok(false).
- `is_ancestor(x, y)` and `merge_base`: `Err(Capacity("lineage work"))`.
- `branch.merge(x, y)`: refused Capacity, after 4,119 statements.
- `branch.publish(x)`: refused Capacity, after 32,781 statements.

**(c) `c_fork_from_a_deep_commit`.** Branch `deep` gets 4,098 Commits.
- `branch.fork` from its head: `Forked`.
- `branch.fork` from its first Commit (4,098 first-parent steps back): refused Capacity, after 4,112 statements.

## S3 and S4 · Installs on two Branches

**Setup.**
- **Base:** dev352-p3h's range-015 snapshot, which is range 15's checkpoint with `node_modules` installed. It was rebuilt with `snapshot.mjs rebuild` and copied into volume `layerfs-issue352-scale-s4`.
- **Binaries:** daemon `128a959c`, Linux addon `74d08425`, runtime image `sha256:d3773b4e…`.
- **Runner:** `layerfs-issue352-scale-runner`, a container of its own (not the crew's runner).
- **pnpm store:** the crew's pnpm store volume, mounted read-only.
- **Install command:** the replay's own (`closure.mjs installCommand`).
- **Driver:** [scale-experiments/s4.mjs](scale-experiments/s4.mjs), launched by [run.sh](scale-experiments/run.sh). It runs one stage per command, each under a 120 s alarm.
- **Receipts:** `~/lfs-history/scale-experiments/s4/` (`*.log`, `trace-*.jsonl`, `merge*-value.json`).

**Prep.** Branch `s4-base` was forked from main and mounted.
`rm -rf node_modules` removed 23 top-level entries (38.0 s; F-032). The
Commit was Committed in 4.9 s. This is a base with no `node_modules`.

**S3.** Branches `s4-a` and `s4-b` were forked from `s4-base`, each with its
own Sandbox, so two daemons share the one Store.
1. `b` installed alone: exit 0, 13.9 s.
2. Then, at the same time:
   - `a` installed: exit 0, 14.5 s. It ran entirely inside `b`'s Commit.
   - `b` committed its install: Committed, 19.6 s, 6.87 MB stored, 5.84 MB of it metadata. Its trace shows `fresh_serials` 46,010 and 2 `reservation_refills`.
3. `a` committed: Committed, 25.5 s.

Results:
- Neither install's output contains `EAGAIN`, `Resource temporarily unavailable` or `EIO`, and output was not truncated.
- The daemon logs have no `EAGAIN`, `Busy` or failure lines. Each has one `ConnectionFailure { … UnexpectedEof }`, consistent with the runner process exiting at the end of the stage.
- **Not observable:** the SDK's exec result and trace carry no daemon counters for the mount's FUSE serial refills or their writer wait. So S3 shows no `EAGAIN` in this overlap, but cannot count the refills or show how long they waited. A daemon-side counter is needed to judge that risk directly.

**S4, same install root.** Both Workspaces happened to mount at
`/workspaces/1` (one per Sandbox).
- `branch.merge(s4-a, s4-b)`: **`Conflict`**: "conflict in 2 file(s); nothing was created", 12.6 s. Merge base: `s4-base`'s Commit.
- The 2 conflicts are both add/add, one block each:

| Path | Differs by |
| --- | --- |
| `/node_modules/.modules.yaml` | `prunedAt` (06:51:43 vs 06:51:29 GMT) only |
| `/node_modules/.pnpm-workspace-state-v1.json` | `lastValidatedTimestamp` only |

**S4, different install roots** (`play2`, `merge2`). Branches `s4-c` and
`s4-d` were mounted at `/workspaces/3` and `/workspaces/2`. Both installs ran
at the same time (exit 0, 40.9 s each), and both Commits were Committed.
- `branch.merge(s4-c, s4-d)`: **`Conflict`**: "conflict in 252 file(s); nothing was created", 10.7 s.
- The listing is truncated at 14: 13 `.bin` shims (for example `/node_modules/.bin/eslint`) and the workspace-state file, all add/add.
- **Whole-file comparison of the state files:**
  - `.modules.yaml` is identical on both sides, because both installs finished in the same second: `prunedAt` 06:53:55 on both.
  - The workspace-state file differs in 172 lines: its project keys carry the root, plus the timestamp.
- **The 252 files.** Consistent with the 251 root-bearing `.bin` shims (INSTALLS.md item 9 normalization count) plus the workspace-state file. That split is inferred from the counts; the truncated listing cannot confirm all 252.
- **The merge outcome is exact:** refused, nothing created.

**S4 in short.** Two Branches that both install the same lockfile cannot be
merged today:
- With different mount roots, every `.bin` shim conflicts, plus the workspace-state file.
- With the same root, the two timestamp fields still conflict. Only installs finishing in the same second avoid the `.modules.yaml` conflict.
- No symlink conflict appeared in either case.

**By-product observations** (not findings of this record):
- `branch.diff_branches` between the two different-root installs lists 37,355 paths, every `node_modules` entry, as `Modified`. Pages returned about 187 items for `pageSize` 500, so listing took 200 pages, about 115 s.
- The same listing between the same-root installs (`diff1`) reached the 120 s alarm after 142 pages and was stopped. Each page had a new cursor, so it was progressing, not looping. It was not rerun.
- `diff1-paths.json` is empty because that run was stopped.

## S4 with `/.lww` (owner, 2026-10-18)

**Request.** The owner asked for the same two-sided install merge with the
product's last-writer-wins rules file `/.lww`, built from every dsh
`.gitignore`. The rule: root patterns as written; nested files' patterns
prefixed by their folder; shallower folders first.
- **The file:** [gen-lww.mjs](scale-experiments/gen-lww.mjs) generates it.
- **What it contains:** dsh has only the root `.gitignore` at `b4ec4060a`, so `/.lww` is those 27 lines, sha256 `1932f2d6…`. It includes `node_modules/`.
- **What it does:** `/.lww` rules (`layerfs-content/src/merge/lww.rs`) match a path or any of its parent folders. A path that both sides changed and a rule matches takes the side with the newer modification time, instead of a content merge.

**Base.** The range-15 snapshot used above had been deleted in the meantime.
So the base is p2-main-f's range-14 snapshot (dsh `6e5c908a1`), brought to
range 15's tree by `fs.apply`:
- [gen-r15.mjs](scale-experiments/gen-r15.mjs) produces 19 mkdirs, then the 789 changes `6e5c908a1` → `b4ec4060a`, then `/.lww`, applied in 9 calls.
- **Checked:** 776 changed paths are byte-exact (git blob hash of `fs.read`). The 13 that `fs.read` truncates match git in size, and the 7 deletions are absent.
- This Store held no `node_modules` content before the first install.

**First attempt: F-036.** Driver `lww-play` on volume
`layerfs-issue352-scale-s4`.
- Two Sandboxes (two daemons, one Store) committed their first install at the same time. One Commit failed: `Failed: object e8775b32…ea37 is not stored`, phase `Commit Construct`. The other was Committed, with 88.4 MB new.
- Not retried. The lead recorded it as **F-036** (`c0a853272`).
- The state is kept frozen: container `layerfs-issue352-scale-s4-b`, its Dirty Workspace, the volume and `~/lfs-history/scale-experiments/s4/lww/`.
- **Repro note:** [scale-experiments/F036-REPRO.md](scale-experiments/F036-REPRO.md), a copy of `~/lfs-history/scale-experiments/s4/REPRO-F036.md`.
- **Store copy:** a read-only copy of the frozen Store (`store.sqlite`, `-wal`, `-shm`, with SHA256SUMS) is in `~/lfs-history/scale-experiments/s4/F036-store-copy/`, taken at about 07:15Z with the volume mounted `:ro`.
- **Pending:** the `object_location` query on it waits for the lead's "release".

**The LWW run.** A new volume, `layerfs-issue352-scale-s4l`, from the same
base. Driver [s4l.mjs](scale-experiments/s4l.mjs) with
[run-s4l.sh](scale-experiments/run-s4l.sh). Receipts are in
`~/lfs-history/scale-experiments/s4l/`. Only one Sandbox was used (`a`), and
the installs were committed one after the other:

| Step | Outcome |
| --- | --- |
| `s4l-c` install at `/workspaces/2` | exit 0; Commit Committed (114.4 MB new, the first install in this Store) |
| `s4l-d` install at `/workspaces/3` | exit 0; Commit Committed (7.0 MB new) |
| `branch.merge(s4l-c, s4l-d)` | **`Merged`**, not a fast-forward, **0 conflicts**, 13.5 s |

- **LWW picks.** The result lists 74 LWW decisions and sets `lwwTruncated: true`, so the total is not reported.
  - All 74 have `kept: "theirs"` (s4l-d, the later and therefore newer install), `deleted: false` and rule `node_modules/`.
  - They are 72 `.bin` shims, `.modules.yaml` and `.pnpm-workspace-state-v1.json`.
  - The total is inferred at about **253**: the 252 files that conflicted without `/.lww` (251 shims plus the workspace-state file), plus `.modules.yaml`, whose `prunedAt` differs here. This is inferred from the counts, not reported by the product.
  - **Spot check:** `.modules.yaml`, the workspace-state file and the `eslint`, `tsc` and `vitest` shims in the merged result are byte-identical to s4l-d's, and their install root is `/workspaces/3`.

**Install in the merged result.** The merge head was mounted at
`/workspaces/4`. Each column below is a `compareInstalled` against the
native oracle for lockfile `4e0a2af9…` (1,452 groups), using the replay's own
lister:

| | As merged | After `pnpm install` | Control: `s4l-c` remounted at `/workspaces/5`, no install |
| --- | --- | --- | --- |
| Install | — | exit 0, "Already up to date", 2.4 s | — |
| Groups differing | 131 | **48** | 131 |
| Shim root substitutions (native 1,753) | 0 | 969 | 0 |
| Workspace-state root substitutions (native 85) | 0 | 85 | 0 |

- **The install succeeds but does not match native:** 48 of 1,452 groups still differ, `.modules.yaml` among them.
- **The control explains most of it.** A plain single-side install, remounted at a different path, differs in the same 131 groups. pnpm writes the absolute install root into `.bin` shims and into the state files. A later mount gets a new `/workspaces/<N>`, so the committed tree carries the old root.
- **pnpm's up-to-date install rewrites only part of it:** the top-level state files and part of the shims. 969 of native's 1,753 root occurrences are now under the new root, and the rest are left behind.
- **So the remaining mismatch is not caused by LWW.** It comes from remounting at a different path than the install's.
- **This matters beyond merges:** any `node_modules` committed in one mount and used in another carries stale absolute paths.
- **Not done:** a direct listing of the stale-root files. A recursive grep over `node_modules` hit the 120 s alarm and was stopped. The mounted Workspace was unmounted afterwards with discard; it held no changes.

**S4 with `/.lww` in short:**
- The merge succeeds with 0 conflicts, and every listed pick takes the newer install, as the rule says.
- The merged `node_modules` is a coherent single install (s4l-d's) at s4l-d's install root.
- It matches native only when it is mounted at that same root. pnpm's up-to-date install in a different mount repairs only part of the paths.

## Resources

The F-036 state is kept frozen until the lead releases it: volume
`layerfs-issue352-scale-s4`, containers `layerfs-issue352-scale-s4-{a,b}`
with the Dirty Workspace in `-b`, and `~/lfs-history/scale-experiments/s4/lww/`.
The `/.lww` run's volume `layerfs-issue352-scale-s4l` and its Sandbox were
removed (`~/lfs-history/scale-experiments/s4l/resources.log`).

For the first S1–S4 runs, all created by this session and removed by literal name after use
(`~/lfs-history/scale-experiments/s4/resources.log`):
- volume `layerfs-issue352-scale-s4`;
- Sandbox containers `layerfs-issue352-scale-s4-{base,a,b}`, closed through `sandbox.close`;
- the runner container, run with `--rm`.

The restored Store file was deleted. The crew's runner, runs and volumes were
not touched, and the crew's pnpm store stayed read-only. The lead cleared
each heavy step, and no timing window was open.
