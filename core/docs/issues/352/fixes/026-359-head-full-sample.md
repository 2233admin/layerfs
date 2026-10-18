# #359 · every cost case and the remaining test targets on the current head

| | |
| --- | --- |
| Trigger | User, 2026-10-18: "run every cost case once on the current head (one per command, under 2 minutes each) and the remaining daemon, fuse and SDK test targets, then report old vs new against native and targets" |
| Kind | measurement and test run only. No product change |
| Head | `issue359-impl` `2d84fe1bb`. Its product source is identical to `4db0ceb9e` (§4.8 option A); later commits are docs only |
| Binaries | daemon `cc185d13`, addon `66d774c8` (release, `--locked --offline`, pinned under `core/target/issue359-impl/`, registered in `binaries.json` as `head-live-rows`). Old: baseline `d7ae4806` (`ee7e0fc51`); previous arms batch 2 `e720bcad`, A1 `4393a8e4`, F-A4 `755ea77b` |
| Samples | `cost.mjs case <id> --binary cc185d13 --label head`, ledger seq 323–399: 39 commands, each its own command under a 115 s alarm, and every one `COMPLETE`. vitest, grep-r and cp-rm-nm ran `--part native` and `--part lfs` as two commands each. Table: `~/lfs-history/runs/issue359/table-head.json` |
| Status | **sampled and tested at the head.** Not pushed |

## Conditions

- **Cache state:** as `cost.mjs` declares it:
  - `cold` is the first run in a fresh Workspace on a fresh daemon;
  - `steady` is the same Workspace run again;
  - `native` is a page-cache-resident copy of the tree.

  The Store file is page-cache resident in every arm (declared, not
  controlled), so wall times are warm-Store diagnostics (AGENTS §1). Count
  comparisons are exact.
- **One sample per arm**, with no retry and no best-of.
- **Interference:** host load (1 min) 13.7 at the start, then 4.5–11.2.
  Two non-#359 containers, `layerfs-issue352-scale-s4-a/b`, ran
  throughout.
- **Budget:** these cases went over 15 s and ran under the #359 scoped
  exception, "each case runs in its own command, under 2 minutes"
  (RCA §10). Times from the ledger:

  | Case | Command time |
  | --- | ---: |
  | pnpm-first | 36.2 s |
  | find | 16.9 s |
  | grep-r lfs | 39.4 s |
  | du-s | 25.7 s |
  | cp-rm-nm lfs | 53.5 s |
  | rm-rf-nm | 30.4 s |

  Every other case was under 15 s.
- **Not measured:** memory (the cases record no RSS) and storage size.
  Mount time (target ≤10 ms) has no case of its own in this set.

## Old vs new against native and targets

"Previous" is the latest earlier arm that sampled the case. Native is the
head sample's own native part. The count columns run baseline → head; `=`
means unchanged.

