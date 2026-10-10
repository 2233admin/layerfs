//! Offline independent current-format graph and complete semantic tree proof.
use crate::{args::Args, events::Events, project::namespace::reference, Result};
use layerfs_bridge::provision::StoreManifest;
use layerfs_content::object::{AuthenticatedObjects, ObjectId};
use layerfs_content::{
    file::{mapping, FileContent, FileView},
    filesystem::{
        attributes::read::{read_portable, AttributeReadWork},
        FilesystemRead, FilesystemRootId, LogicalPath,
    },
    inode_leaf::InodeKind,
};
use layerfs_history::{BranchId, CatalogId, CommitId, HistoryCatalog, LayerStackId};
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile};
use layerfs_storage::{port::PackPersistence, Storage};
use layerfs_telemetry::timer::Timing;
use reference::workspace_common::{Content, Entry, EntryKind};
use std::{
    collections::{BTreeMap, BTreeSet, VecDeque},
    fs,
    io::Read,
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

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct FileIdentity {
    pub serial: u64,
    pub content_root: ObjectId,
    pub references: u64,
}

pub struct VerifiedTree {
    pub paths: u64,
    pub bytes: u64,
    pub file_roots: BTreeSet<ObjectId>,
    pub files: BTreeMap<String, FileIdentity>,
}

fn verify_entries(
    reader: &dyn AuthenticatedObjects,
    root: ObjectId,
    entries: &[Entry],
    membership_only: bool,
) -> Result<(u64, u64, BTreeSet<ObjectId>)> {
    let proof = verify_tree(reader, root, entries, membership_only, None, false)?;
    Ok((proof.paths, proof.bytes, proof.file_roots))
}

/// Current public semantic proof with optional original M1 selective scope.
pub fn verify_tree(
    reader: &dyn AuthenticatedObjects,
    root: ObjectId,
    entries: &[Entry],
    membership_only: bool,
    m1: Option<&crate::edit_model::M1State>,
    mapping_profile: bool,
) -> Result<VerifiedTree> {
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
    let mut files = BTreeMap::new();
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
        let class = match &entry.kind {
            EntryKind::Hardlink(target) => target.as_str(),
            _ => path.as_str(),
        };
        let (mode, mtime) = if let Some(scope) = m1 {
            (
                scope
                    .directory_modes
                    .get(&path)
                    .or_else(|| scope.file_modes.get(class))
                    .copied(),
                scope.file_mtimes.get(class).copied(),
            )
        } else {
            (
                Some(entry.mode),
                Some((entry.mtime_seconds, entry.mtime_nanoseconds)),
            )
        };
        if mode.is_some_and(|mode| metadata.mode != mode)
            || mtime.is_some_and(|(seconds, nanos)| {
                metadata.mtime_seconds != seconds || metadata.mtime_nanoseconds != nanos
            })
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
                files.insert(
                    path.clone(),
                    FileIdentity {
                        serial: resolved.serial,
                        content_root: inode.content_root,
                        references: inode.namespace_ref_count,
                    },
                );
                if membership_only {
                    continue;
                }
                let ranges = if let Some(scope) = m1 {
                    if matches!(content, Content::Digest { .. }) {
                        return Err(
                            "M1 proof requires independent source recipes, not custody digests"
                                .into(),
                        );
                    }
                    scope
                        .ranges
                        .get(&path)
                        .ok_or("M1 regular path lacks declared range scope")?
                        .clone()
                } else {
                    vec![(0, content.len())]
                };
                verified_bytes +=
                    Timing::disabled("independent.persisted.bytes", |timer| -> Result<u64> {
                        let view = FileView::open(reader, inode.content_root, timer.child("open"))?;
                        if view.logical_len() != content.len() {
                            return Err("persisted logical file length differs".into());
                        }
                        if mapping_profile {
                            verify_mapping(reader, &view)?;
                        }
                        let mut wanted = vec![0; 1024 * 1024];
                        let mut observed = Vec::with_capacity(wanted.len());
                        let mut hash = reference::Sha256::new();
                        let mut bytes = 0_u64;
                        for (start, length) in &ranges {
                            let end = start
                                .checked_add(*length)
                                .ok_or("persisted declared range overflow")?;
                            if end > content.len() {
                                return Err("persisted declared range exceeds logical file".into());
                            }
                            let mut offset = *start;
                            while offset < end {
                                let count = (end - offset).min(wanted.len() as u64) as usize;
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
                                bytes += count as u64;
                            }
                        }
                        if let Content::Digest { sha256, .. } = content {
                            if ranges != [(0, content.len())]
                                || crate::hex(&hash.finish()) != *sha256
                            {
                                return Err("persisted custody digest differs".into());
                            }
                        }
                        Ok(bytes)
                    })
                    .0?;
            }
        }
    }
    if seen.len() != expected.len() {
        return Err("persisted namespace path count differs".into());
    }
    crate::edit_oracle::require_complete_membership(reader, tree.root(), &reachable_inodes)?;
    Ok(VerifiedTree {
        paths: seen.len() as u64,
        bytes: verified_bytes,
        file_roots,
        files,
    })
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

