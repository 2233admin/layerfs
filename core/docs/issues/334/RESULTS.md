# Issue 334 results: independent SDK-only shop build

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Completed 2026-10-16 on `issue334-shop-run`, in the isolated worktree `/Users/yifanxu/.codex/worktrees/issue334-shop-run/layerfs`. Every numerical observation in this report is **diagnostic**, from one traced run with uncontrolled caches. These are not benchmark results, cold-cache evidence, release qualification, or an aggregate CI verdict. The original campaign stopped before repository publication; subsequent owner-authorized review and closure are recorded in [CLOSURE.md](CLOSURE.md). Durable: `NOT_RUN — disabled by owner until explicit reauthorization`. Stores selected Disposable/WAL/OFF and construction used `LAYERFS_CONSTRUCTION_WORKERS=1`. Portable raw receipts and stopped Store exports are linked in [EVIDENCE.md](EVIDENCE.md).

## Phase outcomes and evidence

| Phase | Outcome | Evidence |
| --- | --- | --- |
| A | Every group/method/conflict/observation example exercised; skill corrected | [evidence archive](EVIDENCE.md): `issue334/phase-a/`; [bug ledger](BUGS.md) |
| B | M1–M6, fresh-Branch install/test/build/HTTP acceptance; one product bug fixed | [evidence archive](EVIDENCE.md): `issue334/phase-b/REPORT.md` |
| C | M1–M6 and fresh-Branch acceptance passed; 14 tests, build, smoke; no SDK blocker | [evidence archive](EVIDENCE.md): `issue334/phase-c/` |
| D | Histories, totals, decoded logs, call/step/storage CSVs collected | analysis.json, calls.csv, steps.csv, methods.csv, phases.csv, storage.csv in B/C |

Builder 2 received only `/Users/yifanxu/LayerFS-issue334-builder2`, the installed SDK, copied skill, SPEC, environment, and the verbatim builder instructions. Its prompt prohibited repository/issue/Builder 1 access and product fixes. The SDK was copied into that folder; its package link resolves within the folder. The orchestrator supplied no implementation help. Raw scripts, outputs and report were subsequently preserved under `phase-c/builder2/`; the outside folder also remains.

## Identities (diagnostic source pins)

| Phase | Source / artifact | Identity |
| --- | --- | --- |
| A | source | b30e4fb8ff61134640bec88af211cec283ed1a53 |
| A | Linux daemon | 19516483fccc6d94509a27ee7b3517e76181f48fa1b05b47cea1c88baa2ee182 |
| A | host addon | e73a1fda6909cc6959301a700ab450f930cfc61a8d0a783953b03e3f6a123bcf |
| B | initial source | 051a193436d6caf4d4101eb0c775897606e21eab |
| B | fixed product source | 222240012c68478c278bbe60e2398cfa8b8bd423 |
| B | rebuilt daemon | 9ae97a7c6e1b6f04dd7b37795ab4545e946251491ee35e07500e050c2bb7f432 |
| B | rebuilt addon | 0bfaf1fcc25f1a49318077e3bdede5935d5c4ec841e572806b9a2620dc4b4d8e |
| C | source | d3d1a8b55696748aaa65fc677211f5c5e6080a38 |
| C | Linux daemon | 04cd138ffe16d316dc158cb3f50195a38f31e76200c1e1d66d396ffcb308fcb9 |
| C | host addon | 0bfaf1fcc25f1a49318077e3bdede5935d5c4ec841e572806b9a2620dc4b4d8e |
| all | runtime image | sha256:2d929c6d66c21c962febba8ede6ddb6405faefa057d3b4d21750de07fe81918b |
| all | build image | sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6 |
| all | Cargo config SHA256 | f54e4d536550625b3df978a6b506c44a51fa84dac85a4e2d0293dad1727be8c8 |
| all | Cargo.lock SHA256 | b659eec666e1ec1c62ef596c631b7de3c959d029dbef70e39b376b2bac822f76 |
| host | Node | v22.7.0 |

| Phase | Volume | Project / HOME / trace |
| --- | --- | --- |
| A | layerfs-334-a-20261016 | shop-a; core/target/issue334/phase-a/home; phase-a/trace.jsonl |
| B | layerfs-334-b-20261016 | shop-b; core/target/issue334/phase-b/home; phase-b/trace.jsonl |
| C | layerfs-334-c-20261016 | shop-c; core/target/issue334/phase-c/home; phase-c/trace.jsonl |

Phase A also used `shop-a-methods` as a separate successful Init fixture in its own A HOME/volume; it is excluded from the B/C metric runs. The Linux build used the pinned image, locked/offline dependencies, the read-only Cargo registry and worktree-local `core/target/cluster2-linux`. Host addon builds used the repository ARM64 profile. Build commands and outputs are retained in each phase. Prepared target caches were reused only for compilation; no measured product work or mutated project was reused across phases. B kept its original Store/volume across the glob fix. C used a fresh Store/volume and rebuilt artifacts from its stated branch tip; its daemon hash is recorded independently of B. Phase D collects B/C and creates no additional workload Store.

## Storage totals (diagnostic bytes and ratios)

| Run | Logical history bytes | Canonical bytes | Stored pack bytes | Metadata bytes | SQLite file bytes | Free bytes | Dedupe | Compression |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B (fixing run) | 769,980,226 | 13,317,529 | 5,481,018 | 1,129,390 | 6,348,800 | 0 | 57.817 | 2.430 |
| C (independent run) | 524,672,113 | 13,168,457 | 5,431,030 | 1,095,527 | 6,279,168 | 0 | 39.843 | 2.425 |

