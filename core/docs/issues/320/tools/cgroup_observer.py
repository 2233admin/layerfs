"""Labelled diagnostic observer: kernel page-cache and write-back counts beside one sample.

usage (inside any Linux container that has the Docker VM's cgroup tree bound read-only):
    docker run --rm -i -v /sys/fs/cgroup:/hostcg:ro IMAGE python3 -B - SECONDS < cgroup_observer.py > rows.jsonl

Every 100 ms it prints one JSON line: the VM's dirty and write-back page counts
with their thresholds, the VM's I/O and memory pressure totals, and, for every
container cgroup that did not exist when the observer started, its memory,
write-back, reclaim, I/O and CPU-throttle counters. It reads files only, runs
outside the sampled container's cgroup and stops by itself after SECONDS.
It is a diagnostic: it is not part of the harness and proves no timing.
"""
import json
import os
import sys
import time

ROOT = "/hostcg/docker"
LIMIT = float(sys.argv[1]) if len(sys.argv) > 1 else 100.0
VMSTAT = ("nr_dirty", "nr_writeback", "nr_dirty_threshold", "nr_dirty_background_threshold", "nr_free_pages",
          "nr_file_pages", "pgpgout", "pgpgin", "pgscan_kswapd", "pgscan_direct", "pgsteal_kswapd", "pgsteal_direct")
MEMORY = ("anon", "file", "file_dirty", "file_writeback", "shmem", "inactive_file", "active_file", "pgscan",
          "pgsteal", "pgscan_direct", "pgsteal_direct", "pgscan_kswapd", "workingset_refault_file", "pgmajfault")


def text(path):
    try:
        with open(path) as stream:
            return stream.read()
    except OSError:
        return None


def pairs(path, wanted=None):
    body = text(path)
    if body is None:
        return None
    out = {}
    for line in body.splitlines():
        key, _, value = line.partition(" ")
        if wanted is None or key in wanted:
            out[key] = int(value)
    return out


def pressure(path):
    """Stall totals in microseconds: [some, full]."""
    body = text(path)
    if body is None:
        return None
    return [int(line.rsplit("total=", 1)[1]) for line in body.splitlines()]


def io(path):
    body = text(path)
    if body is None:
        return None
    total = {"rbytes": 0, "wbytes": 0, "rios": 0, "wios": 0}
    for line in body.splitlines():
        for field in line.split()[1:]:
            key, _, value = field.partition("=")
            if key in total:
                total[key] += int(value)
    return total


def containers():
    try:
        return {name for name in os.listdir(ROOT) if len(name) == 64}
    except OSError:
        return set()


before = containers()
started = time.monotonic()
while time.monotonic() - started < LIMIT:
    row = {"wall": time.time(), "mono": time.monotonic(), "vm": pairs("/proc/vmstat", VMSTAT),
           "vm_io_pressure": pressure("/proc/pressure/io"), "vm_memory_pressure": pressure("/proc/pressure/memory"),
           "cgroups": {}}
    for name in sorted(containers() - before):
        base = ROOT + "/" + name + "/"
        current = text(base + "memory.current")
        row["cgroups"][name[:12]] = {
            "memory_current": int(current) if current else None,
            "memory": pairs(base + "memory.stat", MEMORY),
            "events": pairs(base + "memory.events"),
            "io": io(base + "io.stat"),
            "io_pressure": pressure(base + "io.pressure"),
            "memory_pressure": pressure(base + "memory.pressure"),
            "cpu": pairs(base + "cpu.stat", ("usage_usec", "nr_throttled", "throttled_usec")),
        }
    sys.stdout.write(json.dumps(row) + "\n")
    sys.stdout.flush()
    time.sleep(0.1)
