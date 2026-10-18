//! #352 scale experiment S1 (crazy_work_load_watch_out.md): the three walks
//! MAXIMUM_LINEAGE_ROWS (4,096) bounds, each driven just past the bound
//! through the SDK dispatch, with the exact outcome printed:
//! (a) Commits since a Branch's base Layer, then branch.merge and publish;
//! (b) Layers between two sides: 4,097 publishes on main, then merge a Branch
//!     forked before them (time-boxed: it stops and reports the rate if the
//!     publishes cannot finish inside the box);
//! (c) branch.fork from a Commit more than 4,096 first-parent Commits back.
//! Experiment record, not a gate: it asserts only that calls return.
#[path = "support/installed_store.rs"]
#[allow(dead_code)]
mod installed;
#[path = "support/sdk.rs"]
#[allow(dead_code)]
mod support;

use layerfs_bridge::control::SdkValue;
use layerfs_history::{BranchId, HistoryName, LayerStackId, NodeId};
use std::fs;
use std::time::{Duration, Instant};
use support::{write, Fixture, Work};

const STACK: [u8; 16] = [23; 16];
const PAST: usize = 4097;

fn head(fixture: &Fixture, name: &str) -> NodeId {
    let stack = LayerStackId::from_authority(STACK);
    let id = BranchId::named(stack, &HistoryName::new(name).unwrap());
    let branch = fixture.service.store.history().branch(id).unwrap().unwrap();
    NodeId::Commit(branch.head_commit.unwrap())
}

fn hex(node: NodeId) -> String {
    node.as_slice().iter().map(|b| format!("{b:02x}")).collect()
}

fn text(value: &str) -> SdkValue {
    SdkValue::text(value)
}

fn fixture(label: &str) -> Fixture {
    Fixture::new(label, |source| {
        fs::create_dir(source.join("lane")).unwrap();
        fs::write(source.join("lane/seed.txt"), b"seed\n").unwrap();
        2
    })
}

/// The SDK merge's ancestry questions for two heads, each answered once.
fn ancestry(fixture: &Fixture, a: &str, b: &str) -> (Work, String) {
    let (a, b) = (head(fixture, a), head(fixture, b));
    let history = fixture.service.store.history();
    let before = fixture.work();
    let one = history.is_ancestor(b, a);
    let two = history.is_ancestor(a, b);
    let base = history.merge_base(a, b);
    let outcome = format!("is_ancestor(b,a)={one:?} is_ancestor(a,b)={two:?} merge_base={base:?}");
    (fixture.since(before), outcome)
}

fn merge_and_publish(fixture: &Fixture, case: &str, branch: &str, with: &str) {
    let before = fixture.work();
    let merged = fixture.try_call(
        "branch.merge",
        vec![
            ("branch", text(branch)),
            ("with", text(with)),
            ("name", text("merged")),
            ("message", text("s1")),
        ],
    );
    println!("SCALE_S1{case} branch.merge({branch},{with}) work={:?} outcome={merged:?}", fixture.since(before));
    let before = fixture.work();
    let published = fixture.try_call("branch.publish", vec![("branch", text(branch))]);
    println!("SCALE_S1{case} branch.publish({branch}) work={:?} outcome={published:?} profile=Disposable", fixture.since(before));
}

#[test]
fn a_commits_since_the_layer() {
    let fixture = fixture("scale-s1a");
    fixture.fork("big");
    fixture.fork("other");
    fixture.apply("other", vec![write("/lane/other.txt", "other\n")]);
    let start = Instant::now();
    for i in 1..=PAST {
        fixture.apply("big", vec![write("/lane/big.txt", format!("big {i}\n"))]);
        if matches!(i, 1000 | 2000 | 4000 | PAST) {
            let (work, outcome) = ancestry(&fixture, "big", "other");
            println!("SCALE_S1a commits_since_layer={i} elapsed_ms={} ancestry={work:?} {outcome}", start.elapsed().as_millis());
        }
    }
    merge_and_publish(&fixture, "a", "big", "other");
    fixture.cleanup();
}

#[test]
fn b_layers_between_two_sides() {
    let fixture = fixture("scale-s1b");
    fixture.fork("x");
    fixture.apply("x", vec![write("/lane/x.txt", "x\n")]);
    let start = Instant::now();
    let budget = Duration::from_secs(95);
    let mut layers = 0usize;
    while layers < PAST && start.elapsed() < budget {
        let name = format!("p{layers}");
        fixture.fork(&name);
        fixture.apply(&name, vec![write("/lane/main.txt", format!("main {layers}\n"))]);
        let published = fixture.call("branch.publish", vec![("branch", text(&name))]);
        assert_eq!(published.get_text("kind"), Some("Added"), "{published:?}");
        layers += 1;
    }
    let ms = start.elapsed().as_millis();
    println!("SCALE_S1b layers_published={layers} elapsed_ms={ms} rate_per_s={:.1}", layers as f64 * 1000.0 / ms as f64);
    if layers < PAST {
        println!("SCALE_S1b NOT_REACHED: {layers} of {PAST} publishes in the {}s box; merge not attempted", budget.as_secs());
    } else {
        fixture.fork("y");
        fixture.apply("y", vec![write("/lane/y.txt", "y\n")]);
        let (work, outcome) = ancestry(&fixture, "x", "y");
        println!("SCALE_S1b layers_between={layers} ancestry={work:?} {outcome}");
        merge_and_publish(&fixture, "b", "x", "y");
    }
    fixture.cleanup();
}

#[test]
fn c_fork_from_a_deep_commit() {
    let fixture = fixture("scale-s1c");
    fixture.fork("deep");
    fixture.apply("deep", vec![write("/lane/deep.txt", "deep 0\n")]);
    let first = hex(head(&fixture, "deep"));
    for i in 1..=PAST {
        fixture.apply("deep", vec![write("/lane/deep.txt", format!("deep {i}\n"))]);
    }
    let near = hex(head(&fixture, "deep"));
    let shallow = fixture.try_call("branch.fork", vec![("name", text("near")), ("from", text(&near))]);
    println!("SCALE_S1c fork_from_head outcome={shallow:?}");
    let before = fixture.work();
    let forked = fixture.try_call("branch.fork", vec![("name", text("old")), ("from", text(&first))]);
    println!("SCALE_S1c fork_from_commit first_parent_depth={} work={:?} outcome={forked:?} profile=Disposable", PAST + 1, fixture.since(before));
    fixture.cleanup();
}
