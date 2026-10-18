//! #355: the two-stage merge at Commit. A Workspace Commit merges with the
//! head it reads before the publication lane; when another Commit lands
//! before it takes the lane, only what that Commit changed is merged into
//! the result, in memory, inside the lane. More than the lane's bound is
//! refused `LaneMerge`; a conflict there follows the ordinary conflict rules.
//!
//! The Commit under test runs over a Store whose history wrapper holds its
//! first `publish_lane` call until the test has landed the other Commit, at
//! the public catalog boundary. Every wait is bounded.
#[path = "../../layerfs-store-service/tests/support/installed_store.rs"]
#[allow(dead_code)]
mod installed;
#[path = "../../layerfs-store-service/tests/support/sdk.rs"]
#[allow(dead_code)]
mod support;

use layerfs_bridge::control::{CommitControl, Reply, Request, SdkValue, UnmountControl};
use layerfs_content::filesystem::PathName;
use layerfs_daemon::control::Service;
use layerfs_daemon::store::{ReaderFactory, Store, StoreReader};
use layerfs_history::records::*;
use layerfs_history::*;
use layerfs_persistence::Handles;
use layerfs_storage::{ReservationBlocks, Storage};
use layerfs_workspace::{Operation, Outcome, Position, Time};
use std::sync::{Arc, Condvar, Mutex};
use std::time::{Duration, Instant};
use std::{fs, thread};

const LANE: &str = "lane";
/// How long a held Commit waits for the test before going on by itself.
const LIMIT: Duration = Duration::from_secs(30);

#[derive(Default)]
struct State {
    armed: bool,
    entered: bool,
    released: bool,
}

/// Holds the first `publish_lane` call until released.
#[derive(Default)]
struct Gate {
    state: Mutex<State>,
    changed: Condvar,
}

impl Gate {
    fn wait(&self, done: impl Fn(&State) -> bool) -> bool {
        let deadline = Instant::now() + LIMIT;
        let mut state = self.state.lock().unwrap();
        while !done(&state) {
            let remaining = deadline.saturating_duration_since(Instant::now());
            if remaining.is_zero() {
                return false;
            }
            state = self.changed.wait_timeout(state, remaining).unwrap().0;
        }
        true
    }
    fn hold(&self) {
        let armed = std::mem::take(&mut self.state.lock().unwrap().armed);
        if armed {
            self.state.lock().unwrap().entered = true;
            self.changed.notify_all();
            self.wait(|state| state.released);
        }
    }
    fn arm(&self) {
        self.state.lock().unwrap().armed = true;
    }
    fn release(&self) {
        self.state.lock().unwrap().released = true;
        self.changed.notify_all();
    }
}

struct Gated {
    handles: Arc<Handles>,
    gate: Arc<Gate>,
}

macro_rules! forward {
    ($($name:ident($($arg:ident: $ty:ty),*) -> $out:ty;)*) => {$(
        fn $name(&self, $($arg: $ty),*) -> $out { self.handles.history.$name($($arg),*) }
    )*};
}

