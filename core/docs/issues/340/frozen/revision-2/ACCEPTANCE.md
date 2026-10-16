# Crew full acceptance — frozen command contract

> **Status:** Current planning checklist; no release candidate exists.

The lead implements the command interfaces below during L0 and integrates workers'
real feature checks into them. Run this contract identically in each build on a fresh
acceptance Branch forked from the final LayerFS main Layer. Preserve every failed
attempt; repairs go to their lane owners, integrate to main, and use a newly named
acceptance Branch at the repaired final Layer. No freeze input edits during a build.
All figures are diagnostic, not benchmarks; OS cache state is unknown.

## Execution contract

The outer SDK script command is `python3 WALL --seconds 115 -- node STEP.mjs` (never
more than 120 seconds). Each application command is passed as one
`timeout 110 bash -c 'COMMAND'` to sandbox.exec. Command text below is the exact
COMMAND; do not omit the inner timeout because the SDK has no automatic timeout.
Run each row as its own fresh mount → exec → Commit (including failed exits) → unmount
step, with raw stdout/stderr and trace step id retained. Prepare syntax/build before
tests. Configure npm with `--fetch-retries=0 --fetch-timeout=60000 --no-audit --no-fund`.
Use the frozen exact dependency lockfile; no install/update from floating versions.

L0 provides `scripts/acceptance.mjs` modes `smoke`, `restart`, `browser`, `remount`,
`audit` and `closed`. Each mode prints ONE final JSON result with mode, checks,
pass/fail counts and `ok`, and exits nonzero for any failed required check. It may
print retained diagnostic lines first. No swallowed failures or skipped checks as
PASS. It owns all server/browser child processes within that bounded invocation,
starts the actual server entrypoint on an ephemeral port, waits for explicit readiness
with a bounded deadline, and stops every child in finally with bounded TERM/KILL.
No detached/background app or browser process crosses a command boundary.

`CREW_DATA_DIR=./data` is the persisted acceptance data. Keep the smoke's ids and CLI
credentials/config under that data directory (permissions restricted; do not print
secrets). Each later mode starts a NEW server process against the SAME committed data.
Use fixed acceptance CREW_SECRET configured in the run. Server stop/restart within
modes is explicit; read-only proofs must not clear or reseed data. npm bin `crew`
resolves the executable packages/cli/bin/crew.js, preserving its mode through Commit.

## Commands and required results

| Step | COMMAND | Required result |
| --- | --- | --- |
| A01 reinstall | `rm -rf node_modules packages/web/dist && npm ci --fetch-retries=0 --fetch-timeout=60000 --no-audit --no-fund` | Exit 0 from the frozen lockfile; clean dependency reinstall, no new dependencies |
| A02 build | `npm run build` | Exit 0; Preact browser bundle in packages/web/dist exists and has no development-only imports |
| A03 prepare tests | `npm run prepare-tests` | Exit 0; node --check for every maintained JS/MJS/CJS production and test file; JSX compiled by A02; test targets ready |
| A04 shared tests | `npm test --workspace packages/shared` | Exit 0; retain node:test total/pass/fail/skip, all meaningful leaf cases pass |
| A05 server tests | `npm test --workspace packages/server` | Same; HTTP tests use actual ephemeral-port server and temporary database |
| A06 web tests | `npm test --workspace packages/web` | Same; real router/state/action/validation behavior, no mere source-text checks |
| A07 CLI tests | `npm test --workspace packages/cli` | Same; CLI runs against actual test server |
| A08 LOC | `node scripts/count-loc.mjs --check` | Exit 0; frozen counter hash matches input, JSON total ≥10000, deterministic per-package/file counts |
| A09 seed | `npm run seed` | Exit 0; idempotent demo organization/users/project/issues with documented credentials; acceptance smoke still creates its own scenario |
| A10 smoke | `node scripts/acceptance.mjs smoke` | Exit 0; every functional check below passes and data/CLI config is committed |
| A11 restart | `node scripts/acceptance.mjs restart` | Exit 0; a new process reads A10 state and all stored read checks pass without reseeding |
| A12 browser | `node scripts/acceptance.mjs browser` | Exit 0; actual pinned Chromium/ChromeDriver via supplied Python Selenium: login, board drag/drop, compound search, inbox |
| A13 audit | `node scripts/acceptance.mjs audit` | Exit 0; maintained-file census, production-file sizes ≤999 physical lines, complete feature/route permission audit, largest-source review input, docs coverage and bundle production check |
| A14 fresh remount | `node scripts/acceptance.mjs remount` | After A13 unmount, obtain a NEW Workspace id/path on the SAME acceptance Branch; run actual `crew whoami` and persisted issue read with unchanged data and executable mode; exit 0 |
| A15 process audit | `node scripts/acceptance.mjs closed` | Exit 0; no owned application/browser process remains; this check itself starts none |

