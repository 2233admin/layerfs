"""Run benchmark steps of one tag one at a time, inside a wall budget.

usage: tier_step.py <tag> <budget-seconds> <build | prepare | run> [<family>:<case> ...]

The owner's limit (2026-10-11): no command runs longer than 2 minutes, 5 in
an extreme case. This driver starts the named steps in order and gives each
the time that is left of the budget; it starts no step with less than 20 s
left and prints the steps it did not start, so the next call continues there.
It samples nothing twice: a case that has a receipt for the tag is skipped.
Arguments, environment and output folders are those of tier.py.
"""
import datetime
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
BENCH = "core/benchmark/fs-bench-pro/bench.py"
LOCK = "core/target/r4-locked.pl"
tag, budget, kind, items = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4:]
if budget > 300 or kind not in ("build", "prepare", "run"):
    sys.exit("budget is at most 300; kind is build, prepare or run")
if subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout.strip():
    sys.exit("refused: commit first; the harness identity needs a clean tree")
results = ROOT / "benchmark-results/fs-bench-pro"
existing = sorted(results.glob("*-issue316-" + tag + "-build"))
prefix = existing[0].name[:-len("build")] if existing else datetime.date.today().isoformat() + "-issue316-" + tag + "-"
base = "benchmark-results/fs-bench-pro/" + prefix
logs = ROOT / "core/target/issue316"
logs.mkdir(parents=True, exist_ok=True)
environment = {**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1",
               "LAYERFS_BENCH_INTERFERENCE": "issue 316 worktree; other fs-bench-pro work may share the host and "
               "Docker VM; timings diagnostic"}
started = time.time()


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


if kind == "build":
    if not (ROOT / (base + "build")).exists():
        step(tag + "-build", ["build", "--out", base + "build"])
    sys.exit(0)
waiting = []
for item in items:
    family, case = item.split(":", 1)
    if waiting:
        waiting.append(item)
        continue
    if kind == "prepare":
        if (ROOT / (base + "prepared") / case).exists():
            continue
        code = step(tag + "-prepare-" + case,
                    ["prepare", case, "--build", base + "build", "--out", base + "prepared/" + case])
    else:
        if (ROOT / (base + "run-" + family) / case / "receipt.json").exists():
            print(json.dumps({"step": "run-" + case, "skipped": "already sampled for this tag"}), flush=True)
            continue
        if not (ROOT / (base + "prepared") / case).exists():
            print(json.dumps({"step": "run-" + case, "skipped": "not prepared"}), flush=True)
            continue
        code = step(tag + "-run-" + case,
                    ["run", family, "--case", case, "--build", base + "build", "--prepared", base + "prepared",
                     "--out", base + "run-" + family])
    if code is None:
        waiting.append(item)
print(json.dumps({"not_started": waiting}), flush=True)
