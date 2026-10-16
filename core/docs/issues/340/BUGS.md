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

### P-003 / G-002 — Oversized SDK input surfaced as Failed instead of TooLarge

- Found: Build 1 W1c call 112, `fs.apply`, 2026-10-16T00:24:04.194Z.
- Evidence: original `agents/W1c/out/calls/W1c-112.json`, verbatim lead copy
  and `agents/W1c/out/failed-112-custody.json`. Six proposed writes contained
  64,545 UTF-8 content bytes; the saved payload was 66,377 bytes, SHA-256
  `2e6520cd620f374492eb9c6029f2a132c6a250366dc68506eb325c1e62de47ef`.
  Compact payload JSON was 66,229 bytes and positional-argument JSON 66,235 bytes;
  neither is claimed as the binary wire length, which was unavailable.
- Diagnosis: `wire.rs` admits one control record of at most 65,519 bytes.
  `control_sdk.rs` explicitly bounds the complete value tree. Encoding stopped
  with `control record limit`, phase Encode, attempted false, received None,
  fence_error None. The API/native fallback exposed this as `Failed`, detail null,
  and Debug text embedded the full request. The existing fs-write guide promises
  `TooLarge` for a change that does not fit one call. This is a classification and
  guidance defect; no transport limit is being raised or implicit replay added.
- Custody: after the post-failure command, 117–129 inspected Idle/overlay zero,
  unchanged source bytes at all six paths and history without a 112 source Commit.
  The proposed write remains unapplied. All team clients halted and closed after
  daemon logs; the observer is being closed after its separate log capture.
- Regression: external `layerfs-api/tests/sdk_admission.rs` exercises real
  authenticated plain and traced channels. Before the fix, both oversized cases
  failed the TooLarge expectation; another encode-failure custody case passed.
  A later valid operation uses correlation one with exactly one send, proving
  the rejected oversized call was not sent or replayed. Receipts are under
  `~/.codex/issue340-control/report-preparation/p003-before-*`.
- Fix: the SDK API converts only the exact unattempted Encode/control-record-size
  failure, without reply/fence custody, to `TooLarge` with bounded text and null
  detail. Every other failure retains its original classification and custody.
  The guide and architecture document describe the encoded-call bound and larger
  atomic Sandbox route. No limit, storage algorithm, splitting or replay changed.
- Changed verification: all 19 API tests passed, including both plain/traced
  size cases and unchanged-custody regression. API examples compiled (their test
  targets have zero tests; native example execution is not claimed). Warning-denying
  API Clippy, the production boundary guard and its 50 self-tests passed.
  Scoped formatting passed; whole-core formatting exposed the unrelated existing
  test formatting recorded in E-026. Git commit/LOC and rebuilt installed/live
  verification are recorded separately when available.
- Repository fix: `59f05450b066b738003b680df6b370d9ad71361a` at tree
  `2f3c0a237a43c063fc6dbf00a9866fc54c3b34c1`. Production LOC:
  87681 -> 87702 (delta +21), core 85836 -> 85857, SDK 1845 unchanged,
  reference absent (retired R9c; last counted 65,417 at tree 498dd1917812).
  Exact first-parent/staged-tree comparison uses the pinned production counter;
  the committed tree equals the counted staged tree. Actual native R3 builds
  passed at `e6650057906f41c47327a4b67d8cb80f6d2a6bb9`; the host addon changed
  to SHA-256 `3cbf8b55fdf2940d422349eb6d82ebc77b9816192f1fa77405f8de963c4b08dc`.
  The daemon Cargo build ran and its existing binary hash remained unchanged.
  Installed live proof remains pending.

### E-023 — Host result projection continued after a failed fs.apply

- Found: W1c call 112 and its explicit report during Build 1.
- Diagnosis: host composition selected `.output` without checking the tool's
  numeric exit, then started already-authorized final tests before inspecting
  the failed apply. There was no mutation replay. The apply's numeric host exit
  was not retained; the original uncaught Node error is retained instead.
- Evidence: 113 mounted the last good head; 114 exited one, with shared 127
  passing and server 221/222 passing (one Insight redaction expectation failed).
  CLI did not run. Commit 115
  `12b99cb0c9417a991cb459c4e87d5c30256c9fe0f5c4e578358c2082e7ffecb74b`
  and unmount 116 followed; subsequent custody inspections are in P-003.
- Disposition: these tests qualify only their actual last-good input and remain
  failed overall. No credit is given to unapplied 112 changes. All original
  inputs, failures, history and HALT notes remain retained; future dependent
  calls require an inspected successful predecessor result.

### E-024 — Large observer daemon logs exceeded the capture budget

- Found: root's logs-before-close operation 026 during the P-003 halt.
- Evidence: `observer-halt-p003-daemon/capture.json` reports Docker logs killed
  at 30 seconds after 1,867,839,474 stderr bytes. The partial stream, hash and
  failed receipt remain. No Sandbox close was attempted.
- Diagnosis: supplemental metadata observation produced a 6,872,870,271-byte
  Docker json-file log. Changed timestamp windows reduced returned data but
  still required costly earlier-log scanning: windows 32 and 33 timed out,
  with their partial/empty output and failures retained. Earlier windows passed;
  no complete window-collection claim is made.
- Changed route: a networkless helper with logging disabled binds the actual
  Docker logging directory read-only, compresses the log and verifies its exact
  decompressed bytes against equal before/after source SHA-256 and size. It
  extracts both daemon streams in original per-stream order. No Store opening,
  product change, SDK replay or timeout increase is involved.
- Source pin: 6,872,870,271 bytes, SHA-256
  `5bba4461cecb02f2340ecde04a7c00eb3af18313178d8c2d0816dfd1e743e48a`;
  no rotated log files were present. Verified archive: 380,586,874 bytes,
  SHA-256 `7ce40a83d96b164b1ad85e8fc74cbc312d6812264a8630f6910997d078136a26`.
  All 17,009,645 records decoded; stdout is 36 bytes and stderr 5,378,046,216 bytes,
  SHA-256 `9c36811bc9f24d067db1544165245f8d262e1ca1afb2d5c4022a53359131e6bc`.
  Before/after source hashes match, and decompression reproduces that exact source.
  Observer close 029 completed at 00:34:29.684Z, followed by empty volume-container
  inventory 030. Raw partial captures remain separate from the complete streams.

### E-025 — New external regression test initially missed a function keyword

- Found: root P-003 regression preparation, `p003-before-build.*`.
- Evidence: locked offline no-run compilation exited 101 after 41.527 seconds,
  diagnosing a missing `fn` in the new test. No test ran and no timeout occurred.
- Fix: add the keyword, then separately build the target before execution.
  The changed no-run build passed; the actual before-fix tests exposed P-003.
  The final test source separates plain and traced failures so both execute.
- Effect: test-only preparation correction; product source was unchanged.

### E-026 — Required whole-core formatting found an unrelated existing difference

- Found: P-003 verification, `p003-fmt.*`, exit one.
- Evidence: rustfmt wants to wrap the assertion at
  `layerfs-persistence/tests/sqlite_group_rows_indexed.rs:133`. That file has no
  difference from the campaign HEAD; it was not changed by this fix.
