"""Issue 320: one labelled mounted diagnostic of short Workspaces on a growing branch.

usage: branch_session.py <build-folder> <prepared-original-folder> <out-folder> <sessions> <commits> [<budget-seconds> [<observe-every>]]

The usage this measures: a Workspace is mounted on a branch, runs <commits>
steps (one ordinary command, then one Commit), and is unmounted for good. The
next Workspace is mounted on the same branch, which is now <commits> Commits
longer. <sessions> Workspaces run one after another in one daemon, so session
N starts on a branch that already holds (N-1) x <commits> Commits.

It uses the product the way a sample does: an independent byte copy of the
prepared original's sealed Store, the sealed runtime and daemon of the build,
the pinned image, and the runtime's own protocol (mount, command, commit,
unmount, cleanup, observe, stop). Commands are launched through
`WorkspaceApi::exec`.

Each step changes eight paths spread over the tree: three appends and two
in-place first-byte overwrites of existing files, two new files, and one
removal of a file an earlier step created. The paths come from the prepared
source manifest by a fixed stride, so no two neighbouring steps touch the same
directory set.

Not a harness case and not a sample: no oracle, no proof, exit codes and
Commit kinds only. Times are single observations on a shared machine and are
not eligible for a performance claim. It removes the container and the volume
it created, and nothing else.
"""
import fcntl
import json
import secrets
import statistics
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(ROOT / "core/benchmark/fs-bench-pro"))
sys.path.insert(0, str(ROOT / "core/benchmark/cluster-two"))
from engine import fixtures  # noqa: E402
from cells import runner as cell_runner, workloads  # noqa: E402

STRIDE = 997
CREATED_LIFETIME = 20


def body(files, directories, step):
    """Eight path changes of one step; `step` counts from 1 over the whole run."""
    picked = [files[(step * 5 + index * STRIDE) % len(files)] for index in range(5)]
    home = directories[(step * 7) % len(directories)]
    other = directories[(step * 7 + 11) % len(directories)]
    lines = ["set -eu"]
    lines += [f"printf 'issue320 step {step} line {index}\\n' >> {path}" for index, path in enumerate(picked[:3])]
    lines += [f"printf '%s' {step % 10} | dd of={path} bs=1 seek=0 conv=notrunc status=none" for path in picked[3:]]
    lines += [f"printf 'issue320 new file of step {step}\\n' > {home}/i320-{step}-a.txt",
              f"printf 'issue320 second new file of step {step}\\n' > {other}/i320-{step}-b.txt"]
    if step > CREATED_LIFETIME:
        old = step - CREATED_LIFETIME
        lines.append(f"rm {directories[(old * 7) % len(directories)]}/i320-{old}-a.txt")
    return "\n".join(lines) + "\n"


def milliseconds(values):
    return [round(value / 1e6, 3) for value in values]


def summary(values):
    ordered = sorted(values)
    return {"count": len(values), "sum_ms": round(sum(values) / 1e6, 1), "first_ms": round(values[0] / 1e6, 2),
            "median_ms": round(statistics.median(values) / 1e6, 2),
            "mean_rest_ms": round(sum(values[1:]) / max(1, len(values) - 1) / 1e6, 2),
            "p95_ms": round(ordered[min(len(ordered) - 1, int(len(ordered) * 0.95))] / 1e6, 2),
            "max_ms": round(ordered[-1] / 1e6, 2)}


