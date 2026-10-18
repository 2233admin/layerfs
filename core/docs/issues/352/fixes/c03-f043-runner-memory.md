# c03 · F-043: replay runner memory is allocator retention of 16 MiB encode arenas

> **Status:** fixed (reworked to the liaison ruling; decode reuse and Store-close release pending) on branch `claude/issue352-correctness-644bbc` (correctness
> lane, 2026-10-18). Not merged. Kind 1 (no format change). The proof uses an
> in-process probe and two real fast dev ranges (c43, below).

## Finding

BUGS F-043: the replay runner process (SDK in-process Store plus native addon)
peaked at 1.5–1.9 GB RSS per fast dev range and kept it at range end. The JS
heap held only 16–52 MB of that. dev352-p3p r015 recorded `peakRssMb` 1,873.9
with `rssMb` 1,873.9, so nothing was released at the end of the range.

## 1. Split: file-backed vs anonymous (before any fix)

`/proc/self/smaps_rollup` was sampled inside the process. The workload is the
runner's in-process call mix, with no daemon needed: `branch.fork` and
`fs.write` (one Commit each), plus `fs.grep`, `fs.list`, `fs.read` and
`diff_commits`, in 4 concurrent lanes. It ran against a byte copy of the
range-14 snapshot Store, with the pinned p3p addon `438bae05` and then the
base addon `413ae60d` (built from `bb19d9d7d`, this branch before the fix).

| Probe (base addon) | RSS | Anonymous | File-backed | JS heap |
| --- | --- | --- | --- | --- |
| start | 64 MB | 17 MB | 47 MB | 5 MB |
| after 80 writes (pinned `438bae05`) | 1,114 MB | 1,066 MB | 48 MB | 7 MB |
| after 720 writes | 1,246 MB | 1,198 MB | 48 MB | 6 MB |
| after 3,600 writes (30 rounds) | 1,287 MB | 1,239 MB | 48 MB | — |

The file-backed share stays at 48 MB, made of binaries and libraries. The
Store profile sets `mmap_size=0` (`persistence backend/sqlite/profile.rs:80`),
so neither the SQLite file nor the WAL is mapped. **More than 95% of the memory
is anonymous native memory.**

## 2. Per range or with history length?

The same probe was run on Stores at three history depths (720 writes each, one
sample per arm, final RSS):

| Store | Base | Fixed |
| --- | --- | --- |
| range 0 (snapshot) | 1,222 MB | 237 MB |
| range 14 (snapshot) | 1,246 MB | 281 MB |
| dev352-p3p (range 17 done; 14,171 Commits, 62 Branches, `node_modules`) | 1,437 MB | 356 MB |

Memory does **not** accumulate across Commits or ranges: base plateaus by
round 5, and the fix is flat from round 10 to round 29 (below). The modest
rise with depth comes from larger per-call working sets on larger trees: p3p
carries `node_modules`, and its rounds take 1.3 s against 0.4 s at range 0.
It is not retained history.

## 3. What the anonymous memory is

A native heap profiler could not be installed: building a heaptrack image
exceeded the 2-minute command limit at `apt-get`. The attribution below comes
from allocator experiments plus source, one call at a time (`steps.mjs`, base
addon):

- **Each sequential `fs.write` adds 21 MB of anonymous memory.** Reads, lists
  and greps add about 2 MB each.
- **With `MALLOC_ARENA_MAX=1`, writes add about 0.4 MB each.** So glibc arenas
  keep the memory; it is not reachable Rust data.
- **With a fixed `MALLOC_MMAP_THRESHOLD_=1048576`, writes add about 2 MB each**,
  and 720 writes plateau at 135 MB of anonymous memory. So the retained blocks
  are large ones.
