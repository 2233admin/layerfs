# #359 · warm daemon: a fresh Workspace on a daemon that already served one

| | |
| --- | --- |
| Trigger | Owner, via the #352 liaison, 2026-10-18: "make a fresh Workspace on a warm daemon (same project) fast, with a bounded, daemon-wide cache of committed immutable content, and prove it with measurement" |
| Kind | measurement arm (harness) and two prototypes: a budget setting (a), kept at 64 MiB, and a Store-wide shared pack tier (b), measured and dropped. No Store format change |
| Branch | `claude/issue359-warm-daemon-cache-0d14ff`, based on `46e17bdf3` (`issue359-impl` line; product source = `2d84fe1bb`). Not merged anywhere; integration is the owner's decision |
| Commits | harness `615bf75f2`; (a) 32 MiB `8bc399ce1`, 64 MiB `276138ea3`; (b) `a09854c0c`; (a)+(b) `a82efb484`; record notes `668088a39`, `dee0eb089`; (b) removed `5038c3b57`; decision docs: the commit after it |
| Binaries | release, `--locked --offline -j 6`, image `layerfs-307-fuser-patch-clippy:1.85.1` (`378b799ef433`), pinned under `core/target/issue359-warm/` with a `SOURCE` file each, registered in `~/lfs-history/runs/issue359/binaries.json`. base: daemon `cc185d13` / addon `66d774c8` (record 026's head build; my rebuild of `615bf75f2` produced the same bytes). a32: `42c19a39` / `3ad548df`. a64: `42c19a39` / `6ae65f16` (id `w64-6ae65f16`; the daemon does not use its own default, the budget is the addon's setup). b32: `afeb92f6` / `ea7bb1dc`. a64+b32: `ecf5dea6` / `b65ef9f6` |
| Status | **decided.** Owner, 2026-10-19: "Set the daemon CanonicalCache to 64 MiB and drop prototype (b), the shared pack tier." The branch carries 64 MiB (SDK setup in `sdk/js/native/src/sandbox.rs`, daemon default in `install_types.rs`); (b) is removed and `layerfs-storage` and `layerfs-store-service` are byte-identical to `issue359-impl` (`7dc323574`). Pushed to the branch only; nothing merged |

## Decision

- **CanonicalCache: 64 MiB**, by owner decision 2026-10-19. It replaces 8 MiB
  wherever the daemon budget is set or documented: the SDK's `cache_bytes`,
  the daemon's `StoreSettings` default, architecture 61 and COST_MODEL. Its
  numbers are the a64 arm below; no new arm was run for the decision.
- **Prototype (b) is dropped.** Its code, its `read/fetch.rs`,
  `read/mod.rs` and `read/provider.rs` hooks, its `store/open.rs` wiring and its
  two tests (`shared_pack_tier`, `shared_pack_reads`) are removed in
  `5038c3b57`, and `workspace_reader_cache` has its original "the control
  reader read again" assertion back. Its design and measured numbers stay
  below as the record of what was tried.
- The allowance is shared with the RCA facts window (record 032; see below).

## Cache state and conditions

- **Arms** (`cost.mjs --daemon`, see COST_MODEL):
  - *cold*: the first Workspace on a daemon that has served none (`--daemon fresh`, LayerFS part only).
  - *steady*: that Workspace again.
  - *warm-daemon*: W1 mounts, runs the case once, unmounts discarded (unmeasured); a fresh W2 on the same Branch and daemon runs it once and is measured.
  - Each arm is labeled on its own. The warm-daemon arm never credits or replaces cold (AGENTS §1).
- **Store file:** page-cache resident in every arm after the volume clone (declared, not controlled). Wall times are warm-Store diagnostics; counts are exact.
- **Record 026 difference:** its `--part all` cold arm followed a native setup mount on the same daemon, so it is not a fresh-daemon arm. Its cold numbers and this record's cold arm measure different cache states and are not compared here; every comparison below is within this record's samples.
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

## Order of the arms

The owner asked for "32 first": report 32 MiB on its own before running 64 MiB
or (b). That direction reached this session after the a64, b32 and a64+b32
arms had already run (seq 471–565): the liaison's go-ahead for stop point 1
and the "32 first" message both arrived after stop point 2 was sent. So a32
was not reported on its own first. Its samples (seq 439–469) were taken
before any later arm and are unchanged by them; each arm is its own build,
daemon and Store clone.

