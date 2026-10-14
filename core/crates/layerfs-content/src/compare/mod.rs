//! Comparison of immutable roots and bounded texts.
//!
//! Entry module: declarations and re-exports only.

pub mod sorted;
pub mod text;
pub mod tree;

pub use sorted::DifferenceWork;
pub use text::{
    as_text, line_diff, lines, match_lines, DiffLine, LineOp, MAXIMUM_DIFF_CELLS,
    MAXIMUM_TEXT_BYTES,
};
pub use tree::{
    binding_changes, inode_changes, list_directory, locate, root_changes, same_value, subtree,
    ChangeKind, EntryFacts, PathChange, RootChanges, TreeTable,
};
