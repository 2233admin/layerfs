"""Issue 318 benchmark driver: bounded steps, one original and one test copy of a payload.

usage: step.py <tag> <budget-seconds> <kind> [<item> ...]

kinds and items:
  build                                  seal the locked release builds of the tag
  prepare <family>:<case> ...            one original a case (cells: cells:empty, cells:big64m)
  run     <family>:<case> ...            one sample a case (cells: cells:C01 ...; workspace_reliability:all)
  report  <family> ...                   the engine's two CSVs and table for a finished family
  rows    <family> ...                   compact rows of a family's receipts, beside iteration 1's
  clean [originals]                      remove leftover test copies; with `originals`, every original

Extends core/docs/issues/316/tools/tier_step.py to every family of iteration 1.
The harness engine is used unchanged, through bench.py.

Time (owner, 2026-10-11): no command runs longer than 2 minutes, 5 in an extreme
case. Each step gets what is left of the budget; no step starts with less than
20 s left and no sample with less than 75 s left (a lower floor can be named
for cases whose control sample ended well inside it). Steps not started are printed.
A case that has a receipt folder for the tag is never sampled again.

Storage (owner, 2026-10-11): at most two copies of a case's payload.
- The original is the prepared folder of a case and its master volume, under
  `issue318-originals/`. It is never changed and is removed with `clean originals`.
- The test copy is what a sample makes from it: every `layerfs-fsb-sample-*`
  volume named in the sample's own records, the containers on those volumes, the
  exported and normalized Stores (`graph-store`, `census-store`) and any
  `store.sqlite*` file the sample built beside its receipt. `run` first checks the sample's sealed manifest in full, then removes
  the test copy whatever the sample's status and records each removed manifest
  entry with its sealed hash in `payload-cleanup.json`.
- `report` calls the engine's own report code. The engine verifies every sealed
  file again when it loads a run; for exactly the entries recorded as removed
  after a full check, that second check is answered from the record.
"""
import datetime
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3] if Path(__file__).resolve().parents[1].name == "target" \
    else Path(__file__).resolve().parents[5]
HARNESS = ROOT / "core/benchmark/fs-bench-pro"
BENCH = "core/benchmark/fs-bench-pro/bench.py"
LOCK = "core/target/r4-locked.pl"
RESULTS = ROOT / "benchmark-results/fs-bench-pro"
ORIGINALS = "benchmark-results/fs-bench-pro/issue318-originals"
LOGS = ROOT / "core/target/issue318/logs"
RULE = "owner 2026-10-11: one original and one test copy of a payload; the test copy is removed after its sample"
SAMPLE_VOLUME = re.compile(r"layerfs-fsb-sample-[0-9a-f]{16}")
PAYLOAD_FOLDERS = ("graph-store", "census-store")
# Whole SQLite copies a sample keeps beside its receipt: the Store it built or exported, the pristine
# Store and the closed overlay of the reuse families.
PAYLOAD_FILES = ("store.sqlite", "pristine-store.sqlite", "closed-overlay.sqlite")
CELLS = "cluster-two/cells"
# A sample starts only with this much of the budget left. 75 s unless the caller names a lower floor
# for cases whose control sample is known to end well inside it.
FLOOR = int(os.environ.get("ISSUE318_SAMPLE_FLOOR", "75"))
# A preparation starts only with this much left: one the budget ends leaves a partial original to redo.
PREPARE_FLOOR = int(os.environ.get("ISSUE318_PREPARE_FLOOR", "60"))


def say(**fields):
    print(json.dumps(fields), flush=True)


def docker(*arguments):
    done = subprocess.run(["docker", *SOCKET, *arguments], capture_output=True, text=True)
    return done.returncode, done.stdout.strip(), done.stderr.strip()[-200:]


def folders(parent):
    return sorted(item for item in parent.glob("*") if item.is_dir())


def tree_bytes(path):
    total = 0
    for folder, _, names in os.walk(path):
        for name in names:
            entry = Path(folder) / name
            if not entry.is_symlink():
                total += entry.stat().st_size
    return total


def remove_tree(path):
    for folder, names, _ in os.walk(path):
        os.chmod(folder, 0o700)
        for name in names:
            if not (Path(folder) / name).is_symlink():
                os.chmod(Path(folder) / name, 0o700)
    size = tree_bytes(path)
    shutil.rmtree(path)
    return size


def file_sha256(path):
    value = hashlib.sha256()
    with open(path, "rb") as stream:
        for chunk in iter(lambda: stream.read(1 << 20), b""):
            value.update(chunk)
    return value.hexdigest()


