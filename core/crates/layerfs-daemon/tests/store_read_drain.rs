//! A request INSIDE a Store read while its mount is torn down, without a
//! kernel mount: the real Workspace service, the real Store read sessions and the
//! real per-mount request drain, whose `stop_receive`, `stop_service`, `wait_quiescent`
//! and `finish` are the calls a native session's detach, abort, drain and
//! release make (`layerfs-fuse` `session/drain.rs`, `session/force.rs`).
//!
//! A READ, a READLINK, an OPEN and a READDIR reading visit record nothing in
//! the engine, so revocation cannot see them; the mount's drain predicate
//! (`active == 0`) is what keeps `Revoke` behind them
//! ([native read custody](../../../docs/architecture/73-native-read-custody.md)).
//! The Store read is held open by `support/store_gate.rs` at the public pack
//! persistence port of each read session. No object cache is configured, so
//! every base demand reaches the provider.
//!
//! The kernel half (detach, abort, the session's own `drain` and the control
//! replies) is staged on real mounts in `mounted_store_read.rs`. Public API
//! only; every wait is bounded. Each held request runs on its own receive
//! thread, as a mount worker runs it.
#[allow(dead_code)]
#[path = "support/store_gate.rs"]
mod store_gate;
#[path = "support/installed_store.rs"]
mod support;
use layerfs_content::filesystem::PathName;
use layerfs_daemon::{
    store::{BindRequest, BoundWorkspace, ReadLimits, Store, StoreReader},
    JobReceipt, NativeReply, Owner, OwnerClient, OwnerConfig, Response,
};
use layerfs_fuse::{
    operations::{DirectoryStep, DirectoryStream, NativeData, NativeRead, ReadDataInput},
    ports::{Fence, MountServices, RequestServices},
    DispatchError, MountRequests, MountWork, RequestDisposition, RequestFuture,
};
use layerfs_history::WorkspaceId;
use layerfs_overlay::{NativeMount, NativeMountState, ProfileConfig, StoredCounts};
use layerfs_persistence::Handles;
use layerfs_storage::{port::PackPersistence, ReservationBlocks, Storage};
use layerfs_workspace::NativeReadOperation;
use std::{
    future::Future,
    pin::Pin,
    sync::{mpsc, Arc},
    task::{Context, Poll, Wake, Waker},
    time::{Duration, Instant},
};
use store_gate::{Gate, Gated};

const WAIT: Duration = Duration::from_secs(5);
/// One drain observation that is expected to end at its deadline.
const WINDOW: Duration = Duration::from_millis(200);

struct Event(mpsc::SyncSender<()>);
impl Wake for Event {
    fn wake(self: Arc<Self>) {
        let _ = self.0.try_send(());
    }
}
/// Polls with a real wakeup channel; a future that never completes fails the
/// test at its deadline instead of hanging it.
fn wait<T>(future: impl Future<Output = T>) -> T {
    let mut future = std::pin::pin!(future);
    let (send, woken) = mpsc::sync_channel(1);
    let waker = Waker::from(Arc::new(Event(send)));
    let deadline = Instant::now() + WAIT;
    loop {
        if let Poll::Ready(value) = Pin::as_mut(&mut future).poll(&mut Context::from_waker(&waker))
        {
            return value;
        }
        let remaining = deadline.saturating_duration_since(Instant::now());
        if woken.recv_timeout(remaining).is_err() {
            panic!("port call did not complete within {WAIT:?}");
        }
    }
}
fn until(what: &str, mut condition: impl FnMut() -> bool) {
    let deadline = Instant::now() + WAIT;
    while !condition() {
        assert!(Instant::now() < deadline, "bounded observation: {what}");
        std::thread::yield_now();
    }
}
/// One request on its own receive thread, as a mount worker runs it.
fn serve(
    queue: &MountRequests,
    input: usize,
    future: RequestFuture,
) -> std::thread::JoinHandle<()> {
    let queue = queue.clone();
    std::thread::spawn(move || {
        queue
            .receive()
            .unwrap()
            .request(input)
            .unwrap()
            .serve(future)
            .unwrap()
    })
}
fn finish(
    client: &OwnerClient,
    route: layerfs_overlay::Route,
    command: impl FnOnce(
        &layerfs_daemon::OwnerClient,
        Option<layerfs_overlay::Route>,
    ) -> Result<layerfs_daemon::JobReceipt, layerfs_daemon::OwnerError>,
) -> JobReceipt {
    command(client, Some(route)).unwrap_or_else(|error| panic!("{error:?}"))
}

