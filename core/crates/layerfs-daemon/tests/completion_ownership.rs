//! Original per-job statement families and their Workspace aggregate, through
//! the public direct-call API only.
use layerfs_daemon::{
    JobReceipt, Owner, OwnerClient, OwnerConfig, OwnerError, OwnerWork, Response, ServiceClass,
};
use layerfs_overlay::{
    AllocationWork, DatabaseWork, Inode, InodeKind, Lease, LeaseKind, OverlayError, PayloadWork,
    ProfileConfig, Publication, Route, StatementKind,
};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
    time::{Duration, Instant},
};

/// Most statement families one Lifecycle job runs.
const LIFECYCLE_FAMILIES: usize = 7;
type Done = Result<JobReceipt, OwnerError>;
type Job = Box<dyn FnOnce(&OwnerClient, Option<Route>) -> Done>;
fn job(action: impl FnOnce(&OwnerClient, Option<Route>) -> Done + 'static) -> Job {
    Box::new(action)
}

struct Temp(PathBuf);
impl Temp {
    fn new() -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(1);
        let path = std::env::temp_dir().join(format!(
            "layerfs-completion-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir(&path).unwrap();
        Self(path)
    }
}
impl Drop for Temp {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}
fn start(temp: &Temp) -> Owner {
    Owner::start(
        &temp.0.join("overlay.sqlite"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap()
}
fn submit(
    client: &OwnerClient,
    route: Option<Route>,
    command: impl FnOnce(&OwnerClient, Option<Route>) -> Done,
) -> JobReceipt {
    command(client, route).unwrap_or_else(|error| panic!("job: {error:?}"))
}
/// Waits, bounded, until a counted job of `class` beyond `from` has run.
fn counted(client: &OwnerClient, class: ServiceClass, from: u64) {
    let deadline = Instant::now() + Duration::from_secs(20);
    while client.diagnostics().unwrap().jobs[class as usize] <= from {
        assert!(Instant::now() < deadline, "no {class:?} job was counted");
        std::thread::yield_now();
    }
}
/// Bounded join: a caller that never returns fails the test instead of hanging it.
fn joined(call: std::thread::JoinHandle<Done>) -> JobReceipt {
    let deadline = Instant::now() + Duration::from_secs(20);
    while !call.is_finished() {
        assert!(Instant::now() < deadline, "the waiting call never returned");
        std::thread::yield_now();
    }
    call.join().unwrap().unwrap()
}
fn value(serial: u64) -> Inode {
    Inode {
        serial,
        kind: InodeKind::File,
        mode: 0o644,
        mtime_seconds: 1,
        mtime_nanoseconds: 2,
        nlink: 1,
        size: 0,
        inherited_cutoff: 0,
        born: 0,
        entries: 0,
        subdirs: 0,
    }
}

/// Sums original receipts and compares them with the same Workspace's foreground
/// aggregate. Maintenance has its own aggregate and never enters either side.
struct Ledger {
    client: OwnerClient,
    before: OwnerWork,
    sql: DatabaseWork,
    payload: PayloadWork,
    allocation: AllocationWork,
    lifecycle_max: usize,
    checks: u64,
}
impl Ledger {
    fn new(client: &OwnerClient) -> Self {
        Self {
            client: client.clone(),
            before: client.diagnostics().unwrap(),
            sql: DatabaseWork::default(),
            payload: PayloadWork::default(),
            allocation: AllocationWork::default(),
            lifecycle_max: 0,
            checks: 0,
        }
    }
    fn take(&mut self, name: &str, lifecycle: bool, done: &JobReceipt) {
        let work = done.work();
        assert_eq!(work.sql.total(), work.sql.expanded().total());
        assert_eq!(
            work.sql.families(),
            work.sql
                .expanded()
                .statements
                .iter()
                .filter(|row| row.attempts != 0)
                .count(),
            "{name}: a family row exists exactly for attempted statements"
        );
        self.sql.accumulate(work.sql.expanded());
        self.payload.accumulate(work.payload);
        self.allocation.accumulate(work.allocation);
        // Readiness checks a waiting call ran before its one effect.
        self.checks += work.jobs.saturating_sub(1);
        if lifecycle {
            self.lifecycle_max = self.lifecycle_max.max(work.sql.families());
        }
        println!(
            "S7_JOB_FAMILIES command={name} lifecycle={lifecycle} families={} jobs={} ok={}",
            work.sql.families(),
            work.jobs,
            done.result().is_ok()
        );
    }
    /// Valid whenever no call is still waiting: every returned receipt's work
    /// is already in the Workspace aggregate, and nothing else is.
    fn reconcile(&self) {
        let now = self.client.diagnostics().unwrap();
        assert_eq!(
            now.sql_foreground.since(&self.before.sql_foreground),
            self.sql
        );
        assert_eq!(
            now.payload_foreground.since(self.before.payload_foreground),
            self.payload
        );
        assert_eq!(
            now.allocation_foreground
                .since(self.before.allocation_foreground),
            self.allocation
        );
    }
    fn run(
        &mut self,
        name: &str,
        lifecycle: bool,
        route: Route,
        command: impl FnOnce(&OwnerClient, Option<Route>) -> Done,
    ) -> JobReceipt {
        let done = submit(&self.client, Some(route), command);
        self.take(name, lifecycle, &done);
        self.reconcile();
        done
    }
}

#[test]
fn original_family_receipts_equal_the_foreground_aggregate_on_every_path() {
    let temp = Temp::new();
    let owner = start(&temp);
    let client = owner.client();
    let mut ledger = Ledger::new(&client);
    let opened = submit(
        &client,
        None,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.open(job_route, [31; 32], [32; 32])
        },
    );
    ledger.take("Open", true, &opened);
    ledger.reconcile();
    let route = match opened.result() {
        Ok(Response::Opened(route)) => *route,
        other => panic!("open: {other:?}"),
    };
    let open_work = opened.work();
    for kind in [StatementKind::Begin, StatementKind::Commit] {
        assert_eq!(open_work.sql.family(kind).unwrap().attempts, 1);
    }
    assert!(open_work.sql.family(StatementKind::Rollback).is_none());
    assert!(open_work.sql.family(StatementKind::Payload).is_none());
    drop(opened);

    for (name, command) in [
        (
            "State",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.state(job_route)
            }),
        ),
        (
            "CleanupState",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.cleanup_state(job_route)
            }),
        ),
        (
            "MaintenanceIdle",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.maintenance_idle(job_route)
            }),
        ),
        (
            "RetainedCapture",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.retained_capture(job_route)
            }),
        ),
        (
            "RetainedBaseSource",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.retained_base_source(job_route, 5)
            }),
        ),
        (
            "RetainedFile",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.retained_file(job_route, 1)
            }),
        ),
        (
            "RetainedFileRead",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.retained_file_read(job_route, 1)
            }),
        ),
        (
            "RetainedCapturedReader",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.retained_captured_reader(job_route, 1)
            }),
        ),
        (
            "RetainedLookup",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.retained_lookup(job_route, 1)
            }),
        ),
        (
            "RetainedOperation",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.retained_operation(job_route, 1)
            }),
        ),
    ] {
        assert!(ledger.run(name, true, route, command).result().is_ok());
    }
    let lease = Lease {
        kind: LeaseKind::Reader,
        owner: 7,
        resource: 0,
    };
    assert!(ledger
        .run(
            "Acquire",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
                .acquire(job_route, lease)
        )
        .result()
        .is_ok());
    assert!(ledger
        .run(
            "Release",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
                .release(job_route, lease)
        )
        .result()
        .is_ok());
    let operation = match ledger
        .run(
            "AcquireOperation",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_operation(job_route, 1)
            },
        )
        .result()
    {
        Ok(Response::Operation(Some(owner))) => *owner,
        other => panic!("operation: {other:?}"),
    };
    assert!(ledger
        .run(
            "ReleaseOperation",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
                .release_operation(job_route, operation)
        )
        .result()
        .is_ok());

    // A reply attempt, then the same attempt again. The ticket is held in the
    // engine's memory, so neither job runs SQL: the first finds a live
    // Workspace with nothing to queue, and the second fails on a ticket that
    // is no longer held.
    let publish = |ledger: &mut Ledger, serial: u64| -> Publication {
        let done = ledger.run(
            "Publish",
            false,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.publish(job_route, value(serial), None, None)
            },
        );
        match done.result() {
            Ok(Response::Published(publication)) => *publication,
            other => panic!("publish: {other:?}"),
        }
    };
    let first = publish(&mut ledger, 2);
    let replied = ledger.run(
        "ReplyAttempted",
        true,
        route,
        |job_client: &layerfs_daemon::OwnerClient, _| job_client.reply_attempted(first),
    );
    assert!(replied.result().is_ok());
    let failed = ledger.run(
        "ReplyAttempted-again",
        true,
        route,
        |job_client: &layerfs_daemon::OwnerClient, _| job_client.reply_attempted(first),
    );
    assert!(matches!(
        failed.result(),
        Err(OwnerError::Overlay(OverlayError::Stale))
    ));
    for done in [&replied, &failed] {
        for kind in [
            StatementKind::Begin,
            StatementKind::Commit,
            StatementKind::Rollback,
            StatementKind::Frontier,
        ] {
            assert!(done.work().sql.family(kind).is_none(), "{kind:?}");
        }
        // Each is a counted hold that is no job; its receipt reports nothing.
        assert_eq!(done.work().sql.total().attempts, 0);
        assert_eq!(done.work().jobs, 0);
    }
    drop((replied, failed));

    let source = match ledger
        .run(
            "AcquireBaseSource",
            false,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_base_source(job_route, 7)
            },
        )
        .result()
    {
        Ok(Response::BaseSource(source)) => *source,
        other => panic!("source: {other:?}"),
    };
    // A job that fails inside its transaction and rolls back keeps its own
    // actual families: the same owner's second row is refused by its insert.
    let failed = ledger.run(
        "AcquireBaseSource-again",
        false,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.acquire_base_source(job_route, 7)
        },
    );
    assert!(matches!(failed.result(), Err(OwnerError::Overlay(_))));
    assert_eq!(
        failed
            .work()
            .sql
            .family(StatementKind::Rollback)
            .unwrap()
            .attempts,
        1
    );
    assert_eq!(
        failed
            .work()
            .sql
            .family(StatementKind::Begin)
            .unwrap()
            .attempts,
        1
    );
    assert!(failed.work().sql.family(StatementKind::Commit).is_none());
    drop(failed);
    let file = match ledger
        .run(
            "OpenFile",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.open_file(job_route, source, 11, value(2), true)
            },
        )
        .result()
    {
        Ok(Response::File(Some(file))) => *file,
        other => panic!("file: {other:?}"),
    };
    let read = match ledger
        .run(
            "AcquireFileRead",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_file_read(job_route, source, file, 12)
            },
        )
        .result()
    {
        Ok(Response::FileReader(Some(read))) => *read,
        other => panic!("read: {other:?}"),
    };
    let lookup = match ledger
        .run(
            "AcquireLookup",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_lookup(job_route, source, 13, value(2), 1)
            },
        )
        .result()
    {
        Ok(Response::Lookup(Some(lookup))) => *lookup,
        other => panic!("lookup: {other:?}"),
    };
    let lookup_read = match ledger
        .run(
            "AcquireLookupRead",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_lookup_read(job_route, source, lookup, 14)
            },
        )
        .result()
    {
        Ok(Response::FileReader(Some(read))) => *read,
        other => panic!("lookup read: {other:?}"),
    };
    for (name, command) in [
        (
            "ReleaseFileRead",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.release_file_read(job_route, lookup_read)
            }),
        ),
        (
            "ReleaseLookup",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.release_lookup(job_route, lookup)
            }),
        ),
        (
            "ReleaseFileRead",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.release_file_read(job_route, read)
            }),
        ),
        (
            "CloseFile",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.close_file(job_route, file)
            }),
        ),
        (
            "ReleaseBaseSource",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.release_base_source(job_route, source)
            }),
        ),
    ] {
        let done = ledger.run(name, true, route, command);
        assert!(done.result().is_ok(), "{name}: {done:?}");
    }

    // A capture waits on the unattempted reply ticket. Its readiness checks are
    // counted foreground jobs before its receipt exists, so reconcile afterwards.
    let pending_reply = submit(
        &client,
        Some(route),
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.publish(job_route, value(3), None, None)
        },
    );
    ledger.take("Publish", false, &pending_reply);
    let ticket = match pending_reply.result() {
        Ok(Response::Published(publication)) => *publication,
        other => panic!("publish: {other:?}"),
    };
    let checks = client.diagnostics().unwrap().jobs[ServiceClass::Capture as usize];
    let capture = {
        let client = client.clone();
        std::thread::spawn(move || client.capture(Some(route)))
    };
    counted(&client, ServiceClass::Capture, checks);
    let state = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.state(job_route),
    );
    ledger.take("State", true, &state);
    assert!(!capture.is_finished());
    let replied = submit(
        &client,
        Some(route),
        |job_client: &layerfs_daemon::OwnerClient, _| job_client.reply_attempted(ticket),
    );
    ledger.take("ReplyAttempted", true, &replied);
    let captured = joined(capture);
    ledger.take("Capture", false, &captured);
    ledger.reconcile();
    drop((state, replied, pending_reply));
    let capture = match captured.result() {
        Ok(Response::Captured(capture)) => *capture,
        other => panic!("capture: {other:?}"),
    };
    let reader = match ledger
        .run(
            "AcquireCapturedReader",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_captured_reader(job_route, capture, 21)
            },
        )
        .result()
    {
        Ok(Response::CapturedReader(Some(reader))) => *reader,
        other => panic!("reader: {other:?}"),
    };
    for (name, command) in [
        (
            "ReleaseCapturedReader",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.release_captured_reader(job_route, reader)
            }),
        ),
        (
            "ResolveFailed",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.resolve_failed(job_route, capture)
            }),
        ),
    ] {
        let done = ledger.run(name, true, route, command);
        assert!(done.result().is_ok(), "{name}: {done:?}");
    }

    // The next capture may wait for automatic composition; close with it held.
    let last = publish(&mut ledger, 4);
    assert!(ledger
        .run(
            "ReplyAttempted",
            true,
            route,
            |job_client: &layerfs_daemon::OwnerClient, _| job_client.reply_attempted(last)
        )
        .result()
        .is_ok());
    let next = submit(
        &client,
        Some(route),
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.capture(job_route),
    );
    ledger.take("Capture", false, &next);
    ledger.reconcile();
    let next = match next.result() {
        Ok(Response::Captured(capture)) => *capture,
        other => panic!("capture: {other:?}"),
    };
    for (name, command) in [
        (
            "Close",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.close(job_route)
            }),
        ),
        (
            "ReleaseClosedCapture",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.release_closed_capture(job_route, next)
            }),
        ),
        (
            "CleanupState",
            job(move |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.cleanup_state(job_route)
            }),
        ),
    ] {
        let done = ledger.run(name, true, route, command);
        assert!(done.result().is_ok(), "{name}: {done:?}");
    }

    assert!(ledger.checks >= 1);
    assert!(ledger.lifecycle_max <= LIFECYCLE_FAMILIES);
    println!(
        "S7_FAMILY_LEDGER lifecycle_max_families={} readiness_checks={} foreground_attempts={}",
        ledger.lifecycle_max,
        ledger.checks,
        ledger.sql.total().attempts
    );
    assert!(client.maintenance_failure().unwrap().is_none());
    owner.stop().unwrap();
}
