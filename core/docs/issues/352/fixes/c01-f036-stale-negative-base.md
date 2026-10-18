# c01 · F-036: a stale "absent" answer for a base another writer just published

> **Status:** fixed on branch `claude/issue352-correctness-644bbc` (correctness
> lane, 2026-10-18). Not merged; integration is the owner's decision.
> Supersedes the read-only notes in `016-pre-f036-concurrent-install-commit-notes.md`
> (branch `dsh-352-f032-rm-rf`). Kind 1 (no format change).

## Finding

S4 (`~/lfs-history/scale-experiments/s4/REPRO-F036.md`): two daemons committed
the same first `node_modules` install into one Store at the same moment.
Commit c (daemon a) succeeded. Commit d (daemon b) failed in `Commit Construct`
after 15.7 s with `object e8775b32…ea37 is not stored`.

## Cause (proved)

`layerfs-storage`'s `Fetch` keeps two caches per Storage handle: positive
locators, and a set of ids it has seen **absent** (`fetch.rs`, `absent`). The
absent set is cleared at the start of each demand (`begin_demand`: a Save
wave, or a read). Inside one wave it answers "not stored" without asking the
Store again.

A negative answer is only true when it is taken. In a wave, b can:

1. record a base Z as absent, for example by probing it as a delta candidate;
2. while the other writer, a, publishes Z and then O, with O stored as PREFIX on Z;
3. look up O afresh, because its own earlier negative for O was dropped (a
   lost first-wins registration re-reads the winner through the same `Fetch`,
   which runs `begin_demand`; capacity clears and invalidations drop entries
   too). It finds a's O and walks O's chain, and the base lookup for Z is
   answered from the stale absent set: `ObjectMissing(Z)`
   (`encoding/delta/read.rs` chain walk).

A stored record's base is always stored: publication registers bases first
(`save/publication.rs`). So a negative answer for a base named by a stored
record can only be stale.

