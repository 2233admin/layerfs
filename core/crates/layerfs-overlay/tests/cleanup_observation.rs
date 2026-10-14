mod payload_support;
use layerfs_overlay::{CleanupState, OverlayError};
use payload_support::Temp;

#[test]
fn observation_keeps_exact_live_and_held_file_disposal_state() {
    let temp = Temp::new();
    let db = temp.db();
    let incarnation = [71; 32];
    let route = db.open_workspace(incarnation, [72; 32]).unwrap();
    let ns = route.namespace();
    assert_eq!(
        db.observe_cleanup(ns, incarnation).unwrap(),
        CleanupState::Live
    );
    assert!(matches!(
        db.observe_cleanup(ns, [73; 32]),
        Err(OverlayError::Stale)
    ));
    assert!(matches!(
        db.observe_cleanup(0, incarnation),
        Err(OverlayError::Stale)
    ));
    assert!(matches!(
        db.observe_cleanup(ns, [0; 32]),
        Err(OverlayError::Stale)
    ));
    assert!(matches!(
        db.observe_cleanup(ns + 1, incarnation),
        Err(OverlayError::Stale)
    ));

    let source = db.acquire_base_source(route, 1).unwrap();
    db.close(route).unwrap();
    let before = db.resources(Some(route)).unwrap().counts;
    for _ in 0..2 {
        let sql = db.diagnostics();
        assert_eq!(
            db.observe_cleanup(ns, incarnation).unwrap(),
            CleanupState::Held
        );
        let work = db.diagnostics().since(&sql).total();
        // The custody search alone: the Workspace row is remembered.
        assert_eq!(work.executions, 1);
        assert_eq!(work.rows_changed, 0);
        assert_eq!(work.direct_rows_changed, 0);
    }
    assert_eq!(db.resources(Some(route)).unwrap().counts, before);
    db.release_base_source(source).unwrap();
    assert_eq!(
        db.observe_cleanup(ns, incarnation).unwrap(),
        CleanupState::Queued
    );
    // This live engine cannot assert file deletion. The daemon owns checked
    // close/unlink and its separate observer proves Gone after last release.
    // The database stays this Workspace's until its file is disposed.
    assert!(matches!(
        db.open_workspace([74; 32], [72; 32]),
        Err(OverlayError::Invalid(_))
    ));
    assert_eq!(
        db.observe_cleanup(ns, incarnation).unwrap(),
        CleanupState::Queued
    );
}
