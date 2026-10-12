//! A Storage handle that has not saved before rebuilds its index of pooled
//! values from every value group still in the window. The pack reads of that
//! rebuild are counted here: one acquisition for each pack, however many
//! groups of the pack the rebuild reads.
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

/// Earlier Saves, each of which writes one pooled pack.
const SAVES: u64 = 6;
/// Leaves of one Save: one value group each, all in that Save's pack.
const LEAVES_A_SAVE: u64 = 3;

fn leaf(index: u64) -> FinalizedObject {
    let rows: Vec<_> = (0..2)
        .map(|row| InodeLeafRow {
            serial: 2 * index + row + 1,
            value: encode_inode_value(InodeValue {
                kind: InodeKind::RegularFile,
                namespace_ref_count: 1,
                content_root: ObjectId::for_bytes(&(2 * index + row).to_be_bytes()),
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

#[test]
fn a_first_save_reads_each_pack_of_the_window_once() {
    let metadata = Arc::new(metadata::MemoryMetadata::default());
    for save in 0..SAVES {
        let store = Storage::new(metadata.clone()).unwrap();
        let saving = store.begin_save().unwrap();
        for index in 0..LEAVES_A_SAVE {
            saving.accept(leaf(save * LEAVES_A_SAVE + index)).unwrap();
        }
        let saved = saving.finish().unwrap();
        assert_eq!(saved.pool.groups, LEAVES_A_SAVE);
    }
    let (groups, pooled_packs) = {
        let state = metadata.state.lock().unwrap();
        let packs: std::collections::BTreeSet<_> =
            state.groups.values().map(|row| row.pack_id).collect();
        (state.groups.len() as u64, packs)
    };
    assert_eq!(groups, SAVES * LEAVES_A_SAVE);
    assert_eq!(pooled_packs.len() as u64, SAVES, "one pooled pack a Save");

    // A handle that has saved nothing: its first Save reads every group.
    let fresh = Storage::new(metadata.clone()).unwrap();
    metadata.acquired_pack_ids.lock().unwrap().clear();
    let saving = fresh.begin_save().unwrap();
    saving.accept(leaf(SAVES * LEAVES_A_SAVE)).unwrap();
    let saved = saving.finish().unwrap();
    assert_eq!(saved.pool.groups, 1);
    let acquired = metadata.acquired_pack_ids.lock().unwrap().clone();
    let rebuild: Vec<_> = acquired
        .iter()
        .filter(|pack| pooled_packs.contains(pack))
        .collect();
    assert_eq!(
        rebuild.len() as u64,
        SAVES * READS_A_PACK,
        "pack reads of the rebuild: {acquired:?}"
    );
}
/// Acquisitions of one earlier pooled pack by a first Save's rebuild.
const READS_A_PACK: u64 = 1;
