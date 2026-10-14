//! Real calling-thread jobs, retained panic custody and independent Workspaces.
use layerfs_daemon::{Owner, OwnerConfig, OwnerError, Response, ServiceClass};
use layerfs_overlay::{ProfileConfig, Route, StatementKind};
use std::sync::Arc;
fn opened(owner: &layerfs_daemon::OwnerClient, tag: u8) -> Route {
    let done = owner.open(None, [tag; 32], [9; 32]).unwrap();
    match done.result() {
        Ok(Response::Opened(route)) => *route,
        other => panic!("{other:?}"),
    }
}
#[test]
fn a_panic_retains_its_connection_and_fails_only_that_workspace() {
    let directory =
        std::env::temp_dir().join(format!("layerfs-direct-panic-{}", std::process::id()));
    std::fs::create_dir(&directory).unwrap();
    let owner = Owner::start(
        &directory.join("template.sqlite"),
        ProfileConfig::default(),
        OwnerConfig { namespaces: 2 },
    )
    .unwrap();
    let root = owner.client();
    let a_route = opened(&root, 31);
    let b_route = opened(&root, 32);
    let a = root.workspace_client(a_route).unwrap();
    let b = root.workspace_client(b_route).unwrap();
    let before = a.diagnostics().unwrap();
    let failed = a
        .job(a_route, ServiceClass::Read, move |db, _| {
            db.state(a_route)?;
            std::panic::panic_any("original Workspace panic");
        })
        .unwrap();
    assert_eq!(failed.work().class, Some(ServiceClass::Read));
    assert_eq!(
        failed
            .work()
            .sql
            .family(StatementKind::Workspace)
            .unwrap()
            .executions,
        1
    );
    let original = match failed.result() {
        Err(OwnerError::Retained(cause)) => cause.clone(),
        other => panic!("{other:?}"),
    };
    match original.as_ref() {
        OwnerError::WorkspacePanicked(panic) => assert_eq!(
            panic.payload.lock().unwrap().downcast_ref::<&str>(),
            Some(&"original Workspace panic")
        ),
        other => panic!("{other:?}"),
    }
    let refused = a.state(a_route).unwrap_err();
    match &refused {
        OwnerError::Unattempted { cause, .. } => match cause.as_ref() {
            OwnerError::Retained(cause) => assert!(Arc::ptr_eq(cause, &original)),
            other => panic!("{other:?}"),
        },
        other => panic!("{other:?}"),
    }
    let after = a.diagnostics().unwrap();
    assert_eq!(
        after
            .sql_foreground
            .since(&before.sql_foreground)
            .total()
            .executions,
        1
    );
    let peer = b.state(b_route).unwrap();
    assert!(matches!(peer.result(), Ok(Response::State(_))));
    drop(peer);
    assert!(directory.join("1.sqlite").exists());
    assert!(directory.join("2.sqlite").exists());
    // Daemon stop still retains the original failure and makes no close replay.
    assert!(matches!(owner.stop(), Err(OwnerError::Retained(_))));
    assert!(directory.join("1.sqlite").exists());
    drop((failed, refused, a, b, root, original));
    // External proof-fixture disposal is not product unmount/Gone evidence.
    std::fs::remove_dir_all(directory).unwrap();
}
