//! The ordered path changes applied to a draft over one immutable root.
//!
//! The draft keeps only what the changes touched, keyed by current path; every
//! other path resolves through its parent into the base tree. A change list is
//! checked as it goes and the first invalid change refuses the whole list, so
//! nothing partial is ever built. The rules and refusal codes are the SDK
//! simulator's `applyChanges`.

use std::collections::BTreeMap;

use layerfs_telemetry::timer::{Active, TimingScope};

use super::{PathOp, PathRefusal, MAXIMUM_DRAFT_PATHS};
use crate::compare::text::MAXIMUM_TEXT_BYTES;
use crate::compare::tree::{join, list_directory, EntryFacts, TreeTable};
use crate::error::{ContentError, ContentResult};
use crate::filesystem::directory::read::lookup;
use crate::filesystem::path::PathName;
use crate::filesystem::sorted::DirectoryRoot;
use crate::object::inode_leaf::{InodeKind, InodeValue};
use crate::object::AuthenticatedObjects;

/// One drafted entry.
#[derive(Clone, Debug, Eq, PartialEq)]
pub(super) enum Node {
    /// An inode of the base, possibly moved.
    Base(EntryFacts),
    /// File bytes; `like` keeps an existing file's value, `new` is a fresh serial.
    File {
        serial: u64,
        bytes: Vec<u8>,
        like: Option<InodeValue>,
        new: bool,
    },
    /// A new directory.
    Dir { serial: u64 },
    /// A copy of a file or symlink value under a fresh serial.
    Clone { serial: u64, value: InodeValue },
}

impl Node {
    pub(super) fn is_dir(&self) -> bool {
        match self {
            Self::Base(entry) => entry.value.kind == InodeKind::Directory,
            Self::Dir { .. } => true,
            Self::File { .. } | Self::Clone { .. } => false,
        }
    }

    pub(super) fn serial(&self) -> u64 {
        match self {
            Self::Base(entry) => entry.serial,
            Self::File { serial, .. } | Self::Dir { serial } | Self::Clone { serial, .. } => {
                *serial
            }
        }
    }
}

/// Parent path of an absolute path other than the root.
pub(super) fn parent(path: &str) -> &str {
    match path.rfind('/') {
        Some(0) | None => "/",
        Some(index) => &path[..index],
    }
}

/// True when `path` is `dir` or below it.
fn under(path: &str, dir: &str) -> bool {
    path == dir || path.starts_with(&format!("{}/", dir.trim_end_matches('/')))
}

pub(super) struct Draft<'a> {
    pub(super) reader: &'a dyn AuthenticatedObjects,
    pub(super) base: TreeTable,
    pub(super) entries: BTreeMap<String, Option<Node>>,
    pub(super) fresh: &'a mut dyn FnMut() -> ContentResult<u64>,
    pub(super) timing: &'a TimingScope<'a, Active>,
}

fn refusal(code: &'static str, path: &str) -> PathRefusal {
    PathRefusal {
        code,
        path: path.to_owned(),
        matches: None,
    }
}

type Step = ContentResult<Result<(), PathRefusal>>;

