# SDK call channel and operator boundary

> **Status:** Implemented #327/#328 source description, 2026-10-15. Correctness
> receipts and the component counter screen are distinct from this architecture.

The JavaScript SDK has 29 positional methods in four groups. The
[SDK guide](../../../sdk/js/README.md) lists signatures, environment configuration,
read/page limits and compatibility. [SPEC](../issues/327/SPEC.md) describes the
UI/server integration; [VERIFICATION](../issues/327/VERIFICATION.md) owns acceptance.
No harness, agent/call metadata, remove alias or public inspect is retained.

JS wrappers form SdkValue maps internally. Workspace Mount/Attach/Commit/Status/
Unmount retain typed control records. Other filesystem/history methods use
`Request::Sdk(SdkCall { method, args })`, answered once as `Reply::Sdk` or
`SdkRefused { code, message, detail }`. The stable refusal code decides behavior.
SdkValue supports null, bool, integer, text, bytes, list and unique-key map;
nesting is at most 16 levels. One authenticated record fits `u16::MAX - 16` bytes.
Methods therefore use bounded windows rather than whole-history/tree replies.

The root public table refuses `operator.*`. `@layerfs/sdk/operator` uses a
separate native entrypoint and Rust API/daemon admission table. Store/Commit
statistics, file statistics/history, Workspace overlay/changes and snapshot are
internal diagnostics. Process start/list/cancel stays in the native Sandbox
executor; no command process record or supervision belongs to the filesystem
daemon. HTTP exists only in the demo server, which maps GET reads and positional
POST `{args:[...]}` writes to the two tables. No server filesystem data path.

Project is the named stack; main is its line of Layers. Branches have unique
names and named IDs; immutable Commit/Layer IDs use lowercase tagged hex. Public
pageSize/pagePos defaults are 50/0 with maximum size 1,000 and safe integers.
Names sort by bytes; recursive paths use component-by-component byte order;
Commit history is first-parent newest-first. Numeric deep positions skip bounded
windows linearly. Byte bounds may shorten a page and `hasMore` discloses more.
A live ref resolves once per call, so independent calls can observe new heads.

Direct Branch mutations bind a private indexed Workspace, drive ordinary
Workspace operations and publish one captured Content construction through the
shared Save and History ports. Apply uses ordered `{op,...}` changes, one
publication, and detail.index on refusal. Recursive operations use bounded name
windows and a backed copied-hardlink map. Large edits stream chunks. Definite
validation failure closes the private overlay; uncertain construction/publication
retains the original failure and custody. There is no resident paths draft or
separate canonical encoder. Main is read-only except through publish.

Immutable reads use 1-based inclusive lines, at most 2,000 lines/48 KiB reply
payload. Huge-line UTF-8 prefixes, omitted remainder and nextLine are explicit;
there is no byte-read method. Grep streams literal matching. Blame follows
immutable first parents without retaining the entire chain, skips unchanged
content IDs and uses bounded LCS with exact common edges. Oversized changed
middles are removed/added blocks with comparisonCoarse. Diff hunks may be omitted
explicitly under comparison/reply bounds; equality uses immutable identity.

Commit-v3 includes the message and operation/origin/displacement metadata in
identity, excluding time/counters/LWW details. History persists fork origins,
second parents, merge origins, displacement, LWW facts and overwritten Layers.
The UI consumes those facts. Store accounting is maintained in original atomic
publication/insertion transactions and read from one fixed row plus page PRAGMAs;
per-file physical attribution stays null. Definitions and the retained v5
speed/storage screen are in the linked SDK guide and issue checkpoint.

Private LAYERFS_HOME ownership/mode authorizes persistent project/Sandbox records.
A fresh process validates full saved deployment/container/Noise/daemon identity
and can use an ID and mount path without Init, reinstall or attach replay.
Nonblocking OS locks and persisted create intent prevent guessing after an
uncertain create. Restart recovery and failed-operation replay are excluded.

`operator.inspect.snapshot` joins the client's service and known Sandboxes,
including each mounted Workspace's real overlay data. The bounded daemon answer
discloses moreBranches/more/moreLayers. Its version includes local publication
revision as well as history/binding facts; JS combines daemon versions. The demo
may poll; it has no event-stream or reconstructed marker authority. Individual
operator Workspace reads are observations and are not an atomic global snapshot.

Typed Status remains a local observation with no Store SQL. The binding separately
reads one newest Commit to add head/stale information. Unmount without discard
refuses Dirty and preserves ownership; discard closes the Workspace explicitly.
The Dirty detail is bounded. Busy still represents held runtime/kernel/operation
ownership. Reaping and requests on replaced inodes retain the owner's deferral.

Disposable/WAL/OFF only; Durable is NOT_RUN pending explicit owner reauthorization.
New Store schema/identity records reject old Disposable Stores without migration.