| Group | Case / step | Native ms | Baseline ms | Previous ms | **Head ms** | Head × native | Target | Store statements | Reader requests | LOOKUP | Owner jobs |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |
| exec | node-require / cold | 30 | 127 | b2 179 | **347** | 12× | ≤1.3× **miss** | 2,020 → 1,125 | = | = | = |
| exec | node-require / steady | 26 | 36 | b2 37 | **42** | 1.6× | ≤1.3× **miss** | = | = | = | = |
| exec | pnpm-first / cold | 4,427 | 17,290 | b2 9,948 | **11,592** | 2.6× |  | 3,585 → 2,491 | = | 57,751 → 53,644 | 398,536 → 396,323 |
| exec | pnpm-first / commit-after-install | — | 14,498 | b2 14,277 | **16,113** | — | ≤5 s **miss** | 21 → 19 | = | = | = |
| exec | pnpm-reinstall / cold | 1,446 | 2,666 | b2 3,206 | **2,503** | 1.7× |  | 47,193 → 25,276 | 22,012 → 22,061 | 4,641 → 4,638 | 16,988 → 16,978 |
| exec | pnpm-reinstall / steady | 550 | 589 | b2 598 | **639** | 1.2× |  | 1,780 → 1,027 | = | 219 → 198 | 1,550 → 1,529 |
| exec | tsc-b / cold | 211 | 563 | b2 709 | **620** | 2.9× | ≤1.3× **miss** | 6,777 → 4,407 | = | = | = |
| exec | tsc-b / steady | 220 | 274 | b2 284 | **282** | 1.3× | ≤1.3× met | 56 → 10 | 44 → 27 | 3.0 → 0.0 | 1,260 → 1,254 |
| exec | vitest / cold | 1,870 | 5,217 | A1 2,717 | **2,625** | 1.4× | ≤1.3× **miss** | 17,065 → 10,898 | 7,997 → 7,707 | 19,767 → 1,723 | 41,827 → 23,852 |
| exec | vitest / steady | 1,982 | 3,077 | A1 3,146 | **2,308** | 1.2× | ≤1.3× met | 7,576 → 4,886 | 3,528 → 3,229 | 18,627 → 2.0 | 39,607 → 20,853 |
| git | git / add | 11 | 175 | b2 141 | **162** | 15× |  | 65 → 49 | = | 298 → 12 | 3,412 → 3,126 |
| git | git / commit | 20 | 54 | b2 55 | **55** | 2.8× |  | 446 → 240 | 228 → 223 | 181 → 102 | 880 → 808 |
| git | git / status-cold | 141 | 505 | b2 685 | **627** | 4.5× | ≤1.3× **miss** | 18,004 → 13,003 | 8,986 → 8,987 | 2,427 → 2,368 | 7,125 → 7,066 |
| git | git / status-steady | 8.3 | 151 | b2 132 | **154** | 18× | ≤1.3× **miss** | = | = | 324 → 1.0 | 3,432 → 3,109 |
| walk | du-s / cold | 148 | 22,955 | F-A4 12,986 | **15,314** | 104× | ≤3–5× **miss** | 443,969 → 231,096 | = | = | = |
| walk | du-s / steady | 143 | 4,980 | F-A4 3,346 | **3,782** | 26× | ≤3–5× **miss** | 77,143 → 40,153 | = | = | = |
| walk | find / cold | 158 | 5,972 | A1 3,874 | **4,661** | 29× | ≤3–5× **miss** | 76,087 → 39,634 | = | = | = |
| walk | find / steady | 69 | 5,268 | A1 3,464 | **2,675** | 39× | ≤3–5× **miss** | 75,794 → 39,611 | = | = | = |
| walk | grep-r / cold | 642 | 34,022 | F-A4 21,976 | **23,050** | 36× | ≤3–5× **miss** | 528,440 → 264,741 | 259,063 → 259,065 | = | 267,384 → 266,386 |
| walk | grep-r / steady | 621 | 22,629 | F-A4 12,877 | **13,527** | 22× | ≤3–5× **miss** | 459,385 → 251,984 | 240,960 → 240,845 | 999 → 0.0 | 218,197 → 217,326 |
| walk | ls-r / cold | 10 | 582 | A1 488 | **614** | 60× | ≤3–5× **miss** | 9,573 → 5,694 | = | = | = |
| walk | ls-r / steady | 8.1 | 277 | A1 436 | **282** | 35× | ≤3–5× **miss** | = | = | = | = |
| tree | cp-rm-nm / cp | 1,520 | 53,155 | A1 46,090 | **40,094** | 26× |  | 471,079 → 226,325 | 237,977 → 237,979 | 93,446 → 93,445 | 615,991 → 611,626 |
| tree | cp-rm-nm / rm-created | 509 | 10,053 | A1 12,026 | **10,588** | 21× |  | = | = | 12,500 → 8,813 | 208,793 → 205,105 |
| tree | rm-rf-nm / rm-committed | 574 | 27,592 | A1 23,566 | **22,255** | 39× | ~3 s **miss** | 403,405 → 206,621 | = | = | = |
| lifecycle | first-open / cold | 1.5 | 3.1 | — | **7.1** | 4.8× |  | 41 → 38 | = | = | = |
| lifecycle | first-open / steady | 1.2 | 1.5 | — | **1.9** | 1.5× |  | = | = | = | = |
| lifecycle | first-stat / cold | 1.3 | 2.1 | — | **4.4** | 3.3× |  | 16 → 13 | = | = | = |
| lifecycle | first-stat / steady | 1.3 | 1.1 | — | **1.5** | 1.1× |  | = | = | = | = |
| lifecycle | first-stat-deep / cold | 1.2 | 11 | — | **11** | 9.7× |  | 183 → 104 | = | = | = |
| lifecycle | first-stat-deep / steady | 1.2 | 1.6 | — | **1.5** | 1.2× |  | = | = | = | = |
| lifecycle | merge / merge.merge | — | 17 | — | **14** | — |  | = | = | = | = |
| lifecycle | small-commit / commit | — | 18 | F-A4 17 | **19** | — | ≤5 ms **miss** | 44 → 42 | = | = | = |
| lifecycle | small-commit / edit | — | 3.3 | F-A4 4.3 | **3.2** | — |  | 84 → 63 | = | = | = |
| scale-folder | folder-100-ls / cold | 4.5 | 43 | — | **26** | 5.8× |  | 820 → 410 | = | = | = |
| scale-folder | folder-100-ls / steady | 2.1 | 3.1 | — | **3.3** | 1.6× |  | = | = | = | = |
| scale-folder | folder-100-stat / cold | 1.1 | 2.7 | — | **2.9** | 2.6× |  | 23 → 12 | = | = | = |
| scale-folder | folder-100-stat / steady | 1.1 | 1.1 | — | **1.5** | 1.3× |  | = | = | = | = |
| scale-folder | folder-1000-ls / cold | 5.2 | 398 | — | **238** | 46× |  | 8,116 → 4,059 | = | = | = |
| scale-folder | folder-1000-ls / steady | 5.8 | 10 | — | **11** | 2.0× |  | = | = | = | = |
| scale-folder | folder-1000-stat / cold | 1.2 | 3.4 | — | **4.2** | 3.4× |  | 30 → 17 | = | = | = |
| scale-folder | folder-1000-stat / steady | 1.3 | 1.0 | — | **1.6** | 1.2× |  | = | = | = | = |
| scale-folder | folder-10000-ls / cold | 42 | 3,982 | A1 2,500 | **2,328** | 56× |  | 81,071 → 40,544 | = | = | = |
| scale-folder | folder-10000-ls / steady | 43 | 117 | A1 111 | **113** | 2.6× |  | 582 → 237 | = | = | = |
| scale-folder | folder-10000-stat / cold | 1.1 | 2.4 | — | **2.8** | 2.5× |  | 15 → 10 | = | = | = |
| scale-folder | folder-10000-stat / steady | 1.3 | 1.4 | — | **1.4** | 1.1× |  | = | = | = | = |
| scale-tree | tree-r14-find / cold | — | 190 | — | **176** | — |  | 3,965 → 2,829 | = | = | = |
| scale-tree | tree-r14-find / steady | — | 107 | — | **109** | — |  | = | = | = | = |
| scale-tree | tree-r14-first-stat / cold | — | 2.7 | — | **2.5** | — |  | 71 → 53 | = | = | = |
| scale-tree | tree-r14-first-stat / steady | — | 1.0 | — | **1.1** | — |  | = | = | = | = |
| scale-tree | tree-r14-small-commit / commit | — | 17 | — | **13** | — |  | 38 → 36 | = | = | = |
| scale-tree | tree-r14-small-commit / edit | — | 2.6 | — | **2.7** | — |  | 71 → 53 | = | = | = |
| scale-tree | tree-r17-find / cold | — | 5,245 | — | **3,883** | — |  | 76,155 → 39,678 | = | = | = |
| scale-tree | tree-r17-find / steady | — | 4,882 | — | **3,372** | — |  | 75,794 → 39,611 | = | = | = |
| scale-tree | tree-r17-first-stat / cold | — | 3.0 | — | **2.5** | — |  | 84 → 63 | = | = | = |
| scale-tree | tree-r17-first-stat / steady | — | 1.0 | — | **1.1** | — |  | = | = | = | = |
| scale-tree | tree-r17-small-commit / commit | — | 19 | — | **15** | — |  | 44 → 42 | = | = | = |
| scale-tree | tree-r17-small-commit / edit | — | 3.2 | — | **2.8** | — |  | 84 → 63 | = | = | = |
| scale-depth | depth-r15-first-stat / cold | — | 3.7 | — | **3.3** | — |  | 64 → 45 | = | = | = |
| scale-depth | depth-r15-first-stat / steady | — | 1.1 | — | **1.2** | — |  | = | = | = | = |
| scale-depth | depth-r16-first-stat / cold | — | 2.7 | — | **2.9** | — |  | 77 → 56 | = | = | = |
| scale-depth | depth-r16-first-stat / steady | — | 1.0 | — | **1.3** | — |  | = | = | = | = |
| scale-depth | depth-r17-first-stat / cold | — | 2.7 | — | **2.8** | — |  | 83 → 62 | = | = | = |
| scale-depth | depth-r17-first-stat / steady | — | 1.1 | — | **1.2** | — |  | = | = | = | = |
| sdk | sdk-glob / cold.sdk | — | 24 | — | **68** | — |  | 721 → 605 | = | = | = |
| sdk | sdk-glob / steady.sdk | — | 19 | — | **21** | — |  | 378 → 262 | = | = | = |
| sdk | sdk-grep / cold.sdk | — | 3,259 | — | **3,301** | — |  | 41,838 → 34,320 | = | = | = |
| sdk | sdk-grep / steady.sdk | — | 3,229 | — | **3,363** | — |  | 41,778 → 34,260 | = | = | = |
| sdk | sdk-list / cold.sdk | — | 5.3 | — | **5.4** | — |  | 92 → 76 | = | = | = |
| sdk | sdk-list / steady.sdk | — | 2.9 | — | **3.3** | — |  | 76 → 60 | = | = | = |
| sdk | sdk-read / cold.sdk | — | 2.5 | — | **2.2** | — |  | 54 → 52 | = | = | = |
| sdk | sdk-read / steady.sdk | — | 1.0 | — | **1.4** | — |  | 33 → 31 | = | = | = |