- Disposition: retain the whole-core formatting failure and preserve unrelated
  source. Scoped formatting of both changed Rust files passes. API tests,
  warning-denying API Clippy, boundary guard and 50 self-tests pass; none is
  represented as a whole-repository green result.

### E-027 — Standalone SDK checks were incorrectly invoked as Node test files

- Found: root P-002 verification, `p002-after-tests.*`, exit one.
- Diagnosis: service-selection.mjs is a Node test suite, while packaging.mjs and
  trace.mjs are standalone case-selected programs. Running all three under
  `node --test` omitted required `lazy|dispatch` and `on|off|failure` arguments.
- Evidence: all eight service-selection leaves passed, including Binary catalog
  membership. The two standalone program entries failed on their explicit usage
  guards. This overall command stays failed; it does not establish an SDK defect.
- Changed follow-up: inspect their actual source/arguments, then packaging/lazy
  and trace/on, trace/off and trace/failure each passed as its own bounded command.
  Packaging/dispatch waits for the rebuilt native binding. The unchanged passing
  service-selection suite was not replayed to replace the failed combined run.

### E-022 — Worker quote repair was followed by an unchanged failed-command replay

- Found: P1c control preparation during Build 1, calls 089/093 and the worker's
  explicit disclosure to the lead.
- Evidence: `b1/agents/P1c/out/protocol-deviation.json` retains calls 089–099.
  Calls 089 and 093 used the byte-identical 180-byte command, SHA-256
  `70d84503022db8c0a0ca71f8ffed3cf5ca04869fcad6445dbbeabd56e7ee683e`.
  Both returned exit 127, empty stdout and `admin-only: command not found`,
  without truncation. Call 093 is an unchanged blind replay and violates the rule.
  The first attempt created Commit 090
  `122e571ad2adf9c5b9902a0420a1660c29508dcb83ca947f7fd7013277f22c03ef`
  before unmount 091; the replay created Commit 094
  `121b67dead3fec85aa348aa78e8c9a950f60337f4faafc4f287cfdb93afce6fe03`
  before unmount 095. Neither failed Exec is claimed to have had no effects.
- Diagnosis: one quote repair failed, then the worker mistakenly replayed an
  unchanged failed command. This is a protocol deviation from the standing
  one-attempt/read-before-changed-follow-up rule; it is not a LayerFS defect.
  The helper emitted three single quotes, ending the outer bash command early;
  the pipe in the test pattern then invoked `admin-only` as a shell command.
  Host repair chunk `59c438` failed to parse before effect, but dependent calls
  092–095 mistakenly proceeded. Its failure output is explicitly reconstructed
  from the tool transcript, not an independently redirected process capture.
- Disposition: the lead required explicit reporting. Root explicitly blocked
  further replay on that path until retained source/state diagnosis and a concrete
  changed command are recorded. No failure is relabeled as success, no unchanged
  result is selected as a favorable sample, and the history is retained.
- Changed follow-up: helper correction chunk `31edeb` passed syntax and an actual
  bash argument round trip in chunk `1bed6a` before call 097. Its 182-byte command
  has SHA-256 `57795507fb7587202f7c624af1e7ee0ec8305645e35090cf0dc2f7a4b48ff2c0`.
  That changed call returned exit 1 from the real import-policy assertion (A-018),
  followed by Commit 098 and unmount 099; it is not a passing replacement sample.
- Effect on the run: disclosed Build 1 orchestration deviation. The deployed
  SDK, environment and frozen inputs remain unchanged.

### A-018 — Limited tokens exposed data through issue, team and import operations

- Found: P1c cross-lane runtime authorization audit during Build 1.
- Evidence: call 076 PATCH /issues/:id with a write-only token returned 200,
  exposed the existing Context description and canonical fields, changed the
  title and emitted one event. The required deny/no-state/no-event assertion
  failed. An admin-only team PATCH likewise returned the existing private
  description and mutated. After the failed Exec, 077 was UpToDate and 078
  unmounted; there is no new failed-outcome Commit.
- Further actual witness: call 097 used a schema-valid import preview with write
  plus admin scopes and returned target member names/emails/mapping without read
  scope. Preview made no project write. An earlier malformed import fixture
  returned 422 and was never claimed as a leak witness.
- Repair ownership: P1c enforces team and import permissions; import checks the
  existing member-list read permission before mapping for both preview and commit.
  W1c owns the active issue read/write preauthorization alongside revision
  handling, coordinated with P1c's separate Branch. W1c 051 also adds a guarded
  comment-detail GET for edit review, which remains in the final route audit.
- Verification: the narrow team read/admin guard now denies without state/event
  effects. Other changed focused/full integration proof remains pending here.
- Expanded audit: P1c 137 retained seven further canonical-response witnesses:
  project and membership partial updates with admin-only tokens, and bulk issue,
  sprint metadata, label, relation and saved-filter writes with write-only tokens.
  Six returned 200; relation creation returned 201. Every witness changed state
  and emitted one event while exposing retained fields without read scope.
  The verbatim decoded witness copy is
  `b1/agents/lead/out/P1c-canonical-pre-fix-witnesses-VERBATIM.json`, 6,272 bytes,
  SHA-256 `adb6939c7cca1391875dd276cab9b75c84745689721e3f5efc20568c7e8fe6e4`.
  Original stdout, failed-outcome Commit 138 `1205ad...` and unmount 139 remain.
  Member POST was a separate eighth actual witness at 151.
- Changed verification: guard change 154 `127d75...` preceded 156, which passed
  16 policy leaves (canonical eight, integrated four, earlier frontier four).
  Denials checked zero state/event effects; the canonical eight also checked
  allowed calls with combined scopes. CLI 38/38 passed. Build Commit 157
  `127fac...` and unmount 158 followed. These are scoped changed proofs;
  final integrated route inventory and full acceptance remain pending.
- Effect on the run: application policy defects with real runtime witnesses,
  distinct from source-only privacy hardening. No LayerFS/SDK/skill change.

### E-021 — Refused-merge table columns omitted available provenance

- Found: root report preparation after actual people merge Conflict 207.
- Evidence: the complete error already retained sources and mergeBase, but the
  flattened merge columns only read successful-result fields. The original
  full error column and raw receipt were never lost or changed.
- Fix: derive those two columns from error.detail when absent from the result,
  matching the existing LWW/truncation derivation. This changes report tooling
  under the ignored analysis directory, with no SDK/product/application change.
- Regression: one new external fixture modeled a refused merge with sources,
  merge base, prospective LWW and a resolved path. It failed before, then passed
  after the two-field correction. It also checks resolution timing and resolver.
  Receipts are `~/.codex/issue340-control/report-conflict-provenance-before.*`
  and `report-conflict-provenance-after.*`.
- Source custody: exact after/test copies are retained under
  `~/.codex/issue340-control/report-conflict-provenance-sources/`. Before source
  is an explicitly labeled inverse reconstruction from the retained two-line
  patch; no independent pre-patch source hash was captured. It is not presented
  as an original source capture. The final covering analysis suite remains pending.
- Effect on the run: offline table correction only; no team halt, source replay,
  input freeze change or performance qualification.

### A-017 — People integration exposed unauthenticated insight CLI fixtures

- Found: full people integration after successful document conflict resolution,
  lead call 219 on int-people-m3-r1.
