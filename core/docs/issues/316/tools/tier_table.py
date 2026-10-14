"""Print one row per sampled case of each tag from its receipts.

usage: tier_table.py [--md] <tag> [<tag> ...]

Columns: status, proof, exec (command) and Commit in ms, requests, writer jobs,
statements, overlay logical MB, source commit. `--md` prints a Markdown table
with no local paths, for an issue comment. One row per receipt; nothing is
averaged. A failed sample is printed as failed with its original failure text.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5] / "benchmark-results/fs-bench-pro"


def cells(row):
    phases = row.get("phases") or {}
    counts = row.get("counts") or {}
    observed = row.get("observations") or {}

    def ms(key):
        value = phases.get(key)
        return f"{value / 1e6:.1f}" if isinstance(value, int) else "-"

    overlay = (observed.get("overlay_logical_bytes") or {}).get("value")
    megabytes = f"{overlay / 1e6:.1f}" if isinstance(overlay, int) else "-"
    return [row["case"], str(row.get("status")), str(row.get("proof_status")), ms("command_ns"), ms("commit_ns"),
            str(counts.get("requests")), str(counts.get("owner_jobs")), str(counts.get("statements")), megabytes,
            str(row.get("source_commit", ""))[:9]]


def main():
    arguments = sys.argv[1:]
    markdown = "--md" in arguments
    head = ["case", "status", "proof", "exec ms", "Commit ms", "requests", "writer jobs", "statements",
            "overlay MB", "commit"]
    for tag in [value for value in arguments if value != "--md"]:
        receipts = sorted(ROOT.glob("*-issue316-" + tag + "-run-*/*/receipt.json"))
        print(("### " if markdown else "TAG ") + tag)
        if markdown:
            print("| " + " | ".join(head) + " |")
            print("|" + " --- |" * len(head))
        for receipt in receipts:
            row = json.loads(receipt.read_text())
            line = cells(row)
            print("| " + " | ".join(line) + " |" if markdown else "  " + "  ".join(line))
            failure = row.get("original_failure")
            if failure:
                text = str(failure).split("; see ")[0][:160]
                print(("" if markdown else "    ") + "failure, " + row["case"] + ": " + text)
        if not receipts:
            print("no receipts")


main()
