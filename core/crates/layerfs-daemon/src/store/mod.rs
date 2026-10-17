//! In-process Store ports shared by one daemon's Workspaces.
mod bind;
mod captured;
mod commit;
mod commit_merge;
mod commit_types;
mod hints;
mod open;
mod operation;
mod ports;
mod producer;
mod read_handle;
mod read_service;
mod recognizer;
mod settle;
mod statistics;
mod types;
pub(crate) use bind::checked_base;
pub use commit_merge::{Stale, StaleError};
pub(crate) use hints::record_new_bindings;

pub use commit_types::{
    CapturedConstruction, CommitError, CommitFailure, CommitOptions, CommitPhase, CommitSuccess,
    MergeReport, ReleasedOwner,
};
pub use open::{SaveCounters, Store, StoreWork};
pub use operation::{BoundWorkspace, StoreOperation};
pub use ports::{PortError, StorePorts};
pub use read_handle::StoreReader;
pub use read_service::{ReadAdmissionError, ReadServiceWork, ReaderFactory};
pub use recognizer::{Recognizer, RecognizerWork, RECOGNIZER_SLOTS};
pub use types::{BindError, BindPhase, BindRefusal, BindRequest, BindSuccess, CloseError};

pub(crate) use commit_types::owner_uncertain;
