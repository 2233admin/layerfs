//! Which paths a merge must decide, and the decision for each.
//!
//! Only a path whose entry ours changed can differ from theirs in the result:
//! everywhere else the result is theirs. Ours' changed inodes come from the
//! page-skipping inode difference; each changed directory contributes its
//! changed names, with the whole subtree below a name it bound or unbound, and
//! each file changed in place contributes its own path. Every candidate is
//! then resolved by path in the base, ours and theirs and decided with the
//! simulator's rules: an entry is its kind plus, for a file or symlink, its
//! content (two directories are the same entry; their children decide).

use std::collections::{BTreeMap, BTreeSet, HashMap};

use layerfs_telemetry::timer::{Active, TimingScope};

use super::lww::Rules;
use super::text::{deletion_markers, merge3, Hunk};
use super::{Conflict, ConflictKind, LwwDecision};
use crate::compare::text::{as_text, MAXIMUM_TEXT_BYTES};
use crate::compare::tree::{binding_changes, join, locate, subtree, EntryFacts, TreeTable};
use crate::compare::{BindingHints, DifferenceWork, NamingWork};
use crate::error::{ContentError, ContentResult};
use crate::filesystem::attributes::{read_portable, AttributeReadWork};
use crate::filesystem::directory::read::lookup;
use crate::filesystem::path::PathName;
use crate::filesystem::root::FilesystemRootId;
use crate::filesystem::sorted::DirectoryRoot;
use crate::object::inode_leaf::{InodeKind, InodeValue};
use crate::object::AuthenticatedObjects;

/// Paths one merge may decide, and directories one path search may list.
pub const MAXIMUM_MERGE_PATHS: usize = 1 << 18;

/// Base, ours and theirs, in that order.
pub(super) const BASE: usize = 0;
pub(super) const OURS: usize = 1;
pub(super) const THEIRS: usize = 2;

/// The result at one decided path.
#[derive(Clone, Debug, Eq, PartialEq)]
pub(super) enum Pick {
    /// Whatever theirs holds (possibly nothing).
    Keep,
    /// Nothing.
    Absent,
    /// Our entry.
    Take(EntryFacts),
    /// New file bytes with the kind and metadata of `like`.
    Write { like: EntryFacts, bytes: Vec<u8> },
}

/// Path resolution in the three trees, cached per path.
pub(super) struct Resolver<'r> {
    pub(super) reader: &'r dyn AuthenticatedObjects,
    pub(super) roots: [FilesystemRootId; 3],
    pub(super) trees: [TreeTable; 3],
    cache: [HashMap<String, Option<EntryFacts>>; 3],
}

/// Parent path and last name of an absolute path other than the root.
pub(super) fn split(path: &str) -> (&str, &str) {
    match path.rfind('/') {
        Some(0) => ("/", &path[1..]),
        Some(index) => (&path[..index], &path[index + 1..]),
        None => ("/", path),
    }
}

impl<'r> Resolver<'r> {
    pub(super) fn new(
        reader: &'r dyn AuthenticatedObjects,
        roots: [FilesystemRootId; 3],
    ) -> ContentResult<Self> {
        let open = |root| TreeTable::open(reader, root);
        Ok(Self {
            reader,
            roots,
            trees: [open(roots[0])?, open(roots[1])?, open(roots[2])?],
            cache: Default::default(),
        })
    }

    /// The entry at `path` in one tree.
    pub(super) fn entry(&mut self, side: usize, path: &str) -> ContentResult<Option<EntryFacts>> {
        if let Some(hit) = self.cache[side].get(path) {
            return Ok(*hit);
        }
        let tree = self.trees[side];
        let serial = if path == "/" {
            Some(tree.root_serial())
        } else {
            let (parent, name) = split(path);
            match self.entry(side, parent)? {
                Some(dir) if dir.value.kind == InodeKind::Directory => lookup(
                    self.reader,
                    DirectoryRoot(dir.value.content_root),
                    &PathName::new(name)?,
                )?,
                _ => None,
            }
        };
        let found = match serial {
            Some(serial) => Some(EntryFacts {
                serial,
                value: tree
                    .value(self.reader, serial)?
                    .ok_or(ContentError::InvalidRecord("bound inode record"))?,
            }),
            None => None,
        };
        self.cache[side].insert(path.to_owned(), found);
        Ok(found)
    }

