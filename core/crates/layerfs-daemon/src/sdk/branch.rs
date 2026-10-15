//! Branch calls: list, fork, list Commits, merge and publish.
//!
//! `branch.merge(a, b, name)` creates Branch `name` and never changes `a` or
//! `b`. When one side contains the other it is a fast-forward to the newer
//! node; otherwise the sides are merged against their merge base in one Save,
//! with `a`'s `/.lww`, and a clean result becomes one Commit with two parents.
//! A conflict creates nothing. `branch.publish` is overwrite-only and reports
//! the main Layers it skipped.
use super::args::{
    self, branch_node, commit_value, hex, history, invalid, layer_value, node_text, refuse, root,
    short, text, Answer,
};
use crate::store::Store;
use layerfs_bridge::control::SdkValue;
use layerfs_content::{
    filesystem::FilesystemRootId,
    merge::{merge_roots, MergeInput, RulesFrom},
};
use layerfs_history::{
    AddLayerOutcome, AddLayerRequest, BranchId, BranchMergeRequest, CommitHistoryRequest,
    CommitMeta, CommitVia, ForkRequest, ForkSource, LayerStackRecord, MergeCommit, MergeHead,
    MergeSide, NodeId, MAXIMUM_PAGE_RECORDS,
};
use layerfs_telemetry::timer::Timing;
use layerfs_workspace::InodeSerials;
use std::sync::Arc;

/// Name of the stack's line of Layers.
pub(crate) const MAIN: &str = "main";

/// Serials one merge reservation takes.
const MERGE_SERIALS: u64 = 64;

/// One merge side by name.
fn side(
    store: &Arc<Store>,
    stack: &LayerStackRecord,
    name: &str,
) -> Result<
    (MergeSide, NodeId, Option<layerfs_history::BranchRecord>),
    layerfs_bridge::control::SdkRefusal,
> {
    if name == MAIN {
        return Ok((MergeSide::Main, NodeId::Layer(stack.head_layer), None));
    }
    let branch = args::branch(store, stack, name)?;
    Ok((
        MergeSide::Branch(branch.id),
        branch_node(&branch),
        Some(branch),
    ))
}

/// `project.list_branches`: every Branch, and main.
pub(crate) fn list(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let stack = args::project(store, args)?;
    let (limit, pos) = args::paging(args)?;
    let mut page = layerfs_history::Page {
        cursor: None,
        limit: MAXIMUM_PAGE_RECORDS,
    };
    let (mut seen, mut items, mut more, mut spent) = (0u64, Vec::new(), false, 0);
    // Main participates in the same byte-name ordering as the Branches.
    let mut main = Some(SdkValue::map([
        ("name", SdkValue::text(MAIN)),
        ("id", SdkValue::Null),
        ("base", SdkValue::text(hex(stack.head_layer.as_slice()))),
        ("head", SdkValue::Null),
    ]));
    let mut add = |value: SdkValue| -> bool {
        if seen < pos {
            seen += 1;
            return true;
        }
        let cost = value.get_text("name").map_or(0, str::len) + 512;
        if items.len() == limit || spent + cost > super::reads::REPLY_BUDGET {
            more = true;
            return false;
        }
        spent += cost;
        items.push(value);
        true
    };
    'pages: loop {
        let found = store.history().branches(stack.id, &page).map_err(history)?;
        for branch in found.records {
            if branch.name.as_str() == MAIN {
                continue;
            }
            if branch.name.as_str() > MAIN {
                if let Some(value) = main.take() {
                    if !add(value) {
                        break 'pages;
                    }
                }
            }
            let value = SdkValue::map([
                ("name", SdkValue::text(branch.name.as_str())),
                ("id", SdkValue::text(hex(branch.id.as_slice()))),
                ("base", SdkValue::text(hex(branch.base_layer.as_slice()))),
                (
                    "head",
                    SdkValue::opt_text(branch.head_commit.map(|id| hex(id.as_slice()))),
                ),
                (
                    "forkedFrom",
                    branch
                        .forked_from
                        .map_or(SdkValue::Null, |node| SdkValue::text(node_text(node))),
                ),
            ]);
            if !add(value) {
                break 'pages;
            }
        }
        match found.continuation {
            Some(cursor) => page.cursor = Some(cursor),
            None => {
                if let Some(value) = main.take() {
                    add(value);
                }
                break;
            }
        }
    }
    let next = args::next_page(pos, items.len(), more);
    Ok(SdkValue::map([
        ("items", SdkValue::List(items)),
        ("hasMore", SdkValue::Bool(!matches!(next, SdkValue::Null))),
        ("nextPagePos", next),
    ]))
}

