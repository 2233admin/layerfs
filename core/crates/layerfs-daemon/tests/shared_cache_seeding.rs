//! What a Commit leaves in the daemon's shared object cache.
//!
//! A Commit stages the namespace objects it constructs and places them in
//! the shared cache only once History has answered its publication. These
//! proofs count, against the real Store port: that a new Workspace bound to
//! the published head asks the Store for no object and no length to look up,
//! stat, list or read the link of anything the Commit wrote, and for exactly
//! the payload of a file it reads; that a Commit whose publication is refused
//! or unknown seeds nothing; and that seeded entries are evicted and fetched
//! again like any other, with every byte the same.
//!
//! The objects of each root are recorded independently, straight from the
//! Store port through a client of the test's own. Counts only; nothing is
//! timed. Real Disposable Store, real owner, no mount, no thread. A wrapped
//! History catalog is external orchestration at a public port.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[allow(dead_code)]
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/shared_cache_rig.rs"]
mod rig;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::evidence;
use layerfs_content::{AuthenticatedObjects, ObjectId};
use layerfs_daemon::store::{BoundWorkspace, CommitError, CommitPhase, StoreWork};
use layerfs_history::*;
use layerfs_persistence::Handles;
use layerfs_workspace::ClientWork;
use rig::{apply, commit, pattern, read, visit, Daemon, Do, Tree};
use std::{
    collections::BTreeSet,
    fs,
    path::Path,
    sync::{
        atomic::{AtomicU8, Ordering},
        Arc,
    },
};

/// Objects of a new root that a Commit of [`changes`] reads back from the
/// Store before publishing it.
const READ_BACK: u64 = 7;
/// Large enough that nothing is evicted.
const CACHE: usize = 64 * 1024 * 1024;

fn tree(source: &Path) {
    for module in 0..6 {
        let directory = source.join(format!("src/m-{module}"));
        fs::create_dir_all(&directory).unwrap();
        for file in 0..12 {
            fs::write(
                directory.join(format!("f-{file:02}")),
                pattern((module * 12 + file) as u32, 700 + 40 * file),
            )
            .unwrap();
        }
    }
    fs::create_dir(source.join("keep")).unwrap();
    for name in ["a", "b", "c", "d", "e"] {
        fs::write(
            source.join("keep").join(name),
            pattern(900 + name.as_bytes()[0] as u32, 900),
        )
        .unwrap();
    }
}

