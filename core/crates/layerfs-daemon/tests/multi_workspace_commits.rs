//! Commits of one, two and four Workspaces of one daemon at the same time:
//! what each Commit waits for. Real sealed Disposable Store, the real local
//! owner, no mount; every Workspace is on its own branch forked from one
//! Layer and makes the same step of a development loop before each Commit.
//!
//! Two kinds of round, for each number of Workspaces:
//!
//! * `gate`: every Workspace makes its step, then all Commit at the same
//!   instant and nothing else runs until the last one is done. Whatever the
//!   owner, the Store writer and the readers did in that interval was done
//!   for those Commits, so their counters divide by the Commits exactly.
//! * `free`: every Workspace loops step and Commit with no alignment, so a
//!   Commit overlaps the others' steps as well, as in the mounted workload.
//!
//! Each Commit follows the product constructor's own steps through the
//! public driver with the two constructor-thread ports clocked, on the
//! thread that commits. Clocked from this test: the Commit, its parts, the
//! wall inside the record port and the captured reader port, and the CPU
//! time of the committing thread and of the process. Read from existing
//! counters: owner jobs, service and queue wait by class, overlay
//! statements, the Store writer's and readers' transactions, reader
//! admission and the shared cache.
//!
//! This is a diagnostic. It asserts counts and the published trees and no
//! time; read its times from an optimized build only. A step here is a
//! series of Workspace operations, not a command through a mount.
//!
//! `MULTI_WORKSPACE_COMMITS="gate_rounds,free_steps[,counts]"` selects a
//! run, for example `40,40,1+2+4`; without it a short structural run of two
//! Workspaces is made. Every wait is bounded.
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
#[path = "support/shared_cache_rig.rs"]
mod rig;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use counts::Counting;
use drive::evidence;
use layerfs_daemon::{
    bootstrap::{open_store_observed, OpenedStore},
    store::{BoundWorkspace, CommitError},
    JobReceipt, Owner, OwnerClient, OwnerConfig, OwnerWork, Response, ServiceClass,
};
use layerfs_history::CommitStagedOutcome;
use layerfs_overlay::{ProfileConfig, Route, StatementKind};
use layerfs_persistence::SqlWork;
use layerfs_storage::ReservationBlocks;
use layerfs_workspace::{CapturedNamespace, CapturedNamespaceAttempt};
use nix::libc;
use rig::{apply, Daemon, Do, Tree};
use std::{
    fs,
    path::Path,
    sync::{mpsc, Arc, Condvar, Mutex},
    thread,
    time::{Duration, Instant, SystemTime},
};

/// Directories of `bulk/`, fifty one-line files each.
const DIRECTORIES: usize = 160;
/// Stored files of 20,000 bytes below `mid/`.
const MID: usize = 600;
const MID_BYTES: usize = 20_000;
/// Files of each `bulk/` directory the loop may remove.
const REMOVABLE: usize = 30;
/// Gate rounds left out of the means: they open the producer and fill caches.
const WARM: usize = 2;
/// The longest any thread waits for the others at a gate.
const GATE: Duration = Duration::from_secs(40);
/// The mounted sample's daemon: two Store readers, an 8 MiB shared cache.
const READERS: usize = 2;
const CACHE: usize = 8 * 1024 * 1024;

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
    // One modification time for the whole base, children before parents, so
    // that runs over separately built bases publish equal trees.
    let stamp = SystemTime::UNIX_EPOCH + Duration::from_secs(1_600_000_000);
    let mut pending = vec![source.to_path_buf()];
    let mut directories = Vec::new();
    while let Some(directory) = pending.pop() {
        for entry in fs::read_dir(&directory).unwrap() {
            let path = entry.unwrap().path();
            if path.is_dir() {
                pending.push(path);
            } else {
                let file = fs::OpenOptions::new().write(true).open(path).unwrap();
                file.set_modified(stamp).unwrap();
            }
        }
        directories.push(directory);
    }
    for directory in directories.iter().rev() {
        fs::File::open(directory)
            .unwrap()
            .set_modified(stamp)
            .unwrap();
    }
}

