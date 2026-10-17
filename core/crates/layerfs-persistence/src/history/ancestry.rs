//! Ancestry over the history graph: merge base and reachability.
//!
//! A Commit reaches its parent (or, without one, its base Layer) and its
//! second parent; a Layer reaches its parent Layer and the Commit it was
//! published from. A stack's Layers form one chain (each has at most one
//! child), so an older Layer's ancestry is part of a newer one's.
//!
//! The walks therefore stop at Layers. A node's ancestry is its *local*
//! Commits, reached without passing a Layer, plus the ancestry of the newest
//! Layer it reaches; and a Layer's ancestry, restricted to the Layers above an
//! older one, is those Layers plus the local Commits of the Commits they were
//! published from. Work follows the Commits made since the Layers involved,
//! never the whole history. Each walk examines at most
//! [`MAXIMUM_LINEAGE_ROWS`] nodes; reaching the bound is `Capacity`, never a
//! guessed answer.

use super::transaction::Transaction;
use layerfs_history::error::{HistoryError, HistoryResult, Missing};
use layerfs_history::identity::{CommitId, LayerId, NodeId};
use layerfs_history::records::MAXIMUM_LINEAGE_ROWS;
use std::collections::{HashMap, HashSet, VecDeque};

fn capacity(examined: usize) -> HistoryResult<()> {
    if examined as u64 > MAXIMUM_LINEAGE_ROWS {
        return Err(HistoryError::Capacity("lineage work"));
    }
    Ok(())
}

fn layer_record(tx: &Transaction<'_>, id: LayerId) -> HistoryResult<layerfs_history::LayerRecord> {
    super::layerstack::layer(tx, id)?.ok_or(HistoryError::Missing(Missing::Layer))
}

/// A Commit's direct parents, first parent first.
fn commit_parents(tx: &Transaction<'_>, id: CommitId) -> HistoryResult<Vec<NodeId>> {
    let record = super::commit::commit(tx, id)?.ok_or(HistoryError::Missing(Missing::Commit))?;
    let mut out = vec![match record.parent {
        Some(parent) => NodeId::Commit(parent),
        None => NodeId::Layer(record.base_layer),
    }];
    out.extend(record.second_parent);
    Ok(out)
}

/// The Commits one node reaches without passing a Layer, with their parents.
struct Local {
    /// Commits in breadth-first order from the start.
    order: Vec<CommitId>,
    /// Each Commit's parents.
    parents: HashMap<CommitId, Vec<NodeId>>,
    /// The newest Layer reached; a Layer start is its own.
    newest: Option<LayerId>,
}

impl Local {
    fn walk(tx: &Transaction<'_>, start: NodeId) -> HistoryResult<Self> {
        let mut local = Self {
            order: Vec::new(),
            parents: HashMap::new(),
            newest: None,
        };
        let mut layers = Vec::new();
        let mut queue = VecDeque::new();
        match start {
            NodeId::Layer(layer) => layers.push(layer),
            NodeId::Commit(commit) => queue.push_back(commit),
        }
        let mut seen: HashSet<CommitId> = queue.iter().copied().collect();
        while let Some(commit) = queue.pop_front() {
            capacity(seen.len())?;
            let parents = commit_parents(tx, commit)?;
            for parent in &parents {
                match *parent {
                    NodeId::Commit(id) if seen.insert(id) => queue.push_back(id),
                    NodeId::Commit(_) => {}
                    NodeId::Layer(id) => layers.push(id),
                }
            }
            local.order.push(commit);
            local.parents.insert(commit, parents);
        }
        for layer in layers {
            local.newest = Some(match local.newest {
                Some(newest) if older_or_same(tx, layer, newest)? => newest,
                _ => layer,
            });
        }
        Ok(local)
    }
}

/// True when Layer `a` is `b` or below it in the stack's chain. The two
/// chains are walked down in turn, so the work follows their distance.
fn older_or_same(tx: &Transaction<'_>, a: LayerId, b: LayerId) -> HistoryResult<bool> {
    let (mut from_b, mut from_a) = (Some(b), Some(a));
    let mut steps = 0usize;
    loop {
        let Some(x) = from_b else {
            return Ok(false);
        };
        if x == a {
            return Ok(true);
        }
        steps += 1;
        capacity(steps)?;
        from_b = layer_record(tx, x)?.parent;
        if let Some(y) = from_a {
            if y == b {
                return Ok(false);
            }
            from_a = layer_record(tx, y)?.parent;
        }
    }
}

/// The Layers above `older`, newest first, down from `newer`.
fn layers_between(
    tx: &Transaction<'_>,
    newer: LayerId,
    older: LayerId,
) -> HistoryResult<Vec<layerfs_history::LayerRecord>> {
    let mut out = Vec::new();
    let mut current = Some(newer);
    while let Some(id) = current.filter(|id| *id != older) {
        capacity(out.len())?;
        let record = layer_record(tx, id)?;
        current = record.parent;
        out.push(record);
    }
    Ok(out)
}

/// True when `commit`, whose own newest Layer is `own`, is in `top`'s
/// ancestry: one Layer above `own`, up to `top`, was published from a Commit
/// whose local Commits include it.
fn published_below(
    tx: &Transaction<'_>,
    commit: CommitId,
    own: LayerId,
    top: LayerId,
) -> HistoryResult<bool> {
    if own == top || !older_or_same(tx, own, top)? {
        return Ok(false);
    }
    for layer in layers_between(tx, top, own)? {
        if let Some(source) = layer.source_commit {
            if Local::walk(tx, NodeId::Commit(source))?
                .parents
                .contains_key(&commit)
            {
                return Ok(true);
            }
        }
    }
    Ok(false)
}

