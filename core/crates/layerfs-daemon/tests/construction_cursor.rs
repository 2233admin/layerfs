//! Real credited range jobs and first-original construction adapter custody.
use layerfs_content::{
    ConstructionRecordApply, ConstructionRecordChange, ConstructionRecordExpected,
    ConstructionRecordKey, ContentError, ContentResult, IndexedConstructionBacking,
};
use layerfs_daemon::{JobReceipt, Owner, OwnerClient, OwnerConfig, OwnerError, Response};
use layerfs_overlay::{
    IndexedOperationRecordKey, IndexedOperationRecordScope, OverlayError, ProfileConfig, Route,
};
use layerfs_workspace::{
    IndexedConstructionRecords, OperationRecordApply, OperationRecordReply,
    OverlayOperationRecords, WorkspaceError, WorkspaceResult,
};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
};

struct Temp(PathBuf);
impl Temp {
    fn new() -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(0);
        let path = std::env::temp_dir().join(format!(
            "layerfs-construction-cursor-{}-{}",
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
fn job(
    client: &OwnerClient,
    route: Route,
    command: impl FnOnce(
        &layerfs_daemon::OwnerClient,
        layerfs_overlay::Route,
    ) -> Result<layerfs_daemon::JobReceipt, layerfs_daemon::OwnerError>,
) -> JobReceipt {
    command(client, route).unwrap_or_else(|error| panic!("{error:?}"))
}
fn scope(client: &OwnerClient, tag: u8) -> IndexedOperationRecordScope {
    let opened = client
        .open(None, [tag; 32], [4; 32])
        .unwrap_or_else(|error| panic!("{error:?}"));
    let route = match opened.result() {
        Ok(Response::Opened(route)) => *route,
        v => panic!("{v:?}"),
    };
    drop(opened);
    let acquired = job(
        client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.acquire_operation(job_route, 1)
        },
    );
    let owner = match acquired.result() {
        Ok(Response::Operation(Some(owner))) => *owner,
        v => panic!("{v:?}"),
    };
    IndexedOperationRecordScope {
        owner,
        file_scope: u64::MAX,
    }
}
fn key(number: u64) -> ConstructionRecordKey {
    let mut key = [0; 32];
    key[24..].copy_from_slice(&number.to_be_bytes());
    ConstructionRecordKey { kind: 27, key }
}
fn put(number: u64) -> ConstructionRecordChange {
    ConstructionRecordChange {
        key: key(number),
        expected: ConstructionRecordExpected::Missing,
        value: Some(vec![number as u8]),
    }
}
fn release(client: &OwnerClient, scope: IndexedOperationRecordScope) {
    assert!(job(
        client,
        scope.owner.route(),
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
            .release_operation(job_route, scope.owner)
    )
    .result()
    .is_ok());
}
#[test]
fn real_owner_preserves_sealed_keys_and_observes_bounded_reply_copies() {
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let scope = scope(&client, 191);
    let mut records = IndexedConstructionRecords::new(&client, scope);
    let changes = (0..130).map(put).collect();
    assert_eq!(
        records.apply(changes).unwrap(),
        ConstructionRecordApply::Applied
    );
    let initial = records.work();
    let mut after = None;
    let mut count = 0;
    for expected in [64, 64, 2, 0] {
        let keys = records.keys_after(27, after).unwrap();
        assert_eq!(keys.len(), expected);
        assert!(keys.capacity() <= 64);
        for actual in &keys {
            assert_eq!(*actual, key(count).key);
            count += 1;
        }
        if let Some(last) = keys.last() {
            after = Some(*last);
        }
    }
    assert_eq!(count, 130);
    let observed = records.work();
    assert_eq!(
        observed.copied_reply_bytes - initial.copied_reply_bytes,
        130 * 32
    );
    assert_eq!(observed.reply_allocations - initial.reply_allocations, 3);
    assert!(observed.peak_reply_capacity_bytes <= 64 * 32);
    assert_eq!(records.get(key(0)).unwrap(), Some(vec![0]));
    assert_eq!(records.get(key(129)).unwrap(), Some(vec![129]));
    assert_eq!(records.keys_after(27, None).unwrap()[0], [0; 32]);
    drop(records.into_custody());
    release(&client, scope);
    owner.stop().unwrap();
}

#[test]
fn attempted_and_unattempted_range_failures_keep_original_custody_without_resend() {
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let first = scope(&client, 193);
    let healthy = scope(&client, 194);
    release(&client, first);
    let mut failed = IndexedConstructionRecords::new(&client, first);
    assert!(failed.keys_after(27, Some(key(81).key)).is_err());
    let original = match failed.failure().unwrap() {
        WorkspaceError::Service(error) => error.downcast_ref::<JobReceipt>().unwrap(),
        v => panic!("{v:?}"),
    };
    assert!(matches!(
        original.result(),
        Err(OwnerError::Overlay(OverlayError::Stale))
    ));
    let before = client.diagnostics().unwrap();
    let calls = failed.work().calls;
    assert!(failed.keys_after(27, None).is_err());
    assert!(failed.contains(key(0)).is_err());
    assert!(failed.apply(vec![put(0)]).is_err());
    assert_eq!(failed.work().calls, calls);
    assert_eq!(
        client.diagnostics().unwrap().jobs.iter().sum::<u64>(),
        before.jobs.iter().sum::<u64>()
    );
    let mut other = IndexedConstructionRecords::new(&client, healthy);
    assert_eq!(
        other.apply(vec![put(0)]).unwrap(),
        ConstructionRecordApply::Applied
    );
    assert_eq!(other.keys_after(27, None).unwrap(), vec![key(0).key]);
    drop(failed.into_custody());
    drop(other.into_custody());
    release(&client, healthy);
    owner.stop().unwrap();
    let mut stopped = IndexedConstructionRecords::new(&client, healthy);
    let boundary = key(99).key;
    assert!(stopped.keys_after(27, Some(boundary)).is_err());
    // Stopped before any effect: the unattempted action owns its original
    // cursor job and is not replayed.
    match stopped.failure().unwrap() {
        WorkspaceError::Service(error) => assert!(matches!(
            error.downcast_ref::<OwnerError>().unwrap(),
            OwnerError::Unattempted { cause, .. } if matches!(cause.as_ref(), OwnerError::Stopped)
        )),
        v => panic!("{v:?}"),
    };
    assert!(stopped.keys_after(27, None).is_err());
    assert_eq!(stopped.work().calls, 1);
}

struct OlderProvider;
impl IndexedConstructionBacking for OlderProvider {
    fn contains(&mut self, _: ConstructionRecordKey) -> ContentResult<bool> {
        panic!("no membership substitute")
    }
    fn get(&mut self, _: ConstructionRecordKey) -> ContentResult<Option<Vec<u8>>> {
        panic!("no point substitute")
    }
    fn apply(
        &mut self,
        _: Vec<ConstructionRecordChange>,
    ) -> ContentResult<ConstructionRecordApply> {
        panic!("no mutation substitute")
    }
    fn first_keys(&mut self, _: u32, _: Option<[u8; 32]>) -> ContentResult<Vec<[u8; 32]>> {
        panic!("no destructive traversal substitute")
    }
}
impl OverlayOperationRecords for OlderProvider {
    fn operation_record_contains(
        &self,
        _: IndexedOperationRecordScope,
        _: IndexedOperationRecordKey,
    ) -> WorkspaceResult<OperationRecordReply<bool>> {
        panic!("no membership substitute")
    }
    fn operation_record_get(
        &self,
        _: IndexedOperationRecordScope,
        _: IndexedOperationRecordKey,
    ) -> WorkspaceResult<OperationRecordReply<Option<Vec<u8>>>> {
        panic!("no point substitute")
    }
    fn operation_record_apply(
        &self,
        _: IndexedOperationRecordScope,
        _: Vec<layerfs_overlay::IndexedOperationRecordChange>,
    ) -> WorkspaceResult<OperationRecordReply<OperationRecordApply>> {
        panic!("no mutation substitute")
    }
    fn operation_record_keys(
        &self,
        _: IndexedOperationRecordScope,
        _: u32,
        _: Option<[u8; 32]>,
    ) -> WorkspaceResult<OperationRecordReply<Vec<[u8; 32]>>> {
        panic!("no destructive traversal substitute")
    }
}

#[test]
fn unavailable_capability_retains_typed_original_without_provider_substitution() {
    let original = ContentError::ProviderFailure {
        what: "indexed construction key enumeration unavailable",
    };
    assert_eq!(OlderProvider.keys_after(27, None), Err(original.clone()));
    let temp = Temp::new();
    let owner = Owner::start(
        &temp.0.join("db"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let scope = scope(&client, 197);
    let before = client.diagnostics().unwrap();
    let provider = OlderProvider;
    let mut records = IndexedConstructionRecords::new(&provider, scope);
    assert!(records.keys_after(27, Some(key(42).key)).is_err());
    assert!(matches!(records.failure(),Some(WorkspaceError::Content(error)) if *error==original));
    assert_eq!(records.work().calls, 1);
    assert!(records.keys_after(27, None).is_err());
    assert!(records.get(key(0)).is_err());
    assert!(records.first_keys(27, None).is_err());
    assert_eq!(records.work().calls, 1);
    assert_eq!(records.work().terminal_calls, 3);
    assert_eq!(
        client.diagnostics().unwrap().jobs.iter().sum::<u64>(),
        before.jobs.iter().sum::<u64>()
    );
    let custody = records.into_custody();
    assert_eq!(custody.scope, scope);
    assert!(matches!(&custody.failure,Some(WorkspaceError::Content(error)) if *error==original));
    drop(custody);
    release(&client, scope);
    owner.stop().unwrap();
}
