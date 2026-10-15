# Depot application specification

> **Status:** Current planning checklist; no release candidate exists.

Scope: issue #337 under collection #336. The specification bundle is frozen by FREEZE.json after live Phase A checks.
Dependencies and manifests are in [DEPENDENCIES.md](DEPENDENCIES.md), the lockfile
is [Cargo.lock](Cargo.lock), and execution procedures are in [ACCEPTANCE.md](ACCEPTANCE.md).
Exact runtime/product pins are in [ENVIRONMENT.json](ENVIRONMENT.json).


### Stack and boundaries

- A Rust Cargo workspace with shared domain types, artifact storage/catalog,
  HTTP server and CLI components. Use a pinned Rust toolchain/runtime image,
  edition and dependency lockfile; select exact compatible versions in Phase A
  and freeze the resulting specification before launching either builder.
- Axum/Tokio for HTTP, rusqlite for SQLite, and a small set of serialization,
  hashing and CLI dependencies. Reuse existing capabilities, minimize optional
  features, and never edit or patch downloaded third-party code. SQLite build
  prerequisites must be supplied and recorded by the runtime image.
- A small plain HTML/CSS/JavaScript browser interface is served by the Rust
  server. The application has no Node service or required frontend build chain;
  Node remains the LayerFS SDK orchestration runtime.
- Single server process, local artifact files and one SQLite catalog. Configure
  listen address and data directory. No external database, cloud service or
  package-registry protocol is required. This is a build-artifact service, not
  a replacement implementation of the Cargo registry protocol.
- Registry objects, SQLite files, temporary uploads and test data live inside
  the mounted Workspace. Gracefully close the application before acceptance
  checkpoints. Restart tests cover process recovery, not power-loss durability
  or process/memory/socket checkpointing by LayerFS.

### Data and API

Repository and artifact names are 1–64 ASCII letters/digits/dot/underscore/hyphen,
must start with a letter or digit, and cannot be `.` or `..`. A version uses the
same grammar and is an opaque immutable identifier, not a semver range. Every
artifact record has repository, name, version, byte length, SHA256, content type
and creation time. Paths are derived safely from validated identifiers or an
internal id; user input cannot escape the configured data directory.

| Endpoint | Required behavior |
| --- | --- |
| `GET /health` | 200 with a JSON health response |
| `POST /api/repos` | Create `{name, description}`; 201; duplicate name 409 |
| `GET /api/repos` | Paginated repositories, sorted by name |
| `GET /api/repos/{repo}` | Repository metadata; unknown repository 404 |
| `PUT /api/repos/{repo}/artifacts/{name}/{version}` | Stream the raw body into a unique temporary file; compute size/SHA256; publish an immutable version; 201 with metadata; duplicate version 409 |
| `GET /api/repos/{repo}/artifacts` | Paginated artifact versions, stable name/version ordering; optional name-prefix filter |
| `GET /api/repos/{repo}/artifacts/{name}/{version}` | JSON metadata; absent version 404 |
| `GET /api/repos/{repo}/artifacts/{name}/{version}/download` | Stream exact bytes with length and SHA256-derived ETag; no whole-file buffering |
| `DELETE /api/repos/{repo}/artifacts/{name}/{version}` | Remove the version and its stored file according to a documented reconciliation protocol; 204; absent version 404 |

List responses are `{items, page, pageSize, total}`, page defaults to 1 and
pageSize to 20, with an explicit maximum of 100. Empty results are successful.
Errors are JSON `{error:{code,message}}`; invalid identifiers or pagination are
400, absent resources 404, duplicate immutable identities 409, storage failures
500 without exposing private host paths. Interrupted request bodies must not
leave a visible artifact record or a downloadable partial object.

### Correctness and recovery

- Stream uploads/downloads using bounded buffers. Do not cap total artifact size
  to fit memory or read the entire object into a Vec. Keep fixtures bounded for
  the command budget; physical storage capacity remains a real constraint.
