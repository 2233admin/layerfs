//! The merged root: the decided paths applied to theirs in one update.
//!
//! Theirs is the base of a single [`update_filesystem`] call, so the merged
//! root is built by the same canonical producer as every other root. A path
//! decided `Keep` costs nothing. A directory taken from ours that theirs does
//! not hold at that path is a new directory whose bindings are exactly the
//! kept paths below it. A file value keeps its serial when the serial is new
//! to theirs, already holds that value there, or is changed in place at its
//! only binding; otherwise the value gets a fresh serial from the caller's
//! allocator, so one serial never carries two values.

use std::collections::{BTreeMap, BTreeSet, HashMap};

use layerfs_telemetry::timer::{Active, TimingScope};

use super::decide::{split, Pick, Resolver, THEIRS};
use crate::compare::tree::same_value;
use crate::error::{ContentError, ContentResult};
use crate::filesystem::path::PathName;
use crate::filesystem::{
    update_filesystem, DirectoryUpdate, FilesystemInput, FilesystemObjects, FilesystemResources,
    FilesystemRootId, InodeUpdate,
};
use crate::object::inode_leaf::{InodeKind, InodeValue};
use crate::object::{FinalizedConsumer, FinalizedObject, ObjectId};
use crate::policy::{ConstructionCapacities, ConstructionPolicy};

/// Construction inputs of the merged files.
pub(super) struct Writer<'a> {
    pub(super) policy: ConstructionPolicy,
    pub(super) capacities: &'a ConstructionCapacities,
    pub(super) fresh: &'a mut dyn FnMut() -> ContentResult<u64>,
    pub(super) timing: &'a TimingScope<'a, Active>,
}

#[derive(Default)]
struct Plan {
    /// Final bindings per directory serial.
    directories: BTreeMap<u64, BTreeMap<PathName, Option<u64>>>,
    /// Final values per serial.
    values: BTreeMap<u64, InodeValue>,
    /// Serials new to theirs.
    new: BTreeSet<u64>,
    /// Values given to a source serial and the serial each received.
    assigned: HashMap<u64, Vec<(InodeValue, u64)>>,
}

/// Result serial at one decided path, and whether it is a directory built
/// from nothing (all of its bindings come from the decided paths below it).
#[derive(Clone, Copy)]
struct Placed {
    serial: u64,
    directory: bool,
    built: bool,
}

/// Applies the picks to theirs; theirs itself when nothing changes.
pub(super) fn build(
    objects: &mut FilesystemObjects<'_>,
    resolver: &mut Resolver<'_>,
    picks: &BTreeMap<String, Pick>,
    writer: &mut Writer<'_>,
) -> ContentResult<FilesystemRootId> {
    let theirs = resolver.trees[THEIRS];
    let mut plan = Plan::default();
    let mut placed: HashMap<&str, Option<Placed>> = HashMap::new();
    for (path, pick) in picks {
        let t = resolver.entry(THEIRS, path)?;
        let result = match pick {
            Pick::Keep => t.map(|entry| Placed {
                serial: entry.serial,
                directory: entry.value.kind == InodeKind::Directory,
                built: false,
            }),
            Pick::Absent => None,
            Pick::Take(entry) if entry.value.kind == InodeKind::Directory => {
                let serial = if resolver.value(THEIRS, entry.serial)?.is_some() {
                    (writer.fresh)()?
                } else {
                    entry.serial
                };
                plan.new.insert(serial);
                plan.values.insert(
                    serial,
                    InodeValue {
                        // Content rebuilds the page from this directory's
                        // bindings and replaces the zero identity.
                        content_root: ObjectId::from_bytes(&[0; 32])?,
                        namespace_ref_count: 1,
                        ..entry.value
                    },
                );
                plan.directories.entry(serial).or_default();
                Some(Placed {
                    serial,
                    directory: true,
                    built: true,
                })
            }
            Pick::Take(entry) => Some(Placed {
                serial: plan.assign(resolver, writer, entry.serial, entry.value, t)?,
                directory: false,
                built: false,
            }),
            Pick::Write { like, bytes } => {
                let file = crate::file::construct_bytes(
                    writer.policy,
                    writer.capacities,
                    bytes,
                    &mut Emit(objects),
                    writer.timing.child("merge.write"),
                )?;
                let value = InodeValue {
                    kind: InodeKind::RegularFile,
                    content_root: file.root,
                    ..like.value
                };
                Some(Placed {
                    serial: plan.assign(resolver, writer, like.serial, value, t)?,
                    directory: false,
                    built: false,
                })
            }
        };
        placed.insert(path.as_str(), result);
        if path == "/" {
            continue;
        }
        let (parent, name) = split(path);
        // A parent decided absent, or not a directory, drops this subtree.
        let Some(parent) = place(&placed, resolver, parent)?.filter(|parent| parent.directory)
        else {
            continue;
        };
        let now = result.map(|placed| placed.serial);
        let was = if parent.built {
            None
        } else {
            t.map(|entry| entry.serial)
        };
        if now != was {
            plan.directories
                .entry(parent.serial)
                .or_default()
                .insert(PathName::new(name)?, now);
        }
    }
    if plan.directories.is_empty() && plan.values.is_empty() {
        return Ok(theirs_root(resolver));
    }
    let directories = plan
        .directories
        .into_iter()
        .map(|(parent, changes)| DirectoryUpdate {
            parent,
            changes: changes.into_iter().collect(),
        })
        .collect::<Vec<_>>();
    let inodes = plan
        .values
        .into_iter()
        .map(|(serial, value)| InodeUpdate { serial, value })
        .collect::<Vec<_>>();
    let new_inodes = plan.new.into_iter().collect::<Vec<_>>();
    let input = FilesystemInput {
        base: Some(theirs_root(resolver)),
        scope: theirs.root.scope(),
        root_serial: theirs.root_serial(),
        directories: &directories,
        inodes: &inodes,
        new_inodes: &new_inodes,
        resources: FilesystemResources::default(),
    };
    Ok(writer
        .timing
        .child("merge.update")
        .run(|_| update_filesystem(objects, &input, None))?
        .root)
}

