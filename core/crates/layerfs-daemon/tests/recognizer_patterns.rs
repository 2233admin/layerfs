//! Write patterns the reference-piece run of issue 316 never exercised, through
//! the request port over a real Disposable Store and the real local owner,
//! without a mount (issue 318, phase B). Every pattern is compared with an
//! independent model three times: the live view, the published root read from
//! a fresh bind, and the live view after install. A pattern the recognizer
//! does not claim is a recorded result, printed as evidence; wrong bytes or a
//! refused request fail the test.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{evidence, job, live, Do, Rig, Session};
use layerfs_content::ObjectId;
use layerfs_daemon::{
    store::{BoundWorkspace, CommitSuccess},
    Response,
};
use layerfs_history::CommitStagedOutcome;
use layerfs_overlay::StoredCounts;
use std::{fs, path::Path};

const KIB: usize = 1024;
const MIB: usize = 1024 * KIB;
const BIG: usize = 3 * MIB;
const MID: usize = 200 * KIB;
const LOW: usize = 100 * KIB;
const WIDE: usize = 16 * MIB;

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
    fs::write(source.join("data/big"), noise(BIG, 3)).unwrap();
    fs::write(source.join("data/mid"), noise(MID, 7)).unwrap();
    fs::write(source.join("data/low"), noise(LOW, 9)).unwrap();
}
/// Writes `content[from..]` at its own offsets in requests of `request` bytes.
fn rewrite(session: &mut Session<'_>, path: &str, content: &[u8], from: usize, request: usize) {
    for start in (from..content.len()).step_by(request) {
        let bytes = &content[start..content.len().min(start + request)];
        session.apply(Do::Recognized(path, start as u64, bytes));
    }
}
/// Grows `path` to `content` in place: extends it, then moves the tail after
/// `from + grow` from the end backward, then writes the new bytes.
fn grow_backward(
    session: &mut Session<'_>,
    path: &str,
    content: &[u8],
    from: usize,
    grow: usize,
    request: usize,
) {
    session.apply(Do::Truncate(path, content.len() as u64));
    let mut end = content.len();
    while end > from + grow {
        let start = (from + grow).max(end.saturating_sub(request));
        session.apply(Do::Recognized(path, start as u64, &content[start..end]));
        end = start;
    }
    for start in (from..from + grow).step_by(request) {
        let stop = (from + grow).min(start + request);
        session.apply(Do::Write(path, start as u64, &content[start..stop]));
    }
}
fn counts(rig: &Rig, workspace: &BoundWorkspace) -> StoredCounts {
    match job(
        &rig.owner.client(),
        workspace.route(),
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.resources(job_route, true),
    )
    .result()
    {
        Ok(Response::Resources(resources)) => resources.counts,
        other => panic!("{other:?}"),
    }
}
fn claimed(rig: &Rig) -> u64 {
    let work = rig.store.recognizer_work();
    assert_eq!(work.passes.failed, 0, "{work:?}");
    work.passes.claimed_bytes
}
/// One evidence line: what was written, what the recognizer claimed of it and
/// what the overlay holds for it.
fn record(label: &str, rig: &Rig, workspace: &BoundWorkspace, written: usize, before: u64) -> u64 {
    let (now, held) = (claimed(rig), counts(rig, workspace));
    evidence(format_args!(
        "PATTERN {label} written={written} claimed={} piece_rows={} payload_cells={} payload_bytes={}",
        now - before,
        held.reference_rows,
        held.payload_cells,
        held.payload_bytes
    ));
    now
}
fn published(success: &CommitSuccess) -> ObjectId {
    assert!(matches!(success.installed.result(), Ok(Response::Done)));
    let namespace = success.namespace.as_ref().expect("the product closure ran");
    assert!(!namespace.retained(), "{namespace:?}");
    match &success.history {
        CommitStagedOutcome::Committed(record) => record.root,
        other => panic!("{other:?}"),
    }
}
fn rebound(rig: &Rig, tag: u8, root: ObjectId) -> model::Flat {
    let fresh = rig.bind(tag);
    assert_eq!(fresh.snapshot().unwrap().effective_root, root);
    let operation = fresh.operation().unwrap();
    let flat = model::canonical(operation.client(), root);
    drop(operation);
    rig.close(&fresh);
    flat
}
/// Live view, Commit, fresh bind and live view after install against the model.
fn commit_and_compare(
    rig: &Rig,
    workspace: &BoundWorkspace,
    session: &Session<'_>,
    tag: u8,
    label: &str,
) -> ObjectId {
    let expected = session.model.flat();
    model::assert_same(&expected, &live(workspace), &format!("{label}: live view"));
    let success = workspace
        .commit_captured()
        .unwrap_or_else(|failure| panic!("{label}: {failure:?}"));
    let root = published(&success);
    drop(success);
    model::assert_same(
        &expected,
        &rebound(rig, tag, root),
        &format!("{label}: fresh bind"),
    );
    model::assert_same(
        &expected,
        &live(workspace),
        &format!("{label}: live view after install"),
    );
    root
}
fn end(rig: Rig, workspace: std::sync::Arc<BoundWorkspace>) {
    rig.close(&workspace);
    drop(workspace);
    rig.finish();
}

