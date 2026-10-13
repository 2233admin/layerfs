//! Terminal close is constant metadata work; live payload deletion still uses lengths.
mod payload_support;
use layerfs_overlay::*;
use payload_support::*;

fn payload(db: &Overlay, index: u8, cells: u64, piece: usize) -> (Route, BaseSource) {
    let route = db.open_workspace([index; 32], [index + 100; 32]).unwrap();
    let source = db.acquire_base_source(route, 1).unwrap();
    let mut file = File::new(db, source, 7, Vec::new());
    let data = pattern(piece, index);
    for at in 0..cells * CELL_BYTES as u64 / piece as u64 {
        file.write(at * piece as u64, &data);
    }
    (route, source)
}

#[test]
fn terminal_close_never_visits_the_workspace_population() {
    let mut costs = Vec::new();
    for files in [8_u64, 4096] {
        let temp = Temp::new();
        let db = temp.db();
        let route = db.open_workspace([61; 32], [62; 32]).unwrap();
        for serial in 1..=files {
            let value = Inode {
                serial,
                kind: InodeKind::File,
                mode: 0o644,
                mtime_seconds: 1,
                mtime_nanoseconds: 0,
                nlink: 1,
                size: 0,
                inherited_cutoff: 0,
                born: 0,
                entries: 0,
                subdirs: 0,
            };
            let publication = db.publish(route, &value, None, None).unwrap();
            db.reply_attempted(publication).unwrap();
        }
        let before = db.resources(Some(route)).unwrap().counts;
        let start = db.diagnostics();
        db.close(route).unwrap();
        let work = db.diagnostics().since(&start).total();
        assert_eq!(work.direct_rows_changed, 1);
        assert_eq!(
            (work.fullscan_steps, work.sorts, work.returned_blob_bytes),
            (0, 0, 32)
        );
        let after = db.resources(Some(route)).unwrap().counts;
        assert_eq!(after, before, "close deletes no table row");
        assert_eq!(after.inode_rows, files);
        assert_eq!(db.cleanup_state(route).unwrap(), CleanupState::Queued);
        costs.push((work.attempts, work.executions, work.vm_steps));
        db.close_database().unwrap();
    }
    assert_eq!(costs[0], costs[1]);
}

/// Every `Column` instruction of one statement that reads a payload value
/// column through a cursor on the payload table: whether it only takes the
/// value's length. Trigger programs are listed after the statement, each
/// with its own cursors.
fn value_reads(raw: &rusqlite::Connection, statement: &str) -> Vec<bool> {
    let root: i64 = raw
        .query_row(
            "SELECT rootpage FROM sqlite_schema WHERE name='payload'",
            [],
            |row| row.get(0),
        )
        .unwrap();
    let values: Vec<i64> = raw
        .prepare("SELECT cid FROM pragma_table_info('payload') WHERE name IN('data','validity')")
        .unwrap()
        .query_map([], |row| row.get(0))
        .unwrap()
        .map(Result::unwrap)
        .collect();
    assert_eq!(values.len(), 2);
    let mut listing = raw.prepare(&format!("EXPLAIN {statement}")).unwrap();
    let program = listing
        .query_map([], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, i64>(2)?,
                row.get::<_, i64>(3)?,
                row.get::<_, i64>(6)?,
            ))
        })
        .unwrap()
        .map(Result::unwrap)
        .collect::<Vec<_>>();
    let mut cursors = Vec::new();
    let mut reads = Vec::new();
    // The cursors of a program are opened anywhere in it: two passes.
    let mut start = 0;
    for end in 1..=program.len() {
        if end != program.len() && program[end].0 != 0 {
            continue;
        }
        let part = &program[start..end];
        cursors.clear();
        for (_, opcode, cursor, page, _) in part {
            if matches!(opcode.as_str(), "OpenRead" | "OpenWrite") && *page == root {
                cursors.push(*cursor);
            }
        }
        for (_, opcode, cursor, column, flags) in part {
            if opcode == "Column" && cursors.contains(cursor) && values.contains(column) {
                // OPFLAG_LENGTHARG: the value is used by length() alone.
                reads.push(flags & 0x40 != 0);
            }
        }
        start = end;
    }
    reads
}

#[test]
fn deleting_payload_rows_reads_their_lengths_and_never_their_bytes() {
    let temp = Temp::new();
    let db = temp.db();
    let built = payload(&db, 2, 64, WRITE_WINDOW);
    let stored = db.resources(Some(built.0)).unwrap().counts;
    assert_eq!(
        (stored.payload_cells, stored.payload_bytes),
        (8, 64 * CELL_BYTES as u64)
    );
    drop(db);
    let raw = rusqlite::Connection::open(temp.0.join("overlay.sqlite")).unwrap();
    // The statements that delete payload rows: by row, by a range of one
    // file's cells, and live stale-cell ranges.
    for statement in [
        "DELETE FROM payload WHERE rowid=1",
        "DELETE FROM payload WHERE ns=1 AND serial=7 AND gen=-1 AND cell_offset>=0 AND cell_offset<32768",
    ] {
        let reads = value_reads(&raw, statement);
        // The trigger takes both lengths; nothing loads a value.
        assert_eq!(reads, [true, true], "{statement}");
    }
    // The same listing does see a statement that loads a value.
    assert!(value_reads(&raw, "SELECT data FROM payload WHERE rowid=1").contains(&false));
    // The counts follow the rows: deleting one row of eight cells.
    raw.execute("DELETE FROM payload WHERE rowid=1", [])
        .unwrap();
    let left: (i64, i64) = raw
        .query_row(
            "SELECT payload_cells,payload_bytes FROM accounting WHERE ns=1",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .unwrap();
    assert_eq!(left, (7, 56 * CELL_BYTES as i64));
    // The trigger this one replaced named the old values, and the delete
    // then loaded both in full.
    raw.execute_batch(
        "DROP TRIGGER payload_account_delete;
        CREATE TRIGGER payload_account_delete AFTER DELETE ON payload BEGIN
            UPDATE accounting SET payload_cells=payload_cells-1,payload_bytes=payload_bytes-(length(OLD.data)+ifnull(length(OLD.validity),0)) WHERE ns=OLD.ns;
        END;",
    )
    .unwrap();
    assert_eq!(
        value_reads(&raw, "DELETE FROM payload WHERE rowid=2"),
        [false, false]
    );
}
