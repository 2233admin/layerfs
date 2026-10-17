# Range 002 a1 · Whole-tree grep re-read each file's root; the gate fit it against depth

| | |
| --- | --- |
| Trigger | Scaling: `grep_tree` depth exponent 0.73 (threshold < 0.15), [range-002.md](../ranges/range-002.md) |
| Playbook step | D2 (squashed-Init control on the same tree, and the fit per tree byte), then D3 (reads per file) |
| Kind | code path (redundant root reads), plus a gate attribution corrected to SPEC §4 with D2 evidence |
| Binaries | old daemon `0ef24121723a…4c404` → new daemon `b9c332b79bc5…58bfc` |
| Commits | fix `92e94d2ef`, regression test `core/crates/layerfs-daemon/tests/sdk_grep_reads.rs`; gate attribution `025a3676e` (`dsh/tools/history/gates.mjs`) |
| Recovery | fork of snapshot `range-001` into `p1-pilot-a2`, rerun range 2 measured as attempt 2 |

## Old design

Two separate things made the depth fit steep.

**The tree grows with depth.** The replay adds the repository's own history, so
the probe tree grew from range 0 to range 2 with the depth. SPEC §4 lets a
whole-tree grep grow with the bytes in its scope, never with depth; the gate
fitted `grep_tree` against depth alone (`dsh/tools/history/gates.mjs:142` at
`3f127ee3e`), which charges tree growth to history.

**Each scanned file's root was read several times.** `window.rs` at
`fdd4a7301`: `lines()` called `snapshot::size` (`window.rs:45`), which read the
whole canonical file (`snapshot.rs:137`, `:142`, `read_canonical`) only for its
length, and then called `read_range` for every 16 KiB window (`window.rs:65`),
each opening the root again. A delta-encoded root decodes its chain on each open,
so a file paid (2 + windows) chain reads. Callers: `fs.grep` and the text reads at
`core/crates/layerfs-daemon/src/sdk/reads.rs:46` and `:174`. Deeper history means
longer chains (bounded by the caps: whole file 16, chunk and metadata 8), so
this part did grow with depth, up to the cap.

## New design

- `lines()` opens one `FileView` per file, takes the size from
  `view.logical_len()`, and reads every window through that view; a size for a
  regular file comes from `file_lengths` (metadata, no payload). A file is
  decoded once per scan: O(file bytes + one chain), not O(windows × chain).
- The gate fits `grep_tree` per tree byte (`SCOPED` in `gates.mjs`, from the
  oracle's file and byte count that `run.mjs` now records with each range). A
  rise per byte against depth is still a finding; tree growth is not.

+5 production lines. No schema or stored-byte change.

## Proof

- `sdk_grep_reads::grep_reads_each_root_once_whatever_its_size`: grep of a
  104 KiB whole-file root with a three-edit chain demands the same objects as a
  1 KiB root with the same chain. Before: 12 object ids against 6 (fail). After:
  5 and 5.
- D2 control (diagnostic, old binary, `scratchpad/squash.mjs`): range 002's tree
  Initialised as a fresh Store, then the same grep. Squashed 5,913 statements
  against 16,833 on the history at depth 1,533: same tree, so the excess is the
  delta chains, not the scan. New binary: 4,317 against 12,033.
- `dsh/tools/history/tests/history.mjs`, "a whole-tree grep is judged per tree
  byte": a grep that grows with tree bytes passes, one that grows per byte with
  depth trips.

## Performance, old vs new

Forks of the pilot snapshots, fresh daemon (new service container) on a Store
file just restored, one sample per case and binary; diagnostic runs
(`diag-rN-old`, `diag-rN-new`). ms excludes Sandbox service start.

| Probe / measure | Snapshot | Cache | Old | New | Change |
| --- | --- | --- | --- | --- | --- |
| grep_tree statements | range-000 | fresh daemon | 8,622 | 6,438 | −25% |
| grep_tree statements | range-001 | fresh daemon | 13,263 | 9,483 | −28% |
| grep_tree statements | range-002 | fresh daemon | 16,773 | 12,033 | −28% |
| grep_tree VM steps | range-002 | fresh daemon | 246,307 | 217,867 | −12% |
| grep_tree ms | range-000 | fresh daemon | 73.08 | 56.83 | −22% |
| grep_tree ms | range-001 | fresh daemon | 120.79 | 85.23 | −29% |
| grep_tree ms | range-002 | fresh daemon | 152.69 | 107.08 | −30% |
| grep_tree statements, squashed Init of range-002's tree (D2) | range-002 tree | fresh Store | 5,913 | 4,317 | −27% |

Exponents over the three snapshots, before → after:

| Fit | Old | New |
| --- | --- | --- |
| statements against depth (raw, as the old gate) | 0.669 | 0.625 |
| ms against depth (raw) | 0.747 | 0.636 |
| statements per tree byte against depth | −0.003 | −0.047 |
| VM steps per tree byte against depth | −0.032 | −0.050 |
| rows per tree byte against depth | −0.093 | −0.110 |
| ms per tree byte against depth | 0.075 | −0.036 |
| statements against tree bytes | 0.995 | 0.929 |
| ms against tree bytes | 1.111 | 0.945 |

The pilot's own values on the old binary (the gate's history) give statements per
byte −0.05 and ms per byte 0.057, under the 0.15 band; the 0.73 was the tree's
growth. Storage untouched.

## Left open

- On the same tree, history still costs ~2.8× the squashed statements: delta
  chains read in full, bounded by the depth caps. That is SPEC §8's storage-for-
  read trade-off, not a growth with depth beyond the caps; no change here.
- The gate's history mixes binaries: ranges 0–1 were measured by `0ef24121`, the
  rerun of range 2 will be `b9c332b7`. The per-byte fit across them is labelled
  so in the range report; a clean series starts when the run continues.
- `diff_commits` walks both whole trees (`compare.rs` `changes()`), 0.59 VM-step
  exponent against depth on the probes; tree-proportional, not change-
  proportional. Not this finding's trigger; likely the rerun's next Counters row.