/// The files a Commit of [`changes`] creates, with their bytes.
fn created() -> [(&'static str, Vec<u8>); 3] {
    [
        ("made/one", pattern(40_001, 1_500)),
        ("made/two", pattern(40_002, 2_500)),
        ("made/deep/leaf", pattern(40_003, 800)),
    ]
}
/// A directory, files, a symbolic link, a hard link, a mode, a time, a
/// rename across directories and a removal. No existing file's content
/// changes, so the Commit reads no payload.
fn changes(workspace: &BoundWorkspace, clock: &mut i64) {
    let files = created();
    for step in [
        Do::Mkdir("made", 0o755),
        Do::Mkdir("made/deep", 0o755),
        Do::Create(files[0].0, 0o644),
        Do::Write(files[0].0, 0, &files[0].1),
        Do::Create(files[1].0, 0o600),
        Do::Write(files[1].0, 0, &files[1].1),
        Do::Create(files[2].0, 0o644),
        Do::Write(files[2].0, 0, &files[2].1),
        Do::Symlink("made/link", b"one"),
        Do::Link("keep/e", "made/hard"),
        Do::Chmod("keep/a", 0o600),
        Do::Utimens("keep/b", (1_700_000_123, 7)),
        Do::Rename("keep/c", "made/moved"),
        Do::Remove("keep/d"),
    ] {
        assert!(apply(workspace, clock, step), "{step:?}");
    }
}
/// Every path the Commit of [`changes`] wrote, and the directories above.
const WRITTEN: [&str; 12] = [
    "made",
    "made/deep",
    "made/one",
    "made/two",
    "made/deep/leaf",
    "made/link",
    "made/hard",
    "made/moved",
    "keep",
    "keep/a",
    "keep/b",
    "keep/e",
];

struct Seen(ClientWork, StoreWork);
fn seen(daemon: &Daemon) -> Seen {
    Seen(daemon.cache(), daemon.store.work())
}
/// (cache misses, Store object ids, Store length ids, seeded objects,
/// seeded bytes, authenticated bytes) between two observations.
fn between(before: &Seen, after: &Seen) -> [u64; 6] {
    [
        after.0.cache_misses - before.0.cache_misses,
        after.1.object_ids - before.1.object_ids,
        after.1.length_ids - before.1.length_ids,
        after.0.seeded_objects - before.0.seeded_objects,
        after.0.seeded_bytes - before.0.seeded_bytes,
        after.0.authenticated_bytes - before.0.authenticated_bytes,
    ]
}
/// Which of `ids` the shared cache holds now, asked with no Store behind.
fn resident(daemon: &Daemon, snapshot: &BranchSnapshot, ids: &[ObjectId]) -> BTreeSet<ObjectId> {
    let memory = daemon.store.ports(snapshot.scope).resident();
    ids.iter()
        .copied()
        .filter(|id| memory.read_canonical(*id).is_ok())
        .collect()
}
fn content_root(workspace: &BoundWorkspace, path: &str) -> ObjectId {
    ObjectId::from_bytes(&drive::content_root(workspace, path)).unwrap()
}

#[test]
fn a_new_workspace_reads_what_a_commit_wrote_without_the_store() {
    let tree = Tree::new("shared-cache-seeding", 1, tree);
    let branch = tree.branches[0];
    let daemon = tree.daemon(2, CACHE);
    let base = daemon.snapshot(branch);
    let tracker = daemon.tracker(&base);
    tracker.fresh(base.effective_root);
    let a = daemon.bind(branch, 1);
    // The whole base is resident before anything is counted.
    model::assert_same(&daemon.expected(&base), &drive::live(&a), "base");
    let mut clock = 1_800_000_000;
    changes(&a, &mut clock);

    let before = seen(&daemon);
    let root = commit(&a);
    let committed = between(&before, &seen(&daemon));
    let head = daemon.snapshot(branch);
    assert_eq!(head.effective_root, root);
    daemon.close(&a);
    drop(a);

    // A new Workspace on the published head.
    let before = seen(&daemon);
    let b = daemon.bind_numbered(branch, 7);
    assert_eq!(between(&before, &seen(&daemon)), [0; 6], "bind");
    let before = seen(&daemon);
    for path in WRITTEN {
        visit(&b, path);
    }
    let visited = between(&before, &seen(&daemon));
    evidence(format_args!(
        "SEEDING new Workspace: paths={} misses={} store_objects={} length_ids={}",
        WRITTEN.len(),
        visited[0],
        visited[1],
        visited[2]
    ));
    // No object. One length for each regular file whose content the Commit
    // constructed: the three created files.
    assert_eq!(visited, [0, 0, 3, 0, 0, 0]);
    // What the new root has that the base root has not, from the Store.
    let (_, fresh) = tracker.fresh(root);
    let payload: BTreeSet<_> = created()
        .iter()
        .map(|(path, _)| content_root(&b, path))
        .collect();
    assert_eq!(payload.len(), 3);
    let ids: Vec<_> = fresh.iter().map(|(id, _)| *id).collect();
    assert!(payload.iter().all(|id| ids.contains(id)));
    let namespace: Vec<_> = fresh
        .iter()
        .filter(|(id, _)| !payload.contains(id))
        .collect();
    let namespace_bytes: u64 = namespace.iter().map(|(_, length)| *length as u64).sum();
    evidence(format_args!(
        "SEEDING commit: fresh_objects={} namespace_objects={} namespace_bytes={namespace_bytes} misses={} store_objects={} seeded_objects={} seeded_bytes={} authenticated_bytes={}",
        fresh.len(),
        namespace.len(),
        committed[0],
        committed[1],
        committed[3],
        committed[4],
        committed[5],
    ));
    // The Commit read back its new root's top from the Store before
    // publishing it: the root, the inode table's root page, the root
    // directory's page and, because an entry was added to the root
    // directory, its attribute page and the three objects of its new mtime.
    assert_eq!([committed[0], committed[1]], [READ_BACK, READ_BACK]);
    // Every other new namespace object was placed without a Store read, and
    // nothing else was: no payload, nothing twice.
    assert_eq!(committed[3] + committed[0], namespace.len() as u64);
    assert_eq!(committed[4] + committed[5], namespace_bytes);
    let held = resident(&daemon, &head, &ids);
    assert_eq!(held.len(), namespace.len());
    assert!(payload.is_disjoint(&held));
    // Reading a created file asks the Store for its payload and no more.
    for (path, bytes) in created() {
        let before = seen(&daemon);
        assert_eq!(read(&b, path), bytes, "{path}");
        let asked = between(&before, &seen(&daemon));
        assert_eq!([asked[0], asked[1], asked[2], asked[3]], [1, 1, 0, 0]);
    }
    model::assert_same(&daemon.expected(&head), &drive::live(&b), "head");
    daemon.close(&b);
    drop(b);
    daemon.stop();
    tree.finish();
}

const PASS: u8 = 0;
const REFUSE: u8 = 1;
const LOSE: u8 = 2;
/// The real catalog, whose next publication the test can refuse before it
/// is attempted or answer as unknown after it happened.
struct Publication {
    handles: Arc<Handles>,
    next: Arc<AtomicU8>,
}
macro_rules! forward {
    ($($name:ident($($arg:ident: $ty:ty),*) -> $out:ty;)*) => {$(
        fn $name(&self, $($arg: $ty),*) -> $out { self.handles.history.$name($($arg),*) }
    )*};
}
impl HistoryCatalog for Publication {
    forward! {
        catalog_id() -> CatalogId;
        incarnation() -> u64;
        layer_stack(id: LayerStackId) -> HistoryResult<Option<LayerStackRecord>>;
        layer_stacks(page: &Page) -> HistoryResult<PageResult<LayerStackRecord>>;
        branch(id: BranchId) -> HistoryResult<Option<BranchRecord>>;
        branch_snapshot(id: BranchId) -> HistoryResult<Option<BranchSnapshot>>;
        branches(stack: LayerStackId, page: &Page) -> HistoryResult<PageResult<BranchRecord>>;
        commit(id: CommitId) -> HistoryResult<Option<CommitRecord>>;
        layer(id: LayerId) -> HistoryResult<Option<LayerRecord>>;
        stage(workspace: WorkspaceId) -> HistoryResult<Option<StageRecord>>;
        stages(branch: BranchId, page: &Page) -> HistoryResult<PageResult<StageRecord>>;
        commit_history(request: &CommitHistoryRequest) -> HistoryResult<PageResult<CommitRecord>>;
        layer_history(request: &LayerHistoryRequest) -> HistoryResult<PageResult<LayerRecord>>;
        initialize_layerstack(request: &StackInitialization) -> HistoryResult<LayerStackRecord>;
        fork(request: &ForkRequest) -> HistoryResult<BranchSnapshot>;
        stage_changes(request: &StageRequest) -> HistoryResult<StageRecord>;
        commit_staged(request: &CommitStagedRequest) -> HistoryResult<CommitStagedOutcome>;
        add_layer(request: &AddLayerRequest) -> HistoryResult<AddLayerOutcome>;
        discard_stage(request: &DiscardRequest) -> HistoryResult<DiscardOutcome>;
        reserve_inodes(request: &ReserveRequest) -> HistoryResult<Reservation>;
    }
    fn stage_and_commit(&self, request: &StageRequest) -> HistoryResult<CommitStagedOutcome> {
        match self.next.swap(PASS, Ordering::SeqCst) {
            REFUSE => Err(HistoryError::Busy),
            LOSE => {
                self.handles.history.stage_and_commit(request).unwrap();
                Err(HistoryError::UnknownOutcome)
            }
            _ => self.handles.history.stage_and_commit(request),
        }
    }
}

/// One Commit of [`changes`] whose publication answers `outcome`.
fn unpublished(label: &str, outcome: u8, expected: HistoryError) {
    let tree = Tree::new(label, 1, tree);
    let branch = tree.branches[0];
    let next = Arc::new(AtomicU8::new(PASS));
    let daemon = tree.daemon_over(2, CACHE, |handles| {
        Arc::new(Publication {
            handles,
            next: next.clone(),
        })
    });
    let base = daemon.snapshot(branch);
    let tracker = daemon.tracker(&base);
    tracker.fresh(base.effective_root);
    let a = daemon.bind(branch, 1);
    model::assert_same(&daemon.expected(&base), &drive::live(&a), "base");
    let mut clock = 1_800_000_000;
    changes(&a, &mut clock);

    next.store(outcome, Ordering::SeqCst);
    let before = seen(&daemon);
    let failure = a
        .commit_captured()
        .expect_err("publication must not be known");
    let failed = between(&before, &seen(&daemon));
    assert_eq!(failure.error_kind(), expected);
    assert_eq!(failure.phase, CommitPhase::Publish);
    assert!(failure.published.is_none());
    let candidate = failure.intent.as_ref().unwrap().candidate_root;
    let settled = failure.locally_settled;
    drop(failure);
    // The candidate's objects are saved: the Store answers them. In the
    // shared cache are exactly the ones the Commit itself read back from
    // the Store before publishing, each authenticated as a miss. Nothing
    // was seeded.
    let (_, fresh) = tracker.fresh(candidate);
    let ids: Vec<_> = fresh.iter().map(|(id, _)| *id).collect();
    let held = resident(&daemon, &base, &ids);
    evidence(format_args!(
        "SEEDING unpublished outcome={outcome} settled={settled}: fresh_objects={} resident={} misses={} store_objects={} seeded_objects={}",
        fresh.len(),
        held.len(),
        failed[0],
        failed[1],
        failed[3]
    ));
    assert_eq!([failed[3], failed[4]], [0, 0]);
    assert_eq!([failed[0], failed[1]], [READ_BACK, READ_BACK]);
    assert_eq!(held.len() as u64, READ_BACK);
    assert!(held.contains(&candidate));

    if settled {
        // A definite refusal keeps the Workspace's changes. Its next Commit
        // constructs the same root and seeds from its own staging.
        let before = seen(&daemon);
        let root = commit(&a);
        let committed = between(&before, &seen(&daemon));
        assert_eq!(root, candidate);
        let payload: BTreeSet<_> = created()
            .iter()
            .map(|(path, _)| content_root(&a, path))
            .collect();
        assert_eq!([committed[0], committed[1]], [0, 0]);
        assert_eq!(
            committed[3],
            (fresh.len() - payload.len()) as u64 - READ_BACK
        );
        let held = resident(&daemon, &base, &ids);
        assert_eq!(held.len(), fresh.len() - payload.len());
        assert!(payload.is_disjoint(&held));
        daemon.close(&a);
        drop(a);
        daemon.stop();
    } else {
        // Unknown custody stays with the Workspace; nothing is closed.
        drop(a);
        drop(daemon);
    }
    tree.finish();
}

trait Kind {
    fn error_kind(&self) -> HistoryError;
}
impl Kind for layerfs_daemon::store::CommitFailure {
    fn error_kind(&self) -> HistoryError {
        match &self.error {
            CommitError::History(error) => error.clone(),
            other => panic!("not a History failure: {other:?}"),
        }
    }
}

#[test]
fn a_refused_publication_seeds_nothing_and_the_next_commit_seeds_its_own() {
    unpublished("shared-cache-seed-refused", REFUSE, HistoryError::Busy);
}

#[test]
fn an_unknown_publication_seeds_nothing() {
    unpublished(
        "shared-cache-seed-unknown",
        LOSE,
        HistoryError::UnknownOutcome,
    );
}

/// Small enough that one Workspace's reading evicts what the other's Commit
/// placed. A Commit may place an eighth of it.
const SMALL: usize = 96 * 1024;

#[test]
fn seeded_entries_are_evicted_and_fetched_again_with_the_same_bytes() {
    let tree = Tree::new("shared-cache-seed-pressure", 2, tree);
    let daemon = tree.daemon(2, SMALL);
    let (a, b) = (
        daemon.bind(tree.branches[0], 1),
        daemon.bind(tree.branches[1], 2),
    );
    let mut clock = 1_800_000_000;
    changes(&a, &mut clock);
    let before = seen(&daemon);
    let root = commit(&a);
    let committed = between(&before, &seen(&daemon));
    let head = daemon.snapshot(tree.branches[0]);
    // The root was read back by the Commit; the staging bound kept the
    // latest objects, and each placed one is within the allowance.
    assert!(committed[3] > 0);
    assert!(committed[4] + committed[3] * 256 <= (SMALL / 8) as u64);
    assert!(daemon.cache().charged_cache_bytes <= SMALL);
    assert_eq!(resident(&daemon, &head, &[root]).len(), 1);
    daemon.close(&a);
    drop(a);

    // The other Workspace reads its whole tree: more than the allowance.
    let other = daemon.snapshot(tree.branches[1]);
    model::assert_same(&daemon.expected(&other), &drive::live(&b), "other branch");
    assert!(daemon.cache().charged_cache_bytes <= SMALL);
    assert!(resident(&daemon, &head, &[root]).is_empty(), "root evicted");

    // A new Workspace on the head: what was evicted is asked of the Store
    // again and authenticated again, one object for one miss, and the tree
    // is the published one byte for byte.
    let evicted = daemon.cache().evictions;
    let before = seen(&daemon);
    let c = daemon.bind_numbered(tree.branches[0], 9);
    for path in WRITTEN {
        visit(&c, path);
    }
    let again = between(&before, &seen(&daemon));
    evidence(format_args!(
        "SEEDING pressure: allowance={SMALL} seeded_objects={} evictions_before={evicted} refetched_objects={} authenticated_bytes={}",
        committed[3], again[0], again[5]
    ));
    assert!(again[0] > 0);
    assert_eq!(again[0], again[1]);
    assert_eq!(again[3], 0);
    model::assert_same(&daemon.expected(&head), &drive::live(&c), "head");
    for (path, bytes) in created() {
        assert_eq!(read(&c, path), bytes, "{path}");
    }
    assert!(daemon.cache().charged_cache_bytes <= SMALL);
    daemon.close(&c);
    daemon.close(&b);
    drop((b, c));
    daemon.stop();
    tree.finish();
}