/// The running positions of the pools one Workspace's steps draw from.
#[derive(Default)]
struct Pools {
    mid: usize,
    tiny: usize,
    removed: usize,
    modes: usize,
    /// Paths created by each earlier step, oldest first.
    created: Vec<Vec<String>>,
}
/// One step shaped after the tier 1 reference: twelve new files, twelve
/// stored files edited, eighteen removed, two renames, three modes, one new
/// directory and one new symbolic link. The same for every Workspace.
fn step(workspace: &BoundWorkspace, clock: &mut i64, pools: &mut Pools, step: usize) {
    let mut go = |operation: Do<'_>| {
        assert!(
            apply(workspace, clock, operation),
            "{operation:?} changed nothing"
        )
    };
    let mut created = Vec::with_capacity(12);
    for file in 0..12 {
        let path = format!(
            "bulk/d-{:03}/t-{step:05}-{file:02}",
            (2 * step + file / 6) % DIRECTORIES
        );
        go(Do::Create(&path, 0o644));
        go(Do::Write(
            &path,
            0,
            &noise((step * 64 + file) as u64 + 7, 700),
        ));
        created.push(path);
    }
    let mut mid = || {
        pools.mid += 1;
        format!("mid/m-{:04}", (pools.mid - 1) % MID)
    };
    for file in 0..4 {
        let path = mid();
        go(Do::Truncate(&path, 0));
        go(Do::Write(
            &path,
            0,
            &noise((step * 64 + file) as u64 + 100_000, MID_BYTES),
        ));
    }
    for file in 0..4 {
        go(Do::Write(
            &mid(),
            MID_BYTES as u64,
            &noise((step * 64 + file) as u64 + 200_000, 200),
        ));
    }
    for file in 0..2 {
        go(Do::Write(
            &mid(),
            9_000,
            &noise((step * 64 + file) as u64 + 300_000, 64),
        ));
    }
    for _ in 0..2 {
        let at = pools.tiny;
        pools.tiny += 1;
        let path = format!(
            "bulk/d-{:03}/f-{:02}",
            (at / 10) % DIRECTORIES,
            REMOVABLE + at % 10
        );
        go(Do::Truncate(&path, 0));
        go(Do::Write(
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
        for path in std::mem::take(&mut pools.created[at]) {
            go(Do::Remove(&path));
            removed += 1;
        }
    }
    while removed < 18 {
        let at = pools.removed;
        assert!(
            at < DIRECTORIES * REMOVABLE,
            "the removal pool is exhausted"
        );
        pools.removed += 1;
        go(Do::Remove(&format!(
            "bulk/d-{:03}/f-{:02}",
            at / REMOVABLE,
            at % REMOVABLE
        )));
        removed += 1;
    }
    let (here, there) = if step % 2 == 0 {
        ("x", "y")
    } else {
        ("y", "x")
    };
    go(Do::Rename(
        &format!("ren/a/{here}"),
        &format!("ren/a/{there}"),
    ));
    let (from, to) = if step % 2 == 0 {
        ("a", "b")
    } else {
        ("b", "a")
    };
    go(Do::Rename(&format!("ren/{from}/z"), &format!("ren/{to}/z")));
    for _ in 0..3 {
        let at = pools.modes;
        pools.modes += 1;
        assert!(at < 10 * DIRECTORIES, "the mode pool is exhausted");
        go(Do::Chmod(
            &format!(
                "bulk/d-{:03}/f-{:02}",
                (at / 10) % DIRECTORIES,
                40 + at % 10
            ),
            0o600,
        ));
    }
    go(Do::Mkdir(&format!("extra/s-{step:05}"), 0o755));
    go(Do::Symlink(&format!("extra/l-{step:05}"), b"../mid"));
    pools.created.push(created);
}

fn clock(id: libc::clockid_t) -> u64 {
    let mut time = libc::timespec {
        tv_sec: 0,
        tv_nsec: 0,
    };
    // SAFETY: `time` is a valid, initialized timespec this call may write,
    // and both clock identifiers used here are constants of the platform.
    let done = unsafe { libc::clock_gettime(id, &mut time) };
    assert_eq!(done, 0, "CPU clock");
    time.tv_sec as u64 * 1_000_000_000 + time.tv_nsec as u64
}
fn thread_cpu() -> u64 {
    clock(libc::CLOCK_THREAD_CPUTIME_ID)
}
fn process_cpu() -> u64 {
    clock(libc::CLOCK_PROCESS_CPUTIME_ID)
}
fn nanos(from: Instant) -> u64 {
    from.elapsed().as_nanos() as u64
}

/// One Commit as its own thread saw it; nanoseconds and counts.
#[derive(Clone, Copy, Default)]
struct Sample {
    /// The step before this Commit (free rounds only).
    command: u64,
    /// Start and end of its construction since the run's epoch: whether
    /// Commits of different Workspaces construct at the same time.
    construct_start: u64,
    construct_end: u64,
    wall: u64,
    /// CPU time of the committing thread over the Commit.
    cpu: u64,
    before: u64,
    acquire: u64,
    construct: u64,
    release: u64,
    after: u64,
    record_calls: u64,
    record_ns: u64,
    read_calls: u64,
    read_ns: u64,
}
/// One owner job as the product's synchronous ports wait for it.
fn job(
    owner: &OwnerClient,
    route: Route,
    command: impl FnOnce(
        &layerfs_daemon::OwnerClient,
        layerfs_overlay::Route,
    ) -> Result<layerfs_daemon::JobReceipt, layerfs_daemon::OwnerError>,
) -> JobReceipt {
    command(owner, route).unwrap_or_else(|error| panic!("{error:?}"))
}
/// The product constructor's own steps through the public driver, with the
/// constructor-thread ports clocked.
fn commit(run: &Run, workspace: &BoundWorkspace) -> Sample {
    let operation = workspace.operation().unwrap();
    let route = workspace.route();
    let policy = run.opened.store.policy().construction();
    let mut sample = Sample::default();
    let cpu = thread_cpu();
    let start = Instant::now();
    let mut closed = None;
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
        sample.construct_start = nanos(run.epoch);
        let constructing = Instant::now();
        let clocked = Counting::clocks(overlay);
        let mut sink = save.sink();
        let CapturedNamespaceAttempt { result, custody } =
            CapturedNamespace::new(operation.workspace(), &clocked, reader, owner)
                .construct_untimed(policy, &policy.capacities(), save, &mut sink);
        sample.construct = nanos(constructing);
        sample.construct_end = nanos(run.epoch);
        let built = match result {
            Ok(built) => built,
            Err(error) => panic!("{error:?} {:?}", custody.failure),
        };
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
    sample.cpu = thread_cpu() - cpu;
    sample.after = nanos(closed.expect("the constructor ran"));
    let success = result.unwrap_or_else(|failure| panic!("{failure:?}"));
    assert!(matches!(success.history, CommitStagedOutcome::Committed(_)));
    drop(success);
    sample
}

/// Cumulative counters of everything the Workspaces share.
#[derive(Clone)]
struct Counters {
    owner: OwnerWork,
    writer: SqlWork,
    readers: Vec<SqlWork>,
    reader_grants: u64,
    reader_wait: u64,
    cache_hits: u64,
    cache_misses: u64,
    cpu: u64,
}
/// What all Workspaces together did in one measured interval.
#[derive(Clone, Copy, Default)]
struct Interval {
    wall: u64,
    /// CPU time of the whole process: every Commit thread and the owner's.
    cpu: u64,
    jobs: [u64; 6],
    service: [u64; 6],
    waited: [u64; 6],
    statements: u64,
    statement_ns: u64,
    write_transactions: u64,
    maintenance_jobs: u64,
    maintenance_ns: u64,
    writer_transactions: u64,
    writer_writes: u64,
    writer_transaction_ns: u64,
    writer_statements: u64,
    writer_statement_ns: u64,
    writer_commit_ns: u64,
    reader_transactions: u64,
    reader_ns: u64,
    reader_grants: u64,
    reader_wait: u64,
    cache_hits: u64,
    cache_misses: u64,
}
fn interval(before: &Counters, after: &Counters, wall: u64) -> Interval {
    let mut interval = Interval {
        wall,
        cpu: after.cpu - before.cpu,
        ..Interval::default()
    };
    for class in 0..6 {
        interval.jobs[class] = after.owner.jobs[class] - before.owner.jobs[class];
        interval.service[class] = after.owner.hold_ns[class] - before.owner.hold_ns[class];
        interval.waited[class] = after.owner.lock_wait_ns[class] - before.owner.lock_wait_ns[class];
    }
    let sql = after
        .owner
        .sql_foreground
        .since(&before.owner.sql_foreground);
    interval.statements = sql.total().executions;
    interval.statement_ns = sql.total().elapsed_ns;
    interval.write_transactions = sql.statements[StatementKind::Commit as usize].attempts;
    interval.maintenance_jobs = after.owner.maintenance_jobs - before.owner.maintenance_jobs;
    interval.maintenance_ns = after.owner.maintenance_ns - before.owner.maintenance_ns;
    let (w, v) = (&after.writer, &before.writer);
    interval.writer_transactions = w.transactions - v.transactions;
    interval.writer_writes = w.write_transactions - v.write_transactions;
    interval.writer_transaction_ns = w.transaction_ns - v.transaction_ns;
    interval.writer_statements = w.statements - v.statements;
    interval.writer_statement_ns = w.statement_ns - v.statement_ns;
    interval.writer_commit_ns = w.commit_ns - v.commit_ns;
    for (w, v) in after.readers.iter().zip(&before.readers) {
        interval.reader_transactions +=
            (w.transactions - v.transactions) + (w.read_snapshots - v.read_snapshots);
        interval.reader_ns +=
            (w.transaction_ns - v.transaction_ns) + (w.read_snapshot_ns - v.read_snapshot_ns);
    }
    interval.reader_grants = after.reader_grants - before.reader_grants;
    interval.reader_wait = after.reader_wait - before.reader_wait;
    interval.cache_hits = after.cache_hits - before.cache_hits;
    interval.cache_misses = after.cache_misses - before.cache_misses;
    interval
}

/// One daemon and what the threads of a run share.
struct Run {
    opened: OpenedStore,
    client: OwnerClient,
    epoch: Instant,
    gate: Gate,
}
impl Run {
    /// Read while no Workspace has a job or a completion outstanding.
    fn counters(&self) -> Counters {
        let store = self.opened.diagnostics().unwrap();
        let reads = self.opened.store.read_work();
        let cache = self.opened.store.cache_work().unwrap();
        Counters {
            owner: self.client.diagnostics().unwrap(),
            writer: store.writer,
            readers: store.readers,
            reader_grants: reads.grants,
            reader_wait: reads.queue_wait_ns,
            cache_hits: cache.cache_hits,
            cache_misses: cache.cache_misses,
            cpu: process_cpu(),
        }
    }
}

/// All threads enter a measured interval together and leave it together.
/// The last to arrive reads the counters and opens the interval; the last to
/// finish reads them again. A thread that fails releases the others, and no
/// thread waits longer than `GATE` for them.
struct Gate {
    state: Mutex<Meeting>,
    changed: Condvar,
    threads: usize,
}
#[derive(Default)]
struct Meeting {
    arrived: usize,
    finished: usize,
    /// The last interval opened and the last closed, one-based.
    opened: usize,
    closed: usize,
    failed: bool,
    before: Option<(Counters, Instant)>,
    intervals: Vec<Interval>,
}
impl Gate {
    fn wait(
        &self,
        mut meeting: std::sync::MutexGuard<'_, Meeting>,
        done: impl Fn(&Meeting) -> bool,
    ) {
        let until = Instant::now() + GATE;
        while !done(&meeting) {
            assert!(!meeting.failed, "another Workspace's thread failed");
            let left = until.saturating_duration_since(Instant::now());
            assert!(!left.is_zero(), "the other Workspaces did not arrive");
            meeting = self.changed.wait_timeout(meeting, left).unwrap().0;
        }
    }
    fn enter(&self, run: &Run, number: usize) {
        let mut meeting = self.state.lock().unwrap();
        meeting.arrived += 1;
        if meeting.arrived == self.threads {
            meeting.arrived = 0;
            meeting.before = Some((run.counters(), Instant::now()));
            meeting.opened = number;
            self.changed.notify_all();
            return;
        }
        self.wait(meeting, |meeting| meeting.opened >= number);
    }
    fn leave(&self, run: &Run, number: usize) {
        let mut meeting = self.state.lock().unwrap();
        meeting.finished += 1;
        if meeting.finished == self.threads {
            meeting.finished = 0;
            let (before, started) = meeting.before.take().expect("an open interval");
            let wall = nanos(started);
            meeting
                .intervals
                .push(interval(&before, &run.counters(), wall));
            meeting.closed = number;
            self.changed.notify_all();
            return;
        }
        self.wait(meeting, |meeting| meeting.closed >= number);
    }
}
/// Releases the other threads when this one unwinds.
struct Failing<'a>(&'a Gate);
impl Drop for Failing<'_> {
    fn drop(&mut self) {
        if thread::panicking() {
            if let Ok(mut meeting) = self.0.state.lock() {
                meeting.failed = true;
            }
            self.0.changed.notify_all();
        }
    }
}

