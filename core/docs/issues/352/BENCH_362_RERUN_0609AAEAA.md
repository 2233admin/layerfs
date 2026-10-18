# #362 baseline rerun on the staging head `0609aaeaa8`

> **Status:** measurement record, 2026-10-19. No product change. Compares the
> 39 `cost.mjs` commands with the #362 baseline (`2d84fe1bb`, daemon
> `cc185d13`), case by case and step by step. **Counts are the exact
> comparison; wall times are warm-Store, single-sample diagnostics**, and this
> run's host load was higher than #362's (see Conditions).

## Identity

| | |
| --- | --- |
| Source | `0609aaeaa8b8dc1d6a5c5fbb382e076bc1db7ca7`, `dsh-history-replay` ("Merge #352 staging (steps 1–15)"). It contains #362's `2d84fe1bb` and 52 later non-merge product commits in `core/crates` and `sdk/js/native` (#353, #355, #360 item 3, records 033/034, F-036, F-043, F-046, F-051, F-053, c04, E10, the 64 MiB daemon cache of record 031). **F-040 is not in this head**: the integration merge was not pushed when the run was started on the user's instruction |
| Daemon | `551b62cc07885b2cb3ad98d0ce20958fa41380a660e750570beb7002014ef740` |
| Addon | `18a569d7072eb97060481f8d0ddef7ca2fba6d618348dfe7303cb5e48b6f1f5d` |
| Build | release, `cargo +1.85.1 build --manifest-path core/Cargo.toml --release --locked --offline -j 6 -p layerfs-daemon -p layerfs-node`, run from the repository root (root `.cargo/config.toml` ARMv8 flags apply), image `layerfs-307-fuser-patch-clippy:1.85.1` (`378b799ef433`), `--network none`, worktree mounted read-only. Private volumes `layerfs-issue359-rerun-cargo-home` and `-cargo-target`, seeded from `layerfs-issue359-impl-cargo-home` and the `release/` folder of `layerfs-issue359-impl-cargo-target`. Pure build: no tests, examples or Clippy were built or run. Binaries pinned under `core/target/issue359-rerun/{daemon-551b62cc,sdk-linux-18a569d7}/` with a `SOURCE` file; registered in `~/lfs-history/runs/issue359/binaries.json` as `551b62cc` |
| Sandbox image | `sha256:d3773b4eac6a7a644887b17e36956cd1553786d47103f0170a3bb2b0ff6988de` (`layerfs-352-runtime:node24`), unchanged from #362 |
| Harness | `cost.mjs` `68f710db9018…` (#362: `3d1d215bf8fd…`). The only change since #362 is `615bf75f2`, the opt-in `--daemon fresh\|warm` arm; it was not used, and the default path is unchanged. SDK JS `bd5ce9e3db6f…` |
| Prepared input | `layerfs-issue359-prep`, byte-cloned per sample (`--setup clone`); native arm from `layerfs-issue359-native`. Both unchanged from #362 |
| Store profile | Disposable / WAL / `synchronous=OFF`, `LAYERFS_CONSTRUCTION_WORKERS=1`. Durable: `NOT_RUN`, disabled by the owner |

## How it was run

- `cost.mjs case <id> --binary 551b62cc --label rerun362 [--part native|lfs]`,
  one command per case, each under a 115 s alarm. vitest, grep-r and cp-rm-nm
  ran as `--part native` and `--part lfs`, as in #362. 39 commands, ledger
  seq 697–773 (`~/lfs-history/runs/issue359/ledger.jsonl`, appended), samples
  `samples/s697…s773-*-rerun362`. **All 39 `COMPLETE`**; native and LayerFS
  outputs agree in every compared case. No retry, no best-of, one sample each.
- Table: `~/lfs-history/runs/issue359/table-rerun362.json` (sha256 prefix
  `13cc5aad827f`), from `cost.mjs table --label rerun362 --binary 551b62cc`;
  compared with #362's `table-head.json`.
- **Cache state**, as `cost.mjs` declares it: `cold` is the first run in a
  fresh Workspace on a fresh daemon, `steady` the same Workspace again,
  `native` a page-cache-resident copy of the tree in the same container. The
  Store file is page-cache resident in every arm.

## Conditions

- **Host load (1 min) from each sample's manifest:** 6.0–8.4 for seq 697–721
  (vitest through cp-rm-nm native), comparable with #362's 4.5–13.7; then
  19.7 (cp-rm-nm lfs), 18.3 (rm-rf-nm), and 17–47 for seq 727–773 (git,
  lifecycle, sdk, folder, tree and depth cases). The source of the load was
  not ours and was not identified. Wall times from seq 723 on are not
  comparable with #362.
- **Other containers:** `layerfs-issue352-scale-s4-a/b` (as in #362), two more
  containers of the sandbox image, and 19 containers of image `091f785ba7d5`
  running for 36–39 hours. Declared, not stopped.
- **Budget:** commands over 15 s (scoped #359 exception, each under 2 min):
  pnpm-first 30.8 s, grep-r lfs 51.0 s, du-s 29.9 s, cp-rm-nm native 18.0 s,
  cp-rm-nm lfs 88.4 s, rm-rf-nm 49.9 s, sdk-grep 15.1 s.
- **¹ Cold folder rows are INELIGIBLE as cold claims.** The case's native arm
  copies `.cost` out of a setup Workspace on the same daemon (`nativeExtra`),
  and the 64 MiB daemon cache now keeps it: the cold arm shows 0 cache
  misses and 0 pack bytes (#362: 407 / 4,028 / 40,234 misses). Their counts
  and times measure a setup-warmed daemon, not a cold one (AGENTS §1). git
  `add`/`commit` are partly warmed the same way (`.git`); `status-cold` is
  not (8,484 misses against 8,545).
- **Not measured:** memory (no RSS), Store size, mount time.

## Table

Δ is new − #362. "=" means unchanged. Count columns are #362 → new (Δ).
"× native" uses each sample's own native part; #362's ratio in brackets.

| Group | Case / step | Native ms | #362 ms | **New ms** | Δ ms (Δ%) | New × native (#362) | Target | Statements #362 → new | Reader req. | LOOKUP | Owner jobs |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| exec | vitest / cold | 1,742 | 2,625 | **2,777** | +152 (+6%) | 1.59× (1.40×) | ≤1.3× miss | 10,898 → 9,759 (-1,139) | 7,707 → 6,139 (-1,568) | 1,723 → 1,725 (+2) | 23,852 → 23,478 (-374) |
| exec | vitest / steady | 1,766 | 2,308 | **2,135** | -173 (-8%) | 1.21× (1.16×) | ≤1.3× **met** | 4,886 → 0 (-4,886) | 3,229 → 0 (-3,229) | = | 20,853 → 20,229 (-624) |
| exec | tsc-b / cold | 216 | 620 | **1,070** | +450 (+73%) | 4.9× (2.9×) | ≤1.3× miss | = | = | = | = |
| exec | tsc-b / steady | 214 | 282 | **283** | +1 (+0%) | 1.32× (1.28×) | ≤1.3× miss | 10 → 0 (-10) | 27 → 0 (-27) | = | 1,254 → 1,249 (-5) |
| exec | pnpm-reinstall / cold | 1,690 | 2,503 | **2,878** | +375 (+15%) | 1.70× (1.73×) |  | 25,276 → 23,705 (-1,571) | 22,061 → 20,926 (-1,135) | 4,638 → 4,637 (-1) | 16,978 → 16,900 (-78) |
| exec | pnpm-reinstall / steady | 585 | 639 | **571** | -68 (-11%) | 0.98× (1.16×) |  | 1,027 → 0 (-1,027) | 804 → 0 (-804) | = | 1,529 → 1,373 (-156) |
| exec | pnpm-first / cold | 4,246 | 11,592 | **11,812** | +220 (+2%) | 2.8× (2.6×) |  | = | = | 53,644 → 53,678 (+34) | 396,323 → 396,726 (+403) |
| exec | pnpm-first / commit-after-install | — | 16,113 | **10,341** | -5,772 (-36%) | — | ≤5 s miss | = | — | — | — |
| exec | node-require / cold | 27.3 | 347 | **139** | -208 (-60%) | 5.1× (11.6×) | ≤1.3× miss | = | = | = | = |
| exec | node-require / steady | 25.2 | 41.8 | **46.4** | +4 (+11%) | 1.85× (1.63×) | ≤1.3× miss | = | = | = | = |
| walk | find / cold | 94.2 | 4,661 | **4,472** | -189 (-4%) | 47.5× (29.4×) | ≤3–5× miss | 39,634 → 38,949 (-685) | 35,846 → 35,664 (-182) | = | 50,970 → 50,968 (-2) |
| walk | find / steady | 86.9 | 2,675 | **2,354** | -321 (-12%) | 27.1× (38.6×) | ≤3–5× miss | 39,611 → 0 (-39,611) | 36,198 → 0 (-36,198) | = | 50,757 → 43,710 (-7,047) |
| walk | ls-r / cold | 11.5 | 614 | **544** | -70 (-11%) | 47.2× (60.5×) | ≤3–5× miss | = | = | = | = |
| walk | ls-r / steady | 9.8 | 282 | **287** | +5 (+2%) | 29.4× (34.9×) | ≤3–5× miss | = | = | = | = |
| walk | grep-r / cold | 664 | 23,050 | **28,575** | +5,525 (+24%) | 43.1× (35.9×) | ≤3–5× miss | 264,741 → 260,665 (-4,076) | 259,065 → 257,320 (-1,745) | = | 266,386 → 266,360 (-26) |
| walk | grep-r / steady | 639 | 13,527 | **19,438** | +5,911 (+44%) | 30.4× (21.8×) | ≤3–5× miss | 251,984 → 247,470 (-4,514) | 240,845 → 238,577 (-2,268) | = | 217,326 → 217,313 (-13) |
| walk | du-s / cold | 130 | 15,314 | **20,476** | +5,162 (+34%) | 157.4× (103.7×) | ≤3–5× miss | 231,096 → 227,717 (-3,379) | 219,557 → 218,284 (-1,273) | = | 139,834 → 139,822 (-12) |
| walk | du-s / steady | 131 | 3,782 | **3,214** | -568 (-15%) | 24.5× (26.4×) | ≤3–5× miss | 40,153 → 14,828 (-25,325) | 36,476 → 13,984 (-22,492) | = | 50,756 → 46,503 (-4,253) |
| tree | cp-rm-nm / cp | 1,659 | 40,094 | **68,799** | +28,705 (+72%) | 41.5× (26.4×) |  | 226,325 → 223,249 (-3,076) | 237,979 → 235,791 (-2,188) | 93,445 → 93,449 (+4) | 611,626 → 611,585 (-41) |
| tree | cp-rm-nm / rm-created | 577 | 10,588 | **11,968** | +1,380 (+13%) | 20.7× (20.8×) |  | = | = | 8,813 → 13,414 (+4,601) | 205,105 → 209,706 (+4,601) |
| tree | rm-rf-nm / rm-committed | 856 | 22,255 | **41,789** | +19,534 (+88%) | 48.8× (38.8×) | ~3 s miss | 206,621 → 203,324 (-3,297) | 199,262 → 198,061 (-1,201) | = | 289,727 → 289,713 (-14) |
| git | git / status-cold | 142 | 627 | **749** | +122 (+20%) | 5.3× (4.5×) | ≤1.3× miss | 13,003 → 12,890 (-113) | 8,987 → 8,927 (-60) | = | 7,066 → 7,054 (-12) |
| git | git / status-steady | 8.9 | 154 | **172** | +18 (+12%) | 19.5× (18.4×) | ≤1.3× miss | = | = | = | = |
| git | git / add | 9.4 | 162 | **171** | +9 (+6%) | 18.3× (14.6×) |  | 49 → 30 (-19) | 19 → 2 (-17) | = | 3,126 → 3,123 (-3) |
| git | git / commit | 18.8 | 55.4 | **56.2** | +1 (+1%) | 3.0× (2.8×) |  | 240 → 0 (-240) | 223 → 0 (-223) | = | 808 → 764 (-44) |
| lifecycle | first-stat / cold | 4.1 | 4.4 | **15.2** | +11 (+248%) | 3.7× (3.3×) |  | = | = | = | = |
| lifecycle | first-stat / steady | 1.9 | 1.5 | **1.9** | +1 (+29%) | 1.02× (1.10×) |  | = | = | = | = |
| lifecycle | first-stat-deep / cold | 6.4 | 11.2 | **35.9** | +25 (+220%) | 5.6× (9.7×) |  | = | = | = | = |
| lifecycle | first-stat-deep / steady | 5.7 | 1.5 | **4.0** | +3 (+170%) | 0.70× (1.18×) |  | = | = | = | = |
| lifecycle | first-open / cold | 1.3 | 7.1 | **3.3** | -4 (-54%) | 2.6× (4.8×) |  | = | = | = | = |
| lifecycle | first-open / steady | 1.2 | 1.9 | **1.3** | -1 (-31%) | 1.12× (1.50×) |  | = | = | = | = |
| lifecycle | small-commit / edit | — | 3.2 | **2.9** | = (-7%) | — |  | = | = | = | = |
| lifecycle | small-commit / commit | — | 19.3 | **10.2** | -9 (-47%) | — | ≤5 ms miss | 42 → 46 (+4) | — | — | — |
| lifecycle | merge / merge.merge | — | 14.1 | **9.7** | -4 (-31%) | — |  | = | — | — | — |
| sdk | sdk-read / cold.sdk | — | 2.2 | **12.4** | +10 (+465%) | — |  | = | — | — | — |
| sdk | sdk-read / steady.sdk | — | 1.4 | **2.4** | +1 (+77%) | — |  | = | — | — | — |
| sdk | sdk-list / cold.sdk | — | 5.4 | **5.9** | +1 (+10%) | — |  | = | — | — | — |
| sdk | sdk-list / steady.sdk | — | 3.3 | **3.1** | = (-8%) | — |  | = | — | — | — |
| sdk | sdk-glob / cold.sdk | — | 68.1 | **26.1** | -42 (-62%) | — |  | = | — | — | — |
| sdk | sdk-glob / steady.sdk | — | 20.8 | **19.8** | -1 (-5%) | — |  | = | — | — | — |
| sdk | sdk-grep / cold.sdk | — | 3,301 | **3,330** | +29 (+1%) | — |  | = | — | — | — |
| sdk | sdk-grep / steady.sdk | — | 3,363 | **8,446** | +5,083 (+151%) | — |  | = | — | — | — |
| scale-folder | folder-100-ls / cold ¹ | 3.1 | 26.1 | **14.6** | -11 (-44%) | 4.8× (5.8×) |  | 410 → 0 (-410) | 407 → 0 (-407) | = | 213 → 112 (-101) |
| scale-folder | folder-100-ls / steady | 2.4 | 3.3 | **3.5** | = (+5%) | 1.46× (1.61×) |  | = | = | = | = |
| scale-folder | folder-100-stat / cold ¹ | 1.4 | 2.9 | **1.9** | -1 (-33%) | 1.36× (2.6×) |  | 12 → 0 (-12) | 10 → 0 (-10) | = | 8 → 6 (-2) |
| scale-folder | folder-100-stat / steady | 1.4 | 1.5 | **1.2** | = (-15%) | 0.91× (1.29×) |  | = | = | = | = |
| scale-folder | folder-1000-ls / cold ¹ | 6.5 | 238 | **228** | -10 (-4%) | 35.3× (46.0×) |  | 4,059 → 0 (-4,059) | 4,028 → 0 (-4,028) | = | 2,041 → 1,040 (-1,001) |
| scale-folder | folder-1000-ls / steady | 7.4 | 11.4 | **10.8** | = (-5%) | 1.45× (1.97×) |  | = | = | = | = |
| scale-folder | folder-1000-stat / cold ¹ | 1.4 | 4.2 | **2.5** | -2 (-41%) | 1.75× (3.4×) |  | 17 → 0 (-17) | 12 → 0 (-12) | = | 8 → 6 (-2) |
| scale-folder | folder-1000-stat / steady | 1.3 | 1.6 | **1.3** | -1 (-20%) | 0.95× (1.21×) |  | = | = | = | = |
| scale-folder | folder-10000-ls / cold ¹ | 43.2 | 2,328 | **1,346** | -982 (-42%) | 31.1× (55.7×) |  | 40,544 → 0 (-40,544) | 40,234 → 0 (-40,234) | = | 20,321 → 10,322 (-9,999) |
| scale-folder | folder-10000-ls / steady | 48.9 | 113 | **104** | -9 (-8%) | 2.1× (2.6×) |  | 237 → 0 (-237) | 129 → 0 (-129) | = | = |
| scale-folder | folder-10000-stat / cold ¹ | 1.3 | 2.8 | **1.9** | -1 (-33%) | 1.46× (2.5×) |  | 10 → 0 (-10) | 6 → 0 (-6) | = | 7 → 6 (-1) |
| scale-folder | folder-10000-stat / steady | 1.8 | 1.4 | **1.3** | = (-2%) | 0.75× (1.07×) |  | = | = | = | = |
| scale-tree | tree-r14-first-stat / cold | — | 2.5 | **2.9** | = (+15%) | — |  | = | = | = | = |
| scale-tree | tree-r14-first-stat / steady | — | 1.1 | **1.1** | = (-0%) | — |  | = | = | = | = |
| scale-tree | tree-r14-find / cold | — | 176 | **205** | +29 (+16%) | — |  | = | = | = | = |
| scale-tree | tree-r14-find / steady | — | 109 | **110** | +1 (+1%) | — |  | = | = | = | = |
| scale-tree | tree-r14-small-commit / edit | — | 2.7 | **3.0** | = (+9%) | — |  | = | = | = | = |
| scale-tree | tree-r14-small-commit / commit | — | 13.3 | **7.4** | -6 (-44%) | — |  | 36 → 38 (+2) | — | — | — |
| scale-tree | tree-r17-first-stat / cold | — | 2.5 | **3.6** | +2 (+48%) | — |  | = | = | = | = |
| scale-tree | tree-r17-first-stat / steady | — | 1.1 | **1.1** | = (-1%) | — |  | = | = | = | = |
| scale-tree | tree-r17-find / cold | — | 3,883 | **5,103** | +1,220 (+31%) | — |  | 39,678 → 38,993 (-685) | 35,848 → 35,666 (-182) | = | 50,971 → 50,969 (-2) |
| scale-tree | tree-r17-find / steady | — | 3,372 | **2,671** | -701 (-21%) | — |  | 39,611 → 0 (-39,611) | 36,198 → 0 (-36,198) | = | 50,757 → 43,710 (-7,047) |
| scale-tree | tree-r17-small-commit / edit | — | 2.8 | **3.6** | +1 (+27%) | — |  | = | = | = | = |
| scale-tree | tree-r17-small-commit / commit | — | 15.2 | **10.9** | -4 (-28%) | — |  | 42 → 46 (+4) | — | — | — |
| scale-depth | depth-r15-first-stat / cold | — | 3.3 | **3.1** | = (-8%) | — |  | = | = | = | = |
| scale-depth | depth-r15-first-stat / steady | — | 1.2 | **1.1** | = (-8%) | — |  | = | = | = | = |
| scale-depth | depth-r16-first-stat / cold | — | 2.9 | **2.9** | = (+0%) | — |  | = | = | = | = |
| scale-depth | depth-r16-first-stat / steady | — | 1.3 | **1.0** | = (-20%) | — |  | = | = | = | = |
| scale-depth | depth-r17-first-stat / cold | — | 2.8 | **3.0** | = (+8%) | — |  | = | = | = | = |
| scale-depth | depth-r17-first-stat / steady | — | 1.2 | **1.3** | = (+7%) | — |  | = | = | = | = |

Writer-side Store statements (not a #362 column) for the Commit rows:
commit-after-install 103,732 → 59,616 (−44,116); small-commit 114 → 103;
tree-r14 small-commit 100 → 89; tree-r17 small-commit 114 → 103; merge
121 → 183 (+62).

## Owner targets

| Target | #362 | This run | Verdict |
| --- | --- | --- | --- |
| vitest steady ≤1.3× | 1.16× | 1.21× | **met** (still) |
| tsc -b steady ≤1.3× | 1.28× | 1.32× | miss by wall time; Store reads 10 → 0, owner jobs 1,254 → 1,249, so not a count regression |
| vitest cold ≤1.3× | 1.40× | 1.59× | miss |
| tsc -b cold ≤1.3× | 2.9× | 4.9× | miss; counts identical, the wall change is load |
| node require ≤1.3× cold / steady | 11.6× / 1.6× | 5.1× / 1.8× | miss; counts identical in both arms |
| git status ≤1.3× cold / steady | 4.5× / 18× | 5.3× / 19.5× | miss |
| walks ≤3–5× (find, ls -R, du -s, grep -r) | 22–104× | 24–157× | miss |
| rm -rf committed ~3 s | 22.3 s | 41.8 s | miss; counts within 2% of #362, load 18 at start |
| small Commit ≤5 ms | 19.3 ms | 10.2 ms | miss, −47% |
| Commit after pnpm install ≤5 s | 16.1 s | 10.3 s | miss, −36%; writer statements −43% |

**Newly met: none.** vitest steady stays met; tsc -b steady goes from met
(1.28×) to a 1.32× miss on wall time with lower counts.

## Reading, by counts

1. **Steady arms read nothing from the Store.** vitest, tsc -b,
   pnpm-reinstall, find, tree-r17 find and git commit go to 0 Store
   statements and 0 reader requests in the steady arm; du -s steady
   40,153 → 14,828. This is the 64 MiB daemon cache (record 031, owner
   decision) holding what 8 MiB evicted. find steady also drops owner jobs
   50,757 → 43,710 (−7,047, equal to the cold arm's LOOKUP count). Steady
   wall times move by −21% to +2%: on this host the steady walks are
   dominated by FUSE requests and owner jobs, which did not change.
2. **Cold arms are essentially unchanged.** Store statements fall 1–15%
   (vitest −1,139, pnpm-reinstall −1,571, find −685, grep -r −4,076,
   du -s −3,379, rm -rf −3,297, cp −3,076). LOOKUP, GETATTR and owner jobs
   are equal to #362 within a few units. The cold read path and the kernel
   request volume behind the walk, rm -rf and cp misses are where #362 left
   them; none of the staging steps targets them.
3. **Commit construction is cheaper.** Commit after install: writer
   statements −43% and wall 16.1 → 10.3 s (records 033/034); small Commits
   19 → 10 ms with 11 fewer writer statements but 4 more reader statements
   (42 → 46). The merge case writes 62 more statements (121 → 183), the
   #355 scratch-record merge; its wall time is 14 → 9.7 ms.
4. **One count regression: rm of a created tree.** cp-rm-nm `rm-created`
   LOOKUP 8,813 → 13,414 (+4,601) and owner jobs 205,105 → 209,706 (+4,601),
   one extra LOOKUP and job per 4,601 entries; Store statements stay 0. Not
   diagnosed here; flagged for #356.

## Reading, by wall time (diagnostic only)

From seq 723 on the host load was 18–47 against #362's 4.5–13.7, so the
slower rows there (cp 68.8 s, rm -rf 41.8 s, sdk-grep steady 8.4 s,
first-stat cold 15 ms) come with unchanged counts and are not evidence of a
regression. In the comparable first half (load 6–8): vitest steady −8%,
pnpm-reinstall steady −11%, find steady −12%, ls -R cold −11%; tsc -b cold
+73% and grep -r +24–44% with unchanged or lower counts, which a single
sample under shared load cannot attribute.

## Not run, and gaps

- F-040 is not in this head; a rerun on the head that includes it is
  needed for a complete "all fixes" comparison.
- Cold folder rows (¹) need a native arm that does not read through the
  same daemon before they compare as cold again (harness change, not made
  here).
- No tests were built or run (owner instruction: pure build).
- Memory, Store size and mount time are not measured by these cases.
- Build volumes `layerfs-issue359-rerun-cargo-home` and
  `layerfs-issue359-rerun-cargo-target` are kept as the build cache of
  this record; they can be released when no rerun on this head is pending.
