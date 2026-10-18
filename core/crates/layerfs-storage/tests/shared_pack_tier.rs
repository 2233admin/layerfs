//! A Store's shared tier of whole pack bodies (#359 warm daemon): bounded by
//! bytes with second-chance eviction, never kept past close, refusing a
//! different body under a kept id, and safe under concurrent readers.
use layerfs_storage::{
    location::{PackDomain, PackInfo},
    port::ObjectKey,
    read::SharedPacks,
};
use std::sync::Arc;

fn body(id: i64, len: usize) -> (PackInfo, Vec<u8>) {
    let bytes = vec![id as u8; len];
    let info = PackInfo {
        pack_id: id,
        domain: PackDomain::Metadata,
        key: ObjectKey::for_bytes(&bytes),
        length: len,
    };
    (info, bytes)
}

#[test]
fn eviction_keeps_the_tier_under_its_budget_and_spares_a_used_body() {
    let tier = SharedPacks::new(300);
    for id in 1..=3 {
        let (info, bytes) = body(id, 100);
        tier.insert(info, &bytes).unwrap();
    }
    // Body 1 is used, so the clock passes it once and evicts 2, then 3.
    assert!(tier.get(1).is_some());
    for id in 4..=5 {
        let (info, bytes) = body(id, 100);
        tier.insert(info, &bytes).unwrap();
    }
    let work = tier.work();
    assert_eq!((work.bytes, work.entries), (300, 3));
    assert_eq!((work.evictions, work.evicted_bytes), (2, 200));
    assert!(tier.get(1).is_some(), "the used body stayed");
    assert!(tier.get(2).is_none() && tier.get(3).is_none());
    let (info, bytes) = body(5, 100);
    assert_eq!(tier.get(5).unwrap(), (info, Arc::from(&bytes[..])));
    // A body larger than the whole budget is never kept.
    let (info, bytes) = body(6, 301);
    tier.insert(info, &bytes).unwrap();
    assert!(tier.get(6).is_none());
    assert!(tier.work().bytes <= 300);
}

#[test]
fn a_different_body_under_a_kept_id_is_refused_and_nothing_survives_close() {
    let tier = SharedPacks::new(1024);
    let (info, bytes) = body(1, 64);
    tier.insert(info, &bytes).unwrap();
    // The same body again is accepted; different bytes under its id are not.
    tier.insert(info, &bytes).unwrap();
    let mut other = bytes.clone();
    other[0] ^= 1;
    assert!(tier.insert(info, &other).is_err());
    // A descriptor whose length is not the body's is never kept.
    let (bad, _) = body(2, 65);
    tier.insert(bad, &bytes).unwrap();
    assert!(tier.get(2).is_none());

    tier.close();
    assert!(tier.get(1).is_none(), "no body is handed out after close");
    let (info, bytes) = body(3, 64);
    tier.insert(info, &bytes).unwrap();
    assert!(tier.get(3).is_none(), "nothing is kept after close");
    assert_eq!((tier.work().bytes, tier.work().entries), (0, 0));
}

#[test]
fn concurrent_readers_see_only_whole_kept_bodies() {
    let tier = SharedPacks::new(16 * 256);
    let threads: Vec<_> = (0..8)
        .map(|t| {
            let tier = tier.clone();
            std::thread::spawn(move || {
                for round in 0..200i64 {
                    let id = 1 + (round * 7 + t) % 32;
                    let (info, bytes) = body(id, 256);
                    match tier.get(id) {
                        Some((kept, kept_bytes)) => {
                            assert_eq!(kept, info);
                            assert_eq!(&kept_bytes[..], &bytes[..]);
                        }
                        None => tier.insert(info, &bytes).unwrap(),
                    }
                }
            })
        })
        .collect();
    for thread in threads {
        thread.join().unwrap();
    }
    let work = tier.work();
    assert!(work.bytes <= 16 * 256 && work.entries <= 16);
    assert!(work.hits > 0 && work.evictions > 0);
}
