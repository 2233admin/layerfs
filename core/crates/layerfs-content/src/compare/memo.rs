//! A bounded memo of canonical objects for one comparison.
//!
//! A comparison looks up many serials and names, and every lookup descends its
//! B-tree from the root. Without a memo each descent re-reads the upper pages,
//! so a lookup costs one more read per level, and the levels grow with the tree.
//! The memo serves a page the comparison already read, so the shared upper
//! pages are read once and a lookup's own work is its leaf. The memo holds at
//! most [`MEMO_PAGES`] objects and empties wholesale when full: it is a bound,
//! not a store, and a re-read after a reset is still correct.

use std::cell::RefCell;
use std::collections::HashMap;

use layerfs_telemetry::timer::TimingScope;

use crate::error::{ContentError, ContentResult};
use crate::object::{AuthenticatedObjects, ObjectId};

/// Objects one comparison's memo holds before it empties.
pub const MEMO_PAGES: usize = 256;

/// A provider that serves repeated demands from memory.
pub struct Memo<'a> {
    inner: &'a dyn AuthenticatedObjects,
    pages: RefCell<HashMap<ObjectId, Vec<u8>>>,
}

impl<'a> Memo<'a> {
    /// A memo over `inner`, empty.
    pub fn new(inner: &'a dyn AuthenticatedObjects) -> Self {
        Self {
            inner,
            pages: RefCell::new(HashMap::new()),
        }
    }

    fn serve(
        &self,
        ids: &[ObjectId],
        read: impl FnOnce(&[ObjectId]) -> ContentResult<Vec<Vec<u8>>>,
    ) -> ContentResult<Vec<Vec<u8>>> {
        let mut misses: Vec<ObjectId> = {
            let pages = self.pages.borrow();
            ids.iter()
                .filter(|id| !pages.contains_key(id))
                .copied()
                .collect()
        };
        misses.sort_unstable();
        misses.dedup();
        let mut fetched: HashMap<ObjectId, Vec<u8>> = HashMap::new();
        if !misses.is_empty() {
            let values = read(&misses)?;
            if values.len() != misses.len() {
                return Err(ContentError::BatchCardinality {
                    requested: misses.len(),
                    returned: values.len(),
                });
            }
            fetched = misses.into_iter().zip(values).collect();
        }
        let out = {
            let pages = self.pages.borrow();
            ids.iter()
                .map(|id| {
                    fetched.get(id).or_else(|| pages.get(id)).cloned().ok_or(
                        ContentError::BatchCardinality {
                            requested: ids.len(),
                            returned: 0,
                        },
                    )
                })
                .collect::<ContentResult<Vec<_>>>()?
        };
        let mut pages = self.pages.borrow_mut();
        if pages.len() + fetched.len() > MEMO_PAGES {
            pages.clear();
        }
        if fetched.len() <= MEMO_PAGES {
            pages.extend(fetched);
        }
        Ok(out)
    }
}

impl AuthenticatedObjects for Memo<'_> {
    fn read_canonical_batch(&self, ids: &[ObjectId]) -> ContentResult<Vec<Vec<u8>>> {
        self.serve(ids, |misses| self.inner.read_canonical_batch(misses))
    }

    fn read_canonical_batch_scoped(
        &self,
        ids: &[ObjectId],
        scope: TimingScope<'_>,
    ) -> ContentResult<Vec<Vec<u8>>> {
        self.serve(ids, |misses| {
            self.inner.read_canonical_batch_scoped(misses, scope)
        })
    }
}
