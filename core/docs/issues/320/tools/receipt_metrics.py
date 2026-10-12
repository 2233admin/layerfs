"""Issue 320: the metrics table of one fs-bench-pro Workspace receipt, or two side by side.

usage: receipt_metrics.py <receipt.json> [<after-receipt.json>] [--units N] [--json | --markdown]

Reads only. Every number is a difference of two original daemon snapshots that the
receipt already carries: the snapshot of the measured interval's first control
call (`phase_counts[0].before_identity`) and of its last (`end_identity`). The
field order of each array is the one pinned in
core/benchmark/cluster-two/cells/counts.py; the mapping to the metrics table of
docs/general/benchmark_instruction.md is in ../RECEIPT-FIELD-MAPPING.md.

Times are the daemon's own inclusive observations (owner wait and service per
class, statement elapsed per family). They are diagnostic, not exclusive CPU.
`--units` divides every count by a unit of work (steps, files); without it the
number of acknowledged Commits is used when the receipt has a history.
"""
import json
import sys

CLASSES = ("Read", "Mutation", "Capture", "Lifecycle", "OperationRecord", "Source")
FAMILIES = ("Startup", "Begin", "Commit", "Rollback", "Workspace", "Inode", "DirectoryEntry", "Payload",
            "Frontier", "Capture", "OperationRecord", "Lease", "Explain", "Reclaim")
STATEMENT = ("attempts", "executions", "rows_returned", "rows_changed", "direct_rows_changed",
             "returned_blob_bytes", "returned_value_bytes", "vm_steps", "fullscan_steps", "sorts",
             "autoindex_rows", "reprepares", "bound_bytes", "sql_bytes", "statement_memory_samples",
             "statement_memory_sample_bytes", "elapsed_ns")
OPCODES = ("Lookup", "Forget", "BatchForget", "Getattr", "Setattr", "Readlink", "Mknod", "Mkdir", "Unlink",
           "Rmdir", "Symlink", "Rename", "Link", "Open", "Read", "Write", "Flush", "Release", "Fsync",
           "Opendir", "Readdir", "Readdirplus", "Releasedir", "Fsyncdir", "Statfs", "Setxattr", "Getxattr",
           "Listxattr", "Removexattr", "Access", "Create", "Getlk", "Setlk", "Bmap", "Ioctl", "Poll",
           "Fallocate", "Lseek", "CopyFileRange")
READER = ("stopping", "poisoned", "readers", "quarantined", "waiting", "assigned", "leased", "outstanding",
          "peak_outstanding", "grants", "queue_wait_ns", "maximum_queue_wait_ns", "scheduler_bytes")
STORE = ("object_batches", "object_ids", "length_batches", "length_ids", "serial_reservations")
CACHE = ("cache_hits", "cache_misses", "upstream_batches", "authenticated_bytes", "evictions",
         "charged_cache_bytes", "cached_objects")
MOUNT = ("received", "admitted", "queued", "running", "parked", "retained", "owned_input_bytes", "future_bytes",
         "receive_units", "completed", "steps", "wakes", "terminal")
CONSTRUCTION = ("inode_rows", "entry_rows", "inode_pages", "entry_pages", "change_pages", "largest_page",
                "parent_points", "base_lookups", "headers_written", "headers_dropped", "values_written",
                "fresh_serials", "tombstones_skipped", "files_constructed", "files_unchanged", "symlinks",
                "metadata_built", "metadata_patched", "record_jobs", "header_opens", "header_rows", "header_points",
                "change_opens", "change_rows", "change_points", "value_opens", "value_rows", "value_points",
                "fresh_opens", "fresh_rows", "fresh_points")
GLOBAL_SQL = ("statements", "vm_steps", "fullscan_steps", "sorts", "autoindex_rows", "reprepares", "returned_rows",
              "bound_bytes", "statement_ns", "commit_ns", "transactions", "write_transactions", "write_commits",
              "commits", "read_snapshots", "rollbacks", "transaction_ns", "read_snapshot_ns")


