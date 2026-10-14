//! Daemon roster selection and typed Workspace operations.
use super::{owner::OriginalInput, workspaces::CleanupTarget};
use crate::{JobWork, OwnerClient, OwnerError, ServiceClass};
use layerfs_overlay::{CleanupState, Resources};
use layerfs_workspace::Route;
impl OwnerClient {
    pub fn open(
        &self,
        route: Option<Route>,
        incarnation: [u8; 32],
        base_root: [u8; 32],
    ) -> Result<Route, OwnerError> {
        if let Some(pool) = self.roster() {
            if route.is_some() {
                return Err(OwnerError::Unattempted {
                    cause: Box::new(OwnerError::InvalidAdmission),
                    input: OriginalInput::new((route, incarnation, base_root)),
                });
            }
            let client = pool
                .open(incarnation)
                .map_err(|cause| OwnerError::Unattempted {
                    cause: Box::new(cause),
                    input: OriginalInput::new((route, incarnation, base_root)),
                })?;
            // Template allocation work is already included in roster counters.
            return client.open(None, incarnation, base_root);
        }
        let shared = self.connection()?.clone();
        let namespace = shared.namespace;
        self.call_observed(route, ServiceClass::General, None, move |db, _| {
            let route =
                Route::new(namespace, db.engine(), incarnation).map_err(OwnerError::Overlay)?;
            db.open_workspace(base_root).map_err(OwnerError::Overlay)?;
            let _ = shared.route.set(route);
            Ok(route)
        })
        .map(|(route, _)| route)
    }
    pub fn resources(&self, route: Option<Route>, global: bool) -> Result<Resources, OwnerError> {
        self.resources_observed(route, global)
            .map(|(value, _)| value)
    }
    pub(crate) fn resources_observed(
        &self,
        route: Option<Route>,
        global: bool,
    ) -> Result<(Resources, JobWork), OwnerError> {
        if let (Some(pool), None, true) = (self.roster(), route, global) {
            if pool.stopped()? {
                return Err(OwnerError::Unattempted {
                    cause: Box::new(OwnerError::Stopped),
                    input: OriginalInput::new((route, global)),
                });
            }
            let mut work = JobWork::default();
            return pool.resources(&mut work).map(|value| (value, work));
        }
        self.call_observed(route, ServiceClass::General, None, move |db, _| {
            db.resources().map_err(OwnerError::Overlay)
        })
    }
    pub fn observe_cleanup(
        &self,
        route: Option<Route>,
        namespace: i64,
        incarnation: [u8; 32],
    ) -> Result<CleanupState, OwnerError> {
        if let Some(pool) = self.roster() {
            return match pool.cleanup(namespace, incarnation)? {
                CleanupTarget::Client(client) => {
                    client.observe_cleanup(None, namespace, incarnation)
                }
                CleanupTarget::Gone => Ok(CleanupState::Gone),
                CleanupTarget::Queued => Ok(CleanupState::Queued),
            };
        }
        self.call_observed(route, ServiceClass::General, None, move |db, _| {
            db.cleanup_state().map_err(OwnerError::Overlay)
        })
        .map(|(value, _)| value)
    }
}
