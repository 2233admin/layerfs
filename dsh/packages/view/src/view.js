// The LayerFS view, framework-free: it draws a model view (W, built by
// @dsh-layerfs/model) into one root element. The design preview and the dsh
// client plugin both use it, so they draw the same thing from the same W.
//   tabs     main, then one chip per active Branch
//   work     the main view (PROJECT terminal, Branches, Sandboxes, History or
//            Files) or a Branch view (FS terminal, Workspace panes, History or Files)
//   status   running processes
//   overlay  avatars, bubbles and flying blocks, placed relative to the root
// With `project`, it draws one project instead: History (or its Branches)
// and Files side by side with a divider to drag (Files follows the History
// node or Branch clicked), without tabs, terminals or avatars.
// The host owns the clock: it sets W, then calls render(), and animate() for
// the call that just happened.
import * as X from "../../model/src/index.js";
import { createFiles } from "./files.js";
import { graph } from "./graph.js";
import { cmdTime, esc, timingText } from "./util.js";

const { CAP, RECENT_S, bubbleOf } = X;
const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content.firstElementChild; };

/**
 * @param {HTMLElement} root the view's root; it gets class `lfs`
 * @param {object} o
 * @param {object} o.avatars sprite data (sdk_sim/avatars), with sheet URLs
 * @param {object} o.files the files helpers (simulation_engine/files.js)
 * @param {Function} o.lineDiff line diff (simulation_engine/model.js)
 * @param {boolean} [o.live] the engine reports file history itself (engine.fileReport)
 * @param {string} [o.lead] the lead agent (ellen_joe)
 * @param {object} [o.layout] existing { tabs, work, status, follow } elements
 *   (the preview's); missing ones are created as the standalone layout
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
    root.innerHTML = `<div class="lfs-strip"><div class="tabs" role="tablist" aria-label="LayerFS tabs"></div><span class="lfs-note"></span><button class="ib on" data-follow="1" title="Follow the acting agent across tabs"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg><span class="lbl">Follow</span></button></div><main class="work"></main><div class="statusbar" aria-label="Sandboxes and processes"></div>`;
    layout = { tabs: root.querySelector(".tabs"), work: root.querySelector(".work"), status: root.querySelector(".statusbar"), follow: root.querySelector("[data-follow]"), note: root.querySelector(".lfs-note") };
  }
  const overlay = html(`<div class="lfs-crabs" aria-hidden="true"></div>`), card = html(`<div class="hcard" role="tooltip"></div>`);
  root.append(overlay, card);

  // ---------------------------------------------------------------- cast
  // The lead is ellen_joe. Every other agent gets a colour variant picked
  // from a hash of its name, so it is the same on every rewind, reload and
  // backend; no variant repeats until all are in use (then a number tells them
  // apart). An agent's colour (tags, History, cards) is its variant's hair.
  const AGENTS = {}, VARIANTS = Object.keys(AV.chars).filter((c) => c !== AV.main), AV_TAKEN = new Map(), AV_N = Object.keys(AV.chars).length;
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
    a.color = AV.chars[a.av].color;
    return a;
  }
  const colorOf = (n) => (n && AGENTS[n] ? avatar(n).color : undefined);
  function mascot(n, mini) {
    const a = avatar(n), c = AV.chars[a.av], dup = a.dup > 1 ? `<i class="dup">${a.dup}</i>` : "";
    if (mini) return `<span class="av" style="--ac:${a.color};background-image:url(${AV.heads});background-size:${AV_N * 16}px 16px;background-position:${-c.head * 16}px 0" aria-hidden="true">${dup}</span>`;
    return `<span class="spr" style="background-image:url(${c.sheet});background-size:${c.poses.length * AV.frame.w}px ${AV.frame.h}px"></span><i class="fx sweat">💦</i><i class="fx bang">!</i><i class="fan"></i>${dup}`;
  }
  // What an agent is doing, as a pose name (X.poseOf). Variants have these
  // poses; ellen_joe has expressions, mapped by X.LEAD_POSES. Conflict and
  // refusals add an overlay.
  function setPose(el, n, pose) {
    const a = avatar(n), c = AV.chars[a.av], frame = a.av === AV.main ? X.LEAD_POSES[pose] || null : c.poses.includes(pose) ? pose : "idle";
    if (frame) el.querySelector(".spr").style.backgroundPosition = `${-c.poses.indexOf(frame) * AV.frame.w}px 0`;
    el.classList.toggle("sweat", pose === "conflict");
    el.classList.toggle("bang", pose === "refused" || pose === "failed");
  }
  const tag = (n) => `<span class="agent-tag" style="--ac:${avatar(n).color}">${mascot(n, true)}${esc(n)}</span>`;
  const capAvatars = (names, k = 3) => names.slice(0, k).map((n) => mascot(n, true)).join("") + (names.length > k ? `<span class="plus">+${names.length - k}</span>` : "");

  // ---------------------------------------------------------------- state
  const v = {
    W: null, FM, lineDiff: o.lineDiff, live: !!o.live, project: PROJECT, rightMode: {}, active: "main", follow: true, left: "history",
    acting: new Set(), lastLoc: null, colorOf, render: () => render(),
  };
  const files = createFiles(v);
  const pinned = {}, seenTabs = new Set(["main"]), OPEN_SDK = new Set();
  let sbLit = null, sbPulse = null, focusPane = null, cardTimer = null;
  const where = (n) => X.where(v.W, n), idle = (n) => X.idle(v.W, n);
  const lastHit = (loc) => (v.lastLoc === loc ? " hot" : "");
  const q = (sel) => root.querySelector(sel);

  // ---------------------------------------------------------------- tabs
  function renderTabs() {
    const W = v.W, { tabs, hidden } = X.visibleTabs(W, { pinned, active: v.active });
    const chip = (b) => {
      const B = W.branches[b], avs = capAvatars(X.agentsOn(W, b));
      const isNew = !seenTabs.has(b); seenTabs.add(b);
      return `<button class="tab${X.conflicted(W, b) ? " conflict" : ""}${isNew ? " enter" : ""}" role="tab" data-tab="${esc(b)}" aria-selected="${b === v.active}" style="--bc:var(${B.color})">
        <span class="dot"></span>${esc(b)}<span class="avs">${avs}</span><span class="pin${pinned[b] ? " on" : ""}" data-pin="${esc(b)}" title="Pin tab">${pinned[b] ? "📌" : "⌖"}</span></button>`;
    };
    const histAvs = capAvatars(Object.keys(W.agents).filter((n) => where(n).kind === "hist"));
    layout.tabs.innerHTML = `<button class="tab main" role="tab" data-tab="main" aria-selected="${v.active === "main"}"><span class="dot"></span>main<span class="avs">${histAvs}</span></button>`
      + tabs.map(chip).join("") + (hidden.length ? `<button class="tab more" data-more="1" title="${hidden.length} idle Branches">+${hidden.length}</button>` : "");
  }

  // ---------------------------------------------------------------- terminals
  function lineHtml(l, isNew, prefix) {
    const c = l.calls || [], key = String(l.t) + (l.text || "");
    const sdk = c.length ? `<button class="sdkbtn" data-sdk="${esc(key)}" title="Show the SDK call and inline Node script">sdk${c.length > 1 ? " ×" + c.length : ""}</button><div class="sdk">${c.map((x) => `<span class="code"><b>${esc(x.call)}</b> → ${esc(x.code)}<span class="tm">${esc(timingText(x.timing))}</span></span>${x.script ? `<pre>${esc(x.script)}</pre>` : ""}`).join("")}</div>` : "";
    const grp = l.group ? `<span class="grp" title="event group: these calls come from one script of ${esc(l.agent || "this agent")}">⧉ ${esc(l.group)}</span>` : "";
    return `<div class="ln${l.dim ? " dim" : ""}${isNew ? " new" : ""}${OPEN_SDK.has(key) ? " open" : ""}">${prefix}${grp}${l.text ? `<span class="cmd">${esc(l.text)}</span>` : ""}${cmdTime(c)}${sdk}</div>`
      + (l.out || []).map((x) => `<span class="out${x.c ? " " + x.c : ""}${isNew ? " ln new" : ""}">${esc(x.t)}</span>`).join("");
  }
  const inrow = (ph) => `<div class="inrow"><span class="prompt">you ›</span><span class="caret"></span><span>${esc(ph)}</span></div>`;

  // The right column of either tab: History or Files of that tab's head.
  function rightCol(tab, title, headId, graphHtml) {
    const mode = v.rightMode[tab] || "history", seg = `<span class="seg"><button class="h${mode === "history" ? " on" : ""}" data-right="${esc(tab)}:history">History</button><button class="f${mode === "files" ? " on" : ""}" data-right="${esc(tab)}:files">Files</button></span>`;
    return `<div class="col"><section class="term"><div class="thead">${seg}<span class="ttl">${esc(title)} @ ${esc(headId)}</span></div>
      ${mode === "history" ? `<div class="graphwrap" data-scroll>${graphHtml}</div>` : files.filesHtml(tab)}${tab === "main" ? files.storeHtml() : ""}</section></div>`;
  }
  function counts() {
    const all = Object.keys(v.W.agents), busy = all.filter((n) => !idle(n)).length;
    return `<button class="pill roster" data-roster="1" title="All agents"><span style="color:var(--green)">●</span> ${busy} working · <span>○</span> ${all.length - busy} idle</button>`;
  }
  function rosterMenu(anchor) {
    const W = v.W, label = (n) => { const l = where(n), A = W.agents[n];
      return l.kind === "ws" ? `${l.branch} · ${l.ws}` : l.kind === "fs" ? `${l.branch} · fs` : l.kind === "hist" ? "project terminal"
        : A.lastBranch ? `idle · last on ${A.lastBranch}` : "idle"; };
    const all = Object.keys(W.agents).sort((x, y) => idle(x) - idle(y));
    openMenu(anchor, "roster-menu", all.map((n) => { const l = where(n);
      return `<button ${l.branch ? `data-open="${esc(l.branch)}"` : ""}>${mascot(n, true)}<b style="color:${avatar(n).color}">${esc(n)}</b><span style="margin-left:auto;font:11px var(--mono);color:var(--text-3)">${esc(label(n))}</span></button>`; }).join(""), 300);
  }
  function openMenu(anchor, cls, inner, width) {
    closeMenu();
    const r = anchor.getBoundingClientRect(), base = root.getBoundingClientRect(), m = document.createElement("div");
    m.className = "menu " + cls; m.innerHTML = inner;
    m.style.top = r.bottom - base.top + 4 + "px";
    m.style.left = Math.max(8, (width ? r.right - width : r.left) - base.left) + "px";
    root.appendChild(m);
  }
  const closeMenu = () => { const m = root.querySelector(".menu"); if (m) m.remove(); };

  function mainView() {
    const W = v.W;
    const histLines = W.hist.map((l) => lineHtml(l, l.t === W.seq, tag(l.agent) + " ")).join("") || `<span class="out">no calls yet</span>`;
    const rows = W.order.slice().sort((x, y) => W.branches[y].last - W.branches[x].last).map((b) => {
      const B = W.branches[b], on = X.agentsOn(W, b), age = W.clock - B.last, bad = X.conflicted(W, b), busy = on.length || X.mounted(W, b);
      const st = bad ? `<span style="color:var(--red)">⚠</span>` : busy ? `<span style="color:var(--green)">●</span>` : B.published ? `<span style="color:var(--purple)">↑</span>` : `<span style="color:var(--text-3)">○</span>`;
      const meta = bad ? "conflict" : B.published ? `→ ${W.mainHead}` : age < 1 ? "now" : `${age}s`;
      // small avatars stand in the slot (placeCrabs, mode "row"); the head and age follow
      return `<div class="brow${busy ? "" : " idle"}${B.last === W.clock && W.seq ? " flash" : ""}" data-open="${esc(b)}" data-loc="row:${esc(b)}" style="--bc:var(${B.color})"><span class="st">${st}</span><span class="nm">${esc(b)}</span><span class="slot" data-slot="row:${esc(b)}"></span><span class="hd">${esc(B.head.replace("fork:", "") === b ? B.base : B.head)}</span><span class="meta">${meta}</span></div>`;
    }).join("") || `<div class="brow idle"><span class="meta">no Branches yet</span></div>`;
    const project = W.engine.s.project ? W.engine.s.project.name : "project";
    return `<div class="col"><section class="term${lastHit("hist")}" data-loc="hist"><div class="thead"><span class="kind history">PROJECT</span><span class="ttl">${W.mainHead ? `${esc(project)} · main @ ${W.mainHead}` : "no project yet"}</span></div>
        <div class="tbody" data-scroll="hist">${histLines}</div>${inrow("project · branch · sandbox create/close")}</section></div>
      <div class="col"><section class="term blist"><div class="thead"><span class="kind plain">BRANCHES</span><span class="ttl">${W.order.length} · by activity</span><span class="sp"></span>${counts()}</div>
        <div class="rows">${rows}</div></section>${sandboxesHtml()}</div>
      ${W.mainHead ? rightCol("main", "main", W.mainHead, graph(W, colorOf, null, "main", pinnedAt("main"))) : `<div class="col"><div class="empty">No project yet</div></div>`}`;
  }

  function branchView(b) {
    const W = v.W, B = W.branches[b];
    const fsLines = (W.fsLog[b] || []).map((l) => lineHtml(l, l.t === W.seq, tag(l.agent) + " ")).join("") || `<span class="out">no fs calls on ${esc(b)} yet</span>`;
    const headId = B.head.startsWith("fork:") ? B.base : B.head;
    const wss = Object.values(W.ws).filter((w) => w.branch === b).sort((x, y) => x.born - y.born);
    const panes = wss.map((w) => { const [sb, path] = w.id.split(":"); return `<section class="term${w.bad ? " bad" : lastHit("ws:" + w.id)}${w.born === W.seq ? " enter" : ""}${focusPane === w.id ? " focus" : ""}" data-loc="ws:${esc(w.id)}" data-sb="${esc(sb)}">
        <div class="thead"><span class="kind sandbox">WORKSPACE</span>${tag(w.agent)}<button class="sbchip" data-sbchip="${esc(sb)}" data-sbhl="${esc(sb)}" title="Runs in Sandbox ${esc(sb)} · hover: its other panes here · click: the Sandbox on the main tab">${esc(sb)}</button><span class="ttl">${esc(path.replace("/workspaces/", "ws/"))}</span><span class="sp"></span>${w.bad ? '<span class="pill warn">conflict</span>' : '<span class="pill run">mounted</span>'}</div>
        <div class="tbody" data-scroll>${w.lines.map((l) => lineHtml(l, l.t === W.seq, l.dim ? "" : '<span class="prompt">$ </span>')).join("")}</div>${files.overlayHtml(w)}</section>`; }).join("");
    const recent = Object.values(W.nodes).filter((n) => n.branch === b && n.kind === "commit").slice(-4).reverse()
      .map((n) => `${n.id}  ${esc(n.by || "?")}: ${esc(n.msg || "")}`).join("\n");
    const cols = wss.length > 2 ? "1fr 1fr" : "1fr";
    // scoped history: this Branch, its ancestors, and Branches made from it
    const scope = new Set([b]);
    for (let n = W.nodes[B.base]; n && n.branch; n = W.nodes[W.branches[n.branch].base]) scope.add(n.branch);
    for (const ob of W.order) { const OB = W.branches[ob]; if (W.nodes[OB.base] && W.nodes[OB.base].branch === b) scope.add(ob); const h = W.nodes[OB.head]; if (h && h.parents.some((p) => W.nodes[p] && W.nodes[p].branch === b)) scope.add(ob); }
    return `<div class="col"><section class="term${lastHit("fs:" + b)}" data-loc="fs:${esc(b)}"><div class="thead"><span class="kind fs">FS</span><span class="ttl">${esc(b)} @ ${headId}</span></div>
        <div class="tbody" data-scroll>${fsLines}</div>${inrow("read · grep · write · edit · mv · rm")}</section></div>
      <div class="col">${wss.length ? `<div class="panes" style="grid-template-columns:${cols}">${panes}</div>`
        : `<div class="empty"><div><h3>No Workspace mounted on ${esc(b)}</h3>fs calls edit this Branch directly.<br>A <code>sandbox.mount</code> opens a pane here.${recent ? `<div class="recent">${recent}</div>` : ""}</div></div>`}
        <div class="bench" data-loc="bench" style="border-top:0;min-height:48px;background:var(--term);border-radius:8px;box-shadow:0 0 0 1px var(--term-border)"><b>Recently here</b>${X.recentlyOn(W, b).length ? "" : `<span>nobody in the last ${RECENT_S} s</span>`}</div></div>
      ${rightCol(b, b, headId, graph(W, colorOf, scope, b, pinnedAt(b)))}`;
  }

  // ---------------------------------------------------------------- Sandboxes and status
  // The bottom bar, on every tab: running processes (a server matters wherever
  // you are). The Sandboxes themselves are listed on the main tab.
  function renderStatus() {
    const s = v.W.engine.s;
    const procs = s.sandboxOrder.filter((id) => !s.sandboxes[id].closed).flatMap((id) => s.sandboxes[id].procOrder.map((p) => s.sandboxes[id].processes[p]).filter((p) => p.status === "running").map((p) => ({ ...p, sb: id })));
    layout.status.innerHTML = `<span class="lbl">${procs.length ? "Running" : "No processes running"}</span>`
      + procs.map((p) => `<button class="chip proc" data-sbchip="${esc(p.sb)}" data-sbhl="${esc(p.sb)}" title="Running in ${esc(p.sb)}:${esc(p.path)} (operator process list) · click to show its Sandbox on main"><span class="d"></span>${esc(p.sb)} · ${esc(p.command)}</button>`).join("")
      + `<span class="sp"></span><span class="lbl">${esc(o.hint ?? "hover a History node")}</span>`;
  }
  // Main tab only. Sandboxes belong to the project, not to a Branch: one
  // Sandbox (one machine, one localhost) holds Workspaces of any Branch and any
  // agent. A group per open Sandbox: who created it, then a row per Workspace
  // (agent, Branch, base, uncommitted, current / stale / conflict, process).
  // A closed Sandbox leaves the list; its close stays in the project terminal.
  function sandboxesHtml() {
    const W = v.W, s = W.engine.s, open = s.sandboxOrder.filter((id) => !s.sandboxes[id].closed);
    const by = (id) => W.sbBy[id] || {};
    const forBranch = (id) => W.demo && Object.keys(W.demo.e.branchSandbox || {}).find((b) => W.demo.e.branchSandbox[b] === id);
    let nWs = 0, nProc = 0;
    const groups = open.map((id) => {
      const sb = s.sandboxes[id], n = by(id).made, br = forBranch(id);
      const rows = sb.wsOrder.filter((p) => sb.workspaces[p].mounted).map((p) => {
        const w = sb.workspaces[p], k = `${id}:${p}`, vw = W.ws[k], agent = vw ? vw.agent : null, B = W.branches[w.branch];
        const base = w.baseCommit || w.baseLayer, stale = B && (w.baseCommit || "fork:" + w.branch) !== B.head, dirty = W.engine.dirtyOf(w);
        const run = sb.procOrder.map((x) => sb.processes[x]).filter((x) => x.path === p && x.status === "running");
        nWs++; nProc += run.length;
        const state = vw && vw.bad ? `<span class="st bad">conflict</span>` : stale ? `<span class="st warn">stale</span>` : `<span class="st">current</span>`;
        return `<button class="dws" data-dws="${esc(k)}" title="Open ${esc(w.branch)} at this Workspace">${agent ? mascot(agent, true) : '<span class="noag">?</span>'}<span class="nm">${esc(p.replace("/workspaces/", "ws/"))}</span>`
          + `<span class="bchip" style="--bc:${B ? `var(${B.color})` : "var(--text-3)"}">${esc(w.branch)}</span><span class="at">@${esc(base)}</span>${dirty ? `<span class="st">+${dirty}</span>` : ""}${state}${run.length ? `<span class="st run">● ${esc(run[0].command)}</span>` : ""}</button>`;
      });
      const branches = new Set(sb.wsOrder.filter((p) => sb.workspaces[p].mounted).map((p) => sb.workspaces[p].branch));
      const made = (n ? (by(id).service ? `${n}'s SDK service Sandbox` : `created by ${n}`) : "created outside dsh") + (br ? ` · ${br}'s agents share it` : "");
      return `<div class="sbg" data-sbcol="${esc(id)}" data-sbhl="${esc(id)}"><div class="sbh"><span class="d${rows.length ? "" : " idle"}"></span><b>${esc(id)}</b><span class="mk">${n ? mascot(n, true) : ""}${esc(made)}</span><span class="sp"></span>`
        + `<span class="ct">${rows.length ? `${rows.length} Workspace${rows.length === 1 ? "" : "s"}` : "idle"}</span></div>`
        + (branches.size > 1 ? `<div class="dnote">${branches.size} Branches share this machine and its localhost</div>` : "") + rows.join("") + `</div>`;
    });
    return `<section class="term sblist"><div class="thead"><span class="kind sandbox">SANDBOXES</span><span class="ttl">${open.length} · ${nWs} Workspace${nWs === 1 ? "" : "s"} · ${nProc} process${nProc === 1 ? "" : "es"}</span></div>
      <div class="tbody">${groups.join("") || `<span class="out">no open Sandboxes · any agent may create one (sandbox.create)</span>`}</div></section>`;
  }
  // Hovering anything tagged with a Sandbox lights it up: its group on main,
  // and in a Branch tab every pane on that machine.
  function lightSandbox(id) {
    if (id === sbLit) return;
    sbLit = id;
    for (const el of root.querySelectorAll(".sblit")) el.classList.remove("sblit");
    if (id) for (const el of root.querySelectorAll(`[data-sbcol="${CSS.escape(id)}"], .term[data-sb="${CSS.escape(id)}"]`)) el.classList.add("sblit");
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
      : `<div class="graphwrap" data-scroll>${W.mainHead ? graph(W, colorOf, null, "main", at) : `<div class="empty">No history yet</div>`}</div>`;
    return `<div class="col"><section class="term"><div class="thead"><span class="seg">${seg("history", "History")}${seg("branches", "Branches")}</span><span class="sp"></span><span class="ttl">${W.order.length} Branch${W.order.length === 1 ? "" : "es"}</span></div>${left}</section></div>
      <div class="split" data-split role="separator" aria-orientation="vertical" aria-label="Resize History and Files"></div>
      <div class="col"><section class="term"><div class="thead"><span class="ptitle">Files at ${esc(where)}</span></div>${W.mainHead ? files.filesHtml("main") : ""}</section></div>`;
  }
  function render() {
    const W = v.W;
    if (!W) return;
    if (PROJECT) {
      const keep = [".ftree", ".fview", ".graphwrap"].map((sel) => { const el = layout.work.querySelector(sel); return [sel, el ? el.scrollTop : 0]; });
      layout.work.innerHTML = projectView();
      for (const [sel, top] of keep) { const el = layout.work.querySelector(sel); if (el) el.scrollTop = top; }
      return;
    }
    renderStatus();
    const work = layout.work;
    const keepScroll = [".ftree", ".fview", ".sblist .tbody"].map((sel) => { const el = work.querySelector(sel); return [sel, el ? el.scrollTop : 0]; });
    if (v.active !== "main" && !W.branches[v.active]) v.active = "main";
    renderTabs();
    work.className = "work " + (v.active === "main" ? "mainview" : "branchview") + ((v.rightMode[v.active] === "files" && files.wide(v.active)) ? " wide" : "");
    work.innerHTML = v.active === "main" ? mainView() : branchView(v.active);
    // terminals and History follow their newest line; lists (Sandboxes) keep their place
    for (const el of work.querySelectorAll(".tbody, .graphwrap")) if (!el.closest(".sblist")) el.scrollTop = el.scrollHeight;
    for (const [sel, top] of keepScroll) { const el = work.querySelector(sel); if (el) el.scrollTop = top; }
    if (sbLit) { const id = sbLit; sbLit = null; lightSandbox(id); } // the redraw dropped the highlight
    if (sbPulse) { const g = work.querySelector(`[data-sbcol="${CSS.escape(sbPulse)}"]`); sbPulse = null; if (g) { g.classList.add("pulse"); g.scrollIntoView({ block: "nearest" }); } }
    requestAnimationFrame(placeCrabs);
  }

  // ---------------------------------------------------------------- hover card (tui.html)
  // What a History node is, who made it, and which Workspaces are mounted on it.
  function wsRows(name, nodeId) {
    const W = v.W, s = W.engine.s, head = s.branches[name].head || "fork:" + name, rows = [];
    for (const id of s.sandboxOrder) for (const p of s.sandboxes[id].wsOrder) {
      const w = s.sandboxes[id].workspaces[p];
      if (!w.mounted || w.branch !== name || (w.baseCommit || "fork:" + name) !== nodeId) continue;
      const k = `${id}:${p}`, dirty = W.engine.dirtyOf(w), stale = nodeId !== head, agent = (W.panes[k] || {}).agent;
      rows.push(`<button class="ws${stale ? " stale" : ""}" data-open="${esc(name)}" title="Open the ${esc(name)} tab"><span class="d"></span>${agent ? mascot(agent, true) : ""}${esc(k)}${dirty ? ` · +${dirty}` : ""}<small>${stale ? `stale · head ${head.replace("fork:", "")}` : "current"}</small></button>`);
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

  // ---------------------------------------------------------------- avatars
  function crabEl(n, ghost) {
    const key = ghost ? `${n}|${ghost}` : n;
    let el = overlay.querySelector(ghost ? `[data-ghost="${CSS.escape(key)}"]` : `[data-crab="${CSS.escape(n)}"]`);
    if (!el && ghost) {
      // a ghost appears where it stands, without walking there
      el = document.createElement("div"); el.className = "crab ghost gone"; el.dataset.ghost = key;
      el.style.setProperty("--c", avatar(n).color);
      el.innerHTML = mascot(n) + `<span class="name">${esc(n)}</span>`;
      el.title = `${n} also holds this Workspace`;
      overlay.appendChild(el);
    } else if (!el) {
      el = document.createElement("div"); el.className = "crab idle"; el.dataset.crab = n; el.dataset.av = avatar(n).av;
      el.style.setProperty("--c", avatar(n).color);
      el.innerHTML = mascot(n) + `<span class="name">${esc(n)}</span>`;
      el.style.transform = `translate(${overlay.clientWidth / 2}px, ${overlay.clientHeight - 120}px)`;
      overlay.appendChild(el);
    }
    return el;
  }
  // The element an agent stands on in the current tab, or null when this tab
  // has nothing to say about it (idle on main, idle elsewhere on a Branch tab).
  const spotEl = (spot) => !spot ? null : spot.loc ? q(`[data-loc="${CSS.escape(spot.loc)}"]`) : layout.tabs.querySelector(`[data-tab="${CSS.escape(spot.tab)}"]`) || (spot.mode === "chip" && spot.tab !== "main" ? layout.tabs.querySelector("[data-more]") : null);
  function targetOf(n) {
    const spot = X.spotOf(v.W, n, v.active, X.recentlyOn(v.W, v.active));
    return spot ? { el: spotEl(spot), mode: spot.mode } : { el: null };
  }
  // Fan-out (X.fanOf): an agent holding several Workspaces stands where its
  // last call ran; each other Workspace gets a faint copy, and it shows ×N.
  function ghostTarget(w) {
    const spot = X.ghostSpot(v.active, w);
    return { el: spot.loc ? q(`[data-loc="${CSS.escape(spot.loc)}"]`) : layout.tabs.querySelector(`[data-tab="${CSS.escape(spot.tab)}"]`), mode: spot.mode };
  }
  function placeCrabs() {
    const W = v.W;
    if (!W || !root.isConnected) return;
    const groups = new Map(), base = overlay.getBoundingClientRect();
    // agents stand within the work area: not over the tabs strip or the status bar
    const view = { top: layout.work.getBoundingClientRect().top - base.top, bottom: layout.status.getBoundingClientRect().top - base.top };
    for (const b of overlay.querySelectorAll(".crowd")) b.remove();
    // after a rewind, agents not spawned yet at this step have no avatar
    for (const el of overlay.querySelectorAll(".crab")) if (!W.agents[el.dataset.crab || el.dataset.ghost.split("|")[0]]) el.classList.add("gone");
    const ghosts = new Set(), acting = v.acting;
    // the acting agent first, so a capped host never hides the one doing the work
    const names = Object.keys(W.agents).sort((x, y) => acting.has(y) - acting.has(x));
    const join = (t, item) => { if (!groups.has(t.el)) groups.set(t.el, { mode: t.mode, list: [] }); groups.get(t.el).list.push(item); };
    const fans = {};
    for (const n of names) {
      const el = crabEl(n), t = targetOf(n), f = (fans[n] = X.fanOf(W, n));
      el.classList.toggle("fanned", f.n > 1); el.querySelector(".fan").textContent = `×${f.n}`;
      if (!t.el) el.classList.add("gone"); else join(t, { n });
    }
    // ghosts after everyone real, so a capped host keeps the real avatars
    for (const n of names) if (fans[n].n > 1) for (const w of fans[n].others) {
      const t = ghostTarget(w), main = targetOf(n).el;
      if (!t.el || t.el === main) continue;
      join(t, { n, ghost: w.id, w }); ghosts.add(`${n}|${w.id}`);
    }
    for (const el of overlay.querySelectorAll("[data-ghost]")) if (!ghosts.has(el.dataset.ghost)) el.classList.add("gone");
    for (const [host, { mode, list }] of groups) {
      // a Branch row's avatars stand small in its slot, so the list stays compact
      const slot = mode === "row" ? host.querySelector("[data-slot]") : null;
      const hr = host.getBoundingClientRect(), sr0 = slot ? slot.getBoundingClientRect() : hr, cap = mode === "pane" ? 1 : CAP[mode];
      const r = { left: hr.left - base.left, right: hr.right - base.left, top: hr.top - base.top, bottom: hr.bottom - base.top, height: hr.height };
      const sr = { left: sr0.left - base.left, top: sr0.top - base.top, height: sr0.height };
      list.forEach(({ n, ghost, w }, k) => {
        const el = crabEl(n, ghost);
        if (k >= cap) { el.classList.add("gone"); return; }
        let x, y;
        // the sprite box is 36x48 (small: drawn at half size, centred low in it)
        if (mode === "chip") { x = r.right - 33; y = r.bottom - 50; }
        else if (mode === "row") { x = sr.left + k * 22 - 9; y = sr.top + sr.height / 2 - 36; }
        else if (mode === "bench") { x = r.left + 116 + k * 40; y = r.top + r.height / 2 - 26; }
        else { x = r.right - 48 - k * 42; y = r.bottom - 89; }
        // a host scrolled out of the work area hides its agents instead of drawing over the chrome
        if (mode !== "chip" && (y + 48 > view.bottom || y + 24 < view.top)) { el.classList.add("gone"); return; }
        el.classList.toggle("small", mode === "chip" || mode === "row");
        if (ghost) {
          if (!el.dataset.pos) { el.style.transition = "none"; void el.offsetWidth; } // first placement: no slide in
          el.dataset.pos = `${Math.round(x)},${Math.round(y)}`; el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
          if (el.style.transition) { void el.offsetWidth; el.style.transition = ""; }
          el.classList.remove("gone");
          setPose(el, n, X.ghostPose(W, w)); // its conflict, its server, or work
          return;
        }
        el.classList.remove("gone");
        const pose = X.poseOf(W, n, mode, acting.has(n));
        el.classList.toggle("idle", pose === "idle" || pose === "sleep");
        const pos = `${Math.round(x)},${Math.round(y)}`;
        if (el.dataset.pos !== pos) {
          // walking: the run pose (ellen_joe hops), facing where it goes
          const from = (el.dataset.pos || pos).split(",").map(Number);
          el.dataset.pos = pos; el.style.transform = `translate(${x}px,${y}px)`;
          el.classList.toggle("flip", x > from[0] + 2);
          el.classList.add("walk"); setPose(el, n, "run");
          clearTimeout(el.wt); el.wt = setTimeout(() => { el.classList.remove("walk", "flip"); setPose(el, n, el.dataset.pose); }, 560);
        }
        el.dataset.pose = pose;
        if (!el.classList.contains("walk")) setPose(el, n, pose);
      });
      if (list.length > cap && mode !== "chip") {
        const b = document.createElement("div"), k = cap;
        b.className = "crowd"; b.textContent = `+${list.length - cap}`;
        const x = mode === "row" ? sr.left + k * 22 + 2 : mode === "bench" ? r.left + 116 + k * 40 + 4 : r.right - 48 - k * 42 + 10;
        const y = mode === "row" ? sr.top + sr.height / 2 - 9 : mode === "bench" ? r.top + r.height / 2 - 8 : r.bottom - 70;
        b.style.transform = `translate(${x}px,${y}px)`; overlay.appendChild(b);
      }
    }
  }
  function bubbleOn(n, text, cls) {
    const el = overlay.querySelector(`[data-crab="${CSS.escape(n)}"]`); if (!el) return;
    setTimeout(() => {
      const r = el.getBoundingClientRect(), base = overlay.getBoundingClientRect(), b = document.createElement("div");
      b.className = "bubble " + (cls || ""); b.textContent = text;
      b.style.left = r.left - base.left + r.width / 2 + "px"; b.style.top = r.top - base.top - 2 + "px";
      overlay.appendChild(b); setTimeout(() => b.remove(), 2000);
    }, 560);
  }
  function flyBlock(n, nodeId, color) {
    const crab = overlay.querySelector(`[data-crab="${CSS.escape(n)}"]`), target = q(`[data-node="${CSS.escape(nodeId)}"]`);
    if (!crab || !target) return;
    setTimeout(() => {
      const a = crab.getBoundingClientRect(), z = target.getBoundingClientRect(), base = overlay.getBoundingClientRect(), b = document.createElement("div");
      b.className = "block"; b.style.background = color; b.style.left = a.left - base.left + 15 + "px"; b.style.top = a.top - base.top + 8 + "px";
      overlay.appendChild(b);
      requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transform = `translate(${z.left + z.width / 2 - a.left - 21}px,${z.top + z.height / 2 - a.top - 14}px) scale(.7)`; b.style.opacity = "0"; }));
      setTimeout(() => b.remove(), 900);
    }, 520);
  }
  /** The call that just happened, by `agent`: its bubble and, when it made a node, a block flying there. */
  function animate(agent) {
    const W = v.W;
    if (!W || !W.last || agent === "dsh") return;
    const b = bubbleOf(W.last);
    if (b) bubbleOn(agent, b[0], b[1]);
    const id = W.last.node;
    if (id && W.nodes[id]) flyBlock(agent, id, getComputedStyle(root).getPropertyValue(W.nodes[id].branch ? W.branches[W.nodes[id].branch].color : "--purple").trim());
  }

  // ---------------------------------------------------------------- events
  const setFollow = (on) => {
    v.follow = on;
    if (layout.follow) layout.follow.classList.toggle("on", on);
    if (o.onFollow) o.onFollow(on);
  };
  const openTab = (tab) => { v.active = tab; setFollow(false); closeMenu(); render(); };
  const onTabs = (e) => {
    closeMenu();
    const pin = e.target.closest("[data-pin]");
    if (pin) { const b = pin.dataset.pin; pinned[b] = !pinned[b]; e.stopPropagation(); render(); return; }
    const more = e.target.closest("[data-more]");
    if (more) {
      openMenu(more, "", X.visibleTabs(v.W, { pinned, active: v.active }).hidden.map((b) => `<button data-open="${esc(b)}"><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(${v.W.branches[b].color})"></span>${esc(b)}</button>`).join(""));
      e.stopPropagation(); return;
    }
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
    const r = e.target.closest("[data-right]");
    if (r) { const [t, m] = r.dataset.right.split(":"); v.rightMode[t] = m; render(); return; }
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
    const work = layout.work, box = work.getBoundingClientRect();
    const move = (m) => { const share = Math.min(75, Math.max(25, ((m.clientX - box.left) / box.width) * 100)); work.style.setProperty("--hist", share.toFixed(1) + "%"); };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); work.classList.remove("dragging"); };
    work.classList.add("dragging");
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  };
  const place = () => { if (!PROJECT) placeCrabs(); };
  root.addEventListener("click", onClick);
  root.addEventListener("mouseover", onOver);
  layout.work.addEventListener("mouseout", onOut);
  card.addEventListener("mouseenter", onCardEnter);
  card.addEventListener("mouseleave", onCardLeave);
  root.addEventListener("change", onChange);
  layout.work.addEventListener("pointerdown", onSplit);
  addEventListener("resize", place);
  // narrow layouts scroll a column: avatars stay with their hosts
  root.addEventListener("scroll", place, { capture: true, passive: true });
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
    /** A line for the strip (standalone layout): where the view's data comes from. */
    set note(text) { if (layout.note) layout.note.textContent = text; },
    /** Shows History or Files in a tab's right column. */
    setRight(tab, mode) { v.rightMode[tab] = mode; },
    avatar, render, placeCrabs, animate, files,
    dispose() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("mouseover", onOver);
      layout.work.removeEventListener("mouseout", onOut);
      root.removeEventListener("change", onChange);
      layout.work.removeEventListener("pointerdown", onSplit);
      removeEventListener("resize", place);
      root.removeEventListener("scroll", place, { capture: true });
      if (resize) resize.disconnect();
      clearTimeout(cardTimer);
      overlay.remove(); card.remove();
    },
  };
}
