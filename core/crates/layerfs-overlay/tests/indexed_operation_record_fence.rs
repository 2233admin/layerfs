//! The fence of every indexed operation_record job: which refusal it returns
//! for a stale route, a closed Workspace and a released owner, which of them
//! wins when several hold, and the statements one job executes by family.
mod payload_support;
use layerfs_overlay::*;
use payload_support::Temp;

fn key(kind: u32, number: u64) -> IndexedOperationRecordKey {
    let mut key = [0; 32];
    key[24..].copy_from_slice(&number.to_be_bytes());
    IndexedOperationRecordKey { kind, key }
}
fn put(key: IndexedOperationRecordKey, value: Vec<u8>) -> IndexedOperationRecordChange {
    IndexedOperationRecordChange {
        key,
        expected: OperationRecordExpectedValue::Missing,
        value: Some(value),
    }
}
fn scope(db: &Overlay, tag: u8) -> IndexedOperationRecordScope {
    let route = db.open_workspace([tag; 32], [tag + 1; 32]).unwrap();
    IndexedOperationRecordScope {
        owner: db.acquire_operation(route, 1).unwrap(),
        file_scope: 7,
    }
}

/// The seven jobs of the record service, in the order of the daemon's command.
const JOBS: [&str; 7] = [
    "contains",
    "get",
    "get_many",
    "apply",
    "first_keys",
    "first_keys_all",
    "keys_after",
];
/// One attempt of one job. `fresh` numbers the key an apply writes, so that a
/// repeated apply never fails its own precondition.
fn attempt(
    db: &Overlay,
    scope: IndexedOperationRecordScope,
    job: &str,
    fresh: u64,
) -> OverlayResult<()> {
    match job {
        "contains" => db
            .indexed_operation_record_contains(scope, key(1, 0))
            .map(drop),
        "get" => db.indexed_operation_record_get(scope, key(1, 0)).map(drop),
        "get_many" => db
            .indexed_operation_record_get_many(scope, &[key(1, 0), key(1, 1)])
            .map(drop),
        "apply" => db
            .indexed_operation_record_apply(scope, &[put(key(2, fresh), vec![1])])
            .map(|applied| assert_eq!(applied, IndexedOperationRecordApply::Applied)),
        "first_keys" => db
            .indexed_operation_record_first_keys(scope, 1, key(1, 9).key)
            .map(drop),
        "first_keys_all" => db.indexed_operation_record_keys(scope, 1, None).map(drop),
        "keys_after" => db
            .indexed_operation_record_keys_after(scope, 1, Some(key(1, 0).key))
            .map(drop),
        other => panic!("{other}"),
    }
}
/// The refusal kind of each job, in `JOBS` order.
fn refusals(db: &Overlay, scope: IndexedOperationRecordScope, fresh: u64) -> [&'static str; 7] {
    std::array::from_fn(
        |job| match attempt(db, scope, JOBS[job], fresh + job as u64) {
            Ok(()) => "ok",
            Err(OverlayError::Stale) => "stale",
            Err(OverlayError::Closed) => "closed",
            Err(other) => panic!("{}: {other:?}", JOBS[job]),
        },
    )
}
/// Statements one attempt issues by family: Workspace, Lease, OperationRecord,
/// Begin, Commit, and the free-list read of a write's admission (Startup).
/// These are the engine's own attempts, not SQLite's run counter, which also
/// counts the accounting trigger of an insert.
fn statements(
    db: &Overlay,
    scope: IndexedOperationRecordScope,
    job: &str,
    fresh: u64,
) -> (OverlayResult<()>, [u64; 6]) {
    let before = db.diagnostics();
    let result = attempt(db, scope, job, fresh);
    let work = db.diagnostics().since(&before);
    let family = |kind: StatementKind| work.statements[kind as usize].attempts;
    (
        result,
        [
            family(StatementKind::Workspace),
            family(StatementKind::Lease),
            family(StatementKind::OperationRecord),
            family(StatementKind::Begin),
            family(StatementKind::Commit),
            family(StatementKind::Startup),
        ],
    )
}

