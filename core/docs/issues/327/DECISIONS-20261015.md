# #327 implementation decisions, 2026-10-15

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> Applies to [#328](https://github.com/Ephemeral-AI-Lab/layerfs/issues/328) and
> [#329](https://github.com/Ephemeral-AI-Lab/layerfs/issues/329).

## Authority

After the agent requested A1, A2, A5, A6 and Store compatibility decisions,
the owner replied: **"no need to ask, do your best judgement"**. For zombie
reaping and requests on replaced inodes the owner replied: **"defer them"**.
The choices below are the agent's decisions under that authorization, not
quotes of interface choices independently made by the owner. The earlier
proposals and Phase 2/3 receipts retain their original status and verdicts.

## Selected contracts

- **A1:** Commit messages are UTF-8, at most 4,096 encoded bytes. Control
  characters other than newline and tab are refused before work. Empty text
  is allowed. Omitted messages use an operation description. Messages
  participate in the new Commit identity; time remains outside it. Exec
  messages describe execution, appear in results, and create no history.
- **A2:** Each text read/blame response returns at most 2,000 lines and
  262,144 UTF-8 bytes, disclosing the requested/returned line positions and
  truncation. Line numbering is 1-based and inclusive. LF separates lines;
  CRLF is preserved in text. An EOF newline creates no extra phantom line.
  A single huge line returns a UTF-8-aligned prefix with `lineTruncated`;
  continuation advances to the following line, so the omitted remainder is
  explicitly unavailable through this method. No byte-read method ships in
  0.1.7. Invalid UTF-8 or NUL is Binary. This is a response bound, not a file
  size limit.
- **A3:** Apply accepts ordered `{ op, ... }` records for write/edit/mkdir/rm/cp/mv,
  resolves one head and publishes once. Refusals identify the failing index.
- **A4:** Exact copy/move destinations; existing destination is Exists; same
  path or a destination inside the source is InvalidInput. Symlinks remain
  symlinks, modes and copied-set hardlinks are preserved. Move retains
  timestamps; copy gives new timestamps. No overwrite option.
- **A5:** Defaults 50/0; positive safe-integer pageSize at most 1,000 and
  nonnegative safe-integer pagePos. Names use byte order, paths use path
  order (grep then line), Commit history follows first parents newest first.
  Deep offsets may perform linear skipping in 0.1.7, through bounded windows
  with no resident collection of skipped entries. No silent clipping or
  total-history/namespace cap. Each operation resolves its reference once.
- **A6:** Persist project and Sandbox discovery under private `LAYERFS_HOME`,
  authorized by ownership and restrictive permissions, with explicit identity
  checks and cross-process coordination. No extra user token. Discovery must
  reach an existing daemon without reinstalling the Store. Restart recovery
  and resending uncertain mutations remain outside this contract. The
  [A6 investigation](A6-INVESTIGATION-20261015.md) separates existing ports
  from the implementation still required.
- **Store:** New history records and `layerfs/commit/v3` identity; old
  Disposable Stores are rejected, with no migration. Messages, history facts
  (B4) and publication counters (D) belong to the same format change.
- **B1/B2:** Internal `@layerfs/sdk/operator`, separate Rust/native/daemon
  dispatch with public refusal of `operator.*`. Process control remains in
  the native executor. HTTP exists only in the demo server. Mounted file
  views use ordinary exec through their mounts.
- **B3:** Preserve the standard's two positional status arguments; paged
  changed/conflict paths belong to operator.workspace.changes. Status reports
  base/head and pending-change summaries without an unbounded path result.
- **B4/C/D:** Use the plan's history facts, diagnostic UI timing and byte
  definitions. Unavailable per-file stored attribution stays null. Publication
  counters need the required speed/storage screen before retention.

## Explicit deferrals and unchanged constraints

Zombie reaping and the existing replaced-inode FUSE policy are deferred by the
owner. Neither is repaired or treated as newly qualified here. A9 remains FAIL
at its recorded Phase 2 identity until a new cross-process proof passes.

Disposable/WAL/synchronous=OFF is selected explicitly. Durable execution is
NOT_RUN — disabled by owner until explicit reauthorization. No dependency
addition, push, PR or release is authorized by these decisions.
