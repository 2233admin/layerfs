//! Bounded exact custody observations; observing never replays or releases work.
use crate::{db::integer, Capture, Overlay, OverlayResult, Publication, Route};

impl Overlay {
    /// Observes the retained capture after a lost completion, including during
    /// logical close. Later active revisions cannot change this frozen identity.
    /// None means the routed Workspace exists without a capture; Stale means
    /// the routed incarnation is absent. No upstream history outcome is inferred.
    pub fn retained_capture(&self, route: Route) -> OverlayResult<Option<Capture>> {
        let state = self.state(route)?;
        Ok(state.captured.map(|generation| Capture {
            route,
            generation,
            revision: state.captured_revision.expect("paired captured revision"),
            base_root: state.base_root,
        }))
    }
    /// Fixed keyset page of still-owned reply-send-attempt tickets, read from
    /// the engine's memory. A lost completion never removes these records. The caller must perform/fence the
    /// actual reply attempt before releasing a ticket; observation is no such fence.
    pub fn pending_publications(
        &self,
        route: Route,
        after: u64,
    ) -> OverlayResult<Vec<Publication>> {
        self.state(route)?;
        Ok(self.tickets.page(route, integer(after)?, 64))
    }
}
