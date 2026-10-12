# Issue 320: handbook candidate list, refreshed

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Refreshed 2026-10-13 against product tree `ff47933c44f6` (branch
> `perf-experiments`). The list it refreshes is section 9 of the
> [optimization handbook](../../../../docs/general/optimization-handbook.md),
> written at `2b4dc28a6`. Nothing here is selected or built by this document.

"Receipt" below means the tier 1 "before" sample of 2026-10-13
(`v016-mixed-development-100mb-5000-k100-v1`, 100 steps and Commits), read with
[`tools/receipt_metrics.py`](tools/receipt_metrics.py).

## Status of the handbook's rows

| Handbook candidate | Group | Status now | Evidence |
| --- | --- | --- | --- |
| Batched sealed-record read | H | Not built | The record port still serves one key a job (`contains`, `get`) or one key window (`keys_after`); 155,483 of 201,510 owner jobs in the receipt are record jobs. Needs the owner: crate interface |
| Grouped point questions in Content's streamed row source | H | Not built | `StreamedRowSource` still asks one parent or serial at a time. Needs the owner: crate interface |
| Answer "is new" and "has header" inside the producer | H | Built in part | The row cursor keeps a 64-slot memo of header, value and fresh-rank answers. The receipt has 90,832 point questions and 29,654 producer record jobs, so most repeats no longer reach the owner |
| Read-compare before patching base inode metadata | H | Not built | The producer still applies both attribute patches to every stored inode it captured (956 patched, 2,260 built in the receipt) |
| Sibling page reads in the sorted merge | H | Not re-examined | The receipt has 1.6 inode pages a Commit; not a visible cost in this case |
| Narrow the territory gate to a moved directory's own chain | H | Not re-examined | Lives in Content's validation; the tier 1 case moves 2 directories a cycle |
| Local READ without a Store reader | C | Changed by R7 | READ and READLINK became one read-only owner visit (`16fa316ee`); the source-holding read path was deleted (`a591d05ff`). Grants still exceed READ requests in the receipt (4,818 grants, 196 READs): base lookups take them |
| Combine source, facts and release round trips | C | Built in R7 | The twelve cells are at 1.00 owner jobs a request. The tier 1 case is at no more than 1.75 (45,827 Read, Mutation and Lifecycle jobs for 26,078 requests; Lifecycle also holds Commit jobs) |
| Status that waits for, or does not need, a Lifecycle slot | D | Not re-examined | Needs the owner: control behaviour |
| Ordering between Commit jobs and filesystem jobs | D | Not built | Four Workspaces: owner queue wait 19.0 s against 11.5 s of service. Needs the owner |
| Negative entries, adaptive READDIRPLUS, FLUSH elision | B | Not built | Needs the owner: negotiated profile |
| Wider READDIR replies | B | Not built | READDIR is two visits and one reply row a page (`39e4ce766`); the window is still 64 names |
| Save transaction and batch cost; repeated pack searches | I | Not built | The receipt's global Store writer: 332 transactions, 1,165 statements, 138 pack reads and 372 locator misses a Commit, with 5,538 full-scan steps and 137 sorts a Commit |
| Partial-cell copies; cache-hit cost under concurrency | G, F | Partly changed | Payload rows of up to 32 KiB (`e555b771f`). The shared immutable cache evicts: 2,402 evictions for one Workspace, 27,724 for four |
| Parent pointer or ancestry evidence | H | Not built | Proposal only: canonical format |

## New rows from the "before" receipts

These are observations to model, not yet cause sentences.

| Observation | Group | Evidence | Needs the owner |
| --- | --- | --- | --- |
| Command launch is 38 to 44 ms whatever runs | A | [Native diagnostic](NATIVE-DIAGNOSTIC.md): more than half of a tier 1 step, all of a history step | Yes: a launcher is proposal only |
| Three engine requests a command, each on a new connection | A | 6.3 ms of a 76 ms step | No, if it stays inside the existing exec path |
| Each Commit starts its Store reads cold | I | 138 pack misses and 372 locator misses a Commit, repeated on every one of 100 Commits; no pack eviction recorded | To be decided by the model: cache ownership may cross a crate interface |
| Global Store statements scan and sort during Commit | I | 553,786 full-scan steps, 13,693 sorts and 200 re-prepares in 100 Commits | No, if it is an index or statement change inside Persistence without a schema element; otherwise yes |
| One write transaction costs three statements besides its work | E | 47,441 Begin, 47,441 Commit and 47,744 Startup-family reads (the free-list read of each write transaction, and 303 of the observer) in the receipt | No |
| Workspace and Lease statements on every owner job | E | 244,917 and 221,383 statements for 201,510 jobs: 47% of foreground statements | No, if the fence they implement is kept |
| A fixed cost of about 7 ms a Commit outside the owner | A, I | History case: 8.2 ms a Commit with 69 record jobs and 1.2 ms of owner service a step | Not known yet |
| The shared immutable cache is at its allowance | F | 8,375,667 of 8,388,608 bytes charged; evictions in every multi-Commit case | Yes for the allowance (a threshold); no for what is cached |
