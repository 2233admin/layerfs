# #352 — Node operation rule from P3

> **Status:** owner-approved 2026-10-19 as the generic Node operation rule from
> P3. §3 was decided the same day: option (b), R1. Design and harness design
> only; no product change. It wins over [INSTALLS.md](INSTALLS.md) and SPEC §2 "Ignored files"
> where they differ. The pre-build checks of §11 ran natively on 2026-10-19;
> nothing else here has run.

The rule is generic over package managers. pnpm is the first and only case
today. Another manager fills the same slots with its own lockfile, workspace
config, install-state files and offline install command.

## 1. Terms

| Term | pnpm case | Tracked? |
| --- | --- | --- |
| **Install inputs** | `pnpm-lock.yaml`, `pnpm-workspace.yaml`, every `package.json`, `.npmrc` (closure.mjs `INSTALL_INPUT`) | Yes, always |
| **Install outputs** | `node_modules/**`, with pnpm's state files (`node_modules/.modules.yaml`, `node_modules/.pnpm/lock.yaml`, `.pnpm-workspace-state*.json`) and the `.bin` shims | No (ignored) |
| **Build outputs** | each package's `outDir` (`lib/`, `dist/`), `*.tsbuildinfo`, tool caches such as `node_modules/.vite` | No (ignored) |
| **Package store** | `/pnpm-store`: the read-only Docker volume `layerfs-issue352-pnpm-store`, outside every Workspace, filled once by `pnpm fetch` | Not in LayerFS |

A **refresh** is the no-op-when-current install: `pnpm install --offline
--frozen-lockfile`. An **incremental install** is the same command after
install inputs changed. A **clean reinstall** removes every `node_modules`
folder first (INSTALLS §1).

Every install runs with closure.mjs `storeSetup` (a private writable index
and cache over the read-only store) and, from P3 on, fail-fast fetch flags
`--fetch-retries=0 --fetch-timeout=3000` (§11: without them a store gap
hangs on network retries instead of failing). Builder item B3.

## 2. Initial install (the lead)

At the first P3 range (15) and at every milestone, the **lead** runs one
install on the lead Branch before any lane forks: a clean reinstall, then
`tsc -b` of the whole workspace. It is committed as one Commit and proven
(§6 P1, P2, P4) before lanes fork. Lanes inherit `node_modules` and the build
outputs from that Commit; no lane starts from an empty `node_modules`.

## 3. Plan rule: install inputs go to the root lane (R1, approved by the owner 2026-10-19)

**Decision (owner, 2026-10-19): option (b), R1.** Every install-input change
goes to the root lane. Each root-lane step that writes one sets all install
inputs to that dsh commit's full input set; other lanes keep the range base's
inputs. Option (a) below was not chosen.

**Implemented** in the lane planner (`plan-range.mjs` `snapInputs`, `plan.mjs
--inputs-rule r1`). The plan records the rule: `inputsRule` in each re-planned
range, and `{ rule, from }` in plan.json. A run plays it with `run.mjs node
--inputs-rule r1`, and refuses a range planned under the other rule. Ranges
15 and later were re-planned into `~/lfs-history/plan-r1/`; the frozen
`~/lfs-history/plan/` is unchanged. Under R1 the root lane writes every input
path of such a commit that differs from its own state. Interleaved side-branch
trees differ in most of their 85 manifests, so range 15's root lane writes 650
input operations (40 under the frozen plan) across 18 snapped commits.

**Option (a), as first proposed.** For every dsh commit that changes the lockfile or the
workspace config, all of that commit's changed install inputs go to the one
step of the lane that owns `/` (the root lane). No other lane writes an
install input of such a commit.

This needs ranges 15 and later re-planned. Today every lockfile and
workspace-config write already sits in the root lane, and the root lane
already has a step for every such commit, so no new step is needed. What
moves are the other install inputs (`package.json` files) of those commits:

| Range | Lockfile versions replayed | Lockfile/workspace commits | …spanning lanes | Install-input paths to move |
| --- | --- | --- | --- | --- |
| 15 | 13 | 13 | 7 | 61 |
| 16 | 13 | 13 | 11 | 32 |
| 17 | 8 | 8 | 8 | 21 |
| 18 | 6 | 6 | 4 | 7 |
| 19 | 2 | 2 | 2 | 3 |
| 20 | 3 | 4 | 1 | 1 |

