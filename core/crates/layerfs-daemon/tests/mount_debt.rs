//! A new Mount is refused `Capacity` / `mount:debt` while automatic
//! maintenance is stopped (specification 4.2, D-13; R8b track P-B).
//!
//! A Workspace keeps the first reason its automatic maintenance stopped and
//! attempts no further step. The stage that produces one here uses real
//! resources only:
//!
//! 1. One namespace of the test's own is opened through the public owner
//!    client. Each Workspace has its own backing file.
//! 2. That file is renamed aside and another file is written at its path, as
//!    `resources_observation.rs` does: a real external change of the path
//!    identity the engine checks before every write.
//! 3. One publication on that namespace is that write. Its admission reads
//!    the changed identity, so the job fails with unknown outcome and the
//!    engine quarantines itself. A quarantined engine can run no later
//!    maintenance step: that is the retained stop, recorded with no statement.
//!
//! No product hook, fault injection, mocked engine or replay is involved,
//! and no kernel mount is needed: the refusal is decided at control
//! admission. What is not staged: a maintenance step that is itself the
//! first to meet the failing resource. A step runs on the thread whose job
//! made it pending, as that job returns, so a change placed between the two
//! would be a race.
//!
//! Every control call below travels one real authenticated channel, so the
//! refusal is asserted as the bytes a controller receives, beside the
//! daemon's own receipt of the same call.
#[allow(dead_code)]
#[path = "support/control_fixture.rs"]
mod fixture;
#[allow(dead_code)]
#[path = "support/native_install.rs"]
mod support;
use layerfs_bridge::control::{Activity, ControlCode, ControlRefusal, Reply, Request};
use layerfs_daemon::{
    control::{Failure, Service},
    JobReceipt, OwnerClient, OwnerError, OwnerWork, Response,
};
use layerfs_history::{BranchId, WorkspaceId};
use layerfs_overlay::{Inode, InodeKind, OverlayError, Route};
use layerfs_sdk::internal::Control;
use std::{
    fs,
    sync::{mpsc, Arc},
    thread,
    time::Duration,
};

const WAIT: Duration = Duration::from_secs(10);

fn identity(tag: u8) -> WorkspaceId {
    WorkspaceId::from_authority([tag; 32]).unwrap()
}
fn mount(tag: u8, branch: BranchId) -> Request {
    Request::Mount {
        workspace: identity(tag),
        branch,
    }
}
/// The daemon's own receipt of one served call, read on the serving thread.
#[derive(Debug, Eq, PartialEq)]
enum Receipt {
    Success,
    /// A typed refusal with its phase, the engine completions the operation
    /// attempted and whether the original cause is kept with it.
    Refused {
        code: ControlCode,
        phase: &'static str,
        detail: String,
        completions: usize,
        original: bool,
    },
    Other(String),
}
/// One control call over a real authenticated channel, served once by the
/// product's own control route: the reply as received, and the receipt. The
/// serving thread ends with its one call or with its socket's own timeout.
fn call(service: &Arc<Service>, request: Request) -> (Reply, Receipt) {
    let serving = service.clone();
    let (channel, worker) = support::pair(move |connection| {
        let served = serving.serve_one_control(connection).unwrap();
        match &served.outcome {
            Ok(_) => Receipt::Success,
            Err(Failure::Native(refused)) => Receipt::Refused {
                code: refused.code,
                phase: refused.phase,
                detail: refused.detail.clone(),
                completions: refused.completions.len(),
                original: refused.evidence.is_some(),
            },
            Err(other) => Receipt::Other(format!("{other:?}")),
        }
    });
    let reply = Control::new(channel).call(request).unwrap();
    (reply, worker.join())
}
fn publish(client: &OwnerClient, route: Route, serial: u64) -> JobReceipt {
    let inode = Inode {
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
    };
    client
        .publish(Some(route), inode, None, None)
        .unwrap_or_else(|error| panic!("publish: {error:?}"))
}
/// The connection counters a refused Mount must leave as they were.
fn admission(work: &OwnerWork) -> ([u64; 6], u64, u64) {
    (
        work.jobs,
        work.maintenance_jobs,
        work.sql_foreground.total().attempts,
    )
}

