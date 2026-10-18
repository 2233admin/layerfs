# #359 · `rm -rf` per-entry cost breakdown on A1 (analysis, no change)

| | |
| --- | --- |
| Trigger | Liaison 2026-10-18: `rm -rf` is the owner's top concern. A per-entry breakdown after A1, for both rm-committed and rm-created, comes before the combined prototype experiment (D-1, orphan rows only while kernel-referenced, F-B3, D-4, no avoidable facts reads on unlink) |
| Kind | analysis of retained receipts only. Nothing built or run for this record |
| Samples | A1 daemon `4393a8e4` (source `9bb2be502`), one sample each: `s291-rm-rf-nm-a1` (rm-committed) and `s293-cp-rm-nm-a1` step `rm-created`. Receipts: `daemon.jsonl` status records `lfs.<step>.before/after` and `trace.jsonl` `daemon[].fuse.ns` / `.fuse.phases`, as after − before |
| Cache state | as declared by `cost.mjs`: a fresh daemon and Workspace, with the Store page-cache resident (declared, not controlled). Wall times are warm-Store diagnostics (AGENTS §1); counts are exact |
| Budget | rm-rf-nm 29.7 s and cp-rm-nm 65.7 s, under the #359 scoped exception, "each case runs in its own command, under 2 minutes" (RCA §10) |
| Status | analysis complete. **Finding: the ~3 s target cannot be reached by daemon-side work alone at the current request mix** (§5) |

`M` means a measured receipt field, or exact arithmetic on fields. `E` means
an estimate from source or attribution. "µs/e" means microseconds per removed
entry.

## 1. Tree and request counts (M)

The receipts give 46,722 removed entries: 40,713 UNLINK and 6,009 RMDIR,
counting the root. The 40,145 files and 6,182 directories quoted for #356
are not this tree. Every per-entry figure here divides by 46,722.

| Requests per entry | rm-committed | rm-created |
| --- | ---: | ---: |
| LOOKUP | 1.000 | 0.389 |
| GETATTR | 1.014 | 1.014 |
| UNLINK + RMDIR | 1.000 | 1.000 |
| OPENDIR / READDIR | 0.267 / 0.391 | same |
| **Synchronous requests** | **3.672** (171,557) | **3.061** (143,030) |
| RELEASEDIR (async) | 0.267 | 0.267 |
| FORGET units (async); frames; batched frames | 46,722; 46,720; 2 | 47,584; 46,737; 23 |
| All requests | 4.939 (230,775) | 4.347 (203,110) |

## 2. Where the wall time goes (M unless marked)

`rm` is single-threaded, so synchronous callbacks do not overlap. FORGET and
RELEASEDIR run on the second receive loop, off the critical path, but they
take the Workspace lock. In both samples, wall time equals the sum of the
synchronous callbacks plus the time outside the daemon, exactly.

| Component | committed µs/e | created µs/e |
| --- | ---: | ---: |
| Outside daemon callbacks: kernel/VM transit plus `rm` itself | **150.5** | **119.8** |
| LOOKUP callbacks | **196.5** | 11.4 |
|   of which base facts read (`read_supply`) | 138.7 | 0 |
|   of which owner read visits (≈2 per LOOKUP, E) | ≈50.4 | — |
| UNLINK + RMDIR callbacks | **84.1** | **52.7** |
|   of which mutation job hold | 64.8 | 30.5 |
|   of which mutation lock wait | 0.9 | 4.0 |
| GETATTR callbacks | 40.4 | 54.7 |
| READDIR callbacks | 25.1 | 13.9 |
| OPENDIR callbacks | 7.9 | 5.0 |
| **Total = wall** | **504.4** (23,566 ms) | **257.4** (12,026 ms) |
| *Off the critical path:* FORGET | 31.6 | 59.5 |
| *Off the critical path:* RELEASEDIR | 15.1 | 16.3 |

Every synchronous callback also costs about 10.6 µs outside any owner phase:
name copy, permit, future and reply write. That totals 1,835 ms (committed)
and 1,496 ms (created).

## 3. The parts that the planned prototypes touch

**Overlay SQL** is in `daemon.jsonl` (`sql_foreground` /
`sql_maintenance`). `cost.mjs` does not copy it into `sample.json`; that is
the counter record 019 asked for.

| | committed | created |
| --- | --- | --- |
| Foreground statements per entry | 26.1 (67.5 µs/e) | 23.3 (73.8 µs/e) |
| Transactions per entry | 2: one mutation job plus one FORGET job per orphan | 2 |
| COMMIT cost | 7.46 µs each | 7.54 µs each |
| Maintenance | 1.94 statements/e, 3.0 µs/e | 3.32 statements/e, 10.4 µs/e (304 MB of payload cells) |

- **UNLINK/RMDIR job:** 10 statements and 1 transaction, about 29 µs of SQL
  (E, from source, reconciled with the totals):
  - parent INODE_LOOKUP twice. The fence row is not kept while orphans
    exist; this is F-B2's visit-fence half;
  - NAME_LAYERS and the target INODE_LOOKUP;
  - BEGIN;
  - the target row, the parent row, and the dirent whiteout or drop;
  - the orphan INSERT at generation −1;
  - COMMIT.

  The committed job holds the lock 64.8 µs. That leaves about 35 µs not
  explained by SQL. The likely home is base-fact evaluation inside the
  hold, but that is not proven and needs a profile.
