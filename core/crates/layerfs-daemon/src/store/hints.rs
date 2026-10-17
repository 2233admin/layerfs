//! Name bindings a new saved tree adds, recorded as path hints for readers
//! (the daemon's Commit and merge; host Init records its own tree's).
use super::commit_types::CommitError;
use layerfs_content::compare::{new_bindings, TreeTable};
use layerfs_content::filesystem::FilesystemRootId;
use layerfs_content::{AuthenticatedObjects, ContentError};
use layerfs_history::{BindingHint, HistoryCatalog};

/// Rows one hint write transaction carries.
const BATCH: usize = 4096;

/// Records every name binding `right` holds that `left` does not, in bounded
/// write transactions, and returns how many rows it recorded. `left` is a
/// saved tree whose bindings are already recorded; Init, which has none,
/// records every binding of its tree. Work follows the change between them.
pub(crate) fn record_new_bindings(
    reader: &dyn AuthenticatedObjects,
    catalog: &dyn HistoryCatalog,
    left: Option<FilesystemRootId>,
    right: FilesystemRootId,
) -> Result<u64, CommitError> {
    let left = left
        .map(|root| TreeTable::open(reader, root))
        .transpose()
        .map_err(CommitError::from)?;
    let right = TreeTable::open(reader, right).map_err(CommitError::from)?;
    let (mut rows, mut recorded, mut failure) = (Vec::new(), 0u64, None);
    let walked = new_bindings(reader, left.as_ref(), &right, |child, parent, name| {
        rows.push(BindingHint {
            child,
            parent,
            name: name.as_bytes().to_vec(),
        });
        if rows.len() == BATCH {
            if let Err(error) = catalog.record_bindings(&rows) {
                failure = Some(error);
                return Err(ContentError::OutputRejected);
            }
            recorded += rows.len() as u64;
            rows.clear();
        }
        Ok(())
    });
    if let Some(error) = failure {
        return Err(CommitError::History(error));
    }
    walked.map_err(CommitError::from)?;
    if !rows.is_empty() {
        catalog
            .record_bindings(&rows)
            .map_err(CommitError::History)?;
        recorded += rows.len() as u64;
    }
    Ok(recorded)
}
