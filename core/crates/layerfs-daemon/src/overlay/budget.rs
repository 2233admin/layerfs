//! One daemon ledger for pager allowances, scheduler state and retained job bytes.
use super::{
    admission::Notifications,
    commands::ServiceClass,
    owner::{OwnerConfig, OwnerError},
};
use std::sync::{Arc, Mutex};

#[derive(Clone, Copy, Debug, Default)]
pub struct BudgetWork {
    pub limit_bytes: usize,
    pub pager_bytes: usize,
    pub fixed_bytes: usize,
    pub job_bytes: usize,
    pub peak_job_bytes: usize,
    pub outstanding: usize,
}

pub(crate) struct Budget {
    limit: usize,
    reserve: usize,
    pager: usize,
    work: Mutex<BudgetWork>,
    pub notifications: Arc<Notifications>,
}
impl Budget {
    pub fn new(config: OwnerConfig, pager: usize) -> Result<Arc<Self>, OwnerError> {
        if config.bytes <= config.lifecycle_reserve.saturating_add(pager) {
            return Err(OwnerError::InvalidAdmission);
        }
        let planned = Notifications::planned_bytes(config).ok_or(OwnerError::InvalidAdmission)?;
        if planned
            >= config
                .bytes
                .saturating_sub(config.lifecycle_reserve)
                .saturating_sub(pager)
        {
            return Err(OwnerError::InvalidAdmission);
        }
        let notifications = Arc::new(Notifications::new(config));
        let fixed = notifications.bytes()
            + std::mem::size_of::<Notifications>()
            + std::mem::size_of::<Self>();
        if fixed
            >= config
                .bytes
                .saturating_sub(config.lifecycle_reserve)
                .saturating_sub(pager)
        {
            return Err(OwnerError::InvalidAdmission);
        }
        Ok(Arc::new(Self {
            limit: config.bytes,
            reserve: config.lifecycle_reserve,
            pager,
            work: Mutex::new(BudgetWork {
                limit_bytes: config.bytes,
                pager_bytes: pager,
                fixed_bytes: fixed,
                ..BudgetWork::default()
            }),
            notifications,
        }))
    }
    pub fn capacity(&self, class: ServiceClass) -> usize {
        let work = self.work.lock().unwrap_or_else(|e| e.into_inner());
        self.limit
            .saturating_sub(self.pager)
            .saturating_sub(work.fixed_bytes)
            .saturating_sub(if class == ServiceClass::Lifecycle {
                0
            } else {
                self.reserve
            })
    }
    pub fn acquire(&self, bytes: usize, class: ServiceClass) -> Result<(), OwnerError> {
        let mut work = self.work.lock().map_err(|_| OwnerError::Stopped)?;
        let limit = self
            .limit
            .saturating_sub(self.pager)
            .saturating_sub(work.fixed_bytes)
            .saturating_sub(if class == ServiceClass::Lifecycle {
                0
            } else {
                self.reserve
            });
        if bytes > limit || work.job_bytes > limit - bytes {
            return Err(OwnerError::AdmissionFull);
        }
        work.job_bytes += bytes;
        work.outstanding += 1;
        work.peak_job_bytes = work.peak_job_bytes.max(work.job_bytes);
        Ok(())
    }
    pub fn excess(&self, bytes: usize) {
        let mut work = self.work.lock().unwrap_or_else(|e| e.into_inner());
        work.job_bytes = work.job_bytes.saturating_add(bytes);
        work.peak_job_bytes = work.peak_job_bytes.max(work.job_bytes);
    }
    pub fn release(&self, bytes: usize) {
        let mut work = self.work.lock().unwrap_or_else(|e| e.into_inner());
        work.job_bytes -= bytes;
        work.outstanding -= 1;
        drop(work);
        self.notifications.notify();
    }
    pub fn fixed(self: &Arc<Self>, bytes: usize) -> Result<FixedCredit, OwnerError> {
        let mut work = self.work.lock().map_err(|_| OwnerError::Stopped)?;
        let limit = self
            .limit
            .saturating_sub(self.pager)
            .saturating_sub(self.reserve);
        if bytes > limit || work.fixed_bytes.saturating_add(work.job_bytes) > limit - bytes {
            return Err(OwnerError::AdmissionFull);
        }
        work.fixed_bytes += bytes;
        Ok(FixedCredit {
            budget: self.clone(),
            bytes,
        })
    }
    pub fn diagnostics(&self) -> BudgetWork {
        *self.work.lock().unwrap_or_else(|e| e.into_inner())
    }
}

pub(crate) struct FixedCredit {
    budget: Arc<Budget>,
    bytes: usize,
}
impl Drop for FixedCredit {
    fn drop(&mut self) {
        let mut work = self.budget.work.lock().unwrap_or_else(|e| e.into_inner());
        work.fixed_bytes -= self.bytes;
        drop(work);
        self.budget.notifications.notify();
    }
}

/// Before-effect job credit retained while a Workspace connection is created.
/// Transfer to the admitted completion consumes it; any refusal releases it.
pub(crate) struct JobPermit {
    budget: Arc<Budget>,
    bytes: usize,
    class: ServiceClass,
}
impl JobPermit {
    pub fn acquire(
        budget: &Arc<Budget>,
        bytes: usize,
        class: ServiceClass,
    ) -> Result<Self, OwnerError> {
        budget.acquire(bytes, class)?;
        Ok(Self {
            budget: budget.clone(),
            bytes,
            class,
        })
    }
    pub fn covers(&self, budget: &Arc<Budget>, bytes: usize, class: ServiceClass) -> bool {
        Arc::ptr_eq(&self.budget, budget) && self.bytes == bytes && self.class == class
    }
    pub fn transfer(mut self) {
        self.bytes = 0;
    }
}
impl Drop for JobPermit {
    fn drop(&mut self) {
        if self.bytes != 0 {
            self.budget.release(self.bytes);
        }
    }
}
