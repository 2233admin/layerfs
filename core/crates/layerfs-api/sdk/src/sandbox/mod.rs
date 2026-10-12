//! Actual ordinary Sandbox lifecycle; independent from filesystem admission and drain.
mod close;
pub(crate) mod create;
pub use create::{ManagedSandbox, SandboxApi};
pub use create::{SandboxCause, SandboxCreate, SandboxFailure, SandboxPhase};
