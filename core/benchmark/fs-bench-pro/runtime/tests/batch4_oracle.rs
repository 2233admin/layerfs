//! Public current objects and Stores exercise actual selective proof failures.
//! Synthetic selective fixtures qualify the oracle, never a benchmark sample.
#[allow(dead_code)]
#[path = "../../engine/recipes/dedup_input.rs"]
mod dedup_input;
#[allow(dead_code)]
#[path = "../../engine/recipes/namespace.rs"]
pub(crate) mod namespace;
pub(crate) mod project {
    pub(crate) use crate::namespace;
}
pub(crate) use namespace::reference;
pub(crate) type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;
#[allow(dead_code)]
#[path = "../src/args.rs"]
pub(crate) mod args;
#[allow(dead_code)]
#[path = "../../engine/recipes/edit_model.rs"]
pub(crate) mod edit_model;
#[allow(dead_code)]
#[path = "../src/edit_oracle.rs"]
pub(crate) mod edit_oracle;
#[allow(dead_code)]
#[path = "../src/events.rs"]
pub(crate) mod events;
#[allow(dead_code)]
#[path = "../src/workspace_oracle.rs"]
pub(crate) mod workspace_oracle;

use layerfs_content::{
    file::{mapping, FileView},
    filesystem::{
        attributes::{
            codec::AttributeEntry, keys::AttributeKey, portable::PortableMetadata,
            value::emit_value,
        },
        build_filesystem, DirectoryUpdate, FilesystemInput, FilesystemObjects, FilesystemResources,
        InodeScope, InodeUpdate, PathName,
    },
    object::inode_leaf::{InodeKind, InodeValue},
    AuthenticatedObjects, ContentError, ContentResult, FinalizedConsumer, FinalizedObject,
    ObjectId,
};
use layerfs_history::{
    BranchId, CommitStagedOutcome, HistoryCatalog, HistoryCatalogConfig, HistoryName, LayerStackId,
    StageRequest, WorkspaceId,
};
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile};
use layerfs_sdk::{InitRequest, ProjectApi};
use layerfs_storage::{Storage, StoragePolicy};
use layerfs_telemetry::timer::Timing;
use reference::workspace_common::{Content, Entry, EntryKind};
use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    path::{Path, PathBuf},
    time::{Duration, Instant},
};

pub(crate) fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

#[derive(Default, Clone)]
struct Bag {
    bytes: BTreeMap<ObjectId, Vec<u8>>,
    objects: Vec<FinalizedObject>,
}
impl FinalizedConsumer for Bag {
    fn accept(&mut self, object: FinalizedObject) -> ContentResult<()> {
        self.bytes.insert(object.id(), object.canonical().to_vec());
        self.objects.push(object);
        Ok(())
    }
}
impl AuthenticatedObjects for Bag {
    fn read_canonical_batch(&self, ids: &[ObjectId]) -> ContentResult<Vec<Vec<u8>>> {
        ids.iter()
            .map(|id| {
                self.bytes
                    .get(id)
                    .cloned()
                    .ok_or(ContentError::MissingObject)
            })
            .collect()
    }
}
impl Bag {
    fn put(&mut self, bytes: Vec<u8>) -> ObjectId {
        let id = ObjectId::for_bytes(&bytes);
        self.bytes.insert(id, bytes);
        id
    }
}

fn metadata(bag: &mut Bag, kind: InodeKind, entry: &Entry) -> ObjectId {
    let reader = bag.clone();
    let mut objects = FilesystemObjects::new(&reader, bag);
    let portable = PortableMetadata {
        mode: entry.mode,
        mtime_seconds: entry.mtime_seconds,
        mtime_nanoseconds: entry.mtime_nanoseconds,
    };
    let mode = emit_value(&mut objects, &portable.mode_bytes(kind).unwrap()).unwrap();
    let mtime = emit_value(&mut objects, &portable.mtime_bytes().unwrap()).unwrap();
    layerfs_content::filesystem::attributes::build::build_attribute_tree(
        &mut objects,
        vec![
            Ok(AttributeEntry {
                key: AttributeKey::new("portable".into(), b"mode".to_vec()).unwrap(),
                value_root: mode,
            }),
            Ok(AttributeEntry {
                key: AttributeKey::new("portable".into(), b"mtime".to_vec()).unwrap(),
                value_root: mtime,
            }),
        ]
        .into_iter(),
    )
    .unwrap()
    .0
}

