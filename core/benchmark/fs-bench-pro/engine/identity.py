"""Source identities and the frozen product-free workload registry."""
import csv
import hashlib
import io
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[4]
IMAGE = "sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6"
ARM64_FLAGS = (
    "--cfg", "aes_armv8", "--cfg", "polyval_armv8", "--cfg",
    "chacha20_force_neon", "-C", "target-feature=+aes,+sha2",
)


def sha256(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(65536), b""):
            digest.update(block)
    return digest.hexdigest()


def git(root, *arguments):
    return subprocess.check_output(["git", *arguments], cwd=root, text=True).strip()


def frozen_definition(root=ROOT):
    paths = sorted((root / "benchmark/fs-bench-pro/workload").glob("*.rs"))
    paths += sorted((root / "benchmark/fs-bench-pro/families").glob("*/mod.rs"))
    paths += [root / "benchmark/fs-bench-pro/shared" / name for name in
              ("repository_history.py", "small_file_delta_family.py")]
    hashes = {str(path.relative_to(root)): sha256(path) for path in paths}
    return {"files": hashes, "sha256": hashlib.sha256(
        json.dumps(hashes, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "tree": git(root, "rev-parse", "HEAD:benchmark/fs-bench-pro")}


def registry_source(root):
    """Compile original std-only definitions; never include retired product code.

    This is a metadata exporter. It calls no workload, fixture generator, SDK,
    Store, verifier or filesystem mutation. Original Rust loops resolve IDs.
    """
    source = json.dumps(str(root / "benchmark/fs-bench-pro/workload/main.rs"))
    return '''#[allow(dead_code)]
#[path = SOURCE]
mod workload_source;
fn main() {
    println!("family\\tcase\\tkind\\ttier\\tfixture_bytes\\tfixture_files");
    for row in workload_source::NAMESPACE_SCENARIOS {
        println!("init_namespace\\t{}\\tinit\\t{}\\t{}\\t{}", row.id, row.regular_files, row.logical_bytes, row.regular_files);
    }
    for family in [workload_source::edit_length_preserving::registry(),workload_source::edit_length_changing::registry(),workload_source::edit_canonical_chunk_count::registry()] {
        for row in family {println!("{}\\t{}\\tsdk-edit\\t1\\t{}\\t1",row.family_id,row.id,row.fixture_bytes);}
    }
    for row in workload_source::store_footprint::CONTROLS {
        println!("store_footprint\\t{}\\tinit\\t{}\\t{}\\t{}",row.id,row.infra_tier,row.logical_bytes,row.regular_files);
    }
    for row in workload_source::workspace_registry::cases().into_iter().chain(workload_source::workspace_registry::proofs()).chain(workload_source::workspace_registry::inherited()) {
        println!("{}\\t{}\\t{}\\t{}\\tUNAVAILABLE\\tUNAVAILABLE",row.family,row.id,row.kind,row.tier);
    }
}
'''.replace("SOURCE", source)


def reference_catalogue(output, root=ROOT):
    """Resolve 269 Rust registrations and the four Python-wrapper selections.

    Must run under the checkout lock. A matching source/binary seal reuses the
    metadata exporter; it never reuses a performance measurement.
    """
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    source = registry_source(root)
    definition = frozen_definition(root)
    key = hashlib.sha256((definition["sha256"] + source).encode()).hexdigest()
    binary, receipt = output / "registry", output / "build.json"
    cached = json.loads(receipt.read_text()) if receipt.exists() else None
    if not (cached and cached["key"] == key and binary.is_file()
            and cached["binary_sha256"] == sha256(binary)):
        (output / "registry.rs").write_text(source)
        command = ["rustup", "run", "1.85.1", "rustc", "--edition=2021",
                   *ARM64_FLAGS, str(output / "registry.rs"), "-o", str(binary)]
        built = subprocess.run(command, cwd=root, capture_output=True, timeout=120)
        (output / "build.stdout").write_bytes(built.stdout)
        (output / "build.stderr").write_bytes(built.stderr)
        if built.returncode:
            raise RuntimeError("frozen metadata exporter build failed; see " + str(output))
        receipt.write_text(json.dumps({"key": key, "binary_sha256": sha256(binary),
                                      "command": command, "definition": definition}, indent=2) + "\n")
    raw = subprocess.check_output([str(binary)], cwd=root, text=True, timeout=10)
    (output / "registry.tsv").write_text(raw)
    rows = list(csv.DictReader(io.StringIO(raw), delimiter="\t"))
    # These two family directories intentionally have no Rust mod.rs. Their
    # canonical IDs come from the original wrapper registry, reviewed at HEAD.
    for profile, scenario, states in (("stride-1", "deepseek-full", 157),
                                      ("stride-3", "deepseek-stride3", 53),
                                      ("stride-10", "deepseek-stride10", 17)):
        rows.append(dict(family="repository_history", case=scenario, kind=profile,
                         tier=str(states), fixture_bytes="UNAVAILABLE", fixture_files="UNAVAILABLE"))
    rows.append(dict(family="small_file_delta_smoke", case="small-file-delta-10x30-v1",
                     kind="full-file-saves-30", tier="10", fixture_bytes="245760", fixture_files="10"))
    if len(rows) != 273 or len({(row["family"], row["case"]) for row in rows}) != len(rows):
        raise ValueError("frozen registry must resolve exactly 273 unique cases")
    return rows
