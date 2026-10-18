//! #355: merges past the former merge caps. A3: moving a directory with more
//! descendants than the in-memory build's 65,536 topology entries builds a
//! new directory holding all of them in the merged root. Before #355 (b) the
//! build has no ordering backing and refuses (`ResourceUnavailable`).
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

/// More descendants than the in-memory build's topology budget.
const MOVED: usize = 70_000;

fn text(value: &str) -> SdkValue {
    SdkValue::text(value)
}

#[test]
fn a3_directory_move_past_the_build_budget() {
    let start = Instant::now();
    let fixture = Fixture::new("sdk-merge-a3", |source| {
        let big = source.join("big");
        fs::create_dir(&big).unwrap();
        for n in 0..MOVED {
            fs::write(big.join(format!("f{n:06}")), b"").unwrap();
        }
        fs::write(source.join("small.txt"), b"small\n").unwrap();
        MOVED + 2
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
    let merge_start = Instant::now();
    let merged = fixture.try_call(
        "branch.merge",
        vec![
            ("branch", text("left")),
            ("with", text("right")),
            ("name", text("merged")),
        ],
    );
    println!(
        "SDK_MERGE_A3 moved={MOVED} init_ms={} merge_ms={} work={:?} outcome={merged:?}",
        built.as_millis(),
        merge_start.elapsed().as_millis(),
        fixture.since(before),
    );
    // Today the merged root is built on the in-memory route without an
    // ordering backing: the move's new directory does not fit.
    let refusal = merged.expect_err("the in-memory build refuses the move");
    assert!(
        format!("{refusal:?}").contains("ordering backing"),
        "{refusal:?}"
    );
    fixture.cleanup();
}
