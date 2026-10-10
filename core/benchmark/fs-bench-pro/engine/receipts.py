"""Append-only evidence and lossless released-reference provenance."""
import csv
from decimal import Decimal
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import time

ROOT = Path(__file__).resolve().parents[4]
REFERENCE_SOURCES = (
    "release-notes/0.1.6/benchmark-performance.csv",
    "release-notes/0.1.5/benchmark-performance.csv",
    "release-notes/0.1.5/benchmark-verification.csv",
)
REFERENCE_COLUMNS = (
    "family", "case", "release", "kind", "timer", "value_ns",
    "source_value", "source_unit", "normalization", "profile", "disposition",
    "source_file", "source_row", "source_sha256", "source_seal", "product_seal",
    "producing_treatment", "producing_binary_sha256", "evidence", "source_row_json",
)


def released_references(root=ROOT):
    """Keep every input row, including verification-only and unavailable rows.

    Seconds are normalized using decimal arithmetic and truncated only at the
    nanosecond format boundary. Original text and every source field remain.
    No receipt is re-read, no disposition or historical ratio is recomputed.
    """
    for source in REFERENCE_SOURCES:
        path = root / source
        seal = hashlib.sha256(path.read_bytes()).hexdigest()
        release = path.parent.name
        with path.open(newline="") as stream:
            for line, row in enumerate(csv.DictReader(stream), 2):
                verification = source.endswith("benchmark-verification.csv")
                if verification:
                    timer, raw, unit = "proof_wall_seconds", row["proof_wall_seconds"], "seconds"
                    disposition = row["proof_status"]
                elif release == "0.1.6":
                    timer, raw, unit = "complete_wall_seconds", row["complete_wall_seconds"], "seconds"
                    disposition = row["status"]
                else:
                    timer, raw, unit = row["timer"], row["candidate_ns"], "nanoseconds"
                    disposition = row["disposition"]
                value = str(int(Decimal(raw) * 1_000_000_000)) if raw and unit == "seconds" else raw
                yield dict(
                    family=row["family"], case=row["case"], release=release,
                    kind="verification" if verification else "performance", timer=timer,
                    value_ns=value, source_value=raw, source_unit=unit,
                    normalization="decimal seconds × 1000000000; sub-ns truncated" if raw and unit == "seconds" else "copied",
                    profile="released host-Store; see README; different topology and clock",
                    disposition=disposition, source_file=source, source_row=str(line),
                    source_sha256=seal, source_seal=row.get("source_seal", ""),
                    product_seal=row.get("product_seal", ""),
                    producing_treatment=row.get("producing_treatment", ""),
                    producing_binary_sha256=row.get("producing_binary_sha256", ""),
                    evidence=row.get("evidence", ""),
                    source_row_json=json.dumps(row, sort_keys=True, separators=(",", ":")),
                )


