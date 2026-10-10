"""Source identities and the frozen product-free workload registry."""
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import shlex
import subprocess
import uuid

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


def source_identity(root=ROOT):
    """Tracked source must be clean; the owner-protected untracked prompt is recorded.

    Generated builds/receipts stay gitignored. Other untracked source is refused,
    rather than silently supplying a different compilation or workload.
    """
    if git(root, "diff", "--name-only", "HEAD"):
        raise ValueError("commit the tracked source before a build, preparation or sample")
    untracked = git(root, "ls-files", "--others", "--exclude-standard").splitlines()
    protected = "core/docs/issues/307/PROMPT-R8-R9-NEXT-AGENT-20261010.md"
    if any(path != protected for path in untracked):
        raise ValueError("untracked source is not a sealed input: " + repr(untracked))
    tracked = git(root, "ls-files").splitlines()
    selected = [path for path in tracked if path.startswith(("core/crates/", "core/vendor/",
                 "core/benchmark/fs-bench-pro/runtime/", "core/benchmark/fs-bench-pro/engine/",
                 "core/benchmark/fs-bench-pro/families/", "core/benchmark/fs-bench-pro/writers/",
                 "core/benchmark/cluster-two/cells/", "core/benchmark/cluster-two/cache/", ".cargo/"))
                or path in ("core/Cargo.toml", "core/Cargo.lock", "core/benchmark/fs-bench-pro/bench.py")]
    hashes = {path: sha256(root / path) for path in selected}
    return {"source_commit": git(root, "rev-parse", "HEAD"),
            "source_tree": git(root, "rev-parse", "HEAD^{tree}"),
            "product_tree": git(root, "rev-parse", "HEAD:core/crates"), "files": hashes,
            "source_clean": True,
            "excluded_untracked": [{"path": path, "sha256": sha256(root / path),
                                    "reason": "owner-protected handoff document; not a build/workload input"}
                                   for path in untracked]}


def docker_socket():
    supplied = os.environ.get("DOCKER_HOST")
    if supplied is not None:
        if not supplied.startswith("unix://"):
            raise ValueError("the authentic local Unix Docker engine is required")
        return supplied[len("unix://"):]
    value = subprocess.check_output(["docker", "context", "inspect", "--format",
                                     "{{.Endpoints.docker.Host}}"], text=True).strip()
    if not value.startswith("unix://"):
        raise ValueError("the authentic local Unix Docker engine is required")
    return value[len("unix://"):]


