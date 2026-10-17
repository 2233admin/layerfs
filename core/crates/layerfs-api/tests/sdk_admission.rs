//! Oversized SDK admission is a known before-send refusal, with no replay.
use layerfs_api::internal::{self, Control, ControlCause, ControlPhase};
use layerfs_api::{OperationCause, SdkError};
use layerfs_bridge::{
    control::{Answer, Call, ControlError, Reply, Request, SdkValue},
    duplex,
};
use std::{
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};

fn pair(observed: bool) -> (Control, thread::JoinHandle<()>) {
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
        let mut channel =
            duplex::accept(server, &[72; 32], duplex::public_key(&[71; 32]).unwrap()).unwrap();
        let call = Call::decode(channel.receive.receive().unwrap()).unwrap();
        assert_eq!(
            call.id, 1,
            "refused encoding must not consume a send/correlation"
        );
        assert_eq!(matches!(call.request, Request::Observed { .. }), observed);
        let Request::Sdk(request) = call.request.without_observation().unwrap() else {
            panic!("one original SDK request")
        };
        assert_eq!(request.method, "test.small");
        channel
            .send
            .send(
                &Answer {
                    id: call.id,
                    reply: Reply::Sdk(SdkValue::Bool(true)),
                }
                .encode()
                .unwrap(),
            )
            .unwrap();
    });
    let connection =
        duplex::initiate(client, &[71; 32], duplex::public_key(&[72; 32]).unwrap()).unwrap();
    let mut control = Control::new(connection);
    if observed {
        internal::trace(&mut control, Some([73; 32]));
    }
    (control, worker)
}

fn oversized_call_is_too_large(observed: bool) {
    let (mut control, worker) = pair(observed);
    let error = layerfs_api::call(
        &mut control,
        "fs.apply",
        SdkValue::map([(
            "changes",
            SdkValue::List(vec![SdkValue::map([
                // A write body is streamed after the record (#352 F-001); an
                // edit's text still travels inside it.
                ("op", SdkValue::text("edit")),
                ("path", SdkValue::text("/source.js")),
                ("oldText", SdkValue::text("界".repeat(24_000))),
                ("newText", SdkValue::text("x")),
            ])]),
        )]),
    )
    .unwrap_err();
    assert_eq!(control.channel_work().0.records, 0);
    let small = layerfs_api::call(&mut control, "test.small", SdkValue::Null);
    worker.join().unwrap();
    assert_eq!(small.unwrap(), SdkValue::Bool(true));
    assert_eq!(control.channel_work().0.records, 1);
    let SdkError::Refused(refusal) = error else {
        panic!("expected typed TooLarge admission, got operation failure")
    };
    assert_eq!(refusal.code, "TooLarge");
    assert_eq!(refusal.detail, SdkValue::Null);
    assert!(
        !refusal.message.contains("界"),
        "payload is not an error message"
    );
}

#[test]
fn oversized_plain_sdk_call_is_too_large_without_send_or_replay() {
    oversized_call_is_too_large(false);
}

#[test]
fn oversized_traced_sdk_call_is_too_large_without_send_or_replay() {
    oversized_call_is_too_large(true);
}

#[test]
fn other_unattempted_encode_failure_preserves_original_failure_custody() {
    let (mut control, worker) = pair(false);
    let mut args = SdkValue::Null;
    for _ in 0..20 {
        args = SdkValue::List(vec![args]);
    }
    let error = layerfs_api::call(&mut control, "test.deep", args).unwrap_err();
    let small = layerfs_api::call(&mut control, "test.small", SdkValue::Null);
    worker.join().unwrap();
    assert_eq!(small.unwrap(), SdkValue::Bool(true));
    let SdkError::Operation(failure) = error else {
        panic!("original operation custody")
    };
    let OperationCause::Exchange(cause) = failure.cause else {
        panic!("original exchange custody")
    };
    assert_eq!(cause.phase, ControlPhase::Encode);
    assert!(!cause.attempted);
    assert!(matches!(
        cause.cause,
        ControlCause::Protocol(ControlError("SDK value depth"))
    ));
    assert!(cause.received.is_none());
    assert!(cause.fence_error.is_none());
}
