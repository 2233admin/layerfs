//! Deterministic public owner/service proofs, independent of unbuilt FUSE/control.
use layerfs_daemon::{JobReceipt, Owner, OwnerClient, OwnerConfig, OwnerError, Response};
use layerfs_overlay::{Inode, InodeKind, ProfileConfig, Publication, Route};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
};

struct Temp(PathBuf);
impl Temp {
    fn new() -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(1);
        let path = std::env::temp_dir().join(format!(
            "layerfs-owner-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir(&path).unwrap();
        Self(path)
    }
}
impl Drop for Temp {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).unwrap();
    }
}
type Done = Result<JobReceipt, OwnerError>;
fn submit(
    client: &OwnerClient,
    route: Option<Route>,
    command: impl FnOnce(&OwnerClient, Option<Route>) -> Done,
) -> JobReceipt {
    command(client, route).unwrap_or_else(|error| panic!("refused before effect: {error:?}"))
}
/// A job on its own thread: a waiting Capture or known install blocks its
/// caller before any effect.
fn spawn(
    client: &OwnerClient,
    route: Route,
    command: impl FnOnce(&OwnerClient, Option<Route>) -> Done + Send + 'static,
) -> std::thread::JoinHandle<Done> {
    let client = client.clone();
    std::thread::spawn(move || command(&client, Some(route)))
}
/// Bounded wait until a waiting job of `class` recorded a readiness check
/// after `from`, the class count observed before it was spawned.
fn waits(client: &OwnerClient, class: layerfs_daemon::ServiceClass, from: u64) {
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(5);
    while client.diagnostics().unwrap().jobs[class as usize] <= from {
        assert!(std::time::Instant::now() < deadline, "no readiness check");
        std::thread::yield_now();
    }
}
fn class_jobs(client: &OwnerClient, class: layerfs_daemon::ServiceClass) -> u64 {
    client.diagnostics().unwrap().jobs[class as usize]
}
/// The result of a spawned job, within a bound.
fn joined(job: std::thread::JoinHandle<Done>) -> Done {
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(5);
    while !job.is_finished() {
        assert!(
            std::time::Instant::now() < deadline,
            "the job never returned"
        );
        std::thread::yield_now();
    }
    job.join().unwrap()
}
fn open(client: &OwnerClient, tag: u8) -> Route {
    let done = submit(client, None, |job_client: &OwnerClient, job_route| {
        job_client.open(job_route, [tag; 32], [17; 32])
    });
    match done.result() {
        Ok(Response::Opened(route)) => *route,
        x => panic!("open: {x:?}"),
    }
}

#[test]
fn last_release_makes_the_file_disposable_without_a_terminal_row_sweep() {
    use layerfs_overlay::{CleanupState, Lease, LeaseKind};
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let target = open(&client, 110);
    let other = open(&client, 111);
    let lease = Lease {
        kind: LeaseKind::Reader,
        owner: 7,
        resource: 0,
    };
    assert!(submit(
        &client,
        Some(target),
        |job_client: &OwnerClient, job_route| job_client.acquire(job_route, lease)
    )
    .result()
    .is_ok());
    for serial in 1..=512 {
        let done = write(&client, target, serial);
        let p = match done.result() {
            Ok(Response::Published(p)) => *p,
            x => panic!("{x:?}"),
        };
        drop(done);
        assert!(
            submit(&client, Some(target), |job_client: &OwnerClient, _| {
                job_client.reply_attempted(p)
            })
            .result()
            .is_ok()
        );
    }
    assert!(submit(
        &client,
        Some(target),
        |job_client: &OwnerClient, job_route| job_client.close(job_route)
    )
    .result()
    .is_ok());
    assert!(matches!(
        submit(
            &client,
            Some(target),
            |job_client: &OwnerClient, job_route| job_client.cleanup_state(job_route)
        )
        .result(),
        Ok(Response::CleanupState(CleanupState::Held))
    ));
    assert!(submit(
        &client,
        Some(target),
        |job_client: &OwnerClient, job_route| job_client.release(job_route, lease)
    )
    .result()
    .is_ok());
    assert_eq!(cleanup_state(&client, target), CleanupState::Queued);
    let rows_before = client.diagnostics().unwrap().maintenance_rows;
    assert!(temp
        .0
        .join(format!("{}.sqlite", target.namespace()))
        .is_file());
    assert!(submit(
        &client,
        Some(other),
        |job_client: &OwnerClient, job_route| job_client.state(job_route)
    )
    .result()
    .is_ok());
    assert_eq!(client.diagnostics().unwrap().maintenance_rows, rows_before);
    assert!(client.maintenance_failure().unwrap().is_none());
    owner.stop().unwrap();
}