**Evidence from the frozen state** (read-only, on a byte copy of
`F036-store-copy/` in the lane's scratch, with checksums verified):

- Daemon b's own counters (trace `lww/trace-lww-play.jsonl`, failed Commit):
  `sealed_inserts` 1,610, exactly the size of the first reserved pack block
  (45,936,641–45,938,250). b reserved once. So the second block
  (45,940,737–45,943,223), which holds e8775b32 (pack 45,942,259), is daemon
  a's. **e8775b32 was published by a, the winner.**
- A probe read every WholeFile object of each block through a logging port,
  one fresh handle per root, and recorded which roots' chain walks located
  e8775b32. Result: **11 of a's 22,375 WholeFile objects chain through
  e8775b32** (for example `b5a83f0f…`, `5519e5f0…`, `4593c852…`), and none of
  b's 10,290 do. So e8775b32 is a delta base inside a's PREFIX chains. That is
  exactly the base a wave in b reaches only by walking a's chain.
- The probe was a temporary test file, deleted after use. It is not committed.

**Deterministic reproduction** (no timing):
`layerfs-storage/tests/concurrent_winner_chain.rs` runs writer a inside b's
`publish` calls through an interleaving port, in the order above. Without the
fix it fails with `ObjectMissing(Z)`, where Z is the test's base id
(b7611fa6…, checked in the panic message). With the fix it passes, and every
object reads back byte-exact.

## Fix

`Source::base_location(id, ceiling)` is a new trait method. It defaults to
`location`. Callers use it wherever the id is a base that a stored record names:

| Site | Change |
| --- | --- |
| `store/source.rs` | new trait method with default |
| `read/fetch.rs` | override: drop `id` from `absent`, then locate (one statement only when it was marked) |
| `save/source.rs` | `WaveSource`: the Save's own packer first, then `Fetch::base_location` |
| `encoding/delta/read.rs` | chain walk: base lookup |
| `encoding/pool/read.rs` | pooled chain walk: base lookup |
| `read/prefetch.rs` | dependency frontier |
| `encoding/delta/select.rs` | `DepthCache::cost_of`: every element past the first. Before, a stale negative here made a real candidate look "not stored" (silently FULL); now it is re-asked |

The absent set still serves its purpose: admission (`wave.rs`) asks once per
wave whether each object is new. Nothing is retried. A base that is really
missing still fails `ObjectMissing`, now from a fresh answer. Cost: none when no
base is marked absent, which is the normal case. Otherwise one locate statement
for each base that was marked absent and is then reached through a stored chain.

## Functions changed (ownership, liaison 2026-10-18)

The liaison assigned these functions to this fix. The edits stay on the
chain-walk and locate paths. Delta selection itself (candidate choice,
scoring) is untouched. The RCA agent's #360 item 3 owns that.

| File | Function | Change |
| --- | --- | --- |
| `store/source.rs` | `trait Source::base_location` (new, defaulted) | the new method |
| `read/fetch.rs` | `impl Source for Fetch::base_location` (new) | drop `id` from `absent`, then `location` |
| `save/source.rs` | `impl Source for WaveSource::base_location` (new) | packer first, then `Fetch::base_location` |
| `encoding/delta/read.rs` | `Resolver::resolve_charged` | the chain-walk base lookup: `location` becomes `base_location` |
| `encoding/pool/read.rs` | `PoolReader::reconstruct_leaf` | the pooled chain-walk base lookup: `location` becomes `base_location` |
| `encoding/delta/select.rs` | `DepthCache::cost_of` | locating past the first chain element: `location` becomes `base_location` |
| `read/prefetch.rs` | `chains` | the dependency-frontier lookup: `location` becomes `base_location` |

`read/provider.rs` and `read/mod.rs` (#354 A1) are not changed.

## Negative caching: invalidated where a concurrent writer can falsify it

The per-wave `absent` set stays. Its entries are **invalidated** wherever the
answer could be falsified by another Save:

- **Bases named by a stored record.** Publication registers bases first, so
  such a base is always stored. Any `absent` entry for it is stale, and
  `base_location` drops the entry and locates the base again (one fresh
  answer). This is the F-036 path.
- **Admission's "is this object new?"** (`save/wave.rs`, once per wave).
  When another writer publishes the object in between, the answer is stale.
  The cost is only that the object is written again. First-wins registration
  then reports it as lost, and the winner is read back through
  `begin_demand`, which clears `absent`. Correctness does not depend on this
  answer.
- **Everything else.** `absent` is cleared at every `begin_demand` (each wave
  and each read), so no negative answer outlives one demand.

The Save is not retried. A base that is really missing fails `ObjectMissing`
from a fresh answer.

## Tests

| Test | Where | Without fix | With fix |
| --- | --- | --- | --- |
| `a_concurrent_winner_chain_resolves_a_base_this_wave_located_absent` | `layerfs-storage/tests/concurrent_winner_chain.rs` (host and Linux) | **FAIL** `ObjectMissing(Z)` | pass, 0.01 s |
| `two_writers_saving_the_same_new_content_both_complete` | `layerfs-persistence/tests/concurrent_first_installs.rs` (Linux only: two independently opened Store handles on one SQLite file, the daemon arrangement, two threads, 3,072 objects in PREFIX chains, the writers using different hints and orders) | pass (0.54 s) | pass (0.56 s) |

The second test is the real-engine, two-writer check: two handles, Linux
directory lock, first-wins publication. **It does not reproduce the race**
before the fix. The failing order needs a lost-registration read to land
between a negative probe and the other writer's publication, and real
scheduling does not make that happen on demand. The deterministic port-level
test is the regression. A full two-daemon FUSE replay of S4 was not run. The
frozen S4 state is no longer needed for this RCA: see "Frozen state" below.

Checks at this identity:
- `cargo +1.85.1 test -p layerfs-storage -p layerfs-persistence`: host all pass; Linux (pinned image `378b799ef433`) 143 passed, 0 failed.
- Clippy `-D warnings`: clean for both crates, host and Linux.
- `rustfmt`: clean on the changed files. Pre-existing format diffs elsewhere (`layerfs-daemon/tests/concurrent_commits.rs`, `layerfs-storage/tests/delta_depth_counts.rs`, `layerfs-persistence/tests/sqlite_group_rows_indexed.rs`, `sdk/js/native/examples/restore_record.rs`) are left as found.
- `check_product_boundary.py`: 16 violations, all pre-existing (daemon → store-service, persistence → telemetry, store-service `operator/mod.rs`); none in `layerfs-storage`.

Not run: the S4 two-daemon replay on rebuilt binaries, and the daemon and store-service suites. The change is internal to `layerfs-storage` and keeps its public surface, apart from one defaulted trait method.

## Frozen state

The RCA no longer needs volume `layerfs-issue352-scale-s4`, containers
`layerfs-issue352-scale-s4-a`/`-b`, or `~/lfs-history/scale-experiments/s4/`.
They are reported to the liaison for release. This lane did not delete or
modify them.