/// One Workspace's thread: `gates` rounds of step, gate, Commit; then one
/// interval of `free` steps, each followed at once by its Commit.
fn work(run: &Run, workspace: &BoundWorkspace, gates: usize, free: usize) -> Vec<Sample> {
    let _failing = Failing(&run.gate);
    let mut clock = 1_800_000_000;
    let mut pools = Pools::default();
    let mut samples = Vec::with_capacity(gates + free);
    for round in 0..gates {
        step(workspace, &mut clock, &mut pools, round);
        run.gate.enter(run, round + 1);
        samples.push(commit(run, workspace));
        run.gate.leave(run, round + 1);
    }
    run.gate.enter(run, gates + 1);
    for round in gates..gates + free {
        let started = Instant::now();
        step(workspace, &mut clock, &mut pools, round);
        let command = nanos(started);
        samples.push(Sample {
            command,
            ..commit(run, workspace)
        });
    }
    run.gate.leave(run, gates + 1);
    samples
}

fn mean(values: impl Iterator<Item = u64>) -> f64 {
    let (mut sum, mut count) = (0.0, 0.0);
    for value in values {
        sum += value as f64;
        count += 1.0;
    }
    if count == 0.0 {
        0.0
    } else {
        sum / count
    }
}
fn ms(nanoseconds: f64) -> String {
    format!("{:.2}", nanoseconds / 1e6)
}
fn us(nanoseconds: f64) -> String {
    format!("{:.1}", nanoseconds / 1e3)
}
fn spread(mut walls: Vec<u64>) -> String {
    walls.sort_unstable();
    let at = |fraction: f64| walls[((walls.len() - 1) as f64 * fraction) as usize] as f64;
    format!(
        "mean={} p50={} p95={} max={}",
        ms(mean(walls.iter().copied())),
        ms(at(0.5)),
        ms(at(0.95)),
        ms(at(1.0))
    )
}

