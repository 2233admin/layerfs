//! Internal operator method admission.
use crate::{internal::Control, SdkError, SdkResult};
use layerfs_bridge::control::{SdkRefusal, SdkValue};

/// Calls one daemon operator method: its Workspaces and the read model that
/// lists them. Operator Store calls run in the caller's process.
pub fn call(control: &mut Control, method: &str, args: SdkValue) -> SdkResult {
    if !matches!(
        method,
        "operator.inspect.snapshot" | "operator.workspace.overlay" | "operator.workspace.changes"
    ) {
        return Err(SdkError::Refused(SdkRefusal {
            code: "UnknownMethod".into(),
            message: format!("no operator method {method}"),
            detail: SdkValue::Null,
        }));
    }
    crate::base::sdk::exchange_call(control, method, args)
}