/// True when `ancestor` is `descendant` or reachable from it.
pub(crate) fn is_ancestor(
    tx: &Transaction<'_>,
    ancestor: NodeId,
    descendant: NodeId,
) -> HistoryResult<bool> {
    if ancestor == descendant {
        return Ok(true);
    }
    let local = Local::walk(tx, descendant)?;
    let Some(top) = local.newest else {
        return Ok(false);
    };
    match ancestor {
        NodeId::Layer(layer) => older_or_same(tx, layer, top),
        NodeId::Commit(commit) if local.parents.contains_key(&commit) => Ok(true),
        NodeId::Commit(commit) => match Local::walk(tx, ancestor)?.newest {
            Some(own) => published_below(tx, commit, own, top),
            None => Ok(false),
        },
    }
}

/// The part of the graph a merge base can come from: both sides' local
/// Commits, and the Layers between the two sides' newest Layers with the local
/// Commits those were published from. The older newest Layer is the floor:
/// it and every Layer below it are kept without their parents, since all of
/// their ancestry is the floor's, and anything in it other than the floor is
/// older than a common ancestor.
struct Region {
    parents: HashMap<NodeId, Vec<NodeId>>,
    floor: Option<LayerId>,
}

impl Region {
    fn build(tx: &Transaction<'_>, sides: [&Local; 2]) -> HistoryResult<Self> {
        let mut region = Self {
            parents: HashMap::new(),
            floor: None,
        };
        let mut locals = Vec::new();
        let mut between = Vec::new();
        if let [Some(l), Some(r)] = [sides[0].newest, sides[1].newest] {
            let order = if older_or_same(tx, l, r)? {
                Some((l, r))
            } else if older_or_same(tx, r, l)? {
                Some((r, l))
            } else {
                None
            };
            if let Some((older, newer)) = order {
                region.floor = Some(older);
                between = layers_between(tx, newer, older)?;
                for layer in &between {
                    if let Some(source) = layer.source_commit {
                        locals.push(Local::walk(tx, NodeId::Commit(source))?);
                    }
                }
            }
        }
        for local in sides.into_iter().chain(&locals) {
            for (commit, parents) in &local.parents {
                capacity(region.parents.len())?;
                region
                    .parents
                    .insert(NodeId::Commit(*commit), parents.clone());
            }
        }
        for layer in between {
            let parents = layer
                .parent
                .map(NodeId::Layer)
                .into_iter()
                .chain(layer.source_commit.map(NodeId::Commit))
                .collect();
            region.parents.insert(NodeId::Layer(layer.id), parents);
        }
        Ok(region)
    }

    /// True when `node` is in the floor's ancestry and is not the floor.
    fn below_floor(&self, tx: &Transaction<'_>, node: NodeId) -> HistoryResult<bool> {
        let Some(floor) = self.floor else {
            return Ok(false);
        };
        match node {
            NodeId::Layer(layer) => Ok(layer != floor && older_or_same(tx, layer, floor)?),
            NodeId::Commit(commit) => match Local::walk(tx, node)?.newest {
                Some(own) => published_below(tx, commit, own, floor),
                None => Ok(false),
            },
        }
    }

    /// Breadth-first walk from `start`; `visit` returns true to stop expanding a node.
    fn walk(&self, start: NodeId, mut visit: impl FnMut(NodeId) -> bool) {
        let mut seen = HashSet::from([start]);
        let mut queue = VecDeque::from([start]);
        while let Some(node) = queue.pop_front() {
            if visit(node) {
                continue;
            }
            for parent in self.parents.get(&node).into_iter().flatten() {
                if seen.insert(*parent) {
                    queue.push_back(*parent);
                }
            }
        }
    }

    fn reaches(&self, ancestor: NodeId, descendant: NodeId) -> bool {
        let mut found = false;
        self.walk(descendant, |node| {
            found |= node == ancestor;
            found
        });
        found
    }
}

/// The newest common ancestor of two nodes.
///
/// Every ancestor of `left` in the region is collected; the walk from `right`
/// stops at each common node it meets. A node found below the floor, or that
/// is an ancestor of another one found, is older and dropped; the first
/// remaining in breadth order wins.
pub(crate) fn merge_base(
    tx: &Transaction<'_>,
    left: NodeId,
    right: NodeId,
) -> HistoryResult<Option<NodeId>> {
    let (l, r) = (Local::walk(tx, left)?, Local::walk(tx, right)?);
    let region = Region::build(tx, [&l, &r])?;
    let mut reachable = HashSet::new();
    region.walk(left, |node| {
        reachable.insert(node);
        false
    });
    let mut found = Vec::new();
    region.walk(right, |node| {
        let shared = reachable.contains(&node);
        if shared {
            found.push(node);
        }
        shared
    });
    let mut common = Vec::new();
    for node in &found {
        if !region.below_floor(tx, *node)? {
            common.push(*node);
        }
    }
    for (index, candidate) in common.iter().enumerate() {
        let older = common
            .iter()
            .enumerate()
            .any(|(other_index, other)| other_index != index && region.reaches(*candidate, *other));
        if !older {
            return Ok(Some(*candidate));
        }
    }
    Ok(common.first().copied())
}