    /// The serial's value in one tree.
    pub(super) fn value(&self, side: usize, serial: u64) -> ContentResult<Option<InodeValue>> {
        self.trees[side].value(self.reader, serial)
    }
}

fn capacity(what: &'static str, actual: usize) -> ContentError {
    ContentError::BoundedCapacityExceeded {
        what,
        limit: MAXIMUM_MERGE_PATHS as u64,
        actual: actual as u64,
    }
}

/// Every path whose entry may differ between the base and ours.
/// With `hints`, the changed inodes are named from recorded bindings when
/// that names all of them; otherwise, and without hints, by the
/// breadth-first walk. The second value is true when the hints named them.
pub(super) fn candidates(
    resolver: &Resolver<'_>,
    hints: Option<&dyn BindingHints>,
    work: &mut DifferenceWork,
    naming: &mut NamingWork,
    timing: &TimingScope<'_, Active>,
) -> ContentResult<(BTreeSet<String>, bool)> {
    let reader = resolver.reader;
    let [base, ours, _] = resolver.trees;
    let mut changed = Vec::new();
    timing.child("merge.changes").run(|_| {
        crate::compare::tree::inode_changes(reader, &base, &ours, work, |serial, b, o| {
            if let (Some(b), Some(o)) = (b, o) {
                changed.push((serial, *b, *o));
            }
            Ok(())
        })
    })?;
    let wanted = changed
        .iter()
        .map(|(serial, _, _)| *serial)
        .collect::<BTreeSet<_>>();
    // The trace shows which naming ran: `merge.named` (recorded bindings),
    // and `merge.locate` only when they could not name every inode (#352).
    let hinted = match hints {
        Some(hints) => timing.child("merge.named").run(|_| {
            Ok::<_, ContentError>(
                match crate::compare::name_from_hints(reader, hints, &ours, &wanted, naming)? {
                    Some(in_ours) => {
                        crate::compare::name_from_hints(reader, hints, &base, &wanted, naming)?
                            .map(|in_base| (in_ours, in_base))
                    }
                    None => None,
                },
            )
        })?,
        None => None,
    };
    let named = hinted.is_some();
    let (in_ours, in_base) = match hinted {
        Some(found) => found,
        None => timing.child("merge.locate").run(|_| {
            Ok::<_, ContentError>((
                locate(reader, &ours, &wanted, MAXIMUM_MERGE_PATHS)?,
                locate(reader, &base, &wanted, MAXIMUM_MERGE_PATHS)?,
            ))
        })?,
    };
    if in_ours.len() < wanted.len() || in_base.len() < wanted.len() {
        return Err(capacity("merge.locate", MAXIMUM_MERGE_PATHS));
    }
    let mut out = BTreeSet::new();
    for (serial, b, o) in changed {
        let paths = [&in_base[&serial], &in_ours[&serial]];
        if b.kind != InodeKind::Directory || o.kind != InodeKind::Directory {
            out.extend(paths.map(String::clone));
            continue;
        }
        let mut names = Vec::new();
        binding_changes(
            reader,
            Some(b.content_root),
            Some(o.content_root),
            work,
            |name, was, now| {
                names.push((name.clone(), was, now));
                Ok(())
            },
        )?;
        for (name, was, now) in names {
            for path in paths {
                out.insert(join(path, &name));
            }
            for (side, tree, bound) in [(BASE, &base, was), (OURS, &ours, now)] {
                let Some(child) = bound else { continue };
                if tree.value(reader, child)?.map(|value| value.kind) == Some(InodeKind::Directory)
                {
                    let mut below = Vec::new();
                    let room = MAXIMUM_MERGE_PATHS.saturating_sub(out.len());
                    let path = join(paths[side], &name);
                    if !subtree(reader, tree, &path, child, room, &mut below)? {
                        return Err(capacity("merge.paths", MAXIMUM_MERGE_PATHS));
                    }
                    out.extend(below.into_iter().map(|(path, _, _)| path));
                }
            }
        }
        if out.len() > MAXIMUM_MERGE_PATHS {
            return Err(capacity("merge.paths", out.len()));
        }
    }
    Ok((out, named))
}

