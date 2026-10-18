# #359 · warm daemon: a fresh Workspace on a daemon that already served one

| | |
| --- | --- |
| Trigger | Owner, via the #352 liaison, 2026-10-18: "make a fresh Workspace on a warm daemon (same project) fast, with a bounded, daemon-wide cache of committed immutable content, and prove it with measurement" |
| Kind | measurement arm (harness) and two prototypes: a budget setting (a) and a Store-wide shared pack tier (b). No Store format change |
| Branch | `claude/issue359-warm-daemon-cache-0d14ff`, based on `46e17bdf3` (`issue359-impl` line; product source = `2d84fe1bb`). Not merged anywhere; integration is the owner's decision |
| Commits | harness `615bf75f2`; (a) 32 MiB `8bc399ce1`, 64 MiB `276138ea3`; (b) `a09854c0c`; (a)+(b) `a82efb484`; this record and docs: the commit that adds it |
| Binaries | release, `--locked --offline -j 6`, image `layerfs-307-fuser-patch-clippy:1.85.1` (`378b799ef433`), pinned under `core/target/issue359-warm/` with a `SOURCE` file each, registered in `~/lfs-history/runs/issue359/binaries.json`. base: daemon `cc185d13` / addon `66d774c8` (record 026's head build; my rebuild of `615bf75f2` produced the same bytes). a32: `42c19a39` / `3ad548df`. a64: `42c19a39` / `6ae65f16` (id `w64-6ae65f16`; the daemon does not use its own default, the budget is the addon's setup). b32: `afeb92f6` / `ea7bb1dc`. a64+b32: `ecf5dea6` / `b65ef9f6` |
| Status | **prototyped and measured; final budget is the owner's decision.** Not pushed at the time of writing |

## Cache state and conditions

- **Arms** (`cost.mjs --daemon`, see COST_MODEL):
  - *cold*: the first Workspace on a daemon that has served none (`--daemon fresh`, LayerFS part only).
  - *steady*: that Workspace again.
  - *warm-daemon*: W1 mounts, runs the case once, unmounts discarded (unmeasured); a fresh W2 on the same Branch and daemon runs it once and is measured.
  - Each arm is labeled on its own. The warm-daemon arm never credits or replaces cold (AGENTS §1).
- **Store file:** page-cache resident in every arm after the volume clone (declared, not controlled). Wall times are warm-Store diagnostics; counts are exact.
- **Record 026 difference:** its `--part all` cold arm followed a native setup mount on the same daemon, so its small-case cold times were partly warm (first stat 4.4 ms there, 35.9 ms here on a truly fresh daemon at base).
- **One sample per arm**, no retry, no best-of. Each case ran as its own command under a 115 s alarm; every sample is COMPLETE.
- **Interference (one-minute host load, other activity):**

  | Arm | Load | Concurrent activity |
  | --- | --- | --- |
  | base | 11–23 | `scale-s4-a/b`; #359-impl and #360 builds |
  | a32 | 13–20 | `scale-s4-a/b`; #360 item-3 samples (`layerfs-issue360-i3-s0xx`) running alongside |
  | a64 | 7–14 | `scale-s4-a/b`; #360 item-3 samples running alongside |
  | b32 | 6–9 | `scale-s4-a/b`; one #359-impl container |
  | a64+b32 | 7–9 | `scale-s4-a/b`; one #359-impl container |

  About 20 unrelated containers (image `091f785ba7d5`) ran throughout. Cross-arm wall differences under about 2× are therefore not attributed; the count columns are.
- **RSS:** the daemon's VmRSS from `/proc` read by an extra exec right after the step, outside the step's counters. VmHWM was equal to VmRSS in every row. It is a point sample, not a peak claim.

## Samples

- base 8 MiB: seq 407–437
- a32: seq 439–469
- a64: seq 471–501
- b32: seq 503–533
- a64+b32: seq 535–565

### Warm-daemon arm (fresh W2 after W1 on the same daemon)

