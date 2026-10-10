"""The working SDK/Sandbox path with separate phases and exact raw counters."""
import hashlib
import json
import os
from pathlib import Path
import secrets
import shlex
import sys
import time
import uuid

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


def terminal_cache_observation(runtime, key, build, output, cache_class="B"):
    # Reclamation mutates overlay bytes after unmount. Establish the original
    # physical terminal boundary before observing stable backing identity.
    cleaned = readiness(runtime, key)
    observer = ["docker", "--host", "unix://" + build["socket"], "exec", "--user", "0:0", runtime.container,
                "python3", "-B", "/code/cache/residency.py", "--class", cache_class,
                "--store", "/layerfs-store/global/store.sqlite", "--overlay", "/layerfs-local/overlay/overlay.sqlite"]
    observed = receipts.command(observer, output, "cache-observation", 15)
    return cleaned, json.loads(Path(observed["stdout"]).read_text())


def price(groups, events, bindings, measured_label="measured command", with_warm_mount=True):
    correlated = counts.correlate(events, groups)
    selectors = [{"label": measured_label, "before": "measured_mount_attach", "end": "command_end_status"}]
    if with_warm_mount:
        selectors.append({"label": "measured mount after warm terminal", "before": "warmup_unmount", "end": "measured_mount_attach"})
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


def collect_family_observations(runtime, row, build, output, bindings, deadline=None):
    docker = ["docker", "--host", "unix://" + build["socket"]]
    logs = receipts.command([*docker, "logs", "--timestamps=false", runtime.container], output, "daemon-logs",
                            15 if deadline is None else operation_deadline(deadline, 15)-time.monotonic())
    groups = {}
    for path in (logs["stdout"], logs["stderr"]):
        groups.update(cell_runner.telemetry(path))
    words = lambda value: [int(value[index:index+16], 16) for index in range(0, 64, 16)]
    for group in groups.values():
        if group[0]["daemon"] != words(runtime.daemon_instance) or group[0]["scope"] != words(runtime.scope):
            raise ValueError("original numeric daemon/scope differs from authenticated channel")
    totals, priced, correlated = price(groups, runtime.rows, bindings, row.get("counts_scope", "measured command and Commit"),
                                      with_warm_mount="warmup_unmount" in bindings)
    row.update(counts=totals, phase_counts=priced, control_correlation=correlated)
    cell_runner.snapshot_observations(runtime, row["observations"])
    cell_runner.ingest_observations(groups, row["observations"], row["cache"])
    row["cache"]["status"] = cache.validate(row.get("cache_class", "B"), row["cache"])


def operation_deadline(group_stop, seconds):
    stop = time.monotonic() + seconds
    if group_stop is not None:
        if time.monotonic() >= group_stop:
            raise TimeoutError("original edit/Commit/End group watchdog expired")
        stop = min(stop, group_stop)
    return stop


def verify_native_receipt(case, verified):
    text = Path(verified["fields"]["stdout"]).read_text()
    if case["v016_case"] == "local-snapshot-create-25000-onebyte-v1":
        paths = [".", *[f"f{i:05}" for i in (0, 1, 97, 194, 12500, 24998, 24999)]]
        omissions = "unselected paths, bytes beyond selected ranges, exhaustive inode/object/reference census, alias and failure injection semantics"
        contract = {"schema": "original-local-snapshot-sample-v1", "sampled_paths": paths,
                    "sampled_ranges": {path: [[0, 1]] for path in paths[1:]}, "absent_paths": [],
                    "full_namespace_verified": False, "full_file_bytes_verified": False, "omissions": omissions}
        expected = ("absent_paths=\nfull_file_bytes_verified=false\nfull_namespace_verified=false\nomissions=" + omissions +
                    "\nsampled_paths=" + "\n".join(paths) + "\nsampled_ranges=" + "\n".join(path + ":0..1" for path in paths[1:]) + "\n")
        if case.get("native_verifier") != contract or verified["fields"].get("exit_code") != "0" or text != expected:
            raise ValueError("original local snapshot sample receipt/selection/successful exit differs")
        return {**contract, "status": "PASS", "original_omissions": omissions,
                "original_stdout_sha256": hashlib.sha256(text.encode()).hexdigest(),
                "scope": "unchanged original bounded native sample; full four-root/public census proof remains separately required"}
    proof = dict(line.split("=", 1) for line in text.splitlines())
    if proof.get("verification_status") != "pass":
        raise ValueError("original complete native verifier refused freshly remounted published root")
    return proof


def history_free_space(output):
    import shutil
    free = shutil.disk_usage(output).free
    if free < 50 * 1024**3:
        raise RuntimeError("smoke free disk reserve")
    return free


def history_resource_guard(runtime, build, output, label, before=None):
    """Original smoke guards in current ownership domains; no mounted payload read."""
    free = history_free_space(output)
    body = """import json,os
from pathlib import Path
def disk(root):
    return sum(os.lstat(Path(base)/name).st_blocks*512 for base,_,files in os.walk(root) for name in files)
cgroup={}
for name in ('cpu.stat','memory.events','memory.stat'):
    for line in Path('/sys/fs/cgroup/'+name).read_text().splitlines():
        key,value=line.split();cgroup[key]=int(value)
for key,name in (('memory_peak','memory.peak'),('memory_current','memory.current'),('swap_current','memory.swap.current')):
    cgroup[key]=int(Path('/sys/fs/cgroup/'+name).read_text())
store=[Path('/layerfs-store/global/store.sqlite'+suffix) for suffix in ('','-wal','-shm','-journal')]
print(json.dumps({'cgroup':cgroup,'spool_allocated_bytes':disk('/layerfs-local'),'staging_allocated_bytes':disk('/code'),
 'store_logical_bytes':sum(p.stat().st_size for p in store if p.exists()),'store_allocated_bytes':sum(p.stat().st_blocks*512 for p in store if p.exists())}))
"""
    docker = ["docker", "--host", "unix://" + build["socket"]]
    observed = receipts.command([*docker, "exec", "--user", "0:0", runtime.container,
                                 "python3", "-B", "-c", body], output, label, 30)
    row = json.loads(Path(observed["stdout"]).read_text())
    row["host_free_bytes"] = free
    row["receipt_allocated_bytes"] = sum(path.stat().st_blocks * 512 for path in Path(output).rglob("*") if path.is_file())
    row["scope"] = "actual own container cgroup; current overlay/local backing and staged helpers; host receipt tree; lifetime peaks diagnostic only"
    for key in ("oom", "oom_kill", "swap_current"):
        if type(row["cgroup"].get(key)) is not int:
            raise ValueError("original smoke resource observation unavailable: " + key)
    if row["cgroup"]["swap_current"] or before and any(row["cgroup"][key] != before["cgroup"][key] for key in ("oom", "oom_kill")):
        raise RuntimeError("container OOM/swap")
    if row["spool_allocated_bytes"] + row["staging_allocated_bytes"] > 16 * 1024**3 or row["receipt_allocated_bytes"] > 32 * 1024**3:
        raise RuntimeError("smoke disk budget")
    if row["store_logical_bytes"] > 16 * 1024**3 or row["store_allocated_bytes"] > 16 * 1024**3:
        raise RuntimeError("storage smoke Store budget")
    return row


