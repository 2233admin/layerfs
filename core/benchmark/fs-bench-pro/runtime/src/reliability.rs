//! Original two integrity proofs: public initial reads and an isolated RAW target.
//! SQL injection belongs to the independent Python fixture adapter. These reads
//! never equate an offline target failure with the required ordinary FUSE EIO.
use crate::{args::Args, events::Events, reference, workspace_oracle, Result};
use layerfs_bridge::provision::{StoreManifest, StoreProfile};
use layerfs_content::{AuthenticatedObjects, ContentResult, ObjectId, ObjectRole};
use layerfs_history::{BranchId, CatalogId, HistoryCatalog, LayerStackId};
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile};
use layerfs_storage::{
    encoding::{delta::record, framed_record, raw_payload},
    location::PackDomain,
    pack::{
        assemble::{assemble, build_group},
        layout::{group_view, parse_header, GroupCodec, PackLane},
    },
    port::{PackPersistence, PersistenceError},
    Storage, StorageError,
};
use std::{
    collections::BTreeMap,
    fs,
    io::{Read, Write},
    path::{Path, PathBuf},
    time::Instant,
};

pub const TARGET: &str = "sentinels/f0003.dat";
const TARGET_SCHEMA: &str = "fs-bench-pro-reliability-target-v1";
const MUTATION_SCHEMA: &str = "fs-bench-pro-reliability-mutation-v1";

