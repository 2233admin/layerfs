//! The SDK call channel: one daemon function per JavaScript method that is
//! not a Workspace control operation.
//!
//! Entry module: declarations and the method table.
mod args;
mod blame;
mod branch;
mod compare;
mod files;
mod inspect;
mod reads;
mod snapshot;

pub(crate) use args::hex;
pub(crate) use inspect::{snapshot as inspect, WorkspaceView};

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
        "branch.diff_commits" => compare::diff_commits(store, args),
        "branch.diff_branches" => compare::diff_branches(store, args),
        "fs.read" => reads::read(store, args),
        "fs.list" => reads::list(store, args),
        "fs.stat" => reads::stat(store, args),
        "fs.grep" => reads::grep(store, args),
        "fs.glob" => reads::glob(store, args),
        "fs.diff_files" => compare::diff_files(store, args),
        "fs.blame" => blame::blame(store, args),
        "fs.write" => files::single(store, "write", args),
        "fs.edit" => files::single(store, "edit", args),
        "fs.mkdir" => files::single(store, "mkdir", args),
        "fs.remove" => files::single(store, "remove", args),
        "fs.cp" => files::single(store, "cp", args),
        "fs.mv" => files::single(store, "mv", args),
        "fs.apply" => files::apply(store, args),
        other => Err(args::refuse(
            "UnknownMethod",
            format!("the daemon has no SDK method {other}"),
            SdkValue::Null,
        )),
    }
}