def history_container_profile(runtime, build, output):
    """Select the frozen original container profile before any measured work."""
    docker = ["docker", "--host", "unix://" + build["socket"]]
    receipts.command([*docker, "update", "--cpus", "2", "--memory", "2147483648", "--memory-swap", "2147483648", "--pids-limit", "256", runtime.container],
                     output, "history-container-profile", 30)
    observed = receipts.command([*docker, "inspect", runtime.container, "--format", "{{json .HostConfig}}"],
                                output, "history-container-profile-readback", 30)
    config = json.loads(Path(observed["stdout"]).read_text())
    wanted = {"NanoCpus": 2_000_000_000, "Memory": 2_147_483_648, "MemorySwap": 2_147_483_648, "PidsLimit": 256}
    if any(config.get(name) != value for name, value in wanted.items()):
        raise ValueError("original small-delta container resource profile differs")
    return wanted


def ordinary_resource_values(row, before=None):
    """Frozen ordinary main-file/cgroup guards; no substituted peak or pager claim."""
    for name in ("store_main_logical_bytes", "store_main_allocated_bytes", "oom", "oom_kill", "swap_current"):
        if type(row.get(name)) is not int or row[name] < 0:
            raise ValueError("original ordinary resource observation unavailable: " + name)
    if any(row[name] > 4 * 1024**3 for name in ("store_main_logical_bytes", "store_main_allocated_bytes")):
        raise RuntimeError("sample Store exceeds frozen 4 GiB bound")
    if row["swap_current"] or before and any(row[name] != before[name] for name in ("oom", "oom_kill")):
        raise RuntimeError("original ordinary container OOM/swap")
    return row


def ordinary_resource_guard(runtime, build, output, label, before=None, seconds=15):
    """Observe only the actual sample's backing stat/cgroup outside product time."""
    body = """import json
from pathlib import Path
store=Path('/layerfs-store/global/store.sqlite').stat()
events=dict(line.split() for line in Path('/sys/fs/cgroup/memory.events').read_text().splitlines())
print(json.dumps({'store_main_logical_bytes':store.st_size,'store_main_allocated_bytes':store.st_blocks*512,
 'oom':int(events['oom']),'oom_kill':int(events['oom_kill']),
 'swap_current':int(Path('/sys/fs/cgroup/memory.swap.current').read_text())}))
"""
    docker = ["docker", "--host", "unix://" + build["socket"]]
    attempted = receipts.command([*docker, "exec", "--user", "0:0", runtime.container,
                                  "python3", "-B", "-c", body], output, label, seconds)
    row = json.loads(Path(attempted["stdout"]).read_text())
    row["scope"] = "original 4GiB main Store apparent/allocated bound; actual own container OOM/swap; retired host Store RSS/physical-spool peak not asserted"
    return ordinary_resource_values(row, before)


def original_operation_counts(command, wanted):
    """Check retained frozen semantic work counters without replaying any work."""
    if command is None:
        raise ValueError("original operation counters require the acknowledged workload")
    lines = Path(command["fields"]["stdout"]).read_text().splitlines()
    found = {}
    for name, value in wanted.items():
        matches = [line.partition("=")[2] for line in lines if line.partition("=")[0] == name]
        if (type(value) is not int or value < 0 or len(matches) != 1
                or not matches[0].isascii() or not matches[0].isdigit() or int(matches[0]) != value):
            raise ValueError("original measured workload semantic count differs: " + name)
        found[name] = value
    return found


def git_custody_values(body, fields):
    """Validate the complete frozen repository seal, including raw index SHA."""
    lines = body.decode("utf-8").splitlines()
    if not lines or lines.pop(0) != "workspace-independent-manifest-v1":
        raise ValueError("original Git custody manifest header differs")
    paths, logical = [], 0
    for row in lines:
        columns = row.split("\t")
        if len(columns) != 7:
            raise ValueError("original Git custody requires seven columns")
        path, kind, length, mode, seconds, nanos, digest = columns
        if path != "." and (not (path == ".git" or path.startswith(".git/"))
                or any(part in ("", ".", "..") for part in path.split("/"))):
            raise ValueError("original Git custody path outside .git")
        if (kind not in ("file", "directory") or not length.isascii() or not length.isdigit()
                or not mode or any(value not in "01234567" for value in mode)
                or not seconds.lstrip("-").isascii() or not seconds.lstrip("-").isdigit()
                or not nanos.isascii() or not nanos.isdigit() or not 0 <= int(nanos) < 1_000_000_000):
            raise ValueError("original Git custody kind/metadata differs")
        if kind == "directory" and (length != "0" or digest != "-"):
            raise ValueError("original Git custody directory content differs")
        if kind == "file":
            if len(digest) != 64 or any(value not in "0123456789abcdef" for value in digest):
                raise ValueError("original Git custody requires complete SHA-256")
            logical += int(length)
        paths.append(path)
    if (paths != sorted(set(paths)) or paths[:2] != [".", ".git"]
            or ".git/index" not in paths or logical > 256 * 1024**2
            or fields.get("repository_manifest_sha256") != hashlib.sha256(body).hexdigest()
            or fields.get("repository_path_count") != str(len(paths) - 1)):
        raise ValueError("original complete Git custody identity/count/bound differs")
    return {"manifest_sha256": hashlib.sha256(body).hexdigest(), "repository_paths": len(paths)-1,
            "repository_logical_bytes": logical, "index_stat_bytes": "complete raw index bytes covered by SHA-256, not tuple substitution"}


