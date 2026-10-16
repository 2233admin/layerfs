// History in the tui.html shape, turned vertical: one column per lane (main
// first), one row per node, oldest at the top. Gray edges join a lane; a fork
// leaves its source sideways then runs down; publish and merge are dashed.
// Mounted Workspaces show as a badge on the node they are based on.
import { esc } from "./util.js";

/**
 * @param {object} W the model's view
 * @param {(name: string) => string|undefined} colorOf an agent's colour
 * @param {Set<string>|null} filter lanes to draw besides main (null: all)
 * @param {string} activeLane the lane to band
 * @returns {string} SVG markup
 */
export function graph(W, colorOf, filter, activeLane) {
  const lanes = ["main", ...W.order.filter((b) => !filter || filter.has(b))];
  const rank = { fork: 0, commit: 1, layer: 2 };
  const nodes = Object.values(W.nodes).filter((n) => !n.branch || lanes.includes(n.branch)).sort((x, y) => x.t - y.t || rank[x.kind] - rank[y.kind]);
  const LW = 22, RH = 28, X0 = 16, Y0 = 18, row = {};
  nodes.forEach((n, i) => (row[n.id] = i));
  const P = (id) => ({ x: X0 + (W.nodes[id].branch ? lanes.indexOf(W.nodes[id].branch) : 0) * LW, y: Y0 + row[id] * RH });
  const TX = X0 + (lanes.length - 1) * LW + 20, H = Y0 + nodes.length * RH, Wd = TX + 250;
  const bc = (b) => (b ? `var(${W.branches[b].color})` : "var(--purple)");
  const curve = (a, b) => (Math.abs(a.x - b.x) < 1 ? `M${a.x},${a.y} L${b.x},${b.y}` : `M${a.x},${a.y} C${b.x},${a.y} ${b.x},${a.y} ${b.x},${b.y}`);
  const scurve = (a, b) => { const m = (a.y + b.y) / 2; return `M${a.x},${a.y} C${a.x},${m} ${b.x},${m} ${b.x},${b.y}`; };
  let g = "";
  // lane guides from each lane's first row, and the active lane's band
  lanes.forEach((l, i) => {
    const first = nodes.find((n) => (l === "main" ? !n.branch : n.branch === l)), x = X0 + i * LW;
    if (l === activeLane) g += `<rect class="rowband" x="${x - 11}" y="0" width="22" height="${H}" rx="5"/>`;
    if (first) g += `<line class="row-line" x1="${x}" y1="${P(first.id).y}" x2="${x}" y2="${H}"/>`;
  });
  for (const n of nodes) {
    const [p0, p1] = n.parents, has = (id) => id && row[id] !== undefined;
    if (n.kind === "layer") {
      if (has(p0)) g += `<path class="edge main" d="${curve(P(p0), P(n.id))}"/>`;
      if (has(p1)) g += `<path class="edge publish" d="${scurve(P(p1), P(n.id))}"/>`;
    } else if (has(p0)) g += `<path class="edge" d="${curve(P(p0), P(n.id))}"/>`;
    if (n.kind === "commit" && has(p1)) {
      const a = P(p1), b = P(n.id), ey = b.y - 9, ex = b.x;
      g += `<g style="--bc:${bc(W.nodes[p1].branch)}"><path class="edge merge" d="M${a.x},${a.y} C${a.x},${(a.y + ey) / 2} ${ex},${(a.y + ey) / 2} ${ex},${ey}"/><path class="mergehead" d="M${ex - 4.5},${ey - 5} L${ex},${ey} L${ex + 4.5},${ey - 5}"/></g>`;
    }
  }
  const heads = new Set([W.mainHead, ...W.order.map((b) => W.branches[b].head)]);
  for (const n of nodes) {
    const p = P(n.id), pop = W.newNodes.has(n.id) ? " popin" : "", style = `style="--bc:${bc(n.branch)}"`;
    const ms = Object.values(W.ws).filter((w) => w.baseNode === n.id);
    const badge = ms.length ? `<g class="mbadge${n.id !== W.branches[n.branch].head ? " stale" : ""}"><circle cx="${p.x + 8}" cy="${p.y - 9}" r="6.5"/><text x="${p.x + 8}" y="${p.y - 6}" text-anchor="middle">${ms.length}</text></g>` : "";
    g += n.kind === "layer" ? `<g class="node layer${pop}" data-node="${n.id}"><rect class="shape" x="${p.x - 8}" y="${p.y - 8}" width="16" height="16" rx="4"/></g>`
      : n.kind === "fork" ? `<g class="node fork${pop}" ${style} data-node="${n.id}"><circle class="shape" cx="${p.x}" cy="${p.y}" r="4.5"/>${badge}</g>`
      : `<g class="node commit${pop}" ${style} data-node="${n.id}"><circle class="shape" cx="${p.x}" cy="${p.y}" r="7.5"/>${n.parents[1] ? `<circle class="inner" cx="${p.x}" cy="${p.y}" r="2.8"/>` : `<text class="ini" x="${p.x}" y="${p.y + 3}" text-anchor="middle">${esc((n.by || "?")[0].toUpperCase())}</text>`}${badge}</g>`;
    const lane = n.branch || "main", id = n.kind === "fork" ? "fork" : n.id;
    // id · lane (implied for Layers) · agent: message
    const color = colorOf(n.by);
    const who = color ? `<tspan style="fill:${color}" font-weight="600">${esc(n.by)}</tspan><tspan class="dim">: ${esc(n.msg || "")}</tspan>` : "";
    g += `<text class="rt" x="${TX}" y="${p.y + 4}"><tspan font-weight="600">${esc(id)}</tspan>  ${n.branch ? `<tspan style="fill:${bc(n.branch)}">${esc(lane)}</tspan>  ` : ""}${who}${heads.has(n.id) ? `<tspan class="hd"> ◂ head</tspan>` : ""}</text>`;
  }
  return `<svg class="graph" width="${Wd}" height="${H}" viewBox="0 0 ${Wd} ${H}">${g}</svg>`;
}