#[test]
fn terminal_close_does_no_row_maintenance_before_control_disposal() {
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let route = open(&client, 112);
    for serial in 1..=128 {
        let done = write(&client, route, serial);
        let publication = match done.result() {
            Ok(Response::Published(p)) => *p,
            x => panic!("{x:?}"),
        };
        drop(done);
        assert!(submit(&client, Some(route), |job_client: &OwnerClient, _| {
            job_client.reply_attempted(publication)
        })
        .result()
        .is_ok());
    }
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.close(job_route)
    )
    .result()
    .is_ok());
    assert_eq!(
        cleanup_state(&client, route),
        layerfs_overlay::CleanupState::Queued
    );
    assert_eq!(client.diagnostics().unwrap().maintenance_rows, 0);
    assert!(temp
        .0
        .join(format!("{}.sqlite", route.namespace()))
        .is_file());
    assert!(client.maintenance_failure().unwrap().is_none());
    owner.stop().unwrap();
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

#[test]
fn failed_capture_waits_for_readers_while_later_writes_and_idle_composition_progress() {
    use layerfs_overlay::{Lease, LeaseKind};
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("failure"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let route = open(&client, 125);
    for serial in 1..=256 {
        let done = write(&client, route, serial);
        reply(&client, publication(&done));
    }
    let done = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.capture(job_route),
    );
    let capture = match done.result() {
        Ok(Response::Captured(c)) => *c,
        x => panic!("{x:?}"),
    };
    drop(done);
    let reader = Lease {
        kind: LeaseKind::Reader,
        owner: 901,
        resource: capture.generation.number() as u64,
    };
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.acquire(job_route, reader)
    )
    .result()
    .is_ok());
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.resolve_failed(job_route, capture)
    )
    .result()
    .is_ok());
    let checks = class_jobs(&client, layerfs_daemon::ServiceClass::Capture);
    let next = spawn(&client, route, |job_client, job_route| {
        job_client.capture(job_route)
    });
    waits(&client, layerfs_daemon::ServiceClass::Capture, checks);
    // A next capture waits for composition, not behind a payload-sized mutation
    // fence. Later writes must finish while the lower reader remains owned.
    let done = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.publish(job_route, value(999), None, None),
    );
    reply(&client, publication(&done));
    drop(done);
    assert!(!next.is_finished());
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.release(job_route, reader)
    )
    .result()
    .is_ok());
    // No additional write/status/cleanup job triggers the composition.
    let done = joined(next).unwrap();
    let captured = match done.result() {
        Ok(Response::Captured(c)) => *c,
        x => panic!("{x:?}"),
    };
    drop(done);
    let done = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.captured_inodes(job_route, captured, 998),
    );
    assert!(
        matches!(done.result(),Ok(Response::Inodes(rows)) if rows.len()==1 && rows[0].serial==999)
    );
    drop(done);
    assert!(client.maintenance_failure().unwrap().is_none());
    println!(
        "S6_OWNER_FAILURE automatic_work={:?}",
        client.diagnostics().unwrap()
    );
    owner.stop().unwrap();
}
fn write(client: &OwnerClient, route: Route, serial: u64) -> JobReceipt {
    submit(
        client,
        Some(route),
        |job_client: &OwnerClient, job_route| {
            job_client.publish(job_route, value(serial), None, None)
        },
    )
}
fn publication(done: &JobReceipt) -> Publication {
    match done.result() {
        Ok(Response::Published(p)) => *p,
        x => panic!("publication: {x:?}"),
    }
}
fn reply(client: &OwnerClient, p: Publication) {
    let done = submit(client, Some(p.route()), |job_client: &OwnerClient, _| {
        job_client.reply_attempted(p)
    });
    assert!(matches!(done.result(), Ok(Response::Done)));
}