## Interaction with the RCA facts window

The RCA session's LOOKUP facts window (F-A2/F-A3, record 032) charges its
entries against the same CanonicalCache allowance that `cache_bytes` sets.
Whatever budget is chosen is shared with it. The occupancies and RSS here were
measured on this branch without that work, so a window's entries would come
out of the same budget and could evict objects these cases kept.

## Options for the owner (budget is daemon memory held while the daemon lives)

| Option | Warm-daemon Store work, large cases | Largest daemon RSS seen | Notes |
| --- | --- | --- | --- |
| keep 8 MiB | = cold (40k / 37k / 10.7k / 3.9k statements) | 50 MB | small cases already free |
| CanonicalCache 32 MiB | 0, except vitest 3,874 | 71 MB | holds every measured case except vitest |
| **CanonicalCache 64 MiB** | **0 (vitest 2)** | 58 MB | holds every measured case; one daemon serving find, then vitest, then tsc fills about 64 MiB |
| shared pack tier 32 MiB alone | 0–31% fewer statements, 0 pack bytes | 63 MB | `locate` per object remains |
| 64 MiB + tier 32 MiB | 0 | 72 MB | tier adds memory, no warm gain over 64 MiB alone |

The cache charges only what is read, so RSS grows towards the budget only on daemons that read that much. The RSS figures are single point samples on a loaded host. Allocator retention after W1's caches are freed makes warm-daemon RSS exceed cold RSS even at 8 MiB.

Recommendation given before the decision: (a) at 64 MiB, or 40 MiB if memory per daemon matters more than vitest-sized working sets. The owner chose 64 MiB. Prototype (b) is not worth its memory unless the locator rows are shared too. Sharing them would let a tier hit skip `locate`. The liaison scoped that as a possible positive-only prototype (never a miss or negative answer, per F-036), branched from the correctness lane's `fetch.rs`, then put it on hold: it is not built unless the owner asks.