/// A program that opens with O_TRUNC and writes the whole file again: first
/// the same content, then, after a Commit, the content with a small insert.
#[test]
fn truncate_to_zero_then_the_whole_file_is_written_again() {
    let rig = Rig::new("pattern-truncate", tree);
    let first = rig.bind(1);
    let big = noise(BIG, 3);
    let mut session = Session::new(&first, rig.base.clone());

    session.apply(Do::Truncate("data/big", 0));
    rewrite(&mut session, "data/big", &big, 0, 128 * KIB);
    let after = record("truncate-rewrite-same", &rig, &first, BIG, 0);
    commit_and_compare(&rig, &first, &session, 2, "same content");

    let p = BIG / 3 + 555;
    let mut inserted = big.clone();
    inserted.splice(p..p, noise(4 * KIB, 21));
    session.apply(Do::Truncate("data/big", 0));
    rewrite(&mut session, "data/big", &inserted, 0, 128 * KIB);
    record(
        "truncate-rewrite-small-insert",
        &rig,
        &first,
        inserted.len(),
        after,
    );
    commit_and_compare(&rig, &first, &session, 3, "content with an insert");
    end(rig, first);
}

/// An atomic save: a new file is written and renamed over a committed file,
/// once while that file has unpublished pieces and once after they were
/// committed. Nothing can be claimed for the new file; the old file's pieces
/// must not reach a read of the new one.
#[test]
fn a_new_file_renamed_over_a_file_that_has_pieces_replaces_it() {
    let rig = Rig::new("pattern-rename", tree);
    let first = rig.bind(1);
    let big = noise(BIG, 3);
    let mut session = Session::new(&first, rig.base.clone());

    let p = BIG / 2 + 777;
    let mut inserted = big.clone();
    inserted.splice(p..p, noise(4 * KIB, 11));
    rewrite(&mut session, "data/big", &inserted, p, 64 * KIB);
    let shifted = record(
        "rename: shifted tail before",
        &rig,
        &first,
        inserted.len() - p,
        0,
    );
    assert!(counts(&rig, &first).reference_rows > 0);

    // The replacement is the old content with other bytes in its middle.
    let mut saved = big.clone();
    saved[MIB..MIB + 9 * KIB].copy_from_slice(&noise(9 * KIB, 23));
    session.apply(Do::Create("data/big.tmp", 0o644));
    rewrite(&mut session, "data/big.tmp", &saved, 0, 128 * KIB);
    session.apply(Do::Rename("data/big.tmp", "data/big"));
    let renamed = record(
        "rename: new file over unpublished pieces",
        &rig,
        &first,
        BIG,
        shifted,
    );
    commit_and_compare(&rig, &first, &session, 2, "rename over unpublished pieces");

    // Pieces again, committed this time, then the same save.
    let mut again = saved.clone();
    again.splice(p..p, noise(4 * KIB, 13));
    rewrite(&mut session, "data/big", &again, p, 64 * KIB);
    let renamed = record(
        "rename: shifted tail again",
        &rig,
        &first,
        again.len() - p,
        renamed,
    );
    commit_and_compare(&rig, &first, &session, 3, "pieces committed");
    let mut second = again.clone();
    second.truncate(2 * MIB);
    session.apply(Do::Create("data/big.tmp", 0o644));
    rewrite(&mut session, "data/big.tmp", &second, 0, 128 * KIB);
    session.apply(Do::Rename("data/big.tmp", "data/big"));
    record(
        "rename: new file over committed pieces",
        &rig,
        &first,
        2 * MIB,
        renamed,
    );
    commit_and_compare(&rig, &first, &session, 4, "rename over committed pieces");
    evidence(format_args!(
        "PATTERN rename: after the last install {:?}",
        counts(&rig, &first)
    ));
    end(rig, first);
}

