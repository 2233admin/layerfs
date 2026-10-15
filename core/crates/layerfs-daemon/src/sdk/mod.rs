//! The SDK call channel: one daemon function per JavaScript method that is
//! not a Workspace control operation.
//!
//! Entry module: declarations and the method table.
pub(crate) mod args;
mod blame;
pub(crate) mod branch;
mod compare;
mod files;
mod reads;
mod snapshot;

pub(crate) use args::hex;

mod dispatch;
pub(crate) use dispatch::dispatch;
