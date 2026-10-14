//! `fs.remove`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `remove(path, { branch, recursive? })`: one Commit removing a path.
pub fn remove(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.remove", args)
}
