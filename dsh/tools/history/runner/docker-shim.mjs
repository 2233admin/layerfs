// The `docker` command inside the #352 runner container (DIRECT_STORE_IMPL.md
// step 4). The runtime image has no Docker CLI, and the runner downloads
// nothing; this shim answers the subcommands the history tools use, over the
// Docker Engine API on the mounted socket (DOCKER_HOST, default
// /var/run/docker.sock):
//   run --rm [--network N] [--user U] [-v SRC:DST[:ro]]… [--entrypoint E] IMAGE [ARGS…]
//   exec CONTAINER CMD…
//   volume create NAME · volume rm NAME
//   image inspect --format {{.Id}} IMAGE
//   context inspect --format {{.Endpoints.docker.Host}}
//   ps -a --filter name=^NAME$ --format {{.Names}}
//   rm -f NAME
// Anything else is refused (exit 2): an unsupported call fails, never guesses.
// Output and exit status match the CLI for these forms.
import { request } from "node:http";

const SOCKET = (process.env.DOCKER_HOST ?? "unix:///var/run/docker.sock").replace(/^unix:\/\//, "");
const API = "/v1.43";

/** One Engine API call: { status, body } (body parsed as JSON when it is). */
export function api(method, path, body = null, { raw = false } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ socketPath: SOCKET, method, path: `${API}${path}`, headers: body ? { "Content-Type": "application/json" } : {} }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        if (raw) return resolve({ status: res.statusCode, body: buf });
        const text = buf.toString("utf8");
        let parsed = text;
        try { parsed = text ? JSON.parse(text) : null; } catch { /* plain text */ }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/** Splits Docker's multiplexed stream (8-byte frame headers) into stdout and stderr. */
export function demux(buf) {
  const out = [], err = [];
  for (let i = 0; i + 8 <= buf.length;) {
    const kind = buf[i], n = buf.readUInt32BE(i + 4), body = buf.subarray(i + 8, i + 8 + n);
    (kind === 2 ? err : out).push(body);
    i += 8 + n;
  }
  return { stdout: Buffer.concat(out), stderr: Buffer.concat(err) };
}

/** Parses `run` arguments into an Engine create body. */
export function parseRun(args) {
  const o = { rm: false, binds: [], network: null, user: null, entrypoint: null, image: null, cmd: [] };
  let i = 0;
  for (; i < args.length; i++) {
    const a = args[i];
    if (a === "--rm") o.rm = true;
    else if (a === "--network") o.network = args[++i];
    else if (a === "--user") o.user = args[++i];
    else if (a === "-v" || a === "--volume") o.binds.push(args[++i]);
    else if (a === "--entrypoint") o.entrypoint = args[++i];
    else if (a.startsWith("-")) throw new Error(`docker-shim: run ${a} is not supported`);
    else break;
  }
  o.image = args[i];
  o.cmd = args.slice(i + 1);
  if (!o.image) throw new Error("docker-shim: run needs an image");
  return {
    Image: o.image, Cmd: o.cmd, ...(o.entrypoint ? { Entrypoint: [o.entrypoint] } : {}), ...(o.user ? { User: o.user } : {}),
    AttachStdout: true, AttachStderr: true, Tty: false,
    HostConfig: { Binds: o.binds, ...(o.network ? { NetworkMode: o.network } : {}) },
  };
}

const fail = (status, msg) => { process.stderr.write(`${msg}\n`); process.exit(status); };
const ok = (r, what) => { if (r.status >= 300) fail(1, `Error response from daemon: ${r.body?.message ?? r.body} (${what})`); return r.body; };

async function run(args) {
  const body = parseRun(args);
  const created = ok(await api("POST", "/containers/create", body), "create");
  const id = created.Id;
  try {
    ok(await api("POST", `/containers/${id}/start`), "start");
    const waited = ok(await api("POST", `/containers/${id}/wait`), "wait");
    const logs = await api("GET", `/containers/${id}/logs?stdout=1&stderr=1`, null, { raw: true });
    const { stdout, stderr } = demux(logs.body);
    process.stdout.write(stdout);
    process.stderr.write(stderr);
    return waited.StatusCode ?? 1;
  } finally {
    await api("DELETE", `/containers/${id}?force=1`);
  }
}

async function exec([container, ...cmd]) {
  const e = ok(await api("POST", `/containers/${container}/exec`, { AttachStdout: true, AttachStderr: true, Tty: false, Cmd: cmd }), "exec");
  const started = await api("POST", `/exec/${e.Id}/start`, { Detach: false, Tty: false }, { raw: true });
  if (started.status >= 300) fail(1, `Error response from daemon: ${started.body.toString()}`);
  const { stdout, stderr } = demux(started.body);
  process.stdout.write(stdout);
  process.stderr.write(stderr);
  return ok(await api("GET", `/exec/${e.Id}/json`), "exec inspect").ExitCode ?? 1;
}

export async function main(argv) {
  const [cmd, ...a] = argv;
  const fmt = (i) => a[a.indexOf("--format") + 1] === i;
  if (cmd === "run") return run(a);
  if (cmd === "exec") return exec(a);
  if (cmd === "volume" && a[0] === "create") { ok(await api("POST", "/volumes/create", { Name: a[1] }), "volume create"); console.log(a[1]); return 0; }
  if (cmd === "volume" && a[0] === "rm") { ok(await api("DELETE", `/volumes/${encodeURIComponent(a[1])}`), "volume rm"); console.log(a[1]); return 0; }
  if (cmd === "image" && a[0] === "inspect" && fmt("{{.Id}}")) { console.log(ok(await api("GET", `/images/${encodeURIComponent(a.at(-1))}/json`), "image inspect").Id); return 0; }
  if (cmd === "context" && a[0] === "inspect" && fmt("{{.Endpoints.docker.Host}}")) { console.log(`unix://${SOCKET}`); return 0; }
  if (cmd === "ps" && a.includes("-a")) {
    const f = a[a.indexOf("--filter") + 1] ?? "";
    const name = /^name=(.*)$/.exec(f)?.[1];
    const list = ok(await api("GET", `/containers/json?all=1${name ? `&filters=${encodeURIComponent(JSON.stringify({ name: [name] }))}` : ""}`), "ps");
    for (const c of list) console.log(c.Names[0].replace(/^\//, ""));
    return 0;
  }
  if (cmd === "rm" && a[0] === "-f") { ok(await api("DELETE", `/containers/${encodeURIComponent(a[1])}?force=1`), "rm"); console.log(a[1]); return 0; }
  fail(2, `docker-shim: "${argv.join(" ")}" is not supported in the runner`);
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2)).then((code) => process.exit(code ?? 0), (e) => fail(1, e.message));