- **Every removed entry becomes an orphan**, because the kernel lookup still
  holds it. Each orphan costs:
  - a −1-domain INSERT on the critical path;
  - a separate 10-statement FORGET transaction off the path;
  - the extra fence read above.
- **FORGET:** one owner job per unit. fuser 0.18 delivers BATCH_FORGET as
  repeated `forget` calls, but rm-committed sent only 2 batched frames out of
  46,720. So batching (F-B3) saves little here unless the kernel batches
  more; rm-created had 23 batched frames covering about 870 units.
- **Inline maintenance** runs after the job's lock is released, one turn per
  hold. On the synchronous path it is at most 6.8–7.0 µs/e.
- **General-class lock wait** is at most 35 µs/e (committed) or 53 µs/e
  (created). It is shared with the async FORGET/RELEASEDIR loop, and the
  telemetry cannot split it between the two.

## 4. Floors

- **Native:** 499 ms / 46,722 = **10.7 µs/e** (committed tree), 11.0 µs/e
  (created).
- **Transit per synchronous round trip** (the time outside the daemon,
  divided by the synchronous requests, minus the native share):

  | Sample | Transit |
  | --- | ---: |
  | rm-committed | 38.1 µs |
  | rm-created | 35.5 µs |
  | find steady (s283) | 37.6 µs |
  | du-s steady (s287) | 40.0 µs |

  It is about constant across very different daemon work. The cheapest
  complete trip, STATFS with no owner job, adds 5.75–6.8 µs. So a minimal
  round trip is about 44 µs on this host (Docker Desktop, `6.12.76-linuxkit`).
  "Outside" also includes fuser's read and parse before the timed callback,
  and any wait for a free receive loop. Neither is measured separately.
- **Round-trip floor at the current request mix (E):**
  - committed: 3.672 × 38.1 + 10.7 = 150.5 µs/e = **7.0 s**;
  - created: 3.061 × 35.5 + 11.0 = 119.8 µs/e = **5.6 s**.

  That is the wall time if every daemon callback took zero time.
- The ~2.6 s round-trip floor quoted for #356 is not supported by these
  receipts at this mix. 2.6 s would be 15 µs per synchronous request.

## 5. Finding: the target needs fewer synchronous requests per entry

The ~3 s target is 64 µs/e on this tree (75 µs/e on #356's 40,145 basis).
At 38 µs per trip, that leaves room for **about 1.4 synchronous requests per
entry** (1.7 on the 40,145 basis). Today's mix is 3.67 (committed) and 3.06
(created).

So D-1, orphan rows only while kernel-referenced, F-B3, D-4 and the unlink
facts reads can at best move rm-committed from 23.6 s toward its 7.0 s
round-trip floor. None of them can reach ~3 s on this host. Those prototypes
are still worth measuring, because the daemon is 70% of rm-committed's wall
time. But the target also needs request removal:

| Request per entry | Count | What removes it | Status |
| --- | ---: | --- | --- |
| LOOKUP (committed only) | 1.0 | entries delivered with the listing (READDIRPLUS) or `READDIRPLUS_AUTO` | READDIRPLUS always-on was rejected (record 021); `READDIRPLUS_AUTO` is S8-forbidden, an owner decision |
| GETATTR of the parent after each unlink | 1.014 | the kernel invalidates the parent's attributes on every namespace change, and `default_permissions` (kept, #356) revalidates them for the next `may_delete` | inferred; kernel source not checked. No route found that keeps `default_permissions` without this GETATTR |
| OPENDIR + READDIR | 0.66 | larger listing windows (2.1 OPENDIR and 3.0 READDIR per directory today) | possible within the current contract |
| UNLINK / RMDIR | 1.0 | — | the floor |

Removing LOOKUP alone gives a floor of (2.67 × 38.1 + 10.7) = 112 µs/e =
5.2 s. Removing LOOKUP and the GETATTR as well gives (1.66 × 38.1 + 10.7)
= 74 µs/e = 3.5 s. Both figures assume zero daemon time.

On a host with a lower FUSE round trip (no VM), the same mix has a lower
floor. The 38 µs transit is a property of this Docker Desktop VM and is not
established elsewhere.

## 6. Open (needs a counter or a profile)

- Which jobs pay the general lock wait (no per-phase wait figure).
- Why 3,686 orphans (7.9%) went through the maintenance queue.
- Why 18,196 cp dentries needed a new LOOKUP in rm-created (record 020).
- The ≈35 µs of non-SQL hold in the committed unlink job.
- Whether the 38 µs transit is the VM alone or includes fuser read/dispatch
  and receive-loop availability.
- The kernel rule behind the GETATTR per unlink (`fuse_dir_changed`
  invalidation plus `default_permissions`), checked against the 6.12
  source.