- Evidence: clean frozen npm ci, census, build and preparation passed; shared
  117, server 203 and web 85 passed. CLI passed 31/38, with seven failures in
  insight-activity.test.js reporting UNAUTHENTICATED for actual feed, inbox,
  watch, dashboard, digest, export and import commands. No skips/cancellations/todos.
- Custody: failed-outcome Commit 220 `12be5a99a757...` and terminal unmount 221
  retained. Counter and closed checks did not run because the command stopped
  at the failed CLI package; they are NOT_RUN for this attempt.
- Diagnosis: an old cookie-only fixture is suspected after the new token-based
  CLI contract, but the source owner must inspect it before a change is claimed.
  A fresh P1c successor owns this and remaining cross-lane authorization/live
  integration. Changed verification remains pending; no failing leaf is relabeled.
- Effect on the run: application integration qualification failure. The earlier
  text merge succeeded; people has not been published. No LayerFS/SDK/skill change.
- Diagnosis/verification follow-up: P1c inspected and confirmed the cookie-only
  insight fixture. Test-only source `12f9cc...` now uses an actual session-minted,
  hashed Bearer token and asserts its stored hash. P1c 012 passed all 38 CLI
  leaves after build/prepare of 201 files; 013 saved proof Commit `127220...`,
  and 014 unmounted. No authentication behavior was weakened. Full later
  integration remains pending; the original seven failures stay failed.

### A-016 — Permission checks ran after board and sprint side effects

- Found: P1b global permission audit, Build 1, observed calls 161/166.
- Evidence: the write-only token board-move request returned 403 after changing
  the persisted status. The write-only sprint-scope request returned 200 with
  a full issue, including description, and persisted the assignment. These are
  actual runtime witnesses, unlike the source-only privacy concern in A-012.
- Diagnosis: compound operations needed read permission as well as their write
  permission before effects, rather than discovering denial during a later read.
- Fix ownership: P1b owns permission enforcement across every route. The lead
  approved narrow preauthorization of project read alongside write in
  `boards.moveBoardIssue` and `sprints.changeSprintScope`, without changing work
  algorithms. Source call 170 and composite-scope documentation are retained.
- Verification: call 172 passed four new scope/frontier regressions plus 15
  existing planning leaves, 19/19; 173 returned UpToDate and 174 unmounted.
  Full final all-package acceptance remains pending.
- Effect on the run: application authorization defects, no LayerFS, SDK, skill
  or deployed frozen-input change. Original failures remain retained.

### A-015 — Full-document navigation retained live event connections

- Found: I2 expanded real-browser live-update qualification in Build 1.
- Evidence: original long-navigation failures, isolated diagnostic receipts,
  worker/lead ledgers and source repair `120696...`; all attempts are retained.
- Diagnosis: runtime observation confirmed HTTP 429 after old full-document
  EventSource connections accumulated. This is a Crew browser lifecycle defect,
  distinct from the earlier loading-state/draft failure in A-013.
- Fix: I2 added explicit pagehide/pageshow lifecycle handling and a regression
  for paused subscribers. No LayerFS/SDK/skill code changed.
- Verification: changed expanded browser calls 219/220 passed three groups;
  17 changed live/resource leaves passed within the scoped proof. Full final
  application acceptance and integrated size qualification remain pending.

### A-014 — People security browser could not click sign out

- Found: P1b actual Chromium account-security qualification on people.2.
- Evidence: full `b1/agents/P1b/out/calls/P1b-108.json` reports exit 1,
  `ElementClickInterceptedException` on the Sign out control. Call 109 is
  UpToDate at `1234cb64bac2928ab88cdf446227aabab317c2fab0f3a289f0fc500f72348b3f4b`,
  followed by terminal unmount 110; there is no new failed-outcome Commit.
- Diagnosis and changed browser verification: pending with the source owner.
  Do not infer an application versus fixture cause solely from the exception.
- Scoped preceding checks passed: shared 24, CLI 25 and server 26 in their
  retained invocations. They do not qualify the failed browser path.
- Effect on the run: retained application/browser failure, no LayerFS, SDK,
  skill or deployed frozen-input change; people remains unfinished.
- Diagnosis follow-up: real 800×457 inspection at P1b 116 established that the
  L0 sticky sidebar used visible overflow and placed Sign out beyond the usable
  viewport. P1b 123 passed seven desktop account-security groups, which does not
  qualify the shorter viewport. Lead-owned CSS repair 183 adds scrolling and a
  zero minimum height. A real 800×600 scroll/logout/401 regression 187 is under
  qualification, with its initial build/prepare/scoped test running at this entry.
- Separate P1b server integration 127 passed 99/101. The two failures concern a
  cookie-only CLI fixture after token-only CLI authentication and a reset response
  expected status; the owner is correcting fixtures to the actual Bearer path and
  202 contract. Both failed leaves remain failed; changed proof is pending.
- Viewport verification follow-up: lead 189 passed the real short-viewport
  regression after build/prepare. At inner 800×457, the sidebar client height was
  442, scroll height 751, overflow auto and scrollTop 309. Sign out was visibly
  hit-tested, one click made GET /me return 401, and owned/global browser counts
  were zero. Commit 190 `1297366...` and terminal unmount 191 are retained.

### A-013 — Live background refresh unmounted active issue editing controls

- Found: I2 complete web integration, Build 1, actual Chromium work-issue test.
- Evidence: `b1/agents/I2/out/calls/I2-110.json`: web 66/67 passed,
  `issue-browser.test.js` failed on a stale control after saving. CLI 33,
  server 163 and shared 117 passed within their stated scoped invocations.
  Call 111 returned UpToDate at head
  `126efc8474fdd814c608c0fcfa197a379f01e41ca83eb3d073ebadf9f986a3a037`;
  call 112 unmounted. Do not invent a new failed-run Commit.
- Diagnosis: the insight-owned live resource refresh set loading on an already
  loaded detail, temporarily unmounting its discussion and edit controls. This
  could interrupt real user drafts; the browser failure is retained.
- Repair ownership: I2 preserves loaded content during background refresh and
  adds race/authentication-state coverage plus a real unsaved-draft SSE case.
  The lead authorized the one work form identity key change from updated time
  to issue id. The lead writes no lane feature code; other work behavior remains
  with its existing owner. No action retry or weakened work assertion is accepted
  as verification of the defect.
- Verification follow-up: changed proof, saved as Commit `12e5dd832581...`, passed the original
  Chromium issue-browser leaf and five new resource-state cases, 6/6, with zero
  owned/global browser processes after the run. Source/receipt identities remain
  in I2's full call records. No work assertion was weakened or action replayed.
  A new representative project/workflow/sprint draft, SSE and failed-refresh
  browser regression is prepared and pending. The lead additionally authorized
  the same narrow refresh-error guards and stable form keys for those work
  callers, including consuming their actual successful Save acknowledgements;
  it assigned people callers to P1b. Integrated API/SSE/CLI smoke passed 32/32.
- Later verification: I2 call 206 passed all 72 affected web leaves. The isolated
  project/sprint 503-refresh, SSE draft and canonical-Save/scope checks also
  passed within their stated diagnostic proof. A longer navigation sequence
  retained a separate failure and a changed paused-subscriber lifecycle
  regression remains under qualification; final all-product acceptance is pending.
