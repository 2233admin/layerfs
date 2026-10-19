// F-031 (F031_DESIGN.md, GIT_RULE.md; owner decisions 2026-10-19): `.git`
// in the Workspaces from P3.
//
// Seed: the first P3 range's lead Branch gets a `.git` packed natively from
// dsh.git (everything reachable from the previous checkpoint), written with one
// fs.apply, then one exec builds the index (read-tree HEAD, update-index
// --refresh) and checks it.
// Lanes (Q3, porcelain): each lane step that changes tracked files runs one git
// exec in a one-shot Workspace on its lane, in the lane's linked worktree
// folder `.git/worktrees/<lane>/` (its own HEAD on refs/heads/lanes/<lane>,
// its own index, `commondir` to the shared objects and refs), with
// `GIT_DIR=.git/worktrees/<lane> GIT_WORK_TREE=.`: `git status --porcelain`
// and `git diff --stat` without optional locks, then real `git add -f`,
// `git rm --cached` and porcelain `git commit`. New ids, a fixed replay
// identity and the step's dsh commit date. A lane writes only its worktree
// folder, its lane ref and new loose objects (the lane guard, laneAllowed).
// Lead: after the merges and the reconcile, every dsh commit of the range is
// written in topological order with real write-tree and commit-tree, and each
// printed id must equal dsh's; then main moves to the checkpoint, the index is
// rebuilt, the range's objects are packed, the lane refs and worktree folders go.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { git } from "./git.mjs";

const q = (t) => `'${String(t).replaceAll("'", "'\\''")}'`;

/** The env every git exec in a Sandbox starts with: the Workspace is owned by another uid. */
export const GIT_ENV = "export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'";
/** The seed's config: no reflogs, no automatic gc or maintenance (a recorded departure, F031_DESIGN §2). */
export const SEED_CONFIG = "[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = false\n[gc]\n\tauto = 0\n[maintenance]\n\tauto = false\n";
/** Paths in the Workspace that are not dsh content. */
export const SEED_EXCLUDE = ".lfs-probe/\n/.lww\n/.lfs-git-job/\n";
/** Where the lead's job files travel (fs.apply), removed by the lead's own exec. */
export const JOB_DIR = ".lfs-git-job";

/**
 * The seed's fs.apply ops: a fresh `.git` whose only pack holds everything
 * reachable from `commit`, `main` at it. Returns the ops and the pack's facts.
 */