#[test]
fn waiting_capture_allows_unrelated_progress_and_fences_later_mutations() {
    use layerfs_daemon::ServiceClass;
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    assert_eq!(owner.profile().schema_version, 33);
    let client = owner.client();
    let a = open(&client, 1);
    let b = open(&client, 2);
    let published = write(&client, a, 2);
    let p = publication(&published);
    // The publication's reply is not attempted yet, so the Capture has no
    // reply-complete frontier. It waits before its effect rather than being
    // attempted, refused or replayed.
    let checks = class_jobs(&client, ServiceClass::Capture);
    let capture = spawn(&client, a, |job_client, job_route| {
        job_client.capture(job_route)
    });
    waits(&client, ServiceClass::Capture, checks);
    assert!(!capture.is_finished());
    // A mutation that arrives later waits behind that finite frontier; it runs
    // nothing before the Capture and cannot extend what the Capture awaits.
    let mutations = class_jobs(&client, ServiceClass::Mutation);
    let later = spawn(&client, a, |job_client, job_route| {
        job_client.publish(job_route, value(3), None, None)
    });
    // Another Workspace remains runnable beside both.
    let other = submit(&client, Some(b), |job_client: &OwnerClient, job_route| {
        job_client.state(job_route)
    });
    assert!(matches!(other.result(), Ok(Response::State(_))));
    assert!(!capture.is_finished() && !later.is_finished());
    assert_eq!(class_jobs(&client, ServiceClass::Mutation), mutations);
    reply(&client, p);
    let captured = joined(capture).unwrap();
    let c = match captured.result() {
        Ok(Response::Captured(c)) => *c,
        x => panic!("capture: {x:?}"),
    };
    assert_eq!(c.revision, p.revision());
    let later = joined(later).unwrap();
    let later_publication = publication(&later);
    assert!(later_publication.generation.number() > c.generation.number());
    reply(&client, later_publication);
    let page = submit(&client, Some(a), |job_client: &OwnerClient, job_route| {
        job_client.captured_inodes(job_route, c, 0)
    });
    assert!(matches!(page.result(),Ok(Response::Inodes(rows)) if rows==&vec![value(2)]));
    owner.stop().unwrap();
}

#[test]
fn stopping_cancels_unattempted_capture_and_fences_future_admission() {
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let a = open(&client, 5);
    let published = write(&client, a, 2);
    let checks = class_jobs(&client, layerfs_daemon::ServiceClass::Capture);
    let capture = spawn(&client, a, |job_client, job_route| {
        job_client.capture(job_route)
    });
    waits(&client, layerfs_daemon::ServiceClass::Capture, checks);
    assert!(!capture.is_finished());
    owner.stop().unwrap();
    // The stop wakes the waiting Capture before any effect; its unattempted
    // action is returned, never replayed.
    let refused = joined(capture).unwrap_err();
    assert!(
        matches!(&refused, OwnerError::Unattempted { cause, .. } if matches!(cause.as_ref(), OwnerError::Stopped)),
        "{refused:?}"
    );
    assert!(matches!(
        client.state(Some(a)),
        Err(OwnerError::Unattempted { ref cause, .. }) if matches!(cause.as_ref(), OwnerError::Stopped)
    ));
    assert!(matches!(published.result(), Ok(Response::Published(_))));
}

