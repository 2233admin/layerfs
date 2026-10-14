//! Explicit owned-filesystem resource proof, never a timing/cache benchmark.
#![cfg(target_os = "linux")]
mod payload_support;
use layerfs_overlay::*;
use payload_support::*;
use std::{fs::OpenOptions, path::PathBuf, sync::Arc};
#[test]
#[ignore = "requires exclusively owned Linux ext4 loop fixture; use device_fixture.sh"]
#[cfg(target_os = "linux")]
fn real_device_full_rolls_back_write_and_preserves_capture() {
    capacity(4, false);
}
#[test]
#[ignore = "requires exclusively owned Linux ext4 loop fixture; use device_fixture.sh"]
fn real_device_full_at_commit_rolls_back_write_and_preserves_capture() {
    capacity(2048, true);
}
fn capacity(pager_kib: u32, at_commit: bool) {
    let root =
        PathBuf::from(std::env::var_os("LAYERFS_PROOF_DEVICE_ROOT").expect("owned proof root"));
    let path = root.join("overlay.sqlite");
    let template = root.join("template.sqlite");
    Overlay::create(&template, ProfileConfig::default())
        .unwrap()
        .close_database()
        .unwrap();
    let db = Overlay::copy_template_observed(
        &path,
        ProfileConfig {
            pager_kib,
            max_pages: None,
        },
        &template,
        1,
    )
    .result
    .unwrap();
    let other_path = root.join("other.sqlite");
    let other_db =
        Overlay::copy_template_observed(&other_path, ProfileConfig::default(), &template, 2)
            .result
            .unwrap();
    let a = db.open_workspace([171; 32], [172; 32]).unwrap();
    let b = other_db.open_workspace([173; 32], [172; 32]).unwrap();
    let source = db.acquire_base_source(a, 1).unwrap();
    let mut f = payload_support::File::new(&db, source, 7, Vec::new());
    f.write(0, &pattern(131072, 3));
    db.release_base_source(source).unwrap();
    let capture = db.capture(a).unwrap();
    let source = db.acquire_base_source(a, 2).unwrap();
    // Fixture allocation is outside the product. No failed allocation is retried.
    let filler = OpenOptions::new()
        .read(true)
        .write(true)
        .create_new(true)
        .open(root.join("fixture-fill"))
        .unwrap();
    let fs = nix::sys::statvfs::statvfs(root.as_path()).unwrap();
    let free = fs.blocks_free() * fs.fragment_size();
    let fill = nix::fcntl::fallocate(
        &filler,
        nix::fcntl::FallocateFlags::empty(),
        0,
        i64::try_from(free).unwrap(),
    );
    if let Err(error) = fill {
        assert_eq!(
            error,
            nix::errno::Errno::ENOSPC,
            "fixture allocation failure"
        );
    }
    let full = nix::sys::statvfs::statvfs(root.as_path()).unwrap();
    println!("S6_DEVICE_FIXTURE requested_bytes={free} fill={fill:?} residual_free_blocks={} available_blocks={}",full.blocks_free(),full.blocks_available());
    let before = db.state(a).unwrap();
    let other = other_db.state(b).unwrap();
    let work = db.diagnostics();
    let physical = db.resources(Some(a)).unwrap();
    let mut inode = f.inode(262144);
    inode.born = 0;
    let result = db.apply(
        source,
        &Changes {
            inodes: vec![inode],
            write: Some(PayloadWrite {
                serial: 7,
                offset: 131072,
                data: Arc::from(pattern(131072, 5)),
            }),
            ..Changes::default()
        },
    );
    let error = result.unwrap_err();
    assert!(error.is_no_space(), "known whole-job rollback: {error:?}");
    if std::env::var_os("LAYERFS_PROOF_TRANSLATE_ENOSPC").is_some() {
        assert!(matches!(&error, OverlayError::NoSpace { cause }
            if matches!(cause.as_ref(), OverlayError::Sql(rusqlite::Error::SqliteFailure(code, _))
                if code.extended_code == rusqlite::ffi::SQLITE_IOERR_WRITE)),
            "real ENOSPC translated by the external fixture must retain SQLite's I/O cause: {error:?}");
        assert!(db.allocation_work().capacity_checks > 0);
    } else {
        assert!(error.is_sqlite_full(), "original SQLite Full: {error:?}");
    }
    assert_eq!(
        db.diagnostics().since(&work).statements[StatementKind::Commit as usize].executions,
        u64::from(at_commit),
        "failure phase"
    );
    let after_failed = db.resources(Some(a)).unwrap();
    assert_eq!(
        after_failed.counts, physical.counts,
        "whole-job SQL rollback"
    );
    assert_eq!(
        after_failed.open, physical.open,
        "whole-job memory rollback"
    );
    assert_eq!(db.state(a).unwrap(), before);
    assert_eq!(
        db.diagnostics().statements[StatementKind::Begin as usize].executions,
        work.statements[StatementKind::Begin as usize].executions + 1
    );
    assert_eq!(other_db.state(b).unwrap(), other);
    assert_eq!(db.retained_capture(a).unwrap(), Some(capture));
    assert_eq!(
        db.captured_read(capture, 7, 0, 131072)
            .unwrap()
            .unwrap()
            .data,
        f.expect
    );
    // Exact owner releases and reclamation need no storage reservation.
    // Their writes use existing pages; failure here remains a failed proof.
    db.release_base_source(source).unwrap();
    db.close(a).unwrap();
    db.release_closed_capture(capture).unwrap();
    assert_eq!(db.cleanup_state(a).unwrap(), CleanupState::Queued);
    assert_eq!(other_db.state(b).unwrap(), other);
    assert_eq!(db.allocation().unwrap().reserved_tail_bytes, 0);
    db.close_database().unwrap();
    assert_eq!(other_db.state(b).unwrap(), other);
    other_db.close_database().unwrap();
    drop(filler);
    std::fs::remove_file(root.join("fixture-fill")).unwrap();
    std::fs::remove_file(path).unwrap();
    std::fs::remove_file(other_path).unwrap();
    std::fs::remove_file(template).unwrap();
}
