"""Run benchmark steps of one tag one at a time, inside a wall budget.

usage: tier_step.py <tag> <budget-seconds> <build | prepare | run | clean> [<family>:<case> ...]

Time (owner, 2026-10-11): no command runs longer than 2 minutes, 5 in an
extreme case. This driver starts the named steps in order and gives each the
time that is left of the budget; it starts no step with less than 20 s left
and prints the steps it did not start, so the next call continues there. It
samples nothing twice: a case that has a receipt for the tag is skipped.

Storage (owner, 2026-10-11): at most two copies of a case's payload exist.

- The original is the prepared folder of the case and its master volume. It
  is shared by every tag, lives under `issue316-originals/` and is never
  changed. It is replaced, never duplicated, when the product or harness
  source it was prepared from differs from the current one.
- The test copy is the sample's clone of the original: its volume, the
  containers on that volume and the closed Store the proof exports beside the
  receipt. `run` removes it as soon as the sample has ended, whatever the
  sample's status, and writes `payload-cleanup.json` beside the receipt.
  Receipts, logs and counts stay; the exported Store does not, so a later
  offline census of that sample is not possible.

`clean` removes the test copy of every sample of every tag that still has
one; `clean originals` also removes every original.
"""
import datetime
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
HARNESS = ROOT / "core/benchmark/fs-bench-pro"
BENCH = "core/benchmark/fs-bench-pro/bench.py"
LOCK = "core/target/r4-locked.pl"
RESULTS = ROOT / "benchmark-results/fs-bench-pro"
ORIGINALS = "benchmark-results/fs-bench-pro/issue316-originals"
RULE = "owner 2026-10-11: one original and one test copy of a payload; the test copy is removed after its sample"


def docker(*arguments):
    done = subprocess.run(["docker", *SOCKET, *arguments], capture_output=True, text=True)
    return done.returncode, done.stdout.strip(), done.stderr.strip()[-200:]


def folders(parent):
    return sorted(item for item in parent.glob("*") if item.is_dir())


def remove_tree(path):
    size, pending = 0, [path]
    while pending:
        folder = pending.pop()
        os.chmod(folder, 0o700)
        for entry in os.scandir(folder):
            if entry.is_dir(follow_symlinks=False):
                pending.append(Path(entry.path))
            elif entry.is_file(follow_symlinks=False):
                size += entry.stat(follow_symlinks=False).st_size
    shutil.rmtree(path)
    return size


def drop_test_copy(sample):
    """Remove one sample's clone volume, the containers on it and its exported Store."""
    record, claim = sample / "payload-cleanup.json", sample / "clone/resource-claim.json"
    if record.exists() or not sample.is_dir():
        return
    removed = {"rule": RULE, "volume": None, "containers": [], "bytes": {}}
    failures = []
    if claim.exists():
        volume = json.loads(claim.read_text())["volume"]
        code, listed, error = docker("ps", "--all", "--quiet", "--filter", "volume=" + volume)
        if code:
            failures.append("list: " + error)
        for container in listed.split():
            docker("stop", "--time", "2", container)
            code, _, error = docker("rm", container)
            (failures if code else removed["containers"]).append(container + (": " + error if code else ""))
        code, known, _ = docker("volume", "ls", "--quiet", "--filter", "name=" + volume)
        if not code and volume in known.split():
            code, _, error = docker("volume", "rm", volume)
            if code:
                failures.append("volume: " + error)
            else:
                removed["volume"] = volume
    exported = sample / "graph-store"
    if exported.exists():
        removed["bytes"]["graph-store"] = remove_tree(exported)
    if failures:
        print(json.dumps({"cleanup": sample.name, "failed": failures}), flush=True)
        return
    record.write_text(json.dumps(removed, indent=2) + "\n")
    print(json.dumps({"cleanup": sample.name, "volume": removed["volume"], "containers": len(removed["containers"]),
                      "bytes": removed["bytes"]}), flush=True)


def drop_test_copies():
    for run in RESULTS.glob("*-issue316-*-run-*"):
        for sample in folders(run):
            drop_test_copy(sample)