/// What a held request answered once its Store read returned.
#[derive(Debug, Eq, PartialEq)]
enum Answer {
    Bytes(Vec<u8>),
    Opened(u64),
    Names(Vec<Vec<u8>>),
    Fenced,
    Other(String),
}

/// One bound Workspace over a Store with two gated read sessions and no
/// object cache, a native mount group and its request drain, and no kernel
/// connection. Composed from the public pieces `open_store` composes.
struct Rig {
    fixture: support::Fixture,
    gate: Arc<Gate>,
    store: Arc<Store>,
    owner: Owner,
    client: OwnerClient,
    bound: BoundWorkspace,
    root: u64,
    mount: NativeMount,
    queue: MountRequests,
}
impl Rig {
    fn new(label: &str, authority: u8) -> Self {
        let fixture = support::Fixture::new(1, label);
        assert_eq!(fixture.count, 1);
        let config = || fixture.config.clone();
        let writer = Handles::open_writable(config(), support::BINDING, support::CURSOR).unwrap();
        let gate = Gate::new();
        let sessions = (0..2)
            .map(|_| {
                let read =
                    Handles::open_read_only(config(), support::BINDING, support::CURSOR).unwrap();
                let provider: Arc<dyn PackPersistence> = Arc::new(Gated {
                    inner: read.storage,
                    gate: gate.clone(),
                });
                StoreReader::new(Storage::new(provider).unwrap(), Arc::new(read.history))
            })
            .collect();
        let store = Arc::new(
            Store::new(
                writer.storage,
                Arc::new(writer.history),
                sessions,
                0,
                ReservationBlocks::default(),
                ReadLimits::default(),
            )
            .unwrap(),
        );
        let owner = Owner::start(
            &fixture.directory.join("overlay"),
            ProfileConfig::default(),
            OwnerConfig::default(),
        )
        .unwrap();
        let client = owner.client();
        let bound = store
            .bind(
                client.clone(),
                BindRequest {
                    branch: fixture.branch,
                    workspace: WorkspaceId::from_authority([authority; 32]).unwrap(),
                },
            )
            .unwrap()
            .workspace;
        let root = bound
            .operation()
            .unwrap()
            .workspace()
            .base()
            .unwrap()
            .root()
            .root_inode()
            .serial();
        let done = finish(
            &client,
            bound.route(),
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.native_mount(job_route, root)
            },
        );
        let mount = match done.result() {
            Ok(Response::Native(NativeReply::Mount(mount))) => *mount,
            other => panic!("mount: {other:?}"),
        };
        drop(done);
        let queue = MountRequests::new(mount);
        Self {
            fixture,
            gate,
            store,
            owner,
            client,
            bound,
            root,
            mount,
            queue,
        }
    }
    fn services(&self, fence: &Fence) -> Arc<dyn RequestServices> {
        self.bound.request(fence).unwrap()
    }
    /// The base file's serial and one read-only descriptor on it, acquired
    /// while the gate is open.
    fn opened(&self, services: &Arc<dyn RequestServices>) -> (u64, u64) {
        let found = wait(NativeRead::prepare(
            services.clone(),
            self.mount,
            1,
            self.root,
            None,
            NativeReadOperation::Lookup {
                parent: self.root,
                name: PathName::new("file-000000").unwrap(),
            },
        ))
        .unwrap();
        let serial = found.value().unwrap().stat.serial;
        wait(found.dispose()).unwrap();
        let opened = wait(NativeRead::prepare(
            services.clone(),
            self.mount,
            2,
            serial,
            None,
            NativeReadOperation::Open {
                serial,
                writable: false,
            },
        ))
        .unwrap();
        let handle = opened.value().unwrap().file.unwrap().owner_id();
        wait(opened.dispose()).unwrap();
        (serial, handle)
    }
    fn lane(&self) -> MountWork {
        self.queue.work().unwrap()
    }
    fn jobs(&self) -> u64 {
        self.client.diagnostics().unwrap().jobs.iter().sum::<u64>()
    }
    fn counts(&self) -> StoredCounts {
        let done = finish(
            &self.client,
            self.bound.route(),
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.resources(job_route, true)
            },
        );
        match done.result() {
            Ok(Response::Resources(resources)) => resources.counts,
            other => panic!("resources: {other:?}"),
        }
    }
    fn state(&self) -> NativeMountState {
        let done = finish(
            &self.client,
            self.bound.route(),
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.native_state(job_route, self.mount)
            },
        );
        match done.result() {
            Ok(Response::Native(NativeReply::State(state))) => *state,
            other => panic!("mount state: {other:?}"),
        }
    }
    /// Starts one request of the mount with the gate armed and returns once it
    /// is inside its Store read: active, one reader leased and one provider
    /// call held.
    fn held(&self, future: RequestFuture) {
        let before = self.gate.observe();
        assert_eq!(before.holding, 0);
        self.gate.arm();
        drop(serve(&self.queue, 0, future));
        until("the request is inside its Store read", || {
            let lane = self.lane();
            self.gate.observe().holding == 1
                && (lane.active, lane.retained) == (1, 0)
                && self.store.read_work().outstanding == 1
        });
    }
    /// The drain a native session makes after its detach or abort, with the
    /// request still inside its Store read: the product's own bounded wait
    /// ends at its deadline with the request active, the mount's release is
    /// refused, and nothing was revoked. `Revoke` is not submitted here: the
    /// product submits it only after this predicate holds.
    fn not_drained(&self, idle: StoredCounts) {
        let started = Instant::now();
        let work = self.queue.wait_quiescent(started + WINDOW).unwrap();
        assert!(started.elapsed() >= WINDOW, "the drain wait ended early");
        assert_eq!((work.active, work.retained), (1, 0), "{work:?}");
        assert!(matches!(self.queue.finish(), Err(DispatchError::Busy)));
        assert_eq!(self.gate.observe().holding, 1);
        assert_eq!(self.store.read_work().outstanding, 1);
        // Nothing of the request is in the engine, and the mount is live.
        assert_eq!(self.counts(), idle);
        assert_eq!(self.state(), NativeMountState::Live);
    }
    /// After the release: the mount drains inside the bounded wait, every
    /// provider call returned, and revocation then succeeds.
    fn drained_and_revoked(self, completed: u64) {
        let work = self.queue.wait_quiescent(Instant::now() + WAIT).unwrap();
        assert_eq!(
            (work.active, work.retained, work.completed),
            (0, 0, completed),
            "{work:?}"
        );
        let calls = self.gate.observe();
        assert_eq!((calls.holding, calls.expired), (0, 0), "{calls:?}");
        assert_eq!(calls.entered, calls.returned, "{calls:?}");
        assert_eq!(self.store.read_work().outstanding, 0);
        let done = finish(
            &self.client,
            self.bound.route(),
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.native_revoke(job_route, self.mount)
            },
        );
        assert!(
            matches!(done.result(), Ok(Response::Native(NativeReply::Done))),
            "revoke: {:?}",
            done.result()
        );
        drop(done);
        assert_ne!(self.state(), NativeMountState::Live);
        // No Store read followed the revocation.
        assert_eq!(self.gate.observe(), calls);
        self.queue.finish().unwrap();
        drop(self.bound);
        self.owner.stop().unwrap();
        drop(self.store);
        self.fixture.cleanup();
    }
}
/// A READ of the whole base file through `handle`, as the request driver
/// makes it, reporting its answer.
fn reading(
    services: Arc<dyn RequestServices>,
    mount: NativeMount,
    serial: u64,
    handle: u64,
    send: mpsc::Sender<Answer>,
) -> RequestFuture {
    Box::pin(async move {
        let window = ReadDataInput::File {
            offset: 0,
            length: 4096,
        };
        match NativeData::read(services, mount, 30, serial, Some(handle), window).await {
            Ok(Ok(data)) => {
                let _ = send.send(Answer::Bytes(data.bytes().to_vec()));
                RequestDisposition::Complete
            }
            Ok(Err(refusal)) => {
                let _ = send.send(Answer::Other(format!("{refusal:?}")));
                RequestDisposition::Complete
            }
            Err(failure) => {
                let _ = send.send(if failure.fenced() {
                    Answer::Fenced
                } else {
                    Answer::Other(format!("{failure:?}"))
                });
                match failure.relinquish().await {
                    Ok(()) => RequestDisposition::Complete,
                    Err(failure) => RequestDisposition::Retained(Box::new(failure)),
                }
            }
        }
    })
}

