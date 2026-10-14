# Handoff: continuous simplification, removal, rename and optimization

> **Status:** Current assignment (owner, 2026-10-14). Branch
> `overlay-open-state-cuts` in worktree
> `/Users/yifanxu/Ephemeral-AI-Lab/layerfs-perf-run`, unpushed. Tracked in
> issue #320 (the per-Workspace overlay work was #321, closed).

## 1. What the owner asked

In the owner's words:
- 2026-10-14: "remove aggressively including the tests".
- 2026-10-14: "work as you recommended, including continous simplification, aggressive removal, rename and optimization".

The recommendation is section 4. Its order:
1. Verify and land the branch.
2. Remove what the architecture shift made redundant.
3. Rename the mount path.
4. Then optimize, from measurements.

Work in small counted commits and keep simplifying between them. A removal that only moves code elsewhere is not a removal.

## 2. Where things stand

Two commits on `overlay-open-state-cuts`, on top of `main` at `265843629`:

| Commit | Change | Production LOC |
| --- | --- | --- |
| `11b2a452d` | Open-state maps keyed without the constant namespace; files, reads, lookups and directory handles share one journaled `OwnerTable`; Status open-state counts are map lengths | 80,476 -> 80,299 (-177) |
| `253291435` | Product code only tests reached, removed with the tests that existed for it; elsewhere only the assertions that called a removed observer | 80,299 -> 79,447 (-852) |

Checks run on `253291435`:
- fmt, `python3 -B core/tools/check_product_boundary.py` and the 50 tool tests: pass.
- Whole-workspace Clippy `-D warnings`, host and Linux: clean.
- Host: all 315 test binaries, 30 s each; 1,312 passed, 4 ignored, none timed out. Three failed:
  - two need inputs that aren't on the host: `complete_installed_roots::huge_native_namespace_is_complete_after_install` needs `LAYERFS_Q1_PREPARED`, and `host_handoff::macos_init_handoff_to_linux_daemon_has_no_host_data_path` needs a Linux daemon binary;
  - the third, `captured_namespace::reader_name_and_symlink_jobs_seek_their_sealed_domain_while_the_active_generation_grows`, was fixed by giving the reader's first job its own untimed call, and then passed 5/5.
- Linux: all 43 binaries listed in `core/target/issue321/b-linux-tests.txt` pass.

**Not run:** the fs-bench-pro engine and families suites and the cluster-two suite. They need a sealed build's native inputs and a clean tree.

### Kept on purpose

Only tests call these, but removing them would delete whole suites or a custody or operator capability. Do not remove them without asking the owner:

| Kept | Why |
| --- | --- |
| `Workspace::view_for_source`, `CanonicalClient::with_lengths` | Constructors that about 13 workspace and daemon test modules and a daemon example build on. Replacing `with_lengths` would paste its construction into about 16 test call sites, which the counting rule forbids. |
| `receive_install`, `Service::serve_one`, `serve_one_control` | The entry points of the install tests and the control-protocol fixture. |
| `TimingNode::with_children`, `PackUnit::from_ranges`, `Store::recognizer_work` | How the telemetry, storage and recognizer tests build trees, implement the pack port and observe the recognizer. |
| `Store::stop_reads` and `ReadPool::stop` | The documented whole-Store shutdown. Without them, the read pool's `stopping` state, `ReadAdmissionError::Stopped` and a diagnostics field are set by nothing. |
| `MountRequests::inspect_failure`, `Store::reader_failures` | The only readers of retained failure custody. |
| `Service::retained_native` | Operator observation of retained teardown custody. |
| `native_retained_mount`, `native_state` (daemon and overlay) | The Linux mounted proofs use them: FORGET underflow, detach stages, forced unmount, `native_custody`. |
| `take_connection_failure` | The documented operator custody transfer (from an earlier pass). |

## 3. Binding constraints (unchanged)

- **Checkouts.** Never edit the main checkout `/Users/yifanxu/Ephemeral-AI-Lab/layerfs` or another agent's worktree; `sdk-refactor` belongs to another agent. Gate every build or run on `bash core/target/issue320/busy.sh` and its exit status. Call helpers by absolute path, or the gate sees your own process as busy.
- **Store profile.** Disposable / WAL / synchronous=OFF only. Durable execution: `NOT_RUN — disabled by owner until explicit reauthorization`. Export `LAYERFS_CONSTRUCTION_WORKERS=1`.
- **Toolchain.** Host cargo is `+1.85.1 --locked`. Repeat the profile flags if you set RUSTFLAGS.
- **Time limits.** No command over 2 minutes. Every test gets an explicit limit of at most 120 s. Never retry, loop or background a test, and diagnose before any rerun. One sample per case and source identity; timings on this shared machine are INELIGIBLE.
- **Code rules.**
  - No `unsafe`.
  - Patch third-party code only within the authorized fuser patches.
  - New production files stay under 999 lines.
  - Don't restore `tools/preflight.sh` or anything like it.
  - Never retry an operation or guess a resend.