/// Complete public mapping grammar, including the frozen boundary and empty form.
pub fn verify_mapping(reader: &dyn AuthenticatedObjects, view: &FileView) -> Result<()> {
    let state = match view.content() {
        FileContent::WholeFile { logical_len } => {
            if logical_len == 0 || logical_len >= 131_072 {
                return Err("current whole-file representation outside frozen boundary".into());
            }
            return Ok(());
        }
        FileContent::Chunked(state) => {
            if (state.logical_len > 0 && state.logical_len < 131_072)
                || state.profile_id != mapping::profile_id()
            {
                return Err(
                    "current chunked representation/profile outside frozen boundary".into(),
                );
            }
            state
        }
    };
    let mut pending = vec![(
        state.mapping_root,
        true,
        state.tree_level,
        state.logical_len,
        state.extent_count,
    )];
    let (mut total_bytes, mut total_extents) = (0_u64, 0_u64);
    while let Some((id, root_page, level, bytes, count)) = pending.pop() {
        let node = mapping::decode_node_with_context(&reader.read_canonical(id)?, root_page)?;
        if (node.level(), node.logical_len(), node.extent_count()) != (level, bytes, count) {
            return Err("current mapping parent/child totals differ".into());
        }
        match node {
            mapping::ExtentNode::Leaf { extents, .. } => {
                for extent in extents {
                    total_bytes = total_bytes
                        .checked_add(u64::from(extent.logical_length()))
                        .ok_or("current mapping byte total overflow")?;
                    total_extents = total_extents
                        .checked_add(1)
                        .ok_or("current mapping count overflow")?;
                }
            }
            mapping::ExtentNode::Branch { children, .. } => {
                let (mut previous_bytes, mut previous_count) = (0_u64, 0_u64);
                let mut next = Vec::with_capacity(children.len());
                for child in children {
                    next.push((
                        child.child_object_id,
                        false,
                        level
                            .checked_sub(1)
                            .ok_or("current mapping depth differs")?,
                        child
                            .cumulative_logical_end
                            .checked_sub(previous_bytes)
                            .ok_or("current mapping child byte summary differs")?,
                        child
                            .cumulative_extent_end
                            .checked_sub(previous_count)
                            .ok_or("current mapping child extent summary differs")?,
                    ));
                    previous_bytes = child.cumulative_logical_end;
                    previous_count = child.cumulative_extent_end;
                }
                pending.extend(next.into_iter().rev());
            }
        }
    }
    if (total_bytes, total_extents) != (state.logical_len, state.extent_count) {
        return Err("current complete mapping totals differ".into());
    }
    Ok(())
}

