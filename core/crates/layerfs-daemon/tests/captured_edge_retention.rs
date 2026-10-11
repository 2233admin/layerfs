//! Exact unchanged payload/source-offset retention after ordinary shifted writes.
//! The persisted mapping is observed independently; only request-port writes
//! and truncation influence the captured content or reference pieces.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{content_root, evidence, live, settled, Do, Rig, Session};
use layerfs_content::{file::Extent, FileView, ObjectId};
use layerfs_daemon::store::BoundWorkspace;
use layerfs_history::CommitStagedOutcome;
use layerfs_telemetry::timer::Timing;
use std::{fs, ops::Range};

const MIB: usize = 1 << 20;
const CELL: usize = 4096;
const REQUEST: usize = 65536;

fn bytes(mut state: u64, len: usize) -> Vec<u8> {
    let mut output = Vec::with_capacity(len);
    while output.len() < len {
        state = state.wrapping_add(0x9e37_79b9_7f4a_7c15);
        let mut z = state;
        z = (z ^ (z >> 30)).wrapping_mul(0xbf58_476d_1ce4_e5b9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94d0_49bb_1331_11eb);
        let word = (z ^ (z >> 31)).to_le_bytes();
        output.extend_from_slice(&word[..word.len().min(len - output.len())]);
    }
    output
}
fn extents(workspace: &BoundWorkspace) -> Vec<Extent> {
    let root = ObjectId::from_bytes(&content_root(workspace, "payload.bin")).unwrap();
    let operation = workspace.operation().unwrap();
    Timing::disabled("edge.mapping", |scope| {
        let view = FileView::open(operation.client(), root, scope.child("open"))?;
        let mut cursor = view.extents().expect("chunked fixture");
        let mut output = Vec::new();
        while let Some(extent) = cursor.next(operation.client(), scope)? {
            output.push(extent);
        }
        Ok::<_, layerfs_content::ContentError>(output)
    })
    .0
    .unwrap()
}
/// Accept changed extent segmentation, require exact payload and source bytes.
fn unchanged(old: &[Extent], new: &[Extent], range: Range<u64>, target: u64) -> Result<(), String> {
    for original in old {
        let start = original.offset.max(range.start);
        let end = (original.offset + u64::from(original.length)).min(range.end);
        if start >= end {
            continue;
        }
        let mut position = target + start - range.start;
        let mut source = u64::from(original.chunk_offset) + start - original.offset;
        let mut remaining = end - start;
        let mut index =
            new.partition_point(|extent| extent.offset + u64::from(extent.length) <= position);
        while remaining != 0 {
            let actual = new.get(index).ok_or("missing retained extent")?;
            let stop = actual.offset + u64::from(actual.length);
            if position < actual.offset || position >= stop {
                return Err(format!("retained extent gap at {position}"));
            }
            let actual_source = u64::from(actual.chunk_offset) + position - actual.offset;
            if actual.chunk != original.chunk || actual_source != source {
                return Err(format!(
                    "unchanged payload/source transcript at {position}: original={:?}@{source} actual={:?}@{actual_source}",
                    original.chunk, actual.chunk,
                ));
            }
            let count = remaining.min(stop - position);
            remaining -= count;
            position += count;
            source += count;
            index += 1;
        }
    }
    Ok(())
}

