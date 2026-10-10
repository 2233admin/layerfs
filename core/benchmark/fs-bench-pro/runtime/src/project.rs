//! Current public SDK Init and an independent, separate-process read proof.
use crate::{args::Args, events::Events, Result};
use layerfs_bridge::{native, provision::StoreManifest};
use layerfs_content::{
    file::FileView,
    filesystem::{
        attributes::read::{read_portable, AttributeReadWork},
        FilesystemRead, FilesystemRootId, LogicalPath,
    },
    inode_leaf::InodeKind,
};
use layerfs_history::{BranchId, HistoryCatalog, HistoryCatalogConfig, HistoryName, LayerStackId};
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile};
use layerfs_sdk::{InitRequest, ProjectApi};
use layerfs_storage::{Storage, StoragePolicy};
use layerfs_telemetry::timer::Timing;
use std::{
    fs,
    io::Write,
    os::unix::fs::{MetadataExt, OpenOptionsExt},
    time::{Duration, Instant},
};

#[allow(dead_code)]
#[path = "../../engine/recipes/namespace.rs"]
mod namespace;

pub fn initialize(args: &Args, events: &mut Events) -> Result<()> {
    let source = args
        .source
        .as_ref()
        .ok_or("--source-copy required")?
        .canonicalize()?;
    let sealed = args.sealed.as_ref().ok_or("--sealed required")?;
    let case = args.case.as_deref().ok_or("--case required")?;
    let plan = namespace::reference::namespace_plan(case)?;
    let stack_key = native::generate_keypair()?.public;
    let branch_key = native::generate_keypair()?.public;
    let mut stack = [0; 16];
    let mut branch = [0; 16];
    stack.copy_from_slice(&stack_key[..16]);
    branch.copy_from_slice(&branch_key[..16]);
    let request = InitRequest {
        source,
        store: PersistenceConfig::sqlite(sealed)
            .with_sqlite_profile(SqlitePersistenceProfile::Disposable),
        locator: "/layerfs-store/global/store.sqlite".into(),
        policy: StoragePolicy::frozen_default(),
        catalog: HistoryCatalogConfig {
            binding_key: b"fs-bench-pro-init".to_vec(),
            cursor_key: native::generate_keypair()?.private,
            incarnation: 1,
        },
        stack: LayerStackId::from_authority(stack),
        stack_name: HistoryName::new("project")?,
        branch: BranchId::from_authority(branch),
        branch_name: HistoryName::new("main")?,
        scope_seed: native::generate_keypair()?.public,
        deadline: Instant::now() + Duration::from_secs(args.init_seconds),
    };
    let begun = Instant::now();
    let project = Timing::disabled("fs-bench-pro.init", |timer| {
        ProjectApi::new().init(request, timer)
    })
    .0?;
    let elapsed = events.span(begun);
    if project.initialized.entries
        != plan.scenario.regular_files + plan.scenario.data_directories + 1
        || project.initialized.namespace_work.unique_files as u64 != plan.scenario.regular_files
        || project.branch.effective_root != project.initialized.root
    {
        return Err("original acknowledged Init counts/Branch root differ from frozen plan".into());
    }
    let metadata = project.store.path.metadata()?;
    let mut manifest = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o600)
        .open(&args.manifest)?;
    manifest.write_all(&project.manifest.encode()?)?;
    events.numeric_fields(
        "project_init",
        Some(elapsed),
        "public Init acknowledged; sole Store consumed by seal; no daemon/mount",
        &[
            ("case", case.into()),
            ("root", crate::hex(&project.manifest.root)),
            ("stack", crate::hex(&project.manifest.stack)),
            ("host_sqlite", project.manifest.host_sqlite.clone()),
        ],
        &[
            ("entries", project.initialized.entries),
            ("files", plan.scenario.regular_files),
            ("logical_bytes", metadata.len()),
            ("allocated_bytes", metadata.blocks() * 512),
        ],
    )?;
    Ok(())
}

pub fn verify(args: &Args, events: &mut Events) -> Result<()> {
    let manifest = StoreManifest::decode(&fs::read(&args.manifest)?)?;
    let plan =
        namespace::reference::namespace_plan(args.case.as_deref().ok_or("--case required")?)?;
    let config = PersistenceConfig::sqlite(args.sealed.as_ref().ok_or("--sealed required")?)
        .with_sqlite_profile(SqlitePersistenceProfile::Disposable);
    let begun = Instant::now();
    let handles = Handles::open_writable(config, &manifest.binding, manifest.cursor_key)?;
    let branch = handles
        .history
        .branch_snapshot(BranchId::from_bytes(manifest.branch)?)?
        .ok_or("missing first Branch")?;
    if branch.effective_root.to_bytes() != manifest.root || branch.branch.head_commit.is_some() {
        return Err("persisted first Branch root/head differs".into());
    }
    let storage = Storage::new(handles.storage.clone())?;
    let reader = storage.reader()?;
    let mut tree = FilesystemRead::new(&reader, FilesystemRootId(branch.effective_root))?;
    let mut work = AttributeReadWork::default();
    let check = |path: &str,
                 kind,
                 mode,
                 tree: &mut FilesystemRead<'_>,
                 work: &mut AttributeReadWork|
     -> Result<_> {
        let inode = tree.resolve(&LogicalPath::new(path)?)?.value;
        let attributes = read_portable(&reader, inode.metadata_root, inode.kind, work)?;
        if inode.kind != kind
            || attributes.mode != mode
            || attributes.mtime_seconds != namespace::reference::NAMESPACE_MTIME_SECONDS
            || attributes.mtime_nanoseconds != namespace::reference::NAMESPACE_MTIME_NANOSECONDS
        {
            return Err(format!("independent metadata mismatch at {path}").into());
        }
        Ok(inode)
    };
    check("", InodeKind::Directory, 0o750, &mut tree, &mut work)?;
    let indices = namespace::samples(&plan);
    let mut verified_bytes = 0;
    for index in &indices {
        let planned = &plan.files[*index];
        let parent = planned
            .relative_path
            .rsplit_once('/')
            .ok_or("frozen parent")?
            .0;
        check(parent, InodeKind::Directory, 0o750, &mut tree, &mut work)?;
        let inode = check(
            &planned.relative_path,
            InodeKind::RegularFile,
            0o640,
            &mut tree,
            &mut work,
        )?;
        let mut expected = vec![0; planned.size.min(65536) as usize];
        namespace::reference::NamespaceContentStream::new(plan.scenario, planned)
            .fill(&mut expected);
        let observed = Timing::disabled("independent.init.bytes", |timer| -> Result<_> {
            let view = FileView::open(&reader, inode.content_root, timer.child("open"))?;
            if view.logical_len() != planned.size {
                return Err("independent file length mismatch".into());
            }
            let mut actual = Vec::with_capacity(expected.len());
            view.read_range(&reader, 0..expected.len() as u64, &mut actual, timer)?;
            Ok(actual)
        })
        .0?;
        if observed != expected {
            return Err(format!("independent bytes mismatch at {}", planned.relative_path).into());
        }
        verified_bytes += observed.len() as u64;
    }
    drop(tree);
    drop(reader);
    drop(storage);
    handles.seal()?;
    events.numeric_fields("project_verified", Some(events.span(begun)), "original import counts plus reopen root/first Branch and exact original sampled modes/mtime/size/prefix bytes; unselected paths/payload bytes omitted", &[("status", "PASS".into())], &[("sampled_files", indices.len() as u64), ("verified_bytes", verified_bytes)])?;
    Ok(())
}
