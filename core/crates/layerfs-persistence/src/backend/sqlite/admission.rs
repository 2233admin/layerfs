//! Bounded FIFO connection ownership before a single SQL attempt.
use crate::backend::records::BackendError;
use layerfs_telemetry::timer::waits::{self, Wait};
use std::{
    collections::VecDeque,
    sync::{Condvar, Mutex},
    thread::ThreadId,
    time::{Duration, Instant},
};

/// Operational admission budget, shared with Linux writer admission.
pub(crate) const WINDOW: Duration = Duration::from_secs(2);
// At most 8 KiB of queued ticket identifiers, independent of file/Save size.
const WAITERS: usize = 1024;

#[derive(Default)]
struct Queue {
    next: u64,
    active: bool,
    pending: VecDeque<u64>,
    /// The thread holding the publication lane: its own nested SQL work runs
    /// inside the turn it already owns instead of queueing behind itself.
    holder: Option<ThreadId>,
}

/// Adds a queued entry's wait to the thread's total on every exit.
struct Waited(Instant, Wait);
impl Drop for Waited {
    fn drop(&mut self) {
        waits::add(self.1, self.0.elapsed());
    }
}

#[derive(Default)]
pub(crate) struct Admission {
    queue: Mutex<Queue>,
    changed: Condvar,
}

pub(crate) struct Turn<'a> {
    admission: &'a Admission,
    /// Work by the lane holder inside its held turn; releasing it is the hold's.
    pub(crate) nested: bool,
}

impl Admission {
    /// Waits for this connection's turn, bounded by `deadline`. Time spent
    /// queued is added to the calling thread's wait total for `kind`.
    pub(crate) fn enter(&self, deadline: Instant, kind: Wait) -> Result<Turn<'_>, BackendError> {
        let mut queue = self.queue.lock().map_err(|_| BackendError::Unknown)?;
        if queue.holder == Some(std::thread::current().id()) {
            return Ok(Turn {
                admission: self,
                nested: true,
            });
        }
        if Instant::now() >= deadline {
            return Err(BackendError::Busy);
        }
        if !queue.active && queue.pending.is_empty() {
            queue.active = true;
            return Ok(Turn {
                admission: self,
                nested: false,
            });
        }
        if queue.pending.len() == WAITERS {
            return Err(BackendError::Capacity);
        }
        let ticket = queue.next;
        queue.next = queue.next.checked_add(1).ok_or(BackendError::Capacity)?;
        queue.pending.push_back(ticket);
        let queued = Instant::now();
        let _waited = Waited(queued, kind);
        loop {
            let remaining = deadline.saturating_duration_since(Instant::now());
            if remaining.is_zero() {
                if let Some(index) = queue.pending.iter().position(|value| *value == ticket) {
                    queue.pending.remove(index);
                }
                self.changed.notify_all();
                return Err(BackendError::Busy);
            }
            if !queue.active && queue.pending.front() == Some(&ticket) {
                queue.pending.pop_front();
                queue.active = true;
                return Ok(Turn {
                    admission: self,
                    nested: false,
                });
            }
            (queue, _) = self
                .changed
                .wait_timeout(queue, remaining)
                .map_err(|_| BackendError::Unknown)?;
        }
    }
}

impl Turn<'_> {
    /// Keeps this turn for the calling thread until `release_hold`: its later
    /// SQL work enters as nested turns, and every other caller queues.
    pub(crate) fn hold(self) -> Result<(), BackendError> {
        let mut queue = self
            .admission
            .queue
            .lock()
            .map_err(|_| BackendError::Unknown)?;
        queue.holder = Some(std::thread::current().id());
        drop(queue);
        std::mem::forget(self);
        Ok(())
    }
}

impl Admission {
    /// Ends a turn kept by `Turn::hold`.
    pub(crate) fn release_hold(&self) {
        let mut queue = self.queue.lock().unwrap_or_else(|error| error.into_inner());
        queue.holder = None;
        queue.active = false;
        self.changed.notify_all();
    }
}

impl Drop for Turn<'_> {
    fn drop(&mut self) {
        if self.nested {
            return;
        }
        // The operation never owns this mutex while invoking a caller or SQL.
        // Even a poisoned queue is released; future admissions still refuse it.
        let mut queue = self
            .admission
            .queue
            .lock()
            .unwrap_or_else(|error| error.into_inner());
        queue.active = false;
        self.admission.changed.notify_all();
    }
}