def build(folder, root=ROOT):
    """Locked host/runtime and pinned-image daemon builds with source byte checks."""
    from . import receipts
    folder = Path(folder).resolve()
    before = source_identity(root)
    folder.mkdir(parents=True, exist_ok=False)
    receipts.write_new(folder / "source-before.json", before)
    socket = docker_socket()
    docker = ["docker", "--host", "unix://" + socket]
    image = receipts.command([*docker, "image", "inspect", IMAGE, "--format", "{{.Id}}"],
                             folder, "image", 15)
    if Path(image["stdout"]).read_text().strip() != IMAGE:
        raise ValueError("actual Docker image differs from the pinned digest")
    provenance = receipts.command(["python3", "-B", "core/tools/check_fuser_integrity.py"],
                                  folder, "fuser-integrity", 15, allow_failure=True)
    if provenance["exit_code"]:
        checked = json.loads(Path(provenance["stdout"]).read_text())
        known = {
            "core/benchmark/cluster-two/passthrough/Cargo.lock: locked fuser has a local/replacement source",
            "core/benchmark/cluster-two/passthrough/Cargo.toml: patch override of fuser is not the authorized timestamp patch",
        }
        if set(checked.get("errors", [])) != known or provenance["exit_code"] != 1:
            raise ValueError("fuser integrity has a new refusal; build not attempted")
    environment = {**os.environ, "CARGO_TARGET_DIR": str(root / "core/target/r7-host-release"),
                   "LAYERFS_CONSTRUCTION_WORKERS": "1"}
    flags = environment.get("RUSTFLAGS")
    if flags is not None and any(flag not in flags for flag in
                                 ("aes_armv8", "polyval_armv8", "chacha20_force_neon", "+aes,+sha2")):
        raise ValueError("explicit RUSTFLAGS must repeat the repository ARM64 profile")
    host = receipts.command(["cargo", "+1.85.1", "build", "--manifest-path",
                             "core/benchmark/fs-bench-pro/runtime/Cargo.toml", "--locked", "--offline", "--release"],
                            folder, "host-release", 120, environment=environment)
    checks = folder / "container-source.sha256"
    checks.write_text("".join(digest + "  /work/" + path + "\n" for path, digest in before["files"].items()))
    container = "layerfs-fsb-build-" + uuid.uuid4().hex[:16]
    inside = "/work/" + str(checks.relative_to(root))
    body = "set -eu; sha256sum -c " + shlex.quote(inside) + "; cargo build --manifest-path core/Cargo.toml --locked --offline --release -p layerfs-daemon --bin layerfs-daemon; sha256sum -c " + shlex.quote(inside)
    receipts.command([*docker, "create", "--name", container, "--network", "none",
                      "-v", str(root) + ":/work", "-w", "/work",
                      "-e", "CARGO_HOME=/work/core/target/cluster2-linux-cargo",
                      "-e", "CARGO_TARGET_DIR=/work/core/target/r7-linux-release",
                      "-e", "LAYERFS_CONSTRUCTION_WORKERS=1", IMAGE, "/bin/bash", "-c", body],
                     folder, "linux-create", 15)
    linux = receipts.command([*docker, "start", "--attach", container], folder, "linux-release", 120)
    after = source_identity(root)
    if before != after:
        raise ValueError("source changed during the locked builds; container retained: " + container)
    receipts.write_new(folder / "source-after.json", after)
    binaries = {}
    for name, path in (("runtime", root / "core/target/r7-host-release/release/layerfs-r7-runtime"),
                       ("daemon", root / "core/target/r7-linux-release/release/layerfs-daemon")):
        digest = sha256(path)
        archive = root / "benchmark-results/fs-bench-pro/binary-archive" / digest / path.name
        archive.parent.mkdir(parents=True, exist_ok=True)
        if not archive.exists():
            import shutil
            shutil.copy2(path, archive)
        if sha256(archive) != digest:
            raise ValueError("immutable binary archive differs")
        binaries[name] = {"path": str(archive), "sha256": digest, "bytes": path.stat().st_size}
    result = {"schema": "fs-bench-pro-build-v1", "status": "PASS", "identity": before,
              "binaries": binaries, "image": IMAGE, "socket": socket,
              "builds": [host, linux], "flags": ".cargo/config.toml ARM64 profile; explicit override recorded",
              "explicit_rustflags": flags, "incremental_reuse": "existing worktree-local r7 Cargo caches; both locked builds attempted",
              "global_profile": "Disposable/WAL/OFF", "overlay_profile": "MEMORY/OFF/EXCLUSIVE",
              "construction_workers": 1, "fuser_check": provenance,
              "fuser_disposition": "OWNER-3's two passthrough refusals retained; no checker PASS claimed",
              "durable": "NOT_RUN — disabled by owner until explicit reauthorization"}
    receipts.write_new(folder / "build.json", result)
    receipts.command([*docker, "rm", container], folder, "linux-remove-passing", 15)
    receipts.manifest(folder)
    return result


def load_build(folder):
    from . import receipts
    folder = Path(folder)
    receipts.verify_manifest(folder)
    result = json.loads((folder / "build.json").read_text())
    current = source_identity()
    def compilation(files):
        return {name: digest for name, digest in files.items() if name.startswith(
            ("core/crates/", "core/vendor/", "core/benchmark/fs-bench-pro/runtime/", ".cargo/"))
            or name in ("core/Cargo.toml", "core/Cargo.lock")}
    if compilation(current["files"]) != compilation(result["identity"]["files"]):
        raise ValueError("build inputs differ from the sealed release build")
    for binary in result["binaries"].values():
        if sha256(binary["path"]) != binary["sha256"]:
            raise ValueError("sealed executable bytes changed")
    return result
