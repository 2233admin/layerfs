//! Admission to the daemon's operator method table: its Workspaces and the
//! read model that lists them. Operator Store calls are unknown here.
use crate::control::Service;
use layerfs_bridge::control::{Reply, SdkCall, SdkRefusal, SdkValue};

pub(crate) fn dispatch(service: &Service, call: &SdkCall) -> Reply {
    let answer = match call.method.as_str() {
        "operator.workspace.overlay" => super::workspace::overlay(service, &call.args),
        "operator.workspace.changes" => super::workspace::changes(service, &call.args),
        "operator.inspect.snapshot" => return service.inspect(call),
        method => Err(SdkRefusal {
            code: "UnknownMethod".into(),
            message: format!("no operator method {method}"),
            detail: SdkValue::Null,
        }),
    };
    match answer {
        Ok(value) => Reply::Sdk(value),
        Err(error) => Reply::SdkRefused(error),
    }
}
