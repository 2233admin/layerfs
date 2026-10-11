//! The write recognizer through the request port, over a real Disposable
//! Store and the real local owner, without a mount. Every write passes the
//! port a kernel WRITE passes and carries only its own bytes; the live view,
//! the published root read from a fresh bind and the live view after install
//! are each compared with an independent model. Counts are printed as
//! evidence.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{evidence, live, settled, Do, Rig, Session};
use layerfs_content::ObjectId;
use layerfs_daemon::{
    store::{CommitSuccess, RECOGNIZER_SLOTS},
    Response,
};
use layerfs_history::CommitStagedOutcome;
use std::{fs, path::Path};

const KIB: usize = 1024;
const MIB: usize = 1024 * KIB;
const BIG: usize = 3 << 20;
const SECOND: usize = 2 << 20;
const SMALL_FILES: usize = 70;

fn noise(len: usize, seed: u64) -> Vec<u8> {
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
    fs::create_dir_all(source.join("many")).unwrap();
    fs::write(source.join("data/big"), noise(BIG, 3)).unwrap();
    fs::write(source.join("data/second"), noise(SECOND, 5)).unwrap();
    fs::write(source.join("data/small"), b"a small file\n").unwrap();
    for index in 0..SMALL_FILES {
        fs::write(source.join(format!("many/f{index:02}")), b"one of many\n").unwrap();
    }
}
/// Writes `content[from..]` at its own offsets in requests of `request`
/// bytes, as a program that rewrites the tail of a file does.
fn rewrite(session: &mut Session<'_>, path: &str, content: &[u8], from: usize, request: usize) {
    for start in (from..content.len()).step_by(request) {
        let bytes = &content[start..content.len().min(start + request)];
        session.apply(Do::Recognized(path, start as u64, bytes));
    }
}
fn published(success: &CommitSuccess) -> ObjectId {
    assert!(matches!(success.installed.result(), Ok(Response::Done)));
    let namespace = success.namespace.as_ref().expect("the product closure ran");
    assert!(!namespace.retained(), "{namespace:?}");
    evidence(format_args!(
        "RECOGNIZER_COMMIT work={:?} content={:?}",
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
fn plain_writes_of_a_shifted_tail_become_pieces_and_commit() {
    let rig = Rig::new("recognizer", tree);
    let first = rig.bind(1);
    let (big, second) = (noise(BIG, 3), noise(SECOND, 5));
    let mut session = Session::new(&first, rig.base.clone());

    // Insert 4 KiB at an odd offset of `big`: the program writes the new
    // bytes and the whole tail after them, 64 KiB a request.
    let p = BIG / 2 + 777;
    let mut inserted = big.clone();
    inserted.splice(p..p, noise(4 * KIB, 11));
    rewrite(&mut session, "data/big", &inserted, p, 64 * KIB);
    let after_insert = rig.store.recognizer_work();
    evidence(format_args!("RECOGNIZER insert {after_insert:?}"));
    let tail = (inserted.len() - p) as u64;
    assert!(
        after_insert.passes.claimed_bytes * 2 > tail,
        "{after_insert:?}"
    );
    assert_eq!(after_insert.passes.failed, 0);

    // Delete 4 KiB of `second`: the tail moves down, then the file is cut.
    let q = SECOND / 4 + 12_345;
    let mut deleted = second.clone();
    deleted.drain(q..q + 4 * KIB);
    rewrite(&mut session, "data/second", &deleted, q, 128 * KIB);
    session.apply(Do::Truncate("data/second", deleted.len() as u64));
    // Bytes that can match nothing: a new file, and a small whole file.
    session.apply(Do::Create("data/new", 0o644));
    rewrite(
        &mut session,
        "data/new",
        &noise(300 * KIB, 13),
        0,
        128 * KIB,
    );
    session.apply(Do::Recognized("data/small", 0, &noise(16 * KIB, 15)));
    let before = rig.store.recognizer_work();
    evidence(format_args!("RECOGNIZER first round {before:?}"));
    assert!(before.passes.claimed_bytes > after_insert.passes.claimed_bytes + SECOND as u64 / 2);
    // The whole allowance: 64 slots, each with room for one carried chunk's
    // identity. It does not depend on the files or on what was written.
    assert!(before.capacity_bytes < 160 * KIB, "{before:?}");

    let expected = session.model.flat();
    model::assert_same(&expected, &live(&first), "live view before Commit");
    let success = first
        .commit_captured()
        .unwrap_or_else(|failure| panic!("{failure:?}"));
    let root = published(&success);
    drop(success);
    model::assert_same(&expected, &rebound(&rig, 2, root), "fresh bind");
    model::assert_same(&expected, &live(&first), "live view after install");

    // The base advanced. The chunk that crossed a request's end was
    // completed by the next request, so the pieces of the tail were one run
    // and the Commit cut committed chunks only at the edit. A whole rewrite
    // of the unchanged file claims nearly all of it, and so does one with an
    // edit in it. (The count repeats the few bytes a claim reaches back.)
    rewrite(&mut session, "data/big", &inserted, 0, 128 * KIB);
    let whole = rig.store.recognizer_work();
    evidence(format_args!("RECOGNIZER whole rewrite {whole:?}"));
    let claimed = whole.passes.claimed_bytes - before.passes.claimed_bytes;
    assert!(claimed * 10 > inserted.len() as u64 * 9, "{claimed}");
    let mut edited = deleted.clone();
    edited[SECOND / 2..SECOND / 2 + 50].fill(0x5a);
    rewrite(&mut session, "data/second", &edited, 0, 64 * KIB);
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
    assert_eq!(rig.store.recognizer_work().passes.failed, 0);

    settled(&rig.owner.client(), 0);
    rig.close(&first);
    drop(first);
    rig.finish();
}

/// Writers that do not write one tail in order: a second writer between two
/// requests, requests in reverse order, a request repeated with other bytes
/// and an appending writer. A claim may only ever name bytes that are the
/// file's, so every view equals the model.
#[test]
fn interleaved_and_unordered_writes_never_claim_another_writers_bytes() {
    let rig = Rig::new("recognizer-interleaved", tree);
    let first = rig.bind(1);
    let (big, second) = (noise(BIG, 3), noise(SECOND, 5));
    let mut session = Session::new(&first, rig.base.clone());
    let request = 64 * KIB;

    // The unchanged file in place, and after each request another writer
    // changes a few bytes just below the request's end: the bytes a carried
    // chunk left there are no longer the committed ones.
    for (index, start) in (0..MIB).step_by(request).enumerate() {
        session.apply(Do::Recognized(
            "data/big",
            start as u64,
            &big[start..start + request],
        ));
        if index % 2 == 0 {
            let at = (start + request - 700) as u64;
            session.apply(Do::Write("data/big", at, &[0xa5; 300]));
        }
    }
    let mixed = rig.store.recognizer_work();
    evidence(format_args!("RECOGNIZER interleaved {mixed:?}"));
    assert!(mixed.passes.claimed_bytes > MIB as u64 / 2, "{mixed:?}");
    model::assert_same(&session.model.flat(), &live(&first), "interleaved writers");

    // The same request again with other bytes, then the next one in order.
    let other = noise(request, 31);
    session.apply(Do::Recognized(
        "data/big",
        MIB as u64,
        &big[MIB..MIB + request],
    ));
    session.apply(Do::Recognized("data/big", MIB as u64, &other));
    let next = MIB + request;
    session.apply(Do::Recognized(
        "data/big",
        next as u64,
        &big[next..next + request],
    ));
    // Requests in reverse order over the second file.
    for start in (0..MIB).step_by(request).rev() {
        session.apply(Do::Recognized(
            "data/second",
            start as u64,
            &second[start..start + request],
        ));
    }
    // An appending writer: committed bytes of the file's start, at its end.
    for start in (0..256 * KIB).step_by(request) {
        let at = (SECOND + start) as u64;
        session.apply(Do::Recognized(
            "data/second",
            at,
            &second[start..start + request],
        ));
    }
    let expected = session.model.flat();
    model::assert_same(&expected, &live(&first), "live view before Commit");
    let success = first
        .commit_captured()
        .unwrap_or_else(|failure| panic!("{failure:?}"));
    let root = published(&success);
    drop(success);
    model::assert_same(&expected, &rebound(&rig, 2, root), "fresh bind");
    model::assert_same(&expected, &live(&first), "live view after install");
    let end = rig.store.recognizer_work();
    evidence(format_args!("RECOGNIZER unordered {end:?}"));
    assert_eq!(end.passes.failed, 0);

    settled(&rig.owner.client(), 0);
    rig.close(&first);
    drop(first);
    rig.finish();
}

#[test]
fn the_slot_table_is_fixed_and_an_evicted_file_starts_over() {
    let rig = Rig::new("recognizer-slots", tree);
    let first = rig.bind(1);
    let big = noise(BIG, 3);
    let mut session = Session::new(&first, rig.base.clone());

    // An unchanged stretch of `big` in place: found by one search.
    rewrite(&mut session, "data/big", &big[..256 * KIB], 0, 64 * KIB);
    let found = rig.store.recognizer_work();
    assert!(found.passes.claimed_bytes > 128 * KIB as u64, "{found:?}");
    assert_eq!((found.slots, found.evictions), (1, 0));
    let scanned = found.passes.scanned_bytes;

    // More files than slots, each with one write of a chunk's length.
    let filler = noise(8 * KIB, 17);
    for index in 0..SMALL_FILES {
        let path = format!("many/f{index:02}");
        session.apply(Do::Recognized(&path, 0, &filler));
    }
    let full = rig.store.recognizer_work();
    evidence(format_args!("RECOGNIZER slots {full:?}"));
    assert_eq!(full.slots, RECOGNIZER_SLOTS);
    assert_eq!(full.evictions as usize, SMALL_FILES + 1 - RECOGNIZER_SLOTS);
    assert_eq!(full.capacity_bytes, found.capacity_bytes);
    // A small whole file takes one pass and no scan.
    assert_eq!(full.passes.scanned_bytes, scanned);
    assert_eq!(full.passes.claimed_bytes, found.passes.claimed_bytes);

    // `big` lost its slot: the next stretch is searched for again and found.
    rewrite(
        &mut session,
        "data/big",
        &big[..512 * KIB],
        256 * KIB,
        64 * KIB,
    );
    let again = rig.store.recognizer_work();
    assert!(again.passes.scanned_bytes > scanned, "{again:?}");
    assert!(
        again.passes.claimed_bytes > full.passes.claimed_bytes + 128 * KIB as u64,
        "{again:?}"
    );
    assert_eq!(again.slots, RECOGNIZER_SLOTS);

    model::assert_same(&session.model.flat(), &live(&first), "live view");
    settled(&rig.owner.client(), 0);
    rig.close(&first);
    drop(first);
    rig.finish();
}