/// Means of one Commit, nanoseconds, of the gate rounds of one run.
#[derive(Clone, Copy, Default)]
struct Row {
    workspaces: usize,
    wall: f64,
    cpu_thread: f64,
    cpu_process: f64,
    owner_wait: f64,
    owner_service: f64,
    /// Port wall that is neither the job's wait nor its service: submission
    /// and the way back to the thread that asked.
    port_return: f64,
    writer_transaction: f64,
    writer_statement: f64,
    writer_transactions: f64,
    reader_wait: f64,
    record_jobs: f64,
}

fn report(workspaces: usize, kind: &str, commits: &[Sample], intervals: &[Interval]) -> Row {
    let n = commits.len() as f64;
    let per = |field: fn(&Interval) -> u64| intervals.iter().map(field).sum::<u64>() as f64 / n;
    let m = |field: fn(&Sample) -> u64| mean(commits.iter().map(field));
    let class = |values: fn(&Interval) -> [u64; 6], class: ServiceClass| {
        intervals
            .iter()
            .map(|interval| values(interval)[class as usize])
            .sum::<u64>() as f64
            / n
    };
    let classes = |values: fn(&Interval) -> [u64; 6], unit: fn(f64) -> String| {
        format!(
            "read={} mutation={} capture={} lifecycle={} record={} source={}",
            unit(class(values, ServiceClass::Read)),
            unit(class(values, ServiceClass::Mutation)),
            unit(class(values, ServiceClass::Capture)),
            unit(class(values, ServiceClass::Lifecycle)),
            unit(class(values, ServiceClass::OperationRecord)),
            unit(class(values, ServiceClass::Source)),
        )
    };
    let count = |value: f64| format!("{value:.1}");
    let elapsed = intervals.iter().map(|interval| interval.wall).sum::<u64>() as f64;
    let busy = intervals.iter().map(|interval| interval.cpu).sum::<u64>() as f64;
    let name = format!("MULTI_WORKSPACE workspaces={workspaces} rounds={kind}");
    evidence(format_args!(
        "{name} commits={} commit_ms({}) command_ms={} elapsed_ms={} elapsed_per_commit_ms={} cpu_thread_ms={} cpu_process_per_commit_ms={} cores_busy={:.2} owner_busy={:.2}",
        commits.len(),
        spread(commits.iter().map(|sample| sample.wall).collect()),
        ms(m(|s| s.command)),
        ms(elapsed),
        ms(elapsed / n),
        ms(m(|s| s.cpu)),
        ms(busy / n),
        busy / elapsed,
        (per(|i| i.service.iter().sum()) + per(|i| i.maintenance_ns)) * n / elapsed,
    ));
    evidence(format_args!(
        "{name} PARTS before_ms={} acquire_ms={} construct_ms={} release_ms={} after_ms={} record_port(calls={:.1} ms={}) reader_port(calls={:.1} ms={}) construct_outside_ports_ms={}",
        ms(m(|s| s.before)),
        ms(m(|s| s.acquire)),
        ms(m(|s| s.construct)),
        ms(m(|s| s.release)),
        ms(m(|s| s.after)),
        m(|s| s.record_calls),
        ms(m(|s| s.record_ns)),
        m(|s| s.read_calls),
        ms(m(|s| s.read_ns)),
        ms(m(|s| s.construct) - m(|s| s.record_ns) - m(|s| s.read_ns)),
    ));
    evidence(format_args!(
        "{name} OWNER jobs({}) service_ms({}) queue_wait_ms({}) statements={:.1} statement_ms={} write_transactions={:.1} maintenance(jobs={:.1} ms={})",
        classes(|i| i.jobs, count),
        classes(|i| i.service, ms),
        classes(|i| i.waited, ms),
        per(|i| i.statements),
        ms(per(|i| i.statement_ns)),
        per(|i| i.write_transactions),
        per(|i| i.maintenance_jobs),
        ms(per(|i| i.maintenance_ns)),
    ));
    let record = ServiceClass::OperationRecord;
    let jobs = class(|i| i.jobs, record).max(1.0);
    evidence(format_args!(
        "{name} RECORD_JOB_US service={} queue_wait={} port={}",
        us(class(|i| i.service, record) / jobs),
        us(class(|i| i.waited, record) / jobs),
        us(m(|s| s.record_ns) / m(|s| s.record_calls).max(1.0)),
    ));
    evidence(format_args!(
        "{name} STORE writer(transactions={:.1} write={:.1} transaction_ms={} statements={:.1} statement_ms={} commit_ms={}) readers(transactions={:.1} ms={} grants={:.1} admission_wait_ms={}) cache(hits={:.1} misses={:.1})",
        per(|i| i.writer_transactions),
        per(|i| i.writer_writes),
        ms(per(|i| i.writer_transaction_ns)),
        per(|i| i.writer_statements),
        ms(per(|i| i.writer_statement_ns)),
        ms(per(|i| i.writer_commit_ns)),
        per(|i| i.reader_transactions),
        ms(per(|i| i.reader_ns)),
        per(|i| i.reader_grants),
        ms(per(|i| i.reader_wait)),
        per(|i| i.cache_hits),
        per(|i| i.cache_misses),
    ));
    let wait = per(|i| i.waited.iter().sum());
    let service = per(|i| i.service.iter().sum());
    // Only the record and reader ports are clocked; their jobs are the
    // OperationRecord class and, in a gate round, all of the Read class.
    let ported = class(|i| i.service, record)
        + class(|i| i.waited, record)
        + class(|i| i.service, ServiceClass::Read)
        + class(|i| i.waited, ServiceClass::Read);
    Row {
        workspaces,
        wall: m(|s| s.wall),
        cpu_thread: m(|s| s.cpu),
        cpu_process: busy / n,
        owner_wait: wait,
        owner_service: service,
        port_return: m(|s| s.record_ns) + m(|s| s.read_ns) - ported,
        writer_transaction: per(|i| i.writer_transaction_ns),
        writer_statement: per(|i| i.writer_statement_ns),
        writer_transactions: per(|i| i.writer_transactions),
        reader_wait: per(|i| i.reader_wait),
        record_jobs: class(|i| i.jobs, record),
    }
}

