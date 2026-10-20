// NODE_RULE run switches and the emitted-files listing, apart from nodelanes.mjs
// so closure.mjs can use them without an import cycle.
const quote = (t) => `'${String(t).replaceAll("'", "'\\''")}'`;

/** Lister groups that are build output (tool caches, NODE_RULE §1), never install output (P1 leaves them out). */
export const BUILD_GROUPS = /(^|\/)node_modules\/\.(vite|vite-temp|vitest|cache)(\/|$)/;
/** The run's Node switches (manifest `node`): NODE_RULE on, the §3 install-input rule, the store policy, the vitest cap. */
export const nodeOf = (manifest) => ({ on: !!manifest?.node?.on, inputsRule: manifest?.node?.inputsRule ?? "plan", storePolicy: manifest?.node?.storePolicy ?? "verified", vitestCapMs: manifest?.node?.vitestCapMs ?? 20_000 });
/**
 * The F-057 merge-units diagnostic (#352 fix 050, liaison 2026-10-20; never the main run path): a run whose
 * manifest has `diagUnits: true` (set by hand on a diagnostic fork) merges its lanes with these units, repairs
 * incrementally (no clean relink, no clean build), and its native oracle merges the lane captures by the same
 * whole-unit rule (lanemerge.mjs apply --units).
 */
export const F057_UNITS = [{ name: "install", patterns: ["node_modules", "packages/*/*/node_modules"] }, { name: "build", patterns: ["packages/*/*/lib", "**/tsconfig.tsbuildinfo"] }];
export const diagUnits = (manifest) => (manifest?.diagUnits ? F057_UNITS : null);
/**
 * Emitted JavaScript and declarations under the packages' lib/ and dist/, as `blob path` lines (P4). A file with a
 * run of two or more `"key": "value"` lines is hashed with each run sorted and its commas dropped: tsdown emits a
 * CSS module's class map in no fixed order, so two native builds of one tree differ there (r028 a1, fix 053).
 * Every other file's id is its git blob id.
 */
export const EMITTED = `const fs=require("fs"),c=require("crypto"),re=/\\.(js|mjs|cjs|d\\.ts|d\\.mts|d\\.cts)$/,kv=/^\\s*"[^"]*": "[^"]*",?$/;const norm=(b)=>{const L=b.toString("utf8").split("\\n"),o=[];let r=[],runs=0;const f=()=>{if(r.length>1){runs++;o.push(...r.map((l)=>l.replace(/,$/,"")).sort())}else o.push(...r);r=[]};for(const l of L){if(kv.test(l))r.push(l);else{f();o.push(l)}}f();return runs?Buffer.from(o.join("\\n")):b};const walk=(d)=>{let es;try{es=fs.readdirSync(d,{withFileTypes:true})}catch{return}for(const e of es){const p=d+"/"+e.name;if(e.isDirectory()){if(e.name!=="node_modules")walk(p)}else if(e.isFile()&&re.test(e.name)){const b=norm(fs.readFileSync(p));process.stdout.write(c.createHash("sha1").update("blob "+b.length+"\\0").update(b).digest("hex")+" "+p+"\\n")}}};for(const k of process.argv.slice(1))for(const o of ["lib","dist"])walk(k==="."?o:k+"/"+o)`;
export const emittedCommand = (packages) => `node -e ${quote(EMITTED)} ${packages.map(quote).join(" ")}`;
export const parseEmitted = (stdout) => Object.fromEntries(String(stdout).split("\n").filter(Boolean).map((l) => { const at = l.indexOf(" "); return [l.slice(at + 1), l.slice(0, at)]; }));


/**
 * dsh's build is `tsc -b tsconfig.build.json && tsdown` (its package.json
 * `build`): tsc emits only lib/types, tsdown bundles lib/index.js, which the
 * packages' exports (and so vitest) resolve. A tree with tsdown.config.ts gets
 * tsdown after every tsc -b, or its tests run against missing or stale bundles.
 */
const bundled = (files, command) => (files.has("tsdown.config.ts") ? `${command} && ./node_modules/.bin/tsdown` : command);
/**
 * The lead repair's clean before its build (F-059, owner decision 2026-10-20, option A; an owner-approved
 * workload change): lib/ removed in every package with a tsconfig.json and every *.tsbuildinfo in the tree, natively the
 * same (the native repair chain replays the recorded command). A lane that built at an older commit leaves
 * output and a newer tsbuildinfo the merge keeps, and `tsc -b` then takes the package as up to date (r019 a1:
 * tool-bash's `index.d.ts` without `Config`); after the clean the repaired main equals a fresh build.
 */
