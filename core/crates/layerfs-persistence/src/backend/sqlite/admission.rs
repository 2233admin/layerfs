//! Bounded FIFO connection ownership before a single SQL attempt.
use crate::backend::records::BackendError;
use std::{
    collections::VecDeque,
    sync::{Condvar, Mutex},
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
}

#[derive(Default)]
pub(crate) struct Admission {
    queue: Mutex<Queue>,
    changed: Condvar,
}

pub(crate) struct Turn<'a>(&'a Admission);

impl Admission {
    pub(crate) fn enter(&self, deadline: Instant) -> Result<Turn<'_>, BackendError> {
        let mut queue = self.queue.lock().map_err(|_| BackendError::Unknown)?;
        if Instant::now() >= deadline {
            return Err(BackendError::Busy);
        }
        if !queue.active && queue.pending.is_empty() {
            queue.active = true;
            return Ok(Turn(self));
        }
        if queue.pending.len() == WAITERS {
            return Err(BackendError::Capacity);
        }
        let ticket = queue.next;
        queue.next = queue.next.checked_add(1).ok_or(BackendError::Capacity)?;
        queue.pending.push_back(ticket);
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
                return Ok(Turn(self));
            }
            (queue, _) = self
                .changed
                .wait_timeout(queue, remaining)
                .map_err(|_| BackendError::Unknown)?;
        }
    }
}

impl Drop for Turn<'_> {
    fn drop(&mut self) {
        // The operation never owns this mutex while invoking a caller or SQL.
        // Even a poisoned queue is released; future admissions still refuse it.
        let mut queue = self
            .0
            .queue
            .lock()
            .unwrap_or_else(|error| error.into_inner());
        queue.active = false;
        self.0.changed.notify_all();
    }
}
