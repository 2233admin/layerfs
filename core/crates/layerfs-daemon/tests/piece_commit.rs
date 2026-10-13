//! Reference pieces through the product Commit over a real Disposable Store
//! and the real local owner, without a mount. Pieces are written by the
//! ordinary Workspace write with claims; the live view, the published root
//! read from a fresh bind, and the live view after install are each compared
//! with an independent model. Counts are printed as evidence.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{content_root, evidence, live, Do, Rig, Session};
use layerfs_content::ObjectId;
use layerfs_daemon::{store::CommitSuccess, Response};
use layerfs_history::CommitStagedOutcome;
use std::{fs, path::Path};

const C: u64 = 4096;
const WINDOW: u64 = 64 * 1024;
const BIG: u64 = 3 << 20;
const SECOND: u64 = 2 << 20;

fn noise(len: u64, seed: u64) -> Vec<u8> {
    let mut state = seed.wrapping_mul(0x9e37_79b9_7f4a_7c15) | 1;
    (0..len)
        .map(|_| {
            state ^= state << 13;
            state ^= state >> 7;
            state ^= state << 17;
            (state >> 24) as u8
        })
        .collect()
}
fn tree(source: &Path) {
    fs::create_dir_all(source.join("data")).unwrap();
    fs::write(source.join("data/big"), noise(BIG, 3)).unwrap();
    fs::write(source.join("data/second"), noise(SECOND, 5)).unwrap();
    fs::write(source.join("data/small"), b"a small file\n").unwrap();
    fs::write(source.join("top.txt"), b"top level\n").unwrap();
}
/// Writes `content[source..source + length]` at `at` of `path` in windows,
/// each claimed to be committed content of `root` from there.
fn claimed(
    session: &mut Session<'_>,
    path: &str,
    at: u64,
    (root, content): ([u8; 32], &[u8]),
    source: u64,
    length: u64,
) {
    let mut done = 0;
    while done < length {
        let count = WINDOW.min(length - done);
        let from = (source + done) as usize;
        let bytes = &content[from..from + count as usize];
        session.apply(Do::Claimed(path, at + done, bytes, root, source + done));
        done += count;
    }
}
fn published(success: &CommitSuccess) -> ObjectId {
    assert!(matches!(success.installed.result(), Ok(Response::Done)));
    let namespace = success.namespace.as_ref().expect("the product closure ran");
    assert!(!namespace.retained(), "{namespace:?}");
    evidence(format_args!(
        "PIECE_COMMIT work={:?} content={:?}",
        namespace.work, namespace.counters
    ));
    match &success.history {
        CommitStagedOutcome::Committed(record) => record.root,
        other => panic!("{other:?}"),
    }
}
/// The published root as a fresh bind sees it, walked completely.
fn rebound(rig: &Rig, tag: u8, root: ObjectId) -> model::Flat {
    let fresh = rig.bind(tag);
    assert_eq!(fresh.snapshot().unwrap().effective_root, root);
    let operation = fresh.operation().unwrap();
    let flat = model::canonical(operation.client(), root);
    drop(operation);
    rig.close(&fresh);
    flat
}

#[test]
fn pieces_commit_install_and_read_back_from_a_fresh_bind() {
    let rig = Rig::new("piece-commit", tree);
    let first = rig.bind(1);
    let (big, second) = (noise(BIG, 3), noise(SECOND, 5));
    let old_big = content_root(&first, "data/big");
    let old_second = content_root(&first, "data/second");
    let mut session = Session::new(&first, rig.base.clone());

    // Insert one cell in the middle of `big`: its second half, one cell later.
    let p = BIG / 2;
    claimed(&mut session, "data/big", p + C, (old_big, &big), p, BIG - p);
    session.apply(Do::Write("data/big", p, &noise(C, 11)));
    // Delete one cell of `second`, with a few bytes written in the moved tail.
    let q = SECOND / 4;
    claimed(
        &mut session,
        "data/second",
        q,
        (old_second, &second),
        q + C,
        SECOND - q - C,
    );
    session.apply(Do::Truncate("data/second", SECOND - C));
    session.apply(Do::Write(
        "data/second",
        q + 9 * C + 100,
        b"inside the moved tail",
    ));
    session.apply(Do::Write("top.txt", 0, b"TOP"));

    let expected = session.model.flat();
    model::assert_same(&expected, &live(&first), "live view before Commit");
    let success = first
        .commit_captured()
        .unwrap_or_else(|failure| panic!("{failure:?}"));
    let root = published(&success);
    drop(success);
    model::assert_same(&expected, &rebound(&rig, 2, root), "fresh bind");
    model::assert_same(&expected, &live(&first), "live view after install");

    // After the base advanced: a piece of the new base, and one that still
    // names the old content of `big`, which stays readable and is committed
    // as new bytes.
    let new_big = content_root(&first, "data/big");
    assert_ne!(new_big, old_big);
    let current = {
        let mut bytes = big[..p as usize].to_vec();
        bytes.extend_from_slice(&noise(C, 11));
        bytes.extend_from_slice(&big[p as usize..]);
        bytes
    };
    claimed(&mut session, "data/big", 0, (new_big, &current), C, 16 * C);
    claimed(
        &mut session,
        "data/big",
        64 * C,
        (old_big, &big),
        8 * C,
        16 * C,
    );
    let expected = session.model.flat();
    model::assert_same(
        &expected,
        &live(&first),
        "live view before the second Commit",
    );
    let success = first
        .commit_captured()
        .unwrap_or_else(|failure| panic!("{failure:?}"));
    let root = published(&success);
    drop(success);
    model::assert_same(&expected, &rebound(&rig, 3, root), "second fresh bind");
    model::assert_same(
        &expected,
        &live(&first),
        "live view after the second install",
    );

    rig.close(&first);
    drop(first);
    rig.finish();
}
