# #327 Phase 3: the UI on the real product

> **Status:** Dated planning checkpoint (2026-10-15); not release evidence or a
> product contract. Tracking: [issue #327](https://github.com/Ephemeral-AI-Lab/layerfs/issues/327).
> Records the [VERIFICATION](VERIFICATION.md) D results: the simulator UI
> running on the JS SDK through a local server ([SPEC](SPEC.md) section 4). These
> are correctness checks. No timing below is a performance claim.

## Identity

| Item | Value |
| --- | --- |
| Commit | `725c34c6d` (tree `7d1be86a3ad0`), branch `issue327-sdk-redesign` |
| Linux daemon | `core/target/issue327/layerfs-daemon`, sha256 `9ed262055417a20509e87949ae1def6de9493c125f44a8bcf8518672445f6898` (unchanged since Phase 2) |
| Node addon | `sdk/js/native/layerfs.node`, sha256 `652d34d6c855fb6c…` (unchanged) |
| Host Node | v24.21.0 |
| Store profile | Disposable / WAL / `synchronous=OFF`; Durable not executed |
| Construction | `LAYERFS_CONSTRUCTION_WORKERS=1` was set for the A and B reruns. Only benchmark examples and daemon tests read it; product Commit construction has one producer in normal wiring |

## What runs where

- **Backends.** `tui.html?backend=sim` (the default) runs the model in the page,
  as before. `tui.html?backend=live` sends every call to the local server.
  `backend/sim.js` and `backend/live.js` give the terminal Engine the same
  asynchronous surface; the Engine, the player and the click handlers await each
  call. A live page starts a fresh project, keeps nothing in localStorage, and
  shows a failed request as a toast.
- **Local server.** `node sdk_sim/server/server.mjs [port]` serves `sdk_sim/` on
  127.0.0.1 (port 8327 by default) and runs the JS SDK, one call at a time.
  - A reset makes a fresh Docker volume, copies the offline fixture and runs Init.
  - Stopping the server closes the project: Sandboxes and volume.
  - The server answers each call in the simulator's outcome envelope, plus a
    mirror of the project in the simulator's shape. The mirror is built from
    `inspect.snapshot` and from what only the calls report: fork points, merge
    details and displaced heads.
  - The UI sees display ids (C1, L0, R0, sb_01), including inside command
    output such as conflict markers. It never sees real ids.
- **Commands are real.** In live mode, shell lines run with `sandbox.exec`; `&`
  runs in the background. The Sandbox's first process is the daemon.
- **Headless.** `stories.js` plays a demo story on either backend, in the
  player's order. `test_live.js <story>` plays it live and then on the simulator,
  checks D2, D3 and (for the agents story) D5, and writes a receipt under
  `core/target/issue327/verify/`.

## D results at `725c34c6d`

Each command ran on its own with a 120 s wall cap (`tmo.py`, which kills the
process group at the limit).

```bash
python3 tmo.py 120 node sdk_sim/test_live.js <tour|conflicts|merge|agents>
```

| Case | Story | Result | Time | Receipt | Detail |
| --- | --- | --- | --- | --- | --- |
| D2, D3 | Tour | PASS | 4.7 s | `d-tour-mv974l5z` | 24 steps |
| D2, D3 | Conflicts | PASS | 3.5 s | `d-conflicts-mv974o81` | 15 steps |
| D2, D3 | Commit & merge | PASS | 3.6 s | `d-merge-mv974rdd` | 21 steps |
| D2, D3, D5 | 5 agents | PASS | 18.4 s | `d-agents-mv9755yj` | 52 steps. At most 4 Workspaces mounted after any call. The dev server ran across 21 steps with its Workspace mounted. None mounted at the end |

No story needed a `live:` expectation override. Every live outcome code equals
the simulator's expectation. D3 compares main's head, the Layers (parent, source
Branch, source Commit), the Branches (base, head, fork point) and the Commits
(Branch, parent, merged-from, merge origin, kind).

The browser checks used the in-app browser on `node sdk_sim/server/server.mjs 8327`,
started from the preview tool, in a fresh tab. D4 and D6 ran at `725c34c6d`. D1
ran just before the commits, on `sdk_sim` sources identical to `725c34c6d`. The
D5 window check ran one edit earlier: the player-caption fix below came after it,
and that fix does not touch windows or mounts.

| Case | Result | How |
| --- | --- | --- |
| D1 | PASS | `?backend=sim`: all four stories, replayed through the player, end on the same Branch heads and main as the headless simulator, and every step's outcome equals its expectation. `?backend=live`: the same four stories through the player match too (the four stories took 8, 3, 4 and 15 s) |
| D4 | PASS | Conflicts, live. After step 5 the window shows the `Conflict` refusal and a `✕ 1 conflict` pill. `cat` shows the markers (`>>>>>>> feature@C1`) in the kept Workspace `sb_01:/workspaces/1`. After step 8 the graph shows the resolving Commit C2 (parent C1) on feature, and the pill clears |
| D5 | PASS | 5 agents, live, through the player. Every agent window matched a mounted Workspace at every render. Peak: 4 windows and 4 mounts. The dev server's window was open for all 21 steps its process ran. 0 windows and 0 mounts at the end |
| D6 | PASS | The Conflicts story was picked in the player's story menu and played at normal speed in 35 s: 15/15 steps matched, with no console messages of any level. Checked once, at `725c34c6d` |

Earlier D runs at uncommitted states are superseded by the runs above. One of
them failed and the failure is kept: `d-merge-mv969uk1` failed D3 before the
merged-from fix (below).

## Other reruns at `725c34c6d`

| Check | Result | Command or receipt |
| --- | --- | --- |
| Simulator steps | 97/97 | `node sdk_sim/test.js` |
| Demo stories on the simulator | 112/112 | `node sdk_sim/test_demo.js` |
| Terminal expectations | all met | `node sdk_sim/test_terminal.js` |
| A6 | PASS, 4.0 s | `a6-mv9760e5` |
| A7 | PASS, 2.3 s | `a7-mv9769va` |
| A8 | PASS, 2.5 s | `a8-mv976c1j` |
| B10 | PASS, 2.6 s | `b10-mv976eaf` |

A6, A7, A8 and B10 run the fixture's `next build`. They were rerun because the
fixture now writes a random `BUILD_ID`, like Next.js does, so two Workspaces'
builds differ and merge by the `.lww` rule, as the simulator shows. The other
A–C results are those in [PHASE2](PHASE2.md). The core sources and the daemon
binary are unchanged since then.

## Defects found and fixed

- **Commit attribution over 128 bytes.** The daemon limits `agent` and `call` to
  128 bytes with no control character. An agent's long command line made the
  Commit fail at encode, before anything was sent (`attempted: false`). The
  server now shortens attribution to fit, with an ellipsis.
- **Re-Init in one process.** The addon keeps every project name it has
  initialized, so a second reset failed with `Exists`. Each reset after the first
  now uses a new name: `website-2`, `website-3`, and so on.
- **Merged-from a Layer.** A Commit record cannot name a Layer as the base it
  merged from. The mirror takes it from the commit answer instead, falling back to
  the Layer the Workspace was bound to. This fixed the failed D3 above.
- **Markers showed real ids.** Command output now maps known Commit and Layer ids
  to display ids.
- **Player caption after an instant unmount.** When a step unmounted during an
  instant seek, the caption showed "no SDK call", on the simulator too. The
  player now keeps the newest call outcome after its pane closes.

## Tests

No tests were deleted. `test_demo.js` and `test_terminal.js` were converted to
the async Engine on the sim backend, with unchanged results. `test_live.js` is
new.

## Commits

| Commit | Change | Production LOC |
| --- | --- | --- |
| `6f88feafa` | (19) Simulator UI over an async backend, sim or live | 84,814 → 84,814 (0) |
| `725c34c6d` | (20) Local server for the live UI and the D2–D5 story test | 84,814 → 84,814 (0) |

`sdk_sim` is demo tooling outside the production scope (SPEC section 1.4). The
fixture and the verify helpers are tests.

## Open items for the owner

These are new in Phase 3. The Phase 2 items stand, and A9 is still open.

1. **No project close.** The addon's project registry lives for the whole
   process, and nothing removes a name from it. A long-lived host can't re-Init
   a name.
2. **Attribution limit is not a refusal.** An overlong `agent` or `call` fails
   as an encode `Failure`, not an `InvalidInput` refusal from the SDK, and the
   limit is not in the SDK's documentation.
3. **Commit records and Layers.** A merged-from Layer is only in the commit
   answer. The read model cannot rebuild it after a restart.
