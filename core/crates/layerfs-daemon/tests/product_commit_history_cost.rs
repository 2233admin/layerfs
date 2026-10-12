//! Counted Store work of equal changes committed one after another by one
//! Workspace through the product constructor `BoundWorkspace::commit_captured`,
//! over a real Disposable Store and the real local owner, without a mount.
//! Every Commit applies the same shape of change, so a count that differs
//! between an early and a late Commit is a cost of the Commits already made.
//! Counts are printed as evidence; only exact arithmetic is asserted. Nothing
//! is timed.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[allow(dead_code)]
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::{evidence, settled, Do, Rig, Session};
use layerfs_history::CommitStagedOutcome;
use layerfs_persistence::SqlitePersistenceProfile;
use layerfs_storage::Diagnostics;
use std::{fs, path::Path};

/// Commits made by the one Workspace.
const COMMITS: usize = 12;
/// Directories of the base, twenty files each.
const DIRECTORIES: usize = 24;

fn tree(source: &Path) {
    for directory in 0..DIRECTORIES {
        let path = source.join(format!("d-{directory:02}"));
        fs::create_dir_all(&path).unwrap();
        for file in 0..20 {
            fs::write(
                path.join(format!("f-{file:02}")),
                format!("base {directory} {file}\n"),
            )
            .unwrap();
        }
    }
}

/// The Store reads and writes of one Commit's own producer.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct Reads {
    policy: u64,
    locate: u64,
    locator_misses: u64,
    read_packs: u64,
    read_pack_selections: u64,
    pack_misses: u64,
    value_groups: u64,
    signatures: u64,
    pooled_groups: u64,
    publish: u64,
}
impl Reads {
    fn of(storage: &Diagnostics) -> Self {
        Self {
            policy: storage.policy,
            locate: storage.locate,
            locator_misses: storage.locator_misses,
            read_packs: storage.read_packs,
            read_pack_selections: storage.read_pack_selections,
            pack_misses: storage.pack_misses,
            value_groups: storage.value_groups,
            signatures: storage.signatures,
            pooled_groups: storage.pooled_groups,
            publish: storage.publish,
        }
    }
}

/// One Commit's change: one new file with its own bytes, one stored file
/// rewritten and one stored file's mode changed, each in its own directory
/// and never the same path twice.
fn change(session: &mut Session<'_>, commit: usize) {
    let added = format!("d-{:02}/new-{commit:02}", commit % DIRECTORIES);
    let rewritten = format!("d-{:02}/f-{:02}", (commit + 7) % DIRECTORIES, commit % 20);
    let moded = format!("d-{:02}/f-{:02}", (commit + 13) % DIRECTORIES, commit % 20);
    let bytes = format!("commit {commit} content\n");
    session.all(&[
        Do::Create(&added, 0o644),
        Do::Write(&added, 0, bytes.as_bytes()),
        Do::Write(&rewritten, 0, bytes.as_bytes()),
        Do::Chmod(&moded, 0o600 + (commit as u32 % 8)),
    ]);
}

#[test]
fn equal_commits_read_the_store_alike_whatever_was_committed_before() {
    let rig = Rig::new("product-commit-history-cost", tree);
    assert_eq!(
        rig.f.config.sqlite_profile,
        SqlitePersistenceProfile::Disposable
    );
    let workspace = rig.bind(1);
    let mut session = Session::new(&workspace, rig.base.clone());
    let mut reads = Vec::with_capacity(COMMITS);
    let mut rows = Vec::with_capacity(COMMITS);
    for commit in 0..COMMITS {
        change(&mut session, commit);
        settled(&rig.owner.client(), 0);
        let success = workspace
            .commit_captured()
            .unwrap_or_else(|failure| panic!("{failure:?}"));
        assert!(matches!(success.history, CommitStagedOutcome::Committed(_)));
        let work = success
            .namespace
            .as_ref()
            .and_then(|namespace| namespace.work)
            .expect("the producer ran");
        let one = Reads::of(&success.storage);
        evidence(format_args!(
            "PRODUCT_COMMIT_HISTORY_COST commit={} inode_rows={} entry_rows={} record_jobs={} saved_packs={} {one:?}",
            commit + 1,
            work.inode_rows,
            work.entry_rows,
            work.record_jobs,
            success.saved.packs
        ));
        if commit == 1 || commit + 1 == COMMITS {
            evidence(format_args!(
                "PRODUCT_COMMIT_HISTORY_COST_ALL commit={} {:?} {:?}",
                commit + 1,
                success.storage,
                success.saved
            ));
        }
        rows.push((work.inode_rows, work.entry_rows));
        reads.push(one);
        drop(success);
    }
    // The same shape of change reaches the producer at every Commit.
    assert!(rows.iter().all(|row| *row == rows[0]), "{rows:?}");
    // Only the first Commit of the Workspace opens a producer: it alone reads
    // the policy row and the content-hint table.
    assert_eq!((reads[0].policy, reads[0].signatures), (1, 1));
    for (commit, pair) in reads.windows(2).enumerate() {
        let (earlier, later) = (pair[0], pair[1]);
        assert_eq!((later.policy, later.signatures), (0, 0), "{later:?}");
        // A later Commit asks the catalogue for the window, for the groups
        // published since its last Save, and once for each group the Commit
        // before it published; never for a group it already asked for.
        assert_eq!(
            later.value_groups,
            earlier.pooled_groups + 2,
            "commit {}",
            commit + 2
        );
    }
    drop(session);
    rig.close(&workspace);
    drop(workspace);
    rig.finish();
}
