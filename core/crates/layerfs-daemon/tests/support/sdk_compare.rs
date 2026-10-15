//! Public daemon SDK calls over a disposable installed Store, with exact demand counts.
use super::installed;
use layerfs_bridge::control::{
    Answer, CommitControl, Reply, Request, SdkCall, SdkValue, UnmountControl,
};
use layerfs_content::filesystem::PathName;
use layerfs_daemon::{
    bootstrap::{open_store_observed, OpenedStore},
    control::Service,
    Owner, OwnerConfig,
};
use layerfs_history::{BranchId, CommitOutcome, HistoryName, LayerStackId, WorkspaceId};
use layerfs_workspace::{Operation, Outcome, Time};
use std::path::Path;

pub struct Fixture {
    pub host: installed::Fixture,
    pub opened: OpenedStore,
    pub owner: Owner,
    pub service: Service,
}

#[derive(Clone, Copy, Debug)]
pub struct Work {
    pub object_batches: u64,
    pub object_ids: u64,
    pub statements: u64,
}

impl Fixture {
    pub fn new(label: &str, build: impl FnOnce(&Path) -> usize) -> Self {
        let host = installed::Fixture::built(label, build);
        let config = OwnerConfig::default();
        let opened = open_store_observed(
            host.config.clone(),
            installed::BINDING,
            installed::CURSOR,
            config.namespaces,
            64 * 1024,
            layerfs_storage::ReservationBlocks::default(),
        )
        .unwrap();
        let owner = Owner::start(
            &host.directory.join("overlay.sqlite"),
            layerfs_overlay::ProfileConfig::default(),
            config,
        )
        .unwrap();
        let service = Service::new(opened.store.clone(), &owner);
        Self {
            host,
            opened,
            owner,
            service,
        }
    }

    pub fn call(&self, method: &str, mut fields: Vec<(&str, SdkValue)>) -> SdkValue {
        fields.push(("project", SdkValue::text("installed")));
        let request = Request::Sdk(SdkCall {
            method: method.into(),
            args: SdkValue::Map(
                fields
                    .into_iter()
                    .map(|(name, value)| (name.to_owned(), value))
                    .collect(),
            ),
        });
        let answer = self.service.execute_control(&request).unwrap().reply;
        // Every answer must still be encodable as the existing bounded control reply.
        let encoded = Answer {
            id: 1,
            reply: answer.clone(),
        }
        .encode()
        .unwrap();
        assert!(encoded.len() <= layerfs_bridge::duplex::MAX_PLAINTEXT_BYTES);
        match answer {
            Reply::Sdk(value) => value,
            other => panic!("{method} returned {other:?}"),
        }
    }

    pub fn fork(&self, name: &str) {
        self.call("branch.fork", vec![("name", SdkValue::text(name))]);
    }

    pub fn apply(&self, branch: &str, changes: Vec<SdkValue>) -> SdkValue {
        self.call(
            "fs.apply",
            vec![
                ("branch", SdkValue::text(branch)),
                ("changes", SdkValue::List(changes)),
            ],
        )
    }

    pub fn diff(&self, from: &str, to: &str, limit: i64, position: i64) -> SdkValue {
        self.call(
            "branch.diff_branches",
            vec![
                ("from", SdkValue::text(from)),
                ("to", SdkValue::text(to)),
                ("pageSize", SdkValue::Int(limit)),
                ("pagePos", SdkValue::Int(position)),
            ],
        )
    }

    /// A real Workspace chmod and product Commit prepare a metadata-only snapshot.
    pub fn chmod(&self, branch: &str, path: &str, mode: u32) -> String {
        let bound = self
            .service
            .execute_control(&Request::Mount {
                workspace: WorkspaceId::from_authority([77; 32]).unwrap(),
                branch: BranchId::named(
                    LayerStackId::from_authority([23; 16]),
                    &HistoryName::new(branch).unwrap(),
                ),
            })
            .unwrap();
        let Reply::Bound { token, .. } = bound.reply else {
            panic!("chmod binding: {:?}", bound.reply);
        };
        let operation = self.service.operation(token).unwrap();
        let route = operation.workspace().route();
        let source = operation
            .overlay()
            .acquire_base_source(route, 9001)
            .unwrap();
        let view = operation.workspace().view_for_source(source).unwrap();
        let mut serial = view.root_serial();
        for name in path.split('/').filter(|part| !part.is_empty()) {
            serial = view
                .lookup(operation.overlay(), serial, &PathName::new(name).unwrap())
                .unwrap()
                .serial;
        }
        let applied = operation
            .workspace()
            .mutate(
                operation.overlay(),
                operation.ports(),
                &view,
                Operation::SetAttributes {
                    serial,
                    mode: Some(mode),
                    mtime: None,
                    size: None,
                },
                Time {
                    seconds: 123,
                    nanoseconds: 0,
                },
            )
            .unwrap();
        let Outcome::Applied { publication, .. } = applied else {
            panic!("chmod mutation: {applied:?}");
        };
        operation.overlay().reply_attempted(publication).unwrap();
        drop(view);
        operation
            .overlay()
            .release_base_source(route, source)
            .unwrap();
        drop(operation);
        let committed = self
            .service
            .execute_control(&Request::Commit(CommitControl {
                token,
                force: false,
                message: Some("Prepare directory metadata diff".into()),
            }))
            .unwrap();
        let Reply::Committed(CommitOutcome::Committed { record, .. }) = committed.reply else {
            panic!("chmod Commit: {:?}", committed.reply);
        };
        self.service
            .execute_control(&Request::Unmount(UnmountControl {
                token,
                discard: true,
            }))
            .unwrap();
        record.id.to_string()
    }

    pub fn work(&self) -> Work {
        let store = self.opened.store.work();
        let sql = self.opened.diagnostics().unwrap();
        Work {
            object_batches: store.object_batches,
            object_ids: store.object_ids,
            statements: sql.writer.statements
                + sql
                    .readers
                    .iter()
                    .map(|reader| reader.statements)
                    .sum::<u64>(),
        }
    }

    pub fn since(&self, before: Work) -> Work {
        let after = self.work();
        Work {
            object_batches: after.object_batches - before.object_batches,
            object_ids: after.object_ids - before.object_ids,
            statements: after.statements - before.statements,
        }
    }

    pub fn cleanup(self) {
        drop(self.service);
        self.owner.stop().unwrap();
        drop(self.opened);
        self.host.cleanup();
    }
}

pub fn write(path: &str, bytes: impl Into<Vec<u8>>) -> SdkValue {
    SdkValue::map([
        ("op", SdkValue::text("write")),
        ("path", SdkValue::text(path)),
        ("bytes", SdkValue::Bytes(bytes.into())),
    ])
}

pub fn operation(kind: &str, path: &str) -> SdkValue {
    SdkValue::map([("op", SdkValue::text(kind)), ("path", SdkValue::text(path))])
}

pub fn items(value: &SdkValue) -> &[SdkValue] {
    match value.get("items") {
        Some(SdkValue::List(items)) => items,
        _ => panic!("missing items: {value:?}"),
    }
}

pub fn paths(value: &SdkValue) -> Vec<&str> {
    items(value)
        .iter()
        .map(|item| item.get_text("path").unwrap())
        .collect()
}
