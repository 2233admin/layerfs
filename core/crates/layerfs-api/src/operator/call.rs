//! Internal operator method admission.
use crate::{internal::Control, SdkError, SdkResult};
use layerfs_bridge::control::{SdkRefusal, SdkValue};

/// Calls one internal operator method, without admitting public SDK names.
pub fn call(control: &mut Control, method: &str, args: SdkValue) -> SdkResult {
    if method != "operator.inspect.snapshot" {
        return Err(SdkError::Refused(SdkRefusal {
            code: "UnknownMethod".into(),
            message: format!("no operator method {method}"),
            detail: SdkValue::Null,
        }));
    }
    crate::base::sdk::exchange_call(control, method, args)
}
