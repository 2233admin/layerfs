//! The merged root: the decided paths applied to one side in one update.
//!
//! That side is the base of a single backed update, so the merged root is
//! built by the same canonical producer, on the same route, as a Workspace
//! Commit: its validation and reference state lives in the merge's records.
//! A path decided `Keep` costs nothing. A directory taken from ours that the
//! side does not hold at that path is a new directory whose bindings are
//! exactly the kept paths below it. A file value keeps its serial when the
//! serial is new to the side, already holds that value there, or is changed
//! in place at its only binding; otherwise the value gets a fresh serial from
//! the caller's allocator, so one serial never carries two values.
//!
//! The picks are read in ascending path order (#355). Each path's result and
//! its parent's are on an ancestor stack whose entries prefix the path being
//! placed, so it is bounded by path length; a directory's changed names are
//! written in chunks while it is on the stack, and values, fresh serials and
//! assignments are point records.

use layerfs_telemetry::timer::{Active, TimingScope};

use super::codec::{read_decided, Decided};
use super::decide::{split, Pick, Resolver, OURS, THEIRS};
use super::rows::{ChangeWriter, PlanCounts, PlanRows};
use super::spill::{single, Run, RunReader, Spill, ASSIGNED, FRESH, VALUE};
use crate::compare::tree::{same_value, EntryFacts};
use crate::error::{ContentError, ContentResult};
use crate::filesystem::path::PathName;
use crate::filesystem::update::update_filesystem_streamed_backed;
use crate::filesystem::{FilesystemObjects, FilesystemRootId};
use crate::object::inode_leaf::{
    decode_inode_value, encode_inode_value, InodeKind, InodeValue, INODE_VALUE_BYTES,
};
use crate::object::{FinalizedConsumer, FinalizedObject, ObjectId};
use crate::policy::{ConstructionCapacities, ConstructionPolicy};

/// Construction inputs of the merged files and root.
pub(super) struct Writer<'a> {
    pub(super) policy: ConstructionPolicy,
    pub(super) capacities: &'a ConstructionCapacities,
    pub(super) fresh: &'a mut dyn FnMut() -> ContentResult<u64>,
    pub(super) timing: &'a TimingScope<'a, Active>,
}

/// Result serial at one path, and whether it is a directory built from
/// nothing (all of its bindings come from the decided paths below it).
#[derive(Clone, Copy)]
struct Placed {
    serial: u64,
    directory: bool,
    built: bool,
}

/// One path on the ancestor stack: its result and, for a directory with
/// changed names, their writer.
struct Frame {
    path: String,
    placed: Option<Placed>,
    changes: Option<ChangeWriter>,
}

/// The plan's point records and totals.
struct Plan<'s, 'r> {
    spill: &'s Spill<'r>,
    counts: PlanCounts,
    /// Source serials with an assignment record, approximately: a serial it
    /// does not hold has none, so most lookups need no read.
    assigned: Filter,
}

/// A fixed-size Bloom filter of serials.
struct Filter(Vec<u64>);

/// Bits of [`Filter`]: a constant memory at any merge size.
const FILTER_BITS: u64 = 1 << 23;

impl Filter {
    fn new() -> Self {
        Self(vec![0; (FILTER_BITS / 64) as usize])
    }

    fn bits(serial: u64) -> [u64; 3] {
        let mut x = serial;
        [0; 3].map(|_| {
            // splitmix64
            x = x.wrapping_add(0x9E37_79B9_7F4A_7C15);
            let mut z = x;
            z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
            z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
            (z ^ (z >> 31)) % FILTER_BITS
        })
    }

    fn add(&mut self, serial: u64) {
        for bit in Self::bits(serial) {
            self.0[(bit / 64) as usize] |= 1 << (bit % 64);
        }
    }

    fn may_hold(&self, serial: u64) -> bool {
        Self::bits(serial)
            .iter()
            .all(|bit| self.0[(bit / 64) as usize] & (1 << (bit % 64)) != 0)
    }
}

