//! #355: merges past the former merge caps. A3: moving a directory with more
//! descendants than the former in-memory build budget (65,536 topology
//! entries) builds a new directory holding all of them in the merged root.
//! The build keeps its state in merge records in the Store file. Until the
//! merge path cap goes (#355 (d)), a move of `n` files makes about `2n`
//! candidate paths, so this checks a move past the budget and under that cap.
#[path = "support/installed_store.rs"]
#[allow(dead_code)]
mod installed;
#[path = "support/sdk.rs"]
#[allow(dead_code)]
mod support;

use layerfs_bridge::control::SdkValue;
use std::fs;
use std::time::Instant;
use support::{write, Fixture};

/// The former in-memory build budget.
const BUDGET: usize = 65_536;

fn text(value: &str) -> SdkValue {
    SdkValue::text(value)
}

fn stat(fixture: &Fixture, path: &str) -> Option<String> {
    fixture
        .try_call(
            "fs.stat",
            vec![("branch", text("merged")), ("path", text(path))],
        )
        .ok()
        .and_then(|value| value.get_text("type").map(str::to_owned))
}

/// Merge owners and records left in the Store file.
fn scratch(fixture: &Fixture) -> (i64, i64) {
    let sql = rusqlite::Connection::open(&fixture.host.config.path).unwrap();
    let count = |table: &str| {
        sql.query_row(&format!("SELECT count(*) FROM {table}"), [], |r| r.get(0))
            .unwrap()
    };
    (count("merge_operation"), count("merge_record"))
}

fn moved(label: &str, count: usize) {
    let start = Instant::now();
    let fixture = Fixture::new(label, |source| {
        let big = source.join("big");
        fs::create_dir(&big).unwrap();
        for n in 0..count {
            fs::write(big.join(format!("f{n:07}")), b"").unwrap();
        }
        fs::write(source.join("small.txt"), b"small\n").unwrap();
        count + 2
    });
    let built = start.elapsed();
    fixture.fork("left");
    fixture.fork("right");
    let mv = SdkValue::map([
        ("op", text("mv")),
        ("from", text("/big")),
        ("to", text("/moved")),
    ]);
    fixture.apply("left", vec![mv]);
    fixture.apply("right", vec![write("/small.txt", "small, changed\n")]);
    let before = fixture.work();
    let records = fixture.service.store.merge_record_work();
    let merge_start = Instant::now();
    let merged = fixture.try_call(
        "branch.merge",
        vec![
            ("branch", text("left")),
            ("with", text("right")),
            ("name", text("merged")),
        ],
    );
    let merge_ms = merge_start.elapsed().as_millis();
    let mut records_after = fixture.service.store.merge_record_work();
    records_after.reads -= records.reads;
    records_after.writes -= records.writes;
    records_after.write_ns -= records.write_ns;
    println!(
        "SDK_MERGE_A3 moved={count} init_ms={} merge_ms={merge_ms} records={records_after:?} work={:?} kind={:?}",
        built.as_millis(),
        fixture.since(before),
        merged.as_ref().map(|value| value.get_text("kind")),
    );
    assert_eq!(scratch(&fixture), (0, 0), "the merge removed its records");
    let merged = merged.expect("the move merges");
    assert_eq!(merged.get_text("kind"), Some("Merged"));
    assert_eq!(stat(&fixture, "/big"), None);
    assert_eq!(stat(&fixture, "/moved").as_deref(), Some("dir"));
    for n in [0, count / 2, count - 1] {
        let path = format!("/moved/f{n:07}");
        assert_eq!(stat(&fixture, &path).as_deref(), Some("file"), "{path}");
    }
    let small = fixture.call(
        "fs.read",
        vec![("branch", text("merged")), ("path", text("/small.txt"))],
    );
    assert_eq!(small.get_text("text"), Some("small, changed\n"));
    fixture.cleanup();
}

#[test]
fn a3_directory_move_past_the_former_budget() {
    moved("sdk-merge-a3", BUDGET + 34_464);
}

/// A refused merge removes its records too.
#[test]
fn a_conflicted_merge_leaves_no_records() {
    let fixture = Fixture::new("sdk-merge-records", |source| {
        fs::write(source.join("small.txt"), b"small\n").unwrap();
        1
    });
    fixture.fork("left");
    fixture.fork("right");
    fixture.apply("left", vec![write("/small.txt", "left\n")]);
    fixture.apply("right", vec![write("/small.txt", "right\n")]);
    let refused = fixture
        .try_call(
            "branch.merge",
            vec![
                ("branch", text("left")),
                ("with", text("right")),
                ("name", text("merged")),
            ],
        )
        .expect_err("both sides changed the file");
    assert_eq!(refused.code, "Conflict");
    assert!(fixture.service.store.merge_record_work().writes > 0);
    assert_eq!(scratch(&fixture), (0, 0));
    fixture.cleanup();
}