#[test]
fn dropped_receipts_keep_exact_backed_custody() {
    use layerfs_overlay::{Cell, DirectoryEntry, OverlayError, CELL_BYTES, MASK_BYTES};
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let route = open(&client, 120);
    let other = open(&client, 121);
    // The caller drops the receipt. This does not undo the attempted operation
    // or release its separate reply ticket.
    drop(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| {
            job_client.publish(
                job_route,
                value(2),
                Some(DirectoryEntry {
                    inherited: false,
                    parent: 1,
                    name: vec![0xff; 255],
                    serial: Some(2),
                }),
                Some(Cell {
                    offset: 0,
                    data: Box::new([17; CELL_BYTES]),
                    validity: Box::new([255; MASK_BYTES]),
                }),
            )
        },
    ));
    let tickets = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.pending_publications(job_route, 0),
    );
    let p = match tickets.result() {
        Ok(Response::Publications(p)) if p.len() == 1 => p[0],
        x => panic!("{x:?}"),
    };
    assert_eq!(p.revision(), 1);
    drop(tickets);
    // Explicit caller notification of its actual reply-send attempt; observation
    // above did not settle it. Native kernel integration remains a separate proof.
    reply(&client, p);
    drop(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.capture(job_route),
    ));
    let retained = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.retained_capture(job_route),
    );
    let capture = match retained.result() {
        Ok(Response::RetainedCapture(Some(c))) => *c,
        x => panic!("{x:?}"),
    };
    assert_eq!(capture.revision, 1);
    drop(retained);
    let later = write(&client, route, 3);
    let later_p = publication(&later);
    drop(later);
    let observed = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.retained_capture(job_route),
    );
    assert!(matches!(observed.result(),Ok(Response::RetainedCapture(Some(c))) if *c==capture));
    drop(observed);
    let names = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| {
            job_client.captured_directory_entries(job_route, capture, None)
        },
    );
    let after = match names.result() {
        Ok(Response::DirectoryEntries(rows)) => {
            assert_eq!(rows.len(), 1);
            assert_eq!(rows[0].name, vec![0xff; 255]);
            Some((rows[0].parent, rows[0].name.clone()))
        }
        x => panic!("{x:?}"),
    };
    drop(names);
    let end = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| {
            job_client.captured_directory_entries(job_route, capture, after)
        },
    );
    assert!(matches!(end.result(),Ok(Response::DirectoryEntries(rows)) if rows.is_empty()));
    drop(end);
    let invalid = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| {
            job_client.captured_directory_entries(job_route, capture, Some((1, vec![1; 256])))
        },
    );
    assert!(matches!(
        invalid.result(),
        Err(OwnerError::Overlay(OverlayError::Invalid(_)))
    ));
    drop(invalid);
    let wrong_route = submit(
        &client,
        Some(other),
        |job_client: &OwnerClient, job_route| job_client.captured_cell(job_route, capture, 2, 0),
    );
    assert!(matches!(
        wrong_route.result(),
        Err(OwnerError::Overlay(OverlayError::Stale))
    ));
    drop(wrong_route);
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.close(job_route)
    )
    .result()
    .is_ok());
    let bytes = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.captured_cell(job_route, capture, 2, 0),
    );
    assert!(
        matches!(bytes.result(),Ok(Response::Cell(Some(cell))) if cell.data.iter().all(|b|*b==17))
    );
    drop(bytes);
    assert!(submit(
        &client,
        Some(other),
        |job_client: &OwnerClient, job_route| job_client.state(job_route)
    )
    .result()
    .is_ok());
    // No upstream construction/Save/history was entered in this operation. The
    // consumer is fenced, so explicit release has a known local-only disposition.
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.release_closed_capture(job_route, capture)
    )
    .result()
    .is_ok());
    reply(&client, later_p);
    assert!(client.maintenance_failure().unwrap().is_none());
    owner.stop().unwrap();
}

#[test]
fn known_install_fences_later_sources_while_existing_reads_mutations_and_other_work_progress() {
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let route = open(&client, 130);
    let other = open(&client, 131);
    let done = write(&client, route, 2);
    reply(&client, publication(&done));
    drop(done);
    let captured = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.capture(job_route),
    );
    let capture = match captured.result() {
        Ok(Response::Captured(c)) => *c,
        x => panic!("{x:?}"),
    };
    drop(captured);
    let earlier = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.acquire_base_source(job_route, 7),
    );
    let source = match earlier.result() {
        Ok(Response::BaseSource(s)) => *s,
        x => panic!("{x:?}"),
    };
    drop(earlier);
    assert_eq!(source.root(), [17; 32]);
    // The known install waits before its effect for the earlier source. A
    // source acquisition that arrives later waits behind it, before any SQL,
    // so the install's frontier is finite.
    let checks = class_jobs(&client, layerfs_daemon::ServiceClass::Capture);
    let install = spawn(&client, route, move |job_client, job_route| {
        job_client.install(job_route, capture, [77; 32])
    });
    waits(&client, layerfs_daemon::ServiceClass::Capture, checks);
    let sources = class_jobs(&client, layerfs_daemon::ServiceClass::Source);
    let later = spawn(&client, route, |job_client, job_route| {
        job_client.acquire_base_source(job_route, 8)
    });
    assert!(!install.is_finished() && !later.is_finished());
    let read = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.source_inode(job_route, source, 2),
    );
    assert!(matches!(read.result(),Ok(Response::Inode(Some(i))) if i.serial==2));
    drop(read);
    let mutation = write(&client, route, 3);
    let publication = publication(&mutation);
    drop(mutation);
    reply(&client, publication);
    assert!(submit(
        &client,
        Some(other),
        |job_client: &OwnerClient, job_route| job_client.state(job_route)
    )
    .result()
    .is_ok());
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.release_base_source(job_route, source)
    )
    .result()
    .is_ok());
    assert!(joined(install).unwrap().result().is_ok());
    let later = joined(later).unwrap();
    let next = match later.result() {
        Ok(Response::BaseSource(s)) => *s,
        x => panic!("{x:?}"),
    };
    drop(later);
    assert_eq!(next.root(), [77; 32]);
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.release_base_source(job_route, next)
    )
    .result()
    .is_ok());
    let state = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.state(job_route),
    );
    assert!(
        matches!(state.result(),Ok(Response::State(s)) if s.base_readers==0&&s.base_root==[77;32])
    );
    drop(state);
    // The later acquisition ran exactly once, after the install.
    assert_eq!(
        class_jobs(&client, layerfs_daemon::ServiceClass::Source),
        sources + 1
    );
    owner.stop().unwrap();
}