### Reading

- **Owner targets met:** 2, vitest steady (1.2×) and tsc-b steady (1.28×).
- **Missed:**
  - every walk (find, ls-r, du-s, grep-r) at 22–104× native, against
    ≤3–5×;
  - vitest cold 1.4×, tsc-b cold 2.9×, node require cold 12× and steady
    1.6×, git status 4.5× cold and 18× steady, all against ≤1.3×;
  - rm -rf of committed files 22.3 s (target ~3 s; record 025's
    round-trip floor is 7.0 s);
  - small Commit 19 ms (≤5 ms);
  - Commit after pnpm install 16.1 s (≤5 s).
- **Baseline → head, count-driven** (attributed to the batches that
  changed the counts):
  - Store statements roughly halved in every read-heavy case (A1 and
    `b83871223`);
  - missing-name LOOKUPs nearly gone in vitest (19,767 → 1,723 cold,
    18,627 → 2 steady) and in git status steady (324 → 1) (F-B4);
  - owner jobs about halved in vitest.
- **Baseline → head, wall time** (warm-Store diagnostic):
  - vitest cold 5.2 → 2.6 s;
  - rm-committed 27.6 → 22.3 s;
  - cp 53.2 → 40.1 s;
  - grep-r cold 34.0 → 23.1 s;
  - du-s cold 23.0 → 15.3 s;
  - `ls -l` of 10,000 entries cold 4.0 → 2.3 s;
  - folder-1000-ls cold 398 → 238 ms;
  - tree-r17 find cold 5.2 → 3.9 s.