def call_of(row):
    """(control channel scope, call number): one daemon serves several channels."""
    identity = json.loads(row["call"]) if "call" in row else row["identity"]
    return (tuple(identity[1]), identity[2])


def endpoints(receipt):
    """The measured interval's first and last control call, in either receipt layout."""
    counted = receipt.get("phase_counts")
    if isinstance(counted, list) and counted and counted[0].get("status") == "AVAILABLE":
        first, last = counted[0]["before_identity"], counted[0]["end_identity"]
    elif isinstance(counted, dict) and "endpoints" in counted:
        first, last = counted["endpoints"]["before"]["identities"][0], counted["endpoints"]["end"]["identities"][-1]
    else:
        return None
    return (tuple(first[1]), first[2]), (tuple(last[1]), last[2])


def series(receipt, name):
    value = receipt["observations"].get(name, {}).get("value")
    if isinstance(value, dict):
        value = value.get("snapshots")
    return value or []


def at(receipt, name, call, index=0, section=None):
    for row in series(receipt, name):
        if call_of(row) == call and row.get("index", 0) == index and (section is None or row.get("section") == section):
            return row["values"]
    return None


def delta(receipt, name, before, end, index=0, section=None):
    first, last = at(receipt, name, before, index, section), at(receipt, name, end, index, section)
    if first is None or last is None:
        return None
    return [right - left for left, right in zip(first, last)]


def summed(receipt, name):
    """Per-call arrays (one Commit each): the sum over the measured interval's calls."""
    rows = [row["values"] for row in series(receipt, name)]
    return [sum(column) for column in zip(*rows)] if rows else None


def metrics(receipt, units=None):
    phases = dict(receipt.get("phases") or {})
    if isinstance(receipt.get("performance_external_wall_ns"), int):
        phases["elapsed_ns"] = receipt["performance_external_wall_ns"]
    counted = receipt.get("phase_counts")
    interval = counted[0] if isinstance(counted, list) and counted else None
    ends = endpoints(receipt)
    out = {"case": receipt.get("case"), "source": (receipt.get("source_commit") or "")[:9],
           "status": receipt.get("status"), "functional": receipt.get("functional_status"),
           "proof": receipt.get("proof_status"), "cleanup": receipt.get("cleanup"),
           "phases": phases, "counts": receipt.get("counts")}
    commits = len((receipt.get("history") or {}).get("commits") or [])
    if not commits:
        commits = sum(1 for row in (counted or {}).get("correlation", []) if row.get("event") == "commit") if isinstance(counted, dict) else 0
    out["units"] = units or commits or 1
    out["commits"] = commits
    observed = receipt.get("observations") or {}
    for key in ("store_logical_bytes", "store_allocated_bytes", "overlay_logical_bytes", "overlay_allocated_bytes",
                "daemon_vmhwm_bytes"):
        out[key] = (observed.get(key) or {}).get("value")
    if not ends:
        out["interval"] = "UNAVAILABLE"
        return out
    before, end = ends
    out["interval"] = [before[1], end[1]]
    if interval:
        raw = interval["raw"]
        out["opcodes"] = {name: count for name, count in zip(OPCODES, raw["opcodes"]["by_opcode"]) if count}
        out["disposition"] = raw["opcodes"]["disposition"]
        out["completed"] = interval["adjusted"]["completed"]
    else:
        # Several kernel connections: the receipt keeps per-connection request totals only.
        out["connections"] = [row["requests"] for row in counted.get("kernel_connections", [])]
    owner = delta(receipt, "owner_work", before, end)
    if owner:
        out["owner_wait_ns"] = dict(zip(CLASSES, owner[20:26]))
        out["owner_service_ns"] = dict(zip(CLASSES, owner[26:32]))
        out["owner_raw_completed"] = dict(zip(CLASSES, owner[14:20]))
        out["maintenance"] = {"jobs": owner[9], "rows": owner[10], "data_bytes": owner[12], "ns": owner[13]}
        peak = at(receipt, "owner_work", end)
        out["peak_queued"] = peak[6]
    for label, section in (("sql_foreground", 2), ("sql_maintenance", 3)):
        families = {}
        for index, family in enumerate(FAMILIES):
            values = delta(receipt, "statement_work", before, end, index, section)
            if values and values[0]:
                families[family] = dict(zip(STATEMENT, values))
        out[label] = families
    for name, fields, label in (("reader_work", READER, "reader"), ("store_work", STORE, "store"),
                                ("cache_work", CACHE, "cache"), ("mount_work", MOUNT, "mount")):
        values = delta(receipt, name, before, end)
        if values:
            out[label] = dict(zip(fields, values))
    construction = summed(receipt, "construction_work")
    if construction:
        out["construction"] = dict(zip(CONSTRUCTION, construction))
    writer = [row for row in series(receipt, "global_sql_work")
              if row.get("available") and row.get("section") == 13]
    if writer:
        first = next((row["values"] for row in writer if call_of(row) == before), None)
        last = next((row["values"] for row in writer if call_of(row) == end), None)
        if first and last:
            out["global_sql_writer"] = dict(zip(GLOBAL_SQL, (b - a for a, b in zip(first, last))))
    return out