/// One daemon, `workspaces` branches of one Layer, one thread for each.
/// Returns the gate rounds' means and every Workspace's published tree.
fn run(workspaces: usize, gates: usize, free: usize) -> (Row, Vec<model::Flat>, Vec<u64>) {
    let tree = Tree::new(&format!("multi-workspace-{workspaces}"), workspaces, tree);
    let opened = open_store_observed(
        tree.fixture.config.clone(),
        support::BINDING,
        support::CURSOR,
        READERS,
        CACHE,
        ReservationBlocks::default(),
    )
    .unwrap();
    let owner = Owner::start(
        &tree.fixture.directory.join("overlay-run.sqlite"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let daemon = Daemon {
        store: opened.store.clone(),
        owner,
    };
    let bound = (0..workspaces)
        .map(|n| daemon.bind(tree.branches[n], n as u8 + 1))
        .collect::<Vec<_>>();
    let run = Arc::new(Run {
        opened,
        client: daemon.owner.client(),
        epoch: Instant::now(),
        gate: Gate {
            state: Mutex::new(Meeting::default()),
            changed: Condvar::new(),
            threads: workspaces,
        },
    });
    // Detached threads and a bounded wait for each: a thread that never
    // ends fails this test instead of holding it.
    let (sender, receiver) = mpsc::channel();
    for (number, workspace) in bound.iter().enumerate() {
        let (run, workspace, sender) = (run.clone(), workspace.clone(), sender.clone());
        thread::Builder::new()
            .name(format!("workspace-{number}"))
            .spawn(move || {
                let samples = work(&run, &workspace, gates, free);
                let _ = sender.send((number, samples));
            })
            .unwrap();
    }
    drop(sender);
    let until = Instant::now() + Duration::from_secs(100);
    let mut samples = vec![Vec::new(); workspaces];
    for _ in 0..workspaces {
        let left = until.saturating_duration_since(Instant::now());
        let (number, done) = receiver
            .recv_timeout(left)
            .expect("every Workspace's thread ends with its samples");
        samples[number] = done;
    }
    let intervals = std::mem::take(&mut run.gate.state.lock().unwrap().intervals);
    assert_eq!(intervals.len(), gates + 1);

    // Each gate round: its record jobs are exactly the constructors' calls,
    // and the Commits of different Workspaces were constructing together.
    let record = ServiceClass::OperationRecord as usize;
    let mut together = 0;
    let mut calls = Vec::with_capacity(gates);
    for round in 0..gates {
        let of = |field: fn(&Sample) -> u64| samples.iter().map(move |own| field(&own[round]));
        assert_eq!(
            intervals[round].jobs[record],
            of(|s| s.record_calls).sum::<u64>(),
            "round {round}: record jobs of the owner and of the constructors"
        );
        assert_eq!(
            intervals[round].jobs[ServiceClass::Capture as usize],
            2 * workspaces as u64
        );
        assert_eq!(intervals[round].jobs[ServiceClass::Mutation as usize], 0);
        let first = samples[0][round].record_calls;
        assert!(
            of(|s| s.record_calls).all(|calls| calls == first),
            "round {round}: every Workspace's Commit asks for the same record jobs"
        );
        calls.push(first);
        together += usize::from(
            of(|s| s.construct_start).max().unwrap() < of(|s| s.construct_end).min().unwrap(),
        );
    }
    let free_calls = (gates..gates + free)
        .map(|round| samples[0][round].record_calls)
        .collect::<Vec<_>>();
    calls.extend(free_calls);
    evidence(format_args!(
        "MULTI_WORKSPACE workspaces={workspaces} gate_rounds={gates} rounds_with_every_construction_overlapping={together} free_steps={free}"
    ));
    if workspaces > 1 && gates > 0 {
        assert!(
            together > 0,
            "Commits of different Workspaces never overlapped"
        );
    }
    let kept = WARM.min(gates.saturating_sub(1));
    let gated = samples
        .iter()
        .flat_map(|own| own[kept..gates].iter().copied())
        .collect::<Vec<_>>();
    let mut row = Row::default();
    if !gated.is_empty() {
        row = report(workspaces, "gate", &gated, &intervals[kept..gates]);
    }
    let freed = samples
        .iter()
        .flat_map(|own| own[gates..].iter().copied())
        .collect::<Vec<_>>();
    if !freed.is_empty() {
        report(workspaces, "free", &freed, &intervals[gates..]);
    }

    // What every Workspace published, read back through a client of the
    // test's own; then an ordinary close of each.
    let mut published = Vec::with_capacity(workspaces);
    for workspace in &bound {
        let snapshot = workspace.snapshot().unwrap();
        let head = daemon.snapshot(snapshot.branch.id);
        assert_eq!(head.effective_root, snapshot.effective_root);
        assert_eq!(head.branch.head_commit, snapshot.branch.head_commit);
        published.push(daemon.expected(&snapshot));
        daemon.close(workspace);
    }
    drop(bound);
    let run = Arc::into_inner(run).expect("every thread ended");
    drop(run.client);
    drop(run.opened);
    daemon.stop();
    tree.finish();
    (row, published, calls)
}

#[test]
fn commits_of_several_workspaces_overlap_and_their_waits_are_counted() {
    let selected = std::env::var("MULTI_WORKSPACE_COMMITS").ok();
    let (gates, free, counts) = match selected.as_deref() {
        Some(value) => {
            let mut parts = value.split(',');
            let mut number = || {
                parts
                    .next()
                    .expect("gate_rounds,free_steps")
                    .parse()
                    .unwrap()
            };
            let (gates, free): (usize, usize) = (number(), number());
            let counts = parts
                .next()
                .unwrap_or("1+2+4")
                .split('+')
                .map(|count| count.parse::<usize>().unwrap())
                .collect::<Vec<_>>();
            (gates, free, counts)
        }
        None => (3, 2, vec![1, 2]),
    };
    assert!(gates + free <= 100, "the pools hold a hundred steps");
    let mut rows = Vec::new();
    let mut first: Option<(model::Flat, Vec<u64>)> = None;
    for workspaces in counts {
        let (row, published, calls) = run(workspaces, gates, free);
        // The same steps publish the same tree and ask for the same record
        // jobs on every branch, alone or beside other Workspaces.
        let (expected, expected_calls) =
            first.get_or_insert_with(|| (published[0].clone(), calls.clone()));
        for (number, flat) in published.iter().enumerate() {
            model::assert_same(
                expected,
                flat,
                &format!("{workspaces} Workspaces, Workspace {number}"),
            );
        }
        assert_eq!(*expected_calls, calls, "record jobs of each Commit");
        rows.push(row);
    }
    // The gate rounds of each count against the first count's, a Commit.
    let Some(base) = rows.first().copied().filter(|row| row.wall > 0.0) else {
        return;
    };
    for row in &rows[1..] {
        let writer_wait = (row.writer_transaction - row.writer_statement)
            - (base.writer_transaction - base.writer_statement) * row.writer_transactions
                / base.writer_transactions.max(1.0);
        let named = (row.owner_wait - base.owner_wait)
            + (row.owner_service - base.owner_service)
            + (row.port_return - base.port_return)
            + (row.writer_transaction - base.writer_transaction)
            + (row.reader_wait - base.reader_wait);
        // With one connection, no Commit of `workspaces` at once can end
        // before the owner has served every one of them.
        let floor = base.wall.max(row.workspaces as f64 * base.owner_service);
        evidence(format_args!(
            "MULTI_WORKSPACE_ATTRIBUTION workspaces={} against={} record_jobs={:.1} commit_ms={} extra_ms={} one_owner_floor_ms={} owner_queue_wait_ms={} owner_service_ms={} port_return_ms={} store_writer_ms={} (of_it_statements_ms={} waiting_inferred_ms={}) reader_admission_ms={} remainder_ms={} cpu_thread_ms={}->{} cpu_process_per_commit_ms={}->{}",
            row.workspaces,
            base.workspaces,
            row.record_jobs,
            ms(row.wall),
            ms(row.wall - base.wall),
            ms(floor),
            ms(row.owner_wait - base.owner_wait),
            ms(row.owner_service - base.owner_service),
            ms(row.port_return - base.port_return),
            ms(row.writer_transaction - base.writer_transaction),
            ms(row.writer_statement - base.writer_statement),
            ms(writer_wait),
            ms(row.reader_wait - base.reader_wait),
            ms(row.wall - base.wall - named),
            ms(base.cpu_thread),
            ms(row.cpu_thread),
            ms(base.cpu_process),
            ms(row.cpu_process),
        ));
    }
}
