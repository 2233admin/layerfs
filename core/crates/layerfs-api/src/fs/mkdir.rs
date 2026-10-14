//! `fs.mkdir`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `mkdir(path, { branch, recursive? })`: one Commit creating a directory.
pub fn mkdir(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.mkdir", args)
}
