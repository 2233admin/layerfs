"""Three measurement-free count profiles from retained issue319 receipts.

No application, benchmark, Docker, build or sample is launched. Numeric data
passes the original framing validator and source-pinned counter decoder. Missing
phase endpoints/telemetry stay unavailable. Every published path is relative.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[5]
RESULTS = ROOT / "benchmark-results/fs-bench-pro"
OUTPUT = ROOT / "core/docs/issues/319/checks/phase9-profiles.json"
DOC = ROOT / "core/docs/issues/319/PHASE9-PROFILES.md"
PRODUCT = "b99f79e3dd972ebd6bbd1db2fc2626d08a289e19"
sys.path.insert(0, str(ROOT / "core/benchmark/cluster-two"))
from cells import counts, runner

PINNED = {
    "core/benchmark/cluster-two/cells/counts.py": "31109b65546229b4ce1602e0a56431cbf3aecb8417e047a503b7640cad54274b",
    "core/benchmark/cluster-two/cells/runner.py": "22be2b8d179610419499d647c428891e26bd934c4e7d21ebd925b16e22260c75",
}


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def pin(path):
    return {"path": str(path.relative_to(ROOT)),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def words(value):
    require(isinstance(value, str) and len(value) == 64
            and all(char in "0123456789abcdef" for char in value), "original 256-bit identity")
    return tuple(int(value[index:index + 16], 16) for index in range(0, 64, 16))


def count_only(value):
    """Drop timing fields recursively; counts/gauges keep their named scope."""
    if isinstance(value, dict):
        return {key: count_only(item) for key, item in value.items()
                if not str(key).endswith("_ns") and key not in {"times", "time_scope"}}
    if isinstance(value, (list, tuple)):
        return [count_only(item) for item in value]
    return value


def original_events(path):
    events = [json.loads(line) for line in path.read_text().splitlines()]
    require([row["sequence"] for row in events] == list(range(1, len(events) + 1)),
            "complete ordered original runtime event transcript")
    setups = [row for row in events if row["event"] == "daemon_setup"]
    origins = [row for row in events if row["event"] == "control_origin"]
    scopes = [row for row in events if row["event"] == "observation_scope"]
    require(len(setups) == len(origins) == len(scopes) == 1, "one daemon/channel/scope required")
    daemon = words(setups[0]["fields"]["daemon_instance"])
    scope = words(scopes[0]["fields"]["scope"])
    fields = origins[0]["fields"]
    require(words(fields["scope"]) == scope and fields["control_send_records"] == 1,
            "exact scope-bound Hello origin")
    return events, daemon, scope


def phase_view(value):
    if value["status"] != "AVAILABLE":
        return {"status": "UNAVAILABLE", "reason": value.get("reason")}
    adjusted = value["adjusted"]
    result = {"status": "AVAILABLE", "scope": "Resources-adjusted daemon-shared interval",
              "before_identity": value["before_identity"], "end_identity": value["end_identity"],
              "owner_jobs": adjusted["owner"]["admitted"],
              "completed_by_class": adjusted["completed"],
              "sql_statements": sum(row["executions"] for row in adjusted["sql_foreground"]),
              "sql_vm_steps": sum(row["vm_steps"] for row in adjusted["sql_foreground"]),
              "sql_fullscan_steps": sum(row["fullscan_steps"] for row in adjusted["sql_foreground"]),
              "sql_sorts": sum(row["sorts"] for row in adjusted["sql_foreground"]),
              "observer_jobs_subtracted": value["observer"]["jobs"],
              "raw_store": value["raw"].get("store"), "raw_cache": value["raw"].get("cache"),
              "typed_status_attribution": value.get("status_state_attribution")}
    opcodes = value["raw"].get("opcodes")
    result["requests"] = sum(opcodes["by_opcode"]) if opcodes else None
    return count_only(result)



def payload_view(decoded, before_identity, end_identity):
    """Exact cumulative foreground payload subtraction, never submitted bytes."""
    before_key = (tuple(before_identity[0]), tuple(before_identity[1]), before_identity[2])
    end_key = (tuple(end_identity[0]), tuple(end_identity[1]), end_identity[2])
    require(before_key[:2] == end_key[:2] and before_key[2] < end_key[2],
            "payload endpoint daemon/scope/order mismatch")
    before, end = decoded[before_key], decoded[end_key]
    if "payload_foreground" not in before or "payload_foreground" not in end:
        return {"status":"UNAVAILABLE", "reason":"original foreground payload endpoint absent"}
    raw = counts.difference(before["payload_foreground"], end["payload_foreground"], counts.PAYLOAD)
    interval = [value for key,value in decoded.items()
                if key[:2] == before_key[:2] and before_key[2] < key[2] <= end_key[2]]
    require(len(interval) == end_key[2] - before_key[2], "exact payload interval call missing")
    require(all(value.get("observer",{}).get("completion_available")
                and "payload" in value["observer"] for value in interval),
            "exact Resources observer payload costs unavailable")
    observer = {key:sum(value["observer"]["payload"][key] for value in interval)
                for key in counts.PAYLOAD}
    adjusted = counts.difference(observer, raw, counts.PAYLOAD)
    return {"status":"AVAILABLE", "scope":"daemon-shared command through Commit reply; following Status excluded",
            "before_identity":before_key, "end_identity":end_key,
            "raw_cumulative_difference":raw, "observer_payload_cost_subtracted":observer,
            "adjusted":adjusted,
            "logical_read_local_copy_bytes":adjusted["read_local_copy_bytes"],
            "monotonicity":"all seven original u64 fields nondecreasing and unsaturated at same-scope endpoints",
            "interpretation":"logical Overlay local-byte copies, not physical IO, submitted bytes, CDC or hash work"}


def file_cost_availability(receipt):
    paths = ("core/crates/layerfs-daemon/src/application/diagnostics/schema.rs",
             "core/crates/layerfs-workspace/src/construction/namespace/inodes.rs")
    return {"status":"UNAVAILABLE",
            "chunking_bytes":"UNAVAILABLE", "hashing_bytes":"UNAVAILABLE",
            "reason":"Original numeric sections17-23 report filesystem namespace/tree counters. Per-file ConstructedFile counters are not exported or accumulated into those daemon counters; file count and producer record jobs cannot establish CDC/hash byte work.",
            "source_commit":receipt["source_commit"],
            "sources":[{"path":path,"sha256":receipt["identity"]["files"][path]} for path in paths]}


def load(tag, family, case):
    matches = list(RESULTS.glob("*-issue318-" + tag + "-run-" + family))
    require(len(matches) == 1, "one retained campaign directory")
    folder = matches[0] / case
    path = folder / "receipt.json"
    receipt = json.loads(path.read_text())
    require(receipt["product_tree"] == PRODUCT
            and receipt["identity"]["product_tree"] == PRODUCT, "retained exact product tree")
    require(receipt["case"] == case and receipt["family"] == family, "exact retained selection")
    for name, digest in PINNED.items():
        require(receipt["identity"]["files"][name] == digest, "original decoder source pin")
    event_path = folder / "runtime.events.jsonl"
    events, daemon, scope = original_events(event_path)
    selected = {"tag": tag, "family": family, "case": case, "receipt": pin(path),
                "events": pin(event_path), "source_commit": receipt["source_commit"],
                "product_tree": PRODUCT, "daemon": daemon, "scope": scope,
                "owning_status": receipt["status"],
                "functional_status": receipt.get("functional_status", "UNAVAILABLE"),
                "proof_status": receipt.get("proof_status", "UNAVAILABLE"),
                "cleanup": receipt.get("cleanup", "UNAVAILABLE"),
                "original_counts": receipt.get("counts"), "numeric_logs": [],
                "timing_comparison": "NOT_PERFORMED",
                "file_chunking_hashing":file_cost_availability(receipt)}
    logs = [folder / "daemon-logs.stderr", folder / "daemon-logs.stdout"]
    groups = {}
    for log in logs:
        if not log.exists():
            continue
        selected["numeric_logs"].append(pin(log))
        for key, group in runner.telemetry(log).items():
            require(key not in groups, "duplicate original numeric identity across streams")
            groups[key] = group
    decoded = {counts.identity(group): counts.decode(group) for group in groups.values()}
    require(len(decoded) == len(groups), "duplicate decoded daemon/scope/call identity")
    require(all(key[:2] == (daemon, scope) for key in decoded), "telemetry daemon/scope differs from runtime")
    if not groups:
        selected.update(numeric_status="UNAVAILABLE", numeric_reason="No retained daemon numeric logs; no Debug/receipt-array substitute",
                        measured_interval={"status": "UNAVAILABLE", "reason": "numeric endpoints absent"},
                        commit_only={"status": "UNAVAILABLE", "reason": "numeric endpoints absent"},
                        command_commit_without_status={"status": "UNAVAILABLE", "reason": "numeric endpoints absent"},
                        overlay_payload_foreground={"status":"UNAVAILABLE", "reason":"numeric endpoints absent"},
                        construction=[], storage=[])
        return selected, receipt, events, decoded
    correlation = counts.correlate(events, groups)
    selected["numeric_status"] = "VALIDATED"
    selected["validated_numeric_calls"] = len(decoded)
    selected["validated_operation_counts"] = dict(Counter(view["operation_tag"] for view in decoded.values()))
    originals = [item for item in receipt.get("phase_counts", [])
                 if item["label"] == "measured command and Commit"]
    require(len(originals) == 1, "one original measured command+Commit interval required")
    original = originals[0]
    reproduced = counts.phase_counts(groups, original["before_identity"], original["end_identity"],
        exclusive_observer_scope=True, label=original["label"], control_correlation=correlation)
    require(reproduced["status"] == original["status"] == "AVAILABLE", "original phase reproduction available")
    require(reproduced["adjusted"] == original["adjusted"] and reproduced["raw"] == original["raw"],
            "original count operands differ on source-pinned reproduction")
    selected["measured_interval"] = phase_view(reproduced)
    selected["measured_interval"]["scope"] = original["label"] + "; includes command, Commit and following Status"
    require(selected["measured_interval"]["owner_jobs"] == receipt["counts"]["owner_jobs"]
            and selected["measured_interval"]["sql_statements"] == receipt["counts"]["statements"]
            and selected["measured_interval"]["requests"] == receipt["counts"]["requests"], "original receipt totals differ")
    commits = [item for item in correlation if item["event"] == "commit"]
    require(len(commits) == 1 and len(commits[0]["identities"]) == 1, "one original measured Commit")
    commit_key = commits[0]["identities"][0]
    selected["command_commit_without_status"] = phase_view(counts.phase_counts(
        groups, original["before_identity"], commit_key, exclusive_observer_scope=True,
        label="command and Commit through exact Commit reply", control_correlation=correlation))
    selected["commit_only"] = {"status": "UNAVAILABLE",
        "reason": "No original numeric endpoint after command/before Commit; preceding snapshot also precedes command"}
    view = decoded[commit_key]
    selected["commit_identity"] = commit_key
    selected["overlay_payload_foreground"] = payload_view(decoded, original["before_identity"], commit_key)
    selected["construction"] = [{"identity": commit_key, "scope": "per-Commit captured namespace producer",
                                 "counts": view.get("construction", "UNAVAILABLE")}]
    selected["storage"] = [{"identity": commit_key, "scope": "original Commit-associated storage diagnostics; counts/gauges by source schema",
                            "counts": count_only(view.get("storage", "UNAVAILABLE"))}]
    selected["query_plan"] = "UNAVAILABLE: no original database EXPLAIN receipt; no SQL optimization claim"
    return selected, receipt, events, decoded


def history_profile():
    row, receipt, events, decoded = load("p319b6", "dedup_branch_history", "dedup-history-hotset-500")
    previous = 1
    control = []
    commands = []
    commits = []
    for event in events:
        fields = event["fields"]
        if event["event"] not in {"mount", "command", "commit"}:
            continue
        before, after = fields["control_send_records_before"], fields["control_send_records_after"]
        expected = {"mount": 2, "command": 0, "commit": 1}[event["event"]]
        require(before == previous and after - before == expected, "exact original history control progression")
        require(words(fields.get("scope", receipt["commit"]["fields"]["scope"])) == tuple(row["scope"]),
                "history event scope identity")
        require(fields["control_receive_records_before"] == before
                and fields["control_receive_records_after"] == after, "completed send/reply correspondence")
        previous = after
        item = {"sequence": event["sequence"], "event": event["event"], "before_records": before,
                "after_records": after, "scope": row["scope"]}
        control.append(item)
        if event["event"] == "command":
            require(fields["exit_code"] == "0", "acknowledged history command failed")
            commands.append(item)
        if event["event"] == "commit":
            require(fields["commit_kind"] == "Committed", "original successful Commit kind")
            item.update(commit_id=fields["commit_id"], root=fields["root"], parent=fields["parent"])
            commits.append(item)
    records = receipt["history"]["commits"]
    require(len(commands) == len(commits) == len(records) == 377, "377 exact retained command/Commit acknowledgements")
    require([item["commit_id"] for item in commits]
            == [record["commit"]["fields"]["commit_id"] for record in records], "history receipt ACK identities differ")
    for left, right in zip(commits, commits[1:]):
        require(right["parent"] == left["commit_id"], "exact acknowledged parent chain")
    require(previous == 380 and events[-1]["event"] == "exec_start", "original partial next command boundary")
    started = Counter(event["event"] for event in events)
    row.update(event_counts=dict(started), acknowledged_commands=len(commands), acknowledged_commits=len(commits),
        successful_control_send_records=previous, successful_control_replies=previous,
        facade_filesystem_control_calls=2 + len(commits), ordinary_command_control_records=0,
        control_origin_hello_records=1, declared_history_steps=500, unacknowledged_steps=123,
        acknowledged_history=commits, partial_next_command={"index":378,
            "events": {name: started[name] for name in ("command_admission", "exec_created", "exec_start_attempt", "exec_start")},
            "final_sequence": events[-1]["sequence"], "control_records_unchanged":380,
            "completion": "UNAVAILABLE: no streams, exit status, command reply or Commit ACK for step378"},
        interpretation="377 complete steps, an in-flight ordinary command378, and no numeric construction/SQL profile. Never promote missing outcomes.",
        query_plan="UNAVAILABLE: no original EXPLAIN/numeric database profile; no optimization claim")
    return row


def derive():
    template = pin(ROOT / "benchmark_agent_report.md")
    for name, digest in PINNED.items():
        require(pin(ROOT / name)["sha256"] == digest, "current decoder must equal original pinned source")
    exact = load("p319b6", "dedup_workspace_reuse", "dedup-workspace-exact-500")[0]
    unique = load("p319-final", "dedup_workspace_reuse", "dedup-workspace-unique-500")[0]
    edits = []
    for size in (1, 10, 100, 500):
        for kind in ("delete-middle-4k", "replace-shrink-middle-4k-to-2k"):
            tag = "p319-12" if size == 100 and kind == "delete-middle-4k" else "p319-final"
            item = load(tag, "edit_length_changing", f"{kind}-on-{size}mib-ops-1")[0]
            item.update(size_mib=size, edit_kind=kind)
            edits.append(item)
    require(all(item["construction"][0]["counts"]["record_jobs"] == 42 for item in edits),
            "single-file per-Commit construction must retain exact42 counted producer jobs")
    result = {"schema":"issue319-phase9-count-profiles-v1", "status":"COMPLETE_COUNT_ONLY",
        "decision":"Decided by agent, pending owner review: no optimization before phase8 clean-run gate",
        "scope":"Retained receipts only; zero new samples, application runs, builds, cache claims or timing comparisons",
        "report_template":template, "derivation_tool":pin(Path(__file__)),
        "numeric_sources":[pin(ROOT / name) for name in PINNED], "product_tree":PRODUCT,
        "profiles":[{"name":"exact-reuse500-vs-unique500", "rows":[exact, unique],
            "interpretation":"Identical operation/namespace counts do not imply identical storage work; compare original counted read/write work. Commit-only SQL split unavailable."},
            {"name":"delete100-vs-shrink100-and-size-scaling", "rows":edits,
             "interpretation":"Single-file construction producer remains42 across sizes; OperationRecord service jobs in command+Commit intervals grow. No database plan or causal SQL optimization claim."},
            {"name":"hotset500-partial-history", "rows":[history_profile()]}]}
    text = json.dumps(count_only(result), indent=2, sort_keys=True) + "\n"
    require(str(ROOT) not in text and str(Path.home()) not in text, "public profile contains a local absolute path")
    return count_only(result), text


def markdown(result):
    lines = ["# Phase9 retained count profiles", "", "> Status: Dated count-only diagnostic; no clean-run or release qualification.", "",
        "These profiles reuse immutable receipts at product tree `" + PRODUCT + "`. All owning statuses remain unchanged. No timings are compared. The table uses exact before-mount to Commit-reply endpoints, excluding the following Status: one owner job and one SQL statement are removed from each original reported interval. Original totals remain in JSON. Commit-only SQL attribution stays unavailable because the preceding numeric snapshot also precedes the command. Exact operands, identities and receipt/log hashes are in [JSON](checks/phase9-profiles.json).", "",
        "Decided by agent, pending owner review: retain the three profiles and do not optimize before the phase8 environment gate.", "",
        "| Case | Original status | Command+Commit requests | Owner jobs | OperationRecord jobs | SQL statements | Logical Overlay read bytes | Per-Commit producer records |", "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |"]
    for profile in result["profiles"][:2]:
        for row in profile["rows"]:
            phase = row["command_commit_without_status"]
            lines.append("| " + " | ".join(map(str, (row["case"], row["owning_status"], phase["requests"],
                phase["owner_jobs"], phase["completed_by_class"]["OperationRecord"], phase["sql_statements"],
                row["overlay_payload_foreground"].get("logical_read_local_copy_bytes", "UNAVAILABLE"),
                row["construction"][0]["counts"]["record_jobs"]))) + " |")
    exact, unique = result["profiles"][0]["rows"]
    lines += ["", "The 500-file exact/unique rows have the same request, owner, SQL and namespace-producer counts. Their original Commit-associated storage diagnostics differ: exact reports payload reads of 465,521,758B and pack writes of 8,062B; unique reports 331 B and 526,202,182B respectively. Exact same-scope foreground payload endpoints independently report 524,288,000 logical local-copy read bytes for each row; this is a measured counter difference, not an assumption from submitted bytes. All seven payload counters pass monotonicity/saturation checks, and exact Resources observer payload costs are subtracted (zero for these intervals). These remain named counts from the original schema, with physical cache/IO and residency qualification outside this profile.", "",
        "Per-file CDC chunking and hashing byte counts are unavailable: exported Content sections17-23 describe namespace/tree work, not the ConstructedFile counters. The 500-file rows and 9,647 producer record jobs are separate observations and do not supply those missing byte counters. Original schema/adapter source hashes are pinned in JSON. Every single-file edit above reports 42 namespace producer record jobs. OperationRecord service jobs cover a larger command+Commit interval and are a distinct counter. The size series does not establish a query plan or a cause from elapsed time. No original EXPLAIN receipt exists, so query-plan/optimization qualification is unavailable.", "",
        "Hotset 500 retains 377 successful ordinary commands and 377 Commit acknowledgements. The facade recorded 380 successful control sends/replies: one Hello, two mount controls and 377 Commit controls; commands contributed zero filesystem-control records. Step 378 reached exec_start without a command result or Commit acknowledgement. The remaining 123 declared steps remain unacknowledged. No daemon numeric logs were retained, so SQL, OperationRecord and construction counts are unavailable; none are inferred from nearby runs.", ""]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="read-only reproducibility check of generated artifacts")
    args = parser.parse_args()
    result, text = derive()
    doc = markdown(result)
    if args.check:
        require(OUTPUT.read_text() == text and DOC.read_text() == doc, "derived profiles differ from current retained inputs")
    else:
        with OUTPUT.open("x") as stream:
            stream.write(text)
        with DOC.open("x") as stream:
            stream.write(doc)
    print("Three count profiles validated; exact numeric identities/operands preserved; timing fields absent.")


if __name__ == "__main__":
    main()
