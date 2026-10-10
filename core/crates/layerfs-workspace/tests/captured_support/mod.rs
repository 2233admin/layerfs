//! The owner, Workspace and canonical oracle shared by the captured file
//! construction tests.
#![allow(dead_code)]
use crate::common::{self, file, Fixture, Store};
use layerfs_content::{
    apply_edits, read_all, AuthenticatedObjects, ConstructionPolicy, ContentError, ContentResult,
    Edit, EditRequest, EditSequence, EditSource, ObjectId,
};
use layerfs_daemon::{Command, Completion, Owner, OwnerClient, OwnerConfig, Response};
use layerfs_overlay::{
    CapturedReader, IndexedOperationRecordScope, OperationOwner, ProfileConfig, Route,
};
use layerfs_telemetry::timer::Timing;
use layerfs_workspace::{
    BaseView, CanonicalClient, CapturedFileAttempt, CapturedFileCustody, CapturedFileEdits,
    InodeSerials, Operation, Outcome, Position, Time, Workspace, WorkspaceResult,
};
use std::{
    cell::Cell,
    collections::BTreeMap,
    path::PathBuf,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex,
    },
    time::{Duration, Instant},
};

pub const TIME: Time = Time {
    seconds: 1,
    nanoseconds: 0,
};
pub const CONTEXT: u32 = 0x4346_0000;
pub const EDITS: u32 = 0x4346_0001;
pub struct Objects {
    pub store: Store,
    pub calls: Mutex<BTreeMap<ObjectId, u64>>,
    pub refusal: Mutex<Option<(ObjectId, ContentError)>>,
}
impl AuthenticatedObjects for Objects {
    fn read_canonical_batch(&self, ids: &[ObjectId]) -> ContentResult<Vec<Vec<u8>>> {
        for id in ids {
            *self.calls.lock().unwrap().entry(*id).or_default() += 1;
        }
        if let Some((id, cause)) = &*self.refusal.lock().unwrap() {
            if ids.contains(id) {
                return Err(cause.clone());
            }
        }
        self.store.read_canonical_batch(ids)
    }
}
pub struct Serials(pub AtomicU64);
impl InodeSerials for Serials {
    fn reserve(&self, count: u64) -> WorkspaceResult<(u64, u64)> {
        Ok((self.0.fetch_add(count, Ordering::Relaxed), count))
    }
}
pub struct Case {
    pub owner: Option<Owner>,
    pub client: OwnerClient,
    pub workspace: Arc<Workspace>,
    pub objects: Arc<Objects>,
    pub store: Store,
    pub bytes: Vec<u8>,
    pub route: Route,
    pub next: Cell<u64>,
    pub serials: Serials,
    pub path: PathBuf,
}
impl Case {
    pub fn new() -> Self {
        Self::over(common::fixture())
    }
    /// The same owner and Workspace over a caller's base.
    pub fn over(f: Fixture) -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(0);
        let objects = Arc::new(Objects {
            store: f.store.clone(),
            calls: Mutex::new(BTreeMap::new()),
            refusal: Mutex::new(None),
        });
        let canonical = Arc::new(CanonicalClient::with_lengths(
            objects.clone(),
            Arc::new(f.store.clone()),
            0,
        ));
        let base = BaseView::open(canonical, f.root, f.scope).unwrap();
        let path = std::env::temp_dir().join(format!(
            "layerfs-captured-edits-{}-{}.sqlite",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        let owner = Owner::start(&path, ProfileConfig::default(), OwnerConfig::default()).unwrap();
        let client = owner.client();
        let opened = job(
            &client,
            None,
            Command::Open {
                incarnation: [91; 32],
                base_root: f.root.0.to_bytes(),
            },
        );
        let route = match opened.result() {
            Ok(Response::Opened(route)) => *route,
            other => panic!("{other:?}"),
        };
        drop(opened);
        Self {
            owner: Some(owner),
            client,
            workspace: Arc::new(Workspace::bind(route, base)),
            objects,
            store: f.store,
            bytes: f.bytes,
            route,
            next: Cell::new(0),
            serials: Serials(AtomicU64::new(1000)),
            path,
        }
    }
    pub fn request(&self) -> u64 {
        let value = self.next.get() + 1;
        self.next.set(value);
        value
    }
    pub fn job(&self, command: Command) -> Completion {
        job(&self.client, Some(self.route), command)
    }
    pub fn mutate(&self, operation: Operation) -> Option<layerfs_workspace::ViewStat> {
        let acquired = self.job(Command::AcquireBaseSource {
            owner: self.request(),
        });
        let source = match acquired.result() {
            Ok(Response::BaseSource(source)) => *source,
            other => panic!("{other:?}"),
        };
        drop(acquired);
        let view = self.workspace.view_for_source(source).unwrap();
        let outcome = self
            .workspace
            .mutate(&self.client, &self.serials, &view, operation, TIME)
            .unwrap();
        let result = match outcome {
            Outcome::Applied { publication, stat } => {
                assert!(self
                    .job(Command::ReplyAttempted(publication))
                    .result()
                    .is_ok());
                stat
            }
            Outcome::Unchanged { stat } => stat,
        };
        assert!(self
            .job(Command::ReleaseBaseSource(source))
            .result()
            .is_ok());
        result
    }
    pub fn write(&self, serial: u64, at: u64, bytes: &[u8]) {
        self.mutate(Operation::Write {
            serial,
            position: Position::At(at),
            data: bytes.into(),
        });
    }
    pub fn size(&self, serial: u64, size: u64) {
        self.mutate(Operation::SetAttributes {
            serial,
            mode: None,
            mtime: None,
            size: Some(size),
        });
    }
    pub fn captured(&self, file_scope: u64) -> (CapturedReader, IndexedOperationRecordScope) {
        let captured = self.job(Command::Capture);
        let capture = match captured.result() {
            Ok(Response::Captured(capture)) => *capture,
            other => panic!("{other:?}"),
        };
        drop(captured);
        let acquired = self.job(Command::AcquireCapturedReader {
            capture,
            request: self.request(),
        });
        let reader = match acquired.result() {
            Ok(Response::CapturedReader(Some(reader))) => *reader,
            other => panic!("{other:?}"),
        };
        drop(acquired);
        let acquired = self.job(Command::AcquireOperation {
            request: self.request(),
        });
        let owner = match acquired.result() {
            Ok(Response::Operation(Some(owner))) => *owner,
            other => panic!("{other:?}"),
        };
        drop(acquired);
        (reader, IndexedOperationRecordScope { owner, file_scope })
    }
    pub fn construct(
        &self,
        reader: CapturedReader,
        scope: IndexedOperationRecordScope,
        serial: u64,
    ) -> CapturedFileAttempt {
        let prepared =
            CapturedFileEdits::prepare(&self.workspace, &self.client, reader, serial, scope)
                .unwrap();
        let policy = ConstructionPolicy::frozen_default();
        Timing::disabled("captured-proof", |timing| {
            Ok::<CapturedFileAttempt, ContentError>(prepared.construct(
                policy,
                &policy.capacities(),
                &mut self.store.clone(),
                timing.child("construct"),
            ))
        })
        .0
        .unwrap()
    }
    pub fn release(&self, custody: CapturedFileCustody, reader_released: bool) {
        let reader = custody.reader;
        let operation = custody.records.scope.owner;
        drop(custody); // First drop original credited outcomes, not their engine owners.
        if !reader_released {
            assert!(self
                .job(Command::ReleaseCapturedReader(reader))
                .result()
                .is_ok());
        }
        release_operation(self, operation);
    }
    pub fn oracle(&self, root: ObjectId, expected: &[u8], edits: Option<&Model>) {
        let mut bytes = Vec::new();
        Timing::disabled("oracle", |scope| {
            read_all(&self.store, root, &mut bytes, scope.child("read"))
        })
        .0
        .unwrap();
        assert_eq!(bytes, expected);
        let canonical = match edits {
            None => file(&self.store, expected),
            Some(edits) => {
                Timing::disabled("byte-edit-oracle", |scope| {
                    apply_edits(
                        ConstructionPolicy::frozen_default(),
                        &ConstructionPolicy::frozen_default().capacities(),
                        &self.store,
                        EditRequest {
                            root: edits.root,
                            edits,
                            source: edits,
                        },
                        &mut self.store.clone(),
                        scope.child("construct"),
                    )
                })
                .0
                .unwrap()
                .root
            }
        };
        assert_eq!(
            root, canonical,
            "independent final bytes and original byte-source canonical route"
        );
    }
}
impl Drop for Case {
    fn drop(&mut self) {
        if let Some(owner) = self.owner.take() {
            owner.stop().unwrap();
        }
        let _ = std::fs::remove_file(&self.path);
    }
}
pub fn job(client: &OwnerClient, route: Option<Route>, command: Command) -> Completion {
    let pending = client
        .try_submit(route, command)
        .unwrap_or_else(|(cause, original)| panic!("original admission: {cause:?} {original:?}"));
    let end = Instant::now() + Duration::from_secs(3);
    loop {
        if let Some(original) = pending.try_complete().unwrap() {
            return original;
        }
        assert!(Instant::now() < end, "bounded original owner job");
        std::thread::yield_now();
    }
}
/// The engine thread drops its own final credit after the consumer observes a
/// completion: bound the wait for that release before an exact counter check.
pub fn settled(client: &OwnerClient, outstanding: usize) {
    let end = Instant::now() + Duration::from_secs(3);
    while client.diagnostics().unwrap().outstanding != outstanding {
        assert!(
            Instant::now() < end,
            "engine did not release its final credit"
        );
        std::thread::yield_now();
    }
}
pub fn release_operation(case: &Case, owner: OperationOwner) {
    assert!(case.job(Command::ReleaseOperation(owner)).result().is_ok());
}
pub struct Model {
    pub root: ObjectId,
    pub base: u64,
    pub bytes: Vec<u8>,
    pub edits: Vec<Edit>,
}
impl EditSequence for Model {
    fn base_len(&self) -> u64 {
        self.base
    }
    fn final_len(&self) -> u64 {
        self.bytes.len() as u64
    }
    fn len(&self) -> usize {
        self.edits.len()
    }
    fn edit_at(&self, index: usize) -> ContentResult<Edit> {
        self.edits
            .get(index)
            .copied()
            .ok_or(ContentError::InvalidRecord("oracle edit index"))
    }
}
impl EditSource for Model {
    fn replacement_len(&self, index: usize) -> u64 {
        self.edits[index].replacement_len()
    }
    fn read_at(&self, index: usize, offset: u64, output: &mut [u8]) -> ContentResult<usize> {
        let edit = self.edits[index];
        let start = edit.start() + offset;
        let count = (edit.replacement_len() - offset).min(output.len() as u64) as usize;
        output[..count].copy_from_slice(&self.bytes[start as usize..start as usize + count]);
        Ok(count)
    }
}
