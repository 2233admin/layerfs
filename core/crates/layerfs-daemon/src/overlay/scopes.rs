//! Roster composition outside connection locks, and direct Workspace binding.
use super::{owner::OriginalInput, workspaces::CleanupTarget};
use crate::{JobReceipt, JobWork, OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_overlay::{CleanupState, OverlayError, Route};
impl OwnerClient {
    pub fn open(
        &self,
        route: Option<Route>,
        incarnation: [u8; 32],
        base_root: [u8; 32],
    ) -> Result<JobReceipt, OwnerError> {
        if let Some(pool) = self.roster() {
            if route.is_some() {
                return Err(OwnerError::Unattempted {
                    cause: Box::new(OwnerError::InvalidAdmission),
                    input: OriginalInput::new((route, incarnation, base_root)),
                });
            }
            let (client, observed) =
                pool.open(incarnation)
                    .map_err(|cause| OwnerError::Unattempted {
                        cause: Box::new(cause),
                        input: OriginalInput::new((route, incarnation, base_root)),
                    })?;
            let mut done = client.open(None, incarnation, base_root)?;
            done.add_allocation(observed);
            return Ok(done);
        }
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, _| {
            db.open_workspace(incarnation, base_root)
                .map(Response::Opened)
        })
    }
    pub fn resources(&self, route: Option<Route>, global: bool) -> Result<JobReceipt, OwnerError> {
        if let (Some(pool), None, true) = (self.roster(), route, global) {
            if pool.stopped()? {
                return Err(OwnerError::Unattempted {
                    cause: Box::new(OwnerError::Stopped),
                    input: OriginalInput::new((route, global)),
                });
            }
            let mut work = JobWork::default();
            let result = pool
                .resources(&mut work)
                .map(|value| Response::Resources(Box::new(value)));
            // Composition is not a connection hold. The constituent leaf jobs
            // account their own SQL/hold once; this receipt retains their work.
            return Ok(JobReceipt::new(result, work, None));
        }
        self.overlay_job(route, ServiceClass::Read, None, move |db, route| {
            if let Some(route) = route {
                db.state(route)?;
                db.resources(if global { None } else { Some(route) })
                    .map(|value| Response::Resources(Box::new(value)))
            } else if global {
                db.resources(None)
                    .map(|value| Response::Resources(Box::new(value)))
            } else {
                Err(OverlayError::Invalid("missing route"))
            }
        })
    }
    pub fn observe_cleanup(
        &self,
        route: Option<Route>,
        namespace: i64,
        incarnation: [u8; 32],
    ) -> Result<JobReceipt, OwnerError> {
        if let Some(pool) = self.roster() {
            match pool.cleanup(namespace, incarnation)? {
                CleanupTarget::Client(client) => {
                    return client.observe_cleanup(None, namespace, incarnation)
                }
                CleanupTarget::Gone => {
                    return Ok(JobReceipt::new(
                        Ok(Response::CleanupState(CleanupState::Gone)),
                        JobWork::default(),
                        None,
                    ))
                }
                CleanupTarget::Queued => {
                    return Ok(JobReceipt::new(
                        Ok(Response::CleanupState(CleanupState::Queued)),
                        JobWork::default(),
                        None,
                    ))
                }
            }
        }
        self.overlay_job(route, ServiceClass::Lifecycle, None, move |db, _| {
            db.observe_cleanup(namespace, incarnation)
                .map(Response::CleanupState)
        })
    }
}
