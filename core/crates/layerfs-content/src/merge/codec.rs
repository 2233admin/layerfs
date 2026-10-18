//! Byte forms of the merge's spilled entries: decisions and their paths.

use super::decide::Pick;
use crate::compare::tree::EntryFacts;
use crate::error::{ContentError, ContentResult};
use crate::object::inode_leaf::{decode_inode_value, encode_inode_value, INODE_VALUE_BYTES};

const ENTRY_BYTES: usize = 8 + INODE_VALUE_BYTES;

fn malformed() -> ContentError {
    ContentError::InvalidRecord("merge spill entry")
}

/// Reads bytes from the front of a slice.
pub(super) struct Cursor<'b>(pub(super) &'b [u8]);

impl<'b> Cursor<'b> {
    pub(super) fn take(&mut self, count: usize) -> ContentResult<&'b [u8]> {
        if self.0.len() < count {
            return Err(malformed());
        }
        let (head, rest) = self.0.split_at(count);
        self.0 = rest;
        Ok(head)
    }

    pub(super) fn byte(&mut self) -> ContentResult<u8> {
        Ok(self.take(1)?[0])
    }

    pub(super) fn number(&mut self) -> ContentResult<u64> {
        Ok(u64::from_be_bytes(
            self.take(8)?.try_into().map_err(|_| malformed())?,
        ))
    }

    /// A path written by [`put_text`].
    pub(super) fn text(&mut self) -> ContentResult<String> {
        let length = u16::from_be_bytes(self.take(2)?.try_into().map_err(|_| malformed())?);
        String::from_utf8(self.take(length as usize)?.to_vec()).map_err(|_| malformed())
    }

    pub(super) fn entry(&mut self) -> ContentResult<EntryFacts> {
        let serial = self.number()?;
        let value = decode_inode_value(self.take(INODE_VALUE_BYTES)?)?;
        Ok(EntryFacts { serial, value })
    }

    pub(super) fn pick(&mut self) -> ContentResult<Pick> {
        Ok(match self.byte()? {
            0 => Pick::Keep,
            1 => Pick::Absent,
            2 => Pick::Take(self.entry()?),
            3 => {
                let like = self.entry()?;
                let text = self.number()?;
                Pick::Write { like, text }
            }
            _ => return Err(malformed()),
        })
    }

    pub(super) fn end(&self) -> ContentResult<()> {
        if self.0.is_empty() {
            Ok(())
        } else {
            Err(malformed())
        }
    }
}

pub(super) fn put_text(out: &mut Vec<u8>, text: &str) -> ContentResult<()> {
    let length = u16::try_from(text.len()).map_err(|_| malformed())?;
    out.extend_from_slice(&length.to_be_bytes());
    out.extend_from_slice(text.as_bytes());
    Ok(())
}

pub(super) fn put_entry(out: &mut Vec<u8>, entry: &EntryFacts) {
    out.reserve(ENTRY_BYTES);
    out.extend_from_slice(&entry.serial.to_be_bytes());
    out.extend_from_slice(&encode_inode_value(entry.value));
}

pub(super) fn put_pick(out: &mut Vec<u8>, pick: &Pick) {
    match pick {
        Pick::Keep => out.push(0),
        Pick::Absent => out.push(1),
        Pick::Take(entry) => {
            out.push(2);
            put_entry(out, entry);
        }
        Pick::Write { like, text } => {
            out.push(3);
            put_entry(out, like);
            out.extend_from_slice(&text.to_be_bytes());
        }
    }
}

/// One decided path: its pick and the entry the side the result is built on
/// holds there, so later passes need not resolve the path again.
pub(super) struct Decided {
    pub(super) path: String,
    pub(super) pick: Pick,
    pub(super) here: Option<EntryFacts>,
}

/// The entry of a decided run.
pub(super) fn decided(
    path: &str,
    pick: &Pick,
    here: Option<&EntryFacts>,
) -> ContentResult<Vec<u8>> {
    let mut out = Vec::with_capacity(path.len() + 4 + 2 * ENTRY_BYTES + 8);
    put_text(&mut out, path)?;
    put_pick(&mut out, pick);
    match here {
        None => out.push(0),
        Some(entry) => {
            out.push(1);
            put_entry(&mut out, entry);
        }
    }
    Ok(out)
}

/// Decodes [`decided`].
pub(super) fn read_decided(bytes: &[u8]) -> ContentResult<Decided> {
    let mut cursor = Cursor(bytes);
    let path = cursor.text()?;
    let pick = cursor.pick()?;
    let here = match cursor.byte()? {
        0 => None,
        1 => Some(cursor.entry()?),
        _ => return Err(malformed()),
    };
    cursor.end()?;
    Ok(Decided { path, pick, here })
}
