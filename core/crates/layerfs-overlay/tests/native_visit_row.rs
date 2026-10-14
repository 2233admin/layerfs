//! A visit that decides over the inode it names reads that inode's latest
//! local row with its fence, in one statement. The row is the one the
//! indexed read returns in every shape of the view; an orphan held by the
//! engine keeps the read where it was; a refused visit is refused as before;
//! and every added statement is an indexed seek.
use layerfs_overlay::{
    Binding, Changes, DirectoryEntryChange, Inode, InodeKind, NativeDecision, NativeEffect,
    NativeMount, OpenFile, Overlay, OverlayError, ProfileConfig, Route, StatementKind,
};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
};

struct World {
    db: Overlay,
    path: PathBuf,
}
impl Drop for World {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.path).unwrap();
    }
}
/// One Workspace of the engine and its native mount.
#[derive(Clone, Copy)]
struct Seat {
    route: Route,
    mount: NativeMount,
}
fn world() -> World {
    static NEXT: AtomicU64 = AtomicU64::new(1);
    let path = std::env::temp_dir().join(format!(
        "layerfs-visit-row-{}-{}",
        std::process::id(),
        NEXT.fetch_add(1, Ordering::Relaxed)
    ));
    std::fs::create_dir(&path).unwrap();
    let db = Overlay::create(&path.join("overlay"), ProfileConfig::default()).unwrap();
    World { db, path }
}
fn file(serial: u64) -> Inode {
    Inode {
        serial,
        kind: InodeKind::File,
        mode: 0o644,
        mtime_seconds: 7,
        mtime_nanoseconds: 9,
        nlink: 1,
        size: 0,
        inherited_cutoff: 0,
        born: 0,
        entries: 0,
        subdirs: 0,
    }
}
fn root(entries: u64) -> Inode {
    Inode {
        kind: InodeKind::Directory,
        mode: 0o755,
        entries,
        ..file(1)
    }
}
fn name(serial: u64) -> Vec<u8> {
    format!("f{serial}").into_bytes()
}
impl World {
    fn seat(&self, authority: u8) -> Seat {
        let route = self.db.open_workspace([authority; 32], [32; 32]).unwrap();
        let mount = self.db.create_native_mount(route, 1).unwrap();
        Seat { route, mount }
    }
    /// Statements of the fence family and of the inode family so far.
    fn families(&self) -> (u64, u64) {
        let work = self.db.diagnostics().statements;
        (
            work[StatementKind::Workspace as usize].attempts,
            work[StatementKind::Inode as usize].attempts,
        )
    }
    /// CREATE of `serial` under the root, open, with a kernel lookup.
    fn create(&self, seat: Seat, serial: u64, entries: u64) -> OpenFile {
        let applied = self
            .db
            .mutate_native_visit(seat.mount, serial, 1, None, |rows, _| {
                let changes = Changes {
                    created: Some(serial),
                    inodes: vec![
                        root(entries),
                        Inode {
                            born: rows.active().number() as u64,
                            ..file(serial)
                        },
                    ],
                    directory_entries: vec![DirectoryEntryChange {
                        parent: 1,
                        name: name(serial),
                        binding: Binding::Bound {
                            serial,
                            inherited: false,
                        },
                    }],
                    ..Changes::default()
                };
                let effect = NativeEffect::Open {
                    serial,
                    parent: 1,
                    writable: true,
                };
                Ok(Some((changes, effect)))
            })
            .unwrap()
            .expect("published");
        self.db.reply_attempted(applied.publication).unwrap();
        applied.file.expect("the created file is open")
    }
    /// GETATTR's visit of `serial`: the row its decision read, and the
    /// fence and inode statements the whole job ran.
    fn observed(
        &self,
        seat: Seat,
        serial: u64,
        handle: Option<u64>,
    ) -> (Option<Inode>, (u64, u64)) {
        let before = self.families();
        let observed =
            self.db
                .observe_native_visit(seat.mount, serial, handle, false, |rows, _| {
                    let row = rows.inode(serial)?;
                    // A second round of the decision reads nothing more.
                    assert_eq!(row, rows.inode(serial)?);
                    Ok(NativeDecision::Finished {
                        inode: None,
                        value: row,
                    })
                });
        assert!(observed.result.is_ok(), "{:?}", observed.result);
        let after = self.families();
        (
            observed.decision.expect("decided"),
            (after.0 - before.0, after.1 - before.1),
        )
    }
    /// The same read by the indexed statement, outside any visit.
    fn indexed(&self, seat: Seat, serial: u64) -> Option<Inode> {
        self.db.inode(seat.route, serial).unwrap()
    }
    /// A mutation visit that names `serial`, reads it `reads` times and
    /// publishes `value` for it: the rows it read and the inode statements
    /// of the job.
    fn published(
        &self,
        seat: Seat,
        serial: u64,
        handle: Option<u64>,
        reads: usize,
        value: Inode,
    ) -> (Vec<Option<Inode>>, u64) {
        let before = self.families();
        let mut seen = Vec::new();
        let applied = self
            .db
            .mutate_native_visit(seat.mount, 900, serial, handle, |rows, _| {
                for _ in 0..reads {
                    seen.push(rows.inode(serial)?);
                }
                let changes = Changes {
                    inodes: vec![value.clone()],
                    ..Changes::default()
                };
                Ok(Some((changes, NativeEffect::None)))
            })
            .unwrap()
            .expect("published");
        self.db.reply_attempted(applied.publication).unwrap();
        (seen, self.families().1 - before.1)
    }
}

