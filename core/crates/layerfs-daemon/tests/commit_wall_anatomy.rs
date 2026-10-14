//! Wall time of many equal Commits of one Workspace, without a mount, over a
//! real Disposable Store and the real local owner. Every Commit follows the
//! same shape of change, one step of a development loop. Only public calls are
//! timed, from this test: the whole Commit, the stretch before and after its
//! constructor, and the constructor thread's time inside the record port and
//! the captured reader port. The owner's own service time and the global
//! Store's transaction time are read from their existing counters.
//!
//! This is a diagnostic: it prints and asserts no time. Read it from an
//! optimized build only (`cargo test --release`); a default run makes a few
//! Commits of each shape so the binary stays a quick structural check.
//!
//! Environment, all optional:
//! `COMMIT_WALL_ANATOMY_SECONDS`  how long each selected loop commits;
//! `COMMIT_WALL_ANATOMY_COMMITS`  Commits of one Workspace before the loop
//!                                starts again on a fresh Store, so that every
//!                                sample has a bounded history behind it;
//! `COMMIT_WALL_ANATOMY_SHAPES`   comma list of shape names, or `all` (default:
//!                                the first, `step`);
//! `COMMIT_WALL_ANATOMY_ROUTE`    `product` (`commit_captured`, the default
//!                                with SECONDS set) or `clocked` (the same
//!                                steps with the two ports clocked).
#[allow(dead_code)]
#[path = "support/record_counts.rs"]
mod counts;
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[allow(dead_code)]
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use counts::Counting;
use drive::{evidence, job, window};
use layerfs_content::filesystem::{PathName, SymlinkTarget};
use layerfs_daemon::{
    bootstrap::{open_store_observed, OpenedStore},
    store::{BindRequest, BoundWorkspace, CommitError},
    Owner, OwnerConfig, OwnerWork, Response, ServiceClass,
};
use layerfs_history::{CommitStagedOutcome, WorkspaceId};
use layerfs_overlay::{ProfileConfig, StatementKind};
use layerfs_persistence::{SqlWork, SqlitePersistenceProfile};
use layerfs_storage::ReservationBlocks;
use layerfs_workspace::{
    CapturedNamespace, CapturedNamespaceAttempt, Operation, Outcome, Position, Time,
};
use std::{
    collections::HashMap,
    fs,
    path::Path,
    sync::Arc,
    time::{Duration, Instant},
};

/// Directories of `bulk/`, fifty one-line files each.
const DIRECTORIES: usize = 160;
/// Stored files of 20,000 bytes below `mid/`.
const MID: usize = 600;
const MID_BYTES: usize = 20_000;
/// Files of each `bulk/` directory the loop may remove, replace and re-mode.
const REMOVABLE: usize = 30;

fn noise(seed: u64, len: usize) -> Vec<u8> {
    let mut state = seed.wrapping_mul(0x9E37_79B9_7F4A_7C15) | 1;
    (0..len)
        .map(|_| {
            state ^= state << 13;
            state ^= state >> 7;
            state ^= state << 17;
            (state >> 24) as u8
        })
        .collect()
}
fn tree(source: &Path) {
    for directory in 0..DIRECTORIES {
        let path = source.join(format!("bulk/d-{directory:03}"));
        fs::create_dir_all(&path).unwrap();
        for file in 0..50 {
            fs::write(
                path.join(format!("f-{file:02}")),
                format!("bulk {directory} {file}\n"),
            )
            .unwrap();
        }
    }
    fs::create_dir_all(source.join("mid")).unwrap();
    for file in 0..MID {
        fs::write(
            source.join(format!("mid/m-{file:04}")),
            noise(file as u64 + 1, MID_BYTES),
        )
        .unwrap();
    }
    for directory in ["ren/a", "ren/b", "extra"] {
        fs::create_dir_all(source.join(directory)).unwrap();
    }
    fs::write(source.join("ren/a/x"), b"renamed in place\n").unwrap();
    fs::write(source.join("ren/a/z"), b"renamed across\n").unwrap();
}

