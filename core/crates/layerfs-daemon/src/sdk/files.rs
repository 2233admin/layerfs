//! Direct Branch writes: each call is one Commit (`via: fs`) on the Branch.
//!
//! The change list is applied to the Branch head's root in one Save through
//! Content's path changes and the canonical filesystem update, then published
//! against that head. One attempt: a head that moved meanwhile is `HeadMoved`.
//! An invalid change refuses the whole call and the unfinished Save is dropped.
//! `main` changes only by publishing a Branch.
use super::args::{self, history, invalid, refuse, text, Answer};
use crate::store::Store;
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::paths::{apply_paths, PathOp, PathsInput};
use layerfs_history::{CommitMeta, CommitOutcome, CommitRequest, CommitVia};
use layerfs_telemetry::timer::Timing;
use layerfs_workspace::InodeSerials;
use std::sync::Arc;

/// Serials one write reservation takes.
const WRITE_SERIALS: u64 = 64;

/// A checked absolute path: no empty, `.` or `..` name, no trailing slash.
pub(crate) fn path(text: &str) -> Result<String, SdkRefusal> {
    let valid = text == "/"
        || (text.starts_with('/')
            && !text.ends_with('/')
            && text[1..]
                .split('/')
                .all(|name| !name.is_empty() && name != "." && name != ".."));
    if valid {
        Ok(text.to_owned())
    } else {
        Err(invalid(format!("`{text}` is not an absolute path")))
    }
}

fn arg_path(value: &SdkValue, name: &str) -> Result<String, SdkRefusal> {
    path(text(value, name)?)
}

/// One change from its SDK form.
fn op(kind: &str, value: &SdkValue) -> Result<PathOp, SdkRefusal> {
    Ok(match kind {
        "write" => PathOp::Write {
            path: arg_path(value, "path")?,
            bytes: match (value.get("content"), value.get("bytes")) {
                (Some(SdkValue::Text(text)), _) => text.clone().into_bytes(),
                (_, Some(SdkValue::Bytes(bytes))) => bytes.clone(),
                _ => return Err(invalid("write needs `content` text or `bytes`")),
            },
        },
        "edit" => PathOp::Edit {
            path: arg_path(value, "path")?,
            old: text(value, "oldText")?.to_owned(),
            new: text(value, "newText")?.to_owned(),
            all: value.get_bool("all"),
        },
        "mkdir" => PathOp::Mkdir {
            path: arg_path(value, "path")?,
            recursive: value.get_bool("recursive"),
        },
        "remove" => PathOp::Remove {
            path: arg_path(value, "path")?,
            recursive: value.get_bool("recursive"),
        },
        "cp" => PathOp::Copy {
            from: arg_path(value, "from")?,
            to: arg_path(value, "to")?,
            recursive: value.get_bool("recursive"),
        },
        "mv" => PathOp::Move {
            from: arg_path(value, "from")?,
            to: arg_path(value, "to")?,
        },
        other => return Err(invalid(format!("unknown change kind `{other}`"))),
    })
}

/// `fs.write`, `fs.edit`, `fs.mkdir`, `fs.remove`, `fs.cp` and `fs.mv`: the
/// arguments are the change itself.
pub(crate) fn single(store: &Arc<Store>, kind: &str, args: &SdkValue) -> Answer {
    commit(store, args, vec![op(kind, args)?])
}

/// `fs.apply({ changes })`: one Commit for every change.
pub(crate) fn apply(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let Some(SdkValue::List(changes)) = args.get("changes") else {
        return Err(invalid("apply needs a `changes` list"));
    };
    let ops = changes
        .iter()
        .map(|change| op(text(change, "kind")?, change))
        .collect::<Result<Vec<_>, _>>()?;
    commit(store, args, ops)
}

fn commit(store: &Arc<Store>, args: &SdkValue, ops: Vec<PathOp>) -> Answer {
    let stack = args::project(store, args)?;
    let name = text(args, "branch")?;
    if name == super::branch::MAIN {
        return Err(refuse(
            "ReadOnly",
            "main changes only by publishing a Branch",
            SdkValue::Null,
        ));
    }
    let branch = args::branch(store, &stack, name)?;
    let snapshot = store
        .history()
        .branch_snapshot(branch.id)
        .map_err(history)?
        .ok_or_else(|| {
            refuse(
                "NoSuchBranch",
                format!("Branch {name} does not exist"),
                SdkValue::Null,
            )
        })?;
    let storage = store.producer().map_err(args::failed)?;
    let save = storage.begin_save().map_err(args::failed)?;
    let ports = store.ports(stack.scope);
    let mut range = (0u64, 0u64);
    let mut fresh = || {
        if range.0 == range.1 {
            let (start, count) = ports.reserve(WRITE_SERIALS).map_err(|_| {
                layerfs_content::ContentError::ResourceUnavailable {
                    what: "write inode serials",
                }
            })?;
            range = (start, start.saturating_add(count));
        }
        range.0 += 1;
        Ok(range.0 - 1)
    };
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    let policy = store.policy().construction();
    let capacities = policy.capacities();
    let input = PathsInput {
        root: layerfs_content::filesystem::FilesystemRootId(snapshot.effective_root),
        ops: &ops,
        policy,
        capacities: &capacities,
        time: (
            i64::try_from(now.as_secs()).unwrap_or(i64::MAX),
            now.subsec_nanos(),
        ),
    };
    let (built, _) = Timing::disabled("fs.write", |timing| {
        apply_paths(&save, &mut save.sink(), &input, &mut fresh, timing)
    });
    let candidate = match built.map_err(args::content)? {
        Ok(root) => root,
        Err(refused) => {
            drop(save);
            return Err(refuse(
                refused.code,
                format!("{}: {}", refused.code, refused.path),
                SdkValue::map([
                    ("path", SdkValue::text(refused.path)),
                    (
                        "matches",
                        refused
                            .matches
                            .map_or(SdkValue::Null, |n| SdkValue::Int(n as i64)),
                    ),
                ]),
            ));
        }
    };
    save.finish().map_err(args::failed)?;
    let outcome = store
        .history()
        .commit_branch(&CommitRequest {
            branch: branch.id,
            expected_head: snapshot.branch.head_commit,
            expected_base: snapshot.branch.base_layer,
            expected_root: snapshot.effective_root,
            candidate_root: candidate.0,
            profile: snapshot.profile,
            scope: snapshot.scope,
            second_parent: None,
            meta: CommitMeta {
                agent: args.get_text("agent").map(str::to_owned),
                call: args.get_text("call").map(str::to_owned),
                ..CommitMeta::new(CommitVia::Files)
            },
            force: false,
        })
        .map_err(history)?;
    Ok(match outcome {
        CommitOutcome::Committed { record, .. } => SdkValue::map([
            ("kind", SdkValue::text("Committed")),
            ("branch", SdkValue::text(name)),
            ("head", SdkValue::text(args::hex(record.id.as_slice()))),
            ("commit", args::commit_value(&record, Some(name))),
        ]),
        CommitOutcome::UpToDate { head, root } => SdkValue::map([
            ("kind", SdkValue::text("UpToDate")),
            ("branch", SdkValue::text(name)),
            (
                "head",
                SdkValue::opt_text(head.map(|id| args::hex(id.as_slice()))),
            ),
            ("root", SdkValue::text(args::hex(root.as_bytes()))),
        ]),
    })
}
