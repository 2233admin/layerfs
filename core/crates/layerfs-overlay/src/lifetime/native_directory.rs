//! Exact native directory owners and retained current parent relationships.
use crate::{
    db::integer, LeaseKind, NativeDirectory, NativeMount, Overlay, OverlayError, OverlayResult,
};
impl Overlay {
    /// Called by the deciding lookup/mutation transaction for a directory only.
    /// Its FK follows existing independent file custody, including open dirs.
    pub(crate) fn set_native_parent(
        &self,
        mount: NativeMount,
        serial: u64,
        parent: u64,
    ) -> OverlayResult<()> {
        integer(serial)?;
        integer(parent)?;
        self.open
            .borrow_mut()
            .parents
            .put(serial, (mount.owner, parent));
        Ok(())
    }
    pub(crate) fn native_parent(&self, mount: NativeMount, serial: u64) -> OverlayResult<u64> {
        self.available()?;
        self.open
            .borrow()
            .parents
            .rows
            .get(&serial)
            .filter(|(owner, _)| *owner == mount.owner)
            .map(|(_, parent)| *parent)
            .ok_or(OverlayError::Stale)
    }
    pub(crate) fn retain_native_directory(
        &self,
        mount: NativeMount,
        request: &[u8; 8],
        serial: u64,
    ) -> OverlayResult<NativeDirectory> {
        self.native_parent(mount, serial)?;
        let owner = self.mint_owner()?;
        let directory = NativeDirectory {
            mount,
            owner,
            serial,
        };
        let request = u64::from_be_bytes(*request);
        {
            let mut state = self.open.borrow_mut();
            let held = crate::open::DirectoryState {
                directory,
                floor: 0,
            };
            let request = (mount.owner, request);
            state
                .directories
                .insert(owner, request, held, "duplicate directory request")?;
            state.open_cookies(owner)?;
        }
        self.file_ref(
            mount.route.ns,
            integer(serial)?,
            LeaseKind::FileHandle,
            true,
        )?;
        Ok(directory)
    }
    /// RELEASEDIR in one visit: the fence reads the Workspace and checks the
    /// exact descriptor in memory. The handle and its references are released,
    /// and its published replies detached. A closed Workspace still releases
    /// its descriptors.
    pub fn close_native_directory(
        &self,
        mount: NativeMount,
        serial: u64,
        handle: u64,
    ) -> OverlayResult<()> {
        self.atomic_cleanup(|| {
            let held = super::native_visit::Held::Directory(handle);
            let (_, _) = self.native_fence(mount, serial, held, false)?;
            self.close_native_directory_inner(NativeDirectory {
                mount,
                owner: handle,
                serial,
            })?;
            Ok(())
        })
    }
    /// The caller fenced this exact open handle. Detach its cookie store as
    /// one ownership transfer, so the caller can destroy arbitrarily many
    /// published pages after releasing the connection turn. No row sweep or
    /// terminal maintenance item runs here.
    pub(crate) fn close_native_directory_inner(
        &self,
        directory: NativeDirectory,
    ) -> OverlayResult<()> {
        let (ns, owner) = (directory.mount.route.ns, directory.owner);
        {
            let mut state = self.open.borrow_mut();
            let exact = |held: &crate::open::DirectoryState| held.directory == directory;
            state.directories.remove(owner, exact)?;
            state.close_cookies(owner)?;
        }
        self.file_ref(ns, integer(directory.serial)?, LeaseKind::FileHandle, false)
    }
}
/// Published replies one RELEASEDIR deletes in its own job, one maintenance
/// turn retires, and one publication on a rewound handle deletes below the
/// floor. The LIMIT of `sql::COOKIE_PAGES` is this value plus one, kept
/// equal by hand.
pub(crate) const INLINE_PAGES: usize = 8;
