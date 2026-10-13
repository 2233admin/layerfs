//! Indexed native connection and kernel lookup ownership.
use crate::{
    db::integer, LeaseKind, NativeMount, NativeMountState, Overlay, OverlayError, OverlayResult,
    Route, WorkspaceState,
};

impl Overlay {
    /// The caller supplies the authenticated bound root serial. Its implicit
    /// connection reference is separate from explicit kernel lookup counts.
    pub fn create_native_mount(&self, route: Route, root: u64) -> OverlayResult<NativeMount> {
        if root == 0 {
            return Err(OverlayError::Invalid("zero native root"));
        }
        integer(root)?;
        self.atomic(|| {
            self.live(route)?;
            let owner = self.mint_owner()?;
            let mount = NativeMount { route, owner, root };
            {
                let mut state = self.open.borrow_mut();
                if state.mounts.rows.contains_key(&route.ns) {
                    return Err(OverlayError::Invalid("duplicate native mount"));
                }
                state.mounts.put(route.ns, (mount, false));
                state.count(route.ns, 8, true);
            }
            self.insert_native_lookup(mount, root, true, 0)?;
            self.set_native_parent(mount, root, root)?;
            Ok(mount)
        })
    }
    /// Observes the original connection, without adopting or replaying attach.
    pub fn retained_native_mount(&self, route: Route) -> OverlayResult<Option<NativeMount>> {
        self.state(route)?;
        Ok(self
            .open
            .borrow()
            .mounts
            .rows
            .get(&route.ns)
            .map(|(mount, _)| *mount))
    }
    pub fn native_mount_state(&self, mount: NativeMount) -> OverlayResult<NativeMountState> {
        self.check_route(mount.route)?;
        match self.open.borrow().mounts.rows.get(&mount.route.ns) {
            None => Ok(NativeMountState::Gone),
            Some((held, revoked)) if *held == mount => Ok(if *revoked {
                NativeMountState::Revoked
            } else {
                NativeMountState::Live
            }),
            Some(_) => Err(OverlayError::Stale),
        }
    }
    /// This mount attached to its Workspace, closed or not, and the
    /// Workspace row read for it.
    pub(crate) fn check_native_attached(
        &self,
        mount: NativeMount,
    ) -> OverlayResult<WorkspaceState> {
        let state = self.state(mount.route)?;
        self.require_native_live(mount)?;
        Ok(state)
    }
    fn require_native_live(&self, mount: NativeMount) -> OverlayResult<()> {
        if self.native_mount_state(mount)? != NativeMountState::Live {
            return Err(OverlayError::Stale);
        }
        Ok(())
    }
    pub(crate) fn native_lookup_row(
        &self,
        mount: NativeMount,
        serial: u64,
    ) -> OverlayResult<Option<(u64, u64, bool)>> {
        self.available()?;
        integer(serial)?;
        Ok(self
            .open
            .borrow()
            .kernel
            .rows
            .get(&(mount.route.ns, mount.owner, serial))
            .map(|entry| (entry.owner, entry.count, entry.implicit)))
    }
    pub fn native_lookup_count(
        &self,
        mount: NativeMount,
        serial: u64,
    ) -> OverlayResult<Option<u64>> {
        self.check_native_attached(mount)?;
        Ok(self
            .native_lookup_row(mount, serial)?
            .map(|(_, count, _)| count))
    }
    pub(crate) fn insert_native_lookup(
        &self,
        mount: NativeMount,
        serial: u64,
        implicit: bool,
        count: u64,
    ) -> OverlayResult<()> {
        self.insert_native_lookup_row(mount, serial, implicit, count)?;
        self.file_ref(
            mount.route.ns,
            integer(serial)?,
            LeaseKind::LookupOwner,
            true,
        )
    }
    /// The lookup row without its file reference, which the caller takes in
    /// the same transaction. A row that already exists is a failure. The
    /// row is the reference's whole custody: no `lease` row stands for it.
    pub(crate) fn insert_native_lookup_row(
        &self,
        mount: NativeMount,
        serial: u64,
        implicit: bool,
        count: u64,
    ) -> OverlayResult<()> {
        let key = (mount.route.ns, mount.owner, serial);
        integer(serial)?;
        integer(count)?;
        if count == 0 && !implicit {
            return Err(OverlayError::Invalid("empty kernel reference"));
        }
        let owner = self.mint_owner()?;
        let mut state = self.open.borrow_mut();
        if state.kernel.rows.contains_key(&key) {
            return Err(OverlayError::Invalid("duplicate kernel reference"));
        }
        state.put_kernel(
            key,
            crate::open::KernelReference {
                owner,
                count,
                implicit,
            },
        );
        Ok(())
    }
    pub(crate) fn add_native_lookup(&self, mount: NativeMount, serial: u64) -> OverlayResult<()> {
        if let Some((owner, count, implicit)) = self.native_lookup_row(mount, serial)? {
            let count = count
                .checked_add(1)
                .filter(|count| *count <= i64::MAX as u64)
                .ok_or(OverlayError::Invalid("native lookup overflow"))?;
            self.open.borrow_mut().put_kernel(
                (mount.route.ns, mount.owner, serial),
                crate::open::KernelReference {
                    owner,
                    count,
                    implicit,
                },
            );
            Ok(())
        } else {
            self.insert_native_lookup(mount, serial, false, 1)
        }
    }
    pub(crate) fn drop_native_lookup(
        &self,
        mount: NativeMount,
        serial: u64,
        owner: u64,
    ) -> OverlayResult<()> {
        let key = (mount.route.ns, mount.owner, serial);
        if self
            .open
            .borrow()
            .kernel
            .rows
            .get(&key)
            .map(|entry| entry.owner)
            != Some(owner)
        {
            return Err(OverlayError::Stale);
        }
        self.open.borrow_mut().remove_kernel(key);
        self.file_ref(
            mount.route.ns,
            integer(serial)?,
            LeaseKind::LookupOwner,
            false,
        )
    }
    /// FORGET's fence in one statement: the Workspace row, closed or not,
    /// this mount attached and not revoked, and the lookup row the request
    /// names (its owner, count and whether it is the connection's implicit
    /// one). A missing or foreign Workspace, mount or lookup row is Stale.
    fn forget_fence(
        &self,
        mount: NativeMount,
        serial: u64,
    ) -> OverlayResult<(WorkspaceState, u64, u64, bool)> {
        let state = self.check_native_attached(mount)?;
        let (owner, count, implicit) = self
            .native_lookup_row(mount, serial)?
            .ok_or(OverlayError::Stale)?;
        Ok((state, owner, count, implicit))
    }
    /// Exact no-reply kernel decrement. Failure retains the original caller's
    /// record; it never compensates an unavailable send/delivery outcome.
    pub fn forget_native(&self, mount: NativeMount, serial: u64, count: u64) -> OverlayResult<()> {
        if count == 0 {
            return Err(OverlayError::Invalid("zero native forget"));
        }
        self.atomic_cleanup(|| {
            let (_, owner, held, implicit) = self.forget_fence(mount, serial)?;
            let after = held
                .checked_sub(count)
                .ok_or(OverlayError::Invalid("native lookup underflow"))?;
            if after == 0 && !implicit {
                self.drop_native_lookup(mount, serial, owner)?;
            } else {
                self.open.borrow_mut().put_kernel(
                    (mount.route.ns, mount.owner, serial),
                    crate::open::KernelReference {
                        owner,
                        count: after,
                        implicit,
                    },
                );
            }
            // The release changes no lifecycle, capture or base reader.
            Ok(())
        })
    }
    /// Call only after detach and complete native/service consumer drain. A
    /// request records nothing here, so the fixed logical mark waits for no
    /// row. An open file or directory handle whose kernel RELEASE can no longer arrive
    /// stops representing a consumer here; its allocation goes with file close.
    pub fn revoke_native_mount(&self, mount: NativeMount) -> OverlayResult<()> {
        self.atomic_cleanup(|| {
            self.check_native_attached(mount)?;
            self.open
                .borrow_mut()
                .mounts
                .put(mount.route.ns, (mount, true));
            Ok(())
        })
    }
}
