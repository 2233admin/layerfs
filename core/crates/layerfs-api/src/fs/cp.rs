//! `fs.cp`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `cp(from, to, { branch, recursive? })`: one Commit copying a path.
pub fn cp(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.cp", args)
}
