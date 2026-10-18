# #353 — History walks without the 4,096 lineage cap

> **Status:** Implemented in `45ba293b4` (2026-10-18); measured in
> `0b6f5b35e`; results in §9. Written before code as a design note that implements the owner
> decision on [#352 F-033](../352/BUGS.md): no history walk fails `Capacity` on
> history or Commit counts, answers stay exact, and no work that grows with
> history runs inside the publication lane
> ([architecture 83](../../architecture/83-store-concurrency-model.md)).

## 1. The graph and the three questions

Nodes are Commits and Layers. A Commit's parents are its first parent (a Commit,
or its base Layer when it has none) and an optional second parent (a Commit or a
Layer). A Layer's parents are its parent Layer and its source Commit. A stack's
Layers form one chain. Every node's ancestry is therefore its *local* Commits
(reached without passing a Layer) plus the ancestry of the newest Layer it
reaches (`ancestry.rs`, finding 002).

| Case | Question | Today |
| --- | --- | --- |
| (a) | `is_ancestor`, `merge_base`, publish's skipped Layers over a Branch's Commits since its base Layer | enumerates every local Commit (3 statements each) |
| (b) | order of two Layers; the Layers between two sides and their sources | walks the Layer chain one row at a time |
| (c) | is a Commit on a head's first-parent chain (fork from Commit, history start) | walks first parents one row at a time |

## 2. What is stored

Four new tables. Existing tables and columns are unchanged (an additive
migration, [REBUILD kind 2](../352/REBUILD.md)).

```sql
-- One row per Layer: its position in the stack chain.
CREATE TABLE layer_lineage (
    layer_id BLOB PRIMARY KEY,           -- layer(layer_id)
    layer_stack_id BLOB NOT NULL,
    height INTEGER NOT NULL CHECK (height >= 0),          -- genesis 0, child = parent + 1
    overwrote_count INTEGER NOT NULL CHECK (overwrote_count >= 0)
) STRICT, WITHOUT ROWID;
CREATE UNIQUE INDEX layer_heights ON layer_lineage(layer_stack_id, height);

-- One row per Commit: its place in a run and the newest Layer it contains.
CREATE TABLE commit_lineage (
    commit_id BLOB PRIMARY KEY,          -- "commit"(commit_id)
    run BLOB NOT NULL,                   -- the run's first Commit
    depth INTEGER NOT NULL CHECK (depth >= 1),            -- first-parent depth above the base Layer
    newest INTEGER NOT NULL CHECK (newest >= 0),          -- height of the newest Layer in its ancestry
    merged BLOB                          -- second parent, when it is a Commit
) STRICT, WITHOUT ROWID;
CREATE UNIQUE INDEX commit_runs ON commit_lineage(run, depth);
CREATE INDEX run_merges ON commit_lineage(run, depth) WHERE merged IS NOT NULL;

-- Absorption: run prefix up to `depth` is in the ancestry of the Layer at `height`.
CREATE TABLE absorbed (
    run BLOB NOT NULL, depth INTEGER NOT NULL, height INTEGER NOT NULL,
    PRIMARY KEY (run, depth)
) STRICT, WITHOUT ROWID;
CREATE INDEX absorbed_heights ON absorbed(run, height);

-- Published sources, kept as a dominance frontier: max height with x <= X.
CREATE TABLE reach (
    key BLOB NOT NULL, x INTEGER NOT NULL, height INTEGER NOT NULL,
    PRIMARY KEY (key, x)
) STRICT, WITHOUT ROWID;
```

**Runs.** A run is a first-parent path. A new Commit continues its first
parent's run when the parent has no child in that run yet (`commit_runs` has no
`(run, depth + 1)`); otherwise, or without a Commit parent, it starts a run named
by its own id. Merges stay inside runs; `merged` marks them.

