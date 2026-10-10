//! Offline independent current-format graph and complete semantic tree proof.
use crate::{args::Args, events::Events, project::namespace::reference, Result};
use layerfs_bridge::provision::StoreManifest;
use layerfs_content::object::{AuthenticatedObjects, ObjectId};
use layerfs_content::{
    file::FileView,
    filesystem::{
        attributes::read::{read_portable, AttributeReadWork},
        FilesystemRead, FilesystemRootId, LogicalPath,
    },
    inode_leaf::InodeKind,
};
use layerfs_history::{BranchId, CommitId, HistoryCatalog};
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile};
use layerfs_storage::{port::PackPersistence, Storage};
use layerfs_telemetry::timer::Timing;
use reference::workspace_common::{Content, Entry, EntryKind};
use std::{
    collections::{BTreeMap, BTreeSet, VecDeque},
    fs,
    path::Path,
    time::Instant,
};

pub fn verify(args: &Args, events: &mut Events) -> Result<()> {
    let case = args.case.as_deref().ok_or("--case required")?;
    let entries = match reference::workspace_registry::resolve(case) {
        Ok(selected) if selected.kind == "git-tool" => git_hybrid_entries(
            case,
            args.source
                .as_deref()
                .ok_or("Git proof requires exact precommit --source-copy custody manifest")?,
        )?,
        _ => {
            if args.source.is_some() {
                return Err(
                    "precommit custody is only accepted by frozen Git workflow proof".into(),
                );
            }
            crate::edit_model::entries(case, 1)?
        }
    };
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
    let (paths, verified_bytes, _) = verify_entries(
        &reader,
        snapshot.effective_root,
        &entries,
        args.mode == "verify-membership",
    )?;
    if args.mode != "verify-membership" {
        if let Some(scenario) = crate::edit_model::scenario(case) {
            crate::edit_oracle::verify_edit(
                &reader,
                layerfs_content::object::ObjectId::from_bytes(&manifest.root)?,
                snapshot.effective_root,
                &scenario,
            )?;
        }
    }
    let root = crate::hex(&snapshot.effective_root.to_bytes());
    drop(reader);
    drop(storage);
    handles.seal()?;
    events.numeric_fields("workspace_verified", Some(events.span(begun)), "independent current typed/authenticated reads; complete names/kinds/metadata/link classes and inode-table membership; membership-only mode reuses prior byte proof, full mode checks every payload byte and applicable original edit identity/retention; no retired format substituted", &[("status", "PASS".into()), ("root", root)], &[("paths", paths), ("verified_bytes", verified_bytes), ("membership_only", u64::from(args.mode == "verify-membership"))])?;
    Ok(())
}

fn git_hybrid_entries(case: &str, custody: &Path) -> Result<Vec<Entry>> {
    let selected = reference::workspace_registry::resolve(case)?;
    if selected.kind != "git-tool" || selected.family != "git_tool_workflow" {
        return Err("frozen Git workflow case required for repository custody".into());
    }
    let body = fs::read_to_string(custody)?;
    let repository = reference::workspace_common::decode_manifest(&body)?;
    if reference::workspace_common::manifest(&repository)? != body {
        return Err("Git precommit manifest must be canonical complete custody".into());
    }
    let mut entries = crate::edit_model::entries(case, 1)?;
    let independent_root = entries
        .iter()
        .find(|entry| entry.path == ".")
        .ok_or("independent Git root missing")?
        .clone();
    let mut has_repository = false;
    let mut has_index = false;
    let mut logical_bytes = reference::workspace_common::validate_entries(&entries)?;
    for entry in repository {
        if entry.path == "." {
            if !matches!(entry.kind, EntryKind::Directory)
                || entry.mode != independent_root.mode
                || entry.mtime_seconds != independent_root.mtime_seconds
                || entry.mtime_nanoseconds != independent_root.mtime_nanoseconds
            {
                return Err("Git custody root differs from independent source root".into());
            }
            continue;
        }
        if entry.path != ".git" && !entry.path.starts_with(".git/") {
            return Err("Git custody may not replace independent working source".into());
        }
        match &entry.kind {
            EntryKind::Directory => has_repository |= entry.path == ".git",
            EntryKind::File(Content::Digest { len, sha256 }) => {
                if sha256.len() != 64
                    || !sha256
                        .bytes()
                        .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
                {
                    return Err("Git custody requires complete SHA-256 bytes".into());
                }
                has_index |= entry.path == ".git/index";
                logical_bytes = logical_bytes
                    .checked_add(*len)
                    .ok_or("Git complete byte overflow")?;
            }
            _ => return Err("Git custody requires original regular files/directories".into()),
        }
        entries.push(entry);
    }
    if !has_repository || !has_index || logical_bytes > 256 * 1024 * 1024 {
        return Err("Git complete repository/index/cap differs".into());
    }
    reference::workspace_common::validate_entries(&entries)?;
    Ok(entries)
}

