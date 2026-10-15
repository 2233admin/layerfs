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
| `E-` | Environment correction before Init |
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
  algorithm changes. Commit and exact production LOC are recorded below when made.
- Regression: external `sdk/js/test/service-selection.mjs` covers public and
  operator routing, unchanged default discovery, invalid input, lazy construction
  and an exact selected-route refusal without substitution or replay. Before:
  five failed/two passed. After: seven passed, zero skipped.
- Verification: six-client live follow-up and remaining scoped checks pending.
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