fn constructed(scope: InodeScope, entries: &[Entry]) -> (ObjectId, Bag) {
    let mut bag = Bag::default();
    let mut serials = BTreeMap::new();
    for entry in entries {
        if !matches!(entry.kind, EntryKind::Hardlink(_)) {
            serials.insert(entry.path.clone(), serials.len() as u64 + 1);
        }
    }
    let mut inodes = Vec::new();
    for entry in entries {
        if matches!(entry.kind, EntryKind::Hardlink(_)) {
            continue;
        }
        let kind = match entry.kind {
            EntryKind::Directory => InodeKind::Directory,
            EntryKind::File(_) => InodeKind::RegularFile,
            _ => panic!("test file/directory fixture required"),
        };
        let content_root = match &entry.kind {
            EntryKind::File(content) => {
                let mut bytes = Vec::new();
                content.write_to(&mut bytes).unwrap();
                let policy = layerfs_content::ConstructionPolicy::frozen_default();
                Timing::disabled("external.batch4.file", |timer| {
                    layerfs_content::construct_bytes(
                        policy,
                        &policy.capacities(),
                        &bytes,
                        &mut bag,
                        timer.child("file"),
                    )
                })
                .0
                .unwrap()
                .root
            }
            _ => ObjectId::for_bytes(b"directory replaced by public builder"),
        };
        let metadata_root = metadata(&mut bag, kind, entry);
        inodes.push(InodeUpdate {
            serial: serials[&entry.path],
            value: InodeValue {
                kind,
                content_root,
                metadata_root,
                namespace_ref_count: 0,
            },
        });
    }
    let mut directories = BTreeMap::<u64, Vec<_>>::new();
    for entry in entries {
        if matches!(entry.kind, EntryKind::Directory) {
            directories.insert(serials[&entry.path], Vec::new());
        }
    }
    for entry in entries {
        if entry.path == "." {
            continue;
        }
        let path = Path::new(&entry.path);
        let parent = path.parent().unwrap().to_str().unwrap();
        let parent = if parent.is_empty() { "." } else { parent };
        let serial = match &entry.kind {
            EntryKind::Hardlink(target) => serials[target],
            _ => serials[&entry.path],
        };
        directories.entry(serials[parent]).or_default().push((
            PathName::new(path.file_name().unwrap().to_str().unwrap()).unwrap(),
            Some(serial),
        ));
    }
    let dirs = directories
        .into_iter()
        .map(|(parent, mut changes)| {
            changes.sort_by(|left, right| left.0.cmp(&right.0));
            DirectoryUpdate { parent, changes }
        })
        .collect::<Vec<_>>();
    let mut new = serials.values().copied().collect::<Vec<_>>();
    new.sort_unstable();
    let input = FilesystemInput {
        base: None,
        scope,
        root_serial: serials["."],
        directories: &dirs,
        inodes: &inodes,
        new_inodes: &new,
        resources: FilesystemResources::default(),
    };
    let reader = bag.clone();
    let root = build_filesystem(&mut FilesystemObjects::new(&reader, &mut bag), &input, None)
        .unwrap()
        .root
        .0;
    (root, bag)
}