fn verify_entries(
    reader: &dyn AuthenticatedObjects,
    root: ObjectId,
    entries: &[Entry],
    membership_only: bool,
) -> Result<(u64, u64, BTreeSet<ObjectId>)> {
    let expected = entries
        .iter()
        .map(|entry| (entry.path.clone(), entry))
        .collect::<BTreeMap<_, _>>();
    let mut tree = FilesystemRead::new(reader, FilesystemRootId(root))?;
    let mut pending = VecDeque::from([".".to_owned()]);
    let mut seen = BTreeSet::new();
    let mut reachable_inodes = BTreeSet::new();
    let mut attributes = AttributeReadWork::default();
    let mut inode_classes = BTreeMap::new();
    let mut class_inodes = BTreeMap::new();
    let mut aliases = BTreeMap::<&str, u64>::new();
    for entry in entries {
        let class = match &entry.kind {
            EntryKind::File(_) => entry.path.as_str(),
            EntryKind::Hardlink(target) => target,
            _ => continue,
        };
        *aliases.entry(class).or_default() += 1;
    }
    let mut verified_bytes = 0;
    let mut file_roots = BTreeSet::new();
    while let Some(path) = pending.pop_front() {
        if !seen.insert(path.clone()) {
            return Err("duplicate persisted namespace path".into());
        }
        let entry = expected
            .get(&path)
            .ok_or("unexpected persisted namespace path")?;
        let logical = LogicalPath::new(if path == "." { "" } else { &path })?;
        let resolved = tree.resolve(&logical)?;
        reachable_inodes.insert(resolved.serial);
        let inode = resolved.value;
        let metadata = read_portable(reader, inode.metadata_root, inode.kind, &mut attributes)?;
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
                file_roots.insert(inode.content_root);
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
                if membership_only {
                    continue;
                }
                let bytes =
                    Timing::disabled("independent.persisted.bytes", |timer| -> Result<u64> {
                        let view = FileView::open(reader, inode.content_root, timer.child("open"))?;
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
                                reader,
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
    crate::edit_oracle::require_complete_membership(reader, tree.root(), &reachable_inodes)?;
    Ok((seen.len() as u64, verified_bytes, file_roots))
}

fn identity_bytes<const N: usize>(value: &str) -> Result<[u8; N]> {
    if value.len() != 2 * N
        || !value
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return Err("history identity must be canonical lowercase hex".into());
    }
    let mut bytes = [0; N];
    for (index, byte) in bytes.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&value[index * 2..index * 2 + 2], 16)?;
    }
    Ok(bytes)
}