pub fn selected(id: &str) -> Result<reference::workspace_common::Case> {
    let case = reference::workspace_reliability::resolve(id)?;
    if !matches!(case.kind, "corrupt-descendant" | "missing-descendant") {
        return Err("only exact original descendant integrity cases are admitted".into());
    }
    Ok(case)
}
pub fn digest(path: &Path) -> Result<(String, u64)> {
    if !fs::symlink_metadata(path)?.is_file() {
        return Err("regular immutable reliability artifact required".into());
    }
    let mut input = fs::File::open(path)?;
    let mut hash = reference::Sha256::new();
    let mut bytes = 0;
    let mut buffer = [0; 65536];
    loop {
        let count = input.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hash.update(&buffer[..count]);
        bytes += count as u64;
    }
    Ok((crate::hex(&hash.finish()), bytes))
}
fn closed(path: &Path) -> Result<(String, u64)> {
    for suffix in ["-wal", "-shm", "-journal"] {
        if fs::symlink_metadata(format!("{}{suffix}", path.display())).is_ok() {
            return Err("closed reliability Store must have no sidecar, even empty".into());
        }
    }
    digest(path)
}
fn inputs(args: &Args) -> Result<(reference::workspace_common::Case, StoreManifest, PathBuf)> {
    let case = selected(args.case.as_deref().ok_or("--case required")?)?;
    if args.history_step.is_some() || args.installed_manifest.is_some() {
        return Err("unrelated reliability options refused".into());
    }
    let manifest = StoreManifest::decode(&fs::read(&args.manifest)?)?;
    if manifest.profile != StoreProfile::Disposable {
        return Err("explicit Disposable manifest required".into());
    }
    let store = args.sealed.clone().ok_or("--sealed required")?;
    closed(&store)?;
    Ok((case, manifest, store))
}
fn open(store: &Path, manifest: &StoreManifest) -> Result<Handles> {
    let handles = Handles::open_writable(
        PersistenceConfig::sqlite(store).with_sqlite_profile(SqlitePersistenceProfile::Disposable),
        &manifest.binding,
        manifest.cursor_key,
    )?;
    if handles.history.catalog_id() != CatalogId::derive(&manifest.binding)?
        || handles.profile().persistence != SqlitePersistenceProfile::Disposable
        || handles.profile().journal_mode.to_ascii_lowercase() != "wal"
        || handles.profile().synchronous != 0
        || handles.profile().foreign_keys != 1
    {
        return Err("public reliability provider binding/profile differs".into());
    }
    let snapshot = handles
        .history
        .branch_snapshot(BranchId::from_bytes(manifest.branch)?)?
        .ok_or("original reliability Branch absent")?;
    if snapshot.branch.stack != LayerStackId::from_bytes(manifest.stack)?
        || snapshot.branch.head_commit.is_some()
        || snapshot.base_root.as_bytes() != &manifest.root
        || snapshot.effective_root.as_bytes() != &manifest.root
    {
        return Err("original reliability genesis history/root differs".into());
    }
    Ok(handles)
}
fn artifact(events: &mut Events, label: &str, extension: &str, bytes: &[u8]) -> Result<PathBuf> {
    let (path, mut output) = events.output(label, extension)?;
    output.write_all(bytes)?;
    output.flush()?;
    Ok(path)
}
pub fn encode_table(schema: &str, values: &BTreeMap<String, String>) -> Result<String> {
    let mut body = format!("{schema}\n");
    for (key, value) in values {
        if key.is_empty()
            || value.is_empty()
            || key.contains(['\t', '\n', '\r'])
            || value.contains(['\t', '\n', '\r'])
        {
            return Err("noncanonical reliability TSV".into());
        }
        body.push_str(&format!("{key}\t{value}\n"));
    }
    Ok(body)
}
pub fn decode_table(body: &str, schema: &str) -> Result<BTreeMap<String, String>> {
    let mut lines = body.lines();
    if lines.next() != Some(schema) {
        return Err("reliability receipt schema differs".into());
    }
    let mut values = BTreeMap::new();
    for row in lines {
        let (key, value) = row
            .split_once('\t')
            .ok_or("two-column reliability TSV required")?;
        if values.insert(key.into(), value.into()).is_some() {
            return Err("duplicate reliability receipt field".into());
        }
    }
    if encode_table(schema, &values)? != body {
        return Err("reliability TSV must be sorted and canonical".into());
    }
    Ok(values)
}
pub fn raw_singleton(canonical: &[u8]) -> Result<Vec<u8>> {
    let raw = raw_payload(canonical, ObjectRole::WholeFile)?;
    let record = record::encode_stored(PackLane::Singleton, raw.len(), raw)?;
    Ok(assemble(
        PackLane::Singleton,
        &[build_group(PackLane::Singleton, &[record], None)?],
    )?)
}
fn set(values: &mut BTreeMap<String, String>, key: &str, value: impl ToString) {
    values.insert(key.into(), value.to_string());
}
fn value<'a>(values: &'a BTreeMap<String, String>, key: &str) -> Result<&'a str> {
    Ok(values
        .get(key)
        .ok_or_else(|| format!("missing reliability receipt {key}"))?)
}
fn string_field(body: &str, key: &str) -> Result<String> {
    let marker = format!("\"{key}\"");
    let mut positions = body.match_indices(&marker);
    let (position, _) = positions.next().ok_or("reliability event field missing")?;
    if positions.next().is_some() {
        return Err("duplicate reliability event field".into());
    }
    let tail = body[position + marker.len()..]
        .trim_start()
        .strip_prefix(':')
        .ok_or("event field colon")?
        .trim_start()
        .strip_prefix('"')
        .ok_or("event string field")?;
    let result = &tail[..tail.find('"').ok_or("event string terminator")?];
    if result.contains(['\\', '\r', '\n']) {
        return Err("escaped reliability identity refused".into());
    }
    Ok(result.into())
}
fn event(body: &str, name: &str) -> Result<String> {
    let rows = body
        .lines()
        .filter(|row| string_field(row, "event").is_ok_and(|actual| actual == name))
        .collect::<Vec<_>>();
    if rows.len() != 1
        || body
            .lines()
            .last()
            .is_none_or(|row| string_field(row, "event").map_or(true, |v| v != "finished"))
        || body
            .lines()
            .any(|row| string_field(row, "event").is_ok_and(|v| v == "failed"))
    {
        return Err("one completed authoritative reliability event required".into());
    }
    Ok(rows[0].into())
}
fn load_initial(args: &Args) -> Result<(BTreeMap<String, String>, Vec<u8>, String)> {
    let source = args
        .source
        .as_deref()
        .ok_or("original initial --source-copy events required")?;
    let bytes = fs::read_to_string(source)?;
    let initial = event(&bytes, "reliability_initial_verified")?;
    if string_field(&initial, "status")? != "PASS" {
        return Err("initial byte proof did not pass".into());
    }
    let target = event(&bytes, "fault_target")?;
    let path = PathBuf::from(string_field(&target, "target_receipt")?);
    if digest(&path)?.0 != string_field(&target, "target_receipt_sha256")? {
        return Err("initial target receipt hash differs".into());
    }
    let values = decode_table(&fs::read_to_string(path)?, TARGET_SCHEMA)?;
    let id = args.case.as_deref().ok_or("--case required")?;
    let manifest = StoreManifest::decode(&fs::read(&args.manifest)?)?;
    if value(&values, "case")? != id
        || value(&values, "path")? != TARGET
        || value(&values, "manifest_sha256")? != digest(&args.manifest)?.0
        || value(&values, "root")? != crate::hex(&manifest.root)
        || value(&values, "branch")? != crate::hex(&manifest.branch)
        || value(&values, "stack")? != crate::hex(&manifest.stack)
        || string_field(&initial, "case")? != id
        || string_field(&initial, "root")? != value(&values, "root")?
    {
        return Err("original reliability target/case/manifest binding differs".into());
    }
    let canonical_path = PathBuf::from(value(&values, "canonical_bytes")?);
    let canonical = fs::read(&canonical_path)?;
    if digest(&canonical_path)?.0 != value(&values, "canonical_sha256")?
        || crate::hex(ObjectId::for_bytes(&canonical).as_bytes()) != value(&values, "object_id")?
    {
        return Err("initial target canonical bytes differ".into());
    }
    let case = selected(id)?;
    let entries = reference::workspace_reliability::fixture_for(&case)?;
    let reference::workspace_common::EntryKind::File(expected) = &entries
        .iter()
        .find(|entry| entry.path == TARGET)
        .ok_or("frozen original target absent")?
        .kind
    else {
        return Err("frozen original target must be regular".into());
    };
    let mut expected_raw = Vec::new();
    expected.write_to(&mut expected_raw)?;
    if raw_payload(&canonical, ObjectRole::WholeFile)? != expected_raw {
        return Err("target canonical payload differs from independent original fixture".into());
    }
    let singleton = PathBuf::from(value(&values, "singleton_pack")?);
    if digest(&singleton)?.0 != value(&values, "singleton_pack_sha256")?
        || fs::read(singleton)? != raw_singleton(&canonical)?
    {
        return Err("public RAW singleton artifact differs".into());
    }
    Ok((values, canonical, digest(source)?.0))
}

