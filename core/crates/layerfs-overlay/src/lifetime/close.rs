//! Logical terminal close; physical disposal belongs to the Workspace file owner.
use crate::{Capture, Overlay, OverlayError, OverlayResult, Route, StatementKind};

/// Whether a Workspace is serving, retained by a consumer, ready for checked
/// connection close, or physically absent from its owner. Only the daemon's
/// file owner can establish Gone after connection close and file deletion.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum CleanupState {
    Live,
    Held,
    Queued,
    Gone,
}
const HELD: &str = "SELECT EXISTS(SELECT 1 FROM lease WHERE ns=?1)";
const OBSERVE: &str = "SELECT w.incarnation,w.lifecycle,
    (SELECT seq FROM sqlite_sequence WHERE name='workspace')
    FROM (SELECT ?1 AS ns) AS selected LEFT JOIN workspace w ON w.ns=selected.ns";
impl Overlay {
    fn terminal_state(
        &self,
        route: Route,
        state: &crate::WorkspaceState,
    ) -> OverlayResult<CleanupState> {
        if !state.closed {
            return Ok(CleanupState::Live);
        }
        let open = self.open.borrow();
        let native = open
            .mounts
            .rows
            .get(&route.ns)
            .is_some_and(|(_, revoked)| !revoked);
        let files = open
            .file_requests
            .rows
            .range((route.ns, 0, i64::MIN)..=(route.ns, 0, i64::MAX))
            .next()
            .is_some();
        let readers = open.count_at(Some(route.ns), 3) != 0;
        let lookups = open.count_at(Some(route.ns), 4) != 0;
        drop(open);
        let held = native
            || files
            || readers
            || lookups
            || state.captured.is_some()
            || state.base_readers != 0
            || self.tickets.pending(route.ns)
            || self.query(StatementKind::Workspace, HELD, &[&route.ns], 8, |r| {
                r.get::<_, bool>(0)
            })?[0];
        Ok(if held {
            CleanupState::Held
        } else {
            CleanupState::Queued
        })
    }
    /// Read-only exact route observation; it runs no cleanup and proves no unlink.
    pub fn cleanup_state(&self, route: Route) -> OverlayResult<CleanupState> {
        let state = self.state(route)?;
        self.terminal_state(route, &state)
    }
    pub fn observe_cleanup(
        &self,
        namespace: i64,
        incarnation: [u8; 32],
    ) -> OverlayResult<CleanupState> {
        self.available()?;
        if namespace <= 0 || incarnation == [0; 32] {
            return Err(OverlayError::Stale);
        }
        let row = self
            .query(StatementKind::Workspace, OBSERVE, &[&namespace], 8, |r| {
                Ok((
                    r.get::<_, Option<Vec<u8>>>(0)?,
                    r.get::<_, Option<i64>>(1)?,
                    r.get::<_, Option<i64>>(2)?,
                ))
            })?
            .pop()
            .ok_or(OverlayError::Stale)?;
        if row.2.is_none_or(|last| namespace > last) {
            return Err(OverlayError::Stale);
        }
        let Some(stored) = row.0 else {
            return Ok(CleanupState::Gone);
        };
        if stored.as_slice() != incarnation {
            return Err(OverlayError::Stale);
        }
        let route = Route {
            engine: self.identity,
            ns: namespace,
            incarnation,
        };
        self.cleanup_state(route)
    }
    pub fn explain_cleanup_observation(&self) -> OverlayResult<Vec<String>> {
        self.query(
            StatementKind::Explain,
            &format!("EXPLAIN QUERY PLAN {OBSERVE}"),
            &[&1_i64],
            8,
            |r| r.get(3),
        )
    }
    /// The actual remaining SQL custody probe. Open state is checked in memory.
    pub fn explain_close_held(&self) -> OverlayResult<Vec<String>> {
        self.query(
            StatementKind::Explain,
            &format!("EXPLAIN QUERY PLAN {HELD}"),
            &[&1_i64],
            8,
            |r| r.get(3),
        )
    }
    /// Closes mutation/acquisition admission. Existing exact consumers keep their
    /// original custody until fenced; no namespace row or payload is swept here.
    pub fn close(&self, route: Route) -> OverlayResult<()> {
        self.atomic_cleanup(|| {
            self.live(route)?;
            self.execute(
                StatementKind::Workspace,
                "UPDATE workspace SET lifecycle=1 WHERE ns=?1",
                &[&route.ns],
                8,
            )?;
            Ok(())
        })
    }
    /// Exact capture relinquishment after its consumer and publication fences.
    pub fn release_closed_capture(&self, capture: Capture) -> OverlayResult<()> {
        self.atomic_cleanup(|| {
            let state = self.state(capture.route())?;
            self.checked_capture(capture)?;
            if !state.closed {
                return Err(OverlayError::Stale);
            }
            self.execute(
                StatementKind::Capture,
                "UPDATE workspace SET captured=NULL,captured_revision=NULL WHERE ns=?1",
                &[&capture.route().ns],
                8,
            )?;
            self.wake_orphan_sources(capture.route.ns, capture.generation.0)
        })
    }
}
