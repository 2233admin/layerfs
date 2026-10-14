//! Exact open and read-processing owners; no descriptor pins a generation chain.
use crate::{
    db::integer, inode, sql, BaseSource, FileRead, Inode, InodeKind, LeaseKind, OpenFile, Overlay,
    OverlayError, OverlayResult, Route, StatementKind, WorkspaceState,
};

// Native cookies are opaque u64 values on the wire. Process-wide allocation
// prevents one Workspace's valid offset from aliasing another's valid offset.
// This is an identity cursor, not a shared overlay cache or memory allowance.
static NEXT_OWNER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);
impl Overlay {
    /// One ordinary runtime identity; failed jobs never reuse their identities.
    pub(crate) fn mint_owner(&self) -> OverlayResult<u64> {
        self.mint_owners(1)
    }
    /// Consecutive identities, without a stored row. The signed-integer
    /// format ceiling is unchanged; no file/edit/population cap is imposed.
    pub(crate) fn mint_owners(&self, count: u64) -> OverlayResult<u64> {
        use std::sync::atomic::Ordering;
        NEXT_OWNER
            .fetch_update(Ordering::Relaxed, Ordering::Relaxed, |next| {
                next.checked_add(count)
                    .filter(|after| *after <= i64::MAX as u64)
            })
            .map_err(|_| OverlayError::Invalid("owner identity exhausted"))
    }
    pub(crate) fn file_ref(
        &self,
        ns: i64,
        serial: i64,
        kind: LeaseKind,
        add: bool,
    ) -> OverlayResult<()> {
        if !matches!(
            kind,
            LeaseKind::FileHandle | LeaseKind::LookupOwner | LeaseKind::FileReader
        ) {
            return Ok(());
        }
        let mut refs = self
            .open
            .borrow()
            .custody
            .rows
            .get(&serial)
            .copied()
            .unwrap_or_default();
        refs.change(kind, add)?;
        self.open.borrow_mut().custody.put(serial, refs);
        if add {
            if !matches!(kind, LeaseKind::LookupOwner) && self.orphan(serial)?.is_some() {
                self.enqueue(crate::maintenance::ORPHAN, serial, -1)?;
            }
        } else if refs.total() == 0 {
            match self.orphan(serial)? {
                None => self.drop_custody(serial)?,
                Some(orphan) if self.release_step.replace(false) => {
                    self.finish_release(ns, serial, orphan)?
                }
                Some(_) => {
                    self.enqueue(crate::maintenance::ORPHAN, serial, -1)?;
                    self.wake_orphan(serial)?;
                }
            }
        }
        Ok(())
    }
    pub(crate) fn file_refs(&self, serial: i64) -> OverlayResult<u64> {
        self.available()?;
        Ok(self
            .open
            .borrow()
            .custody
            .rows
            .get(&serial)
            .copied()
            .unwrap_or_default()
            .total())
    }
    /// Opens a current regular inode. `base` is an authenticated immutable fact
    /// supplied outside SQL under the still-owned source; local rows decide.
    /// Request IDs permit observation after lost replies, never automatic replay.
    pub fn open_file(
        &self,
        source: BaseSource,
        request: u64,
        base: &Inode,
        writable: bool,
    ) -> OverlayResult<OpenFile> {
        inode::check(base)?;
        let request = integer(request)?;
        if request == 0 {
            return Err(OverlayError::Invalid("zero open request"));
        }
        self.atomic(|| {
            let state = self.source_state(source)?;
            if state.closed {
                return Err(OverlayError::Closed);
            }
            let current = self
                .inode_at(base.serial, state.active, state.installed)?
                .unwrap_or_else(|| base.clone());
            if current.kind != InodeKind::File || current.nlink == 0 {
                return Err(OverlayError::Missing);
            }
            self.retain_file(source.route, None, request, current.serial, writable)
        })
    }
    /// The enclosing owner transaction has already validated current metadata.
    /// `mount` is the native connection whose kernel request `request`
    /// receives the descriptor; without one, `request` is the caller's own.
    pub(crate) fn retain_file(
        &self,
        route: Route,
        mount: Option<u64>,
        request: i64,
        serial: u64,
        writable: bool,
    ) -> OverlayResult<OpenFile> {
        let file = self.retain_file_row(route, mount, request, serial, writable)?;
        self.file_ref(route.ns, integer(serial)?, LeaseKind::FileHandle, true)?;
        Ok(file)
    }
    /// The descriptor's row without its file reference, which the caller
    /// takes in the same transaction. The row is the descriptor's whole
    /// custody: no `lease` row stands for it.
    pub(crate) fn retain_file_row(
        &self,
        route: Route,
        mount: Option<u64>,
        request: i64,
        serial: u64,
        writable: bool,
    ) -> OverlayResult<OpenFile> {
        let owner = self.mint_owner()?;
        integer(serial)?;
        let mount = mount.unwrap_or(0);
        integer(mount)?;
        let file = OpenFile {
            route,
            owner,
            serial,
            writable,
        };
        self.open.borrow_mut().files.insert(
            owner,
            (mount, request),
            file,
            "duplicate open request",
        )?;
        Ok(file)
    }

