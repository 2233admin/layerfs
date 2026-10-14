//! One synchronous Content/Save/history producer and exact paired local install.
use super::{
    bind::checked_base, BoundWorkspace, CommitError, CommitFailure, CommitOptions, CommitPhase,
    CommitSuccess, MergeReport,
};
use layerfs_content::filesystem::FilesystemRootId;
use layerfs_history::{BranchSnapshot, CommitMeta, CommitOutcome, CommitRequest, CommitVia};
use layerfs_overlay::Capture;
use layerfs_storage::Save;
use layerfs_workspace::WorkspaceError;
use std::sync::{atomic::Ordering, Arc};

/// Admission belongs to exactly one invocation. It stays held unless that
/// invocation establishes a safe disposition, including its captured releases.
/// Unwinding or an unknown result conservatively retains admission.
pub(super) struct CommitAdmission<'a> {
    workspace: &'a BoundWorkspace,
    pub(super) released: bool,
}
impl Drop for CommitAdmission<'_> {
    fn drop(&mut self) {
        if self.released {
            self.workspace.committing.store(false, Ordering::Release);
        }
    }
}

impl BoundWorkspace {
    /// Captures once and drives one caller-owned Content producer over that
    /// exact context. The producer must represent the capture faithfully; live
    /// namespace normalization is a separate constructor, not an implicit Init.
    /// No owner or Workspace mutex spans construction or provider I/O. On definite
    /// nonpublication one local resolution preserves the accepted view; unknown
    /// and known-publication/install failure retain original custody.
    pub fn commit(
        &self,
        construct: impl FnOnce(
            &Save<'_>,
            Capture,
            &BranchSnapshot,
        ) -> Result<FilesystemRootId, CommitError>,
    ) -> Result<CommitSuccess, Box<CommitFailure>> {
        let mut admission = self.admit_commit()?;
        let result = self.commit_admitted(construct, || (), &CommitOptions::default());
        admission.released = match &result {
            Ok(_) => true,
            Err(failure) => failure.locally_settled,
        };
        result
    }
    pub(super) fn admit_commit(&self) -> Result<CommitAdmission<'_>, Box<CommitFailure>> {
        self.committing
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .map_err(|_| {
                Box::new(CommitFailure::new(
                    CommitError::InFlight,
                    self.identity,
                    self.route(),
                ))
            })?;
        Ok(CommitAdmission {
            workspace: self,
            released: false,
        })
    }
    /// The admitted invocation owns the flag through any wrapper's releases.
    /// `published` runs once, only after History answered this publication
    /// with the saved root; a failed, unknown or conflicted publication, and
    /// every earlier failure, never runs it.
    ///
    /// When the Branch head moved since the Workspace bound, the candidate is
    /// merged into the head in the same Save unless `force`. A clean merge is
    /// published against that head and installed as the new base. A conflict
    /// publishes nothing: the merge, with marker blocks, is installed as the
    /// Workspace's local base and its history binding moves to the head.
    pub(super) fn commit_admitted(
        &self,
        construct: impl FnOnce(
            &Save<'_>,
            Capture,
            &BranchSnapshot,
        ) -> Result<FilesystemRootId, CommitError>,
        published: impl FnOnce(),
        options: &CommitOptions,
    ) -> Result<CommitSuccess, Box<CommitFailure>> {
        let force = options.force;
        let mut retained = CommitFailure::new(
            CommitError::Context("incomplete Commit"),
            self.identity,
            self.route(),
        );
        let mut producer = None;
        let mut merge = None;
        let result = (|| {
            let snapshot = self.snapshot().map_err(CommitError::Workspace)?;
            retained.binding = Some(snapshot.clone());
            let local = self.local_root(&snapshot)?;
            let original_base = self.workspace.base().map_err(CommitError::Workspace)?;
            retained.phase = CommitPhase::Capture;
            let capture = self
                .job(|job_client: &crate::OwnerClient, job_route| job_client.capture(job_route))
                .map_err(CommitError::Owner)?;
            retained.capture = Some(capture);
            if capture.base_root != local.to_bytes() || original_base.identity().0 != local {
                return Err(CommitError::Context(
                    "capture differs from bound history root",
                ));
            }
            retained.phase = CommitPhase::Begin;
            let (storage, before) = self
                .producer
                .take(&self.store)
                .map_err(CommitError::Storage)?;
            let built = (|| {
                let save = storage.begin_save().map_err(CommitError::Storage)?;
                retained.phase = CommitPhase::Construct;
                let candidate = match construct(&save, capture, &snapshot) {
                    Ok(root) => root,
                    Err(original) => {
                        return Err(match save.take_failure() {
                            Some(storage) => CommitError::Construction {
                                original: Box::new(original),
                                storage,
                            },
                            None => original,
                        })
                    }
                };
                self.refuse_markers(&save, candidate)?;
                let current = self
                    .store
                    .history
                    .branch_snapshot(snapshot.branch.id)
                    .map_err(CommitError::History)?
                    .ok_or(CommitError::Context("bound Branch is absent"))?;
                let moved = current.branch.head_commit != snapshot.branch.head_commit
                    || current.branch.base_layer != snapshot.branch.base_layer;
                let root = if moved && !force {
                    let (root, report) =
                        self.merge_candidate(&save, &snapshot, &current, candidate)?;
                    merge = Some(report);
                    root
                } else {
                    candidate
                };
                retained.phase = CommitPhase::Finish;
                retained.saved = Some(save.finish().map_err(CommitError::Storage)?);
                Ok((root, current, moved))
            })();
            retained.storage = Some(super::producer::since(storage.diagnostics(), before));
            let (candidate, current, moved) = built?;
            producer = Some(storage);
            let conflicted = merge
                .as_ref()
                .is_some_and(|report: &MergeReport| !report.conflicts.is_empty());
            // A merge is published against the head it merged with; a forced
            // or unmoved Commit against the head the Workspace bound.
            let target = if merge.is_some() { &current } else { &snapshot };
            if !conflicted {
                retained.intent = Some(CommitRequest {
                    branch: snapshot.branch.id,
                    expected_head: target.branch.head_commit,
                    expected_base: target.branch.base_layer,
                    expected_root: target.effective_root,
                    candidate_root: candidate.0,
                    profile: snapshot.profile,
                    scope: snapshot.scope,
                    second_parent: None,
                    meta: CommitMeta {
                        agent: options.agent.clone(),
                        call: options.call.clone(),
                        merged_from: merge.as_ref().and_then(|report| report.from),
                        ..CommitMeta::new(CommitVia::Workspace)
                    },
                    force: force && moved,
                });
            }
            retained.phase = CommitPhase::Validate;
            let ports = self.store.ports(snapshot.scope);
            let client = ports.client();
            let mut next = target.clone();
            next.effective_root = candidate.0;
            let checked =
                checked_base(client.clone(), &next).map_err(|error| CommitError::Content {
                    error,
                    provider: ports
                        .failure()
                        .unwrap_or_else(|error| Some(Arc::new(error))),
                })?;
            if checked.root().root_inode() != original_base.root().root_inode() {
                return Err(CommitError::Context(
                    "candidate changes root inode identity",
                ));
            }
            let scoped = self
                .workspace
                .scoped(client)
                .map_err(CommitError::Workspace)?;
            retained.prepared = Some(
                scoped
                    .prepare_base_install(capture, candidate)
                    .map_err(CommitError::Workspace)?,
            );
            let pending = if conflicted {
                // Nothing is published: the history binding follows the head
                // merged with, and the merge stays the local base.
                next = current.clone();
                Some(super::commit_merge::PendingMerge {
                    local_root: candidate.0,
                    conflicted: merge
                        .as_ref()
                        .map(|report| report.conflicts.iter().map(|c| c.path.clone()).collect())
                        .unwrap_or_default(),
                })
            } else {
                retained.phase = CommitPhase::Publish;
                let outcome = self
                    .store
                    .history
                    .commit_branch(retained.intent.as_ref().expect("checked intent"))
                    .map_err(CommitError::History)?;
                let (head, root) = match &outcome {
                    CommitOutcome::Committed { record, .. } => (Some(record.id), record.root),
                    CommitOutcome::UpToDate { head, root } => (*head, *root),
                };
                retained.published = Some(outcome);
                if root != candidate.0 {
                    return Err(CommitError::Context(
                        "publication differs from saved candidate",
                    ));
                }
                published();
                next.branch.head_commit = head;
                next.head_root = head.map(|_| root);
                None
            };
            retained.phase = CommitPhase::Install;
            self.job(|job_client: &crate::OwnerClient, route| {
                job_client.install_prepared(
                    route,
                    self.workspace.clone(),
                    retained.prepared.take().expect("prepared install"),
                )
            })
            .map_err(CommitError::Owner)?;
            *self
                .snapshot
                .lock()
                .map_err(|_| CommitError::Workspace(WorkspaceError::BindingPoisoned))? = next;
            *self
                .pending
                .lock()
                .map_err(|_| CommitError::Workspace(WorkspaceError::BindingPoisoned))? = pending;
            Ok(())
        })();
        if let Err(error) = result {
            retained.error = error;
            return Err(self.settle_failure(retained));
        }
        if let Some(storage) = producer {
            self.producer.keep(storage);
        }
        Ok(CommitSuccess {
            history: retained.published,
            merge,
            saved: retained.saved.expect("known Save"),
            storage: retained.storage.expect("producer observations"),
            capture: retained.capture.expect("known capture"),
            namespace: None,
        })
    }
}
