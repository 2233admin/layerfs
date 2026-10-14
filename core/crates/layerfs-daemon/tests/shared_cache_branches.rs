//! Object reuse between two Workspaces of one daemon on nearby branches.
//!
//! Two branches are forked from one Layer and each is committed once with a
//! few different changes, by a first daemon. A second daemon then opens the
//! same Store with an empty shared cache and binds one Workspace to each
//! branch. The identity of every object of each published root is recorded
//! independently, straight from the Store port with no cache. After
//! Workspace A has read its whole tree, Workspace B reading its whole tree
//! demands from the Store exactly the objects of B's root that A's root does
//! not have, and nothing else; each Workspace reads its own bytes.
//!
//! Counts only; nothing is timed. Real Disposable Store, real owner, no
//! mount. Public API only; every wait is bounded and no thread is spawned.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[allow(dead_code)]
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/shared_cache_rig.rs"]
mod rig;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::evidence;
use layerfs_content::ObjectId;
use rig::{apply, commit, pattern, Do, Tree};
use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    os::unix::fs::symlink,
    path::Path,
};

/// Large enough that nothing is evicted: this proof is about identity.
const CACHE: usize = 64 * 1024 * 1024;
const MODULES: usize = 12;
const FILES: usize = 20;

/// Sources, dependencies, one file in chunks, symlinks and a hard link. No
/// empty file: its content is never demanded by a read of zero bytes.
fn tree(source: &Path) {
    for module in 0..MODULES {
        let directory = source.join(format!("src/m-{module:02}"));
        fs::create_dir_all(&directory).unwrap();
        for file in 0..FILES {
            let seed = (module * FILES + file) as u32;
            fs::write(
                directory.join(format!("f-{file:02}")),
                pattern(seed, 600 + 120 * file),
            )
            .unwrap();
        }
    }
    for package in 0..6 {
        let directory = source.join(format!("deps/pkg-{package}"));
        fs::create_dir_all(&directory).unwrap();
        for file in 0..10 {
            fs::write(
                directory.join(format!("lib-{file}")),
                pattern(5_000 + (package * 10 + file) as u32, 4096),
            )
            .unwrap();
        }
    }
    fs::write(source.join("deps/blob"), pattern(9_001, 300_000)).unwrap();
    fs::write(source.join("README"), b"shared cache branches\n").unwrap();
    symlink("src/m-00/f-00", source.join("entry")).unwrap();
    symlink("../pkg-1", source.join("deps/pkg-0/sibling")).unwrap();
    fs::hard_link(source.join("README"), source.join("src/README")).unwrap();
}

fn bytes(objects: &BTreeMap<ObjectId, usize>, ids: impl Iterator<Item = ObjectId>) -> u64 {
    ids.map(|id| objects[&id] as u64).sum()
}
/// Distinct contents of the regular files of one tree.
fn contents(flat: &model::Flat) -> BTreeSet<&[u8]> {
    flat.values()
        .filter(|seen| seen.kind == model::FILE)
        .map(|seen| seen.payload.as_slice())
        .collect()
}

