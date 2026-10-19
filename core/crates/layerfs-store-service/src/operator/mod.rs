//! Operator Store calls: Store and file statistics and the read model.
pub mod files;
pub mod inspect;
pub mod store;
pub use inspect::{snapshot, WorkspaceView};

use crate::StoreService;
use layerfs_bridge::control::{SdkCall, SdkRefusal, SdkValue};

/// Runs one operator Store call once. The read model
/// (`operator.inspect.snapshot`) lists a daemon's Workspaces and is the
/// daemon's call.
pub fn dispatch(service: &StoreService, call: &SdkCall) -> Result<SdkValue, SdkRefusal> {
    match call.method.as_str() {
        "operator.store.stats" => store::stats(&service.store),
        "operator.store.commits" => store::commits(&service.store, &call.args),
        "operator.store.overwritten" => store::overwritten(&service.store, &call.args),
        "operator.files.stats" => files::stats(&service.store, &call.args),
        "operator.files.history" => files::history(&service.store, &call.args),
        method => Err(SdkRefusal {
            code: "UnknownMethod".into(),
            message: format!("no operator Store method {method}"),
            detail: SdkValue::Null,
        }),
    }
}
