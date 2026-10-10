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
WORKSPACE_FAMILIES = ("payload_create_read", "tiny_file_churn", "namespace_mutation",
                     "edit_length_preserving", "edit_length_changing", "edit_length_changing_capped",
                     "edit_canonical_chunk_count", "small_file_delta_smoke",
                     "directory_construction_traversal", "git_tool_workflow", "local_snapshot",
                     "workspace_change_locality", "file_size_transition",
                     "dedup_branch_history", "mixed_load_bearing")


def family_case(recipe):
    for path in sorted((identity.ROOT / "core/benchmark/fs-bench-pro/families").glob("*/family.json")):
        family = json.loads(path.read_text())
        for case in family["cases"]:
            if case["fixture"].get("recipe") == recipe and case["status"] == "ported":
                return family, case
    raise ValueError("no committed ported case defines fixture recipe " + recipe)


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
    if recipe not in ("empty", "big64m"):
        return prepare_workspace(recipe, folder, build_folder)
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


def compatible_master(folder, fixture, current, uid, gid):
    """Reuse only a sealed sibling setup with the identical complete input tree."""
    for candidate in sorted(Path(folder).parent.glob("*/prepared.json")):
        if candidate.parent == Path(folder):
            continue
        summary = json.loads(candidate.read_text())
        if (summary.get("schema") != "fs-bench-pro-prepared-workspace-v1"
                or summary.get("status") != "PASS"
                or summary.get("global_profile") != "Disposable/WAL/OFF"
                or summary.get("identity", {}).get("product_tree") != current["product_tree"]
                or (summary.get("source_uid"), summary.get("source_gid")) != (uid, gid)
                or summary.get("fixture", {}).get("fixture_sha256") != fixture["fixture_sha256"]):
            continue
        prepared = load(candidate.parent)
        return prepared, {"prepared": str(candidate.parent.resolve()),
                          "prepared_manifest_sha256": identity.sha256(candidate.parent / "manifest.json"),
                          "master_volume": prepared["master_volume"],
                          "store_sha256": prepared["provision"]["store_sha256"],
                          "input_fixture_sha256": fixture["fixture_sha256"],
                          "scope": "closed immutable setup only; case-specific expected tree/helpers remain new; independent sample byte copy; no cold claim"}
    return None, None


def prepare_ordered_fixture(case, folder, build):
    """Frozen native history builder, independent complete SHA manifests per state."""
    import importlib.util
    path = identity.ROOT / case["fixture"]["history_recipe"]
    if identity.sha256(path) != case["port_review"]["files"][case["fixture"]["history_recipe"]]:
        raise ValueError("original native history recipe changed")
    spec = importlib.util.spec_from_file_location("frozen_history_fixture", path)
    original = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(original)
    built = original.build(folder / "original")[case["v016_case"]]
    states = list(original.states())
    if len(states) != len(case["history_schedule"]["states"]):
        raise ValueError("original retained-state cardinality differs")
    source = folder / "source"
    shutil.copytree(Path(built["input"]) / "initial", source, copy_function=shutil.copy2)
    native, history = {}, []
    manifests = folder / "history-manifests"
    manifests.mkdir()
    expected = folder / "expected-native"
    for step, files in enumerate(states):
        seal = case["history_schedule"]["states"][step]
        oracle = Path(built["input"]) / f"oracle-{step}.json"
        if json.loads(oracle.read_text()) != original.oracle(files) or identity.sha256(oracle) != seal["original_oracle_sha256"]:
            raise ValueError("independent original history oracle differs")
        body = "workspace-independent-manifest-v1\n.\tdirectory\t0\t755\t1000000000\t0\t-\n"
        for name, data in sorted(files.items()):
            body += f"{name}\tfile\t{len(data)}\t644\t1000000000\t0\t{hashlib.sha256(data).hexdigest()}\n"
        manifest = manifests / f"state-{step}.tsv"
        manifest.write_text(body)
        if identity.sha256(manifest) != seal["manifest_sha256"]:
            raise ValueError("frozen independent state manifest differs")
        if step == 0:
            root = source
        else:
            root = expected if step == len(states)-1 else folder / "native-states" / f"state-{step}"
            root.mkdir(parents=True)
            for name, data in files.items():
                item = root / name
                item.write_bytes(data)
                item.chmod(0o644)
                os.utime(item, ns=(1_000_000_000_000_000_000,) * 2)
            root.chmod(0o755)
            os.utime(root, ns=(1_000_000_000_000_000_000,) * 2)
        proof = receipts.command([build["binaries"]["edit-host"]["path"], "verify-manifest", str(manifest)],
                                 folder, f"original-state-{step}-check", 120, cwd=root)
        checked = dict(line.split("=", 1) for line in Path(proof["stdout"]).read_text().splitlines())
        if checked.get("verification_status") != "pass":
            raise ValueError("original complete native history verification failed")
        native[f"state-{step}"] = checked
        history.append({"index": step, "manifest": str(manifest), "manifest_sha256": identity.sha256(manifest),
                        "original_oracle_sha256": identity.sha256(oracle), "logical_bytes": sum(map(len, files.values()))})
    def summary(step):
        return {"case": case["id"], "files": len(states[step]), "entries": len(states[step])+1,
                "logical_bytes": history[step]["logical_bytes"], "fixture_digest": history[step]["manifest_sha256"],
                "recipe_identity": history[step]["original_oracle_sha256"], "seed": 1}
    return summary(0), summary(len(states)-1), native, history, built