impl Draft<'_> {
    /// The entry at a path now.
    pub(super) fn resolve(&self, path: &str) -> ContentResult<Option<Node>> {
        if path == "/" {
            let serial = self.base.root_serial();
            let value = self
                .base
                .value(self.reader, serial)?
                .ok_or(ContentError::InvalidRecord("root inode record"))?;
            return Ok(Some(Node::Base(EntryFacts { serial, value })));
        }
        if let Some(entry) = self.entries.get(path) {
            return Ok(entry.clone());
        }
        let name = &path[path.rfind('/').map_or(0, |index| index + 1)..];
        match self.resolve(parent(path))? {
            Some(Node::Base(dir)) if dir.value.kind == InodeKind::Directory => {
                self.base_child(dir.value.content_root, name)
            }
            _ => Ok(None),
        }
    }

    fn base_child(
        &self,
        content: crate::object::ObjectId,
        name: &str,
    ) -> ContentResult<Option<Node>> {
        let Some(serial) = lookup(self.reader, DirectoryRoot(content), &PathName::new(name)?)?
        else {
            return Ok(None);
        };
        let value = self
            .base
            .value(self.reader, serial)?
            .ok_or(ContentError::InvalidRecord("bound inode record"))?;
        Ok(Some(Node::Base(EntryFacts { serial, value })))
    }

    /// The entries directly below a directory path, in name order.
    pub(super) fn children(&self, path: &str) -> ContentResult<Vec<(String, Node)>> {
        let mut out = BTreeMap::new();
        if let Some(Node::Base(dir)) = self.resolve(path)? {
            if dir.value.kind == InodeKind::Directory {
                let mut names = Vec::new();
                list_directory(self.reader, dir.value.content_root, |name, _| {
                    names.push(join(path, name));
                    Ok(names.len() <= MAXIMUM_DRAFT_PATHS)
                })?;
                for child in names {
                    if let Some(node) = self.resolve(&child)? {
                        out.insert(child, node);
                    }
                }
            }
        }
        for (child, node) in &self.entries {
            if child != path && parent(child) == path {
                match node {
                    Some(node) => out.insert(child.clone(), node.clone()),
                    None => out.remove(child),
                };
            }
        }
        Ok(out.into_iter().collect())
    }

    fn need(&self, path: &str) -> ContentResult<Result<Node, PathRefusal>> {
        Ok(self
            .resolve(path)?
            .ok_or_else(|| refusal("NoSuchPath", path)))
    }

    fn need_parent(&self, path: &str) -> ContentResult<Result<(), PathRefusal>> {
        let dir = parent(path);
        Ok(match self.resolve(dir)? {
            Some(node) if node.is_dir() => Ok(()),
            _ => Err(refusal("NoSuchPath", dir)),
        })
    }

    fn set(&mut self, path: &str, node: Option<Node>) -> ContentResult<()> {
        if self.entries.len() >= MAXIMUM_DRAFT_PATHS {
            return Err(ContentError::BoundedCapacityExceeded {
                what: "paths.draft",
                limit: MAXIMUM_DRAFT_PATHS as u64,
                actual: self.entries.len() as u64,
            });
        }
        self.entries.insert(path.to_owned(), node);
        Ok(())
    }

    /// The bytes of a file now, within the text bound.
    fn bytes(&self, node: &Node, path: &str) -> ContentResult<Result<Vec<u8>, PathRefusal>> {
        let value = match node {
            Node::File { bytes, .. } => return Ok(Ok(bytes.clone())),
            Node::Base(entry) => entry.value,
            Node::Clone { value, .. } => *value,
            Node::Dir { .. } => return Ok(Err(refusal("IsDirectory", path))),
        };
        if value.kind != InodeKind::RegularFile {
            return Ok(Err(refusal("IsDirectory", path)));
        }
        let mut bytes = Vec::new();
        match crate::file::read_all_bounded(
            self.reader,
            value.content_root,
            MAXIMUM_TEXT_BYTES,
            &mut bytes,
            self.timing.child("paths.read"),
        ) {
            Err(ContentError::BoundedCapacityExceeded { .. }) => Ok(Err(refusal("TooLarge", path))),
            other => other.map(|_| Ok(bytes)),
        }
    }

    /// Applies one change.
    pub(super) fn apply(&mut self, op: &PathOp) -> Step {
        match op {
            PathOp::Write { path, bytes } => self.write(path, bytes.clone()),
            PathOp::Edit {
                path,
                old,
                new,
                all,
            } => {
                let node = match self.need(path)? {
                    Ok(node) => node,
                    Err(refused) => return Ok(Err(refused)),
                };
                let text = match self.bytes(&node, path)? {
                    Ok(bytes) => String::from_utf8(bytes)
                        .map_err(|_| ContentError::InvalidRecord("edited file text")),
                    Err(refused) => return Ok(Err(refused)),
                };
                let Ok(text) = text else {
                    return Ok(Err(refusal("NotText", path)));
                };
                let count = if old.is_empty() {
                    0
                } else {
                    text.matches(old.as_str()).count()
                };
                if count == 0 {
                    return Ok(Err(refusal("NoMatch", path)));
                }
                if count > 1 && !all {
                    return Ok(Err(PathRefusal {
                        matches: Some(count),
                        ..refusal("AmbiguousMatch", path)
                    }));
                }
                let edited = if *all {
                    text.replace(old.as_str(), new)
                } else {
                    text.replacen(old.as_str(), new, 1)
                };
                self.write(path, edited.into_bytes())
            }
            PathOp::Mkdir { path, recursive } => self.mkdir(path, *recursive),
            PathOp::Remove { path, recursive } => {
                if path == "/" {
                    return Ok(Err(refusal("InvalidInput", path)));
                }
                let node = match self.need(path)? {
                    Ok(node) => node,
                    Err(refused) => return Ok(Err(refused)),
                };
                if node.is_dir() && !recursive && !self.children(path)?.is_empty() {
                    return Ok(Err(refusal("NotEmpty", path)));
                }
                self.entries.retain(|key, _| !under(key, path));
                self.set(path, None)?;
                Ok(Ok(()))
            }
            PathOp::Copy {
                from,
                to,
                recursive,
            } => self.copy(from, to, *recursive),
            PathOp::Move { from, to } => {
                let node = match self.need(from)? {
                    Ok(node) => node,
                    Err(refused) => return Ok(Err(refused)),
                };
                if self.resolve(to)?.is_some() {
                    return Ok(Err(refusal("Exists", to)));
                }
                if let Err(refused) = self.need_parent(to)? {
                    return Ok(Err(refused));
                }
                if under(to, from) {
                    return Ok(Err(refusal("InvalidMove", to)));
                }
                let moved: Vec<(String, Option<Node>)> = self
                    .entries
                    .iter()
                    .filter(|(key, _)| *key != from && under(key, from))
                    .map(|(key, node)| (format!("{to}{}", &key[from.len()..]), node.clone()))
                    .collect();
                self.entries.retain(|key, _| !under(key, from));
                self.set(from, None)?;
                self.set(to, Some(node))?;
                for (key, node) in moved {
                    self.set(&key, node)?;
                }
                Ok(Ok(()))
            }
        }
    }

    fn write(&mut self, path: &str, bytes: Vec<u8>) -> Step {
        if let Err(refused) = self.need_parent(path)? {
            return Ok(Err(refused));
        }
        let node = match self.resolve(path)? {
            Some(node) if node.is_dir() => return Ok(Err(refusal("IsDirectory", path))),
            Some(Node::Base(entry)) => Node::File {
                serial: entry.serial,
                bytes,
                like: Some(entry.value),
                new: false,
            },
            Some(Node::File {
                serial, like, new, ..
            }) => Node::File {
                serial,
                bytes,
                like,
                new,
            },
            Some(Node::Clone { serial, value }) => Node::File {
                serial,
                bytes,
                like: Some(value),
                new: true,
            },
            _ => Node::File {
                serial: (self.fresh)()?,
                bytes,
                like: None,
                new: true,
            },
        };
        self.set(path, Some(node))?;
        Ok(Ok(()))
    }

    fn mkdir(&mut self, path: &str, recursive: bool) -> Step {
        if let Some(node) = self.resolve(path)? {
            return Ok(if recursive && node.is_dir() {
                Ok(())
            } else {
                Err(refusal("Exists", path))
            });
        }
        if !recursive {
            if let Err(refused) = self.need_parent(path)? {
                return Ok(Err(refused));
            }
            let serial = (self.fresh)()?;
            self.set(path, Some(Node::Dir { serial }))?;
            return Ok(Ok(()));
        }
        let mut at = String::new();
        for part in path.split('/').filter(|part| !part.is_empty()) {
            at = format!("{at}/{part}");
            match self.resolve(&at)? {
                None => {
                    let serial = (self.fresh)()?;
                    self.set(&at, Some(Node::Dir { serial }))?;
                }
                Some(node) if !node.is_dir() => return Ok(Err(refusal("NotDirectory", &at))),
                Some(_) => {}
            }
        }
        Ok(Ok(()))
    }

    fn copy(&mut self, from: &str, to: &str, recursive: bool) -> Step {
        let node = match self.need(from)? {
            Ok(node) => node,
            Err(refused) => return Ok(Err(refused)),
        };
        if self.resolve(to)?.is_some() {
            return Ok(Err(refusal("Exists", to)));
        }
        if let Err(refused) = self.need_parent(to)? {
            return Ok(Err(refused));
        }
        if node.is_dir() && !recursive {
            return Ok(Err(refusal("IsDirectory", from)));
        }
        if under(to, from) {
            return Ok(Err(refusal("InvalidMove", to)));
        }
        let mut stack = vec![(from.to_owned(), to.to_owned(), node)];
        while let Some((source, target, node)) = stack.pop() {
            let copied = match &node {
                _ if node.is_dir() => Node::Dir {
                    serial: (self.fresh)()?,
                },
                Node::File { bytes, like, .. } => Node::File {
                    serial: (self.fresh)()?,
                    bytes: bytes.clone(),
                    like: *like,
                    new: true,
                },
                Node::Base(entry) => Node::Clone {
                    serial: (self.fresh)()?,
                    value: entry.value,
                },
                Node::Clone { value, .. } => Node::Clone {
                    serial: (self.fresh)()?,
                    value: *value,
                },
                Node::Dir { .. } => unreachable!("directory handled above"),
            };
            self.set(&target, Some(copied))?;
            if node.is_dir() {
                for (child, node) in self.children(&source)? {
                    let below = format!("{target}{}", &child[source.len()..]);
                    stack.push((child, below, node));
                }
            }
        }
        Ok(Ok(()))
    }
}
