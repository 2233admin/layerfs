"""Rebuild sealed fixture masters and independent byte-copy sample volumes."""
import hashlib
import json
import os
from pathlib import Path
import shlex
import shutil
import uuid

from . import identity, project, receipts

MTIME_NS = 1_700_000_000_000_000_000
BIG_BYTES = 64 * 1024 * 1024
CELL_RECIPES = {f"C{n:02}": "big64m" if n in (9, 10, 11) else "empty" for n in range(1, 13)}
NAMESPACE_RECIPES = ("namespace-100-compact-v3", "namespace-1000-compact-v3", "namespace-10000", "namespace-100000")


def generate(recipe, root):
    root = Path(root)
    if recipe not in ("empty", "big64m"):
        raise ValueError("fixture recipe is not registered: " + recipe)
    root.mkdir(mode=0o755, parents=True, exist_ok=False)
    content_sha = None
    if recipe == "big64m":
        value = hashlib.sha256()
        block = bytes(65536)
        with (root / "big").open("xb") as stream:
            for _ in range(BIG_BYTES // len(block)):
                if stream.write(block) != len(block):
                    raise OSError("short original fixture write; no resend")
                value.update(block)
        (root / "big").chmod(0o644)
        os.utime(root / "big", ns=(MTIME_NS, MTIME_NS))
        content_sha = value.hexdigest()
    root.chmod(0o755)
    os.utime(root, ns=(MTIME_NS, MTIME_NS))
    semantic = {"recipe": recipe, "seed": 1, "root_mode": 0o755, "mtime_ns": MTIME_NS,
                "uid": root.stat().st_uid, "gid": root.stat().st_gid,
                "files": 1 if recipe == "big64m" else 0,
                "logical_bytes": BIG_BYTES if recipe == "big64m" else 0,
                "content_sha256": content_sha, "profile": "complete native tree; full written bytes, no sparse substitute"}
    semantic["fixture_sha256"] = hashlib.sha256(json.dumps(semantic, sort_keys=True).encode()).hexdigest()
    return semantic


def assets(folder):
    """Copy committed helper bytes; only the seal is reused in sample setup."""
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=False)
    copies = [(identity.ROOT / "core/benchmark/fs-bench-pro/engine/oracle.py", "engine/oracle.py")]
    copies += [(identity.ROOT / "core/benchmark/cluster-two/cells" / name, "cells/" + name)
               for name in ("oracle.py", "git_index_oracle.py", "git_queries.py", "workloads.py")]
    copies += [(identity.ROOT / "core/benchmark/cluster-two/cache" / name, "cache/" + name)
               for name in ("residency.py", "stream_manifest.py", "generate_manifest.py")]
    copies += [(identity.ROOT / "core/benchmark/fs-bench-pro/engine/recipes/git-default-policy.json",
                "git-default-policy.json")]
    hashes = {}
    for source, relative in copies:
        path = folder / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, path)
        path.chmod(0o444)
        hashes[relative] = identity.sha256(path)
    return {"root": str(folder), "files": hashes,
            "sha256": hashlib.sha256(json.dumps(hashes, sort_keys=True).encode()).hexdigest()}


def native_oracles(recipe, source, helpers, folder, build):
    """One independent native expected state per cell; no product or N/P arm."""
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=False)
    cells = [cell for cell, wanted in CELL_RECIPES.items() if wanted == recipe]
    token = uuid.uuid4().hex[:16]
    container = "layerfs-fsb-oracle-" + token
    docker = ["docker", "--host", "unix://" + build["socket"]]
    inside = "/tmp/layerfs-r7-fsb-oracle-" + token
    commands = ["set -eu", "mkdir -m 700 " + inside]
    for cell in cells:
        commands.append("python3 -B /code/engine/oracle.py prepare --case " + cell +
                        " --root /native-" + cell + " --output " + inside + "/" + cell +
                        " --helpers /code/cells --policy /code/git-default-policy.json")
    info = Path(source).stat()
    create = receipts.command([*docker, "create", "--name", container, "--network", "none",
                               "--user", f"{info.st_uid}:{info.st_gid}", "-e", "PYTHONDONTWRITEBYTECODE=1",
                               identity.IMAGE, "/bin/bash", "-c", "\n".join(commands)], folder, "native-create", 15)
    receipts.command([*docker, "cp", "--archive", helpers["root"] + "/.", container + ":/code"],
                     folder, "native-code", 15)
    for cell in cells:
        receipts.command([*docker, "cp", "--archive", str(source) + "/.", container + ":/native-" + cell],
                         folder, "native-input-" + cell, 15)
    authored = receipts.command([*docker, "start", "--attach", container], folder, "native-author", 120)
    destination = folder / "expected"
    receipts.command([*docker, "cp", container + ":" + inside, str(destination)], folder, "native-export", 15)
    expected = {}
    for cell in cells:
        path = destination / cell
        if not (path / "observation.json").is_file():
            raise ValueError("original native oracle missing: " + cell)
        record = json.loads((path / "observation.json").read_text())
        if record["case"] != cell:
            raise ValueError("original native oracle case differs")
        expected[cell] = {"path": str(path), "observation_sha256": identity.sha256(path / "observation.json"),
                          "tree_sha256": identity.sha256(path / "tree.jsonl")}
    receipts.command([*docker, "rm", container], folder, "native-remove-passing", 15)
    result = {"schema": "fs-bench-pro-native-oracles-v1", "status": "PASS", "recipe": recipe,
              "cases": expected, "container": container, "container_disposition": "completed native author, exported, removed",
              "create": create, "author": authored, "performance_samples": 0,
              "scope": "untimed independently generated native expectations; no product, N/P measurement or old /tmp inputs"}
    receipts.write_new(folder / "oracles.json", result)
    return result


