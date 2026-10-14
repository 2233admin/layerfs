//! Indexed Workspace routing and maintained bounded observation.
use crate::{
    db::unsigned, Generation, Overlay, OverlayError, OverlayResult, Route, StatementKind,
    WorkspaceState,
};

/// The Workspace row in the column order of `state` and of every native fence.
pub(crate) fn decode(r: &rusqlite::Row<'_>) -> rusqlite::Result<WorkspaceState> {
    let root: Vec<u8> = r.get(3)?;
    let base_root = root.try_into().map_err(|_| rusqlite::Error::InvalidQuery)?;
    Ok(WorkspaceState {
        active: Generation(r.get(0)?),
        captured: r.get::<_, Option<i64>>(1)?.map(Generation),
        captured_revision: r.get(8)?,
        installed: r.get(7)?,
        revision: r.get(2)?,
        base_root,
        dirty_inodes: unsigned(r, 4)?,
        dirty_directory_entries: unsigned(r, 5)?,
        closed: r.get::<_, i64>(6)? != 0,
        base_readers: unsigned(r, 9)?,
        consolidating: r.get::<_, Option<i64>>(10)?.map(Generation),
    })
}
impl Overlay {
    /// Binds one complete root as the one Workspace of this database, without
    /// scanning it. A database that already holds a Workspace refuses another.
    /// Authority/root validation is performed by the Workspace/runtime caller.
    pub fn open_workspace(
        &self,
        incarnation: [u8; 32],
        base_root: [u8; 32],
    ) -> OverlayResult<Route> {
        if incarnation == [0; 32] {
            return Err(OverlayError::Invalid("zero incarnation"));
        }
        // Rows of this database carry no Workspace key: it holds one.
        if self.namespace.get() != 0 {
            return Err(OverlayError::Invalid("database already holds a Workspace"));
        }
        let route = self.atomic(|| {
            let ns = self.query(
                StatementKind::Workspace,
                "INSERT INTO workspace(incarnation,base_root,active) VALUES(?1,?2,1) RETURNING ns",
                &[&incarnation.as_slice(), &base_root.as_slice()],
                64,
                |r| r.get(0),
            )?[0];
            Ok(Route {
                engine: self.identity,
                ns,
                incarnation,
            })
        })?;
        self.namespace.set(route.ns);
        Ok(route)
    }
    /// One route-qualified point observation. It does not enumerate/count payload.
    /// The row is read when this connection does not remember it.
    pub fn state(&self, route: Route) -> OverlayResult<WorkspaceState> {
        self.check_route(route)?;
        if let Some((incarnation, state)) = self.workspace_seen.get() {
            if incarnation == route.incarnation && route.ns == self.namespace.get() {
                return Ok(state);
            }
        }
        let state = self
            .query(
                StatementKind::Workspace,
                crate::sql::FENCE_LOOKUP,
                &[&route.ns, &route.incarnation.as_slice()],
                40,
                decode,
            )?
            .pop()
            .ok_or(OverlayError::Stale)?;
        self.remember(route, state);
        Ok(state)
    }
    /// Remembers the row that a statement of this connection just returned.
    pub(crate) fn remember(&self, route: Route, state: WorkspaceState) {
        if route.ns == self.namespace.get() {
            self.workspace_seen.set(Some((route.incarnation, state)));
        }
    }
    pub(crate) fn live(&self, route: Route) -> OverlayResult<WorkspaceState> {
        let state = self.state(route)?;
        if state.closed {
            Err(OverlayError::Closed)
        } else {
            Ok(state)
        }
    }
}
