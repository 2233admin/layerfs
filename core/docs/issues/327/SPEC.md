# #327 implemented SDK and UI architecture

> **Status:** Current implementation description, 2026-10-15; correctness and
> measurement receipts belong to the dated Phase checkpoints. Not a release claim.
> The [pinned #328 standard](https://github.com/Ephemeral-AI-Lab/layerfs/blob/5321d6de320dcbd41402db9cb41aa36bceabdf4c/core/docs/issues/327/SDK-STANDARD.md)
> governs the public surface. [Decisions](DECISIONS-20261015.md) record delegated judgment.

The implementation has exactly 29 positional Promise methods in project, fs,
branch and sandbox. The [SDK guide](../../../../sdk/js/README.md) gives every
signature, environment setting, page/read bound, history/statistics definition,
Store compatibility rule and operator signature. The historical proposal is
available in Git at `37d724a78`; retired harness and agent/call interfaces there
are historical and are not current SDK entry points.

The public JS table calls a native napi binding. The binding owns provisioning,
private project/Sandbox discovery, authenticated control channels and ordinary
Sandbox execution. Rust API and daemon have separate internal operator tables;
public dispatch refuses operator names. The daemon opens the shared Store in
process and uses Content/Storage/Persistence for all construction and publication.
Process launch/list/cancel stays in the native runtime owner. HTTP exists only in
the demo server; no host/server filesystem data path is introduced.

Messages participate in commit-v3 identity; timestamp and byte/LWW facts are
outside it. Fork origins, merge origin/second parent, force displacement, LWW
facts and overwritten Layers are persisted. The UI reads those facts rather
than assigning them from responses it happened to observe. New Store versions
16–18/22–24 and identity format 3 reject old Disposable Stores without migration.

Direct immutable-view mutations use private indexed Workspaces and ordinary
Workspace operations. One captured Content construction and History publication
makes write/edit/recursive mkdir/rm/cp/mv/apply visible. Failed validation closes
that private overlay, with the failing apply index. Uncertain construction or
publication retains the original failure and construction ownership. No native
tree materialization or second canonical encoder is used. Bounded directory and
payload windows, including a backed copied-hardlink map, avoid whole-tree drafts.

Read/grep/blame and recursive namespace/diff paging use bounded windows. Numeric
offsets can skip linearly. Effective line responses fit 48 KiB and 2,000 lines;
huge-line UTF-8 prefixes, omitted diff hunks and coarse oversized blame middles
are explicit. There is no byte-read method. Per-file history uses first-parent
immutable content revisions and discloses limited revision statistics. Physical
per-file attribution is null. Store totals run within the original insertion or
publication transaction; their speed/storage retention screen is separate from
live correctness. `file` means logical SQLite pages, not physical WAL allocation.

Private LAYERFS_HOME ownership and permissions authorize cross-process access.
Records retain the full container/deployment/daemon/Noise identity, mount tokens
and process start identity. A new Node client can use a saved Sandbox ID without
Init/reinstallation or attach replay. Nonblocking OS locks and persisted create
intent avoid guessing after interruption. Restart recovery and uncertain replay
are excluded. Zombie reaping and replaced-inode FUSE policy are owner-deferred.

The live UI server serves SDK/operator method tables at
`/api/{sdk|operator}/{group}/{method}`: GET reads and POST `{args:[...]}` writes.
Its terminal adapter maps demo commands to positional calls. Display IDs are
local labels for opaque product IDs. Store/overlay footers, file revision/history
and blame use product values, with null/unreported fields disclosed. Local agent
names remain UI orchestration labels and become optional descriptive messages;
they are not SDK attribution fields. `?backend=sim` uses the independent simulator;
`?backend=live` uses the local server. Timings are diagnostic wall observations.

Start the live server with `node sdk_sim/server/server.mjs 8327`, then open
`tui.html?backend=live`. Stop closes its owned Sandboxes and volume. Acceptance
is defined in [VERIFICATION](VERIFICATION.md); historical Phase 2/3/4 outcomes
retain their source pins. A9 historical FAIL/open is retained separately from
the new XPROCESS acceptance receipt.
