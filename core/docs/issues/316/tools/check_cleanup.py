"""Check tier_step.py's removal of a test copy against Docker, with a made-up sample.

usage: check_cleanup.py

Makes one sample folder with a clone claim and an exported Store file, the
volume the claim names, one running and one never-started container on that
volume, and a second volume that no claim names. Runs `tier_step.py ... clean`
and requires: both containers and the claimed volume gone, the exported Store
gone, the receipt kept, `payload-cleanup.json` written, the unclaimed volume
untouched. Everything it makes it removes. Every command has a 30 s stop.
"""
import json
import shutil
import subprocess
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(ROOT / "core/benchmark/fs-bench-pro"))
from engine import identity  # noqa: E402


def docker(*arguments):
    done = subprocess.run(["docker", *arguments], capture_output=True, text=True, timeout=30)
    return done.returncode, done.stdout.strip()


tag = "check" + uuid.uuid4().hex[:8]
volume, other = ("layerfs-fsb-sample-" + uuid.uuid4().hex[:16] for _ in range(2))
run = ROOT / "benchmark-results/fs-bench-pro" / ("0000-issue316-" + tag + "-run-none")
sample = run / "made-up"
(sample / "clone").mkdir(parents=True)
(sample / "graph-store").mkdir()
(sample / "graph-store/store.sqlite").write_bytes(b"\0" * 4096)
(sample / "receipt.json").write_text("{}\n")
(sample / "clone/resource-claim.json").write_text(json.dumps({"volume": volume, "created_by_this_run": True}))
checks = {}
try:
    for name in (volume, other):
        docker("volume", "create", name)
    _, running = docker("run", "--detach", "--volume", volume + ":/data", identity.IMAGE, "sleep", "120")
    _, created = docker("create", "--volume", volume + ":/data", identity.IMAGE, "true")
    checks["made"] = bool(running) and bool(created)
    done = subprocess.run(["python3", "-B", str(Path(__file__).with_name("tier_step.py")), tag, "60", "clean"],
                          capture_output=True, text=True, timeout=60)
    print(done.stdout + done.stderr, end="")
    checks["containers gone"] = docker("ps", "--all", "--quiet", "--filter", "volume=" + volume)[1] == ""
    checks["claimed volume gone"] = volume not in docker("volume", "ls", "--quiet")[1].split()
    checks["unclaimed volume kept"] = other in docker("volume", "ls", "--quiet")[1].split()
    checks["exported Store gone"] = not (sample / "graph-store").exists()
    checks["receipt kept"] = (sample / "receipt.json").exists()
    record = sample / "payload-cleanup.json"
    checks["record written"] = record.exists() and json.loads(record.read_text())["volume"] == volume
finally:
    for container in docker("ps", "--all", "--quiet", "--filter", "volume=" + volume)[1].split():
        docker("rm", "--force", container)
    for name in (volume, other):
        docker("volume", "rm", name)
    shutil.rmtree(run)
print(json.dumps(checks, indent=2))
sys.exit(0 if checks and all(checks.values()) else 1)
