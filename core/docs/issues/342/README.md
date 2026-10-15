# Slow paginated branch diffs

> **Status:** Dated implementation checkpoint, 2026-10-16; diagnostic evidence,
> not release performance qualification.

Issue [#342](https://github.com/Ephemeral-AI-Lab/layerfs/issues/342) follows the
[Depot #337 observations](../337/RESULTS.md). The original source is
`00351290fee575b24b33148d9651586e34d72335`. Original evidence remains unchanged.

## Cause

Each diff request created two recursive walkers from `/`. Each walker called
Content `list_after` for one name and `TreeTable::value` for that name. These
demands repeatedly read, decode and authenticate shared directory/inode B+tree
pages through fresh Storage readers. Later numeric pages repeated the prefix
scan. The JS wrapper issued one request per page; no retry loop caused the work.

The three original pages returned 96, 47 and 40 items in 9,331.066, 9,811.690
and 10,569.220 ms. Consecutive complete observations from the same daemon give:

| Page position | Object batches | Reader SQL statements | Logical pack acquisition bytes | Reader-lock wait ns |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 107,613 | 410,172 | 1,503,153,328 | 2,914,173 |
| 96 | 112,352 | 421,749 | 1,562,769,938 | 3,089,486 |
| 143 | 112,694 | 422,724 | 1,568,793,214 | 3,283,647 |

The boundaries are complete adjacent daemon calls 3→4→5→6, decoded log lines
17→18→19→20, joined to trace calls `3b5af52f-4` through `-6`. Counters show
acquisition amplification, not unique physical disk reads or resident memory.
Bounded text-read timing nodes do not provide a complete traversal/text-diff/
serialization breakdown. These observations do not isolate VPN overhead.

## Implementation

The shared recursive walker now lists at most 64 names / 8,192 encoded binding
bytes and resolves all serials in that window through Content's grouped inode
lookup. Each depth-first frame retains a bounded window and continuation. No
whole-tree collection, file filtering, new dependency, format or Store change
is introduced. This also serves grep and glob. Equal filesystem roots bypass
enumeration after page argument validation.

A regression also exposed an existing correctness bug: directory metadata
changes advanced the scan offset but were dropped from the reply. They now
produce an item; a directory with only changed children remains suppressed.
This makes pagination positions agree with emitted items.

The flat inode table prevents pruning on directory binding identity alone:
unchanged names can point to changed inode values, including all hardlink
aliases. Numeric pagination still scans the prefix. The fix reduces acquisition
amplification rather than claiming change-proportional traversal or constant
deep-page cost. Resident walker state is proportional to depth times the fixed
window, not total namespace size; no empirical memory qualification is claimed.
The existing walker does not emit `/` itself, so root-directory metadata remains
outside these path results; this patch does not claim to change that behavior.

## Verification and observations

The external `layerfs-daemon/tests/sdk_compare.rs` regressions call the real
`Service::execute_control(Request::Sdk)` boundary over Disposable Stores. Their
Store-demand assertions are correctness/mechanism checks, not latency gates.
Before the fix, all three initial tests failed: wide 1,024-file page zero used
8,238 object batches, the 2,048-file case used 16,440, and equal roots still
used 16,410. The semantic pagination test repeated `/work/binary`.

The six external tests cover wide namespaces, identical roots, hardlink aliases,
inode identity, file/directory replacement, directory metadata through an actual
Workspace chmod and Commit, binary/text omission, component ordering, 64/65-child
continuation and 255-byte names that reach the byte window before 64 entries.
The long-name case also checks grep and glob, which share the walker.

The host proofs retain five passing cases from the first final run; its metadata
case initially failed because the test fixture added an identity tag that was
already present. That test-only encoding mistake was corrected and the metadata
case alone passed. The product source was unchanged by this repair. The final
Linux release proof covers all six cases. The baseline failures and intermediate
test failure remain retained.

| Mechanism proof | Original object batches | Fixed object batches |
| --- | ---: | ---: |
| 1,024 unchanged files, page zero | 8,238 | 156 |
| 2,048 unchanged files, page zero | 16,440 | 294 |
| 2,048 files, equal roots | 16,410 | 2 |

The one new Depot diagnostic reuses the original B2 Store through an independent byte copy
on a new Docker volume and a private discovery copy. Cache state is unknown;
clone/setup may populate file cache. It is admission-ineligible and cannot
support a controlled relative speed claim. Raw evidence is retained at
`/Users/yifanxu/.codex/issue342-evidence/`; original #337 receipts are immutable.
Durable is `NOT_RUN — disabled by owner until explicit reauthorization`.

| Candidate page position | Items | SDK call ns | Object batches | Reader SQL statements | Logical pack acquisition bytes |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 103 | 1,620,235,625 | 17,152 | 78,042 | 270,421,759 |
| 103 | 44 | 1,637,243,792 | 17,352 | 72,858 | 274,694,128 |
| 147 | 38 | 1,614,791,792 | 17,349 | 72,438 | 275,173,516 |

These calls total 4,872,271,209 ns. The new command took 5,002,124,000 ns within
its 15 s bound, excluding separately recorded setup and cleanup. Independent
receipt verification took 76,613,000 ns within its 9 s bound. The old calls
totaled 29,711,976,000 ns, but these are unpaired diagnostics with unknown cache
and different metadata output: no latency ratio or release admission is claimed.

The original 183 items contained 172 unique paths and 11 repeated entries.
All 172 original unique changes retain their kind, identity and change facts.
The corrected result has 185 unique paths: it adds 13 directory metadata changes
and removes those duplicate entries. Three generated `.d` files now have omitted
hunks because metadata items change page/reply-budget boundaries; their explicit
`hunksOmitted` flags remain available for separate `fs.diff_files` inspection.
Both input roots and labels match the originals. All operator Store figures
before and after are exactly equal: logical 58,339,171,210; canonical
801,677,583; stored 278,192,281; metadata 15,444,090; file 288,509,952; free 0 bytes.
This is a read-only operation and introduces no storage trade.

[The compact diagnostic receipt](diagnostic.json) pins source, binaries, images,
input roots, exact counter operands, raw file hashes and verification scope.
Source seal: `0dcc2aaf3b851278d2cc3d916919a1c98ed668fadd69338a3ae69f5e0d7887b5`;
daemon SHA-256: `ed6c67e407cdfb0fad273f80d243df5d16b54a3087999f575e1eb061102a78a6`.
Builds are locked/offline Rust 1.85.1, Linux ARM64 release, with repository AEAD
flags and one construction worker. The original SDK/addon and immutable runtime
image are reused; the Cargo target is worktree-local. An unrelated Docker
container and uncontrolled host activity are declared interference. No build in
this worktree overlapped the selected diff calls.

Setup failures are retained separately. The first copy command refused the
unexpected `global/` layout before writing anything. A later startup stopped
before any diff because the independent byte copy had not preserved private
modes. The copied directory/files were corrected to the source's 0700/0600 modes,
with exact bytes verified unchanged. A fresh discovery directory was used for
the corrected startup; the old failed intent/logs remain. Both daemon streams
were saved before successful SDK close; the failed startup container was also
removed after its logs were saved. The original Store volume is untouched; the
diagnostic volume is retained. Connection EOF diagnostics are retained alongside
complete call observations and known SDK results.

## Changed-scope checks

The final checkpoint records host/Linux external SDK regressions, host daemon
library/binary/example targets, warning-denying scoped Clippy, scoped formatting,
fuser provenance, the product boundary guard and 50 guard self-tests. Root-wide
formatting retains the existing unrelated failure at
`layerfs-persistence/tests/sqlite_group_rows_indexed.rs:133`; its source is
unchanged. No aggregate CI/pre-push gate or release campaign was run. FUSE and
construction product paths are unchanged; unrelated earlier-family evidence is
reused rather than rerun. Per-command results and source-size comparison are
included in the final issue/commit handoff.
