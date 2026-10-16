//! Private, permission-authorized project and Sandbox discovery. No mutation replay.
use crate::{
    job::{failed, refused},
    registry::{self, Mount, Process, Project, SandboxState},
};
use layerfs_api::{
    internal::{workspace, Control},
    BoundWorkspace, MountedWorkspace,
};
use layerfs_bridge::{
    control::{DaemonPhase, HelloRequest, Reply, Request, SdkRefusal, SdkValue},
    duplex::initiate_observed,
    provision::StoreManifest,
};
use layerfs_persistence::{SealedStore, SqlitePersistenceProfile};
use layerfs_sandbox::{
    backend::docker::{Docker, Sandbox, SandboxRequest},
    CommandIdentity, ContainerId,
};
use std::{
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    os::unix::{
        fs::{DirBuilderExt, MetadataExt, OpenOptionsExt},
        io::AsRawFd,
    },
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
    time::Duration,
};
extern "C" {
    fn geteuid() -> u32;
    fn flock(fd: i32, operation: i32) -> i32;
}
type Result<T> = std::result::Result<T, SdkRefusal>;

pub(crate) fn home(args: &SdkValue) -> Result<PathBuf> {
    let home = args
        .get_text("home")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("LAYERFS_HOME").map(PathBuf::from))
        .ok_or_else(|| refused("InvalidInput", "LAYERFS_HOME is required"))?;
    if !home.is_absolute() {
        return Err(refused("InvalidInput", "LAYERFS_HOME must be absolute"));
    }
    directory(&home)?;
    Ok(home)
}
fn private(path: &Path, dir: bool) -> Result<()> {
    let meta = fs::symlink_metadata(path).map_err(failed)?;
    if meta.file_type().is_symlink()
        || meta.is_dir() != dir
        || (!dir && !meta.is_file())
        || meta.uid() != unsafe { geteuid() }
        || meta.mode() & 0o077 != 0
    {
        return Err(refused(
            "Unauthorized",
            format!("{} must be owned by this user and private", path.display()),
        ));
    }
    Ok(())
}
pub(crate) fn directory(path: &Path) -> Result<()> {
    match fs::DirBuilder::new().mode(0o700).create(path) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {}
        Err(e) => return Err(failed(e)),
    }
    private(path, true)
}
/// Where Sandboxes live: `LAYERFS_HOME/_sandboxes/<name>/`, one directory per
/// name across every project. `_sandboxes` is never a project name (those
/// start alphanumeric), and claiming a name is one atomic `mkdir`.
const SANDBOXES: &str = "_sandboxes";
/// The prefix of a project's service Sandbox name; no user name starts with it.
pub(crate) const SERVICE: &str = "_service.";

