//! `fs.list`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `list(path, { branch, commit?, cursor? })`: one window of a directory.
pub fn list(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.list", args)
}