/// Applies the picks to the `into` side; that side itself when nothing
/// changes. `Keep` means the `into` side's entry (see [`onto_ours`]).
pub(super) fn build(
    objects: &mut FilesystemObjects<'_>,
    resolver: &mut Resolver<'_>,
    (decided, revived): (Run, Run),
    into: usize,
    spill: &Spill<'_>,
    writer: &mut Writer<'_>,
) -> ContentResult<FilesystemRootId> {
    let theirs = resolver.trees[into];
    let mut plan = Plan {
        spill,
        counts: PlanCounts::default(),
        assigned: Filter::new(),
    };
    let mut stack: Vec<Frame> = Vec::new();
    let mut picks = Picks {
        decided: RunReader::new(decided, false),
        // Written in descending order; read backward, it ascends.
        revived: RunReader::new(revived, true),
        heads: [None, None],
    };
    while let Some(Decided { path, pick, here }) = picks.next(spill)? {
        let pick = if into == OURS {
            onto_ours(resolver, &path, pick)?
        } else {
            pick
        };
        close_frames(&mut stack, &mut plan, &path)?;
        let t = here;
        let result = match pick {
            Pick::Keep => t.map(|entry| Placed {
                serial: entry.serial,
                directory: entry.value.kind == InodeKind::Directory,
                built: false,
            }),
            Pick::Absent => None,
            Pick::Take(entry) if entry.value.kind == InodeKind::Directory => {
                let serial = if resolver.value(into, entry.serial)?.is_some() {
                    (writer.fresh)()?
                } else {
                    entry.serial
                };
                plan.fresh(serial)?;
                plan.value(
                    serial,
                    InodeValue {
                        // Content rebuilds the page from this directory's
                        // bindings and replaces the zero identity.
                        content_root: ObjectId::from_bytes(&[0; 32])?,
                        namespace_ref_count: 1,
                        ..entry.value
                    },
                )?;
                Some(Placed {
                    serial,
                    directory: true,
                    built: true,
                })
            }
            Pick::Take(entry) => Some(Placed {
                serial: plan.assign(resolver, into, writer, entry.serial, entry.value, t)?,
                directory: false,
                built: false,
            }),
            Pick::Write { like, text } => {
                let file = crate::file::construct_bytes(
                    writer.policy,
                    writer.capacities,
                    &spill.text(text)?,
                    &mut Emit(objects),
                    writer.timing.child("merge.write"),
                )?;
                let value = InodeValue {
                    kind: InodeKind::RegularFile,
                    content_root: file.root,
                    ..like.value
                };
                Some(Placed {
                    serial: plan.assign(resolver, into, writer, like.serial, value, t)?,
                    directory: false,
                    built: false,
                })
            }
        };
        if path != "/" {
            let (parent, name) = split(&path);
            // A parent decided absent, or not a directory, drops this subtree.
            let index = place(&mut stack, resolver, into, parent)?;
            let parent_placed = stack[index].placed.filter(|parent| parent.directory);
            if let Some(parent_placed) = parent_placed {
                let now = result.map(|placed| placed.serial);
                let was = if parent_placed.built {
                    None
                } else {
                    t.map(|entry| entry.serial)
                };
                if now != was {
                    stack[index]
                        .changes
                        .get_or_insert_with(|| ChangeWriter::new(parent_placed.serial))
                        .push(spill, &PathName::new(name)?, now)?;
                }
            }
        }
        let changes = result
            .filter(|placed| placed.built)
            .map(|placed| ChangeWriter::new(placed.serial));
        stack.push(Frame {
            path,
            placed: result,
            changes,
        });
    }
    close_frames(&mut stack, &mut plan, "")?;
    if plan.counts.headers == 0 && plan.counts.values == 0 {
        return Ok(resolver.roots[into]);
    }
    plan.rank()?;
    let input = PlanRows::new(
        spill,
        resolver.roots[into],
        theirs.root.scope(),
        theirs.root_serial(),
        plan.counts,
    );
    let mut records = spill.backing();
    Ok(writer
        .timing
        .child("merge.update")
        .run(|_| update_filesystem_streamed_backed(objects, &input, &mut records, None))?
        .root)
}

