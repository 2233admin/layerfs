//! `branch.list_commits`, and the typed anchored page through the Sandbox
//! control owner.
use crate::base::sdk::{call, SdkResult};
use crate::project::ProjectApi;
use crate::{base::failure::exchange, internal::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request, SdkValue};
use layerfs_history::{CommitHistoryRequest, CommitRecord, PageResult};

#[cfg(unix)]
impl ProjectApi {
    /// Reads one anchored bounded ancestry page. No Branch refresh or hidden scan.
    pub fn commits(
        &self,
        sandbox: &mut crate::ManagedSandbox,
        request: CommitHistoryRequest,
    ) -> Result<PageResult<CommitRecord>, Box<OperationFailure>> {
        commit_page(&mut sandbox.control, request)
    }
}

pub(crate) fn commit_page(
    control: &mut Control,
    request: CommitHistoryRequest,
) -> Result<PageResult<CommitRecord>, Box<OperationFailure>> {
    let request = Request::History(request);
    match exchange(control, request.clone())? {
        Reply::History(page) => Ok(page),
        reply => Err(OperationFailure::unexpected(request, reply)),
    }
}

/// `list_commits({ branch, cursor? })`: one page, newest first.
pub fn list_commits(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "branch.list_commits", args)
}