fn selective() -> edit_model::M1State {
    edit_model::M1State {
        entries: vec![
            Entry::directory("."),
            Entry::directory("dir"),
            Entry::file("dir/data", Content::Literal(vec![7; 131_073])),
            Entry::hardlink("dir/alias", "dir/data"),
        ],
        ranges: BTreeMap::from([
            ("dir/data".into(), vec![(0, 4096)]),
            ("dir/alias".into(), vec![(0, 4096)]),
        ]),
        file_modes: BTreeMap::new(),
        file_mtimes: BTreeMap::new(),
        directory_modes: BTreeMap::from([("dir".into(), 0o750)]),
        required_created_directory_modes: BTreeSet::new(),
    }
}
fn selective_proof(expected: &edit_model::M1State, actual: &[Entry]) -> bool {
    let (root, bag) = constructed(
        layerfs_content::filesystem::root::scope_for_seed([19; 32]),
        actual,
    );
    workspace_oracle::verify_tree(&bag, root, &expected.entries, false, Some(expected), true)
        .is_ok()
}

#[test]
fn batch4_selective_ranges_and_automatic_metadata_have_exact_original_scope() {
    let expected = selective();
    let mut actual = expected.entries.clone();
    let file = actual
        .iter_mut()
        .find(|entry| entry.path == "dir/data")
        .unwrap();
    file.mode = 0o601;
    file.mtime_seconds = 123;
    file.mtime_nanoseconds = 456;
    let EntryKind::File(Content::Literal(bytes)) = &mut file.kind else {
        unreachable!()
    };
    bytes[131_072] = 9;
    actual[0].mtime_seconds = 789;
    actual[1].mtime_seconds = 999;
    assert!(selective_proof(&expected, &actual));
    let EntryKind::File(Content::Literal(bytes)) = &mut actual
        .iter_mut()
        .find(|entry| entry.path == "dir/data")
        .unwrap()
        .kind
    else {
        unreachable!()
    };
    bytes[17] = 9;
    assert!(!selective_proof(&expected, &actual));
}

#[test]
fn batch4_selective_explicit_attributes_names_and_alias_classes_are_required() {
    let mut expected = selective();
    expected.file_modes.insert("dir/data".into(), 0o640);
    expected
        .file_mtimes
        .insert("dir/data".into(), (1_700_000_000, 0));
    assert!(selective_proof(&expected, &expected.entries));
    let mut wrong = expected.entries.clone();
    wrong
        .iter_mut()
        .find(|entry| entry.path == "dir/data")
        .unwrap()
        .mtime_nanoseconds = 1;
    assert!(!selective_proof(&expected, &wrong));
    let mut wrong = expected.entries.clone();
    wrong
        .iter_mut()
        .find(|entry| entry.path == "dir")
        .unwrap()
        .mode = 0o700;
    assert!(!selective_proof(&expected, &wrong));
    let mut wrong = expected.entries.clone();
    wrong
        .iter_mut()
        .find(|entry| entry.path == "dir/alias")
        .unwrap()
        .kind = EntryKind::File(Content::Literal(vec![7; 131_073]));
    assert!(!selective_proof(&expected, &wrong));
    let mut wrong = expected.entries.clone();
    wrong.push(Entry::file("dir/extra", Content::Literal(vec![1])));
    assert!(!selective_proof(&expected, &wrong));
}

#[test]
fn batch4_current_boundary_and_complete_mapping_totals_reject_forged_forms() {
    let mut bag = Bag::default();
    for (length, pass) in [(131_071, true), (131_072, false), (0, false)] {
        let root =
            bag.put(layerfs_content::file::encode_whole_file_payload(&vec![7; length]).unwrap());
        let view = Timing::disabled("external.batch4.mapping", |timer| {
            FileView::open(&bag, root, timer.child("open"))
        })
        .0
        .unwrap();
        assert_eq!(workspace_oracle::verify_mapping(&bag, &view).is_ok(), pass);
    }
    let extents = (0..4)
        .map(|_| {
            mapping::ExtentSlice::new(ObjectId::for_bytes(b"unread payload"), 0, 32_768).unwrap()
        })
        .collect();
    let node = bag.put(
        mapping::encode_node(
            &mapping::ExtentNode::Leaf {
                subtree_logical_bytes: 131_072,
                extents,
            },
            true,
        )
        .unwrap(),
    );
    let root = bag.put(
        mapping::encode_file_state(mapping::FileState {
            logical_len: 131_072,
            extent_count: 5,
            tree_level: 0,
            profile_id: mapping::profile_id(),
            mapping_root: node,
        })
        .unwrap(),
    );
    let view = Timing::disabled("external.batch4.mapping", |timer| {
        FileView::open(&bag, root, timer.child("open"))
    })
    .0
    .unwrap();
    assert!(workspace_oracle::verify_mapping(&bag, &view).is_err());
    let policy = layerfs_content::ConstructionPolicy::frozen_default();
    let empty = Timing::disabled("external.batch4.empty", |timer| {
        layerfs_content::construct_bytes(
            policy,
            &policy.capacities(),
            &[],
            &mut bag,
            timer.child("file"),
        )
    })
    .0
    .unwrap();
    let view = Timing::disabled("external.batch4.empty", |timer| {
        FileView::open(&bag, empty.root, timer.child("open"))
    })
    .0
    .unwrap();
    assert!(workspace_oracle::verify_mapping(&bag, &view).is_ok());
}