def write_references(destination, root=ROOT):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("x", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=REFERENCE_COLUMNS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(released_references(root))


def write_new(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("x") as stream:
        json.dump(value, stream, sort_keys=True, indent=2)
        stream.write("\n")
    path.chmod(0o600)


def command(argv, folder, label, seconds, *, cwd=ROOT, environment=None, allow_failure=False):
    """One attempted child; retain streams and host-only timeout custody.

    A host fence proves no Docker cancellation, container stop or unmount.
    No retry, output overwrite or removal follows an unknown result.
    """
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    record = {"argv": list(map(str, argv)), "cwd": str(cwd), "attempts": 1,
              "wall_stop_seconds": seconds, "status": "ATTEMPT_DECLARED",
              "stdout": str(folder / (label + ".stdout")),
              "stderr": str(folder / (label + ".stderr"))}
    write_new(folder / (label + ".attempt.json"), record)
    child = None
    original = None
    started = time.monotonic_ns()
    try:
        with Path(record["stdout"]).open("xb") as stdout, Path(record["stderr"]).open("xb") as stderr:
            child = subprocess.Popen(record["argv"], cwd=cwd, env=environment,
                                     stdin=subprocess.DEVNULL, stdout=stdout, stderr=stderr,
                                     start_new_session=True)
            write_new(folder / (label + ".host-custody.json"), {"host_pid": child.pid,
                      "host_group": child.pid, "remote_cancellation": "NOT_ESTABLISHED"})
            record["exit_code"] = child.wait(timeout=seconds)
        record["status"] = "PASS" if record["exit_code"] == 0 else "FAIL"
    except BaseException as error:
        original = error
        record.update(status="FAIL", original_failure_type=type(error).__name__,
                      original_failure=str(error), timeout=isinstance(error, subprocess.TimeoutExpired),
                      remote_cancellation="NOT_ESTABLISHED; retain exact Docker resources")
        try:
            if child is not None and child.poll() is None:
                os.killpg(child.pid, signal.SIGKILL)
                child.wait(timeout=1)
        except BaseException as fencing:
            record["independent_host_fence_failure"] = str(fencing)
    finally:
        record["complete_wall_ns"] = time.monotonic_ns() - started
        try:
            write_new(folder / (label + ".completion.json"), record)
        except BaseException as writing:
            if original is None:
                raise
            original.independent_receipt_failure = writing
    if original is not None:
        raise original
    if record["status"] != "PASS" and not allow_failure:
        raise RuntimeError(f"{label} failed with exit {record['exit_code']}; see {folder}")
    return record


def manifest(folder):
    folder = Path(folder)
    hashes = {}
    for path in sorted(folder.rglob("*")):
        if path.is_file() and path.name != "manifest.json":
            value = hashlib.sha256()
            with path.open("rb") as stream:
                for chunk in iter(lambda: stream.read(65536), b""):
                    value.update(chunk)
            hashes[str(path.relative_to(folder))] = value.hexdigest()
    write_new(folder / "manifest.json", {"schema": "fs-bench-pro-evidence-v1", "files": hashes})


def verify_manifest(folder):
    folder = Path(folder)
    record = json.loads((folder / "manifest.json").read_text())
    for relative, wanted in record["files"].items():
        path = Path(relative)
        if path.is_absolute() or ".." in path.parts:
            raise ValueError("evidence path escapes its recorded run")
        value = hashlib.sha256()
        with (folder / path).open("rb") as stream:
            for chunk in iter(lambda: stream.read(65536), b""):
                value.update(chunk)
        if value.hexdigest() != wanted:
            raise ValueError("retained evidence changed: " + relative)
    return record


PERFORMANCE_COLUMNS = "family case v016_case status cache_class complete_wall_ns mount_ns command_ns commit_ns unmount_ns declared_limit_ns limit_status requests owner_jobs statements store_logical_bytes store_allocated_bytes overlay_logical_bytes overlay_allocated_bytes cleanup reference_release reference_timer reference_ns reference_profile source_commit product_tree daemon_sha256 image evidence tag".split()
VERIFICATION_COLUMNS = "family case v016_case proof_status proof_wall_ns declared_limit_ns oracle_scope omissions cleanup source_commit product_tree image evidence tag".split()


def result_rows(selection, recorded):
    """One row per registration, including failed and absent observations."""
    performance, verification = [], []
    reference_path = ROOT / "core/benchmark/fs-bench-pro/baselines/v0.1.6/reference.csv"
    with reference_path.open(newline="") as stream:
        references = {(r["source_file"], r["source_row"]): r for r in csv.DictReader(stream)}
    for case in selection["cases"]:
        result = recorded.get(case["id"], {})
        row = {name: "UNAVAILABLE" for name in PERFORMANCE_COLUMNS}
        row.update(family=selection["family"], case=case["id"], v016_case=case.get("v016_case", ""),
                   status=result.get("status", "NOT_APPLICABLE" if case.get("status") == "not-applicable" else "NOT_RUN"),
                   cache_class=result.get("cache_class", case.get("cache_class", "UNAVAILABLE")),
                   tag=result.get("tag", result.get("original_failure", case.get("reason", "not sampled" if not result else ""))))
        for name in ("complete_wall_ns", "declared_limit_ns", "cleanup", "source_commit", "product_tree", "daemon_sha256", "image", "evidence"):
            row[name] = result.get(name, selection.get(name, "UNAVAILABLE"))
        for name in ("mount_ns", "command_ns", "commit_ns", "unmount_ns"):
            row[name] = result.get("phases", {}).get(name, "UNAVAILABLE")
        for name in ("requests", "owner_jobs", "statements"):
            row[name] = result.get("counts", {}).get(name, "UNAVAILABLE")
        for name in ("store_logical_bytes", "store_allocated_bytes", "overlay_logical_bytes", "overlay_allocated_bytes"):
            observation = result.get("observations", {}).get(name, {})
            if observation.get("status") == "AVAILABLE":
                row[name] = observation["value"]
        if type(row["complete_wall_ns"]) is int and type(row["declared_limit_ns"]) is int:
            row["limit_status"] = "EXCEEDED" if row["complete_wall_ns"] > row["declared_limit_ns"] else "WITHIN"
        reference = case.get("reference") or {}
        if reference.get("kind") == "performance":
            reference = references[(reference["source_file"], reference["source_row"])]
        elif reference.get("kind") == "verification":
            reference = {}
        for column, key in (("reference_release", "release"), ("reference_timer", "timer"), ("reference_ns", "value_ns"), ("reference_profile", "profile")):
            row[column] = reference.get(key, "")
        proof = {name: row.get(name, "UNAVAILABLE") for name in VERIFICATION_COLUMNS}
        proof.update(proof_status=result.get("proof_status", "NOT_RUN"),
                     proof_wall_ns=result.get("proof_wall_ns", "UNAVAILABLE"),
                     declared_limit_ns=result.get("verifier_limit_ns", "UNAVAILABLE"),
                     oracle_scope=result.get("verification", {}).get("scope", "UNAVAILABLE"),
                     omissions=result.get("verification", {}).get("omissions", "UNAVAILABLE"))
        performance.append(row)
        verification.append(proof)
    return performance, verification


def load_run(folder):
    folder = Path(folder).resolve()
    selection = json.loads((folder / "run.json").read_text())
    recorded = {}
    for case in selection["cases"]:
        receipt = folder / case["id"] / "receipt.json"
        if receipt.exists():
            verify_manifest(receipt.parent)
            result = json.loads(receipt.read_text())
            if (result["case"], result["source_commit"], result["product_tree"]) != (
                    case["id"], selection["source_commit"], selection["product_tree"]):
                raise ValueError("recorded case/source differs from original run registration")
            recorded[case["id"]] = result
        elif receipt.parent.exists():
            recorded[case["id"]] = {"status": "FAIL", "proof_status": "NOT_RUN",
                                    "tag": "partial original attempt; completed receipt unavailable",
                                    "evidence": str(receipt.parent.relative_to(ROOT))}
    return selection, recorded


def report(folder, destination=None):
    selection, recorded = load_run(folder)
    performance, verification = result_rows(selection, recorded)
    root = ROOT / "core/benchmark"
    parent = root / ("cluster-two/baselines" if selection["family"] == "cluster-two/cells" else "fs-bench-pro/baselines/core")
    destination = Path(destination) if destination else parent / (selection["date"] + "-" + selection["source_commit"][:9])
    destination.mkdir(parents=True, exist_ok=True)
    for name, columns, rows in (("performance.csv", PERFORMANCE_COLUMNS, performance), ("verification.csv", VERIFICATION_COLUMNS, verification)):
        with (destination / name).open("x", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=columns, lineterminator="\n")
            writer.writeheader()
            writer.writerows(rows)
    lines = ["Reference from each named release, different topology and clock. No ratio or comparison verdict.",
             "| Family / case | Status | Complete ns / bound | Mount / command / commit / unmount ns | Requests / owner jobs / statements | Store / overlay allocated B | Verifier ns / bound | Cache / cleanup | Reference timer / ns |",
             "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
    for row, proof in zip(performance, verification):
        value = lambda key: str(row[key])
        lines.append("| " + " | ".join((row["family"] + " / " + row["case"], row["status"],
            value("complete_wall_ns") + " / " + value("declared_limit_ns") + " " + row["limit_status"],
            " / ".join(value(key) for key in ("mount_ns", "command_ns", "commit_ns", "unmount_ns")),
            " / ".join(value(key) for key in ("requests", "owner_jobs", "statements")),
            value("store_allocated_bytes") + " / " + value("overlay_allocated_bytes"),
            str(proof["proof_wall_ns"]) + " / " + str(proof["declared_limit_ns"]),
            row["cache_class"] + " / " + row["cleanup"], row["reference_timer"] + " / " + str(row["reference_ns"]))) + " |")
    return {"destination": str(destination), "table": "\n".join(lines), "cases": len(performance)}