/// What one step changes before its Commit.
#[derive(Clone, Copy, Debug)]
struct Shape {
    name: &'static str,
    /// New 700-byte files.
    new: usize,
    /// Stored 20,000-byte files truncated and written whole.
    replaced: usize,
    /// Stored 20,000-byte files appended to by 200 bytes.
    appended: usize,
    /// Stored 20,000-byte files overwritten by 64 bytes in the middle.
    overwritten: usize,
    /// Stored one-line files truncated and written whole.
    tiny: usize,
    /// Stored files removed.
    removed: usize,
    /// One rename inside a directory and one across two.
    renames: bool,
    /// Stored files whose mode alone changes.
    modes: usize,
    /// One new directory and one new symlink.
    extra: bool,
}
const SHAPES: [Shape; 6] = [
    // One step shaped after the tier 1 reference case: about ninety captured
    // rows and twenty-seven files through the changed-file constructor.
    Shape {
        name: "step",
        new: 12,
        replaced: 4,
        appended: 4,
        overwritten: 2,
        tiny: 2,
        removed: 18,
        renames: true,
        modes: 3,
        extra: true,
    },
    // The same step with no file content changed: its other rows only.
    Shape {
        name: "step-no-files",
        new: 0,
        replaced: 0,
        appended: 0,
        overwritten: 0,
        tiny: 0,
        removed: 18,
        renames: true,
        modes: 0,
        extra: true,
    },
    // Twice the files of the step, its other rows unchanged.
    Shape {
        name: "step-double-files",
        new: 24,
        replaced: 8,
        appended: 8,
        overwritten: 4,
        tiny: 4,
        removed: 18,
        renames: true,
        modes: 6,
        extra: true,
    },
    // Only new files, and only edits of stored files.
    Shape {
        name: "new-24",
        new: 24,
        replaced: 0,
        appended: 0,
        overwritten: 0,
        tiny: 0,
        removed: 0,
        renames: false,
        modes: 0,
        extra: false,
    },
    Shape {
        name: "stored-24",
        new: 0,
        replaced: 8,
        appended: 8,
        overwritten: 4,
        tiny: 4,
        removed: 0,
        renames: false,
        modes: 0,
        extra: false,
    },
    // The least a Commit can carry: one stored file's mode.
    Shape {
        name: "one-mode",
        new: 0,
        replaced: 0,
        appended: 0,
        overwritten: 0,
        tiny: 0,
        removed: 0,
        renames: false,
        modes: 1,
        extra: false,
    },
];

/// A sealed, installed Disposable Store with its session counters, one owner.
struct Bench {
    f: support::Fixture,
    opened: OpenedStore,
    owner: Owner,
}
impl Bench {
    fn new(label: &str) -> Self {
        let f = support::Fixture::built(label, |source| {
            tree(source);
            model::Model::native(source).1
        });
        assert_eq!(
            f.config.sqlite_profile,
            SqlitePersistenceProfile::Disposable
        );
        let opened = open_store_observed(
            f.config.clone(),
            support::BINDING,
            support::CURSOR,
            2,
            2 * 1024 * 1024,
            ReservationBlocks::default(),
        )
        .unwrap();
        let owner = Owner::start(
            &f.directory.join("overlay.sqlite"),
            ProfileConfig::default(),
            OwnerConfig::default(),
        )
        .unwrap();
        Self { f, opened, owner }
    }
    fn bind(&self) -> Arc<BoundWorkspace> {
        Arc::new(
            self.opened
                .store
                .bind(
                    self.owner.client(),
                    BindRequest {
                        branch: self.f.branch,
                        workspace: WorkspaceId::from_authority([1; 32]).unwrap(),
                    },
                )
                .unwrap()
                .workspace,
        )
    }
    fn finish(self, workspace: Arc<BoundWorkspace>) {
        assert!(matches!(
            job(
                &self.owner.client(),
                workspace.route(),
                |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.close(job_route)
            )
            .result(),
            Ok(Response::Done)
        ));
        drop(workspace);
        drop(self.opened);
        self.owner.stop().unwrap();
        self.f.cleanup();
    }
}

