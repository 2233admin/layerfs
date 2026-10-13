//! Drain-qualified revocation: handles whose kernel release never arrived.
use layerfs_overlay::{
    CleanupState, Inode, InodeKind, MaintenanceCursor, NativeDecision, NativeMount,
    NativeMountState, Overlay, ProfileConfig,
};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
};
struct Fixture {
    db: Overlay,
    mount: NativeMount,
    path: PathBuf,
}
impl Fixture {
    fn new() -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(1);
        let path = std::env::temp_dir().join(format!(
            "layerfs-native-revocation-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir(&path).unwrap();
        let db = Overlay::create(&path.join("overlay"), ProfileConfig::default()).unwrap();
        let route = db.open_workspace([91; 32], [92; 32]).unwrap();
        let mount = db.create_native_mount(route, 1).unwrap();
        Self { db, mount, path }
    }
    /// One kernel LOOKUP reference for a regular file below the root.
    fn lookup(&self, serial: u64) {
        let outcome = self
            .db
            .observe_native_visit(self.mount, 1, None, true, |_, _| {
                Ok(NativeDecision::Finished {
                    inode: Some(inode(serial, InodeKind::File)),
                    value: (),
                })
            });
        assert_eq!(outcome.result.unwrap(), None);
    }
    /// A completed OPEN whose RELEASE is never delivered.
    fn open_file(&self, request: u64, serial: u64) {
        let outcome = self
            .db
            .open_native_visit(self.mount, request, serial, false, |_, _| {
                Ok(NativeDecision::Finished {
                    inode: Some(inode(serial, InodeKind::File)),
                    value: (),
                })
            });
        assert_eq!(outcome.result.unwrap(), None);
        assert!(outcome.open_candidate.is_some());
    }
    /// A completed OPENDIR whose RELEASEDIR is never delivered.
    fn open_directory(&self, request: u64) {
        let outcome = self
            .db
            .opendir_native_visit(self.mount, request, 1, |_, _| {
                Ok(NativeDecision::Finished {
                    inode: Some(inode(1, InodeKind::Directory)),
                    value: (),
                })
            });
        assert_eq!(outcome.result.unwrap(), None);
        assert!(outcome.directory_candidate.is_some());
    }
}
impl Drop for Fixture {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.path);
    }
}
fn inode(serial: u64, kind: InodeKind) -> Inode {
    Inode {
        serial,
        kind,
        mode: 0o644,
        mtime_seconds: 1,
        mtime_nanoseconds: 0,
        nlink: 1,
        size: 0,
        inherited_cutoff: 0,
        born: 0,
        entries: 0,
        subdirs: 0,
    }
}

#[test]
fn drained_revocation_fences_all_handles_without_a_cleanup_job() {
    const HANDLES: u64 = 70;
    let f = Fixture::new();
    f.lookup(2);
    for index in 0..HANDLES {
        f.open_file(100 + index, 2);
        f.open_directory(1000 + index);
    }
    let before = f.db.resources(Some(f.mount.route())).unwrap().open;
    assert_eq!(
        (before.file_handles, before.directory_handles),
        (HANDLES, HANDLES)
    );
    let start = f.db.diagnostics();
    f.db.revoke_native_mount(f.mount).unwrap();
    let work = f.db.diagnostics().since(&start).total();
    assert_eq!(
        (work.attempts, work.executions, work.direct_rows_changed),
        (1, 1, 0)
    );
    assert_eq!(
        f.db.native_mount_state(f.mount).unwrap(),
        NativeMountState::Revoked
    );
    for request in 0..HANDLES {
        assert!(matches!(
            f.db.retained_native_file(f.mount, 100 + request),
            Err(layerfs_overlay::OverlayError::Stale)
        ));
        assert!(matches!(
            f.db.retained_native_directory(f.mount, 1000 + request),
            Err(layerfs_overlay::OverlayError::Stale)
        ));
    }
    assert!(f
        .db
        .maintain(MaintenanceCursor::default())
        .unwrap()
        .is_none());
    f.db.close(f.mount.route()).unwrap();
    assert_eq!(
        f.db.cleanup_state(f.mount.route()).unwrap(),
        CleanupState::Queued
    );
    assert_eq!(
        f.db.resources(Some(f.mount.route())).unwrap().open,
        before,
        "detached allocations live until checked file close; they are not consumers"
    );
}