**Absorption.** The first Layer whose ancestry contains a Commit absorbs it, and
that never changes (Layers are published in height order). What one publish
absorbs is a set of run prefixes, so it is stored per run as
`(run, depth, height)`. Rows of one run increase in both depth and height.
`absorbed_height(A)` is the height of the row with the smallest `depth >= A.depth`.

**Reach.** Two frontiers in one table answer "the newest Layer published from a
source in this set". Key = a run: `x` is a source's depth in that run. Key = a
stack: `x` is the absorbed height of a *late* Layer's source (a source already
absorbed by an older Layer when it was published). A new row has the largest
height so far, so it replaces every row of its key with `x >= ` its own; what
remains increases in both `x` and height, and the query is one indexed lookup:
`SELECT height FROM reach WHERE key=? AND x<=? ORDER BY x DESC LIMIT 1`.

**Overwritten Layers (owner ruling 2026-10-18: full list, paged).** The
Layers a publication skips are always the newest run of the chain below it:
heights `(covered, H]` (the old walk stopped at the first covered Layer). So
the full list is already stored, one row per displaced Layer: their
`layer_lineage` rows, addressed by that height range. The publication writes
only `overwrote_count`; nothing is dropped, there is no fixed count, and lane
work does not depend on the list's length. **Breaking API change (for the
integrator):** `LayerRecord.overwrote` is replaced by `overwrote_count`;
`AddLayerOutcome::Added` no longer carries a list; the SDK layer value drops
`overwrote` and `overwroteTruncated` for `overwroteCount`, and
`branch.publish` returns `overwroteCount`, the first 50 `overwrote` and
`overwroteHasMore`.
`HistoryCatalog::overwritten(layer, position, limit)` returns one page (newest
first, at most 128) with one indexed range read on `layer_heights`, outside the
lane. The SDK's `branch.publish` reads the first 50 after the publication and
returns `overwroteCount` and `overwroteHasMore`; `project.list_overwritten({
layer, pageSize, pagePos })` pages the rest. Layers published before #353 keep
their stored list (same set), and its length becomes their count.

## 3. The walks after the change

All per-node reads are by primary key or a covering index (O(log n) B-tree
steps, one statement).

**Explore.** `explore(start, below)` visits the run segments of `start`'s local
Commits that no Layer below height `below` absorbed: for a segment `(run, d)` it
reads `lo` = the deepest prefix of `run` absorbed below `below`, skips it when
`d <= lo`, enumerates the merges in `(lo, d]` through `run_merges` and follows
their Commit second parents, and follows the run start's first parent when
`lo = 0`. Anything absorbed below `below` is in that Layer's ancestry, so the
caller already knows its answer for it. Work: ~3 statements per run segment plus
1 per merge in the unabsorbed local region. It does not visit ordinary Commits
or Layers.

| Walk | New method | Work |
| --- | --- | --- |
| Layer `a` ≤ Layer `b` | heights | 2 reads |
| Layer `A` ancestor of Commit `D` | `height(A) <= newest(D)` | 2 reads |
| Commit `A` ancestor of Layer `D` | `absorbed_height(A) <= height(D)` | 2 reads |
| Commit `A` ancestor of Commit `D` | absorbed check against `newest(D)`; else `newest(A) > newest(D)` is false; else `explore(D, absorbed_height(A))` until `A`'s run and depth are found | 4 reads + explore |
| (c) `A` on `head`'s first-parent chain | same run and `depth(A) <= depth(head)`, else hop to the run start's parent | 2 reads per run hop |
| (a)/(b) `merge_base(L, R)` | below | explore of both sides |
| publish: skipped Layers | below | explore of the source |

