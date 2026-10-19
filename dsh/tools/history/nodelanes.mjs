// NODE_RULE.md from P3, played (owner-approved 2026-10-19; §3 R1 chosen that day): the
// lead's first install before the lanes fork (§2), each lane's two test
// points (§4: after its middle step and at its end) and the facts the proofs
// (§6, nodeproof.mjs) compare with native on the identical tree. A test point
// is one one-shot Workspace on the lane: the refresh (the root lane's install
// when the window changed install inputs), its own Commit; `tsc -b` of the
// lane's changed packages, its own Commit; vitest of the point's calibrated
// files, its own Commit. Labels end `.install`, `.refresh`, `.tsc` and
// `.vitest`, which storage.mjs stepSource attributes to node_modules and build
// output. The lead's repair after the merges is the closure (closure.mjs,
// kind `repair-install`). A test point never stops the range on a tool's exit:
// its exit is a fact the proofs compare with native's.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { git, lsTree } from "./git.mjs";
import { expectCall, Mismatch, setup } from "./lib.mjs";
import { INSTALL_INPUT, installCommand, listerCommand, normalizeOutput, parseLister, STORE_MOUNT } from "./closure.mjs";
import { GIT_ENV, laneGitDir } from "./gitlanes.mjs";
import { packageOf, parseVitestJson, vitestCommand } from "./unit-tests.mjs";
import { decoyBytes, pad } from "./steps.mjs";
import { emittedCommand, nodeOf, parseEmitted, pointBuild, PRUNE_EMPTY, vitestMessages, wholeBuild } from "./nodeconfig.mjs";

export { EMITTED, emittedCommand, nodeOf, parseEmitted, pointBuild, wholeBuild } from "./nodeconfig.mjs";

/**
 * NODE_RULE §3: `plan` plays the frozen plan as it is; `r1` (option b, owner
 * 2026-10-19: every install-input change goes to the root lane, snapped to the
 * dsh commit's set) plays a plan made with `plan.mjs --inputs-rule r1`, and
 * nodeContext refuses a range planned under the other rule. `travel` (option
 * a) was not chosen and is refused.
 */
export const INPUTS_RULES = { plan: null, r1: null, travel: "NODE_RULE §3 (a) was not chosen: the owner chose R1 (b) on 2026-10-19" };
export function checkNode(node, plan = null) {
  if (!(node.inputsRule in INPUTS_RULES)) return `inputs rule ${node.inputsRule}: one of ${Object.keys(INPUTS_RULES).join(", ")}`;
  if (INPUTS_RULES[node.inputsRule]) return INPUTS_RULES[node.inputsRule];
  if (plan && (plan.inputsRule ?? "plan") !== node.inputsRule) return `range ${plan.range} was planned under inputs rule ${plan.inputsRule ?? "plan"}, the run plays ${node.inputsRule}${node.inputsRule === "r1" ? ": re-plan it with plan.mjs --inputs-rule r1" : ""}`;
  return null;
}

/** A Commit call's Commit id: `sandbox.commit` answers its record (`commit.id`), others the id itself. */
export const commitIdOf = (v) => (v?.commit && typeof v.commit === "object" ? v.commit.id : v?.commit) ?? null;

/** Step kinds that land tracked changes on a lane (a test point follows only these). */
export const WRITING = new Set(["fs", "apply", "stale-apply"]);

/** Each lane's test points (§4): after its middle writing step and at its last; one point when they coincide. */
export function testPoints(plan) {
  const rootLane = plan.lanes.find((l) => l.areas.includes("/"))?.name ?? null, out = [];
  for (const l of plan.lanes) {
    const steps = plan.steps.filter((s) => s.lane === l.name && WRITING.has(s.kind)).sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
    if (!steps.length) continue;
    const mid = steps[Math.ceil(steps.length / 2) - 1], end = steps.at(-1);
    const at = mid === end ? [["end", end]] : [["mid", mid], ["end", end]];
    let from = 0;
    for (const [point, s] of at) {
      const upto = steps.indexOf(s), window = steps.slice(from, upto + 1);
      from = upto + 1;
      out.push({ id: `${l.name}.${point}`, lane: l.name, point, step: s.id, order: s.order, root: l.name === rootLane,
        before: steps.slice(0, upto + 1).map((x) => x.id),
        // the root lane installs when its window changed an install input; every other point refreshes (§4)
        kind: l.name === rootLane && window.some((x) => (x.files ?? []).some((f) => (f.op === "write" || f.op === "rm") && INSTALL_INPUT.test(f.path) && !f.path.includes("node_modules/"))) ? "install" : "refresh" });
    }
  }
  return out;
}