def ms(value):
    return "n/a" if value is None else f"{value / 1e6:,.1f} ms"


def table(row):
    units = row["units"]
    per = lambda value: f"{value:,} ({value / units:,.1f}/unit)"
    lines = [("Case / source", f"{row['case']} at {row['source']}"),
             ("Status / functional / proof / cleanup", f"{row['status']} / {row['functional']} / {row['proof']} / {row['cleanup']}"),
             ("Units of work", f"{units} (acknowledged Commits: {row['commits']})")]
    phases = row["phases"]
    for key in ("command_ns", "commit_ns", "mount_ns", "unmount_ns", "elapsed_ns"):
        if key in phases and isinstance(phases[key], int):
            lines.append((key[:-3].capitalize() + " time", f"{ms(phases[key])}; {phases[key] / units / 1e6:,.2f} ms/unit"))
    if row.get("interval") == "UNAVAILABLE":
        lines.append(("Daemon counts", "UNAVAILABLE"))
        return lines
    counts = row["counts"]
    lines.append(("Requests / owner jobs / statements", f"{per(counts['requests'])} / {per(counts['owner_jobs'])} / {per(counts['statements'])}"))
    if "opcodes" in row:
        lines.append(("Requests by opcode", ", ".join(f"{name} {count:,}" for name, count in sorted(row["opcodes"].items(), key=lambda item: -item[1]))))
        lines.append(("Disposition", ", ".join(f"{name} {count:,}" for name, count in row["disposition"].items() if count)))
        lines.append(("Owner jobs by class", ", ".join(f"{name} {count:,}" for name, count in row["completed"].items() if count)))
    else:
        lines.append(("Requests by kernel connection", ", ".join(f"{count:,}" for count in row.get("connections", []))))
        if "owner_raw_completed" in row:
            lines.append(("Owner jobs by class (raw, observer included)", ", ".join(f"{name} {count:,}" for name, count in row["owner_raw_completed"].items() if count)))
    if "owner_service_ns" in row:
        service, wait = row["owner_service_ns"], row["owner_wait_ns"]
        lines.append(("Owner service by class", ", ".join(f"{name} {ms(value)}" for name, value in service.items() if value)
                      + f"; total {ms(sum(service.values()))}"))
        lines.append(("Owner queue wait by class", ", ".join(f"{name} {ms(value)}" for name, value in wait.items() if value)
                      + f"; total {ms(sum(wait.values()))}; peak queued {row['peak_queued']}"))
        measured = sum(phases.get(key, 0) or 0 for key in ("command_ns", "commit_ns"))
        lines.append(("Command + Commit minus owner wait and service", ms(measured - sum(service.values()) - sum(wait.values()))))
        m = row["maintenance"]
        lines.append(("Maintenance in the interval", f"jobs {m['jobs']:,}, rows {m['rows']:,}, {ms(m['ns'])}"))
    for label in ("sql_foreground", "sql_maintenance"):
        families = row.get(label) or {}
        total = lambda key: sum(family[key] for family in families.values())
        if families:
            lines.append((label + " totals", f"statements {total('attempts'):,}, executions {total('executions'):,}, VM steps {total('vm_steps'):,}, "
                          f"{ms(total('elapsed_ns'))}; scans {total('fullscan_steps')}, sorts {total('sorts')}, auto-index {total('autoindex_rows')}, re-prepares {total('reprepares')}"))
            for name, family in sorted(families.items(), key=lambda item: -item[1]["elapsed_ns"]):
                lines.append(("  " + name, f"statements {family['attempts']:,}, executions {family['executions']:,}, VM steps {family['vm_steps']:,}, "
                              f"rows returned {family['rows_returned']:,}, changed {family['rows_changed']:,}, {ms(family['elapsed_ns'])}, "
                              f"{family['elapsed_ns'] / family['attempts'] / 1e3:,.1f} us each"))
    if "reader" in row:
        reader, store, cache = row["reader"], row.get("store", {}), row.get("cache", {})
        lines.append(("Store reader", f"grants {reader['grants']:,}, wait {ms(reader['queue_wait_ns'])}; object batches {store.get('object_batches')}, ids {store.get('object_ids')}; "
                      f"cache hits {cache.get('cache_hits')}, misses {cache.get('cache_misses')}, evictions {cache.get('evictions')}"))
    if "mount" in row:
        mount = row["mount"]
        lines.append(("Mount dispatch", f"completed {mount['completed']:,}, steps {mount['steps']:,}, wakes {mount['wakes']:,}"))
    if "construction" in row:
        c = row["construction"]
        lines.append(("Construction (sum of Commits)", ", ".join(f"{key} {c[key]:,}" for key in
                      ("inode_rows", "entry_rows", "inode_pages", "entry_pages", "change_pages", "parent_points", "base_lookups",
                       "headers_written", "values_written", "fresh_serials", "files_constructed", "files_unchanged",
                       "metadata_built", "metadata_patched", "record_jobs", "header_points", "change_points", "value_points", "fresh_points"))))
    if "global_sql_writer" in row:
        g = row["global_sql_writer"]
        lines.append(("Global Store writer", f"statements {g['statements']:,}, VM steps {g['vm_steps']:,}, transactions {g['transactions']:,}, "
                      f"write commits {g['write_commits']:,}, statement {ms(g['statement_ns'])}, commit {ms(g['commit_ns'])}"))
    lines.append(("Store logical / allocated bytes", f"{row['store_logical_bytes']:,} / {row['store_allocated_bytes']:,}"))
    lines.append(("Overlay logical / allocated bytes", f"{row['overlay_logical_bytes']:,} / {row['overlay_allocated_bytes']:,}"))
    lines.append(("Daemon peak resident memory", f"{row['daemon_vmhwm_bytes']:,}" if row["daemon_vmhwm_bytes"] else "UNAVAILABLE"))
    return lines


