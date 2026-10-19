//! The recorded Branch merges of a replay Store, merged again (#355 (d)).
//!
//! Set `LAYERFS_355_REPLAY_STORE` to a closed Store file and
//! `LAYERFS_355_REPLAY_BINDING` to its history binding key (hex), then run
//! with `--ignored`. The Store is copied first; the copy is opened writable
//! and every Commit made by a Branch merge (`via` 3) has its two parents
//! forked and merged with `branch.merge`, oldest first. Each prints one
//! `REPLAY_MERGE` line with the recorded root and the merged one. Merges are
//! deterministic on equal copies, so two builds' lines compare exactly; the
//! recorded root differs only where the merge took fresh serials, whose
//! allocator has moved since.
#[path = "support/installed_store.rs"]
#[allow(dead_code)]
mod installed;
#[path = "support/view.rs"]
#[allow(dead_code)]
mod view;

use layerfs_bridge::control::{SdkCall, SdkValue};
use layerfs_persistence::{PersistenceConfig, SqlitePersistenceProfile};
use layerfs_store_service::{bootstrap::open_store_observed, Owner, OwnerConfig, StoreService};

fn hex(bytes: &[u8]) -> String {
    bytes.iter().fold(String::new(), |mut text, byte| {
        text.push_str(&format!("{byte:02x}"));
        text
    })
}

fn unhex(text: &str) -> Vec<u8> {
    (0..text.len())
        .step_by(2)
        .map(|at| u8::from_str_radix(&text[at..at + 2], 16).unwrap())
        .collect()
}

/// A recorded merge: its Commit, both parents and its root.
type Recorded = (Vec<u8>, Vec<u8>, Vec<u8>, Vec<u8>);

fn call(
    service: &StoreService,
    method: &str,
    fields: Vec<(&str, SdkValue)>,
) -> Result<SdkValue, layerfs_bridge::control::SdkRefusal> {
    let mut fields: Vec<(String, SdkValue)> = fields
        .into_iter()
        .map(|(name, value)| (name.to_owned(), value))
        .collect();
    fields.push(("project".into(), SdkValue::text("dsh")));
    let call = SdkCall {
        method: method.into(),
        args: SdkValue::Map(fields),
    };
    layerfs_api::call(service, &call)
}

#[test]
#[ignore = "needs a replay Store: LAYERFS_355_REPLAY_STORE and LAYERFS_355_REPLAY_BINDING"]
fn recorded_branch_merges_merge_again() {
    let source = std::env::var("LAYERFS_355_REPLAY_STORE").expect("replay Store");
    let binding = unhex(&std::env::var("LAYERFS_355_REPLAY_BINDING").expect("binding key"));
    let directory = std::env::temp_dir().join(format!("layerfs-355-replay-{}", std::process::id()));
    std::fs::create_dir(&directory).unwrap();
    let path = directory.join("store.sqlite");
    std::fs::copy(&source, &path).unwrap();
    let mut permissions = std::fs::metadata(&path).unwrap().permissions();
    #[allow(clippy::permissions_set_readonly_false)]
    permissions.set_readonly(false);
    std::fs::set_permissions(&path, permissions).unwrap();
    let merges: Vec<Recorded> = {
        let sql = rusqlite::Connection::open(&path).unwrap();
        let mut statement = sql
            .prepare(
                "SELECT commit_id, parent_commit_id, second_parent_id, root_id FROM \"commit\"
                 WHERE via=3 ORDER BY created_ms, commit_id",
            )
            .unwrap();
        let rows = statement
            .query_map([], |row| {
                Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
            })
            .unwrap();
        rows.map(Result::unwrap).collect()
    };
    let config =
        PersistenceConfig::sqlite(&path).with_sqlite_profile(SqlitePersistenceProfile::Disposable);
    let owner_config = OwnerConfig::default();
    let opened = open_store_observed(
        config,
        &binding,
        installed::CURSOR,
        owner_config.namespaces,
        64 * 1024,
        layerfs_storage::ReservationBlocks::default(),
    )
    .unwrap();
    let owner = Owner::start(
        &directory.join("overlay.sqlite"),
        layerfs_overlay::ProfileConfig::default(),
        owner_config,
    )
    .unwrap();
    let service = StoreService::new(opened, &owner);
    // With `LAYERFS_355_VIEW_DIR`, each merge's decoded view (or refusal) is
    // written to `<index>.txt` there, for comparing two builds (#355 M1).
    let views = std::env::var_os("LAYERFS_355_VIEW_DIR").map(std::path::PathBuf::from);
    let viewer = views
        .as_ref()
        .map(|_| view::Viewer::open(&path, &binding, installed::CURSOR));
    let (mut same, mut merged_count) = (0, 0);
    for (index, (commit, parent, second, recorded)) in merges.iter().enumerate() {
        let (left, right) = (format!("replay-l{index}"), format!("replay-r{index}"));
        for (name, from) in [(&left, parent), (&right, second)] {
            call(
                &service,
                "branch.fork",
                vec![
                    ("name", SdkValue::text(name)),
                    ("from", SdkValue::text(hex(from))),
                ],
            )
            .unwrap();
        }
        let merged = call(
            &service,
            "branch.merge",
            vec![
                ("branch", SdkValue::text(&left)),
                ("with", SdkValue::text(&right)),
                ("name", SdkValue::text(format!("replay-m{index}"))),
            ],
        );
        let result = match &merged {
            Ok(reply) => {
                merged_count += 1;
                let root = reply.get_text("root").unwrap_or("none").to_owned();
                if root == hex(recorded) {
                    same += 1;
                }
                format!("kind={} root={root}", reply.get_text("kind").unwrap_or("?"))
            }
            Err(refusal) => format!("refused={}:{}", refusal.code, refusal.message),
        };
        if let (Some(views), Some(viewer)) = (&views, &viewer) {
            let lines = match &merged {
                Ok(reply) => viewer.view(reply.get_text("root").unwrap(), true),
                Err(refusal) => vec![format!("refused {} {:?}", refusal.code, refusal.detail)],
            };
            std::fs::write(views.join(format!("{index}.txt")), lines.join("\n")).unwrap();
            // The merge's inputs, for telling one side's change from both.
            let sql = rusqlite::Connection::open(&path).unwrap();
            let root_of = |node: &[u8]| -> Vec<u8> {
                sql.query_row(
                    "SELECT root_id FROM \"commit\" WHERE commit_id=?1
                     UNION ALL SELECT root_id FROM layer WHERE layer_id=?1",
                    [node],
                    |row| row.get(0),
                )
                .unwrap()
            };
            let base = merged
                .as_ref()
                .ok()
                .and_then(|reply| reply.get_text("mergeBase"))
                .map(unhex);
            for (label, node) in [
                ("ours", Some(parent.clone())),
                ("theirs", Some(second.clone())),
                ("base", base),
            ] {
                if let Some(node) = node {
                    let lines = viewer.view(&hex(&root_of(&node)), true);
                    std::fs::write(views.join(format!("{index}.{label}.txt")), lines.join("\n"))
                        .unwrap();
                }
            }
        }
        println!(
            "REPLAY_MERGE {index} commit={} recorded={} {result}",
            hex(commit),
            hex(recorded)
        );
    }
    println!(
        "REPLAY_SUMMARY merges={} merged={merged_count} equal_to_recorded={same}",
        merges.len()
    );
    drop(service);
    owner.stop().unwrap();
    std::fs::remove_dir_all(directory).unwrap();
}