def prepare(recipe, folder, build_folder):
    if recipe in NAMESPACE_RECIPES:
        return prepare_namespace(recipe, folder, build_folder)
    build = identity.load_build(build_folder)
    current = identity.source_identity()
    folder = Path(folder).resolve()
    folder.mkdir(parents=True, exist_ok=False)
    fixture = generate(recipe, folder / "source")
    helpers = assets(folder / "code")
    volume = "layerfs-fsb-master-" + recipe + "-" + uuid.uuid4().hex[:16]
    docker = ["docker", "--host", "unix://" + build["socket"]]
    receipts.write_new(folder / "resource-claim.json", {"volume": volume, "purpose": "new immutable fixture master",
                       "failure_disposition": "retained; never reused as a mutated sample", "created_by_this_run": True})
    created = receipts.command([*docker, "volume", "create", volume], folder, "master-volume", 15)
    if Path(created["stdout"]).read_text().strip() != volume:
        raise ValueError("original master volume acknowledgement differs")
    provisioned = project.provision(folder / "source", volume, folder / "project", build)
    oracles = native_oracles(recipe, folder / "source", helpers, folder / "oracle", build)
    result = {"schema": "fs-bench-pro-prepared-fixture-v1", "status": "PASS", "recipe": recipe,
              "identity": current, "fixture": fixture, "helpers": helpers, "master_volume": volume,
              "provision": provisioned, "oracles": oracles, "build": str(Path(build_folder).resolve()),
              "source_uid": (folder / "source").stat().st_uid, "source_gid": (folder / "source").stat().st_gid,
              "global_profile": "Disposable/WAL/OFF", "overlay_profile": "MEMORY/OFF/EXCLUSIVE",
              "construction_workers": 1, "master_measurement_mounts": 0,
              "durable": "NOT_RUN — disabled by owner until explicit reauthorization"}
    receipts.write_new(folder / "prepared.json", result)
    receipts.manifest(folder)
    return result


def prepare_namespace(recipe, folder, build_folder):
    build = identity.load_build(build_folder)
    current = identity.source_identity()
    folder = Path(folder).resolve()
    folder.mkdir(parents=True, exist_ok=False)
    source = folder / "source"
    shell = identity.ROOT / "core/benchmark/fs-bench-pro/families/init_namespace/workload.sh"
    made = receipts.command(["/bin/bash", str(shell), recipe, str(source)], folder, "native-fixture", 120,
        environment={**os.environ, "NAMESPACE_WRITER": build["binaries"]["namespace-writer"]["path"]})
    fixture = json.loads(Path(made["stdout"]).read_text())
    verified = receipts.command([build["binaries"]["workload-host"]["path"], "namespace-verify", str(source), recipe],
                                folder, "original-native-fixture-verifier", 120)
    fields = dict(line.split("=", 1) for line in Path(verified["stdout"]).read_text().splitlines())
    if (int(fields["regular_files"]), int(fields["logical_bytes"]), fields["namespace_digest"]) != (
            fixture["files"], fixture["logical_bytes"], fixture["fixture_digest"]):
        raise ValueError("original fixture count/byte/content digest differs from transcription")
    fixture.update(recipe=recipe, fixture_sha256=fixture["fixture_digest"])
    result = {"schema": "fs-bench-pro-prepared-native-init-v1", "status": "PASS", "recipe": recipe,
              "source": str(source), "fixture": fixture, "identity": current,
              "generator_sha256": build["binaries"]["namespace-writer"]["sha256"],
              "original_verifier_sha256": build["binaries"]["workload-host"]["sha256"],
              "master_volume": None, "setup_method": "fresh native input; no prior Store or Init",
              "original_verification": fields,
              "cache": "setup generated/wrote/read all native bytes; source warmth retained; no cold admission claimed",
              "global_profile": "Disposable/WAL/OFF selected by the future Init; no Store executed during preparation"}
    receipts.write_new(folder / "prepared.json", result)
    receipts.manifest(folder)
    return result


