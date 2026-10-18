# #359 · Command-performance RCA and implementation proposal (2026-10-18)

> **Status:** PROPOSAL, reviewed 2026-10-18 (independent review, §14; all 19
> findings dispositioned). RCA and design only: no behavioral change in this
> document. The owner's go-ahead to implement after review
> (2026-10-18) covers the batches in §7; the items in §12 still need an owner
> decision before code. Predicted effects are hypotheses until the before/after
> receipts in §10 exist. [COST_MODEL.md](COST_MODEL.md) and every historical
> receipt stay unchanged. Proposed budgets in COST_MODEL §6 remain proposals.

Lead: the #359 command-performance session (took over Devin session
`glistening-pickle`, which a user interrupt stopped at 10:47 UTC; no live process,
container or write of it remained). RCA by three read-only subagents:
A (Store SQL and committed-content reads), B (FUSE, directory operations and
overlay mutations), C (mount, Exec, Commit). Their findings are merged below.
Labels: **SP** source-proved, **OBS** observed in a named receipt, **HYP**
hypothesis, **RO** ruled out, **UNATTR** unattributed.

Variables: *N* namespace entries, *d* entries in a directory, *h* tree or B-tree
height, *K* changed or captured entries, *B* bytes, *L* delta-chain depth, *P*
result pages, *r* records per decoded group (≈115–380 here), *m* metadata
objects per `stat` (7 root form, 0 inline).

## 1. Source identities: done, unfinished, unknown

| Work | Source | Binary | State |
| --- | --- | --- | --- |
| Measured cost table (36 cases) | `issue359-cost-model` `7fd5db242` (product `41efeeae8` = `7a11f3c3e` + counters) | daemon `50155780`, addon `c41ae8c5` | done; receipts `~/lfs-history/runs/issue359/` seq 103–175 |
| #354 fs read calls; immutable reads without BEGIN/COMMIT; per-call `ReadCache` | `claude/issue354-fs-read-calls-58a66a` `337bf0024` (pushed) | no Linux daemon binary found; SDK-process probes only | implemented on its branch, owner merge pending; resumable page tokens on hold with the owner |
| #360 item 2, inline mode/mtime | `issue360-storage` `d36a14159` (local, not pushed: Devin's push failed) | daemon `928b2872`, addon `0286ddbd` | done; stat −37% statements on rewritten rows; range-14 Store growth −15.9% |
| #356 D0 per-opcode timing | `050d311f0`, `5398fff7b` on `dsh-352-f032-rm-rf` | — | done (instrumentation) |
| #356 step 1: sibling-length batch, 8 MiB daemon cache | `2aed07094` | #356's D0 binary | accepted by owner; D0 16,460 → 15,268 ms; flat wide/deep |
| #356 READDIRPLUS | `fb1f8a527` | none | **WIP**: does not compile on Linux (`mount/profile.rs` closure type, E0308/E0631, receipt `layerfs-issue359-impl/core/target/issue359-impl/build-1.log`); mount tests never run |
| #353/#355 lineage, merge at scale, short lane | `claude/issue353-lineage-cap-ec7c49` `b7d79b001` | own | in progress elsewhere; not in this baseline (liaison) |
| **Integration baseline** | `issue359-impl` `ee7e0fc51` = `7a11f3c3e` + #354 `337bf0024` + #360 `d36a14159` + #359 `7fd5db242` + picks of `050d311f0`, `5398fff7b`, `2aed07094` | daemon `d7ae4806`, addon `db6d4adb` (`core/target/issue359-impl/`) | built, release `--locked`; **not yet measured** |
| Unknown | F-036 (concurrent first-install Commit "object … is not stored"), F-043 (runner memory) | — | not this lane; constrains caching (§3.6) |

Production LOC at the baseline: 97,219 (`7a11f3c3e`) → 98,363 (`ee7e0fc51`):
#354 +609, #360 +224, #359 +34, #356 picks +69 +99 +109. The WIP READDIRPLUS
pick on the branch head `8b4fcef25` adds +541.

## 2. Ranked causes

