"""Build, prepare and sample one benchmark tier once at the current clean identity.

usage: tier.py <tag> <t2|t3|t4> [build] [prepare] [run]     stages default to all three

One sample per case and tag: a case that already has a receipt for the tag is
not sampled again. Every step runs under the worktree lock with a wall stop.
Outputs are fresh folders under the ignored benchmark-results/fs-bench-pro/.
`bench.py run` exits 1 whenever a row is not PASS, which includes INELIGIBLE;
that is reported, not treated as a step failure. `bench.py report` is never run
here because it writes tracked baseline files.
"""
import datetime
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
BENCH = "core/benchmark/fs-bench-pro/bench.py"
LOCK = "core/target/r4-locked.pl"
T2 = [
    ("edit_length_changing", "insert-middle-4k-on-10mib-ops-1"),
    ("edit_length_changing", "insert-middle-4k-on-500mib-result-capped-v2-ops-1"),
    ("edit_length_changing", "prepend-head-4k-on-500mib-result-capped-v2-ops-1"),
    ("edit_length_changing", "delete-middle-4k-on-500mib-ops-1"),
    ("edit_length_preserving", "overwrite-middle-4k-on-500mib-ops-1"),
    ("edit_length_changing", "append-tail-4k-on-500mib-result-capped-v2-ops-1"),
    ("payload_create_read", "payload-create-500m"),
    ("workspace_change_locality", "workspace-dense-rewrite-100-mixed-v4"),
    ("tiny_file_churn", "tiny-bulk-create-100-mixed-v3"),
]
T3_FAMILIES = ["edit_length_changing", "edit_length_preserving", "edit_canonical_chunk_count",
               "edit_length_changing_capped"]
T4_FAMILIES = ["payload_create_read", "workspace_change_locality", "tiny_file_churn", "small_file_delta_smoke",
               "file_size_transition", "git_tool_workflow", "dedup_branch_history", "mixed_load_bearing"]
# Cases issue 317 records at the unchanged 120 s outer stop or with failed preparation.
T4_SKIP = ("-500", "v016-mixed-exhaustive-")


def registered():
    listing = subprocess.run(["python3", "-B", BENCH, "list"], cwd=ROOT, capture_output=True, text=True, check=True)
    rows = [line.split("\t") for line in listing.stdout.splitlines()[1:] if "\t" in line]
    return [(row[0], row[1], row[2]) for row in rows]


def selection(tier):
    if tier == "t2":
        return T2
    families = T3_FAMILIES if tier == "t3" else T4_FAMILIES
    chosen = []
    for family, case, status in registered():
        if family not in families or status != "ported":
            continue
        if tier == "t4" and family in ("dedup_branch_history", "mixed_load_bearing") and \
                any(mark in case for mark in T4_SKIP):
            continue
        chosen.append((family, case))
    return chosen


def step(logs, name, limit, arguments, environment):
    done = subprocess.run(["perl", LOCK, str(limit), "python3", "-B", BENCH, *arguments], cwd=ROOT,
                          env=environment, capture_output=True, text=True)
    (logs / (name + ".stdout")).write_text(done.stdout)
    (logs / (name + ".stderr")).write_text(done.stderr)
    print(json.dumps({"step": name, "exit": done.returncode, "stderr_tail": done.stderr[-300:]}), flush=True)
    return done.returncode


def main():
    tag, tier = sys.argv[1], sys.argv[2]
    stages = sys.argv[3:] or ["build", "prepare", "run"]
    if tier not in ("t2", "t3", "t4"):
        sys.exit("tier must be t2, t3 or t4")
    dirty = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
    if dirty.strip():
        sys.exit("refused: commit first; the harness identity needs a clean tree")
    date = datetime.date.today().isoformat()
    results = ROOT / "benchmark-results/fs-bench-pro"
    existing = sorted(results.glob("*-issue316-" + tag + "-build"))
    prefix = existing[0].name[:-len("build")] if existing else date + "-issue316-" + tag + "-"
    base = "benchmark-results/fs-bench-pro/" + prefix
    logs = ROOT / "core/target/issue316"
    logs.mkdir(parents=True, exist_ok=True)
    environment = {**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1",
                   "LAYERFS_BENCH_INTERFERENCE": "issue 316 worktree; other fs-bench-pro work may share the host and "
                   "Docker VM; timings diagnostic"}
    cases = selection(tier)
    if "build" in stages and not (ROOT / (base + "build")).exists():
        if step(logs, tag + "-build", 600, ["build", "--out", base + "build"], environment):
            sys.exit(1)
    if "prepare" in stages:
        for _, case in cases:
            if (ROOT / (base + "prepared") / case).exists():
                continue
            step(logs, tag + "-prepare-" + case, 600,
                 ["prepare", case, "--build", base + "build", "--out", base + "prepared/" + case], environment)
    if "run" in stages:
        for family, case in cases:
            if (ROOT / (base + "run-" + family) / case / "receipt.json").exists():
                print(json.dumps({"step": "run-" + case, "skipped": "already sampled for this tag"}), flush=True)
                continue
            if not (ROOT / (base + "prepared") / case).exists():
                print(json.dumps({"step": "run-" + case, "skipped": "not prepared"}), flush=True)
                continue
            step(logs, tag + "-run-" + case, 400,
                 ["run", family, "--case", case, "--build", base + "build", "--prepared", base + "prepared",
                  "--out", base + "run-" + family], environment)


main()
