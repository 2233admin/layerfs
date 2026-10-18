# Range 007 a1 · F-020 · Store calls open the Store in-process (direct route)

> Opened by the owner's liaison on owner direction, 2026-10-18; the fixer
> completes every row marked *pending* as the steps land. Implementation:
> [DIRECT_STORE_IMPL.md](../DIRECT_STORE_IMPL.md); decision and safety
> condition: [DIRECT_STORE.md](../DIRECT_STORE.md).

| | |
| --- | --- |
| Trigger | Owner direction after F-017/F-018 (range 7, attempt 1): Store calls must not depend on a Sandbox. Evidence: `rb-p2-c25119ac-5baa0f5d` range 4, fs.read 4.48 ms p50 at the client vs 0.12 ms traced daemon work; fs.write 11.69 ms vs 5.99 ms (DIRECT_STORE_IMPL.md §1) |
| Playbook step | D6 (time outside the operation: the control round trip) |
| Kind | 1 forward-only (REBUILD.md): new route and crate boundary; Store format unchanged |
| Old Stores | open unchanged |
| Old data | still read as before |
| Compatibility test | *pending*: the direct route opens the newest `p2-main` snapshot written by daemon `c25119ac` and passes `compat.mjs` |
| Binaries | daemon `c25119ac…`, addon `5baa0f5d…` → *pending* (new daemon id from the relocation, new addon id) |
| Commits | *pending*, one per step 1–3, each with its production LOC line (step 1 labeled relocation) |
| Regression tests | *pending*: `direct_locking_real.mjs`, the refusal test, `direct_equivalence_real.mjs` |
| Recovery | no rebuild. After the proofs, re-measure the P2 baseline on the direct route (ranges 0–4, fork of the range-4 snapshot, a new series), then continue `p2-main` from the next unplayed range |

## Old design

Every SDK Store call (fs, branch, project, operator) goes from the addon over
a control connection (`sdk/js/native/src/pool.rs`, `dispatch.rs`) into the
daemon in the agent's or the service Sandbox, which runs it in
`layerfs-daemon/src/sdk/` against the Store it opened. The Sandbox
contributes nothing to these calls; the round trip, framing and the
container crossing cost about 4–6 ms per call (step 0 attributes it).

## New design

The Store-call implementation moves into `layerfs-store-service`, shared by
the daemon and the addon. On Linux, with the Store on a local filesystem the
daemons share, the addon opens the Store in-process (Disposable, explicitly)
and calls the same dispatch. Elsewhere the direct route refuses `Unsupported`;
an explicitly chosen daemon route keeps today's path. No fallback, one attempt.

Cost: one more live opener of the Store (its writer admission shared with the
daemons), one private overlay file per write in the runner's temp directory
(as in the daemon), and the relocation (*pending*: LOC lines).

## Step 0 attribution

*pending*: per method, round trip vs encoding vs untraced daemon work.

## Proof

*pending*: locking, refusal, equivalence, compatibility, existing suites;
each with its command, duration and result.

## Performance, old vs new

Same snapshot fork, same cache state, one sample per case; each series labeled
with its binaries.

| Measure | Snapshot | Cache | Daemon route (`c25119ac`/`5baa0f5d`) | Direct route (*pending*) | Change |
| --- | --- | --- | --- | --- | --- |
| fs.read p50 / p95 | | | | | |
| fs.stat p50 / p95 | | | | | |
| fs.list p50 / p95 | | | | | |
| fs.grep p50 / p95 | | | | | |
| fs.write p50 / p95 | | | | | |
| fs.apply p50 / p95 | | | | | |
| branch.fork p50 | | | | | |
| branch.merge p50 | | | | | |
| branch.publish p50 | | | | | |
| SQL statements per call (each method) | | | | | |
| Store bytes after the equivalence sequence | | | | | |

## Layout as built

*pending*: the vertical listing at the final commit, replacing
DIRECT_STORE_IMPL.md §5.

## Left open

- Whether the daemon route stays after P2: kept for now (macOS hosts, the dsh
  web app); removing it is the owner's call.
- Root AGENTS.md still says the host is control-only; the owner edits it.