- Effect on the run: application integration defect, no LayerFS/SDK/skill change
  or insight publication; full final acceptance remains required.

### E-020 — Host documentation read assumed an unformatted heading

- Found: root report preparation during Build 1, with no SDK or application call.
- Evidence: original tool return chunk `f668f1`, retained as an explicitly labeled
  transcription in `~/.codex/issue340-control/report-read-heading-failure-transcription.json`.
- Diagnosis: Python `str.index("## fs.stat")` did not match the actual Markdown
  heading containing backticks and the method signature. It raised `ValueError`
  before the subsequent trace/worker-note reads in that host command.
- Fix and verification: a separately bounded `rg` read inspected the actual
  heading; independent trace/NOTES inspection also completed, both exit 0.
- Effect on the run: host read preparation only; no mutation or product change.
- Related boundary-preparation search: root later assumed absent sdk/js/index.js
  and sdk/js/lib paths; bounded rg exited 2 after matching the valid guide paths.
  The exact tool return `3f1f30` has a labeled transcription under
  `~/.codex/issue340-control/sdk-entry-search-failure-transcription.json`.
  Recursive source discovery corrected the search without an SDK/application
  call. This host discovery error is separate from the still-deferred P-002 fix.

### A-012 — Insight qualification assertions required corrections

- Found: I1 guided-query browser and I2 full-server qualification during Build 1.
- Evidence: I1 calls 103–126 and I2 calls 095–098, their full stdout/stderr,
  source changes and worker/lead ledgers. Original failing attempts are retained.
- Diagnosis: I1 first assumed operator options had rendered after a field change.
  A bounded wait still failed; DOM inspection then established that native
  `option.value` was correct while Preact omitted redundant value attributes.
  Selenium 4.8 `select_by_value` queried the absent attribute. Selecting visible
  operator labels corrected that harness assumption. A later invalid-manual-query
  assertion relied on Selenium `clear`; actual Ctrl+A/Backspace input and explicit
  feedback readiness verified preservation of the entered query.
- Verification: changed I1 browser/privacy/edge proof passed 5/5 at call 126,
  with zero owned browser processes reported after cleanup. This is scoped
  qualification; final all-package acceptance remains pending.
- I2 full server call 096 passed 158/159; the sole failure expected a redacted
  activity fixture to report true where it correctly reported false. The owner
  is correcting that expectation and adding a distinct public-feed redaction
  assertion. The failed Commit `124791cb714aa3e6b72c4a47125eecee8708a936d63485dce3a700305c0c5325b1`
  and terminal unmount are retained. Changed source `12072edfd572...` corrected
  that expectation and added distinct redaction coverage; I2 call 106 then passed
  all 163 server leaves. The initial failed invocation remains failed.
- Saved-filter privacy was a source-review concern, with no observed runtime leak
  witness. The new current-policy HTTP/SSE cases passed 5/5 within I2's first
  server invocation. Do not describe this as a reproduced pre-fix leak.
- Effect on the run: application/harness work owned by the team, no LayerFS,
  deployed SDK, skill or frozen-input change.

### E-019 — Host source guard assumed a readiness literal after a successful read

- Found: Build 1 lead host preparation after source write 152 and read 153.
- Evidence: full successful fs.read 153, source write 152/hash, original host
  tool transcript and the lead's explicitly labeled custody clarification.
- Diagnosis: a guessed readiness-string guard failed in the host process. The
  read itself succeeded; no sandbox.exec or later fs.edit ran in that failed
  host preparation. The source already matched the known acknowledged write.
- Fix: inspect the complete actual source/hash rather than infer a write failure
  from the host process's exit. Do not resend the acknowledged mutation.
- Effect on the run: host diagnostic failure, not a failed SDK read, lost reply
  or original active-SSE shutdown execution. Reconstructed transcript custody is
  identified rather than described as separately captured raw streams.
- Follow-up: a later exact-notification browser control guard similarly failed
  after successful read 163 and before mutation because its transcribed anchor
  had an extra parenthesis. A source-boundary-based edit 165 corrected the host
  preparation; syntax call 167 passed, Commit 168 was UpToDate, and 169 unmounted.
  Original transcripts are labeled as such. Future lead host capture preserves
  original subprocess command/stdout/stderr without changing SDK receipts.

### A-011 — Source review found an active-SSE shutdown ownership cycle

- Found: Build 1 lead's L0 source review during insight integration.
- Evidence: original index.js and live.js control order in immutable source,
  lead source repair 1259e99b..., I2 response-drain wiring 120b7261...,
  actual new regression Exec lead-155 and Commit/unmount 156–157.
- Diagnosis: HTTP close waited for streams, while the stream owners' onClose
  cleanup ran after HTTP drain. The old three-second force/exit-1 outcome was
  a SOURCE INFERENCE from that cycle, not an executed pre-fix failure. The lead
  explicitly corrected this distinction in its ledger/NOTES; no original runtime
  failure witness exists and none is claimed here.
- Fix: lead added an application drain hook before HTTP close and cleanup of
  all callbacks despite errors. I2 closes owned responses/timers there without
  prematurely closing the database. The shared L0/lane ownership is preserved.
- Verification: the first actual changed regression passed three leaves after
  prepare/build of 170 files. It includes the real server entrypoint with an
  authenticated events stream, SIGTERM, exit 0 and stream EOF; database remains
  usable while HTTP drains, and callback cleanup continues despite an error.
  Commit 156 merged a concurrent moved head cleanly, with empty LWW/displacement,
  then unmounted. Full final application acceptance remains pending.
- Effect on the run: application lifecycle repair identified from source, no
  LayerFS defect, fabricated failed Exec, frozen-input change or prior PASS relabel.

### A-010 — Shared build overwrote esbuild's lane CSS output

- Found: Build 1 I1's actual-source review during insight browser qualification.
- Evidence: lead-owned L0 build source repair on insight.2, source 12f8f493...,
  fresh build/prepare/CSS-composition proof lead-133 and generated-output Commit
  128b6e434580..., plus the lead ledger for complete identities.
- Diagnosis: esbuild emitted imported lane CSS, then L0's global stylesheet copy
  overwrote that output. Earlier DOM/API passing tests do not establish that the
  lost lane styles were present.
- Fix: lead changed its shared build to import global CSS first and removed the
  overwriting copy. This is L0 build ownership; no lane feature was taken over.
- Verification: preparation of 152 files, a fresh production build and actual
  global/search CSS-composition assertions passed. Full insight integration and
  final browser acceptance remain pending.
- Effect on the run: application bundling repair, no dependency, LayerFS/SDK,
  frozen-input or skill change. The prior built snapshots remain retained.

### A-009 — Search browser qualification failed on malformed-query submission

- Found: Build 1 I1-050 registered search HTTP/CLI/browser qualification on
  insight.2, followed by I1-055's separately identified DOM-state diagnostic.
- Evidence: both complete Exec results, failed-outcome Commit/UpToDate and
  unmount receipts, browser DOM/parser output, and I1/lead ledgers.
- Diagnosis: the actual browser encountered a disabled submit while exercising
  a malformed query. Precise application-versus-check diagnosis is pending;
  the source owner is inspecting the current rendered/parser state.
