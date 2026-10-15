//! Admission to the internal daemon operator method table.
use crate::control::Service;
use layerfs_bridge::control::{Reply, SdkCall, SdkRefusal, SdkValue};

pub(crate) fn dispatch(service: &Service, call: &SdkCall) -> Reply {
    match call.method.as_str() {
        "operator.inspect.snapshot" => service.inspect(call),
        method => Reply::SdkRefused(SdkRefusal {
            code: "UnknownMethod".into(),
            message: format!("no operator method {method}"),
            detail: SdkValue::Null,
        }),
    }
}
