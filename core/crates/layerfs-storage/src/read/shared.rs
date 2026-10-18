//! One opened Store's bounded tier of whole pack bodies, shared by its readers
//! (#359 warm daemon).
//!
//! A reader consults it only after its own kept caches miss, and fills it only
//! from a whole body it acquired and whose frame it validated. Pack ids come
//! from a counter that never goes back and published packs never change, so a
//! kept body stays valid for as long as the Store is open; every object read
//! from it is still authenticated by the reader, as from a fresh read. It
//! keeps only what was read, never an absence. The lock is held for one map
//! step: bodies are copied outside it, and no Store I/O happens under it.
use crate::{
    error::{StorageError, StorageResult},
    location::PackInfo,
};
use std::{
    collections::{HashMap, VecDeque},
    sync::{Arc, Mutex, PoisonError},
};

/// Actual work of one tier over its Store's lifetime.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct SharedPackWork {
    /// Bodies handed out.
    pub hits: u64,
    /// Lookups that found no body.
    pub misses: u64,
    /// Bodies kept.
    pub inserts: u64,
    /// Bodies evicted for the budget, and their bytes.
    pub evictions: u64,
    /// Bytes of the evicted bodies.
    pub evicted_bytes: u64,
    /// Body bytes kept now.
    pub bytes: usize,
    /// Bodies kept now.
    pub entries: usize,
}

struct Entry {
    info: PackInfo,
    body: Arc<[u8]>,
    referenced: bool,
}
#[derive(Default)]
struct State {
    entries: HashMap<i64, Entry>,
    /// Second-chance (clock) order of the kept ids.
    order: VecDeque<i64>,
    closed: bool,
    work: SharedPackWork,
}

/// Whole pack bodies kept for every reader of one Store, at most `budget`
/// bytes; [`SharedPacks::close`] empties it for good.
pub struct SharedPacks {
    budget: usize,
    state: Mutex<State>,
}
impl SharedPacks {
    /// An empty tier that keeps at most `budget` body bytes.
    pub fn new(budget: usize) -> Arc<Self> {
        Arc::new(Self {
            budget,
            state: Mutex::default(),
        })
    }
    fn lock(&self) -> std::sync::MutexGuard<'_, State> {
        // Every step leaves the maps consistent, so a poisoned lock is usable.
        self.state.lock().unwrap_or_else(PoisonError::into_inner)
    }
    /// The kept body of pack `id` and the descriptor it was validated under.
    pub fn get(&self, id: i64) -> Option<(PackInfo, Arc<[u8]>)> {
        let mut state = self.lock();
        if state.closed {
            return None;
        }
        let found = state.entries.get_mut(&id).map(|entry| {
            entry.referenced = true;
            (entry.info, entry.body.clone())
        });
        match found {
            Some(_) => state.work.hits += 1,
            None => state.work.misses += 1,
        }
        found
    }
    /// Keeps one validated whole body. A body over the budget is not kept; a
    /// body already kept must carry the same descriptor and bytes.
    pub fn insert(&self, info: PackInfo, body: &[u8]) -> StorageResult<()> {
        if body.len() > self.budget || info.length != body.len() {
            return Ok(());
        }
        if let Some((kept, bytes)) = self.peek(info.pack_id) {
            return if kept == info && *bytes == *body {
                Ok(())
            } else {
                Err(StorageError::Integrity("shared pack body differs"))
            };
        }
        let body: Arc<[u8]> = Arc::from(body);
        let mut state = self.lock();
        if state.closed || state.entries.contains_key(&info.pack_id) {
            return Ok(());
        }
        while state.work.bytes + body.len() > self.budget {
            let Some(id) = state.order.pop_front() else {
                break;
            };
            let second = state
                .entries
                .get_mut(&id)
                .is_some_and(|entry| std::mem::replace(&mut entry.referenced, false));
            if second {
                state.order.push_back(id);
            } else if let Some(entry) = state.entries.remove(&id) {
                state.work.bytes -= entry.body.len();
                state.work.evictions += 1;
                state.work.evicted_bytes += entry.body.len() as u64;
            }
        }
        state.work.bytes += body.len();
        state.work.inserts += 1;
        state.order.push_back(info.pack_id);
        state.entries.insert(
            info.pack_id,
            Entry {
                info,
                body,
                referenced: false,
            },
        );
        state.work.entries = state.entries.len();
        Ok(())
    }
    fn peek(&self, id: i64) -> Option<(PackInfo, Arc<[u8]>)> {
        let state = self.lock();
        let entry = state.entries.get(&id)?;
        Some((entry.info, entry.body.clone()))
    }
    /// Empties the tier when its Store closes; later reads and fills pass by it.
    pub fn close(&self) {
        let mut state = self.lock();
        state.closed = true;
        state.entries.clear();
        state.order.clear();
        state.work.bytes = 0;
        state.work.entries = 0;
    }
    /// Lifetime work and what is kept now.
    pub fn work(&self) -> SharedPackWork {
        self.lock().work
    }
}
