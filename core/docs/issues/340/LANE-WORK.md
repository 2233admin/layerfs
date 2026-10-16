# Crew work lane — W1 and W2

> **Status:** Current planning checklist; no release candidate exists.

Read SPEC.md and WORKER-PROMPT.md. W1 and W2 are fresh distinct workers with overlapping
natural work on the SAME work.<generation> Branch. Respect the lead's task plan and
shared interfaces. Successors preserve role ownership; the lead integrates and never
takes over these features. All three milestones include server, usable web pages,
CLI commands, meaningful tests and API/user documentation. Keep real product depth;
no omitted acceptance behavior or LOC padding.

| Milestone | W1 owns | W2 owns |
| --- | --- | --- |
| W-M1 | Issue schema and API: project-scoped sequential keys, title/markdown description, status, priority, assignee, estimate, due date, parent issue; labels and issue label assignment; issue list/detail/edit pages; CLI issue | Projects: key/name/description/archive; per-project ordered workflows with todo/active/done categories; project CRUD pages; workflow editor; CLI project; coordinate issue/workflow contracts with W1 |
| W-M2 | Safe markdown subset and escaped raw HTML; comments and @mentions; blocks/duplicates/relates issue relations with correct directional semantics; comment/relation web controls and CLI issue actions | Stable board ranking and moves within/across workflow columns; kanban API and usable browser drag/drop; bulk status/assignee/label edits with validation and permission checks; board UI and CLI board |
| W-M3 | Complete issue/detail/label/comment/relation usability, validation, event contracts and CLI coverage; own acceptance checks; help resolve actual issue-side integration defects | Sprint create/start/complete, scope changes, carry-over unfinished issues and daily burndown data; streaming attachment upload with configured size limit, SHA-256 and exact-byte download; sprint/attachment web pages; CLI sprint and board |

Both roles emit actor/org/entity/action/before/after/time events for every mutation and
consume people's permissions for every route, including project access for guests.
Agree payloads with insight for search, mention notifications, dashboard and transfer.
Do not define a second outbox or second permission framework. Allocate migrations via
lead; preserve other lane router/nav/shared edits. Invalid input returns stable errors
and 422 field details; lists use opaque cursor pagination. Include accessible empty,
loading and error states and complete form behavior, not static demonstration pages.

Tests must exercise issue fields/numbering/parent constraints, workflow validation,
label membership, safe markdown/mentions, relation semantics, ranking stability,
bulk-edit atomicity, sprint transitions/carry-over/burndown and attachment bytes,
limits/hash/errors. Add HTTP tests and web state/CLI tests against the real server.
Target roughly 50 meaningful leaf tests across this lane; overall gate is at least
120 passing tests and all features, never counting duplicated assertions as new tests.
Each role supplies its acceptance checks to the lead and reports actual tested
Commits. W-M3 is incomplete until the full work lane passes after permissions and
insight integration. Record every worker's final NOTES.md verbatim.
