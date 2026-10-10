"""Independent native expectations and retained tree/index comparison.

The frozen cell tree and Git-index checkers are reused intact. This module is
also a container CLI; its output is outside the Workspace and every timer.
"""
import argparse
from contextlib import closing
import hashlib
import json
import math
from pathlib import Path
import sqlite3
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[4]
CENSUS_SQL = 'SELECT commit_id,layer_stack_id,root_id,parent_commit_id,base_layer_id FROM "commit" ORDER BY commit_id'
DEFINITION_SQL = "SELECT type,name,sql FROM sqlite_schema WHERE substr(name,1,7)!='sqlite_' ORDER BY type,name"
CENSUS_COLUMNS = ("commit_id", "layer_stack_id", "root_id", "parent_commit_id", "base_layer_id")
PROVIDER_KEYS = ("provider_validation", "catalog_id", "catalog_incarnation", "binding_sha256", "stack_id", "branch_id",
                 "base_layer_id", "initial_root", "final_head_commit_id", "final_head_root", "acknowledged_transcript_sha256",
                 "provider_store_sha256", "provider_store_size", "provider_store_after_sha256", "provider_store_after_size", "provider_store_unchanged")
CUSTODY_KEYS = ("custody", "container", "volume", "remote_source", "local_source", "source_sha256", "source_size",
                "prepared_manifest", "prepared_manifest_sha256", "transcript", "transcript_sha256",
                "export_completion", "export_completion_sha256", "runtime_events", "runtime_events_sha256")
SCHEMA_PINS = {
    "core/crates/layerfs-persistence/src/backend/sqlite/schema.rs": "d5e4d452a1f53e4bb5a5175a3a70d6cbf4ef346d40cbd066a3a4cb6e33ee6299",
    "core/crates/layerfs-persistence/sql/sqlite/objects.sql": "e5aa57bd69bb3d2a60ce7c6b4b00400316ac2269344d1d05ddca8790cf6e6e80",
    "core/crates/layerfs-persistence/sql/sqlite/objects_units.sql": "d0d464efda7b48dd88240ddeb4670b1b397a5c28373d907b9c16856e47d5d6bc",
    "core/crates/layerfs-persistence/sql/sqlite/objects_units_index.sql": "d888eeaeadf65e5845483c39ca7a2af007b0a7950a4d94b4d71184b061222d46",
    "core/crates/layerfs-persistence/sql/sqlite/metadata.sql": "bfea5532191e5be4f8dc72c04601afe468a7251ee69befe051a3688a5c470cbd",
    "core/crates/layerfs-persistence/sql/sqlite/history.sql": "469e4bae00a6d23711f21dc41e2091d18d2d4e4f9a4c4dbec8377c3929faf2ef",
    "core/crates/layerfs-persistence/sql/sqlite/acquisition/schema.sql": "76c8bcaef4562497456628a7ddcd0598317cdc0dcba5a37eb4c3bf015a651d6d",
    "core/crates/layerfs-bridge/src/provision_wire.rs": "1c73c25ee7ba9d04dbca9b169aa9b0b0abdf59e55a10d44cd59e81684ccf34e2",
    "core/crates/layerfs-bridge/src/wire.rs": "536ee0d655e16b8b89a84670b3acabeac44757d588888442e24a20dcd2dbc26f",
}


def _hex(value, length, tag=None):
    if (type(value) is not str or len(value) != 2*length
            or any(char not in "0123456789abcdef" for char in value)):
        raise ValueError("census typed identity must be exact lowercase hexadecimal")
    raw = bytes.fromhex(value)
    if tag is not None and raw[0] != tag:
        raise ValueError("census typed identity tag differs")
    return raw


def _blob(value, length, tag=None):
    if type(value) is not bytes or len(value) != length or tag is not None and value[0] != tag:
        raise ValueError("census raw SQLite BLOB type/length/tag differs")
    return value


def _sealed_identity(path):
    path = Path(path)
    if path.is_symlink() or not path.is_file():
        raise ValueError("census requires an exact regular exported Store file")
    if any(Path(str(path)+suffix).exists() or Path(str(path)+suffix).is_symlink()
           for suffix in ("-wal", "-shm", "-journal")):
        raise ValueError("census refuses every Store sidecar, including empty sidecars")
    before = path.stat().st_size
    digest = file_sha(path)
    if path.stat().st_size != before:
        raise ValueError("census Store changed while hashing")
    return {"sha256": digest, "size": before}