Logical Store totals sum every Commit and publication Layer, counting regular-file paths. Canonical is distinct registered object bytes; stored includes all compressed/delta pack bodies. Metadata is metadata-domain pack bytes plus SQLite overhead, so it overlaps stored: **do not add stored and metadata**. SQLite overhead is `file - free - stored`; file is committed SQLite pages, not OS allocation or WAL size. Ratios are logical/canonical and canonical/stored. Per-file exclusive physical allocation is unavailable.

### Initial boundary and counter reconciliation

B has a contemporaneous post-Init `operator.store.stats` snapshot. **C collection gap:** its first SDK script grouped Init, fork and scaffold, so no contemporaneous operator snapshot exists at that boundary. C initial totals were reconstructed read-only from the retained, sealed host Init artifact, with the exact product `statistics_totals.sql` query and operator formulas. Its WAL header and unchanged SHA256 are recorded in `stats-init-reconstruction.json`; the same hash was verified after the run. No live Store snapshot was taken while C was working. This reconstruction is explicitly not relabelled as a live operator capture.

| Run | Initial logical / canonical / stored / metadata | Unique Commits | Commit-counter logical total | Additional Layer logical | Canonical residual | Stored residual | Metadata residual / overhead growth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B | 21 / 2,104 / 2,060 / 155,157 | 31 | 638,037,879 | 131,942,347 | 0 | 0 | 714194 / 714194 |
| C | 21 / 2,104 / 2,062 / 155,157 | 19 | 393,544,438 | 131,127,675 | 0 | 0 | 694552 / 694552 |

Commits are deduplicated by full id across every mutable Branch and traced displaced heads. `store.commits("main")` returned the retained `NoSuchBranch` refusal because main is a Layer chain; its publications were collected in the final inspection snapshot. The reconciliation separates Layer logical bytes and SQLite overhead from acknowledged Save counters; any nonzero unexplained canonical/stored residual would remain visible in the table.

### C per-Commit history (all values diagnostic)

Ordered by the first publishing trace call. IDs are abbreviated here; complete IDs and Branch membership are in `phase-c/storage.csv`. Cumulative logical starts at Init and adds each unique Commit tree once; cumulative canonical/stored start at Init and add acknowledged Save counters. These Commit-only cumulative ratios exclude extra logical credits from publication Layers; final Store ratios above include them. New metadata is a subset of new stored, not additional storage.

| Step | Commit | Logical tree | New canonical | New stored | New metadata | Cumulative logical | Cumulative stored | Cumulative dedupe | Cumulative compression |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 006 M1: initialize project and skeleton | 12d8c79e34ae64 | 3,329 | 6,184 | 3,656 | 1,120 | 3,350 | 5,718 | 0.404 | 1.449 |
| 007 M1: install dependencies | 1263446dc0fadb | 21,816,670 | 12,507,303 | 5,246,604 | 116,502 | 21,820,020 | 5,252,322 | 1.743 | 2.383 |
| 009 M2: implement catalog | 120d7e82e4218c | 21,819,662 | 16,543 | 3,680 | 1,589 | 43,639,682 | 5,256,002 | 3.482 | 2.384 |
| 010 M2: two Workspaces on the catalog Branch | 122f42121ee6df | 21,828,173 | 13,770 | 3,086 | 1,370 | 65,467,855 | 5,259,088 | 5.218 | 2.386 |
| 010 M2: two Workspaces on the catalog Branch | 120766a35f9042 | 21,829,778 | 19,703 | 2,814 | 1,776 | 87,297,633 | 5,261,902 | 6.947 | 2.388 |
| 012 M3: implement carts and totals | 12bed21f8bc784 | 21,835,764 | 19,368 | 3,882 | 1,630 | 109,133,397 | 5,265,784 | 8.672 | 2.390 |
| 012 M3: implement carts and totals | 12de576185b936 | 21,835,957 | 6,126 | 1,908 | 1,370 | 130,969,354 | 5,267,692 | 10.402 | 2.390 |
| 014 M4: implement checkout orders and discounts | 1210a039317056 | 21,839,845 | 17,489 | 3,614 | 1,627 | 152,809,199 | 5,271,306 | 12.119 | 2.392 |
| 014 M4: implement checkout orders and discounts | 129b056aba8306 | 21,840,261 | 17,729 | 2,116 | 1,422 | 174,649,460 | 5,273,422 | 13.832 | 2.394 |
| 015 M5: implement browser storefront | 12209e6e025c2e | 21,852,649 | 30,980 | 8,876 | 2,074 | 196,502,109 | 5,282,298 | 15.525 | 2.396 |
| 016 M4: test checkout and publish orders | 12ee485704ae60 | 21,845,879 | 19,290 | 3,685 | 1,586 | 218,347,988 | 5,285,983 | 17.225 | 2.398 |
| 017 M5: build test web and merge Branches | 1201206b5f96dc | 21,885,522 | 39,840 | 10,471 | 2,969 | 240,233,510 | 5,296,454 | 18.892 | 2.401 |
| 017 M5: build test web and merge Branches | 12d5992596c083 | 21,895,444 | 10,586 | 1,414 | 1,414 | 262,128,954 | 5,297,868 | 20.596 | 2.402 |
| 018 M5: verify and publish merged storefront | 128a78328dd9cd | 21,895,444 | 9,578 | 2,850 | 2,377 | 284,024,398 | 5,300,718 | 22.300 | 2.403 |
| 019 M6: implement admin and complete README | 127f83041d46ab | 21,903,817 | 20,164 | 5,977 | 1,941 | 305,928,215 | 5,306,695 | 23.982 | 2.404 |
| 019 M6: implement admin and complete README | 12bc325619a75d | 21,903,947 | 6,565 | 1,942 | 1,409 | 327,832,162 | 5,308,637 | 25.685 | 2.404 |
| 020 M6: verify admin and publish final main | 12a5ce57f19c5a | 21,903,947 | 9,740 | 2,863 | 2,390 | 349,736,109 | 5,311,500 | 27.381 | 2.405 |
| 021 Acceptance: clean install test and build | 126d253c30ecce | 21,903,947 | 374,569 | 116,895 | 99,400 | 371,640,056 | 5,428,395 | 28.267 | 2.422 |
| 022 Acceptance: full server purchase smoke | 125302ee6cdeb3 | 21,904,382 | 20,826 | 2,635 | 1,852 | 393,544,438 | 5,431,030 | 29.885 | 2.425 |