- Verification: preparation of 147 files and build passed. Full server 120/120
  and CLI 25/25 passed in the failed combined attempt; earlier shared 86 and
  web 46 leaves passed at their stated identities. The browser leaf failed 0/1
  and remains failed. Cleanup reports zero owned live/zombie browser processes.
- Effect on the run: pending application/browser qualification, no final
  acceptance, LayerFS repair or credit for the failing browser outcome. Passing
  packages are not rerun merely to diagnose this separate flow.
- Diagnosis follow-up: I1 identified a missing Fragment import, reached when the
  malformed-query validation state rendered JSX fragments, and corrected source
  129a276b02bd... . Original failures remain retained. The changed browser proof
  is pending at this follow-up; the full source identity is in I1's receipts.
- Verification follow-up: the changed initial I11–I13 focused proof passed 82/82,
  including the actual browser's malformed query, later-page search and saved
  edit paths. Subsequent I14 extensions and their independent assertion fixes
  are recorded as A-012; the first failed browser outcome is not relabeled.

### A-008 — Insight event integration nested an application SQL transaction

- Found: Build 1 I2-033 focused HTTP/event/SSE proof on insight.2; 25 passed and
  two failed. The same-Branch I1 owner independently diagnosed its index update.
- Evidence: complete I2-033 result and subsequent Commit/unmount, I1 failed
  mount snapshot/repair and lead ledger. Failed leaves are membership-removal
  historical activity and rolled-back people-style event persistence.
- Diagnosis: a synthetic issue event inside an existing application transaction
  invoked a search-index BEGIN, which SQLite rejected as nested. Separately,
  a fixture overasserted that all personal activity must be empty after removal
  from one organization. These are application database/assertion problems;
  the node:sqlite database here is Crew data, not the global LayerFS Store.
- Fix: I1 changed the index transaction to a SAVEPOINT, source
  `124129552e1dca41cbfbdbfab38173baf9790c070d8f13415580adb27847a61c11`,
  and added an explicit rollback regression. I2 owns the activity fixture's
  precise access-revocation assertion. Final changed verification is pending.
- Verification: actual SSE delivery, session revocation and project-grant
  revocation leaves passed in the failed attempt, but do not turn its overall
  outcome into PASS. The failing mounted snapshot remains immutable evidence.
- Effect on the run: ordinary cross-module integration before insight
  publication, with no LayerFS product change, Store reset or passing-test credit
  for the pending repair.

### E-018 — Diagnostic tools and unborn-module paths were assumed available

- Found: Build 1 W2b-052 installed-source diagnostic and I2 initial source audit.
- Evidence: W2b-052/056 complete results and final NOTES; I2 original failed
  source-audit Exec/Commit/unmount and lead ledger.
- Diagnosis: rg was absent inside the pinned runtime. W2b's pipeline returned
  exit 0 without the intended inspection; this is not an inspection PASS. I2's
  first audit separately emitted useful architecture information, then its census
  failed because the new insight module directory did not yet exist.
- Fix: W2b retained a separately identified bounded grep inspection at 056 and
  changed no third-party source. I2 owns inspection/preparation of its new module;
  the exact follow-up remains in its own notes and receipts.
- Effect on the run: diagnostic/environment assumptions, no LayerFS defect,
  passing-test credit, dependency addition or replay of an uncertain mutation.

### E-017 — Process audit predicate matched its own diagnostic command

- Found: Build 1 lead-106 controller-namespace audit.
- Evidence: original failed lead-106, changed lead-110, their UpToDate/unmount
  results and old-lead daemon capture/close plus new creation 113–114.
- Diagnosis: the broad command-text match included the diagnostic itself. The
  changed predicate then proved zero live application/browser/build processes,
  while retaining 26 terminated unreaped PID-1 children: 20 Chromium/crashpad
  and six esbuild. These historical entries are not newly running processes.
- Fix: retain the failed diagnostic and use the corrected predicate. Lead saved
  both daemon streams before closing only its old Sandbox dd4eff..., then created
  a fresh explicit lead Sandbox 67b7c3... on the same preserved Store. No selected
  client was reused after close, and the root observer was untouched.
- Verification: changed audit passed; old close and new create have known
  outcomes. A separate lead acceptance-auditor change passed syntax and three
  closed-mode checks in the fresh namespace. Full final acceptance remains pending.
- Effect on the run: planned controller lifetime boundary, no SDK/artifact fix,
  Store reset or claim that old zombies were already reaped. Container removal
  removed that old process namespace; filesystem history is not process state.

### A-007 — Later-page planning picker browser proof exposed selection failures

- Found: Build 1 W2b-048 real Chromium proof with more than 200 records.
- Evidence: full W2b-048 and W2b-061 Exec/Commit/unmount receipts, captured browser
  DOM/API assertions, successor notes and lead status messages.
- Diagnosis: the first organization/member paging checks passed, then the real
  multi-label selection retention assertion failed. W2b inspected its own code,
  native Preact select handling and the browser gesture before a changed follow-up.
  The later attempt exited 1 with an exact 4-versus-5 assertion; its full diagnosis
  is pending and must remain separate from the earlier selection failure.
- Fix: W2b owns the application/verification correction. No LayerFS, SDK,
  third-party edit, timeout increase or dependency change is selected.
- Verification: each attempted failure remains failed and is saved/unmounted;
  final affected proof and lead full integration are pending at this entry.
- Effect on the run: additional application UX qualification, no Store reset or
  independent-run restart. No final work publication is claimed from these attempts.
- Follow-up: the first actual bug was scalar select.value handling under pinned
  Preact; W2b bound selected state on each native multiple option, source
  `12e2bac9e159f7e028f28e332d53b7491017feaba22259dac6cb6d10dab6d2fc76`.
  The 061 browser actions all completed, then a mistaken hardcoded group count
  expected five when there were four. W2b replaced count-only checking with exact
  action identities and added a real later-page board-scope action. W2b-066 passed
  all five explicit groups, 54 limit-50 page requests, no unexpected browser errors
  and zero owned/global browser processes or zombies after cleanup. Final W2b
  proof passed server 74/74 and web 38/38; both original failed attempts stay failed.

### E-016 — Reporting normalizer did not yet cover all retained receipt formats

- Found: root offline input-format review while Build 1 continued; no final
  campaign table had been derived or published from this helper.
- Evidence: `report-normalizer-positional-before.*` (six pass/two errors),
  `report-normalizer-positional-after.*` (eight pass),
  `report-normalizer-sequence-after.*` (nine pass), and the explicitly partial
  `report-preparation/receipt-format-snapshot/` with its source manifest.
- Diagnosis: P1/W1 retain positional input arrays and startedAt/endedAt clocks;
  the normalizer initially expected named objects and other clock spellings.
  W2b's first receipts separately recorded a short numeric step while the trace
  retained the complete step. Those rows were correctly left unjoined by the
  initial exact-step rule, rather than matched by time.
- Fix: map positional inputs using the implemented public method signatures,
  flatten Commit/unmount options, preserve clock/host aliases, and hash complete
  original payloads rather than replacing them with trace previews. For earlier
  short steps only, require a unique exact agent-folder/numeric-sequence/method
  match and label the join reconstructed. Ambiguous or inconsistent rows remain
  unjoined. Lead asked W2b to retain full traceStep in future rows.
