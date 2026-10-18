# F-028 (before range 12) · an apply step rewrote files it does not change

| | |
| --- | --- |
| Trigger | Lead, from the liaison's Commit-model reading: r012.s0021 (one file, `expect: UpToDate`) would return Committed, and the player throws Mismatch. No range played or measured with this script |
| Kind | harness only (owner-approved); no product change, no Store or daemon change |
| Old Stores | unaffected |
| Fix kind (SPEC §6) | the player's Sandbox apply script (tooling) |
| Binaries | unchanged |
| Commits | the commit that adds this file; unit test `dsh/tools/history/tests/runner.mjs` ("F-028: …"); replay check `dsh/tools/history/check-apply.mjs` |
| Recovery | none needed: ranges 0–11 have no affected apply step that played; range 12 plays with the fix |

## Finding

`sandboxCommands` (`dsh/tools/history/steps.mjs`) put every regular file of an
apply step in place with `base64 -d > path`, then `chmod`. Rewriting a regular
file through the mount sets its mtime, and the root records mtime today. So a
step whose bytes and modes all equal the lane's tree still changed the
Workspace. Its Commit returns Committed, while `sandboxExpect` expects
UpToDate. The old comment said "equal bytes and mode leave the Workspace
unchanged", which is wrong.

Plans 0–98 hold 22 all-identical apply steps: r012.s0021, r020.s0018,
r026.s0009, r026.s0015, r033.s0072, r039.s0094, r039.s0196, r040.s0047,
r041.s0140, r054.s0225, r061.s0046, r061.s0149, r063.s0091, r067.s0157,
r068.s0046, r068.s0078, r069.s0176, r074.s0041, r086.s0203, r086.s0245,
r098.s0021 and r098.s0060. They also hold 10 mixed steps whose identical files
also had their mtime churned: r004.s0016, r026.s0017, r026.s0131, r043.s0168,
r061.s0094, r072.s0019, r072.s0020, r072.s0077, r072.s0144 and r098.s0066.
Plans 99–200 hold 27 more all-identical steps and 11 more mixed steps, all
covered by the same rule.

## Fix (lead decision)

`sameAsTree(f)` holds when a regular file's blob and mode equal the lane's
expected tree entry (`previous`, from `route`). `placeEntries` marks such a file
`same`. `sandboxCommands` neither sends its bytes nor rewrites nor chmods it.
The rule applies per file, in every apply step, mixed steps included. Symlinks
were already replaced only when their target differs.

`sandboxExpect` is unchanged: such a step still expects UpToDate. Whether an
mtime-only change should count as a change is the owner's open question.

## Evidence

- **Unit test** (`tests/runner.mjs`, 15/15 pass):
  - A mixed step leaves its identical file's mtime at 2000-01-01, and the script never names that file.
  - The changed file and the mode-changed file are written.
  - The pre-fix script, sent the same file without `same`, moves its mtime.
- **Replay check** (`check-apply.mjs`, plan 0–98's 32 affected steps, real blobs from `dsh.git`):
  - Each step's script was built as the player builds it and run by sh on a folder holding the lane's expected files.
  - All 22 all-identical steps expect UpToDate and leave every byte, mode and mtime unchanged.
  - In the 10 mixed steps, every identical file is unchanged and every changed file is right.
  - r012.s0021: `{"expect":"UpToDate","same":true,"unchanged":true,"ok":true}`.
  - This is a local filesystem replay. No LayerFS Commit ran (no measured play).
- **Commit-model evidence:** the liaison scratch `commit-model/B` (Stores of range 9 `p2-main-c` and range 11 with the rebuild queries).
