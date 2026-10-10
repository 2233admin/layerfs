"""Append-only evidence and lossless released-reference provenance."""
import csv
from decimal import Decimal
import hashlib
import json
import math
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


PUBLICATION_SCOPE = "original Git cumulative verification hard deadline through receipt write, evidence hashing, manifest publication, publication-observation write/hash and guarded completion publication; monotonic host clock; no measured performance interval charged"
HISTORY_PUBLICATION_SCOPE = "original family history cumulative verification hard deadline through receipt write, evidence hashing, manifest publication, publication-observation write/hash and guarded completion publication; monotonic host clock; no measured performance interval charged"
PUBLICATION_COMPLETION_SCOPE = "post-write/hash monotonic boundary witnesses receipt, manifest and publication observation completion; attestation attempt emission follows this boundary without claiming its own write timestamp; successful completion link requires guarded admission and post-publication check, and is revoked on failure with exact attempt bytes retained"
PUBLICATION_ADMISSION_REASON = "original publication guard reached before receipt write"
PUBLICATION_COMPLETION_REASON = "original publication guard reached before completion publication"
PUBLICATION_DEADLINE_REASON = "original hard deadline reached during receipt/manifest/observation/completion publication"
PUBLICATION_GUARD_SECONDS = 0.25
PUBLICATION_OUTER_SCOPE = "known outer driver observation after one_family_case returned; acknowledgement emission follows outside the original family publication timer and does not claim its own completion timestamp"
PUBLICATION_IDENTITY = ("schema", "family", "case", "source_commit", "product_tree", "image", "daemon_sha256", "runtime_sha256")


def _publication_failed(row, reason):
    result = dict(row)
    label = "receipt publication FAIL: " + reason
    original_tag = row.get("tag") or ""
    result.update(status="FAIL", proof_status="FAIL",
                  tag=original_tag if label in original_tag.split("; ") else
                      "; ".join(filter(None, (original_tag, label))))
    return result


def _publication_binding(folder, row):
    receipt = Path(folder) / "receipt.json"
    sealed = Path(folder) / "manifest.json"
    receipt_sha = hashlib.sha256(receipt.read_bytes()).hexdigest()
    manifest_sha = hashlib.sha256(sealed.read_bytes()).hexdigest()
    manifest_record = json.loads(sealed.read_text())
    if (manifest_record.get("schema") != "fs-bench-pro-evidence-v1"
            or manifest_record.get("files", {}).get("receipt.json") != receipt_sha):
        raise ValueError("guarded receipt is not bound by its original manifest")
    return {"receipt_sha256": receipt_sha, "manifest_sha256": manifest_sha,
            "identity": {name: row.get(name) for name in PUBLICATION_IDENTITY}}


def _publication_clock(previous=None):
    value = time.monotonic()
    if (type(value) not in (int, float) or not math.isfinite(value) or value < 0
            or previous is not None and value < previous):
        raise ValueError("finite nondecreasing numeric monotonic publication clock required")
    return value


