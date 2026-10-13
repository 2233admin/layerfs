//! Exact lookup ownership, including non-file metadata after removal.
use crate::{
    db::integer, inode, BaseSource, Inode, InodeKind, LeaseKind, LookupOwner, Overlay,
    OverlayError, OverlayResult, Route,
};
impl Overlay {
    /// The authenticated root serial distinguishes its canonical zero count
    /// from removal. Base metadata is acquired outside SQL; current rows decide.
    pub fn acquire_lookup(
        &self,
        source: BaseSource,
        request: u64,
        base: &Inode,
        root: u64,
    ) -> OverlayResult<LookupOwner> {
        inode::check(base)?;
        let request = integer(request)?;
        integer(root)?;
        if request == 0 || root == 0 {
            return Err(OverlayError::Invalid("lookup identity"));
        }
        self.atomic(|| {
            let state = self.source_state(source)?;
            if state.closed {
                return Err(OverlayError::Closed);
            }
            let current = self
                .inode_at(source.route, base.serial, state.active, state.installed)?
                .unwrap_or_else(|| base.clone());
            if current.nlink == 0
                && !(current.kind == InodeKind::Directory && current.serial == root)
            {
                return Err(OverlayError::Missing);
            }
            let owner = self.mint_owner()?;
            let serial = integer(current.serial)?;
            let lookup = LookupOwner {
                route: source.route,
                owner,
                serial: current.serial,
            };
            {
                let mut state = self.open.borrow_mut();
                let request_key = (source.route.ns, request);
                if state.lookup_requests.rows.contains_key(&request_key) {
                    return Err(OverlayError::Invalid("duplicate lookup request"));
                }
                state
                    .lookups
                    .put((source.route.ns, owner), (lookup, request));
                state.lookup_requests.put(request_key, owner);
                state.count(source.route.ns, 4, true);
            }
            self.file_ref(source.route.ns, serial, LeaseKind::LookupOwner, true)?;
            Ok(LookupOwner {
                route: source.route,
                owner,
                serial: current.serial,
            })
        })
    }
    /// One processing reference outlives lookup release and logical close.
    pub fn acquire_lookup_read(
        &self,
        source: BaseSource,
        lookup: LookupOwner,
        request: u64,
    ) -> OverlayResult<crate::FileRead> {
        let request = integer(request)?;
        if request == 0 {
            return Err(OverlayError::Invalid("zero read request"));
        }
        self.atomic(|| {
            let state = self.source_state(source)?;
            if state.closed {
                return Err(OverlayError::Closed);
            }
            if lookup.route != source.route {
                return Err(OverlayError::Stale);
            }
            self.check_lookup(lookup)?;
            self.retain_serial_read(source, lookup.serial, request)
        })
    }
    pub fn retained_lookup(
        &self,
        route: Route,
        request: u64,
    ) -> OverlayResult<Option<LookupOwner>> {
        self.state(route)?;
        let request = integer(request)?;
        let state = self.open.borrow();
        Ok(state
            .lookup_requests
            .rows
            .get(&(route.ns, request))
            .and_then(|owner| state.lookups.rows.get(&(route.ns, *owner)))
            .map(|(lookup, _)| *lookup))
    }
    pub fn check_lookup(&self, lookup: LookupOwner) -> OverlayResult<()> {
        self.state(lookup.route)?;
        if self
            .open
            .borrow()
            .lookups
            .rows
            .get(&(lookup.route.ns, lookup.owner))
            .map(|(held, _)| *held)
            != Some(lookup)
        {
            return Err(OverlayError::Stale);
        }
        Ok(())
    }
    /// Call only after native/request continuations using this reference finish.
    pub fn release_lookup(&self, lookup: LookupOwner) -> OverlayResult<()> {
        self.atomic_cleanup(|| {
            self.check_lookup(lookup)?;
            {
                let mut state = self.open.borrow_mut();
                let key = (lookup.route.ns, lookup.owner);
                let request = state.lookups.rows.get(&key).ok_or(OverlayError::Stale)?.1;
                state.lookups.remove(key);
                state.lookup_requests.remove((lookup.route.ns, request));
                state.count(lookup.route.ns, 4, false);
            }
            self.file_ref(
                lookup.route.ns,
                integer(lookup.serial)?,
                LeaseKind::LookupOwner,
                false,
            )?;
            Ok(())
        })
    }
}
