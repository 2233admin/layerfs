//! Closed template and a bounded roster of independently served Workspace files.
use super::{
    backing::Backing,
    budget::{Budget, JobPermit},
    commands::{Command, Response},
    credits::Credit,
    owner::{Owner, OwnerClient, OwnerConfig, OwnerError},
    queue::{OwnerWork, Shared},
};
use crate::service::completion::{self, Outcome, Pending};
use layerfs_overlay::{Overlay, ProfileConfig, Resources, Route};
use std::{
    collections::BTreeMap,
    path::{Path, PathBuf},
    sync::{atomic::AtomicUsize, Arc, Mutex, Weak},
    time::Instant,
};

enum Slot {
    Starting([u8; 32]),
    Live {
        owner: Arc<Mutex<Option<Owner>>>,
        incarnation: [u8; 32],
    },
    Retiring {
        backing: Weak<Backing>,
        incarnation: [u8; 32],
    },
    Failed {
        cause: Arc<OwnerError>,
        incarnation: [u8; 32],
    },
}
enum CleanupTarget {
    Client(OwnerClient),
    Queued,
    Gone,
}
struct State {
    slots: BTreeMap<i64, Slot>,
    next: i64,
    stopping: bool,
    retired: OwnerWork,
}

pub(crate) struct Workspaces {
    template: PathBuf,
    profile: ProfileConfig,
    config: OwnerConfig,
    shared: Arc<Shared>,
    template_resources: Resources,
    state: Mutex<State>,
}

pub(super) fn start(path: &Path, profile: ProfileConfig, config: OwnerConfig) -> crate::OwnerStart {
    let started = Instant::now();
    let mut startup = Arc::new(layerfs_overlay::CreationWork::default());
    let mut reported = false;
    let result = (|| {
        if config.namespaces == 0
            || config.jobs_per_namespace == 0
            || config.lifecycle_jobs_per_namespace == 0
            || profile.pager_kib == 0
        {
            return Err(OwnerError::InvalidAdmission);
        }
        let reserved = config
            .namespaces
            .checked_mul(config.lifecycle_jobs_per_namespace)
            .zip(Command::lifecycle_charge())
            .and_then(|(slots, charge)| slots.checked_mul(charge))
            .ok_or(OwnerError::InvalidAdmission)?;
        if reserved > config.lifecycle_reserve {
            return Err(OwnerError::InvalidAdmission);
        }
        let per_pager = (usize::try_from(profile.pager_kib)
            .map_err(|_| OwnerError::InvalidAdmission)?
            / config.namespaces)
            .max(4);
        let pager = per_pager
            .checked_mul(config.namespaces)
            .and_then(|n| n.checked_mul(1024))
            .ok_or(OwnerError::InvalidAdmission)?;
        let budget = Budget::new(config, pager)?;
        let shared = Arc::new(Shared::new(config, budget, None)?);
        let created = Overlay::create_observed(path, profile);
        startup = Arc::new(created.work);
        reported = true;
        let db = created.result.map_err(OwnerError::Overlay)?;
        let actual = db.profile().clone();
        let resources = db.resources(None).map_err(OwnerError::Overlay)?;
        let receipt = Arc::get_mut(&mut startup).expect("unshared startup receipt");
        receipt.sql = db.diagnostics();
        receipt.allocation = db.allocation_work();
        receipt.allocation_state = Some(Ok(resources.allocation));
        db.close_database().map_err(OwnerError::Overlay)?;
        let pool = Arc::new(Workspaces {
            template: path.to_owned(),
            profile,
            config,
            shared: shared.clone(),
            template_resources: resources,
            state: Mutex::new(State {
                slots: BTreeMap::new(),
                next: 1,
                stopping: false,
                retired: OwnerWork::default(),
            }),
        });
        Ok(Owner {
            pool: Some(pool.clone()),
            client: OwnerClient {
                shared,
                pool: Some(pool),
            },
            worker: None,
            profile: actual,
            startup: startup.clone(),
        })
    })();
    crate::OwnerStart {
        result,
        startup,
        creation_reported: reported,
        elapsed_ns: started.elapsed().as_nanos().min(u64::MAX as u128) as u64,
    }
}

