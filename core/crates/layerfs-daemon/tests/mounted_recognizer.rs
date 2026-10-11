//! Real kernel mount: a process launched outside the daemon shifts the tail
//! of two committed files with `dd`, `tail` and `truncate`. Its plain WRITE
//! requests carry only bytes; the daemon recognizes committed chunks in them
//! and stores reference pieces. The tree is compared with a native replay of
//! the same script, read again through daemon READs, committed, read from a
//! fresh bind and through a fresh mount. Counts are printed; nothing is timed.
#![cfg(target_os = "linux")]
#[allow(dead_code)]
#[path = "support/installed_store.rs"]
mod installed;
#[allow(dead_code)]
#[path = "support/namespace_model.rs"]
mod model;
#[allow(dead_code)]
#[path = "support/mounted.rs"]
mod mounted;
#[allow(dead_code)]
#[path = "support/mounted_commit.rs"]
mod rig;
use model::assert_same;
use mounted::COMMAND;
use nix::libc;
use rig::{bash_in, clock_masked, native, passed, root, stamp_tree, Rig};
use std::{
    fs::{self, OpenOptions},
    io::Read,
    os::unix::fs::OpenOptionsExt,
    path::Path,
};

const BIG: usize = 3 << 20;
const SECOND: usize = 2 << 20;
/// Where the script edits `big` and `second`; neither is a cell boundary.
const P: usize = 1_573_641;
const Q: usize = 536_870;
/// An insert into `big` and a delete from `second`, each of 4 KiB, by
/// rewriting everything after the edit 64 KiB at a time.
const SHIFT: &str = r#"
set -eu
dd if=second of=second bs=64k iflag=skip_bytes oflag=seek_bytes \
   skip=$((536870 + 4096)) seek=536870 conv=notrunc status=none
truncate -s $(($(stat -c %s second) - 4096)) second
scratch=$(mktemp)
tail -c +$((1573641 + 1)) big > "$scratch"
head -c 4096 /dev/zero | tr '\0' 'i' |
    dd of=big bs=4k oflag=seek_bytes seek=1573641 conv=notrunc status=none
dd if="$scratch" of=big bs=64k oflag=seek_bytes seek=$((1573641 + 4096)) \
   conv=notrunc status=none
rm -f "$scratch"
"#;

fn noise(len: usize, seed: u64) -> Vec<u8> {
    let mut state = seed.wrapping_mul(0x9e37_79b9_7f4a_7c15) | 1;
    (0..len)
        .map(|_| {
            state ^= state << 13;
            state ^= state >> 7;
            state ^= state << 17;
            (state >> 24) as u8
        })
        .collect()
}
fn tree(source: &Path) {
    fs::write(source.join("big"), noise(BIG, 3)).unwrap();
    fs::write(source.join("second"), noise(SECOND, 5)).unwrap();
    fs::write(source.join("small"), b"a small file\n").unwrap();
    stamp_tree(source);
}
/// The file's bytes read with `O_DIRECT`: every byte is a READ the daemon
/// serves from published state, never a page the kernel already held.
fn direct(path: &Path) -> Vec<u8> {
    let mut file = OpenOptions::new()
        .read(true)
        .custom_flags(libc::O_DIRECT)
        .open(path)
        .unwrap();
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes).unwrap();
    bytes
}

#[test]
fn an_outside_process_shifts_two_tails_and_its_writes_become_pieces() {
    let rig = Rig::built("mounted-recognizer", tree);
    let first = rig.mount(1);
    let mount = root(&first);
    assert_same(&rig.base, &native(mount), "the mounted base");
    assert_eq!(rig.harness.engine(first.token).reference_rows, 0);

    // The same script, by the same unregistered identity: on the mount, and
    // on a native directory the same builder filled.
    passed(&bash_in(COMMAND, mount, SHIFT), "script on the mount");
    let work = rig.store.recognizer_work();
    let counts = rig.harness.engine(first.token);
    println!(
        "MOUNTED_RECOGNIZER {work:?} reference_rows={} payload_cells={} payload_bytes={}",
        counts.reference_rows, counts.payload_cells, counts.payload_bytes
    );
    let replay = rig.replay();
    passed(&bash_in(COMMAND, &replay, SHIFT), "script on the copy");
    let expected = native(mount);
    assert_same(
        &clock_masked(&native(&replay), rig.started),
        &clock_masked(&expected, rig.started),
        "the mount against the native replay",
    );
    for name in ["big", "second"] {
        let bytes = fs::read(replay.join(name)).unwrap();
        assert!(direct(&mount.join(name)) == bytes, "{name} by daemon READs");
    }
    assert_eq!(
        fs::metadata(mount.join("big")).unwrap().len() as usize,
        BIG + 4096
    );

    // Both rewritten tails were recognized. The chunk that crosses a
    // request's end is completed by the next request, so each tail is one
    // run of pieces: a row or two a file, and stored bytes only at the edit
    // and at the first and last chunk of a tail.
    let written = (BIG - P + SECOND - Q - 4096) as u64;
    assert!(work.passes.claimed_bytes * 10 > written * 9, "{work:?}");
    assert!((1..=4).contains(&counts.reference_rows), "{counts:?}");
    assert!(counts.payload_bytes * 8 < written, "{counts:?}");
    assert_eq!(work.passes.failed, 0);

    let record = rig.committed(first.token, "mounted recognizer");
    assert_same(&expected, &rig.published(record.root), "the published root");
    assert_same(&expected, &native(mount), "the same mount after install");
    rig.unmount(&first);

    let fresh = rig.mount(2);
    assert_eq!(
        rig.harness.status(fresh.token).binding.effective_root,
        record.root
    );
    assert_same(&expected, &native(root(&fresh)), "the fresh mount");
    rig.unmount(&fresh);
    rig.finish();
}
