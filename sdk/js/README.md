# @layerfs/sdk

> **Status:** Current implementation guide for issue #327; not a release receipt.
> The public contract is the [29-method #328 standard](https://github.com/Ephemeral-AI-Lab/layerfs/blob/5321d6de320dcbd41402db9cb41aa36bceabdf4c/core/docs/issues/327/SDK-STANDARD.md).
> Historical results retain their source identities in the Phase 2–4 records.

```js
import { LayerFS } from "@layerfs/sdk";
const layerfs = new LayerFS("website"); // lazy; no filesystem/addon/network I/O
await layerfs.project.init("./website");
await layerfs.branch.fork("feature");
await layerfs.fs.write("feature", "/README.md", "Hello\n", "Update introduction");
const page = await layerfs.branch.list_commits("feature", 20, 0);
const text = await layerfs.fs.read("feature", "/README.md", 1, 20);
const id = await layerfs.sandbox.create(); // save this opaque id for another process
const mounted = await layerfs.sandbox.mount(id, "feature");
await layerfs.sandbox.exec(id, mounted.path, "npm test", "Run tests");
await layerfs.sandbox.commit(id, mounted.path, { message: "Save changes" });
await layerfs.sandbox.unmount(id, mounted.path);
await layerfs.sandbox.close(id);
```

Construction captures environment strings. Project names use 1–63 lowercase ASCII
letters, digits, `_`, `-`, `.` and start/end alphanumeric. Init is explicit;
subsequent clients discover the existing project without reacquiring its source
or reinstalling over live state. Ordinary Store calls lazily create or reopen a
private service Sandbox. Mount does not scan or materialize the complete tree.

| Environment | Meaning |
| --- | --- |
| `LAYERFS_HOME` | Absolute private directory for sealed provisioning and discovery. Created as 0700; existing directories must be owned by the current effective user with no group/other access. Records are 0600, not symlinks. |
| `LAYERFS_DOCKER` | Local Engine Unix socket; `/var/run/docker.sock` is the create default. |
| `LAYERFS_IMAGE` | Exact immutable runtime `sha256:...` digest. |
| `LAYERFS_VOLUME` | Existing named local VM volume shared by the project's daemons. |
| `LAYERFS_DAEMON` | Host path to the built Linux daemon executable. |
| `LAYERFS_NATIVE` | Optional addon path; defaults to `native/layerfs.node`. |
| `LAYERFS_TRACE` | Optional per-call trace file (see [Call trace](#call-trace)); unset means no trace. |

The same authorized home permits a fresh Node process to use a saved Sandbox id
and mount path directly. Reopening validates the full container id, deployment,
volume, topology, loopback endpoint, Noise peer and saved daemon incarnation.
Discovery mutations use nonblocking OS locks and atomic record replacement.
An unresolved create intent is `Unknown`; it never authorizes another installation.
Daemon/container restart recovery and replay of uncertain operations are excluded.
Close refuses mounted Workspaces. Background process ownership is in the native
executor, including persisted process identity; the filesystem daemon launches
and supervises no commands.

| Group | Positional methods |
| --- | --- |
| project (2) | `init(sourcePath)`, `list_branches(pageSize?, pagePos?)` |
| fs reads (7) | `read(ref, path, startLine?, endLine?)`, `list(ref, path?, pageSize?, pagePos?)`, `stat(ref, path)`, `grep(ref, pattern, path?, pageSize?, pagePos?)`, `glob(ref, pattern, path?, pageSize?, pagePos?)`, `diff_files(leftRef, leftPath, rightRef, rightPath)`, `blame(ref, path, fromLine?)` |
| fs writes (7) | `write(branch, path, content, message?)`, `edit(branch, path, oldText, newText, message?)`, `apply(branch, changes, message?)`, `mkdir(branch, path, message?)`, `rm(branch, path, message?)`, `cp(branch, from, to, message?)`, `mv(branch, from, to, message?)` |
| branch (6) | `fork(name, fromRef?)`, `list_commits(branch, pageSize?, pagePos?)`, `diff_commits(from, to, pageSize?, pagePos?)`, `diff_branches(from, to, pageSize?, pagePos?)`, `merge(a, b, name, message?)`, `publish(branch, commit?)` |
| sandbox (7) | `create()`, `mount(id, branch)`, `exec(id, path, command, message?)`, `status(id, path)`, `commit(id, path, {message?, force?}?)`, `unmount(id, path, {discard?}?)`, `close(id)` |

Every grouped method returns a Promise. A ref is `main`, a Branch name, a Commit
id or a Layer id. Filesystem paths are absolute in that view. Main changes only
through publish. There is no `remove` alias, harness export, agent/call attribution,
public inspect or public process-control method.

Messages are optional UTF-8, at most 4096 encoded bytes; newline/tab are allowed,
other controls and unpaired JS surrogates are refused before work. Omitted messages
get operation descriptions; empty messages are allowed. Commit messages participate
in `layerfs/commit/v3` identity; time, byte counters and LWW details are persisted
facts outside that identity. An Exec message describes that execution and creates
no history. Unchanged state creates no Commit solely for a message.

`apply` takes ordered `{op, ...}` changes (`write`, `edit`, `mkdir`, `rm`, `cp`,
`mv`) and publishes once. A refusal identifies its zero-based `detail.index`.
Each call uses a private indexed Workspace, the ordinary Workspace semantic ports
and the shared captured Content constructor. Failed validation closes only that
private overlay. Uncertain construction/publication keeps original custody.
Recursive work uses bounded directory windows and a backed hardlink index; it
has no resident whole-tree draft or total-path admission cap. Copies preserve
modes, copied-set hardlinks and opaque symlinks; timestamps are new. Moves retain
identity/timestamps. Destinations are exact and must not exist. Same-path/subtree
moves or copies are InvalidInput. Mkdir creates parents and an existing directory
is a no-op. Edit requires exactly one match and streams large files.

Pages have `items` and `hasMore`; advance by `pagePos + items.length`. Defaults
are 50/0, max pageSize 1000, with safe integers only. Byte bounds can shorten a
page; they never mean EOF when `hasMore` is true. Deep offsets skip through bounded
windows linearly. Names use byte order; recursive paths use deterministic
component-by-component byte order, then line number for grep. Commit history is
newest first along first parents. Every call resolves each live ref once; separate
calls against live heads can shift numeric positions.

Read/blame use 1-based inclusive line positions, no byte offsets or byte-read
method. Responses fit the authenticated control frame: at most 2000 lines and
48 KiB of text/value payload, below the selected 256 KiB ceiling. LF separates
lines; CRLF text is preserved, and a final LF creates no phantom line. Read reports
`startLine`, `endLine`, `truncated`, `lineTruncated` and `nextLine`. Huge lines return
a UTF-8 prefix, with no within-line continuation; the remainder is explicitly
omitted and the next window starts at the following line. NUL/invalid UTF-8 in the
scanned text is Binary. Grep scans chunks and matches across chunk boundaries.
Blame uses bounded LCS and exact common edges; an oversized changed middle is a
removed/added block and `comparisonCoarse` discloses that Content diff policy.
Diff hunks can be omitted explicitly when their bounded comparison/reply cannot
represent them; equal content is decided by immutable content identity.

## Internal operator

```js
import { LayerFSOperator } from "@layerfs/sdk/operator";
const operator = new LayerFSOperator(layerfs);
await operator.store.stats();
await operator.store.commits("feature", 20, 0);
await operator.files.stats("feature", "/README.md");
await operator.files.history("feature", "/README.md", 20, 0);
await operator.workspace.overlay(id, mounted.path);
await operator.workspace.changes(id, mounted.path, 20, 0);
await operator.inspect.snapshot();
const process = await operator.process.start(id, mounted.path, "npm run dev");
await operator.process.list(id);
await operator.process.cancel(id, process.process);
```

Operator names are refused by public JS/native/Rust/daemon dispatch. This subpath
uses its own method table; process control remains exclusively in the binding.
HTTP exists only in the local demo server, which maps GET reads and POST
`{args:[...]}` writes at `/api/{sdk|operator}/{group}/{method}`.

Store `logical` sums regular-file sizes across immutable Commit and Layer history
records, counting each hardlink path. `canonical` counts distinct registered object
bytes, `stored` complete pack bodies, and `metadata` metadata-domain pack bodies
plus occupied SQLite bytes outside pack bodies. `file` is committed logical DB
pages (including free pages and pages currently in WAL), not main-file length or
extra WAL-file allocation; `free` is reusable DB pages in bytes. Ratios are
logical/canonical and canonical/stored, null for a zero denominator. Per-Commit
new byte counts describe that producer's acknowledged Save, not exclusive SQL
or per-path physical allocation. Per-file physical attribution remains null;
revision diagnostics explicitly disclose their 1000-revision count bound.
Overlay payload counts stored cell bytes including validity masks; metadata row
counts are reported without inventing exclusive byte attribution.

## Call trace

`LAYERFS_TRACE=<file>`, or `new LayerFS(project, { trace: file })` (the option
wins), appends one JSON line to `file` for every SDK and operator call that
reaches the native binding, including the client's own `sandbox.service` call.
Unset, nothing is written and nothing changes. A failed trace write is dropped;
it never changes a value, a refusal or the call count. Argument checks the
JavaScript methods make before the call (for example `page` bounds) are refused
without a trace line.

```json
{"layerfs_trace":1,"id":"9f3c21aa-12","method":"fs.write","args":{"branch":"feature","path":"/README.md","contentBytes":6,"message":"Update introduction","sandbox":"sb_…"},"start":"2026-10-15T09:12:01.120Z","scope":"…","ms":41.733,"ok":true,"commit":"…","sizes":{"logical":120,"newCanonical":40,"newStored":30,"newMetadata":8},"daemon":[{"timing":[{"name":"files.bind","ms":1.2,"children":[…]},{"name":"commit","ms":30.4,"children":[…]}],"storage":{…},"construction":{…}}]}
```

| Field | Meaning |
| --- | --- |
| `layerfs_trace` | Format version, `1`. |
| `id` | `<run>-<n>`: a random per-process run prefix and the call's sequence number. |
| `method` | The binding method, for example `fs.read`, `sandbox.commit`, `operator.store.stats`. |
| `args` | Short summary: text arguments (paths, refs, names, Sandbox id, command, message) cut to 200 characters; numbers and flags; `content`, `bytes`, `oldText` and `newText` as `<name>Bytes` byte counts; `apply` changes as `changes` (count) and `changeBytes`. Never file contents; `project`, `home` and `deploy` are left out. |
| `start`, `ms` | Wall-clock start (ISO 8601) and elapsed wall milliseconds measured in the calling process, including the native queue and the daemon round trip. |
| `ok` | `true` for a value; `false` with `code` and `message` for a refusal. |
| `kind`, `commit`, `sizes` | When the value carries them: its `kind`, the Commit id, and that Commit's `logical`, `newCanonical`, `newStored` and `newMetadata` byte counters. |
| `scope` | 64 hex characters: the fresh daemon observation scope this call's control exchanges carried. |
| `daemon` | One entry per traced control exchange the call made (a mount makes at least three: Branch lookup, bind, attach). Absent when the call reached no daemon (for example `project.init`). |

Each `daemon` entry holds:

| Field | Meaning |
| --- | --- |
| `timing` | Phase trees the daemon recorded for that exchange: `{ name, ms, children }`, with `outcome` (`error`, `unknown`) and `incomplete` only when they apply. Roots include `commit` (phases `capture`, `producer`, `begin`, `construct` › `captured.namespace`, `head`, `merge`, `logical.known`, `finish`, `logical.count`, `validate`, `publish`, `install`), `sandbox.mount.bind` › `store.bind`, `sandbox.mount.attach` › `kernel.attach`, `files.bind` (the private Workspace of an `fs` write), `sdk.read`, `sdk.lines`, `branch.merge` and `blame.compare`. |
| `omitted` | Timing nodes left out beyond the 256-node reply bound. |
| `storage` | When the exchange committed: the Save's storage diagnostics (42 counters such as `pack_write_bytes`, `locator_hits`, `pack_misses`), daemon names in snake_case. |
| `construction` | When the exchange committed: the captured namespace construction work (31 counters such as `files_constructed`, `inode_rows`). |
| `diagnosticError` | `{ kind, message }` when the daemon could not write its numeric records, or the telemetry did not fit the reply (`Oversized`). The call's result and connection are unaffected. |

Tracing makes each control exchange an observed one: the daemon also writes
fixed-schema numeric records (SQL work, owner lock wait/hold, Store reader and
cache work, FUSE kernel counters on Linux, Workspace resources) to its stderr.
Decode them and join them to the trace by `scope`:

```sh
docker logs <container> 2>&1 | python3 tools/decode_observations.py --trace trace.jsonl
```

Each output line is one daemon call: `daemon`, `scope`, `call`, `operation`,
`complete`, the joined trace `id` as `trace`, and named `sections` (unavailable
sections are `null`, never zero). Values are cumulative daemon counters at that
call, not per-call deltas. The container is the Sandbox id without `sb_`.

Concurrent calls append whole lines; order follows completion, so join by `id`.
The trace is diagnostic timing, not a benchmark measurement. Off means no scope,
no observed exchange, no daemon timing and byte-identical replies.

## Builds and compatibility

Run `npm --prefix sdk/js run build:native` on the macOS/Linux host that loads the
addon. It uses Cargo +1.85.1, `--offline --locked --release`, and the repository
ARM64 inputs. `-- --debug` selects dev. The artifact is atomically renamed into
place, avoiding stale macOS executable-page signature state. `CARGO_TARGET_DIR`
must stay inside this worktree; `LAYERFS_NATIVE_OUTPUT` can select a separate
platform artifact. Keep Linux addons separate from the host addon.

New Store schema versions are 16–18 (pack layouts) and 22–24 (with acquisition),
with history identity format 3. Old Disposable Stores are rejected without
migration. Select a fresh project/Store for the new format.

Disposable/WAL/synchronous=OFF only. Durable execution is NOT_RUN — disabled by
owner until explicit reauthorization. One attempted operation; no retry or replay.
Zombie reaping and the existing replaced-inode FUSE policy remain owner-deferred.
