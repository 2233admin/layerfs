//! Exact memory ownership counts; map allocation and process RSS are separate.
use super::OpenState;

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct OpenStateCounts {
    pub kernel_entries: u64,
    pub directory_parents: u64,
    pub file_handles: u64,
    pub file_reads: u64,
    pub lookup_owners: u64,
    pub file_custody: u64,
    pub orphan_files: u64,
    pub generation_waits: u64,
    pub mounts: u64,
    pub directory_handles: u64,
    pub cookie_pages: u64,
}
impl OpenStateCounts {
    /// Fixed-width values for an original observation, in the declared order.
    pub fn values(self) -> [u64; 11] {
        [
            self.kernel_entries,
            self.directory_parents,
            self.file_handles,
            self.file_reads,
            self.lookup_owners,
            self.file_custody,
            self.orphan_files,
            self.generation_waits,
            self.mounts,
            self.directory_handles,
            self.cookie_pages,
        ]
    }
    pub fn accumulate(&mut self, next: Self) {
        let mut values = self.values();
        for (value, added) in values.iter_mut().zip(next.values()) {
            *value += added;
        }
        *self = Self::from_values(values);
    }
    fn from_values(values: [u64; 11]) -> Self {
        Self {
            kernel_entries: values[0],
            directory_parents: values[1],
            file_handles: values[2],
            file_reads: values[3],
            lookup_owners: values[4],
            file_custody: values[5],
            orphan_files: values[6],
            generation_waits: values[7],
            mounts: values[8],
            directory_handles: values[9],
            cookie_pages: values[10],
        }
    }
}
impl OpenState {
    pub fn snapshot(&self, ns: Option<i64>) -> OpenStateCounts {
        OpenStateCounts::from_values(std::array::from_fn(|column| self.count_at(ns, column)))
    }
}