pub fn verify_initial(args: &Args, events: &mut Events) -> Result<()> {
    if args.source.is_some() || args.history_file.is_some() {
        return Err("initial reliability proof accepts no prior receipt".into());
    }
    let (case, manifest, path) = inputs(args)?;
    let before = closed(&path)?;
    let begun = Instant::now();
    let handles = open(&path, &manifest)?;
    let storage = Storage::new(handles.storage.clone())?;
    let reader = storage.reader()?;
    let entries = reference::workspace_reliability::fixture_for(&case)?;
    let root = ObjectId::from_bytes(&manifest.root)?;
    let proof = workspace_oracle::verify_tree(&reader, root, &entries, false, None, true)?;
    let id = proof
        .files
        .get(TARGET)
        .ok_or("original target absent")?
        .content_root;
    let canonical = reader.read_objects(&[id])?.remove(0);
    let mut located = Vec::new();
    handles.storage.locate(&[id], &mut located)?;
    let target = *located
        .first()
        .filter(|_| located.len() == 1)
        .ok_or("one exact target locator required")?;
    if target.location.role != ObjectRole::WholeFile
        || raw_payload(&canonical, ObjectRole::WholeFile)?.len() != 32768
    {
        return Err("original first target payload must be current 32768B WholeFile".into());
    }
    let mut packs = Vec::new();
    handles
        .storage
        .read_packs(&[target.location.pack_id], &mut packs)?;
    let pack = packs
        .first()
        .filter(|_| packs.len() == 1)
        .ok_or("one authenticated target pack required")?;
    let header = parse_header(pack.body())?;
    let group = group_view(pack.body(), header, target.location.group_number)?;
    if group.codec != GroupCodec::Raw {
        return Err("target group requires format-aware isolation qualification".into());
    }
    let record_bytes = framed_record(
        &pack.body()[group.start..group.end],
        target.location.record_number,
    )?;
    let parsed = record::parse(header.lane, record_bytes, target.location.canonical_length)?;
    let singleton = raw_singleton(&canonical)?;
    let single_header = parse_header(&singleton)?;
    let single_group = group_view(&singleton, single_header, 0)?;
    let single_record = framed_record(&singleton[single_group.start..single_group.end], 0)?;
    let raw = record::parse(PackLane::Singleton, single_record, canonical.len())?;
    if !record::is_stored(raw.tag)
        || raw.base.is_some()
        || raw.frame != raw_payload(&canonical, ObjectRole::WholeFile)?
    {
        return Err("public singleton is not exact RAW target payload".into());
    }
    let payload_start = (raw.frame.as_ptr() as usize)
        .checked_sub(singleton.as_ptr() as usize)
        .ok_or("singleton payload start")?;
    let payload_last = payload_start
        .checked_add(raw.frame.len() - 1)
        .ok_or("singleton payload end")?;
    if singleton.get(payload_last) != raw.frame.last() {
        return Err("singleton mutation byte is outside the exact parsed RAW frame".into());
    }
    let canonical_path = artifact(events, "reliability-target", "canonical", &canonical)?;
    let singleton_path = artifact(events, "reliability-raw-singleton", "pack", &singleton)?;
    let mut values = BTreeMap::new();
    for (key, val) in [
        ("case", case.id.clone()),
        ("kind", case.kind.into()),
        ("path", TARGET.into()),
        ("root", crate::hex(&manifest.root)),
        ("branch", crate::hex(&manifest.branch)),
        ("stack", crate::hex(&manifest.stack)),
        ("manifest_sha256", digest(&args.manifest)?.0),
        ("provider_store_sha256", before.0.clone()),
        (
            "catalog_id",
            crate::hex(handles.history.catalog_id().as_slice()),
        ),
        (
            "binding_sha256",
            reference::sdk_edit_common::sha256_hex(&manifest.binding),
        ),
        ("object_id", crate::hex(id.as_bytes())),
        ("canonical_bytes", canonical_path.display().to_string()),
        ("canonical_sha256", digest(&canonical_path)?.0),
        (
            "original_pack_sha256",
            crate::hex(target.pack.key.as_bytes()),
        ),
        ("original_lane", format!("{:?}", header.lane)),
        ("original_group_codec", format!("{:?}", group.codec)),
        (
            "original_record_sha256",
            reference::sdk_edit_common::sha256_hex(record_bytes),
        ),
        (
            "original_frame_sha256",
            reference::sdk_edit_common::sha256_hex(parsed.frame),
        ),
        (
            "original_frame_encoding",
            if record::is_stored(parsed.tag) {
                "RAW"
            } else {
                "CODEC"
            }
            .into(),
        ),
        (
            "original_base",
            parsed
                .base
                .map(|id| crate::hex(id.as_bytes()))
                .unwrap_or_else(|| "-".into()),
        ),
        ("singleton_pack", singleton_path.display().to_string()),
        ("singleton_pack_sha256", digest(&singleton_path)?.0),
        (
            "singleton_group_sha256",
            reference::sdk_edit_common::sha256_hex(
                &singleton[single_group.start..single_group.end],
            ),
        ),
        ("pack_id_rule", "store_policy.next_pack_id".into()),
        ("allocator_next_rule", "new_pack_id+1".into()),
    ] {
        set(&mut values, key, val);
    }
    for (key, val) in [
        ("provider_store_size", before.1),
        ("catalog_incarnation", handles.history.incarnation()),
        ("role", target.location.role.code() as u64),
        ("canonical_length", canonical.len() as u64),
        ("original_pack_id", target.location.pack_id as u64),
        (
            "original_pack_domain",
            u64::from(target.pack.domain == PackDomain::Payload),
        ),
        ("original_pack_length", target.pack.length as u64),
        ("original_group_number", target.location.group_number as u64),
        (
            "original_record_number",
            target.location.record_number as u64,
        ),
        ("original_group_start", group.start as u64),
        ("original_group_end", group.end as u64),
        ("original_record_tag", parsed.tag as u64),
        (
            "original_record_start",
            (record_bytes.as_ptr() as usize - pack.body().as_ptr() as usize) as u64,
        ),
        (
            "original_record_end",
            (record_bytes.as_ptr() as usize - pack.body().as_ptr() as usize + record_bytes.len())
                as u64,
        ),
        (
            "original_frame_start",
            (parsed.frame.as_ptr() as usize - pack.body().as_ptr() as usize) as u64,
        ),
        (
            "original_frame_end",
            (parsed.frame.as_ptr() as usize - pack.body().as_ptr() as usize + parsed.frame.len())
                as u64,
        ),
        ("original_raw_length", parsed.raw_length as u64),
        ("singleton_pack_length", singleton.len() as u64),
        ("singleton_control_length", single_header.body_offset as u64),
        ("singleton_group_start", single_group.start as u64),
        ("singleton_group_end", single_group.end as u64),
        ("singleton_record_tag", raw.tag as u64),
        ("singleton_payload_start", payload_start as u64),
        ("singleton_payload_length", raw.frame.len() as u64),
        ("singleton_payload_last_offset", payload_last as u64),
        (
            "singleton_payload_last_byte",
            *raw.frame.last().ok_or("empty RAW payload")? as u64,
        ),
    ] {
        set(&mut values, key, val);
    }
    drop(reader);
    drop(storage);
    handles.seal()?;
    let after = closed(&path)?;
    if before != after {
        return Err("initial public proof altered source bytes".into());
    }
    let target_body = encode_table(TARGET_SCHEMA, &values)?;
    let target_path = artifact(events, "reliability-target", "tsv", target_body.as_bytes())?;
    events.numeric_fields("reliability_initial_verified",Some(events.span(begun)),
        "full original initial typed byte/metadata/alias/inode proof; separate closed public provider copy",
        &[("status","PASS".into()),("case",case.id.clone()),("root",crate::hex(&manifest.root)),
          ("branch",crate::hex(&manifest.branch)),("stack",crate::hex(&manifest.stack)),
          ("provider_validation","current-public-schema-source-binding-validated".into()),
          ("provider_store_sha256",before.0.clone()),("provider_store_after_sha256",after.0)],
        &[("paths",proof.paths),("verified_bytes",proof.bytes),("provider_store_size",before.1),("provider_store_unchanged",1)])?;
    events.fields("fault_target",None,"original f0003 first payload; current WholeFile is the declared format adaptation; RAW singleton generated by existing public record/group/pack encoders, not hand-written",
        &[("case",case.id),("path",TARGET.into()),("object_id",crate::hex(id.as_bytes())),
          ("target_receipt",target_path.display().to_string()),("target_receipt_sha256",digest(&target_path)?.0),
          ("singleton_pack",singleton_path.display().to_string()),("singleton_pack_sha256",digest(&singleton_path)?.0),
          ("canonical_bytes",canonical_path.display().to_string()),("canonical_sha256",digest(&canonical_path)?.0)])?;
    Ok(())
}

