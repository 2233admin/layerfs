"""Issue 321 follow-up: open-state and Commit memory of W Workspaces in one 2 GiB, 2-CPU sandbox.

usage: open_state_memory.py <build-folder> <prepared-original-folder> <out-folder> <workspaces>
                            files <files-per-workspace> <big-directory-entries>
       open_state_memory.py <build-folder> <prepared-original-folder> <out-folder> <workspaces>
                            large <mib-per-workspace>

One daemon, <workspaces> Workspaces of the prepared tree, the sandbox container
limited like the fs-bench-pro harness (2 CPUs, 2 GiB, no swap). Phases run in
every Workspace at once; each ends with a Status of every Workspace (the
daemon's eleven open-state counts per Workspace) and a point observation of the
daemon and the sandbox cgroup. A sampler reads the daemon's VmRSS and RssAnon
every 0.2 s and tags each row with the current phase.

`files` mode:
  E1 create   each Workspace creates <files> files (16 B) in 100 directories plus
              one directory of <big-directory-entries> files, then lstat-walks all
  E3 listed   one process per Workspace lists the big directory to its end and
              keeps the handle open
  E4 mutated  rewrite every 10th file, open 1,000 files and keep them open, unlink
              them, unlink every 20th other file, rename the 100 directories
  E2 pressure a filler in the sandbox touches anonymous memory until the cgroup
              is 96 MiB below its limit, holds 2 s and exits
     commit   Commit of every Workspace, one after another (the control channel is
              serial); the sampler covers them
     released the held directory and file handles are closed
     unmounted every Workspace unmounted and cleaned up to Gone
`large` mode (E5): each Workspace writes one <mib> MiB file of random bytes, then
  every Workspace is Committed, then unmounted.

Diagnostic only: no oracle, no proof, exit codes only; times and memory are
single observations on a shared machine and are not eligible for a claim. RSS
is an allocator high-water mark: freed memory is not returned, so release is
judged by the open-state counts. It removes the container and the volume it
created, and nothing else.
"""
import fcntl
import hashlib
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

STATUS = 3
LIMIT = 2147483648
PHASE = "/tmp/x321-phase"

CREATE = r"""
import os, sys, json, time
files, big = int(sys.argv[1]), int(sys.argv[2])
t0 = time.monotonic()
os.mkdir("x321"); os.mkdir("x321/big")
for d in range(100):
    os.mkdir(f"x321/d{d:02d}")
spread = files - big
for i in range(spread):
    with open(f"x321/d{i % 100:02d}/f{i}", "w") as f:
        f.write("0123456789abcde\n")
for i in range(big):
    with open(f"x321/big/n{i:07d}", "w") as f:
        f.write("0123456789abcde\n")
t1 = time.monotonic()
seen = 0
for parent, dirs, names in os.walk("x321"):
    for name in dirs + names:
        os.lstat(os.path.join(parent, name)); seen += 1
print(json.dumps({"created": files, "walked": seen, "create_s": round(t1 - t0, 2), "walk_s": round(time.monotonic() - t1, 2)}))
"""
HOLD_DIR = r"""
import os, sys, time
# listdir(fd) reads to the end through a duplicate of the descriptor; the open
# file description, and so the FUSE directory handle, stays open with this fd.
fd = os.open("x321/big", os.O_RDONLY | os.O_DIRECTORY); n = len(os.listdir(fd))
open(sys.argv[1], "w").write(str(n))
while not os.path.exists(sys.argv[2]):
    time.sleep(0.1)
os.close(fd)
"""
MUTATE = r"""
import os, sys, json, time
files, big, ready, stop = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4]
spread = files - big
t0 = time.monotonic()
for i in range(0, spread, 10):
    with open(f"x321/d{i % 100:02d}/f{i}", "w") as f:
        f.write("rewritten-------\n")
held = [os.open(f"x321/d{i % 100:02d}/f{i}", os.O_RDONLY) for i in range(1, min(spread, 20000), 20)]
for i in range(1, min(spread, 20000), 20):
    os.unlink(f"x321/d{i % 100:02d}/f{i}")
removed = 0
for i in range(3, spread, 20):
    os.unlink(f"x321/d{i % 100:02d}/f{i}"); removed += 1
for d in range(100):
    os.rename(f"x321/d{d:02d}", f"x321/r{d:02d}")
print(json.dumps({"rewritten": len(range(0, spread, 10)), "open_then_unlinked": len(held), "unlinked": removed,
                  "renamed_directories": 100, "mutate_s": round(time.monotonic() - t0, 2)}), flush=True)
open(ready, "w").write("1")
while not os.path.exists(stop):
    time.sleep(0.1)
for fd in held:
    os.close(fd)
"""
FILL = r"""
import time
limit = int(open("/sys/fs/cgroup/memory.max").read())
blocks, peak = [], 0
while True:
    current = int(open("/sys/fs/cgroup/memory.current").read())
    peak = max(peak, current)
    if current >= limit - 96 * 2**20 or len(blocks) >= 4096:
        break
    block = bytearray(16 * 2**20)
    for offset in range(0, len(block), 4096):
        block[offset] = 1
    blocks.append(block)
time.sleep(2)
print(len(blocks) * 16, "MiB filled; cgroup peak seen", peak)
"""
LARGE = "set -eu; head -c {mib}M /dev/urandom > x321-large; stat -c %s x321-large"