- Use temporary files and atomic same-filesystem rename for completed objects.
  SQLite and a filesystem rename are not one transaction: specify ordering,
  reservations and reconciliation so incomplete publication cannot expose
  partial data. On startup, reconcile incomplete uploads and pending deletions
  before admitting requests. Preserve already acknowledged completed versions.
- Two simultaneous uploads to one repository/name/version yield exactly one 201
  and one 409. A reader sees a complete published object or 404. Different
  identities may proceed concurrently. Existing versions cannot be overwritten.
- Deletion of one version does not alter another. Listing and download results
  remain consistent with the committed catalog. Use one physical artifact file
  per version for this exercise so application-level deduplication does not hide
  LayerFS's storage reuse; checksum equality is still recorded.
- Verify byte identity after clean server restart. Test an interrupted streaming
  upload and a deterministic fault at a documented publication boundary, then
  restart and verify cleanup/reconciliation. No power-loss guarantee is inferred.
- Tests use isolated directories under the Workspace, a random loopback port,
  bounded readiness waits, and deterministic cleanup of child processes.

### CLI and browser

CLI commands cover repository create/list, artifact upload/list/info/download and
delete. Accept server URL through configuration or a flag. Support `--json` for
structured output. Exit 0 on success, 2 for invocation/validation errors, 3 for
not-found/conflict responses, and 1 for transport/unexpected server failures.
Stream upload/download files; an unsuccessful download leaves no partial final
destination. Tests verify exit codes and byte-for-byte downloads.

The browser interface lists repositories and versions, creates repositories,
uploads artifacts, shows progress/errors, downloads and deletes a version after
confirmation. Add at least one automated browser interaction flow at acceptance;
HTTP-only asset checks do not count as browser interaction. Browser tooling runs
through the Workspace command environment with pinned prerequisites in the image.

### Milestones and parallel work

| Milestone | Finished behavior |
| --- | --- |
| M1 | Cargo workspace, configuration, health endpoint, CLI connectivity, README skeleton and test setup |
| M2 | Streamed artifact storage, hashing, catalog/schema, local storage tests |
| M3 | Upload/download/list API and CLI with exact byte verification |
| M4 | Immutable-version conflicts, filtering, deletion and concurrent request correctness |
| M5 | Browser interface, interrupted-upload handling and restart reconciliation |
| M6 | Complete docs, packaging, full acceptance and clean shutdown |

### Full acceptance

Application acceptance requires the following quality and behavior checks.
LayerFS Branch, Workspace and cleanup procedures are in ACCEPTANCE.md:

- Fetch dependencies with the frozen Cargo.lock and recorded registry access.
- Remove only generated Cargo compilation output, retain the declared dependency
  source cache, and complete a clean application rebuild. This is a clean build,
  not a claim of cold network/cache state. Build test targets before execution.
- Pass every package's unit/integration tests, formatting, warning-denying scoped
  Clippy, documentation tests and `cargo package --list --locked --allow-dirty`
  inspection for each intended distributable package. Retain all outcomes;
  package listing is not a crates.io publication or release qualification.
- Run CLI-to-server and browser acceptance, with repository creation, uploads,
  exact-byte downloads, version conflict, listing/filtering, deletion and restart.
- Use deterministic fixtures including empty/binary/text objects, nested input
  paths, a declared many-small-files set and a streamed 32 MiB binary. Freeze
  exact fixture generation and counts in Phase A. Identical and slightly changed
  versions must appear in history so storage reuse can be inspected.
- Pass same-version concurrent-upload and interrupted-upload/recovery tests.
- Execute the binary after a fresh remount, proving executable mode and retained
  artifacts work across Workspace lifecycles; verify checksums again.
- README documents toolchain, build/test/run/CLI, configuration, API, recovery,
  storage semantics, packaging and limitations.
- Preserve logs and reports, terminate all application processes, unmount every
  Workspace, and close every explicit and automatic service Sandbox.

All commands, including every build/test/package/browser invocation, need an
explicit wall timeout <=120 seconds. Use scoped package/target invocations where
necessary, fixed in the plan; do not hide a timed-out build behind an unbounded
background process or repeated identical invocation. A timeout is retained as a
failure and diagnosed before a justified changed follow-up.
