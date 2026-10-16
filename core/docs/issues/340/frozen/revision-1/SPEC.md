# Crew application specification — #340

> **Status:** Current planning checklist; no release candidate exists.

Crew is a team work tracker: organizations plan projects, track issues on boards and
sprints, discuss them, search them and follow their activity. It is built by a team of
agents through the LayerFS JavaScript SDK. This file defines **what** is built. How the
team divides and integrates the work is in [TEAM.md](TEAM.md); how the main agent runs
the campaign is in [ROLLOUT.md](ROLLOUT.md).

The specification describes product behavior. It deliberately does not plan merges or
conflicts. Where lanes meet (permissions on every route, events from every mutation,
migrations, navigation, dependencies) is ordinary application architecture.

## Size requirement

The finished application has **at least 10,000 production lines** of JavaScript/JSX:
nonblank, non-comment lines in `packages/*/src/**` and `packages/cli/bin/**`. Tests,
`scripts/`, docs, CSS, build configuration, lockfiles, `dist/` and `node_modules/`
do not count. Phase A freezes the counter script; the same script measures both builds.

Size comes from the feature scope below. Padding is forbidden: no generated or vendored
code, no duplicated implementations, no dead code, no lines split to raise the count.
The report reviews the largest files for padding.

## Stack and boundaries

| Concern | Choice |
| --- | --- |
| Runtime | Node.js 22 from the pinned runtime image. Phase A records the exact version and whether `node:sqlite` needs `--experimental-sqlite`; scripts pass the flag only then |
| Repository shape | npm workspaces monorepo with four packages: `shared`, `server`, `web`, `cli` |
| Server | Express 4, ES modules, `node:sqlite` for storage, `node:crypto` (scrypt) for passwords and tokens |
| Web | Preact with JSX, bundled by esbuild into `packages/web/dist/` |
| CLI | Plain Node, `crew` executable, talks to the HTTP API with a personal API token |
| Tests | `node:test` and `node:assert` in every package; HTTP tests start the app on an ephemeral port with a temporary database |
| Browser check | Headless browser smoke only if Phase A pins a browser in the runtime image; otherwise HTTP and bundle checks, and the gap is disclosed |

**Direct dependencies:** `express`, `preact`, `esbuild`, plus a browser driver only if
Phase A pins one. Exact versions are frozen in Phase A. In Build 1 an addition needs
main-agent approval and is recorded as a deviation; Build 2 uses the frozen list only.
No native addons, no external database, no network services besides the npm registry
during installation.

**Runtime data** lives under `CREW_DATA_DIR` (default `./data`): the SQLite file and
attachment blobs. `data/` is ignored by `.gitignore` and therefore ruled by `/.lww`.

**Configuration** comes from the environment: `PORT` (default 4100), `CREW_DATA_DIR`,
`CREW_SECRET` (session/token signing), `CREW_MAX_UPLOAD_BYTES` (default 25 MiB),
`CREW_BASE_URL` (for invitation and reset links in the email outbox).

## Folder structure

