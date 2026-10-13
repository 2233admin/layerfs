//! Direct connection operations, each one counted short job on the calling thread.
use crate::service::receipt::JobReceipt;
use crate::{OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_overlay::{OperationOwner, OperationRecord, OverlayError, Route};
impl OwnerClient {
    pub fn indexed_operation_record(
        &self,
        route: Option<Route>,
        job: Box<crate::IndexedOperationRecordJob>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::OperationRecord,
            None,
            move |db, route| {
                let route = route.ok_or(OverlayError::Invalid("missing route"))?;
                {
                    job.perform(db, route).map(Response::IndexedOperationRecord)
                }
            },
        )
    }
    pub fn put_owned_operation_record(
        &self,
        route: Option<Route>,
        owner: OperationOwner,
        record: OperationRecord,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::OperationRecord,
            None,
            move |db, route| {
                let route = route.ok_or(OverlayError::Invalid("missing route"))?;
                {
                    if owner.route() != route {
                        return Err(layerfs_overlay::OverlayError::Stale);
                    }
                    db.put_owned_operation_record(owner, &record)
                        .map(|_| Response::Done)
                }
            },
        )
    }
    pub fn owned_operation_record_page(
        &self,
        route: Option<Route>,
        owner: OperationOwner,
        kind: u32,
        after: Option<u64>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::OperationRecord,
            None,
            move |db, route| {
                let route = route.ok_or(OverlayError::Invalid("missing route"))?;
                {
                    if owner.route() != route {
                        return Err(layerfs_overlay::OverlayError::Stale);
                    }
                    db.owned_operation_record_page(owner, kind, after)
                        .map(Response::OperationRecord)
                }
            },
        )
    }
    pub fn put_operation_record(
        &self,
        route: Option<Route>,
        operation: u64,
        record: OperationRecord,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::OperationRecord,
            None,
            move |db, route| {
                let route = route.ok_or(OverlayError::Invalid("missing route"))?;
                db.put_operation_record(route, operation, &record)
                    .map(|_| Response::Done)
            },
        )
    }
    pub fn operation_record_page(
        &self,
        route: Option<Route>,
        operation: u64,
        kind: u32,
        after: Option<u64>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(
            route,
            ServiceClass::OperationRecord,
            None,
            move |db, route| {
                let route = route.ok_or(OverlayError::Invalid("missing route"))?;
                db.operation_record_page(route, operation, kind, after)
                    .map(Response::OperationRecord)
            },
        )
    }
}
