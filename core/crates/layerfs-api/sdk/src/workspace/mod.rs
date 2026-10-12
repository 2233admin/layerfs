//! Public Workspace organization with exact logical and native readiness.
mod commit;
#[cfg(unix)]
pub(crate) mod exec;
mod mount;
mod status;
mod unmount;
pub use mount::BoundWorkspace;
pub use mount::WorkspaceApi;
pub use mount::{MountFailure, MountedWorkspace};