#[test]
fn batch4_created_mode_domain_and_original_case_limits_are_not_global_caps() {
    assert_eq!(
        workspace_oracle::history_limit("dedup-history-recurring-500").unwrap(),
        500
    );
    assert_eq!(
        workspace_oracle::history_limit(reference::file_size_transition::ALIAS_ROUNDTRIP).unwrap(),
        5
    );
    assert_eq!(
        workspace_oracle::history_limit("local-snapshot-create-25000-onebyte-v1").unwrap(),
        3
    );
    assert!(workspace_oracle::history_limit("payload-create-1m-compact-v2").is_err());
    let case = "v016-mixed-development-100mb-5000-k10-v1";
    let domain = edit_model::m1_state(case, 10, None)
        .unwrap()
        .required_created_directory_modes;
    let home = temporary("modes");
    let path = home.join("modes.tsv");
    let valid = domain
        .iter()
        .map(|name| format!("{name}\t755\n"))
        .collect::<String>();
    fs::write(&path, &valid).unwrap();
    assert_eq!(
        workspace_oracle::created_modes(case, &path).unwrap().len(),
        17
    );
    for wrong in [
        format!("{valid}../unsafe\t755\n"),
        format!("{valid}{}\t755\n", domain.first().unwrap()),
        valid.replacen("\t755", "\t4755", 1),
        valid.replacen("\t755", "\t0755", 1),
    ] {
        fs::write(&path, wrong).unwrap();
        assert!(workspace_oracle::created_modes(case, &path).is_err());
    }
    fs::remove_dir_all(home).unwrap();
}

fn temporary(label: &str) -> PathBuf {
    let path = std::env::temp_dir().join(format!("fsb-batch4-{label}-{}", std::process::id()));
    fs::create_dir(&path).unwrap();
    path
}

