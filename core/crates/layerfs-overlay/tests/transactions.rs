//! Public proofs that an atomic job begins at its first writing statement,
//! pays physical admission only then, and mints engine-wide owner identities.
mod payload_support;
use layerfs_overlay::*;
use payload_support::Temp;

const CONTROL: [StatementKind; 4] = [
    StatementKind::Startup,
    StatementKind::Begin,
    StatementKind::Commit,
    StatementKind::Rollback,
];
fn key(number: u64) -> IndexedOperationRecordKey {
    let mut key = [0; 32];
    key[24..].copy_from_slice(&number.to_be_bytes());
    IndexedOperationRecordKey { kind: 1, key }
}
fn change(
    number: u64,
    expected: Option<&[u8]>,
    value: Option<&[u8]>,
) -> IndexedOperationRecordChange {
    IndexedOperationRecordChange {
        key: key(number),
        expected: match expected {
            Some(bytes) => OperationRecordExpectedValue::ExactBytes(bytes.to_vec()),
            None => OperationRecordExpectedValue::Missing,
        },
        value: value.map(<[u8]>::to_vec),
    }
}
fn scope(db: &Overlay, tag: u8) -> IndexedOperationRecordScope {
    let route = db.open_workspace([tag; 32], [tag + 1; 32]).unwrap();
    IndexedOperationRecordScope {
        owner: db.acquire_operation(route, 1).unwrap(),
        file_scope: 0,
    }
}
fn applied(
    db: &Overlay,
    scope: IndexedOperationRecordScope,
    changes: &[IndexedOperationRecordChange],
) {
    assert_eq!(
        db.indexed_operation_record_apply(scope, changes).unwrap(),
        IndexedOperationRecordApply::Applied
    );
}
fn file() -> Inode {
    Inode {
        serial: 2,
        kind: InodeKind::File,
        mode: 0o644,
        mtime_seconds: 4,
        mtime_nanoseconds: 5,
        nlink: 1,
        size: 7,
        inherited_cutoff: 0,
        born: 0,
        entries: 0,
        subdirs: 0,
    }
}

/// The engine asks SQLite whether a prepared statement can write. These are
/// the answers of the linked SQLite that the lazy BEGIN depends on.
#[test]
fn linked_sqlite_classifies_reads_and_writes_as_the_engine_expects() {
    let connection = rusqlite::Connection::open_in_memory().unwrap();
    connection.execute_batch("CREATE TABLE t(a)").unwrap();
    for (sql, readonly) in [
        ("SELECT a FROM t", true),
        ("PRAGMA main.freelist_count", true),
        ("PRAGMA main.page_count", true),
        ("EXPLAIN QUERY PLAN SELECT a FROM t", true),
        ("COMMIT", true),
        ("ROLLBACK", true),
        ("BEGIN IMMEDIATE", false),
        ("INSERT INTO t VALUES(1)", false),
        ("UPDATE t SET a=2 WHERE a=0", false),
        ("DELETE FROM t WHERE a=0", false),
        ("INSERT INTO t VALUES(1) RETURNING a", false),
    ] {
        assert_eq!(
            connection.prepare(sql).unwrap().readonly(),
            readonly,
            "{sql}"
        );
    }
}

#[test]
fn a_read_only_atomic_job_begins_commits_and_admits_nothing() {
    let temp = Temp::new();
    let db = temp.db();
    let scope = scope(&db, 1);
    applied(&db, scope, &[change(1, None, Some(b"one"))]);
    let sql = db.diagnostics();
    let physical = db.allocation_work();
    // The guard does not hold, so the job reads and changes nothing.
    assert_eq!(
        db.indexed_operation_record_apply(scope, &[change(1, None, Some(b"two"))])
            .unwrap(),
        IndexedOperationRecordApply::NotApplied {
            index: 0,
            key: key(1),
            actual: Some(b"one".to_vec()),
        }
    );
    let work = db.diagnostics().since(&sql);
    for kind in CONTROL {
        assert_eq!(
            work.statements[kind as usize],
            StatementWork::default(),
            "{kind:?}"
        );
    }
    assert!(work.total().executions > 0);
    assert_eq!(work.total().rows_changed, 0);
    assert_eq!(
        db.allocation_work().since(physical),
        AllocationWork::default()
    );
    assert_eq!(
        db.indexed_operation_record_get(scope, key(1)).unwrap(),
        Some(b"one".to_vec())
    );
}

#[test]
fn reads_then_writes_are_one_transaction_begun_at_the_first_write() {
    let temp = Temp::new();
    let db = temp.db();
    let scope = scope(&db, 3);
    applied(&db, scope, &[change(1, None, Some(b"one"))]);
    let sql = db.diagnostics();
    let physical = db.allocation_work();
    // Both guards are read before the first write. They see the state the
    // transaction then changes: one present value and one missing key.
    applied(
        &db,
        scope,
        &[
            change(1, Some(b"one"), Some(b"two")),
            change(2, None, Some(b"three")),
        ],
    );
    let work = db.diagnostics().since(&sql);
    let executions = |kind: StatementKind| work.statements[kind as usize].executions;
    assert_eq!(executions(StatementKind::Begin), 1);
    assert_eq!(executions(StatementKind::Commit), 1);
    assert_eq!(executions(StatementKind::Rollback), 0);
    // Ordinary writes perform no capacity statement.
    assert_eq!(executions(StatementKind::Startup), 0);
    let admission = db.allocation_work().since(physical);
    assert_eq!(admission.freelist_queries, 0);
    assert_eq!(admission.admitted_jobs, 0);
    assert_eq!(admission.refusals, 0);
    assert!(admission.attempts <= 1);
    assert_eq!(admission.observations, 0);
    assert_eq!(
        db.indexed_operation_record_get(scope, key(1)).unwrap(),
        Some(b"two".to_vec())
    );
    assert_eq!(
        db.indexed_operation_record_get(scope, key(2)).unwrap(),
        Some(b"three".to_vec())
    );
}

