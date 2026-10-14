//! Direct connection operations, each one counted short job on the calling thread.
use crate::overlay::owner::Readiness;
use crate::service::receipt::JobReceipt;
use crate::{OwnerClient, OwnerError, Response, ServiceClass};
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
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.acquire_lookup(source, request, &base, root)
                .map(|l| Response::Lookup(Some(l)))
        })
    }
    pub fn retained_lookup(&self, route: Route, request: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.retained_lookup(request).map(Response::Lookup)
        })
    }
    pub fn release_lookup(
        &self,
        route: Route,
        lookup: LookupOwner,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.release_lookup(lookup).map(|_| Response::Done)
        })
    }
    pub fn acquire_lookup_read(
        &self,
        route: Route,
        source: BaseSource,
        lookup: LookupOwner,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.acquire_lookup_read(source, lookup, request)
                .map(|r| Response::FileReader(Some(r)))
        })
    }
    pub fn acquire_operation(&self, route: Route, request: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.acquire_operation(request)
                .map(|o| Response::Operation(Some(o)))
        })
    }
    pub fn retained_operation(&self, route: Route, request: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.retained_operation(request).map(Response::Operation)
        })
    }
    pub fn release_operation(
        &self,
        route: Route,
        owner: OperationOwner,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.release_operation(owner).map(|_| Response::Done)
        })
    }
    pub fn retained_file(&self, route: Route, request: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.retained_file(request).map(Response::File)
        })
    }
    pub fn retained_file_read(&self, route: Route, request: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.retained_file_read(request).map(Response::FileReader)
        })
    }
    pub fn retained_captured_reader(
        &self,
        route: Route,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.retained_captured_reader(request)
                .map(Response::CapturedReader)
        })
    }
    pub fn open_file(
        &self,
        route: Route,
        source: BaseSource,
        request: u64,
        base: Inode,
        writable: bool,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.open_file(source, request, &base, writable)
                .map(|value| Response::File(Some(value)))
        })
    }
    pub fn close_file(&self, route: Route, file: OpenFile) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.close_file(file).map(|_| Response::Done)
        })
    }
    pub fn acquire_file_read(
        &self,
        route: Route,
        source: BaseSource,
        file: OpenFile,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.acquire_file_read(source, file, request)
                .map(|value| Response::FileReader(Some(value)))
        })
    }
    pub fn release_file_read(
        &self,
        route: Route,
        read: FileRead,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.release_file_read(read).map(|_| Response::Done)
        })
    }
    pub fn acquire_captured_reader(
        &self,
        route: Route,
        capture: Capture,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.acquire_captured_reader(capture, request)
                .map(|value| Response::CapturedReader(Some(value)))
        })
    }
    pub fn release_captured_reader(
        &self,
        route: Route,
        reader: CapturedReader,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.release_captured_reader(reader).map(|_| Response::Done)
        })
    }
    pub fn maintenance_idle(&self, route: Route) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.maintenance_idle().map(Response::MaintenanceIdle)
        })
    }
    pub fn state(&self, route: Route) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.state().map(Response::State)
        })
    }
    pub fn retained_capture(&self, route: Route) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.retained_capture().map(Response::RetainedCapture)
        })
    }
    pub fn retained_base_source(&self, route: Route, owner: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.retained_base_source(owner)
                .map(Response::RetainedBaseSource)
        })
    }
    pub fn release_base_source(
        &self,
        route: Route,
        source: BaseSource,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.release_base_source(source).map(|_| Response::Done)
        })
    }
    pub fn cleanup_state(&self, route: Route) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.cleanup_state().map(Response::CleanupState)
        })
    }
    pub fn close(&self, route: Route) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.close().map(|_| Response::Done)
        })
    }
    pub fn release_closed_capture(
        &self,
        route: Route,
        capture: Capture,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.release_closed_capture(capture).map(|_| Response::Done)
        })
    }
    pub fn publish(
        &self,
        route: Route,
        inode: Inode,
        name: Option<DirectoryEntry>,
        cell: Option<Cell>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Mutation, None, move |db| {
            db.publish(&inode, name.as_ref(), cell.as_ref())
                .map(Response::Published)
        })
    }
    pub fn capture(&self, route: Route) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::Capture,
            Some(Readiness::Capture),
            move |db| db.capture().map(Response::Captured),
        )
    }
    pub fn resolve_failed(&self, route: Route, capture: Capture) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            db.resolve_failed_capture(capture).map(|_| Response::Done)
        })
    }
    pub fn install(
        &self,
        route: Route,
        capture: Capture,
        root: [u8; 32],
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::Capture,
            Some(Readiness::Install(capture)),
            move |db| db.install(capture, root).map(|_| Response::Done),
        )
    }
    pub fn captured_inodes(
        &self,
        route: Route,
        capture: Capture,
        after: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Capture, None, move |db| {
            db.captured_inodes(capture, after).map(Response::Inodes)
        })
    }
    pub fn captured_directory_entries(
        &self,
        route: Route,
        capture: Capture,
        after: Option<(u64, Vec<u8>)>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Capture, None, move |db| {
            db.captured_directory_entries(
                capture,
                after
                    .as_ref()
                    .map(|(parent, name)| (*parent, name.as_slice())),
            )
            .map(Response::DirectoryEntries)
        })
    }
    pub fn namespace(
        &self,
        route: Route,
        job: Box<layerfs_workspace::NamespaceJob>,
    ) -> Result<JobReceipt, OwnerError> {
        self.owner_job(Some(route), ServiceClass::Mutation, None, move |db, _| {
            if route.engine() != job.source().engine() {
                return Err(OwnerError::Overlay(OverlayError::Stale));
            }
            job.perform(db)
                .map(Response::Namespace)
                .map_err(|cause| OwnerError::Workspace(Box::new(cause)))
        })
    }
    pub fn install_prepared(
        &self,
        route: Route,
        workspace: std::sync::Arc<layerfs_workspace::Workspace>,
        input: layerfs_workspace::PreparedBase,
    ) -> Result<JobReceipt, OwnerError> {
        let ready = Some(Readiness::Install(input.capture()));
        self.owner_job(Some(route), ServiceClass::Capture, ready, move |db, _| {
            if route != workspace.route() {
                return Err(OwnerError::Install {
                    cause: Box::new(OverlayError::Stale.into()),
                    input: Box::new(input),
                });
            }
            workspace
                .install_prepared_base(db, input)
                .map(|_| Response::Done)
                .map_err(|(cause, input)| OwnerError::Install {
                    cause: Box::new(cause),
                    input: Box::new(input),
                })
        })
    }
}
