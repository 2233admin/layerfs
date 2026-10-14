//! A native visit reads the rows of one name once: its later evaluation
//! rounds and its own publication use that read. The read is the job's, so a
//! publication made from it equals one made from the publication's own read,
//! it never reaches another job or another Workspace, and a job that fails
//! leaves nothing of it behind.
use layerfs_overlay::{
    Binding, Changes, DirectoryEntry, DirectoryEntryChange, Inode, InodeKind, NameLayers,
    NativeDecision, NativeEffect, NativeMount, Overlay, OverlayError, ProfileConfig, Route,
    StatementKind,
};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
};

const NAME: &[u8] = b"n";
/// A stored name row: its serial (none for a whiteout) and whether it
/// covers a lower row. `None` when the name has no row.
type Stored = Option<(Option<u64>, bool)>;

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
        "layerfs-job-names-{}-{}",
        std::process::id(),
        NEXT.fetch_add(1, Ordering::Relaxed)
    ));
    std::fs::create_dir(&path).unwrap();
    let db = Overlay::create(&path.join("overlay"), ProfileConfig::default()).unwrap();
    World { db, path }
}
fn change(name: &[u8], binding: Binding) -> Changes {
    Changes {
        directory_entries: vec![DirectoryEntryChange {
            parent: 1,
            name: name.to_vec(),
            binding,
        }],
        ..Changes::default()
    }
}
fn bound(serial: u64) -> Binding {
    Binding::Bound {
        serial,
        inherited: false,
    }
}
impl World {
    fn seat(&self, authority: u8) -> Seat {
        let route = self.db.open_workspace([authority; 32], [32; 32]).unwrap();
        let mount = self.db.create_native_mount(route, 1).unwrap();
        Seat { route, mount }
    }
    /// Statements of the name family attempted so far.
    fn name_statements(&self) -> u64 {
        self.db.diagnostics().statements[StatementKind::DirectoryEntry as usize].attempts
    }
    /// One mutation visit that reads `NAME` `reads` times before it
    /// publishes `binding` for it: what its reads returned, and the name
    /// statements the whole job ran.
    fn publish(&self, seat: Seat, reads: usize, binding: Binding) -> (Vec<NameLayers>, u64) {
        let before = self.name_statements();
        let mut seen = Vec::new();
        let applied = self
            .db
            .mutate_native_visit(seat.mount, 1, 1, None, |rows, _| {
                for _ in 0..reads {
                    seen.push(rows.name(1, NAME)?);
                }
                Ok(Some((change(NAME, binding), NativeEffect::None)))
            })
            .unwrap()
            .expect("published");
        self.db.reply_attempted(applied.publication).unwrap();
        (seen, self.name_statements() - before)
    }
    fn entry(&self, seat: Seat) -> Option<DirectoryEntry> {
        self.db.directory_entry(seat.route, 1, NAME).unwrap()
    }
    /// The final row of the name and the Workspace's dirty name count.
    fn published(&self, seat: Seat) -> (Stored, u64) {
        (
            self.entry(seat)
                .map(|entry| (entry.serial, entry.inherited)),
            self.db.state(seat.route).unwrap().dirty_directory_entries,
        )
    }
}

#[test]
fn a_publication_from_the_jobs_own_read_equals_one_that_reads_for_itself() {
    let (world, beside) = (world(), world());
    // Two Workspaces, each in its own database, take the same steps. The jobs
    // of one read the name three times before they publish; the jobs of the
    // other never read it, so their publication reads it.
    let (reading, blind) = (world.seat(41), beside.seat(42));
    let removed = Binding::Removed { inherited: false };
    let steps: [(&str, Binding, Stored); 7] = [
        ("no row: bind", bound(5), Some((Some(5), false))),
        ("active row, nothing below: remove", removed, None),
        ("no row again: bind", bound(5), Some((Some(5), false))),
        // Captured here: the bound row is now the lower row.
        ("lower binding: remove", removed, Some((None, true))),
        (
            "active whiteout over a lower binding: bind",
            bound(9),
            Some((Some(9), true)),
        ),
        (
            "active row over a lower binding: remove",
            removed,
            Some((None, true)),
        ),
        (
            "active whiteout again: bind another",
            bound(7),
            Some((Some(7), true)),
        ),
    ];
    for (index, (label, binding, wanted)) in steps.into_iter().enumerate() {
        if index == 3 {
            world.db.capture(reading.route).unwrap();
            beside.db.capture(blind.route).unwrap();
        }
        let (seen, statements) = world.publish(reading, 3, binding);
        assert!(seen.windows(2).all(|pair| pair[0] == pair[1]), "{label}");
        // One read and one write of the name row, whatever the job asked.
        assert_eq!(statements, 2, "{label}: reading job");
        let (_, statements) = beside.publish(blind, 0, binding);
        assert_eq!(statements, 2, "{label}: blind job");
        assert_eq!(world.published(reading).0, wanted, "{label}");
        assert_eq!(world.published(reading), beside.published(blind), "{label}");
    }
}