def _capture_git_custody(runtime, selected, prepared, build, output, label, seconds):
    if (prepared.get("family") != "git_tool_workflow" or not prepared.get("git_reference")
            or prepared["git_reference"].get("case") != prepared.get("case")):
        raise ValueError("explicit qualified frozen Git workflow preparation required")
    if seconds <= 0 or seconds > 59:
        raise ValueError("bounded original Git custody proof allowance required")
    folder = Path(output) / label
    folder.mkdir(parents=True, exist_ok=False)
    stop = time.monotonic() + seconds
    inside = "/tmp/layerfs-fsb-" + label + "-" + uuid.uuid4().hex + ".tsv"
    body = "exec /code/writers/workload workspace-git-custody-out " + shlex.quote(inside)
    event = runtime.send("verify", selected, script(folder, "capture.sh", body), deadline=stop)
    fields = dict(line.split("=", 1) for line in Path(event["fields"]["stdout"]).read_text().splitlines())
    left = stop - time.monotonic()
    if left <= 0:
        raise TimeoutError("original Git custody proof allowance expired")
    path = folder / "repository.tsv"
    receipts.command(["docker", "--host", "unix://" + build["socket"], "cp", runtime.container + ":" + inside, str(path)],
                     folder, "export", min(15, left))
    values = git_custody_values(path.read_bytes(), fields)
    path.chmod(0o444)
    witness = {"schema": "fs-bench-pro-original-git-custody-v1", "status": "PASS", "case": prepared["case"],
               "mount_key": selected, "path": str(path), "values": values, "capture": event,
               "reference": prepared["git_reference"],
               "scope": "original complete .git names/kinds/modes/mtime/lengths/full SHA, index stat bytes included; read-only mounted observer, no Git command or mounted write"}
    receipts.write_new(folder / "custody.json", witness)
    receipts.manifest(folder)
    return witness


def before_git_commit(runtime, selected, prepared, build, output, seconds):
    """One excluded mounted observer immediately before the one measured Commit."""
    return _capture_git_custody(runtime, selected, prepared, build, output, "git-precommit", seconds)


def verify_git_custody(runtime, verify_mount, prepared, build, output, prior, seconds):
    """Fresh published-root parity BEFORE any semantic Git command can edit index."""
    receipts.verify_manifest(Path(prior["path"]).parent)
    if prior.get("case") != prepared.get("case") or identity.sha256(prior["path"]) != prior["values"]["manifest_sha256"]:
        raise ValueError("precommit Git custody source identity differs")
    fresh = _capture_git_custody(runtime, verify_mount, prepared, build, output, "git-reopened", seconds)
    if Path(prior["path"]).read_bytes() != Path(fresh["path"]).read_bytes():
        raise ValueError("original complete precommit/reopened Git custody mismatch")
    return {"status": "PASS", "precommit": prior, "reopened": fresh,
            "scope": "exact full manifest equality; all .git bytes/metadata including raw index stat-cache retained before semantic verification"}


def verify_git_semantic_fields(proof, prepared):
    """Require every frozen native Git proof field, independently prepared IDs."""
    bundle = Path(prepared["helpers"]["root"]) / "git-reference"
    for name in ("head", "tree", "parent"):
        wanted = (bundle / ("expected-" + name)).read_text().strip()
        if proof.get("git_" + name) != wanted:
            raise ValueError("original independent Git semantic identity differs: " + name)
    if (proof.get("verification_status") != "pass" or proof.get("git_semantic_verification_status") != "pass"
            or proof.get("git_custody_status") != "requires_precommit_reopen_comparison"):
        raise ValueError("original Git semantic/fsck/clean/two-commit proof missing")
    return {"status": "PASS", "head": proof["git_head"], "tree": proof["git_tree"], "parent": proof["git_parent"],
            "scope": "original verify_git performed exact HEAD/tree/parent, fsck--strict, clean status, exactly2Gitcommits and complete independent working source"}


def verify_git_qualification(command, case):
    """Original intermediate mounted guards run once outside performance time."""
    if not case.get("git_workflow") or not case.get("git_qualification"):
        raise ValueError("explicit original Git prior verification variant required")
    wanted = {**case["original_operation_counts"], "benchmark_verifier_count": 1}
    found = original_operation_counts(command, wanted)
    lines = Path(command["fields"]["stdout"]).read_text().splitlines()
    if lines.count("workload_status=pass") != 1 or lines.count("scenario_id="+case["v016_case"]) != 1 or lines.count("seed=1") != 1:
        raise ValueError("original mounted Git verification-variant identity/status differs")
    return {"status": "PASS", "counts": found,
            "scope": "unchanged original verify variant: exact first-status paths/statuses, native reference tracked diff bytes/membership and alternating temporary-save readback/rename absence; prior mounted original genesis, discarded without Commit"}


def git_proof_deadlines(case, charged_ns):
    """Frozen ordinary work/cleanup/publication policy, cumulative across proofs."""
    if (not case.get("git_workflow") or type(charged_ns) is not int or charged_ns < 0
            or case["budget"]["verifier_ms"] != 45000
            or case["budget"]["verification_hard_watchdog_ms"] != 59000):
        raise ValueError("original Git 45s work/4s cleanup reserve/59s hard policy required")
    now = time.monotonic()
    return {"work": now+41-charged_ns/1e9, "cleanup": now+45-charged_ns/1e9,
            "publication": now+59-charged_ns/1e9}


def history_observer(clock, row, label, action):
    """Retain raw observer wall and exclude it even when a resource guard fails."""
    started = time.monotonic_ns()
    clock.begin_verifier(started)
    try:
        return action()
    finally:
        ended = time.monotonic_ns()
        clock.end_verifier(ended)
        row.setdefault("observer_intervals", []).append({"label": label, "start_monotonic_ns": started,
            "end_monotonic_ns": ended, "complete_wall_ns": ended-started,
            "scope": "read-only original observer/verifier; excluded from product time, included in the applicable original absolute watchdog"})


