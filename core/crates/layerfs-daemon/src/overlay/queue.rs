//! Bounded scheduling state, independent of authoritative filesystem metadata.
use crate::{
    commands::{Command, ServiceClass},
    owner::{OwnerConfig, OwnerError},
    service::completion::{Outcome, Publisher},
};
use layerfs_overlay::{Overlay, Route};
use std::{
    any::Any,
    collections::VecDeque,
    mem::size_of,
    sync::{Arc, Condvar, Mutex, MutexGuard, OnceLock},
    time::Instant,
};

#[derive(Clone, Copy, Debug, Default)]
pub struct OwnerWork {
    /// Exclusive command jobs; automatic maintenance is accounted separately.
    pub sql_foreground: layerfs_overlay::DatabaseWork,
    pub sql_maintenance: layerfs_overlay::DatabaseWork,
    pub payload_foreground: layerfs_overlay::PayloadWork,
    pub payload_maintenance: layerfs_overlay::PayloadWork,
    pub allocation_foreground: layerfs_overlay::AllocationWork,
    pub allocation_maintenance: layerfs_overlay::AllocationWork,
    pub admitted: u64,
    pub completed: [u64; 6],
    pub queue_wait_ns: [u64; 6],
    pub service_ns: [u64; 6],
    pub credited_bytes: usize,
    pub peak_credited_bytes: usize,
    pub outstanding: usize,
    /// Fixed scheduler state and actual lane queue capacity, allocated once at
    /// startup and excluded from the admission bytes available to jobs.
    pub scheduler_bytes: usize,
    /// Admitted jobs waiting in a lane, including parked ones; excludes the
    /// executing job and caller-held results.
    pub queued: usize,
    pub peak_queued: usize,
    /// Jobs whose retained receipt rows exceeded their admitted allowance, and
    /// the bytes charged for them when observed.
    pub receipt_overruns: u64,
    pub receipt_overrun_bytes: usize,
    pub maintenance_jobs: u64,
    pub maintenance_rows: u64,
    /// Acknowledged terminal namespace reclamations; neither logical Close nor
    /// a completed live-maintenance step increments this observation.
    pub closed_namespaces: u64,
    pub maintenance_data_bytes: u64,
    pub maintenance_ns: u64,
}
pub(crate) struct Job {
    pub id: u64,
    pub route: Option<Route>,
    pub command: Command,
    pub publisher: Publisher,
    pub admitted: Instant,
    pub blocked: bool,
    pub wait_consolidation: bool,
    pub work: crate::JobWork,
}
impl Job {
    /// Returns the original command with any earlier readiness receipt. The
    /// job's storage is released before its outcome is allocated.
    pub fn refuse(self: Box<Self>, cause: OwnerError) {
        let Job {
            command,
            publisher,
            work,
            ..
        } = *self;
        publisher.publish(Box::new(Outcome {
            result: Err(OwnerError::Unattempted {
                cause: Box::new(cause),
                command: Box::new(command),
            }),
            work,
        }));
    }
}
/// One namespace's admitted jobs. Queues hold job pointers in capacity fixed at
/// startup; a lane is reused once its last credit is released. Each counter is
/// the credits of its classes: queued, executing and caller-held results.
pub(crate) struct Lane {
    pub queues: [VecDeque<Box<Job>>; 6],
    pub next: usize,
    pub ordinary: usize,
    pub source: usize,
    pub lifecycle: usize,
}
impl Lane {
    /// The slot counter a class is admitted against. Source acquisitions have
    /// their own: the ones a queued install holds back take no ordinary slot
    /// from the holder of the earlier source that install waits for.
    pub fn slots(&mut self, class: ServiceClass) -> &mut usize {
        match class {
            ServiceClass::Lifecycle => &mut self.lifecycle,
            ServiceClass::Source => &mut self.source,
            _ => &mut self.ordinary,
        }
    }
    fn new(config: OwnerConfig) -> Self {
        Self {
            queues: std::array::from_fn(|class| {
                VecDeque::with_capacity(if class == ServiceClass::Lifecycle as usize {
                    config.lifecycle_jobs_per_namespace
                } else {
                    config.jobs_per_namespace
                })
            }),
            next: 0,
            ordinary: 0,
            source: 0,
            lifecycle: 0,
        }
    }
    fn take(&mut self) -> Option<Box<Job>> {
        for _ in 0..6 {
            let index = self.next;
            self.next = (self.next + 1) % 6;
            let Some(front) = self.queues[index].front() else {
                continue;
            };
            if front.blocked {
                continue;
            }
            // A known install waits only for its finite earlier base-source
            // frontier. New acquisitions park outside the SQL attempt; existing
            // reads/releases use other classes and remain runnable.
            if index == ServiceClass::Source as usize
                && self.queues[ServiceClass::Capture as usize]
                    .iter()
                    .any(|job| job.command.install_capture().is_some() && job.id < front.id)
            {
                continue;
            }
            if front.command.install_capture().is_some()
                && self.queues[ServiceClass::Source as usize]
                    .iter()
                    .any(|job| job.id < front.id)
            {
                continue;
            }
            // Drain only the finite pre-capture mutation/reply frontier. Later
            // writes cannot keep extending its pending-publication domain.
            if index == ServiceClass::Mutation as usize
                && self.queues[ServiceClass::Capture as usize]
                    .iter()
                    .any(|job| {
                        matches!(job.command, Command::Capture)
                            && !job.wait_consolidation
                            && job.id < front.id
                    })
            {
                continue;
            }
            if matches!(front.command, Command::Capture)
                && self.queues[ServiceClass::Mutation as usize]
                    .iter()
                    .any(|job| job.id < front.id)
            {
                continue;
            }
            return self.queues[index].pop_front();
        }
        None
    }
}
pub(crate) struct State {
    pub lane: Lane,
    pub stopping: bool,
    pub opened: bool,
    pub next: u64,
    pub work: OwnerWork,
    pub event: u64,
    pub maintenance_error: Option<Arc<layerfs_overlay::OverlayError>>,
    /// The connection is taken for one turn: a job or a maintenance step,
    /// on the owner thread or on the thread that submitted the job.
    pub busy: bool,
    /// Jobs served since the owner thread's last maintenance turn.
    pub served: u8,
    /// The connection reported possible maintenance work after a turn.
    pub maintenance: bool,
}
impl State {
    /// Possible maintenance has waited for the owner thread's bound of turns.
    pub fn maintenance_due(&self) -> bool {
        self.maintenance && self.served >= 8
    }
    /// One Workspace connection; rotate only between its job classes.
    pub fn take(&mut self) -> Option<Box<Job>> {
        let job = self.lane.take()?;
        self.work.queued -= 1;
        Some(job)
    }
    pub fn queued(&mut self) {
        self.work.queued += 1;
        self.work.peak_queued = self.work.peak_queued.max(self.work.queued);
    }
    /// Returns one queued, executing or retained completion slot.
    pub fn release(&mut self, class: ServiceClass) {
        *self.lane.slots(class) -= 1;
    }
}
pub(crate) struct Shared {
    pub state: Box<Mutex<State>>,
    pub wake: Condvar,
    pub config: OwnerConfig,
    pub admission: Arc<super::admission::Notifications>,
    pub budget: Arc<super::budget::Budget>,
    pub backing: OnceLock<Arc<super::backing::Backing>>,
    _fixed: super::budget::FixedCredit,
    pub close_error: Mutex<Option<OwnerError>>,
    pub initial: Mutex<Option<Arc<layerfs_overlay::CreationWork>>>,
    /// The one engine connection. `State::busy` grants a turn before this
    /// lock is taken, so the lock itself is never waited for in service.
    pub connection: Mutex<Option<Box<Overlay>>>,
    /// The panic of a turn taken by a submitting thread.
    pub panic: Mutex<Option<Box<dyn Any + Send>>>,
    /// The engine's reply tickets, set once with the connection.
    pub tickets: OnceLock<Arc<layerfs_overlay::ReplyTickets>>,
}
impl Shared {
    pub fn job_capacity(&self, class: ServiceClass, work: &OwnerWork) -> usize {
        let _ = work;
        self.budget.capacity(class)
    }
    /// Startup scheduler bytes for a configuration, before any is allocated.
    pub fn planned_bytes(config: OwnerConfig) -> Option<usize> {
        config
            .jobs_per_namespace
            .checked_mul(5)?
            .checked_add(config.lifecycle_jobs_per_namespace)?
            .checked_mul(size_of::<Box<Job>>())?
            .checked_add(size_of::<Self>() + size_of::<State>() + 256)
    }
    pub fn sql_progress(
        &self,
        work: layerfs_overlay::DatabaseWork,
        allocation: layerfs_overlay::AllocationWork,
        payload: layerfs_overlay::PayloadWork,
        maintenance: bool,
    ) {
        if let Ok(mut state) = self.state.lock() {
            if maintenance {
                state.work.sql_maintenance.accumulate(work);
                state.work.payload_maintenance.accumulate(payload);
                state.work.allocation_maintenance.accumulate(allocation);
            } else {
                state.work.sql_foreground.accumulate(work);
                state.work.payload_foreground.accumulate(payload);
                state.work.allocation_foreground.accumulate(allocation);
            }
        }
    }
    pub fn new(
        config: OwnerConfig,
        budget: Arc<super::budget::Budget>,
        backing: Option<Arc<super::backing::Backing>>,
    ) -> Result<Self, OwnerError> {
        let fixed =
            budget.fixed(Self::planned_bytes(config).ok_or(OwnerError::InvalidAdmission)?)?;
        let lane = Lane::new(config);
        let scheduler_bytes = size_of::<Self>()
            + size_of::<State>()
            + 256
            + lane
                .queues
                .iter()
                .map(|q| q.capacity() * size_of::<Box<Job>>())
                .sum::<usize>();
        Ok(Self {
            state: Box::new(Mutex::new(State {
                lane,
                stopping: false,
                opened: false,
                next: 1,
                work: OwnerWork {
                    scheduler_bytes,
                    ..OwnerWork::default()
                },
                event: 0,
                maintenance_error: None,
                busy: false,
                served: 0,
                maintenance: false,
            })),
            wake: Condvar::new(),
            config,
            admission: budget.notifications.clone(),
            budget,
            backing: backing.map_or_else(OnceLock::new, OnceLock::from),
            _fixed: fixed,
            close_error: Mutex::new(None),
            initial: Mutex::new(None),
            connection: Mutex::new(None),
            panic: Mutex::new(None),
            tickets: OnceLock::new(),
        })
    }
    pub fn scheduler_bytes(&self) -> usize {
        self.state
            .lock()
            .map_or(usize::MAX, |state| state.work.scheduler_bytes)
    }
    pub fn connection(&self) -> MutexGuard<'_, Option<Box<Overlay>>> {
        self.connection
            .lock()
            .unwrap_or_else(|poison| poison.into_inner())
    }
    /// The owner thread's next turn: it waits out a turn taken by a
    /// submitting thread, then takes the connection with the next runnable
    /// job, if any. The flag says a maintenance turn is due first.
    pub fn poll(&self) -> Option<(Option<Box<Job>>, u64, bool)> {
        let mut state = self.state.lock().ok()?;
        loop {
            if state.stopping {
                return None;
            }
            if !state.busy {
                break;
            }
            state = self.wake.wait(state).ok()?;
        }
        state.busy = true;
        let job = state.take();
        let due = state.served >= 8 || job.is_none();
        if due {
            state.served = 0;
            state.maintenance = false;
        }
        Some((job, state.event, due))
    }
    /// Ends a turn. The owner thread is woken only for work it must do: a
    /// queued job, or maintenance the connection reported as possible.
    pub fn idle(&self, maintenance: bool, owner: bool) {
        let Ok(mut state) = self.state.lock() else {
            return;
        };
        state.busy = false;
        // After a maintenance error no further turn is attempted.
        state.maintenance |= maintenance && state.maintenance_error.is_none();
        let wanted = state.work.queued != 0 || state.maintenance;
        drop(state);
        if wanted && !owner {
            self.wake.notify_all();
        }
    }
    /// Ends a submitting thread's job. While `combine` allows it, the turn
    /// passes to the next runnable job queued meanwhile and stays with that
    /// thread; otherwise the turn ends as `idle` ends it. Maintenance that
    /// is due is never held back by a combined job.
    pub fn pass(&self, maintenance: bool, combine: bool) -> Option<Box<Job>> {
        let Ok(mut state) = self.state.lock() else {
            return None;
        };
        state.maintenance |= maintenance && state.maintenance_error.is_none();
        if combine && !state.stopping && !state.maintenance_due() {
            if let Some(job) = state.take() {
                return Some(job);
            }
        }
        state.busy = false;
        let wanted = state.work.queued != 0 || state.maintenance;
        drop(state);
        if wanted {
            self.wake.notify_all();
        }
        None
    }
    pub fn wait(&self, event: u64) {
        let Ok(mut state) = self.state.lock() else {
            return;
        };
        while !state.stopping && state.event == event {
            let Ok(next) = self.wake.wait(state) else {
                return;
            };
            state = next;
        }
    }
    pub fn maintenance(&self, step: layerfs_overlay::ReclaimStep, ns: u64) {
        if let Ok(mut state) = self.state.lock() {
            state.event = state.event.wrapping_add(1);
            for job in &mut state.lane.queues[ServiceClass::Capture as usize] {
                job.blocked = false;
            }
            state.work.maintenance_jobs = state.work.maintenance_jobs.saturating_add(1);
            state.work.maintenance_rows = state.work.maintenance_rows.saturating_add(step.rows);
            state.work.maintenance_data_bytes = state
                .work
                .maintenance_data_bytes
                .saturating_add(step.data_bytes);
            state.work.maintenance_ns = state.work.maintenance_ns.saturating_add(ns);
        }
    }
    pub fn maintenance_failed(&self, error: layerfs_overlay::OverlayError) {
        if let Ok(mut state) = self.state.lock() {
            state.maintenance_error = Some(Arc::new(error));
            state.maintenance = false;
        }
    }
    pub fn panic(&self, payload: Box<dyn Any + Send>) {
        let mut panic = self.panic.lock().unwrap_or_else(|p| p.into_inner());
        panic.get_or_insert(payload);
    }
    pub fn panicked(&self) -> Option<Box<dyn Any + Send>> {
        self.panic.lock().unwrap_or_else(|p| p.into_inner()).take()
    }
    pub fn stopped(&self) -> bool {
        self.state.lock().map_or(true, |state| state.stopping)
    }
    /// Requeues a job whose readiness check found it not yet runnable. A job
    /// which can no longer wait gets its original command back unattempted.
    pub fn park(&self, mut job: Box<Job>) {
        if let Ok(mut state) = self.state.lock() {
            let stopping = state.stopping;
            if !stopping {
                job.work.parked_turns = job.work.parked_turns.saturating_add(1);
                job.blocked = true;
                state.lane.queues[job.command.class() as usize].push_front(job);
                state.queued();
                return;
            }
        }
        // The outcome and its credit are released outside the queue lock.
        job.refuse(OwnerError::Stopped);
    }
    pub fn progress(&self, class: ServiceClass, wait: u64, service: u64) {
        if let Ok(mut state) = self.state.lock() {
            state.event = state.event.wrapping_add(1);
            state.served = state.served.saturating_add(1);
            let work = &mut state.work;
            work.completed[class as usize] = work.completed[class as usize].saturating_add(1);
            work.queue_wait_ns[class as usize] =
                work.queue_wait_ns[class as usize].saturating_add(wait);
            work.service_ns[class as usize] =
                work.service_ns[class as usize].saturating_add(service);
            if matches!(class, ServiceClass::Mutation | ServiceClass::Lifecycle) {
                for job in &mut state.lane.queues[ServiceClass::Capture as usize] {
                    job.blocked = false;
                }
            }
        }
    }
    /// A last reply wakes before-effect capture readiness without a SQL job.
    pub fn replies_settled(&self) {
        if let Ok(mut state) = self.state.lock() {
            state.event = state.event.wrapping_add(1);
            for job in &mut state.lane.queues[ServiceClass::Capture as usize] {
                if !job.wait_consolidation {
                    job.blocked = false;
                }
            }
        }
        self.wake.notify_all();
    }
    pub fn stop(&self) {
        let jobs = if let Ok(mut state) = self.state.lock() {
            state.stopping = true;
            state.event = state.event.wrapping_add(1);
            state.work.queued = 0;
            state
                .lane
                .queues
                .iter_mut()
                .flat_map(|q| q.drain(..))
                .collect::<Vec<_>>()
        } else {
            Vec::new()
        };
        // Publish outcomes and drop retained credits outside the queue lock.
        for job in jobs {
            job.refuse(OwnerError::Stopped);
        }
        self.admission.notify();
        self.wake.notify_all();
    }
}

