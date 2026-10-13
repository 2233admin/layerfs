//! Original scoped captured-run jobs of the read class.
//! Constructor-thread port: each call is one attempt under the Workspace lock.
use crate::{OwnerClient, Response};
use layerfs_overlay::{CapturedReader, CapturedRunCursor, CapturedRunReply, Inode};
use layerfs_workspace::{OverlayCapturedRuns, WorkspaceError, WorkspaceResult};

impl OverlayCapturedRuns for OwnerClient {
    fn captured_inode(
        &self,
        reader: CapturedReader,
        serial: u64,
    ) -> WorkspaceResult<Option<Inode>> {
        let pending = self
            .reader_inode(Some(reader.capture().route()), reader, serial)
            .map_err(|cause| WorkspaceError::Service(Box::new(cause)))?;
        let done = pending;
        match done.result() {
            Ok(Response::Inode(value)) => Ok(value.clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }
    fn captured_run_step(&self, cursor: CapturedRunCursor) -> WorkspaceResult<CapturedRunReply> {
        let pending = self
            .captured_run(Some(cursor.reader().capture().route()), Box::new(cursor))
            .map_err(|cause| WorkspaceError::Service(Box::new(cause)))?;
        let done = pending;
        match done.result() {
            // The independently returned bounded window overlaps its original
            // receipt during this clone; no zero-copy claim.
            Ok(Response::CapturedRun(value)) => Ok(value.as_ref().clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }
}