/// Everything one decision pass needs besides the resolver.
pub(super) struct Decider<'a> {
    pub(super) labels: [&'a str; 2],
    pub(super) rules: &'a Rules,
    pub(super) timing: &'a TimingScope<'a, Active>,
    pub(super) conflicts: Vec<Conflict>,
    pub(super) lww: Vec<LwwDecision>,
}

/// Same entry: both absent, or same kind and, below a directory, same content.
fn same(x: Option<EntryFacts>, y: Option<EntryFacts>) -> bool {
    match (x, y) {
        (None, None) => true,
        (Some(a), Some(b)) => {
            a.value.kind == b.value.kind
                && (a.value.kind == InodeKind::Directory
                    || a.value.content_root == b.value.content_root)
        }
        _ => false,
    }
}

fn is_file(entry: Option<EntryFacts>) -> bool {
    entry.is_some_and(|entry| entry.value.kind == InodeKind::RegularFile)
}

impl Decider<'_> {
    /// Text of a regular file within the text bound, else `None`.
    pub(super) fn text(
        &self,
        reader: &dyn AuthenticatedObjects,
        entry: Option<EntryFacts>,
    ) -> ContentResult<Option<String>> {
        let Some(entry) = entry.filter(|entry| entry.value.kind == InodeKind::RegularFile) else {
            return Ok(None);
        };
        let mut bytes = Vec::new();
        match crate::file::read_all_bounded(
            reader,
            entry.value.content_root,
            MAXIMUM_TEXT_BYTES,
            &mut bytes,
            self.timing.child("merge.read"),
        ) {
            Err(ContentError::BoundedCapacityExceeded { .. }) => return Ok(None),
            other => {
                other?;
            }
        }
        Ok(as_text(&bytes).map(str::to_owned))
    }

    /// Modification time of the path's entry on one side; a deletion takes
    /// the time of the nearest surviving parent directory.
    fn time(
        &self,
        resolver: &mut Resolver<'_>,
        side: usize,
        path: &str,
    ) -> ContentResult<(i64, u32)> {
        let mut path = path.to_owned();
        loop {
            if let Some(entry) = resolver.entry(side, &path)? {
                let metadata = read_portable(
                    resolver.reader,
                    entry.value.metadata_root,
                    entry.value.kind,
                    &mut AttributeReadWork::default(),
                )?;
                return Ok((metadata.mtime_seconds, metadata.mtime_nanoseconds));
            }
            path = split(&path).0.to_owned();
        }
    }

    /// The pick at one candidate path.
    pub(super) fn decide(
        &mut self,
        resolver: &mut Resolver<'_>,
        path: &str,
    ) -> ContentResult<Pick> {
        let b = resolver.entry(BASE, path)?;
        let o = resolver.entry(OURS, path)?;
        let t = resolver.entry(THEIRS, path)?;
        let ours = || o.map_or(Pick::Absent, Pick::Take);
        if same(o, t) || same(b, o) {
            return Ok(Pick::Keep);
        }
        if same(b, t) {
            return Ok(ours());
        }
        if let Some(rule) = self.rules.matching(path) {
            let kept_ours =
                self.time(resolver, OURS, path)? >= self.time(resolver, THEIRS, path)?;
            self.lww.push(LwwDecision {
                path: path.to_owned(),
                kept_ours,
                deleted: if kept_ours { o.is_none() } else { t.is_none() },
                rule: rule.pattern.clone(),
            });
            return Ok(if kept_ours { ours() } else { Pick::Keep });
        }
        let reader = resolver.reader;
        let conflict = |kind, hunks: Vec<Hunk>| Conflict {
            path: path.to_owned(),
            kind,
            hunks,
        };
        if let (true, true, Some(like)) = (is_file(o), is_file(t), o) {
            let base_text = match b {
                Some(_) => self.text(reader, b)?,
                None => Some(String::new()),
            };
            let (ot, tt) = (self.text(reader, o)?, self.text(reader, t)?);
            let (Some(base_text), Some(ot), Some(tt)) = (base_text, ot, tt) else {
                self.conflicts
                    .push(conflict(ConflictKind::Binary, Vec::new()));
                return Ok(Pick::Take(like));
            };
            let merged = merge3(&base_text, &ot, &tt, self.labels);
            if !merged.hunks.is_empty() {
                let kind = if b.is_some() {
                    ConflictKind::Content
                } else {
                    ConflictKind::AddAdd
                };
                self.conflicts.push(conflict(kind, merged.hunks));
            }
            return Ok(Pick::Write {
                like,
                bytes: merged.text.into_bytes(),
            });
        }
        let present = match (o, t) {
            (Some(kept), None) if kept.value.kind != InodeKind::Directory => Some((kept, true)),
            (None, Some(kept)) if kept.value.kind != InodeKind::Directory => Some((kept, false)),
            _ => None,
        };
        if let Some((kept, kept_ours)) = present {
            let kind = if kept_ours {
                ConflictKind::ModifyDelete
            } else {
                ConflictKind::DeleteModify
            };
            let text = self.text(reader, Some(kept))?;
            self.conflicts.push(conflict(kind, Vec::new()));
            let index = self.conflicts.len() - 1;
            return Ok(match text {
                Some(text) => {
                    let marked = deletion_markers(&text, kept_ours, self.labels);
                    let lines = text.split('\n').map(str::to_owned).collect::<Vec<_>>();
                    self.conflicts[index].hunks.push(Hunk {
                        line: 1,
                        ours: if kept_ours { lines.clone() } else { Vec::new() },
                        theirs: if kept_ours { Vec::new() } else { lines },
                    });
                    Pick::Write {
                        like: kept,
                        bytes: marked.into_bytes(),
                    }
                }
                None if kept_ours => Pick::Take(kept),
                None => Pick::Keep,
            });
        }
        self.conflicts
            .push(conflict(ConflictKind::Type, Vec::new()));
        Ok(o.map_or(Pick::Keep, Pick::Take))
    }
}

