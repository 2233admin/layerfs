//! fs read calls over a replay snapshot (#354, #352 F-035): the measurement,
//! equivalence and complexity probes of fix record 015.
//!
//! Each probe opens a scratch copy of a replay Store, never the original, and
//! is skipped unless `LFS354_STORE` (the copy) and `LFS354_RECORD` (the run's
//! `project.record`) are set. One probe per command, each under 120 s:
//!
//!   split   old read path against old byte scan, per file, plus the grep call
//!   export  the snapshot's tree as native files under `LFS354_OUT`
//!   dump    a battery of read calls as text to `LFS354_OUT`; old and new
//!           binaries' dumps must be equal (page tokens are left out)
//!   paging  statements of one grep, glob and list page at page 1 and 100
//!   time    one whole-tree grep
use layerfs_bridge::control::{Answer, Reply, SdkCall, SdkValue};
use layerfs_bridge::provision::StoreManifest;
use layerfs_content::object::inode_leaf::InodeKind;
use layerfs_persistence::{PersistenceConfig, SqlitePersistenceProfile};
use layerfs_store_service::{
    bootstrap::open_store_observed,
    sdk::{dispatch, snapshot, window, Bodies},
    Owner, OwnerConfig, StoreService,
};
use layerfs_telemetry::timer::Timing;
use std::fmt::Write as _;
use std::path::PathBuf;
use std::time::{Duration, Instant};

const PROJECT: &str = "dsh";
const NEVER: &str = "LFS352_NEVER_PRESENT";

struct Probe {
    service: StoreService,
    _owner: Owner,
    _dir: PathBuf,
}

