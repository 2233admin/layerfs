//! Direct native visits and ownership changes on the Workspace connection.
use crate::service::receipt::JobReceipt;
use crate::{NativeDirectoryReply, NativeReply, OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_overlay::{NativeCookieOffer, NativeMount, OverlayError, Route};
use layerfs_workspace::{
    NativeDataVisit, NativeDirectoryVisit, NativeMutationVisit, NativeReadVisit,
};
use std::sync::Arc;
impl OwnerClient {
    pub fn native_mount(&self, route: Option<Route>, root: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;

            (db.create_native_mount(route, root).map(NativeReply::Mount)).map(Response::Native)
        })
    }
    pub fn native_retained_mount(&self, route: Option<Route>) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;

            (db.retained_native_mount(route)
                .map(NativeReply::RetainedMount))
            .map(Response::Native)
        })
    }
    pub fn native_retained_file(
        &self,
        route: Option<Route>,
        mount: NativeMount,
        request: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if mount.route() != route {
                return Err(OverlayError::Stale);
            }
            (db.retained_native_file(mount, request)
                .map(NativeReply::RetainedFile))
            .map(Response::Native)
        })
    }
    pub fn native_file(
        &self,
        route: Option<Route>,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if mount.route() != route {
                return Err(OverlayError::Stale);
            }
            (db.native_file(mount, serial, handle).map(NativeReply::File)).map(Response::Native)
        })
    }
    pub fn native_close_file(
        &self,
        route: Option<Route>,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if mount.route() != route {
                return Err(OverlayError::Stale);
            }
            (db.close_native_file(mount, serial, handle)
                .map(|()| NativeReply::Done))
            .map(Response::Native)
        })
    }
    pub fn native_observe_visit(
        &self,
        route: Option<Route>,
        job: Box<NativeReadVisit>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if job.mount().route() != route {
                return Err(OverlayError::Stale);
            }
            Ok(Response::Native(NativeReply::Observed(Arc::new(
                job.perform(db),
            ))))
        })
    }
    pub fn native_read_visit(
        &self,
        route: Option<Route>,
        job: Box<NativeDataVisit>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if job.mount().route() != route {
                return Err(OverlayError::Stale);
            }
            (job.perform(db)
                .map(|window| NativeReply::Window(Arc::new(window))))
            .map(Response::Native)
        })
    }
    pub fn native_mutate_visit(
        &self,
        route: Option<Route>,
        job: Box<NativeMutationVisit>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Mutation, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if job.mount().route() != route {
                return Err(OverlayError::Stale);
            }
            Ok(Response::Native(NativeReply::Mutated(Arc::new(
                job.perform(db),
            ))))
        })
    }
    pub fn native_forget(
        &self,
        route: Option<Route>,
        mount: NativeMount,
        serial: u64,
        count: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if mount.route() != route {
                return Err(OverlayError::Stale);
            }
            (db.forget_native(mount, serial, count)
                .map(|()| NativeReply::Done))
            .map(Response::Native)
        })
    }
    pub fn native_state(
        &self,
        route: Option<Route>,
        mount: NativeMount,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if mount.route() != route {
                return Err(OverlayError::Stale);
            }
            (db.native_mount_state(mount).map(NativeReply::State)).map(Response::Native)
        })
    }
    pub fn native_revoke(
        &self,
        route: Option<Route>,
        mount: NativeMount,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if mount.route() != route {
                return Err(OverlayError::Stale);
            }
            (db.revoke_native_mount(mount).map(|()| NativeReply::Done)).map(Response::Native)
        })
    }
    pub fn native_directory_visit(
        &self,
        route: Option<Route>,
        visit: NativeDirectoryVisit,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if visit.mount().route() != route {
                return Err(OverlayError::Stale);
            }
            (visit
                .perform(db)
                .map(|window| NativeDirectoryReply::Window(Arc::new(window))))
            .map(|value| Response::Native(NativeReply::Directory(value)))
        })
    }
    pub fn native_directory_publish(
        &self,
        route: Option<Route>,
        offer: NativeCookieOffer,
        names: Vec<Vec<u8>>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if offer.directory().mount().route() != route {
                return Err(OverlayError::Stale);
            }
            (db.publish_native_cookies(&offer, &names)
                .map(|()| NativeDirectoryReply::Done))
            .map(|value| Response::Native(NativeReply::Directory(value)))
        })
    }
    pub fn native_directory_close(
        &self,
        route: Option<Route>,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, route| {
            let route = route.ok_or(OverlayError::Invalid("missing route"))?;
            if mount.route() != route {
                return Err(OverlayError::Stale);
            }
            (db.close_native_directory(mount, serial, handle)
                .map(|()| NativeDirectoryReply::Done))
            .map(|value| Response::Native(NativeReply::Directory(value)))
        })
    }
}
