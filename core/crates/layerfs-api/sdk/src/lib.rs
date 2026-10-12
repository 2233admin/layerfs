//! Project provisioning and authenticated filesystem facades, with no host data service.
#![forbid(unsafe_code)]
#![deny(missing_docs)]

mod base;
#[doc(hidden)]
pub use base::internal;
pub mod project;
#[cfg(unix)]
pub mod sandbox;
pub mod workspace;
pub use base::failure::{OperationCause, OperationFailure};
pub use project::{
    InitError, InitFailure, InitRequest, InstallError, InstallFailure, InstallWork, Installed,
    ProjectApi, SealedProject,
};
#[cfg(unix)]
pub use sandbox::{
    ManagedSandbox, SandboxApi, SandboxCause, SandboxCreate, SandboxFailure, SandboxPhase,
};
pub use workspace::{BoundWorkspace, MountFailure, MountedWorkspace, WorkspaceApi};