fn probe() -> Option<Probe> {
    let store = PathBuf::from(std::env::var_os("LFS354_STORE")?);
    let record = std::fs::read(std::env::var_os("LFS354_RECORD")?).unwrap();
    let Reply::Sdk(value) = Answer::decode(&record).unwrap().reply else {
        panic!("project.record reply kind");
    };
    let Some(SdkValue::Bytes(manifest)) = value.get("manifest") else {
        panic!("project.record manifest");
    };
    let manifest = StoreManifest::decode(manifest).unwrap();
    let dir = std::env::temp_dir().join(format!("lfs354-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let opened = open_store_observed(
        PersistenceConfig::sqlite(&store).with_sqlite_profile(SqlitePersistenceProfile::Disposable),
        &manifest.binding,
        manifest.cursor_key,
        64,
        64 * 1024,
        layerfs_storage::ReservationBlocks::default(),
    )
    .unwrap();
    let owner = Owner::start(
        &dir.join("overlay.sqlite"),
        layerfs_overlay::ProfileConfig::default(),
        OwnerConfig::default(),
    )
    .unwrap();
    let service = StoreService::new(opened, &owner);
    Some(Probe {
        service,
        _owner: owner,
        _dir: dir,
    })
}

impl Probe {
    fn call(&self, method: &str, fields: Vec<(&str, SdkValue)>) -> Result<SdkValue, String> {
        let mut map: Vec<(String, SdkValue)> = fields
            .into_iter()
            .map(|(name, value)| (name.to_owned(), value))
            .collect();
        map.push(("project".into(), SdkValue::text(PROJECT)));
        map.push(("branch".into(), SdkValue::text("main")));
        let call = SdkCall {
            method: method.into(),
            args: SdkValue::Map(map.into_iter().collect()),
        };
        dispatch(&self.service, &call, &mut Bodies::none())
            .map_err(|refusal| format!("{}: {}", refusal.code, refusal.message))
    }

    fn statements(&self) -> u64 {
        let sql = self.service.opened.diagnostics().unwrap();
        sql.writer.statements + sql.readers.iter().map(|r| r.statements).sum::<u64>()
    }

    fn args(&self) -> SdkValue {
        SdkValue::map([
            ("project", SdkValue::text(PROJECT)),
            ("branch", SdkValue::text("main")),
        ])
    }
}

fn out() -> PathBuf {
    PathBuf::from(std::env::var_os("LFS354_OUT").expect("LFS354_OUT"))
}

/// The pre-#354 byte loop over windows already in memory: KMP, line count
/// and the shown prefix, one byte at a time. Binary checks are left out: they
/// are timed with the scan.
fn old_scan(windows: &[Vec<u8>], prefix: usize, pattern: &[u8]) -> (u64, bool) {
    let mut failure = vec![0; pattern.len()];
    for i in 1..pattern.len() {
        let mut j = failure[i - 1];
        while j > 0 && pattern[i] != pattern[j] {
            j = failure[j - 1];
        }
        if pattern[i] == pattern[j] {
            j += 1;
        }
        failure[i] = j;
    }
    let (mut number, mut length, mut found) = (1u64, 0usize, 0u64);
    let mut shown = Vec::new();
    let mut utf8 = Vec::new();
    let (mut matched, mut state) = (false, 0);
    for (w, bytes) in windows.iter().enumerate() {
        utf8.extend_from_slice(bytes);
        if utf8.contains(&0) {
            return (found, true);
        }
        let valid = match std::str::from_utf8(&utf8) {
            Ok(_) => utf8.len(),
            Err(e) if e.error_len().is_none() && w + 1 < windows.len() => e.valid_up_to(),
            Err(_) => return (found, true),
        };
        utf8.drain(..valid);
        for &byte in bytes {
            length += 1;
            if shown.len() < prefix {
                shown.push(byte);
            }
            if !matched {
                while state > 0 && byte != pattern[state] {
                    state = failure[state - 1];
                }
                if byte == pattern[state] {
                    state += 1;
                }
                if state == pattern.len() {
                    matched = true;
                }
            }
            if byte == b'\n' {
                found += matched as u64;
                std::hint::black_box(&shown);
                shown.clear();
                number += 1;
                length = 0;
                state = 0;
                matched = false;
            }
        }
    }
    std::hint::black_box((number, length));
    (found, false)
}

/// Canonical objects a reader returned: demands, ids and bytes.
struct Counting<'a> {
    inner: &'a dyn layerfs_content::AuthenticatedObjects,
    batches: std::cell::Cell<u64>,
    ids: std::cell::Cell<u64>,
    bytes: std::cell::Cell<u64>,
}
impl Counting<'_> {
    fn count(&self, out: &[Vec<u8>]) {
        self.batches.set(self.batches.get() + 1);
        self.ids.set(self.ids.get() + out.len() as u64);
        self.bytes
            .set(self.bytes.get() + out.iter().map(|o| o.len() as u64).sum::<u64>());
    }
}
impl layerfs_content::AuthenticatedObjects for Counting<'_> {
    fn read_canonical_batch(
        &self,
        ids: &[layerfs_content::ObjectId],
    ) -> layerfs_content::ContentResult<Vec<Vec<u8>>> {
        let out = self.inner.read_canonical_batch(ids)?;
        self.count(&out);
        Ok(out)
    }
    fn read_canonical_batch_scoped(
        &self,
        ids: &[layerfs_content::ObjectId],
        scope: layerfs_telemetry::timer::TimingScope<'_>,
    ) -> layerfs_content::ContentResult<Vec<Vec<u8>>> {
        let out = self.inner.read_canonical_batch_scoped(ids, scope)?;
        self.count(&out);
        Ok(out)
    }
}