### Growth flags and reinstall evidence

The following diagnostic candidates have `newStored > max(logicalDelta, 0)`, where logicalDelta is the Commit tree minus its parent/base tree. This is a deliberately conservative **growth flag**, not a changed-byte measurement or a failure gate: same-sized rewrites and metadata changes can have zero logical growth. Full operands are in storage.csv. Flags must be interpreted with the actual step and Save metadata; small tree/metadata packs are not a full dependency reinstall.

| Step | Commit | Logical delta | New canonical | New stored | New metadata |
| --- | --- | --- | --- | --- | --- |
| 006 M1: initialize project and skeleton | 12d8c79e34ae64 | 3,308 | 6,184 | 3,656 | 1,120 |
| 009 M2: implement catalog | 120d7e82e4218c | 2,992 | 16,543 | 3,680 | 1,589 |
| 010 M2: two Workspaces on the catalog Branch | 120766a35f9042 | 1,605 | 19,703 | 2,814 | 1,776 |
| 012 M3: implement carts and totals | 12de576185b936 | 193 | 6,126 | 1,908 | 1,370 |
| 014 M4: implement checkout orders and discounts | 129b056aba8306 | 416 | 17,729 | 2,116 | 1,422 |
| 018 M5: verify and publish merged storefront | 128a78328dd9cd | 0 | 9,578 | 2,850 | 2,377 |
| 019 M6: implement admin and complete README | 12bc325619a75d | 130 | 6,565 | 1,942 | 1,409 |
| 020 M6: verify admin and publish final main | 12a5ce57f19c5a | 0 | 9,740 | 2,863 | 2,390 |
| 021 Acceptance: clean install test and build | 126d253c30ecce | 0 | 374,569 | 116,895 | 99,400 |
| 022 Acceptance: full server purchase smoke | 125302ee6cdeb3 | 435 | 20,826 | 2,635 | 1,852 |

| Install step | Command summary | SDK ms | Saved new canonical | Saved new stored | Logical tree |
| --- | --- | --- | --- | --- | --- |
| 007 M1: install dependencies | timeout 100 npm install --no-audit --no-fund | 13,113.443 | 12507303 | 5246604 | 21816670 |
| 021 Acceptance: clean install test and build | rm -rf node_modules dist && timeout 70 npm install --no-audit --no-fund && timeout 15 npm test && timeout 15 npm run build | 1,949.126 | 374569 | 116895 | 21903947 |

**Flag 021 is the largest steady-logical growth candidate:** removing and reinstalling dependencies/assets added 374,569 canonical bytes and 116,895 stored bytes while tree logical size stayed 21,903,947. Of those stored bytes, 99,400 (85.034%) are metadata-domain packs. This is 2.228% of the initial install's 5,246,604 stored bytes, and 0.534% of the final tree's logical bytes. It did not store node_modules again in full. Reinstallation still creates real metadata/object history; this row is retained as a growth flag. The remaining flags range from 1,908 to 3,685 stored bytes, except the initial scaffold at 3,656, and are small namespace/metadata rewrites or smoke data. There is no per-path exclusive allocation here, so their exact changed-content amplification is not claimed. The observed history shows no full-dependency storage blow-up. No benchmark or universal storage guarantee is inferred.

## SDK speed (C only; diagnostic milliseconds)

All workload calls, successful or refused, are included. Labels beginning `OBS` are observer collection and excluded. Internal `sandbox.service` rows are identified separately by their method name; their elapsed work can overlap the enclosing Store call. Median uses the arithmetic midpoint and p95 uses nearest rank `ceil(0.95*n)`. There are 122 total trace rows, 23 excluded observer rows, and 99 workload rows across 19 labels. These are one-run timings with tracing and uncontrolled caches.