def snapshot_manifest(step):
    """Independent transcription of the frozen25k/97*j/one-byte equations."""
    if step not in range(4):
        raise ValueError("original local snapshot states are0..3")
    body = "workspace-independent-manifest-v1\n.\tdirectory\t0\t755\t1700000000\t0\t-\n"
    if step:
        edited = {97*j for j in range(256)} if step == 2 else set()
        for ordinal in range(25000):
            byte = (ordinal + (ordinal in edited)) % 251
            body += f"f{ordinal:05}\tfile\t1\t644\t1700000000\t0\t{hashlib.sha256(bytes([byte])).hexdigest()}\n"
    return body


def prepare_snapshot_fixture(case, folder, build):
    """Existing frozen Rust generator plus independent equations/native all-state proof."""
    if case["v016_case"] != "local-snapshot-create-25000-onebyte-v1":
        raise ValueError("original local snapshot case required")
    source, final = folder / "source", folder / "expected-native"
    initial = receipts.command([build["binaries"]["workspace-writer"]["path"], "fixture", case["id"], str(source)],
                               folder, "native-fixture", 120)
    fixture = json.loads(Path(initial["stdout"]).read_text())
    state1 = folder / "native-states" / "state-1"
    state1.parent.mkdir()
    made = receipts.command([build["binaries"]["workspace-writer"]["path"], "expected", case["id"], str(state1)],
                            folder, "native-state-1", 120)
    expectation = json.loads(Path(made["stdout"]).read_text())
    if source.with_suffix(".manifest.tsv").read_text() != snapshot_manifest(0) or state1.with_suffix(".manifest.tsv").read_text() != snapshot_manifest(1):
        raise ValueError("independent snapshot equations differ from original Rust fixture/state")
    state2 = folder / "native-states" / "state-2"
    shutil.copytree(state1, state2, copy_function=shutil.copy2)
    for ordinal in (97*j for j in range(256)):
        path = state2 / f"f{ordinal:05}"
        path.write_bytes(bytes([(ordinal+1) % 251]))
        os.utime(path, ns=(MTIME_NS, MTIME_NS))
    os.utime(state2, ns=(MTIME_NS, MTIME_NS))
    shutil.copytree(state1, final, copy_function=shutil.copy2)
    manifests = folder / "history-manifests"
    manifests.mkdir()
    history, native = [], {}
    for step, root in enumerate((source, state1, state2, final)):
        body = snapshot_manifest(step)
        wanted = case["history_schedule"]["states"][step]["manifest_sha256"]
        if hashlib.sha256(body.encode()).hexdigest() != wanted:
            raise ValueError("original snapshot state registration changed")
        manifest = manifests / f"state-{step}.tsv"
        manifest.write_text(body)
        checked = receipts.command([build["binaries"]["workload-host"]["path"], "workspace-verify-tree", case["id"], "1", str(step)],
                                   folder, f"original-state-{step}-check", 120, cwd=root)
        native[f"state-{step}"] = dict(line.split("=", 1) for line in Path(checked["stdout"]).read_text().splitlines())
        history.append({"index": step, "manifest": str(manifest), "manifest_sha256": wanted, "logical_bytes": 25000 if step else 0})
    return fixture, expectation, native, history, None


