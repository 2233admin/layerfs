# Exec create and inspect reuse one kept-alive Engine connection

| | |
| --- | --- |
| Trigger | 013.a1 diagnosis and BUGS.md F-029. Exec launch is a fresh Docker exec per call: three Engine exchanges, each on a new Unix connection with `Connection: close` (create, Start with Upgrade, inspect), then dockerd → containerd → runc. The owner kept this item and did not defer it (lead, 2026-10-18) |
| Playbook step | D1 (fixed per-call cost) |
| Kind | 1 forward-only (REBUILD.md): addon code path only. No Store, daemon or record format change |
| Old Stores | not involved |
| Old data | not involved |
| Compatibility test | not applicable: only the Engine HTTP exchange changes |
| Binaries | daemon `57141b57` unchanged (it does not link `layerfs-sandbox`; rebuilt from this branch to the same id); addon `05b8bd07` → `604df2b2f9a8e057edad3e35581a8fd3aee5df52d9ad23a986622b394ce46134` (`core/target/issue352/sdk-linux-604df2b2/`, from `0126695f9`, 5.7 s warm) |
| Commits | `0126695f9` on branch `dsh-352-engine-keepalive` |
| Regression test | `core/crates/layerfs-sandbox/tests/engine_keepalive.rs` (4 tests) |
| Recovery | none: no Store change. Runs pick up the addon at the next re-baseline |

## Change

`layerfs-sandbox/src/backend/docker/http.rs`:

- Exec create (`request.rs`) and inspect (`inspect.rs`) go through
  `Docker::exchange_kept`, which sends no `Connection: close`.
- A `Docker` and its clones share one idle-connection slot (`Kept`).
  - **Taking it:** a request uses the slot's connection only if it has been
    idle under 30 s and is quiet. Quiet is a zero-wait `poll`, which sends
    nothing: no readable byte, hangup or error. Otherwise the stale
    connection is closed and the request connects.
  - **Returning it:** `Response::release` puts the connection back once the
    body has been read to its framed end (fixed length or last chunk), with
    no buffered byte beyond it. It doesn't if the Engine answered
    `Connection: close`. If the slot is already full, the extra connection
    closes.
  - **Failure:** one attempt per request. A failure on a kept connection is
    that request's failure; nothing is resent. This leaves one race: the
    Engine closes an idle connection between the quiet check and the send.
    Go's `net/http` server, which dockerd uses, sets no idle timeout, and
    the 30 s cap bounds exposure to any proxy in front of it.
- Start keeps its own Upgrade connection. Container create, volumes,
  archive, logs and the listener keep `Connection: close`.

## Proof

`engine_keepalive.rs` uses a scripted Unix-socket Engine that serves each
accepted connection on its own thread:

1. Create, inspect, create, inspect: one connection carries all four, and
   none sends a `Connection:` header.
2. Create, Start, inspect: Start opens its own connection with `Connection:
   Upgrade`, and inspect returns to the kept one.
3. The Engine closes the idle kept connection: the next inspect connects
   anew and succeeds (2 connections, 1 request each).
4. A create answered with `Connection: close` is not kept: the next create
   connects anew.

Revert check: with reuse disabled (`Mode::Keep => None`), tests 1 and 2 fail.
The `layerfs-sandbox` suite passes: 25 tests, 4.3 s. The existing fake peer
(`tests/support/engine.rs`) closes after each response, so its `fixed()`
replies now say `Connection: close`. Real check:
`exec_mount_lookup_real.mjs` passes on `604df2b2` (2.7 s).

## Performance, old vs new

One sample per arm, run back to back in the lead's quiet window (opened
06:13:05Z, builder quiet). Script `core/target/f009/engine-bench.mjs`;
receipts `core/target/f009/engine-bench-{old,new}.json` (every sample) and
`engine-bench-load.txt`.

- **Setup:** daemon `57141b57` and image `d3773b4e` on both arms. Each arm
  gets a fresh Store volume and Init, one Sandbox and one Workspace, then
  runs 30 sequential `sandbox.exec(…, "true")` calls on the traced client,
  as the runner traces.
- **Arms:**
  - old: addon `05b8bd07`, 06:13:43–06:13:47Z, 1-min load 8.50 → 8.62;
  - new: addon `604df2b2`, 06:13:47–06:13:50Z, 1-min load 8.62 → 8.57.

| `exec true`, ms | Old | New | Change |
| --- | --- | --- | --- |
| p50 | 43.89 | 35.11 | -8.78 |
| p90 | 48.63 | 46.82 | -1.81 |
| max | 55.34 | 57.2 | +1.86 |

Reading:
- **p50** falls by 8.8 ms (−20%). Both arms' samples are bimodal: a fast
  mode near 20 ms and a slow one at 35–48 ms. The new arm has more calls in
  the fast mode (9 of 30 under 25 ms, against 2), and the minimum is the
  same (20.4 / 20.8 ms).
- **p90** is about unchanged (−1.8 ms). The slow mode is the Start (Upgrade)
  connection and dockerd → containerd → runc, which this change does not
  touch.
- It saves the two connection setups and teardowns per exec, not the
  launch itself. A long-lived launcher (declined by the owner) is what
  would remove the rest.

## Cost

One idle Unix connection per `Docker` client while kept (at most 30 s).