/// Blocks of the unchanged file rewritten in place in a scattered order, some
/// of them with a few changed bytes, then every block of a shifted tail in a
/// scattered order.
#[test]
fn scattered_and_out_of_order_rewrites_keep_every_byte() {
    let rig = Rig::new("pattern-scattered", tree);
    let first = rig.bind(1);
    let big = noise(BIG, 3);
    let mut session = Session::new(&first, rig.base.clone());
    let request = 64 * KIB;
    let blocks = BIG / request;

    let mut edited = big.clone();
    for step in 0..blocks {
        let block = (step * 29 + 5) % blocks;
        let start = block * request;
        if block % 5 == 0 {
            edited[start + 100..start + 140].fill(0xc3);
        }
        session.apply(Do::Recognized(
            "data/big",
            start as u64,
            &edited[start..start + request],
        ));
    }
    let in_place = record("scattered in place", &rig, &first, BIG, 0);
    commit_and_compare(&rig, &first, &session, 2, "scattered in place");

    // An insert whose tail arrives block by block in a scattered order.
    let p = MIB + 321;
    let mut inserted = edited.clone();
    inserted.splice(p..p, noise(4 * KIB, 17));
    let tail_blocks = (inserted.len() - p).div_ceil(request);
    session.apply(Do::Truncate("data/big", inserted.len() as u64));
    for step in 0..tail_blocks {
        let block = (step * 17 + 3) % tail_blocks;
        let start = p + block * request;
        let stop = inserted.len().min(start + request);
        session.apply(Do::Recognized(
            "data/big",
            start as u64,
            &inserted[start..stop],
        ));
    }
    record(
        "scattered shifted tail",
        &rig,
        &first,
        inserted.len() - p,
        in_place,
    );
    commit_and_compare(&rig, &first, &session, 3, "scattered shifted tail");
    end(rig, first);
}

/// A file crosses the 128 KiB chunk threshold in both directions while it has
/// pieces, and a file that starts below the threshold grows over it and is
/// then edited by a shift.
#[test]
fn a_file_crossing_the_chunk_threshold_with_pieces_keeps_its_bytes() {
    let rig = Rig::new("pattern-threshold", tree);
    let first = rig.bind(1);
    let (mid, low) = (noise(MID, 7), noise(LOW, 9));
    let mut session = Session::new(&first, rig.base.clone());

    // 200 KiB with a shifted tail, cut to 96 KiB while the pieces are there.
    let p = 20 * KIB + 111;
    let mut inserted = mid.clone();
    inserted.splice(p..p, noise(4 * KIB, 31));
    rewrite(&mut session, "data/mid", &inserted, p, 64 * KIB);
    let shifted = record(
        "threshold: shift at 200 KiB",
        &rig,
        &first,
        inserted.len() - p,
        0,
    );
    session.apply(Do::Truncate("data/mid", 96 * KIB as u64));
    record("threshold: cut to 96 KiB", &rig, &first, 0, shifted);
    commit_and_compare(&rig, &first, &session, 2, "cut below the threshold");

    // Up again over the threshold with the bytes it had, then a shift.
    rewrite(&mut session, "data/mid", &inserted, 96 * KIB, 64 * KIB);
    let grown = record(
        "threshold: grown back over it",
        &rig,
        &first,
        inserted.len() - 96 * KIB,
        shifted,
    );
    commit_and_compare(&rig, &first, &session, 3, "grown over the threshold");
    let mut deleted = inserted.clone();
    deleted.drain(p..p + 8 * KIB);
    rewrite(&mut session, "data/mid", &deleted, p, 64 * KIB);
    session.apply(Do::Truncate("data/mid", deleted.len() as u64));
    let after = record(
        "threshold: delete after regrowth",
        &rig,
        &first,
        deleted.len() - p,
        grown,
    );

    // 100 KiB grows to 300 KiB, is committed, and is then shifted.
    let mut larger = low.clone();
    larger.extend(noise(200 * KIB, 33));
    rewrite(&mut session, "data/low", &larger, LOW, 64 * KIB);
    commit_and_compare(
        &rig,
        &first,
        &session,
        4,
        "small file grown over the threshold",
    );
    let q = 10 * KIB + 7;
    let mut shifted_low = larger.clone();
    shifted_low.splice(q..q, noise(4 * KIB, 35));
    rewrite(&mut session, "data/low", &shifted_low, q, 64 * KIB);
    record(
        "threshold: shift of the grown file",
        &rig,
        &first,
        shifted_low.len() - q,
        after,
    );
    // Back under the threshold with pieces present.
    session.apply(Do::Truncate("data/low", 60 * KIB as u64));
    commit_and_compare(
        &rig,
        &first,
        &session,
        5,
        "grown file cut under the threshold",
    );
    end(rig, first);
}

