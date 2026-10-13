//! Actual per-mount request drain -> direct Workspace jobs -> direct Store composition.
#[path = "support/installed_store.rs"]
mod support;
use layerfs_content::filesystem::PathName;
use layerfs_daemon::{
    bootstrap::open_store, store::BindRequest, NativeReply, Owner, OwnerClient, OwnerConfig,
    OwnerError, OwnerWork, Response, ServiceClass,
};
use layerfs_fuse::{
    operations::{
        DirectoryStep, DirectoryStream, NativeData, NativeRead, ReadDataInput, ReadFailure,
    },
    ports::{Fence, MountServices},
    FailureView, MountRequests, RequestDisposition,
};
use layerfs_history::WorkspaceId;
use layerfs_overlay::ProfileConfig;
use layerfs_workspace::{NativeReadOperation, Operation, Outcome, Position, Refusal, Time};
use std::{
    future::Future,
    sync::{mpsc, Arc},
    task::{Context, Poll, Wake, Waker},
    time::{Duration, Instant},
};
const WAIT: Duration = Duration::from_secs(3);
struct Event(mpsc::SyncSender<()>);
impl Wake for Event {
    fn wake(self: Arc<Self>) {
        let _ = self.0.try_send(());
    }
}
fn wait<T>(future: impl Future<Output = T>) -> T {
    let mut future = std::pin::pin!(future);
    let (send, recv) = mpsc::sync_channel(1);
    let waker = Waker::from(Arc::new(Event(send)));
    let deadline = Instant::now() + WAIT;
    loop {
        match future.as_mut().poll(&mut Context::from_waker(&waker)) {
            Poll::Ready(value) => return value,
            Poll::Pending => recv
                .recv_timeout(deadline.saturating_duration_since(Instant::now()))
                .unwrap(),
        }
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
fn work(client: &OwnerClient) -> OwnerWork {
    client.diagnostics().unwrap()
}
fn until(mut condition: impl FnMut() -> bool) {
    let deadline = Instant::now() + WAIT;
    while !condition() {
        assert!(Instant::now() < deadline, "bounded native port observation");
        std::thread::yield_now();
    }
}

#[test]
fn real_native_steps_park_for_readers_and_release_original_consumers() {
    let f = support::Fixture::new(1, "filesystem-port");
    assert_eq!(f.count, 1);
    let store = open_store(
        f.config.clone(),
        support::BINDING,
        support::CURSOR,
        1,
        0,
        Default::default(),
    )
    .unwrap();
    let owner = Owner::start(
        &f.directory.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let identity = WorkspaceId::from_authority([108; 32]).unwrap();
    let bound = store
        .bind(
            client.clone(),
            BindRequest {
                branch: f.branch,
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
    let done = client.native_mount(Some(bound.route()), root).unwrap();
    let mount = match done.result() {
        Ok(Response::Native(NativeReply::Mount(value))) => *value,
        value => panic!("{value:?}"),
    };
    drop(done);
    let queue = MountRequests::new(mount);
    // Exhaust the actual provider, then let three requests wait for it. A
    // fourth request must run while those original reader tickets wait.
    let held = wait(store.read_ticket(Some(identity)).unwrap()).unwrap();
    let (send, recv) = mpsc::channel();
    for request in 1..=3 {
        let services = bound.request(&Fence::default()).unwrap();
        let send = send.clone();
        serve(
            &queue,
            11,
            Box::pin(async move {
                let answer = NativeRead::prepare(
                    services,
                    mount,
                    request,
                    root,
                    None,
                    NativeReadOperation::Lookup {
                        parent: root,
                        name: PathName::new("file-000000").unwrap(),
                    },
                )
                .await
                .unwrap();
                let value = answer.value().unwrap();
                let observation = (value.stat.serial, value.stat.logical_len);
                answer.dispose().await.unwrap();
                send.send(observation).unwrap();
                RequestDisposition::Complete
            }),
        );
    }
    until(|| store.read_work().waiting == 3 && queue.work().unwrap().active == 3);
    let (progress, observed) = mpsc::sync_channel(1);
    serve(
        &queue,
        0,
        Box::pin(async move {
            progress.send(()).unwrap();
            RequestDisposition::Complete
        }),
    );
    observed.recv_timeout(WAIT).unwrap();
    assert_eq!(store.read_work().waiting, 3);
    drop(held); // Original reader-release event, with no subsequent request.
    let values: Vec<_> = (0..3).map(|_| recv.recv_timeout(WAIT).unwrap()).collect();
    assert!(values.iter().all(|value| *value == values[0]));
    assert_eq!(values[0].1, support::bytes(0).len() as u64);
    until(|| queue.work().unwrap().active == 0);
    assert_eq!(store.read_work().outstanding, 0);
    let services = bound.request(&Fence::default()).unwrap();
    let serial = values[0].0;
    let opened = wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        5,
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
    drop(wait(services.forget(mount, values[0].0, 3)).unwrap());
    let window = ReadDataInput::File {
        offset: 0,
        length: layerfs_overlay::READ_WINDOW as u32,
    };
    let data = wait(NativeData::read(
        bound.request(&Fence::default()).unwrap(),
        mount,
        6,
        serial,
        Some(handle),
        window,
    ))
    .unwrap()
    .unwrap();
    assert_eq!(data.bytes(), support::bytes(0));
    assert_eq!(
        store.read_work().outstanding,
        0,
        "provider returned before reply consumer"
    );
    // The read holds nothing in the owner: its bytes are the request's own.
    drop(data);
    // Prepare an actual mixed inherited/local 128KiB window through the normal
    // Workspace mutation API; the native read copies its local part in its
    // one visit and fills the inherited part from the base that visit named.
    let operation = bound.operation().unwrap();
    let acquired = client
        .acquire_base_source(Some(bound.route()), 991)
        .unwrap();
    let source = match acquired.result() {
        Ok(Response::BaseSource(source)) => *source,
        other => panic!("{other:?}"),
    };
    drop(acquired);
    let view = operation.workspace().view_for_source(source).unwrap();
    let local = vec![0x6e; layerfs_overlay::READ_WINDOW - 17];
    let outcome = operation
        .workspace()
        .mutate(
            &client,
            operation.ports(),
            &view,
            Operation::Write {
                serial,
                position: Position::At(17),
                data: local.as_slice().into(),
            },
            Time {
                seconds: 5,
                nanoseconds: 7,
            },
        )
        .unwrap();
    let Outcome::Applied { publication, .. } = outcome else {
        panic!("local window was not published")
    };
    let disposed = client.reply_attempted(publication).unwrap();
    assert!(disposed.result().is_ok());
    drop(disposed);
    drop(view);
    drop(operation);
    let released = client
        .release_base_source(Some(bound.route()), source)
        .unwrap();
    assert!(released.result().is_ok());
    drop(released);
    let data = wait(NativeData::read(
        bound.request(&Fence::default()).unwrap(),
        mount,
        7,
        serial,
        Some(handle),
        window,
    ))
    .unwrap()
    .unwrap();
    assert_eq!(data.bytes().len(), layerfs_overlay::READ_WINDOW);
    assert_eq!(&data.bytes()[..17], &support::bytes(0)[..17]);
    assert_eq!(&data.bytes()[17..], local);
    assert_eq!(store.read_work().outstanding, 0);
    drop(data);
    drop(wait(services.close_file(mount, serial, handle)).unwrap());

    // A definite missing-name refusal of a lookup is not confused with an
    // uncertain SQL failure, and owns nothing: the lookup was two Workspace
    // visits around one base read, with no source and no retained result, so
    // disposing the reply runs no job.
    let before = work(&client);
    let grants = store.read_work().grants;
    let missing = wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        4,
        root,
        None,
        NativeReadOperation::Lookup {
            parent: root,
            name: PathName::new("absent").unwrap(),
        },
    ))
    .unwrap();
    assert!(matches!(missing.value(), Err(Refusal::Missing)));
    let visited = work(&client);
    assert_eq!(
        visited.jobs.iter().sum::<u64>(),
        before.jobs.iter().sum::<u64>() + 2
    );
    assert_eq!(
        visited.jobs[ServiceClass::Read as usize],
        before.jobs[ServiceClass::Read as usize] + 2
    );
    assert_eq!(
        visited.jobs[ServiceClass::Source as usize],
        before.jobs[ServiceClass::Source as usize]
    );
    assert_eq!(store.read_work().grants, grants + 1);
    wait(missing.dispose()).unwrap();
    let disposed = work(&client);
    assert_eq!(disposed.jobs, visited.jobs);
    // OPEN of a directory is refused the same way, by two visits around
    // one base read, and owns nothing either: no source, no descriptor, and
    // no job after the reply.
    let grants = store.read_work().grants;
    let refused = wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        8,
        root,
        None,
        NativeReadOperation::Open {
            serial: root,
            writable: false,
        },
    ))
    .unwrap();
    assert!(matches!(refused.value(), Err(Refusal::IsDirectory)));
    let visited = work(&client);
    assert_eq!(
        (
            visited.jobs.iter().sum::<u64>(),
            visited.jobs[ServiceClass::Read as usize],
            visited.jobs[ServiceClass::Source as usize]
        ),
        (
            disposed.jobs.iter().sum::<u64>() + 2,
            disposed.jobs[ServiceClass::Read as usize] + 2,
            disposed.jobs[ServiceClass::Source as usize]
        )
    );
    assert_eq!(store.read_work().grants, grants + 1);
    wait(refused.dispose()).unwrap();
    let disposed = work(&client);
    assert_eq!(disposed.jobs, visited.jobs);
    // OPENDIR is a visit as well: its definite refusal, of a regular file
    // the kernel references, holds nothing and is followed by no release.
    let found = wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        9,
        root,
        None,
        NativeReadOperation::Lookup {
            parent: root,
            name: PathName::new("file-000000").unwrap(),
        },
    ))
    .unwrap();
    assert_eq!(found.value().unwrap().stat.serial, serial);
    wait(found.dispose()).unwrap();
    let disposed = work(&client);
    let refused = wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        10,
        serial,
        None,
        NativeReadOperation::Opendir { serial },
    ))
    .unwrap();
    assert!(matches!(refused.value(), Err(Refusal::NotDirectory)));
    let held = work(&client);
    assert_eq!(
        (
            held.jobs.iter().sum::<u64>(),
            held.jobs[ServiceClass::Read as usize],
            held.jobs[ServiceClass::Source as usize]
        ),
        (
            disposed.jobs.iter().sum::<u64>() + 1,
            disposed.jobs[ServiceClass::Read as usize] + 1,
            disposed.jobs[ServiceClass::Source as usize]
        )
    );
    wait(refused.dispose()).unwrap();
    let released = work(&client);
    assert_eq!(released.jobs, held.jobs);
    drop(wait(services.forget(mount, serial, 1)).unwrap());
    let done = client.native_revoke(Some(bound.route()), mount).unwrap();
    assert!(matches!(
        done.result(),
        Ok(Response::Native(NativeReply::Done))
    ));
    drop(done);
    queue.stop_receive().unwrap();
    queue.finish().unwrap();
    drop(services);
    drop(bound);
    owner.stop().unwrap();
    drop(store);
    f.cleanup();
}

