//! Private Workspace mutations used by one atomic public filesystem call.
use super::args;
use crate::store::{BoundWorkspace, StoreOperation};
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use layerfs_content::filesystem::PathName;
use layerfs_workspace::{
    InodeSerials, Operation, Outcome, OverlayJobs, SourceView, Time, ViewStat, WorkspaceError,
};
pub(crate) type Result<T> = std::result::Result<T, SdkRefusal>;
pub(crate) struct Mutation<'a> {
    pub(crate) workspace: &'a BoundWorkspace,
    pub(crate) op: StoreOperation,
    pub(crate) view: SourceView,
    pub(crate) now: Time,
    serials: (u64, u64),
}
pub(crate) fn failure(e: WorkspaceError) -> SdkRefusal {
    let code = match &e {
        WorkspaceError::Refused(r) => match r {
            layerfs_workspace::Refusal::Missing => "NoSuchPath",
            layerfs_workspace::Refusal::Exists => "Exists",
            layerfs_workspace::Refusal::IsDirectory => "IsDirectory",
            layerfs_workspace::Refusal::NotDirectory => "NotDirectory",
            layerfs_workspace::Refusal::NotEmpty => "NotEmpty",
            _ => "InvalidInput",
        },
        layerfs_workspace::WorkspaceError::Content(layerfs_content::ContentError::PathNotFound) => {
            "NoSuchPath"
        }
        _ => "Unknown",
    };
    args::refuse(code, e.to_string(), SdkValue::Null)
}
impl<'a> Mutation<'a> {
    pub(crate) fn new(workspace: &'a BoundWorkspace) -> Result<Self> {
        let op = workspace.operation().map_err(failure)?;
        let source = op
            .overlay()
            .acquire_diagnostic_source(workspace.route())
            .map_err(args::failed)?;
        let view = op.workspace().view_for_source(source).map_err(failure)?;
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default();
        Ok(Self {
            workspace,
            op,
            view,
            now: Time {
                seconds: now.as_secs() as i64,
                nanoseconds: now.subsec_nanos(),
            },
            serials: (0, 0),
        })
    }
    pub(crate) fn finish(self) -> Result<()> {
        self.op
            .overlay()
            .release_base_source(self.workspace.route(), self.view.source())
            .map_err(args::failed)
    }
    fn serial(&mut self) -> Result<u64> {
        if self.serials.0 == self.serials.1 {
            let (start, count) = self.op.ports().reserve(64).map_err(failure)?;
            self.serials = (start, start + count);
        }
        let value = self.serials.0;
        self.serials.0 += 1;
        Ok(value)
    }
    pub(crate) fn apply(&mut self, operation: Operation) -> Result<Option<ViewStat>> {
        let serial = if operation.creates() {
            Some(self.serial()?)
        } else {
            None
        };
        let mut plan = self
            .op
            .workspace()
            .prepare_mutation(&self.view, operation, self.now, serial)
            .map_err(|e| failure(e.error))?;
        loop {
            let result = OverlayJobs::namespace(
                self.op.overlay(),
                plan.job().ok_or_else(|| args::failed("mutation stage"))?,
            );
            match plan.accept(result).map_err(failure)? {
                Some(Outcome::Applied { publication, stat }) => {
                    self.op
                        .overlay()
                        .reply_attempted(publication)
                        .map_err(args::failed)?;
                    return Ok(stat);
                }
                Some(Outcome::Unchanged { stat }) => return Ok(stat),
                None => plan.supply(&self.view).map_err(failure)?,
            }
        }
    }
    pub(crate) fn resolve(&self, path: &str) -> Result<ViewStat> {
        let mut stat = self
            .view
            .stat(self.op.overlay(), self.view.root_serial())
            .map_err(failure)?;
        for name in path.split('/').filter(|s| !s.is_empty()) {
            let name = PathName::new(name).map_err(args::content)?;
            stat = self
                .view
                .lookup(self.op.overlay(), stat.serial, &name)
                .map_err(failure)?;
        }
        Ok(stat)
    }
    pub(crate) fn optional(&self, path: &str) -> Result<Option<ViewStat>> {
        match self.resolve(path) {
            Ok(v) => Ok(Some(v)),
            Err(e) if e.code == "NoSuchPath" => Ok(None),
            Err(e) => Err(e),
        }
    }
    pub(crate) fn parent(&self, path: &str) -> Result<(u64, PathName)> {
        if path == "/" {
            return Err(args::invalid("cannot replace the root"));
        }
        let (parent, name) = path
            .rsplit_once('/')
            .ok_or_else(|| args::invalid("absolute path"))?;
        let parent = self.resolve(if parent.is_empty() { "/" } else { parent })?;
        Ok((parent.serial, PathName::new(name).map_err(args::content)?))
    }
    pub(crate) fn read(&self, serial: u64, offset: u64, length: u32) -> Result<Vec<u8>> {
        let mut bytes = Vec::new();
        self.view
            .read(self.op.overlay(), serial, offset, length, &mut bytes)
            .map_err(failure)?;
        Ok(bytes)
    }
    pub(crate) fn write_at(&mut self, serial: u64, offset: u64, bytes: &[u8]) -> Result<()> {
        self.apply(Operation::Write {
            serial,
            position: layerfs_workspace::Position::At(offset),
            data: bytes.into(),
        })?;
        Ok(())
    }
    pub(crate) fn write(&mut self, path: &str, bytes: &[u8]) -> Result<()> {
        let serial = match self.optional(path)? {
            Some(stat) => {
                if stat.kind != layerfs_content::object::inode_leaf::InodeKind::RegularFile {
                    return Err(args::refuse(
                        "IsDirectory",
                        "expected a regular file",
                        SdkValue::Null,
                    ));
                }
                if stat.logical_len == bytes.len() as u64
                    && self.read(stat.serial, 0, bytes.len() as u32)? == bytes
                {
                    return Ok(());
                }
                stat.serial
            }
            None => {
                let (parent, name) = self.parent(path)?;
                self.apply(Operation::Create {
                    parent,
                    name,
                    mode: 0o644,
                })?
                .ok_or_else(|| args::failed("created inode"))?
                .serial
            }
        };
        self.write_at(serial, 0, bytes)?;
        self.apply(Operation::SetAttributes {
            serial,
            mode: None,
            mtime: None,
            size: Some(bytes.len() as u64),
        })?;
        Ok(())
    }
    pub(crate) fn mkdir(&mut self, path: &str) -> Result<()> {
        let mut at = String::new();
        for name in path.split('/').filter(|s| !s.is_empty()) {
            at.push('/');
            at.push_str(name);
            match self.optional(&at)? {
                Some(s) if s.kind == layerfs_content::object::inode_leaf::InodeKind::Directory => {}
                Some(_) => return Err(args::refuse("NotDirectory", at, SdkValue::Null)),
                None => {
                    let (parent, name) = self.parent(&at)?;
                    self.apply(Operation::Mkdir {
                        parent,
                        name,
                        mode: 0o755,
                    })?;
                }
            }
        }
        Ok(())
    }
}
