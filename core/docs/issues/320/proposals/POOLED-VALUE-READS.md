# Issue 320 proposal P3: pack reads for pooled inode values

> **Status:** Proposal for the owner; not selected, not built, not a contract.
> Written 2026-10-13. Each option changes a cache lifetime, a public trait of
> the Storage crate or a physical encoding policy, so nothing is committed.

## What was measured

Tier 1 case, 100 Commits, after T1 batch 1 (`56a6424e1`):

| Measure | Commit 1 | Commit 100 | All 100 |
| --- | ---: | ---: | ---: |
| Pack reads of the Commit's producer | 12 | 98 | 7,277 |
| Pack bytes read | 251,747 | 662,818 | 55,552,104 |
| Pooled value groups written | 3 | 3 | 323 |

The count test `product_commit_history_cost` shows the same shape with equal
Commits: 9 pack reads at Commit 1 and 41 at Commit 12, about three more for
every Commit made before.

## Cause

A Save stores the fresh inode values of each changed leaf as one small group,
and all groups of one Commit go to that Commit's own pooled pack. A leaf that
many Commits have touched therefore refers to values in as many packs. Reading
such a leaf, which a Commit does for every leaf it changes and for each
element of the leaf's delta chain (up to 8), acquires each of those packs with
its own Store read. The cost of reading one leaf grows by one pack read for
each earlier Commit that changed a row of it, up to the rows of the leaf.

The same reads are owed by any reader of that leaf, for example the first
lookup after a mount. That was not measured in this run.

## Options

| Option | What changes | Effect on the count | Cost and risk |
| --- | --- | --- | --- |
| A. Keep decoded value groups on the producer handle between Saves | The lifetime of an existing bounded cache (the pooled value cache, bounded in bytes) | Pack reads of a later Commit fall to the groups not yet seen by this handle | A longer cache lifetime, which the rules exclude unless the owner allows it. Values are authenticated when first decoded, not again |
| B. Acquire all packs one leaf needs in one Store read | A new call on Storage's public `Source` trait and its implementations | Read transactions fall to about one a leaf; bytes read do not change | An interface change inside the Storage crate's public surface; no storage cost |
| C. When a leaf is rewritten, write all its values into the new group once it refers to more than a set number of packs | The physical encoding policy of pooled values | Pack reads per leaf bounded by that number for every reader | Duplicate 73-byte values: a storage cost and a new threshold; canonical objects and their identities do not change |

Option B is the smallest and has no storage or memory cost, but it only lowers
the number of round trips. Option C is the only one that bounds the cost for
every reader, including a newly mounted daemon. Option A helps only a daemon
that keeps committing.

## What the owner would decide

1. Whether this growth matters enough to act on: at 100 Commits it is 73 pack
   reads a Commit, inside a 29 ms Commit, and it keeps growing with history.
2. Which option, and for C the threshold and the accepted storage cost.
3. Whether a reader-side measurement (cold lookup of a much-rewritten leaf)
   should be taken first.

## Not proposed

Raising a cache bound, or skipping the authentication of a group on first
decode.
