# #359 · re-measure on #354 A1 (Workspace reader caches)

| | |
| --- | --- |
| Trigger | #354 delivered F-A1 at its terminal head `1d5dfafae` (liaison 2026-10-18). #359 does not write F-A1; it re-takes the samples A1 affects |
| Kind | merge + measurement only. No #359 product change |
| Commits | merge `9bb2be502` on local branch `issue359-impl` (not pushed): `1d5dfafae` (A1) and `b83871223` (inode-value reads without BEGIN/COMMIT). No conflict; `store/ports.rs` keeps the #356 step-1 lines from `ee7e0fc51` unchanged |
| Binaries | after: daemon `4393a8e4`, addon `6631cef9` (source `9bb2be502`). Before: baseline `d7ae4806` (`ee7e0fc51`), batch 2 `e720bcad`, F-B2 `811e5bca` |
| Production LOC | 98389 → 98433 (+44), all #354 A1 |
| Status | merged and measured locally; not pushed, not integrated |

## Declared cache state (AGENTS §1)

A1 keeps a per-Workspace reader cache of at most 3 MiB (positive rows only),
from the first demand until unmount.

- **cold** arm: the first run in a fresh Workspace on a fresh daemon. The A1
  cache starts empty and fills only from that arm's own demands. The Store
  file stays page-cache resident (declared, not controlled); see the
  correction below.
- **steady** arm: the same Workspace again, as before A1. It inherits the
  kernel caches and up to 3 MiB of A1 cache that the cold arm left. That is
  the declared steady state of every walk case; no setup step touches it.
- The SDK control reader keeps no A1 cache. No SDK case is in this set.

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
minutes" (RCA §10). Command times from the ledger: find 15.4 s, du-s 25.6 s, grep-r 54.1 s, rm-rf-nm 29.7 s, cp-rm-nm 65.7 s, folder-10000-ls 15.2 s.

## Samples

`cost.mjs case <id> --binary 4393a8e4 --label a1`, one command and one sample
per case, ledger seq 283–297. Disposable Store, `LAYERFS_CONSTRUCTION_WORKERS=1`.
Host load (1 min) 5.8–10.9, with two non-#359 issue containers throughout.
Table: `~/lfs-history/runs/issue359/table-a1.json`. vitest ran `--part lfs`,
so its native ms is the baseline's.

| Case / step | Native ms | ms baseline → A1 | Store statements | Pack bytes read (F-B2 → A1) | Reader requests | Owner jobs |
| --- | ---: | --- | --- | --- | --- | --- |
| find / cold | 87 | 5,972 → 3,874 | 76,087 → 39,634 | — → 14.9 MB | 35,846 = | 50,970 = |
| find / steady | 79 | 5,268 → 3,464 | 75,794 → 39,611 | — → 14.1 MB | 36,198 = | 50,757 = |
| ls-r / cold | 10 | 582 → 488 | 9,573 → 5,694 | — → 2.6 MB | 4,557 = | 6,440 = |
| ls-r / steady | 8 | 277 → 436 | 0 → 0 | 0 | 0 = | 5,518 = |
| grep-r / cold | 568 | 34,022 → 27,773 | 528,440 → 264,710 | — → 74 MB | 259,063 = | 267,384 → 273,526 |
| grep-r / steady | 555 | 22,629 → 19,876 | 459,385 → 264,203 | — → 62 MB | 240,960 → 265,577 | 218,197 → 257,462 |
| du-s / cold | 113 | 22,955 → 16,016 | 443,969 → 231,096 | — → 46 MB | 219,557 = | 139,834 = |
| du-s / steady | 116 | 4,980 → 3,970 | 77,143 → 40,153 | — → 14.1 MB | 36,476 = | 50,756 = |
| cp-rm-nm / cp | 1,489 | 53,155 → 46,090 | 471,079 → 226,271 | 2,388 MB → 53 MB | 237,977 = | 615,991 → 621,871 |
| cp-rm-nm / rm-created | 516 | 10,053 → 12,026 | 0 → 0 | 0 | 0 | 208,793 → 215,350 |
| rm-rf-nm / rm-committed | 499 | 27,592 → 23,566 | 403,405 → 206,621 | 2,362 MB → 38 MB | 199,262 = | 289,727 = |
| folder-10000-ls (`ls -l`) / cold | 42 | 3,982 → 2,500 | 81,071 → 40,544 | — → 1.2 MB | 40,234 = | 20,321 = |
| folder-10000-ls / steady | 40 | 117 → 111 | 582 → 237 | 0 | 129 = | 320 = |
| vitest / cold | 1,926 | 5,217 → 2,717 (b2 2,626) | 17,065 → 10,861 | 52 MB (b2) → 7.3 MB | 7,997 → 7,711 | 41,827 → 23,716 |
| vitest / steady | 4,888 | 3,077 → 3,146 (b2 2,168) | 7,576 → 4,108 | 19 MB (b2) → 2.3 MB | 3,528 → 3,072 | 39,607 → 20,553 |

`=` means unchanged. Store transactions on the read path fell to 0 in every
case (`b83871223`; rm-rf-nm 2,850 → 0).

## Reading

- **Attributed to A1 (count-driven):**
  - Store statements per reader request fell about 2 → 1.1.
  - Pack bytes read fell 40–60× where a sample before A1 exists (rm-rf-nm
    2.36 GB → 38 MB, cp 2.39 GB → 53 MB).
  - Wall time (warm-Store diagnostic) fell in every name and stat walk: find −35%, du-s cold −30%,
    `ls -l` of 10,000 entries −37%, rm-rf-nm −15%.
- **Not changed by A1:** reader requests, owner jobs, LOOKUPs and the
  immutable-cache misses (rm-rf-nm 196,641 both). The per-entry cost is still
  about 5 Store reader requests, each now about one statement. find cold is
  still 45× native, du-s cold 140×.
- **Not attributed:**
  - vitest steady 2,168 → 3,146 ms (against batch 2), with equal counts and
    owner wait 109 → 221 ms;
  - ls-r steady 277 → 436 ms;
  - rm-created 10,471 → 12,026 ms.

  None of these has a count change that explains it. They stay open for the
  final-identity sample.
- **Unexplained count change:** grep-r steady LOOKUPs 999 → 11,468, and
  rm-created LOOKUPs 13,625 → 18,196. These are lookups of existing names, so
  kernel dentries were dropped between or within steps. A1 adds about 3 MiB of
  daemon memory and no kernel-side state. Dentry eviction under the
  container's memory limit is the likely cause, but it is not established.

## Consequence for READDIRPLUS (batch 4 prerequisite 1)

A1 makes each reader request cheaper, but it does not remove any. READDIRPLUS
fetched attributes for every listed entry on every listing: about 5.5 reader
requests per entry, 222,900 per find. After A1 that is still about 222,900
requests at roughly 1.1 statements each, against find's 35,846.

So prerequisite 1 ("a listed directory's facts cost one demand per page")
is only partly met. The retry needs D-9 (`FOPEN_CACHE_DIR`, so a steady walk
does not list again) and is measured as it stands.

## Left open

- The per-entry reader-request count. Fixing it is F-A2/F-A3 territory (an
  inode-facts window per directory page); #354 declined F-A3, so it is #359's
  to propose.
- The 3 MiB A1 bound is per Workspace: N mounted Workspaces use up to
  N × 3 MiB.
