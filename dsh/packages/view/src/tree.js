// History as a tree, in the design of the LayerFS website's demo (Trace.jsx in
// layerfs-website). It stands upright (time runs up, Branches grow out to both
// sides) or lies on its side (time runs right). main is the green middle
// bough, a little thicker than the rest, with a band for each Layer in the
// colour of the Branch that published it. Each Branch is a bough in its own
// colour that sprouts from the node it was forked from and ends at its head,
// tagged with its name; every Commit is a leaf on it. A merge grafts back with
// a ring, a publish is a dashed stem into a band, and a Branch nobody is on is
// a bare twig past its head with an outlined tag.
// Time is the order of events (node slots), not the wall clock: one step per
// event, so a quiet minute takes no room. Every node keeps its data-node, so
// the hover card and Files work as they did on the lane graph.
import { esc } from "./util.js";

/** A Commit is a leaf: anchored on its bough at 0,0, pointing along +x. */
export const LEAF = "M0 0Q7 -7.5 15 0Q7 7.5 0 0Z";
const SPROUT = 40, BEAD = 16, MAIN_TH = 6.5, TAG_H = 14, CH_W = 6.2, AV = 16;

/**
 * A tree renderer. It remembers which side of main each Branch group grew on,
 * so a Branch keeps its side as the history grows.
 * @returns {(W: object, o: object) => {svg: string, overview: string}}
 */
