//! Direct connection operations, each one counted short job on the calling thread.
use crate::service::receipt::JobReceipt;
use crate::{OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_overlay::{BaseSource, Capture, CapturedReader, FileRead};
use layerfs_workspace::Route;
impl OwnerClient {
    pub fn reader_inodes(
        &self,
        route: Route,
        reader: CapturedReader,
        after: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.reader_inodes(reader, after).map(Response::Inodes)
        })
    }
    pub fn reader_directory_entries(
        &self,
        route: Route,
        reader: CapturedReader,
        after: Option<(u64, Vec<u8>)>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.reader_directory_entries(reader, after.as_ref().map(|(p, n)| (*p, n.as_slice())))
                .map(Response::DirectoryEntries)
        })
    }
    pub fn reader_parent_directory_entries(
        &self,
        route: Route,
        reader: CapturedReader,
        parent: u64,
        after: Option<Vec<u8>>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.reader_parent_directory_entries(reader, parent, after.as_deref())
                .map(Response::DirectoryEntries)
        })
    }
    pub fn reader_directory_entry(
        &self,
        route: Route,
        reader: CapturedReader,
        parent: u64,
        name: Vec<u8>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.reader_directory_entry(reader, parent, &name)
                .map(Response::DirectoryEntry)
        })
    }
    pub fn reader_symlink(
        &self,
        route: Route,
        reader: CapturedReader,
        serial: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.reader_symlink(reader, serial).map(Response::Symlink)
        })
    }
    pub fn file_read(
        &self,
        route: Route,
        read: FileRead,
        offset: u64,
        length: u32,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.read_file(read, offset, length).map(Response::Read)
        })
    }
    pub fn captured_read(
        &self,
        route: Route,
        reader: CapturedReader,
        serial: u64,
        offset: u64,
        length: u32,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.read_captured(reader, serial, offset, length)
                .map(Response::Read)
        })
    }
    pub fn captured_run(
        &self,
        route: Route,
        cursor: Box<layerfs_overlay::CapturedRunCursor>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.captured_run_step(*cursor)
                .map(|value| Response::CapturedRun(Box::new(value)))
        })
    }
    pub fn reader_inode(
        &self,
        route: Route,
        reader: CapturedReader,
        serial: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.reader_inode(reader, serial).map(Response::Inode)
        })
    }
    pub fn source_read(
        &self,
        route: Route,
        source: BaseSource,
        serial: u64,
        offset: u64,
        length: u32,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.source_read(source, serial, offset, length)
                .map(Response::Read)
        })
    }
    pub fn source_cell(
        &self,
        route: Route,
        source: BaseSource,
        serial: u64,
        generation: u64,
        offset: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.source_cell(source, serial, generation, offset)
                .map(Response::Cell)
        })
    }
    pub fn pending_publications(&self, route: Route, after: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.pending_publications(after).map(Response::Publications)
        })
    }
    pub fn acquire_base_source(&self, route: Route, owner: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Source, None, move |db| {
            db.acquire_base_source(owner).map(Response::BaseSource)
        })
    }
    pub fn source_inode(
        &self,
        route: Route,
        source: BaseSource,
        serial: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.source_inode(source, serial).map(Response::Inode)
        })
    }
    pub fn source_directory_entry(
        &self,
        route: Route,
        source: BaseSource,
        parent: u64,
        name: Vec<u8>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.source_directory_entry(source, parent, &name)
                .map(Response::DirectoryEntry)
        })
    }
    pub fn source_directory_entries(
        &self,
        route: Route,
        source: BaseSource,
        parent: u64,
        after: Option<Vec<u8>>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.source_directory_entry_window(source, parent, after.as_deref())
                .map(Response::DirectoryEntryWindow)
        })
    }
    pub fn inode(&self, route: Route, serial: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.inode(serial).map(Response::Inode)
        })
    }
    pub fn captured_cell(
        &self,
        route: Route,
        capture: Capture,
        serial: u64,
        offset: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            db.captured_cell(capture, serial, offset)
                .map(Response::Cell)
        })
    }
}