def _schema_source(version):
    if type(version) is not int or version not in range(1, 7):
        raise ValueError("census unsupported current SQLite schema version")
    scripts = {}
    for relative, digest in SCHEMA_PINS.items():
        path = ROOT / relative
        if file_sha(path) != digest:
            raise ValueError("census authoritative schema/wire source pin changed")
        scripts[relative] = path.read_text()
    prefix = "core/crates/layerfs-persistence/sql/sqlite/"
    layout = (version-1)%3+1
    source = scripts[prefix+("objects.sql" if layout == 1 else "objects_units.sql")]
    if layout == 3:
        source += scripts[prefix+"objects_units_index.sql"]
    for name in ("metadata.sql", "history.sql"):
        source += scripts[prefix+name].replace("schema_version=1", f"schema_version={version}")
    if version >= 4:
        source += scripts[prefix+"acquisition/schema.sql"]
    with closing(sqlite3.connect(":memory:", isolation_level=None, timeout=0)) as native:
        native.execute("PRAGMA synchronous=OFF")
        native.executescript(source)
        definition = "".join(value+"\n" for row in native.execute(DEFINITION_SQL) for value in row)
        tables = [row[0] for row in native.execute("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name")]
    return source, definition, tables


def _manifest_identity(path):
    """Pinned existing StoreManifest wire; authority bytes are never returned."""
    data = Path(path).read_bytes()
    if len(data) > 8192 or not data.startswith(b"LFSI\x01\x01\x02"):
        raise ValueError("census requires the existing SQLite Disposable manifest")
    position = 7
    def take(length):
        nonlocal position
        end = position+length
        if end > len(data):
            raise ValueError("census manifest truncated")
        value = data[position:end]; position = end
        return value
    def blob(maximum):
        length = int.from_bytes(take(2), "big")
        if length > maximum:
            raise ValueError("census manifest field exceeds current wire bound")
        return take(length)
    locator = blob(4096).decode("utf-8")
    binding = blob(128)
    cursor = take(32)
    stack, branch, root = take(17), take(17), take(32)
    sealed_bytes = int.from_bytes(take(8), "big")
    versions = [blob(64).decode("utf-8") for _ in range(2)]
    if (position != len(data) or locator != "/layerfs-store/global/store.sqlite" or not binding
            or cursor == bytes(32) or not sealed_bytes or not versions[0]
            or any(value and any(not (33 <= ord(char) <= 126) for char in value) for value in versions)):
        raise ValueError("census manifest identity/profile/locator differs")
    return {"stack_id": _blob(stack,17,0x31).hex(), "branch_id": _blob(branch,17,0x11).hex(),
            "initial_root": _blob(root,32).hex(), "binding_sha256": hashlib.sha256(binding).hexdigest()}


NORMALIZATION_SCHEMA = "fs-bench-pro-closed-store-normalization-v1"
NORMALIZATION_SCOPE = "isolated full regular known-Stop SQLite set; read-only WAL source and bounded SQLite backup to separate WAL/OFF target; raw export bytes unchanged; own target checkpoint/close only; no retry or product operation"
NORMALIZATION_RECEIPT_SCOPE = "normalization operation completion is observed before receipt emission; receipt write/hash guarded by the same absolute deadline"


def _closed_store_deadline(absolute_stop):
    if type(absolute_stop) not in (int, float) or not math.isfinite(absolute_stop):
        raise ValueError("finite closed Store absolute deadline required")
    if time.monotonic() >= absolute_stop:
        raise TimeoutError("closed Store normalization absolute deadline reached")


def _closed_store_file(path, absolute_stop=None):
    path = Path(path)
    if path.is_symlink() or not path.is_file():
        raise ValueError("closed Store set requires exact regular files")
    size, digest = path.stat().st_size, hashlib.sha256()
    with path.open("rb") as stream:
        while True:
            if absolute_stop is not None:
                _closed_store_deadline(absolute_stop)
            chunk = stream.read(65536)
            if not chunk:
                break
            digest.update(chunk)
    if path.stat().st_size != size:
        raise ValueError("closed Store file changed while hashing")
    return {"size": size, "sha256": digest.hexdigest()}


def _closed_store_files(raw_directory, absolute_stop=None):
    raw = Path(raw_directory)
    if raw.is_symlink() or not raw.is_dir():
        raise ValueError("exact regular closed Store directory required")
    names = sorted(item.name for item in raw.iterdir())
    if "store.sqlite" not in names or any(name not in ("store.sqlite", "store.sqlite-wal", "store.sqlite-shm") for name in names):
        raise ValueError("closed Store set contains missing or unexpected files/journal")
    return {name: _closed_store_file(raw/name, absolute_stop) for name in names}