def qualify_history_mechanism(proofs):
    """Frozen existence condition, separate from byte/history proof and quotas."""
    known = all(type(item.get("fields", {}).get("payload_dependency_records")) is int
                and item["fields"]["payload_dependency_records"] >= 0
                and type(item["fields"].get("payload_objects")) is int
                and item["fields"]["payload_objects"] > 0 for item in proofs)
    if len(proofs) != 31 or not known:
        return {"status": "FAIL", "reason": "original actual payload DELTA-path evidence unavailable",
                "semantic_proof_status": "PASS", "payload_dependency_record_observations": "UNAVAILABLE"}
    count = sum(item["fields"]["payload_dependency_records"] for item in proofs)
    return {"status": "PASS" if any(item["fields"]["payload_dependency_records"] for item in proofs) else "FAIL",
            "reason": "authenticated selected payload dependency reconstruction observed" if count else
                      "original actual payload DELTA-path condition unmet: all selected payload records FULL",
            "semantic_proof_status": "PASS", "payload_dependency_record_observations": count,
            "scope": "existence only; per-state/file observations may repeat content IDs; no count/percentage/storage/latency quota; retired schema10 counters N/A"}


def one_family_case(family, case, prepared_folder, build_folder, output):
    """Single ordinary call/Commit through the same SDK/Sandbox machinery."""
    current = identity.source_identity()
    build = identity.load_build(build_folder)
    prepared = fixtures.load(prepared_folder, case["fixture"]["recipe"])
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    ordered = bool(case.get("history_schedule"))
    small_history = ordered and case["v016_case"] == "small-file-delta-10x30-v1"
    body = None if case.get("control_only") else "/bin/bash /code/workload.sh apply " + shlex.quote(case["v016_case"])
    bodies = ["/bin/bash /code/" + step["run"] for step in case["steps"]] if ordered else [body]
    if ordered and (len(bodies) != case["history_schedule"]["commits"] or any(not step.get("commit") for step in case["steps"])):
        raise ValueError("original ordered history requires all declared saves and Commits")
    treatment = {"family": family, "case": case, "fixture": prepared["fixture"]["fixture_sha256"],
                 "product": current["product_tree"], "body": bodies, "helpers": prepared["helpers"]["files"],
                 "binaries": {name: row["sha256"] for name, row in build["binaries"].items()},
                 "engine": identity.sha256(__file__), "image": identity.IMAGE}
    key = hashlib.sha256(json.dumps(treatment, sort_keys=True).encode()).hexdigest()
    claims = identity.ROOT / "benchmark-results/fs-bench-pro/claims"
    claims.mkdir(parents=True, exist_ok=True)
    with (claims / key).open("x") as stream:
        stream.write(str(output) + "\n")
    row = {"schema": "fs-bench-pro-workspace-family-v1", "family": family, "case": case["id"],
           "source_commit": current["source_commit"], "product_tree": current["product_tree"], "identity": current,
           "build": str(Path(build_folder).resolve()), "prepared": str(Path(prepared_folder).resolve()),
           "daemon_sha256": build["binaries"]["daemon"]["sha256"], "runtime_sha256": build["binaries"]["runtime"]["sha256"],
           "image": identity.IMAGE, "status": "NOT_RUN", "proof_status": "NOT_RUN", "counts": {}, "phases": {},
           "observations": {}, "cache_class": case.get("cache_class", "B"), "cache": {"class": case.get("cache_class", "B")}, "cleanup": "UNAVAILABLE",
           "declared_limit_ns": case["budget"]["command_ms"] * 1_000_000,
           "verifier_limit_ns": case["budget"]["verifier_ms"] * 1_000_000,
           "global_profile": "Disposable/WAL/OFF", "overlay_profile": "MEMORY/OFF/EXCLUSIVE", "construction_workers": 1,
           "durable": "NOT_RUN — disabled by owner until explicit reauthorization", "claim": key,
           "attempted_operation_count": 0, "completed_operation_count": 0, "sample_count": 0,
           "interference": "single checkout lock; unrelated and own retained failed containers share Docker VM, unquantified"}
    receipts.write_new(output / "selection.json", row)
    runtime = None
    mounted = set()
    bindings = {}
    clock = cell_runner.PerformanceClock()
    proof_started = None
    preproof_ns = 0
    publication_stop = None
    proof_cleanup_stop = None
    try:
        row["clone"] = fixtures.clone(prepared, output / "clone", build)
        environment = output / "environment.txt"
        environment.write_text("".join(name + "=" + value + "\n" for name, value in workloads.ENV.items()))
        argv = [build["binaries"]["runtime"]["path"], "serve", "--socket", build["socket"],
                "--volume", row["clone"]["volume"], "--daemon", build["binaries"]["daemon"]["path"],
                "--manifest", prepared["provision"]["manifest"], "--receipt", str(output / "runtime.events.jsonl"),
                "--uid", str(prepared["source_uid"]), "--gid", str(prepared["source_gid"]),
                "--environment-file", str(environment), "--observation-scope", secrets.token_hex(32)]
        if ordered:
            argv.extend(["--case", case["v016_case"]])
        runtime = cell_runner.EventProcess(argv, output, "runtime")
        runtime.event("protocol_ready", time.monotonic() + 15)
        row["container"] = runtime.container
        if runtime.container is None:
            raise ValueError("original container acknowledgement unavailable")
        if ordered or case.get("original_ordinary_guards"):
            row["container_profile"] = history_container_profile(runtime, build, output)
        row["staging"] = fixtures.stage(runtime.container, prepared, output / "staging", build)
        if case.get("original_ordinary_guards"):
            row["ordinary_resource_guards"] = {"before": ordinary_resource_guard(runtime, build, output, "ordinary-resources-before"), "steps": []}
        if ordered:
            if small_history:
                row["resource_guards"] = {"before": history_resource_guard(runtime, build, output, "history-resources-before"), "steps": []}
            row["cache"].update(same_mount=True, warm_interval_ns=None,
                declaration="one original Workspace for all declared saves/Commits; setup and prior own-write cache uncontrolled; no warmup Commit or independent coldness proof")
            row["history"] = {"initial_root": next(event for event in runtime.rows if event["event"] == "history_initial_root")["fields"]["root"], "commits": []}
        else:
            warm = secrets.token_hex(32)
            git_proof_start = time.monotonic_ns() if case.get("git_workflow") else None
            git_deadlines = git_proof_deadlines(case, preproof_ns) if git_proof_start is not None else None
            git_proof_stop = git_deadlines["work"] if git_deadlines else None
            git_cleanup_stop = git_deadlines["cleanup"] if git_deadlines else None
            if git_deadlines:
                publication_stop = git_deadlines["publication"]
                row["git_proof_policy"] = {"work_limit_seconds": 45, "cleanup_reserve_seconds": 4,
                    "hard_limit_seconds": 59, "publication_guard_seconds": .25,
                    "scope": "cumulative prior qualification, precommit custody and final proof; required early mount cleanup/Stop/export also charged, measured performance interval excluded"}
            try:
                runtime.send("mount", warm, deadline=operation_deadline(git_proof_stop, 15))
                mounted.add(warm)
                if case.get("git_workflow"):
                    qualification_body = "/bin/bash /code/" + case["git_qualification"]["run"]
                    qualified = runtime.send("command", warm, script(output, "prior-qualification.sh", qualification_body),
                                             deadline=operation_deadline(git_proof_stop, case["budget"]["verifier_ms"]/1000))
                    row["git_prior_qualification"] = {"command": qualified, "proof": verify_git_qualification(qualified, case),
                        "disposition": "original mounted verification variant; End without Commit discards changes before exact performance variant"}
                elif body is not None:
                    runtime.send("command", warm, script(output, "warmup.sh", body), deadline=time.monotonic() + 120)
                warm_end = runtime.send("unmount", warm, deadline=operation_deadline(git_cleanup_stop, 15))
                mounted.remove(warm)
                cleanup_seconds = 5 if git_cleanup_stop is None else min(5, git_cleanup_stop-time.monotonic())
                if cleanup_seconds <= 0:
                    raise TimeoutError("original Git prior qualification watchdog expired before cleanup")
                row["warmup_cleanup"] = readiness(runtime, warm, cleanup_seconds)
            finally:
                if git_proof_start is not None:
                    preproof_ns += time.monotonic_ns()-git_proof_start
                    publication_stop = git_proof_deadlines(case, preproof_ns)["publication"]
                    row["prior_proof_wall_ns"] = preproof_ns
                    row["proof_status"] = "FAIL"
            bindings["warmup_unmount"] = endpoint(warm_end)
            row["cache"].update(fresh_mount=True, warmup_terminal_unmount=True, warmup_cleanup="Gone",
                                declaration=("prior read-only mount ended without Exec; fresh measured connection; setup warmth declared; no cold claim" if body is None else
                                             "same untimed ordinary workload on prior mount, then terminal cleanup; fresh measured connection; setup warmth declared; no cold claim"))
            if case.get("git_workflow"):
                row["cache"].update(identical_warmup=False,
                    declaration="prior original verification variant includes additional verifier reads and ends without Commit; measured performance variant unchanged; identical-body/cache qualification unavailable")
        selected = secrets.token_hex(32)
        clock.begin(time.monotonic_ns())
        row.update(attempted_operation_count=1, sample_count=1)
        mount = runtime.send("mount", selected, deadline=time.monotonic() + 15)
        mounted.add(selected)
        bindings["measured_mount_attach"] = endpoint(mount)
        row["phases"]["mount_ns"] = mount["span"]["duration_ns"]
        group_ms = case["budget"].get("edit_commit_end_watchdog_ms")
        group_stop = time.monotonic() + group_ms / 1000 if group_ms is not None else None
        row["edit_commit_end_group"] = {"watchdog_ms": group_ms,
                                       "scope": "ordinary edit, Commit and terminal unmount; excludes measured mount/setup/warmup/proof"}
        operation_seconds = case["budget"].get("operation_watchdog_ms", 120000) / 1000
        phase_stop = time.monotonic() + case["budget"].get("performance_hard_watchdog_ms", case["budget"]["command_ms"]) / 1000 if ordered else group_stop
        row["phases"].update(command_ns=0, commit_ns=0)
        for index, command_body in enumerate(bodies, 1):
            if small_history:
                history_observer(clock, row, f"free-space-before-state-{index}", lambda: history_free_space(output))
            step_started = time.monotonic_ns()
            step_stop = operation_deadline(phase_stop, operation_seconds) if ordered else group_stop
            command = None
            if command_body is not None:
                command = runtime.send("command", selected, script(output, f"command-{index}.sh" if ordered else "command.sh", command_body),
                                       deadline=operation_deadline(step_stop, operation_seconds))
                row["phases"]["command_ns"] += command["span"]["duration_ns"]
            if case.get("original_operation_counts"):
                row["original_operation_counts"] = history_observer(clock, row, f"original-operation-counts-{index}",
                    lambda: original_operation_counts(command, case["original_operation_counts"]))
            if case.get("original_ordinary_guards"):
                row["ordinary_resource_guards"]["steps"].append(history_observer(clock, row, f"ordinary-before-commit-{index}",
                    lambda: ordinary_resource_guard(runtime, build, output, f"ordinary-resources-before-commit-{index}", row["ordinary_resource_guards"]["before"])))
            if case.get("git_workflow"):
                custody_start = time.monotonic_ns()
                try:
                    deadlines = git_proof_deadlines(case, preproof_ns)
                    publication_stop = deadlines["publication"]
                    seconds = deadlines["work"]-time.monotonic()
                    row["git_precommit"] = history_observer(clock, row, "git-precommit-custody-proof",
                        lambda: before_git_commit(runtime, selected, prepared, build, output, seconds))
                finally:
                    preproof_ns += time.monotonic_ns()-custody_start
                    publication_stop = git_proof_deadlines(case, preproof_ns)["publication"]
                    row["prior_proof_wall_ns"] = preproof_ns
                if preproof_ns >= 41_000_000_000:
                    raise TimeoutError("original cumulative Git proof work allowance exhausted before measured Commit")
                row["counts_scope"] = "measured Git command, excluded precommit custody verifier FUSE/SQL work and Commit; only original Status observer adjusted; no guessed verifier subtraction"
            row["cache"]["commit_started_monotonic_ns"] = time.monotonic_ns()
            committed = runtime.send("commit", selected, deadline=operation_deadline(step_stop, operation_seconds))
            row["phases"]["commit_ns"] += committed["span"]["duration_ns"]
            row["commit"] = committed
            if committed["fields"]["commit_kind"] != case["expected_commit"]:
                raise ValueError("original known Commit outcome differs from frozen mutation/read-only case")
            if case.get("original_ordinary_guards"):
                row["ordinary_resource_guards"]["steps"].append(history_observer(clock, row, f"ordinary-after-commit-{index}",
                    lambda: ordinary_resource_guard(runtime, build, output, f"ordinary-resources-after-commit-{index}", row["ordinary_resource_guards"]["before"])))
            if ordered:
                record = {"index": index, "command": command, "commit": committed,
                          "step_wall_ns": time.monotonic_ns() - step_started}
                row["history"]["commits"].append(record)
                if small_history:
                    row["resource_guards"]["steps"].append(history_observer(clock, row, f"resources-step-{index}",
                        lambda: history_resource_guard(runtime, build, output, f"history-resources-step-{index}",
                                                        row["resource_guards"]["before"])))
        row["cache"].update(has_own_write_input=committed["fields"]["commit_kind"] == "Committed",
                            own_write_cold_observation=None,
                            own_write_cache_reason="no independent pre-Commit cold backing/metadata observation; own-write warmth is not eligible")
        runtime.send("snapshot", selected, deadline=operation_deadline(phase_stop, 15))
        bindings["command_end_status"] = endpoint(next(event for event in reversed(runtime.rows) if event["event"] == "workspace_status"))
        end = runtime.send("unmount", selected, deadline=operation_deadline(phase_stop, 15))
        mounted.remove(selected)
        row["phases"]["unmount_ns"] = end["span"]["duration_ns"]
        clock.finish(time.monotonic_ns())
        row["complete_wall_ns"] = clock.observe(time.monotonic_ns())["performance_ns"]
        row["performance_clock"] = clock.observe(time.monotonic_ns())
        row["cleanup_observations"], row["cache"]["residency"] = terminal_cache_observation(runtime, selected, build, output, row["cache_class"])
        row["cleanup"] = "Gone"
        row["proof_status"] = "FAIL"
        proof_started = time.monotonic_ns()
        proof_stop = time.monotonic() + case["budget"]["verification_hard_watchdog_ms"] / 1000-preproof_ns/1e9
        git_deadlines = git_proof_deadlines(case, preproof_ns) if case.get("git_workflow") else None
        proof_work_stop = git_deadlines["work"] if git_deadlines else None
        proof_cleanup_stop = git_deadlines["cleanup"] if git_deadlines else None
        if git_deadlines:
            proof_stop = publication_stop = git_deadlines["publication"]
        def proof_seconds(limit, cleanup=False):
            left = proof_stop - time.monotonic()
            if proof_work_stop is not None:
                left = min(left, (proof_cleanup_stop if cleanup else proof_work_stop)-time.monotonic())
            if left <= 0:
                raise TimeoutError("original frozen verification hard watchdog expired")
            return min(limit, left)
        native_stop = min(proof_stop, time.monotonic() + operation_seconds) if ordered else proof_stop
        def native_seconds(limit):
            left = native_stop - time.monotonic()
            if left <= 0:
                raise TimeoutError("original per-state native proof watchdog expired")
            return min(proof_seconds(limit), left)
        verify_mount = secrets.token_hex(32)
        runtime.send("mount", verify_mount, deadline=time.monotonic() + native_seconds(15))
        mounted.add(verify_mount)
        if case.get("git_workflow"):
            row["git_custody"] = verify_git_custody(runtime, verify_mount, prepared, build, output,
                                                    row["git_precommit"], native_seconds(case["budget"]["verifier_ms"]/1000))
        verify_body = "/bin/bash /code/workload.sh verify " + shlex.quote(case["v016_case"])
        verified = runtime.send("verify", verify_mount, script(output, "verify.sh", verify_body),
                                deadline=time.monotonic() + native_seconds(case["budget"]["verifier_ms"] / 1000))
        proof = verify_native_receipt(case, verified)
        if case.get("git_workflow"):
            row["git_semantics"] = verify_git_semantic_fields(proof, prepared)
        runtime.send("unmount", verify_mount, deadline=time.monotonic() + (proof_seconds(15, cleanup=True) if git_deadlines else native_seconds(15)))
        mounted.remove(verify_mount)
        row["verification_cleanup"] = readiness(runtime, verify_mount, proof_seconds(5, cleanup=True) if git_deadlines else native_seconds(5))
        if case.get("original_ordinary_guards"):
            row["ordinary_resource_guards"]["after_native_proof"] = ordinary_resource_guard(runtime, build, output,
                "ordinary-resources-after-native-proof", row["ordinary_resource_guards"]["before"], proof_seconds(15) if git_deadlines else 15)
        if small_history:
            row["resource_guards"]["after_native_proof"] = history_resource_guard(runtime, build, output,
                "history-resources-after-native-proof", row["resource_guards"]["before"])
        runtime.send("observe", deadline=time.monotonic() + proof_seconds(15, cleanup=True))
        runtime.send("stop", deadline=time.monotonic() + proof_seconds(15, cleanup=True))
        runtime.event("finished", time.monotonic() + proof_seconds(15, cleanup=True))
        if runtime.process.wait(timeout=proof_seconds(1, cleanup=True) if git_deadlines else 1) != 0:
            raise ValueError("original runtime exit differs after known Stop")
        row["custody"] = "KNOWN_STOP"
        row["completed_operation_count"] = 1
        docker = ["docker", "--host", "unix://" + build["socket"]]
        # Closed sample input to the independent offline oracle, after Stop;
        # never a host data-serving route or construction/materialization path.
        receipts.command([*docker, "cp", runtime.container + ":/layerfs-store/global", str(output / "graph-store")], output, "closed-store-export", proof_seconds(15))
        graph_args = [build["binaries"]["runtime"]["path"], "verify-workspace", "--socket", build["socket"],
                      "--volume", row["clone"]["volume"], "--daemon", build["binaries"]["daemon"]["path"],
                      "--manifest", prepared["provision"]["manifest"], "--sealed", str(output / "graph-store/store.sqlite"),
                      "--case", case["v016_case"], "--receipt", str(output / "graph.events.jsonl"),
                      "--uid", str(prepared["source_uid"]), "--gid", str(prepared["source_gid"])]
        if ordered:
            history_rows = [f"0\t-\t-\t{row['history']['initial_root']}\t{prepared['history_states'][0]['manifest']}"]
            for record in row["history"]["commits"]:
                fields = record["commit"]["fields"]
                history_rows.append(f"{record['index']}\t{fields['commit_id']}\t{fields['parent']}\t{fields['root']}\t{prepared['history_states'][record['index']]['manifest']}")
            transcript = script(output, "acknowledged-history.tsv", "\n".join(history_rows) + "\n")
            graph_args[1] = "verify-history"
            graph_args.extend(["--history-file", str(transcript)])
        if case.get("git_workflow"):
            graph_args.extend(["--source-copy", row["git_precommit"]["path"]])
        if small_history:
            graph_events, roots, physical = [], [], []
            wanted = [row["history"]["initial_root"], *[item["commit"]["fields"]["root"] for item in row["history"]["commits"]]]
            for step, expected_root in enumerate(wanted):
                history_free_space(output)
                seconds = proof_seconds(operation_seconds)
                events_path = output / f"graph-state-{step}.events.jsonl"
                state_args = [*graph_args, "--history-step", str(step)]
                state_args[state_args.index("--receipt") + 1] = str(events_path)
                attempted = receipts.command(state_args, output, f"independent-graph-state-{step}", seconds,
                    environment={**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1"})
                events = [json.loads(line) for line in events_path.read_text().splitlines()]
                proved = [item for item in events if item["event"] == "workspace_verified"]
                selected_roots = [item for item in events if item["event"] == "history_root_verified"]
                encoding = [item for item in events if item["event"] == "history_payload_encoding"]
                if (len(proved) != 1 or events[-1]["event"] != "finished"
                        or proved[0]["fields"]["root"] != expected_root
                        or proved[0]["fields"]["final_head_root"] != committed["fields"]["root"]
                        or len(selected_roots) != 1 or selected_roots[0]["fields"]["step"] != step
                        or selected_roots[0]["fields"]["root"] != expected_root):
                    raise ValueError("independent selected state/full-acknowledgement history binding differs")
                roots.extend(selected_roots)
                graph_events.extend(proved)
                if len(encoding) == 1 and encoding[0]["fields"].get("root") == expected_root:
                    physical.extend(encoding)
                row["history"].setdefault("proof_attempts", []).append({"index": step, "wall_stop_seconds": seconds,
                    "attempt": attempted, "root": expected_root, "semantic_proof": proved[0], "payload_encoding": encoding})
            row["history"]["verified_roots"] = roots
            row["mechanism"] = qualify_history_mechanism(physical)
            proof_events = [graph_events[-1]]
        else:
            graph = receipts.command(graph_args, output, "independent-graph", proof_seconds(case["budget"]["verifier_ms"] / 1000),
                                     environment={**os.environ, "LAYERFS_CONSTRUCTION_WORKERS": "1"})
            events = [json.loads(line) for line in (output / "graph.events.jsonl").read_text().splitlines()]
            proof_events = [item for item in events if item["event"] == "workspace_verified"]
            if len(proof_events) != 1 or events[-1]["event"] != "finished" or proof_events[0]["fields"]["root"] != committed["fields"]["root"]:
                raise ValueError("original persisted root proof differs from exact acknowledged Commit root")
            if ordered:
                roots = [item for item in events if item["event"] == "history_root_verified"]
                wanted = [row["history"]["initial_root"], *[item["commit"]["fields"]["root"] for item in row["history"]["commits"]]]
                if len(roots) != len(wanted) or [item["fields"]["root"] for item in roots] != wanted:
                    raise ValueError("complete original sequence proof differs from all acknowledged states")
                row["history"]["verified_roots"] = roots
        row.update(proof_status="PASS", proof_wall_ns=time.monotonic_ns() - proof_started+preproof_ns,
                   verification={"scope": case["oracle"]["scope"], "omissions": case["oracle"]["omissions"],
                                 "native": proof, "persisted": proof_events[0]})
        collect_family_observations(runtime, row, build, output, bindings, proof_work_stop)
        if git_deadlines:
            proof_seconds(.001)
        row.update(status="PASS" if row["cache"]["status"] == "ELIGIBLE" else "INELIGIBLE", functional_status="PASS")
        if small_history:
            row["semantic_proof_status"] = "PASS"
            row["verification"]["mechanism"] = row["mechanism"]
            if row["mechanism"]["status"] != "PASS":
                row.update(status="FAIL", proof_status="FAIL", functional_status="FAIL", tag=row["mechanism"]["reason"])
                row["resource_disposition"] = "known stopped container and sample volume retained for unmet original mechanism condition; all31 byte/history/census proofs and clean unmount remain PASS"
                return row
        if row["status"] == "INELIGIBLE":
            row["tag"] = ("same-mount history paid backing/metadata/SQLite, own-write coldness and initial/warm interval evidence unavailable; all declared retained-state proofs and clean unmount pass" if ordered else
                          "class B source demands or own-write cold backing precondition unavailable; functional/native/persisted proofs and clean unmount pass")
            if case.get("git_workflow"):
                row["tag"] += "; prior original verification reads and full paid cache inputs unqualified; numeric counts include excluded precommit custody verifier FUSE/SQL work"
        state = receipts.command([*docker, "inspect", runtime.container, "--format", "{{.State.Running}}"], output, "container-state", proof_seconds(15, cleanup=True) if git_deadlines else 15)
        if Path(state["stdout"]).read_text().strip() != "false":
            raise ValueError("original container Stop not confirmed")
        row["resource_removal_pending"] = True
        row["resource_disposition"] = "known stopped sample container/volume retained pending final publication and known outer return; administrative removal separate"
    except BaseException as error:
        row.update(status="FAIL", original_failure_type=type(error).__name__, original_failure=str(error),
                   retained_mount_keys=sorted(mounted), resource_disposition="original resources retained; no inferred unmount/Stop/removal")
        if clock.started is not None:
            row["complete_wall_ns"] = clock.observe(time.monotonic_ns())["performance_ns"]
        if proof_started is not None:
            row["proof_wall_ns"] = time.monotonic_ns() - proof_started+preproof_ns
        elif preproof_ns:
            row["proof_wall_ns"] = preproof_ns
        if runtime is not None and row.get("custody") == "KNOWN_STOP" and not (output / "daemon-logs.attempt.json").exists():
            try:
                collect_family_observations(runtime, row, build, output, bindings)
            except BaseException as observing:
                row["independent_observation_failure"] = str(observing)
        if runtime is None:
            runtime = getattr(error, "event_process", None)
        if runtime is not None:
            row["retained_host_custody"] = runtime.retain(error)
            row["container"] = runtime.container
    finally:
        if runtime is not None:
            for value in (runtime.selector, runtime.raw, runtime.stderr, getattr(runtime.process, "stdin", None), getattr(runtime.process, "stdout", None)):
                if value is not None:
                    try:
                        value.close()
                    except BaseException as closing:
                        row.setdefault("independent_close_failures", []).append(str(closing))
                        row["status"] = "FAIL"
        row["timing_scope"] = "matrix controller from measured mount through command/Commit/terminal unmount; read-only resource-observer intervals excluded and separately retained; absolute phase stop includes those intervals; setup/warmup/cleanup/fresh native and persisted verification/Stop separate"
        row["evidence"] = str(output.relative_to(identity.ROOT.resolve()))
        if case.get("git_workflow") and publication_stop is not None:
            if proof_started is not None:
                row["proof_wall_ns"] = time.monotonic_ns()-proof_started+preproof_ns
                row["proof_wall_scope"] = "cumulative prior qualification/precommit custody/final proof and known cleanup/observations through prepublication close; publication timing is separately bound in publication receipts"
            if proof_cleanup_stop is not None and time.monotonic() >= proof_cleanup_stop:
                row.update(status="FAIL", proof_status="FAIL",
                           tag="; ".join(filter(None, (row.get("tag"), "original cumulative45s verification cleanup deadline reached before publication"))))
            row.update(receipts.finalize_guarded(output, row, publication_stop))
        else:
            receipts.write_new(output / "receipt.json", row)
            receipts.manifest(output)
    return row


def dispose_family_resources(folder, returned_row):
    """Driver-only administration after publication and an actual known return.

    End, Gone, Stop and their deadlines stay inside the original case. Docker
    removal is outside those clocks. Failed/uncertain publication causes no
    deletion; partial deletion has exact separate custody, never a retry.
    """
    folder = Path(folder)
    if returned_row.get("resource_removal_pending") is not True:
        return None
    receipts.verify_manifest(folder)
    original = json.loads((folder / "receipt.json").read_text())
    effective = receipts._publication_overlay(folder, original, original)
    names = ("family", "case", "source_commit", "product_tree", "image", "container", "clone")
    if any(returned_row.get(name) != original.get(name) for name in names):
        raise ValueError("resource removal returned source/resource identity differs")
    if (returned_row.get("status") not in ("PASS", "INELIGIBLE")
            or effective.get("status") not in ("PASS", "INELIGIBLE")
            or any(row.get("functional_status") != "PASS" or row.get("proof_status") != "PASS"
                   or row.get("custody") != "KNOWN_STOP" or row.get("cleanup") != "Gone"
                   for row in (returned_row, effective))):
        return None
    container, volume = original["container"], original["clone"]["volume"]
    if (not isinstance(container, str) or len(container) != 64
            or any(char not in "0123456789abcdef" for char in container)
            or not isinstance(volume, str) or not volume.startswith("layerfs-fsb-sample-")):
        raise ValueError("exact owned sample resource identity required for removal")
    build = json.loads((Path(original["build"]) / "build.json").read_text())
    docker = ["docker", "--host", "unix://" + build["socket"]]
    output = folder / "resource-removal"
    output.mkdir(exist_ok=False)
    binding = {"schema": "fs-bench-pro-resource-removal-v1",
        "receipt_sha256": identity.sha256(folder / "receipt.json"),
        "manifest_sha256": identity.sha256(folder / "manifest.json"),
        "outer_ack_sha256": identity.sha256(folder / "publication-outer-acknowledgement.json")
            if original.get("publication_guard") else None,
        "identity": {name: original.get(name) for name in names},
        "known_outer_return": True, "container": container, "volume": volume,
        "scope": "post-publication Docker administration; original mount cleanup/Stop proof and timing unchanged",
        "container_custody": "KNOWN_STOP_RETAINED", "volume_custody": "RETAINED"}
    receipts.write_new(output / "attempt.json", binding)
    record = dict(binding)
    try:
        state = receipts.command([*docker, "inspect", container, "--format", "{{.State.Running}}"], output, "state", 15)
        if Path(state["stdout"]).read_text().strip() != "false":
            raise ValueError("owned sample Stop readback differs before administrative removal")
        record["container_custody"] = "REMOVAL_ATTEMPT_UNCERTAIN"
        receipts.command([*docker, "rm", container], output, "container", 15)
        record["container_custody"] = "REMOVED"
        record["volume_custody"] = "REMOVAL_ATTEMPT_UNCERTAIN"
        receipts.command([*docker, "volume", "rm", volume], output, "volume", 15)
        record.update(volume_custody="REMOVED", status="PASS")
    except BaseException as error:
        record.update(status="FAIL", failure_type=type(error).__name__, failure=str(error))
    record["resource_disposition"] = "container=" + record["container_custody"] + "; volume=" + record["volume_custody"]
    receipts.write_new(output / "completion.json", record)
    receipts.manifest(output)
    returned_row["resource_disposition"] = record["resource_disposition"]
    return record
