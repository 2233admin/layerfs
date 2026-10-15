//! Node entry points for the public SDK and internal operator.
mod convert;
mod dispatch;
mod exec;
mod job;
mod project;
mod registry;
mod sandbox;

use job::Job;
use napi::{bindgen_prelude::AsyncTask, JsUnknown};
use napi_derive::napi;

/// Runs one public SDK operation once on the native worker pool.
#[napi]
pub fn call(op: String, args: JsUnknown) -> napi::Result<AsyncTask<Job>> {
    dispatch::call(op, args)
}

/// Runs one internal operator operation on its separate method table.
#[napi]
pub fn operator_call(op: String, args: JsUnknown) -> napi::Result<AsyncTask<Job>> {
    dispatch::operator_call(op, args)
}
