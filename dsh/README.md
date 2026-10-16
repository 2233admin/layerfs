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

  Removal deletes the project's Docker volume and LayerFS home entry, and drops it from the bindings; sessions on it become unbound. It is refused while any container still uses the volume. Workspace files and transcripts stay. The SDK remembers each name it initialized until the Host process ends, so a removed name is not taken again before dsh restarts: Init picks the next free name (`name-2`).

  Trees are bounded: 4000 entries, 128 KB per file, 8 MB in all. `node_modules`, `.git`, `.next`, `dist` and `build` are listed but not opened.

### Client plugin

- **The LayerFS tab** (beside Chat and Trajectory) replays the root session's lines while it is shown and draws:
  - the project terminal with agent tags;
  - Branches and Sandboxes;
  - History and Files;
  - the status bar and the avatars.

  An unbound session shows Setup: pick one of the folder's projects, or Init.

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

4. Start dsh web (`pnpm dsh web` in the dsh checkout, with `DSH_HOME` set).
   1. Open the LayerFS panel and Init a workspace.
   2. Start a "New LayerFS session".

Only dsh web is checked; dsh desktop serves the same web client but was not tested. The headless profile composes no preset registry, so there the preset is not offered. The Host and the bash environment still work there.

## Develop

| Command | Does |
|---|---|
| `pnpm test` | Host tests and the model's trace replay check |
| `node ../sdk_sim/test_dsh_view.mjs sim` | the view model against the simulator's stories |
| `node tools/init-project.mjs <profile dir> <folder> <image> <daemon>` | Init outside dsh |
| `node tools/script-model.mjs <port> tools/scenarios/three-agents.mjs <log>` | a scripted model with no API key: a root agent and two subagents fork, write, test in the background, merge and publish |
| `node tools/check-session.mjs '<dsh web URL with ?token=…>' <session id>` | checks that a session's tab draws what LayerFS reports: Branches, heads, `main`, Sandboxes, which agent made each Commit and Layer, and bash-call groups |

The design preview `sdk_sim/dsh_design.html` imports the same model and renderer, so it and the tab draw the same thing.

`assets/` holds unlicensed character art and is never committed. `lib/` is build output.
