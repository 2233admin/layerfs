//! The Store's publication lane: one connection turn and, on Linux, the
//! cooperative writer lock, held by one thread across a short read-decide-write
//! sequence. Its own SQL work runs as ordinary transactions inside the held
//! turn; no other publication of any process can interleave.
use super::{admission::WINDOW, connection::Session, writer_admission::Writer};
use crate::backend::records::BackendError;
use std::{marker::PhantomData, sync::Arc, time::Instant};

/// A held lane; dropping it releases the writer lock, then the turn.
pub struct LaneHold {
    session: Arc<Session>,
    writer: Option<Writer>,
    // The hold belongs to the thread that took it.
    _thread: PhantomData<*const ()>,
}

impl Session {
    /// Waits, bounded by the admission window, for the lane. A wait is
    /// readiness, not a retry: nothing has been attempted before it is held.
    pub(crate) fn hold_lane(self: &Arc<Self>) -> Result<LaneHold, BackendError> {
        if !self.writable {
            return Err(BackendError::ReadOnly);
        }
        let deadline = Instant::now() + WINDOW;
        let turn = self.admission.enter(deadline)?;
        if turn.nested {
            return Err(BackendError::Integrity);
        }
        let writer = Writer::acquire(&self.path, deadline)?;
        turn.hold()?;
        Ok(LaneHold {
            session: self.clone(),
            writer: Some(writer),
            _thread: PhantomData,
        })
    }
}

impl Drop for LaneHold {
    fn drop(&mut self) {
        if let Some(writer) = self.writer.take() {
            if let Err(retained) = writer.release() {
                // As a failed per-job release: keep the lock, refuse later work.
                if let Ok(mut state) = self.session.state.lock() {
                    state.quarantined = true;
                    state.writer_hold = Some(retained);
                }
            }
        }
        self.session.admission.release_hold();
    }
}
