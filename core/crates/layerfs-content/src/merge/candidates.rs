//! Every path whose entry may differ between the base and the `from` side,
//! streamed into sorted runs (#355).
//!
//! Only a path whose entry `from` changed can differ from the other side in
//! the result. The changed inodes come from the page-skipping inode
//! difference; each changed directory contributes its changed names, with the
//! whole subtree below a name it bound or unbound, and each file changed in
//! place contributes its own path. Changed inodes are named a window of
//! [`NAMING_WINDOW`] at a time, from recorded bindings when they name the
//! whole window and otherwise by the breadth-first walk; each inode's path is
//! the same either way. Paths go to a [`Sorter`], so no total of the merge is
//! held in memory, and a subtree is walked with a spilled stack.

use std::collections::BTreeSet;

use layerfs_telemetry::timer::{Active, TimingScope};

use super::decide::{Resolver, BASE};
use super::spill::{Merge, Sorter, Spill, SpillStack};
use crate::compare::tree::{
    binding_changes, inode_changes, join, list_directory, locate, TreeTable,
};
use crate::compare::{BindingHints, DifferenceWork, NamingWork};
use crate::error::{ContentError, ContentResult};
use crate::object::inode_leaf::{InodeKind, InodeValue};
use crate::object::AuthenticatedObjects;

/// Changed inodes named together.
pub(super) const NAMING_WINDOW: usize = 4096;
/// Listed children whose values are read together.
const VALUE_BATCH: usize = 256;

/// Where candidate paths go, and the caller's bound on them.
struct Out<'s, 'r> {
    spill: &'s Spill<'r>,
    sorter: Sorter,
    /// The caller's bound and the distinct paths so far, kept only under it.
    bound: Option<(usize, BTreeSet<String>)>,
}

fn exceeded(limit: usize, actual: usize) -> ContentError {
    ContentError::BoundedCapacityExceeded {
        what: "merge.bound",
        limit: limit as u64,
        actual: actual as u64,
    }
}

impl Out<'_, '_> {
    fn emit(&mut self, path: String) -> ContentResult<()> {
        if let Some((limit, seen)) = &mut self.bound {
            seen.insert(path.clone());
            if seen.len() > *limit {
                return Err(exceeded(*limit, seen.len()));
            }
        }
        self.sorter.push(self.spill, path.into_bytes())
    }
}

/// The trees and outputs one naming window needs.
struct Naming<'a, 's, 'r> {
    reader: &'a dyn AuthenticatedObjects,
    hints: Option<&'a dyn BindingHints>,
    base: TreeTable,
    side: TreeTable,
    out: Out<'s, 'r>,
    naming: &'a mut NamingWork,
    work: DifferenceWork,
    hinted: bool,
}

/// The candidate paths in byte order, once each, and whether recorded
/// bindings named every changed inode. With `bound`, a merge with more
/// changed inodes or paths is refused `merge.bound` as soon as it has more.
#[allow(clippy::too_many_arguments)]
pub(super) fn candidates(
    resolver: &Resolver<'_>,
    from: usize,
    bound: Option<usize>,
    hints: Option<&dyn BindingHints>,
    work: &mut DifferenceWork,
    naming: &mut NamingWork,
    spill: &Spill<'_>,
    timing: &TimingScope<'_, Active>,
) -> ContentResult<(Merge, bool)> {
    let reader = resolver.reader;
    let mut state = Naming {
        reader,
        hints,
        base: resolver.trees[BASE],
        side: resolver.trees[from],
        out: Out {
            spill,
            sorter: Sorter::new(),
            bound: bound.map(|limit| (limit, BTreeSet::new())),
        },
        naming,
        work: DifferenceWork::default(),
        hinted: true,
    };
    let mut window = Vec::new();
    let mut changed = 0usize;
    let (base, side) = (state.base, state.side);
    timing.child("merge.changes").run(|scope| {
        inode_changes(reader, &base, &side, work, |serial, b, o| {
            let (Some(b), Some(o)) = (b, o) else {
                return Ok(());
            };
            changed += 1;
            if let Some(limit) = bound.filter(|limit| changed > *limit) {
                return Err(exceeded(limit, changed));
            }
            window.push((serial, *b, *o));
            if window.len() == NAMING_WINDOW {
                state.window(std::mem::take(&mut window), scope)?;
            }
            Ok(())
        })?;
        if !window.is_empty() {
            state.window(std::mem::take(&mut window), scope)?;
        }
        Ok::<_, ContentError>(())
    })?;
    work.add(state.work);
    let hinted = state.hinted && hints.is_some();
    Ok((state.out.sorter.finish(spill)?, hinted))
}