fn history_selection(case: &str) -> Result<(usize, BTreeSet<usize>)> {
    let (commits, steps) = if case == "small-file-delta-10x30-v1" {
        (30, (0..=30).collect())
    } else if case == "local-snapshot-create-25000-onebyte-v1" {
        (3, (0..=3).collect())
    } else if crate::edit_model::is_m1(case) {
        let plan = reference::v016_stages::mixed_case(case)?.ok_or("original M1 case required")?;
        (
            plan.k,
            if plan.exhaustive_verify_only() {
                (5..=plan.k).step_by(5).collect()
            } else {
                BTreeSet::from([plan.k])
            },
        )
    } else {
        let selected = reference::workspace_registry::resolve(case)?;
        match selected.family {
            "file_size_transition" => {
                let commits = reference::workspace_registry::steps(&selected);
                (commits, (0..=commits).collect())
            }
            "dedup_branch_history" => (
                selected.tier,
                reference::dedup_branch_history::verification_steps(&selected)
                    .into_iter()
                    .collect(),
            ),
            _ => return Err("complete original registered history case required".into()),
        }
    };
    Ok((commits, steps))
}

/// Case-specific parser guard; the public proof also checks original selections.
pub fn history_limit(case: &str) -> Result<usize> {
    Ok(history_selection(case)?.0)
}

fn file_identity(path: &Path) -> Result<(String, u64)> {
    let mut file = fs::File::open(path)?;
    let mut hash = reference::Sha256::new();
    let mut buffer = [0; 65_536];
    let mut length = 0_u64;
    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hash.update(&buffer[..count]);
        length = length
            .checked_add(count as u64)
            .ok_or("provider byte length overflow")?;
    }
    Ok((crate::hex(&hash.finish()), length))
}

/// Canonical original helper observations; future cumulative domain keys allowed.
pub fn created_modes(case: &str, path: &Path) -> Result<BTreeMap<String, u32>> {
    let domain = crate::edit_model::m1_state(case, history_limit(case)?, None)?
        .required_created_directory_modes;
    let body = fs::read_to_string(path)?;
    if !body.is_empty() && !body.ends_with('\n') {
        return Err("M1 created-mode observations require canonical line endings".into());
    }
    let mut result = BTreeMap::new();
    for row in body.lines() {
        let fields = row.split('\t').collect::<Vec<_>>();
        if fields.len() != 2 || !domain.contains(fields[0]) {
            return Err("M1 created-mode path outside original cumulative domain".into());
        }
        let mode = u32::from_str_radix(fields[1], 8)?;
        if mode & !0o1777 != 0
            || format!("{mode:o}") != fields[1]
            || result.insert(fields[0].to_owned(), mode).is_some()
        {
            return Err("M1 created-mode duplicate/noncanonical/mode envelope differs".into());
        }
    }
    Ok(result)
}

