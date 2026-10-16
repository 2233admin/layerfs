# Defects and deviations — #340

> **Status:** Dated planning checkpoint; not release evidence or a product contract.

Current diagnostic defect and deviation ledger; campaign in progress.

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

### E-086 — Ended r2 bootstrap used alarm bounds and one Commit omitted sequence

- Found: B2-r2 lead's terminal NOTES, retained verbatim with its source hash.
- Evidence: the report discloses initial assignment reads bounded by explicit
  `signal.alarm(110)` instead of the later-learned supplied wall runner, and the
  first dependency-install Commit message omitted its sequence number.
- Disposition: preserve both process deviations. These were not unbounded commands
  or missing SDK results. Subsequent r2 calls used wall.py and complete messages;
  no operation is replayed to change historical procedure compliance.
- Forward environment support: fresh r3 lead requested the absolute wall-runner
  path before its first shell read. Root supplied the current RUN's runner/env/Node
  paths only, with no earlier-run facts or application input.
- Effect: ended-attempt orchestration metadata; no product/SDK/skill change and no
  final-acceptance credit for r2. Exact agent spawn clocks remain unavailable.

### E-085 — L0 tools census recorded literal current identity fields

- Found: independent B2-r3 lead tools integration, disclosed with publication036.
- Evidence: retained install census stdout and exact mount/Exec/Commit receipts
  lead0032/0033/0034. The output's Workspace and trace fields were literal
  `current`; the actual caller receipts retain concrete identities.
- Diagnosis: lead-owned census metadata injection did not substitute current
  values. No install failure or missing SDK result was reported.
- Correction: lead retains original output and records a separately labeled
  receipt-derived join; future automatic metadata injection is corrected by the
  lead. No historical field is overwritten and no install is resampled.
- Effect: application evidence bookkeeping only. Product, SDK, skill, native
  artifacts and frozen inputs remain unchanged; independent B2-r3 continues.

### E-084 — First timeline conflated Sandbox creation caller with custodian

- Found: root visual review of the first rendered B1 timeline before report use.
- Evidence: `b1-spans.csv` attributes Sandbox spans to the creation caller, often
  lead. The original SVG, generator, source sidecar and PNG remain unchanged.
- Diagnosis: plotting those spans on per-actor rows could imply ownership that
  the selected column did not prove. The CSV analysis itself was unchanged.
- Correction: a new SVG revision2 plots each agent's exact first-call/last-reply
  observation window in gray, Workspace intervals in orange and Exec API spans
  in blue by caller. Sandbox spans remain provenance-only. The original has an
  explicit SUPERSEDED-before-report-use disposition, with no inferred reassignment.
- Verification: changed render and visual inspection passed; exact source-interval
  multiset27windows/350Workspaces/349Execs, nine sources/old artifacts unchanged,
  exact tooltip boundaries and no synthetic minimum durations. The source still
  records31 Sandbox spans but does not plot them in actor rows.
- Effect: report presentation only. Observation windows include idle time and do
  not establish active-agent or process lifetimes. No RUN, SDK, app or Git mutation.

### E-083 — Bundled plotting runtime lacks Matplotlib

- Found: root B1 report timeline rendering, bounded plot receipt r1.
- Evidence: `report-preparation/b1-resource-timeline-plot-r1.*` returned
  ModuleNotFoundError at import before any chart output. Original source retained.
- Correction: inspect installed capabilities, then use existing Pillow and native
  SVG drawing with the installed ReportLab Vera font. No dependency was installed
  and no third-party package was edited. Distinct changed render r2 succeeded.
- Verification: retained PNG was inspected; E-084 then refined attribution in a
  new chart rather than changing source CSVs or old artifacts.
- Effect: host report rendering only; no product, SDK, skill or active-run change.

### E-082 — Terminal verifier treated prepared empty directories as worker files

- Found: host-only B2-r2 closure analysis, helper receipt007.
- Evidence: `b2-r2-evidence/007-terminal-custody.*`, original verifier snapshot
  and diagnosis008, then distinct corrected receipt009. Original failure retained.
- Diagnosis: the assertion rejected the prepared out/scripts/daemon/work directory
  structure for unspawned roles, instead of testing whether files existed there.
- Correction: inspect actual files under those prepared directories. No actor was
  spawned and no SDK/application operation ran as part of either check.
- Verification: corrected terminal custody passed61 exact full-result joins,
  three closes, three mount/unmount cycles and65 unchanged deployed pins. Final
  output verification independently rehashed336sources and21 exact table copies.
- Effect: host evidence-verifier correction only. No product/SDK/skill change,
  replay, remeasurement or change to T-006's conservative termination verdict.

### E-081 — Generic metadata research used two nonexistent source paths

- Found: root observation-tool review during B2-r2, before T-006 HALT.
- Evidence: read-only rg tool chunk `4eb4fd` returned NoSuchFile for
  `sdk/js/index.d.ts` and `core/crates/api/src`; the supplied SDK skill references
  were found. No SDK call or application work was part of the search.
- Diagnosis: root guessed type/API source paths rather than discovering them.
- Disposition: the observer optimization was not selected; the existing qualified
  census algorithm remains unchanged. Original search output is retained in the
  root transcript. No source, analysis algorithm or frozen input changed.

### T-006 — Root placed prior-attempt bookkeeping inside the next standalone run

- Found: root's own Phase D bookkeeping review during B2-r2 L0/P1 start.
- Evidence: external `b2-r2-record-start.py` constructed one combined event with
  failed-r1 archive facts and r2 start facts, then appended it to both the global
  ledger and `b2-r2/MAIN-LEDGER.md`. Later shared event writes also mentioned the
  closed-evidence index there. Original files and tool results are retained.
- Root cause: root reused a global-report event as a current-run event. The team
  was restricted to its standalone folder, but that folder then contained
  root-authored prior-run notes. This violated the promised input boundary even
  without application code. Whether the team read that ledger is separately
  requested; no actual read is asserted without evidence.
- Disposition: root immediately HALTed B2-r2. No new app edits/tests/workers;
  preserve bounded in-flight outcomes, Commit/unmount under the existing loop,
  logs before closes, then stopped export and raw archive. Full A01–A15 NOT_RUN.
  The attempt cannot qualify as independent and will not resume.
- Correction: prior-run/global reporting belongs only outside the new standalone
  folder. Its own main ledger must contain only that run's current facts. Fresh
  setup will inspect that ledger before dispatch and keep later root reporting
  separate. No application hints, source or notes transfer to the new team.
- Scope: root orchestration only; no LayerFS, SDK, skill, native artifact or frozen
  assignment change is needed. Preserve current freeze4 and closed R4 build; use
  a new Store, volume, HOME, trace, lead and all five workers for B2-r3.
- Terminal evidence: lead and P1 both explicitly report they never read the root
  MAIN ledger or prior-run material. P1 made no mutation/mount/Bash/test. Root
  retains the conservative termination; it does not assert an observed knowledge
  exposure. Both team Sandboxes and then the root observer closed after their
  two streams. The following Docker `ps -a` volume inventory was empty.

### E-080 — Public progress command misspelled the repository owner

- Found: root B2-r2 start publication, after successful Init and lead dispatch.
- Evidence: `report-preparation/public-progress-b2-r2-started-r1.*` returned a
  definite GraphQL repository-resolution failure for `Ephemeralal-AI-Lab/layerfs`.
  The request could not resolve a repository and did not create a comment.
- Diagnosis: the explicit `--repo` owner contained an extra `al`.
- Correction: use the established `Ephemeral-AI-Lab/layerfs` identity in a distinct
  changed invocation. The original request and body remain retained.
- Verification: `public-progress-b2-r2-started-correct-repository-r2.*` exited0,
  returning issue comment `6209350646`. No SDK or application work was replayed.
- Effect: host publication correction only; independent team inputs unchanged.

### E-079 — Report patch included a stale context anchor

- Found: root Phase D report preparation while fresh B2-r2 performs L0.
- Evidence: apply_patch returned `Failed to find expected lines` for the quoted
  BUGS-summary anchor in RESULTS.md. The tool applied none of that patch.
- Diagnosis: the final hunk used text from REPORT.md as context in RESULTS.md.
- Correction: remove the mismatched hunk, apply the independent current report
  updates, then add the remaining paragraphs against exact section boundaries.
- Verification: both changed patches succeeded. No SDK, application, analysis
  algorithm, frozen input or sealed RUN changed; no product test was warranted.
- Effect: host documentation preparation only; the original tool refusal remains
  in the root transcript. No uncertain operation was replayed.
- A later B2-r2-status update also rejected an atomic patch whose context omitted
  `failure and` from the actual paragraph. The exact current text was read, the
  changed minimal patch succeeded, and no file write occurred on the refusal.
- Another multi-file report patch rejected a context line wrapped after `agent
  spawn clock`. Both target files were read to verify the atomic refusal left
  them unchanged; a minimal exact-context patch then succeeded. All refusals stay
  in the root transcript and caused no SDK or application execution.

### T-005 — Unfiltered agent inventory exposed prior-run archive metadata

- Found: independent B2-r1 lead capacity inspection, disclosed by the lead before
  any P-M1 integration. Tool-wide inventory returned a completed sibling agent's
  B1 raw-archive summary, including paths/counts/checksum identities.
- Boundary assessment: lead reports no referenced file opened and no application
  code/features/implementation hints used. The owner requires absolute independence;
  root ended the attempt as FAILED independence instead of qualifying a continuation.
  Full acceptance remains NOT_RUN. All original development evidence is retained.
- Root cause: the standalone filesystem boundary did not explicitly constrain
  collaboration metadata inventory. A default tree-wide listing includes completed
  sibling summaries from earlier runs.
- Changed proof: root called `collaboration.list_agents` with
  `path_prefix: /root/b2_lead`; only the current lead/P1 subtree returned. Exact
  transcription and provenance are under external
  `b2-r1-boundary-investigation/investigation-r1.json`; the lead retains original
  trigger invocation/response provenance in its failed report.
- Correction selected: after logs-first closure/export/archive, commit a new freeze
  with generic explicit current-run subtree scoping. Fresh b2-r2 gets a new lead,
  every worker, Store, volume, HOME and trace; no failed-run application knowledge.
- Effect: team/environment boundary correction, no LayerFS/SDK/skill/native change.
  R4 binaries remain the same qualifying closed build. Failed r1 is never relabeled
  as an independent passing run.
- Final disposition: all three Sandbox lifetimes closed after both logs;
  15mounts/15terminal unmounts and145full-result joins verified. Stopped Store
  export and535-entry raw archive sealed PASS, source unchanged. Freeze4 committed
  as `d465bbfa65dcd31cc1b75464fd7464308243a6a3`; B2-r2 began with a fresh Init,
  immediate initial stats and fresh lead `/root/b2_r2_lead`. The failed source
  folder is immutable; no application data from it was supplied to the new team.

### E-078 — First B2 install census omitted its shell-scoped identities

- Found: independent B2 L0, lead reported call8.
- Evidence: the lead's retained call8 mount/Exec/Commit chain and original census;
  later call25 and lead ledger retain the changed instrumentation and lockfile.
- Diagnosis: lead reports shell variable scope left census identity fields null.
  Original count/byte data and caller receipts remain unchanged. Root did not
  inspect or direct the application implementation.
- Correction: team-owned export correction supplies identities on subsequent
  installs. Historical nulls remain null; any later caller-derived association
  must be explicitly labeled with its source, not substituted into original output.
- Effect: evidence instrumentation only, no LayerFS/SDK/skill/binary/frozen-input
  change, no independent-run restart and no SDK operation replay by root.

### E-077 — Active B2 ledger update assumed the prepared ledger was absent

- Found: root state bookkeeping after successful independent Init and initial stats.
- Evidence: `report-preparation/start-independent-b2-r1-state.*` returned
  FileExistsError at exclusive ledger creation. The prepared run already contained
  a main ledger, as observed by the changed read.
- Correction: preserve the before script and prepared ledger; replace only its
  State block and append current events while retaining Decisions and prior Events.
  Changed r2 state update passed. No SDK operation was part of this updater, and
  no original state-update write had occurred before its refusal.
- Effect: host ledger correction only; B2 remains the same independent run with
  unchanged app/product/SDK/skill/inputs. Init and stats were not replayed.

### E-076 — Archive scheduling note collided with its own receipt name

- Found: external rawarchive control after parts0–22 passed.
- Diagnosis: the scheduling-change.json data record was written successfully,
  then wall.py rejected its reused name as an append-only receipt path.
- Correction: retain the successful record and original refusal, use a fresh
  separate execution receipt stem for changed control work, then start only
  new distinct parts23 onward. No archive part failed or was replayed.
- Effect: control-only metadata issue, no source/Store/SDK/application change.
  The helper retains exact failure and scheduling provenance externally.
- Root manual scheduling-event header05:28Z was inaccurate; the exact external
  scheduling record is2026-10-16T05:25:59.907721+00:00. Original prose retained with
  a global-ledger correction; no campaign timing derives from the manual header.

### E-075 — Root CSV inspection used Python's default field-size ceiling

- Found: final B1 table inspection, after raw source freeze.
- Evidence: tool chunk `6b0f3b` returned `_csv.Error: field larger than field limit
  (131072)` while reading retained full result/detail fields. No SDK or application
  operation ran.
- Diagnosis: complete merge/refusal argument details exceed the standard library's
  default CSV field limit. The table bytes were valid and unchanged.
- Correction: the changed read-only inspector sets `csv.field_size_limit(sys.maxsize)`
  and prints only selected scalar summaries. It then read the original tables and
  confirmed350 Commit results,22 merges,9 publications and37 primary refusals.
- Effect on the run: host inspection only, no analysis algorithm/source-table edit
  and no raw B1 write after freeze. No product test or SDK operation replayed.

### E-074 — Final daemon input selector omitted a worker's relocated logs

- Found: B1 final reporting after all Sandboxes closed and Store export sealed.
- Diagnosis: I2's captured pair lives under `agents/I2/out/daemon`, while the
  selector expected `agents/I2/daemon`. All original bytes were retained. The
  first58 selected inputs therefore covered56 agent streams and two root stderr
  derivatives; they omitted the I2 pair. All three lead pairs and both W2
  Sandbox pairs were already selected.
- Fix: preserve the original input freeze and partial r1 tables. A new r2 view
  explicitly adds the original I2 stdout36B and stderr8625425B, pins exact source
  hashes, and retains the31-Sandbox/62-rawstream coverage map. Corrected60 selected
  inputs plus two root stdout provenance-only streams account for all62 captures.
- Evidence: `b1/agents/I2/out/daemon/receipt.json`, the lead's verbatim capture
  receipt, and external `b1-final-analysis-stage2/daemon-coverage-r1.json`.
  I2 stderr SHA-256 is
  `a4a0fad285fd0ccd689d5700d53ffc09d32e0c1200299f1d31a9cf4e0b138fba`.
- Verification: exact Sandbox-ID/stream mapping PASS for all31 closed lifetimes;
  corrected r2 full table generation passed with3,624fullcalls/5,109sourcefiles,
  63outputs and zero structural quality issues. No recapture, SDK call, app test,
  census or Store operation was replayed. Existing analysis algorithms unchanged.
- Effect on the run: rawarchive planning is held until corrected derivative
  outputs finish. Large full counter tables remain in raw evidence, with compact
  source-pinned summaries in Git.
- Additional resume read deviation: root guessed the global ledger under the
  control folder; tool chunk `6c5a53` returned FileNotFoundError before any SDK
  action. `rg --files` located the actual campaign and B1 ledgers, then both State
  blocks and the lead ledger were read. No source or run effect.

### E-073 — Supplemental report adapter initially expected untagged Commit digests

- Found: B1 final report preparation after all SDK execution and stopped export.
- Diagnosis: the new external exact-argument adapter expected 64 hex characters,
  while actual tagged Commit IDs have 66 characters. Initial qualification, wave1
  and wave2 derivations exited0 but quarantined all candidates. Those outputs
  remain unqualified originals and are not relabeled as successful joins.
- Fix: validate exact membership in the stopped SQL inventory. Preserve before
  code/tests and a failing actual-tagged-ref regression, then run the changed
  external adapter. Neither the existing normalizer nor analysis algorithms,
  original receipts, SDK, Store or application changed.
- Verification: five bounded external checks passed: repeated step with distinct
  refs, duplicate-full-key quarantine, missing/truncated/type rejection, optional
  field/alias mismatch, and actual tagged IDs. Fresh r2 outputs matched all six
  populations with zero unmatched/ambiguous/invalid: qualification913,
  wave1 166263, wave2 45761, wave3 24715, wave4 38514, wave5 235499; total511665.
  Every join checks actual retained argument identity; no timestamp/order guess.
- Effect on the run: source-pinned host report adapter only; no SDK operation,
  application proof or census was replayed. Exact before/final controls and
  derivation outcomes remain in the evidence helper's new stage2 artifacts.

### E-072 — Lifecycle metadata inspection omitted an explicit create record

- Found: B1 evidence helper final input preparation.
- Diagnosis: a diagnostic listed only sandbox.service and root closes, then
  incorrectly reported no revision2 observer create. The existing normalization
  already included all nine root-fix proof receipts and all3624 primary joins.
- Correction: `root-fix-proof-r3/calls/001.json` and primary trace `87a10bb5-1`
  retain the explicit sandbox.create from00:43:27.093 to00:43:28.732 UTC, returning
  the observer ID as a string. Use its actual successful-reply custody; the exact
  internal creation instant remains within that observed call interval.
- Verification: root read the original record and script; the helper accepted the
  correction without SDK replay, an invented external-open event or a source
  algorithm change. Only the original initial observer uses a first-ready boundary.
- Effect on the run: corrected reporting inspection claim, not an SDK/Store defect.

### E-071 — Final census verification tool input had invalid JavaScript quoting

- Found: root's delegated B1 metadata helper, after all census SDK work succeeded.
- Evidence: external control `b1-final-census/host-only-quoting-failure.json`,
  SHA-256 `0bc195991aad1006a78488bbb1cfb2b4182bd4fdc0a57bb5fc2aa8cbd60c7e93`,
  plus its append-only helper ledger.
- Diagnosis: embedded Markdown backticks caused the functions.exec JavaScript
  input to fail with SyntaxError before a shell process or SDK attempt existed.
- Fix and verification: correct quoting for a changed read-only inspection. All
  52 census chunks retained exit0/no timeout; the combined 562-ref summary and
  process/source checks passed. No census or summary invocation was replayed.
- Effect on the run: host orchestration only. The helper returned the still-open,
  unmounted observer to root and finished with no SDK process/session remaining.

### E-070 — Evidence preparation assumed receipt container and roster-name shapes

- Found: root's B1 evidence helper during read-only preparation.
- Evidence: external control `b1-final-analysis/host-failures-r1.json` retains
  later exact transcriptions of original tool chunks `17991a` and `24c428`.
- Diagnosis: the first metadata read sliced `cycles` as a list, but that artifact
  stores a keyed object. Roster preparation then used `P1c` before normalizing
  the original `P1c-HALT-NOTES` spelling. Both raised KeyError before any SDK or
  application call. Original reported boundary fields remain unchanged.
- Fix and verification: inspect actual field types and iterate cycles.items();
  retain original names while deriving the canonical first basename token.
  Independent lead custody then passed all 567 joins and 78 terminal mount cycles.
  Roster preparation retains unavailable exact spawn clocks as null.
- Additional root read error: tool chunk `45a491` guessed helper `LEDGER.md`;
  FileNotFoundError occurred before any SDK action. The actual control ledger
  is `b1-final-analysis/LEDGER.json`. No alias or original evidence was changed.
- Later preparation failures: original chunks `436b2f` and `df09cb` retain
  SyntaxError from a dense `__name__for` comprehension token. Both failed before
  any file read or mutation. A readable multiline schema preview then passed.
  Exact transcriptions are in `b1-final-analysis/host-failures-r2.json` (SHA-256
  `6bdba2331fef7ca98853fac90c0ede04e9b8dd180f0ccdb4caa4bc78afbf1a1a`).
