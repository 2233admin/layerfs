# #359 · F-A4 · codec arenas from one zeroed allocation

| | |
| --- | --- |
| Trigger | #359 RCA §6 F-A4: `encoding/codec.rs` `workspace()` reserved each arena and then filled it with `resize(n, 0)`. That is a 16 MiB memset for each Save's encode workspace, and a 1 MiB memset for each decoding demand's arena |
| Kind | code path only (storage). No codec setting, level, window, profile or frame limit is changed (owner, 2026-10-18: "do not touch codec to adjust its settings unless for modifications"). No format change |
| Commit | `f7cd6311b` on local branch `issue359-impl` (not pushed) |
| Binaries | before: A1 `4393a8e4` (`9bb2be502`) → after: `755ea77b`, addon `4aee419d` (`f7cd6311b`) |
| Production LOC | 98431 → 98432 (+1) |
| Status | implemented; storage tests pass; one sample per arm |

## Change

`workspace(size)` now takes one fallible `std::alloc::alloc_zeroed` of
`Layout::array::<u64>(size.div_ceil(8))` and hands the block to
`Vec::from_raw_parts` with length = capacity = words. The arena is never
written here. Where the allocator maps fresh pages, they are zero without a
memset and become resident only when the codec touches them.

Unchanged:

- the arena's contents (all zero), its length, and so the charged
  `workspace_bytes` and the reserved-space accounting;
- a failed allocation is still refused with `resource()`;
- every stored byte: the codec sees the same zeroed memory.

Deviation from the reviewed design. The design named `vec![0; n]`, but that
aborts the process when allocation fails, where the old code refused. So the
fallible form is used. It needs two `unsafe` blocks, both inside storage's
one audited FFI module. The boundary guard reports 19 violations, the same
as the baseline.

Caveat: glibc's `calloc` skips the memset only for chunks it maps freshly.
Above its dynamic mmap threshold that is the normal case for a 16 MiB arena.
A reused heap chunk is still zeroed by `calloc` itself, so the saving is
allocator-dependent, not guaranteed.

## Samples

`cost.mjs case <id> --binary 755ea77b --label fa4`, ledger seq 317–321. The
A1 arms are seq 283–297 (record 020). One sample per arm: Disposable Store,
`LAYERFS_CONSTRUCTION_WORKERS=1`, fresh volume per sample. Host load (1 min)
7.8–8.7 against 5.8–10.9 for A1, with two non-#359 issue containers in both.
The cache state is as each case declares it (record 020).

| Case / step | Native ms | A1 ms | F-A4 ms | Store statements | Reader requests | Pack bytes | LOOKUP | Owner jobs | Owner hold ms |
| --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| small-commit / edit | — | 3.4 | 4.3 | 63 = | 10 = | 266,648 = | 1 = | 9 = | 0.48 → 0.41 |
| small-commit / commit | — | 18.1 | 16.6 | 42 = | — | — | — | — | — |
| small-commit / whole case (ledger) | — | 2,998 | 2,574 | | | | | | |
| du-s / cold | 113 | 16,016 | 12,986 | 231,096 → 231,131 | 219,557 → 219,559 | 46.3 → 46.4 MB | 51,490 = | 139,834 → 139,835 | 3,729 → 3,216 |
| du-s / steady | 116 | 3,970 | 3,346 | 40,153 = | 36,476 = | 14.1 MB = | 0 = | 50,756 = | 909 → 779 |
| grep-r / cold | 568 | 27,773 | 21,976 | 264,710 → 264,741 | 259,063 → 259,065 | 74.4 → 74.6 MB | 51,490 = | 273,526 → 269,434 | 5,283 → 4,476 |
| grep-r / steady | 555 | 19,876 | 12,877 | 264,203 → 257,114 | 265,577 → 243,368 | 61.8 → 45.3 MB | 11,468 → 3,048 | 257,462 → 221,569 | 2,969 → 2,094 |

`=` means unchanged. Store transactions are 0 in every arm.

**Cache state (corrected 2026-10-18, VERIFICATION.md finding 1).** The arm
names are `cost.mjs` step names, not cache claims:

- `cold` is the first run in a fresh one-shot Workspace on a fresh daemon.
- `steady` is the same Workspace run again.
- `native` is a page-cache-resident copy of the tree.

In every arm the Store file stays resident in the VM page cache after the
clone (declared, not controlled). `cost.mjs` drops no cache and checks no
residency. Earlier wording here said the page cache was dropped; that was
wrong and is withdrawn. No cold-cache claim is made. Wall times are
warm-Store diagnostics only (AGENTS §1); the count comparisons (lookups,
statements, requests, jobs) are unaffected.

**Budget (declared exception).** These cases exceed the 15 s / 25 s
defaults (measurement policy §3.7). Each runs in its own command under the
#359 owner-scoped exception, "each case runs in its own command, under 2
minutes" (RCA §10). Command times from the ledger: du-s 19.1 s, grep-r 37.5 s; small-commit 2.6 s is within the default.

**Dependency.** The correctness lane's F-043 fix reuses encode workspaces
across Saves, through an idle list in `save/state.rs`, on top of this
change. Once it lands, the Save-side (encode) figures here move. The small
Commit row will no longer isolate F-A4, and these numbers are not carried
forward past that integration.


## Reading

- **du-s** (cold −19%, steady −16%): the counts are equal, and owner hold
  time fell 14–15%. That fits a per-demand 1 MiB memset removed from the
  decode path. It is one sample per arm under shared host load, so it is
  consistent with F-A4 but not attributed beyond that.
- **grep-r steady** (−35%) is not attributable to F-A4. Its LOOKUPs fell
  11,468 → 3,048, back towards the 999 before A1. That is the kernel-dentry
  variation record 020 left open, and it changed the work itself. **grep-r
  cold** (−21%) has equal counts, like du-s.
- **small-commit**: Commit 18.1 → 16.6 ms, whole case 3.0 → 2.6 s. The encode
  arena is 16 MiB per Save, so this is where the memset was largest. The
  ≤5 ms small-Commit target is still missed.
- **Memory**: `NOT_MEASURED`. The cases record no daemon RSS. The
  charged `workspace_bytes` is unchanged by construction. Resident memory
  can only fall, since untouched arena pages may stay unmapped, but that is
  not measured.
- **Storage**: unchanged; the stored bytes are identical.

## Proof

- `layerfs-storage`: all tests pass; clippy `-D warnings` is clean.
- Boundary guard: 19 violations, identical to the baseline.