#[test]
fn split() {
    if std::env::var("LFS354_MODE").as_deref() != Ok("split") {
        return;
    }
    let Some(p) = probe() else { return };
    let store = p.service.store.clone();
    let (_, reader, snap) = snapshot::open(&store, &p.args()).unwrap();
    let (mut files, mut bytes, mut binary) = (0u64, 0u64, 0u64);
    let (mut walk, mut read, mut scan) = (Duration::ZERO, Duration::ZERO, Duration::ZERO);
    let (mut opened, mut chunked) = (Duration::ZERO, 0u64);
    let mut ids = std::collections::HashMap::new();
    let counting = Counting {
        inner: reader.as_ref(),
        batches: Default::default(),
        ids: Default::default(),
        bytes: Default::default(),
    };
    let (mut read_statements, mut read_objects) = (0u64, 0u64);
    let mut started = Instant::now();
    window::walk(&reader, &snap, "/", |_, entry| {
        walk += started.elapsed();
        if entry.value.kind == InodeKind::RegularFile {
            let (statements, objects) = (p.statements(), p.service.store.work().object_ids);
            let t = Instant::now();
            let view = Timing::disabled("probe", |scope| {
                layerfs_content::file::FileView::open(
                    &counting,
                    entry.value.content_root,
                    scope.child("open"),
                )
            })
            .0
            .unwrap();
            opened += t.elapsed();
            chunked += view.whole_file_bytes().unwrap().is_none() as u64;
            let size = view.logical_len();
            let mut windows = Vec::new();
            let mut offset = 0;
            while offset < size {
                let end = size.min(offset + 16384);
                let mut window = Vec::new();
                Timing::disabled("probe", |scope| {
                    view.read_range(&counting, offset..end, &mut window, scope)
                })
                .0
                .unwrap();
                windows.push(window);
                offset = end;
            }
            read += t.elapsed();
            read_statements += p.statements() - statements;
            read_objects += p.service.store.work().object_ids - objects;
            let t = Instant::now();
            let (_, bad) = old_scan(&windows, 1024, NEVER.as_bytes());
            scan += t.elapsed();
            files += 1;
            bytes += size;
            binary += bad as u64;
            *ids.entry(entry.value.content_root).or_insert(0u64) += size;
        }
        started = Instant::now();
        Ok(true)
    })
    .unwrap();
    let distinct: u64 = {
        let mut seen = std::collections::HashMap::new();
        let mut sum = 0;
        // Size per distinct id: the first file's size (all copies are equal).
        window::walk(&reader, &snap, "/", |_, entry| {
            if entry.value.kind == InodeKind::RegularFile
                && seen.insert(entry.value.content_root, ()).is_none()
            {
                sum += snapshot::size(&reader, &entry).unwrap();
            }
            Ok(true)
        })
        .unwrap();
        sum
    };
    let t = Instant::now();
    let reply = p
        .call(
            "fs.grep",
            vec![
                ("pattern", SdkValue::text(NEVER)),
                ("path", SdkValue::text("/")),
                ("pageSize", SdkValue::Int(50)),
                ("pagePos", SdkValue::Int(0)),
            ],
        )
        .unwrap();
    let call = t.elapsed();
    println!(
        "split files={files} bytes={bytes} distinct_ids={} distinct_bytes={distinct} binary={binary}\n\
         walk={walk:?} read={read:?} (of which open={opened:?}, chunked files={chunked}) scan={scan:?} (probe passes)\n\
         reads: statements={read_statements} store object ids={read_objects} canonical demands={} ids={} bytes={} for file bytes={bytes}\n\
         grep call={call:?} skipped={:?} items={}",
        ids.len(),
        counting.batches.get(),
        counting.ids.get(),
        counting.bytes.get(),
        reply.get("skipped"),
        match reply.get("items") {
            Some(SdkValue::List(items)) => items.len(),
            _ => 0,
        },
    );
}

#[test]
fn export() {
    if std::env::var("LFS354_MODE").as_deref() != Ok("export") {
        return;
    }
    let Some(p) = probe() else { return };
    let root = out();
    let store = p.service.store.clone();
    let (_, reader, snap) = snapshot::open(&store, &p.args()).unwrap();
    let (mut files, mut bytes) = (0u64, 0u64);
    window::walk(&reader, &snap, "/", |path, entry| {
        let target = root.join(path.trim_start_matches('/'));
        match entry.value.kind {
            InodeKind::Directory => std::fs::create_dir_all(&target).unwrap(),
            InodeKind::RegularFile => {
                let mut data = Vec::new();
                Timing::disabled("probe", |scope| {
                    layerfs_content::file::read_all_bounded(
                        reader.as_ref(),
                        entry.value.content_root,
                        u64::MAX,
                        &mut data,
                        scope.child("read"),
                    )
                })
                .0
                .unwrap();
                files += 1;
                bytes += data.len() as u64;
                std::fs::write(&target, data).unwrap();
            }
            InodeKind::Symlink => {}
        }
        Ok(true)
    })
    .unwrap();
    println!("export files={files} bytes={bytes} into {}", root.display());
}