export function repairClean(files) {
  const pk = new Set([...files.keys()].filter((p) => p.endsWith("/package.json")).map((p) => p.slice(0, -13)));
  const dirs = [...new Set([...files.keys()].filter((p) => p.endsWith("/tsconfig.json")).map((p) => p.slice(0, -14)))].filter((d) => pk.has(d)).sort();
  if (!dirs.length) return null;
  // also every packages/<group>/<name> folder the checkpoint no longer has: a lane that built at an older commit
  // leaves its untracked lib/ there, and tsdown bundles every such folder (r019 a2: packages/core/agent-core,
  // packages/ui/stdio-agent, `MISSING_EXPORT AgentId`); emptied by the clean (the repair install removed their
  // node_modules), the folder is pruned as a fresh checkout never has it
  const orphans = [...files.keys()].some((p) => p.startsWith("packages/"));
  // every *.tsbuildinfo in the tree, not only under the packages: a tsconfig may put it elsewhere (fix 051, r022:
  // packages/examples/cli-demo's `tsBuildInfoFile` is ../../../.typecheck/cli-demo.tsbuildinfo; kept, it made
  // `tsc -b` skip cli-demo and tsdown fail on its lib/types/bin.js, natively the same)
  // and every such folder the checkpoint does not track at all goes whole (fix 060, r044 a1): `git clean -f` (decision
  // B, no -d) never enters an untracked folder, so the .js/.d.ts a lane's tsc emitted there beside the reconcile's
  // removed sources stayed, and tsdown took the folder as a package (packages/subagent/subagent-subprocess, no
  // package.json: "[@deepseek-ai/dsh-root] Cannot find entry", natively the same)
  const kept = [...new Set([...files.keys()].map((p) => p.split("/")).filter((s) => s[0] === "packages" && s.length > 3).map((s) => s.slice(0, 3).join("/")))].sort();
  const sweep = orphans && kept.length ? ` && for d in packages/*/*/; do [ -d "$d" ] || continue; case "\${d%/}" in ${kept.map(quote).join("|")}) ;; *) rm -rf -- "$d" ;; esac; done` : "";
  return `rm -rf ${dirs.map((d) => quote(`${d}/lib`)).join(" ")}${orphans ? " packages/*/*/lib" : ""} && find . -path ./.git -prune -o -name node_modules -prune -o -name '*.tsbuildinfo' -type f -print0 | xargs -0 -r rm -f${sweep}${orphans ? ` && ${PRUNE_EMPTY}` : ""}`;
}
/**
 * The lead repair's build: its clean (repairClean), then dsh's whole build (wholeBuild), since tsdown bundles
 * every package from its lib/types and a build of the changed packages alone leaves the others without one
 * (r018 a5: `UNRESOLVED_ENTRY lib/types/index.js`, natively the same).
 */
export function repairBuild(files) {
  const b = wholeBuild(files), clean = repairClean(files);
  return { ...b, command: clean ? `${clean} && ${b.command}` : b.command };
}
/** A lane point's build (NODE_RULE §4): `tsc -b` of its changed packages, then dsh's bundler; none changed, no build. */
export const pointBuild = (files, packages) => ({ command: packages.length ? bundled(files, `./node_modules/.bin/tsc -b ${packages.map(quote).join(" ")}`) : null, packages });

/**
 * Empty folders outside .git and node_modules, removed before the lead's install
 * (first or clean). P2's replay leaves a folder empty when another agent may
 * still write into it (steps.mjs removalTarget `keep`); a native checkout (git
 * archive) has none, and dsh's tsdown takes every packages/<group>/<name> folder
 * as a package, so a leftover empty one fails the build (dev slice f031-slice-a
 * r015: packages/core/skill and three more). A no-op on the native side.
 */
export const PRUNE_EMPTY = "find . -mindepth 1 \\( -path ./.git -o -name node_modules \\) -prune -o -type d -empty -print | sed 's#^\\./##' | sort -r | xargs -r -d '\\n' rmdir -p --ignore-fail-on-non-empty";

/** The lead's whole-workspace build (NODE_RULE §2): dsh's own `tsc -b tsconfig.build.json` when the tree has it, else every package with a tsconfig; then the bundler. */
export function wholeBuild(files) {
  const pk = new Set([...files.keys()].filter((p) => p.endsWith("/package.json")).map((p) => p.slice(0, -13)));
  const packages = [...files.keys()].filter((p) => p.endsWith("/tsconfig.json")).map((p) => p.slice(0, -14)).filter((d) => pk.has(d)).sort();
  if (files.has("tsconfig.build.json")) return { command: bundled(files, "./node_modules/.bin/tsc -b tsconfig.build.json"), packages };
  return { command: bundled(files, `./node_modules/.bin/tsc -b ${packages.map(quote).join(" ")}`), packages };
}

/** vitest's JSON report: each failing file's first message (suite-level or its first failed test), roots as <root>; {} when it does not parse. */
export function vitestMessages(text, root) {
  try {
    const report = JSON.parse(String(text).slice(String(text).indexOf("{")));
    const rel = (n) => (n.startsWith(`${root}/`) ? n.slice(root.length + 1) : n);
    return Object.fromEntries(report.testResults.filter((t) => t.status !== "passed").map((t) => [rel(t.name), String(t.message || t.assertionResults?.find((x) => x.status === "failed")?.failureMessages?.[0] || "").replaceAll(root, "<root>").slice(0, 300)]));
  } catch { return {}; }
}
