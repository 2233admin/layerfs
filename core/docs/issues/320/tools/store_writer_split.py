"""Split a retained Commit into the global Store writer's part and the rest.

usage: store_writer_split.py <sample-folder> ...

Reads each folder's receipt.json and prints, for the one control call that ran
the Commit, the change in the global writer's counters (numeric schema section
13) between the snapshot before that call and the snapshot at it: statements,
write transactions, sealed pack bytes, the wall of the `COMMIT` statement's
step, the writer's whole step time over all its statements (index 32), and the
Commit wall without the `COMMIT` step and without the whole step. A stall of the
writer's buffered writes can land in any statement's step, so compare the Commit
without the whole step. It also prints the construction record jobs, the
overlay operation-record jobs with their lock or service wall, the reclamation
counted between the measured mount and the Commit's reply, and how many pages of
the Store file were not resident when the harness looked.

It reads retained receipts only. A wall here is one sample's diagnostic value;
it qualifies nothing.
"""
import json
import sys
from pathlib import Path

# Section 13/14 positions (layerfs-daemon application/diagnostics/schema.rs `sql`).
STATEMENTS, WRITE_TRANSACTIONS, TRANSACTION_NS, SEALED_BYTES, STEP_NS, COMMIT_STEP_NS = 0, 11, 16, 19, 32, 46
RECORD_JOBS = 18  # section 15


def commit_call(receipt):
    return json.loads(receipt["observations"]["construction_work"]["value"]["snapshots"][0]["call"])[2]


def writer_delta(receipt, call):
    before = at = None
    for row in receipt["observations"]["global_sql_work"]["value"]:
        if row["section"] != 13 or not row.get("values"):
            continue
        number = row["identity"][2]
        if number < call:
            before = row["values"]
        elif number == call:
            at = row["values"]
    return [after - first for after, first in zip(at, before)]


def owner_at(receipt, call):
    """Operation-record jobs and wall at the Commit's snapshot; reclamation since the snapshot before it.

    No control call lies between the measured mount and the Commit, so that difference covers the
    measured command and the Commit together.
    """
    before = None
    for row in receipt["observations"]["owner_work"]["value"]["snapshots"]:
        values, number = row["values"], json.loads(row["call"])[2]
        queue = len(values) == 32  # queue model: service wall of the owner thread
        reclaim = (values[9], values[12], values[13]) if queue else (values[1], values[4], values[5])
        if number < call:
            before = reclaim
        elif number == call:
            jobs, wall = (values[18], values[30]) if queue else (values[10], values[22])
            return jobs, wall, [at - first for at, first in zip(reclaim, before)], "service" if queue else "lock hold"
    return None


def not_resident(receipt):
    for entry in receipt["cache"]["residency"]["files"]:
        if entry.get("path", "").endswith("store.sqlite") and entry.get("present"):
            return entry["total_pages"] - entry["resident_pages"], entry["total_pages"]
    return None, None


for folder in sys.argv[1:]:
    receipt = json.loads((Path(folder) / "receipt.json").read_text())
    call = commit_call(receipt)
    writer = writer_delta(receipt, call)
    commit = receipt["phases"]["commit_ns"]
    jobs, wall, (reclaim_jobs, reclaim_bytes, reclaim_ns), kind = owner_at(receipt, call)
    missing, pages = not_resident(receipt)
    print(json.dumps({
        "sample": str(folder), "source": receipt["source_commit"][:9], "daemon": receipt["daemon_sha256"][:12],
        "commit_ms": round(commit / 1e6, 1),
        "writer_statements": writer[STATEMENTS], "writer_write_transactions": writer[WRITE_TRANSACTIONS],
        "sealed_pack_bytes": writer[SEALED_BYTES],
        "writer_transaction_ms": round(writer[TRANSACTION_NS] / 1e6, 1),
        "writer_step_ms": round(writer[STEP_NS] / 1e6, 1),
        "writer_commit_step_ms": round(writer[COMMIT_STEP_NS] / 1e6, 1),
        "commit_without_commit_step_ms": round((commit - writer[COMMIT_STEP_NS]) / 1e6, 1),
        "commit_without_writer_step_ms": round((commit - writer[STEP_NS]) / 1e6, 1),
        "construction_record_jobs": receipt["observations"]["construction_work"]["value"]["snapshots"][0]["values"][RECORD_JOBS],
        "operation_record_jobs": jobs, "operation_record_" + kind.replace(" ", "_") + "_ms": round(wall / 1e6, 1),
        "reclaim_jobs_in_command_and_commit": reclaim_jobs, "reclaim_bytes_in_command_and_commit": reclaim_bytes,
        "reclaim_ms_in_command_and_commit": round(reclaim_ns / 1e6, 1),
        "store_pages_not_resident": missing, "store_pages": pages,
    }))
