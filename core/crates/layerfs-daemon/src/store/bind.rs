//! One coherent snapshot and bounded root demand before local namespace creation.
use super::{BindError, BindPhase, BindRefusal, BindRequest, BindSuccess, BoundWorkspace, Store};
use crate::OwnerClient;
use layerfs_content::filesystem::{
    attributes::{read_portable, AttributeReadWork},
    directory::decode_directory_page,
    inode::read::{lookup, InodeReadWork, InodeTable},
    FilesystemRootId, InodeScope,
};
use layerfs_content::{AuthenticatedObjects, ContentError, ContentResult};
use layerfs_history::BranchSnapshot;
use layerfs_workspace::{BaseView, CanonicalClient, Workspace};
use std::sync::Arc;

impl Store {
    /// Performs one bind attempt. Root checks never enumerate the namespace.
    /// A lost Open outcome returns original intent; it permits no guessed close.
    #[allow(clippy::result_large_err)]
    pub fn bind(
        self: &Arc<Self>,
        owner: OwnerClient,
        request: BindRequest,
    ) -> Result<BindSuccess, BindRefusal> {
        let mut phase = BindPhase::Snapshot;
        let mut snapshot = None;
        self.mount_reader(request.workspace)
            .map_err(|error| BindRefusal {
                phase,
                request: request.clone(),
                snapshot: None,
                error: BindError::Read(error),
            })?;
        let result = (|| {
            let captured = self
                .reader(Some(request.workspace))
                .map_err(|error| BindError::Read(Arc::new(super::PortError::ReadAdmission(error))))?
                .snapshot(request.branch)
                .map_err(BindError::Read)?
                .ok_or(BindError::MissingBranch(request.branch))?;
            snapshot = Some(captured.clone());
            phase = BindPhase::Root;
            let ports = self.ports_for(captured.scope, request.workspace);
            let client = ports.client();
            let base = checked_base(client, &captured).map_err(|error| BindError::Content {
                error,
                provider: ports
                    .failure()
                    .unwrap_or_else(|error| Some(Arc::new(error))),
            })?;
            phase = BindPhase::Open;
            let route = owner
                .open(
                    None,
                    request.workspace.to_bytes(),
                    captured.effective_root.to_bytes(),
                )
                .map_err(BindError::Owner)?;
            let owner = owner.workspace_client(route).map_err(BindError::Owner)?;
            Ok(BindSuccess {
                workspace: BoundWorkspace {
                    store: self.clone(),
                    owner,
                    snapshot: std::sync::Mutex::new(captured),
                    identity: request.workspace,
                    workspace: Arc::new(Workspace::bind(route, base)),
                    committing: std::sync::atomic::AtomicBool::new(false),
                    producer: Default::default(),
                },
            })
        })();
        result.map_err(|error| {
            let error = match self.close_reader(request.workspace) {
                Ok(()) => error,
                Err(cause) => BindError::Cleanup {
                    original: Box::new(error),
                    cause,
                },
            };
            BindRefusal {
                phase,
                request,
                snapshot,
                error,
            }
        })
    }
}
pub(crate) fn checked_base(
    client: Arc<CanonicalClient>,
    snapshot: &BranchSnapshot,
) -> ContentResult<BaseView> {
    let base = BaseView::open(
        client.clone(),
        FilesystemRootId(snapshot.effective_root),
        InodeScope::from_object(snapshot.scope),
    )?;
    let root = base.root();
    if root.profile() != snapshot.profile {
        return Err(ContentError::ScopeMismatch {
            what: "Branch root profile",
        });
    }
    let serial = root.root_inode().serial();
    let value = lookup(
        client.as_ref(),
        InodeTable {
            root: root.inode_table(),
            root_serial: serial,
        },
        serial,
        &mut InodeReadWork::default(),
    )?
    .ok_or(ContentError::InvalidRecord("missing filesystem root inode"))?;
    value.validate(true)?;
    decode_directory_page(&client.read_canonical(value.content_root)?)?;
    read_portable(
        client.as_ref(),
        value.metadata_root,
        value.kind,
        &mut AttributeReadWork::default(),
    )?;
    Ok(base)
}
