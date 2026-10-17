//! Plans of recent Commit differences, kept for their later pages (#352 F-012).
//!
//! A difference's plan (its changed entries) depends only on its two immutable
//! roots, so a page of the same two roots reuses it instead of planning the
//! whole difference again. At most [`PLANS`] plans are kept, least recently
//! used first out; each is bounded by Content's `MAXIMUM_CHANGED`, beyond which
//! a difference takes the full walk and keeps no plan. A plan that was let go
//! is made again by the page that needs it.

use layerfs_content::compare::Plan;
use layerfs_content::ObjectId;
use std::sync::{Arc, Mutex};

/// Plans kept at once.
pub(crate) const PLANS: usize = 4;

type Key = (ObjectId, ObjectId);

static RECENT: Mutex<Vec<(Key, Arc<Plan>)>> = Mutex::new(Vec::new());

/// The kept plan of `key`, now the most recently used.
pub(crate) fn find(key: Key) -> Option<Arc<Plan>> {
    let mut recent = RECENT
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    let index = recent.iter().position(|(kept, _)| *kept == key)?;
    let entry = recent.remove(index);
    let plan = entry.1.clone();
    recent.push(entry);
    Some(plan)
}

/// Keeps `plan` for `key`, letting the least recently used one go when full.
pub(crate) fn keep(key: Key, plan: Arc<Plan>) {
    let mut recent = RECENT
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    recent.retain(|(kept, _)| *kept != key);
    if recent.len() == PLANS {
        recent.remove(0);
    }
    recent.push((key, plan));
}
