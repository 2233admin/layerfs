//! The SDK call channel: one daemon function per JavaScript method that is
//! not a Workspace control operation.
//!
//! Entry module: declarations and the method table.
pub(crate) mod args;
mod blame;
pub(crate) mod branch;
mod compare;
pub(crate) mod files;
mod reads;
pub(crate) mod snapshot;
pub(crate) mod window;

pub(crate) use args::hex;

mod dispatch;
pub(crate) use dispatch::dispatch;

mod edit;
mod mutation;
mod recursive;