def sample_volumes(sample):
    """Every sample volume this sample's own small records name."""
    found = set()
    for folder, names, files in os.walk(sample):
        names[:] = [name for name in names if name not in PAYLOAD_FOLDERS]
        for name in files:
            entry = Path(folder) / name
            if entry.is_symlink() or entry.stat().st_size > 8 << 20:
                continue
            try:
                found.update(SAMPLE_VOLUME.findall(entry.read_text(errors="ignore")))
            except OSError:
                pass
    return sorted(found)


def drop_test_copy(sample):
    """Check the sealed manifest, then remove the sample's volumes, their containers and exported Stores."""
    record = sample / "payload-cleanup.json"
    if record.exists() or not sample.is_dir():
        return None
    removed = {"rule": RULE, "volumes": [], "containers": [], "manifest_check_before_removal": None,
               "removed_manifest_entries": {}, "bytes": {}}
    failures = []
    sealed = {}
    manifest = sample / "manifest.json"
    if manifest.exists():
        sealed = json.loads(manifest.read_text())["files"]
        wrong = [name for name, wanted in sealed.items()
                 if not (sample / name).is_file() or file_sha256(sample / name) != wanted]
        removed["manifest_check_before_removal"] = "PASS" if not wrong else "FAIL: " + ", ".join(wrong[:5])
    for volume in sample_volumes(sample):
        code, listed, error = docker("ps", "--all", "--quiet", "--no-trunc", "--filter", "volume=" + volume)
        if code:
            failures.append("list: " + error)
        for container in listed.split():
            docker("stop", "--time", "2", container)
            code, _, error = docker("rm", "--force", container)
            (failures if code else removed["containers"]).append(container + (": " + error if code else ""))
        code, known, _ = docker("volume", "ls", "--quiet", "--filter", "name=" + volume)
        if not code and volume in known.split():
            code, _, error = docker("volume", "rm", volume)
            if code:
                failures.append("volume " + volume + ": " + error)
            else:
                removed["volumes"].append(volume)
    for folder, names, _ in os.walk(sample):
        for name in [name for name in names if name in PAYLOAD_FOLDERS]:
            exported = Path(folder) / name
            relative = str(exported.relative_to(sample))
            for entry, wanted in sealed.items():
                if entry == relative or entry.startswith(relative + "/"):
                    removed["removed_manifest_entries"][entry] = wanted
            removed["bytes"][relative] = remove_tree(exported)
            names.remove(name)
    # The Store a sample itself built or exported (Init families keep it beside the receipt).
    for entry in sorted(sample.rglob("*")):
        if entry.is_file() and not entry.is_symlink() and entry.name.startswith(PAYLOAD_FILES):
            relative = str(entry.relative_to(sample))
            if relative in sealed:
                removed["removed_manifest_entries"][relative] = sealed[relative]
            removed["bytes"][relative] = entry.stat().st_size
            os.chmod(entry.parent, 0o700)
            entry.unlink()
    if failures:
        say(cleanup=sample.name, failed=failures)
        return None
    left = tree_bytes(sample)
    large = sorted(((entry.stat().st_size, str(entry.relative_to(sample))) for entry in sample.rglob("*")
                    if entry.is_file() and not entry.is_symlink() and entry.stat().st_size > 16 << 20), reverse=True)[:4]
    removed["left_bytes"], removed["left_large_files"] = left, large
    record.write_text(json.dumps(removed, indent=2) + "\n")
    return {"volumes": len(removed["volumes"]), "containers": len(removed["containers"]),
            "manifest": removed["manifest_check_before_removal"],
            "removed_mb": round(sum(removed["bytes"].values()) / 1e6, 1), "left_mb": round(left / 1e6, 1),
            **({"left_large": large} if large else {})}


def drop_test_copies():
    for run in RESULTS.glob("*-issue318-*-run-*"):
        for sample in folders(run):
            cleaned = drop_test_copy(sample)
            if cleaned:
                say(cleanup=sample.name, **cleaned)


def master(folder):
    claim = folder / "resource-claim.json"
    return json.loads(claim.read_text()).get("volume") if claim.exists() else None


def original_volumes(folder):
    """Volumes an original names: its master and any history master of a producer."""
    found = set()
    if (folder / "issue318-volumes.json").exists():
        found |= set(json.loads((folder / "issue318-volumes.json").read_text()))
    for claim in folder.rglob("resource-claim.json"):
        try:
            value = json.loads(claim.read_text()).get("volume")
        except (OSError, ValueError):
            value = None
        if isinstance(value, str) and value.startswith("layerfs-fsb-"):
            found.add(value)
    return found


