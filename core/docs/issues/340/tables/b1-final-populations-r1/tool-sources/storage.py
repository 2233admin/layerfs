"""Status: Current diagnostic campaign tooling; Store accounting, not path allocation."""
from collections import defaultdict
from evidence import compact, numeric, stamp

COUNTERS = ("logical", "newCanonical", "newStored", "newMetadata")


def stats_file(ev, key):
    name = ev.config.get(key)
    if not name:
        return None
    value = ev.json(ev.root / name)
    if isinstance(value, dict) and "result" in value:
        value = value["result"]
    return value if isinstance(value, dict) else None


def num(row, field):
    value = row.get(field) if isinstance(row, dict) else None
    return value if numeric(value) and value >= 0 else None


def total_if_complete(rows, key):
    values = [num(row, key) for row in rows]
    return sum(values) if all(value is not None for value in values) else None


def overhead(stats):
    if all(num(stats, key) is not None for key in ("file", "free", "stored")):
        return stats["file"] - stats["free"] - stats["stored"]
    return None


def storage_tables(ev):
    initial, final = stats_file(ev, "initialStats"), stats_file(ev, "finalStats")
    records = {}
    field_conflicts = set()
    origins = defaultdict(set)
    sources = defaultdict(set)
    creator = {}

    def add(row, source, branch=None):
        if not isinstance(row, dict):
            return
        identity = row.get("id", row.get("commit"))
        if not isinstance(identity, str):
            return
        known = records.setdefault(identity, {"commit": identity})
        sources[identity].add(source)
        if branch:
            origins[identity].add(branch)
        for key in COUNTERS + ("parent", "secondParent", "time", "message", "root", "base"):
            value = row.get(key)
            if value is None:
                continue
            if key in known and known[key] != value:
                field_conflicts.add((identity, key))
                ev.issue("conflicting-commit-field", source, f"{identity} {key}")
            else:
                known[key] = value

    for call in ev.calls:
        receipt, result, error, args = ev.details(call)
        result = result if isinstance(result, dict) else {}
        commit = result.get("commit")
        if isinstance(commit, dict):
            add(commit, receipt.get("_source", call["_source"]), args.get("branch"))
        identity = call.get("commit")
        if isinstance(commit, dict):
            identity = commit.get("id", identity)
        elif isinstance(commit, str):
            identity = commit
        if call.get("method") == "branch.merge" and result.get("fastForward") is False:
            identity = result.get("head", identity)
        is_new = call.get("ok") is True and call.get("kind") not in ("UpToDate", "NoChanges") and (
            call.get("method", "").startswith("fs.") or call.get("method") == "sandbox.commit" or
            (call.get("method") == "branch.merge" and result.get("fastForward") is False))
        if identity and is_new:
            add(dict(call.get("sizes", {}), id=identity), call["_source"], args.get("branch"))
            creator[identity] = {"agent": call["_agent"], "lane": ev.agents.get(call["_agent"], {}).get("lane"),
                                 "trace_id": call["id"], "observed_reply": call["_end"]}
    for row in ev.rows("storeCommits"):
        add(row, row.get("_source"), row.get("branch"))
    for row in ev.rows("branchHistories"):
        add(row, row.get("_source"), row.get("branch"))
    for identity, key in field_conflicts:
        records[identity][key] = None
    baseline = ev.config.get("baselineInventory", {})
    baseline_ids = set(baseline.get("commits", []))
    baseline_known = baseline.get("complete") is True
    inventory = ev.config.get("historyInventory", {})
    inventory_ids = inventory.get("commits")
    if inventory.get("complete") is True and isinstance(inventory_ids, list):
        missing = set(inventory_ids) - set(records)
        extra = set(records) - set(inventory_ids)
        if missing or extra:
            ev.issue("commit-inventory-mismatch", "analysis-input.json", {"missing": sorted(missing), "extra": sorted(extra)})
        complete = not missing and not extra and not field_conflicts
    else:
        complete = False
    layers = ev.rows("layers")
    layer_map = {}
    layer_conflicts = False
    for row in layers:
        identity = row.get("id", row.get("layer"))
        if not isinstance(identity, str):
            ev.issue("invalid-layer", row.get("_source"), "normalized id/layer string required")
            layer_conflicts = True
            continue
        if identity in layer_map and layer_map[identity].get("logical") != row.get("logical"):
            ev.issue("conflicting-layer", row.get("_source"), identity)
            layer_conflicts = True
        layer_map[identity] = row
    layer_ids = inventory.get("layers")
    layers_complete = complete and isinstance(layer_ids, list) and set(layer_ids) == set(layer_map) and not layer_conflicts
    current = {key: num(initial, key) for key in ("canonical", "stored", "metadata")}
    ordered = sorted(records.values(), key=lambda row: (
        row.get("time") / 1000 if numeric(row.get("time")) else creator.get(row["commit"], {}).get("observed_reply", float("inf")) or float("inf"), row["commit"]))
    output = []
    for record in ordered:
        identity = record["commit"]
        introduced = baseline_known and identity not in baseline_ids
        parent = records.get(record.get("parent"), {})
        for target, delta in (("canonical", "newCanonical"), ("stored", "newStored"), ("metadata", "newMetadata")):
            if introduced:
                current[target] = current[target] + record[delta] if current[target] is not None and num(record, delta) is not None else None
        output.append({**record, **creator.get(identity, {}), "branches": sorted(origins[identity]) or None,
                       "logical_delta_from_first_parent": record["logical"] - parent["logical"]
                       if num(record, "logical") is not None and num(parent, "logical") is not None else None,
                       "after_baseline": introduced if baseline_known else None,
                       "cumulative_canonical": current["canonical"] if baseline_known else None,
                       "cumulative_stored": current["stored"] if baseline_known else None,
                       "cumulative_metadata_pack_plus_initial_metadata": current["metadata"] if baseline_known else None,
                       "order_contract": "Commit timestamp then id; fallback SDK reply stamp; not Save serialization",
                       "sources": sorted(sources[identity])})
    after = [row for row in records.values() if row["commit"] not in baseline_ids]
    sums = {field: total_if_complete(after, field) if complete and baseline_known else None for field in COUNTERS[1:]}
    final_logical = total_if_complete(list(records.values()), "logical") if complete else None
    layer_logical = total_if_complete(list(layer_map.values()), "logical") if layers_complete else None
    predicted_logical = final_logical + layer_logical if final_logical is not None and layer_logical is not None else None
    reconcile = []
    for key, delta in (("canonical", "newCanonical"), ("stored", "newStored"), ("metadata", "newMetadata")):
        baseline_value, final_value, saved = num(initial, key), num(final, key), sums[delta]
        extra = None
        if key == "metadata":
            a, b = overhead(initial), overhead(final)
            extra = b - a if a is not None and b is not None else None
        predicted = baseline_value + saved if baseline_value is not None and saved is not None else None
        if key == "metadata":
            predicted = predicted + extra if predicted is not None and extra is not None else None
        reconcile.append({"counter": key, "initial": baseline_value, "acknowledged_new": saved,
                          "sqlite_overhead_delta": extra, "predicted_final": predicted,
                          "observed_final": final_value,
                          "gap": final_value - predicted if final_value is not None and predicted is not None else None,
                          "status": "available" if final_value is not None and predicted is not None else "unavailable",
                          "contract": "initial + unique post-baseline Commit Save counters; metadata adds file-free-stored overhead delta",
                          "gap_candidates": "unrecorded/failed Saves, missing history or retained accounting gap; no attribution"})
    reconcile.append({"counter": "logical", "initial": num(initial, "logical"), "acknowledged_new": None,
                      "commit_record_sum": final_logical, "layer_record_sum": layer_logical,
                      "predicted_final": predicted_logical, "observed_final": num(final, "logical"),
                      "gap": final["logical"] - predicted_logical if num(final, "logical") is not None and predicted_logical is not None else None,
                      "status": "available" if num(final, "logical") is not None and predicted_logical is not None else "unavailable",
                      "contract": "sum every unique Commit.logical AND every publication Layer.logical, including Init"})
    snapshots = []
    for label, stats in [("initial", initial), ("final", final)]:
        row = {"observation": label, **{key: num(stats, key) for key in ("logical", "canonical", "stored", "metadata", "file", "free")}}
        row["logical_over_canonical"] = row["logical"] / row["canonical"] if row["logical"] is not None and row["canonical"] else None
        row["canonical_over_stored"] = row["canonical"] / row["stored"] if row["canonical"] is not None and row["stored"] else None
        row["sqlite_overhead_file_minus_free_minus_stored"] = overhead(stats)
        row["physical_contract"] = "stored includes metadata packs; never add stored+metadata"
        snapshots.append(row)
    dependencies, dedup_summary = dependency_rows(ev, records, creator)
    artifacts = []
    for label, name in ev.config.get("artifacts", {}).items():
        path = ev.root / name
        if path.is_file():
            ev.register(path)
            artifacts.append({"artifact": label, "path": str(path), "bytes": path.stat().st_size,
                              "sha256": ev.sources[str(path.resolve())]["sha256"]})
        else:
            ev.issue("missing-artifact", path, label)
            artifacts.append({"artifact": label, "path": str(path), "bytes": None, "sha256": None})
    attributed = defaultdict(list)
    for row in output:
        if row["after_baseline"] is True:
            attributed[(row.get("agent"), row.get("lane"))].append(row)
    attribution = [{"agent": key[0], "lane": key[1], "commit_count": len(values),
                    "logical_tree_bytes_sum": total_if_complete(values, "logical"),
                    "new_canonical": total_if_complete(values, "newCanonical"),
                    "new_stored": total_if_complete(values, "newStored"),
                    "new_metadata_subset": total_if_complete(values, "newMetadata"),
                    "contract": "unique post-baseline Commit Saves only; unknown owners remain unavailable; Layer logical bytes separate"}
                   for key, values in sorted(attributed.items(), key=lambda item: str(item[0]))]
    return {"commits": output, "storage": snapshots, "storage-attribution": attribution, "reconciliation": reconcile,
            "dependencies": dependencies, "dependency-summary": dedup_summary,
            "artifacts": artifacts, "layers": list(layer_map.values())}