- Verification: nine external tests passed, including ambiguous join refusal,
  full-command/change payload custody and UpToDate message handling. The changed
  tool joined all 493 traces in the frozen partial format snapshot, with zero
  missing/extra receipts. A separate parser check derived those same 493 calls
  and eight closed daemon streams; whole-run/concurrency/storage totals remained
  explicitly unavailable because the snapshot is partial. This is tooling
  validation, not another application execution or final campaign result.
- Effect on the run: reporting-only correction; original receipts remain
  unchanged. Generator copies/hashes and failed/successful checks are retained.
  No SDK, Store, app/source, freeze change or team halt.
- Follow-up: a wrapped positional `inputs.args` shape is now flattened using the
  same public signatures; the new wrapper test passed with all ten external
  normalizer tests in `report-normalizer-wrapper-after.*`. Earlier nine-test
  receipts and the partial 493-call check remain unchanged.

### T-002 — Early Commit messages and receipt inputs missed the frozen format

- Found: Build 1 lead message-custody audit and W1 final handoff.
- Evidence: `b1/agents/lead/out/commit-message-format-audit.json`, the original
  lead call receipts, W1 final NOTES and full W1 receipts/trace.
- Diagnosis: six lead fs mutations omitted the numeric sequence in their saved
  messages. Six early Bash Commit receipt inputs used the preceding Exec's
  number, while the actual immutable `result.commit.message` used the Commit's
  number. W1 separately disclosed earlier messages without numeric sequences.
  Unique trace steps and complete results still identify every operation.
- Fix: lead corrected its helper to capture the actual immutable message;
  remaining W1 review/cleanup attempts used numeric labels. No history or original
  receipt was rewritten. Reporting retains the attempted input and actual result
  separately, using the saved Commit message as authoritative for new Commits.
  UpToDate returns an older Commit and cannot supply a new invocation message.
- Verification: the lead audit lists all six plus six exact cases and IDs. The
  external receipt-normalizer tests now cover actual-message precedence, field
  provenance and the distinct UpToDate case; six tests passed in retained
  `report-normalizer-selftests-v4.*` receipts. Final campaign collection will
  audit all agents, including successors.
- Effect on the run: protocol/evidence deviation, not a LayerFS defect or lost
  mutation. No product change, fabricated message or retrospective compliance.
- Custody follow-up: lead's 124-row audit uniquely joins all 124 receipts to
  traces. Missing mutation-hash metadata at lead 33/70/90 received explicitly
  late supplements from retained constant-template/full-read/original-input
  sources, including the original NUL at 33. They are not claimed as original
  capture. Future edit guards capture all strings. W1b likewise retained late
  supplements for short edit strings that its original recorder did not hash;
  originals and source provenance remain unchanged.
- I2 follow-up: normal history reply 283 contains Commit `1221e540...` with
  message `I2 108 ...`, whose actual write receipt is 258; nearby late fs
  messages also use a different counter. This discrepancy is retained. Reporting
  joins the exact trace step and method, never the number embedded in a message.
  Closed notes and immutable history are unchanged.

### E-015 — Work review shell quoting failed before the intended Node review

- Found: Build 1 W2-104, after the original W2 Sandbox had already closed.
- Evidence: W2 calls 103–111, both original/review lifecycles, final NOTES and
  `out/source-review.json`; both review daemon streams were saved before close.
- Diagnosis: W2's nested shell quote helper over-escaped quotes. Bash exited 2;
  the intended Node source review did not run. The shell also attempted the
  exposed `import` lines as commands; their exact errors remain in stderr.
- Fix: inspect the control source and use explicit character-code shell quoting.
  Original W2-105 returned UpToDate and W2-106 unmounted. One changed review on
  a fresh mount, W2-108, exited 0; W2-109 was UpToDate and W2-110 unmounted.
- Verification: the completed review read 24 owned maintained production files
  and recorded the largest five and 22 routes. The new review Sandbox closed
  W2-111 after log capture; the original closed selected client was never reused.
- Effect on the run: retained orchestration failure and a distinct corrected
  review, no application source mutation or product/SDK repair. Actual W1/W2
  mount intervals overlap during the required reviews; the earlier final tests
  did not overlap and are not described as concurrent.

### A-006 — Full work integration exposed CLI cwd and stale browser-read failures

- Found: Build 1 lead full-work integration, lead-078, 2026-10-15 22:50 UTC.
- Evidence: full Exec receipt `lead-0078.json`, failed-outcome Commit
  `12fb7e3f5378740412458bc136f1942ee2a53bb2fa09fbb097ddeaf341164ad867`,
  terminal unmount lead-080, lead ledger and successor assignments.
- Diagnosis: clean source merges passed syntax/build, but the workspace package
  test invocation changed cwd. The work hook's relative CLI executable path then
  resolved under packages/server and failed MODULE_NOT_FOUND. The issue browser
  check separately read a stale comment-list element after a persisted mutation.
  Shared 45 passed, server 73 passed/one failed, web 25 passed/one failed, CLI
  19 passed. These counts describe that attempt, not final acceptance.
- Fix: fresh W1b/W2b owners on work.3 receive browser lifecycle/readiness and
  hook-cwd/picker follow-up respectively. The failed integration is retained and
  was not published. Repair and final verification are pending at this entry.
- Verification: failure was saved once and unmounted; no uncertain reply or
  unchanged command was replayed. Original workers' final NOTES remain verbatim.
- Effect on the run: application test integration repair. W1 also disclosed 24
  terminated but unreaped Chromium Z-state entries before container removal,
  with zero live browser/app processes. The raw `reapedExecutableZombies` key
  is misleading; the report must not claim those entries were already reaped.
- Follow-up: W2b resolved the CLI path from import.meta.url (source 128e0a27...)
  and passed both focused hooks plus the full server package. W1b's bounded
  readiness polls reacquire text elements and tolerate stale elements without
  replaying mutations. Its shared Linux child-subreaper helper bounded quit,
  TERM, KILL and waitpid to owned PID/start identities; actual issue/board flows
  and success/failure lifecycle fixtures passed four leaves. Browser descendants
  were actually reaped; two terminated esbuild PID-1 entries remained until its
  container closed and were not claimed reaped by the browser helper.
  Lead-098's clean full-work integration passed shared 45/server 74/web 38/CLI 19
  = 176 distinct leaves, then published Layer
  `326e493d6e6378b0aab57f8e1c03f869469effcb0fb6f72cb7a5c34004bd26294a`
  with empty overwrote. This closes the work integration repair, not final SPEC
  acceptance or the still-unmet 10,000 production-line requirement.

### A-005 — Browser assertion included an expected anonymous login probe

- Found: Build 1 W1-101 real Chromium issue flow.
- Evidence: full W1-101 stdout, failed Commit/unmount and W1 final NOTES.
- Diagnosis: the UI mutations and persisted checks completed, but the console
  assertion also included the expected pre-login /me 401 network entry.
- Fix: W1 scoped the console check to the authenticated workflow, retaining the
  original error and all behavior assertions. Its later real-browser proof
  passed, as recorded in W1's final focused 50-leaf handoff.
