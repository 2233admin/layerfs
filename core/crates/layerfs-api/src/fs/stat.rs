//! `fs.stat`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `stat(path, { branch, commit? })`: type, inode and size of one path.
pub fn stat(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.stat", args)
}
