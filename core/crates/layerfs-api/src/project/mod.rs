//! Public Project organization over host Init, and the project's Branches.
pub(crate) mod init;
mod list_branches;
pub use crate::base::install_types::{InstallError, InstallFailure, InstallWork, Installed};
pub use init::ProjectApi;
pub use init::{InitError, InitFailure, InitRequest, SealedProject};
pub use list_branches::list_branches;
