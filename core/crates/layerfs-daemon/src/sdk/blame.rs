//! `fs.blame`: each line of a file with the oldest saved version in its chain
//! from which the line is unchanged, as the simulator composes it.
//!
//! The chain starts at the named node. A Commit continues to its parent, or to
//! its base Layer when it has none. A published Layer continues through its
//! source Commit, so main's lines are credited to the Commit that wrote them;
//! any other Layer is a version itself and continues to its parent Layer. A
//! version whose file has the same content as the newer one is passed without
//! reading it. The chain holds at most [`MAXIMUM_VERSIONS`]; the oldest one
//! read owns every line still open. Lines are returned in windows from
//! `fromLine`, each with its Commit (or Layer) and agent; a line longer than
//! 1 KiB is shown clipped.
use super::args::{self, hex, node_text, refuse, text, Answer};
use super::files::path as checked;
use super::reads::{preview, REPLY_BUDGET};
use super::snapshot::{self, answer, existing};
use crate::store::{Store, StorePorts};
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::compare::{lines, match_lines, EntryFacts, TreeTable};
use layerfs_content::filesystem::FilesystemRootId;
use layerfs_content::ObjectId;
use layerfs_history::{BranchId, LayerStackRecord, NodeId};
use std::collections::{BTreeMap, BTreeSet, HashSet};
use std::sync::Arc;

/// Saved versions one blame may walk.
const MAXIMUM_VERSIONS: usize = 1024;

/// One saved version in the chain.
struct Version {
    node: NodeId,
    root: ObjectId,
    value: SdkValue,
    agent: Option<String>,
}

/// Saved versions behind `start`, newest first.
fn chain(
    store: &Arc<Store>,
    stack: &LayerStackRecord,
    start: NodeId,
) -> Result<Vec<Version>, SdkRefusal> {
    let names: BTreeMap<BranchId, String> = args::branches(store, stack)?
        .into_iter()
        .map(|branch| (branch.id, branch.name.as_str().to_owned()))
        .collect();
    let mut out = Vec::new();
    let mut seen = HashSet::new();
    let mut next = Some(start);
    while let Some(node) = next {
        if out.len() == MAXIMUM_VERSIONS || !seen.insert(node) {
            break;
        }
        next = match node {
            NodeId::Commit(id) => {
                let record = args::commit(store, id)?;
                let branch = record.meta.branch.and_then(|id| names.get(&id).cloned());
                out.push(Version {
                    node,
                    root: record.root,
                    agent: record.meta.agent.clone(),
                    value: SdkValue::map([
                        ("id", SdkValue::text(node_text(node))),
                        ("kind", SdkValue::text("commit")),
                        ("branch", SdkValue::opt_text(branch)),
                        ("agent", SdkValue::opt_text(record.meta.agent.clone())),
                        ("call", SdkValue::opt_text(record.meta.call.clone())),
                        ("via", SdkValue::text(args::via(record.meta.via))),
                    ]),
                });
                Some(
                    record
                        .parent
                        .map_or(NodeId::Layer(record.base_layer), NodeId::Commit),
                )
            }
            NodeId::Layer(id) => {
                let record = args::layer(store, id)?;
                match record.source_commit {
                    Some(source) if !seen.contains(&NodeId::Commit(source)) => {
                        Some(NodeId::Commit(source))
                    }
                    _ => {
                        let via = record.source_commit.map_or_else(
                            || "project.init".to_owned(),
                            |source| format!("published from {}", hex(source.as_slice())),
                        );
                        out.push(Version {
                            node,
                            root: record.root,
                            agent: None,
                            value: SdkValue::map([
                                ("id", SdkValue::text(node_text(node))),
                                ("kind", SdkValue::text("layer")),
                                ("branch", SdkValue::text(super::branch::MAIN)),
                                ("agent", SdkValue::Null),
                                ("call", SdkValue::Null),
                                ("via", SdkValue::Text(via)),
                            ]),
                        });
                        record.parent.map(NodeId::Layer)
                    }
                }
            }
        };
    }
    Ok(out)
}

/// The file's entry at one version's root.
fn entry_at(
    reader: &StorePorts,
    root: ObjectId,
    path: &str,
) -> Result<Option<EntryFacts>, SdkRefusal> {
    let tree = TreeTable::open(reader, FilesystemRootId(root)).map_err(args::content)?;
    snapshot::entry(reader, &tree, path)
}

