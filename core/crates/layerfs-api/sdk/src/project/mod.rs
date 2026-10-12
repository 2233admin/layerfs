//! Public Project organization over native Init and authenticated daemon control.
pub(crate) mod branches;
pub(crate) mod commits;
pub(crate) mod fork;
pub(crate) mod init;
pub use crate::base::install_types::{InstallError, InstallFailure, InstallWork, Installed};
pub use init::ProjectApi;
pub use init::{InitError, InitFailure, InitRequest, SealedProject};