def prepare_closed_store(raw_directory, normalized_path, absolute_stop):
    """Normalize an isolated copy of all WAL bytes; never open the raw export."""
    _closed_store_deadline(absolute_stop)
    raw, target_path = Path(raw_directory).resolve(), Path(normalized_path).resolve()
    if Path(raw_directory).is_symlink() or Path(normalized_path).is_symlink() or target_path.is_relative_to(raw):
        raise ValueError("closed Store normalization must use a separate fresh path")
    target_path.parent.mkdir(parents=True, exist_ok=False)
    receipt = target_path.parent/"normalization.json"
    scratch = target_path.parent/"scratch"
    scratch.mkdir()
    begun = time.monotonic()
    record = {"schema": NORMALIZATION_SCHEMA, "scope": NORMALIZATION_SCOPE,
              "raw_directory": str(raw), "path": str(target_path), "scratch": str(scratch),
              "helper_sha256": _closed_store_file(Path(__file__), absolute_stop)["sha256"],
              "profile": "Disposable/WAL/OFF", "source_uri_mode": "ro", "source_query_only": 1,
              "source_synchronous": 0, "target_synchronous": 0, "source_journal_mode": "wal", "target_journal_mode": "wal",
              "backup_pages_per_step": 128, "backup_sleep_seconds": 0, "backup_attempts": 0,
              "absolute_stop_monotonic": absolute_stop, "started_monotonic": begun,
              "receipt_scope": NORMALIZATION_RECEIPT_SCOPE}
    source = target = None
    progress = {"calls": 0, "remaining_pages": None, "total_pages": None, "last_status": None}
    try:
        record["raw_files"] = _closed_store_files(raw, absolute_stop)
        for name in record["raw_files"]:
            with (raw/name).open("rb") as incoming, (scratch/name).open("xb") as outgoing:
                while True:
                    _closed_store_deadline(absolute_stop)
                    chunk = incoming.read(65536)
                    if not chunk:
                        break
                    if outgoing.write(chunk) != len(chunk):
                        raise OSError("closed Store copy short write; no resend")
            _closed_store_deadline(absolute_stop)
        record["copied_files"] = _closed_store_files(scratch, absolute_stop)
        if record["copied_files"] != record["raw_files"]:
            raise ValueError("isolated full closed Store copy differs")
        source = sqlite3.connect((scratch/"store.sqlite").as_uri()+"?mode=ro", uri=True, isolation_level=None, timeout=0)
        source.execute("PRAGMA query_only=ON"); source.execute("PRAGMA synchronous=OFF")
        if (source.execute("PRAGMA journal_mode=WAL").fetchone() != ("wal",)
                or source.execute("PRAGMA query_only").fetchone() != (1,)
                or source.execute("PRAGMA synchronous").fetchone() != (0,)):
            raise ValueError("closed Store source requires explicit read-only WAL/OFF")
        _closed_store_deadline(absolute_stop)
        target = sqlite3.connect(target_path, isolation_level=None, timeout=0)
        page_size = source.execute("PRAGMA page_size").fetchone()[0]
        if type(page_size) is not int or page_size < 512 or page_size > 65536 or page_size & (page_size-1):
            raise ValueError("closed Store source SQLite page size differs")
        target.execute(f"PRAGMA page_size={page_size}")
        if target.execute("PRAGMA journal_mode=WAL").fetchone() != ("wal",):
            raise ValueError("closed Store target requires explicit WAL")
        target.execute("PRAGMA synchronous=OFF")
        if target.execute("PRAGMA synchronous").fetchone() != (0,):
            raise ValueError("closed Store target requires synchronous OFF")
        def advance(status, remaining, total):
            progress.update(calls=progress["calls"]+1, remaining_pages=remaining, total_pages=total, last_status=status)
            _closed_store_deadline(absolute_stop)
            if status not in (sqlite3.SQLITE_OK, sqlite3.SQLITE_DONE):
                raise sqlite3.OperationalError("closed Store backup BUSY/LOCKED/error; no retry: " + str(status))
        record["backup_attempts"] = 1
        source.backup(target, pages=128, progress=advance, sleep=0)
        _closed_store_deadline(absolute_stop)
        if (target.execute("PRAGMA journal_mode").fetchone() != ("wal",)
                or target.execute("PRAGMA synchronous").fetchone() != (0,)):
            raise ValueError("closed Store target WAL/OFF changed during backup")
        checkpoint = target.execute("PRAGMA wal_checkpoint(TRUNCATE)").fetchone()
        if not checkpoint or checkpoint[0] != 0:
            raise sqlite3.OperationalError("closed Store target checkpoint BUSY; no retry")
        target.close(); target = None
        source.close(); source = None
        _closed_store_deadline(absolute_stop)
        if any(Path(str(target_path)+suffix).exists() or Path(str(target_path)+suffix).is_symlink()
               for suffix in ("-wal", "-shm", "-journal")):
            raise ValueError("closed Store normalized input retains a sidecar")
        with target_path.open("rb") as stream:
            header = stream.read(100)
        if header[:16] != b"SQLite format 3\x00" or header[18:20] != bytes([2,2]):
            raise ValueError("closed Store normalized header must retain WAL; no DELETE conversion")
        record["normalized_identity"] = _closed_store_file(target_path, absolute_stop)
        _closed_store_deadline(absolute_stop)
        record["raw_files_after"] = _closed_store_files(raw, absolute_stop)
        if record["raw_files_after"] != record["raw_files"] or _closed_store_file(Path(__file__), absolute_stop)["sha256"] != record["helper_sha256"]:
            raise ValueError("closed Store raw export/helper changed during normalization")
        record.update(status="PASS", backup_progress=progress, checkpoint=list(checkpoint), raw_unchanged=True,
                      source_closed=True, target_closed=True, completed_monotonic=time.monotonic())
        _closed_store_deadline(absolute_stop)
        write_new(receipt, record)
        receipt_sha = _closed_store_file(receipt, absolute_stop)["sha256"]
        _closed_store_deadline(absolute_stop)
        return {"path": str(target_path), "receipt": str(receipt), "receipt_sha256": receipt_sha,
                "normalized_identity": record["normalized_identity"], "raw_directory": str(raw), "raw_files": record["raw_files"]}
    except BaseException as error:
        record.update(status="FAIL", failure_type=type(error).__name__, failure=str(error), backup_progress=progress)
        write_new(target_path.parent/"normalization-failure.json", record)
        raise
    finally:
        if target is not None:
            target.close()
        if source is not None:
            source.close()


