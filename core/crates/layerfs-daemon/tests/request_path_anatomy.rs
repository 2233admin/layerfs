//! What the request path costs the overlay owner, pinned: for the request
//! sequences of five benchmark cells, the owner jobs, statements by template,
//! write transactions and VM steps of each kind of request.
//!
//! The sequences are the kernel requests the mounted cells issue (their
//! opcode counts are those of the retained receipts of
//! `docs/issues/307/checks/r7-optimization-20261009`), replayed in order
//! through the daemon's Fuse port on the real owner and the real Store,
//! without a kernel mount. `docs/issues/320/REQUEST-PATH.md` reads the
//! numbers. Public API only; every wait is bounded and no thread is spawned.
#[allow(dead_code)]
#[path = "support/request_path.rs"]
mod request_path;
#[path = "support/statement_trace.rs"]
mod statement_trace;
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod support;

use request_path::{Anatomy, Rig};

const FILES: usize = 1000;
/// One WRITE of `dd bs=1M` and one READ: the negotiated window.
const WINDOW: usize = layerfs_overlay::READ_WINDOW;
const BIG: usize = 64 * 1024 * 1024;

fn empty(_: &std::path::Path) -> usize {
    0
}
/// `for i in $(seq 1 1000); do echo $i > f$i; done` in the mount's root: per
/// file the directory's attributes (the previous create invalidated them),
/// a LOOKUP that misses, CREATE, one WRITE and RELEASE.
fn create_files(rig: &Rig) -> Vec<u64> {
    (1..=FILES)
        .map(|index| {
            let child = format!("f{index}");
            rig.getattr(rig.root);
            rig.lookup_miss(rig.root, &child);
            let (serial, handle) = rig.create(rig.root, &child);
            rig.write(serial, handle, 0, format!("{index}\n").as_bytes());
            rig.release(serial, handle);
            serial
        })
        .collect()
}
/// What one replayed command must cost, exactly.
struct Pinned {
    /// Kernel requests that reach the owner. The mounted cell counts one
    /// FLUSH more, and C10 one refused COPY_FILE_RANGE: neither has a job.
    requests: u64,
    /// Owner jobs, with the control plane's one state job.
    owner_jobs: u64,
    /// Statement executions, as a cell counts them: every statement and
    /// every accounting trigger program it runs.
    statements: u64,
    /// Statements the engine attempted.
    attempts: u64,
    transactions: u64,
    /// VM steps under `VM_STEPS_SQLITE`; another SQLite build may differ.
    vm_steps: u64,
    /// Jobs, transactions, attempts, executions and statements by template
    /// of every kind of request.
    counts: &'static str,
}
/// The SQLite library whose VM step counts are pinned.
const VM_STEPS_SQLITE: &str = "3.51.0";

fn finished(rig: Rig, label: &str, pinned: Pinned) {
    rig.status();
    let anatomy = Anatomy::of(&rig);
    print!("{}", anatomy.report(label));
    rig.stop();
    let counts = anatomy.counts();
    println!("REQUEST_PATH_COUNTS {label} BEGIN\n{counts}REQUEST_PATH_COUNTS {label} END");
    let (requests, owner_jobs, statements) = anatomy.headline();
    assert_eq!(
        (
            requests,
            owner_jobs,
            statements,
            anatomy.attempts(),
            anatomy.transactions()
        ),
        (
            pinned.requests,
            pinned.owner_jobs,
            pinned.statements,
            pinned.attempts,
            pinned.transactions
        ),
        "{label}: requests, owner jobs, executions, attempts, transactions"
    );
    assert_eq!(counts, pinned.counts, "{label}");
    let library = statement_trace::sqlite_version();
    if library == VM_STEPS_SQLITE {
        assert_eq!(anatomy.vm_steps(), pinned.vm_steps, "{label}: VM steps");
    } else {
        println!("REQUEST_PATH {label}: VM steps not compared under SQLite {library}");
    }
}

/// C01: create 1,000 small files in one directory.
#[test]
fn c01_create_files() {
    let rig = Rig::new("request-path-c01", 161, empty);
    create_files(&rig);
    rig.getattr(rig.root);
    finished(
        rig,
        "C01",
        Pinned {
            requests: 5_001,
            owner_jobs: 5_002,
            statements: 36_003,
            attempts: 29_002,
            transactions: 3_000,
            vm_steps: 1_554_143,
            counts: include_str!("support/request_path_counts/c01.txt"),
        },
    );
}

