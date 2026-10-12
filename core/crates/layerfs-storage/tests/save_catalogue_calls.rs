//! A Save reads committed pooled leaves while Content merges into them. The
//! catalogue work of one such read is counted here: it must follow the leaf,
//! not the number of Saves whose value groups the leaf's values lie in.
#[path = "support/memory_metadata.rs"]
mod metadata;
use layerfs_content::{
    inode_leaf::{
        encode_inode_value, InodeKind, InodeLeaf, InodeLeafRow, InodeValue, LEAF_ROW_BYTES,
    },
    FinalizedObject, ObjectId, ObjectRole,
};
use layerfs_storage::Storage;
use std::sync::Arc;

const ROWS: u64 = 8;
/// Saves after the first; each rewrites one more row of the leaf.
const REWRITES: u64 = 6;

/// The leaf after `rewrites` later Saves: its first `rewrites` rows rewritten.
fn leaf(rewrites: u64) -> FinalizedObject {
    let rows: Vec<_> = (0..ROWS)
        .map(|row| InodeLeafRow {
            serial: row + 1,
            value: encode_inode_value(InodeValue {
                kind: InodeKind::RegularFile,
                namespace_ref_count: 1,
                content_root: ObjectId::for_bytes(
                    &[&row.to_be_bytes()[..], &[u8::from(row < rewrites)]].concat(),
                ),
                metadata_root: ObjectId::for_bytes(b"metadata"),
            }),
        })
        .collect();
    let canonical = InodeLeaf {
        subtree_bytes: rows.len() as u64 * LEAF_ROW_BYTES as u64,
        rows,
    }
    .encode()
    .unwrap();
    FinalizedObject::new(ObjectRole::InodeLeaf, canonical).unwrap()
}

fn catalogue_calls(metadata: &metadata::MemoryMetadata) -> usize {
    metadata
        .calls
        .lock()
        .unwrap()
        .iter()
        .filter(|(name, _)| *name == "value_groups")
        .count()
}

/// Catalogue calls of one leaf read through a Save on a handle that has not
/// seen the leaf.
fn calls_of_a_save_read(
    metadata: &Arc<metadata::MemoryMetadata>,
    object: &FinalizedObject,
) -> usize {
    let handle = Storage::new(metadata.clone()).unwrap();
    let save = handle.begin_save().unwrap();
    let before = catalogue_calls(metadata);
    assert_eq!(
        save.read_objects(&[object.id()]).unwrap(),
        vec![object.canonical().to_vec()]
    );
    catalogue_calls(metadata) - before
}

#[test]
fn a_save_reads_a_leaf_of_many_groups_in_two_catalogue_calls() {
    let metadata = Arc::new(metadata::MemoryMetadata::default());
    for rewrites in 0..=REWRITES {
        let store = Storage::new(metadata.clone()).unwrap();
        let save = store.begin_save().unwrap();
        save.accept(leaf(rewrites)).unwrap();
        let saved = save.finish().unwrap();
        assert_eq!(saved.pool.leaves, 1);
        assert_eq!(saved.pool.groups, 1, "one fresh group a Save");
    }
    // The first Save's group holds every row; each later Save added a group of
    // one value. The last leaf names the values of all of them.
    let groups = metadata.state.lock().unwrap().groups.len();
    assert_eq!(groups as u64, 1 + REWRITES);

    // A leaf whose values are one whole group: one call.
    assert_eq!(calls_of_a_save_read(&metadata, &leaf(0)), CALLS_ONE_GROUP);
    // A leaf whose values lie in every group: the run's first ordinal, then
    // the ordinals that row left uncovered. Not one call a group.
    assert_eq!(
        calls_of_a_save_read(&metadata, &leaf(REWRITES)),
        CALLS_EVERY_GROUP
    );
}
const CALLS_ONE_GROUP: usize = 1;
const CALLS_EVERY_GROUP: usize = 2;
