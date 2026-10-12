//! Public Project organization over native Init and authenticated daemon control.
mod commits;
mod fork;
pub(crate) mod init;
pub use crate::base::install::install;
pub use crate::base::install_types::{InstallError, InstallFailure, InstallWork, Installed};
pub use init::ProjectApi;
pub use init::{initialize, InitError, InitFailure, InitRequest, SealedProject};
