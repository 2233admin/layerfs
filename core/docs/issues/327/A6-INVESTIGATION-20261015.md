# A6: reaching a live Sandbox from another Node process

> **Status:** Research; informative and not a product contract.
> Read-only source investigation at `99dfff77673a7344f945e9563d61c29436748039`,
> 2026-10-15. No Store, Docker container, daemon or executable was run for this
> investigation. A9's original FAIL remains in [PHASE2](PHASE2.md).

## Finding

The existing authenticated control transport can carry a second client's
requests to the same live daemon. Persisting a Sandbox ID alone cannot make
that client work. The native binding owns the only controller key, runtime
handle, Workspace path/token map and executor process records. Reopening must
also coordinate operation admission, close and uncertain outcomes across
processes. None of those capabilities is established by this document.

## Existing route and its gaps

1. [`sandbox.rs`](../../../../sdk/js/native/src/sandbox.rs) creates fresh Noise
   controller/daemon keys and configures port 30421. Docker publishes a random
   host loopback port; the public `sb_` ID is only the first twelve characters
   of the full container identity. `PROJECTS` and `SANDBOXES` in
   [`registry.rs`](../../../../sdk/js/native/src/registry.rs) are process-local.
   The keys and original daemon instance are not retained in `SandboxState`.
2. [`SandboxApi::create`](../../../crates/layerfs-api/src/sandbox/create.rs)
   obtains the runtime endpoint, connects once, authenticates the daemon peer,
   clears startup socket waits and sends Hello. Existing-Store startup selects
   the installed manifest; first startup streams the sealed Store once. A
   reopening path must bypass create/upload/start/install entirely.
3. Docker [`endpoint.rs`](../../../crates/layerfs-sandbox/src/backend/docker/endpoint.rs)
   validates full ID, immutable image, running state, topology, volume and exact
   loopback mapping. Its receiver is an existing `Sandbox`; there is no
   public constructor for a previously acknowledged running container.
   [`container_types.rs`](../../../crates/layerfs-sandbox/src/backend/docker/container_types.rs)
   intentionally retains one-attempt lifecycle flags in that owner. A new
   read-only validation/reopen port must not fabricate original acknowledgments
   or reset failed stop/delete attempts.
4. Daemon [`connection.rs`](../../../crates/layerfs-daemon/src/application/connection.rs)
   admits several authenticated channels against one shared Service. Setup
   currently permits four ordinary control connections, plus an installer
   slot. Every channel uses the setup's single authorized controller public
   key, so a second process needs the corresponding secret or a separately
   authorized protocol change. Hello can check the expected daemon instance
   ([owner.rs](../../../crates/layerfs-daemon/src/application/owner.rs)). A
   matching TCP address alone is insufficient authentication.
5. [`Control`](../../../crates/layerfs-api/src/base/control.rs) owns correlation
   and terminal failed state per channel. A new channel may start its own
   correlation sequence; it must never resend an old channel's failed command.
   EndSession ends only that conversation. Dropping a connection does not
   unmount Workspaces, stop commands or close the Sandbox. Unresolved daemon
   failures retain their connection slots; opening another channel does not
   release or resolve them.
6. Daemon [`Service`](../../../crates/layerfs-daemon/src/control/registry.rs)
   retains bound Workspaces independently of any client channel. Workspace
   tokens contain identity and namespace and are checked against those live
   bindings. The binding's `token(path)` currently consults only its local map,
   so second-process status/exec/commit/unmount fail before reaching Service.
   The current inspection route exposes Workspace identity, namespace, binding
   and directory; it can support authenticated refresh, but refresh must remain
   observation and must not replay mount or settle an uncertain publication.

## Persisted facts required

The selected authorization policy is recorded in
[DECISIONS](DECISIONS-20261015.md). The proposed private record must contain:

| Record | Facts and reason |
| --- | --- |
| Project | Record version, project name, Engine socket, immutable image, daemon identity/build selection, named volume, Store locator/profile, stack and catalog authority/manifest, installation state. These prevent Init or reinstall on reopening. |
| Sandbox | Collision-resistant saved ID mapped to full container ID; project association; runtime deployment; controller secret and daemon public key; expected daemon instance; command uid/gid; lifecycle state and exact pending/uncertain operations. |
| Workspace discovery | Directory, Workspace identity/token and Branch binding. Prefer authenticated live registry observation to a stale cached token; preserve lifecycle and custody rather than inventing a mount from a path. |
| Executor | Globally unique process ID, Sandbox/Workspace, command, process group and process-start identity, known result/cancel disposition and log locator. Foreground Engine exec/stream ownership is not a restart checkpoint. |

The sealed host file is provisioning output, never the live Store. Later clients
must not reopen it as a substitute for current history. The first-install choice
needs cross-process serialization before any side effect; an uncertain install
record must refuse automatic install on another process. Persist enough of the
manifest to start a new daemon on the installed volume without requiring the
original `SealedProject`'s in-memory `Initialized` diagnostics.

## Authorization and coordination requirements

- Validate the home and record ancestry as owner-controlled directories, reject
  symlinks and unsafe permissions, use 0700 directories and 0600 secret records.
  Reject path separators, traversal and malformed names before joining paths.
  Directory ownership authorizes the controller secret; Docker socket access
  independently grants broad runtime authority. This is one local owner, not
  per-Branch or multi-user isolation. Do not put secrets in argv, env, logs,
  world-readable files, refusal text or demo responses.
- Publish records atomically and use existing filesystem/locking capabilities
  for before-effect coordination. Record pending state before effects and
  known/unknown results afterward. A crash between an effect and its record
  update must not cause another process to repeat that effect. No SQLite busy
  handler, automatic failed operation retry or private host data server.
- Coordinate close against every process's active operations and the live
  daemon registry. `Arc::try_unwrap` and the local mounts map cannot provide
  a cross-process close fence. Keep lifecycle admission short; do not hold a
  whole-Sandbox lock across ordinary exec or serialize all Workspace Commits.
- Use bounded channel ownership: either cache a small explicitly limited number
  or end a healthy per-operation session with EndSession. Do not leak one
  persistent service channel for every process and exhaust daemon slots.
  Failed/unknown channels keep their real custody rather than being replaced.
- Validate daemon incarnation on every new connection. A stopped/restarted
  container, changed volume/image, stale endpoint or foreign project record is
  refused. Live daemon/container restart recovery remains out of scope.

## Service Sandbox and executor records

[`LayerFS.service()`](../../../../sdk/js/src/index.js) lazily creates a Sandbox
per JS client; it is stored as one Promise, including failure. It is added to
that client's local Sandbox set. A fresh process currently creates neither a
project map entry nor a usable service, even with the same home/volume.
Discovery must distinguish an internal Store-serving Sandbox from user-created
Sandboxes and choose a live service without reinstalling the Store. Creation
and retirement require the same persisted admission as user Sandboxes. A
client's death does not authorize deleting a shared service or its volume.

[`exec.rs`](../../../../sdk/js/native/src/exec.rs) creates background process
IDs from the local map length, starts `setsid`, records a numeric pid, probes
`/proc` for non-zombie group members and cancels with TERM. The current IDs
collide across processes; numeric pids can also be reused. Copying this map
into each process would lose cancellation authority and let close/unmount miss
another executor's processes. Process identity must include a start identity
and shared per-Sandbox records before operator list/cancel can work across
clients. Lost launch replies remain uncertain; never relaunch to recover an ID.
Ordinary command output/exit ownership stays in the native executor, with
bounded output and no runtime timeout. The filesystem daemon gains no process
table, supervisor or Exec registration. External processes still use the same
mount semantics, and Commit captures their published writes too.

Zombie reaping and requests on replaced inodes are explicitly deferred by the
owner. Sharing executor records does not fix either one or prove kernel drain.

## Required acceptance after implementation

Fresh Node process reopens the project and reads current committed bytes with
no Init/install; two authorized processes use one saved Sandbox ID to mount,
exec, status, commit and unmount; process records are visible to the native
operator across processes; active mounts/operations prevent close; wrong home
permissions, identity, project and daemon incarnation are refused. Include
concurrent creation and closed/uncertain lifecycle cases. Preserve A9's old
receipt and add new receipt identities, explicitly Disposable/WAL/OFF and one
construction worker, with each built-first test command capped at 120 seconds.
