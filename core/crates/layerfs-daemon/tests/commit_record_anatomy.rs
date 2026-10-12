//! Record jobs of one Commit split by who asked (the namespace producer,
//! Content's filesystem update, a changed file's plan, Content's file edit
//! engine), by record kind and by port call. The Commit runs through the
//! unchanged driver over a real Disposable Store and the real local owner,
//! without a mount; its constructor is the product's own steps with the
//! constructor-thread ports wrapped by a counting pass-through, so each
//! counted call is one original owner job. Counts are printed as evidence and
//! the totals are pinned exactly. Nothing is timed.
#[allow(dead_code)]
#[path = "support/record_counts.rs"]
mod counts;
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[allow(dead_code)]
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use counts::{Call, Counting, Owner, Seen};
use drive::{evidence, job, settled, Do, Rig, Session};
use layerfs_content::ObjectId;
use layerfs_daemon::{
    store::{BoundWorkspace, CommitError},
    Command, Response, ServiceClass,
};
use layerfs_history::CommitStagedOutcome;
use layerfs_overlay::StatementKind;
use layerfs_persistence::SqlitePersistenceProfile;
use layerfs_workspace::{CapturedNamespace, CapturedNamespaceAttempt, CapturedNamespaceWork};
use std::{
    fmt::Write as _,
    fs,
    os::unix::fs::{symlink, PermissionsExt},
    path::Path,
};

/// Files below `bulk/`, fifty to a directory.
const BULK: usize = 1_600;
/// Stored files of 20,000 bytes below `mid/`.
const MID: usize = 40;
const MID_BYTES: usize = 20_000;
const WIDE_BYTES: usize = 300_000;
const BIG_BYTES: usize = 2 * 1024 * 1024;

/// Bytes with no period, so content-defined boundaries fall as in real data.
fn noise(seed: u64, len: usize) -> Vec<u8> {
    let mut state = seed.wrapping_mul(0x9E37_79B9_7F4A_7C15) | 1;
    (0..len)
        .map(|_| {
            state ^= state << 13;
            state ^= state >> 7;
            state ^= state << 17;
            (state >> 24) as u8
        })
        .collect()
}
fn pattern(seed: u8, len: usize) -> Vec<u8> {
    (0..len)
        .map(|n| (n as u32).wrapping_mul(31).wrapping_add(u32::from(seed)) as u8)
        .collect()
}
/// The base of `product_commit_cost.rs`, byte for byte.
fn tree(source: &Path) {
    for directory in [
        "a",
        "a/b",
        "a/b/c",
        "keep",
        "keep/inner",
        "gone",
        "gone/sub",
        "wide",
        "empty",
    ] {
        fs::create_dir_all(source.join(directory)).unwrap();
    }
    for (path, bytes) in [
        ("top.txt", b"top level\n".to_vec()),
        ("a/one", b"one: sixteen byt\n".to_vec()),
        ("a/b/two", b"two contents\n".to_vec()),
        ("a/b/c/three", pattern(3, 300_000)),
        ("keep/inner/k", pattern(9, 5_000)),
        ("gone/x", b"x".to_vec()),
        ("gone/sub/y", b"y".to_vec()),
        ("empty-file", Vec::new()),
    ] {
        fs::write(source.join(path), bytes).unwrap();
    }
    for n in 0..80 {
        fs::write(source.join(format!("wide/w-{n:06}")), format!("wide {n}\n")).unwrap();
    }
    for n in 0..BULK {
        let directory = source.join(format!("bulk/d-{:03}", n / 50));
        fs::create_dir_all(&directory).unwrap();
        fs::write(
            directory.join(format!("f-{:02}", n % 50)),
            format!("bulk {n}\n"),
        )
        .unwrap();
    }
    symlink("a/one", source.join("link")).unwrap();
    symlink("../..", source.join("a/b/back")).unwrap();
    symlink("x", source.join("gone/l")).unwrap();
    fs::hard_link(source.join("top.txt"), source.join("a/alias")).unwrap();
    fs::hard_link(source.join("a/b/two"), source.join("keep/alias2")).unwrap();
    fs::set_permissions(source.join("a/one"), fs::Permissions::from_mode(0o600)).unwrap();
    fs::set_permissions(source.join("keep"), fs::Permissions::from_mode(0o750)).unwrap();
}
/// The same base with stored files of three larger sizes beside it.
fn sized_tree(source: &Path) {
    tree(source);
    for (directory, count, bytes) in [
        ("mid", MID, MID_BYTES),
        ("wide300", 4, WIDE_BYTES),
        ("big", 4, BIG_BYTES),
    ] {
        fs::create_dir_all(source.join(directory)).unwrap();
        for n in 0..count {
            fs::write(
                source.join(format!("{directory}/m-{n:03}")),
                noise((bytes + n) as u64, bytes),
            )
            .unwrap();
        }
    }
}