pub fn verify_history(args: &Args, events: &mut Events) -> Result<()> {
    let case = args.case.as_deref().ok_or("--case required")?;
    let small = case == "small-file-delta-10x30-v1";
    let snapshot_case = case == "local-snapshot-create-25000-onebyte-v1";
    let legacy = small || snapshot_case;
    let m1 = crate::edit_model::is_m1(case);
    let (commits, original_selection) = history_selection(case)?;
    if args
        .history_step
        .is_some_and(|step| !original_selection.contains(&step))
    {
        return Err("selected history state outside original verification checkpoints".into());
    }
    let modes = if m1 {
        Some(created_modes(
            case,
            args.source
                .as_deref()
                .ok_or("M1 proof requires measured --source-copy created modes")?,
        )?)
    } else {
        if args.source.is_some() {
            return Err(
                "history source-copy observations are only accepted for original M1".into(),
            );
        }
        None
    };
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
    if manifest.profile != layerfs_bridge::provision::StoreProfile::Disposable {
        return Err("history proof requires explicitly provisioned Disposable profile".into());
    }
    let sealed = args.sealed.as_ref().ok_or("--sealed required")?;
    let before = file_identity(sealed)?;
    let config =
        PersistenceConfig::sqlite(sealed).with_sqlite_profile(SqlitePersistenceProfile::Disposable);
    let begun = Instant::now();
    // This sole-owner typed proof copy is distinct from the immutable SQL census
    // input. Seal honestly reports its resulting bytes; no read-only claim.
    let handles = Handles::open_writable(config, &manifest.binding, manifest.cursor_key)?;
    let catalog = handles.history.catalog_id();
    if catalog != CatalogId::derive(&manifest.binding)?
        || handles.profile().persistence != SqlitePersistenceProfile::Disposable
        || handles.profile().journal_mode.to_ascii_lowercase() != "wal"
        || handles.profile().synchronous != 0
    {
        return Err("public provider catalog/profile binding differs".into());
    }
    let incarnation = handles.history.incarnation();
    let branch = BranchId::from_bytes(manifest.branch)?;
    let stack = LayerStackId::from_bytes(manifest.stack)?;
    let snapshot = handles
        .history
        .branch_snapshot(branch)?
        .ok_or("persisted history Branch missing")?;
    let initial = ObjectId::from_bytes(&manifest.root)?;
    let base = handles
        .history
        .layer(snapshot.branch.base_layer)?
        .ok_or("history base Layer missing")?;
    let stack_record = handles
        .history
        .layer_stack(stack)?
        .ok_or("history LayerStack missing")?;
    if snapshot.base_root != initial
        || snapshot.branch.id != branch
        || snapshot.branch.stack != stack
        || base.stack != stack
        || base.root != initial
        || stack_record.id != stack
        || stack_record.scope != snapshot.scope
        || stack_record.profile != snapshot.profile
    {
        return Err("history initial root/manifest stack/branch/base binding differs".into());
    }
    let storage = Storage::new(handles.storage.clone())?;
    let reader = storage.reader()?;
    let (mut previous, mut final_root, mut selected_root) = (None, initial, initial);
    let (mut paths, mut verified_bytes, mut verified_roots) = (0_u64, 0_u64, 0_u64);
    let mut ids = BTreeSet::new();
    let mut roots = BTreeSet::new();
    let mut acknowledged = Vec::new();
    let mut observed = BTreeMap::new();
    let mut file_roots = BTreeSet::new();
    for (step, row) in rows.into_iter().enumerate() {
        let columns = row.split('\t').collect::<Vec<_>>();
        if columns.len() != 5
            || columns[0].parse::<usize>()? != step
            || (!legacy && columns[0] != step.to_string())
        {
            return Err("history transcript index/cardinality differs".into());
        }
        if !legacy
            && ((original_selection.contains(&step) && columns[4] == "-")
                || (!original_selection.contains(&step) && columns[4] != "-"))
        {
            return Err("history transcript selected manifest/omission differs".into());
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
                || record.id != id
                || record.parent != previous
                || parent != previous
                || record.root != root
                || record.stack != stack
                || record.base_layer != snapshot.branch.base_layer
            {
                return Err(
                    "historical Commit root/ancestry/stack/base differs from acknowledgement"
                        .into(),
                );
            }
            previous = Some(id);
        }
        if !legacy {
            let tree = FilesystemRead::new(&reader, FilesystemRootId(root))?;
            if tree.root().scope().object() != snapshot.scope
                || tree.root().profile() != snapshot.profile
            {
                return Err("acknowledged history filesystem scope/profile differs".into());
            }
        }
        acknowledged.push(root);
        let selected = original_selection.contains(&step)
            && args.history_step.is_none_or(|chosen| chosen == step);
        if selected {
            let expected_body = fs::read_to_string(columns[4])?;
            let proof = if m1 {
                let materialization = crate::edit_model::m1_state(case, step, None)?;
                if crate::edit_model::m1_scope_tsv(&materialization)? != expected_body {
                    return Err("M1 selected scope differs from original independent state".into());
                }
                let scope = crate::edit_model::m1_state(case, step, modes.as_ref())?;
                verify_tree(&reader, root, &scope.entries, false, Some(&scope), true)?
            } else {
                let entries = reference::workspace_common::decode_manifest(&expected_body)?;
                if !legacy || snapshot_case {
                    let original = crate::edit_model::entries(case, step)?;
                    if reference::workspace_common::manifest(&original)? != expected_body {
                        return Err("selected manifest differs from original complete state".into());
                    }
                }
                verify_tree(&reader, root, &entries, false, None, !legacy)?
            };
            if legacy
                && proof.paths
                    != if small {
                        11
                    } else if step == 0 {
                        1
                    } else {
                        25001
                    }
            {
                return Err("original retained state namespace cardinality differs".into());
            }
            paths += proof.paths;
            verified_bytes += proof.bytes;
            file_roots.extend(&proof.file_roots);
            observed.insert(step, proof.files);
            selected_root = root;
            verified_roots += 1;
            events.numeric_fields("history_root_verified", None,
                "original independent selected byte/metadata scope; current public authenticated structure/mapping and complete inode census; all acknowledgement ancestry remains bound",
                &[("root", columns[3].into()), ("commit_id", columns[1].into()), ("parent", columns[2].into())],
                &[("step", step as u64), ("paths", proof.paths), ("verified_bytes", proof.bytes)])?;
        }
        final_root = root;
    }
    if ids.len() != commits
        || previous != snapshot.branch.head_commit
        || final_root != snapshot.effective_root
    {
        return Err("complete history final head/root/cardinality differs".into());
    }
    if !legacy && !m1 {
        verify_reference_identities(case, &reader, &acknowledged, &observed, events)?;
    }
    if small {
        let dependencies = payload_dependencies(&handles, &file_roots)?;
        events.numeric_fields("history_payload_encoding", None,
            "bounded authenticated public pack reads; actual current WholeFile/PREFIX dependency records; complete byte proof already reconstructed these objects; retired schema10 encoding not asserted",
            &[("root", crate::hex(&selected_root.to_bytes()))],
            &[("payload_objects", file_roots.len() as u64), ("payload_dependency_records", dependencies)])?;
    }
    drop(reader);
    drop(storage);
    handles.seal()?;
    let after = file_identity(sealed)?;
    events.numeric_fields("workspace_verified", Some(events.span(begun)),
        "original selected payload checkpoints plus all typed acknowledgements/parents/final head; independent bytes/metadata under the declared scope, public provider schema/source/binding validation and exhaustive inode census; separate typed proof copy",
        &[("status", "PASS".into()), ("root", crate::hex(&selected_root.to_bytes())),
          ("final_head_root", crate::hex(&final_root.to_bytes())),
          ("final_head_commit_id", previous.map(|id| crate::hex(id.as_slice())).unwrap_or_else(|| "-".into())),
          ("initial_root", crate::hex(initial.as_bytes())),
          ("provider_validation", "current-public-schema-source-binding-validated".into()),
          ("catalog_id", crate::hex(catalog.as_slice())),
          ("binding_sha256", reference::sdk_edit_common::sha256_hex(&manifest.binding)),
          ("stack_id", crate::hex(stack.as_slice())), ("branch_id", crate::hex(branch.as_slice())),
          ("base_layer_id", crate::hex(snapshot.branch.base_layer.as_slice())),
          ("acknowledged_transcript_sha256", reference::sdk_edit_common::sha256_hex(body.as_bytes())),
          ("provider_store_sha256", before.0.clone()), ("provider_store_after_sha256", after.0.clone())],
        &[("roots", verified_roots), ("commits", commits as u64), ("paths", paths),
          ("verified_bytes", verified_bytes), ("catalog_incarnation", incarnation),
          ("provider_store_size", before.1), ("provider_store_after_size", after.1),
          ("provider_store_unchanged", u64::from(before == after))])?;
    Ok(())
}

