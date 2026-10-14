//! `fs.glob`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `glob(pattern, { branch, path?, cursor? })`: paths matching a `/.lww`-syntax pattern.
pub fn glob(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.glob", args)
}