/// One Commit's counted work.
struct Counted {
    seen: Seen,
    work: CapturedNamespaceWork,
    root: ObjectId,
    /// Completed owner jobs by service class over the whole Commit.
    classes: [u64; 6],
    /// Foreground statements by family over the whole Commit: the engine's
    /// own attempts, not SQLite's run counter, which also counts a trigger.
    statements: [u64; 14],
    /// The Commit's own Store reads and writes, and Content's update work.
    storage: String,
    content: String,
}
/// The product constructor's steps (`store/captured.rs`) with the three
/// constructor-thread ports counted: acquire the reader and one operation
/// owner, run the producer once into the driver's Save, release both.
fn commit_counted(rig: &Rig, workspace: &BoundWorkspace) -> Counted {
    let operation = workspace.operation().unwrap();
    let route = workspace.route();
    let policy = rig.store.policy().construction();
    settled(&rig.owner.client(), 0);
    let before = rig.owner.client().diagnostics().unwrap();
    let mut produced = None;
    let result = workspace.commit(|save, capture, _| {
        let overlay = operation.overlay();
        let request = u64::try_from(capture.generation.number()).unwrap();
        let reader = match job(
            overlay,
            route,
            Command::AcquireCapturedReader { capture, request },
        )
        .result()
        {
            Ok(Response::CapturedReader(Some(reader))) => *reader,
            other => panic!("{other:?}"),
        };
        let owner = match job(overlay, route, Command::AcquireOperation { request }).result() {
            Ok(Response::Operation(Some(owner))) => *owner,
            other => panic!("{other:?}"),
        };
        let counting = Counting::new(overlay);
        let mut sink = save.sink();
        let CapturedNamespaceAttempt { result, custody } =
            CapturedNamespace::new(operation.workspace(), &counting, reader, owner)
                .construct_untimed(policy, &policy.capacities(), save, &mut sink);
        let built = match result {
            Ok(built) => built,
            Err(error) => panic!("{error:?} {:?}", custody.failure),
        };
        let work = custody.work;
        drop(custody);
        produced = Some((counting.into_seen(), work, format!("{:?}", built.counters)));
        assert!(job(overlay, route, Command::ReleaseCapturedReader(reader))
            .result()
            .is_ok());
        assert!(job(overlay, route, Command::ReleaseOperation(owner))
            .result()
            .is_ok());
        Ok::<_, CommitError>(built.root)
    });
    let success = result.unwrap_or_else(|failure| panic!("{failure:?}"));
    let root = match &success.history {
        CommitStagedOutcome::Committed(record) => record.root,
        other => panic!("{other:?}"),
    };
    let storage = format!("{:?} {:?}", success.storage, success.saved);
    drop(success);
    settled(&rig.owner.client(), 0);
    let after = rig.owner.client().diagnostics().unwrap();
    let sql = after.sql_foreground.since(&before.sql_foreground);
    let (seen, work, content) = produced.expect("the constructor ran");
    let classes: [u64; 6] =
        std::array::from_fn(|class| after.completed[class] - before.completed[class]);
    // Every counted record call is one OperationRecord job, and no other.
    assert_eq!(
        seen.record_jobs(),
        classes[ServiceClass::OperationRecord as usize]
    );
    Counted {
        seen,
        work,
        root,
        classes,
        statements: std::array::from_fn(|kind| sql.statements[kind].attempts),
        storage,
        content,
    }
}

