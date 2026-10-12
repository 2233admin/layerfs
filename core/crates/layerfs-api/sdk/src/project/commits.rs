//! One anchored Commit page through the original authenticated Sandbox control owner.
use super::ProjectApi;
use crate::{base::failure::exchange, internal::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request};
use layerfs_history::{CommitHistoryRequest, CommitRecord, PageResult};

#[cfg(unix)]
impl ProjectApi {
    /// Reads one anchored bounded ancestry page. No Branch refresh or hidden scan.
    pub fn commits(
        &self,
        sandbox: &mut crate::ManagedSandbox,
        request: CommitHistoryRequest,
    ) -> Result<PageResult<CommitRecord>, Box<OperationFailure>> {
        commits(&mut sandbox.control, request)
    }
}
pub(crate) fn commits(
    control: &mut Control,
    request: CommitHistoryRequest,
) -> Result<PageResult<CommitRecord>, Box<OperationFailure>> {
    let request = Request::History(request);
    match exchange(control, request.clone())? {
        Reply::History(page) => Ok(page),
        reply => Err(OperationFailure::unexpected(request, reply)),
    }
}