#[test]
fn the_fence_row_is_the_indexed_row_in_every_shape_of_the_view() {
    let world = world();
    let seat = world.seat(51);
    // No local row: the base decides, and the fence says so in one statement.
    assert_eq!(world.observed(seat, 1, None), (None, (1, 0)));
    assert_eq!(world.indexed(seat, 1), None);
    // An active row, through the kernel's lookup and through a descriptor.
    let handle = world.create(seat, 50, 1);
    for (serial, held) in [(1, None), (50, None), (50, Some(handle.owner_id()))] {
        let (row, statements) = world.observed(seat, serial, held);
        assert_eq!(row, world.indexed(seat, serial), "{serial} {held:?}");
        assert!(row.is_some(), "{serial}");
        assert_eq!(statements, (1, 0), "{serial} {held:?}");
    }
    // A mutation over the row the fence read: one update and no read, and
    // the next visit reads what was stored.
    let grown = Inode {
        size: 4096,
        mtime_seconds: 11,
        born: 1,
        ..file(50)
    };
    let (seen, statements) = world.published(seat, 50, Some(handle.owner_id()), 2, grown.clone());
    assert_eq!(seen[0], seen[1]);
    assert_eq!(seen[0].as_ref().map(|row| row.size), Some(0));
    assert_eq!(statements, 1, "the update only");
    assert_eq!(world.observed(seat, 50, None).0, Some(grown.clone()));
    // A publication that never read the row publishes the same way.
    let touched = Inode {
        mtime_seconds: 12,
        ..grown.clone()
    };
    let (_, statements) = world.published(seat, 50, None, 0, touched.clone());
    assert_eq!(statements, 1);
    assert_eq!(world.indexed(seat, 50), Some(touched.clone()));
    // Captured: the row is now a lower row of the view, and still the row.
    let capture = world.db.capture(seat.route).unwrap();
    let (row, statements) = world.observed(seat, 50, None);
    assert_eq!((row.clone(), statements), (Some(touched.clone()), (1, 0)));
    assert_eq!(row, world.indexed(seat, 50));
    // A new active row above the captured one is the latest.
    let again = Inode {
        size: 8192,
        mtime_seconds: 13,
        ..touched.clone()
    };
    let (seen, _) = world.published(seat, 50, Some(handle.owner_id()), 1, again.clone());
    assert_eq!(seen[0], Some(touched));
    // The engine keeps the new layer's cutoff; the rest is the caller's.
    let again = Inode {
        inherited_cutoff: 4096,
        ..again
    };
    let (row, statements) = world.observed(seat, 50, Some(handle.owner_id()));
    assert_eq!((row, statements), (Some(again.clone()), (1, 0)));
    assert_eq!(world.indexed(seat, 50), Some(again.clone()));
    // Installed: rows at or below the install frontier leave the view.
    world.db.install(capture, [33; 32]).unwrap();
    for serial in [1, 50] {
        let (row, statements) = world.observed(seat, serial, None);
        assert_eq!(row, world.indexed(seat, serial), "{serial}");
        assert_eq!(statements, (1, 0), "{serial}");
    }
    assert_eq!(world.indexed(seat, 50), Some(again));
    assert_eq!(world.indexed(seat, 1), None, "the root's row was installed");
}

