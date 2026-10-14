//! Direct connection operations, each one counted short job on the calling thread.
use crate::service::receipt::JobReceipt;
use crate::{OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_workspace::Route;
impl OwnerClient {
    pub fn indexed_operation_record(
        &self,
        route: Route,
        job: Box<crate::IndexedOperationRecordJob>,
    ) -> Result<JobReceipt, OwnerError> {
        self.overlay_job(route, ServiceClass::OperationRecord, None, move |db| {
            job.perform(db).map(Response::IndexedOperationRecord)
        })
    }
}