- **Commits.** `git add -A`, then `python3 -B core/target/issue321/commit.py <message-file>`. It adds the Production LOC line, the line "reference absent (retired R9c; last counted 65,417 at tree 498dd1917812)" and the attribution line.
  - **Counting rule:** never move product code into tests or tools to lower the count.
- **Outward actions.** Every push, merge, issue post or other outward action needs the owner's explicit OK each time.
- **Pins.** Editing a pinned overlay source changes its sha256 in `core/benchmark/fs-bench-pro/engine/oracle.py`; update the pin and run the engine suite. Pinned today: `database/accounting.rs`, `database/physical.rs`, `lifetime/close.rs`, the two overlay SQL files, daemon `overlay/workspaces.rs`, bridge `control_types.rs`.
- **Known state.** Don't "fix" OWNER-3's two passthrough refusals in `check_fuser_integrity.py`; that's a known state on main.

## 4. The work, in order

### 4.1 Verify and land (first)

1. Seal a build of `253291435`; it takes about 105 s, use `core/target/issue321/go.py`.
2. Run the fs-bench-pro engine and families suites with that build's native inputs, then the cluster-two suite (`unittest discover core/benchmark/cluster-two/tests`). Each runs once.
3. Record the result in `core/docs/issues/320/PROGRESS.md`.
4. Ask the owner to push to `origin/main`.

### 4.2 Remove what the architecture shift made redundant

#321 gave each Workspace its own overlay file and replaced the owner thread, queue, credits and completion tracking with one lock per Workspace. Mechanisms that only served one shared database and one writer remain. The order below goes cheapest first.

1. **`Route` and namespace checks inside the overlay.**
   - 38 overlay functions take `route: Route`, and handles (`OpenFile`, `BaseSource`, `LookupOwner`, `FileRead`, `Capture`, …) carry a route that is checked on every call. One `Overlay` holds exactly one Workspace, so these checks always pass.
   - Drop the parameter and the checks in the overlay, together with the helpers that took it only for that.
   - Keep routing in the daemon, where the route picks the Workspace.
   - The mechanics are the same as `11b2a452d`: change the key, follow the compiler, then follow unused-parameter warnings and drop parameters through callers.
2. **Remaining constant namespaces:**
   - `maintenance::Item.ns`, and the `ns` it writes into `cleanup_task` rows if any column still holds it;
   - reply tickets keyed `(ns, revision)` in `lifetime/tickets.rs`;
   - `count(Some(ns))` and `pending(ns)`;
   - the native `mounts` map, which is still keyed by namespace and becomes one journaled slot.
3. **Job/receipt layer → direct typed calls.**
   - Today every daemon call goes through `owner_job`/`overlay_job` closures that return the `Response` or `NativeReply` enums plus a `JobReceipt` (157 mentions in daemon `src`); tests then unpack the enum.
   - Replace this with methods on the Workspace handle: take the lock, call the overlay, return the typed result, and count the work in the same place.
   - Keep the exact-refusal rule: a call refused before any effect returns its original input, as `OwnerError::Unattempted` does.
   - Keep the frontier wait, the readiness checks and the counted work.
   - Shrink `ServiceClass` to what still changes behaviour: Mutation and Source drive the frontier wait; the rest only label diagnostics.
   - This is the largest remaining cut. Expect about 470 test sites; convert them mechanically and delete tests that only checked the old envelope.
4. **Store read pool.**
   - `store/read_service.rs`, `read_state.rs` and `read_handle.rs` (about 600 lines) are fair admission to shared Store readers: per-Workspace lanes, FIFO rotation and a 17 Workspaces × 18 requests quota.
   - With one Store reader per Workspace there is nothing to arbitrate, and it matches the owner's rule that each Workspace's memory is independent.
   - **Ask the owner before you implement this.** It reverses part of the #308/#314 decision of one shared pager. First measure one reader's resident memory with the read-only sampler in `core/docs/issues/321/tools/daemon_memory_sampler.py`, and present that number.
5. **Continue the reachability passes.**
   - After each structural cut, re-run the dead-code and test-only reachability pass.
   - The method is in `253291435`'s message: product `src/` only, with trait methods and functions the benchmark harnesses call counted as live.
   - Also check the Linux-only tests: compile them with the Linux check, since the host never builds them.

### 4.3 Rename the mount path (after 4.2.3, which deletes many `native` names)

