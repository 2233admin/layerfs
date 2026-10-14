//! Public Project organization over host Init and authenticated daemon control.
pub(crate) mod init;
pub(crate) mod list_branches;
pub use crate::base::install_types::{InstallError, InstallFailure, InstallWork, Installed};
pub use init::ProjectApi;
pub use init::{InitError, InitFailure, InitRequest, SealedProject};
