//! Merge build records (#355): one merge's working state in the Store file.
//!
//! A merge registers an owner row with a random token; its records carry the
//! owner's number. Every job checks the owner and token in the same statement
//! or transaction, so records of a removed owner are never read as absent.
//! Writes are short jobs through the Store's one writer; nothing here takes
//! the publication lane. The merge removes its records when it ends, a window
//! at a time. A writable open removes the records of owners that made no call
//! for [`MERGE_LEASE`]: a live merge refreshes its owner well within it.

use crate::backend::{records::BackendError, Session, Transaction};
use layerfs_content::{
    ContentError, ContentResult, EditRecordApply, EditRecordChange, EditRecordExpected,
    EditRecordKey, IndexedEditBacking,
};
use layerfs_storage::port::PersistenceError;
use rusqlite::ToSql;
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

/// Idle time after which a writable open removes a merge's records.
pub const MERGE_LEASE: Duration = Duration::from_secs(600);
/// A live merge refreshes its owner after this much time since the last.
const REFRESH: Duration = Duration::from_secs(60);
/// Keys one window or batch holds.
const WINDOW: usize = 64;
/// Value bytes one batch may write.
const BATCH_BYTES: usize = 64 * 1024;
/// Records one removal job deletes.
const REMOVE_ROWS: i64 = 4096;

const OWNER: &str = "SELECT 1 FROM merge_operation WHERE operation=?1 AND token=?2";
const GET: &str = "SELECT r.value FROM merge_operation o LEFT JOIN merge_record r
    ON r.operation=o.operation AND r.kind=?3 AND r.key=?4
    WHERE o.operation=?1 AND o.token=?2";
const KEYS_AFTER: &str = "SELECT r.key FROM merge_operation o LEFT JOIN
    (SELECT key FROM merge_record WHERE operation=?1 AND kind=?3 AND key>?4
     ORDER BY key LIMIT 64) r
    WHERE o.operation=?1 AND o.token=?2 ORDER BY r.key";
const KEYS_EXCLUDING: &str = "SELECT r.key FROM merge_operation o LEFT JOIN
    (SELECT key FROM merge_record WHERE operation=?1 AND kind=?3 AND key<>?4
     ORDER BY key LIMIT 64) r
    WHERE o.operation=?1 AND o.token=?2 ORDER BY r.key";
const PUT: &str = "INSERT INTO merge_record(operation,kind,key,value) VALUES(?1,?2,?3,?4)
    ON CONFLICT(operation,kind,key) DO UPDATE SET value=excluded.value";
const DELETE: &str = "DELETE FROM merge_record WHERE operation=?1 AND kind=?2 AND key=?3";
const REMOVE: &str = "DELETE FROM merge_record WHERE operation=?1 AND (kind,key) IN
    (SELECT kind,key FROM merge_record WHERE operation=?1 ORDER BY kind,key LIMIT ?2)";

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |elapsed| elapsed.as_millis() as i64)
}

/// Work of one merge's records: jobs, and how long its write transactions
/// held the Store's writer.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct MergeRecordsWork {
    /// Owner-checked reads.
    pub reads: u64,
    /// Write transactions: registration, batches, refreshes and removal.
    pub writes: u64,
    /// Total writer hold of those transactions.
    pub write_ns: u64,
    /// Longest single writer hold.
    pub max_write_ns: u64,
}

impl MergeRecordsWork {
    fn write(&mut self, start: Instant) {
        let held = start.elapsed().as_nanos() as u64;
        self.writes += 1;
        self.write_ns += held;
        self.max_write_ns = self.max_write_ns.max(held);
    }

    /// Adds another merge's work.
    pub fn add(&mut self, other: Self) {
        self.reads += other.reads;
        self.writes += other.writes;
        self.write_ns += other.write_ns;
        self.max_write_ns = self.max_write_ns.max(other.max_write_ns);
    }
}

/// Opens merge records over the Store's writable session.
pub struct MergeScratch {
    pub(crate) session: Arc<Session>,
}

impl MergeScratch {
    /// Registers one merge and returns its records.
    pub fn begin(&self) -> Result<MergeRecords, PersistenceError> {
        let start = Instant::now();
        let (operation, token) = self.session.run(true, |tx| {
            let row = tx.mapped(
                "INSERT INTO merge_operation(token,touched) VALUES(randomblob(16),?1)
                 RETURNING operation,token",
                &[&now_ms()],
                8,
                1,
                |row| {
                    let token: Vec<u8> = row.get(1).map_err(crate::backend::sqlite::rows::error)?;
                    Ok((
                        row.get::<_, i64>(0)
                            .map_err(crate::backend::sqlite::rows::error)?,
                        token,
                    ))
                },
            )?;
            row.into_iter().next().ok_or(BackendError::Integrity)
        })?;
        let mut work = MergeRecordsWork::default();
        work.write(start);
        Ok(MergeRecords {
            session: self.session.clone(),
            operation,
            token,
            refreshed: Instant::now(),
            failure: None,
            work,
        })
    }
}