**Merge base.** Let `F` be the older of the two sides' newest Layers and `S` the
side whose newest Layer is `F`. Common ancestry is `ancestry(F)` plus `S`'s local
Commits not absorbed by `F` that the other side `O` contains. In one run those
form one range, so only its top can be maximal. So: explore `S` below `F + 1`
(its segments), explore `O` below `newest(O) + 1`, and per run of `S` the
candidate is depth `min(d_S, q_O)` where `q_O = max(absorbed depth of the run by
newest(O), O's deepest segment in the run)`. Candidates plus `F` are filtered to
the maximal ones with `is_ancestor`. Without the history's length in it, the
work is both explores plus pairwise checks of the candidates (one per run of
`S`'s unabsorbed region, usually one).

**Tie rule (behaviour change, criss-cross only; accepted by the owner
2026-10-18).** When several maximal common
ancestors exist, today's answer is the first in breadth-first order from the
right side, which needs the whole region in order. The new rule picks the one
with the newest Layer in its ancestry, then the deepest first parent, then the
smallest id. With one maximal ancestor (every case except criss-cross merges)
the answer is unchanged. The oracle applies the same rule over its whole-history
walk.

**Publish (inside the lane).** For source `C` on stack head `H`, new height
`h = H + 1`:
1. `T = newest(C)`. A Layer is skipped unless it is in `C`'s ancestry
   (`height <= T`) or its source is. Covered = `max(T, P)` where `P` is the
   newest Layer published from a source in `C`'s ancestry: the stack's late
   frontier at `x <= T`, and for each segment of `explore(C, T + 1)` the run's
   frontier at `x <= d`. When `T = H` nothing is skipped and no explore runs.
2. `overwrote_count = H - covered`; the list is not written (it is the
   height range `(covered, H]`).
3. Insert the Layer and its `layer_lineage` row; record `C`'s absorbed height
   before this publish (late when it exists).
4. Absorb: each segment of `explore(C, ∞)` gets `absorbed(run, d, h)`.
5. Reach: `(C.run, C.depth, h)`; if late, `(stack, absorbed, h)`.

Commit insertion adds one `commit_lineage` row from the parent's row (2–3
reads, 1 insert).

## 4. Why answers stay exact

- `A ∈ ancestry(Layer Y)` iff `absorbed_height(A) <= height(Y)`: Layer ancestry
  is cumulative along the chain, and every Layer absorbs, in its own
  transaction, everything its source reaches that no older Layer did.
- A region skipped by `explore(·, below)` is in the ancestry of a Layer below
  `below`; each caller has already decided the question for that Layer's
  ancestry before exploring, so skipping it cannot change the answer.
- Ancestry is closed under parents, so a node's ancestry meets a run in a
  prefix; one depth per run describes it exactly.
- The reach frontiers drop only rows that a newer row dominates (smaller or
  equal `x`, larger height); the maximum they answer is the maximum over all
  rows.
- No walk has a budget, so no walk ends unfinished; there is no `Capacity`
  from history size. `MAXIMUM_LINEAGE_ROWS` is deleted.

## 5. Work inside the publication lane

Publish runs steps 1–5: a constant number of reads and writes plus two explores
of `C`. The explores visit run segments and merges that no older Layer absorbed,
never ordinary Commits and never Layers between, so the 1k / 4k / 40k Commit
and Layer cases cost the same statements. Two things still scale, and are
stated rather than hidden:
- **Merges and runs not yet absorbed.** A source whose unpublished region holds
  `m` merges of other Commits costs `O(m)` statements; each merge is absorbed
  once in all history. The #352 replay's lanes merge a few times per range.
- **Frontier pruning.** A `reach` insert deletes the rows it dominates: amortized
  one delete per earlier insert.

Commit insertion is constant. Fork-from-Commit is per run hop.

## 6. Existing Stores: one-off backfill at open

Additive migration (kind 2), the `add_binding_hints` pattern: when the four
tables are absent and the recorded schema is exactly the previous one, one write
transaction at open creates them, backfills, and records the new schema.
- `layer_lineage`: one recursive CTE down each stack chain; count = length of
  the stored list / 33.
- `commit_lineage`: Commits in parent-first order (an in-memory depth-first
  order over all Commit ids; one-off, O(Commits) memory).
- `absorbed` and `reach`: replay steps 3–5 for every Layer in height order.
Cost is linear in history, once; no ranges are replayed and nothing existing is
rewritten. A Store with any other recorded schema is left to `validate`.

