//! `fs.mv`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `mv(from, to, { branch })`: one Commit moving a path.
pub fn mv(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.mv", args)
}
