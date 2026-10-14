//! Responsibility-scoped implementation modules and reexports.
pub(crate) mod backing;
mod captured_namespace_port;
mod captured_run_port;
mod file_port;
mod kernel_operations;
mod lifetime_operations;
mod operation_record_port;
pub(crate) mod owner;
mod read_operations;
pub(crate) mod read_port;
mod scopes;
pub(crate) mod state;
pub(crate) mod workspaces;