export function seedOps(repo, commit) {
  const dir = mkdtempSync(join(tmpdir(), "lfs352-seed-"));
  try {
    // --stdout, then index-pack in the temp folder: pack-objects' own rename from the repo's objects folder to
    // another file system fails in the runner (EXDEV, dev352-p3r r015)
    writeFileSync(join(dir, "tmp.pack"), execFileSync("git", ["--git-dir", repo, "pack-objects", "--revs", "-q", "--stdout"], { input: `${commit}\n`, maxBuffer: 1 << 30 }));
    const hash = execFileSync("git", ["index-pack", join(dir, "tmp.pack")], { cwd: dir, encoding: "utf8" }).trim().split(/\s+/).at(-1);
    for (const ext of ["pack", "idx", "rev"]) if (existsSync(join(dir, `tmp.${ext}`))) renameSync(join(dir, `tmp.${ext}`), join(dir, `pack-${hash}.${ext}`));
    const files = readdirSync(dir).filter((f) => f.startsWith(`pack-${hash}.`));
    const pack = files.map((f) => ({ name: f, bytes: readFileSync(join(dir, f)) }));
    const text = (s) => Buffer.from(s);
    const ops = [".git", ".git/objects", ".git/objects/pack", ".git/objects/info", ".git/refs", ".git/refs/heads", ".git/refs/tags", ".git/info"].map((d) => ({ op: "mkdir", path: `/${d}` }));
    ops.push({ op: "write", path: "/.git/HEAD", bytes: text("ref: refs/heads/main\n") }, { op: "write", path: "/.git/config", bytes: text(SEED_CONFIG) },
      { op: "write", path: "/.git/refs/heads/main", bytes: text(`${commit}\n`) }, { op: "write", path: "/.git/info/exclude", bytes: text(SEED_EXCLUDE) },
      ...pack.map((p) => ({ op: "write", path: `/.git/objects/pack/${p.name}`, bytes: p.bytes })));
    const commits = Number(git(repo, ["rev-list", "--count", commit]).trim());
    return { ops, facts: { commit, commits, packBytes: pack.reduce((n, p) => n + p.bytes.length, 0), files: pack.map((p) => p.name) } };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

/** The seed check: index from HEAD with real stat data, HEAD and the commit count, connectivity, status. */
export const seedScript = (commit, count) => [
  "set -e", GIT_ENV,
  "git read-tree HEAD",
  "t0=$(date +%s%N); git update-index -q --refresh; echo \"@@refreshMs $(( ($(date +%s%N) - t0) / 1000000 ))\"",
  `[ "$(git rev-parse HEAD)" = ${commit} ] || { echo "HEAD is $(git rev-parse HEAD)" >&2; exit 3; }`,
  `n=$(git rev-list --all --count); [ "$n" = ${count} ] || { echo "rev-list --all counts $n, not ${count}" >&2; exit 4; }`,
  "git fsck --connectivity-only --no-progress >/dev/null",
  statusProbe({ locks: false }),
].join("\n");

/**
 * A timed `git status --porcelain` with git's trace2 refresh counts: sum_scan
 * is the number of tracked files git read back to compare content (0 when
 * every index entry's stat data still matches: inode, ctime and mtime stable),
 * sum_lstat the files it stat-ed. Also whether .git/index changed. `locks`
 * false runs it without optional locks (never rewriting a shared index).
 */
export const statusProbe = ({ locks = true } = {}) => [
  "t2=/tmp/lfs352-t2.$$; st=/tmp/lfs352-st.$$; rm -f $t2",
  "b=$(sha1sum .git/index | cut -c1-40)",
  `s0=$(date +%s%N); ${locks ? "" : "GIT_OPTIONAL_LOCKS=0 "}GIT_TRACE2_PERF=$t2 git status --porcelain > $st; e=$?; echo "@@statusMs $(( ($(date +%s%N) - s0) / 1000000 ))"; echo "@@statusExit $e"`,
  `echo "@@sumScan $(grep -o 'refresh/sum_scan:[0-9]*' $t2 | cut -d: -f2 | awk '{n+=$1} END {print n+0}')"`,
  // git 2.39 stats the index in preload threads: refresh/sum_lstat alone reported 1 where git stat-ed 1,261 (GIT_RULE, native baseline)
  `echo "@@sumLstat $(grep -oE '(preload|refresh)/sum_lstat:[0-9]*' $t2 | cut -d: -f2 | awk '{n+=$1} END {print n+0}')"`,
  `echo "@@indexChanged $([ "$(sha1sum .git/index | cut -c1-40)" = "$b" ] && echo 0 || echo 1)"`,
  `echo "@@statusLines $(wc -l < $st)"; echo @@status; head -20 $st; echo @@end; rm -f $t2 $st`,
].join("\n");

/** `@@key value` lines of an exec's stdout as an object (numbers where numeric). */
export function marks(stdout) {
  const out = {};
  for (const line of String(stdout).split("\n")) {
    const m = /^@@(\w+)(?: (.*))?$/.exec(line);
    const v = m?.[2]?.trim(); // wc pads on some platforms
    if (m) out[m[1]] = v != null && /^-?\d+$/.test(v) ? Number(v) : (v ?? true);
  }
  return out;
}

/** The lines between `@@status` and the next mark. */
export const statusLines = (stdout) => {
  const lines = String(stdout).split("\n"), at = lines.indexOf("@@status");
  if (at < 0) return [];
  const out = [];
  for (const l of lines.slice(at + 1)) { if (l.startsWith("@@")) break; if (l) out.push(l); }
  return out;
};

/**
 * The untracked, unignored files `git clean -f` removes (liaison decision B, 2026-10-19, owner-delegated 16–20 run):
 * untracked files outside every ignore rule, never in an untracked folder (no -d) and never ignored ones (no -x), so
 * node_modules and build output under .gitignore stay. A lane's build can emit beside its sources on a tree the
 * plan's lane split makes (r016.a1: dsh 72bb02e68e's move split over two lanes), and the lead's merge carries every
 * file of a Branch into main. `list` prints NUL-separated paths relative to the work tree.
 */
export const UNTRACKED_LIST = "git ls-files -z --others --exclude-standard --directory --no-empty-directory | tr '\\0' '\\n' | grep -v '/$' | tr '\\n' '\\0'";
/** The lead's clean before the status checks: what it removes (count, bytes, the first 200 paths), checked, then `git clean -f`. */
export const cleanScript = () => [
  `cl=/tmp/lfs352-clean.$$; ${UNTRACKED_LIST} > $cl`,
  "echo \"@@cleanedFiles $(tr -cd '\\0' < $cl | wc -c)\"",
  "echo \"@@cleanedBytes $(xargs -0 -r cat -- < $cl | wc -c)\"",
  // the guard: none is tracked by the checkpoint, none is ignored
  "echo \"@@cleanedTracked $(xargs -0 -r git ls-files -- < $cl | wc -l)\"",
  "echo \"@@cleanedIgnored $( (xargs -0 -r git check-ignore --no-index -- < $cl || true) | wc -l)\"",
  "echo @@cleaned; tr '\\0' '\\n' < $cl | head -200; echo @@end",
  "git clean -f -q",
  `echo "@@cleanLeft $(${UNTRACKED_LIST} | tr -cd '\\0' | wc -c)"; rm -f $cl`,
].join("\n");
/** The lines between `@@cleaned` and the next mark. */
export const cleanedPaths = (stdout) => {
  const lines = String(stdout).split("\n"), at = lines.indexOf("@@cleaned");
  if (at < 0) return [];
  const out = [];
  for (const l of lines.slice(at + 1)) { if (l.startsWith("@@")) break; if (l) out.push(l); }
  return out;
};

/** A lane's linked-worktree git folder (Q3). */
export const laneGitDir = (lane) => `.git/worktrees/${lane}`;
/** trace2 lstat (preload and refresh) and scan counts of one timed command, as `@@<name>Lstat` and `@@<name>Scan`. */
const traced = (name, file) => [
  `echo "@@${name}Lstat $(grep -oE '(preload|refresh)/sum_lstat:[0-9]*' ${file} | cut -d: -f2 | awk '{n+=$1} END {print n+0}')"`,
  `echo "@@${name}Scan $(grep -o 'refresh/sum_scan:[0-9]*' ${file} | cut -d: -f2 | awk '{n+=$1} END {print n+0}')"; rm -f ${file}`,
];
/** `@@<name>Ms` around one command (GNU date in the image). */
const timed = (name, cmd) => `s0=$(date +%s%N); ${cmd}; echo "@@${name}Ms $(( ($(date +%s%N) - s0) / 1000000 ))"`;

/**
 * One lane step's git exec (GIT_RULE.md, Q3): the paths travel NUL-separated
 * in scratch files (any count). On the lane's first step the worktree folder
 * is made (HEAD, commondir, gitdir), its ref set to the range base (the shared
 * HEAD) and its index read and refreshed. Then, each timed on its own and with
 * GIT_OPTIONAL_LOCKS=0 for the two reads: `git status --porcelain`, `git diff
 * --stat`, `git add -f` then `git add --renormalize` of the same paths, `git rm --cached`, porcelain `git commit`. The lane's
 * loose-object count and the commit's tree close it. Returns exec commands
 * with `.scratch`.
 */
export function laneCommands({ lane, add, remove, message, date }, scratch) {
  const commands = [`rm -rf ${scratch} && mkdir -p ${scratch}`];
  const ship = (name, list) => {
    const b64 = Buffer.from(list.map((p) => `${p}\0`).join("")).toString("base64");
    for (let at = 0; at < b64.length; at += 45_000) commands.push(`printf %s ${q(b64.slice(at, at + 45_000))} >> ${scratch}/${name}.b64`);
    return `base64 -d < ${scratch}/${name}.b64 > ${scratch}/${name}`;
  };
  const gd = laneGitDir(lane), ref = `refs/heads/lanes/${lane}`, t2 = `${scratch}/t2`;
  const who = `GIT_AUTHOR_NAME='lfs352 lane' GIT_AUTHOR_EMAIL=${q(`${lane}@lfs352.invalid`)} GIT_AUTHOR_DATE=${q(date)} GIT_COMMITTER_NAME='lfs352 lane' GIT_COMMITTER_EMAIL=${q(`${lane}@lfs352.invalid`)} GIT_COMMITTER_DATE=${q(date)}`;
  const script = ["set -e", GIT_ENV, "t0=$(date +%s%N)",
    // the lane's first step: its worktree folder on its own ref at the range base, its index from HEAD with real stat data
    `if [ ! -f ${gd}/HEAD ]; then ${timed("setup", `mkdir -p ${gd} && printf 'ref: ${ref}\\n' > ${gd}/HEAD && printf '../..\\n' > ${gd}/commondir && printf '%s/.git\\n' "$PWD" > ${gd}/gitdir && git update-ref ${ref} "$(git rev-parse HEAD)" && GIT_DIR=${gd} GIT_WORK_TREE=. git read-tree HEAD && GIT_DIR=${gd} GIT_WORK_TREE=. git update-index -q --refresh`)}; fi`,
    `export GIT_DIR=${gd} GIT_WORK_TREE=.`,
    timed("status", `GIT_OPTIONAL_LOCKS=0 GIT_TRACE2_PERF=${t2} git status --porcelain > ${scratch}/st`), `echo "@@statusLines $(wc -l < ${scratch}/st)"`, ...traced("status", t2),
    timed("diff", `GIT_OPTIONAL_LOCKS=0 GIT_TRACE2_PERF=${t2} git diff --stat > ${scratch}/df`), `echo "@@diffLines $(wc -l < ${scratch}/df)"`, ...traced("diff", t2)];
  // --renormalize hashes the named paths again whatever their stat data says. A one-shot Workspace's index can be a
  // merged-in rewrite from a snapshot taken before this lane's last write; when that write kept the size, inode and
  // second, the entry's stat matches and the index is newer than it, so plain `git add` keeps the old blob
  // (f031-r1-slice-g r015.s0013: e70f8059 never written, the lead's write-tree stopped; git 2.39.5 reproduces it)
  if (add.length) script.push(ship("add", add), timed("add", `git add -f --pathspec-from-file=${scratch}/add --pathspec-file-nul && git add --renormalize --pathspec-from-file=${scratch}/add --pathspec-file-nul`), `echo "@@addPaths ${add.length}"`);
  if (remove.length) script.push(ship("rm", remove), timed("rm", `git rm --cached -q --ignore-unmatch --pathspec-from-file=${scratch}/rm --pathspec-file-nul`), `echo "@@rmPaths ${remove.length}"`);
  script.push(`export ${who}`, timed("commit", `GIT_TRACE2_PERF=${t2} git commit -q --allow-empty --no-verify -m ${q(message)}`), ...traced("commit", t2),
    "echo \"@@commit $(git rev-parse HEAD)\"; echo \"@@tree $(git rev-parse 'HEAD^{tree}')\"",
    "echo \"@@loose $(GIT_DIR=.git git count-objects | cut -d' ' -f1)\"; echo \"@@laneIndexBytes $(wc -c < " + gd + "/index)\"",
    "echo \"@@gitMs $(( ($(date +%s%N) - t0) / 1000000 ))\"", `rm -rf ${scratch}`);
  commands.push(script.join("\n"));
  commands.scratch = scratch;
  return commands;
}

/**
 * The lane guard (F031_DESIGN A4, owner 2026-10-19): the `.git` paths a lane
 * may change against the range base, exactly. New loose objects and their
 * folders, its worktree folder with HEAD, commondir, gitdir, index and
 * COMMIT_EDITMSG, and its own lane ref.
 */
export function laneAllowed(lane) {
  const l = lane.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // the folders above an allowed path change too, by gaining an entry (r015 f031-slice-b: .git/objects, .git/refs/heads)
  return new RegExp(`^\\.git(/(objects(/[0-9a-f]{2}(/[0-9a-f]{38})?)?|worktrees(/${l}(/(HEAD|commondir|gitdir|index|COMMIT_EDITMSG))?)?|refs(/heads(/lanes(/${l})?)?)?))?$`);
}

/** A dsh commit's raw header fields and message (git cat-file commit). */
export function parseCommit(raw) {
  const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(String(raw));
  const at = buf.indexOf("\n\n"), head = buf.subarray(0, at).toString("utf8").split("\n"), message = buf.subarray(at + 2);
  const field = (k) => head.filter((l) => l.startsWith(`${k} `)).map((l) => l.slice(k.length + 1));
  const person = (line) => { const m = /^(.*) <(.*)> (\d+ [+-]\d{4})$/.exec(line ?? ""); return m ? { name: m[1], email: m[2], date: m[3] } : null; };
  const extra = head.filter((l) => !/^(tree|parent|author|committer|encoding) /.test(l));
  return { tree: field("tree")[0], parents: field("parent"), author: person(field("author")[0]), committer: person(field("committer")[0]), encoding: field("encoding")[0] ?? null, message, extra };
}

/** Raw objects of `ids` from one `git cat-file --batch`: id -> Buffer. */
export function catFiles(repo, ids) {
  const out = execFileSync("git", ["--git-dir", repo, "cat-file", "--batch"], { input: `${ids.join("\n")}\n`, maxBuffer: 1 << 30 });
  const map = new Map();
  for (let at = 0; at < out.length;) {
    const nl = out.indexOf(10, at), [id, , size] = out.subarray(at, nl).toString().split(" ");
    map.set(id, out.subarray(nl + 1, nl + 1 + Number(size)));
    at = nl + 1 + Number(size) + 1;
  }
  return map;
}

/** `git diff-tree --stdin -z -r --no-renames` of `pairs` (commit, first parent): commit -> index-info text. */
export function indexInfos(repo, pairs) {
  const out = execFileSync("git", ["--git-dir", repo, "diff-tree", "--stdin", "-z", "-r", "--no-renames"], { input: pairs.map(([c, p]) => `${c} ${p}\n`).join(""), maxBuffer: 1 << 30 }).toString("utf8").split("\0");
  const map = new Map(pairs.map(([c]) => [c, []]));
  let cur = null;
  for (let i = 0; i < out.length; i++) {
    const t = out[i];
    if (/^[0-9a-f]{40}$/.test(t)) { cur = map.get(t); continue; }
    if (!t.startsWith(":")) continue;
    const [, mode, , blob, status] = t.slice(1).split(" ");
    const path = out[++i];
    cur.push(status === "D" ? `0 ${"0".repeat(40)}\t${path}` : `${mode} ${blob}\t${path}`);
  }
  return new Map([...map].map(([c, lines]) => [c, lines.join("\n") + (lines.length ? "\n" : "")]));
}

/**
 * The lead's job for range (prev, checkpoint]: every dsh commit, parents
 * first, with its index-info against its first parent, metadata and raw
 * message; and the range's blobs no plan step writes (a frozen-plan step can
 * cover several dsh commits, so an intermediate version never reaches a
 * Workspace), packed natively for `git unpack-objects`.
 */
export function leadJob(repo, prev, checkpoint, written) {
  const ids = git(repo, ["rev-list", "--topo-order", "--reverse", checkpoint, "--not", prev]).trim().split("\n").filter(Boolean);
  const raw = catFiles(repo, ids), commits = [];
  for (const id of ids) {
    const c = parseCommit(raw.get(id));
    commits.push({ id, tree: c.tree, parents: c.parents, author: c.author, committer: c.committer, encoding: c.encoding, message: c.message.toString("base64") });
  }
  const infos = indexInfos(repo, commits.filter((c) => c.parents.length).map((c) => [c.id, c.parents[0]]));
  for (const c of commits) c.info = c.parents.length ? infos.get(c.id) : null;
  const objects = git(repo, ["rev-list", "--objects", "--no-object-names", checkpoint, "--not", prev]).trim().split("\n").filter(Boolean);
  const types = git(repo, ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"], `${objects.join("\n")}\n`).trim().split("\n").map((l) => l.split(" "));
  const missing = types.filter(([id, t]) => t === "blob" && !written.has(id));
  const pack = missing.length ? execFileSync("git", ["--git-dir", repo, "pack-objects", "--stdout", "-q"], { input: `${missing.map(([id]) => id).join("\n")}\n`, maxBuffer: 1 << 30 }) : null;
  return { commits, pack, missing: { blobs: missing.length, bytes: missing.reduce((n, [, , s]) => n + Number(s), 0), packBytes: pack?.length ?? 0 } };
}

/**
 * The lead's commit writer (node, in the Workspace): argv job.json.gz, index
 * file, first commit, deadline ms. Writes commits from `first` in order until
 * done or past the deadline; read-tree only when the previous commit written is
 * not the first parent. Each tree and commit printed must equal dsh's.
 */
export const LEAD_WRITER = `const fs=require("fs"),z=require("zlib"),cp=require("child_process");const [job,index,first,deadline]=process.argv.slice(1);const cs=JSON.parse(z.gunzipSync(fs.readFileSync(job)));const t0=Date.now();const env={...process.env,GIT_INDEX_FILE:index};const g=(args,input,extra={})=>cp.execFileSync("git",args,{env:{...env,...extra},input,maxBuffer:1<<28}).toString().trim();let last=first>0?cs[first-1].id:null,i=+first,reads=0;for(;i<cs.length&&Date.now()-t0<+deadline;i++){const c=cs[i];if(!c.parents.length){g(["read-tree","--empty"]);reads++}else if(last!==c.parents[0]){g(["read-tree",c.parents[0]]);reads++}if(c.info)g(["update-index","--index-info"],c.info);const t=g(["write-tree"]);if(t!==c.tree){console.error("tree of "+c.id+" is "+t+", dsh has "+c.tree);process.exit(5)}const p=(x)=>({NAME:x.name,EMAIL:x.email,DATE:x.date});const a=p(c.author),m=p(c.committer);const id=g([...(c.encoding?["-c","i18n.commitEncoding="+c.encoding]:[]),"commit-tree","--no-gpg-sign",t,...c.parents.flatMap(x=>["-p",x]),"-F","-"],Buffer.from(c.message,"base64"),{GIT_AUTHOR_NAME:a.NAME,GIT_AUTHOR_EMAIL:a.EMAIL,GIT_AUTHOR_DATE:a.DATE,GIT_COMMITTER_NAME:m.NAME,GIT_COMMITTER_EMAIL:m.EMAIL,GIT_COMMITTER_DATE:m.DATE});if(id!==c.id){console.error("commit "+c.id+" was written as "+id);process.exit(6)}last=c.id}console.log("@@next "+i);console.log("@@readTrees "+reads);console.log("@@writerMs "+(Date.now()-t0))`;

/** The job file (gzip JSON) the writer reads. */
export const jobBytes = (commits) => gzipSync(JSON.stringify(commits.map(({ id, tree, parents, author, committer, encoding, message, info }) => ({ id, tree, parents, author, committer, encoding, message, info }))));

/**
 * The lead's last exec: main to the checkpoint, the index rebuilt with real
 * stat data, the range packed while the lane refs exist (so lane-only objects
 * are packed too), the lane-only objects' share measured, the lane refs and
 * worktree folders and the job folder removed, then the checks.
 */
export function finishScript({ checkpoint, prev, count }) {
  return [
    "set -e", GIT_ENV,
    `rm -rf ${JOB_DIR}`,
    `git update-ref refs/heads/main ${checkpoint}`,
    "git read-tree HEAD",
    "t0=$(date +%s%N); git update-index -q --refresh; echo \"@@refreshMs $(( ($(date +%s%N) - t0) / 1000000 ))\"",
    "echo \"@@looseBefore $(git count-objects | cut -d' ' -f1)\"",
    "ls .git/objects/pack/*.pack | sort > /tmp/lfs352-packs-before.$$",
    "t0=$(date +%s%N); git repack -d -q -n; echo \"@@repackMs $(( ($(date +%s%N) - t0) / 1000000 ))\"",
    "new=$(ls .git/objects/pack/*.pack | sort | comm -13 /tmp/lfs352-packs-before.$$ -); rm -f /tmp/lfs352-packs-before.$$",
    "echo \"@@newPackBytes $(cat $new /dev/null | wc -c)\"; echo \"@@newIdxBytes $(cat $(echo $new | sed 's/\\.pack/.idx/g') /dev/null | wc -c)\"",
    "lanes=$(git for-each-ref --format='%(refname)' refs/heads/lanes/)",
    "echo \"@@laneRefs $(echo $lanes | wc -w)\"",
    "if [ -n \"$lanes\" ]; then git rev-list --objects --no-object-names $lanes --not main | git cat-file --batch-check='%(objecttype) %(objectsize:disk)' | awk '{n[$1]++; b[$1]+=$2} END {for (t in n) print \"@@lane_\" t \" \" n[t] \"\\n@@laneBytes_\" t \" \" b[t]}'; fi",
    "for r in $lanes; do git update-ref -d \"$r\"; done",
    "echo \"@@worktrees $(ls .git/worktrees 2>/dev/null | wc -l)\"; rm -rf .git/worktrees .git/lanes",
    "echo \"@@looseAfter $(git count-objects | cut -d' ' -f1)\"",
    "echo \"@@indexBytes $(wc -c < .git/index)\"",
    "echo \"@@head $(git rev-parse HEAD)\"; echo \"@@tree $(git rev-parse 'HEAD^{tree}')\"",
    `echo "@@count $(git rev-list --count ${prev}..HEAD)"; [ "$(git rev-list --count ${prev}..HEAD)" = ${count} ]`,
    "echo \"@@refsLeft $(git for-each-ref refs/heads/lanes/ | wc -l)\"",
    cleanScript(),
    statusProbe(),
  ].join("\n");
}

/** The `.git` paths a range may change net (seed included); anything else under `.git/` is a stray. */
export const GIT_ALLOWED = /^\.git\/(HEAD|config|index|info\/exclude|refs\/heads\/main|objects\/pack\/pack-[0-9a-f]{40}\.(pack|idx|rev))$/;

// F-031 history (the liaison's revision, superseded by option (c)): which dsh
// commits a lane could have committed whole. Kept for the counts in F031_DESIGN.md §1.
export function classifyCommits(commits, lanesOf) {
  const inRange = new Set(commits.map((c) => c.id)), out = new Map();
  for (const c of commits) {
    const lanes = lanesOf.get(c.id) ?? new Set();
    const why = c.parents.length > 1 ? "merge" : !lanes.size ? "no planned files" : lanes.size > 1 ? `split over ${lanes.size} lanes` : null;
    if (why) { out.set(c.id, { who: "lead", why }); continue; }
    const [lane] = lanes;
    const missing = c.parents.find((p) => inRange.has(p) && !(out.get(p)?.who === "lane" && out.get(p).lane === lane));
    out.set(c.id, missing ? { who: "lead", why: `parent ${missing.slice(0, 9)} not in the lane` } : { who: "lane", lane });
  }
  return out;
}
