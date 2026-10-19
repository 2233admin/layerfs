# Sandbox exec output · the 1 MiB stdout cap is removed; large output is paged

> **Status:** Current fix record. Product change in the JS SDK's native binding
> and `sandbox.exec`; daemon and Store format unchanged.

| | |
| --- | --- |
| Trigger | fix 052: r027 a1 `r027-1-root.end` P5 NOT_RUN, a 204-file vitest JSON report cut at the exec's 1 MiB stdout cap |
| Owner | 2026-10-20: "if it is working, then take the change of 1 mib"; asked about the SDK memory fix as well, chose "Both". This reverses the earlier "cap stays" decision recorded in 052 the same day |
| Kind | code path: `sdk/js/native/src/exec.rs`, new `output.rs`, `dispatch.rs`, `lib.rs`; `sdk/js/src/sandbox/exec.js`, `client.js` |
| Binaries | Linux addon, release, pinned image `378b799ef433`: old `2c6d1892` (origin/main `3c7852e50f` source) → new `6bc72b7d`; daemon `27a769a4` (built from `3c7852e50f`, unchanged) |
| Commits | memory fix `dfdea59357` (convert.rs, see below), this commit |
| Tests | new `sdk/js/test/exec_output.mjs` (stand-in binding), new `sdk/js/test/verify/exec_output_real.mjs` (Linux, real Docker) |
| Production LOC | in the commit message |

## Where the limits were

The stdout/stderr path, end to end:

| Layer | Limit | Kind | After |
| --- | --- | --- | --- |
| Engine attach stream (`layerfs-sandbox` `backend/docker/mux.rs`) | 8-byte frame header, u32 frame length | protocol | kept |
| Sandbox backend `RuntimeOutput::copy_to` (`streams.rs`) | 8 KiB pending window; reads only as fast as the sink accepts | bounded window with backpressure, no total | kept |
| HTTP framing (`body.rs`) | 8 KiB chunk-size line; chunk sizes are counters | protocol metadata | kept |
| JS binding `exec.rs` `Kept` sink | first 1 MiB per stream kept, the rest counted and dropped (`truncated: true`) | **artificial total cap** | **removed** |
| Bridge / daemon | not on the exec path: exec goes to the Engine from the client process | — | — |
| JS SDK `sandbox.exec` | returned the binding's value | — | pages spooled streams |

## Design

- **Spool** (`output.rs`). Each stream is kept in memory up to 1 MiB, the old
  window. A stream that grows past it spills, kept bytes first, to a file in
  the host temp directory, opened `create_new`, mode 0600, and unlinked at
  once; a 64 KiB write buffer. Closing the file or ending the process frees
  it. No `fsync`, nothing reserved ahead. A spool is bounded by free disk
  space only.
- **Result.** A stream that fits is inline text exactly as before. If either
  spilled, that field is null and the result also names its `output` and
  both sizes, `stdoutBytes` and `stderrBytes`. `truncated` is always false.
  `spool: true` spools every non-empty stream; the JS SDK uses it for sinks.
- **Pages.** A new binding export, `execOutput(args, page)`, `pread`s at most
  1 MiB of a spooled stream straight into a Buffer the caller passes. The
  file is shared out of the output table, so the read holds no lock.
  `sandbox.exec_release` closes the spool.
- **JS** (`exec.js`). A result with no spool is returned untouched. Otherwise
  one 1 MiB window is reused for every page: as text, each page is decoded by
  a streaming `TextDecoder`. With `{ stdout, stderr }` sinks, each page is
  written after the sink's callback for the last. The spool is released in a
  `finally`. A sink must not keep a chunk after its callback. Page reads are
  not traced.

The first version returned each page as a new `Bytes` value. Fed through
sinks, 64 MiB per stream left the client 126.5 MiB larger and 184.3 MiB
resident after `gc()` (base 59.7). Two causes, one diagnostic run each:

- with `MALLOC_MMAP_THRESHOLD_=131072`, RSS after `gc()` was 61.5 MiB. The
  page Vecs had raised glibc's dynamic mmap threshold and stayed in up to 64
  per-thread arenas (`MALLOC_ARENA_MAX=2`: growth 67.7 MiB).
- the peak was still +66 MiB: every page was a new JS Buffer, collected only
  at V8's external-memory trigger.

Copying pages into V8 memory instead of external buffers (`dfdea59357`) did
not change it: 188.9 MiB after `gc()`. Filling one caller-owned window
removes both causes.

## Evidence

All on Linux, runtime image `d3773b4e` as client and Sandbox image, one sample
per arm. Receipts: `core/target/stdoutcap/*.log` in the fixing worktree and
`~/lfs-history/evidence/f056-exec-stdout-20261020/`.

- **Complete output** (`exec_output_real.mjs check`, addon `6bc72b7d`):
  - the small and empty results are exactly the old ordered fields;
  - 64 MiB per stream of every byte value, interleaved in 1 B–64 KiB chunks,
    through sinks: SHA-256 equal on both streams;
  - 1, 8 and 64 MiB per stream of UTF-8 text: string and bytes equal (1 MiB
    stays inline with the old shape);
  - no spool file left in `/tmp`.
- **Memory bound.** 128 MiB through sinks: RSS 61.7 → peak 64.1 MiB (growth
  2.4 MiB, asserted < 32 MiB), 63.2 MiB after `gc()`. The binding holds at most
  1 MiB inline per stream while a stream is under the window, then a 64 KiB
  write buffer per spooled stream, plus the backend's 8 KiB window; the page
  is the caller's single 1 MiB window. A text result is O(output) because the
  caller asked for a string.
- **The 052 case.** r027-1-root.end P5 on a fork of snapshot range 027
  (`p3-main-s`) into volume `layerfs-issue352-f056-r027`, branch
  `r027-1-root`, 204 files, `vitestCommand` without `compact`:

  | | old `2c6d1892` | new `6bc72b7d` |
  | --- | --- | --- |
  | stdout | 1,048,576 bytes, `truncated: true` | 1,185,213 bytes, `truncated: false` |
  | parse | "Unterminated string in JSON at position 1047152" | 204 files |
  | vs a2's recorded results | — | equal, 204 pass |
  | exec | 15.99 s | 13.78 s |

- **Time** (`exec_output_real.mjs time`, 1-min load 9.2):

  | | old | new | delta |
  | --- | --- | --- | --- |
  | `echo hi` p50 of 30 (after one unmeasured) | 38.08 ms | 32.36 ms | −5.72 ms: no slowdown (5 ms floor) |
  | 8 MiB per stream | 304.7 ms (cut to 1 MiB) | 288.8 ms (complete) | −15.9 ms |

- **Checks:**
  - Linux: `layerfs-node` Clippy `-D warnings` and tests (1 pass);
  - host: Clippy and tests;
  - rustfmt on the changed files;
  - JS: `exec_output.mjs`, `trace.mjs` (8 cases), `packaging.mjs` lazy and
    dispatch.
  - `check_product_boundary.py` reports 57 violations, identical to origin/main
    `a863e92f88`; none are in these files.
- **Not reproduced.** One `check` run reached its 120 s alarm before any
  output was kept (`outer` prints only at the end). The next run of the same
  binary finished in seconds; the hang's cause is unknown.

## Harness

The compact vitest report from 052 stays. The replay's current addons predate
this change and still cut at 1 MiB, and the compact report is smaller to move
and parse. It can go once the replay runs an addon with this change.
