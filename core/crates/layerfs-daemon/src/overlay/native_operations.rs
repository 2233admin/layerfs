//! Direct native visits and ownership changes on the Workspace connection.
use crate::{OwnerClient, OwnerError, ServiceClass};
use layerfs_overlay::{NativeCookieOffer, NativeMount};
use layerfs_workspace::Route;
use layerfs_workspace::{
    NativeDataVisit, NativeDirectoryVisit, NativeMutationVisit, NativeReadVisit,
};
use std::sync::Arc;
impl OwnerClient {
    pub fn native_mount(
        &self,
        route: Route,
        root: u64,
    ) -> Result<layerfs_overlay::NativeMount, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.create_native_mount(root)
        })
    }
    pub fn native_close_file(
        &self,
        route: Route,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.close_native_file(mount, serial, handle)
        })
    }
    pub fn native_observe_visit(
        &self,
        route: Route,
        job: Box<NativeReadVisit>,
    ) -> Result<std::sync::Arc<layerfs_workspace::NativeReadOutcome>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            Ok(Arc::new(job.perform(db)))
        })
    }
    pub fn native_read_visit(
        &self,
        route: Route,
        job: Box<NativeDataVisit>,
    ) -> Result<std::sync::Arc<layerfs_workspace::NativeWindow>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            job.perform(db).map(Arc::new)
        })
    }
    pub fn native_mutate_visit(
        &self,
        route: Route,
        job: Box<NativeMutationVisit>,
    ) -> Result<std::sync::Arc<layerfs_workspace::NativeMutationOutcome>, OwnerError> {
        self.call(route, ServiceClass::Mutation, None, move |db| {
            Ok(Arc::new(job.perform(db)))
        })
    }
    pub fn native_forget(
        &self,
        route: Route,
        mount: NativeMount,
        serial: u64,
        count: u64,
    ) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.forget_native(mount, serial, count)
        })
    }
    pub fn native_retained_mount(
        &self,
        route: Route,
    ) -> Result<Option<layerfs_overlay::NativeMount>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.retained_native_mount()
        })
    }
    pub fn native_state(
        &self,
        route: Route,
        mount: NativeMount,
    ) -> Result<layerfs_overlay::NativeMountState, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.native_mount_state(mount)
        })
    }
    pub fn native_revoke(&self, route: Route, mount: NativeMount) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.revoke_native_mount(mount)
        })
    }
    pub fn native_directory_visit(
        &self,
        route: Route,
        visit: NativeDirectoryVisit,
    ) -> Result<std::sync::Arc<layerfs_workspace::NativeDirectoryWindow>, OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            visit.perform(db).map(Arc::new)
        })
    }
    pub fn native_directory_publish(
        &self,
        route: Route,
        offer: NativeCookieOffer,
        names: Vec<Vec<u8>>,
    ) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.publish_native_cookies(&offer, &names)
        })
    }
    pub fn native_directory_close(
        &self,
        route: Route,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> Result<(), OwnerError> {
        self.call(route, ServiceClass::General, None, move |db| {
            db.close_native_directory(mount, serial, handle)
        })
    }
}
