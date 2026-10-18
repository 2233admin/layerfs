//! Names a merge's changed inodes from recorded bindings, top down.
//!
//! Each changed inode's recorded `(parent, name)` bindings are checked against
//! the tree and climbed to the root, so every path of every changed inode is
//! found with work that follows the changed inodes times their depth, not the
//! tree. An inode is named by the path a breadth-first walk from the root would
//! reach first: the fewest components, then name order component by component,
//! which is the order [`locate`](crate::compare::tree::locate) lists in.
//!
//! The answer is complete only when every inode on the way has as many checked
//! bindings as its reference count. Otherwise, or past the depth and path
//! bounds, there is no answer and the caller names the inodes by the
//! breadth-first walk; a stale or absent hint never changes a name.

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::rc::Rc;

use crate::compare::tree::TreeTable;
use crate::compare::BindingHints;
use crate::error::ContentResult;
use crate::filesystem::path::PathName;
use crate::object::AuthenticatedObjects;

/// Components beyond which a climb gives up.
const DEPTH: usize = 4096;
/// Paths of one inode beyond which a climb gives up.
const PATHS: usize = 1024;

/// One inode's paths, each as its components from the root.
type Paths = Rc<Vec<Vec<PathName>>>;

/// Climbs one tree's recorded bindings; each inode's paths are found once.
struct Climb<'r> {
    reader: &'r dyn AuthenticatedObjects,
    hints: &'r dyn BindingHints,
    tree: &'r TreeTable,
    /// Paths per inode; `None` when an inode cannot be named completely.
    paths: HashMap<u64, Option<Paths>>,
}

impl Climb<'_> {
    /// Every path of `serial`, or `None` when its bindings, or an ancestor's,
    /// are not all recorded.
    fn paths(&mut self, serial: u64, depth: usize) -> ContentResult<Option<Paths>> {
        if serial == self.tree.root_serial() {
            return Ok(Some(Rc::new(vec![Vec::new()])));
        }
        if let Some(known) = self.paths.get(&serial) {
            return Ok(known.clone());
        }
        let found = self.climb(serial, depth)?;
        self.paths.insert(serial, found.clone());
        Ok(found)
    }

    fn climb(&mut self, serial: u64, depth: usize) -> ContentResult<Option<Paths>> {
        if depth >= DEPTH {
            return Ok(None);
        }
        let Some(value) = self.tree.value(self.reader, serial)? else {
            return Ok(None);
        };
        let mut checked = BTreeSet::new();
        for (parent, name) in self.hints.bindings_of(serial)? {
            if self.tree.lookup(self.reader, parent, &name)? == Some(serial) {
                checked.insert((parent, name));
            }
        }
        if (checked.len() as u64) < value.namespace_ref_count.max(1) {
            return Ok(None);
        }
        let mut out = Vec::new();
        for (parent, name) in checked {
            let Some(above) = self.paths(parent, depth + 1)? else {
                return Ok(None);
            };
            for path in above.iter() {
                if out.len() == PATHS {
                    return Ok(None);
                }
                let mut path = path.clone();
                path.push(name.clone());
                out.push(path);
            }
        }
        Ok(Some(Rc::new(out)))
    }
}

/// The path [`locate`](crate::compare::tree::locate) would give each wanted
/// inode in `tree`, found from `hints` with work that follows the wanted
/// inodes times their depth; `None` when one of them cannot be named
/// completely from `hints` (the caller then uses `locate`).
pub fn name_from_hints(
    reader: &dyn AuthenticatedObjects,
    hints: &dyn BindingHints,
    tree: &TreeTable,
    wanted: &BTreeSet<u64>,
) -> ContentResult<Option<BTreeMap<u64, String>>> {
    let mut climb = Climb {
        reader,
        hints,
        tree,
        paths: HashMap::new(),
    };
    let mut named = BTreeMap::new();
    for serial in wanted {
        let Some(paths) = climb.paths(*serial, 0)? else {
            return Ok(None);
        };
        let Some(first) = paths
            .iter()
            .min_by(|a, b| a.len().cmp(&b.len()).then_with(|| a.cmp(b)))
        else {
            return Ok(None);
        };
        let path = if first.is_empty() {
            "/".to_owned()
        } else {
            first.iter().fold(String::new(), |mut path, name| {
                path.push('/');
                path.push_str(name.as_str());
                path
            })
        };
        named.insert(*serial, path);
    }
    Ok(Some(named))
}
