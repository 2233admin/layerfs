// The /.lww glob rules (layerfs-content merge/lww.rs parse and match, ported), apart from lww.mjs and with no
// imports, so a native container can run them beside lanemerge.mjs (the F-057 merge-units diagnostic). A unit
// pattern of `branch.merge` uses the same syntax (merge/units.rs: a path is in a unit when a pattern matches it or
// one of its parent directories, `lwwMatch`).
function parse(line) {
  const negated = line.startsWith("!");
  let body = negated ? line.slice(1) : line;
  if (body.endsWith("/")) body = body.slice(0, -1);
  const anchored = body.includes("/");
  if (body.startsWith("/")) body = body.slice(1);
  const tokens = [];
  const cs = [...body];
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];
    if (c === "*" && cs[i + 1] === "*") {
      i++;
      const last = tokens.at(-1);
      if ((last === undefined || last === "/" || last?.t === "dirs") && cs[i + 1] === "/") { i++; tokens.push({ t: "dirs" }); } else tokens.push({ t: "any" });
    } else if (c === "*") tokens.push({ t: "name" });
    else if (c === "?") tokens.push({ t: "one" });
    else tokens.push(c);
  }
  return { pattern: line, negated, anchored, tokens };
}

function matchesFrom(rule, path, start, whole) {
  const n = path.length;
  let current = new Array(n + 1).fill(false);
  current[start] = true;
  for (const tok of rule.tokens) {
    const next = new Array(n + 1).fill(false);
    if (typeof tok === "string") { for (let p = 0; p < n; p++) next[p + 1] = current[p] && path[p] === tok; }
    else if (tok.t === "one") { for (let p = 0; p < n; p++) next[p + 1] = current[p] && path[p] !== "/"; }
    else if (tok.t === "name") {
      for (let p = 0; p <= n; p++) if (current[p]) { next[p] = true; let q = p; while (q < n && path[q] !== "/") { q++; next[q] = true; } }
    } else if (tok.t === "any") {
      const first = current.indexOf(true);
      if (first >= 0) for (let p = first; p <= n; p++) next[p] = true;
    } else {
      const first = current.indexOf(true);
      if (first >= 0) { for (let p = 0; p <= n; p++) next[p] = current[p]; for (let p = first; p < n; p++) if (path[p] === "/") next[p + 1] = true; }
    }
    current = next;
  }
  for (let p = 0; p <= n; p++) if (current[p] && (p === n || (!whole && path[p] === "/"))) return true;
  return false;
}

/** Parses rule-file text (comments and blank lines dropped; no %include). */
export const parseRules = (text) => String(text).split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("%include")).map(parse);

/** lww.rs `Rules::matching`: the deciding rule for a path, or null. */
export function lwwMatch(rules, path) {
  const cs = [...String(path).replace(/^\/+/, "")];
  let hit = null;
  for (const rule of rules) {
    const starts = [0, ...(rule.anchored ? [] : cs.flatMap((c, i) => (c === "/" ? [i + 1] : [])))];
    if (starts.some((s) => matchesFrom(rule, cs, s, false))) hit = rule.negated ? null : rule;
  }
  return hit;
}