/// Normal unmount, request-drain half. Contract (architecture 73): the request
/// stays `active` from its receive until its future ends, whether it waits
/// for a reader or is inside a Store read, and Unmount requires the mount's
/// drain (`active == 0`) before `Revoke` is submitted.
#[test]
fn a_read_inside_its_store_read_keeps_the_lane_undrained_until_it_replies() {
    let rig = Rig::new("store-read-drain", 161);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);
    let (serial, handle) = rig.opened(&services);
    let idle = rig.counts();
    let grants = rig.store.read_work().grants;
    let (send, answer) = mpsc::channel();
    rig.held(reading(
        rig.services(&fence),
        rig.mount,
        serial,
        handle,
        send,
    ));
    assert_eq!(rig.store.read_work().grants, grants + 1);

    // What a known kernel detach does to the lane, then its drain.
    rig.queue.stop_receive().unwrap();
    assert!(!fence.stopped());
    rig.not_drained(idle);
    assert!(matches!(answer.try_recv(), Err(mpsc::TryRecvError::Empty)));

    rig.gate.release();
    assert_eq!(
        answer.recv_timeout(WAIT).unwrap(),
        Answer::Bytes(support::bytes(0)),
        "the READ answers the file's bytes once its Store read returns"
    );
    println!(
        "STORE-READ-DRAIN read: held(active=1 readers_leased=1 engine_rows=idle mount=Live lane_release=Busy) drain_wait_ended_at_deadline=true after_release(answer=exact bytes grants={}->{})",
        grants,
        rig.store.read_work().grants
    );
    drop(wait(services.close_file(rig.mount, serial, handle)).unwrap());
    drop(wait(services.forget(rig.mount, serial, 1)).unwrap());
    drop(services);
    rig.drained_and_revoked(1);
}

