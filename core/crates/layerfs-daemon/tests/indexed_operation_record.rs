//! Public bounded owner jobs and retained original operation_record completions.
use layerfs_daemon::{
    IndexedOperationRecordJob, IndexedOperationRecordReply, JobReceipt, Owner, OwnerClient,
    OwnerConfig, OwnerError, Response,
};
use layerfs_overlay::{
    IndexedOperationRecordApply, IndexedOperationRecordChange, IndexedOperationRecordKey,
    IndexedOperationRecordScope, OperationRecordExpectedValue, OverlayError, ProfileConfig, Route,
};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
    time::{Duration, Instant},
};

struct Temp(PathBuf);
impl Temp {
    fn new() -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(1);
        let path = std::env::temp_dir().join(format!(
            "layerfs-indexed-owner-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir(&path).unwrap();
        Self(path)
    }
}
impl Drop for Temp {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).unwrap();
    }
}
fn submit(
    client: &OwnerClient,
    route: Route,
    command: impl FnOnce(
        &layerfs_daemon::OwnerClient,
        layerfs_overlay::Route,
    ) -> Result<layerfs_daemon::JobReceipt, layerfs_daemon::OwnerError>,
) -> JobReceipt {
    command(client, route).unwrap_or_else(|error| panic!("{error:?}"))
}
fn open(client: &OwnerClient, tag: u8) -> Route {
    let done = client
        .open(None, [tag; 32], [3; 32])
        .unwrap_or_else(|error| panic!("{error:?}"));
    match done.result() {
        Ok(Response::Opened(route)) => *route,
        result => panic!("{result:?}"),
    }
}
fn scope(client: &OwnerClient, route: Route, request: u64) -> IndexedOperationRecordScope {
    let done = submit(
        client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.acquire_operation(job_route, request)
        },
    );
    match done.result() {
        Ok(Response::Operation(Some(owner))) => IndexedOperationRecordScope {
            owner: *owner,
            file_scope: u64::MAX,
        },
        result => panic!("{result:?}"),
    }
}
fn key(number: u64) -> IndexedOperationRecordKey {
    let mut key = [0; 32];
    key[24..].copy_from_slice(&number.to_be_bytes());
    IndexedOperationRecordKey { kind: 9, key }
}
fn put(key: IndexedOperationRecordKey, value: Vec<u8>) -> IndexedOperationRecordChange {
    IndexedOperationRecordChange {
        key,
        expected: OperationRecordExpectedValue::Missing,
        value: Some(value),
    }
}
fn operation_record(
    client: &OwnerClient,
    scope: IndexedOperationRecordScope,
    job: IndexedOperationRecordJob,
) -> JobReceipt {
    submit(
        client,
        scope.owner.route(),
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.indexed_operation_record(job_route, Box::new(job))
        },
    )
}
#[test]
fn original_atomic_refusal_and_credits_survive_independent_owner_jobs() {
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let route = open(&client, 171);
    let other = open(&client, 172);
    let scope = scope(&client, route, 1);
    let done = operation_record(
        &client,
        scope,
        IndexedOperationRecordJob::Apply {
            scope,
            changes: vec![put(key(1), vec![7; 8192])],
        },
    );
    assert!(matches!(
        done.result(),
        Ok(Response::IndexedOperationRecord(
            IndexedOperationRecordReply::Applied(IndexedOperationRecordApply::Applied)
        ))
    ));
    assert!(done.work().sql.total().vm_steps > 0);
    drop(done);
    let deciding = operation_record(
        &client,
        scope,
        IndexedOperationRecordJob::Apply {
            scope,
            changes: vec![
                put(key(0), vec![3]),
                IndexedOperationRecordChange {
                    key: key(1),
                    expected: OperationRecordExpectedValue::ExactBytes(vec![99]),
                    value: None,
                },
            ],
        },
    );
    match deciding.result() {
        Ok(Response::IndexedOperationRecord(IndexedOperationRecordReply::Applied(
            IndexedOperationRecordApply::NotApplied {
                index,
                key: found,
                actual,
            },
        ))) => {
            assert_eq!((*index, *found), (1, key(1)));
            assert_eq!(actual.as_deref(), Some([7; 8192].as_slice()));
        }
        result => panic!("{result:?}"),
    }
    let healthy = submit(
        &client,
        other,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.state(job_route),
    );
    assert!(healthy.result().is_ok());
    drop(healthy);
    let missed = operation_record(
        &client,
        scope,
        IndexedOperationRecordJob::Contains { scope, key: key(0) },
    );
    assert!(matches!(
        missed.result(),
        Ok(Response::IndexedOperationRecord(
            IndexedOperationRecordReply::Contains(false)
        ))
    ));
    assert_eq!(
        missed.work().sql.total().returned_blob_bytes,
        0 // The fence reads no Workspace BLOB; membership projects no draft BLOB.
    );
    drop(missed);
    drop(deciding);
    let wrong_route = submit(
        &client,
        other,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.indexed_operation_record(
                job_route,
                Box::new(IndexedOperationRecordJob::Get { scope, key: key(1) }),
            )
        },
    );
    assert!(matches!(
        wrong_route.result(),
        Err(OwnerError::Overlay(OverlayError::Stale))
    ));
    drop(wrong_route);
    let value = operation_record(
        &client,
        scope,
        IndexedOperationRecordJob::Get { scope, key: key(1) },
    );
    assert!(
        matches!(value.result(), Ok(Response::IndexedOperationRecord(IndexedOperationRecordReply::Value(Some(bytes)))) if bytes == &vec![7; 8192])
    );
    drop(value);
    owner.stop().unwrap();
}

