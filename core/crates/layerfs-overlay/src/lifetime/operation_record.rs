//! Exact independently keyed owner references.
use crate::{
    db::integer, Lease, LeaseKind, Overlay, OverlayError, OverlayResult, Route, StatementKind,
};

impl Overlay {
    /// Acquires one exact independently keyed owner. Duplicate acquisition fails.
    pub fn acquire(&self, route: Route, lease: Lease) -> OverlayResult<()> {
        if matches!(
            lease.kind,
            LeaseKind::FileReader
                | LeaseKind::CapturedReader
                | LeaseKind::FileHandle
                | LeaseKind::Processing
                | LeaseKind::LookupOwner
        ) {
            return Err(OverlayError::Invalid("minted owner kind"));
        }
        let owner = integer(lease.owner)?;
        let resource = integer(lease.resource)?;
        if owner == 0 {
            return Err(OverlayError::Invalid("zero owner"));
        }
        self.atomic(|| {
            self.live(route)?;
            self.execute(
                StatementKind::Lease,
                "INSERT INTO commit_pin VALUES(?1,?2,?3)",
                &[&(lease.kind as i64), &owner, &resource],
                32,
            )?;
            if lease.resource != 0 {
                self.file_ref(route.ns, resource, lease.kind, true)?;
            }
            Ok(())
        })
    }
    /// Last-owner release is exact, with no whole-namespace owner sweep.
    /// Automatic eligibility/reclamation scheduling is the later S6/daemon lane.
    pub fn release(&self, route: Route, lease: Lease) -> OverlayResult<()> {
        if matches!(
            lease.kind,
            LeaseKind::FileReader
                | LeaseKind::CapturedReader
                | LeaseKind::FileHandle
                | LeaseKind::Processing
                | LeaseKind::LookupOwner
        ) {
            return Err(OverlayError::Invalid("minted owner kind"));
        }
        self.atomic_cleanup(|| {
            self.state(route)?;
            let changed = self.execute(
                StatementKind::Lease,
                "DELETE FROM commit_pin WHERE kind=?1 AND holder=?2 AND resource=?3",
                &[
                    &(lease.kind as i64),
                    &integer(lease.owner)?,
                    &integer(lease.resource)?,
                ],
                32,
            )?;
            if changed != 1 {
                return Err(OverlayError::Missing);
            }
            if lease.resource != 0 {
                self.file_ref(route.ns, integer(lease.resource)?, lease.kind, false)?;
            }
            if lease.kind == LeaseKind::Reader {
                self.wake_generation(lease.resource)?;
            }
            Ok(())
        })
    }
}
