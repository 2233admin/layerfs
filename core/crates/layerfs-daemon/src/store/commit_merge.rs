//! Merge-on-commit: inside the Commit's own Save, the candidate is merged into
//! a Branch head that moved since the Workspace was bound, and a conflicted
//! Workspace is refused while its marker blocks remain.
use super::{BoundWorkspace, CommitError, MergeReport};
use layerfs_content::ObjectId;
use layerfs_content::{
    compare::root_changes,
    filesystem::FilesystemRootId,
    merge::{merge_roots, paths_with_markers, MergeInput, RulesFrom},
    ContentError, ContentResult,
};
use layerfs_history::BranchSnapshot;
use layerfs_storage::Save;
use layerfs_telemetry::timer::Timing;
use layerfs_workspace::{InodeSerials, WorkspaceError};

/// Serials one reservation takes while a merge needs fresh ones.
const MERGE_SERIALS: u64 = 64;
/// Changed paths a conflict reports as written into the Workspace.
const WRITTEN_PATHS: usize = 4096;

/// A conflicted Workspace: its local base is the merge with markers, while
/// its history binding is the head it merged with.
#[derive(Clone, Debug, Eq, PartialEq)]
pub(crate) struct PendingMerge {
    /// Root installed as the Workspace's local base.
    pub(crate) local_root: ObjectId,
    /// Paths that conflicted.
    pub(crate) conflicted: Vec<String>,
}

impl BoundWorkspace {
    /// The local base root: the pending merge's, else the history binding's.
    pub(super) fn local_root(&self, snapshot: &BranchSnapshot) -> Result<ObjectId, CommitError> {
        Ok(self
            .pending
            .lock()
            .map_err(|_| CommitError::Workspace(WorkspaceError::BindingPoisoned))?
            .as_ref()
            .map_or(snapshot.effective_root, |pending| pending.local_root))
    }

    /// Refuses a candidate whose previously conflicted files still hold a
    /// complete marker block.
    pub(super) fn refuse_markers(
        &self,
        save: &Save<'_>,
        candidate: FilesystemRootId,
    ) -> Result<(), CommitError> {
        let conflicted = match self
            .pending
            .lock()
            .map_err(|_| CommitError::Workspace(WorkspaceError::BindingPoisoned))?
            .as_ref()
        {
            Some(pending) => pending.conflicted.clone(),
            None => return Ok(()),
        };
        let (marked, _) = Timing::disabled("markers", |timing| {
            paths_with_markers(save, candidate, &conflicted, timing)
        });
        let marked = marked.map_err(content)?;
        if marked.is_empty() {
            Ok(())
        } else {
            Err(CommitError::Markers(marked))
        }
    }

    /// Merges the candidate (ours) into the current head (theirs) against
    /// the history root this Workspace is bound to. Merged files and the
    /// merged root go into the same Save.
    pub(super) fn merge_candidate(
        &self,
        save: &Save<'_>,
        bound: &BranchSnapshot,
        current: &BranchSnapshot,
        candidate: FilesystemRootId,
    ) -> Result<(FilesystemRootId, MergeReport), CommitError> {
        let ports = self.store.ports(bound.scope);
        let mut range = (0u64, 0u64);
        let mut refused = None;
        let mut fresh = || -> ContentResult<u64> {
            if range.0 == range.1 {
                let (start, count) = ports.reserve(MERGE_SERIALS).map_err(|error| {
                    refused = Some(error);
                    ContentError::ResourceUnavailable {
                        what: "merge inode serials",
                    }
                })?;
                range = (start, start.saturating_add(count));
            }
            range.0 += 1;
            Ok(range.0 - 1)
        };
        let theirs = match current.branch.head_commit {
            Some(head) => format!("{}@{head}", current.branch.name.as_str()),
            None => current.branch.name.as_str().to_owned(),
        };
        let policy = self.store.policy().construction();
        let capacities = policy.capacities();
        let input = MergeInput {
            base: FilesystemRootId(bound.effective_root),
            ours: candidate,
            theirs: FilesystemRootId(current.effective_root),
            labels: ["workspace", &theirs],
            rules_from: RulesFrom::Theirs,
            policy,
            capacities: &capacities,
        };
        let (merged, _) = Timing::disabled("merge", |timing| {
            merge_roots(save, &mut save.sink(), &input, &mut fresh, timing)
        });
        let merged = match (merged, refused) {
            (Ok(merged), _) => merged,
            (Err(_), Some(error)) => return Err(CommitError::Workspace(error)),
            (Err(error), None) => return Err(content(error)),
        };
        let written = if merged.clean() {
            Vec::new()
        } else {
            root_changes(save, candidate, merged.root, WRITTEN_PATHS)
                .map_err(content)?
                .entries
                .into_iter()
                .map(|change| change.path)
                .collect()
        };
        Ok((
            merged.root,
            MergeReport {
                from: bound.branch.head_commit,
                head: current.branch.head_commit,
                conflicts: merged.conflicts,
                lww: merged.lww,
                written,
            },
        ))
    }
}

fn content(error: ContentError) -> CommitError {
    CommitError::Content {
        error,
        provider: None,
    }
}