| Method | Count | Refused | Median ms | p95 ms | Max ms |
| --- | --- | --- | --- | --- | --- |
| branch.fork | 7 | 0 | 2.451 | 3.318 | 3.318 |
| branch.list_commits | 1 | 0 | 2.187 | 2.187 | 2.187 |
| branch.merge | 1 | 0 | 14.343 | 14.343 | 14.343 |
| branch.publish | 6 | 0 | 2.616 | 3.623 | 3.623 |
| fs.apply | 8 | 0 | 12.630 | 17.751 | 17.751 |
| fs.read | 5 | 0 | 3.544 | 4.505 | 4.505 |
| fs.write | 2 | 0 | 8.083 | 8.375 | 8.375 |
| project.init | 1 | 0 | 1,042.898 | 1,042.898 | 1,042.898 |
| project.list_branches | 2 | 0 | 2.675 | 2.934 | 2.934 |
| sandbox.close | 2 | 0 | 1,279.421 | 1,282.923 | 1,282.923 |
| sandbox.commit | 12 | 0 | 11.082 | 324.700 | 324.700 |
| sandbox.create | 1 | 0 | 227.021 | 227.021 | 227.021 |
| sandbox.exec | 12 | 0 | 779.120 | 13,113.443 | 13,113.443 |
| sandbox.mount | 12 | 0 | 28.845 | 32.903 | 32.903 |
| sandbox.service | 15 | 0 | 16.824 | 276.423 | 276.423 |
| sandbox.unmount | 12 | 0 | 6.971 | 8.908 | 8.908 |

### Commit, mount and merge phases (diagnostic ms)

Times are inclusive phase trees. Each phase is summed within its call, then aggregated across calls where it was present. Parent and child rows overlap and must not be added. Missing phases are unavailable, not zero. Full nested paths are in phases.csv; this table shows roots and direct children.

| Method | Phase | Calls with phase | Median ms | p95 ms | Max ms |
| --- | --- | --- | --- | --- | --- |
| branch.merge | branch.merge | 1 | 9.386 | 9.386 | 9.386 |
| branch.merge | branch.merge/merge.paths | 1 | 4.742 | 4.742 | 4.742 |
| branch.merge | branch.merge/merge.read | 1 | 0.029 | 0.029 | 0.029 |
| branch.merge | branch.merge/merge.update | 1 | 0.793 | 0.793 | 0.793 |
| sandbox.commit | commit | 12 | 4.302 | 293.265 | 293.265 |
| sandbox.commit | commit/begin | 12 | 0.583 | 2.265 | 2.265 |
| sandbox.commit | commit/capture | 12 | 0.006 | 0.015 | 0.015 |
| sandbox.commit | commit/construct | 12 | 1.460 | 272.194 | 272.194 |
| sandbox.commit | commit/finish | 10 | 0.635 | 1.588 | 1.588 |
| sandbox.commit | commit/head | 10 | 0.029 | 0.036 | 0.036 |
| sandbox.commit | commit/install | 10 | 0.085 | 0.094 | 0.094 |
| sandbox.commit | commit/logical.count | 10 | 0.372 | 0.825 | 0.825 |
| sandbox.commit | commit/logical.known | 10 | 0.007 | 0.010 | 0.010 |
| sandbox.commit | commit/merge | 1 | 1.208 | 1.208 | 1.208 |
| sandbox.commit | commit/producer | 12 | 0.074 | 0.175 | 0.175 |
| sandbox.commit | commit/publish | 10 | 0.065 | 0.088 | 0.088 |
| sandbox.commit | commit/validate | 10 | 0.240 | 0.563 | 0.563 |
| sandbox.mount | sandbox.mount.attach | 12 | 1.013 | 1.451 | 1.451 |
| sandbox.mount | sandbox.mount.attach/kernel.attach | 12 | 1.010 | 1.441 | 1.441 |
| sandbox.mount | sandbox.mount.bind | 12 | 1.724 | 2.972 | 2.972 |
| sandbox.mount | sandbox.mount.bind/store.bind | 12 | 1.716 | 2.963 | 2.963 |

### Ten slowest step labels (diagnostic)

Trace span is first traced start to last traced completion within a label, not total agent thinking/tool time. Summed SDK ms may count nested service work twice. The slowest SDK call and the phase sums from all traced calls in that label identify where time was spent; ordinary command execution has no daemon Exec phase because the executor owns it.

| Step | Trace span ms | SDK sum ms | Slowest method | Call ms | Step daemon phases ms (inclusive) |
| --- | --- | --- | --- | --- | --- |
| 007 M1: install dependencies | 13,481.918 | 13,476.523 | sandbox.exec | 13,113.443 | sandbox.mount.bind=2.972; sandbox.mount.attach=1.451; commit=293.265; commit/capture=0.015; commit/construct=272.194 |
| 024 Cleanup: use documented docker log collection and close | 2,628.920 | 2,558.843 | sandbox.close | 1,282.923 | unreported for this step |
| 021 Acceptance: clean install test and build | 2,317.908 | 2,310.564 | sandbox.exec | 1,949.126 | sandbox.mount.bind=1.223; sandbox.mount.attach=0.800; commit=293.118; commit/capture=0.004; commit/construct=264.765 |
| 006 M1: initialize project and skeleton | 1,565.021 | 1,560.326 | project.init | 1,042.898 | commit=4.475; commit/capture=0.002; commit/construct=2.265; commit/finish=0.625; commit/publish=0.148; commit/install=0.076 |
| 020 M6: verify admin and publish final main | 1,221.451 | 1,212.597 | sandbox.exec | 1,150.444 | sandbox.mount.bind=1.779; sandbox.mount.attach=1.012; commit=5.181; commit/capture=0.006; commit/construct=2.552; commit/finish=0.781; commit/publish=0.088; commit/install=0.072 |
| 018 M5: verify and publish merged storefront | 1,131.597 | 1,123.796 | sandbox.exec | 1,065.543 | sandbox.mount.bind=1.988; sandbox.mount.attach=0.834; commit=4.881; commit/capture=0.006; commit/construct=2.387; commit/finish=0.782; commit/publish=0.072; commit/install=0.068 |
| 017 M5: build test web and merge Branches | 1,057.343 | 1,046.254 | sandbox.exec | 973.813 | sandbox.mount.bind=1.887; sandbox.mount.attach=0.892; commit=6.503; commit/capture=0.012; commit/construct=2.764; commit/finish=1.588; commit/publish=0.068; commit/install=0.072; branch.merge=9.386; branch.merge/merge.paths=4.742 |
| 016 M4: test checkout and publish orders | 925.623 | 914.093 | sandbox.exec | 844.770 | sandbox.mount.bind=2.305; sandbox.mount.attach=1.014; commit=7.475; commit/capture=0.007; commit/construct=3.037; commit/finish=1.078; commit/publish=0.117; commit/install=0.216 |
| 013 M3: test publish and fork parallel Branches | 780.381 | 772.204 | sandbox.exec | 713.471 | sandbox.mount.bind=2.496; sandbox.mount.attach=1.066; commit=1.392; commit/capture=0.004; commit/construct=0.482; commit/finish=0.037; commit/publish=0.022; commit/install=0.085 |
| 011 M2: test and publish catalog | 693.228 | 685.305 | sandbox.exec | 632.038 | sandbox.mount.bind=1.414; sandbox.mount.attach=1.341; commit=1.426; commit/capture=0.004; commit/construct=0.527; commit/finish=0.041; commit/publish=0.022; commit/install=0.087 |

