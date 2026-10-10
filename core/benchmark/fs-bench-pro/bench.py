#!/usr/bin/env python3
"""Single entry point for the fs-bench-pro workload rollout."""
import argparse
from datetime import datetime
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
    preparing = commands.add_parser("prepare", help="build a sealed fixture master from a committed recipe")
    preparing.add_argument("fixture", choices=("empty", "big64m"))
    preparing.add_argument("--build", type=Path, required=True)
    preparing.add_argument("--out", type=Path)
    running = commands.add_parser("run", help="one sample per selected case at this clean identity")
    running.add_argument("family")
    running.add_argument("--case")
    running.add_argument("--build", type=Path, required=True)
    running.add_argument("--prepared", type=Path, required=True)
    running.add_argument("--out", type=Path, required=True)
    verifying = commands.add_parser("verify", help="verify retained observations without replaying a sample")
    verifying.add_argument("run", type=Path)
    reporting = commands.add_parser("report", help="generate the two CSVs and report-template table")
    reporting.add_argument("run", type=Path)
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
    if args.command == "run":
        from engine import fixtures, identity, receipts, workspace
        current = identity.source_identity()
        if args.family != "cluster-two/cells":
            parser.error("family workload runner is not implemented yet; all workload cases remain visible in list")
        registered = [{"id": cell, "cache_class": "B", "v016_case": ""} for cell in fixtures.CELL_RECIPES]
        if args.case and args.case not in fixtures.CELL_RECIPES:
            parser.error("case is not in the frozen twelve-cell selection")
        output = args.out.resolve()
        results = identity.ROOT / "benchmark-results/fs-bench-pro"
        if not output.is_relative_to(results.resolve()):
            parser.error("run output must be under benchmark-results/fs-bench-pro")
        output.mkdir(parents=True, exist_ok=True)
        selection_file = output / "run.json"
        if selection_file.exists():
            selection = json.loads(selection_file.read_text())
            if (selection["family"], selection["source_commit"], selection["product_tree"], selection["cases"]) != (
                    args.family, current["source_commit"], current["product_tree"], registered):
                parser.error("run registration differs; append-only run cannot change identity")
        else:
            receipts.write_new(selection_file, {"family": args.family, "cases": registered,
                "source_commit": current["source_commit"], "source_tree": current["source_tree"],
                "product_tree": current["product_tree"], "image": identity.IMAGE,
                "date": datetime.now().strftime("%Y-%m-%d"), "identity": current,
                "build": str(args.build.resolve()), "prepared": str(args.prepared.resolve())})
        selected = [args.case] if args.case else list(fixtures.CELL_RECIPES)
        failed = False
        for cell in selected:
            recipe = fixtures.CELL_RECIPES[cell]
            prepared = args.prepared if (args.prepared / "prepared.json").exists() else args.prepared / recipe
            result = workspace.one_cell(cell, prepared, args.build, output / cell)
            print(json.dumps({key: result.get(key) for key in ("case", "status", "counts", "cleanup", "container", "original_failure", "evidence")}))
            failed |= result["status"] != "PASS"
        return 1 if failed else 0
    if args.command == "verify":
        from engine import oracle, receipts
        selection, recorded = receipts.load_run(args.run)
        results = []
        for case in selection["cases"]:
            folder = args.run / case["id"]
            if (folder / "actual/observation.json").exists() and (folder / "expected/observation.json").exists():
                result = oracle.compare_recorded(folder / "expected", folder / "actual", case["id"])
            else:
                result = {"case": case["id"], "status": "NOT_RUN", "reason": "complete retained oracle evidence unavailable"}
            results.append(result)
        print(json.dumps(results, indent=2))
        return 1 if any(row["status"] != "PASS" for row in results) else 0
    if args.command == "report":
        from engine import receipts
        result = receipts.report(args.run)
        print(result["table"])
        print("CSV destination: " + result["destination"])
        return
    if args.command == "prepare":
        from engine import fixtures, identity
        results = identity.ROOT / "benchmark-results/fs-bench-pro"
        output = args.out or results / ("prepared-" + args.fixture + "-" + uuid.uuid4().hex)
        output = output.resolve()
        if not output.is_relative_to(results.resolve()):
            parser.error("fixture output must be a fresh directory under benchmark-results/fs-bench-pro")
        result = fixtures.prepare(args.fixture, output, args.build)
        print(json.dumps({"prepared": str(output), "status": result["status"],
                          "master_volume": result["master_volume"], "fixture": result["fixture"]}, indent=2))
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
    raise SystemExit(main())