- **Head vs the previous arm.** Most cases fall within single-sample
  noise at equal counts. du-s cold 13.0 → 15.3 s, find cold 3.9 → 4.7 s
  and ls-r cold 488 → 614 ms have unchanged counts, so they are not
  attributed. §4.8 changes Capture only; no walk runs a Commit.
- **Slower at equal or lower counts, not attributed** (small absolute times
  and host load; one sample each):

  | Case | Baseline | Head |
  | --- | ---: | ---: |
  | node require cold | 127 ms | 347 ms |
  | first-open cold | 3.1 ms | 7.1 ms |
  | first-stat cold | 2.1 ms | 4.4 ms |
  | sdk-glob cold | 24 ms | 68 ms |
  | Commit after pnpm install | 14.5 s | 16.1 s |

  Their counts are equal or lower. They stay open for the final-identity
  sample, and none is claimed as a regression or an improvement.

## Tests at the head

All runs were in the pinned image, with `LAYERFS_CONSTRUCTION_WORKERS=1`,
the Disposable Store and each command ≤120 s. The test build is the one
used for `4db0ceb9e` (same product source).

### Daemon targets run in this pass

| Target | Result |
| --- | --- |
| forced_producers | 4/4 pass |
| forced_smoke | 1/1 pass |
| forced_unavailable | 1/1 pass |
| forced_unmount | 3/3 pass |
| **fp21_detach_stages** | **0/2, FAILED** (finding below) |
| fp2_negotiation_flags | 3/3 pass |
| fp31_forget_underflow | 2/2 pass |
| host_handoff | 1 ignored (needs `LAYERFS_INSTALL_DAEMON_BINARY`, as before) |
| kernel_application | 1/1 pass |
| kernel_mount | 3/3 pass |
| kernel_mount_routes | 2/2 pass |
| mounted_failure_scope | 2/2 pass |
| mounted_fusectl | 1/1 pass |
| mounted_low_water | 3/3 pass |
| mounted_recognizer | 2/2 pass |
| mounted_sqlite_full | 2 pass, 2 ignored |
| mounted_store_read | 4/4 pass |
| observed_application | 8/8 pass |
| shared_cache_pressure | 1/1 pass |
| store_reader_lifecycle | 5/5 pass |
| telemetry_recording | 3/3 pass |
| concurrent_commits | 3/3 pass |
| daemon lib and bins | 0 tests |

