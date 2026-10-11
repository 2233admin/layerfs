//! Real public metadata publications preserve the bounded global candidate window.
mod support;
use layerfs_content::{
    inode_leaf::{encode_inode_value, InodeKind, InodeValue},
    ObjectId,
};
use layerfs_history::HistoryCatalogConfig;
use layerfs_persistence::{Handles, PersistenceConfig, SqlitePersistenceProfile};
use layerfs_storage::{
    encoding::{codec::CompressionWorkspace, pool::value_group},
    location::{PackDomain, PackInfo, ValueGroupRow},
    pack::{assemble, layout::PackLane},
    policy::{METADATA_INDEX_VALUES, VALUES_PER_GROUP},
    port::{
        ObjectKey, PackPersistence, PersistenceError, Publication, PublishedPack, Reserve,
        ValueGroupQuery,
    },
    StoragePolicy,
};
use std::sync::Arc;
const GROUPS_PER_PACK: usize = 16;
struct Fixture {
    handles: Handles,
    _temp: support::Temp,
}
impl Fixture {
    fn new(label: &str) -> Self {
        let temp = support::Temp::new(label);
        let handles = Handles::create(
            PersistenceConfig::sqlite(temp.join("store.sqlite"))
                .with_sqlite_profile(SqlitePersistenceProfile::Disposable),
            StoragePolicy::frozen_default(),
            &HistoryCatalogConfig {
                binding_key: b"concurrent-window".to_vec(),
                cursor_key: [41; 32],
                incarnation: 1,
            },
        )
        .unwrap();
        Self {
            handles,
            _temp: temp,
        }
    }
    fn reserve(&self, count: usize) -> u32 {
        self.handles
            .storage
            .reserve(Reserve {
                packs: 0,
                ordinals: count,
            })
            .unwrap()
            .first_ordinal
    }
    fn window(&self) -> u32 {
        self.handles
            .storage
            .value_groups(ValueGroupQuery::Page { from: 1, limit: 0 })
            .unwrap()
            .window_start
    }
    fn eligible(&self) -> u64 {
        let start = self.window();
        let mut from = start;
        let mut values = 0_u64;
        // Fixture upper bound: fewer than 1600 groups, at most 13 pages.
        for _ in 0..32 {
            let page = self
                .handles
                .storage
                .value_groups(ValueGroupQuery::Page { from, limit: 128 })
                .unwrap();
            assert_eq!(
                page.window_start, start,
                "no concurrent window change during observation"
            );
            values += page.rows.iter().map(|row| row.count as u64).sum::<u64>();
            let Some(next) = page.next else {
                return values;
            };
            assert!(next > from, "bounded chronological progress");
            from = next;
        }
        panic!("fixture catalogue exceeded its bounded page count");
    }
    fn publish_counts(&self, first: u32, counts: &[usize]) -> Vec<ValueGroupRow> {
        let raw = encode_inode_value(InodeValue {
            kind: InodeKind::RegularFile,
            namespace_ref_count: 1,
            content_root: ObjectId::for_bytes(b"window-value-content"),
            metadata_root: ObjectId::for_bytes(b"window-value-metadata"),
        });
        let canonical = value_group::canonical_value(&raw).unwrap();
        let values = vec![canonical; VALUES_PER_GROUP];
        let mut compression = CompressionWorkspace::new().unwrap();
        let full = value_group::build(&values, &mut compression).unwrap();
        let mut ordinal = first;
        let mut published = Vec::with_capacity(counts.len());
        for chunk in counts.chunks(GROUPS_PER_PACK) {
            let pack_id = self
                .handles
                .storage
                .reserve(Reserve {
                    packs: 1,
                    ordinals: 0,
                })
                .unwrap()
                .first_pack_id;
            let mut groups = Vec::with_capacity(chunk.len());
            let mut rows = Vec::with_capacity(chunk.len());
            for (number, &count) in chunk.iter().enumerate() {
                assert!((1..=VALUES_PER_GROUP).contains(&count));
                let built = if count == VALUES_PER_GROUP {
                    full.clone()
                } else {
                    value_group::build(&values[..count], &mut compression).unwrap()
                };
                rows.push(ValueGroupRow {
                    first_ordinal: ordinal,
                    count,
                    pack_id,
                    group_number: number,
                    digest: built.digest,
                });
                groups.push(built.group);
                ordinal = ordinal.checked_add(count as u32).unwrap();
            }
            let body = Arc::new(assemble(PackLane::PooledMetadata, &groups).unwrap());
            self.handles
                .storage
                .publish(&Publication {
                    packs: vec![PublishedPack {
                        info: PackInfo {
                            pack_id,
                            domain: PackDomain::Metadata,
                            key: ObjectKey::for_bytes(&body),
                            length: body.len(),
                        },
                        body,
                    }],
                    value_groups: rows.clone(),
                    ..Publication::default()
                })
                .unwrap();
            published.extend(rows);
        }
        published
    }
    fn publish(&self, first: u32, count: usize) -> Vec<ValueGroupRow> {
        let mut counts = vec![VALUES_PER_GROUP; count / VALUES_PER_GROUP];
        if count % VALUES_PER_GROUP != 0 {
            counts.push(count % VALUES_PER_GROUP);
        }
        self.publish_counts(first, &counts)
    }
    fn old_group_is_still_readable(&self, expected: ValueGroupRow) {
        let row = self
            .handles
            .storage
            .value_groups(ValueGroupQuery::Ordinals(&[expected.first_ordinal]))
            .unwrap();
        assert_eq!(
            row.rows,
            vec![expected],
            "window eviction does not delete immutable groups"
        );
        let mut packs = Vec::new();
        self.handles
            .storage
            .read_packs(&[expected.pack_id], &mut packs)
            .unwrap();
        assert_eq!(packs.len(), 1);
        assert_eq!(packs[0].info().key, ObjectKey::for_bytes(packs[0].body()));
    }
}
#[test]
fn late_group_below_the_window_cannot_rewind_or_charge_its_candidate_counter() {
    let f = Fixture::new("pool-window-late-below");
    let a = f.reserve(2);
    let seed = f.reserve(METADATA_INDEX_VALUES);
    let b = f.reserve(METADATA_INDEX_VALUES - 1);
    f.publish(seed, METADATA_INDEX_VALUES);
    f.publish(b, METADATA_INDEX_VALUES - 1);
    let before = f.window();
    assert_eq!(before, b);
    assert_eq!(f.eligible(), (METADATA_INDEX_VALUES - 1) as u64);
    let old = f.publish(a, 2)[0];
    let after = f.window();
    let eligible = f.eligible();
    f.old_group_is_still_readable(old);
    println!("POOL_WINDOW_BELOW before={before} after={after} eligible={eligible} bound={METADATA_INDEX_VALUES} old_point_read=true");
    assert_eq!(
        after, before,
        "a late below-window group changes neither marker nor eligible counter"
    );
    assert_eq!(eligible, (METADATA_INDEX_VALUES - 1) as u64);
    // Observe the otherwise private candidate counter through its next ordinary
    // publication. Ignoring A must leave exactly one value of capacity: C2
    // therefore overflows to the newest group, rather than hiding a larger suffix.
    let c = f.reserve(2);
    f.publish(c, 2);
    let next_floor = f.window();
    let next_eligible = f.eligible();
    f.old_group_is_still_readable(old);
    println!("POOL_WINDOW_AFTER_C floor={next_floor} expected={c} eligible={next_eligible} expected_values=2 old_point_read=true");
    assert_eq!(
        next_floor, c,
        "below-window A was not charged or used to reset the counter"
    );
    assert_eq!(next_eligible, 2);
}
#[test]
fn late_group_inside_the_window_cannot_reset_a_counter_under_a_larger_suffix() {
    let f = Fixture::new("pool-window-late-inside");
    let a = f.reserve(2);
    let b = f.reserve(METADATA_INDEX_VALUES - 1);
    f.publish(b, METADATA_INDEX_VALUES - 1);
    let before = f.window();
    assert_eq!(f.eligible(), (METADATA_INDEX_VALUES - 1) as u64);
    let old = f.publish(a, 2)[0];
    let after = f.window();
    let eligible = f.eligible();
    f.old_group_is_still_readable(old);
    println!("POOL_WINDOW_INSIDE before={before} after={after} eligible={eligible} bound={METADATA_INDEX_VALUES} old_point_read=true");
    assert!(after >= before, "published candidate floor is monotonic");
    assert!(
        eligible <= METADATA_INDEX_VALUES as u64,
        "counter reset cannot conceal a larger eligible suffix"
    );
}
#[test]
fn before_page_is_exclusive_paginated_paid_when_empty_and_rejects_split_groups() {
    let f = Fixture::new("pool-window-before-page");
    let first = f.reserve(6);
    let rows = f.publish_counts(first, &[2, 3, 1]);
    let page = f
        .handles
        .storage
        .value_groups(ValueGroupQuery::BeforePage {
            from: first,
            before: first + 5,
            limit: 1,
        })
        .unwrap();
    assert_eq!(page.rows, rows[..1]);
    assert_eq!(page.next, Some(first + 2));
    let next = f
        .handles
        .storage
        .value_groups(ValueGroupQuery::BeforePage {
            from: page.next.unwrap(),
            before: first + 5,
            limit: 1,
        })
        .unwrap();
    assert_eq!(next.rows, rows[1..2]);
    assert_eq!(next.next, None);
    assert_eq!(
        f.handles.storage.value_groups(ValueGroupQuery::BeforePage {
            from: first,
            before: first + 3,
            limit: 8
        }),
        Err(PersistenceError::Malformed)
    );
    let before = f.handles.diagnostics().unwrap();
    f.handles
        .storage
        .value_groups(ValueGroupQuery::Page {
            from: first,
            limit: 0,
        })
        .unwrap();
    let middle = f.handles.diagnostics().unwrap();
    let empty = f
        .handles
        .storage
        .value_groups(ValueGroupQuery::BeforePage {
            from: first,
            before: first,
            limit: 0,
        })
        .unwrap();
    let after = f.handles.diagnostics().unwrap();
    assert!(empty.rows.is_empty() && empty.next.is_none());
    let old_statements = middle.statements - before.statements;
    let bounded_statements = after.statements - middle.statements;
    assert!(
        bounded_statements > 0,
        "the empty indexed page remains paid"
    );
    assert_eq!(
        bounded_statements, old_statements,
        "same serial statement count including empty page"
    );
    println!("BEFORE_PAGE exclusive=true pages=2 split_group=Malformed empty_statements={bounded_statements} legacy_empty_statements={old_statements}");
}
