"""Phase summary: per family, this tag's outcomes beside iteration 1's.  usage: summary.py <tag>"""
import collections, json, re, subprocess, sys
from pathlib import Path
HOME = Path(__file__).resolve().parent
ROOT = HOME.parents[2]
tag = sys.argv[1]
text = (ROOT / "core/docs/benchmark/fs-bench-pro/ITERATION-1-COMPLETION.md").read_text()
control = collections.defaultdict(dict)
for line in text.splitlines():
    m = re.match(r"\| (\w+) \| (\S+) \| ([A-Z_]+) \| ([A-Z_]+) \|", line)
    if m and (ROOT / "core/benchmark/fs-bench-pro/families" / m.group(1)).is_dir():
        control[m.group(1)][m.group(2)] = (m.group(3), m.group(4))
families = [json.loads(line) for line in (HOME / "family-order.json").read_text().splitlines()] if (HOME / "family-order.json").exists() else None
order = sys.argv[2:] or sorted(control)
total = collections.Counter(); totalc = collections.Counter()
print("| family | cases | this run | iteration 1 | rows whose outcome differs |")
print("| --- | --- | --- | --- | --- |")
for family in order:
    cases = [c["id"] for c in json.loads((ROOT / "core/benchmark/fs-bench-pro/families" / family / "family.json").read_text())["cases"]]
    out = subprocess.run(["python3", "-B", str(HOME / "step.py"), tag, "5", "rows", family], capture_output=True, text=True).stdout
    rows = {}
    for line in out.splitlines():
        r = json.loads(line); rows[r["case"]] = r
    mine = collections.Counter(); theirs = collections.Counter(); differ = []
    for case in cases:
        r = rows.get(case)
        if r is None:
            label = "no row"
        elif r.get("receipt") == "none" or r.get("status") is None:
            label = "no receipt"
        elif r.get("functional") == "PASS" and r.get("proof") == "PASS":
            label = "completed, checks PASS"
        else:
            label = "FAIL"
        c = control[family].get(case, ("?", "?"))
        clabel = "completed, checks PASS" if c == ("PASS", "PASS") else c[0] if c[0] in ("NOT_RUN", "NOT_APPLICABLE") else "FAIL"
        mine[label] += 1; theirs[clabel] += 1; total[label] += 1; totalc[clabel] += 1
        if label != clabel:
            differ.append("`%s` %s -> %s" % (case, clabel, label))
    fmt = lambda c: ", ".join("%d %s" % (n, k) for k, n in sorted(c.items()))
    print("| %s | %d | %s | %s | %s |" % (family, len(cases), fmt(mine), fmt(theirs), str(len(differ)) if len(differ) > 3 else "; ".join(differ) or "none"))
print("| **all** | %d | %s | %s | |" % (sum(total.values()), fmt(total), fmt(totalc)))