/// `branch.fork(name, { from })`: metadata only.
pub(crate) fn fork(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let stack = args::project(store, args)?;
    let name = text(args, "name")?;
    if name == MAIN {
        return Err(refuse(
            "ReservedName",
            "\"main\" names the project's main line",
            SdkValue::Null,
        ));
    }
    let from = args.get_text("from").unwrap_or(MAIN);
    let source = if from == MAIN {
        ForkSource::Layer(stack.head_layer)
    } else if let Ok(branch) = args::branch(store, &stack, from) {
        match branch.head_commit {
            Some(commit) => ForkSource::Commit {
                branch: branch.id,
                commit,
            },
            None => ForkSource::Layer(branch.base_layer),
        }
    } else {
        match args::node(from)? {
            NodeId::Layer(layer) => ForkSource::Layer(layer),
            NodeId::Commit(commit) => {
                let record = args::commit(store, commit)?;
                let branch = record
                    .meta
                    .branch
                    .ok_or_else(|| invalid("the Commit names no Branch to read it through"))?;
                ForkSource::Commit { branch, commit }
            }
        }
    };
    let name = args::name(name)?;
    if args::branch(store, &stack, name.as_str()).is_ok() {
        return Err(refuse(
            "NameTaken",
            format!("Branch {} already exists", name.as_str()),
            SdkValue::Null,
        ));
    }
    let snapshot = store
        .history()
        .fork(&ForkRequest {
            stack: stack.id,
            branch: BranchId::named(stack.id, &name),
            name,
            source,
        })
        .map_err(history)?;
    Ok(SdkValue::map([
        ("kind", SdkValue::text("Forked")),
        ("branch", SdkValue::text(snapshot.branch.name.as_str())),
        (
            "base",
            SdkValue::text(hex(snapshot.branch.base_layer.as_slice())),
        ),
        (
            "head",
            SdkValue::opt_text(snapshot.branch.head_commit.map(|id| hex(id.as_slice()))),
        ),
    ]))
}

/// `branch.list_commits({ branch, cursor? })`: newest first, one page.
pub(crate) fn list_commits(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let stack = args::project(store, args)?;
    let branch = args::branch(store, &stack, text(args, "branch")?)?;
    let (limit, pos) = args::paging(args)?;
    let (mut cursor, mut seen, mut items, mut spent, mut more) = (None, 0u64, Vec::new(), 0, false);
    'pages: loop {
        let page = store
            .history()
            .commit_history(&CommitHistoryRequest {
                branch: branch.id,
                start: branch.head_commit,
                cursor,
                limit: MAXIMUM_PAGE_RECORDS,
            })
            .map_err(history)?;
        for record in page.records {
            if seen < pos {
                seen += 1;
                continue;
            }
            let cost = record.meta.message.as_ref().map_or(0, String::len) + 1024;
            if items.len() == limit || spent + cost > super::reads::REPLY_BUDGET {
                more = true;
                break 'pages;
            }
            spent += cost;
            items.push(commit_value(&record, Some(branch.name.as_str())));
        }
        match page.continuation {
            Some(next) => cursor = Some(next),
            None => break,
        }
    }
    let next = args::next_page(pos, items.len(), more);
    Ok(SdkValue::map([
        ("items", SdkValue::List(items)),
        ("hasMore", SdkValue::Bool(!matches!(next, SdkValue::Null))),
        ("nextPagePos", next),
    ]))
}

