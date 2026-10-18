// fs.apply changes that take range 14's checkpoint tree (dsh 6e5c908a1) to range 15's (b4ec4060a), plus /.lww.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const git = process.env.HOME + "/lfs-history/dsh.git", A = "6e5c908a1", B = "b4ec4060a";
const g = (...a) => execFileSync("git", [`--git-dir=${git}`, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const dirsOf = (c) => new Set(g("ls-tree", "-r", "-d", "--name-only", c).split("\n").filter(Boolean));
const before = dirsOf(A), after = [...dirsOf(B)].filter((d) => !before.has(d)).sort((x, y) => x.split("/").length - y.split("/").length || x.localeCompare(y));
const changes = after.map((d) => ({ op: "mkdir", path: "/" + d }));
const expect = [];
for (const line of g("diff", "--no-renames", "--raw", "-z", A, B).split(":").filter(Boolean)) {
  const [meta, path] = line.split("\0");
  const [, , , blob, status] = meta.trim().split(" ");
  if (status === "D") { changes.push({ op: "rm", path: "/" + path }); expect.push({ path: "/" + path, blob: null }); }
  else { changes.push({ op: "write", path: "/" + path, content: g("cat-file", "blob", blob) }); expect.push({ path: "/" + path, blob }); }
}
changes.push({ op: "write", path: "/.lww", content: readFileSync(process.env.HOME + "/lfs-history/scale-experiments/s4/lww.txt", "utf8") });
writeFileSync(process.env.HOME + "/lfs-history/scale-experiments/s4/r15-changes.json", JSON.stringify({ from: A, to: B, changes, expect }));
console.log(JSON.stringify({ mkdir: after.length, changes: changes.length, expect: expect.length }));
