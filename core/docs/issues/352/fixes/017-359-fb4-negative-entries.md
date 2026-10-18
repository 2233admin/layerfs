# #359 batch 2 · F-B4 · a missing name is a negative entry, not `ENOENT`

| | |
| --- | --- |
| Trigger | #359 RCA cause R4 (`COMMAND_COST_RCA_20261018.md` §2, §6 F-B4): the kernel does not cache an `ENOENT` reply, so every probe of a missing name is a FUSE LOOKUP. Baseline vitest: 18,648 of 19,767 lookups missing (cold), 18,626 of 18,627 (steady) |
| Playbook step | D0 counts (baseline ledger seq 177–249) → fix → one after-sample per affected case |
| Kind | code path only (FUSE reply). No Store, schema or overlay format change |
| Binaries | baseline daemon `d7ae4806` (source `ee7e0fc51`) → batch 2 daemon `e720bcad` (source `9a5bd4b5b`); SDK addon `db6d4adb` for both. Both contain #354 `337bf0024` |
| Commits | fix `9a5bd4b5b` on local branch `issue359-impl` (not pushed); regression tests `core/crates/layerfs-daemon/tests/negative_entries.rs` |
| Recovery | none: no stored state changes |
| Issue | GitHub `Ephemeral-AI-Lab/layerfs#359` |
| Status | implemented, verified (focused tests and after-samples), committed locally; not pushed, not integrated |

## Old design

`ReadReply::attributes` (`layerfs-fuse/src/request/reply.rs`, at `ee7e0fc51`)
answered every refusal with `reply.error(refusal(reason))`. For LOOKUP of a
missing name that is `ENOENT`. Linux FUSE does not give an `ENOENT` reply an
entry lifetime, so the next `stat`, `open` or `access` of the same name asks
the daemon again. Module resolution (Node, vitest, TypeScript) and Git probe
the same missing names over and over, so the cost grew with the number of
probes rather than with the number of distinct names. Each re-asked lookup
costs about one owner job and one served request (`ownerJobs`, `served`).

## New design

A LOOKUP refused with `Refusal::Missing` is answered with
`ReplyEntry::entry_with_ttls(attr TTL 0, entry TTL 60 s, node id 0,
generation 0)` (fuser 0.18, no patch). Node id 0 is the FUSE protocol's
negative entry: the kernel keeps a negative dentry for the entry TTL and takes
no lookup reference, so there is no FORGET and no change to reference
accounting. Other refusals and other opcodes still answer the errno as before.
A counter `lookup_missing` records each negative entry served.

Coherence, which needs no new mechanism:

- Every create, mknod, mkdir, symlink, link and rename through the mount
  replies with an entry for the new name, which replaces the negative dentry
  in the kernel (the kernel's own namespace operations instantiate the dentry).
- A name another Workspace added becomes visible through the merged install:
  `control/invalidate.rs` already invalidates every name the install adds or
  changes (`fuse_reverse_inval_entry`), and that covers negative dentries too.
- The 60 s TTL is the same bound every positive entry already has. It bounds
  how long the kernel may answer without asking; it is not what makes the
  answer correct.

Cost: 26 production lines; no memory, storage or schema change. Kernel-side
negative dentries are ordinary dcache entries under the kernel's own
reclamation.

## Proof

`negative_entries.rs` (Linux, in the pinned image, ≤120 s each, both PASS):

- `a_missing_name_is_asked_once_and_every_namespace_change_shows_at_once`:
  200 `stat`s of one missing name, then each change kind that binds a name the
  kernel holds as missing: create, mkdir, nested create, symlink, hard link,
  `mv` to it, rename into the directory, and `rm` then recreate. Each change is
  visible at once. The drain receipt's LOOKUP count is < 60 (with `ENOENT` it is
  ≥ 201).
- `a_name_another_workspace_added_shows_after_the_merged_install`: A caches
  `from-b` as missing; B creates it and commits; A writes its own file and
  commits (`Reply::MergeCommitted`); A then reads `from-b`.