- Effect on the run: host report preparation only, no product, Store, SDK,
  application, frozen-input or acceptance proof change/replay.

### E-069 — Final report metadata lookup assumed an error at a guessed sequence

- Found: B1 lead final host-only report assembly after its terminal close.
- Evidence: `b1/agents/lead/out/final-metadata-host-keyerror.json`, original
  tool chunk `dcefd3`; later exact transcription retains the known traceback.
  Separate original host stream files are unavailable.
- Diagnosis: a loop assumed lead 48/78 had an `error` field. The actual first
  selected receipt was a result, so Python raised `KeyError: error`.
- Fix and verification: filter the retained receipts by their actual error code
  and retain the actual sequence. The final report and refusal table include
  the original early P1 refusal. No SDK or application operation was replayed.
- Effect on the run: reporting-only failure after logs-first close; source,
  frozen inputs, Store history, test outcomes and terminal client stay unchanged.

### E-068 — Root evidence-helper assignment abbreviated the Python wall invocation

- Found: initial read-only preparation by root's B1 evidence helper.
- Diagnosis: the assignment showed the wall helper path without the explicit
  `python3` prefix. Direct execution returned permission denied because that file
  is not executable. The rejected calls read no evidence and made no SDK call.
- Fix: explicitly use `python3 CONTROL/wall.py --seconds LIMIT -- COMMAND`.
  The root corrected its assignment and the helper retains original tool failure
  identities in its own control ledger. Later reads use the corrected wrapper.
- Effect on the run: root orchestration deviation; no application, product, SDK,
  Store or frozen-input change. Exact helper preparation ledger remains separate
  from the five natural application roles.

### E-067 — Independent acceptance verifier checked the unwrapped command field

- Found: root verification of the fully passing fresh B1 acceptance run.
- Evidence: `report-preparation/acceptance-b1-r3-root-r1.*` and preserved verifier
  `verify-b1-fresh-acceptance-before-shell-field-r1.py` outside the repository.
- Diagnosis: the verifier looked for the inner timeout in `inputs.command`,
  which records the unwrapped script. Exact `inputs.shellCommand` and positional
  `inputs.actualArguments[2]` both retain the real `timeout 110 bash -c` command.
  The assertion failed before any evidence output or SDK/application call.
- Fix: compare the actual shell command and exact positional SDK argument, then
  run the changed read-only verifier against the already retained full streams.
  No application proof, failed SDK call or acceptance step is replayed.
- Verification: changed r2 passed all 15 gates, 716 unique package leaves and
  10,037 frozen production lines; annotation SHA-256
  `c5e411c7334e7abbb780b05936d0cc3bd7be034e1d65173aec163de7527f0186`.
  A source search also
  named an absent `scripts/call.mjs`; that read returned NoSuchFile and produced
  no SDK effect. Existing acceptance-step source was read successfully.

### E-066 — Qualification verifier expected an absent assertion-summary field

- Found: B1 lead host qualification of the four repaired Insight scripts.
- Evidence: `b1/agents/lead/out/r7-qualification-host-schema-failure.json`,
  original tool chunk `2e4c77`, and the subsequent qualified r7 artifact.
- Diagnosis: the read-only host verifier indexed
  `assertionPreservation.missingOriginalAssertions`, but the retained focused
  artifact used a different schema. It raised `KeyError` before SDK import or
  application mutation. The failure record is a later exact transcription;
  separate original host stdout/stderr files are unavailable.
- Fix and verification: inspect the actual retained schema, correct the host
  field access and verify the existing source/assertion evidence. The changed
  verifier qualified r7 at 10,037 production lines and 716 applicable package
  leaves. No application proof or SDK operation was replayed.
- Effect on the run: retained reporting-tool failure; no product, SDK, skill,
  frozen input, application source, test assertion or timeout changed.

### E-065 — Report adapter ignored the nested actualArguments wrapper

- Found: root's first W1f closure verification failed with `KeyError: path` while
  processing unmount 032. W1f's complete named `inputs` wrapper stores positional
  public SDK arguments under `actualArguments`. The normalizer handled the existing
  nested `args` wrapper but returned this newer wrapper without flattening it.
  All raw receipts, lifecycle replies and original daemon streams remained intact.
- Regression: before correction, the new external test failed because normalized
  command hashing used a 17-byte trace preview rather than the retained 74-byte
  complete command. It also requires original labels/results, no duplicate raw
  argument array in table args, and preserved unmount/Commit options. Before sources,
  the external regression and failed receipts are retained under
  `report-preparation/normalizer-actual-arguments-before-*`.
- Correction/verification: recognize the explicit additional `actualArguments`
  list through the same public positional signatures, retaining wrapper metadata.
  Bytecode preparation and final `normalizer-covering-014` passed all 13 tests.
  Final normalizer SHA-256:
  `ec4be36136796936f3fb8e99517dc0109ba171dcf00427b6fc27c589c4deb3c3`;
  tests SHA-256 `dbfc6ffabbc9711b4dac5cd72efcb46448b4f7b56d80b472b5e7d979ed2e9cf1`.
  Final sources are preserved separately. No final campaign tables had been made
  with the incomplete adapter; no product, SDK, skill or application changed.
- Changed closure verification passed: W1f notes 12,169 bytes and all 11 metadata
  copies match, one mount/Exec/UpToDate/unmount cycle completed, no mutating file/
  Branch/project methods occurred, resources are zero, both streams match capture
  before close 034 at 04:09:22.486Z, and no non-close SDK followed capture. Root
  annotation `report-annotations/closed-w1f-custody-r2.json`, 3,602 bytes, SHA-256
  `feee137c41cc7e9c750a8f2bf93f2401a1e96617e9f3fa2db9b77e819a8ccf58`.
  The failed first verification remains retained; no SDK/application replay occurred.

### E-064 — Extended browser caller lagged the current sprint review controls

- Found: I2g changed witness 049 passed the 401/403/404 editor/title absence
  assertions with both issue resources denied, then failed a later ten-second
  `Save sprint` button wait at the old script's line 231. Failed Commit 050
  `12812b29f63a2dcaf3e7dc5ba43d3221ad1f2be1692bd8b8e251b20f032cc99819`
  and unmount 051 are retained, with complete untruncated streams and cleanup zero.
- Source diagnosis: reads 053/054/056/059/060/061 identify the current SprintForm's
  mandatory concurrent-review step before Save. The later old `Add selected issues`
  selector is a heading; its current flow uses Review changes, Sprint plan review
  and Confirm sprint add. This latter mismatch was found from source, not a second
  witnessed runtime failure. No W2 application repair is justified.
- Changed caller/proof: I2g retained the original actions' intent and all assertions
  while using the current mandatory merge and scoped review/confirmation actions.
  Changed 068 passed the actual extended Insight callback, all ten original browser
  check names/order and all 36 original Python assertions; four attribution
  assertions bring the final count to 40. Commit 069
  `12fd4c83279190b890e3f8309ec1625d9645151c6d86fbc1525666fd5a75a87a39`
  and unmount 070 followed. Native output is untruncated, server exit zero and own/
  global browser/process counts zero, as reported in retained owner evidence.
- Scope: the targeted wrapper explicitly did not run three unrelated callbacks.
  One passing callback is not full A12 acceptance or ten additional package leaves.
  Original 049 remains failed. Final source/diff/counter/custody, new publication
  and full fresh-main A01–A15 remain pending.

### E-063 — Work diagnostic lookup named an absent test path

- Found: W1f 016 during the A-030 source investigation. A guessed resource-state
  test path returned definite `NoSuchPath` with no effect. The full original
  `agents/W1f/out/calls/W1f-016.json` remains retained.
- Handling: the owner inspected the parent directory and used the actual source
  inventory for subsequent discovery. The absent-path operation was not replayed.
  No application repair, product defect or test success is inferred from this lookup.
- Additional lookup: I2g 009 guessed a hooks folder and received the same definite
  `NoSuchPath` refusal. It retained the original reply and followed the actual
  component import for discovery. This second read-only miss also caused no effect
  or failed-operation replay; both refusals remain part of the SDK collection.

### A-030 — Extended Insight browser acceptance failed a post-denial assertion

- Found: repaired fresh `acceptance-b1-r2`, after A01–A11 passed. A12 at 489
  returned 16 passing and one failed check out of 17. Baseline browser login,
  native board drag, search, inbox and the People/Work checks passed. The failed
  check is `insight actual browser charts live refresh named activity and mapped
  import`. Failed Commit 490
  `12a527b458692ca465e180f2cdd21a9f1a6e7da6db851131daca9780445bc60eac`
  and unmount 491 are retained. A13–A15 did not run on this failed Branch.
- Evidence: complete stdout 43,211 bytes, SHA-256
  `dea1b419c9609c44b87de2ca279569c4350f8118867930730f5d19299a3e349e`;
  stderr 53,998 bytes, SHA-256
  `876e426d579ff01ccd9defb8f4208419b648b6dbbf690af9b1347a59e8b140ce`.
  Native exit 1/untruncated. Root independently verified both compressed streams.
  Stdout contains four complete JSON values: three browser diagnostics followed
  by the final 16/17 failed browser-mode result. It is not a missing-output case.
- Source boundary: complete read 492 reaches `scripts/insight-browser.py` 161–162:
  after the injected access-denial error appears, the fixture immediately asserts
  that the Edit issue form is absent. The actual traceback points to that assertion.
  Cause remains unclassified pending fresh source/state diagnosis; neither an
  application failure nor a fixture race is inferred from this boundary alone.
  The lead reports owned/global browser cleanup zero in the retained diagnostics.
- Follow-up: fresh Insight acceptance-browser ownership for diagnosis and changed
  proof; any actual Work production issue remains Work-owned. Preserve this failed
  Branch and all later unrun steps. A repaired source requires qualification, new
  final-main publication and new full fresh acceptance. No replay, limit change or
  product/SDK change is claimed.
- Later targeted diagnosis: I2g's private instrumented witness 028 failed the
  original assertion on its 401 iteration, followed by failed Commit 029/unmount
  030 and cleanup zero. Atomic DOM plus network attribution identified the
  one-shot same-URI fault in Dependency Explorer's focus request (generation 21,
  401), while the main issue resource's separate request (generation 23) returned
  200. Its error belonged to Dependency Explorer and its reload control; the main
  editor's resource had succeeded. W1f source 023–025 corroborates independent
  resources for that path and disproves its earlier later-refresh hypothesis.
  No Work production repair is justified by this evidence.
- Attribution limit: the original 489 denial iteration is unavailable. The 401
  attribution is this new instrumented witness, not a reconstruction of the
  original browser state. Both original 489 and targeted 028 remain failed. The
  22,356-byte witness summary and full 028 receipt were copied with hashes in
  `agents/lead/out/I2g-to-W1f-denial-witness-custody.json`.
- Changed fixture decision: Insight owns a persistent exact-path denial during
  the required 401/403/404 assertions, then an explicit reset for recovery. Original
  actions, assertions, bounds and 503 retention semantics remain required. Changed
  proof and new full fresh-main acceptance are pending.
- Later qualification: changed 049 passed the required denial assertions before
  failing separately at a stale sprint caller (E-064). Changed 068 then passed the
  actual extended Insight callback with the current UI actions. This is targeted
  proof; original acceptance 489 remains failed and its denial iteration remains
  unavailable. No production Work source changed.

### T-004 — Successor assignment omitted frozen JSON/counter contents from its read list

- Found: I2f's narrow smoke-fixture follow-up. The lead supplied complete frozen
  files and settings, but its prose read list singled out Markdown plus ENVIRONMENT
  and named nonexistent `FREEZE.md`. I2f read the full prose/settings and SDK
  references before SDK 001, but first read `FREEZE.json`, `count-loc.mjs` and
  `count-loc.test.mjs` contents at 2026-10-16T03:47:09.249368+00:00, after SDK 030
  and before terminal 031. No retrospective prerequisite-compliance claim is made.
- Evidence: `agents/I2f/out/late-frozen-counter-read.json`, 694 bytes, SHA-256
  `8470fb37e1676fec2019332419b51efc070aa898534978ca8aeebc6a84ab5cd2`,
  pins all three unchanged copies and their actual first-read boundary. The root
  independently checked it alongside the original focused and inherited-data proof.
- Effect: assignment/read-order deviation, owned by the lead. Frozen inputs and
  counter were unchanged; no production feature was added and no passing proof was
  replayed to manufacture an earlier read. Final handoff and report retain the
  timing and original assignment. This does not establish earlier full read coverage.

### E-062 — Root metadata inspection assumed a named input object

- Found: read-only inspection of I2f 013/019/020/021. Receipt 013 stores its complete
  positional SDK arguments in `inputs` as a list. The ad hoc inspector printed that
  list while labeling it as keys, then called `.get` and failed with AttributeError.
  The large printed test source also exceeded the tool's preview budget. The original
  full SDK receipt is unchanged; separately retained complete host stdout/stderr from
  this failed inspection are unavailable. The retained tool result is chunk `4569a5`.
- Correction: use the existing tested `normalize_receipts.named_args` reader and
  print only operation/path/hash metadata. The changed read-only inspection passed,
  including original 013 source identity, focused 019 output hashes and successful
  020 Commit/021 unmount. No SDK, application command or source change was replayed;
  this did not affect the successor's proof or original acceptance failure.
- Later read-only inspection also failed before execution because a compact
  dictionary comprehension omitted the space before `for` (`SyntaxError`, tool
  `ff3294`). The corrected metadata read passed. A separate NOTES display exceeded
  its preview budget (`306c35`); the original complete 12,369-byte notes and lead
  copy were subsequently hash-verified in `closed-i2f-custody-r1.json`. These host
  display/inspection errors caused no SDK or application operation.
- Another root read-only decoder treated A12 stdout as a single JSON value and
  failed with Extra data (`7e7b08`) after verifying its stdout hash, before stderr
  verification. The changed sequential JSON decoder identified all four complete
  values and verified both stream hashes (`ebe907`). Original SDK streams remain
  complete and unchanged; no application or SDK operation was repeated.
- The first I2g root closure verifier selected a guessed `daemon-capture.json`
  filename and stopped before log verification (`385d58`). The retained custody
  list names the actual `daemon/capture.json`; the changed verifier explicitly
  checks that source against the custody record. Its separate second verification
  passed, including all 23 metadata copies, nine complete cycles, both streams
  before close and zero resources. Annotation `closed-i2g-custody-r2.json`, 3,858
  bytes, SHA-256 `2d9f68f6b50a78e37775bf92b6cb9d7f26780288ae4c9fec0d023262a21cce24`.
  The initial verifier source/failure remain retained; no SDK/app replay occurred.

### E-061 — Fresh smoke fixture reused an existing export filename

- Found: first fresh final-main acceptance `acceptance-b1-r1`. A01–A09 passed;
  A10 at 431 failed one of 35 smoke checks. The real CLI returned EEXIST when the
  fixture attempted to export to `/workspaces/32/data/insight-project.json`,
  preserving that existing file. The other 34 checks passed. A11–A15 did not run
  on this permanently failed Branch.
- Evidence: complete stdout 3,217 bytes, SHA-256
  `0108a152b1e8a4e9a8719824a5b6325b4b674d012592dfe68100088ac5f8e646`;
  stderr empty, native exit 1/untruncated. Failed Commit 432
  `122757bfe64b9c8f0c623f027d77a31f586f52be67c39c932fef8b725980724dd0`
  and unmount 433 are retained. Read 434 confirms the fixture's static reusable
  filename in `scripts/checks/insight.mjs`; a failed domain export implementation
  is not inferred from its refusal to overwrite a file.
- Root independent annotation:
  `report-annotations/acceptance-b1-r1-smoke-failure-root-r1.json`, 6,505 bytes,
  SHA-256 `898e91adefdfff7f7e71d49d705e122067a807e1221d460262309fbaf0aa2e7c`.
  It pins the full streams, all 35 checks, exact source read and lifecycle replies.
- Follow-up: lead selected fresh Insight ownership for source/state diagnosis,
  an explicit fixture correction and narrow changed proof. Any repaired candidate
  must be integrated and published before an entirely new final-main acceptance
  Branch. Changed proof is pending; no failed-step replay, overwrite-policy change,
  product/SDK change or acceptance completion is claimed.
- Later qualification: I2f source 013
  `12ba809ef4964dd8206fc4d3f597b5818802071b93171957d17d21ff74a484a78d`
  changes the fixture to a scenario-owned temporary export directory and adds an
  external real-smoke regression. It retains the actual CLI export/import-preview
  assertions, preserves unrelated files and cleans only its own temporary directory.
  Canonical export writer and acceptance entry point compare Equal in 029/030;
  production LOC delta zero. Preparation/build 015 passed. Focused 019 passed one
  test, including an actual child smoke 35/35, sentinel byte preservation and own
  process/directory cleanup. Changed inherited-data smoke 023 also passed 35/35;
  024 Commit/025 unmount followed. Original lead 431 remains failed.
- Root exact witness verification:
  `report-annotations/i2f-changed-smoke-root-r1.json`, 11,370 bytes, SHA-256
  `30cb636d42ef7e6bad3b0e97ae2305aa964c529d03b68a70d5f82c3fc18cb0d0`.
  The TAP diagnostic's backslash inverse re-encodes exactly to the original marker,
  matches the saved child evidence and parses the complete 35-check result. Focused
  stdout 3,537 bytes, SHA-256
  `957548ce500dc8bf586fafabf99a5911ce8b27dc9bb8af34f1ca61c7b909e406`;
  changed smoke stdout 2,598 bytes, SHA-256
  `c1eddc15f2bba94e6dae759d16d18001da037741c1b3cee3d9e9c12d35f993cd`.
  Both stderr streams are empty and native output is untruncated. Terminal 032
  closed checks passed; both daemon streams precede close 036 at 03:48:46.550Z.
  Fresh new-main acceptance is still required; T-004 records the late input reads.

### E-060 — Host acceptance guard rejected the tagged Layer identifier before SDK access

- Found: before the first actual fresh acceptance fork. The host guard assumed a
  64-character total identifier; the actual identifier is tag `32` plus a 64-hex
  digest. It rejected the published Layer before `branch.fork`. The lead then
  unnecessarily invoked dependent A01, which refused its missing manifest before
  any SDK call or mount. No acceptance operation had run.
- Evidence/provenance: `agents/lead/out/acceptance-host-guard-failures.json` retains
  the exact commands, state sequence 392 and diagnosis as an explicit later
  transcription. Conversation tool outputs are retained; separately exported
  original host streams are unavailable. This is not reconstructed runtime success.
- Correction: the guard now checks the actual 66-character tagged identifier;
  syntax preparation passed. Actual fork 393 created `acceptance-b1-r1` from final
  main `32b8aa89c4b23b6eab05cff39c93443b225f0a259d7478fef3b2f1316867803fa5`.
  Fresh A01–A06 subsequently passed. There was no SDK replay, product change or
  acceptance credit for either rejected host invocation.

### E-059 — New CLI fixtures assumed root cwd under an npm workspace command

- Found: affected integration 381 passed web 153/153 but CLI had 63 passes and
  four failures out of 67, all four new L0 configuration tests. Complete stdout
  385,839 bytes, SHA-256
  `4258d62045457ba4a518f5b7739af42cf5fa2760029d12b3c1b7618ba32a3485`;
  stderr 272 bytes, SHA-256
  `78d609044c64020df835ea1395314c78379581825995a5fa12844e109c449579`.
  Native output was untruncated. Failed Commit 382
  `12bd0940283a601d1da4e9cd5f77724c488d2465c822dd14d368e6fc6b4e9e5656`
  and unmount 383 are retained; later chained checks did not run.
- Source diagnosis: complete read 384 confirms a relative
  `node_modules/.bin/crew` spawn. The earlier focused selection ran from the root;
  npm's workspace command runs from `packages/cli`, where that relative path fails
  with ENOENT. No application configuration behavior was exercised by those failures.