/// Writes under 8 KiB, which the recognizer never examines, over a file that
/// has pieces: inside a piece, across the edit, at the file's end and past it.
#[test]
fn small_writes_over_a_file_that_has_pieces_keep_every_byte() {
    let rig = Rig::new("pattern-small", tree);
    let first = rig.bind(1);
    let big = noise(BIG, 3);
    let mut session = Session::new(&first, rig.base.clone());

    let p = BIG / 2 + 777;
    let mut inserted = big.clone();
    inserted.splice(p..p, noise(4 * KIB, 11));
    rewrite(&mut session, "data/big", &inserted, p, 64 * KIB);
    let shifted = record("small: shifted tail", &rig, &first, inserted.len() - p, 0);
    let rows = counts(&rig, &first).reference_rows;
    assert!(rows > 0);

    let last = inserted.len();
    let spots = [
        (p + 100 * KIB + 13, 1),
        (p + 200 * KIB, 100),
        (p + 300 * KIB + 4095, 2),
        (p + 512 * KIB, 4 * KIB),
        (p + 700 * KIB + 1, 7 * KIB + 1023),
        (p - 50, 100),
        (last - 3 * KIB, 3 * KIB),
        (last - 10, 500),
        (last + 5 * KIB, 64),
    ];
    for (index, (at, len)) in spots.into_iter().enumerate() {
        let bytes = noise(len, 100 + index as u64);
        if index % 2 == 0 {
            session.apply(Do::Recognized("data/big", at as u64, &bytes));
        } else {
            session.apply(Do::Write("data/big", at as u64, &bytes));
        }
        model::assert_same(
            &session.model.flat(),
            &live(&first),
            &format!("small write {index}"),
        );
    }
    record(
        "small: nine writes over the pieces",
        &rig,
        &first,
        0,
        shifted,
    );
    commit_and_compare(&rig, &first, &session, 2, "small writes over pieces");

    // The same over pieces that were committed: the base holds them now.
    for (index, (at, len)) in spots.into_iter().enumerate() {
        let bytes = noise(len, 200 + index as u64);
        session.apply(Do::Recognized("data/big", (at + 17) as u64, &bytes));
    }
    commit_and_compare(
        &rig,
        &first,
        &session,
        3,
        "small writes over committed pieces",
    );
    end(rig, first);
}

