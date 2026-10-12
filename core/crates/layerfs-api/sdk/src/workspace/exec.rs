//! Optional ordinary Sandbox launch at the acknowledged mounted directory.
use crate::{ManagedSandbox, MountedWorkspace, WorkspaceApi};
use layerfs_sandbox::backend::docker::{ExecCreateFailure, ExecCreated};

impl WorkspaceApi<'_> {
    /// Creates one ordinary command at this mount using the deployment's admitted identity.
    /// The returned Sandbox runtime owner owns Start, streams, exit status and cancellation.
    /// This sends no daemon request, registers no Exec and performs no Commit or unmount.
    pub fn exec(
        sandbox: &ManagedSandbox,
        workspace: &MountedWorkspace,
        arguments: Vec<String>,
        environment: Vec<String>,
        stdin: bool,
    ) -> Result<ExecCreated, Box<ExecCreateFailure>> {
        sandbox.exec(
            arguments,
            environment,
            workspace.ready.directory.clone(),
            stdin,
        )
    }
}
