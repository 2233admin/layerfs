# SDK refactor baseline

> **Status:** Recorded final-source baseline; original performance eligibility and count differences retained.

Source `587e9a8beec23b0a0c12aa8f4472349bd9ec5d1c` (tag `sdk-refactor-baseline-587e9a8be`), product tree
`ff47933c44f6170113e7cb391ddcf96fcdda73c1`, source tree `5618f9fc782598a83d97edb480eec49623dc83fb`. One clean
seal supplied all 169 receipts: twelve cells, everyday 108 and heavy 49. All
preparations passed before this campaign started. Every receipt says proof PASS;
all 157 workload functional fields say PASS. Cell functional values below come
from their independent `verification.status`, which also says PASS. Cleanup
verified all 169 sealed manifests before removing writable test copies,
containers and exported Stores. Prepared masters stay closed and retained.

There are 160 single performance attempts and nine original verification-only
attempts. Original report verdicts are 160 INELIGIBLE and nine PASS; a proof-only
PASS is not a numeric speed PASS. No cold-cache/cross-worktree qualification was
established. Counts reproduce 121 exact terminal rows, retain 23 unavailable
rows, and differ on 25. Nineteen differences have source/retained-counter
arithmetic explanations; six retain incomplete job attribution. Those six are
listed explicitly below. References, oracles, limits and original receipts were
never changed, and no case was retried at this identity. No performance
optimization, tuning or best-of selection was performed.

The final-source twelve-cell/23-family selection is also retained in BASELINE.json:
28 exact matches, five unchanged unavailable rows and two explained statement
probe differences (compact Git +3, compact namespace mutation -5). All 35 proof
receipts say PASS and all 23 workload functional receipts say PASS. Each kept
sibling uses its own terminal row. Five stricter capped edits remain in heavy;
the active harness is 157 cases. Three repository_history definitions remain
outside both tiers, NOT_RUN by owner direction. Durable execution is
NOT_RUN — disabled by owner until explicit reauthorization.

Command and Commit values are the receipt's original phase intervals. Sum is
command + Commit; an operation without Commit has N/A in that field and sum
equals command. For branch_development and multi_workspace_development those
phases are sums across concurrent workspaces; `performance_external_wall_ns`
is their elapsed graph time. These scopes differ and are never substituted.
Whole-run is the tracked benchmark setup/operation/proof/required sample-cleanup
interval, excluding tier CLI admission and closed-fixture precheck. The CSV also
keeps benchmark subprocess wall and receipt complete-operation wall separately.
Tier elapsed spans include agent/diagnostic gaps and exclude preparation, which
finished before sampling. Sum-case wall excludes those gaps. All tables below
use seconds rounded to six decimals; CSVs retain integer nanoseconds and bytes.
Verification-only phase intervals are retained in distinct CSV columns and shown
as V in tables; they are not performance measurements.

| Tier | Cases | Elapsed span s | Sum case whole-run s | Sum benchmark subprocess s |
| --- | ---: | ---: | ---: | ---: |
| cells | 12 | 197.494248 | 74.987442 | 73.269828 |
| everyday | 108 | 2200.911162 | 1157.564831 | 1142.190555 |
| heavy | 49 | 3658.748524 | 2373.560865 | 2335.625103 |

The elapsed spans are observed first-case-start to last-case-cleanup intervals,
not owner `all` terminal timings and not numeric comparative performance claims.
The agent invoked only `next`, one case per command.

[All raw per-case metrics](ALL-RESULTS.csv), [cells](CELLS.csv),
[everyday](EVERYDAY.csv), [heavy](HEAVY.csv), [all non-PASS dispositions](NON-PASS.md)
and [machine-readable evidence/hash index](BASELINE.json) retain every selection.
A non-PASS disposition includes original INELIGIBLE rows and count reproduction
FAIL even when that receipt's proof-only report verdict is PASS.

## Slow observations retained as measured

These are the largest original command-plus-Commit sums, with external elapsed
wall separately where concurrent. They are single observations, not rankings of
eligible comparative performance. All original eligibility/limit verdicts remain.

| Case | Command ns | Commit ns | Sum ns | External wall ns | Whole-run ns | Verdict / limit |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `v016-workspace-four-100mb-5000-k100-v1` | 39190662205 | 67434472833 | 106625135038 | 27874950125 | 60390633416 | INELIGIBLE / EXCEEDED |
| `v016-branch-mixed-500mb-30000-k100-v1` | 27353635001 | 22494164217 | 49847799218 | 26610644374 | 136486223417 | INELIGIBLE / EXCEEDED |
| `v016-workspace-mixed-500mb-30000-k100-v1` | 26012682163 | 21321585919 | 47334268082 | 24252474667 | 107889367750 | INELIGIBLE / EXCEEDED |
| `dedup-history-unrelated-500-mixed-v2` | 23115373703 | 12517803248 | 35633176951 | NOT_APPLICABLE | 124190386709 | INELIGIBLE / EXCEEDED |
| `v016-branch-mixed-100mb-5000-k100-v1` | 18779123798 | 16848988411 | 35628112209 | 19036392250 | 46189844792 | INELIGIBLE / EXCEEDED |
| `v016-workspace-mixed-100mb-5000-k100-v1` | 16576652671 | 14763749117 | 31340401788 | 16278907832 | 38434867042 | INELIGIBLE / EXCEEDED |
| `dedup-history-distributed-500` | 21051066382 | 5662674660 | 26713741042 | NOT_APPLICABLE | 96560831667 | INELIGIBLE / EXCEEDED |
| `v016-mixed-development-500mb-30000-k100-v1` | 12435711169 | 6591407662 | 19027118831 | NOT_APPLICABLE | 86137435208 | INELIGIBLE / EXCEEDED |
| `local-snapshot-create-25000-onebyte-v1` | 9619824084 | 8703972708 | 18323796792 | NOT_APPLICABLE | 39306601333 | INELIGIBLE / EXCEEDED |
| `store-footprint-metadata-cardinality-100000` | 14730921333 | 96543291 | 14827464624 | NOT_APPLICABLE | 94967858667 | INELIGIBLE / EXCEEDED |
| `workspace-dense-rewrite-500-mixed-v4` | 3154337291 | 8292053750 | 11446391041 | NOT_APPLICABLE | 50868556917 | INELIGIBLE / WITHIN |
| `v016-mixed-development-100mb-5000-k100-v1` | 7478248453 | 3646554458 | 11124802911 | NOT_APPLICABLE | 38655553000 | INELIGIBLE / WITHIN |

## Kept fixtures

