//! Merge-on-commit: inside the Commit's own Save, the candidate is merged into
//! a Branch head that moved since the Workspace was bound, and a conflicted
//! Workspace is refused while its marker blocks remain.
use super::{BoundWorkspace, CommitError, MergeReport};
use layerfs_content::object::inode_leaf::InodeKind;
use layerfs_content::ObjectId;
use layerfs_content::{
    compare::{binding_changes, inode_changes, root_changes, DifferenceWork, TreeTable},
    filesystem::FilesystemRootId,
    merge::{merge_roots, paths_with_markers, MergeInput, RulesFrom},
    ContentError, ContentResult,
};
use layerfs_history::BranchSnapshot;
use layerfs_storage::Save;
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

    /// Paths of an installed conflicted merge that is not yet committed.
    pub fn pending_conflicts(&self) -> Result<Option<Vec<String>>, WorkspaceError> {
        Ok(self
            .pending
            .lock()
            .map_err(|_| WorkspaceError::BindingPoisoned)?
            .as_ref()
            .map(|pending| pending.conflicted.clone()))
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
        let marked = crate::telemetry::timed("markers", |timing| {
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
        let merged = crate::telemetry::timed("merge", |timing| {
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

/// One kernel cache entry an install made stale.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Stale<'a> {
    /// The inode's attributes, pages or listing.
    Inode(u64),
    /// One name's binding in a directory.
    Entry { parent: u64, name: &'a str },
}

/// Why a walk of what an install changed stopped.
#[derive(Debug)]
pub enum StaleError {
    Workspace(WorkspaceError),
    Content(ContentError),
    Visit(std::io::Error),
}

impl BoundWorkspace {
    /// Visits what the kernel may cache from the root the Workspace showed
    /// that the installed root changed: every inode whose value changed or
    /// vanished, and every rebound name of a directory present in both. An
    /// inode only the installed root has is not visited; nothing could have
    /// cached it. The walk streams; it holds no list of the changes.
    pub fn stale_after_install(
        &self,
        shown: ObjectId,
        installed: ObjectId,
        mut visit: impl FnMut(Stale<'_>) -> std::io::Result<()>,
    ) -> Result<(), StaleError> {
        let scope = self.snapshot().map_err(StaleError::Workspace)?.scope;
        let ports = self.store.ports(scope);
        let reader = &*ports;
        let open = |root| TreeTable::open(reader, FilesystemRootId(root));
        let (before, after) = (
            open(shown).map_err(StaleError::Content)?,
            open(installed).map_err(StaleError::Content)?,
        );
        let mut visited = None;
        let mut work = DifferenceWork::default();
        let walked = inode_changes(reader, &before, &after, &mut work, |serial, was, now| {
            let Some(was) = was else { return Ok(()) };
            if let Err(error) = visit(Stale::Inode(serial)) {
                visited = Some(error);
                return Err(ContentError::OutputRejected);
            }
            let Some(now) = now
                .filter(|now| now.kind == InodeKind::Directory && was.kind == InodeKind::Directory)
            else {
                return Ok(());
            };
            let mut inner = DifferenceWork::default();
            binding_changes(
                reader,
                Some(was.content_root),
                Some(now.content_root),
                &mut inner,
                |name, _, _| {
                    visit(Stale::Entry {
                        parent: serial,
                        name: name.as_str(),
                    })
                    .map_err(|error| {
                        visited = Some(error);
                        ContentError::OutputRejected
                    })
                },
            )
        });
        match (walked, visited) {
            (_, Some(error)) => Err(StaleError::Visit(error)),
            (Err(error), None) => Err(StaleError::Content(error)),
            (Ok(()), None) => Ok(()),
        }
    }
}

fn content(error: ContentError) -> CommitError {
    CommitError::Content {
        error,
        provider: None,
    }
}
