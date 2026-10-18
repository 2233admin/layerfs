//! The merge plan's rows as the streamed source of the backed update route.
//!
//! The rows are the decided changes; the operation's own validation and
//! reference state goes to the caller's records, so no total of the merged
//! root is refused against a resident budget.

use crate::error::ContentResult;
use crate::filesystem::rows::{
    DirectoryChangeLookup, DirectoryChangeSource, DirectoryHeader, DirectoryHeaderSource,
    InodeRowSource, PreparedDirectoryStreams, RowSource, SerialRowSource, StreamedRowSource,
};
use crate::filesystem::{
    DirectoryUpdate, FilesystemInput, FilesystemResources, FilesystemRootId, InodeScope, PathName,
};
use crate::object::inode_leaf::InodeValue;

/// Sorted plan rows: parents ascending, names ascending within a parent.
pub(super) struct PlanRows<'a>(pub(super) FilesystemInput<'a>);

impl PlanRows<'_> {
    fn directory(&self, parent: u64) -> Option<&DirectoryUpdate> {
        let rows = self.0.directories;
        rows.binary_search_by_key(&parent, |row| row.parent)
            .ok()
            .map(|index| &rows[index])
    }
}

struct Headers<'a>(std::slice::Iter<'a, DirectoryUpdate>);

impl DirectoryHeaderSource for Headers<'_> {
    fn next_row(&mut self) -> ContentResult<Option<DirectoryHeader>> {
        Ok(self.0.next().map(|row| DirectoryHeader {
            parent: row.parent,
            change_rows: row.changes.len() as u64,
        }))
    }
}

struct Changes<'a>(std::slice::Iter<'a, (PathName, Option<u64>)>);

impl DirectoryChangeSource for Changes<'_> {
    fn next_row(&mut self) -> ContentResult<Option<(PathName, Option<u64>)>> {
        Ok(self.0.next().cloned())
    }
}

impl StreamedRowSource for PlanRows<'_> {
    fn directory_rows(&self) -> usize {
        self.0.directories.len()
    }
    fn inode_rows(&self) -> usize {
        self.0.inodes.len()
    }
    fn new_rows(&self) -> usize {
        self.0.new_inodes.len()
    }
    fn directory_headers(&self) -> ContentResult<Box<dyn DirectoryHeaderSource + '_>> {
        Ok(Box::new(Headers(self.0.directories.iter())))
    }
    fn directory_header(&self, parent: u64) -> ContentResult<Option<DirectoryHeader>> {
        Ok(self.directory(parent).map(|row| DirectoryHeader {
            parent,
            change_rows: row.changes.len() as u64,
        }))
    }
    fn directory_changes(&self, parent: u64) -> ContentResult<Box<dyn DirectoryChangeSource + '_>> {
        let changes = self.directory(parent).map_or(&[][..], |row| &row.changes);
        Ok(Box::new(Changes(changes.iter())))
    }
    fn directory_change(
        &self,
        parent: u64,
        name: &PathName,
    ) -> ContentResult<DirectoryChangeLookup> {
        let Some(row) = self.directory(parent) else {
            return Ok(DirectoryChangeLookup::Unchanged);
        };
        Ok(
            match row.changes.binary_search_by(|(key, _)| key.cmp(name)) {
                Err(_) => DirectoryChangeLookup::Unchanged,
                Ok(index) => row.changes[index]
                    .1
                    .map_or(DirectoryChangeLookup::Removed, DirectoryChangeLookup::Bound),
            },
        )
    }
    fn inodes(&self) -> ContentResult<Box<dyn InodeRowSource + '_>> {
        self.0.inodes()
    }
    fn new_inodes(&self) -> ContentResult<Box<dyn SerialRowSource + '_>> {
        self.0.new_inodes()
    }
    fn value_for(&self, serial: u64) -> ContentResult<Option<InodeValue>> {
        self.0.value_for(serial)
    }
    fn new_position(&self, serial: u64) -> ContentResult<Option<usize>> {
        self.0.new_position(serial)
    }
}

impl PreparedDirectoryStreams for PlanRows<'_> {
    fn base(&self) -> Option<FilesystemRootId> {
        self.0.base
    }
    fn scope(&self) -> InodeScope {
        self.0.scope
    }
    fn root_serial(&self) -> u64 {
        self.0.root_serial
    }
    fn resources(&self) -> FilesystemResources {
        self.0.resources
    }
}
