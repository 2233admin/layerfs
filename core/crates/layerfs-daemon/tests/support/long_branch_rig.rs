//! A branch with many earlier Commits, kept as a Store file that later test
//! invocations extend and measure. The history is made by the product: every
//! Commit is `BoundWorkspace::commit_captured` over a real Disposable Store
//! and the real local owner, from a Workspace that is closed and replaced
//! after `SESSION` Commits, without a mount. Nothing here reads a benchmark
//! size or path; the shapes are this file's own.
use super::{
    drive::{evidence, job, settled, window},
    support,
};
use layerfs_content::filesystem::PathName;
use layerfs_daemon::{
    bootstrap::{open_store_observed, OpenedStore},
    store::{BindRequest, BoundWorkspace, StoreOperation},
    Command, Owner, OwnerConfig, Response,
};
use layerfs_history::{BranchId, CommitStagedOutcome, WorkspaceId};
use layerfs_overlay::ProfileConfig;
use layerfs_persistence::{
    PersistenceConfig, SqlWork, SqliteAcquisitionSchema, SqlitePersistenceProfile,
};
use layerfs_storage::{Diagnostics, ReservationBlocks};
use layerfs_workspace::{Operation, Outcome, Position, SourceView, Time};
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
    time::Instant,
};

/// Directories of the base, `FILES` regular files each.
pub const DIRECTORIES: usize = 40;
pub const FILES: usize = 50;
/// Directories the hot shape rewrites; their files fill about two inode leaves.
pub const HOT_DIRECTORIES: usize = 4;
/// Commits one Workspace makes before it is closed and replaced (owner's
/// usage model: about fifty Commits, then unmount).
pub const SESSION: usize = 50;
/// The branch every fixture forks, as `support::Fixture::built` names it.
pub fn branch() -> BranchId {
    BranchId::from_authority([24; 16])
}

/// Which rows successive Commits rewrite.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Shape {
    /// The same two hundred files over and over: the same leaves at every
    /// Commit, a different row of them each time.
    Hot,
    /// Every file of the tree in turn: a different leaf at most Commits.
    Distributed,
}
impl Shape {
    pub fn name(self) -> &'static str {
        match self {
            Self::Hot => "hot",
            Self::Distributed => "distributed",
        }
    }
    pub fn parse(name: &str) -> Self {
        match name {
            "hot" => Self::Hot,
            "distributed" => Self::Distributed,
            other => panic!("unknown shape {other}"),
        }
    }
    /// The paths of Commit `commit`: (new file, rewritten file, file whose
    /// mode changes). The shape of `product_commit_history_cost`: four inode
    /// rows (new file, its directory, two stored files) and one entry row.
    pub fn paths(self, commit: usize) -> (String, String, String) {
        match self {
            Self::Hot => {
                let hot = HOT_DIRECTORIES * FILES;
                let (a, b) = (commit % hot, (commit + hot / 2) % hot);
                (
                    format!("d-{:02}/new-{commit:06}", commit % HOT_DIRECTORIES),
                    format!("d-{:02}/f-{:02}", a / FILES, a % FILES),
                    format!("d-{:02}/f-{:02}", b / FILES, b % FILES),
                )
            }
            Self::Distributed => (
                format!("d-{:02}/new-{commit:06}", commit % DIRECTORIES),
                format!(
                    "d-{:02}/f-{:02}",
                    (commit * 7 + 7) % DIRECTORIES,
                    (commit / DIRECTORIES + commit) % FILES
                ),
                format!(
                    "d-{:02}/f-{:02}",
                    (commit * 11 + 13) % DIRECTORIES,
                    (commit / DIRECTORIES + commit + 25) % FILES
                ),
            ),
        }
    }
    /// A stored file whose leaf the shape has rewritten at many Commits.
    pub fn probe(self) -> &'static str {
        "d-01/f-25"
    }
}

fn tree(source: &Path) -> usize {
    for directory in 0..DIRECTORIES {
        let path = source.join(format!("d-{directory:02}"));
        fs::create_dir_all(&path).unwrap();
        for file in 0..FILES {
            fs::write(
                path.join(format!("f-{file:02}")),
                format!("base {directory} {file}\n"),
            )
            .unwrap();
        }
    }
    DIRECTORIES * (FILES + 1)
}

