# Crew insight lane — I1 and I2

> **Status:** Current planning checklist; no release candidate exists.

Read SPEC.md and WORKER-PROMPT.md. I1 and I2 are fresh distinct workers with overlapping
natural work on the SAME insight.<generation> Branch. Respect lead-assigned interfaces,
shared events and migration ranges. Successors retain role ownership; the lead
integrates and never takes over this lane. Complete server, usable web, CLI,
meaningful tests and user/API documentation in every milestone.

| Milestone | I1 owns | I2 owns |
| --- | --- | --- |
| I-M1 | Shared filter lexer/parser/evaluator: status:, assignee:@me, label:, priority>=, project:, created>/updated< dates, quoted free text, AND/OR/NOT, parentheses, precedence and positioned parse errors; tokenized prefix search index from events with field/recency ranking; search API/highlights, suggestions page, CLI search | Event persistence and activity foundation for work/people events; agree event payloads and outbox contract; activity views/API groundwork and tests while paired I1 works |
| I-M2 | Complete query/search integration, access filtering and index update/delete behavior; saved filters personal and team-shared with usable UI/API tests | Activity feed per issue/project/user/org; watch issue/project, automatic creator/assignee/mention subscriptions; read/unread inbox and bulk marking; per-user email digest batching in outbox; SSE server/client and live UI; CLI feed and inbox |
| I-M3 | Finish saved filters and query suggestions, CLI/filter documentation and acceptance; own search-side integration fixes | Dashboard counts by status/assignee/priority, weekly throughput and sprint burndown with real SVG web charts; project JSON/CSV export; validated JSON import with id remapping preserving issues/comments/labels/relations; CLI export/import |

Every result and event delivery obeys people's organization/project access policy and
personal token scopes. Use the shared event bus and single outbox; invitations/reset
links and notification digest entries coexist. Confirm work event and data interfaces
with W1/W2 through the lead; missing lanes can use agreed interfaces but report what
awaits integration. Do not silently produce empty results to hide unavailable data.
SSE has bounded cleanup and tests for disconnect; no server process may survive a
bounded command. Escape highlighted output and CSV content safely. Imports validate
references and perform an atomic remapped write, with useful errors for bad documents.

Tests cover grammar precedence, all filter operators, quote escapes and parse offsets,
ranking/prefix updates, permission filtering, feeds, subscription rules, mentions,
inbox states, digest batching, SSE delivery, dashboard/burndown calculations, JSON
round trip and invalid import, CSV escaping, web state and CLI calls. Target roughly
50 meaningful leaf tests across this lane; overall ≥120 passing and complete features
remain binding. Supply acceptance checks to lead, record actual Commit/test results,
and retain every worker/successor's final NOTES.md verbatim.
