//! One counted live reclamation turn, independent of terminal file disposal.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct ReclaimStep {
    pub namespace: u64,
    pub rows: u64,
    pub data_bytes: u64,
    pub done: bool,
}
