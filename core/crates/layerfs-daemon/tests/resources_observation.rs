//! Route-free Resources uses one original bounded read job and actual SQL work.
use layerfs_daemon::application::{ResourceDiagnosticError, ResourceFailure, ResourceObservation};
use layerfs_daemon::{Owner, OwnerConfig, OwnerError, Response, ServiceClass};
use layerfs_overlay::{CleanupState, ProfileConfig, StatementKind};
use std::fs;
#[test]
fn stopped_operator_observation_retains_the_exact_unattempted_command() {
    let directory =
        std::env::temp_dir().join(format!("layerfs-resource-stopped-{}", std::process::id()));
    fs::create_dir(&directory).unwrap();
    let owner = Owner::start(
        &directory.join("overlay.sqlite"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    drop(owner);
    let before = client.diagnostics().unwrap();
    let error = ResourceObservation::acquire(&client)
        .into_diagnostic_error(None)
        .unwrap();
    let carrier = error
        .get_ref()
        .unwrap()
        .downcast_ref::<ResourceDiagnosticError>()
        .unwrap();
    assert!(carrier.output.is_none());
    {
        let original = carrier.original.lock().unwrap();
        match &*original {
            ResourceFailure::BeforeEffect(OwnerError::Unattempted { cause, input }) => {
                assert!(matches!(cause.as_ref(), OwnerError::Stopped));
                input.inspect::<(Option<layerfs_overlay::Route>, bool), _>(|value| {
                    assert_eq!(value, Some(&(None, true)))
                });
            }
            other => panic!("{other:?}"),
        }
    }
    let after = client.diagnostics().unwrap();

    assert_eq!(after.sql_foreground, before.sql_foreground);
    drop(error);
    drop(client);
    fs::remove_dir_all(directory).unwrap();
}
#[cfg(target_os = "linux")]
#[test]
fn failed_resource_receipt_and_real_output_failure_keep_both_originals() {
    use std::io::Write;
    let directory =
        std::env::temp_dir().join(format!("layerfs-resource-identity-{}", std::process::id()));
    fs::create_dir(&directory).unwrap();
    let backing = directory.join("overlay.sqlite");
    let owner = Owner::start(&backing, ProfileConfig::default(), OwnerConfig::default()).unwrap();
    let client = owner.client();
    // A real external identity change in this test's own backing directory;
    // no product hook, mocked engine or failed-operation replay is involved.
    fs::rename(&backing, directory.join("original.sqlite")).unwrap();
    fs::write(&backing, b"different physical inode").unwrap();
    let observed = ResourceObservation::acquire(&client);

    let output = fs::File::options()
        .write(true)
        .open("/dev/full")
        .unwrap()
        .write(b"numeric diagnostic fixture")
        .unwrap_err();
    assert_eq!(output.raw_os_error(), Some(28));
    let error = observed.into_diagnostic_error(Some(output)).unwrap();
    let carrier = error
        .get_ref()
        .unwrap()
        .downcast_ref::<ResourceDiagnosticError>()
        .unwrap();
    assert_eq!(carrier.output.as_ref().unwrap().raw_os_error(), Some(28));
    {
        let original = carrier.original.lock().unwrap();
        let completion = match &*original {
            ResourceFailure::Result(completion) => completion,
            other => panic!("{other:?}"),
        };
        assert!(matches!(
            completion.result(),
            Err(OwnerError::Overlay(layerfs_overlay::OverlayError::Invalid(
                "allocation path identity"
            )))
        ));
        assert_eq!(completion.work().sql.total().executions, 0);
    }

    drop(error);
    drop(client);
    drop(owner);
    fs::remove_dir_all(directory).unwrap();
}

#[test]
fn global_resources_is_read_only_before_bind_and_after_raw_close() {
    let directory = std::env::temp_dir().join(format!(
        "layerfs-resource-observation-{}",
        std::process::id()
    ));
    fs::create_dir(&directory).unwrap();
    let owner = Owner::start(
        &directory.join("overlay.sqlite"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let before = client.diagnostics().unwrap();
    let done = client.resources(None, true).unwrap();
    let resources = match done.result() {
        Ok(Response::Resources(resources)) => **resources,
        other => panic!("{other:?}"),
    };
    assert_eq!(resources.counts.namespaces, 0);
    // Before bind the template connection is closed. Its immutable logical
    // counts need no SQL; the retained physical identity is actually observed.
    assert_eq!(done.work().sql.total().attempts, 0);
    assert!(done.work().sql.family(StatementKind::Begin).is_none());
    assert!(done.work().sql.family(StatementKind::Commit).is_none());
    assert_eq!(done.work().allocation.observations, 1);

    drop(done);
    let after = client.diagnostics().unwrap();

    assert_eq!(
        after.jobs[ServiceClass::Read as usize] - before.jobs[ServiceClass::Read as usize],
        0,
        "roster composition holds no Workspace connection"
    );

    let refusal = client.resources(None, false).unwrap_err();
    assert!(
        matches!(refusal, OwnerError::Unattempted { cause, .. } if matches!(cause.as_ref(), OwnerError::InvalidAdmission))
    );
    let open = client.open(None, [7; 32], [8; 32]).unwrap();
    let route = match open.result() {
        Ok(Response::Opened(route)) => *route,
        other => panic!("{other:?}"),
    };
    drop(open);
    let routed = client.resources(Some(route), true).unwrap();
    assert!(
        matches!(routed.result(),Ok(Response::Resources(resources)) if resources.counts.namespaces==1)
    );
    assert_eq!(
        routed
            .work()
            .sql
            .family(StatementKind::Workspace)
            .unwrap()
            .executions,
        1,
        "routed validation retained"
    );
    drop(routed);
    let closed = client.close(Some(route)).unwrap();
    assert!(matches!(closed.result(), Ok(Response::Done)));
    drop(closed);
    // Raw Close records the drain state. Whole-file disposal belongs to
    // terminal control, covered by workspace_databases and mounted_drain.
    let observed = client
        .observe_cleanup(None, route.namespace(), [7; 32])
        .unwrap();
    assert!(matches!(
        observed.result(),
        Ok(Response::CleanupState(CleanupState::Queued))
    ));
    drop(observed);
    let pending = client.resources(None, true).unwrap();
    let final_resources = pending;
    assert!(
        matches!(final_resources.result(),Ok(Response::Resources(resources)) if resources.counts.namespaces==1)
    );
    assert_eq!(
        final_resources
            .work()
            .sql
            .family(StatementKind::Startup)
            .unwrap()
            .executions,
        3
    );
    drop(final_resources);
    drop(client);
    drop(owner);
    fs::remove_dir_all(directory).unwrap();
}
