# Issue 307 check receipts

> **Status:** Archived; retained for historical evidence only.

This directory keeps the receipts, ledgers and raw text output of the #307
checks and qualification runs. The completion records in the parent directory
summarize them.

## Raw SQLite databases removed (#398, 2026-10-22)

The raw SQLite files were removed from `main` to reduce the checkout size. These
were the three mounted-proof oracle databases
(`r8-qualification-20261010`, `r8b-requalification-20261010` and
`r8c-close-20261010`, `.../oracle.artifacts/expected.sqlite`, about 250 MB) and
the leftover `store.sqlite-wal`/`store.sqlite-shm` files under
`init-acquisition-benchmark-20261006/raw/`. Nothing else was changed: verdicts
and receipts are unchanged. Links to a removed file now resolve only at the
recovery tag.

The last commit holding them is tag `docs-raw-sqlite-final` (`792715f00a`).
Git history still contains every file. To restore one:

```bash
git restore --source=docs-raw-sqlite-final -- <path/to/expected.sqlite>
```