- Changed source: test-only 385
  `129607d00c0a0003c085aa98a54e67a82a30998efc40868f12517d47f3db5b89aa`
  resolves the real installed executable relative to the fixture's module URL.
  The actual executable, assertions, network trap and all command bounds remain.
  Production LOC delta zero.
- Verification: changed 389 passed full CLI 67/67, the unchanged frozen counter
  at 10,037, complete source/configuration inventory and three terminal closed
  checks with total/live/zombie/processes zero. Stdout 133,880 bytes, SHA-256
  `851df0dfaa9f9b38876ce2b26fa6a84ca1bbae4ba68e25a1949f6d4f6bf1ae1e`;
  stderr empty; native untruncated. Commit 390
  `123637d50be8c59dcbf5bc48d547cfca7ec7929754873e10da01b7a5f4e406fe22`
  and unmount 391 followed. Root independently reconstructed both test-only
  edits from full source/SDK inputs and compared every production/configuration
  hash. The applicable disjoint package selections provide 715 unique passing
  leaves; original failed whole invocations remain failed.
- Publication 392 added the qualified final main Layer with an empty `overwrote`
  list. Fresh final-main acceptance remains separate. Root annotation
  `report-annotations/final-integration-qualification-root-r1.json`, 7,874 bytes,
  SHA-256 `78bfbfbed825b795323756652a175362bb900b0446f827300e8f187b16ba33c2`,
  pins complete proofs, original and reconstructed source identities and publication.

### E-058 — One browser leaf asserted global cleanup while sibling fixtures ran

- Found: third final integration 369, after the repaired planning, audit and search
  cases passed. Shared 127 and server 369 reported nodes passed; web had 152 passes
  and one failure out of 153, with no cancellations, skips or todos. CLI and later
  chained checks did not run. Failed Commit 370
  `1234ad9b8276c39baa2a89b87f93f37765a82f6095d83998195a5ac1e677c5a106`
  and unmount 371 are retained; main was not published.
- Complete streams: stdout 558,333 bytes, SHA-256
  `f318cddc4a26ed11f601685dd158fd2c659bd4f69498aa28dd20e3f535b98024`;
  stderr 272 bytes, SHA-256
  `a4fa168485e6368e2cf1aed0ff8e52394b8d8c8625aae7388ca99200a964c5ee`.
  Root independently verified both gzip payloads and native `truncated:false`.
- Source diagnosis: read 372 shows the saved-filter collaboration test requiring
  both its owned browser count and the global browser count to equal zero at the
  end of one leaf. The retained assertion observed `[0,12]` against `[0,0]` while
  sibling fixtures ran. Its browser evidence records owned total/live/zombie zero
  and lifecycle `ok:true`. This is not evidence that all command-level resources
  were closed, nor is the sibling count an owned leak.
- Follow-up: lead owns a test-only assertion correction requiring complete owned
  cleanup while retaining global cleanup at the whole-command boundary. Changed
  proof and publication remain pending. No application, timeout, concurrency,
  workload or production LOC change is authorized by this diagnosis.
- Verification custody: root read-only annotation
  `report-annotations/lead-363-369-browser-verification-r1.json`, 8,043 bytes,
  SHA-256 `816bb14a71c9126bad77957c1e57785b3e2c48d36ffdebcad2f0769bcddc6920`.
- Later qualification: test-only edit 377 requires owned total/live/zombie zero
  and an empty owned process list. Affected 381 passed all 153 web leaves, but the
  whole invocation failed separately in CLI (E-059). Root reconstructed the exact
  edit and matched its final file hash. Whole-command closed checks passed in
  389, then final main was published in 392; fresh acceptance is still separate.

### E-057 — Search browser read the saved-filter form before it was ready

- Found: second final integration 352, the other failed web case alongside
  E-056. Original complete streams, failed Commit 353 and unmount 354 remain
  recorded there. The original search failure section is retained verbatim at
  `agents/lead/out/search-352-original-failure-section.txt`.
- Diagnosis: source read 360 links `browser-search.py` line 63 to an immediate
  `filter-name` element lookup after the Edit action, before the selected filter's
  editable form had become ready. No failed domain operation is inferred.
- Changed source: test-only Commit 361
  `12d9b1ab1b0587c932775777cf2ce340016b3386e26107139ad56013ff253f640c`
  waits for the actual selected editable filter name and Update control before
  the same actions/assertions. This also contains E-056's atomic detail read.
  Python syntax preparation passed; production delta zero.
- Verification: changed proof 363 passed both browser leaves, no failed,
  cancelled, skipped or todo tests, then all three terminal closed checks passed
  with total/live/zombie/processes zero. Complete stdout 32,873 bytes, SHA-256
  `5377852c68077768b4cb4e851081f501d022d8ade2c950ce76ec8e7c825cea5d`;
  stderr empty; native `truncated:false`. Commit 364
  `12f4bb4958eb1519fa29882fe0c583dcdf8a7a4e1761a638f996d15570c49e82ac`
  and unmount 365 followed. Root independently verified the retained receipt;
  the original integration remains failed and fresh acceptance remains pending.

### E-056 — Audit fixture read an element attribute after current denial removed it

- Found: second final integration 352 failed web 151 pass/two failures out of 153,
  after shared 127 and server 369 reported passing nodes. CLI and later chained
  counter/inventory/closed checks did not run. Failed Commit 353
  `126e75c53b925a42fbcb9c54fd45267682f478eccbea6177987b98080d97dc597f`
  and unmount 354 are retained; there was no publication.
- Complete streams: stdout 609,152 bytes, SHA-256
  `d957cdbe88d6d33f30497e41ea4a19ee13db5d7665a9ac88ab34dabdd9766fc1`;
  stderr 272 bytes, SHA-256
  `b01d0462196e9ceebd3244881eefd5438d6bfc57303f77cfb450bedba9818fe0`.
  Root independently verified both gzip payloads and the native `truncated:false`.
- Audit diagnosis: `out/audit-352-artifact-VERBATIM.json`, 156,272 bytes, SHA-256
  `9e9151731e466b139773cae3a454772c895e52c51222aecf9d39034f001b4179`.
  Its extracted traceback reaches the fixture's `detail_id()` line 12: a remote
  element lookup followed by `get_attribute` crossed the current denial clearing
  that element. The browser DOM records the injected 403 and cleared detail.
  The owner retained exact source and original artifact before any changed proof;
  this does not establish an audit disclosure or failed domain mutation.
- Other failure: the same run's search-browser case failed at
  `browser-search.py` line 63 looking up `filter-name`. Its complete original
  section is retained separately; cause remains under investigation and is not
  inferred from the audit fixture's diagnosis.
- Effect: second candidate remains failed. A changed test/source decision and
  qualification require separate evidence; source production count remains 10,037.
- Later source/qualification: 359 confirms the source boundary; test-only 361
  reads the current detail id atomically from the DOM. The separate changed proof
  363 passed the audit and search leaves and terminal closed checks, followed by
  Commit 364/unmount 365; exact identities and stream hashes are in E-057. This
  does not relabel failed integration 352. No production change was made.

### E-055 — Final integration planning fixture read checkbox state across DOM replacement

- Found: first final integration 335 failed with web 152 pass/one failed out of 153,
  after shared 127 reported and server 369 reported passing nodes. Later chained CLI,
  counter, inventory and closed checks did not run. Failed Commit 336/unmount 337
  and the unqualified first candidate are retained; nothing was published to main.
- Evidence/diagnosis: owner retained full decoded stdout 582,666 bytes and stderr
  270 bytes. Read-only collection 339/340/341 saved the exact 216,375-byte planning
  artifact as `out/planning-335-artifact-VERBATIM.json`, SHA-256
  `88e9fb3e7443f4bfcb389f9037543317fdf302e7941656c0bb7dc5f4011f867e`.
  Traceback/source read 342 identifies `StaleElementReference` in the checkbox's
  `is_selected` read after the acknowledged bulk update. Retained DOM shows
  “Bulk edits saved” and zero selected; no failed Work mutation is inferred.
- Follow-up: lead owns a test-only atomic DOM state read, using the adjacent
  readiness pattern while preserving assertions and mutation paths. This is a
  separate site from E-044's earlier lookup/click issue. Changed candidate and
  qualification are pending; no production edit, blind replay, timeout change or
  acceptance credit is claimed. The source-floor result remains 10,037.
- Later qualification: test-only 344
  `12f62baf14c7d39abb7fd16e6048de7021128a780277ad930efd6c995d5a92bf68`
  uses a current DOM checkbox state read with presence/type guards. Changed 346
  passed the same browser leaf's six assertion groups and three terminal closed
  checks; Commit 347
  `127176bb2dd821875e09930da390cd49c87ebaafe03c3bf42651163bb15e42a1bd`
  and unmount 348 followed. The original failure remains retained; subsequent
  integrations 352 and 369 passed this leaf but failed separately.

### E-054 — Report normalizer omitted the singular input field

- Found: complete P1g receipts use positional `input`; the adapter handled `args`
  and `inputs` only. The original raw receipts remained complete, but normalization
  could substitute a trace's bounded command preview for the caller's full input.
- Regression: the new external fixture failed before correction: the command hash
  described a 17-byte JSON preview instead of the complete 67-byte JSON value.
  The fixture also requires preservation of the caller label, complete reply and
  explicit unmount options. Original sources and failed prepare/test receipts are
  retained under `report-preparation/normalizer-singular-input-*`.
- Correction/verification: accept only the actual additional `input` alias through
  the same positional public signatures. Bytecode preparation passed; final covering
  `normalizer-covering-013` passed all 12 tests. Final normalizer SHA-256 is
  `0b55e108376ce813e8aa4b7b7fb13951d458e158c7a8a30c7bd66a2ca10c8d04`.
  The closure verifier uses that same tested argument reader and records its hash.
- Effect: report adapter only. No LayerFS, SDK, application or frozen input changed,
  and no final campaign table had yet been generated with the incomplete alias set.

### E-053 — Current-state indexes lagged retained SDK and lifecycle evidence

- Found: the lead's current-status index still described the 9,830 source and open
  workers after the actual counter reached 9,972 and both workers closed. Its
  status timestamp was 02:53; the last complete SDK receipt/trace was 314 at
  03:03:52.704Z, with no mounted Workspace in retained lead state. Root's own older
  state sections had also required refresh from append-only events; their before
  snapshots are retained separately.
- Evidence/action: root preserved five exact lead state/status/ledger/lifecycle/
  trace files under `report-preparation/lead-context-recovery-r1` before proposing
  a supervisor context refresh. This is a retained control boundary, not an
  independent kernel/process inventory or evidence of a test hang/crash.
- Outcome: the same lead responded with a concrete source-backed L0 completion
  before any interruption occurred. No interrupt, replacement, Sandbox close,
  SDK replay or product change was performed by root. The stale interval remains
  recorded; current-state correction and the new actual work have separate evidence.
  Final report tables use primary receipts and sourced corrections, not stale labels.

### E-052 — Final host manifest treated closed-mode output as one JSON object

- Found: P1g host manifest preparation, retained later source-linked error
  `out/host-final-manifest-decode-failure.json`: `JSONDecodeError Extra data`.
  Original separately exported host streams are unavailable; the visible tool
  chunk and later reconstruction are explicitly identified.
- Diagnosis: nested `closed.stdout` has a process-inventory diagnostic followed by
  the actual mode result on a second JSON line. The host assumed one JSON object.
  The enclosing original 125 SDK result is complete: decoded 596,809-byte stdout,
  SHA-256 `0a2796392277ec2a064a40ecaddd2d381e74b747b60c4b40877bebeda06fda49`.
- Verification: root independently validated the outer gzip hash, parsed both
  nested JSON records, and confirmed process total/live/zombie zero plus three
  successful closed checks. Annotation `p1g-final-closed-result-verification-r1.json`
  retains exact source hashes and both records. The host parse stopped before
  reporting mutations; no SDK/application command was rerun or relabeled.

### E-051 — Seed-witness host decoders missed TAP escaping and a second diagnostic chunk

- Found: I2e retained four failed host-only decoder attempts against the already
  completed original 026 stdout: JSON delimiter error, invalid escape, assertion
  failure, then an unterminated string after a partial inverse transform.
  No seed command or SDK mutation was rerun by those attempts.
- Evidence: `I2e/out/host-decoder-failures-transcript.json` keeps all four command
  and merged-output transcripts. These are explicitly later manual transcriptions
  from visible chat tool calls, with chunk identifiers; separate original host
  stream bytes and a byte-for-byte tool envelope are unavailable. The original
  176,626-byte SDK stdout is complete and unchanged.
- Diagnosis/correction: Node TAP split the one JSON diagnostic across zero-based
  lines 1 and 2, with character lengths 68,339 and 16,509. After removing their
  recorded prefixes, concatenate both chunks, undo escaped hashes, then doubled
  backslashes. Exact re-encoding must equal all 84,819 joined original characters.
  The corrected `decode-original-witness.py` and metadata retain every selected
  boundary and source hash; no missing tail is invented.
- Verification: root independently repeated only that read-only derivation and
  byte equality check against the original SDK stdout and saved decoded bytes.
  Decoded 81,617 bytes, SHA-256
  `f7817230591c39785d020192ae00bf8b160c3d3fe81deb1b39e1e7deed167619`.
  Annotation `i2e-original-seed-witness-verification-r1.json` pins all six sources
  and confirms both real seed exits zero, only events/subscriptions changed,
  exactly one added watched subscription event, and only one existing subscription's
  `updated_at` changed. This is evidence decoding, not a new runtime proof or SDK fix.

### A-029 — Repeating the successful demo seed changed subscription and event state

- Later independent witness verification: root verified the complete inverse and
  exact re-encoding against both original TAP chunks, matching all saved decoded
  bytes and decoder/source hashes. Both actual seed process statuses are zero.
  Events grow 14 to 15 by exactly one `action:watched`, `entity_type:subscription`
  record; subscriptions stay seven rows with exactly one changed `updated_at` field.
  All other 29 captured table states match. E-051 retains the decoder failures and
  provenance limits. The original domain-state witness is now independently verified;
  the earlier owner-derived limitation remains recorded below.

- Later changed verification: guard/regression atomic change 034 is
  `120586462323b84f838af541149ae584260fae947277c0b8146eefe4219fa6f3b0`.
  Prepared/build 036 passed all three tests: two actual seed runs preserve state,
  explicit watch/mute/other-user choices survive reseed, and a missing demo watch
  is established once through the canonical writer. Native exit zero,
  `truncated:false`, complete 43,241-byte stdout SHA-256
  `defb43be50bb64eda564adcfee332c467586c502dafd43c15c873ea4e842e727`,
  empty stderr. Commit 037
  `12d4534c53de74039956a6d064c253941cfc2e665600bccc40ea311b2c9854f1db`
  and unmount 038 completed. Original 026 remains failed; broader source and final
  acceptance applicability are separate.

- Found: fresh successor I2e-026 retained one failed seed idempotence test, zero pass,
  native exit one/`truncated:false`. Complete bare TAP stdout is 176,626 bytes,
  SHA-256 `21f001b4f47862970d85854b49716ee21d856b63ba2ae3a47b9391d617ee2d08`,
  with empty stderr and zero cancelled/skipped/todo. Failed Commit 027
  `1291319cd3d22b27901feed7986ee492d5bbef30eb46603b00f45a04d5f382caca`
  and unmount 028 completed before evaluation.
- Witness/diagnosis: the owner decoded the retained witness and reported that both
  real seed processes exited zero; the second changed `domain_events` from 14 to 15
  with another subscription-watched event and changed the existing owner/project
  subscription timestamp. Source investigation had found the Insight seed hook's
  unconditional call to the existing watch writer. The operational search-index
  rebuild generation was explicitly excluded before the original test; it is not
  the asserted domain-state change.
- Provenance: root independently verified the complete original TAP hash, failed
  totals and one witness marker. Its escaped witness body and the owner's four
  failed host decoders require the source-linked inverse-decoder/roundtrip supplement;
  the state comparison above is owner-derived until that evidence is verified.
  Original host bytes are unavailable where only chat/manual provenance exists.
- Follow-up: a minimal seed-hook guard and external regression are planned. The
  watch writer and frozen counter remain unchanged. Changed verification is pending;
  original two seed invocations and the failed witness are not replayed or relabeled.

### E-050 — Audit documentation edit selected an ambiguous source anchor

- Found: P1g-088 atomic multi-file `fs.apply` was refused `AmbiguousMatch` for
  `/docs/permission-inventory.md`, detail `{matches:2,index:5}`. The exact error and
  original inputs are retained in its complete SDK receipt.
- Effect: before-effect edit refusal; the attempted atomic change did not land.
  The owner read current source/history before constructing a changed anchor.
  Changed-operation qualification remains separate; no guessed resend, automatic
  retry, product repair or lost successful mutation is inferred.

### E-049 — Audit browser fixture waited for an organization anchor absent from the UI

- Later changed verification: test-only selector change 094 is
  `124f7d480e00ea54e3098fb3f67af5130e83f1ad7337a3480b9a6134ebc5940d41`.
  Prepared/build 096 passed the same one browser leaf with nine assertion groups.
  Complete decoded stdout 9,516 bytes, SHA-256
  `58a1104f584f3cdad26b134ba2a5fee6d7b4f624bb88e2117057de562ccc3309`,
  empty stderr/native `truncated:false`. The 58,615-byte browser artifact SHA-256
  is `c5d38035ea6c163896d79c5f539ad444ba69cf35699eda3ec5fd4d23be4255d9`;
  its lifecycle reports owned/global after zero and ten reaped children.
  Commit 097 `12b350d76b06f1e3825120204a4fbcaec552f626e34526f7370ebe6aefd1081bca`,
  then unmount 098. Repeated proof/groups count once, and original 076 stays failed.

- Found: P1g-076, prepare 272/build passed, then the new audit-investigation browser
  failed zero pass/one leaf. Native exit one and `truncated:false`; decoded stdout
  2,032 bytes, SHA-256 `29f5128a4c9c6cc7b738a291e4c089e36e3568ae17e1c9779da300cf74f0a26f`,
  empty stderr. Failed Commit 077
  `1209c499cf0491714fb12214e11877b4a14e9ea0255652d4773ba6673bd6c9be75`
  and unmount 078 completed before evaluation.
- Evidence/diagnosis: full raw artifact read 079 is 34,085 bytes, SHA-256
  `01b70476da0e8618c0bc418e6000c42ff8bbd252a02e1880cf2843c520a81bbb`.
  Its traceback reaches `browser-audit-investigation.py` line 24, waiting for
  `a[href="/organizations/<id>"]`. Actual Organizations source read 080 uses a
  named button and current navigation/store selection. No audit feature witness
  completed before that fixture wait failed. Top metadata/lifecycle are null;
  root independently extracted the raw stderr lifecycle instead: owned/global
  after counts all zero, ten reaped children, `ok:true`.
- Follow-up: owner plans only the diagnosed selector correction, retaining all
  audit assertions. Changed proof is pending. Original failed artifact and source
  reads remain retained; no SDK/product defect or disclosure is inferred.
- Diagnostic procedure: at the lead's request, root supplied the unchanged
  systematic-debugging skill and its three Markdown techniques inside P1g's own
  handoff folder. `systematic-debugging-copy-manifest.json` pins exact source/copy
  hashes. This is B1 host procedure, with no frozen LayerFS SDK/skill replacement,
  outside-folder read by the worker, application guidance or dependency change.

### E-048 — Preliminary notes index misclassified historical lifecycle aliases

- Found: lead's host-only `out/team-notes-inventory-pre-final.json` checked only
  top-level `closedAt`. Nine historical agents had their closed boundary in an
  existing end/nested lifecycle field, so the preliminary index showed them pending.
  P1's absent copy pointer also appeared as a missing copy although its exact copy
  already existed. No client reopened and no new resource observation occurred.
- Correction: `out/team-notes-inventory-normalization.json` explicitly maps the
  existing aliases and P1 copy pointer. Both original and correction are retained;
  primary SDK close receipts remain the exact closure authority.