/// The exact totals of one case, pinned.
#[derive(Debug, Eq, PartialEq)]
struct Totals {
    record_jobs: u64,
    producer: u64,
    namespace: u64,
    file_plan: u64,
    edit_engine: u64,
    contains: u64,
    get: u64,
    apply: u64,
    first_keys: u64,
    keys_after: u64,
    /// Changes carried by all applies.
    applied_changes: u64,
    /// Key windows that returned no key.
    empty_windows: u64,
    /// Captured reader jobs of the constructor (Read class).
    reader_jobs: u64,
    /// Foreground statements of the whole Commit: Workspace, Lease,
    /// OperationRecord, Begin and Commit families.
    workspace_statements: u64,
    lease_statements: u64,
    record_statements: u64,
    begin_statements: u64,
    commit_statements: u64,
}
fn totals(counted: &Counted) -> Totals {
    let owners = counted.seen.by_owner();
    let calls = counted.seen.by_call();
    let owner = |owner| owners.get(&owner).copied().unwrap_or(0);
    let call = |call| calls.get(&call).copied().unwrap_or(0);
    let family = |kind: StatementKind| counted.statements[kind as usize];
    Totals {
        record_jobs: counted.seen.record_jobs(),
        producer: owner(Owner::Producer),
        namespace: owner(Owner::Namespace),
        file_plan: owner(Owner::FilePlan),
        edit_engine: owner(Owner::EditEngine),
        contains: call(Call::Contains),
        get: call(Call::Get),
        apply: call(Call::Apply),
        first_keys: call(Call::FirstKeys),
        keys_after: call(Call::KeysAfter),
        applied_changes: counted.seen.changes.values().sum(),
        empty_windows: counted.seen.window_sizes.get(&0).copied().unwrap_or(0),
        reader_jobs: counted.seen.read_jobs(),
        workspace_statements: family(StatementKind::Workspace),
        lease_statements: family(StatementKind::Lease),
        record_statements: family(StatementKind::OperationRecord),
        begin_statements: family(StatementKind::Begin),
        commit_statements: family(StatementKind::Commit),
    }
}
fn table(rows: impl IntoIterator<Item = ((String, Call), u64)>) -> String {
    let mut line = String::new();
    for ((kind, call), jobs) in rows {
        write!(line, " {kind}.{}={jobs}", call.name()).unwrap();
    }
    line
}
/// Prints one case's full split and returns its totals.
fn report(case: &str, counted: &Counted) -> Totals {
    let seen = &counted.seen;
    let work = &counted.work;
    let totals = totals(counted);
    let files = seen.files();
    let stored = files.values().filter(|file| file.1 != 0).count();
    evidence(format_args!(
        "COMMIT_RECORD_ANATOMY case={case} inode_rows={} entry_rows={} values_written={} tombstones={} fresh_serials={} files_constructed={} files_unchanged={} file_scopes={} stored_file_scopes={stored} new_file_scopes={}",
        work.inode_rows,
        work.entry_rows,
        work.values_written,
        work.tombstones_skipped,
        work.fresh_serials,
        work.files_constructed,
        work.files_unchanged,
        files.len(),
        files.len() - stored
    ));
    evidence(format_args!(
        "COMMIT_RECORD_ANATOMY_TOTALS case={case} {totals:?}"
    ));
    for owner in [
        Owner::Producer,
        Owner::Namespace,
        Owner::FilePlan,
        Owner::EditEngine,
    ] {
        evidence(format_args!(
            "COMMIT_RECORD_ANATOMY_KINDS case={case} owner={owner:?}{}",
            table(seen.of(owner))
        ));
    }
    evidence(format_args!(
        "COMMIT_RECORD_ANATOMY_SHAPES case={case} apply_sizes={:?} mixed_applies={} window_sizes={:?} absent_gets={}",
        seen.apply_sizes, seen.mixed_applies, seen.window_sizes, seen.absent_gets
    ));
    evidence(format_args!(
        "COMMIT_RECORD_ANATOMY_READS case={case} constructor_reader_jobs={:?} owner_classes(read,mutation,capture,lifecycle,operation_record,source)={:?}",
        seen.reads, counted.classes
    ));
    evidence(format_args!(
        "COMMIT_RECORD_ANATOMY_STATEMENTS case={case} by_family(StatementKind order)={:?} total={}",
        counted.statements,
        counted.statements.iter().sum::<u64>()
    ));
    evidence(format_args!(
        "COMMIT_RECORD_ANATOMY_STORE case={case} {}",
        counted.storage
    ));
    evidence(format_args!(
        "COMMIT_RECORD_ANATOMY_CONTENT case={case} {}",
        counted.content
    ));
    // Per file scope: (plan jobs, edit-engine jobs) -> number of files.
    let mut shapes = std::collections::BTreeMap::<(u64, u64), u64>::new();
    for file in files.values() {
        *shapes.entry(*file).or_default() += 1;
    }
    evidence(format_args!(
        "COMMIT_RECORD_ANATOMY_FILES case={case} (plan_jobs,engine_jobs)->files={shapes:?}"
    ));
    totals
}

