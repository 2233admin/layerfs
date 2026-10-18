//! Workspace readers of one Store share whole pack bodies (#359 warm daemon):
//! a later Workspace takes them from the tier instead of reading them again,
//! two Workspaces reading the same objects at once get identical
//! authenticated bytes, and the tier is empty once the Store stops reading.
#[path = "support/installed_store.rs"]
#[allow(dead_code)]
mod installed;
#[path = "support/sdk.rs"]
#[allow(dead_code)]
mod support;

use layerfs_bridge::control::SdkValue;
use layerfs_content::{object::inode_leaf::InodeKind, AuthenticatedObjects};
use layerfs_history::WorkspaceId;
use layerfs_store_service::sdk::{snapshot, window};
use support::Fixture;

const FILES: usize = 120;

#[test]
fn workspaces_share_pack_bodies_until_the_store_stops() {
    let fixture = Fixture::new("shared-pack-reads", |source| {
        for f in 0..FILES {
            let dir = source.join(format!("d{}", f % 4));
            std::fs::create_dir_all(&dir).unwrap();
            std::fs::write(
                dir.join(format!("f{f:03}.txt")),
                format!("file {f}\n").repeat(1 + f % 37),
            )
            .unwrap();
        }
        FILES + 4
    });
    let store = &fixture.service.store;
    let args = SdkValue::map([
        ("project", SdkValue::text("installed")),
        ("branch", SdkValue::text("main")),
    ]);
    let (stack, control, snap) = snapshot::open(store, &args).unwrap();
    let mut roots = Vec::new();
    window::walk(&control, &snap, "/", |_, entry| {
        if entry.value.kind == InodeKind::RegularFile {
            roots.push(entry.value.content_root);
        }
        Ok(true)
    })
    .unwrap();
    assert_eq!(roots.len(), FILES);
    let statements = || fixture.work().statements;

    // W1 reads every file first; then W2, a fresh reader, reads them again
    // and takes the bodies W1 read from the tier: fewer statements than W1.
    let w1 = WorkspaceId::from_authority([7; 32]).unwrap();
    store.mount_reader(w1).unwrap();
    let ports = store.ports_for(stack.scope, w1);
    let before = statements();
    let expected = ports.read_canonical_batch(&roots).unwrap();
    let first = statements() - before;
    store.close_reader(w1).unwrap();
    let hits = store.shared_pack_work().hits;

    let w2 = WorkspaceId::from_authority([8; 32]).unwrap();
    store.mount_reader(w2).unwrap();
    let ports = store.ports_for(stack.scope, w2);
    let before = statements();
    assert_eq!(ports.read_canonical_batch(&roots).unwrap(), expected);
    let second = statements() - before;
    assert!(store.shared_pack_work().hits > hits, "W2 used the tier");
    assert!(second < first, "W2 read fewer packs: {second} vs {first}");
    // Both are the bytes a reader without the tier authenticates.
    assert_eq!(control.read_canonical_batch(&roots).unwrap(), expected);

    // Two Workspaces reading the same objects at once.
    let w3 = WorkspaceId::from_authority([9; 32]).unwrap();
    store.mount_reader(w3).unwrap();
    std::thread::scope(|scope| {
        for workspace in [w2, w3] {
            let ports = store.ports_for(stack.scope, workspace);
            let (roots, expected) = (&roots, &expected);
            scope.spawn(move || {
                for _ in 0..4 {
                    assert_eq!(&ports.read_canonical_batch(roots).unwrap(), expected);
                }
            });
        }
    });
    let work = store.shared_pack_work();
    assert!(
        work.entries > 0 && work.bytes <= layerfs_store_service::store::open::SHARED_PACK_BYTES
    );

    // Once the Store stops reading, the tier keeps nothing.
    store.close_reader(w2).unwrap();
    store.close_reader(w3).unwrap();
    store.stop_reads();
    let work = store.shared_pack_work();
    assert_eq!((work.entries, work.bytes), (0, 0));
    drop((ports, control));
    fixture.cleanup();
}
