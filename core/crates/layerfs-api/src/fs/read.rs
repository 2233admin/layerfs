//! `fs.read`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `read(path, { branch, commit?, offset? })`: one window of a file at a Branch, Commit or Layer.
pub fn read(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.read", args)
}
