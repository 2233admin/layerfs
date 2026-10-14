//! Direct connection operations, each one counted short job on the calling thread.
use crate::overlay::owner::Readiness;
use crate::{OwnerClient, OwnerError, ServiceClass};
use layerfs_overlay::{
    BaseSource, Capture, CapturedReader, Cell, DirectoryEntry, FileRead, Inode, LookupOwner,
    OpenFile, OperationOwner, OverlayError,
};
use layerfs_workspace::Route;
impl OwnerClient {
    pub fn acquire_lookup(
        &self,
        route: Route,
        source: BaseSource,
        request: u64,
        base: Inode,
        root: u64,
    ) -> Result<layerfs_overlay::LookupOwner, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.acquire_lookup(source, request, &base, root)
        })
    }
    pub fn retained_lookup(
        &self,
        route: Route,
        request: u64,
    ) -> Result<Option<layerfs_overlay::LookupOwner>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.retained_lookup(request)
        })
    }
    pub fn release_lookup(&self, route: Route, lookup: LookupOwner) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.release_lookup(lookup)
        })
    }
    pub fn acquire_lookup_read(
        &self,
        route: Route,
        source: BaseSource,
        lookup: LookupOwner,
        request: u64,
    ) -> Result<layerfs_overlay::FileRead, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.acquire_lookup_read(source, lookup, request)
        })
    }
    pub fn acquire_operation(
        &self,
        route: Route,
        request: u64,
    ) -> Result<layerfs_overlay::OperationOwner, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.acquire_operation(request)
        })
    }
    pub fn retained_operation(
        &self,
        route: Route,
        request: u64,
    ) -> Result<Option<layerfs_overlay::OperationOwner>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.retained_operation(request)
        })
    }
    pub fn release_operation(&self, route: Route, owner: OperationOwner) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.release_operation(owner)
        })
    }
    pub fn retained_file(
        &self,
        route: Route,
        request: u64,
    ) -> Result<Option<layerfs_overlay::OpenFile>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.retained_file(request)
        })
    }
    pub fn retained_file_read(
        &self,
        route: Route,
        request: u64,
    ) -> Result<Option<layerfs_overlay::FileRead>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.retained_file_read(request)
        })
    }
    pub fn retained_captured_reader(
        &self,
        route: Route,
        request: u64,
    ) -> Result<Option<layerfs_overlay::CapturedReader>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.retained_captured_reader(request)
        })
    }
    pub fn open_file(
        &self,
        route: Route,
        source: BaseSource,
        request: u64,
        base: Inode,
        writable: bool,
    ) -> Result<layerfs_overlay::OpenFile, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.open_file(source, request, &base, writable)
        })
    }
    pub fn close_file(&self, route: Route, file: OpenFile) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.close_file(file)
        })
    }
    pub fn acquire_file_read(
        &self,
        route: Route,
        source: BaseSource,
        file: OpenFile,
        request: u64,
    ) -> Result<layerfs_overlay::FileRead, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.acquire_file_read(source, file, request)
        })
    }
    pub fn release_file_read(&self, route: Route, read: FileRead) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.release_file_read(read)
        })
    }
    pub fn acquire_captured_reader(
        &self,
        route: Route,
        capture: Capture,
        request: u64,
    ) -> Result<layerfs_overlay::CapturedReader, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.acquire_captured_reader(capture, request)
        })
    }
    pub fn release_captured_reader(
        &self,
        route: Route,
        reader: CapturedReader,
    ) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.release_captured_reader(reader)
        })
    }
    pub fn maintenance_idle(&self, route: Route) -> Result<bool, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.maintenance_idle()
        })
    }
    pub fn state(&self, route: Route) -> Result<layerfs_overlay::WorkspaceState, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| db.state())
    }
    pub fn retained_capture(
        &self,
        route: Route,
    ) -> Result<Option<layerfs_overlay::Capture>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.retained_capture()
        })
    }
    pub fn retained_base_source(
        &self,
        route: Route,
        owner: u64,
    ) -> Result<Option<layerfs_overlay::BaseSource>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.retained_base_source(owner)
        })
    }
    pub fn release_base_source(&self, route: Route, source: BaseSource) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.release_base_source(source)
        })
    }
    pub fn cleanup_state(&self, route: Route) -> Result<layerfs_overlay::CleanupState, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.cleanup_state()
        })
    }
    pub fn close(&self, route: Route) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| db.close())
    }
    pub fn release_closed_capture(&self, route: Route, capture: Capture) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.release_closed_capture(capture)
        })
    }
    pub fn publish(
        &self,
        route: Route,
        inode: Inode,
        name: Option<DirectoryEntry>,
        cell: Option<Cell>,
    ) -> Result<layerfs_overlay::Publication, OwnerError> {
        self.call(route, ServiceClass::Mutation, None, move |db| {
            db.publish(&inode, name.as_ref(), cell.as_ref())
        })
    }
    pub fn capture(&self, route: Route) -> Result<layerfs_overlay::Capture, OwnerError> {
        self.call(
            route,
            ServiceClass::General,
            Some(Readiness::Capture),
            move |db| db.capture(),
        )
    }
    pub fn resolve_failed(&self, route: Route, capture: Capture) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.resolve_failed_capture(capture)
        })
    }
    pub fn install(
        &self,
        route: Route,
        capture: Capture,
        root: [u8; 32],
    ) -> Result<(), OwnerError> {
        self.call(
            route,
            ServiceClass::General,
            Some(Readiness::Install(capture)),
            move |db| db.install(capture, root),
        )
    }
    pub fn captured_inodes(
        &self,
        route: Route,
        capture: Capture,
        after: u64,
    ) -> Result<Vec<layerfs_overlay::Inode>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.captured_inodes(capture, after)
        })
    }
    pub fn captured_directory_entries(
        &self,
        route: Route,
        capture: Capture,
        after: Option<(u64, Vec<u8>)>,
    ) -> Result<Vec<layerfs_overlay::DirectoryEntry>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.captured_directory_entries(
                capture,
                after
                    .as_ref()
                    .map(|(parent, name)| (*parent, name.as_slice())),
            )
        })
    }
    pub fn namespace(
        &self,
        route: Route,
        job: Box<layerfs_workspace::NamespaceJob>,
    ) -> Result<layerfs_workspace::JobOutcome, OwnerError> {
        self.call_observed(Some(route), ServiceClass::Mutation, None, move |db, _| {
            if route.engine() != job.source().engine() {
                return Err(OwnerError::Overlay(OverlayError::Stale));
            }
            job.perform(db)
                .map_err(|cause| OwnerError::Workspace(Box::new(cause)))
        })
        .map(|(value, _)| value)
    }
    pub fn install_prepared(
        &self,
        route: Route,
        workspace: std::sync::Arc<layerfs_workspace::Workspace>,
        input: layerfs_workspace::PreparedBase,
    ) -> Result<(), OwnerError> {
        let ready = Some(Readiness::Install(input.capture()));
        self.call_observed(Some(route), ServiceClass::General, ready, move |db, _| {
            if route != workspace.route() {
                return Err(OwnerError::Install {
                    cause: Box::new(OverlayError::Stale.into()),
                    input: Box::new(input),
                });
            }
            workspace
                .install_prepared_base(db, input)
                .map_err(|(cause, input)| OwnerError::Install {
                    cause: Box::new(cause),
                    input: Box::new(input),
                })
        })
        .map(|(value, _)| value)
    }
}
