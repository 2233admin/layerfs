//! Direct connection operations, each one counted short job on the calling thread.
use crate::overlay::owner::Readiness;
use crate::service::receipt::JobReceipt;
use crate::{OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_overlay::{
    BaseSource, Capture, CapturedReader, Cell, DirectoryEntry, FileRead, Inode, Lease, LookupOwner,
    OpenFile, OperationOwner, OverlayError, Route,
};
impl OwnerClient {
    pub fn acquire_lookup(
        &self,
        route: Option<Route>,
        source: BaseSource,
        request: u64,
        base: Inode,
        root: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if source.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.acquire_lookup(source, request, &base, root)
                    .map(|l| Response::Lookup(Some(l)))
            }
        })
    }
    pub fn retained_lookup(
        &self,
        route: Option<Route>,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                db.retained_lookup(route, request).map(Response::Lookup)
            }
        })
    }
    pub fn release_lookup(
        &self,
        route: Option<Route>,
        lookup: LookupOwner,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if lookup.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.release_lookup(lookup).map(|_| Response::Done)
            }
        })
    }
    pub fn acquire_lookup_read(
        &self,
        route: Option<Route>,
        source: BaseSource,
        lookup: LookupOwner,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if source.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.acquire_lookup_read(source, lookup, request)
                    .map(|r| Response::FileReader(Some(r)))
            }
        })
    }
    pub fn acquire_operation(
        &self,
        route: Option<Route>,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.acquire_operation(route, request)
                .map(|o| Response::Operation(Some(o)))
        })
    }
    pub fn retained_operation(
        &self,
        route: Option<Route>,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.retained_operation(route, request)
                .map(Response::Operation)
        })
    }
    pub fn release_operation(
        &self,
        route: Option<Route>,
        owner: OperationOwner,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if owner.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.release_operation(owner).map(|_| Response::Done)
            }
        })
    }
    pub fn retained_file(
        &self,
        route: Option<Route>,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.retained_file(route, request).map(Response::File)
        })
    }
    pub fn retained_file_read(
        &self,
        route: Option<Route>,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.retained_file_read(route, request)
                .map(Response::FileReader)
        })
    }
    pub fn retained_captured_reader(
        &self,
        route: Option<Route>,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.retained_captured_reader(route, request)
                .map(Response::CapturedReader)
        })
    }
    pub fn open_file(
        &self,
        route: Option<Route>,
        source: BaseSource,
        request: u64,
        base: Inode,
        writable: bool,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if source.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.open_file(source, request, &base, writable)
                    .map(|value| Response::File(Some(value)))
            }
        })
    }
    pub fn close_file(
        &self,
        route: Option<Route>,
        file: OpenFile,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if file.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.close_file(file).map(|_| Response::Done)
            }
        })
    }
    pub fn acquire_file_read(
        &self,
        route: Option<Route>,
        source: BaseSource,
        file: OpenFile,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if source.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.acquire_file_read(source, file, request)
                    .map(|value| Response::FileReader(Some(value)))
            }
        })
    }
    pub fn release_file_read(
        &self,
        route: Option<Route>,
        read: FileRead,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if read.source().route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.release_file_read(read).map(|_| Response::Done)
            }
        })
    }
    pub fn acquire_captured_reader(
        &self,
        route: Option<Route>,
        capture: Capture,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if capture.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.acquire_captured_reader(capture, request)
                    .map(|value| Response::CapturedReader(Some(value)))
            }
        })
    }
    pub fn release_captured_reader(
        &self,
        route: Option<Route>,
        reader: CapturedReader,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if reader.capture().route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.release_captured_reader(reader).map(|_| Response::Done)
            }
        })
    }
    pub fn maintenance_idle(&self, route: Option<Route>) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.maintenance_idle(route).map(Response::MaintenanceIdle)
        })
    }
    pub fn state(&self, route: Option<Route>) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.state(route).map(Response::State)
        })
    }
    pub fn retained_capture(&self, route: Option<Route>) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.retained_capture(route).map(Response::RetainedCapture)
        })
    }
    pub fn retained_base_source(
        &self,
        route: Option<Route>,
        owner: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.retained_base_source(route, owner)
                .map(Response::RetainedBaseSource)
        })
    }
    pub fn release_base_source(
        &self,
        route: Option<Route>,
        source: BaseSource,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if source.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.release_base_source(source).map(|_| Response::Done)
            }
        })
    }
    pub fn cleanup_state(&self, route: Option<Route>) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.cleanup_state(route).map(Response::CleanupState)
        })
    }
    pub fn close(&self, route: Option<Route>) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.close(route).map(|_| Response::Done)
        })
    }
    pub fn release_closed_capture(
        &self,
        route: Option<Route>,
        capture: Capture,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if capture.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.release_closed_capture(capture).map(|_| Response::Done)
            }
        })
    }
    pub fn publish(
        &self,
        route: Option<Route>,
        inode: Inode,
        name: Option<DirectoryEntry>,
        cell: Option<Cell>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Mutation, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.publish(route, &inode, name.as_ref(), cell.as_ref())
                .map(Response::Published)
        })
    }
    pub fn capture(&self, route: Option<Route>) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::Capture,
            Some(Readiness::Capture),
            move |db, route| {
                let route = route.ok_or(OverlayError::Invalid("missing route"))?;
                db.capture(route).map(Response::Captured)
            },
        )
    }
    pub fn resolve_failed(
        &self,
        route: Option<Route>,
        capture: Capture,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if capture.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.resolve_failed_capture(capture).map(|_| Response::Done)
            }
        })
    }
    pub fn install(
        &self,
        route: Option<Route>,
        capture: Capture,
        root: [u8; 32],
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::Capture,
            Some(Readiness::Install(capture)),
            move |db, route| {
                let route = route.ok_or(OverlayError::Invalid("missing route"))?;
                {
                    if capture.route() != route {
                        return Err(layerfs_overlay::OverlayError::Stale);
                    }
                    db.install(capture, root).map(|_| Response::Done)
                }
            },
        )
    }
    pub fn captured_inodes(
        &self,
        route: Option<Route>,
        capture: Capture,
        after: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Capture, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if capture.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.captured_inodes(capture, after).map(Response::Inodes)
            }
        })
    }
    pub fn captured_directory_entries(
        &self,
        route: Option<Route>,
        capture: Capture,
        after: Option<(u64, Vec<u8>)>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Capture, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            {
                if capture.route() != route {
                    return Err(layerfs_overlay::OverlayError::Stale);
                }
                db.captured_directory_entries(
                    capture,
                    after
                        .as_ref()
                        .map(|(parent, name)| (*parent, name.as_slice())),
                )
                .map(Response::DirectoryEntries)
            }
        })
    }
    pub fn acquire(&self, route: Option<Route>, lease: Lease) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.acquire(route, lease).map(|_| Response::Done)
        })
    }
    pub fn release(&self, route: Option<Route>, lease: Lease) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            db.release(route, lease).map(|_| Response::Done)
        })
    }
    pub fn namespace(
        &self,
        route: Option<Route>,
        job: Box<layerfs_workspace::NamespaceJob>,
    ) -> Result<JobReceipt, OwnerError> {
        self.owner_job(route, ServiceClass::Mutation, None, move |db, route| {
            if route != Some(job.source().route()) {
                return Err(OwnerError::Overlay(OverlayError::Stale));
            }
            job.perform(db)
                .map(Response::Namespace)
                .map_err(|cause| OwnerError::Workspace(Box::new(cause)))
        })
    }
    pub fn install_prepared(
        &self,
        route: Option<Route>,
        workspace: std::sync::Arc<layerfs_workspace::Workspace>,
        input: layerfs_workspace::PreparedBase,
    ) -> Result<JobReceipt, OwnerError> {
        let ready = Some(Readiness::Install(input.capture()));
        self.owner_job(route, ServiceClass::Capture, ready, move |db, route| {
            if route != Some(workspace.route()) {
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
