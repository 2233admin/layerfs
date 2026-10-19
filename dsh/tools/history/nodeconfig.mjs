// NODE_RULE run switches and the emitted-files listing, apart from nodelanes.mjs
// so closure.mjs can use them without an import cycle.
const quote = (t) => `'${String(t).replaceAll("'", "'\\''")}'`;

/** Lister groups that are build output (tool caches, NODE_RULE §1), never install output (P1 leaves them out). */
export const BUILD_GROUPS = /(^|\/)node_modules\/\.(vite|vite-temp|vitest|cache)(\/|$)/;
/** The run's Node switches (manifest `node`): NODE_RULE on, the §3 install-input rule, the store policy, the vitest cap. */
export const nodeOf = (manifest) => ({ on: !!manifest?.node?.on, inputsRule: manifest?.node?.inputsRule ?? "plan", storePolicy: manifest?.node?.storePolicy ?? "verified", vitestCapMs: manifest?.node?.vitestCapMs ?? 20_000 });
/** Emitted JavaScript and declarations under the packages' lib/ and dist/, as `blob path` lines (P4). */
export const EMITTED = `const fs=require("fs"),c=require("crypto"),re=/\\.(js|mjs|cjs|d\\.ts|d\\.mts|d\\.cts)$/;const walk=(d)=>{let es;try{es=fs.readdirSync(d,{withFileTypes:true})}catch{return}for(const e of es){const p=d+"/"+e.name;if(e.isDirectory()){if(e.name!=="node_modules")walk(p)}else if(e.isFile()&&re.test(e.name)){const b=fs.readFileSync(p);process.stdout.write(c.createHash("sha1").update("blob "+b.length+"\\0").update(b).digest("hex")+" "+p+"\\n")}}};for(const k of process.argv.slice(1))for(const o of ["lib","dist"])walk(k==="."?o:k+"/"+o)`;
export const emittedCommand = (packages) => `node -e ${quote(EMITTED)} ${packages.map(quote).join(" ")}`;
export const parseEmitted = (stdout) => Object.fromEntries(String(stdout).split("\n").filter(Boolean).map((l) => { const at = l.indexOf(" "); return [l.slice(at + 1), l.slice(0, at)]; }));


/**
 * dsh's build is `tsc -b tsconfig.build.json && tsdown` (its package.json
 * `build`): tsc emits only lib/types, tsdown bundles lib/index.js, which the
 * packages' exports (and so vitest) resolve. A tree with tsdown.config.ts gets
 * tsdown after every tsc -b, or its tests run against missing or stale bundles.
 */
const bundled = (files, command) => (files.has("tsdown.config.ts") ? `${command} && ./node_modules/.bin/tsdown` : command);
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
