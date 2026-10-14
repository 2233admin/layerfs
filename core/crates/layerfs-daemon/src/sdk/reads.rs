//! File reads at a saved snapshot: read, list, stat, grep and glob.
//!
//! Every answer fits one control record, so each call is windowed: `read`
//! returns at most [`READ_WINDOW`] bytes from `offset` with the next offset,
//! `list` one directory window with the next name, and `grep` and `glob` a
//! bounded batch with a cursor to resume after the last returned item. `grep`
//! and `glob` walk at most [`MAXIMUM_SCAN`] entries below their path and refuse
//! a larger subtree (`TooLarge`) instead of answering for part of it. `grep`
//! is a literal match per line of text files within the text bound.
use super::args::{self, invalid, refuse, text, Answer};
use super::files::path as checked;
use super::snapshot::{self, answer, existing, header, kind_name, size, Snap};
use crate::store::{Store, StorePorts};
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::compare::{subtree, EntryFacts};
use layerfs_content::filesystem::directory::read::{list_after, DirectoryReadWork};
use layerfs_content::filesystem::path::PathName;
use layerfs_content::filesystem::sorted::DirectoryRoot;
use layerfs_content::merge::Rule;
use layerfs_content::object::inode_leaf::InodeKind;
use layerfs_telemetry::timer::Timing;
use std::sync::Arc;

/// Bytes one `read` returns.
pub(crate) const READ_WINDOW: u64 = 48 * 1024;
/// Text bytes one batch of results may carry.
pub(crate) const REPLY_BUDGET: usize = 48 * 1024;
/// Entries one `grep` or `glob` may walk.
pub(crate) const MAXIMUM_SCAN: usize = 1 << 16;
/// Bytes of one matched line `grep` shows.
const PREVIEW_BYTES: usize = 1024;
/// Names one `list` window returns.
const LIST_WINDOW: usize = 256;
/// Items one `grep` returns.
const GREP_ITEMS: usize = 1000;

fn optional_path(args: &SdkValue) -> Result<String, SdkRefusal> {
    checked(args.get_text("path").unwrap_or("/"))
}

/// `fs.read(path, { branch | commit, offset? })`.
pub(crate) fn read(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let path = checked(text(args, "path")?)?;
    let entry = existing(&reader, &snap, &path)?;
    if entry.value.kind != InodeKind::RegularFile {
        let code = match entry.value.kind {
            InodeKind::Directory => "IsDirectory",
            _ => "NotFile",
        };
        return Err(refuse(
            code,
            format!("{path} is not a regular file"),
            SdkValue::map([("path", SdkValue::text(path.as_str()))]),
        ));
    }
    let size = size(&reader, &entry)?;
    let offset = u64::try_from(args.get_int("offset").unwrap_or(0))
        .ok()
        .filter(|offset| *offset <= size)
        .ok_or_else(|| invalid(format!("offset is outside 0..={size}")))?;
    let end = size.min(offset.saturating_add(READ_WINDOW));
    let mut bytes = Vec::new();
    let (read, _) = Timing::disabled("fs.read", |timing| {
        layerfs_content::file::read_range(
            reader.as_ref(),
            entry.value.content_root,
            offset..end,
            &mut bytes,
            timing.child("content.read"),
        )
    });
    read.map_err(args::content)?;
    // A window that ends inside a character returns the whole characters.
    let content = match std::str::from_utf8(&bytes) {
        Ok(whole) if !whole.contains('\0') => ("text", SdkValue::text(whole)),
        Err(cut)
            if cut.error_len().is_none()
                && cut.valid_up_to() > 0
                && end < size
                && !bytes[..cut.valid_up_to()].contains(&0) =>
        {
            bytes.truncate(cut.valid_up_to());
            let whole = String::from_utf8(bytes).map_err(args::failed)?;
            ("text", SdkValue::Text(whole))
        }
        _ => ("bytes", SdkValue::Bytes(bytes)),
    };
    let returned = match &content.1 {
        SdkValue::Text(text) => text.len(),
        SdkValue::Bytes(bytes) => bytes.len(),
        _ => 0,
    } as u64;
    let next = offset + returned;
    let mut fields = header(&snap, &path);
    fields.extend([
        ("inode", SdkValue::Int(entry.serial as i64)),
        ("size", SdkValue::Int(size as i64)),
        ("offset", SdkValue::Int(offset as i64)),
        content,
        (
            "nextOffset",
            if next < size {
                SdkValue::Int(next as i64)
            } else {
                SdkValue::Null
            },
        ),
    ]);
    answer(fields)
}

