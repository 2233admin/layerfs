//! Logical byte accounting over canonical inode values, independent of encoding.
use super::{
    inode::read::{rows_after, InodeReadWork},
    sorted::format::CompactInodes,
    FilesystemRootId,
};
use crate::object::inode_leaf::{InodeKind, InodeValue};
use crate::{
    compare::{
        sorted::{difference, DifferenceWork},
        TreeTable,
    },
    AuthenticatedObjects, ContentError, ContentResult, FileView,
};
use layerfs_telemetry::timer::Timing;

fn bytes(reader: &dyn AuthenticatedObjects, value: Option<&InodeValue>) -> ContentResult<i128> {
    let Some(value) = value.filter(|value| value.kind == InodeKind::RegularFile) else {
        return Ok(0);
    };
    let (length, _) = Timing::disabled("filesystem.logical", |timing| {
        FileView::open(reader, value.content_root, timing.child("length"))
            .map(|view| view.logical_len())
    });
    Ok(i128::from(length?) * i128::from(value.namespace_ref_count))
}

/// Counts an initial root in bounded inode-leaf windows; reads file roots, not payload streams.
pub fn logical_size(
    reader: &dyn AuthenticatedObjects,
    root: FilesystemRootId,
) -> ContentResult<u64> {
    let tree = TreeTable::open(reader, root)?;
    let mut after = None;
    let mut sum = 0i128;
    loop {
        let rows = rows_after(reader, tree.table, after, &mut InodeReadWork::default())?;
        if rows.is_empty() {
            break;
        }
        for (serial, value) in rows {
            after = Some(serial);
            sum += bytes(reader, Some(&value))?;
        }
    }
    u64::try_from(sum).map_err(|_| ContentError::InvalidRecord("logical byte overflow"))
}

/// Updates known logical size by page-skipping inode differences, including hardlink count changes.
pub fn logical_size_after(
    reader: &dyn AuthenticatedObjects,
    before: FilesystemRootId,
    after: FilesystemRootId,
    known: u64,
) -> ContentResult<u64> {
    if before == after {
        return Ok(known);
    }
    let left = TreeTable::open(reader, before)?;
    let right = TreeTable::open(reader, after)?;
    let mut sum = i128::from(known);
    difference::<CompactInodes>(
        reader,
        Some(left.table.root),
        Some(right.table.root),
        &mut DifferenceWork::default(),
        |_, before, after| {
            sum += bytes(reader, after)? - bytes(reader, before)?;
            Ok(())
        },
    )?;
    u64::try_from(sum).map_err(|_| ContentError::InvalidRecord("logical byte overflow"))
}
