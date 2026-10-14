//! Open-file reference counts.
use crate::{LeaseKind, OverlayError, OverlayResult};

#[derive(Clone, Copy, Default)]
pub(crate) struct FileReferences {
    pub opens: u64,
    pub lookups: u64,
    pub readers: u64,
}
impl FileReferences {
    pub fn total(self) -> u64 {
        self.opens + self.lookups + self.readers
    }
    pub fn change(&mut self, kind: LeaseKind, add: bool) -> OverlayResult<()> {
        let value = match kind {
            LeaseKind::Open | LeaseKind::FileHandle => &mut self.opens,
            LeaseKind::Lookup | LeaseKind::LookupOwner => &mut self.lookups,
            LeaseKind::FileReader => &mut self.readers,
            _ => return Ok(()),
        };
        *value = if add {
            value.checked_add(1)
        } else {
            value.checked_sub(1)
        }
        .ok_or(OverlayError::Stale)?;
        Ok(())
    }
}