- Effect on the run: application browser-check correction; no LayerFS change.

### A-004 — Browser proof ran against a work snapshot lacking route aggregation

- Found: Build 1 W1-085 real Chromium issue flow.
- Evidence: W1-085 full result and W1 final NOTES, followed by inspected source
  and the separately identified rebuilt current wired source.
- Diagnosis: that exact tested Commit's W2 web aggregator did not yet import
  W1 issue routes; the browser could not find New issue. This was an unfinished
  shared-Branch integration snapshot, not a filesystem read failure.
- Fix: inspect the exact snapshot and build the later wired source. The original
  failure remains failed; W1's final browser proof passed after A-005 correction.
- Effect on the run: application integration progression. No source LWW rule,
  forced Commit, product fix or passing-test resampling was used.

### E-014 — Offline inventory validation initially assumed untagged ID length

- Found: root's retained-evidence inventory tooling preparation during Build 1.
- Evidence: `report-commit-inventory-validation.*`, its fresh zero-candidate
  output; corrected v2 receipt and `phase-a-commit-refs-v2/identity-check.json`.
- Diagnosis: the helper initially expected 64 hex characters total. Actual typed
  Commit IDs have the `12` domain prefix followed by a 64-character digest, for
  66 total. The zero result was caught against known retained Phase A evidence
  before any live census or completeness claim.
- Fix: use the pinned typed-ID length and fresh v2 outputs. Original output and
  reconstructed original generator bytes are retained; the reconstructed bytes
  exactly match the original provenance SHA256. Later generators archive themselves.
- Verification: corrected candidate identities exactly match all 57 SQL-verified
  Phase A Commits: 56 from complete public first-parent histories plus the one
  explicitly displaced Commit. Zero missing/extra identities. No sealed export
  file or Store was opened or modified; comparison reused verified JSON evidence.
- Effect on the run: offline reporting-tool correction, no SDK call, app/source
  mutation, product fix, Git LOC change or team halt.

### P-002 / G-001 — Binary text refusal absent from the public code catalog and guide

- Found: Build 1 root follow-up to W2-056/A-003. No blocked application operation
  remains: the Binary refusal itself is correct and isRefusal preserves it.
- Evidence: W2 trace `a740dcbf-4`; daemon sdk/window.rs binary() returns Binary
  for NUL/invalid UTF-8; sdk/js/src/errors.js CODES omits Binary while advertising
  NotText; copied fs-read guide names NotText. New external failure is retained
  at `b1/receipts/013-binary-catalog-regression-before.*`.
- Diagnosis: public refusal-code catalog and guide drifted from the daemon's
  implemented stable code. Runtime LayerFSError/isRefusal handling already accepts
  Binary. This is not a transport, data-integrity or text-reader failure.
- Fix: after all Build 1 Sandboxes closed at the P-003 halt, add Binary to CODES
  while retaining historical NotText compatibility and correct both read/edit
  guide entries. Revision 1 is archived unchanged. The existing installed Build 1
  files remain unchanged; new installed paths/clients follow the rebuild/freeze.
- Regression: external service-selection test simulates the exact observed daemon
  refusal, asserts typed Binary preservation, advertised CODES membership and one
  selected-route native call with no fallback/replay. Both JS targets prepared
  with node --check. Before correction: seven pass/one fail; the failure is exactly
  CODES membership. After correction all eight leaves pass in the retained combined
  attempt described in E-027. Syntax preparation passed for product/test/fixture;
  packaging/lazy and all three actual trace cases pass. No fallback/replay occurs.
- Verification: repository LOC/commit, native rebuild, installed identity and new
  freeze are recorded as they complete. Commit
  `e6650057906f41c47327a4b67d8cb80f6d2a6bb9`, tree
  `3e495801d73a94d43a75c502ada0d1d7653c4e52`, records Production LOC:
  87702 -> 87702 (delta 0), core 85857 and SDK 1845 unchanged. The counted staged
  tree equals the commit tree; the extra literal occupies an existing code line.
  Reference is absent (retired R9c; last counted 65,417 at tree 498dd1917812).
  Native R3 builds and packaging/dispatch with the actual new binding pass.
  Existing runtime refusal handling did not change; live binary editing was not
  executed by this catalog correction. New installed paths/freeze precede resume.
- Effect on the run: the repair uses the explicitly halted, closed-resource
  boundary. No old selected client is reused and no Store/Branch reset occurs.
- Source follow-up: fs-write guide line 72 also names NotText for binary editing,
  while daemon sdk/edit.rs lines 45/48 return Binary. Correct that guide entry at
  the same boundary. This additional guide path is source-checked; no new live
  binary-edit execution or outcome is claimed. Integrity receipt 016 confirms
  all 12 inputs, 41 SDK files and nine skill files, both repository and installed
  Build 1 copies, still exactly match revision 1 during active work.

### A-003 — Lead acceptance script contained an authored literal NUL

- Found: Build 1 W2-056, SDK fs.read of scripts/acceptance.mjs.
- Evidence: W2 trace `a740dcbf-4` returned Binary, "text contains NUL or invalid
  UTF-8"; lead byte-inspection, repair/read/syntax/closed receipts and ledger.
- Diagnosis: the lead's host template replacement inserted exactly one literal
  NUL into a JavaScript regular expression. Node syntax and process-audit tests
  accepted the expression; the SDK correctly refused to return binary as text.
- Fix: lead inspected exact bytes through a bounded Workspace Bash call,
  retained UpToDate/unmount, and wrote an ASCII hexadecimal escape in its own
  acceptance script. Original immutable source remains in history.
- Verification: repaired SDK text read succeeded; syntax and closed-mode two
  checks passed. The scoped lead-script repair published main Layer
  `32d9d477d3b63a7f6270cef0a58456aebd8b533770748bbd8283c08081d561843f`
  with empty overwrote. Full source/proof identities are in the lead call receipts.
- Effect on the run: application acceptance-tool repair, no LayerFS, SDK or skill
  change and no Git production LOC delta. The Binary refusal stays counted.

### A-002 — Concurrent issue source had a malformed string escape

- Found: Build 1 W2-048 and W1-026 syntax/build preparation on shared work.2.
- Evidence: W2 trace `90262990-2`, W1 trace `ba772bf3-2`, complete Exec replies,
  following UpToDate outcomes and successful unmounts.
- Diagnosis: W1's issue module at issues.js line 128 contained a malformed
  backslash string in source already committed to the shared Branch. W2's
  broader validation and W1's own first validation independently caught it.
- Fix: lead assigned W1 to read and repair its own source. Result/proof is
  pending at this entry; subsequent receipts own the outcome.
- Verification: both failed preparatory commands are retained with nonzero exit,
  no new Save for their UpToDate results, and explicit unmount. Work was not
  published to main in this failing state.
- Effect on the run: normal shared-Branch application development failure, not
  an SDK refusal or suspected LayerFS defect.
- Follow-up: W1 inspected the current source and replaced the malformed escaped
  LIKE construction with parameterized literal instr matching. Later preparation,
  issue HTTP tests and W1/W2 final focused proofs passed. W1's final NOTES and
  exact source/test receipts retain the repair identity; the original two
  nonzero preparation attempts remain unchanged.

### E-013 — Worker assignment concatenated executable path and version

