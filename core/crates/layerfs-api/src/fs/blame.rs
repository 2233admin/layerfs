//! `fs.blame`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `blame(path, { branch, commit?, fromLine? })`: each line with the Commit that last changed it.
pub fn blame(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.blame", args)
}
