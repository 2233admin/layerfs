# Range 002 a1 · Merge base and ancestry walked the whole history

| | |
| --- | --- |
| Trigger | Counters (same row as fork): `merge.statements` depth exponent 0.737, `merge.vm_steps` 0.708, `merge.returned_rows` 0.551 (threshold < 0.05, act > 0.5), [range-002.md](../ranges/range-002.md) |
| Playbook step | D5 (history-proportional ancestor walk), located by D3/D4 statements per call |
| Kind | code path |
| Binaries | old daemon `0ef24121723a…4c404` → new daemon `b9c332b79bc5…58bfc` |
| Commits | fix `3f127ee3e`, regression tests `core/crates/layerfs-daemon/tests/sdk_history_depth.rs`, `core/crates/layerfs-daemon/tests/history_ancestry_oracle.rs` |
| Recovery | fork of snapshot `range-001` into `p1-pilot-a2`, rerun range 2 measured as attempt 2 |

## Old design

`core/crates/layerfs-persistence/src/history/ancestry.rs` at `fdd4a7301`:
`walk` (`:41`) is a breadth-first walk over every edge: Commit parents, base
Layers, Layer parents and each Layer's source Commit. `is_ancestor` (`:65`) and
`merge_base` (`:83`) walk everything reachable from a side; through the Layers'
source Commits that is every Commit ever published to main. The SDK merge calls
`is_ancestor` twice and `merge_base` once
(`core/crates/layerfs-daemon/src/sdk/branch.rs:280`, `:282`, `:319`), and a
publish's `skipped_layers` calls `is_ancestor` per Layer
(`core/crates/layerfs-persistence/src/history/layerstack.rs:383`).

One statement per node read, so a merge of two fresh forks with two files each
cost 2,900 → 4,574 → 5,792 statements over ranges 0–2 (the merge call alone 5,009
at depth 1,533). Worse, each walk stops at `MAXIMUM_LINEAGE_ROWS` (4,096,
`seen.len()` check at `ancestry.rs:49`) with `Capacity`: a few ranges on, every
non-fast-forward merge in the replay would have been refused.

## New design

A stack's Layers form one chain (`layers_child` is unique), so an older Layer's
ancestry is contained in a newer one's. The walks stop at Layers:

- a node's ancestry is its local Commits (reached without passing a Layer) plus
  the ancestry of the newest Layer it reaches;
- two Layers are ordered by walking both chains down in turn (work follows their
  distance);
- a Commit is below a Layer when one Layer above the Commit's own newest Layer,
  up to that Layer, was published from a Commit whose local Commits include it;
- `merge_base` builds the region a best base can come from: both sides' local
  Commits, the Layers between the two sides' newest Layers with their source
  Commits' local Commits, and the older newest Layer as the floor (its own
  ancestry is never expanded). It runs the old breadth-first rule there, then
  drops candidates below the floor, which are older than the floor itself.

Bound: O(Commits since the Layers the two sides reach + Layers between them),
independent of history depth. Answers are unchanged (oracle test below). No
schema change; +168 production lines (`ancestry.rs` 114 → 320 physical lines).

## Proof

- `sdk_history_depth::merge_and_publish_are_independent_of_history_depth`: after
  4 and after 60 published rounds (fork, commit, merge, publish), the catalog's
  `is_ancestor` ×2 and `merge_base` for the probe's merge do the same statements
  and rows, the base is main's head Layer, and a publish stays flat. Before the
  fix: 61 → 733 statements. After: 12 → 12.
- `history_ancestry_oracle::bounded_ancestry_equals_the_whole_history_walk`:
  three random histories (forks from main and from Branches, Commits, merges with
  main among the sides, publishes; ~100 Branches, 35–45 publishes each), 1,500
  node pairs each: `is_ancestor` and `merge_base` equal the old whole-history walk
  (including ~1,000 Commit bases and ~240 related pairs per history).

## Performance, old vs new

Same probe runs as the fork record: forks of the pilot snapshots, fresh daemon,
one sample per case and binary; diagnostic runs.

| Probe / measure | Snapshot | Cache | Old | New | Change |
| --- | --- | --- | --- | --- | --- |
| merge probe statements | range-000 | fresh daemon | 2,900 | 1,176 | −59% |
| merge probe statements | range-001 | fresh daemon | 4,574 | 1,218 | −73% |
| merge probe statements | range-002 | fresh daemon | 5,792 | 1,176 | −80% |
| merge probe VM steps | range-002 | fresh daemon | 167,511 | 45,673 | −73% |
| `branch.merge` call statements | range-002 | fresh daemon | 5,009 | 397 | −92% |
| `branch.merge` call ms | range-002 | fresh daemon | 23.4 | 11.9 | −49% |
| merge probe ms (fork ×2, apply ×2, merge) | range-002 | fresh daemon | 49.9 | 64.1 | +28% (the two applies, unchanged code, took 26 and 21 ms against 13 and 9; one sample) |

Counter exponents against depth, before → after: `merge.statements`
0.698 → 0.008, `merge.vm_steps` 0.678 → 0.138, `merge.returned_rows`
0.514 → 0.096. The remaining VM-step and row growth is the probe's two applies
(content work; F-002 in [BUGS.md](../BUGS.md)), not ancestry.

Storage untouched.

## Left open

- `merge.fullscan_steps` 671 → 809 → 932 is unchanged: it comes from the
  probe's two `fs.apply` Commits reading the content-signature ring (F-002,
  [BUGS.md](../BUGS.md)), not from the merge.
- `ancestry_contains` (fork from a Commit, `commit_history` with a start) still
  walks a Branch's first-parent chain; that is the Branch's own length.