- Found: Build 1 W1 launch on work.2, before its first SDK attempt.
- Evidence: W1's retained FileNotFoundError and final notes; lead launch/correction
  messages and ledger. The worker correctly refused the nonexistent executable.
- Diagnosis: the assignment rendered `/usr/local/bin/node22.7.0` as one path,
  rather than path `/usr/local/bin/node` and version `v22.7.0` as separate facts.
- Fix: lead supplied the exact previously verified path. Main pointed to the
  run's `HOST_NODE` field as the literal source for future assignments.
- Verification: the failing executable never started, imported the SDK or touched
  the Store. Corrected worker identity and first SDK receipts own resumption.
- Effect on the run: environment assignment typo, no product or application
  repair, Store reset, replay or repeat of passing application tests.

### E-012 — Worker control payload quoting and decoder mistakes

- Found: Build 1 P1 preparation and final diagnostic, plus W2 preparation.
- Evidence: P1 final NOTES and `out/control-syntax-failures-reconstructed.json`,
  P1 calls 075–081, W2 final handoff and lead ledger. The two original P1 host
  parse failures are explicitly reconstructed from original tool transcript
  chunks 514a9e/945601; separately captured raw host streams do not exist.
- Diagnosis: P1's two initial host m1-contract.mjs parses had unescaped nested
  SQL backticks and stopped before SDK import/call. Its final in-Workspace
  diagnostic piped base64 text into Node without a decoder and exited 1. W2
  separately reported a control quoting failure before a host command/SDK call.
- Fix: each worker inspected the exact syntax problem and constructed a changed
  control payload. No application source or LayerFS fix was required for these
  control mistakes, and no uncertain mutation was replayed.
- Verification: P1's first actual schema fs.apply committed once. P1-075's
  failed diagnostic was followed by UpToDate and successful unmount; the
  separately identified decoded diagnostic P1-079 passed, followed by UpToDate
  and unmount. Both command versions and streams remain retained. W2's final
  notes own the exact later outcome of its separate preparation correction.
- Effect on the run: retain nonzero Bash outcomes and reconstructed-stream
  limitations separately from product refusals and meaningful application tests.

### A-001 — Clean work/people merge collided with a test-only projects table

- Found: Build 1 lead work.2 generation sync proof, 2026-10-15 22:29 UTC.
- Evidence: lead calls 046–050, especially exec 048 and failed-outcome Commit
  `12f2c5065611c3ee1df68dd655c074e0f252253d735fbd97cffa0db45103a6cc14`,
  plus the lead ledger and W2 repair handoff.
- Diagnosis: the textual merge succeeded with empty conflict/LWW lists. The
  people test fixture at people.test.js lines 147/149 unconditionally created
  a projects table; W2's real migration now supplies that table. The sync
  package checks reported server 24 pass/one fail, shared 27/web 11/CLI seven
  pass. This is a test setup collision after a clean merge, not an observed
  application runtime or LayerFS defect.
- Fix: lead assigned W2 a scoped fixture adaptation that preserves all assertions.
  Repair result is pending at this entry; subsequent receipts own the outcome.
- Verification: failed Bash exit 1 was retained, committed and unmounted. The
  work generation was not published to main in this failing state.
- Effect on the run: bounded application integration repair; no product fix,
  Store reset or unchanged-operation replay.
- Follow-up: W2 source fs.apply `ef921894-2` committed
  `12361bbf81ab647494bf8689357ff83b4e3b376a227269e1cc5857d71ff1fbd1df`.
  The fixture now creates projects through the real API with 201 assertions;
  all guest, private-project, stale-grant and scoped-token denials remain.
  Build/syntax and the affected 18/18 tests passed in W2-032 (`ef921894-4`),
  saved by W2-033 Commit
  `128a3ee2a891f36c3a263d9fe196089edc4a25c8d41ebc7ad786c4acc0b96f6c62`
  and terminally unmounted by W2-034. This is an application test repair, so
  it contributes no Git product LOC change.

### E-011 — Environment helper patch contained unrelated stale context

- Found: Build 1 root environment correction preparation, after E-010 diagnosis.
- Evidence: original apply_patch tool return, copied with an explicitly
  reconstructed envelope into `b1/host-selection-patch-context-failure.txt`.
- Diagnosis: a combined patch contained an unrelated, mismatched BUGS.md context
  line. The patch tool rejected the entire operation before any file change.
- Fix: bounded inspection confirmed neither proposed helper field existed;
  a separately identified patch used the actual intended context only.
- Verification: corrected helper py_compile passed; no SDK, Store, product or
  application operation occurred during either patch operation.
- Effect on the run: retained root tooling correction, no team halt or replay.

### E-010 — Host PATH selected nvm Node 24 instead of the recorded Node 22

- Found: Build 1 P1 identity check and lead BLOCKER, after Init and L0.
- Evidence: `b1/receipts/005-observe-l0.stderr`, `010-host-node-resolution.*`,
  `011-host-node22-addon-load.*`, lead `out/host-node-identity.json`, agent
  pause/resume messages and ledgers.
- Diagnosis: plain host `node` resolves through the inherited nvm PATH to
  `/Users/yifanxu/.nvm/versions/node/v24.21.0/bin/node`. The separately installed
  `/usr/local/bin/node` is exactly the frozen host version 22.7.0. The container
  application runtime remains the pinned 22.23.1. This changes no product bytes.
- Fix: use explicit `/usr/local/bin/node` for all subsequent host SDK/control
  invocations and supply that exact environment setting to later workers/runs.
  Preserve the original frozen inputs; their recorded host version is available
  and correct. Keep the successful earlier work with its actual mixed-host
  deviation rather than relabeling or rerunning it.
- Regression: bounded identity checks distinguish both executable versions and
  hashes. Under 22.7.0, the installed frozen native addon loads and an SDK client
  constructs lazily with zero SDK calls.
- Verification: host 22.7.0 executable SHA256 is
  `4222953ad8f6cf838a4d3f92b4d6ffabb6345e59a58e275682b19530afbf70a1`,
  116,580,368 bytes. Lead and P1 paused with no mounts/processes; main authorized
  resume on the same Store, Branches and open Sandboxes after the check passed.
- Effect on the run: retained environment identity pause; no product repair,
  application change, rebuild, new freeze or Store reset. Earlier SDK invocations
  used unqualified node; 24.21.0 is witnessed by retained probes and failure
  stacks, but exact per-call host versions were not captured and cannot be
  assigned retrospectively. Preserve that uncertainty. No benchmark claim.

### E-009 — Observer preparation omitted its host output parent

- Found: Build 1 root observer checkpoint preparation, after Init.
- Evidence: `b1/receipts/005-observe-l0.*`.
- Diagnosis: host mkdir of observations/l0 required observations to exist. The
  script failed before loading the SDK or attempting any LayerFS call.
- Fix: create the owned parent recursively, then exclusively create the fresh
  output directory. Use a separately identified invocation after inspecting the
  retained failure. No product or application change.
- Regression: checkpoint response files and trace establish the later outcome.
- Verification: no original LayerFS call was attempted; the failed output reports
  actual host Node 24.21.0. Runtime Node remains the pinned 22.23.1.
- Effect on the run: host evidence preparation failure, no Store mutation.

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
