# Proposal: resumable cursors for fs.grep, fs.glob and fs.list

> **Status:** Proposal, **held for the owner**. Nothing here is implemented.
> The public token contract (`pageSize`, `pagePos`, `nextPagePos`) is unchanged
> on this branch.

## Problem

fs.grep, fs.glob and fs.list page by count. `nextPagePos` is the number of
items already returned. To serve page j, the call re-walks the tree from the
start and skips (j−1)·k items, so reading all R items at page size k costs
O(R²/k) walk work.

#354 made each re-walk cheaper (pruning, per-call caches, root batches) but kept
the quadratic term. On range 14, full pagination takes 93 s at k = 7 and 11 s
at k = 100 (diagnostic). See [FINDINGS-20261018.md §5](FINDINGS-20261018.md#5-paging-count-based-held).

## Precedent in the tree

`branch.diff_commits` and `branch.diff_branches` already take an additive
cursor:

- **Request:** an optional `cursor` argument, either a path string or null (`sdk/compare.rs` `request`).
- **Response:** `nextCursor` next to `nextPagePos`, both null when the listing is complete.
- **JS:** `options.cursor` resumes after the previous page's `nextCursor` (`sdk/js/src/branch/diff_commits.js`).
- **Ordering:** the walk is in component order, each directory before its children and names in byte order, so a path names a resumable position.

## Proposed shape (additive, compatible)

| Call | `cursor` names | Resume rule |
| --- | --- | --- |
| fs.list | the last returned entry name | first entry whose name is greater in byte order |
| fs.glob | the last returned path | first path after it in component order; the walk descends only the subtrees at or after the cursor's components |
| fs.grep | `path` plus `line` of the last returned match | the rest of that file after `line`, then the next path in component order |

- **Wire:**
  - fs.list and fs.glob take `cursor` as a path or name, as diff does.
  - fs.grep takes a small record: `{ path, line }`. It uses a record rather than an encoded string so that line numbers stay integers. The owner chooses whether to keep one string form for every call instead.
- **Response:** `nextCursor` beside `nextPagePos`. Both stay. A caller that ignores the cursor sees today's behaviour exactly.
- **Precedence:** follow diff, where a cursor wins and `pagePos` is ignored (`compare.rs`: `skip` is 0 when a cursor is given). Refusing the pair with `invalid` is the stricter alternative.
- **Validation:** check the cursor path like any other path argument. A cursor that names a path absent from the snapshot still resumes by order; it does not refuse.
- **Snapshot:** a cursor names a position, not a snapshot.
  - With `branch`, each page re-resolves the head, as `pagePos` does today.
  - A caller that needs one consistent listing passes `commit`, which `snapshot::open` already accepts.
  - Binding the commit id into the cursor is an option, but it changes what a cursor means. Left to the owner.
- **Cost:** a page costs O(depth + k), plus the scan of the files on that page. Full pagination becomes O(R) walk work.

## What must stay identical

- Item order, line numbers, UTF-8/binary classification, truncation markers and the reply budget.
- Concatenating the pages read by cursor must give byte-for-byte the same items as concatenating the pages read by `pagePos` at the same page size.
- Tests: an equivalence test over range-14 shapes at page sizes 1, 7 and 100; a cursor that lands on a deleted path; grep matches that span a page boundary inside one file.

## Open decisions for the owner

1. Approve tokens at all. They are held under the existing direction.
2. Choose the grep cursor form: a record or one encoded string.
3. Choose the precedence of `cursor` against `pagePos`: follow diff (the cursor wins) or refuse when both are given.
4. Choose whether a cursor binds the commit.
5. Choose whether count paging is later deprecated or kept indefinitely.
