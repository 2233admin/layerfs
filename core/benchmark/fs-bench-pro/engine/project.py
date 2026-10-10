"""Public ProjectApi provisioning through the existing release runtime."""
import json
import hashlib
import os
from pathlib import Path

from . import identity, receipts


def provision(source, volume, folder, build):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=False)
    sealed, manifest = folder / "store.sqlite", folder / "installed.manifest"
    events = folder / "provision.events.jsonl"
    info = Path(source).stat()
    argv = [build["binaries"]["runtime"]["path"], "provision", "--socket", build["socket"],
            "--volume", volume, "--daemon", build["binaries"]["daemon"]["path"],
            "--manifest", str(manifest), "--receipt", str(events),
            "--uid", str(info.st_uid), "--gid", str(info.st_gid),
            "--source-copy", str(Path(source).resolve()), "--sealed", str(sealed),
            "--init-seconds", "120", "--image", identity.IMAGE]
    attempted = receipts.command(argv, folder, "sdk-provision", 120,
                                 environment={**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1"})
    with events.open() as stream:
        rows = [json.loads(line) for line in stream]
    stopped = [row for row in rows if row["event"] == "setup_container_stopped"]
    if len(stopped) != 1 or not rows or rows[-1]["event"] != "finished":
        raise ValueError("original successful SDK provisioning/Stop acknowledgements missing")
    container = stopped[0]["value"]
    docker = ["docker", "--host", "unix://" + build["socket"]]
    status = receipts.command([*docker, "inspect", container, "--format", "{{.State.Running}}"],
                              folder, "setup-container-state", 15)
    if Path(status["stdout"]).read_text().strip() != "false":
        raise ValueError("provisioning container still running; custody retained: " + container)
    receipts.command([*docker, "rm", container], folder, "setup-remove-passing", 15)
    result = {"schema": "fs-bench-pro-provision-v1", "status": "PASS", "volume": volume,
              "source": str(source), "sealed_store": str(sealed), "store_sha256": identity.sha256(sealed),
              "manifest": str(manifest), "manifest_sha256": identity.sha256(manifest),
              "global_profile": "Disposable/WAL/OFF", "overlay_profile": "MEMORY/OFF/EXCLUSIVE",
              "construction_workers": 1, "init_parallel_profile": "supported Project Init profile unchanged",
              "attempt": attempted, "events": str(events), "container": container,
              "container_disposition": "known Stop, inspected not running, removed",
              "host_sqlite": "original host_init_setup event", "daemon_sqlite": "original install_setup event"}
    receipts.write_new(folder / "provision.json", result)
    return result


def one_init(case, prepared_folder, build_folder, output):
    from . import fixtures
    current = identity.source_identity()
    build = identity.load_build(build_folder)
    prepared = fixtures.load(prepared_folder, case["fixture"]["recipe"])
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    treatment = {"family": "init_namespace", "case": case, "fixture": prepared["fixture"],
                 "product": current["product_tree"], "runtime_sha256": build["binaries"]["runtime"]["sha256"],
                 "execution_files": {name: digest for name, digest in current["files"].items()
                    if name in ("core/benchmark/fs-bench-pro/engine/project.py", "core/benchmark/fs-bench-pro/engine/fixtures.py",
                                "core/benchmark/fs-bench-pro/engine/identity.py", "core/benchmark/fs-bench-pro/engine/recipes/namespace.rs")},
                 "workload_sha256": identity.sha256(identity.ROOT / "core/benchmark/fs-bench-pro/families/init_namespace/workload.sh"),
                 "image": identity.IMAGE}
    key = hashlib.sha256(json.dumps(treatment, sort_keys=True).encode()).hexdigest()
    claims = identity.ROOT / "benchmark-results/fs-bench-pro/claims"
    claims.mkdir(parents=True, exist_ok=True)
    with (claims / key).open("x") as stream:
        stream.write(str(output) + "\n")
    row = {"family": "init_namespace", "case": case["id"], "schema": "fs-bench-pro-project-init-v1",
           "source_commit": current["source_commit"], "product_tree": current["product_tree"], "identity": current,
           "image": identity.IMAGE, "daemon_sha256": build["binaries"]["daemon"]["sha256"],
           "runtime_sha256": build["binaries"]["runtime"]["sha256"], "status": "NOT_RUN",
           "declared_limit_ns": case["budget"]["command_ms"] * 1_000_000,
           "verifier_limit_ns": case["budget"]["verifier_ms"] * 1_000_000,
           "phases": {}, "counts": {}, "observations": {}, "proof_status": "NOT_RUN", "cleanup": "UNAVAILABLE",
           "cache_class": "A", "cache": {"status": "INELIGIBLE", "reason": prepared["cache"] + "; host kernel metadata coldness unavailable"},
           "global_profile": "Disposable/WAL/OFF", "overlay_profile": "NOT_USED; host Init only",
           "construction_workers": 1, "init_parallel_profile": "supported public Project Init profile unchanged",
           "durable": "NOT_RUN — disabled by owner until explicit reauthorization",
           "counts_scope": "daemon request/owner-job/statement counts UNAVAILABLE: host Init launches no daemon or FUSE",
           "attempted_operation_count": 0, "completed_operation_count": 0, "sample_count": 0,
           "evidence": str(output.relative_to(identity.ROOT.resolve())), "claim": key,
           "prepared": str(Path(prepared_folder).resolve()), "build": str(Path(build_folder).resolve())}
    receipts.write_new(output / "selection.json", row)
    common = ["--socket", build["socket"], "--volume", "unused-host-init", "--daemon", build["binaries"]["daemon"]["path"],
              "--manifest", str(output / "project.manifest"), "--source-copy", prepared["source"],
              "--sealed", str(output / "store.sqlite"), "--case", case["id"], "--init-seconds", "120",
              "--uid", str(os.getuid()), "--gid", str(os.getgid()), "--image", identity.IMAGE]
    environment = {**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1"}
    try:
        row.update(attempted_operation_count=1, sample_count=1)
        init = receipts.command([build["binaries"]["runtime"]["path"], "init", *common,
                                "--receipt", str(output / "init.events.jsonl")], output, "public-init", 120, environment=environment)
        events = [json.loads(line) for line in (output / "init.events.jsonl").read_text().splitlines()]
        found = [item for item in events if item["event"] == "project_init"]
        if len(found) != 1 or events[-1]["event"] != "finished":
            raise ValueError("original known Init/seal completion unavailable")
        row.update(complete_wall_ns=init["complete_wall_ns"], completed_operation_count=1,
                   phases={"command_ns": found[0]["span"]["duration_ns"]}, init=found[0])
        row["observations"] = {"store_" + name: {"status": "AVAILABLE", "value": found[0]["fields"][name],
            "provenance": "sealed Store stat before independent verification; sidecars absent after consuming seal"}
            for name in ("logical_bytes", "allocated_bytes")}
        row["proof_status"] = "FAIL"
        verified = receipts.command([build["binaries"]["runtime"]["path"], "verify-init", *common,
                                     "--receipt", str(output / "verify.events.jsonl")], output, "independent-verifier",
                                     row["verifier_limit_ns"] / 1_000_000_000, environment=environment)
        events = [json.loads(line) for line in (output / "verify.events.jsonl").read_text().splitlines()]
        proof = [item for item in events if item["event"] == "project_verified"]
        if len(proof) != 1 or proof[0]["fields"]["status"] != "PASS" or events[-1]["event"] != "finished":
            raise ValueError("original independent proof completion unavailable")
        sidecars = [str(output / ("store.sqlite" + suffix)) for suffix in ("-wal", "-shm", "-journal")
                    if (output / ("store.sqlite" + suffix)).exists()]
        if sidecars:
            raise ValueError("original consuming Store close left sidecars: " + repr(sidecars))
        row.update(proof_status="PASS", proof_wall_ns=verified["complete_wall_ns"], cleanup="SEALED_CLOSED; no mount",
                   status="INELIGIBLE", functional_status="PASS", tag=row["cache"]["reason"],
                   verification={"scope": case["oracle"]["scope"], "omissions": case["oracle"]["omissions"], "event": proof[0]},
                   custody="KNOWN_HOST_EXIT_AND_SEAL", resource_disposition="closed host sample Store retained as raw evidence; no Docker resources created")
    except BaseException as error:
        row.update(status="FAIL", original_failure_type=type(error).__name__, original_failure=str(error),
                   resource_disposition="original host files retained; no failed-operation replay")
        for label, key_name in (("public-init", "complete_wall_ns"), ("independent-verifier", "proof_wall_ns")):
            path = output / (label + ".completion.json")
            if path.exists():
                row[key_name] = json.loads(path.read_text())["complete_wall_ns"]
    finally:
        row["timing_scope"] = "complete host Init child launch-to-exit; public Init/seal span is command_ns; fixture setup and independent verifier separate"
        receipts.write_new(output / "receipt.json", row)
        receipts.manifest(output)
    return row


def parity_namespace(family, prepared_parent, output):
    from . import fixtures
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    rows = []
    registered = identity.reference_catalogue(identity.ROOT / "core/target/fs-bench-pro-catalogue")
    frozen = {(row["family"], row["case"]): row for row in registered}
    for case in family["cases"]:
        reference = frozen[(family["family"], case["v016_case"])]
        prepared = fixtures.load(Path(prepared_parent) / case["fixture"]["recipe"], case["fixture"]["recipe"])
        fixture = prepared["fixture"]
        if (fixture["files"], fixture["logical_bytes"]) != (int(reference["fixture_files"]), int(reference["fixture_bytes"])):
            raise ValueError("original registry fixture totals differ")
        review = case["port_review"]
        if (review["source_commit"] != identity.git(identity.ROOT, "rev-parse", "reference-v0.1.6-final^{commit}")
                or review["source_tag_object"] != identity.git(identity.ROOT, "rev-parse", "reference-v0.1.6-final")):
            raise ValueError("port review source pin differs from retained reference")
        for path, digest in review["files"].items():
            if identity.sha256(identity.ROOT / path) != digest:
                raise ValueError("reviewed frozen operation source changed")
        rows.append({"case": case["id"], "status": "PASS", "fixture": fixture,
                     "original_native_verification": prepared["original_verification"], "review": review,
                     "oracle": case["oracle"], "differences": case["differences"]})
    result = {"schema": "fs-bench-pro-parity-v1", "family": family["family"], "status": "PASS", "cases": rows,
              "samples": 0, "scope": "original membership; exact count/bytes/content digest; agent reviewed operation transcription and original selected-prefix/root-reopen proof coverage"}
    receipts.write_new(output / "parity.json", result)
    receipts.manifest(output)
    return result


def parity_workspace(family, prepared_parent, output):
    from . import fixtures
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    registered = identity.reference_catalogue(identity.ROOT / "core/target/fs-bench-pro-catalogue")
    membership = {(row["family"], row["case"]) for row in registered}
    rows = []
    for case in family["cases"]:
        if (family["family"], case["v016_case"]) not in membership:
            raise ValueError("frozen original case membership differs")
        prepared = fixtures.load(Path(prepared_parent) / case["fixture"]["recipe"], case["fixture"]["recipe"])
        if prepared["case"] != case["id"] or prepared["family"] != family["family"]:
            raise ValueError("original fixture was prepared for another case")
        review = case["port_review"]
        if (review["source_commit"] != identity.git(identity.ROOT, "rev-parse", "reference-v0.1.6-final^{commit}")
                or review["source_tag_object"] != identity.git(identity.ROOT, "rev-parse", "reference-v0.1.6-final")):
            raise ValueError("reviewed operation pin differs")
        for path, digest in review["files"].items():
            if identity.sha256(identity.ROOT / path) != digest:
                raise ValueError("reviewed original fixture/operation/oracle source changed")
        if any(item["verification_status"] != "pass" for item in prepared["native_verification"].values()):
            raise ValueError("original complete native fixture/oracle check not passed")
        rows.append({"case": case["id"], "status": "PASS", "fixture": prepared["fixture"],
                     "expectation": prepared["expectation"], "mechanical": prepared["native_verification"],
                     "review": review, "oracle": case["oracle"], "differences": case["differences"]})
    result = {"schema": "fs-bench-pro-parity-v1", "family": family["family"], "status": "PASS", "cases": rows,
              "samples": 0, "scope": "original membership, full deterministic native fixture/final counts+bytes+content digest; reviewed unchanged ordinary calls and complete native/persisted verification"}
    receipts.write_new(output / "parity.json", result)
    receipts.manifest(output)
    return result
