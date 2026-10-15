# SDK redesign and UI wiring: real-case verification

> **Status:** Current #328 acceptance specification, 2026-10-15; not a release receipt.
> Tracking: [issue #327](https://github.com/Ephemeral-AI-Lab/layerfs/issues/327).
> Companion to [SPEC.md](SPEC.md). These checks prove behaviour against the real
> product: the daemon, a real Store, a real Sandbox and FUSE Workspaces. They are
> correctness checks, not measurements; no timing they print is a performance claim.

## Ground rules

- **Store profile:** Disposable / WAL / `synchronous=OFF` for every Store, run and
  test. Durable is not executed.
- **Time limit:** every test command has an explicit wall timeout of at most 120 s.
  Build first (`--no-run`, or the JS build) so compilation is not counted. A test that
  reaches the limit has failed as a hang and is diagnosed from source and bounded
  output before any rerun. No repeat loops, no backgrounding a test to wait it out.
- **Bounded waits:** every wait in a test is bounded, and no thread's exit depends on
  another thread finishing without panicking.
- **One attempt:** tests assert the single-attempt outcome. No helper retries or
  re-prepares a failed call.
- **Order, not timing:** concurrency is forced by phase order through the harness
  (mount A, mount B, commit A, commit B), never by sleeps.
- **Fixture:** a small offline web project with local packages, so `npm ci`,
  `npm run build`, `npm run start &` and `npm test` need no network.
- **Equivalence:** where a case also exists in the simulator, the live run must give
  the same outcome codes and the same graph shape (Commit and Layer ids may differ;
  parents, second parents, Branch heads and change sets must match).

## A. SDK cases (JS package against the real daemon)

| ID | Case | Steps | Must hold |
| --- | --- | --- | --- |
| A1 | Init and lazy client | `new LayerFS(projectName)`; first call `project.init` | No I/O before the first call; `Initialized`; main has L0 |
| A2 | Branch files | `fork feature`; positional `fs.write`, `edit`, `apply`, `mkdir`, `cp`, `mv`, `rm` with Branch first and message last | Each write is one Commit on `feature`; main unchanged; `apply` is one Commit |
| A3 | Reads at history | `fs.read`, `list`, `stat`, `grep` at the head and at an older Commit | Older reads return the older bytes; `NoSuchPath` and `IsDirectory` are typed refusals |
| A4 | Diffs | `diff_files`, `diff_commits`, `diff_branches` | Equal versus Text; path-level kinds match the writes made |
| A5 | Fork from a Commit | `branch.fork("try", C3)` | Metadata only: head is C3, no new objects |
| A7 | Background process | `operator.process.start(id, path, "npm run start")`; `unmount` | `Busy` while it runs; after cancel through the runtime owner, `Dirty` then `unmount({ discard })` |
| A8 | Shared localhost | Server in Workspace 1; `curl` from Workspace 2 in the same Sandbox | Workspace 2 reaches the server |
| A9 | Historical open row | Preserve Phase 2 FAIL and original receipt | Remains open in the historical ledger; new cross-process acceptance is XPROCESS |

## B. Commit, merge and conflict cases

| ID | Case | Steps | Must hold |
| --- | --- | --- | --- |
| B1 | Fresh commit | Mount, change a file, commit | Committed; no `merged` field |
| B2 | Stale, clean | Mount A and B at C1; A changes `x`, B changes `y`; commit A, then B | B is Committed with `merged { from: C1, head: A's Commit }`; the head has both changes; B's Workspace base is the new head |
| B3 | Stale, conflict | A and B change the same line; commit A, then B | B is refused with `Conflict`; the Branch head is still A's Commit; B's file holds one marker block with both lines; B's base is A's Commit |
| B4 | Markers block commit | Commit B again without editing | `Conflict { markers }`; nothing committed |
| B5 | Resolve | B deletes the losing line and the markers; commit | Committed as a normal Commit on the head |
| B6 | Dirty unmount | Unmount with uncommitted changes | `Dirty` lists the paths; `unmount({ discard })` drops them |
| B7 | One attempt | Barrier: the head moves after B's merge and before its publish | B returns `HeadMoved`; it does not merge again; the head is the other Commit |
| B8 | Force | Stale Workspace, `commit({ force: true })` | Overwrites; the displaced head is reported |
| B9 | Large and binary files | Both sides change a file above the text bound, and a binary file | Each conflicts whole; resident memory does not grow with file size |
| B10 | `.lww` (cond.) | `.lww` includes `.gitignore`; two Workspaces build and commit | No conflict on `.next/`; the newer write is kept and reported |
| B11 | Branch merge, fast-forward | `merge(a, b, c, message?)` where `b` is an ancestor of `a` | `Merged { fastForward }`; `c` points at `a`'s head; no new Commit |
| B12 | Branch merge, clean | Different files on `a` and `b` | `c` has one new Commit with two parents; `a` and `b` unchanged |
| B13 | Branch merge, conflict | Same line on `a` and `b` | `Conflict` lists the file with both lines; no Branch `c` exists afterwards |
| B14 | Merge again | Make `a` and `b` agree on the line; merge again | `Merged`; `c` exists |
| B15 | Publish | Publish `c`; publish again; publish a Branch whose base main has passed | `Added`; then `UpToDate`; then `Added` with `overwrote` listing main's skipped Layers |
| B16 | Staging removed | Schema and catalog after the change | No `workspace_stage` table; Commit works with an expected head only; no stage token anywhere in the protocol |

## C. Inspect and UI-support cases

| ID | Case | Must hold |
| --- | --- | --- |
| C1 | Snapshot after each B step | Branch heads, Commit parents and second parents, Layers and Workspace bases match the state the SDK calls produced |
| C2 | Version | `operator.inspect.snapshot(since)` returns "unchanged" when nothing changed and a new version after any Commit, merge, publish, mount or unmount |
| C3 | Stale flag | After another Workspace commits, `headMovedSinceMount` is true for the older Workspace |
| C4 | Process state | The local server lists the process it started and cancels it; the daemon holds no process record |

## D. UI integration with `sdk-sim-terminals`

| ID | Case | Must hold |
| --- | --- | --- |
| D1 | Backend switch | `tui.html?backend=sim` behaves as today; `?backend=live` talks to the local server |
| D2 | Stories headless | `test_live.js` plays the Tour, Conflicts, Commit & merge and 5 agents stories against the live backend; every step's outcome code equals the story's expectation |
| D3 | Sim and live agree | Each story's final graph shape equals the simulator's (section "Equivalence") |
| D4 | Conflict in the UI | The Conflicts story shows the refusal, the markers in the kept Workspace window, and the resolving Commit on the graph |
| D5 | 5 agents | Up to five windows open and close with their mounts; the server window keeps serving while other calls commit; all windows are closed at the end |
| D6 | Browser check | The live UI runs a full story in the in-app browser with no console errors |

Each D case runs a story as several commands, one story per command, each under 120 s.

## #328 and operator acceptance

Retired harness A6 and agent/call attribution C5 tests are deleted. Their earlier
receipts remain historical; no retired feature is adapted into a new test.

| ID | Scope | Required checks |
| --- | --- | --- |
| S328 | 29 public methods and operator boundaries | Positional calls/messages; pageSize/pagePos and deep offsets; line windows/huge prefixes; blame messages; atomic apply and failing index; recursive copy/move/remove with symlink/mode/hardlink preservation; streaming large edit; real Store/Commit/file/Workspace statistics/history; merge/publish; public refusal of operator names |
| XPROCESS | Fresh Node discovery and ownership | Saved Sandbox ID/mount path; status/exec/commit without Init/install; cross-process process list/cancel; project reads reopen shared service; original process sees Commit and can clean up |

Run one case per command, after building host addon and Linux daemon from the
committed source, with `LAYERFS_CONSTRUCTION_WORKERS=1` and an explicit 120-second
wall wrapper. `node sdk/js/test/verify/run.mjs <case>` writes a fresh receipt.
B7 remains a deterministic race-proof gap: no pause hook exists and sleep-based
race injection is excluded. Do not label SKIP as PASS. B9 checks semantic conflicts,
not a new memory-flatness qualification. The read bound is 48 KiB/2,000 lines;
oversized blame middles explicitly disclose `comparisonCoarse`. Deep page offsets
are documented linear skipping. Null per-file physical attribution is expected.

Counter retention additionally requires its prospective component speed/storage
screen, independent verification and preserved failed earlier versions. Live
stories do not substitute for that screen. Durable is NOT_RUN — disabled by owner
until explicit reauthorization. Reaping and replaced-inode policy remain deferred.

## Done when

- Required public/operator cases and covering A/B/C cases pass against the real daemon in Disposable mode, each command under 120 s; historical/open/skipped rows are explicitly retained.
- D2 and D3 pass for all four stories; D6 is checked once at the final commit.
- Results, including any failures, are recorded with the commit and command that
  produced them. Failed or skipped cases stay in the record.