def prepare_workspace(recipe, folder, build_folder):
    family, case = family_case(recipe)
    if family["family"] not in WORKSPACE_FAMILIES:
        raise ValueError("this family's workspace fixture port is not implemented yet")
    build = identity.load_build(build_folder)
    current = identity.source_identity()
    folder = Path(folder).resolve()
    folder.mkdir(parents=True, exist_ok=False)
    source, expected = folder / "source", folder / "expected-native"
    history = None
    if case.get("history_schedule", {}).get("schema") == "original-ordinary-commit-sequence-v1":
        fixture, expectation, native, history, original_history = prepare_snapshot_fixture(case, folder, build)
    elif case.get("history_schedule"):
        fixture, expectation, native, history, original_history = prepare_ordered_fixture(case, folder, build)
    else:
        writer = build["binaries"]["workspace-writer"]["path"]
        made = receipts.command([writer, "fixture", case["v016_case"], str(source)], folder, "native-fixture", 120)
        fixture = json.loads(Path(made["stdout"]).read_text())
        authored = receipts.command([writer, "expected", case["v016_case"], str(expected)], folder, "native-expected", 120)
        expectation = json.loads(Path(authored["stdout"]).read_text())
    def original_check(root, step, label):
        argv = ([build["binaries"]["edit-host"]["path"], "verify", case["v016_case"], str(step)]
                if case.get("sdk_scenario") else
                [build["binaries"]["workload-host"]["path"], "workspace-verify-tree", case["v016_case"], "1", str(step)])
        proof = receipts.command(argv,
                                 folder, label, 120, cwd=root)
        return dict(line.split("=", 1) for line in Path(proof["stdout"]).read_text().splitlines())
    if history is None:
        native = {"fixture": original_check(source, 0, "original-fixture-check"),
                  "expected": original_check(expected, 1, "original-expected-check")}
    if any(item.get("verification_status") != "pass" for item in native.values()):
        raise ValueError("original native fixture/expectation check failed")
    git_reference = None
    if case.get("git_workflow"):
        fixture, git_reference, git_native = prepare_git_fixture(case, folder, build)
        native.update(git_native)
    fixture.update(recipe=recipe, fixture_sha256=fixture["fixture_digest"])
    helpers = assets(folder / "code")
    copies = [(Path(build["binaries"]["workload-linux"]["path"]), "writers/workload"),
              (identity.ROOT / "core/benchmark/fs-bench-pro/families" / family["family"] / "workload.sh", "workload.sh")]
    if case.get("sdk_scenario") or case.get("ordinary_sdk_edits") or history is not None:
        copies.append((Path(build["binaries"]["edit-linux"]["path"]), "writers/edit"))
    for origin, relative in copies:
        target = Path(helpers["root"]) / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(origin, target)
        target.chmod(0o555)
        helpers["files"][relative] = identity.sha256(target)
    if history is not None:
        base = Path(helpers["root"]) / "history"
        shutil.copytree(folder / "history-manifests", base / "manifests")
        for state in original_history["states"] if original_history is not None else ():
            shutil.copytree(state["input"], base / "checkpoints" / f"step-{state['index']}")
        for path in sorted(base.rglob("*")):
            if path.is_file():
                path.chmod(0o444)
                helpers["files"][str(path.relative_to(helpers["root"]))] = identity.sha256(path)
    if git_reference is not None:
        base = Path(helpers["root"]) / "git-reference"
        shutil.copytree(folder / "git-reference", base)
        for path in sorted(base.rglob("*")):
            if path.is_file():
                path.chmod(0o444)
                helpers["files"][str(path.relative_to(helpers["root"]))] = identity.sha256(path)
    helpers["sha256"] = hashlib.sha256(json.dumps(helpers["files"], sort_keys=True).encode()).hexdigest()
    reused, reuse = compatible_master(folder, fixture, current, source.stat().st_uid, source.stat().st_gid)
    if reused is None:
        volume = "layerfs-fsb-master-" + family["family"].replace("_", "-") + "-" + uuid.uuid4().hex[:16]
        docker = ["docker", "--host", "unix://" + build["socket"]]
        receipts.write_new(folder / "resource-claim.json", {"volume": volume, "created_by_this_run": True,
                           "purpose": "new immutable SDK-provisioned workspace input; never sample directly"})
        made_volume = receipts.command([*docker, "volume", "create", volume], folder, "master-volume", 15)
        if Path(made_volume["stdout"]).read_text().strip() != volume:
            raise ValueError("original master volume acknowledgement differs")
        provisioned = project.provision(source, volume, folder / "project", build)
    else:
        volume, provisioned = reused["master_volume"], reused["provision"]
        receipts.write_new(folder / "resource-claim.json", {"volume": volume, "created_by_this_run": False,
                           "purpose": "compatible closed prepared master reused; never a mutated sample", "reuse": reuse})
    result = {"schema": "fs-bench-pro-prepared-workspace-v1", "status": "PASS", "recipe": recipe,
              "family": family["family"], "case": case["id"], "identity": current, "fixture": fixture,
              "expectation": expectation, "native_verification": native, "helpers": helpers,
              "history_states": history,
              "git_reference": git_reference,
              "master_volume": volume, "provision": provisioned, "source_uid": source.stat().st_uid,
              "master_reuse": reuse,
              "source_gid": source.stat().st_gid, "global_profile": "Disposable/WAL/OFF",
              "overlay_profile": "MEMORY/OFF/EXCLUSIVE", "construction_workers": 1,
              "setup": "native fixture and independent algebraic final state fully verified; public Init/seal/install once; sample uses independent closed byte clone",
              "cache": "explicit setup source/Store warmth; class B additionally requires warm terminal cleanup and actual zero source demands"}
    receipts.write_new(folder / "prepared.json", result)
    receipts.manifest(folder)
    return result


