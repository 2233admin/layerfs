//! Atomic filesystem calls over a private, indexed Workspace. One capture and
//! canonical construction publishes the whole change list; validation failures
//! close only that private overlay. Uncertain ownership remains in the registry.
use super::{
    args::{self, text, Answer},
    mutation::Mutation,
};
use crate::control::Service;
use layerfs_bridge::control::{Reply, SdkValue, UnmountControl};
use layerfs_history::{CommitOutcome, CommitVia, WorkspaceId};

pub(crate) fn path(value: &str) -> Result<String, layerfs_bridge::control::SdkRefusal> {
    if value.len() > 4096
        || value.as_bytes().contains(&0)
        || !(value == "/"
            || (value.starts_with('/')
                && !value.ends_with('/')
                && value[1..]
                    .split('/')
                    .all(|s| !s.is_empty() && s != "." && s != "..")))
    {
        return Err(args::invalid(
            "expected an absolute path without empty, dot or parent components",
        ));
    }
    Ok(value.to_owned())
}
pub(crate) fn single(
    service: &Service,
    kind: &str,
    args: &SdkValue,
    bodies: &mut super::Bodies<'_>,
) -> Answer {
    let mut fields = match args.clone() {
        SdkValue::Map(v) => v,
        _ => Vec::new(),
    };
    fields.push(("op".into(), SdkValue::text(kind)));
    commit(service, args, &[SdkValue::Map(fields)], bodies)
}
pub(crate) fn apply(service: &Service, args: &SdkValue, bodies: &mut super::Bodies<'_>) -> Answer {
    let Some(SdkValue::List(changes)) = args.get("changes") else {
        return Err(args::invalid("apply requires a changes array"));
    };
    commit(service, args, changes, bodies)
}
fn commit(
    service: &Service,
    args: &SdkValue,
    changes: &[SdkValue],
    bodies: &mut super::Bodies<'_>,
) -> Answer {
    let store = &service.store;
    let stack = args::project(store, args)?;
    let branch_name = text(args, "branch")?;
    if branch_name == "main" {
        return Err(args::refuse(
            "ReadOnly",
            "main changes only through publish",
            SdkValue::Null,
        ));
    }
    let branch = args::branch(store, &stack, branch_name)?;
    let id = WorkspaceId::from_authority(
        layerfs_bridge::duplex::generate_keypair()
            .map_err(args::failed)?
            .public,
    )
    .map_err(args::history)?;
    let bound =
        crate::telemetry::timed("files.bind", |timing| service.mount(id, branch.id, timing))
            .map_err(|e| args::failed(format!("{e:?}")))?;
    let Reply::Bound { token, .. } = bound.reply else {
        return Err(args::failed("private binding reply"));
    };
    let workspace = service
        .files_workspace(token)
        .map_err(|e| args::failed(format!("{e:?}")))?;
    let mut mutation = Mutation::new(&workspace)?;
    let mut result = Ok(());
    for (index, change) in changes.iter().enumerate() {
        result = (|| {
            let kind = text(change, "op")?;
            let p = |key| path(text(change, key)?);
            match kind {
                "write" => {
                    let bytes = match (
                        change.get("content"),
                        change.get("bytes"),
                        change.get("streamed"),
                    ) {
                        (Some(SdkValue::Text(s)), None, None) => s.as_bytes(),
                        (None, Some(SdkValue::Bytes(b)), None) => b.as_slice(),
                        (None, None, Some(SdkValue::Int(n))) if *n > 0 => {
                            return mutation.write_streamed(&p("path")?, *n as u64, bodies)
                        }
                        _ => return Err(args::invalid("write content must be text or bytes")),
                    };
                    mutation.write(&p("path")?, bytes)
                }
                "edit" => mutation.edit(
                    &p("path")?,
                    text(change, "oldText")?,
                    text(change, "newText")?,
                ),
                "mkdir" => mutation.mkdir(&p("path")?),
                "rm" => mutation.remove(&p("path")?),
                "cp" => mutation.copy(&p("from")?, &p("to")?, index as u64),
                "mv" => mutation.rename(&p("from")?, &p("to")?),
                _ => Err(args::invalid(format!("unknown change op {kind}"))),
            }
        })()
        .map_err(|mut e| {
            if let SdkValue::Map(fields) = &mut e.detail {
                fields.push(("index".into(), SdkValue::Int(index as i64)));
            } else {
                e.detail = SdkValue::map([("index", SdkValue::Int(index as i64))]);
            }
            e
        });
        if result.is_err() {
            break;
        }
    }
    if result.as_ref().is_err_and(|e| e.code == "Unknown") {
        return result.map(|()| SdkValue::Null);
    }
    mutation.finish()?;
    if let Err(error) = result {
        service
            .unmount(UnmountControl {
                token,
                discard: true,
            })
            .map_err(|e| args::failed(format!("{e:?}")))?;
        return Err(error);
    }
    let outcome = workspace.commit_captured_via(
        &crate::store::CommitOptions {
            force: false,
            message: Some(
                args.get_text("message")
                    .unwrap_or("Apply filesystem changes")
                    .to_owned(),
            ),
        },
        CommitVia::Files,
    );
    let outcome = match outcome {
        Ok(outcome) => outcome,
        Err(failure) => {
            if failure.locally_settled
                && failure.local_error.is_none()
                && failure
                    .namespace
                    .as_ref()
                    .is_none_or(|held| !held.retained())
            {
                let code = match &failure.error {
                    crate::store::CommitError::History(
                        layerfs_history::HistoryError::HeadMoved(_),
                    ) => "HeadMoved",
                    crate::store::CommitError::History(layerfs_history::HistoryError::Busy) => {
                        "Busy"
                    }
                    _ => "Failed",
                };
                let refusal = args::refuse(code, failure.to_string(), SdkValue::Null);
                service
                    .unmount(UnmountControl {
                        token,
                        discard: true,
                    })
                    .map_err(|e| args::failed(format!("{e:?}")))?;
                return Err(refusal);
            }
            return Err(service.retain_files_failure(token, failure));
        }
    };
    service
        .unmount(UnmountControl {
            token,
            discard: true,
        })
        .map_err(|e| args::failed(format!("{e:?}")))?;
    // The Branch moved since the private binding and changed a path this call
    // changed too: nothing was published, as for a Workspace Commit.
    let Some(history) = outcome.history else {
        let merge = outcome.merge.as_ref();
        let paths = merge.map_or_else(Vec::new, |m| {
            m.conflicts
                .iter()
                .map(|c| SdkValue::text(c.path.clone()))
                .collect()
        });
        return Err(args::refuse(
            "Conflict",
            format!(
                "the head moved and {} path(s) conflict with this call; nothing was committed",
                paths.len()
            ),
            SdkValue::map([
                ("branch", SdkValue::text(branch_name)),
                (
                    "head",
                    SdkValue::opt_text(
                        merge
                            .and_then(|m| m.head)
                            .map(|id| args::hex(id.as_slice())),
                    ),
                ),
                ("conflicts", SdkValue::List(paths)),
            ]),
        ));
    };
    Ok(match history {
        CommitOutcome::Committed { record, .. } => SdkValue::map([
            ("kind", SdkValue::text("Committed")),
            ("branch", SdkValue::text(branch_name)),
            ("head", SdkValue::text(args::hex(record.id.as_slice()))),
            ("commit", args::commit_value(&record, Some(branch_name))),
        ]),
        CommitOutcome::UpToDate { head, root } => SdkValue::map([
            ("kind", SdkValue::text("UpToDate")),
            ("branch", SdkValue::text(branch_name)),
            (
                "head",
                SdkValue::opt_text(head.map(|id| args::hex(id.as_slice()))),
            ),
            ("root", SdkValue::text(args::hex(root.as_bytes()))),
        ]),
    })
}