pub fn verify_history(args: &Args, events: &mut Events) -> Result<()> {
    let small = args.case.as_deref() == Some("small-file-delta-10x30-v1");
    let snapshot_case = args.case.as_deref() == Some("local-snapshot-create-25000-onebyte-v1");
    if !small && !snapshot_case {
        return Err("complete original registered history case required".into());
    }
    let commits = if small { 30 } else { 3 };
    if args.history_step.is_some_and(|step| step > commits) {
        return Err("selected history state exceeds original schedule".into());
    }
    let body = fs::read_to_string(
        args.history_file
            .as_ref()
            .ok_or("--history-file required")?,
    )?;
    let rows = body.lines().collect::<Vec<_>>();
    if rows.len() != commits + 1 {
        return Err("original history requires initial and all declared roots".into());
    }
    let manifest = StoreManifest::decode(&fs::read(&args.manifest)?)?;
    let config = PersistenceConfig::sqlite(args.sealed.as_ref().ok_or("--sealed required")?)
        .with_sqlite_profile(SqlitePersistenceProfile::Disposable);
    let begun = Instant::now();
    let handles = Handles::open_writable(config, &manifest.binding, manifest.cursor_key)?;
    let snapshot = handles
        .history
        .branch_snapshot(BranchId::from_bytes(manifest.branch)?)?
        .ok_or("persisted history Branch missing")?;
    let initial = ObjectId::from_bytes(&manifest.root)?;
    if snapshot.base_root != initial {
        return Err("history initial root differs from sealed acquisition".into());
    }
    let storage = Storage::new(handles.storage.clone())?;
    let reader = storage.reader()?;
    let mut previous = None;
    let mut ids = BTreeSet::new();
    let mut roots = BTreeSet::new();
    let mut paths = 0;
    let mut verified_bytes = 0;
    let mut final_root = initial;
    let mut file_roots = BTreeSet::new();
    let mut selected_root = initial;
    let mut verified_roots = 0;
    for (step, row) in rows.into_iter().enumerate() {
        let columns = row.split('\t').collect::<Vec<_>>();
        if columns.len() != 5 || columns[0].parse::<usize>()? != step {
            return Err("history transcript index/cardinality differs".into());
        }
        let root = ObjectId::from_bytes(&identity_bytes::<32>(columns[3])?)?;
        if !roots.insert(root) && small {
            return Err("history state roots are not distinct".into());
        }
        if step == 0 {
            if columns[1] != "-" || columns[2] != "-" || root != initial {
                return Err("history initial acknowledgement differs".into());
            }
        } else {
            let id = CommitId::from_bytes(identity_bytes::<33>(columns[1])?)?;
            let parent = if columns[2] == "-" {
                None
            } else {
                Some(CommitId::from_bytes(identity_bytes::<33>(columns[2])?)?)
            };
            let record = handles
                .history
                .commit(id)?
                .ok_or("acknowledged historical Commit missing")?;
            if !ids.insert(id)
                || record.parent != previous
                || parent != previous
                || record.root != root
                || record.stack != snapshot.branch.stack
                || record.base_layer != snapshot.branch.base_layer
            {
                return Err(
                    "historical Commit root/ancestry/stack/base differs from acknowledgement"
                        .into(),
                );
            }
            previous = Some(id);
        }
        if args.history_step.is_none_or(|selected| selected == step) {
            let entries =
                reference::workspace_common::decode_manifest(&fs::read_to_string(columns[4])?)?;
            if snapshot_case {
                let original = crate::edit_model::entries(args.case.as_deref().unwrap(), step)?;
                if reference::workspace_common::manifest(&original)?
                    != fs::read_to_string(columns[4])?
                {
                    return Err(
                        "local snapshot manifest differs from original complete state".into(),
                    );
                }
            }
            let (count, bytes, files) = verify_entries(&reader, root, &entries, false)?;
            file_roots.extend(files);
            selected_root = root;
            verified_roots += 1;
            let expected_paths = if small {
                11
            } else if step == 0 {
                1
            } else {
                25001
            };
            if count != expected_paths {
                return Err("original retained state namespace cardinality differs".into());
            }
            paths += count;
            verified_bytes += bytes;
            events.numeric_fields("history_root_verified", None,
            "independent original SHA-256/modes/mtime/lengths; current authenticated reads and complete inode census; full original acknowledgement ancestry bound even for one selected state",
            &[("root", columns[3].into()), ("commit_id", columns[1].into()), ("parent", columns[2].into())],
            &[("step", step as u64), ("paths", count), ("verified_bytes", bytes)])?;
        }
        final_root = root;
    }
    if previous != snapshot.branch.head_commit || final_root != snapshot.effective_root {
        return Err("complete history final head/root differs".into());
    }
    if small {
        let payload_dependencies = payload_dependencies(&handles, &file_roots)?;
        events.numeric_fields("history_payload_encoding", None,
        "bounded authenticated public pack reads; actual current WholeFile/PREFIX dependency records; complete byte proof already reconstructed these objects; retired schema10 encoding not asserted",
        &[("root",crate::hex(&selected_root.to_bytes()))], &[("payload_objects",file_roots.len() as u64), ("payload_dependency_records",payload_dependencies)])?;
    }
    drop(reader);
    drop(storage);
    handles.seal()?;
    events.numeric_fields("workspace_verified", Some(events.span(begun)),
        "all declared retained roots; exact original names/modes/mtime/bytes/SHA-256; current typed/authenticated graph and exhaustive inode census; complete known Commit ancestry and final head",
        &[("status", "PASS".into()), ("root", crate::hex(&selected_root.to_bytes())), ("final_head_root", crate::hex(&final_root.to_bytes()))],
        &[("roots",verified_roots), ("commits",commits as u64), ("paths",paths), ("verified_bytes",verified_bytes)])?;
    Ok(())
}

fn payload_dependencies(handles: &Handles, files: &BTreeSet<ObjectId>) -> Result<u64> {
    use layerfs_storage::{
        encoding::{delta::record::stored_base, framed_record},
        pack::{group_view, parse_header, GroupCodec, PackLane},
    };
    let mut dependencies = 0;
    for id in files {
        let mut located = Vec::new();
        handles.storage.locate(&[*id], &mut located)?;
        if located.len() != 1 {
            return Err("historical payload locator absent/duplicated".into());
        }
        let location = located[0].location;
        let mut packs = Vec::new();
        handles
            .storage
            .read_packs(&[location.pack_id], &mut packs)?;
        if packs.len() != 1 {
            return Err("historical payload pack absent/duplicated".into());
        }
        let body = packs[0].body();
        let header = parse_header(body)?;
        let group = group_view(body, header, location.group_number)?;
        if !matches!(header.lane, PackLane::WholeFile | PackLane::Singleton)
            || group.codec != GroupCodec::Raw
        {
            return Err(
                "original small files did not produce current whole-file payload records".into(),
            );
        }
        let record = framed_record(&body[group.start..group.end], location.record_number)?;
        dependencies += u64::from(
            stored_base(
                header.lane,
                record,
                location.canonical_length,
                location.role,
            )?
            .is_some(),
        );
    }
    Ok(dependencies)
}
