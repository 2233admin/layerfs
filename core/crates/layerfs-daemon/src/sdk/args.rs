//! Arguments, names, identities and refusals shared by the SDK calls.
//!
//! The SDK names a project by its stack name and a Branch by its name; `main`
//! is the stack's line of Layers. Commits and Layers travel as the hex of
//! their identity. Every refusal has a stable code the JavaScript SDK maps to
//! a typed error.
use crate::store::{PortError, Store};
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::{ContentError, ObjectId};
use layerfs_history::{
    error::Missing, BranchRecord, CommitId, CommitRecord, HistoryError, HistoryName, LayerId,
    LayerRecord, LayerStackRecord, NodeId,
};
use std::sync::Arc;

pub(crate) use layerfs_bridge::sdk_values::{
    commit_value, hex, layer_value, node_text, short, unhex,
};

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

/// A failed published-history lookup: its history error, else the reader's.
fn published(error: Arc<PortError>) -> SdkRefusal {
    match error.as_ref() {
        PortError::History(error) => history(error.clone()),
        other => refuse("Unknown", other.to_string(), SdkValue::Null),
    }
}

/// Any other failure as a refusal with its own description.
pub(crate) fn failed(error: impl std::fmt::Display) -> SdkRefusal {
    refuse("Failed", error.to_string(), SdkValue::Null)
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
    let found = match HistoryName::new(wanted) {
        Ok(name) => store
            .published(|h| h.layer_stack_named(&name))
            .map_err(published)?,
        Err(_) => None,
    };
    found.ok_or_else(|| {
        refuse(
            "NoSuchProject",
            format!("project {wanted} does not exist"),
            SdkValue::Null,
        )
    })
}

/// One Branch by name, through the stack's name index.
pub(crate) fn branch(
    store: &Arc<Store>,
    stack: &LayerStackRecord,
    wanted: &str,
) -> Result<BranchRecord, SdkRefusal> {
    let found = match HistoryName::new(wanted) {
        Ok(name) if wanted != super::branch::MAIN => store
            .published(|h| h.branch_named(stack.id, &name))
            .map_err(published)?,
        _ => None,
    };
    found.ok_or_else(|| {
        refuse(
            "NoSuchBranch",
            format!("Branch {wanted} does not exist"),
            SdkValue::Null,
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
    store
        .published(|h| h.commit(id))
        .map_err(published)?
        .ok_or_else(|| {
            refuse(
                "NoSuchCommit",
                format!("Commit {id} does not exist"),
                SdkValue::Null,
            )
        })
}

/// One Layer.
pub(crate) fn layer(store: &Arc<Store>, id: LayerId) -> Result<LayerRecord, SdkRefusal> {
    store
        .published(|h| h.layer(id))
        .map_err(published)?
        .ok_or_else(|| {
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

/// Safe numeric page arguments. Offset skipping is linear and uses bounded windows.
pub(crate) fn paging(value: &SdkValue) -> Result<(usize, u64), SdkRefusal> {
    let integer = |name: &str, default: i64| -> Result<i64, SdkRefusal> {
        match value.get(name) {
            None => Ok(default),
            Some(SdkValue::Int(n)) if *n >= 0 && *n <= 9_007_199_254_740_991 => Ok(*n),
            _ => Err(invalid(format!(
                "{name} must be a nonnegative safe integer"
            ))),
        }
    };
    let size = integer("pageSize", 50)?;
    if !(1..=1000).contains(&size) {
        return Err(invalid("pageSize must be in 1..=1000"));
    }
    Ok((size as usize, integer("pagePos", 0)? as u64))
}

pub(crate) fn next_page(pos: u64, count: usize, more: bool) -> SdkValue {
    if more {
        SdkValue::Int((pos + count as u64) as i64)
    } else {
        SdkValue::Null
    }
}
