// A root agent and two subagents, each running a LayerFS SDK script from
// bash, for keyless end-to-end runs (M2 records, M5 views).
//   root     fork feature; create a Sandbox, mount, write, commit, unmount, close
//   ui-dev   fork try-ui from feature; write a file through fs
//   tester   create a Sandbox, mount feature, check the file, background server, stop, close
//   root     merge feature + try-ui into release, publish
// Each script closes the client's service Sandbox even when a call fails.
const node = (body) => `node --input-type=module -e '${`${open} try {\n${body}\n} finally { ${done} }`.replace(/'/g, "")}'`;
const open = `const { LayerFS } = await import(process.env.DSH_LAYERFS_SDK); const lf = new LayerFS(process.env.DSH_LAYERFS_PROJECT);`;
const done = `if (lf.serviceSandbox) await lf.serviceSandbox.then((id) => lf.sandbox.close(id)).catch(() => {});`;
const bash = (description, command) => ({ name: "bash", input: { description, command } });

const ROOT = node(`await lf.branch.fork("feature");
const sb = await lf.sandbox.create("root", lf.projectName, process.env.DSH_LAYERFS_IMAGE);
const ws = await lf.sandbox.mount(sb, "feature");
await lf.sandbox.exec(sb, ws, "mkdir -p app && echo hero > app/hero.txt");
await lf.sandbox.commit(sb, ws, "add hero");
await lf.sandbox.unmount(sb, ws);
await lf.sandbox.close(sb);
console.log("root: feature ready");`);
const UI = node(`await lf.branch.fork("try-ui", "feature");
await lf.fs.write("try-ui", "/app/theme.css", ":root { --brand: teal; }\\n", "warm theme");
console.log("ui-dev: theme on try-ui");`);
const TESTER = node(`const sb = await lf.sandbox.create("tester", lf.projectName, process.env.DSH_LAYERFS_IMAGE);
const ws = await lf.sandbox.mount(sb, "feature");
const r = await lf.sandbox.exec(sb, ws, "test -f app/hero.txt && echo ok");
const { LayerFSOperator } = await import(process.env.DSH_LAYERFS_OPERATOR);
const op = new LayerFSOperator(lf);
const p = await op.process.start(sb, ws, "sleep 30");
await op.process.cancel(sb, p.process);
await lf.sandbox.unmount(sb, ws, true);
await lf.sandbox.close(sb);
console.log("tester:", r.exitCode);`);
const MERGE = node(`await lf.branch.merge("feature", "try-ui", "release", "join");
await lf.branch.publish("release");
console.log("root: published release");`);

// LayerFS answers Busy instead of waiting when another process holds a
// discovery mutation; like an agent following the preset's persona, a script
// that hit Busy runs again after a short pause.
const busy = (results) => results.some((r) => /\bBusy\b/.test(r));
const worker = (name, description, script, turn, results) =>
  turn === 0 ? { tools: [bash(description, script)] }
    : busy(results) && turn < 4 ? { tools: [bash(`${description} again`, `sleep 2 && ${script}`)] }
      : { text: `${name} finished: ${results.join(" ").slice(0, 200)}` };

export function respond({ first, turn, results }) {
  if (!first.startsWith("e2e:")) return { text: "LayerFS release" }; // dsh's own requests, e.g. the session title
  if (first.includes("e2e:ui-dev")) return worker("ui-dev", "Write the theme on try-ui", UI, turn, results);
  if (first.includes("e2e:tester")) return worker("tester", "Test the feature Branch", TESTER, turn, results);
  // the root conversation
  if (turn === 0) return { tools: [bash("Fork feature and add the hero", ROOT)] };
  if (turn === 1) return { tools: [
    { name: "subagent", input: { description: "ui-dev", prompt: "e2e:ui-dev Write the theme on a try-ui Branch." } },
    { name: "subagent", input: { description: "tester", prompt: "e2e:tester Test the feature Branch." } },
  ] };
  if (turn === 2) return { tools: [bash("Wait for the subagents", "sleep 25")] };
  if (turn === 3) return { tools: [bash("Merge and publish", MERGE)] };
  return { text: `root finished: ${results.join(" ").slice(0, 200)}` };
}