**Out-of-lane edits.** (b) touched `read/fetch.rs` (correctness lane) and `read/mod.rs` (#354 lane), approved only as a prototype on this branch. With (b) dropped they are removed (`5038c3b57`); `read/*` is byte-identical to `issue359-impl`.

## Prototype (b) design (dropped, removed in `5038c3b57`)

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

## Tests of the prototypes (before the decision)

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

## Verification at the final shape (after `5038c3b57`)

One run each, under a 115 s alarm (host) or `timeout 100` (Linux), built
`--no-run` first. No new measurement arm: the decision's numbers are a64's.

- Host, `cargo +1.85.1`:
  - `layerfs-storage`: 19 targets, 60 passed, 0 failed.
  - `layerfs-store-service`: 25 targets, 39 passed, 0 failed, including `workspace_reader_cache` with its original "the control reader read again" assertion.
- Linux, image `378b799ef433`, FUSE flags, one container per target. The container's sources were checked by `sha256sum -c` against the host first. Results:
  - `shared_cache_pressure` 1/1
  - `store_reader_lifecycle` 5/5
  - `mounted_store_read` 4/4
  - `mounted_listing_reads` 1/1
  - `concurrent_commits` 3/3
- `sdk/js/native/src/sandbox.rs` passes `rustfmt --check` (comment change only).
- `core/crates/layerfs-storage/src/read/*` is byte-identical to `issue359-impl` (`7dc323574`). So are the whole `layerfs-storage` and `layerfs-store-service` crates.
- The branch differs from its base `46e17bdf3` only in:
  - `install_types.rs` and `sandbox.rs` (64 MiB);
  - `cost.mjs`;
  - architecture 61, COST_MODEL and this record.
  `issue359-impl` has three later commits (`9bee52d27`, `1e90114fa`, `7dc323574`) not on this branch. They touch none of these files, so a two-dot diff also shows them, reversed.

## Serial operations on one daemon (owner request 2026-10-19)

**Question:** is the 64 MiB cache shared across different operations? The
owner asked: "test against those operations ... and see if the cache is cross
shared between operations (we can have one workspace execute on one
operation serially)".

**Design:**
- Binary `w64-6ae65f16` (64 MiB; product source equal to the final branch
  except a comment), LayerFS part only.
- One daemon and one Store clone per arm. Each case runs in its own fresh
  Workspace on that daemon: mount, run its non-steady steps once, read the
  daemon's RSS, unmount discarded. No case Commits; `serial case` refuses
  Commit cases, so the base never moves.
- Every case is its own command (`cost.mjs serial open|case|close`, commit
  `35d2e3373`) and the Sandbox stays up between them.
- Counts per step are the daemon's records at a status before and after the
  step, as in the other arms. The reference for each case is its own
  cold-daemon a64 sample (one daemon per case): s471, s475, s479, s483, s487,
  s491, s495, s609 (rm-rf-nm) and s613 (node-require). The last two were run
  for this request.
- One sample per arm.

**Order of events and failures:**
- *Arm S (seq 633): FAILED.* Its order was rm-rf-nm, find, git, tsc-b,
  node-require, cp-rm-nm, folder-10000-ls, vitest, first-stat,
  first-stat-deep. Case 6 (cp-rm-nm) hit the 115 s alarm: cp alone took
  117.5 s. Its runner kept running, and cases 7–10 ran while its 28 s
  rm-created step was still going, so their daemon-wide counters and walls
  are contaminated. **This was my mistake:** I continued with the next cases
  after case 6 overran instead of stopping the sequence. Close was then refused
  (`MountsActive`), so I stopped and removed the Sandbox container and its
  volume by hand and appended a FAILED ledger entry with a note; `sample.json`
  carries verdict FAILED. Arm S stays FAILED as recorded. Its cases 1–5 ran
  before the overrun and stand as clean, but are not reported as an arm. The
  per-case script now stops the sequence on any overrun (approved by the
  liaison).
- *cp-rm-nm's cold reference (s611): FAILED.* It ran over budget: cp 107 s
  and rm-created 36 s at host load 46–52. It was decoded afterwards for its
  counts only.
- *S2 and R leave cp-rm-nm out.* It cannot fit a 2-minute command on this
  host now. This is a changed case set because of the budget, not a rerun
  because of load. The liaison had been asked to choose and had not answered
  when the owner said "just go"; this was the recommended option.
- Host load (one minute) was 19–42 throughout S2 and R. The integration
  session's builds and another lane's samples were running. Walls are
  diagnostic; counts are the evidence.


#### Arm S2: order rm-rf-nm → find → git → tsc-b → node-require → folder-10000-ls → vitest → first-stat → first-stat-deep  (warm-s635-serial-S2, COMPLETE)

| # | Case / step | ms | stmts | reader req | CC hits | CC misses | evictions | RSS MB | cold ms | cold stmts | cold misses | misses vs cold |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | rm-rf-nm / rm-committed | 37,446.2 | 203,368 | 198,063 | 1,784,987 | 194,526 | 80,923 | 84.3 | 35,871.5 | 203,368 | 194,526 | 100% |
| 2 | find / cold | 3,630.4 | 17,793 | 16,067 | 419,802 | 16,082 | 22,801 | 94.4 | 3,814.0 | 38,993 | 36,194 | 44% |
| 3 | git / status-cold | 653.9 | 9,574 | 6,539 | 71,578 | 6,112 | 10,217 | 109.4 | 649.7 | 13,075 | 8,623 | 71% |
| 3 | git / add | 178.2 | 59 | 25 | 18,436 | 26 | 91 | 109.4 | 170.1 | 59 | 26 | 100% |
| 3 | git / commit | 85.0 | 391 | 371 | 5,150 | 337 | 637 | 109.4 | 64.1 | 391 | 337 | 100% |
| 4 | tsc-b / cold | 645.9 | 959 | 563 | 15,052 | 755 | 30,954 | 116.7 | 564.7 | 4,452 | 3,160 | 24% |
| 5 | node-require / cold | 79.3 | 141 | 62 | 2,887 | 55 | 344 | 116.7 | 212.6 | 1,169 | 869 | 6% |
| 6 | folder-10000-ls / cold | 2,944.3 | 40,402 | 40,091 | 301,696 | 40,252 | 54,265 | 116.7 | 2,507.8 | 40,458 | 40,262 | 100% |
| 7 | vitest / cold | 4,743.1 | 3,449 | 1,482 | 115,993 | 2,480 | 84,090 | 149.5 | 3,288.9 | 9,760 | 7,060 | 35% |
| 8 | first-stat / cold | 5.3 | 0 | 0 | 15 | 0 | 0 | 149.5 | 3.2 | 63 | 15 | 0% |
| 9 | first-stat-deep / cold | 4.7 | 38 | 26 | 161 | 25 | 11 | 149.5 | 9.1 | 150 | 76 | 33% |

Cache after the last case: evictions 284,443 in total, 64.0 MiB charged, 56,970 objects, authenticated 69.6 MB over the sequence.

#### Arm R: order first-stat-deep → first-stat → vitest → folder-10000-ls → node-require → tsc-b → git → find → rm-rf-nm  (warm-s644-serial-R, COMPLETE)

| # | Case / step | ms | stmts | reader req | CC hits | CC misses | evictions | RSS MB | cold ms | cold stmts | cold misses | misses vs cold |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | first-stat-deep / cold | 36.6 | 150 | 50 | 270 | 76 | 0 | 19.1 | 9.1 | 150 | 76 | 100% |
| 2 | first-stat / cold | 3.7 | 8 | 5 | 49 | 4 | 0 | 18.9 | 3.2 | 63 | 15 | 27% |
| 3 | vitest / cold | 5,122.7 | 9,655 | 6,110 | 134,448 | 7,005 | 0 | 75.3 | 3,288.9 | 9,760 | 7,060 | 99% |
| 4 | folder-10000-ls / cold | 5,802.4 | 40,404 | 40,092 | 301,724 | 40,252 | 0 | 93.3 | 2,507.8 | 40,458 | 40,262 | 100% |
| 5 | node-require / cold | 158.1 | 835 | 672 | 5,048 | 665 | 0 | 95.7 | 212.6 | 1,169 | 869 | 77% |
| 6 | tsc-b / cold | 613.6 | 2,142 | 1,664 | 19,937 | 1,705 | 0 | 102.7 | 564.7 | 4,452 | 3,160 | 54% |
| 7 | git / status-cold | 842.7 | 7,627 | 5,252 | 66,234 | 4,907 | 0 | 105.6 | 649.7 | 13,075 | 8,623 | 57% |
| 7 | git / add | 277.0 | 59 | 25 | 18,436 | 26 | 0 | 105.6 | 170.1 | 59 | 26 | 100% |
| 7 | git / commit | 94.3 | 391 | 371 | 5,151 | 337 | 0 | 106.5 | 64.1 | 391 | 337 | 100% |
| 8 | find / cold | 4,091.7 | 33,778 | 31,765 | 491,643 | 32,201 | 2,338 | 117.4 | 3,814.0 | 38,993 | 36,194 | 89% |
| 9 | rm-rf-nm / rm-committed | 24,991.6 | 178,919 | 175,169 | 1,702,451 | 171,116 | 158,538 | 127.2 | 35,871.5 | 203,368 | 194,526 | 88% |

Cache after the last case: evictions 160,876 in total, 64.0 MiB charged, 134,834 objects, authenticated 69.1 MB over the sequence.

Cold references (a64-fresh, own daemon each): find s483, first-stat s471, first-stat-deep s475, folder-10000-ls s479, git s487, node-require s613, rm-rf-nm s609, tsc-b s495, vitest s491


Column "misses vs cold" is the case's CanonicalCache misses in the sequence
over its misses on its own fresh daemon. Under 100% means earlier operations
left entries it used.

**Reading:**
- **The cache is shared across operations, and the order decides how much.**
  - With the broad walks first (S2), later cases miss far less than cold:
    - find 44%;
    - tsc -b 24%;
    - node require 6%;
    - vitest 35%;
    - first stat 0%;
    - git status 71%.
    Their Store statements fall the same way (find 38,993 → 17,793,
    tsc -b 4,452 → 959, node require 1,169 → 141, vitest 9,760 → 3,449).
  - With the light cases first (R), little is shared: vitest 99%,
    `ls -l` 100%, node require 77%, tsc -b 54%, git status 57%, find 89%,
    rm -rf 88%.
- **Likely suppliers (inference from working-set overlap, not traced per
  object):**
  - S2:
    - find and git status draw on rm-rf-nm's walk of every directory and
      inode under `node_modules`;
    - tsc -b and node require draw on the package metadata that rm-rf-nm,
      find and git status walked before them;
    - vitest draws on all of those;
    - first stat (root) was still resident.
  - R:
    - first stat draws on first-stat-deep's root path;
    - node require, tsc -b and git status draw on vitest's `node_modules`
      metadata;
    - find and rm-rf-nm, last, draw on what the earlier cases left.
  - `ls -l` of 10,000 entries reads the `folders` branch's own `.cost`
    directory, which no other case touches: 100% in both orders, as expected.
- **Where it runs out:**
  - rm-rf-nm alone overruns 64 MiB: it evicts 80,923 entries inside its own
    case in S2, and 158,538 in R. In S2 it still left the shared directory
    and inode objects that find, git and the package-metadata readers reused.
  - The cache is full (64.0 MiB charged) at the end of both arms: S2 evicted
    284,443 entries in total and R 160,876.
  - Each arm authenticated about 70 MB of objects over its sequence. The
    owner's estimate of about 100 MB of combined working set is in line with
    a cache that stays full and keeps evicting.
  - vitest evicts 84,090 entries in S2, where it comes after the walks, and
    none in R, where it is third.
- **Daemon RSS** climbs across the sequence: S2 84 → 150 MB, R 19 → 127 MB.
  That is above the 64 MiB cache: per-case allocations are not all returned
  to the OS. It is a point sample after each step.
- **cp-rm-nm at 64 MiB:** settled by the paired samples below: not a cache-size
  regression.

**Harness lines touched on this branch** (`dsh/tools/history/cost.mjs` at
`35d2e3373`, new-file line numbers; the RCA session also edits this file):

- header comments 7 and 26–33;
- `runInner` mounts 152–153;
- `hostCase` 170, 172, 174, 181 and 185;
- `inner` 301;
- the RSS helpers 315–318;
- `playCase` 344–351, 353, 357 and 361;
- `summarize` 384, 386, 395, 399 and 404;
- `table` 425 and 438;
- the serial commands (new functions `hostSerial`, `innerSerial`,
  `summarizeSerial`) 449–553;
- `main` dispatch 563–564.

Since `35d2e3373` (`e938e8436` and the probe fix; new-file line numbers at
the probe-fix commit):
- `PREPARED` with `COST_PREPARED` 43–45;
- `PROBE`, `probeOf` and `daemonProbe` 318–341;
- `serial repeat` host side 506–512, and the usage 525;
- `innerSerial`: trace and arms naming 531–534, the post-unmount probe and
  the repeat loop 554–567;
- `summarizeSerial` probe rows 591–597, and the verdict 605.

## Daemon RSS after unmount (liaison request 2026-10-19)

**Question:** daemon RSS climbed case after case in S2 and R (to 150 and
127 MB), well above the 64 MiB cache, although every Workspace was unmounted.
Does it plateau, or grow with each Workspace?

**Design:**
- Sample s667 (`warm-s667-serial-S2-probe2`), binary `w64-6ae65f16`, Store
  `layerfs-issue359-prep`.
- S2's nine cases in S2's order. Then, on the same daemon, `serial repeat
  first-stat --n 20`: twenty fresh Workspaces in one command (6.5 s).
- After every unmount, a probe runs in the Sandbox container with no
  Workspace (privileged exec; smaps and fd links need ptrace access). It
  records `/proc/<daemon>/status`, `smaps_rollup`, open fds by target,
  FUSE mounts and anonymous mappings.
- The CanonicalCache and Store-reader numbers are the daemon's own Unmount
  record, written after that Workspace's reader and overlay closed.
- glibc's allocator has no external statistics. The count of anonymous
  mappings stands in for its arenas.
- Harness: commit `e938e8436` plus the fix in this commit.

**Failed attempt:** s662 FAILED after case 1. The first harness version
called `sandbox.status` after the unmount, and status needs a Workspace path.
Recorded FAILED and closed; s667 is a new sample after the harness fix, not
a rerun for load. In s667, case 1's in-harness probe lacked the smaps and fd
fields (the exec was not yet privileged). Its full probe was taken by hand
right after the case, with the daemon idle and unchanged
(`probe-1-supplement.json`); RSS is the same 85,092 kB in both.

Host load (one minute) was 14–31 throughout.

| # | Case | VmRSS MB | Anonymous MB | Pss_File MB | anon maps | fds | FUSE mounts | readers | cache charged | cached objects | evictions (total) |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | rm-rf-nm | 85.1 | 77.2 | 7.2 | 27 | 11 | 0 | 1 | 64.0 MiB | 137,888 | 80,923 |
| 2 | find | 96.0 | 88.1 | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 137,816 | 103,726 |
| 3 | git | 111.3 | 103.4 | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 136,378 | 114,725 |
| 4 | tsc-b | 119.8 | 111.9 | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 115,281 | 145,679 |
| 5 | node-require | 119.8 | 111.9 | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 115,095 | 146,024 |
| 6 | folder-10000-ls | 119.8 | 111.9 | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 115,951 | 200,342 |
| 7 | vitest | 146.7 | 138.8 | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 56,952 | 284,432 |
| 8 | first-stat | 146.8 | 138.9 | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 56,952 | 284,432 |
| 9 | first-stat-deep | 148.5 | 140.6 | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 56,970 | 284,443 |
| 10 | first-stat × 20 | 148.5 each | 140.6 each | 6.9 | 29 | 14 | 0 | 1 | 64.0 MiB | 56,970 | 284,443 |

(RSS in MB is kB / 1000. Case 1's anonymous/file/maps/fds come from the
hand-taken supplement.)

- The fds after each unmount are the same set every time:
  - the Store file three times, with its WAL twice and its SHM once;
  - the overlay template `overlay.sqlite` once;
  - `/dev/null`, two pipes and the control sockets.

  No per-Workspace overlay file, `/dev/fuse` or reader connection stays open.
  The baseline of 11 at the repeat's start becomes 14 after the first
  Workspace, through three extra sockets, and stays 14.
- The cache counts reproduce S2 (s635) exactly: the same 284,443 evictions
  and 56,970 objects at the end.

**Reading:**
- **No per-Workspace leak.** Twenty fresh Workspaces after S2 leave VmRSS at
  148,468 kB every time, with the same fds, mappings, readers (1, the control
  reader), FUSE mounts (0) and cache state. No new finding is filed.
- **The growth is anonymous memory and comes in steps, not per Workspace.**
  - The cache is full (64.0 MiB charged) from the first case on, so the cache
    itself does not grow.
  - RSS rises only on cases that do new heavy work: find +10.9, git +15.4,
    tsc -b +8.5 and vitest +26.8 MB.
  - It is flat on node-require, `ls -l` 10k (40k statements, but every
    allocation size already seen), first stat and deep stat.
  - File-backed memory stays at 6.9 MB, and the number of anonymous mappings
    stays at 29.
  - This is what allocator retention looks like: glibc keeps freed heap for
    reuse, and the high-water mark rises only when a case's transient
    allocation pattern exceeds what was retained. Evidence by elimination:
    allocator counters are not readable from outside the process.
- **What is not shown:** whether a daemon running for hours plateaus once
  every kind of case has run. This sample shows flat RSS for repeated light
  cases and step increases from heavy ones. A heavy-case repeat (vitest × N)
  would test the plateau directly; it was not run.

## cp-rm-nm 8 vs 64 MiB, paired cold samples (liaison request 2026-10-19)

**Design:**
- One cold sample per arm, back to back: base `cc185d13` (8 MiB) as s669,
  then a64 `w64-6ae65f16` as s671. Same Store clone source
  (`layerfs-issue359-prep`), same steps (cp, then rm-created), each its own
  command under the 115 s alarm.
- The Docker VM's `free -m` and `/proc/pressure/{memory,io,cpu}` were read
  before and after each sample (`~/lfs-history/runs/issue359/vm-probes-031.log`).
- The harness cannot run cp and rm-created as separate commands, so the case
  ran whole; it fitted. Both samples COMPLETE.
- Host load (one minute) 26–28 during base, 26–42 during a64. `scale-s4-a/b`
  ran throughout.

| | base 8 MiB (s669) | a64 (s671) | a64 earlier (s611, FAILED, over budget) |
| --- | ---: | ---: | ---: |
| cp ms | 48,386 | 62,961 | 106,721 |
| rm-created ms | 34,409 | 18,159 | 35,880 |
| cp + rm-created ms | 82,795 | 81,120 | 142,601 |
| cp Store statements | 226,325 | 223,252 | 223,255 |
| cp cache misses | 245,343 | 241,377 | 241,382 |
| cp evictions | 323,200 | 247,980 | 247,982 |
| cp authenticated MB | 425.8 | 394.8 | 394.8 |
| cp kernel-served ns | 30.9e9 | 36.8e9 | 81.1e9 |
| cp owner lock hold ns | 6.7e9 | 8.3e9 | 23.7e9 |
| daemon RSS after, MB | 56.7 | 114.0 | 114.4 |
| VM memory available, before → after, MB | 3,115 → 3,060 | 3,071 → 3,102 | not captured |
| VM memory PSI stall during sample (total delta) | 1.9 ms | 3.6 ms | not captured |
| VM io PSI "some" during sample (total delta) | 1.8 s | 2.1 s | not captured |

**Reading:**
- **Memory pressure is not supported.**
  - The VM had about 3.0–3.1 GB available before and after both samples.
  - Memory stall time was 2–4 ms over each 87 s sample, and io stall about 2 s.
  - The 57 MB of extra daemon RSS at 64 MiB did not squeeze the page cache
    here (buff/cache 1.18–1.21 GB).
  - This covers these two samples only: the VM state during s611 and arm S
    was not captured.
- **A cache-size regression is not supported.**
  - At 64 MiB, cp does slightly less Store work than at 8 MiB: 3,073 fewer
    statements, 75k fewer evictions and 31 MB less authenticated.
  - The same a64 binary did identical Store work in s611 and s671 (223,255 vs
    223,252 statements). Yet its cp took 106.7 s in s611 and 63.0 s now, and
    its rm-created 35.9 s and 18.2 s.
  - rm-created does no cache work. It went 34.4 s → 18.2 s between the paired
    arms, the opposite direction to cp, and the two steps together are equal
    (82.8 s vs 81.1 s).
  - The earlier 3× slowdown is therefore host contention: identical counts,
    walls within a 1.7–2× band across samples.
- **Undecided:** whether a64's cp is about 30% slower (48.4 → 63.0 s) for a
  reason inside the daemon. Its kernel-served time is 19% higher with less
  Store work. But step walls on this host vary by up to 2× with identical
  counts, as rm-created shows, so one pair cannot attribute a 30% difference.

## Build attempt not used

On the liaison's first instruction (later cancelled by the owner's "golden
switch cancelled"), a base8 scratch commit `38584c271` (d679c84ee with
`cache_bytes` 8 MiB in `install_types.rs` and `sandbox.rs`) was made on the
local branch `issue359-scratch-base8-d679c84ee`, never pushed. Its builds did
not complete: the first failed offline because this lane's cargo-home volume
was empty, and the second was stopped when the cancellation arrived. The
cargo home was refilled by copying `layerfs-issue359-impl-cargo-home`
(read-only) into this lane's volume. No binary from d679c84ee was built or
used; all samples above use the pinned 2d84fe1bb builds.

