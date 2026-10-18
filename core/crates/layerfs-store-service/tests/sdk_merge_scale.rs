//! #355: merges past the former merge caps. A3: moving a directory with more
//! descendants than the former in-memory build budget (65,536 topology
//! entries) builds a new directory holding all of them in the merged root.
//! A move of `n` files makes about `2n` candidate paths; past the former path
//! cap (262,144) the merge keeps its paths in sorted runs in the merge's
//! records (#355 (d)).
//!
//! The larger moves reuse a prepared Store (AGENTS section 2): run
//! `prepare_a3_fixtures` once with `LAYERFS_355_FIXTURES` set to a directory;
//! it writes each missing `a3-<files>.sqlite`, closed, with the move and the small change
//! on two Branches. Each merge test copies one and merges the copy, so only
//! the merge runs in its process.
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

/// A Store holding `count` empty files in `/big`, with `left` moving `/big`
/// to `/moved` and `right` changing `/small.txt`.
fn prepare(label: &str, count: usize) -> Fixture {
    let fixture = Fixture::new(label, |source| {
        let big = source.join("big");
        fs::create_dir(&big).unwrap();
        for n in 0..count {
            fs::write(big.join(format!("f{n:07}")), b"").unwrap();
        }
        fs::write(source.join("small.txt"), b"small\n").unwrap();
        count + 2
    });
    fixture.fork("left");
    fixture.fork("right");
    let mv = SdkValue::map([
        ("op", text("mv")),
        ("from", text("/big")),
        ("to", text("/moved")),
    ]);
    fixture.apply("left", vec![mv]);
    fixture.apply("right", vec![write("/small.txt", "small, changed\n")]);
    fixture
}

fn fixtures() -> std::path::PathBuf {
    std::env::var_os("LAYERFS_355_FIXTURES")
        .expect("LAYERFS_355_FIXTURES names the prepared fixtures")
        .into()
}

/// An independent copy of the prepared Store for `count` files.
fn prepared(label: &str, count: usize) -> Fixture {
    let store = fixtures().join(format!("a3-{count}.sqlite"));
    assert!(store.exists(), "run prepare_a3_fixtures first: {store:?}");
    Fixture::open(installed::Fixture::cloned(label, &store, count + 2))
}

/// Merges `left` with `right` and checks the merged tree.
fn merge_moved(fixture: Fixture, count: usize) {
    let before = fixture.work();
    let writer = || {
        let writer = fixture.service.opened.diagnostics().unwrap().writer;
        (writer.write_transactions, writer.transaction_ns)
    };
    let writer_before = writer();
    let records = fixture.service.store.merge_record_work();
    let recording = layerfs_store_service::telemetry::Recording::start();
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
    let writer_after = writer();
    // The publish's own write: its writer hold, and the merge's whole lane.
    let publish_us = recording
        .finish()
        .iter()
        .filter_map(|report| report.root())
        .find(|root| root.name() == "branch.merge.publish")
        .map(|root| root.elapsed().as_micros());
    let mut records_after = fixture.service.store.merge_record_work();
    records_after.reads -= records.reads;
    records_after.writes -= records.writes;
    records_after.write_ns -= records.write_ns;
    // Writer transactions other than the records' own: the history writes,
    // the merge's publish among them; their total bounds its hold.
    let history_writes = writer_after.0 - writer_before.0 - records_after.writes;
    let history_ns = (writer_after.1 - writer_before.1).saturating_sub(records_after.write_ns);
    println!(
        "SDK_MERGE_A3 moved={count} merge_ms={merge_ms} publish_us={publish_us:?} history_writes={history_writes} history_write_ns={history_ns} records={records_after:?} work={:?} kind={:?} root={:?}",
        fixture.since(before),
        merged.as_ref().map(|value| value.get_text("kind")),
        merged.as_ref().map(|value| value.get_text("root")),
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

/// File counts of the prepared moves: about 70,000, 200,000 and 270,000
/// candidate paths, the last past the former 262,144-path cap.
const PREPARED: [usize; 3] = [35_000, 100_000, 135_000];

#[test]
#[ignore = "setup: writes the prepared Stores into LAYERFS_355_FIXTURES"]
fn prepare_a3_fixtures() {
    let directory = fixtures();
    fs::create_dir_all(&directory).unwrap();
    for count in PREPARED {
        // A prepared Store is kept: merges of it compare across builds.
        let store = directory.join(format!("a3-{count}.sqlite"));
        if store.exists() {
            continue;
        }
        let start = Instant::now();
        let host = prepare(&format!("sdk-merge-a3-prepare-{count}"), count).close();
        fs::copy(&host.config.path, &store).unwrap();
        println!(
            "SDK_MERGE_A3_PREPARED files={count} store={store:?} bytes={} ms={}",
            fs::metadata(&store).unwrap().len(),
            start.elapsed().as_millis()
        );
        host.cleanup();
    }
}

#[test]
#[ignore = "needs the prepared Stores in LAYERFS_355_FIXTURES"]
fn a3_move_of_70k_candidate_paths() {
    merge_moved(prepared("sdk-merge-a3-35k", PREPARED[0]), PREPARED[0]);
}

#[test]
#[ignore = "needs the prepared Stores in LAYERFS_355_FIXTURES"]
fn a3_move_of_100k_files() {
    merge_moved(prepared("sdk-merge-a3-100k", PREPARED[1]), PREPARED[1]);
}

#[test]
#[ignore = "needs the prepared Stores in LAYERFS_355_FIXTURES"]
fn a3_move_past_the_former_path_cap() {
    merge_moved(prepared("sdk-merge-a3-135k", PREPARED[2]), PREPARED[2]);
}

#[test]
fn a3_directory_move_past_the_former_budget() {
    let count = BUDGET + 34_464;
    merge_moved(prepare("sdk-merge-a3", count), count);
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