/// One reply as text, without its page token.
fn render(text: &mut String, label: &str, reply: &Result<SdkValue, String>) {
    match reply {
        Ok(SdkValue::Map(map)) => {
            let _ = write!(text, "{label} ok");
            for (key, value) in map {
                if key != "nextPagePos" && key != "nextPage" {
                    let _ = write!(text, " {key}={value:?}");
                }
            }
            let _ = writeln!(text);
        }
        other => {
            let _ = writeln!(text, "{label} {other:?}");
        }
    }
}

fn items(reply: &SdkValue) -> Vec<SdkValue> {
    match reply.get("items") {
        Some(SdkValue::List(items)) => items.clone(),
        _ => Vec::new(),
    }
}

/// Pages through one call with its own tokens until `hasMore` is false.
fn pages(p: &Probe, method: &str, base: &[(&str, SdkValue)], size: i64) -> Vec<SdkValue> {
    let mut all = Vec::new();
    let mut position = SdkValue::Int(0);
    for _ in 0..100_000 {
        let mut fields = base.to_vec();
        fields.push(("pageSize", SdkValue::Int(size)));
        fields.push(("pagePos", position.clone()));
        let reply = p.call(method, fields).unwrap();
        all.extend(items(&reply));
        match reply.get("nextPagePos") {
            Some(SdkValue::Null) | None => return all,
            Some(next) => position = next.clone(),
        }
    }
    panic!("{method}: no last page");
}

/// True when `LFS354_PART` selects `name` (all parts when unset).
fn part(name: &str) -> bool {
    std::env::var("LFS354_PART").map_or(true, |part| part == name)
}

#[test]
fn dump() {
    if std::env::var("LFS354_MODE").as_deref() != Ok("dump") {
        return;
    }
    let Some(p) = probe() else { return };
    let mut text = String::new();
    let paths = [
        "/",
        "/packages",
        "/docs",
        "/packages/view",
        "/nope",
        "/README.md",
    ];
    let patterns = [
        NEVER,
        "import",
        "TODO",
        "e",
        "\n",
        "}\n",
        "a\nb",
        "function (",
        "é",
        "😀",
        "\u{0}",
        "export default",
        "  ",
        "the",
    ];
    for path in paths {
        for pattern in patterns {
            if !part("grep") {
                break;
            }
            for size in [50, 1000] {
                let reply = p.call(
                    "fs.grep",
                    vec![
                        ("pattern", SdkValue::text(pattern)),
                        ("path", SdkValue::text(path)),
                        ("pageSize", SdkValue::Int(size)),
                        ("pagePos", SdkValue::Int(0)),
                    ],
                );
                render(
                    &mut text,
                    &format!("grep {path} {pattern:?} {size}"),
                    &reply,
                );
            }
        }
        for glob in [
            "**",
            "*",
            "**/*.js",
            "*.md",
            "packages/**",
            "packages/*/src/**/*.js",
            "docs/*",
            "/README.md",
            "!docs/**",
            "packages/view/**/index.*",
            "**/test/**",
            "?ackages/**",
            "packages",
            "packages/",
            "x/**",
        ] {
            if !part("glob") {
                break;
            }
            for size in [50, 1000] {
                let reply = p.call(
                    "fs.glob",
                    vec![
                        ("pattern", SdkValue::text(glob)),
                        ("path", SdkValue::text(path)),
                        ("pageSize", SdkValue::Int(size)),
                        ("pagePos", SdkValue::Int(0)),
                    ],
                );
                render(&mut text, &format!("glob {path} {glob:?} {size}"), &reply);
            }
        }
        for size in [50, 1000].into_iter().filter(|_| part("list")) {
            let reply = p.call(
                "fs.list",
                vec![
                    ("path", SdkValue::text(path)),
                    ("pageSize", SdkValue::Int(size)),
                    ("pagePos", SdkValue::Int(0)),
                ],
            );
            render(&mut text, &format!("list {path} {size}"), &reply);
        }
    }
    // Every regular file under a few folders: whole reads and line windows.
    let store = p.service.store.clone();
    let (_, reader, snap) = snapshot::open(&store, &p.args()).unwrap();
    let mut files = Vec::new();
    window::walk(&reader, &snap, "/", |path, entry| {
        if entry.value.kind == InodeKind::RegularFile && files.len() < 4000 {
            files.push(path.to_owned());
        }
        Ok(true)
    })
    .unwrap();
    for (i, file) in files.iter().enumerate().filter(|_| part("read")) {
        let windows: &[(i64, Option<i64>)] = if i % 10 == 0 {
            &[(1, None), (2, Some(3)), (100, Some(5000)), (2001, None)]
        } else {
            &[(1, None)]
        };
        for &(start, end) in windows {
            let mut fields = vec![
                ("path", SdkValue::text(file.as_str())),
                ("startLine", SdkValue::Int(start)),
            ];
            if let Some(end) = end {
                fields.push(("endLine", SdkValue::Int(end)));
            }
            let reply = p.call("fs.read", fields);
            render(&mut text, &format!("read {file} {start} {end:?}"), &reply);
        }
    }
    // Paging through equals the largest pages, on each binary's own tokens.
    let mut paged = 0;
    for (method, base) in [
        (
            "fs.grep",
            vec![
                ("pattern", SdkValue::text("import")),
                ("path", SdkValue::text("/packages")),
            ],
        ),
        (
            "fs.grep",
            vec![
                ("pattern", SdkValue::text("e")),
                ("path", SdkValue::text("/docs")),
            ],
        ),
        (
            "fs.glob",
            vec![
                ("pattern", SdkValue::text("**")),
                ("path", SdkValue::text("/")),
            ],
        ),
        ("fs.list", vec![("path", SdkValue::text("/"))]),
    ]
    .into_iter()
    .filter(|_| part("pages"))
    {
        let size = std::env::var("LFS354_PAGE").map_or(7, |s| s.parse().unwrap());
        let small = pages(&p, method, &base, size);
        let large = pages(&p, method, &base, 1000);
        assert_eq!(small, large, "{method} {base:?}: paging differs");
        let _ = writeln!(text, "pages {method} {base:?} {} items", small.len());
        for item in &small {
            let _ = writeln!(text, "  {item:?}");
        }
        paged += small.len();
    }
    std::fs::write(out(), &text).unwrap();
    println!(
        "dump {} bytes, {} reads, {paged} paged items -> {}",
        text.len(),
        files.len(),
        out().display()
    );
}