pub fn verify_control(args: &Args, events: &mut Events) -> Result<()> {
    if args.history_file.is_some() {
        return Err("positive control accepts no mutation receipt".into());
    }
    let (case, manifest, path) = inputs(args)?;
    let (target, canonical, initial_sha) = load_initial(args)?;
    let before = closed(&path)?;
    let handles = open(&path, &manifest)?;
    let storage = Storage::new(handles.storage.clone())?;
    let reader = storage.reader()?;
    let root = ObjectId::from_bytes(&manifest.root)?;
    let proof = workspace_oracle::verify_tree(
        &reader,
        root,
        &reference::workspace_reliability::fixture_for(&case)?,
        false,
        None,
        true,
    )?;
    let id = proof.files[TARGET].content_root;
    if reader.read_objects(&[id])? != vec![canonical] {
        return Err("isolated target canonical positive control differs".into());
    }
    let mut located = Vec::new();
    handles.storage.locate(&[id], &mut located)?;
    let actual = *located
        .first()
        .filter(|_| located.len() == 1)
        .ok_or("isolated target locator missing")?;
    if crate::hex(id.as_bytes()) != value(&target, "object_id")?
        || actual.location.group_number != 0
        || actual.location.record_number != 0
        || crate::hex(actual.pack.key.as_bytes()) != value(&target, "singleton_pack_sha256")?
        || actual.location.role != ObjectRole::WholeFile
        || actual.location.canonical_length.to_string() != value(&target, "canonical_length")?
    {
        return Err("positive control RAW singleton locator differs".into());
    }
    let mut packs = Vec::new();
    handles
        .storage
        .read_packs(&[actual.location.pack_id], &mut packs)?;
    if packs.len() != 1 || packs[0].body() != fs::read(value(&target, "singleton_pack")?)? {
        return Err("positive control exact singleton bytes differ".into());
    }
    drop(reader);
    drop(storage);
    handles.seal()?;
    let after = closed(&path)?;
    if before != after {
        return Err("positive control altered bytes".into());
    }
    events.numeric_fields("reliability_control_verified",None,"full original initial tree plus exact RAW singleton canonical target positive read; no fault injected yet",
        &[("status","PASS".into()),("case",case.id),("root",crate::hex(&manifest.root)),("object_id",crate::hex(id.as_bytes())),
          ("initial_events_sha256",initial_sha),("provider_store_sha256",before.0),("provider_store_after_sha256",after.0)],
        &[("provider_store_size",before.1),("provider_store_unchanged",1),("pack_id",actual.location.pack_id as u64),("paths",proof.paths),("verified_bytes",proof.bytes)])?;
    Ok(())
}