#[test]
fn second_branch_demands_only_the_objects_the_first_does_not_have() {
    let tree = Tree::new("shared-cache-branches", 2, tree);
    let (branch_a, branch_b) = (tree.branches[0], tree.branches[1]);
    let a_bytes = pattern(70_001, 1_500);
    let b_bytes = pattern(70_002, 1_700);

    // Setup, by a daemon that is stopped before anything is counted: each
    // branch gets one Commit of a few changes; one path is edited by both.
    let setup = tree.daemon(2, CACHE);
    let base = setup.snapshot(branch_a).effective_root;
    let mut clock = 1_800_000_000;
    let a = setup.bind(branch_a, 1);
    for step in [
        Do::Truncate("src/m-03/f-07", 0),
        Do::Write("src/m-03/f-07", 0, &a_bytes),
        Do::Create("src/m-03/new-a", 0o644),
        Do::Write("src/m-03/new-a", 0, b"only on branch a\n"),
        Do::Remove("src/m-05/f-01"),
        Do::Chmod("deps/pkg-1/lib-0", 0o600),
    ] {
        assert!(apply(&a, &mut clock, step), "{step:?}");
    }
    let root_a = commit(&a);
    let b = setup.bind(branch_b, 2);
    for step in [
        Do::Truncate("src/m-03/f-07", 0),
        Do::Write("src/m-03/f-07", 0, &b_bytes),
        Do::Create("src/m-09/new-b", 0o644),
        Do::Write("src/m-09/new-b", 0, b"only on branch b\n"),
        Do::Rename("src/m-10/f-02", "src/m-10/renamed"),
    ] {
        assert!(apply(&b, &mut clock, step), "{step:?}");
    }
    let root_b = commit(&b);
    assert!(root_a != base && root_b != base && root_a != root_b);
    setup.close(&a);
    setup.close(&b);
    drop((a, b));
    setup.stop();

    // The measured daemon: the same Store file, an empty shared cache.
    let daemon = tree.daemon(2, CACHE);
    let (snapshot_a, snapshot_b) = (daemon.snapshot(branch_a), daemon.snapshot(branch_b));
    assert_eq!(
        (snapshot_a.effective_root, snapshot_b.effective_root),
        (root_a, root_b)
    );
    let (expected_a, objects_a) = daemon.published(&snapshot_a);
    let (expected_b, objects_b) = daemon.published(&snapshot_b);
    let only_b: Vec<ObjectId> = objects_b
        .keys()
        .filter(|id| !objects_a.contains_key(id))
        .copied()
        .collect();
    let shared = objects_b.len() - only_b.len();
    evidence(format_args!(
        "published objects: a={} ({} bytes) b={} ({} bytes) identical={} ({} bytes) only_b={} ({} bytes)",
        objects_a.len(),
        bytes(&objects_a, objects_a.keys().copied()),
        objects_b.len(),
        bytes(&objects_b, objects_b.keys().copied()),
        shared,
        bytes(&objects_b, objects_b.keys().copied()) - bytes(&objects_b, only_b.iter().copied()),
        only_b.len(),
        bytes(&objects_b, only_b.iter().copied()),
    ));
    assert!(shared > 0 && !only_b.is_empty());
    // The independent recording went around the cache.
    let empty = daemon.cache();
    assert_eq!(
        (empty.cache_hits, empty.cache_misses, empty.cached_objects),
        (0, 0, 0)
    );
    let stored = daemon.store.work();

    // Workspace A binds and reads its whole tree: one demand per object.
    let a = daemon.bind(branch_a, 11);
    let seen_a = drive::live(&a);
    model::assert_same(&expected_a, &seen_a, "Workspace A");
    let after_a = daemon.cache();
    let stored_a = daemon.store.work();
    assert_eq!(after_a.cache_misses, objects_a.len() as u64);
    assert_eq!(
        stored_a.object_ids - stored.object_ids,
        objects_a.len() as u64
    );
    assert_eq!(
        after_a.authenticated_bytes,
        bytes(&objects_a, objects_a.keys().copied())
    );
    assert_eq!(after_a.cached_objects, objects_a.len());
    assert_eq!(
        stored_a.length_ids - stored.length_ids,
        contents(&expected_a).len() as u64
    );

    // Workspace B binds and reads its whole tree: no demand for an object
    // A's root also has, exactly one for each object it does not have.
    let b = daemon.bind(branch_b, 12);
    let seen_b = drive::live(&b);
    model::assert_same(&expected_b, &seen_b, "Workspace B");
    let after_b = daemon.cache();
    let stored_b = daemon.store.work();
    assert_eq!(
        after_b.cache_misses - after_a.cache_misses,
        only_b.len() as u64
    );
    assert_eq!(
        stored_b.object_ids - stored_a.object_ids,
        only_b.len() as u64
    );
    assert_eq!(
        after_b.authenticated_bytes - after_a.authenticated_bytes,
        bytes(&objects_b, only_b.iter().copied())
    );
    assert_eq!(after_b.cached_objects, objects_a.len() + only_b.len());
    assert!(after_b.cache_hits > after_a.cache_hits);
    // A file length is remembered by content root: only contents A's tree
    // does not have are asked of the Store.
    let new_contents = contents(&expected_b)
        .difference(&contents(&expected_a))
        .count();
    assert_eq!(
        stored_b.length_ids - stored_a.length_ids,
        new_contents as u64
    );
    evidence(format_args!(
        "Workspace A alone: misses={} store_object_ids={} length_ids={}; Workspace B after A: misses={} store_object_ids={} length_ids={} hits={}",
        after_a.cache_misses,
        stored_a.object_ids - stored.object_ids,
        stored_a.length_ids - stored.length_ids,
        after_b.cache_misses - after_a.cache_misses,
        stored_b.object_ids - stored_a.object_ids,
        stored_b.length_ids - stored_a.length_ids,
        after_b.cache_hits - after_a.cache_hits,
    ));

    // Shared bytes are not a shared view: each Workspace has its own file.
    let edited = b"src/m-03/f-07".as_slice();
    assert_eq!(seen_a[edited].payload, a_bytes);
    assert_eq!(seen_b[edited].payload, b_bytes);
    assert!(seen_a.contains_key(b"src/m-03/new-a".as_slice()));
    assert!(!seen_b.contains_key(b"src/m-03/new-a".as_slice()));
    assert!(seen_b.contains_key(b"src/m-09/new-b".as_slice()));
    assert!(!seen_a.contains_key(b"src/m-09/new-b".as_slice()));
    assert!(!seen_a.contains_key(b"src/m-05/f-01".as_slice()));
    assert!(seen_b.contains_key(b"src/m-05/f-01".as_slice()));

    // Both again, in the other order: everything is identity-keyed and
    // resident, so neither reading costs the Store one object or length.
    let again_b = drive::live(&b);
    let again_a = drive::live(&a);
    model::assert_same(&expected_b, &again_b, "Workspace B again");
    model::assert_same(&expected_a, &again_a, "Workspace A again");
    let last = daemon.cache();
    assert_eq!(last.cache_misses, after_b.cache_misses);
    assert_eq!(daemon.store.work(), stored_b);
    assert_eq!(last.evictions, 0);

    daemon.close(&a);
    daemon.close(&b);
    drop((a, b));
    daemon.stop();
    tree.finish();
}