Cell: wall ms / Store reader statements.

| Case / step | base 8 MiB | a32 | a64 | b32 | a64+b32 |
| --- | ---: | ---: | ---: | ---: | ---: |
| first-stat / cold | 6.7 / 0 | 3.3 / 0 | 1.3 / 0 | 1.4 / 0 | 1.4 / 0 |
| first-stat-deep / cold | 1.6 / 0 | 2.4 / 0 | 2.1 / 0 | 2.0 / 0 | 3.0 / 0 |
| folder-10000-ls / cold | 2,545 / 40,551 | 968 / 0 | 1,199 / 0 | 2,977 / 40,442 | 1,208 / 0 |
| find / cold | 3,139 / 39,624 | 2,700 / 0 | 2,601 / 0 | 3,689 / 37,506 | 2,700 / 0 |
| git / status-cold | 234 / 0 | 255 / 0 | 466 / 0 | 222 / 0 | 279 / 0 |
| git / add | 150 / 0 | 150 / 0 | 191 / 0 | 149 / 0 | 166 / 0 |
| git / commit | 40.9 / 0 | 54.8 / 8 | 45.1 / 8 | 41.3 / 0 | 62.9 / 5 |
| vitest / cold | 2,975 / 10,749 | 2,624 / 3,874 | 2,525 / 2 | 3,011 / 7,414 | 3,173 / 2 |
| tsc-b / cold | 667 / 3,947 | 379 / 0 | 345 / 0 | 529 / 2,940 | 381 / 0 |
| small-commit / edit | 1.3 / 0 | 1.7 / 0 | 1.3 / 0 | 1.5 / 0 | 1.6 / 0 |
| small-commit / commit | 16.5 / 43 | 19.3 / 43 | 18.0 / 43 | 18.4 / 37 | 17.7 / 37 |

### Cold arm (first Workspace on a fresh daemon): regression check

Cell: wall ms / Store reader statements.

| Case / step | base 8 MiB | a32 | a64 | b32 | a64+b32 |
| --- | ---: | ---: | ---: | ---: | ---: |
| first-stat / cold | 35.9 / 63 | 3.1 / 63 | 3.2 / 63 | 3.3 / 63 | 6.1 / 63 |
| first-stat-deep / cold | 11.6 / 150 | 9.5 / 150 | 9.1 / 150 | 9.5 / 150 | 16.8 / 150 |
| folder-10000-ls / cold | 4,168 / 40,627 | 2,318 / 40,458 | 2,508 / 40,458 | 2,564 / 40,627 | 3,120 / 40,458 |
| find / cold | 5,966 / 39,678 | 3,312 / 38,993 | 3,814 / 38,993 | 3,897 / 38,907 | 4,336 / 38,357 |
| git / status-cold | 706 / 13,082 | 557 / 13,082 | 650 / 13,075 | 655 / 12,970 | 1,454 / 12,972 |
| git / add | 157 / 59 | 200 / 59 | 170 / 59 | 184 / 59 | 163 / 59 |
| git / commit | 87.2 / 391 | 141 / 391 | 64.1 / 391 | 65.8 / 388 | 97.1 / 388 |
| vitest / cold | 3,686 / 10,594 | 3,219 / 9,760 | 3,289 / 9,760 | 3,115 / 10,232 | 3,646 / 9,586 |
| tsc-b / cold | 545 / 4,452 | 574 / 4,452 | 565 / 4,452 | 580 / 4,437 | 535 / 4,437 |
| small-commit / edit | 2.9 / 63 | 19.1 / 63 | 2.7 / 63 | 3.1 / 63 | 2.9 / 63 |
| small-commit / commit | 15.8 / 42 | 24.5 / 42 | 15.8 / 42 | 17.5 / 36 | 16.7 / 36 |

### Steady arm (same Workspace again)

Cell: wall ms / Store reader statements.

