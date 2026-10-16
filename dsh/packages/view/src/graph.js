// History in the tui.html shape, turned vertical: one column per lane (main
// first), one row per node, oldest at the top. Gray edges join a lane; a fork
// leaves its source sideways then runs down; publish and merge are dashed.
// Mounted Workspaces show as a badge on the node they are based on.
// The lanes are SVG; beside them each row is HTML (id, Branch, message,
// author, a head pill), so a long message ends in an ellipsis instead of
// being cut off, and the row the Files pane shows is highlighted.
import { esc } from "./util.js";

/**
 * @param {object} W the model's view
 * @param {(name: string) => string|undefined} colorOf an agent's colour
 * @param {Set<string>|null} filter lanes to draw besides main (null: all)
 * @param {string} activeLane the lane to band
 * @param {string|null} [selected] the node Files shows, highlighted
 * @returns {string} markup: the lanes' SVG and the rows beside it
 */
export function graph(W, colorOf, filter, activeLane, selected = null) {
  const lanes = ["main", ...W.order.filter((b) => !filter || filter.has(b))];
  const rank = { fork: 0, commit: 1, layer: 2 };
  const nodes = Object.values(W.nodes).filter((n) => !n.branch || lanes.includes(n.branch)).sort((x, y) => x.t - y.t || rank[x.kind] - rank[y.kind]);
  const LW = 22, RH = 28, X0 = 16, Y0 = 18, row = {};
  nodes.forEach((n, i) => (row[n.id] = i));
  const P = (id) => ({ x: X0 + (W.nodes[id].branch ? lanes.indexOf(W.nodes[id].branch) : 0) * LW, y: Y0 + row[id] * RH });
  const H = Y0 + nodes.length * RH, Wd = X0 + (lanes.length - 1) * LW + 16;
  const bc = (b) => (b ? `var(${W.branches[b].color})` : "var(--purple)");
  const curve = (a, b) => (Math.abs(a.x - b.x) < 1 ? `M${a.x},${a.y} L${b.x},${b.y}` : `M${a.x},${a.y} C${b.x},${a.y} ${b.x},${a.y} ${b.x},${b.y}`);
  const scurve = (a, b) => { const m = (a.y + b.y) / 2; return `M${a.x},${a.y} C${a.x},${m} ${b.x},${m} ${b.x},${b.y}`; };
  let g = "";
  // the active lane's band; lanes have no guides, only their edges
  lanes.forEach((l, i) => { if (l === activeLane) g += `<rect class="rowband" x="${X0 + i * LW - 11}" y="0" width="22" height="${H}" rx="5"/>`; });
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
  let rows = "";
  for (const n of nodes) {
    const p = P(n.id), pop = W.newNodes.has(n.id) ? " popin" : "", style = `style="--bc:${bc(n.branch)}"`;
    const ms = Object.values(W.ws).filter((w) => w.baseNode === n.id);
    const badge = ms.length ? `<g class="mbadge${n.id !== W.branches[n.branch].head ? " stale" : ""}"><circle cx="${p.x + 8}" cy="${p.y - 9}" r="6.5"/><text x="${p.x + 8}" y="${p.y - 6}" text-anchor="middle">${ms.length}</text></g>` : "";
    g += n.kind === "layer" ? `<g class="node layer${pop}" data-node="${n.id}"><rect class="shape" x="${p.x - 8}" y="${p.y - 8}" width="16" height="16" rx="4"/></g>`
      : n.kind === "fork" ? `<g class="node fork${pop}" ${style} data-node="${n.id}"><circle class="shape" cx="${p.x}" cy="${p.y}" r="4.5"/>${badge}</g>`
      : `<g class="node commit${pop}" ${style} data-node="${n.id}"><circle class="shape" cx="${p.x}" cy="${p.y}" r="7.5"/>${n.parents[1] ? `<circle class="inner" cx="${p.x}" cy="${p.y}" r="2.8"/>` : (n.by ? `<text class="ini" x="${p.x}" y="${p.y + 3}" text-anchor="middle">${esc(n.by[0].toUpperCase())}</text>` : "")}${badge}</g>`;
    // id · Branch · message · author · head
    const lane = n.branch || "main", fork = n.kind === "fork", from = fork && W.branches[n.branch] ? W.branches[n.branch].from : null;
    const msg = fork ? (from ? `from ${from}` : "") : n.msg || "", tip = [n.id, lane, msg, n.by].filter(Boolean).join(" · ");
    rows += `<div class="grow${n.id === selected ? " sel" : ""}${pop}" data-node="${esc(n.id)}" title="${esc(tip)}"><span class="gid${fork ? " dim" : ""}">${fork ? "fork" : esc(n.id)}</span>`
      + `<span class="gbr" style="color:${bc(n.branch)}">${esc(lane)}</span><span class="gmsg">${esc(msg)}</span>`
      + `${n.by ? `<span class="gby"${colorOf(n.by) ? ` style="color:${colorOf(n.by)}"` : ""}>${esc(n.by)}</span>` : ""}${heads.has(n.id) ? `<span class="ghead">head</span>` : ""}</div>`;
  }
  return `<div class="gview"><svg class="graph" width="${Wd}" height="${H}" viewBox="0 0 ${Wd} ${H}">${g}</svg><div class="glabels" style="padding-top:${Y0 - RH / 2}px">${rows}</div></div>`;
}
