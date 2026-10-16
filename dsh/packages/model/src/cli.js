// SDK to CLI: the one table that says, for every call an agent can make,
// which terminal prints it and the command line it prints there.
//
// Terminals
//   project    one per project: the project, its Branches and its Sandboxes'
//              lives (init, fork, merge, publish, history reads, create, close)
//   fs         one per Branch: every fs.* call on that Branch
//   workspace  one pane per mounted Workspace (sandbox:path): mount, the
//              commands run in it, status, commit, unmount, process control
//   null       not drawn: the client's own service calls and operator reads
//
// CLI form: `<group> <method> <required args…> [--optional value…]`
//   - group and method are the SDK's own names (`branch list_commits`).
//   - Required arguments are positional, in SDK order. Optional ones are
//     `--kebab-name value` and print only when they differ from the SDK
//     default; a true boolean is a bare `--force` / `--discard`.
//   - A message is `-m "<message>"`. File content is never printed.
//   - What the terminal already names is not repeated: an fs line drops its
//     Branch or ref, a workspace line drops its Sandbox and path.
//   - A command run in a Workspace prints as the shell command itself (the
//     pane is that Workspace's shell); a background start ends with ` &`.
// A failed mount has no pane, so it prints in the project terminal.
//
// `dim` lines are reads or bookkeeping, drawn quieter than changes.