/// Forced teardown, lane half. Contract (architecture 73): "Force stops the
/// fence, so a READ parked for a reader ends with `ENOTCONN` at the reader
/// gate holding nothing, and one inside a Store read runs to its own result
/// while the drain waits for it"; architecture 80: "A terminal reply is not
/// completion of a job that was already attempted ... the drain waits for
/// it". By source (`operations/read.rs`) no fence gate follows the Store
/// read, so the READ's own result is the file's bytes, not `Fenced`.
#[test]
fn a_stopped_fence_does_not_end_a_read_inside_its_store_read() {
    let rig = Rig::new("store-read-fence", 162);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);
    let (serial, handle) = rig.opened(&services);
    let idle = rig.counts();
    let (send, answer) = mpsc::channel();
    rig.held(reading(
        rig.services(&fence),
        rig.mount,
        serial,
        handle,
        send.clone(),
    ));
    let grants = rig.store.read_work().grants;

    // What a written abort does to the lane, then the forced drain.
    rig.queue.stop_service().unwrap();
    assert!(fence.stopped());
    rig.not_drained(idle);
    assert!(matches!(answer.try_recv(), Err(mpsc::TryRecvError::Empty)));
    assert_eq!(fence.terminal_replies(), 0);
    // A READ that starts now is refused before its visit and takes no reader.
    let admitted = rig.jobs();
    let late = match wait(NativeData::read(
        rig.services(&fence),
        rig.mount,
        31,
        serial,
        Some(handle),
        ReadDataInput::File {
            offset: 0,
            length: 4096,
        },
    )) {
        Err(failure) => failure,
        Ok(_) => panic!("a READ started on a stopped fence"),
    };
    assert!(late.fenced());
    wait(late.relinquish()).unwrap();
    assert_eq!(rig.jobs(), admitted);
    assert_eq!(rig.store.read_work().grants, grants);

    rig.gate.release();
    let answered = answer.recv_timeout(WAIT).unwrap();
    println!("STORE-READ-FENCE read answered after the stop: {answered:?}");
    assert_eq!(
        answered,
        Answer::Bytes(support::bytes(0)),
        "a READ inside its Store read at the stop runs to its own result"
    );
    // The held READ took no second reader after the stop.
    assert_eq!(rig.store.read_work().grants, grants);
    drop(wait(services.close_file(rig.mount, serial, handle)).unwrap());
    drop(wait(services.forget(rig.mount, serial, 1)).unwrap());
    drop(services);
    rig.drained_and_revoked(1);
}