#[test]
fn an_orphan_held_by_the_engine_keeps_the_read_where_it_was() {
    let world = world();
    let seat = world.seat(53);
    let handle = world.create(seat, 50, 1);
    // The last name of the open file goes: its row becomes an orphan row.
    let applied = world
        .db
        .mutate_native_visit(seat.mount, 901, 1, None, |rows, _| {
            assert_eq!(rows.inode(1)?, Some(root(1)));
            let changes = Changes {
                inodes: vec![
                    root(0),
                    Inode {
                        nlink: 0,
                        born: 1,
                        ..file(50)
                    },
                ],
                directory_entries: vec![DirectoryEntryChange {
                    parent: 1,
                    name: name(50),
                    binding: Binding::Removed { inherited: false },
                }],
                ..Changes::default()
            };
            Ok(Some((changes, NativeEffect::None)))
        })
        .unwrap()
        .expect("published");
    world.db.reply_attempted(applied.publication).unwrap();
    // While the engine holds an orphan, an inode read asks the orphan
    // domain first: the fence's row is not used.
    let (row, statements) = world.observed(seat, 50, Some(handle.owner_id()));
    assert_eq!(row.as_ref().map(|row| row.nlink), Some(0));
    assert_eq!(row, world.indexed(seat, 50));
    // An orphan-domain row is not kept: each of the two rounds reads it.
    assert_eq!(statements, (1, 2), "the orphan-domain row, twice");
    let (row, statements) = world.observed(seat, 1, None);
    assert_eq!(row, Some(root(0)));
    assert_eq!(statements, (1, 2), "the orphan probe, then the row, once");
}

#[test]
fn a_refused_visit_is_refused_as_before_and_reads_one_statement() {
    let world = world();
    let seat = world.seat(55);
    let handle = world.create(seat, 50, 1);
    let attempt = |mount: NativeMount, serial: u64, held: Option<u64>| {
        let before = world.families();
        let observed = world
            .db
            .observe_native_visit(mount, serial, held, false, |rows, _| {
                Ok(NativeDecision::Finished {
                    inode: None,
                    value: rows.inode(serial)?,
                })
            });
        let after = world.families();
        (observed.result, (after.0 - before.0, after.1 - before.1))
    };
    // No kernel reference on the inode, although its row exists.
    let (result, statements) = attempt(seat.mount, 51, None);
    assert!(matches!(result, Err(OverlayError::Stale)), "{result:?}");
    assert_eq!(statements, (1, 0));
    // A descriptor of another inode.
    let (result, statements) = attempt(seat.mount, 1, Some(handle.owner_id()));
    assert!(matches!(result, Err(OverlayError::Stale)), "{result:?}");
    assert_eq!(statements, (1, 0));
    // A closed Workspace refuses before the mount and the reference are
    // considered, whatever they are.
    world.db.close(seat.route).unwrap();
    for (mount, serial, held) in [
        (seat.mount, 50, None),
        (seat.mount, 51, None),
        (seat.mount, 1, Some(handle.owner_id())),
    ] {
        let (result, statements) = attempt(mount, serial, held);
        assert!(matches!(result, Err(OverlayError::Closed)), "{result:?}");
        assert_eq!(statements, (1, 0));
    }
}

#[test]
fn a_revoked_mount_is_stale_by_the_fence_alone() {
    let world = world();
    let revoked = world.seat(58);
    world.create(revoked, 50, 1);
    world.db.revoke_native_mount(revoked.mount).unwrap();
    let before = world.families();
    let observed = world
        .db
        .observe_native_visit(revoked.mount, 50, None, false, |rows, _| {
            Ok(NativeDecision::Finished {
                inode: None,
                value: rows.inode(50)?,
            })
        });
    let after = world.families();
    assert!(
        matches!(observed.result, Err(OverlayError::Stale)),
        "{:?}",
        observed.result
    );
    assert_eq!((after.0 - before.0, after.1 - before.1), (1, 0));
}

#[test]
fn the_fences_that_read_a_row_are_indexed_seeks_in_generation_order() {
    let world = world();
    let seat = world.seat(56);
    let plans = world.db.explain_native_visit(seat.mount).unwrap();
    println!("NATIVE_VISIT_ROW_PLANS {plans:#?}");
    for (label, seeks) in [("workspace-inode", 2)] {
        let rows: Vec<&String> = plans
            .iter()
            .filter(|plan| plan.starts_with(label))
            .collect();
        assert!(!rows.is_empty(), "{label} is not explained");
        // The Workspace row, the mount row, the inode's rows in key order
        // and the reference's own rows: no scan, and no sort for the latest.
        assert_eq!(
            rows.iter().filter(|plan| plan.contains("SEARCH")).count(),
            seeks,
            "{rows:#?}"
        );
        for plan in &rows {
            assert!(
                !plan.contains("SCAN") && !plan.contains("TEMP B-TREE"),
                "{plan}"
            );
        }
        assert!(
            rows.iter()
                .any(|plan| plan.contains("SEARCH i USING PRIMARY KEY")),
            "{rows:#?}"
        );
    }
}
