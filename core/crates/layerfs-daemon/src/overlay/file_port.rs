//! Typed independently owned read windows through the real SQL owner.
use crate::{OwnerClient, Response};
use layerfs_overlay::{CapturedReader, FileRead, LocalRead};
use layerfs_workspace::{OverlayFileRead, WorkspaceError, WorkspaceResult};
impl OverlayFileRead for OwnerClient {
    fn file_read(
        &self,
        read: FileRead,
        offset: u64,
        length: u32,
    ) -> WorkspaceResult<Option<LocalRead>> {
        let done = self.read_job(read.source(), |job_client: &crate::OwnerClient, route| {
            job_client.file_read(route, read, offset, length)
        })?;
        match done.result() {
            Ok(Response::Read(value)) => Ok(value.clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }
    fn captured_read(
        &self,
        reader: CapturedReader,
        serial: u64,
        offset: u64,
        length: u32,
    ) -> WorkspaceResult<Option<LocalRead>> {
        if length as usize > layerfs_overlay::READ_WINDOW {
            return Err(layerfs_overlay::OverlayError::Invalid("read window").into());
        }
        let pending = self
            .captured_read(reader.capture().route(), reader, serial, offset, length)
            .map_err(|cause| WorkspaceError::Service(Box::new(cause)))?;
        let done = pending;
        match done.result() {
            Ok(Response::Read(value)) => Ok(value.clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }
}