- Verification: root independently hashed all 19 closed agents' selected copies
  against the original roster's expected hashes. All matched. The only two current
  pending assignments were I2d and P1g. Annotation
  `report-annotations/team-notes-index-verification-r2.json` pins the original
  13,249-byte index, 6,863-byte correction and all selected copies. No SDK call or
  application rerun was needed.
- Effect: use the explicit correction in final report provenance. Preserve the
  original preliminary fields without treating their pending values as live clients.

### E-047 — Worker reported a missing host execution session id

- Later evidence: `I2d/out/missing-session-host-supplement-v2.json`, SHA-256
  `b63a89e40cdff15ec9d916ee364493006ecafc3dc4bb2545f78474282abbbb8b`,
  identifies an orchestration call that printed only `exec_command.output`, dropping
  its returned running-session metadata. The host display/process observation and
  bounded completion wait are explicitly later manual transcriptions; original
  session id and full host tool/output bytes remain unavailable. Version one is
  retained; version two removes a mistakenly attributed completion timing field.
  Root independently verified all six cited original SDK receipts, their exact
  hashes, methods, UTC ordering and host pids, plus the source-control hash.
  Those originals show mount 058, complete Exec 059, Commit 060 and unmount 061
  before the next SDK read 062. Root annotation
  `i2d-missing-session-custody-verification-r2.json` retains that narrower verification.
  No application action was rerun to obtain the missing host metadata.

- Found: I2d host orchestration during the subscription milestone. The lead reported
  that an initial tool display omitted the running session id; the worker recovered
  its own active process/state and waited for completion without replay or overlap.
  This is currently a reported boundary, pending the exact original tool transcript
  and recovery supplement; no LayerFS failure is inferred from it.
- Evidence available now: lead status message and the completed I2d-059/060/061
  browser Exec/Commit/unmount receipts. These show a complete passing browser reply
  and successful custody, but do not alone establish which host tool display
  omitted a session id or how the process was recovered.
- Follow-up: retain the original display, actual process/session inspection and
  completion wait, with timestamps and source provenance. Any later transcription
  must be labeled separately. Do not rerun the operation to reconstruct evidence.
- Effect: source floor, integration and final acceptance remain pending. No product,
  SDK, skill, timeout or frozen input changed on this reported evidence.

### A-028 — Named digest review reached an undefined Fragment at runtime

- Found: I2c-063 digest browser, zero pass/one failed leaf, complete 1,967-byte
  stdout/native `truncated:false`. Preview GET returned 200 with three items, but
  named review content did not become ready. The exact 34,300-byte failed artifact
  SHA-256 is `4636a723775eab28a161abce13c056777de543f7b1d09b293372184dba576f97`;
  Commit 064/unmount 065 retained it, with explicit zero owned/global cleanup.
- Diagnosis: changed diagnostic fixture 069 captured the actual browser console in
  071; that attempt also failed and has its own Commit 072/unmount 073. Full artifact
  read 074 is 35,301 bytes, SHA-256
  `760701bfa7ac2a1fd69b8358afc68a83e0afbacb5c4c5b86257bb27066a4f176`.
  Its JavaScript error is `Uncaught ReferenceError: Fragment is not defined`.
  The retained pre-login `/me` 401 is a separate network observation.
- Correction: owner added the missing Fragment import in 075,
  `1297eb0b732841ebb91cfc8baec780423aa1f4f2ad08a02b4d6f39035af70a1d59`.
- Verification: changed 077 passed the same one digest browser leaf/five groups,
  complete 1,549-byte stdout, empty stderr/native `truncated:false`; raw artifact
  66,442 bytes, SHA-256
  `bf82035e57940f966d1e8663d61e352b7a0444600ad71ef76c16448f692e0fb7`.
  Explicit lifecycle reports zero owned/global live/zombie and ten reaped children.
  Commit 078 `12384d3a7a923d6e583a2d3b93e6594ce2e41cc5175e79ba0d3559512bc334ae57`,
  then unmount 079. Original 063 and diagnostic 071 remain failed attempts.
- Effect: application runtime rendering repair, not a LayerFS/SDK or server-contract
  defect. Final complete package and main acceptance proofs remain pending.


### E-045 — Root decoder treated a compact census envelope as a flat counter

- Later stream assumption error: root's
  `subscription-development-stream-verification-r2.*` extraction first verified
  I2d-065's complete passing web/CLI streams, then incorrectly asserted that
  P1g-029's decoded child stderr must be empty. It contains 376 bytes of npm notice
  and the expected SQLite experimental warning; its actual test status is zero.
  The failed extraction has retained stdout/stderr/JSON receipts. Changed r3
  extraction preserves and hash-verifies both streams regardless of emptiness;
  annotation `subscription-development-stream-verification-r3.json` records all
  exact source/stream hashes and TAP totals. No SDK or test was replayed, and the
  original child warnings remain retained.

- Later related root summary error: after successfully verifying both complete
  I2c-102 package streams, the helper called `len()` on I2c-106's integer
  `browserArtifacts` count and raised `TypeError`. Original tool chunk `ef4390`
  and explicit later transcription `source-audit-scalar-root-typeerror.json` are
  retained. Typed inspection then verified 106's full compressed artifact by exact
  bytes/SHA and preserved it separately. No SDK/application effect or test replay
  occurred; the prior completed 102 stream verification remains separate.

- Found: read-only root evidence extraction for I2c-087. The helper printed the
  actual envelope keys, then incorrectly accessed `files` on the envelope and raised
  `KeyError`. No SDK call or application operation occurred. Dependent P1f-041/028
  reads in that Python command did not run.
- Evidence: original visible tool output chunk `0c0213`; explicit later transcription
  `~/.codex/issue340-control/report-preparation/census-envelope-root-keyerror.json`.
  Original dedicated streams are unavailable; the source SDK receipt is unchanged.
- Correction: decode the actual `artifact.gzipBase64` field and validate exact
  uncompressed bytes and SHA before parsing the full artifact. The 158,259-byte
  result, SHA-256 `7637999df596e33ac29af14fca7429e61e2d54c6bea92311aef6e04dfa29bfd9`,
  is preserved byte for byte in `report-annotations/i2c-087-source-census-verified.json`.
- Verification: original frozen counter stdout parses to its embedded counter;
  all 192 production file totals and package totals reconcile to 9,717, 349
  maintained files, max 230 physical lines. Counter/lock hashes are unchanged;
  source `fa057c7734f0b34cb2c0b31ea66b68a790cc0d06b4c8b66656cebc1ca8e3e318`.
  Exit one retains the 283-line floor miss. The corrected extraction does not
  relabel the original root decoder failure or claim final acceptance.

### E-046 — Independent policy snapshot fixture assumed every table has an id column

- Found: P1f-028 independent digest policy run, eight failed/zero passing cases.
  Complete 9,272-byte stdout/native `truncated:false` reports `no such column: id`
  in the snapshot helper before the intended no-effect comparisons could qualify.
  The separate npm update notice did not trigger a dependency update.
- Evidence: exact immutable `agents/P1f/out/calls/P1f-028.json`; original failed
  output and subsequent schema inspection remain retained by the owner.
- Correction: owner diagnosed the fixture's table-schema assumption. The changed
  036 independent real HTTP run passed all eight cases, complete 12,368-byte stdout,
  empty stderr/native `truncated:false`. No product guard failure or guard edit was
  established from the initial fixture errors.
- Verification: 041 full affected server returned a complete hash/gzip stream,
  decoded by root to 111,814 stdout bytes, SHA-256
  `79510b232d32a452ce7286dcade35aa2bdb29fa1578469ab5a47fbd7fdbc9047`,
  empty stderr and 342 reported passing nodes with zero fail/cancel/skip/todo.
  Unique leaf counting and final-main acceptance remain separately required.


### T-003 — Worker reported a timestamp before extracting its source

- Found: fresh P1f status reporting. The lead preserved that the worker first typed
  an invented/unextracted `02:19:34.808943`, then immediately withdrew it after
  reading its saved control manifest. It is not treated as clock skew or an actual
  start time. Original reports remain retained.
- Correct source: root independently read `agents/P1f/state.json` and preserved an
  exact byte snapshot. Its `createdAt` is `2026-10-16T02:14:23.525110+00:00`.
  This is control-manifest creation; exact agent spawn remains unavailable.
- Correction/evidence: lead directed extract-before-report with field provenance.
  `report-annotations/p1f-created-at-state-snapshot.json` and the corresponding
  correction annotation pin the saved source and distinguish the withdrawn chat
  value from the genuine field. No raw timestamp or historical report is rewritten.
- Effect: use only the sourced manifest boundary for the declared worker timeline;
  no SDK, application, product, skill or frozen input changed.


### E-044 — Planning browser retained a checkbox element across row replacement

- Found: I1b-112 affected web package, 132 passing/one failing leaf out of 133,
  complete 367,077-byte stdout/native `truncated:false`; CLI behind the chain did
  not run. This is separate from 105's earlier guided-query confirmation failure.
- Diagnosis: actual 116 artifact inspection retains `StaleElementReferenceException`
  at `browser-planning-review.py` line 100: a separate lookup and click of the
  `Select PLAN-1` checkbox crossed a DOM row replacement. Original failed artifact
  `data/test-evidence/browser/planning-review-1792116144125-27125-a1da13cb-e934-4c7e-b891-a2ae687e394e.json`,
  SHA-256 `3ddcd30a19c9d5c042c62967fa00b41bc378542dcd29581c65d50464eac5f5c4`.
- Correction: the lead delegated only this L0 test fixture to I1. One actual DOM
  lookup plus checkbox UI click follows bounded canonical readiness. No W2 production
  edit, retry, direct state/fetch call, assertion removal or swallowed error.
- Verification: changed 133 passed the same one planning browser leaf/six groups,
  complete 1,983-byte stdout, empty stderr, native `truncated:false`. Original
  keyboard/drag/HTTP assertions remain. New artifact 42,429 bytes, SHA-256
  `fd53662a9c7a6fe9f5f167c1bd2adaf20b50c05800a5d92a4c02aba4e27c3982`;
  owned/global after counts zero, ten children reaped. Commit 134
  `12c094c5ba6a9018647ee1a8f76e19556e886375fba3a6fad1e69ffd462f2d0909`,
  then unmount 135.
- Effect: the scoped join is 320 server +133 web +49 CLI =502 unique passing
  leaves, reusing the 132 unaffected web leaves by source applicability and counting
  this planning case once. Original 105/112 remain failed attempts. A new complete
  full web command and final-main acceptance remain lead-owned and pending.


### A-027 — An older inbox acknowledgement cleared a newer selection

- Later changed proof: I2c-045 passed 30 nonbrowser cases plus the same one browser
  leaf, complete 10,474-byte stdout/empty stderr/native `truncated:false`. The old
  A acknowledgement left newer B selected; actual HTTP state stayed A read/B unread.
  The new 45,860-byte artifact SHA-256 is
  `b18877363d803e19f0abbd1d43ad75bfe93f3a56e23188b9372c79bc43d53a9d`;
  lifecycle reports zero owned/global live/zombie and ten reaped children. Commit
  046/unmount 047 followed. The original 013 remains failed and is not counted again.

- Found: I2c-013 actual pre-repair Chromium witness, exit one, complete output,
  zero passing leaves/one failing leaf. The controlled fixture held selected-A's
  PATCH before send, then changed the visible filter to unread and selected B.
- Direct retained observations: acknowledgement `{changed:1, read:true}`; current
  filter unread; B selected before acknowledgement and empty selection afterward.
  Actual HTTP state shows A read and B still unread. The server applied the intended
  mutation, while the old acknowledgement cleared newer UI intent.
- Evidence: exact artifact in I2c-016 full `fs.read` reply, 34,008 bytes, SHA-256
  `18b9fc1f86596967a6c8f2fbe4ee8554afd571714c117d8bf338d57351eeb500`;
  `data/test-evidence/browser/inbox-intent-witness-1792116336797-1878-5d97eb66-6d69-42c7-8522-e0f89f6eca92.json`.
  Root matched the full text hash and parsed the original stderr witness and
  explicit owned/global zero live/zombie cleanup (`ok:true`). Top proof in the
  failed browser artifact remains null; no missing summary is invented.
- Custody: first failed-evidence Commit 014
  `12854299cc52b29b29e9128b5d3e6f0c7f6cc0558ec8a108f9087a062cf84dc46c`,
  then unmount 015. Root's compact corroboration is
  `report-annotations/i2c-013-inbox-selection-witness.json`.
- Correction/qualification: assigned I2 owner repairing the current-intent boundary;
  changed proof pending. No LayerFS defect, privacy leak or server mutation loss is
  claimed. Root did not edit or steer the application repair.


### A-026 — Full affected web package failed an existing filter confirmation flow

- Later changed client source at 112 passed the original guided-query case among
  132 web leaves; its different planning fixture failure is E-044. The scoped
  development join qualified that case without relabeling either combined failed
  command as a full web PASS. Final covering qualification remains pending.

- Found: I1b-105 after saved-filter collaboration changes. Complete 496,785-byte
  stdout/native `truncated:false` records server 321 reported nodes all passing
  (320 meaningful leaves), then web 132 pass/one fail out of 133, no skips/todos.
  CLI behind the failed command chain was not run. This combined attempt failed.
- Witness: the existing guided-query browser case reached its same-filter delete
  review flow, then could not find `Cancel confirmation`; Python raised
  `NoSuchElementException` in `browser-query-builder.py` line 113. Its retained
  lifecycle has `ok:true`. Other parallel browser leaves were active, so global
  before/after snapshots are not interpreted as this fixture's owned leaks.
- Evidence/custody: exact `agents/I1b/out/calls/I1b-105.json`; first failed-evidence
  Commit 106 `12baf32d0177eac6a9e698d510b0bd4c59e020589b959e37abc8de8345d2c4a056`,
  then unmount 107.
- Correction/verification: owner is diagnosing current identity/readiness handling
  and will qualify the affected client behavior and CLI. The unchanged passing
  server proof stays separate; no repeated package total is added as new cases.
  No final-main acceptance or LayerFS failure is claimed.


### A-025 — A successful saved-filter save lost its acknowledgement after own SSE

- Later changed proof: I1b-082 passed one collaboration browser leaf with seven
  groups, followed by Commit 083/unmount 084. Expanded stale-409/transient-503
  recovery at 092 passed the same unique leaf with eight groups. Both retained
  complete 1,579-byte stdout, empty stderr and `truncated:false`; original 075
  remains failed. Expanded Search 087 independently passed its one leaf/eight
  groups, including actual Back/Forward, explicit retry, denial and late-reply
  boundaries. These are scoped development proofs, not final acceptance.

- Later corroboration: lead 288 read the complete committed artifact and copied it
  verbatim to `out/I1b-075-browser-artifact-VERBATIM.json`. Root matched all 38,512
  bytes/SHA and independently parsed its exact stderr: one PATCH 200, followed by
  the canonical GET 200, identical current/local names in the concurrent-review
  DOM, no success notice, and explicit cleanup with owned/global live/zombie zero
  and ten reaped children. The top proof remains null. Forced held-ack/SSE ordering
  stays attributed to controlled fixture inspection, not invented network clocks.
  Root's compact corroboration is in `report-annotations/i1b-075-failure-corroboration.json`.

- Found: newly added Build 1 saved-filter collaboration, I1b-075, one browser leaf
  failed after prepare 253/build passed. Complete 2,030-byte TAP records exit one,
  zero passing leaves and native `truncated:false`. Earlier partial groups are not
  counted as passing cases.
- Worker/lead inspection of the retained raw browser artifact reports this witness:
  hold the successful PATCH acknowledgement until its own emitted SSE causes a
  successful canonical GET, then release the acknowledgement. The UI retained an
  obsolete baseline, offered an unnecessary current-versus-identical-local review
  and omitted the success acknowledgement. This is a new feature's application
  race; no LayerFS mutation or reply loss is claimed.
- Evidence: `data/test-evidence/browser/saved-filter-collaboration-1792115736680-12138-ac452731-acbd-47ed-ac9a-6de2447c5642.json`,
  38,512 bytes, SHA-256
  `939cf1dfd8530fee9a4ee455a36fc4a19ce55c2739e6f15d3a232c57eb2c5036`.
  The raw Python artifact has empty stdout and 18,170 stderr bytes. The receipt's
  preview metadata is empty/lifecycle null, so the detailed witness and cleanup
  claims are sourced to artifact inspection, not inferred from those empty fields.
  Root requested the exact raw or hash-linked extracted details in the handoff.
- Custody: first failed-evidence Commit 076
  `127771eae7350192d053db60258ee2d6e0c44df651fb97b19fc50848af07905405`,
  then unmount 077. Earlier 062 failed at fixture team readiness because it expected
  `orgId` instead of the actual response's `org_id`; changed 073 followed inspection.
- Correction: owner change 080 preserves the in-flight save ticket only when current
  canonical fields exactly match the detached submitted payload. Different remote
  edits and changed selections still invalidate it. Changed qualification pending;
  no successful outcome is claimed yet. Server 031 remained unchanged.


### E-043 — Census producer output ended at 64 KiB before complete JSON

- Later changed collection: P1e-042 inspected history/source before 044's different
  compact gzip/hash envelope with natural completion. It collected the missing
  maintained/runtime/hash inventory without rerunning the frozen counter. Exact
  source applicability then failed for one changed production file (+1 byte in
  length); matching 9,473 totals were not treated as identity equality. The mismatch
  and prior prefix remain retained. This is not a claim of a one-byte edit.
- At that changed source, necessary final checkpoint 053 returned complete frozen
  counter JSON: 9,473, 190 production files, same counter/lock hashes, exit one;
  054 UpToDate/055 unmount followed. It matches 044's inventory: 335 maintained
  files, 118 actual routes, no production file over 999 physical lines. Joined
  source identity `09d6ecd0edf8477e3c9cd4c96941b2ab3ddf0fe7c26a33650694a7b12dff360f`
  at Commit `127771eae7350192d053db60258ee2d6e0c44df651fb97b19fc50848af07905405`;
  `out/final-source-census.json` is 177,529 bytes, SHA-256
  `b3ae0f1ae3285f576575361a4f1a3ffba9a8c8e4481f3f36c5ef6c7758a9f839`.
  This qualifies that separate snapshot and keeps 039 incomplete and failed.

- Later separate evidence: I1b-067 already retained a complete 35,630-byte frozen
  census, independently parsed by root with all 190 per-file production totals
  and package totals reconciling to 9,473. Its source identity is
  `7ab8dc0b7fe1f4b475c546e3cbc22c9c91bfd113adf723bd1a7b84634e90e9b2`.
  The counter/lock hashes are unchanged, exit one retains the 527-line floor miss,
  and Commit 068/unmount 069 followed. This separate receipt does not repair P1e's
  missing suffix; only P1e's missing additional inventory needs a changed collection.

- Found: P1e-039 current-source census, exit one, native `truncated:false`, but
  exactly 65,536 stdout bytes ending inside a maintained-file path. Parsing failed
  with an unterminated string at character 65,498. The incomplete output cannot
  qualify the full file census or runtime route inventory.
- Evidence: exact original reply and command in `agents/P1e/out/calls/P1e-039.json`;
  `out/census-stdout-original.txt`, SHA-256
  `0686cd73981e172d638b986a072d98d21d0f1a671ac2bb491ea67bd13bddf9b8`,
  and `out/host-summary-failure.json`. The latter is explicit later provenance for
  the host parser failure; original dedicated host streams are unavailable.
- Custody: 040 Commit returned UpToDate, then 041 unmounted before host parsing.
  No operation is replayed and no missing suffix is reconstructed.
- Diagnosis pending: the retained producer command calls `console.log` with the
  large JSON and immediately calls `process.exit(run.status)`. This is a concrete
  output-draining hypothesis, not yet a LayerFS/SDK failure finding. The lead has
  routed it to the worker's host evidence control.
- Correction/verification: pending changed complete collection. The visible 9,473
  count is a prefix observation; a complete source census remains unqualified from
  this receipt. The last earlier complete 9,306 census is retained separately.


