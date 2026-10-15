//! Internal operator dispatch, separate from the public SDK method table.
mod dispatch;
mod inspect;
pub(crate) use dispatch::dispatch;
pub(crate) use inspect::{snapshot, WorkspaceView};

pub(crate) mod files;
mod store;
mod workspace;