const kebab = (name) => name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
const quote = (v) => (/^[^\s"'\\]+$/.test(String(v)) ? String(v) : JSON.stringify(String(v)));
const shortImage = (image) => String(image).replace(/^(sha256:[0-9a-f]{12})[0-9a-f]+$/, "$1");

/**
 * One command line: `head`, then the positional values, then each optional
 * `[name, value, sdkDefault]` that is set and not its default, then `-m`.
 */
function line(head, positional = [], optional = [], message) {
  const parts = [head, ...positional.filter((v) => v !== undefined && v !== null && v !== "").map(quote)];
  for (const [name, value, fallback] of optional) {
    if (value === undefined || value === null || value === fallback || value === false) continue;
    parts.push(value === true ? `--${kebab(name)}` : `--${kebab(name)} ${quote(value)}`);
  }
  if (message !== undefined && message !== null) parts.push(`-m ${JSON.stringify(String(message))}`);
  return parts.join(" ");
}
const page = (a) => [["pageSize", a.pageSize, 50], ["pagePos", a.pagePos, 0]];
const count = (changes) => (Array.isArray(changes) ? changes.length : changes);

/** call name -> { at: terminal, dim?: true, cli: (args, sh?) => command line } */
export const CLI = {
  // ------------------------------------------------------------- project
  "project.init": { at: "project", cli: (a) => line("project init", [a.path ?? `./${a.name}`]) },
  "project.list_branches": { at: "project", dim: true, cli: (a) => line("project list_branches", [], page(a)) },

  // ------------------------------------------------------------- branch
  "branch.fork": { at: "project", cli: (a) => line("branch fork", [a.name], [["fromRef", a.fromRef ?? a.from ?? a.branch, "main"]]) },
  // the simulator's name for a fork of main
  "main.fork": { at: "project", cli: (a) => line("branch fork", [a.name]) },
  "branch.list_commits": { at: "project", dim: true, cli: (a) => line("branch list_commits", [a.branch], page(a)) },
  "branch.diff_commits": { at: "project", dim: true, cli: (a) => line("branch diff_commits", [a.from, a.to], page(a)) },
  "branch.diff_branches": { at: "project", dim: true, cli: (a) => line("branch diff_branches", [a.from, a.to], page(a)) },
  "branch.merge": { at: "project", cli: (a) => line("branch merge", [a.branch, a.with, a.name], [], a.message) },
  "branch.publish": { at: "project", cli: (a) => line("branch publish", [a.branch], [["commit", a.commit]]) },

  // ------------------------------------------------------------- fs (the Branch is the terminal's)
  "fs.read": { at: "fs", dim: true, cli: (a) => line("fs read", [a.path], [["startLine", a.startLine, 1], ["endLine", a.endLine]]) },
  "fs.list": { at: "fs", dim: true, cli: (a) => line("fs list", [a.path && a.path !== "/" ? a.path : undefined], page(a)) },
  "fs.stat": { at: "fs", dim: true, cli: (a) => line("fs stat", [a.path]) },
  "fs.grep": { at: "fs", dim: true, cli: (a) => line("fs grep", [a.pattern, a.path && a.path !== "/" ? a.path : undefined], page(a)) },
  "fs.glob": { at: "fs", dim: true, cli: (a) => line("fs glob", [a.pattern, a.path && a.path !== "/" ? a.path : undefined], page(a)) },
  "fs.blame": { at: "fs", dim: true, cli: (a) => line("fs blame", [a.path], [["fromLine", a.fromLine, 1]]) },
  // two refs, so both are printed
  "fs.diff_files": { at: "fs", dim: true, cli: (a) => line("fs diff_files", [a.leftRef ?? a.left?.commit ?? a.ref, a.leftPath ?? a.left?.path ?? a.path, a.rightRef ?? a.right?.commit ?? a.ref, a.rightPath ?? a.right?.path]) },
  "fs.write": { at: "fs", cli: (a) => line("fs write", [a.path], [], a.message) },
  "fs.edit": { at: "fs", cli: (a) => line("fs edit", [a.path], [], a.message) },
  // the changes are summarized by their count
  "fs.apply": { at: "fs", cli: (a) => line(count(a.changes) !== undefined ? `fs apply ${count(a.changes)} changes` : "fs apply", [], [], a.message) },
  "fs.mkdir": { at: "fs", cli: (a) => line("fs mkdir", [a.path], [], a.message) },
  "fs.rm": { at: "fs", cli: (a) => line("fs rm", [a.path], [], a.message) },
  "fs.cp": { at: "fs", cli: (a) => line("fs cp", [a.from, a.to], [], a.message) },
  "fs.mv": { at: "fs", cli: (a) => line("fs mv", [a.from, a.to], [], a.message) },

  // ------------------------------------------------------------- sandbox
  "sandbox.create": { at: "project", cli: (a) => line("sandbox create", [a.name, a.project, a.image && shortImage(a.image)]) },
  "sandbox.close": { at: "project", cli: (a) => line("sandbox close", [a.sandbox]) },
  "sandbox.mount": { at: "workspace", dim: true, cli: (a) => line("sandbox mount", [a.branch]) },
  "sandbox.exec": { at: "workspace", cli: (a, sh) => (sh ?? a.command) + (a.background && !/&\s*$/.test(sh ?? a.command) ? " &" : "") },
  "sandbox.status": { at: "workspace", dim: true, cli: () => "sandbox status" },
  "sandbox.commit": { at: "workspace", cli: (a) => line("sandbox commit", [], [["force", a.force]], a.message) },
  "sandbox.unmount": { at: "workspace", cli: (a) => line("sandbox unmount", [], [["discard", a.discard]]) },

  // ------------------------------------------------------------- operator
  // process start and cancel are the only operator calls drawn; the rest are reads
  "process.start": { at: "workspace", cli: (a, sh) => CLI["sandbox.exec"].cli({ ...a, background: true }, sh) },
  "process.cancel": { at: "workspace", cli: (a) => line("process cancel", [a.process]) },
  // the simulator's names for a Sandbox's process list and the Layer snapshot
  "sandbox.list_processes": { at: "project", dim: true, cli: (a) => line("process list", [a.sandbox]) },
  "main.list_layers": { at: "project", dim: true, cli: () => "inspect snapshot" },
  "sandbox.service": { at: null },
  "project.progress": { at: null },
  "store.stats": { at: null },
  "store.commits": { at: null },
  "files.stats": { at: null },
  "files.history": { at: null },
  "workspace.overlay": { at: null },
  "workspace.changes": { at: null },
  "inspect.snapshot": { at: null },
  "process.list": { at: null },
};

/** The route of `call`; a call missing from the table prints its own name, dimmed, in the project terminal. */
export const routeOf = (call) => CLI[call] ?? { at: "project", dim: true, cli: () => call };

/** The command line `call` prints with `args` (and, for a Workspace command, its shell text `sh`). */
export const cliOf = (call, args = {}, sh) => routeOf(call).cli?.(args, sh) ?? call;
