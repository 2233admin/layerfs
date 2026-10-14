//! `project.list_branches`, and the typed bounded Branch page through the
//! Sandbox control owner.
use super::ProjectApi;
use crate::base::sdk::{call, SdkResult};
use crate::{base::failure::exchange, internal::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request, SdkValue};
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
        branch_page(&mut sandbox.control, stack, page)
    }
}

pub(crate) fn branch_page(
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

/// `list_branches()`: every Branch with its id, base and head, main first.
pub fn list_branches(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "project.list_branches", args)
}