#[test]
fn released_indexed_rows_reclaim_automatically_and_close_preserves_actual_owner() {
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let route = open(&client, 173);
    let other = open(&client, 174);
    let scope = scope(&client, route, 1);
    for number in 0..72 {
        let done = operation_record(
            &client,
            scope,
            IndexedOperationRecordJob::Apply {
                scope,
                changes: vec![put(key(number), vec![5; 6000])],
            },
        );
        assert!(matches!(
            done.result(),
            Ok(Response::IndexedOperationRecord(
                IndexedOperationRecordReply::Applied(IndexedOperationRecordApply::Applied)
            ))
        ));
    }
    let done = operation_record(
        &client,
        scope,
        IndexedOperationRecordJob::FirstKeys {
            scope,
            kind: 9,
            excluded_root: key(0).key,
        },
    );
    match done.result() {
        Ok(Response::IndexedOperationRecord(IndexedOperationRecordReply::Keys(keys))) => {
            assert_eq!(keys.len(), 64);
            assert_eq!(keys.first(), Some(&key(1).key));
        }
        result => panic!("{result:?}"),
    }
    drop(done);
    assert!(submit(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.close(job_route)
    )
    .result()
    .is_ok());
    let read = operation_record(
        &client,
        scope,
        IndexedOperationRecordJob::Get { scope, key: key(1) },
    );
    assert!(
        matches!(read.result(), Ok(Response::IndexedOperationRecord(IndexedOperationRecordReply::Value(Some(bytes)))) if bytes.len() == 6000)
    );
    drop(read);
    let denied = operation_record(
        &client,
        scope,
        IndexedOperationRecordJob::Apply {
            scope,
            changes: vec![put(key(99), vec![])],
        },
    );
    assert!(matches!(
        denied.result(),
        Err(OwnerError::Overlay(OverlayError::Closed))
    ));
    drop(denied);
    let resources = submit(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.resources(Some(job_route), false)
        },
    );
    assert!(
        matches!(resources.result(), Ok(Response::Resources(r)) if r.counts.operation_record_rows == 72 && r.counts.operation_record_bytes == 72 * 6000)
    );
    drop(resources);
    assert!(submit(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
            .release_operation(job_route, scope.owner)
    )
    .result()
    .is_ok());
    let deadline = Instant::now() + Duration::from_secs(3);
    loop {
        let resources = submit(
            &client,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.resources(Some(job_route), false)
            },
        );
        if matches!(resources.result(), Ok(Response::Resources(r)) if r.counts.operation_record_rows == 0 && r.counts.namespaces == 1)
        {
            break;
        }
        assert!(
            Instant::now() < deadline,
            "automatic indexed cleanup did not finish"
        );
        drop(resources);
        std::thread::yield_now();
    }
    let peer = submit(
        &client,
        other,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.resources(Some(job_route), false)
        },
    );
    assert!(
        matches!(peer.result(), Ok(Response::Resources(r)) if r.counts.namespaces == 1 && r.counts.operation_record_rows == 0)
    );
    drop(peer);
    assert!(client.diagnostics().unwrap().maintenance_data_bytes >= 72 * 6000);
    assert!(client.maintenance_failure().unwrap().is_none());
    owner.stop().unwrap();
}
