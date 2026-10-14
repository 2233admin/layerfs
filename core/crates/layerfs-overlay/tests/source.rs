//! Exact transient base-source custody through public engine APIs.
use layerfs_overlay::*;
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
};
struct Temp(PathBuf);
impl Temp {
    fn new() -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(1);
        let p = std::env::temp_dir().join(format!(
            "layerfs-source-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir(&p).unwrap();
        Self(p)
    }
}
impl Drop for Temp {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).unwrap();
    }
}
fn inode() -> Inode {
    Inode {
        serial: 2,
        kind: InodeKind::File,
        mode: 0o644,
        mtime_seconds: 4,
        mtime_nanoseconds: 5,
        nlink: 1,
        size: 7,
        inherited_cutoff: 0,
        born: 0,
        entries: 0,
        subdirs: 0,
    }
}
#[test]
fn source_retains_selected_base_and_exact_close_custody_without_a_generation_pin() {
    let temp = Temp::new();
    let db = Overlay::create(&temp.0.join("db"), ProfileConfig::default()).unwrap();
    let route = db.open_workspace([1; 32], [2; 32]).unwrap();
    let source = db.acquire_base_source(route, 7).unwrap();
    assert_eq!(source.root(), [2; 32]);
    assert_eq!(db.retained_base_source(route, 7).unwrap(), Some(source));
    assert!(db.acquire_base_source(route, 7).is_err());
    assert_eq!(db.state(route).unwrap().base_readers, 1);
    let p = db.publish(route, &inode(), None, None).unwrap();
    db.reply_attempted(p).unwrap();
    let capture = db.capture(route).unwrap();
    let before = db.state(route).unwrap();
    assert!(!db.install_ready(capture).unwrap());
    assert!(matches!(
        db.install(capture, [3; 32]),
        Err(OverlayError::BaseSourcesPending)
    ));
    assert_eq!(db.state(route).unwrap(), before);
    assert_eq!(db.source_inode(source, 2).unwrap(), Some(inode()));
    db.close(route).unwrap();
    assert!(matches!(
        db.acquire_base_source(route, 8),
        Err(OverlayError::Closed)
    ));
    db.release_closed_capture(capture).unwrap();
    assert_eq!(db.cleanup_state(route).unwrap(), CleanupState::Held);
    assert_eq!(db.source_inode(source, 2).unwrap(), Some(inode()));
    db.release_base_source(source).unwrap();
    assert_eq!(db.state(route).unwrap().base_readers, 0);
    assert_eq!(db.cleanup_state(route).unwrap(), CleanupState::Queued);
    assert!(matches!(
        db.release_base_source(source),
        Err(OverlayError::Stale)
    ));
    assert_eq!(db.cleanup_state(route).unwrap(), CleanupState::Queued);
    db.close_database().unwrap();
}

#[test]
fn ordered_source_directory_entry_windows_visit_only_parent_and_generation_with_runtime_evidence() {
    let temp = Temp::new();
    let db = Overlay::create(&temp.0.join("db"), ProfileConfig::default()).unwrap();
    let route = db.open_workspace([31; 32], [32; 32]).unwrap();
    for n in 0..193 {
        let p = db
            .publish(
                route,
                &inode(),
                Some(&DirectoryEntry {
                    inherited: false,
                    parent: 1,
                    name: format!("n{n:04}").into_bytes(),
                    serial: Some(2),
                }),
                None,
            )
            .unwrap();
        db.reply_attempted(p).unwrap();
    }
    db.capture(route).unwrap();
    let source = db.acquire_base_source(route, 7).unwrap();
    let mut previous = 0;
    let mut vm = None;
    for count in [128, 1024, 4096] {
        for n in previous..count {
            let p = db
                // Later names of another directory, in the active generation.
                .publish(
                    route,
                    &inode(),
                    Some(&DirectoryEntry {
                        inherited: false,
                        parent: 9,
                        name: format!("n{n:04}").into_bytes(),
                        serial: Some(2),
                    }),
                    None,
                )
                .unwrap();
            db.reply_attempted(p).unwrap();
        }
        previous = count;
        let before = db.diagnostics();
        let window = db
            .source_directory_entry_window(source, 1, Some(b"n0063"))
            .unwrap();
        let after = db.diagnostics();
        assert!(window.active.is_empty());
        assert_eq!(window.captured.len(), 64);
        assert_eq!(window.captured[0].name, b"n0064");
        assert_eq!(window.captured[63].name, b"n0127");
        let a = before.statements[StatementKind::DirectoryEntry as usize];
        let b = after.statements[StatementKind::DirectoryEntry as usize];
        let steps = b.vm_steps - a.vm_steps;
        if let Some(old) = vm {
            assert_eq!(old, steps);
        }
        vm = Some(steps);
        assert_eq!(b.rows_returned - a.rows_returned, 64);
        assert_eq!(b.fullscan_steps - a.fullscan_steps, 0);
        assert_eq!(b.sorts - a.sorts, 0);
        assert_eq!(b.autoindex_rows - a.autoindex_rows, 0);
        assert_eq!(b.reprepares - a.reprepares, 0);
    }
    db.release_base_source(source).unwrap();
}
