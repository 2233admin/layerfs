# Range 039 a1 · a one-file remove listed its whole parent directory again after every Commit

> **Status:** Current fix record (#367, follow-up to fix 057). Product change
> in `layerfs-workspace` captured construction; Store format unchanged.

| | |
| --- | --- |
| Trigger | r39–r40 (run p3-main-v, daemon `27a769a4`, addon `0611f3e0`): uncontended one-file `fs.rm` p50 6.1–6.5 → 11.9–12.7 ms, 127–134 → 192–254 statements, 6.4–6.9k → 15.8–19.2k VM steps per call. The windows held only the call's own 4 write commits, so this is the call's own work |
| Issue | #367 |
| Kind | code path: `base/links.rs`, `construction/driver.rs`, `construction/namespace/normalize.rs` and `records.rs`, `base/client.rs` |
| Binaries | probe `issue367_rm_probe` (Linux, release, pinned image `378b799ef433`): old `539c89d7` (origin/main `a668917174`) → new, this commit |
| Commits | this commit; regression assertion in `core/crates/layerfs-workspace/tests/directory_links_install.rs` |
| Recovery | none: no attempt reran |

## Root cause

**Every remove recounted the parent's child directories from scratch, because
the previous Commit had given that parent a new content root.**

Copying a base directory into a Workspace needs its full inode, including
`subdirs`, the number of children that are directories (it gives nlink).
The canonical format does not store that count.
`BaseView::subdirs_among` (`layerfs-workspace/src/base/links.rs`) derives it:
it lists the whole directory in windows of 256 and reads every child's inode
value. The answer is remembered in the process-wide `CanonicalCache` under
the directory's content root.

A Commit that changes a directory gives it a new content root. So in a run of
removes in one directory, each call:

1. bound a private Workspace on the new head;
2. found no count for the parent's new root;
3. listed the parent again: O(entries) directory pages and inode reads, inside
   `files.change`, outside the publication lane.

Only the direct parent changes root. A directory's root holds names and
serials, so its ancestors keep theirs.

Why it showed at r39: from r38 a2 the agents deleted the history notes under
`/.agents/notes/implemented/<category>/` (24–211 entries). r40 had 101 of 120
uncontended removes there. Ranges 31–37 removed from directories of 4–10
entries. The tree and history were not the variable. The same paths cost the
same on the r37 and r40 snapshots (below).

P3 trace, own-window removes, grouped by parent:

| Range | Parent | Calls | p50 ms | Reader statements | Reader VM steps | `files.change` ms |
| --- | --- | --- | --- | --- | --- | --- |
| 37 | `/examples/acp-agent/tests` | 33 | 8.6 | 45 | 2,181 | 1.5 |
| 37 | `/packages/ui/acp` | 31 | 5.8 | 35 | 1,460 | 1.1 |
| 38 a2 | `/.agents/notes/implemented/*` | 34 | 12.0 | 123 | 12,862 | 6.8 |
| 38 a2 | `/packages/client/ui-settings-general` | 17 | 4.5 | 31 | 1,017 | 0.9 |
| 40 | `/.agents/notes/implemented/*` | 101 | 12.0 | 104 | 9,038 | 5.6 |
| 40 | `/.agents/notes/rejected` | 7 | 7.5 | 37 | 1,393 | 1.2 |

Writer work stayed flat: 86–96 statements in every range.

A temporary probe instrument (not committed) printed each derivation on an
r40 clone. Successive removes in `implemented/process` recounted 129, then
128, then 127 entries, 3.2–3.5 ms each. `/node_modules/.pnpm` (901 entries)
took 4.6 ms and the call 327 statements / 63k VM steps. The `.github/workflows`
directory (8 entries) took 0.8 ms. The cost follows the entry count, and also
how scattered the children's inode serials are: `.pnpm`'s children were made
together.

## Change

Captured construction already reads each changed inode's Workspace row,
`entries` and `subdirs` included. That row's count is exact for the directory
it builds.

- `values` (`normalize.rs`) keeps the live changed directories' (serial,
  entries, subdirs). It keeps at most `REMEMBERED_DIRECTORIES` = 256 per
  Commit; the rest are derived on demand as before.
