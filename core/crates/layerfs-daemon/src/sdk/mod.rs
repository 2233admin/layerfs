//! The SDK call channel: one daemon function per JavaScript method that is
//! not a Workspace control operation.
//!
//! Entry module: declarations and the method table.
mod args;
mod branch;
pub(crate) mod values;

use crate::store::Store;
use layerfs_bridge::control::{SdkCall, SdkRefusal, SdkValue};
use std::sync::Arc;

/// Runs one SDK call once.
pub(crate) fn dispatch(store: &Arc<Store>, call: &SdkCall) -> Result<SdkValue, SdkRefusal> {
    let args = &call.args;
    match call.method.as_str() {
        "project.list_branches" => branch::list(store, args),
        "branch.fork" => branch::fork(store, args),
        "branch.list_commits" => branch::list_commits(store, args),
        "branch.merge" => branch::merge(store, args),
        "branch.publish" => branch::publish(store, args),
        other => Err(args::refuse(
            "UnknownMethod",
            format!("the daemon has no SDK method {other}"),
            SdkValue::Null,
        )),
    }
}