def drop_original(folder, why):
    volumes = original_volumes(folder)
    samples = set(sample_volumes(folder))
    size = remove_tree(folder)
    kept = set()
    for other in folders(ROOT / ORIGINALS):
        kept |= original_volumes(other)
    notes = []
    for volume in sorted((volumes | samples) - kept):
        if volume not in docker("volume", "ls", "--quiet", "--filter", "name=" + volume)[1].split():
            continue
        # A preparation that failed leaves its setup container on the volume.
        for container in docker("ps", "--all", "--quiet", "--filter", "volume=" + volume)[1].split():
            docker("stop", "--time", "2", container)
            docker("rm", "--force", container)
        code, _, error = docker("volume", "rm", volume)
        notes.append(volume[:40] + (": " + error if code else " removed"))
    say(original_removed=folder.name, why=why, mb=round(size / 1e6, 1), volumes=notes,
        shared=sorted(v[:40] for v in volumes & kept))


def current_files():
    sys.path.insert(0, str(HARNESS))
    from engine import identity
    return identity.source_identity()["files"]


def stale(folder, files):
    record = folder / "prepared.json"
    # The harness seals an original with manifest.json after prepared.json; a stop between the two
    # leaves a folder the harness refuses to load.
    if not record.exists() or not (folder / "manifest.json").exists():
        return "incomplete"
    return None if json.loads(record.read_text())["identity"]["files"] == files else "prepared from other source"


def step(name, arguments, least):
    left = int(budget - (time.time() - started))
    if left < least:
        return None, 0
    begun = time.time()
    done = subprocess.run(["perl", LOCK, str(left), "python3", "-B", BENCH, *arguments], cwd=ROOT,
                          env=environment, capture_output=True, text=True)
    (LOGS / (name + ".stdout")).write_text(done.stdout)
    (LOGS / (name + ".stderr")).write_text(done.stderr)
    return done.returncode, round(time.time() - begun, 1)


def slug(family):
    return "cells" if family in ("cells", CELLS) else family


def receipt_row(sample):
    receipt = sample / "receipt.json"
    if not receipt.exists():
        return {"receipt": "none"}
    row = json.loads(receipt.read_text())
    phases, counts, observed = row.get("phases") or {}, row.get("counts") or {}, row.get("observations") or {}
    ms = lambda key: round(phases[key] / 1e6, 1) if isinstance(phases.get(key), int) else None
    value = lambda key: (observed.get(key) or {}).get("value")
    out = {"status": row.get("status"), "functional": row.get("functional_status"), "proof": row.get("proof_status"),
           "exec_ms": ms("command_ns"), "commit_ms": ms("commit_ns"),
           "counts": [counts.get("requests"), counts.get("owner_jobs"), counts.get("statements")],
           "overlay": [value("overlay_logical_bytes"), value("overlay_allocated_bytes")],
           "store": [value("store_logical_bytes"), value("store_allocated_bytes")],
           "cleanup": row.get("cleanup"), "custody": row.get("custody")}
    failure = row.get("original_failure") or row.get("tag")
    if failure:
        out["failure"] = re.sub(r"; see /\S+", "", str(failure))[:220]
    return out


def tolerant_report(run):
    """The engine's report; a sealed file removed by the storage rule is answered from its record."""
    sys.path.insert(0, str(HARNESS))
    from engine import receipts
    original = receipts.verify_manifest

    def verify(folder):
        folder = Path(folder)
        cleanup = folder / "payload-cleanup.json"
        gone = json.loads(cleanup.read_text())["removed_manifest_entries"] if cleanup.exists() else {}
        if not gone:
            return original(folder)
        record = json.loads((folder / "manifest.json").read_text())
        if json.loads(cleanup.read_text())["manifest_check_before_removal"] != "PASS":
            raise ValueError("sealed manifest was not whole before the test copy was removed: " + str(folder))
        for relative, wanted in record["files"].items():
            if relative in gone:
                if gone[relative] != wanted or (folder / relative).exists():
                    raise ValueError("removed-entry record differs from the sealed manifest: " + relative)
                continue
            if file_sha256(folder / relative) != wanted:
                raise ValueError("retained evidence changed: " + relative)
        return record

    receipts.verify_manifest = verify
    try:
        return receipts.report(run)
    finally:
        receipts.verify_manifest = original


tag, budget, kind, items = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4:]
if budget > 300 or kind not in ("build", "prepare", "run", "clean", "report", "rows"):
    sys.exit("budget is at most 300; kind is build, prepare, run, report, rows or clean")
