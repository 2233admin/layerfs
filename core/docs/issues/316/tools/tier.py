"""Print the cases of one benchmark tier, one `<family>:<case>` a line.

usage: tier.py <t2|t3|t4>

This file only selects. `tier_step.py` builds, prepares and samples the cases
it is given, one bounded step at a time, and owns the storage rule (one
original and one test copy of a payload). Until 2026-10-11 this file also ran
a whole tier in one process with a prepared set of its own for every tag;
that route is removed: it ran for 12 to 40 minutes and kept every copy.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
BENCH = "core/benchmark/fs-bench-pro/bench.py"
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


if len(sys.argv) != 2 or sys.argv[1] not in ("t2", "t3", "t4"):
    sys.exit("usage: tier.py <t2|t3|t4>")
for family, case in selection(sys.argv[1]):
    print(family + ":" + case)
