# LayerFS × DSH

`dsh-layerfs` is a plugin bundle for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (dsh). It changes no dsh code.

With the bundle, agents in a dsh session work on a LayerFS project from bash, through short Node scripts that use the LayerFS JavaScript SDK. They fork Branches, test them in Sandboxes, and merge and publish. The conversation gets a **LayerFS** tab that draws what each agent did, subagents included. The design is in issue #346.

## What it adds

| Piece | Package | Where it shows |
|---|---|---|
| Host plugin `layerfs-host` | `@dsh-layerfs/host` | bash environment, session records, the `/layerfs` web route |
| Client plugin `layerfs-client` | `@dsh-layerfs/client` | LayerFS tab, project picker, LayerFS panel (dsh web) |
| Agent preset `layerfs-dsh-minimalist` | `dsh-layerfs` (`presets/`) | "LayerFS × DSH minimalist" in the preset menu |
| View model | `@dsh-layerfs/model` | used by the client and `sdk_sim/dsh_design.html` |
| Renderer | `@dsh-layerfs/view` | used by the client and `sdk_sim/dsh_design.html` |
| Mock model `layerfs-mock` (demo bundle `dsh-layerfs-demo`) | `@dsh-layerfs/mock` | "LayerFS mock · …" models in the model picker |

### Host plugin

- **Bash environment.** A bash call in a session bound to a project gets:
  - `DSH_LAYERFS_PROJECT` and the deployment settings;
  - `DSH_LAYERFS_SDK` and `DSH_LAYERFS_OPERATOR` (file URLs of the SDK);
  - a trace file per agent (`DSH_LAYERFS_TRACE`) and the bash call id as the trace step.

  The SDK reads the `DSH_LAYERFS_*` names as fallbacks for its own `LAYERFS_*` settings.
