"""Status: Current diagnostic campaign tooling; SDK/daemon operation derivations."""
import math
import statistics
from collections import defaultdict
from evidence import compact, iso, numeric, stamp

PUBLIC = {"project.init", "project.list_branches", "branch.fork", "branch.list_commits",
          "branch.diff_commits", "branch.diff_branches", "branch.merge", "branch.publish",
          "sandbox.create", "sandbox.mount", "sandbox.exec", "sandbox.status", "sandbox.commit",
          "sandbox.unmount", "sandbox.close", "fs.read", "fs.list", "fs.stat", "fs.grep", "fs.glob",
          "fs.diff_files", "fs.blame", "fs.write", "fs.edit", "fs.apply", "fs.mkdir", "fs.rm",
          "fs.cp", "fs.mv"}


def family(method):
    if method and method.startswith("operator."):
        return "operator"
    if method == "sandbox.service" or (method and method.startswith("internal.")):
        return "internal-service"
    return "public" if method in PUBLIC else "unclassified"


def statistics_ms(values):
    values = sorted(value for value in values if numeric(value) and value >= 0)
    return {"duration_count": len(values), "median_ms": statistics.median(values) if values else None,
            "p95_ms": values[math.ceil(.95 * len(values)) - 1] if values else None,
            "max_ms": max(values) if values else None}


def role(ev, call):
    metadata = ev.agents.get(call["_agent"], {})
    return metadata.get("role"), metadata.get("lane")


def commit_kind(call, result, error):
    if call.get("method") != "sandbox.commit":
        return None
    if call.get("code") == "Conflict" or error.get("code") == "Conflict":
        return "conflict"
    kind = result.get("kind") if isinstance(result, dict) else call.get("kind")
    if kind == "UpToDate":
        return "up-to-date"
    if kind == "Committed":
        if not isinstance(result, dict) or "merged" not in result:
            return "committed-merge-status-unavailable"
        return "merged" if result["merged"] is not None else "plain"
    return "other-refusal-or-unknown" if call.get("ok") is False else None