fn name(value: &str) -> PathName {
    PathName::new(value).unwrap()
}
/// Mutations through the Workspace plan, as a request worker makes them, with
/// no model beside them: directory serials are stable and kept by path.
struct Driver<'a> {
    workspace: &'a BoundWorkspace,
    clock: i64,
    directories: HashMap<String, u64>,
}
enum Step<'a> {
    Create(&'a str),
    Mkdir(&'a str),
    Symlink(&'a str, &'a [u8]),
    Remove(&'a str),
    Rename(&'a str, &'a str),
    Write(&'a str, u64, &'a [u8]),
    Truncate(&'a str, u64),
    Mode(&'a str, u32),
}
impl Driver<'_> {
    fn apply(&mut self, step: Step<'_>) {
        self.clock += 1;
        let now = Time {
            seconds: self.clock,
            nanoseconds: 0,
        };
        let directories = &mut self.directories;
        window(self.workspace, |operation, view| {
            let overlay = operation.overlay();
            let mut directory = |path: &str| -> u64 {
                if let Some(serial) = directories.get(path) {
                    return *serial;
                }
                let mut serial = view.root_serial();
                for part in path.split('/').filter(|part| !part.is_empty()) {
                    serial = view.lookup(overlay, serial, &name(part)).unwrap().serial;
                }
                directories.insert(path.to_string(), serial);
                serial
            };
            let mut at = |path: &str| -> (u64, PathName) {
                let (parent, last) = path.rsplit_once('/').unwrap_or(("", path));
                (directory(parent), name(last))
            };
            let mut file = |path: &str| -> u64 {
                let (parent, last) = at(path);
                view.lookup(overlay, parent, &last)
                    .unwrap_or_else(|error| panic!("{path}: {error:?}"))
                    .serial
            };
            let request = match step {
                Step::Create(path) => {
                    let (parent, name) = at(path);
                    Operation::Create {
                        parent,
                        name,
                        mode: 0o644,
                    }
                }
                Step::Mkdir(path) => {
                    let (parent, name) = at(path);
                    Operation::Mkdir {
                        parent,
                        name,
                        mode: 0o755,
                    }
                }
                Step::Symlink(path, target) => {
                    let (parent, name) = at(path);
                    Operation::Symlink {
                        parent,
                        name,
                        target: SymlinkTarget::new(target.to_vec()).unwrap(),
                    }
                }
                Step::Remove(path) => {
                    let (parent, name) = at(path);
                    Operation::Unlink { parent, name }
                }
                Step::Rename(from, to) => {
                    let (parent, name) = at(from);
                    let (new_parent, new_name) = at(to);
                    let parents = to.rsplit_once('/').map_or("", |(parents, _)| parents);
                    Operation::Rename {
                        parent,
                        name,
                        new_parent,
                        new_name,
                        replace: true,
                        destination_path: Some(
                            parents
                                .split('/')
                                .filter(|part| !part.is_empty())
                                .map(self::name)
                                .collect(),
                        ),
                    }
                }
                Step::Write(path, offset, data) => Operation::Write {
                    serial: file(path),
                    position: Position::At(offset),
                    data: data.into(),
                },
                Step::Truncate(path, size) => Operation::SetAttributes {
                    serial: file(path),
                    mode: None,
                    mtime: None,
                    size: Some(size),
                },
                Step::Mode(path, mode) => Operation::SetAttributes {
                    serial: file(path),
                    mode: Some(mode),
                    mtime: None,
                    size: None,
                },
            };
            let outcome = operation
                .workspace()
                .mutate(overlay, operation.ports(), view, request, now)
                .unwrap_or_else(|error| panic!("{error:?}"));
            match outcome {
                Outcome::Applied { publication, .. } => assert!(job(
                    overlay,
                    self.workspace.route(),
                    |job_client: &layerfs_daemon::OwnerClient, _| job_client
                        .reply_attempted(publication)
                )
                .result()
                .is_ok()),
                Outcome::Unchanged { .. } => panic!("a step changed nothing"),
            }
        });
    }
}

/// The running positions of each pool the steps draw from.
#[derive(Default)]
struct Pools {
    mid: usize,
    tiny: usize,
    removed: usize,
    modes: usize,
    /// Paths created by each earlier step, oldest first.
    created: Vec<Vec<String>>,
}
/// Applies step number `step` of `shape`; false when a pool is exhausted.
fn mutate(driver: &mut Driver<'_>, pools: &mut Pools, shape: Shape, step: usize) -> bool {
    let mut created = Vec::with_capacity(shape.new);
    for file in 0..shape.new {
        let path = format!(
            "bulk/d-{:03}/t-{step:05}-{file:02}",
            (2 * step + file / 6) % DIRECTORIES
        );
        driver.apply(Step::Create(&path));
        driver.apply(Step::Write(
            &path,
            0,
            &noise((step * 64 + file) as u64 + 7, 700),
        ));
        created.push(path);
    }
    let mid = |pools: &mut Pools| {
        pools.mid += 1;
        format!("mid/m-{:04}", (pools.mid - 1) % MID)
    };
    for file in 0..shape.replaced {
        let path = mid(pools);
        driver.apply(Step::Truncate(&path, 0));
        driver.apply(Step::Write(
            &path,
            0,
            &noise((step * 64 + file) as u64 + 100_000, MID_BYTES),
        ));
    }
    for file in 0..shape.appended {
        let path = mid(pools);
        driver.apply(Step::Write(
            &path,
            MID_BYTES as u64,
            &noise((step * 64 + file) as u64 + 200_000, 200),
        ));
    }
    for file in 0..shape.overwritten {
        let path = mid(pools);
        driver.apply(Step::Write(
            &path,
            9_000,
            &noise((step * 64 + file) as u64 + 300_000, 64),
        ));
    }
    for _ in 0..shape.tiny {
        let at = pools.tiny;
        pools.tiny += 1;
        let path = format!(
            "bulk/d-{:03}/f-{:02}",
            (at / 10) % DIRECTORIES,
            REMOVABLE + at % 10
        );
        driver.apply(Step::Truncate(&path, 0));
        driver.apply(Step::Write(
            &path,
            0,
            format!("replaced at {at}\n").as_bytes(),
        ));
    }
    // Files the step before last created are stored files by now; they go
    // first, then the pool of stored one-line files.
    let mut removed = 0;
    if pools.created.len() >= 2 {
        let at = pools.created.len() - 2;
        for path in std::mem::take(&mut pools.created[at])
            .into_iter()
            .take(shape.removed)
        {
            driver.apply(Step::Remove(&path));
            removed += 1;
        }
    }
    while removed < shape.removed {
        let at = pools.removed;
        if at >= DIRECTORIES * REMOVABLE {
            return false;
        }
        pools.removed += 1;
        driver.apply(Step::Remove(&format!(
            "bulk/d-{:03}/f-{:02}",
            at / REMOVABLE,
            at % REMOVABLE
        )));
        removed += 1;
    }
    if shape.renames {
        let (here, there) = if step % 2 == 0 {
            ("x", "y")
        } else {
            ("y", "x")
        };
        driver.apply(Step::Rename(
            &format!("ren/a/{here}"),
            &format!("ren/a/{there}"),
        ));
        let (from, to) = if step % 2 == 0 {
            ("a", "b")
        } else {
            ("b", "a")
        };
        driver.apply(Step::Rename(
            &format!("ren/{from}/z"),
            &format!("ren/{to}/z"),
        ));
    }
    for _ in 0..shape.modes {
        let at = pools.modes;
        pools.modes += 1;
        let path = format!(
            "bulk/d-{:03}/f-{:02}",
            (at / 10) % DIRECTORIES,
            40 + at % 10
        );
        let round = at / (10 * DIRECTORIES);
        driver.apply(Step::Mode(
            &path,
            if round % 2 == 0 { 0o600 } else { 0o640 },
        ));
    }
    if shape.extra {
        driver.apply(Step::Mkdir(&format!("extra/s-{step:05}")));
        driver.apply(Step::Symlink(&format!("extra/l-{step:05}"), b"../mid"));
    }
    pools.created.push(created);
    true
}

/// One Commit's clocks and counter differences, nanoseconds and counts.
#[derive(Clone, Copy, Default)]
struct Sample {
    wall: u64,
    /// Clocked route only: before the constructor, its three parts, after it.
    before: u64,
    acquire: u64,
    construct: u64,
    release: u64,
    after: u64,
    record_calls: u64,
    record_ns: u64,
    read_calls: u64,
    read_ns: u64,
    /// Owner counters: completed jobs, service and queue wait by class.
    jobs: [u64; 6],
    service: [u64; 6],
    waited: [u64; 6],
    /// Owner statements: executions and elapsed of all foreground families.
    statements: u64,
    statement_ns: u64,
    fence_statements: u64,
    fence_ns: u64,
    /// Global Store writer session, then both reader sessions summed.
    writer_transactions: u64,
    writer_transaction_ns: u64,
    writer_statements: u64,
    writer_statement_ns: u64,
    writer_commit_ns: u64,
    reader_transactions: u64,
    reader_ns: u64,
    blob_read_ns: u64,
    files: u64,
    rows: u64,
}
struct Counters {
    owner: OwnerWork,
    writer: SqlWork,
    readers: Vec<SqlWork>,
}
fn counters(bench: &Bench) -> Counters {
    let store = bench.opened.diagnostics().unwrap();
    Counters {
        owner: bench.owner.client().diagnostics().unwrap(),
        writer: store.writer,
        readers: store.readers,
    }
}
fn differences(sample: &mut Sample, before: &Counters, after: &Counters) {
    for class in 0..6 {
        sample.jobs[class] = after.owner.jobs[class] - before.owner.jobs[class];
        sample.service[class] = after.owner.hold_ns[class] - before.owner.hold_ns[class];
        sample.waited[class] = after.owner.lock_wait_ns[class] - before.owner.lock_wait_ns[class];
    }
    let sql = after
        .owner
        .sql_foreground
        .since(&before.owner.sql_foreground);
    let total = sql.total();
    sample.statements = total.executions;
    sample.statement_ns = total.elapsed_ns;
    for kind in [StatementKind::Workspace, StatementKind::Lease] {
        sample.fence_statements += sql.statements[kind as usize].executions;
        sample.fence_ns += sql.statements[kind as usize].elapsed_ns;
    }
    let (w, v) = (&after.writer, &before.writer);
    sample.writer_transactions = w.transactions - v.transactions;
    sample.writer_transaction_ns = w.transaction_ns - v.transaction_ns;
    sample.writer_statements = w.statements - v.statements;
    sample.writer_statement_ns = w.statement_ns - v.statement_ns;
    sample.writer_commit_ns = w.commit_ns - v.commit_ns;
    sample.blob_read_ns = w.blob_read_ns - v.blob_read_ns;
    for (w, v) in after.readers.iter().zip(&before.readers) {
        sample.reader_transactions +=
            (w.transactions - v.transactions) + (w.read_snapshots - v.read_snapshots);
        sample.reader_ns +=
            (w.transaction_ns - v.transaction_ns) + (w.read_snapshot_ns - v.read_snapshot_ns);
        sample.blob_read_ns += w.blob_read_ns - v.blob_read_ns;
    }
}
fn nanos(from: Instant) -> u64 {
    from.elapsed().as_nanos() as u64
}

/// The product constructor, timed as one call.
fn commit_product(bench: &Bench, workspace: &BoundWorkspace) -> Sample {
    let before = counters(bench);
    let start = Instant::now();
    let success = workspace
        .commit_captured()
        .unwrap_or_else(|failure| panic!("{failure:?}"));
    let mut sample = Sample {
        wall: nanos(start),
        ..Sample::default()
    };
    assert!(matches!(success.history, CommitStagedOutcome::Committed(_)));
    let work = success
        .namespace
        .as_ref()
        .and_then(|namespace| namespace.work)
        .expect("the producer ran");
    sample.files = work.files_constructed;
    sample.rows = work.inode_rows + work.entry_rows;
    drop(success);
    differences(&mut sample, &before, &counters(bench));
    sample
}
/// The product constructor's own steps through the public driver, with the
/// constructor-thread ports clocked.
fn commit_clocked(bench: &Bench, workspace: &BoundWorkspace) -> Sample {
    let operation = workspace.operation().unwrap();
    let route = workspace.route();
    let policy = bench.opened.store.policy().construction();
    let before = counters(bench);
    let mut sample = Sample::default();
    let mut closed = None;
    let start = Instant::now();
    let result = workspace.commit(|save, capture, _| {
        sample.before = nanos(start);
        let entered = Instant::now();
        let overlay = operation.overlay();
        let request = u64::try_from(capture.generation.number()).unwrap();
        let reader = match job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_captured_reader(job_route, capture, request)
            },
        )
        .result()
        {
            Ok(Response::CapturedReader(Some(reader))) => *reader,
            other => panic!("{other:?}"),
        };
        let owner = match job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_operation(job_route, request)
            },
        )
        .result()
        {
            Ok(Response::Operation(Some(owner))) => *owner,
            other => panic!("{other:?}"),
        };
        sample.acquire = nanos(entered);
        let constructing = Instant::now();
        let clocked = Counting::clocks(overlay);
        let mut sink = save.sink();
        let CapturedNamespaceAttempt { result, custody } =
            CapturedNamespace::new(operation.workspace(), &clocked, reader, owner)
                .construct_untimed(policy, &policy.capacities(), save, &mut sink);
        sample.construct = nanos(constructing);
        let built = match result {
            Ok(built) => built,
            Err(error) => panic!("{error:?} {:?}", custody.failure),
        };
        sample.files = custody.work.files_constructed;
        sample.rows = custody.work.inode_rows + custody.work.entry_rows;
        drop(custody);
        let seen = clocked.into_seen();
        sample.record_calls = seen.record_calls;
        sample.record_ns = seen.record_ns;
        sample.read_calls = seen.read_calls;
        sample.read_ns = seen.read_ns;
        let releasing = Instant::now();
        assert!(job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
                .release_captured_reader(job_route, reader)
        )
        .result()
        .is_ok());
        assert!(job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
                .release_operation(job_route, owner)
        )
        .result()
        .is_ok());
        sample.release = nanos(releasing);
        closed = Some(Instant::now());
        Ok::<_, CommitError>(built.root)
    });
    sample.wall = nanos(start);
    sample.after = nanos(closed.expect("the constructor ran"));
    let success = result.unwrap_or_else(|failure| panic!("{failure:?}"));
    assert!(matches!(success.history, CommitStagedOutcome::Committed(_)));
    drop(success);
    differences(&mut sample, &before, &counters(bench));
    assert_eq!(
        sample.record_calls,
        sample.jobs[ServiceClass::OperationRecord as usize]
    );
    sample
}