def finalize_guarded(folder, row, absolute_stop, publication_guard_seconds=PUBLICATION_GUARD_SECONDS, *, scope=PUBLICATION_SCOPE):
    """Append-only publication; a late seal gains a bound failure, never a rewrite.

    Return the effective row. Callers returning an existing row from a finally
    block must update that row with this result. Existing finalizers are unchanged.
    Auxiliary observations/dispositions are appended outside the original manifest
    and bind both original files. The mandatory completion attestation witnesses
    the preceding publication interval, not its own final write. Only its owned
    provisional success link may be revoked after a failed post-publication check;
    exact attempt bytes remain. Absent completion cannot qualify.
    """
    if (type(absolute_stop) not in (int, float) or not math.isfinite(absolute_stop) or absolute_stop <= 0
            or type(publication_guard_seconds) not in (int, float)
            or publication_guard_seconds != PUBLICATION_GUARD_SECONDS
            or scope not in (PUBLICATION_SCOPE, HISTORY_PUBLICATION_SCOPE)):
        raise ValueError("finite positive numeric deadline and frozen 0.25 s publication guard required")
    folder = Path(folder)
    if any((folder / name).exists() for name in
           ("receipt.json", "manifest.json", "publication.json", "publication-failure.json",
            "publication-completion.attempt.json", "publication-completion.json",
            "publication-outer-acknowledgement.json")):
        raise FileExistsError("guarded finalization cannot overwrite original publication")
    started = _publication_clock()
    declaration = {"schema": "fs-bench-pro-publication-guard-v1", "absolute_stop_monotonic": absolute_stop,
                   "publication_guard_seconds": publication_guard_seconds, "started_monotonic": started,
                   "scope": scope}
    original = {**row, "publication_guard": declaration}
    late_admission = started >= absolute_stop-publication_guard_seconds
    if late_admission:
        original = _publication_failed(original, PUBLICATION_ADMISSION_REASON)
    write_new(folder / "receipt.json", original)
    manifest(folder)
    binding = _publication_binding(folder, original)
    published = _publication_clock(started)
    observation = {**binding, **declaration,
                   "schema": "fs-bench-pro-publication-observation-v1",
                   "receipt_manifest_published_monotonic": published,
                   "receipt_manifest_elapsed_ns": int((published-started)*1_000_000_000),
                   "admission_guard_failed": late_admission,
                   "completion_scope": "actual receipt/manifest write and hashing complete; auxiliary observation follows"}
    write_new(folder / "publication.json", observation)
    observation_sha = hashlib.sha256((folder / "publication.json").read_bytes()).hexdigest()
    finished = _publication_clock(published)
    def failed_publication(ended, reason):
        write_new(folder / "publication-failure.json", {
            "schema": "fs-bench-pro-publication-failure-v1", **binding,
            "publication_observation_sha256": observation_sha, "status": "FAIL", "reason": reason,
            "started_monotonic": started, "finished_monotonic": ended,
            "absolute_stop_monotonic": absolute_stop, "publication_guard_seconds": publication_guard_seconds,
            "complete_publication_elapsed_ns": int((ended-started)*1_000_000_000),
            "scope": scope})
        return _publication_failed(original, reason)
    if late_admission or finished >= absolute_stop:
        return failed_publication(finished, PUBLICATION_ADMISSION_REASON if late_admission else PUBLICATION_DEADLINE_REASON)
    if finished >= absolute_stop-publication_guard_seconds:
        return failed_publication(finished, PUBLICATION_COMPLETION_REASON)
    attempt = folder / "publication-completion.attempt.json"
    completion = folder / "publication-completion.json"
    write_new(attempt, {**binding, **declaration,
        "schema": "fs-bench-pro-publication-completion-v1",
        "publication_observation_sha256": observation_sha,
        "status": "OBSERVATION_COMPLETE_WITHIN_DEADLINE",
        "witnessed_observation_finished_monotonic": finished,
        "witnessed_observation_elapsed_ns": int((finished-started)*1_000_000_000),
        "completion_scope": PUBLICATION_COMPLETION_SCOPE})
    attempt_sha = hashlib.sha256(attempt.read_bytes()).hexdigest()
    after_attempt = _publication_clock(finished)
    if after_attempt >= absolute_stop-publication_guard_seconds:
        return failed_publication(after_attempt, PUBLICATION_DEADLINE_REASON if after_attempt >= absolute_stop else PUBLICATION_COMPLETION_REASON)
    linked = False
    try:
        os.link(attempt, completion)
        linked = True
        if hashlib.sha256(completion.read_bytes()).hexdigest() != attempt_sha:
            raise ValueError("published completion differs from its retained attempt")
        after_link = _publication_clock(after_attempt)
        if after_link >= absolute_stop:
            completion.unlink()
            linked = False
            return failed_publication(after_link, PUBLICATION_DEADLINE_REASON)
    except BaseException:
        if linked:
            completion.unlink()
        raise
    return original