impl HistoryCatalog for Gated {
    forward! {
        catalog_id() -> CatalogId;
        incarnation() -> u64;
        layer_stack(id: LayerStackId) -> HistoryResult<Option<LayerStackRecord>>;
        layer_stacks(page: &Page) -> HistoryResult<PageResult<LayerStackRecord>>;
        layer_stack_named(name: &HistoryName) -> HistoryResult<Option<LayerStackRecord>>;
        branch(id: BranchId) -> HistoryResult<Option<BranchRecord>>;
        branch_named(stack: LayerStackId, name: &HistoryName) -> HistoryResult<Option<BranchRecord>>;
        branch_snapshot(id: BranchId) -> HistoryResult<Option<BranchSnapshot>>;
        branches(stack: LayerStackId, page: &Page) -> HistoryResult<PageResult<BranchRecord>>;
        commit(id: CommitId) -> HistoryResult<Option<CommitRecord>>;
        layer(id: LayerId) -> HistoryResult<Option<LayerRecord>>;
        commit_history(request: &CommitHistoryRequest) -> HistoryResult<PageResult<CommitRecord>>;
        layer_history(request: &LayerHistoryRequest) -> HistoryResult<PageResult<LayerRecord>>;
        merge_base(left: NodeId, right: NodeId) -> HistoryResult<Option<NodeId>>;
        is_ancestor(ancestor: NodeId, descendant: NodeId) -> HistoryResult<bool>;
        overwritten(layer: LayerId, position: u64, limit: u16) -> HistoryResult<Vec<LayerId>>;
        statistics() -> HistoryResult<StoreStatistics>;
        record_init(totals: &InitStatistics) -> HistoryResult<()>;
        record_bindings(rows: &[BindingHint]) -> HistoryResult<()>;
        bindings_of(child: u64) -> HistoryResult<Vec<BindingHint>>;
        initialize_layerstack(request: &StackInitialization) -> HistoryResult<LayerStackRecord>;
        fork(request: &ForkRequest) -> HistoryResult<BranchSnapshot>;
        commit_branch(request: &CommitRequest) -> HistoryResult<CommitOutcome>;
        add_layer(request: &AddLayerRequest) -> HistoryResult<AddLayerOutcome>;
        merge_branch(request: &BranchMergeRequest) -> HistoryResult<BranchSnapshot>;
        reserve_inodes(request: &ReserveRequest) -> HistoryResult<Reservation>;
    }
    fn publish_lane(&self) -> HistoryResult<PublishLane> {
        self.gate.hold();
        self.handles.history.publish_lane()
    }
}

/// SDK calls on the installed Store, and a daemon `Service` over a second
/// Store on the same file whose lane is gated.
struct Fixture {
    sdk: support::Fixture,
    service: Service,
    store: Arc<Store>,
    handles: Arc<Handles>,
    gate: Arc<Gate>,
}

fn fixture(label: &str) -> Fixture {
    let sdk = support::Fixture::new(label, |source| {
        fs::write(source.join("seed.txt"), b"seed\n").unwrap();
        1
    });
    sdk.fork(LANE);
    let config = sdk.host.config.clone();
    let handles = Arc::new(
        Handles::open_writable(config.clone(), installed::BINDING, installed::CURSOR).unwrap(),
    );
    let factory: ReaderFactory = Arc::new(move |_| {
        let read = Handles::open_read_only(config.clone(), installed::BINDING, installed::CURSOR)?;
        Ok(StoreReader::new(
            Storage::new(read.storage)?,
            Arc::new(read.history),
        ))
    });
    let control = factory(0).unwrap();
    let gate = Arc::new(Gate::default());
    let history = Gated {
        handles: handles.clone(),
        gate: gate.clone(),
    };
    let store = Arc::new(
        Store::new(
            handles.storage.clone(),
            Arc::new(history),
            control,
            factory,
            2 * 1024 * 1024,
            ReservationBlocks::default(),
            16,
        )
        .unwrap()
        .with_merge_scratch(handles.storage.merge_scratch()),
    );
    let service = Service::new(store.clone(), &sdk.owner);
    Fixture {
        sdk,
        service,
        store,
        handles,
        gate,
    }
}

