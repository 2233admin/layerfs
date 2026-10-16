"""Status: Current diagnostic campaign tooling; explicitly labeled SDK custody spans."""
from collections import defaultdict
from evidence import iso, stamp
from operations import role


def summarize_intervals(intervals, start, end):
    """Half-open intervals, grouped equal boundaries; no artificial endpoint peaks."""
    if start is None or end is None or end <= start:
        return {"max": None, "average": None, "window_seconds": None, "active_seconds": None}
    events = defaultdict(int)
    for a, b in intervals:
        a, b = max(a, start), min(b, end)
        if b > a:
            events[a] += 1
            events[b] -= 1
    current, maximum, area, active, previous = 0, 0, 0.0, 0.0, start
    for time, delta in sorted(events.items()):
        area += current * (time - previous)
        if current:
            active += time - previous
        current += delta
        maximum = max(maximum, current)
        previous = time
    area += current * (end - previous)
    if current:
        active += end - previous
    return {"max": maximum, "average": area / (end - start), "window_seconds": end - start,
            "active_seconds": active}


def union(intervals):
    result = []
    for start, end in sorted(intervals):
        if result and start <= result[-1][1]:
            result[-1] = (result[-1][0], max(end, result[-1][1]))
        else:
            result.append((start, end))
    return result


