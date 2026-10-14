//! Issue 319 phase 0: untimed counts through the ordinary request-port rig.
#[path = "support/delete_trace.rs"]
mod delete_trace;
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{content_root, evidence, job, live, Do, Rig, Session};
use layerfs_content::{
    file::{Extent, FileView},
    ObjectId,
};
use layerfs_daemon::{store::BoundWorkspace, Response, ServiceClass};
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
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.resources(Some(job_route), true)
        },
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
    let after = rig.owner.client().diagnostics().unwrap();
    let jobs: u64 = before.jobs.iter().zip(after.jobs).map(|(a, b)| b - a).sum();
    let record_jobs = after.jobs[ServiceClass::OperationRecord as usize]
        - before.jobs[ServiceClass::OperationRecord as usize];
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

#[test]
fn benchmark_delete_counts_exact_normalized_script_and_backing_at_two_sizes() {
    use layerfs_content::{filesystem::PathName, read_all, ConstructionPolicy};
    use layerfs_overlay::{IndexedOperationRecordKey, IndexedOperationRecordScope};
    use layerfs_workspace::{CapturedFileEdits, OverlayOperationRecords};
    let mut observations = Vec::new();
    for size in [MIB, 10 * MIB] {
        let original = bytes(FIXTURE_SEED, size);
        let rig = Rig::new(&format!("319-delete-script-{size}"), |source| {
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
        let operation = workspace.operation().unwrap();
        let overlay = operation.overlay();
        let route = workspace.route();
        let capture = match job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.capture(job_route),
        )
        .result()
        {
            Ok(Response::Captured(capture)) => *capture,
            other => panic!("{other:?}"),
        };
        let reader = match job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_captured_reader(job_route, capture, 901)
            },
        )
        .result()
        {
            Ok(Response::CapturedReader(Some(reader))) => *reader,
            other => panic!("{other:?}"),
        };
        let owner = match job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.acquire_operation(job_route, 902)
            },
        )
        .result()
        {
            Ok(Response::Operation(Some(owner))) => *owner,
            other => panic!("{other:?}"),
        };
        let scope = IndexedOperationRecordScope {
            owner,
            file_scope: 903,
        };
        let base = operation.workspace().base().unwrap();
        let serial = base
            .child(
                base.root().root_inode().serial(),
                &PathName::new("payload.bin").unwrap(),
            )
            .unwrap()
            .serial;
        let records = delete_trace::Records {
            inner: overlay,
            events: Default::default(),
        };
        let prepared =
            CapturedFileEdits::prepare(operation.workspace(), &records, reader, serial, scope)
                .unwrap();
        let policy = ConstructionPolicy::frozen_default();
        let mut output = delete_trace::Objects::default();
        let attempt = Timing::disabled("delete.count", |active| {
            Ok::<_, layerfs_content::ContentError>(prepared.construct(
                policy,
                &policy.capacities(),
                &mut output,
                active.child("construct"),
            ))
        })
        .0
        .unwrap();
        let root = attempt.result.as_ref().unwrap().root;
        let (detached, duplicates, kinds) = records.counts();
        evidence(format_args!("DELETE_BACKING size={size} normalized={} calls={} detached={detached} duplicate_parent_gets={duplicates} kinds={kinds:?}", attempt.custody.work.normalized_edits, attempt.custody.records.work.calls));
        let mut after = None;
        let mut edits = Vec::new();
        loop {
            let keys = overlay
                .operation_record_keys_after(scope, 0x4346_0001, after)
                .unwrap()
                .value;
            if keys.is_empty() {
                break;
            }
            for key in &keys {
                let row = overlay
                    .operation_record_get(
                        scope,
                        IndexedOperationRecordKey {
                            kind: 0x4346_0001,
                            key: *key,
                        },
                    )
                    .unwrap()
                    .value
                    .unwrap();
                assert_eq!((row.len(), row[0]), (25, 1));
                edits.push((
                    u64::from_be_bytes(row[1..9].try_into().unwrap()),
                    u64::from_be_bytes(row[9..17].try_into().unwrap()),
                    u64::from_be_bytes(row[17..25].try_into().unwrap()),
                ));
            }
            after = keys.last().copied();
        }
        assert_eq!(edits.len() as u64, attempt.custody.work.normalized_edits);
        evidence(format_args!(
            "DELETE_NORMALIZED size={size} edits={edits:?}"
        ));
        evidence(format_args!(
            "DELETE_WORK size={size} {:?}",
            attempt.custody.work
        ));
        observations.push((size, edits, attempt.custody.work));
        let combined = delete_trace::Combined {
            source: operation.client(),
            output: &output,
        };
        let mut actual = Vec::new();
        Timing::disabled("delete.output", |active| {
            read_all(&combined, root, &mut actual, active.child("read"))
        })
        .0
        .unwrap();
        assert_eq!(&actual[..p], &original[..p]);
        assert_eq!(&actual[p..], &original[p + CELL..]);
        assert_eq!(actual.len(), size - CELL);
        drop(attempt);
        assert!(job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
                .release_captured_reader(job_route, reader)
        )
        .result()
        .is_ok());
        assert!(job(
            overlay,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
                .release_operation(job_route, owner)
        )
        .result()
        .is_ok());
        drop(operation);
        finish(rig, workspace);
    }
    for (size, edits, work) in observations {
        let p = (size / 2) as u64;
        assert_eq!(
            edits,
            vec![(p, p + CELL as u64, 0)],
            "authenticated copied suffix must retain its existing base mapping"
        );
        assert_eq!(work.normalized_edits, 1);
        assert_eq!(work.edge_retained_bytes, CELL as u64);
        assert_eq!(work.edge_windows, 2);
        assert_eq!(work.edge_read_bytes, (4 * CELL) as u64);
        assert_eq!(work.committed_bytes, 0);
    }
}
