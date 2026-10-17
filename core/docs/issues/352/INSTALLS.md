# #352 — Dependency installs: real `pnpm install` inside the Workspace

> **Status:** Current, owner decision 2026-10-18 (firm). Binding on the lead, the
> builder and the fixer from P3 on. Extends SPEC §2 "Ignored files" and
> Speed-ups 4; where they differ, this note wins.

## 1. Decision

Every dependency install in the replay is a **real `pnpm install` run by exec
inside a mounted LayerFS Workspace**, reading packages from a **pnpm store that
lives outside the Workspace**, as a developer's global pnpm store lives outside
their repository. This is option A, and it is the only install route.

```
pnpm install --offline --frozen-lockfile        # incremental: ranges that change package.json or the lockfile
rm -rf node_modules && pnpm install --offline --frozen-lockfile   # clean: milestones only
```

## 2. Why this is authentic

LayerFS stores the complete project tree, including what Git ignores (AGENTS.md).
In this replay, everything pnpm writes into the project goes through FUSE and is
stored in the Workspace:
- `node_modules`, with its symlink layout;
- `.modules.yaml` and `.pnpm` state;
- removed packages;
- the build outputs and caches that follow.

The pnpm store is not project content; pnpm keeps it in the user's home on a
real machine.

| Location | Real developer | Replay |
| --- | --- | --- |
| Project tree incl. `node_modules`, builds, caches | the repo folder | **the Workspace, stored by LayerFS** |
| pnpm's global store | the user's home, outside the repo | a volume outside the Workspace |
| Registry downloads into the store | network | pre-filled once with `pnpm fetch`, network off (determinism) |

## 3. Requirements (builder)

1. **The store reaches the Sandbox from outside the Workspace.** `sandbox.create`
   takes a read-only volume mount for `layerfs-issue352-pnpm-store`, mounted at a
   path outside every Workspace mount. pnpm is pointed at it with `--store-dir`.
   Only what exec writes into the Workspace is captured; the store is never
   captured, never counted in the Store and cannot be modified by a Workspace.
2. **If pnpm needs to write to its store** (index or metadata updates, even
   offline) and a read-only store changes its behaviour, give each Sandbox a
   private writable copy-on-write layer over the store, still outside the
   Workspace. The store is never moved into the Workspace.
3. **The runner gets install and build steps** beside its test step (SPEC §2:
   install where `package.json` or the lockfile changed; `tsc -b` of changed
   packages before the unit tests; clean install at milestones). Each is a
   one-shot Workspace exec with its own Commit.
4. **pnpm copies across filesystems.** The store and the Workspace are different
   filesystems, so pnpm cannot hardlink or clone and falls back to copying. That
   is accepted as real cost. A link attempt must fail with the error pnpm
   expects (`EXDEV`); any other error from FUSE is a stop finding.

## 4. Proof

- **Installed tree equals native, per lockfile hash** (SPEC §2's `node_modules`
  oracle): file list, symlinks and their targets, modes, git blob ids, against the
  tree a native install of the same lockfile made in the same image. Any
  difference is a stop finding.
- **pnpm's exit status and output match native**, apart from timing.
- **Timing:** FUSE ÷ native for the same install on the same tree (playbook D6),
  per install kind (first, incremental, clean). Speed findings are diagnosed, never
  avoided by changing the route.
- **Storage:** the reinstall dedupe gate (stored growth ≤ 2× the changed
  packages; optimize above 5×).

## 5. Before P3: one development run

Run one range with an install, a build and the unit tests inside LayerFS as a
development run, before any measured P3 range, and compare with native (tree,
symlinks, modes, exit status, test results). The first concurrent-exec run found
F-008 and F-009, so installs through FUSE are expected to find more; find them
before P3, not during it.

## 6. Ruled out

| Route | Why not |
| --- | --- |
| Install natively and extract a tarball into the Workspace | Not how users get `node_modules`; it hides pnpm's real pattern (symlink farm, renames, state files, incremental add and remove) |
| Writing `node_modules` with `fs.write` | Not exec; ~78k calls and Commits per full install |
| Inline content in exec commands | Impossible at this size |
| Network in the Sandbox | Non-deterministic; SPEC keeps the network off |
| The pnpm store inside the Workspace | Not project content; would inflate every Workspace and the Store |
| Excluding `node_modules`, builds or caches from the Workspace | LayerFS stores everything in the project tree |
| Reusing one install instead of reinstalling when the lockfile changes | Hides incremental install cost; SPEC requires the reinstall |

The tarball route may run once as a **diagnostic** when an install fails or
differs from native, to tell a FUSE problem (the tarball also fails) from
pnpm-specific behaviour (it passes). It is never a replacement for the install,
and its runs are labeled diagnostic, outside RANGES.md.
