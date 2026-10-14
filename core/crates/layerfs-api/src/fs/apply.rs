//! `fs.apply`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `apply(changes[], { branch })`: one Commit for every change.
pub fn apply(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.apply", args)
}
