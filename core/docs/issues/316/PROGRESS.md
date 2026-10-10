# Reference pieces: progress ledger

> **Status:** Dated working ledger of an unattended run; not release evidence or a product contract.

Append-only. One entry per checkpoint of the
[handoff](HANDOFF-PIECE-STRUCTURE-PROMPT.md) for
[#316](https://github.com/Ephemeral-AI-Lab/layerfs/issues/316). The branch
`issue316-fsb-rescue` is local and unpushed. Every timing here is one
diagnostic sample. Counts are the evidence; a row is called passing only when
its receipt says PASS. Durable execution:
`NOT_RUN — disabled by owner until explicit reauthorization`.

Columns of every tier table, from `tools/tier_table.py`: harness status, proof
status, command phase (exec) and Commit in milliseconds, FUSE requests, overlay
writer jobs and statements of the whole run, overlay logical megabytes after
the command, source commit.

## Phase 0 — checkpoint 2026-10-11, commit `0dff203c2`

### What changed

No product source. Commit `0dff203c2`:
`Production LOC: 79544 -> 79544 (delta +0)`.

- Architecture 55, 56 and 31 gained a dated update for the exploratory
  optimization `8c1993f4a` (shapes-only captured cursor and its `Local` step,
  normalization without payload for dense rows, the cached normalized edit,
  slice copies in the read job).
- Overlay test `close_custody`: each engine now has its own temporary
  directory.

### Checks of `8c1993f4a`

Every test command ran under a 120 s stop, built with `--no-run` first.

| Check | Where | Result |
| --- | --- | --- |
| Clippy `-D warnings`, all targets, `layerfs-overlay`, `layerfs-workspace`, `layerfs-content` | host, cargo 1.85.1 locked | clean |
| Formatting of the three packages | host | clean |
| Product boundary guard | host | PASS, 674 files |
| `layerfs-overlay`, all test targets | Linux, pinned image | pass, except `close_custody` 1 of 2 failed with "File exists" in two runs, before the test fix; 2 of 2 pass after it |
| `layerfs-workspace`, all test targets | Linux, pinned image | pass |
| `layerfs-daemon`: `captured_runs`, `read_cost`, `filesystem_port`, `edit_backing` | Linux, pinned image | pass |
| `cargo fmt --all` | host | not usable: stops on the daemon example and test `e2_startup_receipts`, which name a harness path that is absent |

Both known obstacles were confirmed at the branch base `2590a4536`: the
`close_custody` file is unchanged since that commit, and the harness path the
daemon target names is absent there too. The daemon crate is unchanged on this
branch. Formatting is therefore checked per package.

### Throughput of the cut scan and of chunk identity

One pass each, single thread, 256 MiB of incompressible bytes, 13,762 chunks,
mean 19,505 bytes. Diagnostic; a scratch program outside the repository tree
that calls Content's public scanner and encoder.

| Work | Host, MiB/s | Linux image, MiB/s |
| --- | --- | --- |
| Cut scan (`FastCdc::scan`) | 2206 | 2322 |
| Chunk identity, encode the object then hash | 1011 | 931 |
| Chunk identity, hashed in place without building the object | 1052 | 989 |
| Plain BLAKE3 over the same chunks | 1256 | 1114 |

The streamed identity was equal to the encoder's identity for every chunk.
For scale: the command phase of the 500 MiB insert moves 250 MiB, which is
about a quarter of a second of hashing on one thread.

### Prepared statements in use

Static count over the overlay crate's product source: 228 distinct literal
statement texts. 2 are used only by diagnostics, 4 are format templates, and
3 of the remaining literals are fragments of the 4 texts the fence macro
builds. That gives about 225 texts the engine's jobs can prepare, against a
cache capacity of 256: headroom of about 31. The plan estimates about 12 new
texts. The added stop condition (capacity not enough) is not triggered; the
new texts are counted again at the end of phase 1.

### Control sample, tag `c0`

Nine fixed cases, one sample each, at `0dff203c2`, before any piece code.

| case | status | proof | exec ms | Commit ms | requests | writer jobs | statements | overlay MB | commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE | PASS | 32.2 | 13.2 | 11 | 173 | 880 | 0.3 | 0dff203c2 |
| delete-middle-4k-on-500mib-ops-1 | FAIL | FAIL | 2380.6 | 2446.0 | 6012 | 25449 | 223248 | 272.5 | 0dff203c2 |
| insert-middle-4k-on-10mib-ops-1 | FAIL | FAIL | 64.4 | 47.1 | 171 | 808 | 5018 | 5.7 | 0dff203c2 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 2439.9 | 2413.9 | 8011 | 20649 | 133839 | 268.4 | 0dff203c2 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | FAIL | FAIL | 6159.2 | 5391.7 | 16011 | 37881 | 252687 | 536.6 | 0dff203c2 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE | PASS | 42.3 | 22.0 | 11 | 452 | 2375 | 0.3 | 0dff203c2 |
| payload-create-500m | INELIGIBLE | PASS | 944.8 | 9379.0 | 4014 | 20137 | 156610 | 533.4 | 0dff203c2 |
| tiny-bulk-create-100-mixed-v3 | INELIGIBLE | PASS | 678.2 | 1039.6 | 8709 | 71650 | 341790 | 108.7 | 0dff203c2 |
| workspace-dense-rewrite-100-mixed-v4 | INELIGIBLE | PASS | 1090.7 | 2323.1 | 12545 | 84438 | 424874 | 109.7 | 0dff203c2 |

Rows as observed:

- **Four FAIL**, all four target cases. Original failure of each receipt:
  `independent-graph failed with exit 1`; the step's error text is
  `persisted edit lost an original untouched payload object`. This is the
  retention guard of the oracle. How it is judged for these cases stays with
  the owner (O-6).
- **Five INELIGIBLE**, all five regression cases. Functional status PASS and
  proof PASS in each receipt. Ineligible because the run declares interference:
  another agent's containers share the Docker VM, unquantified. Every sample of
  this run will carry the same declaration.
- The 10 MiB and 500 MiB inserts hold 5.7 MB and 268.4 MB in the overlay and
  take 808 and 20,649 writer jobs: both grow with file size. This pair is the
  size comparison for phases 2 and 3.

### Decisions by agent, pending owner review

1. **`close_custody` test fix.** The two tests created one shared directory.
   Giving each engine its own is a test-only change needed to finish the Linux
   check; no assertion changed.
2. **Formatting is checked per package**, because `cargo fmt --all` cannot
   parse the daemon target with the absent path. The daemon target is not
   repaired here: it is outside this work.
3. **Design choices for phase 1**, taken where the plan leaves a detail open.
   Each is implemented and tested in the checkpoint that needs it and recorded
   again there.
   - A piece's source is the file's committed content root, never the base
     root (rule C-6).
   - Piece rows of one layer never overlap, live or stale. A piece is stale by
     its start offset and stamp, with the existing staircase test.
   - Truncate cuts the live piece that crosses the new size so that it ends at
     the new size, and later pieces go stale through the existing shrink step.
     The plan's wording "deletes pieces that start in the boundary cell" would
     drop bytes below the new size, because the shrink boundary is the next
     cell boundary at or above it; the cut replaces it.
   - The content sequence of an inode row is the Workspace revision of the
     publication that last wrote the row. A counter kept in the row could
     repeat after the row is deleted and created again; a revision cannot.
   - Claims travel beside the write in the compound job value, not inside the
     byte window type, so the 51 existing call sites are unchanged.
   - One engine-wide exact flag records whether a piece row was ever written,
     like the existing orphan flag. While it is false no retirement or cleanup
     path issues a piece statement, so runs without pieces keep today's counts.

### Not done in phase 0

- `layerfs-daemon` test targets other than the four named were not run on
  Linux in this phase; the full package tests belong to tier 4.
- The runtime database profile for piece statements belongs to phase 1.

### Next

Phase 1, in small counted commits: schema 33 and inode columns; piece rows,
claims and the layered read; truncate and stale pieces; lifecycle; the
captured `Reference` step; Content's extent cursor; the Workspace read path;
the edit script and end-to-end tests. Then tier 2 under tag `p1`, whose counts
must equal `c0`.
