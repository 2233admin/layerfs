//! Offline independent current-format graph and complete semantic tree proof.
use crate::{args::Args, events::Events, project::namespace::reference, Result};
use layerfs_bridge::provision::StoreManifest;
use layerfs_content::{
    file::FileView,
    filesystem::{
        attributes::read::{read_portable, AttributeReadWork},
        FilesystemRead, FilesystemRootId, LogicalPath,
    },
    inode_leaf::InodeKind,
};
use layerfs_history::{BranchId, HistoryCatalog};
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile};
use layerfs_storage::Storage;
use layerfs_telemetry::timer::Timing;
use reference::workspace_common::{Content, EntryKind};
use std::{
    collections::{BTreeMap, BTreeSet, VecDeque},
    fs,
    time::Instant,
};

pub fn verify(args: &Args, events: &mut Events) -> Result<()> {
    let case =
        reference::workspace_registry::resolve(args.case.as_deref().ok_or("--case required")?)?;
    let entries = reference::workspace_registry::expected(&case, 1, 1)?;
    let expected = entries
        .iter()
        .map(|entry| (entry.path.clone(), entry))
        .collect::<BTreeMap<_, _>>();
    let manifest = StoreManifest::decode(&fs::read(&args.manifest)?)?;
    let config = PersistenceConfig::sqlite(args.sealed.as_ref().ok_or("--sealed required")?)
        .with_sqlite_profile(SqlitePersistenceProfile::Disposable);
    let begun = Instant::now();
    let handles = Handles::open_writable(config, &manifest.binding, manifest.cursor_key)?;
    let snapshot = handles
        .history
        .branch_snapshot(BranchId::from_bytes(manifest.branch)?)?
        .ok_or("persisted Branch missing")?;
    let storage = Storage::new(handles.storage.clone())?;
    let reader = storage.reader()?;
    let mut tree = FilesystemRead::new(&reader, FilesystemRootId(snapshot.effective_root))?;
    let mut pending = VecDeque::from([".".to_owned()]);
    let mut seen = BTreeSet::new();
    let mut attributes = AttributeReadWork::default();
    let mut inode_classes = BTreeMap::new();
    let mut class_inodes = BTreeMap::new();
    let mut aliases = BTreeMap::<&str, u64>::new();
    for entry in &entries {
        let class = match &entry.kind {
            EntryKind::File(_) => entry.path.as_str(),
            EntryKind::Hardlink(target) => target,
            _ => continue,
        };
        *aliases.entry(class).or_default() += 1;
    }
    let mut verified_bytes = 0;
    while let Some(path) = pending.pop_front() {
        if !seen.insert(path.clone()) {
            return Err("duplicate persisted namespace path".into());
        }
        let entry = expected
            .get(&path)
            .ok_or("unexpected persisted namespace path")?;
        let logical = LogicalPath::new(if path == "." { "" } else { &path })?;
        let resolved = tree.resolve(&logical)?;
        let inode = resolved.value;
        let metadata = read_portable(&reader, inode.metadata_root, inode.kind, &mut attributes)?;
        if metadata.mode != entry.mode
            || metadata.mtime_seconds != entry.mtime_seconds
            || metadata.mtime_nanoseconds != entry.mtime_nanoseconds
        {
            return Err(format!("persisted portable metadata differs: {path}").into());
        }
        match &entry.kind {
            EntryKind::Directory => {
                if inode.kind != InodeKind::Directory {
                    return Err("persisted directory kind differs".into());
                }
                let mut after = None;
                loop {
                    let page = tree.list(&logical, after.as_ref(), 128, 16384)?;
                    for (name, _) in page.entries {
                        pending.push_back(if path == "." {
                            name.as_str().to_owned()
                        } else {
                            format!("{path}/{}", name.as_str())
                        });
                    }
                    after = page.continuation;
                    if after.is_none() {
                        break;
                    }
                }
            }
            EntryKind::Symlink(target) => {
                if inode.kind != InodeKind::Symlink
                    || tree.readlink(&logical)?.as_bytes() != target.as_bytes()
                {
                    return Err("persisted symlink kind/target differs".into());
                }
            }
            EntryKind::File(_) | EntryKind::Hardlink(_) => {
                let (content, class) = match &entry.kind {
                    EntryKind::File(content) => (content, path.as_str()),
                    EntryKind::Hardlink(target) => match &expected[target].kind {
                        EntryKind::File(content) => (content, target.as_str()),
                        _ => return Err("frozen hardlink target kind".into()),
                    },
                    _ => unreachable!(),
                };
                if inode.kind != InodeKind::RegularFile
                    || inode.namespace_ref_count != aliases[class]
                {
                    return Err("persisted regular kind/link count differs".into());
                }
                if inode_classes
                    .insert(resolved.serial, class.to_owned())
                    .is_some_and(|old| old != class)
                    || class_inodes
                        .insert(class.to_owned(), resolved.serial)
                        .is_some_and(|old| old != resolved.serial)
                {
                    return Err("persisted alias classes differ".into());
                }
                let bytes =
                    Timing::disabled("independent.persisted.bytes", |timer| -> Result<u64> {
                        let view =
                            FileView::open(&reader, inode.content_root, timer.child("open"))?;
                        if view.logical_len() != content.len() {
                            return Err("persisted logical file length differs".into());
                        }
                        let mut wanted = vec![0; 1024 * 1024];
                        let mut observed = Vec::with_capacity(wanted.len());
                        let mut offset = 0;
                        let mut hash = reference::Sha256::new();
                        while offset < content.len() {
                            let count = (content.len() - offset).min(wanted.len() as u64) as usize;
                            observed.clear();
                            view.read_range(
                                &reader,
                                offset..offset + count as u64,
                                &mut observed,
                                timer,
                            )?;
                            if observed.len() != count {
                                return Err("persisted read byte count differs".into());
                            }
                            match content {
                                Content::Digest { .. } => hash.update(&observed),
                                _ => {
                                    if content.read_at(offset, &mut wanted[..count])? != count
                                        || observed != wanted[..count]
                                    {
                                        return Err(format!(
                                            "persisted exact bytes differ: {path} at {offset}"
                                        )
                                        .into());
                                    }
                                }
                            }
                            offset += count as u64;
                        }
                        if let Content::Digest { sha256, .. } = content {
                            if crate::hex(&hash.finish()) != *sha256 {
                                return Err("persisted custody digest differs".into());
                            }
                        }
                        Ok(offset)
                    })
                    .0?;
                verified_bytes += bytes;
            }
        }
    }
    if seen.len() != expected.len() {
        return Err("persisted namespace path count differs".into());
    }
    let root = crate::hex(&snapshot.effective_root.to_bytes());
    drop(tree);
    drop(reader);
    drop(storage);
    handles.seal()?;
    events.numeric_fields("workspace_verified", Some(events.span(begun)), "independent current typed/authenticated reads; complete declared names/kinds/portable metadata/link classes and every payload byte; existing current format checked transitively, no retired format substituted", &[("status", "PASS".into()), ("root", root)], &[("paths", seen.len() as u64), ("verified_bytes", verified_bytes)])?;
    Ok(())
}
