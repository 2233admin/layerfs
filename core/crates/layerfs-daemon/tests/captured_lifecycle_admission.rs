//! Public BoundWorkspace admission covers known install and captured releases.
//! Real reader leases stage construction; real caller-held Lifecycle results
//! stage release. No faults, hooks or private source are compiled by this test.
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
use drive::{evidence, live, settled, Do, Rig, Session};
use layerfs_daemon::store::CommitError;
use layerfs_history::CommitStagedOutcome;
use std::{
    fs,
    sync::{
        atomic::{AtomicBool, Ordering},
        mpsc, Arc,
    },
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
fn known_install_keeps_admission_until_captured_owners_are_released() {
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
    let original = a.snapshot().unwrap().effective_root;
    let client = rig.owner.client();
    settled(&client, 0);
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
    let (credit_release, credit_release_rx) = mpsc::channel();
    let (credit_ready, credit_ready_rx) = mpsc::channel();
    let credits_active = Arc::new(AtomicBool::new(false));
    let credit_guard = {
        let client = client.clone();
        let route = a.route();
        let active = credits_active.clone();
        thread::spawn(move || {
            evidence(format_args!("LIFECYCLE_STAGE credits_begin"));
            let credits = holds::Credits::lifecycle(&client, route, 2, WAIT);
            active.store(true, Ordering::Release);
            let _ = credit_ready.send(credits.count());
            evidence(format_args!("LIFECYCLE_STAGE credits_ready"));
            let _ = credit_release_rx.recv_timeout(WAIT);
            active.store(false, Ordering::Release);
            credits.release();
            evidence(format_args!("LIFECYCLE_STAGE supervised_credits_released"));
        })
    };
    let credits_ready = credit_ready_rx.recv_timeout(WAIT + WAIT).ok() == Some(2);
    evidence(format_args!(
        "LIFECYCLE_STAGE credits_observed={credits_ready}"
    ));
    let _ = lease_release.send(());
    bounded_join(lease_guard);
    evidence(format_args!("LIFECYCLE_STAGE readers_returned"));
    let until = Instant::now() + WAIT;
    let mut installed = false;
    while Instant::now() < until {
        if a.snapshot().unwrap().effective_root != original {
            installed = true;
            break;
        }
        if first.is_finished() {
            break;
        }
        thread::yield_now();
    }
    evidence(format_args!("LIFECYCLE_STAGE installed={installed}"));
    // An observation interval under real held ownership, not a speed gate.
    let until = Instant::now() + Duration::from_millis(100);
    let mut active_during_releases = installed && credits_active.load(Ordering::Acquire);
    while Instant::now() < until && credits_active.load(Ordering::Acquire) {
        active_during_releases &= a.commit_in_flight();
        thread::yield_now();
    }
    evidence(format_args!(
        "LIFECYCLE_STAGE active_during_releases={active_during_releases} diagnostics_begin"
    ));
    let admitted_before_duplicate = client.diagnostics().unwrap().admitted;
    let duplicate = if active_during_releases {
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
    let duplicate_jobs = client.diagnostics().unwrap().admitted - admitted_before_duplicate;
    evidence(format_args!(
        "LIFECYCLE_STAGE duplicate_done={duplicate} duplicate_jobs={duplicate_jobs}"
    ));
    let (peer_tx, peer_rx) = mpsc::channel();
    let peer = {
        let workspace = b.clone();
        thread::spawn(move || {
            let _ = peer_tx.send(workspace.commit_captured());
        })
    };
    let peer_before_release = peer_rx.recv_timeout(WAIT).ok();
    let disjoint_progress = peer_before_release.is_some() && credits_active.load(Ordering::Acquire);
    evidence(format_args!(
        "LIFECYCLE_STAGE peer_observed={disjoint_progress}"
    ));
    // Always return the held resources before collecting failures or joining.
    let _ = credit_release.send(());
    bounded_join(credit_guard);
    evidence(format_args!("LIFECYCLE_STAGE credits_returned"));
    let first_result = rx.recv_timeout(WAIT).expect("bounded first Commit result");
    let peer_result = peer_before_release.unwrap_or_else(|| {
        peer_rx
            .recv_timeout(WAIT)
            .expect("bounded peer Commit result")
    });
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
    let clear_after_release = !a.commit_in_flight();
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
    settled(&client, 0);
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
    evidence(format_args!("CAPTURED_LIFECYCLE staged={staged} installed={installed} active_during_releases={active_during_releases} duplicate_inflight={duplicate} duplicate_jobs={duplicate_jobs} disjoint_progress={disjoint_progress} released={released} clear_after_release={clear_after_release}"));
    assert!(
        staged && credits_ready && installed,
        "real construction and post-install release staging"
    );
    assert!(
        active_during_releases,
        "captured lifecycle admission ended before acquired owners were released"
    );
    assert!(
        duplicate && duplicate_jobs == 0,
        "both duplicate APIs must refuse before jobs"
    );
    assert!(
        disjoint_progress,
        "another Workspace can Commit while A awaits release"
    );
    assert!(
        released && clear_after_release,
        "known release ends the admitted lifecycle"
    );
    assert_ne!(a_root, b_root);
}
