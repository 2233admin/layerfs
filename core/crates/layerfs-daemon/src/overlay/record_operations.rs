//! Direct connection operations, each one counted short job on the calling thread.
use crate::service::receipt::JobReceipt;
use crate::{OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_overlay::{OverlayError, Route};
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
}
