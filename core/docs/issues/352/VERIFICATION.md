# #352 verification of the RCA agent's stop points (records 016–021)

> **Status:** independent read-only audit by the correctness lane, 2026-10-18.
> Nothing was built, run or edited in the audited worktrees. Sources:
> `issue359-impl` (8ef8dfbfa), `issue359-cost-model` (331f2c173),
> `issue360-storage` (d36a14159); receipts in `~/lfs-history/runs/issue359/`,
> `~/lfs-history/runs/issue360/` and `~/lfs-history/runs/i360-r14-{old,new,final}/`.
> The audit used a read-only subagent; the lane spot-checked its three FAIL
> causes itself (see "Spot checks").

## Checks

For each record, seven checks:
1. Cache state is declared and matches what the harness did.
2. One sample per arm.
3. Outputs are equal to native, or to the stated oracle.
4. Binaries are pinned by hash.
5. Interference is recorded.
6. No workload or timeout was changed.
7. The `Production LOC` lines are right (`tools/production_loc.py --root`, same
   counter blob `efd11103…` at every commit).

## Verdicts

| Record | Branch | Verdict | Cause |
| --- | --- | --- | --- |
| 016 #360 item 2, inline portable metadata | issue360-storage | **FAIL** | LOC line wrong on `c4d9893e7`. Undisclosed second old Init sample. Timing cache state undeclared. |
| 017 F-B4, negative entries | issue359-impl | **FAIL** | Claims the cold arm dropped the page cache; the harness drops nothing. |
| 018 READDIRPLUS (parked) | issue359-impl | PASS-WITH-NOTES | Some proof logs not retained. |
| 019 F-B2, orphan probe | issue359-impl | PASS-WITH-NOTES | 149 s command breach, which the record discloses. Cache state not stated. |
| 020 A1 re-measure | issue359-impl | **FAIL** | Same false "page cache dropped" claim. |
| 021 D-9 sizing (diagnostic) | issue359-impl | **FAIL** | Same false claim. No native arm in the samples. |

The FAILs are about labels, cache claims and one LOC line. **Every #359 table
value matches the retained samples, and every count-driven conclusion
survives:** lookups, statements, requests and owner jobs. What does not qualify
is any wall-time claim labelled "cold" (policy §1).

## Findings

1. **Cold-cache claims are false in records 017, 020 and 021.**
   - The records say the cold arm has the page cache dropped.
   - `dsh/tools/history/cost.mjs` (the same blob on every branch) has no drop,
     eviction or residency check.
   - Its own header says the Store file is resident in the VM page cache for
     every arm, "declared, not controlled".
   - So the "cold" rows are Store-warm. The arms share one harness contract, so
     comparisons of counts between arms stand. Cold wall-time claims do not.
2. **`c4d9893e7` (#360) has the wrong LOC line.**
   - It says `97,379 -> 97,443 (delta +64)`.
   - Its parent `72782bfaa` counts 97,396, so the line should read
     `97,396 -> 97,443 (delta +47)`.
   - All 36 other commits in `dsh-history-replay..issue359-impl` and
     `..issue360-storage` match exactly.
3. **#360 has an undisclosed repeated arm.**
   - `issue360/init-old-1792319690243` completed its timed Init (23,677 ms) but
     wrote no `result.json`.
   - A second old Init, `init-old-1792319721651` (23,158 ms), is the one
     reported ("23.2 s → 23.1 s").
   - Record 016 does not mention the first sample.
4. **Some #360 claims rest on an intermediate binary.**
   - The stat probe, the Init comparison and the p4/p5 proof used daemon
     `76816d87` (from `683666d45`), not the final `928b2872`.
   - The record's performance section says "New: the final".
5. **The command budget was exceeded.** Most #359 samples exceed the §3.7
   budget (15 s, or 25 s with a declared exception) with no declared exception.
   For example, cp-rm-nm took 66–106 s and grep-r 54–77 s.
6. **Receipt source identity is ambiguous.**
   - `manifest.ids.source` records the worktree HEAD at sample time.
   - All baseline samples record `8b4fcef25`, while the binaries are from
     `ee7e0fc51`.
   - Hashes are pinned and match. Only the hand-written `binaries.json`
     attests the build source.
7. **The receipt store changed during the audit.**
   - The ledger grew from 314 to 322 lines, and `table-a1.json` was regenerated.
   - Tables are derived from the newest sample per case, so the samples are the
     evidence, not the tables.
8. **The cherry-picks on the D-9 diagnostic branch carry the source branch's
   absolute LOC numbers.**
   - Affected commits: `77a363837` and `7119ed3b2`.
   - Their deltas are right; record 021 is outside the integration scope.

Per-record detail (every check, every number recomputed) is in the
subagent's report, kept in the lane's notes at
the liaison notes folder as `correctness-verification-detail.md`.

## Spot checks by the lane

| Claim | How checked | Result |
| --- | --- | --- |
| cost.mjs drops no cache | `git show issue359-impl:dsh/tools/history/cost.mjs`: lines 15–22 read; grep for `drop_caches`, `vmtouch`, `posix_fadvise`, `evict` | 0 matches; header says resident, "declared, not controlled" |
| 017 claims a dropped cache | record line 78 | "dropped page cache" present |
| `c4d9893e7` LOC | `git archive 72782bfaa core/crates sdk/js dsh/packages`, then `production_loc.py --root` | 97,396 combined; the message says 97,379 |
| Two old Init samples | `ls ~/lfs-history/runs/issue360/` | both directories exist; the first has a manifest and trace and no result |

## Asks for the RCA agent (the lane edits none of this)

- Relabel the cold arms of 017, 020 and 021 as "fresh mount, Store-warm
  (declared, not controlled)". Alternatively, add a real drop with a residency
  check before making any cold claim.
- Correct the LOC line for `c4d9893e7` in the 016 record. A commit message
  cannot be amended once it is shared.
- Disclose `init-old-1792319690243` in 016, and name the binary used for the
  stat, Init and p4/p5 rows.
- Declare budget exceptions for the long #359 cases, or split them.
