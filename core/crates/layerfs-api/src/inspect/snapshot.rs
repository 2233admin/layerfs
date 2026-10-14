//! `inspect.snapshot`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `snapshot({ since? })`: the operator read model; `unchanged` when `since` names its version.
pub fn snapshot(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "inspect.snapshot", args)
}