#[test]
fn paging() {
    if std::env::var("LFS354_MODE").as_deref() != Ok("paging") {
        return;
    }
    let Some(p) = probe() else { return };
    for (method, base) in [
        (
            "fs.grep",
            vec![
                ("pattern", SdkValue::text("e")),
                ("path", SdkValue::text("/")),
            ],
        ),
        (
            "fs.glob",
            vec![
                ("pattern", SdkValue::text("**")),
                ("path", SdkValue::text("/")),
            ],
        ),
        ("fs.list", vec![("path", SdkValue::text("/"))]),
    ] {
        let mut position = SdkValue::Int(0);
        let mut cost = Vec::new();
        for page in 1..=100 {
            let mut fields = base.clone();
            fields.push(("pageSize", SdkValue::Int(5)));
            fields.push(("pagePos", position.clone()));
            let before = p.statements();
            let reply = p.call(method, fields).unwrap();
            cost.push((page, p.statements() - before));
            match reply.get("nextPagePos") {
                Some(SdkValue::Null) | None => break,
                Some(next) => position = next.clone(),
            }
        }
        println!(
            "paging {method}: page 1 {:?}, last page {:?} of {}",
            cost.first(),
            cost.last(),
            cost.len()
        );
    }
}

#[test]
fn time() {
    if std::env::var("LFS354_MODE").as_deref() != Ok("time") {
        return;
    }
    let Some(p) = probe() else { return };
    let before = p.statements();
    let t = Instant::now();
    let reply = p
        .call(
            "fs.grep",
            vec![
                ("pattern", SdkValue::text(NEVER)),
                ("path", SdkValue::text("/")),
                ("pageSize", SdkValue::Int(50)),
                ("pagePos", SdkValue::Int(0)),
            ],
        )
        .unwrap();
    println!(
        "time grep {NEVER} / : {:?}, statements {}, skipped {:?}",
        t.elapsed(),
        p.statements() - before,
        reply.get("skipped")
    );
}
