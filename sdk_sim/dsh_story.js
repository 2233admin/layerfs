// The dsh story for dsh_design.html: one project, a main agent, two
// subagents and nine scouts. Each step is one agent's call; every outcome
// comes from the engine (simulator or live), never from this script.
//   { a, call, args }   an SDK call; `as` names what it made (a Sandbox or a
//                       Workspace) for later steps, and args.sandbox may use that name
//   { a, sh }           a shell command in the agent's Workspace (`ws` picks one by name)
//   { a, script, calls } one agent's script: several calls in one step, each an
//                       event whose `group` is the script's name
//   { a: "dsh", ... }   dsh itself: spawn agents, a burst of calls, a pause
(function (global) {
  "use strict";
  const SCOUTS = Array.from({ length: 9 }, (_, i) => `scout-${i + 1}`);
  const story = (fixture) => [
    { a: "main", call: "project.init", args: { name: "website", files: fixture },
      cap: "<b>Main tab</b> = the project map: the project terminal (left), the Branch list (middle), and History or Files of main (right). Nothing is ever mounted on main." },
    { a: "main", call: "main.fork", args: { name: "feature-home" },
      cap: "The main agent forks a Branch. Branch calls land in the <b>project terminal</b>; a tab chip appears for the new Branch." },
    { a: "dsh", call: "dsh.spawn", args: { agents: ["ui-dev", "tester"] },
      cap: "dsh spawns two subagents. No scope, no assignment: they wait until they act." },
    { a: "ui-dev", call: "sandbox.create", args: {}, as: "box",
      cap: "Any agent may create a Sandbox (one machine, one localhost). The call lands in the <b>project terminal</b>, tagged with who made it, and the Sandbox joins the list on main." },
    { a: "ui-dev", call: "sandbox.mount", args: { branch: "feature-home", sandbox: "box" },
      cap: "<b>Follow</b> jumps to the Branch tab. ui-dev mounts a Workspace in that Sandbox: a pane owned by ui-dev only." },
    { a: "ui-dev", sh: "mkdir -p app/components && echo 'export function Hero() { return <section>Hero</section>; }' > app/components/hero.tsx",
      cap: "Shell commands run in the Workspace (simulated shell). Their writes stay in the Workspace until a commit." },
    { a: "ui-dev", call: "sandbox.commit", args: { message: "add hero" },
      cap: "The commit lands on the Branch: a node in History, an A badge in Files." },
    { a: "tester", call: "sandbox.mount", args: { branch: "feature-home", sandbox: "box" },
      cap: "A second agent mounts its own Workspace on the same Branch, in the same Sandbox. <b>One Branch, many agents; one Workspace, one agent; one Sandbox, many Workspaces.</b>" },
    { a: "main", call: "fs.read", args: { ref: "feature-home", path: "/app/page.tsx" },
      cap: "The main agent uses <code>fs</code> calls. They go to the Branch's <b>fs terminal</b> on the left, tagged by agent." },
    { a: "main", call: "fs.edit", args: { branch: "feature-home", path: "/app/page.tsx", oldText: "Hello world", newText: "Welcome back", message: "headline copy" },
      cap: "An fs write commits straight to the Branch — no mount, no pane. Both mount badges in History turn red: those Workspaces are now behind." },
    { a: "tester", sh: "sed -i 's/Hello world/Hello there/' app/page.tsx",
      cap: "Meanwhile tester edits the same line in its stale Workspace." },
    { a: "tester", call: "sandbox.commit", args: { message: "friendlier headline" },
      cap: "The engine merges three-way and finds a <b>Conflict</b>. Nothing is committed; the pane and tab chip turn red." },
    { a: "tester", sh: "cat app/page.tsx",
      cap: "The engine wrote the conflict markers into tester's Workspace." },
    { a: "tester", sh: "sed -i '/Welcome back\\|<<<<<<<\\|=======\\|>>>>>>>/d' app/page.tsx",
      cap: "tester keeps its own line and drops the markers…" },
    { a: "tester", call: "sandbox.commit", args: { message: "resolve headline" },
      cap: "…and commits on the new head." },
    { a: "ui-dev", sh: "npm ci && npm test" },
    { a: "ui-dev", sh: "npm run dev &",
      cap: "A background dev server. It shows under ui-dev's Sandbox on the main tab, and in the bottom bar on every tab." },
    { a: "ui-dev", call: "sandbox.commit", args: { message: "install deps" },
      cap: "ui-dev's Workspace is two Commits behind, but touched other files: the engine merges it cleanly and commits on the head." },
    { a: "ui-dev", call: "process.cancel", args: {},
      cap: "The engine refuses to unmount a busy Workspace, so ui-dev stops its server first." },
    { a: "ui-dev", call: "sandbox.unmount", args: {},
      cap: "Unmount closes the pane." },
    { a: "tester", call: "sandbox.unmount", args: {} },
    { a: "ui-dev", call: "branch.fork", args: { branch: "feature-home", name: "try-a" },
      cap: "Any agent forks any Branch, any time. Fork, merge and publish always show on the main tab." },
    { a: "tester", call: "branch.fork", args: { branch: "feature-home", name: "try-b" } },
    { a: "dsh", call: "dsh.spawn", args: { agents: SCOUTS },
      cap: "Scale it up: dsh spawns 9 scouts. Idle agents get no crabs on the main tab — just the count in the Branches header." },
    { a: "dsh", call: "dsh.burst", tab: "main",
      burst: SCOUTS.map((n, i) => ({ a: n, call: "fs.read", args: { ref: ["feature-home", "try-a", "try-b"][i % 3 === 0 || i > 6 ? 0 : i % 3], path: ["/app/page.tsx", "/app/components/hero.tsx", "/README.md"][i % 3] } })),
      cap: "The scouts read across Branches. A row shows at most 3 crabs plus <b>+N</b>; tab chips cap their avatars the same way." },
    { a: "dsh", call: "dsh.view", tab: "feature-home",
      cap: "Inside a Branch tab the fs terminal caps its crowd too. Only agents on <i>this</i> Branch appear here." },
    { a: "ui-dev", call: "fs.write", args: { branch: "try-a", path: "/app/theme.css", content: ":root { --brand: #d97757; }\n", message: "warm theme" },
      cap: "One agent, many Branches: ui-dev is now on try-a. Its location comes from its last call — nothing was assigned." },
    { a: "tester", call: "sandbox.mount", args: { branch: "try-b", sandbox: "box" } },
    { a: "tester", sh: "sed -i 's/<section>/<section className=\"lazy\">/' app/components/hero.tsx" },
    { a: "tester", call: "sandbox.commit", args: { message: "lazy hero" } },
    { a: "tester", call: "sandbox.unmount", args: {} },
    { a: "tester", script: "matrix.sh", tab: "main", calls: [
        { call: "sandbox.create", args: {}, as: "ci" },
        { call: "sandbox.mount", args: { branch: "try-a", sandbox: "ci" }, as: "ci-a" },
        { call: "sandbox.mount", args: { branch: "try-b", sandbox: "ci" }, as: "ci-b" }],
      cap: "One agent, many Workspaces: tester runs a script that creates its own Sandbox and mounts try-a and try-b side by side. Each call is still one event; its <b>group</b> names the script, so its lines carry <code>⧉ matrix.sh</code>." },
    { a: "tester", script: "matrix.sh", tab: "main", calls: [{ ws: "ci-a", sh: "npm test" }, { ws: "ci-b", sh: "npm test" }],
      cap: "tester stands where its last call ran, with <b>×N</b> for the places it works in at once; a faint copy marks each other Workspace it holds." },
    { a: "tester", script: "matrix.sh", tab: "main", calls: [
        { ws: "ci-a", call: "sandbox.unmount", args: {} },
        { ws: "ci-b", call: "sandbox.unmount", args: {} },
        { call: "sandbox.close", args: { sandbox: "ci" } }],
      cap: "The script cleans up: two unmounts, then <b>sandbox close</b>. Not only the main agent: any agent may close a Sandbox once nothing is mounted in it." },
    { a: "main", call: "branch.merge", args: { branch: "try-a", with: "try-b", name: "release" },
      cap: "Merge never changes its inputs: the engine creates a new Branch from two." },
    { a: "main", call: "branch.publish", args: { branch: "release" },
      cap: "<b>Publish</b> is the one call that lands in main. A new Layer joins the main lane." },
    { a: "dsh", call: "dsh.idle", args: { seconds: 40 },
      cap: "Idle Branch tabs fade after ~30 s unless pinned; their history stays in the graph." },
    { a: "dsh", call: "dsh.view", tab: "feature-home",
      cap: "<b>Recently here:</b> a Branch tab's bench holds only idle agents whose last call was on this Branch, for ~90 s." },
  ];
  const api = { SCOUTS, story };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.LAYERFS_DSH_STORY = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
