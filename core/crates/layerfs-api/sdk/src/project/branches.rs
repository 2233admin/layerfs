//! One bounded Branch page through the original authenticated Sandbox control owner.
use super::ProjectApi;
use crate::{base::failure::exchange, internal::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request};
use layerfs_history::{BranchRecord, LayerStackId, Page, PageResult};

#[cfg(unix)]
impl ProjectApi {
    /// Lists one bounded page in name order; the caller owns authenticated continuation.
    pub fn branches(
        &self,
        sandbox: &mut crate::ManagedSandbox,
        stack: LayerStackId,
        page: Page,
    ) -> Result<PageResult<BranchRecord>, Box<OperationFailure>> {
        branches(&mut sandbox.control, stack, page)
    }
}
pub(crate) fn branches(
    control: &mut Control,
    stack: LayerStackId,
    page: Page,
) -> Result<PageResult<BranchRecord>, Box<OperationFailure>> {
    let request = Request::Branches { stack, page };
    match exchange(control, request.clone())? {
        Reply::Branches(page) => Ok(page),
        reply => Err(OperationFailure::unexpected(request, reply)),
    }
}
