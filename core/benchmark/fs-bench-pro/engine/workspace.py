"""The working SDK/Sandbox path with separate phases and exact raw counters."""
import hashlib
import json
from pathlib import Path
import secrets
import shlex
import sys
import time

from . import cache, fixtures, identity, receipts

sys.path.insert(0, str(identity.ROOT / "core/benchmark/cluster-two"))
from cells import counts, runner as cell_runner, workloads

BASELINE = identity.ROOT / "core/docs/issues/307/checks/timing-baseline-20261010/baseline.json"
BASELINE_SHA256 = "a6ada570050f14bb6ff5bd61c74c0d0fda439f323f695fdea1212b26b590d3f8"


def script(folder, name, body):
    path = Path(folder) / name
    with path.open("x") as stream:
        stream.write(body)
    path.chmod(0o444)
    return path


def readiness(runtime, key, seconds=5):
    deadline = time.monotonic() + seconds
    observations = []
    while True:
        row = runtime.send("cleanup", key, deadline=deadline)
        observations.append(row)
        if row["fields"]["state"] == "Gone":
            return observations
        # New read-only observations of ongoing automatic cleanup, not retries
        # of a mutation/unmount and never a maintenance invocation.
        if time.monotonic() >= deadline:
            raise TimeoutError("original physical cleanup did not reach Gone")
        time.sleep(min(0.005, max(0, deadline - time.monotonic())))


def endpoint(event, position="last"):
    return {"event_sequence": event["sequence"], "event": event["event"], "position": position}


def terminal_cache_observation(runtime, key, build, output):
    # Reclamation mutates overlay bytes after unmount. Establish the original
    # physical terminal boundary before observing stable backing identity.
    cleaned = readiness(runtime, key)
    observer = ["docker", "--host", "unix://" + build["socket"], "exec", "--user", "0:0", runtime.container,
                "python3", "-B", "/code/cache/residency.py", "--class", "B",
                "--store", "/layerfs-store/global/store.sqlite", "--overlay", "/layerfs-local/overlay/overlay.sqlite"]
    observed = receipts.command(observer, output, "cache-observation", 15)
    return cleaned, json.loads(Path(observed["stdout"]).read_text())


def price(groups, events, bindings):
    correlated = counts.correlate(events, groups)
    selectors = [{"label": "measured command", "before": "measured_mount_attach", "end": "command_end_status"},
                 {"label": "measured mount after warm terminal", "before": "warmup_unmount", "end": "measured_mount_attach"}]
    resolved = counts.resolve_selectors(selectors, bindings, correlated)
    priced = []
    for row in resolved:
        if row["status"] != "RESOLVED":
            raise ValueError("original count endpoint unavailable: " + row.get("reason", "unknown"))
        value = counts.phase_counts(groups, row["before_identity"], row["end_identity"],
                                    exclusive_observer_scope=True, label=row["label"], control_correlation=correlated)
        if value["status"] != "AVAILABLE":
            raise ValueError("original phase counters unavailable: " + value.get("reason", "unknown"))
        priced.append(value)
    command = priced[0]
    if "opcodes" not in command["raw"]:
        raise ValueError("original kernel opcode count unavailable")
    totals = {"requests": sum(command["raw"]["opcodes"]["by_opcode"]),
              "owner_jobs": command["adjusted"]["owner"]["admitted"],
              "statements": sum(row["executions"] for row in command["adjusted"]["sql_foreground"])}
    return totals, priced, correlated


def claim_key(cell, current, prepared, build):
    # Physical clone IDs, authority randomness, report dates and source commit
    # labels cannot manufacture a new sample of unchanged execution bytes.
    harness = {name: digest for name, digest in current["files"].items()
               if name.startswith(("core/benchmark/fs-bench-pro/engine/", "core/benchmark/cluster-two/cells/",
                                   "core/benchmark/cluster-two/cache/")) or name.endswith("/bench.py")}
    value = {"cell": cell, "cache_class": "B", "fixture": prepared["fixture"]["fixture_sha256"],
             "product": current["product_tree"], "harness": harness,
             "binaries": {name: row["sha256"] for name, row in build["binaries"].items()},
             "image": identity.IMAGE, "body": workloads.COMMANDS[cell]}
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