def _normalization_binding(path, before, custody):
    binding = custody.get("normalization")
    if type(binding) is not dict or set(binding) != {"receipt", "receipt_sha256"}:
        raise ValueError("census exact normalization receipt binding required")
    if not set(CUSTODY_KEYS).issubset(custody):
        raise ValueError("census normalization requires every original custody field")
    receipt = Path(binding["receipt"])
    if receipt.is_symlink() or file_sha(receipt) != binding["receipt_sha256"]:
        raise ValueError("census normalization receipt hash binding differs")
    record = json.loads(receipt.read_text())
    if type(record) is not dict:
        raise ValueError("census normalization receipt must be a structured record")
    raw = Path(custody["local_source"]).parent.resolve()
    if (record.get("schema") != NORMALIZATION_SCHEMA or record.get("status") != "PASS" or record.get("scope") != NORMALIZATION_SCOPE
            or record.get("raw_directory") != str(raw) or record.get("path") != str(path.resolve())
            or record.get("normalized_identity") != before or record.get("helper_sha256") != file_sha(Path(__file__))
            or record.get("receipt_scope") != NORMALIZATION_RECEIPT_SCOPE
            or record.get("profile") != "Disposable/WAL/OFF" or record.get("source_uri_mode") != "ro"
            or record.get("source_query_only") != 1 or record.get("source_synchronous") != 0 or record.get("target_synchronous") != 0
            or record.get("source_journal_mode") != "wal" or record.get("target_journal_mode") != "wal"
            or record.get("backup_pages_per_step") != 128 or record.get("backup_sleep_seconds") != 0 or record.get("backup_attempts") != 1
            or record.get("raw_unchanged") is not True or record.get("source_closed") is not True or record.get("target_closed") is not True
            or record.get("checkpoint") != [0,0,0]):
        raise ValueError("census normalization source/output/profile/custody differs")
    if any(type(record.get(name)) is not int for name in ("source_query_only", "source_synchronous", "target_synchronous",
           "backup_pages_per_step", "backup_sleep_seconds", "backup_attempts")):
        raise ValueError("census normalization numeric profile/attempt fields differ")
    progress = record.get("backup_progress", {})
    if (type(progress.get("calls")) is not int or progress["calls"] < 1
            or type(progress.get("remaining_pages")) is not int or progress["remaining_pages"] != 0
            or type(progress.get("total_pages")) is not int or progress["total_pages"] < 1
            or type(progress.get("last_status")) is not int or progress["last_status"] != sqlite3.SQLITE_DONE):
        raise ValueError("census normalization single bounded backup completion differs")
    with Path(path).open("rb") as stream:
        header = stream.read(100)
    if header[:16] != b"SQLite format 3\x00" or header[18:20] != bytes([2,2]):
        raise ValueError("census normalized Store does not retain the WAL header")
    clocks = [record.get(name) for name in ("started_monotonic", "completed_monotonic", "absolute_stop_monotonic")]
    if any(type(value) not in (int,float) or not math.isfinite(value) for value in clocks) or not 0 <= clocks[0] <= clocks[1] < clocks[2]:
        raise ValueError("census normalization completion/deadline differs")
    actual = _closed_store_files(raw, clocks[2])
    if (actual != record.get("raw_files") or actual != record.get("copied_files") or actual != record.get("raw_files_after")
            or actual["store.sqlite"] != {"sha256":custody["source_sha256"], "size":custody["source_size"]}):
        raise ValueError("census normalization exact raw SQLite set changed")
    return raw/"store.sqlite"


