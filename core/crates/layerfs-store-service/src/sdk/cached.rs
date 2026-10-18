//! One call's storage read caches over its Store ports (#352 F-035): the
//! pack bodies, decoded groups and decode arena a demand leaves behind serve
//! the call's next demands, instead of each demand starting cold. The caches
//! keep the storage reader's byte bounds and are dropped with the call.
use super::args;
use crate::store::{PortError, StorePorts};
use layerfs_bridge::control::SdkRefusal;
use layerfs_content::{AuthenticatedObjects, ContentError, ContentResult, ObjectId};
use layerfs_storage::{ReadCache, StorageError};
use std::cell::RefCell;

pub struct Cached<'a> {
    ports: &'a StorePorts,
    cache: RefCell<ReadCache>,
}

impl<'a> Cached<'a> {
    pub fn new(ports: &'a StorePorts) -> Result<Self, SdkRefusal> {
        Ok(Self {
            ports,
            cache: RefCell::new(ReadCache::new().map_err(args::failed)?),
        })
    }
}

impl AuthenticatedObjects for Cached<'_> {
    fn read_canonical_batch(&self, ids: &[ObjectId]) -> ContentResult<Vec<Vec<u8>>> {
        self.ports
            .objects_with(&mut self.cache.borrow_mut(), ids)
            .map_err(|error| match error.as_ref() {
                PortError::Storage(StorageError::ObjectMissing(_)) => ContentError::MissingObject,
                PortError::Storage(StorageError::Content(error)) => error.clone(),
                _ => ContentError::ProviderFailure {
                    what: "Store object demand",
                },
            })
    }
}
