P1 final NOTES — b2-r3 independent Crew people lane

Agent /root/b2_r3_lead/p1; parent and TEAM_LEAD_TASK /root/b2_r3_lead. Started 2026-10-16T06:44:45.906746+00:00; closed 2026-10-16T06:52:40.576Z. Own folder /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1. Branch people.1. Selected Sandbox sb_d6c0e19f5d8047d2fd1957ee6406ccff571d064e1fc284e7fe3a65ed1eadc798 was used for every SDK call and Bash mount, then closed permanently. No subdelegation or collaboration inventory was used.

DONE P-01 / P-M1. Final lane head 127b7945370309e32098d5f15f0c6746a059e3d186a71352be0b2a83a8476f1918. The lead reported integration and publication with source int-people-m1 Commit 1287442268de0a3d8bcc8ba6b087d3d66adf9d6848a3ded7ca1e5b5d9f460f8097 and main Layer 329a467b424c5a6b2e3f298a021488b1b63cb615678ac568e323b9d25727882a0d; conflicts[], lww[], overwrote[]. Lead integration all-package tests also passed 43. I performed no Branch merges or publication.

Implemented behavior:

- Organization create, rename, list mine and detail; create assigns owner. Membership add/list/change/remove supports owner/admin/member/guest. Only owners appoint or manage owners; removing or demoting the last owner returns 409. Membership removal cleans up organization team membership and project guest grants.
- Teams create/read/update/delete, unique organization-scoped names, member add/list/remove, membership validation and organization isolation. Team changes require owner/admin.
- One shared permission implementation with explicit role and token-scope policy. Unknown permissions fail closed. All currently existing protected auth/people/SSE routes use this service. Health/signup/login are public. Current SSE remains L0's 503 stub pending insight.
- Project guests use explicit grants. Their policy is read/comment on granted projects, with no issue edits or project administration. Server endpoints manage project grants after work's projects table exists. Pure SQLite permission tests cover role/project/scope matrices now; actual work HTTP guest checks remain for the successor.
- One shared outbox table and enqueue helper for invite/reset/digest. No invitation/reset/digest delivery flows are implemented yet. Outbox contents persist, normalize email, return parsed payloads and reject invalid kinds/email.
- Web organization creation/list, member roster/add/role controls/removal, rename form, team list/create/detail/edit/delete and team member controls. Existing shared widgets provide loading/error/empty/busy states. Team description can be cleared. Organization selection updates store.organization. Navigation exposes Organizations and organization Members/Teams links.
- Shared schemas already provide invitation/token validation and web state helpers for successor flows. Their presence is not a claim that those features exist.
- docs/api-people.md documents implemented endpoints and the exact cross-lane service/outbox contract. docs/architecture.md, docs/api.md and README link the implemented access model.
- scripts/checks/people.mjs contains public M1 HTTP smoke and restart read assertions. It sets ids.orgId and ids.teamId and creates clients.member and clients.guest with the coordinator's normal credential/cookie shape. It currently adds existing members directly; the successor must extend it to invitation acceptance and account-security/token/CLI checks.

Stable integration contract:

ctx.permissions.assertOrg(req,orgId,permission='org:read') returns raw membership; assertProject(req,projectId,permission='project:read') returns raw project; assertSelf(req,userId=req.user.id,permission='self:read') returns user; scope(req,permission) checks authentication and exact/namespace/global token scope. Assertion methods throw AppError. membership(userId,orgId) returns raw membership or null; canOrg/canProject return booleans; projectIds(userId,orgId) returns accessible ids. Boolean methods do not check token scopes, so list handlers must call scope and filter before pagination. projects requires id and org_id. project_guests has project_id,user_id,created_at. Work must remove project guest rows on project deletion.

Permission names are self:read,self:write,org:read,org:manage,members:manage,teams:manage,invites:manage,audit:read,project:read,project:write,project:manage,issue:write,comment:write,attachment:write,insight:read,insight:write,export:read,import:write. Token scopes may be exact names, namespace wildcards such as project:*, or *. Scope never expands role/project access.

Single outbox schema: outbox(id,org_id,user_id,kind,to_email,subject,text_body,payload_json,created_at,sent_at). org_id/user_id are nullable; kind CHECK permits invite/reset/digest. ctx.enqueueOutbox({orgId,userId,kind,toEmail,subject,textBody,payload}) returns camelCase metadata with parsed payload; exported enqueueOutbox(ctx,input) lives in people/outbox.js. publicOutbox converts a raw row. Existing table/insert helper must be reused by I2 and successor security flows. Sensitive invite/reset links must not be emitted into audit/domain event payloads or public reports.

Validation and proof:

