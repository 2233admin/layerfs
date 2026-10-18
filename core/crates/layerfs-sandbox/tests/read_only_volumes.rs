//! #352 INSTALLS: further existing volumes mounted read-only, through a bounded external Unix Engine peer.
#[allow(dead_code)]
mod support {
    pub mod engine;
}
use layerfs_sandbox::{
    backend::docker::{CreatePhase, ReadOnlyVolume, SandboxRequest},
    RuntimeError,
};
use std::{
    fs::{self, File},
    io::Write,
    time::Duration,
};
use support::engine::{fixed, frame, Peer};
const CID: &str = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const IMAGE: &str = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const SECCOMP: &str = r#"seccomp={\"defaultAction\":\"SCMP_ACT_ALLOW\",\"syscalls\":[{\"names\":[\"unshare\",\"clone\"],\"action\":\"SCMP_ACT_ERRNO\",\"errnoRet\":1,\"args\":[{\"index\":0,\"value\":268435456,\"valueTwo\":268435456,\"op\":\"SCMP_CMP_MASKED_EQ\"}]},{\"names\":[\"clone3\"],\"action\":\"SCMP_ACT_ERRNO\",\"errnoRet\":38}]}"#;
const STORE: &str = r#"{"Type":"volume","Name":"lfs-test-borrowed","Destination":"/layerfs-store","RW":true,"Driver":"local"}"#;
const PNPM: &str = r#"{"Type":"volume","Name":"lfs-pnpm-store","Destination":"/pnpm-store","RW":false,"Driver":"local"}"#;