Shares are from the cold arms of COST_MODEL §2 at `50155780` (64 KiB daemon cache,
before #354/#356). Step 1's 8 MiB cache and #354's transaction-less reads are in the
baseline, so every share is re-measured there first (§10, step 0).

| # | Cause | Commands | Source | Measured share / count | Current | Proposed | Uncertainty |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| R1 | Each daemon Store demand builds a fresh storage `Reader`, so it re-reads a whole ~16 KB metadata pack, hashes it, and decompresses a ~49 KB group to take one ~143 B object. The next sibling's object is in the same group. | every walk; `ls -l`; `cp -a`; committed `rm -rf`; `grep -r`; vitest; `tsc -b`; `git status`; first `stat` | `store-service/src/store/read_handle.rs` `objects()` → `storage.reader()`; `storage/src/read/provider.rs`, `objects.rs:25-34` | `ls -l` 10k: 40,528 pack selections (39,740 whole + 788 range; 10,001 of them payload chunk packs, 62.0 MB), 551 MB of BLOB bytes for 5.8 MB of objects; ~2.75 of 3.91 s served is outside SQL (s155). Each decoding demand also zero-fills a fresh 1 MiB decode arena (`storage/src/encoding/codec.rs:171-181,484-486`): ≈30k × 1 MiB in `ls -l` 10k (HYP ≈0.9 s) | O(d·m) pack reads + decodes | O(d/r) decodes | Distinct groups per walk not counted yet (Q-A2) |
| R2 | ~6 statements and ~2 read transactions per Store request | same as R1 | `persistence/src/storage/provider.rs`, `transaction.rs:219,241`; descriptor read again in `objects_selection.rs:43-55` | `ls -l` 243,684 statements / 81,228 txns; 14.2 µs per txn; at the baseline 81,071 statements (§10.1) | 3·(locate + selections + value groups) | #354 `0b0a883f0` (in the baseline) → ~2 per request; drop the descriptor SELECT → ~1 | Plans are optimal (§3.1); SQL is 26% of `ls -l` served time, BEGIN/COMMIT ≈2–5% |
| R3 | Lookup-only unlinked files become SQL orphan rows, torn down at FORGET with ~9 statements; one orphan anywhere adds an SQL probe to every inode read and disables row memory | `rm -rf` (both), `cp -a`+`rm`, any unlink | `overlay/src/lifetime/orphan.rs:33-39,51,93`, `maintenance/orphan.rs:78,280,370`, `lifetime/kernel_visit.rs:74-76` | rm-created: 23.95 overlay statements, 2 txns, 4.78 owner jobs per entry with 0 Store reads (s123); forget 28–30 µs (D0) | ~11 statements + 1 txn per forget | O(1) memory per forget; no probe | Orphan-probe share (Q-B3) |
| R4 | Missing names answered as ENOENT errors, never cached by the kernel | vitest, Node resolution, `tsc -b`, `pnpm install`, `git status`, `cp -a` pre-lookups (cold only) | `fuse/src/request/reply.rs:109-118` | vitest steady: 18,703 of 18,704 lookups ENOENT again; first install 53,496 of 57,975 lookups ENOENT | one request + Store reads per repeated probe | one negative dentry per (parent, name) per entry TTL | Exact invalidation on merge install (Q-B6) |
| R5 | One LOOKUP request per listed entry (no READDIRPLUS) | `ls -l`, `rm -rf`, `find`, `du`, `cp -a` | `fuse/src/operations/unsupported.rs`; `mount/profile.rs` | D0: 46,327 lookups × 70 µs | d LOOKUPs per directory | ⌈d/23⌉ READDIRPLUS pages | Name-only walks may regress without READDIRPLUS_AUTO (Q-B5) |
| R15 | No directory listing is cached by the kernel: OPENDIR replies never set `FOPEN_CACHE_DIR`, so every repeated walk re-asks every listing | steady `du`, `ls -R`, `find`, `git status` | `fuse/src/request/reply.rs` `open_flags()` | du steady readdir 14,322 = cold; `git status` steady 1,028 (s121, s127) | every listing per walk | listings cached until a change or install invalidates the directory | Conflicts with READDIRPLUS and with per-handle cookies (§12 D-9) |
| R6 | Fixed per-request and per-job overhead: new ports and client per request; one owner job per batch-forget unit; readdir cookie publish as its own job; mount accounting mutex ×3 + `notify_all` | every FUSE request | `daemon/src/service/filesystem_port.rs:39-47`, `store/operation.rs:37-47`, `fuse/src/request/inline.rs:42-81`, `dispatch/requests.rs:81,192,234`, `overlay/owner.rs:301-399` | ~2–5 µs per request (HYP); forget callback 28.0 vs job 26.1 µs (D0) | constant × requests | lower constant; jobs per BATCH_FORGET frame | Split per opcode (Q-B4) |
| R7 | Inline overlay maintenance runs to completion on the thread that finished a job | `rm -rf` created (621 ms under the lock); Commit after install (843 ms after the reply span) | `store-service/src/overlay/owner.rs:401-403,413-474,561-563` | rm-created: 25,238 maintenance jobs, 304 MB (s123); 857 ms gap after the Commit span (s111) | unbounded drain on a request or reply path | bounded steps; drain when idle | Owner decision on placement (§12 D-4) |
| R8 | Commit construction issues ~31.5 overlay jobs per inode: point reads repeated across ~18 passes; one SQL per key in `get_many`; read-before-write guards | Commit after install; any large Commit | `workspace/src/construction/namespace/cursor.rs:16-40,87-124`, `records.rs:102-299`; `overlay/src/lifetime/indexed_operation_record.rs:47-145` | s111: 1,511,408 jobs, 6.93 s hold, 3.30 M overlay statements, 114,643 overlay write txns for 47,934 inodes | O(P·K) jobs, P ≈ 18 | O(P·K/64) windowed reads; buffered guarded writes | ~4.3 s of construct is UNATTR (Content CPU vs job overhead, Q-C3) |
| R9 | Construction's Store reads run on the writer session and queue behind the publication lane | Commit after install; concurrent Commits | `store-service/src/store/open.rs:127-130`; `persistence/src/backend/sqlite/lane.rs:20-38`, `admission.rs:12,51-112` | s111: 56,600 writer txns, only 214 writes; 6.17 s | one writer turn per locate or pack read | reader session | Owner decision (§12 D-3) |
| R10 | `begin_save` zero-fills 16 MiB and takes a write transaction on every Save; a fresh handle also reloads policy and 8,192 signatures | every Commit (unchanged ones too) | `storage/src/encoding/codec.rs:55,171-219`, `save/state.rs:79-111`, `save/reservation.rs:9-30`, `delta/candidates.rs:265-305` | small Commit: begin 10.2 ms fresh (s135), 0.58 ms p50 kept, up to 31 ms (range-14 trace) | constant per Save + writer wait | constant per handle; lazy reservation | Writer-wait share (Q-C2) |
| R11 | An unchanged Commit still takes a Save, a reserve write and the lane | 78 of 144 range-14 Commits | `store-service/src/store/commit.rs:125-323` | 4–40 ms each | full path | ~1 ms answer when nothing is captured and the head did not move | File owned by #353/#355 (§12 D-5) |
| R12 | Directory kind per inherited readdir entry by separate inode descent; link count of a committed directory by listing it | `find`, `ls -R`, `du`; first change in a directory | `workspace/src/operations/kernel_directory.rs:245`; `base/links.rs:85-128` | after step 1: O(d) per content root once, LRU 16,384 (RO for O(d²)) | d descents per window | `lookup_many` per window | Size after R1 (small) |
| R13 | Mount/unmount fixed work: fresh Store reader connection per mount; catalog `reserve_inodes` write per attach; unmount refreshes every mount record (O(M) status calls); 1.5–2.1 ms observation per traced call | mount, unmount | `store/read_service.rs:90-136`, `daemon/src/control/attach.rs:122`, `sdk/js/native/src/{discovery.rs:411-456,sandbox.rs:441,504}`, `daemon/src/application/diagnostics.rs:241-316` | mount p50 13.1 ms (UNATTR ≈5.8 ms in SDK); unmount p50 8.8 ms (UNATTR ≈5.5 ms in daemon) | O(M) per unmount | O(1) | Unmount has no spans (Q-C4) |
| R14 | Exec launch ≈46 ms on both arms (p50 44 ms over 292 range-14 Execs) | every short Exec | `sdk/js/native/src/exec.rs:44-67`, Docker Engine exec into the long-lived Sandbox | native 46.2 ms vs LayerFS 46.7 ms fixed launch (s111) | — | — | UNATTR between SDK, Engine and runc. Not a FUSE cost; no fix proposed before spans |

**Ruled out (RO):**
- inefficient SQL plans: every hot statement is a primary-key seek, `fullscan_steps` 0;
- "range reads instead of whole packs": the needed group is the whole pack for 99.8% of small metadata objects;
- O(d²) removal or lookup after step 1: wide 2,833 ms vs deep 2,834 ms;
- whole-root work on repeated mount;
- O(N), history or Branch-count growth in the publication lane at `b7d79b001`;
- owner-lock contention on read-only cases (hold ≤11% of wall);
- `max_background=1` as the cause of rm's lock wait.

## 3. SQL plans and transactions

### 3.1 Plans (subagent A, host sqlite3 3.51.0 on an independent byte copy of `layerfs-issue359-prep`, sha256 `82352f4c…`; product bundles 3.53.2)

```
Q1 SELECT o.object_id,o.role,o.canonical_length,o.group_number,o.record_number,p.pack_id,p.domain,p.digest,p.length
   FROM object_location o JOIN pack p ON p.pack_id=o.pack_id WHERE o.object_id IN(?1)
|--SEARCH o USING PRIMARY KEY (object_id=?)
`--SEARCH p USING INTEGER PRIMARY KEY (rowid=?)
Q3 SELECT pack_id,domain,digest,length FROM pack WHERE pack_id=?4
`--SEARCH pack USING INTEGER PRIMARY KEY (rowid=?)
Q5 SELECT body FROM pack WHERE pack_id=?4           (then blob_open on the same row)
`--SEARCH pack USING INTEGER PRIMARY KEY (rowid=?)
Q6 SELECT v.ordinal,v.value FROM json_each(?6) r JOIN inode_value v
   ON v.ordinal BETWEEN json_extract(r.value,'$[0]') AND json_extract(r.value,'$[1]')
|--SCAN r VIRTUAL TABLE INDEX 1:
`--SEARCH v USING INTEGER PRIMARY KEY (rowid>? AND rowid<?)
```

Bound with real rows: an AttrLeaf `7E17024E…` (pack 58659260, 16,068 B, group 0,
record 157) and two FileState ids. Full EXPLAIN of Q1 shows a covering descent
of the WITHOUT ROWID key, then `SeekRowid` on `pack` reading columns 1–3 only, so
the overflow chain is not walked. The planner-version risk is low: every plan is
a key seek.

Physical facts: `object_location` 836,710 rows, depth 4; `pack` 45,633 rows,
33,920 overflow pages; reader pager 2 MiB (`cache_size=-2048`), `mmap_size=0`.

### 3.2 Transactions per logical operation (SP, matched exactly by the receipts)

| Unit | At `7a11f3c3e` | After #354 `0b0a883f0` (in the baseline) | Proposed |
| --- | --- | --- | --- |
| One port call | BEGIN + 1 SELECT + COMMIT = 3 | 1 for locate and pack read; `inode_values` keeps 3 | descriptor from the locate (F-A3): pack read is 0 extra SELECTs plus `blob_open` |
| One reader request | 3·(locate + selections + value groups) ≈ 6 | ≈ 2 | ≈ 1, and selections ≈ distinct groups (F-A1) |
| `ls -l` 10k entries (s155) | 243,684 statements, 81,228 txns (= 40,242 + 40,528 + 458) | predicted 82,144 statements, 458 txns | predicted ≲ 41k statements, selections ≈ hundreds |
| `find` (s115) | 320,112 / 106,704 | predicted 136,400 | — |
| Commit after install, Store side (s111) | writer session 218,713 statements, 56,600 txns, 214 writes | reads lose BEGIN/COMMIT but still enter the writer admission queue (HYP) | reads on a reader session (§12 D-3) |

The time is not in the plans: in `ls -l` 10k, SQL is 1.151 s of 3.906 s served.
The rest is the per-request zstd decode (30,527 decodes of ~49 KB ≈ 1.5 GB),
whole-pack SHA-256 and BLAKE3 of each object, decoding, and cache copies. So
statement budgets alone buy little wall time. The repeated decode (R1) is the
lever.

### 3.3 Paging (SP at `337bf0024`)

All three paged SDK calls still pass a count token: page *j* re-walks and skips
*j·k* results.
- `fs.list`: O(R²/(128k)·h) directory-page decodes in total.
- `fs.glob`: O(P·W) over the pruned subtree.
- `fs.grep`: re-scans content up to the *j·k*-th match, O(B·P/2). Paging through 10k matches at k = 50 is predicted ~300 s on P3 (HYP).

#354 owns this. Resumable tokens are on hold with the owner (§12 D-7). This
proposal does not reimplement it.

### 3.4 Caches

| Cache | Bound | Survives |
| --- | --- | --- |
| Daemon canonical cache | 8 MiB in the baseline (`2aed07094`; was 64 KiB) | daemon lifetime, shared by Workspaces |
| SDK process canonical cache | 64 KiB (`store_service.rs:34`) | process |
| Reader `Fetch` locator | 4,096 entries, per Workspace reader | across requests; `absent` cleared at every demand |
| `ReadState` (2 MiB packs, 512 KiB decoded groups, 512 KiB pooled values) | — | **one daemon request**; one SDK call at #354 |
| SQLite pager | 2 MiB per reader connection | until another connection commits (WAL change check) |
| OS page cache | — | across everything; `mmap_size=0`, so every pager miss is a `pread` |

A stat'd entry needs about 650 B of canonical-cache charge (portable 272 +
length 264 + leaf share). A steady walk of the 51k-entry r17 tree needs about
33–72 MB, so an LRU of 8 MiB still gets ~0% hits on a cyclic walk (HYP).

