//! One synchronous Content/Save/history producer and exact paired local install.
use super::{
    bind::checked_base, BoundWorkspace, CommitError, CommitFailure, CommitPhase, CommitSuccess,
};
use layerfs_content::filesystem::FilesystemRootId;
use layerfs_history::{BranchSnapshot, CommitOutcome, CommitRequest};
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
        let result = self.commit_admitted(construct, || ());
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
    /// with the saved candidate root; a failed or unknown publication, and
    /// every earlier failure, never runs it.
    pub(super) fn commit_admitted(
        &self,
        construct: impl FnOnce(
            &Save<'_>,
            Capture,
            &BranchSnapshot,
        ) -> Result<FilesystemRootId, CommitError>,
        published: impl FnOnce(),
    ) -> Result<CommitSuccess, Box<CommitFailure>> {
        let mut retained = CommitFailure::new(
            CommitError::Context("incomplete Commit"),
            self.identity,
            self.route(),
        );
        let mut producer = None;
        let result = (|| {
            let snapshot = self.snapshot().map_err(CommitError::Workspace)?;
            retained.binding = Some(snapshot.clone());
            let original_base = self.workspace.base().map_err(CommitError::Workspace)?;
            retained.phase = CommitPhase::Capture;
            let capture = self
                .job(|job_client: &crate::OwnerClient, job_route| job_client.capture(job_route))
                .map_err(CommitError::Owner)?;
            retained.capture = Some(capture);
            if capture.base_root != snapshot.effective_root.to_bytes()
                || original_base.identity().0 != snapshot.effective_root
            {
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
                retained.phase = CommitPhase::Finish;
                retained.saved = Some(save.finish().map_err(CommitError::Storage)?);
                Ok(candidate)
            })();
            retained.storage = Some(super::producer::since(storage.diagnostics(), before));
            let candidate = built?;
            producer = Some(storage);
            retained.intent = Some(CommitRequest {
                branch: snapshot.branch.id,
                expected_head: snapshot.branch.head_commit,
                expected_base: snapshot.branch.base_layer,
                expected_root: snapshot.effective_root,
                candidate_root: candidate.0,
                profile: snapshot.profile,
                scope: snapshot.scope,
                second_parent: None,
                force: false,
            });
            retained.phase = CommitPhase::Validate;
            let ports = self.store.ports(snapshot.scope);
            let client = ports.client();
            let mut next = snapshot.clone();
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
            history: retained.published.expect("known publication"),
            saved: retained.saved.expect("known Save"),
            storage: retained.storage.expect("producer observations"),
            capture: retained.capture.expect("known capture"),
            namespace: None,
        })
    }
}
