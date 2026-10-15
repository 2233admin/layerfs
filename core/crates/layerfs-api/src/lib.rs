//! Project provisioning and authenticated filesystem facades, with no host data service.
#![forbid(unsafe_code)]
#![deny(missing_docs)]

mod base;
#[doc(hidden)]
pub use base::internal;
pub mod branch;
pub mod fs;
#[doc(hidden)]
pub mod operator;
pub mod project;
pub mod sandbox;
pub use base::failure::{OperationCause, OperationFailure};
pub use base::sdk::{call, SdkError, SdkResult};
pub use project::{
    InitError, InitFailure, InitRequest, InstallError, InstallFailure, InstallWork, Installed,
    ProjectApi, SealedProject,
};
pub use sandbox::{BoundWorkspace, MountFailure, MountedWorkspace, Unmounted, WorkspaceApi};
#[cfg(unix)]
pub use sandbox::{
    ManagedSandbox, SandboxApi, SandboxCause, SandboxCreate, SandboxFailure, SandboxPhase,
};