/// One kept Store and how many Commits its branch holds.
pub struct Kept {
    pub directory: PathBuf,
}
impl Kept {
    pub fn store(&self) -> PathBuf {
        self.directory.join("store.sqlite")
    }
    pub fn commits(&self) -> usize {
        fs::read_to_string(self.directory.join("commits"))
            .map(|text| text.trim().parse().unwrap())
            .unwrap_or(0)
    }
    fn record(&self, commits: usize) {
        fs::write(self.directory.join("commits"), format!("{commits}\n")).unwrap();
    }
    /// The Store of this shape under `root`, initialized once from the base
    /// tree through Project Init, sealed and installed as a daemon receives it.
    pub fn at(root: &Path, shape: Shape) -> Self {
        let kept = Self {
            directory: root.join(shape.name()),
        };
        if !kept.store().exists() {
            fs::create_dir_all(&kept.directory).unwrap();
            let fixture =
                support::Fixture::built(&format!("long-branch-{}", shape.name()), |source| {
                    tree(source)
                });
            assert_eq!(fixture.branch, branch());
            fs::copy(&fixture.config.path, kept.store()).unwrap();
            fixture.cleanup();
            kept.record(0);
            kept.snapshot(0);
        }
        kept
    }
    /// A byte copy of the closed Store at its present length, kept beside it.
    pub fn snapshot(&self, commits: usize) {
        let target = self.directory.join(format!("P{commits}"));
        fs::create_dir_all(&target).unwrap();
        copy_store(&self.store(), &target.join("store.sqlite"));
    }
    pub fn snapshot_of(&self, commits: usize) -> PathBuf {
        self.directory.join(format!("P{commits}/store.sqlite"))
    }
}
/// The main file and, when the last close left one, its write-ahead log.
pub fn copy_store(from: &Path, to: &Path) {
    fs::copy(from, to).unwrap();
    let wal = |path: &Path| PathBuf::from(format!("{}-wal", path.display()));
    if wal(from).exists() {
        fs::copy(wal(from), wal(to)).unwrap();
    }
}
pub fn config(store: &Path) -> PersistenceConfig {
    PersistenceConfig::sqlite(store)
        .with_sqlite_profile(SqlitePersistenceProfile::Disposable)
        .with_sqlite_acquisition(SqliteAcquisitionSchema::Tables)
}