/// Makes every kept path's parents directories: a parent decided absent is
/// revived from theirs when theirs holds a directory there, else from ours.
/// A path below a parent that stays a file cannot be kept and is dropped.
pub(super) fn revive(
    resolver: &mut Resolver<'_>,
    picks: &mut BTreeMap<String, Pick>,
) -> ContentResult<()> {
    let mut work = picks.keys().cloned().collect::<Vec<_>>();
    while let Some(path) = work.pop() {
        if path == "/" || !kept(resolver, picks, &path)? {
            continue;
        }
        let parent = split(&path).0.to_owned();
        let directory = |entry: Option<EntryFacts>| {
            entry.filter(|entry| entry.value.kind == InodeKind::Directory)
        };
        let current = match picks.get(&parent) {
            None => {
                // An unpicked parent is theirs; picking it Keep makes its own
                // parents checked in turn.
                let entry = resolver.entry(THEIRS, &parent)?;
                if entry.is_some() {
                    picks.insert(parent.clone(), Pick::Keep);
                    work.push(parent.clone());
                }
                entry
            }
            Some(Pick::Keep) => resolver.entry(THEIRS, &parent)?,
            Some(Pick::Absent) => None,
            Some(Pick::Take(entry)) => Some(*entry),
            Some(Pick::Write { like, .. }) => Some(*like),
        };
        match current {
            Some(entry) if entry.value.kind == InodeKind::Directory => {}
            Some(_) => {
                picks.insert(path, Pick::Absent);
            }
            None => {
                let revived = if directory(resolver.entry(THEIRS, &parent)?).is_some() {
                    Pick::Keep
                } else if let Some(entry) = directory(resolver.entry(OURS, &parent)?) {
                    Pick::Take(entry)
                } else {
                    picks.insert(path, Pick::Absent);
                    continue;
                };
                picks.insert(parent.clone(), revived);
                work.push(parent);
            }
        }
    }
    Ok(())
}

/// True when the pick leaves an entry at the path.
fn kept(
    resolver: &mut Resolver<'_>,
    picks: &BTreeMap<String, Pick>,
    path: &str,
) -> ContentResult<bool> {
    Ok(match picks.get(path) {
        Some(Pick::Keep) | None => resolver.entry(THEIRS, path)?.is_some(),
        Some(Pick::Absent) => false,
        Some(_) => true,
    })
}
