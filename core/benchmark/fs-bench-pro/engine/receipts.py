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