/// OPEN of a base file whose facts memory does not hold: the visit decided
/// nothing and recorded nothing, and the request is inside the Store read of
/// those facts. The lane is what accounts for it.
#[test]
fn an_open_inside_its_store_read_keeps_the_lane_undrained_and_records_nothing_yet() {
    let rig = Rig::new("store-read-open", 163);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);
    let (serial, first) = rig.opened(&services);
    let idle = rig.counts();
    let (send, answer) = mpsc::channel();
    let (mount, request) = (rig.mount, rig.services(&fence));
    rig.held(Box::pin(async move {
        let operation = NativeReadOperation::Open {
            serial,
            writable: false,
        };
        match NativeRead::prepare(request, mount, 40, serial, None, operation).await {
            Ok(opened) => {
                let _ = send.send(match opened.value().map(|value| value.file) {
                    Ok(Some(file)) => Answer::Opened(file.owner_id()),
                    other => Answer::Other(format!("{other:?}")),
                });
                match opened.dispose().await {
                    Ok(()) => RequestDisposition::Complete,
                    Err(failure) => RequestDisposition::Retained(Box::new(failure)),
                }
            }
            Err(failure) => {
                let _ = send.send(Answer::Other(format!("{failure:?}")));
                RequestDisposition::Retained(Box::new(failure))
            }
        }
    }));

    rig.queue.stop_receive().unwrap();
    rig.not_drained(idle);
    assert!(matches!(answer.try_recv(), Err(mpsc::TryRecvError::Empty)));

    rig.gate.release();
    let second = match answer.recv_timeout(WAIT).unwrap() {
        Answer::Opened(handle) => handle,
        other => panic!("the OPEN answered {other:?}"),
    };
    assert_ne!(second, first);
    println!(
        "STORE-READ-DRAIN open: held(active=1 engine_rows=idle lane_release=Busy) after_release(descriptor recorded by the deciding visit)"
    );
    until("the OPEN left the lane", || rig.lane().active == 0);
    for handle in [first, second] {
        drop(wait(services.close_file(rig.mount, serial, handle)).unwrap());
    }
    drop(wait(services.forget(rig.mount, serial, 1)).unwrap());
    drop(services);
    rig.drained_and_revoked(1);
}