    /// Original open custody, queried by its caller-known request identity.
    pub fn retained_file(&self, route: Route, request: u64) -> OverlayResult<Option<OpenFile>> {
        self.state(route)?;
        let request = integer(request)?;
        Ok(self.open.borrow().files.retained((0, request)))
    }
    /// Validates actual descriptor custody; read-only descriptors cannot write.
    pub fn check_file(&self, file: OpenFile, write: bool) -> OverlayResult<()> {
        self.checked_file(file, write).map(|_| ())
    }
    /// The same check, returning the Workspace row it read.
    fn checked_file(&self, file: OpenFile, write: bool) -> OverlayResult<WorkspaceState> {
        let state = self.state(file.route)?;
        {
            let open = self.open.borrow();
            let (held, (mount, _)) = open.files.get(file.owner).ok_or(OverlayError::Stale)?;
            if held != file {
                return Err(OverlayError::Stale);
            }
            if mount != 0
                && !open
                    .mount
                    .is_some_and(|(held, revoked)| held.owner == mount && !revoked)
            {
                return Err(OverlayError::Stale);
            }
        }
        if write && !file.writable {
            return Err(OverlayError::Invalid("read-only descriptor"));
        }
        Ok(state)
    }
    /// Exact close after this descriptor's native/request continuations finish.
    /// Read-processing windows keep their own independent references.
    pub fn close_file(&self, file: OpenFile) -> OverlayResult<()> {
        self.atomic_cleanup(|| self.close_file_inner(file))
    }
    pub(crate) fn close_file_inner(&self, file: OpenFile) -> OverlayResult<()> {
        self.checked_file(file, false)?;
        self.close_held_file(file)
    }
    /// Closes a descriptor whose row and Workspace row this job has read.
    pub(crate) fn close_held_file(&self, file: OpenFile) -> OverlayResult<()> {
        self.open
            .borrow_mut()
            .files
            .remove(file.owner, |held| *held == file)?;
        self.file_ref(
            file.route.ns,
            integer(file.serial)?,
            LeaseKind::FileHandle,
            false,
        )?;
        Ok(())
    }

    /// Acquires an independently owned read window under a current source.
    /// Its engine-owned source domain cannot collide with caller source IDs.
    pub fn acquire_file_read(
        &self,
        source: BaseSource,
        file: OpenFile,
        request: u64,
    ) -> OverlayResult<FileRead> {
        let request = integer(request)?;
        if request == 0 {
            return Err(OverlayError::Invalid("zero read request"));
        }
        self.atomic(|| {
            let state = self.source_state(source)?;
            if state.closed {
                return Err(OverlayError::Closed);
            }
            if file.route != source.route {
                return Err(OverlayError::Stale);
            }
            self.check_file(file, false)?;
            self.retain_serial_read(source, file.serial, request)
        })
    }
    pub(crate) fn retain_serial_read(
        &self,
        source: BaseSource,
        serial: u64,
        request: i64,
    ) -> OverlayResult<FileRead> {
        let owner = self.mint_owner()?;
        let serial = integer(serial)?;
        let read = FileRead {
            source: BaseSource {
                owner,
                class: 1,
                ..source
            },
            serial: serial as u64,
        };
        self.open
            .borrow_mut()
            .reads
            .insert(owner, request, read, "duplicate read request")?;
        self.execute(
            StatementKind::Lease,
            sql::BASE_SOURCE_INSERT,
            &[&integer(owner)?, &source.root.as_slice(), &1_i64],
            56,
        )?;
        self.execute(
            StatementKind::Workspace,
            sql::BASE_SOURCE_INCREMENT,
            &[&source.route.ns],
            8,
        )?;
        self.execute(
            StatementKind::Lease,
            "INSERT INTO commit_pin VALUES(5,?1,?2)",
            &[&integer(owner)?, &serial],
            24,
        )?;
        self.file_ref(source.route.ns, serial, LeaseKind::FileReader, true)?;
        Ok(FileRead {
            source: BaseSource {
                owner,
                class: 1,
                ..source
            },
            serial: serial as u64,
        })
    }
    pub fn retained_file_read(
        &self,
        route: Route,
        request: u64,
    ) -> OverlayResult<Option<FileRead>> {
        self.state(route)?;
        let request = integer(request)?;
        Ok(self.open.borrow().reads.retained(request))
    }
    pub(crate) fn check_file_read(&self, read: FileRead) -> OverlayResult<()> {
        self.source_state(read.source)?;
        if self
            .open
            .borrow()
            .reads
            .get(read.source.owner)
            .map(|(held, _)| held)
            != Some(read)
        {
            return Err(OverlayError::Stale);
        }
        Ok(())
    }
    /// Releases only this read window after the last consumer/base demand is fenced.
    pub fn release_file_read(&self, read: FileRead) -> OverlayResult<()> {
        self.atomic_cleanup(|| {
            self.check_file_read(read)?;
            let ns = read.source.route.ns;
            let owner = integer(read.source.owner)?;
            let serial = integer(read.serial)?;
            self.open
                .borrow_mut()
                .reads
                .remove(read.source.owner, |held| *held == read)?;
            self.execute(
                StatementKind::Lease,
                "DELETE FROM commit_pin WHERE kind=5 AND holder=?1 AND resource=?2",
                &[&owner, &serial],
                24,
            )?;
            self.file_ref(ns, serial, LeaseKind::FileReader, false)?;
            self.release_source_inner(read.source)
        })
    }
}
