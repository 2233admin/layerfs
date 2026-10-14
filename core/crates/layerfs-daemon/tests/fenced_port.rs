//! The daemon's Fuse port under a stopped fence, without a kernel mount: the
//! real Workspace service, the real Store readers and the real per-mount request
//! drain whose `stop_service` stops the fence. Public API only; every wait is
//! bounded. A request that must wait runs on its own thread, as a mount worker
//! runs it.
#[path = "support/installed_store.rs"]
mod support;
use layerfs_content::filesystem::PathName;
use layerfs_daemon::{
    bootstrap::open_store,
    store::{BindRequest, BoundWorkspace, Store},
    JobReceipt, NativeReply, Owner, OwnerClient, OwnerConfig, Response, ServiceClass,
};
use layerfs_fuse::{
    operations::{
        create::mkdir, DirectoryStream, MutationInput, MutationRequest, NativeData, NativeMutation,
        NativeRead, ReadDataInput,
    },
    ports::{Fence, Fenced, MountServices, RequestServices, ServiceError},
    MountRequests, RequestDisposition,
};
use layerfs_history::WorkspaceId;
use layerfs_overlay::{NativeMount, ProfileConfig};
use layerfs_workspace::{NativeReadOperation, NativeVisitRequest, Time, VisitFacts};
use std::{
    future::Future,
    pin::Pin,
    sync::{mpsc, Arc},
    task::{Context, Poll, Wake, Waker},
    time::{Duration, Instant},
};

const WAIT: Duration = Duration::from_secs(5);
const NOW: Time = Time {
    seconds: 1_700_000_000,
    nanoseconds: 0,
};

