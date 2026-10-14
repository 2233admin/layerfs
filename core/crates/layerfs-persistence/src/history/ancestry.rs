//! Bounded ancestry over the history graph: merge base and reachability.
//!
//! A Commit reaches its parent (or, without one, its base Layer) and its
//! second parent; a Layer reaches its parent Layer and the Commit it was
//! published from. Each walk examines at most [`MAXIMUM_LINEAGE_ROWS`] nodes;
//! reaching the bound is `Capacity`, never a guessed answer.

use super::transaction::Transaction;
use layerfs_history::error::{HistoryError, HistoryResult, Missing};
use layerfs_history::identity::NodeId;
use layerfs_history::records::MAXIMUM_LINEAGE_ROWS;
use std::collections::{HashSet, VecDeque};

/// The nodes one node reaches directly, first parent first.
fn parents(tx: &Transaction<'_>, node: NodeId) -> HistoryResult<Vec<NodeId>> {
    match node {
        NodeId::Commit(id) => {
            let record =
                super::commit::commit(tx, id)?.ok_or(HistoryError::Missing(Missing::Commit))?;
            let mut out = vec![match record.parent {
                Some(parent) => NodeId::Commit(parent),
                None => NodeId::Layer(record.base_layer),
            }];
            out.extend(record.second_parent);
            Ok(out)
        }
        NodeId::Layer(id) => {
            let record =
                super::layerstack::layer(tx, id)?.ok_or(HistoryError::Missing(Missing::Layer))?;
            Ok(record
                .parent
                .map(NodeId::Layer)
                .into_iter()
                .chain(record.source_commit.map(NodeId::Commit))
                .collect())
        }
    }
}

/// Breadth-first walk from `start`; `visit` returns true to stop expanding a node.
fn walk(
    tx: &Transaction<'_>,
    start: NodeId,
    mut visit: impl FnMut(NodeId) -> HistoryResult<bool>,
) -> HistoryResult<()> {
    let mut seen = HashSet::from([start]);
    let mut queue = VecDeque::from([start]);
    while let Some(node) = queue.pop_front() {
        if seen.len() as u64 > MAXIMUM_LINEAGE_ROWS {
            return Err(HistoryError::Capacity("lineage work"));
        }
        if visit(node)? {
            continue;
        }
        for parent in parents(tx, node)? {
            if seen.insert(parent) {
                queue.push_back(parent);
            }
        }
    }
    Ok(())
}

/// True when `ancestor` is `descendant` or reachable from it.
pub(crate) fn is_ancestor(
    tx: &Transaction<'_>,
    ancestor: NodeId,
    descendant: NodeId,
) -> HistoryResult<bool> {
    let mut found = false;
    walk(tx, descendant, |node| {
        found |= node == ancestor;
        Ok(found)
    })?;
    Ok(found)
}

/// The newest common ancestor of two nodes.
///
/// Every ancestor of `left` is collected; the walk from `right` stops at each
/// common node it meets. Of those, a node that is an ancestor of another one
/// found is older and dropped; the first remaining in breadth order wins.
pub(crate) fn merge_base(
    tx: &Transaction<'_>,
    left: NodeId,
    right: NodeId,
) -> HistoryResult<Option<NodeId>> {
    let mut reachable = HashSet::new();
    walk(tx, left, |node| {
        reachable.insert(node);
        Ok(false)
    })?;
    let mut common = Vec::new();
    walk(tx, right, |node| {
        let shared = reachable.contains(&node);
        if shared {
            common.push(node);
        }
        Ok(shared)
    })?;
    for (index, candidate) in common.iter().enumerate() {
        let mut older = false;
        for (other_index, other) in common.iter().enumerate() {
            if other_index != index && is_ancestor(tx, *candidate, *other)? {
                older = true;
                break;
            }
        }
        if !older {
            return Ok(Some(*candidate));
        }
    }
    Ok(common.first().copied())
}
