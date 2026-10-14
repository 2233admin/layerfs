//! Arguments, names, identities and refusals shared by the SDK calls.
//!
//! The SDK names a project by its stack name and a Branch by its name; `main`
//! is the stack's line of Layers. Commits and Layers travel as the hex of
//! their identity. Every refusal has a stable code the JavaScript SDK maps to
//! a typed error.
use crate::store::Store;
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::{ContentError, ObjectId};
use layerfs_history::{
    error::Missing, BranchRecord, CommitId, CommitRecord, HistoryError, HistoryName, LayerId,
    LayerRecord, LayerStackRecord, NodeId, Page, MAXIMUM_PAGE_RECORDS,
};
use std::sync::Arc;

/// Pages one name search may read.
const MAXIMUM_NAME_PAGES: usize = 1024;

/// The result of one SDK call.
pub(crate) type Answer = Result<SdkValue, SdkRefusal>;

/// A refusal.
pub(crate) fn refuse(code: &str, message: impl Into<String>, detail: SdkValue) -> SdkRefusal {
    SdkRefusal {
        code: code.to_owned(),
        message: message.into(),
        detail,
    }
}

/// An invalid argument.
pub(crate) fn invalid(message: impl Into<String>) -> SdkRefusal {
    refuse("InvalidInput", message, SdkValue::Null)
}

/// A required text argument.
pub(crate) fn text<'a>(args: &'a SdkValue, name: &str) -> Result<&'a str, SdkRefusal> {
    args.get_text(name)
        .ok_or_else(|| invalid(format!("missing text argument `{name}`")))
}

/// A history failure as a refusal.
pub(crate) fn history(error: HistoryError) -> SdkRefusal {
    let message = error.to_string();
    let code = match error.cause() {
        HistoryError::HeadMoved(_) => "HeadMoved",
        HistoryError::StackMoved { .. } => "HeadMoved",
        HistoryError::Missing(Missing::Branch) => "NoSuchBranch",
        HistoryError::Missing(Missing::Commit) => "NoSuchCommit",
        HistoryError::Missing(_) => "NotFound",
        HistoryError::InvalidInput(_) => "InvalidInput",
        HistoryError::NotInHistory(_) => "NotInHistory",
        HistoryError::Busy => "Busy",
        HistoryError::Capacity(_) => "Capacity",
        HistoryError::UnknownOutcome => "Unknown",
        _ => "Failed",
    };
    refuse(code, message, SdkValue::Null)
}

/// A content failure as a refusal.
pub(crate) fn content(error: ContentError) -> SdkRefusal {
    let code = match error {
        ContentError::BoundedCapacityExceeded { .. } => "Capacity",
        ContentError::ProviderFailure { .. } | ContentError::OutputRejected => "Unknown",
        _ => "Failed",
    };
    refuse(code, error.to_string(), SdkValue::Null)
}

/// Any other failure as a refusal with its own description.
pub(crate) fn failed(error: impl std::fmt::Display) -> SdkRefusal {
    refuse("Failed", error.to_string(), SdkValue::Null)
}

/// Lowercase hex of bytes.
pub(crate) fn hex(bytes: &[u8]) -> String {
    const DIGITS: &[u8; 16] = b"0123456789abcdef";
    bytes
        .iter()
        .flat_map(|byte| {
            [
                DIGITS[usize::from(byte >> 4)],
                DIGITS[usize::from(byte & 15)],
            ]
        })
        .map(char::from)
        .collect()
}

/// Bytes of lowercase or uppercase hex.
pub(crate) fn unhex(text: &str) -> Option<Vec<u8>> {
    if text.len() % 2 != 0 {
        return None;
    }
    (0..text.len())
        .step_by(2)
        .map(|at| u8::from_str_radix(text.get(at..at + 2)?, 16).ok())
        .collect()
}

/// A node's identity as text.
pub(crate) fn node_text(node: NodeId) -> String {
    hex(node.as_slice())
}

/// A short label for marker lines: the first six bytes after the tag.
pub(crate) fn short(node: NodeId) -> String {
    hex(&node.as_slice()[1..7])
}

/// A Commit or Layer named by its identity text.
pub(crate) fn node(text: &str) -> Result<NodeId, SdkRefusal> {
    unhex(text)
        .and_then(|bytes| NodeId::from_slice(&bytes).ok())
        .ok_or_else(|| invalid(format!("`{text}` is not a Commit or Layer identity")))
}

/// A name the history accepts.
pub(crate) fn name(text: &str) -> Result<HistoryName, SdkRefusal> {
    HistoryName::new(text).map_err(|_| invalid(format!("`{text}` is not a valid name")))
}