- **Source:** every Save makes a `CompressionWorkspace`
  (`save/state.rs:93`), which allocates and zero-fills
  `ENCODE_WORKSPACE_BYTES` = 16 MiB (`encoding/codec.rs:55`, `:206`). Every
  Commit is a new producer `Storage` (`store-service store/open.rs:127`), so
  every Commit gets a new Save. Each Save and read also makes a 1 MiB
  `DecompressionWorkspace`.

**Mechanism.** The first 16 MiB block is mmapped and then freed. glibc then
raises its dynamic mmap threshold above 16 MiB. From then on each 16 MiB block
comes from the arena of whichever thread runs the Save. Store calls run on a
pool of threads (71 threads in the process), and a non-main arena is not
trimmed below twice the threshold. So each arena keeps a zero-filled, resident
16 MiB region. The 8-CPU VM allows up to 64 arenas: 64 × ~17 MiB ≈ 1.1 GB, the
measured plateau.

## 4. Fix (reworked to the liaison's ruling, 2026-10-18)

The first version (`2f0d4378e`) kept whole zstd **contexts**, encode and
decode, in process-wide lists, behind a new `unsafe impl Send`. The liaison's
ruling replaced it:

- **Encode regions only.**
  - `save/state.rs` keeps the plain 16 MiB `Vec<u64>` regions of finished
    Saves in `IDLE_ENCODE`. Its `Encoder` wrapper returns a region on drop.
  - The list holds at most `available_parallelism()` regions (8 on the
    runner VM, so 128 MiB). A region past that is freed.
  - The hook in `encoding/codec.rs` is two functions:
    `CompressionWorkspace::in_region(Vec<u64>)`, which builds the static
    context in a given region, and `into_region(self)`.
  - `workspace()` is unchanged.
  - Only a `Vec<u64>` moves between threads, never a zstd pointer. So there
    is **no new `unsafe`**, and the audited module is not widened.
- **Decode reuse is withdrawn** until the liaison approves a design. The
  decode arenas do contribute, about 82 MB anonymous (§5). The proposed design
  is the same shape as encode: plain regions plus an `in_region` hook.
- **Open (asked of the liaison):** releasing the list when the Store closes.
  No Store-lifetime object is reachable from `SaveState` without touching
  held files (`store/handle.rs`) or persistence. The list is process-wide and
  bounded until that is decided.

**Reused bytes are identical.** `tests/encode_region_reuse.rs` encodes whole,
PREFIX and group frames in three ways:
- from a fresh workspace;
- from one region reused four times;
- from regions filled with `0xFF…`, `0xA5…` and `0x0123…`.

Every frame is byte-identical across all three. zstd initialises what it
uses, and every entry point resets the session first. A region of the wrong
size is refused.

Rejected options:
- Capping arenas (`MALLOC_ARENA_MAX`, `mallopt`): the single-arena arm runs
  about 2× slower per round (1.4 s vs 0.7 s), and an addon must not change its
  host process's allocator. `MALLOC_ARENA_MAX` and `MALLOC_MMAP_THRESHOLD_`
  were diagnostics only (§3).
- Reusing the per-Commit `Candidates` tables: measured, no effect. Reverted.

## 5. Proof

| Probe (range-14 copy, 4 lanes) | Base `413ae60d` | Encode only `0eb6ed67` | Encode + decode `dc928427` (first version, superseded) |
| --- | --- | --- | --- |
| 720 writes: RSS / anonymous at end | 1,246 / 1,198 MB | 362 / 313 MB | 281 / 233 MB |
| 3,600 writes (30 rounds): RSS, rounds 10 → 29 | 1,272 → 1,287 MB | — | 291 → 291 MB (round 15–25: 295) |
| 720 writes, reworked fix `8a14c9b5` (encode regions only, bounded; host load 8.0, 23 containers): RSS / anonymous at end | — | — | 363 / 315 MB, the encode-only level; not run for 3,600 writes |
| round time, 720-write probe (diagnostic) | 0.73–0.98 s | 0.66–0.77 s | 0.64–0.70 s |