| Case / step | base 8 MiB | a32 | a64 | b32 | a64+b32 |
| --- | ---: | ---: | ---: | ---: | ---: |
| first-stat / steady | 7.6 / 0 | 1.0 / 0 | 1.3 / 0 | 1.1 / 0 | 1.2 / 0 |
| first-stat-deep / steady | 1.0 / 0 | 1.2 / 0 | 1.4 / 0 | 1.6 / 0 | 1.0 / 0 |
| folder-10000-ls / steady | 426 / 237 | 85.2 / 0 | 94.9 / 0 | 121 / 237 | 93.6 / 0 |
| find / steady | 3,795 / 39,611 | 1,995 / 0 | 2,346 / 0 | 3,488 / 37,502 | 2,260 / 0 |
| git / status-steady | 147 / 0 | 176 / 0 | 169 / 0 | 147 / 0 | 294 / 0 |
| vitest / steady | 2,234 / 3,943 | 2,624 / 59 | 2,515 / 0 | 3,036 / 3,308 | 2,519 / 0 |
| tsc-b / steady | 286 / 10 | 269 / 0 | 310 / 0 | 318 / 1 | 297 / 0 |

### Daemon RSS after the measured step (MB, VmRSS; VmHWM equal) and mount

Cell: warm-daemon RSS / cold RSS; mount: W2 mount ms (warm) / first mount ms (fresh).

| Case | base 8 MiB | a32 | a64 | b32 | a64+b32 |
| --- | ---: | ---: | ---: | ---: | ---: |
| first-stat | 14.4 / 14.4 | 14.4 / 14.3 | 14.4 / 14.4 | 14.7 / 14.7 | 14.7 / 14.7 |
| first-stat-deep | 19.0 / 18.9 | 19.0 / 18.9 | 18.8 / 18.9 | 19.2 / 19.1 | 19.2 / 19.2 |
| folder-10000-ls | 38.2 / 30.4 | 37.9 / 35.8 | 37.2 / 35.9 | 40.0 / 32.7 | 38.5 / 38.3 |
| find | 50.0 / 36.3 | 43.1 / 42.1 | 43.5 / 41.6 | 57.5 / 45.9 | 53.3 / 52.4 |
| git | 29.2 / 28.9 | 29.6 / 28.3 | 30.0 / 29.4 | 37.3 / 36.5 | 37.6 / 36.7 |
| vitest | 47.1 / 35.4 | 71.2 / 56.0 | 57.5 / 56.8 | 63.0 / 49.9 | 71.9 / 70.6 |
| tsc-b | 40.8 / 31.9 | 34.0 / 34.7 | 33.7 / 33.8 | 44.8 / 36.0 | 39.0 / 38.7 |
| small-commit | 32.2 / 20.7 | 32.2 / 20.7 | 32.2 / 20.7 | 32.7 / 21.0 | 32.7 / 21.0 |
| mount, median of 8 cases | 10.3 / 11.3 | 11.2 / 10.3 | 8.6 / 10.7 | 8.3 / 10.5 | 9.0 / 13.3 |

CanonicalCache occupancy at the end of each sample (`charged_cache_bytes`) gives the working set each case needs: first stat 67 KiB, deep stat 218 KiB, git 4.8 MiB, `ls -l` of 10,000 entries 17.3 MiB, tsc -b 11.4 MiB, find 19.1 MiB, vitest 33.6 MiB. At 8 MiB the last four overrun the cache inside the case (26k–50k evictions).

## Reading

