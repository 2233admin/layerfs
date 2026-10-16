#!/usr/bin/env python3
"""Status: Current diagnostic campaign tooling; no benchmark or release qualification.
Derive #340 REPORT tables from retained, explicitly identified evidence only.
"""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from evidence import Evidence, compact, numeric, file_sha256
from operations import operation_tables
from concurrency import concurrency_tables
from storage import storage_tables

COLUMNS = {
    "methods": "dimension group class method count duration_count median_ms p95_ms max_ms timing_coverage",
    "steps": "trace_id agent role lane step method class start end ms ok outcome args commit sizes receipt trace_source",
    "refusals": "trace_id agent role lane step method code message detail handling",
    "refusal-summary": "agent lane method code count",
    "commit-results": "trace_id agent lane classification head_moved_since_mount commit merged displaced_head lww lww_truncated outcome source",
    "commit-summary": "agent lane classification head_moved_since_mount count",
    "merges": "trace_id time agent lane step args outcome ms result error fast_forward sources merge_base head lww lww_truncated conflicts_truncated source",
    "publishes": "trace_id time agent lane step args outcome ms result error published_layer overwrote source",
    "conflicts": "trace_id time agent lane method args path kind blocks hunks_omitted conflicts_truncated resolution resolver resolved_at resolution_ms resolution_commits source resolution_source",
    "generations": "trace_id time agent lane step operation args outcome ms result error source",
    "phases": "trace_id agent lane method exchange phase_path occurrence ms outcome incomplete omitted accounting source",
    "phase-summary": "method phase_path sample_count duration_count median_ms p95_ms max_ms aggregation",
    "concurrency": "metric label max average window_seconds active_seconds status reason interval_count_observed boundary_contract",
    "spans": "kind resource start end start_boundary end_boundary open_trace_id close_trace_id agent lane seconds",
    "agents": "agent role lane started ended observed_first_call observed_last_reply steps sdk_calls_observed commits_observed sandboxes_observed replacement_reason",
    "commits": "commit agent lane trace_id branches parent secondParent root base time message logical logical_delta_from_first_parent newCanonical newStored newMetadata after_baseline cumulative_canonical cumulative_stored cumulative_metadata_pack_plus_initial_metadata order_contract sources",
    "storage-attribution": "agent lane commit_count logical_tree_bytes_sum new_canonical new_stored new_metadata_subset contract",
    "storage": "observation logical canonical stored metadata file free logical_over_canonical canonical_over_stored sqlite_overhead_file_minus_free_minus_stored physical_contract",
    "reconciliation": "counter initial acknowledged_new sqlite_overhead_delta commit_record_sum layer_record_sum predicted_final observed_final gap status contract gap_candidates",
    "dependencies": "ref_type ref commit agent lane at installation install_trace_id commit_trace_id save_commit lockfile_sha256 tree_count logical_bytes trees whole_save_new_canonical whole_save_new_stored whole_save_new_metadata_subset install_order_same_lockfile first_or_later allocation_contract source",
    "dependency-summary": "ref_type tree_count_observed logical_bytes_observed all_history_tree_count all_history_logical_bytes coverage physical_bytes_attributed_to_dependencies contract",
    "artifacts": "artifact path bytes sha256",
    "layers": "id layer logical commit parent time _source",
    "timeline": "at kind agent role lane milestone branch commit layer traceId message details source",
    "daemon-counters": "trace_id daemon scope call operation complete section counter value counter_contract source",
    "lft-operations": "run role scope name elapsed_ns success resource_status cpu_shared_ns sampled_max_rss_bytes samples gaps largest_gap_ns first_sample_ns last_sample_ns opened_ns closed_ns concurrency source clock_contract",
    "quality": "kind source detail",
}


def daemon_tables(ev):
    groups, lft = ev.decoded_daemon()
    counters = []
    for group in groups:
        for section, values in group.get("sections", {}).items():
            pairs = values.items() if isinstance(values, dict) else [(None, None)]
            for key, value in pairs:
                counters.append({"trace_id": group.get("trace"), "daemon": group.get("daemon"),
                                 "scope": group.get("scope"), "call": group.get("call"),
                                 "operation": group.get("operation"), "complete": group.get("complete"),
                                 "section": section, "counter": key, "value": value,
                                 "counter_contract": "cumulative snapshot in daemon/resource scope; no fabricated per-call delta",
                                 "source": group.get("_source")})
    operations = []
    seen = set()
    for event in lft:
        if event.get("kind") != "operation" or not isinstance(event.get("timing"), dict):
            continue
        identity = compact({key: value for key, value in event.items() if key != "_source"})
        if identity in seen:
            continue
        seen.add(identity)
        try:
            metrics = ev.telemetry.metrics(event)
        except (KeyError, TypeError) as error:
            ev.issue("incomplete-lft-operation", event.get("_source"), str(error))
            continue
        operations.append({**metrics, "run": event.get("run"), "role": event.get("role"),
                           "name": event["timing"].get("name"), "source": event.get("_source"),
                           "clock_contract": "process-local telemetry stamps; never compared across host/daemon clock domains; CPU/RSS process-shared sampled, not exclusive allocation"})
    return {"daemon-counters": counters, "lft-operations": operations}