- After Content's update returns the candidate root, `run` (`driver.rs`)
  calls `BaseView::remember_constructed_counts`. That reads the candidate's
  inode values for those serials in one demand, through the Save's own
  objects, and remembers each count under the directory's new content root.
- A row is not remembered if its new root page records a different entry count
  from the row, or if `subdirs > entries`.
- It is a cache fill: a failure there does not change the Commit's result.
- It runs in the `construct` phase, before the lane.

A merge that changes the published root leaves those directories uncached, as
before.

## Proof

`directory_links_install` drives the real captured-namespace producer and the
known install over 11 directories. Two checks:

- After install, every directory's reported count must still equal an
  independent listing.
- The number of derivations after install was `scans + 6` (the six non-empty
  changed directories listed again). It is now `scans`: none is listed.

The second Commit in the test carries a count made over the installed base the
same way.

## Performance, old vs new

r40 snapshot (`range-040.json`), a fresh clone per arm, one process per arm,
14 removes in order, one sample each. Host 1-min load 7.1. Columns are the
calling thread's statements / VM steps (fix 057's `call`) and ms.

| Remove (r40) | Parent entries | Old | New | Old ms | New ms |
| --- | --- | --- | --- | --- | --- |
| `/LICENSE` (first call) | 48 | 233 / 28,743 | 238 / 28,788 | 26.3 | 24.6 |
| `.github/workflows/ci.yml` | 8 | 188 / 16,489 | 177 / 11,832 | 16.8 | 12.0 |
| `…/docs-pages.yml` | 7 | 156 / 8,882 | 148 / 7,144 | 11.9 | 10.0 |
| `…/e2e.yml` | 6 | 150 / 11,041 | 144 / 8,982 | 10.3 | 29.2 |
| `process/…quality-gates.i18n.yaml` (first in dir) | 129 | 251 / 22,904 | 256 / 22,949 | 16.7 | 16.6 |
| `process/…quality-gates.md` | 128 | 224 / 21,992 | **158 / 10,987** | 14.8 | **9.1** |
| `process/…quality-gates.zh.md` | 127 | 188 / 16,972 | **126 / 7,171** | 12.2 | **6.8** |
| `process/…tsdown-over-dumble.i18n.yaml` | 126 | 184 / 17,495 | **120 / 7,123** | 12.4 | **6.8** |
| `process/…tsdown-over-dumble.md` | 125 | 162 / 15,351 | **98 / 4,368** | 12.0 | **6.1** |
| `feature/…acp-multi-session.i18n.yaml` (first in dir) | 189 | 206 / 22,541 | 214 / 22,668 | 16.1 | 15.0 |
| `feature/…acp-multi-session.md` | 188 | 191 / 19,666 | **112 / 4,691** | 15.5 | **5.2** |
| `feature/…acp-multi-session.zh.md` | 187 | 204 / 21,712 | **129 / 7,405** | 14.8 | **6.6** |
| `/node_modules/.pnpm/lock.yaml` (first in dir) | 901 | 328 / 63,340 | 337 / 63,469 | 25.4 | 27.6 |
| `/node_modules/.modules.yaml` | 31 | 130 / 7,184 | 135 / 7,229 | 10.9 | 8.6 |

- **Repeat removes in a directory** (bold): old 162–224 statements, 15–22k VM
  steps, 12.0–15.5 ms; new 98–158 statements, 4.4–11k VM steps, 5.2–9.1 ms.
  That is the same as in the 8-entry directory, whatever the parent's size.
- **The first remove in a directory** still pays one derivation, as before.
  The fill costs 5–9 statements, one inode demand and one root-page read per
  changed directory.
- **Time:** `e2e.yml` 10.3 → 29.2 ms is a one-sample outlier. Its statement
  and VM counts fell, and the call does not touch a directory the change
  serves differently. `.pnpm/lock.yaml` +2.2 ms is in the first-call group,
  under the 5 ms floor.

Every Commit (fs.write, fs.apply, Workspace Commit) gets the same fill: at most
256 directories, one batch. No read path changed. Stored bytes: unchanged.

## Left open

- **First remove in a directory per process.** It still lists the parent once,
  O(entries), until the count is cached. Removing that needs the count stored
  with the directory, a Store format change. Not proposed.
- **Over 256 changed directories in one Commit:** the rest are derived on
  demand, as before.