Also run on `9a5bd4b5b`: the layerfs-fuse unit tests and the layerfs-daemon
coherence/invalidation tests in the same image, clippy on the touched crates,
and the boundary guard (19 violations, identical to the baseline).
`mounted_install` fails 2 of 4 tests at the baseline as well. That is a
pre-existing conflict between `touch -d` mtime-only edits and #360 item 2
("an mtime-only edit is not a change"), recorded in RCA §10.2, not caused by
this batch.

## Performance, baseline vs batch 2

`cost.mjs case <case> --binary <id> --label baseline|batch2`, one sample per
arm, Disposable Store, `LAYERFS_CONSTRUCTION_WORKERS=1`, fresh volume per
sample. Tables:
`~/lfs-history/runs/issue359/table-baseline.json` and `table-batch2.json`.
Native ms is the batch 2 sample's own native part. The exception is vitest,
which ran only `--part lfs` in batch 2, so its native time is the baseline's.
Native timing itself moved with load between the series: tsc-b cold went
206 → 599 ms, cp 1,163 → 1,643 ms.

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
minutes" (RCA §10). Command times from the ledger: baseline find 20.4 s, pnpm-first 40.1 s, grep-r 62.8 s, du-s 34.0 s, cp-rm-nm 72.7 s, rm-rf-nm 34.7 s; batch 2 pnpm-first 32.4 s, cp-rm-nm 71.2 s.

**Disclosed breach.** One earlier sample broke the 2-minute rule outright.
Ledger seq 7, the vitest `diagnostic` sample from before the baseline, ran
216.8 s and is recorded `FAILED`. It is in no table of this or any later
record.

Declared interference: baseline samples ran at host load 6.5–17 (vitest,
tsc-b, pnpm-* and node-require at 12.6–17.1). Batch 2 ran at 5.6–8.2. Two non-#359 issue
containers were running throughout both series. Time changes
with unchanged counts are therefore not attributed to this batch.

| Case / step | Native ms | ms base → b2 | LOOKUP | of which missing | Owner jobs | Served requests | Owner wait ms | Owner hold ms | Statements |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| vitest / cold | 1,926 | 5,217 → **2,626** | 19,767 → 1,720 | 18,648 → 601 | 41,827 → 23,714 | 40,015 → 21,971 | 633 → 126 | 881 → 289 | 17,065 → 16,582 |
| vitest / steady | 4,888 | 3,077 → **2,168** | 18,627 → 2 | 18,626 → 1 | 39,607 → 20,540 | 38,623 → 19,604 | 640 → 109 | 741 → 213 | 7,576 → 6,137 |
| git / status-cold | 134 | 505 → 685 | 2,427 → 2,368 | 324 → 265 | 7,125 → 7,066 | 4,538 → 4,479 | 6 → 4 | 150 → 166 | 18,004 → 17,990 |
| git / status-steady | 8 | 151 → 132 | 324 → 1 | 324 → 1 | 3,432 → 3,109 | 2,937 → 2,614 | 10 → 11 | 62 → 58 | 0 → 0 |
| git / add | 8 | 175 → 141 | 298 → 12 | 292 → 6 | 3,412 → 3,126 | 2,914 → 2,628 | 11 → 10 | 66 → 57 | 65 → 65 |
| git / commit | 22 | 54 → 55 | 181 → 102 | 100 → 21 | 880 → 809 | 830 → 759 | 9 → 11 | 14 → 14 | 446 → 446 |
| tsc-b / cold | 599 | 563 → 709 | 597 → 597 | 3 → 3 | 2,494 → 2,494 | 1,753 → 1,753 | 0.1 → 0.1 | 47 → 50 | 6,777 → 6,777 |
| tsc-b / steady | 223 | 274 → 284 | 3 → 0 | 3 → 0 | 1,260 → 1,254 | 1,105 → 1,102 | 0.1 → 0.1 | 20 → 21 | 56 → 32 |
| node-require / cold | 30 | 127 → 179 | 149 → 149 | 0 → 0 | 515 → 515 | 364 → 364 | 0 → 0 | 9 → 10 | 2,020 → 2,020 |
| node-require / steady | 27 | 36 → 37 | 0 → 0 | 0 → 0 | 167 → 167 | 165 → 165 | 0 → 0 | 2 → 2 | 0 → 0 |
| pnpm-reinstall / cold | 1,379 | 2,666 → 3,206 | 4,641 → 4,638 | 187 → 183 | 16,988 → 16,974 | 12,337 → 12,323 | 79 → 97 | 281 → 309 | 47,193 → 47,174 |
| pnpm-reinstall / steady | 563 | 589 → 598 | 219 → 198 | 219 → 198 | 1,550 → 1,529 | 1,252 → 1,231 | 14 → 14 | 29 → 27 | 1,780 → 1,785 |
| pnpm-first / cold | 4,103 | 17,290 → 9,948 | 57,751 → 53,525 | 53,463 → 49,231 | 398,536 → 393,407 | 398,034 → 392,901 | 2,640 → 2,493 | 1,154 → 790 | 3,585 → 3,585 |
| pnpm-first / Commit after install | — | 14,498 → 14,277 | — | — | — | — | — | — | 21 → 21 |
| cp-rm-nm / cp | 1,643 | 53,155 → 50,475 | 93,446 → 93,445 | 46,724 → 46,723 | 615,991 → 616,470 | 563,015 → 563,803 | 1,481 → 1,291 | 5,782 → 5,430 | 471,079 → 471,079 |
| cp-rm-nm / rm-created | 520 | 10,053 → 10,471 | 12,500 → 13,625 | 0 → 0 | 208,793 → 209,918 | 196,552 → 197,677 | 2,058 → 2,202 | 2,154 → 2,284 | 0 → 0 |

