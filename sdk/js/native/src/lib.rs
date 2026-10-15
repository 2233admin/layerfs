//! Node binding for the LayerFS JavaScript SDK over the internal `layerfs-api`
//! library. Entry module: the one exported function and its method table.
//!
//! `call(op, args)` converts the arguments on the JavaScript thread, runs the
//! operation once on the worker pool and resolves `{ value }` or `{ refused }`.
mod convert;
mod exec;
mod job;
mod project;
mod registry;
mod sandbox;

use job::{refused, Job, Outcome};
use layerfs_bridge::control::SdkValue;
use napi::{bindgen_prelude::AsyncTask, JsUnknown};
use napi_derive::napi;

/// Runs one SDK operation; the Promise resolves `{ value }` or `{ refused }`.
#[napi]
pub fn call(op: String, args: JsUnknown) -> napi::Result<AsyncTask<Job>> {
    let args = convert::from_js(args)?;
    Ok(AsyncTask::new(Job::new(move || dispatch(&op, args))))
}

fn dispatch(op: &str, args: SdkValue) -> Outcome {
    match op {
        "project.init" => project::init(&args),
        "sandbox.create" => sandbox::create(&args),
        "sandbox.close" => sandbox::close(&args),
        "sandbox.mount" => sandbox::mount(&args),
        "sandbox.status" => sandbox::status(&args),
        "sandbox.commit" => sandbox::commit(&args),
        "sandbox.unmount" => sandbox::unmount(&args),
        "sandbox.exec" => exec::exec(&args),
        "sandbox.list_processes" => exec::processes(&args),
        "process.cancel" => exec::cancel(&args),
        _ if op.contains('.') => sdk(op, args),
        _ => Err(refused("UnknownMethod", format!("no operation {op}"))),
    }
}

/// Every other method is one daemon SDK call through the named Sandbox.
fn sdk(op: &str, args: SdkValue) -> Outcome {
    let state = registry::sandbox(&args)?;
    let args = match args {
        SdkValue::Map(fields) => SdkValue::Map(
            fields
                .into_iter()
                .filter(|(name, _)| name != "sandbox")
                .collect(),
        ),
        other => other,
    };
    let answer = layerfs_api::call(&mut *registry::lock(&state.control)?, op, args);
    answer.map_err(|error| match error {
        layerfs_api::SdkError::Refused(refusal) => refusal,
        layerfs_api::SdkError::Operation(failure) => {
            layerfs_api::sandbox::values::refusal(&failure).unwrap_or_else(|| job::failed(failure))
        }
        layerfs_api::SdkError::Mount(failure) => job::failed(failure),
    })
}