/// Mounts a Workspace on the lane and writes `/name`, without committing.
fn mounted_write(
    fixture: &Fixture,
    id: u8,
    name: &str,
    bytes: &[u8],
) -> layerfs_bridge::control::WorkspaceToken {
    let bound = fixture
        .service
        .execute_control(&Request::Mount {
            workspace: WorkspaceId::from_authority([id; 32]).unwrap(),
            branch: BranchId::named(
                LayerStackId::from_authority([23; 16]),
                &HistoryName::new(LANE).unwrap(),
            ),
        })
        .unwrap();
    let Reply::Bound { token, .. } = bound.reply else {
        panic!("binding: {:?}", bound.reply);
    };
    let operation = fixture.service.operation(token).unwrap();
    let route = operation.workspace().route();
    let source = operation
        .overlay()
        .acquire_base_source(route, 9000 + u64::from(id))
        .unwrap();
    let view = operation.workspace().view_for_source(source).unwrap();
    let now = Time {
        seconds: 123,
        nanoseconds: 0,
    };
    let apply = |op| {
        let outcome = operation
            .workspace()
            .mutate(operation.overlay(), operation.ports(), &view, op, now)
            .unwrap();
        match outcome {
            Outcome::Applied { publication, stat } => {
                operation.overlay().reply_attempted(publication).unwrap();
                stat
            }
            Outcome::Unchanged { stat } => stat,
        }
    };
    let parent = view.root_serial();
    let name = PathName::new(name).unwrap();
    let serial = match view.lookup(operation.overlay(), parent, &name) {
        Ok(found) => found.serial,
        Err(_) => {
            apply(Operation::Create {
                parent,
                name,
                mode: 0o644,
            })
            .expect("created inode")
            .serial
        }
    };
    apply(Operation::SetAttributes {
        serial,
        mode: None,
        mtime: None,
        size: Some(0),
    });
    apply(Operation::Write {
        serial,
        position: Position::At(0),
        data: bytes.to_vec().into(),
    });
    drop(view);
    operation
        .overlay()
        .release_base_source(route, source)
        .unwrap();
    token
}

fn write(fixture: &Fixture, path: &str, text: &str) {
    fixture.sdk.call(
        "fs.write",
        vec![
            ("branch", SdkValue::text(LANE)),
            ("path", SdkValue::text(path)),
            ("content", SdkValue::text(text)),
        ],
    );
}

fn read(fixture: &Fixture, path: &str) -> Option<String> {
    fixture
        .sdk
        .try_call(
            "fs.read",
            vec![
                ("branch", SdkValue::text(LANE)),
                ("path", SdkValue::text(path)),
            ],
        )
        .ok()
        .and_then(|value| value.get_text("text").map(str::to_owned))
}

/// What the held Commit did once released: its reply, wall time from the
/// release, and the writer session's statements over that time.
struct Held {
    reply: Result<Reply, String>,
    ms: f64,
    statements: u64,
}

/// Commits `token` with its lane held, runs `land` while it is held, then
/// releases it.
fn commit_held(
    fixture: &Fixture,
    token: layerfs_bridge::control::WorkspaceToken,
    land: impl FnOnce(),
) -> Held {
    fixture.gate.arm();
    let held = thread::scope(|scope| {
        let worker = scope.spawn(|| {
            fixture
                .service
                .execute_control(&Request::Commit(CommitControl {
                    token,
                    force: false,
                    message: None,
                }))
                .map(|done| done.reply)
                .map_err(|failure| format!("{failure:?}"))
        });
        assert!(
            fixture.gate.wait(|state| state.entered),
            "the Commit reached the lane"
        );
        land();
        let before = fixture.handles.diagnostics().unwrap().statements;
        let start = Instant::now();
        fixture.gate.release();
        let reply = worker.join().unwrap();
        Held {
            reply,
            ms: start.elapsed().as_secs_f64() * 1000.0,
            statements: fixture.handles.diagnostics().unwrap().statements - before,
        }
    });
    fixture
        .service
        .execute_control(&Request::Unmount(UnmountControl {
            token,
            discard: true,
        }))
        .unwrap();
    held
}

