//! Native-only fixture/expectation materialization from frozen ordinary recipes.
mod edit_model;
#[allow(dead_code)]
#[path = "../../../../../benchmark/fs-bench-pro/workload/main.rs"]
mod reference;
use std::{fs, path::Path};

fn main() -> reference::Result<()> {
    let args: Vec<_> = std::env::args().collect();
    if args.len() != 4
        || !matches!(
            args[1].as_str(),
            "fixture" | "expected" | "git-fixture-check"
        )
    {
        return Err("fixture|expected CASE FRESH_NATIVE_ROOT or git-fixture-check CASE EXISTING_NATIVE_ROOT required".into());
    }
    let root = Path::new(&args[3]);
    let entries = if args[1] == "git-fixture-check" {
        let case = reference::workspace_registry::resolve(&args[2])?;
        let entries = reference::ordinary_workloads::prepared_git_entries(root, &case, 1)?;
        reference::workspace_common::verify_native(root, &entries)?;
        entries
    } else {
        if root.exists() {
            return Err("fresh native output required".into());
        }
        let entries = edit_model::entries(&args[2], usize::from(args[1] == "expected"))?;
        reference::workspace_common::create_fixture(root, &entries)?;
        entries
    };
    if args[1] == "fixture" {
        if let Some(wanted) = edit_model::fixture_sha256(&args[2])? {
            if edit_model::original_fixture_hash(&entries)? != wanted {
                return Err("original SDK fixture digest differs from frozen seal".into());
            }
        }
    }
    let manifest = reference::workspace_common::manifest(&entries)?;
    let manifest_path = if args[1] == "git-fixture-check" {
        root.with_extension("git.manifest.tsv")
    } else {
        root.with_extension("manifest.tsv")
    };
    fs::write(manifest_path, &manifest)?;
    let bytes = reference::workspace_common::validate_entries(&entries)?;
    let files = entries
        .iter()
        .filter(|entry| {
            matches!(
                entry.kind,
                reference::workspace_common::EntryKind::File(_)
                    | reference::workspace_common::EntryKind::Hardlink(_)
            )
        })
        .count();
    let digest = reference::sdk_edit_common::sha256_hex(manifest.as_bytes());
    let recipe = reference::workspace_common::recipe_identity(&entries)?;
    let verified = if args[1] == "git-fixture-check" {
        ",\"verification_status\":\"pass\""
    } else {
        ""
    };
    println!("{{\"case\":\"{}\",\"seed\":1,\"files\":{files},\"entries\":{},\"logical_bytes\":{bytes},\"fixture_digest\":\"{digest}\",\"recipe_identity\":\"{recipe}\"{verified}}}",
        args[2], entries.len());
    Ok(())
}
