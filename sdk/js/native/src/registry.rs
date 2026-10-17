//! What this process owns: its running Inits and its live Sandboxes. A
//! project itself is only its home entry (`<home>/<name>/`), so a project
//! removed there can be initialized again without a restart.
//!
//! A Sandbox is one container and its daemon. Its runtime runs commands
//! directly; its control connections (`pool`) each carry one exchange at a
//! time, and concurrent calls take separate connections. The Sandbox runtime owner (this
//! binding) also keeps the background processes it started; the daemon holds
//! no process record.
use crate::job::refused;
use layerfs_api::MountedWorkspace;
use layerfs_bridge::control::{SdkRefusal, SdkValue, WorkspaceToken};
use layerfs_bridge::provision::StoreManifest;
use layerfs_sandbox::{backend::docker::Sandbox, CommandIdentity};
use std::collections::BTreeMap;
use std::sync::{Arc, LazyLock, Mutex, MutexGuard};

/// One project, read from or saved to its home entry.
pub(crate) struct Project {
    pub(crate) store: layerfs_persistence::SealedStore,
    pub(crate) manifest: StoreManifest,
    /// The daemon's manifest once a Sandbox installed the Store.
    pub(crate) installed: Option<StoreManifest>,
}

/// One mounted Workspace.
pub(crate) struct Mount {
    pub(crate) workspace: MountedWorkspace,
    pub(crate) branch: String,
}

/// One background process started in a Workspace.
pub(crate) struct Process {
    pub(crate) path: String,
    pub(crate) command: String,
    pub(crate) pid: u32,
    pub(crate) stopped: bool,
    pub(crate) start: String,
}

/// One live Sandbox.
pub(crate) struct SandboxState {
    pub(crate) id: String,
    pub(crate) project: String,
    pub(crate) directory: std::path::PathBuf,
    pub(crate) runtime: Sandbox,
    pub(crate) identity: CommandIdentity,
    pub(crate) controls: crate::pool::Controls,
    pub(crate) mounts: Mutex<BTreeMap<String, Mount>>,
    pub(crate) processes: Mutex<BTreeMap<String, Process>>,
}

/// The live counts of each Init still running, by project name.
pub(crate) static INITS: LazyLock<Mutex<BTreeMap<String, Arc<layerfs_api::InitCounters>>>> =
    LazyLock::new(Default::default);
pub(crate) static SANDBOXES: LazyLock<Mutex<BTreeMap<String, Arc<SandboxState>>>> =
    LazyLock::new(Default::default);

/// A lock, refused when a holder panicked.
pub(crate) fn lock<T>(mutex: &Mutex<T>) -> Result<MutexGuard<'_, T>, SdkRefusal> {
    mutex
        .lock()
        .map_err(|_| refused("Failed", "binding state poisoned"))
}

/// A required text argument.
pub(crate) fn text<'a>(args: &'a SdkValue, name: &str) -> Result<&'a str, SdkRefusal> {
    args.get_text(name)
        .ok_or_else(|| refused("InvalidInput", format!("missing text argument `{name}`")))
}

/// The Sandbox an operation names.
pub(crate) fn sandbox(args: &SdkValue) -> Result<Arc<SandboxState>, SdkRefusal> {
    let id = text(args, "sandbox")?;
    let existing = lock(&SANDBOXES)?.get(id).cloned();
    let state = match existing {
        Some(state) => state,
        None => {
            let state = crate::discovery::reopen(args)?;
            lock(&SANDBOXES)?.insert(id.to_owned(), state.clone());
            state
        }
    };
    // a Sandbox is found by its name alone; its project comes from its record
    if state.directory != crate::discovery::sandbox_dir(args, id)? {
        return Err(refused("Unauthorized", "Sandbox/home mismatch"));
    }
    crate::discovery::refresh(&state)?;
    Ok(state)
}

impl SandboxState {
    /// The token of the Workspace mounted at `path`.
    pub(crate) fn token(&self, path: &str) -> Result<WorkspaceToken, SdkRefusal> {
        lock(&self.mounts)?
            .get(path)
            .map(|mount| mount.workspace.bound.token)
            .ok_or_else(|| refused("NotMounted", format!("{}:{path} is not mounted", self.id)))
    }
}

/// 32 fresh random bytes from the transport's key generator.
pub(crate) fn random() -> Result<[u8; 32], SdkRefusal> {
    layerfs_bridge::duplex::generate_keypair()
        .map(|pair| pair.public)
        .map_err(crate::job::failed)
}