/// `branch.merge(a, b, { name })`.
pub(crate) fn merge(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let stack = args::project(store, args)?;
    let (left, right, name) = (
        text(args, "branch")?,
        text(args, "with")?,
        text(args, "name")?,
    );
    if left == right {
        return Err(invalid("merge takes two different sources"));
    }
    if name == MAIN {
        return Err(refuse(
            "ReservedName",
            "\"main\" names the project's main line",
            SdkValue::Null,
        ));
    }
    if args::branch(store, &stack, name).is_ok() {
        return Err(refuse(
            "NameTaken",
            format!("Branch {name} already exists"),
            SdkValue::Null,
        ));
    }
    let name = args::name(name)?;
    let (left_side, ln, left_branch) = side(store, &stack, left)?;
    let (right_side, rn, _) = side(store, &stack, right)?;
    let sources = SdkValue::List(vec![
        SdkValue::map([
            ("ref", SdkValue::text(left)),
            ("node", SdkValue::text(node_text(ln))),
        ]),
        SdkValue::map([
            ("ref", SdkValue::text(right)),
            ("node", SdkValue::text(node_text(rn))),
        ]),
    ]);
    let catalog = store.history();
    let newer = if catalog.is_ancestor(rn, ln).map_err(history)? {
        Some((ln, rn))
    } else if catalog.is_ancestor(ln, rn).map_err(history)? {
        Some((rn, ln))
    } else {
        None
    };
    let request = |head| BranchMergeRequest {
        stack: stack.id,
        branch: BranchId::named(stack.id, &name),
        name: name.clone(),
        sides: [(left_side, ln), (right_side, rn)],
        head,
    };
    if let Some((newer, older)) = newer {
        let snapshot = catalog
            .merge_branch(&request(MergeHead::Node(newer)))
            .map_err(history)?;
        return Ok(SdkValue::map([
            ("kind", SdkValue::text("Merged")),
            ("fastForward", SdkValue::Bool(true)),
            ("branch", SdkValue::text(name.as_str())),
            (
                "head",
                SdkValue::opt_text(snapshot.branch.head_commit.map(|id| hex(id.as_slice()))),
            ),
            (
                "root",
                SdkValue::text(hex(snapshot.effective_root.as_bytes())),
            ),
            ("sources", sources),
            ("mergeBase", SdkValue::text(node_text(older))),
            ("conflicts", SdkValue::List(Vec::new())),
            ("lww", SdkValue::List(Vec::new())),
        ]));
    }
    let base_node = catalog
        .merge_base(ln, rn)
        .map_err(history)?
        .ok_or_else(|| refuse("NoMergeBase", "the sides share no history", SdkValue::Null))?;
    let labels = [
        format!("{left}@{}", short(ln)),
        format!("{right}@{}", short(rn)),
    ];
    let storage = store.producer().map_err(args::failed)?;
    let save = storage.begin_save().map_err(args::failed)?;
    let ports = store.ports(stack.scope);
    let mut range = (0u64, 0u64);
    let mut fresh = || {
        if range.0 == range.1 {
            let (start, count) = ports.reserve(MERGE_SERIALS).map_err(|_| {
                layerfs_content::ContentError::ResourceUnavailable {
                    what: "merge inode serials",
                }
            })?;
            range = (start, start.saturating_add(count));
        }
        range.0 += 1;
        Ok(range.0 - 1)
    };
    let policy = store.policy().construction();
    let capacities = policy.capacities();
    let input = MergeInput {
        base: FilesystemRootId(root(store, base_node)?),
        ours: FilesystemRootId(root(store, ln)?),
        theirs: FilesystemRootId(root(store, rn)?),
        labels: [&labels[0], &labels[1]],
        rules_from: RulesFrom::Ours,
        policy,
        capacities: &capacities,
    };
    let (merged, _) = Timing::disabled("branch.merge", |timing| {
        merge_roots(&save, &mut save.sink(), &input, &mut fresh, timing)
    });
    let merged = merged.map_err(args::content)?;
    let lww = layerfs_bridge::sdk_values::lww(&merged.lww);
    if !merged.clean() {
        // Nothing is created: the unfinished Save is dropped.
        drop(save);
        return Err(refuse(
            "Conflict",
            format!(
                "{left} + {right} conflict in {} file(s); nothing was created",
                merged.conflicts.len()
            ),
            SdkValue::map([
                ("sources", sources),
                ("mergeBase", SdkValue::text(node_text(base_node))),
                (
                    "conflicts",
                    layerfs_bridge::sdk_values::conflicts(&merged.conflicts),
                ),
                ("lww", lww),
            ]),
        ));
    }
    let known = store.logical_size(ln).map_err(history)?;
    let logical = layerfs_content::filesystem::statistics::logical_size_after(
        &save,
        input.ours,
        merged.root,
        known,
    )
    .map_err(args::content)?;
    let saved = save.finish().map_err(args::failed)?;
    let base = match (left_side, right_side, rn) {
        (MergeSide::Main, _, _) => match ln {
            NodeId::Layer(layer) => layer,
            NodeId::Commit(_) => return Err(invalid("main is a Layer")),
        },
        (_, MergeSide::Main, NodeId::Layer(layer)) => layer,
        _ => left_branch
            .as_ref()
            .map_or(stack.head_layer, |b| b.base_layer),
    };
    let message = args.get_text("message").map(str::to_owned);
    let snapshot = catalog
        .merge_branch(&request(MergeHead::Commit(Box::new(MergeCommit {
            base,
            parent: match ln {
                NodeId::Commit(id) => Some(id),
                NodeId::Layer(_) => None,
            },
            second_parent: rn,
            root: merged.root.0,
            meta: CommitMeta {
                message: Some(message.unwrap_or_else(|| format!("Merge {left} and {right}"))),
                lww: merged.lww.clone(),
                statistics: layerfs_history::CommitStatistics {
                    logical,
                    new_canonical: saved.canonical_bytes,
                    new_stored: saved.stored_bytes,
                    new_metadata: saved.metadata_bytes,
                },
                ..CommitMeta::new(CommitVia::Merge)
            },
        }))))
        .map_err(history)?;
    Ok(SdkValue::map([
        ("kind", SdkValue::text("Merged")),
        ("fastForward", SdkValue::Bool(false)),
        ("branch", SdkValue::text(name.as_str())),
        (
            "head",
            SdkValue::opt_text(snapshot.branch.head_commit.map(|id| hex(id.as_slice()))),
        ),
        ("root", SdkValue::text(hex(merged.root.0.as_bytes()))),
        ("sources", sources),
        ("mergeBase", SdkValue::text(node_text(base_node))),
        ("conflicts", SdkValue::List(Vec::new())),
        ("lww", lww),
    ]))
}