### E-042 — Lead receipts retained logical commands without separate outer-shell fields

- Found: Build 1 lead evidence review before final acceptance. Historical own Bash
  receipts retain the complete logical exported command, selected Sandbox/path/label
  and control template. They did not separately copy the actual `timeout 110` shell
  string into each per-call input record. No historical receipt is rewritten.
- Evidence: `agents/lead/out/full-shell-input-metadata-supplement.json`, 1,096 bytes,
  SHA-256 `07cc394be5ad3a7547a5cf949b52a77f21bb68b4bb75baadfd0854ca212fcaf0`.
  It pins the archived original control source and distinguishes retained inputs
  from reconstruction and unavailable process/native serialization details.
- Correction: from lead sequence 283 onward, metadata additionally records exact
  outer `shellCommand`, actual positional exec arguments, effective trace/step and
  construction-worker setting, and actual host pid/cwd. Syntax preparation passed.
- Effect: metadata only; no SDK call, application, product, skill, test or frozen
  input changed. No historical pid or native wire serialization is invented.
  Final reporting keeps the original evidence boundary explicit.


### A-024 — Delayed saved-filter selection changed the query after a newer choice

- Later changed proof: I1b-051 passed the same one browser leaf and both behavioral
  groups, exit zero with complete 2,552-byte stdout and empty stderr. Releasing A
  left selected B, visible `bravo`, the B URL and actual B search request intact;
  in-app URL navigation synchronized organization and project controls. The new
  artifact is 43,515 bytes, SHA-256
  `f098ea9a3bacadf44d53bba7412b41f95752859c9e84314ed2ed70959839435c`;
  lifecycle again reports zero owned/global live and zombie browsers afterward.
  Commit 052 and unmount 053 retain the changed proof. Original 043 stays failed;
  this is one unique case, not two tests or final acceptance.

- Found: Build 1 I1b-043 actual Chromium proof, exit one, complete/untruncated
  output. Prepare 248 and build passed first. This was a runtime witness after
  earlier source-only findings; the original I1b-034 selector instrumentation
  failure is separate and remains failed.
- Witness: hold the real HTTP GET for saved filter A, select B and observe B's
  query, then release A. The selector still showed B, while the text, URL and
  actual search request changed to A's `alpha` query and organization. A second
  assertion navigated the existing SPA to another organization/project URL while
  visible scope controls still showed the previous organization and empty project.
  Both assertions failed in one leaf; no pass is counted.
- Evidence: immutable `agents/I1b/out/calls/I1b-043.json`; browser artifact
  `data/test-evidence/browser/saved-filter-selection-1792115350718-3845-f97f37ec-d04e-4084-ad36-6f5d33ae24b9.json`,
  44,152 bytes, SHA-256
  `566a93228af5ad7804620e1cd78016c8efcfdbf28c74f732e59e830977d87e53`.
  The complete proof metadata and raw stream hashes are retained in the receipt.
- Custody: failed-evidence Commit 044
  `1229378b4fa66c7e6dbc245b79a1406560061b1836cd8a639f6bde33f5a1546b6e`,
  then unmount 045. Browser lifecycle reported zero live/zombie processes afterward.
- Correction/verification: assigned I1 owns the application repair; pending.
  Root only read retained evidence and did not edit or steer application design.


### E-041 — Report normalizer omitted bare receipt clock aliases

- Found: root's closed-Sandbox evidence inventory, before final table collection.
  P1c receipts retain `started` and `ended`; the adapter supported other clock
  aliases but fell back to the trace start and omitted the retained receipt end.
  Original receipts and trace clocks are unchanged.
- Regression: `test_bare_started_ended_receipt_clocks_are_retained_without_guessing`
  failed before correction: it substituted `00:25:55Z` for the actual retained
  `00:25:55.015Z`. Original sources and failed test output are under
  `~/.codex/issue340-control/report-preparation/normalizer-bare-clock-before*`.
- Correction: add only the exact `started`/`ended` field fallbacks. No inferred
  timestamps, timestamp-based joins, product, SDK, skill or application change.
- Verification: the complete final normalizer suite passed 11 checks; receipt
  `normalizer-covering-012.*`, exact sources in `normalizer-bare-clock-final-sources/`.
- Effect: final normalization has not run. The inventory also identified I2's
  complete saved daemon streams under `agents/I2/out/daemon/`; final daemon input
  selection must include that real path. No previously published final table is
  relabeled, and this discovery does not claim a missing historical stream.


### E-040 — Support snapshot mutation fixtures compared unresolved macOS paths

- Found: root support-evidence preparation, after Build 1 Init. The first three
  external checks returned one pass and two failures because neither mutation hook
  ran. Original stdout/stderr and exit one remain in
  `~/.codex/issue340-control/report-preparation/support-snapshot-tests.*`.
- Diagnosis: the helper resolved source roots under `/private/var`, while the
  temporary fixture compared its original `/var` spelling. A separate path
  diagnostic confirmed unequal path objects. The snapshot algorithm was unchanged.
- Correction: archive both original sources, resolve the fixture root before the
  comparison, then run the changed fixture suite. No product, SDK, skill, frozen
  input, Store or application operation changed.
- Verification: three checks passed: exact binary/link/permission preservation and
  declared exclusions with replay refusal; same-size source mutation refusal;
  newly appearing source-file refusal. Receipts are `support-snapshot-r2-tests.*`;
  exact final sources/configuration are in `support-snapshot-final-sources/`.
- Effect: the real campaign support snapshot remains not run. It will copy only
  finalized sources to a fresh external destination, with source/copy hashes and
  source membership/metadata verification before PASS; the existing verified
  sharded archive tool then preserves that copy. Failed fixture evidence is retained.


### E-039 — Focused sidebar test was launched outside its expected workspace cwd

- Later proper-cwd sidebar selection passed before the exact W1e-128 web command;
  that unwrapped full web run passed all 125 cases with complete output. Original
  119 remains four pass/one failed fixture; its 472-byte raw artifact is unchanged.

- Found: W1e-119 focused recorder proof, prepare 246/build passed, four selected
  leaves passed and the sidebar leaf failed. Its exact 472-byte raw artifact shows
  Python could not open `//scripts/sidebar-viewport.py`; the browser never started.
- Diagnosis: ad-hoc selection launched from the application root while this existing
  fixture expects npm's web-workspace working directory. This is not evidence of
  broken sidebar behavior or a browser ownership leak.
- Custody/correction: first Commit 120 (`125e095...`) and unmount 121 are retained.
  Inspect the path/cwd cause, then run only the changed sidebar invocation from the
  proper workspace directory before the exact unwrapped full npm web command.
  At this entry those follow-up outcomes remain pending; passing selections are
  not repeated unchanged merely to replace the failed combined result.

### E-038 — Worker printed oversized diagnostic payload but did not gate its SDK call

- Later corroboration: 103 history and 104–116 all thirteen current paths matched
  the desired final bytes. This confirms the resulting state without erasing the
  missing inspection between 101 and 102. No replay of either call occurred.
- Focused recorder qualification at 119 retained complete 16,802-byte TAP with
  `truncated:false`: four passing leaves/one failing cwd fixture (E-039). Both new
  lossless regressions passed, including >1-MiB Unicode streams and actual Python
  exit seven with both >1-MiB streams persisted before rejection. Live/transfer
  selections passed. Required first Commit 120/unmount 121 followed the reply.

- Ordering correction received after the initial entry: W1e-102 had already landed
  before the lead's post-101 inspection instruction arrived. It was one changed
  atomic apply with 37 spans, actual payload 15,816 bytes, an enforced conservative
  below-30,000-byte input guard, and asserted byte equivalence to reviewed desired
  final files. Commit `1233917939d520...` is retained in the exact full reply.
- Explicit deviation: no history/all-current-path inspection occurred between 101
  and 102. Do not retroactively claim the planned ordering happened. Native encoded
  wire size remains unavailable. This was a changed atomic input, not replay of 101
  or automatic splitting; those facts do not erase the custody-order deviation.
- Now inspect actual history and all thirteen touched hashes before any tests;
  do not replay 102. Independent corroboration and subsequent proof remain pending.

- Found: actual W1e-101 diagnostic-only thirteen-file `fs.apply`, payload 73,390
  bytes. It returned the revised typed `TooLarge`/null admission refusal before send.
  The original input, hash and full reply remain retained by its owner.
- Deviation: the builder printed the oversize byte count but failed to enforce its
  pre-SDK guard. This does not establish a new product failure: P-003's refusal
  behavior operated naturally in the worker run, with no SDK/skill/freeze change.
- Custody: retain refusal, inspect history and current paths before any changed
  source operation. Requested mutation was refused by the known unsent admission
  contract; independent path/history corroboration remains pending at this entry.
- Changed operation planned: one atomic function-anchored compact edit, with actual
  input/message byte count recorded and a conservative pre-SDK guard. No automatic
  splitting, cap increase, blind replay or guessed success. Its outcome is pending.

### E-037 — Truncated test preview caused a host recorder to throw before Commit

- Exact unwrapped web qualification later passed at W1e-128: 125/125 tests,
  zero fail/cancel/skip/todo; prepare 246/build passed; stdout 352,575 bytes with
  `truncated:false`, stderr zero. Raw Python streams/proofs are retained in committed
  `data/test-evidence/browser` with TAP path/SHA. Commit 129 and unmount 130 follow.
  This qualifies that package/source checkpoint; final main acceptance remains open.

- Complete affected-package evidence: W2c-140–143 was already running before the
  pause and finished exit zero/truncated false using a gzip transport wrapper.
  Recovered exact stdout: 1,457,807 bytes, SHA-256
  `844dcf9bd4e958eea72539b961540d36aa5f56c1cf9f79381ca2233f24ca558f`;
  stderr zero. Reported nodes server 302/web 123/CLI 44 passed; unique leaves still
  require reconciliation. This is affected-package proof, not the frozen unwrapped
  A06 qualification. The prior truncated/failed invocations remain unchanged.

- Later custody/diagnosis: W1e-061 returned exit zero but its stdout also reached the
  preview cap before totals; it remains incomplete, not a qualified full-web pass.
  Sibling browser lifecycle snapshots repeat full argv data (59–87 KiB per browser)
  with duplicate stderr diagnostics. The owners are persisting exact raw streams and
  lifecycle proofs in generated evidence files and printing compact summaries;
  command/test semantics and numeric-exit Commit obligations remain unchanged.
- Changed scoped W1e-071 live label/dependency browser passed one leaf/six groups,
  with actual canonical 100+5 pages, held-response assertions and process cleanup
  zero. Original W2c-116 remains failed; this scoped proof does not replace final
  full package/main acceptance or reconstruct missing tails.

- Found: W2c-116 after the seed repair. The repaired server selection reported
  all 291 TAP nodes passing (unique-leaf/container reconciliation pending). Web
  then failed the W1-owned live dependency/label assertion for `Private label000`.
  The SDK's documented 1-MiB preview was truncated; complete web totals/final tail
  are unavailable and CLI was NOT_RUN. Missing output is not reconstructed.
- Recorder deviation: it threw on `truncated` before committing the returned
  numeric exit. W2 immediately inspected 117 status (Idle, moved head, overlay 3)
  and 118 history, then made the first Commit at 119 (UpToDate clean moved-head
  merge) and unmounted 120. This is not a repeated Commit or replay of 116.
- Correction: future recorder commits on a returned numeric exit even when preview
  is truncated. Future full output is retained in a runtime evidence file and a
  bounded summary is printed. Original raw reply, prefix, stderr and truncation
  flag remain unchanged and were copied to the owning W1 worker for diagnosis.
- Concurrent proof custody: W1e-061 was already running before the not-ready/failure
  notification reached it; it is not characterized as a knowing unchanged replay.
  It must finish its actual reply/Commit/unmount, then inspect before a changed run.
- Effect: application assertion diagnosis and full final qualification remain open;
  no new LayerFS, SDK, skill or freeze defect/change is inferred from the preview cap.

### A-023 — Optional planning precondition assumed an Express request in the internal seed path

- Found: W2c-107 full server execution after the latest source build. Reported TAP
  nodes: 290 pass/one fail of 291; suite-container exclusion is still to be reconciled,
  so these are not claimed as 290 unique passing leaves.
- Actual sole failure: workdemo seed idempotence raised `TypeError: req.get is not
  a function`. The existing internal seed request is a plain request-like object;
  the new optional precondition helper assumed the Express getter unconditionally.
- Failed generated Commit 108 and unmount 109 are retained. Web/CLI selections were
  NOT_RUN after the failing `&&` chain, not passing by inference. The route inventory
  passed in that run. No SDK or frozen-input change is implicated.
- Disposition: owner will support the existing optional getter contract, add an
  internal seed/hooks regression and qualify affected APIs. Actual HTTP conditional
  guards remain required. Changed proof and final-main qualification are pending.
- Later verification: the changed getter/internal seed regression passed; W2c-116
  repaired server selection reported all 291 TAP nodes passing. Unique leaves
  still need suite-container reconciliation. Its later web failure/truncated preview
  is E-037, so this is not a passing combined invocation; CLI remained NOT_RUN.

### E-036 — Attachment browser expected an organization event on a project-filtered subscription

- Found: W2c-093, prepare 235/build and seven pure cases passed, but the attachment
  browser leaf failed at its final guest reload expectation after three partial
  groups. Failed Commit 094 and unmount 095/cleanup zero are retained. Partial groups
  do not make the browser leaf pass.
- Owner runtime/source diagnosis: the project-filtered pager cannot receive the
  organization-level membership event the test expected. The scenario also cleared
  an injected 403 and changed an owner to a granted guest; membership alone did not
  repopulate the expected state under the implemented subscription scope.
- Changed follow-up: deliberately Refresh attachments, invoking existing organization
  and project resource refresh through one coordinated callback, then verify canonical
  read-only state, actual server denial and exact file bytes. No new access route,
  query, permission framework or automatic-subscription promise is introduced.
- Qualification: original 093 remains failed; changed browser proof is pending.
  This entry does not infer a server permission failure or a LayerFS defect.
- Later changed proof: W2c-099 passed eight leaves (pure seven and one real browser
  leaf with four groups), including exact bytes/SHA, current-page SSE, 503/removal
  recovery, re-review/no replay, new 403/held reply and deliberate Refresh after an
  actual granted-guest role change. Cleanup zero; generated Commit 100 and unmount
  101 retained. Original 093 remains failed.

### E-035 — Root collection edit expected the wrong literal occurrence count

- Found: root final-collection helper preparation, tool chunk 739986. A guard expected
  six `1000` literals; actual source has five. It failed before script/docs/ledger
  writes or any SDK call. Only an owned before-source evidence copy was created.
- State inspection: exact archived before bytes still equal the current source;
  the following syntax check had checked that unchanged version, not a new edit.
- Changed follow-up: inspect the actual two source lines and five occurrences,
  then apply the reviewed 50-record window. Preserve full pagination and final stats
  ordering. Before/after sources and copied failure provenance are under
  `issue340-control/report-preparation/final-collection-window/`.
- Effect: tooling guard assumption; no product/app/freeze or workload-total change.

### A-022 — Planning loading state unmounted a sprint-scope pager

- Found: W2c-064, one existing pagination Chromium test failed waiting for Previous
  sprint-scope navigation. The same invocation passed API 18, pure controller 9,
  CLI 2 and native-drag 1; it is not a whole-invocation PASS. Failed generated
  Commit 065 and unmount 066 are retained; browser processes were reaped.
- Owner diagnosis from runtime/source: same-project board loading unmounted the
  pager and lost its cursor. The changed repair and browser proof remain pending.
  Do not infer a LayerFS defect, text-merge cause, timeout gate failure or a passing
  proof from the already passing selections.
- Separate compatibility work: W2c-061 preserved the supported unconditional bulk
  path without unnecessary named preview reads/hash; real HTTP authorization
  observation at 064 verifies that delegation. Supported token classes remain
  read/write/admin. No supported split-scope token failure was observed or claimed.
- Later changed browser proof: W2c-074 passed beyond-200 pagination with 64 explicit
  50-row requests after 072 effect repair. Original 064 and later failed 069 remain
  retained. W2c-080 separately passed six isolated interaction groups covering
  keyboard order/recovery, bulk review, sprint scope, workflow review and permission
  clear, with browser cleanup zero. Final main acceptance remains pending.

### A-021 — Comment and shared-filter mutations returned existing metadata to write-only tokens

- Found: P1d-034 real HTTP policy witnesses, after prepare 226/build passed. All four
  registered policy tests failed, with generated Commit 035 and unmount 036 retained.
- Actual comment edit: bearer raw scopes `['write']`, PATCH of another member's comment,
  returned 200 with existing author id/name and creation time; one mutation/event.
  The response body was newly submitted by the caller, so this is not evidence that
  the pre-existing comment body was disclosed.
- Actual stale PATCH/DELETE: 409 returned context ids/current revision/fields; state
  and event counts stayed unchanged. These witnesses do not claim private body/name
  disclosure from the conflict response.
- Actual team-shared filter create: write-only POST returned 201 including unsupplied
  existing team/organization names; filter state/event each advanced once.
- Disposition: P1 owns minimal documented canonical-response read guards before effects
  and preconditions: issue read for comment edit/remove, filters read for team-shared
  creation. An unsupported comment-create guard is not inferred from these witnesses.
  Changed proof and final-main qualification remain pending. No LayerFS change.
- Exact witness custody: lead copied all four pre-fix metadata records verbatim
  to `agents/lead/out/P1d-response-pre-fix-witnesses-VERBATIM.json`, 3,569 bytes,
  SHA-256 `0fde87b75308c15bcb7da24e1d95b81a42381997badf5a7cdc498594a8ece164`.
  Failed step 035 created `12cc3c8173a999d1f6b33763325c0ee0ff4e87efe717175171aaaead1019ebbc3b`;
  036 unmounted it. The failed helper duplicate-context assertion happened before
  SDK execution; the changed function-anchored 2,295-byte payload was reviewed
  separately before its new operation. No passing guard proof is inferred.
- Later changed verification: P1d-045 guard source/046 route inventory (118 routes),
  then 049 prepare 228/build and 60 selected server leaves PASS, no skip. All four
  prior write-only witnesses now deny 403 with unchanged state/event zero; combined
  read/write canonical and stale-409 behavior passes. Guest/current-team/cross-org
  boundaries and supported personal-filter/comment-creation paths pass. 050 retained
  an UpToDate moved-head merge, followed by 051 unmount. Final planning-route audit
  and final-main acceptance remain pending.

### E-034 — GitHub CLI PR editing queried deprecated classic Projects

- Found: root draft-description publication after pushing revision 2 commits;
  `issue340-control/report-preparation/pr-body-freeze-r2.*` retains exit one and
  the exact GraphQL `repository.pullRequest.projectCards` deprecation failure.
- State inspection: a separate REST GET retained the old unchanged body, open/draft
  state and exact pushed head 71c84b54323d19f55c536021acbf14a3b149399c. No merge
  or other publication state was inferred from the failed edit.
- Changed follow-up: the prepared exact description was applied by REST PATCH
  with a JSON input file. The acknowledged reply matches that body and retains
  open/draft/head state. The issue progress comment separately succeeded at
  https://github.com/Ephemeral-AI-Lab/layerfs/issues/340#issuecomment-6205574108.
- Effect: publication tooling compatibility correction; no app, product, SDK,
  skill, frozen input, Store or acceptance change. Original edit remains failed.

### E-032 — Revision 2 lead control generators failed before SDK execution

- Found: Build 1 resumed lead, before synchronizing revision 2 and before preparing
  the next W2 assignment. Evidence: `b1/agents/lead/out/revision2-sync-host-assembly-failure.json`
  and `prepare-w2c-generator-syntax-failure.json`; the latter pins the failed and
  changed generator sources. Both transcript copies identify their reconstructed
  capture provenance rather than claiming original redirected streams.
- Diagnosis: nested shell apostrophes broke the first Python source assembly;
  a separate nested newline escape broke the future assignment generator's AST.
  Neither reached an SDK import/call or created its intended output/worker folder.
