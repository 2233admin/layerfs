# Depot implementation and independent validation — #337

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Date: 2026-10-16, Asia/Singapore. Scope: issue
[#337](https://github.com/Ephemeral-AI-Lab/layerfs/issues/337), under collection
[#336](https://github.com/Ephemeral-AI-Lab/layerfs/issues/336).

Phases A–D are complete. Both builders finished M1–M6 and full acceptance
on separate Branches forked from their post-M6 main Layers. Independent
Builder 2 needed no product or skill fix. The original campaign was published through PR #338; the additional Builder 2
reporting detail below is preserved as a documentation follow-up.
Both builders implemented the full six-milestone Rust Depot application from
the same frozen inputs. [SPEC.md](SPEC.md) defines application behavior;
[ACCEPTANCE.md](ACCEPTANCE.md) defines the command and lifecycle requirements.

All numerical results are diagnostics from application development and checking,
with tracing enabled and unknown OS cache state. Different implementations,
work histories, mount paths and Cargo contexts prevent a performance comparison
between the builders. These results do not qualify a release, cold-cache
performance, continuous memory bounds, power-loss durability or distributed GC.

## Source and environment identities

| Identity | Pinned value |
| --- | --- |
| Starting main | `358e92cf74e55a4cbf38ea63a63eff2ca9aa2c22` |
| Campaign Git branch | `codex/issue337-depot-run` |
| P-001 Content fix | `db5b1bac9490cb8aeef569cddf18b924cbc3b75d` |
| Frozen inputs commit | `608d15a2fe651625ad6707bce8e5cd86c18b2f4d` |
| Freeze revision 2 SHA256 | `a3b4b05010b6d84f67e177f9b750682ff07c5f15a82a037fcb56df5f67659a60` |
| P-002 merge-reply fix | `eaa64f4db050420155e2693720fcf654d1491630` |
| Builder 1 completion / rebuilt product tip | `0cf3d39cae3e6f391c391998728b14d757450efd` |
| Rebuilt tip tree | `60d616cd52f91a553d2f8c2a1d56d62a8ba307ee` |
| Runtime and browser image | `sha256:091f785ba7d5d036dfa350e8fd69ee1fcd2d8320c3706841c8c95e6411eee9d2` |
| Linux product-build image | `sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6` |
| Installed daemon SHA256 | `3bb1464c4ef03c2715203e879a3724b485e0da38fde89c701231c8a594cbc9ad` |
| Installed addon SHA256 | `83d3f2746542306ec40b634b4ca4aef0c4c90ca86fc118c322a7829dc858d0e5` |
| Cargo.lock SHA256 | `043316e7a149b4f61fc9feffcef3f1dc2eb24146c4e5da3754975fbb8ebf096d` |

The committed tip was rebuilt after Builder 1 released repository ownership.
The focused fuser provenance check passed first; host addon and Linux daemon
locked/offline release builds then passed. The Linux build selected the exact
image ID, and the repository ARM64 AEAD flags remained in effect. Resulting
binary hashes equal the P-002 binaries used by the completed Builder 1 recovery.

Rust/Cargo 1.85.1, edition 2021, system SQLite 3.40.1, Chromium/Chromedriver
155.0.8059.39 and Selenium 4.8.3 are pinned. The lockfile has 157 registry
packages plus four Depot workspace packages. Exact direct versions and features
are in [DEPENDENCIES.md](DEPENDENCIES.md); exact image/toolchain details are in
[ENVIRONMENT.json](ENVIRONMENT.json). The standalone installation separately
records its active binaries and product tip, so the original frozen environment
snapshot is not mistaken for the final installed product.

Global Stores use explicit **Disposable / WAL / synchronous=OFF** through the
supplied native initializer. Workspace overlays use MEMORY/OFF/EXCLUSIVE.
**Durable: NOT_RUN — disabled by owner until explicit reauthorization.**
`LAYERFS_CONSTRUCTION_WORKERS=1` is supplied throughout. Cargo dependencies and
target output stay inside each LayerFS view; the toolchain comes from the image.
There is no host-built Depot binary or shared external writable Cargo cache.
Only `target/` and `.cargo-home/` use LWW; source, manifests, Cargo.lock and
application data do not.

## Preparation and independence

Phase A exercised registry HTTPS access, locked dependency fetch, each package's
first build, an unchanged same-Workspace build, a source-edit rebuild, prebuilt
tests, SQLite close/reopen, Clippy/fmt/package inspection, a clean rebuild, actual
Chromium interaction and executable retention after a fresh mount. This was a
prerequisite probe, not Depot application acceptance. [PHASE-A.md](PHASE-A.md)
retains its original outcomes and P-001 recovery. Freeze revision 2 preceded
Builder 1 Init; the earlier whitespace-only candidate remains archived.

Builder 1 was the sole fixing subagent and repository writer during its run.
It retained its original Store through P-002. After it completed, the orchestrator
rebuilt the committed tip and installed only the SDK, copied SDK skill, frozen
specification/common/acceptance inputs, and environment/output space into a
standalone folder outside the repository. A NEW agent with no inherited history
implemented Builder 2. It was instructed not to read the repository, issue, Builder 1 application,
scripts, tests, report or recovery notes and made no product or skill changes.

| Run | Project | Docker volume | Init Layer |
| --- | --- | --- | --- |
| Phase A | `depot-a-20261016` | `layerfs-issue337-a-20261016` | `32cc971417ee2f7522a42fe17d354cc697e05766d6b427a0995e74e0a60f49ce23` |
| Builder 1 | `depot-builder1-20261016` | `layerfs-issue337-b1-20261016` | `320c27c6d8a172fc9b8db4b42d20c919747efbc0b664f430de4c217826706c3365` |
| Builder 2 r1 | `depot-builder2-20261016-r1` | `layerfs-issue337-b2-20261016-r1` | `320e77381e6ca2047db0513e1bb8cc49d023b5faded2b8d41463d92ddedb021e81` |

Each successful Init is its own step. The orchestrator captured initial operator
stats separately before any fork/scaffold/mount/mutation. Builder 2's first Init
was refused before effects because the orchestrator had precreated HOME with
mode 0755. Ownership matched the current user; HOME and the volume were proved
empty. The orchestrator corrected only the directory mode to 0700, retained the
original refusal, and explicitly identified a new Init at step 002. Separate
step 003 stats preceded project work from 004. SDK/daemon/skill bytes were
unchanged; this was a supplied-environment correction before Store creation,
not a patched initialized Store or product-fix continuation. The exact evidence
is `ENVIRONMENT-CORRECTION.json` and the original/successful Init receipts in the
standalone run. [BUGS.md](BUGS.md) distinguishes these categories.

## Builder 1 acceptance and Branch custody

All six milestones passed and were published in order. The final main Layer is
`3267a5a23faa4dfabe196cef0a90003a8abcd2d8c7982f578a56e08fc51eb04f84`, from
`acceptance` Commit
`122f959401666970774f02035d5d86e258d3d31f858c486a23876e07966121cce6`.
The separate `final-main-acceptance` Branch forked that exact post-M6 Layer and
ends at `121cccbc53ebf7baa8706f087b95057c0bd6b776af6e859be6bd4a509a8c069961`.
It was not republished over the main Layer that it was intended to validate.
All publication identities appear in the [publication table](tables/builder1-publications.csv).

The M6 qualifying candidate and the final-main acceptance are separately named.
The latter proved all 44 source/configuration/manifest/lock/documentation/test
files byte-identical, used a new Workspace, removed target output while retaining
the in-view dependency source cache, and repeated every frozen quality command.

| Required behavior | Builder 1 final-main outcome |
| --- | --- |
| Four scoped clean builds; prebuilt tests | PASS |
| Domain / Store / server / CLI external Rust tests | PASS: 3 / 3 / 2 / 1, nine total |
| Per-package library doc checks | PASS, zero executable examples; binary doctests inapplicable |
| Warning-denying Clippy; fmt; four inspected package listings | PASS |
| Repository/API identifiers, errors, ordering, pagination and filtering | PASS |
| Streaming API/CLI exact bytes, ETag and failure exit/partial-download behavior | PASS |
| Same-identity one-201/one-409 concurrency and independent identities | PASS |
| Interrupted upload, publication-boundary fault, restart reconciliation | PASS |
| Actual Selenium/Chromium create/upload/progress/info/download/error/delete | PASS |
| All 71 frozen fixtures, including 64 small files | PASS |
| Three separately committed 32 MiB versions; independent version files | PASS |
| Fresh remount, retained 0755 executables, 32 MiB CLI download/hash | PASS |
| App/browser active and zombie processes; mounted Workspaces | Empty at cleanup |
| Both daemon streams before each close; explicit and service cleanup | PASS |

Registry and web-recovery forked published M3 and alternated source/build/check
steps. The original merge lost its transport reply due to P-002; refs and the
failed attempt were preserved. The rebuilt daemon returned a typed Conflict on
a distinctly identified operation. Original inputs were retained; working forks
kept both Store module declarations. The other conflict was generated Python
bytecode with equal source but different embedded Workspace paths; it was
inspected and removed on both working forks without expanding LWW. The reviewed
merge succeeded. Two Workspaces then changed different source/test files on one
Branch, and both changes survived the second Commit's normal merge.

Every one of 92 Bash calls has full command/output and a Commit outcome: 91 exit
0, one retained application compile exit 101; 67 Committed and 25 UpToDate.
The compile issue used Axum Query despite the frozen feature set; source was
corrected to RawQuery without changing dependencies. It is an application
mistake, separate from P-002. All returned streams report `truncated=false`.

## Product defects and guidance

P-001 is the Content repeated-extent accounting bug found during Phase A.
After a short repetition was consumed while flushing a mixed prefix, the builder
fell through with count zero and replaced the remaining mixed suffix. The
three-line early return preserves it. The external regression compares canonical
roots against ordinary construction for counts 1/2/3 over 193 extents; it fails
before the fix. All 473 Content tests, scoped Clippy/formatting, boundary guard
and 50 guard self-tests pass after it. A new daemon successfully committed Cargo
output on the existing Store. The failed/uncommitted generated Workspaces were
explicitly abandoned only after forensic/log retention and stopped export.

P-002 is the SDK merge-diagnostic overflow found during Builder 1. The normal
encoder failed before the fix with 700 Cargo LWW paths and 900 multibyte conflict
paths. Separate byte windows now bound diagnostic lists, with explicit
`conflictsTruncated`, `lwwTruncated` and per-conflict `hunksOmitted`. The 65,519-byte
transport limit and merge/publication work are unchanged. Paged diff/read
inspection retains complete source access when summaries omit details. Bridge's
25 tests, one API conversion regression, scoped all-target Clippy/fmt, boundary
guard and 50 self-tests pass. The live same-Store typed Conflict and reviewed
successful merge verify the original integration path.

The SDK skill gained the live-checked Cargo workflow and merge-diagnostic
omission/inspection guidance. Product fixes and source/API documentation are
committed together. The frozen application/dependency/fixture/common-prompt
bundle was not changed. Existing root-wide fmt failure in
`layerfs-persistence/tests/sqlite_group_rows_indexed.rs:133` remains disclosed and
untouched. No full-workspace, CI-green or release-gate claim is made.

## Storage accounting

Bytes below are exact operator counters. Store logical bytes count every Commit
and Layer's full regular-file tree, including hardlink paths, Cargo state, test
data and repeated history. Canonical bytes are distinct registered objects;
stored bytes are compressed/delta-encoded pack bodies. They are not exclusive
per-artifact allocation.

| Counter | Phase A initial | Phase A final | Builder 1 initial | Builder 1 final | Builder 2 initial | Builder 2 final |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Logical | 21 | 6,383,544,355 | 21 | 59,654,311,174 | 21 | 58,339,171,210 |
| Canonical | 2,104 | 541,219,037 | 2,104 | 890,905,845 | 2,104 | 801,677,583 |
| Stored | 2,060 | 167,979,969 | 2,062 | 309,877,539 | 2,061 | 278,192,281 |
| Metadata including SQLite overhead | 155,157 | 8,414,307 | 155,157 | 17,535,740 | 155,157 | 15,444,090 |
| File | 155,648 | 174,395,392 | 155,648 | 321,372,160 | 155,648 | 288,509,952 |
| Free | 0 | 0 | 0 | 0 | 0 | 0 |
| Logical / canonical | 0.009981 | 11.794752 | 0.009981 | 66.959165 | 0.009981 | 72.771364 |
| Canonical / stored | 1.021359 | 3.221926 | 1.020369 | 2.875026 | 1.020864 | 2.881739 |

SQLite overhead is `file - free - stored`. Metadata is metadata-pack bodies plus
that overhead; stored already includes metadata-pack bodies. Never add stored
and metadata to derive physical bytes. Builder 1's final metadata-pack bodies
are 6,041,119 bytes and SQLite overhead is 11,494,621 bytes. Builder 2
has 5,126,419 metadata-pack bytes and 10,317,671 SQLite overhead bytes.

Builder 1's 76 unique Commit records sum to 55,229,286,688 logical bytes; seven
Layers add 4,425,024,486, exactly reproducing final logical bytes. Initial totals
plus all acknowledged Commit Save counters exactly reproduce canonical, stored
and metadata-pack totals (gap 0). All public histories/operator rows match all
76 rows in the read-only restored Store, and snapshot Layer records match all
seven restored Layers. [Reconciliation](tables/builder1-export-reconciliation.json)
and [per-Commit storage](tables/builder1-commits.csv) retain the arithmetic.

Builder 2's 75 Commit records sum to 54,332,680,273 logical bytes and seven
Layers add 4,006,490,937, exactly reproducing 58,339,171,210. Its initial
totals plus acknowledged Save counters reproduce all canonical, stored and
metadata-pack totals (gap 0). All public/operator Commit rows and snapshot
Layers match the WAL-visible restored Store; 74 inline Commit Save payloads
match their storage records (the Branch merge has no inline Save payload).
[Reconciliation](tables/builder2-export-reconciliation.json) and
[per-Commit storage](tables/builder2-commits.csv) retain the checks.

Phase A has an acknowledged-Save gap of 35,795,831 canonical, 10,950,902 stored
and 100,782 metadata-pack bytes. Failed construction and other Save work remain
possible sources; the gap is retained without invented path attribution or
relabeling the failed Commit. The stopped Store's counters themselves reconcile
exactly. The initial observation was not reconstructed from a later Store.

## Calls, phases and filesystem counters

[Complete per-step, per-method, phase and per-Commit tables](tables/README.md)
carry exact counts/median/p95/max and source hashes. Median uses
`statistics.median`; p95 uses nearest rank `ceil(0.95*n)`. All units are raw
milliseconds. SDK failures and returned nonzero process exits are separate.

| Run | Completed trace calls | Public SDK | Internal service | Operator | Unique joined daemon observations |
| --- | ---: | ---: | ---: | ---: | ---: |
| Phase A | 93 | 76 | 10 | 7 | 165 / 165 |
| Builder 1 | 371 | 335 | 25 | 11 | 567 / 567 |
| Builder 2 | 258 | 231 | 19 | 8 | 443 / 443 |

| Builder 1 method | Count | Median ms | p95 ms | Max ms |
| --- | ---: | ---: | ---: | ---: |
| sandbox.exec | 92 | 1,632.4095 | 14,001.863 | 33,174.396 |
| sandbox.commit | 92 | 48.4895 | 1,448.009 | 4,926.090 |
| sandbox.mount | 14 | 27.683 | 45.022 | 45.022 |
| branch.merge | 3 | 548.447 | 628.346 | 628.346 |

| Builder 2 method | Count | Median ms | p95 ms | Max ms |
| --- | ---: | ---: | ---: | ---: |
| sandbox.exec | 82 | 1,306.9305 | 14,116.757 | 35,779.826 |
| sandbox.commit | 82 | 37.973 | 1,450.171 | 5,089.991 |
| sandbox.mount | 12 | 26.3315 | 39.272 | 39.272 |
| branch.merge | 1 | 158.989 | 158.989 | 158.989 |

Dependency fetch, first package build, unchanged-context build, source-edit
rebuild and clean rebuild have separate labeled steps and full command receipts.
An unchanged source build can still recompile after Cargo feature unification or
Workspace path changes; it is not automatically a cache hit. No build timer is
credited with setup warmth as a performance proof.

Builder 1's 11,435 observed timing nodes omit 16,562 bounded nodes. Parent/child
spans overlap and are not additive. The three merge SDK calls have only two
returned inline phase trees because the original reply was lost. Commit capture,
construction, finish/publication/install and mount bind/attach phases are
reported separately with their own observed counts. See the complete
[phase table](tables/builder1-phases.csv), rather than interpreting an absent
phase as zero. Builder 2 has 10,650 observed nodes and 15,908 bounded
omissions, including one returned merge phase tree; its complete
[phase table](tables/builder2-phases.csv) uses the same separate paths.

Phase A provides 128 kernel boundaries over seven mounts; Builder 1 provides
412 over 14 mounts; Builder 2 provides 373 over 12 mounts. All preserved observations are complete and joined, with
no counter resets when ordered by original stderr emission. Connection-local
call numbers reset and cannot establish global order. Opcode frames, disposal
units and FORGET/WRITE ownership units are separate; none is an OS syscall
count. Missing sections and first deltas remain unavailable. Per-mount observed
maxima do not by themselves prove final-event completeness or per-Exec attribution.

## Evidence and limitations

External evidence root: `/Users/yifanxu/.codex/issue337-evidence/`.
Original independent folder: `/Users/yifanxu/.codex/issue337-independent/r1/`.
Campaign raw roots are `core/target/issue337/phase-a`, `builder1` and the
orchestrator's `builder2` mirror. Builder 2 never reads the repository mirror.

| Preserved archive | Bytes | SHA256 | Verification |
| --- | ---: | --- | --- |
| Phase A raw | 504,068,096 | `bd5662bcb3aa64dc276a1c8b032d604befec8bb41332190a08aff07c501d4d56` | Every receipt byte/link checked; tar-generated AppleDouble metadata identified separately |
| Phase A stopped Store before P-001 replacement | 82,984,960 | `0a2f7f459502ebeb463358a03b604ece559ca2464a5ab526dd8295d19d7fe4e9` | WAL-visible read-only quick_check=ok; exact counter reconciliation |
| Phase A final stopped Store | 178,534,400 | `1fb04823c6d780fdee359ae64d884ccdfa2f280214b39b1e5882acabf55c21ae` | WAL-visible read-only quick_check=ok; exact counter reconciliation |
| Builder 1 raw | 30,115,840 | `265009ef3091d234c85e7958dc02d6fcfca65948785e50aa0dfe71931f935b06` | All 852 files/links verified |
| Builder 1 stopped Store | 325,550,080 | `a58104a7bdeb21de8e74e31c3eb7b82aff28ed6b7d5080c27f6dbd3d8a6dbea8` | WAL-visible read-only quick_check=ok; counters/rows match; bytes unchanged |
| Builder 2 raw | 22,753,280 | `c89197f6a7fc013bb904e719d128dd9f94187f3abf7e487943dad109dc23bab6` | Every receipt byte/link verified |
| Builder 2 standalone environment | 37,498,880 | `c1d86ca6240d434100c30ee6bb2d0e4daa61ef5410bfb26cbdc5c3d3b639aff9` | SDK/skill/frozen inputs/binaries unchanged; every archived byte/link verified |
| Builder 2 stopped Store | 292,669,440 | `8e1f2d3922b3a646eea43a0238c11b4bc9ac25474b849a2cff0567ac1b822593` | WAL-visible read-only quick_check=ok; 75 Commits/7 Layers/counters match; bytes unchanged |
| Pinned runtime/build images | 2,407,162,880 | `f1ab517be475ea2091692fd0503e73477356c109298e90a13fe71fde113888c9` | Both pinned OCI indexes and all 22 reachable blob digests/lengths verified |

Phase A also retains stopped exports before P-001 daemon replacement and after
its complete probe. Both were restored read-only with WAL visible and reconciled
against their own counters. No `immutable=1` shortcut hid WAL state. Private HOME
and exact Store main/WAL/SHM bytes remain outside Git with manifests. No Store,
history, failed receipt or source branch was deleted during recovery.

The Phase A generic host runner overwrote semantic init.json and initial-stats.json
because their basenames collided with command metadata. Original stdout retains
the exact isolated Init and pre-fork stats; normalized payloads have explicit
source hashes/provenance. The original metadata was not overwritten again, and
no late query supplied the initial baseline. Builder runs use distinct stems.
Initial external table/OCI archive-verification assumptions were corrected with
their failed analysis receipts preserved; final sources and inputs are pinned.
Read-only host archival/hash work overlapped application development and is part
of the declared unknown diagnostic conditions.

The global Store policy and application recovery checks do not promise power-loss
durability, process/memory/socket checkpointing or preservation of runtime logs
unless saved as explicit artifacts. Package listings do not publish packages.
The original campaign checkpoint preceded publication authorization. The owner
subsequently authorized push and merge, completed through PR #338; this record
retains the original qualification and limits.

## Production source comparison

Exact first-parent/staged-tree Git archives were counted with the same pinned
`tools/production_loc.py` counter, excluding blank/comment lines, inline tests,
external tests, docs, tooling, manifests and generated output while including
runtime SQL and shipped SDK implementation. Committed-tree confirmations are
retained with each receipt.

| Commit | Production LOC before -> after | Signed delta | Core | SDK |
| --- | --- | ---: | --- | --- |
| `db5b1bac9490cb8aeef569cddf18b924cbc3b75d` | 87,552 -> 87,555 | +3 | 85,708 -> 85,711 | 1,844 unchanged |
| `608d15a2fe651625ad6707bce8e5cd86c18b2f4d` | 87,555 -> 87,555 | 0 | 85,711 unchanged | 1,844 unchanged |
| `eaa64f4db050420155e2693720fcf654d1491630` | 87,555 -> 87,657 | +102 | 85,711 -> 85,813 | 1,844 unchanged |
| `0cf3d39cae3e6f391c391998728b14d757450efd` | 87,657 -> 87,657 | 0 | 85,813 unchanged | 1,844 unchanged |
| `4cbd35d32d9d7de9d01ac4977c114dafb8432e26` | 87,657 -> 87,657 | 0 | 85,813 unchanged | 1,844 unchanged |
| `9021aa0398dc8317eba0caeed6f530d9cd0f889e` (PR #338 merge, first parent) | 87,552 -> 87,657 | +105 | 85,708 -> 85,813 | 1,844 unchanged |
| Builder 2 detail docs commit (this tree) | 87,657 -> 87,657 | 0 | 85,813 unchanged | 1,844 unchanged |
| Builder 2 detail publication merge (this tree, first parent) | 87,657 -> 87,657 | 0 | 85,813 unchanged | 1,844 unchanged |

Reference absent (retired R9c; last counted 65,417 at tree `498dd1917812`).
This source-size comparison is not a performance or algorithmic simplification
claim. The campaign's production changes total +105 LOC; the Depot application
itself lives in its LayerFS Store rather than a second Git implementation.

## Independent Builder 2 outcome

The independent agent completed every milestone, published six main Layers and
passed full acceptance again on a new Branch from final main. Main M6 is
`3294a0bc8ac91fed525a315eff34e40c212770b5c9739dd86bd85ce40cf1674365`,
from `combined` Commit
`12b3b45aaf42697fb7392cdfca491b9d2d5fbb9241853d295076389ab47cc8f73e`.
The separate final-main acceptance head is
`1220d5463170a32ed6c5fde50cf95cc6ba8bec25d3d279333bec8e5489e7f4cb9a`.
All five mutable Branch histories and seven Layers, including Init, are retained
in the [history/storage](tables/builder2-commits.csv) and
[publication](tables/builder2-publications.csv) tables.

All 82 Bash steps exited 0 and received 65 Committed / 17 UpToDate outcomes;
31 Bash steps belong to final-main acceptance. SDK-returned streams were all
untruncated. The original Init refusal is the only failed SDK trace call.
All four scoped clean builds, prebuilt tests, per-package doc checks, warning-
denying Clippy, fmt and package listings passed. The full API/CLI/Chromium flow,
same-version concurrency, interruption/fault/restart reconciliation, all 71
frozen fixtures, separately committed 32 MiB versions and retained executable
fresh-remount download passed. Registry/web Branches alternated from M3, merged
without a source conflict and preserved both inputs. Two same-Branch Workspaces
preserved both distinct source-test changes. The verbatim report below carries
the command labels and application-specific test detail.

Builder 2 has three Domain integration tests and one Store integration test;
its binary server/CLI targets have zero Rust tests and are checked through the
external API/CLI/browser suites. The two library doctest targets contain zero
examples; binary-only packages have no applicable doctest target. Cargo's
missing documentation/homepage/repository metadata warnings remain retained.
The installation metadata records host Node v24.21.0 while the initial command
error reports v22.7.0; both observations are preserved without claiming one
uniform host Node identity. Runtime Rust/Cargo/browser versions match the pins.

There were no live Depot/Chromedriver/Chromium processes at the final audit.
It did retain 24 exited Chromium zombies; closing their explicit container
cleared them. Every Workspace was terminally unmounted, both daemon streams
were saved, then both explicit and service Sandboxes closed. The orchestrator
confirmed no running container used the campaign volume before export.

The explicit daemon log ends with a ConnectionFailure/UnexpectedEof diagnostic,
with received_bytes=None, original_kind=None and no fence/diagnostic error.
Source `application/connection.rs:50–75, 116–140` identifies this as a connection
boundary with no decoded product attempt: channel/IO failure is transferred to
stderr before the slot is released. This receipt cannot identify the peer or
whether handshake or a later receive failed. All recorded SDK operations after
the environment correction have known successful outcomes. The diagnostic is
retained without calling it a product blocker or silently discarding it.

Final integrity checks verified all 50 copied SDK/skill files, two binaries and
eight frozen inputs unchanged, along with the timeout helper and internal npm
package link. The standalone installation manifest is
`INSTALLED-ENVIRONMENT.json` SHA256
`2bd2e01184f18211bb08c3fe1400cc4e59179f12fc7741002ba7883f87a51614`.
The dispatch SHA256 is
`6d0644942d7b1060d56f0e86b968d1f12a75f1cde74f74529b9f67d38e5eda7c`.
No application implementation or recovery help was supplied to the agent.

## Builder 2 file, data, encoding and operation detail

This section answers the owner's additional reporting request after publication
of the original campaign through [PR #338](https://github.com/Ephemeral-AI-Lab/layerfs/pull/338).
Original Builder 2 statistics still come from its closed 258-call trace. A
separate post-run inspection read the immutable final acceptance Commit
`1220d5463170a32ed6c5fde50cf95cc6ba8bec25d3d279333bec8e5489e7f4cb9a`
through SDK reads and a bounded metadata-only filesystem walk. It performed no
Init, build, application test, source edit or publication. Its sole read-only
Bash step returned UpToDate; before/after Store counters were identical. Both
streams were saved before every diagnostic Sandbox closed. These later calls
are excluded from all original-run operation counts and latency distributions.
The independent builder was not resumed and its verbatim report is unchanged.

### Maintained project and code

The final Commit contains **34 maintained first-party project files, 64,274
bytes**, excluding the supplied 38,402-byte Cargo.lock, seed `.git/HEAD`, Cargo
cache/output, generated fixture hashes, bytecode, fixtures and runtime data.
"Maintained" includes configuration/manifests assembled from the frozen templates;
it does not claim that the builder invented the supplied dependency definitions.
The 21 code files comprise eight production Rust files, one production web page,
four external Rust test files and eight Python test/support files. The other
13 maintained files are eight configuration/manifests and five README documents.

Production Rust alone is **25,901 bytes, 778 production LOC and 782 physical
lines across eight files**. Production LOC uses the pinned repository counter's
Rust-aware comment and test-only-item removal, then counts nonblank source
lines. Imports, declarations and embedded runtime SQL count; external tests,
docs and configuration do not. The same eight physical line counts match the
original step 103 audit. The HTML/JavaScript page is separately 5,526 bytes and
16 physical/nonblank lines; the Rust counter does not parse mixed HTML/JS, so
these lines are not silently added to a purported Rust production LOC total.
There is no application-source duplication in the LayerFS Git product count.

[Per-file classifications, bytes, lines and hashes](tables/builder2-detail-authored-files.csv)
pin this census. Counter SHA256 is
`cb9cdb1a5d00b908763894133f97a9f2b1889066651f27ce6f66009976b46197`.
The generated 9,148-byte `tests/fixture-hashes.json` is excluded from maintained
source and retained as test data. All authored counts are observed from committed
bytes, rather than estimated from package listings or host orchestration LOC.

### Largest committed view and directory sizes

The largest of all 75 saved Commit trees is the final acceptance head above:
**1,049,230,674 regular-file bytes, 12,025 regular-file paths and 2,524
directories**, with no symlinks observed. The post-run census reproduces that
Commit's persisted logical count exactly. Sizes below sum `lstat().st_size` for
regular-file paths, counting hardlink paths separately and following no symlink.
They describe bytes in the immutable view, not allocated host blocks or compressed
exclusive Store allocation. The cache and target sizes were directly observed
in this later census; they were not measured separately during the original run.

| Committed subtree | Regular files | Logical regular-file bytes |
| --- | --- | --- |
| `/.cargo-home/` | 9,515 | 232,571,167 |
| `/target/` | 2,119 | 513,789,926 |
| `/fixtures/` | 71 | 100,687,889 |
| `/acceptance-data/` | 174 | 201,531,702 |
| `/test-data/` | 107 | 507,354 |
| `/depot-data/` | 1 | 20,480 |
| `/crates/` | 21 | 36,908 |
| `/tests/` | 10 | 36,987 |

The 71 fixture input files total 100,687,889 bytes. This includes three distinct
32 MiB version files (v1, identical bytes, and one-byte-changed v2); application
acceptance writes independent object-version files rather than hardlinking them
to hide data. The 20,480-byte `/depot-data/` catalog is application data, distinct
from the global Store database below. All directory groups remain in the [complete size census](tables/builder2-detail-filesystem-groups.csv).

Per-step cache/target sizes, peak resident bytes, allocated blocks and an exact
historical split of newly stored pack bytes among source/cache/output/data were
not collected and remain unavailable. A Commit's newStored is not a directory's
size: exact reuse, compression, delta encoding and shared metadata cross those
boundaries. The first dependency-fetch Commit's 232,615,913-byte full tree and
58,506,790 newStored bytes therefore must not be relabeled as the final cache's
exclusive compressed allocation. There is no inferred cache/output size here.

### Store bytes, SQLite and ratios

| Quantity | Final observed value | Definition |
| --- | ---: | --- |
| Logical history | 58,339,171,210 bytes | Full regular-file tree bytes summed across every Commit and Layer |
| Canonical | 801,677,583 bytes | Distinct canonical registered object bytes |
| Stored pack bodies | 278,192,281 bytes | Encoded/compressed/delta pack bodies, including metadata bodies |
| Metadata pack bodies | 5,126,419 bytes | Component of stored bodies; not additional physical bytes |
| SQLite overhead | 10,317,671 bytes | Database logical file bytes − free bytes − stored bodies |
| Metadata including overhead | 15,444,090 bytes | Metadata pack bodies + SQLite overhead |
| SQLite database logical pages | 70,437 × 4,096 = 288,509,952 bytes | WAL-visible page_count × page_size |
| Free pages | 0 | freelist_count=0 |
| Stopped raw main file | 288,436,224 bytes | Exported main file; WAL supplies the remaining logical database state |
| Stopped WAL file | 4,194,304 bytes | Raw exported WAL length, not a second logical Store |
| Stopped SHM file | 32,768 bytes | Raw exported shared-memory file |
| Portable Store tar | 292,669,440 bytes | Main/WAL/SHM plus tar headers/padding |
| Logical / canonical | 72.771364 | History reuse/deduplication ratio |
| Canonical / stored | 2.881739 | Combined encoding/compression/delta ratio |

Logical history repeatedly counts whole trees: 75 Commits contribute
54,332,680,273 bytes and seven Layers contribute 4,006,490,937. It is neither
the current Workspace size nor a per-artifact data size. The 72.771364 history
reuse ratio is separate from the 2.881739 encoding ratio. These observations
do not isolate standalone compression-codec savings from delta-encoding savings;
that breakdown is unavailable. The initial operator counters plus acknowledged
Save increments exactly match final canonical/stored/metadata-pack totals.
Read-only restored database rows, WAL-visible page counts and every exported
file hash are pinned by the external `builder2-final/verification.json`,
`restored-files-before-read.json` and `SHA256.json`; the tracked
[export reconciliation](tables/builder2-export-reconciliation.json) joins all
75 Commit records and all seven Layers.

### Original-run calls and latency distributions

The original 258 calls comprise 231 public SDK, 19 internal service and eight
operator calls. The 11 fs.* calls are a subset of public calls (nine mutation
calls and two reads), not an additional category. Group distributions mix
different methods/workloads and describe this run only. Median is the ordinary
sample median; p95 is nearest rank `ceil(0.95*n)`; all durations are milliseconds.

| Group / Commit outcome | Count | Median ms | p95 ms | Max ms |
| --- | --- | --- | --- | --- |
| public_sdk | 231 | 174.64 | 11,298.321 | 35,779.826 |
| internal_service | 19 | 17.943 | 333.541 | 333.541 |
| operator | 8 | 2.797 | 4.086 | 4.086 |
| fs_subset_of_public_sdk | 11 | 17.308 | 22.155 | 22.155 |
| sandbox.commit Committed | 65 | 96.961 | 1,519.385 | 5,089.991 |
| sandbox.commit UpToDate | 17 | 7.412 | 9.61 | 9.61 |

The complete per-method distribution, including original Init refusal, is:

| Method | Class | Count | Median ms | p95 ms | Max ms |
| --- | --- | --- | --- | --- | --- |
| branch.diff_branches | public_sdk | 3 | 9,811.69 | 10,569.22 | 10,569.22 |
| branch.fork | public_sdk | 4 | 2.224 | 3.028 | 3.028 |
| branch.list_commits | public_sdk | 10 | 2.747 | 3.505 | 3.505 |
| branch.merge | public_sdk | 1 | 158.989 | 158.989 | 158.989 |
| branch.publish | public_sdk | 6 | 3.735 | 4.967 | 4.967 |
| fs.apply | public_sdk | 7 | 18.399 | 22.155 | 22.155 |
| fs.edit | public_sdk | 1 | 11.651 | 11.651 | 11.651 |
| fs.read | public_sdk | 2 | 5.632 | 6.765 | 6.765 |
| fs.write | public_sdk | 1 | 16.008 | 16.008 | 16.008 |
| operator.inspect.snapshot | operator | 1 | 3.034 | 3.034 | 3.034 |
| operator.store.commits | operator | 5 | 2.56 | 4.086 | 4.086 |
| operator.store.stats | operator | 2 | 2.7235 | 3.262 | 3.262 |
| project.init | public_sdk | 2 | 556.2435 | 1,078.7 | 1,078.7 |
| project.list_branches | public_sdk | 2 | 3.3145 | 4.099 | 4.099 |
| sandbox.close | public_sdk | 2 | 1,261.005 | 1,286.541 | 1,286.541 |
| sandbox.commit | public_sdk | 82 | 37.973 | 1,450.171 | 5,089.991 |
| sandbox.create | public_sdk | 1 | 267.704 | 267.704 | 267.704 |
| sandbox.exec | public_sdk | 82 | 1,306.9305 | 14,116.757 | 35,779.826 |
| sandbox.mount | public_sdk | 12 | 26.3315 | 39.272 | 39.272 |
| sandbox.service | internal_service | 19 | 17.943 | 333.541 | 333.541 |
| sandbox.status | public_sdk | 1 | 29.662 | 29.662 | 29.662 |
| sandbox.unmount | public_sdk | 12 | 45.257 | 92.545 | 92.545 |

There were 65 new Commits from sandbox.commit and 17 UpToDate results. Nine
fs.* mutations and one Branch merge account for the other ten unique Commits,
giving 75 total. UpToDate created no new history solely for a command message.
The single failed SDK call is the before-effect Init permission refusal;
all 82 Bash commands exited 0. Process fault exits 86/87 inside passing recovery
checks are expected test events, not failing SDK operations.

### Build classes and bulk-save outliers

These separately labeled steps retain fetch, first build, unchanged context,
source-edit rebuild and clean final-main rebuild. Exec and Commit are separate
SDK durations and are not sums of nested phase timers. The in-view dependency
cache is retained for clean compilation; neither warm nor cold OS residency was
enforced. Different builder programs, dependency feature contexts and histories
make Builder 1/2 aggregate medians unsuitable as matched-workload comparisons.

| Original step | Exec ms | Commit ms | Commit outcome |
| --- | --- | --- | --- |
| 005-m1-dependency-fetch | 35,779.826 | 5,089.991 | Committed |
| 006-m1-domain-first-build | 7,170.72 | 360.468 | Committed |
| 007-m1-store-first-build | 12,424.242 | 1,519.385 | Committed |
| 008-m1-server-first-build | 9,956.281 | 876.974 | Committed |
| 009-m1-cli-first-build | 12,600.148 | 1,179.044 | Committed |
| 010-m1-unchanged-build | 600.694 | 9.414 | Committed |
| 016-m2-source-edit-rebuild | 660.525 | 22.857 | Committed |
| 073-final-main | 8,647.191 | 602.73 | Committed |
| 074-final-main | 12,712.412 | 1,446.592 | Committed |
| 075-final-main | 11,298.321 | 864.703 | Committed |
| 076-final-main | 14,116.757 | 1,179.343 | Committed |

The following union selects the five largest newStored Saves and the three
slowest sandbox.commit calls; overlaps appear once. Values describe exact
observed operations, not a fitted distribution or resampled benchmark. The
[outlier CSV](tables/builder2-detail-bulk-save-outliers.csv) includes full Commit
IDs, canonical/stored/metadata growth and individual phase values.

| Step | New stored bytes | SDK Commit ms | Construct ms | Capture ms |
| --- | --- | --- | --- | --- |
| 005-m1-dependency-fetch | 58,506,790 | 5,089.991 | 4,362.922 | 0.005 |
| 041-m6-candidate | 33,716,693 | 774.163 | 675.584 | 0.007 |
| 007-m1-store-first-build | 29,009,975 | 1,519.385 | 1,359.292 | 0.012 |
| 009-m1-cli-first-build | 24,961,981 | 1,179.044 | 1,040.022 | 0.009 |
| 008-m1-server-first-build | 17,396,668 | 876.974 | 763.59 | 0.008 |
| 019-m3-server-build | 6,783,785 | 1,827.198 | 1,570.771 | 0.007 |
| 034-m5-merged-rebuild | 6,083,304 | 1,840.275 | 1,582.887 | 0.009 |

The dependency-fetch Save is the largest encoded increment and slowest Commit:
58,506,790 newStored bytes, 5,089.991 SDK ms, with 4,362.922 observed construct ms.
The candidate fixture Save adds 33,716,693 stored bytes after introducing the
deterministic large fixture payload; its construct phase is 675.584 ms. These
step labels identify their workloads, but do not establish exclusive path-level
allocation. First builds and later server rebuilds remain separate outliers.
Finish/publication/install nodes omitted by the bounded trace are unavailable,
not zero. Parent and child times overlap and must not be added.

| sandbox.commit phase | Observed nodes | Median ms | p95 ms | Max ms |
| --- | --- | --- | --- | --- |
| commit/capture | 82 | 0.006 | 0.011 | 0.023 |
| commit/construct | 82 | 17.9285 | 1,266.841 | 4,362.922 |
| commit/finish | 64 | 2.0865 | 11.893 | 18.09 |
| commit/install | 64 | 0.052 | 0.102 | 0.147 |
| commit/publish | 64 | 0.0825 | 0.154 | 0.212 |

### Available FUSE observations and limits

The original run has 443 complete joined daemon observations, including 373
kernel boundaries across 12 mounts, with no counter reset in retained emission
order. Summed per-mount observed maxima include lookup 145,399; getattr 93,578;
read 139,544; write 787,048; create 19,389; served 1,410,223; inline 429; refused
724; terminal 0; FORGET ownership units 9,889; WRITE store units 143.
These are distinct frame/callback/ownership quantities. They are not OS syscall
totals, cannot be added into one request number, and are not exact per-Exec
attribution. Maxima do not prove that every terminal event was observed.
Zero is reported only for an available observed field; absent sections and first
deltas remain unavailable. Per-mount rows remain in
[kernel maxima](tables/builder2-kernel-observed-maxima.csv); the
[explicit sum definitions](tables/builder2-detail-kernel-maxima-sums.json) preserve
the aggregation. Public fs.* calls are never substituted for these counters.

The original trace contains 10,650 observed timing nodes and 15,908 bounded
omissions. All statistics remain **diagnostic, not benchmarks**, with tracing
overhead, unknown OS cache state and declared host activity. No continuous
resident-memory, cold-cache, power-loss, release or CI-green claim is made.
Raw source responses, census commands, unchanged-counter checks, separate traces
and closed Sandbox receipts are preserved outside Git under
`/Users/yifanxu/.codex/issue337-builder2-detail/`. The
[detail summary](tables/builder2-detail-detail-summary.json) and
[analysis input pins](tables/builder2-detail-analysis-inputs.json) link those
receipts to the published derived tables.

## Publication disposition

All requested preparation, fixing, independent execution and collection work
is complete. The owner authorized push and merge on 2026-10-16;
[PR #338](https://github.com/Ephemeral-AI-Lab/layerfs/pull/338) published the
original report and product fixes at main Commit
`9021aa0398dc8317eba0caeed6f530d9cd0f889e`. The additional Builder 2 detail is
a documentation follow-up using preserved receipts and the separately declared
read-only census. It changes no product source or independent acceptance result.
The original external `EVIDENCE-INDEX.json` and `FINAL-SHA256.json` remain
sealed at their original campaign identity; later publication and census
receipts are preserved separately. Scoped product checks are reused at their
unchanged source identities.

## Builder 2 REPORT.md — verbatim

Original report SHA256: `c55839ddcfd48192f537b673b351ebc9de2faf64e45333e5a4347dc76d999a79`. The complete UTF-8 report bytes
appear between the following fences, including its final newline.

````text
# Independent Builder 2 Depot report

Status: all six milestones passed and were published in order. The complete frozen acceptance passed again on a distinct Branch forked from the exact final M6 main Layer. The explicit Sandbox and automatic service are closed, all Workspaces are unmounted, and no SDK operations followed the final collection boundary.

## Independence and fixed inputs

I built Depot independently in the assigned `r1` environment. I read the copied SDK skill, dispatch, frozen specification/dependency/acceptance/fixture inputs and only my own LayerFS project. I did not read the LayerFS repository, any earlier application or another builder’s scripts/report; I requested no implementation help and spawned no agents. The host folder holds plain Node orchestration, supplied environment/inputs and receipts. Depot source, dependencies, fixtures, data, binaries and Cargo output live in LayerFS. No editable host application checkout, SDK wrapper library, external Cargo cache or product/SDK/daemon/skill change was created.

The active product source is `0cf3d39cae3e6f391c391998728b14d757450efd`, tree `60d616cd52f91a553d2f8c2a1d56d62a8ba307ee`. The runtime browser image is `sha256:091f785ba7d5d036dfa350e8fd69ee1fcd2d8320c3706841c8c95e6411eee9d2`. Exact binary/skill/frozen-input hashes remain in [INSTALLED-ENVIRONMENT.json](../INSTALLED-ENVIRONMENT.json). Runtime audit observed Rust/Cargo 1.85.1 and Chromium/ChromeDriver 155.0.8059.39. The original installed environment metadata names host Node v24.21.0; the actual initial command error reported Node v22.7.0. This did not prevent the public SDK workflow.

The supplied initializer selects Disposable/WAL/synchronous=OFF explicitly and construction workers remained 1. Durable: **NOT_RUN — disabled by owner until explicit reauthorization**. Timings, Store figures and ratios are diagnostics with unknown cache state, never benchmark claims.

## Init refusal and separate initial stats

The first isolated Init, step 001, was refused with stable `Unauthorized`: the supplied LayerFS home was owned by my uid 501 but mode 0755. I retained [the exact refusal](init.json), [host stderr](001-host.stderr) and [permission diagnosis](001-permissions.stdout), stopped all SDK activity and notified the orchestrator. The orchestrator acknowledged a mechanical environment setup error, proved no Store existed and corrected the home to 0700 without changing SDK/daemon/skill bytes. No blind replay occurred.

After explicit correction confirmation, newly identified step 002 initialized the tiny seed successfully; [init-success.json](init-success.json) preserves the result. Initial main Layer was `320e77381e6ca2047db0513e1bb8cc49d023b5faded2b8d41463d92ddedb021e81`. I paused again before any fork/scaffold/mount, and the orchestrator separately collected [initial stats](initial-stats.json) at step 003. Project work resumed at 004 only after that handoff.

## Milestones and publication identities

Every published milestone returned Added with an empty `overwrote` list.

| Milestone | Delivered and checked | Published main Layer | Source Branch / Commit | Receipt |
| --- | --- | --- | --- | --- |
| M1 | Frozen four-package Cargo workspace, health, configuration and CLI connectivity; package first builds and unchanged-build observation. | `3270329deabd66021af71a662c35c463c4123c3a4eca1b1c772653b1b177c20fd4` | `implementation` / `12a385059994c7de711b70b4e4c936366f22b6cdcb20e5f8fe55ed95f9735d593f` | [M1](m1-publication.json) |
| M2 | Reserved SQLite catalog identities, bounded streaming/hash/file publication, local storage/reopen test and source-edit rebuild. | `32695264a2e4fc65bb559ac497e22c8a1230358db0974be6c828463ea67993af7c` | `implementation` / `12c3d6da8b15c89f2bbe4102a9473351dba3828049e8005f8bdedcdf022d68a91b` | [M2](m2-publication.json) |
| M3 | HTTP and CLI upload/list/info/download with exact binary bytes. | `322b8ee023bee7a098554403964746af33dfab977d5bc36abed3f7d9f39b592973` | `implementation` / `12117d0a112bc75e966270b862818fffd0964719f9542f0fb421fc129650ea6c4a` | [M3](m3-publication.json) |
| M4 | Validation, stable pagination/filtering, immutable conflicts, different-identity concurrency, deletion and the same-Branch two-Workspace exercise. | `322991047c9d13aa1b3d7dfbea77a6939b867206a19c7bf93057b2479dc56352c3` | `registry` / `12999de0c6a75ac5470c2cad33a023a23718913573cb46b11d60354399ab9e040e` | [M4](m4-publication.json) |
| M5 | Browser interface and actual Chromium workflow, interrupted upload and deterministic publication/deletion restart recovery after the registry/web merge. | `325a3039b7860cebaef97a080f522db5cadc24af6bd05e7205f1143a9bf737a049` | `combined` / `12fe4c1dbe1e9e4456347d993f23aa0884be0216bb930761eca7e2b5c7d885edfd` | [M5](m5-publication.json) |
| M6 | Complete docs and package metadata, clean rebuild, tests/docs/Clippy/format/package checks, all frozen fixtures/CLI/browser checks and retained-binary fresh remount. | `3294a0bc8ac91fed525a315eff34e40c212770b5c9739dd86bd85ce40cf1674365` | `combined` / `12b3b45aaf42697fb7392cdfca491b9d2d5fbb9241853d295076389ab47cc8f73e` | [M6](m6-publication.json) |

Final main is Layer `3294a0bc8ac91fed525a315eff34e40c212770b5c9739dd86bd85ce40cf1674365`, from combined Commit `12b3b45aaf42697fb7392cdfca491b9d2d5fbb9241853d295076389ab47cc8f73e`. Step 071 forked `final-main-acceptance` directly from that exact Layer. Final validation head is separately `1220d5463170a32ed6c5fde50cf95cc6ba8bec25d3d279333bec8e5489e7f4cb9a`; it was never published over M6 main. [Final refs and complete histories](final-state.json) preserve both identities.

## Branch and merge exercise

After M3 I forked registry and web-recovery from the same published Layer. Development alternated registry step 023, web 024, registry test 025, web 026, registry Workspaces 027/028, web 029, then registry proof/publication 030–032. Only `target/` and `.cargo-home/` were in `/.lww`; sources, manifests, Cargo.lock, tests and application data were outside LWW.

Two registry Workspaces were mounted before either edited source. Workspace A added a domain validation test and committed at [027](027-result.json). Workspace B added a different pagination test and committed at [028](028-result.json). Its Commit reported the moved-head merge; both test files survived and both later passed. There were no conflicts and no LWW decisions. I inspected both committed files before the Branch merge.

Step 033 compared the registry/web Branches and merged them to combined. [The merge receipt](033-merge.json) has source pins, merge base, complete paged diff evidence and the inspected Workspace test files. The merge was non-fast-forward with `conflicts=[]`, `lww=[]`, and both truncation flags false. No source was discarded and no conflict resolution was needed. The merged server was rebuilt at 034 and combined registry/recovery/browser checks passed before M5 publication.

Final Branch heads:

| Branch | Head |
| --- | --- |
| combined | `12b3b45aaf42697fb7392cdfca491b9d2d5fbb9241853d295076389ab47cc8f73e` |
| final-main-acceptance | `1220d5463170a32ed6c5fde50cf95cc6ba8bec25d3d279333bec8e5489e7f4cb9a` |
| implementation | `12117d0a112bc75e966270b862818fffd0964719f9542f0fb421fc129650ea6c4a` |
| registry | `12999de0c6a75ac5470c2cad33a023a23718913573cb46b11d60354399ab9e040e` |
| web-recovery | `12a15747d06329f61b80437c0c0c2d59048c1622c0f2968150bda17b271eae12ca` |

## Full final-main acceptance

Candidate receipts are retained at steps 040–070. They did not substitute for final-main acceptance. Steps 072–103 ran the full sequence on newly mounted Workspaces of final-main-acceptance. All 31 final-main Bash steps exited 0. [The command index](COMMANDS.md) records exact command text, context and all outcomes; [the machine ledger](steps.jsonl) and [acceptance aggregate](acceptance-summary.json) retain the complete record.

- Step 072 checked frozen locked dependencies offline using the retained in-view source cache. Original network fetch was separate step 005. Steps 073–076 removed only generated target output and clean-built domain, store, server and CLI in dependency order. All Cargo state remained in the Workspace; paths were retained through that build sequence. This was a clean compilation, with no cold-cache/network assertion.
- Steps 077–080 prepared every package’s tests before steps 081–084 executed them. Domain ran three integration tests; store ran its streamed-publication/reopen test. The binary server/CLI test targets contained zero Rust unit tests; their behavior is exercised by the Python API/CLI/browser checks. No hidden test count is implied.
- Steps 085/086 ran the applicable library doctest targets, each with zero doctest examples. Metadata audit at 103 confirms depot-server and depot-cli are binary-only, so doctest targets are not applicable to those two packages.
- Steps 087–090 passed scoped all-target Clippy with `-D warnings` for every package. Step 091 passed formatting. Step 092 listed all four intended source distributables. I inspected every listing: source and README were present, the server included web/index.html, and no fixture/data/cache/target output leaked. Cargo emitted the retained metadata warning about missing documentation/homepage/repository URLs; package listing still exited 0 and did not publish a release.
- Step 093 regenerated inside the Workspace and matched all 71 exact frozen fixture hashes, including exactly 64 files of 256 bytes. Step 095 uploaded/downloaded all 68 non-large fixtures, including empty/text/binary/nested inputs, with exact size/SHA256 and quoted ETag checks. [Filesystem-only verification](final-verification.json) independently compares retained result payloads to the frozen hash file.
- Steps 096, 097 and 098 separately streamed and committed 33,554,432-byte v1, identical and one-byte-changed v2 versions. v1/identical SHA256 is `d78f773fdc204bc06b7d9051e554690d1002937394eda414d287cf55b12f7129`; v2 is `a6d4d2fadd2e76cfc5644c7d7b64acf9450374e4ae5cb1644c40708dddcae992`. Each upload/download checked byte length, hash and ETag. The three acceptance Commit receipts preserve their history separately.
- Step 094 covered health/configuration, repo create/list/detail, duplicate/absent/invalid responses, empty/nonempty stable pagination, prefix filtering, invalid page forms, same-version concurrent PUT results exactly `[201,409]`, independent identities, deletion and surviving-version bytes. A partially sent upload remained 404 for metadata/download until all body bytes were published.
- Step 094 also interrupted a streaming request, verified no visible/downloadable partial, forced process exit 86 after object rename before ready publication, and forced exit 87 after a deletion mark. Clean restarts reconciled all incomplete states while retaining the previously acknowledged object. These were expected fault exits within a passing command, and prove process recovery only.
- Step 099 verified CLI create/list/upload/list/info/download/delete plus JSON output, exact bytes, exit codes 0/1/2/3 and no final destination after failed download. Step 100 used Selenium and real headless Chromium: repository form creation, file selection/upload, status, list/info, actual downloaded bytes, duplicate conflict, confirmed deletion and visible removal. The retained screenshot is in the LayerFS view at `test-data/browser-1792096432173606176/browser.png`.
- Step 101 terminally unmounted and mounted a fresh Workspace. Step 102 executed retained mode-0755 binaries, restarted against retained final data and reverified all three large checksums. Step 103 recorded source limits, binary identity, toolchain, target kinds and process status. Every production Rust file was at most 313 physical lines; lib.rs files were three lines, and all tests were outside src. These are physical-line guard results, not production LOC measurements.

The retained final server is 6,170,592 bytes, mode 0755, SHA256 `b57dedc8815fc37630db59bea4442ad5a64c60e412c69adc0051f932fc833c5a`; CLI is 8,590,696 bytes, mode 0755, SHA256 `4e9eec2f414e7432874cd16e07524a88247ee939d1610b24d42b501f2bd3a0d6`. [Audit receipt](103-result.json) preserves exact results.

## Outcomes, cleanup and diagnostics

There were 82 SDK Bash calls: every command exited 0, every stdout/stderr was reported untruncated, 65 Commit calls returned Committed and 17 returned UpToDate. Every Bash call had its own retained Commit outcome. The one actual failed operation was the original stable Unauthorized Init refusal; there were no Bash failures, timeouts, conflict refusals, uncertain Commit replies or SDK/product blockers during application work. No operation was silently retried. All timed host receipts checked in [final-verification.json](final-verification.json) had explicit limits at most 120 seconds and no timeout; the original Init host exit 1 is retained.

Application tests send SIGINT and use bounded cleanup. Each browser flow called driver.quit. Final process audit found no live Depot, ChromeDriver or Chromium processes. It also preserved **24 Chromium processes in Z state** left after the three browser flows; they were inert zombies at audit time, not running children. Closing the explicit Sandbox removed that container and its remaining process table. I do not claim those zombie entries were already reaped by the test harness.

The final Workspace was Idle with zero overlay inodes/entries, no pending merge and no head movement, then terminally unmounted at 104. [Final state](final-state.json) captures it. Both explicit daemon streams were saved before close: [stdout](105-explicit-daemon.stdout), [stderr](105-explicit-daemon.stderr), [metadata](105-explicit-daemon.json). [Explicit close](explicit-close.json) returned Closed. The raw stderr tail contains a `ConnectionFailure` with `UnexpectedEof`; the original is retained, and no claim that the diagnostic proves success or a product defect is made. All required SDK outcomes were known and are independently recorded.

I then paused SDK work and handed the automatic service id and exact final identities to the orchestrator. The orchestrator captured all five Branch histories/storage pages and seven Layers, [final stats](final-stats.json), [snapshot](final-snapshot.json), [collection summary](orchestrator-final-collection.json), and both [service stdout](orchestrator-final-service.stdout) and [service stderr](orchestrator-final-service.stderr). [Service close](orchestrator-final-service-close.json) returned Closed for `sb_dbdda890f0b82cbffc8622678ed0543b9406d3782b2ee1a5c85580f4d2aa8f1f`. There have been no later SDK calls.

Final operator-reported Store figures are logical 58,339,171,210; canonical 801,677,583; stored 278,192,281; metadata 15,444,090; file 288,509,952; free 0; dedupe ratio 72.771364 and compression ratio 2.881739. These describe the retained Store/history diagnostic, including dependency/build history; they are not a live-directory size, a benchmark, or a memory/cold-cache claim. Initial/final operator collection was owned separately by the orchestrator.

## SDK skill feedback and remaining limits

The copied skill was sufficient to complete the task through public positional SDK methods. Its retained-Workspace Cargo guidance avoided rebuilding every dependency after each command, while fresh mounts correctly provided a new path/view for final acceptance. fs.apply made source changes atomic; per-Bash Commit outcomes, generated-only LWW, explicit service lifecycle and daemon-log instructions were usable as written. The initial private-home precondition would be useful in the environment setup checklist; the SDK refusal itself was clear. No SDK, native addon, daemon or skill repair was needed.

The application README documents configuration, API/CLI usage, publication/deletion ordering, fault hooks, packaging and limits. This is a trusted local single-server artifact service, with no power-loss durability, process checkpointing or crates.io publication claim. No application deduplication hides the one-file-per-version storage history. All requested acceptance work and cleanup are complete.
````