/// `fs.stat(path, { branch | commit })`.
pub(crate) fn stat(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let path = checked(text(args, "path")?)?;
    let entry = existing(&reader, &snap, &path)?;
    let mut fields = header(&snap, &path);
    fields.extend([
        ("type", SdkValue::text(kind_name(entry.value.kind))),
        ("inode", SdkValue::Int(entry.serial as i64)),
        ("size", SdkValue::Int(size(&reader, &entry)? as i64)),
    ]);
    answer(fields)
}

fn directory(reader: &StorePorts, snap: &Snap, path: &str) -> Result<EntryFacts, SdkRefusal> {
    let entry = existing(reader, snap, path)?;
    if entry.value.kind == InodeKind::Directory {
        Ok(entry)
    } else {
        Err(refuse(
            "NotDirectory",
            format!("{path} is not a directory"),
            SdkValue::map([("path", SdkValue::text(path))]),
        ))
    }
}

/// `fs.list(path, { branch | commit, cursor? })`: one window of names.
pub(crate) fn list(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let path = optional_path(args)?;
    let dir = directory(&reader, &snap, &path)?;
    let after = args
        .get_text("cursor")
        .map(PathName::new)
        .transpose()
        .map_err(|_| invalid("cursor is not a name"))?;
    // Each item repeats its parent path; keep the window within the budget.
    let window = (REPLY_BUDGET / (path.len() + 320)).clamp(1, LIST_WINDOW);
    let page = list_after(
        reader.as_ref(),
        DirectoryRoot(dir.value.content_root),
        after.as_ref(),
        window,
        REPLY_BUDGET,
        &mut DirectoryReadWork::default(),
    )
    .map_err(args::content)?;
    let serials = page
        .entries
        .iter()
        .map(|(_, serial)| *serial)
        .collect::<Vec<_>>();
    let values = snap
        .tree
        .values(reader.as_ref(), &serials)
        .map_err(args::content)?;
    let mut items = Vec::with_capacity(serials.len());
    for ((name, serial), value) in page.entries.iter().zip(values) {
        let value = value.ok_or_else(|| args::failed("a bound inode has no record"))?;
        items.push(SdkValue::map([
            ("name", SdkValue::text(name.as_str())),
            (
                "path",
                SdkValue::text(layerfs_content::compare::tree::join(&path, name)),
            ),
            ("type", SdkValue::text(kind_name(value.kind))),
            ("inode", SdkValue::Int(*serial as i64)),
        ]));
    }
    let mut fields = header(&snap, &path);
    fields.extend([
        ("items", SdkValue::List(items)),
        (
            "nextCursor",
            SdkValue::opt_text(page.continuation.map(|name| name.as_str().to_owned())),
        ),
    ]);
    answer(fields)
}

/// Every entry at or below `path`, in path order, within [`MAXIMUM_SCAN`].
fn walk(
    reader: &StorePorts,
    snap: &Snap,
    path: &str,
) -> Result<Vec<(String, EntryFacts)>, SdkRefusal> {
    let top = existing(reader, snap, path)?;
    let mut out = Vec::new();
    if top.value.kind == InodeKind::Directory {
        let mut found = Vec::new();
        let complete = subtree(
            reader,
            &snap.tree,
            path,
            top.serial,
            MAXIMUM_SCAN,
            &mut found,
        )
        .map_err(args::content)?;
        if !complete {
            return Err(refuse(
                "TooLarge",
                format!("more than {MAXIMUM_SCAN} entries below {path}; name a narrower path"),
                SdkValue::map([("limit", SdkValue::Int(MAXIMUM_SCAN as i64))]),
            ));
        }
        out.extend(
            found
                .into_iter()
                .map(|(path, serial, value)| (path, EntryFacts { serial, value })),
        );
    } else {
        out.push((path.to_owned(), top));
    }
    out.sort_by(|a, b| a.0.cmp(&b.0));
    Ok(out)
}