/// The decided picks in path order, with revival's changes and additions in
/// place of or among them.
struct Picks {
    decided: RunReader,
    revived: RunReader,
    heads: [Option<Decided>; 2],
}

impl Picks {
    fn next(&mut self, spill: &Spill<'_>) -> ContentResult<Option<Decided>> {
        for (head, reader) in self
            .heads
            .iter_mut()
            .zip([&mut self.decided, &mut self.revived])
        {
            if head.is_none() {
                *head = reader
                    .next(spill)?
                    .map(|entry| read_decided(&entry))
                    .transpose()?;
            }
        }
        let order = match &self.heads {
            [Some(decided), Some(revived)] => Some(decided.path.cmp(&revived.path)),
            _ => None,
        };
        Ok(match order {
            Some(std::cmp::Ordering::Less) => self.heads[0].take(),
            Some(std::cmp::Ordering::Equal) => {
                self.heads[0] = None;
                self.heads[1].take()
            }
            Some(std::cmp::Ordering::Greater) => self.heads[1].take(),
            None => self.heads[0].take().or_else(|| self.heads[1].take()),
        })
    }
}

/// Pops the frames that do not prefix `path`, writing their changed names.
fn close_frames(stack: &mut Vec<Frame>, plan: &mut Plan<'_, '_>, path: &str) -> ContentResult<()> {
    while stack
        .last()
        .is_some_and(|frame| !path.starts_with(frame.path.as_str()))
    {
        let frame = stack.pop().expect("frame");
        if let Some(changes) = frame.changes {
            changes.finish(plan.spill, &mut plan.counts)?;
        }
    }
    Ok(())
}

/// The stack index of `path`'s result: its pick's, or for an unpicked path
/// the `into` side's below a surviving parent directory. An unpicked result
/// is pushed in its place among the frames, all of which prefix the path
/// being placed.
fn place(
    stack: &mut Vec<Frame>,
    resolver: &mut Resolver<'_>,
    into: usize,
    path: &str,
) -> ContentResult<usize> {
    if let Some(index) = stack.iter().rposition(|frame| frame.path == path) {
        return Ok(index);
    }
    let up = if path == "/" {
        true
    } else {
        let parent = place(stack, resolver, into, split(path).0)?;
        stack[parent].placed.is_some_and(|up| up.directory)
    };
    let placed = if up {
        resolver.entry(into, path)?.map(|entry| Placed {
            serial: entry.serial,
            directory: entry.value.kind == InodeKind::Directory,
            built: false,
        })
    } else {
        None
    };
    let index = stack.partition_point(|frame| frame.path.len() < path.len());
    stack.insert(
        index,
        Frame {
            path: path.to_owned(),
            placed,
            changes: None,
        },
    );
    Ok(index)
}

/// A pick restated for a build on ours: `Keep` (theirs' entry) becomes taking
/// it unless ours holds the same entry there, and taking ours' own entry at
/// its own path becomes `Keep`.
fn onto_ours(resolver: &mut Resolver<'_>, path: &str, pick: Pick) -> ContentResult<Pick> {
    let o = resolver.entry(OURS, path)?;
    let held = |entry: EntryFacts| {
        o.is_some_and(|o| {
            o.serial == entry.serial && same_value(&o.value, &entry.value)
                || o.value.kind == InodeKind::Directory && entry.value.kind == InodeKind::Directory
        })
    };
    Ok(match pick {
        Pick::Keep => match resolver.entry(THEIRS, path)? {
            None if o.is_none() => Pick::Keep,
            None => Pick::Absent,
            Some(t) if held(t) => Pick::Keep,
            Some(t) => Pick::Take(t),
        },
        Pick::Take(entry) if held(entry) => Pick::Keep,
        other => other,
    })
}

/// Emits constructed file objects through the operation's own boundary.
struct Emit<'x, 'y>(&'x mut FilesystemObjects<'y>);

