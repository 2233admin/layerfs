use layerfs_daemon::*;
use layerfs_overlay::ProfileConfig;
use std::sync::atomic::{AtomicU64, Ordering};

#[test]
fn receipt_cost_matches_the_connection_aggregate_of_its_one_job() {
    static NEXT: AtomicU64 = AtomicU64::new(1);
    let path = std::env::temp_dir().join(format!(
        "layerfs-job-cost-{}-{}",
        std::process::id(),
        NEXT.fetch_add(1, Ordering::Relaxed)
    ));
    std::fs::create_dir(&path).unwrap();
    let owner = Owner::start(
        &path.join("overlay.sqlite"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let before = client.diagnostics().unwrap();
    let done = client.open(None, [241; 32], [242; 32]).unwrap();
    assert!(matches!(done.result(), Ok(Response::Opened(_))));
    let after = client.diagnostics().unwrap();
    let sql = after.sql_foreground.since(&before.sql_foreground);
    assert_eq!(done.work().sql.expanded(), sql);
    assert_eq!(done.work().sql.total(), sql.total());
    assert_eq!(
        done.work().allocation,
        after
            .allocation_foreground
            .since(before.allocation_foreground)
    );
    assert_eq!(done.work().allocation.freelist_queries, 0);
    assert_eq!(
        (done.work().jobs, done.work().class),
        (1, Some(ServiceClass::Lifecycle))
    );
    println!(
        "S7_OWNER_COST receipt={:?} aggregate={after:?}",
        done.work()
    );
    drop(done);
    owner.stop().unwrap();
    std::fs::remove_dir_all(path).unwrap();
}
