//! Differences between saved snapshots: two files, two Commits, two Branches.
//!
//! Tree differences use Content's bounded directory listings and grouped inode
//! demands; file differences use its bounded line difference. A directory whose
//! only change is its children is not listed, as in the simulator. Every answer
//! fits one control record: tree differences resume after `nextPagePos`, and a file's
//! lines that do not fit the remaining budget are left out (`hunksOmitted`)
//! for `fs.diff_files` to show.
use super::args::{self, invalid, refuse, text, Answer};
use super::files::path as checked;
use super::reads::REPLY_BUDGET;
use super::snapshot::{self, answer, existing, kind_name, Kind, Snap};
use crate::store::{Store, StorePorts};
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::compare::{
    line_diff, BindingHints, ChangeKind, ChangeWalk, DiffLine, EntryFacts, LineOp, PathChange,
};
use layerfs_content::filesystem::path::PathName;
use layerfs_content::object::inode_leaf::InodeKind;
use layerfs_content::{ContentError, ContentResult};
use layerfs_history::LayerStackRecord;
use layerfs_history::{HistoryCatalog, HistoryError};
use std::cell::RefCell;
use std::sync::Arc;

/// Budget one listed change costs besides its path and lines.
const ITEM_COST: usize = 160;

/// Lines as SDK values, or `None` when they do not fit `budget`.
fn hunks(lines: &[DiffLine], budget: &mut usize) -> Option<SdkValue> {
    let cost = lines.iter().map(|line| line.text.len() + 24).sum::<usize>();
    if cost > *budget {
        return None;
    }
    *budget -= cost;
    Some(SdkValue::List(
        lines
            .iter()
            .map(|line| {
                SdkValue::map([
                    (
                        "op",
                        SdkValue::text(match line.op {
                            LineOp::Same => " ",
                            LineOp::Removed => "-",
                            LineOp::Added => "+",
                        }),
                    ),
                    ("text", SdkValue::text(line.text.as_str())),
                ])
            })
            .collect(),
    ))
}

/// `fs.diff_files({ left: { path, commit? }, right: { path, commit? } },
/// { branch })`.
pub(crate) fn diff_files(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let stack = args::project(store, args)?;
    let reader = snapshot::reader(store, &stack);
    let branch = args.get_text("branch").unwrap_or("main");
    let side = |name: &str| -> Result<(String, Snap, EntryFacts, Option<String>), SdkRefusal> {
        let selector = args
            .get(name)
            .ok_or_else(|| invalid(format!("missing `{name}` selector")))?;
        let path = checked(text(selector, "path")?)?;
        let snap = snapshot::resolve(
            store,
            &stack,
            &reader,
            selector.get_text("commit").unwrap_or(branch),
        )?;
        let entry = existing(&reader, &snap, &path)?;
        if entry.value.kind == InodeKind::Directory {
            return Err(refuse(
                "IsDirectory",
                format!("{path} is a directory"),
                SdkValue::map([("path", SdkValue::text(path.as_str()))]),
            ));
        }
        let content = snapshot::text(&reader, Some(entry))?;
        Ok((path, snap, entry, content))
    };
    let (left, right) = (side("left")?, side("right")?);
    let show = |(path, snap, entry, _): &(String, Snap, EntryFacts, Option<String>)| {
        SdkValue::map([
            ("path", SdkValue::text(path.as_str())),
            ("snapshot", SdkValue::text(snap.label.as_str())),
            ("inode", SdkValue::Int(entry.serial as i64)),
        ])
    };
    let same_inode = left.2.serial == right.2.serial;
    let (kind, equal, lines) = match (&left.3, &right.3) {
        (Some(l), Some(r)) if l == r => ("Equal", true, Some(SdkValue::List(Vec::new()))),
        (Some(l), Some(r)) => {
            let mut budget = REPLY_BUDGET;
            ("Text", false, hunks(&line_diff(l, r), &mut budget))
        }
        _ => {
            let equal = left.2.value.content_root == right.2.value.content_root;
            (
                if equal { "Equal" } else { "Binary" },
                equal,
                Some(SdkValue::List(Vec::new())),
            )
        }
    };
    answer(vec![
        ("kind", SdkValue::text(kind)),
        ("left", show(&left)),
        ("right", show(&right)),
        ("contentEqual", SdkValue::Bool(equal)),
        ("sameInode", SdkValue::Bool(same_inode)),
        ("hunksOmitted", SdkValue::Bool(lines.is_none())),
        ("hunks", lines.unwrap_or_default()),
    ])
}