## Not run, and gaps

- The other daemon test targets, the fuse, overlay and workspace suites (untouched crates), and the SDK check set.
- pnpm, grep-r, du-s and the other cost cases outside the requested set.
- Durable: `NOT_RUN — disabled by owner until explicit reauthorization`.
- The union working set was sampled later in the serial arms S2 and R (see "Serial operations"). cp-rm-nm is left out of them, as it could not fit a 2-minute command inside a sequence on this host. Its 64 MiB slowdown is resolved as host contention by the paired samples; a residual 30% on cp alone is undecided.
- A heavy-case repeat (vitest × N) to test the RSS plateau directly.
- VM memory state during s611 and arm S.
- Shared-tier counters were never published in daemon telemetry (the tier is dropped).
- RSS is a point sample after the step, not a peak.
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
| `668088a39`, `dee0eb089` docs | 98664 → 98664 (delta 0) | |
| `5038c3b57` remove (b) | 98664 → 98479 (delta −185) | core 89982 → 89797; deleted tests `shared_pack_tier`, `shared_pack_reads` |
| `419f771bf` decision docs | 98479 → 98479 (delta 0) | |
| `35d2e3373` serial harness | 98479 → 98479 (delta 0) | `dsh/tools` is not in a production scope |
| serial results docs commit | 98479 → 98479 (delta 0) | |
| `b56088ffd` old-golden label (removed again: golden switch cancelled by owner 2026-10-19) | 98479 → 98479 (delta 0) | |
| `e938e8436` post-unmount probe harness | 98479 → 98479 (delta 0) | `dsh/tools` is not in a production scope |
| probe fix and RSS/cp results docs | 98479 → 98479 (delta 0) | |

Net over the base `46e17bdf3`: 98479 → 98479 (delta 0). The kept product
change is the `cache_bytes` value and its comment.
