//! `branch.merge`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `merge(a, b, { name })`: a new Branch from two, fast-forward or one merge Commit; a conflict creates nothing.
pub fn merge(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "branch.merge", args)
}
