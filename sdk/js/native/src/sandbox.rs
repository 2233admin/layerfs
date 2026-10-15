//! Sandbox lifecycle and Workspace control: create, close, mount, status,
//! commit and unmount.
//!
//! `create` starts one container and its daemon. The project's first Sandbox
//! installs the sealed Store into the shared volume; later ones open it. A
//! failed create keeps whatever container it made and names it in the
//! refusal; nothing is cleaned up or retried on the caller's behalf.
use crate::job::{failed, refused, Outcome};
use crate::registry::{lock, random, sandbox, text, Mount, SandboxState, PROJECTS, SANDBOXES};
use layerfs_api::internal::{split, workspace};
use layerfs_api::sandbox::values;
use layerfs_api::{OperationFailure, SandboxApi, SandboxCreate};
use layerfs_bridge::control::{CommitControl, SdkRefusal, SdkValue};
use layerfs_bridge::daemon_setup::{DaemonLimits, DaemonSetup};
use layerfs_history::WorkspaceId;
use layerfs_sandbox::backend::docker::{Docker, SandboxRequest};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::Duration;

/// Port the daemon listens on inside its container.
const PORT: u16 = 30421;
/// Wait for the daemon's listener after Start.
const STARTUP: Duration = Duration::from_secs(30);
/// Wait for one Engine control response.
const ENGINE: Duration = Duration::from_secs(30);

fn operation(failure: Box<OperationFailure>) -> SdkRefusal {
    values::refusal(&failure).unwrap_or_else(|| failed(failure))
}

fn setup(private: [u8; 32], peer: [u8; 32]) -> DaemonSetup {
    DaemonSetup {
        listen: format!("0.0.0.0:{PORT}"),
        private_key: private,
        control_peer: peer,
        store: crate::project::LOCATOR.into(),
        overlay: "/layerfs-local/overlay/overlay.sqlite".into(),
        mounts: "/workspaces".into(),
        command_uid: 501,
        command_gid: 20,
        limits: DaemonLimits {
            connections: 4,
            handshake_ms: 2000,
            cache_bytes: 65536,
            namespaces: 16,
            pager_kib: 1024,
            serial_low_water: 256,
        },
        existing_store: None,
    }
}

/// `sandbox.create({ project, deploy: { docker, image, volume, daemon } })`.
pub(crate) fn create(args: &SdkValue) -> Outcome {
    let name = text(args, "project")?;
    let deploy = args
        .get("deploy")
        .ok_or_else(|| refused("InvalidInput", "missing `deploy`"))?;
    let project = lock(&PROJECTS)?.get(name).cloned().ok_or_else(|| {
        refused(
            "NoSuchProject",
            format!("project {name} was not initialized here"),
        )
    })?;
    // Held for the whole create, so one Sandbox installs the Store.
    let mut project = lock(&project)?;
    let controller = layerfs_bridge::duplex::generate_keypair().map_err(failed)?;
    let daemon = layerfs_bridge::duplex::generate_keypair().map_err(failed)?;
    let mut daemon_setup = setup(daemon.private, controller.public);
    daemon_setup.existing_store = project.installed.as_ref().map(|installed| {
        let mut manifest = project.sealed.manifest.clone();
        manifest.daemon_sqlite = installed.daemon_sqlite.clone();
        manifest
    });
    let docker = Docker::new(text(deploy, "docker")?, ENGINE).map_err(failed)?;
    let created = SandboxApi::new(docker).create(
        SandboxCreate {
            deployment: SandboxRequest {
                image: text(deploy, "image")?.to_owned(),
                store_volume: text(deploy, "volume")?.to_owned(),
                port: PORT,
            },
            setup: daemon_setup,
            executable: PathBuf::from(text(deploy, "daemon")?),
            controller_private: controller.private,
            daemon_peer: daemon.public,
            startup_wait: STARTUP,
        },
        &project.sealed,
    );
    let mut owner = created.map_err(|failure| {
        let container = failure
            .sandbox
            .as_ref()
            .map(|sandbox| sandbox.identity().to_string());
        SdkRefusal {
            code: "Failed".to_owned(),
            message: format!(
                "sandbox create stopped at {:?}: {:?}",
                failure.phase, failure.cause
            ),
            detail: SdkValue::map([("container", SdkValue::opt_text(container))]),
        }
    })?;
    if let Some(installed) = owner.installed.take() {
        project.installed = Some(installed.manifest);
    }
    let container = owner.runtime.identity().to_string();
    let id = format!("sb_{}", &container[..12.min(container.len())]);
    let (runtime, control, identity) = split(owner);
    lock(&SANDBOXES)?.insert(
        id.clone(),
        Arc::new(SandboxState {
            id: id.clone(),
            project: name.to_owned(),
            runtime,
            identity,
            control: Mutex::new(control),
            mounts: Default::default(),
            processes: Default::default(),
        }),
    );
    Ok(SdkValue::map([
        ("kind", SdkValue::text("Ready")),
        ("id", SdkValue::Text(id)),
        ("container", SdkValue::Text(container)),
    ]))
}