def load(folder, recipe=None):
    folder = Path(folder)
    receipts.verify_manifest(folder)
    result = json.loads((folder / "prepared.json").read_text())
    if result["status"] != "PASS" or recipe is not None and result["recipe"] != recipe:
        raise ValueError("sealed fixture recipe/status differs")
    if result["schema"] == "fs-bench-pro-prepared-native-init-v1":
        return result
    if identity.sha256(result["provision"]["sealed_store"]) != result["provision"]["store_sha256"]:
        raise ValueError("sealed host Store changed")
    if identity.sha256(result["provision"]["manifest"]) != result["provision"]["manifest_sha256"]:
        raise ValueError("sealed installed manifest changed")
    for relative, wanted in result["helpers"]["files"].items():
        if identity.sha256(Path(result["helpers"]["root"]) / relative) != wanted:
            raise ValueError("sealed executable helper changed: " + relative)
    return result


def clone(prepared, folder, build):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=False)
    volume = "layerfs-fsb-sample-" + uuid.uuid4().hex[:16]
    container = "layerfs-fsb-copy-" + uuid.uuid4().hex[:16]
    docker = ["docker", "--host", "unix://" + build["socket"]]
    receipts.write_new(folder / "resource-claim.json", {"volume": volume, "container": container,
                       "master": prepared["master_volume"], "created_by_this_run": True,
                       "failed_or_uncertain": "retain; no guessed removal"})
    receipts.command([*docker, "volume", "create", volume], folder, "sample-volume", 15)
    body = "test ! -e /dest/global; test ! -s /source/global/store.sqlite-wal; test ! -s /source/global/store.sqlite-journal; mkdir -m 700 /dest/global; cp --reflink=never --sparse=never --preserve=mode,ownership,timestamps /source/global/store.sqlite /dest/global/store.sqlite; cmp /source/global/store.sqlite /dest/global/store.sqlite; chmod --reference=/source/global /dest/global; chown --reference=/source/global /dest/global; touch -r /source/global /dest/global; sha256sum /source/global/store.sqlite /dest/global/store.sqlite"
    receipts.command([*docker, "create", "--name", container, "--network", "none",
                      "-v", prepared["master_volume"] + ":/source:ro", "-v", volume + ":/dest",
                      identity.IMAGE, "/bin/bash", "-euo", "pipefail", "-c", body], folder, "copy-create", 15)
    copied = receipts.command([*docker, "start", "--attach", container], folder, "copy", 15)
    hashes = [line.split()[0] for line in Path(copied["stdout"]).read_text().splitlines()]
    if hashes != [prepared["provision"]["store_sha256"]] * 2:
        raise ValueError("original independent Store clone differs from its sealed master")
    receipts.command([*docker, "rm", container], folder, "copy-remove-passing", 15)
    result = {"schema": "fs-bench-pro-sample-clone-v1", "status": "PASS", "volume": volume,
              "master": prepared["master_volume"], "store_sha256": hashes[1],
              "clone_method": "closed independent byte copy; cp --reflink=never --sparse=never; compared bytes and SHA-256",
              "cache_contract": "clone is not cold; phase cache precondition is enforced separately",
              "receipt": copied}
    receipts.write_new(folder / "clone.json", result)
    return result


def stage(container, prepared, folder, build):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=False)
    docker = ["docker", "--host", "unix://" + build["socket"]]
    receipts.command([*docker, "cp", "--archive", prepared["helpers"]["root"] + "/.", container + ":/code"],
                     folder, "stage-code", 15)
    for cell, record in prepared["oracles"]["cases"].items():
        receipts.command([*docker, "cp", "--archive", record["path"], container + ":/code/expected-" + cell],
                         folder, "stage-oracle-" + cell, 15)
    lines = [digest + "  /code/" + path for path, digest in prepared["helpers"]["files"].items()]
    script = "printf '%s\\n' " + " ".join(shlex.quote(line) for line in lines) + " | sha256sum -c -"
    checked = receipts.command([*docker, "exec", "--user", "0:0", container,
                                "/bin/bash", "-euo", "pipefail", "-c", script], folder, "stage-code-check", 15)
    return {"status": "PASS", "container": container, "actual_helper_byte_check": checked}
