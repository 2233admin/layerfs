# #359 batch 4 · #356 F-032 · READDIRPLUS: correct, measured slower, parked

| | |
| --- | --- |
| Trigger | #359 RCA cause R2 (`COMMAND_COST_RCA_20261018.md` §2, §6 F-B5) and the #356 takeover: every READDIR'd name is LOOKUP'd again (baseline du-s cold 51,490 lookups, rm-rf-nm 46,722) |
| Playbook step | D0 counts (baseline seq 177–249) → fix → one after-sample per affected case → regression found → follow-up fix → re-sample → parked |
| Kind | code path only (FUSE negotiation and reply). No Store, schema or overlay format change |
| Binaries | baseline daemon `d7ae4806` (`ee7e0fc51`) → batch 4 `8d05b73e` (`be778f1c9`) → follow-up `23f28f5d` (`952388cf9`); addon `44cbdf8f` for both batch 4 builds. All contain #354 `337bf0024` |
| Commits | `be778f1c9` and `952388cf9` on local branch **`issue359-rdp`**, which is not pushed and not on `issue359-impl` |
| Recovery | none: no stored state changes |
| Issue | GitHub `Ephemeral-AI-Lab/layerfs#356`, `#359` |
| Status | **implemented and correct, but slower: not integrated.** `issue359-impl` was reset to `0ba64d8c7`. The test fixes that do not depend on READDIRPLUS were kept as `9fc9de601` |

## What was built

The #356 WIP (`fb1f8a527`, picked as `8b4fcef25`) was finished:

- It negotiates `FUSE_DO_READDIRPLUS` when offered, without `READDIRPLUS_AUTO`.
- A reply fills one 4 KiB page from one READDIR window. The offsets are
  published first, then one owner job decides each name as LOOKUP does and
  takes the lookup reference the reply hands to the kernel.
- Names found gone are omitted, and an all-gone page lists on from the last
  offset. References not sent are given back with FORGET.

Two WIP defects were fixed:

- the negotiation closure's inferred type, which stopped the Linux build;
- an unread stream returned by `accept`.

The follow-up `952388cf9` changes the plus visit. It no longer stops at the
first name whose base facts are not resident. It consumes such names
undecided and reads the facts of all of them in one base demand per reply.

## Proof (correctness)

Pinned image, ≤120 s per command:

- `kernel_custody` 3/3. Listing alone takes exactly LOOKUP's custody, FORGET
  returns it, no READDIR frame is sent, at most one supply per reply.
- `fp2` 3/3, `fp21` 2/2.
- All mounted daemon targets, and the fuse, overlay and store-service crates.

The failures seen are the same set listed for the baseline or are
intermittent; none involves READDIRPLUS. The list is in the batch 4 log,
`~/lfs-history/runs/issue359/batch4/tests-b4.log`:

- mtime-only edits: `mounted_install`, `mounted_commit`, `r5_5`;
- unmount Busy once each in `kernel_mutation` and `mounted_cycles`, both
  passing on their diagnostic run;
- `r5_9`'s NOT_ESTABLISHED precondition;
- `installed_store` and `r5_10` storage counters;
- four `captured_namespace_*` construction tests.

`default_permissions` stays exact: the kernel still checks search permission
on the parent in every path walk, however the dentry was made.

## Performance, baseline vs batch 4 vs follow-up

`cost.mjs case`, one sample per arm, Disposable, `LAYERFS_CONSTRUCTION_WORKERS=1`,
cache state as each case declares it. Host load (1-minute):

- baseline: find 10.4, ls-r 14.1, du-s 6.8, rm-rf-nm 6.4;
- batch 4: 8.2–8.5;
- follow-up: 8.2–9.8, and rm-rf-nm 13.9.

Two non-#359 issue containers ran throughout. Tables:
`~/lfs-history/runs/issue359/table-{baseline,batch4,batch4b}.json`.