impl OwnerWork {
    /// Adds disjoint owner counters. Concurrent snapshots retain their own
    /// scope; a sum of observed peaks is not a simultaneous physical peak.
    pub(crate) fn accumulate(&mut self, next: &Self) {
        self.sql_foreground.accumulate(next.sql_foreground);
        self.sql_maintenance.accumulate(next.sql_maintenance);
        self.payload_foreground.accumulate(next.payload_foreground);
        self.payload_maintenance
            .accumulate(next.payload_maintenance);
        self.allocation_foreground
            .accumulate(next.allocation_foreground);
        self.allocation_maintenance
            .accumulate(next.allocation_maintenance);
        for class in 0..6 {
            self.completed[class] = self.completed[class].saturating_add(next.completed[class]);
            self.queue_wait_ns[class] =
                self.queue_wait_ns[class].saturating_add(next.queue_wait_ns[class]);
            self.service_ns[class] = self.service_ns[class].saturating_add(next.service_ns[class]);
        }
        self.admitted = self.admitted.saturating_add(next.admitted);
        self.credited_bytes = self.credited_bytes.saturating_add(next.credited_bytes);
        self.peak_credited_bytes = self
            .peak_credited_bytes
            .saturating_add(next.peak_credited_bytes);
        self.outstanding = self.outstanding.saturating_add(next.outstanding);
        self.scheduler_bytes = self.scheduler_bytes.saturating_add(next.scheduler_bytes);
        self.queued = self.queued.saturating_add(next.queued);
        self.peak_queued = self.peak_queued.saturating_add(next.peak_queued);
        self.receipt_overruns = self.receipt_overruns.saturating_add(next.receipt_overruns);
        self.receipt_overrun_bytes = self
            .receipt_overrun_bytes
            .saturating_add(next.receipt_overrun_bytes);
        self.maintenance_jobs = self.maintenance_jobs.saturating_add(next.maintenance_jobs);
        self.maintenance_rows = self.maintenance_rows.saturating_add(next.maintenance_rows);
        self.closed_namespaces = self
            .closed_namespaces
            .saturating_add(next.closed_namespaces);
        self.maintenance_data_bytes = self
            .maintenance_data_bytes
            .saturating_add(next.maintenance_data_bytes);
        self.maintenance_ns = self.maintenance_ns.saturating_add(next.maintenance_ns);
    }
}
