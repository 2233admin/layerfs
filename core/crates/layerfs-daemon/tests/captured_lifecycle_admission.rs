//! Public BoundWorkspace admission covers a Commit in flight and its release.
//! Real reader leases stage construction. No faults, hooks or private source
//! are compiled by this test.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[allow(dead_code)]
#[path = "support/holds.rs"]
mod holds;
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{evidence, live, Do, Rig, Session};
use layerfs_daemon::store::CommitError;
use layerfs_history::CommitStagedOutcome;
use std::{
    fs,
    sync::mpsc,
    thread,
    time::{Duration, Instant},
};

const WAIT: Duration = Duration::from_secs(5);

fn bounded_join<T>(thread: thread::JoinHandle<T>) -> T {
    let until = Instant::now() + WAIT;
    while !thread.is_finished() {
        if Instant::now() >= until {
            evidence(format_args!(
                "CAPTURED_LIFECYCLE worker failed to exit within bounded completion"
            ));
            std::process::exit(3);
        }
        thread::sleep(Duration::from_millis(1));
    }
    thread.join().unwrap()
}

#[test]
fn commit_in_flight_refuses_duplicates_before_jobs_and_releases() {
    evidence(format_args!("LIFECYCLE_STAGE fixture_begin"));
    let rig = Rig::new("captured-lifecycle-admission", |source| {
        fs::write(source.join("payload.bin"), vec![47; 1 << 20]).unwrap()
    });
    evidence(format_args!("LIFECYCLE_STAGE fixture_ready"));
    let a = rig.bind(1);
    let b = rig.bind(2);
    let mut sa = Session::new(&a, rig.base.clone());
    let mut sb = Session::new(&b, rig.base.clone());
    sa.apply(Do::Write("payload.bin", 0, b"changed only in A"));
    sb.apply(Do::Create("peer.txt", 0o644));
    sb.apply(Do::Write("peer.txt", 0, b"independent B"));
    evidence(format_args!("LIFECYCLE_STAGE mutations_ready"));
    let client = rig.owner.client();
    evidence(format_args!("LIFECYCLE_STAGE leases_begin"));
    let leases = holds::Leases::all(&rig.store, WAIT);
    evidence(format_args!("LIFECYCLE_STAGE leases_ready"));
    let (lease_release, lease_release_rx) = mpsc::channel();
    let lease_guard = thread::spawn(move || {
        let _ = lease_release_rx.recv_timeout(WAIT);
        leases.release();
        evidence(format_args!("LIFECYCLE_STAGE supervised_leases_released"));
    });
    let (tx, rx) = mpsc::channel();
    let first = {
        let workspace = a.clone();
        thread::spawn(move || {
            let _ = tx.send(workspace.commit_captured());
        })
    };
    evidence(format_args!("LIFECYCLE_STAGE first_thread_started"));
    // File preparation always asks the real cheap-length provider after its
    // reader and operation acquisition. All readers are leased by this test.
    let until = Instant::now() + WAIT;
    let mut staged = false;
    while Instant::now() < until {
        if rig.store.read_work().waiting != 0 {
            staged = true;
            break;
        }
        if first.is_finished() {
            break;
        }
        thread::yield_now();
    }
    evidence(format_args!("LIFECYCLE_STAGE construction_staged={staged}"));
    // A's Commit is in flight for as long as its construction waits for a
    // reader; both duplicate APIs refuse before any connection job.
    let in_flight = staged;
    let jobs_before_duplicate = client.diagnostics().unwrap().jobs.iter().sum::<u64>();
    let duplicate = if in_flight {
        let captured = a
            .commit_captured()
            .expect_err("duplicate captured lifecycle must refuse");
        let direct = a
            .commit(|_, _, _| Err(CommitError::Context("unexpected duplicate constructor")))
            .expect_err("duplicate direct lifecycle must refuse");
        matches!(captured.error, CommitError::InFlight)
            && matches!(direct.error, CommitError::InFlight)
    } else {
        false
    };
    let duplicate_jobs =
        client.diagnostics().unwrap().jobs.iter().sum::<u64>() - jobs_before_duplicate;
    evidence(format_args!(
        "LIFECYCLE_STAGE duplicate_done={duplicate} duplicate_jobs={duplicate_jobs}"
    ));
    let _ = lease_release.send(());
    bounded_join(lease_guard);
    evidence(format_args!("LIFECYCLE_STAGE readers_returned"));
    let (peer_tx, peer_rx) = mpsc::channel();
    let peer = {
        let workspace = b.clone();
        thread::spawn(move || {
            let _ = peer_tx.send(workspace.commit_captured());
        })
    };
    let first_result = rx.recv_timeout(WAIT).expect("bounded first Commit result");
    let peer_result = peer_rx
        .recv_timeout(WAIT)
        .expect("bounded peer Commit result");
    evidence(format_args!("LIFECYCLE_STAGE results_received"));
    bounded_join(first);
    bounded_join(peer);
    let first_result = first_result.unwrap_or_else(|failure| panic!("{failure:?}"));
    let peer_result = peer_result.unwrap_or_else(|failure| panic!("{failure:?}"));
    let a_root = match &first_result.history {
        CommitStagedOutcome::Committed(record) => record.root,
        other => panic!("{other:?}"),
    };
    let b_root = match &peer_result.history {
        CommitStagedOutcome::Committed(record) => record.root,
        other => panic!("{other:?}"),
    };
    let released = !first_result.namespace.as_ref().unwrap().retained();
    drop(first_result);
    drop(peer_result);
    evidence(format_args!("LIFECYCLE_STAGE canonical_begin"));
    let ao = a.operation().unwrap();
    let bo = b.operation().unwrap();
    model::assert_same(
        &sa.model.flat(),
        &model::canonical(ao.client(), a_root),
        "A independent committed root",
    );
    model::assert_same(
        &sb.model.flat(),
        &model::canonical(bo.client(), b_root),
        "B independent committed root",
    );
    drop(ao);
    drop(bo);
    evidence(format_args!("LIFECYCLE_STAGE live_begin"));
    model::assert_same(&sa.model.flat(), &live(&a), "A live install");
    model::assert_same(&sb.model.flat(), &live(&b), "B live install");
    evidence(format_args!("LIFECYCLE_STAGE close_begin"));
    rig.close(&a);
    rig.close(&b);
    drop(sa);
    drop(sb);
    drop(a);
    drop(b);
    evidence(format_args!("LIFECYCLE_STAGE finish_begin"));
    rig.finish();
    evidence(format_args!("LIFECYCLE_STAGE finish_done"));
    evidence(format_args!("CAPTURED_LIFECYCLE staged={staged} in_flight={in_flight} duplicate_inflight={duplicate} duplicate_jobs={duplicate_jobs} released={released}"));
    assert!(staged && in_flight, "real construction staging");
    assert!(
        duplicate && duplicate_jobs == 0,
        "both duplicate APIs must refuse before jobs"
    );
    assert!(released, "known release ends the admitted lifecycle");
    assert_ne!(a_root, b_root);
}