/// An uncontended Commit of the same shape, for the lane hold beside it.
fn commit_plain(fixture: &Fixture, token: layerfs_bridge::control::WorkspaceToken) -> Held {
    let before = fixture.handles.diagnostics().unwrap().statements;
    let start = Instant::now();
    let reply = fixture
        .service
        .execute_control(&Request::Commit(CommitControl {
            token,
            force: false,
            message: None,
        }))
        .map(|done| done.reply)
        .map_err(|failure| format!("{failure:?}"));
    let held = Held {
        reply,
        ms: start.elapsed().as_secs_f64() * 1000.0,
        statements: fixture.handles.diagnostics().unwrap().statements - before,
    };
    fixture
        .service
        .execute_control(&Request::Unmount(UnmountControl {
            token,
            discard: true,
        }))
        .unwrap();
    held
}

fn published(reply: &Result<Reply, String>) -> bool {
    matches!(reply, Ok(Reply::Committed(_) | Reply::MergeCommitted(_)))
}

#[test]
fn a_commit_landing_before_the_lane_is_merged_in_the_lane() {
    let fixture = fixture("lane-merge-one");
    let plain = mounted_write(&fixture, 80, "plain.txt", b"plain\n");
    let plain = commit_plain(&fixture, plain);
    assert!(published(&plain.reply), "{:?}", plain.reply);
    let token = mounted_write(&fixture, 81, "a.txt", b"a\n");
    // The head moves before the Commit reads it: the first stage merges.
    write(&fixture, "/c.txt", "c\n");
    let before = fixture.store.save_counters().merge;
    let held = commit_held(&fixture, token, || write(&fixture, "/b.txt", "b\n"));
    assert!(published(&held.reply), "{:?}", held.reply);
    let after = fixture.store.save_counters().merge;
    assert_eq!(after.lane_steps - before.lane_steps, 1);
    assert_eq!(after.lane_refused, before.lane_refused);
    let paths = after.lane_paths - before.lane_paths;
    assert!((1..=4).contains(&paths), "{after:?}");
    for (path, text) in [("/a.txt", "a\n"), ("/b.txt", "b\n"), ("/c.txt", "c\n")] {
        assert_eq!(read(&fixture, path).as_deref(), Some(text), "{path}");
    }
    println!(
        "LANE_MERGE uncontended_ms={:.1} uncontended_statements={} moved_head_ms={:.1} \
         moved_head_statements={} lane_paths={paths} samples=1",
        plain.ms, plain.statements, held.ms, held.statements
    );
    fixture.sdk.cleanup();
}

#[test]
fn a_conflict_landing_before_the_lane_follows_the_conflict_rules() {
    let fixture = fixture("lane-merge-conflict");
    let token = mounted_write(&fixture, 82, "seed.txt", b"workspace\n");
    let held = commit_held(&fixture, token, || write(&fixture, "/seed.txt", "head\n"));
    assert!(
        matches!(held.reply, Ok(Reply::Conflict(_))),
        "{:?}",
        held.reply
    );
    assert_eq!(fixture.store.save_counters().merge.lane_steps, 1);
    assert_eq!(read(&fixture, "/seed.txt").as_deref(), Some("head\n"));
    fixture.sdk.cleanup();
}

#[test]
fn more_than_the_lane_bound_is_refused_and_counted() {
    let fixture = fixture("lane-merge-refused");
    let token = mounted_write(&fixture, 83, "a.txt", b"a\n");
    let many = layerfs_daemon::store::LANE_MERGE_PATHS + 1;
    let held = commit_held(&fixture, token, || {
        let changes = (0..many)
            .map(|n| support::write(&format!("/many{n:05}"), "x\n"))
            .collect();
        fixture.sdk.apply(LANE, changes);
    });
    let refusal = held.reply.expect_err("refused in the lane");
    assert!(refusal.contains("LaneMerge"), "{refusal}");
    let counters = fixture.store.save_counters().merge;
    assert_eq!((counters.lane_steps, counters.lane_refused), (0, 1));
    assert_eq!(read(&fixture, "/a.txt"), None, "nothing was published");
    assert_eq!(read(&fixture, "/many00000").as_deref(), Some("x\n"));
    fixture.sdk.cleanup();
}