/// A matched line as shown: at most [`PREVIEW_BYTES`], whole characters.
pub(crate) fn preview(line: &str) -> &str {
    let mut end = line.len().min(PREVIEW_BYTES);
    while !line.is_char_boundary(end) {
        end -= 1;
    }
    &line[..end]
}

/// `fs.grep(pattern, { branch | commit, path?, cursor? })`.
pub(crate) fn grep(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let pattern = text(args, "pattern")?;
    if pattern.is_empty() {
        return Err(invalid("pattern is empty"));
    }
    let path = optional_path(args)?;
    // The cursor names the last returned item: "<path>\n<line>".
    let cursor = match args.get_text("cursor") {
        Some(cursor) => {
            let (at, line) = cursor
                .rsplit_once('\n')
                .and_then(|(at, line)| Some((at.to_owned(), line.parse::<usize>().ok()?)))
                .ok_or_else(|| invalid("cursor is not a grep cursor"))?;
            Some((at, line))
        }
        None => None,
    };
    let mut items = Vec::new();
    let (mut spent, mut skipped, mut more) = (0usize, 0i64, false);
    'files: for (file, entry) in walk(&reader, &snap, &path)? {
        if entry.value.kind != InodeKind::RegularFile
            || cursor.as_ref().is_some_and(|(at, _)| file < *at)
        {
            continue;
        }
        let Some(content) = snapshot::text(&reader, Some(entry))? else {
            skipped += 1;
            continue;
        };
        for (index, line) in content.split('\n').enumerate() {
            let number = index + 1;
            if cursor
                .as_ref()
                .is_some_and(|(at, after)| file == *at && number <= *after)
                || !line.contains(pattern)
            {
                continue;
            }
            let shown = preview(line.trim());
            if items.len() == GREP_ITEMS || spent + file.len() + shown.len() > REPLY_BUDGET {
                more = true;
                break 'files;
            }
            spent += file.len() + shown.len() + 32;
            items.push(SdkValue::map([
                ("path", SdkValue::text(file.as_str())),
                ("line", SdkValue::Int(number as i64)),
                ("text", SdkValue::text(shown)),
            ]));
        }
    }
    let next_cursor = more.then_some(()).and_then(|()| {
        let last = items.last()?;
        Some(format!(
            "{}\n{}",
            last.get_text("path")?,
            last.get_int("line")?
        ))
    });
    let mut fields = header(&snap, &path);
    fields.extend([
        ("items", SdkValue::List(items)),
        ("skipped", SdkValue::Int(skipped)),
        ("nextCursor", SdkValue::opt_text(next_cursor)),
    ]);
    answer(fields)
}

/// `fs.glob(pattern, { branch | commit, path?, cursor? })`: matching paths in
/// path order. The pattern uses the `/.lww` syntax and must match the whole
/// path.
pub(crate) fn glob(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let rule = Rule::glob(text(args, "pattern")?);
    let path = optional_path(args)?;
    let after = args.get_text("cursor");
    let mut items = Vec::new();
    let (mut spent, mut next) = (0usize, None);
    for (found, _) in walk(&reader, &snap, &path)? {
        if after.is_some_and(|after| found.as_str() <= after) || !rule.matches_path(&found) {
            continue;
        }
        if spent + found.len() > REPLY_BUDGET {
            next = items.last().and_then(|last: &SdkValue| match last {
                SdkValue::Text(last) => Some(last.clone()),
                _ => None,
            });
            break;
        }
        spent += found.len() + 8;
        items.push(SdkValue::Text(found));
    }
    let mut fields = header(&snap, &path);
    fields.extend([
        ("items", SdkValue::List(items)),
        ("nextCursor", SdkValue::opt_text(next)),
    ]);
    answer(fields)
}