export function createTree() {
  const sideOf = {};
  /**
   * @param {object} W the model's view
   * @param {object} o
   * @param {boolean} o.upright time runs up (else right)
   * @param {number} o.width the panel's width in px
   * @param {number} o.height the panel's height in px
   * @param {string} o.active the open tab: its lane is banded
   * @param {string|null} o.selected the node Files shows, ringed
   * @param {(b: string) => string[]} o.agentsOn agents on a Branch now
   * @param {(n: string) => string} o.head an agent's head as SVG at 0,0 (16 px)
   * @param {(b: string) => boolean} o.idle nobody is on the Branch
   */
  return function tree(W, o) {
    const B = W.branches, N = W.nodes;
    // ---------------------------------------------------------- rows
    const parentOf = (b) => (N[B[b].base] && N[B[b].base].branch) || "main";
    const kids = {};
    for (const b of W.order) (kids[parentOf(b)] ||= []).push(b);
    const build = (b, depth, out) => { out.push({ id: b, depth }); for (const k of kids[b] || []) build(k, depth + 1, out); return out; };
    const groups = (kids.main || []).map((b) => ({ id: b, rows: build(b, 0, []) }));
    // a new group goes to the lighter side (the first one to the right, upright) and keeps it
    const load = { up: 0, down: 0 };
    for (const g of groups) if (sideOf[g.id]) load[sideOf[g.id]] += g.rows.length;
    for (const g of groups) if (!sideOf[g.id]) { sideOf[g.id] = load.up < load.down ? "up" : "down"; load[sideOf[g.id]] += g.rows.length; }
    const rows = [...groups.filter((g) => sideOf[g.id] === "up").flatMap((g) => g.rows).reverse(), { id: "main", depth: -1 }, ...groups.filter((g) => sideOf[g.id] !== "up").flatMap((g) => g.rows)];
    const rowOf = {};
    rows.forEach((r, i) => (rowOf[r.id] = i));

    // ---------------------------------------------------------- time
    // one step per distinct slot; Commits on one bough are strung like beads,
    // at least BEAD apart and past the fork's curve
    const slots = [...new Set(Object.values(N).map((n) => n.t))].sort((a, b) => a - b), rank = new Map(slots.map((t, i) => [t, i]));
    const room = (o.upright ? o.height - 90 : o.width - 150);
    const px = Math.max(14, Math.min(64, room / Math.max(1, slots.length)));
    const T0 = 10, T = (n) => T0 + rank.get(n.t) * px;
    const pos = {}, forkT = {}, baseT = {}, headT = {};
    for (const n of Object.values(N)) if (n.kind === "layer") pos[n.id] = T(n);
    const mainHead = W.mainHead && pos[W.mainHead] !== undefined ? pos[W.mainHead] : T0;
    for (const b of W.order) {
      const base = N[B[b].base], fork = N["fork:" + b];
      baseT[b] = base && pos[base.id] !== undefined ? pos[base.id] : base ? T(base) : T(fork);
      forkT[b] = Math.max(T(fork), baseT[b] + SPROUT);
      pos[fork.id] = forkT[b];
      let prev = forkT[b] + 8 - BEAD;
      for (const c of Object.values(N).filter((n) => n.kind === "commit" && n.branch === b).sort((x, y) => x.t - y.t)) prev = pos[c.id] = Math.max(T(c), prev + BEAD);
      headT[b] = Math.max(forkT[b], pos[B[b].head] ?? forkT[b]);
    }
    const nowT = Math.max(mainHead, ...Object.values(pos)) + px * 0.6 + 8;

    // ---------------------------------------------------------- name tags
    // a tag stands past its lane's head; upright, tags that would cover one
    // another climb, each with a leader down to its head
    const COL = Math.max(34, Math.min(64, ((o.upright ? o.width : o.height) - 40) / Math.max(1, rows.length)));
    const R = (i) => i * COL + COL / 2;
    const tagW = (name) => name.length * CH_W + 8;
    const tags = rows.map((r, i) => {
      const isMain = r.id === "main", end = isMain ? mainHead : headT[r.id], idle = !isMain && o.idle(r.id);
      return { id: r.id, i, end, idle, t: end + (idle ? 18 : 10) + (isMain ? 6 : 0), w: tagW(r.id), avs: isMain ? [] : o.agentsOn(r.id) };
    });
    if (o.upright) {
      const placed = [];
      for (const g of [...tags].sort((a, b) => a.t - b.t)) {
        const hit = () => placed.find((p) => Math.abs(R(p.i) - R(g.i)) < (p.w + g.w) / 2 + 4 && Math.abs(p.t - g.t) < TAG_H + 2 + (p.avs.length ? AV : 0));
        for (let p; (p = hit()); ) g.t = p.t + TAG_H + 3 + (p.avs.length ? AV : 0);
        placed.push(g);
      }
    }
    // how far the plot reaches along time: upright, the highest tag; lying down, the longest one
    const topT = o.upright ? Math.max(nowT + 14, ...tags.map((g) => g.t + TAG_H + (g.avs.length ? AV + 2 : 0) + 4))
      : Math.max(nowT + 30, ...tags.map((g) => g.t + g.w + Math.min(3, g.avs.length) * AV + 12));

    // ---------------------------------------------------------- geometry
    // the plot is drawn in time × row; upright turns it a quarter turn
    const rowsW = rows.length * COL;
    const mainC = R(rowOf.main);
    const UW = Math.max(o.width, 2 * Math.max(mainC, rowsW - mainC) + 24);
    const off = o.upright ? Math.round(UW / 2 - mainC) : 0;
    const GROUND = 14, H = o.upright ? Math.max(o.height, topT + GROUND + 8) : Math.max(o.height - 2, rowsW + 8);
    const Wd = o.upright ? UW : Math.max(o.width, topT + 12);
    const baseY = H - GROUND;
    const P = (t, r) => (o.upright ? [r + off, baseY - t] : [t + 6, r + 4]);
    const pt = (t, r) => P(t, r).map((v) => +v.toFixed(1)).join(" ");
    const path = (pts) => "M" + pts.map(([t, r], k) => (k === 1 && pts.length === 4 ? "C" : "") + pt(t, r)).join(" ");
    const line = (t0, t1, r) => `M${pt(t0, r)} L${pt(t1, r)}`;
    // a fork leaves its parent slanting, then curves into its own row (the website's sprout)
    const sprout = (t0, r0, t1, r1) => { const s = t1 - t0; return path([[t0, r0], [t0 + s * 0.5, r0 + (r1 - r0) * 0.3], [t0 + s * 0.6, r1], [t1, r1]]); };
    // a merge or publish leaves a head and bends into the target row
    const rise = (t0, r0, t1, r1) => path([[t0, r0], [t0 + (t1 - t0) * 0.6, r0], [t1, r0 + (r1 - r0) * 0.7], [t1, r1]]);
    const color = (b) => (b && B[b] ? `var(${B[b].color})` : "var(--trunk)");
    const spin = (deg) => (o.upright ? deg - 90 : deg);
    const lineOf = (n) => (n.branch ? rowOf[n.branch] : rowOf.main);
    const at = (id) => { const n = N[id]; return n && pos[id] !== undefined ? P(pos[id], R(lineOf(n))) : null; };
    const pop = (id) => (W.newNodes && W.newNodes.has(id) ? " popin" : "");

    let g = "";
    // the open tab's lane, banded
    const ai = rowOf[o.active];
    if (ai !== undefined) {
      const [x0, y0] = P(topT, R(ai) - COL / 2), [x1, y1] = P(0, R(ai) + COL / 2);
      g += `<rect class="lane" x="${Math.min(x0, x1)}" y="${Math.min(y0, y1)}" width="${Math.abs(x1 - x0)}" height="${Math.abs(y1 - y0)}"/>`;
    }
    // a faint line across the plot at each Layer, and "now" above everything
    const across = (t, cls) => { const [x0, y0] = P(t, 0), [x1, y1] = P(t, rowsW); return o.upright ? `<line class="${cls}" x1="0" x2="${Wd}" y1="${y0}" y2="${y0}"/>` : `<line class="${cls}" x1="${x0}" x2="${x1}" y1="0" y2="${H}"/>`; };
    for (const n of Object.values(N)) if (n.kind === "layer") g += across(pos[n.id], "grid");
    g += across(nowT, "now");
    { const [x, y] = P(nowT, 0); g += o.upright ? `<text class="nowt" x="6" y="${y - 4}">now</text>` : `<text class="nowt" x="${x + 3}" y="11">now</text>`; }

    // forks, merges and publishes under every bough
    for (const b of W.order) {
      const r0 = R(rowOf[parentOf(b)]), r1 = R(rowOf[b]);
      g += `<path class="fork${o.idle(b) ? " bare" : ""}" style="stroke:${color(b)}" d="${sprout(baseT[b], r0, forkT[b], r1)}"/>`;
    }
    for (const n of Object.values(N)) {
      const src = n.parents[1] && N[n.parents[1]];
      if (!src || pos[src.id] === undefined) continue;
      const r0 = R(lineOf(src)), r1 = R(lineOf(n));
      g += n.kind === "layer"
        ? `<path class="publish" style="stroke:${color(src.branch)}" d="${rise(pos[src.id], r0, pos[n.id], r1)}"/>`
        : `<path class="graft" style="stroke:${color(src.branch)}" d="${rise(pos[src.id], r0, pos[n.id], r1)}"/>`;
    }
    // boughs end at their head; a Branch nobody is on goes on as a bare twig to its tag
    for (const b of W.order) {
      const r = R(rowOf[b]), d = rows[rowOf[b]].depth;
      g += `<path class="bough" style="stroke:${color(b)};stroke-width:${d ? 2.6 : 3.4}" d="${line(forkT[b], headT[b], r)}"/>`;
      if (o.idle(b)) g += `<path class="twig" d="${line(headT[b], tags[rowOf[b]].t - 2, r)}"/>`;
    }
    // main: the green middle bough, with a band per Layer
    g += `<path class="trunk" style="stroke-width:${MAIN_TH}" d="${line(0, mainHead + 12, mainC)}"/>`;
    for (const n of Object.values(N)) if (n.kind === "layer") {
      const [x, y] = P(pos[n.id], mainC), src = n.parents[1] && N[n.parents[1]], c = src ? color(src.branch) : "var(--green-dark)";
      const [w, h] = o.upright ? [MAIN_TH + 8, 5] : [5, MAIN_TH + 8], sel = o.selected === n.id ? " sel" : "";
      g += `<g class="node layer${pop(n.id)}${sel}" data-node="${esc(n.id)}"><rect class="hit" x="${x - 12}" y="${y - 9}" width="24" height="18"/><rect class="band" style="fill:${c}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="1.5"/></g>`;
      g += o.upright ? `<text class="lid" style="fill:${c}" x="${x - MAIN_TH - 8}" y="${y + 3.5}" text-anchor="end">${esc(n.id)}</text>`
        : `<text class="lid" style="fill:${c}" x="${x + 4}" y="${y - MAIN_TH - 5}">${esc(n.id)}</text>`;
    }
    // fork points: a small knot where the Branch begins
    for (const b of W.order) {
      const id = "fork:" + b, [x, y] = P(forkT[b], R(rowOf[b]));
      g += `<g class="node knot${pop(id)}${o.selected === id ? " sel" : ""}" data-node="${esc(id)}"><circle class="hit" cx="${x}" cy="${y}" r="7"/><circle cx="${x}" cy="${y}" r="3" style="stroke:${color(b)}"/></g>`;
    }
    // Commits are leaves, turning up and down along the bough in shades of its
    // colour; a merge is a ring in the Branch's colour with the source's at its heart
    const shades = ["", "color-mix(in srgb, %c 70%, white)", "color-mix(in srgb, %c 82%, black)"];
    const commits = Object.values(N).filter((n) => n.kind === "commit").sort((x, y) => pos[x.id] - pos[y.id]);
    const flip = {};
    for (const n of commits) {
      const [x, y] = P(pos[n.id], R(rowOf[n.branch])), c = color(n.branch), sel = o.selected === n.id ? " sel" : "";
      const k = (flip[n.branch] = (flip[n.branch] || 0) + 1);
      if (n.parents[1]) {
        g += `<g class="node merge${pop(n.id)}${sel}" data-node="${esc(n.id)}"><circle class="ring" cx="${x}" cy="${y}" r="6.5" style="stroke:${c}"/><circle cx="${x}" cy="${y}" r="2.8" style="fill:${color(N[n.parents[1]] && N[n.parents[1]].branch)}"/></g>`;
        continue;
      }
      const fill = (shades[Number(n.id.replace(/\D/g, "")) % 3] || "%c").replaceAll("%c", c);
      g += `<g class="node leaf${pop(n.id)}${sel}" data-node="${esc(n.id)}"><circle class="hit" cx="${x}" cy="${y}" r="9"/><g transform="translate(${x} ${y}) rotate(${spin(k % 2 ? -38 : 38)})"><path d="${LEAF}" style="fill:${fill}"/><path class="vein" d="M1.5 0H12"/></g></g>`;
    }
    // mounted Workspaces: a badge on the node they are based on (red when stale)
    const mounted = {};
    for (const w of Object.values(W.ws)) (mounted[w.baseNode] ||= []).push(w);
    for (const [id, ws] of Object.entries(mounted)) {
      const p = at(id), n = N[id];
      if (!p) continue;
      const stale = n.branch && B[n.branch] && id !== B[n.branch].head;
      g += `<g class="mbadge${stale ? " stale" : ""}"><circle cx="${p[0] + 9}" cy="${p[1] - 9}" r="6.5"/><text x="${p[0] + 9}" y="${p[1] - 6}" text-anchor="middle">${ws.length}</text></g>`;
    }
    // name tags, and the agents on each Branch standing on its tag
    for (const tg of tags) {
      const isMain = tg.id === "main", r = R(tg.i), c = isMain ? "var(--green-dark)" : color(tg.id), [hx, hy] = P(tg.end, r);
      let x, y;
      if (o.upright) { [x, y] = P(tg.t, r); x -= tg.w / 2; y -= TAG_H; } else { [x, y] = P(tg.t, r); y -= TAG_H / 2; }
      if (o.upright && tg.t - tg.end > (tg.idle ? 22 : 14)) g += `<path class="leader" d="M${hx} ${hy - 4} L${hx} ${y + TAG_H}"/>`;
      g += `<g class="tag${tg.idle ? " idle" : ""}${tg.id === o.active ? " on" : ""}" data-open="${esc(tg.id)}" style="--tc:${c}"><title>${isMain ? "main · read-only · open the main tab" : `Open ${esc(tg.id)} · forked from ${esc(B[tg.id].base)}`}</title>`
        + `<rect x="${x}" y="${y}" width="${tg.w}" height="${TAG_H}" rx="2"/><text x="${x + 4}" y="${y + 10.5}">${esc(tg.id)}</text></g>`;
      tg.avs.slice(0, 3).forEach((n, k) => {
        const ax = o.upright ? x + tg.w / 2 - (Math.min(3, tg.avs.length) * AV) / 2 + k * AV : x + tg.w + 4 + k * AV, ay = o.upright ? y - AV - 1 : y - 1;
        g += `<g class="tav" transform="translate(${ax} ${ay})">${o.head(n)}</g>`;
      });
    }
    if (o.upright) g += `<rect class="ground" x="0" y="${baseY}" width="${Wd}" height="${GROUND}"/><line class="groundline" x1="0" x2="${Wd}" y1="${baseY + 0.5}" y2="${baseY + 0.5}"/>`;
    const svg = `<svg class="graph tree${o.upright ? " upright" : " sideways"}" width="${Wd}" height="${H}" viewBox="0 0 ${Wd} ${H}" data-dir="${o.upright ? "up" : "side"}" data-span="${topT}" data-base="${baseY}">${g}</svg>`;

    // ---------------------------------------------------------- overview
    // the whole run in one strip: Commits counted over time, Layers as green
    // ticks; the view moves its box as the tree scrolls
    const OW = 300, nb = 60, bins = new Array(nb).fill(0);
    for (const n of commits) bins[Math.min(nb - 1, Math.floor((pos[n.id] / topT) * nb))]++;
    const peak = Math.max(3, ...bins), bw = OW / nb;
    let ov = bins.map((v, i) => (v ? `<rect class="bar" x="${(i * bw + 0.5).toFixed(1)}" y="${(30 - (v / peak) * 22).toFixed(1)}" width="${(bw - 1).toFixed(1)}" height="${((v / peak) * 22).toFixed(1)}"/>` : "")).join("");
    for (const n of Object.values(N)) if (n.kind === "layer") ov += `<rect class="tick" x="${((pos[n.id] / topT) * OW - 1).toFixed(1)}" y="2" width="2" height="6"/>`;
    ov += `<line class="nowl" x1="${((nowT / topT) * OW).toFixed(1)}" x2="${((nowT / topT) * OW).toFixed(1)}" y1="0" y2="34"/>`;
    const overview = `<svg class="ovs" viewBox="0 0 ${OW} 34" preserveAspectRatio="none">${ov}</svg>`;
    return { svg, overview };
  };
}
