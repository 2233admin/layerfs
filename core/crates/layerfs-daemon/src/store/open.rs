//! Opened provider ownership and one reader per mounted Workspace.
use super::{read_service::ReadSet, PortError, ReadServiceWork, ReaderFactory, StoreReader};
use layerfs_history::{HistoryCatalog, WorkspaceId};
use layerfs_storage::{encoding::delta::select::DeltaCounters, save::PoolCounters, WriteOutcome};
use layerfs_storage::{
    port::PackPersistence, ReservationBlocks, Storage, StorageError, StoragePolicy, StorageResult,
};
use layerfs_workspace::{CanonicalCache, CanonicalClient, ClientWork};
use std::sync::{
    atomic::{AtomicU64, Ordering},
    Arc, Mutex,
};

/// Exact adapter demand counts. They do not substitute for provider work receipts.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct StoreWork {
    pub object_batches: u64,
    pub object_ids: u64,
    pub length_batches: u64,
    pub length_ids: u64,
    pub serial_reservations: u64,
}
#[derive(Default)]
pub(super) struct Counts {
    pub objects: AtomicU64,
    pub object_ids: AtomicU64,
    pub lengths: AtomicU64,
    pub length_ids: AtomicU64,
    pub serials: AtomicU64,
}
/// Delta selection outcomes of every Save this daemon finished, payload and
/// pooled metadata: stored depths and why candidates were refused.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct SaveCounters {
    pub delta: DeltaCounters,
    pub pool: PoolCounters,
}
/// One global Store binding, with mounted readers and a shared immutable cache.
/// Opened providers must belong to the same validated authority. Application
/// composition owns that selection; this adapter knows only the public ports.
pub struct Store {
    pub(super) writer: Arc<dyn PackPersistence>,
    pub(super) history: Arc<dyn HistoryCatalog>,
    pub(super) readers: Arc<ReadSet>,
    policy: StoragePolicy,
    reservations: ReservationBlocks,
    pub(super) cache: Arc<CanonicalCache>,
    /// Reads objects already in `cache` and nothing else: no reader, no I/O.
    pub(super) resident: Arc<CanonicalClient>,
    pub(super) counts: Arc<Counts>,
    /// Unconsumed local serials below which a create refills early.
    pub(super) serial_low_water: AtomicU64,
    /// The write recognizer's fixed slots, shared by every Workspace.
    pub(super) recognizer: super::Recognizer,
    saves: Mutex<SaveCounters>,
}
impl Store {
    /// Takes the control reader and a mount-time factory under explicit capacity.
    pub fn new(
        writer: Arc<dyn PackPersistence>,
        history: Arc<dyn HistoryCatalog>,
        control: StoreReader,
        factory: ReaderFactory,
        cache_bytes: usize,
        reservations: ReservationBlocks,
        workspace_capacity: usize,
    ) -> StorageResult<Self> {
        let reservations = reservations.validate()?;
        let policy = writer.policy()?.validated()?;
        if workspace_capacity == 0 || control.storage.policy() != policy {
            return Err(StorageError::Integrity("Store reader capacity or policy"));
        }
        let counts = Arc::new(Counts::default());
        let cache = Arc::new(CanonicalCache::new(cache_bytes));
        let readers = ReadSet::new(control, factory, counts.clone(), workspace_capacity, policy);
        Ok(Self {
            writer,
            history,
            readers,
            policy,
            reservations,
            resident: Arc::new(CanonicalClient::resident(cache.clone())),
            cache,
            counts,
            serial_low_water: AtomicU64::new(0),
            recognizer: super::Recognizer::new(),
            saves: Mutex::default(),
        })
    }
    /// Explicit configuration. Application assembly calls this once, before
    /// any Workspace is served; nothing else in the product calls it. Zero,
    /// the value until then, makes no early attempt.
    pub fn set_serial_low_water(&self, serials: u64) {
        self.serial_low_water.store(serials, Ordering::Relaxed);
    }
    /// Independent mutable producer state over the same opened write provider.
    /// No shared Save or whole-Commit ownership is acquired here.
    pub fn producer(&self) -> StorageResult<Storage> {
        Storage::with_reservations(self.writer.clone(), self.reservations)
    }
    pub const fn policy(&self) -> StoragePolicy {
        self.policy
    }
    pub fn history(&self) -> &dyn HistoryCatalog {
        self.history.as_ref()
    }
    /// Adds one finished Save's selection counts to the daemon's totals.
    pub(crate) fn note_save(&self, saved: &WriteOutcome) {
        if let Ok(mut saves) = self.saves.lock() {
            saves.delta.accumulate(&saved.delta);
            saves.pool.accumulate(&saved.pool);
        }
    }
    /// The selection counts of every Save this daemon finished.
    pub fn save_counters(&self) -> SaveCounters {
        self.saves.lock().map(|saves| *saves).unwrap_or_default()
    }
    pub fn read_handles(&self) -> usize {
        self.readers.work().readers
    }
    pub fn cache_work(&self) -> layerfs_content::ContentResult<ClientWork> {
        self.cache.diagnostics()
    }
    pub fn recognizer_work(&self) -> super::RecognizerWork {
        self.recognizer.work()
    }
    pub fn work(&self) -> StoreWork {
        StoreWork {
            object_batches: self.counts.objects.load(Ordering::Relaxed),
            object_ids: self.counts.object_ids.load(Ordering::Relaxed),
            length_batches: self.counts.lengths.load(Ordering::Relaxed),
            length_ids: self.counts.length_ids.load(Ordering::Relaxed),
            serial_reservations: self.counts.serials.load(Ordering::Relaxed),
        }
    }
    pub(crate) fn mount_reader(&self, workspace: WorkspaceId) -> Result<(), Arc<PortError>> {
        self.readers.mount(workspace)
    }
    pub(crate) fn close_reader(&self, workspace: WorkspaceId) -> Result<(), Arc<PortError>> {
        self.readers.close(workspace)
    }
    pub(super) fn reader(
        &self,
        workspace: Option<WorkspaceId>,
    ) -> Result<Arc<super::read_handle::ReadSession>, super::ReadAdmissionError> {
        self.readers.session(workspace)
    }
    pub fn read_work(&self) -> ReadServiceWork {
        self.readers.work()
    }
    /// One nonblocking Storage-counter snapshot of an opened reader identity.
    /// A contended or unavailable reader returns None without acquisition.
    pub fn reader_storage_diagnostics(&self, index: usize) -> Option<layerfs_storage::Diagnostics> {
        self.readers.storage_diagnostics(index)
    }
    pub fn reader_failures(&self) -> Vec<(usize, Arc<PortError>)> {
        self.readers.failures()
    }
    /// Whole-Store shutdown only. Workspace unmount must not stop other readers.
    pub fn stop_reads(&self) {
        self.readers.stop();
    }
}
