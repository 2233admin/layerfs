//! Native-only fixture/expectation materialization from frozen ordinary recipes.
#[allow(dead_code)]
#[path = "../../../../../benchmark/fs-bench-pro/workload/main.rs"]
mod reference;
use std::{fs, path::Path};

fn main() -> reference::Result<()> {
    let args: Vec<_> = std::env::args().collect();
    if args.len() != 4 || !matches!(args[1].as_str(), "fixture" | "expected") {
        return Err("fixture|expected CASE FRESH_NATIVE_ROOT required".into());
    }
    let case = reference::workspace_registry::resolve(&args[2])?;
    let entries = if args[1] == "fixture" {
        reference::workspace_registry::fixture(&case, 1)?
    } else {
        reference::workspace_registry::expected(&case, 1, 1)?
    };
    let root = Path::new(&args[3]);
    if root.exists() {
        return Err("fresh native output required".into());
    }
    reference::workspace_common::create_fixture(root, &entries)?;
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
        case.id, entries.len(), reference::workspace_common::recipe_identity(&entries)?);
    Ok(())
}
