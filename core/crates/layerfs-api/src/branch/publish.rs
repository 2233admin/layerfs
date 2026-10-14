//! `branch.publish`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `publish({ branch, commit? })`: one new main Layer holding the Branch head, reporting the Layers it overwrote.
pub fn publish(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "branch.publish", args)
}
