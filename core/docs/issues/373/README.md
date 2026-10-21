# #373 Sandbox and volume management: simplification and consolidation

> **Status:** Proposal; target LayerFS release to be set by the owner; not a
> released contract.

Issue: [#373](https://github.com/Ephemeral-AI-Lab/layerfs/issues/373).
Baseline: `main` at `9f17c44b71` (2026-10-21). One local change is ready but
not committed: `lfs run` mounts in the shared Sandbox instead of creating one
per call.

## Summary

Agents work with **Workspaces**; LayerFS places them in **Sandboxes**. A
project has one kind of Sandbox, `layerfs-<project>-<n>`. All of them are
alike, and every one is optional: none runs until a Workspace is mounted, and
an idle one closes. Callers no longer create, choose or close Sandboxes. On
macOS one **Store container**, `layerfs-store`, serves Store calls and Import for every
project; on Linux the SDK does that in-process. Every name says what a thing
is and which project it belongs to.

## 1. Today

### 1.1 Containers

| Container | How many | Name today | Started by | Runs | Mounts |
|---|---|---|---|---|---|
| Box (macOS) | 1 per LayerFS home and build | `dsh-layerfs-box-<12 hex>` | dsh Host (`box.js`) | Real SDK worker (`port/worker.mjs`) | Docker socket, `/var/lib/docker/volumes`, LayerFS home (rw, same path), build (ro) |
| Service Sandbox | 0 or 1 per project | `_service.<project>`; random Docker name | `layerfs.service()`, on the first call that needs a daemon | `layerfs-daemon`, up to 16 Workspaces | Store volume at `/layerfs-store` |
| Named Sandbox | 0 to n per project | caller's name; random Docker name | `sandbox.create(name, project, image, { volumes })` | Same daemon, caller's image | Store volume, plus optional read-only volumes |
| Import Sandbox | 1 per Import, seconds | `init-<created>`; random Docker name | dsh `init.js` | Same daemon; its creation installs the sealed Store into the volume | Store volume |

The service and named Sandboxes are the same container. They differ only in
who starts them, their name and their lifetime. Until the local `lfs run`
change, every `lfs run` added one more named Sandbox per call.

### 1.2 Storage

| What | Kind | Where | Holds | Lifetime |
|---|---|---|---|---|
| Store volume `dsh-layerfs-<project>-<created>` | Docker volume | `/layerfs-store/global/store.sqlite` in Sandboxes; `/var/lib/docker/volumes/<volume>/_data/global/store.sqlite` in the box | The project's committed history | Until the project is removed |
| Workspace overlay | File on the container's own disk | `/layerfs-local/overlay/` | One Workspace's uncommitted changes | Mount to unmount |
| Workspace view | FUSE mount | `/workspaces/N` | Committed base plus overlay | Mount to unmount |
| Project records | Folder | `<home>/<project>/`: `project.record`, `sealed.sqlite`, `service.record`, `ownership.lock`, `create.intent` | The project and its service Sandbox's id | Until the project is removed |
| Sandbox records | Folder | `<home>/_sandboxes/<name>/`: `sandbox.record`, `mount-<hex>.record`, `process-<id>.record` | Each Sandbox and its Workspaces and processes, one name space for all projects | Until the Sandbox is closed |
| Box file | File | `<home>/.dsh-layerfs-box.json` | How to reach the box: `{ box, port, secret }` | While the box runs |
| Extra volumes | Docker volume, read-only | Any target outside `/`, `/workspaces`, `/layerfs-*`, `/proc`, `/sys`, `/dev`, `/tmp` | Caches, tools | Owned by their creator |

### 1.3 Calls

| Caller | Call | Route |
|---|---|---|
| dsh Host views | `operator.inspect.history`, `operator.files.*`, `operator.store.*` | In-process Store (in the box on macOS); starts no Sandbox |
| dsh Host views | `operator.inspect.snapshot`, `operator.workspace.overlay` | Running Sandboxes already known (service plus the client's own) |
| Agent `lfs` / SDK | `fs.*`, `branch.*`, `project.*` | In-process Store |
| Agent SDK | `sandbox.create`, `sandbox.close`, `service()` | Docker, through the SDK binding |
| Agent `lfs run` / SDK | `sandbox.mount/exec/status/commit/unmount(sandbox, path, …)` | Daemon of the named Sandbox |
| Agent operator | `operator.process.start/list/cancel(sandbox, …)` | Daemon of the named Sandbox |
| dsh Import | `project.init`, then `sandbox.create("init-…")` | Store in-process, then a Sandbox to install it |

### 1.4 Problems

| # | Problem | Effect |
|---|---|---|
| P1 | Two ways to get the same container (`service()`, `sandbox.create`) | Callers must choose; dsh used both; per-call containers |
| P2 | Sandbox names are global to a LayerFS home | The shared one needs the reserved, project-stamped name `_service.<project>` |
| P3 | No placement: a Workspace goes where the caller says | 16 per Sandbox, then `Capacity`; nothing grows or shrinks |
| P4 | Import needs a Sandbox to install the Store | An extra container per Import |
| P5 | Docker names are random; no labels | `docker ps` cannot tell projects or roles apart |
| P6 | App-specific or historical names | `dsh-layerfs-box-…`, `dsh-layerfs-<project>-…`, image `layerfs-352-runtime`, "box", "service" |
| P7 | Lifetime differs by kind | The service lives until the project is removed; named ones until closed; nothing closes when idle |

## 2. Target

### 2.1 Principles

1. **Workspaces are the unit callers use.** Mount a Branch, get a Workspace;
   exec, status, Commit and unmount take that Workspace.
2. **One kind of project Sandbox, all optional.** Same image, same daemon, no
   default or special one. None runs until a Workspace needs it, and an idle
   one closes.
3. **LayerFS places Workspaces.** It uses the lowest-numbered running Sandbox
   with a free slot, and starts the next when all are full.
4. **Names are per project and say what and whose.** One pattern across the
   API, the records, Docker and the UI.
5. **Store work never needs a Sandbox.** Views, `fs.*`, `branch.*` and Import's
   Store install run in-process: in `layerfs-store` on macOS, in the caller on
   Linux.

### 2.2 Containers

| Container | How many | Name | Runs | Mounts | Lifetime |
|---|---|---|---|---|---|
| Store container (macOS only) | 1 per LayerFS home | `layerfs-store` | Real SDK: Store calls, Import, Sandbox start and stop for every project | As the box today | While dsh uses LayerFS; a new build replaces it |
| Project Sandbox | 0 to n per project | `layerfs-<project>-<n>` | `layerfs-daemon`, up to 16 Workspaces | Store volume at `/layerfs-store`, plus the project's read-only volumes | From the first mount that needs it until idle |

Every container carries the labels `layerfs.role` (`store` or `sandbox`),
`layerfs.project` and `layerfs.sandbox` (`<n>`). A LayerFS home's container
prefix defaults to `layerfs-`. A second home on the same Docker engine (tests,
another checkout) sets its own prefix, so names never collide.

`layerfs-store` has no build hash in its name: a home has one at a time. When
the Host starts with a different build than the running one (recorded in
`<home>/.layerfs-store.json`), it replaces the container, and only while no dsh
run is live. The Docker name `layerfs-store` is separate from the in-Sandbox
mount path `/layerfs-store`, which stays.

### 2.3 Storage

| What | Kind | Where | Holds | Lifetime |
|---|---|---|---|---|
| Store volume `layerfs-<project>-store-<id>` | Docker volume | `/layerfs-store/global/store.sqlite` | The project's committed history | Until the project is removed |
| Workspace overlay | File on the Sandbox's own disk | `/layerfs-local/overlay/` | One Workspace's uncommitted changes | Mount to unmount |
| Workspace view | FUSE mount | `/workspaces/N` (unchanged) | Committed base plus overlay | Mount to unmount |
| Project records | Folder | `<home>/<project>/`: `project.record`, `sealed.sqlite`, `ownership.lock`, `create.intent` | The project and its image | Until the project is removed |
| Sandbox records | Folder | `<home>/<project>/sandboxes/<n>/`: `sandbox.record`, `workspace-<hex>.record`, `process-<id>.record` | One Sandbox, its Workspaces and processes | Until the Sandbox closes |
| Store container file | File | `<home>/.layerfs-store.json` | How to reach `layerfs-store` (port, secret, build) | While it runs |

### 2.4 Calls

| Caller | Call | Route |
|---|---|---|
| Host views | History, files, storage | In-process Store; no Sandbox |
| Host views | Live Workspaces | Every running Sandbox of the project, from its records |
| Agent `lfs` / SDK | `fs.*`, `branch.*`, `project.*` | In-process Store |
| Agent `lfs run` / SDK | `workspace.mount(branch)` → Workspace | Placement, then that Sandbox's daemon |
| Agent `lfs run` / SDK | `workspace.exec/status/commit/unmount(ws, …)` | The Workspace's Sandbox daemon |
| Agent operator | `operator.process.start(ws, …)`, `list()`, `cancel(id)` | The Workspace's Sandbox daemon; list covers the project |
| Import | `project.init`, then the Store install | In-process; no Sandbox |

### 2.5 Writers to one Store file

| Writer | Writes when | Safe because |
|---|---|---|
| `layerfs-store`, or the SDK on Linux | `fs.*` writes, fork, merge, publish, Import | All writers share one Linux kernel (Docker's VM on macOS). SQLite's single writer, the Linux directory lock and the publication lane make writes take turns. |
| Each project Sandbox daemon | Commit | The same locks; heavy work happens before the lane, as today. |

### 2.6 Names

| Thing | Today | Target |
|---|---|---|
| Store container | `dsh-layerfs-box-<hash>` (one per home and build), "box" | `layerfs-store` (one per home), "Store container" |
| Project Sandbox | `_service.<project>`, or a caller-chosen name | `<n>` within the project; `layerfs-<project>-<n>` in Docker and the UI |
| Sandbox container | random Docker name | `layerfs-<project>-<n>`, plus labels |
| Store volume | `dsh-layerfs-<project>-<created>` | `layerfs-<project>-store-<created>`, for new projects only |
| Runtime image | title `layerfs-352-runtime` | `layerfs-runtime` |
| Sandbox records | `<home>/_sandboxes/<name>/` | `<home>/<project>/sandboxes/<n>/` |
| Workspace record | `mount-<hex>.record` | `workspace-<hex>.record` |
| Workspace path and UI name | `/workspaces/N`, "WS N" | unchanged |
| Project name | user's choice | unchanged |

## 3. SDK API

| Today | Target | Note |
|---|---|---|
| `layerfs.service()` | — | dropped |
| `sandbox.create(name, project, image, { volumes })` | — | dropped; image and volumes become project settings |
| `sandbox.close(sandbox)` | — | dropped; Sandboxes close when idle and when the project is removed |
| `new LayerFS(project, { sandbox })` | — | dropped; no Sandbox selection |
| `sandbox.mount(sandbox, branch)` → path | `workspace.mount(branch)` → Workspace | Workspace = `{ sandbox, path }`; `path` is `/workspaces/N` |
| `sandbox.exec(sandbox, path, command, message, sinks)` | `workspace.exec(ws, command, message, sinks)` | |
| `sandbox.status(sandbox, path)` | `workspace.status(ws)` | |
| `sandbox.commit(sandbox, path, message, force)` | `workspace.commit(ws, message, force)` | |
| `sandbox.unmount(sandbox, path, discard)` | `workspace.unmount(ws, discard)` | The last unmount starts the Sandbox's idle timer |
| `operator.process.start(sandbox, path, …)` | `operator.process.start(ws, …)` | |
| `operator.process.list(sandbox)` | `operator.process.list()` | Every process in the project |
| `operator.process.cancel(sandbox, id)` | `operator.process.cancel(id)` | A process id names its Sandbox |
| `operator.sandbox.service()` | — | dropped |
| `operator.inspect.snapshot` (service plus the client's Sandboxes) | `operator.inspect.snapshot` (every running Sandbox of the project) | Still starts nothing |

The native binding ops follow the same table (`sandbox.create`,
`sandbox.service`, `sandbox.close` and `operator.sandbox.service` go; the
`sandbox.*` Workspace ops become `workspace.*`). Trace lines and the dsh CLI
lines use the new method names.

## 4. Behaviour to specify

| Topic | Proposal | Open question |
|---|---|---|
| Placement | Under the project's `ownership.lock`, pick the lowest-numbered running Sandbox with a free slot; else start Sandbox `<lowest free n>` and mount there | Answered (owner, 2026-10-21): pack |
| Full Sandbox | A mount never fails `Capacity` while Docker can start another Sandbox | Answered (owner, 2026-10-21): no cap; only Docker and host limits apply |
| Idle close | A Sandbox with no Workspaces and no running processes closes after an idle period of 2 minutes | Answered (owner, 2026-10-21): the daemon exits itself; idle period 2 minutes |
| Closed or gone Sandbox | Its records are cleaned the way the gone/stopped path does today (`782dd709e2`); the next mount starts a fresh one | — |
| Image | `project.record` holds the runtime image digest, set at Import and changeable later | Answered (owner, 2026-10-21): a change applies to new Sandboxes only; running ones keep their image until they close |
| Read-only volumes | Dropped | Answered (owner, 2026-10-21): drop them and their tests |
| Isolation | Not offered at first | Later: a mount option that starts a Sandbox for that one Workspace (still the same kind) |
| Import install | `project.init` installs `sealed.sqlite` into the volume in its own process (`layerfs_store_service::install::install_local`): on Linux the SDK, on macOS Init's container beside `layerfs-store` | Answered (step 1): no daemon-only step. The daemon's install (claim, copy, rename, open, initial Branch check, SQLite version) now shares its claim and check code with `install_local`. One constraint: a daemon (user `0:0`) opens only a Store file and `global/` directory it owns with no group or other access, so the installer must run as user 0; `install_local` refuses any other user before it writes |
| Idle Workspaces | Unchanged here; #370 auto-unmount lets idle Sandboxes close sooner | — |

## 5. What is dropped

| Area | Dropped | Replaced by |
|---|---|---|
| SDK JS | `sandbox/create.js`, `sandbox/close.js`, `LayerFS.service()`, `serviceSandbox`, `sandboxes` set, `options.sandbox` | Placement in `workspace.mount` |
| SDK operator | `sandbox.service()`, `serviceOf` in `inspect/snapshot.js` | Project-wide Sandbox listing from records |
| SDK native | Ops `sandbox.create`, `sandbox.service`, `sandbox.close`, `operator.sandbox.service`; `discovery::SERVICE` (`_service.`); caller name checks and claims for Sandboxes; `<home>/_sandboxes/`; `service.record` | Per-project numbered Sandboxes under `<home>/<project>/sandboxes/` |
| Containers | Random Docker names; the Import Sandbox (`init-<id>`) | `layerfs-<project>-<n>` plus labels; in-process install |
| dsh Host | `init.js` install Sandbox; `release({ service })`; service-only `closeGone`; `collector.sandboxesOf` (from `sandbox.create` lines); `remove.js` scan of `_sandboxes` | Placement and idle close; project-wide records |
| dsh model and UI | Attribution of a Sandbox to the agent that created it (`made`); `sandbox create` CLI lines; story lifting of `sandbox.create` | Workspace attribution only (mount, exec, Commit) |
| Names | `_service.<project>`, `dsh-layerfs-box-…`, `.dsh-layerfs-box.json`, `DSH_LAYERFS_BOX`, `dsh-layerfs-<project>-…` (new projects), `layerfs-352-runtime` | Section 2.6 |
| Docs | Skill rules "never close the service Sandbox", `service()` and `sandbox.create` guidance | Workspace-first guidance |
| Tests | Tests that drive `sandbox.create`, `service()`, named Sandboxes or `_sandboxes` (list in the fix record, per the delete-hard-to-adapt rule) | Tests on placement, idle close, names and labels |

## 6. What is updated

Production LOC from `tools/production_loc.py --files` at `9f17c44b71`.
Partial directory listings; brackets sum only the files shown.

`sdk/js` (JavaScript SDK and operator):

```
sdk/js/                             [315]  (files shown only)
  src/                              [242]
    index.js                          76   (drop service(), selection; add workspace group)
    client.js                         76   (Workspace args instead of sandbox + path)
    sandbox/                        [90]
      create.js                       14   (dropped)
      close.js                         7   (dropped)
      mount.js                         5   (→ workspace.mount, placement)
      exec.js                         51   (→ workspace.exec)
      status.js                        5   (→ workspace.status)
      commit.js                        4   (→ workspace.commit)
      unmount.js                       4   (→ workspace.unmount)
    workspace/                         —   new (replaces sandbox/)
  operator/                          [73]
    index.js                          30   (drop sandbox.service)
    inspect/                        [35]
      snapshot.js                     35   (every running Sandbox of the project)
    process/                         [8]
      list.js                          4   (project-wide)
      cancel.js                        4   (by process id)
```

`sdk/js/native` (binding):

```
sdk/js/native/src/                 [1553]  (files shown only)
  discovery.rs                       544   (per-project sandboxes/, drop _service., names, workspace-<hex>.record)
  sandbox.rs                         513   (placement, numbered Sandboxes, labels, prefix default, drop create/service/close ops)
  dispatch.rs                        108   (op table)
  exec.rs                            243   (process ids that name their Sandbox)
  project.rs                         145   (cond.: in-process Store install for Import)
```

`core/crates/layerfs-sandbox` (Docker backend):

```
core/crates/layerfs-sandbox/src/backend/docker/  [530]  (files shown only)
  container.rs                       220   (container name and labels)
  container_types.rs                 123   (labels in the create request)
  topology.rs                        187   (verify labels on reopen)
```

`core/crates/layerfs-daemon`: idle exit, if the daemon closes itself (open
question in section 4). The exact files are chosen in the plan.

`dsh/packages` (Host, model, view, client):

```
dsh/packages/                      [2739]  (files shown only)
  host/src/                        [1058]
    lfs.js                           118   (workspace.mount/exec/commit/unmount)
    init.js                          125   (no install Sandbox; image as a project setting)
    layerfs-client.js                 68   (release and gone handling without the service)
    collector.js                     172   (no sandboxesOf)
    remove.js                         43   (records under <home>/<project>/sandboxes/)
    box.js                            75   (layerfs-store name, file, labels; replace on a new build)
    env.js                            64   (DSH_LAYERFS_BOX, DSH_LAYERFS_IMAGE wording)
    trees.js                          68   (snapshot without a Sandbox list)
    sim/                            [325]
      binding.js                     325   (simulator follows the new ops)
  model/src/                        [728]
    attribution.js                    84   (Workspace attribution only)
    cli.js                            87   (CLI lines for workspace.*)
    mirror.js                        138   (Sandboxes from the snapshot)
    sources/                        [419]
      story.js                       174   (no sandbox.create lifting)
      trace.js                       245   (new method names)
  view/src/                         [641]
    view.js                          641   (Sandbox labels layerfs-<project>-<n>)
  client/src/client/                [312]
    api.ts                            75   (as needed)
    LayerFsPanel.tsx                 202   (as needed)
    RemoveDialog.tsx                  35   (as needed)
```

Docs and skills:

| File | Update |
|---|---|
| `.agents/skills/layerfs-js-sdk/SKILL.md`, `references/methods/sandbox.md` | Workspace-first API; drop the service Sandbox rules |
| `.agents/skills/layerfs-sdk-observe/references/operator.md` | Snapshot and process calls |
| `sdk/js/README.md` | API |
| `core/docs/architecture/82-sdk-call-channel.md` | Ops table |
| `dsh/README.md` | `layerfs-store`, project Sandboxes, Import without a Sandbox |
| `AGENTS.md` (dsh Live exception paragraph) | "box" → Store container `layerfs-store`, if the owner agrees |

Not changed by this issue: `dsh/demo/*` system prompts, which still tell agents
to use `sandbox.create` (untracked; the owner decides), and released or
historical receipts.

## 7. Migration

| Item | Plan |
|---|---|
| Running Sandboxes | Disposable. On upgrade the Host closes every Sandbox of the old kinds once (records under `<home>/_sandboxes/`, plus containers). Stores are untouched. |
| Old records | `<home>/_sandboxes/` and `service.record` are removed after that close |
| Existing volumes | Keep their names; `project.record` already stores each project's volume |
| Old box | `dsh-layerfs-box-…` is stopped and replaced by `layerfs-store` when the Host next starts it |
| SDK callers | Breaking change; no compatibility layer. dsh, skills and tests move in the same change |
| Traces | Old trace lines keep their old method names; the model reads both while old sessions exist |

## 8. Order of work

| Step | Work | Depends on |
|---|---|---|
| 0 | Commit the local `lfs run` change (shared Sandbox, no per-call container) | — |
| 1 | In-process Store install for Import; drop the Import Sandbox | — |
| 2 | Container names `<prefix><project>-<Sandbox>` (default prefix `layerfs-`), labels, read-only volumes dropped | — |
| 3 | Per-project numbered Sandboxes and their records, placement, Workspace-first SDK API; drop `create`, `service`, `close` | 2 |
| 4 | Idle close | 2 |
| 5 | dsh Host, model, view and simulator on the new API; `layerfs-store` naming | 3 |
| 6 | Docs and skills | 3, 5 |
| 7 | Live check on dsh web (3080): Import starts no Sandbox; `lfs run` × 17 starts a second Sandbox; idle close; names and labels in `docker ps` | 1–6 |

Numbering, records and placement moved from step 2 to step 3 during the
work: placement is what `workspace.mount(branch)` does, and caller-named
Sandboxes cannot be numbered while `sandbox.create(name)` exists, so doing
them with the API keeps every commit working. dsh still calls the removed
API between the step 3 and step 5 commits.

Placement holds the project's `ownership.lock` for one mount (place, then
mount, then the Workspace record), so a Sandbox never holds more than 16;
Exec, status, Commit and unmount take only their Sandbox's lock. Discovery
locks now wait for another process's hold, up to 60 seconds, then refuse
`Busy`; before, a held lock refused `Busy` at once, and agents mounting at
the same time would fail. The wait is a lock acquisition, not a retry: the
call's work runs once.

Idle close (step 4): the daemon reads its state once a second and ends its
process after 2 minutes with no Workspace bound and no control call running;
open connections do not keep it. The container then stops. The binding
checks a known Sandbox's container with one Engine inspection before a
placement or operator call, so a client that kept connections finds it
stopped instead of sending on a dead connection. The next mount or
`operator.sandbox.list()` reclaims it (deletes the stopped container and the
records). A call sent in the instant the daemon decides gets no reply; the
window is the time between the decision and the exit, after two quiet
minutes.

Each step is one commit, with the production LOC comparison and its tests.
Disposable Store profile only; every test command under 120 s.

## 9. Related

- [#370](https://github.com/Ephemeral-AI-Lab/layerfs/issues/370): automatic
  unmount of idle Workspaces.
- [#372](https://github.com/Ephemeral-AI-Lab/layerfs/issues/372): Store call
  Workspaces (in-process) leak to `Capacity`; out of scope.
- [#368](https://github.com/Ephemeral-AI-Lab/layerfs/issues/368): macOS
  support; `layerfs-store` is its container.