| Case / step | Baseline ms | Batch 4 ms | Follow-up ms | Store reader requests (base → follow-up) | Statements | Owner jobs (base → b4 → b4b) |
| --- | ---: | ---: | ---: | --- | --- | --- |
| find / cold | 5,972 | 22,027 | 21,674 | 35,846 → 222,900 | 76,087 → 450,766 | 50,970 → 98,493 → 55,727 |
| find / steady | 5,268 | 20,917 | 21,113 | 36,198 → 224,016 | 75,794 → 452,681 | 50,757 → 98,484 → 55,020 |
| ls-r / cold | 582 | 1,880 | 1,521 | 4,557 → 19,877 | 9,573 → 39,616 | 6,440 → 10,241 → 6,523 |
| ls-r / steady | 277 | 1,503 | 1,561 | 0 → 19,653 | 0 → 38,728 | 5,518 → 10,212 → 6,521 |
| du-s / cold | 22,955 | 19,552 | 20,723 | 219,557 → 222,900 | 443,969 → 450,766 | 139,834 → 98,491 → 55,022 |
| du-s / steady | 4,980 | 19,596 | 20,561 | 36,476 → 224,016 | 77,143 → 452,681 | 50,756 → 98,482 → 55,018 |
| rm-rf-nm / rm-committed | 27,592 | — | 38,915 | 199,262 → 202,799 | 403,405 → 410,493 | 289,727 → — → 218,355 |

LOOKUPs fell to 0 (rm-rf-nm: 1) and READDIR frames to 0 (15,065 READDIRPLUS
frames for the 14,322 READDIRs of find/du-s), as designed. The follow-up
halved the owner jobs, but the time stayed where it was.

## Why it is slower

The daemon pays the per-entry attribute cost on every listing. That cost is
about 5.5 Store reader requests and 11 statements per entry, almost all
immutable-cache misses: 219,620 misses on the 8 MiB cache, with 284,426
evictions in one find sample.

At the baseline, du-s cold pays the same requests (219,557) through LOOKUP.
Name-only walks (find, ls-r) never paid them. Steady walks paid them once:
the kernel kept the LOOKUP answers, so a steady du-s needs 36,476 requests.

With READDIRPLUS the kernel lists again on every walk (no `FOPEN_CACHE_DIR`,
R15), and each listing must carry attributes. So every walk pays the
cold-stat cost, steady ones included. Only a cold stat walk gains (du-s
cold −10%, within noise of the load difference).

rm-rf-nm got slower too, though its follow-up sample ran at load 13.9. The
LOOKUPs it saved do not pay for the attributes now demanded on each of its
re-listings.

Prerequisites before READDIRPLUS can be retried (in this order):

1. Cheap per-entry attributes: the read-path caches that persist across
   requests (F-A1, batch 1, which needs #354's consent on
   `store/read_handle.rs`). The aim is that a listed directory's inode facts
   cost one demand per page and are memory hits on a steady walk.
2. Kernel directory caching (`FOPEN_CACHE_DIR`, owner decision D-9), so a
   steady walk does not list again.
3. Re-measure find, ls-r, du-s, rm-rf-nm and the #356 D0 and flatness probes.
   The #356 target (rm -rf of 40,145 files in about 3 s) is not met by
   batch 4 as it stands.

## New finding: hard links are never entry-cached on the pinned image's kernel

Seen while proving `kernel_custody`, and traced with a private ftrace instance
and kprobes, removed afterwards (`~/lfs-history/runs/issue359/batch4/trace*.sh`).

On `6.12.76-linuxkit` (Docker Desktop's VM kernel, HZ 1000), a non-directory
with more than one link gets dentry time 0 on every LOOKUP reply. Entry TTLs
of 7 s, 60 s and 300 s were sent, and the time stayed 0. Directories and
single-link files get now + TTL. So each path resolution of a hard-linked
file is a FUSE LOOKUP, even while a descriptor holds the dentry.

Vanilla 6.12.76 `fs/fuse/dir.c` and `inode.c` have no such rule, and fuser
0.18 sends the TTL unchanged. The cause is downstream of LayerFS on this
host. It matters for workloads that hard-link heavily (pnpm's
content-addressed store). It is not established on a production Linux host.

## Left open

- READDIRPLUS stays parked on `issue359-rdp` until prerequisites 1–2 hold.
- The hard-link entry-lifetime behaviour: confirm or exclude on a vanilla
  kernel before attributing pnpm costs to it.
