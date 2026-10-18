//! The SDK call channel: one daemon function per JavaScript method that is
//! not a Workspace control operation.
//!
//! Entry module: declarations and the method table.
pub mod args;
pub mod body;
pub use body::Bodies;
pub mod blame;
pub mod branch;
pub mod cached;
pub mod compare;
pub mod files;
pub mod plans;
pub mod reads;
pub mod search;
pub mod snapshot;
pub mod walk;
pub mod window;

pub use args::hex;

pub mod dispatch;
pub use dispatch::dispatch;

pub mod edit;
pub mod mutation;
pub mod recursive;
