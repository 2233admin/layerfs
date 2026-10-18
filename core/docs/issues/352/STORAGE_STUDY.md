# #352 — Storage study: anatomy, forecast by phase, defects and big wins

> **Status:** Current reference, owner direction 2026-10-18. A supporting
> document for the lead, the fixer and the builder: it says what the Store is
> made of, what each part should cost per range, how to tell a defect from
> normal growth, and where large savings are. **It is not a gate** and changes
> no threshold; gates stay in SPEC §5 and gates.mjs. Every number is labeled
> **[E]** measured (snapshots, traces, git, plan) or **[I]** inferred or
> estimated. Forecasts are bands: **lower / expected / upper** for the current
> design, plus a **design target** (what the design could reach if the big wins
> in §6 land). The lead decides whether the design target is achievable and
> worth its cost. Recalibrate at each phase end (§8) by appending a dated
> section; never rewrite earlier forecasts.
>
> Method: four read-only studies on 2026-10-18 (A workload, B Store anatomy,
> C `node_modules`, D optimization), synthesized and cross-checked by the
> owner's liaison. Evidence and scripts: `~/lfs-history/evidence/storage-study-20261018/`
> (A, B, C, D, `synthesis/forecast.py`). Pinned inputs: daemon `58a60046`
> (snapshot 011, line `p2-main-c`), plan v2 (seed 352), `~/lfs-history/dsh.git`,
> snapshots 000–011, metrics 000–011, P1's Init with `node_modules`
> (RESULTS.md), the 195 distinct lockfiles under `~/lfs-history/fetch/`.

## 1. Summary

- **The Store grows by a nearly fixed amount per LayerFS Commit:** 3.9–5.1 KB
  through range 11 [E]. A per-Commit model fitted on ranges 0–7 predicts the
  range 9 and 11 files within −0.2% and −1.8% [E]. A model driven by changed
  bytes misses content by 17–19% [E]. So **Commits, not bytes, drive storage**,
  and LayerFS makes about 11 Commits per git commit (each SDK `fs.write` is one).
- **About a third of today's Store is overhead from two design details** [E, two
  independent studies agree]: unused reserved space inside every pack (~15%),
  and file modification times stored as complete file objects (~16–19%).
- **The forecast at range 201 is 3.37 GiB expected (2.38–5.31)** [I], not the
  47.8 GiB the report prints: that number is the disk guard's 256 MiB-per-range
  safety floor (§9).
- **The biggest forecast risk is a step at P3** [I]: once `node_modules` adds
  ~47k inodes, every small Commit rewrites a full inode-table branch, so the
  per-Commit cost should jump from ~5 KB to ~9 KB. Three kind-1 changes (§6)
  would bring it to ~3.4 KB and the range-201 Store to **~1.95 GiB (−42%)**.

## 2. Anatomy at range 11 [E]

Sealed snapshot 011: 34,406,400 bytes (32.81 MiB), 8,400 pages of 4 KiB,
7,825 Commits, latest version 7.7 MiB (tracked only). Parts per REPORT_FORMAT
§9 (they sum to the file exactly):

| Part | MiB | × latest version | Share | What it is |
| --- | --- | --- | --- | --- |
| Content | 8.50 | 1.10× | 25.9% | Payload packs: whole-file lane 5.92 MB (records 5.27 + framing 0.05 + reserved 0.60), chunk lane 2.99 MB (records 0.74, **reserved 2.19**) |
| Metadata | 10.42 | 1.35× | 31.7% | Metadata packs: zstd groups 8.73 MB (11.60 MB decoded) + **reserved 2.19 MB** |
| Index rows | 7.55 | 0.98× | 23.0% | `object_location` 3.46 MB (70,528 rows, 49 B), `commit` 2.02 MB (258 B/row), `commit_identity` 0.44, `inode_value` 1.81 (21,750 rows, 83 B), others 0.17 |
| Waste | 6.30 | 0.82× | 19.2% | Unused in pack pages 4.32 MB (17.0%), pack row overhead 0.92 (41 B/row), page structure 0.28, unused in other tables 1.08 |
| Other | 0.04 | 0.01× | 0.1% | 11 pointer-map pages (incremental auto-vacuum) |
| **Total** | **32.81** | **4.26×** | | |

