//! Project history facade over caller-owned authenticated filesystem control.
use super::ProjectApi;
use crate::{base::failure::exchange, control::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request};
use layerfs_history::{CommitHistoryRequest, CommitRecord, PageResult};

impl ProjectApi {
    /// Reads one anchored bounded ancestry page. No Branch refresh or hidden scan.
    pub fn history(
        &self,
        control: &mut Control,
        request: CommitHistoryRequest,
    ) -> Result<PageResult<CommitRecord>, Box<OperationFailure>> {
        let request = Request::History(request);
        match exchange(control, request.clone())? {
            Reply::History(page) => Ok(page),
            reply => Err(OperationFailure::unexpected(request, reply)),
        }
    }
}
