//! Public Project organization over host Init.
pub(crate) mod init;
pub use crate::base::install_types::{InstallError, InstallFailure, InstallWork, Installed};
pub use init::ProjectApi;
pub use init::{InitError, InitFailure, InitRequest, SealedProject};
