//! Positional SDK reads with numeric paging and bounded streaming text windows.
use super::{
    args::{self, invalid, text, Answer},
    files::path as checked,
    snapshot::{self, answer, existing, header, kind_name, size},
    window,
};
use crate::store::Store;
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::{
    compare::memo::Memo,
    filesystem::{
        directory::read::{list_after, DirectoryReadWork},
        sorted::DirectoryRoot,
    },
    merge::Rule,
    object::inode_leaf::InodeKind,
};
use std::sync::Arc;

pub const REPLY_BUDGET: usize = window::BYTES;
fn optional_path(args: &SdkValue) -> Result<String, SdkRefusal> {
    checked(args.get_text("path").unwrap_or("/"))
}

pub fn line_arg(args: &SdkValue, name: &str, default: u64) -> Result<u64, SdkRefusal> {
    match args.get(name) {
        None | Some(SdkValue::Null) => Ok(default),
        Some(SdkValue::Int(n)) if *n > 0 && *n <= 9_007_199_254_740_991 => Ok(*n as u64),
        _ => Err(invalid(format!("{name} must be a positive safe integer"))),
    }
}

pub fn read(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let path = checked(text(args, "path")?)?;
    let entry = existing(&reader, &snap, &path)?;
    let start = line_arg(args, "startLine", 1)?;
    let end = line_arg(args, "endLine", 9_007_199_254_740_991)?;
    if end < start {
        return Err(invalid("endLine must be at least startLine"));
    }
    let requested_end = end;
    let end = end.min(start.saturating_add(window::LINES as u64 - 1));
    let (mut content, mut next, mut clipped) = (String::new(), None, false);
    let mut last = None;
    window::lines(&reader, &entry, REPLY_BUDGET, None, |n, line| {
        if n < start {
            return Ok(true);
        }
        if n > requested_end {
            return Ok(false);
        }
        if n > end || (!content.is_empty() && content.len() + line.text.len() > REPLY_BUDGET) {
            next = Some(n);
            return Ok(false);
        }
        clipped |= line.truncated;
        last = Some(n);
        content.push_str(&line.text);
        Ok(true)
    })?;
    // Return either aggregate text or per-line data, avoiding duplicate payload on the wire.
    let mut fields = header(&snap, &path);
    fields.extend([
        ("text", SdkValue::text(content)),
        ("startLine", SdkValue::Int(start as i64)),
        (
            "endLine",
            last.map_or(SdkValue::Null, |n| SdkValue::Int(n as i64)),
        ),
        ("lineTruncated", SdkValue::Bool(clipped)),
        ("truncated", SdkValue::Bool(clipped || next.is_some())),
        (
            "nextLine",
            next.map_or(SdkValue::Null, |n| SdkValue::Int(n as i64)),
        ),
        ("size", SdkValue::Int(size(&reader, &entry)? as i64)),
    ]);
    answer(fields)
}