- Changed follow-up: quoted heredoc assembly with syntax verification for the first;
  explicit `chr(10)` footer construction and successful AST check for the second.
  No product, SDK, skill, app or frozen-input change and no operation replay.
- Boundary clarification from the lead: malformed shell quoting also let zsh
  attempt the stray fragment `inspect` outside the intended wall-wrapped Python.
  It immediately failed command-not-found. The original tool-call argument remains
  in the conversation; `revision2-sync-host-assembly-boundary-supplement.json`
  preserves the clarification. This is an explicit wall-boundary deviation; do not
  claim every malformed fragment had the required wrapper. No SDK call occurred.

### E-033 — Browser fixtures observed the wrong request and used an invalid selector

- Found: W1d-036 failed both registered browser tests; I2b-052 separately failed
  before the intended transfer race assertion. Full replies remain in each owner's
  `out/calls/` directory; their Commit and unmount receipts remain adjacent.
- Diagnosis from owner review and retained exceptions: W1d's single injected issue
  GET failure was consumed by a new dependency-context read, while its log assertion
  included the expected anonymous `/me` 401. I2b's JavaScript selector used an
  unquoted numeric attribute value and Chromium refused the selector itself.
- Changed follow-up: W1d used an explicit matching-read fault window cleared before
  deliberate Reload and a post-login console boundary; W1d-051 passed both tests
  with 15 interaction groups and browser lifecycle cleanup. I2b corrected the
  selector at 055 before the distinct actual application witness at 057.
- Effect: original 036 and 052 remain failed. Their failures alone do not establish
  an application defect. The application failure at I2b-057 is A-020 below.

### A-019 — Canonical revision metadata caused an activity redaction notice

- Found: original W1c-114 last-good-source full-server run failed one activity
  assertion after the separately failed, unpublished 112 source operation.
- Diagnosis by the I2 owner: canonical issue/comment revisions were public metadata
  for known matching events, but omission from the event summary allowlist made the
  summary report redaction. The stored summary and SSE use the same sanitizer.
- Repair/proof: I2b repaired typed metadata handling at 128c4288... and recorded
  a generated build Commit 12bdb7bb.... I2b-033 passed 65 unique leaves, including
  the original eight inspection tests unchanged, event/privacy/reporting tests and
  five new canonical-revision cases. Stored events, SSE and inbox agree; malformed,
  unknown, wrong-entity and nested metadata remain redacted. This is an application
  repair, with no LayerFS change. Later W1d-056 also passed the original activity
  assertion while separately failing a route-inventory assertion.
- Qualification: original 114 remains failed. These scoped proofs do not replace
  the final main acceptance; exact full Commit IDs and all replies remain retained.

### A-020 — A delayed transfer preview restored an obsolete review

- Found: actual I2b-057 Chromium witness after correcting E-033's selector.
- Evidence: held real HTTP preview for the original project name and issue title;
  edited the current input document/name; released the old response; the obsolete
  valid preview reappeared and the explicit absence assertion failed. Commit 058
  and unmount 059 preserve the failed step. Owned/global browser counts after cleanup
  were zero. `retained-preview-witness-line.txt` keeps the owner-selected witness.
- Diagnosis: owner source review connected pending preview completion to obsolete
  input confirmation; a later commit could use newer input. The actual browser
  witness establishes stale preview restoration, without inventing a committed
  newer-document failure that was not executed.
- Disposition: I2 owns reviewed snapshot/version guards and a changed browser proof.
  At this entry that proof remains pending. No LayerFS, SDK or skill change.
- Later verification: I2b-062 passed 13 unique leaves, including the original stale
  preview assertion and a successful import exactly matching its reviewed snapshot.
  Expanded race boundaries were included in 068 full web 96/CLI 41 PASS. Original
  failed 052/057 remain unchanged; final main acceptance is still pending.

### E-029 — Shell expanded report glob arguments before the bounded program ran

- Found: root wave-four dependency-summary preparation, tool chunk `a201a4`.
- Evidence: zsh exited one with `no matches found` on an unquoted pattern.
  The Python program/wall wrapper never ran, so no original wall receipt or
  output directory was created. The tool transcript retains the failure.
- Changed follow-up: quote each literal pattern for the summarizer's own glob
  processing. Receipt 034-census-wave4-summary-r2 passed with exact coverage of
  305 candidate snapshots. No SDK call, source mutation or observation replay.

### E-030 — Report input handling materialized a whole daemon log

- Found: source review after the actual 5.38-GB observer stderr capture; no OOM
  or failed real-log analysis is claimed.
- Diagnosis: the reused LFT parser's text-input method reads/splits its complete
  argument. A new external fixture forbidding a whole daemon-file read failed
  on that boundary, retained in analysis-line-adapter-before.
- Fix: supply one unchanged retained line at a time to that same parser, with
  the original file attribution. The parser source/schema remains unchanged;
  original log bytes are preserved and hashed incrementally.
- Verification: the full changed analysis suite passed 17/17, including mixed
  prefixed LFT records, unchanged raw bytes, numeric decoder reuse, source
  provenance and storage reconciliation. Exact before/after tool sources and
  receipts are retained under issue340-control/report-preparation. This is
  report input handling, not a product memory-bound or performance claim.

### E-031 — Archive byte partitions exposed an old seal index calculation

- Found: external archive fixture while adding a byte budget for the actual
  multi-GB daemon files, before any real Build 1 archive was prepared.
- Evidence: sharded-archive-tests-v2 had three pass/one error. Part creation used
  the new explicit ranges, but seal still calculated fixed entry-count slices
  and correctly refused that mismatch. No real evidence archive was sealed.
- Fix: seal uses the same pinned start/end range from the immutable plan.
  The byte budget puts an oversized single file in its own part without rejecting
  or splitting it. Source hashes, exact coverage and unchanged-metadata checks stay.
- Verification: all four external tests pass, including exact payload coverage,
  a file larger than the budget, binary/symlink/hardlink cases, replay/missing-part
  refusal and same-size mutation with restored mtime. Real Build 1 archiving remains
  pending; original Phase A archive and source tool stay unchanged.

### E-028 — Live proof assumed null detail for an indexed binary edit refusal

- Found: root native R3 verification, receipt 032 and root-fix-proof-r3/calls/007.
- Evidence: actual oversized input returned TooLarge/null and a new history read
  proved no Commit. Binary read returned Binary/null. Binary edit correctly returned
  Binary with `{index:0}` from the ordinary single-change mutation adapter. Its
  typed-refusal assertion passed, then the root's null-detail assertion failed.
- Diagnosis: the probe conflated read detail with indexed mutation refusal detail.
  This is a proof expectation defect; no product, SDK or guide change was needed.
- Changed verification: inspect all original full replies; completion 033 checks
  those exact read/edit details and catalog entries, then observes history with
  only the one acknowledged synthetic binary-file Commit. No original operation
  is replayed. The 032 command stays failed; its replies remain unchanged.
- Effect: only root-sdk-proof-r3, forked from Init, was written. Crew application
  source was untouched. Fresh observer/lead Sandboxes and revision 2 settings were
  supplied before explicit B1 GO; no original selected client was reused.

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

- Later P1d deviation: final report discloses that its Commit messages omitted the
  frozen requested numeric sequence. Exact unique receipt/trace sequence remains
  retained. Preserve every actual new Commit message; derive operation identity by
  exact trace/receipt joins, not by inventing a numeric message prefix. Verbatim
  final report is 17,839 bytes, SHA-256
  `53dd77cde13e4f3c4a4d1717625297de0124579c5db4c942d5b89cc546627f80`.

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

- Root resume read deviation: attempted the SDK skill at an obsolete catalog path under `~/.codex/skills/layerfs-js-sdk`; cat returned NoSuchFile before SDK import. The actual listed repository `.agents/skills/layerfs-js-sdk/SKILL.md` and observe skill were then read successfully. No SDK call or application effect occurred.


## E-087 — Development checkpoint timing header mixed caller and SDK boundaries

Root source review found that the revision1 Store checkpoint CSV named its time
column `sdk_start_utc` although only the initial row used a raw SDK trace start;
later rows used the retained outer caller receipt start. Original table, sidecar
and generator remain retained. Revision2 uses `observation_start_utc` and an
explicit `time_boundary` per row, adds the already observed W-M2 checkpoint, and
is selected by RESULTS. Publication timings were already labelled caller timings.
Source: `/control/report-preparation/build-r3-development-tables-r2.py`, receipt
`b2-r3-development-tables-r2.*`; no SDK, application, product or measurement rerun.

### A-031 — Independent Work board-rank fixture selected the wrong insertion case

- Found: B2-r3 Work M2, W2 Exec58/Commit59 and independently W1 Exec65/Commit66.
- Evidence: `tables/b2-r3-development-failed-execs-r1.csv` and its SHA sidecar;
  W1 final NOTES retains the expected3/actual2 assertion and original failed run.
- Diagnosis reported by owners: random UUID ordering selected an end insertion,
  while the test intended an interior precision-exhaustion case.
- Fix: W2 used explicit ID-sorted interior neighbors at application LayerFS Commit
  `121992c86cc8ed74b5ffa53d88ad97de455fa22e06be6369ffd0e34e05785490b0`.
  No repository product/SDK/skill code or Git commit changed.
- Verification: lead's later W-M2 integration140 unique leaves passed. The failed
  invocations remain failed. This is application evidence, not a product fix.
- Numbering: a later note names the failed cycle's Commit59; its failing Exec is58.

### A-032 — Independent planning HTTP fixture changed an unused clock reference

- Found: B2-r3 W-M3, W2 Exec74/Commit75, original command exit1.
- Evidence: selected failed-Exec table and full W2-0074/0075 receipts; lead's
  current-run report retains21/22 HTTP cases at that failed snapshot.
- Diagnosis reported by owner: assigning `ctx.now` on a spread returned object
  did not change the context captured by the actual routes.
- Planned correction reported by owner: explicit historical fixture dates while
  retaining actual HTTP mutation coverage. Exact changed proof remains pending
  final W2 evidence at this checkpoint; later package passes are separate results.
- Effect: application fixture work continued, no LayerFS halt or product change.
  Commit75 records the failed cycle; Exec74 is the failing command.

### A-033 — Independent Chromium proof found an undefined JSX Fragment runtime

- Found: B2-r3 W-M3 real Chromium pointer-drag proof, W2 Exec96/Commit97, exit1.
- Evidence: selected failed-Exec table/source sidecar, full browser/console
  diagnostics in W2's retained receipt, lead097/098 source/fix metadata.
- Diagnosis reported by team: the L0 classic JSX build left `Fragment` undefined
  at browser runtime despite earlier build/package checks.
- Fix: lead changed its owned shared application `web/build.mjs` to the pinned
  Preact automatic JSX runtime in application Commit
  `1227fd7aa3bbf94874f8d9c81f1d49d7785527532ed7275d9b864abede9fb83e97`.
  This is application-only; no LayerFS/SDK/skill/native or repository product change.
- Verification: changed build/browser proof pending at this checkpoint. Original
  failure stays retained; the independent team owns correction and qualification.


### E-088 — Independent W2 receipt messages were materialized after sequence advancement

After Init, W2 disclosed26 early fs.apply/sandbox.commit raw input message fields
whose prefix/sequence differed from the actual published message. The complete
returned new Commit records retain the actual messages and heads. Original
receipts remain unchanged; `verbatim/b2-r3/W2-receipt-errata.json` is an exact
copy of the per-receipt mapping, SHA256
7e7e8b6cd294795f6b9a7736c3456d0d20e18324b15f42b60fc0df481932bcd5.
The worker corrected its runner before later calls, without replaying operations.
Root independently checked all26 original input/new Commit record message pairs
and heads in `/control/b2-r3-observation/W2-message-errata-verification-r1.json`,
SHA2562adb37c736cd9ab1ad04a4aadcb848bbc7f9abadc83e9f790e9e9d4e70b242fc.
This is host receipt metadata correction; no LayerFS/SDK/skill change occurred.

### A-032/A-033 verification update — Original failures retained, changed developer proofs passed

W2 final NOTES records the repaired historical-date fixture within the36-test
focused suite, then the full178-test package regression in Exec109. Rebuilt real
Chromium pointer drag passed in Exec119 at head
123cfe55dfab0e37fbd341f419b36d4180b6399e85b1b0cb8f41b1c92970c3f9cf.
The genuine new Workspace remount used mount114/Exec115/Commit116/unmount117,
with no install/reseed/config rewrite. Later changed web pagination/keyboard
checks passed30 leaves in Exec123; unaffected CLI13/server104/shared34 evidence
was reused for181 disjoint final developer leaves. These update the earlier
pending developer qualifications; full integrated final-main acceptance remains
pending. Source: exact `verbatim/b2-r3/W2-NOTES.md` and revision2 source manifest.


### A-034 — Independent signed-credential tamper fixture exposed noncanonical encoding aliases

Lead128's full P-M3 integration failed the server tamper assertion (140/141 server
leaves); CLI22/shared34/web38 passed. Commit129 retained the failed integration
head12bc704a02a31a54297b2ec942deac92b5e65e570dfc4ba8e58914d0c2c35a0368;
no publication followed that failure. Fresh P1c independently found that different
base64url text can decode identical signature bytes through unused padding bits.
It added canonical nonce/signature reencoding validation, deterministic byte-changing
tampering and five regression leaves at head
1290a3bce5fb30578e8f377680c397d6acf97ca9b67deb1533ced60f726c6dcc8f.
Targeted24/24 and server146/146 passed; changed full integration lead138 passed
240 unique leaves and process audit before publication141. Exact originals are
pinned by the revision2 failed-Exec table; exact diagnosis and changed proof are
in P1c's verbatim NOTES. Application-only correction; no LayerFS/SDK/skill change.

### A-035 — Independent People browser proof needed current DOM selection and readiness

P1b Exec110 failed Selenium option-attribute selection; its owner inspected the
current UI and changed the proof to select visible labels and assert actual values.
Diagnostic Exec118 then failed a stale row during token revocation. Bounded
readiness rereads replaced stale references; changed Exec123 passed all13 real
browser/smoke/restart/audit checks. Both original failures and their next Commit
outcomes remain pinned in revision2's failed-Exec table and verbatim P1b NOTES.
No operation replay by root or LayerFS product correction occurred.

### E-089 — Fresh People repair actor waited for its blank host folder

P1c was dispatched before the root-owned blank scaffolding existed. It reported
waiting and no SDK attempts. Root029 created only its new scripts/out/daemon/work
folders at07:57:03UTC, then confirmed availability; no source/hints/SDK were supplied.
No failed LayerFS operation, replay, existing-file reset or inferred delay duration.

### E-090 — Root metadata read guessed four-digit Insight receipt filenames

The first host-only read guessed I1-0028.json and failed before reading it; this
actor uses three-digit I1-028.json. Root enumerated actual files, then read their
exact existing names. No SDK/application operation or source mutation occurred.
The original command exit1 remains in the transcript. Future proof uses exact names.

### E-091 — Insight worker's first assignment read omitted the wall wrapper

The lead retained I1's disclosure that its initial assignment cat lacked the
required explicit wall timeout, although it used its own supplied cwd. No SDK or
mutation occurred in that read. It corrected subsequent commands. This remains a
procedural deviation, without a timing, product, or prior-run knowledge claim.


### A-036 — Independent Insight subscription SQL broke the syntax preparation gate

I1 Exec044 built the web bundle, then prepare-tests rejected the current I2
subscriptions.js line60, where nested single quotes surrounded SQL reason='watch'.
The following shared test command was NOT_RUN through its && chain. The team
retained failed Commit125fbe55292c732f830e6304e92231ce0bcd4920e7680363e10cabbf3a2ce576ed
and unmounted with empty LWW. Lead assigned the exact current-source quoting
repair to its owner I2 before changed verification. No main publication or
LayerFS/SDK/skill change. Changed proof pending at this observation.

A-036 repair update: I2 retained exact quote correction at Commit
12e456d23b099baed950f1728af791dd81bdd4dd5fcc05908d424f418a692db74a,
I2-053. Changed verification pending; original failure unchanged.


### A-037 — Independent query fixture expected a value offset for an unknown field

The lead retained I1's shared suite result63pass/1fail: foo: was rejected correctly
as an unknown field at offset0, while the test expected a missing-value offset4.
The owner changed the fixture to the actual supported label: field and offset6;
the changed shared suite passed64 leaves. Exact failed receipt will be indexed
in the final population. No LayerFS/SDK/skill correction or root application input.

### A-038 — Independent Insight CLI checkpoint preceded its command registration

I1 Exec058 passed build/prepare159files, shared64, own search/filter server23 and
web6. Actual CLI search/filter tests failed4/4 because the I2-owned command map
was absent. Commit12ad7b6be82c8a8532c9cd9c21c890bb52b0257a55e0fab572c230029f56040b89
retained the failed checkpoint; empty LWW and terminal unmount. The lead assigned
real map registration before changed verification. Changed CLI proof pending;
no main publication, unchanged retry or LayerFS product defect claimed.

A-036 changed preparation update: I1 Exec058 reached prepare-tests159files and
shared/server/web execution after I2's quoting repair. The separate CLI failure
is A-038, not a repeated syntax failure.


### A-039 — Independent Insight CLI helpers tried to parse plain help output as JSON

The lead reports that both Insight workers retained normal --help plaintext
JSON.parse fixture failures. Owners corrected only their testhelpers to respect
the actual help contract, then changed CLI proofs passed. I1's final own CLI
proof is I1-073/Commit074/unmount075, completing63 unique new leaves across its
packages; I2 reports two CLI leaves within its24-test checkpoint. Exact original
failed receipt identities remain for the final full-population index. No root
application input, unchanged retry, or LayerFS/SDK/skill change.


### E-092 — Root candidate-wave summary selected a non-census batch JSON

Root038 used batch-*/*.json, which included summary.json lacking a Commit ref,
and the host-only summary exited1 with KeyError before creating its output.
Root inspected actual files and changed the selector to batch-*/commit-*.json.
Root039 then summarized the23 new censuses; root040 reconciled all79 distinct
candidate refs across three waves. No SDK/census was replayed or data relabeled.
The failed invocation and original summary generator remain retained unchanged.


### A-040 — Independent query suggestions moved the Search button during a real click

The lead reports that I1's retained actual Chromium failure occurred because
query-editor blur removed suggestions and moved Search between pointer-down and
pointer-up. I1 fixed its owned editor layout/blur behavior; changed real Chromium
proof I1-117 passed. The earlier failed Exec107/UpToDate108/unmount109 remains
retained. Original intermediate diagnoses/fixtures also remain in actor evidence;
final exact full-population indexing pending. Application-only behavior fix,
without root design guidance or LayerFS/SDK/skill change.


A-036 through A-040 source-index update: selected failed-Exec table revision3
now pins actual I1 Exec44/53/58/68/96/102/107/112 and I2 Exec69/98, with their
actual immediately following Commit/UpToDate. Full selected prefix has17 rows,
through lead154/I1117/I2103 and all closed actors. A-037 is I1-053; A-038 is058;
A-039 includes I1-068 and I2-069. Remaining browser/transfer diagnoses stay
pending the owners' final NOTES; no shared cause is guessed from exit status.


### A-041 — Independent transfer CSV test fixture had a quoting syntax error

Lead's current-run ledger identifies I2 Exec098 as a CSV quoting syntax fixture
failure. Its owner changed that fixture in101; changed I2-103 passed22 actual
transfer/dashboard cases including real transaction-abort rollback. The original
098 and next Commit099 are pinned in revision3's failed-Exec table. No root
application guidance or LayerFS/SDK/skill change. Earlier browser cookie/reload/
keyboard fixtures remain separate from A-040's real production layout fix; exact
owner report details stay for final verbatim indexing.


### A-042 — Independent compound-query web fixture selected an operator before rerender

