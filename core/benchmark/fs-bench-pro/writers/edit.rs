//! Bounded ordinary Unix splice writes for the frozen SDK-edit definitions.
#[path = "../engine/recipes/edit_model.rs"]
mod edit_model;
#[allow(dead_code)]
#[path = "../../../../benchmark/fs-bench-pro/workload/main.rs"]
mod reference;

use reference::sdk_edit_common::{self, ReplacementKind, Scenario};
use std::fs::{File, OpenOptions};
use std::io;
use std::os::fd::IntoRawFd;
use std::os::unix::fs::FileExt;
use std::path::Path;

const SCRATCH_BYTES: usize = 65_536;

unsafe extern "C" {
    fn close(fd: i32) -> i32;
}

#[derive(Default)]
struct Progress {
    read_calls: u64,
    write_calls: u64,
    read_bytes: u64,
    write_bytes: u64,
    truncate_calls: u64,
}

fn read_exact_at(
    file: &File,
    mut output: &mut [u8],
    mut offset: u64,
    work: &mut Progress,
) -> io::Result<()> {
    while !output.is_empty() {
        work.read_calls += 1;
        let count = file.read_at(output, offset)?;
        if count == 0 {
            return Err(io::Error::new(
                io::ErrorKind::UnexpectedEof,
                "original suffix read returned zero",
            ));
        }
        work.read_bytes += count as u64;
        offset += count as u64;
        output = &mut output[count..];
    }
    Ok(())
}

fn write_exact_at(
    file: &File,
    mut input: &[u8],
    mut offset: u64,
    work: &mut Progress,
) -> io::Result<()> {
    while !input.is_empty() {
        work.write_calls += 1;
        let count = file.write_at(input, offset)?;
        if count == 0 {
            return Err(io::Error::new(
                io::ErrorKind::WriteZero,
                "original positional write returned zero",
            ));
        }
        work.write_bytes += count as u64;
        offset += count as u64;
        input = &input[count..];
    }
    Ok(())
}

fn checked_close(file: File) -> io::Result<()> {
    let fd = file.into_raw_fd();
    // SAFETY: this descriptor is owned and consumed here. Close is attempted
    // exactly once, including EINTR; an uncertain failure is never resent.
    if unsafe { close(fd) } == 0 {
        Ok(())
    } else {
        Err(io::Error::last_os_error())
    }
}

fn splice(
    file: &File,
    case: &Scenario,
    replacement: &[u8],
    work: &mut Progress,
) -> reference::Result<()> {
    let deleted_end = case
        .start
        .checked_add(case.delete_len)
        .ok_or("edit range overflow")?;
    let wanted_len = case
        .fixture_bytes
        .checked_sub(case.delete_len)
        .and_then(|len| len.checked_add(case.replacement_len))
        .ok_or("edit final length overflow")?;
    if deleted_end > case.fixture_bytes
        || wanted_len != case.final_bytes
        || file.metadata()?.len() != case.fixture_bytes
    {
        return Err("original scenario range/final length/fixture length differs".into());
    }
    let suffix_len = case.fixture_bytes - deleted_end;
    let mut scratch = vec![0; SCRATCH_BYTES];
    if case.replacement_len > case.delete_len {
        let growth = case.replacement_len - case.delete_len;
        file.set_len(case.final_bytes)?;
        work.truncate_calls += 1;
        let mut remaining = suffix_len;
        while remaining != 0 {
            let take = remaining.min(SCRATCH_BYTES as u64) as usize;
            let from = deleted_end + remaining - take as u64;
            read_exact_at(file, &mut scratch[..take], from, work)?;
            write_exact_at(file, &scratch[..take], from + growth, work)?;
            remaining -= take as u64;
        }
    } else if case.replacement_len < case.delete_len {
        let mut copied = 0;
        while copied != suffix_len {
            let take = (suffix_len - copied).min(SCRATCH_BYTES as u64) as usize;
            read_exact_at(file, &mut scratch[..take], deleted_end + copied, work)?;
            write_exact_at(
                file,
                &scratch[..take],
                case.start + case.replacement_len + copied,
                work,
            )?;
            copied += take as u64;
        }
    }
    write_exact_at(file, replacement, case.start, work)?;
    if case.final_bytes < case.fixture_bytes {
        file.set_len(case.final_bytes)?;
        work.truncate_calls += 1;
    }
    Ok(())
}

