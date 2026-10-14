"""Issue 320: one labelled mounted diagnostic of write-heavy commands in several Workspaces at once.

usage: exec_concurrency.py <build-folder> <prepared-original-folder> <out-folder> [<files-per-writer> [<budget-seconds> [<cpus>]]]

The usage this measures: several Workspaces of one daemon each run a command
that mutates many files, and nothing commits in step with them. Four writer
Workspaces and one idle marker Workspace are mounted in one daemon. Phases run
one after another: 1, 2, 3 and 4 writers at once, then 3 writers while the
fourth Workspace commits the files its own phase left.

A writer is one ordinary process started in the daemon's container with the
Workspace directory as its working directory. It is not launched through
`WorkspaceApi::exec`: the launch is outside what is timed, and the body times
itself with the shell's clock. Each body makes one directory, creates
<files-per-writer> small files, appends one line to every one of them, and
reads the first line of every one, using shell builtins only (no process per
file). The same body runs once on the container's own filesystem first.

An UpToDate Commit of the marker Workspace before and after every phase
carries the daemon's cumulative owner counters, so each phase has the owner
jobs, queue wait and service time by class that fall inside it. The marker's
own Commits are inside those differences (a handful of jobs).

With <cpus>, the CPU limit of the container this run started is changed to
that number before the first phase, to tell waiting for a processor from
waiting for the one overlay connection. Without it the runtime's own container
profile applies. The limit used is recorded.

Set ISSUE320_EXEC_PHASES to comma-separated phase labels (for example w1,w4)
to select a subset before any clone or runtime effect. The default runs all
five phases above.

Not a harness case and not a sample: no oracle, no proof, exit codes only.
Times are single observations on a shared machine and are not eligible for a
performance claim. It removes the container and the volume it created, and
nothing else.

Point daemon RSS/anonymous memory, cgroup memory/CPU and every SQLite file's
logical/allocated bytes are retained outside each self-timed command body.
The cgroup lifetime peak is never relabelled as a phase-local peak.
"""
import fcntl
import json
import os
import secrets
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(ROOT / "core/benchmark/fs-bench-pro"))
sys.path.insert(0, str(ROOT / "core/benchmark/cluster-two"))
from engine import fixtures  # noqa: E402
from cells import counts, runner as cell_runner, workloads  # noqa: E402

STAGES = ("create", "append", "read")


def body(label, files):
    loop = "i=0; while [ $i -lt " + str(files) + " ]; do {}; i=$((i+1)); done"
    return "\n".join([
        "set -eu", f"d=x320-{label}", "mkdir $d", "t0=$EPOCHREALTIME",
        loop.format("printf 'line %d\\n' $i > $d/f$i"), "t1=$EPOCHREALTIME",
        loop.format("printf 'more %d\\n' $i >> $d/f$i"), "t2=$EPOCHREALTIME",
        loop.format("read -r line < $d/f$i"), "t3=$EPOCHREALTIME",
        'echo "$t0 $t1 $t2 $t3"']) + "\n"