impl Workspaces {
    pub fn client(&self, namespace: i64) -> Result<OwnerClient, OwnerError> {
        let state = self.state.lock().map_err(|_| OwnerError::Stopped)?;
        if state.stopping {
            return Err(OwnerError::Stopped);
        }
        match state.slots.get(&namespace) {
            Some(Slot::Live { owner, .. }) => owner
                .lock()
                .map_err(|_| OwnerError::Stopped)?
                .as_ref()
                .map(Owner::client)
                .ok_or(OwnerError::Stopped),
            Some(Slot::Failed { cause, .. }) => Err(OwnerError::Retained(cause.clone())),
            _ => Err(OwnerError::Overlay(layerfs_overlay::OverlayError::Stale)),
        }
    }
    fn fail(&self, namespace: i64, cause: OwnerError) -> OwnerError {
        let cause = Arc::new(cause);
        if let Ok(mut state) = self.state.lock() {
            let incarnation = match state.slots.get(&namespace) {
                Some(Slot::Starting(incarnation))
                | Some(Slot::Live { incarnation, .. })
                | Some(Slot::Retiring { incarnation, .. })
                | Some(Slot::Failed { incarnation, .. }) => *incarnation,
                None => [0; 32],
            };
            state.slots.insert(
                namespace,
                Slot::Failed {
                    cause: cause.clone(),
                    incarnation,
                },
            );
        }
        OwnerError::Retained(cause)
    }
    fn open(self: &Arc<Self>, incarnation: [u8; 32]) -> Result<OwnerClient, OwnerError> {
        if incarnation == [0; 32] {
            return Err(OwnerError::Overlay(layerfs_overlay::OverlayError::Invalid(
                "zero incarnation",
            )));
        }
        let namespace = {
            let mut state = self.state.lock().map_err(|_| OwnerError::Stopped)?;
            if state.stopping {
                return Err(OwnerError::Stopped);
            }
            if state.slots.values().any(|slot| match slot {
                Slot::Starting(stored)
                | Slot::Live {
                    incarnation: stored,
                    ..
                }
                | Slot::Retiring {
                    incarnation: stored,
                    ..
                }
                | Slot::Failed {
                    incarnation: stored,
                    ..
                } => *stored == incarnation,
            }) {
                return Err(OwnerError::Overlay(layerfs_overlay::OverlayError::Invalid(
                    "duplicate incarnation",
                )));
            }
            if state.slots.len() >= self.config.namespaces {
                return Err(OwnerError::AdmissionFull);
            }
            let namespace = state.next;
            state.next = namespace
                .checked_add(1)
                .ok_or(OwnerError::IdentityExhausted)?;
            state.slots.insert(namespace, Slot::Starting(incarnation));
            namespace
        };
        let config = OwnerConfig {
            namespaces: 1,
            ..self.config
        };
        // Divide one declared allowance. The minimum one-KiB suggestion is
        // subject to the shared ledger and existing configured admission.
        let divisor = u32::try_from(self.config.namespaces).unwrap_or(u32::MAX);
        let profile = ProfileConfig {
            pager_kib: (self.profile.pager_kib / divisor).max(4),
            ..self.profile
        };
        let path = self
            .template
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .join(format!("{namespace}.sqlite"));
        let shared = match Shared::new(config, self.shared.budget.clone(), None) {
            Ok(shared) => Arc::new(shared),
            Err(cause) => {
                if let Ok(mut state) = self.state.lock() {
                    state.slots.remove(&namespace);
                }
                return Err(cause);
            }
        };
        let owner = match Owner::start_copy(
            &path,
            &self.template,
            namespace,
            profile,
            config,
            shared.clone(),
        )
        .result
        {
            Ok(owner) => owner,
            Err(cause) => return Err(self.fail(namespace, cause)),
        };
        let backing = match Backing::new(path, namespace, incarnation, Arc::downgrade(self)) {
            Ok(backing) => Arc::new(backing),
            Err(cause) => return Err(self.fail(namespace, OwnerError::Io(cause))),
        };
        let _ = shared.backing.set(backing);
        let client = owner.client();
        self.state
            .lock()
            .map_err(|_| OwnerError::Stopped)?
            .slots
            .insert(
                namespace,
                Slot::Live {
                    owner: Arc::new(Mutex::new(Some(owner))),
                    incarnation,
                },
            );
        Ok(client)
    }
    pub fn submit(
        self: &Arc<Self>,
        root: &OwnerClient,
        route: Option<Route>,
        command: Command,
    ) -> Result<Pending, (OwnerError, Command)> {
        if let Some(route) = route {
            return match self.client(route.namespace()) {
                Ok(client) => client.try_submit(Some(route), command),
                Err(cause) => Err((cause, command)),
            };
        }
        match &command {
            Command::Open { incarnation, .. } => {
                let Some(bytes) = command.charge() else {
                    return Err((OwnerError::InvalidAdmission, command));
                };
                let permit = match JobPermit::acquire(&self.shared.budget, bytes, command.class()) {
                    Ok(permit) => permit,
                    Err(cause) => return Err((cause, command)),
                };
                match self.open(*incarnation) {
                    Ok(client) => client.submit_leaf(None, command, Some(permit)),
                    Err(cause) => Err((cause, command)),
                }
            }
            Command::ObserveCleanup {
                namespace,
                incarnation,
            } => {
                let result = self.cleanup(*namespace, *incarnation);
                match result {
                    Ok(CleanupTarget::Client(client)) => client.try_submit(None, command),
                    Ok(CleanupTarget::Gone) => self.immediate(root, command, || Outcome {
                        result: Ok(Response::CleanupState(layerfs_overlay::CleanupState::Gone)),
                        work: crate::JobWork::default(),
                    }),
                    Ok(CleanupTarget::Queued) => self.immediate(root, command, || Outcome {
                        result: Ok(Response::CleanupState(
                            layerfs_overlay::CleanupState::Queued,
                        )),
                        work: crate::JobWork::default(),
                    }),
                    Err(cause) => Err((cause, command)),
                }
            }
            Command::Resources { global: true } => self.immediate(root, command, || {
                let mut work = crate::JobWork::default();
                let result = self
                    .resources(&mut work)
                    .map(|resources| Response::Resources(Box::new(resources)));
                Outcome { result, work }
            }),
            _ => Err((OwnerError::InvalidAdmission, command)),
        }
    }
    fn cleanup(&self, namespace: i64, incarnation: [u8; 32]) -> Result<CleanupTarget, OwnerError> {
        let state = self.state.lock().map_err(|_| OwnerError::Stopped)?;
        if state.stopping {
            return Err(OwnerError::Stopped);
        }
        if namespace <= 0 || namespace >= state.next || incarnation == [0; 32] {
            return Err(OwnerError::Overlay(layerfs_overlay::OverlayError::Stale));
        }
        match state.slots.get(&namespace) {
            Some(Slot::Live {
                owner,
                incarnation: stored,
            }) if *stored == incarnation => owner
                .lock()
                .map_err(|_| OwnerError::Stopped)?
                .as_ref()
                .map(Owner::client)
                .map(CleanupTarget::Client)
                .ok_or(OwnerError::Stopped),
            Some(Slot::Retiring {
                incarnation: stored,
                ..
            }) if *stored == incarnation => Ok(CleanupTarget::Queued),
            Some(Slot::Failed { cause, .. }) => Err(OwnerError::Retained(cause.clone())),
            None => Ok(CleanupTarget::Gone),
            _ => Err(OwnerError::Overlay(layerfs_overlay::OverlayError::Stale)),
        }
    }
    fn immediate(
        &self,
        root: &OwnerClient,
        command: Command,
        result: impl FnOnce() -> Outcome,
    ) -> Result<Pending, (OwnerError, Command)> {
        let Some(bytes) = command.charge() else {
            return Err((OwnerError::InvalidAdmission, command));
        };
        let class = command.class();
        let mut state = match root.shared.state.lock() {
            Ok(state) => state,
            Err(_) => return Err((OwnerError::Stopped, command)),
        };
        if state.stopping {
            return Err((OwnerError::Stopped, command));
        }
        if *state.lane.slots(class) >= root.shared.config.lifecycle_jobs_per_namespace {
            return Err((OwnerError::AdmissionFull, command));
        }
        if let Err(cause) = root.shared.budget.acquire(bytes, class) {
            return Err((cause, command));
        }
        *state.lane.slots(class) += 1;
        state.work.credited_bytes += bytes;
        state.work.peak_credited_bytes = state
            .work
            .peak_credited_bytes
            .max(state.work.credited_bytes);
        state.work.outstanding += 1;
        state.work.admitted = state.work.admitted.saturating_add(1);
        state.work.completed[class as usize] =
            state.work.completed[class as usize].saturating_add(1);
        drop(state);
        let (publisher, pending) = completion::admit(Credit {
            shared: Arc::downgrade(&root.shared),
            bytes: AtomicUsize::new(bytes),
            class,
            budget: root.shared.budget.clone(),
            _backing: None,
        });
        let started = Instant::now();
        let mut outcome = result();
        outcome.work.service_ns = started.elapsed().as_nanos().min(u64::MAX as u128) as u64;
        publisher.publish(Box::new(outcome));
        Ok(pending)
    }
    fn clients(&self) -> Result<Vec<OwnerClient>, OwnerError> {
        let state = self.state.lock().map_err(|_| OwnerError::Stopped)?;
        state
            .slots
            .values()
            .filter_map(|slot| match slot {
                Slot::Live { owner, .. } => Some(
                    owner
                        .lock()
                        .map_err(|_| OwnerError::Stopped)
                        .and_then(|owner| {
                            owner.as_ref().map(Owner::client).ok_or(OwnerError::Stopped)
                        }),
                ),
                _ => None,
            })
            .collect()
    }
    fn resources(&self, work: &mut crate::JobWork) -> Result<Resources, OwnerError> {
        {
            let state = self.state.lock().map_err(|_| OwnerError::Stopped)?;
            if let Some(cause) = state.slots.values().find_map(|slot| match slot {
                Slot::Failed { cause, .. } => Some(cause.clone()),
                _ => None,
            }) {
                return Err(OwnerError::Retained(cause));
            }
        }
        let mut resources = self.template_resources;
        for client in self.clients()? {
            let done = client
                .try_submit(None, Command::Resources { global: true })
                .map_err(|(cause, command)| OwnerError::Unattempted {
                    cause: Box::new(cause),
                    command: Box::new(command),
                })?
                .wait()?;
            work.sql.accumulate(&done.work().sql.expanded());
            work.allocation.accumulate(done.work().allocation);
            work.payload.accumulate(done.work().payload);
            match done.result() {
                Ok(Response::Resources(next)) => resources.accumulate(next),
                Err(_) => return Err(OwnerError::Observation(Box::new(done))),
                _ => return Err(OwnerError::InvalidAdmission),
            }
        }
        let retired = {
            let state = self.state.lock().map_err(|_| OwnerError::Stopped)?;
            state
                .slots
                .values()
                .filter_map(|slot| match slot {
                    Slot::Retiring { backing, .. } => backing.upgrade(),
                    _ => None,
                })
                .collect::<Vec<_>>()
        };
        for backing in retired {
            let metadata = std::fs::symlink_metadata(&backing.path).map_err(OwnerError::Io)?;
            resources.allocation.logical_bytes = resources
                .allocation
                .logical_bytes
                .saturating_add(metadata.len());
            #[cfg(unix)]
            {
                use std::os::unix::fs::MetadataExt;
                resources.allocation.allocated_bytes = resources
                    .allocation
                    .allocated_bytes
                    .saturating_add(metadata.blocks().saturating_mul(512));
            }
            resources.database_pages = resources
                .database_pages
                .saturating_add(metadata.len() / 4096);
        }
        Ok(resources)
    }
    pub fn diagnostics(&self) -> Result<OwnerWork, OwnerError> {
        let mut total = self.state.lock().map_err(|_| OwnerError::Stopped)?.retired;
        total.accumulate(
            &self
                .shared
                .state
                .lock()
                .map_err(|_| OwnerError::Stopped)?
                .work,
        );
        for client in self.clients()? {
            let mut work = client.diagnostics()?;
            // The pool's terminal count is the successful file deletion, not
            // reclamation of a namespace row inside a private connection.
            work.closed_namespaces = 0;
            total.accumulate(&work);
        }
        let budget = self.shared.budget.diagnostics();
        total.outstanding = budget.outstanding;
        total.credited_bytes = budget.job_bytes;
        total.peak_credited_bytes = budget.peak_job_bytes;
        total.scheduler_bytes = budget.fixed_bytes;
        Ok(total)
    }
    pub fn maintenance_failure(
        &self,
    ) -> Result<Option<Arc<layerfs_overlay::OverlayError>>, OwnerError> {
        for client in self.clients()? {
            if let Some(cause) = client.maintenance_failure()? {
                return Ok(Some(cause));
            }
        }
        Ok(None)
    }
    pub fn retire(&self, namespace: i64) -> Result<(), OwnerError> {
        self.retire_with(namespace, true)
    }
    fn retire_with(&self, namespace: i64, terminal: bool) -> Result<(), OwnerError> {
        let owner = {
            let mut state = self.state.lock().map_err(|_| OwnerError::Stopped)?;
            let Some(Slot::Live { owner, incarnation }) = state.slots.get(&namespace) else {
                return Err(OwnerError::Stopped);
            };
            let incarnation = *incarnation;
            let owner = owner
                .lock()
                .map_err(|_| OwnerError::Stopped)?
                .take()
                .ok_or(OwnerError::Stopped)?;
            let backing = owner
                .client
                .shared
                .backing
                .get()
                .ok_or(OwnerError::Stopped)?
                .clone();
            if terminal {
                backing.terminal();
            }
            state.slots.insert(
                namespace,
                Slot::Retiring {
                    backing: Arc::downgrade(&backing),
                    incarnation,
                },
            );
            owner
        };
        let client = owner.client();
        let result = owner.stop();
        let mut observed = client.diagnostics()?;
        observed.outstanding = 0;
        observed.credited_bytes = 0;
        observed.queued = 0;
        observed.scheduler_bytes = 0;
        observed.closed_namespaces = 0;
        self.state
            .lock()
            .map_err(|_| OwnerError::Stopped)?
            .retired
            .accumulate(&observed);
        match result {
            Ok(()) => Ok(()),
            Err(cause) => Err(self.fail(namespace, cause)),
        }
    }
    pub fn deleted(&self, namespace: i64, _incarnation: [u8; 32], result: std::io::Result<()>) {
        if let Ok(mut state) = self.state.lock() {
            match result {
                Ok(()) => {
                    state.slots.remove(&namespace);
                    state.retired.closed_namespaces =
                        state.retired.closed_namespaces.saturating_add(1);
                }
                Err(cause) => {
                    state.slots.insert(
                        namespace,
                        Slot::Failed {
                            cause: Arc::new(OwnerError::Io(cause)),
                            incarnation: _incarnation,
                        },
                    );
                }
            }
        }
        self.shared.admission.notify();
    }
    pub fn stop(&self) -> Result<(), OwnerError> {
        let namespaces = {
            let mut state = self.state.lock().map_err(|_| OwnerError::Stopped)?;
            if state.stopping {
                return Ok(());
            }
            state.stopping = true;
            state
                .slots
                .iter()
                .filter_map(|(namespace, slot)| {
                    matches!(slot, Slot::Live { .. }).then_some(*namespace)
                })
                .collect::<Vec<_>>()
        };
        self.shared.stop();
        let mut first = None;
        for namespace in namespaces {
            if let Err(cause) = self.retire_with(namespace, false) {
                first.get_or_insert(cause);
            }
        }
        match first {
            Some(cause) => Err(cause),
            None => Ok(()),
        }
    }
}