/// The owning version of each line of `tip`.
fn owners(
    reader: &StorePorts,
    chain: &[Version],
    path: &str,
    tip: (EntryFacts, &str),
) -> Result<Vec<usize>, SdkRefusal> {
    let count = lines(tip.1).len();
    let mut track = (0..count).collect::<Vec<_>>();
    let mut owner: Vec<Option<usize>> = vec![None; count];
    let mut open = count;
    let (mut current, mut current_text) = (tip.0, tip.1.to_owned());
    for k in 0..chain.len() {
        if open == 0 {
            break;
        }
        let older = match chain.get(k + 1) {
            Some(version) => entry_at(reader, version.root, path)?
                .filter(|entry| entry.value.kind == current.value.kind),
            None => None,
        };
        let older_text = match older {
            Some(entry) if entry.value.content_root == current.value.content_root => continue,
            Some(entry) => snapshot::text(reader, Some(entry))?.map(|text| (entry, text)),
            None => None,
        };
        let Some((entry, older_text)) = older_text else {
            owner
                .iter_mut()
                .filter(|o| o.is_none())
                .for_each(|o| *o = Some(k));
            break;
        };
        // Line j of the current text is line map[j] of the older one.
        let mut map = vec![None; lines(&current_text).len()];
        for (i, j) in match_lines(&lines(&older_text), &lines(&current_text))
            .into_iter()
            .enumerate()
        {
            if let Some(j) = j {
                map[j] = Some(i);
            }
        }
        for (i, own) in owner.iter_mut().enumerate() {
            if own.is_some() {
                continue;
            }
            match map[track[i]] {
                Some(j) => track[i] = j,
                None => {
                    *own = Some(k);
                    open -= 1;
                }
            }
        }
        (current, current_text) = (entry, older_text);
    }
    let last = chain.len().saturating_sub(1);
    Ok(owner.into_iter().map(|o| o.unwrap_or(last)).collect())
}

/// `fs.blame(path, { branch | commit, fromLine? })`.
pub(crate) fn blame(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (stack, reader, snap) = snapshot::open(store, args)?;
    let path = checked(text(args, "path")?)?;
    let entry = existing(&reader, &snap, &path)?;
    let Some(content) = snapshot::text(&reader, Some(entry))? else {
        return Err(refuse(
            "NotText",
            format!("{path} is not a text file within 1 MiB"),
            SdkValue::map([("path", SdkValue::text(path.as_str()))]),
        ));
    };
    let chain = chain(store, &stack, snap.node)?;
    if chain.is_empty() {
        return Err(args::failed("the snapshot has no saved version"));
    }
    let owner = owners(&reader, &chain, &path, (entry, &content))?;
    let all = lines(&content);
    let from = usize::try_from(args.get_int("fromLine").unwrap_or(1).max(1)).unwrap_or(1);
    let mut budget = REPLY_BUDGET;
    let (mut shown, mut used, mut next) = (Vec::new(), BTreeSet::new(), None);
    for (index, line) in all.iter().enumerate().skip(from - 1) {
        let version = &chain[owner[index]];
        let text = preview(line);
        let cost = text.len() + 160;
        if cost > budget && !shown.is_empty() {
            next = Some(index + 1);
            break;
        }
        budget = budget.saturating_sub(cost);
        used.insert(owner[index]);
        shown.push(SdkValue::map([
            ("n", SdkValue::Int(index as i64 + 1)),
            ("text", SdkValue::text(text)),
            ("clipped", SdkValue::Bool(text.len() < line.len())),
            ("commit", SdkValue::text(node_text(version.node))),
            ("agent", SdkValue::opt_text(version.agent.clone())),
        ]));
    }
    let mut fields = snapshot::header(&snap, &path);
    fields.extend([
        ("versions", SdkValue::Int(chain.len() as i64)),
        ("lines", SdkValue::List(shown)),
        (
            "origins",
            SdkValue::List(used.into_iter().map(|k| chain[k].value.clone()).collect()),
        ),
        (
            "nextLine",
            next.map_or(SdkValue::Null, |n| SdkValue::Int(n as i64)),
        ),
    ]);
    answer(fields)
}
