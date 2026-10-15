# Defects and deviations — #340

> **Status:** Current planning checklist; no release candidate exists.

The main agent keeps this ledger current from Phase A onward. Each entry keeps its
original evidence; later understanding is added, never rewritten.

## Categories

| Prefix | Category |
| --- | --- |
| `P-` | LayerFS product defect (daemon, Store, FUSE, SDK code) |
| `G-` | Skill or guidance gap |
| `T-` | Codex team mechanics (spawning, messaging, slots, handoffs) |
| `E-` | Environment or orchestration correction; state whether before/after Init |
| `A-` | Application problem owned by the team, recorded only when it affected LayerFS evidence |

## Entry template

```
### <id> — <one-line symptom>

- Found: <phase/run, agent, step, time>
- Evidence: <paths to receipts, trace lines, daemon logs>
- Diagnosis: <root cause from source>
- Fix: <commit, production LOC before -> after (delta)>, or "none: <reason>"
- Regression: <test name and location>
- Verification: <what was rerun and its result>
- Effect on the run: <halt duration, Branches affected, run ended?>
```

## Entries

### E-006 — Tiny probe fixture omitted parent directories

- Found: Phase A3 setup after Init, probe agent.
- Evidence: `phase-a/a3/setup.*`, `calls/control-0002.json`,
  `setup-parents.*` and the probe ledger.
- Diagnosis: fs.apply write index 3 targeted `/src/` without an earlier explicit
  mkdir. NoSuchPath was definite; inspection showed no partial package.json.
- Fix: inspect the retained Branch, then issue a distinctly named atomic change
  including parent mkdir operations. No product change or blind replay.
- Regression: all twelve later install/syntax/test/Commit/unmount cycles passed.
- Verification: corrected fixture and histories remain retained in a3.
- Effect on the run: probe setup failure; no Crew implementation had started.

### E-007 — Docker log CLI needs a URI for an explicit socket host

- Found: Phase A3 halt cleanup after Init, probe agent.
- Evidence: `phase-a/a3/halt-close-0.*`, corrected `halt-close-unix-*` receipts
  and both daemon streams for every closed Sandbox.
- Diagnosis: the SDK accepts a raw Unix socket pathname; Docker CLI --host
  interpreted that pathname incorrectly without the unix:// scheme.
- Fix: normalize the diagnostic CLI host argument before a separately identified
  log collection. No close occurred until both streams were saved successfully.
- Regression: every later probe close saved both streams using the corrected URI.
- Verification: all eighteen explicit Sandbox lifetimes have saved logs and Closed.
- Effect on the run: retained diagnostic-command failure; no log loss.

### E-008 — Export preparation supplied the wall timeout as a positional argument

- Found: stopped-export tooling preparation after Phase A execution, export agent.
- Evidence: export agent tool return and its export preparation ledger.
- Diagnosis: wall.py 115 /bin/cat treated 115 as the executable and raised
  FileNotFoundError before the instruction read or any volume access.
- Fix: use the supplied wall.py --seconds 115 -- COMMAND argument form.
- Regression: all export commands retain the corrected explicit wrapper/deadline.
- Verification: stopped copy, WAL-visible read-only verification and explicit
  WAL/OFF portable backup succeeded; final manifest owns the exact results.
- Effect on the run: orchestration argument correction, no Store or product effect.

### E-005 — Main merge tree differed from the PR head's expected tree

