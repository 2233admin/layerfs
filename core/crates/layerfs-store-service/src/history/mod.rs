//! Branch history over the global Store: typed fork, merge, publish and
//! listings, and the lookups and refusals the Store calls share.
pub mod branch;
pub mod lookup;
mod units;

/// The name of the project's line of Layers.
pub const MAIN: &str = "main";