#[test]
fn a_new_mount_is_refused_capacity_at_mount_debt_while_maintenance_is_stopped() {
    let f = fixture::Fixture::new("mount-debt");
    let branch = f.native.project.branch.branch.id;
    let client = f.owner.client();
    let store = f.installed.opened.store.clone();

    // Control: before any failure, Mounts of this shape are admitted. Each
    // is one owner job and at least one Store statement.
    let (anchor, anchor_binding) = match call(&f.service, mount(71, branch)) {
        (Reply::Bound { token, binding }, Receipt::Success) => (token, binding),
        other => panic!("anchor Mount: {other:?}"),
    };
    let before = (client.diagnostics().unwrap(), f.statements());
    let admitted = call(&f.service, mount(72, branch));
    let after = (client.diagnostics().unwrap(), f.statements());
    assert!(
        matches!(admitted, (Reply::Bound { .. }, Receipt::Success)),
        "{admitted:?}"
    );
    assert_eq!(
        after.0.jobs.iter().sum::<u64>() - before.0.jobs.iter().sum::<u64>(),
        1,
        "one Open job"
    );
    assert!(after.1 > before.1, "a Mount reads History");
    assert!(client.maintenance_failure().unwrap().is_none());
    println!(
        "MOUNT_DEBT control: Mount admitted, owner admitted {} -> {}, Store statements {} -> {}, maintenance_failure=None",
        before.0.jobs.iter().sum::<u64>(), after.0.jobs.iter().sum::<u64>(), before.1, after.1
    );

    // 1. The test's own namespace, with its own backing file.
    let opened = client
        .open(None, [202; 32], [17; 32])
        .unwrap_or_else(|error| panic!("open: {error:?}"));
    let other = match opened.result() {
        Ok(Response::Opened(route)) => *route,
        other => panic!("open: {other:?}"),
    };
    drop(opened);

    // 2. A real external change of the backing file's path identity.
    // Each Workspace has its own file; the one the next write uses is changed.
    let backing = f
        .native
        .directory
        .join(format!("{}.sqlite", other.namespace()));
    fs::rename(&backing, f.native.directory.join("original-overlay.sqlite")).unwrap();
    fs::write(&backing, b"different physical inode").unwrap();
    assert!(client.maintenance_failure().unwrap().is_none());

    // 3. The next write meets it at its own admission.
    let failed = publish(&client, other, 2);
    let write_failure = format!("{:?}", failed.result().as_ref().err());
    assert!(
        matches!(
            failed.result(),
            Err(OwnerError::Overlay(OverlayError::Uncertain { .. }))
        ),
        "{write_failure}"
    );
    drop(failed);

    // The quarantine is the retained stop of that Workspace's maintenance.
    let stopped = client.maintenance_failure().unwrap().unwrap_or_else(|| {
        panic!(
            "no maintenance stop was retained: {:?}",
            admission(&client.diagnostics().unwrap())
        )
    });
    assert!(matches!(*stopped, OverlayError::Quarantined), "{stopped:?}");
    let quiet = client.diagnostics().unwrap();
    println!(
        "MOUNT_DEBT stage: write under the changed identity={write_failure} maintenance_failure={stopped:?} connection (jobs, maintenance_jobs, statement attempts)={:?}",
        admission(&quiet)
    );

    // The refusal: typed, at its phase, before any effect.
    let expected = ControlRefusal {
        code: ControlCode::Capacity,
        phase: "mount:debt".into(),
        moved: None,
        published: None,
        detail: stopped.to_string(),
    };
    for tag in [73, 74, 73] {
        let before = (
            admission(&client.diagnostics().unwrap()),
            f.statements(),
            store.work(),
        );
        let (reply, receipt) = call(&f.service, mount(tag, branch));
        let after = (
            admission(&client.diagnostics().unwrap()),
            f.statements(),
            store.work(),
        );
        println!(
            "MOUNT_DEBT Mount {tag}: reply={reply:?} receipt={receipt:?} connection (jobs, maintenance_jobs, statement attempts) {:?} -> {:?} Store statements {} -> {}",
            before.0, after.0, before.1, after.1
        );
        assert_eq!(reply, Reply::Refused(expected.clone()));
        assert_eq!(
            receipt,
            Receipt::Refused {
                code: ControlCode::Capacity,
                phase: "mount:debt",
                detail: stopped.to_string(),
                completions: 0,
                original: true,
            }
        );
        assert_eq!(after.0, before.0, "no connection job ran");
        assert_eq!(after.1, before.1, "no Store statement was issued");
        assert_eq!(after.2, before.2, "no Store demand was made");
        // No registry entry: the incarnation is absent, not retained.
        match call(&f.service, Request::Locate(identity(tag))) {
            (Reply::Refused(absent), _) => assert_eq!(
                (absent.code, absent.detail.as_str()),
                (ControlCode::Missing, "Workspace absent")
            ),
            other => panic!("Locate {tag}: {other:?}"),
        }
    }
    // An incarnation that is already admitted keeps its own answer.
    match call(&f.service, mount(71, branch)) {
        (Reply::Refused(duplicate), _) => assert_eq!(
            (duplicate.code, duplicate.phase.as_str()),
            (ControlCode::Busy, "admission")
        ),
        other => panic!("duplicate Mount: {other:?}"),
    }

    // The Workspace bound before the failure has its own engine: it still
    // answers Status with its control fields and its own local observation.
    let status = match call(&f.service, Request::Status(anchor)) {
        (Reply::Status(status), Receipt::Success) => *status,
        other => panic!("Status: {other:?}"),
    };
    println!(
        "MOUNT_DEBT anchor Status: activity={:?} epoch={} local={:?} local_failure={:?}",
        status.activity, status.epoch, status.local, status.local_failure
    );
    assert_eq!(status.token, anchor);
    assert_eq!(status.binding, anchor_binding);
    assert_eq!(status.activity, Activity::Idle);
    assert!(
        status.local.is_some() && status.local_failure.is_none(),
        "a peer is not touched by another Workspace's quarantine"
    );
    assert!(matches!(
        *client.maintenance_failure().unwrap().unwrap(),
        OverlayError::Quarantined
    ));

    // One engine is quarantined: the owner is stopped as process scope, with
    // a bound, and whatever it answers is recorded, not required.
    let fixture::Fixture {
        native,
        installed,
        owner,
        service,
    } = f;
    drop((service, client, store, stopped));
    let (send, joined) = mpsc::channel();
    thread::spawn(move || {
        let _ = send.send(format!("{:?}", owner.stop()));
    });
    match joined.recv_timeout(WAIT) {
        Ok(answer) => println!("MOUNT_DEBT owner stop: {answer}"),
        Err(_) => panic!("the owner did not stop"),
    }
    drop(installed);
    native.cleanup();
}
