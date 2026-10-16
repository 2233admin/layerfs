# Crew independent Build2-r3 final report

The application is complete. All fifteen frozen acceptance steps passed on `acceptance.3`, with **624 distinct meaningful passing tests** and **10,005 production lines**. All seventeen normal worker Sandboxes and the lead Sandbox are closed. Historical failures and protocol deviations remain retained; this is application qualification, with no claim of a clean protocol run, performance comparison or released LayerFS capability.

Final main Layer: `329f2eae880636d0ad253fd53827e4f3d7e6c25bf356726cadc56a134278a8087b`. Its source is Branch `lead-people-observation.1`, Commit `1265ae579d077140ca62cca80b1d6a0ffc2a4609abf10755c9f336768f2a728710`, root `0e4fb9111aea7c84790838e9174c4ef062a7a00b3175936906e84a8cf7fc3014`. The final acceptance head is `126de1a51d38bea94eae673832fe72f7856b86c37dec18200e6b79368681c91ca3`. Publication recorded no overwritten paths.

| Package | Production LOC | Passing unique tests | Failed / skipped / cancelled / todo |
| --- | ---: | ---: | --- |
| Shared | 940 | 89 | 0 / 0 / 0 / 0 |
| Server | 3,810 | 296 | 0 / 0 / 0 / 0 |
| Web | 4,391 | 177 | 0 / 0 / 0 / 0 |
| CLI | 864 | 62 | 0 / 0 / 0 / 0 |
| **Total** | **10,005** | **624** | **0 / 0 / 0 / 0** |

The frozen counter remains byte-identical at SHA-256 `f73b6acb7d073e90631936ad62be8705a9c2a2f93c7e2097e7ca4f5c062f12ab`. Its 208 production files have a maximum physical size of 228 lines. The complete fifteen-largest-file source reviews match the final audit hashes. The report maps all specified milestones and maintained depth through 48 source-to-passing-proof rows; focused reruns, suite containers and browser subcases are not counted as additional tests.

| Acceptance scope | Final evidence |
| --- | --- |
| A01–A03 | Pinned clean dependency install, same-step dependency census, production build and syntax preparation passed. |
| A04–A07 | All four disjoint package suites passed: 624 unique leaves. |
| A08–A09 | Frozen production-size gate and documented seed passed. |
| A10 | All 28 smoke checks passed, including actual CLI, streaming attachments, export/import, SSE and digest behavior. |
| A11 | Six persistence checks passed across a new server process without reseeding. |
| A12 | Actual browser login, real pointer board drag, compound search and inbox read state passed; persisted results were verified. Four required actions plus their wrapper produce five raw checks. |
| A13 | Twelve audit checks passed, including the 366-file maintained identity census, frozen counter, file ceiling, route/documentation checks and production bundle. |
| A14 | Three checks passed in a new Workspace and path, using the executable CLI and existing data/configuration without install, reseed, chmod or configuration rewrite. |
| A15 | No retained or live application/browser process remained. |

The first formal campaign failed A10 because its fixed CLI output path already existed in the captured filesystem. The CLI correctly refused the overwrite. A fixture repair retained those files and allocated one recorded artifact namespace per invocation, while requiring actual downloads/exports and deliberate same-path refusal checks. The second formal campaign failed one asynchronous request-observation assertion after its rapid-unmount regression had passed; a fixture repair now observes the exact admitted request before inspecting its URL. Each repair was published before a new acceptance Branch ran the complete frozen sequence. Both failed campaigns and their unrun tails remain unchanged.

Earlier application and procedural evidence remains explicit: the demonstrated people unmount defect was repaired by its lane owner; original lead309/I1c059 missing-submit causes remain unresolved; the excluded I2b startup contributed zero SDK or application work; and parent262 returned Busy during a discovery-ordering overlap, with separately observed terminal effects rather than a successful Closed reply. Original worker notes, label errata and host deviations are preserved.

The lead's final process snapshot found zero unexpected live processes and retained 1,792 defunct entries separately from the daemon and current audit controls. All 75 lead Workspace cycles are terminally unmounted. Both original lead daemon streams were saved before the sole successful lead close, and no team SDK or application work followed it. The separately owned observer remains with `/root` for final Store observation, export, original logs and its own close.

[Full machine report](/Users/yifanxu/.codex/issue340-independent/b2-r3/agents/lead/REPORT.json) contains all fifteen commands and receipt paths, the complete test catalog and counter JSON, feature bindings, every merge/publication/install census, exact resource custody, all eighteen worker notes and the lead notes verbatim. [Lead NOTES](/Users/yifanxu/.codex/issue340-independent/b2-r3/agents/lead/NOTES.md) provides the complete handoff. [Final command-gate report](/Users/yifanxu/.codex/issue340-independent/b2-r3/agents/lead/out/acceptance-final-3/REPORT-command-gates.json) and [worker-note manifest](/Users/yifanxu/.codex/issue340-independent/b2-r3/agents/lead/out/HANDOFF-CUSTODY-final-workers.json) provide direct evidence indexes.
