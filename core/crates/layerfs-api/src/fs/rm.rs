//! `fs.rm`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `rm(path, { branch, recursive? })`: one Commit removing a path.
pub fn rm(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.rm", args)
}