- Found: owner-requested PR #343 main merge, main agent, 2026-10-16.
- Evidence: receipts `020-pr343-merge-loc.*`, `022-pr343-actual-merge-loc.*`
  and [public correction](https://github.com/Ephemeral-AI-Lab/layerfs/pull/343#issuecomment-6203080469).
- Diagnosis: the merge message's expected tree was the reviewed PR head tree
  `67b9aae440f0f740489b074ec6336714e05da07f`. Actual main also preserved the
  six #340 planning documents already merged by #341, so its merged tree was
  `d1383d3448973cf0bf85510d0cf9cd1b713ed1f2`. Product source was identical.
- Fix: recompute the exact actual first-parent snapshots with the same counter
  and retain a public correction. Do not rewrite main history.
- Regression: for the campaign integration, preview `git merge-tree --write-tree`
  and final `git write-tree` both returned `75bf028b2029d842bbaf071f2893afafa214b64e`.
- Verification: actual main production LOC remains 87,657 -> 87,680 (+23);
  campaign integration 87,658 -> 87,681 (+23), exact tree confirmed at commit
  `123fee2a22171fdb03ebad69e47f76c46231c763`.
- Effect on the run: source accounting correction retained; owner-requested #342
  diff fix integrated before the first freeze, then native rebuild repeated at
  the combined source. No Crew application has started; the existing Store and Branches are retained.

### E-004 — Early read-only build discovery omitted an explicit wall wrapper

- Found: native rebuild preparation, rebuild agent, 2026-10-16 Asia/Singapore.
- Evidence: `core/target/issue340/builds/LEDGER.md`, initial tool returns.
- Diagnosis: the agent's initial instruction/discovery reads used the command tool
  directly before switching to the supplied wall runner. Each finished below two
  seconds, but the required explicit outer bound was absent.
- Fix: all subsequent commands and every actual build use the explicit wall runner;
  builds have outer 115-second and Linux inner 110-second limits. No product change.
- Regression: actual bounded host and Linux build receipts retain commands/limits.
- Verification: host dependency/addon and Linux dependency stages passed; final
  Linux daemon build is pending at this entry. Final build manifest owns outcomes.
- Effect on the run: retained procedure deviation. Do not claim every historical
  preparatory command complied with the explicit-wrapper rule.

### E-003 — Login shell removes the pinned Node runtime from PATH

- Found: Phase A5 input review, main, 2026-10-16 Asia/Singapore.
- Evidence: `core/target/issue340/phase-a/receipts/017-login-shell-runtime.*`.
- Diagnosis: the image supplies Node/npm through `/opt/node/bin` in its configured
  PATH. `bash -lc` replaces it with the login profile's PATH; both commands are
  absent and the retained diagnostic exits 127. Ordinary `bash -c` passed A1.
- Fix: before the first freeze, use ordinary `timeout 110 bash -c` in lead,
  worker and acceptance prompts. Record exact executable paths in ENVIRONMENT.
- Regression: A1 Workspace runtime command and A3's twelve npm/test executions
  already used the ordinary shell and passed; no rerun of unchanged checks.
- Verification: pinned Node 22.23.1 ran all 45 counter self-tests, receipt 016.
- Effect on the run: input correction before Build 1, no product change.

### P-001 — Existing Sandbox selection was ignored by the JavaScript client

- Found: Phase A3, six persistent clients, 2026-10-16 Asia/Singapore.
- Evidence: `core/target/issue340/phase-a/a3/calls/client-5-0012.json`,
  `a3/public-warm-probe.*`, `daemon/service-halt-final.*`, and the external
  regression before/after receipts `010-selection-regression-before.*` /
  `011-selection-regression-after.*`.
- Diagnosis: every new client discovered the same automatic service. The native
  setup configures four ordinary connection slots and one startup slot, and
  daemon admission closed the sixth unauthenticated socket before its public
  call. The JavaScript client's source comment described selecting a Sandbox,
  but its constructor ignored `options.sandbox`. Cold concurrent discovery
  separately returned five definite before-effect Busy refusals.
- Fix: honor an explicitly selected existing Sandbox through the existing id
  validator, preserving lazy construction and default discovery. The team uses
  one own Sandbox per agent for both Store calls and Bash; startup creation is
  sequenced before concurrent work. No connection budget, retry or daemon
  algorithm changes. Commit `9f3f466cc9a00f5b3f402fb867bc41ac8c445345`; production LOC 87,657 -> 87,658 (delta +1), core 85,813 unchanged and SDK 1,844 -> 1,845. Exact first-parent/staged-tree counter record is in the commit message and receipt 015.
- Regression: external `sdk/js/test/service-selection.mjs` covers public and
  operator routing, unchanged default discovery, invalid input, lazy construction
  and an exact selected-route refusal without substitution or replay. Before:
  five failed/two passed. After: seven passed, zero skipped.
- Verification: six persistent clients using six own selected Sandboxes passed concurrent public fs.read and branch.fork at combined source `123fee2a2`; evidence `a3/r2-public-own-service.*`. No Busy/EOF. Remaining A3/A4 gates continue separately. Both native artifacts were actually rebuilt before resumption.
- Effect on the run: all six explicit Sandboxes and the shared service closed
  after both log streams were retained. Store and every Branch retained; halt
  snapshot at `a3-halt-snapshot.json`. No Build 1 Init has occurred.

### T-001 — Session supports four active agents including the primary

- Found: Phase A2, main and `phase_a2_topology`, 2026-10-16 Asia/Singapore.
- Evidence: `core/target/issue340/phase-a/A2-TOPOLOGY.md`; retained chat tool returns.
- Diagnosis: primary + lead + two workers succeeded; the additional active worker
  returned `collab spawn failed: agent thread limit reached`. Nested spawning,
  direct worker/lead messages and completed-worker slot reuse all succeeded.
- Fix: freeze all five logical worker roles with a staggered schedule, at most
  two workers alongside primary and lead. No product change.
- Regression: throwaway five-worker nonce exchanges and a sixth replacement.
- Verification: all five distinct workers, replacement and probe lead completed.
- Effect on the run: simultaneous five-worker work cannot be claimed. Same-lane
  pairs can overlap; six-process LayerFS load is separately exercised in A3.

### E-001 — A1 command's nested shell quoting failed before execution

- Found: Phase A1, main step 004, 2026-10-16 Asia/Singapore.
- Evidence: `core/target/issue340/phase-a/a1-runtime.json`,
  `a1-runtime-commit.json`, and `receipts/003-runtime.*`.
- Diagnosis: JavaScript string escaping produced three adjacent shell quote
  characters around the Node expression; Bash rejected the command with exit 2.
- Fix: explicit shell quoting function for the complete command and Node argument;
  separately identified step 005, reusing the known open Sandbox with a new mount.
  No product change.
- Regression: the corrected command directly exercised Node, SQLite, npm registry
  and browser version checks; no command from the rejected shell ran.
- Verification: `a1-runtime-corrected.json` records exit 0, untruncated streams,
  Node 22.23.1, npm 10.9.8, SQLite without a flag, selected dependency versions
  and Chromium/ChromeDriver 155.0.8059.39.
- Effect on the run: original UpToDate result and unmount retained; no silent replay.

### E-002 — Unscoped LOC snapshot extraction exceeded its own deadline

- Found: Phase 0 merge preparation, main, 2026-10-16 Asia/Singapore.
- Evidence: `~/.codex/issue340-control/pr341-loc.*` and
  `pr341-loc-scoped.*`.
- Diagnosis: the unscoped tracked tree contains 58,391 paths and 4,142,544,757
  bytes, including material outside production code. Its extraction hit the
  explicit 30-second deadline. This was a tooling failure, not a product test.
- Fix: archive every tracked file in the counter's complete production source
  and runtime SQL scopes, retaining inline test files for the unchanged counter
  to classify. Do not extract unrelated fixtures and historical evidence.
- Regression: exact original-main and final planning trees passed the same pinned
  `tools/production_loc.py --root SNAPSHOT --json` counter.
- Verification: both totals 87,657 (core 85,813; SDK 1,844), counter SHA256
  `cb9cdb1a5d00b908763894133f97a9f2b1889066651f27ce6f66009976b46197`.
- Effect on the run: retained original failure; PR #341 merge message includes
  exact first-parent comparison, and the resulting merge tree matched the input.
