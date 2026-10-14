//! One Workspace's opened read-only session and exact unknown-outcome custody.
use super::{open::Counts, PortError, ReadAdmissionError};
use layerfs_content::ObjectId;
use layerfs_history::{BranchId, BranchSnapshot, HistoryCatalog};
use layerfs_storage::{Diagnostics, Storage};
use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex,
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
    pub(crate) fn on_close(mut self, closed: impl FnOnce() + Send + 'static) -> Self {
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
    failure: Option<Arc<PortError>>,
}
pub(super) struct ReadSession {
    pub index: usize,
    state: Mutex<State>,
    counts: Arc<Counts>,
    pub requests: AtomicU64,
    pub wait_ns: AtomicU64,
}
impl ReadSession {
    pub fn new(index: usize, reader: StoreReader, counts: Arc<Counts>) -> Self {
        Self {
            index,
            state: Mutex::new(State {
                reader: Some(reader),
                failure: None,
            }),
            counts,
            requests: AtomicU64::new(0),
            wait_ns: AtomicU64::new(0),
        }
    }
    fn lock(&self) -> Result<std::sync::MutexGuard<'_, State>, Arc<PortError>> {
        self.state.lock().map_err(|poison| {
            let mut state = poison.into_inner();
            state
                .failure
                .get_or_insert_with(|| Arc::new(PortError::Poisoned))
                .clone()
        })
    }
    fn attempt<T>(
        &self,
        call: impl FnOnce(&StoreReader, &Counts) -> Result<T, PortError>,
    ) -> Result<T, Arc<PortError>> {
        let before = Instant::now();
        let mut state = self.lock()?;
        self.wait_ns.fetch_add(
            before.elapsed().as_nanos().min(u64::MAX as u128) as u64,
            Ordering::Relaxed,
        );
        if let Some(error) = &state.failure {
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
                state.failure = Some(error.clone());
            }
            error
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
    pub fn close(&self) -> Result<(), Arc<PortError>> {
        let mut state = self.lock()?;
        if let Some(cause) = &state.failure {
            return Err(cause.clone());
        }
        state.reader = None;
        Ok(())
    }
    pub fn failure(&self) -> Option<Arc<PortError>> {
        match self.state.lock() {
            Ok(state) => state.failure.clone(),
            Err(poison) => Some(
                poison
                    .into_inner()
                    .failure
                    .get_or_insert_with(|| Arc::new(PortError::Poisoned))
                    .clone(),
            ),
        }
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
