//! A long-lived Storage handle remembers a bounded number of catalogue rows.
//! Reaching that bound must never cost a read: a pooled leaf whose catalogue
//! reply arrives while the handle is at its bound still finds every row of
//! that reply. A daemon's fixed read handles serve every Workspace for the
//! daemon's lifetime, so on a long branch they reach the bound in service.
#[path = "support/memory_metadata.rs"]
mod metadata;
use layerfs_content::{
    inode_leaf::{
        encode_inode_value, InodeKind, InodeLeaf, InodeLeafRow, InodeValue, LEAF_ROW_BYTES,
    },
    FinalizedObject, ObjectId, ObjectRole,
};
use layerfs_storage::{policy::READ_OBJECT_LIMIT, Storage};
use std::sync::Arc;

/// Leaves of two rows each: enough that their groups exceed the row bound.
const LEAVES: u64 = READ_OBJECT_LIMIT as u64 / 2 + 64;

fn leaf(index: u64, generation: u8) -> FinalizedObject {
    let value = |row: u64, generation: u8| {
        encode_inode_value(InodeValue {
            kind: InodeKind::RegularFile,
            namespace_ref_count: 1,
            content_root: ObjectId::for_bytes(&[&row.to_be_bytes()[..], &[generation]].concat()),
            metadata_root: ObjectId::for_bytes(b"metadata"),
        })
    };
    let rows = vec![
        InodeLeafRow {
            serial: 2 * index + 1,
            value: value(2 * index + 1, 0),
        },
        // Only the second row differs between the generations.
        InodeLeafRow {
            serial: 2 * index + 2,
            value: value(2 * index + 2, generation),
        },
    ];
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

#[test]
fn a_handle_at_its_catalogue_row_bound_still_reads_every_leaf() {
    let metadata = Arc::new(metadata::MemoryMetadata::default());
    // Two Saves: every leaf, then every leaf with one row rewritten. A leaf of
    // the second Save names one value of each Save, so its values lie in two
    // groups and its catalogue reply holds two rows.
    for generation in [0, 1] {
        let store = Storage::new(metadata.clone()).unwrap();
        let save = store.begin_save().unwrap();
        for index in 0..LEAVES {
            save.accept(leaf(index, generation)).unwrap();
        }
        let saved = save.finish().unwrap();
        assert_eq!(saved.pool.leaves, LEAVES);
        assert_eq!(saved.pool.groups, LEAVES, "one group a leaf and Save");
    }
    let groups = metadata.state.lock().unwrap().groups.len();
    assert_eq!(groups as u64, 2 * LEAVES);
    assert!(groups > READ_OBJECT_LIMIT);

    // One handle for every demand, one reader a demand, as a daemon's fixed
    // read handle serves them.
    let handle = Storage::new(metadata.clone()).unwrap();
    let read = |object: &FinalizedObject| {
        handle
            .reader()
            .and_then(|reader| reader.read_objects(&[object.id()]))
    };
    metadata.calls.lock().unwrap().clear();
    // One row first, so that the two-row replies that follow straddle the
    // bound instead of meeting it exactly.
    let first = leaf(0, 0);
    assert_eq!(read(&first).unwrap(), vec![first.canonical().to_vec()]);
    let mut read_leaves = 1;
    for index in 1..LEAVES {
        let object = leaf(index, 1);
        let before = catalogue_calls(&metadata);
        let bytes = read(&object).unwrap_or_else(|error| {
            panic!("leaf {index} after {read_leaves} leaves on this handle: {error:?}")
        });
        assert_eq!(bytes, vec![object.canonical().to_vec()]);
        // The same work for a leaf whatever the handle read before it: one
        // catalogue call for the leaf, one for each element of its chain.
        let calls = catalogue_calls(&metadata) - before;
        assert_eq!(calls, CALLS_A_LEAF, "leaf {index}");
        read_leaves += 1;
    }
    assert_eq!(read_leaves, LEAVES);
    assert_eq!(
        catalogue_calls(&metadata) as u64,
        1 + (LEAVES - 1) * CALLS_A_LEAF as u64
    );
}
/// Catalogue calls of one second-Save leaf on a handle that has not seen it.
const CALLS_A_LEAF: usize = 1;