**The pre-build check (§11 b) shows the rule as stated is not enough:** only
334 of 751 lane steps (44%) have install inputs a frozen install accepts.
Lanes interleave dsh side branches, so a lane's lockfile and its manifests
come from different branches, and non-lockfile commits still change
`package.json` in area lanes. The owner question is therefore a choice:

- **(a) the rule as stated**, accepting that most lane trees fail a frozen
  install natively too (P2 then compares failures);
- **(b) R1, recommended:** every install-input change goes to the root lane,
  and each root-lane step that writes one snaps all install inputs to that
  dsh commit's full input set; other lanes keep the range base's inputs.
  Natively 65 of 73 states pass (§11). Other lanes' source may then import a
  dependency their tree lacks; P4 and P5 compare against native, so that
  shows as an equal native failure, not a LayerFS finding.

## 4. Lane churn

Each lane has **two test points**: after its middle step and at lane end.

| Event | Where | When |
| --- | --- | --- |
| Incremental install | Root lane | At a test point whose window changed install inputs |
| Refresh | Every lane | Before **every** build or test, in every lane |
| `tsc -b` | Every lane | At each test point, the lane's changed packages (`./node_modules/.bin/tsc -b`) |
| vitest | Every lane | At each test point, the selected test files of packages the lane changed, capped at **20 s native per point**, calibrated natively on the lane's own tree |

At most one install (incremental or refresh) per test point. After all lane
merges, the **lead repair**: one install on the merged tree, then `tsc -b`,
then the range build and tests, capped at **60 s native** (5 min at
milestones).

## 5. Merges

- The generated `/.lww` rules (lww.mjs, from `.gitignore`) make
  `node_modules/**` and the build outputs newest-wins. `!/.git` stays the
  last rule (F031_DESIGN Q1).
- Tracked files, install inputs included, never go through `/.lww`. Any
  conflict on a tracked path stops the range.
- A lead repair (§4) follows every consolidation, so a newest-wins mix of two
  lanes' `node_modules` never reaches a checkpoint unrepaired.

## 6. Proofs: LayerFS against native on an identical tree

Each proof runs the same command natively on the same tree: the F-031 lane
commit tree ids for lane points, the checkpoint trees for the lead. The
native oracle is cached per (tree id, install-inputs hash) and computed once.

| Id | Proof | Stop on |
| --- | --- | --- |
| P1 | The installed tree equals native file by file (path, mode, blob id). Only roots and timestamps are normalized (INSTALLS §4 table), and each normalized file is counted | Any other difference |
| P2 | pnpm exit status and output equal native (roots normalized) | Any difference |
| P3 | A no-op refresh changes only pnpm state files | Any other changed path |
| P4 | `tsc -b` exit equal native; emitted `.js` and `.d.ts` equal native by blob id | Any difference |
| P5 | Each test file's result equals native. Files failing natively are skip-listed at calibration only | Pass natively, fail on LayerFS |
| P6 | After-merge repair: P1 and P4 on the merged tree, plus the repair's rewritten-file count | P1 or P4 |

## 7. Resilience checks per range

- No `Busy`, `EAGAIN` or refused unmount.
- Daemon RSS flat across the range.
- Writer wait and lane hold per Commit.
- Overlay size and unmount time bounded.
- Conflicts by path class (install outputs, build outputs, tracked, `.git`).
- Storage growth proportional to new content.

## 8. Storage ratios

| Ratio | Definition | Expectation |
| --- | --- | --- |
| **Content** | Stored content bytes ÷ distinct new content bytes the range wrote | ≤1.x; watch >2×, act >5× |
| **Churn** (headline) | Stored bytes ÷ bytes Node churn rewrote (installs, refreshes, builds, repairs) | Far below 1 |
| **Metadata** | Stored metadata bytes per file and per Commit | Against a fixed budget, set from the dev range |
| **Native-disk equivalence** | Stored bytes ÷ (lanes × one native checkout with `node_modules` and builds) | Reported |

## 9. Product tests outside the replay

1. **Refresh no-op** in a fresh Workspace over an installed root: P3 holds,
   and nothing new is stored.
2. **Parallel installs:** 2 and 4 Branches install the same lockfile in
   parallel, then merge. Report raw vs stored bytes, conflicts by path class
   with and without `/.lww`, and wall time.