fn facts(entry: Option<EntryFacts>) -> SdkValue {
    entry.map_or(SdkValue::Null, |entry| {
        SdkValue::map([
            ("type", SdkValue::text(kind_name(entry.value.kind))),
            ("inode", SdkValue::Int(entry.serial as i64)),
        ])
    })
}

/// One listed change, or `None` for a directory whose children changed.
fn change(
    reader: &StorePorts,
    change: &PathChange,
    budget: &mut usize,
) -> Result<Option<SdkValue>, SdkRefusal> {
    let kind = match change.kind {
        ChangeKind::Added => "Added",
        ChangeKind::Removed => "Removed",
        ChangeKind::Modified => "Modified",
    };
    let shown = change.right.or(change.left).map(|entry| entry.value.kind);
    let (mut content, mut identity, mut metadata, mut lines) =
        (false, false, false, SdkValue::Null);
    let mut omitted = false;
    if let (Some(l), Some(r)) = (change.left, change.right) {
        let directories = l.value.kind == InodeKind::Directory && l.value.kind == r.value.kind;
        identity = l.serial != r.serial;
        metadata = l.value.metadata_root != r.value.metadata_root;
        if directories && !identity && !metadata {
            return Ok(None);
        }
        content = !directories
            && (l.value.kind != r.value.kind || l.value.content_root != r.value.content_root);
        if content && l.value.kind == InodeKind::RegularFile && r.value.kind == l.value.kind {
            if let (Some(a), Some(b)) = (
                snapshot::text(reader, Some(l))?,
                snapshot::text(reader, Some(r))?,
            ) {
                match hunks(&line_diff(&a, &b), budget) {
                    Some(value) => lines = value,
                    None => omitted = true,
                }
            }
        }
    }
    Ok(Some(SdkValue::map([
        ("path", SdkValue::text(change.path.as_str())),
        ("kind", SdkValue::text(kind)),
        ("type", SdkValue::opt_text(shown.map(kind_name))),
        ("before", facts(change.left)),
        ("after", facts(change.right)),
        ("content", SdkValue::Bool(content)),
        ("identity", SdkValue::Bool(identity)),
        ("metadata", SdkValue::Bool(metadata)),
        ("hunks", lines),
        ("hunksOmitted", SdkValue::Bool(omitted)),
    ])))
}

/// The History catalog's recorded bindings, as Content's hint port; a
/// catalog failure is kept to answer with its own cause.
struct CatalogHints<'a> {
    catalog: &'a dyn HistoryCatalog,
    failure: RefCell<Option<HistoryError>>,
}

impl BindingHints for CatalogHints<'_> {
    fn bindings_of(&self, child: u64) -> ContentResult<Vec<(u64, PathName)>> {
        match self.catalog.bindings_of(child) {
            Ok(rows) => Ok(rows
                .into_iter()
                .filter_map(|row| Some((row.parent, PathName::from_bytes(&row.name).ok()?)))
                .collect()),
            Err(error) => {
                *self.failure.borrow_mut() = Some(error);
                Err(ContentError::ProviderFailure {
                    what: "binding hints",
                })
            }
        }
    }
}

/// The listed changes from `left` to `right` after the cursor, within the
/// reply budget, and the cursor to resume from. Content's change walk reads
/// what changed; without recorded bindings it is the full walk of both trees.
fn changes(
    store: &Arc<Store>,
    reader: &StorePorts,
    left: &Snap,
    right: &Snap,
    args: &SdkValue,
) -> Result<(Vec<SdkValue>, SdkValue), SdkRefusal> {
    let (limit, pos) = args::paging(args)?;
    if left.root == right.root {
        return Ok((Vec::new(), SdkValue::Null));
    }
    let hints = CatalogHints {
        catalog: store.history(),
        failure: RefCell::new(None),
    };
    let planned = ChangeWalk::plan(reader, &hints, &left.tree, &right.tree);
    if let Some(error) = hints.failure.take() {
        return Err(args::history(error));
    }
    let mut walk = match planned.map_err(args::content)? {
        Some(walk) => walk,
        None => ChangeWalk::full(reader, &left.tree, &right.tree).map_err(args::content)?,
    };
    emit(reader, &mut walk, limit, pos)
}