fn apply(id: &str) -> reference::Result<()> {
    let case = edit_model::scenario(id).ok_or("unknown original SDK edit case")?;
    let replacement = match case.replacement_kind {
        ReplacementKind::Inline => sdk_edit_common::replacement_bytes(&case),
        ReplacementKind::Zero => vec![0; usize::try_from(case.replacement_len)?],
    };
    if replacement.len() as u64 != case.replacement_len
        || sdk_edit_common::sha256_hex(&replacement) != case.payload_sha256
    {
        return Err("original replacement length/hash differs".into());
    }
    let entries = edit_model::descriptors(id, 1)?;
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .open("payload.bin")?;
    let mut work = Progress::default();
    let original = (|| -> reference::Result<()> {
        splice(&file, &case, &replacement, &mut work)?;
        for name in ["payload.bin", "."] {
            let entry = entries
                .iter()
                .find(|entry| entry.path == name)
                .ok_or("original metadata descriptor missing")?;
            reference::workspace_common::set_metadata(Path::new(name), entry)?;
        }
        Ok(())
    })();
    let closed = checked_close(file);
    eprintln!("ordinary_edit_reads={} ordinary_edit_read_bytes={} ordinary_edit_writes={} ordinary_edit_write_bytes={} ordinary_edit_truncates={} scratch_window_bytes={SCRATCH_BYTES}",
        work.read_calls, work.read_bytes, work.write_calls, work.write_bytes, work.truncate_calls);
    if let Err(error) = original {
        if let Err(close_error) = closed {
            eprintln!("independent_close_failure={close_error}");
        }
        return Err(error);
    }
    closed?;
    println!("mutation_status=pass\ncase={}\nedit_plan_sha256={}\nreplacement_sha256={}\ninitial_bytes={}\nfinal_bytes={}",
        case.id, case.plan_sha256, case.payload_sha256, case.fixture_bytes, case.final_bytes);
    Ok(())
}

fn apply_workspace(id: &str) -> reference::Result<()> {
    use reference::workspace_common::{self as common, EntryKind};
    let case = reference::workspace_registry::resolve(id)?;
    if case.family != "workspace_change_locality" || case.kind != "workspace-distributed-sdk-edit" {
        return Err("original distributed locality edit case required".into());
    }
    let edits = reference::ordinary_workloads::sdk_edits(&case, 1)?;
    let entries = reference::workspace_registry::fixture(&case, 1)?;
    let by_path: std::collections::BTreeMap<_, _> = entries
        .iter()
        .map(|entry| (entry.path.as_str(), entry))
        .collect();
    if edits.len() != case.tier {
        return Err("original distributed edit count differs".into());
    }
    let mut work = Progress::default();
    for edit in &edits {
        let entry = by_path
            .get(edit.path.as_str())
            .ok_or("original SDK target absent")?;
        let EntryKind::File(content) = &entry.kind else {
            return Err("original SDK target is not a regular file".into());
        };
        if edit.start != 0 || edit.delete_len != 4096 || edit.replacement.len() != 4096 {
            return Err("original distributed edit range/replacement differs".into());
        }
        let file = OpenOptions::new().write(true).open(&edit.path)?;
        let changed = (|| -> reference::Result<()> {
            if file.metadata()?.len() != content.len() {
                return Err("original distributed target fixture length differs".into());
            }
            write_exact_at(&file, &edit.replacement, edit.start, &mut work)?;
            common::set_metadata(Path::new(&edit.path), entry)?;
            Ok(())
        })();
        let closed = checked_close(file);
        if let Err(error) = changed {
            if let Err(close_error) = closed {
                eprintln!("independent_close_failure={close_error}");
            }
            return Err(error);
        }
        closed?;
    }
    common::set_metadata(
        Path::new("."),
        by_path.get(".").ok_or("original root metadata missing")?,
    )?;
    eprintln!("ordinary_edit_writes={} ordinary_edit_write_bytes={} ordinary_edit_truncates={} ordinary_edit_reads={} ordinary_edit_read_bytes={}",
        work.write_calls, work.write_bytes, work.truncate_calls, work.read_calls, work.read_bytes);
    println!("mutation_status=pass\ncase={}\noriginal_sdk_edit_members={}\nreplacement_bytes={}\nreplacement_definition=original-sdk_edits-seed1-XOR0x5a",
        case.id, edits.len(), work.write_bytes);
    Ok(())
}

fn main() -> reference::Result<()> {
    let args: Vec<String> = std::env::args().collect();
    match args.as_slice() {
        [_, mode, id] if mode == "apply" => apply(id),
        [_, mode, id] if mode == "apply-workspace" => apply_workspace(id),
        [_, mode, manifest] if mode == "verify-manifest" => {
            let entries =
                reference::workspace_common::decode_manifest(&std::fs::read_to_string(manifest)?)?;
            for (key, value) in
                reference::workspace_common::verify_native(Path::new("."), &entries)?
            {
                println!("{key}={value}");
            }
            println!("manifest_provenance=sealed-independent-original-source-SHA256");
            Ok(())
        }
        [_, mode, id, step] if mode == "verify" => {
            let entries = edit_model::entries(id, step.parse()?)?;
            for (key, value) in
                reference::workspace_common::verify_native(Path::new("."), &entries)?
            {
                println!("{key}={value}");
            }
            Ok(())
        }
        _ => Err("apply CASE | apply-workspace CASE | verify CASE STEP | verify-manifest MANIFEST required".into()),
    }
}
