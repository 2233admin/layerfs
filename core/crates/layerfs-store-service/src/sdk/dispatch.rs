//! The public Store-call table. Operator names are absent from this table.
use super::{args, blame, branch, compare, files, reads};
use crate::StoreService;
use layerfs_bridge::control::{SdkCall, SdkRefusal, SdkValue};

/// Runs one SDK call once.
pub fn dispatch(
    service: &StoreService,
    call: &SdkCall,
    bodies: &mut super::Bodies<'_>,
) -> Result<SdkValue, SdkRefusal> {
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
        "project.list_overwritten" => branch::list_overwritten(store, args),
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
        "fs.write" => files::single(service, "write", args, bodies),
        "fs.edit" => files::single(service, "edit", args, bodies),
        "fs.mkdir" => files::single(service, "mkdir", args, bodies),
        "fs.rm" => files::single(service, "rm", args, bodies),
        "fs.cp" => files::single(service, "cp", args, bodies),
        "fs.mv" => files::single(service, "mv", args, bodies),
        "fs.apply" => files::apply(service, args, bodies),
        other => Err(args::refuse(
            "UnknownMethod",
            format!("no Store method {other}"),
            SdkValue::Null,
        )),
    }
}
