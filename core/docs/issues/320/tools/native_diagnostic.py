"""Issue 320 owner decision 2: one labelled native diagnostic. Not a harness arm, not a sample.

usage: native_diagnostic.py <prepared-original-folder> <retained-sample-folder> <out.json>

Runs the retained command bodies of one sampled case (`command-N.sh`, in order)
against a PLAIN DIRECTORY: the case's prepared native source copied into a fresh
named volume of a container from the same pinned image, with the sample's
container profile and command identity. No LayerFS daemon, no mount, no Commit.

Each command is launched the way the SDK launches it: three requests to the
container engine, each on its own connection (create the exec, start it and
read its streams to the end, inspect it). The four spans are recorded per step,
so the launch-plus-writer floor per step is measured rather than inferred.
Before the steps, the same sequence launches an empty program and an empty
shell 20 times each: the launch floor without any writer.

It checks exit codes only. It does not verify the resulting tree, and its times
are diagnostic single observations on a shared machine. It removes the container
and the volume it created, and nothing else.
"""
import http.client
import json
import socket
import subprocess
import sys
import time
import uuid
from pathlib import Path

IMAGE = "sha256:378b799ef43343fc64008b6a5ef456dd6bf0cb8f6ea4cec72e7b42dfc17d2cd6"
ENVIRONMENT = ["PATH=/opt/node/bin:/usr/local/bin:/usr/bin:/bin", "HOME=/tmp", "LANG=C", "LC_ALL=C",
               "GIT_CONFIG_NOSYSTEM=1", "GIT_AUTHOR_NAME=Experiment", "GIT_AUTHOR_EMAIL=experiment@example.invalid",
               "GIT_COMMITTER_NAME=Experiment", "GIT_COMMITTER_EMAIL=experiment@example.invalid",
               "GIT_AUTHOR_DATE=2026-10-03T00:00:00Z", "GIT_COMMITTER_DATE=2026-10-03T00:00:00Z",
               "LAYERFS_CONSTRUCTION_WORKERS=1"]
DIRECTORY = "/workspaces/1"


class Engine(http.client.HTTPConnection):
    def __init__(self, path):
        super().__init__("localhost")
        self.path = path

    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(self.path)


def call(path, method, url, body=None):
    engine = Engine(path)
    engine.request(method, url, body=json.dumps(body) if body is not None else None,
                   headers={"Content-Type": "application/json", "Connection": "close"})
    reply = engine.getresponse()
    data = reply.read()
    engine.close()
    if reply.status >= 300:
        raise RuntimeError(f"{method} {url}: {reply.status} {data[:200]!r}")
    return json.loads(data) if data else None


def launch(path, container, arguments, user):
    """Create, start and drain, inspect: the SDK's three engine requests."""
    begun = time.monotonic_ns()
    created = call(path, "POST", f"/v1.54/containers/{container}/exec",
                   {"User": user, "WorkingDir": DIRECTORY, "Env": ENVIRONMENT, "Cmd": arguments,
                    "AttachStdin": False, "AttachStdout": True, "AttachStderr": True, "Tty": False})["Id"]
    after_create = time.monotonic_ns()
    stream = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    stream.connect(path)
    body = b'{"Detach":false,"Tty":false}'
    stream.sendall((f"POST /v1.54/exec/{created}/start HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\n"
                    f"Content-Length: {len(body)}\r\nConnection: Upgrade\r\nUpgrade: tcp\r\n\r\n").encode() + body)
    head = b""
    while b"\r\n\r\n" not in head:
        piece = stream.recv(4096)
        if not piece:
            raise RuntimeError("exec start closed before its reply")
        head += piece
    after_start = time.monotonic_ns()
    received = len(head.split(b"\r\n\r\n", 1)[1])
    while True:
        piece = stream.recv(65536)
        if not piece:
            break
        received += len(piece)
    stream.close()
    after_streams = time.monotonic_ns()
    inspected = call(path, "GET", f"/v1.54/exec/{created}/json")
    ended = time.monotonic_ns()
    return {"create_ns": after_create - begun, "start_ns": after_start - after_create,
            "streams_ns": after_streams - after_start, "inspect_ns": ended - after_streams,
            "total_ns": ended - begun, "exit_code": inspected["ExitCode"], "stream_bytes": received}


