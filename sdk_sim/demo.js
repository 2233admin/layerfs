// The 25-step demo story played by tui.html and checked by test_demo.js.
// term: "history" | "fs" (the active tab's Branch) | a Sandbox terminal alias.
// ui:   "open" (new Sandbox terminal), "split" (new Workspace in the same
//       Sandbox as `from`), "stop" (stop the running process of `term`).
// expect: the outcome code of the step's last SDK call.
(function (global) {
  "use strict";
  const DEMO = [
    { term: "history", lines: ["fork feature-home"], expect: "Forked",
      note: "Fork a Branch from main. A Branch opens as its own tab." },
    { term: "fs", lines: ['edit app/page.tsx "Hello world" "Welcome to LayerFS"'], expect: "Committed",
      note: "The fs terminal writes straight to the Store: each write is a Commit. No mount, no Sandbox." },
    { term: "fs", lines: ["mkdir app/about", "write app/about/page.tsx <<EOF", "export default function Page() {", "  return <main><h1>We're building with LayerFS</h1></main>;", "}", "EOF"], expect: "Committed",
      note: "mkdir and a heredoc write add a new page: two more Commits." },
    { ui: "open", as: "sb1", expect: "Mounted",
      note: "A Sandbox terminal mounts a new Workspace from the Branch head (C3)." },
    { term: "sb1", lines: ["npm ci"], expect: "exit:0",
      note: "Plain shell commands. Each one is sandbox.exec on this Workspace." },
    { term: "sb1", lines: ["npm run build"], expect: "exit:1",
      note: "The build fails lint on the unescaped apostrophe." },
    { term: "sb1", lines: ['sed -i "s/We\'re/We\\&apos;re/" app/about/page.tsx'], expect: "exit:0",
      note: "Fix it inside the Workspace." },
    { term: "sb1", lines: ["npm run build"], expect: "exit:0",
      note: "The build passes." },
    { term: "sb1", lines: ["npm run start &"], expect: "running",
      note: "A trailing & starts a background process." },
    { term: "sb1", lines: ["unmount"], expect: "Busy",
      note: "Unmount is refused while the process runs." },
    { ui: "stop", term: "sb1", expect: "Stopped",
      note: "Stop the process (process.cancel)." },
    { term: "sb1", lines: ["commit"], expect: "Committed",
      note: "Commit saves the Workspace, build output included, as C4. The Workspace now sits on C4." },
    { term: "fs", lines: ['write CHANGELOG.md "- about page"'], expect: "Committed",
      note: "fs still writes while the Branch is mounted. The head moves to C5, so the Workspace on C4 is now stale." },
    { term: "sb1", lines: ['echo "PORT=3000" > .env.example'], expect: "exit:0",
      note: "The stale Workspace keeps working on its own base: it cannot see CHANGELOG.md." },
    { term: "sb1", lines: ["commit"], expect: "Stale",
      note: "Commit is refused: it would drop C5. Nothing is lost yet." },
    { term: "sb1", lines: ["commit --force"], expect: "Committed",
      note: "--force commits from C4 anyway. C6 jumps over C5, so the changelog is no longer an ancestor of the head; C5 stays in history." },
    { ui: "split", from: "sb1", as: "sb2", expect: "Mounted",
      note: "Split: a second Workspace in the same Sandbox, mounted from the current head." },
    { term: "sb2", lines: ['echo "Built with LayerFS" >> README.md'], expect: "exit:0",
      note: "Each Workspace has its own overlay." },
    { term: "sb2", lines: ["commit"], expect: "Committed",
      note: "Another CLI committing also moves the head: now the first Workspace is stale." },
    { term: "sb1", lines: ["unmount"], expect: "Unmounted",
      note: "Nothing uncommitted, so the stale Workspace unmounts cleanly and its terminal closes." },
    { term: "sb2", lines: ["unmount"], expect: "Unmounted",
      note: "The Branch has no mounts left." },
    { term: "history", lines: ["fork header from C4"], expect: "Forked",
      note: "Fork a second Branch from a feature-home Commit: header starts at C4, before the changelog and the forced commit." },
    { term: "fs", lines: ['write app/header.tsx "export const Header = () => <header/>;"'], expect: "Committed",
      note: "Work on header directly through fs." },
    { term: "history", lines: ["publish feature-home"], expect: "Added",
      note: "Publish adds the Branch head to main as a new Layer." },
    { term: "history", lines: ["publish header"], expect: "StackMoved",
      note: "Publish is fast-forward only: main moved, so header must be forked again from the new main." },
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = DEMO;
  else global.LAYERFS_DEMO = DEMO;
})(this);