/// One merge's records. A first failure ends every later call; the caller
/// reads it with [`MergeRecords::failure`] and calls [`MergeRecords::end`].
pub struct MergeRecords {
    session: Arc<Session>,
    operation: i64,
    token: Vec<u8>,
    refreshed: Instant,
    failure: Option<PersistenceError>,
    work: MergeRecordsWork,
}

impl MergeRecords {
    /// The first failure of a call, when one failed.
    pub fn failure(&self) -> Option<&PersistenceError> {
        self.failure.as_ref()
    }

    /// Jobs so far and their writer hold.
    pub fn work(&self) -> MergeRecordsWork {
        self.work
    }

    /// Removes every record of this merge, then its owner, a window per job.
    /// Returns the merge's work including the removal.
    pub fn end(mut self) -> Result<MergeRecordsWork, PersistenceError> {
        loop {
            let start = Instant::now();
            let removed = self.session.run(true, |tx| {
                self.owned(tx)?;
                tx.borrowed(REMOVE, &[&self.operation, &REMOVE_ROWS], 16)?;
                let changed = changes(tx)?;
                if changed == 0 {
                    tx.borrowed(
                        "DELETE FROM merge_operation WHERE operation=?1",
                        &[&self.operation],
                        8,
                    )?;
                }
                Ok::<_, PersistenceError>(changed)
            })?;
            self.work.write(start);
            if removed == 0 {
                return Ok(self.work);
            }
        }
    }

    fn owned(&self, tx: &Transaction<'_>) -> Result<(), PersistenceError> {
        let rows = tx.borrowed(OWNER, &[&self.operation, &self.token], 24)?;
        if rows.is_empty() {
            return Err(PersistenceError::Missing);
        }
        Ok(())
    }

    /// Runs one job, ending this merge's calls at its first failure.
    fn job<T>(
        &mut self,
        write: bool,
        body: impl FnOnce(&Self) -> Result<T, PersistenceError>,
    ) -> ContentResult<T> {
        if self.failure.is_some() {
            return Err(refused());
        }
        let refreshed = if self.refreshed.elapsed() >= REFRESH {
            self.refresh()
        } else {
            Ok(())
        };
        let start = Instant::now();
        let result = refreshed.and_then(|()| body(self));
        if write {
            self.work.write(start);
        } else {
            self.work.reads += 1;
        }
        result.map_err(|error| {
            self.failure = Some(error);
            refused()
        })
    }

    fn refresh(&mut self) -> Result<(), PersistenceError> {
        let start = Instant::now();
        self.session.run(true, |tx| {
            self.owned(tx)?;
            tx.borrowed(
                "UPDATE merge_operation SET touched=?2 WHERE operation=?1",
                &[&self.operation, &now_ms()],
                16,
            )?;
            Ok::<_, PersistenceError>(())
        })?;
        self.work.write(start);
        self.refreshed = Instant::now();
        Ok(())
    }

    /// One owner-checked statement: no rows means the owner is gone.
    fn owned_rows(
        &self,
        sql: &str,
        extra: &[&dyn ToSql],
    ) -> Result<Vec<Option<Vec<u8>>>, PersistenceError> {
        let mut values: Vec<&dyn ToSql> = vec![&self.operation, &self.token];
        values.extend_from_slice(extra);
        let rows = self.session.read_mapped(sql, &values, 64, WINDOW, |row| {
            row.get::<_, Option<Vec<u8>>>(0)
                .map(Some)
                .map_err(|error| PersistenceError::from(crate::backend::sqlite::rows::error(error)))
        })?;
        if rows.is_empty() {
            return Err(PersistenceError::Missing);
        }
        Ok(rows)
    }

    fn value(&self, key: EditRecordKey) -> Result<Option<Vec<u8>>, PersistenceError> {
        let rows = self.owned_rows(GET, &[&i64::from(key.kind), &key.key.as_slice()])?;
        Ok(rows.into_iter().next().flatten())
    }

    fn keys(&self, sql: &str, kind: u32, bound: &[u8]) -> Result<Vec<[u8; 32]>, PersistenceError> {
        self.owned_rows(sql, &[&i64::from(kind), &bound])?
            .into_iter()
            .flatten()
            .map(|key| <[u8; 32]>::try_from(key).map_err(|_| PersistenceError::Malformed))
            .collect()
    }

