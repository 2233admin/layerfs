//! Native argument conversion and disjoint public/operator method tables.
use crate::job::{refused, Job, Outcome};
use crate::{convert, exec, job, project, registry, sandbox};
use layerfs_bridge::control::SdkValue;
use napi::{bindgen_prelude::AsyncTask, JsUnknown};

/// Runs one SDK operation; the Promise resolves `{ value }` or `{ refused }`.
pub(crate) fn call(op: String, args: JsUnknown) -> napi::Result<AsyncTask<Job>> {
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
        _ if op.starts_with("operator.") => Err(refused(
            "UnknownMethod",
            "operator methods require operatorCall",
        )),
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
    let answer = if op.starts_with("operator.") {
        layerfs_api::operator::call(&mut *registry::lock(&state.control)?, op, args)
    } else {
        layerfs_api::call(&mut *registry::lock(&state.control)?, op, args)
    };
    answer.map_err(|error| match error {
        layerfs_api::SdkError::Refused(refusal) => refusal,
        layerfs_api::SdkError::Operation(failure) => {
            layerfs_api::sandbox::values::refusal(&failure).unwrap_or_else(|| job::failed(failure))
        }
        layerfs_api::SdkError::Mount(failure) => job::failed(failure),
    })
}

/// Runs one internal operator call through its separate method table.
pub(crate) fn operator_call(op: String, args: JsUnknown) -> napi::Result<AsyncTask<Job>> {
    let args = convert::from_js(args)?;
    Ok(AsyncTask::new(Job::new(move || match op.as_str() {
        "operator.process.list" => exec::processes(&args),
        "operator.process.cancel" => exec::cancel(&args),
        "operator.inspect.snapshot" => sdk(&op, args),
        _ => Err(refused(
            "UnknownMethod",
            format!("no operator operation {op}"),
        )),
    })))
}
