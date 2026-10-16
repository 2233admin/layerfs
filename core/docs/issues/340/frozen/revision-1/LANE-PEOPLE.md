# Crew people lane — P1

> **Status:** Current planning checklist; no release candidate exists.

Read SPEC.md and WORKER-PROMPT.md. P1 owns the complete people lane, including applying
the shared permission contract to ALL existing routes from every lane. Complete usable
server, web and CLI behavior, meaningful tests and API/user docs. The lead integrates
and never takes over people features. A successor P1b may resume a precise handoff;
every final NOTES.md remains verbatim evidence.

| Milestone | Finished scope |
| --- | --- |
| P-M1 | Organization create/rename/list mine; organization membership owner/admin/member/guest; teams and team members; shared permission names and enforcement middleware; organization/team forms, lists and role controls; agreed project-level guest access contract |
| P-M2 | Email/role invitations with secure outbox token link, expiry, accept/revoke and correct membership; apply middleware to every existing auth/people/work/insight route; guest access only to allowed projects; session list/revoke; password change/reset via outbox link; web flows and errors |
| P-M3 | Personal API tokens create/scopes/list/revoke, hashed at rest and recognized by auth/CLI; security audit events and filtered audit queries; complete member/team/invitation/token/audit admin pages; CLI org/team/invite/token commands |

Coordinate stable interfaces early so work and insight call one permission system.
The single outbox is shared with insight's notification digests; agree schema and
entry kinds. Root L0 owns signup/login/logout/me and scrypt; extend its sessions/auth
without a second user/session implementation. Mutations emit standard domain events
and security actions have audit records. Session cookies are httpOnly SameSite=Strict;
state-changing cookie requests require X-Crew-Request: 1. Tokens store only hashes,
expose the plaintext once, support scopes and revoke immediately. Reset/invite tokens
expire and cannot be reused. Keep actor/org/project boundaries explicit in every API.

Tests cover role and project access matrices, owner/admin/member/guest denials,
cross-organization isolation, invitation expiry/accept/revoke/replay, team membership,
session revoke, password change/reset, token scopes/hash/revoke and audit queries.
Use HTTP tests and CLI against the real server, plus web routing/state tests. Target
roughly 30 meaningful leaf tests; all finished app tests must total at least 120.
Include guest denial outside a project and token-based commands in lead acceptance.
Re-audit new work/insight routes after each integration before declaring P-M3 done.
Do not wait idle for them: finish a milestone, report precise outstanding integration
work, save logs, close and hand off for a successor wave when the lead schedules it.
