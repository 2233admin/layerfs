//! `fs.diff_files`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `diff_files({ left, right }, { branch })`: two files compared line by line.
pub fn diff_files(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.diff_files", args)
}