fn prepared(case: &str, label: &str) -> PathBuf {
    let home = temporary(label);
    let initial = edit_model::entries(case, 0).unwrap();
    reference::workspace_common::create_fixture(&home.join("source"), &initial).unwrap();
    let project = Timing::disabled("external.batch4.init", |timer| {
        ProjectApi::new().init(
            InitRequest {
                source: home.join("source"),
                store: PersistenceConfig::sqlite(home.join("store.sqlite"))
                    .with_sqlite_profile(SqlitePersistenceProfile::Disposable),
                locator: "/layerfs-store/global/store.sqlite".into(),
                policy: StoragePolicy::frozen_default(),
                catalog: HistoryCatalogConfig {
                    binding_key: b"external-batch4-oracle".to_vec(),
                    cursor_key: [21; 32],
                    incarnation: 1,
                },
                stack: LayerStackId::from_authority([22; 16]),
                stack_name: HistoryName::new("proof").unwrap(),
                branch: BranchId::from_authority([23; 16]),
                branch_name: HistoryName::new("main").unwrap(),
                scope_seed: [24; 32],
                deadline: Instant::now() + Duration::from_secs(15),
            },
            timer,
        )
    })
    .0
    .unwrap();
    fs::write(home.join("manifest"), project.manifest.encode().unwrap()).unwrap();
    let handles = Handles::open_writable(
        PersistenceConfig::sqlite(home.join("store.sqlite"))
            .with_sqlite_profile(SqlitePersistenceProfile::Disposable),
        &project.manifest.binding,
        project.manifest.cursor_key,
    )
    .unwrap();
    let storage = Storage::new(handles.storage.clone()).unwrap();
    let snapshot = handles
        .history
        .branch_snapshot(BranchId::from_bytes(project.manifest.branch).unwrap())
        .unwrap()
        .unwrap();
    let scope = InodeScope::from_object(snapshot.scope);
    let state = home.join("state-0.tsv");
    fs::write(
        &state,
        reference::workspace_common::manifest(&initial).unwrap(),
    )
    .unwrap();
    let mut transcript = format!(
        "0\t-\t-\t{}\t{}\n",
        hex(&project.manifest.root),
        state.display()
    );
    let mut produced = Vec::new();
    for step in 1..=workspace_oracle::history_limit(case).unwrap() {
        let entries = edit_model::entries(case, step).unwrap();
        let (root, bag) = constructed(scope, &entries);
        let save = storage.begin_save().unwrap();
        for object in bag.objects {
            save.accept(object).unwrap();
        }
        save.finish().unwrap();
        let branch = handles
            .history
            .branch_snapshot(BranchId::from_bytes(project.manifest.branch).unwrap())
            .unwrap()
            .unwrap();
        let outcome = handles
            .history
            .stage_and_commit(&StageRequest {
                workspace: WorkspaceId::from_authority([25; 32]).unwrap(),
                branch: branch.branch.id,
                expected_head: branch.branch.head_commit,
                expected_base: branch.branch.base_layer,
                expected_root: branch.effective_root,
                construction_base_root: branch.effective_root,
                intended_commit_base: branch.branch.base_layer,
                candidate_root: root,
                profile: branch.profile,
                scope: branch.scope,
                generation: step as u64,
            })
            .unwrap();
        let CommitStagedOutcome::Committed(record) = outcome else {
            panic!("original changed candidate must Commit")
        };
        let state = home.join(format!("state-{step}.tsv"));
        fs::write(
            &state,
            reference::workspace_common::manifest(&entries).unwrap(),
        )
        .unwrap();
        transcript += &format!(
            "{step}\t{}\t{}\t{}\t{}\n",
            hex(record.id.as_slice()),
            record
                .parent
                .map(|id| hex(id.as_slice()))
                .unwrap_or_else(|| "-".into()),
            hex(root.as_bytes()),
            state.display()
        );
        produced.push(root);
    }
    if case.contains("recurring") {
        assert_eq!(produced[1], produced[3]);
    }
    drop(storage);
    handles.seal().unwrap();
    fs::write(home.join("history.tsv"), transcript).unwrap();
    home
}

fn prove(home: &Path, case: &str, label: &str, selected: Option<usize>) -> bool {
    let args = args::Args {
        mode: "verify-history".into(),
        socket: "/unused".into(),
        image: args::IMAGE.into(),
        volume: "unused".into(),
        executable: "/unused".into(),
        receipt: home.join(format!("{label}.jsonl")),
        manifest: home.join("manifest"),
        installed_manifest: None,
        uid: 1,
        gid: 1,
        source: None,
        sealed: Some(home.join("store.sqlite")),
        init_seconds: 15,
        environment: vec!["LAYERFS_CONSTRUCTION_WORKERS=1".into()],
        observation_scope: [26; 32],
        case: Some(case.into()),
        history_file: Some(home.join("history.tsv")),
        history_step: selected,
    };
    let mut events = events::Events::new(&args.receipt).unwrap();
    match workspace_oracle::verify_history(&args, &mut events) {
        Ok(()) => true,
        Err(error) => {
            fs::write(home.join(format!("{label}.error")), error.to_string()).unwrap();
            false
        }
    }
}