#[test]
fn a_kept_read_ends_with_its_job_and_never_crosses_workspaces() {
    let (world, beside) = (world(), world());
    let (first, second) = (world.seat(43), beside.seat(44));
    // Each job reads what the job before it published, in its own Workspace.
    let (seen, _) = world.publish(first, 2, bound(5));
    assert_eq!(seen[0].active, None);
    let (seen, _) = beside.publish(second, 2, bound(6));
    assert_eq!(seen[0].active, None, "another Workspace's name");
    let (seen, _) = world.publish(first, 2, bound(7));
    assert_eq!(seen[0].active, Some(Some(5)));
    let (seen, _) = beside.publish(second, 2, Binding::Removed { inherited: false });
    assert_eq!(seen[0].active, Some(Some(6)));
    assert_eq!(world.published(first).0, Some((Some(7), false)));
    assert_eq!(beside.published(second).0, None);
}

#[test]
fn a_failed_job_keeps_nothing_and_the_next_job_reads_the_stored_row() {
    let world = world();
    let seat = world.seat(45);
    world.publish(seat, 1, bound(5));
    let before = world.name_statements();
    // The decision fails after its reads.
    let refused = world
        .db
        .mutate_native_visit(seat.mount, 2, 1, None, |rows, _| {
            assert_eq!(rows.name(1, NAME)?.active, Some(Some(5)));
            assert_eq!(rows.name(1, NAME)?.active, Some(Some(5)));
            Err::<Option<(Changes, NativeEffect)>, _>(OverlayError::Invalid("refused"))
        })
        .unwrap_err();
    assert!(
        matches!(refused, OverlayError::Invalid("refused")),
        "{refused:?}"
    );
    assert_eq!(world.name_statements() - before, 1);
    // The publication fails after the name was read: an inode this job
    // claims to create already has its row.
    let root = Inode {
        serial: 1,
        kind: InodeKind::Directory,
        mode: 0o755,
        mtime_seconds: 7,
        mtime_nanoseconds: 9,
        nlink: 1,
        size: 0,
        inherited_cutoff: 0,
        born: 0,
        entries: 1,
        subdirs: 0,
    };
    let file = |active: i64| Inode {
        serial: 8,
        kind: InodeKind::File,
        mode: 0o644,
        nlink: 1,
        entries: 0,
        born: active as u64,
        ..root.clone()
    };
    let create = |active: i64, name: &[u8]| Changes {
        created: Some(8),
        inodes: vec![root.clone(), file(active)],
        ..change(name, bound(8))
    };
    let entry = NativeEffect::Entry {
        serial: 8,
        parent: 1,
        directory: false,
    };
    let applied = world
        .db
        .mutate_native_visit(seat.mount, 3, 1, None, |rows, _| {
            Ok(Some((create(rows.active().number(), b"first"), entry)))
        })
        .unwrap()
        .expect("published");
    world.db.reply_attempted(applied.publication).unwrap();
    let state = world.db.state(seat.route).unwrap();
    let failed = world
        .db
        .mutate_native_visit(seat.mount, 4, 1, None, |rows, _| {
            assert_eq!(rows.name(1, NAME)?.active, Some(Some(5)));
            Ok(Some((create(rows.active().number(), NAME), entry)))
        })
        .unwrap_err();
    assert!(
        !matches!(failed, OverlayError::Uncertain { .. }),
        "{failed:?}"
    );
    assert_eq!(
        world.db.state(seat.route).unwrap(),
        state,
        "nothing published"
    );
    assert_eq!(
        world.published(seat).0,
        Some((Some(5), false)),
        "the name is as it was"
    );
    // The next job reads the stored row, not anything the failed jobs read.
    let (seen, statements) = world.publish(seat, 2, bound(9));
    assert_eq!(seen[0].active, Some(Some(5)));
    assert_eq!(statements, 2);
    assert_eq!(world.published(seat).0, Some((Some(9), false)));
}

#[test]
fn a_reading_visit_and_a_job_of_many_names_read_each_kept_name_once() {
    let world = world();
    let seat = world.seat(46);
    world.publish(seat, 1, bound(5));
    // LOOKUP's visit: two rounds over the same name are one statement.
    let before = world.name_statements();
    let observed = world
        .db
        .observe_native_visit(seat.mount, 1, None, true, |rows, _| {
            let first = rows.name(1, NAME)?;
            assert_eq!(first, rows.name(1, NAME)?);
            Ok(NativeDecision::Finished {
                inode: None,
                value: first.active,
            })
        });
    assert!(observed.result.is_ok(), "{:?}", observed.result);
    assert_eq!(observed.decision, Some(Some(Some(5))));
    assert_eq!(world.name_statements() - before, 1);
    // A job keeps as many names as one compound job can bind. A name beyond
    // them is read by its statement every time, with the same answer.
    let before = world.name_statements();
    world
        .db
        .mutate_native_visit(seat.mount, 5, 1, None, |rows, _| {
            for _ in 0..2 {
                assert_eq!(rows.name(1, NAME)?.active, Some(Some(5)));
                assert_eq!(rows.name(1, b"absent")?.active, None);
                assert_eq!(rows.name(1, b"other")?.active, None);
            }
            Ok(None::<(Changes, NativeEffect)>)
        })
        .unwrap();
    assert_eq!(
        world.name_statements() - before,
        layerfs_overlay::COMPOUND_DIRECTORY_ENTRIES as u64 + 2
    );
}
