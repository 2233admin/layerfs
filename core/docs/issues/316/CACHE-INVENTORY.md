# Caches between a command and the Store

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Prepared 2026-10-10 for
[#316](https://github.com/Ephemeral-AI-Lab/layerfs/issues/316). Sections 1 to 5
describe source as read at `79ffe99a0`; the files named here are unchanged
from `882206f95`. Section 6 is diagnosis from single diagnostic samples.
Section 7 is a proposal; the owner accepted its recognition rule on
2026-10-11 (guideline rules B-1, B-5, F-2 and F-6). The existing ownership contract
for the shared immutable cache is
[architecture 48](../../architecture/48-shared-cache-operation-scopes.md); this
note does not replace it.

## 1. Inventory

Ordered from the command towards the Store.

| # | Level | Cache | Holds | Bound | Shared by |
| --- | --- | --- | --- | --- | --- |
| K-1 | Kernel | Name and attribute cache | Lookup and stat replies | 60 s lifetime per reply | One mount |
| K-2 | Kernel | Page cache of the mount | File pages read or written through the mount | Kernel memory policy | One mount |
| D-1 | Daemon | Immutable object cache | Authenticated committed objects by object id; file lengths by content root; directory child counts | 8 MiB allowance | Every Workspace of the daemon |
| D-2 | Daemon | Store read set | Opened Store read connections | 4 by default | Every Workspace, through fair lanes |
| S-1 | Storage | Locator cache | Object id to its pack location, and known-absent ids | 4,096 entries | One reader or Save |
| S-2 | Storage | Pack body cache | Pack bodies or encoded units | 2 MiB and 4,096 entries | One reader or Save |
| S-3 | Storage | Decoded group cache | Decompressed group bodies | 512 KiB | One reader, one wave |
| S-4 | Storage | Pooled value cache | Decoded pooled values | 512 KiB | One pooled reader, one wave |
| Q-1 | SQLite | Overlay page cache | Overlay database pages | 2 MiB by default | The daemon's one overlay connection |
| Q-2 | SQLite | Store page cache | Store database pages | 2 MiB per connection | One connection |
| Q-3 | SQLite | Prepared statements | Compiled SQL | 256 for the overlay; per connection for the Store | One connection |
| O-1 | Host | Operating-system page cache | Pages of the overlay and Store files | Not set by LayerFS | Everything in the container |

Memory mapping is off for both databases (`mmap_size=0`).

## 2. How each one behaves

### K-1 Name and attribute cache

Every entry and attribute reply carries a 60 s lifetime
([reply.rs](../../../crates/layerfs-fuse/src/request/reply.rs)). Within it the
kernel answers lookup and stat without a request. It stays correct because
every change to a mounted view arrives as a request on the same connection.
No rule sends a kernel notification or waits for a lifetime to expire
([coherence](../../../crates/layerfs-fuse/src/coherence/mod.rs)).

### K-2 Page cache of the mount

Every open is answered with keep-cache on and direct I/O off
([pages.rs](../../../crates/layerfs-fuse/src/coherence/pages.rs)). Pages cached
by an earlier open stay valid, so a repeated read may never reach the daemon.
Writes go through the page cache, but writeback caching is not negotiated:
each `write()` reaches the daemon and is published before it returns. Reads
and writes are capped at 128 KiB per request, with one background request
([profile.rs](../../../crates/layerfs-fuse/src/mount/profile.rs)).

### D-1 Immutable object cache

One allowance per daemon Store binding, shared by every Workspace
([cache.rs](../../../crates/layerfs-workspace/src/base/cache.rs),
[open.rs](../../../crates/layerfs-daemon/src/store/open.rs)).

- **Key:** object id. The bytes are authenticated before they are inserted, so
  a hit is not authenticated again.
- **Also holds:** the logical length of a regular file by content root, and
  derived child counts of base directories. Both are pure functions of
  immutable content.
- **Eviction:** least recently used, across objects and lengths together.
  An object larger than the allowance is served and not retained.
- **A hit copies the object** out of the cache into the caller.
- **One demand** may draw at most 32 MiB of cached bytes
  ([client.rs](../../../crates/layerfs-workspace/src/base/client.rs)).
- **Resident client:** a second client answers only from this cache, with no
  reader and no I/O, for objects up to 64 KiB.
- **Eviction never changes state.** A miss costs a Store read and a BLAKE3
  authentication of the fetched bytes.

### D-2 Store read set

A fixed set of opened read connections
([read_state.rs](../../../crates/layerfs-daemon/src/store/read_state.rs)).
Requests are admitted through one lane per Workspace, 17 lanes of 18 requests
by default, so one Workspace cannot starve another. It is a reuse of opened
connections, not a data cache.

### S-1 to S-4 Storage caches

Each belongs to one reader or one Save and is dropped with it
([policy.rs](../../../crates/layerfs-storage/src/store/policy.rs)). None is
shared between operations. For every one of them the bound costs work and never
correctness: a released body or value is acquired again when needed.

### Q-1 to Q-3 SQLite

- Overlay: journal in memory, synchronous off, exclusive locking, page cache
  set from `pager_kib`, 256 prepared statements
  ([profile.rs](../../../crates/layerfs-overlay/src/database/profile.rs),
  [startup.rs](../../../crates/layerfs-overlay/src/database/startup.rs)).
- Store: 2 MiB page cache per connection, temporary storage in memory
  ([profile.rs](../../../crates/layerfs-persistence/src/backend/sqlite/profile.rs)).

### O-1 Operating-system page cache

LayerFS does not size or pin it. The measurement rules treat its state as part
of every timed phase: an unknown or mismatched state makes a sample ineligible.

## 3. What is not cached

- **Overlay content.** The overlay database is the authoritative local state.
  Nothing sits in front of it except SQLite's own page cache.
- **Composed read windows.** Each READ composes overlay cells over committed
  bytes again.
- **Anything across daemons.** No cache is shared between two daemons.
- **Anything about what a program recently read or wrote**, beyond the objects
  D-1 happens to still hold.

## 4. Settings

| Setting | Product default | fs-bench-pro runtime |
| --- | --- | --- |
| Immutable object cache | 8 MiB | 8 MiB |
| Store read connections | 4 | 2 |
| Overlay page cache | 2 MiB | 1 MiB |
| Store page cache | 2 MiB per connection | same |
| Name and attribute lifetime | 60 s | same |
| Request size | 128 KiB | same |

The harness values are frozen in
[runtime.rs](../../../benchmark/fs-bench-pro/runtime/src/runtime.rs) and are
not enlarged in response to a measurement.

## 5. What this gives multiple Workspaces and FUSE

- Two Workspaces over the same committed content fetch and authenticate an
  object once, because D-1 is keyed by content.
- Read admission is fair across Workspaces through D-2.
- Repeated lookups, stats and reads of unchanged pages are answered by the
  kernel and cost the daemon nothing.
- Every bound above is fixed at startup and independent of file size,
  Workspace size and the number of Workspaces.

## 6. Costs observed in the #316 diagnosis

Single diagnostic samples of the 500 MiB cases; counts are exact, timings are
indicative.

- **D-1 is small against a large rewrite.** A command that reads 250 MiB of
  committed bytes cycles the 8 MiB allowance about 30 times. Nearly every READ
  is a miss: a Store read plus authentication.
- **About 2.25 Store reader transactions per READ** in the shift cases.
- **Q-1 at 1 MiB against a 500 MiB overlay.** For a new 500 MiB file, the time
  per overlay payload statement rose from 7.6 µs at 100 MiB to 54.7 µs at
  500 MiB. The cause is inferred to be page misses, not measured directly.
- **K-2 can hide reads.** When pages are already cached, the program's read
  does not reach the daemon, so the daemon cannot rely on having seen it.

## 7. How a piece structure would use these caches

Proposal; nothing here is implemented. It refers to the rules in the
[piece structure guidelines](PIECE-STRUCTURE-GUIDELINES.md).

| Cache | Effect of reference pieces |
| --- | --- |
| K-1 | None. Size changes still arrive as write and setattr replies. |
| K-2 | None to manage. The kernel caches the pages the program wrote; the daemon must answer the same bytes (rule B-3), so no notification is needed. |
| D-1 | Reads of a reference piece resolve to object ids and use D-1 exactly as inherited reads do. An object id does not depend on position, so a shifted range hits the same entries as the unshifted one. |
| D-2 | Reference reads are admitted through the same lanes as other committed reads. |
| S-1 to S-4 | Commit touches the path to the edit point and a few chunks, which fits these bounds. Today's pass over every rewritten byte cycles them. |
| Q-1 | One small row extended per write stays on one page, where today's 32 KiB payload rows cycle the page cache. |
| Q-3 | New statements must fit in the existing 256. |
| O-1 | Fewer overlay bytes written and read back. |

### Recognition must not depend on D-1 or K-2

Section 6 shows that neither cache reliably holds the bytes a program is about
to write back. Two ways to decide that written bytes equal committed bytes:

| | Compare bytes | Compare chunk ids |
| --- | --- | --- |
| Needs | The committed bytes | Only the source tree's chunk ids and lengths |
| When D-1 misses | A Store read, decode and authentication of every chunk | Nothing extra |
| Work per written byte | Memory compare on a hit; fetch plus hash on a miss | One BLAKE3 hash |
| Depends on recent reads | Yes | No |
| Owner ruling | Not needed | Given 2026-10-11: guideline rule B-5 |

Comparing chunk ids works like this: the source tree says which chunk comes
next and how long it is. The recognizer hashes that many incoming bytes and
compares the result with the id the tree records. Equal ids mean the same
object, which is the identity the read path already relies on when it
authenticates a fetched object. Only the partial chunks at the two edges of an
edit need committed bytes, and that is at most one chunk each.

A miss in D-1 already costs a hash of the fetched bytes, so hashing the written
bytes is never more work than fetching to compare, and it needs no I/O.

### Rules this adds to the guidelines

1. Recognition never requires that committed payload be resident in D-1 or in
   the kernel. It may read tree nodes, which are small and cached in D-1.
2. Committed payload fetched for recognition is bounded per write: at most the
   partial chunk at an edge.
3. Recognizer state is charged to a fixed daemon-wide allowance, so many
   Workspaces cannot grow it.
4. No cache bound in section 4 is raised to make recognition work.
5. Reference reads use D-1 and D-2 unchanged; no second cache of committed
   bytes is added.
