//! Project provisioning and Sandbox Workspace control. Store calls run in
//! the caller's process (layerfs-store-service), not through this crate.
#![forbid(unsafe_code)]
#![deny(missing_docs)]

mod base;
#[doc(hidden)]
pub use base::internal;
#[doc(hidden)]
pub mod operator;
pub mod project;
pub mod sandbox;
pub use base::failure::{OperationCause, OperationFailure};
pub use base::sdk::{SdkError, SdkResult};
pub use layerfs_project::{InitCounters, InitCounts, InitStep};
pub use project::{
    InitError, InitFailure, InitRequest, InstallError, InstallFailure, InstallWork, Installed,
    ProjectApi, SealedProject,
};
pub use sandbox::{BoundWorkspace, MountFailure, MountedWorkspace, Unmounted, WorkspaceApi};
#[cfg(unix)]
pub use sandbox::{
    ManagedSandbox, SandboxApi, SandboxCause, SandboxCreate, SandboxFailure, SandboxPhase,
};
