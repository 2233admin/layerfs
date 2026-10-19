# #352 — Dependency installs: real `pnpm install` inside the Workspace

> **Status:** Current, owner decision 2026-10-18 (firm). Binding on the lead, the
> builder and the fixer from P3 on. Extends SPEC §2 "Ignored files" and
> Speed-ups 4; where they differ, this note wins.
>
> **From P3, [NODE_RULE.md](NODE_RULE.md) governs** (owner-approved 2026-10-19):
> the generic Node operation rule for installs, refreshes, builds, tests,
> merges and proofs. Where this note and NODE_RULE differ, NODE_RULE wins.

## 1. Decision

Every dependency install in the replay is a **real `pnpm install` run by exec
inside a mounted LayerFS Workspace**, reading packages from a **pnpm store that
lives outside the Workspace**, as a developer's global pnpm store lives outside
their repository. This is option A, and it is the only install route.

```
pnpm install --offline --frozen-lockfile        # incremental: ranges that change package.json or the lockfile
find . -name node_modules -type d -prune -exec rm -rf {} + && pnpm install --offline --frozen-lockfile   # clean: milestones only (P3 on)
```

**Changed clean command from P3 on (lead interim yes 2026-10-18, reported to
the owner).** "Clean" removes every `node_modules` folder in the tree, not
only the root's. A package that left the workspace keeps its untracked
`node_modules` (git never removes untracked files), so the root-only `rm -rf
node_modules` left `packages/core/agent-core/node_modules` behind and the
clean reinstall differed from the clean oracle (dev352-p3p r016 devcheck).
It applies to the milestone clean install and the dev reinstall check. P2
clean-install numbers stay labelled with the old command (`rm -rf
node_modules`) and are not compared across the change.

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

### 3.1 As built: read-only volumes on `sandbox.create` (fixer, 2026-10-18)

`sandbox.create(name, project, image, { volumes })` takes `[{ volume, target }]`
(branch `dsh-352-installs`; Linux addon `sdk-linux-3cf1e17c`; the daemon is
unchanged, `6d467539`). Each entry must be an existing plain local volume,
other than the Store volume, mounted read-only at an absolute target outside
`/`, `/workspaces`, `/layerfs-*`, `/proc`, `/sys`, `/dev` and `/tmp`. A
volume is read once, like the Store volume. The container inspection then
matches every mount by name and destination: the Store mount must be
read-write and each requested volume read-only. Anything else, including a
missing, repeated, writable or unrequested mount, is a topology mismatch.
`sandbox.record` keeps the volumes, so a reopened Sandbox expects the same
mounts. The service Sandbox has none.

Proof:

- Fake-Engine tests: `core/crates/layerfs-sandbox/tests/read_only_volumes.rs`.
- Real container: `sdk/js/test/verify/read_only_volume_real.mjs`, which passed
  (receipt `installs-real-run4.log`). Inside a Workspace, as the Sandbox's
  command user:
  - the store is readable;
  - a write into it fails `EROFS`;
  - a hard link store → Workspace (pnpm's direction) fails `EXDEV`, as
    requirement 4 expects;
  - a link Workspace → store fails `EROFS`, because `linkat(2)` refuses the
    read-only destination mount before it compares mounts (the kernel's
    answer, not FUSE's);
  - a symlink into the store works and is committed;
  - a `readOnly: false` entry and the targets `/workspaces/x` and
    `/tmp/store` are refused before any container exists;
  - a new process reopens the Sandbox from its record and sees the same.
  - Nothing is written to the store volume.
- Revert checks:
  - dropping the read-only inspection requirement fails the fake-Engine
    mismatch test;
  - an addon whose reopen ignores the saved volumes fails the reopen.

## 4. Proof

- **Installed tree equals native, per lockfile hash** (SPEC §2's `node_modules`
  oracle): file list, symlinks and their targets, modes, git blob ids, against the
  tree a native install of the same lockfile made in the same image. Any
  difference is a stop finding.
- **pnpm's exit status and output match native**, apart from timing.
- **The install root and pnpm's run times (lead rule, 2026-10-18, found on
  dev352-p3c r015; lister version 3, `closure.mjs`).** pnpm writes the absolute
  install root into some files and the install time into two. Comparison is
  exact wherever it can be.
  - **Why the oracle can't install at the same path.** A Workspace's path is
    `/workspaces/<N>`, which the daemon picks fresh at each mount, so it isn't
    known until the closure's install mounts. The native oracle is made once
    per lockfile hash before play, on the host (`closure.mjs oracle`), and
    reused by every install of that lockfile, including the clean-reinstall
    check in another Workspace. The player runs in the runner container,
    which has no Docker access for a native install at the mount's path. So
    the oracle installs at `/lfs352-native-root`, a path no package content
    contains.
  - **What is normalized.** Only the items below, each by exact substitution
    of the one install-root string (the lister's working directory, or `pwd`
    in the Workspace) with `<root>`, or of one named field's value with `<t>`.

    | File | Field | Normalized to | Reason |
    | --- | --- | --- | --- |
    | `node_modules/.modules.yaml` | every occurrence of the install root | `<root>` | pnpm records absolute paths of the install |
    | `node_modules/.modules.yaml` | `"prunedAt"` value | `<t>` | the install's wall-clock time |
    | `node_modules/.pnpm-workspace-state-v1.json` | every occurrence of the install root | `<root>` | project keys are absolute paths |
    | `node_modules/.pnpm-workspace-state-v1.json` | `"lastValidatedTimestamp"` value | `<t>` | the install's wall-clock time |
    | a pnpm bin shim: a file directly in a `node_modules/.bin/` directory that starts `#!/bin/sh` | every occurrence of the install root | `<root>` | `NODE_PATH` in the shim is absolute |
    | pnpm's install output | every occurrence of the install root | `<root>` | some warnings print absolute paths |
    | pnpm's install output | the age on the line `✓ Lockfile passes supply-chain policies (verified <age> ago)` | `<t>` | the time since the store's lockfile verification, which varies with when the install runs (dev352-p3g r015: 5h natively, 6h in LayerFS) |
    | pnpm's install output | the duration on the `Done in <duration> using pnpm` line | `<t>` | the install's wall time (since the oracle was built) |
    | pnpm's install output | the duration on the line `✓ Lockfile passes supply-chain policies (<n> entries in <duration>)` | `<t>` | the policy check's own wall time (f031-slice-f r015: 7 ms natively, 9 ms in LayerFS; owner approved 2026-10-19, liaison relay); the entry count stays exact |
    | pnpm's install output | `Progress: ` lines | dropped | progress redraws vary with timing (since the oracle was built) |
    | `node_modules/.vite/vitest/*/results.json` | the order of the `results` entries | sorted by spec path | completion order of parallel vitest workers (dev352-p3o r016; lead interim yes 2026-10-18, reported to the owner) |
    | `node_modules/.vite/vitest/*/results.json` | each entry's `duration` value | `<t>` | wall time of the previous run (same) |

    | `node_modules/.modules.yaml`, `node_modules/.pnpm-workspace-state-v1.json` and pnpm bin shims, as above | every occurrence of one recorded mount root of an earlier step in the node_modules chain, each root listed by exact string | `<root>` | a new directory per mount is the product's model (owner, F-034, 2026-10-18), so files pnpm wrote in an earlier mount keep that mount's root, as expected state (dev352-p3h r016: `/workspaces/23` in shims after a remount) |

    In `results.json`, `version`, the top-level keys, the set of spec paths,
    each entry's keys and every `failed` flag stay exact. A file that does not
    parse as `{results: [[path, {…}], …]}` is compared raw and counted as
    unparsed (lister v5).

    The root substitutions match only at a path boundary: the next character
    is not a letter, digit, `_`, `.` or `-`, so `/workspaces/2` never matches
    inside `/workspaces/23`.

    Shims are the one entry that isn't a single path: pnpm writes one per
    bin, at the top level and inside each package with bin dependencies, so
    the set is the lockfile's bins. The shebang condition keeps any other
    file in `.bin/` raw.
  - **Everything else is exact.** Every other byte of those files is
    compared: the package set, versions, layout, store and hoist settings,
    the project list and the pnpm configuration. Integrity isn't stored in
    either state file: it is in the lockfile and the store, and every package
    file's blob id proves it. Every other file in `node_modules`, including a
    package file that holds the root, is compared by git blob id, mode and
    path. A field outside the table that differs is a mismatch, and so a
    stop. A state file without its time field fails the lister.
  - **Counted per install.** The lister counts every substitution: root and
    time per state file, and shim files and root substitutions. The output's
    root count and its verification-age count are added. They go to the metrics (`closure.normalized`, and
    each install row's `normalized`), and the range report's "Installed tree"
    row shows them, so the comparison can't widen silently. An oracle from an
    older lister version is refused, never compared.
- **The oracle of an install on top (lead rule, 2026-10-18, from dev352-p3h
  r016).** An install over an existing `node_modules` keeps that tree's state.
  That includes orphan `.pnpm` packages of the previous lockfile and the test
  caches vitest wrote (`node_modules/.vite`, `.vite-temp`). So a clean native
  install is the wrong oracle for it.
  - The run records the node_modules chain (`state.closureChain`): every
    closure step since the last install compared equal to the clean oracle (a
    first install, a milestone clean install, the dev reinstall check), with
    its checkpoint, command and mount root.
  - The oracle for an install on top is a native replay of that chain plus
    the install (`closure.mjs oracle --run <id> --range k`,
    `nativeSequence`): one container at `/lfs352-native-root`. For each step
    the tree is set to that step's checkpoint (the archive over the tree,
    git's deletions removed, untracked output kept), then the step's command
    runs. It is cached per chain as `seq-<key>.json`, where the key hashes
    every checkpoint and command.
  - First installs, milestone clean installs and the dev reinstall check keep
    the clean native oracle of the lockfile.
  - The earlier steps' mount roots are listed substitutions (the table
    above). Any other difference is a mismatch.
  - Dev runs also run `./node_modules/.bin/tsc --version` in the new mount
    after an install on top and record its exit and output, as a fact, not a
    gate (F-034).
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

As built (2026-10-18, owner checks): a run labelled `dev` adds two checks to
the closure (`closure.mjs`, `checks`).
- **`reinstall-check`:** a clean reinstall of the unchanged lockfile, right
  after the install. It is compared with the oracle, and its Commit's metadata
  and stored bytes are recorded (`closure.reinstallCheck`; about 12.5 MiB
  today, near zero after F-027 item 2).
- **`rebuild`:** `tsc -b --verbose` of the built packages in a fresh
  Workspace, after the build's Commit and unmount. It must find nothing to
  build. Otherwise a native rerun in the image decides; a difference is a stop
  finding against design 8 (`closure.rebuild`).

The bytes come from the trace, so the dev run plays with `--mode measured`
under `--label dev`. Its outputs stay in the run's folder, not in the reports.
A fast play keeps the steps and states but no bytes. Editor-style saves are
measure-only.

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