/// Binds one Workspace on a fresh rig, applies one change, commits it counted
/// and compares the published root with the independent model.
fn one(case: &str, build: fn(&Path), change: impl FnOnce(&mut Session<'_>)) -> Totals {
    let rig = Rig::new(&format!("commit-record-anatomy-{case}"), build);
    assert_eq!(
        rig.f.config.sqlite_profile,
        SqlitePersistenceProfile::Disposable
    );
    let workspace = rig.bind(1);
    let mut session = Session::new(&workspace, rig.base.clone());
    change(&mut session);
    let expected = session.model.flat();
    let counted = commit_counted(&rig, &workspace);
    let totals = report(case, &counted);
    let fresh = rig.bind(2);
    assert_eq!(fresh.snapshot().unwrap().effective_root, counted.root);
    let operation = fresh.operation().unwrap();
    model::assert_same(
        &expected,
        &model::canonical(operation.client(), counted.root),
        "fresh bind",
    );
    drop(operation);
    rig.close(&fresh);
    rig.close(&workspace);
    drop((fresh, workspace));
    rig.finish();
    totals
}

/// The twelve-step change of `product_commit_cost.rs`.
fn small_change(session: &mut Session<'_>) {
    session.all(&[
        Do::Write("a/one", 3, b"CHANGED"),
        Do::Create("a/new", 0o644),
        Do::Write("a/new", 0, b"new"),
        Do::Remove("gone/x"),
        Do::Rename("keep/inner", "keep/inner2"),
        Do::Rename("a/b", "keep/moved-b"),
        Do::Link("top.txt", "keep/top-alias"),
        Do::Symlink("keep/ln", b"inner2"),
        Do::Chmod("empty", 0o700),
        Do::Write("bulk/d-000/f-00", 0, b"CHANGED"),
        Do::Remove("bulk/d-001/f-01"),
        Do::Create("bulk/new", 0o644),
    ]);
}
/// One step of a development loop, shaped after the tier 1 reference case:
/// about ninety captured rows and twenty-seven files through the changed-file
/// constructor: twelve new, twelve edits of stored files and three whose mode
/// alone changed.
fn step_change(session: &mut Session<'_>) {
    // Twelve new files with their own bytes, six in each of two directories.
    for directory in 0..2 {
        for file in 0..6 {
            let path = format!("bulk/d-{directory:03}/t-{file:02}");
            session.apply(Do::Create(&path, 0o644));
            session.apply(Do::Write(
                &path,
                0,
                &noise((directory * 10 + file) as u64, 700),
            ));
        }
    }
    // Four stored 20,000-byte files replaced: truncated, then written whole.
    for file in 0..4 {
        let path = format!("mid/m-{file:03}");
        session.apply(Do::Truncate(&path, 0));
        session.apply(Do::Write(&path, 0, &noise(100 + file as u64, MID_BYTES)));
    }
    // Four appended to.
    for file in 5..9 {
        let path = format!("mid/m-{file:03}");
        session.apply(Do::Write(
            &path,
            MID_BYTES as u64,
            &noise(200 + file as u64, 200),
        ));
    }
    // Two overwritten in place, in the middle.
    for file in 10..12 {
        let path = format!("mid/m-{file:03}");
        session.apply(Do::Write(&path, 9_000, &noise(300 + file as u64, 64)));
    }
    // Two stored one-line files replaced.
    for file in 0..2 {
        let path = format!("bulk/d-004/f-{file:02}");
        session.apply(Do::Truncate(&path, 0));
        session.apply(Do::Write(&path, 0, b"replaced line\n"));
    }
    // Eighteen stored files removed, nine in each of two directories.
    for directory in 10..12 {
        for file in 0..9 {
            session.apply(Do::Remove(&format!("bulk/d-{directory:03}/f-{file:02}")));
        }
    }
    // One rename inside a directory and one across two.
    session.apply(Do::Rename("bulk/d-005/f-00", "bulk/d-005/r-00"));
    session.apply(Do::Rename("bulk/d-006/f-00", "bulk/d-007/r-00"));
    // Three mode changes, one new directory and one new symlink.
    for file in 0..3 {
        session.apply(Do::Chmod(&format!("bulk/d-008/f-{file:02}"), 0o600));
    }
    session.apply(Do::Mkdir("bulk/d-009/sub", 0o755));
    session.apply(Do::Symlink("bulk/d-009/ln", b"f-00"));
}
/// The 432-value change of `product_commit_cost.rs`, in 24 directories.
fn large_change(session: &mut Session<'_>) {
    for directory in 0..24 {
        let at = format!("bulk/d-{directory:03}");
        for file in 0..10 {
            let bytes = format!("changed {directory} {file}\n");
            session.apply(Do::Write(&format!("{at}/f-{file:02}"), 0, bytes.as_bytes()));
        }
        for file in 0..4 {
            let path = format!("{at}/n-{file:02}");
            let bytes = format!("created {directory} {file}\n");
            session.apply(Do::Create(&path, 0o644));
            session.apply(Do::Write(&path, 0, bytes.as_bytes()));
        }
        for file in [40, 41] {
            session.apply(Do::Remove(&format!("{at}/f-{file:02}")));
        }
        session.apply(Do::Chmod(&format!("{at}/f-20"), 0o711));
        let sub = format!("{at}/sub");
        session.apply(Do::Mkdir(&sub, 0o755));
        let inner = format!("{sub}/in");
        session.apply(Do::Create(&inner, 0o600));
        session.apply(Do::Write(&inner, 0, b"inside a new directory"));
    }
}

#[test]
fn record_jobs_of_three_commit_shapes_are_split_by_owner_kind_and_call() {
    let small = one("small", tree, small_change);
    let step = one("step", sized_tree, step_change);
    let large = one("large", tree, large_change);
    // Exact at this tree. A change of the record path restages these with
    // the counts it produces, never with a range.
    assert_eq!(
        small,
        Totals {
            record_jobs: 472,
            producer: 124,
            namespace: 324,
            file_plan: 24,
            edit_engine: 0,
            contains: 0,
            get: 357,
            apply: 70,
            first_keys: 2,
            keys_after: 43,
            applied_changes: 133,
            empty_windows: 22,
            reader_jobs: 72,
            workspace_statements: 628,
            lease_statements: 557,
            record_statements: 668,
            begin_statements: 76,
            commit_statements: 76,
        }
    );
    assert_eq!(
        step,
        Totals {
            record_jobs: 1_497,
            producer: 341,
            namespace: 1_011,
            file_plan: 145,
            edit_engine: 0,
            contains: 1,
            get: 1_200,
            apply: 256,
            first_keys: 2,
            keys_after: 38,
            applied_changes: 490,
            empty_windows: 20,
            reader_jobs: 222,
            workspace_statements: 1_989,
            lease_statements: 1_732,
            record_statements: 2_221,
            begin_statements: 262,
            commit_statements: 262,
        }
    );
    assert_eq!(
        large,
        Totals {
            record_jobs: 17_276,
            producer: 5_970,
            namespace: 8_714,
            file_plan: 2_592,
            edit_engine: 0,
            contains: 24,
            get: 14_600,
            apply: 2_566,
            first_keys: 2,
            keys_after: 84,
            applied_changes: 4_875,
            empty_windows: 20,
            reader_jobs: 1_980,
            workspace_statements: 21_836,
            lease_statements: 19_269,
            record_statements: 24_460,
            begin_statements: 2_572,
            commit_statements: 2_572,
        }
    );
}

/// One stored file edited and committed alone, for each size and edit: the
/// record jobs of that file's own scope, plan and edit engine apart.
#[test]
fn edit_engine_jobs_of_one_stored_file_by_size_and_edit() {
    let rig = Rig::new("commit-record-anatomy-engine", sized_tree);
    let workspace = rig.bind(1);
    let mut session = Session::new(&workspace, rig.base.clone());
    let sizes = [
        ("10B", "bulk/d-020/f-", 10_usize),
        ("20KB", "mid/m-0", MID_BYTES),
        ("300KB", "wide300/m-0", WIDE_BYTES),
        ("2MiB", "big/m-0", BIG_BYTES),
    ];
    let mut rows = Vec::new();
    for (label, prefix, bytes) in sizes {
        for (number, edit) in ["overwrite", "append", "replace", "truncate"]
            .into_iter()
            .enumerate()
        {
            let path = format!(
                "{prefix}{:02}",
                number + 20 * usize::from(bytes == MID_BYTES)
            );
            match edit {
                "overwrite" => session.apply(Do::Write(
                    &path,
                    bytes as u64 / 2,
                    &noise(7, 7.min(bytes / 2)),
                )),
                "append" => session.apply(Do::Write(&path, bytes as u64, &noise(8, 100))),
                "replace" => {
                    session.apply(Do::Truncate(&path, 0));
                    // One kernel WRITE carries a bounded window.
                    let data = noise(9 + bytes as u64, bytes);
                    for (window, piece) in data.chunks(65_536).enumerate() {
                        session.apply(Do::Write(&path, window as u64 * 65_536, piece));
                    }
                }
                _ => session.apply(Do::Truncate(&path, bytes as u64 / 2)),
            }
            let counted = commit_counted(&rig, &workspace);
            let files = counted.seen.files();
            assert_eq!(files.len(), 1, "{label} {edit}: one changed file");
            let (scope, (plan, engine)) = files.into_iter().next().unwrap();
            evidence(format_args!(
                "COMMIT_RECORD_ANATOMY_ENGINE size={label} edit={edit} plan_jobs={plan} engine_jobs={engine} commit_record_jobs={} run_steps={} kinds:{}",
                counted.seen.record_jobs(),
                counted.seen.reads.get("captured_run_step").copied().unwrap_or(0),
                table(counted.seen.file(scope))
            ));
            rows.push((label, edit, plan, engine));
        }
    }
    // (plan jobs, edit-engine jobs) of the one file's scope. A final length
    // the policy represents as one whole-file object never reaches the
    // engine; a chunked one costs the same at 300,000 bytes and at 2 MiB.
    let whole = [(6, 0); 4];
    let chunked = [(6, 49), (6, 19), (6, 13), (6, 17)];
    let expected = [whole, whole, chunked, chunked].concat();
    assert_eq!(
        rows.iter().map(|row| (row.2, row.3)).collect::<Vec<_>>(),
        expected,
        "{rows:?}"
    );
    let expected = session.model.flat();
    let root = workspace.snapshot().unwrap().effective_root;
    let fresh = rig.bind(2);
    let operation = fresh.operation().unwrap();
    model::assert_same(
        &expected,
        &model::canonical(operation.client(), root),
        "fresh bind",
    );
    drop(operation);
    drop(session);
    rig.close(&fresh);
    rig.close(&workspace);
    drop((fresh, workspace));
    rig.finish();
}
