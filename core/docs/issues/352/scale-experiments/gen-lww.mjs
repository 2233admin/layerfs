// /.lww from every dsh .gitignore at a commit (owner 2026-10-18): root patterns as written,
// then each nested file's patterns with its folder prefix (`p` -> `dir/**/p`, `/p` or `a/b` -> `dir/p`),
// negations kept, shallower folders first.  usage: node gen-lww.mjs <git dir> <commit>
import { execFileSync } from "node:child_process";
const [git, commit] = process.argv.slice(2);
const g = (...a) => execFileSync("git", [`--git-dir=${git}`, ...a], { encoding: "utf8", maxBuffer: 1 << 26 });
const files = g("ls-tree", "-r", "--name-only", commit).split("\n").filter((p) => /(^|\/)\.gitignore$/.test(p))
  .sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
const out = [];
for (const f of files) {
  const dir = f.includes("/") ? f.slice(0, f.lastIndexOf("/")) : "";
  out.push(`# from ${f}`);
  for (const raw of g("show", `${commit}:${f}`).split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!dir) { out.push(line); continue; }
    if (!line || line.startsWith("#")) continue;
    const neg = line.startsWith("!"), p = neg ? line.slice(1) : line;
    const body = p.replace(/\/$/, "");
    const anchored = p.startsWith("/") || body.includes("/");
    out.push(`${neg ? "!" : ""}${anchored ? `${dir}/${p.replace(/^\//, "")}` : `${dir}/**/${p}`}`);
  }
}
process.stdout.write(out.join("\n").replace(/\n+$/, "") + "\n");
console.error(JSON.stringify({ files }));