def main():
    build_folder, original, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    files = int(sys.argv[4]) if len(sys.argv) > 4 else 2000
    budget = float(sys.argv[5]) if len(sys.argv) > 5 else 90.0
    cpus = sys.argv[6] if len(sys.argv) > 6 else None
    plans = [("w1", 1, False), ("w2", 2, False), ("w3", 3, False), ("w4", 4, False), ("w3-commit", 3, True)]
    selection = os.environ.get("ISSUE320_EXEC_PHASES")
    if selection is not None:
        labels = selection.split(",")
        if len(set(labels)) != len(labels) or not labels or any(label not in {plan[0] for plan in plans} for label in labels):
            raise ValueError("explicit unique exec phase labels required")
        if "w3-commit" in labels and ("w4" not in labels or labels.index("w4") > labels.index("w3-commit")):
            raise ValueError("w3-commit requires preceding w4 output")
        by_label = {plan[0]: plan for plan in plans}
        plans = [by_label[label] for label in labels]
    started = time.monotonic()
    lock = (ROOT / "core/target/issue320/measurement.lock").open("a")
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    build = json.loads((build_folder / "build.json").read_text())
    prepared = json.loads((original / "prepared.json").read_text())
    docker = ["docker", "--host", "unix://" + build["socket"]]
    out.mkdir(parents=True, exist_ok=False)
    others = subprocess.run([*docker, "ps", "--format", "{{.Names}}"], capture_output=True, text=True).stdout.split()
    result = {"label": "issue 320 concurrent exec diagnostic; one-off; not a harness case; no oracle or proof; "
                       "exit codes only; shared machine; times not eligible for a claim",
              "case_tree": prepared.get("case"), "recipe": prepared["recipe"], "build": build_folder.name, "source_commit": build["identity"]["source_commit"],
              "source_tree": build["identity"]["source_tree"],
              "sqlite_compile_flags": build.get("explicit_sqlite_flags"),
              "resident_observations": [],
              "selected_phases": [plan[0] for plan in plans],
              "files_per_writer": files, "writer": "create, append, read of every file; shell builtins; self-timed",
              "interference": {"other_containers_at_start": others}, "phases": []}
    clone = fixtures.clone(prepared, out / "clone", build)
    environment = out / "environment.txt"
    environment.write_text("".join(name + "=" + value + "\n" for name, value in workloads.ENV.items()))
    argv = [build["binaries"]["runtime"]["path"], "serve", "--socket", build["socket"],
            "--volume", clone["volume"], "--daemon", build["binaries"]["daemon"]["path"],
            "--manifest", prepared["provision"]["manifest"], "--receipt", str(out / "runtime.events.jsonl"),
            "--uid", str(prepared["source_uid"]), "--gid", str(prepared["source_gid"]),
            "--environment-file", str(environment), "--observation-scope", secrets.token_hex(32)]
    runtime = cell_runner.EventProcess(argv, out, "runtime")
    snapshots = 0
    try:
        runtime.event("protocol_ready", time.monotonic() + 15)
        identity = ["--user", f"{prepared['source_uid']}:{prepared['source_gid']}"]
        for name, value in workloads.ENV.items():
            identity += ["--env", name + "=" + value]

        def write(directory, label, into, slot):
            begun = time.monotonic_ns()
            done = subprocess.run([*docker, "exec", *identity, "--workdir", directory, runtime.container,
                                   "/bin/bash", "-c", body(label, files)], capture_output=True, text=True, timeout=60)
            into[slot] = {"exit": done.returncode, "launch_and_run_ms": round((time.monotonic_ns() - begun) / 1e6, 1),
                          "stamps": done.stdout.split(), "stderr": done.stderr[-300:]}

        if cpus:
            changed = subprocess.run([*docker, "update", "--cpus", cpus, runtime.container], capture_output=True, text=True)
            result["cpu_limit_change"] = {"cpus": cpus, "exit": changed.returncode, "stderr": changed.stderr[-200:]}
        result["cpu_limit"] = subprocess.run(
            [*docker, "inspect", "--format", "nano={{.HostConfig.NanoCpus}} quota={{.HostConfig.CpuQuota}} "
             "period={{.HostConfig.CpuPeriod}} cpuset={{.HostConfig.CpusetCpus}} memory={{.HostConfig.Memory}}",
             runtime.container], capture_output=True, text=True).stdout.strip()
        def memory(label):
            # Point observations outside each command's self-timed body. A
            # lifetime cgroup peak is retained as such, never a phase peak.
            script = "\n".join([
                "set -eu", "echo DAEMON_STATUS", "cat /proc/1/status",
                "echo DAEMON_RESIDENT", "if ! cat /proc/1/smaps_rollup; then echo SMAPS_UNAVAILABLE_PROTECTED_DAEMON; fi",
                "echo OWN_CGROUP",
                "for p in memory.current memory.peak memory.stat cpu.stat; do echo $p; cat /sys/fs/cgroup/$p; done",
                "echo SQLITE_FILES",
                "for p in /layerfs-local/overlay/*.sqlite /layerfs-store/global/store.sqlite*; do if test -f \"$p\"; then stat -c '%n %s %b %B' \"$p\"; fi; done",
            ])
            observed = subprocess.run([*docker, "exec", "--user", "0:0", runtime.container,
                                       "/bin/bash", "-c", script], capture_output=True, text=True, timeout=10)
            result["resident_observations"].append({"label": label, "exit": observed.returncode,
                "stdout": observed.stdout, "stderr": observed.stderr,
                "scope": "point RSS/anonymous from status; protected smaps may be unavailable; VmHWM/cgroup peak are lifetime; outside body timing; all SQLite file bytes/blocks"})
            if observed.returncode:
                raise RuntimeError("original resident observation failed")

        memory("ready-before-mounts")
        native = [None]
        write("/tmp", "native", native, 0)
        result["native"] = native[0]
        mounts = []
        for _ in range(5):
            key = secrets.token_hex(32)
            mount = runtime.send("mount", key, deadline=time.monotonic() + 15)
            mounts.append((key, mount["fields"]["directory"], mount["fields"]["workspace_namespace"]))
        (marker, _, marker_namespace), writers = mounts[0], mounts[1:]

        def snapshot():
            nonlocal snapshots
            snapshots += 1
            return runtime.send("commit", marker, deadline=time.monotonic() + 15)["fields"]["commit_kind"]

        snapshot()
        memory("five-workspaces-before-writes")
        for label, count, commit in plans:
            if time.monotonic() - started > budget:
                result["stopped_early"] = "budget reached before phase " + label
                break
            outcomes = [None] * count
            threads = [threading.Thread(target=write, args=(writers[index][1], label, outcomes, index))
                       for index in range(count)]
            begun = time.monotonic_ns()
            for thread in threads:
                thread.start()
            phase = {"phase": label, "writers": count}
            if commit:
                saved = runtime.send("commit", writers[3][0], deadline=time.monotonic() + 60)
                phase["commit"] = {"kind": saved["fields"]["commit_kind"],
                                   "ms": round(saved["span"]["duration_ns"] / 1e6, 1),
                                   "returned_after_ms": round((time.monotonic_ns() - begun) / 1e6, 1)}
            for thread in threads:
                thread.join()
            phase["wall_ms"] = round((time.monotonic_ns() - begun) / 1e6, 1)
            phase["marker"] = snapshot()
            phase["outcomes"] = outcomes
            result["phases"].append(phase)
            memory(label + "-after-writes")
        for key, _, _ in mounts:
            runtime.send("unmount", key, deadline=time.monotonic() + 15)
            while runtime.send("cleanup", key, deadline=time.monotonic() + 10)["fields"]["state"] != "Gone":
                pass
        memory("after-last-owner-cleanup")
        runtime.send("stop", deadline=time.monotonic() + 15)
        runtime.event("finished", time.monotonic() + 15)
        result["runtime_exit"] = runtime.process.wait(timeout=5)
    except BaseException as failure:  # the partial result and the cause are both kept
        result["failure"] = f"{type(failure).__name__}: {failure}"
        runtime.process.kill()
    finally:
        if runtime.container:
            logs = subprocess.run([*docker, "logs", "--timestamps=false", runtime.container], capture_output=True)
            (out / "daemon.log").write_bytes(logs.stdout + logs.stderr)
            subprocess.run([*docker, "rm", "--force", runtime.container], capture_output=True)
        removed = subprocess.run([*docker, "volume", "rm", clone["volume"]], capture_output=True)
        result["cleanup"] = "container and volume removed" if removed.returncode == 0 else "volume removal failed"
        result["interference"]["other_containers_at_end"] = subprocess.run(
            [*docker, "ps", "--format", "{{.Names}}"], capture_output=True, text=True).stdout.split()
        result["wall_seconds"] = round(time.monotonic() - started, 1)
    try:
        views = [counts.decode(group) for group in cell_runner.telemetry(out / "daemon.log").values()]
        marked = [view for view in views if view["namespace"] == marker_namespace and "owner" in view]
        tags = [view["operation_tag"] for view in marked]
        commit_tag = max(set(tags), key=tags.count)
        owners = [view["owner"] for view in marked if view["operation_tag"] == commit_tag]
        direct_mode = bool(owners and "jobs_by_class" in owners[0])
        observation_key = "sqlite_cache_group_observations" if direct_mode else "overlay_budget_observations"
        source_key = "sqlite_cache_group" if direct_mode else "overlay_budget"
        result[observation_key] = [view[source_key] for view in marked if view["operation_tag"] == commit_tag and source_key in view]
        if len(owners) != snapshots:
            raise ValueError(f"{len(owners)} marker Commits in the daemon log, {snapshots} sent")
        fields = (("jobs", "jobs_by_class"), ("wait_ns", "lock_wait_ns"), ("hold_ns", "hold_ns")) if direct_mode else (("jobs", "completed"), ("wait_ns", "queue_wait_ns"), ("hold_ns", "service_ns"))
        for phase, before, after in zip(result["phases"], owners, owners[1:]):
            phase["owner"] = {name: {kind: after[field][name] - before[field][name] for kind, field in fields}
                              for name in before[fields[0][1]]}
    except BaseException as failure:
        result["owner_failure"] = f"{type(failure).__name__}: {failure}"
    (out / "result.json").write_text(json.dumps(result, indent=1) + "\n")

    def stages(outcome):
        stamps = [float(value) for value in outcome["stamps"]]
        return [round((right - left) * 1e6 / files, 1) for left, right in zip(stamps, stamps[1:])]

    print("phase writers", *(stage + "_us_per_file" for stage in STAGES), "| owner class jobs wait_us/job service_us/job")
    if result.get("native"):
        print("native 1", *stages(result["native"]))
    for phase in result["phases"]:
        rows = [stages(outcome) for outcome in phase["outcomes"] if outcome and outcome["exit"] == 0]
        mean = [round(sum(column) / len(column), 1) for column in zip(*rows)] if rows else ["failed"]
        owner = " ".join(f"{name}:{value['jobs']}/{value['wait_ns'] / max(1, value['jobs']) / 1e3:.0f}/"
                         f"{value['hold_ns'] / max(1, value['jobs']) / 1e3:.0f}"
                         for name, value in phase.get("owner", {}).items() if value["jobs"])
        print(phase["phase"], phase["writers"], *mean, "|", owner, "|", phase.get("commit", ""))
    print("resident observations retained:", ", ".join(item["label"] for item in result["resident_observations"]))
    print(json.dumps({key: value for key, value in result.items()
                      if key not in ("phases", "native", "resident_observations")}))


if __name__ == "__main__":
    main()