Every package invocation finishes within its inner 110 seconds. If a full package
cannot fit, record the failure, diagnose and split its test files into explicit
bounded package-owned invocations; never extend limits or loop/repeat unchanged work.
Record the final disjoint file selection and sum unique meaningful leaf test cases.
At least 120 pass, zero fail/cancelled/todo; any skip needs a README reason and does
not count toward 120. Count each independent test once, not suite containers or the
same test rerun during integration. Do not lower scope to achieve a pass.

## Smoke feature matrix

A10 assertions must use the public HTTP API and actual CLI, checking response and
persisted values, not only status codes. It proves signup/login; organization and team;
invite creation/outbox token/acceptance; project workflow and issues with every field;
labels and parent; comments with safe markdown and mentions; all relation kinds;
stable board move and bulk edit; sprint create/start/scope change/complete/carry-over
and burndown; streamed attachment SHA-256 and exact-byte download; compound query
with precedence/date/assignee/filter semantics and highlights; notification from a
mention, subscription and read/unread; feed and live SSE event; saved personal/team
filter; dashboard counts/throughput/burndown; JSON/CSV export and validated import to
a new project preserving issues/comments/labels/relations after id remapping; hashed
scoped personal token; token-authenticated CLI whoami and one real command from each
work/people/insight command family; guest denial outside their project; audit entry;
session revoke and password reset/change checks. Tests may cover more edge cases;
all SPEC features need evidence in this matrix or the retained package tests.

A11 reads the existing issue, labels/comments/relations, board order, sprint result,
attachment exact bytes, search result, inbox state and imported project through a
fresh process using the same data. A12 interacts with usable UI controls and verifies
server state after drag, search results and inbox read state; no screenshot alone
proves behavior. Chromium and matching ChromeDriver 155.0.8059.39 plus Python
Selenium are mandatory pinned environment features; driver paths come from
ENVIRONMENT.json. A14 must not install/reseed/repair permissions or recreate config:
it proves the saved filesystem already contains working executable, dependencies
and persistent data. A failed mode remains failed until diagnosed and repaired.

## Review and cleanup

Counter scope is nonblank/noncomment JavaScript/JSX (including MJS/CJS) under
packages/*/src/** plus packages/cli/bin/**. Tests, fixtures, mocks, examples,
benchmarks, generated/vendor code, scripts, docs, CSS, config, dist and node_modules
are excluded. Inline tests and test-only branches in production source are forbidden.
Copy count-loc.mjs verbatim and verify its SHA-256 against FREEZE. Review largest
files for dead code, duplicated implementations, needless wrappers and line-splitting;
≥10000 is not a license to pad. All production files must have focused responsibility.
README covers setup/config/scripts/API/CLI/permissions/filter language/data/backups/
limits. Do not claim a released LayerFS capability from this diagnostic campaign.

The lead's acceptance report maps EVERY SPEC milestone feature to a passing test or
smoke check, gives per-package unique pass/fail/skip totals and counter JSON/hash,
main/acceptance Layer and heads, every command/exit/trace/evidence path, browser and
restart/fresh-remount receipts, and all limitations. Save both daemon streams before
closing every explicit agent Sandbox. Confirm no mounted Workspace, owned app/browser
process or own Bash Sandbox remains. Main performs the last Store observation and
observer-service close/export; state its ownership precisely. Preserve every worker's
and lead's final NOTES.md verbatim, including replacements and failed run notes.