All retained fixture files and distinct masters occupy 68,562,639,832 apparent bytes and 71,561,019,392 allocated bytes. Host free space was 411,500,744,704 bytes; Docker filesystem free space was 161,731,170,304 bytes. The inventory includes superseded source preparations retained with their evidence; it is not just the final campaign's working set. There are 103 distinct referenced masters and zero missing references. [Inventory](FIXTURES.json) gives components and the counting method. Before retention the observation was 3,071,784,966 apparent / 3,393,814,528 allocated bytes, with host free 597,182,824,448 and Docker free 171,939,074,048 bytes.

Native initial inputs are shared by exact bytes/metadata/seed/UID/GID and producer
identity. Prepared originals that include Project Init Stores additionally bind
the product crates, SQL, manifests/locks, runtime production source, image,
profile and flags. Same-source historical before/after pairs share the complete
closed producer and installed master; each selection still performs its own
native/selected-root proof. Fixture retention gives no cache eligibility credit.

## Retained findings and scoped validation

- `v016-branch-mixed-100mb-5000-k10-v1`: counts 8093 / 60740 / 329474 versus 8093 / 60743 / 329548. Full functional/proof PASS, original INELIGIBLE; precise scheduling/job attribution remains limited. Exact deltas and unchanged source pins are in BASELINE.json.
- `v016-branch-mixed-100mb-5000-k100-v1`: counts 54851 / 422821 / 2282262 versus 54851 / 422823 / 2282768. Full functional/proof PASS, original INELIGIBLE; precise scheduling/job attribution remains limited. Exact deltas and unchanged source pins are in BASELINE.json.
- `v016-branch-mixed-500mb-30000-k10-v1`: counts 8108 / 60920 / 330751 versus 8108 / 60919 / 330753. Full functional/proof PASS, original INELIGIBLE; precise scheduling/job attribution remains limited. Exact deltas and unchanged source pins are in BASELINE.json.
- `v016-branch-mixed-500mb-30000-k100-v1`: counts 54938 / 423442 / 2287619 versus 54938 / 423526 / 2287767. Full functional/proof PASS, original INELIGIBLE; precise scheduling/job attribution remains limited. Exact deltas and unchanged source pins are in BASELINE.json.
- `git-tool-500-mixed-v4`: counts 118172 / 191583 / 1071936 versus 118175 / 191587 / 1071969. Full functional/proof PASS, original INELIGIBLE; precise scheduling/job attribution remains limited. Exact deltas and unchanged source pins are in BASELINE.json.
- `v016-workspace-four-100mb-5000-k100-v1`: counts 104312 / 803660 / 4354121 versus 104311 / 803544 / 4352667. Full functional/proof PASS, original INELIGIBLE; precise scheduling/job attribution remains limited. Exact deltas and unchanged source pins are in BASELINE.json.

The Stage 1 Git 45,674 versus 45,673 statement finding remains at its original
identity with its exact +164 SQL-byte/+16 binding-byte/+12 VM-step empty-orphan
probe signature. Later identities are separate observations, not retries or
relabels. Earlier baseline attempts at 820a2c395 (38 completed rows plus a claim
collision before product execution) and 109a97ac4 (91 completed rows plus a
preparation summary KeyError before Store/sample) remain intact. The claim scope
was aligned with the owner-selected exact source rule; the shared summary was
derived from its intact complete manifest. Historical setup ownership was then
completed before any samples at the final identity. No old failed receipt became
PASS. The Stage 2 exact-reuse proof-path failure remains alongside its one fixed-
identity sample, which passed its original functional/proof/count checks.

SDK/bridge/daemon host and Linux validation completed in the consolidated Stage 1
gate; production sources are unchanged since those checks. Each later commit
compiled all SDK/daemon/runtime targets and ran SDK/affected native-control tests.
Runtime selection changes were compiled on host and Linux with focused admission/
import checks. Scoped cache, context, history, replay/identity, and harness checks
retain exact source scopes. The current SDK surface/layout is documented in
[sdk.md](../../../../../sdk.md); mount has no project argument, shared code is
base/, publish and faster exec launching remain deferred working defaults.

Known retained gaps: two daemon proof prerequisites remain unrun on both
platforms; the shared-process/macOS Init handoff and huge native namespace proof
are not claimed passing. The inherited runtime debug snapshot-history deadline
failure, the new exact-reuse-100 component debug 118-second hang, inherited runtime
Clippy findings, Linux frozen mixed helper deadline and 13 unrun frozen helpers
remain recorded; no tuning or unchanged retry. Fuser provenance still exits 1
with two retained historical findings. Package Clippy was used because workspace
Clippy stops at the known missing benchmark_history include. Release baseline
functional and proof results above do not erase those separate failures/gaps.

Production LOC is 82,762. Reference absent (retired R9c; last counted 65,417 at tree
498dd1917812). The migration started at 82,368; total delta +394. Every commit
records its exact first-parent/staged-tree comparison with pinned
`tools/production_loc.py` SHA-256
`c0fe7f36a0d4144bbd2b61c272c7579cc0d56ffe23f9588287ea30e793624adb`.
Benchmark, tests, documentation and tooling are excluded from production LOC.

## Per-case tables

Count cells below are requests / owner jobs / statements. Byte pairs are
apparent / allocated. N/A and unavailable fields remain visible. Status is the
original receipt verdict; count comparison is separate.

### cells

| Family / case | Command s | Commit s | Sum s | Whole-run s | External elapsed s | Counts R/J/S | Store B L/A | Overlay B L/A | Functional / proof | Verdict | Count comparison |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| cells / `C01` | 0.336132 | N/A | 0.336132 | 6.752675 | N/A | 5002 / 5002 / 44004 | 221312 / 225280 | 438272 / 268877824 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C02` | 1.076600 | N/A | 1.076600 | 7.775928 | N/A | 6002 / 6002 / 46004 | 221312 / 225280 | 438272 / 268873728 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C03` | 0.511833 | N/A | 0.511833 | 6.214379 | N/A | 9022 / 9038 / 102540 | 221312 / 225280 | 438272 / 268873728 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C04` | 0.790125 | N/A | 0.790125 | 6.942235 | N/A | 5342 / 5342 / 42644 | 221312 / 225280 | 385024 / 268820480 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C05` | 0.832019 | N/A | 0.832019 | 7.076781 | N/A | 5890 / 6000 / 46637 | 221312 / 225280 | 385024 / 268820480 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C06` | 0.146567 | N/A | 0.146567 | 5.659515 | N/A | 518 / 518 / 9766 | 213072 / 217088 | 68472832 / 336908288 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C07` | 0.348858 | N/A | 0.348858 | 6.283050 | N/A | 1551 / 1550 / 23133 | 213072 / 217088 | 136712192 / 405151744 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C08` | 0.128597 | N/A | 0.128597 | 5.741547 | N/A | 521 / 521 / 9783 | 213072 / 217088 | 68472832 / 336912384 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C09` | 0.083181 | N/A | 0.083181 | 5.408392 | N/A | 517 / 517 / 1055 | 213072 / 217088 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C10` | 0.175079 | N/A | 0.175079 | 5.854530 | N/A | 1547 / 1546 / 14406 | 213072 / 217088 | 68472832 / 336908288 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C11` | 0.125713 | N/A | 0.125713 | 5.418126 | N/A | 517 / 517 / 9760 | 213072 / 217088 | 68472832 / 336908288 | PASS / PASS | INELIGIBLE | PASS |
| cells / `C12` | 0.251072 | N/A | 0.251072 | 5.860283 | N/A | 3436 / 3439 / 24146 | 213072 / 217088 | 339968 / 268775424 | PASS / PASS | INELIGIBLE | PASS |