existing = sorted(RESULTS.glob("*-issue318-" + tag + "-build"))
prefix = existing[0].name[:-len("build")] if existing else datetime.date.today().isoformat() + "-issue318-" + tag + "-"
base = "benchmark-results/fs-bench-pro/" + prefix
sealed_build = ROOT / (base + "build") / "build.json"
SOCKET = ["--host", "unix://" + json.loads(sealed_build.read_text())["socket"]] if sealed_build.exists() else []
LOGS.mkdir(parents=True, exist_ok=True)
if kind == "clean":
    drop_test_copies()
    if items == ["originals"]:
        # A large original takes minutes to unlink, so its files go first, in pieces a call can stop
        # between; the volumes are removed by the call that removes the last of the folder.
        begun = time.time()
        for folder in folders(ROOT / ORIGINALS):
            # The claims that name an original's volumes sit in the files removed below, so the names are
            # kept beside the folder's own claim until the folder itself goes.
            kept_names = folder / "issue318-volumes.json"
            if not kept_names.exists():
                kept_names.write_text(json.dumps(sorted(original_volumes(folder))))
            for inner, _, names in os.walk(folder, topdown=False):
                if time.time() - begun > budget - 15:
                    say(clean_stopped_at=folder.name, why="budget; call again")
                    sys.exit(0)
                if Path(inner) == folder:
                    continue
                os.chmod(inner, 0o700)
                for name in names:
                    os.unlink(Path(inner) / name)
                os.rmdir(inner)
            drop_original(folder, "clean originals")
    sys.exit(0)
if kind == "rows":
    for family in items:
        for sample in folders(ROOT / (base + "run-" + slug(family))):
            say(case=sample.name, **receipt_row(sample))
    sys.exit(0)
if kind == "report":
    for family in items:
        result = tolerant_report(ROOT / (base + "run-" + slug(family)))
        say(report=family, cases=result["cases"], destination=str(Path(result["destination"]).relative_to(ROOT)))
    sys.exit(0)
if subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout.strip():
    sys.exit("refused: commit first; the harness identity needs a clean tree")
environment = {**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1",
               "LAYERFS_BENCH_INTERFERENCE": "issue 318 worktree; leftover daemon containers of earlier runs share the "
               "4 GB Docker VM and the host; timings diagnostic"}
started = time.time()
if kind == "build":
    if not sealed_build.exists():
        code, seconds = step(tag + "-build", ["build", "--out", base + "build"], 20)
        say(step="build", exit=code, seconds=seconds)
    sys.exit(0)
files = current_files()
drop_test_copies()
waiting = []
for item in items:
    family, case = item.split(":", 1)
    original = ROOT / ORIGINALS / case
    if waiting:
        waiting.append(item)
        continue
    if kind == "prepare":
        if original.exists() and stale(original, files):
            drop_original(original, stale(original, files))
        if original.exists():
            continue
        code, seconds = step(tag + "-prepare-" + case,
                             ["prepare", case, "--build", base + "build", "--out", ORIGINALS + "/" + case], PREPARE_FLOOR)
        if code is not None:
            tail = (LOGS / (tag + "-prepare-" + case + ".stderr")).read_text()[-160:] if code else ""
            say(prepare=case, exit=code, seconds=seconds, mb=round(tree_bytes(original) / 1e6, 1) if original.exists() else 0,
                **({"stderr_tail": tail} if code else {}))
    else:
        selection = [] if case == "all" else ["--case", case]
        target = CELLS if family == "cells" else family
        run_folder = ROOT / (base + "run-" + slug(family))
        sample = run_folder / case
        if case != "all" and sample.exists():
            say(run=case, skipped="already sampled for this tag")
            continue
        recipe = ("big64m" if case in ("C09", "C10", "C11") else "empty") if family == "cells" else case
        if case != "all" and (not (ROOT / ORIGINALS / recipe).exists() or stale(ROOT / ORIGINALS / recipe, files)):
            say(run=case, skipped="no current original; prepare first")
            continue
        code, seconds = step(tag + "-run-" + slug(family) + "-" + case,
                             ["run", target, *selection, "--build", base + "build", "--prepared", ORIGINALS,
                              "--out", base + "run-" + slug(family)], FLOOR)
        if code is not None:
            if case == "all":
                out = (LOGS / (tag + "-run-" + slug(family) + "-all.stdout")).read_text().splitlines()
                say(run=family, exit=code, seconds=seconds, lines=len(out),
                    statuses=sorted({json.loads(line).get("status") for line in out if line.startswith("{")}))
            else:
                cleaned = drop_test_copy(sample)
                tail = (LOGS / (tag + "-run-" + slug(family) + "-" + case + ".stderr")).read_text()[-200:] if code not in (0, 1) else ""
                say(run=case, exit=code, seconds=seconds, **receipt_row(sample), cleaned=cleaned,
                    **({"stderr_tail": tail} if tail else {}))
    if code is None:
        waiting.append(item)
if waiting:
    say(not_started=waiting)
