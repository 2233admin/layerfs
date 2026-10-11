//! Cooperative Store admission precedes one public transaction attempt.
mod support;
use layerfs_content::{FinalizedObject, ObjectRole};
use layerfs_history::HistoryCatalogConfig;
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile};
use layerfs_storage::{location::PackInfo, port::*, Storage, StoragePolicy};
#[cfg(target_os = "linux")]
use std::{
    io::{Read, Write},
    os::unix::net::{UnixListener, UnixStream},
    process::{Child, Command, Stdio},
    time::Instant,
};
use std::{path::Path, sync::mpsc, time::Duration};

fn authority() -> HistoryCatalogConfig {
    HistoryCatalogConfig {
        binding_key: b"writer-admission".to_vec(),
        cursor_key: [71; 32],
        incarnation: 1,
    }
}
fn config(path: &Path) -> PersistenceConfig {
    PersistenceConfig::sqlite(path).with_sqlite_profile(SqlitePersistenceProfile::Disposable)
}
fn create(path: &Path) -> Handles {
    Handles::create(config(path), StoragePolicy::frozen_default(), &authority()).unwrap()
}
#[cfg(target_os = "linux")]
fn open(path: &Path) -> Handles {
    Handles::open_writable(
        config(path),
        &authority().binding_key,
        authority().cursor_key,
    )
    .unwrap()
}
fn reserve() -> Reserve {
    Reserve {
        packs: 1,
        ordinals: 1,
    }
}

struct HeldPlan {
    entered: mpsc::Sender<()>,
    release: mpsc::Receiver<()>,
}
impl PackReadPlan for HeldPlan {
    fn select(&mut self, _: PackInfo, _: &[u8]) -> Result<PackReadChoice, PersistenceError> {
        self.entered
            .send(())
            .map_err(|e| PersistenceError::Refused {
                status: e.to_string(),
            })?;
        self.release
            .recv_timeout(Duration::from_secs(3))
            .map_err(|e| PersistenceError::Refused {
                status: e.to_string(),
            })?;
        Ok(PackReadChoice::Whole)
    }
}

#[test]
fn shared_session_reservation_waits_for_an_ordinary_public_read_owner() {
    let temp = support::Temp::new("writer-admission-local");
    let handles = create(&temp.join("store.sqlite"));
    let storage = Storage::new(handles.storage.clone()).unwrap();
    let object = FinalizedObject::new(
        ObjectRole::FileState,
        layerfs_content::object::codec::encode_bytes_object(&vec![47; 32000]).unwrap(),
    )
    .unwrap();
    let save = storage.begin_save().unwrap();
    save.accept(object.clone()).unwrap();
    save.finish().unwrap();
    let mut locations = Vec::new();
    handles
        .storage
        .locate(&[object.id()], &mut locations)
        .unwrap();
    let id = locations[0].pack.pack_id;
    let before = handles.diagnostics().unwrap();
    let (entered_tx, entered_rx) = mpsc::channel();
    let (release_tx, release_rx) = mpsc::channel();
    let reader = {
        let provider = handles.storage.clone();
        std::thread::spawn(move || {
            provider
                .read_pack_selection(
                    id,
                    &mut HeldPlan {
                        entered: entered_tx,
                        release: release_rx,
                    },
                )
                .map(|_| ())
        })
    };
    entered_rx.recv_timeout(Duration::from_secs(2)).unwrap();
    let (ready_tx, ready_rx) = mpsc::channel();
    let (result_tx, result_rx) = mpsc::channel();
    let writer = {
        let provider = handles.storage.clone();
        std::thread::spawn(move || {
            ready_tx.send(()).unwrap();
            result_tx.send(provider.reserve(reserve())).unwrap();
        })
    };
    ready_rx.recv_timeout(Duration::from_secs(2)).unwrap();
    let premature = result_rx.recv_timeout(Duration::from_millis(100)).ok();
    let _ = release_tx.send(());
    let outcome = premature
        .clone()
        .unwrap_or_else(|| result_rx.recv_timeout(Duration::from_secs(3)).unwrap());
    assert!(reader.join().unwrap().is_ok());
    writer.join().unwrap();
    assert!(
        premature.is_none(),
        "own Session contention returned before admission: {premature:?}"
    );
    assert!(
        outcome.is_ok(),
        "one admitted reservation failed: {outcome:?}"
    );
    let after = handles.diagnostics().unwrap();
    assert_eq!(after.write_transactions - before.write_transactions, 1);
    assert_eq!(after.write_commits - before.write_commits, 1);
    assert_eq!(after.rollbacks, before.rollbacks);
}

