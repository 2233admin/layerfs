//! What a NEW Workspace pays on a branch that already holds P Commits: bind,
//! the first lookup and read of a file whose inode leaf many Commits rewrote,
//! the first Commit and the Commits after it, counted at the Storage ports and
//! in the Store's SQL sessions. A Store copy is opened as a new daemon opens
//! it, so nothing is carried over from the Workspaces that made the history.
//! Host, in process, no mount. Counts are exact; wall times are one sample
//! each and are evidence only. Nothing timed is asserted.
//!
//! Without `LAYERFS_LONG_BRANCH_DIR` the tests build two short branches in a
//! temporary directory. With it they keep the Stores there, so a history too
//! long for one invocation is built by several:
//!   LAYERFS_LONG_BRANCH_EXTEND=hot:500      extend that shape by 500 Commits
//!   LAYERFS_LONG_BRANCH_MEASURE=hot:500     measure a session on its P500 copy
//!   LAYERFS_LONG_BRANCH_SESSION=50          Commits of the measured session
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[allow(dead_code)]
#[path = "support/long_branch_rig.rs"]
mod long;
#[allow(dead_code)]
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{evidence, window};
use layerfs_content::filesystem::{FilesystemRead, FilesystemRootId, PathName};
use layerfs_history::CommitStagedOutcome;
use layerfs_persistence::Handles;
use layerfs_storage::Storage;
use long::{change, copy_store, extend, resolve, Daemon, Kept, Reads, Shape, Sql};
use std::{
    fs,
    path::{Path, PathBuf},
    time::Instant,
};

/// Lengths at which the kept Store is copied while it is extended.
const CHECKPOINTS: [usize; 8] = [50, 100, 200, 400, 500, 800, 1_000, 2_000];

fn kept_root() -> Option<PathBuf> {
    std::env::var_os("LAYERFS_LONG_BRANCH_DIR").map(PathBuf::from)
}
fn selected(variable: &str) -> Vec<(Shape, usize)> {
    std::env::var(variable)
        .map(|text| {
            text.split(',')
                .map(|one| {
                    let (shape, count) = one.split_once(':').expect("shape:count");
                    (Shape::parse(shape), count.parse().expect("count"))
                })
                .collect()
        })
        .unwrap_or_default()
}

/// The counts of one measured step.
#[derive(Clone, Copy, Debug, Default)]
struct Step {
    wall_us: u64,
    /// The Commit's own producer handle; zero for a step that is not a Commit.
    producer: Reads,
    writer: Sql,
    readers: Sql,
    reader_storage: Reads,
}
struct Probe<'a> {
    daemon: &'a Daemon,
    started: Instant,
    sql: (Sql, Sql),
    reads: Reads,
}
impl<'a> Probe<'a> {
    fn start(daemon: &'a Daemon) -> Self {
        Self {
            daemon,
            sql: daemon.sql(),
            reads: Reads::of(&daemon.reads()),
            started: Instant::now(),
        }
    }
    fn stop(self) -> Step {
        let wall_us = self.started.elapsed().as_micros() as u64;
        let sql = self.daemon.sql();
        Step {
            wall_us,
            producer: Reads::default(),
            writer: sql.0.since(self.sql.0),
            readers: sql.1.since(self.sql.1),
            reader_storage: Reads::of(&self.daemon.reads()).since(self.reads),
        }
    }
}
fn report(shape: Shape, p: usize, step: &str, n: usize, one: &Step, extra: &str) {
    evidence(format_args!(
        "LONG_BRANCH shape={} P={p} step={step} n={n} wall_us={} producer={:?} writer={:?} readers={:?} reader_storage={:?}{extra}",
        shape.name(),
        one.wall_us,
        one.producer,
        one.writer,
        one.readers,
        one.reader_storage
    ));
}

