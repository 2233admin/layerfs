"""Independent native expectations and retained tree/index comparison.

The frozen cell tree and Git-index checkers are reused intact. This module is
also a container CLI; its output is outside the Workspace and every timer.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time


def helpers(directory=None):
    if directory is None:
        directory = Path(__file__).resolve().parents[2] / "cluster-two"
    else:
        directory = Path(directory).parent
    sys.path.insert(0, str(directory))
    from cells import git_index_oracle, git_queries, oracle, workloads
    return oracle, git_index_oracle, git_queries, workloads


def write_new(path, value):
    with Path(path).open("x") as stream:
        json.dump(value, stream, sort_keys=True, indent=2)
        stream.write("\n")


def file_sha(path):
    value = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for chunk in iter(lambda: stream.read(65536), b""):
            value.update(chunk)
    return value.hexdigest()


def snapshot(root, case, output, *, helper_directory=None, policy=None):
    tree, index, queries, workloads = helpers(helper_directory)
    root, output = Path(root).resolve(), Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    observed = tree.observe(root, case, output / "tree.jsonl")
    result = {"schema": "fs-bench-pro-independent-observation-v1", "case": case,
              "tree": observed, "tree_file": "tree.jsonl", "source_root": str(root),
              "scope": "complete declared tree, all payload bytes, kinds, names, mode, ownership and hard links",
              "omissions": "timing-cell cross-filesystem inode/mtime/ctime equality not claimed; original observations retained",
              "checker_sha256": file_sha(tree.__file__)}
    if case == "C12":
        if policy is None:
            raise ValueError("qualified version-pinned Git policy is required")
        qualified = json.loads(Path(policy).read_text())
        context = queries.collect(root, qualified, output / "git-queries",
                                  dict(workloads.ENV), deadline=time.monotonic() + 9.5, case=case)
        observed_index = index.observe(root, context["pin"])
        write_new(output / "index.json", observed_index)
        result.update(index_file="index.json", context=context,
                      index_sha256=file_sha(output / "index.json"),
                      omissions="original index stat-cache cross-filesystem fields excluded; complete semantic entries/TREE and checksum checked")
    write_new(output / "observation.json", result)
    return result


def prepare(root, case, output, *, helper_directory=None, policy=None):
    _, _, _, workloads = helpers(helper_directory)
    if case not in workloads.CF:
        raise ValueError("only the twelve prospectively selected cells are supported")
    body = workloads.COMMANDS[case]
    # Ordinary native execution independently constructs the expected state.
    # This is untimed oracle setup, never an N/P arm or reusable sample.
    subprocess.run(["/bin/bash", "-o", "pipefail", "-c", body], cwd=root,
                   env=workloads.ENV, check=True, timeout=120)
    return snapshot(root, case, output, helper_directory=helper_directory, policy=policy)


def compare_recorded(expected, actual, case, *, helper_directory=None):
    tree, index, queries, _ = helpers(helper_directory)
    expected, actual = Path(expected), Path(actual)
    want = json.loads((expected / "observation.json").read_text())
    got = json.loads((actual / "observation.json").read_text())
    for folder, record in ((expected, want), (actual, got)):
        if record["case"] != case or file_sha(folder / "tree.jsonl") != record["tree"]["manifest_sha256"]:
            raise ValueError("original tree observation case/hash differs")
    if case == "C12":
        left = json.loads((expected / "index.json").read_text())
        right = json.loads((actual / "index.json").read_text())
        if file_sha(expected / "index.json") != want["index_sha256"] or file_sha(actual / "index.json") != got["index_sha256"]:
            raise ValueError("retained Git index observation differs")
        queries.same_context(left["pin"], right["pin"])
        # Witness paths/hashes differ between independent containers. Their
        # semantic context was checked above; the original checker compares
        # one paired pin. Preserve each actual witness separately in its record.
        right = {**right, "pin": left["pin"], "pin_sha256": left["pin_sha256"]}
        result = index.compare_tree(expected / "tree.jsonl", actual / "tree.jsonl", case, left, right)
    else:
        result = tree.compare(expected / "tree.jsonl", actual / "tree.jsonl", case)
    return {"schema": "fs-bench-pro-independent-verification-v1", "case": case,
            "status": result["status"], "comparison": result,
            "scope": want["scope"], "omissions": want["omissions"],
            "expected_sha256": file_sha(expected / "observation.json"),
            "actual_sha256": file_sha(actual / "observation.json")}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("prepare", "snapshot", "verify", "compare"))
    parser.add_argument("--case", required=True)
    parser.add_argument("--root", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--expected", type=Path)
    parser.add_argument("--actual", type=Path)
    parser.add_argument("--helpers", type=Path)
    parser.add_argument("--policy", type=Path)
    args = parser.parse_args(argv)
    if args.operation == "prepare":
        result = prepare(args.root, args.case, args.output,
                         helper_directory=args.helpers, policy=args.policy)
    elif args.operation in ("snapshot", "verify"):
        result = snapshot(args.root, args.case, args.output,
                          helper_directory=args.helpers, policy=args.policy)
        if args.operation == "verify":
            result = compare_recorded(args.expected, args.output, args.case, helper_directory=args.helpers)
            write_new(args.output / "verification.json", result)
    else:
        result = compare_recorded(args.expected, args.actual, args.case, helper_directory=args.helpers)
    print(json.dumps(result, sort_keys=True))
    if result.get("status") == "FAIL":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
