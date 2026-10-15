//! Public daemon SDK dispatch. Operator names are absent from this table.
use super::{args, blame, branch, compare, files, reads};
use crate::control::Service;
use layerfs_bridge::control::{SdkCall, SdkRefusal, SdkValue};

/// Runs one SDK call once.
pub(crate) fn dispatch(service: &Service, call: &SdkCall) -> Result<SdkValue, SdkRefusal> {
    let store = &service.store;
    let args = &call.args;
    if let Some(value) = args.get("message") {
        if !matches!(value, SdkValue::Null) {
            let SdkValue::Text(message) = value else {
                return Err(args::invalid("message must be text"));
            };
            let mut meta = layerfs_history::CommitMeta::new(layerfs_history::CommitVia::Files);
            meta.message = Some(message.clone());
            meta.check().map_err(|e| args::invalid(e.to_string()))?;
        }
    }
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
        "fs.write" => files::single(service, "write", args),
        "fs.edit" => files::single(service, "edit", args),
        "fs.mkdir" => files::single(service, "mkdir", args),
        "fs.rm" => files::single(service, "rm", args),
        "fs.cp" => files::single(service, "cp", args),
        "fs.mv" => files::single(service, "mv", args),
        "fs.apply" => files::apply(service, args),
        other => Err(args::refuse(
            "UnknownMethod",
            format!("the daemon has no SDK method {other}"),
            SdkValue::Null,
        )),
    }
}
