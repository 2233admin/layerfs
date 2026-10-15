# Call trace

> **Status:** Current general guide. Part of the `layerfs-sdk-observe` skill. Describes the
> #333 trace, merged to `main` in `62b225766`. Its source of truth is the "Call trace"
> section of [`sdk/js/README.md`](../../../../sdk/js/README.md).

## Turning it on

| Setting | Effect |
| --- | --- |
| `LAYERFS_TRACE=<file>`, or `new LayerFS(project, { trace: file })` | Append one JSON line per SDK and operator call. The option wins |
| `LAYERFS_TRACE_STEP=<label>`, or `{ traceStep }`, or `layerfs.options.traceStep` | Put `step` on each line; read at every call; cut to 200 characters |

Off (unset) means no file, no daemon observation, no recording cost and byte-identical
replies. A failed trace write is dropped and never changes a result. A step label alone
traces nothing.

## One line

```json
{"layerfs_trace":1,"id":"9f3c21aa-12","step":"012 cart: add tests","method":"sandbox.commit","args":{"path":"/workspaces/3","message":"cart: tests pass","sandbox":"sb_…"},"start":"2026-10-15T09:12:01.120Z","scope":"…","ms":184.2,"ok":true,"kind":"Committed","commit":"c41d…","sizes":{"logical":5210344,"newCanonical":48211,"newStored":21007,"newMetadata":9120},"daemon":[{"timing":[{"name":"commit","ms":171.9,"children":[{"name":"capture","ms":12.0},{"name":"construct","ms":121.4},{"name":"publish","ms":31.0},{"name":"install","ms":7.5}]}],"storage":{"pack_write_bytes":21007,"…":0},"construction":{"files_constructed":37,"…":0}}]}
```

| Field | Meaning |
| --- | --- |
| `layerfs_trace` | Format version, `1` |
| `id` | `<run>-<n>`: per-process run prefix and sequence number. Join by `id`; lines are in completion order |
| `step` | Your step label, when set |
| `method` | Binding method, for example `fs.write`, `sandbox.commit`, `operator.store.stats` |
| `args` | Summary: paths, refs, names, Sandbox id, command, message (cut to 200 characters); contents only as byte counts (`contentBytes`, `oldTextBytes`, `changes`/`changeBytes`) |
| `start`, `ms` | Wall start and elapsed milliseconds in the calling process, including the native queue and daemon round trip |
| `ok` | `true`, or `false` with `code` and `message` |
| `kind` | The result's `kind` |
| `commit`, `layer` | On every successful publishing call: the new Commit, or the head when `UpToDate`; `branch.publish` adds the new `layer` |
| `sizes` | `logical`, `newCanonical`, `newStored`, `newMetadata`, when the reply carries the Commit record (`fs` writes and `sandbox.commit` that commit) |
| `scope` | 64-hex daemon observation scope; joins to the daemon records |
| `daemon` | One entry per control exchange (a mount makes at least three); absent if no daemon was reached |

Each `daemon` entry:

| Field | Meaning |
| --- | --- |
| `timing` | Phase trees `{ name, ms, children }` (`outcome`, `incomplete` only when they apply), at most 256 nodes; `omitted` counts the rest |
| `storage` | On a committing exchange: 42 Save storage counters (`pack_write_bytes`, `locator_hits`, `pack_misses`, …) |
| `construction` | On a committing exchange: 31 captured-namespace construction counters (`files_constructed`, `inode_rows`, …) |
| `diagnosticError` | `{ kind, message }` if the daemon couldn't write its records or the telemetry didn't fit (`Oversized`); the call is unaffected |

## Timing roots

| Root | Where | Children |
| --- | --- | --- |
| `commit` | `sandbox.commit` | `capture`, `producer`, `begin`, `construct` › `captured.namespace`, `head`, `merge`, `logical.known`, `finish`, `logical.count`, `validate`, `publish`, `install` |
| `files.bind`, `commit` | `fs` writes (private Workspace) | as above, without storage/construction counters |
| `sandbox.mount.bind` › `store.bind` | `sandbox.mount` | |
| `sandbox.mount.attach` › `kernel.attach` | `sandbox.mount` | |
| `sdk.read`, `sdk.lines` | `fs.read`, line reads | `content.read` |
| `branch.merge` | `branch.merge` | merge tree |
| `blame.compare` | `fs.blame` | |

## Reading it

```bash
# slowest calls
jq -c 'select(.ms) | [.ms, .method, .step] ' trace.jsonl | sort -rn | head
# per-method p50 / max (needs jq 1.6+)
jq -s 'group_by(.method) | map({method: .[0].method, n: length, p50: (map(.ms) | sort | .[length/2|floor]), max: (map(.ms) | max)})' trace.jsonl
# phase breakdown of one slow Commit
jq -c 'select(.id == "9f3c21aa-12") | .daemon[].timing' trace.jsonl
# refusals
jq -c 'select(.ok == false) | [.id, .step, .method, .code, .message]' trace.jsonl
```

Overhead with tracing on, from #333's one-sample diagnostic: about 1–2 ms per
single-exchange call and 3–6 ms per multi-exchange call (mount, status, commit,
unmount). Compare times only within one tracing setting.
