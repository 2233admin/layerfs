"""Kernel counts of one observed sample over its measured Commit.

usage: commit_kernel_window.py <sample-folder> <observer rows.jsonl>

Pairs a retained sample with the rows `cgroup_observer.py` wrote beside it. The two
clocks are aligned on the measured unmount: there the sampled container's file pages
fall by the Workspace's deleted overlay file. The Commit is the interval from the end
of the measured command for the receipt's Commit wall. Prints the VM's and the
container's dirty, write-back, reclaim, pressure, CPU and write counts over it.
It reads retained files only. Diagnostic: it qualifies nothing.

The fs-bench-pro harness imports `window` and `counts` (engine/io_observer.py) and
aligns the clocks directly instead; the counts are the same functions.
"""
import json, sys
from pathlib import Path


def window(rows, main, start, end, enclosing=False):
    """Observer rows of [start, end] that saw cgroup `main`.

    Inside the interval by default. With `enclosing`, from the last row at or before
    `start` to the first at or after `end`; empty when the rows do not cover both ends.
    """
    seen = [r for r in rows if main in r["cgroups"]]
    if not enclosing:
        return [r for r in seen if start <= r["wall"] <= end]
    before, after = [r for r in seen if r["wall"] <= start], [r for r in seen if r["wall"] >= end]
    if not before or not after:
        return []
    return [r for r in seen if before[-1]["wall"] <= r["wall"] <= after[0]["wall"]]


def counts(win, main):
    """VM and container counts between the first and last row of `win`."""
    first, last = win[0], win[-1]
    def d(path):
        a, b = first, last
        for p in path: a, b = a[p], b[p]
        return b - a
    c0, c1 = first["cgroups"][main], last["cgroups"][main]
    mib = lambda pages: round(pages * 4 / 1024, 1)
    return {
        "vm_free_MiB_start_min": (mib(first["vm"]["nr_free_pages"]), mib(min(r["vm"]["nr_free_pages"] for r in win))),
        "vm_dirty_max_MiB": mib(max(r["vm"]["nr_dirty"] for r in win)), "vm_writeback_max_MiB": mib(max(r["vm"]["nr_writeback"] for r in win)),
        "vm_dirty_plus_wb_max_MiB": mib(max(r["vm"]["nr_dirty"] + r["vm"]["nr_writeback"] for r in win)),
        "vm_dirty_threshold_MiB_min": mib(min(r["vm"]["nr_dirty_threshold"] for r in win)),
        "vm_bg_threshold_MiB_min": mib(min(r["vm"]["nr_dirty_background_threshold"] for r in win)),
        "vm_pgscan_kswapd": d(["vm", "pgscan_kswapd"]), "vm_pgscan_direct": d(["vm", "pgscan_direct"]),
        "vm_pgpgout_MiB": round(d(["vm", "pgpgout"]) / 1024, 1),
        "vm_io_pressure_some_ms": round((last["vm_io_pressure"][0] - first["vm_io_pressure"][0]) / 1e3, 1),
        "vm_memory_pressure_some_ms": round((last["vm_memory_pressure"][0] - first["vm_memory_pressure"][0]) / 1e3, 1),
        "ct_cpu_ms": round((c1["cpu"]["usage_usec"] - c0["cpu"]["usage_usec"]) / 1e3, 1),
        "ct_io_pressure_some_ms": round((c1["io_pressure"][0] - c0["io_pressure"][0]) / 1e3, 1),
        "ct_io_pressure_full_ms": round((c1["io_pressure"][1] - c0["io_pressure"][1]) / 1e3, 1),
        "ct_memory_pressure_some_ms": round((c1["memory_pressure"][0] - c0["memory_pressure"][0]) / 1e3, 1),
        "ct_file_dirty_max_MiB": round(max(r["cgroups"][main]["memory"]["file_dirty"] for r in win if main in r["cgroups"]) / 2**20, 1),
        "ct_file_writeback_max_MiB": round(max(r["cgroups"][main]["memory"]["file_writeback"] for r in win if main in r["cgroups"]) / 2**20, 1),
        "ct_memory_MiB_start_max": (round(c0["memory_current"] / 2**20), round(max(r["cgroups"][main]["memory_current"] for r in win if main in r["cgroups"]) / 2**20)),
        "ct_wbytes_MiB": round((c1["io"]["wbytes"] - c0["io"]["wbytes"]) / 2**20, 1),
        "ct_pgscan": c1["memory"]["pgscan"] - c0["memory"]["pgscan"], "ct_pgsteal": c1["memory"]["pgsteal"] - c0["memory"]["pgsteal"],
        "ct_events": {k: c1["events"][k] - c0["events"].get(k, 0) for k in c1["events"]},
    }


def main(argv):
    sample, rows = Path(argv[1]), [json.loads(l) for l in open(argv[2]) if l.strip()]
    ev = [json.loads(l) for l in (sample / "runtime.events.jsonl").read_text().splitlines()]
    receipt = json.loads((sample / "receipt.json").read_text())
    commit_ms = receipt["phases"]["commit_ns"] / 1e6
    # Second command's end starts the Commit; the next unmount follows the Commit's status and snapshot.
    cmds = [e for e in ev if e["event"] == "command"]
    command_end = cmds[-1]["at_ns"] / 1e9
    unmount = next(e for e in ev if e["event"] == "unmount" and e["at_ns"] / 1e9 > command_end)["at_ns"] / 1e9
    # The sampled container: the new cgroup whose file pages fall most in one step (an unmount
    # deletes the Workspace's overlay file). Other containers, such as a declared load, never do.
    def drops(name):
        series = [(r["wall"], r["cgroups"][name]["memory"]["file"]) for r in rows if name in r["cgroups"] and r["cgroups"][name]["memory"]]
        return [(series[i][0], series[i - 1][1] - series[i][1]) for i in range(1, len(series))]
    names = {name for r in rows for name in r["cgroups"]}
    main = max(names, key=lambda name: max([size for _, size in drops(name)] or [0]))
    # Each unmount is one large drop, but a drop can also be missing or extra. Take the clock offset
    # that the most (drop, unmount) pairs agree on within 0.3 s, using the measured unmount as anchor.
    unmounts = [e["at_ns"] / 1e9 for e in ev if e["event"] == "unmount"]
    large = [wall for wall, size in drops(main) if size > 300 * 2**20]
    def agreement(offset):
        return sum(any(abs(wall - (offset + at)) < 0.3 for wall in large) for at in unmounts)
    offset = max((wall - unmount for wall in large), key=agreement)  # observer wall at runtime t=0
    start, end = offset + command_end, offset + command_end + commit_ms / 1e3
    win = window(rows, main, start, end)
    out = {"sample": sample.parent.name[-60:], "commit_ms": round(commit_ms, 1), "rows": len(win),
           "unmounts_matched": f"{agreement(offset)} of {len(unmounts)}", **counts(win, main)}
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main(sys.argv)