- Build+prepare: npm run build && npm run prepare-tests, exit 0; final syntaxFiles 56. JSX compiled by esbuild before tests.
- All four packages at first checkpoint: shared 9/server 28/web 5/CLI 1, total 43 unique passing leaf tests, zero fail/cancelled/skip/todo. These totals include 4 existing L0 tests and 39 new people tests. Final source changes reran affected server 28 and web 5 successfully; unchanged shared 9 and CLI 1 evidence reused. Do not count reruns as new tests.
- Public smoke: organization/team persistence, member/guest administrative denials and owner-retention checks passed. The first smoke runner invoked read assertions within one process. A separate final runner then used an actual server child, stopped it, started a NEW server process on the same temporary database, and passed all 3 smoke/read checks. Receipt explicitly reports newServerProcess:true. Temporary data was removed and both child processes stopped in finally. No acceptance credentials are printed.
- Frozen counter crew-production-loc-v1: total 942, CLI 101/server 484/shared 135/web 222 at final head. out/loc-final.json retains per-file counts. This is an interim application census, far below the required 10000; no final size gate is claimed. Tests are 43/120 interim. Source Commit snapshots are LayerFS Commits; no Git commit was created by P1.
- Cache state unknown; all timings diagnostic, no benchmark/cache/performance claims. Global Disposable/WAL/synchronous=OFF and LAYERFS_CONSTRUCTION_WORKERS=1 preserved. Durable NOT_RUN — disabled by owner until explicit reauthorization. No dependency installation or version change by P1; L0 dependencies reused.

Meaningful new tests (39 unique leaves):

/packages/shared/test/people.test.js (8):

- owners and admins can manage people
- members can edit work but cannot administer
- guest requires project context and cannot edit issues
- unknown role and permission fail closed
- token scope exact namespace and global matching is explicit
- scope validation rejects arbitrary namespaces
- organization and invitation validation normalize and bound fields
- personal token schemas deduplicate scopes and bound expiry

/packages/server/test/people.test.js (16):

- organization creation returns owner and lists only memberships
- organization rename persists and validates fields
- outsiders cannot read organization or its roster
- membership creation detects duplicate and missing accounts
- member reads roster but cannot rename or appoint members
- last owner cannot be demoted or removed
- admin manages members but cannot appoint or alter owners
- owner can transfer ownership before leaving
- teams support create read update and delete
- team names are unique inside organization
- team accepts only organization members and prevents duplicates
- removing organization member also removes team membership
- guest can read teams but cannot change them
- team routes enforce cross organization isolation
- list pagination returns stable cursor and rejects malformed cursor
- mutations emit complete organization and team events

/packages/server/test/permissions.test.js (9):

- project guest may read and comment only on granted project
- members may work in all organization projects but not manage projects
- admins and owners manage projects with explicit organization boundary
- accessible project ids filter guests and outsiders
- assertProject returns raw project and rejects missing ids
- API scope and user role must both permit project actions
- organization assertion rejects unauthorized and scoped access
- self assertion rejects other users and unauthenticated requests
- unknown permission never passes a wildcard token

/packages/server/test/outbox.test.js (2):

- shared outbox persists all supported kinds with parsed payload and nullable ownership
- shared outbox rejects unknown kinds and malformed email before insertion

/packages/web/test/people.test.js (4):

- people organization URLs encode identifiers and match parameter routes
- people controls expose owner assignment only to owners
- invitation state prioritizes accepted and revoked above expiry
- token state and validation details are human readable

Existing L0 tests reused: shared validation/signup test 1; server HTTP signup/session/CSRF/logout test 1; web router/state subscription test 1; CLI actual whoami against server test 1. No new actual people CLI command test exists yet because those commands belong to P-M3.

LayerFS history and lifecycle:

- 12008349f0f095dc7a3675ec89f21e95ac3ac7457993dc46e4e078042ca152f367: P1 001 P-M1 organizations teams permissions outbox and forms (exit 0); receipt out/calls/P1-0025.json; ended 2026-10-16T06:48:11.410Z.
- 12130b2e90f723d7315333d105021878905dd1385bede9a3559c5de9067c37f5f3: P1 002 P-M1 auth permission audit and contract tests (exit 0); receipt out/calls/P1-0038.json; ended 2026-10-16T06:49:16.789Z.
- 12948663a971533b9252958a49fe7700a6a003a82ac19f7ab8f091d3f3301720ae: P1 003 P-M1 build and prepare tests (exit 0); receipt out/calls/P1-0041.json; ended 2026-10-16T06:49:21.908Z.
- 1207d4f6724ec930559f0f04a91a51e0b4f9a4b00ff70b1d0f3881cdd8956c39c2: P1 005 P-M1 smoke contracts and final permission checks (exit 0); receipt out/calls/P1-0049.json; ended 2026-10-16T06:50:53.583Z.
- 127aca55b88fca32ea27bec8f07702b7abd0e09dc197dd9b5eb8c10acba0cb618f: P1 006 P-M1 final build and prepare tests (exit 0); receipt out/calls/P1-0052.json; ended 2026-10-16T06:50:59.319Z.
- 12b1cd8182b5ad8aab9c0c459e92b470907f3bd194b327dc4a704733cfa487783e: P1 007 P-M1 public HTTP smoke (exit 0); receipt out/calls/P1-0056.json; ended 2026-10-16T06:51:05.811Z.
- 127b7945370309e32098d5f15f0c6746a059e3d186a71352be0b2a83a8476f1918: P1 008 P-M1 HTTP and new-process restart smoke (exit 0); receipt out/calls/P1-0060.json; ended 2026-10-16T06:51:33.572Z.

