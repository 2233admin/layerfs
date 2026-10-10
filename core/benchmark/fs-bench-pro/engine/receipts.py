"""Append-only evidence and lossless released-reference provenance."""
import csv
from decimal import Decimal
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
REFERENCE_SOURCES = (
    "release-notes/0.1.6/benchmark-performance.csv",
    "release-notes/0.1.5/benchmark-performance.csv",
    "release-notes/0.1.5/benchmark-verification.csv",
)
REFERENCE_COLUMNS = (
    "family", "case", "release", "kind", "timer", "value_ns",
    "source_value", "source_unit", "normalization", "profile", "disposition",
    "source_file", "source_row", "source_sha256", "source_seal", "product_seal",
    "producing_treatment", "producing_binary_sha256", "evidence", "source_row_json",
)


def released_references(root=ROOT):
    """Keep every input row, including verification-only and unavailable rows.

    Seconds are normalized using decimal arithmetic and truncated only at the
    nanosecond format boundary. Original text and every source field remain.
    No receipt is re-read, no disposition or historical ratio is recomputed.
    """
    for source in REFERENCE_SOURCES:
        path = root / source
        seal = hashlib.sha256(path.read_bytes()).hexdigest()
        release = path.parent.name
        with path.open(newline="") as stream:
            for line, row in enumerate(csv.DictReader(stream), 2):
                verification = source.endswith("benchmark-verification.csv")
                if verification:
                    timer, raw, unit = "proof_wall_seconds", row["proof_wall_seconds"], "seconds"
                    disposition = row["proof_status"]
                elif release == "0.1.6":
                    timer, raw, unit = "complete_wall_seconds", row["complete_wall_seconds"], "seconds"
                    disposition = row["status"]
                else:
                    timer, raw, unit = row["timer"], row["candidate_ns"], "nanoseconds"
                    disposition = row["disposition"]
                value = str(int(Decimal(raw) * 1_000_000_000)) if raw and unit == "seconds" else raw
                yield dict(
                    family=row["family"], case=row["case"], release=release,
                    kind="verification" if verification else "performance", timer=timer,
                    value_ns=value, source_value=raw, source_unit=unit,
                    normalization="decimal seconds × 1000000000; sub-ns truncated" if raw and unit == "seconds" else "copied",
                    profile="released host-Store; see README; different topology and clock",
                    disposition=disposition, source_file=source, source_row=str(line),
                    source_sha256=seal, source_seal=row.get("source_seal", ""),
                    product_seal=row.get("product_seal", ""),
                    producing_treatment=row.get("producing_treatment", ""),
                    producing_binary_sha256=row.get("producing_binary_sha256", ""),
                    evidence=row.get("evidence", ""),
                    source_row_json=json.dumps(row, sort_keys=True, separators=(",", ":")),
                )


def write_references(destination, root=ROOT):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("x", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=REFERENCE_COLUMNS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(released_references(root))