The top two levels, the package folders and the per-lane `modules/` folders are
required. Files inside a module are the recommended shape; lanes may add files. Every
file below is new; none exists yet. Lane owners are in parentheses (L0 is the team
lead's skeleton).

Repository root:

```
crew/                                 —   new
  package.json                        —   new  (L0: workspaces, scripts)
  package-lock.json                   —   new  (generated; ruled in /.lww)
  .gitignore                          —   new  (L0: node_modules/, dist/, data/, coverage/, *.log)
  .lww                                —   new  (L0: %include .gitignore, package-lock.json)
  README.md                           —   new  (L0 outline; every lane documents its features)
  docs/                               —   new
    api.md                            —   new  (every lane: its endpoints)
    architecture.md                   —   new  (L0: layers, events, permissions)
  scripts/                            —   new  (not production LOC)
    seed.mjs                          —   new  (demo organization, users, projects, issues)
    smoke.mjs                         —   new  (HTTP end-to-end smoke)
    count-loc.mjs                     —   new  (copied from the frozen Phase A counter)
```

`packages/shared` (used by server, web and CLI):

```
shared/                               —   new
  package.json                        —   new
  src/                                —   new
    index.js                          —   new  (L0: re-exports)
    validate.js                       —   new  (L0: schema helpers)
    errors.js                         —   new  (L0: error codes)
    events.js                         —   new  (L0: domain event names; every lane adds its own)
    permissions.js                    —   new  (people: roles and permission names)
    schemas/                          —   new
      user.js                         —   new  (L0)
      org.js                          —   new  (people)
      issue.js                        —   new  (work)
      project.js                      —   new  (work)
      notification.js                 —   new  (insight)
    query/                            —   new  (insight: filter language, shared by all clients)
      lexer.js                        —   new
      parser.js                       —   new
      evaluate.js                     —   new
    markdown.js                       —   new  (work: safe markdown subset with mentions)
  test/                               —   new
```

`packages/server`:

```
server/                               —   new
  package.json                        —   new
  src/                                —   new
    index.js                          —   new  (L0: start, graceful shutdown)
    app.js                            —   new  (L0: app factory, mounts every module router)
    config.js                         —   new  (L0)
    db/                               —   new
      connection.js                   —   new  (L0: open, pragmas, transactions)
      migrate.js                      —   new  (L0: ordered runner, applied-migrations table)
      migrations/                     —   new  (every lane adds numbered files)
        001-users-sessions.js         —   new  (L0)
    http/                             —   new
      errors.js                       —   new  (L0: error envelope)
      pagination.js                   —   new  (L0: cursor pagination)
      sse.js                          —   new  (L0 stub; insight completes)
      middleware/                     —   new
        auth.js                       —   new  (L0 session; people adds API tokens)
        permissions.js                —   new  (people)
        validate.js                   —   new  (L0)
    events/                           —   new
      bus.js                          —   new  (L0: in-process publish/subscribe)
    modules/                          —   new
      auth/                           —   new  (L0: signup, login, logout, me)
      people/                         —   new  (people lane)
        orgs.js                       —   new
        teams.js                      —   new
        invitations.js                —   new
        tokens.js                     —   new
        audit.js                      —   new
        routes.js                     —   new
      work/                           —   new  (work lane)
        projects.js                   —   new
        issues.js                     —   new
        comments.js                   —   new
        boards.js                     —   new
        sprints.js                    —   new
        attachments.js                —   new
        routes.js                     —   new
      insight/                        —   new  (insight lane)
        search-index.js               —   new
        search.js                     —   new
        activity.js                   —   new
        notifications.js              —   new
        outbox.js                     —   new
        dashboards.js                 —   new
        transfer.js                   —   new
        routes.js                     —   new
  test/                               —   new
```

`packages/web`:

```
web/                                  —   new
  package.json                        —   new
  build.mjs                           —   new  (L0: esbuild; not production LOC)
  public/                             —   new
    index.html                        —   new  (L0)
  src/                                —   new
    main.jsx                          —   new  (L0)
    app.jsx                           —   new  (L0: layout, routes table)
    router.js                         —   new  (L0)
    api.js                            —   new  (L0: fetch client, errors)
    store.js                          —   new  (L0: app state)
    nav.js                            —   new  (L0; every lane adds entries)
    live.js                           —   new  (insight: SSE client)
    components/                       —   new  (shared widgets; any lane)
    pages/                            —   new
      auth/                           —   new  (L0: login, signup)
      people/                         —   new  (people)
      work/                           —   new  (work)
      insight/                        —   new  (insight)
    styles/                           —   new  (CSS; not production LOC)
  test/                               —   new
```

`packages/cli`:

```
cli/                                  —   new
  package.json                        —   new  (bin: crew)
  bin/                                —   new
    crew.js                           —   new  (L0: argument parsing, dispatch)
  src/                                —   new
    client.js                         —   new  (L0: HTTP client, token config)
    output.js                         —   new  (L0: table and JSON output)
    commands/                         —   new
      auth.js                         —   new  (L0: login, whoami)
      people.js                       —   new  (people: org, team, invite, token)
      work.js                         —   new  (work: project, issue, sprint, board)
      insight.js                      —   new  (insight: search, feed, inbox, export, import)
  test/                               —   new
```

## Common API rules

- JSON over `/api/v1`. Errors are `{ "error": { "code", "message", "details" } }` with
  stable codes from `shared/errors.js`. Validation failures return 422 with field details.
- List endpoints take `limit` (default 50, maximum 200) and an opaque `cursor`, and
  return `{ items, nextCursor }`.
- Authentication: an httpOnly `SameSite=Strict` session cookie for the web, or
  `Authorization: Bearer <token>` for the CLI. State-changing cookie requests must
  carry `X-Crew-Request: 1`.
- Every route checks permissions through the shared middleware once the people lane
  provides it. Every mutation publishes a domain event on the bus; the event carries
  actor, organization, entity type, entity id, action, before/after summary and time.
- Timestamps are ISO 8601 UTC. Ids are opaque strings. Issue keys are `<PROJECT>-<n>`.

## Skeleton — L0 (team lead)

The smallest shared spine all lanes need, published to `main` before workers start:

- Monorepo with workspaces, root scripts `build`, `test` (every package), `start`, `seed`,
  `smoke`; `.gitignore` and `/.lww`.
- Server: config, app factory, database connection, migration runner with migration
  `001` (users, sessions), error envelope, validation and pagination helpers, event bus,
  SSE endpoint stub, `auth` module (signup, login, logout, `GET /me`), scrypt hashing.
- Web: shell with router, layout, navigation, API client, login and signup pages, build.
- CLI: `crew login`, `crew whoami`, config file, HTTP client, table/JSON output.
- Test harness per package with one passing test each, including an HTTP test that
  starts the server on an ephemeral port with a temporary database.
- README outline and `docs/architecture.md` describing these conventions.

## Lane `people` — organizations, access and audit

| Milestone | Finished behavior |
| --- | --- |
| P-M1 | Organizations (create, rename, list mine), membership with roles `owner`, `admin`, `member`, `guest`; teams within an organization with members; permission names in `shared/permissions.js`; permission middleware |
| P-M2 | Invitations (email + role, token link through the email outbox, expiry, accept, revoke); permission middleware applied to every existing route of every module, with project-level access for guests; session list and revoke; password change and reset via outbox link |
| P-M3 | Personal API tokens (create with scopes, list, revoke; stored hashed; used by the CLI); audit log of security-relevant actions with filtered queries; admin web pages for members, teams, invitations, tokens and audit; CLI `org`, `team`, `invite`, `token` commands |

## Lane `work` — projects, issues and planning

| Milestone | Finished behavior |
| --- | --- |
| W-M1 | Projects (key, name, description, archive, per-project workflow of ordered statuses with categories `todo`/`active`/`done`); issues with per-project numbering, title, markdown description, status, priority, assignee, estimate, due date, parent issue; labels; issue list and detail pages; CLI `project` and `issue` commands |
| W-M2 | Comments with safe markdown and `@mentions`; issue relations (`blocks`, `duplicates`, `relates`); kanban board per project with column order by status and stable within-column ranking; drag and drop in the web; bulk edit of status, assignee and labels |
| W-M3 | Sprints (create, start, complete, scope changes, carry-over of unfinished issues, burndown data per day); attachments streamed to `CREW_DATA_DIR` with size limit, SHA-256 and exact-byte download; sprint and board pages; CLI `sprint` and `board` commands |

## Lane `insight` — search, activity and reporting

| Milestone | Finished behavior |
| --- | --- |
| I-M1 | Filter language in `shared/query`: `status:`, `assignee:@me`, `label:`, `priority>=`, `project:`, `created>`/`updated<` dates, quoted free text, `AND`/`OR`/`NOT`, parentheses, with positioned parse errors; search index maintained from domain events (tokenized, prefix match, ranking by field weight and recency); search API with highlighting; search page with query suggestions; CLI `search` |
| I-M2 | Activity feed per issue, project, user and organization from domain events; subscriptions (watch issue/project; automatic for creator, assignee, mentioned users); in-app notification inbox with read/unread and bulk mark; email outbox table with per-user digest batching; live updates to the web over SSE; CLI `feed` and `inbox` |
| I-M3 | Saved filters (personal and team-shared); dashboards with counts by status/assignee/priority, throughput per week and sprint burndown, rendered as SVG in the web; export of a project to JSON and CSV and import of the JSON export with id remapping (round trip preserves issues, comments, labels, relations); CLI `export` and `import` |

## Tests

- Every milestone adds tests for its behavior: API tests through HTTP, unit tests for
  pure logic (query parser, search ranking, markdown, board ranking, burndown, permissions),
  web tests for state and routing logic, CLI tests against a test server.
- The finished application has **at least 120 passing tests** across the packages. No
  skipped test without a reason recorded in the README.
- Each package's `npm test` must finish within 110 seconds inside a Workspace. Split
  slow suites by package or file rather than raising timeouts.

## Full acceptance

Run by the team lead on a fresh Branch forked from the final `main` Layer. Every
command has an explicit wall timeout of at most 120 seconds and an inner
`timeout 110`.

1. Remove `node_modules/` and `packages/web/dist/`, then `npm ci` from the lockfile.
2. `npm run build`; the bundle exists and references no development-only modules.
3. `npm test` in each package; record pass/fail/skip counts. All pass; total of at least 120.
4. `node scripts/count-loc.mjs`: at least 10,000 production lines; record the per-package breakdown.
5. Seed, start the server, run `scripts/smoke.mjs`: signup, organization, invitation
   accept, project, issues with labels/relations, comment with mention, board move,
   sprint start/complete, attachment upload and exact-byte download, search with a
   compound query, notification received, dashboard data, export then import into a
   new project with equal content, token-based CLI calls for each lane's commands,
   permission denial for a guest outside their project.
6. Stop and restart the server against the same data; the smoke's read checks pass again.
7. Browser smoke if Phase A pinned a browser: login, board drag, search, inbox.
8. Unmount, mount a fresh Workspace on the same Branch, run `crew whoami` and one
   read check, proving the executable mode and data survive a new Workspace.
9. Every application process is stopped, every Workspace unmounted, every Sandbox
   closed after its daemon logs are saved.

README must document setup, configuration, every package's scripts, the API (or link
`docs/api.md`), the CLI, the permission model, the filter language, data and backup
locations, and known limitations.