def commit_census(sealed_path, acknowledged_tuples, provider_fields, export_custody):
    """Unfiltered global membership, independently bound to public typed proof.

    The immutable census export is never the provider's writable offline copy.
    No ancestry filter, join, result limit, checkpoint, Store mutation or retry.
    """
    path = Path(sealed_path)
    before = _sealed_identity(path)
    custody, provider = dict(export_custody), dict(provider_fields)
    normalized = "normalization" in custody
    exported_path = _normalization_binding(path, before, custody) if normalized else path
    exported_identity = _closed_store_file(exported_path) if normalized else before
    if (custody.get("custody") != "KNOWN_STOP" or custody.get("remote_source") != "/layerfs-store/global/store.sqlite"
            or Path(custody.get("local_source", "")).resolve() != exported_path.resolve()
            or custody.get("source_sha256") != exported_identity["sha256"] or custody.get("source_size") != exported_identity["size"]
            or type(custody.get("container")) is not str or len(custody["container"]) != 64
            or any(char not in "0123456789abcdef" for char in custody["container"])
            or type(custody.get("volume")) is not str or not custody["volume"].startswith("layerfs-fsb-sample-")):
        raise ValueError("census exact known-Stop/export resource custody differs")
    manifest = Path(custody["prepared_manifest"])
    transcript = Path(custody["transcript"])
    if file_sha(manifest) != custody.get("prepared_manifest_sha256") or file_sha(transcript) != custody.get("transcript_sha256"):
        raise ValueError("census prepared manifest/transcript hash binding differs")
    export = Path(custody["export_completion"])
    runtime_events = Path(custody["runtime_events"])
    if file_sha(export) != custody.get("export_completion_sha256") or file_sha(runtime_events) != custody.get("runtime_events_sha256"):
        raise ValueError("census export/runtime custody receipt hashes differ")
    exported = json.loads(export.read_text())
    argv = exported.get("argv", [])
    directory_copy = [custody["container"]+":/layerfs-store/global", str(exported_path.parent.resolve())]
    file_copy = [custody["container"]+":/layerfs-store/global/store.sqlite", str(exported_path.resolve())]
    if (exported.get("status") != "PASS" or exported.get("exit_code") != 0 or exported.get("attempts") != 1
            or len(argv) != 6 or argv[:2] != ["docker", "--host"] or not argv[2].startswith("unix://")
            or argv[3] != "cp" or argv[4:] not in ((directory_copy,) if normalized else (directory_copy,file_copy))):
        raise ValueError("census exact acknowledged export command differs")
    events = [json.loads(line) for line in runtime_events.read_text().splitlines()]
    setup = [item for item in events if item.get("event") == "daemon_setup"]
    stopped = [item for item in events if item.get("event") == "container_stopped"]
    created = [item for item in events if item.get("event") == "sandbox_create_attempt"]
    if (not events or len(setup) != 1 or setup[0].get("fields",{}).get("container") != custody["container"]
            or len(stopped) != 1 or stopped[0].get("value") != custody["container"]
            or events[-1].get("event") != "finished" or stopped[0].get("sequence",0) >= events[-1].get("sequence",0)
            or len(created) != 1 or created[0].get("value","").split(" ")[0] != "volume="+custody["volume"]):
        raise ValueError("census known stopped runtime/container/volume custody differs")
    result = _commit_census_read_only(path, acknowledged_tuples, provider, manifest, transcript, before=before)
    result["custody"] = {key:custody[key] for key in CUSTODY_KEYS}
    if normalized:
        _normalization_binding(path, _sealed_identity(path), custody)
        result["custody"]["normalization"] = custody["normalization"]
    return result


