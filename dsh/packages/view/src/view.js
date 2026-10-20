// The LayerFS view, framework-free: it draws a model view (W, built by
// @dsh-layerfs/model) into one root element. The design preview and the dsh
// client plugin both use it, so they draw the same thing from the same W.
//   hist     History (the project's tree, tree.js) or Files of the open tab, on the left
//   tabs     main, then one chip per active Branch, over the right panel
//   work     the main view (Branches, Sandboxes, Store, PROJECT terminal) or a
//            Branch view (FS terminal, Workspace panes)
//   status   running processes
//   overlay  avatars, bubbles and flying blocks, placed relative to the root
// With `project`, it draws one project instead: History (or its Branches)
// and Files side by side with a divider to drag (Files follows the History
// node or Branch clicked), without tabs, terminals or avatars.
// The host owns the clock: it sets W, then calls render(), and animate() for
// the call that just happened.
import * as X from "../../model/src/index.js";
import { createFiles } from "./files.js";
import { createTree, LEAF } from "./tree.js";
import { createTreeZoom } from "./treezoom.js";
import { cmdTime, esc, fmtBytes, timingText } from "./util.js";

const { CAP, RECENT_S, bubbleOf } = X;
const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content.firstElementChild; };

/**
 * @param {HTMLElement} root the view's root; it gets class `lfs`
 * @param {object} o
 * @param {object} o.avatars the cast: heroAvatars(urlOf) from heroes.js
 * @param {object} o.files the files helpers (simulation_engine/files.js)
 * @param {Function} o.lineDiff line diff (simulation_engine/model.js)
 * @param {boolean} [o.live] the engine reports file history itself (engine.fileReport)
 * @param {string} [o.lead] the lead agent (ellen_joe)
 * @param {object} [o.layout] existing { tabs, work, status, follow } elements
 *   (the preview's); missing ones are created as the standalone layout. Without
 *   a `hist` element, History is drawn as the work area's first column
 * @param {(follow: boolean) => void} [o.onFollow] the follow toggle changed
 * @param {boolean} [o.project] draw a project's History and Files only
 */