def operation_tables(ev):
    groups = defaultdict(list)
    steps, refusals, commits, merges, publishes, conflicts, generations, phases, phase_samples = [], [], [], [], [], [], [], [], defaultdict(list)
    resolutions = ev.rows("resolutions")
    resolutions_by_call = defaultdict(list)
    for row in resolutions:
        if row.get("traceId"):
            resolutions_by_call[row["traceId"]].append(row)
    for call in ev.calls:
        receipt, result, error, args = ev.details(call)
        result_dict = result if isinstance(result, dict) else {}
        detail = error.get("detail") if isinstance(error.get("detail"), dict) else {}
        agent = call["_agent"]
        worker_role, lane = role(ev, call)
        method = call.get("method")
        for dimension, group in [("overall", "all"), ("agent", agent), ("lane", lane)]:
            groups[(dimension, group, family(method), method)].append(call)
        outcome = call.get("code") if call.get("ok") is False else result_dict.get("kind", call.get("kind"))
        committed = result_dict.get("commit")
        commit_id = committed.get("id") if isinstance(committed, dict) else committed or call.get("commit")
        steps.append({"trace_id": call["id"], "agent": agent, "role": worker_role, "lane": lane,
                      "step": call.get("step"), "method": method, "class": family(method),
                      "start": call.get("start"), "end": iso(call["_end"]), "ms": call["_duration"],
                      "ok": call.get("ok"), "outcome": outcome, "args": args,
                      "commit": commit_id, "sizes": call.get("sizes"),
                      "receipt": receipt.get("_source"), "trace_source": call["_source"]})
        if call.get("ok") is False:
            resolved = resolutions_by_call.get(call["id"], [])
            refusals.append({"trace_id": call["id"], "agent": agent, "role": worker_role, "lane": lane,
                             "step": call.get("step"), "method": method,
                             "code": error.get("code", call.get("code")),
                             "message": error.get("message", call.get("message")),
                             "detail": error.get("detail"), "handling": resolved or None})
        if method == "sandbox.commit":
            merged = result_dict.get("merged")
            explicit_moved = receipt.get("headMovedSinceMount")
            # The result discriminant describes the Commit's own head comparison.
            # A preceding status is not evidence that it stayed fixed until Commit.
            if isinstance(explicit_moved, bool):
                moved = explicit_moved
            elif merged is not None or result_dict.get("displacedHead") is not None or outcome == "Conflict":
                moved = True
            elif (result_dict.get("kind") in ("Committed", "UpToDate") and
                  "merged" in result_dict and result_dict["merged"] is None and args.get("force") is False):
                moved = False
            else:
                moved = None
            commits.append({"trace_id": call["id"], "agent": agent, "lane": lane,
                            "classification": commit_kind(call, result, error),
                            "head_moved_since_mount": moved, "commit": commit_id,
                            "merged": merged, "displaced_head": result_dict.get("displacedHead"),
                            "lww": result_dict.get("lww"), "lww_truncated": result_dict.get("lwwTruncated"),
                            "outcome": outcome, "source": receipt.get("_source", call["_source"])})
        if method in ("branch.merge", "branch.publish", "branch.fork"):
            row = {"trace_id": call["id"], "time": call.get("start"), "agent": agent, "lane": lane,
                   "step": call.get("step"), "args": args, "outcome": outcome,
                   "ms": call["_duration"], "result": result, "error": error or None,
                   "source": receipt.get("_source", call["_source"])}
            if method == "branch.merge":
                row.update({"fast_forward": result_dict.get("fastForward"), "sources": result_dict.get("sources", detail.get("sources")),
                            "merge_base": result_dict.get("mergeBase", detail.get("mergeBase")), "head": result_dict.get("head"),
                            "lww": result_dict.get("lww", detail.get("lww")),
                            "lww_truncated": result_dict.get("lwwTruncated", detail.get("lwwTruncated")),
                            "conflicts_truncated": result_dict.get("conflictsTruncated", detail.get("conflictsTruncated"))})
                merges.append(row)
                generations.append(dict(row, operation="merge"))
            elif method == "branch.publish":
                row.update({"published_layer": result_dict.get("publishedLayer", call.get("layer")),
                            "overwrote": result_dict.get("overwrote")})
                publishes.append(row)
            else:
                generations.append(dict(row, operation="fork"))
        if outcome == "Conflict":
            paths = detail.get("conflicts")
            if not isinstance(paths, list) or not paths:
                paths = [{"path": None, "kind": None}]
            for conflict in paths:
                path = conflict.get("path")
                matching = [r for r in resolutions_by_call.get(call["id"], [])
                            if r.get("path") is None or r.get("path") == path]
                resolution = matching[0] if len(matching) == 1 else {}
                resolved_at = stamp(resolution.get("resolvedAt"))
                conflicts.append({"trace_id": call["id"], "time": call.get("start"), "agent": agent,
                                  "lane": lane, "method": method, "args": args, "path": path,
                                  "kind": conflict.get("kind"), "blocks": conflict.get("blocks"),
                                  "hunks_omitted": conflict.get("hunksOmitted"),
                                  "conflicts_truncated": detail.get("conflictsTruncated"),
                                  "resolution": resolution.get("resolution"), "resolver": resolution.get("resolver"),
                                  "resolved_at": resolution.get("resolvedAt"),
                                  "resolution_ms": (resolved_at - call["_end"]) * 1000
                                  if resolved_at is not None and call["_end"] is not None and resolved_at >= call["_end"] else None,
                                  "resolution_commits": resolution.get("commits"),
                                  "source": receipt.get("_source", call["_source"]),
                                  "resolution_source": resolution.get("_source")})
        for exchange, daemon in enumerate(call.get("daemon", [])):
            if daemon.get("diagnosticError"):
                ev.issue("daemon-diagnostic-error", call["_source"], compact(daemon["diagnosticError"]))
            def walk(nodes, parent="", index_path=""):
                for index, node in enumerate(nodes):
                    phase_path = parent + "/" + str(node.get("name", "unnamed"))
                    occurrence = index_path + "/" + str(index)
                    duration = node.get("ms")
                    duration = duration if numeric(duration) and duration >= 0 else None
                    phases.append({"trace_id": call["id"], "agent": agent, "lane": lane, "method": method,
                                   "exchange": exchange, "phase_path": phase_path, "occurrence": occurrence,
                                   "ms": duration, "outcome": node.get("outcome"),
                                   "incomplete": node.get("incomplete"), "omitted": node.get("omitted"),
                                   "accounting": "inclusive node; never added to parent/child/sibling paths",
                                   "source": call["_source"]})
                    phase_samples[(method, phase_path)].append(duration)
                    walk(node.get("children", []), phase_path, occurrence)
            walk(daemon.get("timing", []))
    methods = [{"dimension": key[0], "group": key[1], "class": key[2], "method": key[3],
                "count": len(rows), **statistics_ms([row["_duration"] for row in rows]),
                "timing_coverage": "complete-observed-calls" if all(row["_duration"] is not None for row in rows) else "partial"}
               for key, rows in sorted(groups.items(), key=lambda item: str(item[0]))]
    phase_summary = [{"method": key[0], "phase_path": key[1], "sample_count": len(values),
                      **statistics_ms(values), "aggregation": "same phase path samples only; no span sums"}
                     for key, values in sorted(phase_samples.items())]
    refusal_groups = defaultdict(int)
    commit_groups = defaultdict(int)
    for row in refusals:
        refusal_groups[(row["agent"], row["lane"], row["method"], row["code"])] += 1
    for row in commits:
        commit_groups[(row["agent"], row["lane"], row["classification"], row["head_moved_since_mount"])] += 1
    return {"methods": methods, "steps": steps, "refusals": refusals,
            "refusal-summary": [{"agent": k[0], "lane": k[1], "method": k[2], "code": k[3], "count": n}
                                for k, n in sorted(refusal_groups.items(), key=lambda x: str(x[0]))],
            "commit-results": commits,
            "commit-summary": [{"agent": k[0], "lane": k[1], "classification": k[2], "head_moved_since_mount": k[3], "count": n}
                               for k, n in sorted(commit_groups.items(), key=lambda x: str(x[0]))],
            "merges": merges, "publishes": publishes, "conflicts": conflicts,
            "generations": generations, "phases": phases, "phase-summary": phase_summary}