#[test]
fn each_job_refuses_a_stale_route_then_a_closed_write_then_a_released_owner() {
    let temp = Temp::new();
    let db = temp.db();
    // Another engine's route names a namespace this engine may also have.
    let elsewhere = Temp::new();
    let other = elsewhere.db();
    let foreign = scope(&other, 31);

    // Open Workspace, held owner: every job is served.
    let held = scope(&db, 31);
    assert_eq!(
        foreign.owner.route().namespace(),
        held.owner.route().namespace()
    );
    db.indexed_operation_record_apply(held, &[put(key(1, 0), vec![5])])
        .unwrap();
    assert_eq!(refusals(&db, held, 100), ["ok"; 7]);
    // A route of another engine is stale for every job, before anything else.
    assert_eq!(refusals(&db, foreign, 200), ["stale"; 7]);

    // Open Workspace, released owner: every job is stale.
    let released = scope(&db, 41);
    db.release_operation(released.owner).unwrap();
    assert_eq!(refusals(&db, released, 300), ["stale"; 7]);

    // Closed Workspace, held owner: existing custody stays readable and only
    // the write is refused, as closed.
    db.close(held.owner.route()).unwrap();
    assert_eq!(
        refusals(&db, held, 400),
        ["ok", "ok", "ok", "closed", "ok", "ok", "ok"]
    );
    // Closed Workspace, released owner: the write is still refused as closed,
    // not as stale, and every read is stale.
    db.release_operation(held.owner).unwrap();
    assert_eq!(
        refusals(&db, held, 500),
        ["stale", "stale", "stale", "closed", "stale", "stale", "stale"]
    );

    // Connection disposal consumes the complete Workspace file instead of
    // deleting its row and continuing to run commands through this engine.
    assert_eq!(
        db.cleanup_state(held.owner.route()).unwrap(),
        CleanupState::Queued
    );
    db.close_database().unwrap();
}

#[test]
fn each_job_executes_a_fixed_number_of_fence_statements() {
    let temp = Temp::new();
    let db = temp.db();
    let held = scope(&db, 51);
    db.indexed_operation_record_apply(held, &[put(key(1, 0), vec![5])])
        .unwrap();
    // Workspace, Lease, OperationRecord, Begin, Commit, free-list read.
    // A read is its one fence statement and one record statement. A write of
    // one change is its fence, the guard read and the put inside one
    // transaction. The fence is counted with the Workspace family.
    let expected = [
        ("contains", [1, 0, 1, 0, 0, 0]),
        ("get", [1, 0, 1, 0, 0, 0]),
        // Two keys: one fence, one read for each key.
        ("get_many", [1, 0, 2, 0, 0, 0]),
        ("apply", [1, 0, 2, 1, 1, 0]),
        ("first_keys", [1, 0, 1, 0, 0, 0]),
        ("first_keys_all", [1, 0, 1, 0, 0, 0]),
        ("keys_after", [1, 0, 1, 0, 0, 0]),
    ];
    for (number, (job, families)) in expected.into_iter().enumerate() {
        let (result, counted) = statements(&db, held, job, 100 + number as u64);
        assert!(result.is_ok(), "{job}: {result:?}");
        assert_eq!(counted, families, "{job}");
    }
    // A write refused as closed has run its fence and nothing else: no
    // transaction.
    db.close(held.owner.route()).unwrap();
    let (result, counted) = statements(&db, held, "apply", 200);
    assert!(matches!(result, Err(OverlayError::Closed)), "{result:?}");
    assert_eq!(counted, [1, 0, 0, 0, 0, 0]);
    // A read refused for a released owner has run its fence alone.
    db.release_operation(held.owner).unwrap();
    let (result, counted) = statements(&db, held, "get", 300);
    assert!(matches!(result, Err(OverlayError::Stale)), "{result:?}");
    assert_eq!(counted, [1, 0, 0, 0, 0, 0]);
}

