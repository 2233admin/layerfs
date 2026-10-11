"""Run one cargo command in the pinned Linux image under the worktree lock and a wall stop.

usage: linux_step.py <limit-seconds> <label> [--fuse] <cargo args...>

The repository is bound read-only; the target folder and the offline cargo home
of this worktree are bound writable. Before cargo runs, the container checks the
SHA-256 of every tracked core source against the host's, so a stale shared file
is a refused run and not a wrong build. The container is named and removed when
the command ends, also after a wall stop.
"""
import hashlib
import subprocess
import sys
import time
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
IMAGE = "sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6"
limit, label, arguments = sys.argv[1], sys.argv[2], sys.argv[3:]
fuse = arguments[:1] == ["--fuse"]
arguments = arguments[1:] if fuse else arguments
home = ROOT / "core/target/issue318"
logs = home / "logs"
target = home / "linux-test"
logs.mkdir(parents=True, exist_ok=True)
target.mkdir(parents=True, exist_ok=True)
tracked = subprocess.run(["git", "ls-files", "core/crates", "core/vendor", "core/Cargo.toml", "core/Cargo.lock", ".cargo"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout.splitlines()
sums = home / "linux-sources.sha256"
sums.write_text("".join(hashlib.sha256((ROOT / path).read_bytes()).hexdigest() + "  /work/" + path + "\n"
                        for path in tracked if (ROOT / path).is_file()))
name = "layerfs-i318-test-" + uuid.uuid4().hex[:12]
body = ("set -eu; sha256sum --quiet -c /sums; cd /work; export LAYERFS_CONSTRUCTION_WORKERS=1; "
        "exec cargo " + " ".join("'" + a.replace("'", "'\\''") + "'" for a in arguments))
command = ["docker", "run", "--name", name, "--network", "none",
           "-v", str(ROOT) + ":/work:ro", "-v", str(target) + ":/target", "-v", str(sums) + ":/sums:ro",
           "-v", str(ROOT / "core/target/cluster2-linux-cargo") + ":/cargo-home",
           "-e", "CARGO_HOME=/cargo-home", "-e", "CARGO_TARGET_DIR=/target"]
if fuse:
    command += ["--device", "/dev/fuse", "--cap-add", "SYS_ADMIN", "--security-opt", "apparmor=unconfined"]
command += [IMAGE, "/bin/bash", "-c", body]
start = time.time()
done = subprocess.run(["perl", "core/target/r4-locked.pl", limit, *command], cwd=ROOT, capture_output=True, text=True)
removed = subprocess.run(["docker", "rm", "--force", name], capture_output=True, text=True)
(logs / (label + ".stdout")).write_text(done.stdout)
(logs / (label + ".stderr")).write_text(done.stderr)
print("EXIT", done.returncode, "seconds", round(time.time() - start, 1), "container_removed", removed.returncode == 0)
lines = (done.stdout + "\n" + done.stderr).splitlines()
keep = [line for line in lines if line.startswith(("error", "test result", "failures", "---- ", "     Running"))
        or " FAILED" in line or "panicked" in line or "R4_WALL" in line or "FAILED" in line and "sha" in line]
print("\n".join(keep[-70:]))