    fn apply_owned(
        &self,
        changes: &[EditRecordChange],
    ) -> Result<EditRecordApply, PersistenceError> {
        self.session.run(true, |tx| {
            self.owned(tx)?;
            for (index, change) in changes.iter().enumerate() {
                let kind = i64::from(change.key.kind);
                let rows = tx.mapped(
                    "SELECT value FROM merge_record WHERE operation=?1 AND kind=?2 AND key=?3",
                    &[&self.operation, &kind, &change.key.key.as_slice()],
                    48,
                    1,
                    |row| {
                        row.get::<_, Vec<u8>>(0)
                            .map_err(crate::backend::sqlite::rows::error)
                    },
                )?;
                let actual = rows.into_iter().next();
                let matches = match (&change.expected, &actual) {
                    (EditRecordExpected::Missing, None) => true,
                    (EditRecordExpected::ExactBytes(expected), Some(actual)) => expected == actual,
                    _ => false,
                };
                if !matches {
                    return Ok(EditRecordApply::NotApplied {
                        index,
                        key: change.key,
                        actual,
                    });
                }
            }
            for change in changes {
                let kind = i64::from(change.key.kind);
                let key = change.key.key.as_slice();
                match &change.value {
                    Some(value) => tx.borrowed(
                        PUT,
                        &[&self.operation, &kind, &key, &value.as_slice()],
                        48 + value.len() as u64,
                    )?,
                    None => tx.borrowed(DELETE, &[&self.operation, &kind, &key], 48)?,
                };
            }
            Ok::<_, PersistenceError>(EditRecordApply::Applied)
        })
    }
}

fn changes(tx: &Transaction<'_>) -> Result<i64, BackendError> {
    tx.mapped("SELECT changes()", &[], 0, 1, |row| {
        row.get::<_, i64>(0)
            .map_err(crate::backend::sqlite::rows::error)
    })?
    .into_iter()
    .next()
    .ok_or(BackendError::Integrity)
}

fn refused() -> ContentError {
    ContentError::ProviderFailure {
        what: "merge records",
    }
}

impl IndexedEditBacking for MergeRecords {
    fn contains(&mut self, key: EditRecordKey) -> ContentResult<bool> {
        self.job(false, |records| {
            records.value(key).map(|value| value.is_some())
        })
    }

    fn get(&mut self, key: EditRecordKey) -> ContentResult<Option<Vec<u8>>> {
        self.job(false, |records| records.value(key))
    }

    fn apply(&mut self, changes: Vec<EditRecordChange>) -> ContentResult<EditRecordApply> {
        let sorted = changes.windows(2).all(|pair| pair[0].key < pair[1].key);
        let bytes: usize = changes
            .iter()
            .map(|change| change.value.as_ref().map_or(0, Vec::len))
            .sum();
        if !sorted || bytes > BATCH_BYTES {
            return Err(ContentError::ProviderFailure {
                what: "merge record batch",
            });
        }
        self.job(true, |records| records.apply_owned(&changes))
    }

    fn first_keys(
        &mut self,
        kind: u32,
        excluded: Option<[u8; 32]>,
    ) -> ContentResult<Vec<[u8; 32]>> {
        self.job(false, |records| match excluded {
            Some(root) => records.keys(KEYS_EXCLUDING, kind, &root),
            None => records.keys(KEYS_AFTER, kind, &[]),
        })
    }

    fn keys_after(&mut self, kind: u32, after: Option<[u8; 32]>) -> ContentResult<Vec<[u8; 32]>> {
        self.job(false, |records| match after {
            Some(after) => records.keys(KEYS_AFTER, kind, &after),
            None => records.keys(KEYS_AFTER, kind, &[]),
        })
    }
}

/// Removes the records of merges idle past [`MERGE_LEASE`], one window per
/// job. The owner's token is revoked first, so the merge, should it resume,
/// fails `Missing` instead of reading records already removed as absent.
pub(crate) fn sweep(session: &Session) -> Result<(), BackendError> {
    let expired = now_ms() - MERGE_LEASE.as_millis() as i64;
    loop {
        let removed = session.run(true, |tx| {
            let owners = tx.mapped(
                "SELECT operation,token=zeroblob(16) FROM merge_operation
                 WHERE touched<?1 OR token=zeroblob(16) LIMIT 1",
                &[&expired],
                16,
                1,
                |row| {
                    let error = crate::backend::sqlite::rows::error;
                    Ok((
                        row.get::<_, i64>(0).map_err(error)?,
                        row.get::<_, bool>(1).map_err(error)?,
                    ))
                },
            )?;
            let Some((operation, revoked)) = owners.into_iter().next() else {
                return Ok(false);
            };
            if !revoked {
                tx.borrowed(
                    "UPDATE merge_operation SET token=zeroblob(16) WHERE operation=?1",
                    &[&operation],
                    8,
                )?;
                return Ok(true);
            }
            tx.borrowed(REMOVE, &[&operation, &REMOVE_ROWS], 16)?;
            if changes(tx)? == 0 {
                tx.borrowed(
                    "DELETE FROM merge_operation WHERE operation=?1",
                    &[&operation],
                    8,
                )?;
            }
            Ok::<_, BackendError>(true)
        })?;
        if !removed {
            return Ok(());
        }
    }
}