Content detail [E]: whole-file records are 88% deltas, each about 4.4% of the
file's canonical size (full records at 34%, zstd level 3). Of 8,271 "chunks",
8,015 are 12-byte modification times; only ~256 are real file chunks. Two facts
explain most of the overhead:

1. **Reserved directory space in every pack** (`layerfs-storage/src/pack/layout.rs`):
   each pack reserves 16 slots (280 B; 88 B for whole-file packs), but every
   Save seals its own packs, so 22,415 packs hold 22,417 groups and the
   reservation is stored as zeros: **4.98 MB, 14.5% of the file.**
2. **Mode and mtime stored as files** (`layerfs-content/src/filesystem/attributes/portable.rs`,
   `value.rs`): each changed inode's 12-byte mtime becomes a Chunk, an
   ExtentLeaf and a FileState under an attribute leaf, plus its own chunk pack
   (305 B, of which 280 B reserved). With their index rows, metadata and page
   waste this is **~16.5–19% of the Store** (D simulated 16.5%; B estimated 19%).

A third detail grows with the namespace: **the inode-table root branch is
rewritten in full every Commit** (40 B per child, `format.rs:46`), 0.58 B per
live inode canonical, ~0.53 B per live inode stored per Commit; 45% of metadata
growth at range 11 (N = 1,386 inodes).

Metrics-field caution [E]: `storage.metadata` in the metrics JSON is the file
size minus payload bytes, not the metadata domain. Use the parts above.

## 3. Cost model

### 3a. Per LayerFS Commit (fitted on snapshots 000–011) [E]

| Interval | Store B per Commit | Content | Metadata | Index rows | Waste | Objects | Packs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0→1 | 4,081 | 1,403 | 1,122 | 889 | 659 | 8.6 | 2.89 |
| 4→5 | 4,424 | 1,242 | 1,345 | 1,004 | 827 | 9.0 | 2.93 |
| 7→9 | 4,605 | 1,142 | 1,555 | 1,020 | 882 | 9.6 | 2.92 |
| 9→11 | 5,121 | 1,278 | 1,652 | 1,037 | 1,150 | 9.4 | 2.89 |

Model [I, back-tested]:

```
ΔStore ≈ ΔCommits × ( Content 1.2 KB
                    + Metadata (0.9 KB + 0.53 B × N_live_inodes, while the root branch is one level)
                    + Index rows 1.0 KB
                    + Waste (0.55 + 0.25 × metadata-pack KB) KB )
        + installs (§3c) + build output (§3d) + 4 KiB per 819 pages
```

Back-test (fit ≤ range 7, predict 9 and 11) [E]: file −0.2% / −1.8%; worst part
waste −3.6% (unused space per page grows with row size).

Why not depth [E]: inodes are addressed by serial, so a content edit rewrites
the inode leaf (a ~70–90 B pooled delta), the root branch, the filesystem root,
the attribute leaf and the mtime triple, but no directory leaf unless a name is
added or removed (0.1–0.6 per Commit). Fit over 4,266 `fs.write` Commits:
metadata ≈ 1,070 + 1.2·depth B. Depth is not a driver; breadth (directories
touched per git commit, 9.3 in P2a to 16.3 in P5c, A) matters only through the
number of Commits.

### 3b. After the first install (P3 on) [I]

With ~47k `node_modules` inodes added at range 15 (C), the inode table needs a
two-level branch (one level holds ~12.7k inodes). A tracked-file Commit then
rewrites the root plus one full child branch (up to 127 × 40 B), about
**+2.5 / 4.0 / 6.0 KB** stored per Commit (lower / expected / upper) instead of
~0.7 KB, and waste rises with pack size (~1.8 KB). Per-Commit cost:
**6.5 / 9.0 / 12.4 KB** after range 15 versus 5.2 KB at range 11. This is the
largest single forecast assumption; the P3 development run measures it (§8).

### 3c. `node_modules` installs (C) [E/I]

- 195 distinct lockfiles; ~180 installs from range 15 to 201; clean installs at
  50, 100, 151, 201 (A, C).