pub fn stat(store: &Arc<Store>, args: &SdkValue) -> Answer {
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

pub fn list(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let path = optional_path(args)?;
    let dir = existing(&reader, &snap, &path)?;
    if dir.value.kind != InodeKind::Directory {
        return Err(args::refuse(
            "NotDirectory",
            "expected a directory",
            SdkValue::Null,
        ));
    }
    let (limit, pos) = args::paging(args)?;
    // One memo for the call (#352 011.a1): the entries' inode lookups share
    // the inode table's upper pages, read once, so an entry costs its leaf.
    let memo = Memo::new(reader.as_ref());
    let (mut after, mut skipped, mut items, mut spent, mut more) =
        (None, 0u64, Vec::new(), 0, false);
    'pages: loop {
        let page = list_after(
            &memo,
            DirectoryRoot(dir.value.content_root),
            after.as_ref(),
            64,
            REPLY_BUDGET,
            &mut DirectoryReadWork::default(),
        )
        .map_err(args::content)?;
        let mut taken = Vec::new();
        for (name, serial) in &page.entries {
            if skipped < pos {
                skipped += 1;
                continue;
            }
            if items.len() + taken.len() == limit
                || spent + name.as_str().len() + path.len() + 160 > REPLY_BUDGET
            {
                more = true;
                break;
            }
            spent += name.as_str().len() + path.len() + 160;
            taken.push((name, *serial));
        }
        // The page's entries are looked up together, one descent per level.
        let serials: Vec<u64> = taken.iter().map(|(_, serial)| *serial).collect();
        let values = snap.tree.values(&memo, &serials).map_err(args::content)?;
        for ((name, serial), value) in taken.into_iter().zip(values) {
            let value = value.ok_or_else(|| args::failed("missing bound inode"))?;
            items.push(SdkValue::map([
                ("name", SdkValue::text(name.as_str())),
                (
                    "path",
                    SdkValue::text(layerfs_content::compare::tree::join(&path, name)),
                ),
                ("type", SdkValue::text(kind_name(value.kind))),
                ("inode", SdkValue::Int(serial as i64)),
            ]));
        }
        if more {
            break 'pages;
        }
        match page.continuation {
            Some(next) => after = Some(next),
            None => break,
        }
    }
    let next = args::next_page(pos, items.len(), more);
    let mut fields = header(&snap, &path);
    fields.extend([
        ("items", SdkValue::List(items)),
        ("hasMore", SdkValue::Bool(!matches!(next, SdkValue::Null))),
        ("nextPagePos", next),
    ]);
    answer(fields)
}

pub fn grep(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let pattern = text(args, "pattern")?;
    if pattern.is_empty() {
        return Err(invalid("pattern is empty"));
    }
    let path = optional_path(args)?;
    let (limit, pos) = args::paging(args)?;
    let (mut items, mut found, mut spent, mut more, mut skipped) =
        (Vec::new(), 0u64, 0, false, 0i64);
    window::walk(&reader, &snap, &path, |file, entry| {
        if entry.value.kind != InodeKind::RegularFile {
            return Ok(true);
        }
        let scan = window::lines(&reader, &entry, 1024, Some(pattern), |n, line| {
            if !line.matched {
                return Ok(true);
            }
            if found < pos {
                found += 1;
                return Ok(true);
            }
            let cost = file.len() + line.text.len() + 160;
            if items.len() == limit || spent + cost > REPLY_BUDGET {
                more = true;
                return Ok(false);
            }
            spent += cost;
            items.push(SdkValue::map([
                ("path", SdkValue::text(file)),
                ("line", SdkValue::Int(n as i64)),
                ("text", SdkValue::text(line.text)),
                ("lineTruncated", SdkValue::Bool(line.truncated)),
            ]));
            Ok(true)
        });
        match scan {
            Err(e) if e.code == "Binary" => skipped += 1,
            other => other?,
        }
        Ok(!more)
    })?;
    let next = args::next_page(pos, items.len(), more);
    let mut fields = header(&snap, &path);
    fields.extend([
        ("items", SdkValue::List(items)),
        ("skipped", SdkValue::Int(skipped)),
        ("hasMore", SdkValue::Bool(!matches!(next, SdkValue::Null))),
        ("nextPagePos", next),
    ]);
    answer(fields)
}

pub fn glob(store: &Arc<Store>, args: &SdkValue) -> Answer {
    let (_, reader, snap) = snapshot::open(store, args)?;
    let rule = Rule::glob(text(args, "pattern")?);
    let path = optional_path(args)?;
    let (limit, pos) = args::paging(args)?;
    let (mut items, mut found, mut spent, mut more) = (Vec::new(), 0u64, 0, false);
    window::walk(&reader, &snap, &path, |file, _| {
        if !rule.matches_path(file) {
            return Ok(true);
        }
        if found < pos {
            found += 1;
            return Ok(true);
        }
        if items.len() == limit || spent + file.len() + 16 > REPLY_BUDGET {
            more = true;
            return Ok(false);
        }
        spent += file.len() + 16;
        items.push(SdkValue::text(file));
        Ok(true)
    })?;
    let next = args::next_page(pos, items.len(), more);
    let mut fields = header(&snap, &path);
    fields.extend([
        ("items", SdkValue::List(items)),
        ("hasMore", SdkValue::Bool(!matches!(next, SdkValue::Null))),
        ("nextPagePos", next),
    ]);
    answer(fields)
}