def docker(path, *arguments):
    done = subprocess.run(["docker", "--host", "unix://" + path, *arguments], capture_output=True, text=True, timeout=100)
    if done.returncode:
        raise RuntimeError("docker " + " ".join(arguments[:3]) + ": " + done.stderr[-300:])
    return done.stdout.strip()


def total(rows, key):
    return sum(row[key] for row in rows)


def main():
    original, sample, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    receipt = json.loads((sample / "receipt.json").read_text())
    build = json.loads((Path(receipt["build"]) / "build.json").read_text())
    path, profile = build["socket"], receipt["container_profile"]
    prepared = json.loads((original / "prepared.json").read_text())
    user = f"{prepared['source_uid']}:{prepared['source_gid']}"
    bodies = []
    while (sample / f"command-{len(bodies) + 1}.sh").exists():
        bodies.append((sample / f"command-{len(bodies) + 1}.sh").read_text())
    name = "layerfs-i320-native-" + uuid.uuid4().hex[:12]
    result = {"label": "issue 320 native diagnostic; one-off; not a harness arm; exit codes only; shared machine",
              "case": receipt["case"], "image": IMAGE, "container_profile": profile, "user": user,
              "directory": DIRECTORY + " on a fresh named volume (plain directory, no LayerFS mount)",
              "launch": "engine create, start with attached streams to end, inspect; one connection each",
              "steps": len(bodies)}
    docker(path, "volume", "create", name)
    try:
        container = docker(path, "create", "--name", name, "--network", "none", "--cpus", str(profile["NanoCpus"] / 1e9),
                           "--memory", str(profile["Memory"]), "--memory-swap", str(profile["MemorySwap"]),
                           "--pids-limit", str(profile["PidsLimit"]), "-v", name + ":/workspaces", IMAGE, "sleep", "infinity")
        docker(path, "start", container)
        docker(path, "cp", "--archive", str(original / "code"), container + ":/code")
        docker(path, "exec", "--user", "0:0", container, "mkdir", "-p", DIRECTORY)
        docker(path, "cp", "--archive", str(original / "source") + "/.", container + ":" + DIRECTORY)
        docker(path, "exec", "--user", "0:0", container, "chown", user, DIRECTORY)
        result["entries_before"] = int(docker(path, "exec", container, "/bin/bash", "-c", f"find {DIRECTORY} | wc -l"))
        empty_program = [launch(path, container, ["/bin/true"], user) for _ in range(20)]
        empty_shell = [launch(path, container, ["/bin/bash", "-o", "pipefail", "-c", ":"], user) for _ in range(20)]
        steps = [launch(path, container, ["/bin/bash", "-o", "pipefail", "-c", body], user) for body in bodies]
        result["entries_after"] = int(docker(path, "exec", container, "/bin/bash", "-c", f"find {DIRECTORY} | wc -l"))
    finally:
        subprocess.run(["docker", "--host", "unix://" + path, "rm", "--force", name], capture_output=True)
        removed = subprocess.run(["docker", "--host", "unix://" + path, "volume", "rm", name], capture_output=True)
        result["cleanup"] = "container and volume removed" if removed.returncode == 0 else "volume removal failed"
    for label, rows in (("empty_program", empty_program), ("empty_shell", empty_shell), ("steps", steps)):
        result[label + "_summary"] = {
            "launches": len(rows), "nonzero_exits": sum(1 for row in rows if row["exit_code"] != 0),
            **{key: total(rows, key) for key in ("create_ns", "start_ns", "streams_ns", "inspect_ns", "total_ns")},
            "mean_total_ms": round(total(rows, "total_ns") / len(rows) / 1e6, 3),
            "median_streams_ms": round(sorted(row["streams_ns"] for row in rows)[len(rows) // 2] / 1e6, 3)}
    result["per_step"] = steps
    result["per_empty_program"], result["per_empty_shell"] = empty_program, empty_shell
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=1) + "\n")
    print(json.dumps({key: value for key, value in result.items() if not key.startswith("per_")}, indent=1))


if __name__ == "__main__":
    main()