/// READDIR: the reading visit recorded nothing, and the request is inside
/// the Store read of the inherited names of its window.
#[test]
fn a_readdir_inside_its_store_read_keeps_the_lane_undrained_until_its_names_are_read() {
    let rig = Rig::new("store-read-readdir", 164);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);
    let root = rig.root;
    let listed = wait(NativeRead::prepare(
        services.clone(),
        rig.mount,
        3,
        root,
        None,
        NativeReadOperation::Opendir { serial: root },
    ))
    .unwrap();
    let directory = listed.value().unwrap().directory.unwrap();
    wait(listed.dispose()).unwrap();
    let idle = rig.counts();
    let (send, answer) = mpsc::channel();
    let (mount, request, handle) = (rig.mount, rig.services(&fence), directory.owner_id());
    rig.held(Box::pin(async move {
        let stream = match DirectoryStream::prepare(request, mount, 50, root, handle, 0).await {
            Ok(stream) => stream,
            Err(failure) => {
                let _ = send.send(Answer::Other(format!("{failure:?}")));
                return RequestDisposition::Retained(Box::new(failure));
            }
        };
        // The window is read and nothing of it is accepted: no offset is
        // published, as for a reply buffer that took no entry.
        match stream.next().await {
            Ok(DirectoryStep::Batch(batch)) => {
                let names = batch.entries().map(|(entry, _)| entry.name.clone());
                let _ = send.send(Answer::Names(names.collect()));
                RequestDisposition::Complete
            }
            Ok(DirectoryStep::End(_)) => {
                let _ = send.send(Answer::Names(Vec::new()));
                RequestDisposition::Complete
            }
            Err(failure) => {
                let _ = send.send(Answer::Other(format!("{failure:?}")));
                RequestDisposition::Retained(Box::new(failure))
            }
        }
    }));

    rig.queue.stop_receive().unwrap();
    rig.not_drained(idle);
    assert!(matches!(answer.try_recv(), Err(mpsc::TryRecvError::Empty)));

    rig.gate.release();
    assert_eq!(
        answer.recv_timeout(WAIT).unwrap(),
        Answer::Names(vec![b"file-000000".to_vec()])
    );
    println!(
        "STORE-READ-DRAIN readdir: held(active=1 engine_rows=idle lane_release=Busy) after_release(names=[file-000000] offsets_published=0)"
    );
    until("the READDIR left the lane", || rig.lane().active == 0);
    drop(wait(services.close_directory(rig.mount, directory.serial(), handle)).unwrap());
    drop(services);
    rig.drained_and_revoked(1);
}

/// Forced teardown, OPEN. The fence is consulted only before an attempt
/// (`service/filesystem_port.rs`): the Store read that was started runs to
/// its end while the drain waits for it, and the deciding visit that would
/// follow is refused before it is submitted. Contract (architecture 73):
/// "a fenced or failed OPEN has nothing to give back".
#[test]
fn a_stopped_fence_refuses_the_visit_after_an_opens_store_read_and_records_nothing() {
    let rig = Rig::new("store-open-fence", 165);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);
    let (serial, first) = rig.opened(&services);
    let idle = rig.counts();
    let (send, answer) = mpsc::channel();
    let (mount, request) = (rig.mount, rig.services(&fence));
    rig.held(Box::pin(async move {
        let operation = NativeReadOperation::Open {
            serial,
            writable: false,
        };
        match NativeRead::prepare(request, mount, 41, serial, None, operation).await {
            Ok(opened) => {
                let _ = send.send(Answer::Other(format!(
                    "opened {:?}",
                    opened.value().is_ok()
                )));
                match opened.dispose().await {
                    Ok(()) => RequestDisposition::Complete,
                    Err(failure) => RequestDisposition::Retained(Box::new(failure)),
                }
            }
            Err(failure) => {
                let _ = send.send(if failure.fenced() {
                    Answer::Fenced
                } else {
                    Answer::Other(format!("{failure:?}"))
                });
                match failure.relinquish().await {
                    Ok(()) => RequestDisposition::Complete,
                    Err(failure) => RequestDisposition::Retained(Box::new(failure)),
                }
            }
        }
    }));
    let (grants, jobs) = (rig.store.read_work().grants, rig.jobs());

    rig.queue.stop_service().unwrap();
    assert!(fence.stopped());
    rig.not_drained(idle);
    assert!(matches!(answer.try_recv(), Err(mpsc::TryRecvError::Empty)));
    // The observations of `not_drained` are the only owner jobs since.
    let observed = rig.jobs();

    rig.gate.release();
    assert_eq!(
        answer.recv_timeout(WAIT).unwrap(),
        Answer::Fenced,
        "an OPEN whose Store read returns after the stop is refused before its deciding visit"
    );
    until("the OPEN left the lane", || rig.lane().active == 0);
    // No second descriptor, no visit and no second reader followed.
    assert_eq!(rig.jobs(), observed);
    assert_eq!(rig.store.read_work().grants, grants);
    assert_eq!(rig.counts(), idle);
    println!(
        "STORE-READ-FENCE open: held(active=1 engine_rows=idle lane_release=Busy) after_release(answer=Fenced owner_jobs={jobs}->{observed} (observations only) reader_grants={grants} engine_rows=idle)"
    );
    drop(wait(services.close_file(rig.mount, serial, first)).unwrap());
    drop(wait(services.forget(rig.mount, serial, 1)).unwrap());
    drop(services);
    rig.drained_and_revoked(1);
}

