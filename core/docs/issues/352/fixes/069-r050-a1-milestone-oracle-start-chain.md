# Range 050 a1 · the milestone clean install's oracle started from a fresh checkout

> **Status:** Current fix record. Harness oracle fix in `dsh/tools/history`; no product change. Liaison ruling 2026-10-20 (owner delegation).

| | |
| --- | --- |
| Trigger | r050 a1 (run `p3-main-w`, a milestone): Node proofs 17 pass, 2 stop at `lead.initial`. P1: `missing 0, extra 0, differ 2: examples/node_modules/.bin, python/sdk-runtime/node_modules/.bin`. P2: native `[WARN] Failed to create bin at <root>/examples/node_modules/.bin/dsh-cli-demo. ENOENT … packages/examples/cli-demo/lib/bin.js`, LayerFS none |
| Playbook step | D2 (Node proof stop, oracle and harness checked first) |
| Kind | none: the native oracle of the lead's milestone install; daemon `27a769a4`, addon `0611f3e0` and Store format unchanged |
| Commits | this commit: `agents.mjs` (`m.node.chainBefore`), `nodeproof.mjs` (`leadStates`, the info oracle), `p3record.mjs`, `p3.mjs` (the info line); test in `tests/p3.mjs` |
| Recovery | r050 a1 re-judged on retained state (`--rejudge "fix 069"`): Node 19 pass, 0 stop, 0 NOT_RUN |

## What went wrong

- At a milestone the lead runs a clean install on the live main tree. It removes every
  `node_modules`, then runs `pnpm install`. The earlier builds' ignored `lib/` stays.
  `packages/examples/cli-demo` declares `bin: { "dsh-cli-demo": "lib/bin.js" }`, so pnpm
  links that bin into `examples/node_modules/.bin` and `python/sdk-runtime/node_modules/.bin`.
  This is correct pnpm behaviour.
- The oracle for a milestone's clean install was a fresh checkout's install (the INSTALLS.md
  lead rule of 2026-10-18). A fresh checkout has no `lib/`, so pnpm warned and skipped the bin.
  The oracle compared a different input from the product's. Earlier milestones did not hit
  this, because no package's `bin` pointed into build output.

## Fix (liaison ruling, quoted in part)

"At a milestone clean install, `lead.initial`'s native oracle starts from the run's chain
state (the r49 native state, `lib/` included). It then runs exactly the same steps LayerFS
runs: the same node_modules removal command, the same clean install, the same build."

- Before the lead's install restarts the chain, the play records it as `m.node.chainBefore`.
- `nodeproof.mjs leadStates` builds the native states for a milestone: `chainBefore` (its
  native state), then the lead's own install command byte for byte, then the lead's own build
  as the tail. The states and commands are in the oracle cache key (LESSONS R10).
- First installs keep the fresh-checkout oracle. The dev reinstall check and the closure's
  clean oracle are unchanged. A milestone with no recorded chain is NOT_RUN, never the fresh
  oracle.
- Condition 3: the old fresh-checkout oracle's P1/P2 are still judged and kept as
  information (`p3proofs["lead.initial"].cleanOracleInfo`). The report prints them under the
  proofs table, not gated.
- r050 a1's metrics predate `chainBefore`. It was filled for the re-judge from
  `runs/p3-main-w/native-state-pending.json`: the r49 savestate adopted at r49's close, which
  is the chain r50 a1 started from (`state-19175a9d81b7c909b689b5ab.tar`). The provenance is in
  `m.node.chainBeforeFrom`.
- Re-judge: `lead.initial` P1, P2 and P4 pass (79,164 files restored). The info line keeps the
  fresh-checkout diff (P1 and P2 stop, the 2 `.bin` groups).
- Tests: `tests/p3.mjs` 40/40. It covers a first install (fresh checkout), a milestone (the
  chain plus the lead's command byte for byte), a missing chain (NOT_RUN) and the info line.
  `tests/p2.mjs` 72/72.