#[test]
fn terminal_owner_failure_retains_unattempted_input_without_replay() {
    let f = support::Fixture::new(1, "filesystem-port-stopped");
    assert_eq!(f.count, 1);
    let store = open_store(
        f.config.clone(),
        support::BINDING,
        support::CURSOR,
        1,
        0,
        Default::default(),
    )
    .unwrap();
    let owner = Owner::start(
        &f.directory.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let bound = store
        .bind(
            client.clone(),
            BindRequest {
                branch: f.branch,
                workspace: WorkspaceId::from_authority([109; 32]).unwrap(),
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
    let done = client.native_mount(Some(bound.route()), root).unwrap();
    let mount = match done.result() {
        Ok(Response::Native(NativeReply::Mount(value))) => *value,
        value => panic!("{value:?}"),
    };
    drop(done);
    let queue = MountRequests::new(mount);
    owner.stop().unwrap();
    // A stopped service has no open Workspace left to hold or count.
    let before = client.diagnostics().unwrap().jobs;
    // The first Workspace job of a lookup and of an OPENDIR is its visit. Each
    // is retained in its own slot.
    let requests = [
        (
            u64::MAX,
            NativeReadOperation::Lookup {
                parent: root,
                name: PathName::new("file-000000").unwrap(),
            },
        ),
        (u64::MAX - 1, NativeReadOperation::Opendir { serial: root }),
    ];
    // Both are received before either runs: the first retained failure makes
    // the mount terminal, which refuses later receives and not a served request.
    let received = requests
        .iter()
        .map(|_| queue.receive().unwrap().request(0).unwrap())
        .collect::<Vec<_>>();
    for (slot, (owner, (request, operation))) in received
        .into_iter()
        .zip(requests.iter().cloned())
        .enumerate()
    {
        let services = bound.request(&Fence::default()).unwrap();
        owner
            .serve(Box::pin(async move {
                match NativeRead::prepare(services, mount, request, root, None, operation).await {
                    Err(error) => RequestDisposition::Retained(Box::new(error)),
                    Ok(_) => panic!("a stopped service cannot run a new job"),
                }
            }))
            .unwrap();
        assert_eq!(queue.work().unwrap().retained, slot + 1);
    }
    assert!(queue.receive().is_err());
    for (slot, (request, operation)) in requests.iter().enumerate() {
        queue
            .inspect_failure(slot, |failure| {
                let FailureView::Request(error) = failure else {
                    panic!("expected original owner error")
                };
                let error = error.downcast_ref::<ReadFailure>().unwrap();
                assert_eq!(error.request(), *request);
                assert_eq!(error.protected(), root);
                match (error.operation(), operation) {
                    (
                        NativeReadOperation::Lookup { parent, name },
                        NativeReadOperation::Lookup { .. },
                    ) => assert!(*parent == root && name.as_bytes() == b"file-000000"),
                    (
                        NativeReadOperation::Opendir { serial },
                        NativeReadOperation::Opendir { .. },
                    ) => assert_eq!(*serial, root),
                    other => panic!("retained another operation: {other:?}"),
                }
                let original = error.reason.downcast_ref::<OwnerError>().unwrap();
                // The action that never ran comes back opaque, with its cause.
                let OwnerError::Unattempted { cause, .. } = original else {
                    panic!("{original:?}")
                };
                assert!(matches!(cause.as_ref(), OwnerError::Stopped));
                let _ = operation;
            })
            .unwrap();
    }
    assert_eq!(client.diagnostics().unwrap().jobs, before);
    drop(queue);
    drop(bound);
    drop(store);
    f.cleanup();
}

#[test]
fn many_waiting_reads_of_one_mount_all_complete_through_one_reader() {
    use std::sync::Mutex;
    struct Gate(Mutex<(bool, Vec<Option<Waker>>)>);
    struct Turn(Arc<Gate>, usize);
    impl Future for Turn {
        type Output = ();
        fn poll(self: std::pin::Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
            let mut state = self.0 .0.lock().unwrap();
            if state.0 {
                Poll::Ready(())
            } else {
                state.1[self.1] = Some(cx.waker().clone());
                Poll::Pending
            }
        }
    }
    let f = support::Fixture::new(1, "full-native-handoff");
    assert_eq!(f.count, 1);
    let store = open_store(
        f.config.clone(),
        support::BINDING,
        support::CURSOR,
        1,
        0,
        Default::default(),
    )
    .unwrap();
    let owner = Owner::start(
        &f.directory.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let bound = store
        .bind(
            client.clone(),
            BindRequest {
                branch: f.branch,
                workspace: WorkspaceId::from_authority([110; 32]).unwrap(),
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
    let done = client.native_mount(Some(bound.route()), root).unwrap();
    let mount = match done.result() {
        Ok(Response::Native(NativeReply::Mount(mount))) => *mount,
        other => panic!("{other:?}"),
    };
    drop(done);
    let lookup = wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        1,
        root,
        None,
        NativeReadOperation::Lookup {
            parent: root,
            name: PathName::new("file-000000").unwrap(),
        },
    ))
    .unwrap();
    let serial = lookup.value().unwrap().stat.serial;
    wait(lookup.dispose()).unwrap();
    let queue = MountRequests::new(mount);
    let count = 16;
    let gate = Arc::new(Gate(Mutex::new((false, vec![None; count]))));
    let (prepared, ready) = mpsc::channel();
    let (done, completed) = mpsc::channel();
    for index in 0..count {
        let services = bound.request(&Fence::default()).unwrap();
        let prepared = prepared.clone();
        let done = done.clone();
        let gate = gate.clone();
        serve(
            &queue,
            0,
            Box::pin(async move {
                prepared.send(()).unwrap();
                Turn(gate, index).await;
                let data = NativeData::read(
                    services,
                    mount,
                    1000 + index as u64,
                    serial,
                    None,
                    ReadDataInput::File {
                        offset: 0,
                        length: layerfs_overlay::READ_WINDOW as u32,
                    },
                )
                .await
                .unwrap()
                .unwrap();
                assert_eq!(data.bytes(), support::bytes(0));
                drop(data);
                done.send(()).unwrap();
                RequestDisposition::Complete
            }),
        );
    }
    for _ in 0..count {
        ready.recv_timeout(WAIT).unwrap();
    }
    until(|| queue.work().unwrap().active == count);
    let wakes = {
        let mut state = gate.0.lock().unwrap();
        state.0 = true;
        std::mem::take(&mut state.1)
    };
    for wake in wakes.into_iter().flatten() {
        wake.wake();
    }
    for _ in 0..count {
        completed.recv_timeout(WAIT).unwrap_or_else(|error| panic!(
            "waiting reads cannot advance: {error}; native={:?}; owner={:?}; store={:?}; fixture={:?}",
            queue.work().unwrap(), client.diagnostics().unwrap(), store.read_work(), f.directory));
    }
    until(|| queue.work().unwrap().active == 0);
    let services = bound.request(&Fence::default()).unwrap();
    drop(wait(services.forget(mount, serial, 1)).unwrap());
    let done = client.native_revoke(Some(bound.route()), mount).unwrap();
    assert!(done.result().is_ok());
    drop(done);
    queue.stop_receive().unwrap();
    queue.finish().unwrap();
    drop(services);
    drop(bound);
    owner.stop().unwrap();
    drop(store);
    f.cleanup();
}

#[test]
fn directory_consumer_publishes_only_accepted_names_and_a_reply_racing_releasedir_publishes_nothing(
) {
    let f = support::Fixture::new(65, "native-directory-consumer");
    assert_eq!(f.count, 65);
    let store = open_store(
        f.config.clone(),
        support::BINDING,
        support::CURSOR,
        1,
        0,
        Default::default(),
    )
    .unwrap();
    let owner = Owner::start(
        &f.directory.join("overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let bound = store
        .bind(
            client.clone(),
            BindRequest {
                branch: f.branch,
                workspace: WorkspaceId::from_authority([111; 32]).unwrap(),
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
    let done = client.native_mount(Some(bound.route()), root).unwrap();
    let mount = match done.result() {
        Ok(Response::Native(NativeReply::Mount(mount))) => *mount,
        other => panic!("{other:?}"),
    };
    drop(done);
    let open = wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        10,
        root,
        None,
        NativeReadOperation::Opendir { serial: root },
    ))
    .unwrap();
    let directory = open.value().unwrap().directory.unwrap();
    wait(open.dispose()).unwrap();
    let attributes = wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        11,
        root,
        Some(directory.owner_id()),
        NativeReadOperation::Getattr { serial: root },
    ))
    .unwrap();
    assert_eq!(
        attributes.value().unwrap().stat.kind,
        layerfs_content::object::inode_leaf::InodeKind::Directory
    );
    wait(attributes.dispose()).unwrap();

    let services = bound.request(&Fence::default()).unwrap();
    // Keep many requests' offered pages alive at once. Their original SQL
    // replies are already consumed, so publishing any prefix waits for none.
    let mut offered = Vec::new();
    for index in 0..16 {
        let stream = wait(DirectoryStream::prepare(
            services.clone(),
            mount,
            100 + index as u64,
            root,
            directory.owner_id(),
            2,
        ))
        .unwrap();
        let DirectoryStep::Batch(batch) = wait(stream.next()).unwrap() else {
            panic!("missing pressure page")
        };
        offered.push(batch);
    }
    for batch in offered {
        drop(wait(batch.accept(0)).unwrap());
    }
    let stream = wait(DirectoryStream::prepare(
        services.clone(),
        mount,
        12,
        root,
        directory.owner_id(),
        0,
    ))
    .unwrap();
    assert_eq!(
        stream.dots().collect::<Vec<_>>(),
        vec![(".", root, 1), ("..", root, 2)]
    );
    let DirectoryStep::Batch(batch) = wait(stream.next()).unwrap() else {
        panic!("missing first directory page")
    };
    let first: Vec<_> = batch
        .entries()
        .map(|(entry, cookie)| (entry.name.clone(), cookie))
        .collect();
    assert_eq!(first.len(), 64);
    let last_accepted = first[2].1;
    let never_accepted = first[3].1;
    let stream = wait(batch.accept(3)).unwrap();
    let DirectoryStep::End(_) = wait(stream.next()).unwrap() else {
        panic!("partial buffer must end this reply")
    };
    let invalid = match wait(DirectoryStream::prepare(
        services.clone(),
        mount,
        13,
        root,
        directory.owner_id(),
        never_accepted,
    )) {
        Err(error) => error,
        Ok(_) => panic!("reserved but unreturned cookie became visible"),
    };
    assert!(!invalid.fenced() && invalid.base_demand().is_none());
    drop(invalid);

    let stream = wait(DirectoryStream::prepare(
        services.clone(),
        mount,
        14,
        root,
        directory.owner_id(),
        last_accepted,
    ))
    .unwrap();
    assert_eq!(stream.dots().count(), 0);
    let DirectoryStep::Batch(batch) = wait(stream.next()).unwrap() else {
        panic!("missing continuation")
    };
    let remainder: Vec<_> = batch
        .entries()
        .map(|(entry, _)| entry.name.clone())
        .collect();
    assert_eq!(
        remainder,
        (3..65)
            .map(|index| format!("file-{index:06}").into_bytes())
            .collect::<Vec<_>>()
    );
    // No READDIR holds anything for its reply: RELEASEDIR ends the handle,
    // and a reply filled before it publishes nothing and fails.
    drop(wait(services.close_directory(mount, directory.serial(), directory.owner_id())).unwrap());
    let closed = match wait(NativeRead::prepare(
        bound.request(&Fence::default()).unwrap(),
        mount,
        15,
        root,
        Some(directory.owner_id()),
        NativeReadOperation::Getattr { serial: root },
    )) {
        Err(error) => error,
        Ok(_) => panic!("closed directory handle acquired a new source"),
    };
    assert!(!closed.fenced() && closed.base_demand().is_none());
    drop(closed);
    let raced = match wait(batch.accept(remainder.len())) {
        Err(error) => error,
        Ok(_) => panic!("a reply racing RELEASEDIR published its names"),
    };
    assert!(!raced.fenced() && raced.base_demand().is_none());
    assert_eq!(raced.prefix(), Some((remainder.len(), true)));
    drop(raced);
    assert_eq!(store.read_work().outstanding, 0);
    let done = client.native_revoke(Some(bound.route()), mount).unwrap();
    assert!(done.result().is_ok());
    drop(done);
    drop(services);
    drop(bound);
    owner.stop().unwrap();
    drop(store);
    f.cleanup();
}