The other 27 daemon targets passed on the same test build in record 022.
`complete_installed_roots` `huge_kernel_namespace_is_complete_after_install`
is still `NOT_RUN`: it needs a prepared `LAYERFS_Q1_PREPARED` input.

**Finding (fp21, both cases):** `bounded observation expired: the request is
inside its Store read` (`fp21_detach_stages.rs:95`).

- The test looks a file up (or opens a directory) while its Store gate is
  open, then arms the gate. It expects the following `open` or listing to
  be held inside a provider read.
- With A1 (`1d5dfafae`, merged in `9bb2be502`), the Workspace reader keeps
  the lookup's objects in `KeptReads`. The later request is then served
  without a provider call, so it never enters the gate.
- fp21 passed 2/2 before the A1 merge (record 018, batch 4).
- So the likely cause is that the test's premise ("no object cache")
  no longer holds under A1. This is inferred from source and has not been
  re-run on a pre-A1 build.
- Product behaviour under detach is not shown to be wrong. The test needs
  a stage that misses `KeptReads`, for example a name the lookup did not
  read. That is a test change, for the A1 owner (#354) or the lead to
  place.

### fuse

`layerfs-fuse`: 8/8 pass.

### SDK, the current F-020 check set, with the head binaries and runtime image `layerfs-352-runtime:node24` (`d3773b4e`)

| Script | Result |
| --- | --- |
| `trace.mjs` on / off / failure / dsh-env / start / ids / no-content / store (host, fake native) | 8/8 PASS |
| `reinit.mjs` (runtime image, head addon) | ok |
| `packaging.mjs lazy`, `packaging.mjs dispatch` (runtime image) | PASS, PASS |
| `direct_locking_real.mjs outer` | ok: 7 published, `direct.same` refused `Conflict`, 52 reads during publication with none refused, integrity ok |
| `direct_refusal_real.mjs outer` | ok: bind mount and tmpfs refused `Unsupported` |
| `daemon_host_real.mjs outer` | ok: host route works; the loopback control is refused, as the script expects |
| `exec_mount_lookup_real.mjs outer` | ok |
| `read_only_volume_real.mjs outer` | ok |

Run-script error, recorded: the first packaging attempt passed
`test/$s` with `s="packaging.mjs lazy"` unsplit under zsh, so node was given
one nonexistent file name and exited 1. Correctly invoked, both cases pass.
No test ran in that attempt.

`NOT_RUN`: the host-launched #327 scripts. These are `create_intent_real`,
`create_failure_real`, `close_busy_real`, `concurrent_unmount_real`,
`trace_real` and the 30 `run.mjs` A/B/C/S cases.

- They load the native addon on the macOS host. One attempt
  (`create_intent_real`) failed `MODULE_NOT_FOUND` for the addon.
- Since F-020 the Store route is Linux-only, and these scripts have no
  in-runtime wrapper.
- F-020's own check set left them out too.
- Moving them into the runtime image is a test change, not done here.

### Not run in this pass

- `compat.mjs`.
- fs-bench-pro, which is frozen.
- The store-service, overlay and workspace suites. They passed at
  `4db0ceb9e` (record 022), and the product source is unchanged since.

## Production LOC

98479 → 98479 (delta 0), docs only. Scope and method: `tools/production_loc.py --root` on `git archive`;
core 89797, sdk 2635, dsh 6047; reference absent (retired R9c; last counted
65,417 at tree `498dd1917812`).