def generate(root, output, repo, prefix=None):
    ev = Evidence(root, repo)
    for source in sorted(Path(__file__).parent.glob("*.py")):
        if not source.name.startswith("test_"):
            ev.register(source)
    tables = operation_tables(ev)
    tables.update(concurrency_tables(ev))
    tables.update(storage_tables(ev))
    tables.update(daemon_tables(ev))
    tables["timeline"] = [dict(row, details={key: value for key, value in row.items()
                                                    if key not in COLUMNS["timeline"].split() and key != "_source"},
                               source=row.get("_source")) for row in ev.rows("events")]
    if not ev.calls:
        ev.issue("no-sdk-traces", "trace/*.jsonl", "SDK operation and concurrency collection unavailable")
    if ev.config.get("window", {}).get("callReceiptsComplete") is True:
        missing = [call["id"] for call in ev.calls if call["id"] not in ev.receipts]
        if missing:
            ev.issue("incomplete-declared-receipts", "analysis-input.json", missing)
    tables["quality"] = ev.issues
    for source in ev.sources.values():
        if file_sha256(source["path"]) != source["sha256"]:
            raise ValueError(f"Evidence changed during derivation: {source['path']}")
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    archive_sources = [source for source in ev.sources.values()
                       if Path(source['path']).suffix == '.py' and
                       (Path(source['path']).parent == Path(__file__).resolve().parent or
                        source['path'].endswith(('tools/decode_observations.py', 'core/tools/sdk_telemetry_report.py')))]
    for source in archive_sources:
        original = Path(source['path'])
        relative = original.relative_to(ev.repo)
        target = output / 'tool-sources' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(original.read_bytes())
    prefix = prefix or ev.config.get("run", Path(root).name)
    if any(character not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-" for character in prefix):
        raise ValueError("table prefix must be a simple run identifier")
    files = []
    for name, rows in tables.items():
        columns = COLUMNS[name].split()
        files.append(ev.write(output, f"{prefix}-{name}.csv", rows, columns))
    sources = sorted(ev.sources.values(), key=lambda source: source["path"])
    source_list = {"classification": "diagnostic; tracing enabled, unknown OS cache state; not benchmark evidence",
                   "method": "counts unique unambiguous trace IDs; median=statistics.median; p95=nearest rank ceil(.95*n)",
                   "sources": sources,
                   "trace_coverage_declared_complete": ev.config.get("window", {}).get("traceComplete") is True,
                   "empty_table_contract": "No observed rows; proves absence only with complete matching inventories and call coverage"}
    for path in files:
        (output / f"{path.name}.sources.json").write_text(json.dumps({"table": path.name, **source_list}, indent=2, sort_keys=True) + "\n")
    summary = {"status": "DERIVED_DIAGNOSTIC", "admission": "INELIGIBLE", "performance_admission": False,
               "classification": source_list["classification"], "run": prefix, "source_count": len(sources),
               "sdk_calls_observed": len(ev.calls), "full_receipts_joined": len(ev.receipts),
               "quality_issue_count": len(ev.issues),
               "trace_coverage": "declared-complete" if ev.config.get("window", {}).get("traceComplete") is True else "partial/unavailable for whole-run counts",
               "full_receipt_coverage": "declared-complete" if ev.config.get("window", {}).get("callReceiptsComplete") is True else "partial/unavailable",
               "empty_table_contract": source_list["empty_table_contract"], "concurrency": tables["concurrency"],
               "reconciliation": tables["reconciliation"], "missing_values": "CSV unavailable; JSON null; never substituted zero",
               "generated_at": datetime.now(timezone.utc).isoformat(),
               "table_rows": {name: len(rows) for name, rows in tables.items()}}
    (output / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
    manifest = {str(path.relative_to(output)): {"sha256": file_sha256(path), "bytes": path.stat().st_size}
                for path in sorted(output.rglob('*')) if path.is_file()}
    (output / "manifest.json").write_text(json.dumps({"classification": source_list["classification"],
                                                     "sources": sources, "outputs": manifest}, indent=2, sort_keys=True) + "\n")
    return summary, tables


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument("run_folder", type=Path)
    parser.add_argument("output_folder", type=Path, help="fresh append-only output directory; must not already exist")
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[4],
                        help="checkout supplying unchanged tools/decode_observations.py and core/tools/sdk_telemetry_report.py")
    parser.add_argument("--prefix", help="table name prefix, e.g. b1 or b2-r1")
    args = parser.parse_args()
    summary, _ = generate(args.run_folder, args.output_folder, args.repo_root, args.prefix)
    print(json.dumps({key: summary[key] for key in ("status", "run", "sdk_calls_observed", "full_receipts_joined", "quality_issue_count")}))


if __name__ == "__main__":
    main()
