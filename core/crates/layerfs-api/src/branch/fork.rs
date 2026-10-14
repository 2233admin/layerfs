//! `branch.fork`, and the typed fork through the Sandbox control owner.
use crate::base::sdk::{call, SdkResult};
use crate::project::ProjectApi;
use crate::{base::failure::exchange, internal::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request, SdkValue};
use layerfs_history::{BranchSnapshot, ForkRequest};

#[cfg(unix)]
impl ProjectApi {
    /// Forks once through this Sandbox's direct History owner, preserving a refusal.
    pub fn fork(
        &self,
        sandbox: &mut crate::ManagedSandbox,
        request: ForkRequest,
    ) -> Result<BranchSnapshot, Box<OperationFailure>> {
        fork_record(&mut sandbox.control, request)
    }
}

pub(crate) fn fork_record(
    control: &mut Control,
    request: ForkRequest,
) -> Result<BranchSnapshot, Box<OperationFailure>> {
    let request = Request::Fork(request);
    match exchange(control, request.clone())? {
        Reply::Forked(binding) => Ok(binding),
        reply => Err(OperationFailure::unexpected(request, reply)),
    }
}

/// `fork(name, { from })`: a new Branch at a Branch, main, or a Commit or
/// Layer id; metadata only.
pub fn fork(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "branch.fork", args)
}
