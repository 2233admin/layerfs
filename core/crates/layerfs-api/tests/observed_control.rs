//! Normal and observed facades use one authenticated lifecycle with exact tokens.
use layerfs_api::{
    internal::{Control, ControlPhase},
    WorkspaceApi,
};
use layerfs_bridge::{
    control::{Answer, Call, CleanupObservation, Reply, Request, WorkspaceToken},
    duplex,
};
use layerfs_history::WorkspaceId;
use std::{
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};

fn pair(
    run: impl FnOnce(duplex::Connection) + Send + 'static,
) -> (Control, thread::JoinHandle<()>) {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let client =
        TcpStream::connect_timeout(&listener.local_addr().unwrap(), Duration::from_secs(2))
            .unwrap();
    let (server, _) = listener.accept().unwrap();
    for socket in [&client, &server] {
        socket
            .set_read_timeout(Some(Duration::from_secs(2)))
            .unwrap();
        socket
            .set_write_timeout(Some(Duration::from_secs(2)))
            .unwrap();
    }
    let worker = thread::spawn(move || {
        run(duplex::accept(server, &[52; 32], duplex::public_key(&[51; 32]).unwrap()).unwrap())
    });
    let connection =
        duplex::initiate(client, &[51; 32], duplex::public_key(&[52; 32]).unwrap()).unwrap();
    (Control::new(connection), worker)
}
fn token() -> WorkspaceToken {
    WorkspaceToken {
        workspace: WorkspaceId::from_authority([3; 32]).unwrap(),
        namespace: 7,
    }
}
#[test]
fn facade_observation_is_explicit_and_does_not_persist_on_channel() {
    let (mut control, worker) = pair(|mut channel| {
        for observed in [false, true, false] {
            let bytes = channel.receive.receive().unwrap();
            let call = Call::decode(bytes).unwrap();
            assert_eq!(matches!(call.request, Request::Observed { .. }), observed);
            if let Request::Observed { scope, .. } = &call.request {
                assert_eq!(*scope, [7; 32]);
            }
            assert_eq!(
                call.request.without_observation().unwrap(),
                &Request::Cleanup(token())
            );
            let answer = Answer {
                id: call.id,
                reply: Reply::Cleanup {
                    token: token(),
                    state: CleanupObservation::Gone,
                },
            };
            channel.send.send(&answer.encode().unwrap()).unwrap();
        }
    });
    assert_eq!(
        layerfs_api::internal::workspace(&mut control)
            .cleanup(token())
            .unwrap(),
        CleanupObservation::Gone
    );
    assert_eq!(
        layerfs_api::internal::with_observations(&mut control, &[7; 32])
            .cleanup(token())
            .unwrap(),
        CleanupObservation::Gone
    );
    assert_eq!(
        layerfs_api::internal::workspace(&mut control)
            .cleanup(token())
            .unwrap(),
        CleanupObservation::Gone
    );
    worker.join().unwrap();
}
#[test]
fn observed_reply_keeps_original_exact_token_validation() {
    let (mut control, worker) = pair(|mut channel| {
        let call = Call::decode(channel.receive.receive().unwrap()).unwrap();
        let mut wrong = token();
        wrong.namespace += 1;
        let answer = Answer {
            id: call.id,
            reply: Reply::Cleanup {
                token: wrong,
                state: CleanupObservation::Gone,
            },
        };
        channel.send.send(&answer.encode().unwrap()).unwrap();
    });
    let failed = control
        .call(Request::Observed {
            scope: [7; 32],
            request: Box::new(Request::Cleanup(token())),
        })
        .unwrap_err();
    assert!(failed.attempted);
    assert_eq!(failed.phase, ControlPhase::Validate);
    assert!(failed.received.is_some());
    worker.join().unwrap();
}
#[test]
fn observed_facade_borrows_scope_with_same_two_pointer_layout() {
    assert_eq!(
        std::mem::size_of::<WorkspaceApi<'_>>(),
        2 * std::mem::size_of::<usize>()
    );
}

