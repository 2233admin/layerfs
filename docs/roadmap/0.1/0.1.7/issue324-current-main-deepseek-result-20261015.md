# Current-main DeepSeek diagnostic result and Commit plan

> Status: Dated planning checkpoint; not release evidence or a product contract.

Owner requested landing the completed implementation and repeating the earlier
DeepSeek operation/native diagnostic before focusing implementation on its exact
mixed Commit. Origin/main was fast-forwarded to
13553118857e0d71cf202847247e6e86f770fb6e before execution. Its production tree
902f252c6a42b7ac4061a9ea85cf1b0ef6dc7767 is unchanged in this campaign.

The corrected full run passed: exit 0, full driver 78,777,420,583 ns, below the
120-second functional diagnostic stop. The separate 15-second complete-performance
budget is EXCEEDED. All numeric results remain INCOMPLETE/INELIGIBLE because
setup, earlier-phase and own-write cache state is not qualified. No ratio,
speedup, memory-bound or release-admission claim follows.

## Exact workload and evidence

Prepared source: 103,108 regular files, 16,867 directories excluding root,
10,070 symlinks and 3,475,776,149 logical bytes. Original seven workload scripts
and independent oracle match their earlier hashes. Existing installed dependencies,
Linux ARM64 Node/native-master image and current sealed daemon were reused;
the external host driver was built locked/offline release in its own target.
No npm/network dependency install or product changes were made.

| Operation or workload | Raw ns | Scope |
| --- | ---: | --- |
| Project Init/seal | 46,826,445,916 | Actual full host import and seal |
| Sandbox create/install | 9,684,138,625 | Public create through readiness |
| First mount | 3,206,333 | Public mount acknowledgement |
| Native read/hash | 34,920,333 | Internal Linux workload timer |
| FUSE read/hash | 320,084,542 | Internal Linux workload timer |
| Native mixed mutation | 7,691,000 | Internal Linux workload timer |
| FUSE mixed mutation | 67,740,625 | Internal Linux workload timer |
| Native TypeScript build | 958,682,042 | Compiler workload, five old outputs removed |
| FUSE TypeScript build | 857,623,667 | Same compiler workload |
| Changed Workspace Commit | 81,273,166 | One public call through known acknowledgement |
| Fresh mount | 4,097,250 | Public mount acknowledgement |
| No-change Commit | 8,467,583 | Original UpToDate acknowledgement |
| Sandbox close | 1,625,642,375 | Public stop/delete; borrowed volume retained |

Full SDK Exec spans are separately retained in timings.tsv and summary.json;
they include process creation, start, streams and result inspection. Do not add
them to their internal workload spans. Host/Linux clocks are distinct.

Independent native, same-FUSE and fresh-FUSE verifiers all PASS: 194 selected
input files/21,856,018 bytes, five compiler outputs and exact 98-file mutation
state/180,245 logical bytes. The full selected Commit result adds the five
compiler artifacts: 103 regular files/226,196 logical bytes. Commit history,
fresh root and UpToDate agree; both normal unmounts and SDK close acknowledged.
This is selected-byte coverage, not a complete mounted-byte census.

Closed sealed Store is 1,417,043,968 logical/allocated bytes. Native complete
regular-file allocation is 3,764,039,680 bytes by per-path st_blocks, with no
hardlink groups. Virtual FUSE st_blocks is not physical overlay allocation.
Live Store/overlay total allocation, phase-local RSS and detailed phase SQL counts
are UNAVAILABLE in this unchanged public timing driver. Do not infer them.

The first attempt full-1 is retained as FAIL: Init/install/mount succeeded,
but native-clone's empty-directory prerequisite was missing. It exited 1 before
any workload or Commit. Root cause: the reproduction omitted the original
separate operator install-directory command. That exact untimed infrastructure
step was restored on a new volume for full-2. First successful prefix receipts
remain diagnostic duplicate coverage, not a second accepted Init timing sample.
The failed container dfd77ceccb1084ecddde8160cbd489b2f174ec8ec9c6d92e48105baa12303102
and volume layerfs-deepseek-current-main-20261015-full-1 are retained untouched;
their idle presence is declared interference. Successful full-2 SDK close deleted
its container; borrowed volume layerfs-deepseek-current-main-20261015-full-2 and
sealed Store/evidence remain retained. No failed/uncertain owner was replayed.

Raw evidence is worktree-local under
benchmark-results/fs-bench-pro/deepseek-current-main-20261015/full-1 and full-2.
Each includes plan/invocation/result, exact stdout/stderr/SDK acknowledgements,
raw timings, source/image/binary/harness/workload/oracle hashes, and a reproducible
summary plus manifest. Prior experiment receipts are unchanged.

## Commit implementation target and next checkpoint

Optimize only changed WorkspaceApi::commit after this exact mixed workload.
Keep the full prepared root, mutation order, 128 creations, 32 renames, 32
deletions, partial/sparse/editor writes and five compiler outputs fixed.
The goal is less demonstrated work per captured change, with bounded windows,
one construction producer and no work proportional to the untouched whole base.
There is no invented 2x/absolute latency gate from the old 207 ms observation.

1. Attribute current capture, namespace/file construction and Save, validation/
   prepared base, publication, install and release using existing counters.
   Separate actual SQL executions/VM work from local calls and lock acquisitions.
   Pair hot SQLite statements with exact EXPLAIN and actual engine profiling.
   Missing metrics remain unavailable; independent source analysis continues.
2. Rank candidates by observed removable cost. Current source already executes
   local jobs inline and has a sealed-answer memo, batched ranks, prepared SQL
   and bounded transactions. These are existing mechanisms, not new wins.
3. A small hypothesis is batching VALUE/HEADER fetches inside existing 64-key
   windows using the existing record get_many port. For U uncached values in
   one pass, local fetch calls may fall from U to roughly ceil(U/64), while
   SQL SELECT count remains U. Prove memo/order/failure behavior and measure
   its actual significance before selecting it as the dominant optimization.
4. If actual SQL/VM cost dominates, reduce caller multiplicity or fix the
   demonstrated access plan. If Save/base validation dominates, investigate
   repeated metadata passes/unchanged-file reconstruction instead. Do not add
   indexes, parallel producers or general SDK instrumentation speculatively.
5. One justified change per counted commit; predict counters first, run only
   the affected proof, then collect one changed-identity diagnostic/comparison.
   Preserve exact bytes/names/links/lengths, later writes through install,
   continued use, remount/history, UpToDate and original failure custody.
   Report time/storage/RSS independently. The owner's 10% allowance is for
   structural tradeoffs and does not waive correctness or cache qualification.

Exec/Init were exercised in this full run; they are not the next implementation
optimization stage. Commit stays first. Reuse this preparation where the public
path supports it; report any exact access gap before adding an API. No new
measurement/preparation platform is part of this checkpoint.
