//! `fs.write`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `write(path, content, { branch })`: one Commit writing a file.
pub fn write(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.write", args)
}