### Ten slowest individual calls (diagnostic)

| Step | Method | ms | Slowest reported leaf | Leaf ms |
| --- | --- | --- | --- | --- |
| 007 M1: install dependencies | sandbox.exec | 13,113.443 | unreported | — |
| 021 Acceptance: clean install test and build | sandbox.exec | 1,949.126 | unreported | — |
| 024 Cleanup: use documented docker log collection and close | sandbox.close | 1,282.923 | unreported | — |
| 024 Cleanup: use documented docker log collection and close | sandbox.close | 1,275.920 | unreported | — |
| 020 M6: verify admin and publish final main | sandbox.exec | 1,150.444 | unreported | — |
| 018 M5: verify and publish merged storefront | sandbox.exec | 1,065.543 | unreported | — |
| 006 M1: initialize project and skeleton | project.init | 1,042.898 | unreported | — |
| 017 M5: build test web and merge Branches | sandbox.exec | 973.813 | unreported | — |
| 016 M4: test checkout and publish orders | sandbox.exec | 844.770 | unreported | — |
| 013 M3: test publish and fork parallel Branches | sandbox.exec | 713.471 | unreported | — |

## Daemon joins and per-step evidence

| Run | Distinct records | Joined trace id | Unjoined | Incomplete |
| --- | --- | --- | --- | --- |
| B | 200 | 200 | 0 | 0 |
| C | 154 | 154 | 0 | 0 |

Every workload Sandbox log was collected with stdout and stderr before removal; the observer additionally collected final live logs where possible. Each was decoded with `python3 tools/decode_observations.py --trace <run>/trace.jsonl`. Duplicate before-close/final copies are deduplicated by daemon/scope/call/slot. Decoded records preserve nullable sections and cumulative counters. The record totals above include post-run observer exchanges; workload per-step rows exclude OBS labels. `calls.csv` joins each trace id to its daemon-record count; `steps.csv` aggregates labels, method counts, timings and Commit ids. `storage.csv` joins per-Commit counters by id. The generators `analyze.py` and the raw trace/log/pages are retained in each run folder.

| Step | Calls | Trace span ms | SDK sum ms | Refusals | Daemon records | New Commit ids |
| --- | --- | --- | --- | --- | --- | --- |
| 006 M1: initialize project and skeleton | 5 | 1,565.021 | 1,560.326 | 0 | 2 | 12d8c79e34ae64 |
| 007 M1: install dependencies | 4 | 13,481.918 | 13,476.523 | 0 | 8 | 1263446dc0fadb |
| 008 M1: test and publish skeleton | 7 | 632.462 | 620.225 | 0 | 10 |  |
| 009 M2: implement catalog | 2 | 31.503 | 30.454 | 0 | 1 | 120d7e82e4218c |
| 010 M2: two Workspaces on the catalog Branch | 8 | 245.249 | 237.866 | 0 | 22 | 122f42121ee6df, 120766a35f9042 |
| 011 M2: test and publish catalog | 7 | 693.228 | 685.305 | 0 | 10 |  |
| 012 M3: implement carts and totals | 4 | 51.375 | 47.455 | 0 | 3 | 12bed21f8bc784, 12de576185b936 |
| 013 M3: test publish and fork parallel Branches | 8 | 780.381 | 772.204 | 0 | 11 |  |
| 014 M4: implement checkout orders and discounts | 5 | 57.530 | 53.079 | 0 | 4 | 1210a039317056, 129b056aba8306 |
| 015 M5: implement browser storefront | 2 | 32.157 | 30.923 | 0 | 1 | 12209e6e025c2e |
| 016 M4: test checkout and publish orders | 7 | 925.623 | 914.093 | 0 | 10 | 12ee485704ae60 |
| 017 M5: build test web and merge Branches | 6 | 1,057.343 | 1,046.254 | 0 | 9 | 1201206b5f96dc, 12d5992596c083 |
| 018 M5: verify and publish merged storefront | 7 | 1,131.597 | 1,123.796 | 0 | 10 | 128a78328dd9cd |
| 019 M6: implement admin and complete README | 4 | 47.791 | 44.304 | 0 | 3 | 127f83041d46ab, 12bc325619a75d |
| 020 M6: verify admin and publish final main | 7 | 1,221.451 | 1,212.597 | 0 | 10 | 12a5ce57f19c5a |
| 021 Acceptance: clean install test and build | 4 | 2,317.908 | 2,310.564 | 0 | 8 | 126d253c30ecce |
| 022 Acceptance: full server purchase smoke | 7 | 556.723 | 547.562 | 0 | 10 | 125302ee6cdeb3 |
| 023 Cleanup: preserve daemon logs and close Sandboxes | 3 | 29.187 | 26.953 | 0 | 2 |  |
| 024 Cleanup: use documented docker log collection and close | 2 | 2,628.920 | 2,558.843 | 0 | 0 |  |

