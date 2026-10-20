// The Files pane (tui.html's), one per tab. The subject is the tab's Branch
// (or main) at its latest head or at one fixed point; the base is what it is
// compared with. Reads go through the files helpers (simulation_engine/files.js)
// on the engine state, so they work on any engine that has trees.
import { iconOf } from "./fileicons.js";
import { highlightLines, langOf } from "./highlight.js";
import { bar, esc, fmtBytes, ratio } from "./util.js";

const COLLAPSE = ["/node_modules", "/.git", "/.next"];
const INODE_BYTES = 73; // one inode value row; directory entries and pooling ignored
const bytesOf = (t) => new TextEncoder().encode(t || "").length;
// Where a changed path belongs in the Changes list: dependencies and build
// output fold into one row each, so the source changes come first.
const DEPS = /^\/(node_modules\/|package-lock\.json$|yarn\.lock$|pnpm-lock\.yaml$)/, BUILD = /^\/(\.next|dist|build|out|\.turbo|coverage)\//, VCS = /^\/\.git\//;
const groupOf = (path) => (DEPS.test(path) ? "deps" : BUILD.test(path) ? "build" : VCS.test(path) ? "vcs" : "src");
// a file's lines, coloured by its language (highlight.js) when it has one
const codeLines = (text, path) => {
  const lit = path ? highlightLines(text, path) : null;
  return text.split("\n").map((t, i) => `<div class="cl"><span class="no">${i + 1}</span><span class="tx">${(lit ? lit[i] : esc(t)) || " "}</span></div>`).join("");
};
// one line coloured on its own (a diff's): a construct across lines is coloured plainly
const litLine = (t, path) => (t ? (highlightLines(t, path)?.[0] ?? esc(t)) : "");
const CHEV = (open) => `<svg class="chev${open ? " open" : ""}" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3.5 2 6.5 5 3.5 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// indent guides: one faint rule per folder level
const indent = (depth) => (depth ? `<span class="ind" style="width:${depth * 14}px"></span>` : "");

/**
 * @param {object} v the view: W, FM (files helpers), lineDiff, live,
 *   rightMode, active, colorOf(agent), render()
 */
export function createFiles(v) {
  const FILES = {};
  const W = () => v.W, FM = v.FM;
  const laneColor = (b) => (!b || b === "main" ? "var(--purple)" : W().branches[b] ? `var(${W().branches[b].color})` : "var(--text-3)");
  const defaultBase = (tab) => (tab === "main" ? "" : "fork:" + tab);
  // list: "changes" (grouped, against the base) or "all" (the tree); path: the
  // open file (the file page) or null (the list); wide: the column takes half the window.
  const filesOf = (tab) => (FILES[tab] ||= { at: "latest", base: defaultBase(tab), path: null, toggled: [], mode: "view", list: "changes", sdk: false, wide: false });
  const subjectOf = (tab, p) => (p.at === "latest" ? tab : p.at);
  function pointLabel(ref) {
    if (!ref) return "nothing";
    if (ref === "main" || W().branches[ref]) return `${ref} · latest`;
    if (ref.startsWith("fork:")) return `${ref.slice(5)} · fork point`;
    const n = W().nodes[ref];
    return n ? `${n.branch || "main"} · ${ref}` : ref;
  }
  function atSelect(tab, p) {
    const s = W().engine.s, o = (val, label) => `<option value="${esc(val)}"${val === p.at ? " selected" : ""}>${esc(label)}</option>`;
    // a project page looks at any node; a lane's tab, at its own
    const commitsOf = (lane) => Object.values(s.commits).filter((c) => lane === null || c.branch === lane).sort((a, b) => b.slot - a.slot).map((c) => o(c.id, `${lane === null ? c.branch + " · " : ""}${c.id} · ${c.message || c.via}`)).join("");
    const opts = tab === "main"
      ? Object.values(s.layers).sort((a, b) => b.slot - a.slot).map((l) => o(l.id, `${l.id} · ${l.sourceCommit ? "from " + l.sourceCommit : "init"}`)).join("") + (v.project ? commitsOf(null) : "")
      : commitsOf(tab) + o("fork:" + tab, `fork point · ${s.branches[tab].from}`);
    const live = p.at === "latest";
    return `<span class="sync ${live ? "live" : "pinned"}" title="${live ? "Follows the head: new Commits show up as they land" : "Fixed at one point in history"}">${live ? "●" : "⊙"}</span><select class="fsel" data-fat="${esc(tab)}" title="What you look at: latest, or a fixed point">${o("latest", `${tab} @ ${tab === "main" ? W().mainHead : W().branches[tab].head.replace("fork:", "fork ")}`)}${opts}</select>`;
  }
  // What the point is compared with: parent, fork point, main, none, or a node picked in History.
  function baseSelect(tab, p, subject) {
    const parent = FM.parentRef(W().engine, subject) || "", choices = [];
    if (parent) choices.push([parent, `vs parent · ${parent.replace("fork:", "fork ")}`]);
    if (tab !== "main") choices.push(["fork:" + tab, "vs fork point"], ["main", "vs main"]);
    if (p.base && !choices.some(([val]) => val === p.base)) choices.push([p.base, `vs ${pointLabel(p.base)}`]);
    choices.push(["", "no compare"]);
    return `<select class="fsel cmp" data-fbasesel="${esc(tab)}" title="What it is compared with">${choices.map(([val, l]) => `<option value="${esc(val)}"${val === p.base ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  }
  function changesHtml(tab, p, sv, bv, ch, flash) {
    const files = Object.entries(ch.files).filter(([path]) => ((sv.tree[path] || bv.tree[path]) || {}).type === "file");
    if (!files.length) return `<div class="fempty">No file differences between ${esc(pointLabel(p.base))} and ${esc(pointLabel(subjectOf(tab, p)))}.</div>`;
    const row = (path, k, label, pad) => `<div class="frow${flash.has(path) ? " flash" : ""}" data-fopen="${esc(path)}" style="padding-left:${pad}px" title="${esc(path)}">${iconOf(path.slice(path.lastIndexOf("/") + 1), "file")}<span class="nm">${esc(label)}</span><span class="fb ${k}">${k}</span></div>`;
    const by = { src: [], build: [], deps: [], vcs: [] };
    for (const f of files) by[groupOf(f[0])].push(f);
    // source: by folder, root files first
    const dirs = new Map();
    for (const [path, k] of by.src.sort(([a], [b]) => a.localeCompare(b))) { const d = path.slice(0, path.lastIndexOf("/") + 1); (dirs.get(d) || dirs.set(d, []).get(d)).push([path, k]); }
    let html = "";
    for (const [d, list] of [...dirs].sort(([a], [b]) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)))) {
      if (d !== "/") html += `<div class="fdir">${iconOf(d.slice(0, -1).split("/").pop(), "dir", true)}<span>${esc(d.slice(1))}</span><span class="fr">${list.length}</span></div>`;
      html += list.map(([path, k]) => row(path, k, path.slice(d.length), d === "/" ? 10 : 22)).join("");
    }
    const lww = sv.tree["/.lww"] ? " · .lww: newest wins" : "";
    const fold = (g, label, hint) => {
      const list = by[g]; if (!list.length) return "";
      const open = p.toggled.includes("group:" + g), roots = [...new Set(list.map(([path]) => path.split("/")[1]))].join(", ");
      return `<div class="fgroup" data-fgroup="${esc(tab)}|${g}">${CHEV(open)}<b>${label}</b><span class="nm">${esc(roots)}</span><span class="fr">${list.length} file${list.length === 1 ? "" : "s"}${hint}</span></div>`
        + (open ? list.sort(([a], [b]) => a.localeCompare(b)).map(([path, k]) => row(path, k, path.slice(1), 22)).join("") : "");
    };
    return `<div class="flist">${html || `<div class="fempty">Only generated files and dependencies changed.</div>`}${fold("build", "build output", lww)}${fold("deps", "dependencies", "")}${fold("vcs", "version control", "")}</div>`;
  }
  const dirOpen = (p, path) => (COLLAPSE.includes(path) ? p.toggled.includes(path) : !p.toggled.includes(path));
  function treeHtml(p, subj, base, ch, dir, depth, flash) {
    return FM.listBoth(subj, base, dir).map((e) => {
      const open = e.type === "dir" && dirOpen(p, e.path), k = ch && ch.files[e.path], roll = ch && !k && ch.dirs[e.path];
      const row = `<div class="frow${e.type === "dir" ? " dir" : ""}${e.path === p.path ? " sel" : ""}${e.gone ? " gone" : ""}${flash.has(e.path) ? " flash" : ""}" data-ftree="${esc(e.path)}" data-ftype="${e.type}" title="${esc(e.path)}">
        ${indent(depth)}<span class="car">${e.type === "dir" ? CHEV(open) : ""}</span>${iconOf(e.name, e.type, open)}<span class="nm">${esc(e.name)}</span>${k ? `<span class="fb ${k}">${k}</span>` : roll ? `<span class="fr" title="changed entries inside">${roll}</span>` : ""}</div>`;
      return row + (open ? treeHtml(p, subj, base, ch, e.path, depth + 1, flash) : "");
    }).join("");
  }
  function sdkCalls(subject, p) {
    const ref = JSON.stringify(subject), path = JSON.stringify(p.path || "/");
    const calls = [`layerfs.fs.list(${ref}, dir, pageSize, pagePos) // per open folder`];
    if (p.base) calls.push(`layerfs.branch.diff_branches(${JSON.stringify(p.base)}, ${ref}, pageSize, pagePos)`);
    if (p.path) {
      if (p.mode === "view") calls.push(`layerfs.fs.read(${ref}, ${path}, startLine, endLine)`);
      if (p.mode === "blame") calls.push(`layerfs.fs.blame(${ref}, ${path}, fromLine)`);
      if (p.mode === "diff" && p.base) calls.push(`layerfs.fs.diff_files(${JSON.stringify(p.base)}, ${path}, ${ref}, ${path})`);
      calls.push(`operator.files.stats(${ref}, ${path})`, `operator.files.history(${ref}, ${path}, pageSize, pagePos)`);
    }
    return calls.map(esc).join("\n");
  }
  // Per-file revisions, dedupe and compression: sim estimates, or the
  // product's operator.files.stats/history and fs.blame (engine.fileReport).
  // A fork point is sent as the node it was forked from.
  const reportRef = (subject) => (subject.startsWith("fork:") ? (FM.resolveRef(W().engine, subject) || {}).node || subject : subject);
  function fileStats(subject, path) {
    if (v.live) {
      const f = W().engine.fileReport(reportRef(subject), path), k = { added: "A", modified: "M", deleted: "D", removed: "D" };
      return { ...f, rows: f.rows.map((r) => ({ ...r, change: k[r.change] || r.change })) };
    }
    const revs = FM.history(W().engine, subject, path), seen = new Set();
    let logical = 0, unique = 0, stored = 0, pending = false;
    const rows = [...revs].reverse().map((r) => {
      if (r.content == null) return { ...r, size: 0, added: 0, stored: 0 };
      const size = bytesOf(r.content), fresh = !seen.has(r.content);
      logical += size;
      let z = 0;
      if (fresh) { seen.add(r.content); unique += size; z = W().engine.storedSize(r.content); if (z == null) { pending = true; z = size; } stored += z; }
      return { ...r, size, added: fresh ? size : 0, stored: fresh ? z : 0 };
    }).reverse();
    return { rows, revisions: revs.length, logical, unique, stored, pending, metadata: revs.length * INODE_BYTES };
  }
  function fileStatsHtml(subject, p, sv) {
    const e = sv.tree[p.path];
    if (!e || e.type !== "file") return "";
    const f = fileStats(subject, p.path), cur = v.live ? f.size : e ? bytesOf(e.content) : null, size = cur == null ? (e ? "…" : "deleted here") : fmtBytes(cur);
    // one line; the full numbers are in the tooltip
    const tip = `${f.revisions ?? "?"} revisions (saved versions where this file changed) · current ${size} · history ${fmtBytes(f.logical)} logical · unique ${fmtBytes(f.unique)} (dedupe ${ratio(f.logical, f.unique)})`
      + (v.live ? ` · ${f.error || "product: operator.files.stats and files.history; physical per-file attribution not reported"}` : ` · stored ≈ ${fmtBytes(f.stored)} (compression ${ratio(f.unique, f.stored)}, sim: deflate as a stand-in for zstd) · metadata ≈ ${fmtBytes(f.metadata)}`);
    return `<span class="fstat" title="${esc(tip)}"><b>${f.revisions ?? "…"}</b> rev · ${size}${v.live ? "" : ` · ${ratio(f.unique, f.stored)}`}${f.pending ? " · …" : ""}</span>`;
  }
  function fileHistoryHtml(subject, path) {
    const f = fileStats(subject, path);
    if (v.live && f.pending) return `<div class="fempty">Loading the file's history…</div>`;
    if (!f.rows.length) return `<div class="fempty">${esc(f.error || (f.replay ? "File history is not in the trace." : `${path} has no saved versions behind ${pointLabel(subject)}.`))}</div>`;
    const rows = f.rows.map((r) => `<tr><td><span class="bch" style="--bc:${r.node.kind === "layer" ? "var(--purple)" : laneColor(r.node.branch)}" data-fblame="${r.node.id}" title="${esc(r.node.id)} · click to diff with its parent">${r.node.id}</span></td><td><span class="fb ${r.change}">${r.change}</span></td>
      <td class="n">${r.content == null ? "–" : fmtBytes(r.size)}</td><td class="n${r.added ? "" : " zero"}">${r.content == null ? "–" : r.added == null ? "not reported" : r.added ? "+" + fmtBytes(r.added) : "reused"}</td>${v.live ? "" : `<td class="n${r.stored ? "" : " zero"}">${r.stored ? fmtBytes(r.stored) : "–"}</td>`}</tr>`).join("");
    return `<div class="fsum">${f.revisions} revision${f.revisions === 1 ? "" : "s"} behind <b>${esc(pointLabel(subject))}</b>, newest first · new = bytes this version added (an identical earlier version is reused)${f.hasMore ? " · first 50 shown" : ""}</div>
      <table class="frev"><tr><th>version</th><th></th><th class="n">size</th><th class="n">new</th>${v.live ? "" : '<th class="n">stored ≈</th>'}</tr>${rows}</table>`;
  }
  function viewHtml(subject, p, sv, bv) {
    const se = sv.tree[p.path], be = bv && bv.tree[p.path];
    if (p.mode === "view") {
      if (!se) return `<div class="fempty">${esc(p.path)} does not exist at ${esc(pointLabel(subject))}${be ? " (deleted; switch to Diff to see what was removed)" : ""}.</div>`;
      return se.type === "file" ? (se.content == null ? `<div class="fempty">${esc(se.note || "Content not loaded.")}</div>` : `<div class="code">${codeLines(se.content, p.path)}</div>`) : `<div class="fempty">${esc(p.path)} is a folder.</div>`;
    }
    if (p.mode === "history") return fileHistoryHtml(subject, p.path);
    if (p.mode === "blame") {
      let b;
      if (v.live) {
        // The product's fs.blame: each line names the Commit or Layer it came from.
        const report = fileStats(subject, p.path);
        if (!report.blame) return `<div class="fempty">${esc(report.error || (report.replay ? "Blame is not in the trace." : "Loading attributed lines…"))}</div>`;
        b = { ...report.blame, versions: report.revisions, lines: report.blame.lines.map((l) => ({ ...l, origin: { id: l.commit, kind: l.commit.startsWith("L") ? "layer" : "commit", branch: (W().engine.s.commits[l.commit] || {}).branch } })) };
      } else b = FM.blame(W().engine, subject, p.path);
      if (!b) return `<div class="fempty">${esc(p.path)} does not exist at ${esc(pointLabel(subject))}.</div>`;
      let last = null;
      const lit = highlightLines(b.lines.map((ln) => ln.text).join("\n"), p.path);
      const rows = b.lines.map((ln, i) => {
        const o = ln.origin, first = o.id !== last; last = o.id;
        return `<div class="cl"><span class="bch${first ? "" : " cont"}" style="--bc:${o.kind === "layer" ? "var(--purple)" : laneColor(o.branch)}" data-fblame="${o.id}" title="${esc(o.id)} · ${esc(W().attrib[o.id] || "")} · click to diff with its parent">${first ? o.id : ""}</span><span class="no">${ln.n}</span><span class="tx">${(lit ? lit[i] : esc(ln.text)) || " "}</span></div>`;
      }).join("");
      return `<div class="fsum">Blame at <b>${esc(pointLabel(subject))}</b> · ${v.live ? "product attribution (fs.blame)" : `composed from ${b.versions} saved versions`}</div><div class="code">${rows}</div>`;
    }
    if (!bv) return `<div class="fempty">Diff needs something to compare with: pick it next to the point above.</div>`;
    if (!se && !be) return `<div class="fempty">${esc(p.path)} is in neither side.</div>`;
    const before = be && be.type === "file" ? be.content : null, after = se && se.type === "file" ? se.content : null;
    if (before === after) return `<div class="fsum">No changes between <b>${esc(pointLabel(p.base))}</b> and <b>${esc(pointLabel(subject))}</b>.</div><div class="code">${codeLines(after || "", p.path)}</div>`;
    let o = 0, n = 0;
    const rows = v.lineDiff(before ?? "", after ?? "").map((d) => {
      if ((before == null && d.op === "-") || (after == null && d.op === "+")) return "";
      const on = d.op === "+" ? "" : ++o, nn = d.op === "-" ? "" : ++n;
      return `<div class="cl ${d.op === "+" ? "add" : d.op === "-" ? "del" : ""}"><span class="no">${on}</span><span class="no">${nn}</span><span class="op">${d.op === " " ? "" : d.op}</span><span class="tx">${litLine(d.text, p.path) || " "}</span></div>`;
    }).join("");
    return `<div class="fsum">${before == null ? "added" : after == null ? "deleted" : "modified"} · <b>${esc(pointLabel(p.base))}</b> → <b>${esc(pointLabel(subject))}</b></div><div class="code diff">${rows}</div>`;
  }
  function filesHtml(tab) {
    const p = filesOf(tab);
    if (p.at !== "latest" && !W().nodes[p.at] && !p.at.startsWith("fork:")) p.at = "latest";
    const subject = subjectOf(tab, p), sv = FM.resolveRef(W().engine, subject);
    if (!sv) return `<div class="fempty">Nothing to show yet.</div>`;
    const bv = p.base ? FM.resolveRef(W().engine, p.base) : null, ch = bv ? FM.changeMap(sv.tree, bv.tree) : null;
    const flash = p.at === "latest" ? W().flash[tab] || new Set() : new Set();
    const nFiles = ch ? Object.keys(ch.files).filter((path) => ((sv.tree[path] || bv.tree[path]) || {}).type === "file").length : 0;
    // one header row: what (point), against what (compare), how much changed, the SDK calls, wider
    const head = `<div class="fhead">${atSelect(tab, p)}${baseSelect(tab, p, subject)}<span class="sp"></span>${ch ? `<span class="fcount" title="Files changed from the compared point">${nFiles} Δ</span>` : ""}`
      + `<button class="sdkbtn" data-fsdk="${esc(tab)}" title="The SDK calls behind this view">sdk</button><button class="fwide${p.wide ? " on" : ""}" data-fwide="${esc(tab)}" title="${p.wide ? "Back to the normal width" : "Widen Files to half the window"}">${p.wide ? "⤡" : "⤢"}</button></div>`
      + (p.sdk ? `<pre class="fsdk">${sdkCalls(subject, p)}</pre>` : "");
    const partial = sv.tree.partial ? `<div class="fsum">${esc(sv.tree.partial)}</div>` : "";
    if (p.path) return head + filePage(tab, p, subject, sv, bv, ch);
    const list = ch ? p.list : "all";
    const sw = ch ? `<div class="fsw"><span class="segs"><button class="fseg${list === "changes" ? " on" : ""}" data-flist="${esc(tab)}|changes">Changes <b>${nFiles}</b></button><button class="fseg${list === "all" ? " on" : ""}" data-flist="${esc(tab)}|all">All files</button></span></div>` : "";
    const empty = !Object.keys(sv.tree).length ? `<div class="fempty">${esc(W().engine.replay && !W().engine.loadsTrees ? "Files are not in a trace: it holds ids, never content." : "Loading the tree…")}</div>` : "";
    const body = empty || (list === "changes" ? changesHtml(tab, p, sv, bv, ch, flash) : `<div class="ftree">${treeHtml(p, sv.tree, bv ? bv.tree : null, ch, "/", 0, flash)}</div>`);
    return head + sw + partial + `<div class="fbody">${body}</div>`;
  }
  // One file: back to the list, its path and change badge, the modes and a
  // one-line summary, then the file itself.
  function filePage(tab, p, subject, sv, bv, ch) {
    const k = ch && ch.files[p.path], cut = p.path.lastIndexOf("/") + 1;
    const back = ch && p.list === "changes" ? "Changes" : "All files";
    const seg = (m, label) => `<button class="fseg${p.mode === m ? " on" : ""}" data-fmode="${esc(tab)}|${m}">${label}</button>`;
    const e = sv.tree[p.path], lang = langOf(p.path), nLines = e && e.type === "file" && e.content != null ? e.content.split("\n").length - (e.content.endsWith("\n") ? 1 : 0) : null;
    const crumbs = p.path.slice(1, cut).split("/").filter(Boolean).map((d) => `<span class="dir">${esc(d)}</span><span class="sl">/</span>`).join("");
    return `<div class="fpage"><button class="fback" data-fback="${esc(tab)}" title="Back to the list">‹ ${back}</button>${iconOf(p.path.slice(cut), "file")}<span class="fpathx" title="${esc(p.path)} @ ${esc(pointLabel(subject))}">${crumbs}<b>${esc(p.path.slice(cut))}</b></span>${k ? `<span class="fb ${k}">${k}</span>` : ""}<span class="sp"></span><span class="flang">${[lang ? lang.label : null, nLines != null ? `${nLines} line${nLines === 1 ? "" : "s"}` : null].filter(Boolean).join(" · ")}</span></div>
      <div class="fmodes"><span class="segs">${bv ? seg("diff", "Diff") : ""}${seg("view", "File")}${seg("blame", "Blame")}${seg("history", "History")}</span><span class="sp"></span>${fileStatsHtml(subject, p, sv)}</div>
      <div class="fbody"><div class="fview">${viewHtml(subject, p, sv, bv)}</div></div>`;
  }
  // The global Store: dedupe and compression rates. Sim estimates them from the
  // model (SimBackend.storage); live shows the Store's publication counters.
  function storeHtml() {
    const z = W().engine.storage();
    if (!z) return `<div class="store"><div class="srow"><span class="kind">STORE</span><span>${v.live ? "not reported yet" : "empty"}</span></div></div>`;
    const tip = !z.estimate ? `Store publication counters: logical history states ${fmtBytes(z.logical)}, unique canonical objects ${fmtBytes(z.payload)}, complete pack bodies ${fmtBytes(z.stored)}; metadata ${fmtBytes(z.metadata)}. DB logical pages ${fmtBytes(z.store)}. WAL allocation is separate.` : `Global Store, project ${W().engine.s.project ? W().engine.s.project.name : ""} (sim estimate). Logical ${fmtBytes(z.logical)}: every file in every saved root. Dedupe to ${fmtBytes(z.payload)}: distinct contents once (whole files; the product also dedupes chunks). Payload ${fmtBytes(z.stored)}: those contents compressed with deflate as a stand-in for zstd, no deltas. Metadata ${fmtBytes(z.metadata)}: 64 B per distinct entry + 256 B per Commit or Layer.`;
    return `<div class="store" title="${esc(tip)}"><div class="srow"><span class="kind">STORE</span><b>${fmtBytes(z.store)}</b>${bar(z.stored, z.metadata)}<span><span class="pc">payload</span> ${fmtBytes(z.stored)} · <span class="mc">meta</span> ${fmtBytes(z.metadata)}</span></div>
      <div class="srow"><span class="kind">RATE</span><span>logical <b>${fmtBytes(z.logical)}</b> · dedupe <b>${ratio(z.logical, z.payload)}</b> · compression <b>${ratio(z.payload, z.stored)}</b>${z.pending ? " · compressing…" : ""}</span><span class="est">${z.estimate ? "sim est." : "product"}</span></div></div>`;
  }
  // A Workspace's overlay: its uncommitted changes in the daemon's own database, not in the Store.
  function overlayHtml(w) {
    const o = W().engine.overlayOf(w.eng);
    if (!o) return "";
    if (!o.estimate) return `<div class="store" title="Workspace operator counters (operator.workspace.overlay): payload is stored overlay cell bytes. It lives in the daemon's database, not in the global Store."><div class="srow"><span class="kind">OVERLAY</span><b>${fmtBytes(o.payload)}</b><span>payload · ${o.inodes} inodes · ${o.entries} names${o.changes ? ` · +${o.changes.added} ~${o.changes.modified} −${o.changes.removed}` : ""}</span><span class="est">product</span></div></div>`;
    const n = o.added + o.modified + o.removed;
    const tip = `This Workspace's overlay (sim estimate): ${n} change${n === 1 ? "" : "s"}; payload ${fmtBytes(o.payload)} is the changed files' bytes, metadata ${fmtBytes(o.metadata)} is 64 B per changed entry. It lives in the daemon's database, not in the global Store.`;
    return `<div class="store" title="${esc(tip)}"><div class="srow"><span class="kind">OVERLAY</span><b>${fmtBytes(o.payload + o.metadata)}</b>${bar(o.payload, o.metadata)}<span>+${o.added} ~${o.modified} −${o.removed} · <span class="pc">payload</span> ${fmtBytes(o.payload)} · <span class="mc">meta</span> ${fmtBytes(o.metadata)}</span><span class="est">sim est.</span></div></div>`;
  }
  // Opening a file shows what changed when it changed, else the file.
  function openFile(p, path) {
    const sv = FM.resolveRef(W().engine, subjectOf(v.active, p)), bv = p.base ? FM.resolveRef(W().engine, p.base) : null;
    const changed = sv && bv && FM.changeMap(sv.tree, bv.tree).files[path];
    p.path = path; p.mode = changed ? "diff" : "view";
  }
  // Points Files at one node: on this tab's lane it pins the subject there; any
  // other node becomes the subject's base. The base defaults to its parent.
  function showPoint(tab, id) {
    const p = filesOf(tab), n = W().nodes[id]; if (!n) return;
    const lane = n.branch || "main";
    if (lane === tab) { p.at = n.kind === "fork" ? "fork:" + tab : id; p.base = FM.parentRef(W().engine, p.at) || ""; }
    else p.base = id;
    v.rightMode[tab] = "files";
  }
  /** Files at any node, compared with its parent (a project page). */
  function showAt(tab, id) {
    const p = filesOf(tab), n = W().nodes[id]; if (!n) return;
    p.at = n.kind === "fork" ? "fork:" + n.branch : id;
    p.base = FM.parentRef(W().engine, p.at) || "";
    p.path = null;
  }
  // Files controls, and History nodes that open Files at that point.
  function click(e) {
    const at = (sel) => e.target.closest(sel), tab = v.active;
    let el;
    if ((el = at("[data-fmode]"))) { const [t, m] = el.dataset.fmode.split("|"); filesOf(t).mode = m; v.render(); return true; }
    if ((el = at("[data-flist]"))) { const [t, val] = el.dataset.flist.split("|"); filesOf(t).list = val; v.render(); return true; }
    if ((el = at("[data-fback]"))) { filesOf(el.dataset.fback).path = null; v.render(); return true; }
    if ((el = at("[data-fwide]"))) { const p = filesOf(el.dataset.fwide); p.wide = !p.wide; v.render(); return true; }
    if ((el = at("[data-fgroup]"))) { const [t, g] = el.dataset.fgroup.split("|"), p = filesOf(t), key = "group:" + g; p.toggled = p.toggled.includes(key) ? p.toggled.filter((x) => x !== key) : [...p.toggled, key]; v.render(); return true; }
    if ((el = at("[data-fsdk]"))) { const p = filesOf(el.dataset.fsdk); p.sdk = !p.sdk; v.render(); return true; }
    if ((el = at("[data-ftree]"))) {
      const p = filesOf(tab), path = el.dataset.ftree;
      if (el.dataset.ftype === "dir") { p.toggled = p.toggled.includes(path) ? p.toggled.filter((x) => x !== path) : [...p.toggled, path]; }
      else openFile(p, path);
      v.render(); return true;
    }
    if ((el = at("[data-fopen]"))) { openFile(filesOf(tab), el.dataset.fopen); v.render(); return true; }
    if ((el = at("[data-fblame]"))) { const p = filesOf(tab); showPoint(tab, el.dataset.fblame); p.mode = "diff"; v.render(); return true; }
    if ((el = at(".gview [data-node], .blist [data-node], svg.tree [data-node]"))) { (v.project ? showAt : showPoint)(tab, el.dataset.node); v.render(); return true; }
    return false;
  }
  function change(e) {
    const t = e.target;
    if (t.dataset.fat) { const p = filesOf(t.dataset.fat); p.at = t.value; p.base = p.at === "latest" ? defaultBase(t.dataset.fat) : FM.parentRef(W().engine, p.at) || ""; v.render(); }
    else if (t.dataset.fbasesel !== undefined) { filesOf(t.dataset.fbasesel).base = t.value; v.render(); }
  }
  return { filesOf, filesHtml, storeHtml, overlayHtml, showPoint, showAt, click, change, wide: (tab) => (FILES[tab] || {}).wide };
}