def _commit_census_read_only(sealed_path, acknowledged_tuples, provider_fields, prepared_manifest, transcript_path, *, before=None):
    """Shared immutable SQL/provider proof, also qualified on native sealed fixtures.

    Public samples enter only through commit_census and its actual Docker custody
    checks. Native public-API regressions must never manufacture Docker events.
    """
    path = Path(sealed_path)
    before = _sealed_identity(path) if before is None else before
    provider = dict(provider_fields)
    manifest, transcript = Path(prepared_manifest), Path(transcript_path)
    transcript_sha256 = file_sha(transcript)
    bound = _manifest_identity(manifest)
    if (provider.get("provider_validation") != "current-public-schema-source-binding-validated"
            or provider.get("provider_store_sha256") != before["sha256"] or provider.get("provider_store_size") != before["size"]
            or provider.get("acknowledged_transcript_sha256") != transcript_sha256
            or any(provider.get(key) != value for key,value in bound.items())
            or type(provider.get("catalog_incarnation")) is not int or not 0 < provider["catalog_incarnation"] <= 2**63-1
            or type(provider.get("provider_store_unchanged")) is not int or provider["provider_store_unchanged"] not in (0,1)
            or type(provider.get("provider_store_after_size")) is not int or provider["provider_store_after_size"] <= 0):
        raise ValueError("census mandatory public provider validation/input/identity binding differs")
    _hex(provider["catalog_id"],32); _hex(provider["binding_sha256"],32)
    _hex(provider["provider_store_after_sha256"],32)
    unchanged = (provider["provider_store_after_sha256"] == before["sha256"] and provider["provider_store_after_size"] == before["size"])
    if provider["provider_store_unchanged"] != int(unchanged):
        raise ValueError("census public writable-copy after-seal observation differs")
    _hex(provider["base_layer_id"],33,0x32)
    expected, previous = [], None
    for row in acknowledged_tuples:
        if set(row) != set(CENSUS_COLUMNS):
            raise ValueError("census acknowledgement requires all five typed fields")
        values = (_hex(row["commit_id"],33,0x12), _hex(row["layer_stack_id"],17,0x31), _hex(row["root_id"],32),
                  None if row["parent_commit_id"] is None else _hex(row["parent_commit_id"],33,0x12), _hex(row["base_layer_id"],33,0x32))
        if values[3] != previous or row["layer_stack_id"] != provider["stack_id"] or row["base_layer_id"] != provider["base_layer_id"]:
            raise ValueError("census original first-parent/stack/base acknowledgement differs")
        previous = values[0]; expected.append(values)
    if (not expected or len({row[0] for row in expected}) != len(expected)
            or provider.get("final_head_commit_id") != expected[-1][0].hex()
            or provider.get("final_head_root") != expected[-1][2].hex()):
        raise ValueError("census exact unique acknowledged Commit set/final head differs")
    transcript_rows = transcript.read_text().splitlines()
    if len(transcript_rows) != len(expected)+1:
        raise ValueError("census full acknowledgement transcript cardinality differs")
    for step,line in enumerate(transcript_rows):
        columns = line.split("\t")
        wanted = ["-","-",provider["initial_root"]] if step == 0 else [expected[step-1][0].hex(),
                  expected[step-1][3].hex() if expected[step-1][3] is not None else "-", expected[step-1][2].hex()]
        if len(columns) != 5 or columns[0] != str(step) or columns[1:4] != wanted:
            raise ValueError("census typed tuples differ from complete retained acknowledgement transcript")
    expected.sort()
    count, batches, prior, mismatch = 0, 0, None, False
    digest = hashlib.sha256()
    connection = None
    try:
        connection = sqlite3.connect(path.resolve().as_uri()+"?mode=ro&immutable=1", uri=True, timeout=0, isolation_level=None)
        connection.execute("PRAGMA query_only=ON"); connection.execute("PRAGMA synchronous=OFF")
        if connection.execute("PRAGMA query_only").fetchone() != (1,) or connection.execute("PRAGMA synchronous").fetchone() != (0,):
            raise ValueError("census read-only Disposable connection profile differs")
        app, version = connection.execute("PRAGMA application_id").fetchone()[0], connection.execute("PRAGMA user_version").fetchone()[0]
        if app != 1279677264:
            raise ValueError("census current SQLite application identity differs")
        source, definition, tables = _schema_source(version)
        actual_definition = "".join(value+"\n" for row in connection.execute(DEFINITION_SQL) for value in row)
        actual_tables = [row[0] for row in connection.execute("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name")]
        meta = connection.execute("SELECT catalog_id,catalog_incarnation,binding_key,identity_format,schema_version,schema_source,schema_definition,next_stage_token FROM history_meta WHERE id=1").fetchall()
        policy = connection.execute("SELECT schema_version FROM store_policy WHERE id=1").fetchall()
        if (actual_definition != definition or actual_tables != tables or len(meta) != 1 or policy != [(version,)]) :
            raise ValueError("census full authoritative SQLite schema/definition/table contract differs")
        record = meta[0]
        if (_blob(record[0],32).hex() != provider["catalog_id"] or type(record[1]) is not int or record[1] != provider["catalog_incarnation"]
                or type(record[2]) is not bytes or not 1 <= len(record[2]) <= 128 or hashlib.sha256(record[2]).hexdigest() != provider["binding_sha256"]
                or record[3] != 1 or record[4] != version or record[5] != source or record[6] != definition
                or type(record[7]) is not int or record[7] <= 0):
            raise ValueError("census publicly bound catalog/metadata/source/definition differs")
        branch = connection.execute("SELECT layer_stack_id,base_layer_id,head_commit_id FROM branch WHERE branch_id=?", (_hex(provider["branch_id"],17,0x11),)).fetchall()
        if branch != [(_hex(provider["stack_id"],17,0x31), _hex(provider["base_layer_id"],33,0x32), previous)]:
            raise ValueError("census manifest Branch/base/final head differs")
        layer = connection.execute("SELECT layer_stack_id,root_id,parent_layer_id,source_branch_id,source_commit_id FROM layer WHERE layer_id=?", (_hex(provider["base_layer_id"],33,0x32),)).fetchall()
        if layer != [(_hex(provider["stack_id"],17,0x31), _hex(provider["initial_root"],32), None, None, None)]:
            raise ValueError("census manifest initial Layer/stack differs")
        stack = connection.execute("SELECT head_layer_id FROM layer_stack WHERE layer_stack_id=?", (_hex(provider["stack_id"],17,0x31),)).fetchall()
        if stack != [(_hex(provider["base_layer_id"],33,0x32),)]:
            raise ValueError("census manifest LayerStack head/base differs")
        cursor = connection.execute(CENSUS_SQL)
        while True:
            rows = cursor.fetchmany(127); batches += 1
            if not rows: break
            for row in rows:
                values = (_blob(row[0],33,0x12), _blob(row[1],17,0x31), _blob(row[2],32),
                          None if row[3] is None else _blob(row[3],33,0x12), _blob(row[4],33,0x32))
                if prior is not None and values[0] <= prior:
                    raise ValueError("census global Commit IDs are not unique sorted BLOBs")
                if count >= len(expected) or values != expected[count]: mismatch = True
                digest.update(json.dumps([value.hex() if value is not None else None for value in values],separators=(",",":")).encode()+b"\n")
                prior = values[0]; count += 1
        if mismatch or count != len(expected):
            raise ValueError("census global Commit membership or five-field tuples differ")
    finally:
        if connection is not None: connection.close()
        if _sealed_identity(path) != before:
            raise ValueError("census immutable export SHA/size changed during read-only proof")
    return {"schema":"fs-bench-pro-global-commit-census-v1", "status":"PASS", "commit_count":count,
            "fetch_batches_including_eof":batches, "query":CENSUS_SQL, "tuple_sha256":digest.hexdigest(),
            "source":before, "public_provider":{key:provider[key] for key in PROVIDER_KEYS},
            "schema_version":version, "schema_source_sha256":hashlib.sha256(source.encode()).hexdigest(),
            "schema_definition_sha256":hashlib.sha256(definition.encode()).hexdigest(), "authoritative_source_pins":SCHEMA_PINS,
            "scope":"unfiltered global Commit table to EOF; exact all acknowledged typed tuples and public catalog/manifest identity; immutable read-only source unchanged; provider validation used a separate writable offline Disposable copy"}