#[test]
fn a_dropped_source_receipt_retains_the_backed_owner_and_terminal_release_makes_cleanup_eligible() {
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let route = open(&client, 132);
    drop(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.acquire_base_source(job_route, 19),
    ));
    let retained = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.retained_base_source(job_route, 19),
    );
    let source = match retained.result() {
        Ok(Response::RetainedBaseSource(Some(s))) => *s,
        x => panic!("{x:?}"),
    };
    drop(retained);
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.close(job_route)
    )
    .result()
    .is_ok());
    let state = submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.cleanup_state(job_route),
    );
    assert!(matches!(
        state.result(),
        Ok(Response::CleanupState(layerfs_overlay::CleanupState::Held))
    ));
    drop(state);
    assert!(submit(
        &client,
        Some(route),
        |job_client: &OwnerClient, job_route| job_client.release_base_source(job_route, source)
    )
    .result()
    .is_ok());
    owner.stop().unwrap();
}

fn run(
    client: &OwnerClient,
    route: Route,
    command: impl FnOnce(&OwnerClient, Option<Route>) -> Done,
    what: &str,
) -> JobReceipt {
    command(client, Some(route)).unwrap_or_else(|error| panic!("{what}: {error:?}"))
}
fn pending_publications(client: &OwnerClient, route: Route) -> Vec<Publication> {
    let done = run(
        client,
        route,
        |job_client, job_route| job_client.pending_publications(job_route, 0),
        "pending publications",
    );
    match done.result() {
        Ok(Response::Publications(pending)) => pending.clone(),
        x => panic!("pending publications: {x:?}"),
    }
}
fn cleanup_state(client: &OwnerClient, route: Route) -> layerfs_overlay::CleanupState {
    let done = run(
        client,
        route,
        |job_client, job_route| job_client.cleanup_state(job_route),
        "cleanup state",
    );
    match done.result() {
        Ok(Response::CleanupState(state)) => *state,
        x => panic!("cleanup state: {x:?}"),
    }
}
/// `Owner::stop` closes every connection. It runs on a helper thread
/// whose exit depends on nothing of the test, and the test waits bounded.
fn stop_bounded(owner: Owner) {
    let (send, stopped) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        let _ = send.send(owner.stop());
    });
    match stopped.recv_timeout(std::time::Duration::from_secs(20)) {
        Ok(result) => result.unwrap(),
        Err(_) => panic!("the owner did not stop"),
    }
}