def master(folder):
    claim = folder / "resource-claim.json"
    return json.loads(claim.read_text()).get("volume") if claim.exists() else None


def drop_original(folder, why):
    volume = master(folder)
    size = remove_tree(folder)
    kept = [other for other in folders(ROOT / ORIGINALS) if master(other) == volume]
    code, error = 0, ""
    if volume and not kept:
        code, _, error = docker("volume", "rm", volume)
    print(json.dumps({"original_removed": folder.name, "why": why, "bytes": size,
                      "master_volume": "shared with another original" if kept else volume,
                      **({"volume_failure": error} if code else {})}), flush=True)


def current_files():
    sys.path.insert(0, str(HARNESS))
    from engine import identity
    return identity.source_identity()["files"]


def stale(folder, files):
    record = folder / "prepared.json"
    if not record.exists():
        return "incomplete"
    return None if json.loads(record.read_text())["identity"]["files"] == files else "prepared from other source"


def step(name, arguments):
    left = int(budget - (time.time() - started))
    if left < 20:
        return None
    done = subprocess.run(["perl", LOCK, str(left), "python3", "-B", BENCH, *arguments], cwd=ROOT,
                          env=environment, capture_output=True, text=True)
    (logs / (name + ".stdout")).write_text(done.stdout)
    (logs / (name + ".stderr")).write_text(done.stderr)
    print(json.dumps({"step": name, "exit": done.returncode, "seconds": round(time.time() - started),
                      "stderr_tail": done.stderr[-120:]}), flush=True)
    return done.returncode


tag, budget, kind, items = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4:]
if budget > 300 or kind not in ("build", "prepare", "run", "clean"):
    sys.exit("budget is at most 300; kind is build, prepare, run or clean")
existing = sorted(RESULTS.glob("*-issue316-" + tag + "-build"))
prefix = existing[0].name[:-len("build")] if existing else datetime.date.today().isoformat() + "-issue316-" + tag + "-"
base = "benchmark-results/fs-bench-pro/" + prefix
sealed = ROOT / (base + "build") / "build.json"
SOCKET = ["--host", "unix://" + json.loads(sealed.read_text())["socket"]] if sealed.exists() else []
if kind == "clean":
    drop_test_copies()
    if items == ["originals"]:
        for folder in folders(ROOT / ORIGINALS):
            drop_original(folder, "clean originals")
    sys.exit(0)
if subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout.strip():
    sys.exit("refused: commit first; the harness identity needs a clean tree")
logs = ROOT / "core/target/issue316"
logs.mkdir(parents=True, exist_ok=True)
environment = {**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1",
               "LAYERFS_BENCH_INTERFERENCE": "issue 316 worktree; other fs-bench-pro work may share the host and "
               "Docker VM; timings diagnostic"}
started = time.time()
if kind == "build":
    if not sealed.exists():
        step(tag + "-build", ["build", "--out", base + "build"])
    sys.exit(0)
files = current_files()
drop_test_copies()
if kind == "prepare":
    for folder in folders(ROOT / ORIGINALS):
        if stale(folder, files):
            drop_original(folder, stale(folder, files))
waiting = []
for item in items:
    family, case = item.split(":", 1)
    original = ROOT / ORIGINALS / case
    if waiting:
        waiting.append(item)
        continue
    if kind == "prepare":
        if original.exists():
            continue
        code = step(tag + "-prepare-" + case,
                    ["prepare", case, "--build", base + "build", "--out", ORIGINALS + "/" + case])
    else:
        sample = ROOT / (base + "run-" + family) / case
        if (sample / "receipt.json").exists():
            print(json.dumps({"step": "run-" + case, "skipped": "already sampled for this tag"}), flush=True)
            continue
        if not original.exists() or stale(original, files):
            print(json.dumps({"step": "run-" + case, "skipped": "no current original; prepare first"}), flush=True)
            continue
        code = step(tag + "-run-" + case,
                    ["run", family, "--case", case, "--build", base + "build", "--prepared", ORIGINALS,
                     "--out", base + "run-" + family])
        drop_test_copy(sample)
    if code is None:
        waiting.append(item)
print(json.dumps({"not_started": waiting}), flush=True)