/// Forced teardown, READDIR. The names of the window whose Store read was
/// started are read, and the publishing visit that would make an offset of
/// them valid is refused before it is submitted: "an unpublished batch made
/// no offset valid" (`operations/directory.rs`).
#[test]
fn a_stopped_fence_refuses_the_publication_after_a_readdirs_store_read_and_stores_no_offset() {
    let rig = Rig::new("store-readdir-fence", 166);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);
    let root = rig.root;
    let listed = wait(NativeRead::prepare(
        services.clone(),
        rig.mount,
        3,
        root,
        None,
        NativeReadOperation::Opendir { serial: root },
    ))
    .unwrap();
    let directory = listed.value().unwrap().directory.unwrap();
    wait(listed.dispose()).unwrap();
    let idle = rig.counts();
    let (send, answer) = mpsc::channel();
    let (mount, request, handle) = (rig.mount, rig.services(&fence), directory.owner_id());
    rig.held(Box::pin(async move {
        let stream = match DirectoryStream::prepare(request, mount, 51, root, handle, 0).await {
            Ok(stream) => stream,
            Err(failure) => {
                let _ = send.send(Answer::Other(format!("{failure:?}")));
                return RequestDisposition::Retained(Box::new(failure));
            }
        };
        let batch = match stream.next().await {
            Ok(DirectoryStep::Batch(batch)) => batch,
            Ok(DirectoryStep::End(_)) => {
                let _ = send.send(Answer::Names(Vec::new()));
                return RequestDisposition::Complete;
            }
            Err(failure) => {
                let _ = send.send(Answer::Other(format!("{failure:?}")));
                return RequestDisposition::Retained(Box::new(failure));
            }
        };
        let names: Vec<_> = batch
            .entries()
            .map(|(entry, _)| entry.name.clone())
            .collect();
        let accepted = names.len();
        let _ = send.send(Answer::Names(names));
        // The reply buffer took every entry: their offsets are published
        // before the reply, as the request driver does.
        match batch.accept(accepted).await {
            Ok(_) => {
                let _ = send.send(Answer::Other("published".into()));
                RequestDisposition::Complete
            }
            Err(failure) => {
                let _ = send.send(if failure.fenced() {
                    Answer::Fenced
                } else {
                    Answer::Other(format!("{failure:?}"))
                });
                match failure.relinquish().await {
                    Ok(()) => RequestDisposition::Complete,
                    Err(failure) => RequestDisposition::Retained(Box::new(failure)),
                }
            }
        }
    }));
    let grants = rig.store.read_work().grants;

    rig.queue.stop_service().unwrap();
    assert!(fence.stopped());
    rig.not_drained(idle);
    assert!(matches!(answer.try_recv(), Err(mpsc::TryRecvError::Empty)));
    let observed = rig.jobs();

    rig.gate.release();
    assert_eq!(
        answer.recv_timeout(WAIT).unwrap(),
        Answer::Names(vec![b"file-000000".to_vec()]),
        "a READDIR inside its Store read at the stop reads its names"
    );
    assert_eq!(
        answer.recv_timeout(WAIT).unwrap(),
        Answer::Fenced,
        "the publication of their offsets is refused before its attempt"
    );
    until("the READDIR left the lane", || rig.lane().active == 0);
    // No reply row, no publishing job and no second reader followed.
    assert_eq!(rig.jobs(), observed);
    assert_eq!(rig.store.read_work().grants, grants);
    assert_eq!(rig.counts(), idle);
    println!(
        "STORE-READ-FENCE readdir: held(active=1 engine_rows=idle lane_release=Busy) after_release(names=[file-000000] publication=Fenced offsets_stored=0 reader_grants={grants})"
    );
    drop(wait(services.close_directory(rig.mount, directory.serial(), handle)).unwrap());
    drop(services);
    rig.drained_and_revoked(1);
}
