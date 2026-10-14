//! Owned result, exact short-job work and original backing custody.
use crate::{JobWork, OwnerError, Response};
use std::{fmt, sync::Arc};
pub struct JobReceipt {
    result: Result<Response, OwnerError>,
    work: JobWork,
    _backing: Option<Arc<crate::overlay::backing::Backing>>,
}
impl JobReceipt {
    pub(crate) fn new(
        result: Result<Response, OwnerError>,
        work: JobWork,
        backing: Option<Arc<crate::overlay::backing::Backing>>,
    ) -> Self {
        Self {
            result,
            work,
            _backing: backing,
        }
    }
    pub fn work(&self) -> &JobWork {
        &self.work
    }
    pub fn result(&self) -> &Result<Response, OwnerError> {
        &self.result
    }
    pub(crate) fn add_allocation(&mut self, work: layerfs_overlay::AllocationWork) {
        self.work.allocation.accumulate(work);
    }
}
impl fmt::Debug for JobReceipt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.result().fmt(f)
    }
}
impl fmt::Display for JobReceipt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "job result: {:?}", self.result())
    }
}
impl std::error::Error for JobReceipt {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.result
            .as_ref()
            .err()
            .map(|cause| cause as &dyn std::error::Error)
    }
}