impl Naming<'_, '_, '_> {
    /// Names one window of changed inodes and emits their paths.
    fn window(
        &mut self,
        changed: Vec<(u64, InodeValue, InodeValue)>,
        timing: &TimingScope<'_, Active>,
    ) -> ContentResult<()> {
        let reader = self.reader;
        let wanted = changed
            .iter()
            .map(|(serial, _, _)| *serial)
            .collect::<BTreeSet<_>>();
        // The trace shows which naming ran: `merge.named` (recorded bindings),
        // and `merge.locate` only when they could not name every inode (#352).
        let hinted = match self.hints {
            Some(hints) => timing.child("merge.named").run(|_| {
                let named = crate::compare::name_from_hints;
                Ok::<_, ContentError>(
                    match named(reader, hints, &self.side, &wanted, self.naming)? {
                        Some(in_side) => named(reader, hints, &self.base, &wanted, self.naming)?
                            .map(|in_base| (in_side, in_base)),
                        None => None,
                    },
                )
            })?,
            None => None,
        };
        self.hinted &= hinted.is_some();
        let (in_side, in_base) = match hinted {
            Some(found) => found,
            None => timing.child("merge.locate").run(|_| {
                Ok::<_, ContentError>((
                    locate(reader, &self.side, &wanted, usize::MAX)?,
                    locate(reader, &self.base, &wanted, usize::MAX)?,
                ))
            })?,
        };
        if in_side.len() < wanted.len() || in_base.len() < wanted.len() {
            return Err(ContentError::InvalidRecord(
                "merge changed inode without a path",
            ));
        }
        for (serial, b, o) in changed {
            let paths = [&in_base[&serial], &in_side[&serial]];
            if b.kind != InodeKind::Directory || o.kind != InodeKind::Directory {
                for path in paths {
                    self.out.emit(path.clone())?;
                }
                continue;
            }
            let mut names = Vec::new();
            binding_changes(
                reader,
                Some(b.content_root),
                Some(o.content_root),
                &mut self.work,
                |name, was, now| {
                    names.push((name.clone(), was, now));
                    Ok(())
                },
            )?;
            for (name, was, now) in names {
                for path in paths {
                    self.out.emit(join(path, &name))?;
                }
                for (index, tree, bound) in [(0, self.base, was), (1, self.side, now)] {
                    let Some(child) = bound else { continue };
                    if tree.value(reader, child)?.map(|value| value.kind)
                        == Some(InodeKind::Directory)
                    {
                        subtree(
                            reader,
                            &tree,
                            &join(paths[index], &name),
                            child,
                            &mut self.out,
                        )?;
                    }
                }
            }
        }
        Ok(())
    }
}

fn frame(serial: u64, path: &str) -> Vec<u8> {
    let mut out = Vec::with_capacity(8 + path.len());
    out.extend_from_slice(&serial.to_be_bytes());
    out.extend_from_slice(path.as_bytes());
    out
}

fn unframe(bytes: &[u8]) -> ContentResult<(u64, String)> {
    let malformed = || ContentError::InvalidRecord("merge stack entry");
    let (serial, path) = bytes.split_at_checked(8).ok_or_else(malformed)?;
    Ok((
        u64::from_be_bytes(serial.try_into().map_err(|_| malformed())?),
        String::from_utf8(path.to_vec()).map_err(|_| malformed())?,
    ))
}

/// Emits every path below one directory, depth first, with the pending
/// directories on a spilled stack and children valued a batch at a time.
fn subtree(
    reader: &dyn AuthenticatedObjects,
    tree: &TreeTable,
    path: &str,
    directory: u64,
    out: &mut Out<'_, '_>,
) -> ContentResult<()> {
    let spill = out.spill;
    let mut stack = SpillStack::new(spill);
    stack.push(spill, frame(directory, path))?;
    while let Some(entry) = stack.pop(spill)? {
        let (serial, path) = unframe(&entry)?;
        let Some(value) = tree.value(reader, serial)? else {
            return Err(ContentError::InvalidRecord("listed directory record"));
        };
        let mut batch = Vec::new();
        list_directory(reader, value.content_root, |name, child| {
            batch.push((join(&path, name), child));
            if batch.len() == VALUE_BATCH {
                emit_batch(reader, tree, &mut batch, &mut stack, out)?;
            }
            Ok(true)
        })?;
        emit_batch(reader, tree, &mut batch, &mut stack, out)?;
    }
    Ok(())
}

fn emit_batch(
    reader: &dyn AuthenticatedObjects,
    tree: &TreeTable,
    batch: &mut Vec<(String, u64)>,
    stack: &mut SpillStack,
    out: &mut Out<'_, '_>,
) -> ContentResult<()> {
    let serials = batch.iter().map(|(_, serial)| *serial).collect::<Vec<_>>();
    let values = tree.values(reader, &serials)?;
    for ((path, serial), value) in batch.drain(..).zip(values) {
        let value = value.ok_or(ContentError::InvalidRecord("bound inode record"))?;
        if value.kind == InodeKind::Directory {
            stack.push(out.spill, frame(serial, &path))?;
        }
        out.emit(path)?;
    }
    Ok(())
}