def one_cell(cell, prepared_folder, build_folder, output):
    current = identity.source_identity()
    if cell not in fixtures.CELL_RECIPES:
        raise ValueError("cell is not in the twelve-cell stage 0.4 selection")
    build = identity.load_build(build_folder)
    prepared = fixtures.load(prepared_folder, fixtures.CELL_RECIPES[cell])
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    claims = identity.ROOT / "benchmark-results/fs-bench-pro/claims"
    claims.mkdir(parents=True, exist_ok=True)
    key = claim_key(cell, current, prepared, build)
    with (claims / key).open("x") as stream:
        stream.write(str(output) + "\n")
    body = workloads.COMMANDS[cell]
    row = {"schema": "fs-bench-pro-workspace-cell-v1", "family": "cluster-two/cells", "case": cell,
           "source_commit": current["source_commit"], "product_tree": current["product_tree"],
           "identity": current, "build": str(build_folder), "daemon_sha256": build["binaries"]["daemon"]["sha256"],
           "runtime_sha256": build["binaries"]["runtime"]["sha256"], "image": identity.IMAGE,
           "status": "NOT_RUN", "attempted_operation_count": 0, "completed_operation_count": 0,
           "sample_count": 0, "cache_class": "B", "cache": {"class": "B"}, "phases": {},
           "counts": {}, "cleanup": "UNAVAILABLE", "proof_status": "NOT_RUN", "admission_eligible": False,
           "declared_limit_ns": 15_000_000_000, "verifier_limit_ns": 9_500_000_000,
           "global_profile": "Disposable/WAL/OFF", "overlay_profile": "MEMORY/OFF/EXCLUSIVE",
           "construction_workers": 1, "durable": "NOT_RUN — disabled by owner until explicit reauthorization",
           "interference": "single checkout lock; existing unrelated Docker containers share the VM, unquantified",
           "command_sha256": hashlib.sha256(body.encode()).hexdigest(), "claim": key}
    receipts.write_new(output / "selection.json", row)
    runtime = None
    bindings = {}
    clock = cell_runner.PerformanceClock()
    started = time.monotonic_ns()
    mounted = {}
    try:
        if identity.sha256(BASELINE) != BASELINE_SHA256:
            raise ValueError("closed twelve-cell count baseline differs from its pinned source")
        cloned = fixtures.clone(prepared, output / "clone", build)
        row["clone"] = cloned
        environment = output / "environment.txt"
        environment.write_text("".join(name + "=" + value + "\n" for name, value in workloads.ENV.items()))
        argv = [build["binaries"]["runtime"]["path"], "serve", "--socket", build["socket"],
                "--volume", cloned["volume"], "--daemon", build["binaries"]["daemon"]["path"],
                "--manifest", prepared["provision"]["manifest"], "--receipt", str(output / "runtime.events.jsonl"),
                "--uid", str(prepared["source_uid"]), "--gid", str(prepared["source_gid"]),
                "--environment-file", str(environment), "--observation-scope", secrets.token_hex(32)]
        runtime = cell_runner.EventProcess(argv, output, "runtime")
        runtime.event("protocol_ready", time.monotonic() + 15)
        if runtime.container is None:
            raise ValueError("original acknowledged container identity unavailable")
        row["container"] = runtime.container
        row["staging"] = fixtures.stage(runtime.container, prepared, output / "staging", build)
        warm = secrets.token_hex(32)
        mounted[warm] = runtime.send("mount", warm, deadline=time.monotonic() + 15)
        runtime.send("command", warm, script(output, "warmup.sh", body), deadline=time.monotonic() + 15)
        warm_unmount = runtime.send("unmount", warm, deadline=time.monotonic() + 15)
        bindings["warmup_unmount"] = endpoint(warm_unmount)
        mounted.pop(warm)
        row["warmup_cleanup"] = readiness(runtime, warm)
        row["cache"].update(fresh_mount=True, warmup_terminal_unmount=True, warmup_cleanup="Gone",
                            declaration="fresh mount on same warm daemon after one identical untimed call and terminal cleanup; no cold source claim")
        row["setup_ns"] = time.monotonic_ns() - started
        clock.begin(time.monotonic_ns())
        row.update(attempted_operation_count=1, sample_count=1)
        measured = secrets.token_hex(32)
        mount = runtime.send("mount", measured, deadline=time.monotonic() + 15)
        mounted[measured] = mount
        bindings["measured_mount_attach"] = endpoint(mount)
        row["phases"]["mount_ns"] = mount["span"]["duration_ns"]
        runtime.send("observe", deadline=time.monotonic() + 15)
        command = runtime.send("command", measured, script(output, "command.sh", cell_runner.inner_timed(body)),
                               deadline=time.monotonic() + 15)
        row["phases"]["command_ns"] = command["span"]["duration_ns"]
        row["command_in_container"] = cell_runner.inner_clock_observation(command)
        runtime.send("snapshot", measured, deadline=time.monotonic() + 15)
        status = next(event for event in reversed(runtime.rows) if event["event"] == "workspace_status")
        bindings["command_end_status"] = endpoint(status)
        proof_start = time.monotonic_ns()
        clock.begin_verifier(proof_start)
        inside = "/tmp/layerfs-r7-fsb-observed-" + secrets.token_hex(8)
        verify_body = "python3 -B /code/engine/oracle.py verify --case " + cell + " --root . --output " + inside + " --expected /code/expected-" + cell + " --helpers /code/cells --policy /code/git-default-policy.json"
        verified = runtime.send("verify", measured, script(output, "verify.sh", verify_body),
                                deadline=time.monotonic() + 9.5)
        proof = json.loads(Path(verified["fields"]["stdout"]).read_text())
        if proof["status"] != "PASS":
            raise ValueError("original independent oracle did not pass")
        row["proof_status"] = "PASS"
        row["verification"] = proof
        row["proof_wall_ns"] = time.monotonic_ns() - proof_start
        clock.end_verifier(time.monotonic_ns())
        unmounted = runtime.send("unmount", measured, deadline=time.monotonic() + 15)
        mounted.pop(measured)
        row["phases"]["unmount_ns"] = unmounted["span"]["duration_ns"]
        clock.finish(time.monotonic_ns())
        row["complete_wall_ns"] = clock.observe(time.monotonic_ns())["performance_ns"]
        row["performance_clock"] = clock.observe(time.monotonic_ns())
        # This per-file mincore observer is outside product time. No eviction,
        # sync call, cache coldness claim or missing-counter credit is added.
        row["cleanup_observations"], row["cache"]["residency"] = terminal_cache_observation(runtime, measured, build, output)
        row["cleanup"] = "Gone"
        runtime.send("observe", deadline=time.monotonic() + 15)
        runtime.send("stop", deadline=time.monotonic() + 15)
        runtime.event("finished", time.monotonic() + 15)
        if runtime.process.wait(timeout=1) != 0:
            raise ValueError("runtime process failed after its stop acknowledgement")
        row["custody"] = "KNOWN_STOP"
        row["completed_operation_count"] = 1
        docker = ["docker", "--host", "unix://" + build["socket"]]
        receipts.command([*docker, "cp", runtime.container + ":" + inside, str(output / "actual")],
                         output, "oracle-export", 15)
        # Preserve expected raw observations too, so verify never needs a mount
        # or a disposed sample volume and performs no second product sample.
        import shutil
        shutil.copytree(prepared["oracles"]["cases"][cell]["path"], output / "expected")
        logs = receipts.command([*docker, "logs", "--timestamps=false", runtime.container], output, "daemon-logs", 15)
        groups = {}
        for path in (logs["stdout"], logs["stderr"]):
            groups.update(cell_runner.telemetry(path))
        words = lambda value: [int(value[index:index+16], 16) for index in range(0, 64, 16)]
        for group in groups.values():
            if group[0]["daemon"] != words(runtime.daemon_instance) or group[0]["scope"] != words(runtime.scope):
                raise ValueError("original numeric daemon/scope differs from authenticated runtime")
        totals, priced, correlated = price(groups, runtime.rows, bindings)
        row.update(counts=totals, phase_counts=priced, control_correlation=correlated)
        observations = {}
        cell_runner.snapshot_observations(runtime, observations)
        cell_runner.ingest_observations(groups, observations, row["cache"])
        row["observations"] = observations
        row["cache"]["status"] = cache.validate("B", row["cache"])
        row["status"] = "PASS" if row["cache"]["status"] == "ELIGIBLE" else "INELIGIBLE"
        wanted = next(item for item in json.loads(BASELINE.read_text())["selections"] if item["cell"] == cell)
        row["count_reproduction"] = {"expected": {name: wanted[name] for name in totals},
                                      "actual": totals, "status": "PASS" if all(totals[name] == wanted[name] for name in totals) else "FAIL"}
        if row["count_reproduction"]["status"] != "PASS":
            row.update(status="FAIL", tag="stage 0.4 exact request/owner-job/statement counts differ")
        if row["status"] == "PASS":
            stopped = receipts.command([*docker, "inspect", runtime.container, "--format", "{{.State.Running}}"],
                                       output, "container-state", 15)
            if Path(stopped["stdout"]).read_text().strip() != "false":
                raise ValueError("original container Stop is not confirmed")
            receipts.command([*docker, "rm", runtime.container], output, "remove-passing-container", 15)
            receipts.command([*docker, "volume", "rm", cloned["volume"]], output, "remove-passing-volume", 15)
            row["resource_disposition"] = "passing sample container and volume removed"
        else:
            row["resource_disposition"] = "stopped container and sample volume retained for failed/ineligible evidence"
    except BaseException as error:
        row.update(status="FAIL", original_failure_type=type(error).__name__, original_failure=str(error),
                   retained_mount_keys=list(mounted), resource_disposition="original resources retained; no inferred unmount/stop/removal")
        if clock.started is not None:
            row["complete_wall_ns"] = clock.observe(time.monotonic_ns())["performance_ns"]
        if clock.verifier_started is not None:
            row.update(proof_status="FAIL", proof_wall_ns=time.monotonic_ns() - clock.verifier_started)
        if runtime is None:
            runtime = getattr(error, "event_process", None)
        if runtime is not None:
            row["retained_host_custody"] = runtime.retain(error)
            row["container"] = runtime.container
    finally:
        if runtime is not None:
            for value in (runtime.selector, runtime.raw, runtime.stderr,
                          getattr(runtime.process, "stdin", None), getattr(runtime.process, "stdout", None)):
                if value is not None:
                    try:
                        value.close()
                    except BaseException as closing:
                        row.setdefault("independent_close_failures", []).append(str(closing))
                        row["status"] = "FAIL"
        row["external_driver_wall_ns"] = time.monotonic_ns() - started
        row["timing_scope"] = "matrix controller: measured mount through terminal unmount, independent verifier excluded; setup/cache residency/cleanup/Stop separate; original control observation overhead retained"
        row["evidence"] = str(output.relative_to(identity.ROOT.resolve()))
        receipts.write_new(output / "receipt.json", row)
        receipts.manifest(output)
    return row