### 3.5 What #354 fixed and where it applies (SP by call sites)

- `0b0a883f0`: the only SQLite `PackPersistence`, so it **does apply to the daemon FUSE path**.
- The per-call `ReadCache`, `Cached` and batching apply only to the SDK read calls.
- SDK mutations (`fs.rm`, `write`, `apply`) use a private Workspace view, so they pay R1 too.

### 3.6 Constraint from F-036 (stale negative entries)

A negative locate is a fact about one SQLite snapshot. Since `0b0a883f0`, two
pages of one `locate` can see different snapshots. Rule for every change below:
never cache absence across a demand, process or Workspace, and never resolve a
dependency of an object first seen at snapshot S from an absence recorded before
S. F-A1, F-A3 and the canonical cache are positive-only caches over insert-only,
trigger-immutable rows (no UPDATE or DELETE of `pack` or `object_location`
anywhere), so they add no negative entries. Kernel negative dentries (F-B4) are
overlay-namespace state: another writer changes them only through a merged
install, which invalidates them (F-B4).

## 4. FUSE request, ownership and overlay-job analysis

### 4.1 Per entry (subagent B; counters from `sample.json` and Status deltas)

| | rm created (s123) | rm committed (s125) | D0 after step 1 | `cp -a` (s123) | `find` (s115) | `ls -l` 10k (s155) |
| --- | --- | --- | --- | --- | --- | --- |
| N | 46,722 | 46,722 | 46,327 | 46,722 | 51,490 | 10,000 |
| wall µs | 214 | 730 | 330 | 1,367 | 165 | 439 |
| FUSE requests | 4.52 | 4.94 | 4.93 | 12.32 | 0.71 | 1.02 |
| owner jobs | 4.78 + 0.54 maint. | 6.24 + 0.21 | ≈5.5 | 13.49 | 1.00 | 2.03 |
| overlay txns | 2.00 + 0.45 | 2.00 | 2.0 | 3.88 | 0 | 0 |
| overlay statements | 23.95 + 3.27 | 26.56 | ≈24 | 32.4 | 1.40 | 5.03 |
| lock hold / wait µs | 92 / 52 | 135 / 30 | — | 215 / 47.5 | 17 / 1.3 | 62 / 0.2 |
| Store statements | 0 | 31.2 | — | 37.6 | 6.2 | 24.4 |

Job identity in rm-created is exact: 176,612 general jobs are
- 23,594 lookup
- 47,365 getattr
- 50,170 forget units
- 12,496 opendir
- 18,250 readdir
- 12,241 cookie publishes
- 12,496 releasedir

plus 46,722 mutation jobs (unlink + rmdir). One COMMIT costs 6.96–7.32 µs.

### 4.2 Removal path

**unlink:** `callbacks.rs:411` → `request/mutate.rs:139,199` →
`filesystem_port.rs:261` → `kernel_operations.rs:48` → `owner.rs:231` →
`operations/kernel_visit.rs:309` → `overlay/lifetime/kernel_visit.rs:307`
(BEGIN IMMEDIATE) → `compound.rs:153,248` → `orphan.rs:51` `detach_orphan`.
`holders = refs.total()` counts the kernel's lookup reference, so every unlinked
file gets an orphan INSERT at generation −1.

**FORGET:** `inline.rs:42` (one job per unit) → `filesystem_port.rs:345` →
`lifetime/kernel.rs:214` → `file_owners.rs:27` → `maintenance/orphan.rs:78` →
`reclaim_orphan` / `retire_layer`. About 11 statements and a transaction prove,
for a committed file, that nothing was stored. For a created file the payload
cells are dropped 14 per step and the rest drains inline (R7).

### 4.3 Ownership obligations the proposals keep