def status_fields(text):
    found = {}
    for line in text.splitlines():
        name, _, value = line.partition(":")
        if name in ("VmRSS", "RssAnon", "VmHWM", "Threads"):
            found[name] = int(value.split()[0])
    return found


def main():
    build_folder, original, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    workspaces, mode = int(sys.argv[4]), sys.argv[5]
    if mode == "files":
        files, big = int(sys.argv[6]), int(sys.argv[7])
    elif mode == "large":
        mib = int(sys.argv[6])
    else:
        sys.exit("mode is files or large")
    started = time.monotonic()
    budget = 110
    lock = (ROOT / "core/target/issue320/measurement.lock").open("a")
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    build = json.loads((build_folder / "build.json").read_text())
    prepared = json.loads((original / "prepared.json").read_text())
    docker = ["docker", "--host", "unix://" + build["socket"]]
    out.mkdir(parents=True, exist_ok=False)
    result = {"label": "issue 321 open-state and Commit memory diagnostic; one-off; not a harness case; no oracle or proof; "
                       "exit codes only; shared machine; not eligible for a claim",
              "script_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              "case_tree": prepared.get("case"), "build": build_folder.name,
              "source_commit": build["identity"]["source_commit"], "daemon_sha256": build["binaries"]["daemon"]["sha256"],
              "workspaces": workspaces, "mode": mode, "parameters": sys.argv[6:],
              "interference": {"other_containers_at_start": subprocess.run(
                  [*docker, "ps", "--format", "{{.Names}}"], capture_output=True, text=True).stdout.split()},
              "phases": [], "workspace_results": {}}
    clone = fixtures.clone(prepared, out / "clone", build)
    environment = out / "environment.txt"
    environment.write_text("".join(name + "=" + value + "\n" for name, value in workloads.ENV.items()))
    argv = [build["binaries"]["runtime"]["path"], "serve", "--socket", build["socket"],
            "--volume", clone["volume"], "--daemon", build["binaries"]["daemon"]["path"],
            "--manifest", prepared["provision"]["manifest"], "--receipt", str(out / "runtime.events.jsonl"),
            "--uid", str(prepared["source_uid"]), "--gid", str(prepared["source_gid"]),
            "--environment-file", str(environment), "--observation-scope", secrets.token_hex(32)]
    runtime = cell_runner.EventProcess(argv, out, "runtime")
    namespaces = []
    try:
        runtime.event("protocol_ready", time.monotonic() + 15)
        limited = subprocess.run([*docker, "update", "--cpus", "2", "--memory", str(LIMIT), "--memory-swap", str(LIMIT),
                                  runtime.container], capture_output=True, text=True)
        result["sandbox_limit"] = {"exit": limited.returncode, "cpus": 2, "memory": LIMIT, "swap": LIMIT}
        identity = ["--user", f"{prepared['source_uid']}:{prepared['source_gid']}"]
        for name, value in workloads.ENV.items():
            identity += ["--env", name + "=" + value]

        def root(script, timeout):
            return subprocess.run([*docker, "exec", "--user", "0:0", runtime.container, "/bin/bash", "-c", script],
                                  capture_output=True, text=True, timeout=timeout)

        def user(directory, argv_, timeout, stdin=None):
            return subprocess.run([*docker, "exec", "-i", *identity, "--workdir", directory, runtime.container, *argv_],
                                  input=stdin, capture_output=True, text=True, timeout=timeout)

        def remaining():
            left = budget - (time.monotonic() - started)
            if left <= 5:
                raise TimeoutError("wall budget reached")
            return left

        mounts = []
        for _ in range(workspaces):
            key = secrets.token_hex(32)
            mount = runtime.send("mount", key, deadline=time.monotonic() + 15)
            mounts.append((key, mount["fields"]["directory"]))
            namespaces.append(mount["fields"]["workspace_namespace"])
        stop = "/tmp/x321-stop-" + secrets.token_hex(8)
        samples = {}

        def sample():
            script = (f"while [ ! -e {stop} ]; do p=$(cat {PHASE} 2>/dev/null || echo setup); "
                      "while read -r name value rest; do case $name in VmRSS:|RssAnon:) printf '%s ' $value;; esac; "
                      "done < /proc/1/status; echo $p; sleep 0.2; done")
            samples["run"] = root(script, budget + 5)

        def phase(label, when=None):
            for key, _ in mounts:
                runtime.send("snapshot", key, deadline=time.monotonic() + 15)
            observed = root("cat /proc/1/status; echo CGROUP; cat /sys/fs/cgroup/memory.current; "
                            "grep -E '^(anon|file|slab|slab_reclaimable|file_dirty|pgscan|pgsteal) ' /sys/fs/cgroup/memory.stat", 10)
            cg = observed.stdout.split("CGROUP")[-1].split()
            row = {"label": label, **status_fields(observed.stdout), "cgroup_current": int(cg[0]),
                   **{cg[i]: int(cg[i + 1]) for i in range(1, len(cg) - 1, 2)},
                   "elapsed_s": round(time.monotonic() - started, 1)}
            if when:
                row.update(when)
            result["phases"].append(row)
            root(f"echo after-{label} > {PHASE}", 5)

        root(f"echo mounted > {PHASE}", 5)
        sampler = threading.Thread(target=sample)
        sampler.start()
        phase("mounted")

        def each(target):
            outcomes = [None] * len(mounts)
            threads = [threading.Thread(target=lambda i=i: outcomes.__setitem__(i, target(i))) for i in range(len(mounts))]
            begun = time.monotonic()
            for thread in threads:
                thread.start()
            for thread in threads:
                thread.join()
            return outcomes, round(time.monotonic() - begun, 2)

        def report(done):
            return {"exit": done.returncode, "stdout": done.stdout.strip()[-400:], "stderr": done.stderr.strip()[-400:]}

        holders = []
        if mode == "files":
            root(f"echo create > {PHASE}", 5)
            outcomes, wall = each(lambda i: report(user(mounts[i][1], ["python3", "-", str(files), str(big)],
                                                        remaining(), CREATE)))
            result["workspace_results"]["create"] = outcomes
            phase("created-walked", {"wall_s": wall})
            ready = [f"/tmp/x321-dir-{i}" for i in range(len(mounts))]
            for i, (_, directory) in enumerate(mounts):
                holder = subprocess.Popen([*docker, "exec", "-i", *identity, "--workdir", directory, runtime.container,
                                           "python3", "-", ready[i], stop], stdin=subprocess.PIPE, text=True,
                                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                holder.stdin.write(HOLD_DIR)
                holder.stdin.close()
                holders.append(holder)
            for path in ready:
                while root(f"cat {path} 2>/dev/null", 5).stdout == "":
                    remaining()
                    time.sleep(0.2)
            result["workspace_results"]["listed_entries"] = [root(f"cat {path}", 5).stdout for path in ready]
            phase("big-directory-listed-and-held")
            root(f"echo mutate > {PHASE}", 5)
            marks = [f"/tmp/x321-mut-{i}" for i in range(len(mounts))]
            for i, (_, directory) in enumerate(mounts):
                holder = subprocess.Popen([*docker, "exec", "-i", *identity, "--workdir", directory, runtime.container,
                                           "python3", "-", str(files), str(big), marks[i], stop], stdin=subprocess.PIPE,
                                          text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                holder.stdin.write(MUTATE)
                holder.stdin.close()
                holders.append(holder)
            begun = time.monotonic()
            for path in marks:
                while root(f"cat {path} 2>/dev/null", 5).stdout == "":
                    remaining()
                    time.sleep(0.2)
            phase("mutated-with-unlinked-files-held", {"wall_s": round(time.monotonic() - begun, 2)})
            root(f"echo pressure > {PHASE}", 5)
            filled = user("/tmp", ["python3", "-"], remaining(), FILL)
            result["workspace_results"]["filler"] = report(filled)
            phase("after-memory-pressure")
        else:
            root(f"echo write-large > {PHASE}", 5)
            outcomes, wall = each(lambda i: report(user(mounts[i][1], ["/bin/bash", "-c", LARGE.format(mib=mib)],
                                                        remaining())))
            result["workspace_results"]["write"] = outcomes
            phase("large-written", {"wall_s": wall})
        root(f"echo commit > {PHASE}", 5)
        commits = []
        for key, _ in mounts:
            begun = time.monotonic()
            done = runtime.send("commit", key, deadline=time.monotonic() + remaining())
            commits.append({"kind": done["fields"].get("commit_kind"), "wall_s": round(time.monotonic() - begun, 2)})
        result["workspace_results"]["commit"] = commits
        phase("committed")
        root(f"touch {stop}", 5)
        for holder in holders:
            holder.wait(timeout=15)
        result["workspace_results"]["holders"] = [{"exit": h.returncode, "stdout": h.stdout.read()[-300:],
                                                   "stderr": h.stderr.read()[-300:]} for h in holders]
        if holders:
            phase("handles-released")
        root(f"echo unmount > {PHASE}", 5)
        for key, _ in mounts:
            runtime.send("unmount", key, deadline=time.monotonic() + 15)
            deadline = time.monotonic() + 10
            while runtime.send("cleanup", key, deadline=deadline)["fields"]["state"] != "Gone":
                if time.monotonic() >= deadline:
                    raise TimeoutError("cleanup did not establish physical Gone")
        observed = root("cat /proc/1/status", 10)
        result["phases"].append({"label": "unmounted-gone", **status_fields(observed.stdout),
                                 "elapsed_s": round(time.monotonic() - started, 1)})
        root(f"touch {stop}", 5)
        sampler.join(timeout=10)
        rows = [line.split() for line in samples.get("run", subprocess.CompletedProcess([], 0, "", "")).stdout.splitlines()]
        peaks = {}
        for row in rows:
            if len(row) == 3 and row[0].isdigit():
                rss, anon, label = int(row[0]), int(row[1]), row[2]
                peak = peaks.setdefault(label, {"samples": 0, "max_VmRSS_kib": 0, "max_RssAnon_kib": 0})
                peak["samples"] += 1
                peak["max_VmRSS_kib"] = max(peak["max_VmRSS_kib"], rss)
                peak["max_RssAnon_kib"] = max(peak["max_RssAnon_kib"], anon)
        result["sampled_peaks_by_phase"] = peaks
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
        result["open_state_by_status"] = {
            str(ns): [view["open_state"] for view in views
                      if view["namespace"] == ns and view["operation_tag"] == STATUS and "open_state" in view]
            for ns in namespaces}
    except BaseException as failure:
        result["open_state_failure"] = f"{type(failure).__name__}: {failure}"
    (out / "result.json").write_text(json.dumps(result, indent=1) + "\n")
    labels = [row["label"] for row in result["phases"] if "cgroup_current" in row]
    print(json.dumps({key: result.get(key) for key in ("workspaces", "mode", "parameters", "failure", "cleanup",
                                                       "wall_seconds", "workspace_results")}, default=str)[:3000])
    for row in result["phases"]:
        print(row["label"], {k: row.get(k) for k in ("VmRSS", "RssAnon", "VmHWM", "cgroup_current", "anon", "file",
                                                      "slab", "slab_reclaimable", "pgscan")})
    for ns, views in result.get("open_state_by_status", {}).items():
        for label, view in zip(labels, views):
            print("ns", ns, label, {k: v for k, v in view.items() if v})
    print("sampled peaks", result.get("sampled_peaks_by_phase"))


if __name__ == "__main__":
    main()