fn shifted(label: &str, size: usize, start: usize, removed: usize, mutate_edge: bool) {
    let original = bytes(5494771174636671793, size);
    let replacement = bytes(6313238748831594097, CELL);
    let rig = Rig::new(label, |source| {
        fs::write(source.join("payload.bin"), &original).unwrap()
    });
    let workspace = rig.bind(1);
    let old = extents(&workspace);
    let grow = CELL - removed;
    let source_start = start + removed;
    let mismatch = source_start + 7;
    let mut tail = original.clone();
    if mutate_edge {
        tail[mismatch] ^= 1;
    }
    let mut session = Session::new(&workspace, rig.base.clone());
    session.apply(Do::Truncate("payload.bin", (size + grow) as u64));
    let mut end = size;
    while end > source_start {
        let from = source_start.max(end.saturating_sub(REQUEST));
        session.apply(Do::Recognized(
            "payload.bin",
            (from + grow) as u64,
            &tail[from..end],
        ));
        end = from;
    }
    session.apply(Do::Recognized("payload.bin", start as u64, &replacement));
    model::assert_same(
        &session.model.flat(),
        &live(&workspace),
        "live before Commit",
    );
    settled(&rig.owner.client(), 0);
    let success = workspace
        .commit_captured()
        .unwrap_or_else(|e| panic!("{e:?}"));
    let root = match &success.history {
        CommitStagedOutcome::Committed(record) => record.root,
        other => panic!("{other:?}"),
    };
    evidence(format_args!(
        "EDGE_RETENTION {label} size={size} start={start} removed={removed} work={:?}",
        success.namespace.as_ref().unwrap().work,
    ));
    let work = success.namespace.as_ref().unwrap().work.unwrap();
    drop(success);
    let fresh = rig.bind(2);
    assert_eq!(fresh.snapshot().unwrap().effective_root, root);
    let operation = fresh.operation().unwrap();
    model::assert_same(
        &session.model.flat(),
        &model::canonical(operation.client(), root),
        "fresh persisted bytes",
    );
    drop(operation);
    let new = extents(&fresh);
    let prefix = unchanged(&old, &new, 0..start as u64, 0);
    let suffix = if mutate_edge {
        // The mismatch is seven bytes into the copied edge, not a whole chunk.
        // Final-byte equality above prevents an invalid trim past that byte.
        unchanged(
            &old,
            &new,
            (mismatch + 1) as u64..size as u64,
            (mismatch + 1 + grow) as u64,
        )
    } else {
        unchanged(
            &old,
            &new,
            source_start as u64..size as u64,
            (start + CELL) as u64,
        )
    };
    rig.close(&fresh);
    settled(&rig.owner.client(), 0);
    rig.close(&workspace);
    drop(session);
    drop(workspace);
    rig.finish();
    assert!(work.file_edge_windows <= 4, "{work:?}");
    assert!(
        work.file_edge_read_bytes <= work.file_edge_windows * 2 * REQUEST as u64,
        "{work:?}"
    );
    assert!(
        work.file_edge_retained_bytes <= work.file_edge_read_bytes / 2,
        "{work:?}"
    );
    assert!(prefix.is_ok(), "{label}: {prefix:?}");
    assert!(suffix.is_ok(), "{label}: {suffix:?}");
}

#[test]
fn unaligned_insert_keeps_exact_unchanged_mapping() {
    let size = MIB - CELL;
    shifted("edge-insert", size, size / 2, 0, false);
}
#[test]
fn prepend_keeps_partial_first_and_last_payloads() {
    shifted("edge-prepend", MIB - CELL, 0, 0, false);
}
#[test]
fn replace_grow_keeps_both_unchanged_edges() {
    let size = MIB - CELL / 2;
    shifted("edge-replace", size, size / 2, CELL / 2, false);
}
#[test]
fn differing_copied_edge_is_preserved_as_a_mutation() {
    let size = MIB - CELL;
    shifted("edge-mismatch", size, size / 2, 0, true);
}
#[test]
fn larger_insert_has_the_same_bounded_edge_scope() {
    let size = 4 * MIB - CELL;
    shifted("edge-insert-large", size, size / 2, 0, false);
}

#[test]
fn delete_keeps_its_existing_jobs_and_reads_no_edges() {
    let original = bytes(5494771174636671793, MIB);
    let rig = Rig::new("edge-delete-guard", |source| {
        fs::write(source.join("payload.bin"), &original).unwrap()
    });
    let workspace = rig.bind(1);
    let mut session = Session::new(&workspace, rig.base.clone());
    let mut source = MIB / 2 + CELL;
    while source < MIB {
        let stop = MIB.min(source + REQUEST);
        session.apply(Do::Recognized(
            "payload.bin",
            (source - CELL) as u64,
            &original[source..stop],
        ));
        source = stop;
    }
    session.apply(Do::Truncate("payload.bin", (MIB - CELL) as u64));
    settled(&rig.owner.client(), 0);
    let before = rig.owner.client().diagnostics().unwrap();
    let success = workspace
        .commit_captured()
        .unwrap_or_else(|e| panic!("{e:?}"));
    let work = success.namespace.as_ref().unwrap().work.unwrap();
    let root = match &success.history {
        CommitStagedOutcome::Committed(record) => record.root,
        other => panic!("{other:?}"),
    };
    drop(success);
    settled(&rig.owner.client(), 0);
    let after = rig.owner.client().diagnostics().unwrap();
    let jobs: u64 = before
        .completed
        .iter()
        .zip(after.completed)
        .map(|(a, b)| b - a)
        .sum();
    evidence(format_args!(
        "EDGE_DELETE_GUARD owner_jobs={jobs} work={work:?}"
    ));
    let fresh = rig.bind(2);
    let operation = fresh.operation().unwrap();
    model::assert_same(
        &session.model.flat(),
        &model::canonical(operation.client(), root),
        "delete fresh root",
    );
    drop(operation);
    model::assert_same(&session.model.flat(), &live(&workspace), "delete live root");
    rig.close(&fresh);
    rig.close(&workspace);
    drop(session);
    drop(workspace);
    rig.finish();
    assert_eq!(work.record_jobs, 42);
    assert_eq!(work.file_edge_windows, 0);
    assert_eq!(work.file_edge_read_bytes, 0);
    assert_eq!(work.file_edge_retained_bytes, 0);
}
