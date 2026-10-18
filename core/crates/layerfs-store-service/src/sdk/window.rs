//! Bounded text scanning at immutable roots: a file's text arrives in whole
//! blocks, checked as before, and a buffer-wide line scanner splits it.
use super::args;
use crate::store::StorePorts;
use layerfs_bridge::control::SdkRefusal;
use layerfs_content::{compare::EntryFacts, object::inode_leaf::InodeKind};

pub use super::walk::{walk, Walker};

pub const BYTES: usize = 48 * 1024;
pub const LINES: usize = 2000;

/// The window a NUL or invalid UTF-8 is found in: the scan stops at the same
/// window boundary as the window-at-a-time scan it replaced (#352 F-035).
const WINDOW: u64 = 16 * 1024;
/// Bytes of a chunked file read at once: whole windows.
const BLOCK: u64 = 16 * WINDOW;

/// One logical LF-delimited line. A final LF belongs to this line, not a new one.
#[derive(Clone)]
pub struct Line {
    pub text: String,
    pub bytes: u64,
    pub truncated: bool,
    pub matched: bool,
}

/// The line being scanned: its number, shown prefix and length so far.
pub(super) struct Open {
    pub number: u64,
    head: Vec<u8>,
    pub length: usize,
}
impl Open {
    pub fn new() -> Self {
        Self {
            number: 1,
            head: Vec::new(),
            length: 0,
        }
    }
    /// Appends a part of the line, keeping its first `prefix` bytes.
    pub fn take(&mut self, part: &[u8], prefix: usize) {
        let room = prefix.saturating_sub(self.head.len()).min(part.len());
        self.head.extend_from_slice(&part[..room]);
        self.length += part.len();
    }
    /// Forgets the line's parts: it ended unreported.
    pub fn clear(&mut self) {
        self.head.clear();
        self.length = 0;
    }
    /// The finished line; the next one starts empty.
    pub fn finish(&mut self, matched: bool) -> Line {
        let line = line(&mut self.head, self.length, matched);
        self.length = 0;
        line
    }
}

/// LF bytes in `bytes`, counted over the whole slice at once.
pub(super) fn newlines(bytes: &[u8]) -> u64 {
    bytes.iter().filter(|&&byte| byte == b'\n').count() as u64
}

/// The position just after the last LF in `bytes`, if any.
pub(super) fn after_last_newline(bytes: &[u8]) -> Option<usize> {
    bytes.iter().rposition(|&byte| byte == b'\n').map(|i| i + 1)
}

/// The position after the `count`th LF in `bytes`, or `None` with the LFs it
/// holds when it has fewer.
fn skip(bytes: &[u8], count: u64) -> Result<usize, u64> {
    let (mut seen, mut done) = (0, 0);
    for part in bytes.chunks(4096) {
        let here = newlines(part);
        if seen + here < count {
            seen += here;
            done += part.len();
            continue;
        }
        for (i, &byte) in part.iter().enumerate() {
            if byte == b'\n' {
                seen += 1;
                if seen == count {
                    return Ok(done + i + 1);
                }
            }
        }
    }
    Err(seen)
}

/// Calls `visit` with the file's text, in order, as whole valid UTF-8 parts.
/// A NUL or invalid UTF-8 ends the text at the start of the window it is
/// found in, as the window-at-a-time scan did, and the scan then fails
/// `Binary` unless `visit` stopped it first. A part may end inside a line.
pub(super) fn texts(
    reader: &StorePorts,
    entry: &EntryFacts,
    mut visit: impl FnMut(&str) -> Result<bool, SdkRefusal>,
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
    // The root is read and classified once; each block reads only its part.
    let view = crate::telemetry::timed("sdk.lines", |timing| {
        layerfs_content::file::FileView::open(
            reader,
            entry.value.content_root,
            timing.child("content.read"),
        )
    })
    .map_err(args::content)?;
    let size = view.logical_len();
    // A whole-file payload is already in memory: one block, nothing copied.
    if let Some(payload) = view.whole_file_bytes().map_err(args::content)? {
        let (text, bad) = checked(payload, 0, 0, size);
        return if !visit(text)? || !bad {
            Ok(())
        } else {
            Err(binary())
        };
    }
    let (mut buffer, mut offset) = (Vec::new(), 0);
    while offset < size {
        let end = size.min(offset + BLOCK);
        let carried = buffer.len();
        let read = crate::telemetry::timed("sdk.lines", |timing| {
            timing
                .child("content.read")
                .run(|scope| view.read_range(reader, offset..end, &mut buffer, scope))
        });
        read.map_err(args::content)?;
        let (text, bad) = checked(&buffer, carried, offset, size);
        let valid = text.len();
        if !visit(text)? {
            return Ok(());
        }
        if bad {
            return Err(binary());
        }
        buffer.drain(..valid);
        offset = end;
    }
    Ok(())
}

