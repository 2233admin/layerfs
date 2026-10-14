//! The drafted paths applied to the base in one filesystem update.
//!
//! Every drafted path becomes its final binding in its parent directory: an
//! existing base directory keeps its content and changes only those names, a
//! new directory is built from exactly its drafted children. File bytes are
//! constructed into the same consumer first. A file written over an existing
//! one keeps its serial and its mode, with the new modification time; a new
//! file or directory gets portable metadata with the given time.

use std::collections::{BTreeMap, BTreeSet};

use super::draft::{parent, Draft, Node};
use crate::error::ContentResult;
use crate::filesystem::attributes::{
    portable_root, read_portable, AttributeReadWork, PortableMetadata,
};
use crate::filesystem::directory::read::lookup;
use crate::filesystem::path::PathName;
use crate::filesystem::sorted::DirectoryRoot;
use crate::filesystem::{
    update_filesystem, DirectoryUpdate, FilesystemInput, FilesystemObjects, FilesystemResources,
    FilesystemRootId, InodeUpdate,
};
use crate::object::inode_leaf::{InodeKind, InodeValue};
use crate::object::{FinalizedConsumer, FinalizedObject, ObjectId};
use crate::policy::{ConstructionCapacities, ConstructionPolicy};

/// Mode of a file the SDK creates.
const FILE_MODE: u32 = 0o644;
/// Mode of a directory the SDK creates.
const DIRECTORY_MODE: u32 = 0o755;

/// Emits constructed file objects through the operation's own boundary.
struct Emit<'x, 'y>(&'x mut FilesystemObjects<'y>);

impl FinalizedConsumer for Emit<'_, '_> {
    fn accept(&mut self, object: FinalizedObject) -> ContentResult<()> {
        self.0.emit(object).map(|_| ())
    }
}

pub(super) fn build(
    draft: &Draft<'_>,
    root: FilesystemRootId,
    objects: &mut FilesystemObjects<'_>,
    policy: ConstructionPolicy,
    capacities: &ConstructionCapacities,
    time: (i64, u32),
) -> ContentResult<FilesystemRootId> {
    let reader = draft.reader;
    let metadata = |kind, mode| {
        let value = PortableMetadata {
            mode,
            mtime_seconds: time.0,
            mtime_nanoseconds: time.1,
        };
        value.validate(kind).map(|()| value)
    };
    let mut directories: BTreeMap<u64, BTreeMap<PathName, Option<u64>>> = BTreeMap::new();
    let mut values = BTreeMap::new();
    let mut new = BTreeSet::new();
    for (path, node) in &draft.entries {
        // A path below a removed or replaced directory went with it.
        let Some(dir) = draft.resolve(parent(path))? else {
            continue;
        };
        if !dir.is_dir() || draft.resolve(path)? != *node {
            continue;
        }
        let name = PathName::new(&path[path.rfind('/').map_or(0, |at| at + 1)..])?;
        let now = node.as_ref().map(Node::serial);
        let was = match &dir {
            Node::Base(entry) => lookup(reader, DirectoryRoot(entry.value.content_root), &name)?,
            _ => None,
        };
        if now != was {
            directories
                .entry(dir.serial())
                .or_default()
                .insert(name, now);
        }
        match node {
            None | Some(Node::Base(_)) => {}
            Some(Node::Dir { serial }) => {
                let meta = metadata(InodeKind::Directory, DIRECTORY_MODE)?;
                values.insert(
                    *serial,
                    InodeValue {
                        kind: InodeKind::Directory,
                        namespace_ref_count: 1,
                        // Content builds the page from this directory's
                        // bindings and replaces the zero identity.
                        content_root: ObjectId::from_bytes(&[0; 32])?,
                        metadata_root: portable_root(
                            reader,
                            objects,
                            InodeKind::Directory,
                            meta,
                            None,
                        )?,
                    },
                );
                new.insert(*serial);
                directories.entry(*serial).or_default();
            }
            Some(Node::Clone { serial, value }) => {
                values.insert(*serial, *value);
                new.insert(*serial);
            }
            Some(Node::File {
                serial,
                bytes,
                like,
                new: fresh,
            }) => {
                let file = crate::file::construct_bytes(
                    policy,
                    capacities,
                    bytes,
                    &mut Emit(objects),
                    draft.timing.child("paths.write"),
                )?;
                let (mode, stored) = match like {
                    Some(like) => (
                        read_portable(
                            reader,
                            like.metadata_root,
                            like.kind,
                            &mut AttributeReadWork::default(),
                        )?
                        .mode,
                        Some(like.metadata_root),
                    ),
                    None => (FILE_MODE, None),
                };
                let meta = metadata(InodeKind::RegularFile, mode)?;
                values.insert(
                    *serial,
                    InodeValue {
                        kind: InodeKind::RegularFile,
                        namespace_ref_count: 1,
                        content_root: file.root,
                        metadata_root: portable_root(
                            reader,
                            objects,
                            InodeKind::RegularFile,
                            meta,
                            stored,
                        )?,
                    },
                );
                if *fresh {
                    new.insert(*serial);
                }
            }
        }
    }
    if directories.is_empty() && values.is_empty() {
        return Ok(root);
    }
    let directories = directories
        .into_iter()
        .map(|(parent, changes)| DirectoryUpdate {
            parent,
            changes: changes.into_iter().collect(),
        })
        .collect::<Vec<_>>();
    let inodes = values
        .into_iter()
        .map(|(serial, value)| InodeUpdate { serial, value })
        .collect::<Vec<_>>();
    let new_inodes = new.into_iter().collect::<Vec<_>>();
    let input = FilesystemInput {
        base: Some(root),
        scope: draft.base.root.scope(),
        root_serial: draft.base.root_serial(),
        directories: &directories,
        inodes: &inodes,
        new_inodes: &new_inodes,
        resources: FilesystemResources::default(),
    };
    Ok(draft
        .timing
        .child("paths.update")
        .run(|_| update_filesystem(objects, &input, None))?
        .root)
}
