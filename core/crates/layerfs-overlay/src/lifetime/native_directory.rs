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
            .put_parent((mount.route.ns, serial), (mount.owner, parent));
        Ok(())
    }
    pub(crate) fn native_parent(&self, mount: NativeMount, serial: u64) -> OverlayResult<u64> {
        self.available()?;
        self.open
            .borrow()
            .parents
            .rows
            .get(&(mount.route.ns, serial))
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
            let request_key = (mount.route.ns, mount.owner, request);
            if state.directory_requests.rows.contains_key(&request_key) {
                return Err(OverlayError::Invalid("duplicate directory request"));
            }
            state.directories.put(
                (mount.route.ns, owner),
                crate::open::DirectoryState {
                    directory,
                    request,
                    floor: 0,
                },
            );
            state.directory_requests.put(request_key, owner);
            state.count(mount.route.ns, 9, true);
            state.open_cookies((mount.route.ns, owner))?;
        }
        self.file_ref(
            mount.route.ns,
            integer(serial)?,
            LeaseKind::FileHandle,
            true,
        )?;
        Ok(directory)
    }
    /// The original association of an open handle; observing it never permits
    /// replaying OPENDIR or RELEASEDIR. A released handle is absent.
    pub fn retained_native_directory(
        &self,
        mount: NativeMount,
        request: u64,
    ) -> OverlayResult<Option<NativeDirectory>> {
        self.check_native_attached(mount)?;
        let state = self.open.borrow();
        Ok(state
            .directory_requests
            .rows
            .get(&(mount.route.ns, mount.owner, request))
            .and_then(|owner| state.directories.rows.get(&(mount.route.ns, *owner)))
            .map(|entry| entry.directory))
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
            let held = state
                .directories
                .rows
                .get(&(ns, owner))
                .copied()
                .ok_or(OverlayError::Stale)?;
            if held.directory != directory {
                return Err(OverlayError::Stale);
            }
            state.directories.remove((ns, owner));
            state
                .directory_requests
                .remove((ns, directory.mount.owner, held.request));
            state.count(ns, 9, false);
            state.close_cookies((ns, owner))?;
        }
        self.file_ref(ns, integer(directory.serial)?, LeaseKind::FileHandle, false)
    }
}
/// Published replies one RELEASEDIR deletes in its own job, one maintenance
/// turn retires, and one publication on a rewound handle deletes below the
/// floor. The LIMIT of `sql::COOKIE_PAGES` is this value plus one, kept
/// equal by hand.
pub(crate) const INLINE_PAGES: usize = 8;