def main():
    build_folder, original, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    sessions, commits = int(sys.argv[4]), int(sys.argv[5])
    budget = float(sys.argv[6]) if len(sys.argv) > 6 else 100.0
    observe_every = int(sys.argv[7]) if len(sys.argv) > 7 else 1
    started = time.monotonic()
    lock = (ROOT / "core/target/issue320/measurement.lock").open("a")
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    build = json.loads((build_folder / "build.json").read_text())
    prepared = json.loads((original / "prepared.json").read_text())
    docker = ["docker", "--host", "unix://" + build["socket"]]
    rows = [row for row in (line.split("\t") for line in (original / "source.manifest.tsv").read_text().splitlines())
            if len(row) > 1]
    files = [row[0] for row in rows if row[1] == "file"]
    directories = [row[0] for row in rows if row[1] == "directory" and row[0] != "."]
    out.mkdir(parents=True, exist_ok=False)
    bodies = out / "bodies"
    bodies.mkdir()
    others = subprocess.run([*docker, "ps", "--format", "{{.Names}}"], capture_output=True, text=True).stdout.split()
    result = {"label": "issue 320 branch session diagnostic; one-off; not a harness case; no oracle or proof; "
                       "exit codes and Commit kinds only; shared machine; times not eligible for a claim",
              "case_tree": prepared["case"], "build": build_folder.name, "source_commit": build["identity"].get("commit"),
              "requested": {"sessions": sessions, "commits_per_session": commits, "budget_seconds": budget},
              "step": "3 appends, 2 first-byte overwrites, 2 new files, 1 removal; stride " + str(STRIDE),
              "interference": {"other_containers_at_start": others}, "sessions": []}
    clone = fixtures.clone(prepared, out / "clone", build)
    environment = out / "environment.txt"
    environment.write_text("".join(name + "=" + value + "\n" for name, value in workloads.ENV.items()))
    argv = [build["binaries"]["runtime"]["path"], "serve", "--socket", build["socket"],
            "--volume", clone["volume"], "--daemon", build["binaries"]["daemon"]["path"],
            "--manifest", prepared["provision"]["manifest"], "--receipt", str(out / "runtime.events.jsonl"),
            "--uid", str(prepared["source_uid"]), "--gid", str(prepared["source_gid"]),
            "--environment-file", str(environment), "--observation-scope", secrets.token_hex(32)]
    runtime = cell_runner.EventProcess(argv, out, "runtime")
    step = 0
    try:
        runtime.event("protocol_ready", time.monotonic() + 15)
        setup = next(row for row in runtime.rows if row["event"] == "daemon_setup")
        result["daemon_setup_ms"] = round(setup["span"]["duration_ns"] / 1e6, 1)
        for session in range(1, sessions + 1):
            if time.monotonic() - started > budget:
                result["stopped_early"] = f"budget reached before session {session}"
                break
            key = secrets.token_hex(32)
            mount = runtime.send("mount", key, deadline=time.monotonic() + 15)
            commands, saves, kinds = [], [], []
            for _ in range(commits):
                step += 1
                path = bodies / f"step-{step}.sh"
                path.write_text(body(files, directories, step))
                command = runtime.send("command", key, path, deadline=time.monotonic() + 30)
                commit = runtime.send("commit", key, deadline=time.monotonic() + 30)
                commands.append(command["span"]["duration_ns"])
                saves.append(commit["span"]["duration_ns"])
                kinds.append(commit["fields"].get("commit_kind"))
            unmount = runtime.send("unmount", key, deadline=time.monotonic() + 15)
            waited = time.monotonic_ns()
            while runtime.send("cleanup", key, deadline=time.monotonic() + 10)["fields"]["state"] != "Gone":
                pass
            cleanup_ns = time.monotonic_ns() - waited
            observed = {}
            if session % observe_every == 0:
                runtime.send("observe", deadline=time.monotonic() + 15)
                cell_runner.snapshot_observations(runtime, observed)
            result["sessions"].append({
                "session": session, "branch_commits_before": step - commits, "branch_commits_after": step,
                "mount_ms": round(mount["span"]["duration_ns"] / 1e6, 2),
                "unmount_ms": round(unmount["span"]["duration_ns"] / 1e6, 2), "cleanup_wait_ms": round(cleanup_ns / 1e6, 2),
                "commit_kinds": sorted(set(kinds)), "command": summary(commands), "commit": summary(saves),
                "commit_ms": milliseconds(saves), "command_ms": milliseconds(commands),
                **{name: value["value"] for name, value in observed.items()}})
        runtime.send("stop", deadline=time.monotonic() + 15)
        runtime.event("finished", time.monotonic() + 15)
        result["runtime_exit"] = runtime.process.wait(timeout=5)
    except BaseException as failure:  # the partial result and the cause are both kept
        result["failure"] = f"{type(failure).__name__}: {failure}"
        runtime.process.kill()
    finally:
        if runtime.container:
            logs = subprocess.run([*docker, "logs", "--timestamps=false", runtime.container], capture_output=True)
            (out / "daemon.stdout").write_bytes(logs.stdout)
            (out / "daemon.stderr").write_bytes(logs.stderr)
            subprocess.run([*docker, "rm", "--force", runtime.container], capture_output=True)
        removed = subprocess.run([*docker, "volume", "rm", clone["volume"]], capture_output=True)
        result["cleanup"] = "container and volume removed" if removed.returncode == 0 else "volume removal failed"
        result["interference"]["other_containers_at_end"] = subprocess.run(
            [*docker, "ps", "--format", "{{.Names}}"], capture_output=True, text=True).stdout.split()
        result["wall_seconds"] = round(time.monotonic() - started, 1)
        (out / "result.json").write_text(json.dumps(result, indent=1) + "\n")
    if len(result["sessions"]) > 40:
        print(json.dumps({key: value for key, value in result.items() if key != "sessions"}))
        return
    print("session branch_before mount_ms commit_first commit_median commit_mean_rest commit_p95 commit_sum command_median store_bytes")
    for row in result["sessions"]:
        print(row["session"], row["branch_commits_before"], row["mount_ms"], row["commit"]["first_ms"],
              row["commit"]["median_ms"], row["commit"]["mean_rest_ms"], row["commit"]["p95_ms"], row["commit"]["sum_ms"],
              row["command"]["median_ms"], row.get("store_logical_bytes"))
    print(json.dumps({key: value for key, value in result.items() if key != "sessions"}))


if __name__ == "__main__":
    main()
