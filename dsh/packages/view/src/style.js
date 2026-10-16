// The view's stylesheet, scoped under .lfs so it neither leaks into nor takes
// from the page around it (dsh, or the design preview). Keyframes are named
// lfs-*. The preview keeps only its own chrome (title bar, player).
export const CSS = `
.lfs {
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --mono: "SF Mono", ui-monospace, Menlo, Monaco, monospace;
  --window: #fff; --chrome: #ececef; --card: #fff; --well: #f2f2f5; --grid-bg: #e4e4e8;
  --text: #1d1d1f; --text-2: #6e6e73; --text-3: #a1a1a6; --sep: rgba(0,0,0,.09); --sep-strong: rgba(0,0,0,.16);
  --accent: #007aff; --accent-bg: rgba(0,122,255,.12); --green: #28a745; --orange: #e08600; --red: #ff3b30; --purple: #a347d4;
  --orange-bg: rgba(255,149,0,.14); --purple-bg: rgba(175,82,222,.13); --red-bg: rgba(255,59,48,.12); --green-bg: rgba(52,199,89,.14);
  --term: #ffffff; --term-head: #f5f5f7; --term-border: rgba(0,0,0,.12); --term-text: #1d1d1f; --term-dim: #86868b;
  --t-blue: #0058d0; --t-green: #1a7f37; --t-orange: #b35c00; --t-red: #d1242f; --t-purple: #8a3ab9; --t-cyan: #0a7590;
  --t-add-bg: rgba(26,127,55,.08); --t-del-bg: rgba(209,36,47,.08);
  --b0: #0a6cff; --b1: #1f9d55; --b2: #0f8b9a; --b3: #d6336c; --b4: #5856d6; --b5: #8e6e53;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  .lfs:not([data-theme="light"]) {
  --window: #1e1e20; --chrome: #2a2a2d; --card: #2c2c2f; --well: #252528; --grid-bg: #141416;
  --text: #f5f5f7; --text-2: #a1a1a6; --text-3: #6e6e73; --sep: rgba(255,255,255,.08); --sep-strong: rgba(255,255,255,.16);
  --accent: #0a84ff; --accent-bg: rgba(10,132,255,.18); --green: #30d158; --orange: #ff9f0a; --red: #ff453a; --purple: #bf5af2;
  --orange-bg: rgba(255,159,10,.16); --purple-bg: rgba(191,90,242,.16); --red-bg: rgba(255,69,58,.16); --green-bg: rgba(48,209,88,.16);
  --term: #1c1c1e; --term-head: #252528; --term-border: rgba(255,255,255,.08); --term-text: #e5e5ea; --term-dim: #8e8e93;
  --t-blue: #64b5ff; --t-green: #5fd97a; --t-orange: #ffb340; --t-red: #ff6b61; --t-purple: #d38cff; --t-cyan: #64d2ff;
  --t-add-bg: rgba(95,217,122,.1); --t-del-bg: rgba(255,107,97,.1);
  --b0: #4aa3ff; --b1: #3ecf74; --b2: #3cc6d4; --b3: #ff6b9a; --b4: #8e8cff; --b5: #c09a78;
  color-scheme: dark; }
}
.lfs[data-theme="dark"] {
  --window: #1e1e20; --chrome: #2a2a2d; --card: #2c2c2f; --well: #252528; --grid-bg: #141416;
  --text: #f5f5f7; --text-2: #a1a1a6; --text-3: #6e6e73; --sep: rgba(255,255,255,.08); --sep-strong: rgba(255,255,255,.16);
  --accent: #0a84ff; --accent-bg: rgba(10,132,255,.18); --green: #30d158; --orange: #ff9f0a; --red: #ff453a; --purple: #bf5af2;
  --orange-bg: rgba(255,159,10,.16); --purple-bg: rgba(191,90,242,.16); --red-bg: rgba(255,69,58,.16); --green-bg: rgba(48,209,88,.16);
  --term: #1c1c1e; --term-head: #252528; --term-border: rgba(255,255,255,.08); --term-text: #e5e5ea; --term-dim: #8e8e93;
  --t-blue: #64b5ff; --t-green: #5fd97a; --t-orange: #ffb340; --t-red: #ff6b61; --t-purple: #d38cff; --t-cyan: #64d2ff;
  --t-add-bg: rgba(95,217,122,.1); --t-del-bg: rgba(255,107,97,.1);
  --b0: #4aa3ff; --b1: #3ecf74; --b2: #3cc6d4; --b3: #ff6b9a; --b4: #8e8cff; --b5: #c09a78;
  color-scheme: dark; }
.lfs, .lfs * { box-sizing: border-box; }
.lfs button { font: inherit; color: inherit; }
/* title bar + tabs */
.lfs .tabs { display: flex; gap: 4px; align-items: center; min-width: 0; overflow-x: auto; flex: 1; scrollbar-width: none; padding: 4px 0; }
.lfs .tab { height: 30px; display: flex; align-items: center; gap: 6px; padding: 0 8px 0 10px; border-radius: 7px; cursor: pointer; color: var(--text-2); white-space: nowrap; border: 0; background: transparent; position: relative; transition: opacity .4s, background .2s; }
.lfs .tab:hover { background: var(--sep); }
.lfs .tab[aria-selected="true"] { background: var(--card); color: var(--text); box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 0 0 .5px var(--sep); }
.lfs .tab .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--bc); flex: none; }
.lfs .tab.main .dot { border-radius: 2px; transform: rotate(45deg); background: var(--purple); }
.lfs .tab.conflict { box-shadow: 0 0 0 1.5px var(--red) !important; color: var(--red); }
.lfs .tab .avs { display: inline-flex; gap: 1px; }
.lfs .tab .pin { opacity: 0; font-size: 10px; padding: 0 2px; border-radius: 3px; }
.lfs .tab:hover .pin, .lfs .tab .pin.on { opacity: .8; }
.lfs .tab.enter { animation: lfs-grow .35s ease-out; }
.lfs .tab.more { font: 600 11px var(--mono); }
.lfs .menu { position: absolute; z-index: 60; background: var(--card); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,.25), 0 0 0 .5px var(--sep-strong); padding: 4px; min-width: 160px; }
.lfs .menu button { display: flex; width: 100%; gap: 8px; align-items: center; border: 0; background: transparent; padding: 6px 8px; border-radius: 5px; cursor: pointer; text-align: left; }
.lfs .menu button:hover { background: var(--accent-bg); }
.lfs .ib { height: 28px; min-width: 28px; padding: 0 9px; border: 0; border-radius: 6px; background: transparent; cursor: pointer; color: var(--text-2); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.lfs .ib:hover { background: var(--sep); color: var(--text); }
.lfs .ib.on { color: var(--accent); background: var(--accent-bg); }
.lfs .ib svg { width: 15px; height: 15px; }
/* work area */
.lfs .work { flex: 1; min-height: 0; display: grid; gap: 6px; padding: 6px; background: var(--grid-bg); }
.lfs .work.mainview { grid-template-columns: minmax(240px, .9fr) minmax(300px, 1fr) minmax(320px, 1.4fr); }
.lfs .work.branchview { grid-template-columns: minmax(240px, 1fr) minmax(300px, 1.55fr) minmax(300px, 1.3fr); }
.lfs .work.branchview.wide { grid-template-columns: minmax(200px, .7fr) minmax(260px, 1fr) minmax(320px, 1.7fr); }
.lfs .work.mainview.wide { grid-template-columns: minmax(200px, .7fr) minmax(260px, .8fr) minmax(320px, 1.7fr); }
.lfs .seg { display: inline-flex; background: var(--well); border-radius: 6px; padding: 2px; gap: 2px; flex: none; }
.lfs .seg button { border: 0; background: transparent; font: 700 10px var(--mono); letter-spacing: .03em; padding: 2px 8px; border-radius: 4px; cursor: pointer; color: var(--text-2); }
.lfs .seg button.on { background: var(--card); color: var(--text); box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 0 0 .5px var(--sep); }
.lfs .seg button.on.h { color: var(--t-purple); }
.lfs .seg button.on.f { color: var(--t-green); }
.lfs .col { display: flex; flex-direction: column; gap: 6px; min-height: 0; min-width: 0; }
.lfs .term { display: flex; flex-direction: column; background: var(--term); border-radius: 8px; overflow: hidden; min-width: 0; min-height: 0; box-shadow: 0 0 0 1px var(--term-border); position: relative; flex: 1; transition: box-shadow .25s; }
.lfs .term.hot { box-shadow: 0 0 0 1.5px var(--accent), 0 6px 18px rgba(0,0,0,.12); }
.lfs .term.bad { box-shadow: 0 0 0 1.5px var(--red), 0 6px 18px rgba(255,59,48,.18); }
.lfs .term.enter { animation: lfs-grow .35s ease-out; }
.lfs .thead { height: 30px; flex: none; display: flex; align-items: center; gap: 6px; padding: 0 8px; background: var(--term-head); color: var(--term-text); font-size: 12px; border-bottom: 1px solid var(--term-border); white-space: nowrap; overflow: hidden; }
.lfs .thead .ttl { font: 12px var(--mono); color: var(--term-dim); overflow: hidden; text-overflow: ellipsis; }
.lfs .thead .sp { flex: 1; }
.lfs .kind { font: 700 10px var(--mono); padding: 1px 5px; border-radius: 4px; letter-spacing: .03em; flex: none; }
.lfs .kind.fs { background: var(--accent-bg); color: var(--t-blue); }
.lfs .kind.sandbox { background: var(--orange-bg); color: var(--t-orange); }
.lfs .kind.history { background: var(--purple-bg); color: var(--t-purple); }
.lfs .kind.files { background: var(--green-bg); color: var(--t-green); }
.lfs .kind.plain { background: var(--well); color: var(--text-2); }
.lfs .pill { font: 10.5px var(--mono); padding: 1px 6px; border-radius: 4px; background: var(--well); color: var(--term-dim); white-space: nowrap; display: inline-flex; gap: 4px; align-items: center; }
.lfs .pill.warn { background: var(--red-bg); color: var(--t-red); }
.lfs .pill.run { background: var(--green-bg); color: var(--t-green); }
.lfs .agent-tag { display: inline-flex; align-items: center; gap: 4px; font: 600 11px var(--font); color: var(--ac); background: color-mix(in srgb, var(--ac) 14%, transparent); padding: 0 6px 0 3px; border-radius: 4px; height: 17px; }
.lfs .tbody { flex: 1; min-height: 0; overflow: auto; padding: 8px 10px 6px; font: 12px/1.6 var(--mono); color: var(--term-text); white-space: pre-wrap; word-break: break-word; }
.lfs .ln { display: block; white-space: pre-wrap; }
.lfs .ln.new { animation: lfs-fadein .35s ease-out; }
.lfs .ln .cmd { color: var(--term-text); }
.lfs .ln .grp { font: 10px var(--mono); color: var(--term-dim); border: 1px dashed var(--term-border); border-radius: 3px; padding: 0 4px; margin-right: 6px; vertical-align: 1px; }
.lfs .ln.dim, .lfs .ln.dim .cmd { color: var(--term-dim); }
.lfs .out { display: block; color: var(--term-dim); padding-left: 2ch; }
.lfs .out.good { color: var(--t-green); }
.lfs .out.bad { color: var(--t-red); }
.lfs .out.mark { color: var(--t-orange); }
.lfs .prompt { color: var(--t-blue); }
.lfs .inrow { flex: none; display: flex; align-items: center; gap: 6px; padding: 5px 10px 7px; font: 12px var(--mono); color: var(--term-dim); border-top: 1px solid var(--term-border); }
.lfs .inrow .prompt { flex: none; white-space: nowrap; }
.lfs .inrow > span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .inrow .caret { width: 7px; height: 14px; background: var(--term-dim); opacity: .5; animation: lfs-blink 1.1s steps(2) infinite; }
/* main view */
.lfs .graphwrap { flex: 1; min-height: 0; overflow: auto; padding: 6px 4px; }
.lfs svg.graph { display: block; }
.lfs svg.graph text { font-family: var(--font); fill: var(--term-text); }
.lfs svg.graph .row-line { stroke: var(--term-border); stroke-dasharray: 2 4; }
.lfs svg.graph .rowband { fill: var(--accent-bg); }
.lfs svg.graph .edge { fill: none; stroke: var(--term-dim); stroke-width: 1.8; }
.lfs svg.graph .edge.main { stroke: var(--purple); stroke-width: 2.4; }
.lfs svg.graph .edge.publish { stroke: var(--purple); stroke-width: 1.5; stroke-dasharray: 4 4; }
.lfs svg.graph .edge.merge { stroke: var(--bc); stroke-width: 1.6; stroke-dasharray: 5 3; }
.lfs svg.graph .mergehead { fill: none; stroke: var(--bc); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.lfs svg.graph .node .shape { transform-box: fill-box; transform-origin: center; }
.lfs svg.graph .layer .shape { fill: var(--purple); }
.lfs svg.graph .commit .shape { fill: var(--bc); }
.lfs svg.graph .commit .inner { fill: var(--term); }
.lfs svg.graph .fork .shape { fill: var(--term); stroke: var(--bc); stroke-width: 2; }
.lfs svg.graph .ini { font: 700 8px var(--font); fill: #fff; }
.lfs svg.graph .mbadge circle { fill: var(--orange); stroke: var(--term); stroke-width: 1.5; }
.lfs svg.graph .mbadge.stale circle { fill: var(--red); }
.lfs svg.graph .mbadge text { fill: #fff; font: 700 8.5px var(--font); }
.lfs svg.graph .popin { animation: lfs-popin .5s .3s both cubic-bezier(.2,.9,.3,1.35); transform-box: fill-box; transform-origin: center; }
.lfs svg.graph .rt { font: 11.5px var(--mono); fill: var(--term-text); }
.lfs svg.graph .rt .dim { fill: var(--term-dim); }
.lfs svg.graph .rt .hd { font-weight: 700; fill: var(--accent); }
@keyframes lfs-popin { from { transform: scale(0); } to { transform: scale(1); } }
.lfs .rows { flex: 1; min-height: 0; overflow: auto; padding: 4px; }
.lfs .brow { display: flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: 6px; cursor: pointer; min-height: 32px; transition: background .25s; }
.lfs .brow .slot { width: 100px; height: 20px; flex: none; }
.lfs .brow .hd { font: 11px var(--mono); color: var(--text-2); width: 34px; text-align: right; flex: none; }
.lfs .brow:hover { background: var(--well); }
.lfs .brow.flash { animation: lfs-flash 1s ease-out; }
.lfs .brow .st { width: 16px; text-align: center; font-size: 12px; flex: none; }
.lfs .brow .nm { font: 600 12px var(--mono); color: var(--bc); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .brow .meta { font: 11px var(--mono); color: var(--text-3); white-space: nowrap; }
.lfs .brow.idle .nm { opacity: .6; }
.lfs .bench { flex: none; min-height: 64px; border-top: 1px dashed var(--sep-strong); display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 11px; color: var(--text-3); position: relative; }
.lfs .bench b { font-weight: 600; letter-spacing: .04em; text-transform: uppercase; font-size: 10px; }
/* branch view */
/* SDK call details on a terminal line (tui.html) */
.lfs .sdkbtn { margin-left: 8px; font: 9.5px var(--mono); padding: 0 4px; border-radius: 3px; border: 1px solid var(--term-border); background: transparent; color: var(--term-dim); cursor: pointer; opacity: 0; vertical-align: 1px; }
.lfs .ln:hover .sdkbtn, .lfs .ln.open .sdkbtn, .lfs .sdkbtn:focus-visible { opacity: 1; }
.lfs .sdk { display: none; margin: 3px 0 5px; padding: 6px 9px; border-left: 2px solid var(--t-cyan); background: var(--well); border-radius: 0 6px 6px 0; color: var(--term-text); font-size: 11.5px; white-space: normal; }
.lfs .ln.open .sdk { display: block; }
.lfs .sdk .code { color: var(--term-dim); display: block; margin-bottom: 4px; padding: 0; }
.lfs .sdk .code b { color: var(--t-cyan); font-weight: 600; }
.lfs .sdk pre { margin: 0 0 6px; font: inherit; white-space: pre-wrap; }
.lfs .tm { margin-left: 8px; font: 9.5px var(--mono); color: var(--term-dim); vertical-align: 1px; }
.lfs .sdk .tm { margin-left: 6px; font-size: 10.5px; }
/* Store and overlay footers */
.lfs .store { flex: none; border-top: 1px solid var(--term-border); padding: 3px 10px 4px; font: 10.5px/1.6 var(--mono); color: var(--term-dim); background: var(--well); }
.lfs .store .srow { display: flex; align-items: center; gap: 7px; white-space: nowrap; overflow: hidden; }
.lfs .store .srow > span:not(.sbar):not(.est) { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.lfs .store .kind { flex: none; font-weight: 600; font-size: 9px; letter-spacing: .06em; padding: 0; background: none; }
.lfs .store b { color: var(--term-text); font-weight: 600; }
.lfs .store .est { margin-left: auto; flex: none; font-size: 9.5px; opacity: .8; }
.lfs .store .sbar { flex: none; display: flex; width: 44px; height: 5px; border-radius: 3px; overflow: hidden; background: var(--term-border); }
.lfs .store .sbar i { display: block; }
.lfs .store .p { background: var(--t-cyan); }
.lfs .store .m { background: var(--orange); }
.lfs .store .pc { color: var(--t-cyan); }
.lfs .store .mc { color: var(--orange); }
/* Files pane (tui.html), stacked for the right column */
.lfs .fsel { font: 11.5px var(--mono); height: 22px; max-width: 200px; min-width: 70px; border: 1px solid var(--term-border); border-radius: 5px; background: var(--term); color: var(--term-text); padding: 0 4px; }
.lfs .sync { font-size: 11px; line-height: 1; flex: none; }
.lfs .sync.live { color: var(--t-green); }
.lfs .sync.pinned { color: var(--term-dim); }
.lfs .fbar { flex: none; display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: var(--term-head); border-bottom: 1px solid var(--term-border); font-size: 11.5px; color: var(--term-dim); flex-wrap: wrap; }
.lfs .fbar .segs { display: inline-flex; background: var(--well); border-radius: 6px; padding: 2px; }
.lfs .fbar .fseg { border: 0; background: transparent; padding: 2px 9px; border-radius: 4px; cursor: pointer; font-size: 11.5px; color: var(--term-dim); }
.lfs .fbar .fseg.on { background: var(--card); color: var(--term-text); box-shadow: 0 1px 2px rgba(0,0,0,.12); }
.lfs .fbar .chipb { border: 1px solid var(--term-border); background: transparent; border-radius: 10px; padding: 0 8px; height: 20px; cursor: pointer; font-size: 11px; color: var(--term-dim); }
.lfs .fbar .chipb.on { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }
.lfs .fbar .chk { display: inline-flex; gap: 4px; align-items: center; }
.lfs .fbar .chk.off { opacity: .45; }
.lfs .fbar .sp { flex: 1; }
.lfs .fbar .fcount { font: 11px var(--mono); }
.lfs .fbar .sdkbtn { opacity: 1; margin-left: 0; }
.lfs .fsdk { margin: 0; padding: 6px 10px; background: var(--well); border-bottom: 1px solid var(--term-border); font: 11px/1.5 var(--mono); color: var(--term-text); white-space: pre-wrap; }
.lfs .fbody { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.lfs .ftree, .lfs .flist { flex: 1; min-height: 0; overflow: auto; padding: 4px 0 10px; font: 12px/1.6 var(--mono); color: var(--term-text); }
.lfs .fhead { flex: none; display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--term-head); border-bottom: 1px solid var(--term-border); font-size: 11.5px; color: var(--term-dim); min-width: 0; }
.lfs .fhead .fsel { min-width: 0; flex: 0 1 auto; }
.lfs .fhead .sp { flex: 1; min-width: 4px; }
.lfs .fhead .fcount { font: 11px var(--mono); white-space: nowrap; }
.lfs .fhead .sdkbtn { opacity: 1; margin-left: 0; flex: none; }
.lfs .fwide { flex: none; border: 0; background: none; color: var(--term-dim); font-size: 13px; width: 22px; height: 22px; border-radius: 5px; cursor: pointer; }
.lfs .fwide:hover, .lfs .fwide.on { background: var(--well); color: var(--term-text); }
.lfs .fsw, .lfs .fmodes { flex: none; display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-bottom: 1px solid var(--term-border); min-width: 0; }
.lfs .fsw .segs, .lfs .fmodes .segs { display: inline-flex; background: var(--well); border-radius: 6px; padding: 2px; flex: none; }
.lfs .fsw .fseg, .lfs .fmodes .fseg { border: 0; background: transparent; padding: 2px 10px; border-radius: 4px; cursor: pointer; font-size: 11.5px; color: var(--term-dim); }
.lfs .fsw .fseg.on, .lfs .fmodes .fseg.on { background: var(--card); color: var(--term-text); box-shadow: 0 1px 2px rgba(0,0,0,.12); }
.lfs .fsw .fseg b { font-weight: 600; margin-left: 2px; }
.lfs .fmodes .sp { flex: 1; }
.lfs .fstat { font-size: 11px; color: var(--term-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: help; }
.lfs .fstat b { color: var(--term-text); }
.lfs .fdir { padding: 6px 10px 1px; color: var(--term-dim); font-size: 11px; }
.lfs .fgroup { display: flex; align-items: center; gap: 6px; margin-top: 6px; padding: 4px 10px; border-top: 1px dashed var(--term-border); color: var(--term-dim); font-size: 11.5px; cursor: pointer; white-space: nowrap; }
.lfs .fgroup:hover { background: var(--well); }
.lfs .fgroup b { color: var(--term-text); font-weight: 600; }
.lfs .fgroup .car { width: 10px; }
.lfs .fgroup .nm { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.lfs .fb.lead { margin: 0 6px 0 0; }
.lfs .fpage { flex: none; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-bottom: 1px solid var(--term-border); min-width: 0; }
.lfs .fback { flex: none; border: 0; background: var(--well); color: var(--accent); font-size: 11.5px; padding: 2px 8px; border-radius: 5px; cursor: pointer; }
.lfs .fback:hover { background: var(--accent-bg); }
.lfs .fpathx { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 12px var(--mono); }
.lfs .fpathx .dir { color: var(--term-dim); }
.lfs .fpathx b { color: var(--term-text); }
.lfs .frow { display: flex; align-items: center; gap: 4px; padding: 1px 8px; cursor: pointer; white-space: nowrap; }
.lfs .frow:hover { background: var(--well); }
.lfs .frow.sel { background: var(--accent-bg); }
.lfs .frow.flash { animation: lfs-flash 1.2s ease-out; }
.lfs .frow .car { width: 10px; color: var(--term-dim); flex: none; }
.lfs .frow .nm { overflow: hidden; text-overflow: ellipsis; }
.lfs .frow.gone .nm { text-decoration: line-through; color: var(--term-dim); }
.lfs .frow.flat { padding: 2px 10px; font: 12px var(--mono); }
.lfs .fb { font: 700 9.5px var(--mono); padding: 0 4px; border-radius: 3px; margin-left: auto; flex: none; }
.lfs .frow.flat .fb { margin: 0 6px 0 0; }
.lfs .fb.A { color: var(--t-green); background: var(--t-add-bg); }
.lfs .fb.M { color: var(--t-blue); background: var(--accent-bg); }
.lfs .fb.D { color: var(--t-red); background: var(--t-del-bg); }
.lfs .fr { margin-left: auto; font: 10px var(--mono); color: var(--term-dim); flex: none; }
.lfs .fview { flex: 1; min-height: 0; overflow: auto; font: 12px/1.55 var(--mono); color: var(--term-text); }
.lfs .fpath { position: sticky; top: 0; z-index: 1; background: var(--term); padding: 5px 10px; border-bottom: 1px solid var(--term-border); font-weight: 600; }
.lfs .fpath span { font-weight: 400; color: var(--term-dim); }
.lfs .fsum { padding: 6px 10px; color: var(--term-dim); font-size: 11.5px; }
.lfs .fsum b { color: var(--term-text); font-weight: 600; }
.lfs .fstats { display: flex; flex-wrap: wrap; gap: 3px 14px; padding: 6px 10px; border-bottom: 1px solid var(--term-border); background: var(--well); font-size: 11px; color: var(--term-dim); }
.lfs .fstats b { color: var(--term-text); font-weight: 600; }
.lfs .fstats .est { margin-left: auto; }
.lfs .frev { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.lfs .frev th { text-align: left; font-weight: 600; color: var(--term-dim); padding: 4px 6px; border-bottom: 1px solid var(--term-border); }
.lfs .frev td { padding: 3px 6px; border-bottom: 1px solid var(--term-border); white-space: nowrap; }
.lfs .frev td.n, .lfs .frev th.n { text-align: right; }
.lfs .frev .zero { color: var(--term-dim); }
.lfs .fempty { padding: 18px 12px; color: var(--term-dim); line-height: 1.6; }
.lfs .code { padding: 2px 0 10px; }
.lfs .cl { display: flex; white-space: pre; min-height: 18px; }
.lfs .cl .no { flex: none; width: 34px; padding-right: 8px; text-align: right; color: var(--term-dim); user-select: none; }
.lfs .cl .op { flex: none; width: 14px; color: var(--term-dim); }
.lfs .cl .tx { flex: 1; padding-right: 10px; }
.lfs .cl.add { background: var(--t-add-bg); }
.lfs .cl.add .op, .lfs .cl.add .tx { color: var(--t-green); }
.lfs .cl.del { background: var(--t-del-bg); }
.lfs .cl.del .op, .lfs .cl.del .tx { color: var(--t-red); }
.lfs .bch { flex: none; width: 40px; margin: 0 4px 0 6px; font: 600 10.5px/18px var(--mono); color: var(--bc); border-left: 3px solid var(--bc); padding-left: 5px; cursor: pointer; }
.lfs .bch.cont { opacity: .55; }
.lfs .bch:hover { background: var(--well); }
.lfs svg.graph .node { cursor: pointer; }
/* Sandbox / process status bar (tui.html) */
.lfs .statusbar { height: 32px; flex: none; display: flex; align-items: center; gap: 6px; padding: 0 10px; background: var(--chrome); border-top: .5px solid var(--sep); overflow-x: auto; scrollbar-width: none; font-size: 11px; }
.lfs .statusbar .lbl { color: var(--text-3); white-space: nowrap; }
.lfs .statusbar .sp { flex: 1; min-width: 10px; }
.lfs .chip { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 6px; font: 11px var(--mono); background: var(--card); box-shadow: 0 0 0 .5px var(--sep-strong); white-space: nowrap; }
.lfs .chip .d { width: 7px; height: 7px; border-radius: 50%; background: var(--green); }
.lfs .chip.closed { opacity: .5; }
.lfs .chip.closed .d { background: var(--text-3); }
.lfs .chip.proc .d { background: var(--orange); animation: lfs-blink 1.2s steps(2) infinite; }
.lfs .chip.enter { animation: lfs-grow .3s ease-out; }
.lfs .sblist { flex: 1 1 0; min-height: 140px; }
.lfs .blist { flex: 0 1 auto; max-height: 48%; min-height: 96px; }
.lfs .blist .rows { overflow-y: auto; padding: 4px; }
.lfs .sbg { display: flex; flex-direction: column; gap: 1px; padding: 4px 2px 6px; border-radius: 6px; transition: box-shadow .15s; }
.lfs .sbg + .sbg { border-top: 1px solid var(--term-border); }
.lfs .sbg.closed { opacity: .5; }
.lfs .sbg.sblit, .lfs .term.sblit { box-shadow: 0 0 0 2px var(--orange), 0 6px 18px rgba(0,0,0,.12); }
.lfs .sbg.pulse { animation: lfs-focuspane 1.6s ease-out; }
.lfs .sbh { display: flex; align-items: center; gap: 6px; padding: 2px 4px; font: 11.5px var(--mono); }
.lfs .sbh .d { width: 7px; height: 7px; border-radius: 50%; background: var(--green); flex: none; }
.lfs .sbh .d.idle { background: var(--text-3); }
.lfs .sbh .d.off { background: transparent; box-shadow: 0 0 0 1px var(--text-3); }
.lfs .sbh .mk { display: inline-flex; gap: 4px; align-items: center; color: var(--term-dim); font: 11px var(--font); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .sbh b, .lfs .sbh .ct { flex: none; white-space: nowrap; }
.lfs .sbh .sp { flex: 1; }
.lfs .sbh .ct { color: var(--term-dim); font-size: 10.5px; white-space: nowrap; }
.lfs .dnote { font-size: 10.5px; color: var(--t-orange); padding: 0 4px 0 17px; }
.lfs .dws { display: flex; align-items: center; gap: 6px; width: 100%; border: 0; background: none; color: var(--term-text); font: 11px var(--mono); padding: 3px 4px 3px 15px; border-radius: 5px; cursor: pointer; text-align: left; white-space: nowrap; overflow: hidden; }
.lfs .dws:hover { background: var(--well); }
.lfs .dws .at { color: var(--term-dim); }
.lfs .dws .noag { width: 14px; text-align: center; color: var(--term-dim); }
.lfs .bchip { font: 10.5px var(--mono); padding: 0 5px; border-radius: 4px; color: var(--bc); box-shadow: inset 0 0 0 1px var(--bc); white-space: nowrap; }
.lfs .st { font-size: 10px; color: var(--term-dim); }
.lfs .st.warn { color: var(--t-orange); }
.lfs .st.bad { color: var(--t-red); }
.lfs .st.run { color: var(--t-green); overflow: hidden; text-overflow: ellipsis; }
.lfs button.chip { border: 0; color: inherit; cursor: pointer; }
.lfs .sbchip { border: 0; font: 10.5px var(--mono); padding: 1px 6px; border-radius: 4px; background: var(--well); color: var(--term-text); cursor: pointer; flex: none; }
.lfs .sbchip:hover { background: var(--orange-bg); color: var(--t-orange); }
.lfs .term.focus { animation: lfs-focuspane 1.2s ease-out; }
@keyframes lfs-focuspane { 0%, 40% { box-shadow: 0 0 0 2.5px var(--accent), 0 6px 18px rgba(0,0,0,.18); } }
/* Hover card on History nodes (tui.html) */
.lfs .hcard { position: absolute; z-index: 65; width: 290px; background: var(--card); border-radius: 10px; box-shadow: 0 14px 44px rgba(0,0,0,.24), 0 0 0 .5px var(--sep-strong); padding: 8px; display: none; font-size: 12px; }
.lfs .hcard.open { display: block; animation: lfs-grow .12s ease-out; }
.lfs .hcard .h { display: flex; align-items: baseline; gap: 6px; margin: 0 4px 2px; }
.lfs .hcard .h b { font: 600 13px var(--mono); }
.lfs .hcard .tag { font: 600 10px var(--font); padding: 1px 6px; border-radius: 4px; background: var(--accent-bg); color: var(--accent); }
.lfs .hcard .meta { margin: 0 4px 6px; color: var(--text-2); font: 11px var(--mono); line-height: 1.5; }
.lfs .hcard .meta b { color: var(--text); }
.lfs .hcard .sec { margin: 6px 4px 3px; font-size: 10.5px; color: var(--text-3); text-transform: uppercase; letter-spacing: .04em; }
.lfs .hcard .ws { width: 100%; display: flex; align-items: center; gap: 6px; padding: 5px 6px; border: 0; background: transparent; border-radius: 6px; cursor: pointer; text-align: left; font: 11.5px var(--mono); color: var(--text); }
.lfs .hcard .ws:hover, .lfs .hcard .ws:focus-visible { background: var(--accent-bg); outline: 0; }
.lfs .hcard .ws .d { width: 7px; height: 7px; border-radius: 50%; background: var(--orange); flex: none; }
.lfs .hcard .ws.stale .d { background: var(--red); }
.lfs .hcard .ws small { margin-left: auto; font: 10.5px var(--font); color: var(--text-2); white-space: nowrap; }
.lfs .hcard .ws.stale small { color: var(--red); }
.lfs .hcard .cbtns { display: flex; gap: 6px; margin: 8px 4px 0; }
.lfs .hcard .cbtn { flex: 1; border: 0; border-radius: 6px; padding: 5px 6px; background: var(--well); cursor: pointer; font-size: 11.5px; color: var(--text); }
.lfs .hcard .cbtn:hover { background: var(--accent); color: #fff; }
.lfs .hcard .hint { margin: 6px 4px 0; font-size: 10.5px; color: var(--text-3); }
.lfs .panes { flex: 1; min-height: 0; display: grid; gap: 6px; grid-auto-rows: minmax(0, 1fr); }
.lfs .empty { flex: 1; display: grid; place-items: center; text-align: center; color: var(--text-2); background: var(--term); border-radius: 8px; box-shadow: 0 0 0 1px var(--term-border); padding: 16px; }
.lfs .empty h3 { margin: 0 0 6px; font-size: 14px; color: var(--text); }
.lfs .empty .recent { white-space: pre; margin-top: 10px; font: 11.5px/1.7 var(--mono); text-align: left; color: var(--term-dim); }
.lfs .legend { flex: none; display: flex; flex-wrap: wrap; gap: 4px 10px; padding: 6px 10px 8px; border-top: 1px solid var(--term-border); font: 11px var(--mono); color: var(--text-2); }
.lfs .legend i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--bc); margin-right: 4px; }
/* player */
/* crabs */
.lfs .lfs-crabs { position: absolute; inset: 0; pointer-events: none; z-index: 40; overflow: hidden; }
.lfs .crab { position: absolute; left: 0; top: 0; width: 36px; height: 48px; transition: transform .55s ease-in-out, opacity .3s; }
.lfs .crab .spr { display: block; width: 36px; height: 48px; background-repeat: no-repeat; transform-origin: 50% 100%; transition: transform .25s; filter: drop-shadow(0 2px 2px rgba(0,0,0,.18)); }
.lfs .crab.flip .spr { transform: scaleX(-1); }
.lfs .crab.small .spr { transform: scale(.5); }
.lfs .crab.small.flip .spr { transform: scale(-.5, .5); }
.lfs .crab.gone { opacity: 0; }
.lfs .crab.idle .spr { animation: lfs-avbob 2.6s ease-in-out infinite; }
.lfs .crab.walk .spr { animation: lfs-avhop .28s ease-in-out infinite; }
.lfs .crab .fx { display: none; position: absolute; right: -2px; top: 2px; font: 700 13px/1 var(--font); font-style: normal; }
.lfs .crab .fx.bang { color: var(--red); right: 0; top: 0; font-size: 15px; }
.lfs .crab.sweat .fx.sweat, .lfs .crab.bang .fx.bang { display: block; animation: lfs-avhop .5s ease-in-out infinite; }
.lfs .crab.small .fx { top: 22px; right: 4px; font-size: 10px; }
.lfs .crab .dup, .lfs .av .dup { position: absolute; right: -3px; bottom: -2px; font: 700 8px/10px var(--font); font-style: normal; min-width: 10px; text-align: center; border-radius: 5px; background: var(--card); color: var(--text-2); box-shadow: 0 0 0 .5px var(--sep-strong); }
.lfs .crab .dup { bottom: 12px; }
.lfs .av { position: relative; display: inline-block; width: 16px; height: 16px; flex: none; border-radius: 50%; background-repeat: no-repeat; background-color: var(--well); box-shadow: 0 0 0 1px var(--ac); vertical-align: middle; }
@keyframes lfs-avbob { 50% { translate: 0 -1.5px; } }
@keyframes lfs-avhop { 50% { translate: 0 -4px; } }
.lfs .crab .name { position: absolute; left: 50%; top: 48px; transform: translateX(-50%); font: 600 9.5px var(--font); color: var(--c); white-space: nowrap; background: color-mix(in srgb, var(--window) 80%, transparent); padding: 0 3px; border-radius: 3px; }
.lfs .crab.small .name { display: none; }
/* fan-out: an agent working in several places at once (a script's calls) */
.lfs .crab .fan { display: none; position: absolute; left: -4px; top: 4px; font: 700 9px/13px var(--font); font-style: normal; padding: 0 3px; border-radius: 7px; background: var(--c); color: #fff; box-shadow: 0 0 0 1.5px var(--window); }
.lfs .crab.fanned .fan { display: block; }
.lfs .crab.small .fan { top: 22px; left: 6px; font-size: 8px; line-height: 11px; }
.lfs .crab.ghost { opacity: .42; transition: opacity .3s; }
.lfs .crab.ghost .spr { filter: grayscale(.3); animation: none; }
.lfs .crab.ghost .name { opacity: .8; }
.lfs .crab.ghost.gone { opacity: 0; }
.lfs .bubble { position: absolute; z-index: 45; pointer-events: none; transform: translate(-50%, -100%); font: 600 11px var(--mono); padding: 3px 7px; border-radius: 8px; background: var(--card); color: var(--text); box-shadow: 0 4px 14px rgba(0,0,0,.2), 0 0 0 .5px var(--sep-strong); white-space: nowrap; animation: lfs-bubble 1.9s ease-out forwards; }
.lfs .bubble.good { color: var(--t-green); }
.lfs .bubble.bad { color: var(--t-red); }
.lfs .block { position: absolute; z-index: 44; width: 12px; height: 12px; border-radius: 3px; pointer-events: none; transition: transform .6s cubic-bezier(.4,0,.2,1), opacity .2s .55s; box-shadow: 0 2px 8px rgba(0,0,0,.25); }
@keyframes lfs-bob { 50% { transform: translateY(-1.5px); } }
@keyframes lfs-claw { 50% { transform: translateY(-2px); } }
@keyframes lfs-blink { 50% { opacity: .1; } }
@keyframes lfs-grow { from { transform: scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes lfs-fadein { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
@keyframes lfs-pop { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes lfs-flash { 0% { background: var(--accent-bg); } 100% { background: transparent; } }
@keyframes lfs-bubble { 0% { opacity: 0; margin-top: 6px; } 12% { opacity: 1; margin-top: 0; } 80% { opacity: 1; } 100% { opacity: 0; margin-top: -8px; } }
@media (max-width: 860px) {
  .lfs .work.mainview, .lfs .work.branchview { grid-template-columns: 1fr; }
  .lfs .col { min-height: 300px; }
}
@media (prefers-reduced-motion: reduce) {
  .lfs .crab, .lfs .block { transition: none; }
  .lfs .crab .spr, .lfs .crab .fx { animation: none !important; }
}
/* the view's own root: position for the overlay, the card and menus */
.lfs { position: relative; font: 13px/1.4 var(--font); color: var(--text); -webkit-font-smoothing: antialiased; }
/* standalone layout (the dsh tab): strip, work area, status bar */
.lfs.lfs-app { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--window); overflow: hidden; }
.lfs .lfs-strip { height: 40px; flex: none; display: flex; align-items: center; gap: 8px; padding: 0 8px; background: var(--chrome); border-bottom: .5px solid var(--sep); }
.lfs .lfs-strip .tabs { flex: 1; }
.lfs .lfs-strip .lfs-note { font: 11px var(--mono); color: var(--text-3); white-space: nowrap; }
`;

/** Adds the stylesheet once per document; returns its element. */
export function injectStyle(doc = document) {
  let el = doc.querySelector("style[data-lfs]");
  if (!el) { el = doc.createElement("style"); el.dataset.lfs = "1"; el.textContent = CSS; doc.head.appendChild(el); }
  return el;
}
