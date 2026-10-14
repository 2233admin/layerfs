//! One Project fork through the original authenticated Sandbox control owner.
use super::ProjectApi;
use crate::{base::failure::exchange, internal::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request};
use layerfs_history::{BranchSnapshot, ForkRequest};

#[cfg(unix)]
impl ProjectApi {
    /// Forks once through this Sandbox's direct History owner, preserving a refusal.
    pub fn fork(
        &self,
        sandbox: &mut crate::ManagedSandbox,
        request: ForkRequest,
    ) -> Result<BranchSnapshot, Box<OperationFailure>> {
        fork(&mut sandbox.control, request)
    }
}
pub(crate) fn fork(
    control: &mut Control,
    request: ForkRequest,
) -> Result<BranchSnapshot, Box<OperationFailure>> {
    let request = Request::Fork(request);
    match exchange(control, request.clone())? {
        Reply::Forked(binding) => Ok(binding),
        reply => Err(OperationFailure::unexpected(request, reply)),
    }
}
