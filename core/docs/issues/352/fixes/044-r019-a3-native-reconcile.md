# Range 019 a3 · the native repair chain applies the reconcile

> **Status:** Current fix record. Harness oracle fix in `dsh/tools/history`; no product change (F-060).

| | |
| --- | --- |
| Trigger | range-019.md a3: Node proofs, `lead.repair` P6 stop, "P1 pass, P4 stop (tsc exit 0, native 1)" |
| Playbook step | D0 (oracle checked before the product) |
| Kind | none: a harness oracle fix; the daemon, addon and Store format are unchanged |
| Binaries | daemon `44ac6c91` and addon `77597adb` unchanged |
| Commits | this commit: `nodeproof.mjs` (`repairChain`, `nativeChain`, `LANE_MERGE_VERSION` 3); test in `tests/p3.mjs` |
| Recovery | range 19 attempt 4, a fork of `p3-main-l`'s r018 snapshot (r18 a6) |

## Old design

- After the lanes' merge (fix 042), the native chain moved to the
  checkpoint's tree. It deleted only the files git deletes from the lanes'
  base tree (the previous checkpoint) to this checkpoint.
- LayerFS's lead applies the plan's reconcile after the merges (`steps.mjs`:
  its `write` and `rm` files). That removes the tracked files the lanes
  brought that the checkpoint has not.

## What went wrong

- Range 19's lanes play side-branch commits that still hold
  `packages/core/agent-core` and `packages/ui/stdio-agent`; the checkpoint
  deleted both. The reconcile lists their files as `rm` (12 of 217). Natively
  they stayed: `agent-core/README.md`, and `stdio-agent`'s `src/` and `tests/`.
- Fix 043's clean prunes only empty folders. `stdio-agent` was not empty
  natively, so tsdown took it as a package without `lib/types`:
  `UNRESOLVED_ENTRY`, native exit 1. LayerFS's build exited 0, so P6's P4
  stopped on the exit.

## New design

- `repairChain` gives the repair state `remove`: the reconcile's `rm` paths,
  when the chain has lane states.
- `nativeChain` removes those paths before that state, as LayerFS's reconcile
  does before the lead's git step and the closure. The `write` files come from
  the checkpoint's tree, which the chain extracts anyway.
- `LANE_MERGE_VERSION` 3 re-keys every chain with lanes.

## Evidence

- Diagnostic, not a proof: r19 a3's chain with the fix. The native repair build
  exits 0 in 8.3 s, with 721 emitted files equal to LayerFS's.
- Correction to earlier diagnostics: the native runs quoted for r18 a5 (fix
  043 first correction) and r19 a2 (second correction) were built from
  attempts whose lane points had no recorded native trees (no proofs ran), so
  those chains had no lane states. The causes they showed stand: a partial
  build after the clean, and orphan `lib/` folders. "Natively exit 0" there
  holds for a chain without lanes only. This record's run includes the lanes.

## Tests

- `tests/p3.mjs` (devcheck reinstall oracle): the repair state carries the
  reconcile's `rm` paths and not its `write` paths.
