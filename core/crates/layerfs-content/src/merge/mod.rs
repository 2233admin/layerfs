//! Three-way merge of immutable roots, conflict markers and `.lww` rules.
//!
//! Entry module: declarations and re-exports only.

mod build;
mod codec;
mod decide;
mod entry;
pub mod lww;
pub mod markers;
mod names;
mod places;
mod rows;
mod serial;
mod spill;
pub mod text;
mod types;

pub use entry::merge_roots;
pub use lww::{Rule, Rules};
pub use markers::paths_with_markers;
pub use text::{has_markers, merge3, Hunk, TextMerge};
pub use types::{Conflict, ConflictKind, LwwDecision, MergeInput, MergeOutcome, RulesFrom, Side};
