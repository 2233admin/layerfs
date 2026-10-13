//! Native typed jobs over the real owner and a sealed, installed Store fixture.
#[path = "support/installed_store.rs"]
mod support;
use layerfs_daemon::{
    bootstrap::open_store, store::BindRequest, JobReceipt, NativeDirectoryReply, NativeReply,
    Owner, OwnerClient, OwnerConfig, Response,
};
use layerfs_history::WorkspaceId;
use layerfs_overlay::{ProfileConfig, Route, StatementKind};
use layerfs_workspace::{
    BaseView, NativeReadDecision, NativeReadOperation, NativeReadOutcome, NativeReadVisit,
    VisitFacts,
};
use std::sync::Arc;
fn job(
    client: &OwnerClient,
    route: Route,
    command: impl FnOnce(
        &layerfs_daemon::OwnerClient,
        Option<layerfs_overlay::Route>,
    ) -> Result<layerfs_daemon::JobReceipt, layerfs_daemon::OwnerError>,
) -> JobReceipt {
    command(client, Some(route)).unwrap_or_else(|error| panic!("{error:?}"))
}
/// An OPEN or OPENDIR owner visit until it decides, reading outside the
/// owner the base facts an undecided visit names.
fn visit(
    client: &OwnerClient,
    route: Route,
    base: &BaseView,
    make: impl Fn(Arc<VisitFacts>) -> NativeReadVisit,
) -> (Arc<NativeReadOutcome>, JobReceipt) {
    let mut facts = VisitFacts::default();
    for _ in 0..4 {
        let done = job(
            client,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.native_observe_visit(job_route, Box::new(make(Arc::new(facts.clone()))))
            },
        );
        let original = match done.result() {
            Ok(Response::Native(NativeReply::Observed(original))) => original.clone(),
            other => panic!("{other:?}"),
        };
        match &original.decision {
            Some(NativeReadDecision::Value(_)) => return (original, done),
            Some(NativeReadDecision::Needs(needs)) => {
                drop(done);
                facts.supply(base, needs, None).unwrap();
            }
            other => panic!("{other:?}"),
        }
    }
    panic!("bounded visit fact rounds")
}
#[test]
fn native_lookup_uses_actual_owner_and_preserves_original_receipt_until_disposal() {
    let f = support::Fixture::new(1, "native-jobs");
    assert_eq!(f.count, 1);
    let store = open_store(
        f.config.clone(),
        support::BINDING,
        support::CURSOR,
        2,
        0,
        Default::default(),
    )
    .unwrap();
    let owner = Owner::start(
        &f.directory.join("native-overlay"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let bound = store
        .bind(
            client.clone(),
            BindRequest {
                branch: f.branch,
                workspace: WorkspaceId::from_authority([83; 32]).unwrap(),
            },
        )
        .unwrap()
        .workspace;
    let route = bound.route();
    let operation = bound.operation().unwrap();
    let root = operation
        .workspace()
        .base()
        .unwrap()
        .root()
        .root_inode()
        .serial();
    let done = job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.native_mount(job_route, root)
        },
    );
    let mount = match done.result() {
        Ok(Response::Native(NativeReply::Mount(mount))) => *mount,
        other => panic!("{other:?}"),
    };
    drop(done);
    // LOOKUP is owner visits that record no request source; the base facts
    // an undecided visit names are read outside the owner.
    let base = operation.workspace().base().unwrap();
    let (original, receipt) = visit(&client, route, &base, |facts| {
        operation
            .workspace()
            .native_read_visit(
                operation.resident(),
                mount,
                root,
                None,
                NativeReadOperation::Lookup {
                    parent: root,
                    name: layerfs_content::filesystem::PathName::new("file-000000").unwrap(),
                },
                facts,
            )
            .unwrap()
    });
    let stat: layerfs_workspace::ViewStat = match &original.decision {
        Some(NativeReadDecision::Value(inode)) => inode.clone().into(),
        other => panic!("{other:?}"),
    };
    assert_eq!(stat.logical_len, support::bytes(0).len() as u64);
    assert!(receipt.work().sql.family(StatementKind::Begin).is_none());
    assert!(receipt.work().sql.family(StatementKind::Commit).is_none());
    let serial = stat.serial;
    drop((original, receipt));
    // OPEN is one owner visit that records no request source: the visit
    // that decides the file writes its descriptor.
    let (original, receipt) = visit(&client, route, &base, |facts| {
        operation
            .workspace()
            .native_open_visit(
                operation.resident(),
                mount,
                u64::MAX - 1,
                serial,
                false,
                facts,
            )
            .unwrap()
    });
    let file = original.open_candidate.unwrap();
    assert!(!file.writable());
    assert!(receipt.work().sql.family(StatementKind::Begin).is_none());
    assert!(receipt.work().sql.family(StatementKind::Commit).is_none());
    let done = job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.native_retained_file(job_route, mount, u64::MAX - 1)
        },
    );
    assert!(
        matches!(done.result(), Ok(Response::Native(NativeReply::RetainedFile(Some(retained)))) if *retained == file)
    );
    drop(done);
    drop((original, receipt));
    assert!(job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
            .native_forget(job_route, mount, serial, 1)
    )
    .result()
    .is_ok());
    assert!(job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.native_close_file(
            job_route,
            mount,
            serial,
            file.owner_id()
        )
    )
    .result()
    .is_ok());
    assert!(job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.native_file(
            job_route,
            mount,
            serial,
            file.owner_id()
        )
    )
    .result()
    .is_err());
    // OPENDIR is the same visit and writes the directory's descriptor.
    let (original, opened) = visit(&client, route, &base, |facts| {
        operation
            .workspace()
            .native_opendir_visit(operation.resident(), mount, 100, root, facts)
            .unwrap()
    });
    let directory = original.directory_candidate.unwrap();
    drop((original, opened));
    // READDIR is a reading visit, the request's own merge and fill, and a
    // publishing visit of the accepted names. Neither job reaches the Store.
    let visit = operation
        .workspace()
        .native_directory_visit(
            operation.resident(),
            mount,
            directory.serial(),
            directory.owner_id(),
            2,
            None,
        )
        .unwrap();
    let before = store.work();
    let window_reply = job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| {
            job_client.native_directory_visit(job_route, visit)
        },
    );
    assert_eq!(store.work(), before, "directory owner made Store demand");
    let window = match window_reply.result() {
        Ok(Response::Native(NativeReply::Directory(NativeDirectoryReply::Window(window)))) => {
            (**window).clone()
        }
        other => panic!("{other:?}"),
    };
    drop(window_reply);
    let batch = window
        .finish(Some(&operation.workspace().base().unwrap()))
        .unwrap();
    assert_eq!(batch.entries.len(), 1);
    let offer = batch.publish.expect("a fresh reply publishes its names");
    let names: Vec<_> = batch.entries.into_iter().map(|entry| entry.name).collect();
    let before = store.work();
    assert!(job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.native_directory_publish(
            job_route,
            offer.clone(),
            names.clone()
        )
    )
    .result()
    .is_ok());
    assert_eq!(store.work(), before, "directory owner made Store demand");
    assert!(job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.native_directory_close(
            job_route,
            mount,
            directory.serial(),
            directory.owner_id()
        )
    )
    .result()
    .is_ok());
    // A reply racing RELEASEDIR publishes nothing, and neither visit left
    // anything that could hold the mount.
    assert!(job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
            .native_directory_publish(job_route, offer, names)
    )
    .result()
    .is_err());
    assert!(job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
            .native_revoke(job_route, mount)
    )
    .result()
    .is_ok());
    assert!(job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.close(job_route)
    )
    .result()
    .is_ok());
    assert_eq!(client.diagnostics().unwrap().closed_namespaces, 0);
    let observed = job(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.cleanup_state(job_route),
    );
    assert!(matches!(
        observed.result(),
        Ok(Response::CleanupState(
            layerfs_overlay::CleanupState::Queued
        ))
    ));
    drop(observed);
    assert!(client.maintenance_failure().unwrap().is_none());
    drop((base, operation, bound, store));
    owner.stop().unwrap();
    f.cleanup();
}