/// C03: create 1,000 small files, then `rm f*`: the shell lists the
/// directory, and `rm` stats and unlinks each name; the kernel forgets each
/// removed inode.
#[test]
fn c03_create_and_remove_files() {
    let rig = Rig::new("request-path-c03", 163, empty);
    let serials = create_files(&rig);
    rig.getattr(rig.root);
    let handle = rig.opendir(rig.root);
    let mut offset = 0;
    let mut names = 0;
    loop {
        let page = rig.readdir(rig.root, handle, offset);
        let Some((_, last)) = page.last() else { break };
        offset = *last;
        names += page.len();
    }
    assert_eq!(names, FILES + 2, "every name and both dots");
    rig.releasedir(rig.root, handle);
    rig.settle();
    for (index, serial) in serials.iter().enumerate() {
        rig.getattr(rig.root);
        rig.getattr(*serial);
        rig.unlink(rig.root, &format!("f{}", index + 1));
        rig.forget(*serial, 1);
    }
    finished(
        rig,
        "C03",
        Pinned {
            requests: 9_020,
            owner_jobs: 9_037,
            statements: 89_200,
            attempts: 73_181,
            transactions: 5_018,
            vm_steps: 3_430_225,
            counts: include_str!("support/request_path_counts/c03.txt"),
        },
    );
}

/// C04: `mkdir -p $a/$b` for ten by ten directories and `touch` ten files in
/// each. A second `mkdir -p` under the same `$a` looks `$a` up again, and
/// every path walk refreshes the attributes of the directory the previous
/// request changed.
#[test]
fn c04_make_a_tree() {
    let rig = Rig::new("request-path-c04", 164, empty);
    rig.getattr(rig.root);
    for a in 1..=10 {
        let outer_name = a.to_string();
        rig.lookup_miss(rig.root, &outer_name);
        let outer = rig.mkdir(rig.root, &outer_name);
        let handle = rig.opendir(outer);
        rig.releasedir(outer, handle);
        for b in 1..=10 {
            let inner_name = b.to_string();
            if b == 1 {
                // The first walk from the root after `$a` was made.
            } else {
                assert_eq!(rig.lookup(rig.root, &outer_name), outer);
            }
            rig.lookup_miss(outer, &inner_name);
            let inner = rig.mkdir(outer, &inner_name);
            for c in 1..=10 {
                let child = c.to_string();
                if b == 1 && c == 1 {
                    rig.getattr(rig.root);
                }
                rig.getattr(if c == 1 { outer } else { inner });
                rig.lookup_miss(inner, &child);
                let (serial, handle) = rig.create(inner, &child);
                rig.touch(serial);
                rig.release(serial, handle);
            }
        }
    }
    finished(
        rig,
        "C04",
        Pinned {
            requests: 5_341,
            owner_jobs: 5_342,
            statements: 36_073,
            attempts: 29_502,
            transactions: 3_220,
            vm_steps: 1_529_988,
            counts: include_str!("support/request_path_counts/c04.txt"),
        },
    );
}

/// C06: `dd if=/dev/zero of=big bs=1M count=64`: 512 WRITEs of one window.
#[test]
fn c06_write_one_large_file() {
    let rig = Rig::new("request-path-c06", 166, empty);
    rig.getattr(rig.root);
    rig.lookup_miss(rig.root, "big");
    let (serial, handle) = rig.create(rig.root, "big");
    let zeros = vec![0_u8; WINDOW];
    for window in 0..BIG / WINDOW {
        rig.write(serial, handle, (window * WINDOW) as u64, &zeros);
    }
    rig.getattr(serial);
    rig.release(serial, handle);
    finished(
        rig,
        "C06",
        Pinned {
            requests: 517,
            owner_jobs: 518,
            statements: 9_246,
            attempts: 7_191,
            transactions: 514,
            vm_steps: 435_487,
            counts: include_str!("support/request_path_counts/c06.txt"),
        },
    );
}

/// C10: `cp big big2` of a committed 64 MiB file: READs of one window, each
/// written back as two WRITEs of half a window.
#[test]
fn c10_copy_a_base_file() {
    let rig = Rig::new("request-path-c10", 170, |source| {
        std::fs::write(source.join("big"), vec![0_u8; BIG]).unwrap();
        1
    });
    // The mount's own first requests read the root before the command.
    rig.unmeasured(|| {
        rig.getattr(rig.root);
        rig.lookup_miss(rig.root, "absent");
    });
    rig.getattr(rig.root);
    let source = rig.lookup(rig.root, "big");
    rig.lookup_miss(rig.root, "big2");
    let reading = rig.open(source, false);
    rig.lookup_miss(rig.root, "big2");
    let (serial, writing) = rig.create(rig.root, "big2");
    let zeros = vec![0_u8; WINDOW / 2];
    for window in 0..BIG / WINDOW {
        let offset = (window * WINDOW) as u64;
        assert_eq!(rig.read(source, reading, offset, WINDOW as u32), WINDOW);
        rig.write(serial, writing, offset, &zeros);
        rig.write(serial, writing, offset + (WINDOW / 2) as u64, &zeros);
    }
    assert_eq!(rig.read(source, reading, BIG as u64, WINDOW as u32), 0);
    rig.release(serial, writing);
    rig.release(source, reading);
    finished(
        rig,
        "C10",
        Pinned {
            requests: 1_545,
            owner_jobs: 1_547,
            statements: 13_372,
            attempts: 11_313,
            transactions: 1_029,
            vm_steps: 600_790,
            counts: include_str!("support/request_path_counts/c10.txt"),
        },
    );
}