def helpers(directory=None):
    if directory is None:
        directory = Path(__file__).resolve().parents[2] / "cluster-two"
    else:
        directory = Path(directory).parent
    sys.path.insert(0, str(directory))
    from cells import git_index_oracle, git_queries, oracle, workloads
    return oracle, git_index_oracle, git_queries, workloads


def write_new(path, value):
    with Path(path).open("x") as stream:
        json.dump(value, stream, sort_keys=True, indent=2)
        stream.write("\n")


def file_sha(path):
    value = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for chunk in iter(lambda: stream.read(65536), b""):
            value.update(chunk)
    return value.hexdigest()


def snapshot(root, case, output, *, helper_directory=None, policy=None):
    tree, index, queries, workloads = helpers(helper_directory)
    root, output = Path(root).resolve(), Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    observed = tree.observe(root, case, output / "tree.jsonl")
    result = {"schema": "fs-bench-pro-independent-observation-v1", "case": case,
              "tree": observed, "tree_file": "tree.jsonl", "source_root": str(root),
              "scope": "complete declared tree, all payload bytes, kinds, names, mode, ownership and hard links",
              "omissions": "timing-cell cross-filesystem inode/mtime/ctime equality not claimed; original observations retained",
              "checker_sha256": file_sha(tree.__file__)}
    if case == "C12":
        if policy is None:
            raise ValueError("qualified version-pinned Git policy is required")
        qualified = json.loads(Path(policy).read_text())
        context = queries.collect(root, qualified, output / "git-queries",
                                  dict(workloads.ENV), deadline=time.monotonic() + 9.5, case=case)
        observed_index = index.observe(root, context["pin"])
        write_new(output / "index.json", observed_index)
        result.update(index_file="index.json", context=context,
                      index_sha256=file_sha(output / "index.json"),
                      omissions="original index stat-cache cross-filesystem fields excluded; complete semantic entries/TREE and checksum checked")
    write_new(output / "observation.json", result)
    return result


