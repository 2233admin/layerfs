# LayerFS 0.1.7 evidence

> **Status:** Archived; retained for historical evidence only.

This directory keeps the ledgers, summaries, receipts and raw text output of the
0.1.7 measurement campaigns.

## Raw sample databases removed (#398, 2026-10-22)

The raw SQLite sample databases (`raw/sample.sqlite` and the other `*.sqlite`
files in the run directories, 496 files, about 2.4 GB) were removed from `main` to
reduce the checkout size. Nothing else was changed: verdicts, ledgers and the
numbers recorded from those databases are unchanged. Links to a removed
`.sqlite` file now resolve only at the recovery tag.

The last commit holding them is tag `docs-raw-sqlite-final` (`792715f00a`).
Git history still contains every file. To restore one:

```bash
git restore --source=docs-raw-sqlite-final -- <path/to/sample.sqlite>
```