struct Event(mpsc::SyncSender<()>);
impl Wake for Event {
    fn wake(self: Arc<Self>) {
        let _ = self.0.try_send(());
    }
}
/// Polls with a real wakeup channel; a future that never completes fails the
/// test at its deadline instead of hanging it.
struct Stepper {
    waker: Waker,
    woken: mpsc::Receiver<()>,
}
impl Stepper {
    fn new() -> Self {
        let (send, woken) = mpsc::sync_channel(1);
        Self {
            waker: Waker::from(Arc::new(Event(send))),
            woken,
        }
    }
    fn poll<F: Future + ?Sized>(&self, future: Pin<&mut F>) -> Poll<F::Output> {
        future.poll(&mut Context::from_waker(&self.waker))
    }
    fn finish<F: Future + ?Sized>(&self, mut future: Pin<&mut F>, what: &str) -> F::Output {
        let deadline = Instant::now() + WAIT;
        loop {
            if let Poll::Ready(value) = self.poll(future.as_mut()) {
                return value;
            }
            let remaining = deadline.saturating_duration_since(Instant::now());
            if self.woken.recv_timeout(remaining).is_err() {
                panic!("{what} did not complete within {WAIT:?}");
            }
        }
    }
}
fn wait<T>(future: impl Future<Output = T>) -> T {
    Stepper::new().finish(std::pin::pin!(future), "port call")
}
fn until(what: &str, mut condition: impl FnMut() -> bool) {
    let deadline = Instant::now() + WAIT;
    while !condition() {
        assert!(Instant::now() < deadline, "bounded observation: {what}");
        std::thread::yield_now();
    }
}
/// The first poll of an acquiring call on a stopped fence.
fn refused<T>(what: &str, future: impl Future<Output = Result<T, ServiceError>>) {
    match Stepper::new().poll(std::pin::pin!(future)) {
        Poll::Ready(Err(error)) if error.is::<Fenced>() => {}
        Poll::Ready(Err(error)) => panic!("{what}: refused for another reason: {error}"),
        Poll::Ready(Ok(_)) => panic!("{what}: attempted on a stopped fence"),
        Poll::Pending => panic!("{what}: waited on a stopped fence"),
    }
}
/// One request on its own receive thread, as a mount worker runs it.
fn serve(
    queue: &MountRequests,
    input: usize,
    future: layerfs_fuse::RequestFuture,
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

/// One bound Workspace with a native mount group and its request drain, and
/// no kernel connection. The drain exists so that the product's own
/// `stop_service` stops the fence the port observes.
struct Rig {
    fixture: support::Fixture,
    store: Arc<Store>,
    owner: Owner,
    client: OwnerClient,
    identity: WorkspaceId,
    bound: BoundWorkspace,
    root: u64,
    mount: NativeMount,
    queue: MountRequests,
}
impl Rig {
    fn new(label: &str, authority: u8) -> Self {
        let fixture = support::Fixture::new(1, label);
        assert_eq!(fixture.count, 1);
        let store = open_store(
            fixture.config.clone(),
            support::BINDING,
            support::CURSOR,
            1,
            0,
            Default::default(),
        )
        .unwrap();
        let owner = Owner::start(
            &fixture.directory.join("overlay"),
            ProfileConfig::default(),
            OwnerConfig::default(),
        )
        .unwrap();
        let client = owner.client();
        let identity = WorkspaceId::from_authority([authority; 32]).unwrap();
        let bound = store
            .bind(
                client.clone(),
                BindRequest {
                    branch: fixture.branch,
                    workspace: identity,
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
            store,
            owner,
            client,
            identity,
            bound,
            root,
            mount,
            queue,
        }
    }
    fn services(&self, fence: &Fence) -> Arc<dyn RequestServices> {
        self.bound.request(fence).unwrap()
    }
    fn lookup(
        &self,
        services: Arc<dyn RequestServices>,
        request: u64,
        parent: u64,
        name: &str,
    ) -> NativeRead {
        wait(NativeRead::prepare(
            services,
            self.mount,
            request,
            parent,
            None,
            NativeReadOperation::Lookup {
                parent,
                name: PathName::new(name).unwrap(),
            },
        ))
        .unwrap()
    }
    fn make_directory(&self, request: u64, parent: u64, name: &str) -> MutationRequest {
        MutationRequest {
            mount: self.mount,
            request,
            protected: parent,
            handle: None,
            input: MutationInput::Named(mkdir(parent, PathName::new(name).unwrap(), 0o755)),
            open: None,
            now: NOW,
        }
    }
    fn owner_work(&self) -> layerfs_daemon::OwnerWork {
        self.client.diagnostics().unwrap()
    }
    /// Reply tickets still owed in the Workspace: one Read-class job of the
    /// test, called beside the port and not through its fence.
    fn pending_publications(
        &self,
        route: layerfs_overlay::Route,
    ) -> Vec<layerfs_overlay::Publication> {
        let done = finish(
            &self.client,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.pending_publications(job_route, 0)
            },
        );
        match done.result() {
            Ok(Response::Publications(pending)) => pending.clone(),
            other => panic!("pending publications: {other:?}"),
        }
    }
    /// Revocation refuses while any request source or read row remains, so
    /// its success shows that every request gave back what it held.
    fn revoke_and_stop(self) {
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
        assert_eq!(self.store.read_work().outstanding, 0);
        self.queue.finish().unwrap();
        drop(self.bound);
        self.owner.stop().unwrap();
        drop(self.store);
        self.fixture.cleanup();
    }
}

#[test]
fn a_stopped_fence_refuses_every_acquiring_call_and_no_disposal_call() {
    let rig = Rig::new("fenced-port-calls", 141);
    let (mount, root) = (rig.mount, rig.root);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);

    // Everything a later call needs is acquired while the mount still serves.
    let found = rig.lookup(services.clone(), 1, root, "file-000000");
    let serial = found.value().unwrap().stat.serial;
    wait(found.dispose()).unwrap();
    let opened = wait(NativeRead::prepare(
        services.clone(),
        mount,
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
    let listed = wait(NativeRead::prepare(
        services.clone(),
        mount,
        3,
        root,
        None,
        NativeReadOperation::Opendir { serial: root },
    ))
    .unwrap();
    let directory = listed.value().unwrap().directory.unwrap();
    wait(listed.dispose()).unwrap();
    // A READDIR reading visit made before the stop: it holds nothing, and
    // its offer of offsets is what a publishing visit would be given.
    let reply = wait(services.directory_visit(mount, root, directory.owner_id(), 2, None)).unwrap();
    let offer = reply.get().offer.clone().expect("offsets for the reply");
    drop(reply);
    // A mutation as an owner visit, which records no source.
    let fresh = services.reserve_serial().unwrap().unwrap();
    let visit = NativeVisitRequest {
        mount,
        request: 8,
        serial: root,
        handle: None,
        input: MutationInput::Named(mkdir(root, PathName::new("never-visited").unwrap(), 0o755)),
        open: None,
        now: NOW,
        fresh: Some(fresh),
        facts: Arc::new(VisitFacts::default()),
    };
    // A published mutation whose reply attempt is still owed.
    let published = wait(NativeMutation::perform(
        services.clone(),
        rig.make_directory(7, root, "made-before"),
    ))
    .unwrap();
    assert!(published.value().unwrap().changed);

    let admitted = rig.owner_work().jobs.iter().sum::<u64>();
    let grants = rig.store.read_work().grants;
    rig.queue.stop_service().unwrap();
    assert!(fence.stopped());

    refused(
        "observe_visit",
        services.observe_visit(
            mount,
            14,
            root,
            None,
            NativeReadOperation::Getattr { serial: root },
            Arc::new(VisitFacts::default()),
        ),
    );
    refused(
        "observe_visit of an OPEN",
        services.observe_visit(
            mount,
            15,
            serial,
            None,
            NativeReadOperation::Open {
                serial,
                writable: false,
            },
            Arc::new(VisitFacts::default()),
        ),
    );
    refused("mutate_visit", services.mutate_visit(visit));
    refused("base", services.base());
    refused(
        "read_visit",
        services.read_visit(mount, serial, Some(handle), 0, 1),
    );
    refused(
        "directory_visit",
        services.directory_visit(mount, root, directory.owner_id(), 2, None),
    );
    refused(
        "publish_cookies",
        services.publish_cookies(offer, vec![b"file-000000".to_vec()]),
    );
    match services.reserve_serial() {
        Err(error) if error.is::<Fenced>() => {}
        other => panic!("reserve_serial on a stopped fence: {other:?}"),
    }
    // Refused before the attempt: no owner job was admitted, no reader granted.
    assert_eq!(rig.owner_work().jobs.iter().sum::<u64>(), admitted);
    assert_eq!(rig.store.read_work().grants, grants);
    assert_eq!(rig.store.read_work().outstanding, 0);

    // Every disposal call still runs: ticket, handles, lookup.
    // A replied mutation holds no source, and its reply attempt gives back a
    // ticket held in the engine's memory: the attempt is no job and runs
    // no SQL.
    let route = rig.bound.route();
    assert_eq!(rig.pending_publications(route).len(), 1);
    let admitted = rig.owner_work().jobs.iter().sum::<u64>();
    let attempts = rig.owner_work().sql_foreground.total().attempts;
    wait(published.replied()).unwrap();
    let replied = rig.owner_work();
    assert_eq!(replied.jobs.iter().sum::<u64>(), admitted);
    assert_eq!(replied.sql_foreground.total().attempts, attempts);
    drop(wait(services.close_file(mount, serial, handle)).unwrap());
    drop(wait(services.close_directory(mount, directory.serial(), directory.owner_id())).unwrap());
    drop(wait(services.forget(mount, serial, 1)).unwrap());
    // A READ or READLINK served before the stop left nothing to dispose.
    assert_eq!(rig.owner_work().jobs.iter().sum::<u64>(), admitted + 3);
    // The stopped fence did not keep the ticket: it was returned.
    assert!(rig.pending_publications(route).is_empty());
    // The port itself replies to nothing.
    assert_eq!(fence.terminal_replies(), 0);
    println!(
        "FENCED-CALLS refused=8 owner_admitted_during_refusals=0 reader_grants_during_refusals=0 reply_attempt_jobs_after_stop=0 reply_attempt_sql_after_stop=0 disposal_jobs_after_stop=3"
    );
    drop(services);
    rig.revoke_and_stop();
}

#[test]
fn a_wait_for_a_reader_ends_at_the_stop_with_nothing_attempted() {
    let rig = Rig::new("fenced-port-waits", 142);
    let (mount, root) = (rig.mount, rig.root);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);
    let stepper = Stepper::new();

    // A file opened while readers are still granted, for the READ below.
    let found = rig.lookup(services.clone(), 10, root, "file-000000");
    let serial = found.value().unwrap().stat.serial;
    wait(found.dispose()).unwrap();
    let opened = wait(NativeRead::prepare(
        services.clone(),
        mount,
        11,
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

    // Store readers: the only reader is leased to the test, so three cold
    // requests of the mount wait before their provider demand. A lookup is
    // served by Workspace visits and waits holding nothing; a READ of base
    // bytes made its one visit, recorded nothing and waits holding nothing;
    // an OPENDIR is a visit too and waits holding nothing.
    let reader = wait(rig.store.read_ticket(Some(rig.identity)).unwrap()).unwrap();
    let (send, observed) = mpsc::channel();
    {
        let services = rig.services(&fence);
        let send = send.clone();
        serve(
            &rig.queue,
            0,
            Box::pin(async move {
                let window = ReadDataInput::File {
                    offset: 0,
                    length: 4096,
                };
                match NativeData::read(services, mount, 302, serial, Some(handle), window).await {
                    Ok(_) => {
                        let _ = send.send((302, None));
                        RequestDisposition::Complete
                    }
                    Err(failure) => {
                        let _ = send.send((302, Some(failure.fenced())));
                        match failure.relinquish().await {
                            Ok(()) => RequestDisposition::Complete,
                            Err(failure) => RequestDisposition::Retained(Box::new(failure)),
                        }
                    }
                }
            }),
        );
    }
    for (request, operation) in [
        (
            300,
            NativeReadOperation::Lookup {
                parent: root,
                name: PathName::new("file-000000").unwrap(),
            },
        ),
        (301, NativeReadOperation::Opendir { serial: root }),
    ] {
        let services = rig.services(&fence);
        let send = send.clone();
        serve(
            &rig.queue,
            11,
            Box::pin(async move {
                let prepared =
                    NativeRead::prepare(services, mount, request, root, None, operation).await;
                match prepared {
                    Ok(answer) => {
                        let _ = send.send((request, None));
                        match answer.dispose().await {
                            Ok(()) => RequestDisposition::Complete,
                            Err(failure) => RequestDisposition::Retained(Box::new(failure)),
                        }
                    }
                    Err(failure) => {
                        let _ = send.send((request, Some(failure.fenced())));
                        // What the request driver does after its terminal reply.
                        match failure.relinquish().await {
                            Ok(()) => RequestDisposition::Complete,
                            Err(failure) => RequestDisposition::Retained(Box::new(failure)),
                        }
                    }
                }
            }),
        );
    }
    until("the three cold requests wait for a reader", || {
        rig.store.read_work().waiting == 3 && rig.queue.work().unwrap().active == 3
    });
    // One direct reader wait on the port, beside the waiting requests': for
    // the Workspace's current base.
    let mut cold_base = services.base();
    assert!(stepper.poll(cold_base.as_mut()).is_pending());
    until("all four reader waits registered", || {
        rig.store.read_work().waiting == 4 && rig.queue.work().unwrap().active == 3
    });
    let grants = rig.store.read_work().grants;
    let before = rig.owner_work();

    rig.queue.stop_service().unwrap();

    // The waiting requests needed no wakeup of their own: the stop woke them
    // and each failed before its demand. The lookup, the OPENDIR and the READ
    // held nothing.
    let mut seen = [
        observed.recv_timeout(WAIT).unwrap(),
        observed.recv_timeout(WAIT).unwrap(),
        observed.recv_timeout(WAIT).unwrap(),
    ];
    seen.sort();
    assert_eq!(
        seen,
        [(300, Some(true)), (301, Some(true)), (302, Some(true))]
    );
    until("the fenced requests ended", || {
        rig.queue.work().unwrap().active == 0
    });
    let lane = rig.queue.work().unwrap();
    assert_eq!((lane.completed, lane.retained), (3, 0));
    // The wait on the port ends as `Fenced`, having attempted nothing.
    match stepper.poll(cold_base.as_mut()) {
        Poll::Ready(Err(error)) if error.is::<Fenced>() => {}
        _ => panic!("base reader wait survived the stop"),
    }
    drop(cold_base);
    let readers = rig.store.read_work();
    assert_eq!(
        (readers.waiting, readers.outstanding, readers.grants),
        (0, 1, grants)
    );
    drop(reader);
    // No job ran since the stop: the fenced lookup, the fenced OPENDIR and
    // the fenced READ had nothing to release.
    let after = rig.owner_work();
    assert_eq!(
        after.jobs.iter().sum::<u64>(),
        before.jobs.iter().sum::<u64>()
    );
    assert_eq!(
        after.jobs[ServiceClass::Source as usize],
        before.jobs[ServiceClass::Source as usize]
    );
    println!(
        "FENCED-WAITS base_reader_wait=Fenced waiting_lookup=(fenced,no_source,no_read)->Complete waiting_read=(fenced,no_source,no_read)->Complete waiting_opendir=(fenced,no_source,no_read)->Complete owner_jobs_after_stop=0 source_jobs_after_stop=0 reader_grants_after_stop=0"
    );

    drop(wait(services.close_file(mount, serial, handle)).unwrap());
    drop(wait(services.forget(mount, serial, 1)).unwrap());
    drop(services);
    rig.revoke_and_stop();
}

#[test]
fn a_job_waiting_before_the_stop_is_awaited_to_its_original_result() {
    let rig = Rig::new("fenced-port-submitted", 143);
    let (mount, root, route) = (rig.mount, rig.root, rig.bound.route());
    let fence = rig.queue.fence();

    // A published directory whose reply attempt is owed keeps a capture
    // waiting, and a waiting capture holds back every later mutation job.
    let first = wait(NativeMutation::perform(
        rig.services(&fence),
        rig.make_directory(1, root, "first"),
    ))
    .unwrap();
    let parent = first.value().unwrap().stat.as_ref().unwrap().serial;
    let checks = rig.owner_work().jobs[ServiceClass::Capture as usize];
    let capture = {
        let client = rig.client.clone();
        std::thread::spawn(move || client.capture(Some(route)))
    };
    // Its readiness check observed the ticket pending: one counted job.
    until("capture waits behind the ticket", || {
        rig.owner_work().jobs[ServiceClass::Capture as usize] > checks
    });
    let before = rig.owner_work();
    // Inside the new local directory nothing has to be read from the base, so
    // this mutation's first Workspace job is the one that publishes. It is
    // also its only one, and it waits behind the capture before any effect.
    let second = {
        let (services, request) = (
            rig.services(&fence),
            rig.make_directory(2, parent, "second"),
        );
        std::thread::spawn(move || {
            let made = wait(NativeMutation::perform(services, request))
                .unwrap_or_else(|failure| panic!("waiting job lost its result: {failure:?}"));
            let value = made.value().unwrap();
            let answer = (value.changed, value.stat.as_ref().unwrap().serial);
            wait(made.replied()).unwrap();
            answer
        })
    };
    std::thread::sleep(Duration::from_millis(50));
    assert!(!second.is_finished() && !capture.is_finished());
    let admitted = rig.owner_work().jobs;
    assert_eq!(
        admitted[ServiceClass::Mutation as usize],
        before.jobs[ServiceClass::Mutation as usize]
    );

    rig.queue.stop_service().unwrap();
    assert!(fence.stopped());
    // Called and not yet run: the stop neither fails nor cancels it.
    assert!(!second.is_finished());
    // A mutation that starts now is refused before it acquires anything.
    let late = match wait(NativeMutation::perform(
        rig.services(&fence),
        rig.make_directory(3, root, "late"),
    )) {
        Err(failure) => failure,
        Ok(_) => panic!("a mutation started on a stopped fence"),
    };
    assert!(late.fenced());
    // Refused before its first visit: nothing published, nothing held, and
    // neither the attempt nor giving it up ran a Workspace job.
    assert!(late.publication().is_none());
    wait(late.relinquish()).unwrap();
    assert_eq!(rig.owner_work().jobs, admitted);

    // The owed reply attempt is a disposal call: it runs after the stop, as
    // no job and without SQL. It wakes the waiting capture; the capture
    // completes and the held-back mutation then runs to its own result.
    wait(first.replied()).unwrap();
    until("the capture returned", || capture.is_finished());
    let captured = capture.join().unwrap().unwrap();
    assert!(matches!(captured.result(), Ok(Response::Captured(_))));
    // Its receipt reports its readiness checks with its one effect.
    assert!(captured.work().jobs >= 2);
    drop(captured);
    until("the waiting mutation returned", || second.is_finished());
    let (changed, serial) = second.join().unwrap();
    assert!(changed);
    let after = rig.owner_work();
    assert_eq!(
        after.jobs[ServiceClass::Mutation as usize],
        before.jobs[ServiceClass::Mutation as usize] + 1
    );
    assert_eq!(
        after.jobs[ServiceClass::Source as usize],
        before.jobs[ServiceClass::Source as usize]
    );
    // Neither reply attempt was a job.
    assert_eq!(
        after.jobs[ServiceClass::Lifecycle as usize],
        before.jobs[ServiceClass::Lifecycle as usize]
    );
    assert_eq!(after.reply_attempts, before.reply_attempts + 2);
    assert_eq!(fence.terminal_replies(), 0);

    // Read back through a fence that was never stopped: the second directory
    // exists and the refused one does not.
    let reader = rig.services(&Fence::default());
    let found = rig.lookup(reader.clone(), 10, parent, "second");
    assert_eq!(found.value().unwrap().stat.serial, serial);
    wait(found.dispose()).unwrap();
    let absent = wait(NativeRead::prepare(
        reader,
        mount,
        11,
        root,
        None,
        NativeReadOperation::Lookup {
            parent: root,
            name: PathName::new("late").unwrap(),
        },
    ))
    .unwrap();
    assert!(absent.value().is_err());
    wait(absent.dispose()).unwrap();
    println!(
        "FENCED-WAITING held_job=Mutation result_after_stop=Published(changed) late_mutation=Fenced(no job, no ticket)"
    );
    rig.revoke_and_stop();
}

#[test]
fn a_fenced_mutation_holds_nothing_and_fenced_source_requests_give_back_what_they_hold() {
    let rig = Rig::new("fenced-port-drivers", 144);
    let (mount, root) = (rig.mount, rig.root);
    let fence = rig.queue.fence();
    let services = rig.services(&fence);
    let stepper = Stepper::new();

    let listed = wait(NativeRead::prepare(
        services.clone(),
        mount,
        1,
        root,
        None,
        NativeReadOperation::Opendir { serial: root },
    ))
    .unwrap();
    let directory = listed.value().unwrap().directory.unwrap();
    wait(listed.dispose()).unwrap();
    // An enumeration whose reading visit is done and that has not merged its
    // window yet: it holds nothing.
    let stream = wait(DirectoryStream::prepare(
        services.clone(),
        mount,
        2,
        root,
        directory.owner_id(),
        0,
    ))
    .unwrap();
    // A mutation whose first visit was undecided and wrote nothing. It waits
    // for the only Store reader, which the test has leased, holding nothing:
    // its base facts were never demanded.
    let reader = wait(rig.store.read_ticket(Some(rig.identity)).unwrap()).unwrap();
    let mut making = std::pin::pin!(NativeMutation::perform(
        services.clone(),
        rig.make_directory(3, root, "never-made"),
    ));
    let deadline = Instant::now() + WAIT;
    while rig.store.read_work().waiting != 1 {
        assert!(
            stepper.poll(making.as_mut()).is_pending(),
            "the mutation decided without a base fact"
        );
        assert!(
            Instant::now() < deadline,
            "mutation never waited for a reader"
        );
        let _ = stepper.woken.recv_timeout(Duration::from_millis(20));
    }
    // A second OPENDIR waits for the same reader while its base fact is not
    // yet read. It is a visit and holds nothing.
    let mut opening = std::pin::pin!(NativeRead::prepare(
        services.clone(),
        mount,
        5,
        root,
        None,
        NativeReadOperation::Opendir { serial: root },
    ));
    let deadline = Instant::now() + WAIT;
    while rig.store.read_work().waiting != 2 {
        assert!(
            stepper.poll(opening.as_mut()).is_pending(),
            "the directory was opened without a base fact"
        );
        assert!(
            Instant::now() < deadline,
            "OPENDIR never waited for a reader"
        );
        let _ = stepper.woken.recv_timeout(Duration::from_millis(20));
    }
    let admitted = rig.owner_work().jobs.iter().sum::<u64>();

    rig.queue.stop_service().unwrap();

    let failure = match stepper.poll(making.as_mut()) {
        Poll::Ready(Err(failure)) => failure,
        Poll::Ready(Ok(_)) => panic!("a mutation was decided on a stopped fence"),
        Poll::Pending => panic!("the reader wait survived the stop"),
    };
    assert!(failure.fenced());
    // A mutation records no request source and this one published nothing:
    // it holds nothing, and giving it up admits no owner job.
    assert!(failure.publication().is_none());
    wait(failure.relinquish()).unwrap();
    assert_eq!(rig.owner_work().jobs.iter().sum::<u64>(), admitted);

    let failure = match stepper.poll(opening.as_mut()) {
        Poll::Ready(Err(failure)) => failure,
        Poll::Ready(Ok(_)) => panic!("a directory was opened on a stopped fence"),
        Poll::Pending => panic!("the OPENDIR reader wait survived the stop"),
    };
    assert!(failure.fenced());
    wait(failure.relinquish()).unwrap();
    assert_eq!(rig.owner_work().jobs.iter().sum::<u64>(), admitted);
    assert_eq!(rig.store.read_work().waiting, 0);

    let failure = match wait(stream.next()) {
        Err(failure) => failure,
        Ok(_) => panic!("a directory page was read on a stopped fence"),
    };
    assert!(failure.fenced() && failure.offered().is_none());
    wait(failure.relinquish()).unwrap();
    // An enumeration that starts now is refused holding nothing too.
    let failure = match wait(DirectoryStream::prepare(
        services.clone(),
        mount,
        4,
        root,
        directory.owner_id(),
        0,
    )) {
        Err(failure) => failure,
        Ok(_) => panic!("an enumeration started on a stopped fence"),
    };
    assert!(failure.fenced() && failure.offered().is_none());
    wait(failure.relinquish()).unwrap();
    // Nothing was held, so nothing was released: no owner job was admitted.
    assert_eq!(rig.owner_work().jobs.iter().sum::<u64>(), admitted);
    drop(reader);
    drop(wait(services.close_directory(mount, directory.serial(), directory.owner_id())).unwrap());

    let absent = wait(NativeRead::prepare(
        rig.services(&Fence::default()),
        mount,
        6,
        root,
        None,
        NativeReadOperation::Lookup {
            parent: root,
            name: PathName::new("never-made").unwrap(),
        },
    ))
    .unwrap();
    assert!(absent.value().is_err());
    wait(absent.dispose()).unwrap();
    println!(
        "FENCED-DRIVERS mutation=(fenced,no_source,no_ticket)->nothing held opendir=(fenced,no_source,no_read)->nothing held directory=(fenced,nothing) late_directory=(fenced,nothing) owner_jobs_after_stop=0"
    );
    drop(services);
    rig.revoke_and_stop();
}