The lead reports shared73/server31 passing, then web57pass/1fail because the
new compound-builder fixture selected an operator before the DOM update. The
original128fad52... snapshot is retained; CLI was NOT_RUN through &&. Owner
changed the bounded readiness check before new verification. Exact full receipt
and changed result remain for final owner indexing. Lead's separate tools4
actual Search-submit selector adaptation passed syntax only and is held for
integration; no browser or behavior pass is inferred from that source change.


### A-043 — Independent import preview CLI flag was absent from the boolean parser

I2 actual usability proof Exec123 passed15 of16 new cases and failed the import
CLI --preview behavior. Lead identified the existing application dispatch parser's
boolean Set missing 'preview', then transferred ownership of that one entry to
I2 before changed verification. Root verified actual Exec123 exit1, Commit124
head12bdbecbed378d2f8bcb8e8e04440eb59887b791e557efc6d0372ed7a32edb6646
and unmount125. Original receipts unchanged; changed proof pending. No root
design hint or LayerFS/SDK/skill/native correction.


A-042 final owner correction: verbatim I1 NOTES supersedes the earlier chat
inference about DOM attributes/rerender. Exec129 had57web pass/1fail and Exec134
had browser0pass/1fail because fixture value/CSS option lookup did not actually
select >= despite visible text. Changed visible-text selection and rendered-
preview synchronization passed Exec139; expanded real browser operations passed144.
Do not treat the earlier inferred DOM-attribute cause as established.
A-040 final owner detail: key-release/state diagnostics102/107/112 remained
separate original attempts before the actual blur/layout fix and117PASS.

### A-044 — Independent browser cookie fixture retained its initial unauthenticated document

I1 Exec096 passed actual process restart1 and failed browser1. Its fixture changed
only the URL hash after cookie insertion, retaining initial unauthenticated app
state. The owner forced full document navigation before later changed browser
proofs. Original096/Commit097 remains in revision3's failure table; verbatim final
I1 NOTES supplies the diagnosis. No root application hint or LayerFS/SDK/skill change.

A-043 changed verification update: lead reports I2 Exec140 build/prepare196 and
full affected server216/web66/CLI31 all passed,0fail/skip/cancel/todo, with source
Commit12a900491d670c5a1517c17b8652f9c34f264135e608b07affb61ee22ef5a3a978.
Further date-edge/transfer proof and full-main acceptance still pending.


### E-093 — Independent I2 custody classifier counted defunct entries as live

I2 Exec149 returned1 because its first classifier counted every Chromium process-
table entry as live. Its physical/hash output remains without relabeling the
command PASS. Diagnostic154 found8chromium/2crashpad/7esbuild, all STAT Z with
parent1, and no live app/browser processes. Logs preceded close157; container
removal ended those entries. Exact final NOTES and root closure proof retain the
distinction. No LayerFS/SDK/native change.

### A-045 — Independent transfer validation tightened a reviewed calendar/UTC edge

After package checkpoint140, I2 tightened impossible-calendar/non-UTC import
timestamp admission. Changed145 passed all12 transfer tests including that edge
and all3 insight audit modules. Unaffected earlier package evidence stays separately
pinned; lead178 then passed387 combined leaves at the final source. Source-review
application work; no original failed test or LayerFS fix is invented.

### E-094 — Root report projection used an obsolete text anchor

Root's first I2/publication report edit failed ValueError because it searched
Dependency metadata: after that heading had become Dependency metadata waves.
Only valid verbatim manifest revision5 had been created before the failure; all
GLOBAL/RESULTS/BUGS writes were held until later anchor validation and did not
occur. Root inspected current text, reused the existing hash-checked manifest
without recreating it, and applied corrected projections in separate bounded
commands. No SDK, app or census was replayed; the original failure is retained.


### A-046 — Watched relation deletion mutated the DB then activity returned500

W1b's actual browser Exec068 found a defect in the published Insight integration:
a stored after_json string 'null' was truthy, chosen before the parsed before
snapshot, and sourceIssueId was dereferenced on null. The DB deletion had already
occurred when the API returned500. Lead transferred narrow activity fallback
ownership to W1b because I2 was permanently closed. First fix129fc01... made all3
strengthened browser leaves pass, but W1b097 retained HTTP13/15 because a second
listActivity parse site remained. That site was then fixed before changed proof.
No LayerFS/SDK/native defect or input change; original failures stay failed.

### A-047 — Canonical relation ordering omitted the opposite issue's activity feed

Changed W1b102 HTTP11/12 proved watched blocks DELETE200/feed, then exposed that
symmetric relates used canonical source ordering and omitted the other endpoint's
feed. Lead assigned matching sourceIssueId OR targetIssueId after both-endpoint
visibility, plus deterministic endpoint/revocation regression. Changed proof
pending at this observation. Earlier387-package/28-smoke passes are historical
scope evidence; they do not qualify this newly discovered behavior.


A-046/A-047 changed developer verification: W1b's final focused HTTP12/12 and
full affected server228/web76 (including3realbrowser)/CLI33/shared73 all passed
at12b986573337391d3bfaaa5466f1a30ce72ca6f703583810b5fd23c7d8b7e77b7b.
This candidate has not been integrated/published yet; original failures and the
published source's historical387/28 passes retain their original identities.

### A-048 — Existing canonical Markdown code delimiters missed mention-exclusion cases

Lead's own source review found shared Markdown handled only single-backtick
inline code and exact triple fences, letting multi-backtick/tilde/indented code
text enter mention extraction despite the existing ignore-code contract. It
assigned bounded W06 to the same still-open W1b before close: extend ONE canonical
safe render/mention path for variable code delimiters and nested block semantics,
with real HTTP/preview regressions. This is source-review work; no failed original
test is invented. New behavior/proof pending, no dependency/padding/LayerFS change.


### E-095 — Root resume selectors and report-script preparation failed locally

After context recovery, root selected RUN/lead/LEDGER.md instead of the actual
RUN/agents/lead/LEDGER.md, then searched RESULTS for a GLOBAL-only heading.
Both bounded reads failed before mutation or SDK work. A nested Python heredoc
then failed syntax checking while preparing a report script; a subsequent
invocation found no script. No report or RUN write occurred. Root inspected
actual paths/text and used a separately saved corrected script. No application
operation or metadata census was replayed. Receipt progress inspection now
selects scalar method/status fields, without application source output. No
information from these failures was sent to the independent team.


### A-049 — Planning gesture and compatibility regressions during successor work

W2b retained actual failures: native drag pointercancel cleared the transfer,
then a second drag fixture reused elements before board refresh; targeted
pointer ownership and rendered readiness fixes preceded later passing browser
proofs. Exec070 server240 passed/web85of86; intervening075 Python quoting error
remained failed; changed080 web86 passed. Its paged sprint response broke the
existing CLI scope shape (080 CLI32of33);084 restored scope and added scope-page,
086 CLI33 passed. Later W1b157's missing name-field scenario came from hash
navigation before authenticated listener readiness; changed132/134 fullweb106
passed. Original failed package results remain failed in both final NOTES.

### A-050 — Persisted local outbox content survived current-access revocation

Fresh P1d reported GET /me/outbox returned persisted subject/text/notification IDs
after project grants or organization membership were revoked, while GET /digests
reconstructed current-visible content. Lead authorized narrow reuse of canonical
visibility/rendering and positive/revocation/session-boundary HTTP proofs.
Application review finding; changed proof pending, no LayerFS defect asserted.

### A-051 — L0 CLI review found false confirmation and output/config edges

Lead's own current source review found explicit --yes=false retained a truthy
string, human output emitted terminal controls, and config replacement wrote an
existing credential file before chmod. It owns the L0 spine files and prepared
concrete fixes while preserving streamed transport. No original test failure or
passing verification is invented; application proof remains pending.

### E-096 — W-M5 Commit label copied an older passing test count

Lead209 raw four TAP summaries pass35/244/89/106, total474, with no failures,
cancellations, skips or todos. Manual Commit210 message says473/server243.
The lead appended a correction; root independently read both original metadata
records. Raw209 is authoritative; original message is preserved and no command
was replayed to repair its label.

### E-097 — P1d initial host assignment read omitted the wall wrapper

The fresh successor retained that its first explicit-cwd host assignment read
omitted wall.py. Lead reports all later commands bounded. This procedural
deviation remains explicit, without a claim of perfect command compliance or an
inferred prior-run exposure/product mutation.


### T-007 — Excluded unused I2b startup read the repository catalog skill

I2b's bounded bootstrap command read env.json and the external repository SDK
skill instead of supplied SKILL_DIR, despite the explicit frozen boundary. It
stopped with0 SDK calls/mounts/app mutations. Own trace is absent and out empty;
the exact command/chunk84d3dc is retained in its2490-byte note and metadata. The
aggregate output was truncated; exact read-time bytes/hash/UTC are unavailable.
Root's later hashes differ (repository4d027e... versus standalonec30a51...), and
are not backfilled as read-time identity. No skill contents were forwarded.

Root permanently excluded the failed startup, paused application work through
unused-custody reconciliation, and authorized fresh fork:none I2c using only
clean current-run inputs. No I2b context/content/application work was accepted.
This is a failed startup and disclosed replacement, not a clean actor or a
product-fix continuation. If any downstream contribution is found, reassess the
run immediately. Disposition proofSHA
b5d48dd7300280db238e1dc25f7cbc284e043c89ea3c54f8120b7ab1b6231816.

### E-098 — Parent overlapped discovery close/create; Busy followed teardown effects

Parent262 close started09:53:08.347Z; it launched263 create09:53:09.353Z before
polling completion. Close returned Busy09:53:09.676Z; create completed09:53:09.687Z.
This violated serial discovery and close-before-replacement instructions. Both
streams had been captured before close; originals262/263 remain unchanged.

Root read-only Docker inspect found oldfdd50 container absent and newac3fad
running. The old sandbox.record was absent, only ownership.lock retained; the
project service record still named the unchanged root observer. Unchanged native
source stops/deletes/removes the own record before the final project guard, which
can return Busy under competing create. This source-order inference is distinct
from instrumented timing; exact kernel termination time remains unavailable.
Root reconciled terminal effects without another mutation/close replay.262 stays
Busy, never relabelled Closed. Fresh I2c then used the already-created unused
client with clean input. No product/SDK/skill/freeze change was made. ProofSHA
6dd7a1c550f7ca18b8fbfe995e8ae4b54c599458a95c2b1b0a18c3544d9784d8.
Final analyses must retain this failed SDK close, unused-startup roster and
explicit environment lifecycle evidence rather than assume every close passed.


A-050 changed verification: final P1d NOTES retains actual baseline103 (3tests,
1pass/2fail), outcome104 UpToDate/unmount. Shared visibleDigest repair106 filters
current membership/project access before outbox rendering and pagination while
preserving stored history. Focused11316checks and final169server258/173CLI38/
177people7checks PASS at12bd703bbf3139f7080d921d0b74c7073f56437d2231417e66572b3a0cec374e29.
These are separately scoped proofs, not a full-app acceptance claim.

### A-052 — Session cookie issuance and clearing used inconsistent policy

P1d retained baseline156 actualHTTP4tests/1pass/3fail: localHTTP issuance passed,
configuredHTTPS lacked Secure, and clearing lacked canonical attributes. Shared
sessionCookieOptions now derives Secure from validated configured baseUrl and
supplies httpOnly/sameSite:strict/path to signup/login and all three clearing
paths. Focused1654checks and finalserver258 passed. This inspects actual HTTP
Set-Cookie under both configured protocols; it is not a TLS transport/browser
deployment proof. No alternate auth framework, proxy-header trust or dependency.


E-097 final-report clarification: P1d records both its initial own-cwd pwd and
full assignment cat omitted wall.py; later commands were bounded. These two
permitted read-only calls did not perform SDK/application work. Preserve both
procedural omissions rather than describing only one.

### E-099 — New L0 browser fixture failed during Chrome startup before auth assertions

Lead271/278/283 each returned exit1 under separately changed browser startup/
profile fixtures. The lead reports the first failed at CDP renderer startup,
then initial navigation with a custom profile, then another changed profile
ownership proof. Pure auth11 and actual runtime5 pass separately. All failed
commands were committed/unmounted and remain failed; no timeout increase or
LayerFS defect is asserted. Fixture/profile diagnosis is still in progress.
Root observer generated no Store traffic during these browser attempts.


E-099 changed follow-up: lead283 reached initial auth flows, but hash-only
navigation did not install the delayed-login interception. Changed298 reached
application DOM but failed a stale-heading readiness assertion. Changed303 passed
all10 actual auth/deep-link/signup/overview/bootstrap flags after deliberate
full-navigation and exact-DOM readiness fixtures. Pure11/runtime5/CLI54 proofs
remain separately pinned; original failed commands are retained unchanged.

### A-053 — W1c draft adapter lost edited labels

W1c050 focused11/12 retained an actual editor-browser failure. The new adapter
called issueForm on a live form containing original labels and edited labelIds;
original labels won. The fix respects live labelIds and adds actual-form additions
and clears regressions. All seven browser modes passed055; finalweb123 passed081.
Hierarchy035 focus-effect readiness,055 payload basename collision and timestamp
fixture mistakes were separate retained test defects, corrected before061/065.
The final delayed-label inspection guard passed077/081. Exact source chronology
and all failed streams are in the verbatim W1c report, not relabelled successful.

### A-054 — I2c cadence proof fixtures failed before changed verification

I2c045 preparation found a new test newline literal. Changed050 passed16 focused
leaves.057 actual browser hit StaleElementReference during preference rerender;
changed063 installed a delayed-fetch hook after the API module captured fetch.
After inspecting api.js,067 installed interception before module load via CDP;
069 real browser passed.073 affectedserver268/web109/CLI40 passed; final preference
event consistency repair077 passed079 focused15/fullserver269. Prior web/CLI proof
is reused only for unchanged source families. No failed operation was replayed
without inspection, no timeout raised and no LayerFS product change made.

E-095 later read-only root lookup: two guessed control-script locations did not
exist. rg --files identified the actual report-preparation table generator;
commands were read-only and no SDK, application work or census was repeated.


### A-055 — Combined depth source retained a saved-search browser failure

Lead309 coherent integration passed CLI59/server282/shared89, but web137/138
failed the existing actual pinned browser's Saved “Browser saved query” wait.
The dump retained an open save form and no error; the exact query/DOM/stack remain
in309. Root makes no cause claim from that snapshot. Failed result was committed
310 at121442056cf10efdb8b94ce5c503ad4ecbfa5f4d59e51ce67a5497f66ce521a946,
unmounted311, and not published. Lead assigned fresh I1b ownership for diagnosis;
P1e receives the same source with this failure explicitly pending, never as PASS.
Integrated9350 production lines still leaves650 below the floor. No LayerFS
product defect or final qualification is inferred.


### E-100 — Root supplement selector test compared noncanonical macOS temp paths

The new root-only R3 evidence adapter retained the tested exact immutable SQL
argument joins and added explicit folder selectors for the current run layout.
First external check passed7/8: expected /var temporary roots differed from the
selector's resolved /private/var roots. Actual behavior correctly canonicalized
paths and rejected escape symlinks. Root preserved both failed source files and
receipt, changed only the expected fixture to resolve its root, then8/8 passed.
Adapter source was unchanged by that correction. No SDK/application command,
product change or metadata census was repeated. Final adapter/test pins and both
outcomes remain under CONTROL/b2-r3-evidence.


A-055 diagnostic follow-up: fresh I1b's passive and full-web diagnostic138/138
passed at the retained integration source. Lead explicitly keeps the original309
intermittent cause UNRESOLVED; this passing diagnostic is not a fix or a relabelled
309. It authorized actual HTTP/persisted saved-filter browser assertions and
removal of an ineffective post-load fetch wrapper, then a changed covering proof.

E-095 metadata-wave receipt lookup initially used RUN/receipts rather than the
existing RUN/root folder. A bounded listing identified the originals; no SDK,
application, census or earlier command was replayed for this read-only lookup.


### E-101 — Lead328 syntax count label differed from raw327

Lead's scripts-only A13 census review passed build/syntax246 and actual smoke28.
Commit328's descriptive label typed252 before the lead inspected full327 output.
Original raw327 and Commit328 remain unchanged; append-only
out/lead0328-label-erratum.json corrects the count to246. No command was replayed
to repair the label. Coherent application floor/final acceptance remain open.

### A-056 — People administration browser proof failed before changed diagnosis

Fresh P1e's focused16 HTTP leaves passed, but initial browser065 passed2/6 and
failed4. Complete failed cycle/streams remain retained; source/DOM diagnosis is
lead/worker-owned and pending. No passing browser result or product cause is
inferred from the separate HTTP proof. Main remains W-M5.


A-055 final bounded I1b result: changed browser proof asserts actual UI POST201,
canonical response equality with list/GET persisted fields and unchanged applied
results. Focused8/fullweb138 passed at the tested identity. Only two test files
changed; zero new leaves/production LOC. Final1267942825507b2816acc5344e7f4a5f4952641789c5e996708dabfd0c134cf554
removes inspected pycache only. Exact cause of original309 remains UNRESOLVED;
no application defect repair, missing POST or native validation failure is
inferred from its incomplete diagnostic dump. I1b final report preserves this
limitation and the original failed result/receipt hash.


A-056 follow-up: lead reports P1e084's later real-route/audit browser failure
was a post-initialization fetch-interception fixture; the application client had
already captured fetch. Changed interception-before-module CDP proof is pending.
Original065/084 failures and source/DOM diagnoses remain preserved separately;
no later PASS is inferred yet.


### E-102 — P1e own payload/hash helpers followed the wall-wrapped shell command

P1e final NOTES explicitly corrects its earlier blanket host-wall claim: several
own-host payload generators and a final hash helper were second shell statements
after a wall-wrapped here-doc cat. Only cat was bounded. It reports immediate
completion and effects restricted to own payload/evidence files; SDK/app/Bash/
build/test operations retained115/110 wrappers, with no uncertain result, timeout
or replay. This is a procedural hard-rule miss, retained openly, not perfect
command compliance. No outside input access or product/SDK/skill change arose.
Root does not backfill unobserved host durations.

A-056 final scoped proof: original065 passed2/6 after build/syntax251 passed;
074 diagnostic passed0/3;084 passed1/2. Auth cookie/hash-only startup readiness,
option attribute selection, test-only JSX React fragment and post-init fetch
interception were fixture causes. Corrected077/087 and actual089 then passed;
final107's explicit web selection passed144 while excluding inherited search.
Final099server293/103CLI59 passed at1267e38de0152c086bedca6a46fc96d07edeaeb844dca3ee87a6c0d36bf6931ad0.
The original ignored testServer now override proved no equal timestamp; corrected
TEMP triggers assert equal timestamps/different content revisions before the
stale-no-event checks. Prior passing fixture is not credited for that property.
All originals and scope distinctions remain in the exact P1e report.

### E-103 — Root attempted to credit a superseded helper fixture receipt

After interrupting the root-only terminal helper for an application slot, root
checked current source hashes against its earlier19-test PASS. The assertion
failed before any write: the helper had preserved both tested files as
.pretest-r1, then changed both current files before interruption, without a new
test receipt. A bounded top-level inspection identified this state. Root verified
the old snapshot hashes and original output hashes, explicitly marking current
sources NOT_VERIFIED and actual R3 terminal execution NOT_RUN. No tests or SDK
operations were replayed, no partial PASS was recorded. Resume changed syntax/
fixture verification when that helper's slot is available.


E-103 changed follow-up: after an application slot became free, the root-only
helper resumed, completed current syntax and21 fixture checks in a fresh r2
receipt, and returned a final source manifest. Root checked its current executed
source hashes against r2. Old r1/source snapshots remain unchanged. The template
still says NOT_READY and actual R3 terminal verification is NOT_RUN; this passing
fixture result cannot substitute for final resource evidence.


### E-104 — I1c host read preceded pending receipt publication

While server Exec081 was still pending, a host-only read of out/calls/I1c-081.json
raised FileNotFoundError (tool chunk66881c). No SDK/application effect occurred.
The actor polled the existing session to terminal completion before dependent
reads or calls. Exact occurrence UTC is unavailable; it is not invented. Exact
NOTES and out/host-read-sequencing-error.json retain the failure. No SDK replay.

