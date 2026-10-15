# Recipes

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill.

Each snippet is the body of a step script (see [setup](setup.md#a-step-script)), with
`layerfs` and `state` already loaded:

```js
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { LayerFS, isRefusal } from "@layerfs/sdk";
const state = JSON.parse(readFileSync("state.json", "utf8"));
const layerfs = new LayerFS(state.project);
const { sandbox: id, branch } = state;
```

## Scaffold many files in one Commit

```js
const files = {
  "/package.json": JSON.stringify({ name: "shop", type: "module", scripts: { test: "node --test" } }, null, 2) + "\n",
  "/src/server.js": "export function start() {}\n",
  "/test/server.test.js": "import { test } from 'node:test';\ntest('loads', () => {});\n",
};
const changes = Object.entries(files).map(([path, content]) => ({ op: "write", path, content }));
const result = await layerfs.fs.apply(branch, changes, "scaffold: package, server, first test");
console.log(result.kind, result.head);   // "Committed" and the new head, or "UpToDate"
```

Change kinds: `{op:"write", path, content}`, `{op:"edit", path, oldText, newText}`,
`{op:"mkdir", path}`, `{op:"rm", path}`, `{op:"cp", from, to}`, `{op:"mv", from, to}`.
They apply in order, and either all publish or none do. A refusal names the failing
change in `error.detail.index`.

## Edit one place in a file

```js
await layerfs.fs.edit(branch, "/src/cart.js", "const TAX = 0.07;", "const TAX = 0.08;", "cart: update tax");
```

`oldText` must match exactly once: otherwise `NoMatch` or `AmbiguousMatch`. Include
enough surrounding text to make it unique.

## Read a whole file, window by window

```js
let line = 1, text = "";
for (;;) {
  const r = await layerfs.fs.read(branch, "/src/cart.js", line);
  text += r.text;
  if (!r.truncated || r.nextLine == null) break;
  line = r.nextLine;
}
```

One answer holds at most 2000 lines and 48 KiB. A huge single line comes back as a
prefix with `lineTruncated: true`.

## List or search with paging

```js
const all = [];
for (let pos = 0; ; ) {
  const page = await layerfs.fs.glob(branch, "src/**/*.js", "/", 1000, pos);
  all.push(...page.items);
  if (!page.hasMore) break;
  pos += page.items.length;
}
```

Glob patterns: `*` and `?` stay within one name, `**` spans folders; items are paths.
The same loop works for `fs.list`, `fs.grep`, `branch.list_commits` and the diffs.

## Run a command in a Workspace and keep its output

```js
const ws = await layerfs.sandbox.mount(id, branch);
const run = await layerfs.sandbox.exec(id, ws.path, "timeout 110 npm test 2>&1", "cart tests");
mkdirSync("logs", { recursive: true });
writeFileSync("logs/012-cart-tests.txt", run.stdout + run.stderr);
console.log(JSON.stringify({ exitCode: run.exitCode, truncated: run.truncated }));
if (run.exitCode !== 0) {
  await layerfs.sandbox.unmount(id, ws.path, { discard: true });
  process.exit(1);
}
await layerfs.sandbox.commit(id, ws.path, { message: "cart: tests pass" });
await layerfs.sandbox.unmount(id, ws.path);
```

- The command runs with `bash -c`, with the Workspace root as its working directory
  and `HOME=/tmp`. Relative paths work.
- `exec` returns only when the command and everything holding its output have ended.
  It keeps the first 1 MiB of each stream and sets `truncated` beyond that.
- `timeout 110` is yours to add; `exec` itself never times out.

## Install dependencies once

```js
const ws = await layerfs.sandbox.mount(id, branch);
const run = await layerfs.sandbox.exec(id, ws.path, "timeout 110 npm install --no-audit --no-fund 2>&1", "npm install");
if (run.exitCode !== 0) { console.log(run.stdout.slice(-4000)); process.exit(1); }
const saved = await layerfs.sandbox.commit(id, ws.path, { message: "deps: npm install" });
console.log(saved.kind, saved.head);
await layerfs.sandbox.unmount(id, ws.path);
```

`node_modules` and `package-lock.json` become part of the Branch. The npm cache lives
in `/tmp/.npm`, outside the Workspace, so it isn't committed.

## Write a file inside a Workspace

Use this only for a long-lived Workspace that must see the change before its next
Commit; otherwise use `fs.*`. Pass the content as base64 to avoid shell quoting:

```js
const b64 = Buffer.from(content).toString("base64");
const cmd = `node -e "require('fs').writeFileSync(process.argv[1], Buffer.from(process.argv[2], 'base64'))" src/cart.js ${b64}`;
const run = await layerfs.sandbox.exec(id, state.path, cmd, "write src/cart.js");
```

Command lines have an OS length limit; for large files, use `fs.write` and remount.

## Smoke test a server

Start it, probe it and stop it in **one** `exec`. Send the server's output to a file
in `/tmp`, so it doesn't hold `exec`'s output streams or land in the Workspace:

```js
const cmd = [
  "timeout 60 bash -c '",
  "node src/server.js >/tmp/server.log 2>&1 & pid=$!;",
  "sleep 2;",
  "node -e \"fetch(\\\"http://127.0.0.1:3000/health\\\").then(r => { console.log(r.status); process.exit(r.ok ? 0 : 1) }).catch(e => { console.error(e.message); process.exit(1) })\";",
  "s=$?; kill $pid; cat /tmp/server.log; exit $s'",
].join(" ");
const run = await layerfs.sandbox.exec(id, ws.path, cmd, "smoke test");
```

## See what a Workspace changed before committing

```js
const s = await layerfs.sandbox.status(id, ws.path);
console.log(s.headMovedSinceMount, s.overlay);   // overlay: { inodes, entries, pendingMerge }
```

## History and diffs

```js
const log = await layerfs.branch.list_commits(branch, 20, 0);     // newest first
const diff = await layerfs.branch.diff_commits(log.items[1].id, log.items[0].id);
const file = await layerfs.fs.diff_files("main", "/src/cart.js", branch, "/src/cart.js");
const who = await layerfs.fs.blame(branch, "/src/cart.js");
```

Print a result with `console.log(JSON.stringify(x, null, 2))` the first time you use a
method, to see its exact fields.

## Print a refusal and stop

```js
try {
  await layerfs.fs.mv(branch, "/src/old.js", "/src/new.js", "rename");
} catch (error) {
  if (!error.code) throw error;   // not a LayerFS refusal: a bug in the script
  console.log(JSON.stringify({ ok: false, code: error.code, message: error.message, detail: error.detail }));
  process.exit(1);
}
```

`isRefusal(error, "Exists")` tests for one code. What to do for each code is in
[errors](errors.md).
