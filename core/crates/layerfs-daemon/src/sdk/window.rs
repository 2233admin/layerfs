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
    object::inode_leaf::{InodeKind, InodeValue},
};

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
    // The root is read and classified once; each window reads only its part.
    let view = crate::telemetry::timed("sdk.lines", |timing| {
        layerfs_content::file::FileView::open(
            reader,
            entry.value.content_root,
            timing.child("content.read"),
        )
    })
    .map_err(args::content)?;
    let size = view.logical_len();
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
        let read = crate::telemetry::timed("sdk.lines", |timing| {
            timing
                .child("content.read")
                .run(|scope| view.read_range(reader, offset..end, &mut bytes, scope))
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

/// Names and inode demands acquired together, bounded independently of the tree.
const DIRECTORY_WINDOW: usize = 64;
const DIRECTORY_BYTES: usize = 8192;
type Child = (PathName, u64, Option<InodeValue>);

/// One directory frame retains one bounded window and its next-name boundary.
struct Frame {
    path: String,
    entry: EntryFacts,
    after: Option<PathName>,
    pending: std::vec::IntoIter<Child>,
    exhausted: bool,
}
impl Frame {
    fn new(path: String, entry: EntryFacts) -> Self {
        Self {
            path,
            entry,
            after: None,
            pending: Vec::new().into_iter(),
            exhausted: false,
        }
    }
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
            (vec![Frame::new(path.to_owned(), entry)], None)
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
            if frame.pending.len() == 0 && !frame.exhausted {
                let page = list_after(
                    self.reader,
                    DirectoryRoot(frame.entry.value.content_root),
                    frame.after.as_ref(),
                    DIRECTORY_WINDOW,
                    DIRECTORY_BYTES,
                    &mut DirectoryReadWork::default(),
                )
                .map_err(args::content)?;
                frame.exhausted = page.continuation.is_none();
                frame.after = page.continuation;
                let serials = page
                    .entries
                    .iter()
                    .map(|(_, serial)| *serial)
                    .collect::<Vec<_>>();
                let values = self
                    .snap
                    .tree
                    .values(self.reader, &serials)
                    .map_err(args::content)?;
                frame.pending = page
                    .entries
                    .into_iter()
                    .zip(values)
                    .map(|((name, serial), value)| (name, serial, value))
                    .collect::<Vec<_>>()
                    .into_iter();
            }
            let Some((name, serial, value)) = frame.pending.next() else {
                self.stack.pop();
                continue;
            };
            let path = layerfs_content::compare::tree::join(&frame.path, &name);
            let value = value.ok_or_else(|| args::failed("missing bound inode"))?;
            let entry = EntryFacts { serial, value };
            if value.kind == InodeKind::Directory {
                self.stack.push(Frame::new(path.clone(), entry));
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
