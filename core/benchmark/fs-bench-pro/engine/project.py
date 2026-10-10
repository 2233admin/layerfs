"""Public ProjectApi provisioning through the existing release runtime."""
import json
import os
from pathlib import Path

from . import identity, receipts


def provision(source, volume, folder, build):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=False)
    sealed, manifest = folder / "store.sqlite", folder / "installed.manifest"
    events = folder / "provision.events.jsonl"
    info = Path(source).stat()
    argv = [build["binaries"]["runtime"]["path"], "provision", "--socket", build["socket"],
            "--volume", volume, "--daemon", build["binaries"]["daemon"]["path"],
            "--manifest", str(manifest), "--receipt", str(events),
            "--uid", str(info.st_uid), "--gid", str(info.st_gid),
            "--source-copy", str(Path(source).resolve()), "--sealed", str(sealed),
            "--init-seconds", "120", "--image", identity.IMAGE]
    attempted = receipts.command(argv, folder, "sdk-provision", 120,
                                 environment={**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1"})
    with events.open() as stream:
        rows = [json.loads(line) for line in stream]
    stopped = [row for row in rows if row["event"] == "setup_container_stopped"]
    if len(stopped) != 1 or not rows or rows[-1]["event"] != "finished":
        raise ValueError("original successful SDK provisioning/Stop acknowledgements missing")
    container = stopped[0]["value"]
    docker = ["docker", "--host", "unix://" + build["socket"]]
    status = receipts.command([*docker, "inspect", container, "--format", "{{.State.Running}}"],
                              folder, "setup-container-state", 15)
    if Path(status["stdout"]).read_text().strip() != "false":
        raise ValueError("provisioning container still running; custody retained: " + container)
    receipts.command([*docker, "rm", container], folder, "setup-remove-passing", 15)
    result = {"schema": "fs-bench-pro-provision-v1", "status": "PASS", "volume": volume,
              "source": str(source), "sealed_store": str(sealed), "store_sha256": identity.sha256(sealed),
              "manifest": str(manifest), "manifest_sha256": identity.sha256(manifest),
              "global_profile": "Disposable/WAL/OFF", "overlay_profile": "MEMORY/OFF/EXCLUSIVE",
              "construction_workers": 1, "init_parallel_profile": "supported Project Init profile unchanged",
              "attempt": attempted, "events": str(events), "container": container,
              "container_disposition": "known Stop, inspected not running, removed",
              "host_sqlite": "original host_init_setup event", "daemon_sqlite": "original install_setup event"}
    receipts.write_new(folder / "provision.json", result)
    return result
