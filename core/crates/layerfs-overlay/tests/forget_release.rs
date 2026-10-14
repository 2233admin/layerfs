//! FORGET's one-statement fence and the release chain behind the last
//! reference of a removed file: a refused FORGET is refused as before and
//! writes nothing, a closed Workspace still forgets, and the rows a release
//! leaves, in its own job and in the owner's turns after it, are the rows
//! the step-by-step reads left, for every size around one page.
use layerfs_overlay::{
    Binding, Changes, DirectoryEntryChange, Inode, InodeKind, MaintenanceCursor, NativeEffect,
    NativeMount, OpenFile, Overlay, OverlayError, PayloadWrite, ProfileConfig, Route,
    StatementKind, StoredCounts,
};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
};

/// One payload row holds the cells of one slot.
const SLOT: u64 = 32 * 1024;
const CELL: usize = 4096;

struct World {
    db: Overlay,
    path: PathBuf,
}
impl Drop for World {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.path).unwrap();
    }
}
#[derive(Clone, Copy)]
struct Seat {
    route: Route,
    mount: NativeMount,
}
fn world() -> World {
    static NEXT: AtomicU64 = AtomicU64::new(1);
    let path = std::env::temp_dir().join(format!(
        "layerfs-forget-release-{}-{}",
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
        born: 1,
        entries: 0,
        subdirs: 0,
    }
}
fn root(entries: u64) -> Inode {
    Inode {
        kind: InodeKind::Directory,
        mode: 0o755,
        born: 0,
        entries,
        ..file(1)
    }
}
fn name(serial: u64) -> Vec<u8> {
    format!("f{serial}").into_bytes()
}
/// What a release left: whether the owner has a ready turn, and the counts.
type Left = (bool, StoredCounts, layerfs_overlay::OpenStateCounts);
impl World {
    fn seat(&self, authority: u8) -> Seat {
        let route = self.db.open_workspace([authority; 32], [32; 32]).unwrap();
        let mount = self.db.create_native_mount(route, 1).unwrap();
        Seat { route, mount }
    }
    fn left(&self, seat: Seat) -> Left {
        let resources = self.db.resources(Some(seat.route)).unwrap();
        (
            self.db.maintenance_pending(),
            resources.counts,
            resources.open,
        )
    }
    /// Statements of the fence family, of the custody family, and write
    /// transactions begun so far.
    fn work(&self) -> (u64, u64, u64) {
        let work = self.db.diagnostics().statements;
        (
            work[StatementKind::Workspace as usize].attempts,
            work[StatementKind::Lease as usize].attempts,
            work[StatementKind::Begin as usize].attempts,
        )
    }
    fn publish(&self, seat: Seat, serial: u64, handle: Option<u64>, changes: Changes) -> u64 {
        let effect = match changes.created {
            Some(serial) => NativeEffect::Open {
                serial,
                parent: 1,
                writable: true,
            },
            None => NativeEffect::None,
        };
        let applied = self
            .db
            .mutate_native_visit(seat.mount, 900 + serial, serial, handle, |_, held| {
                Ok(Some((
                    Changes {
                        open: held,
                        ..changes
                    },
                    effect,
                )))
            })
            .unwrap()
            .expect("published");
        self.db.reply_attempted(applied.publication).unwrap();
        applied.file.map_or(0, |file: OpenFile| file.owner_id())
    }
    /// A file of `rows` one-cell payload rows under the root, closed, with
    /// the kernel's one lookup count.
    fn make(&self, seat: Seat, serial: u64, rows: u64) {
        let created = Changes {
            created: Some(serial),
            inodes: vec![root(1), file(serial)],
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
        let handle = self.publish(seat, 1, None, created);
        for row in 0..rows {
            let written = Changes {
                inodes: vec![Inode {
                    size: row * SLOT + CELL as u64,
                    ..file(serial)
                }],
                write: Some(PayloadWrite {
                    serial,
                    offset: row * SLOT,
                    data: vec![row as u8 + 1; CELL].into(),
                }),
                ..Changes::default()
            };
            self.publish(seat, serial, Some(handle), written);
        }
        self.db
            .close_native_file(seat.mount, serial, handle)
            .unwrap();
    }
    /// UNLINK of that file under the kernel's lookup count.
    fn unlink(&self, seat: Seat, serial: u64, size: u64) {
        let removed = Changes {
            inodes: vec![
                root(0),
                Inode {
                    nlink: 0,
                    size,
                    ..file(serial)
                },
            ],
            directory_entries: vec![DirectoryEntryChange {
                parent: 1,
                name: name(serial),
                binding: Binding::Removed { inherited: false },
            }],
            ..Changes::default()
        };
        self.publish(seat, 1, None, removed);
    }
    /// The owner's ready turns until none is left: how many it took.
    fn settle(&self) -> u64 {
        let mut cursor = MaintenanceCursor::default();
        for turns in 0..400 {
            let Some(step) = self.db.maintain(cursor).unwrap() else {
                return turns;
            };
            cursor = step.cursor;
        }
        panic!("maintenance did not settle");
    }
}

#[test]
fn a_refused_forget_is_refused_by_one_statement_and_writes_nothing() {
    let world = world();
    let seat = world.seat(61);
    world.make(seat, 50, 1);
    world.settle();
    let before = world.left(seat);
    let attempt = |mount: NativeMount, serial: u64, count: u64| {
        let work = world.work();
        let result = world.db.forget_native(mount, serial, count);
        let after = world.work();
        (
            result,
            (after.0 - work.0, after.1 - work.1, after.2 - work.2),
        )
    };
    // Nothing is asked for a zero count.
    let (result, work) = attempt(seat.mount, 50, 0);
    assert!(
        matches!(result, Err(OverlayError::Invalid(_))),
        "{result:?}"
    );
    assert_eq!(work, (0, 0, 0));
    // No lookup count on the inode: Stale, by the fence alone, before any
    // transaction. The fence is the remembered Workspace row and the
    // kernel's reference in memory: no statement.
    let (result, work) = attempt(seat.mount, 51, 1);
    assert!(matches!(result, Err(OverlayError::Stale)), "{result:?}");
    assert_eq!(work, (0, 0, 0));
    // More than the kernel holds: refused after the fence, nothing written.
    let (result, work) = attempt(seat.mount, 50, 2);
    assert!(
        matches!(result, Err(OverlayError::Invalid(_))),
        "{result:?}"
    );
    assert_eq!(work, (0, 0, 0));
    // The root's implicit count is not the kernel's to give back.
    let (result, _) = attempt(seat.mount, 1, 1);
    assert!(
        matches!(result, Err(OverlayError::Invalid(_))),
        "{result:?}"
    );
    assert_eq!(world.left(seat), before);

    // A closed Workspace still gives its references back.
    world.db.close(seat.route).unwrap();
    let (result, work) = attempt(seat.mount, 50, 1);
    assert!(result.is_ok(), "{result:?}");
    assert_eq!((work.0, work.2), (1, 0));
    let (result, _) = attempt(seat.mount, 50, 1);
    assert!(matches!(result, Err(OverlayError::Stale)), "{result:?}");
    // A revoked mount answers for nothing.
    world.db.revoke_native_mount(seat.mount).unwrap();
    let (result, _) = attempt(seat.mount, 1, 1);
    assert!(matches!(result, Err(OverlayError::Stale)), "{result:?}");
}

/// One removed file of `rows` one-cell rows, forgotten: what the FORGET's
/// own job left, the owner's turns after it and what they left.
fn released(rows: u64, installed: bool) -> (Left, u64, Left, Option<Inode>) {
    let world = world();
    let seat = world.seat(64);
    world.make(seat, 50, rows);
    let size = match rows {
        0 => 0,
        rows => (rows - 1) * SLOT + CELL as u64,
    };
    world.unlink(seat, 50, size);
    if installed {
        let capture = world.db.capture(seat.route).unwrap();
        world.db.install(capture, [33; 32]).unwrap();
    }
    world.db.forget_native(seat.mount, 50, 1).unwrap();
    let own = world.left(seat);
    let turns = world.settle();
    let end = world.left(seat);
    let row = match world.db.inode(seat.route, 50) {
        Ok(row) => row,
        Err(error) => panic!("{error:?}"),
    };
    (own, turns, end, row)
}

#[test]
fn a_release_leaves_the_rows_the_step_by_step_reads_left() {
    // Rows of the file: none, one, one fewer than a page, a page, one more,
    // and several pages.
    // With each, the owner's turns after the FORGET.
    for (rows, wanted) in [(0, 0), (1, 0), (13, 0), (14, 2), (15, 3), (40, 4)] {
        let (own, turns, end, row) = released(rows, false);
        println!(
            "FORGET_RELEASE rows={rows} own=(pending={}, cells={}, inodes={}, orphans={}, targets={}) turns={turns} end=(cells={}, inodes={}, orphans={}, targets={}, details={})",
            own.0,
            own.1.payload_cells,
            own.1.inode_rows,
            own.2.orphan_files,
            own.1.maintenance_targets,
            end.1.payload_cells,
            end.1.inode_rows,
            end.2.orphan_files,
            end.1.maintenance_targets,
            end.1.owner_details
        );
        // The FORGET's own job drops at most one page of 14 cells. A file
        // of less than a page is finished by its FORGET; a page spends the
        // job's step, and the owner gets the ready items of what is left.
        assert_eq!(own.1.payload_cells, rows.saturating_sub(14), "{rows}");
        assert_eq!(own.0, rows >= 14, "{rows}");
        assert_eq!(own.2.orphan_files, u64::from(rows >= 14), "{rows}");
        assert_eq!(turns, wanted, "{rows}");
        // In the end: no cell, no orphan, nothing queued. The root's row
        // and the file's tombstone stay, because the active generation is
        // not installed and nothing supersedes the tombstone.
        assert_eq!(
            (
                end.1.payload_cells,
                end.1.payload_bytes,
                end.2.orphan_files,
                end.1.maintenance_targets,
                end.1.inode_rows
            ),
            (0, 0, 0, 0, 2),
            "{rows}"
        );
        assert!(!end.0, "{rows}");
        assert_eq!(row.map(|row| row.nlink), Some(0), "{rows}");
    }
}

#[test]
fn an_installed_layer_loses_its_row_when_its_last_reference_goes() {
    for (rows, wanted) in [(1, 6), (14, 8), (15, 9)] {
        let (own, turns, end, row) = released(rows, true);
        assert_eq!(turns, wanted, "{rows}");
        println!(
            "FORGET_RELEASE installed rows={rows} own=(pending={}, cells={}, inodes={}) turns={turns} end=(cells={}, inodes={}, targets={})",
            own.0,
            own.1.payload_cells,
            own.1.inode_rows,
            end.1.payload_cells,
            end.1.inode_rows,
            end.1.maintenance_targets
        );
        assert_eq!(
            (
                end.1.payload_cells,
                end.2.orphan_files,
                end.1.maintenance_targets
            ),
            (0, 0, 0),
            "{rows}"
        );
        assert!(!end.0, "{rows}");
        // The installed generation's rows are gone from the view.
        assert_eq!(row, None, "{rows}");
        assert_eq!(end.1.inode_rows, 0, "{rows}");
    }
}