def dependency_rows(ev, records, creator):
    censuses = ev.rows("dependencyCensus")
    rows, unique, seen_install = [], {}, set()
    for census in censuses:
        ref_type, ref = census.get("refType"), census.get("ref")
        if ref_type not in ("commit", "workspace") or not isinstance(ref, str):
            ev.issue("invalid-dependency-census", census.get("_source"), "refType commit/workspace and ref required")
            continue
        trees = census.get("trees")
        if not isinstance(trees, list):
            ev.issue("invalid-dependency-census", census.get("_source"), "trees list required (empty only if observed empty)")
            continue
        for tree in trees:
            key = (ref_type, ref, tree.get("path"))
            if key in unique and unique[key] != tree.get("logicalBytes"):
                ev.issue("conflicting-dependency-census", census.get("_source"), str(key))
                unique[key] = None
            else:
                unique[key] = tree.get("logicalBytes")
        commit = census.get("commit", ref if ref_type == "commit" else None)
        save_id = census.get("saveCommit")
        if save_id is None and census.get("commitTraceId") is not None and census.get("commitTraceId") == creator.get(commit, {}).get("trace_id"):
            save_id = commit
        if census.get("installation") is True and save_id is not None and (
                census.get("commitTraceId") is None or census.get("commitTraceId") != creator.get(save_id, {}).get("trace_id")):
            ev.issue("uncorroborated-dependency-save", census.get("_source"), "need the actual publishing Commit trace id; do not reuse prior head counters")
            save_id = None
        record = records.get(save_id if census.get("installation") is True else commit, {})
        install_key = census.get("installTraceId") or compact({key: value for key, value in census.items() if key != "_source"})
        if census.get("installation") is True and install_key in seen_install:
            continue
        if census.get("installation") is True:
            seen_install.add(install_key)
        measured = [tree.get("logicalBytes") for tree in trees]
        total = sum(measured) if all(numeric(value) and value >= 0 for value in measured) and census.get("complete") is True else None
        rows.append({"ref_type": ref_type, "ref": ref, "commit": commit,
                     "agent": census.get("agent", creator.get(commit, {}).get("agent")),
                     "lane": census.get("lane", creator.get(commit, {}).get("lane")),
                     "at": census.get("at"), "installation": census.get("installation"),
                     "install_trace_id": census.get("installTraceId"), "commit_trace_id": census.get("commitTraceId"),
                     "save_commit": save_id,
                     "lockfile_sha256": census.get("lockfileSha256"), "tree_count": len(trees) if census.get("complete") is True else None,
                     "logical_bytes": total, "trees": trees, "whole_save_new_canonical": num(record, "newCanonical"),
                     "whole_save_new_stored": num(record, "newStored"), "whole_save_new_metadata_subset": num(record, "newMetadata"),
                     "allocation_contract": "Save totals include all changed source/generated/data; no exclusive node_modules bytes",
                     "source": census.get("_source")})
    groups = defaultdict(list)
    for row in rows:
        if row.get("installation") is True and row.get("lockfile_sha256"):
            groups[row["lockfile_sha256"]].append(row)
    for values in groups.values():
        values.sort(key=lambda row: (stamp(row.get("at")) is None, stamp(row.get("at")) or 0, row.get("commit") or ""))
        for index, row in enumerate(values):
            row["install_order_same_lockfile"] = index + 1 if all(stamp(r.get("at")) is not None for r in values) else None
            row["first_or_later"] = ("first-observed" if index == 0 else "later-observed") if row["install_order_same_lockfile"] else None
    summary = []
    for kind in ("commit", "workspace"):
        values = [value for key, value in unique.items() if key[0] == kind]
        refs = {row["ref"] for row in rows if row["ref_type"] == kind}
        expected = ev.config.get("dependencyInventory", {}).get(kind)
        has_census = bool(refs)
        complete = (ev.config.get("dependencyCensusComplete", {}).get(kind) is True and
                    isinstance(expected, list) and set(expected) == refs and
                    all(row["tree_count"] is not None for row in rows if row["ref_type"] == kind))
        summary.append({"ref_type": kind, "tree_count_observed": len(values) if has_census else None,
                        "logical_bytes_observed": sum(values) if has_census and all(numeric(v) and v >= 0 for v in values) else None,
                        "all_history_tree_count": len(values) if complete else None,
                        "all_history_logical_bytes": sum(values) if complete and all(numeric(v) and v >= 0 for v in values) else None,
                        "coverage": "declared-complete" if complete else "partial/unavailable for all-history total",
                        "physical_bytes_attributed_to_dependencies": None,
                        "contract": "logical regular-file bytes per path including hardlink paths; symlink target bytes excluded; physical per-path attribution unavailable"})
    return rows, summary
