//! Store calls over the global Store, in the process that calls them.
//!
//! The SDK's fs, branch, project and operator Store calls run here, in the
//! SDK's own process, against the Store it opened (`StoreService`); this is
//! their only route (#352 F-020). The daemon uses the same `store` and
//! `overlay` for its Workspace Commits. This crate has no FUSE, socket or
//! Sandbox. Each Workspace owns one overlay connection behind one lock; a
//! caller runs its own short typed call under it and keeps exact failure
//! custody.
#![forbid(unsafe_code)]

pub mod bootstrap;
pub mod kernel_guard;
pub mod operator;
pub mod overlay;
pub mod sdk;
pub mod service;
pub mod store;
mod store_service;
pub mod telemetry;

pub use overlay::owner;
pub use owner::{OriginalInput, Owner, OwnerClient, OwnerConfig, OwnerError, WorkspacePanic};
pub use service::observations::JobWork;
pub use service::owner_work::OwnerWork;
pub use service::results::ServiceClass;
pub use service::startup::OwnerStart;
pub use store_service::{OpenRefusal, Retained, StoreService, CALLS};