/// The result at a path: its pick's, or for an unpicked path theirs below a
/// surviving parent directory.
fn place(
    placed: &HashMap<&str, Option<Placed>>,
    resolver: &mut Resolver<'_>,
    path: &str,
) -> ContentResult<Option<Placed>> {
    if let Some(result) = placed.get(path) {
        return Ok(*result);
    }
    if path != "/" && !place(placed, resolver, split(path).0)?.is_some_and(|up| up.directory) {
        return Ok(None);
    }
    Ok(resolver.entry(THEIRS, path)?.map(|entry| Placed {
        serial: entry.serial,
        directory: entry.value.kind == InodeKind::Directory,
        built: false,
    }))
}

fn theirs_root(resolver: &Resolver<'_>) -> FilesystemRootId {
    resolver.roots[THEIRS]
}

/// Emits constructed file objects through the operation's own boundary.
struct Emit<'x, 'y>(&'x mut FilesystemObjects<'y>);

impl FinalizedConsumer for Emit<'_, '_> {
    fn accept(&mut self, object: FinalizedObject) -> ContentResult<()> {
        self.0.emit(object).map(|_| ())
    }
}

impl Plan {
    /// The serial that carries `value` for the source serial `source`.
    fn assign(
        &mut self,
        resolver: &Resolver<'_>,
        writer: &mut Writer<'_>,
        source: u64,
        value: InodeValue,
        here: Option<crate::compare::tree::EntryFacts>,
    ) -> ContentResult<u64> {
        let given = self.assigned.entry(source).or_default();
        if let Some((_, serial)) = given.iter().find(|(held, _)| same_value(held, &value)) {
            return Ok(*serial);
        }
        let first = given.is_empty();
        let serial = match resolver.value(THEIRS, source)? {
            _ if !first => None,
            None => {
                self.new.insert(source);
                Some(source)
            }
            Some(held) if same_value(&held, &value) => return Ok(self.keep(source, value)),
            Some(held)
                if held.namespace_ref_count == 1
                    && here.is_some_and(|entry| entry.serial == source) =>
            {
                Some(source)
            }
            Some(_) => None,
        };
        let serial = match serial {
            Some(serial) => serial,
            None => {
                let fresh = (writer.fresh)()?;
                if resolver.value(THEIRS, fresh)?.is_some() || self.values.contains_key(&fresh) {
                    return Err(ContentError::InvalidRecord("merge fresh serial"));
                }
                self.new.insert(fresh);
                fresh
            }
        };
        self.values.insert(serial, value);
        self.assigned
            .entry(source)
            .or_default()
            .push((value, serial));
        Ok(serial)
    }

    /// Records a serial whose value theirs already holds.
    fn keep(&mut self, serial: u64, value: InodeValue) -> u64 {
        self.assigned
            .entry(serial)
            .or_default()
            .push((value, serial));
        serial
    }
}