/// `branch.publish({ branch, commit? })`: overwrite-only.
pub(crate) fn publish(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let stack = args::project(store, args)?;
    let branch = args::branch(store, &stack, text(args, "branch")?)?;
    let commit = match args.get_text("commit") {
        Some(id) => match args::node(id)? {
            NodeId::Commit(commit) => commit,
            NodeId::Layer(_) => return Err(invalid("publish takes a Commit")),
        },
        None => branch.head_commit.ok_or_else(|| {
            refuse(
                "NoCommit",
                format!("{} has no saved Commit to publish", branch.name.as_str()),
                SdkValue::Null,
            )
        })?,
    };
    let outcome = store
        .history()
        .add_layer(&AddLayerRequest {
            stack: stack.id,
            branch: branch.id,
            commit,
            expected_stack_head: stack.head_layer,
            expected_branch_base: branch.base_layer,
        })
        .map_err(history)?;
    Ok(match outcome {
        AddLayerOutcome::Added { layer, overwrote } => SdkValue::map([
            ("kind", SdkValue::text("Added")),
            (
                "source",
                SdkValue::map([
                    ("branch", SdkValue::text(branch.name.as_str())),
                    ("commit", SdkValue::text(hex(commit.as_slice()))),
                ]),
            ),
            (
                "publishedLayer",
                layer_value(&layer, Some(branch.name.as_str())),
            ),
            ("basedOn", SdkValue::text(hex(branch.base_layer.as_slice()))),
            (
                "overwrote",
                SdkValue::List(
                    overwrote
                        .iter()
                        .map(|id| SdkValue::text(hex(id.as_slice())))
                        .collect(),
                ),
            ),
        ]),
        AddLayerOutcome::UpToDate { layer } => SdkValue::map([
            ("kind", SdkValue::text("UpToDate")),
            ("layer", SdkValue::text(hex(layer.as_slice()))),
        ]),
        AddLayerOutcome::NoChanges { head } => SdkValue::map([
            ("kind", SdkValue::text("NoChanges")),
            ("headLayer", SdkValue::text(hex(head.as_slice()))),
        ]),
    })
}