#[cfg(target_os = "linux")]
struct Held {
    child: Child,
    socket: UnixStream,
}
#[cfg(target_os = "linux")]
impl Held {
    fn start(path: &Path, socket_path: &Path) -> Self {
        let listener = UnixListener::bind(socket_path).unwrap();
        listener.set_nonblocking(true).unwrap();
        // The pinned Linux proof image supplies Python; its socket deadline releases
        // this independently opened real kernel owner if the controller fails.
        let body = "import os,socket,fcntl\nf=os.open(os.path.dirname(os.environ['LAYERFS_ADMISSION_LOCK_CHILD']) or '.',os.O_RDONLY|os.O_DIRECTORY)\nfcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)\ns=socket.socket(socket.AF_UNIX)\ns.settimeout(3)\ns.connect(os.environ['LAYERFS_ADMISSION_LOCK_SOCKET'])\ns.sendall(b'L')\ntry:\n assert s.recv(1)==b'R'\nfinally:\n fcntl.flock(f,fcntl.LOCK_UN)\n os.close(f)\n";
        let mut child = Command::new("python3")
            .args(["-c", body])
            .env("LAYERFS_ADMISSION_LOCK_CHILD", path)
            .env("LAYERFS_ADMISSION_LOCK_SOCKET", socket_path)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .spawn()
            .unwrap();
        let deadline = Instant::now() + Duration::from_secs(3);
        let socket = loop {
            match listener.accept() {
                Ok((socket, _)) => break socket,
                Err(error)
                    if error.kind() == std::io::ErrorKind::WouldBlock
                        && Instant::now() < deadline =>
                {
                    std::thread::yield_now()
                }
                Err(error) => {
                    let _ = child.kill();
                    let _ = child.wait();
                    panic!("child readiness: {error}");
                }
            }
        };
        let mut held = Self { child, socket };
        held.socket
            .set_read_timeout(Some(Duration::from_secs(3)))
            .unwrap();
        held.socket
            .set_write_timeout(Some(Duration::from_secs(3)))
            .unwrap();
        let mut ready = [0];
        held.socket.read_exact(&mut ready).unwrap();
        assert_eq!(ready, *b"L");
        held
    }
    fn release(mut self) {
        self.socket.write_all(b"R").unwrap();
        let deadline = Instant::now() + Duration::from_secs(3);
        loop {
            if let Some(status) = self.child.try_wait().unwrap() {
                assert!(status.success());
                break;
            }
            assert!(Instant::now() < deadline, "child exit deadline");
            std::thread::yield_now();
        }
    }
}
#[cfg(target_os = "linux")]
impl Drop for Held {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

#[test]
#[cfg(target_os = "linux")]
fn another_process_admission_precedes_the_single_sqlite_begin() {
    // Keep the owned AF_UNIX path below Darwin's sockaddr_un capacity.
    let temp = support::Temp::new("wa");
    let path = temp.join("store.sqlite");
    let original = create(&path);
    let handles = open(&path);
    let before = handles.diagnostics().unwrap();
    let held = Held::start(&path, &temp.join("s"));
    let (ready_tx, ready_rx) = mpsc::channel();
    let (result_tx, result_rx) = mpsc::channel();
    let writer = {
        let provider = handles.storage.clone();
        std::thread::spawn(move || {
            ready_tx.send(()).unwrap();
            result_tx.send(provider.reserve(reserve())).unwrap();
        })
    };
    ready_rx.recv_timeout(Duration::from_secs(2)).unwrap();
    let premature = result_rx.recv_timeout(Duration::from_millis(100)).ok();
    held.release();
    let outcome = premature
        .clone()
        .unwrap_or_else(|| result_rx.recv_timeout(Duration::from_secs(3)).unwrap());
    writer.join().unwrap();
    assert!(
        premature.is_none(),
        "public reservation ignored the cooperative writer owner: {premature:?}"
    );
    assert!(
        outcome.is_ok(),
        "one admitted reservation failed: {outcome:?}"
    );
    let after = handles.diagnostics().unwrap();
    assert_eq!(after.write_transactions - before.write_transactions, 1);
    assert_eq!(after.write_commits - before.write_commits, 1);
    assert_eq!(after.rollbacks, before.rollbacks);
    drop(original);
}

#[test]
#[cfg(target_os = "linux")]
fn two_opened_handles_admit_eight_distinct_reservations_without_conflict() {
    let temp = support::Temp::new("writer-admission-two-handles");
    let path = temp.join("store.sqlite");
    let first = create(&path);
    let second = open(&path);
    let providers = [first.storage.clone(), second.storage.clone()];
    let (ready_tx, ready_rx) = mpsc::channel();
    let mut starts = Vec::new();
    let mut jobs = Vec::new();
    for index in 0..8 {
        let provider = providers[index % 2].clone();
        let ready = ready_tx.clone();
        let (start_tx, start_rx) = mpsc::channel();
        starts.push(start_tx);
        jobs.push(std::thread::spawn(move || {
            ready.send(()).unwrap();
            start_rx.recv_timeout(Duration::from_secs(3)).unwrap();
            provider.reserve(reserve())
        }));
    }
    for _ in 0..8 {
        ready_rx.recv_timeout(Duration::from_secs(2)).unwrap();
    }
    for start in starts {
        start.send(()).unwrap();
    }
    let results = jobs
        .into_iter()
        .map(|job| job.join().unwrap())
        .collect::<Vec<_>>();
    assert!(
        results.iter().all(Result::is_ok),
        "own writer admission refused a peer: {results:?}"
    );
    let mut packs = results
        .iter()
        .map(|r| r.as_ref().unwrap().first_pack_id)
        .collect::<Vec<_>>();
    let mut ordinals = results
        .iter()
        .map(|r| r.as_ref().unwrap().first_ordinal)
        .collect::<Vec<_>>();
    packs.sort_unstable();
    packs.dedup();
    ordinals.sort_unstable();
    ordinals.dedup();
    assert_eq!(packs.len(), 8);
    assert_eq!(ordinals.len(), 8);
    // Neither open changed the required SQLite busy handler/profile.
    assert_eq!(first.profile().busy_timeout, 0);
    assert_eq!(second.profile().busy_timeout, 0);
}