The first version (`dc928427`) is flat over 3,600 writes, which is 3.6× the roughly 1,000
`fs.write` of a fast dev range. Times are diagnostic only (host load 8–12,
other lanes' containers running; recorded in `*.load`). No speed claim is made.

**Regression test:** `layerfs-storage/tests/save_encoder_reuse.rs` (Linux,
glibc). Eight long-lived threads take turns, each making one Save per turn.
- Without the fix: **FAIL**, 117 MiB anonymous after one Save per thread,
  134 MiB after four more rounds.
- With the fix: pass, 21 → 22 MiB, 0.01 s.

Receipts: `~/lfs-history/runs/issue352c-f043/`. It holds the probe scripts
(`mem.mjs`, `steps.mjs`, `run.sh`, `fresh.sh`), one JSONL per arm, host load
per arm, and `binaries.sha256` (addons `438bae05`, `413ae60d`, `0eb6ed67`,
`dc928427`, and the rejected Candidates arm `db9d6032`). Stores: byte copies
in this lane's volumes `layerfs-issue352c-mem14`, `-mem00` and `-mem-p3p-src`;
dev352-p3p was only read.

Checks (reworked fix): Linux `cargo test -p layerfs-storage` 64 passed, 0 failed (`save_encoder_reuse` 21 → 22 MiB; `encode_region_reuse` 2/2). Earlier version: 62 passed. Clippy
`-D warnings` clean (host). rustfmt clean on changed files. Boundary guard
unchanged (16 pre-existing violations, none in storage).

## Real ranges (c43, liaison grant 2026-10-18)

Two fast dev ranges, r15 and r16, were played on forks of p2-main-f r14:
- base addon `413ae60d`, from `bb19d9d7d`, before the fix;
- reworked fix `8a14c9b5`;
- the same daemon (`b3916aa7`, built from `926543b10`), SDK JS and snapshot.

One sample per range per arm.

| Range / command | Base peak → fix peak | End anonymous, base → fix | File-backed |
| --- | --- | --- | --- |
| r15, first half (`--until lanes`) | 1,444 → **445 MB** | 1,399 → 384 MB | 44 MB both |
| r15, second half (`--resume`) | 1,287 → **274 MB** | 1,237 → 224 MB | 48–49 MB |
| r16 (one command) | 1,398 → **462 MB** | 1,347 → 411 MB | 49 MB both |

Both arms passed every range's diff_commits verify.

The fixed arm stays at 274–462 MB, not the 233 MB of the withdrawn
encode-plus-decode version. The difference is the 1 MiB decode arenas, which
are held until a design is approved (§4).

Host load was 6.3–8.1, with 23 containers running; the outside sampler ran in
both arms.

Resources:
- Runs `c43-*`, with resources `layerfs-issue352-c43-*`.
- Runner `layerfs-issue352-c43-runner`, from a scratch wrapper around the
  harness's own `runnerArgs` with only the container name changed. This is a
  workaround until `LFS_RESOURCE_PREFIX` (issue360-storage `72782bfaa`) lands.
  The harness is unchanged.
- Attempt 1, using p3p's daemon `57141b57`, failed at setup: a protocol EOF
  between that older daemon and this branch's SDK. Recorded, not a sample.
- All c43 containers and volumes were removed afterwards.

Receipts: `~/lfs-history/runs/issue352c-f043/c43/` (`NOTES.md`, `*.smaps`,
`*.load`, the wrapper and sampler, `summarize.py`), the run folders
`~/lfs-history/runs/c43-*`, and the binaries in
`~/lfs-history/runs/issue352c-f043/bin/`.

## Not done

- **Decode-region reuse**: about 80 MB more. The design was sent to the
  liaison and is awaiting approval.
- **Releasing the idle list when the Store closes**: the question was sent to
  the liaison.
- The daemon runs the same Saves per Commit and should benefit the same way.
  Not measured.
- No heaptrack profile. The attribution in §3 rests on the allocator
  experiments and the source.
