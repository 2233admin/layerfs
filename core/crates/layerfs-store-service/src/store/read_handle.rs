//! One Workspace's opened read-only session and exact unknown-outcome custody.
use super::{open::Counts, PortError, ReadAdmissionError};
use layerfs_content::ObjectId;
use layerfs_history::{BranchId, BranchSnapshot, HistoryCatalog};
use layerfs_storage::{Diagnostics, ReadCache, Storage};
use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex, OnceLock,
    },
    time::Instant,
};

pub struct StoreReader {
    pub(super) storage: Storage,
    pub(super) history: Arc<dyn HistoryCatalog>,
    closed: Option<Box<dyn FnOnce() + Send>>,
}
impl StoreReader {
    pub fn new(storage: Storage, history: Arc<dyn HistoryCatalog>) -> Self {
        Self {
            storage,
            history,
            closed: None,
        }
    }
    pub fn on_close(mut self, closed: impl FnOnce() + Send + 'static) -> Self {
        self.closed = Some(Box::new(closed));
        self
    }
}
impl Drop for StoreReader {
    fn drop(&mut self) {
        if let Some(closed) = self.closed.take() {
            closed();
        }
    }
}

struct State {
    reader: Option<StoreReader>,
}
pub(super) struct ReadSession {
    pub index: usize,
    state: Mutex<State>,
    counts: Arc<Counts>,
    failure: OnceLock<Arc<PortError>>,
    pub requests: AtomicU64,
    pub wait_ns: AtomicU64,
}
impl ReadSession {
    pub fn new(index: usize, reader: StoreReader, counts: Arc<Counts>) -> Self {
        Self {
            index,
            state: Mutex::new(State {
                reader: Some(reader),
            }),
            counts,
            failure: OnceLock::new(),
            requests: AtomicU64::new(0),
            wait_ns: AtomicU64::new(0),
        }
    }
    fn lock(&self) -> Result<std::sync::MutexGuard<'_, State>, Arc<PortError>> {
        self.state.lock().map_err(|_| {
            self.failure
                .get_or_init(|| Arc::new(PortError::Poisoned))
                .clone()
        })
    }

    fn attempt<T>(
        &self,
        call: impl FnOnce(&StoreReader, &Counts) -> Result<T, PortError>,
    ) -> Result<T, Arc<PortError>> {
        let before = Instant::now();
        let state = self.lock()?;
        let waited = before.elapsed();
        layerfs_telemetry::timer::waits::add(
            layerfs_telemetry::timer::waits::Wait::ReadSession,
            waited,
        );
        self.wait_ns.fetch_add(
            waited.as_nanos().min(u64::MAX as u128) as u64,
            Ordering::Relaxed,
        );
        if let Some(error) = self.failure.get() {
            return Err(error.clone());
        }
        let reader = state
            .reader
            .as_ref()
            .ok_or_else(|| Arc::new(PortError::ReadAdmission(ReadAdmissionError::Stopped)))?;
        self.requests.fetch_add(1, Ordering::Relaxed);
        call(reader, &self.counts).map_err(|error| {
            let error = Arc::new(error);
            if uncertain(&error) {
                self.failure.get_or_init(|| error).clone()
            } else {
                error
            }
        })
    }
    pub fn objects(&self, ids: &[ObjectId]) -> Result<Vec<Vec<u8>>, Arc<PortError>> {
        self.attempt(|handle, counts| {
            counts.objects.fetch_add(1, Ordering::Relaxed);
            counts
                .object_ids
                .fetch_add(ids.len() as u64, Ordering::Relaxed);
            handle
                .storage
                .reader()
                .and_then(|r| r.read_objects(ids))
                .map_err(PortError::Storage)
        })
    }
    /// [`Self::objects`] through a caller's caches; the lock is held for
    /// this one demand only.
    pub fn objects_with(
        &self,
        cache: &mut ReadCache,
        ids: &[ObjectId],
    ) -> Result<Vec<Vec<u8>>, Arc<PortError>> {
        self.attempt(|handle, counts| {
            counts.objects.fetch_add(1, Ordering::Relaxed);
            counts
                .object_ids
                .fetch_add(ids.len() as u64, Ordering::Relaxed);
            handle
                .storage
                .read_with(cache, ids)
                .map_err(PortError::Storage)
        })
    }
    pub fn file_lengths(&self, ids: &[ObjectId]) -> Result<Vec<u64>, Arc<PortError>> {
        self.attempt(|handle, counts| {
            counts.lengths.fetch_add(1, Ordering::Relaxed);
            counts
                .length_ids
                .fetch_add(ids.len() as u64, Ordering::Relaxed);
            handle
                .storage
                .reader()
                .and_then(|r| r.file_lengths(ids))
                .map_err(PortError::Storage)
        })
    }
    pub fn snapshot(&self, branch: BranchId) -> Result<Option<BranchSnapshot>, Arc<PortError>> {
        self.attempt(|handle, _| {
            handle
                .history
                .branch_snapshot(branch)
                .map_err(PortError::History)
        })
    }
    /// One lookup in this reader's read-only history.
    pub fn published<T>(
        &self,
        lookup: impl FnOnce(&dyn HistoryCatalog) -> layerfs_history::HistoryResult<T>,
    ) -> Result<T, Arc<PortError>> {
        self.attempt(|handle, _| lookup(handle.history.as_ref()).map_err(PortError::History))
    }
    pub fn close(&self) -> Result<(), Arc<PortError>> {
        self.release().map(drop)
    }
    /// Closes this session and hands back its reader, which served without
    /// a failure; a failed or poisoned session keeps its cause and gives none.
    pub fn release(&self) -> Result<Option<StoreReader>, Arc<PortError>> {
        let mut state = self.lock()?;
        if let Some(cause) = self.failure.get() {
            return Err(cause.clone());
        }
        Ok(state.reader.take())
    }
    pub fn quarantined(&self) -> bool {
        self.failure.get().is_some() || self.state.is_poisoned()
    }
    pub fn failure(&self) -> Option<Arc<PortError>> {
        self.failure.get().cloned().or_else(|| {
            self.state.is_poisoned().then(|| {
                self.failure
                    .get_or_init(|| Arc::new(PortError::Poisoned))
                    .clone()
            })
        })
    }
    pub fn diagnostics(&self) -> Option<Diagnostics> {
        self.state
            .try_lock()
            .ok()?
            .reader
            .as_ref()
            .map(|r| r.storage.diagnostics())
    }
}
fn uncertain(error: &PortError) -> bool {
    match error {
        PortError::Storage(error) => error.is_unknown_outcome(),
        PortError::History(error) => error.unknown(),
        PortError::Poisoned => true,
        _ => false,
    }
}
