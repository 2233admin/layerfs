//! Exact kernel references and the parents retained by directory custody.
use super::directories::{CookieStore, CookieUndo, DirectoryState, OpenDisposals};
use super::files::{FileReferences, HeldFile};
use super::journal::JournalMap;
use crate::lifetime::orphan::Orphan;
use crate::{FileRead, LookupOwner, NativeMount};
use std::collections::BTreeMap;

#[derive(Clone, Copy)]
pub(crate) struct KernelReference {
    pub owner: u64,
    pub count: u64,
    pub implicit: bool,
}
#[derive(Default)]
pub(crate) struct OpenState {
    pub kernel: JournalMap<(i64, u64, u64), KernelReference>,
    pub parents: JournalMap<(i64, u64), (u64, u64)>,
    pub files: JournalMap<(i64, u64), HeldFile>,
    pub file_requests: JournalMap<(i64, u64, i64), u64>,
    pub reads: JournalMap<(i64, u64), (FileRead, i64)>,
    pub read_requests: JournalMap<(i64, i64), u64>,
    pub lookups: JournalMap<(i64, u64), (LookupOwner, i64)>,
    pub lookup_requests: JournalMap<(i64, i64), u64>,
    pub custody: JournalMap<(i64, i64), FileReferences>,
    pub orphans: JournalMap<(i64, i64), Orphan>,
    pub waits: JournalMap<(i64, i64, i64), ()>,
    pub mounts: JournalMap<i64, (NativeMount, bool)>,
    pub directories: JournalMap<(i64, u64), DirectoryState>,
    pub directory_requests: JournalMap<(i64, u64, u64), u64>,
    pub cookies: BTreeMap<(i64, u64), CookieStore>,
    pub cookie_undo: Vec<CookieUndo>,
    pub disposals: OpenDisposals,
    counts: JournalMap<i64, [u64; 11]>,
}
impl OpenState {
    pub fn count(&mut self, ns: i64, column: usize, add: bool) {
        let mut count = self.counts.rows.get(&ns).copied().unwrap_or_default();
        if add {
            count[column] += 1;
        } else {
            count[column] -= 1;
        }
        self.counts.put(ns, count);
    }
    pub fn subtract(&mut self, ns: i64, column: usize, removed: u64) {
        let mut count = self.counts.rows.get(&ns).copied().unwrap_or_default();
        count[column] -= removed;
        self.counts.put(ns, count);
    }
    pub fn put_kernel(&mut self, key: (i64, u64, u64), value: KernelReference) {
        if !self.kernel.rows.contains_key(&key) {
            self.count(key.0, 0, true);
        }
        self.kernel.put(key, value);
    }
    pub fn remove_kernel(&mut self, key: (i64, u64, u64)) {
        if self.kernel.rows.contains_key(&key) {
            self.count(key.0, 0, false);
            self.kernel.remove(key);
        }
    }
    pub fn put_parent(&mut self, key: (i64, u64), value: (u64, u64)) {
        if !self.parents.rows.contains_key(&key) {
            self.count(key.0, 1, true);
        }
        self.parents.put(key, value);
    }
    pub fn remove_parent(&mut self, key: (i64, u64)) {
        if self.parents.rows.contains_key(&key) {
            self.count(key.0, 1, false);
            self.parents.remove(key);
        }
    }
    pub fn count_at(&self, ns: Option<i64>, column: usize) -> u64 {
        match ns {
            Some(ns) => self
                .counts
                .rows
                .get(&ns)
                .map(|counts| counts[column])
                .unwrap_or(0),
            None => self.counts.rows.values().map(|counts| counts[column]).sum(),
        }
    }
    pub fn commit(&mut self) {
        self.kernel.commit();
        self.parents.commit();
        self.files.commit();
        self.file_requests.commit();
        self.reads.commit();
        self.read_requests.commit();
        self.lookups.commit();
        self.lookup_requests.commit();
        self.custody.commit();
        self.orphans.commit();
        self.waits.commit();
        self.mounts.commit();
        self.directories.commit();
        self.directory_requests.commit();
        self.counts.commit();
        self.commit_cookies();
    }
    pub fn rollback(&mut self) {
        self.kernel.rollback();
        self.parents.rollback();
        self.files.rollback();
        self.file_requests.rollback();
        self.reads.rollback();
        self.read_requests.rollback();
        self.lookups.rollback();
        self.lookup_requests.rollback();
        self.custody.rollback();
        self.orphans.rollback();
        self.waits.rollback();
        self.mounts.rollback();
        self.directories.rollback();
        self.directory_requests.rollback();
        self.counts.rollback();
        self.rollback_cookies();
    }
}
