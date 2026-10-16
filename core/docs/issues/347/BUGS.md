# Findings — #347

> **Status:** Current; Shop (#348) converted, Depot and Crew in progress.

One line per finding, as [SPEC.md](SPEC.md#bugs) describes: symptom, layer
(converter, dsh, SDK, LayerFS), failing run (session and project), fix commit.

| # | Iteration | Symptom | Layer | Failing run | Fix |
| --- | --- | --- | --- | --- | --- |
| 1 | Shop | The recorded Stores open as `pack persistence: Malformed`: they predate `bb8fe890f`, which added seven `init_*` columns to `store_totals` | LayerFS (schema; no migration by design) | restore of the #334 Store | Converter reads through a reader built at `f64d74231` (`bb8fe890f^`), `LAYERFS_READER`; the originals stay untouched |
| 2 | Shop | An evidence Store has no `project.record` to open it by | converter | restore of the #334 Store | `sdk/js/native/examples/restore_record.rs` writes one from `history_meta.binding_key`; `dsh/tools/restore-store.mjs` |
| 3 | Shop | The daemon refuses a copied Store folder: `private directory ownership/mode/type` | converter | restore of the #334 Store | `restore-store.mjs` copies into the volume as root, `global` 0700, files 0600 |
| 4 | Shop | `diff_commits` refuses a parentless Commit's base Layer, so the first Commit's writes cannot be read | converter | conversion of #334 | Parentless Commits diff by a tree walk against the base Layer (`import-run.mjs diffOf`) |
| 5 | Shop | A merge-made Branch's history lists the first input's Commits as its own | converter (order check) | conversion of #334 | History chains are cut at the Branch's `forkedFrom` Commit (`checks/history.mjs`) |
| 6 | Shop | `dsh/tools/lib/` is ignored by `dsh/.gitignore` (`lib/`), so the gate code would not be committed | converter | — | Renamed to `dsh/tools/checks/` |
| 7 | Shop | `sandbox.create` and `mount` answer a name and a path, not a kind, so every replayed create looked like a mismatch | converter (replay lib) | headless run 1 | `replay.mjs` treats them as `Ready` and `Mounted` |
| 8 | Shop | The recording's first Store calls ran before its `create`, through the service Sandbox the Host also uses: `Busy`, or the agent closing the Host's Sandbox | converter | headless run 1 | An agent's `create` moves before its first Store call, and later calls go through that agent's own Sandbox |
| 9 | Shop | The seed holds a `.git` folder, which Git cannot hold inside a scenario folder | converter | — | The seed is kept as `seed.json` (modes and bytes) and written out by `packages/mock/src/seed.js` |
| 10 | Shop | Step 010's two heredoc commands have no inner `timeout` | recording | conversion of #334 | Accepted with a note: recorded under 10 s (75–79 ms); the step's tool timeout still bounds them |
| 11 | Shop | A dsh web Live Play read `Finished · 19 of 19 steps` while every bash call had failed: dsh's bash tool reports a non-zero exit only as a `[exit code: N]` line with `isError: false`, and the mock stopped only on `isError` | dsh plugin (mock) | session-afdc80e0-9c3f-4418-9a49-f173a3b692bc, demo-shop (dsh-layerfs-demo-shop-mvbjh2i1) | `plan.js` stops on the exit, signal and timeout markers; mock test added |
| 12 | Shop | In that run every `sandbox.create` failed `PermissionDenied`: the Host `home` and `traceDir` were set under the user's home, which the bash sandbox (Workspace Write) cannot write | environment (dsh web profile) | same | Host `home` and `traceDir` in the temp area (`<tmp>/lfs347-dsh-layerfs/`), as the defaults are; README says why |
| 13 | Shop | A live demo's intro offered `simulated or live` LayerFS and its blurb repeated the title | dsh plugin (mock) | same | Intro says Live for a live demo; importer writes a real blurb |
