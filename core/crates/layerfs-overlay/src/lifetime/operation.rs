//! Engine-minted operation ownership and independent bounded operation_record custody.
use crate::{
    db::{integer, unsigned},
    OperationOwner, Overlay, OverlayError, OverlayResult, Route, StatementKind,
};
impl Overlay {
    /// One acquisition attempt. Query retained custody by request after a lost reply.
    pub fn acquire_operation(&self, route: Route, request: u64) -> OverlayResult<OperationOwner> {
        let request = integer(request)?;
        if request == 0 {
            return Err(OverlayError::Invalid("zero operation request"));
        }
        self.atomic(|| {
            self.live(route)?;
            let owner = self.mint_owner()?;
            self.execute(
                StatementKind::Lease,
                "INSERT INTO commit_run VALUES(?1,?2)",
                &[&request, &integer(owner)?],
                24,
            )?;
            self.execute(
                StatementKind::Lease,
                "INSERT INTO commit_pin VALUES(8,?1,0)",
                &[&integer(owner)?],
                16,
            )?;
            Ok(OperationOwner { route, owner })
        })
    }
    pub fn retained_operation(
        &self,
        route: Route,
        request: u64,
    ) -> OverlayResult<Option<OperationOwner>> {
        self.state(route)?;
        self.query(
            StatementKind::Lease,
            "SELECT holder FROM commit_run WHERE request=?1",
            &[&integer(request)?],
            16,
            |r| {
                Ok(OperationOwner {
                    route,
                    owner: unsigned(r, 0)?,
                })
            },
        )
        .map(|mut rows| rows.pop())
    }
    pub(crate) fn check_operation(&self, owner: OperationOwner) -> OverlayResult<()> {
        self.state(owner.route)?;
        self.operation_custody(owner)
    }
    /// The owner half of `check_operation`.
    fn operation_custody(&self, owner: OperationOwner) -> OverlayResult<()> {
        if self
            .query(
                StatementKind::Lease,
                crate::sql::OPERATION_CUSTODY,
                &[&integer(owner.owner)?],
                16,
                |_| Ok(()),
            )?
            .is_empty()
        {
            return Err(OverlayError::Stale);
        }
        Ok(())
    }
    /// The whole fence of one indexed operation_record job in one statement.
    /// Its refusals and their order are those of `live`/`check_operation`: a
    /// stale route first, then a closed Workspace when the job writes, then a
    /// released owner. Existing custody stays readable after logical close.
    pub(crate) fn fence_operation(&self, owner: OperationOwner, write: bool) -> OverlayResult<()> {
        self.check_route(owner.route)?;
        let (closed, held) = self
            .query(
                StatementKind::Workspace,
                crate::sql::OPERATION_FENCE,
                &[&owner.route.incarnation.as_slice(), &integer(owner.owner)?],
                48,
                |r| Ok((r.get::<_, i64>(0)? != 0, r.get::<_, i64>(1)? != 0)),
            )?
            .pop()
            .ok_or(OverlayError::Stale)?;
        if write && closed {
            return Err(OverlayError::Closed);
        }
        if !held {
            return Err(OverlayError::Stale);
        }
        Ok(())
    }
    /// Exact last-consumer fence. Cleanup owns operation_record independently afterwards.
    pub fn release_operation(&self, owner: OperationOwner) -> OverlayResult<()> {
        self.atomic_cleanup(|| {
            self.check_operation(owner)?;
            self.execute(
                StatementKind::Lease,
                "DELETE FROM commit_run WHERE holder=?1",
                &[&integer(owner.owner)?],
                16,
            )?;
            self.execute(
                StatementKind::Lease,
                "DELETE FROM commit_pin WHERE kind=8 AND holder=?1 AND resource=0",
                &[&integer(owner.owner)?],
                16,
            )?;
            self.enqueue(
                crate::maintenance::OPERATION_RECORD,
                integer(owner.owner)?,
                2,
            )?;
            Ok(())
        })
    }
}