def prepare_git_fixture(case, folder, build):
    """Original Linux Git setup/reference, full initial .git imported by Init."""
    if not case.get("git_workflow") or not case["v016_case"].startswith("git-tool-"):
        raise ValueError("explicit frozen Git workflow case required")
    folder = Path(folder)
    source, expected = folder / "source", folder / "expected-native"
    token = uuid.uuid4().hex[:16]
    container = "layerfs-fsb-git-native-" + token
    inside = "/tmp/layerfs-fsb-git-native-" + token
    docker = ["docker", "--host", "unix://" + build["socket"]]
    writer = "/writer"
    case_arg = shlex.quote(case["v016_case"])
    body = ["set -eu", "printf '%s\\n' " + shlex.quote(build["binaries"]["workload-linux"]["sha256"] + "  /writer") + " | sha256sum -c -",
            "mkdir -m 700 " + inside,
            writer + " workspace-git-prepare /source 1 > " + inside + "/prepare.txt",
            writer + " workspace-git-reference " + inside + "/reference-build " + case_arg + " 1 > " + inside + "/reference.txt",
            "mkdir " + inside + "/reference " + inside + "/receipts",
            "cp --preserve=mode,timestamps " + inside + "/reference-build/{identity,normalization.tsv,expected-first-status,expected-diff,expected-head,expected-tree,expected-parent} " + inside + "/reference/",
            "cp -a " + inside + "/reference-build/repository/.git /expected-native/.git",
            "touch -d @1700000000 /expected-native",
            "cd /expected-native; " + writer + " workspace-git-verify " + case_arg + " 1 " + inside + "/reference > " + inside + "/receipts/qualification.txt",
            "cp " + inside + "/prepare.txt " + inside + "/reference.txt " + inside + "/receipts/"]
    receipts.write_new(folder / "git-native-resource-claim.json", {"container": container, "created_by_this_run": True,
        "purpose": "untimed pinned Linux native Git preparation and independent reference; no Store or mount",
        "failure_disposition": "retain exact container; no retry or inferred completion"})
    receipts.command([*docker, "create", "--name", container, "--network", "none",
                      "--cpus", "2", "--memory", "2g", "--memory-swap", "2g", "--pids-limit", "256",
                      "--user", f"{source.stat().st_uid}:{source.stat().st_gid}",
                      "-e", "LAYERFS_CONSTRUCTION_WORKERS=1", identity.IMAGE,
                      "/bin/bash", "-euo", "pipefail", "-c", "\n".join(body)], folder, "git-native-create", 15)
    inspected = receipts.command([*docker, "inspect", container, "--format", "{{json .HostConfig}}"],
                                 folder, "git-native-profile", 15)
    actual = json.loads(Path(inspected["stdout"]).read_text())
    profile = {"NanoCpus": 2_000_000_000, "Memory": 2 * 1024**3, "MemorySwap": 2 * 1024**3, "PidsLimit": 256}
    if any(actual.get(name) != value for name, value in profile.items()):
        raise ValueError("original native Git 2CPU/2GiB/no-swap/256PID profile differs")
    receipts.command([*docker, "cp", "--archive", build["binaries"]["workload-linux"]["path"], container + ":/writer"],
                     folder, "git-native-code", 15)
    for path, name in ((source, "source"), (expected, "expected-native")):
        receipts.command([*docker, "cp", "--archive", str(path), container + ":/" + name],
                         folder, "git-native-input-" + name, 15)
    receipts.command([*docker, "start", "--attach", container], folder, "git-native-author", 120)
    receipts.command([*docker, "cp", "--archive", container + ":/source/.git", str(source / ".git")],
                     folder, "git-initial-repository-export", 30)
    # Copying .git changes the existing host directory's mtime, as in the frozen driver.
    source.chmod(0o750)
    os.utime(source, ns=(MTIME_NS, MTIME_NS))
    receipts.command([*docker, "cp", "--archive", container + ":" + inside + "/reference", str(folder / "git-reference")],
                     folder, "git-reference-export", 30)
    receipts.command([*docker, "cp", container + ":" + inside + "/receipts", str(folder / "git-native-receipts")],
                     folder, "git-native-receipts-export", 15)
    fields = lambda name: dict(line.split("=", 1) for line in (folder / "git-native-receipts" / name).read_text().splitlines())
    preparation, reference, qualification = fields("prepare.txt"), fields("reference.txt"), fields("qualification.txt")
    if qualification.get("verification_status") != "pass" or qualification.get("git_semantic_verification_status") != "pass":
        raise ValueError("original independent native Git semantic/complete-source qualification failed")
    bundle = folder / "git-reference"
    identity_rows = (bundle / "identity").read_text().splitlines()
    if (identity_rows != [case["v016_case"], "1", preparation["git_version"]]
            or reference.get("reference_case") != case["v016_case"] or reference.get("reference_seed") != "1"
            or reference["git_genesis_head"] != preparation["git_genesis_head"]
            or (bundle / "expected-parent").read_text().strip() != preparation["git_genesis_head"]
            or reference["git_effective_config"] != preparation["git_effective_config"]
            or int(reference["git_repository_transient_bound_bytes"]) > 256 * 1024**2):
        raise ValueError("independent Git reference identity/genesis/config/transient bound differs")
    checked = receipts.command([build["binaries"]["workspace-writer"]["path"], "git-fixture-check", case["v016_case"], str(source)],
                               folder, "git-complete-initial-fixture-check", 120)
    fixture = json.loads(Path(checked["stdout"]).read_text())
    if fixture.get("verification_status") != "pass":
        raise ValueError("original complete source plus prepared Git fixture failed")
    witness = {"schema": "fs-bench-pro-original-git-reference-v1", "status": "PASS", "case": case["v016_case"],
               "seed": 1, "image": identity.IMAGE, "container": container, "git_version": preparation["git_version"],
               "resource_profile": {name: actual[name] for name in profile},
               "git_effective_config": preparation["git_effective_config"], "genesis_head": preparation["git_genesis_head"],
               "transient_bound_bytes": int(reference["git_repository_transient_bound_bytes"]),
               "files": {path.name: identity.sha256(path) for path in sorted(bundle.iterdir())},
               "initial_manifest": str(source.with_suffix(".git.manifest.tsv")),
               "scope": "native initial real .git and independent final-source-derived Git semantic identities; no measured editor replay; index stat bytes are measured custody only"}
    receipts.command([*docker, "rm", container], folder, "git-native-remove-passing", 15)
    receipts.write_new(folder / "git-reference.json", witness)
    return fixture, witness, {"git_initial_complete": {"verification_status": "pass", "fixture_digest": fixture["fixture_digest"]},
                              "git_independent_reference": qualification}


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
    for cell, record in prepared.get("oracles", {}).get("cases", {}).items():
        receipts.command([*docker, "cp", "--archive", record["path"], container + ":/code/expected-" + cell],
                         folder, "stage-oracle-" + cell, 15)
    lines = [digest + "  /code/" + path for path, digest in prepared["helpers"]["files"].items()]
    script = "printf '%s\\n' " + " ".join(shlex.quote(line) for line in lines) + " | sha256sum -c -"
    checked = receipts.command([*docker, "exec", "--user", "0:0", container,
                                "/bin/bash", "-euo", "pipefail", "-c", script], folder, "stage-code-check", 15)
    return {"status": "PASS", "container": container, "actual_helper_byte_check": checked}
