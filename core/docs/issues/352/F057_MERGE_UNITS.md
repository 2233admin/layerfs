# F-057 design note: merge units for `branch.merge`

> **Status:** Approved by the owner, 2026-10-20, as drafted, with the proposed
> answers to the open questions in §10. Built on branch `f057-merge-units`
> ([fix record 049](fixes/049-f057-merge-units.md)), which also records the
> definitions the build fixed (`crossLinks`, the root, a unit directory's own
> mtime).
> **Owner decision:** option B. `branch.merge` takes caller-declared unit
> patterns. When both sides changed a unit, the merge takes the whole unit
> from the newer side and reports it.

## 1. Problem

Today's merge decides each path on its own (`layerfs-content/src/merge/decide.rs`):

- A path only one side changed takes that side.
- A file both sides changed gets a text merge or a conflict.
- A path matching `/.lww` takes the side with the newer mtime, ours on a tie.

That is right for source files. It is wrong for derived state:
- **Installed packages:** `node_modules`.
- **Build output:** `lib/` and `*.tsbuildinfo`.

Files in derived state are only valid together. If lane A reinstalls and lane B
reinstalls differently, a per-path merge can mix them. You get A's
`.pnpm/lock.yaml` beside B's hoisted links (F-057). Another case is one lane's
`tsbuildinfo` beside another lane's `lib/` (r018 a3, r019 a1). Nothing reports
the mix, and tools then trust the mixed state.

## 2. Goal and non-goals

**Goal:** a merged tree never mixes two sides inside a declared unit. The
caller learns which units both sides changed, so it knows to rerun install or
build.

**Non-goals:**
- **No reconciling.** LayerFS doesn't run pnpm or tsc and doesn't understand
  lockfiles. The kept unit reflects one side's inputs only, so the caller still
  reruns install or build after such a merge. The difference: it now starts
  from a consistent tree, so an ordinary incremental `pnpm install` or
  `tsc -b` works, not a clean relink or clean build.
- **Nothing hard-coded.** No pnpm or tsc knowledge in the product: the
  caller names the patterns.

## 3. API

```ts
branch.merge(branch, with, {
  name, message?,
  units?: Array<string | { name: string, patterns: string[] }>
})
```

- **Pattern syntax:** a pattern uses the existing `/.lww` glob syntax
  (`Rule::glob`): `*`, `?`, `**`, anchored when it contains `/`, `!`
  negation inside a group.
- **Unit = group:** one entry is one unit. A bare string is a one-pattern unit,
  named by its pattern. The unit covers every path that matches any of its
  patterns, plus everything below those paths.
  - `"node_modules"` is one unit spanning every `node_modules` directory in
    the tree.
  - `{ name: "build", patterns: ["packages/*/*/lib", "**/tsconfig.tsbuildinfo"] }`
    is one unit, so `lib/` and its build info always come from the same side.
- **Overlap:** a path matched by two units belongs to the first one listed.
- **Admission:** a malformed pattern, or an empty or duplicate unit name, is
  refused `InvalidArgument` before any work. There's no cap on the number of
  units beyond the request's own size.
- **Without `units`:** the merge behaves exactly as today.

## 4. Decision rule

Per unit U, from the base→ours and base→theirs changes:

| Ours changed U | Theirs changed U | Result |
| --- | --- | --- |
| no | no | unchanged |
| yes | no | ours' changes (same as today) |
| no | yes | theirs' changes (same as today) |
| yes | yes | **the whole of U from the newer side**, reported |

- **Changed** means any path in U differs from the base: added, deleted,
  content, kind, mode or mtime. Identity alone, meaning a new serial with
  identical bytes and metadata, doesn't count, so a relink that rewrote
  nothing isn't a change.
- **Newer** means the side whose latest write in U is later. That is the max
  mtime over the paths it changed in U. A deletion counts with its nearest
  surviving parent's mtime, as `/.lww` does today. On a tie, ours wins, as
  `/.lww` does. The same rule is already in the #352 oracle (F-058, write
  order).
- **Whole** means every path in U takes the winning side's entry, including
  its deletions and additions. The losing side's changes inside U are dropped.