/// What one cold Storage reader does to read the inode leaf of `path`: a
/// separate read-only session on the same Store file, so the daemon's own
/// sessions and caches are not touched.
fn leaf_read(store: &Path, shape: Shape, p: usize, root: layerfs_content::ObjectId, path: &str) {
    let open = || {
        let handles =
            Handles::open_read_only(long::config(store), support::BINDING, support::CURSOR)
                .unwrap();
        (Storage::new(handles.storage.clone()).unwrap(), handles)
    };
    let (storage, handles) = open();
    let serial = {
        let reader = storage.reader().unwrap();
        let mut walk = FilesystemRead::new(&reader, FilesystemRootId(root)).unwrap();
        let mut serial = walk.root().root_inode().serial();
        for part in path.split('/') {
            serial = walk
                .resolve_child(serial, &PathName::new(part).unwrap())
                .unwrap()
                .serial;
        }
        serial
    };
    drop((storage, handles));
    let (storage, handles) = open();
    let sql = Sql::of(&handles.diagnostics().unwrap());
    let reader = storage.reader().unwrap();
    let started = Instant::now();
    let mut walk = FilesystemRead::new(&reader, FilesystemRootId(root)).unwrap();
    walk.resolve_inode(serial).unwrap();
    let wall_us = started.elapsed().as_micros();
    evidence(format_args!(
        "LONG_BRANCH_LEAF shape={} P={p} path={path} serial={serial} wall_us={wall_us} storage={:?} pooled={:?} sql={:?}",
        shape.name(),
        Reads::of(&storage.diagnostics()),
        reader.pooled_read_counters(),
        Sql::of(&handles.diagnostics().unwrap()).since(sql)
    ));
}

/// Every grouped demand served by its own Storage reader, as the daemon's
/// read handles serve them, with what that one demand cost.
struct Demands<'a> {
    storage: &'a Storage,
    log: std::cell::RefCell<Vec<Demand>>,
}
#[derive(Clone, Copy, Debug)]
struct Demand {
    ids: usize,
    first_role: u8,
    bytes: usize,
    reads: Reads,
    pooled: layerfs_storage::encoding::pool::PoolReadCounters,
}
impl layerfs_content::AuthenticatedObjects for Demands<'_> {
    fn read_canonical_batch(
        &self,
        ids: &[layerfs_content::ObjectId],
    ) -> layerfs_content::ContentResult<Vec<Vec<u8>>> {
        let before = Reads::of(&self.storage.diagnostics());
        let reader = self.storage.reader().unwrap();
        let out = reader.read_objects(ids).unwrap();
        self.log.borrow_mut().push(Demand {
            ids: ids.len(),
            first_role: out
                .first()
                .and_then(|bytes| bytes.first().copied())
                .unwrap_or(0),
            bytes: out.iter().map(Vec::len).sum(),
            reads: Reads::of(&self.storage.diagnostics()).since(before),
            pooled: reader.pooled_read_counters(),
        });
        Ok(out)
    }
}
/// The demands of resolving `path` from the root and reading the file, one
/// line each: where the Store reads of a first lookup go.
fn path_demands(store: &Path, shape: Shape, p: usize, root: layerfs_content::ObjectId, path: &str) {
    let handles =
        Handles::open_read_only(long::config(store), support::BINDING, support::CURSOR).unwrap();
    let storage = Storage::new(handles.storage.clone()).unwrap();
    let demands = Demands {
        storage: &storage,
        log: Default::default(),
    };
    let mut marks = vec![("root", 0)];
    let mut walk = FilesystemRead::new(&demands, FilesystemRootId(root)).unwrap();
    let mut serial = walk.root().root_inode().serial();
    marks.push(("root inode", demands.log.borrow().len()));
    walk.resolve_inode(serial).unwrap();
    let mut value = None;
    for part in path.split('/') {
        marks.push(("name+inode", demands.log.borrow().len()));
        let found = walk
            .resolve_child(serial, &PathName::new(part).unwrap())
            .unwrap();
        serial = found.serial;
        value = Some(found.value);
    }
    marks.push(("content", demands.log.borrow().len()));
    let mut bytes = Vec::new();
    layerfs_telemetry::timer::Timing::disabled("long_branch.read", |scope| {
        layerfs_content::read_all(
            &demands,
            value.unwrap().content_root,
            &mut bytes,
            scope.child("file"),
        )
    })
    .0
    .unwrap();
    let log = demands.log.borrow();
    for (index, one) in log.iter().enumerate() {
        let stage = marks
            .iter()
            .rev()
            .find(|(_, start)| *start <= index)
            .map(|(name, _)| *name)
            .unwrap();
        evidence(format_args!(
            "LONG_BRANCH_DEMAND shape={} P={p} demand={index} stage={stage:?} ids={} first_byte={} bytes={} selections={} whole={} ranges={} catalogue={} locate={} read_bytes={} chain_edges={} records={} value_groups={}",
            shape.name(),
            one.ids,
            one.first_role,
            one.bytes,
            one.reads.selections,
            one.reads.whole,
            one.reads.ranges,
            one.reads.catalogue,
            one.reads.locate,
            one.reads.read_bytes,
            one.pooled.chain_edges,
            one.pooled.physical_record_calls,
            one.pooled.value_rows,
        ));
    }
}