/// One daemon's view of a Store: the opened providers and its own local owner.
pub struct Daemon {
    pub opened: OpenedStore,
    pub owner: Owner,
    scratch: PathBuf,
}
impl Daemon {
    pub fn open(store: &Path, label: &str) -> Self {
        let scratch = std::env::temp_dir().join(format!(
            "layerfs-long-branch-{}-{label}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&scratch);
        fs::create_dir_all(&scratch).unwrap();
        let opened = open_store_observed(
            config(store),
            support::BINDING,
            support::CURSOR,
            2,
            2 * 1024 * 1024,
            ReservationBlocks::default(),
        )
        .unwrap();
        let owner = Owner::start(
            &scratch.join("overlay.sqlite"),
            ProfileConfig::default(),
            OwnerConfig::default(),
        )
        .unwrap();
        Self {
            opened,
            owner,
            scratch,
        }
    }
    pub fn bind(&self, session: u64) -> Arc<BoundWorkspace> {
        let mut authority = [0x5a_u8; 32];
        authority[..8].copy_from_slice(&session.to_be_bytes());
        Arc::new(
            self.opened
                .store
                .bind(
                    self.owner.client(),
                    BindRequest {
                        branch: branch(),
                        workspace: WorkspaceId::from_authority(authority).unwrap(),
                    },
                )
                .unwrap_or_else(|refusal| panic!("{refusal:?}"))
                .workspace,
        )
    }
    pub fn close(&self, workspace: &BoundWorkspace) {
        assert!(matches!(
            job(&self.owner.client(), workspace.route(), Command::Close).result(),
            Ok(Response::Done)
        ));
    }
    pub fn finish(self) {
        drop(self.opened);
        self.owner.stop().unwrap();
        fs::remove_dir_all(self.scratch).unwrap();
    }
    /// Work of the writer session and of the fixed read sessions together.
    pub fn sql(&self) -> (Sql, Sql) {
        let all = self.opened.diagnostics().unwrap();
        let mut readers = Sql::default();
        for reader in &all.readers {
            readers = readers.plus(Sql::of(reader));
        }
        (Sql::of(&all.writer), readers)
    }
    /// Storage counts of the fixed read handles together.
    pub fn reads(&self) -> Diagnostics {
        let mut total = Diagnostics::default();
        for index in 0..self.opened.store.read_handles() {
            let one = self
                .opened
                .store
                .reader_storage_diagnostics(index)
                .expect("an idle reader");
            total = plus(total, one);
        }
        total
    }
}

fn name(value: &str) -> PathName {
    PathName::new(value).unwrap()
}
pub fn resolve(operation: &StoreOperation, view: &SourceView, path: &str) -> u64 {
    let mut serial = view.root_serial();
    for part in path.split('/') {
        serial = view
            .lookup(operation.overlay(), serial, &name(part))
            .unwrap_or_else(|error| panic!("lookup {part}: {error:?}"))
            .serial;
    }
    serial
}
fn mutate(
    workspace: &BoundWorkspace,
    operation: &StoreOperation,
    view: &SourceView,
    request: Operation,
    now: Time,
) {
    let outcome = operation
        .workspace()
        .mutate(operation.overlay(), operation.ports(), view, request, now)
        .unwrap_or_else(|error| panic!("{error:?}"));
    match outcome {
        Outcome::Applied { publication, .. } => assert!(job(
            operation.overlay(),
            workspace.route(),
            Command::ReplyAttempted(publication)
        )
        .result()
        .is_ok()),
        Outcome::Unchanged { .. } => panic!("a change of the shape changed nothing"),
    }
}
/// Applies the change of Commit `commit` to the live Workspace.
pub fn change(workspace: &BoundWorkspace, shape: Shape, commit: usize) {
    let (added, rewritten, moded) = shape.paths(commit);
    let now = Time {
        seconds: 1_800_000_000 + commit as i64,
        nanoseconds: 123_456_789,
    };
    let bytes = format!("commit {commit} content\n");
    window(workspace, |operation, view| {
        let (parent, last) = added.split_once('/').unwrap();
        let parent = resolve(operation, view, parent);
        mutate(
            workspace,
            operation,
            view,
            Operation::Create {
                parent,
                name: name(last),
                mode: 0o644,
            },
            now,
        );
    });
    window(workspace, |operation, view| {
        for path in [&added, &rewritten] {
            let serial = resolve(operation, view, path);
            mutate(
                workspace,
                operation,
                view,
                Operation::Write {
                    serial,
                    position: Position::At(0),
                    data: bytes.as_bytes().into(),
                },
                now,
            );
        }
        let serial = resolve(operation, view, &moded);
        mutate(
            workspace,
            operation,
            view,
            Operation::SetAttributes {
                serial,
                mode: Some(0o700 + (commit as u32 % 64)),
                mtime: Some(now),
                size: None,
            },
            now,
        );
    });
}

/// Extends the kept branch by `commits` Commits in sessions of `SESSION`,
/// each from a new Workspace, and copies the closed Store at every length in
/// `checkpoints` it passes. Returns the wall time of the Commits alone.
pub fn extend(kept: &Kept, shape: Shape, commits: usize, checkpoints: &[usize]) {
    let mut done = kept.commits();
    let end = done + commits;
    while done < end {
        let daemon = Daemon::open(&kept.store(), "extend");
        let mut until = end.min((done / SESSION + 1) * SESSION);
        if let Some(stop) = checkpoints
            .iter()
            .find(|stop| done < **stop && **stop < until)
        {
            until = *stop;
        }
        let workspace = daemon.bind(done as u64);
        let started = Instant::now();
        for commit in done..until {
            change(&workspace, shape, commit);
            settled(&daemon.owner.client(), 0);
            let success = workspace
                .commit_captured()
                .unwrap_or_else(|failure| panic!("{failure:?}"));
            assert!(matches!(success.history, CommitStagedOutcome::Committed(_)));
        }
        evidence(format_args!(
            "LONG_BRANCH_EXTEND shape={} commits={}..{} wall_ms={}",
            shape.name(),
            done,
            until,
            started.elapsed().as_millis()
        ));
        daemon.close(&workspace);
        drop(workspace);
        daemon.finish();
        done = until;
        kept.record(done);
        if checkpoints.contains(&done) {
            kept.snapshot(done);
        }
    }
}

/// The counted SQL work this file reports, from one session's `SqlWork`.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct Sql {
    pub statements: u64,
    pub vm_steps: u64,
    pub fullscan_steps: u64,
    pub sorts: u64,
    pub reprepares: u64,
    pub transactions: u64,
    pub write_transactions: u64,
    pub returned_rows: u64,
    pub blob_reads: u64,
    pub blob_bytes: u64,
    pub statement_us: u64,
    pub transaction_us: u64,
}
impl Sql {
    pub fn of(work: &SqlWork) -> Self {
        Self {
            statements: work.statements,
            vm_steps: work.vm_steps,
            fullscan_steps: work.fullscan_steps,
            sorts: work.sorts,
            reprepares: work.reprepares,
            transactions: work.transactions,
            write_transactions: work.write_transactions,
            returned_rows: work.returned_rows,
            blob_reads: work.blob_read_calls,
            blob_bytes: work.blob_read_bytes,
            statement_us: work.statement_ns / 1_000,
            transaction_us: work.transaction_ns / 1_000,
        }
    }
    pub fn plus(self, other: Self) -> Self {
        Self {
            statements: self.statements + other.statements,
            vm_steps: self.vm_steps + other.vm_steps,
            fullscan_steps: self.fullscan_steps + other.fullscan_steps,
            sorts: self.sorts + other.sorts,
            reprepares: self.reprepares + other.reprepares,
            transactions: self.transactions + other.transactions,
            write_transactions: self.write_transactions + other.write_transactions,
            returned_rows: self.returned_rows + other.returned_rows,
            blob_reads: self.blob_reads + other.blob_reads,
            blob_bytes: self.blob_bytes + other.blob_bytes,
            statement_us: self.statement_us + other.statement_us,
            transaction_us: self.transaction_us + other.transaction_us,
        }
    }
    pub fn since(self, before: Self) -> Self {
        Self {
            statements: self.statements - before.statements,
            vm_steps: self.vm_steps - before.vm_steps,
            fullscan_steps: self.fullscan_steps - before.fullscan_steps,
            sorts: self.sorts - before.sorts,
            reprepares: self.reprepares - before.reprepares,
            transactions: self.transactions - before.transactions,
            write_transactions: self.write_transactions - before.write_transactions,
            returned_rows: self.returned_rows - before.returned_rows,
            blob_reads: self.blob_reads - before.blob_reads,
            blob_bytes: self.blob_bytes - before.blob_bytes,
            statement_us: self.statement_us - before.statement_us,
            transaction_us: self.transaction_us - before.transaction_us,
        }
    }
}

/// The Storage counts this file reports, from one handle's `Diagnostics`.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct Reads {
    pub policy: u64,
    pub signatures: u64,
    pub locate: u64,
    pub locator_misses: u64,
    pub catalogue: u64,
    pub read_packs: u64,
    pub selections: u64,
    pub whole: u64,
    pub ranges: u64,
    pub payload_reads: u64,
    pub pack_hits: u64,
    pub pack_misses: u64,
    pub pack_evictions: u64,
    pub read_bytes: u64,
    pub pooled_groups: u64,
    pub pooled_packs: u64,
    pub written_bytes: u64,
}
impl Reads {
    pub fn of(storage: &Diagnostics) -> Self {
        Self {
            policy: storage.policy,
            signatures: storage.signatures,
            locate: storage.locate,
            locator_misses: storage.locator_misses,
            catalogue: storage.value_groups,
            read_packs: storage.read_packs,
            selections: storage.read_pack_selections,
            whole: storage.whole_selected,
            ranges: storage.range_selected,
            payload_reads: storage.payload_reads,
            pack_hits: storage.pack_hits,
            pack_misses: storage.pack_misses,
            pack_evictions: storage.pack_evictions,
            read_bytes: storage.pack_read_bytes
                + storage.payload_read_bytes
                + storage.range_acquired_bytes,
            pooled_groups: storage.pooled_groups,
            pooled_packs: storage.pooled_packs,
            written_bytes: storage.pack_write_bytes,
        }
    }
    pub fn since(self, before: Self) -> Self {
        Self {
            policy: self.policy - before.policy,
            signatures: self.signatures - before.signatures,
            locate: self.locate - before.locate,
            locator_misses: self.locator_misses - before.locator_misses,
            catalogue: self.catalogue - before.catalogue,
            read_packs: self.read_packs - before.read_packs,
            selections: self.selections - before.selections,
            whole: self.whole - before.whole,
            ranges: self.ranges - before.ranges,
            payload_reads: self.payload_reads - before.payload_reads,
            pack_hits: self.pack_hits - before.pack_hits,
            pack_misses: self.pack_misses - before.pack_misses,
            pack_evictions: self.pack_evictions - before.pack_evictions,
            read_bytes: self.read_bytes - before.read_bytes,
            pooled_groups: self.pooled_groups - before.pooled_groups,
            pooled_packs: self.pooled_packs - before.pooled_packs,
            written_bytes: self.written_bytes - before.written_bytes,
        }
    }
}
fn plus(a: Diagnostics, b: Diagnostics) -> Diagnostics {
    Diagnostics {
        policy: a.policy + b.policy,
        locate: a.locate + b.locate,
        read_packs: a.read_packs + b.read_packs,
        read_pack_selections: a.read_pack_selections + b.read_pack_selections,
        whole_selected: a.whole_selected + b.whole_selected,
        range_selected: a.range_selected + b.range_selected,
        range_acquired_bytes: a.range_acquired_bytes + b.range_acquired_bytes,
        value_groups: a.value_groups + b.value_groups,
        signatures: a.signatures + b.signatures,
        payload_reads: a.payload_reads + b.payload_reads,
        payload_read_bytes: a.payload_read_bytes + b.payload_read_bytes,
        pack_read_bytes: a.pack_read_bytes + b.pack_read_bytes,
        locator_misses: a.locator_misses + b.locator_misses,
        pack_hits: a.pack_hits + b.pack_hits,
        pack_misses: a.pack_misses + b.pack_misses,
        pack_evictions: a.pack_evictions + b.pack_evictions,
        ..a
    }
}
