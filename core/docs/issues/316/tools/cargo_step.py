"""Run one cargo command under the worktree lock with a wall stop; print a short result.

usage: cargo_step.py <limit-seconds> <label> <cargo args...>

Uses the pinned toolchain and a target directory inside this worktree. A test
command gets a limit of at most 120; build first with `--no-run` under a longer
limit so compilation is not mistaken for a slow test. Full output is kept in
core/target/issue316/<label>.stdout and .stderr.
"""
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
limit, label, arguments = sys.argv[1], sys.argv[2], sys.argv[3:]
logs = ROOT / "core/target/issue316"
logs.mkdir(parents=True, exist_ok=True)
start = time.time()
done = subprocess.run(["perl", "core/target/r4-locked.pl", limit, "cargo", "+1.85.1", *arguments], cwd=ROOT,
                      capture_output=True, text=True,
                      env={**os.environ, "CARGO_TARGET_DIR": str(ROOT / "core/target/issue316/host")})
(logs / (label + ".stdout")).write_text(done.stdout)
(logs / (label + ".stderr")).write_text(done.stderr)
print("EXIT", done.returncode, "seconds", round(time.time() - start, 1))
lines = (done.stdout + "\n" + done.stderr).splitlines()
keep = [line for line in lines if line.startswith(("error", "test result", "failures", "---- "))
        or " FAILED" in line or "panicked" in line or "R4_WALL" in line]
print("\n".join(keep[-60:]))