/// One new daemon and one new Workspace on a copy of `snapshot`.
fn session(snapshot: &Path, shape: Shape, p: usize, commits: usize) -> Vec<Step> {
    let scratch = std::env::temp_dir().join(format!(
        "layerfs-long-branch-measure-{}-{}-{p}",
        std::process::id(),
        shape.name()
    ));
    let _ = fs::remove_dir_all(&scratch);
    fs::create_dir_all(&scratch).unwrap();
    let store = scratch.join("store.sqlite");
    copy_store(snapshot, &store);

    let started = Instant::now();
    let daemon = Daemon::open(&store, &format!("measure-{}-{p}", shape.name()));
    let opened = started.elapsed().as_micros();
    let (writer, readers) = daemon.sql();
    evidence(format_args!(
        "LONG_BRANCH shape={} P={p} step=open n=0 wall_us={opened} writer={writer:?} readers={readers:?}",
        shape.name()
    ));

    let probe = Probe::start(&daemon);
    let workspace = daemon.bind(u64::MAX - p as u64);
    report(shape, p, "bind", 0, &probe.stop(), "");
    let root = workspace.snapshot().unwrap().effective_root;

    leaf_read(&store, shape, p, root, shape.probe());
    path_demands(&store, shape, p, root, shape.probe());

    // The first lookup and read of a stored file in a much-rewritten leaf,
    // then of its neighbour in the same directory.
    for (n, path) in [shape.probe(), shape.neighbour()].into_iter().enumerate() {
        let probe = Probe::start(&daemon);
        let bytes = window(&workspace, |operation, view| {
            let serial = resolve(operation, view, path);
            let stat = view.stat(operation.overlay(), serial).unwrap();
            let mut bytes = Vec::new();
            while (bytes.len() as u64) < stat.logical_len {
                let read = view
                    .read(
                        operation.overlay(),
                        serial,
                        bytes.len() as u64,
                        65_536,
                        &mut bytes,
                    )
                    .unwrap();
                assert!(read > 0, "short read");
            }
            bytes.len()
        });
        report(
            shape,
            p,
            "lookup_read",
            n + 1,
            &probe.stop(),
            &format!(" bytes={bytes}"),
        );
    }

    let mut steps = Vec::with_capacity(commits);
    for n in 0..commits {
        change(&workspace, shape, p + n);
        let probe = Probe::start(&daemon);
        let success = workspace
            .commit_captured()
            .unwrap_or_else(|failure| panic!("{failure:?}"));
        let mut step = probe.stop();
        assert!(matches!(success.history, CommitStagedOutcome::Committed(_)));
        let work = success
            .namespace
            .as_ref()
            .and_then(|namespace| namespace.work)
            .expect("the producer ran");
        // The Tier shape removes a file from its twentieth Commit on, so its
        // first Commits change fewer rows than its later ones.
        if shape != Shape::Tier {
            assert_eq!((work.inode_rows, work.entry_rows), (4, 1), "one shape");
        }
        step.producer = Reads::of(&success.storage);
        if n < 3 || (n + 1) % 10 == 0 || n + 1 == commits {
            report(
                shape,
                p,
                "commit",
                n + 1,
                &step,
                &format!(" pool={:?}", success.saved.pool),
            );
        }
        steps.push(step);
        drop(success);
    }
    if commits > 1 {
        let later = &steps[1..];
        let sum = |field: fn(&Step) -> u64| later.iter().map(field).sum::<u64>();
        evidence(format_args!(
            "LONG_BRANCH_LATER shape={} P={p} commits=2..{commits} wall_us={} selections={} catalogue={} locate={} read_bytes={} writer_statements={} writer_transactions={} writer_vm_steps={} writer_fullscan={} writer_sorts={} writer_reprepares={} writer_transaction_us={} reader_statements={}",
            shape.name(),
            sum(|s| s.wall_us),
            sum(|s| s.producer.selections),
            sum(|s| s.producer.catalogue),
            sum(|s| s.producer.locate),
            sum(|s| s.producer.read_bytes),
            sum(|s| s.writer.statements),
            sum(|s| s.writer.transactions),
            sum(|s| s.writer.vm_steps),
            sum(|s| s.writer.fullscan_steps),
            sum(|s| s.writer.sorts),
            sum(|s| s.writer.reprepares),
            sum(|s| s.writer.transaction_us),
            sum(|s| s.readers.statements),
        ));
    }
    daemon.close(&workspace);
    drop(workspace);
    daemon.finish();
    fs::remove_dir_all(scratch).unwrap();
    steps
}