- **Precedence:** inside a unit there's no text merge, no conflict and no
  `/.lww` rule; units come first. Outside units, nothing changes.

## 5. Deletes, renames, links

- **Deleting a unit root** is a change. If the deleting side wins, the root
  is absent in the result. If both sides deleted it, it's unchanged.
- **Kind change at the root** (directory to symlink or file) is a change.
  The winner's entry is taken.
- **Renames:** LayerFS merges by path and serial. A move into or out of a
  unit is a deletion on one side of the boundary and an addition on the
  other. The unit part follows the unit rule; the outside part merges as
  today. A rename inside a unit is just changes inside it. Renaming the unit
  root (`mv node_modules x`) deletes the unit, and `x` merges as an ordinary
  path unless it matches a pattern.
- **Symlinks** inside a unit are taken as entries and never followed.
  pnpm's links that point outside the unit stay as written.
- **Hard links across the boundary:** a serial can be bound both inside a
  unit and outside it. In that case the unit's decision sets the serial's
  value, and the merge reports the path as `crossLink`. This is rare, but it
  must be defined so the result never has one serial with two values.

## 6. Result shape

The fields added to `branch.merge`'s result, next to `conflicts` and `lww`:

```ts
units: Array<{
  unit: string,          // name, or the pattern for a bare string
  kept: "ours" | "theirs",
  keptTime: string,      // the winning side's latest write in the unit
  changedOurs: number,   // paths ours changed in the unit
  changedTheirs: number,
  dropped: number,       // the losing side's changed paths that were discarded
  crossLinks: number
}>,
unitsTruncated: boolean  // byte window, like lwwTruncated
```

- Only units both sides changed are listed. A merge with units listed is
  still clean: it creates its Commit.
- The merge Commit's record keeps the unit list it ran with, for audit and
  replay.

## 7. Cost and bounds

- **Pass 1** classifies each unit from the two change streams the merge
  already walks: changed on ours, changed on theirs, latest write per side.
  The state is two flags and two times per unit, not path sets.
- **Pass 2** applies whole units from the winner while building the result.
  Paths inside a decided unit skip text and `/.lww` work, so this is usually
  cheaper than today's merge on the same input.
- Both passes run before the publication lane, as today. The merge records
  stay on the #364 item 1 path.
- No resident path list grows with the unit size.

## 8. Scope

- **v1** covers `branch.merge` only.
- A Workspace Commit onto an advanced Branch head also merges
  (`RulesFrom::Theirs`). It keeps today's behaviour in v1. See open
  question 2.

## 9. Tests

- **The unit rule:**
  - each row of §4's table;
  - a tie keeps ours;
  - deletion and kind change at the root;
  - rename in, out and within a unit;
  - two patterns in one unit (lib plus tsbuildinfo) always from one side;
  - overlapping units: the first listed wins;
  - a cross-boundary hard link.
- **Changed vs identity:** a relink that only produces new serials over the
  same bytes doesn't count as a change.
- **Precedence:** text conflicts and `/.lww` inside a unit are not applied;
  outside it they are unchanged.
- **Result:** `units` fields, truncation, and the record kept on the Commit.
- **Golden:** a merge with no `units` gives byte-identical roots to today's,
  on the recorded merge fixtures.
- **#352 replay:** the lead merges with `install` and `build` units. Then
  incremental `pnpm install` and `tsc -b` produce a tree equal to native with
  the same unit rule. This replaces the clean relink and clean build, which
  needs the owner's switch-over.

## 10. Decisions (owner, 2026-10-20: the proposed answers)

1. **Newest means latest write.** Approved: it matches `/.lww` and F-058.
2. **A Workspace Commit onto an advanced head keeps today's behaviour in v1.**
   A later version could take units from a `/.lww`-style
   `%unit name: pattern` line, so no API carries them.
3. **#352 switch-over:** approved. Once this lands, the lead's repair goes back
   to incremental install and build with units. Clean relink and clean build
   are retired. Range 15 stays the baseline.
4. **A dropped side isn't kept.** The losing side's unit stays reachable
   through its own Branch. The merge report gives the count only.
