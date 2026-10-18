//! #355: merge build records in the Store file. Each merge sees only its own
//! records, guarded batches apply whole or not at all, `end` removes them,
//! and a writable open removes only owners idle past the lease; a removed
//! owner's later calls fail rather than read its records as absent. Batches
//! wait in a bounded buffer until it is full or a key window is asked.
mod support;
use layerfs_content::{
    EditRecordApply, EditRecordChange, EditRecordExpected, EditRecordKey, IndexedEditBacking,
};
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile, BUFFER_BYTES};
use layerfs_storage::port::PersistenceError;
use support::*;

fn writable(path: &std::path::Path) -> Handles {
    Handles::open_writable(
        PersistenceConfig::sqlite(path).with_sqlite_profile(SqlitePersistenceProfile::Disposable),
        BINDING,
        [71; 32],
    )
    .expect("open writable")
}

fn key(kind: u32, n: u8) -> EditRecordKey {
    EditRecordKey { kind, key: [n; 32] }
}

fn put(n: u8, value: &[u8]) -> EditRecordChange {
    EditRecordChange {
        key: key(1, n),
        expected: EditRecordExpected::Missing,
        value: Some(value.to_vec()),
    }
}

fn rows(path: &std::path::Path) -> (i64, i64) {
    let sql = rusqlite::Connection::open(path).unwrap();
    let count = |table: &str| {
        sql.query_row(&format!("SELECT count(*) FROM {table}"), [], |r| r.get(0))
            .unwrap()
    };
    (count("merge_operation"), count("merge_record"))
}

#[test]
fn records_are_private_guarded_and_removed() {
    let t = Temp::new("merge-records");
    let path = t.join("db");
    drop(create(&path));
    let handles = writable(&path);
    let scratch = handles.storage.merge_scratch();
    let mut a = scratch.begin().unwrap();
    let mut b = scratch.begin().unwrap();
    assert_eq!(
        a.apply(vec![put(1, b"one"), put(2, b"two"), put(3, b"")])
            .unwrap(),
        EditRecordApply::Applied
    );
    assert_eq!(a.get(key(1, 2)).unwrap(), Some(b"two".to_vec()));
    assert_eq!(a.get(key(1, 3)).unwrap(), Some(Vec::new()));
    assert!(!a.contains(key(2, 1)).unwrap());
    assert_eq!(b.get(key(1, 1)).unwrap(), None, "records are per merge");
    // A failed guard changes nothing and reports the deciding record.
    let refused = a
        .apply(vec![
            EditRecordChange {
                key: key(1, 1),
                expected: EditRecordExpected::ExactBytes(b"one".to_vec()),
                value: None,
            },
            put(2, b"again"),
        ])
        .unwrap();
    assert_eq!(
        refused,
        EditRecordApply::NotApplied {
            index: 1,
            key: key(1, 2),
            actual: Some(b"two".to_vec()),
        }
    );
    assert!(a.contains(key(1, 1)).unwrap());
    assert_eq!(
        a.first_keys(1, None).unwrap(),
        vec![[1; 32], [2; 32], [3; 32]]
    );
    assert_eq!(
        a.first_keys(1, Some([1; 32])).unwrap(),
        vec![[2; 32], [3; 32]]
    );
    assert_eq!(a.keys_after(1, Some([2; 32])).unwrap(), vec![[3; 32]]);
    assert!(a.keys_after(2, None).unwrap().is_empty());
    let many: Vec<_> = (10..80).map(|n| put(n, &[n])).collect();
    assert_eq!(a.apply(many).unwrap(), EditRecordApply::Applied);
    assert_eq!(a.keys_after(1, None).unwrap().len(), 64, "one window");
    b.apply(vec![put(9, b"b")]).unwrap();
    assert_eq!(
        rows(&path).1,
        73,
        "a key window flushed a's buffer; b's is pending"
    );
    assert!(b.keys_after(1, None).unwrap().len() == 1);
    // Past the buffer's bytes a batch flushes without a key window.
    let mut c = scratch.begin().unwrap();
    let big = vec![7; BUFFER_BYTES / 4];
    for n in 0..4 {
        c.apply(vec![put(n, &big)]).unwrap();
    }
    assert_eq!(rows(&path).1, 78);
    assert_eq!(
        c.get_many(&[key(1, 0), key(1, 9)]).unwrap(),
        vec![Some(big), None]
    );
    c.end().unwrap();
    assert!(a.failure().is_none());
    let work = a.end().unwrap();
    assert!(
        work.writes >= 4 && work.reads > 0 && work.max_write_ns <= work.write_ns,
        "{work:?}"
    );
    assert_eq!(rows(&path), (1, 1), "only the other merge remains");
    b.end().unwrap();
    assert_eq!(rows(&path), (0, 0));
}

#[test]
fn open_sweeps_only_idle_owners() {
    let t = Temp::new("merge-records-sweep");
    let path = t.join("db");
    drop(create(&path));
    let handles = writable(&path);
    let scratch = handles.storage.merge_scratch();
    let mut idle = scratch.begin().unwrap();
    let mut live = scratch.begin().unwrap();
    idle.apply((1..=5).map(|n| put(n, b"x")).collect()).unwrap();
    live.apply(vec![put(1, b"live")]).unwrap();
    // Key windows write each buffer to the file.
    idle.keys_after(1, None).unwrap();
    live.keys_after(1, None).unwrap();
    {
        let sql = rusqlite::Connection::open(&path).unwrap();
        // The first owner made no call for longer than the lease.
        sql.execute(
            "UPDATE merge_operation SET touched=0 WHERE operation=(SELECT min(operation) FROM merge_operation)",
            [],
        )
        .unwrap();
    }
    let reopened = writable(&path);
    assert_eq!(
        rows(&path),
        (1, 1),
        "the idle owner and its records are gone"
    );
    assert!(
        idle.get(key(1, 1)).is_err(),
        "a removed owner never reads absence"
    );
    assert_eq!(idle.failure(), Some(&PersistenceError::Missing));
    assert!(
        idle.get(key(1, 2)).is_err(),
        "the first failure ends its calls"
    );
    assert_eq!(live.get(key(1, 1)).unwrap(), Some(b"live".to_vec()));
    assert_eq!(idle.end().err(), Some(PersistenceError::Missing));
    live.end().unwrap();
    drop(reopened);
    assert_eq!(rows(&path), (0, 0));
}