/// A Sandbox name a caller chooses: as a project name, 1–63 lowercase ASCII
/// letters, digits, `_`, `-`, `.`, starting and ending alphanumeric.
pub(crate) fn check_name(name: &str) -> Result<()> {
    let bytes = name.as_bytes();
    let edge = |b: &u8| b.is_ascii_lowercase() || b.is_ascii_digit();
    let ok = (1..=63).contains(&bytes.len())
        && bytes.first().is_some_and(edge)
        && bytes.last().is_some_and(edge)
        && bytes
            .iter()
            .all(|b| edge(b) || matches!(b, b'_' | b'-' | b'.'));
    if !ok {
        return Err(refused(
            "InvalidInput",
            "a Sandbox name is 1-63 lowercase letters, digits, _ . - and starts and ends alphanumeric",
        ));
    }
    Ok(())
}
/// The directory of the Sandbox `name` (a caller's name or a service name).
pub(crate) fn sandbox_dir(args: &SdkValue, name: &str) -> Result<PathBuf> {
    match name.strip_prefix(SERVICE) {
        Some(project) => layerfs_history::HistoryName::new(project)
            .map(|_| ())
            .map_err(|_| refused("InvalidInput", "service Sandbox name"))?,
        None => check_name(name)?,
    }
    let root = home(args)?.join(SANDBOXES);
    directory(&root)?;
    Ok(root.join(name))
}
/// Claims `name` for a new Sandbox: its directory, made once. A name in use is `Exists`.
pub(crate) fn claim(args: &SdkValue, name: &str) -> Result<PathBuf> {
    let path = sandbox_dir(args, name)?;
    match fs::DirBuilder::new().mode(0o700).create(&path) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
            return Err(refused("Exists", format!("a Sandbox named {name} exists")))
        }
        Err(e) => return Err(failed(e)),
    }
    private(&path, true)?;
    Ok(path)
}
pub(crate) fn project_dir(args: &SdkValue) -> Result<PathBuf> {
    let name = registry::text(args, "project")?;
    layerfs_history::HistoryName::new(name).map_err(failed)?;
    let path = home(args)?.join(name);
    private(&path, true)?;
    Ok(path)
}
/// A nonblocking OS lock is released even if its process exits. Busy is not retried.
pub(crate) fn guard(directory: &Path) -> Result<File> {
    let path = directory.join("ownership.lock");
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .mode(0o600)
        .custom_flags(no_follow())
        .open(&path)
        .map_err(failed)?;
    private(&path, false)?;
    if unsafe { flock(file.as_raw_fd(), 2 | 4) } != 0 {
        return Err(refused(
            "Busy",
            "another process owns this discovery mutation",
        ));
    }
    Ok(file)
}
#[cfg(target_os = "macos")]
fn no_follow() -> i32 {
    0x100
}
#[cfg(target_os = "linux")]
fn no_follow() -> i32 {
    0x20000
}