- **The gap.** With the shipped 8 MiB cache, a warm daemon already gives a fresh Workspace zero Store statements for small working sets (first stat, deep stat, git status/add/commit, small Commit edit). For large ones (`ls -l` 10k, find, vitest, tsc -b) it recovers almost nothing: warm-daemon counts equal cold counts because the cache is overrun inside the case. find's own steady arm repeats every read for the same reason.
- **Where the per-object cost is.** In `ls -l` 10k and find, about 40k of the 40k statements are `locate`, one per object (the per-reader locator cache evicts), and pack reads are only 109 and 2,234. A CanonicalCache hit skips the reader entirely; a pack tier does not skip `locate`.
- **(a) budget.**
  - At 32 MiB, every case but vitest has 0 Store statements on a warm daemon: `ls -l` 10k 2,545 → 968 ms, tsc -b 667 → 379 ms, find 3,139 → 2,700 ms. vitest still misses 3,146.
  - At 64 MiB, all cases have 0, or 2 statements for vitest: vitest 2,975 → 2,525 ms. The steady arms also reach 0 statements (find steady 39,611 → 0; vitest steady 3,943 → 0).
  - Cold counts do not regress. They fall slightly where the case itself overran 8 MiB (find cold 39,678 → 38,993).
  - The warm-daemon wall time that remains is kernel-side: entry and attribute caches die at unmount. For example, `ls -l` 10k is 1,199 ms warm against 95 ms steady with zero Store work in both.
- **(b) shared pack tier, alone at 32 MiB.**
  - Warm-daemon pack bytes go to 0 in every case.
  - Statements fall only by the pack reads: vitest 10,749 → 7,414, tsc -b 3,947 → 2,940, find 39,624 → 37,506, `ls -l` 10k unchanged.
  - Range (unit) reads are not kept: vitest still reads 5.4 MB of ranges.
  - Wall time does not improve beyond noise. RSS rises by about 2–16 MB in the large cases.
- **(a)+(b).** Over a64, the warm-daemon arm gains nothing, since both are at 0 statements. Cold vitest reads 3.7 MB instead of 5.2 MB of whole packs. RSS rises by up to 14 MB (vitest 57.5 → 71.9 MB).
- **Mount latency** is about 8–11 ms (median of 8 cases) in every arm, warm W2 or fresh. A warm daemon has no mount-specific gap.

## Options for the owner (budget is daemon memory held while the daemon lives)

| Option | Warm-daemon Store work, large cases | Largest daemon RSS seen | Notes |
| --- | --- | --- | --- |
| keep 8 MiB | = cold (40k / 37k / 10.7k / 3.9k statements) | 50 MB | small cases already free |
| CanonicalCache 32 MiB | 0, except vitest 3,874 | 71 MB | holds every measured case except vitest |
| **CanonicalCache 64 MiB** | **0 (vitest 2)** | 58 MB | holds every measured case; one daemon serving find, then vitest, then tsc fills about 64 MiB |
| shared pack tier 32 MiB alone | 0–31% fewer statements, 0 pack bytes | 63 MB | `locate` per object remains |
| 64 MiB + tier 32 MiB | 0 | 72 MB | tier adds memory, no warm gain over 64 MiB alone |

The cache charges only what is read, so RSS grows towards the budget only on daemons that read that much. The RSS figures are single point samples on a loaded host. Allocator retention after W1's caches are freed makes warm-daemon RSS exceed cold RSS even at 8 MiB.

My recommendation: (a) at 64 MiB, or 40 MiB if memory per daemon matters more than vitest-sized working sets. Prototype (b) is not worth its memory unless the locator rows are shared too. Sharing them would let a tier hit skip `locate`, but it touches `read/fetch.rs` locator code that this lane does not own, so it is not done here.

## Prototype (b) design

`layerfs-storage/src/read/shared.rs` (`SharedPacks`), consulted in `read/fetch.rs`:
- `acquire_groups` takes a kept whole body before a selected-group read;
- `metadata_packs` takes kept dependency packs and reads only the rest;
- `payload` takes a kept payload body.

Each fills the tier after `validate_frame` on a whole body. That body came through the persistence port's authenticated `PersistedPack`.