**Measured, 2026-10-18 08:05Z (one sample, Disposable).** A copy of the #352
range-14 main-line Store (p2-main-f, 48,726,016 B, schema 22, last written by
daemon 57141b57; 10,612 Commits, 18 Layers, 168 Branches), opened writable by
`tests/lineage_backfill_measure.rs` (debug test binary of 45ba293b4 plus this
test). Host load at start 7.29 / 9.51 / 11.68; #354 was running one
single-threaded read probe in the window.

| Measure | Value |
| --- | ---: |
| Writable open with backfill (one write transaction: the writer's hold) | 292.8 ms |
| Writable open of the migrated copy (no backfill) | 1.1 ms |
| Backfill hold, by difference | ~292 ms |
| Peak RSS of the whole process (both opens) | 14.9 MB |
| Rows written | 10,612 commit_lineage, 18 layer_lineage, 37 absorbed, 17 reach (78 runs, 35 merges) |

The hold is under the 2 s writer admission window at this size. It is linear in
Commits (~27.6 µs per Commit here), so by extrapolation it reaches 2 s near
72,000 Commits; a Store migrated past that size holds the writer longer than
the admission window once, at its first writable open, and another writer
waiting in that window is refused `Busy`. Not changed without an owner
decision.

**Store cost (same copy, `dbstat`).** The four tables and four indexes take
1,904,640 B: `commit_lineage` 933,888 B and `commit_runs` 946,176 B, one page
each for the rest. That is **179.5 B per Commit (3.5% of ~5.1 KB/Commit)**;
the file grew by 1,941,504 B (183 B per Commit, including page slack).

## 7. Expected production LOC (estimate)

New lineage module (reads, explore, frontiers, insertion) and migration, a
rewritten `ancestry.rs`, publish and insertion changes, new SQL and schema;
minus the old walks and `MAXIMUM_LINEAGE_ROWS`. **Estimate: +350 to +700
production lines.** Measured with `tools/production_loc.py --root` at commit.

## 8. Tests

- `scale_lineage_cap.rs`: (a) (b) (c) assert success at 4,097 and at 10× (40,970),
  each ≤120 s; the 10× histories are built through the catalog with two real
  roots alternating, then merged and published through the SDK.
- Statements per publish and per merge at 1k / 4k / 40k are equal.
- `history_ancestry_oracle` keeps matching a whole-history walk (tie rule above).
- A Store written before the tables opens, migrates and answers like a fresh one.

## 9. Implemented and measured (2026-10-18)

| Commit | What | Production LOC |
| --- | --- | --- |
| `c863c337c` | this design note | 97,211 -> 97,211 (0) |
| `45ba293b4` | lineage tables, walks and backfill; `MAXIMUM_LINEAGE_ROWS` deleted | 97,211 -> 97,600 (+389) |
| `0b6f5b35e` | backfill and Store cost measured (§6) | 97,600 -> 97,600 (0) |

The scope is core+sdk+dsh production (`tools/production_loc.py --root`). The
estimate in §7 was +350 to +700. Deleted tests: none; no test asserted the
4,096 refusal.

**Tests at `16a19429a`** (macOS, debug, each command ≤120 s):
- `scale_lineage_cap.rs`, 3 tests (4,097 and 10× cases): pass, 23.8 s.
- `history_ancestry_oracle`: pass, 8.4 s.
- `lineage_backfill`: pass.

`lineage_backfill_measure` is ignored (it needs a replay Store); its one
sample is in §6.

**Merges.** Branch merges and Commit merges use these walks for
`merge_base`. The merge itself at scale, and its own caps, are #355
([fix notes](../355/FIX_NOTES.md)).

**Gaps.**
- Linux proofs are not run.
- The range-90 replay integration obligation needs the replay branch.
- The one-off backfill hold extrapolates to 2 s near 72,000 Commits (§6).
  That is left to an owner decision.

