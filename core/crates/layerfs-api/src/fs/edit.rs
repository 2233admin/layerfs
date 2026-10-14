//! `fs.edit`.
use crate::base::sdk::{call, SdkResult};
use crate::internal::Control;
use layerfs_bridge::control::SdkValue;

/// `edit(path, { oldText, newText, all? }, { branch })`: one Commit replacing text in a file.
pub fn edit(control: &mut Control, args: SdkValue) -> SdkResult {
    call(control, "fs.edit", args)
}