fn micros(nanoseconds: f64) -> String {
    format!("{:.1}", nanoseconds / 1_000.0)
}
fn mean(samples: &[Sample], field: impl Fn(&Sample) -> u64) -> f64 {
    samples
        .iter()
        .map(|sample| field(sample) as f64)
        .sum::<f64>()
        / samples.len() as f64
}
fn summarize(shape: Shape, route: &str, samples: &[Sample], elapsed: Duration) {
    let mut walls = samples.iter().map(|sample| sample.wall).collect::<Vec<_>>();
    walls.sort_unstable();
    let at = |fraction: f64| walls[((walls.len() - 1) as f64 * fraction) as usize] as f64;
    let third = (samples.len() / 3).max(1);
    let record = ServiceClass::OperationRecord as usize;
    let read = ServiceClass::Read as usize;
    let m = |field: fn(&Sample) -> u64| mean(samples, field);
    evidence(format_args!(
        "COMMIT_WALL_ANATOMY shape={} route={route} commits={} loop_seconds={:.1} rows={:.1} files={:.1} wall_us(mean={} min={} p10={} median={} p90={} max={}) first_third_mean_us={} last_third_mean_us={}",
        shape.name,
        samples.len(),
        elapsed.as_secs_f64(),
        m(|s| s.rows),
        m(|s| s.files),
        micros(m(|s| s.wall)),
        micros(at(0.0)),
        micros(at(0.1)),
        micros(at(0.5)),
        micros(at(0.9)),
        micros(at(1.0)),
        micros(mean(&samples[..third], |s| s.wall)),
        micros(mean(&samples[samples.len() - third..], |s| s.wall)),
    ));
    evidence(format_args!(
        "COMMIT_WALL_ANATOMY_OWNER shape={} route={route} jobs(read={:.1} capture={:.1} lifecycle={:.1} record={:.1}) service_us(read={} capture={} lifecycle={} record={}) queue_wait_us(read={} record={}) statements={:.1} statement_us={} fence_statements={:.1} fence_us={}",
        shape.name,
        mean(samples, |s| s.jobs[read]),
        mean(samples, |s| s.jobs[ServiceClass::Capture as usize]),
        mean(samples, |s| s.jobs[ServiceClass::Lifecycle as usize]),
        mean(samples, |s| s.jobs[record]),
        micros(mean(samples, |s| s.service[read])),
        micros(mean(samples, |s| s.service[ServiceClass::Capture as usize])),
        micros(mean(samples, |s| s.service[ServiceClass::Lifecycle as usize])),
        micros(mean(samples, |s| s.service[record])),
        micros(mean(samples, |s| s.waited[read])),
        micros(mean(samples, |s| s.waited[record])),
        m(|s| s.statements),
        micros(m(|s| s.statement_ns)),
        m(|s| s.fence_statements),
        micros(m(|s| s.fence_ns)),
    ));
    evidence(format_args!(
        "COMMIT_WALL_ANATOMY_STORE shape={} route={route} writer(transactions={:.1} transaction_us={} statements={:.1} statement_us={} commit_us={}) readers(transactions={:.1} us={}) blob_read_us={}",
        shape.name,
        m(|s| s.writer_transactions),
        micros(m(|s| s.writer_transaction_ns)),
        m(|s| s.writer_statements),
        micros(m(|s| s.writer_statement_ns)),
        micros(m(|s| s.writer_commit_ns)),
        m(|s| s.reader_transactions),
        micros(m(|s| s.reader_ns)),
        micros(m(|s| s.blob_read_ns)),
    ));
    if route == "clocked" {
        evidence(format_args!(
            "COMMIT_WALL_ANATOMY_PHASES shape={} before_us={} acquire_us={} construct_us={} release_us={} after_us={} record_port(calls={:.1} us={}) reader_port(calls={:.1} us={}) construct_outside_ports_us={}",
            shape.name,
            micros(m(|s| s.before)),
            micros(m(|s| s.acquire)),
            micros(m(|s| s.construct)),
            micros(m(|s| s.release)),
            micros(m(|s| s.after)),
            m(|s| s.record_calls),
            micros(m(|s| s.record_ns)),
            m(|s| s.read_calls),
            micros(m(|s| s.read_ns)),
            micros(m(|s| s.construct) - m(|s| s.record_ns) - m(|s| s.read_ns)),
        ));
    }
}