#[test]
fn batch4_actual_public_boundary_history_rejects_omissions_parent_and_manifest_substitution() {
    let case = reference::file_size_transition::SMALL_CONTROL;
    let home = prepared(case, "boundary");
    assert!(prove(&home, case, "good", None));
    let good = fs::read_to_string(home.join("history.tsv")).unwrap();
    let lines = good.lines().collect::<Vec<_>>();
    fs::write(
        home.join("history.tsv"),
        format!("{}\n{}\n", lines[0], lines[2]),
    )
    .unwrap();
    assert!(!prove(&home, case, "missing", None));
    let mut wrong = lines[2].split('\t').map(str::to_owned).collect::<Vec<_>>();
    wrong[2] = "-".into();
    fs::write(
        home.join("history.tsv"),
        format!("{}\n{}\n{}\n", lines[0], lines[1], wrong.join("\t")),
    )
    .unwrap();
    assert!(!prove(&home, case, "parent", None));
    fs::write(home.join("history.tsv"), &good).unwrap();
    fs::copy(home.join("state-1.tsv"), home.join("state-2.tsv")).unwrap();
    assert!(!prove(&home, case, "substitute", Some(2)));
    assert!(fs::read_to_string(home.join("substitute.error"))
        .unwrap()
        .contains("differs from original complete state"));
    let receipt = fs::read_to_string(home.join("good.jsonl")).unwrap();
    for field in [
        "catalog_id",
        "catalog_incarnation",
        "binding_sha256",
        "provider_store_sha256",
        "provider_store_after_sha256",
        "provider_store_unchanged",
        "acknowledged_transcript_sha256",
    ] {
        assert!(receipt.contains(&format!("\"{field}\"")));
    }
    assert!(!receipt.contains("cursor_key"));
    fs::remove_dir_all(home).unwrap();
}

#[test]
fn batch4_recurring_public_history_accepts_repeated_roots_and_checks_ab_identity() {
    let case = "dedup-history-recurring-10";
    let home = prepared(case, "recurring");
    assert!(prove(&home, case, "good", None));
    assert!(fs::read_to_string(home.join("good.jsonl"))
        .unwrap()
        .contains("\"recurring_classes\":2"));
    fs::remove_dir_all(home).unwrap();
}

