"""A family's rows at a tag beside iteration 1's authoritative rows, as a Markdown table, and the differences.

usage: table.py <tag> <family> [--diff-only]
Iteration 1: the per-case disposition table of ITERATION-1-COMPLETION.md names each case's
authoritative source; its counts, storage and phase times are read from that source's committed CSV.
"""
import csv, json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3] if Path(__file__).resolve().parents[1].name == "target" \
    else Path(__file__).resolve().parents[5]
BASE = ROOT / "core/benchmark/fs-bench-pro/baselines/core"
DOC = ROOT / "core/docs/benchmark/fs-bench-pro/ITERATION-1-COMPLETION.md"


def control(family):
    rows = {}
    text = DOC.read_text().split("## Every original case: authoritative disposition")[1].split("\n## ")[0]
    for line in text.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 9 or cells[0] != family:
            continue
        source = cells[8].split("/")[0].strip()
        row = {"functional": cells[2], "proof": cells[3], "cleanup": cells[4], "source": cells[8]}
        for path in (BASE / source / family / "performance.csv", BASE / source / "performance.csv"):
            if path.exists():
                with path.open(newline="") as stream:
                    for record in csv.DictReader(stream):
                        if record["case"] == cells[1] and record["family"] == family:
                            row.update(record)
                break
        rows[cells[1]] = row
    return rows


def number(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def ms(value):
    value = number(value)
    return "-" if value is None else f"{value / 1e6:.1f}"


def pair(old, new):
    old, new = number(old), number(new)
    if old is None and new is None:
        return "-"
    if old == new:
        return str(new)
    return f"{'-' if old is None else old} -> {'-' if new is None else new}"


def main():
    tag, family = sys.argv[1], sys.argv[2]
    runs = sorted((ROOT / "benchmark-results/fs-bench-pro").glob("*-issue318-" + tag + "-run-" + family))
    old = control(family)
    cases = json.loads((ROOT / "core/benchmark/fs-bench-pro/families" / family / "family.json").read_text())["cases"]
    head = ["case", "status", "functional", "proof", "requests", "writer jobs", "statements", "overlay logical B",
            "exec ms", "Commit ms"]
    print("| " + " | ".join(head) + " |")
    print("|" + " --- |" * len(head))
    notes, differences = [], []
    for case in cases:
        name = case["id"]
        was = old.get(name, {})
        receipt = runs[0] / name / "receipt.json" if runs else None
        if receipt is None or not receipt.exists():
            folder = runs and (runs[0] / name).exists()
            now = {"status": "FAIL (no receipt)" if folder else "not sampled"}
        else:
            now = json.loads(receipt.read_text())
        phases, counts, seen = now.get("phases") or {}, now.get("counts") or {}, now.get("observations") or {}
        overlay = (seen.get("overlay_logical_bytes") or {}).get("value")
        change = lambda a, b: a if a == b else f"{a} -> {b}"
        line = [name, str(now.get("status")),
                change(was.get("functional", "?"), str(now.get("functional_status", "-"))),
                change(was.get("proof", "?"), str(now.get("proof_status", "-"))),
                pair(was.get("requests"), counts.get("requests")), pair(was.get("owner_jobs"), counts.get("owner_jobs")),
                pair(was.get("statements"), counts.get("statements")), pair(was.get("overlay_logical_bytes"), overlay),
                ms(was.get("command_ns")) + " -> " + ms(phases.get("command_ns")),
                ms(was.get("commit_ns")) + " -> " + ms(phases.get("commit_ns"))]
        print("| " + " | ".join(line) + " |")
        failure = now.get("original_failure") or now.get("tag")
        if failure:
            notes.append("- `" + name + "`: " + re.sub(r"; see /\S+", "", str(failure))[:300])
        for label, a, b in (("functional", was.get("functional"), now.get("functional_status")),
                            ("proof", was.get("proof"), now.get("proof_status")),
                            ("requests", number(was.get("requests")), counts.get("requests")),
                            ("writer jobs", number(was.get("owner_jobs")), counts.get("owner_jobs")),
                            ("statements", number(was.get("statements")), counts.get("statements")),
                            ("overlay logical B", number(was.get("overlay_logical_bytes")), overlay)):
            if a != b:
                differences.append((name, label, a, b))
    if notes:
        print("\nFailure texts, as recorded:\n\n" + "\n".join(notes))
    print("\nDIFFERENCES", len(differences))
    by = {}
    for name, label, a, b in differences:
        by.setdefault(label, []).append(f"{name}: {a} -> {b}")
    for label, items in by.items():
        print(f"  {label} ({len(items)}): " + "; ".join(items[:4]) + (" ..." if len(items) > 4 else ""))


main()
