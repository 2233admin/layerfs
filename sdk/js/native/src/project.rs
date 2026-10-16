//! `project.init(path, { name, home })`: host Project Init into a sealed Store.
//!
//! The Store is Disposable and sealed under `home/<name>/`; the first Sandbox
//! of the project installs it into the shared volume. Init's first Branch is
//! named `main` and the SDK never shows it: `main` is the line of Layers.
use crate::job::{failed, refused, Outcome};
use crate::registry::{lock, random, text, Project, INITS, PROJECTS};
use layerfs_api::{InitCounters, InitRequest, InitStep, ProjectApi};
use layerfs_bridge::control::SdkValue;
use layerfs_bridge::sdk_values::hex;
use layerfs_history::{BranchId, HistoryCatalogConfig, HistoryName, LayerStackId};
use layerfs_persistence::{PersistenceConfig, SqlitePersistenceProfile};
use layerfs_storage::StoragePolicy;
use layerfs_telemetry::timer::Timing;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

/// Where the daemon opens the installed Store inside its Sandbox.
pub(crate) const LOCATOR: &str = "/layerfs-store/global/store.sqlite";
/// Init's own deadline.
const INIT_DEADLINE: Duration = Duration::from_secs(60);

fn sixteen(bytes: [u8; 32]) -> [u8; 16] {
    let mut out = [0; 16];
    out.copy_from_slice(&bytes[..16]);
    out
}

pub(crate) fn init(args: &SdkValue) -> Outcome {
    let name = text(args, "name")?;
    let source = PathBuf::from(text(args, "path")?);
    let home = crate::discovery::home(args)?;
    if lock(&PROJECTS)?.contains_key(name) {
        return Err(refused(
            "Exists",
            format!("project {name} already initialized"),
        ));
    }
    let directory = home.join(name);

    std::fs::create_dir(&directory)
        .map_err(|error| refused("Exists", format!("{}: {error}", directory.display())))?;
    std::fs::set_permissions(&directory, {
        use std::os::unix::fs::PermissionsExt;
        std::fs::Permissions::from_mode(0o700)
    })
    .map_err(failed)?;
    let _guard = crate::discovery::guard(&directory)?;
    let history = |text: &str| HistoryName::new(text).map_err(failed);
    let request = InitRequest {
        source,
        store: PersistenceConfig::sqlite(directory.join("sealed.sqlite"))
            .with_sqlite_profile(SqlitePersistenceProfile::Disposable),
        locator: LOCATOR.into(),
        policy: StoragePolicy::frozen_default(),
        catalog: HistoryCatalogConfig {
            binding_key: random()?.to_vec(),
            cursor_key: random()?,
            incarnation: 1,
        },
        stack: LayerStackId::from_authority(sixteen(random()?)),
        stack_name: history(name)?,
        branch: BranchId::from_authority(sixteen(random()?)),
        branch_name: history("main")?,
        scope_seed: random()?,
        deadline: Instant::now() + INIT_DEADLINE,
    };
    let counters = Arc::new(InitCounters::new());
    lock(&INITS)?.insert(name.to_owned(), Arc::clone(&counters));
    let running = Running(name);
    let (sealed, _) = Timing::disabled("project.init", |timer| {
        ProjectApi::new().init_observed(request, timer, counters)
    });
    drop(running);
    let sealed = sealed.map_err(failed)?;
    let answer = SdkValue::map([
        ("kind", SdkValue::text("Initialized")),
        ("project", SdkValue::text(name)),
        (
            "layer",
            SdkValue::text(hex(sealed.branch.branch.base_layer.as_slice())),
        ),
        (
            "root",
            SdkValue::text(hex(sealed.branch.effective_root.as_bytes())),
        ),
        (
            "store",
            SdkValue::text(directory.join("sealed.sqlite").display().to_string()),
        ),
    ]);
    let project = Project {
        store: sealed.store,
        manifest: sealed.manifest,
        installed: None,
    };
    crate::discovery::save_project(&directory, &project)?;
    lock(&PROJECTS)?.insert(name.to_owned(), Arc::new(Mutex::new(project)));
    Ok(answer)
}

/// Removes a finished Init's counts, whichever way it ended.
struct Running<'a>(&'a str);
impl Drop for Running<'_> {
    fn drop(&mut self) {
        if let Ok(mut inits) = INITS.lock() {
            inits.remove(self.0);
        }
    }
}

/// `operator.project.progress`: how far the project's running Init has come
/// (`step`, `entries`, `files`, `bytes`), or null when none runs.
pub(crate) fn progress(args: &SdkValue) -> Outcome {
    let name = text(args, "project")?;
    let Some(counters) = lock(&INITS)?.get(name).cloned() else {
        return Ok(SdkValue::Null);
    };
    let counts = counters.read();
    let step = match counts.step {
        InitStep::Scan => "scan",
        InitStep::Files => "files",
        InitStep::Tree => "tree",
        InitStep::Publish => "publish",
        InitStep::Seal => "seal",
    };
    let number = |n: u64| SdkValue::Int(i64::try_from(n).unwrap_or(i64::MAX));
    Ok(SdkValue::map([
        ("step", SdkValue::text(step)),
        ("entries", number(counts.entries)),
        ("files", number(counts.files)),
        ("bytes", number(counts.bytes)),
    ]))
}
