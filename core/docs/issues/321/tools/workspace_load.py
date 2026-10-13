"""Issue 321 Step B: threads, memory and lock service time of W Workspaces with P writers each.

usage: workspace_load.py <build-folder> <prepared-original-folder> <out-folder> <workspaces> <writers-per-workspace>
                         [<files-per-writer> [<budget-seconds> [<cpus>]]]

One daemon mounts <workspaces> Workspaces of the prepared tree. Point
observations of the daemon (threads, resident and anonymous memory, the cgroup,
every SQLite file) are taken when ready, with every Workspace mounted and idle,
after the load with every Workspace still mounted, and after the last cleanup.
A sampler reads the daemon's threads and resident memory five times a second
while the load runs; its largest values are sampled values, not a bound.

The load is <workspaces> x <writers-per-workspace> ordinary processes at once,
each in its own directory of its Workspace: create <files-per-writer> small
files, append a line to each, read the first line of each, shell builtins only,
self-timed. A Status of the first Workspace before and after the load carries
the daemon's cumulative jobs, lock wait and hold time by class; the two Status
calls are inside the difference.

With <cpus>, the CPU limit of the container this run started is changed first
(0 removes the limit). The limit used is recorded.

Not a harness case and not a sample: no oracle, no proof, exit codes only.
Times are single observations on a shared machine and are not eligible for a
performance claim. It removes the container and the volume it created, and
nothing else.
"""
import fcntl
import json
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
STATUS = 3


def body(label, files):
    loop = "i=0; while [ $i -lt " + str(files) + " ]; do {}; i=$((i+1)); done"
    return "\n".join([
        "set -eu", f"d=x321-{label}", "mkdir $d", "t0=$EPOCHREALTIME",
        loop.format("printf 'line %d\\n' $i > $d/f$i"), "t1=$EPOCHREALTIME",
        loop.format("printf 'more %d\\n' $i >> $d/f$i"), "t2=$EPOCHREALTIME",
        loop.format("read -r line < $d/f$i"), "t3=$EPOCHREALTIME",
        'echo "$t0 $t1 $t2 $t3"']) + "\n"


def status_fields(text):
    found = {}
    for line in text.splitlines():
        name, _, value = line.partition(":")
        if name in ("VmRSS", "RssAnon", "VmHWM", "Threads"):
            found[name] = int(value.split()[0])
    return found


