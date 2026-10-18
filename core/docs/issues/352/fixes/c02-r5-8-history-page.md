# c02 · `mounted_commit::r5_8` (and `r5_5`): a one-page history read

> **Status:** fixed on branch `claude/issue352-correctness-644bbc` (correctness
> lane, 2026-10-18). This is a test defect, not a product bug. Test-only change;
> production LOC unchanged.

## Symptom

`r5_8_five_incremental_commits_on_one_mount_each_read_back_completely` makes
five Commits and expects the newest five records in `rig.history()`. It gets 3.
`r5_5_a_commit_at_each_parked_step_…` failed at the same kind of assertion.
Both were recorded as pre-existing (F-020 record, LESSONS).

**Does it fail on `dsh-history-replay`?** Yes. It was run on Linux (pinned image
`378b799ef433`) at `fad2ca3f3`, which is `dsh-history-replay` `b885c55d4` plus
the F-036 storage fix only (no History code). Result: `left` holds 3 ids,
`right` holds 5, at `mounted_commit.rs:638`. #354 saw the same failure with and
without its changes.

## Cause

History pages are bounded in bytes as well as in records
(`layerfs-history/src/contract/query.rs` `capacity`): a page holds
`min(limit, (16 KiB − cursor − 16) / CommitRecord::MAXIMUM_ENCODED_BYTES)`
records. If the limit does not fit, it returns a continuation. Commit-v3
(`555e85d89`, 2026-10-15) raised the widest Commit record from 504 to 4,510 B
(Commit metadata with a message of up to 4 KiB). So a page now holds 3 records:

(16,384 − 160 − 16) / 4,510 = 3 (integer division), so each page holds 3 records and a continuation, as the test output shows. The
product follows its contract: `branch.list_commits` (`store-service
sdk/branch.rs`) walks continuations. The test helper `Rig::history()`
(`layerfs-daemon/tests/support/mounted_commit.rs`) read only the first page.

## Fix

`Rig::history()` now follows continuations until it holds `HISTORY` (32)
records or the ancestry ends, the same way the SDK does. No assertion is
changed: r5_8 still requires exactly its five Commits, newest first, and r5_2
still requires equal record lists and continuations.

| Target (Linux, own container each) | Before | After |
| --- | --- | --- |
| `mounted_commit` | r5_8 FAIL (3 of 5) | 7/7 pass, 0.55 s |
| `r5_5_install_survival` | r5_5_a FAIL (recorded in F-020) | 4/4 pass, 0.69 s |
| `mounted_cycles` (same helper) | — | 4/4 pass, 2.07 s |

Clippy `-D warnings` is clean on the three targets. rustfmt is clean on the
helper.

## Product observation (owner decision, not done here)

A page is packed by the **widest possible** record, not the actual one. A
typical Commit record is a few hundred bytes, yet each page carries about 3.
`branch.list_commits` re-walks from the head to skip `pos` records, so
listing deep history costs about pos/3 History transactions per SDK page.

Option: pack pages by each record's actual encoded width, which stays within
the same 16 KiB budget. This changes `layerfs-persistence/src/history/commit.rs`,
which #353 owns, and the frozen catalog/codec agreement in
`records.rs`. It is not done in this lane; it is queued for the owner.