- In overlay, workspace, daemon and fuse, `native` means the kernel's view of the mount. Rename it to `kernel`, which the overlay already uses for this state (`KernelReference`):
  - `NativeMount` → `KernelMount`
  - `native_file` → `kernel_file`
  - `native_visit` → `kernel_visit`
  - and the same for the rest.
- Do it as one or two commits with no behaviour change; update the oracle pins and the docs that name these items.
- Leave the other meanings alone:
  - the storage `Native` pack lane, part of the on-disk format (`VERSION_NATIVE`);
  - the persistence/project host-file sense;
  - the bridge's native control channel.

### 4.4 Optimize (measure first)

Priority from the owner (2026-10-13): exec under concurrent Workspaces first, then Commit, then mount. Don't chase a few milliseconds on a Commit, and never buy speed with storage, unbounded memory or benchmark-fitting.

1. **Baseline.** After 4.2, measure time per small file for 1 and 4 Workspaces (`core/docs/issues/320/tools/exec_concurrency.py`) and a Commit beside writers, one sample each. The last known numbers (650–750 µs per small file against 42 µs on the native filesystem) predate #321.
2. **Kernel round trips.**
   - GETATTR was 5,766 of 26,078 requests in the Step C tier-1 sample.
   - The 6.12 kernel invalidates a parent directory's attributes on every create, unlink or rename, and `default_permissions` then asks again. A longer attribute timeout can't prevent it.
   - The fix is mounting without `default_permissions` and having the daemon check permissions itself. That moves permission ownership: measure the request mix on a test mount, then **ask the owner**.
3. **Statements per write.**
   - Each FUSE WRITE is a 7-statement transaction, and a created file is 18 statements.
   - Gathering a file's writes in memory and writing them in one transaction (on release, before a Commit captures, or at a size bound) would cut statements for files written in many pieces.
   - The overlay is disposable, so durability is not the obstacle; exact counts and proof re-pins are. Write a short design first.
4. **Job sizes.**
   - Commit plan steps and cleanup pages were sized for one writer shared by every Workspace.
   - They now only need to keep this Workspace's own FUSE requests flowing during its Commit, a rule the owner kept.
   - Measure Commit time and the latency of concurrent requests at two or three step sizes before changing anything.
5. **In-memory cleanup list.** `cleanup_task` is a durable queue in a database that never outlives the daemon, so it could be an in-memory list like the open state. It changes how a failed cleanup step recovers: design it first.

## 5. Lessons from this pass

- **Removing a function.**
  - Delete the product function, then compile `--workspace --all-targets --keep-going`.
  - For each test error, remove only the statement holding the call, and follow the follow-on "cannot find value" errors.
  - Delete a whole test only when the test exists for the removed function, such as plan, index-shape and envelope tests.
  - A whole-test delete over one incidental assertion lost about 2,000 lines of unrelated coverage and was reverted.
  - Check that removed calls were observers. An action, such as a release or a stop, changes what later assertions see; that test either goes whole or keeps the function.
  - Watch counted-work tests: a removed call may have paid a one-time cost before the measured loop. Give that cost an explicit untimed call with a comment.
  - Look for comments the removal left orphaned.
- **Restoring a removed function.** If removing something makes a product field or state write-only, or empties the only reader of retained custody, restore it. The scratch helper that re-inserts a function from `HEAD` is lost with the session's scratchpad. Re-insert by hand from `git show HEAD:<file>` and check its placement; one restore landed inside a struct definition.
- **Linux builds.** A Linux build killed at its 120 s limit can leave broken incremental objects (undefined `anon.*.llvm.*` symbols at link). Remove only that test target's `incremental/<name>-*` directory and its `deps/<name>-<hash>*` objects under `core/target/issue320/linux-test/debug`, then build again. Build before testing, in pieces if needed.
- **Helpers** (ignored, under `core/target/issue321/`):
  - `t_hostrun.py <from>` runs every host test binary from `t-host-bins.json`, 30 s each, and starts none after 85 s. Regenerate the list from a `cargo test --no-run --message-format json` build.
  - `lbatch.sh <tag> <from>` runs the 43 Linux binaries.
  - `clippy.sh`, `check.py` and `core/target/linux_step.py` run Clippy and checks on the host and in the pinned image.

## 6. Reporting

Each commit message carries the Production LOC comparison, with removed, kept and restored items named and the reason for each kept one. Each section of `PROGRESS.md` states:
- what was measured, with source, build and cache state;
- what was not run, and why;
- every failure, as it happened.

Report a removal that doesn't pay as such, and stop it. Ask the owner on the three decisions marked above: per-Workspace Store readers, daemon-owned permission checks, and every push.