struct PriorTarget<'a> {
    reader: &'a dyn AuthenticatedObjects,
    target: ObjectId,
    canonical: &'a [u8],
}
impl AuthenticatedObjects for PriorTarget<'_> {
    fn read_canonical_batch(&self, ids: &[ObjectId]) -> ContentResult<Vec<Vec<u8>>> {
        ids.iter()
            .map(|id| {
                if *id == self.target {
                    Ok(self.canonical.to_vec())
                } else {
                    self.reader
                        .read_canonical_batch(&[*id])
                        .map(|mut values| values.remove(0))
                }
            })
            .collect()
    }
}
pub fn verify_fault(args: &Args, events: &mut Events) -> Result<()> {
    let (case, manifest, path) = inputs(args)?;
    let (target, canonical, initial_sha) = load_initial(args)?;
    let mutation_path = args
        .history_file
        .as_deref()
        .ok_or("--history-file mutation TSV required")?;
    let mutation = decode_table(&fs::read_to_string(mutation_path)?, MUTATION_SCHEMA)?;
    let before = closed(&path)?;
    let initial_body =
        fs::read_to_string(args.source.as_deref().ok_or("initial events required")?)?;
    let target_event = event(&initial_body, "fault_target")?;
    for (key, wanted) in [
        ("case", case.id.as_str()),
        ("kind", case.kind),
        ("initial_events_sha256", initial_sha.as_str()),
        ("object_id", value(&target, "object_id")?),
        ("manifest_sha256", value(&target, "manifest_sha256")?),
        ("store_after_sha256", before.0.as_str()),
        ("target_only_audit", "PASS"),
        ("foreign_keys", "1"),
        ("schema_unchanged", "1"),
        ("other_rows_unchanged", "1"),
    ] {
        if value(&mutation, key)? != wanted {
            return Err(format!("mutation binding differs:{key}").into());
        }
    }
    if value(&mutation, "target_receipt_sha256")?
        != string_field(&target_event, "target_receipt_sha256")?
    {
        return Err("mutation target receipt binding differs".into());
    }
    let control_path = PathBuf::from(value(&mutation, "control_events")?);
    if digest(&control_path)?.0 != value(&mutation, "control_events_sha256")? {
        return Err("positive control event hash differs".into());
    }
    let control = event(
        &fs::read_to_string(&control_path)?,
        "reliability_control_verified",
    )?;
    if string_field(&control, "status")? != "PASS"
        || string_field(&control, "case")? != case.id
        || string_field(&control, "initial_events_sha256")? != initial_sha
        || string_field(&control, "provider_store_after_sha256")?
            != value(&mutation, "store_before_sha256")?
    {
        return Err("exact pre-fault positive control binding differs".into());
    }
    let handles = open(&path, &manifest)?;
    let storage = Storage::new(handles.storage.clone())?;
    let reader = storage.reader()?;
    let id = ObjectId::for_bytes(&canonical);
    let mut actual_locations = Vec::new();
    handles.storage.locate(&[id], &mut actual_locations)?;
    if case.kind == "missing-descendant" {
        if !actual_locations.is_empty() {
            return Err("missing fault retained target locator".into());
        }
    } else {
        let actual = actual_locations
            .first()
            .filter(|_| actual_locations.len() == 1)
            .ok_or("corrupt target exact locator absent")?;
        if actual.location.group_number != 0
            || actual.location.record_number != 0
            || actual.location.role != ObjectRole::WholeFile
            || actual.location.canonical_length != canonical.len()
            || crate::hex(actual.pack.key.as_bytes()) != value(&target, "singleton_pack_sha256")?
            || actual.pack.length.to_string() != value(&target, "singleton_pack_length")?
        {
            return Err("corrupt target was not the positively read isolated RAW singleton".into());
        }
    }
    let failure = reader
        .read_objects(&[id])
        .err()
        .ok_or("faulted target unexpectedly readable")?;
    let class = match (&case.kind, &failure) {
        (&"missing-descendant", StorageError::ObjectMissing(actual)) if *actual == id => {
            "ObjectMissing(exact-target)"
        }
        (&"corrupt-descendant", StorageError::Integrity("dependency identity")) => {
            "Integrity(dependency identity)"
        }
        (&"corrupt-descendant", StorageError::Io(error))
            if error.kind() == std::io::ErrorKind::Other
                && error
                    .get_ref()
                    .and_then(|source| source.downcast_ref::<PersistenceError>())
                    == Some(&PersistenceError::Malformed) =>
        {
            "IoOther(PersistenceError::Malformed;isolated-singleton-full-SHA)"
        }
        _ => return Err(format!("unexpected source-classified target failure:{failure:?}").into()),
    };
    // This explicitly proves the unchanged namespace, metadata, alias relations
    // and every other payload. It never calls the substituted target readable.
    let substitute = PriorTarget {
        reader: &reader,
        target: id,
        canonical: &canonical,
    };
    let proof = workspace_oracle::verify_tree(
        &substitute,
        ObjectId::from_bytes(&manifest.root)?,
        &reference::workspace_reliability::fixture_for(&case)?,
        false,
        None,
        true,
    )?;
    if proof.files[TARGET].content_root != id {
        return Err("fault changed original target inode/root".into());
    }
    drop(substitute);
    drop(reader);
    drop(storage);
    handles.seal()?;
    let after = closed(&path)?;
    if before != after {
        return Err("fault qualification altered Store bytes".into());
    }
    events.numeric_fields("integrity_fault_verified",None,"exact source-classified target read failure; all other original tree semantics authenticated with explicit prior-target substitution; actual native FUSE EIO/zero bytes and cleanup are still mandatory",
        &[("status","PASS".into()),("case",case.id),("path",TARGET.into()),("root",crate::hex(&manifest.root)),
          ("object_id",crate::hex(id.as_bytes())),("failure_class",class.into()),("initial_events_sha256",initial_sha),
          ("mutation_receipt_sha256",digest(mutation_path)?.0),("provider_store_sha256",before.0),("provider_store_after_sha256",after.0),
          ("accepted_original_early_boundary","false".into()),("required_next","ordinary-native-EIO-zero-bytes;End;Gone;KnownStop".into())],
        &[("provider_store_size",before.1),("provider_store_unchanged",1),("paths",proof.paths),("prior_target_substituted_bytes",32768)])?;
    Ok(())
}
