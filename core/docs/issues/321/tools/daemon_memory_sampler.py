"""Sample one fs-bench-pro daemon's memory and thread names every 50 ms, read-only.

usage (host):  daemon_memory_sampler.py <out.jsonl> <seconds>

Waits up to 30 s for the first running container that mounts a
`layerfs-fsb-sample-*` volume, then starts a read-only observer container
from the pinned image in that container's PID namespace. The observer reads
the daemon's `/proc/1/status` and `/proc/1/task/*/comm`; it writes nothing
into the sample, mounts nothing and evicts no cache. Rows carry the Docker
VM's CLOCK_MONOTONIC. Per-mount thread names (`layerfs-mount-…`) appear and
disappear with each mount, which aligns rows with the harness's events.
"""
import json
import subprocess
import sys
import time

IMAGE = "sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6"
FIELDS = ("VmHWM", "VmRSS", "RssAnon", "RssFile", "RssShmem", "VmData", "Threads")

INSIDE = r'''
import json, os, sys, time
fields = %r
end = time.monotonic() + float(sys.argv[1])
last = None
while time.monotonic() < end:
    try:
        row = {"t": time.monotonic()}
        for line in open("/proc/1/status"):
            key, _, value = line.partition(":")
            if key in fields:
                row[key] = int(value.split()[0])
        names = {}
        for task in os.listdir("/proc/1/task"):
            try:
                name = open("/proc/1/task/%%s/comm" %% task).read().strip()
            except OSError:
                continue
            names[name] = names.get(name, 0) + 1
        row["threads"] = names
    except OSError as cause:
        print(json.dumps({"t": time.monotonic(), "gone": str(cause)}), flush=True)
        break
    print(json.dumps(row), flush=True)
    time.sleep(0.05)
''' % (FIELDS,)


def sample_container(deadline):
    while time.monotonic() < deadline:
        listed = subprocess.run(["docker", "ps", "--format", "{{.ID}} {{.Mounts}}"],
                                capture_output=True, text=True, timeout=10).stdout
        for line in listed.splitlines():
            ident, _, mounts = line.partition(" ")
            if "layerfs-fsb-sample-" in mounts:
                return ident
        time.sleep(0.1)
    return None


def main():
    out, seconds = sys.argv[1], float(sys.argv[2])
    started = time.monotonic()
    ident = sample_container(started + 30)
    if ident is None:
        raise SystemExit("no sample container within 30 s")
    left = max(1.0, seconds - (time.monotonic() - started))
    with open(out, "x") as rows:
        rows.write(json.dumps({"container": ident, "image": IMAGE, "fields": FIELDS}) + "\n")
        rows.flush()
        subprocess.run(["docker", "run", "--rm", "-i", "--network", "none",
                        "--pid", "container:" + ident, IMAGE, "python3", "-B", "-", str(left)],
                       input=INSIDE, stdout=rows, text=True, timeout=left + 20)


if __name__ == "__main__":
    main()