#[test]
fn the_fence_statements_are_point_searches() {
    let temp = Temp::new();
    let db = temp.db();
    let held = scope(&db, 61);
    let plans = db.explain_lifetimes(held.owner.route()).unwrap();
    for plan in &plans {
        println!("INDEXED_OPERATION_RECORD_FENCE_PLAN {plan}");
    }
    // The fence is two point searches and nothing else: the Workspace row by
    // its key, and the owner row by its key.
    let operation = plans
        .iter()
        .filter(|plan| plan.starts_with("operation-fence:"))
        .collect::<Vec<_>>();
    assert_eq!(operation.len(), 3, "{plans:?}");
    assert!(operation
        .iter()
        .any(|plan| plan.contains("SEARCH workspace")));
    assert!(operation
        .iter()
        .any(|plan| plan.contains("SEARCH operation_owner")));
    for plan in operation {
        assert!(
            plan.contains("SEARCH") || plan.contains("SCALAR SUBQUERY"),
            "{plan}"
        );
        assert!(
            !plan.contains("SCAN") && !plan.contains("TEMP B-TREE"),
            "{plan}"
        );
    }
}

#[test]
fn several_keys_are_read_under_one_fence_in_the_order_asked() {
    let temp = Temp::new();
    let db = temp.db();
    let held = scope(&db, 71);
    db.indexed_operation_record_apply(held, &[put(key(1, 0), vec![5])])
        .unwrap();
    db.indexed_operation_record_apply(held, &[put(key(3, 7), vec![9; 100])])
        .unwrap();
    // The order asked, not key order; an absent key is its own answer.
    let asked = [key(3, 7), key(9, 9), key(1, 0)];
    assert_eq!(
        db.indexed_operation_record_get_many(held, &asked).unwrap(),
        [Some(vec![9; 100]), None, Some(vec![5])]
    );
    for (position, one) in asked.into_iter().enumerate() {
        assert_eq!(
            db.indexed_operation_record_get(held, one).unwrap(),
            db.indexed_operation_record_get_many(held, &[one])
                .unwrap()
                .pop()
                .unwrap(),
            "{position}"
        );
    }
    // No key is no read: the fence alone.
    let before = db.diagnostics();
    assert!(db
        .indexed_operation_record_get_many(held, &[])
        .unwrap()
        .is_empty());
    let work = db.diagnostics().since(&before);
    assert_eq!(
        (
            work.statements[StatementKind::Workspace as usize].attempts,
            work.statements[StatementKind::OperationRecord as usize].attempts
        ),
        (1, 0)
    );
    // The list is bounded, and refused before any statement.
    let many = (0..65).map(|number| key(1, number)).collect::<Vec<_>>();
    let before = db.diagnostics();
    assert!(matches!(
        db.indexed_operation_record_get_many(held, &many),
        Err(OverlayError::Invalid("indexed operation_record key list"))
    ));
    let work = db.diagnostics().since(&before);
    assert_eq!(
        work.statements[StatementKind::Workspace as usize].attempts,
        0
    );
    assert_eq!(
        db.indexed_operation_record_get_many(held, &many[..64])
            .unwrap()
            .len(),
        64
    );
    // The values of one job share one record envelope. Two values that each
    // fit it but together do not are refused; each is still readable alone.
    for number in [20, 21] {
        db.indexed_operation_record_apply(held, &[put(key(5, number), vec![7; 40_000])])
            .unwrap();
    }
    assert!(matches!(
        db.indexed_operation_record_get_many(held, &[key(5, 20), key(5, 21)]),
        Err(OverlayError::Invalid("indexed operation_record values"))
    ));
    for number in [20, 21] {
        assert_eq!(
            db.indexed_operation_record_get_many(held, &[key(5, number)])
                .unwrap(),
            [Some(vec![7; 40_000])]
        );
    }
}
