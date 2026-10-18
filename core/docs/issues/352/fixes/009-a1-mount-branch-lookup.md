# Range 009 a1 · a mount finds its Branch by name, not by listing every Branch

| | |
| --- | --- |
| Trigger | `p2-main-b` range 9 attempt 1 (daemon `c25119ac`, addon `5baa0f5d`): Counters `oneshot_mount_exec.vm_steps` depth exponent 0.971 over ranges 7–9 (threshold < 0.05) |
| Playbook step | D4 (the work grows with something other than the call's input: the number of Branches) |
| Kind | 1 forward-only (REBUILD.md): an optional argument and a code path; no Store format change |
| Old Stores | open unchanged (no schema change) |
| Old data | still read as before |
| Compatibility test | **passed**: a range-4 fork of `p1-pilot-b` written by `511dceed`, read by daemon `58a60046` through addon `799e3ca6`, passes the whole-tree proof checkpoint (530 files, 283 blob ids, 285 changed paths) with `dsh/tools/history/compat.mjs` |
| Binaries | daemon `c25119ac…` → `58a60046739f3fb1e8c675274cf34afb1f867c08c5cf03db21eb35a2abb569b9`; addon `5baa0f5d…` → `799e3ca61215b723af2dcbe562f31edf918d79f923cd0cce22aca8158c879fb1`. All four are kept in `core/target/issue352/` |
| Commits | the commit that adds this file, on branch `dsh-352-f009`. Regression test `core/crates/layerfs-daemon/tests/sdk_mount_lookup.rs` |
| Recovery | (lead) fork `p2-main-b`'s range-7 snapshot (attempt 2), fast-forward range 8, and rerun range 9 measured on daemon `58a60046` and addon `799e3ca6`. Both binaries change: the client sends the name, and the daemon answers from the index |

## Diagnosis (counters)

The probe's trace splits its SQL by exchange. Only the first exchange of
`sandbox.mount` grew:

| Range | Statements | VM steps | Rows |
| --- | --- | --- | --- |
| 7 | 4 | 786 | 64 |
| 8 | 4 | 954 | 78 |
| 9 | 9 (two pages of the writer's B-tree walk) | 1,194 | 96 |

All other exchanges were constant: 40 statements and 1,028 VM steps for the
bind, and 4 statements and 61 VM steps for the install.

That exchange is `project.list_branches`. `layerfs-api`'s
`Mount::mount_branch` (`sandbox/mount.rs` at `efe5dfbd7`) found a Branch id by
paging through `project.list_branches` and searching the items for the name.
Every Branch the replay makes, about 7 per range, adds to every mount's work.
The earlier fix (range 2) made fork and reads look Branches up by the name
index, but the mount's client-side search was left on the listing.

## Old and new design

- **Old:** a mount resolved the Branch name by listing every Branch of the
  project, so its cost was O(Branches).
- **New:**
  - `project.list_branches` accepts an optional `name`. With it, the daemon
    answers from the name index through `args::branch` (the read-only
    session, F-018). The answer is that one item, `main`'s item, or none,
    always with `hasMore: false` (`sdk/branch.rs`; the item builders
    `item`/`main_item` are now shared with the listing).
  - `mount_branch` sends the name.
  - An older daemon ignores `name` and lists as before. The client's search
    still finds the Branch, so a new addon works with an old daemon.

## Proof

`sdk_mount_lookup.rs`, written first. It looks up `lane-00005` by name with
10 and with 1,000 Branches. It asserts:

- exactly one item, with an id;
- equal statements, rows and VM steps at both counts;
- one item for `main`, none for an absent name.

On old code it failed: the call returned the full listing (11 items). On new
code it passes: 6 statements, 2 rows and 53 VM steps at both counts.

Other checks:
- `sdk_branch_count`, `sdk_compare`, `sdk_project_count`,
  `concurrent_commits`, `sdk_history_depth` and `sdk_reads_during_publish`
  pass.
- Clippy `-D warnings` is clean for `layerfs-daemon` and `layerfs-api`.

## Performance, old vs new

Setup: the `oneshot_mount_exec` sequence (mount, `exec true`, unmount) on
forks of `p2-main-b`'s range-7 and range-9 snapshots, one fork per arm. A warm
run came first, then the measured run. Each fork used a fresh daemon on a
just-restored Store file. Counters are the probe's SQL summed over its
exchanges.

| Snapshot | Old (`c25119ac`/`5baa0f5d`): statements / VM steps / rows | New (`58a60046`/`799e3ca6`): statements / VM steps / rows |
| --- | --- | --- |
| range 7 | 51 / 1,923 / 191 | 50 / 1,140 / 126 |
| range 9 | 56 / 2,331 / 223 | 50 / 1,140 / 126 |

- **Branch lookup exchange:** 834 → 51 VM steps at range 7, and 1,242 → 51 at
  range 9.
- **Depth:** new VM steps are equal at both snapshots, so the exponent over
  ranges 7–9 is 0.
- **Client time:** the mount takes 7–9 ms in both arms. The difference is
  below noise in one sample.

Storage is unchanged.

## Cost

- One optional request field.
- Production LOC 96,440 → 96,469 (+29): the by-name branch of the listing
  and the shared item builders.

## Left open: S1 `fs.rm` 9.69× → 11.84× (commit phase)

This is not caused by the mount. In the `p2-main-b` traces, `fs.rm`'s Commit
time is in-lane merges with a moved head:

| Range | `fs.rm` calls that merged | Commit p50 | Merge p50 |
| --- | --- | --- | --- |
| 7 | 4 of 23 | 6.3 ms | 45 ms |
| 8 | 16 of 26 | 21.9 ms | 7 ms |
| 9 | 13 of 13 | 53.8 ms | 35.5 ms |

The other phases (bind, construct, finish, publish) are flat. This is the
OPTIMIZATIONS.md watch "merges inside the publication lane" (F-017/F-018).
It is recorded there, not fixed here.