- **First install (range 15):** 416.7 MB raw, 37.8k files, 47.2k new paths;
  stored ~152 MiB (136–172) = 0.38 of raw (P1 measured 0.359) [I from E].
- New content stores at 0.30–0.33 of raw (measured with zstd-3 on the fetched
  trees); a new version of a known package has 68% of its small-file bytes at
  the same path, 0.067 of raw as a delta if the similarity index finds the old
  file (assumed 60%, range 0–100%) [E/I]. Large binaries share almost no chunks.
- **Metadata:** ~0.55 KB per new path (0.35–0.80); a clean install re-creates
  every path (69k–99k) at ~0.45 KB: ~30–43 MiB each, content near zero [I].
- **Uncertainty:** four large binary packages without readable sizes
  (claude-agent-sdk linux-arm64, codex linux-arm64, libreoffice-kit-wasm,
  cua-driver) are 193 / 397 / 760 MiB of content; their real sizes from the
  pnpm store index halve the band. A relink risk (pnpm relinking unchanged
  importers every install) adds ~316 MiB and is in the upper band only.

| Band | Installs | Raw added | Stored MiB (lower / expected / upper) |
| --- | --- | --- | --- |
| P3 15–29 | 15 | 716 MB | 229 / 255 / 297 |
| P4 30–50 | 19 | 37 MB | 28 / 45 / 93 |
| P5a 51–100 | 47 | 483 MB | 130 / 199 / 366 |
| P5b 101–150 | 50 | 937 MB | 176 / 290 / 550 |
| P5c 151–201 | 49 | 926 MB | 236 / 370 / 786 |
| **All** | 180 | | **799 / 1,159 / 2,092** |

(Upper includes the relink risk. SPEC §7 estimated ~2.5 GiB for installs; this
is lower because the replay builds no desktop/Electron install.)

### 3d. Build output (`tsc -b`) [I, low confidence]

Not studied directly. Packages changed per range grow from 30 (P2a) to 114–119
(P5b/c) (A). Assumed: output bytes changed ≈ net tracked bytes changed, stored
at ~0.08 (delta against the previous output at the same path): ~120 MiB total
expected (×0.4 lower, ×3 upper). The first P3 build replaces this.

## 4. Workload by phase (A) [E, Commits predicted]

| Band | Ranges | git commits (non-merge) | LayerFS Commits | Gross bytes written | Head at band end (tracked) | Installs (clean) | Large-file share of bytes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P2b | 12–14 | 193 | 2,762 | 46 MB | 1,261 files / 10.3 MB | 3 (0) | 15% |
| P3 | 15–29 | 1,043 | 16,523 | 245 MB | 2,752 / 18.7 MB | 15 (0) | 31% |
| P4 | 30–50 | 1,367 | 21,080 | 311 MB | 4,795 / 27.7 MB | 19 (1) | 31% |
| P5a | 51–100 | 3,343 | 59,579 | 912 MB | 7,421 / 47.8 MB | 48 (1) | 31% |
| P5b | 101–150 | 3,477 | 71,960 | 1,340 MB | 11,451 / 94.4 MB | 50 (0) | 45% |
| P5c | 151–201 | 3,554 | 69,012 | 1,681 MB | 16,297 / 133.2 MB | 50 (2) | 51% |

- LayerFS Commits come from the plan's `lfsCommits` (observed = plan − 2 in every
  P2 range, error 0.08%) plus 2 per range from P3 for the build and test
  one-shot Workspaces [I]. Total for ranges 12–201: ~240,900.
