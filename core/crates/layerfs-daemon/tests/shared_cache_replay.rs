//! Host replay of a five-stage development workload with a Commit after
//! every step, for one or several Workspaces of one daemon on branches
//! forked from one Layer: what the shared object cache is asked for, by
//! commands and by Commits, at a chosen allowance.
//!
//! This is a diagnostic. It prints counts as evidence and asserts only exact
//! arithmetic and the final trees. It is shaped like the mounted mixed
//! workload and is not that workload: it drives the Workspace operation API,
//! every operation walks its path from the root, and Workspaces take turns.
//! Like that workload, each stage returns every cycle to files and
//! directories an earlier cycle of the same Workspace created and committed,
//! and the base tree has one modification time.
//!
//! `SHARED_CACHE_REPLAY="workspaces,steps,allowance_kib,mode[,shape]"`
//! selects a run; without it a short one runs. Shape 1 is the per-tool-call
//! use: every step binds a new Workspace on the branch head, runs the
//! command, Commits and closes it, so each command reads what the Commit of
//! the Workspace before it wrote. Mode 1 first reads the whole base tree
//! through the shared cache, so that with an allowance that never evicts,
//! every later miss is an object a Commit wrote. Mode 2 also demands, after
//! every Commit, each object the new root has that no earlier root had: it
//! stands for a Commit that leaves what it constructed in the cache, and
//! what is still missed afterwards is what that could not have served.
//!
//! Real Disposable Store, real owner, no mount; nothing is timed; no thread.
#[allow(dead_code)]
#[path = "support/captured_drive.rs"]
mod drive;
#[allow(dead_code)]
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/shared_cache_rig.rs"]
mod rig;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;
use drive::evidence;
use layerfs_content::AuthenticatedObjects;
use layerfs_daemon::store::{BoundWorkspace, StoreWork};
use layerfs_workspace::ClientWork;
use rig::{apply, commit, pattern, Daemon, Do, Tree};
use std::{
    fs,
    path::Path,
    time::{Duration, SystemTime},
};

const STAGES: usize = 5;
const COHORTS: usize = 10;
const SOURCES: usize = 80;

fn tree(source: &Path) {
    let write = |path: String, seed: u32, length: usize| {
        let path = source.join(path);
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, pattern(seed, length)).unwrap();
    };
    for cohort in 0..COHORTS {
        for slot in 0..64 {
            write(
                format!("pool/c-{cohort:02}/p-{slot:02}"),
                (cohort * 64 + slot) as u32,
                1_024,
            );
        }
    }
    for directory in 0..SOURCES {
        for file in 0..50 {
            write(
                format!("src/d-{directory:03}/f-{file:02}"),
                (10_000 + directory * 50 + file) as u32,
                1_024 + 16 * file,
            );
        }
    }
    for sub in 0..2 {
        for file in 0..16 {
            write(
                format!("move/a/sub-{sub}/f-{file:02}"),
                20_000 + file as u32,
                900,
            );
        }
    }
    for file in 0..16 {
        write(format!("attr/t-{file:02}"), 21_000 + file as u32, 800);
        write(format!("del/root/f-{file:02}"), 22_000 + file as u32, 700);
    }
    for file in 0..8 {
        write(format!("ow/o-{file}"), 23_000 + file as u32, 600);
    }
    fs::create_dir(source.join("move/b")).unwrap();
    fs::create_dir(source.join("scratch")).unwrap();
    // One modification time for the whole base, children before parents.
    let stamp = SystemTime::UNIX_EPOCH + Duration::from_secs(1_600_000_000);
    let mut pending = vec![source.to_path_buf()];
    let mut directories = Vec::new();
    while let Some(directory) = pending.pop() {
        for entry in fs::read_dir(&directory).unwrap() {
            let path = entry.unwrap().path();
            if path.is_dir() {
                pending.push(path);
            } else {
                let file = fs::OpenOptions::new().write(true).open(path).unwrap();
                file.set_modified(stamp).unwrap();
            }
        }
        directories.push(directory);
    }
    for directory in directories.iter().rev() {
        fs::File::open(directory)
            .unwrap()
            .set_modified(stamp)
            .unwrap();
    }
}

