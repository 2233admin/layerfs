//! The path-change request, its refusals and the entry point.

use std::collections::BTreeMap;

use layerfs_telemetry::timer::{Active, TimingScope};

use super::{build, draft::Draft};
use crate::compare::tree::TreeTable;
use crate::error::ContentResult;
use crate::filesystem::{FilesystemObjects, FilesystemRootId};
use crate::object::{AuthenticatedObjects, FinalizedConsumer};
use crate::policy::{ConstructionCapacities, ConstructionPolicy};

/// Paths one change list may draft, copies included.
pub const MAXIMUM_DRAFT_PATHS: usize = 1 << 16;

/// One path change. Paths are absolute.
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PathOp {
    /// Create or replace a file's bytes.
    Write {
        /// File path.
        path: String,
        /// New bytes.
        bytes: Vec<u8>,
    },
    /// Replace text in a file: the one match, or every match with `all`.
    Edit {
        /// File path.
        path: String,
        /// Text to find; it must occur.
        old: String,
        /// Replacement.
        new: String,
        /// Replace every match instead of requiring exactly one.
        all: bool,
    },
    /// Create a directory, and with `recursive` its missing parents.
    Mkdir {
        /// Directory path.
        path: String,
        /// Create parents; an existing directory is then no error.
        recursive: bool,
    },
    /// Remove a path; a non-empty directory needs `recursive`.
    Remove {
        /// Path.
        path: String,
        /// Remove a non-empty directory.
        recursive: bool,
    },
    /// Copy a path; a directory needs `recursive`. Copies get fresh serials.
    Copy {
        /// Source.
        from: String,
        /// Target, which must not exist.
        to: String,
        /// Copy a directory.
        recursive: bool,
    },
    /// Move a path; inodes keep their serials.
    Move {
        /// Source.
        from: String,
        /// Target, which must not exist.
        to: String,
    },
}

/// The first invalid change; nothing was built.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PathRefusal {
    /// Stable code: `NoSuchPath`, `IsDirectory`, `NotDirectory`, `Exists`,
    /// `NotEmpty`, `NoMatch`, `AmbiguousMatch`, `InvalidMove`, `NotText`,
    /// `TooLarge` or `InvalidInput`.
    pub code: &'static str,
    /// The path the refusal is about.
    pub path: String,
    /// Matches found, for `AmbiguousMatch`.
    pub matches: Option<usize>,
}

/// One change list over one root.
pub struct PathsInput<'a> {
    /// Base root.
    pub root: FilesystemRootId,
    /// Changes, applied in order.
    pub ops: &'a [PathOp],
    /// Construction policy of written files.
    pub policy: ConstructionPolicy,
    /// Construction capacities of written files.
    pub capacities: &'a ConstructionCapacities,
    /// Modification time of written and created entries.
    pub time: (i64, u32),
}

/// Applies the changes in order and builds the result, or refuses the first
/// invalid change. `fresh` returns one never-exposed serial of the root's
/// scope per call; `reader` must read what `consumer` accepted.
pub fn apply_paths(
    reader: &dyn AuthenticatedObjects,
    consumer: &mut dyn FinalizedConsumer,
    input: &PathsInput<'_>,
    fresh: &mut dyn FnMut() -> ContentResult<u64>,
    timing: &TimingScope<'_, Active>,
) -> ContentResult<Result<FilesystemRootId, PathRefusal>> {
    let mut draft = Draft {
        reader,
        base: TreeTable::open(reader, input.root)?,
        entries: BTreeMap::new(),
        fresh,
        timing,
    };
    for op in input.ops {
        if let Err(refused) = draft.apply(op)? {
            return Ok(Err(refused));
        }
    }
    let mut objects = FilesystemObjects::new_with_accepted(reader, consumer, reader);
    build::build(
        &draft,
        input.root,
        &mut objects,
        input.policy,
        input.capacities,
        input.time,
    )
    .map(Ok)
}