- Largest single ranges: 98 (6,187 Commits), 112 (4,503), 129 (4,230).
- `pnpm-lock.yaml` is written ~6–7 times per range and grows from 169 KB to
  1.09 MB (0.90 GB of writes in total, CDC path). From range ~136,
  `*.schema.json` files of 0.4–1.4 MB arrive as near-copies (P5b's jump).
- Per-range CSV: `A/per-range.csv`.

## 5. Forecast by phase [I]

Computed by `synthesis/forecast.py` from §3 and §4, starting from the sealed
range-11 file (32.81 MiB). Head = tracked + `node_modules` (C's model; ±25%
after range 100). Store in MiB unless stated.

| Checkpoint | Head (tracked + nm) | Store lower | **Store expected** | Store upper | **Design target** (§6 items 1–3 from range 15) | Space amplification expected (lower–upper) |
| --- | --- | --- | --- | --- | --- | --- |
| r014 (end P2) | 9.8 | 45.9 | **46.8** | 48.7 | 46.8 | 4.77× (4.67–4.96) |
| r029 (end P3) | 647 | 383 | **453** | 562 | 339 | 0.70× (0.59–0.87) |
| r050 (end P4) | 685 | 548 | **691** | 935 | 438 | 1.01× (0.80–1.37) |
| r100 | 770 | 1,074 | **1,445** | 2,110 | 842 | 1.88× (1.39–2.74) |
| r150 | 1,015 | 1,731 | **2,414** | 3,659 | 1,402 | 2.38× (1.71–3.61) |
| r201 (end) | 1,653 | 2,439 (2.38 GiB) | **3,451 (3.37 GiB)** | 5,438 (5.31 GiB) | 1,994 (1.95 GiB) | 2.09× (1.48–3.29) |

Where range 201's expected 3.37 GiB comes from [I]: per-Commit growth 2,170 MiB
(63%), installs 1,159 MiB (34%), build output 120 MiB (3%).

**Per source** (REPORT_FORMAT §3c) [I]: `node_modules` should sit near
0.35–0.7× its own head; tracked files carry the per-Commit cost, so the tracked
amplification keeps rising (≈ 4.8× at r014, roughly 10× or more by r201 under
the current design), because the head stays small while ~240k Commits each
write ~9 KB. A rising tracked ratio is expected; a per-Commit cost outside §7's
ranges is not.

## 6. Big optimization opportunities (D, simulated on snapshot data) [E]

Each row is measured on top of the rows above it, at range 11.

| # | Change | Saving at r011 | r004 / r007 | REBUILD kind | Speed effect | Code |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Size each pack's directory to its group count** (no 16-slot reservation in sealed packs) | **−4.87 MiB, 14.8%** | 15.7% / 15.0% | 1 | none (fewer bytes) | `layerfs-storage/src/pack/layout.rs` (new version), `pack/assemble.rs`, `save/seal.rs`, `encoding/full.rs`, persistence `unit_layout.rs`; ~100 lines |
| 2 | **Store mode and mtime in the inode value** (16 B) instead of as file objects | **−5.40 MiB, 16.5%** (+~0.3 MiB `inode_value`) | 17.2% / 17.1% | 1 by format; **a Content grammar change** | faster: ~4 fewer objects per changed file; stat stops walking 4 objects | `layerfs-content/src/filesystem/attributes/{portable,value,codec,read}.rs`, `object/inode_leaf.rs`; readers accept both |
| 2a | (alternative to 2) values ≤ 16 B inline in the attribute leaf | −4.03 MiB, 12.3% | 12.8% / 12.9% | 1, Content grammar | faster | same files |
| 3 | **Delta-encode inode branches** (full every Commit today) | −3.10 MiB, 9.5% (≈8.5% with cap 8); **grows with inode count; the main P3 item (§3b)** | 6.3% / 7.7% | 1 | medium: lookups may decode a short chain (watch with the 007.a1 chain-cost item) | `encoding/delta/select.rs:327-345`, `save/pooled.rs`, `encoding/pool/delta.rs`, readers `delta/record.rs`, `pool/read.rs` |
| 4 | Shared 16 KiB zstd dictionary for metadata groups | −1.14 MiB, 3.5% after 1+2a+3 (9.1% after 1 alone) | — | 2 | low | codec |

Items 1–3 together: **32.8 → ~19.2 MiB at range 11 (−41%)** [E]; with
`node_modules` (P3 on), items 2 and 3 matter more: a clean reinstall of an
unchanged lockfile costs ~12.5 MiB of metadata today (~79% of it the mtime
machinery) and ~2.5–3 MiB with item 2; item 3 removes the ~4 KB-per-Commit step
of §3b [I].

Below 10% (not worth prioritizing for storage) [E/I]: merging a Save's three
packs (−0.1 MiB after 1–3), metadata zstd level 19 (1.6%), whole-file level 19
(0.4%), F-005 chunk compaction (<0.6 MiB; only ~256 real chunks), shorter
`object_location` key (~4%), compact commit row (~2.7%), inode-leaf delta cap
16 (~1.2%), whole-file delta budget (<0.4 MiB). Page waste has no direct cure
at a fixed 4 KiB page: it falls only with fewer, smaller rows (4.09 → 2.73 MiB
after item 1, 1.44 MiB after 1–3).

The remaining lever is outside storage: ~11 Commits per git commit, each still
~1.8 KB fixed after items 1–3. It is workload, not a defect.

**Owner decision, 2026-10-18: one Commit per file stays.** The replay is a
load test, so each `fs.write` in a step remains its own LayerFS Commit (SPEC
§2, inner cycle). A liaison check measured what this costs against one Commit
per tool-call step: at ranges 9–11, 1,873 Commits against 418 (77.7% extra)
[E]; across the plan, ~249k against ~26k [E]; storage about 32% of the
range-11 Store and ~0.4–1.7 GB at range 201 [I] (evidence
`scratchpad/commit-model/A`, liaison session). The forecast in §5 keeps the
per-file count. A product that commits once per tool call would store less
than this forecast; do not read the replay's per-Commit totals as the
per-tool-call product cost.

**Owner decisions these need:** item 2 reverses the recorded note in
`attributes/value.rs` that no metadata-specific file format is introduced, so it
is the owner's call. Items 1 and 3 are kind 1 and have no correctness effect on
old data. REBUILD.md §3: decide before P3 if at all, and batch, so the run
never rebuilds for them; kind 1 means none of them needs a rebuild.

**Owner decision, 2026-10-18:** item 2 is **approved**: mode and mtime are
stored in the inode value. It changes the Content grammar, and readers accept
both forms (old attribute-as-file objects and the new inline values), so old
Stores open unchanged (kind 1, no rebuild). The fixer replaces the note in
`attributes/value.rs` with this decision. Items 1, 2 and 3 are **batched** and
land before P3, after F-020 and F-025's fixes; each keeps its own commit,
compatibility test and old-vs-new table, and item 3 keeps the lead's speed
condition (RESULTS.md).

Implementation spec: [STORAGE_BATCH_SPEC.md](STORAGE_BATCH_SPEC.md) (fix F-027).

## 7. Defect signatures

"If a measure leaves its normal range, suspect the cause, check the first
place." Normal ranges are from snapshots 000–011 [E]; post-install ranges are
[I] until P3 measures them.

| Measure | Normal | Alarm | Suspect | Check first |
| --- | --- | --- | --- | --- |
| Store bytes per Commit, before range 15 | 3.9–5.1 KB | > 6 KB while N ≤ 2,000 | a new per-Commit write | parts per Commit (§3a) |
| Store bytes per Commit, after the first install | 6.5–12.4 KB [I] | > 13 KB, or rising with N | branch rewrite beyond two levels; mtime churn | metadata roles per Commit |
| Metadata per Commit minus 0.53·N (one-level branch) | 870–960 B | > 1,150 B, or > 20 B per path level | records rewritten along the path | role split (InodeBranch, InodeLeaf, DirLeaf) |
| Root-branch canonical size ÷ N | 0.57–0.60 | > 0.7 | branch fill | `format.rs` children |
| Inode leaves stored in full | 12% | > 20% | delta base refused | delta budget, cap 8 |
| Directory leaves per content-only Commit | ≤ 0.3 | > 1 | directory rewritten on content edits | construction update path |
| Whole-file delta hit rate | 0.87–0.93 | < 0.75 | similarity index miss | `select.rs`, signature ring |
| Delta record ÷ canonical | 0.044 | > 0.10 | poor base choice | base selection |
| Content per `fs.rm` Commit | ~305 B | > 500 B | content written on delete | mtime triple, reservation |
| `object_location` rows per Commit | 8.6–9.6 | > 11, or > 52 B/row | extra objects per Commit | object roles per Commit |
| `inode_value` rows per Commit | 1.9–2.8 | > 5 in a modify-only range | inode rows re-pooled | pooled leaf path |
| Packs per Commit | 2.6–2.94 | > 3.2 | extra lanes sealed | seal per lane |
| Unused share of pack pages | 14.7–17% | > 20%, or free pages after seal | row size growth, deletes | `dbstat` per table |
| Reserved bytes ÷ pack bodies | ~25% | any rise | pack layout | `layout.rs` |
| Other part | < 0.2% | > 1% | tooling defect | parts computation |
| Install: content stored ÷ raw of changed packages | 0.30–0.45 [I] | > 2 (gate) | dedupe or delta miss | similarity index on new `.pnpm` paths |
| Install: metadata per new path | 0.35–0.80 KB [I] | > 1 KB | per-file attribute objects | mtime machinery (§6 item 2) |
| Install of an unchanged package set | ~0 content, metadata only | content > 1 MiB | dedupe miss | content ids |

Open for the lead: the reinstall gate's "× changed packages" is undefined for
the ~96 installs that change only workspace links and no package (C); define it
before P3 judges one.

### Recalibration at P2 close (2026-10-18, lead) [E]

Sealed Store at range 14 (line `p2-main-f`, daemon `57141b57`, addon
`438bae05`): 48,726,016 B = **46.47 MiB**. §5's r014 forecast: 46.8 expected
(45.9–48.7). Measured −0.7% against expected, inside the band. Earlier sealed
points on the same lineage: r011 34,267,136 B (`p2-main-d`), r013 42,627,072 B
(`p2-main-e`). The forecast above is not edited. Not yet in it: F-031's `.git`
from P3. Its seed is history up to `6e5c908a1` only: 1,545 commits, a 9.35 MiB
pack plus a 0.73 MiB index (`git pack-objects --revs`, lead). Then one git
commit per replayed dsh commit. The builder's P3 dev range measures growth per
git commit (index, loose objects, packs). A dated section "Recalibration for
`.git` (F-031)" follows from the liaison side.

## 8. What P3's development run must measure (recalibration)

1. Store bytes per small `fs.write` Commit before and after the first install,
   by role (tests §3b's +2.5–6 KB step).
2. First install: content and metadata stored (expected ~127 + ~25 MiB), new
   paths (~47k), `.pnpm/lock.yaml` fully deduped, `.modules.yaml` as a delta.
3. Metadata per new path and per re-created path (replaces 0.55 / 0.45 KB).
4. Delta and similarity hits for small files at new `.pnpm/<name>@<ver>` paths
   (tests the 60% assumption) and identical-chunk reuse between versions.
5. Whether pnpm relinks unchanged importers (the +316 MiB relink risk).
6. Real sizes of the four estimated binaries from the pnpm store index
   (read-only, after the fetch finishes).
7. Build output bytes per changed package (replaces §3d).

At each phase end, append "Recalibration at rNNN" with measured values beside
the forecast; keep this section's forecast unchanged.

## 9. The report's disk projection

The report's "Projection at range 202" (47.8 GiB at range 11) is the disk
guard's floor: `growth = max(actual, 256 MiB)` per remaining range
(`dsh/tools/history/steps.mjs` `diskGuard`), meant to keep headroom for P3
installs. It is not a forecast; real growth is 1–6 MiB per range today. Suggested
for the builder (tooling only): report a projection from this study's model
(per-Commit cost × planned Commits + the install forecast), labeled as an
estimate, and show the guard's floor separately as headroom.

## 10. Limits

- The post-install per-Commit step (§3b) and build output (§3d) are not yet
  measured; they are the widest assumptions.
- `node_modules` head sizes after range 100 are modeled (±25%); four binaries
  are estimated (§3c).
- The forecast assumes the plan's workload and the current daemon's policy
  (whole-file cutoff 128 KiB, CDC 8/16/32 KiB, delta caps 16/8/8, zstd 3 for
  content and 1 for metadata, page size 4 KiB).
- Optimizations are simulated by rebuilding packs into a fresh 4 KiB SQLite file
  (pack table within −2.6% of the real one); real savings land within a few
  points of these.
