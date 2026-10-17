//! Paging a Commit difference resumes where the last page stopped (#352
//! F-010): a later page does not walk the pairs earlier pages listed, and a
//! listing without line hunks fits its page by paths, not by file contents.
#[path = "support/installed_store.rs"]
#[allow(dead_code)]
mod installed;
#[path = "support/sdk_compare.rs"]
#[allow(dead_code)]
mod support;

use layerfs_bridge::control::SdkValue;
use std::fs;
use support::{items, paths, write, Fixture};

const DIRS: usize = 12;
const FILES: usize = 10;

fn body(d: usize, f: usize, round: usize) -> String {
    use std::fmt::Write;
    let mut text = String::new();
    for line in 0..60 {
        writeln!(text, "d{d} f{f} line {line} round {round}").unwrap();
    }
    text
}

fn fixture(label: &str) -> (Fixture, String, String) {
    let fixture = Fixture::new(label, |source| {
        for d in 0..DIRS {
            let dir = source.join(format!("d{d:02}"));
            fs::create_dir(&dir).unwrap();
            for f in 0..FILES {
                fs::write(dir.join(format!("f{f:02}.txt")), body(d, f, 0)).unwrap();
            }
        }
        DIRS * (FILES + 1)
    });
    fixture.fork("work");
    let first = fixture.apply("work", vec![write("/seed.txt", "seed\n")]);
    let changes = (0..DIRS)
        .flat_map(|d| (0..FILES).map(move |f| (d, f)))
        .map(|(d, f)| write(&format!("/d{d:02}/f{f:02}.txt"), body(d, f, 1)))
        .collect();
    let second = fixture.apply("work", changes);
    let head = |v: &SdkValue| v.get_text("head").unwrap().to_owned();
    (fixture, head(&first), head(&second))
}

fn page(fixture: &Fixture, from: &str, to: &str, cursor: &SdkValue, hunks: bool) -> SdkValue {
    let mut fields = vec![
        ("from", SdkValue::text(from)),
        ("to", SdkValue::text(to)),
        ("pageSize", SdkValue::Int(1000)),
        ("cursor", cursor.clone()),
    ];
    if !hunks {
        fields.push(("hunks", SdkValue::Bool(false)));
    }
    fixture.call("branch.diff_commits", fields)
}

#[test]
fn cursor_pages_resume_and_list_every_change_once() {
    let (fixture, from, to) = fixture("sdk-diff-pages-cursor");
    let mut cursor = SdkValue::Null;
    let mut listed = Vec::new();
    let mut work = Vec::new();
    loop {
        let before = fixture.work();
        let value = page(&fixture, &from, &to, &cursor, true);
        work.push(fixture.since(before).statements);
        listed.extend(paths(&value).into_iter().map(str::to_owned));
        if !value.get_bool("hasMore") {
            break;
        }
        cursor = value.get("nextCursor").cloned().expect("nextCursor");
        assert!(matches!(cursor, SdkValue::Text(_)), "{cursor:?}");
    }
    let expected: Vec<String> = (0..DIRS)
        .flat_map(|d| (0..FILES).map(move |f| format!("/d{d:02}/f{f:02}.txt")))
        .collect();
    assert_eq!(listed, expected, "every change once, in path order");
    assert!(work.len() >= 3, "the hunks fill several pages: {work:?}");
    // A resumed page pays for its own items, not for the pages before it.
    let (first, last) = (work[0], *work.last().unwrap());
    println!("SDK_DIFF_PAGES pages={} statements={work:?}", work.len());
    assert!(
        last <= first + first / 4,
        "the last page re-walks earlier pages: {work:?}"
    );
    fixture.cleanup();
}

#[test]
fn a_listing_without_hunks_fits_by_paths() {
    let (fixture, from, to) = fixture("sdk-diff-pages-paths");
    let value = page(&fixture, &from, &to, &SdkValue::Null, false);
    assert_eq!(
        items(&value).len(),
        DIRS * FILES,
        "one page lists every path"
    );
    assert!(!value.get_bool("hasMore"));
    let item = &items(&value)[0];
    assert!(item.get_bool("content"));
    assert_eq!(item.get("hunks"), Some(&SdkValue::Null));
    assert!(!item.get_bool("hunksOmitted"));
    fixture.cleanup();
}