#[test]
fn unmount_force_selects_one_original_request_without_unknown_relinquishment() {
    use layerfs_bridge::control::{ControlCode, ControlRefusal};
    let (mut control, worker) = pair(|mut channel| {
        for force in [false, true] {
            let call = Call::decode(channel.receive.receive().unwrap()).unwrap();
            let reply = if force {
                assert_eq!(
                    call.request,
                    Request::ForceUnmount {
                        token: token(),
                        relinquish_unknown: false
                    }
                );
                Reply::Refused(ControlRefusal {
                    code: ControlCode::Busy,
                    phase: "force:admission".into(),
                    moved: None,
                    published: None,
                    detail: "original owner retained".into(),
                })
            } else {
                assert_eq!(call.request, Request::Unmount(token()));
                Reply::Unmounted(token())
            };
            channel
                .send
                .send(&Answer { id: call.id, reply }.encode().unwrap())
                .unwrap();
        }
    });
    assert_eq!(
        layerfs_api::internal::workspace(&mut control)
            .unmount(token(), false)
            .unwrap(),
        None
    );
    let failure = layerfs_api::internal::workspace(&mut control)
        .unmount(token(), true)
        .unwrap_err();
    assert!(
        matches!(failure.cause, layerfs_api::OperationCause::Remote(ref cause) if cause.code == ControlCode::Busy && cause.phase == "force:admission")
    );
    worker.join().unwrap();
}

fn branch_record(stack: layerfs_history::LayerStackId) -> layerfs_history::BranchRecord {
    layerfs_history::BranchRecord {
        id: layerfs_history::BranchId::from_authority([4; 16]),
        stack,
        name: layerfs_history::HistoryName::new("main").unwrap(),
        base_layer: layerfs_history::LayerId::from_bytes([0x32; 33]).unwrap(),
        head_commit: None,
    }
}
#[test]
fn branches_keeps_one_original_request_and_exact_authenticated_continuation_per_call() {
    use layerfs_history::{LayerStackId, Page, PageResult};
    let stack = LayerStackId::from_authority([8; 16]);
    let (mut control, worker) = pair(move |mut channel| {
        for cursor in [None, Some(vec![6; 160])] {
            let call = Call::decode(channel.receive.receive().unwrap()).unwrap();
            assert_eq!(
                call.request,
                Request::Branches {
                    stack,
                    page: Page {
                        cursor: cursor.clone(),
                        limit: 1
                    }
                }
            );
            let answer = Answer {
                id: call.id,
                reply: Reply::Branches(PageResult {
                    records: vec![branch_record(stack)],
                    continuation: if cursor.is_none() {
                        Some(vec![6; 160])
                    } else {
                        None
                    },
                }),
            };
            channel.send.send(&answer.encode().unwrap()).unwrap();
        }
    });
    let first = layerfs_api::internal::branches(
        &mut control,
        stack,
        Page {
            cursor: None,
            limit: 1,
        },
    )
    .unwrap();
    assert_eq!(first.records, [branch_record(stack)]);
    let second = layerfs_api::internal::branches(
        &mut control,
        stack,
        Page {
            cursor: first.continuation,
            limit: 1,
        },
    )
    .unwrap();
    assert!(second.continuation.is_none());
    assert_eq!(control.channel_work().0.records, 2);
    assert_eq!(control.channel_work().1.records, 2);
    worker.join().unwrap();
}
#[test]
fn branches_wrong_stack_retains_original_reply_and_quarantines_the_attempted_owner() {
    use layerfs_history::{LayerStackId, Page, PageResult};
    let stack = LayerStackId::from_authority([8; 16]);
    let (mut control, worker) = pair(move |mut channel| {
        let call = Call::decode(channel.receive.receive().unwrap()).unwrap();
        channel
            .send
            .send(
                &Answer {
                    id: call.id,
                    reply: Reply::Branches(PageResult {
                        records: vec![branch_record(LayerStackId::from_authority([9; 16]))],
                        continuation: None,
                    }),
                }
                .encode()
                .unwrap(),
            )
            .unwrap();
    });
    let error = layerfs_api::internal::branches(
        &mut control,
        stack,
        Page {
            cursor: None,
            limit: 1,
        },
    )
    .unwrap_err();
    let layerfs_api::OperationCause::Exchange(cause) = error.cause else {
        panic!("original exchange failure required")
    };
    assert_eq!(cause.phase, ControlPhase::Validate);
    assert!(cause.attempted);
    assert!(matches!(cause.received.unwrap().reply, Reply::Branches(_)));
    let refused = control
        .call(Request::Branches {
            stack,
            page: Page {
                cursor: None,
                limit: 1,
            },
        })
        .unwrap_err();
    assert!(!refused.attempted);
    assert_eq!(control.channel_work().0.records, 1);
    worker.join().unwrap();
}
