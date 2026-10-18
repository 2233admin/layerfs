# F-029 · a Sandbox call refreshed discovery for every mount

| | |
| --- | --- |
| Trigger | Liaison, during 013.a1 (BUGS.md F-029). Traced exec p50 was 49.6 / 57.0 / 70.9 / 107.0 ms at 1 / 4 / 8 / 16 mounts in one Sandbox. With 1 Sandbox × 16 Workspaces and 16 concurrent `true`: 842 ms traced, 97.4 ms untraced, against 62.2 ms for 16 Sandboxes × 1 Workspace. Each traced exec sent 16 status calls (~292 ms) and waited ~480 ms on the Sandbox's control connection |
| Playbook step | D3 (a per-call cost growing with something other than the call: the Sandbox's mount count) |
| Kind | 1 forward-only (REBUILD.md): addon code path only. No Store, daemon or record format change |
| Old Stores | not involved |
| Old data | Sandbox and mount records unchanged; old records read as before |
| Compatibility test | not applicable: the records' format is unchanged, and the test's child process reads the records the parent wrote |
| Binaries | daemon `57141b57` unchanged; addon `438bae05` → `2e0c53dfdaa8a64cf0b9a38aacc59a773c53067548754e3a94ddf59069ea0b3d` (`sdk-linux-2e0c53df/`, from `3e632716a`, measured below) → `05b8bd075a959ec23c7d29e32a755b4ae85ab38f25fc4f8825ed6442df42b28a` (`sdk-linux-05b8bd07/`, with the lead's stale-entry refresh; the hot path is unchanged, so not re-timed). Each 3.5 s warm |
| Commits | fix `3e632716a` on branch `dsh-352-f029-discovery` |
| Regression test | `sdk/js/test/verify/exec_mount_lookup_real.mjs` |
| Recovery | none needed: no Store change. Runs pick up the new addon at the next re-baseline |

## Cause

`registry::sandbox()` (`sdk/js/native/src/registry.rs`) ended with
`discovery::refresh()`. That lists the Sandbox's record folder and sends one
daemon `workspace.status` per mount record, over the Sandbox's control
connections, before every Sandbox call: exec, status, commit, mount,
unmount, close and the process calls. The refresh exists so a process sees
mounts and processes that another process sharing the Sandbox made or
removed (F-017). An exec needs only its own mount's directory.

## Fix

- `registry::sandbox()` returns the Sandbox with this process's tables as
  they stand. It makes no daemon call.
- Calls that name a mount (exec, status, commit) go through
  `SandboxState::mounted(path)`:
  - **Known path, record present:** used directly. The record is one local
    `stat`.
  - **Known path, record gone:** another process unmounted it. One full
    refresh (lead review, `REVIEWSHA`), which replaces the table, then the
    lookup: whatever is mounted there now, else `NotMounted`. The daemon
    never reuses a namespace or its directory
    (`layerfs-daemon/src/control/serving.rs:31`), so today that path stays
    unmounted. The refresh keeps the answer right if a directory is ever
    reused.
  - **Unknown path:** one full refresh, then the lookup. This covers a mount
    another process made.
- `sandbox_refreshed()` keeps the full refresh for calls that need every
  mount or process another process may have changed: close, unmount (its
  running-process check), process list and cancel.
- Daemon-side calls still check the token itself, so status and commit on
  a Workspace unmounted by another process between the `stat` and the call
  get the daemon's refusal. Before the fix the same race existed between
  the refresh and the call.

## Proof

`exec_mount_lookup_real.mjs`, run in the runtime image (2.4 s):

- process A mounts 4 Workspaces and traces one `sandbox.exec`;
- the exec's trace line carries 0 daemon exchanges, while a `sandbox.status`
  carries its 1;
- a child process sharing `LAYERFS_HOME` mounts a fifth Workspace and
  unmounts one of A's;
- the child also mounts a sixth after its unmount; the sixth gets a new
  directory, as the daemon never reuses one;
- A then execs in the fifth (found from the shared records), is refused
  `NotMounted` in the removed one (after one refresh), execs in the sixth,
  and still execs in the other three.
- On `05b8bd07` the test passes in 2.8 s.

Revert check: on addon `438bae05` the test fails at the exchange count. The
exec line carries the per-mount status exchanges.

## Performance, old vs new

One sample per arm, run back to back in the lead's quiet window (opened
06:03:23Z, builder quiet). Script `core/target/f009/f029-bench.mjs`; receipts
`core/target/f009/f029-bench-{old,new}.json` and `f029-bench-load.txt`.

- **Setup:** daemon `57141b57` on both arms, image `d3773b4e`. Each arm gets
  its own fresh Store volume and Init, and one Sandbox.
- **Sequential:** mounts grow 1 → 4 → 8 → 16, with 20 sequential
  `exec true` calls on mount 0 at each count.
- **Concurrent:** at 16 mounts, 5 rounds of 16 concurrent `exec true`, one
  per mount, first on the traced client, then on an untraced one.
- **Arms:**
  - old: addon `438bae05`, 06:03:45–06:03:59Z, 1-min load 9.29 → 9.07;
  - new: addon `2e0c53df`, 06:03:59–06:04:05Z, 1-min load 9.07 → 8.58.

| `sandbox.exec`, p50 / p90 ms | Old | New |
| --- | --- | --- |
| sequential `exec true`, 1 mount, traced (n 20) | 40.05 / 43.95 | 29.3 / 43.55 |
| sequential `exec true`, 4 mounts, traced (n 20) | 50.81 / 57.29 | 36.23 / 44.73 |
| sequential `exec true`, 8 mounts, traced (n 20) | 65.2 / 69.91 | 34.85 / 42.52 |
| sequential `exec true`, 16 mounts, traced (n 20) | 109.13 / 117.41 | 19.34 / 39.8 |
| 16 concurrent across 16 mounts, traced (n 80) | 845.87 / 870.36 | 56.03 / 61.04 |
| 16 concurrent across 16 mounts, untraced (n 80) | 93.17 / 100.68 | 54.03 / 102.74 |

Reading:
- **Traced concurrent case.** Old matches the liaison's figure (845.9 ms
  p50, against 842). New is 56.0 ms, near the liaison's 16 Sandboxes × 1
  Workspace figure (62.2 ms).
- **Sequential calls.** Old grows with the mount count: 40 → 51 → 65 →
  109 ms. New stays between 19 and 36 ms, which is exec launch noise at one
  sample. It no longer grows with mounts.
- **Untraced concurrent case.** p50 falls from 93.2 to 54.0 ms, but the
  new p90 is 102.7 ms. That tail is Docker exec launch, which Engine
  connection reuse (item 3) measures next.

## Cost

One `stat` of the mount record per call that names a mount. The full
refresh is unchanged on close, unmount and the process calls.