## Bugs, skills and verification

Original A–D product bugs: **1 found, 1 fixed, 0 open**. [BUGS.md](BUGS.md) retains the complete row and subsequent closure-review finding. BUG-001 was the shared `**/` matcher requiring at least one directory. Commit `222240012` makes it match zero or more complete directory names. Three external public-API regressions failed before and passed after; rebuilt live SDK evidence includes direct children. No Store format change or restart was needed. Expected source merge conflicts are recorded as refusals and resolved, not counted as product bugs.

Phase A corrected Branch ordering and inherited heads, fs.list fields, actual read/diff/output shapes, listening server entrypoint, Docker identifier wording, and the conflict recipe. A one-sided combined resolution can still overlap; the corrected guide writes identical reviewed results on forks of both sides. Builder 1 used that recipe successfully. B exposed the automatic service Sandbox and cleanup gap; the observer verified service() and close separately and corrected the no-container wording. Observation docs now distinguish main Layers, process.list ids, unchanged snapshot shape, file revision logical bytes, and overlapping storage metadata. Builder 2 found the SDK guidance correct and requested a clearer Docker environment description. It made two local tooling errors: host-shell quoting expanded backticks before any SDK call, and log collection treated the daemon socket as an executable, failing before close. Both were inspected and corrected locally with retained evidence; they are not SDK defects. The skill now explicitly distinguishes the Docker socket/endpoint from the docker executable and explains main's synthetic null head/Layer base. The full independent report is appended verbatim.

The product fix passed Content external tests/examples (471 passed, 2 existing ignored), warning-denying scoped Clippy, scoped rustfmt, the product boundary guard and 50 boundary self-tests. Builds were performed before test execution. The first whole-workspace fmt touched an unrelated preexisting assertion; that incidental change was restored. No aggregate formatting/CI/release claim is made. Documentation updates were checked for local links, status/claim accuracy and whitespace; Rust checks were not rerun for docs-only changes. Every command/build/test had an explicit ceiling at or below 120 seconds. No live workload command reached that ceiling.

## Repository commits and production LOC