/// `sandbox.close(sandbox)`: refused while Workspaces are mounted or an
/// operation still holds the Sandbox; then stop and delete the container.
pub(crate) fn close(args: &SdkValue) -> Outcome {
    let state = sandbox(args)?;
    let mounts = lock(&state.mounts)?.keys().cloned().collect::<Vec<_>>();
    if !mounts.is_empty() {
        return Err(SdkRefusal {
            code: "MountsActive".to_owned(),
            message: format!("{} still has mounted Workspaces", state.id),
            detail: SdkValue::map([(
                "mounts",
                SdkValue::List(mounts.into_iter().map(SdkValue::Text).collect()),
            )]),
        });
    }
    let id = state.id.clone();
    drop(state);
    let taken = lock(&SANDBOXES)?
        .remove(&id)
        .ok_or_else(|| refused("NoSuchSandbox", format!("no Sandbox {id}")))?;
    let mut owned = match Arc::try_unwrap(taken) {
        Ok(owned) => owned,
        Err(shared) => {
            lock(&SANDBOXES)?.insert(id.clone(), shared);
            return Err(refused(
                "Busy",
                format!("{id} has an operation in progress"),
            ));
        }
    };
    owned.runtime.stop(1).map_err(failed)?;
    owned.runtime.delete().map_err(failed)?;
    Ok(SdkValue::map([
        ("kind", SdkValue::text("Closed")),
        ("id", SdkValue::Text(id)),
    ]))
}

/// `sandbox.mount(sandbox, { branch })`: the Workspace's path.
pub(crate) fn mount(args: &SdkValue) -> Outcome {
    let state = sandbox(args)?;
    let branch = text(args, "branch")?;
    let id = WorkspaceId::from_authority(random()?).map_err(failed)?;
    let mounted = {
        let mut control = lock(&state.control)?;
        workspace(&mut control).mount_branch(&state.project, branch, id)
    };
    let mounted = mounted.map_err(|error| match error {
        layerfs_api::SdkError::Refused(refusal) => refusal,
        layerfs_api::SdkError::Operation(failure) => operation(failure),
        layerfs_api::SdkError::Mount(failure) => failed(failure),
    })?;
    let mut value = values::mounted(&mounted, branch);
    if let SdkValue::Map(fields) = &mut value {
        fields.push(("sandbox".to_owned(), SdkValue::text(state.id.as_str())));
    }
    lock(&state.mounts)?.insert(
        mounted.ready.directory.clone(),
        Mount {
            workspace: mounted,
            branch: branch.to_owned(),
        },
    );
    Ok(value)
}

/// `sandbox.status(sandbox, path)`.
pub(crate) fn status(args: &SdkValue) -> Outcome {
    let state = sandbox(args)?;
    let token = state.token(text(args, "path")?)?;
    let status = workspace(&mut *lock(&state.control)?)
        .status(token)
        .map_err(operation)?;
    let mut value = values::status(&status);
    if let SdkValue::Map(fields) = &mut value {
        let branch = lock(&state.mounts)?
            .get(text(args, "path")?)
            .map(|mount| mount.branch.clone());
        fields.push(("branch".to_owned(), SdkValue::opt_text(branch)));
    }
    Ok(value)
}

/// `sandbox.commit(sandbox, path, { force?, agent?, call? })`.
pub(crate) fn commit(args: &SdkValue) -> Outcome {
    let state = sandbox(args)?;
    let token = state.token(text(args, "path")?)?;
    let reply = workspace(&mut *lock(&state.control)?)
        .commit_with(CommitControl {
            token,
            force: args.get_bool("force"),
            agent: args.get_text("agent").map(str::to_owned),
            call: args.get_text("call").map(str::to_owned),
        })
        .map_err(operation)?;
    values::commit(&reply)
}

/// `sandbox.unmount(sandbox, path, { discard? })`: `Busy` while a background
/// process this binding started still runs there, then the daemon's answer.
pub(crate) fn unmount(args: &SdkValue) -> Outcome {
    let state = sandbox(args)?;
    let path = text(args, "path")?;
    let token = state.token(path)?;
    // The runtime owner knows its own processes; the daemon's kernel probe
    // still answers Busy for any other holder.
    let running = crate::exec::running_in(&state, path)?;
    if !running.is_empty() {
        return Err(SdkRefusal {
            code: "Busy".to_owned(),
            message: format!(
                "{}:{path} is busy: {} still running",
                state.id,
                running.join(", ")
            ),
            detail: SdkValue::map([(
                "processes",
                SdkValue::List(running.into_iter().map(SdkValue::Text).collect()),
            )]),
        });
    }
    let answer = workspace(&mut *lock(&state.control)?)
        .unmount_checked(token, args.get_bool("discard"))
        .map_err(operation)?;
    let value = values::unmounted(&answer)?;
    lock(&state.mounts)?.remove(path);
    Ok(value)
}
