//! Ordered path changes applied to one immutable root.
//!
//! Entry module: declarations and re-exports only.

mod build;
mod draft;
mod entry;

pub use entry::{apply_paths, PathOp, PathRefusal, PathsInput, MAXIMUM_DRAFT_PATHS};
