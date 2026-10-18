# #352 — Direct Store access: implementation spec (F-020)

> **Status:** Current, owner direction 2026-10-18: "go with a", then "create an
> implementation spec, and also treat it as a fix". Implements
> [DIRECT_STORE.md](DIRECT_STORE.md), which keeps the decision, the safety
> condition and the proofs; this file says how to build it. Tracked as finding
> **F-020** (BUGS.md) with the fix record
> [fixes/007-a1-f020-direct-store-access.md](fixes/007-a1-f020-direct-store-access.md).
> Owner: the fixer builds, the builder moves the runner, the lead accepts.
> **Owner direction 2026-10-18 (second):** one route only, the direct one, Linux
> only. The daemon no longer serves Store calls, and tests of the old route are
> deleted, not converted (§3 steps 1 and 5).
> Binding under the non-stop rule: no question to the owner; where this file is
> silent, choose the option that keeps one attempt per operation, no fallback,
> and the least new code, and record the choice in the fix record.

## 1. Why this is a fix

Store calls (fs, branch, project, operator) need nothing from a Sandbox, yet
today every one of them crosses a control connection into a daemon inside a
Sandbox. F-017 and F-018 removed the queues on that route; the round trip
itself remains. On `rb-p2-c25119ac-5baa0f5d`, range 4, attempt 1 (daemon
`c25119ac`, addon `5baa0f5d`), the client time vs the traced daemon work, p50:

| Call | n | Client | Traced daemon work | Gap |
| --- | --- | --- | --- | --- |
| fs.read | 62 | 4.48 ms | 0.12 ms | 4.36 ms |
| fs.stat | 52 | 4.11 ms | — (not traced) | 4.11 ms |
| fs.list | 59 | 5.34 ms | — (not traced) | 5.34 ms |
| fs.grep | 61 | 6.13 ms | 0.49 ms | 5.64 ms |
| fs.diff_files | 56 | 5.46 ms | 0.15 ms | 5.31 ms |
| fs.write | 619 | 11.69 ms | 5.99 ms | 5.70 ms |
| fs.rm | 107 | 10.91 ms | 5.59 ms | 5.32 ms |
| fs.apply | 135 | 12.54 ms | 6.47 ms | 6.07 ms |
| branch.fork | 11 | 2.65 ms | — (not traced) | 2.65 ms |

Reads are about 95% outside the traced work. Workspace calls (mount 12.3 ms,
exec 39.3 ms, Workspace Commit 11.7 ms, unmount 6.2 ms) are out of scope.

**Expected, not promised:** reads toward 1–3 ms p50, writes toward 6–7 ms
p50. Step 0 says which end; the old-vs-new table (§7) is the answer.

## 2. Architecture after the fix

```
Node process (runner container, Linux)
  SDK JS ─▶ addon dispatch ─┬─ Store calls: layerfs-store-service, in-process
                            │     └─ global Store file on the shared volume
                            └─ sandbox.* (mount, exec, Commit, status, unmount)
                                  └─ control connection ─▶ daemon
```

- **One implementation of every Store call.** The daemon's SDK functions move
  into a new library crate, `layerfs-store-service`, called by the addon
  through `dispatch(method, args, bodies)`; nothing is rewritten. The daemon
  keeps using the crate's `store/` and `overlay/` for Workspace Commits only.
  Equivalence with the old binaries is proved (§3 step 5).
- **Same argument and reply values.** Direct calls pass the same `SdkCall`
  values (`layerfs_bridge::control`) the wire carries, without the socket,
  framing or a second process. A typed API is a later cleanup, not this fix.
- **One route, Linux only.** Store calls always run in-process. Where the
  kernel guard fails (macOS, a non-local filesystem) they fail `Unsupported`
  with the reason; there is no daemon route to fall back to or to choose. The
  SDK process (the replay runner, the dsh web app) runs in a Linux container
  on the Store's volume. `project.init` keeps its current host Init: it creates
  and seals a new Store before any daemon or other opener exists.

## 3. Steps

Each step is one commit (or a few) with its production LOC line. No step
starts a measured range; the builder keeps playing P2 ranges on the current
route until step 6.

### Step 0 · Attribute the gap (read-only, about 15 minutes)

From existing traces only, plus one unmeasured diagnostic:
1. the bare round trip: `operator.store.stats` client time (it does almost no
   work) on the same run;
2. the untraced daemon work: wrap stat, list, fork and the control loop's
   decode/encode in the existing phase timers on a dev build, one diagnostic
   run, labeled diagnostic;
3. record round trip vs encoding vs untraced work per method in the fix record.

The result sets the expected gain. It does not gate the build (the owner chose
A); it tells the lead whether reads should land near 1 ms or near 3 ms, so the
§7 table is judged against a stated expectation.

### Step 1 · Extract `layerfs-store-service` (relocation)

