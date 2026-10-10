#!/usr/bin/env python3
"""Single entry point for the fs-bench-pro workload rollout."""
import argparse
import json
from pathlib import Path
import uuid

HERE = Path(__file__).resolve().parent


def catalogue():
    rows = []
    for path in sorted((HERE / "families").glob("*/family.json")):
        family = json.loads(path.read_text())
        if family["family"] != path.parent.name:
            raise ValueError("family path/name mismatch: " + str(path))
        for case in family["cases"]:
            rows.append({"family": family["family"], **case})
    if len({(row["family"], row["id"]) for row in rows}) != len(rows):
        raise ValueError("duplicate family/case identity")
    return rows


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    listing = commands.add_parser("list", help="every frozen family and case")
    listing.add_argument("--json", action="store_true")
    building = commands.add_parser("build", help="locked release runtime and pinned-image daemon")
    building.add_argument("--out", type=Path)
    args = parser.parse_args(argv)
    if args.command == "build":
        from engine import identity
        results = identity.ROOT / "benchmark-results/fs-bench-pro"
        output = args.out or results / ("build-" + uuid.uuid4().hex)
        output = output.resolve()
        if not output.is_relative_to(results.resolve()):
            parser.error("build output must be a fresh directory under benchmark-results/fs-bench-pro")
        result = identity.build(output)
        print(json.dumps({"build": str(output), "status": result["status"],
                          "binaries": result["binaries"]}, indent=2))
        return
    rows = catalogue()
    if args.json:
        print(json.dumps(rows, indent=2))
    else:
        print("family\tcase\tstatus\tv016_case\treference")
        for row in rows:
            reference = row.get("reference") or {}
            print("\t".join((row["family"], row["id"], row["status"], row["v016_case"],
                             reference.get("release", "UNAVAILABLE"))))
        print(f"families={len({row['family'] for row in rows})} cases={len(rows)}")


if __name__ == "__main__":
    main()