/// Outside-src shared fixture for the independent SQL census regression.
/// Immutable exports are never opened by the typed proof or reset operation.
pub(crate) fn export_census_fixture(out: &Path) {
    assert!(out.is_absolute() && !out.exists());
    fs::create_dir_all(out).unwrap();
    for name in ["baseline", "extra", "typed-baseline", "work-extra"] {
        fs::create_dir(out.join(name)).unwrap();
    }
    let case = reference::file_size_transition::SMALL_CONTROL;
    let home = prepared(case, "canonical-census");
    fs::copy(home.join("store.sqlite"), out.join("baseline/store.sqlite")).unwrap();
    fs::copy(home.join("manifest"), out.join("manifest")).unwrap();
    let original = fs::read_to_string(home.join("history.tsv")).unwrap();
    let mut transcript = String::new();
    for row in original.lines() {
        let mut fields = row.split('\t').map(str::to_owned).collect::<Vec<_>>();
        let index = fields[0].parse::<usize>().unwrap();
        let state = out.join(format!("state-{index}.tsv"));
        fs::copy(home.join(format!("state-{index}.tsv")), &state).unwrap();
        fields[4] = state.to_str().unwrap().into();
        transcript.push_str(&fields.join("\t"));
        transcript.push('\n');
    }
    fs::write(out.join("history.tsv"), &transcript).unwrap();
    fs::copy(
        out.join("baseline/store.sqlite"),
        out.join("typed-baseline/store.sqlite"),
    )
    .unwrap();
    let args = args::Args {
        mode: "verify-history".into(),
        socket: "/unused".into(),
        image: args::IMAGE.into(),
        volume: "unused".into(),
        executable: "/unused".into(),
        receipt: out.join("provider.jsonl"),
        manifest: out.join("manifest"),
        installed_manifest: None,
        uid: 1,
        gid: 1,
        source: None,
        sealed: Some(out.join("typed-baseline/store.sqlite")),
        init_seconds: 15,
        environment: vec!["LAYERFS_CONSTRUCTION_WORKERS=1".into()],
        observation_scope: [29; 32],
        case: Some(case.into()),
        history_file: Some(out.join("history.tsv")),
        history_step: None,
    };
    let mut provider_events = events::Events::new(&args.receipt).unwrap();
    workspace_oracle::verify_history(&args, &mut provider_events).unwrap();
    provider_events
        .value("finished", "known successful harness completion")
        .unwrap();
    drop(provider_events);
    fs::copy(
        out.join("baseline/store.sqlite"),
        out.join("work-extra/store.sqlite"),
    )
    .unwrap();
    let manifest =
        layerfs_bridge::provision::StoreManifest::decode(&fs::read(out.join("manifest")).unwrap())
            .unwrap();
    let handles = Handles::open_writable(
        PersistenceConfig::sqlite(out.join("work-extra/store.sqlite"))
            .with_sqlite_profile(SqlitePersistenceProfile::Disposable),
        &manifest.binding,
        manifest.cursor_key,
    )
    .unwrap();
    let snapshot = handles
        .history
        .branch_snapshot(BranchId::from_bytes(manifest.branch).unwrap())
        .unwrap()
        .unwrap();
    let first = transcript
        .lines()
        .nth(1)
        .unwrap()
        .split('\t')
        .collect::<Vec<_>>();
    let first_id = layerfs_history::CommitId::from_bytes(
        first[1]
            .as_bytes()
            .chunks_exact(2)
            .map(|pair| u8::from_str_radix(std::str::from_utf8(pair).unwrap(), 16).unwrap())
            .collect::<Vec<_>>()
            .try_into()
            .unwrap(),
    )
    .unwrap();
    let saved = handles.history.commit(first_id).unwrap().unwrap().root;
    assert_ne!(
        saved, snapshot.effective_root,
        "extra candidate must change C2"
    );
    let outcome = handles
        .history
        .stage_and_commit(&StageRequest {
            workspace: WorkspaceId::from_authority([30; 32]).unwrap(),
            branch: snapshot.branch.id,
            expected_head: snapshot.branch.head_commit,
            expected_base: snapshot.branch.base_layer,
            expected_root: snapshot.effective_root,
            construction_base_root: snapshot.effective_root,
            intended_commit_base: snapshot.branch.base_layer,
            candidate_root: saved,
            profile: snapshot.profile,
            scope: snapshot.scope,
            generation: 3,
        })
        .unwrap();
    let CommitStagedOutcome::Committed(extra) = outcome else {
        panic!("canonical changed extra root must Commit")
    };
    assert_eq!(
        extra.id,
        layerfs_history::CommitId::derive(extra.root, extra.parent, extra.base_layer)
    );
    assert_eq!(
        handles.history.commit(extra.id).unwrap(),
        Some(extra.clone())
    );
    handles.seal().unwrap();
    fs::copy(
        out.join("work-extra/store.sqlite"),
        out.join("extra/store.sqlite"),
    )
    .unwrap();
    let record = format!("{{\"case\":\"{case}\",\"runtime\":\"{}\",\"commit_id\":\"{}\",\"root_id\":\"{}\",\"parent_commit_id\":\"{}\",\"layer_stack_id\":\"{}\",\"base_layer_id\":\"{}\",\"original_head\":\"{}\",\"original_root\":\"{}\",\"scope\":\"public ProjectApi Init, Content/Storage saved roots and public HistoryCatalog extra Commit; isolated oracle fixture, no mounted benchmark proof\"}}\n",
        env!("CARGO_BIN_EXE_layerfs-r7-runtime"), hex(extra.id.as_slice()), hex(extra.root.as_bytes()),
        hex(extra.parent.unwrap().as_slice()), hex(extra.stack.as_slice()), hex(extra.base_layer.as_slice()),
        hex(snapshot.branch.head_commit.unwrap().as_slice()), hex(snapshot.effective_root.as_bytes()));
    fs::write(out.join("extra-commit.json"), record).unwrap();
    fs::remove_dir_all(home).unwrap();
}
