//! Owned container lifecycle; borrowed shared Store volume is never cleanup-owned.
use super::Docker;
use crate::{ContainerId, RuntimeError, WireFailure};
/// Explicit immutable image, existing VM volume and daemon TCP port.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SandboxRequest {
    pub image: String,
    pub store_volume: String,
    pub port: u16,
    /// Further existing volumes, each mounted read-only outside every
    /// Workspace and LayerFS path (a shared package store, for instance).
    pub volumes: Vec<ReadOnlyVolume>,
}
/// An existing plain local volume mounted read-only at an absolute `target`.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReadOnlyVolume {
    pub volume: String,
    pub target: String,
}
/// A Docker volume name, short enough for the inspection to compare it whole.
fn volume_name(name: &str) -> bool {
    !name.is_empty()
        && name.len() <= 128
        && name
            .bytes()
            .enumerate()
            .all(|(i, b)| b.is_ascii_alphanumeric() || (i != 0 && matches!(b, b'_' | b'-' | b'.')))
}
/// An absolute normalised path outside the root, Workspaces, LayerFS, kernel and scratch trees.
fn volume_target(target: &str) -> bool {
    let under = |root: &str| target == root || target.starts_with(&format!("{root}/"));
    target.len() <= 128
        && target.len() > 1
        && target.starts_with('/')
        && !target.ends_with('/')
        && target[1..]
            .split('/')
            .all(|part| !part.is_empty() && part != "." && part != "..")
        && !target.starts_with("/layerfs-")
        && !["/workspaces", "/proc", "/sys", "/dev", "/tmp"]
            .into_iter()
            .any(under)
}
impl SandboxRequest {
    pub(super) fn check(&self) -> Result<(), RuntimeError> {
        let digest = self
            .image
            .strip_prefix("sha256:")
            .ok_or(RuntimeError::Protocol("immutable image digest"))?;
        if digest.len() != 64
            || !digest
                .bytes()
                .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
            || self.port == 0
        {
            return Err(RuntimeError::Protocol("image digest/daemon port"));
        }
        if !volume_name(&self.store_volume) {
            return Err(RuntimeError::Protocol("existing named VM volume"));
        }
        for (i, v) in self.volumes.iter().enumerate() {
            if !volume_name(&v.volume) || v.volume == self.store_volume {
                return Err(RuntimeError::Protocol("read-only volume name"));
            }
            if !volume_target(&v.target) || self.volumes[..i].iter().any(|w| w.target == v.target) {
                return Err(RuntimeError::Protocol("read-only volume target"));
            }
        }
        Ok(())
    }
}
/// Original failed create retains request and partial decoded ID separately.
#[derive(Debug)]
pub struct SandboxCreateFailure {
    pub request: SandboxRequest,
    pub phase: CreatePhase,
    pub transfer: Box<WireFailure>,
}
/// A volume read has no create effect; Create may have an uncertain container effect.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum CreatePhase {
    Validate,
    Volume,
    Create,
}
/// One acknowledged container and its exact attempts. No Drop cleanup or replay.
#[derive(Debug)]
pub struct Sandbox {
    pub(super) docker: Docker,
    pub(super) id: ContainerId,
    pub(super) request: SandboxRequest,
    pub(super) upload_attempted: bool,
    pub(super) uploaded: bool,
    pub(super) start_attempted: bool,
    pub(super) started: bool,
    pub(super) listen_attempted: bool,
    pub(super) stop_attempted: bool,
    pub(super) stopped: bool,
    pub(super) delete_attempted: bool,
    pub(super) deleted: bool,
}
impl Sandbox {
    /// Original full acknowledged identity. Names and partial IDs are never adopted.
    pub fn identity(&self) -> ContainerId {
        self.id
    }
    /// Original immutable deployment request.
    pub fn request(&self) -> &SandboxRequest {
        &self.request
    }
    /// Positive complete original acknowledgments; failures leave uncertainty explicit.
    pub fn disposition(&self) -> SandboxDisposition {
        SandboxDisposition {
            uploaded: self.uploaded,
            started: self.started,
            stopped: self.stopped,
            deleted: self.deleted,
        }
    }
    pub(super) fn invalid(&self, message: &'static str) -> Box<WireFailure> {
        let mut f = super::http::failure(false, 0, None, RuntimeError::Protocol(message), None);
        f.requested_container = Some(self.id);
        f
    }
    pub(super) fn selected(&self, mut f: Box<WireFailure>) -> Box<WireFailure> {
        f.requested_container = Some(self.id);
        f
    }
}
/// Known acknowledgments only, not process or filesystem drain.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct SandboxDisposition {
    pub uploaded: bool,
    pub started: bool,
    pub stopped: bool,
    pub deleted: bool,
}