Move, unchanged in behaviour, into `core/crates/layerfs-store-service/`:

| From `layerfs-daemon/src/` | Why it moves |
| --- | --- |
| `store/` | Store ports, Commit, merge, publish, readers: used by Store calls in the addon and by the daemon's Workspace Commits |
| `sdk/` | every Store call's implementation and its dispatch table |
| `operator/files.rs`, `inspect.rs`, `store.rs` | operator Store calls |
| `overlay/` | the owner of the private overlay that `fs.write`, `fs.edit`, `fs.apply` and recursive calls construct through (`sdk/files.rs`, `mutation.rs`, `recursive.rs`); FUSE-free today |

Rules:
- **The crate has no `layerfs-fuse`, no control socket, no Sandbox and no
  daemon `Service`.** `sdk::dispatch` takes a `&StoreService` (the Store, the
  overlay template and the private-owner factory) instead of
  `&control::Service`. The daemon's `Service` holds one `StoreService`.
- `operator/workspace.rs` and the operator dispatch for Workspace calls stay in
  the daemon.
- Label it **relocation** in the LOC line: the moved code is counted under the
  new crate, the daemon shrinks by the same amount, and the combined delta
  comes only from the new `StoreService` seam.
- Files keep the 999-line ceiling; the new `lib.rs` stays a declaration file
  under 200 lines.
- **The daemon stops serving Store calls.** Its control channel keeps only
  Workspace calls (mount, exec, Commit, status, unmount) and the operator
  Workspace calls; the SDK dispatch over the wire and the operator Store calls
  are removed from it. A Store call arriving on the wire is refused as an
  unknown method. The daemon binary is re-identified.
- **Old-route tests are deleted, not fixed.** Every test that drives a Store
  call through the daemon's control channel (daemon crate tests of the SDK
  dispatch, addon tests of the pooled Store path, `sdk/js/test` cases that
  only exist for the daemon route, such as `concurrent_reads_real.mjs`) is
  removed in the same commit. List each deleted file in the fix record. Tests
  of surviving behaviour (Workspace calls, Store internals now in the new
  crate) move with their code and keep passing (each test command ≤120 s).

### Step 2 · Kernel guard (`kernel_guard.rs` in the new crate)

`StoreService::open_direct(path)` checks, before opening any file for write:
1. the platform is Linux, otherwise `Unsupported: direct Store access needs the
   daemons' Linux kernel`;
2. `statfs` of the Store's directory reports a local filesystem on an
   allowlist (ext4, xfs, btrfs), otherwise `Unsupported: <fs name or magic> does
   not carry SQLite locks between kernels`. NFS, CIFS, 9p, virtiofs and FUSE
   are never allowed;
