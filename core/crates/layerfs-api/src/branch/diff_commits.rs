//! `branch.diff_commits`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `diff_commits({ from, to })`: path-level changes between two Commits.
pub fn diff_commits(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "branch.diff_commits", args)
}