def main():
    build_folder, original, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    workspaces, per_workspace = int(sys.argv[4]), int(sys.argv[5])
    files = int(sys.argv[6]) if len(sys.argv) > 6 else 1000
    budget = float(sys.argv[7]) if len(sys.argv) > 7 else 90.0
    cpus = sys.argv[8] if len(sys.argv) > 8 else None
    started = time.monotonic()
    lock = (ROOT / "core/target/issue320/measurement.lock").open("a")
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    build = json.loads((build_folder / "build.json").read_text())
    prepared = json.loads((original / "prepared.json").read_text())
    docker = ["docker", "--host", "unix://" + build["socket"]]
    out.mkdir(parents=True, exist_ok=False)
    others = subprocess.run([*docker, "ps", "--format", "{{.Names}}"], capture_output=True, text=True).stdout.split()
    result = {"label": "issue 321 Workspace load diagnostic; one-off; not a harness case; no oracle or proof; "
                       "exit codes only; shared machine; times not eligible for a claim",
              "case_tree": prepared["case"], "build": build_folder.name, "source_commit": build["identity"]["source_commit"],
              "source_tree": build["identity"]["source_tree"],
              "sqlite_compile_flags": build.get("explicit_sqlite_flags"),
              "workspaces": workspaces, "writers_per_workspace": per_workspace, "files_per_writer": files,
              "writer": "create, append, read of every file; shell builtins; self-timed",
              "interference": {"other_containers_at_start": others}, "resident_observations": []}
    clone = fixtures.clone(prepared, out / "clone", build)
    environment = out / "environment.txt"
    environment.write_text("".join(name + "=" + value + "\n" for name, value in workloads.ENV.items()))
    argv = [build["binaries"]["runtime"]["path"], "serve", "--socket", build["socket"],
            "--volume", clone["volume"], "--daemon", build["binaries"]["daemon"]["path"],
            "--manifest", prepared["provision"]["manifest"], "--receipt", str(out / "runtime.events.jsonl"),
            "--uid", str(prepared["source_uid"]), "--gid", str(prepared["source_gid"]),
            "--environment-file", str(environment), "--observation-scope", secrets.token_hex(32)]
    runtime = cell_runner.EventProcess(argv, out, "runtime")
    first_namespace = None
    try:
        runtime.event("protocol_ready", time.monotonic() + 15)
        identity = ["--user", f"{prepared['source_uid']}:{prepared['source_gid']}"]
        for name, value in workloads.ENV.items():
            identity += ["--env", name + "=" + value]

        def root(script, timeout):
            return subprocess.run([*docker, "exec", "--user", "0:0", runtime.container, "/bin/bash", "-c", script],
                                  capture_output=True, text=True, timeout=timeout)

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
            # Point observations outside every self-timed body. VmHWM and the
            # cgroup peak are lifetime values and are never relabelled.
            script = "\n".join([
                "set -eu", "echo DAEMON_STATUS", "cat /proc/1/status", "echo DAEMON_THREADS",
                "for t in /proc/1/task/*; do cat $t/comm; done | sort | uniq -c",
                "echo OWN_CGROUP",
                "for p in memory.current memory.peak; do echo $p; cat /sys/fs/cgroup/$p; done",
                "echo SQLITE_FILES",
                "for p in /layerfs-local/overlay/*.sqlite /layerfs-store/global/store.sqlite*; do if test -f \"$p\"; then stat -c '%n %s %b %B' \"$p\"; fi; done",
            ])
            observed = root(script, 10)
            fields = status_fields(observed.stdout)
            overlay = [line.split() for line in observed.stdout.split("SQLITE_FILES")[-1].splitlines() if "/overlay/" in line]
            result["resident_observations"].append({
                "label": label, "exit": observed.returncode, **fields,
                "thread_names": observed.stdout.split("DAEMON_THREADS")[-1].split("OWN_CGROUP")[0].split("\n")[1:-1],
                "overlay_files": len(overlay), "overlay_logical_bytes": sum(int(row[1]) for row in overlay),
                "overlay_allocated_bytes": sum(int(row[2]) * int(row[3]) for row in overlay),
                "stdout": observed.stdout, "stderr": observed.stderr,
                "scope": "point values from /proc/1/status in KiB; VmHWM and cgroup peak are lifetime; outside body timing"})
            if observed.returncode:
                raise RuntimeError("original resident observation failed")

        memory("ready-before-mounts")
        mounts = []
        for _ in range(workspaces):
            key = secrets.token_hex(32)
            mount = runtime.send("mount", key, deadline=time.monotonic() + 15)
            mounts.append((key, mount["fields"]["directory"], mount["fields"]["workspace_namespace"]))
        first_namespace = mounts[0][2]
        runtime.send("snapshot", mounts[0][0], deadline=time.monotonic() + 15)
        memory("mounted-idle")
        if time.monotonic() - started > budget:
            raise TimeoutError("budget reached before the load")
        stop = "/tmp/x321-stop-" + secrets.token_hex(8)
        sampled = {}

        def sample():
            script = (f"while [ ! -e {stop} ]; do "
                      "while read -r name value rest; do case $name in VmRSS:|RssAnon:|Threads:) printf '%s ' $value;; esac; "
                      "done < /proc/1/status; echo; sleep 0.2; done")
            sampled["run"] = root(script, 75)

        sampler = threading.Thread(target=sample)
        sampler.start()
        outcomes = [None] * (workspaces * per_workspace)
        threads = [threading.Thread(target=write, args=(mounts[index // per_workspace][1],
                                                        f"w{index // per_workspace}p{index % per_workspace}", outcomes, index))
                   for index in range(len(outcomes))]
        begun = time.monotonic_ns()
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
        result["load_wall_ms"] = round((time.monotonic_ns() - begun) / 1e6, 1)
        root("touch " + stop, 10)
        sampler.join()
        rows = [[int(value) for value in line.split()] for line in sampled["run"].stdout.splitlines() if len(line.split()) == 3]
        # /proc/1/status order: VmRSS, RssAnon, Threads.
        result["load_samples"] = {"count": len(rows), "interval_seconds": 0.2,
                                  "largest_VmRSS_kib": max((row[0] for row in rows), default=None),
                                  "largest_RssAnon_kib": max((row[1] for row in rows), default=None),
                                  "largest_Threads": max((row[2] for row in rows), default=None),
                                  "scope": "largest sampled values during the load; not a bound"}
        result["outcomes"] = outcomes
        runtime.send("snapshot", mounts[0][0], deadline=time.monotonic() + 15)
        memory("mounted-after-load")
        for key, _, _ in mounts:
            runtime.send("unmount", key, deadline=time.monotonic() + 15)
            deadline = time.monotonic() + 10
            while runtime.send("cleanup", key, deadline=deadline)["fields"]["state"] != "Gone":
                if time.monotonic() >= deadline:
                    raise TimeoutError("cleanup did not establish physical Gone")
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
        marked = [view for view in views
                  if view["namespace"] == first_namespace and view["operation_tag"] == STATUS and "owner" in view]
        if len(marked) != 2:
            raise ValueError(f"{len(marked)} Status snapshots of the first Workspace in the daemon log, 2 sent")
        before, after = (view["owner"] for view in marked)
        # A build before the lock per Workspace reports queue wait and service time of its owner thread.
        fields = ((("jobs", "jobs_by_class"), ("wait_ns", "lock_wait_ns"), ("hold_ns", "hold_ns")) if "jobs_by_class" in before
                  else (("jobs", "completed"), ("wait_ns", "queue_wait_ns"), ("hold_ns", "service_ns")))
        result["owner_schema"] = "lock per Workspace" if "jobs_by_class" in before else "owner thread and queue"
        result["owner"] = {name: {kind: after[field][name] - before[field][name] for kind, field in fields}
                           for name in counts.CLASSES}
        result["receive_loops"] = marked[-1].get("loops")
        if "lock_only_holds" in marked[0]:
            result["lock_only_holds"] = {name: marked[1]["lock_only_holds"][name] - marked[0]["lock_only_holds"][name]
                                         for name in marked[0]["lock_only_holds"]}
    except BaseException as failure:
        result["owner_failure"] = f"{type(failure).__name__}: {failure}"
    (out / "result.json").write_text(json.dumps(result, indent=1) + "\n")

    def stages(outcome):
        stamps = [float(value) for value in outcome["stamps"]]
        return [round((right - left) * 1e6 / files, 1) for left, right in zip(stamps, stamps[1:])]

    done = [stages(outcome) for outcome in result.get("outcomes", []) if outcome and outcome["exit"] == 0]
    mean = [round(sum(column) / len(column), 1) for column in zip(*done)] if done else ["failed"]
    print("workspaces writers/workspace", *(stage + "_us_per_file" for stage in STAGES), "| class jobs wait_us/job hold_us/job")
    print(workspaces, per_workspace, *mean, "|",
          " ".join(f"{name}:{value['jobs']}/{value['wait_ns'] / max(1, value['jobs']) / 1e3:.0f}/"
                   f"{value['hold_ns'] / max(1, value['jobs']) / 1e3:.0f}"
                   for name, value in result.get("owner", {}).items() if value["jobs"]))
    for item in result["resident_observations"]:
        print(item["label"], {name: item.get(name) for name in ("Threads", "VmRSS", "RssAnon", "VmHWM")},
              "overlay files", item["overlay_files"], "allocated", item["overlay_allocated_bytes"])
    print(json.dumps({key: value for key, value in result.items() if key not in ("outcomes", "resident_observations")}))


if __name__ == "__main__":
    main()