/// One owned operation; `Do` borrows from it.
enum Op {
    Create(String, Vec<u8>),
    Mkdir(String),
    Remove(String),
    Rename(String, String),
    Write(String, u64, Vec<u8>),
    Chmod(String, u32),
    Utimens(String, i64),
    Link(String, String),
    Symlink(String, Vec<u8>),
}
/// The operations of one step, zero-based, for Workspace `w`.
fn operations(w: usize, step: usize) -> Vec<Op> {
    let (cycle, stage) = (step / STAGES, step % STAGES);
    assert!(cycle < 20, "the tree has room for twenty cycles");
    let seed = |n: usize| (1_000_000 + w * 100_000 + step * 1_000 + n) as u32;
    let mut ops = Vec::new();
    match stage {
        // Delete and create the 64 files of one cohort. Every other cycle
        // returns to cohort 0; the cycles between take a cohort each.
        0 => {
            let cohort = if cycle % 2 == 0 {
                0
            } else {
                ((cycle + 1) / 2 - 1) % COHORTS
            };
            for slot in 0..64 {
                let path = format!("pool/c-{cohort:02}/p-{slot:02}");
                ops.push(Op::Remove(path.clone()));
                ops.push(Op::Create(path, pattern(seed(slot), 1_024)));
            }
        }
        // Edit 16 files in place: 8 that every cycle edits, 8 new ones.
        1 => {
            for n in 0..8 {
                ops.push(Op::Write(
                    format!("src/d-000/f-{n:02}"),
                    128,
                    pattern(seed(n), 256),
                ));
                ops.push(Op::Write(
                    format!("src/d-{:03}/f-{n:02}", 10 + cycle),
                    128,
                    pattern(seed(8 + n), 256),
                ));
            }
        }
        // Replace the scratch directories; move two populated directories.
        2 => {
            for n in 0..4 {
                if cycle > 0 {
                    ops.push(Op::Remove(format!("scratch/s-{:02}-{n}", cycle - 1)));
                }
                ops.push(Op::Mkdir(format!("scratch/s-{cycle:02}-{n}")));
            }
            let (from, to) = if cycle % 2 == 0 {
                ("a", "b")
            } else {
                ("b", "a")
            };
            for sub in 0..2 {
                ops.push(Op::Rename(
                    format!("move/{from}/sub-{sub}"),
                    format!("move/{to}/sub-{sub}"),
                ));
            }
        }
        // Modes and times of 16 files; 8 hard links and 8 symlinks.
        3 => {
            for n in 0..16 {
                let file = format!("attr/t-{n:02}");
                let mode = if cycle % 2 == 0 { 0o600 } else { 0o644 };
                ops.push(Op::Chmod(file.clone(), mode));
                ops.push(Op::Utimens(file, 1_700_000_000 + seed(n) as i64));
            }
            for n in 0..8 {
                ops.push(Op::Link(format!("attr/t-{n:02}"), format!("attr/h-{n}")));
                ops.push(Op::Symlink(
                    format!("attr/s-{n}"),
                    format!("t-{n:02}").into_bytes(),
                ));
            }
        }
        // Delete and recreate a subtree; replace 8 files by rename; remove
        // the links of the stage before.
        _ => {
            for n in 0..16 {
                ops.push(Op::Remove(format!("del/root/f-{n:02}")));
            }
            ops.push(Op::Remove("del/root".into()));
            ops.push(Op::Mkdir("del/root".into()));
            for n in 0..16 {
                ops.push(Op::Create(
                    format!("del/root/f-{n:02}"),
                    pattern(seed(n), 700),
                ));
            }
            for n in 0..8 {
                ops.push(Op::Create(
                    format!("ow/tmp-{n}"),
                    pattern(seed(16 + n), 600),
                ));
                ops.push(Op::Rename(format!("ow/tmp-{n}"), format!("ow/o-{n}")));
                ops.push(Op::Remove(format!("attr/h-{n}")));
                ops.push(Op::Remove(format!("attr/s-{n}")));
            }
        }
    }
    ops
}
fn command(workspace: &BoundWorkspace, clock: &mut i64, w: usize, step: usize) -> usize {
    let ops = operations(w, step);
    for op in &ops {
        let done = match op {
            Op::Create(path, bytes) => {
                apply(workspace, clock, Do::Create(path, 0o644))
                    && apply(workspace, clock, Do::Write(path, 0, bytes))
            }
            Op::Mkdir(path) => apply(workspace, clock, Do::Mkdir(path, 0o755)),
            Op::Remove(path) => apply(workspace, clock, Do::Remove(path)),
            Op::Rename(from, to) => apply(workspace, clock, Do::Rename(from, to)),
            Op::Write(path, offset, bytes) => {
                apply(workspace, clock, Do::Write(path, *offset, bytes))
            }
            Op::Chmod(path, mode) => apply(workspace, clock, Do::Chmod(path, *mode)),
            Op::Utimens(path, seconds) => apply(workspace, clock, Do::Utimens(path, (*seconds, 7))),
            Op::Link(existing, path) => apply(workspace, clock, Do::Link(existing, path)),
            Op::Symlink(path, target) => apply(workspace, clock, Do::Symlink(path, target)),
        };
        assert!(done, "step {step} changed nothing at one operation");
    }
    ops.len()
}

