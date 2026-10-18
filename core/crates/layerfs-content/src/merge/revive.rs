//! Revival of kept paths' parents, streamed in descending path order (#355).
//!
//! Every kept path's parent must be a directory in the result: a parent
//! decided absent is revived from theirs when theirs holds a directory there,
//! else from ours; a path below a parent that stays a file cannot be kept and
//! is dropped. An unpicked path holds what the `into` side holds.
//!
//! Only the picks it changes or adds are written out, for the build to read
//! over the decided run. The decided paths are visited from the last to the
//! first, and each
//! parent picked or revived on the way is settled at once, last in first
//! out. A path's own decision is final once it has been visited, since every
//! path below it sorts after it. So only paths picked or revived here and not
//! yet passed are held, and all of them prefix the path being visited: the
//! held set is bounded by path length, not by the merge. A decided parent not
//! yet reached is read from the point records the decide pass wrote for every
//! decided path with decided paths below it.

use std::collections::{BTreeMap, BTreeSet};

use super::codec::{decided, read_decided, Decided};
use super::decide::{split, Pick, Resolver, OURS, THEIRS};
use super::spill::{digest, Run, RunReader, RunWriter, Spill, ANCESTOR};
use crate::compare::tree::EntryFacts;
use crate::error::{ContentError, ContentResult};
use crate::object::inode_leaf::InodeKind;

/// The decided picks of one pass, as the original resident map saw them.
struct Picks<'s, 'r> {
    spill: &'s Spill<'r>,
    /// Picks set here and not yet written out.
    held: BTreeMap<String, Pick>,
    /// Of those, the paths that were not decided.
    inserted: BTreeSet<String>,
    /// The decided path being visited.
    visiting: Option<Decided>,
    /// The side the result is built on.
    into: usize,
}

impl Picks<'_, '_> {
    fn get(&self, path: &str) -> ContentResult<Option<Pick>> {
        if let Some(pick) = self.held.get(path) {
            return Ok(Some(pick.clone()));
        }
        if let Some(visiting) = &self.visiting {
            if visiting.path == path {
                return Ok(Some(visiting.pick.clone()));
            }
        }
        let Some(bytes) = self.spill.get(ANCESTOR, digest(path))? else {
            return Ok(None);
        };
        let stored = read_decided(&bytes)?;
        if stored.path != path {
            return Err(ContentError::InvalidRecord("merge ancestor digest"));
        }
        Ok(Some(stored.pick))
    }

    /// The entry `side` holds at `path`: the visited path's from its run
    /// entry, any other from the resolver.
    fn entry(
        &self,
        resolver: &mut Resolver<'_>,
        side: usize,
        path: &str,
    ) -> ContentResult<Option<EntryFacts>> {
        match &self.visiting {
            Some(visiting) if side == self.into && visiting.path == path => Ok(visiting.here),
            _ => resolver.entry(side, path),
        }
    }

    fn insert(&mut self, path: String, pick: Pick) -> ContentResult<()> {
        if self.get(&path)?.is_none() {
            self.inserted.insert(path.clone());
        }
        self.held.insert(path, pick);
        Ok(())
    }
}

/// Revives parents over the decided run and writes the picks it changed or
/// added as a run in descending path order; returns that run and the number
/// of picks with them. The decided run is left for the build.
pub(super) fn revive(
    resolver: &mut Resolver<'_>,
    decided_run: Run,
    into: usize,
    spill: &Spill<'_>,
) -> ContentResult<(Run, usize)> {
    let mut picks = Picks {
        spill,
        held: BTreeMap::new(),
        inserted: BTreeSet::new(),
        visiting: None,
        into,
    };
    let mut reader = RunReader::keeping(decided_run, true);
    let mut out = RunWriter::new(spill);
    let mut count = 0usize;
    while let Some(entry) = reader.next(spill)? {
        let visited = read_decided(&entry)?;
        emit_inserted(
            resolver,
            &mut picks,
            &mut out,
            &mut count,
            Some(&visited.path),
        )?;
        let path = visited.path.clone();
        picks.visiting = Some(visited);
        settle(resolver, &mut picks, path.clone(), into)?;
        let visited = picks.visiting.take().expect("visiting");
        if let Some(pick) = picks.held.remove(&path) {
            out.push(spill, &decided(&path, &pick, visited.here.as_ref())?)?;
        }
        count += 1;
    }
    emit_inserted(resolver, &mut picks, &mut out, &mut count, None)?;
    Ok((out.finish(spill)?, count))
}

/// Writes out the inserted paths after `above` (all when `None`), last first.
fn emit_inserted(
    resolver: &mut Resolver<'_>,
    picks: &mut Picks<'_, '_>,
    out: &mut RunWriter,
    count: &mut usize,
    above: Option<&str>,
) -> ContentResult<()> {
    while let Some(last) = picks.inserted.last() {
        if above.is_some_and(|above| last.as_str() <= above) {
            break;
        }
        let path = picks.inserted.pop_last().expect("last");
        let pick = picks
            .held
            .remove(&path)
            .ok_or(ContentError::InvalidRecord("merge inserted pick"))?;
        let here = resolver.entry(picks.into, &path)?;
        out.push(picks.spill, &decided(&path, &pick, here.as_ref())?)?;
        *count += 1;
    }
    Ok(())
}

/// Settles one path, and each parent it picks or revives, last in first out.
fn settle(
    resolver: &mut Resolver<'_>,
    picks: &mut Picks<'_, '_>,
    first: String,
    into: usize,
) -> ContentResult<()> {
    let mut work = vec![first];
    while let Some(path) = work.pop() {
        if path == "/" || !kept(resolver, picks, &path, into)? {
            continue;
        }
        let parent = split(&path).0.to_owned();
        let directory = |entry: Option<EntryFacts>| {
            entry.filter(|entry| entry.value.kind == InodeKind::Directory)
        };
        let current = match picks.get(&parent)? {
            None => {
                // An unpicked parent is the `into` side's; picking it makes
                // its own parents checked in turn.
                let entry = resolver.entry(into, &parent)?;
                if let Some(held) = entry {
                    let pick = if into == THEIRS {
                        Pick::Keep
                    } else {
                        Pick::Take(held)
                    };
                    picks.insert(parent.clone(), pick)?;
                    work.push(parent.clone());
                }
                entry
            }
            Some(Pick::Keep) => resolver.entry(THEIRS, &parent)?,
            Some(Pick::Absent) => None,
            Some(Pick::Take(entry)) => Some(entry),
            Some(Pick::Write { like, .. }) => Some(like),
        };
        match current {
            Some(entry) if entry.value.kind == InodeKind::Directory => {}
            Some(_) => {
                picks.insert(path, Pick::Absent)?;
            }
            None => {
                let revived = if directory(resolver.entry(THEIRS, &parent)?).is_some() {
                    Pick::Keep
                } else if let Some(entry) = directory(resolver.entry(OURS, &parent)?) {
                    Pick::Take(entry)
                } else {
                    picks.insert(path, Pick::Absent)?;
                    continue;
                };
                picks.insert(parent.clone(), revived)?;
                work.push(parent);
            }
        }
    }
    Ok(())
}

/// True when the pick leaves an entry at the path.
fn kept(
    resolver: &mut Resolver<'_>,
    picks: &Picks<'_, '_>,
    path: &str,
    into: usize,
) -> ContentResult<bool> {
    Ok(match picks.get(path)? {
        Some(Pick::Keep) => picks.entry(resolver, THEIRS, path)?.is_some(),
        None => picks.entry(resolver, into, path)?.is_some(),
        Some(Pick::Absent) => false,
        Some(_) => true,
    })
}