- `default_permissions` stays: one parent GETATTR per delete is inherent.
- READDIRPLUS takes +1 kernel lookup reference per sent non-dot entry. The kernel links every entry in the reply and force-forgets on a link failure (checked against v6.12 `readdir.c` `parse_dirplusfile`/`fuse_direntplus_link`). Unsent references are given back with FORGET.
- A negative entry (`nodeid = 0`) takes no reference.
- Inode numbers stay `identity.inode(serial)` on every reply path.
- ENOTEMPTY stays decided from the `entries` row; whiteouts stay exact.
- Memory grows only with open and kernel-referenced files (the AGENTS resident exception).

### 4.4 Request floor and the #356 target

| Work per entry | Now (D0, step 1) | Plausible after F-B1…F-B5 | Mechanism |
| --- | --- | --- | --- |
| FORGET | 28 µs | 2–4 µs | memory-only lookup orphan; one job per BATCH_FORGET frame |
| parent GETATTR | 35 µs | 4–8 µs | no orphan probe; shared ports |
| LOOKUP | 70 µs | request removed; 5–8 µs decision inside a page | READDIRPLUS with batched needs |
| UNLINK | 54 µs | 17–25 µs | no orphan INSERT; COMMIT 7 µs remains |
| directory operations, amortized | ≈56 µs | ≈10 µs | publish folded into the visit |
| **daemon total** | ≈243 µs | **≈38–55 µs** (HYP) | |

With ≈2.8 synchronous requests per entry at ≈19 µs of kernel round trip, D0 comes
to ≈91–108 µs per entry, **≈4.2–5.0 s, ~12–14× native (HYP)**. F-B1's memory-only
FORGET holds only under its conditions (a) and (b); otherwise add ≈7–10 µs per entry.

The owner's **3 s target is not reached by these fixes alone**. It needs per-entry
daemon work of ~10 µs, and one SQLite write transaction per unlink already costs
7 µs in COMMIT. Grouped overlay commits are an owner decision (§12 D-1). The
target stays as written. A miss will be reported as a miss.

## 5. Mount, Exec and Commit phases

Values are p50 of the range-14 trace (`i360-r14-final`) unless noted. Every
traced call carries 1.5–2.1 ms of observation (`observe.after`); untraced calls
are lower (HYP, Q-C6).

**Mount, 13.1 ms:**

| Phase | ms |
| --- | ---: |
| `bind.reader` (new read-only connection) | 0.72 |
| `bind.snapshot` | 0.08 |
| `bind.root` (O(h)) | 0.18 |
| `bind.overlay` (template copy + open) | 0.35 |
| `kernel.attach` (writer txn + FUSE mount/INIT) | 2.59 |
| observation ×2 | 3.45 |
| UNATTR (SDK save_mount, 2 round trips, napi) | ≈5.8 |

Repeated mount does no whole-root work (RO). Tails of 53–65 ms have only 6–13 ms
in the daemon.

**Unmount, 8.8 ms:**

| Phase | ms |
| --- | ---: |
| SDK O(M) refresh | in the remainder |
| observation | 3.27 |
| daemon dirty check, detach probe, drain, revoke, overlay close and unlink, reader close | UNATTR ≈5.5 (no spans) |

After the large install it took 75.7 ms (531 MB overlay file, 23.7k kernel entries).

**Exec, p50 44 ms (range-14), fixed launch ≈46 ms (s111):** Engine exec into the long-lived Sandbox (create, start with a
multiplexed stream, inspect). The daemon is not involved and holds no Exec
registration. The fixed launch is the same on the native and FUSE arms (46.2 vs
46.7 ms, s111); its split is UNATTR. The daemon stays out of command execution;
any later Exec work is SDK/Sandbox-side.

**Small Commit, 20.3 ms on a fresh daemon (s135):**

| Phase | ms |
| --- | ---: |
| capture | 0.005 |
| producer take | 0.07 |
| **begin** | **10.23** |
| `captured.namespace` | 2.06 |
| lane wait | 0.006 |
| head | 0.04 |
| finish | 1.77 |
| count / bindings / validate | 0.74 / 0.47 / 0.84 |
| publish / install | 0.16 / 0.08 |
| observation | 2.08 |
| UNATTR | 1.72 |

The lane holds ≈4.0 ms with a fresh handle and ≈0.4 ms with a kept one. Begin is:
1. policy row;
2. reload of 8,192 signatures into a 65,536-entry table (fresh handle only);
3. 16 MiB zero-fill of the compression workspace plus 1 MiB of decompression workspace (every Save);
4. a reserve write transaction, which takes the cross-process writer lock on Linux.

**Unchanged Commit:** 4–40 ms (78 of 144). It takes a Save, a reserve write and the lane to answer UpToDate.

**Commit after install, 19,840 ms (s111):**

| Phase | Value |
| --- | --- |
| begin | 40 ms |
| construct | 17,453 ms |
| overlay jobs | 1.51 M, hold 6.93 s |
| Store writer | 6.17 s across 56,600 txns |
| UNATTR in construct (Content CPU vs outside-lock job overhead) | ≈4.3 s |
| UNATTR after construct (finish … install; trace truncated) | 1,487 ms |
| after the span, matching inline maintenance (843 ms) | 857 ms |

Construction counters: `record_jobs` 890,272 (18.6/inode), `header_points`
541,905, `fresh_points` 799,431, `change_opens` 6.0 per directory. Not O(K·d) or
O(K·h): ancestry 2.0 steps per placement.

**Publication lane:** at `7a11f3c3e` it covers finish, count, bindings and
validate (grows with K). At `b7d79b001` only the bounded in-lane step remains.
`commit_branch` is O(1) in history and Branch count. Other writer-session users
still queue behind the lane (R9).

**Sustained same mount:** nothing found that makes later Commits cost more (SP +
OBS from s111: rows reclaimed to ~0, kernel references not iterated by capture).
Not measured: a new harness case is added (§10).

## 6. Proposed fixes, grouped by shared cause

Ownership: the liaison's map (2026-10-18). This lane owns fuse
`operations/*`, `request/*`, `mount/profile.rs`, `attributes.rs`; workspace
`operations/*`, `base/{links,view,client}.rs`, `mutation/*`,
`construction/namespace/*`, `construction/captured/*`; overlay `lifetime/*` and
the kernel operation files; store-service `overlay/*`;
`sdk/js/native/src/sandbox.rs`; the #359/#360 lists. #354 owns storage `read/*`,
persistence `transaction.rs`/`storage/provider.rs`, store-service
`store/read_handle.rs`, `store/ports.rs`, `sdk/*`. #353/#355 own
`store/commit.rs`, `commit_merge.rs`, `commit_types.rs`, persistence `history/*`
and `schema.rs`/`query.rs`.

### G-A · Committed reads: decode each group once per Workspace (R1, R2)