fn identities(
    reader: &dyn AuthenticatedObjects,
    root: ObjectId,
    entries: &[Entry],
) -> Result<BTreeMap<String, FileIdentity>> {
    let mut tree = FilesystemRead::new(reader, FilesystemRootId(root))?;
    let mut result = BTreeMap::new();
    for entry in entries {
        if !matches!(entry.kind, EntryKind::File(_) | EntryKind::Hardlink(_)) {
            continue;
        }
        let resolved = tree.resolve(&LogicalPath::new(&entry.path)?)?;
        if resolved.value.kind != InodeKind::RegularFile {
            return Err("historical identity target is not regular".into());
        }
        result.insert(
            entry.path.clone(),
            FileIdentity {
                serial: resolved.serial,
                content_root: resolved.value.content_root,
                references: resolved.value.namespace_ref_count,
            },
        );
    }
    Ok(result)
}

fn verify_reference_identities(
    case: &str,
    reader: &dyn AuthenticatedObjects,
    roots: &[ObjectId],
    observed: &BTreeMap<usize, BTreeMap<String, FileIdentity>>,
    events: &mut Events,
) -> Result<()> {
    let selected = reference::workspace_registry::resolve(case)?;
    if selected.family == "file_size_transition" {
        if reference::file_size_transition::plan(case)?.alias {
            let last = roots.len() - 1;
            let before = identities(
                reader,
                roots[last - 1],
                &crate::edit_model::entries(case, last - 1)?,
            )?;
            let after = identities(
                reader,
                roots[last],
                &crate::edit_model::entries(case, last)?,
            )?;
            let target = reference::file_size_transition::TARGET;
            let alias = reference::file_size_transition::ALIAS;
            let prior = before[target];
            if before[alias] != prior
                || prior.references != 2
                || after[target].serial == after[alias].serial
                || after[target].references != 1
                || after[alias].references != 1
                || after[alias].serial != prior.serial
                || after[alias].content_root != prior.content_root
            {
                return Err(
                    "original boundary surviving alias inode/content identity differs".into(),
                );
            }
            events.numeric_fields("history_alias_identity", None,
                "current pre-replacement/final scoped inode serial and content-root retention; exact bytes/classes independently verified",
                &[("before_content_root", crate::hex(prior.content_root.as_bytes())),
                  ("alias_content_root", crate::hex(after[alias].content_root.as_bytes())),
                  ("target_content_root", crate::hex(after[target].content_root.as_bytes()))],
                &[("before_inode_serial", prior.serial), ("alias_inode_serial", after[alias].serial), ("target_inode_serial", after[target].serial)])?;
        }
        return Ok(());
    }
    let original = crate::edit_model::entries(case, 0)?;
    let initial = identities(reader, roots[0], &original)?;
    let mut recurring = BTreeMap::new();
    if selected.kind == "recurring" {
        recurring.insert(
            0,
            initial[&reference::dedup_workloads::shard_path(192)].content_root,
        );
    }
    let mut unchanged = 0_u64;
    for (step, files) in observed {
        let entries = crate::edit_model::entries(case, *step)?;
        let delta = reference::workspace_common::fast_delta_from_entries(
            &original,
            &entries,
            1,
            "dedup_branch_history",
        )?;
        for (path, actual) in files {
            if !delta.changed_paths.contains(path) {
                if initial
                    .get(path)
                    .is_none_or(|prior| prior.content_root != actual.content_root)
                {
                    return Err("original unchanged current content reference differs".into());
                }
                unchanged += 1;
            }
        }
        if selected.kind == "metadata"
            && files.iter().any(|(path, actual)| {
                initial
                    .get(path)
                    .is_none_or(|prior| prior.content_root != actual.content_root)
            })
        {
            return Err("original metadata history changed file content roots".into());
        }
        if selected.kind == "recurring" {
            let file = files[&reference::dedup_workloads::shard_path(192)].content_root;
            if recurring
                .insert(step % 2, file)
                .is_some_and(|prior| prior != file)
            {
                return Err("original recurring history changed A/B current content roots".into());
            }
        }
    }
    events.numeric_fields("history_reference_reuse", None,
        "original unchanged/metadata/A-B content-root identity checks in current format; no retired encoding or physical storage quota claim",
        &[("case", case.into())], &[("unchanged_file_root_observations", unchanged), ("recurring_classes", recurring.len() as u64)])?;
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
