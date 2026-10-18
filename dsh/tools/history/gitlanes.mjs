// F-031 (owner-approved, revised; F031_DESIGN.md): one real git commit per
// replayed dsh commit. Who commits which dsh commit, and the git commands.
//
// A non-merge commit wholly in one lane, whose parents already exist in that
// lane's .git (before the range, or committed earlier in the same lane), is
// committed in the lane: lane-private index, read-tree <parent>, real git add /
// git rm --cached, write-tree, commit-tree with the original metadata,
// update-ref of the lane's own ref. Every other commit (split across lanes, a
// parent not yet in the lane, a merge, no planned files) is committed by the
// lead after the merges, in topological order, with update-index --cacheinfo
// from the blobs the lanes' git hash-object wrote (lead decision 2026-10-18).

/**
 * The committer of each dsh commit of a range.
 * @param {{ id: string, parents: string[] }[]} commits the range's new commits, parents first
 * @param {Map<string, Set<string>>} lanesOf lanes whose plan steps carry each commit's files
 * @returns {Map<string, { who: "lane" | "lead", lane?: string, why?: string }>}
 */
export function classifyCommits(commits, lanesOf) {
  const inRange = new Set(commits.map((c) => c.id)), out = new Map();
  for (const c of commits) {
    const lanes = lanesOf.get(c.id) ?? new Set();
    const why = c.parents.length > 1 ? "merge" : !lanes.size ? "no planned files" : lanes.size > 1 ? `split over ${lanes.size} lanes` : null;
    if (why) { out.set(c.id, { who: "lead", why }); continue; }
    const [lane] = lanes;
    // a parent from before the range is in every lane's .git; one from this range only if the same lane committed it
    const missing = c.parents.find((p) => inRange.has(p) && !(out.get(p)?.who === "lane" && out.get(p).lane === lane));
    out.set(c.id, missing ? { who: "lead", why: `parent ${missing.slice(0, 9)} not in the lane` } : { who: "lane", lane });
  }
  return out;
}

const q = (t) => `'${String(t).replaceAll("'", "'\\''")}'`;

/** A dsh commit's raw header fields and message (git cat-file commit). */
export function parseCommit(raw) {
  const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw);
  const at = text.indexOf("\n\n"), head = text.slice(0, at).split("\n"), message = text.slice(at + 2);
  const field = (k) => head.filter((l) => l.startsWith(`${k} `)).map((l) => l.slice(k.length + 1));
  const person = (line) => { const m = /^(.*) <(.*)> (\d+ [+-]\d{4})$/.exec(line ?? ""); return m ? { name: m[1], email: m[2], date: m[3] } : null; };
  const extra = head.filter((l) => !/^(tree|parent|author|committer|encoding) /.test(l));
  return { tree: field("tree")[0], parents: field("parent"), author: person(field("author")[0]), committer: person(field("committer")[0]), encoding: field("encoding")[0] ?? null, message, extra };
}

/**
 * The lane's git exec for one wholly-owned commit: index from the parent, the
 * commit's paths added or removed, write-tree and commit-tree printed, the
 * lane ref moved. `msgFile` holds the raw message (sent like Sandbox bytes).
 */
export function laneCommitScript({ lane, commit, meta, add, remove, msgFile }) {
  const env = `GIT_INDEX_FILE=.git/lanes/${lane}/index GIT_AUTHOR_NAME=${q(meta.author.name)} GIT_AUTHOR_EMAIL=${q(meta.author.email)} GIT_AUTHOR_DATE=${q(meta.author.date)} GIT_COMMITTER_NAME=${q(meta.committer.name)} GIT_COMMITTER_EMAIL=${q(meta.committer.email)} GIT_COMMITTER_DATE=${q(meta.committer.date)}`;
  const enc = meta.encoding ? `-c i18n.commitEncoding=${q(meta.encoding)} ` : "";
  return [
    "set -e",
    `mkdir -p .git/lanes/${lane}`,
    `export ${env}`,
    `git read-tree ${meta.parents[0] ?? "--empty"}`,
    ...(add.length ? [`git add -f -- ${add.map(q).join(" ")}`] : []),
    ...(remove.length ? [`git rm --cached -q -- ${remove.map(q).join(" ")}`] : []),
    `t=$(git write-tree); echo "@@tree $t"`,
    `c=$(git ${enc}commit-tree "$t" ${meta.parents.map((p) => `-p ${p}`).join(" ")} -F ${msgFile}); echo "@@commit $c"`,
    `git update-ref refs/heads/lanes/${lane} "$c"`,
    `[ "$c" = ${commit} ]`,
  ].join("\n");
}

/** The lanes' blob writes for their part of any commit: real hashing of the Workspace's bytes. */
export const hashScript = (paths) => `git hash-object -w -- ${paths.map(q).join(" ")}`;

/** One lead-built commit: lead-private index from the parent, entries by blob id, write-tree, commit-tree. */
export function leadCommitScript({ commit, meta, entries, remove, msgFile }) {
  const env = `GIT_INDEX_FILE=.git/lanes/lead/index GIT_AUTHOR_NAME=${q(meta.author.name)} GIT_AUTHOR_EMAIL=${q(meta.author.email)} GIT_AUTHOR_DATE=${q(meta.author.date)} GIT_COMMITTER_NAME=${q(meta.committer.name)} GIT_COMMITTER_EMAIL=${q(meta.committer.email)} GIT_COMMITTER_DATE=${q(meta.committer.date)}`;
  const enc = meta.encoding ? `-c i18n.commitEncoding=${q(meta.encoding)} ` : "";
  return [
    "set -e",
    "mkdir -p .git/lanes/lead",
    `export ${env}`,
    `git read-tree ${meta.parents[0] ?? "--empty"}`,
    ...entries.map((e) => `git update-index --add --cacheinfo ${e.mode},${e.blob},${q(e.path)}`),
    ...(remove.length ? [`git update-index --force-remove -- ${remove.map(q).join(" ")}`] : []),
    `t=$(git write-tree); echo "@@tree $t"`,
    `c=$(git ${enc}commit-tree "$t" ${meta.parents.map((p) => `-p ${p}`).join(" ")} -F ${msgFile}); echo "@@commit $c"`,
    `[ "$c" = ${commit} ]`,
  ].join("\n");
}
