//! Direct native visits and ownership changes on the Workspace connection.
use crate::service::receipt::JobReceipt;
use crate::{NativeDirectoryReply, NativeReply, OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_overlay::{NativeCookieOffer, NativeMount};
use layerfs_workspace::Route;
use layerfs_workspace::{
    NativeDataVisit, NativeDirectoryVisit, NativeMutationVisit, NativeReadVisit,
};
use std::sync::Arc;
impl OwnerClient {
    pub fn native_mount(&self, route: Route, root: u64) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            (db.create_native_mount(root).map(NativeReply::Mount)).map(Response::Native)
        })
    }
    pub fn native_file(
        &self,
        route: Route,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            (db.native_file(mount, serial, handle).map(NativeReply::File)).map(Response::Native)
        })
    }
    pub fn native_close_file(
        &self,
        route: Route,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            (db.close_native_file(mount, serial, handle)
                .map(|()| NativeReply::Done))
            .map(Response::Native)
        })
    }
    pub fn native_observe_visit(
        &self,
        route: Route,
        job: Box<NativeReadVisit>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            Ok(Response::Native(NativeReply::Observed(Arc::new(
                job.perform(db),
            ))))
        })
    }
    pub fn native_read_visit(
        &self,
        route: Route,
        job: Box<NativeDataVisit>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            (job.perform(db)
                .map(|window| NativeReply::Window(Arc::new(window))))
            .map(Response::Native)
        })
    }
    pub fn native_mutate_visit(
        &self,
        route: Route,
        job: Box<NativeMutationVisit>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Mutation, None, move |db| {
            Ok(Response::Native(NativeReply::Mutated(Arc::new(
                job.perform(db),
            ))))
        })
    }
    pub fn native_forget(
        &self,
        route: Route,
        mount: NativeMount,
        serial: u64,
        count: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            (db.forget_native(mount, serial, count)
                .map(|()| NativeReply::Done))
            .map(Response::Native)
        })
    }
    pub fn native_retained_mount(&self, route: Route) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            (db.retained_native_mount().map(NativeReply::RetainedMount)).map(Response::Native)
        })
    }
    pub fn native_state(&self, route: Route, mount: NativeMount) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            (db.native_mount_state(mount).map(NativeReply::State)).map(Response::Native)
        })
    }
    pub fn native_revoke(
        &self,
        route: Route,
        mount: NativeMount,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            (db.revoke_native_mount(mount).map(|()| NativeReply::Done)).map(Response::Native)
        })
    }
    pub fn native_directory_visit(
        &self,
        route: Route,
        visit: NativeDirectoryVisit,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            (visit
                .perform(db)
                .map(|window| NativeDirectoryReply::Window(Arc::new(window))))
            .map(|value| Response::Native(NativeReply::Directory(value)))
        })
    }
    pub fn native_directory_publish(
        &self,
        route: Route,
        offer: NativeCookieOffer,
        names: Vec<Vec<u8>>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Read, None, move |db| {
            (db.publish_native_cookies(&offer, &names)
                .map(|()| NativeDirectoryReply::Done))
            .map(|value| Response::Native(NativeReply::Directory(value)))
        })
    }
    pub fn native_directory_close(
        &self,
        route: Route,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db| {
            (db.close_native_directory(mount, serial, handle)
                .map(|()| NativeDirectoryReply::Done))
            .map(|value| Response::Native(NativeReply::Directory(value)))
        })
    }
}