/// One Workspace on a fresh Store: Commits until the cap, the deadline or an
/// exhausted pool. The first two open the producer and fill the caches and
/// are left out of the samples; each kept sample carries its Commit number.
fn round(
    shape: Shape,
    route: &str,
    cap: usize,
    deadline: Option<Instant>,
    samples: &mut Vec<(usize, Sample)>,
) {
    let bench = Bench::new(&format!("commit-wall-anatomy-{}-{route}", shape.name));
    let workspace = bench.bind();
    let mut driver = Driver {
        workspace: &workspace,
        clock: 1_800_000_000,
        directories: HashMap::new(),
    };
    let mut pools = Pools::default();
    let mut commit = 0;
    while commit < cap && deadline.is_none_or(|deadline| Instant::now() < deadline) {
        if !mutate(&mut driver, &mut pools, shape, commit) {
            break;
        }
        let sample = if route == "product" {
            commit_product(&bench, &workspace)
        } else {
            commit_clocked(&bench, &workspace)
        };
        commit += 1;
        if commit > 2 {
            samples.push((commit, sample));
        }
    }
    bench.finish(workspace);
}
fn run(shape: Shape, route: &str, seconds: Option<u64>, cap: Option<usize>) {
    evidence(format_args!(
        "COMMIT_WALL_ANATOMY_START shape={} route={route} pid={}",
        shape.name,
        std::process::id()
    ));
    let start = Instant::now();
    let deadline = seconds.map(|seconds| start + Duration::from_secs(seconds));
    let mut samples = Vec::new();
    let mut rounds = 0;
    // Without a duration: one round of a few Commits, a structural check.
    // With a duration and a cap: fresh rounds of that many Commits, so every
    // sample is taken at a bounded depth of history.
    loop {
        round(
            shape,
            route,
            cap.unwrap_or(if seconds.is_some() { usize::MAX } else { 6 }),
            deadline,
            &mut samples,
        );
        rounds += 1;
        if cap.is_none() || deadline.is_none_or(|deadline| Instant::now() >= deadline) {
            break;
        }
    }
    let all = samples
        .iter()
        .map(|(_, sample)| *sample)
        .collect::<Vec<_>>();
    summarize(shape, route, &all, start.elapsed());
    // The same clocks by depth of history: bands of ten Commit numbers.
    let last = samples.iter().map(|(commit, _)| *commit).max().unwrap_or(0);
    let mut bands = String::new();
    for from in (1..=last).step_by((last / 5).max(10)) {
        let band = samples
            .iter()
            .filter(|(commit, _)| (from..from + 10).contains(commit))
            .map(|(_, sample)| *sample)
            .collect::<Vec<_>>();
        if band.is_empty() {
            continue;
        }
        use std::fmt::Write as _;
        write!(
            bands,
            " commits_{from}..{}(n={} wall_us={} writer_transactions={:.1} writer_transaction_us={} record_service_us={})",
            from + 9,
            band.len(),
            micros(mean(&band, |s| s.wall)),
            mean(&band, |s| s.writer_transactions),
            micros(mean(&band, |s| s.writer_transaction_ns)),
            micros(mean(&band, |s| s.service[ServiceClass::OperationRecord as usize])),
        )
        .unwrap();
    }
    evidence(format_args!(
        "COMMIT_WALL_ANATOMY_HISTORY shape={} route={route} rounds={rounds}{bands}",
        shape.name
    ));
}

#[test]
fn equal_commits_are_timed_from_public_calls_and_existing_counters() {
    let seconds = std::env::var("COMMIT_WALL_ANATOMY_SECONDS")
        .ok()
        .map(|value| value.parse::<u64>().expect("whole seconds"));
    let cap = std::env::var("COMMIT_WALL_ANATOMY_COMMITS")
        .ok()
        .map(|value| value.parse::<usize>().expect("a Commit count"));
    let wanted = std::env::var("COMMIT_WALL_ANATOMY_SHAPES").ok();
    let routes = match std::env::var("COMMIT_WALL_ANATOMY_ROUTE").ok().as_deref() {
        Some("product") => vec!["product"],
        Some("clocked") => vec!["clocked"],
        Some(other) => panic!("unknown route {other}"),
        None if seconds.is_some() => vec!["product"],
        None => vec!["product", "clocked"],
    };
    // Each shape builds its own Store; a default run builds the first only.
    let wanted = wanted.unwrap_or_else(|| SHAPES[0].name.to_string());
    for shape in SHAPES {
        if wanted != "all" && !wanted.split(',').any(|name| name == shape.name) {
            continue;
        }
        for route in &routes {
            run(shape, route, seconds, cap);
        }
    }
}
