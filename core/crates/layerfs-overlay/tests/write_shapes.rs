//! A write reads the row shapes of the slots it replaces once for every
//! read window of them. The rows it finds and what it does to each are the
//! same as with one read per slot: over rows of every shape, live and stale,
//! at every alignment of one write window, the bytes read back and the
//! stored rows are what the caller wrote.
mod payload_support;
use layerfs_overlay::*;
use payload_support::*;

const CELL: u64 = CELL_BYTES as u64;
const SLOT: u64 = RUN_BYTES as u64;
const WINDOW: u64 = READ_WINDOW as u64;

/// Stored payload rows and bytes of one Workspace.
fn stored(db: &Overlay, route: Route) -> (u64, u64) {
    let counts = db.resources(Some(route)).unwrap().counts;
    (counts.payload_cells, counts.payload_bytes)
}
/// Payload-family statements of one job.
fn payload(db: &Overlay, job: impl FnOnce()) -> u64 {
    let family = || db.diagnostics().statements[StatementKind::Payload as usize].attempts;
    let before = family();
    job();
    family() - before
}

#[test]
fn a_window_of_slots_is_one_shape_read_whatever_rows_it_holds() {
    let temp = Temp::new();
    let db = temp.db();
    let route = db.open_workspace([71; 32], [72; 32]).unwrap();
    let source = db.acquire_base_source(route, 1).unwrap();
    let mut file = File::new(&db, source, 30, Vec::new());
    // One window of four slots: one shape read and four inserts.
    let fresh = payload(&db, || file.write(0, &pattern(WINDOW as usize, 1)));
    assert_eq!(fresh, 1 + 4);
    // The same window again: one shape read, written where the rows lie.
    let over = payload(&db, || file.write(0, &pattern(WINDOW as usize, 2)));
    assert_eq!(over, 1);
    // A window that starts in the middle of a slot ends in the fifth slot
    // from there. Its first cells are whole, so one read covers the four
    // slots from its first and a second read the fifth: two reads, four
    // rows written in place and one row added.
    let shifted = payload(&db, || file.write(SLOT / 2, &pattern(WINDOW as usize, 3)));
    println!("WRITE_SHAPES fresh={fresh} over={over} shifted={shifted}");
    assert_eq!(shifted, SHIFTED);
    file.check();
    // Rows of one cell, with and without a mask, under whole-slot rows.
    for at in [5 * SLOT + 100, 6 * SLOT + CELL, 9 * SLOT - 7] {
        file.write(at, &pattern(900, 5));
    }
    file.check();
    // A shrink makes the rows above it stale; a regrow leaves them stored.
    file.resize(4 * SLOT + 1234);
    file.resize(12 * SLOT);
    file.check();
    // Overwrites across live rows, stale rows and holes, at alignments that
    // start and end inside a cell, inside a slot and on slot edges.
    let mut random = Random(0x5eed);
    for round in 0..160_u64 {
        let length = match round % 4 {
            0 => WINDOW,
            1 => WINDOW - SLOT + 17,
            2 => random.next(WINDOW) + 1,
            _ => CELL * (random.next(32) + 1),
        };
        let at = match round % 3 {
            0 => SLOT * random.next(14),
            1 => CELL * random.next(14 * 8),
            _ => random.next(14 * SLOT),
        };
        file.write(at, &noise(length as usize, round));
        if round % 16 == 5 {
            file.resize(random.next(10 * SLOT));
            file.resize(14 * SLOT);
        }
        if round % 8 == 0 {
            file.check();
        }
    }
    file.check();
    let left = stored(&db, route);
    println!("WRITE_SHAPES stored rows={} bytes={}", left.0, left.1);
    // What the same sequence stored with one shape read per slot.
    assert_eq!(left, STORED);
    // The wider shape read is the same indexed range: `work` refuses a
    // scan, a sort, an automatic index and a reprepare in any family.
    work(&db, || file.write(SLOT / 2 + 3, &noise(WINDOW as usize, 7)));
    work(&db, || file.write(2 * SLOT, &noise(WINDOW as usize, 8)));
    file.check();
}
/// Payload statements of the shifted window.
const SHIFTED: u64 = 3;
/// Stored payload rows and bytes of the sequence above.
const STORED: (u64, u64) = (20, 585_295);