/// Counter differences of one phase.
#[derive(Clone, Copy, Default)]
struct Phase {
    hits: u64,
    misses: u64,
    batches: u64,
    bytes: u64,
    evictions: u64,
    lengths: u64,
    grants: u64,
}
impl Phase {
    fn add(&mut self, other: Phase) {
        self.hits += other.hits;
        self.misses += other.misses;
        self.batches += other.batches;
        self.bytes += other.bytes;
        self.evictions += other.evictions;
        self.lengths += other.lengths;
        self.grants += other.grants;
    }
}
impl std::fmt::Display for Phase {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "hits={} misses={} upstream_batches={} authenticated_bytes={} evictions={} length_ids={} reader_grants={}",
            self.hits, self.misses, self.batches, self.bytes, self.evictions, self.lengths, self.grants
        )
    }
}
struct Seen(ClientWork, StoreWork, u64);
fn seen(daemon: &Daemon) -> Seen {
    Seen(
        daemon.cache(),
        daemon.store.work(),
        daemon.store.read_work().grants,
    )
}
/// The shared cache's phase between two observations. With `exact`, nothing
/// else asked the Store in between: every miss is then one object the
/// cache's port asked of it, and every upstream batch one Store demand.
fn phase(before: &Seen, after: &Seen, exact: bool) -> Phase {
    let phase = Phase {
        hits: after.0.cache_hits - before.0.cache_hits,
        misses: after.0.cache_misses - before.0.cache_misses,
        batches: after.0.upstream_batches - before.0.upstream_batches,
        bytes: after.0.authenticated_bytes - before.0.authenticated_bytes,
        evictions: after.0.evictions - before.0.evictions,
        lengths: after.1.length_ids - before.1.length_ids,
        grants: after.2 - before.2,
    };
    if exact {
        assert_eq!(phase.misses, after.1.object_ids - before.1.object_ids);
        assert_eq!(
            phase.batches,
            after.1.object_batches - before.1.object_batches
        );
    }
    phase
}