/// Lists the differing pairs after `pos`, at most `limit` and within budget.
fn emit(
    reader: &StorePorts,
    walk: &mut ChangeWalk<'_>,
    limit: usize,
    pos: u64,
) -> Result<(Vec<SdkValue>, SdkValue), SdkRefusal> {
    let (mut items, mut seen, mut budget, mut more) = (Vec::new(), 0u64, REPLY_BUDGET, false);
    while let Some(pair) = walk.next_pair().map_err(args::content)? {
        let (path, before, after) = &pair;
        let children_only = matches!((before, after), (Some(x), Some(y))
            if x.serial == y.serial
                && x.value.kind == InodeKind::Directory
                && y.value.kind == InodeKind::Directory
                && x.value.metadata_root == y.value.metadata_root);
        if before != after && !children_only {
            if seen < pos {
                seen += 1;
            } else {
                let cost = path.len() + ITEM_COST;
                if items.len() == limit || cost > budget {
                    more = true;
                    break;
                }
                budget -= cost;
                let kind = match (before, after) {
                    (None, _) => ChangeKind::Added,
                    (_, None) => ChangeKind::Removed,
                    _ => ChangeKind::Modified,
                };
                let listed = PathChange {
                    path: path.clone(),
                    kind,
                    left: *before,
                    right: *after,
                };
                if let Some(item) = change(reader, &listed, &mut budget)? {
                    items.push(item);
                }
            }
        }
        walk.enter(&pair).map_err(args::content)?;
    }
    let next = args::next_page(pos, items.len(), more);
    Ok((items, next))
}

fn both(
    store: &Arc<Store>,
    args: &SdkValue,
) -> Result<(LayerStackRecord, Arc<StorePorts>, Snap, Snap), SdkRefusal> {
    let stack = args::project(store, args)?;
    let reader = snapshot::reader(store, &stack);
    let from = snapshot::resolve(store, &stack, &reader, text(args, "from")?)?;
    let to = snapshot::resolve(store, &stack, &reader, text(args, "to")?)?;
    Ok((stack, reader, from, to))
}

fn listed(
    store: &Arc<Store>,
    reader: &StorePorts,
    from: &Snap,
    to: &Snap,
    args: &SdkValue,
    sides: [SdkValue; 2],
) -> Answer {
    let (items, next) = changes(store, reader, from, to, args)?;
    let [from, to] = sides;
    answer(vec![
        ("kind", SdkValue::text("ok")),
        ("from", from),
        ("to", to),
        ("items", SdkValue::List(items)),
        ("hasMore", SdkValue::Bool(!matches!(next, SdkValue::Null))),
        ("nextPagePos", next),
    ])
}

/// `branch.diff_commits({ from, to })`: two saved Commits.
pub(crate) fn diff_commits(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, from, to) = both(store, args)?;
    if from.kind != Kind::Commit || to.kind != Kind::Commit {
        return Err(invalid("diff_commits takes two saved Commits"));
    }
    let side = |snap: &Snap| {
        SdkValue::map([
            ("commit", SdkValue::text(args::node_text(snap.node))),
            ("root", SdkValue::text(args::hex(snap.root.as_bytes()))),
        ])
    };
    listed(store, &reader, &from, &to, args, [side(&from), side(&to)])
}

/// `branch.diff_branches({ from, to })`: two Branches or main.
pub(crate) fn diff_branches(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, from, to) = both(store, args)?;
    let named = |snap: &Snap| matches!(snap.kind, Kind::Main | Kind::Branch);
    if !named(&from) || !named(&to) {
        return Err(invalid("diff_branches takes Branches or main"));
    }
    let side = |snap: &Snap, name: &str| {
        SdkValue::map([
            ("ref", SdkValue::text(name)),
            ("label", SdkValue::text(snap.label.as_str())),
            ("root", SdkValue::text(args::hex(snap.root.as_bytes()))),
        ])
    };
    let sides = [
        side(&from, text(args, "from")?),
        side(&to, text(args, "to")?),
    ];
    listed(store, &reader, &from, &to, args, sides)
}