- **Records.** Each finished SDK call becomes a `plugin:layerfs/call` record in the calling agent's own session. The root session gets one `plugin:layerfs/project` record.
- **Journal.** Finished lines are also journaled per root session under the state folder, because trace files live in temporary storage.
- **Projects.** Each project is attached to at most one workspace folder, or detached; a folder can have several. Init imports a source folder (the workspace folder unless another is chosen) and attaches the new project to the workspace folder. A session uses the folder's only (or last used) project unless it picks another or none. The choice is fixed at the first bash call that uses it.
- **Agent names.** Subagents are named by the label their parent gave them.
- **Web route.** `/layerfs` sits behind dsh's own connection checks:

  | Request | Answer |
  |---|---|
  | `GET /layerfs/status` | configuration |
  | `GET /layerfs/workspace?folder=` | a folder's projects |
  | `POST /layerfs/init {folder, source?, name?}` | check the request and start Init; answers its job at once |
  | `GET /layerfs/init/<job>` | the Init's step (`scan`, `volume`, `import`, `done` or `failed`), the source's file and byte counts, then its project or error |
  | `GET /layerfs/session/<id>` | project, agents and trace lines of the session's root |
  | `POST /layerfs/session/<id>/project {project}` | choose a project, or `null` for none |
  | `GET /layerfs/session/<id>/state` | the project as `inspect.snapshot` reports it |
  | `GET /layerfs/session/<id>/tree?ref=<saved id>` | a Commit's or Layer's files |
  | `GET /layerfs/projects` | every project and the workspace folder it is attached to |
  | `GET /layerfs/project/<name>/state` | the project as `inspect.snapshot` reports it, plus who made each node and when Layers and forks happened, from the journals |
  | `GET /layerfs/project/<name>/tree?ref=<saved id>` | as the session's tree route |
  | `POST /layerfs/project/<name>/attach {folder}` | attach to a workspace folder, or `null` to detach |
  | `POST /layerfs/project/<name>/remove {confirm}` | remove the project; `confirm` must repeat its name |

  Init first counts the source (every entry, links not followed, as LayerFS reads it), then makes the volume, then runs LayerFS's Host Init, which scans and imports on the Host and seals the Store under the LayerFS home. The project's first Sandbox installs that Store into the volume later. While LayerFS imports, the Host reads its counts every 250 ms (the SDK operator's `project.progress()`: step, entries scanned, files and bytes built) into the job's `imported`. The page reads the job every 300 ms and fills the bar from those counts over the Host's totals: scan 0–15%, files 15–95% (bytes plus 4 KB per file), then tree, publish and seal.

  Removal deletes the project's Docker volume and LayerFS home entry, and drops it from the bindings; sessions on it become unbound. It is refused while any container still uses the volume. Workspace files and transcripts stay. A LayerFS project is its home entry, so a removed name can be initialized again at once.

  The Host reads each project (state and trees) through one shared SDK client, so it starts the project's service Sandbox once and releases it after a quiet minute. The SDK takes a project's discovery lock while a client starts or attaches that Sandbox and refuses a second client at the same moment as `Busy` (no retry); the page then says so and asks for Refresh.

  Trees are bounded: 4000 entries, 128 KB per file, 8 MB in all. `node_modules`, `.git`, `.next`, `dist` and `build` are listed but not opened.

### Client plugin

- **The LayerFS tab** (beside Chat and Trajectory) replays the root session's lines while it is shown and draws:
  - the project terminal with agent tags;
  - Branches and Sandboxes;
  - History and Files;
  - the status bar and the avatars.

  An unbound session shows Setup: pick one of the folder's projects, or Init.

  **Playback.** The tab plays calls in step with the run, for real agents and demos alike ([`playback.ts`](packages/client/src/client/playback.ts)):
  - each call shows 2 s after it ended, so the gaps on screen are the run's own gaps and the tab never falls behind. The 2 s are longer than the Host poll (1.5 s), so a call is usually here before its time;
  - calls whose time has passed (the tab opened, a rebuild when an agent is named, a late poll) appear at once, drawn once. Nothing plays twice;
  - a bash call that mounts, runs, commits and unmounts a Workspace within a second shows each step at its time, and the Workspace's pane then fades out over 1.2 s ("unmounted"), a trail kept by the view only ([`view.js`](packages/view/src/view.js)).

  **Demo speed.** A demo's strip, above the composer, has a speed control beside Sim and Live: 1×, 2×, 4× and Max. It sets how fast the mock runs the demo, not how fast the tab animates it: the speed divides the scenario's pauses and the typing between streamed words, and Max leaves them out ([`pace.js`](packages/mock/src/pace.js), `POST /layerfs-demo/<id>/speed`). A pause under way follows a change at once. Commands, LayerFS calls and waits on other agents take their own time at any speed. A demo starts at its scenario's `speed`, 1× for every demo. Where a scenario's pauses order two agents' commits (5 agents: ben's `--lint` lands before cy's `--profile`, which then conflicts), a faster speed narrows that margin while the commands keep their time, so a planned Conflict may not happen; check-demo then fails it. It applies to a run under way too; the LayerFS tab has no speed control.

  **Terminals and their command lines.** Every SDK call an agent makes prints one command line in one terminal. The single table for both is [`packages/model/src/cli.js`](packages/model/src/cli.js); `node packages/model/tests/cli.mjs` fails when an SDK or operator method has no row there.

  | Terminal | Prints | Calls |
  | --- | --- | --- |
  | project (one per project) | the project, its Branches, Sandboxes' lives | `project.*`, `branch.*`, `sandbox.create`, `sandbox.close`, and a mount that failed (it has no pane) |
  | fs (one per Branch) | Store reads and writes on that Branch | `fs.*` |
  | workspace (one pane per mounted Workspace) | the Workspace's life and the commands run in it | `sandbox.mount`, `sandbox.exec`, `sandbox.status`, `sandbox.commit`, `sandbox.unmount`, operator `process.start` and `process.cancel` |
  | none | the client's own calls and operator reads | `sandbox.service`, the other operator methods |

  A command line is `<group> <method> <required args> [--optional value] [-m "message"]`, using the SDK's own group and method names: `branch merge feature try-ui release -m "join"`, `sandbox create tester docs sha256:2d929c6d66c2`, `fs read /app/page.tsx --start-line 5`, `sandbox commit -m "add hero" --force`.
  - Required arguments are positional, in SDK order. Optional ones are `--kebab-case` flags shown only when they differ from the SDK default; a true boolean is a bare flag (`--force`, `--discard`).
  - An image is shortened to `sha256:` and 12 hex digits. File content is never printed, and `fs apply` shows its change count.
  - A line does not repeat what its terminal names. The fs terminal hides the `fs` group and the Branch (`read /app/page.tsx`); a workspace pane hides the `sandbox` group, the Sandbox and the path (`commit -m "add hero"`, `unmount --discard`), but keeps the operator's `process cancel`. The project terminal prints every group. `fs diff_files` prints both of its refs.
  - A command run in a Workspace prints as the shell command itself, and a background start ends with ` &`.
  - Reads (`list_*`, `diff_*`, `fs read/list/stat/grep/glob/blame/diff_files`, `sandbox status`) and `sandbox mount` are dimmed.
  - A call with no row prints its own name, dimmed, in the project terminal.

  The composer is hidden while the tab shows; switch to Chat to send a message.
- **The project chip** sits in the New Session row beside the preset chip, drawn like dsh's own chips. Its menu lists the folder's projects and "No LayerFS", with "Import project…" pinned below. Like "Add workspace…", Import opens the directory picker (Finder in dsh web on a Mac); the chosen folder becomes a new project attached to the workspace folder and is chosen for the session. While it imports, a card under the chip shows the percentage, the step with its counts ("Importing 12,000 of 30,000 files · 40 MB of 90 MB") and the elapsed time over a bar. The bar moves without a fraction while the Host counts the source; the Init dialog shows the same.
- **The LayerFS page** (sidebar) has one tab per project. Each shows:
  - ellen_joe, with a line on where `main` is and what was published last;
  - the workspace the project is attached to, which you can change or detach (a session already on the project keeps it);
  - History and Files side by side, where clicking a History node shows Files at that point;
  - "New LayerFS session" in the attached workspace, on the preset;
  - "Remove project…", which asks for the project's name before removing it.

  Workspaces without a project offer Init.
- **The Init dialog** (Setup and the page) imports the workspace folder by default. "Choose folder…" browses for another source: in the page where dsh offers it, otherwise with the native picker. The project is attached to the workspace folder either way. The name is optional and defaults to the source folder's.

### Preset

The preset has bash with background jobs, subagents (spawn) with their control tools, and compaction. It has no read, write or edit tools. Its persona carries:
- an SDK cheat-sheet with a stdin script template;
- the working rules: one Workspace per agent, merge conflicts belong to whoever merged, only the main agent publishes, run again on `Busy`, close every Sandbox.

Run the preset's sessions in Workspace Write mode; subagents inherit it.

### Mock model and demos

The `dsh-layerfs-demo` bundle adds the LayerFS mock model: an LLM provider that is explicitly not a language model. Each scenario in `scenarios/` becomes one model, "LayerFS mock · <title>". It replies with scripted calls to the preset's own tools: bash, subagent, send_message, list_agents and the job tools. dsh runs those calls for real, against a real LayerFS project, and subagents inherit the mock model, so they run their own part of the script. No API key is needed.

| Demo | Agents | Shows |
|---|---|---|
| `tour` | root | the design preview's Tour, 24 steps: fs Commits, a Sandbox terminal that installs, fails lint, builds and serves (unmount Busy), a stale Workspace that merges on commit, a second Workspace, a fork from a Commit, two publishes |
| `parallel` | root, header, footer | two subagents on their own Branches; the root publishes one, then asks the other to merge main in first |
| `conflicts` | root | the design preview's Conflicts, 15 steps: a commit Conflict resolved in the Workspace, a merge Conflict resolved by making the Branches agree |
| `merge` | root | the design preview's Commit & merge, 21 steps: a clean stale commit, a commit Conflict, merge into a new Branch, a merge Conflict, publish |
| `sandbox` | root | one Sandbox with two Workspaces, a background build job, and the MountsActive, Busy and Dirty refusals |
| `agents` | root and five | the design preview's 5 agents, 52 steps (62 bash calls): a Workspace per call in each Branch's shared Sandbox, stale merges, `.lww`, a same-line Conflict fixed in the kept Workspace, a dev server and curl, a try on a fork, merge, publish and blame |
| `shop` | root | Live only. #334's Builder 2 replayed, 19 steps: a small web shop built over six milestones, 12 recorded commands (npm, esbuild, node tests, a server smoke) run again |
| `depot` | root | Live only. #337's Builder 2 replayed, 103 steps: a Rust inventory service and its browser client, 82 recorded commands (cargo fetch and builds from crates.io, cargo and Python tests, Chromium) run again in Workspaces that stay mounted across steps |
| `crew` | root + 5 | Live only. #340's Builder 2 r3 replayed, 1,550 steps: a lead and 17 agents playing as 6 roles build one application on Branches of their own; 304 recorded commands, of which the 147 that only verify and belong to a browser proof are disabled (their run files say `"verification": "no-browser"`) and the other 157 run; the roles run at the same time and wait for each other only where they touched the same Branch |

#### Replayed runs

`shop`, `depot` and `crew` (see [#347](../core/docs/issues/347/SPEC.md)) replay a recorded application run on Live LayerFS. Each scenario sets `"live": true`, so the strip offers only Live and the Host refuses a Sim Init of its project; `image` names the runtime image its Sandboxes use, and `seed.json` is the folder the original Init imported, which Play writes out once under `<profile>/dsh-layerfs-demo/seeds/` and Inits from. Each bash step is `step(<NNN>)` of [`scenarios/shared/replay.mjs`](scenarios/shared/replay.mjs), which makes the recorded SDK calls of `run/NNN.json` in order: recorded writes are applied as they were, recorded commands run again in a Workspace of the same Branch (except, where the run file says `"verification": "off"`, those that only verify: their step says so and runs nothing), and each reply must be the recorded one (a command's exit code included), or the step exits 1 and the run stops. `final.json` holds each tracked file's SHA-256 on the recorded final `main` and each Branch's recorded history, for check-demo; its `varies` names what a replay cannot reproduce byte for byte (a clock reading in a name, SQLite databases, bytecode, server logs), decided from the record.

`tools/import-run.mjs` generates these folders from a run's records and a restored copy of its stopped Store (`tools/restore-store.mjs`). It keeps steps that write, run a command or change history and drops reads; pauses are `clamp(gap × k, 400, 3000)` ms with `k` set so they add up to the demo's target thinking time.

dsh's bash tool reports a command that exits non-zero as an ordinary result ending in `[exit code: N]`; the mock stops the run on that marker (and on a signal or timeout marker) as it does on an error result.

A scenario is `scenario.json` (format `layerfs-mock-scenario` version 2), with its `scripts/` or a shared `lib`. Each agent has a list of steps:
- a call step: one preset tool and its arguments. A bash step names a `script` (sent as `node --input-type=module <<'JS'`), a `run` (calls of the scenario's `lib`, imported and awaited in such a script) or a `command`. `expect` lists the LayerFS outcomes its trace should show, `retry` reruns it on matching output, and `as` names a background job;
- a reply step: the turn's closing text. `until` makes the agent wait for those subagents to report first;
- a pause step: milliseconds before the next step.

`@name` in an argument is a subagent or job started earlier. A subagent's `description` is its name in the scenario. `order` places the demo in lists and `speed` sets how fast the mock runs it at first. Every scenario's `fixture` is `demo-workspace/`, the shared website; its install, build, test and serve are small shell scripts, not npm: test checks each page's heading and that every `@/…` import resolves, and serve answers each page's heading on localhost:3000 (with python3). The sandbox demo's scripts keep their notes between bash calls under `<temp>/dsh-layerfs/demo-notes/<project>/`, outside the workspace folder, because Init imports everything in it.

The tour, conflicts, merge and agents demos are the design preview's stories ([`sdk_sim/demo.js`](../sdk_sim/demo.js)) step for step, without its captions and progress cards: each step is one bash call of [`scenarios/shared/terminal.mjs`](scenarios/shared/terminal.mjs), which makes the same SDK calls as that step's terminal line and prints what the terminal printed (`npm ci`, `npm run build`, `npm test` and `npm run start` become the shell scripts). An agent's call mounts a Workspace of its own in its Branch's shared Sandbox, runs, commits and unmounts; after a Conflict the Workspace is kept for the agent's next call, and a trailing `&` keeps it for the server. The lead wakes the agents of each step with send_message and waits for them; each agent's pause is the preview's thinking time, and the call takes its typing and running time, so a burst's calls overlap and commit in the same order as in the preview. The calls keep their notes (a terminal's Workspace, an agent's kept one, the C<n> labels) under the project's LayerFS home entry, which is removed with the project.

#### The demo workspace

With the bundle installed, dsh web gets a workspace for `dsh/demo-workspace` with one session per demo, in scenario order. The client registers the workspace and makes any missing session when it loads. Each session opens with "What does this demo show?", which the mock answers with the demo's blurb and agents; dsh's sidebar lists no session before its first turn.

The demo sessions belong to their demos, so the client hides dsh's controls that would add, fork, archive, pin, rename or move one: the workspace row's New session and menu, each session row's menu, Archive and Pin, rename by double-click, dragging, the chat's Branch button, and the fork, archive and rename shortcuts while a demo session is open. The workspace's folder row has a violet gradient and a DEMO badge. dsh has no per-workspace setting for these: a stylesheet keyed to the sidebar's row keys and the chat's session attribute hides them, and the client's key listener runs before dsh's.

Above the composer of a demo session, one strip shows:
- a progress bar: the steps every agent has finished out of all the scenario's steps, from the mock's own replies, with the root agent's phase and the elapsed time;
- Sim or Live: the simulator or real LayerFS. The choice is kept in the browser;
- Play, or Replay after a run.

Play (Replay after a run, also allowed while one goes) runs the demo in a new session that takes the old one's place; dsh cannot empty a session. In order:
1. A session is made in the demo workspace at the old one's place, with the preset, the demo's title and its mock model. The sidebar lists it only from its first message.
2. The old session is archived, with its turn, subagents and jobs stopped.
3. The demo's projects are removed, and its project for the mode (`demo-<id>`, or `demo-<id>-sim` on Sim) is Inited again from `demo-workspace/`, with the Init's progress on the bar. Removal stops the Sandboxes a stopped run left open (only Play asks for that; removing other projects still refuses while a Sandbox runs) and clears their records in the LayerFS home.
4. The new session becomes the demo's, the project is chosen, "Run the demo." is sent, and the new session opens.

Each step is attempted once. A failure before step 4 unarchives the old session, which stays the demo's, archives the unused new one, and shows the message on the strip. The strip reads the demo again as soon as Play ends. A run stops on the strip when a request of it is aborted, or, for a stop between requests, which the mock does not see, once dsh says the root session is not running and no step has finished for 4 seconds. When the client loads, a demo whose session is gone or archived gets a new one, opened with the intro question.

The Host side is the mock plugin's `/layerfs-demo` route. It serves the workspace folder, the demos, each demo's session (kept in `<profile>/dsh-layerfs-demo/sessions.json`) and each demo's latest run.

#### Simulated projects

Sim needs no Docker, image or daemon. `POST /layerfs/init` with `backend: "sim"` imports the folder into the simulator (`packages/host/src/sim/`) instead of a Store. A simulated project's bash calls get the SDK on the simulator as `DSH_LAYERFS_SDK`, so the same scripts run on both:
- `sim/sdk.js` is the SDK itself with `LAYERFS_NATIVE` set to `sim/binding.js`, a native binding in JavaScript. The SDK's argument checks, refusals and trace lines are unchanged.
- The binding's decisions (Commits, stale Workspaces, merges, conflict markers, `.lww`, publish) are `sdk_sim`'s model. Its answers have the real binding's shapes and LayerFS's id formats, so the views and checks read both alike.
- The state is `<LayerFS home>/<project>/sim/state.json`, changed by one call at a time under a lock file.
- A mounted Workspace is a folder, `sim/ws/<sandbox>/<n>`. Commands run there with `/bin/sh`, and each call reads the folder back. On macOS a GNU-compatible `sed` (`sim/sed.js`) comes first on the command's PATH.
- Background processes run detached and leave their exit code in `sim/proc/`. Removing the project stops them.

The Host's own reads of a simulated project (Init, state, trees, storage) go to the binding directly. Store sizes are estimates from file text. Sim runs commands on the Host without a container.

Known limits:
- dsh's sidebar orders sessions by last activity by default, so the demo played last moves to the top. The manual order keeps each demo's place.
- Sim imports the `sdk_sim` model from this repository, so the Host package needs the repository beside it to Init or read a simulated project.
- `demo-workspace` is inside this repository. A turn's "Edited" card lists every change made in the repository during the turn, including other work in the checkout.

## Install into a dsh profile

You need:
- Node 22.19 or newer, pnpm, and Docker;
- a dsh checkout beside this repository (`../deepseek-harness`), or `DSH_SOURCE` set to one; the client bundle is built with its `tsdown` and `tsdown.client.ts`;
- a LayerFS runtime image digest and a built Linux `layerfs-daemon`.

1. Install and build:

   ```sh
   cd dsh && pnpm install && pnpm run build
   ```

2. In the profile's `package.json` (`$DSH_HOME/profiles/<profile>/`), add the bundle as a dependency and to the profile's bundles. Then run `pnpm install` there:

   ```json
   {
     "dependencies": { "dsh-layerfs": "link:/path/to/layerfs/dsh/packages/dsh-layerfs" },
     "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-layerfs"] } }
   }
   ```

3. Give the Host its deployment settings in the profile's `cordis.patch.yml`:

   ```yaml
   - id: layerfs-host
     config:
       image: sha256:…          # LayerFS runtime image digest
       daemon: /path/to/layerfs-daemon
       # docker: /var/run/docker.sock   (default)
       # stateDir: <profile>/dsh-layerfs  (bindings, agent names, line journal)
       # home / traceDir: <os temp>/dsh-layerfs/{home,traces}
   ```

   Keep `home` and `traceDir` in the OS temp area: bash calls in Workspace Write mode run in dsh's sandbox, which lets them write only there, and a LayerFS call there writes both (a `sandbox.create` elsewhere fails `PermissionDenied`).

4. Start dsh web (`pnpm dsh web` in the dsh checkout, with `DSH_HOME` set).
   1. Open the LayerFS panel and Init a workspace.
   2. Start a "New LayerFS session".

Only dsh web is checked; dsh desktop serves the same web client but was not tested. The headless profile composes no preset registry, so there the preset is not offered. The Host and the bash environment still work there.

## Develop

| Command | Does |
|---|---|
| `pnpm test` | Host tests, the mock model's scenario tests, and the model's trace replay check |
| `node ../sdk_sim/test_dsh_view.mjs sim` | the view model against the simulator's stories |
| `node tools/init-project.mjs <profile dir> <folder> <image> <daemon>` | Init outside dsh |
| `node tools/demo.mjs [<demo> <folder>]` | lists the demos, or copies the demo website into another folder |
| `node tools/check-demo.mjs '<dsh web URL with ?token=…>' <session id> <demo> [--wait <s>]` | checks a finished demo session: every agent ran, and each bash step with `expect` left those LayerFS outcomes on the trace. For a replayed run also: no Sandbox of the project is open, every Branch's history is as recorded, and `main`'s tracked files match `final.json` |
| `node tools/run-scenario.mjs <demo> --out <dir> [--pace] [--keep]` | plays a replayed demo headlessly on Live LayerFS, without dsh web or the mock model, agents at the same time, then runs the same gates and writes `receipt.json`. Pauses are skipped unless `--pace`; order comes only from the recorded order and `until` |
| `node tools/restore-store.mjs <id> <folder with global/> <work dir> <project>` | opens a copy of a stopped Store in a new volume and LayerFS home, for `import-run.mjs` (needs `LAYERFS_READER`, a checkout built at the Store's schema) |
| `node tools/history/plan.mjs --repo <dsh.git> --out <dir> [--seed 352] [--from N]` | the #352 history replay plan: ranges, lanes, agents, steps and planned conflicts, from a full bare clone of deepseek-harness; checks that each range's plan alone reaches its checkpoint. `--from N` rewrites only ranges N and later |
| `node tools/history/oracle.mjs build\|checkout …` | each range's oracle (checkpoint, tree, expected history and outcomes), and one working tree moved to a range's checkpoint |
| `node tools/history/report.mjs --metrics <dir> --plan <dir> --docs <dir>` | the per-range reports and `RANGES.md` from the runner's metrics, with the gate decision; exits 3 on optimize and 4 on stop |
| `node tools/import-run.mjs <shop\|depot\|crew> <id> <store.json> key=value…` | generates `scenarios/<id>/` from a recorded run. `verification=on\|off\|no-browser` runs or disables the commands that only verify, or only those of a browser proof (Crew: no-browser); `cache=<dir>` (outside the repository) keeps what it read from the Store, so a re-import takes seconds |
| `node tools/check-scenario.mjs <demo>` | a converted scenario's static checks, in seconds: run files, expects, disabled commands, and the lead's starts, turns and waits |
| `LAYERFS_DEMO_FAST=1` (dsh web's environment) | the mock and `terminal.mjs` skip typing, thinking and terminal delays; nothing else changes |
| `node tools/check-session.mjs '<dsh web URL with ?token=…>' <session id>` | checks that a session's tab draws what LayerFS reports: Branches, heads, `main`, Sandboxes, which agent made each Commit and Layer, and bash-call groups |

The design preview `sdk_sim/dsh_design.html` imports the same model and renderer, so it and the tab draw the same thing.

`assets/` holds unlicensed character art and is never committed. `lib/` is build output.
