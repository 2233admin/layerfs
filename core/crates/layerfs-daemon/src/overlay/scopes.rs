//! Roster composition outside connection locks, and direct Workspace binding.
use super::{owner::OriginalInput, workspaces::CleanupTarget};
use crate::{JobReceipt, JobWork, OwnerClient, OwnerError, Response, ServiceClass};
use layerfs_overlay::CleanupState;
use layerfs_workspace::Route;
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
        let namespace = self.connection()?.namespace;
        self.owner_job(route, ServiceClass::Lifecycle, None, move |db, _| {
            let route =
                Route::new(namespace, db.engine(), incarnation).map_err(OwnerError::Overlay)?;
            db.open_workspace(base_root).map_err(OwnerError::Overlay)?;
            Ok(Response::Opened(route))
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
        self.owner_job(route, ServiceClass::Read, None, move |db, _| {
            db.resources()
                .map(|value| Response::Resources(Box::new(value)))
                .map_err(OwnerError::Overlay)
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
        self.owner_job(route, ServiceClass::Lifecycle, None, move |db, _| {
            db.cleanup_state()
                .map(Response::CleanupState)
                .map_err(OwnerError::Overlay)
        })
    }
}