/// The valid text of `buffer` (`carried` bytes left over from before `base`,
/// then the block at `base`) and whether a NUL or invalid UTF-8 ends it. The
/// rest of a good block is an incomplete character, carried to the next.
///
/// The window-at-a-time scan failed in the first window holding a NUL, or
/// whose text so far was decisively invalid UTF-8, or, for a character left
/// incomplete, the file's last window. The text ends where that window starts.
fn checked(buffer: &[u8], carried: usize, base: u64, size: u64) -> (&str, bool) {
    // A buffer position's window; carried bytes count with the block's first.
    let window = |at: usize| (base + at.saturating_sub(carried) as u64) / WINDOW;
    let start = |w: u64| (w * WINDOW - base) as usize + carried;
    // `contains` searches a whole slice at once; most text has no NUL.
    let block = &buffer[carried..];
    let mut bad = block
        .contains(&0)
        .then(|| block.iter().position(|&byte| byte == 0))
        .flatten()
        .map(|at| window(carried + at));
    let (text, valid) = match std::str::from_utf8(buffer) {
        Ok(text) => (Some(text), buffer.len()),
        Err(error) => {
            let at = error.valid_up_to();
            let found = match error.error_len() {
                None if base + ((buffer.len() - carried) as u64) < size => None,
                None => Some((size - 1) / WINDOW),
                // Decided in the window holding the sequence's start, or else
                // by its next byte, the first of the next window.
                Some(_) => {
                    let w = window(at);
                    let end = start(w + 1).min(buffer.len());
                    match std::str::from_utf8(&buffer[at..end]) {
                        Err(error) if error.error_len().is_some() => Some(w),
                        _ => Some(w + 1),
                    }
                }
            };
            if let Some(found) = found {
                bad = Some(bad.map_or(found, |nul| nul.min(found)));
            }
            (None, at)
        }
    };
    if let (Some(text), None) = (text, bad) {
        return (text, false);
    }
    let valid = bad.map_or(valid, |w| valid.min(start(w)));
    // The text stops at a character boundary; what lies past it up to the
    // failing window holds no LF, so no reported line is lost.
    let text = match std::str::from_utf8(&buffer[..valid]) {
        Ok(text) => text,
        Err(error) => std::str::from_utf8(&buffer[..error.valid_up_to()]).unwrap_or_default(),
    };
    (text, bad.is_some())
}

/// Scans with bounded buffers, including huge lines: every line from line
/// `from` on, in order, until `visit` stops. Earlier lines are only counted.
pub fn lines(
    reader: &StorePorts,
    entry: &EntryFacts,
    prefix: usize,
    from: u64,
    mut visit: impl FnMut(u64, Line) -> Result<bool, SdkRefusal>,
) -> Result<(), SdkRefusal> {
    let (mut open, mut stopped) = (Open::new(), false);
    texts(reader, entry, |text| {
        let bytes = text.as_bytes();
        let mut at = 0;
        while at < bytes.len() {
            if open.number < from {
                match skip(&bytes[at..], from - open.number) {
                    Ok(next) => {
                        open.number = from;
                        at += next;
                    }
                    Err(seen) => {
                        open.number += seen;
                        at = bytes.len();
                    }
                }
                continue;
            }
            match text[at..].find('\n') {
                Some(i) => {
                    open.take(&bytes[at..at + i + 1], prefix);
                    if !visit(open.number, open.finish(true))? {
                        stopped = true;
                        return Ok(false);
                    }
                    open.number += 1;
                    at += i + 1;
                }
                None => {
                    open.take(&bytes[at..], prefix);
                    at = bytes.len();
                }
            }
        }
        Ok(true)
    })?;
    if !stopped && open.length > 0 {
        visit(open.number, open.finish(true))?;
    }
    Ok(())
}

pub(super) fn binary() -> SdkRefusal {
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