def report(rows):
    """The before/after table of issue 320 section 8, as Markdown. One or two receipts."""
    def cells(row):
        units, phases = row["units"], row["phases"]
        time = lambda key: (f"{phases[key] / 1e6:,.1f} ms; {phases[key] / units / 1e6:,.2f} ms/unit"
                            if isinstance(phases.get(key), int) else "n/a")
        if row.get("interval") == "UNAVAILABLE":
            unavailable = "UNAVAILABLE (no daemon counters)"
            return [f"{row['functional']} / {row['proof']} ({row['status']})", time("command_ns"), time("commit_ns"), "n/a",
                    f"{time('mount_ns')} / {time('unmount_ns')}"] + [unavailable] * 8 + [
                    f"{row['store_logical_bytes']:,} / {row['store_allocated_bytes']:,}", "n/a", "UNAVAILABLE"]
        service, wait = row.get("owner_service_ns", {}), row.get("owner_wait_ns", {})
        fg = row.get("sql_foreground", {})
        total = lambda key: sum(family[key] for family in fg.values())
        measured = sum(phases.get(key, 0) or 0 for key in ("command_ns", "commit_ns"))
        classes = row.get("completed") or row.get("owner_raw_completed") or {}
        opcodes = (", ".join(f"{name} {count:,}" for name, count in sorted(row["opcodes"].items(), key=lambda item: -item[1])[:8])
                   if "opcodes" in row else "per connection: " + ", ".join(f"{count:,}" for count in row.get("connections", [])))
        reader, store, m = row.get("reader", {}), row.get("store", {}), row.get("maintenance", {})
        return [f"{row['functional']} / {row['proof']} ({row['status']})", time("command_ns"), time("commit_ns"),
                (f"{phases['elapsed_ns'] / 1e6:,.1f} ms" if isinstance(phases.get("elapsed_ns"), int) else "n/a"),
                f"{time('mount_ns')} / {time('unmount_ns')}",
                f"{row['counts']['requests']:,}: {opcodes}",
                f"{row['counts']['owner_jobs']:,}: " + ", ".join(f"{name} {count:,}" for name, count in classes.items() if count),
                f"{row['counts']['statements']:,} / {total('executions'):,} raw executions / {total('vm_steps'):,} VM steps",
                f"{sum(service.values()) / 1e6:,.1f} ms / {sum(wait.values()) / 1e6:,.1f} ms",
                f"{(measured - sum(service.values()) - sum(wait.values())) / 1e6:,.1f} ms",
                f"{reader.get('grants', 0):,} grants; {store.get('object_batches', 0):,} batches",
                f"{m.get('jobs', 0):,} jobs, {m.get('rows', 0):,} rows",
                f"{total('fullscan_steps')} / {total('sorts')} / {total('autoindex_rows')} / {total('reprepares')}",
                f"{row['store_logical_bytes']:,} / {row['store_allocated_bytes']:,}",
                f"{row['overlay_logical_bytes']:,} / {row['overlay_allocated_bytes']:,}",
                f"{row['daemon_vmhwm_bytes']:,}" if row["daemon_vmhwm_bytes"] else "UNAVAILABLE"]
    names = ["Functional / proof status", "Command time, total and per unit", "Commit time, total and per unit",
             "Elapsed time (concurrent cases)", "Mount / unmount time", "Requests, by opcode", "Owner jobs, by class",
             "Statements / executions / VM steps", "Owner service time / queue wait", "Command and Commit time outside the owner",
             "Store reader grants and batches", "Maintenance jobs during the interval",
             "Scans / sorts / auto-indexes / re-prepares (overlay, foreground)", "Store logical / allocated bytes",
             "Overlay logical / allocated bytes", "Daemon peak memory"]
    columns = [cells(row) for row in rows]
    head = f"`{rows[0]['case']}`, {rows[0]['units']} units; " + "; ".join(("before" if i == 0 else "after") + f" at `{row['source']}`" for i, row in enumerate(rows))
    lines = [head, "", "| Measure | " + " | ".join(["Before", "After"][:len(rows)]) + " |", "| --- | " + " | ".join(["---:"] * len(rows)) + " |"]
    for index, name in enumerate(names):
        lines.append(f"| {name} | " + " | ".join(column[index] for column in columns) + " |")
    return "\n".join(lines)


def main():
    arguments = [value for value in sys.argv[1:] if not value.startswith("--")]
    units = int(sys.argv[sys.argv.index("--units") + 1]) if "--units" in sys.argv else None
    if units is not None:
        arguments.remove(str(units))
    rows = [metrics(json.load(open(path)), units) for path in arguments]
    if "--json" in sys.argv:
        print(json.dumps(rows, indent=1))
        return
    if "--markdown" in sys.argv:
        print(report(rows))
        return
    tables = [table(row) for row in rows]
    if len(tables) == 1:
        for name, value in tables[0]:
            print(f"{name}: {value}")
        return
    after = dict(tables[1])
    for name, value in tables[0]:
        print(f"{name}\n  before: {value}\n  after:  {after.get(name, 'n/a')}")


if __name__ == "__main__":
    main()