Reading:

- **Attributed to this batch:** vitest cold 5.2 → 2.6 s (2.71× → 1.36×
  native) and steady 3.1 → 2.2 s, with missing lookups down 97% / 99.99%,
  owner jobs and served requests nearly halved, and owner wait down 5–6×.
  Repeated Git missing probes fell to one ask per name (status-steady 324 → 1,
  add 292 → 6). These changes are count-driven.
- **Not affected, as predicted:** cases whose missing names are each probed
  once and then created (pnpm-first, cp) or that probe few missing names
  (tsc-b, node-require, pnpm-reinstall). Their counts are unchanged within
  ±8%, so their time changes are host noise, not batch 2. The pnpm-first cold
  "regression" (old `50155780` 12.1 s → baseline 17.3 s) is not confirmed. Its
  baseline sample ran at load 13.6. At load 7.5 with near-equal counts it took
  9.9 s. It stays listed as unexplained until a quiet sample at the final
  identity.
- **Unexplained, small:** cp-rm-nm rm-created has +1,125 lookups of existing
  names (lookupMissing stays 0). No negative entry is involved in that step.
  Kernel dcache eviction under the container's memory limit is the likely
  cause, but it is not established. Recheck it at the final identity.
- Statements, transactions, bytes and storage: unchanged except where fewer
  requests reached the read path (vitest −483 / −1,439 statements, tsc-b steady
  −24). The Store and pack bytes are unchanged; no stored format changed.
- Memory: no daemon-side state was added. The kernel keeps one negative dentry
  per distinct missing name probed, under its own reclamation.

Failed attempt retained: the first batch 2 `vitest --part lfs` invocation
exited 1 in 0 s. It never reached a sample: no ledger start, no output
folder. Its stderr was not kept, so the refusal is unknown. `case.sh` now
keeps stderr in `batch2.stderr`. The case was then run once and completed
(seq 263). This is a setup refusal, not a resampled measured arm.

## Left open

- vitest is still 1.36× native cold. The remaining cost is read-path work per
  request (R1, batch 1 F-A1/F-A4) and directory listing per entry (R2,
  READDIRPLUS, batch 4).
- The 60 s negative TTL equals the positive TTL. A shorter one is not needed for
  correctness (install invalidation covers it) and would cost re-asks.