The tier's rules:
- It is keyed by pack id. Pack ids are never reused and published packs never change.
- It is bounded by bytes, with clock (second-chance) eviction. A body larger than the budget, or whose descriptor length differs, is not kept. A different body under a kept id fails as `Integrity`.
- It never holds an absence.
- The lock is held for one map step: bodies are copied in and out outside it, with no Store I/O under it.
- There is one tier per `Store` (`store/open.rs`), handed to every reader by wrapping the reader factory, the control reader included. It is not shared across Stores.
- `Store::stop_reads` and `Drop for Store` close it: it is emptied, and later gets and inserts pass by.
- Objects from a kept body are authenticated by the resolver as before.

Wiring: `Storage::share_packs` in `read/provider.rs`. `store/handle.rs`, `read/objects.rs`, `encoding/*` and `save/*` are untouched. `read/fetch.rs` is changed only in pack acquisition, away from F-043/F-036's `base_location` addition on the correctness branch.

Its work counters are `Store::shared_pack_work()`. They are not in the daemon's diagnostics schema (the daemon's `telemetry.rs` and `schema.rs` are outside this lane), so the samples show the tier only through existing counters: pack bytes and `read_pack_selections`.

## Tests

Host (macOS, `cargo +1.85.1`, each under a 110 s alarm, built `--no-run` first):
- New `layerfs-storage` `shared_pack_tier`: eviction under the bound with a used body spared, refusal of a different body, nothing kept or handed out after close, and 8 concurrent readers. 3/3 pass.
- New `layerfs-store-service` `shared_pack_reads`: a later Workspace takes W1's bodies with fewer statements, two Workspaces read the same objects at once with bytes identical to an authenticated read, and the tier is empty after `stop_reads`. 1/1 pass.
- Whole suites: `layerfs-storage` all pass, `layerfs-store-service` 40/40 pass.
- Changed test: `workspace_reader_cache`. The control reader's repeated demand now takes its bodies from the tier, so its assertion "the control reader read again (statements rose)" became "the control reader took bodies again (tier hits rose)". This is a contract change, not a weakening; the rest of the test is unchanged and passes. No test deleted.

Linux (image `378b799ef433`, FUSE flags, each target in its own container under `timeout 100`), all at `a82efb484` source:
- `shared_cache_pressure` 1/1
- `store_reader_lifecycle` 5/5
- `mounted_store_read` 4/4
- `mounted_listing_reads` 1/1
- `concurrent_commits` 3/3

Clippy `-D warnings` with `--all-targets` passes on `layerfs-storage`, `layerfs-store-service` and `layerfs-node`. rustfmt `--check` passes on every changed file. The boundary guard shows the same 19 violations as the base `615bf75f2`, none new.

## Not run, and gaps

- The other daemon test targets, the fuse, overlay and workspace suites (untouched crates), and the SDK check set.
- pnpm, grep-r, du-s and the other cost cases outside the requested set.
- Durable: `NOT_RUN — disabled by owner until explicit reauthorization`.
- No sample of several different cases in sequence on one daemon (the union working set). The "find + vitest + tsc ≈ 64 MiB" figure is the sum of the per-case occupancies, not a measurement.
- RSS is a point sample after the step, not a peak.
- Shared-tier counters are not published in daemon telemetry.
- Wall times across arms were taken at different host loads (see Conditions).

## Production LOC

Scope and method for every line: `tools/production_loc.py --root` on `git archive` of the parent and staged trees. Reference absent (retired R9c; last counted 65,417 at tree `498dd1917812`).

| Commit | Production LOC | Breakdown |
| --- | --- | --- |
| `615bf75f2` harness | 98479 → 98479 (delta 0) | core 89797, sdk 2635, dsh 6047 |
| `8bc399ce1` a32 | 98479 → 98479 (delta 0) | |
| `276138ea3` a64 | 98479 → 98479 (delta 0) | |
| `a09854c0c` b | 98479 → 98664 (delta +185) | core 89797 → 89982 |
| `a82efb484` a+b | 98664 → 98664 (delta 0) | |
| this docs commit | 98664 → 98664 (delta 0) | |