/// The project's stack, by name.
pub(crate) fn project(store: &Arc<Store>, args: &SdkValue) -> Result<LayerStackRecord, SdkRefusal> {
    let wanted = text(args, "project")?;
    let mut page = Page {
        cursor: None,
        limit: MAXIMUM_PAGE_RECORDS,
    };
    for _ in 0..MAXIMUM_NAME_PAGES {
        let found = store.history().layer_stacks(&page).map_err(history)?;
        if let Some(stack) = found
            .records
            .into_iter()
            .find(|s| s.name.as_str() == wanted)
        {
            return Ok(stack);
        }
        match found.continuation {
            Some(cursor) => page.cursor = Some(cursor),
            None => break,
        }
    }
    Err(refuse(
        "NoSuchProject",
        format!("project {wanted} does not exist"),
        SdkValue::Null,
    ))
}

/// Every Branch of a stack, in name order.
pub(crate) fn branches(
    store: &Arc<Store>,
    stack: &LayerStackRecord,
) -> Result<Vec<BranchRecord>, SdkRefusal> {
    let mut page = Page {
        cursor: None,
        limit: MAXIMUM_PAGE_RECORDS,
    };
    let mut out = Vec::new();
    for _ in 0..MAXIMUM_NAME_PAGES {
        let found = store.history().branches(stack.id, &page).map_err(history)?;
        out.extend(found.records);
        match found.continuation {
            Some(cursor) => page.cursor = Some(cursor),
            None => return Ok(out),
        }
    }
    Err(refuse("Capacity", "too many Branches", SdkValue::Null))
}

/// One Branch by name.
pub(crate) fn branch(
    store: &Arc<Store>,
    stack: &LayerStackRecord,
    wanted: &str,
) -> Result<BranchRecord, SdkRefusal> {
    branches(store, stack)?
        .into_iter()
        .find(|branch| branch.name.as_str() == wanted)
        .ok_or_else(|| {
            refuse(
                "NoSuchBranch",
                format!("Branch {wanted} does not exist"),
                SdkValue::map([("branch", SdkValue::text(wanted))]),
            )
        })
}

/// A Branch's newest node: its head Commit, else its base Layer.
pub(crate) fn branch_node(branch: &BranchRecord) -> NodeId {
    branch
        .head_commit
        .map_or(NodeId::Layer(branch.base_layer), NodeId::Commit)
}

/// One Commit.
pub(crate) fn commit(store: &Arc<Store>, id: CommitId) -> Result<CommitRecord, SdkRefusal> {
    store.history().commit(id).map_err(history)?.ok_or_else(|| {
        refuse(
            "NoSuchCommit",
            format!("Commit {id} does not exist"),
            SdkValue::Null,
        )
    })
}

/// One Layer.
pub(crate) fn layer(store: &Arc<Store>, id: LayerId) -> Result<LayerRecord, SdkRefusal> {
    store.history().layer(id).map_err(history)?.ok_or_else(|| {
        refuse(
            "NotFound",
            format!("Layer {id} does not exist"),
            SdkValue::Null,
        )
    })
}

/// The root a node records.
pub(crate) fn root(store: &Arc<Store>, node: NodeId) -> Result<ObjectId, SdkRefusal> {
    Ok(match node {
        NodeId::Commit(id) => commit(store, id)?.root,
        NodeId::Layer(id) => layer(store, id)?.root,
    })
}

/// A Commit as the SDK shows it.
pub(crate) fn commit_value(record: &CommitRecord, branch: Option<&str>) -> SdkValue {
    let meta = &record.meta;
    SdkValue::map([
        ("id", SdkValue::text(hex(record.id.as_slice()))),
        ("branch", SdkValue::opt_text(branch)),
        (
            "parent",
            SdkValue::opt_text(record.parent.map(|id| hex(id.as_slice()))),
        ),
        (
            "secondParent",
            SdkValue::opt_text(record.second_parent.map(node_text)),
        ),
        ("base", SdkValue::text(hex(record.base_layer.as_slice()))),
        ("root", SdkValue::text(hex(record.root.as_bytes()))),
        (
            "via",
            SdkValue::text(match meta.via {
                layerfs_history::CommitVia::Workspace => "exec",
                layerfs_history::CommitVia::Files => "fs",
                layerfs_history::CommitVia::Merge => "merge",
            }),
        ),
        ("agent", SdkValue::opt_text(meta.agent.clone())),
        ("call", SdkValue::opt_text(meta.call.clone())),
        (
            "mergedFrom",
            SdkValue::opt_text(meta.merged_from.map(|id| hex(id.as_slice()))),
        ),
        ("time", SdkValue::Int(meta.time_ms)),
    ])
}

/// A Layer as the SDK shows it.
pub(crate) fn layer_value(record: &LayerRecord, source_branch: Option<&str>) -> SdkValue {
    SdkValue::map([
        ("id", SdkValue::text(hex(record.id.as_slice()))),
        (
            "parent",
            SdkValue::opt_text(record.parent.map(|id| hex(id.as_slice()))),
        ),
        ("root", SdkValue::text(hex(record.root.as_bytes()))),
        ("sourceBranch", SdkValue::opt_text(source_branch)),
        (
            "sourceCommit",
            SdkValue::opt_text(record.source_commit.map(|id| hex(id.as_slice()))),
        ),
    ])
}