fn request(volumes: &[(&str, &str)]) -> SandboxRequest {
    SandboxRequest {
        image: IMAGE.into(),
        store_volume: "lfs-test-borrowed".into(),
        port: 30421,
        volumes: (volumes.iter())
            .map(|(volume, target)| ReadOnlyVolume {
                volume: (*volume).into(),
                target: (*target).into(),
            })
            .collect(),
    }
}
fn volume(name: &str) -> Vec<u8> {
    fixed(
        200,
        format!(r#"{{"Name":"{name}","Driver":"local","Scope":"local","Options":null}}"#)
            .as_bytes(),
    )
}
fn created() -> Vec<u8> {
    fixed(201, format!(r#"{{"Id":"{CID}","Warnings":[]}}"#).as_bytes())
}
fn logs(payload: &[u8]) -> Vec<u8> {
    let mut r = format!("HTTP/1.1 200 OK\r\nContent-Type: application/vnd.docker.multiplexed-stream\r\nContent-Length: {}\r\n\r\n", payload.len()).into_bytes();
    r.extend_from_slice(payload);
    r
}
/// The exact inspection the runtime accepts, with the given `Mounts` entries.
fn inspection(mounts: &[&str]) -> Vec<u8> {
    let mounts = mounts.join(",");
    fixed(200, format!(r#"{{"Id":"{CID}","Image":"{IMAGE}","State":{{"Running":true,"Paused":false,"Restarting":false,"Dead":false}},"Config":{{"User":"0:0","Tty":false,"Entrypoint":["/usr/local/bin/layerfs-daemon"],"Cmd":["--config","/layerfs-local/config/daemon.setup"]}},"HostConfig":{{"Privileged":false,"CapAdd":["CAP_SYS_ADMIN"],"Devices":[{{"PathOnHost":"/dev/fuse","PathInContainer":"/dev/fuse","CgroupPermissions":"rwm"}}],"SecurityOpt":["no-new-privileges=true","apparmor=unconfined","{SECCOMP}"],"RestartPolicy":{{"Name":"no"}},"LogConfig":{{"Type":"json-file"}}}},"Mounts":[{mounts}],"NetworkSettings":{{"Ports":{{"30421/tcp":[{{"HostIp":"127.0.0.1","HostPort":"54321"}}]}}}}}}"#).as_bytes())
}
/// Creates, uploads, starts and inspects one Sandbox with `volumes`; returns
/// whether the inspection accepted `mounts` and every Engine request.
fn inspect(volumes: &[(&str, &str)], mounts: &[&str], label: &str) -> (bool, Vec<Vec<u8>>) {
    let mut responses = vec![volume("lfs-test-borrowed")];
    responses.extend(volumes.iter().map(|(name, _)| volume(name)));
    responses.extend([
        created(),
        fixed(200, b""),
        fixed(204, b""),
        logs(&frame(1, b"LAYERFS_DAEMON_LISTEN 0.0.0.0:30421\n")),
        inspection(mounts),
    ]);
    let (docker, peer) = Peer::new(responses, 8192);
    let mut sandbox = docker.create_sandbox(request(volumes)).unwrap();
    let path = std::env::temp_dir().join(format!("lfs-ro-volume-{label}-{}", std::process::id()));
    File::create(&path)
        .unwrap()
        .write_all(&[0x5a; 4096])
        .unwrap();
    sandbox
        .upload(&mut File::open(&path).unwrap(), b"private")
        .unwrap();
    sandbox.start().unwrap();
    sandbox.wait_listener(Duration::from_secs(2)).unwrap();
    let accepted = sandbox.endpoint().is_ok();
    fs::remove_file(path).unwrap();
    (accepted, peer.finish())
}

#[test]
fn a_read_only_volume_is_checked_once_mounted_read_only_and_inspected_in_any_order() {
    let volumes = [("lfs-pnpm-store", "/pnpm-store")];
    let (accepted, requests) = inspect(&volumes, &[PNPM, STORE], "accept");
    assert!(
        accepted,
        "both mounts, in either order, are the requested topology"
    );
    let text: Vec<String> = requests
        .iter()
        .map(|r| String::from_utf8_lossy(r).into_owned())
        .collect();
    assert!(
        text[0].starts_with("GET /v1.54/volumes/lfs-test-borrowed "),
        "{}",
        text[0]
    );
    assert!(
        text[1].starts_with("GET /v1.54/volumes/lfs-pnpm-store "),
        "{}",
        text[1]
    );
    assert!(
        text[2].starts_with("POST /v1.54/containers/create"),
        "{}",
        text[2]
    );
    assert!(text[2].contains(r#""Mounts":[{"Type":"volume","Source":"lfs-test-borrowed","Target":"/layerfs-store","ReadOnly":false,"VolumeOptions":{"NoCopy":true}},{"Type":"volume","Source":"lfs-pnpm-store","Target":"/pnpm-store","ReadOnly":true,"VolumeOptions":{"NoCopy":true}}]"#), "{}", text[2]);
    // a request without volumes still creates exactly the one Store mount
    let (accepted, requests) = inspect(&[], &[STORE], "none");
    assert!(accepted);
    assert!(String::from_utf8_lossy(&requests[1]).contains(r#""Mounts":[{"Type":"volume","Source":"lfs-test-borrowed","Target":"/layerfs-store","ReadOnly":false,"VolumeOptions":{"NoCopy":true}}],"#));
}

#[test]
fn a_writable_missing_repeated_or_unrequested_mount_is_a_topology_mismatch() {
    let volumes = [("lfs-pnpm-store", "/pnpm-store")];
    let writable = PNPM.replace(r#""RW":false"#, r#""RW":true"#);
    let elsewhere = PNPM.replace("/pnpm-store", "/srv/pnpm-store");
    let store_read_only = STORE.replace(r#""RW":true"#, r#""RW":false"#);
    for (label, mounts) in [
        ("writable", vec![STORE, writable.as_str()]),
        ("missing", vec![STORE]),
        ("repeated", vec![STORE, PNPM, PNPM]),
        ("elsewhere", vec![STORE, elsewhere.as_str()]),
        ("store-ro", vec![store_read_only.as_str(), PNPM]),
    ] {
        assert!(!inspect(&volumes, &mounts, label).0, "{label}");
    }
    // a mount nobody requested is refused too
    assert!(!inspect(&[], &[STORE, PNPM], "unrequested").0);
}

#[test]
fn bad_names_and_targets_are_refused_before_any_engine_request() {
    let long = format!("/{}", "a".repeat(128));
    for (volume, target) in [
        ("lfs-pnpm-store", "/"),
        ("lfs-pnpm-store", "pnpm-store"),
        ("lfs-pnpm-store", "/pnpm-store/"),
        ("lfs-pnpm-store", "/a/../pnpm-store"),
        ("lfs-pnpm-store", "/a//b"),
        ("lfs-pnpm-store", "/workspaces"),
        ("lfs-pnpm-store", "/workspaces/main/node_modules"),
        ("lfs-pnpm-store", "/layerfs-store/pnpm"),
        ("lfs-pnpm-store", "/layerfs-local"),
        ("lfs-pnpm-store", "/proc/x"),
        ("lfs-pnpm-store", "/sys"),
        ("lfs-pnpm-store", "/dev/shm"),
        ("lfs-pnpm-store", "/tmp/pnpm"),
        ("lfs-pnpm-store", long.as_str()),
        ("lfs-test-borrowed", "/pnpm-store"),
        ("-pnpm", "/pnpm-store"),
        ("pnpm/store", "/pnpm-store"),
        ("", "/pnpm-store"),
    ] {
        let (docker, peer) = Peer::new(vec![], 7);
        let f = docker
            .create_sandbox(request(&[(volume, target)]))
            .unwrap_err();
        assert_eq!(f.phase, CreatePhase::Validate, "{volume} {target}");
        assert!(matches!(f.transfer.cause, RuntimeError::Protocol(_)));
        assert!(peer.finish().is_empty(), "{volume} {target}");
    }
    let (docker, peer) = Peer::new(vec![], 7);
    let f = docker
        .create_sandbox(request(&[("lfs-a", "/store"), ("lfs-b", "/store")]))
        .unwrap_err();
    assert_eq!(f.phase, CreatePhase::Validate);
    assert!(peer.finish().is_empty());
    // a target that only shares a prefix with a refused tree is allowed
    let beside = PNPM.replace("/pnpm-store", "/tmpstore");
    assert!(
        inspect(
            &[("lfs-pnpm-store", "/tmpstore")],
            &[STORE, &beside],
            "prefix"
        )
        .0
    );
}

#[test]
fn a_missing_read_only_volume_stops_before_the_container_is_created() {
    let (docker, peer) = Peer::new(
        vec![
            volume("lfs-test-borrowed"),
            fixed(404, br#"{"message":"no such volume"}"#),
        ],
        7,
    );
    let f = docker
        .create_sandbox(request(&[("lfs-pnpm-store", "/pnpm-store")]))
        .unwrap_err();
    assert_eq!(f.phase, CreatePhase::Volume);
    assert!(matches!(f.transfer.cause, RuntimeError::Http(404)));
    assert_eq!(
        peer.finish().len(),
        2,
        "no create after the failed volume read"
    );
}
