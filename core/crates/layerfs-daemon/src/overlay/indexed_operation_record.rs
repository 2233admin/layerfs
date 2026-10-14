//! Short raw-record jobs, with no Content algorithm or provider I/O.
use layerfs_overlay::{
    IndexedOperationRecordApply, IndexedOperationRecordChange, IndexedOperationRecordKey,
    IndexedOperationRecordScope, Overlay, OverlayError, OverlayResult, Route,
};

/// Complete bounded inputs for the existing OperationRecord service class.
#[derive(Debug)]
pub enum IndexedOperationRecordJob {
    Contains {
        scope: IndexedOperationRecordScope,
        key: IndexedOperationRecordKey,
    },
    Get {
        scope: IndexedOperationRecordScope,
        key: IndexedOperationRecordKey,
    },
    /// At most `PAGE_ROWS` keys; their values share one reply envelope.
    GetMany {
        scope: IndexedOperationRecordScope,
        keys: Vec<IndexedOperationRecordKey>,
    },
    Apply {
        scope: IndexedOperationRecordScope,
        changes: Vec<IndexedOperationRecordChange>,
    },
    FirstKeys {
        scope: IndexedOperationRecordScope,
        kind: u32,
        excluded_root: [u8; 32],
    },
    FirstKeysAll {
        scope: IndexedOperationRecordScope,
        kind: u32,
    },
    KeysAfter {
        scope: IndexedOperationRecordScope,
        kind: u32,
        after: Option<[u8; 32]>,
    },
}

/// Original deciding outcomes stay inside the job's JobReceipt.
#[derive(Debug)]
pub enum IndexedOperationRecordReply {
    Contains(bool),
    Value(Option<Vec<u8>>),
    Values(Vec<Option<Vec<u8>>>),
    Applied(IndexedOperationRecordApply),
    Keys(Vec<[u8; 32]>),
}

impl IndexedOperationRecordJob {
    pub(crate) fn perform(
        self,
        db: &Overlay,
        route: Route,
    ) -> OverlayResult<IndexedOperationRecordReply> {
        let scope = match &self {
            Self::Contains { scope, .. }
            | Self::Get { scope, .. }
            | Self::GetMany { scope, .. }
            | Self::Apply { scope, .. }
            | Self::FirstKeys { scope, .. }
            | Self::FirstKeysAll { scope, .. }
            | Self::KeysAfter { scope, .. } => *scope,
        };
        if scope.owner.route() != route {
            return Err(OverlayError::Stale);
        }
        match self {
            Self::Contains { key, .. } => db
                .indexed_operation_record_contains(scope, key)
                .map(IndexedOperationRecordReply::Contains),
            Self::Get { key, .. } => db
                .indexed_operation_record_get(scope, key)
                .map(IndexedOperationRecordReply::Value),
            Self::GetMany { keys, .. } => db
                .indexed_operation_record_get_many(scope, &keys)
                .map(IndexedOperationRecordReply::Values),
            Self::Apply { changes, .. } => db
                .indexed_operation_record_apply(scope, &changes)
                .map(IndexedOperationRecordReply::Applied),
            Self::FirstKeys {
                kind,
                excluded_root,
                ..
            } => db
                .indexed_operation_record_first_keys(scope, kind, excluded_root)
                .map(IndexedOperationRecordReply::Keys),
            Self::FirstKeysAll { kind, .. } => db
                .indexed_operation_record_keys(scope, kind, None)
                .map(IndexedOperationRecordReply::Keys),
            Self::KeysAfter { kind, after, .. } => db
                .indexed_operation_record_keys_after(scope, kind, after)
                .map(IndexedOperationRecordReply::Keys),
        }
    }
}