/** The hash of a tree's install inputs (path and blob), the oracle's second key (NODE_RULE §6). */
export function inputsHash(files) {
  const rows = [...files].filter(([p]) => INSTALL_INPUT.test(p) && !p.includes("node_modules/")).map(([p, v]) => `${v.mode} ${v.blob} ${p}`).sort();
  return createHash("sha256").update(rows.join("\n")).digest("hex").slice(0, 16);
}

/**
 * A lane tree against the range base, as rows the native side rebuilds the
 * same tree from: [path, mode, blob] for dsh blobs, [path, mode, null, {
 * base, marker }] for a decoy (its bytes are decoyBytes(base, marker)), and
 * [path, null] for a removal.
 */
export function treeDelta(base, tree, plan) {
  const decoys = new Map();
  for (const s of plan.steps) for (const f of s.files ?? []) if (f.op === "decoy") decoys.set(`decoy:${s.id}\0${f.path}`, { base: f.base, marker: f.marker });
  const rows = [];
  for (const [p, v] of tree.files) {
    const b = base.get(p);
    if (b && b.blob === v.blob && b.mode === v.mode) continue;
    if (String(v.blob).startsWith("decoy:")) {
      const d = decoys.get(`${v.blob}\0${p}`);
      if (!d) throw new Error(`${p}: decoy ${v.blob} is not in the plan`);
      rows.push([p, v.mode, null, d]);
    } else rows.push([p, v.mode, v.blob]);
  }
  for (const p of base.keys()) if (!tree.files.has(p)) rows.push([p, null]);
  return rows.sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

/** The decoy bytes of a delta row (the native side writes them as blobs). */
export const decoyOf = async (blobs, d) => decoyBytes(await blobs.get(d.base), d.marker);

/**
 * The tree id of the Workspace's tracked files, as git computes it: the
 * lane's (or the shared) index copied with its stat data, `git add -A` and
 * `git write-tree` with a private index and object folder in /tmp, so nothing
 * is written to `.git` or the Workspace.
 */
export const treeIdCommand = (gitDir = ".git") => [`set -e; ${GIT_ENV}; d=/tmp/lfs352-tid.$$; rm -rf $d; mkdir -p $d/o; cp ${gitDir}/index $d/i`,
  `export GIT_DIR=${gitDir} GIT_WORK_TREE=. GIT_INDEX_FILE=$d/i GIT_OBJECT_DIRECTORY=$d/o GIT_ALTERNATE_OBJECT_DIRECTORIES=$PWD/.git/objects GIT_OPTIONAL_LOCKS=0`,
  `git add -A && echo "@@tree $(git write-tree)"; rm -rf $d`].join("\n");

/** The lane's changed packages that have a tsconfig (closure.mjs closureSteps' rule), from its changed paths. */
export function changedPackages(files, changed) {
  const pk = new Set([...files.keys()].filter((p) => p.endsWith("/package.json")).map((p) => p.slice(0, -13)));
  const ts = new Set([...files.keys()].filter((p) => p.endsWith("/tsconfig.json")).map((p) => p.slice(0, -14)));
  return [...new Set(changed.map((p) => packageOf(p, pk)).filter((d) => d && ts.has(d)))].sort();
}

/** A lane point's build: `tsc -b` of its changed packages and the bundler (none: no build). */
const lanePackages = (files, changed) => pointBuild(files, changedPackages(files, changed));
/** The Commits a point made (an UpToDate one makes none). */
const commitsOf = (rec) => [rec.install?.kind, rec.tsc?.commit, rec.vitest?.commit].filter((x) => x === "Committed").length;

/** The range's Node state (plain JSON, carried across the two commands by halves.mjs). */
export function nodeContext(run, plan) {
  const node = nodeOf(run.manifest);
  if (!node.on) return null;
  const refused = checkNode(node, plan);
  if (refused) throw new Mismatch(refused);
  const cal = join(run.planDir, `node-${pad(plan.range)}.json`);
  return { config: node, points: [], lanes: {}, calibration: existsSync(cal) ? JSON.parse(readFileSync(cal, "utf8")) : null, plan: testPoints(plan), done: [] };
}

const laneRow = (ctx, lane) => (ctx.node.lanes[lane] ??= { lane, installs: 0, refreshes: 0, tsc: 0, vitestPoints: 0, vitestFiles: 0, equal: null, run: null });
/** Where a point's lister groups go (large: kept beside the run, not in the metrics). */
export const groupsFile = (run, k, id) => join(run.dir, "node", `r${pad(k)}`, `${id.replace(/[^\w.-]/g, "_")}.groups.json`);

/**
 * One test point in its own Workspace on `branch` (the lane, or the lead for
 * the first install): install or refresh with its Commit, the lister (P1),
 * `tsc -b` and the emitted files (P4) with its Commit, vitest (P5) with its
 * Commit. Returns the point's record; the lister groups go to a side file.
 */
export async function playPoint(a, k, ctx, pt, { branch, gitDir, files, install, build = null, tests = [], roots = [] }) {
  const sb = await setup(a), rec = { ...pt, files: undefined, branch, started: new Date().toISOString() };
  const label = pt.lane === "lead" ? `r${pad(k)}` : `${pt.lane}.${pt.point}`;
  a.label(`${label}.${pt.kind}`);
  const ws = await expectCall(a, `${label} mount`, () => a.lf.sandbox.mount(sb, branch));
  let landed = false;
  try {
    const sh = async (command) => expectCall(a, `${label} exec`, () => a.lf.sandbox.exec(sb, ws, command));
    rec.root = String((await sh("pwd")).stdout).trim();
    if (gitDir) { const t = await sh(treeIdCommand(gitDir)); rec.treeLfs = t.exitCode === 0 ? /@@tree (\w+)/.exec(t.stdout)?.[1] ?? null : null; if (t.exitCode !== 0) rec.treeError = String(t.stderr).slice(-300); }
    const has = await sh(`test -d ${STORE_MOUNT}/v11 && test -f ${STORE_MOUNT}/.cache/lockfile-verified.jsonl`);
    if (has.exitCode !== 0) throw new Mismatch(`${label}: the Sandbox has no pnpm store at ${STORE_MOUNT} (INSTALLS §3.1)`);
    // install or refresh: its exit is a fact for P2, never a stop here
    const t0 = Date.now(), r = await sh(install), st = await a.lf.sandbox.status(sb, ws);
    rec.install = { command: install, exitCode: r.exitCode, ms: Date.now() - t0, output: normalizeOutput(`${r.stdout ?? ""}${r.stderr ?? ""}`), base: st?.base ?? null };
    const v = await expectCall(a, `${label} commit`, () => a.lf.sandbox.commit(sb, ws, `${label}.${pt.kind}`), "Committed|UpToDate");
    rec.install.commit = commitIdOf(v); rec.install.kind = v?.kind ?? null;
    // P3: the paths a no-op refresh changed (UpToDate: none), from the head its Commit landed on: other agents'
    // Commits to the lane during the mount are not its own (a merged Commit's parent is the head it merged with)
    if (pt.kind === "refresh" && v?.kind === "Committed" && rec.install.base) {
      rec.install.parent = (await parentOf(a, branch, rec.install.commit)) ?? rec.install.base;
      rec.install.changed = await changedPaths(a, rec.install.parent, rec.install.commit);
    } else if (pt.kind === "refresh") rec.install.changed = [];
    a.label(`${label}.${pt.kind}`);
    const l = parseLister((await sh(listerCommand([], { roots }))).stdout);
    rec.lister = { groups: l.groups.length, entries: l.groups.reduce((n, g) => n + g.n, 0), normalized: l.normalized };
    writeGroups(a, k, pt.id, l.groups);
    if (build?.packages.length) {
      a.label(`${label}.tsc`);
      const b0 = Date.now(), b = await sh(build.command);
      rec.tsc = { command: build.command, packages: build.packages, exitCode: b.exitCode, ms: Date.now() - b0, output: `${b.stdout ?? ""}${b.stderr ?? ""}`.slice(-4000) };
      rec.tsc.emitted = parseEmitted((await sh(emittedCommand(build.packages))).stdout);
      rec.tsc.commit = (await expectCall(a, `${label} tsc commit`, () => a.lf.sandbox.commit(sb, ws, `${label}.tsc`), "Committed|UpToDate"))?.kind;
    }
    if (tests.length) {
      a.label(`${label}.vitest`);
      const t1 = Date.now(), t = await sh(vitestCommand(tests, 110));
      let results = null;
      try { results = Object.fromEntries(parseVitestJson(String(t.stdout), rec.root)); } catch (e) { rec.vitestError = String(e.message).slice(0, 200); }
      rec.vitest = { files: tests, exitCode: t.exitCode, ms: Date.now() - t1, results, messages: vitestMessages(String(t.stdout), rec.root) };
      rec.vitest.commit = (await expectCall(a, `${label} vitest commit`, () => a.lf.sandbox.commit(sb, ws, `${label}.vitest`), "Committed|UpToDate"))?.kind;
    }
    landed = true;
  } finally {
    await a.lf.sandbox.unmount(sb, ws, !landed);
  }
  rec.ms = Date.now() - Date.parse(rec.started);
  return rec;
}

/** A Commit's parent, from its Branch's latest Commits (null when it is not among them). */
async function parentOf(a, branch, id) {
  const page = await a.lf.branch.list_commits(branch, 20, 0);
  return page.items?.find((c) => c.id === id)?.parent ?? null;
}

async function changedPaths(a, from, to) {
  const out = [];
  for (let cursor = null; out.length < 2000;) {
    const page = await a.lf.branch.diff_commits(from, to, 1000, 0, { ...(cursor ? { cursor } : {}), hunks: false });
    out.push(...page.items.filter((i) => i.type !== "dir").map((i) => String(i.path).replace(/^\//, "")));
    if (!page.hasMore || !page.nextCursor || page.nextCursor === cursor) break;
    cursor = page.nextCursor;
  }
  return out;
}

function writeGroups(a, k, id, groups) {
  const file = groupsFile(a, k, id);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, JSON.stringify(groups));
}

/**
 * The lead's first install (§2), on its Branch before any lane forks: at the
 * first P3 range (nothing installed yet) a first install, at a milestone a
 * clean reinstall; then the whole workspace's `tsc -b`. Each with its own
 * Commit (`r<k>.install` / `r<k>.clean-install`, `r<k>.tsc`). Recorded as the
 * point `lead.initial`; the node_modules chain restarts at it.
 */
export async function leadInstall(run, k, plan, ctx) {
  if (!ctx.node || (run.state.installed && !plan.milestone)) return null;
  const files = lsTree(run.repo, run.state.prevCommit).files, node = ctx.node.config;
  const clean = !!run.state.installed;
  const pt = { id: "lead.initial", lane: "lead", point: "initial", step: null, root: true, kind: clean ? "clean-install" : "install", tree: git(run.repo, ["rev-parse", `${run.state.prevCommit}^{tree}`]).trim(), base: run.state.prevCommit, inputs: inputsHash(files), delta: [] };
  const install = `${PRUNE_EMPTY} && ${installCommand({ clean, policy: node.storePolicy })}`;
  const rec = await playPoint(run, k, ctx, pt, { branch: ctx.lead, gitDir: ctx.git ? ".git" : null, files, install, build: wholeBuild(files), roots: run.state.closureRoots ?? [] });
  ctx.node.points.push(rec);
  ctx.work.commits += commitsOf(rec);
  // the chain restarts at the lead's install (closure.mjs nextChain: a first or clean install begins it)
  run.state.installed = true;
  // the lead's whole build is in the chain too: every lane inherits its lib/ output, so a native replay builds it as well
  run.state.closureChain = [{ range: k, checkpoint: run.state.prevCommit, kind: pt.kind, command: install, root: rec.root }, ...(rec.tsc ? [{ range: k, checkpoint: run.state.prevCommit, kind: "tsc", command: rec.tsc.command, root: rec.root }] : [])];
  run.state.closureRoots = [...new Set([...(run.state.closureRoots ?? []), rec.root])];
  return rec;
}

/**
 * After step `s` landed: when it is a lane's test point, the point waits for
 * every earlier step of its lane (`before`), then runs under the lane's lock,
 * after the step's git exec. Returns the point's record or null.
 */
export async function afterStep(a, k, s, ctx, { lock, waitFor, plan, blobs }) {
  if (!ctx.node) return null;
  const pt = ctx.node.plan.find((p) => p.step === s.id);
  if (!pt) return null;
  await Promise.all(pt.before.map((id) => waitFor(id)));
  return lock(ctx, pt.lane, async () => {
    const tree = ctx.trees.get(pt.lane), node = ctx.node.config;
    const delta = treeDelta(ctx.base, tree, plan);
    const changed = delta.map((r) => r[0]);
    const cal = ctx.node.calibration?.points?.find((c) => c.id === pt.id) ?? null;
    const rec = await playPoint(a, k, ctx, { ...pt, delta, inputs: inputsHash(tree.files), tree: null, calibration: cal ? { tree: cal.tree, files: cal.run?.length ?? 0 } : null }, {
      branch: pt.lane, gitDir: ctx.git ? laneGitDir(pt.lane) : null, files: tree.files,
      // empty folders first, as the lead's install (a replayed removal can leave one; git and the native tree
      // have none, and the bundler takes every packages/*/* folder as a package: #352 R1 slice, r015-1-docs-rfc.mid)
      install: `${PRUNE_EMPTY} && ${installCommand({ policy: node.storePolicy })}`, build: lanePackages(tree.files, changed),
      // every earlier mount root of this node_modules chain: the lead's install and the lane's earlier points (F-034)
      tests: cal?.run ?? [], roots: [...new Set([...(a.state.closureRoots ?? []), ...ctx.node.points.filter((p) => p.lane === pt.lane).map((p) => p.root)])] });
    void blobs;
    const row = laneRow(ctx, pt.lane);
    if (pt.kind === "install") row.installs++; else row.refreshes++;
    if (rec.tsc) row.tsc++;
    if (rec.vitest) { row.vitestPoints++; row.vitestFiles += rec.vitest.files.length; }
    ctx.node.points.push(rec);
    ctx.work.commits += commitsOf(rec);
    return rec;
  });
}