### E-105 — Parent provisional I1c cycle count required append-only correction

Parent's provisional worker projection guessed nine cycles. The actor's exact
90-receipt final report and root closure proof establish ten. Original projection,
receipts and report stay unchanged; out/I1c-resource-projection-erratum.json gives
the correction. No SDK operation was repeated to change a descriptive count.

### A-057 — I1c initial browser custody proof failed with unresolved cause

Focused059 passed11/12 leaves. The custody browser timed out awaiting a held POST
after actual double-click; traffic contained no POST, while native validity,
events and geometry were not recorded there. Cause remains UNRESOLVED; no native
validation, click or guard defect is inferred. Changed062 fixture added passive
native diagnostics and explicit current valid-form/suggestion readiness, without
forced submit, assertion weakening or timeout increase. Changed068 passed1/1
with actual UI POST201; final full web154/server296 passed. These do not explain
059 or original309. Separate071 source guards and their final covering proof
remain separately identified in the exact I1c report.

E-095 further read-only lookup: root attempted nonexistent I1d/LEDGER.md after
successfully inspecting selected report pins. FileNotFoundError is retained in
tool chunk85a209; no SDK, app command or mutation was replayed. Root uses the
known current trace and receipt paths for later observation.


### E-106 — Root failure-table inventory required heterogeneous envelope handling

The first r4 aggregation stopped at361/366 lead outcomes because five terminal
SDK error envelopes lacked result (NoSuchPath219/226/237/238 and Busy262).
A read-only diagnostic additionally assumed trace.kind and raised KeyError.
Changed r5 returned PASS, but its printed closed populations exposed missing
P1e calls and smaller totals. Root rejected that output before report selection:
P1e stores sequence in id/traceStep; closed filtering still excluded error
outcomes. Changed r6 cross-validated exact actor sequence and every closure
cardinality, then stopped before table write on missing caller clock aliases.
Inspected originals use I1 started/ended and W2 startUtc/endUtc, already supported
by the frozen primary normalizer. Changed r7 uses those exact aliases, verifies
all1,750 closed-worker calls plus pinned lead366/I1d129, and emitted54 nonzero
Exec rows with actual following Commits. No timestamp is invented. Failed scripts,
receipts, partial source copies and rejected r5 table remain unchanged; r5 has a
separate REJECTED marker. No SDK/app command was replayed. The final complete
run inventory is still pending; selected current prefixes are explicit.


### E-107 — Current-only custody inherited two stale closed-worker status rows

Root inspection of custody024 found I2c and W1c still RUNNING with selected
clients, despite their previously verified closures. The global ledger and
closure tables correctly said closed. No resource was reopened. Fresh025 derives
finished rows from all15 normal closure proofs and active mount counts from
pinned lead375/I1d148 completed prefixes, then renders only current-run fields.
Original024 source/render remain retained; no SDK or app replay. This is stale
current-state bookkeeping, not outside-run context input or a new application
failure. Future custody updates must cross-check all closed rows, not only the
new successor. The observation is sequential, not atomic global state.

E-095 retained read-only lookup also used the wrong report-preparation directory
for record-wave7-progress-r1.py; rg --files found its actual b2-r3-observation path.
No SDK/census operation was attempted or replayed by that failed read.


### E-108 — Root pin-check assumed the wall-runner receipt schema

The concurrency helper's explicit bounded fixture receipt uses status/exitCode,
elapsedSeconds and explicit20/30 timeout fields. Root initially indexed a
nonexistent timedOut field from the generic wall-runner schema, causing KeyError
before any bookkeeping write. The nine file pins had already matched. Root
inspected the exact receipt, then changed the metadata check to its actual
fields and verified the20-test output. No timedOut field is invented and no
fixture, SDK or application command was replayed. The failed bookkeeping wall
receipt and source transcript are retained separately.


### E-109 — Lead387 descriptive syntax count differed from raw386

Lead reports UpToDate387's label typed syntax253; exact386 says254, focused1/1
and production9,612. Original receipts/label stay unchanged, with append-only
out/lead0387-label-erratum.json; no command rerun for the prose correction.

### E-110 — Lead400 local InvalidInput occurred before SDK trace admission

Lead400 passed an options object as fs.list's positional pageSize and received
InvalidInput(pageSize must be1..1000, pagePos nonnegative safe integer). Its exact
caller receipt is retained (11:29:28.210Z–.213Z); no corresponding trace step
exists. No mutation occurred. The lead inspected explicit main.jsx401/styles402
instead of replaying the guessed call. It stays a caller-local validation refusal,
separate from traced public/internal/operator calls and daemon timings. The
unchanged primary normalizer will report this unjoined raw receipt. Root's
terminal evidence helper is extending a pinned explicit pretrace whitelist;
unknown unjoined sources still reject and no daemon trace is fabricated.

### A-058 — Lead delayed-resource heading regression and fixture correction

Lead reports initial370 actual browser failure at unchanged product source:
issue h1 was present, startup title persisted, active BODY. Its isolated shell
focus/title repair passed delayed-heading/focus behavior in378, while an abandon
fixture wrongly expected literal Overview instead of the actual current heading.
Fixture-only384 corrected that expectation and covering386 passed focused1/1.
Original370/378 failures remain distinct. Exact source/count/covering identities
are retained by the lead and will enter its final verbatim report.

### A-059 — Lead native cross-tab session-return regression

Lead reports initial391 actual second-tab native Sign out completed, while the
first tab retained protected issue/authenticated navigation after return. Failed
cycle392/393 is retained. Bounded event/manual session-check ownership source394
then passed nine pure cases and focus proof in396; the session browser failed at
its second-tab Sign out target. Stable footer status CSS403 and passive native
target/path/status diagnostics were added, but covering405 also returned nonzero.
No exact396 cause or final session PASS is inferred. Lead owns changed-source
review and complete covering evidence; this is application work, not a LayerFS
or frozen SDK change.

### A-060 — I1d native suggestion geometry evidence is separate from old failures

Lead reports I1d179 independently measured an arriving query suggestion moving
Save by40.5px and losing the unchanged pointer target. It authorized a narrow
QueryEditor reserved-control-slot change. Original failed browser attempts remain
retained and current covering proof is pending. This new observation does not
explain original309 or I1c059, whose causes remain UNRESOLVED. The worker's final
report will supply exact source/fixture identities and outcome.


### E-111 — Root copied I1d NOTES before its final writer finished

Root copied a closed-client I1d report16,671bytes/SHA dc9c6d04c0dd652be9052c2b5da46eaf5117748d02fab5c82a3dcd147ac95c93,
then verified201 exact SDK joins/26 cycles/logs-before-close/no later SDK. While
preparing the final report manifest, a source-pin assertion caught the actor's
subsequent16,773byte report/SHA981ec8484bdaec2f278a384fa970ee5037221f12941870842a4df39195d0ee6d.
No final manifest was written. Root incorrectly proceeded to the dependent table
command despite that failed assertion; it failed FileNotFound on its absent
configuration before any table write. Both failed receipts and provisional report/
proof remain retained. Root requested the final confirmed hash through the lead,
will select a new revision after the writer finishes, and never overwrites the
old copy. A closed SDK client does not imply its host report has stopped changing.
No SDK/application operation was replayed. Current selected manifest still has15
normal final reports, pending stable I1d selection.

A-059 follow-up: lead405's actual expiry/signin destination and manual200 checks
passed, while its viewport-y geometry assertion failed. Changed fixture isolates
footer height/relative-control geometry from whole-document movement, with no
product change after405. The combined414 run added later evidence, kept separate.

### A-061 — Combined source failed People passive-unmount ownership test

Lead414 passed frozen size10005, build/syntax264, shared89 and server296, then
web176/177 failed the People harness immediate abort-after-DOM-unmount assertion;
CLI was not reached through &&. Failed415 Commit/416 unmount remain retained and
no candidate publication occurred. Lead420 source review found passive useEffect
teardown while current-operation admission only compares ownerref/operation.
It routed the narrow lifecycle teardown repair to freshP1f with currentP1e report,
exact current source and original414 failure. No root application hint or code
is supplied. Final repair/covering/acceptance pending.

E-110 further source lookup: lead418 guessed request-state.js and received traced
NoSuchPath, then followed the actual harness import419/forms.jsx420. This is a
separate traced refusal from caller-local400 and did not mutate/replay state.


E-111 final selection: parent confirmed I1d FINAL_ANSWER16,773bytes/hash. Root
created a new exact I1d-NOTES-r2.md/custody-r2 and closure-r2, preserving all older
copies/proofs. Selected manifest-r13/closed-r8 include16 normal workers and1,951
joined calls/222 cycles/32 streams; I2b remains separate.

### E-112 — Root conflated logical call sequence with trace row count

Custody026 preparation assumed lead sequence423 implied423 trace rows, despite
local InvalidInput400 occurring before trace admission. Its assertion stopped
before rendering; the empty prefix directory and failure receipt are preserved.
Changed027 snapshots/counts actual completed trace rows, not logical sequence,
then verifies16 closed actors before rendering. No SDK replay or invented trace.

### E-113 — I1d host-only cache/TAP task preparation failures

Final I1d report retains945522 reading a cached own payload before SDK065 copied
it;7a78e2 diagnostic JSON parsing of TAP failed on an escaped backslash-hash before
creating task041;51e5f0 then failed opening that absent local task before any SDK
method, and d76a95 read missing own caches. The worker explicitly created041
before subsequent known reads171/172. No SDK outcome was uncertain or replayed.
Exact chunks/outcomes remain in out/host-deviations.json and the tool transcript;
unknown occurrence UTC is not backfilled. This is separate from seven retained
nonzero application Execs and the proven geometry repair.

E-110 branch collision: lead421 reused existing people.6 and received NameTaken.
It retained the refusal, then422 created uniquely named people-action-lifecycle-p1f.1
from exact current int-final.1; no existing Branch reset or blind operation replay.


E-110 terminal-adapter preparation completed: v3 syntax and36 external fixtures
pass,23 current/history/input pins checked by root. Exact pinned caller-local400
entry is ready; generic normalizer unchanged. All unknown unmatched raw receipts
still reject, no missing traced receipt is allowed, and no daemon/network timing
or SDKClosed is invented. Actual R3 normalization/terminal verification NOT_RUN.

A-061 original-source P1f023 regression failed0/1 with four retained frame/
MutationObserver cases: DOM removed/passiveSetupfalse yet abortedfalse, forbidden
completion/effect or retained-hook reentry; scope supersession correctly aborted.
024UpToDate/025unmount retained. Narrow layout-effect teardown repair and covering
proof are pending; no final PASS is inferred. Lead CLI430 subsequently passed62/62
at the combined candidate after414 had not reached it; scopes remain distinct.

### E-114 — Root metadata script failed before any write

A single-quoted multiline progress string caused SyntaxError at compile time.
No ledger/report write or SDK/application operation occurred. The next saved
script also stopped before writes on an obsolete ledger anchor; root inspected
the actual block and selected its existing boundary. Root corrected the
string in a saved source file before its changed invocation. Original tool output
is retained; no measurement or application command was repeated.


A-061 final repair: exact P1f report/closure proof confirms the two hook substitutions,
changed focused people5/fullweb177 passes, production10,005->10,005(delta0), all
seven cycles and both streams before sole48Closed. Four DOM-removal cases extend
the existing lifetime leaf; they are not four extra leaves. Original023 retained.

### A-062 — First formal smoke fixture collided with captured exclusive outputs

Formal A01–A09 passed at main326ed3ae. A10 lead474 failed15pass/2fail checks because
the correct CLI refused EEXIST on data/cli-attachment-output.bin. Failed475 Commit
and476 unmount are retained, no blind cleanup/reseed/retry; A11–A15 NOT_RUN. Lead
479–482 source review also found fixed data/insight-project.json downstream and no
invocation artifact namespace. It selected a fixture-only cryptographic prefix,
actual paths in modeJSON, fresh wx input/CLI outputs, and explicit same-path
EEXIST/unchanged-bytes assertions. Existing files/DB remain. No production package,
dependency, permission or deadline change is selected. Corrected main must publish
before fresh acceptance-final-2; no original result is relabeled. Root supplies no
prior-run or application guidance.


A-062 changed fixture identity:484 Commit1285d973.../roota2038915... changes exactly
four scripts and one doc, no package production/test/dependency file.486 passed
four syntax checks/counter10,005,487UpToDate/488unmount.489 published new Layer
32911c5f.../empty overwrite/nontruncated,490 forked acceptance.2. New full15-row
attempt is required by the frozen new-identity contract; original first attempt
retains A01–A09PASS/A10FAIL/A11–A15NOT_RUN. No unchanged failed call replay, removal,
reseed or force occurred. Final covering acceptance remains pending.


### A-063 — Second formal web proof sampled paging requests before passive setup

Formal2A06 lead512 failed176/177,513UpToDate/514unmount retained; A01–A05PASS and
A07–A15NOT_RUN. All four rapid-unmount cases passed abortedtrue/passiveSetupfalse/
zeroeffects/reentry, so the product teardown repair remained proven. The later
fixture asserted a current read immediately after Page1/loading appeared, before
the passive fetch began. Lead517 fixture-only change establishes the initial
old-scope request and waits exact current /new-query-c?limit=1 within the same
existing8s bound after keeping the immediate Page1/loading assertion; no stale
cursor/latecompletion/rapid-unmount assertion is weakened.519PythonAST+counter10005
passed;520UpToDate/521unmount;522 published new main329f2eae.../emptyoverwrite and
523 fresh acceptance.3. No package production, workload or deadline change. Full
third attempt remains pending, no earlier failure relabeled.

### E-115 — Lead report-generator preparation failed before file creation

Lead reports host-only Python quoting failure in tool chunkf94226 while preparing
a final report generator. It occurred before creating its file, with no SDK/app
effect. Original tool error remains retained; final generator was not run then.
Occurrence UTC is not invented. This is separate from formal512's application
proof and caller-local SDK400.


A-062/A-063 final disposition: all15 rows of the third formal attempt passed at
main329f2eae. Earlier formal1A10 and formal2A06 failures retain original outcomes;
no source change occurred during formal3. This does not infer causes for earlier
unresolved browser failures.

### E-116 — Root final-source controller selected immutable main for mount

Root126 mount(main) returned NoSuchBranch at12:09:25.575–25.619UTC, detailnull,
without a Workspace or mutation. Prepared controller had overlooked the immutable
main Layer versus mountable Branch distinction. Root inspected retained refusal,
SDK fork source and successful lead523/524 contract before changing the controller.
New127 explicitly forks root.final-source.1 from the exact accepted Layer, then
mounts/reads frozen counter+metadata/CommitUpToDate/unmounts:5calls PASS. Original
controller/receipt preserved. No blind replay, application write or product fix.
Root diagnosis also retained failed read-only guessed-path reads and an overly
broad truncated file listing; no SDK side effects arose from those host errors.

### E-117 — Final evidence adapters and host metadata errors

The first final primary normalization retained2792/2796 joins. Four lead Commit
step labels379/397/406/415 are202/204/203/209characters, while frozenSDKtrace.js
retains200UTF16codeunits plus an ellipsis. The generic normalizer's complete-label
join therefore left those four original receipts unmatched, alongside separately
known caller-local400. The first generator failed its completeness check before
the terminal verifier ran; its source/output/receipt remain unchanged. A changed
explicit four-row adapter requires unique actor/sequence/method, exact SDK
truncation prefix, identical immutable CommitID/result and valid caller clocks.
Thirteen bounded fixtures passed, then retained r1 output was qualified in a fresh
derived r2 output. Generic normalizer/SDK source and original results were not
changed, and no RPC was replayed. The unchanged v3 terminal verifier ran once and
passed2796joins/305cycles/19selectedClosed in19.65335475seconds within85/110bounds.
Caller-local400 and parent262Busy remain separate explicit exceptions.

Root-only analysis preparation also retained a KeyError while inspecting the
excluded I2b report's differing logical-role schema; a changed read used its
explicit original projection, before any primary analysis write. Observer
telemetry decoding wrote complete CSV/sidecars, then optional PosixPath metadata
failed JSON summary serialization. A changed metadata-only follow-up read those
retained outputs and completed; no log, SDK call or application test was replayed.
Final-report draft preparation retained an unused stale patch-context rejection
before any write and a later no-op source-text assertion failure before output;
source inspection and removal of that no-op assertion preceded changed follow-ups.
All original tool output, scripts, diagnosis records and failed receipts remain
in the root support evidence. These are evidence-tool failures, not product fixes
or changes to original application verdicts.

### E-118 — Final analysis schema corrections and projection erratum

The source-pinned analysis-host-failures-final-r1.json under the final analysis
tables consolidates eight retained host-only failures, including the two already
described in E-117. Further mapper preparation assumed a generic terminal status,
command text where normalization deliberately retains an opaque hash, a string
where a retained payload was structured, and a lazily evaluated roster fallback
that Python actually evaluates eagerly. Source/schema inventory preceded changed
follow-ups. Completed public/census/install mappings were reused in a fresh view;
302 retained full command strings and three opaque summaries stay distinct.
All-agent installation completeness is unavailable;19 lead-only observed censuses
are explicitly partial. The unchanged operation/storage algorithms were not
replaced by guessed command data.

The helper deliberately stopped its own quadratic duplicate-membership analysis
after22.462615seconds, before its110second ceiling, then diagnosed the source and
selected a changed linear membership check. No other owner or SDK/application
operation was interrupted or replayed. A separate inline read-only comparison
inspection had an unmatched-parenthesis SyntaxError before any execution/write;
a saved metadata follow-up completed the comparison. Original receipts, sources,
partial outputs and diagnosis records remain retained. Final validation passed40
CSV tables and484 source/output pins; the primary/operation results did not change.

Root also reported58 Branches in an earlier coordination message without counting
the final array. The retained final collection and generation table establish62
Branch identities, including integration/acceptance/root-proof Branches. An exact
source-pinned erratum corrected that projection before final report publication;
no raw receipt or product state changed. This is not62 lane generations.

### E-119 — Final documentation checker used Python's default CSV field limit

The first root authored-document/table check stopped before producing its result
because Python's default CSV reader limit is131072characters. Source diagnosis
identified the unchanged B1 refusal detail at row20:134428characters, column8 in
b1-refusals.csv and column9 in its combined-population projection. Both original
table SHA values remain unchanged. The original checker source and failed wall
receipt are retained. A changed reader explicitly permits complete existing fields
using the platform integer limit; it neither crops nor rewrites evidence. The next
check uses a fresh output path. No SDK, application test or measurement was replayed.

### E-120 — Root checker expected the wrong documentation status wording

The second root check parsed all222 CSVs,159 local links and119 copied-source
records, then rejected the final report because its guard expected invented
wording, "Archived historical evidence". The report already used the exact
documentation-policy banner: "Archived; retained for historical evidence only."
Root read that policy and preserved the failed guard/source. Its separately
prepared README had the same invented wording and was corrected before staging.
The changed guard now requires the exact policy banner in both documents. The
original report bytes and all application/evidence outcomes remain unchanged.

### E-121 — Staging classification and Git CSV line-ending normalization

The first root pre-stage allowlist assumed tables contained only Markdown/CSV/
JSON/images, overlooking retained Python generators and small controller stdout/
stderr receipts. It failed its file-type assertion. Dependent staging commands
still ran because root had not gated their execution on that exit status. No
commit or publication occurred. Inspection confirmed all587 staged paths remained
inside the owned issue340 documentation scope, with regular files and bounded
compact evidence; no production path or unrelated work was staged.

Git also warned that repository line-ending settings normalized CRLF CSV bytes
in the index. Those bytes must match recorded evidence hashes. A scoped
issue340/.gitattributes now disables text conversion only for tables and verbatim
reports. Root re-stages those files under that changed policy and verifies every
staged Git blob against original working-file bytes before committing. Original
table/report bytes and their hashes are preserved. All failed staging checks and
the preliminary tree identity remain evidence, not a final commit comparison.
