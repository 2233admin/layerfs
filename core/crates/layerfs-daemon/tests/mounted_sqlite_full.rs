//! Real known SQLite capacity exhaustion through ordinary mounted writes.
//! A transparent observer records actual native owner outcomes; it injects no
//! fault, changes no input and retains no response or owner credit.
#![cfg(target_os = "linux")]
#[allow(dead_code)]
#[path = "support/fusectl.rs"]
mod fusectl;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod installed;
use layerfs_daemon::{
    bootstrap::open_store,
    store::{BindRequest, BoundWorkspace},
    Command, Completion, NativeJob, NativeReply, Owner, OwnerClient, OwnerConfig, Response,
};
use layerfs_fuse::{
    attributes::Identity,
    mount::AbortWrite,
    ports::{Fence, MountServices, RequestServices, ServiceError, ServiceFuture, ServiceReply},
    session::{Detach, NativeSession, SessionConfig},
    Dispatch, DispatchConfig, HANDOFFS,
};
use layerfs_history::WorkspaceId;
use layerfs_overlay::{NativeCookieOffer, NativeMount, OverlayError, ProfileConfig, Publication};
use layerfs_storage::ReservationBlocks;
use layerfs_workspace::{
    BaseView, NativeDirectoryWindow, NativeMutationOutcome, NativeReadOperation, NativeReadOutcome,
    NativeVisitRequest, NativeWindow, VisitFacts, WorkspaceError, WriteData,
};
use std::{
    fs,
    os::unix::process::CommandExt,
    process::{Command as Process, Stdio},
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
    time::{Duration, Instant},
};
const COMMAND: u32 = 65534;
struct ObserveMount {
    bound: Arc<BoundWorkspace>,
    full: Arc<AtomicU64>,
}
struct ObserveRequest {
    inner: Arc<dyn RequestServices>,
    full: Arc<AtomicU64>,
}
impl MountServices for ObserveMount {
    fn request(&self, fence: &Fence) -> Result<Arc<dyn RequestServices>, ServiceError> {
        Ok(Arc::new(ObserveRequest {
            inner: self.bound.request(fence)?,
            full: self.full.clone(),
        }))
    }
}
macro_rules! forward {
    ($($name:ident($($arg:ident: $ty:ty),*) -> $out:ty;)*) => {$(
        fn $name(&self, $($arg:$ty),*) -> ServiceFuture<'_, $out> {
            self.inner.$name($($arg),*)
        }
    )*};
}
impl RequestServices for ObserveRequest {
    forward! {
        directory_visit(mount:NativeMount,serial:u64,handle:u64,offset:u64,after:Option<Vec<u8>>) -> ServiceReply<Arc<NativeDirectoryWindow>>;
        publish_cookies(offer:NativeCookieOffer,names:Vec<Vec<u8>>) -> ServiceReply<()>;
        close_directory(mount:NativeMount,serial:u64,handle:u64) -> ServiceReply<()>;
        read_visit(mount:NativeMount,serial:u64,handle:Option<u64>,offset:u64,length:u32) -> ServiceReply<Arc<NativeWindow>>;
        close_file(mount:NativeMount,serial:u64,handle:u64) -> ServiceReply<()>;
        observe_visit(mount:NativeMount,request:u64,serial:u64,handle:Option<u64>,operation:NativeReadOperation,facts:Arc<VisitFacts>) -> ServiceReply<Arc<NativeReadOutcome>>;
        base() -> BaseView;
        recognize(serial:u64,offset:u64,data:WriteData) -> WriteData;
        forget(mount:NativeMount,serial:u64,count:u64) -> ServiceReply<()>;
        reply_attempted(publication:Publication) -> ServiceReply<()>;
    }
    fn provider_failure(&self) -> Result<Option<ServiceError>, ServiceError> {
        self.inner.provider_failure()
    }
    fn failed_base_read(&self, step: ServiceError) -> ServiceError {
        self.inner.failed_base_read(step)
    }
    fn reserve_serial(&self) -> Result<Option<u64>, ServiceError> {
        self.inner.reserve_serial()
    }
    fn mutate_visit(
        &self,
        request: NativeVisitRequest,
    ) -> ServiceFuture<'_, ServiceReply<Arc<NativeMutationOutcome>>> {
        Box::pin(async move {
            let reply = self.inner.mutate_visit(request).await?;
            if let Err(WorkspaceError::Overlay(OverlayError::Sql(error))) = &reply.get().result {
                // SQLite's actual owning result, not an errno guessed from a
                // string or a synthetic fault: SQLITE_FULL is code 13.
                if error
                    .sqlite_error()
                    .is_some_and(|error| error.extended_code == 13)
                {
                    self.full.fetch_add(1, Ordering::Relaxed);
                }
            }
            Ok(reply)
        })
    }
}
fn job(client: &OwnerClient, route: layerfs_overlay::Route, command: Command) -> Completion {
    let pending = client.try_submit(Some(route), command).unwrap();
    let until = Instant::now() + Duration::from_secs(3);
    loop {
        if let Some(done) = pending.try_complete().unwrap() {
            return done;
        }
        assert!(Instant::now() < until, "bounded owner completion");
        std::thread::sleep(Duration::from_millis(1));
    }
}
fn state(client: &OwnerClient, route: layerfs_overlay::Route) -> layerfs_overlay::WorkspaceState {
    let done = job(client, route, Command::State);
    match done.result() {
        Ok(Response::State(state)) => *state,
        other => panic!("{other:?}"),
    }
}
fn resources(client: &OwnerClient, route: layerfs_overlay::Route) -> layerfs_overlay::Resources {
    let done = job(client, route, Command::Resources { global: false });
    match done.result() {
        Ok(Response::Resources(resources)) => **resources,
        other => panic!("{other:?}"),
    }
}
fn run(forced: bool) {
    fusectl::mount();
    let fixture = installed::Fixture::built(
        if forced {
            "sqlite-full-forced"
        } else {
            "sqlite-full-normal"
        },
        |source| {
            fs::write(source.join("prior.dat"), vec![17; 4096]).unwrap();
            fs::write(source.join("fail.dat"), []).unwrap();
            2
        },
    );
    let store = open_store(
        fixture.config.clone(),
        installed::BINDING,
        installed::CURSOR,
        2,
        0,
        ReservationBlocks::default(),
    )
    .unwrap();
    let before_history = store
        .history()
        .branch_snapshot(fixture.branch)
        .unwrap()
        .unwrap();
    let owner = Owner::start(
        &fixture.directory.join("overlay.sqlite"),
        ProfileConfig {
            pager_kib: 4,
            max_pages: Some(80),
        },
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let bound = store
        .bind(
            client.clone(),
            BindRequest {
                branch: fixture.branch,
                workspace: WorkspaceId::from_authority([if forced { 219 } else { 218 }; 32])
                    .unwrap(),
            },
        )
        .unwrap()
        .workspace;
    let bound = Arc::new(bound);
    let route = bound.route();
    let root = bound
        .operation()
        .unwrap()
        .workspace()
        .base()
        .unwrap()
        .root()
        .root_inode()
        .serial();
    let done = job(&client, route, Command::Native(NativeJob::Mount { root }));
    let mount = match done.result() {
        Ok(Response::Native(NativeReply::Mount(mount))) => *mount,
        other => panic!("{other:?}"),
    };
    drop(done);
    let mut pool = Dispatch::start(DispatchConfig {
        read_handles: 2,
        namespaces: 1,
    })
    .unwrap();
    let queue = pool.register(mount).unwrap();
    let full = Arc::new(AtomicU64::new(0));
    let mut session = NativeSession::attach(
        SessionConfig {
            directory: fixture.directory.join("mounted"),
            owner_uid: 0,
            owner_gid: 0,
            ready_wait: Duration::from_secs(3),
            drain_wait: Duration::from_secs(3),
        },
        queue.clone(),
        Arc::new(ObserveMount {
            bound: bound.clone(),
            full: full.clone(),
        }),
        Identity {
            root,
            uid: COMMAND,
            gid: COMMAND,
        },
    )
    .unwrap();
    let initial = state(&client, route);
    let initial_resources = resources(&client, route);
    let before = client.diagnostics().unwrap();
    let script = r#"
import os
assert open('prior.dat','rb').read() == bytes([17])*4096
fd = os.open('fail.dat',os.O_WRONLY)
try:
    try:
        n = os.write(fd,bytes([73])*131072)
        print('acknowledged_bytes='+str(n))
        print('observed_errno=0')
    except OSError as error:
        print('acknowledged_bytes=0')
        print('observed_errno='+str(error.errno))
finally:
    os.close(fd)
assert os.stat('fail.dat').st_size == 0
assert open('prior.dat','rb').read() == bytes([17])*4096
"#;
    let mut child = Process::new("python3")
        .arg("-c")
        .arg(script)
        .current_dir(session.directory())
        .uid(COMMAND)
        .gid(COMMAND)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();
    let until = Instant::now() + Duration::from_secs(8);
    let mut timed_out = false;
    loop {
        if child.try_wait().unwrap().is_some() {
            break;
        }
        if Instant::now() >= until {
            timed_out = true;
            let _ = session.abort();
            let _ = child.kill();
            break;
        }
        std::thread::sleep(Duration::from_millis(2));
    }
    let output = child.wait_with_output().unwrap();
    let text = String::from_utf8(output.stdout).unwrap();
    println!(
        "SQLITE_FULL_NATIVE forced={forced} output={} stderr={}",
        text.trim(),
        String::from_utf8_lossy(&output.stderr)
    );
    let after = client.diagnostics().unwrap();
    let final_state = state(&client, route);
    let final_resources = resources(&client, route);
    let known_full = full.load(Ordering::Relaxed);
    let reservation_refusals =
        after.allocation_foreground.refusals - before.allocation_foreground.refusals;
    let work = after.sql_foreground.since(&before.sql_foreground).total();
    let history = store
        .history()
        .branch_snapshot(fixture.branch)
        .unwrap()
        .unwrap();
    let remaining = queue.work().unwrap();
    println!("SQLITE_FULL_NATIVE known_full={known_full} reservation_refusals={reservation_refusals} sql={work:?} initial={initial:?} final={final_state:?} dispatch={remaining:?}");
    // On the old implementation the real failed completion is retained.
    // Inspect it without taking, releasing, or replacing its owner.
    for slot in 0..HANDOFFS {
        if let Ok(detail) = queue.inspect_retained(slot, |failure| match failure {
            layerfs_fuse::FailureView::Request(error) => format!("{error:?}"),
            layerfs_fuse::FailureView::Panic(_) => "panic".to_owned(),
        }) {
            println!("SQLITE_FULL_NATIVE retained={detail}");
        }
    }
    let drained = if remaining.retained != 0 || forced || timed_out {
        if !timed_out {
            assert_eq!(session.abort().unwrap(), AbortWrite::Written);
        }
        session.force_drain()
    } else {
        assert_eq!(session.detach().unwrap(), Detach::Detached);
        session.drain()
    };
    // A red keeps its exact stopped owner until this proof-only container
    // exits. It is never called a clean drain or released through Drop.
    let clean = match drained {
        Ok(drained) => {
            println!("SQLITE_FULL_NATIVE drained={drained:?}");
            true
        }
        Err(kept) => {
            println!("SQLITE_FULL_NATIVE retained_drain={kept:?}");
            false
        }
    };
    if clean {
        let revoked = job(&client, route, Command::Native(NativeJob::Revoke(mount)));
        assert!(matches!(
            revoked.result(),
            Ok(Response::Native(NativeReply::Done))
        ));
        drop(revoked);
        assert!(job(&client, route, Command::Close).result().is_ok());
        drop(queue);
        assert!(pool.stop().unwrap().clean());
        drop(bound);
        drop(client);
        owner.stop().unwrap();
        drop(store);
        fixture.cleanup();
    }
    assert!(!timed_out, "ordinary process completed within bounded wait");
    assert_eq!(
        known_full, 1,
        "actual known SQLiteFull owning result exactly once"
    );
    assert_eq!(
        reservation_refusals, 0,
        "SQL exhaustion is not pre-BEGIN physical admission"
    );
    assert!(
        work.rows_changed > 0,
        "real partial atomic DML reached before failure"
    );
    assert_eq!(history, before_history, "publication authority unchanged");
    assert_eq!(
        final_state, initial,
        "known rollback preserves Workspace state"
    );
    assert_eq!(
        final_resources.counts.payload_bytes, initial_resources.counts.payload_bytes,
        "known rollback preserves stored payload bytes"
    );
    assert_eq!(
        final_resources.counts.payload_cells, initial_resources.counts.payload_cells,
        "known rollback preserves stored payload cells"
    );
    assert!(text.contains("acknowledged_bytes=0"));
    assert!(
        text.contains("observed_errno=28"),
        "known rollback must answer ENOSPC: {text}"
    );
    assert!(output.status.success(), "ordinary syscall assertions");
    assert_eq!(
        remaining.retained, 0,
        "known no-effect request released after reply"
    );
    assert!(
        clean,
        "native drain completed without retained request custody"
    );
}
#[test]
fn known_sqlite_full_is_enospc_and_normal_drain_completes() {
    run(false);
}
#[test]
fn known_sqlite_full_is_enospc_and_forced_drain_completes() {
    run(true);
}
