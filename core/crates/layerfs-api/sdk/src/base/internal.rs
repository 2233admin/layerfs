//! Hidden original-channel access for recovery, diagnostics and external proofs.
pub use super::control::{Control, ControlCause, ControlFailure, ControlPhase};
pub use super::install::install;
use crate::{BoundWorkspace, OperationFailure, WorkspaceApi};
use layerfs_bridge::{
    control::{CleanupObservation, ForcedOutcome, ReadyMount, WorkspaceStatus, WorkspaceToken},
    native::Connection,
};
use layerfs_history::{BranchId, WorkspaceId};
use std::ops::{Deref, DerefMut};

/// Diagnostic facade over the same operation owner, without channel policy changes.
pub struct InternalWorkspaceApi<'a>(WorkspaceApi<'a>);
/// Borrows an original channel without reconnecting or resetting correlation.
pub fn workspace(control: &mut Control) -> InternalWorkspaceApi<'_> {
    InternalWorkspaceApi(WorkspaceApi {
        control,
        observation_scope: None,
    })
}
/// Applies explicit observation scope only to this borrow's filesystem calls.
pub fn with_observations<'a>(
    control: &'a mut Control,
    scope: &'a [u8; 32],
) -> InternalWorkspaceApi<'a> {
    InternalWorkspaceApi(WorkspaceApi {
        control,
        observation_scope: Some(scope),
    })
}
impl<'a> Deref for InternalWorkspaceApi<'a> {
    type Target = WorkspaceApi<'a>;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
impl DerefMut for InternalWorkspaceApi<'_> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}
impl InternalWorkspaceApi<'_> {
    /// Original logical bind for component proofs; native mount still uses both steps.
    pub fn bind(
        &mut self,
        workspace: WorkspaceId,
        branch: BranchId,
    ) -> Result<BoundWorkspace, Box<OperationFailure>> {
        self.0.bind(workspace, branch)
    }
    /// Original attachment for separately acknowledged ownership proofs.
    pub fn attach(&mut self, token: WorkspaceToken) -> Result<ReadyMount, Box<OperationFailure>> {
        self.0.attach(token)
    }
    /// Observes a lost mount acknowledgement without replay.
    pub fn locate(
        &mut self,
        workspace: WorkspaceId,
    ) -> Result<WorkspaceStatus, Box<OperationFailure>> {
        self.0.locate(workspace)
    }
    /// Observes automatic local physical reclamation once.
    pub fn cleanup(
        &mut self,
        token: WorkspaceToken,
    ) -> Result<CleanupObservation, Box<OperationFailure>> {
        self.0.cleanup(token)
    }
    /// Original explicit unknown-relinquishment policy for forced custody proofs.
    pub fn force_unmount(
        &mut self,
        token: WorkspaceToken,
        relinquish_unknown: bool,
    ) -> Result<ForcedOutcome, Box<OperationFailure>> {
        self.0.force_unmount(token, relinquish_unknown)
    }
}
/// Original install on an existing control owner, without a correlation reset.
pub fn install_project(
    control: &mut Control,
    project: &crate::SealedProject,
) -> Result<crate::Installed, Box<crate::InstallFailure>> {
    control.install_project(project)
}
/// Transfers the original terminal connection only for its fence proof.
pub fn into_connection(control: Control) -> Connection {
    control.into_connection()
}

/// Original authenticated control owner, without a reconnect or reset.
#[cfg(unix)]
pub fn control(sandbox: &mut crate::ManagedSandbox) -> &mut Control {
    &mut sandbox.control
}
/// Original one-attempt startup used by existing-Store deployments and lifecycle proofs.
#[cfg(unix)]
pub fn start(
    api: &crate::SandboxApi,
    request: crate::SandboxCreate,
) -> Result<crate::ManagedSandbox, Box<crate::SandboxFailure>> {
    crate::sandbox::create::create(&api.docker, request)
}
/// Existing bounded startup observation for control-channel qualification.
#[cfg(unix)]
pub fn sandbox_status(
    sandbox: &mut crate::ManagedSandbox,
    wait_for_store: bool,
) -> Result<layerfs_bridge::control::DaemonStatus, Box<OperationFailure>> {
    sandbox.status(wait_for_store)
}

/// Disjoint original runtime/control borrows for concurrent Workspace orchestration.
#[cfg(unix)]
pub fn parts(
    sandbox: &mut crate::ManagedSandbox,
) -> (&layerfs_sandbox::backend::docker::Sandbox, &mut Control) {
    (&sandbox.runtime, &mut sandbox.control)
}

/// Original Fork exchange for component proofs with an existing control owner.
pub fn fork(
    control: &mut Control,
    request: layerfs_history::ForkRequest,
) -> Result<layerfs_history::BranchSnapshot, Box<OperationFailure>> {
    crate::project::fork::fork(control, request)
}
/// Original ancestry exchange for component proofs with an existing control owner.
pub fn commits(
    control: &mut Control,
    request: layerfs_history::CommitHistoryRequest,
) -> Result<layerfs_history::PageResult<layerfs_history::CommitRecord>, Box<OperationFailure>> {
    crate::project::commits::commits(control, request)
}
/// One Branch page on a proof's existing original control owner.
pub fn branches(
    control: &mut Control,
    stack: layerfs_history::LayerStackId,
    page: layerfs_history::Page,
) -> Result<layerfs_history::PageResult<layerfs_history::BranchRecord>, Box<OperationFailure>> {
    crate::project::branches::branches(control, stack, page)
}
