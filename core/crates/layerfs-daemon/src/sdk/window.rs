//! Bounded text scanning and depth-first namespace traversal at immutable roots.
use super::{args, snapshot};
use crate::store::StorePorts;
use layerfs_bridge::control::SdkRefusal;
use layerfs_content::{
    compare::EntryFacts,
    filesystem::{
        directory::read::{list_after, DirectoryReadWork},
        path::PathName,
        sorted::DirectoryRoot,
    },
    object::inode_leaf::InodeKind,
};
use layerfs_telemetry::timer::Timing;

pub(crate) const BYTES: usize = 48 * 1024;
pub(crate) const LINES: usize = 2000;

/// One logical LF-delimited line. A final LF belongs to this line, not a new one.
pub(crate) struct Line {
    pub(crate) text: String,
    pub(crate) bytes: u64,
    pub(crate) truncated: bool,
    pub(crate) matched: bool,
}

/// Scans with bounded buffers, including huge lines. A literal match may cross chunks.
pub(crate) fn lines(
    reader: &StorePorts,
    entry: &EntryFacts,
    prefix: usize,
    pattern: Option<&str>,
    mut visit: impl FnMut(u64, Line) -> Result<bool, SdkRefusal>,
) -> Result<(), SdkRefusal> {
    if entry.value.kind != InodeKind::RegularFile {
        return Err(args::refuse(
            if entry.value.kind == InodeKind::Directory {
                "IsDirectory"
            } else {
                "NotFile"
            },
            "expected a regular file",
            layerfs_bridge::control::SdkValue::Null,
        ));
    }
    let size = snapshot::size(reader, entry)?;
    let pattern = pattern.unwrap_or("").as_bytes();
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
    let (mut offset, mut number, mut length) = (0, 1, 0usize);
    let (mut shown, mut utf8) = (Vec::new(), Vec::new());
    let (mut matched, mut state) = (pattern.is_empty(), 0);
    while offset < size {
        let end = size.min(offset + 16384);
        let mut bytes = Vec::new();
        let (read, _) = Timing::disabled("sdk.lines", |timing| {
            layerfs_content::file::read_range(
                reader,
                entry.value.content_root,
                offset..end,
                &mut bytes,
                timing.child("content.read"),
            )
        });
        read.map_err(args::content)?;
        utf8.extend_from_slice(&bytes);
        if utf8.contains(&0) {
            return Err(binary());
        }
        let valid = match std::str::from_utf8(&utf8) {
            Ok(_) => utf8.len(),
            Err(error) if error.error_len().is_none() && end < size => error.valid_up_to(),
            Err(_) => return Err(binary()),
        };
        utf8.drain(..valid);
        for byte in bytes {
            length += 1;
            if shown.len() < prefix {
                shown.push(byte);
            }
            if !matched && !pattern.is_empty() {
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
                if !visit(number, line(&mut shown, length, matched))? {
                    return Ok(());
                }
                number += 1;
                length = 0;
                state = 0;
                matched = pattern.is_empty();
            }
        }
        offset = end;
    }
    if length > 0 {
        visit(number, line(&mut shown, length, matched))?;
    }
    Ok(())
}

fn binary() -> SdkRefusal {
    args::refuse(
        "Binary",
        "text contains NUL or invalid UTF-8",
        layerfs_bridge::control::SdkValue::Null,
    )
}

fn line(bytes: &mut Vec<u8>, length: usize, matched: bool) -> Line {
    let mut shown = std::mem::take(bytes);
    let end = match std::str::from_utf8(&shown) {
        Ok(_) => shown.len(),
        Err(e) => e.valid_up_to(),
    };
    shown.truncate(end);
    Line {
        bytes: length as u64,
        text: String::from_utf8(shown).expect("validated prefix"),
        truncated: end < length,
        matched,
    }
}

/// One directory frame holds one continuation, rather than all child names.
struct Frame {
    path: String,
    entry: EntryFacts,
    after: Option<PathName>,
}

pub(crate) struct Walker<'a> {
    reader: &'a StorePorts,
    snap: &'a snapshot::Snap,
    stack: Vec<Frame>,
    top: Option<(String, EntryFacts)>,
}
impl<'a> Walker<'a> {
    pub(crate) fn new(
        reader: &'a StorePorts,
        snap: &'a snapshot::Snap,
        path: &str,
    ) -> Result<Self, SdkRefusal> {
        let entry = snapshot::existing(reader, snap, path)?;
        let (stack, top) = if entry.value.kind == InodeKind::Directory {
            (
                vec![Frame {
                    path: path.to_owned(),
                    entry,
                    after: None,
                }],
                None,
            )
        } else {
            (Vec::new(), Some((path.to_owned(), entry)))
        };
        Ok(Self {
            reader,
            snap,
            stack,
            top,
        })
    }
    pub(crate) fn next(&mut self) -> Result<Option<(String, EntryFacts)>, SdkRefusal> {
        if let Some(top) = self.top.take() {
            return Ok(Some(top));
        }
        while let Some(frame) = self.stack.last_mut() {
            let page = list_after(
                self.reader,
                DirectoryRoot(frame.entry.value.content_root),
                frame.after.as_ref(),
                1,
                8192,
                &mut DirectoryReadWork::default(),
            )
            .map_err(args::content)?;
            let Some((name, serial)) = page.entries.into_iter().next() else {
                self.stack.pop();
                continue;
            };
            let path = layerfs_content::compare::tree::join(&frame.path, &name);
            frame.after = Some(name);
            let value = self
                .snap
                .tree
                .value(self.reader, serial)
                .map_err(args::content)?
                .ok_or_else(|| args::failed("missing bound inode"))?;
            let entry = EntryFacts { serial, value };
            if value.kind == InodeKind::Directory {
                self.stack.push(Frame {
                    path: path.clone(),
                    entry,
                    after: None,
                });
            }
            return Ok(Some((path, entry)));
        }
        Ok(None)
    }
}

pub(crate) fn walk(
    reader: &StorePorts,
    snap: &snapshot::Snap,
    path: &str,
    mut visit: impl FnMut(&str, EntryFacts) -> Result<bool, SdkRefusal>,
) -> Result<(), SdkRefusal> {
    let mut walker = Walker::new(reader, snap, path)?;
    while let Some((path, entry)) = walker.next()? {
        if !visit(&path, entry)? {
            break;
        }
    }
    Ok(())
}