/// Initializes a Store from a tree of `files` files of `bytes` bytes, fifty a
/// directory, through Project Init and the seal, as a host does, and prints
/// the sealed file's length and the time of Init and of the seal. Selected
/// by `LAYERFS_LONG_BRANCH_INIT=files:bytes,...`; a single timed sample.
#[test]
fn init_store_bytes() {
    use layerfs_history::{HistoryCatalogConfig, HistoryName, LayerStackId};
    use layerfs_persistence::{
        Handles, PersistenceConfig, SqliteAcquisitionSchema, SqlitePersistenceProfile,
    };
    use layerfs_project::{init, InitRequest};
    use layerfs_storage::{Storage, StoragePolicy};
    use layerfs_telemetry::timer::Timing;
    let Ok(selection) = std::env::var("LAYERFS_LONG_BRANCH_INIT") else {
        return;
    };
    for item in selection.split(',') {
        let (files, bytes) = item.split_once(':').expect("files:bytes");
        let (files, bytes): (usize, usize) = (files.parse().unwrap(), bytes.parse().unwrap());
        let directory = std::env::temp_dir().join(format!(
            "layerfs-long-branch-init-{}-{files}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&directory);
        let source = directory.join("source");
        for index in 0..files {
            if index % 50 == 0 {
                fs::create_dir_all(source.join(format!("d{:05}", index / 50))).unwrap();
            }
            let line = format!("base file {index:07} of the init tree\n");
            let content: Vec<u8> = line.bytes().cycle().take(bytes).collect();
            fs::write(
                source.join(format!("d{:05}/f{index:07}", index / 50)),
                content,
            )
            .unwrap();
        }
        let sealed = directory.join("sealed.sqlite");
        let handles = Handles::create(
            PersistenceConfig::sqlite(&sealed)
                .with_sqlite_profile(SqlitePersistenceProfile::Disposable)
                .with_sqlite_acquisition(SqliteAcquisitionSchema::Tables),
            StoragePolicy::frozen_default(),
            &HistoryCatalogConfig {
                binding_key: b"long-branch-init".to_vec(),
                cursor_key: [44; 32],
                incarnation: 1,
            },
        )
        .unwrap();
        let storage = Storage::new(handles.storage.clone()).unwrap();
        let started = Instant::now();
        let initialized = Timing::disabled("long-branch.init", |timing| {
            init(
                &storage,
                &handles.history,
                InitRequest {
                    source: &source,
                    acquisition: &handles.acquisition,
                    stack: LayerStackId::from_authority([23; 16]),
                    name: HistoryName::new("installed").unwrap(),
                    scope_seed: [31; 32],
                    deadline: Instant::now() + std::time::Duration::from_secs(100),
                },
                timing,
            )
        })
        .0
        .unwrap();
        let init_ms = started.elapsed().as_millis();
        let work = storage.diagnostics();
        drop(storage);
        let started = Instant::now();
        let sealed = handles.seal().unwrap();
        let seal_ms = started.elapsed().as_millis();
        let length = fs::metadata(&sealed.path).unwrap().len();
        evidence(format_args!(
            "LONG_BRANCH_INIT files={files} file_bytes={bytes} entries={} store_bytes={length} init_ms={init_ms} seal_ms={seal_ms} value_rows_or_groups={} publish={} pack_write_bytes={}",
            initialized.entries, work.pooled_groups, work.publish, work.pack_write_bytes
        ));
        fs::remove_dir_all(&directory).unwrap();
    }
}

#[test]
fn extend_kept_branch() {
    let Some(root) = kept_root() else { return };
    for (shape, commits) in selected("LAYERFS_LONG_BRANCH_EXTEND") {
        let kept = Kept::at(&root, shape);
        extend(&kept, shape, commits, &CHECKPOINTS);
        evidence(format_args!(
            "LONG_BRANCH_KEPT shape={} commits={}",
            shape.name(),
            kept.commits()
        ));
    }
}

#[test]
fn measure_new_session_on_kept_branch() {
    let Some(root) = kept_root() else { return };
    let commits = std::env::var("LAYERFS_LONG_BRANCH_SESSION")
        .map(|text| text.parse().expect("session Commits"))
        .unwrap_or(long::SESSION);
    for (shape, p) in selected("LAYERFS_LONG_BRANCH_MEASURE") {
        let kept = Kept::at(&root, shape);
        let snapshot = kept.snapshot_of(p);
        assert!(
            snapshot.exists(),
            "no copy at P={p}: extend the branch first"
        );
        session(&snapshot, shape, p, commits);
    }
}

/// The self-contained run: both shapes, a new session on the empty branch and
/// on a branch of sixteen Commits. Every Commit of every session has the one
/// shape of change; what a session pays for it is printed, not bounded here.
#[test]
fn new_session_on_a_short_branch() {
    if kept_root().is_some() {
        return;
    }
    let root = std::env::temp_dir().join(format!("layerfs-long-branch-{}", std::process::id()));
    let _ = fs::remove_dir_all(&root);
    for shape in [Shape::Hot, Shape::Distributed] {
        let kept = Kept::at(&root, shape);
        extend(&kept, shape, 16, &[16]);
        assert_eq!(kept.commits(), 16);
        for p in [0, 16] {
            let steps = session(&kept.snapshot_of(p), shape, p, 3);
            // Only the first Commit of a Workspace opens a producer.
            assert_eq!(
                steps.iter().map(|s| s.producer.policy).collect::<Vec<_>>(),
                [1, 0, 0]
            );
        }
    }
    fs::remove_dir_all(root).unwrap();
}

/// Every inode leaf of the branch head, each as its own demand on ONE
/// long-lived read handle, the way a daemon's fixed read handle serves the
/// first reads of a mount. Reports the first demand that fails, if any.
fn leaves_on_one_handle(store: &Path, shape: Shape, p: usize, roots_read: usize) -> Option<String> {
    use layerfs_content::filesystem::inode::codec::{decode_inode_page, InodePage};
    use layerfs_history::HistoryCatalog;
    let handles =
        Handles::open_read_only(long::config(store), support::BINDING, support::CURSOR).unwrap();
    let snapshot = handles
        .history
        .branch_snapshot(long::branch())
        .unwrap()
        .expect("the branch");
    // The head root and the root of every 250th Commit behind it: one read
    // handle serves whatever roots its Workspaces are bound to.
    let mut roots = vec![snapshot.effective_root];
    let mut current = snapshot.branch.head_commit;
    let mut behind = 0_usize;
    while let Some(id) = current {
        let record = handles.history.commit(id).unwrap().expect("a Commit");
        if behind > 0 && behind % 250 == 0 {
            roots.push(record.root);
        }
        behind += 1;
        current = record.parent;
    }
    let storage = Storage::new(handles.storage.clone()).unwrap();
    let read = |id| {
        storage
            .reader()
            .and_then(|reader| reader.read_objects(&[id]))
    };
    let mut leaves = Vec::new();
    for root in roots.iter().take(roots_read) {
        let table = layerfs_content::filesystem::FilesystemRoot::decode(&read(*root).unwrap()[0])
            .unwrap()
            .inode_table();
        let mut pending = vec![table];
        while let Some(id) = pending.pop() {
            match decode_inode_page(&read(id).unwrap()[0]).unwrap() {
                InodePage::Leaf { .. } => leaves.push(id),
                InodePage::Branch { children, .. } => {
                    pending.extend(children.into_iter().map(|(_, child)| child))
                }
            }
        }
    }
    let mut failure = None;
    let mut demands = 0_usize;
    for (index, leaf) in leaves.iter().enumerate() {
        demands += 1;
        if let Err(error) = read(*leaf) {
            failure = Some(format!("leaf={index} demand={demands} error={error:?}"));
            break;
        }
    }
    evidence(format_args!(
        "LONG_BRANCH_LEAVES shape={} P={p} roots={} leaves={} demands={demands} failure={failure:?} storage={:?}",
        shape.name(),
        roots.len().min(roots_read),
        leaves.len(),
        Reads::of(&storage.diagnostics()),
    ));
    failure
}

#[test]
fn one_read_handle_reads_every_leaf_of_a_kept_branch() {
    let Some(root) = kept_root() else { return };
    for (shape, p) in selected("LAYERFS_LONG_BRANCH_LEAVES") {
        let kept = Kept::at(&root, shape);
        let scratch = std::env::temp_dir().join(format!(
            "layerfs-long-branch-leaves-{}-{}-{p}",
            std::process::id(),
            shape.name()
        ));
        let _ = fs::remove_dir_all(&scratch);
        fs::create_dir_all(&scratch).unwrap();
        let store = scratch.join("store.sqlite");
        copy_store(&kept.snapshot_of(p), &store);
        let mut failure = None;
        for roots in [1, 2, 4, 8] {
            failure = failure.or(leaves_on_one_handle(&store, shape, p, roots));
        }
        fs::remove_dir_all(scratch).unwrap();
        assert_eq!(failure, None, "a leaf of a long branch could not be read");
    }
}