#[test]
fn a_failure_after_the_first_write_rolls_back_and_one_before_it_has_nothing_to_roll_back() {
    let temp = Temp::new();
    let db = temp.db();
    let route = db.open_workspace([5; 32], [6; 32]).unwrap();
    let mount = db.create_native_mount(route, 1).unwrap();
    let released = db.acquire_base_source(route, 7).unwrap();
    db.release_base_source(released).unwrap();
    let ticket = db.publish(route, &file(), None, None).unwrap();
    let revision = db.state(route).unwrap().revision;
    let sql = db.diagnostics();
    let physical = db.allocation_work();
    // A publishing visit writes its inode and advances the frontier. The
    // kernel custody it then claims names an inode that is not among its
    // finals, so the job fails after its writes and they are rolled back.
    assert!(matches!(
        db.mutate_native_visit(mount, 9, 1, None, |_, _| {
            Ok(Some((
                Changes {
                    inodes: vec![Inode {
                        serial: 3,
                        ..file()
                    }],
                    ..Changes::default()
                },
                NativeEffect::Entry {
                    serial: 4,
                    parent: 1,
                    directory: false,
                },
            )))
        }),
        Err(OverlayError::Invalid("native entry final"))
    ));
    let work = db.diagnostics().since(&sql);
    let executions = |kind: StatementKind| work.statements[kind as usize].executions;
    assert_eq!(executions(StatementKind::Begin), 1);
    assert_eq!(executions(StatementKind::Rollback), 1);
    assert_eq!(executions(StatementKind::Commit), 0);
    assert!(work.total().rows_changed > 0);
    let admission = db.allocation_work().since(physical);
    assert_eq!(admission.admitted_jobs, 0);
    // Only failure completion observes physical state.
    assert_eq!(admission.observations, 1);
    // Neither the frontier advance nor the inode survived, and the ticket
    // the failed job issued in memory went with them: only the earlier
    // publication is still owed.
    // The failed job's frontier advance returned the advanced row and the
    // engine remembered it. The rollback forgot it: the row is read again
    // by one statement and holds the earlier revision.
    let read = db.diagnostics();
    assert_eq!(db.state(route).unwrap().revision, revision);
    let read = db.diagnostics().since(&read);
    assert_eq!(
        read.statements[StatementKind::Workspace as usize].attempts,
        1
    );
    assert_eq!(read.total().attempts, 1);
    // Remembered again, it is no statement.
    let read = db.diagnostics();
    assert_eq!(db.state(route).unwrap().revision, revision);
    assert_eq!(db.diagnostics().since(&read).total().attempts, 0);
    assert_eq!(db.inode(route, 3).unwrap(), None);
    assert_eq!(db.pending_publications(route, 0).unwrap(), vec![ticket]);

    // The ticket is still owed and settles exactly once afterwards.
    assert_eq!(db.pending_publications(route, 0).unwrap(), vec![ticket]);
    assert_eq!(db.resources(Some(route)).unwrap().counts.reply_tickets, 1);
    assert!(matches!(
        db.capture(route),
        Err(OverlayError::ReplyAttemptsPending)
    ));
    assert!(!db.capture_ready(route).unwrap());
    db.reply_attempted(ticket).unwrap();
    assert!(db.pending_publications(route, 0).unwrap().is_empty());
    assert!(db.capture_ready(route).unwrap());
    assert!(matches!(
        db.reply_attempted(ticket),
        Err(OverlayError::Stale)
    ));

    let scope = IndexedOperationRecordScope {
        owner: db.acquire_operation(route, 1).unwrap(),
        file_scope: 0,
    };
    db.release_operation(scope.owner).unwrap();
    let sql = db.diagnostics();
    let physical = db.allocation_work();
    // The released owner fails the job in its reads, before any write.
    assert!(matches!(
        db.indexed_operation_record_apply(scope, &[change(1, None, Some(b"one"))]),
        Err(OverlayError::Stale)
    ));
    let work = db.diagnostics().since(&sql);
    for kind in CONTROL {
        assert_eq!(
            work.statements[kind as usize],
            StatementWork::default(),
            "{kind:?}"
        );
    }
    assert!(work.total().executions > 0);
    assert_eq!(work.total().rows_changed, 0);
    assert_eq!(
        db.allocation_work().since(physical),
        AllocationWork::default()
    );
}

#[test]
fn consecutive_writes_do_no_capacity_observation_or_reservation() {
    let temp = Temp::new();
    let db = temp.db();
    let scope = scope(&db, 7);
    applied(&db, scope, &[change(1, None, Some(b"one"))]);
    let length = db.allocation().unwrap().logical_bytes;
    let physical = db.allocation_work();
    applied(&db, scope, &[change(1, Some(b"one"), Some(b"two"))]);
    assert_eq!(
        db.allocation_work().since(physical),
        AllocationWork::default()
    );
    applied(&db, scope, &[change(1, Some(b"two"), Some(b"six"))]);
    assert_eq!(
        db.allocation_work().since(physical),
        AllocationWork::default()
    );
    let after = db.allocation().unwrap();
    assert_eq!(after.logical_bytes, length);
    assert_eq!(after.reserved_tail_bytes, 0);
    assert_eq!(after.cleanup_headroom_bytes, 0);
}