#[test]
fn a_reply_attempt_is_no_job_and_no_sql_and_wakes_a_waiting_capture() {
    use layerfs_daemon::ServiceClass;
    use layerfs_overlay::OverlayError;
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let a = open(&client, 21);
    let b = open(&client, 22);
    let publish = |route: Route, serial: u64| {
        let done = run(
            &client,
            route,
            |job_client: &OwnerClient, job_route| {
                job_client.publish(job_route, value(serial), None, None)
            },
            "publish",
        );
        publication(&done)
    };
    let first = publish(a, 2);
    let second = publish(a, 3);
    let other = publish(b, 2);
    assert_eq!(pending_publications(&client, a), vec![first, second]);
    assert_eq!(pending_publications(&client, b), vec![other]);

    // No waiter: an attempt from any thread is one counted hold that is no job
    // and runs no SQL. A repeated attempt is refused as stale and changes nothing.
    let before = client.diagnostics().unwrap();
    assert!(client.reply_attempted(other).unwrap().result().is_ok());
    assert!(matches!(
        client.reply_attempted(other).unwrap().result(),
        Err(OwnerError::Overlay(OverlayError::Stale))
    ));
    let replying = client.clone();
    let from_thread = std::thread::spawn(move || replying.reply_attempted(first))
        .join()
        .unwrap();
    assert!(from_thread.unwrap().result().is_ok());
    let work = client.diagnostics().unwrap();
    assert_eq!(work.jobs, before.jobs);
    assert_eq!(work.reply_attempts, before.reply_attempts + 3);
    assert_eq!(
        work.sql_foreground.total().attempts,
        before.sql_foreground.total().attempts
    );
    // Later jobs see what the threads recorded.
    assert_eq!(pending_publications(&client, a), vec![second]);
    assert!(pending_publications(&client, b).is_empty());

    // A capture waits behind the last ticket. Its readiness check is a counted
    // Capture job with its own SQL; the capture itself has had no effect.
    let checks = class_jobs(&client, ServiceClass::Capture);
    let capture = spawn(&client, a, |job_client, job_route| {
        job_client.capture(job_route)
    });
    waits(&client, ServiceClass::Capture, checks);
    assert!(!capture.is_finished());
    // Another Workspace's ticket traffic neither completes nor wakes it.
    let unrelated = publish(b, 3);
    assert!(client.reply_attempted(unrelated).unwrap().result().is_ok());
    assert!(!capture.is_finished());

    // The last attempt wakes the waiting capture: no settling SQL job and no
    // replayed mutation. The capture then runs exactly once.
    let waiting = client.diagnostics().unwrap();
    assert!(client.reply_attempted(second).unwrap().result().is_ok());
    let captured = joined(capture).unwrap();
    let sealed = match captured.result() {
        Ok(Response::Captured(capture)) => *capture,
        x => panic!("capture: {x:?}"),
    };
    assert_eq!(sealed.revision, second.revision());
    drop(captured);
    let work = client.diagnostics().unwrap();
    let class = |class: ServiceClass| work.jobs[class as usize] - waiting.jobs[class as usize];
    assert_eq!(class(ServiceClass::Lifecycle), 0);
    assert_eq!(class(ServiceClass::Mutation), 0);
    assert_eq!(work.reply_attempts, waiting.reply_attempts + 1);
    // At least the capture; a wake by an unrelated job of this Workspace may
    // add one counted readiness check, never a second capture.
    assert!(class(ServiceClass::Capture) >= 1);
    assert!(pending_publications(&client, a).is_empty());
    stop_bounded(owner);
}

#[test]
fn a_closed_workspace_becomes_disposable_after_its_last_reply_attempt() {
    use layerfs_overlay::CleanupState;
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let route = open(&client, 31);
    let published = write(&client, route, 2);
    let ticket = publication(&published);
    drop(published);
    assert!(matches!(
        run(
            &client,
            route,
            |job_client: &OwnerClient, job_route| job_client.close(job_route),
            "close"
        )
        .result(),
        Ok(Response::Done)
    ));
    // The pending ticket holds the closed Workspace. Idle maintenance and
    // further jobs have nothing queued to reclaim.
    for _ in 0..16 {
        assert_eq!(cleanup_state(&client, route), CleanupState::Held);
    }
    assert_eq!(client.diagnostics().unwrap().closed_namespaces, 0);
    // Observation is read-only; the last reply releases its exact ticket
    // without SQL. Rows remain until checked file disposal.
    assert!(client.reply_attempted(ticket).unwrap().result().is_ok());
    for _ in 0..16 {
        assert_eq!(cleanup_state(&client, route), CleanupState::Queued);
    }
    assert_eq!(client.diagnostics().unwrap().closed_namespaces, 0);
    assert!(temp
        .0
        .join(format!("{}.sqlite", route.namespace()))
        .is_file());
    let resources = submit(&client, None, |job_client: &OwnerClient, job_route| {
        job_client.resources(job_route, true)
    });
    match resources.result() {
        Ok(Response::Resources(resources)) => {
            assert_eq!(resources.counts.namespaces, 1);
            assert_eq!(resources.counts.inode_rows, 1);
        }
        other => panic!("closed resource state: {other:?}"),
    }
    assert!(client.maintenance_failure().unwrap().is_none());
    stop_bounded(owner);
}

