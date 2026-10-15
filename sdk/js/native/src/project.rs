//! `project.init(path, { name, home })`: host Project Init into a sealed Store.
//!
//! The Store is Disposable and sealed under `home/<name>/`; the first Sandbox
//! of the project installs it into the shared volume. Init's first Branch is
//! named `main` and the SDK never shows it: `main` is the line of Layers.
use crate::job::{failed, refused, Outcome};
use crate::registry::{lock, random, text, Project, PROJECTS};
use layerfs_api::{InitRequest, ProjectApi};
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
    let (sealed, _) = Timing::disabled("project.init", |timer| {
        ProjectApi::new().init(request, timer)
    });
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