3. **Reverted lockfile:** install on a lockfile reverted to an earlier
   version; P1 against the earlier version's native tree.

## 10. Estimates for ranges 15–20 (estimates, not measured)

From the frozen plans (`churn.mjs` in the evidence folder), with two test
points per lane:

| Range | Lanes | Test points | Installs (root lane) | Refreshes | `tsc -b` | vitest points | Lockfile versions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | 3 | 6 | 2 | 10 | 6 | 6 | 13 |
| 16 | 4 | 8 | 2 | 14 | 8 | 8 | 13 |
| 17 | 3 | 6 | 2 | 10 | 6 | 6 | 8 |
| 18 | 3 | 6 | 2 | 10 | 6 | 6 | 6 |
| 19 | 4 | 8 | 1 | 15 | 8 | 8 | 2 |
| 20 | 3 | 6 | 2 | 10 | 6 | 6 | 3 |

Per lane: 2 test points, 4 refresh-or-install events (one before each build
and each test), 2 builds, 2 vitest points; the root lane turns 1–2 refreshes
into incremental installs. All lockfile versions land in the root lane. The
lead adds one repair per range.

**Expected Node wall per range.** The inputs are earlier single samples:

| Step | Native | LayerFS |
| --- | --- | --- |
| First install | 4.1 s | 13.0 s |
| Incremental install | 4.1 s | 13.0 s (taken from the first install as an upper bound) |
| Refresh | 1 s (§11 on-top medians 0.9–1.9 s) | 3 s (assumed) |
| `tsc -b` | 6.4 s | 9.8 s |
| vitest point | 1.5 s | 5.6 s |
| Clean reinstall (milestones only) | — | 44.7 s |

| Range | Summed work, LayerFS | Summed work, native | Critical path (root lane + lead install and tsc), LayerFS | Critical path, native |
| --- | --- | --- | --- | --- |
| 15, 17, 18, 20 | 148 s | 66 s | 70 s | 31 s |
| 16 | 191 s | 85 s | 70 s | 31 s |
| 19 | 181 s | 82 s | 60 s | 28 s |

The lead's range build and tests add up to the 60 s native cap, which has no
LayerFS figure yet. The vitest cap is 20 s native per point; at the measured
3.7× ratio a capped point could take about 75 s on LayerFS, so the per-point
figure above is the typical case, not the bound. Lanes run in parallel, so
the critical path, not the sum, adds to the range wall.

## 11. Pre-build checks (run 2026-10-19, native, one attempt each)

Image `layerfs-352-runtime:node24` (`sha256:d3773b4e…`), node v24.21.0, pnpm
11.28.5, the store volume read-only. Only install inputs were materialized,
and the replay's install command was run on top in plan order, with the
fail-fast flags and a 60 s timeout. Receipts:
`~/lfs-history/evidence/node-rule-prebuild-checks-20261019/`.

**(a) The store covers every intermediate lockfile version:** 45 replayed
versions plus 6 checkpoints.

| Range | Versions passing, policy on | Versions passing, policy off | Checkpoints passing (policy on) |
| --- | --- | --- | --- |
| 15 | 1/13 | 9/13 | 1/1 |
| 16 | 1/13 | 13/13 | 1/1 |
| 17 | 0/8 | 8/8 | 1/1 |
| 18 | 1/6 | 6/6 | 1/1 |
| 19 | 0/2 | 2/2 | 1/1 |
| 20 | 1/3 | 3/3 | 1/1 |
| **Total** | **4/45** | **41/45** | **6/6** |

- **Policy on fails:** the other 41 fail `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`.
  dsh's `pnpm-workspace.yaml` sets `minimumReleaseAge`; offline, pnpm
  accepts only lockfiles recorded in the store cache's
  `lockfile-verified.jsonl`, which holds the checkpoints and a few others.
  Without the fail-fast flags this would have hung on network retries.
- **Policy off** (`pnpm_config_minimum_release_age=0`, the only override
  that disables it): 41/45 pass. 1 is an outdated dsh tree (`r015.s0032`:
  the lockfile is behind `packages/bash/tool-bash/package.json` in dsh
  itself). 3 in range 15 (`r015.s0041`, `s0042`, `s0055`) need
  `hono-4.12.28.tgz`, which the store lacks.
