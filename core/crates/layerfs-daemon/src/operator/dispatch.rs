//! Admission to the internal daemon operator method table.
use crate::control::Service;
use layerfs_bridge::control::{Reply, SdkCall, SdkRefusal, SdkValue};

pub(crate) fn dispatch(service: &Service, call: &SdkCall) -> Reply {
    let answer = match call.method.as_str() {
        "operator.workspace.overlay" => super::workspace::overlay(service, &call.args),
        "operator.workspace.changes" => super::workspace::changes(service, &call.args),
        "operator.inspect.snapshot" => return service.inspect(call),
        "operator.store.stats" => super::store::stats(&service.store),
        "operator.store.commits" => super::store::commits(&service.store, &call.args),
        "operator.files.stats" => super::files::stats(&service.store, &call.args),
        "operator.files.history" => super::files::history(&service.store, &call.args),
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