### everyday

| Family / case | Command s | Commit s | Sum s | Whole-run s | External elapsed s | Counts R/J/S | Store B L/A | Overlay B L/A | Functional / proof | Verdict | Count comparison |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| branch_development / `v016-branch-mixed-100mb-5000-k10-v1` | 2.490617 | 1.697529 | 4.188147 | 28.037623 | 3.200784 | 8093 / 60740 / 329474 | 108122112 / 108122112 | 1048576 / 269484032 | PASS / PASS | INELIGIBLE | FAIL |
| branch_development / `v016-branch-convergent-content-v1` | 1.125129 | 0.180175 | 1.305304 | 7.541789 | 1.845170 | 162 / 2664 / 12058 | 4692200 / 4694016 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| branch_development / `v016-branch-fork-descendant-v1` | 1.426691 | 0.266963 | 1.693654 | 8.461689 | 2.400730 | 216 / 3566 / 16113 | 6163040 / 6164480 | 233472 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-distributed-1` | 0.048698 | 0.006707 | 0.055405 | 5.936679 | N/A | 10 / 95 / 445 | 1434328 / 1437696 | 249856 / 268685312 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-distributed-100` | 3.849499 | 0.733238 | 4.582738 | 22.117894 | N/A | 633 / 8922 / 41276 | 6106784 / 6107136 | 249856 / 268685312 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-hotset-1` | 0.039611 | 0.007686 | 0.047297 | 5.847366 | N/A | 11 / 100 / 471 | 1438448 / 1441792 | 249856 / 268689408 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-hotset-100` | 3.882911 | 0.799167 | 4.682078 | 22.221607 | N/A | 741 / 9473 / 44236 | 6069776 / 6070272 | 249856 / 268689408 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-recurring-1` | 0.051009 | 0.009501 | 0.060510 | 5.827093 | N/A | 10 / 96 / 453 | 1492008 / 1495040 | 282624 / 268722176 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-recurring-100` | 4.045841 | 0.584747 | 4.630588 | 24.328704 | N/A | 505 / 8710 / 39956 | 5356568 / 5357568 | 282624 / 268722176 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-metadata-1` | 0.045717 | 0.007387 | 0.053104 | 5.469023 | N/A | 8 / 86 / 390 | 1442568 / 1445888 | 249856 / 268689408 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-metadata-100` | 3.665287 | 0.495026 | 4.160314 | 21.133000 | N/A | 305 / 7908 / 35339 | 5381288 / 5382144 | 249856 / 268689408 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-unrelated-1` | 0.248988 | 0.085754 | 0.334742 | 6.224891 | N/A | 2206 / 9426 / 48741 | 2653848 / 2654208 | 1552384 / 269991936 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-unrelated-100-mixed-v2` | 4.422543 | 1.926753 | 6.349296 | 27.730985 | N/A | 6315 / 44715 / 229852 | 109035520 / 109035520 | 1310720 / 269750272 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `v016-history-large-hotset-k10-v1` | 0.424282 | 0.071163 | 0.495446 | 7.674999 | N/A | 59 / 1281 / 6470 | 3802280 / 3805184 | 245760 / 268681216 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `v016-history-namespace-inode-k10-v1` | 0.420679 | 0.074071 | 0.494750 | 7.827114 | N/A | 162 / 1660 / 7914 | 3723976 / 3727360 | 241664 / 268677120 | PASS / PASS | INELIGIBLE | FAIL |
| dedup_branch_history / `v016-history-boundary-cycle-k10-v1` | 0.430294 | 0.074682 | 0.504975 | 9.031836 | N/A | 115 / 1367 / 6763 | 3542744 / 3543040 | 237568 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| dedup_cdc_locality / `dedup-cdc-overwrite-100` | 0.099146 | N/A | 0.099146 | 12.773282 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 3493888 / 3493888 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_cdc_locality / `dedup-cdc-insert-100` | 0.149960 | N/A | 0.149960 | 14.331172 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 4947968 / 4947968 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_cdc_locality / `dedup-cdc-delete-100` | 0.110639 | N/A | 0.110639 | 11.170991 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 4395008 / 4395008 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_cdc_locality / `dedup-cdc-common-body-100` | 0.221767 | N/A | 0.221767 | 12.166463 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 30707712 / 30707712 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_cdc_locality / `dedup-cdc-scattered-100` | 0.538343 | N/A | 0.538343 | 15.178988 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 107364352 / 107364352 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_cdc_locality / `dedup-cdc-boundaries-proof` | V 0.017572 | V N/A | N/A | 5.984987 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 475136 / 475136 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | PASS | UNAVAILABLE_UNCHANGED |
| dedup_cross_file / `dedup-cross-file-anchor-1` | 0.017969 | N/A | 0.017969 | 6.077924 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 1232896 / 1232896 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_cross_file / `dedup-cross-file-unique-100` | 0.580462 | N/A | 0.580462 | 13.471111 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 106278912 / 106278912 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_cross_file / `dedup-cross-file-identical-100` | 0.088030 | N/A | 0.088030 | 9.216083 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 1236992 / 1236992 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_cross_file / `dedup-cross-file-mixed-100` | 0.427295 | N/A | 0.427295 | 12.158579 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 79761408 / 79761408 | UNAVAILABLE / UNAVAILABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| dedup_workspace_reuse / `dedup-workspace-exact-100` | 0.289026 | 0.688950 | 0.977976 | 32.286450 | N/A | 1414 / 9008 / 55476 | 136233856 / 136237056 | 106946560 / 375382016 | PASS / PASS | INELIGIBLE | PASS |
| dedup_workspace_reuse / `dedup-workspace-local-100` | 0.245132 | 0.678729 | 0.923861 | 35.141619 | N/A | 1414 / 9008 / 55476 | 139797656 / 139800576 | 106946560 / 375382016 | PASS / PASS | INELIGIBLE | PASS |
| dedup_workspace_reuse / `dedup-workspace-unique-100` | 0.258933 | 0.750393 | 1.009326 | 39.320064 | N/A | 1414 / 9008 / 55476 | 245604352 / 245604352 | 106946560 / 375382016 | PASS / PASS | INELIGIBLE | PASS |
| dedup_workspace_reuse / `dedup-workspace-unique-1-base128-v3` | 0.045894 | 0.016754 | 0.062647 | 27.220666 | N/A | 28 / 186 / 981 | 137523416 / 137527296 | 1298432 / 269733888 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-construct-1-compact-v2` | 0.039226 | 0.006836 | 0.046062 | 5.576208 | N/A | 16 / 171 / 761 | 1405680 / 1409024 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-construct-100-mixed-v4` | 0.283172 | 0.269236 | 0.552408 | 11.259837 | N/A | 4408 / 49675 / 210008 | 106793392 / 106795008 | 839680 / 269279232 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-metadata-scan-1-compact-v2` | 0.091201 | 0.005721 | 0.096922 | 6.202341 | N/A | 720 / 900 / 7397 | 1360336 / 1363968 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-metadata-scan-100-mixed-v4` | 0.339641 | 0.007774 | 0.347415 | 10.716314 | N/A | 2744 / 2962 / 33526 | 106410472 / 106414080 | 376832 / 268812288 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-content-scan-1-compact-v2` | 0.258085 | 0.005833 | 0.263918 | 6.144051 | N/A | 871 / 1050 / 8247 | 1360336 / 1363968 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-content-scan-100-mixed-v4` | 1.783593 | 0.006630 | 1.790223 | 13.823401 | N/A | 9144 / 11503 / 72608 | 106410472 / 106414080 | 376832 / 268812288 | PASS / PASS | INELIGIBLE | PASS |
| edit_canonical_chunk_count / `overwrite-fixed-64k-chunk-count-preserve-on-100mib-ops-1` | 0.045691 | 0.011984 | 0.057675 | 9.932304 | N/A | 10 / 347 / 1821 | 106542504 / 106545152 | 339968 / 268775424 | PASS / PASS | INELIGIBLE | PASS |
| edit_canonical_chunk_count / `overwrite-fixed-64k-chunk-count-increase-on-100mib-ops-1` | 0.037959 | 0.012724 | 0.050683 | 9.578636 | N/A | 10 / 347 / 1821 | 106558984 / 106561536 | 339968 / 268775424 | PASS / PASS | INELIGIBLE | PASS |
| edit_canonical_chunk_count / `overwrite-fixed-64k-chunk-count-decrease-on-100mib-ops-1` | 0.035360 | 0.011095 | 0.046455 | 9.452622 | N/A | 10 / 347 / 1821 | 106464224 / 106467328 | 339968 / 268775424 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `insert-middle-4k-on-1mib-ops-1` | 0.046447 | 0.008562 | 0.055009 | 5.228867 | N/A | 27 / 151 / 870 | 1393416 / 1396736 | 262144 / 268689408 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `insert-middle-4k-on-100mib-ops-1` | 0.521865 | 0.011112 | 0.532978 | 10.988297 | N/A | 1611 / 1926 / 21675 | 106488944 / 106491904 | 286720 / 268722176 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `delete-middle-4k-on-1mib-ops-1` | 0.035970 | 0.008709 | 0.044679 | 4.961403 | N/A | 24 / 145 / 870 | 1389296 / 1392640 | 258048 / 268693504 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `delete-middle-4k-on-100mib-ops-1` | 0.475572 | 0.013741 | 0.489313 | 9.017465 | N/A | 1212 / 1567 / 20852 | 106468344 / 106471424 | 303104 / 268738560 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `append-tail-4k-on-1mib-ops-1` | 0.028714 | 0.008032 | 0.036746 | 5.016755 | N/A | 11 / 110 / 535 | 1393416 / 1396736 | 241664 / 268677120 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `append-tail-4k-on-100mib-ops-1` | 0.029855 | 0.010785 | 0.040641 | 9.033098 | N/A | 11 / 133 / 658 | 106447744 / 106450944 | 249856 / 268685312 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `prepend-head-4k-on-1mib-ops-1` | 0.051283 | 0.009406 | 0.060689 | 6.905902 | N/A | 43 / 144 / 935 | 1393416 / 1396736 | 274432 / 268693504 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `prepend-head-4k-on-100mib-ops-1` | 1.733892 | 0.009550 | 1.743442 | 13.478870 | N/A | 3211 / 3366 / 40803 | 106460104 / 106463232 | 286720 / 268701696 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `replace-grow-middle-2k-to-4k-on-1mib-ops-1` | 0.040257 | 0.012992 | 0.053248 | 5.881639 | N/A | 28 / 168 / 999 | 1393416 / 1396736 | 274432 / 268697600 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `replace-grow-middle-2k-to-4k-on-100mib-ops-1` | 0.589567 | 0.013685 | 0.603252 | 10.313520 | N/A | 1612 / 2015 / 25064 | 106484824 / 106487808 | 303104 / 268738560 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `replace-shrink-middle-4k-to-2k-on-1mib-ops-1` | 0.043220 | 0.018790 | 0.062009 | 5.194028 | N/A | 24 / 162 / 949 | 1397536 / 1400832 | 258048 / 268693504 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `replace-shrink-middle-4k-to-2k-on-100mib-ops-1` | 0.386317 | 0.011863 | 0.398180 | 9.126915 | N/A | 1212 / 1613 / 18160 | 106476584 / 106479616 | 299008 / 268734464 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `truncate-tail-4k-on-1mib-ops-1` | 0.029851 | 0.006158 | 0.036010 | 5.013616 | N/A | 10 / 106 / 521 | 1389296 / 1392640 | 237568 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `truncate-tail-4k-on-100mib-ops-1` | 0.035615 | 0.008950 | 0.044565 | 8.510100 | N/A | 10 / 170 / 881 | 106460104 / 106463232 | 249856 / 268685312 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `zero-extend-tail-4k-on-1mib-ops-1` | 0.042418 | 0.009534 | 0.051952 | 5.412661 | N/A | 11 / 110 / 535 | 1389296 / 1392640 | 241664 / 268677120 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `zero-extend-tail-4k-on-100mib-ops-1` | 0.025245 | 0.009336 | 0.034581 | 8.096106 | N/A | 11 / 133 / 658 | 106455984 / 106459136 | 249856 / 268685312 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_preserving / `overwrite-head-4k-on-100mib-ops-1` | 0.030705 | 0.012348 | 0.043053 | 9.105029 | N/A | 10 / 253 / 1311 | 106472464 / 106475520 | 278528 / 268713984 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_preserving / `overwrite-middle-4k-on-1mib-ops-1` | 0.048186 | 0.013468 | 0.061654 | 5.193226 | N/A | 11 / 145 / 740 | 1393416 / 1396736 | 245760 / 268681216 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_preserving / `overwrite-middle-4k-on-100mib-ops-1` | 0.019624 | 0.014587 | 0.034211 | 9.030415 | N/A | 11 / 406 / 2123 | 106480704 / 106483712 | 290816 / 268726272 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_preserving / `overwrite-tail-4k-on-100mib-ops-1` | 0.026410 | 0.011347 | 0.037757 | 9.153571 | N/A | 10 / 224 / 1139 | 106447744 / 106450944 | 258048 / 268697600 | PASS / PASS | INELIGIBLE | PASS |
| file_size_transition / `v016-boundary-small-control-v1` | 0.079042 | 0.012048 | 0.091089 | 5.887625 | N/A | 14 / 181 / 823 | 402544 / 405504 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| file_size_transition / `v016-boundary-below-v1` | 0.077802 | 0.017216 | 0.095017 | 5.678971 | N/A | 14 / 182 / 828 | 797320 / 798720 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| file_size_transition / `v016-boundary-exact-v1` | 0.083997 | 0.013351 | 0.097348 | 5.885697 | N/A | 14 / 261 / 1323 | 537712 / 540672 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| file_size_transition / `v016-boundary-above-v1` | 0.069768 | 0.017165 | 0.086933 | 6.012918 | N/A | 14 / 261 / 1323 | 537712 / 540672 | 233472 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| file_size_transition / `v016-boundary-large-control-v1` | 0.090047 | 0.020374 | 0.110421 | 5.783661 | N/A | 14 / 261 / 1323 | 1471648 / 1474560 | 237568 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| file_size_transition / `v016-boundary-roundtrip-v1` | 0.169724 | 0.023318 | 0.193043 | 6.710105 | N/A | 26 / 386 / 1836 | 735520 / 737280 | 237568 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| file_size_transition / `v016-boundary-alias-roundtrip-v1` | 0.180292 | 0.030290 | 0.210582 | 6.110516 | N/A | 108 / 624 / 3234 | 937400 / 937984 | 364544 / 268800000 | PASS / PASS | INELIGIBLE | PASS |
| git_tool_workflow / `git-tool-1-compact-v2` | 0.364330 | 0.014173 | 0.378503 | 7.251737 | N/A | 5895 / 7400 / 45676 | 1524680 / 1527808 | 303104 / 268738560 | PASS / PASS | INELIGIBLE | FAIL |
| git_tool_workflow / `git-tool-100-mixed-v4` | 4.070076 | 0.100404 | 4.170480 | 24.371211 | N/A | 51385 / 68976 / 415096 | 64964352 / 64966656 | 1499136 / 269934592 | PASS / PASS | INELIGIBLE | FAIL |
| historical_access / `v016-access-boundary-before-v1` | V 0.095609 | V 0.000000 | N/A | 5.860838 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 3088512 / 3092480 | 233472 / 268668928 | PASS / PASS | PASS | UNAVAILABLE_UNCHANGED |
| historical_access / `v016-access-boundary-after-v1` | V 0.097805 | V 0.000000 | N/A | 5.600445 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 3088512 / 3092480 | 233472 / 268668928 | PASS / PASS | PASS | UNAVAILABLE_UNCHANGED |
| historical_access / `v016-access-inode-before-v1` | V 0.078240 | V 0.000000 | N/A | 5.812972 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 3555456 / 3559424 | 233472 / 268668928 | PASS / PASS | PASS | UNAVAILABLE_UNCHANGED |
| historical_access / `v016-access-inode-after-v1` | V 0.106392 | V 0.000000 | N/A | 6.033042 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 3555456 / 3559424 | 233472 / 268668928 | PASS / PASS | PASS | UNAVAILABLE_UNCHANGED |
| historical_access / `v016-access-fork-point-v1` | V 0.077886 | V 0.000000 | N/A | 5.516506 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 3137664 / 3141632 | 233472 / 268668928 | PASS / PASS | PASS | UNAVAILABLE_UNCHANGED |
| historical_access / `v016-access-divergent-head-v1` | V 0.085921 | V 0.000000 | N/A | 5.583896 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 3469440 / 3473408 | 233472 / 268668928 | PASS / PASS | PASS | UNAVAILABLE_UNCHANGED |
| init_namespace / `namespace-100-compact-v3` | 0.044217 | N/A | 0.044217 | 2.136275 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 5255168 / 5255168 | NOT_APPLICABLE / NOT_APPLICABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| init_namespace / `namespace-10000` | 1.957678 | N/A | 1.957678 | 6.101083 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 305704960 / 305704960 | NOT_APPLICABLE / NOT_APPLICABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| local_snapshot / `local-snapshot-create-25000-onebyte-v1` | 9.619824 | 8.703973 | 18.323797 | 39.306601 | N/A | 177581 / 1403960 / 6747991 | 925832 / 929792 | 28934144 / 297369600 | PASS / PASS | INELIGIBLE | PASS |
| mixed_load_bearing / `agent-episodes-1-compact-v2` | 0.048412 | 0.009833 | 0.058246 | 6.078816 | N/A | 95 / 450 / 2328 | 1471432 / 1474560 | 262144 / 268697600 | PASS / PASS | INELIGIBLE | PASS |
| mixed_load_bearing / `agent-episodes-100` | 0.588914 | 0.251860 | 0.840774 | 21.794478 | N/A | 8213 / 36058 / 186472 | 86395088 / 86396928 | 3280896 / 271716352 | PASS / PASS | INELIGIBLE | FAIL |
| mixed_load_bearing / `v016-mixed-development-100mb-5000-k10-v1` | 0.754262 | 0.333149 | 1.087411 | 17.150297 | N/A | 2699 / 20288 / 109667 | 107068920 / 107069440 | 626688 / 269062144 | PASS / PASS | INELIGIBLE | FAIL |
| multi_workspace_development / `v016-workspace-mixed-100mb-5000-k10-v1` | 1.645271 | 1.083808 | 2.729079 | 20.511021 | 1.886604 | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 108122112 / 108122112 | 1032192 / 269467648 | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| namespace_mutation / `namespace-subtree-relocate-delete-1-compact-v2` | 0.048941 | 0.013862 | 0.062803 | 5.115478 | N/A | 129 / 890 / 5281 | 951096 / 954368 | 249856 / 268685312 | PASS / PASS | INELIGIBLE | FAIL |
| namespace_mutation / `namespace-subtree-relocate-delete-100-mixed-v4` | 0.105744 | 0.044249 | 0.149992 | 10.565783 | N/A | 832 / 5738 / 34258 | 106988488 / 106991616 | 364544 / 268800000 | PASS / PASS | INELIGIBLE | FAIL |
| payload_create_read / `payload-create-1m-compact-v2` | 0.037233 | 0.015815 | 0.053049 | 5.077257 | N/A | 22 / 177 / 922 | 1416112 / 1417216 | 1298432 / 269733888 | PASS / PASS | INELIGIBLE | PASS |
| payload_create_read / `payload-create-100m` | 0.211479 | 0.738476 | 0.949956 | 8.675836 | N/A | 814 / 4137 / 31810 | 109649920 / 109649920 | 106860544 / 375296000 | PASS / PASS | INELIGIBLE | PASS |
| payload_create_read / `payload-random-read-1-compact-v2` | 0.024664 | 0.005298 | 0.029962 | 5.182260 | N/A | 6 / 52 / 236 | 1339856 / 1343488 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| payload_create_read / `payload-random-read-100` | 0.050583 | 0.007086 | 0.057669 | 23.766000 | N/A | 105 / 151 / 434 | 530805224 / 530808832 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| small_file_delta_smoke / `small-file-delta-10x30-v1` | 1.208504 | 0.211421 | 1.419925 | 11.446004 | N/A | 402 / 2919 / 14049 | 2474448 / 2478080 | 290816 / 268726272 | PASS / PASS | INELIGIBLE | PASS |
| store_footprint / `store-footprint-unique-100-low-v1` | 0.094377 | 0.006710 | 0.101086 | 7.410023 | N/A | 12 / 95 / 443 | 5436264 / 5439488 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| store_footprint / `store-footprint-metadata-cardinality-100-low-v1` | 0.141414 | 0.009249 | 0.150663 | 7.690706 | N/A | 12 / 95 / 443 | 5456624 / 5459968 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-create-1-compact-v2` | 0.037416 | 0.007939 | 0.045355 | 5.440197 | N/A | 16 / 140 / 645 | 1409776 / 1413120 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-create-100-mixed-v4` | 0.090013 | 0.046506 | 0.136520 | 10.378746 | N/A | 736 / 5565 / 26688 | 106896584 / 106897408 | 552960 / 268988416 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-stat-1-compact-v2` | 0.034738 | 0.005255 | 0.039993 | 5.331143 | N/A | 4 / 51 / 249 | 1360336 / 1363968 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-stat-100-mixed-v4` | 0.051179 | 0.006951 | 0.058130 | 10.517845 | N/A | 112 / 159 / 1671 | 107336168 / 107339776 | 393216 / 268828672 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-unlink-1-compact-v2` | 0.037130 | 0.007166 | 0.044296 | 5.508095 | N/A | 12 / 122 / 594 | 1385056 / 1388544 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-unlink-100-mixed-v4` | 0.095933 | 0.034295 | 0.130228 | 10.976290 | N/A | 435 / 3035 / 17989 | 107463888 / 107466752 | 393216 / 268828672 | PASS / PASS | INELIGIBLE | FAIL |
| tiny_file_churn / `tiny-bulk-create-1-compact-v2` | 0.152481 | 0.093222 | 0.245704 | 5.747778 | N/A | 1429 / 14865 / 64387 | 1430400 / 1433600 | 1499136 / 269934592 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-bulk-create-100-mixed-v3` | 0.768446 | 1.255530 | 2.023976 | 12.002321 | N/A | 8709 / 71650 / 341790 | 111824896 / 111824896 | 108732416 / 377167872 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-bulk-delete-1-compact-v2` | 0.109409 | 0.062109 | 0.171518 | 5.655168 | N/A | 1145 / 9966 / 53089 | 1426184 / 1429504 | 352256 / 268787712 | PASS / PASS | INELIGIBLE | FAIL |
| tiny_file_churn / `tiny-bulk-delete-100-mixed-v3` | 0.405495 | 0.199825 | 0.605319 | 8.687254 | N/A | 4987 / 36093 / 210354 | 107766656 / 107769856 | 925696 / 269361152 | PASS / PASS | INELIGIBLE | FAIL |
| workspace_change_locality / `workspace-clean-commit-1-compact-v2` | 0.000000 | 0.007248 | 0.007248 | 5.712370 | N/A | 0 / 47 / 204 | 1360336 / 1363968 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-clean-commit-100-mixed-v4` | 0.000000 | 0.009805 | 0.009805 | 10.643847 | N/A | 0 / 47 / 204 | 106410472 / 106414080 | 348160 / 268783616 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-fixed-move-1-compact-v2` | 0.039858 | 0.011299 | 0.051157 | 5.940391 | N/A | 16 / 151 / 700 | 1409776 / 1413120 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-fixed-move-100-mixed-v4` | 0.036652 | 0.015024 | 0.051676 | 10.542880 | N/A | 16 / 151 / 700 | 106488752 / 106491904 | 348160 / 268783616 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-distributed-sdk-edit-1-compact-v2` | 0.041238 | 0.008440 | 0.049677 | 5.714857 | N/A | 12 / 94 / 444 | 1422136 / 1425408 | 237568 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-distributed-sdk-edit-100-mixed-v4` | 0.106177 | 0.092517 | 0.198693 | 10.975748 | N/A | 745 / 4113 / 21526 | 107300392 / 107302912 | 790528 / 269225984 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-dense-rewrite-1-compact-v2` | 0.069033 | 0.042550 | 0.111583 | 5.974285 | N/A | 437 / 1950 / 11504 | 2522176 / 2523136 | 1359872 / 269795328 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-dense-rewrite-100-mixed-v4` | 1.144974 | 2.303483 | 3.448456 | 16.449687 | N/A | 12545 / 84438 / 424874 | 213606400 / 213606400 | 109760512 / 378195968 | PASS / PASS | INELIGIBLE | PASS |

### heavy

| Family / case | Command s | Commit s | Sum s | Whole-run s | External elapsed s | Counts R/J/S | Store B L/A | Overlay B L/A | Functional / proof | Verdict | Count comparison |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| branch_development / `v016-branch-mixed-100mb-5000-k100-v1` | 18.779124 | 16.848988 | 35.628112 | 46.189845 | 19.036392 | 54851 / 422821 / 2282262 | 122331136 / 122331136 | 1105920 / 269541376 | PASS / PASS | INELIGIBLE | FAIL |
| branch_development / `v016-branch-mixed-500mb-30000-k10-v1` | 3.799543 | 2.610396 | 6.409938 | 119.443032 | 4.656024 | 8108 / 60920 / 330751 | 514785280 / 514789376 | 1048576 / 269488128 | PASS / PASS | INELIGIBLE | FAIL |
| branch_development / `v016-branch-mixed-500mb-30000-k100-v1` | 27.353635 | 22.494164 | 49.847799 | 136.486223 | 26.610644 | 54938 / 423442 / 2287619 | 530026496 / 530030592 | 1114112 / 269549568 | PASS / PASS | INELIGIBLE | FAIL |
| dedup_branch_history / `dedup-history-distributed-500` | 21.051066 | 5.662675 | 26.713741 | 96.560832 | N/A | 3110 / 44776 / 206236 | 8466080 / 8466432 | 249856 / 268685312 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `dedup-history-unrelated-500-mixed-v2` | 23.115374 | 12.517803 | 35.633177 | 124.190387 | N/A | 31525 / 223525 / 1148752 | 538853376 / 538857472 | 1310720 / 269746176 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `v016-history-large-hotset-k100-v1` | 3.880435 | 0.574190 | 4.454626 | 22.597214 | N/A | 539 / 12539 / 63336 | 7188008 / 7188480 | 245760 / 268681216 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `v016-history-namespace-inode-k100-v1` | 3.923403 | 0.649047 | 4.572449 | 22.029862 | N/A | 1530 / 16481 / 78337 | 7401024 / 7401472 | 241664 / 268677120 | PASS / PASS | INELIGIBLE | PASS |
| dedup_branch_history / `v016-history-boundary-cycle-k100-v1` | 3.852576 | 0.558753 | 4.411329 | 22.364491 | N/A | 1105 / 13562 / 67108 | 7196152 / 7196672 | 237568 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| dedup_workspace_reuse / `dedup-workspace-unique-500` | 1.071949 | 6.271092 | 7.343040 | 82.603095 | N/A | 7014 / 46769 / 282013 | 670707712 / 670711808 | 533876736 / 802316288 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-construct-500-mixed-v4` | 1.218893 | 1.308530 | 2.527423 | 31.584227 | N/A | 22008 / 248100 / 1048680 | 535920640 / 535920640 | 3170304 / 271605760 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-metadata-scan-500-mixed-v4` | 0.566007 | 0.008080 | 0.574087 | 27.352688 | N/A | 5864 / 6142 / 73786 | 531812816 / 531820544 | 593920 / 269033472 | PASS / PASS | INELIGIBLE | PASS |
| directory_construction_traversal / `directory-content-scan-500-mixed-v4` | 4.903332 | 0.016848 | 4.920180 | 34.619867 | N/A | 24063 / 29497 / 175496 | 531812816 / 531820544 | 593920 / 269033472 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `insert-middle-4k-on-500mib-result-capped-v2-ops-1` | 2.394107 | 0.017591 | 2.411698 | 26.482048 | N/A | 8011 / 8376 / 101891 | 530920608 / 530923520 | 311296 / 268746752 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `delete-middle-4k-on-500mib-ops-1` | 2.147436 | 0.016403 | 2.163839 | 30.226394 | N/A | 6012 / 6425 / 96574 | 530928824 / 530931712 | 339968 / 268775424 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `prepend-head-4k-on-500mib-result-capped-v2-ops-1` | 6.360670 | 0.020824 | 6.381494 | 34.502384 | N/A | 16011 / 16212 / 200970 | 530900008 / 530903040 | 294912 / 268701696 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing / `truncate-tail-4k-on-500mib-ops-1` | 0.026170 | 0.013257 | 0.039426 | 22.127329 | N/A | 10 / 216 / 1133 | 530891744 / 530898944 | 258048 / 268693504 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_preserving / `overwrite-middle-4k-on-500mib-ops-1` | 0.043925 | 0.017652 | 0.061578 | 22.152487 | N/A | 11 / 452 / 2375 | 530912344 / 530915328 | 303104 / 268738560 | PASS / PASS | INELIGIBLE | PASS |
| git_tool_workflow / `git-tool-500-mixed-v4` | 9.256725 | 0.381712 | 9.638438 | 42.312787 | N/A | 118172 / 191583 / 1071936 | 80575168 / 80576512 | 4902912 / 273338368 | PASS / PASS | INELIGIBLE | FAIL |
| init_namespace / `namespace-100000` | 7.268490 | N/A | 7.268490 | 27.183597 | N/A | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 516476928 / 516476928 | NOT_APPLICABLE / NOT_APPLICABLE | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| mixed_load_bearing / `agent-episodes-500` | 2.903696 | 1.085518 | 3.989215 | 27.460981 | N/A | 41013 / 181071 / 932725 | 95027200 / 95027200 | 15437824 / 283873280 | PASS / PASS | INELIGIBLE | FAIL |
| mixed_load_bearing / `v016-mixed-development-100mb-5000-k100-v1` | 7.478248 | 3.646554 | 11.124803 | 38.655553 | N/A | 26078 / 201510 / 1084524 | 114434048 / 114434048 | 659456 / 269099008 | PASS / PASS | INELIGIBLE | FAIL |
| mixed_load_bearing / `v016-mixed-development-500mb-30000-k10-v1` | 1.230486 | 0.627035 | 1.857521 | 56.284851 | N/A | 2704 / 20339 / 110047 | 513052672 / 513056768 | 2564096 / 270999552 | PASS / PASS | INELIGIBLE | PASS |
| mixed_load_bearing / `v016-mixed-development-500mb-30000-k100-v1` | 12.435711 | 6.591408 | 19.027119 | 86.137435 | N/A | 26119 / 201904 / 1086908 | 521043968 / 521048064 | 2678784 / 271114240 | PASS / PASS | INELIGIBLE | FAIL |
| mixed_load_bearing / `v016-mixed-exhaustive-100mb-5000-k100-v1` | V 8.044283 | V 3.786038 | N/A | 51.202990 | N/A | 26078 / 201510 / 1084545 | 114429952 / 114429952 | 659456 / 269099008 | PASS / PASS | PASS | FAIL |
| mixed_load_bearing / `v016-mixed-exhaustive-500mb-30000-k100-v1` | V 12.752513 | V 6.814855 | N/A | 144.207732 | N/A | 26119 / 201904 / 1086988 | 521101312 / 521105408 | 2678784 / 271114240 | PASS / PASS | PASS | FAIL |
| multi_workspace_development / `v016-workspace-mixed-100mb-5000-k100-v1` | 16.576653 | 14.763749 | 31.340402 | 38.434867 | 16.278908 | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 122564608 / 122564608 | 1097728 / 269533184 | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| multi_workspace_development / `v016-workspace-mixed-500mb-30000-k10-v1` | 2.910645 | 2.028042 | 4.938687 | 88.627856 | 2.914964 | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 514596864 / 514600960 | 1032192 / 269467648 | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| multi_workspace_development / `v016-workspace-mixed-500mb-30000-k100-v1` | 26.012682 | 21.321586 | 47.334268 | 107.889368 | 24.252475 | UNAVAILABLE / UNAVAILABLE / UNAVAILABLE | 529981440 / 529985536 | 1097728 / 269533184 | PASS / PASS | INELIGIBLE | UNAVAILABLE_UNCHANGED |
| multi_workspace_development / `v016-workspace-four-100mb-5000-k100-v1` | 39.190662 | 67.434473 | 106.625135 | 60.390633 | 27.874950 | 104312 / 803660 / 4354121 | 133046272 / 133046272 | 1875968 / 270311424 | PASS / PASS | INELIGIBLE | FAIL |
| namespace_mutation / `namespace-subtree-relocate-delete-500-mixed-v4` | 0.358958 | 0.170461 | 0.529419 | 27.852032 | N/A | 4072 / 27726 / 166751 | 534172568 / 534175744 | 811008 / 269246464 | PASS / PASS | INELIGIBLE | FAIL |
| payload_create_read / `payload-create-500m` | 0.945693 | 4.020721 | 4.966414 | 24.467658 | N/A | 4014 / 20137 / 156610 | 534929408 / 534937600 | 533389312 / 801828864 | PASS / PASS | INELIGIBLE | PASS |
| payload_create_read / `payload-random-read-500` | 0.169440 | 0.007538 | 0.176978 | 21.569693 | N/A | 503 / 550 / 1232 | 530805224 / 530812928 | 233472 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| store_footprint / `store-footprint-unique-100000` | 7.374775 | 0.096952 | 7.471728 | 85.045288 | N/A | 12 / 95 / 443 | 516727704 / 516734976 | 233472 / 268673024 | PASS / PASS | INELIGIBLE | PASS |
| store_footprint / `store-footprint-metadata-cardinality-100000` | 14.730921 | 0.096543 | 14.827465 | 94.967859 | N/A | 12 / 95 / 443 | 556192592 / 556199936 | 233472 / 268668928 | PASS / PASS | INELIGIBLE | PASS |
| store_footprint / `store-footprint-large-object-500m` | 2.424291 | 0.015377 | 2.439668 | 42.041989 | N/A | 12 / 281 / 1482 | 506344368 / 506351616 | 262144 / 268697600 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-create-500-mixed-v4` | 0.250504 | 0.200422 | 0.450926 | 27.600743 | N/A | 3496 / 27941 / 131288 | 534792224 / 534798336 | 1847296 / 270282752 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-stat-500-mixed-v4` | 0.079664 | 0.011820 | 0.091483 | 26.685210 | N/A | 512 / 559 / 6871 | 532849104 / 532856832 | 602112 / 269037568 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-unlink-500-mixed-v4` | 0.220579 | 0.102727 | 0.323305 | 26.167910 | N/A | 2035 / 13939 / 83648 | 532898544 / 532905984 | 569344 / 269008896 | PASS / PASS | INELIGIBLE | FAIL |
| tiny_file_churn / `tiny-bulk-create-500-mixed-v3` | 3.383642 | 7.151925 | 10.535568 | 36.725385 | N/A | 39665 / 310090 / 1505061 | 536420352 / 536428544 | 541523968 / 809963520 | PASS / PASS | INELIGIBLE | PASS |
| tiny_file_churn / `tiny-bulk-delete-500-mixed-v3` | 1.690253 | 0.798689 | 2.488942 | 20.819004 | N/A | 21187 / 146056 / 872789 | 533070672 / 533078016 | 3276800 / 271712256 | PASS / PASS | INELIGIBLE | FAIL |
| workspace_change_locality / `workspace-clean-commit-500-mixed-v4` | 0.000000 | 0.009388 | 0.009388 | 27.452705 | N/A | 0 / 47 / 204 | 531812816 / 531820544 | 544768 / 268980224 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-fixed-move-500-mixed-v4` | 0.040421 | 0.020742 | 0.061164 | 31.109635 | N/A | 16 / 151 / 700 | 531899336 / 531906560 | 544768 / 268980224 | PASS / PASS | INELIGIBLE | PASS |
| workspace_change_locality / `workspace-distributed-sdk-edit-500-mixed-v4` | 0.304684 | 0.488989 | 0.793673 | 30.297920 | N/A | 3166 / 21030 / 108225 | 537776128 / 537780224 | 3010560 / 271446016 | PASS / PASS | INELIGIBLE | FAIL |
| workspace_change_locality / `workspace-dense-rewrite-500-mixed-v4` | 3.154337 | 8.292054 | 11.446391 | 50.868557 | N/A | 33359 / 222679 / 1154213 | 1066643456 / 1066647552 | 541523968 / 809963520 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing_capped / `insert-middle-4k-input-524283904b-result-500mib-ops-1-capped-v1` | 2.255689 | 0.017894 | 2.273583 | 26.389843 | N/A | 8011 / 8376 / 101891 | 530920608 / 530923520 | 311296 / 268746752 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing_capped / `append-tail-4k-input-524283904b-result-500mib-ops-1-capped-v1` | 0.029711 | 0.017013 | 0.046725 | 21.821162 | N/A | 11 / 173 / 880 | 530887648 / 530894848 | 262144 / 268701696 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing_capped / `prepend-head-4k-input-524283904b-result-500mib-ops-1-capped-v1` | 5.864695 | 0.011924 | 5.876619 | 32.428909 | N/A | 16011 / 16212 / 200970 | 530900008 / 530907136 | 294912 / 268705792 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing_capped / `replace-grow-middle-2k-to-4k-input-524285952b-result-500mib-ops-1-capped-v1` | 2.509818 | 0.016165 | 2.525983 | 27.168135 | N/A | 8012 / 8460 / 102355 | 530928824 / 530935808 | 323584 / 268759040 | PASS / PASS | INELIGIBLE | PASS |
| edit_length_changing_capped / `zero-extend-tail-4k-input-524283904b-result-500mib-ops-1-capped-v1` | 0.036507 | 0.012612 | 0.049119 | 21.780174 | N/A | 11 / 173 / 880 | 530900008 / 530907136 | 262144 / 268697600 | PASS / PASS | INELIGIBLE | PASS |

