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

## Resources

All created by this session and removed by literal name after use
(`~/lfs-history/scale-experiments/s4/resources.log`):
- volume `layerfs-issue352-scale-s4`;
- Sandbox containers `layerfs-issue352-scale-s4-{base,a,b}`, closed through `sandbox.close`;
- the runner container, run with `--rm`.

The restored Store file was deleted. The crew's runner, runs and volumes were
not touched, and the crew's pnpm store stayed read-only. The lead cleared
each heavy step, and no timing window was open.
