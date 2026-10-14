//! `fs.grep`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `grep(pattern, { branch, path?, cursor? })`: literal matches per line in text files.
pub fn grep(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.grep", args)
}