#[test]
fn concurrent_submitters_get_every_job_done_exactly_once_with_its_own_result() {
    use layerfs_daemon::ServiceClass;
    const THREADS: u64 = 4;
    const ROUNDS: u64 = 300;
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    // Two Workspaces, each shared by two calling threads, so that jobs
    // contend for one Workspace lock while the other Workspace runs beside it.
    let routes = [open(&client, 41), open(&client, 42)];
    let before = client.diagnostics().unwrap();
    // Each thread makes its own bounded waits and never waits for another
    // thread: one that fails ends by itself and the scope reports it.
    let published: Vec<Vec<Publication>> = std::thread::scope(|scope| {
        let threads: Vec<_> = (0..THREADS)
            .map(|thread| {
                let client = client.clone();
                let route = routes[(thread % 2) as usize];
                scope.spawn(move || {
                    let mut published = Vec::with_capacity(ROUNDS as usize);
                    for round in 0..ROUNDS {
                        // A serial no other thread or round uses.
                        let serial = 2 + thread * ROUNDS + round;
                        let wrote = run(
                            &client,
                            route,
                            |job_client: &OwnerClient, job_route| job_client.publish(job_route, value(serial), None, None),
                            "publish",
                        );
                        let ticket = publication(&wrote);
                        drop(wrote);
                        assert_eq!(ticket.route(), route);
                        // Its own result: the row this thread just wrote.
                        let read = run(&client, route, |job_client: &OwnerClient, job_route| job_client.inode(job_route, serial), "inode");
                        assert!(
                            matches!(read.result(), Ok(Response::Inode(Some(row))) if *row == value(serial)),
                            "thread {thread} round {round}: {:?}",
                            read.result()
                        );
                        drop(read);
                        // The reply attempt is recorded from this thread
                        // and nothing waits for it.
                        assert!(client.reply_attempted(ticket).unwrap().result().is_ok());
                        published.push(ticket);
                    }
                    published
                })
            })
            .collect();
        threads
            .into_iter()
            .map(|thread| thread.join().unwrap())
            .collect()
    });

    // Every publishing job ran exactly once: each namespace's revisions are
    // the dense sequence of its jobs, and each thread saw its own ascend.
    for (index, route) in routes.iter().enumerate() {
        let mut revisions = Vec::new();
        for (thread, tickets) in published.iter().enumerate() {
            if thread % 2 != index {
                continue;
            }
            assert_eq!(tickets.len(), ROUNDS as usize);
            assert!(tickets
                .windows(2)
                .all(|pair| pair[0].revision() < pair[1].revision()));
            revisions.extend(tickets.iter().map(|ticket| ticket.revision()));
        }
        revisions.sort_unstable();
        let expected: Vec<i64> = (1..=(THREADS / 2 * ROUNDS) as i64).collect();
        assert_eq!(revisions, expected, "namespace {index}");
        let state = run(
            &client,
            *route,
            |job_client: &OwnerClient, job_route| job_client.state(job_route),
            "state",
        );
        assert!(
            matches!(state.result(), Ok(Response::State(state)) if state.revision == expected.len() as i64)
        );
        drop(state);
        assert!(pending_publications(&client, *route).is_empty());
    }

    // The totals match what was called: every job ran once, in its own
    // class, and no reply attempt was a job.
    let jobs = THREADS * ROUNDS;
    let after = client.diagnostics().unwrap();
    let class = |class: ServiceClass| after.jobs[class as usize] - before.jobs[class as usize];
    assert_eq!(class(ServiceClass::Mutation), jobs);
    // The reads and the two PendingPublications observations above.
    assert_eq!(class(ServiceClass::Read), jobs + 2);
    // The two State observations above.
    assert_eq!(class(ServiceClass::Lifecycle), 2);
    assert_eq!(after.reply_attempts - before.reply_attempts, jobs);
    assert_eq!(
        after.jobs.iter().sum::<u64>(),
        before.jobs.iter().sum::<u64>() + 2 * jobs + 4
    );
    assert!(client.maintenance_failure().unwrap().is_none());
    println!(
        "WORKSPACE-CONTENTION threads={THREADS} workspaces=2 jobs={} lock_wait_ns={:?} hold_ns={:?}",
        2 * jobs,
        after.lock_wait_ns,
        after.hold_ns
    );

    // The owner stops cleanly and admits nothing afterwards.
    stop_bounded(owner);
    assert!(matches!(
        client.state(Some(routes[0])),
        Err(OwnerError::Unattempted { ref cause, .. }) if matches!(cause.as_ref(), OwnerError::Stopped)
    ));
}