def concurrency_tables(ev):
    window = ev.config.get("window", {})
    start, end = stamp(window.get("start")), stamp(window.get("end"))
    trace_complete = window.get("traceComplete") is True
    inventory_complete = window.get("lifecycleComplete") is True
    spans = []
    lifecycle_issues = []
    active = {"sandbox": {}, "workspace": {}}
    all_spans = {"sandbox": [], "workspace": [], "exec": []}
    saw_calls = set()
    lifecycle_events = []
    for kind, key in [("sandbox", "initialSandboxes"), ("workspace", "initialWorkspaces")]:
        initial = window.get(key)
        if not isinstance(initial, list):
            lifecycle_issues.append(f"missing declared {key} inventory")
            continue
        for identity in initial:
            if isinstance(identity, str) and start is not None:
                active[kind][identity] = (start, "initial-verified-inventory", None, None, None)
            else:
                lifecycle_issues.append(f"invalid initial {kind} identity")

    def close_span(kind, identity, at, boundary, call):
        if identity not in active[kind]:
            lifecycle_issues.append(f"{kind} close without known open: {identity}")
            return
        opened, open_boundary, trace_id, agent, lane = active[kind].pop(identity)
        if at is None or opened > at:
            lifecycle_issues.append(f"invalid {kind} clock: {identity}")
            return
        all_spans[kind].append((opened, at))
        spans.append({"kind": kind, "resource": identity, "start": iso(opened), "end": iso(at),
                      "start_boundary": open_boundary, "end_boundary": boundary,
                      "open_trace_id": trace_id, "close_trace_id": call.get("id"), "agent": agent,
                      "lane": lane, "seconds": at - opened})

    for call in ev.calls:
        receipt, result, error, args = ev.details(call)
        method = call.get("method")
        worker_role, lane = role(ev, call)
        at = call["_end"]
        if method == "sandbox.exec" and call["_start"] is not None and at is not None:
            all_spans["exec"].append((call["_start"], at))
            spans.append({"kind": "exec", "resource": call["id"], "start": iso(call["_start"]),
                          "end": iso(at), "start_boundary": "SDK trace start (millisecond wall stamp)",
                          "end_boundary": "SDK trace start + elapsed ms (API reply; not process execution extent)",
                          "open_trace_id": call["id"], "close_trace_id": call["id"],
                          "agent": call["_agent"], "lane": lane, "seconds": at - call["_start"]})
        if call.get("ok") is not True:
            if method in ("sandbox.create", "sandbox.mount", "sandbox.unmount", "sandbox.close") and call.get("code") in ("Unknown", "Failed"):
                lifecycle_issues.append(f"uncertain lifecycle {call['id']}")
            continue
        sandbox = args.get("sandbox")
        result_dict = result if isinstance(result, dict) else {}
        if method == "sandbox.create":
            identity = result if isinstance(result, str) else result_dict.get("id", result_dict.get("sandbox"))
            kind = "sandbox"
        elif method == "sandbox.mount":
            sandbox = result_dict.get("sandbox", sandbox)
            path = result_dict.get("path")
            identity = f"{sandbox}:{path}" if sandbox and path else None
            kind = "workspace"
        else:
            identity = None
            kind = None
        if kind:
            if identity is None or at is None:
                lifecycle_issues.append(f"missing {method} full result/clock for {call['id']}")
            else:
                lifecycle_events.append((at, "open", kind, identity, "successful SDK call reply (start+elapsed)", call))
                saw_calls.add(call["id"])
        elif method == "sandbox.unmount":
            identity = f"{sandbox}:{args.get('path')}" if sandbox and args.get("path") else None
            lifecycle_events.append((at, "close", "workspace", identity, "successful SDK unmount reply (terminal custody)", call))
        elif method == "sandbox.close":
            identity = result_dict.get("id", sandbox)
            lifecycle_events.append((at, "close", "sandbox", identity, "successful SDK close reply (terminal custody)", call))
        elif method == "sandbox.service":
            identity = result if isinstance(result, str) else result_dict.get("id", result_dict.get("sandbox"))
            if identity:
                lifecycle_events.append((at, "observe", "sandbox", identity, "service discovery reply", call))

    # Optional explicit lifecycle events describe observer service or externally created owners.
    # They are used only when no SDK create/mount receipt covers the same trace id.
    for event in ev.rows("lifecycleEvents"):
        kind, identity, action, at = event.get("kind"), event.get("resource"), event.get("action"), stamp(event.get("at"))
        if event.get("traceId") in saw_calls:
            continue
        if kind not in active or not isinstance(identity, str) or at is None:
            lifecycle_issues.append("invalid explicit lifecycle event")
            continue
        lifecycle_events.append((at, action, kind, identity, event.get("boundary", "explicit retained lifecycle event"),
                                 {"id": event.get("traceId"), "_agent": event.get("agent"), "_lane": event.get("lane")}))
    for at, action, kind, identity, boundary, call in sorted(lifecycle_events, key=lambda event: (
            event[0] is None, event[0] or 0, {"close": 0, "open": 1, "observe": 2}.get(event[1], 3))):
        if at is None:
            lifecycle_issues.append(f"missing lifecycle clock: {identity}")
        elif action == "open" and identity not in active[kind]:
            metadata = ev.agents.get(call.get("_agent"), {})
            active[kind][identity] = (at, boundary, call.get("id"), call.get("_agent"), call.get("_lane", metadata.get("lane")))
        elif action == "close":
            close_span(kind, identity, at, boundary, call)
        elif action == "observe" and identity in active[kind]:
            pass
        else:
            lifecycle_issues.append(f"duplicate open/unknown lifecycle: {identity} {action}")

    for kind, key in [("sandbox", "finalSandboxes"), ("workspace", "finalWorkspaces")]:
        final = window.get(key)
        if not isinstance(final, list):
            lifecycle_issues.append(f"missing declared {key} inventory")
        elif set(final) != set(active[kind]):
            lifecycle_issues.append(f"{key} does not match observed lifecycle endpoints")
        for identity in list(active[kind]):
            if end is None:
                lifecycle_issues.append(f"unclosed {kind} with unknown end")
            else:
                close_span(kind, identity, end, "verified final-inventory observation; right-censored", {})
    fatal_trace = any(i["kind"] in ("invalid-jsonl", "conflicting-trace-id", "invalid-trace-clock", "missing-trace-id", "unknown-receipt-trace", "unjoined-receipt", "conflicting-receipt") for i in ev.issues)
    output = []
    for kind, label in [("sandbox", "known-open Sandbox SDK custody"),
                        ("workspace", "known-mounted Workspace SDK custody"),
                        ("exec", "overlapping sandbox.exec API calls")]:
        complete = trace_complete and not fatal_trace and start is not None and end is not None and end > start
        if kind != "exec":
            complete = complete and inventory_complete and not lifecycle_issues
        summary = summarize_intervals(all_spans[kind], start, end) if complete else {
            "max": None, "average": None, "window_seconds": end - start if end and start else None,
            "active_seconds": None}
        output.append({"metric": kind, "label": label, **summary, "status": "observed-complete" if complete else "unavailable",
                       "reason": None if complete else lifecycle_issues or ["trace/window completeness not established"],
                       "interval_count_observed": len(all_spans[kind]),
                       "boundary_contract": "half-open UTC SDK intervals; lifecycle starts at successful reply; no kernel/process exact-time claim"})
    role_intervals = defaultdict(list)
    agent_rows = []
    for identity in sorted(set(ev.agents) | {call["_agent"] for call in ev.calls}):
        meta = ev.agents.get(identity, {})
        calls = [call for call in ev.calls if call["_agent"] == identity]
        a, b = stamp(meta.get("started")), stamp(meta.get("ended"))
        if meta.get("role") in ("W1", "W2", "I1", "I2", "P1") and a is not None and b is not None and b >= a:
            role_intervals[meta["role"]].append((a, b))
        distinct_commits = {call.get("commit") for call in calls if call.get("commit") and call.get("kind") != "UpToDate"}
        sandboxes = {call.get("args", {}).get("sandbox") for call in calls if call.get("args", {}).get("sandbox")}
        sandboxes.update(meta.get("sandboxes", []))
        agent_rows.append({"agent": identity, "role": meta.get("role"), "lane": meta.get("lane"),
                           "started": meta.get("started"), "ended": meta.get("ended"),
                           "observed_first_call": iso(min((c["_start"] for c in calls if c["_start"] is not None), default=None)),
                           "observed_last_reply": iso(max((c["_end"] for c in calls if c["_end"] is not None), default=None)),
                           "steps": len({c["step"] for c in calls if c.get("step")}) if calls else None,
                           "sdk_calls_observed": len(calls), "commits_observed": len(distinct_commits) if calls else None,
                           "sandboxes_observed": sorted(sandboxes) if sandboxes else None,
                           "replacement_reason": meta.get("replacementReason")})
    required_roles = ("W1", "W2", "I1", "I2", "P1")
    role_lifecycles = [meta for meta in ev.agents.values() if meta.get("role") in required_roles]
    valid_lifecycles = all(stamp(meta.get("started")) is not None and stamp(meta.get("ended")) is not None and
                           stamp(meta["ended"]) >= stamp(meta["started"]) for meta in role_lifecycles)
    roles_complete = (ev.config.get("agentRosterComplete") is True and valid_lifecycles and
                      all(r in role_intervals for r in required_roles))
    overlap = None
    if roles_complete and start is not None and end is not None:
        events = defaultdict(int)
        for intervals in role_intervals.values():
            for a, b in union(intervals):
                a, b = max(a, start), min(b, end)
                if b > a:
                    events[a] += 1
                    events[b] -= 1
        current, previous, overlap = 0, start, 0.0
        for at, delta in sorted(events.items()):
            if current == 5:
                overlap += at - previous
            current += delta
            previous = at
    output.append({"metric": "five-worker-roles", "label": "all W1/W2/I1/I2/P1 roles active by retained agent lifecycle",
                   "max": None, "average": None, "window_seconds": end - start if end and start else None,
                   "active_seconds": overlap, "status": "observed-complete" if overlap is not None else "unavailable",
                   "reason": None if overlap is not None else "complete roster and start/end boundaries for all five roles required",
                   "boundary_contract": "retained agent started/ended UTC; successors unioned per logical role"})
    for issue in lifecycle_issues:
        ev.issue("lifecycle-incomplete", "analysis-input.json/call receipts", issue)
    return {"concurrency": output, "spans": spans, "agents": agent_rows}