def prepare(root, case, output, *, helper_directory=None, policy=None):
    _, _, _, workloads = helpers(helper_directory)
    if case not in workloads.CF:
        raise ValueError("only the twelve prospectively selected cells are supported")
    body = workloads.COMMANDS[case]
    # Ordinary native execution independently constructs the expected state.
    # This is untimed oracle setup, never an N/P arm or reusable sample.
    subprocess.run(["/bin/bash", "-o", "pipefail", "-c", body], cwd=root,
                   env=workloads.ENV, check=True, timeout=120)
    return snapshot(root, case, output, helper_directory=helper_directory, policy=policy)


def compare_recorded(expected, actual, case, *, helper_directory=None):
    tree, index, queries, _ = helpers(helper_directory)
    expected, actual = Path(expected), Path(actual)
    want = json.loads((expected / "observation.json").read_text())
    got = json.loads((actual / "observation.json").read_text())
    for folder, record in ((expected, want), (actual, got)):
        if record["case"] != case or file_sha(folder / "tree.jsonl") != record["tree"]["manifest_sha256"]:
            raise ValueError("original tree observation case/hash differs")
    if case == "C12":
        left = json.loads((expected / "index.json").read_text())
        right = json.loads((actual / "index.json").read_text())
        if file_sha(expected / "index.json") != want["index_sha256"] or file_sha(actual / "index.json") != got["index_sha256"]:
            raise ValueError("retained Git index observation differs")
        queries.same_context(left["pin"], right["pin"])
        # Witness paths/hashes differ between independent containers. Their
        # semantic context was checked above; the original checker compares
        # one paired pin. Preserve each actual witness separately in its record.
        right = {**right, "pin": left["pin"], "pin_sha256": left["pin_sha256"]}
        result = index.compare_tree(expected / "tree.jsonl", actual / "tree.jsonl", case, left, right)
    else:
        result = tree.compare(expected / "tree.jsonl", actual / "tree.jsonl", case)
    return {"schema": "fs-bench-pro-independent-verification-v1", "case": case,
            "status": result["status"], "comparison": result,
            "scope": want["scope"], "omissions": want["omissions"],
            "expected_sha256": file_sha(expected / "observation.json"),
            "actual_sha256": file_sha(actual / "observation.json")}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("prepare", "snapshot", "verify", "compare"))
    parser.add_argument("--case", required=True)
    parser.add_argument("--root", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--expected", type=Path)
    parser.add_argument("--actual", type=Path)
    parser.add_argument("--helpers", type=Path)
    parser.add_argument("--policy", type=Path)
    args = parser.parse_args(argv)
    if args.operation == "prepare":
        result = prepare(args.root, args.case, args.output,
                         helper_directory=args.helpers, policy=args.policy)
    elif args.operation in ("snapshot", "verify"):
        result = snapshot(args.root, args.case, args.output,
                          helper_directory=args.helpers, policy=args.policy)
        if args.operation == "verify":
            result = compare_recorded(args.expected, args.output, args.case, helper_directory=args.helpers)
            write_new(args.output / "verification.json", result)
    else:
        result = compare_recorded(args.expected, args.actual, args.case, helper_directory=args.helpers)
    print(json.dumps(result, sort_keys=True))
    if result.get("status") == "FAIL":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
