//! Saved snapshots the read calls name, and path lookups in them.
//!
//! A read names `main`, a Branch, or a Commit or Layer identity. `main` is the
//! stack's head Layer and a Branch is its newest node. Reads resolve paths by
//! walking names from the root of the snapshot's immutable tree; nothing here
//! reads a live Workspace.
use super::args::{self, branch_node, invalid, refuse, short, Answer};
use super::branch::MAIN;
use crate::store::{Store, StorePorts};
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::compare::{as_text, EntryFacts, TreeTable, MAXIMUM_TEXT_BYTES};
use layerfs_content::filesystem::path::PathName;
use layerfs_content::filesystem::FilesystemRootId;
use layerfs_content::object::inode_leaf::InodeKind;
use layerfs_content::{ContentError, ObjectId};
use layerfs_history::{LayerStackRecord, NodeId};
use std::sync::Arc;

/// Width of one identity's hex text.
const NODE_TEXT: usize = 66;

/// What a snapshot name resolved to.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub(crate) enum Kind {
    Main,
    Branch,
    Commit,
    Layer,
}

/// One resolved snapshot.
pub(crate) struct Snap {
    pub(crate) kind: Kind,
    pub(crate) label: String,
    pub(crate) node: NodeId,
    pub(crate) root: ObjectId,
    pub(crate) tree: TreeTable,
}

/// The stack's object reader.
pub(crate) fn reader(store: &Arc<Store>, stack: &LayerStackRecord) -> Arc<StorePorts> {
    store.ports(stack.scope)
}

/// Resolves `main`, a Branch name, or a Commit or Layer identity.
pub(crate) fn resolve(
    store: &Arc<Store>,
    stack: &LayerStackRecord,
    reader: &StorePorts,
    name: &str,
) -> Result<Snap, SdkRefusal> {
    let (kind, label, node) = if name == MAIN {
        let node = NodeId::Layer(stack.head_layer);
        (Kind::Main, format!("main@{}", short(node)), node)
    } else if name.len() == NODE_TEXT && args::unhex(name).is_some() {
        let node = args::node(name)?;
        let kind = match node {
            NodeId::Commit(_) => Kind::Commit,
            NodeId::Layer(_) => Kind::Layer,
        };
        (kind, short(node), node)
    } else {
        let branch = args::branch(store, stack, name)?;
        let node = branch_node(&branch);
        (Kind::Branch, format!("{name}@{}", short(node)), node)
    };
    let root = args::root(store, node)?;
    let tree = TreeTable::open(reader, FilesystemRootId(root)).map_err(args::content)?;
    Ok(Snap {
        kind,
        label,
        node,
        root,
        tree,
    })
}

/// The snapshot a read names: `commit` when given, else `branch`.
pub(crate) fn named(
    store: &Arc<Store>,
    stack: &LayerStackRecord,
    reader: &StorePorts,
    args: &SdkValue,
) -> Result<Snap, SdkRefusal> {
    let name = match args.get_text("commit") {
        Some(commit) => commit,
        None => args::text(args, "branch")?,
    };
    resolve(store, stack, reader, name)
}

/// The entry at a checked absolute path, if any.
pub(crate) fn entry(
    reader: &StorePorts,
    tree: &TreeTable,
    path: &str,
) -> Result<Option<EntryFacts>, SdkRefusal> {
    let mut serial = tree.root_serial();
    for name in path.split('/').filter(|name| !name.is_empty()) {
        let name = PathName::new(name).map_err(|_| invalid(format!("`{path}` is not valid")))?;
        match tree.lookup(reader, serial, &name).map_err(args::content)? {
            Some(child) => serial = child,
            None => return Ok(None),
        }
    }
    Ok(tree
        .value(reader, serial)
        .map_err(args::content)?
        .map(|value| EntryFacts { serial, value }))
}

/// The entry at a path, refused when absent.
pub(crate) fn existing(
    reader: &StorePorts,
    snap: &Snap,
    path: &str,
) -> Result<EntryFacts, SdkRefusal> {
    entry(reader, &snap.tree, path)?.ok_or_else(|| {
        refuse(
            "NoSuchPath",
            format!("{path} does not exist at {}", snap.label),
            SdkValue::map([("path", SdkValue::text(path))]),
        )
    })
}

/// The SDK name of an inode kind.
pub(crate) fn kind_name(kind: InodeKind) -> &'static str {
    match kind {
        InodeKind::RegularFile => "file",
        InodeKind::Directory => "dir",
        InodeKind::Symlink => "symlink",
    }
}

/// Logical size of a file or symlink's content; a directory is 0.
pub(crate) fn size(reader: &StorePorts, entry: &EntryFacts) -> Result<u64, SdkRefusal> {
    if entry.value.kind == InodeKind::Directory {
        return Ok(0);
    }
    let canonical =
        layerfs_content::AuthenticatedObjects::read_canonical(reader, entry.value.content_root)
            .map_err(args::content)?;
    match entry.value.kind {
        InodeKind::RegularFile => Ok(layerfs_content::file::classify(&canonical)
            .map_err(args::content)?
            .logical_len()),
        _ => Ok(canonical.len() as u64),
    }
}

/// A regular file's text within the text bound; `None` for anything else, a
/// binary file or a larger one.
pub(crate) fn text(
    reader: &StorePorts,
    entry: Option<EntryFacts>,
) -> Result<Option<String>, SdkRefusal> {
    let Some(entry) = entry.filter(|entry| entry.value.kind == InodeKind::RegularFile) else {
        return Ok(None);
    };
    let mut bytes = Vec::new();
    let read = crate::telemetry::timed("sdk.read", |timing| {
        layerfs_content::file::read_all_bounded(
            reader,
            entry.value.content_root,
            MAXIMUM_TEXT_BYTES,
            &mut bytes,
            timing.child("content.read"),
        )
    });
    match read {
        Ok(_) => Ok(as_text(&bytes).map(str::to_owned)),
        Err(ContentError::BoundedCapacityExceeded { .. }) => Ok(None),
        Err(error) => Err(args::content(error)),
    }
}

/// The project and the named snapshot, for the read calls.
pub(crate) fn open(
    store: &Arc<Store>,
    args: &SdkValue,
) -> Result<(LayerStackRecord, Arc<StorePorts>, Snap), SdkRefusal> {
    let stack = args::project(store, args)?;
    let reader = reader(store, &stack);
    let snap = named(store, &stack, &reader, args)?;
    Ok((stack, reader, snap))
}

/// The result shape every read shares.
pub(crate) fn header(snap: &Snap, path: &str) -> Vec<(&'static str, SdkValue)> {
    vec![
        ("kind", SdkValue::text("ok")),
        ("snapshot", SdkValue::text(snap.label.as_str())),
        ("root", SdkValue::text(args::hex(snap.root.as_bytes()))),
        ("path", SdkValue::text(path)),
    ]
}

/// A finished map from fields.
pub(crate) fn answer(fields: Vec<(&'static str, SdkValue)>) -> Answer {
    Ok(SdkValue::Map(
        fields
            .into_iter()
            .map(|(name, value)| (name.to_owned(), value))
            .collect(),
    ))
}