- **F-A1 Per-Workspace `ReadCache` in the daemon's `ReadSession`.**
  - Change: keep the decoded-group cache and the pack cache across demands in the session `State`, used under the session mutex already held per demand. #354's `ReadCache` cannot be held as is: it contains a `DecompressionWorkspace` with a raw `ZSTD_DCtx` pointer, which makes it `!Send`, and `ReadSession` is shared across FUSE threads. So only the `Send` parts (`PackCache`, `GroupCache`, `PoolReader`) persist; the decode arena stays per demand. `file_lengths()` needs a `*_with` variant too (`read/length.rs:9-13`).
  - Work removed: the whole-pack read, SHA-256 and zstd decode repeated for every object of the same group.
  - Complexity: O(d·m) pack decodes → O(d/r + misses).
  - Bound: ≈6 MiB per Workspace reader in the ordinary case (2 MiB packs + 512 KiB decoded groups + the pool reader's 2 MiB packs + 512 KiB values), and up to ≈20 MiB when one singleton pack up to 16 MiB + 4 KiB is held. To keep the long-lived bound at ≈6 MiB, singleton and payload pack bodies are dropped at the end of each demand. Released at unmount; daemon RSS reported. The cache-lifetime text in `storage/src/store/policy.rs:101-133` ("the operation/wave") is updated with the change.
  - Safety: positive-only. `pack` and `pack_unit` are trigger-immutable; `object_location` and `inode_value` are insert-only by code (§3.6).
  - Files: `store/read_handle.rs` (**#354-owned**: the change goes to the liaison first; it is #354's own mechanism, applied to the daemon caller).
  - Predicted (HYP): `ls -l` 10k pack bytes 476 MB → single-digit MB; the walks' wall falls toward their SQL share.
- **F-A3 Pass `PackInfo` from the locate into `read_scoped_pack`; drop the second descriptor SELECT.**
  - Work removed: 1 statement and 3 B-tree descents per selection.
  - Files: storage `read/*` and persistence `storage/provider.rs` (**#354-owned**). Proposed to #354, not done here.
- **F-A4 Zeroed allocation for decode and compression arenas** (`storage/src/encoding/codec.rs`): allocate zeroed (`vec![0; n]`, which maps untouched pages lazily) instead of `resize(n, 0)` on a reused buffer. Work removed: a 1 MiB memset per decoding demand and the 16 MiB fill per Save (R10). No retained memory. Files: storage `encoding/codec.rs` (asked).
- **F-A2 Canonical cache bound for steady walks.** 8 MiB is in the baseline. Sizing for a 51k-entry walk (≈40 MiB) or scan-resistant admission is an owner decision (§12 D-2), taken only after F-A1 shows what misses still cost.

### G-B · Kernel request volume and per-request daemon work (R3–R6, R12)

- **F-B1 Lookup-only orphans in memory.**
  - Change: when an unlinked inode has only kernel lookup references (no opens, no readers), keep its orphan state in the journaled `open.orphans` map instead of a generation −1 row. Materialize the row only if an open or read reaches it.
  - Work removed: 1 INSERT per unlink; ≈11 statements and a transaction per FORGET of a committed file.
  - Exact only when (a) the serial has no local layer between the installed and the active generation (a committed file that this Workspace never wrote), and (b) the serial's retirement was enqueued in the unlink transaction and stays parked under the generation hold. Otherwise `retire_layer` keeps the active-generation tombstone and `release_orphan_layer` must write, so the general case still costs at least one write and one ≈7 µs COMMIT.
  - Every reader of the generation −1 row must consult the map: `orphan_inode` (GETATTR, `namespace/inode.rs:98`), `compound.rs:274`, `orphan_layer`/`orphan_read` (`lifetime/orphan.rs:123-178`), `kernel_visit.rs:288` and `migrate_orphan`. Materialization on OPEN happens inside the OPEN job. Rollback uses the existing journal (`database/connection.rs:338-342`); the overlay is MEMORY/disposable, so a crash needs nothing.
  - Complexity: O(1) memory per forget under (a) and (b).
  - Risks: GETATTR or reopen through `O_PATH` and `/proc/self/fd` after unlink; a Commit while it is referenced; rollback of the journaled map.
  - Files: overlay `lifetime/{orphan,file_owners}.rs`, `maintenance/orphan.rs`, `namespace/compound.rs` (this lane; `maintenance/` and `namespace/` are confirmed with the liaison before editing).
- **F-B2 Orphan probe only for serials in the exact orphan map.**
  - Work removed: 1 SQL per inode read while any orphan exists; restores row memory in `visit_fence`. `detach_orphan` clears the serial's row memory recorded earlier in the same job.
  - Complexity: O(1) check.
  - File: overlay `lifetime/orphan.rs`, `lifetime/kernel_visit.rs`.
- **F-B3 Per-request constants.** Share one per-mount port and client (keep a per-request failure slot); serve BATCH_FORGET through fuser 0.18's `Filesystem::batch_forget` (`vendor/fuser-0.18.0/src/lib.rs:432`; the comment at `request/inline.rs:37-40` saying the opcode is not exposed is wrong) with one owner job per ≤64 units, so a frame of thousands of units never becomes one long hold; fold the readdir cookie publish into the visit job.
  - Work removed: allocations and locks per request; 0.26 jobs per removed entry; forget jobs ÷ units per frame.
  - Files: fuse `request/inline.rs`; daemon `service/filesystem_port.rs` (unlisted: asked); store-service `overlay/*`.
- **F-B4 Cached negative lookups.**
  - Change: answer `Refusal::Missing` on LOOKUP with `ReplyEntry` of `ino = 0` and the entry TTL. fuser 0.18 passes `attr.ino` through, and the kernel caches a negative dentry; no fuser patch.
  - Invalidation:
    - creates, links, mkdirs, symlinks and renames through the mount replace the negative dentry in the kernel (one kernel mount per Workspace);
    - a merge or replace install already invalidates every changed binding (`daemon/src/control/invalidate.rs`, `commit_merge.rs:184-228`), and a test proves that added names are reported;
    - a known install does not change the view;
    - an in-flight LOOKUP decided on the old view cannot leave a stale negative after a merged install. The kernel holds the parent's `i_rwsem` shared from the LOOKUP request until the dentry is hashed (`lookup_slow`), and `fuse_reverse_inval_entry` takes it exclusively (Linux 6.12, the VM kernel here, `6.12.76-linuxkit`). An invalidation sent after the install therefore waits for that lookup and then drops its dentry. Positive entries rely on the same ordering today. SP from kernel source; not run as a race test.
  - Scope: a fresh mount has a fresh dcache, so a one-shot Workspace gains only on repeats within its own run, and a sustained mount gains across calls within the 60 s entry TTL. Within-run duplicate misses are not counted yet (Q-B7), so the effect on cold arms is unknown.
  - Work removed: every repeated probe's request and Store reads.
  - Files: fuse `request/reply.rs` (#359-owned).
- **F-B5 READDIRPLUS, completed.**
  - Fix the Linux build.
  - Collect every undecided name's needs on a page into one supply round (today one name per round, `operations/plus.rs`).
  - Run kernel_custody, fp2 and fp21.
  - Land after F-B1/F-B3, because each listed entry adds a FORGET.
  - Measure name-only walks (`find`, `ls -f`); if they regress, the AUTO policy is an owner decision (§12 D-6).
  - Work removed: d LOOKUP requests per directory → ⌈d/23⌉ pages.
- **F-B6 `lookup_many` for inherited readdir kinds** (`kernel_directory.rs:245`), as F-026 did for `fs.list`. Work removed: one inode descent per entry, now one batched descent per window.
- **F-B7 Bounded inline maintenance (not in a batch until D-4).** Run at most a fixed number of maintenance steps per finishing job, and drain the rest only when the mount has no active request. Reclamation still progresses under sustained load, so it stays bounded. No new thread. Placement is §12 D-4.

### G-C · Commit construction and Save (R8–R11)

- **F-C1 Windowed sealed-point reads in the namespace `Cursor`.**
  - Change: on a memo miss for (kind, s), read one key range `key ∈ [key(kind, s), key(kind, s + W))` with W ≤ 1024 (the memo's `POINT_SLOTS`) and `LIMIT 64`, under the same fence and `OPERATION_RECORD_BYTES` checks as `get_many` (`indexed_operation_record.rs:47-67`). Fill the slots for the returned serials and mark absent only the serials in `[s, min(last returned, s + W))`. The window constrains kind and file scope. Sealed records never change after `seal` (`construction/driver.rs:207-210`), so absence inside a sealed window is exact.
  - Work removed: ≈0.85 M point jobs on s111.
  - Complexity: O(P·K) → O(P·K/64) jobs.
  - Files: `construction/namespace/cursor.rs`; one bounded query in overlay `lifetime/indexed_operation_record.rs`.
- **F-C2 Buffered guarded writes and batched `get_many` for Content's backed state.**
  - Change: buffer guarded batches to a fixed byte bound, check guards against the buffer then the file, and flush in one overlay job before any key window; `get_many` runs ≤64 keys per statement. Every point read (`get`, `contains`, `get_many`, `records.rs:235-299`) consults the buffer first, deletes included, so the backed state reads its own writes; a guard refusal surfaces at the `apply` that would have refused.
  - Work removed: 113k overlay write transactions → ≈2k flushes; ≈60% of overlay statements.
  - Failure: a flush failure is the attempt's original failure; the attempt is consumed and its records released by the operation owner.
  - Files: `construction/namespace/records.rs`, `construction/records.rs` (asked), overlay `lifetime/indexed_operation_record.rs`.
- **F-C3 Construction reads on a reader session.** §12 D-3 (it changes admission behaviour and touches #354/#355 files).
- **F-C4 Lighter `begin`.**
  - Change: F-A4's zeroed allocation removes the 16 MiB fill without retaining memory, so it comes first. Keeping the workspaces in the `Storage` handle would make producer handles `!Send` (raw `ZSTD_CCtx`) and retain 17 MiB per kept producer; it is not proposed. Reserve lazily at the first object that needs an ordinal, never inside an overlay job or the lane; ordinals are never re-issued (the pool reader caches values by ordinal for its lifetime, which F-A1 extends).
  - Work removed: 17 MiB written per Save; one writer acquisition per metadata-free Save.
  - Files: storage `save/state.rs`, `save/reservation.rs`, `encoding/codec.rs` (unlisted: asked).
- **F-C5 UpToDate fast path.** If capture shows no rows above the installed floor and a lane-free head read equals the bound head, answer UpToDate with no Save, no lane and no install. Lives in `store/commit.rs` (**#353-owned**), so it goes to the liaison as a proposal.

### G-D · Lifecycle constants (R13)

- **F-D1 Unmount touches only its own mount record.** Work removed: O(M) → O(1) status calls. Files: `sdk/js/native/src/{sandbox.rs,registry.rs,discovery.rs}` (sandbox.rs is this lane's; the others are asked).
- **F-D2 Pool per-mount reader connections; explain why attach's `prepare_serials` still writes although `serial_pool`/`pooled_serials` exist (`store/open.rs:82,159-174`) before changing it.** Work removed: one connection open and one catalog write per mount. Files: `store/read_service.rs`, `daemon/src/control/attach.rs` (unlisted: asked).
- **F-D3 Spans only** (instrumentation, declared commit): unmount sub-phases, begin sub-phases, aggregated finish/count/bindings/validate/install, maintenance, and SDK-side Exec create/start/EOF/inspect. These answer Q-C1…Q-C5.

## 7. Implementation order and prerequisites

Each batch is one cause group, in small counted commits, focused tests ≤120 s,
built first. One registered before/after sample per arm at the batch's final
identity.

| Batch | Contents | Prerequisite | Expected change (HYP) |
| --- | --- | --- | --- |
| 0 | Re-measure the baseline `ee7e0fc51` (daemon `d7ae4806`) on the #359 harness (**done**, §10.1), plus the #356 D0 and flatness probes. New harness cases (mount/unmount only, no-op Exec, unchanged Commit, sustained same mount) and F-D3 spans come later, with their own "before" at the spans identity, so the baseline binary stays span-free | Built (done) | establishes "before" with #354 + #360 + step 1 |
| 1 | F-A1 (Send-safe parts only), F-A4 (+ F-A3 if #354 agrees) | liaison/#354 consent for `read_handle.rs`; storage `encoding/codec.rs` ownership | walks, `ls -l`, `cp`, committed `rm`, vitest: pack bytes ÷ ~30–100; wall toward SQL share |
| 2 | F-B4 negative entries (**implemented**, §10.2) | none | vitest/Node/tsc/git steady: ENOENT lookups served → ~0 |
| 3 | F-B1 (under its conditions), F-B2, F-B3 (≤64 units per forget job); F-B7 waits for D-4 | `namespace/`, `maintenance/` and `filesystem_port.rs` ownership confirmation | rm-created and rm-committed: overlay statements per entry 24 → ~10; forget 28 → ~4 µs |
| 4 | F-B5 READDIRPLUS completed, F-B6 | batch 3 (cheap FORGET) | D0 toward ≈4–5 s; `ls -l` 10k lookups → pages |
| 5 | F-C1, F-C2 | `construction/records.rs` ownership | Commit after install: jobs 1.51 M → ≲0.2 M; construct −5…−9 s |
| 6 | F-C4, F-D1, F-D2 | ownership of storage `save/*`, SDK registry/discovery, daemon attach | Commit begin −0.4…−10 ms; unmount O(1); mount −1…−3 ms |

Integration: `issue359-impl` stays a local branch, pushed only as its own branch
if authorized, and never onto `dsh-history-replay` or `main`. When #354 reports a
final commit, it is merged again, and only the affected samples are re-taken,
labelled with the #354 commit they contain.

## 8. Predicted effects (hypotheses, with mechanism)

- **Walks** (`find`, `du`, `ls -R`, `grep -r`): R1 removes ≈99% of decodes when siblings share groups. Expect the cold arms to fall from 66–236× toward the SQL-only share (~25–30% of today's served time), and further with F-B5/F-B6. Steady arms still miss the 8 MiB cache on 51k entries: D-2.
- **`ls -l` 10k:** decodes 40.5k → hundreds. Lookups disappear with F-B5.
- **Committed `rm -rf` (D0):** F-A1 removes base-read decode cost, and G-B removes per-entry overlay work. Predicted ≈4.3 s, missing the 3 s target without D-1.
- **Created `rm -rf`:** G-B only. 24 → ~10 statements per entry; lock wait falls with lighter FORGET.
- **vitest / Node / tsc:** F-B4 removes repeated ENOENT probes; F-A1 reduces cold reads.
- **`cp -a`:** F-A1 (reads); F-B4 does not apply (first-time probes). Per-file Commit-free mutation cost remains (3.88 txns per entry).
- **Commit after install:** F-C1 + F-C2 remove ≈1.3 M jobs. The Store writer's 6.17 s is untouched without D-3.
- **Small or unchanged Commit:** F-C4 for begin; F-C5 if #353 adopts it.

## 9. Correctness risks and focused proofs

| Fix | Risk | Proof (tests ≤120 s, Linux where a mount is needed) |
| --- | --- | --- |
| F-A1 | stale positive data (none possible over immutable rows); unbounded memory | equality of FUSE read results old vs new over a walk; RSS of the daemon reported; reader counts show selections ≈ distinct groups |
| F-B1/F-B2 | unlinked-but-referenced inode reads, reopen, Commit during reference, rollback | O_PATH → unlink → fstat → reopen via `/proc/self/fd` bytes equal, also across a Commit; existing kernel_custody and orphan tests; 0 Reclaim statements per committed-file forget |
| F-B3 | per-request failure custody; batch-forget accounting | existing request-failure tests; reference counts back to baseline after a batch forget |
| F-B4 | a stale negative after a merge install or a create | missing-name lookup twice → 1 request; create through the mount → visible at once; merge adding the name → visible after Commit; reference counters unchanged |
| F-B5 | reference leak or double count; offsets | kernel_custody (listing takes LOOKUP's custody, FORGET returns to baseline), fp2 flags, fp21 counts; `ls -l`/`find` output digests equal native |
| F-B7 | reclamation stops under sustained load | bounded backlog in a continuous create/rm loop |
| F-C1/F-C2 | wrong absence inside a window; guard semantics | identical Commit root ids on the cost-case Commits and a captured-namespace test with more than 1,024 serials (memo collisions); a guard-refusal (`NotApplied`) through the buffer |
| F-C4 | reservation uniqueness on failure | existing Save/reservation tests; begin sub-spans |

## 10. Verification plan: speed, storage, memory

- **Harness:** `dsh/tools/history/cost.mjs` (this lane), one sample per arm, fresh byte clone of `layerfs-issue359-prep`, fresh daemon, native / cold / steady arms, outputs digest-compared. Every receipt records the source commit, daemon and addon sha256, and the #354 commit contained.
- **#356:** the D0 probe (`rmrf-d0.mjs`, 6,182 dirs / 40,145 files) and the flatness probe (100×100 vs 1×10,000), copied into this lane's tree with their sha256 recorded. Native and create-the-same-tree arms.
- **Steps:**
  1. **Before** = `ee7e0fc51` / `d7ae4806`, every case once.
  2. **After** = each batch's final identity: only the cases its cause affects, plus the batch's regression set.
  3. **Final** = the last identity, every case once.
- **Cache state** declared per arm (AGENTS §1): fresh daemon and Workspace per case; Store resident in the VM page cache after the clone (declared, not controlled); native tree resident after its copy.
- **Interference:** host load and the other worktrees' build/E2E activity recorded per sample. There are no go windows (liaison 2026-10-18), and one measurement runs at a time in this worktree.
- **Counts:** FUSE ops by opcode (ENOENT separately), per-opcode ns, owner jobs and lock wait/hold, overlay statements and transactions, Store statements/transactions/pack bytes/decodes, cache hits and misses.
- **Memory:** daemon RSS before and after each case.
- **Storage:** Store file bytes after Commit cases. No fix here changes a Store format.
- **Limits:** the measurement policy's default is ≤15 s per complete performance command (≤25 s declared exceptions). #359's owner-written rules scope this campaign to "each case runs in its own command, under 2 minutes"; cases over 25 s (`cp-rm-nm` 73 s, `grep-r` 63 s, `pnpm-first` 40 s, `rm-rf-nm` 35 s, `du-s` 34 s at the baseline) run under that scoped exception and are declared as such. A case that cannot fit in 2 minutes is `NOT_RUN` with its time; no retries; no workload or timeout change.

### 10.1 Baseline measured (batch 0, 2026-10-18)

Binary `d7ae4806` / addon `db6d4adb` (source `ee7e0fc51`), harness `cost.mjs`
sha256 `3d1d215b…` (unchanged; `runner.mjs`/`run.mjs`/`lww.mjs` carry #360's
resource-prefix change), image `sha256:d3773b4e…`, label `baseline`, ledger
seq 177–249 (37 ends, all exit 0), samples `~/lfs-history/runs/issue359/samples/s177…s249-*-baseline/`,
table `~/lfs-history/runs/issue359/table-baseline.json`, run log
`baseline.txt`. One sample per arm, all 37 commands COMPLETE, outputs agree
with native. Host load 6.4–17.1 from other sessions (recorded per case);
interference declared. The receipts' `source` field is the worktree head
`8b4fcef25` (harness checkout), not the binary source: the binary's source is
in `binaries.json` (`d7ae4806` → `ee7e0fc51`).

| Case (cold unless noted) | Native ms | `50155780` ms | Baseline ms | Statements old → new | Pack/BLOB bytes old → new |
| --- | ---: | ---: | ---: | ---: | ---: |
| `cp -a node_modules` | 1,163 | 63,853 | 53,155 | 1,755,744 → 471,079 | 2.89 GB → 2.39 GB |
| `grep -r` | 515 | 41,425 | 34,022 | 1,938,819 → 528,440 | 2.98 → 2.53 GB |
| `rm -rf` committed | 412 | 34,084 | 27,592 | 1,459,725 → 403,405 | 2.56 → 2.36 GB |
| `du -s` | 120 | 28,241 | 22,955 | 1,585,854 → 443,969 | 2.74 → 2.51 GB |
| first `pnpm install` | 4,204 | 12,128 | **17,290** | 36,285 → 3,585 | 77 → 12 MB |
| Commit after install | — | 19,840 | 14,498 | 429 → 21 | — |
| `rm -rf` created | 510 | 10,008 | 10,053 | 0 → 0 | 0 → 0 |
| `fs.grep` | — | 10,602 | 3,259 | 660,054 → 41,838 | — |
| `find .` | 86 | 8,492 | 5,972 | 320,112 → 76,087 | 507 → 386 MB |
| `find .` steady | 83 | 7,672 | 5,268 | 308,058 → 75,794 | 465 → 385 MB |
| vitest | 1,926 | 6,901 | 5,217 | 231,978 → 17,065 | 551 → 55 MB |
| vitest steady | 4,888¹ | 5,408 | 3,077 | 175,740 → 7,576 | 445 → 22 MB |
| `ls -l` 10,000 | 34 | 4,388 | 3,982 | 243,684 → 81,071 | 476 → 475 MB |
| `pnpm install` reinstall | 1,439 | 5,821 | 2,666 | 215,811 → 47,193 | 405 → 221 MB |
| `ls -R` | 11 | 1,050 | 582 | 42,207 → 9,573 | 68 → 36 MB |
| `tsc -b` | 206 | 1,706 | 563 | 33,570 → 6,777 | 48 → 19 MB |
| `git status` | 131 | 1,342 | 505 | 96,720 → 18,004 | 93 → 28 MB |
| `node` require | 27 | 273 | 127 | 8,229 → 2,020 | 16 → 9 MB |
| first `stat` depth 7 | 1.6 | 16.9 | 10.6 | 612 → 183 | 0.87 → 0.51 MB |
| small Commit | — | 20.3 | 17.8 | 171 → 44 | — |
| `fs.glob` | — | 146 | 24 | 8,223 → 721 | — |

¹ the native steady vitest arm read 4.9 s at load ≈15 (native cold 1.9 s); not resampled.

Reading: #354's transaction-less reads and per-call caches cut statements 3–17×
and transformed the SDK calls. The FUSE walks' **pack bytes barely moved**
(`ls -l` 10k 475 MB, `find` 386 MB): R1 is untouched and is now the top cause of
every walk, `cp`, committed `rm` and `grep -r`. `rm -rf` of a created tree is
unchanged (R3, R6). **First `pnpm install` cold is slower, 12.1 → 17.3 s**, at
load ≈14 and with 10× fewer statements; it is retained as an unexplained
regression candidate (to diagnose from the receipt's per-opcode counters, not by
resampling), while its Commit fell 19.8 → 14.5 s.

### 10.2 Pre-existing failures found at the baseline

`layerfs-daemon` test `mounted_install`:
`retained_descriptors_and_kernel_caches_are_unchanged_by_install` and
`writes_during_a_commit_stay_live_and_reach_the_next_commit_fifty_to_a_directory`
FAIL at `ee7e0fc51` without any change of this lane (rebuilt and run with the
batch-2 file stashed). The test sets mtime-only edits (`touch -d`, lines 442–443)
and expects the Commit and the live view after install to keep them; #360 item 2
(§4.8, owner decision: an mtime-only capture is not a change) publishes the base
mtime instead. The test asserts the pre-#360 contract. It belongs to #360's
proof set (this lane), and is reported to the liaison; it is not adapted inside
a performance batch.

## 11. Owner requirements vs proposed targets

| Item | Status |
| --- | --- |
| #356: `rm -rf` of the D0 tree in about 3 s; flat per-entry cost in small and large folders; no slower than creating the tree; `default_permissions` kept | **owner requirement** (2026-10-18). Not weakened. Predicted miss without D-1 |
| #357: target "set from the RCA with the owner"; reference SPEC §5 (≤1.2× pass, optimize >1.5×); flat per-entry cost | owner reference; numbers to be set |
| #354: byte-identical results; bounded caches; no delta-depth or storage-policy change | owner requirement |
| #360: item 3 only after #354's read-path fix is final; AGENTS §3.9 trade rule | owner requirement |
| #353/#355: no Capacity from counts; nothing growing with history or change size in the lane | owner requirement |
| COST_MODEL §6 budgets (statements per request ≤ 2, walks ≤ 10× native cold, Commit after install ≤ 5 s, …) | **proposed, not approved**; used here only as a reporting yardstick |

## 12. Decisions that need the owner

- **D-1 Grouped overlay commits.** Change: one SQLite transaction spanning several published mutation jobs (savepoint per job, physical COMMIT when idle, after K pages, or before Capture). Constraints: a `NoSpace` at the grouped COMMIT must not undo published jobs, and the rollback journal must stay bounded. This is the only path found toward #356's 3 s. High risk.
- **D-2 Daemon canonical-cache bound for steady walks.** Options: ≈40 MiB declared, with RSS reported; or scan-resistant admission. Decide after batch 1.
- **D-3 Construction Store reads on a reader session**, not the writer admission queue. It changes admission semantics, and touches #354's storage provider and #355's lane.
- **D-4 Where inline maintenance runs.** Options: bounded per job plus drain-when-idle (F-B7), or after the reply.
- **D-5 UpToDate fast path** in `store/commit.rs` (#353-owned).
- **D-6 READDIRPLUS_AUTO** if name-only walks regress.
- **D-7 #354's resumable page tokens** (on hold).
- **D-9 Kernel directory-listing cache (`FOPEN_CACHE_DIR`)** for R15: cached listings are invalidated by the directory's own changes and by install's `Stale::Inode`, but they conflict with READDIRPLUS and with per-handle cookies (a cached partial listing resumes on a new handle with an offset that handle never published). Needs handle-independent cookies first.
- **D-8 Format changes:** a stored child-directory count for O(1) `nlink`, and inline metadata for old rows. Both are storage cost decisions; neither is proposed for now.

## 13. Recommended first implementation batch

Batch 0, then batch 1 (F-A1) and batch 2 (F-B4) in parallel worktrees if their
file sets stay disjoint. F-A1 is the largest single share across walks, rm and
exec. F-B4 is small, self-contained in #359-owned files, and removes steady
ENOENT traffic. Batch 3 follows, then READDIRPLUS on top of it.

## Appendix: open questions and the smallest run that answers each

| ID | Question | Smallest run |
| --- | --- | --- |
| Q-A1 | split of `ls -l`'s ~2.75 s outside SQL | timers around group decode, pack authenticate and object hash; `folder-10000-ls` once |
| Q-A2 | distinct (pack, group) per walk | counter in `Fetch`; same case |
| Q-B1 | per-request kernel/fuser floor | 100k `statfs` loop in one process (STATFS is inline) |
| Q-B3 | share of inode reads paying the orphan probe | counter in `orphan_inode`; flat wide 10k |
| Q-B5 | READDIRPLUS on name-only walks | `find`, `ls -f` on the 10k directory, before vs after |
| Q-B6 | merge install reports added names | unit test on `stale_after_install` |
| Q-C1…C5 | Commit after-construct split; begin split; construct CPU; unmount split; Exec split | F-D3 spans; `pnpm-first`, `small-commit` once each |
| Q-C7 | sustained same mount | new cost case: 10 × (edit + Commit) on one mount |
| Q-B7 | distinct (parent, name) ENOENT misses per run (within-run duplicates) | count unique missing names in the daemon per arm; vitest and `pnpm-first` once |

## 14. Review log

Independent read-only review against `ee7e0fc51` (2026-10-18), 19 findings.

| # | Severity | Finding | Disposition |
| ---: | --- | --- | --- |
| 1 | BLOCKER | `ReadCache` is `!Send` (raw `ZSTD_DCtx`); `file_lengths` has no `*_with` | F-A1 keeps only the `Send` caches across demands; arena per demand; lengths variant added |
| 2 | MAJOR | F-A1 memory is ≈6 MiB ordinary, ≈20 MiB with a singleton | bound corrected; singleton and payload bodies dropped per demand; policy text updated with the change |
| 3 | MAJOR | 1 MiB decode arena zero-filled per demand | added to R1 and as F-A4 |
| 4 | MINOR | R1 numbers (selections vs whole packs; 551 MB BLOB); triggers only on `pack`/`pack_unit` | corrected |
| 5 | MAJOR | in-flight LOOKUP vs merged install | answered from the kernel's parent `i_rwsem` ordering (F-B4); SP from source, no race test |
| 6 | MAJOR | F-B4 benefit scope; no test of added-name invalidation | scope restated; Q-B7 added; batch 2 adds a mount test that a name another Workspace added shows after a merged install |
| 7 | MAJOR | no `FOPEN_CACHE_DIR` | R15 and D-9 added |
| 8 | MAJOR | memory-only FORGET holds only under conditions | conditions (a)/(b), the readers of the −1 row, and the general-case cost stated |
| 9 | MINOR | stale row memory after `detach_orphan` in the same job | rule added to F-B2 |
| 10 | MAJOR | per-frame forget jobs break short holds; fuser exposes `batch_forget` | ≤64 units per job; comment correction noted |
| 11 | MAJOR | F-B7 is D-4 | moved out of batch 3 |
| 12 | MAJOR | F-C1 window unbounded in serial range | bounded by W ≤ 1024 serials and 64 rows; absence only inside the window |
| 13 | MAJOR | F-C2 must read its own writes | stated |
| 14 | MAJOR | F-C4 `Send` and retained memory | retained workspaces dropped; zeroed allocation (F-A4) instead; lazy reservation constraints stated |
| 15 | MAJOR | 15/25 s measurement default | #359's scoped 2-minute-per-case rule cited; over-25 s cases declared |
| 16 | MINOR | spans would change the "before" identity | spans kept out of the baseline |
| 17 | MINOR | arithmetic and wording | corrected (§2 R2, §4.4, §5, §3.6) |
| 18 | MINOR | existing serial pool | F-D2 now asks why attach still writes |
| 19 | MINOR | steady OPENs re-pay Store reads | attribution of vitest steady between ENOENT lookups and OPENs is part of batch 2's after-measurement |
