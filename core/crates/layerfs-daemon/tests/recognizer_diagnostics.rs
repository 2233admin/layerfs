//! Issue 319 phase 0: untimed counts through the ordinary request-port rig.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{content_root, evidence, job, live, settled, Do, Rig, Session};
use layerfs_content::{
    file::{Extent, FileView},
    ObjectId,
};
use layerfs_daemon::{store::BoundWorkspace, Command, Response, ServiceClass};
use layerfs_history::CommitStagedOutcome;
use layerfs_overlay::StoredCounts;
use layerfs_telemetry::timer::Timing;
use std::{collections::BTreeSet, fs};

const MIB: usize = 1 << 20;
const CELL: usize = 4096;
const REQUEST: usize = 65536;
const FIXTURE_SEED: u64 = 5494771174636671793;

// Frozen sdk-edit-standard-content-v1 fixture and replacement generator.
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
fn counts(rig: &Rig, workspace: &BoundWorkspace) -> StoredCounts {
    match job(
        &rig.owner.client(),
        workspace.route(),
        Command::Resources { global: true },
    )
    .result()
    {
        Ok(Response::Resources(resources)) => resources.counts,
        other => panic!("{other:?}"),
    }
}
fn extents(workspace: &BoundWorkspace, root: ObjectId) -> Vec<Extent> {
    let operation = workspace.operation().unwrap();
    let reader = operation.client();
    Timing::disabled("diagnostic.mapping", |active| {
        let view = FileView::open(reader, root, active.child("open"))?;
        let mut cursor = view.extents().expect("chunked benchmark fixture");
        let mut output = Vec::new();
        while let Some(extent) = cursor.next(reader, active)? {
            output.push(extent);
        }
        Ok::<_, layerfs_content::ContentError>(output)
    })
    .0
    .unwrap()
}
fn commit(rig: &Rig, workspace: &BoundWorkspace, session: &Session<'_>, label: &str) {
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
    let record_jobs = after.completed[ServiceClass::OperationRecord as usize]
        - before.completed[ServiceClass::OperationRecord as usize];
    let sql = after.sql_foreground.since(&before.sql_foreground).total();
    evidence(format_args!("DIAGNOSTIC_COMMIT {label} producer_record_jobs={} record_class_jobs={record_jobs} owner_jobs={jobs} statements={} vm_steps={} fullscan_steps={} sorts={} reprepares={}",
        work.record_jobs, sql.executions, sql.vm_steps, sql.fullscan_steps, sql.sorts, sql.reprepares));
    let fresh = rig.bind(2);
    assert_eq!(fresh.snapshot().unwrap().effective_root, root);
    let operation = fresh.operation().unwrap();
    model::assert_same(
        &session.model.flat(),
        &model::canonical(operation.client(), root),
        "fresh committed root",
    );
    drop(operation);
    rig.close(&fresh);
    model::assert_same(
        &session.model.flat(),
        &live(workspace),
        "live after install",
    );
}
fn finish(rig: Rig, workspace: std::sync::Arc<BoundWorkspace>) {
    settled(&rig.owner.client(), 0);
    rig.close(&workspace);
    drop(workspace);
    rig.finish();
}

#[test]
fn benchmark_insert_lists_original_chunks_no_longer_named() {
    let original = bytes(FIXTURE_SEED, MIB);
    let rig = Rig::new("319-retention", |source| {
        fs::write(source.join("payload.bin"), &original).unwrap()
    });
    let workspace = rig.bind(1);
    let old = extents(
        &workspace,
        ObjectId::from_bytes(&content_root(&workspace, "payload.bin")).unwrap(),
    );
    let p = MIB / 2;
    let replacement = bytes(6313238748831594097, CELL);
    let mut final_bytes = original.clone();
    final_bytes.splice(p..p, replacement.iter().copied());
    let mut session = Session::new(&workspace, rig.base.clone());
    session.apply(Do::Truncate("payload.bin", final_bytes.len() as u64));
    // Exact benchmark writer: tail copied from end backward in 64 KiB requests.
    let mut end = MIB;
    while end > p {
        let start = p.max(end.saturating_sub(REQUEST));
        session.apply(Do::Recognized(
            "payload.bin",
            (start + CELL) as u64,
            &original[start..end],
        ));
        end = start;
    }
    session.apply(Do::Recognized("payload.bin", p as u64, &replacement));
    let held = counts(&rig, &workspace);
    evidence(format_args!(
        "DIAGNOSTIC_INSERT piece_rows={} payload_cells={} payload_bytes={}",
        held.reference_rows, held.payload_cells, held.payload_bytes
    ));
    commit(&rig, &workspace, &session, "insert-1mib");
    let new = extents(
        &workspace,
        ObjectId::from_bytes(&content_root(&workspace, "payload.bin")).unwrap(),
    );
    let named: BTreeSet<_> = new.iter().map(|extent| extent.chunk).collect();
    let mut lost = 0;
    let mut lost_away_from_edit = Vec::new();
    for extent in &old {
        if !named.contains(&extent.chunk) {
            lost += 1;
            if extent.offset >= p as u64 || extent.offset + u64::from(extent.length) <= p as u64 {
                lost_away_from_edit.push((extent.offset, extent.chunk));
            }
            evidence(format_args!("DIAGNOSTIC_LOST offset={} end={} length={} chunk_offset={} chunk={:?} distance_from_edit={}", extent.offset, extent.offset + u64::from(extent.length), extent.length, extent.chunk_offset, extent.chunk, extent.offset.abs_diff(p as u64)));
        }
    }
    evidence(format_args!(
        "DIAGNOSTIC_RETENTION original_extents={} final_extents={} lost={lost} edit_offset={p}",
        old.len(),
        new.len()
    ));
    finish(rig, workspace);
    assert!(
        lost_away_from_edit.is_empty(),
        "original chunks lost away from the edit: {lost_away_from_edit:?}"
    );
}

#[test]
fn benchmark_delete_prints_piece_cells_and_commit_jobs_at_two_sizes() {
    for size in [MIB, 10 * MIB] {
        let original = bytes(FIXTURE_SEED, size);
        let rig = Rig::new(&format!("319-delete-{size}"), |source| {
            fs::write(source.join("payload.bin"), &original).unwrap()
        });
        let workspace = rig.bind(1);
        let mut session = Session::new(&workspace, rig.base.clone());
        let p = size / 2;
        let mut source = p + CELL;
        while source < size {
            let stop = size.min(source + REQUEST);
            session.apply(Do::Recognized(
                "payload.bin",
                (source - CELL) as u64,
                &original[source..stop],
            ));
            source = stop;
        }
        session.apply(Do::Truncate("payload.bin", (size - CELL) as u64));
        let held = counts(&rig, &workspace);
        evidence(format_args!(
            "DIAGNOSTIC_DELETE size={size} piece_rows={} payload_cells={} payload_bytes={}",
            held.reference_rows, held.payload_cells, held.payload_bytes
        ));
        commit(&rig, &workspace, &session, &format!("delete-{size}"));
        finish(rig, workspace);
    }
}
