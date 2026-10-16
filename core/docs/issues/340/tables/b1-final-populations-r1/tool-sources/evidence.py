"""Status: Current diagnostic campaign tooling; not release evidence.
Input custody, exact source hashes, existing decoder reuse and trace/receipt joins.
"""
import csv
import hashlib
import importlib.util
import json
import math
from datetime import datetime, timezone
from pathlib import Path

UNAVAILABLE = "unavailable"


def file_sha256(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def numeric(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def stamp(value):
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.timestamp() if parsed.tzinfo is not None else None
    except ValueError:
        return None


def iso(value):
    return datetime.fromtimestamp(value, timezone.utc).isoformat() if value is not None else None


def compact(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def module_from(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class RetainedLogLine:
    """One unchanged log line, through the existing parser's text-input API."""
    def __init__(self, text):
        self.text = text

    def read_text(self, errors="replace"):
        return self.text


class Evidence:
    def __init__(self, root, repo):
        self.root = Path(root).resolve()
        self.repo = Path(repo).resolve()
        self.sources = {}
        self.issues = []
        self.config = self.json(self.root / "analysis-input.json", optional=True) or {}
        for source in self.paths("provenanceSources"):
            self.register(source)
        self.agents = {a["id"]: a for a in self.config.get("agents", []) if a.get("id")}
        self.decoder = module_from(self.repo / "tools/decode_observations.py", "issue340_decoder")
        self.telemetry = module_from(self.repo / "core/tools/sdk_telemetry_report.py", "issue340_lft")
        self.register(self.repo / "tools/decode_observations.py")
        self.register(self.repo / "core/tools/sdk_telemetry_report.py")
        for contract in ("core/crates/layerfs-api/src/sandbox/commit.rs",
                         "core/crates/layerfs-api/src/sandbox/values.rs",
                         "core/crates/layerfs-daemon/src/store/commit.rs"):
            self.register(self.repo / contract)
        self.calls = self.traces()
        self.receipts = self.join_receipts()

    def issue(self, kind, source, detail):
        self.issues.append({"kind": kind, "source": str(source), "detail": detail})

    def register(self, path):
        path = Path(path).resolve()
        if path.is_file():
            self.sources[str(path)] = {"path": str(path), "bytes": path.stat().st_size,
                                      "sha256": file_sha256(path)}
        return path

    def json(self, path, optional=False):
        path = Path(path)
        if not path.is_file():
            if not optional:
                self.issue("missing-file", path, "declared evidence unavailable")
            return None
        self.register(path)
        try:
            return json.loads(path.read_text())
        except (ValueError, UnicodeError) as error:
            self.issue("invalid-json", path, str(error))
            return None

    def jsonl(self, path):
        return list(self.iter_jsonl(path))

    def iter_jsonl(self, path):
        path = Path(path)
        if not path.is_file():
            self.issue("missing-file", path, "declared evidence unavailable")
            return
        self.register(path)
        with path.open(errors="replace") as stream:
            for number, text in enumerate(stream, 1):
                if not text.strip():
                    continue
                try:
                    row = json.loads(text)
                    if not isinstance(row, dict):
                        raise ValueError("expected a JSON object")
                    row = dict(row)
                    row["_source"] = f"{path}:{number}"
                    yield row
                except ValueError as error:
                    self.issue("invalid-jsonl", f"{path}:{number}", str(error))

    def paths(self, key, fallback=None):
        patterns = self.config.get(key, fallback or [])
        if isinstance(patterns, str):
            patterns = [patterns]
        paths = set()
        for pattern in patterns:
            matches = sorted(self.root.glob(pattern)) if not Path(pattern).is_absolute() else [Path(pattern)]
            if not matches:
                self.issue("missing-pattern", pattern, key)
            paths.update(p.resolve() for p in matches if p.is_file())
        return sorted(paths)

    def rows(self, key, fallback=None):
        output = []
        for path in self.paths(key, fallback):
            if path.suffix == ".jsonl":
                output.extend(self.jsonl(path))
                continue
            value = self.json(path)
            rows = value if isinstance(value, list) else value.get("items", [value]) if isinstance(value, dict) else []
            for row in rows:
                if isinstance(row, dict):
                    output.append(dict(row, _source=str(path)))
        return output

    def traces(self):
        by_id, ambiguous = {}, set()
        for path in self.paths("traces", ["trace/*.jsonl"]):
            previous = None
            for row in self.jsonl(path):
                if row.get("layerfs_trace") != 1:
                    self.issue("non-trace-row", row["_source"], "ignored; format is not layerfs_trace=1")
                    continue
                identity = row.get("id")
                if not identity:
                    self.issue("missing-trace-id", row["_source"], "excluded; cannot deduplicate or join")
                    continue
                start = stamp(row.get("start"))
                if previous is not None and start is not None and start < previous:
                    self.issue("out-of-order-trace", row["_source"], "sorted by observed start for derivation")
                if start is not None:
                    previous = start
                if identity in by_id:
                    first = {k: v for k, v in by_id[identity].items() if not k.startswith("_")}
                    duplicate = {k: v for k, v in row.items() if not k.startswith("_")}
                    if first != duplicate:
                        ambiguous.add(identity)
                        self.issue("conflicting-trace-id", row["_source"], identity)
                    else:
                        self.issue("duplicate-trace-id", row["_source"], identity)
                    continue
                row["_agent"] = path.stem
                row["_start"] = start
                duration = row.get("ms")
                row["_duration"] = duration if numeric(duration) and duration >= 0 else None
                row["_end"] = start + duration / 1000 if start is not None and row["_duration"] is not None else None
                if start is None or row["_duration"] is None:
                    self.issue("invalid-trace-clock", row["_source"], identity)
                by_id[identity] = row
        return sorted((row for identity, row in by_id.items() if identity not in ambiguous),
                      key=lambda r: (r["_start"] is None, r["_start"] or 0, r["id"]))

    def join_receipts(self):
        receipts = self.rows("callReceipts", ["calls/*.json", "calls/*.jsonl"])
        indexes = {}
        tuples = {}
        for call in self.calls:
            tuples.setdefault((call["_agent"], call.get("step"), call.get("method")), []).append(call["id"])
        known_ids = {call["id"] for call in self.calls}
        for receipt in receipts:
            identity = receipt.get("traceId")
            if identity is None:
                candidates = tuples.get((receipt.get("agent"), receipt.get("step"), receipt.get("method")), [])
                if len(candidates) == 1:
                    identity = candidates[0]
                else:
                    self.issue("unjoined-receipt", receipt["_source"], "need traceId or unique agent/step/method")
                    continue
            if identity not in known_ids:
                self.issue("unknown-receipt-trace", receipt["_source"], identity)
                continue
            if identity in indexes:
                first = {k: v for k, v in indexes[identity].items() if k != "_source"}
                second = {k: v for k, v in receipt.items() if k != "_source"}
                if first != second:
                    indexes[identity] = {"_source": receipt["_source"], "_ambiguous": True}
                    self.issue("conflicting-receipt", receipt["_source"], identity)
                else:
                    self.issue("duplicate-receipt", receipt["_source"], identity)
            else:
                indexes[identity] = receipt
        return {key: value for key, value in indexes.items() if not value.get("_ambiguous")}

    def details(self, call):
        receipt = self.receipts.get(call["id"], {})
        result = receipt.get("result")
        error = receipt.get("error") or {}
        args = receipt.get("args", call.get("args", {}))
        return receipt, result, error, args

    def decoded_daemon(self):
        scopes = {call.get("scope"): call["id"] for call in self.calls if call.get("scope")}
        groups = self.rows("decodedDaemon")
        lft = []
        for path in self.paths("daemonLogs"):
            self.register(path)
            with path.open(errors="replace") as stream:
                omitted = {"sections": 0, "scopes": set()}
                def selected_lines():
                    for line in stream:
                        at = line.find(self.decoder.PREFIX)
                        if self.config.get("daemonScopeFilter") == "selected-trace-scopes" and at >= 0:
                            try:
                                scope = self.decoder.words_hex(json.loads(line[at:])["scope"])
                            except (ValueError, KeyError, TypeError):
                                yield line
                                continue
                            if scope not in scopes:
                                omitted["sections"] += 1
                                omitted["scopes"].add(scope)
                                continue
                        yield line
                groups.extend(dict(row, _source=str(path)) for row in self.decoder.decode(selected_lines(), scopes))
                if omitted["sections"]:
                    self.issue("unselected-daemon-scope-records-retained-raw", path,
                               {"sections": omitted["sections"], "scopes": len(omitted["scopes"]),
                                "contract": "explicit trace-scope selection; all original daemon bytes retained; supplemental observer calls counted separately"})
            try:
                with path.open(errors="replace") as stream:
                    for line in stream:
                        if "LFT1 " in line:
                            lft.extend(dict(row, _source=str(path))
                                       for row in self.telemetry.records(RetainedLogLine(line)))
            except ValueError as error:
                self.issue("invalid-lft-record", path, str(error))
        unique = {}
        bad = set()
        for group in groups:
            key = (group.get("daemon"), group.get("scope"), group.get("call"))
            if not all(part is not None for part in key):
                self.issue("invalid-daemon-key", group.get("_source"), str(key))
                continue
            if key in unique:
                a = {k: v for k, v in unique[key].items() if k not in ("_source", "trace")}
                b = {k: v for k, v in group.items() if k not in ("_source", "trace")}
                if a != b:
                    bad.add(key)
                    self.issue("conflicting-daemon-group", group.get("_source"), str(key))
                continue
            group["trace"] = group.get("trace", scopes.get(group.get("scope")))
            unique[key] = group
        return [g for key, g in unique.items() if key not in bad], lft

    def write(self, out, name, rows, columns):
        path = out / name
        with path.open("x", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=columns)
            writer.writeheader()
            for row in rows:
                writer.writerow({key: UNAVAILABLE if row.get(key) is None else
                                 compact(row[key]) if isinstance(row.get(key), (dict, list)) else row[key]
                                 for key in columns})
        return path
