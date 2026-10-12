//! Bounded original Engine/control peers qualify SDK close custody and ordinary exec routing.
#![cfg(unix)]
#[allow(dead_code)]
#[path = "../../../layerfs-sandbox/tests/support/engine.rs"]
mod engine;
use engine::{fixed, frame, Peer};
use layerfs_bridge::{
    control::{Answer, Call, DaemonPhase, DaemonStatus, Reply, Request},
    daemon_setup::{DaemonLimits, DaemonSetup},
    native,
};
use layerfs_sdk::{
    ManagedSandbox, SandboxApi, SandboxCause, SandboxCreate, SandboxPhase, WorkspaceApi,
};
use std::{
    fs,
    net::TcpListener,
    path::PathBuf,
    sync::atomic::{AtomicUsize, Ordering},
    thread::{self, JoinHandle},
    time::{Duration, Instant},
};
const CID: &str = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const IMAGE: &str = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
static NEXT: AtomicUsize = AtomicUsize::new(0);
const SECCOMP: &str = r#"seccomp={\"defaultAction\":\"SCMP_ACT_ALLOW\",\"syscalls\":[{\"names\":[\"unshare\",\"clone\"],\"action\":\"SCMP_ACT_ERRNO\",\"errnoRet\":1,\"args\":[{\"index\":0,\"value\":268435456,\"valueTwo\":268435456,\"op\":\"SCMP_CMP_MASKED_EQ\"}]},{\"names\":[\"clone3\"],\"action\":\"SCMP_ACT_ERRNO\",\"errnoRet\":38}]}"#;
fn endpoint(port: u16) -> Vec<u8> {
    fixed(200,format!(r#"{{"Id":"{CID}","Image":"{IMAGE}","State":{{"Running":true,"Paused":false,"Restarting":false,"Dead":false}},"Config":{{"User":"0:0","Tty":false,"Entrypoint":["/usr/local/bin/layerfs-daemon"],"Cmd":["--config","/layerfs-local/config/daemon.setup"]}},"HostConfig":{{"Privileged":false,"CapAdd":["CAP_SYS_ADMIN"],"Devices":[{{"PathOnHost":"/dev/fuse","PathInContainer":"/dev/fuse","CgroupPermissions":"rwm"}}],"SecurityOpt":["no-new-privileges=true","apparmor=unconfined","{SECCOMP}"],"RestartPolicy":{{"Name":"no"}},"LogConfig":{{"Type":"json-file"}}}},"Mounts":[{{"Type":"volume","Name":"lfs-test-borrowed","Destination":"/layerfs-store","RW":true,"Driver":"local"}}],"NetworkSettings":{{"Ports":{{"30421/tcp":[{{"HostIp":"127.0.0.1","HostPort":"{port}"}}]}}}}}}"#).as_bytes())
}
fn setup(private: [u8; 32], peer: [u8; 32]) -> DaemonSetup {
    DaemonSetup {
        listen: "0.0.0.0:30421".into(),
        private_key: private,
        control_peer: peer,
        store: "/layerfs-store/global/store.sqlite".into(),
        overlay: "/layerfs-local/overlay/overlay.sqlite".into(),
        mounts: "/workspaces".into(),
        command_uid: 501,
        command_gid: 20,
        limits: DaemonLimits {
            connections: 4,
            handshake_ms: 2000,
            read_handles: 2,
            cache_bytes: 65536,
            owner_bytes: 16 * 1024 * 1024,
            lifecycle_reserve: 2 * 1024 * 1024,
            namespaces: 8,
            ordinary_jobs: 8,
            lifecycle_jobs: 4,
            pager_kib: 1024,
            serial_low_water: 256,
        },
        existing_store: None,
    }
}

struct Fixture {
    api: SandboxApi,
    owner: Option<ManagedSandbox>,
    peer: Option<Peer>,
    daemon: Option<JoinHandle<()>>,
    binary: PathBuf,
}
impl Fixture {
    fn new(tail: Vec<Vec<u8>>) -> Self {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        listener.set_nonblocking(true).unwrap();
        let daemon = thread::spawn(move || {
            let until = Instant::now() + Duration::from_secs(3);
            let socket = loop {
                match listener.accept() {
                    Ok((socket, _)) => break socket,
                    Err(error)
                        if error.kind() == std::io::ErrorKind::WouldBlock
                            && Instant::now() < until =>
                    {
                        thread::sleep(Duration::from_millis(2))
                    }
                    Err(error) => panic!("bounded original Hello accept: {error}"),
                }
            };
            socket.set_nonblocking(false).unwrap();
            socket
                .set_read_timeout(Some(Duration::from_secs(2)))
                .unwrap();
            socket
                .set_write_timeout(Some(Duration::from_secs(2)))
                .unwrap();
            let mut channel =
                native::accept(socket, &[32; 32], native::public_key(&[31; 32]).unwrap()).unwrap();
            let call = Call::decode(channel.receive.receive().unwrap()).unwrap();
            assert!(
                matches!(call.request, Request::Hello(request) if !request.wait_for_store && request.expected_instance.is_none())
            );
            channel
                .send
                .send(
                    &Answer {
                        id: call.id,
                        reply: Reply::Hello(DaemonStatus {
                            instance: [9; 32],
                            phase: DaemonPhase::InstallPending,
                            overlay_sqlite: Some("3.51.0".into()),
                            store_sqlite: None,
                        }),
                    }
                    .encode()
                    .unwrap(),
                )
                .unwrap();
        });
        let marker = frame(1, b"LAYERFS_DAEMON_LISTEN 0.0.0.0:30421\n");
        let mut logs = format!("HTTP/1.1 200 OK\r\nContent-Type: application/vnd.docker.multiplexed-stream\r\nContent-Length: {}\r\n\r\n",marker.len()).into_bytes();
        logs.extend(marker);
        let mut responses = vec![
            fixed(200,b"{\"Name\":\"lfs-test-borrowed\",\"Driver\":\"local\",\"Scope\":\"local\",\"Options\":null}"),
            fixed(201,format!("{{\"Id\":\"{CID}\",\"Warnings\":[]}}").as_bytes()),
            fixed(200,b""), fixed(204,b""), logs, endpoint(port),
        ];
        responses.extend(tail);
        let (docker, peer) = Peer::new(responses, 4096);
        let api = SandboxApi::new(docker);
        let binary = std::env::temp_dir().join(format!(
            "sdk-operations-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        fs::write(&binary, b"original executable input").unwrap();
        let request = SandboxCreate {
            deployment: layerfs_sandbox::backend::docker::SandboxRequest {
                image: IMAGE.into(),
                store_volume: "lfs-test-borrowed".into(),
                port: 30421,
            },
            setup: setup([32; 32], native::public_key(&[31; 32]).unwrap()),
            executable: binary.clone(),
            controller_private: [31; 32],
            daemon_peer: native::public_key(&[32; 32]).unwrap(),
            startup_wait: Duration::from_secs(2),
        };
        // No Store is constructed or opened. This is the original InstallPending
        // startup used by component proofs, not a fabricated SDK owner.
        let mut fixture = Self {
            api,
            owner: None,
            peer: Some(peer),
            daemon: Some(daemon),
            binary,
        };
        fixture.owner = Some(layerfs_sdk::internal::start(&fixture.api, request).unwrap());
        fixture
    }
    fn calls(mut self) -> Vec<Vec<u8>> {
        let calls = self.peer.take().unwrap().finish();
        self.daemon.take().unwrap().join().unwrap();
        calls
    }
}
impl Drop for Fixture {
    fn drop(&mut self) {
        if let Some(daemon) = self.daemon.take() {
            let _ = daemon.join();
        }
        let _ = fs::remove_file(&self.binary);
    }
}
#[test]
fn close_stops_then_deletes_the_original_owner_without_deleting_its_borrowed_volume() {
    let mut fixture = Fixture::new(vec![fixed(204, b""), fixed(204, b"")]);
    fixture.api.close(fixture.owner.take().unwrap()).unwrap();
    let calls = fixture.calls();
    assert_eq!(calls.len(), 8);
    assert!(calls[6].starts_with(format!("POST /v1.54/containers/{CID}/stop?t=1 ").as_bytes()));
    assert!(calls[7]
        .starts_with(format!("DELETE /v1.54/containers/{CID}?force=false&v=false ").as_bytes()));
    assert!(!calls
        .iter()
        .any(|call| call.starts_with(b"DELETE /v1.54/volumes/")));
}
#[test]
fn failed_stop_preserves_original_owner_channel_inputs_and_attempt_without_delete() {
    let mut fixture = Fixture::new(vec![fixed(409, b"original stop refusal")]);
    let mut owner = fixture.owner.take().unwrap();
    let work = layerfs_sdk::internal::control(&mut owner).channel_work();
    let handshake = owner.handshake;
    let failure = fixture.api.close(owner).unwrap_err();
    assert_eq!(failure.phase, SandboxPhase::Stop);
    let runtime = failure.sandbox.as_ref().unwrap();
    assert_eq!(runtime.identity().to_string(), CID);
    assert!(!runtime.disposition().stopped);
    assert!(!runtime.disposition().deleted);
    let SandboxCause::Runtime(cause) = &failure.cause else {
        panic!("original runtime failure")
    };
    assert_eq!(cause.requested_container, Some(runtime.identity()));
    assert!(cause.attempted);
    assert_eq!(failure.control.as_ref().unwrap().channel_work(), work);
    assert_eq!(failure.handshake, handshake);
    assert_eq!(failure.request.controller_private, [31; 32]);
    assert!(failure.installed.is_none());
    assert_eq!(fixture.calls().len(), 7);
}
#[test]
fn failed_delete_retains_acknowledged_stop_and_exact_delete_failure() {
    let mut fixture = Fixture::new(vec![
        fixed(204, b""),
        fixed(409, b"original delete refusal"),
    ]);
    let failure = fixture
        .api
        .close(fixture.owner.take().unwrap())
        .unwrap_err();
    assert_eq!(failure.phase, SandboxPhase::Delete);
    let runtime = failure.sandbox.as_ref().unwrap();
    assert_eq!(runtime.identity().to_string(), CID);
    assert!(runtime.disposition().stopped);
    assert!(!runtime.disposition().deleted);
    let SandboxCause::Runtime(cause) = &failure.cause else {
        panic!("original runtime failure")
    };
    assert_eq!(cause.requested_container, Some(runtime.identity()));
    assert!(cause.attempted);
    assert!(failure.control.is_some());
    assert_eq!(fixture.calls().len(), 8);
}

fn mounted() -> layerfs_sdk::MountedWorkspace {
    use layerfs_bridge::control::{NativeReceipt, ReadyMount, WorkspaceToken};
    use layerfs_content::ObjectId;
    use layerfs_history::{
        BranchId, BranchRecord, BranchSnapshot, HistoryName, LayerId, LayerStackId, WorkspaceId,
    };
    let token = WorkspaceToken {
        workspace: WorkspaceId::from_authority([4; 32]).unwrap(),
        namespace: 7,
    };
    let root = ObjectId::for_bytes(b"SDK exec mount fixture");
    layerfs_sdk::MountedWorkspace {
        bound: layerfs_sdk::BoundWorkspace {
            token,
            binding: BranchSnapshot {
                branch: BranchRecord {
                    id: BranchId::from_authority([1; 16]),
                    stack: LayerStackId::from_authority([2; 16]),
                    name: HistoryName::new("main").unwrap(),
                    base_layer: LayerId::from_bytes([0x32; 33]).unwrap(),
                    head_commit: None,
                },
                head_root: None,
                base_root: root,
                effective_root: root,
                scope: ObjectId::for_bytes(b"SDK scope"),
                profile: layerfs_content::filesystem::profile_id(),
            },
        },
        ready: ReadyMount {
            token,
            directory: "/workspaces/selected-mount".into(),
            receipt: NativeReceipt {
                mount: 0x0102,
                root: 7,
                mount_id: 911,
                device_major: 0,
                device_minor: 64,
                abi_major: 7,
                abi_minor: 41,
                offered: u64::MAX - 1,
                selected: (1 << 22) | 1,
                max_write: 131072,
                max_readahead: 65536,
                max_background: 12,
                congestion_threshold: 9,
                page_size: 4096,
                loops: 2,
                abort_bound: true,
            },
        },
    }
}
#[test]
fn workspace_exec_returns_original_runtime_owner_at_the_mount_with_no_daemon_registration() {
    const EID: &str = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
    let mut fixture = Fixture::new(vec![
        fixed(201, format!("{{\"Id\":\"{EID}\"}}").as_bytes()),
        fixed(204, b""),
        fixed(204, b""),
    ]);
    let before = layerfs_sdk::internal::control(fixture.owner.as_mut().unwrap()).channel_work();
    let created = WorkspaceApi::exec(
        fixture.owner.as_ref().unwrap(),
        &mounted(),
        vec!["/bin/pwd".into()],
        vec!["SDK_TEST=1".into()],
        false,
    )
    .unwrap();
    assert_eq!(created.identity().0.to_string(), CID);
    assert_eq!(created.identity().1.to_string(), EID);
    assert_eq!(created.request().directory, "/workspaces/selected-mount");
    assert_eq!(
        created.request().identity,
        layerfs_sandbox::CommandIdentity { uid: 501, gid: 20 }
    );
    assert_eq!(
        layerfs_sdk::internal::control(fixture.owner.as_mut().unwrap()).channel_work(),
        before
    );
    fixture.api.close(fixture.owner.take().unwrap()).unwrap();
    let calls = fixture.calls();
    assert_eq!(calls.len(), 9);
    let request = std::str::from_utf8(&calls[6]).unwrap();
    assert!(request.starts_with(&format!("POST /v1.54/containers/{CID}/exec ")));
    assert!(request.contains(r#""WorkingDir":"/workspaces/selected-mount""#));
    assert!(request.contains(r#""User":"501:20""#));
    assert!(!calls
        .iter()
        .any(|call| call.windows(12).any(|bytes| bytes == b"/exec/start ")));
}
#[test]
fn workspace_exec_failure_keeps_exact_original_request_and_container() {
    let mut fixture = Fixture::new(vec![
        fixed(409, b"original exec refusal"),
        fixed(204, b""),
        fixed(204, b""),
    ]);
    let failure = WorkspaceApi::exec(
        fixture.owner.as_ref().unwrap(),
        &mounted(),
        vec!["/bin/pwd".into()],
        vec![],
        true,
    )
    .unwrap_err();
    assert_eq!(failure.container.to_string(), CID);
    assert_eq!(failure.request.directory, "/workspaces/selected-mount");
    assert_eq!(failure.request.arguments, ["/bin/pwd"]);
    assert!(failure.request.stdin);
    assert!(failure.transfer.attempted);
    fixture.api.close(fixture.owner.take().unwrap()).unwrap();
    assert_eq!(fixture.calls().len(), 9);
}