| Commit | Change | Production LOC |
| --- | --- | --- |
| 5fe9da7ec | docs(#334): verify SDK skills against live Disposable runs | Production LOC: 87532 -> 87532 (delta +0) |
| 051a19343 | docs(#334): preserve traced daemon logs before Sandbox cleanup | Production LOC: 87532 -> 87532 (delta +0) |
| 222240012 | fix(content): match zero directories in recursive globs | Production LOC: 87532 -> 87550 (delta +18) |
| 3096dde08 | docs(issue334): record verified Phase B bug and acceptance results | Production LOC: 87550 -> 87550 (delta +0) |
| d3d1a8b55 | docs(#334): close Phase B and document service cleanup and storage accounting | Production LOC: 87550 -> 87550 (delta +0) |

The report/checklist completion commit also records `Production LOC: 87550 -> 87550 (delta +0)` in its commit message; its exact id is in the final handoff and git log. Scope: core product Rust/runtime SQL plus SDK native/JS/operator; tests, docs, tooling, examples and artifacts excluded. Same pinned tools/production_loc.py counts exact first-parent and final staged trees; committed tree identity is confirmed and receipts are retained under core/target/issue334/loc-<commit>.json. Current core 85,706 + SDK 1,844 = 87,550. Reference absent (retired R9c; last counted 65,417 at tree 498dd1917812). Net product growth in this campaign is +18, entirely BUG-001.

## Retained limits and collection gaps

The C initial snapshot reconstruction is disclosed above. One Phase A group Sandbox was logged using stdout only before close, so that daemon stderr log is unavailable; its SDK trace remains, and B/C logs preserve both streams. Timings have tracing overhead, uncontrolled caches and small counts; p95 for sparse methods is often the maximum. Store file bytes exclude live WAL/OS allocation; no resident-memory or cold-cache claim is made. Main publications and mutable Branch Commits have distinct accounting. The original campaign performed no repository push, PR, main merge, release or Durable execution. Subsequent publication/merge authorization does not remove these collection limitations or authorize Durable execution.

## Subsequent closure review

The owner authorized all five closure steps after the original campaign. The
[closure record](CLOSURE.md) documents a second glob bug fixed in `02e0409cb`,
final scoped checks and a separate rebuilt live SDK proof. Final disposition
including that review is **2 bugs found, 2 fixed, 0 open**; production LOC is
87,552, a net +20 against the original main. The original timing/storage tables
above retain their original identities and are not presented as reruns on the
closure source. [EVIDENCE.md](EVIDENCE.md) links the portable checksummed archive,
manifest, stopped Store exports and the exact private-original preservation
record. The verbatim Builder 2 report below is unchanged.

## Appendix: Builder 2 REPORT.md (verbatim)

# shop-c builder report

Status: COMPLETE. All six milestones were built through the JavaScript SDK and published in the specified delivery order. Acceptance passed on the `acceptance` Branch forked from final `main`. Every Workspace was unmounted and both the explicit Bash Sandbox and automatic service Sandbox were closed after their daemon logs were preserved.

The project is stored in LayerFS. This folder contains SDK scripts, run receipts, logs, the supplied documents/runtime, and the tiny initialization seed (`.git/HEAD` only); it does not contain an editable local checkout of the store.

## Final identity

- Project: `shop-c`.
- Final main Layer: `32fdced5c175d45e682ca03f08da5be09987e61d3fbe8543873a793461ae56f3b6`.
- Published source Branch: `admin`.
- Published source Commit: `12a5ce57f19c5a1df53e10c6f03959c49e9cb1b076dcf58e80c4842ca041041105`.
- Final main root: `049f91d4a3ace5250d8d8dd61e846f39afdf1bdd1c7debb211c0d156c80ae478`.
- `project.list_branches()` reports main's `head` as null because main is represented by the published Layer; its `base` is the final main Layer above. The source Commit and Layer are both retained here to avoid ambiguity about “main head.”

## Milestones and publication

| Milestone | Implemented and checked | Published source Commit | Published main Layer |
| --- | --- | --- | --- |
| M1 | Node ES modules, Express 4, scripts, health route, error envelopes, merge rules; 1 test passed | `1263446dc0fadb5e2b8fb056158cfee9f2f9457850b94a5611f9eca8aec9f5147f` | `321f455cd5026b0aec83e8e05f780c56d0fda00cac9f7db84516d08edb1555ad93` |
| M2 | 30 products in five categories, including stock 0 and 1; sorting, filters, query validation and pagination; 2 tests passed | `120766a35f90420d3a0f04efbb117f161031a9082b39f8aebfec3f7c837271474d` | `320b0f1a7c136ed13362ea85871d9a724b05c55fc03d74a910bdd12a0571fe164f` |
| M3 | In-memory carts, merge/update/remove, stock validation, integer-cent totals and tax rounding; 5 tests passed | `12de576185b936c727beb1fd91e53026699f394303eea27d604d27bfa3aa70e99f` | `326646a919baff04824975e73032f98689e73ad3249b6b90641596d1b10cf69fcf` |
| M4 | Discount codes and checkout revalidation, serialized checkout, stock checks, persisted order snapshots; 11 tests passed | `12ee485704ae6041eeeb81328990a865bce8abe7785eef8902fb5c8773e1c2ab37` | `327c539f7b0f8ca9bf1aa430ae487adfa0acdd3f4e2756c2b2132fcfa4b1a58db2` |
| M5 | Responsive catalog, product, cart and checkout pages, esbuild assets; merged API/frontend suite: 12 tests passed and build passed | `128a78328dd9cde5956ee70c598e544ef9ec460d259fb4a1b04e4a0f53feac43e1` | `32ee8e66a6c398ecf49e44dd7ef6dfe04e9ef55e2f55a9597789e635c8acbb2db6` |
| M6 | Admin token authentication, validated create/update, newest-first orders and complete README; 14 tests passed and build passed | `12a5ce57f19c5a1df53e10c6f03959c49e9cb1b076dcf58e80c4842ca041041105` | `32fdced5c175d45e682ca03f08da5be09987e61d3fbe8543873a793461ae56f3b6` |

Every publication returned `Added` with `overwrote: []`. Detailed replies are in steps 008, 011, 013, 016, 018, and 020. Reads and no-change checks returned `UpToDate` when appropriate; no artificial Commit was expected for a message-only check.

## Branches and merges

| Branch | Fork source | Final head |
| --- | --- | --- |
| skeleton | Initial main Layer | `1263446dc0fadb5e2b8fb056158cfee9f2f9457850b94a5611f9eca8aec9f5147f` |
| catalog | Published M1 main | `120766a35f90420d3a0f04efbb117f161031a9082b39f8aebfec3f7c837271474d` |
| cart | Published M2 main | `12de576185b936c727beb1fd91e53026699f394303eea27d604d27bfa3aa70e99f` |
| orders | Published M3 main | `12ee485704ae6041eeeb81328990a865bce8abe7785eef8902fb5c8773e1c2ab37` |
| web | Published M3 main | `1201206b5f96dce5e841cb4a6222ab066f5cda91e2a78faae7d21e30ea4e64ebae` |
| storefront | `branch.merge(orders, web, storefront)` | `128a78328dd9cde5956ee70c598e544ef9ec460d259fb4a1b04e4a0f53feac43e1` |
| admin | Published M5 main | `12a5ce57f19c5a1df53e10c6f03959c49e9cb1b076dcf58e80c4842ca041041105` |
| acceptance | Final published main | `125302ee6cdeb335ce4185b0829db6ece65ac128e4a44c5f324f7133750327347c` |

M4 and M5 alternated exactly as steps 014 (`orders` implementation), 015 (`web` implementation), 016 (`orders` tests/publication), and 017 (`web` build/tests and combination).

There were two merges in this run:

1. Step 010, implicit Commit merge on `catalog`: two Workspaces were mounted at the same head (`120d7e82e4218cc8762458e1ae9399fab976ccb744ecb870ae10a15f3ba552fd1e`). The first changed `data/products.json` and committed `122f42121ee6df8559041356855de8e68ecc8634a71f88ff9800f9788bb6a04aa0`. The second changed `test/catalog.test.js`; its Commit merged the moved head and produced `120766a35f90420d3a0f04efbb117f161031a9082b39f8aebfec3f7c837271474d`, with `merged.from` equal to the original mount head and `merged.head` equal to the first Workspace Commit. Both changes survived. No conflicts or LWW decisions.
2. Step 017, explicit `branch.merge('orders','web','storefront',...)`: returned `Merged`, `fastForward: false`, head `12d5992596c08323dc53df8529728d37530b453823c49791845b38d531086049ca`, common base `326646a919baff04824975e73032f98689e73ad3249b6b90641596d1b10cf69fcf`, `conflicts: []`, `lww: []`. The original Branches were preserved. The result was tested and built before publication in step 018.

There were no conflict refusals, so no conflict resolution was necessary. The root `.lww` contained `%include .gitignore` from the first project write. No source file was put under LWW, and no changes were discarded or force-overwritten.

## Acceptance evidence

Step 021 mounted a fresh Workspace of `acceptance`, forked from final main. It removed only generated `node_modules` and `dist`, then ran this one Bash call:

```sh
rm -rf node_modules dist && timeout 70 npm install --no-audit --no-fund && timeout 15 npm test && timeout 15 npm run build
```

Result: exit 0; 71 packages installed; 14 tests passed, 0 failed; frontend build passed. The web test builds its assets so `npm test` also works before a separate build in a clean checkout. The Workspace was committed (`126d253c30ecced61dd19feb644fea377b9e8aca9c784c9ff8a10564fba013a378`) and unmounted. This verifies clean installation rather than relying on the dependency tree retained by LayerFS. The npm cache was not declared cold; no performance claim is made from this run.

Step 022 mounted another fresh Workspace of `acceptance` and ran a single bounded Node smoke command. It started `src/main.js` on `PORT=0`, checked `/health`, created a cart, added `mug-classic`, checked out, fetched the order by id and compared it, then terminated the server and observed exit 0. Result: `smoke: PASS`, order `038c4428-b0b2-4f14-8d9f-c36f90ade184`, total `1350` cents. The runtime data writes were committed only on `acceptance` (`125302ee6cdeb335ce4185b0829db6ece65ac128e4a44c5f324f7133750327347c`) and the Workspace unmounted. Final main retains the original seed stock and has no smoke order.

The README was read back from main in step 022 and documents installation, start/PORT, tests, build, admin token and API/storage behavior. The web coverage verifies all pages, CSS and JavaScript return HTTP 200; no graphical browser interaction or visual screenshot campaign was run.

## Refusals, failures and surprises

No LayerFS SDK call was refused, uncertain, retried automatically, or failed. No LayerFS, SDK or skill code was edited. No helper CLI or wrapper library was added.

- Step 004 was a local script-creation failure: incorrect shell quoting around an embedded heredoc allowed text containing backticks to be interpreted by the host shell. Host `npm start`, `npm test`, and `npm run build` attempts reported missing scripts, and zsh reported a glob error. No SDK method was reached and no project was created by that failed invocation. Step 005 checked that the intended script/state/seed did not exist. I changed to direct local script-file editing and performed the actual initialization in step 006. This was builder tooling misuse, not an SDK refusal; the failure is retained in `004-local-shell-failure.out`.
- Step 023, daemon-log preservation: I incorrectly treated `LAYERFS_DOCKER` as a Docker executable path. It was `/var/run/docker.sock`, so Node's `spawn` failed with `EACCES` before either Sandbox close call. The exact evidence is retained in `023-cleanup.out`. Step 024 used the skill's literal `docker logs <id-without-sb_>` form, collected both logs successfully, and closed both Sandboxes. No product operation was replayed.
- Repeated builds produced filesystem changes visible to LayerFS, so later passing build/test steps could still produce `Committed` replies. These outputs were retained, as required.
- `project.list_branches()` reports main with a Layer in `base` and `head: null`, even after publication. This is handled by reporting the publication Layer and source Commit explicitly.

Skill feedback: the documented SDK methods, fixed-at-mount views, Commit merging and cleanup behavior matched the run. No incorrect SDK guidance was found. The environment-variable overview could be clearer that `LAYERFS_DOCKER` is a daemon socket/endpoint rather than a CLI executable; the explicit log-collection instruction itself was correct.

## Cleanup and receipts

The explicit Bash Sandbox was `sb_7aedac1889797bde15f36fed15acff5b87c6395db09e7ddc38e28753c5b29ace`; the automatic service Sandbox was `sb_e122de4a9017e2f3c37d2f9dbcb44580d7ad68a8dd912414440709706bd93e4b`. Step 024 returned `Closed` for both, after successful log collection. No mounted Workspace remained; close would otherwise have refused `MountsActive`.

Primary receipts: `021-clean-acceptance.out`, `022-smoke.out`, `024-cleanup.out`, `final-branches.json`, `final-admin-history.json`, `cleanup.json`, numbered SDK scripts/outputs, and both `daemon-sb_*.log` files. All commands were launched from the assigned builder folder with `source ./env.sh`, a numbered trace label, and an outer process-group wall cap of 115 seconds. Sandbox installs/builds/tests/smoke had explicit inner timeouts. No Git commits were made by the builder.
