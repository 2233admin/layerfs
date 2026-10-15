//! Internal snapshot method.
use crate::{internal::Control, SdkResult};
use layerfs_bridge::control::SdkValue;

/// Reads the operator model once on its dedicated method table.
pub fn snapshot(control: &mut Control, args: SdkValue) -> SdkResult {
    super::super::call(control, "operator.inspect.snapshot", args)
}
