//! Project history facade over caller-owned authenticated filesystem control.
use super::ProjectApi;
use crate::{base::failure::exchange, control::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request};
use layerfs_history::{BranchSnapshot, ForkRequest};

impl ProjectApi {
    /// Forks once through the daemon's direct History owner, preserving a refusal.
    pub fn fork(
        &self,
        control: &mut Control,
        request: ForkRequest,
    ) -> Result<BranchSnapshot, Box<OperationFailure>> {
        let request = Request::Fork(request);
        match exchange(control, request.clone())? {
            Reply::Forked(binding) => Ok(binding),
            reply => Err(OperationFailure::unexpected(request, reply)),
        }
    }
}
