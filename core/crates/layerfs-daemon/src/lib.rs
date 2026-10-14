//! Daemon service ownership. SQL stays in the independently usable overlay crate.
//!
//! Each Workspace owns one overlay connection behind one lock; a caller runs
//! its own short typed call under it and keeps exact failure custody and reply tickets.
//! Direct Store ports provide immutable data and conditional history transitions.
//! Control composes native Attach/Ready/unmount over the Fuse session owner;
//! command launch and supervision stay with the Sandbox or external executor.
#![forbid(unsafe_code)]

pub mod bootstrap;
pub mod install;
mod install_file;
pub mod install_types;
mod overlay;
mod service;
pub mod store;
pub(crate) use overlay::owner;

pub use owner::{OriginalInput, Owner, OwnerClient, OwnerConfig, OwnerError, WorkspacePanic};
pub use service::observations::JobWork;
pub use service::results::ServiceClass;
pub use service::startup::OwnerStart;

pub mod control;

pub mod application;
pub use service::owner_work::OwnerWork;
