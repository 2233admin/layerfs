//! Bounded external current public Store fixture/fault qualification; no Docker.
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
#[path = "../../engine/recipes/dedup_input.rs"]
pub(crate) mod dedup_input;
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
#[path = "../src/reliability.rs"]
pub(crate) mod reliability;
#[allow(dead_code)]
#[path = "../src/workspace_oracle.rs"]
pub(crate) mod workspace_oracle;
use layerfs_bridge::provision::StoreManifest;
use layerfs_content::{encode_whole_file_payload, ObjectId, ObjectRole};
use layerfs_history::{BranchId, HistoryCatalogConfig, HistoryName, LayerStackId};
use layerfs_persistence::{PersistenceConfig, SqlitePersistenceProfile};
use layerfs_sdk::{InitRequest, ProjectApi};
use layerfs_storage::{
    encoding::{
        decode_canonical, delta::record, framed_record, DecompressionWorkspace, GroupCache,
    },
    location::ObjectLocation,
    pack::layout::{group_view, parse_header, GroupCodec, PackLane},
    StoragePolicy,
};
use layerfs_telemetry::timer::Timing;
use std::{
    collections::BTreeMap,
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::{Duration, Instant},
};
pub(crate) fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}
const CORRUPT: &str = "workspace-corrupt-descendant-compact-v2-proof";
const MISSING: &str = "workspace-missing-descendant-compact-v2-proof";
fn home(label: &str) -> PathBuf {
    let path = std::env::temp_dir().join(format!(
        "layerfs-external-reliability-{label}-{}-{}",
        std::process::id(),
        hex(&layerfs_bridge::native::generate_keypair().unwrap().public[..8])
    ));
    fs::create_dir(&path).unwrap();
    println!("RETAINED_RELIABILITY_FIXTURE={}", path.display());
    path
}
fn init(case: &str) -> PathBuf {
    let root = home(if case == CORRUPT {
        "corrupt"
    } else {
        "missing"
    });
    let selected = reliability::selected(case).unwrap();
    let entries = reference::workspace_reliability::fixture_for(&selected).unwrap();
    assert_eq!(entries.len(), 23);
    reference::workspace_common::create_fixture(&root.join("native"), &entries).unwrap();
    let sealed = Timing::disabled("external.reliability.public-init", |timer| {
        ProjectApi::new().init(
            InitRequest {
                source: root.join("native"),
                store: PersistenceConfig::sqlite(root.join("store.sqlite"))
                    .with_sqlite_profile(SqlitePersistenceProfile::Disposable),
                locator: "/layerfs-store/global/store.sqlite".into(),
                policy: StoragePolicy::frozen_default(),
                catalog: HistoryCatalogConfig {
                    binding_key: b"external-reliability-proof".to_vec(),
                    cursor_key: [9; 32],
                    incarnation: 1,
                },
                stack: LayerStackId::from_authority([3; 16]),
                stack_name: HistoryName::new("proof").unwrap(),
                branch: BranchId::from_authority([4; 16]),
                branch_name: HistoryName::new("main").unwrap(),
                scope_seed: [5; 32],
                deadline: Instant::now() + Duration::from_secs(30),
            },
            timer,
        )
    })
    .0
    .unwrap();
    fs::write(root.join("manifest"), sealed.manifest.encode().unwrap()).unwrap();
    root
}
fn request(root: &Path, case: &str, label: &str) -> args::Args {
    args::Args {
        mode: label.into(),
        socket: "/unused".into(),
        image: args::IMAGE.into(),
        volume: "unused".into(),
        executable: "/unused".into(),
        receipt: root.join(format!("{label}.jsonl")),
        manifest: root.join("manifest"),
        uid: 1,
        gid: 1,
        source: None,
        sealed: Some(root.join("store.sqlite")),
        init_seconds: 30,
        environment: vec!["LAYERFS_CONSTRUCTION_WORKERS=1".into()],
        observation_scope: [6; 32],
        case: Some(case.into()),
        history_file: None,
        history_step: None,
        installed_manifest: None,
    }
}
fn complete(request: &args::Args, call: fn(&args::Args, &mut events::Events) -> Result<()>) {
    let mut events = events::Events::new(&request.receipt).unwrap();
    call(request, &mut events).unwrap();
    events
        .value("finished", "external test known successful completion")
        .unwrap();
}
fn target(root: &Path) -> BTreeMap<String, String> {
    let body = fs::read_to_string(root.join("initial.jsonl")).unwrap();
    let row = body
        .lines()
        .find(|row| row.contains("\"event\":\"fault_target\""))
        .unwrap();
    let marker = "\"target_receipt\":\"";
    let begin = row.find(marker).unwrap() + marker.len();
    let path = &row[begin..begin + row[begin..].find('"').unwrap()];
    reliability::decode_table(
        &fs::read_to_string(path).unwrap(),
        "fs-bench-pro-reliability-target-v1",
    )
    .unwrap()
}
fn python(script: &str, args: &[&str]) {
    let output = Command::new("python3")
        .arg("-B")
        .arg("-c")
        .arg(script)
        .args(args)
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
}
#[test]
fn reliability_raw_singleton_preserves_supported_frame_and_target_bytes() {
    let canonical = encode_whole_file_payload(&[0x75; 32768]).unwrap();
    let pack = reliability::raw_singleton(&canonical).unwrap();
    let header = parse_header(&pack).unwrap();
    assert_eq!(header.lane, PackLane::Singleton);
    let group = group_view(&pack, header, 0).unwrap();
    assert_eq!(group.codec, GroupCodec::Raw);
    let record = record::parse(
        PackLane::Singleton,
        framed_record(&pack[group.start..group.end], 0).unwrap(),
        canonical.len(),
    )
    .unwrap();
    assert_eq!(record.tag, record::STORED_TAG);
    assert!(record.base.is_none());
    assert_eq!(record.frame, &[0x75; 32768]);
    let location = ObjectLocation {
        object_id: ObjectId::for_bytes(&canonical),
        role: ObjectRole::WholeFile,
        canonical_length: canonical.len(),
        pack_id: 1,
        group_number: 0,
        record_number: 0,
    };
    let capacities =
        layerfs_storage::StorageCapacities::from_policy(StoragePolicy::frozen_default()).unwrap();
    let decode = |bytes: &[u8]| {
        decode_canonical(
            bytes,
            &location,
            &capacities,
            None,
            &mut DecompressionWorkspace::new().unwrap(),
            &mut GroupCache::new(),
            &mut 0,
        )
        .unwrap()
    };
    assert_eq!(decode(&pack), canonical);
    let mut corrupted = pack.clone();
    *corrupted.last_mut().unwrap() ^= 1;
    assert_eq!(&corrupted[..corrupted.len() - 1], &pack[..pack.len() - 1]);
    assert_ne!(ObjectId::for_bytes(&decode(&corrupted)), location.object_id);
}
#[test]
fn reliability_actual_public_initial_raw_control_and_exact_two_faults() {
    for case in [CORRUPT, MISSING] {
        let root = init(case);
        let initial = request(&root, case, "initial");
        complete(&initial, reliability::verify_initial);
        let values = target(&root);
        let pack = values["singleton_pack"].clone();
        let id = values["object_id"].clone();
        python(
            r#"import sqlite3,sys,pathlib,hashlib
p,pack,identity=sys.argv[1:];body=pathlib.Path(pack).read_bytes();db=sqlite3.connect(p,timeout=0)
db.execute('PRAGMA synchronous=OFF');db.execute('PRAGMA foreign_keys=ON');assert db.execute('PRAGMA journal_mode').fetchone()[0]=='wal'
key=bytes.fromhex(identity);pid=db.execute('SELECT next_pack_id FROM store_policy WHERE id=1').fetchone()[0]
assert not db.execute('SELECT 1 FROM pack WHERE pack_id=?',(pid,)).fetchone()
db.execute('INSERT INTO pack(pack_id,domain,digest,length,body) VALUES(?,1,?,?,?)',(pid,hashlib.sha256(body).digest(),len(body),body))
assert db.execute('UPDATE object_location SET pack_id=?,group_number=0,record_number=0 WHERE object_id=?',(pid,key)).rowcount==1
db.execute('UPDATE store_policy SET next_pack_id=? WHERE id=1',(pid+1,));db.commit();db.execute('PRAGMA wal_checkpoint(TRUNCATE)');db.close()
"#,
            &[root.join("store.sqlite").to_str().unwrap(), &pack, &id],
        );
        let mut control = request(&root, case, "control");
        control.source = Some(initial.receipt.clone());
        complete(&control, reliability::verify_control);
        let before = reliability::digest(&root.join("store.sqlite")).unwrap().0;
        python(
            r#"import sqlite3,sys
p,identity,kind=sys.argv[1:];db=sqlite3.connect(p,timeout=0);db.execute('PRAGMA synchronous=OFF');db.execute('PRAGMA foreign_keys=ON')
key=bytes.fromhex(identity)
if kind=='corrupt-descendant':
 pid,n=db.execute('SELECT p.pack_id,p.length FROM pack p JOIN object_location o ON o.pack_id=p.pack_id WHERE o.object_id=?',(key,)).fetchone()
 with db.blobopen('pack','body',pid,readonly=False) as blob:
  blob.seek(n-1);old=blob.read(1);blob.seek(n-1);blob.write(bytes([old[0]^1]))
else:
 db.execute('DELETE FROM content_signature WHERE object_id=?',(key,));assert db.execute('DELETE FROM object_location WHERE object_id=?',(key,)).rowcount==1
db.commit();assert not db.execute('PRAGMA foreign_key_check').fetchall();db.execute('PRAGMA wal_checkpoint(TRUNCATE)');db.close()
"#,
            &[
                root.join("store.sqlite").to_str().unwrap(),
                &id,
                if case == CORRUPT {
                    "corrupt-descendant"
                } else {
                    "missing-descendant"
                },
            ],
        );
        let mut mutation = BTreeMap::new();
        for (k, v) in [
            ("case", case.into()),
            ("kind", reliability::selected(case).unwrap().kind.into()),
            (
                "initial_events_sha256",
                reliability::digest(&initial.receipt).unwrap().0,
            ),
            (
                "target_receipt_sha256",
                fs::read_to_string(&initial.receipt)
                    .unwrap()
                    .lines()
                    .find(|r| r.contains("\"event\":\"fault_target\""))
                    .unwrap()
                    .split("\"target_receipt_sha256\":\"")
                    .nth(1)
                    .unwrap()
                    .split('"')
                    .next()
                    .unwrap()
                    .into(),
            ),
            ("object_id", id),
            (
                "manifest_sha256",
                reliability::digest(&initial.manifest).unwrap().0,
            ),
            ("store_before_sha256", before),
            (
                "store_after_sha256",
                reliability::digest(&root.join("store.sqlite")).unwrap().0,
            ),
            ("control_events", control.receipt.display().to_string()),
            (
                "control_events_sha256",
                reliability::digest(&control.receipt).unwrap().0,
            ),
            ("target_only_audit", "PASS".into()),
            ("foreign_keys", "1".into()),
            ("schema_unchanged", "1".into()),
            ("other_rows_unchanged", "1".into()),
        ] {
            mutation.insert(k.into(), v);
        }
        let mutation_path = root.join("mutation.tsv");
        fs::write(
            &mutation_path,
            reliability::encode_table("fs-bench-pro-reliability-mutation-v1", &mutation).unwrap(),
        )
        .unwrap();
        let mut fault = request(&root, case, "fault");
        fault.source = Some(initial.receipt.clone());
        fault.history_file = Some(mutation_path);
        complete(&fault, reliability::verify_fault);
        assert!(fs::read_to_string(&fault.receipt)
            .unwrap()
            .contains("\"accepted_original_early_boundary\":\"false\""));
        assert_eq!(
            StoreManifest::decode(&fs::read(&fault.manifest).unwrap())
                .unwrap()
                .profile,
            layerfs_bridge::provision::StoreProfile::Disposable
        );
    }
}
#[test]
fn reliability_unrelated_case_and_noncanonical_receipts_are_refused() {
    assert!(reliability::selected("workspace-hardlink-alias-compact-v2-proof").is_err());
    assert!(reliability::decode_table(
        "fs-bench-pro-reliability-target-v1\nz\t2\na\t1\n",
        "fs-bench-pro-reliability-target-v1"
    )
    .is_err());
    assert!(reliability::decode_table(
        "fs-bench-pro-reliability-target-v1\na\t1\na\t2\n",
        "fs-bench-pro-reliability-target-v1"
    )
    .is_err());
}
