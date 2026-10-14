//! Encoded native file handles retain the existing exact OpenFile owner.
use crate::{NativeMount, OpenFile, Overlay, OverlayError, OverlayResult};

/// A kernel request identity as the descriptor row stores it: the same 64
/// bits, so two requests of one mount have one row key exactly when they are
/// one request.
pub(crate) const fn native_request(request: u64) -> i64 {
    i64::from_ne_bytes(request.to_ne_bytes())
}
impl Overlay {
    /// Validate all connection/route/serial/handle fields before file use.
    pub fn native_file(
        &self,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> OverlayResult<OpenFile> {
        self.check_native_attached(mount)?;
        self.native_file_row(mount, serial, handle)
    }
    /// The same descriptor inside a job that already checked its mount.
    pub(crate) fn native_file_row(
        &self,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> OverlayResult<OpenFile> {
        self.available()?;
        self.open
            .borrow()
            .files
            .get(handle)
            .filter(|(file, (held, _))| *held == mount.owner && file.serial == serial)
            .map(|(file, _)| file)
            .ok_or(OverlayError::Stale)
    }
    /// Close the exact handle once. Existing independently acquired sources/read
    /// windows survive; foreign or reused encoded handles are rejected.
    pub fn close_native_file(
        &self,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> OverlayResult<()> {
        self.atomic_cleanup(|| {
            // The fence read this descriptor's row and the Workspace row;
            // a closed Workspace still releases its descriptors.
            let (_, writable) = self.native_fence(
                mount,
                serial,
                super::native_visit::Held::File(handle),
                false,
            )?;
            let file = OpenFile {
                route: mount.route,
                owner: handle,
                serial,
                writable,
            };
            self.close_held_file(file)
        })
    }
}
