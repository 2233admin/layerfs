//! `branch.diff_branches`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `diff_branches({ from, to })`: path-level changes between two Branches or main.
pub fn diff_branches(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "branch.diff_branches", args)
}
