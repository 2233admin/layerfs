//! Closed-template copies preserve isolation and ordinary namespace identities.
use layerfs_overlay::{Overlay, OverlayError, ProfileConfig};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicU64, Ordering},
};

struct Temp(PathBuf);
impl Temp {
    fn new() -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(1);
        let path = std::env::temp_dir().join(format!(
            "layerfs-template-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir(&path).unwrap();
        Self(path)
    }
}
impl Drop for Temp {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).unwrap();
    }
}

#[test]
fn copies_open_without_schema_ddl_and_keep_distinct_routes() {
    let temp = Temp::new();
    let template = temp.0.join("template.sqlite");
    let original = Overlay::create(&template, ProfileConfig::default()).unwrap();
    original.close_database().unwrap();
    let bytes = std::fs::read(&template).unwrap();
    let open = |namespace| {
        Overlay::copy_template_observed(
            &temp.0.join(format!("{namespace}.sqlite")),
            ProfileConfig::default(),
            &template,
            namespace,
        )
    };
    let first = open(1);
    assert_eq!(first.work.file_copy_calls, 1);
    assert_eq!(first.work.copied_bytes, bytes.len() as u64);
    assert_eq!(first.work.allocation.attempts, 0);
    let first = first.result.unwrap();
    let second = open(2).result.unwrap();
    let a = first.open_workspace([1; 32], [3; 32]).unwrap();
    let b = second.open_workspace([2; 32], [3; 32]).unwrap();
    assert_eq!((a.namespace(), b.namespace()), (1, 2));
    assert!(matches!(first.state(b), Err(OverlayError::Stale)));
    assert!(matches!(second.state(a), Err(OverlayError::Stale)));
    let before = second.state(b).unwrap();
    first.capture(a).unwrap();
    assert_eq!(second.state(b).unwrap(), before);
    first.close_database().unwrap();
    second.close_database().unwrap();
    assert_eq!(std::fs::read(&template).unwrap(), bytes);
    assert_eq!(std::fs::read_dir(&temp.0).unwrap().count(), 3);
}

#[test]
fn existing_copy_is_refused_and_its_bytes_remain_owned() {
    let temp = Temp::new();
    let template = temp.0.join("template.sqlite");
    Overlay::create(&template, ProfileConfig::default())
        .unwrap()
        .close_database()
        .unwrap();
    let path = temp.0.join("1.sqlite");
    std::fs::write(&path, b"retained").unwrap();
    let failed = Overlay::copy_template_observed(&path, ProfileConfig::default(), &template, 1);
    assert!(matches!(failed.result, Err(OverlayError::Io(_))));
    assert_eq!(failed.work.file_copy_calls, 0);
    assert_eq!(failed.work.sqlite_open_calls, 0);
    assert_eq!(std::fs::read(path).unwrap(), b"retained");
}