impl FinalizedConsumer for Emit<'_, '_> {
    fn accept(&mut self, object: FinalizedObject) -> ContentResult<()> {
        self.0.emit(object).map(|_| ())
    }
}

fn assigned_entries(bytes: &[u8]) -> ContentResult<Vec<(InodeValue, u64)>> {
    bytes
        .chunks(INODE_VALUE_BYTES + 8)
        .map(|chunk| {
            if chunk.len() != INODE_VALUE_BYTES + 8 {
                return Err(ContentError::InvalidRecord("merge assignment"));
            }
            let serial = u64::from_be_bytes(chunk[..8].try_into().expect("eight bytes"));
            Ok((decode_inode_value(&chunk[8..])?, serial))
        })
        .collect()
}

impl Plan<'_, '_> {
    /// Final value of a serial.
    fn value(&mut self, serial: u64, value: InodeValue) -> ContentResult<()> {
        let key = single(serial);
        let bytes = encode_inode_value(value).to_vec();
        match self.spill.get(VALUE, key)? {
            None => {
                self.counts.values += 1;
                self.spill.insert(VALUE, key, bytes)
            }
            Some(old) => self.spill.replace(VALUE, key, old, bytes),
        }
    }

    /// A serial new to the `into` side; its rank is written by [`Self::rank`].
    fn fresh(&mut self, serial: u64) -> ContentResult<()> {
        if self.spill.get(FRESH, single(serial))?.is_none() {
            self.counts.fresh += 1;
            self.spill.insert(FRESH, single(serial), Vec::new())?;
        }
        Ok(())
    }

    /// Writes each fresh serial's rank in serial order.
    fn rank(&mut self) -> ContentResult<()> {
        let mut rank = 0u64;
        let mut after = None;
        loop {
            let keys = self.spill.keys_after(FRESH, after)?;
            let Some(last) = keys.last() else {
                return Ok(());
            };
            after = Some(*last);
            for key in keys {
                self.spill
                    .replace(FRESH, key, Vec::new(), rank.to_be_bytes().to_vec())?;
                rank += 1;
            }
        }
    }

    /// The serial that carries `value` for the source serial `source`.
    fn assign(
        &mut self,
        resolver: &Resolver<'_>,
        into: usize,
        writer: &mut Writer<'_>,
        source: u64,
        value: InodeValue,
        here: Option<EntryFacts>,
    ) -> ContentResult<u64> {
        let stored = if self.assigned.may_hold(source) {
            self.spill.get(ASSIGNED, single(source))?
        } else {
            None
        };
        let given = stored
            .as_deref()
            .map(assigned_entries)
            .transpose()?
            .unwrap_or_default();
        if let Some((_, serial)) = given.iter().find(|(held, _)| same_value(held, &value)) {
            return Ok(*serial);
        }
        let first = given.is_empty();
        let serial = match resolver.value(into, source)? {
            _ if !first => None,
            None => {
                self.fresh(source)?;
                Some(source)
            }
            Some(held) if same_value(&held, &value) => {
                self.record(source, stored, value, source)?;
                return Ok(source);
            }
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
                if resolver.value(into, fresh)?.is_some()
                    || self.spill.get(VALUE, single(fresh))?.is_some()
                {
                    return Err(ContentError::InvalidRecord("merge fresh serial"));
                }
                self.fresh(fresh)?;
                fresh
            }
        };
        self.value(serial, value)?;
        self.record(source, stored, value, serial)?;
        Ok(serial)
    }

    /// Adds one assignment to a source serial's record.
    fn record(
        &mut self,
        source: u64,
        stored: Option<Vec<u8>>,
        value: InodeValue,
        serial: u64,
    ) -> ContentResult<()> {
        self.assigned.add(source);
        let mut bytes = stored.clone().unwrap_or_default();
        bytes.extend_from_slice(&serial.to_be_bytes());
        bytes.extend_from_slice(&encode_inode_value(value));
        match stored {
            None => self.spill.insert(ASSIGNED, single(source), bytes),
            Some(old) => self.spill.replace(ASSIGNED, single(source), old, bytes),
        }
    }
}