def _publication_return_verdict(row, returned_status, returned_proof):
    if (returned_status not in (row.get("status"), "FAIL")
            or returned_proof not in (row.get("proof_status"), "FAIL")):
        raise ValueError("outer acknowledgement cannot promote original publication verdict")
    result = {**row, "status": returned_status, "proof_status": returned_proof}
    if (returned_status, returned_proof) != (row.get("status"), row.get("proof_status")):
        result["tag"] = "; ".join(filter(None, (row.get("tag"),
            f"outer driver returned disposition {returned_status}/{returned_proof}")))
    return result


def _publication_verdict_sha(status, proof):
    value = json.dumps({"status": status, "proof_status": proof}, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(value.encode()).hexdigest()


def acknowledge_guarded(folder, returned_row):
    """Driver-only observation after one_family_case has actually returned.

    This acknowledgement is outside the original family publication clock. Its
    timestamp witnesses the known return, not its own subsequent record emission.
    Missing/partial emission cannot qualify a successful guarded receipt.
    """
    folder = Path(folder)
    original = json.loads((folder / "receipt.json").read_text())
    if original.get("publication_guard") is None:
        return None
    verify_manifest(folder)
    binding = _publication_binding(folder, original)
    if any(returned_row.get(name) != value for name, value in binding["identity"].items()):
        raise ValueError("outer acknowledgement returned identity differs from original publication")
    baseline = _publication_overlay(folder, original, original, require_outer_ack=False)
    _publication_return_verdict(baseline, returned_row.get("status"), returned_row.get("proof_status"))
    completion = folder / "publication-completion.json"
    previous = json.loads(completion.read_text())["witnessed_observation_finished_monotonic"] if completion.exists() else None
    record = {**binding, "schema": "fs-bench-pro-publication-outer-acknowledgement-v1",
        "publication_completion_sha256": hashlib.sha256(completion.read_bytes()).hexdigest() if completion.exists() else None,
        "finalizer_return_observed": True, "observed_return_monotonic": _publication_clock(previous),
        "returned_status": returned_row.get("status"), "returned_proof_status": returned_row.get("proof_status"),
        "returned_verdict_sha256": _publication_verdict_sha(returned_row.get("status"), returned_row.get("proof_status")),
        "scope": PUBLICATION_OUTER_SCOPE}
    write_new(folder / "publication-outer-acknowledgement.json", record)
    return record


def _publication_overlay(folder, row, selection, *, require_outer_ack=True):
    declaration = row.get("publication_guard")
    if declaration is None:
        return row
    if (row.get("family") != selection.get("family")
            or "image" in selection and row.get("image") != selection["image"]):
        raise ValueError("guarded publication run identity differs")
    if (declaration.get("schema") != "fs-bench-pro-publication-guard-v1"
            or declaration.get("scope") not in (PUBLICATION_SCOPE, HISTORY_PUBLICATION_SCOPE)):
        raise ValueError("guarded publication declaration differs")
    if (any(type(declaration.get(name)) not in (int, float) or not math.isfinite(declaration[name])
            for name in ("started_monotonic", "absolute_stop_monotonic", "publication_guard_seconds"))
            or declaration["absolute_stop_monotonic"] <= 0 or declaration["started_monotonic"] < 0
            or declaration["publication_guard_seconds"] != PUBLICATION_GUARD_SECONDS):
        raise ValueError("guarded publication clock declaration differs")
    expected = _publication_binding(folder, row)
    observation_path = Path(folder) / "publication.json"
    if not observation_path.exists():
        return _publication_failed(row, "guarded publication completion unavailable; original evidence retained")
    observation = json.loads(observation_path.read_text())
    def bound(record):
        return (all(record.get(key) == value for key, value in expected.items())
                and all(record.get(key) == declaration.get(key) for key in
                        ("started_monotonic", "absolute_stop_monotonic", "publication_guard_seconds", "scope")))
    if (not bound(observation) or observation.get("schema") != "fs-bench-pro-publication-observation-v1"):
        raise ValueError("publication observation receipt/manifest/identity binding differs")
    started, stop = declaration["started_monotonic"], declaration["absolute_stop_monotonic"]
    published = observation.get("receipt_manifest_published_monotonic")
    if (type(published) not in (int, float) or not math.isfinite(published) or published < started
            or observation.get("receipt_manifest_elapsed_ns") != int((published-started)*1_000_000_000)
            or observation.get("admission_guard_failed") is not (started >= stop-declaration["publication_guard_seconds"])):
        raise ValueError("publication observation clock/deadline binding differs")
    failure_path = Path(folder) / "publication-failure.json"
    if failure_path.exists():
        failure = json.loads(failure_path.read_text())
        ended = failure.get("finished_monotonic")
        if (not bound(failure) or failure.get("schema") != "fs-bench-pro-publication-failure-v1"
                or failure.get("publication_observation_sha256") != hashlib.sha256(observation_path.read_bytes()).hexdigest()
                or failure.get("status") != "FAIL"
                or type(ended) not in (int, float)
                or not math.isfinite(ended) or ended < published
                or failure.get("complete_publication_elapsed_ns") != int((ended-started)*1_000_000_000)):
            raise ValueError("publication failure receipt/manifest/identity/deadline binding differs")
        reason = (PUBLICATION_ADMISSION_REASON if observation["admission_guard_failed"] else
                  PUBLICATION_DEADLINE_REASON if ended >= stop else
                  PUBLICATION_COMPLETION_REASON if ended >= stop-declaration["publication_guard_seconds"] else None)
        if reason is None or failure.get("reason") != reason:
            raise ValueError("publication failure receipt/manifest/identity/deadline binding differs")
        return _publication_failed(row, failure["reason"])
    completion_path = Path(folder) / "publication-completion.json"
    if not completion_path.exists():
        return _publication_failed(row, "guarded publication completion unavailable; original evidence retained")
    completion = json.loads(completion_path.read_text())
    attempt_path = Path(folder) / "publication-completion.attempt.json"
    ended = completion.get("witnessed_observation_finished_monotonic")
    if (not bound(completion) or completion.get("schema") != "fs-bench-pro-publication-completion-v1"
            or not attempt_path.exists() or completion_path.read_bytes() != attempt_path.read_bytes()
            or completion.get("publication_observation_sha256") != hashlib.sha256(observation_path.read_bytes()).hexdigest()
            or completion.get("completion_scope") != PUBLICATION_COMPLETION_SCOPE
            or type(ended) not in (int, float) or not math.isfinite(ended) or ended < published
            or ended >= stop-declaration["publication_guard_seconds"] or observation["admission_guard_failed"]
            or completion.get("witnessed_observation_elapsed_ns") != int((ended-started)*1_000_000_000)
            or completion.get("status") != "OBSERVATION_COMPLETE_WITHIN_DEADLINE"):
        raise ValueError("publication completion receipt/manifest/identity/deadline binding differs")
    if not require_outer_ack:
        return row
    acknowledgement_path = Path(folder) / "publication-outer-acknowledgement.json"
    if not acknowledgement_path.exists():
        return _publication_failed(row, "outer finalization acknowledgement unavailable; original evidence retained")
    try:
        acknowledgement = json.loads(acknowledgement_path.read_text())
    except json.JSONDecodeError:
        return _publication_failed(row, "outer finalization acknowledgement incomplete; original evidence retained")
    observed_return = acknowledgement.get("observed_return_monotonic") if isinstance(acknowledgement, dict) else None
    if (not isinstance(acknowledgement, dict)
            or any(acknowledgement.get(key) != value for key, value in expected.items())
            or acknowledgement.get("schema") != "fs-bench-pro-publication-outer-acknowledgement-v1"
            or acknowledgement.get("publication_completion_sha256") != hashlib.sha256(completion_path.read_bytes()).hexdigest()
            or acknowledgement.get("finalizer_return_observed") is not True
            or acknowledgement.get("scope") != PUBLICATION_OUTER_SCOPE
            or acknowledgement.get("returned_verdict_sha256") != _publication_verdict_sha(acknowledgement.get("returned_status"), acknowledgement.get("returned_proof_status"))
            or type(observed_return) not in (int, float) or not math.isfinite(observed_return) or observed_return < ended):
        raise ValueError("outer acknowledgement receipt/manifest/identity/completion binding differs")
    return _publication_return_verdict(row, acknowledgement.get("returned_status"), acknowledgement.get("returned_proof_status"))


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
            if not (receipt.parent / "manifest.json").exists():
                partial = json.loads(receipt.read_text())
                if isinstance(partial, dict) and isinstance(partial.get("publication_guard"), dict):
                    recorded[case["id"]] = {
                        **{name: selection.get(name, "UNAVAILABLE") for name in
                           ("family", "source_commit", "product_tree", "image")},
                        "case": case["id"], "status": "FAIL", "proof_status": "FAIL",
                        "tag": "guarded original attempt; authentication/publication incomplete: original manifest unavailable; unauthenticated metrics withheld",
                        **{name: "UNAVAILABLE" for name in ("complete_wall_ns", "proof_wall_ns",
                           "declared_limit_ns", "verifier_limit_ns", "daemon_sha256", "cache_class", "cleanup")},
                        "evidence": str(receipt.parent)}
                    continue
            verify_manifest(receipt.parent)
            result = json.loads(receipt.read_text())
            if (result["case"], result["source_commit"], result["product_tree"]) != (
                    case["id"], selection["source_commit"], selection["product_tree"]):
                raise ValueError("recorded case/source differs from original run registration")
            recorded[case["id"]] = resource_disposition(receipt.parent, _publication_overlay(receipt.parent, result, selection))
        elif receipt.parent.exists():
            recorded[case["id"]] = {"status": "FAIL", "proof_status": "NOT_RUN",
                                    "tag": "partial original attempt; completed receipt unavailable",
                                    "evidence": str(receipt.parent.relative_to(ROOT))}
    return selection, recorded


def resource_disposition(folder, row):
    """Read separately bound administrative custody without changing a verdict."""
    folder = Path(folder)
    output = folder / "resource-removal"
    if not output.exists():
        return row
    if not (output / "completion.json").exists() or not (output / "manifest.json").exists():
        return {**row, "administrative_removal_status": "UNCERTAIN",
                "resource_disposition": "administrative removal incomplete; inspect exact retained attempts, no both-retained claim"}
    verify_manifest(output)
    record = json.loads((output / "completion.json").read_text())
    original = json.loads((folder / "receipt.json").read_text())
    digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
    acknowledgement = folder / "publication-outer-acknowledgement.json"
    names = ("family", "case", "source_commit", "product_tree", "image", "container", "clone")
    if (record.get("schema") != "fs-bench-pro-resource-removal-v1"
            or record.get("receipt_sha256") != digest(folder / "receipt.json")
            or record.get("manifest_sha256") != digest(folder / "manifest.json")
            or record.get("outer_ack_sha256") != (digest(acknowledgement) if original.get("publication_guard") else None)
            or record.get("identity") != {name: original.get(name) for name in names}
            or record.get("known_outer_return") is not True
            or record.get("container") != original.get("container")
            or record.get("volume") != original.get("clone", {}).get("volume")):
        raise ValueError("administrative resource removal original receipt/manifest/return binding differs")
    return {**row, "administrative_removal_status": record["status"],
            "resource_disposition": record["resource_disposition"]}


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
