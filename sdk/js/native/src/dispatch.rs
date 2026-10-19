//! Native argument conversion and disjoint public/operator method tables.
use crate::job::{refused, Job, Outcome};
use crate::{convert, direct, exec, job, project, registry, sandbox};
use layerfs_bridge::control::SdkValue;
use napi::{bindgen_prelude::AsyncTask, JsUnknown};

/// Runs one SDK operation; the Promise resolves `{ value }` or `{ refused }`.
pub(crate) fn call(op: String, args: JsUnknown) -> napi::Result<AsyncTask<Job>> {
    let mut args = convert::from_js(args)?;
    let scope = crate::trace::take_scope(&mut args);
    Ok(AsyncTask::new(
        Job::new(move || dispatch(&op, args)).traced(scope),
    ))
}

fn dispatch(op: &str, args: SdkValue) -> Outcome {
    if let Some(value) = args.get("message") {
        if !matches!(value, SdkValue::Null) {
            let SdkValue::Text(message) = value else {
                return Err(refused("InvalidInput", "message must be text"));
            };
            let mut meta = layerfs_history::CommitMeta::new(layerfs_history::CommitVia::Files);
            meta.message = Some(message.clone());
            meta.check()
                .map_err(|error| refused("InvalidInput", error.to_string()))?;
        }
    }
    match op {
        "project.init" => project::init(&args),
        "sandbox.create" => sandbox::create(&args),
        "sandbox.service" => sandbox::service(&args),
        "sandbox.close" => sandbox::close(&args),
        "sandbox.mount" => sandbox::mount(&args),
        "sandbox.status" => sandbox::status(&args),
        "sandbox.commit" => sandbox::commit(&args),
        "sandbox.unmount" => sandbox::unmount(&args),
        "sandbox.exec" if args.get_bool("background") => Err(refused(
            "InvalidInput",
            "background launch requires the operator process table",
        )),
        "sandbox.exec" => exec::exec(&args),
        _ if op.starts_with("operator.") => Err(refused(
            "UnknownMethod",
            "operator methods require operatorCall",
        )),
        // Store calls run in this process; there is no other route.
        _ if op.contains('.') => direct::call(op, args, false),
        _ => Err(refused("UnknownMethod", format!("no operation {op}"))),
    }
}

/// A daemon operator call through the named Sandbox: its Workspaces and the
/// read model that lists them.
fn daemon_operator(op: &str, args: SdkValue) -> Outcome {
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
    let answer =
        layerfs_api::operator::call(&mut *crate::trace::control(&state.controls)?, op, args);
    answer.map_err(|error| match error {
        layerfs_api::SdkError::Refused(refusal) => refusal,
        layerfs_api::SdkError::Operation(failure) => {
            layerfs_api::sandbox::values::refusal(&failure).unwrap_or_else(|| job::failed(failure))
        }
        layerfs_api::SdkError::Mount(failure) => job::failed(failure),
    })
}

/// Opens or releases a Store of this process.
pub(crate) fn store(
    args: JsUnknown,
    run: fn(&SdkValue) -> Outcome,
) -> napi::Result<AsyncTask<Job>> {
    let args = convert::from_js(args)?;
    Ok(AsyncTask::new(Job::new(move || run(&args))))
}

/// Runs one internal operator call through its separate method table.
pub(crate) fn operator_call(op: String, args: JsUnknown) -> napi::Result<AsyncTask<Job>> {
    let mut args = convert::from_js(args)?;
    let scope = crate::trace::take_scope(&mut args);
    Ok(AsyncTask::new(
        Job::new(move || match op.as_str() {
            "operator.process.start" => exec::exec(&args),
            "operator.process.list" => exec::processes(&args),
            "operator.process.cancel" => exec::cancel(&args),
            "operator.project.progress" => crate::project::progress(&args),
            "operator.store.stats"
            | "operator.store.commits"
            | "operator.store.overwritten"
            | "operator.files.stats"
            | "operator.files.history" => direct::call(&op, args, true),
            "operator.inspect.snapshot"
            | "operator.workspace.overlay"
            | "operator.workspace.changes" => daemon_operator(&op, args),
            _ => Err(refused(
                "UnknownMethod",
                format!("no operator operation {op}"),
            )),
        })
        .traced(scope),
    ))
}