pub(crate) fn save(path: &Path, value: SdkValue) -> Result<()> {
    let bytes = layerfs_bridge::control::Answer {
        id: 1,
        reply: Reply::Sdk(value),
    }
    .encode()
    .map_err(failed)?;
    let temp = path.with_extension(format!(
        "{}-{}",
        std::process::id(),
        layerfs_bridge::sdk_values::hex(&registry::random()?[..8])
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o600)
        .custom_flags(no_follow())
        .open(&temp)
        .map_err(failed)?;
    file.write_all(&bytes).map_err(failed)?;
    drop(file);
    fs::rename(temp, path).map_err(failed)
}
/// A small private text file, written once (0600, not a symlink).
pub(crate) fn save_text(path: &Path, text: &str) -> Result<()> {
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o600)
        .custom_flags(no_follow())
        .open(path)
        .map_err(failed)?;
    file.write_all(format!("{text}\n").as_bytes())
        .map_err(failed)
}
pub(crate) fn load(path: &Path) -> Result<SdkValue> {
    private(path, false)?;
    let file = OpenOptions::new()
        .read(true)
        .custom_flags(no_follow())
        .open(path)
        .map_err(failed)?;
    if file.metadata().map_err(failed)?.len() > 65535 {
        return Err(refused("InvalidInput", "discovery record too large"));
    }
    let mut bytes = Vec::new();
    file.take(65536).read_to_end(&mut bytes).map_err(failed)?;
    match layerfs_bridge::control::Answer::decode(&bytes)
        .map_err(failed)?
        .reply
    {
        Reply::Sdk(value) => Ok(value),
        _ => Err(refused("InvalidInput", "discovery record kind")),
    }
}
fn bytes<const N: usize>(value: &SdkValue, key: &str) -> Result<[u8; N]> {
    match value.get(key) {
        Some(SdkValue::Bytes(bytes)) => bytes.as_slice().try_into().map_err(failed),
        _ => Err(refused("InvalidInput", format!("discovery {key}"))),
    }
}
pub(crate) fn save_project(path: &Path, project: &Project) -> Result<()> {
    save(
        &path.join("project.record"),
        SdkValue::map([
            (
                "manifest",
                SdkValue::Bytes(project.manifest.encode().map_err(failed)?),
            ),
            (
                "installed",
                project
                    .installed
                    .as_ref()
                    .map(|m| m.encode().map(SdkValue::Bytes))
                    .transpose()
                    .map_err(failed)?
                    .unwrap_or_default(),
            ),
        ]),
    )
}
pub(crate) fn project(args: &SdkValue) -> Result<Project> {
    let path = project_dir(args)?;
    let value = load(&path.join("project.record"))?;
    let decode = |name| match value.get(name) {
        Some(SdkValue::Bytes(bytes)) => StoreManifest::decode(bytes).map_err(failed),
        _ => Err(refused("NoSuchProject", "no complete project manifest")),
    };
    let manifest = decode("manifest")?;
    if manifest.profile != layerfs_bridge::provision::StoreProfile::Disposable {
        return Err(refused("InvalidInput", "Disposable required"));
    }
    let installed = if matches!(value.get("installed"), Some(SdkValue::Bytes(_))) {
        Some(decode("installed")?)
    } else {
        None
    };
    Ok(Project {
        store: SealedStore {
            path: path.join("sealed.sqlite"),
            profile: SqlitePersistenceProfile::Disposable,
            sqlite_version: manifest.host_sqlite.clone(),
            bytes: manifest.bytes,
        },
        manifest,
        installed,
    })
}
pub(crate) fn save_sandbox(
    directory: &Path,
    state: &SandboxState,
    args: &SdkValue,
    secret: [u8; 32],
    peer: [u8; 32],
    instance: [u8; 32],
) -> Result<()> {
    let deploy = args
        .get("deploy")
        .ok_or_else(|| refused("InvalidInput", "deploy"))?;
    save(
        &directory.join("sandbox.record"),
        SdkValue::map([
            ("id", SdkValue::text(&state.id)),
            ("project", SdkValue::text(&state.project)),
            (
                "container",
                SdkValue::text(state.runtime.identity().to_string()),
            ),
            ("docker", SdkValue::text(registry::text(deploy, "docker")?)),
            ("image", SdkValue::text(&state.runtime.request().image)),
            (
                "volume",
                SdkValue::text(&state.runtime.request().store_volume),
            ),
            ("secret", SdkValue::Bytes(secret.to_vec())),
            ("peer", SdkValue::Bytes(peer.to_vec())),
            ("instance", SdkValue::Bytes(instance.to_vec())),
        ]),
    )
}
pub(crate) fn reopen(args: &SdkValue) -> Result<Arc<SandboxState>> {
    let id = registry::text(args, "sandbox")?;
    let directory = sandbox_dir(args, id)?;
    if !directory.join("sandbox.record").exists() {
        return Err(refused("NoSuchSandbox", format!("no Sandbox named {id}")));
    }
    private(&directory, true)?;
    let value = load(&directory.join("sandbox.record"))?;
    if registry::text(&value, "id")? != id {
        return Err(refused("Unauthorized", "Sandbox record mismatch"));
    }
    let project = registry::text(&value, "project")?;
    let docker =
        Docker::new(registry::text(&value, "docker")?, Duration::from_secs(30)).map_err(failed)?;
    let runtime = Sandbox::reopen(
        docker,
        ContainerId::parse(registry::text(&value, "container")?).map_err(failed)?,
        SandboxRequest {
            image: registry::text(&value, "image")?.to_owned(),
            store_volume: registry::text(&value, "volume")?.to_owned(),
            port: 30421,
        },
    )
    .map_err(failed)?;
    let endpoint = runtime.endpoint().map_err(failed)?;
    let stream =
        std::net::TcpStream::connect_timeout(&endpoint, Duration::from_secs(10)).map_err(failed)?;
    stream
        .set_read_timeout(Some(Duration::from_secs(10)))
        .map_err(failed)?;
    stream
        .set_write_timeout(Some(Duration::from_secs(10)))
        .map_err(failed)?;
    let connection = initiate_observed(stream, &bytes(&value, "secret")?, bytes(&value, "peer")?)
        .result
        .map_err(failed)?;
    connection.clear_io_waits().map_err(failed)?;
    let mut control = Control::new(connection);
    match control
        .call(Request::Hello(HelloRequest {
            expected_instance: Some(bytes(&value, "instance")?),
            wait_for_store: false,
        }))
        .map_err(failed)?
    {
        Reply::Hello(status) if status.phase == DaemonPhase::ControlReady => {}
        _ => return Err(refused("StaleSandbox", "saved daemon is not ControlReady")),
    }
    let state = Arc::new(SandboxState {
        id: id.to_owned(),
        project: project.to_owned(),
        directory,
        runtime,
        identity: CommandIdentity { uid: 501, gid: 20 },
        control: Mutex::new(control),
        mounts: Default::default(),
        processes: Default::default(),
    });
    refresh(&state)?;
    Ok(state)
}
/// Refresh shared executor/mount metadata without repeating an operation.
pub(crate) fn refresh(state: &SandboxState) -> Result<()> {
    let mut mounts = std::collections::BTreeMap::new();
    let mut processes = std::collections::BTreeMap::new();
    for item in fs::read_dir(&state.directory).map_err(failed)? {
        let item = item.map_err(failed)?;
        let name = item.file_name().to_string_lossy().into_owned();
        if name.starts_with("mount-") && name.ends_with(".record") {
            let value = load(&item.path())?;
            let path = registry::text(&value, "path")?;
            let token = layerfs_bridge::control::WorkspaceToken {
                workspace: layerfs_history::WorkspaceId::from_slice(&bytes::<32>(
                    &value,
                    "workspace",
                )?)
                .map_err(failed)?,
                namespace: value
                    .get_int("namespace")
                    .ok_or_else(|| refused("InvalidInput", "namespace"))?,
            };
            let status = workspace(&mut *crate::trace::control(&state.control)?)
                .status(token)
                .map_err(failed)?;
            let ready = status
                .kernel
                .and_then(|k| k.ready)
                .ok_or_else(|| refused("NotMounted", "saved Workspace is no longer mounted"))?;
            if ready.directory != path {
                return Err(refused("StaleSandbox", "mount path mismatch"));
            }
            mounts.insert(
                path.to_owned(),
                Mount {
                    workspace: MountedWorkspace {
                        bound: BoundWorkspace {
                            token,
                            binding: status.binding,
                        },
                        ready,
                    },
                    branch: registry::text(&value, "branch")?.to_owned(),
                },
            );
        } else if name.starts_with("process-") && name.ends_with(".record") {
            let v = load(&item.path())?;
            processes.insert(
                registry::text(&v, "id")?.to_owned(),
                Process {
                    path: registry::text(&v, "path")?.to_owned(),
                    command: registry::text(&v, "command")?.to_owned(),
                    pid: v
                        .get_int("pid")
                        .ok_or_else(|| refused("InvalidInput", "pid"))?
                        as u32,
                    start: registry::text(&v, "start")?.to_owned(),
                    stopped: v.get_bool("stopped"),
                },
            );
        }
    }
    *registry::lock(&state.mounts)? = mounts;
    *registry::lock(&state.processes)? = processes;
    Ok(())
}
pub(crate) fn mount_file(
    state: &SandboxState,
    token: layerfs_bridge::control::WorkspaceToken,
) -> PathBuf {
    state.directory.join(format!(
        "mount-{}.record",
        layerfs_bridge::sdk_values::hex(&token.workspace.to_bytes())
    ))
}
pub(crate) fn save_mount(
    state: &SandboxState,
    mount: &MountedWorkspace,
    branch: &str,
) -> Result<()> {
    save(
        &mount_file(state, mount.bound.token),
        SdkValue::map([
            ("path", SdkValue::text(&mount.ready.directory)),
            ("branch", SdkValue::text(branch)),
            (
                "workspace",
                SdkValue::Bytes(mount.bound.token.workspace.to_bytes().to_vec()),
            ),
            ("namespace", SdkValue::Int(mount.bound.token.namespace)),
        ]),
    )
}
pub(crate) fn save_process(state: &SandboxState, id: &str, p: &Process) -> Result<()> {
    save(
        &state.directory.join(format!("process-{id}.record")),
        SdkValue::map([
            ("id", SdkValue::text(id)),
            ("path", SdkValue::text(&p.path)),
            ("command", SdkValue::text(&p.command)),
            ("pid", SdkValue::Int(p.pid as i64)),
            ("start", SdkValue::text(&p.start)),
            ("stopped", SdkValue::Bool(p.stopped)),
        ]),
    )
}
