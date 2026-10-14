use layerfs_overlay::{NativeMount, NativeMountState};
use layerfs_workspace::{
    NativeDirectoryWindow, NativeMutationOutcome, NativeReadOutcome, NativeWindow,
};
use std::sync::Arc;
// Job classes are observations only; results retain their concrete payloads.
use layerfs_overlay::{
    BaseSource, Capture, CapturedReader, Cell, DirectoryEntry, DirectoryEntryWindow, FileRead,
    Inode, LookupOwner, OpenFile, OperationOwner, Publication, WorkspaceState,
};
use layerfs_workspace::Route;
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(usize)]
pub enum ServiceClass {
    Read,
    Mutation,
    Capture,
    Lifecycle,
    OperationRecord,
    Source,
}
#[derive(Debug)]
pub enum Response {
    Native(crate::NativeReply),
    CapturedRun(Box<layerfs_overlay::CapturedRunReply>),
    IndexedOperationRecord(crate::IndexedOperationRecordReply),
    Lookup(Option<LookupOwner>),
    Operation(Option<OperationOwner>),
    File(Option<OpenFile>),
    FileReader(Option<FileRead>),
    CapturedReader(Option<CapturedReader>),
    Resources(Box<layerfs_overlay::Resources>),
    Opened(Route),
    State(WorkspaceState),
    MaintenanceIdle(bool),
    CleanupState(layerfs_overlay::CleanupState),
    Inode(Option<Inode>),
    Published(Publication),
    Captured(Capture),
    RetainedCapture(Option<Capture>),
    Publications(Vec<Publication>),
    Inodes(Vec<Inode>),
    DirectoryEntries(Vec<DirectoryEntry>),
    Cell(Option<Cell>),
    BaseSource(BaseSource),
    DirectoryEntry(Option<DirectoryEntry>),
    DirectoryEntryWindow(DirectoryEntryWindow),
    RetainedBaseSource(Option<BaseSource>),
    Namespace(layerfs_workspace::JobOutcome),
    Read(Option<layerfs_overlay::LocalRead>),
    Symlink(Vec<u8>),
    Done,
}
#[derive(Debug)]
pub enum NativeReply {
    Mount(NativeMount),
    RetainedMount(Option<NativeMount>),
    File(OpenFile),
    Observed(Arc<NativeReadOutcome>),
    Window(Arc<NativeWindow>),
    Mutated(Arc<NativeMutationOutcome>),
    Directory(NativeDirectoryReply),
    State(NativeMountState),
    Done,
}
#[derive(Debug)]
pub enum NativeDirectoryReply {
    Window(Arc<NativeDirectoryWindow>),
    Done,
}
