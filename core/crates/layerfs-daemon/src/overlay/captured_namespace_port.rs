//! Captured namespace construction over existing bounded original reader jobs.
use crate::{OwnerClient, Response};
use layerfs_overlay::{CapturedReader, DirectoryEntry, Inode};
use layerfs_workspace::{OverlayCapturedNamespace, WorkspaceError, WorkspaceResult};

impl OwnerClient {
    /// This synchronous port serves the constructor thread, never a native
    /// receive worker. Each call is one attempt under the Workspace lock.
    /// Failure keeps the original input or receipt.
    fn captured_namespace_job(
        &self,
        reader: CapturedReader,
        command: impl FnOnce(
                &crate::OwnerClient,
                layerfs_overlay::Route,
            ) -> Result<crate::JobReceipt, crate::OwnerError>
            + Send,
    ) -> WorkspaceResult<crate::JobReceipt> {
        command(self, reader.capture().route())
            .map_err(|cause| WorkspaceError::Service(Box::new(cause)))
    }
}

impl OverlayCapturedNamespace for OwnerClient {
    fn captured_inode_page(
        &self,
        reader: CapturedReader,
        after: u64,
    ) -> WorkspaceResult<Vec<Inode>> {
        let done = self
            .captured_namespace_job(reader, |job_client: &crate::OwnerClient, route| {
                job_client.reader_inodes(route, reader, after)
            })?;
        match done.result() {
            // The constructor's bounded copy briefly overlaps the original
            // receipt. This is not a zero-copy service interface.
            Ok(Response::Inodes(rows)) => Ok(rows.clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }

    fn captured_directory_entry_page(
        &self,
        reader: CapturedReader,
        after: Option<(u64, Vec<u8>)>,
    ) -> WorkspaceResult<Vec<DirectoryEntry>> {
        let done =
            self.captured_namespace_job(reader, |job_client: &crate::OwnerClient, route| {
                job_client.reader_directory_entries(route, reader, after)
            })?;
        match done.result() {
            // Full names stay in bounded row values; no truncated identity key.
            Ok(Response::DirectoryEntries(rows)) => Ok(rows.clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }

    fn captured_directory_entries(
        &self,
        reader: CapturedReader,
        parent: u64,
        after: Option<Vec<u8>>,
    ) -> WorkspaceResult<Vec<DirectoryEntry>> {
        let done =
            self.captured_namespace_job(reader, |job_client: &crate::OwnerClient, route| {
                job_client.reader_parent_directory_entries(route, reader, parent, after)
            })?;
        match done.result() {
            Ok(Response::DirectoryEntries(rows)) => Ok(rows.clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }

    fn captured_directory_entry(
        &self,
        reader: CapturedReader,
        parent: u64,
        name: &[u8],
    ) -> WorkspaceResult<Option<DirectoryEntry>> {
        // The command owns its name, so an unattempted job returns it intact.
        let done =
            self.captured_namespace_job(reader, |job_client: &crate::OwnerClient, route| {
                job_client.reader_directory_entry(route, reader, parent, name.to_vec())
            })?;
        match done.result() {
            Ok(Response::DirectoryEntry(row)) => Ok(row.clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }

    fn captured_symlink(&self, reader: CapturedReader, serial: u64) -> WorkspaceResult<Vec<u8>> {
        let done =
            self.captured_namespace_job(reader, |job_client: &crate::OwnerClient, route| {
                job_client.reader_symlink(route, reader, serial)
            })?;
        match done.result() {
            Ok(Response::Symlink(target)) => Ok(target.clone()),
            _ => Err(WorkspaceError::Service(Box::new(done))),
        }
    }
}
