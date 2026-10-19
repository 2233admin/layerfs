# Range 018 a1 · the native repair chain merges the lanes as LayerFS does

> **Status:** Current fix record. Harness oracle fix in `dsh/tools/history`; no product change (F-058).

| | |
| --- | --- |
| Trigger | range-018.md a1: Node proofs, `lead.repair` P6 stop, "P1 pass, P4 stop (2 emitted file(s) differ: packages/core/session/lib/types/tool-pairing.d.ts, packages/core/session/lib/types/tool-pairing.js)" |
| Playbook step | D0 (oracle checked before the product) |
| Kind | none: a harness oracle fix; the daemon, addon and Store format are unchanged |
| Binaries | daemon `44ac6c91` and addon `77597adb` unchanged |
| Commits | fix and tests in this commit: `dsh/tools/history/lanemerge.mjs`, `nodeproof.mjs` (`laneSteps`, `nativeChain`, `repairChain`), tests in `tests/p3.mjs` |
| Recovery | fork of snapshot `range-017` (`p3-main-g`'s), rerun as range 18 attempt 2; after the a2 correction below, attempt 3 |
| Decision | owner, 2026-10-19, via the liaison: option A; B (proof scope) and C (workload) are out |

## Old design

- `repairChain` listed the lead's chain, then every lane point's install and
  build "in the order they ran", then the repair install on the checkpoint
  tree.
- `nativeChain` ran them all in one folder: it moved the folder to each
  state's mount path and laid each state's tree over the last one.
- So each lane point ran on top of the earlier lanes' output. The last lane to
  build a package decided its untracked and ignored output.
- LayerFS is different. Each lane forks main after the lead's install and
  runs from that state; consolidation then merges each lane's Branch into main
  in the plan's order. A file only one lane changed comes from that lane,
  whatever the other lanes rewrote with the base's bytes.

## Why it showed at range 18

- The plan's path lanes split dsh `cc546c4580` ("move pairing helpers"):
  `packages/core/session` goes to lane 2, `packages/compact` to lane 3.
- Lane 2 still plays `1123e946c0` and `649865043d`, which edit
  `packages/core/session/src/tool-pairing.ts`. Its end-point build emits new
  `core/session/lib/types/tool-pairing.*` (`042b06c9…`, `c233d58c…`). The
  native run of the same tree and command emits the same blobs (P4 pass at
  `r018-2-packages-core`).
- Natively, a later lane's build at its own tree rewrote the old bytes
  (`23bfb241…`, `2352ae25…`), and that copy reached the repair.
- At the checkpoint `6769d6cf` the source is gone. `tsc -b` neither rewrites
  nor deletes an output whose source was removed, so both sides keep their
  orphan copy. LayerFS's copy is lane 2's, as its merge says it should be.

## New design

- **States:** `repairChain` tags each lane point's states with its lane and
  its rank in the plan's `consolidation` merges. A lane missing from the
  consolidation stops the proof. The lanes are listed in merge order.
- **Commands:** `laneSteps` places the commands. `nativeChain` copies
  `lanemerge.mjs` into the container and, before the first lane, snapshots the
  folder (`cp -a` to `/lanebase`).
- **Per lane:**
  - mark the time;
  - run its states from the base tree;
  - capture every path it created, removed or rewrote with other content (a
    file rewritten with the same bytes and mode is no change);
  - restore those paths from the base.
- **Merge:** the captures are applied in merge order. A path two lanes both
  changed takes the later-merged lane's version (the liaison's rule) and is
  counted and listed (`twoSided`).
  - The product's `/.lww` rule (`layerfs-content/src/merge/lww.rs`) picks the
    newer modification time, which a sequential native run cannot reproduce.
    A disagreement there would show as a P1 or P4 difference, never as a pass.
- **Repair:** the repair install, the build tail and decision B's native
  clean run on the merged folder as before.
- **Cost:** one copy of the folder, plus a walk of the folder and the base per
  lane. The oracle key changes with the new state fields, so a repair oracle
  made the old way is never reused. Lane point oracles keep their keys.

## Proof (`tests/p3.mjs`, 19/19)

- `option A: lane steps …`: where the snapshot, mark, capture, restore and
  apply commands go; apply follows merge rank, not run order; lanes must be
  contiguous and ranked.
- `option A, r018.a1 …`:
  - the three lanes run in the recorded order 3, 2, 1, and the root lane
    rewrites the base's bytes;
  - lane 2's output survives, the root lane's install changes merge, and
    nothing is two-sided;
  - after the source is removed the orphan stays lane 2's;
  - the old sequential model ends with the base's bytes.
- `option A: a lane output the checkpoint build rewrites still converges …`:
  a later build's output wins whatever the lanes wrote. A lane never sees
  another lane's files, and removals and created folders are exact.
- `option A: two lanes writing one ignored file follow the merge order …`: the
  later-merged lane's bytes win, and the path is listed as two-sided.
- The devcheck reinstall test now asserts the lanes' merge order and tags.

## Correction after a2 (the merge failed silently)

- **What happened:** a2's P6 reported the same two files. Inside the
  container, `capture` used `cpSync`, which followed a pnpm link to a folder
  (`examples/node_modules/@cordisjs/plugin-hmr`) and refused to copy a
  directory. The error went to stderr, which `nativeChain` reads only when the
  container fails. So the oracle kept the old sequential model (`lanes: []` in
  its record) and judged a2 with it.
- **The changes:**
  - `copyEntry` copies a link as the same link (`readlink`/`symlink`, never
    followed), and a file with its mode and times.
  - Every merge step reports a failure with its error (`@@lanefail`,
    `@@laneerr`). `nativeChain` refuses the oracle unless every lane was
    captured and the merge applied, so the proof is NOT_RUN, never judged on a
    wrong oracle.
  - `oracleKey` adds `laneMerge: 2` for chains with lane states, so the bad
    oracle is never reused. Lane point oracles keep their keys.
  - New test: links to folders are copied as links and restored exactly
    (`tests/p3.mjs` 20/20).
- **Diagnostic** (a2's state, uncached, not a proof): the chain emits
  `tool-pairing.d.ts` `c233d58c…` and `.js` `042b06c9…`, equal to LayerFS. It
  took 64 s. Lanes captured 10,276, 311 and 403 changed paths. 19 paths are
  two-sided: 18 `tsconfig.tsbuildinfo` and `vendor/cordis/bin.js`.

## Performance

The repair's native chain took 64 s with the merge (a1's sequential chain: about 69 s). Range 18 a3's proofs record it.