First source Commit 12008349f0f095dc7a3675ec89f21e95ac3ac7457993dc46e4e078042ca152f367. First own Bash mount at 2026-10-16T06:49:20.177Z: workspace 20d0d04b607cf5a8e502da45d32408f1931a3b48964cf01b753a8b0eda2d7d36, path /workspaces/3, namespace 3, receipt out/calls/P1-0039.json. First Bash Commit 12948663a971533b9252958a49fe7700a6a003a82ac19f7ab8f091d3f3301720ae.

All 6 own Workspaces completed mount→exec→Commit→unmount, including UpToDate test outcomes. No conflict/lww/displaced paths, HeadMoved, Busy, Unknown, Failed, timeout or automatic retry occurred. One pre-creation fs.read of /scripts/checks/people.mjs returned expected NoSuchPath, retained as out/calls/P1-0024.json; the file was subsequently implemented. No operation replay or discarded Workspace occurred.

Each SDK attempt has a unique full receipt at /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/out/calls/P1-nnnn.json, including complete inputs, input hashes, selectedSandbox, trace label, timestamps, full result/error, mount ids and all Exec streams/exit fields. Trace is /Users/yifanxu/.codex/issue340-independent/b2-r3/trace/P1.jsonl. There are 67 receipts through final close. Save counters describe whole Saves and are not attributed exclusively to dependencies or any single file.

Evidence paths:

- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/NOTES.md
- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/out/calls/
- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/out/calls/P1-0067.json (Closed)
- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/out/final-history.json
- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/out/loc-final.json
- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/lifecycle.json
- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/daemon/stdout.log
- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/daemon/stderr.log
- /Users/yifanxu/.codex/issue340-independent/b2-r3/agents/P1/daemon/receipt.json

Own scripts/core.mjs and wrappers, payloads/m1.json, m1-followup.json and m1-final.json retain exact implementation payloads. Scripts and raw receipts contain private test payloads and stay in this own folder.

HANDOFF remaining P-02 / P-M2:

- Implement secure email/role invitations with one-use hashed tokens, expiry, accept/revoke, matching recipient account and correct membership/project guest grants. Reuse the shared outbox and add protected public HTTP outbox read surfaces. Extend invitation web flows, errors and explicit pending/expired/revoked/accepted states. Do not return link credentials in audit events.
- Extend L0 sessions for account session listing/revocation; password change/reset using existing scrypt helpers, one-use expiring reset links and the shared outbox. Define appropriate current-session/all-other-session invalidation and test replay/expiry/old-password behavior.
- Apply permissions to every integrated work/insight route, filtering guest lists before pagination and checking resource organization/project relationships. Work/insight were absent from this Branch when reviewed. Coordinate the actual guest-inside/outside-project public HTTP smoke with work using clients.guest and ids.orgId.

HANDOFF remaining P-03 / P-M3 and final audit:

- Hashed personal API tokens with create/scopes/list/revoke/expiry, plaintext once and ctx.authenticateToken(token) returning token auth with kind:'token', user and scopes. Reuse hashToken/publicUser. Immediate revoke and scope isolation need actual HTTP/CLI tests.
- Persist/query security audit records with filters and sanitized before/after metadata, using standard domain events. No audit log exists yet.
- Complete invitation/token/audit/session/password admin/security pages and CLI src/commands/people.js groups org/team/invite/token taking the established ctx contract. Add real server CLI integration tests and token-authenticated acceptance commands.
- Existing organization/member/team web lists currently expose only the first page. Implement usable opaque-cursor next/back browsing. Improve per-field action errors and deliberate destructive-action controls. Split complex long JSX views into focused readable components as maintenance requires, without changes solely to raise LOC.
- Extend scripts/checks/people.mjs smoke/restart/audit to every people feature. Current audit explicitly documents only M1 contracts and is not an all-route permission qualification. Replace that note with actual final route coverage. Extend README/API docs and meaningful tests. Final full-product gates remain ≥10000 maintained production LOC and ≥120 unique passing tests, plus all acceptance modes.

Resource closure: all 6 own mounted Workspaces unmounted, zero owned application/browser processes, own Sandbox closed. Daemon stdout/stderr were saved BEFORE close; close receipt out/calls/P1-0067.json returned Closed. lifecycle.json records end and zero resource state. The main observer service is owned by main and was not touched. This client is finished permanently; successor needs a newly assigned Sandbox/client and the Branch generation supplied by the lead.