/// A later Commit of the same Workspace and a second Workspace, each over a
/// file whose committed content was built from pieces. What a piece
/// referenced stays readable in every view.
#[test]
fn a_later_commit_and_a_second_workspace_over_a_file_with_pieces() {
    let rig = Rig::new("pattern-later", tree);
    let first = rig.bind(1);
    let big = noise(BIG, 3);
    let mut session = Session::new(&first, rig.base.clone());

    let p = BIG / 2 + 777;
    let mut one = big.clone();
    one.splice(p..p, noise(4 * KIB, 11));
    rewrite(&mut session, "data/big", &one, p, 64 * KIB);
    let a = record("later: first shift", &rig, &first, one.len() - p, 0);
    commit_and_compare(&rig, &first, &session, 2, "first Commit");

    // Unpublished pieces of the new base, then a shift over them before the
    // Commit: the second set of writes covers the first.
    let q = BIG / 4 + 99;
    let mut two = one.clone();
    two.drain(q..q + 4 * KIB);
    rewrite(&mut session, "data/big", &two, q, 64 * KIB);
    session.apply(Do::Truncate("data/big", two.len() as u64));
    let b = record(
        "later: delete over the committed pieces",
        &rig,
        &first,
        two.len() - q,
        a,
    );
    let r = BIG / 8 + 5;
    let mut three = two.clone();
    three.splice(r..r, noise(12 * KIB, 41));
    rewrite(&mut session, "data/big", &three, r, 128 * KIB);
    let c = record(
        "later: insert over unpublished pieces",
        &rig,
        &first,
        three.len() - r,
        b,
    );
    let root = commit_and_compare(&rig, &first, &session, 3, "second Commit");
    let model_after = session.model.clone();
    rig.close(&first);
    drop(first);

    // A second Workspace binds the published root and edits the same file.
    let second = rig.bind(4);
    assert_eq!(second.snapshot().unwrap().effective_root, root);
    let mut other = Session::new(&second, model_after);
    model::assert_same(&other.model.flat(), &live(&second), "second Workspace");
    let s = BIG / 3 + 1;
    let mut four = three.clone();
    four.splice(s..s, noise(4 * KIB, 43));
    grow_backward(&mut other, "data/big", &four, s, 4 * KIB, 64 * KIB);
    record(
        "later: second Workspace, backward shift",
        &rig,
        &second,
        four.len() - s,
        c,
    );
    commit_and_compare(&rig, &second, &other, 5, "second Workspace Commit");
    end(rig, second);
}

fn wide_tree(source: &Path) {
    fs::create_dir_all(source.join("data")).unwrap();
    fs::write(source.join("data/wide"), noise(WIDE, 51)).unwrap();
}
/// One shift size: an insert written forward, a delete, and an insert grown
/// in place from the end backward, each committed and read back. Whether the
/// recognizer claims the moved tail is printed, not required.
fn shifts_of(label: &str, shift: usize) {
    let rig = Rig::new(label, wide_tree);
    let first = rig.bind(1);
    let wide = noise(WIDE, 51);
    let mut session = Session::new(&first, rig.base.clone());

    let p = MIB + 777;
    let mut inserted = wide.clone();
    inserted.splice(p..p, noise(shift, 53));
    rewrite(&mut session, "data/wide", &inserted, p, 128 * KIB);
    let a = record(
        &format!("shift {shift}: insert forward, moved tail {}", WIDE - p),
        &rig,
        &first,
        inserted.len() - p,
        0,
    );
    commit_and_compare(&rig, &first, &session, 2, "insert");

    let q = 2 * MIB + 4321;
    let mut deleted = inserted.clone();
    deleted.drain(q..q + shift);
    rewrite(&mut session, "data/wide", &deleted, q, 128 * KIB);
    session.apply(Do::Truncate("data/wide", deleted.len() as u64));
    let b = record(
        &format!("shift {shift}: delete, moved tail {}", deleted.len() - q),
        &rig,
        &first,
        deleted.len() - q,
        a,
    );
    commit_and_compare(&rig, &first, &session, 3, "delete");

    let r = 3 * MIB + 99;
    let mut grown = deleted.clone();
    grown.splice(r..r, noise(shift, 55));
    grow_backward(&mut session, "data/wide", &grown, r, shift, 64 * KIB);
    record(
        &format!(
            "shift {shift}: insert backward, moved tail {}",
            deleted.len() - r
        ),
        &rig,
        &first,
        grown.len() - r,
        b,
    );
    commit_and_compare(&rig, &first, &session, 4, "backward insert");
    end(rig, first);
}
#[test]
fn inserts_and_deletes_of_64_kib_keep_every_byte() {
    shifts_of("pattern-shift-64k", 64 * KIB);
}
#[test]
fn inserts_and_deletes_of_1_mib_keep_every_byte() {
    shifts_of("pattern-shift-1m", MIB);
}
#[test]
fn inserts_and_deletes_of_10_mib_keep_every_byte() {
    shifts_of("pattern-shift-10m", 10 * MIB);
}