export function createView(root, o) {
  const AV = o.avatars, FM = o.files, LEAD = o.lead || "main";
  root.classList.add("lfs");
  const PROJECT = !!o.project;
  let layout = o.layout;
  if (PROJECT) {
    root.classList.add("lfs-project");
    root.innerHTML = `<main class="work projectview"></main>`;
    layout = { work: root.querySelector(".work") };
  } else if (!layout) {
    root.classList.add("lfs-app");
    root.innerHTML = `<div class="lfs-cols"><section class="panel hist" aria-label="History"></section><div class="split cols" data-split="cols" role="separator" aria-orientation="vertical" aria-label="Resize History and the work window" title="Drag to resize · double-click: default size"></div><div class="panel right"><div class="lfs-strip"><span class="grip" title="Drag to move the work window" aria-hidden="true"></span><div class="tabs" role="tablist" aria-label="LayerFS tabs"></div><div class="ctl" role="group" aria-label="Follow"><button class="on" data-follow="1" aria-pressed="true" title="Follow the acting agent across tabs">Follow</button></div></div><main class="work"></main></div></div><div class="statusbar" aria-label="Sandboxes and processes"></div>`;
    layout = { hist: root.querySelector(".hist"), cols: root.querySelector(".lfs-cols"), tabs: root.querySelector(".tabs"), work: root.querySelector(".work"), status: root.querySelector(".statusbar"), follow: root.querySelector("[data-follow]") };
  }
  const overlay = html(`<div class="lfs-fx" aria-hidden="true"></div>`), card = html(`<div class="hcard" role="tooltip"></div>`);
  root.append(overlay, card);

  // ---------------------------------------------------------------- cast
  // The website's heroes (heroes.js). The lead is the cloud. Every other agent
  // gets a hero picked from a hash of its name, so it is the same on every
  // rewind, reload and backend; no hero repeats until all are in use (then a
  // number tells them apart). An agent's colour (tags, History, cards) is its hero's.
  const AGENTS = {}, VARIANTS = Object.keys(AV.heroes).filter((c) => c !== AV.main), AV_TAKEN = new Map();
  const nameHash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  function avatar(n) {
    const a = (AGENTS[n] ||= {});
    if (a.av) return a;
    if (n === LEAD) a.av = AV.main;
    else {
      const k = nameHash(n) % VARIANTS.length;
      a.av = VARIANTS.map((_, i) => VARIANTS[(k + i) % VARIANTS.length]).find((x) => !AV_TAKEN.has(x)) || VARIANTS[k];
    }
    a.dup = (AV_TAKEN.get(a.av) || 0) + 1; AV_TAKEN.set(a.av, a.dup);
    a.color = AV.heroes[a.av].color;
    return a;
  }
  const colorOf = (n) => (n && AGENTS[n] ? avatar(n).color : undefined);
  // an agent's hero, small, where its name is shown; it bobs while the agent works
  function mascot(n) {
    const a = avatar(n), src = AV.heroes[a.av].src, dup = a.dup > 1 ? `<i class="dup">${a.dup}</i>` : "";
    return `<span class="av${v.acting.has(n) ? " bob" : ""}" style="--ac:${a.color};background-image:url(${src})" title="${esc(n)}" aria-hidden="true">${dup}</span>`;
  }
  const tag = (n) => `<span class="agent-tag" style="--ac:${avatar(n).color}">${mascot(n)}${esc(n)}</span>`;
  const capAvatars = (names, k = 3) => names.slice(0, k).map((n) => mascot(n)).join("") + (names.length > k ? `<span class="plus">+${names.length - k}</span>` : "");

  // ---------------------------------------------------------------- state
  const v = {
    W: null, FM, lineDiff: o.lineDiff, live: !!o.live, project: PROJECT, rightMode: {}, active: "main", follow: true, left: "history", orient: "upright", note: "", panes: "both",
    acting: new Set(), lastLoc: null, colorOf, render: () => render(),
  };
  const files = createFiles(v);
  // Which windows show (History, the work window or both) and History's
  // dragged width: per-viewer conveniences, kept in this browser when it allows.
  const PREF = "lfs-layout";
  const prefs = (() => { try { return JSON.parse(localStorage.getItem(PREF)) || {}; } catch { return {}; } })();
  const savePrefs = () => { try { localStorage.setItem(PREF, JSON.stringify(prefs)); } catch { /* not kept */ } };
  if (["both", "history", "work"].includes(prefs.panes)) v.panes = prefs.panes;
  // Where History docks against the work window (prefs.dock, chosen by
  // dragging a window onto a side of the other): left or right puts them side
  // by side, top or bottom stacks them. Side by side holds only while both fit:
  // History's minimum (its dragged width, else HIST_MIN), WORK_MIN for the work
  // window, the divider and the padding; otherwise they stack, History on top.
  // Returns whether the arrangement changed.
  const HIST_MIN = 360, WORK_MIN = 560, CHROME = 14 + 2 * 14;
  const sideways = (d) => d === "left" || d === "right";
  // the four arrangements, as an icon: History is the filled part
  const DOCKS = { left: "History left", right: "History right", top: "History on top", bottom: "History below" };
  const dockIcon = (d) => {
    const [x, y, w, h] = { left: [2, 2, 6, 8], right: [10, 2, 6, 8], top: [2, 2, 14, 3.5], bottom: [2, 6.5, 14, 3.5] }[d];
    return `<svg class="dkic" viewBox="0 0 18 12" aria-hidden="true"><rect x=".5" y=".5" width="17" height="11" rx="2"/><rect class="f" x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/></svg>`;
  };
  let colsFit = true;
  function fitCols() {
    const cols = layout.cols;
    if (!cols) return false;
    const want = ["left", "right", "top", "bottom"].includes(prefs.dock) ? prefs.dock : "left", min = prefs.histw || HIST_MIN;
    const fits = cols.clientWidth >= min + WORK_MIN + CHROME, fitChanged = fits !== colsFit;
    colsFit = fits;
    const dock = v.panes !== "both" ? "" : sideways(want) && !fits ? "top" : want;
    cols.style.setProperty("--histmin", min + "px");
    for (const [k, val] of [["--histw", prefs.histw], ["--histh", prefs.histh]]) if (val) cols.style.setProperty(k, val + "px"); else cols.style.removeProperty(k);
    const split = cols.querySelector(".split.cols");
    if (split) split.setAttribute("aria-orientation", sideways(dock) ? "vertical" : "horizontal");
    if (dock === (cols.dataset.dock || "")) return fitChanged; // the layout buttons show what fits
    if (dock) cols.dataset.dock = dock; else delete cols.dataset.dock;
    if (dock && !sideways(dock)) cols.dataset.stack = "1"; else delete cols.dataset.stack;
    return true;
  }
  const pinned = {}, seenTabs = new Set(["main"]), OPEN_SDK = new Set();
  let sbLit = null, sbPulse = null, focusPane = null, cardTimer = null;
  // Workspaces unmounted since an earlier render stay LEAVE_MS as a fading
  // trail, by the wall clock: the model drops them at once, and a Workspace a
  // script mounts and unmounts within a second still reads as one that was
  // there. One that mounted and left between two draws (a fast script, Max
  // speed) is found by its pane's `left` step, newer than the last draw's.
  const LEAVE_MS = 3600, leaving = new Map();
  let shownWs = {}, leaveTimer = null, leftSeen = null;
  // a step's entrance animations (a new line, a new pane, a Branch row's
  // flash) play on its first draw only: later redraws (a poll, a tree that
  // loaded, the trail ending) would restart them, a flicker
  let drawnSeq = null, fresh = -1;
  function trackLeaving(W) {
    const now = Date.now();
    for (const [k, w] of Object.entries(shownWs)) if (!W.ws[k] && !leaving.has(k)) leaving.set(k, { w, at: now });
    if (leftSeen !== null && leftSeen <= W.seq) for (const [k, p] of Object.entries(W.panes)) {
      if (p.left > leftSeen && !W.ws[k] && !leaving.has(k) && p.branch) leaving.set(k, { w: { id: k, agent: p.agent, branch: p.branch, lines: p.lines, born: p.born }, at: now });
    }
    leftSeen = W.seq;
    for (const [k, l] of leaving) if (W.ws[k] || now - l.at >= LEAVE_MS) leaving.delete(k);
    shownWs = W.ws;
    clearTimeout(leaveTimer);
    if (leaving.size) leaveTimer = setTimeout(render, Math.max(16, Math.min(...[...leaving.values()].map((l) => l.at + LEAVE_MS - now))));
  }
  const where = (n) => X.where(v.W, n), idle = (n) => X.idle(v.W, n);
  const lastHit = (loc) => (v.lastLoc === loc ? " hot" : "");
  const q = (sel) => root.querySelector(sel);

  // ---------------------------------------------------------------- tabs
  // The website's Branch tabs: a square in the Branch's colour, its name and a
  // chip (main: read-only; a Branch: its mounted Workspaces, a conflict or idle).
  function renderTabs() {
    const W = v.W, { tabs, hidden, retired } = X.visibleTabs(W, { pinned, active: v.active });
    const chip = (b) => {
      const B = W.branches[b], isNew = !seenTabs.has(b); seenTabs.add(b);
      const bad = X.conflicted(W, b), nWs = Object.values(W.ws).filter((w) => w.branch === b).length, dim = branchIdle(b);
      const meta = bad ? `<span class="tchip bad">conflict</span>` : nWs ? `<span class="tchip">${nWs} ws</span>` : dim ? `<span class="tchip">idle</span>` : "";
      return `<button class="tab${bad ? " conflict" : ""}${dim ? " dim" : ""}${isNew ? " enter" : ""}" role="tab" data-tab="${esc(b)}" aria-selected="${b === v.active}" style="--bc:var(${B.color})">
        <span class="sq"></span>${esc(b)}${meta}<span class="pin${pinned[b] ? " on" : ""}" data-pin="${esc(b)}" title="Pin tab">${pinned[b] ? "📌" : "⌖"}</span></button>`;
    };
    layout.tabs.innerHTML = `<button class="tab main" role="tab" data-tab="main" aria-selected="${v.active === "main"}"><span class="sq"></span>main<span class="tchip ro">read-only</span></button>`
      + tabs.map(chip).join("") + (hidden.length || retired.length ? `<button class="tab more${hidden.length ? "" : " retired"}" data-more="1" title="${hidden.length} idle Branch${hidden.length === 1 ? "" : "es"} · ${retired.length} retired (nobody on them for over ${X.RETIRE_S} s)">${hidden.length ? `+${hidden.length}` : `${retired.length} retired`}</button>` : "");
  }

  // ---------------------------------------------------------------- terminals
  function lineHtml(l, isNew, prefix) {
    const c = l.calls || [], key = String(l.t) + (l.text || "");
    const sdk = c.length ? `<button class="sdkbtn" data-sdk="${esc(key)}" title="Show the SDK call and inline Node script">sdk${c.length > 1 ? " ×" + c.length : ""}</button><div class="sdk">${c.map((x) => `<span class="code"><b>${esc(x.call)}</b> → ${esc(x.code)}<span class="tm">${esc(timingText(x.timing))}</span></span>${x.script ? `<pre>${esc(x.script)}</pre>` : ""}`).join("")}</div>` : "";
    const grp = l.group ? `<span class="grp" title="event group: these calls come from one script of ${esc(l.agent || "this agent")}">⧉ ${esc(l.group)}</span>` : "";
    const who = l.agent && !l.dim ? mascot(l.agent) : "";
    // one row: the command shortens with "…" (the whole of it is its hint) and its time stays in view;
    // a new command types itself out (--n characters over --d), then its output and time appear
    const n = l.text ? [...l.text].length : 0, type = isNew && n && !l.dim ? ` style="--n:${n};--d:${Math.min(700, Math.max(140, n * 14))}ms"` : "";
    const sdkBtn = sdk.slice(0, sdk.indexOf("<div")), sdkBox = sdk.slice(sdk.indexOf("<div"));
    return `<div class="ln${l.dim ? " dim" : ""}${isNew ? " new" : ""}${type ? " typing" : ""}${OPEN_SDK.has(key) ? " open" : ""}"${type}><div class="lrow">${prefix}${grp}${l.text ? `<span class="cmd" title="${esc(l.text)}">${esc(l.text)}</span>` : ""}${who}${cmdTime(c)}${sdkBtn}</div>${c.length ? sdkBox : ""}</div>`
      + (l.out || []).map((x) => `<span class="out${x.c ? " " + x.c : ""}${isNew ? " ln new" : ""}"${type} title="${esc(x.t)}">${esc(x.t)}</span>`).join("");
  }

  // ---------------------------------------------------------------- History
  // The left panel, on every tab: the project's tree (tree.js), or Files of
  // the open tab's head. It stays where the viewer scrolled it; until they do,
  // it shows "now" (upright: the top, centred on main; lying down: the right end).
  const tree = createTree();
  let treeAuto = true, treeSet = null, sizeTries = 0;
  // zooming or panning takes the tree off "now", like scrolling it
  const tz = createTreeZoom({ root, onZoom: () => { treeAuto = false; placeOverview(); } });
  /** A Branch nobody is on, whose tab has faded: a bare twig in the tree. */
  function branchIdle(b) {
    const W = v.W;
    return !X.agentsOn(W, b).length && !X.mounted(W, b) && !X.conflicted(W, b) && W.clock - W.branches[b].last > X.FADE_S;
  }
  // an agent's head from the heads sheet, 16 px, for the tree's name tags
  function headSvg(n) {
    return `<image href="${AV.heroes[avatar(n).av].src}" width="16" height="16" preserveAspectRatio="xMidYMax meet"/><title>${esc(n)}</title>`;
  }
  const treeOf = (tab, size, upright) => tree(v.W, { upright, width: size.w, height: size.h, active: tab, selected: pinnedAt(tab), agentsOn: (b) => (PROJECT ? [] : X.agentsOn(v.W, b)), head: headSvg, idle: (b) => !PROJECT && branchIdle(b) });
  function treeSize(host) {
    const el = root.querySelector("[data-tree]");
    if (el) return { w: el.clientWidth - 2, h: el.clientHeight - 2 };
    return { w: Math.max(240, (host ? host.clientWidth : 440) - 2), h: Math.max(240, (host ? host.clientHeight : 640) - 170) };
  }
  const LEGEND = `<div class="tlegend">
    <span><svg width="22" height="12" viewBox="0 0 22 12"><rect y="3" width="22" height="6" rx="3" style="fill:var(--trunk)"/><rect x="9" y="0.5" width="4" height="11" rx="1.5" style="fill:var(--b0);stroke:#fff"/></svg>Layer · a band on main</span>
    <span><svg width="26" height="12" viewBox="0 0 26 12"><path d="${LEAF}" transform="translate(1 6) rotate(-20)" style="fill:var(--b0)"/><path d="${LEAF}" transform="translate(12 6) rotate(20)" style="fill:var(--b1)"/></svg>Commit · a leaf</span>
    <span><svg width="20" height="12" viewBox="0 0 20 12"><path d="M2 1C2 9 5 10 19 10" fill="none" style="stroke:var(--b2)" stroke-width="2.6" stroke-linecap="round"/></svg>Branch · a bough</span>
    <span><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.2" fill="#fff" style="stroke:var(--b3)" stroke-width="2.2"/><circle cx="7" cy="7" r="2.2" style="fill:var(--b0)"/></svg>merge · grafts back</span>
    <span><i class="dash"></i>publish · adds a band</span>
    <span><svg width="20" height="12" viewBox="0 0 20 12"><path d="M1 6H16" style="stroke:var(--twig)" stroke-width="2.4" stroke-linecap="round"/></svg>idle · bare twig</span>
    <span class="hint">click a node: Files there · a name tag: its tab</span></div>`;
  function histHtml(size) {
    const W = v.W, tab = v.active, mode = v.rightMode[tab] || "history", B = W.branches[tab];
    const headId = tab === "main" ? W.mainHead : B.head.startsWith("fork:") ? B.base : B.head;
    const nC = Object.values(W.nodes).filter((n) => n.kind === "commit").length;
    const seg = `<span class="seg">${[["history", "History"], ["files", "Files"]].map(([m, l]) => `<button class="${mode === m ? "on" : ""}" data-right="${esc(tab)}:${m}">${l}</button>`).join("")}</span>`;
    const orient = mode !== "history" ? "" : `<span class="seg" role="group" aria-label="History view">${[["upright", "Upright", "M6 11V1M6 6L2.5 3M6 8L9.5 5"], ["sideways", "Sideways", "M1 6H11M6 6L3 2.5M8 6L5 9.5"]]
      .map(([k, l, d]) => `<button class="${v.orient === k ? "on" : ""}" data-orient="${k}" aria-pressed="${v.orient === k}" title="${l}" aria-label="${l}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="${d}"/></svg></button>`).join("")}</span>`;
    const grip = layout.cols ? `<span class="grip" title="Drag to move History" aria-hidden="true"></span>` : "";
    const head = `<div class="phead">${grip}${seg}<span class="ref" style="color:${tab === "main" ? "var(--green-dark)" : `var(${B.color})`}">${esc(tab)} @ ${esc(headId || "–")}</span><span class="m">${nC} commit${nC === 1 ? "" : "s"}</span><span class="sp"></span>${orient}</div>`;
    if (!W.mainHead) return head + `<div class="empty">No project yet</div>`;
    if (mode === "files") return head + files.filesHtml(tab);
    const t = treeOf(tab, size, v.orient === "upright");
    return head + `<div class="treebox">${tz.controlsHtml()}<div class="treewrap" data-tree tabindex="0" aria-label="History tree: drag to pan, ⌘ + scroll to zoom">${t.svg}</div></div>`
      + `<div class="ov"><div class="ovl"><span>Overview</span><button data-now="1" title="Back to now">now</button></div><div class="ovstrip" data-ov title="Click to move there">${t.overview}<i class="ovbox"></i></div></div>${LEGEND}`;
  }
  // Puts the tree at "now" until the viewer scrolls it, then keeps their place.
  function placeTree(keep) {
    const el = q("[data-tree]");
    if (!el) return;
    if (treeAuto || !keep) {
      if (v.orient === "upright") { el.scrollTop = 0; el.scrollLeft = Math.max(0, Math.round((el.scrollWidth - el.clientWidth) / 2)); }
      else el.scrollLeft = el.scrollWidth;
    } else { el.scrollLeft = keep.left; el.scrollTop = keep.top; }
    treeSet = { left: el.scrollLeft, top: el.scrollTop };
    placeOverview();
  }
  // the overview's box: the part of the run the tree shows
  function placeOverview() {
    const el = q("[data-tree]"), box = q(".ovbox"), svg = el && el.querySelector("svg");
    if (!box || !svg) return;
    const z = tz.zoom, span = +svg.dataset.span * z, base = +svg.dataset.base * z;
    const [a, b] = svg.dataset.dir === "up" ? [base - el.scrollTop - el.clientHeight, base - el.scrollTop] : [el.scrollLeft - 6 * z, el.scrollLeft + el.clientWidth - 6 * z];
    const lo = Math.max(0, a / span), hi = Math.min(1, b / span);
    box.style.left = (lo * 100).toFixed(2) + "%"; box.style.width = Math.max(2, (hi - lo) * 100).toFixed(2) + "%";
  }
  function overviewTo(e, strip) {
    const el = q("[data-tree]"), svg = el && el.querySelector("svg");
    if (!svg) return;
    const z = tz.zoom, r = strip.getBoundingClientRect(), t = ((e.clientX - r.left) / r.width) * +svg.dataset.span * z;
    if (svg.dataset.dir === "up") el.scrollTop = +svg.dataset.base * z - t - el.clientHeight / 2;
    else el.scrollLeft = t + 6 * z - el.clientWidth / 2;
    treeAuto = false;
  }
  function rosterMenu(anchor) {
    const W = v.W, label = (n) => { const l = where(n), A = W.agents[n];
      return l.kind === "ws" ? `${l.branch} · ${l.ws}` : l.kind === "fs" ? `${l.branch} · fs` : l.kind === "hist" ? "project terminal"
        : A.lastBranch ? `idle · last on ${A.lastBranch}` : "idle"; };
    const all = Object.keys(W.agents).sort((x, y) => idle(x) - idle(y));
    openMenu(anchor, "roster-menu", all.map((n) => { const l = where(n);
      return `<button ${l.branch ? `data-open="${esc(l.branch)}"` : ""}>${mascot(n)}<b style="color:${avatar(n).color}">${esc(n)}</b><span style="margin-left:auto;font:11px var(--mono);color:var(--text-3)">${esc(label(n))}</span></button>`; }).join(""), 300);
  }
  function openMenu(anchor, cls, inner, width) {
    closeMenu();
    const r = anchor.getBoundingClientRect(), base = root.getBoundingClientRect(), m = document.createElement("div");
    m.className = "menu " + cls; m.innerHTML = inner;
    m.style.top = r.bottom - base.top + 4 + "px";
    m.style.left = Math.max(8, (width ? r.right - width : r.left) - base.left) + "px";
    root.appendChild(m);
  }
  // the tabs' "+N" (and the board's "retired"): hidden Branches, then retired ones
  function moreMenu(anchor) {
    const { hidden, retired } = X.visibleTabs(v.W, { pinned, active: v.active });
    openMenu(anchor, "", branchItems(hidden) + (retired.length ? `<div class="mhead">retired · nobody on them for over ${X.RETIRE_S} s</div>${branchItems(retired)}` : ""));
  }
  const branchItems = (list) => list.map((b) => { const age = v.W.clock - v.W.branches[b].last;
    return `<button data-open="${esc(b)}"><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(${v.W.branches[b].color})"></span>${esc(b)}<span class="mt">${age}s</span></button>`; }).join("");
  const closeMenu = () => { const m = root.querySelector(".menu"); if (m) m.remove(); };

  // The website's terminal window parts: a faint LayerFS stamp behind the
  // output, the fs icon, a tag, and a terminal (head, stamp, lines).
  const STAMP = (lines) => `<svg class="wm" viewBox="0 0 320 ${224 + lines.length * 30}" aria-hidden="true"><g transform="translate(60 -10)" opacity="0.1"><path d="M88.5 22 L111.5 22 L170 135 L148.5 135 L100 49.5 L51.5 135 L30 135 Z" fill="#93B1E0" stroke="#93B1E0" stroke-width="2" stroke-linejoin="round"/><path d="M27 161 L57 161 L100 117 L143 161 L173 161" fill="none" stroke="#2F5BB5" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="100" cy="117" r="15.5" fill="#2F5BB5"/><circle cx="27" cy="161" r="15.5" fill="#2F5BB5"/><circle cx="173" cy="161" r="15.5" fill="#2F5BB5"/></g><text x="160" y="214" text-anchor="middle" font-size="36" font-weight="600" fill="#2F5BB5" opacity="0.16">LayerFS</text>`
    + lines.map((l, k) => `<text x="160" y="${248 + k * 30}" text-anchor="middle" font-size="24" font-weight="500" fill="#2F5BB5" opacity="0.2">${esc(l)}</text>`).join("") + `</svg>`;
  const FSICON = (c) => `<svg class="fsi" width="18" height="18" viewBox="-1 -1 10 10" shape-rendering="crispEdges" aria-hidden="true"><rect x="-1" y="-1" width="10" height="10" style="fill:${c}"/><path fill="#fff" d="M1 1h6v1H1zM1 3h6v1H1zM1 5h6v1H1zM6 6h1v1H6z"/></svg>`;
  const TAG = (tone, text) => `<span class="wtag ${tone}">${esc(text)}</span>`;
  const HINT = (text) => `<span class="hint-i" tabindex="0" role="note" title="${esc(text)}" aria-label="${esc(text)}">i</span>`;
  const BOXICON = `<svg class="boxi" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.5 12.5 4v6L7 12.5 1.5 10V4Z M1.5 4 7 6.5 12.5 4 M7 6.5v6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
  // "sha256:091f…ee9d2" → "sha256:091f785b", a tag stays as given
  const shortImage = (img) => (/^sha256:[0-9a-f]{12,}$/.test(img) ? img.slice(0, 15) : img.length > 28 ? img.slice(0, 27) + "…" : img);
  const term = (cls, attrs, head, stamp, body) => `<section class="term wterm${cls}" ${attrs}><div class="thead">${head}</div><div class="tbox">${STAMP(stamp)}<div class="tbody" data-scroll>${body}</div></div></section>`;
  // What an agent is doing on a Branch, for its chip or card row: "ws/2 exec", "fs", "idle".
  function stateOf(n) {
    const l = where(n);
    return l.kind === "ws" ? `${l.ws.split(":")[1].replace("/workspaces/", "ws/")}${idle(n) ? "" : " exec"}` : l.kind === "fs" ? "fs" : l.kind === "hist" ? "project" : "idle";
  }
  const busyOn = (n, b) => { const l = where(n); return l.branch === b && l.kind !== "bench"; };
  // agents a Branch shows: on it now, holding a Workspace there, or recently here
  const castOf = (b) => [...new Set([...X.agentsOn(v.W, b), ...Object.values(v.W.ws).filter((w) => w.branch === b).map((w) => w.agent), ...X.recentlyOn(v.W, b)])];

  // main is read-only: the Sandboxes and the Branches (each a card on the
  // sand floor, with its agents) on the left; the Store and the project
  // terminal on the right. A Branch nobody has been on for RETIRE_S retires
  // from the board (pinned ones stay); the tabs' "+N" menu still lists it.
  function boardHtml() {
    const W = v.W, placed = new Set();
    const live = W.order.filter((b) => pinned[b] || !X.retired(W, b)), nRetired = W.order.length - live.length;
    const cards = live.sort((x, y) => W.branches[y].last - W.branches[x].last).map((b) => {
      const B = W.branches[b], bad = X.conflicted(W, b), dim = branchIdle(b), cast = castOf(b), age = W.clock - B.last;
      const head = B.head.startsWith("fork:") ? `from ${B.base}` : B.head;
      const note = bad ? "conflict" : B.published ? `${head} · ↑ ${W.mainHead}` : `${head} · ${age < 1 ? "now" : age + "s"}`;
      cast.forEach((n) => placed.add(n));
      const rows = cast.map((n) => {
        const on = busyOn(n, b), w = Object.values(W.ws).find((x) => x.agent === n && x.branch === b);
        return `<div class="crow${on ? "" : " off"}"${w ? ` data-dws="${esc(w.id)}" data-sbhl="${esc(w.id.split(":")[0])}"` : ""} style="--ac:${avatar(n).color}">${mascot(n)}<span class="nm">${esc(n)}</span><span class="st">${esc(on ? stateOf(n) : "idle")}</span></div>`;
      }).join("");
      return `<div class="bcard${dim ? " dim" : ""}${bad ? " bad" : ""}${B.last === W.clock && W.seq && fresh === W.seq ? " flash" : ""}" style="--bc:var(${B.color})"><div class="bhd" data-open="${esc(b)}" title="Open ${esc(b)}"><span class="sq"></span><span class="nm">${esc(b)}</span><span class="note">${esc(note)}</span></div>${rows}</div>`;
    }).join("");
    const pool = Object.keys(W.agents).filter((n) => !placed.has(n) && where(n).kind === "bench");
    const all = Object.keys(W.agents), nIdle = all.filter((n) => idle(n)).length;
    const none = nRetired ? `every Branch has retired · nobody on one for over ${X.RETIRE_S} s` : "no Branch yet · an agent forks one from main";
    return `<section class="board"><div class="bhead"><span class="t">branches</span><span>${live.length}</span>${HINT(`Branches: a Branch is a line of Commits forked from main. A card shows its head (or the main Layer it was published to) and the agents on it now or in the last ${RECENT_S} s; a Branch nobody has been on for ${X.RETIRE_S} s retires from this board and the tabs (pin a tab to keep it).`)}<span class="sp"></span>${nRetired ? `<button class="roster" data-more="1" title="Branches nobody has been on for over ${X.RETIRE_S} s: still in History">${nRetired} retired</button>` : ""}<button class="roster" data-roster="1" title="All agents">${nIdle} idle</button></div>
      <div class="floor">${cards || `<div class="none">${none}</div>`}</div>
      ${pool.length ? `<div class="pool"><span>unassigned</span>${pool.map((n) => mascot(n)).join("")}</div>` : ""}</section>`;
  }
  // The Sandboxes: the open ones, then the ones closed in the last RETIRE_S,
  // each with who made it, its image, its use, its mounted Workspaces (click
  // one: its pane) and its running processes; hover for the whole record.
  const sinceClock = (t) => (t == null ? "–" : v.W.clock - t < 1 ? "now" : `${v.W.clock - t}s ago`);
  function sandboxPanel() {
    const W = v.W, s = W.engine.s, at = W.sbAt || {}, by = W.sbBy || {};
    const shown = s.sandboxOrder.filter((id) => !s.sandboxes[id].closed || (at[id]?.closed != null && W.clock - at[id].closed <= X.RETIRE_S));
    shown.sort((x, y) => (s.sandboxes[x].closed - s.sandboxes[y].closed) || ((at[y]?.last ?? 0) - (at[x]?.last ?? 0)));
    const open = shown.filter((id) => !s.sandboxes[id].closed), nWs = Object.keys(W.ws).length;
    const nProc = open.reduce((a, id) => a + s.sandboxes[id].procOrder.filter((p) => s.sandboxes[id].processes[p].status === "running").length, 0);
    const real = (id) => W.engine.m?.toReal?.get(id), project = s.project ? s.project.name : "";
    const rows = shown.map((id) => {
      const sb = s.sandboxes[id], a = at[id] || {}, who = by[id] || {};
      const wss = sb.wsOrder.filter((p) => sb.workspaces[p].mounted).map((p) => ({ p, w: sb.workspaces[p], view: W.ws[`${id}:${p}`] }));
      // a closed Sandbox's last process list is stale: it runs nothing
      const procs = sb.closed ? [] : sb.procOrder.map((p) => sb.processes[p]).filter((p) => p.status === "running");
      const state = sb.closed ? `closed ${sinceClock(a.closed)}${who.closed ? ` by ${who.closed}` : ""}` : `open · used ${sinceClock(a.last)}`;
      const hint = [`Sandbox ${id}${real(id) && real(id) !== id ? ` (${real(id)})` : ""}`, state,
        who.made ? `made by ${who.made}${who.service ? " (a service)" : ""}${a.made != null ? ` ${sinceClock(a.made)}` : ""}` : null,
        a.image ? `image ${a.image}` : null,
        a.calls ? `${a.calls} call${a.calls === 1 ? "" : "s"} · ${a.execs || 0} command${a.execs === 1 ? "" : "s"}` : null,
        ...wss.map(({ p, w, view }) => `${p} → ${w.branch}${w.baseCommit ? ` @ ${w.baseCommit}` : ""}${view ? ` · ${view.agent}` : ""}${w.dirty ? ` · ${w.dirty} dirty` : ""}${w.stale ? " · head moved since mount" : ""}${w.pendingMerge ? " · merge pending" : ""}`),
        ...procs.map((p) => `● ${p.command} (${p.path})`)].filter(Boolean).join("\n");
      const wsRows = wss.map(({ p, w, view }) => {
        const B = W.branches[w.branch], name = p.replace("/workspaces/", "ws/");
        return `<div class="sbws"${view ? ` data-dws="${esc(view.id)}"` : ""} style="--bc:var(${B ? B.color : "--line"})" title="${esc(`${p}: ${w.branch} from ${w.baseCommit || w.baseLayer || "main"}${w.dirty ? ` · ${w.dirty} changed entries not yet committed` : ""}${view ? ` · click: its pane on ${w.branch}` : ""}`)}"><span class="sq"></span><span class="wsn">${esc(name)}</span><span class="br">${esc(w.branch)}</span>${view ? mascot(view.agent) : ""}${w.dirty ? `<span class="dt">${w.dirty} dirty</span>` : ""}${w.stale ? `<span class="dt warn">stale</span>` : ""}</div>`;
      }).join("");
      const procRows = procs.map((p) => `<div class="sbproc" title="${esc(`${p.command} · ${p.path} · process ${p.id}`)}"><span class="d"></span>${esc(p.command)}</div>`).join("");
      const when = sb.closed ? null : `used ${sinceClock(a.last)}`;
      const meta = [when, a.image ? shortImage(a.image) : null, a.calls ? `${a.calls} call${a.calls === 1 ? "" : "s"}` : null, a.execs ? `${a.execs} cmd${a.execs === 1 ? "" : "s"}` : null].filter(Boolean).join(" · ");
      // the project's prefix gives way first, so "demo-agents-checkout" reads "demo-ag…checkout"
      const pre = project && id.startsWith(project + "-") && id.length > project.length + 1 ? project + "-" : "";
      return `<div class="sbrow${sb.closed ? " closed" : ""}" data-sbid="${esc(id)}" data-sbhl="${esc(id)}" title="${esc(hint)}">
        <div class="sbhd">${BOXICON}<span class="id">${pre ? `<span class="pre">${esc(pre)}</span>` : ""}<b>${esc(id.slice(pre.length))}</b></span><span class="sbst${sb.closed ? "" : " on"}">${sb.closed ? `closed ${esc(sinceClock(a.closed))}` : "open"}</span></div>
        <div class="sbmeta">${who.made ? mascot(who.made) : ""}<span>${esc(meta)}</span></div>${wsRows || (sb.closed ? "" : `<div class="sbempty">no Workspace mounted</div>`)}${procRows}</div>`;
    }).join("");
    return `<section class="board sbp"><div class="bhead"><span class="t">sandboxes</span><span>${open.length}</span>${HINT(`Sandboxes: a Sandbox is a Linux container where an agent mounts Workspaces (each a full view of one Branch) and runs commands. A card shows who made it, its image, its calls and commands, its mounted Workspaces and running processes; hover a card for its whole record, click a Workspace for its pane. A closed Sandbox stays ${X.RETIRE_S} s.`)}<span class="sp"></span>${TAG("blue", `${nWs} workspace${nWs === 1 ? "" : "s"} mounted`)}${nProc ? TAG("grey", `${nProc} running`) : ""}</div>
      <div class="sbcards">${rows || `<div class="none">no Sandbox open · an agent creates one to mount a Branch</div>`}</div></section>`;
  }
  // Store totals as the operator's store.stats reports them, for the whole project.
  function storePanel() {
    const W = v.W, z = W.engine.storage(), s = W.engine.s;
    const x = (a, b) => (b > 0 ? `${(a / b).toFixed(a / b >= 10 ? 0 : 1)}×` : "–");
    const tile = (val, label, tone) => `<div class="tile"><span>${label}</span><b class="${tone}">${esc(val)}</b></div>`;
    const nC = Object.keys(s.commits).length, nL = Object.keys(s.layers).length;
    const pct = (a) => (z && z.store > 0 ? Math.max(0, Math.min(100, (a / z.store) * 100)).toFixed(1) : 0);
    const free = z ? Math.max(0, z.store - z.stored - z.metadata) : 0;
    return `<section class="term storep"><div class="thead">${FSICON("var(--accent)")}<span class="t">store.stats</span><span class="sp"></span>${TAG("coral", "main · read-only")}</div>
      <div class="sbody"><div class="tiles">${tile(z ? x(z.logical, z.payload) : "–", "dedupe", "blue")}${tile(z ? x(z.payload, z.stored) : "–", "compression", "coral")}${tile(z ? fmtBytes(z.stored) : "–", "stored", "")}${tile(z ? fmtBytes(z.store) : "–", "file", "")}</div>
      <div class="sbar2"><span class="p" style="width:${pct(z ? z.stored : 0)}%"></span><span class="m" style="width:${pct(z ? z.metadata : 0)}%"></span><span class="f" style="width:${pct(free)}%"></span></div>
      <div class="sline">${z ? `logical <b>${fmtBytes(z.logical)}</b> · canonical <b>${fmtBytes(z.payload)}</b> · <span class="mc">metadata</span> ${fmtBytes(z.metadata)} · ` : `${v.live ? "not reported yet" : nC ? "sizes not reported" : "empty"} · `}${nC} commit${nC === 1 ? "" : "s"} · ${nL} layer${nL === 1 ? "" : "s"}${z && z.estimate ? " · sim est." : ""}</div></div></section>`;
  }
  function mainView() {
    const W = v.W, project = W.engine.s.project ? W.engine.s.project.name : "no project yet";
    const lines = W.hist.map((l) => lineHtml(l, l.t === fresh, '<span class="prompt">$ </span>')).join("") || `<span class="out">no calls yet</span>`;
    return `<div class="col boards">${sandboxPanel()}${boardHtml()}</div><div class="col">${storePanel()}${term(lastHit("hist"), 'data-loc="hist"', `${mascot(LEAD)}<span class="t">project</span><span class="ghost">${esc(project)}</span><span class="sp"></span>${TAG("blue", "project · branch")}`, ["project · branch"], lines)}</div>`;
  }

  function branchView(b) {
    const W = v.W, B = W.branches[b];
    const fsLines = (W.fsLog[b] || []).map((l) => lineHtml(l, l.t === fresh, '<span class="prompt">$ </span>')).join("") || `<span class="out">no fs calls on ${esc(b)} yet</span>`;
    const headId = B.head.startsWith("fork:") ? B.base : B.head;
    const gone = [...leaving.values()].filter((l) => l.w.branch === b).map((l) => ({ ...l.w, leftAt: l.at }));
    const wss = [...Object.values(W.ws).filter((w) => w.branch === b), ...gone].sort((x, y) => x.born - y.born);
    const nC = Object.values(W.nodes).filter((n) => n.branch === b && n.kind === "commit").length;
    const sbs = [...new Set(wss.filter((w) => !w.leftAt).map((w) => w.id.split(":")[0]))];
    const status = sbs.length ? `sandbox ${sbs.join(", ")} · ${wss.filter((w) => !w.leftAt).length} workspace${wss.length === 1 ? "" : "s"}` : "no Workspace mounted";
    const chips = castOf(b).map((n) => { const on = busyOn(n, b);
      return `<div class="wchip${on ? " on" : ""}" style="--ac:${avatar(n).color}">${mascot(n)}<span class="nm">${esc(n)}</span><span class="st">${esc(on ? stateOf(n) : "idle")}</span></div>`; }).join("");
    const fs = term(lastHit("fs:" + b), `data-loc="fs:${esc(b)}"`, `${FSICON(`var(${B.color})`)}<span class="t">fs · ${esc(b)}</span><span class="ghost">persistent</span><span class="sp"></span>${TAG("grey", "direct to Store")}`, ["fs · " + b, "direct to Store"], fsLines);
    const panes = wss.map((w) => { const [sb, path] = w.id.split(":"), ws = path.replace("/workspaces/", "ws/");
      const cls = (w.leftAt ? " leaving" : w.bad ? " bad" : lastHit("ws:" + w.id)) + (!w.leftAt && w.born === fresh ? " enter" : "") + (focusPane === w.id ? " focus" : "");
      const pill = w.leftAt ? TAG("grey", ws + " · unmounted") : w.bad ? TAG("coral", ws + " · conflict") : TAG("blue", ws + " · mounted");
      return term(cls, `data-loc="ws:${esc(w.id)}" data-sb="${esc(sb)}" data-sbhl="${esc(sb)}"${w.leftAt ? ` style="animation-delay:${w.leftAt - Date.now()}ms"` : ""}`,
        `${mascot(w.agent)}<span class="t">${esc(w.agent)}</span><button class="ghost sbchip" data-sbchip="${esc(sb)}" title="Runs in Sandbox ${esc(sb)} · click: the Sandboxes on main">sandbox ${esc(sb)}</button><span class="sp"></span>${pill}`,
        ["sandbox " + sb, "workspace " + ws], w.lines.map((l) => lineHtml(l, l.t === fresh, l.dim ? "" : '<span class="prompt">$ </span>')).join("")); });
    const cells = [fs, ...panes];
    // two by two: a lone terminal gets one placeholder beside it, an odd count one to even the row
    while (cells.length < 2 || cells.length % 2) cells.push(`<div class="wempty">a Workspace opens here on the next tool call</div>`);
    return `<div class="binfo"><span class="nm" style="color:var(${B.color})">${esc(b)}</span><span>from ${esc(B.base)}</span><span>head ${esc(headId)}</span><span>${nC} commit${nC === 1 ? "" : "s"}</span><span class="status">${esc(status)}</span></div>
      <div class="wchips">${chips || `<span class="none">nobody on ${esc(b)} in the last ${RECENT_S} s</span>`}</div>
      <div class="wgrid">${cells.join("")}</div>`;
  }

  // ---------------------------------------------------------------- Sandboxes and status
  // The bottom bar, on every tab: running processes (a server matters wherever
  // you are). The Sandboxes themselves are listed on the main tab.
  function renderStatus() {
    const s = v.W.engine.s;
    const procs = s.sandboxOrder.filter((id) => !s.sandboxes[id].closed).flatMap((id) => s.sandboxes[id].procOrder.map((p) => s.sandboxes[id].processes[p]).filter((p) => p.status === "running").map((p) => ({ ...p, sb: id })));
    const pane = (k, l) => `<button class="${v.panes === k ? "on" : ""}" data-panes="${k}" aria-pressed="${v.panes === k}">${l}</button>`;
    const at = layout.cols?.dataset.dock || "";
    const dk = (d) => {
      const off = sideways(d) && !colsFit;
      return `<button class="${at === d ? "on" : ""}" data-dock="${d}" aria-pressed="${at === d}"${off ? " disabled" : ""} title="${DOCKS[d]}${off ? " · too narrow for side by side" : ""}" aria-label="${DOCKS[d]}">${dockIcon(d)}</button>`;
    };
    layout.status.innerHTML = `<div class="ctl winsw" role="group" aria-label="Windows">${pane("history", "History")}${pane("both", "Both")}${pane("work", "Work")}</div>`
      + (v.panes === "both" && layout.cols ? `<div class="ctl docksw" role="group" aria-label="Arrangement">${Object.keys(DOCKS).map(dk).join("")}</div>` : "")
      + `<span class="lbl">${procs.length ? "Running" : "No processes running"}</span>`
      + procs.map((p) => `<button class="chip proc" data-sbchip="${esc(p.sb)}" data-sbhl="${esc(p.sb)}" title="Running in ${esc(p.sb)}:${esc(p.path)} (operator process list) · click to show its Sandbox on main"><span class="d"></span>${esc(p.sb)} · ${esc(p.command)}</button>`).join("")
      + `<span class="sp"></span><span class="lbl snote">${esc(v.note)}</span><span class="lbl">${esc(o.hint ?? "hover a History node")}</span>`;
  }
  // Hovering anything tagged with a Sandbox lights it up: its group on main,
  // and in a Branch tab every pane on that machine.
  function lightSandbox(id) {
    if (id === sbLit) return;
    sbLit = id;
    for (const el of root.querySelectorAll(".sblit")) el.classList.remove("sblit");
    if (id) for (const el of root.querySelectorAll(`.crow[data-sbhl="${CSS.escape(id)}"], .term[data-sb="${CSS.escape(id)}"], .sbrow[data-sbid="${CSS.escape(id)}"]`)) el.classList.add("sblit");
  }

  // ---------------------------------------------------------------- render
  /** The node a tab's Files is fixed at, or null while it follows the head. */
  function pinnedAt(tab) { const at = files.filesOf(tab).at; return at === "latest" ? null : at; }
  const ago = (ms) => { const m = Math.max(0, Math.round(ms / 60000)); return m < 1 ? "now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; };
  /** Every Branch with its head, newest first: what a project page is usually opened for. */
  function branchesHtml() {
    const W = v.W, s = W.engine.s, now = Date.now(), timeOf = (b) => (s.commits[W.branches[b].head] || {}).time || 0;
    const row = (b) => {
      const B = W.branches[b], head = B.head, c = s.commits[head], by = W.attrib[head], open = !head.startsWith("fork:");
      return `<button class="grow brow${pinnedAt("main") === head ? " sel" : ""}" data-node="${esc(head)}" title="Show ${esc(b)} in Files"><span class="bdot" style="background:var(${B.color})"></span><span class="gbr">${esc(b)}</span>`
        + `<span class="gid${open ? "" : " dim"}">${open ? esc(head) : "no Commits"}</span><span class="gmsg">${c ? esc(c.message || c.via || "") : `from ${esc(s.branches[b].from || "main")}`}</span>`
        + `${by ? `<span class="gby"${colorOf(by) ? ` style="color:${colorOf(by)}"` : ""}>${esc(by)}</span>` : ""}<span class="age">${c && c.time ? ago(now - c.time) : ""}</span></button>`;
    };
    const rows = [...W.order].sort((a, b) => timeOf(b) - timeOf(a)).map(row).join("");
    return `<div class="graphwrap blist">${rows || `<div class="empty">No Branches yet: an agent's fork makes one</div>`}</div>`;
  }
  function projectView() {
    const W = v.W, at = pinnedAt("main"), n = at && W.nodes[at];
    const where = !at ? `main @ ${W.mainHead || "–"}` : at.startsWith("fork:") ? `the fork point of ${at.slice(5)}` : `${at}${n ? ` (${n.branch || "main"})` : ""}`;
    const seg = (id, label) => `<button class="${v.left === id ? "on" : ""}" data-left="${id}">${label}</button>`;
    const left = v.left === "branches" ? branchesHtml()
      : W.mainHead ? `<div class="treebox">${tz.controlsHtml()}<div class="treewrap" data-tree tabindex="0" aria-label="History tree: drag to pan, ⌘ + scroll to zoom">${treeOf("main", treeSize(layout.work.querySelector(".col")), true).svg}</div></div>` : `<div class="empty">No history yet</div>`;
    return `<div class="col"><section class="term"><div class="thead"><span class="seg">${seg("history", "History")}${seg("branches", "Branches")}</span><span class="sp"></span><span class="ttl">${W.order.length} Branch${W.order.length === 1 ? "" : "es"}</span></div>${left}</section></div>
      <div class="split" data-split role="separator" aria-orientation="vertical" aria-label="Resize History and Files"></div>
      <div class="col"><section class="term"><div class="thead"><span class="ptitle">Files at ${esc(where)}</span></div>${W.mainHead ? files.filesHtml("main") : ""}</section></div>`;
  }
  function render() {
    const W = v.W;
    if (!W) return;
    if (PROJECT) {
      const keep = [".ftree", ".fview", ".blist"].map((sel) => { const el = layout.work.querySelector(sel); return [sel, el ? el.scrollTop : 0]; });
      const tw = q("[data-tree]"), at = tw && { left: tw.scrollLeft, top: tw.scrollTop };
      layout.work.innerHTML = projectView();
      tz.apply();
      for (const [sel, top] of keep) { const el = layout.work.querySelector(sel); if (el) el.scrollTop = top; }
      placeTree(at);
      drawnFor = q("[data-tree]") && { w: q("[data-tree]").clientWidth, h: q("[data-tree]").clientHeight };
      const now = q("[data-tree]"), size = treeSize(null);
      if (now && sizeTries++ < 1 && (Math.abs(+(now.querySelector("svg").dataset.w ?? 0) - Math.max(size.w, 0)) > 8)) requestAnimationFrame(render);
      else sizeTries = 0;
      return;
    }
    trackLeaving(W);
    fresh = W.seq === drawnSeq ? -1 : W.seq;
    drawnSeq = W.seq;
    const work = layout.work;
    const keepScroll = [".ftree", ".fview", ".floor"].map((sel) => { const el = work.querySelector(sel); return [sel, el ? el.scrollTop : 0]; });
    if (v.active !== "main" && !W.branches[v.active]) v.active = "main";
    renderTabs();
    const wide = v.rightMode[v.active] === "files" && files.wide(v.active);
    (layout.cols || work).classList.toggle("wide", !!wide);
    if (layout.cols) { layout.cols.dataset.panes = v.panes; fitCols(); } // before measuring: they decide History's box
    renderStatus();
    const tw = q("[data-tree]"), at = tw && { left: tw.scrollLeft, top: tw.scrollTop }, size = treeSize(layout.hist);
    const keepFiles = [".hist .ftree", ".hist .fview"].map((sel) => { const el = root.querySelector(sel); return [sel, el ? el.scrollTop : 0]; });
    const showHist = v.panes !== "work", showWork = v.panes !== "history";
    if (layout.hist) layout.hist.innerHTML = showHist ? histHtml(size) : "";
    // the preview's layout keeps History inside the work area
    const inWork = !layout.hist && showHist ? `<section class="panel hist" aria-label="History">${histHtml(size)}</section>` : "";
    work.className = "work " + (v.active === "main" ? "mainview" : "branchview") + (layout.hist ? "" : showHist && showWork ? " withhist" : showHist ? " histonly" : "");
    work.innerHTML = inWork + (showWork || layout.hist ? (v.active === "main" ? mainView() : branchView(v.active)) : "");
    for (const [sel, top] of keepFiles) { const el = root.querySelector(sel); if (el) el.scrollTop = top; }
    tz.apply();
    placeTree(at);
    { const el = q("[data-tree]"); drawnFor = el && { w: el.clientWidth, h: el.clientHeight }; }
    // the tree is drawn for its box: when the box turned out another size, draw it again (once)
    const now = q("[data-tree]");
    if (now && (Math.abs(now.clientWidth - 2 - size.w) > 8 || Math.abs(now.clientHeight - 2 - size.h) > 8) && sizeTries++ < 1) requestAnimationFrame(render);
    else sizeTries = 0;
    // terminals follow their newest line; the Branch cards keep their place
    for (const el of work.querySelectorAll(".tbody")) el.scrollTop = el.scrollHeight;
    for (const [sel, top] of keepScroll) { const el = work.querySelector(sel); if (el) el.scrollTop = top; }
    if (sbLit) { const id = sbLit; sbLit = null; lightSandbox(id); } // the redraw dropped the highlight
    // a node card whose node went away with the redraw (History became Files) never saw its mouseout
    if (card.classList.contains("open") && !card.matches(":hover") && !root.querySelector("svg.graph [data-node]:hover")) hideCard(true);
    if (sbPulse) {
      const card = work.querySelector(`.sbrow[data-sbid="${CSS.escape(sbPulse)}"]`), r = work.querySelector(`.crow[data-sbhl="${CSS.escape(sbPulse)}"]`), g = r && r.closest(".bcard");
      sbPulse = null;
      for (const el of [card, g]) if (el) { el.classList.add("pulse"); el.scrollIntoView({ block: "nearest" }); }
    }
  }

  // ---------------------------------------------------------------- hover card (tui.html)
  // What a History node is, who made it, and which Workspaces are mounted on it.
  function wsRows(name, nodeId) {
    const W = v.W, s = W.engine.s, head = s.branches[name].head || "fork:" + name, rows = [];
    for (const id of s.sandboxOrder) for (const p of s.sandboxes[id].wsOrder) {
      const w = s.sandboxes[id].workspaces[p];
      if (!w.mounted || w.branch !== name || (w.baseCommit || "fork:" + name) !== nodeId) continue;
      const k = `${id}:${p}`, dirty = W.engine.dirtyOf(w), stale = nodeId !== head, agent = (W.panes[k] || {}).agent;
      rows.push(`<button class="ws${stale ? " stale" : ""}" data-open="${esc(name)}" title="Open the ${esc(name)} tab"><span class="d"></span>${agent ? mascot(agent) : ""}${esc(k)}${dirty ? ` · +${dirty}` : ""}<small>${stale ? `stale · head ${head.replace("fork:", "")}` : "current"}</small></button>`);
    }
    return rows.length ? `<div class="sec">Workspaces mounted here</div>${rows.join("")}` : "";
  }
  function cardHtml(id) {
    const W = v.W, s = W.engine.s, who = W.attrib[id], by = who ? `by <b style="color:${avatar(who).color}">${esc(who)}</b>` : "", head = '<span class="tag">head</span>';
    const btns = `<div class="cbtns"><button class="cbtn" data-card-at="${esc(id)}">Browse files</button><button class="cbtn" data-card-cmp="${esc(id)}">Diff vs parent</button></div><div class="hint">Click the node: open Files at this point</div>`;
    if (s.layers[id]) {
      const l = s.layers[id];
      return `<div class="h"><b>${l.id}</b>main${id === s.main.head ? head : ""}</div><div class="meta">Layer${l.root ? ` · root ${l.root}` : ""}<br>${l.sourceCommit ? `published from ${esc(l.sourceBranch)} ${l.sourceCommit}` : "project.init"}${by ? "<br>" + by : ""}</div>${btns}`;
    }
    if (s.commits[id]) {
      const c = s.commits[id];
      const lww = (list) => (list && list.length ? "<br>" + list.map((d) => `last-writer-wins ${esc(d.path)} ← ${esc(d.kept)}`).join("<br>") : "");
      const owner = (n) => (s.commits[n] ? `${esc(s.commits[n].branch)} ${n}` : `main ${n}`);
      const mrg = c.mergedFrom ? `<div class="sec">Merge</div><div class="meta">merged from ${owner(c.mergedFrom)} into ${c.parent ? owner(c.parent) : "main " + c.base}${c.mergeBase ? `<br>merge base ${esc(c.mergeBase)}` : ""}${lww(c.lww)}</div>`
        : c.merged ? `<div class="sec">Merged on commit</div><div class="meta">the Workspace was on ${c.merged.from}; merged with head ${c.merged.head}${lww(c.merged.lww)}</div>` : "";
      const after = c.displacedBy ? `<div class="sec">Off the line</div><div class="meta">${c.displacedBy} was committed with --force, so ${c.id} is no longer an ancestor of the head.</div>` : "";
      const b = s.branches[c.branch];
      return `<div class="h"><b>${c.id}</b>${esc(c.branch)}${b && b.head === id ? head : ""}</div>
        <div class="meta">parent ${c.parent || "Branch base"}${c.root ? ` · root ${c.root}` : ""}<br>${by}${by ? " · " : ""}${esc(c.message || c.via)}<br>via ${esc(c.by === "fs" ? c.via : c.by === "merge" ? "branch.merge" : "sandbox.commit " + c.via)}</div>${mrg}${after}${wsRows(c.branch, id)}${btns}`;
    }
    const name = id.slice(5), b = s.branches[name];
    return `<div class="h"><b>${esc(name)}</b>fork point${b.head ? "" : head}</div><div class="meta">forked from ${b.from}${b.head ? "" : " · no Commits yet"}${by ? "<br>" + by : ""}</div>${wsRows(name, id)}${btns}`;
  }
  function showCard(node) {
    clearTimeout(cardTimer);
    const r = node.getBoundingClientRect(), base = root.getBoundingClientRect();
    card.innerHTML = cardHtml(node.dataset.node);
    card.classList.add("open");
    const h = card.offsetHeight, w = root.clientWidth, top = r.bottom - base.top + 8;
    card.style.left = Math.max(8, Math.min(w - 298, r.left - base.left + r.width / 2 - 145)) + "px";
    card.style.top = (top + h > root.clientHeight ? r.top - base.top - h - 8 : top) + "px";
  }
  const hideCard = (now) => { clearTimeout(cardTimer); cardTimer = setTimeout(() => card.classList.remove("open"), now ? 0 : 180); };

  // ---------------------------------------------------------------- the call that just happened
  // Heroes do not walk from window to window: each stands still in its card
  // rows, chips, lines and terminal heads, and bobs while it works, as on the
  // website. A call shows as a bubble on the window it ran in and, when it
  // made a node, a block flying from there into the tree.
  function hostOf(n) {
    const l = where(n), key = X.locKey(l);
    return (key && q(`[data-loc="${CSS.escape(key)}"]`)) || (l && l.branch && layout.tabs ? layout.tabs.querySelector(`[data-tab="${CSS.escape(l.branch)}"]`) : null);
  }
  function bubbleOn(host, text, cls) {
    const r = host.getBoundingClientRect(), base = overlay.getBoundingClientRect(), b = document.createElement("div");
    b.className = "bubble " + (cls || ""); b.textContent = text;
    b.style.left = Math.min(r.right - base.left - 70, r.left - base.left + r.width / 2) + "px"; b.style.top = r.top - base.top + Math.min(40, r.height / 2) + "px";
    overlay.appendChild(b); setTimeout(() => b.remove(), 2000);
  }
  function flyBlock(host, nodeId, color) {
    const target = q(`[data-node="${CSS.escape(nodeId)}"]`);
    if (!target) return;
    const a = host.getBoundingClientRect(), z = target.getBoundingClientRect(), base = overlay.getBoundingClientRect(), b = document.createElement("div");
    const x0 = a.left - base.left + 16, y0 = a.top - base.top + 16;
    b.className = "block"; b.style.background = color; b.style.left = x0 + "px"; b.style.top = y0 + "px";
    overlay.appendChild(b);
    requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transform = `translate(${z.left - base.left + z.width / 2 - x0 - 6}px,${z.top - base.top + z.height / 2 - y0 - 6}px) scale(.7)`; b.style.opacity = "0"; }));
    setTimeout(() => b.remove(), 900);
  }
  /** The call that just happened, by `agent`: its bubble and, when it made a node, a block flying there. */
  function animate(agent) {
    const W = v.W;
    if (!W || !W.last || agent === "dsh" || PROJECT) return;
    const host = hostOf(agent);
    if (!host) return;
    const b = bubbleOf(W.last);
    if (b) bubbleOn(host, b[0], b[1]);
    const id = W.last.node;
    if (id && W.nodes[id]) flyBlock(host, id, getComputedStyle(root).getPropertyValue(W.nodes[id].branch ? W.branches[W.nodes[id].branch].color : "--trunk").trim());
  }

  // ---------------------------------------------------------------- events
  const setFollow = (on) => {
    v.follow = on;
    if (layout.follow) { layout.follow.classList.toggle("on", on); layout.follow.setAttribute("aria-pressed", String(on)); }
    if (o.onFollow) o.onFollow(on);
  };
  const openTab = (tab) => { v.active = tab; setFollow(false); closeMenu(); render(); };
  const onTabs = (e) => {
    closeMenu();
    const pin = e.target.closest("[data-pin]");
    if (pin) { const b = pin.dataset.pin; pinned[b] = !pinned[b]; e.stopPropagation(); render(); return; }
    const more = e.target.closest("[data-more]");
    if (more) { moreMenu(more); e.stopPropagation(); return; }
    const t = e.target.closest("[data-tab]");
    if (t) openTab(t.dataset.tab);
  };
  // Sandboxes: open a Workspace's Branch at its pane, or show a pane's Sandbox on main.
  const onSandbox = (e) => {
    const t = e.target.closest && e.target.closest("[data-dws], [data-sbchip]");
    if (!t) return false;
    if (t.dataset.sbchip) { v.active = "main"; setFollow(false); sbPulse = t.dataset.sbchip; render(); return true; }
    const k = t.dataset.dws, w = v.W.ws[k] || null;
    if (!w) return true;
    v.active = w.branch; setFollow(false); focusPane = k; render(); focusPane = null;
    q(`[data-loc="ws:${CSS.escape(k)}"]`)?.scrollIntoView({ block: "nearest" });
    return true;
  };
  const onClick = (e) => {
    if (!v.W) return;
    if (tz.click(e)) return;
    if (layout.tabs && layout.tabs.contains(e.target)) return onTabs(e);
    if (layout.follow && layout.follow.contains(e.target)) { setFollow(!v.follow); if (v.follow && o.onFollowOn) o.onFollowOn(); return; }
    const c = e.target.closest("[data-card-at], [data-card-cmp]");
    if (c) {
      // card buttons open the node's lane at that point, in Files
      const id = c.dataset.cardAt || c.dataset.cardCmp, n = v.W.nodes[id]; if (!n) return;
      if (PROJECT) { files.showAt("main", id); files.filesOf("main").mode = c.dataset.cardCmp ? "diff" : "view"; hideCard(true); render(); return; }
      const lane = n.branch || "main";
      v.active = lane; setFollow(false);
      files.showPoint(lane, id); files.filesOf(lane).mode = c.dataset.cardCmp ? "diff" : "view";
      hideCard(true); render(); return;
    }
    if (onSandbox(e)) return;
    const sd = e.target.closest("[data-sdk]");
    if (sd) { const k = sd.dataset.sdk; OPEN_SDK.has(k) ? OPEN_SDK.delete(k) : OPEN_SDK.add(k); render(); return; }
    if (files.click(e)) return;
    const ro = e.target.closest("[data-roster]");
    if (ro) { rosterMenu(ro); return; }
    const mo = e.target.closest("[data-more]");
    if (mo) { moreMenu(mo); return; }
    const r = e.target.closest("[data-right]");
    if (r) { const [t, m] = r.dataset.right.split(":"); v.rightMode[t] = m; render(); return; }
    const pn = e.target.closest("button[data-panes]");
    if (pn) { v.panes = prefs.panes = pn.dataset.panes; savePrefs(); treeAuto = true; render(); return; }
    const dk = e.target.closest("button[data-dock]");
    if (dk) { prefs.dock = dk.dataset.dock; savePrefs(); treeAuto = true; render(); return; }
    const or = e.target.closest("[data-orient]");
    if (or) { v.orient = or.dataset.orient; treeAuto = true; render(); return; }
    if (e.target.closest("[data-now]")) { treeAuto = true; render(); return; }
    const ovs = e.target.closest("[data-ov]");
    if (ovs) { overviewTo(e, ovs); return; }
    const lf = e.target.closest("[data-left]");
    if (lf) { v.left = lf.dataset.left; render(); return; }
    const op = e.target.closest("[data-open]");
    if (op) openTab(op.dataset.open);
    else if (!e.target.closest("[data-more]") && !e.target.closest(".menu")) closeMenu();
  };
  const onOver = (e) => {
    const t = e.target.closest && e.target.closest("[data-sbhl]");
    lightSandbox(t ? t.dataset.sbhl : null);
    const n = e.target.closest && e.target.closest("svg.graph [data-node]");
    if (n) showCard(n);
  };
  const onOut = (e) => { const n = e.target.closest && e.target.closest("svg.graph [data-node]"); if (n && !n.contains(e.relatedTarget)) hideCard(); };
  const onCardEnter = () => clearTimeout(cardTimer), onCardLeave = () => hideCard();
  const onChange = (e) => files.change(e);
  // the project page's divider: History takes the share of the width it is dragged to (25–75%)
  const onSplit = (e) => {
    const bar = e.target.closest && e.target.closest("[data-split]");
    if (!bar) return;
    e.preventDefault();
    if (bar.dataset.split === "cols") {
      const cols = layout.cols, box = cols.getBoundingClientRect(), dock = cols.dataset.dock || "left", h = layout.hist.getBoundingClientRect();
      const x0 = e.clientX, y0 = e.clientY;
      let frame = 0;
      const move = (m) => {
        if (sideways(dock)) prefs.histw = Math.round(Math.max(280, Math.min(box.width - WORK_MIN - CHROME, h.width + (dock === "right" ? x0 - m.clientX : m.clientX - x0))));
        else prefs.histh = Math.round(Math.max(240, Math.min(1400, h.height + (dock === "bottom" ? y0 - m.clientY : m.clientY - y0))));
        fitCols();
        cancelAnimationFrame(frame); frame = requestAnimationFrame(place); // the tree redraws for its new box
      };
      const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); cols.classList.remove("dragging"); savePrefs(); };
      cols.classList.add("dragging");
      addEventListener("pointermove", move); addEventListener("pointerup", up);
      return;
    }
    const work = layout.work, box = work.getBoundingClientRect();
    const move = (m) => { const share = Math.min(75, Math.max(25, ((m.clientX - box.left) / box.width) * 100)); work.style.setProperty("--hist", share.toFixed(1) + "%"); };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); work.classList.remove("dragging"); };
    work.classList.add("dragging");
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  };
  // Docking: grab a window by its grip (or the empty part of its header) and
  // drop it on one of four targets in the middle of the view, or near an
  // edge; a preview shows where it lands. Side by side is offered only while
  // it fits (fitCols). A press that does not move DOCK_PX stays a click;
  // Escape cancels. The status bar's buttons do the same in one click.
  const DOCK_PX = 6, OPP = { left: "right", right: "left", top: "bottom", bottom: "top" }, EDGE = 0.2;
  const onDockDown = (e) => {
    if (!layout.cols || v.panes !== "both" || e.button !== 0 || !e.target.closest) return;
    const fromHist = !!e.target.closest(".hist .phead"), fromWork = !fromHist && !!e.target.closest(".lfs-strip");
    if ((!fromHist && !fromWork) || e.target.closest("button, select, input, [data-tab]")) return;
    e.preventDefault();
    const cols = layout.cols, x0 = e.clientX, y0 = e.clientY, now = cols.dataset.dock || "left";
    let zone = null, ui = null;
    const zoneOf = (m) => {
      for (const t of ui.querySelectorAll(".dkt")) {
        const r = t.getBoundingClientRect();
        if (m.clientX >= r.left - 6 && m.clientX <= r.right + 6 && m.clientY >= r.top - 6 && m.clientY <= r.bottom + 6) return t.classList.contains("off") ? null : t.dataset.z;
      }
      const r = cols.getBoundingClientRect();
      if (m.clientX < r.left || m.clientX > r.right || m.clientY < r.top || m.clientY > r.bottom) return null;
      const d = { left: (m.clientX - r.left) / r.width, right: (r.right - m.clientX) / r.width, top: (m.clientY - r.top) / r.height, bottom: (r.bottom - m.clientY) / r.height };
      const z = Object.keys(d).reduce((a, b) => (d[b] < d[a] ? b : a));
      return d[z] > EDGE || (sideways(z) && !colsFit) ? null : z;
    };
    const open = () => {
      const r = cols.getBoundingClientRect(), base = overlay.getBoundingClientRect(), what = fromHist ? "History" : "Work window";
      const tile = (z) => {
        const dock = fromHist ? z : OPP[z], off = sideways(z) && !colsFit;
        return `<div class="dkt${off ? " off" : ""}${dock === now ? " cur" : ""}" data-z="${z}">${dockIcon(z)}<span>${off ? "too narrow" : dock === now ? "current" : z}</span></div>`;
      };
      ui = html(`<div class="dockui"><div class="dkprev"></div><div class="dkpad">${["top", "left", "right", "bottom"].map(tile).join("")}<div class="dkc">${what}</div></div></div>`);
      Object.assign(ui.style, { left: r.left - base.left + "px", top: r.top - base.top + "px", width: r.width + "px", height: r.height + "px" });
      overlay.appendChild(ui); cols.classList.add("docking");
    };
    const move = (m) => {
      if (!ui) { if (Math.hypot(m.clientX - x0, m.clientY - y0) < DOCK_PX) return; open(); }
      zone = zoneOf(m);
      for (const t of ui.querySelectorAll(".dkt")) t.classList.toggle("hot", t.dataset.z === zone);
      const p = ui.querySelector(".dkprev");
      p.style.display = zone ? "" : "none";
      if (zone) Object.assign(p.style, { left: zone === "right" ? "50%" : "14px", right: zone === "left" ? "50%" : "14px", top: zone === "bottom" ? "50%" : "14px", bottom: zone === "top" ? "50%" : "14px" });
    };
    const end = (drop) => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("keydown", key);
      if (!ui) return;
      ui.remove(); cols.classList.remove("docking");
      // dropping the work window on the left puts History on the right
      if (drop && zone) { prefs.dock = fromHist ? zone : OPP[zone]; savePrefs(); treeAuto = true; render(); }
    };
    const up = () => end(true), key = (k) => { if (k.key === "Escape") end(false); };
    addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("keydown", key);
  };
  // the tree is drawn for its box: a resized box redraws it
  let drawnFor = null;
  const place = () => {
    if (fitCols()) { render(); return; }
    const el = q("[data-tree]");
    if (el && drawnFor && (Math.abs(el.clientWidth - drawnFor.w) > 8 || Math.abs(el.clientHeight - drawnFor.h) > 8)) { render(); return; }
  };
  // the viewer scrolling the tree takes it off "now"; the overview's box follows
  const onTreeScroll = (e) => {
    const el = e.target;
    if (!el.matches || !el.matches("[data-tree]")) return;
    if (treeSet && (Math.abs(el.scrollLeft - treeSet.left) > 2 || Math.abs(el.scrollTop - treeSet.top) > 2)) treeAuto = false;
    placeOverview();
  };
  root.addEventListener("click", onClick);
  root.addEventListener("mouseover", onOver);
  layout.work.addEventListener("mouseout", onOut);
  card.addEventListener("mouseenter", onCardEnter);
  card.addEventListener("mouseleave", onCardLeave);
  root.addEventListener("change", onChange);
  (layout.cols || layout.work).addEventListener("pointerdown", onSplit);
  if (layout.cols) layout.cols.addEventListener("pointerdown", onDockDown);
  // double-clicking the divider gives History its default width back
  const onSplitReset = (e) => {
    if (!e.target.closest || !e.target.closest('[data-split="cols"]')) return;
    delete prefs[sideways(layout.cols.dataset.dock || "left") ? "histw" : "histh"]; savePrefs(); render();
  };
  root.addEventListener("dblclick", onSplitReset);
  addEventListener("resize", place);
  // narrow layouts scroll a column: avatars stay with their hosts
  root.addEventListener("scroll", place, { capture: true, passive: true });
  root.addEventListener("scroll", onTreeScroll, { capture: true, passive: true });
  const resize = typeof ResizeObserver === "function" ? new ResizeObserver(place) : null;
  if (resize) resize.observe(root);

  return {
    get W() { return v.W; },
    set W(W) { v.W = W; },
    get active() { return v.active; },
    set active(tab) { v.active = tab; },
    get follow() { return v.follow; },
    set follow(on) { setFollow(on); },
    /** Locations to highlight and agents acting in the current step. */
    set lastLoc(loc) { v.lastLoc = loc; },
    set acting(names) { v.acting = new Set(names); },
    /** Where the view's data comes from: a line in the status bar, or the preview's own note element. */
    set note(text) {
      v.note = text || "";
      if (layout.note) layout.note.textContent = v.note;
      else { const el = layout.status && layout.status.querySelector(".snote"); if (el) el.textContent = v.note; }
    },
    /** Shows History or Files in the left panel for a tab. */
    setRight(tab, mode) { v.rightMode[tab] = mode; },
    avatar, render, animate, files,
    dispose() {
      clearTimeout(leaveTimer);
      tz.dispose();
      root.removeEventListener("click", onClick);
      root.removeEventListener("mouseover", onOver);
      layout.work.removeEventListener("mouseout", onOut);
      root.removeEventListener("change", onChange);
      (layout.cols || layout.work).removeEventListener("pointerdown", onSplit);
      if (layout.cols) layout.cols.removeEventListener("pointerdown", onDockDown);
      root.removeEventListener("dblclick", onSplitReset);
      removeEventListener("resize", place);
      root.removeEventListener("scroll", place, { capture: true });
      root.removeEventListener("scroll", onTreeScroll, { capture: true });
      if (resize) resize.disconnect();
      clearTimeout(cardTimer);
      overlay.remove(); card.remove();
    },
  };
}
