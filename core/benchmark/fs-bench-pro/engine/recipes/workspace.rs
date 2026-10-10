//! Native-only fixture/expectation materialization from frozen ordinary recipes.
#[allow(dead_code)]
#[path = "../../../../../benchmark/fs-bench-pro/workload/main.rs"]
mod reference;
mod edit_model;
use std::{fs, path::Path};

fn main() -> reference::Result<()> {
    let args: Vec<_> = std::env::args().collect();
    if args.len() != 4 || !matches!(args[1].as_str(), "fixture" | "expected") {
        return Err("fixture|expected CASE FRESH_NATIVE_ROOT required".into());
    }
    let entries = edit_model::entries(&args[2], usize::from(args[1] == "expected"))?;
    let root = Path::new(&args[3]);
    if root.exists() {
        return Err("fresh native output required".into());
    }
    reference::workspace_common::create_fixture(root, &entries)?;
    if args[1] == "fixture" {
        if let Some(wanted) = edit_model::fixture_sha256(&args[2])? {
            if edit_model::original_fixture_hash(&entries)? != wanted {
                return Err("original SDK fixture digest differs from frozen seal".into());
            }
        }
    }
    let manifest = reference::workspace_common::manifest(&entries)?;
    fs::write(root.with_extension("manifest.tsv"), &manifest)?;
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
    println!("{{\"case\":\"{}\",\"seed\":1,\"files\":{files},\"entries\":{},\"logical_bytes\":{bytes},\"fixture_digest\":\"{digest}\",\"recipe_identity\":\"{}\"}}",
        args[2], entries.len(), reference::workspace_common::recipe_identity(&entries)?);
    Ok(())
}
