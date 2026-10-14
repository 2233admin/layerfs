//! Real owner plus automatic idle reclamation on an exclusively owned ext4 fixture.
#![cfg(target_os = "linux")]
use layerfs_daemon::{JobReceipt, Owner, OwnerClient, OwnerConfig, OwnerError, Response};
use layerfs_overlay::{Cell, Inode, InodeKind, Lease, LeaseKind, ProfileConfig, Route};
use std::{fs::OpenOptions, io::Write, path::PathBuf};
fn run(
    client: &OwnerClient,
    route: Route,
    command: impl FnOnce(
        &layerfs_daemon::OwnerClient,
        layerfs_overlay::Route,
    ) -> Result<layerfs_daemon::JobReceipt, layerfs_daemon::OwnerError>,
) -> JobReceipt {
    command(client, route).unwrap_or_else(|error| panic!("{error:?}"))
}
fn resources(client: &OwnerClient, _route: Route) -> layerfs_overlay::Resources {
    match client
        .resources(None, true)
        .unwrap_or_else(|error| panic!("{error:?}"))
        .result()
    {
        Ok(Response::Resources(r)) => **r,
        x => panic!("{x:?}"),
    }
}
#[test]
#[ignore = "requires exclusively owned ext4 loop fixture; device_fixture.sh daemon"]
fn real_owner_reclaims_at_device_full_after_last_owner_without_a_cleanup_job() {
    let root = PathBuf::from(std::env::var_os("LAYERFS_PROOF_DEVICE_ROOT").expect("owned fixture"));
    let owner = Owner::start(
        &root.join("owner.sqlite"),
        ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let client = owner.client();
    let open = |tag| match client
        .open(None, [tag; 32], [17; 32])
        .unwrap_or_else(|error| panic!("{error:?}"))
        .result()
    {
        Ok(Response::Opened(r)) => *r,
        x => panic!("{x:?}"),
    };
    let route = open(191);
    let other = open(192);
    let mut inode = Inode {
        serial: 1,
        kind: InodeKind::File,
        mode: 0o644,
        mtime_seconds: 1,
        mtime_nanoseconds: 2,
        nlink: 1,
        size: 4096,
        inherited_cutoff: 0,
        born: 0,
        entries: 0,
        subdirs: 0,
    };
    for serial in 1..=128 {
        inode.serial = serial;
        let done = run(
            &client,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.publish(
                    job_route,
                    inode.clone(),
                    None,
                    Some(Cell {
                        offset: 0,
                        data: Box::new([91; 4096]),
                        validity: Box::new([255; 512]),
                    }),
                )
            },
        );
        let p = match done.result() {
            Ok(Response::Published(p)) => *p,
            x => panic!("{x:?}"),
        };
        drop(done);
        assert!(run(
            &client,
            route,
            |job_client: &layerfs_daemon::OwnerClient, _| job_client.reply_attempted(p)
        )
        .result()
        .is_ok());
    }
    let capture = match run(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.capture(job_route),
    )
    .result()
    {
        Ok(Response::Captured(c)) => *c,
        x => panic!("{x:?}"),
    };
    let lease = Lease {
        kind: LeaseKind::Reader,
        owner: 901,
        resource: 0,
    };
    assert!(run(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.acquire(job_route, lease)
    )
    .result()
    .is_ok());
    let other_state = match run(
        &client,
        other,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.state(job_route),
    )
    .result()
    {
        Ok(Response::State(s)) => *s,
        x => panic!("{x:?}"),
    };
    // Filling the owned fixture is preparation, outside the product. The first
    // actual ENOSPC ends it; no failed allocation/write is replayed.
    let mut filler = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(root.join("owner-fixture-fill"))
        .unwrap();
    let bytes = vec![0; 1 << 20];
    let mut filled = 0;
    for _ in 0..512 {
        match filler.write_all(&bytes) {
            Ok(()) => filled += bytes.len(),
            Err(e) => {
                assert_eq!(e.raw_os_error(), Some(28));
                break;
            }
        }
    }
    let before = resources(&client, other);
    let mut accepted = 0;
    let mut reached_refusal = false;
    // Distinct new windows, not retries: reusable committed pages can admit a
    // bounded prefix even at device-full. Stop on the first actual refusal.
    for serial in 129..161 {
        inode.serial = serial;
        let work = client.diagnostics().unwrap().sql_foreground;
        let done = run(
            &client,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| {
                job_client.publish(
                    job_route,
                    inode.clone(),
                    None,
                    Some(Cell {
                        offset: 0,
                        data: Box::new([92; 4096]),
                        validity: Box::new([255; 512]),
                    }),
                )
            },
        );
        match done.result() {
            Ok(Response::Published(p)) => {
                let p = *p;
                drop(done);
                assert!(run(
                    &client,
                    route,
                    |job_client: &layerfs_daemon::OwnerClient, _| job_client.reply_attempted(p)
                )
                .result()
                .is_ok());
                accepted += 1;
            }
            Err(OwnerError::Overlay(error)) if error.is_sqlite_full() => {
                assert_eq!(
                    client.diagnostics().unwrap().sql_foreground.statements
                        [layerfs_overlay::StatementKind::Begin as usize]
                        .executions,
                    work.statements[layerfs_overlay::StatementKind::Begin as usize].executions + 1
                );
                reached_refusal = true;
                break;
            }
            x => panic!("{x:?}"),
        }
    }
    assert!(reached_refusal, "new capacity did not refuse");
    assert_eq!(
        resources(&client, other).counts.payload_cells,
        before.counts.payload_cells + accepted
    );
    assert!(
        matches!(run(&client,route,|job_client: &layerfs_daemon::OwnerClient, job_route| job_client.retained_capture(job_route)).result(),Ok(Response::RetainedCapture(Some(c))) if *c==capture)
    );
    assert!(run(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.close(job_route)
    )
    .result()
    .is_ok());
    assert!(run(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
            .release_closed_capture(job_route, capture)
    )
    .result()
    .is_ok());
    assert!(run(
        &client,
        route,
        |job_client: &layerfs_daemon::OwnerClient, job_route| job_client.release(job_route, lease)
    )
    .result()
    .is_ok());
    // Terminal close sweeps no rows, even at full capacity. Exact last-owner
    // releases leave the file eligible for the terminal owner's checked close.
    assert!(matches!(
        run(
            &client,
            route,
            |job_client: &layerfs_daemon::OwnerClient, job_route| job_client
                .cleanup_state(job_route)
        )
        .result(),
        Ok(Response::CleanupState(
            layerfs_overlay::CleanupState::Queued
        ))
    ));
    let after = resources(&client, other);
    assert_eq!(after.counts.namespaces, 2);
    assert_eq!(after.counts.payload_cells, 128 + accepted);
    assert_eq!(after.allocation.reserved_tail_bytes, 0);
    assert!(
        matches!(run(&client,other,|job_client: &layerfs_daemon::OwnerClient, job_route| job_client.state(job_route)).result(),Ok(Response::State(s)) if *s==other_state)
    );
    println!("S6_OWNER_DEVICE fixture_filled={filled} accepted_distinct_windows={accepted} before={before:?} after={after:?} owner_work={:?} terminal_row_sweep=false ordinary_refusal=ENOSPC",client.diagnostics().unwrap());
    assert!(client.maintenance_failure().unwrap().is_none());
    owner.stop().unwrap();
}
