# Range 030 a1 · contended `fs.rm` SQL work: the counter held other calls' work

> **Status:** Current fix record (#367). Telemetry change in
> `layerfs-persistence` and `layerfs-store-service`; Store format, Commit path
> and gates unchanged.

| | |
| --- | --- |
| Trigger | range-030.md Contended work: `fs.rm` 1 file · contended, SQL VM steps against tree files, exponent 1.573 over 8 ranges (limit 0.05), optimize. r32 Speed: uncontended `fs.rm` p50 18.2 ms per file against 6.4 ms at r31 |
| Issue | #367 |
| Kind | measurement: per-call SQL attribution. No product work changed |
| Binaries | probe `issue367_rm_probe` (Linux, release, pinned image `378b799ef433`, `LIBSQLITE3_FLAGS=-DSQLITE_ENABLE_SQLLOG`): old `61f7b235` (origin/main `e5889c5ee9`) → new, this commit |
| Commits | this commit; regression test `core/crates/layerfs-persistence/tests/thread_work.rs` |
| Recovery | none needed: no attempt reran |

## Root cause

**No one-file `fs.rm` work grows with the tree. The contended counter added
other calls' work to each call.**

A traced call's `sql` is the Store sessions' totals after the call minus before
it (`layerfs-store-service/src/telemetry.rs` `sql`, at `e5889c5ee9`). The writer
session and the reader pool are shared by every call in the SDK process, so a
call that overlaps others also counts their statements. The doc comment said
so. The Contended work gate (`dsh/tools/history/gates.mjs` `contendedWork`)
fits that number against tree files. Its slope therefore follows how many
calls overlapped, which grew over ranges 23–30, not the work of one remove.

Evidence from the recorded P3 traces. One `fs.rm` commits through 4 write
transactions. A window holding exactly those 4 is the call's own work:

| Range | Tree files | Own-window calls | Own-window VM p50 / statements | Overlapped calls | Write commits in window | Overlapped VM p50 / statements |
| --- | --- | --- | --- | --- | --- | --- |
| 20 (p3-main-n) | 1,686 | 70 | 7,831 / 152 | 4 | 8 | 22,136 / 326 |
| 23 (p3-main-r) | 1,913 | 156 | 6,838 / 134 | 43 | 8 | 13,795 / 247 |
| 26 (p3-main-r) | 2,263 | 93 | 7,860 / 143 | 20 | 10 | 26,756 / 480 |
| 28 (p3-main-t) | 2,663 | 124 | 7,776 / 134 | 16 | 7 | 16,402 / 273 |
| 29 (p3-main-t) | 2,752 | 22 | 7,922 / 156 | 17 | 10 | 41,722 / 473 |
| 30 (p3-main-t) | 2,871 | 47 | 7,963 / 152 | 36 | 10 | 28,598 / 465 |
| 32 (p3-main-u) | 2,914 | 31 | 7,808 / 148 | 1 | 8 | 23,930 / 394 |

Own-window work is flat: 7,831 → 7,963 VM steps while tree files grew 1.70×
(exponent 0.03). Overlapped windows hold 7–10 write commits, 2–3 calls' worth,
and their VM steps follow that count.

Other hypotheses checked:

- **Merge onto an advanced head, or in-lane work.** Of 312 traced `fs.rm` calls
  in r28–r32, 2 merged (`merge.lane` 2.1 ms mean, r29); none ran the pre-lane
  `merge`. The fs calls fork their own Branch, so their heads rarely move. In
  the lane: `head.lane` (one Branch row), `validate` (the candidate root's
  root inode) and `publish` (the Commit, lineage and Branch rows), 1.2 ms
  together in the probe. The in-lane merge is capped at `LANE_MERGE_PATHS`
  (`store/commit_merge.rs`). Nothing there reads the tree or history.
- **Full scans:** none in any `fs.rm` class.
- **r31 → r32 time.** The binaries were the same (daemon `27a769a4`, addon
  `0611f3e0`). Own-window SQL was the same (r32 7,808 VM steps). Every phase was
  slower by a similar factor (trace p50: `commit` 4.0 → 10.1 ms, `files.change`
  0.9 → 3.0, `files.bind` 0.4 → 0.7, `construct` 0.8 → 1.6). Disk reads were
  4–20 KiB per call. The rise matches host CPU load, not SQL work. r31 had 18
  calls and r32 had 32.

### Per-statement breakdown (probe, r30 snapshot)

`issue367_rm_probe` opens a clone of the r30 Store in-process, as the SDK does.
It forks a Branch from main and runs `fs.rm` once per path. An SQLLOG profile
hook attributes each Store statement to the thread that ran it, by SQL text.
Uncontended `/LICENSE`: 161 statements, 15,233 VM steps, 4 write commits.

| Statement | Calls |
| --- | --- |
| `SELECT pack_id,domain,digest,length FROM pack WHERE pack_id=?1` (object reads) | 56 |
| `SELECT … FROM json_each(?1) JOIN inode_value …` (inode value ranges) | 21 |
| transaction control (`BEGIN` / `BEGIN IMMEDIATE` / `COMMIT`) | 20 |
| `SELECT commit_id, … FROM "commit"` (history reads) | 7 |
| object_location joins, Save writes (`pack`, `object_location`, `inode_value`, `store_totals`, `store_policy`), publish (`"commit"`, `commit_lineage`, Branch head) | 1–2 each |

Statements in the lane: the Branch-row read (`head.lane`), the root object
reads of `validate`, and publish's inserts. Contended against a second thread
removing files on another Branch, the same call ran 191 statements: the 161
plus a reader connection's open (its pragmas and schema read) and cold
object-location reads.

## Change

Every turn on a Store session's connection now also adds the SQL work it did
to a thread-local total (`backend/sqlite/thread_work.rs`, `attributed`, around
`read_mapped`, `read_immutable` and `run` in `transaction.rs`). Opening a
connection adds its own setup statements there too. The public function
`layerfs_persistence::thread_work()` reads this thread's total.
`SqlSessions::totals` also returns the calling thread's total. The trace's
`sql` gains a third group, `call`: the calling thread's work over the call. An
in-process SDK Store call runs all its Store SQL on its own thread (the
overlay owner's SQL is in the overlay file, not counted here). So `call` is
exactly that call's work, alone or contended. On a solo call, `call` equals
`writer` + `readers` in every counter (probe, six calls below).

`writer` and `readers` are unchanged, so every existing harness sum, probe
and gate reads the same numbers as before. `SqlWork::accumulate` and `since`
replace store-service's private `accumulate`.

Cost: two copies of the 440-byte `SqlWork` and one thread-local add per session turn, about
150–300 turns per one-file call. That is an estimate of tens of microseconds,
not a measured figure; the probe's timings below show no change above noise.

## Proof

- `layerfs-persistence/tests/thread_work.rs`: two threads save on one shared
  writer session. Each thread's total is nonzero. The two totals add up to the
  session's delta in statements, VM steps and write commits. The main thread's
  total stays zero.
- `layerfs-daemon/tests/observed_application.rs`: a traced bind carries
  `sql.call` with all 27 counters (Linux).

## Performance, old vs new

r30 snapshot (`range-030.json`, sha256 `0abb0b08…`), a fresh clone per arm.
Each arm is a fresh process; its first call (`/lefthook.yml`) warms the
object cache. One sample per call. Host 1-min load 10.4 during both arms.
Statements / VM steps / ms.

| Call (r30) | Old: `writer`+`readers` | New: `writer`+`readers` | New: `call` | Old ms | New ms |
| --- | --- | --- | --- | --- | --- |
| `/lefthook.yml` (first) | 288 / 23,052 | 288 / 23,052 | 288 / 23,052 | 29.4 | 21.3 |
| `/README.md` | 198 / 19,236 | 198 / 19,236 | 198 / 19,236 | 14.1 | 14.8 |
| `/LICENSE` | 161 / 15,233 | 161 / 15,233 | 161 / 15,233 | 11.3 | 10.3 |
| `/pytest.ini` | 202 / 14,539 | 202 / 14,539 | 202 / 14,539 | 12.1 | 11.9 |
| `/node_modules/.modules.yaml` | 178 / 19,549 | 178 / 19,549 | 178 / 19,549 | 13.7 | 12.8 |
| `/node_modules/.pnpm/lock.yaml` | 185 / 16,146 | 185 / 16,146 | 185 / 16,146 | 16.1 | 15.8 |
| p50 / p95 (max of 6) | | | | 13.9 / 29.4 | 13.8 / 21.3 |
| `/LICENSE`, contended (other Branch) | 377 / 28,452 | 376 / 28,440 | **191 / 14,533** | 14.9 | 13.8 |

The contended row shows the defect and the fix. The session delta of a
contended call is 377 statements and 28,452 VM steps, about what P3 recorded
at r30 (403 / 27,011). The call's own work is 191 / 14,533, the same as when
it runs alone.

One more contended sample, on the same Branch, so the head moves:

- Old arm: 643 / 61,568 session work, 43.8 ms. It hit `merge.lane`.
- New arm: 467 / 34,130 session work, of which `call` was 256 / 17,073, 16.6 ms.
  It did not hit `merge.lane`.

Which path a call takes depends on timing, so these two are not a matched pair.

Tree scaling, the same paths removed on clones of three snapshots in fresh
processes (session sums equal `call` for solo calls):

| Snapshot | Tree files | Store bytes | `/README.md` | `/LICENSE` | `/pytest.ini` | `.modules.yaml` | `lock.yaml` | Median |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r20 | 1,686 | 392 MB | 131 / 8,964 | 124 / 7,813 | 154 / 11,596 | 282 / 54,863 | 198 / 16,171 | 154 / 11,596 |
| r25 | 2,058 | 658 MB | 156 / 16,417 | 149 / 13,358 | 170 / 11,132 | 307 / 57,802 | 183 / 13,765 | 170 / 13,765 |
| r30 | 2,871 | 843 MB | 198 / 19,236 | 161 / 15,233 | 202 / 14,539 | 178 / 19,549 | 185 / 16,146 | 185 / 16,146 |

Stored bytes: unchanged (no format change).

Counter exponents against tree files:

- **Steady state** (P3 own-window class, r20–r32): VM 0.03.
- **Contended** class as the gate reads it today: 1.573. Read from `call`, it
  would have the steady state's exponent. Not yet shown on a replay.

## Left open

- **The gate still reads `writer` + `readers`.** Pointing
  `steps.mjs sqlCounters` (and the Contended work gate's input) at `sql.call`
  when present changes a gate's input. This commit leaves that to the lead.
  Until then the contended rows keep measuring overlap.
- **Cold-process growth.** In a fresh process the median one-file remove went
  from 154 / 11.6k at r20 to 185 / 16.1k at r30 (VM exponent about 0.6 over
  three one-sample points). The growth is mostly inode-value range reads
  (`/LICENSE`: 7 → 21 calls) and object reads (46 → 56), filling caches that
  the replay's long-lived process already holds. Calls stay at 10–16 ms. Not
  acted on: a small cost, and P3's steady state is flat.
- **Daemon calls.** `call` counts only the request thread. A daemon request
  whose Store work also runs on helper threads reads low in `call`; read
  `writer` + `readers` from a solo call there.