3. the Store file exists and is a sealed, installed Store (the same check the
   daemon's open makes).

Then it opens the Store with the **Disposable** profile selected explicitly
(WAL, synchronous=OFF, page size 4 KiB, the existing writer admission). No
busy handler, retry or fsync is added; the direct opener behaves as one more
daemon would.

### Step 3 · In-process Store calls in the addon (`sdk/js/native/src/direct.rs`)

- One `StoreService` per Store path per process, opened on first use and
  shared by every client of that process; closed when the last client closes.
  It is never sealed by the addon (a live opener, like a daemon).
- Private overlays for fs writes are created in the process's local temp
  directory (inside the container, a local filesystem), from the template, and
  deleted when the call ends, as the daemon does. No fsync, nothing reserved.
- Calls run on the libuv pool as today (`UV_THREADPOOL_SIZE` from F-017 stays).
  Reads use the read-only session (F-018); writes take the Store's writer
  admission once.
- One attempt: a refused or failed call returns its exact error; nothing is
  resent.
- **Trace:** the same line shape; the phase timers are the work, and `queue`
  records the libuv wait and the writer-admission wait.
- `dispatch.rs` sends Store calls to `direct.rs` and `sandbox.*` to the
  control connection; `pool.rs` serves `sandbox.*` only, and the Store-call
  code paths through it are deleted.
- JS (`sdk/js/src/client.js`): `createClient({ storePath })`, documented in
  `sdk/js/README.md` with the Linux-only requirement. No route option.

### Step 4 · Runner container (builder)

As DIRECT_STORE.md §3.1: `layerfs-issue352-runner`, from the
`layerfs-352-runtime` image (Node 24), mounting the Store volume, `~/lfs-history`
and the checkout, with the Docker socket for creating Sandboxes. The image id,
the addon id and the daemon id are recorded in every metrics file. Measured
ranges run only from this container.

### Step 5 · Proofs (fixer; each command ≤120 s, under 10 s where possible)

1. **Locking test** (`sdk/js/test/verify/direct_locking_real.mjs`): the
   in-process SDK and two daemons in separate containers on the shared volume write to
   one Store concurrently, barrier-ordered: Commits to the same Branch and to
   different Branches, a merge, and reads during publication. Every publish is
   applied once or refused with its exact outcome; `PRAGMA integrity_check`
   passes; final heads equal a serial oracle.
2. **Refusal test:** opening from macOS and from a non-local filesystem
   (a FUSE or bind-mounted path in the container) fails `Unsupported` before
   any write; the Store file's bytes are unchanged.
3. **Equivalence with the old binaries** (`direct_equivalence_real.mjs`):
   every Store method the SDK exposes, run on two forks of the newest
   `p2-main` snapshot, one through the kept old binaries (daemon `c25119ac`,
   addon `5baa0f5d`) and one in-process with the new addon, gives equal
   replies (errors included) and equal Store contents (objects, roots, Branch
   heads) after the same sequence. The old binaries are evidence only; they
   are not a product route.
4. **Compatibility (REBUILD.md kind 1):** the direct route opens the newest
   `p2-main` snapshot written by daemon `c25119ac` and passes the whole-tree
   proof checkpoint with `compat.mjs`.
5. **Surviving suites** of the daemon, the new crate and the SDK, after the
   old-route tests are deleted.

### Step 6 · Old vs new, then switch

On the same snapshot fork, same cache state, one sample per case, each series
labeled with its binaries: the probes and the trace p50/p95 for fs.read,
fs.stat, fs.list, fs.grep, fs.write, fs.apply, branch.fork, branch.merge,
branch.publish, plus SQL statements per call, old binaries (daemon
`c25119ac`, addon `5baa0f5d`) vs the in-process SDK (new ids). The table goes in the fix record.

Then, at a range boundary: re-measure the P2 baseline on the direct route
(ranges 0–4 on a fork of the range-4 snapshot, a new series beside the old,
never mixed), and continue `p2-main` from the next unplayed range on the
direct route. Earlier ranges are not replayed; their reports keep their labels.

## 4. Acceptance

| Check | Required |
| --- | --- |
| Locking, refusal, equivalence, compatibility | all pass |
| Surviving daemon, crate and SDK suites | pass; old-route tests deleted and listed |
| Read p50 (fs.read, stat, list) | lower than the old binaries on the same snapshot |
| Write p50 (fs.write, apply, rm) | not higher than the old binaries |
| SQL statements per call | equal to the old binaries (same code) |
| Store bytes after the equivalence sequence | equal to the old binaries |
| Workspace calls | still through the daemon; p50 within noise of the old baseline |

A miss is a finding under the playbook, not a reason to bring back a daemon
route or change the gate. If reads do not improve, the cause goes in the fix
record (step 0's
attribution says where to look).

## 5. Expected layout

Scope: production LOC from `tools/production_loc.py --files` at `a5a0915cd`;
the `core` scope (`core/crates/*/src`) and the `sdk` scope
(`sdk/js/native/src`, `sdk/js/src`). Only the directories this fix touches are
shown. Tests live in `sdk/js/test/verify/` and the crates' `tests/`.

```
layerfs-store-service/src/          [7874]  new crate (relocation, from layerfs-daemon)
  lib.rs                               —   new (declarations, StoreService)
  kernel_guard.rs                      —   new (step 2)
  store/                            [2326]  (moved)
  sdk/                              [3020]  (moved; dispatch takes &StoreService; wire-only code deleted)
  operator/                          [493]  (moved: files, inspect, store)
    files.rs                         175
    inspect.rs                       237
    store.rs                          81
  overlay/                          [2035]  (moved; FUSE-free, used by both)
```

```
layerfs-daemon/src/                         (only touched parts shown)
  control/                           [138]  (only registry.rs shown)
    registry.rs                      138   (Service holds a StoreService)
  operator/                          [326]  (stays: Workspace operator calls)
    dispatch.rs                       22
    mod.rs                             7
    workspace.rs                     304   (unchanged)
```

```
sdk/js/native/src/                  [1896]
  direct.rs                            —   new (step 3)
  dispatch.rs                         93   (Store calls to direct.rs)
  pool.rs                            135   (sandbox.* only)
  discovery.rs                       495
  sandbox.rs                         442
  exec.rs                            253
  project.rs                         145
  convert.rs                          87
  job.rs                              80
  registry.rs                         76
  trace.rs                            69
  lib.rs                              21
```

```
sdk/js/src/                                 (only touched files shown)
  client.js                           64   (storePath option)
```

The fix record replaces this with the as-built listing at its final commit.

## 6. Not changed

The Store format (kind 1, no rebuild), Disposable/WAL/OFF, page size 4 KiB,
one attempt per operation, the daemon's own direct open of the Store, FUSE and
Workspaces in the daemon, per-Workspace overlay files. No `layerfs-server`, no
host/server adapter: the addon is an opener, not a proxy. Root AGENTS.md
records the one-route rule (2026-10-18).