#[test]
fn replay_counts_what_commands_and_commits_ask_of_the_shared_cache() {
    let selected = std::env::var("SHARED_CACHE_REPLAY").unwrap_or_else(|_| "2,10,1024,0".into());
    let numbers: Vec<usize> = selected
        .split(',')
        .map(|n| {
            n.trim()
                .parse()
                .expect("workspaces,steps,allowance_kib,mode")
        })
        .collect();
    let (workspaces, steps, allowance_kib, mode, shape) = match numbers[..] {
        [workspaces, steps, allowance_kib, mode] => (workspaces, steps, allowance_kib, mode, 0),
        [workspaces, steps, allowance_kib, mode, shape] => {
            (workspaces, steps, allowance_kib, mode, shape)
        }
        _ => panic!("workspaces,steps,allowance_kib,mode[,shape]"),
    };
    let per_call = shape == 1;
    let allowance = allowance_kib * 1024;
    let tree = Tree::new("shared-cache-replay", workspaces, tree);
    let daemon = tree.daemon(4, allowance);
    let mut bound: Vec<_> = (0..workspaces)
        .map(|w| daemon.bind(tree.branches[w], 20 + w as u8))
        .collect();
    let mounted = seen(&daemon);
    let base = daemon.snapshot(tree.branches[0]);
    // The tracker and the expected walk use clients and caches of their own.
    let tracker = (mode == 2).then(|| {
        let tracker = daemon.tracker(&base);
        let (_, objects) = tracker.fresh(base.effective_root);
        evidence(format_args!(
            "  base: objects={} bytes={}",
            objects.len(),
            objects.iter().map(|(_, length)| length).sum::<usize>()
        ));
        tracker
    });
    let touched = if mode == 0 {
        Phase::default()
    } else {
        let expected = daemon.expected(&base);
        let before = seen(&daemon);
        model::assert_same(&expected, &drive::live(&bound[0]), "base");
        phase(&before, &seen(&daemon), true)
    };

    if per_call {
        for workspace in &bound {
            daemon.close(workspace);
        }
    }
    let mut clock = 1_800_000_000;
    let (mut commands, mut commits, mut seeds, mut binds) = (
        Phase::default(),
        Phase::default(),
        Phase::default(),
        Phase::default(),
    );
    let mut by_stage = [(Phase::default(), Phase::default()); STAGES];
    let (mut operations, mut seeded, mut seeded_bytes) = (0, 0_usize, 0_usize);
    let mut filled_at = None;
    for step in 0..steps {
        for (w, slot) in bound.iter_mut().enumerate() {
            if per_call {
                // The Workspace of the step before is closed; this one binds
                // the head its Commit published.
                let before = seen(&daemon);
                let number = (step * workspaces + w) as u32;
                *slot = daemon.bind_numbered(tree.branches[w], number);
                binds.add(phase(&before, &seen(&daemon), true));
            }
            let workspace = &*slot;
            let before = seen(&daemon);
            operations += command(workspace, &mut clock, w, step);
            let between = seen(&daemon);
            let root = commit(workspace);
            let after = seen(&daemon);
            let (ran, committed) = (
                phase(&before, &between, true),
                phase(&between, &after, true),
            );
            commands.add(ran);
            commits.add(committed);
            by_stage[step % STAGES].0.add(ran);
            by_stage[step % STAGES].1.add(committed);
            if let Some(tracker) = &tracker {
                // What the new root has that no earlier root had, demanded
                // through the shared cache as one Commit's worth of seeding.
                let (_, fresh) = tracker.fresh(root);
                let walked = seen(&daemon);
                let operation = workspace.operation().unwrap();
                for chunk in fresh.chunks(1_024) {
                    let ids: Vec<_> = chunk.iter().map(|(id, _)| *id).collect();
                    operation.client().read_canonical_batch(&ids).unwrap();
                }
                drop(operation);
                seeded += fresh.len();
                seeded_bytes += fresh.iter().map(|(_, length)| length).sum::<usize>();
                seeds.add(phase(&walked, &seen(&daemon), true));
            }
            if filled_at.is_none() && daemon.cache().evictions > 0 {
                filled_at = Some((step + 1, w));
            }
            if per_call {
                daemon.close(workspace);
            }
        }
    }
    let end = seen(&daemon);
    evidence(format_args!(
        "REPLAY workspaces={workspaces} steps={steps} commits={} operations={operations} allowance={allowance} mode={mode} shape={shape}",
        steps * workspaces
    ));
    let mut total = binds;
    total.add(commands);
    total.add(commits);
    evidence(format_args!("  binds:    {binds}"));
    evidence(format_args!("  total:    {total}"));
    evidence(format_args!(
        "  bind: hits={} misses={}",
        mounted.0.cache_hits, mounted.0.cache_misses
    ));
    evidence(format_args!("  pretouch: {touched}"));
    evidence(format_args!("  commands: {commands}"));
    evidence(format_args!("  commits:  {commits}"));
    evidence(format_args!(
        "  seeding:  objects={seeded} bytes={seeded_bytes} {seeds}"
    ));
    evidence(format_args!(
        "  end: charged={} cached_objects={} file_lengths={} evictions={} first_eviction_at_step_workspace={filled_at:?}",
        end.0.charged_cache_bytes, end.0.cached_objects, end.0.file_lengths, end.0.evictions
    ));
    evidence(format_args!(
        "  seeded by Commits: objects={} bytes={}",
        end.0.seeded_objects, end.0.seeded_bytes
    ));
    for (stage, (ran, committed)) in by_stage.iter().enumerate() {
        evidence(format_args!(
            "  stage {}: command misses={} hits={} bytes={} | commit misses={} hits={} bytes={}",
            stage + 1,
            ran.misses,
            ran.hits,
            ran.bytes,
            committed.misses,
            committed.hits,
            committed.bytes
        ));
    }

    // Each Workspace's live view is its own published root, read
    // independently from the Store port through a cache of the test's own.
    for (w, slot) in bound.iter_mut().enumerate() {
        if per_call {
            *slot = daemon.bind_numbered(tree.branches[w], u32::MAX - w as u32);
        }
        let expected = daemon.expected(&daemon.snapshot(tree.branches[w]));
        model::assert_same(&expected, &drive::live(slot), "replayed Workspace");
        daemon.close(slot);
    }
    assert!(daemon.cache().charged_cache_bytes <= allowance);
    drop(bound);
    daemon.stop();
    tree.finish();
}
