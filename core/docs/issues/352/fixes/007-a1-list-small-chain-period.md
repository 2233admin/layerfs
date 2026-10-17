# Range 007 a1 · list_small cost is bounded and periodic with the metadata delta cap

| | |
| --- | --- |
| Trigger | `p2-main` range 7 attempt 1 (daemon `361bb09e`): Scaling `list_small` depth exponent 1.67 (threshold < 0.15); Counters `list_small.statements` depth exponent 3.252 (threshold < 0.05) |
| Playbook step | D1 (the counter follows its own input: the probe directory's delta-chain position, not history depth) |
| Kind | none: gate. No product change. The gate attributed a bounded, periodic cost to depth. The builder fixes the attribution as BUGS.md F-016 |
| Old Stores | not applicable (no product change) |
| Old data | not applicable |
| Binaries | daemon `361bb09e…` unchanged |
| Commits | the commit that adds this file; no regression test (no product code) |
| Recovery | fork the `p2-main` range-7 snapshot on daemon `361bb09e` and addon `5baa0f5d` (F-017, kind 1), then rerun range 7 measured as attempt 2 with the corrected gate (F-016) |

## Old design (unchanged)

The probe directory `/.lfs-probe/dir` is rewritten once per range. Each
rewrite adds a metadata delta to its directory object's chain. A read
resolves the chain back to its base. `DEFAULT_METADATA_DELTA_MAX_DEPTH` = 8
caps it: the ninth version is stored whole, and the chain restarts.

Ranges 5, 6 and 7 sampled the probe at chain positions that read 60, 204 and
156 blobs. Three points along one sawtooth fit a steep depth exponent.

## Evidence (the 20-Commit series)

A diag fork of the range-7 snapshot took a Branch `chain`. It then made 20
Commits, each rewriting one file in `/.lfs-probe/dir`, and ran `fs.list` of
that directory after each Commit. Each value is blob reads / reader
statements / ms:

```
60/84/6.7  84/108/4.6  108/132/4.1  132/156/4.4  156/180/4.7  180/204/5.1  204/228/5.3  228/252/5.2
60/84/3.6  84/108/4.1  108/132/4.2  132/156/6.2  156/180/4.3  180/204/5.0  204/228/4.9  228/252/5.6
60/84/4.3  84/108/4.1  108/132/4.6  132/156/4.6  156/180/4.6
```

The cost rises by 24 blobs and 24 statements per Commit. It resets every
8 Commits, and the maximum stays at 228 blobs whatever the history depth.
This is the delta cap working as designed: bounded, with no depth term.
Whether a smaller cap is worth its storage is a format question for the
delta-depth re-read at milestone 50. The watch line is in OPTIMIZATIONS.md.

## Left open

- A 2 KiB `fs.read` alone on a fork costs 2.6 ms at range 5 and 3.8 ms at
  range 7: the same chain position effect on a file. Recorded as a watch for
  the delta-depth re-read.
- The range's S1 latency (`fs.read` 17.8× baseline) is a separate cause:
  client queueing, fixed as F-017
  ([record](007-a1-f017-control-connections.md)).