- **Needed before the build (owner decision):** either `pnpm fetch` and
  verify every intermediate lockfile into the store, or depart from dsh's
  policy with `pnpm_config_minimum_release_age=0`. Either way, add the hono
  tarball. Recommended: fetch and verify, which keeps dsh's config as it is.

**(a) again, after the store fill (2026-10-19, policy on, one attempt each).**
The owner chose to fetch and verify (RESULTS.md decision log). Every lockfile
version the R1 plan writes in ranges 15–20 was fetched with `fetch-store.mjs
--versions` (49 not fetched before, which covers the frozen plan's 40); the
store's `lockfile-verified.jsonl` grew from 231 to 281 rows, and
`hono@4.12.28` is in it. The same 51 states as above, same tools and image:

| Range | Versions passing, policy on | Checkpoints passing |
| --- | --- | --- |
| 15 | 12/13 | 1/1 |
| 16 | 13/13 | 1/1 |
| 17 | 8/8 | 1/1 |
| 18 | 6/6 | 1/1 |
| 19 | 2/2 | 1/1 |
| 20 | 3/3 | 1/1 |
| **Total** | **44/45** | **6/6** |

- No `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` and no missing tarball; every
  passing row reports the lockfile as verified.
- The one failure is `r015.s0032`, `ERR_PNPM_OUTDATED_LOCKFILE`: dsh's own
  lockfile is behind `packages/bash/tool-bash/package.json` at that commit.
  It fails natively the same way, so it is an equal native failure, not a
  finding.
- Receipts: `~/lfs-history/evidence/node-rule-11a-recheck-20261019/`
  (`IDENTITY.md`, `w/results-a.jsonl`). Three fetches were killed for memory
  while another session's build shared the Docker VM, and were fetched once
  more alone. During range 20 the owner restarted Docker Desktop (memory
  4 → 8 GB), which interrupted the check; its two rows that had not run ran
  once afterwards on the same chain. The store fill had finished before the
  restart and the store checked intact after it.

**(b) Under the plan rule, every lane step's tree has consistent install
inputs** (policy off, so only consistency is tested):

| Range | Consistent steps / all | Root lane | Other lanes | Distinct states passing |
| --- | --- | --- | --- | --- |
| 15 | 35/124 | 14/43 | 21/81 | 3/19 |
| 16 | 70/176 | 8/35 | 62/141 | 2/19 |
| 17 | 24/106 | 1/39 | 23/67 | 1/13 |
| 18 | 54/135 | 2/51 | 52/84 | 2/12 |
| 19 | 92/126 | 3/36 | 89/90 | 1/5 |
| 20 | 59/84 | 8/33 | 51/51 | 1/5 |
| **Total** | **334/751** | **36/237** | **298/514** | **10/73** |

Every failure is `ERR_PNPM_OUTDATED_LOCKFILE`.

**Diagnostic R1** (§3 option b): 65/73 steps consistent. Range 15 is 12/19:
3 outdated dsh trees and the 3 hono gaps. Range 19 is 4/5: one state exits
254 with no error and passes in range 20. Ranges 16, 17, 18 and 20 pass
throughout.

## 12. Known risks

- **F-040:** the 2 s writer timeout returns `Busy` under concurrent churn.
  Every lane installs and builds at about the same points, so concurrent
  install Commits are likelier here than the Store concurrency model's
  "uncommon" case. §7 records each `Busy` as a stop.
- **Slow FUSE deletes:** about 0.3–0.5 ms per file (F-032). A clean reinstall
  or a pnpm prune that removes many files pays this per file. It is bounded by
  milestones for clean reinstalls, but watch incremental installs that drop
  packages.

## Builder items

- **B1** (done 2026-10-19): ranges 15 and later re-planned under R1 into
  `~/lfs-history/plan-r1/`.
- **B2** (done 2026-10-19): the store was filled with every intermediate
  lockfile, fetched and verified, including `hono-4.12.28.tgz`; §11 a was
  rerun once (44/45 and 6/6, policy on).
- **B3:** add `--fetch-retries=0 --fetch-timeout=3000` to closure.mjs
  `installCommand`.
- **B4:** the test-point churn of §4, the lead repair, and proofs P1–P6 with
  the native oracle cache.
