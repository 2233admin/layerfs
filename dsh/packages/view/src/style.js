// The view's stylesheet, scoped under .lfs so it neither leaks into nor takes
// from the page around it (dsh, or the design preview). Keyframes are named
// lfs-*. The preview keeps only its own chrome (title bar, player).
export const CSS = `
.lfs {
  /* the LayerFS website's tokens (layerfs-website global.css), light only */
  --font: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Monaco, monospace;
  --paper: #FBF9F5; --dot: #EEE9DF; --line: #E2DED6; --line2: #ECE9E2; --tab: #F4F2EC; --lane: #F3F6FC;
  --trunk: #5C9A3C; --green-dark: #3F7524; --twig: #B9B2A6; --coral: #E07A5A; --coral-text: #B8502C; --coral-pale: #FBE9E2;
  --window: #FBF9F5; --chrome: #F4F2EC; --card: #FFFFFF; --well: #F0EEE8; --grid-bg: #FBF9F5;
  --text: #1E2533; --text-2: #5B6372; --text-3: #8A8780; --sep: #ECE9E2; --sep-strong: #E2DED6;
  --accent: #2F5BB5; --accent-bg: #E6EEFA; --green: #3E9B74; --orange: #D29A2E; --red: #C8452F; --purple: #8A6BC8;
  --orange-bg: rgba(210,154,46,.14); --purple-bg: rgba(138,107,200,.13); --red-bg: #FBE9E2; --green-bg: rgba(62,155,116,.13);
  --term: #FDFCFA; --term-head: #F6F4EF; --term-border: #E2DED6; --term-text: #1E2533; --term-dim: #8A8780;
  --t-blue: #2F5BB5; --t-green: #2E7D5B; --t-orange: #93650F; --t-red: #B8502C; --t-purple: #6A4DA8; --t-cyan: #1F6B78;
  --t-add-bg: rgba(46,125,91,.09); --t-del-bg: rgba(184,80,44,.09);
  /* Branch colours: the website demo's */
  --b0: #E07A5A; --b1: #3E9B74; --b2: #8A6BC8; --b3: #D29A2E; --b4: #2B8A9A; --b5: #C8557A;
  color-scheme: light;
}
.lfs, .lfs * { box-sizing: border-box; }
.lfs button { font: inherit; color: inherit; }
/* title bar + tabs: the website's Branch tabs */
.lfs .tabs { display: flex; flex-wrap: wrap; gap: 4px; align-items: flex-end; align-self: stretch; min-width: 0; flex: 1; padding: 8px 0 0; }
.lfs .tab { min-height: 40px; display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; color: var(--text); white-space: nowrap; border: 1px solid transparent; border-bottom: 0; background: transparent; position: relative; font: 13px var(--mono); transition: opacity .4s, background .2s; margin-bottom: -1px; }
.lfs .tab:hover { background: rgba(255,255,255,.6); }
.lfs .tab[aria-selected="true"] { background: #fff; border-color: var(--line); }
.lfs .tab.dim { opacity: .55; }
.lfs .tab .sq { width: 8px; height: 8px; background: var(--bc); flex: none; }
.lfs .tab.main .sq { background: var(--accent); }
.lfs .tab .tchip { font: 11.5px var(--mono); padding: 1px 6px; background: #F0EEE8; color: #6B6964; }
.lfs .tab .tchip.ro { background: var(--coral-pale); color: var(--coral-text); }
.lfs .tab .tchip.bad { background: var(--coral-pale); color: var(--coral-text); }
.lfs .tab.conflict { color: var(--t-red); }
.lfs .tab .avs { display: inline-flex; gap: 1px; }
.lfs .tab .pin { opacity: 0; font-size: 10px; padding: 0 2px; }
.lfs .tab:hover .pin, .lfs .tab .pin.on { opacity: .8; }
.lfs .tab.enter { animation: lfs-grow .35s ease-out; }
.lfs .tab.more { font: 600 11px var(--mono); }
.lfs .menu { position: absolute; z-index: 60; background: var(--card); border-radius: 0; box-shadow: 0 10px 30px rgba(0,0,0,.25), 0 0 0 .5px var(--sep-strong); padding: 4px; min-width: 160px; }
.lfs .menu button { display: flex; width: 100%; gap: 8px; align-items: center; border: 0; background: transparent; padding: 6px 8px; border-radius: 5px; cursor: pointer; text-align: left; }
.lfs .menu button:hover { background: var(--accent-bg); }
.lfs .ib { height: 26px; min-width: 26px; padding: 0 8px; border: 1px solid transparent; border-radius: 0; font: 11.5px var(--mono); background: transparent; cursor: pointer; color: var(--text-2); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.lfs .ib:hover { background: var(--sep); color: var(--text); }
.lfs .ib.on { color: var(--accent); border-color: var(--accent); background: var(--card); }
.lfs .ib svg { width: 15px; height: 15px; }
/* work area */
.lfs .work { flex: 1; min-height: 0; display: grid; gap: 12px; padding: 12px; background: var(--card); }
.lfs.lfs-project { display: flex; flex-direction: column; min-height: 0; background: var(--window); }
.lfs .work.projectview { grid-template-columns: minmax(240px, var(--hist, 55%)) 12px minmax(280px, 1fr); gap: 0; }
.lfs.lfs-project { container-type: inline-size; }
.lfs .split { cursor: col-resize; position: relative; touch-action: none; }
.lfs .split::after { content: ""; position: absolute; top: 0; bottom: 0; left: 5.5px; width: 1px; background: var(--term-border); transition: background .15s, width .15s, left .15s; }
.lfs .split:hover::after, .lfs .work.dragging .split::after { left: 5px; width: 2px; background: var(--accent); }
/* one frame: the page's hairline holds both panels; no grey well or panel rings inside it */
.lfs.lfs-project .work.projectview { background: var(--term); padding: 0; }
.lfs.lfs-project .term { box-shadow: none; border-radius: 0; }
.lfs .work.dragging { cursor: col-resize; user-select: none; }
@container (max-width: 640px) { .lfs .work.projectview { grid-template-columns: minmax(0, 1fr); grid-auto-rows: minmax(320px, 1fr); } .lfs .split { display: none; } .lfs-project .col + .col { border-top: 1px solid var(--term-border); } }
.lfs .ptitle { font-size: 12px; font-weight: 500; color: var(--term-text); overflow: hidden; text-overflow: ellipsis; }
.lfs .work.mainview { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); grid-template-rows: minmax(0, 1fr); }
/* a Branch: its info, its agents, then its terminals two by two; more than four
   terminals keep their height and the whole view scrolls */
.lfs .work.branchview { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
.lfs .work.branchview:not(.withhist) .wgrid { flex: 1 0 auto; overflow: visible; grid-auto-rows: minmax(240px, 1fr); }
/* the preview's layout: History is the work area's first column */
.lfs .work.withhist { grid-template-columns: minmax(360px, 440px) minmax(0, 7fr) minmax(0, 5fr); background: var(--paper); }
.lfs .work.branchview.withhist { display: grid; grid-template-columns: minmax(360px, 440px) minmax(0, 1fr); grid-template-rows: auto auto minmax(0, 1fr); }
.lfs .work.branchview.withhist .hist { grid-row: 1 / -1; }
.lfs .work.withhist .hist { grid-row: 1 / -1; }
.lfs .ctl { display: flex; flex: none; align-self: flex-end; margin: 0 0 8px; border: 1px solid var(--line); background: #fff; }
.lfs .ctl button { min-height: 28px; border: 0; padding: 0 8px; font: 11.5px var(--mono); background: transparent; color: var(--text-2); cursor: pointer; }
.lfs .ctl button:hover { color: var(--accent); }
.lfs .ctl button.on { background: var(--text); color: #fff; }
/* terminals (Term in OrchestrationDemo.jsx) */
.lfs .wterm { border: 1px solid var(--line); box-shadow: none; }
.lfs .wterm .thead { height: auto; padding: 6px 10px; font: 12px var(--mono); border-bottom: 1px solid var(--line); gap: 8px; }
.lfs .wterm .thead .t { font-weight: 500; color: var(--text); }
.lfs .wterm .thead .ghost { color: var(--text-3); min-width: 0; overflow: hidden; text-overflow: ellipsis; border: 0; background: none; padding: 0; font: inherit; }
.lfs .wterm .thead .sp { flex: 1; margin-right: -8px; }
.lfs .wterm .thead .ghost.sbchip { flex: 0 1 auto; cursor: pointer; }
.lfs .wterm .thead .ghost.sbchip:hover { color: var(--t-orange); background: none; }
.lfs .wterm .thead .av { width: 22px; height: 18px; }
.lfs .tbox { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.lfs .tbox .wm { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); height: 76%; max-height: 240px; min-height: 48px; width: auto; pointer-events: none; font-family: var(--mono); }
.lfs .wterm .tbody { position: relative; padding: 6px 10px; font: 12.5px/1.6 var(--mono); white-space: normal; }
.lfs .wterm .ln { white-space: normal; }
/* a line's row: prompt, command (shortened with "…"), agent, time, sdk; the time never leaves the view */
.lfs .wterm .lrow { display: flex; align-items: center; min-width: 0; white-space: nowrap; }
.lfs .wterm .lrow > * { flex: none; }
.lfs .wterm .lrow .prompt { white-space: pre; }
.lfs .wterm .lrow .cmd { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.lfs .wterm .ln .grp { display: none; }
.lfs .wterm .ln .av { width: 20px; height: 15px; margin-left: 6px; }
.lfs .wterm .lrow .tm { margin-left: 8px; }
/* a new command types itself out, then its time, sdk and output appear */
.lfs .wterm .ln.typing .cmd { max-width: calc(var(--n) * 1ch + 0.55ch); border-right: 0.55ch solid transparent; animation: lfs-type var(--d) steps(var(--n), end) both, lfs-caret var(--d) step-end both; }
.lfs .wterm .ln.typing .lrow > :not(.cmd):not(.prompt) { animation: lfs-fadein .25s var(--d) both; }
.lfs .wterm .out.new[style] { animation: lfs-fadein .25s var(--d) both; }
@keyframes lfs-type { from { max-width: 0; } }
@keyframes lfs-caret { 0% { border-right-color: var(--accent); } 100% { border-right-color: transparent; } }
.lfs .wterm .out { padding-left: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lfs .wterm.hot { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
.lfs .wterm.bad { border-color: var(--coral); box-shadow: 0 0 0 2px var(--coral); }
.lfs .wtag { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 2px 6px; flex: 0 1 auto; }
.lfs .wterm .thead .t, .lfs .storep .thead .t { flex: none; }
.lfs .wtag.grey { background: #F0EEE8; color: var(--text-2); }
.lfs .wtag.blue { background: var(--accent-bg); color: var(--accent); }
.lfs .wtag.coral { background: var(--coral-pale); color: var(--coral-text); }
.lfs .fsi { flex: none; }
/* main: the Branch cards on a sand floor (AgentBoard), the Store (StorePanel), the project terminal */
.lfs .board { display: flex; flex-direction: column; min-height: 0; border: 1px solid var(--line); background: #fff; }
.lfs .bhead { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; padding: 6px 10px; border-bottom: 1px solid var(--line); background: var(--term-head); font: 12px var(--mono); color: #6B6964; }
.lfs .bhead .t { font-weight: 500; color: var(--text); }
.lfs .bhead .sp { flex: 1; margin-right: -8px; }
.lfs .bhead .roster { border: 0; background: none; padding: 0; font: inherit; color: inherit; cursor: pointer; }
.lfs .bhead .roster:hover { color: var(--accent); }
.lfs .floor { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); grid-auto-rows: min-content; align-content: start; align-items: start; gap: 8px; padding: 8px; background: #F6EEDD radial-gradient(#E9DCC0 1px, transparent 1px) 0 0 / 12px 12px; }
.lfs .floor .none { grid-column: 1 / -1; padding: 24px 0; text-align: center; font: 12px var(--mono); color: #8C6A3A; }
.lfs .bcard { display: flex; flex-direction: column; min-width: 0; border: 1px solid var(--bc); background: #fff; transition: opacity .3s; }
.lfs .bcard.dim { opacity: .55; }
.lfs .bcard.flash { animation: lfs-flash 1s ease-out; }
.lfs .bcard .bhd { display: flex; align-items: center; gap: 8px; padding: 4px 8px; font: 12.5px var(--mono); background: color-mix(in srgb, var(--bc) 10%, white); cursor: pointer; min-width: 0; }
.lfs .bcard .bhd .sq { width: 10px; height: 10px; background: var(--bc); flex: none; }
.lfs .bcard .bhd .nm { font-weight: 500; color: color-mix(in srgb, var(--bc) 75%, black); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.lfs .bcard .bhd .note { margin-left: auto; flex: none; font-size: 11px; color: #6B6964; }
.lfs .crow { display: flex; align-items: center; gap: 6px; padding: 3px 6px; border-top: 1px solid var(--line2); font: 12px var(--mono); cursor: default; }
.lfs .crow[data-dws] { cursor: pointer; }
.lfs .crow.off { opacity: .6; }
.lfs .crow .av { width: 24px; height: 20px; }
.lfs .crow .nm { color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.lfs .crow .st { margin-left: auto; flex: none; padding: 1px 4px; font-size: 10.5px; background: color-mix(in srgb, var(--ac) 12%, white); color: color-mix(in srgb, var(--ac) 80%, black); }
.lfs .crow.off .st { background: #F0EEE8; color: var(--text-3); }
.lfs .crow.sblit { box-shadow: inset 0 0 0 2px var(--orange); }
.lfs .bcard.pulse { animation: lfs-focuspane 1.6s ease-out; }
.lfs .pool { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; padding: 6px 10px; border-top: 1px solid #E4D6B8; background: #EFE3C8; font: 11px var(--mono); color: #8C6A3A; }
.lfs .pool .av { width: 22px; height: 18px; opacity: .7; }
/* the main tab's left column: the Sandboxes over the Branches */
.lfs .work.mainview > .col.boards { gap: 8px; }
.lfs .work.mainview > .col.boards > .board:last-child { flex: 1 1 0; }
.lfs .board.sbp { flex: 0 1 auto; max-height: 42%; }
.lfs .sbcards { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); grid-auto-rows: min-content; align-content: start; gap: 8px; padding: 8px; background: #F3F5FA; }
.lfs .sbcards .none { grid-column: 1 / -1; padding: 14px 0; text-align: center; font: 12px var(--mono); color: var(--text-3); }
.lfs .sbrow { display: flex; flex-direction: column; min-width: 0; border: 1px solid #C9D3E6; background: #fff; cursor: default; transition: opacity .3s, box-shadow .15s; }
.lfs .sbrow.closed { opacity: .5; border-style: dashed; }
.lfs .sbrow.sblit { box-shadow: 0 0 0 2px var(--orange); }
.lfs .sbrow.pulse { animation: lfs-focuspane 1.6s ease-out; }
.lfs .sbrow .sbhd { display: flex; align-items: center; gap: 6px; padding: 4px 8px; font: 12.5px var(--mono); background: var(--accent-bg); color: var(--accent); min-width: 0; }
.lfs .sbrow .sbhd .id { display: flex; min-width: 0; white-space: nowrap; }
.lfs .sbrow .sbhd .id .pre { flex: 0 1 auto; min-width: 2ch; overflow: hidden; text-overflow: ellipsis; opacity: .65; }
.lfs .sbrow .sbhd .id b { flex: none; font-weight: 600; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.lfs .sbst { margin-left: auto; flex: none; display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; color: var(--text-3); }
.lfs .sbst::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--text-3); }
.lfs .sbst.on { color: var(--green-dark); }
.lfs .sbst.on::before { background: var(--green); box-shadow: 0 0 0 3px var(--green-bg); }
.lfs .sbrow .boxi { flex: none; }
.lfs .sbmeta { display: flex; align-items: center; gap: 6px; padding: 3px 8px; font: 11px var(--mono); color: var(--text-3); white-space: nowrap; min-width: 0; }
.lfs .sbmeta span { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.lfs .sbmeta .av { width: 18px; height: 15px; flex: none; }
.lfs .sbws { display: flex; align-items: center; gap: 6px; padding: 3px 8px; border-top: 1px solid var(--line2); font: 12px var(--mono); min-width: 0; }
.lfs .sbws[data-dws] { cursor: pointer; }
.lfs .sbws[data-dws]:hover { background: color-mix(in srgb, var(--bc) 8%, white); }
.lfs .sbws .sq { width: 8px; height: 8px; background: var(--bc); flex: none; }
.lfs .sbws .wsn { flex: none; color: var(--text); }
.lfs .sbws .br { color: color-mix(in srgb, var(--bc) 75%, black); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.lfs .sbws .av { width: 20px; height: 17px; margin-left: auto; flex: none; }
.lfs .sbws .dt { flex: none; padding: 0 4px; font-size: 10.5px; background: #F0EEE8; color: var(--text-2); }
.lfs .sbws .dt.warn { background: var(--coral-pale); color: var(--coral-text); }
.lfs .sbproc { display: flex; align-items: center; gap: 6px; padding: 3px 8px; border-top: 1px solid var(--line2); font: 11.5px var(--mono); color: var(--green-dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .sbproc .d { width: 7px; height: 7px; border-radius: 50%; background: var(--green); flex: none; }
.lfs .sbempty { padding: 3px 8px; border-top: 1px solid var(--line2); font: 11px var(--mono); color: var(--text-3); }
.lfs .hint-i { display: inline-grid; place-items: center; width: 14px; height: 14px; border-radius: 50%; border: 1px solid currentColor; font: italic 600 9.5px/1 var(--font); color: var(--text-3); cursor: help; flex: none; }
.lfs .hint-i:hover, .lfs .hint-i:focus { color: var(--accent); outline: none; }
.lfs .menu .mhead { padding: 6px 8px 2px; border-top: 1px solid var(--line2); margin-top: 4px; font: 10.5px var(--mono); color: var(--text-3); }
.lfs .menu .mt { margin-left: auto; font: 10.5px var(--mono); color: var(--text-3); }
.lfs .tab.more.retired { color: var(--text-3); font-weight: 400; }
.lfs .storep { flex: none; border: 1px solid var(--line); box-shadow: none; }
.lfs .storep .thead { height: auto; padding: 6px 10px; font: 12px var(--mono); border-bottom: 1px solid var(--line); }
.lfs .storep .thead .t { font-weight: 500; }
.lfs .storep .thead .sp { flex: 1; margin-right: -8px; }
.lfs .sbody { display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; }
.lfs .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
@media (min-width: 1536px) { .lfs .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.lfs .tile { display: flex; flex-direction: column; min-width: 0; border: 1px solid var(--line2); background: #fff; padding: 4px 8px; font-family: var(--mono); }
.lfs .tile span { font-size: 10.5px; line-height: 1.25; color: #6B6964; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .tile b { font-size: 15px; font-weight: 500; line-height: 1.4; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .tile b.blue { color: var(--accent); }
.lfs .tile b.coral { color: var(--coral-text); }
.lfs .sbar2 { display: flex; height: 6px; background: #E6EBF5; }
.lfs .sbar2 .p { background: var(--accent); }
.lfs .sbar2 .m { background: var(--coral); }
.lfs .sbar2 .f { background: #C9D0DB; }
.lfs .sline { font: 11px var(--mono); color: var(--text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .sline b { font-weight: 500; color: var(--text); }
.lfs .sline .mc { color: var(--coral-text); }
/* a Branch (BranchPanel): its line, its agents, then fs and Workspace terminals two by two */
.lfs .binfo { flex: none; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 16px; font: 12.5px var(--mono); color: var(--text-2); }
.lfs .binfo .nm { font-weight: 500; }
.lfs .binfo .status { margin-left: auto; background: #F0EEE8; padding: 2px 8px; }
.lfs .wchips { flex: none; display: flex; flex-wrap: wrap; gap: 6px; min-height: 26px; }
.lfs .wchips .none { font: 11.5px var(--mono); color: var(--text-3); align-self: center; }
.lfs .wchip { display: flex; align-items: center; gap: 6px; border: 1px solid var(--line); padding: 2px 8px 2px 4px; font: 11.5px var(--mono); opacity: .7; }
.lfs .wchip.on { border-color: var(--ac); background: #fff; opacity: 1; }
.lfs .wchip .av { width: 20px; height: 16px; }
.lfs .wchip .nm { color: var(--text); }
.lfs .wchip .st { color: var(--text-3); }
.lfs .wchip.on .st { color: color-mix(in srgb, var(--ac) 80%, black); }
.lfs .wgrid { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(176px, 1fr); gap: 12px; overflow-y: auto; }
.lfs .wempty { display: flex; align-items: center; justify-content: center; border: 1px dashed #E4E0D8; font: 11.5px var(--mono); color: var(--text-3); }
.lfs .seg { display: inline-flex; border: 1px solid var(--line); background: var(--card); flex: none; }
.lfs .seg button { border: 0; background: transparent; font: 11px var(--mono); padding: 3px 8px; cursor: pointer; color: var(--text-2); display: inline-flex; align-items: center; gap: 4px; }
.lfs .seg button:hover { color: var(--text); }
.lfs .seg button.on { background: var(--text); color: #fff; }
.lfs .seg svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
.lfs .col { display: flex; flex-direction: column; gap: 12px; min-height: 0; min-width: 0; }
.lfs .term { display: flex; flex-direction: column; background: var(--term); border-radius: 0; overflow: hidden; min-width: 0; min-height: 0; box-shadow: 0 0 0 1px var(--line); position: relative; flex: 1; transition: box-shadow .25s; }
.lfs .term.hot { box-shadow: 0 0 0 1.5px var(--accent), 0 6px 18px rgba(0,0,0,.12); }
.lfs .term.bad { box-shadow: 0 0 0 1.5px var(--red), 0 6px 18px rgba(255,59,48,.18); }
.lfs .term.enter { animation: lfs-grow .35s ease-out; }
.lfs .term.leaving { animation: lfs-leave 3.6s ease-in forwards; pointer-events: none; }
.lfs .thead { height: 34px; flex: none; display: flex; align-items: center; gap: 8px; padding: 0 10px; background: var(--term-head); color: var(--term-text); font: 12.5px var(--mono); border-bottom: 1px solid var(--line2); white-space: nowrap; overflow: hidden; }
.lfs .thead .ttl { font: 12px var(--mono); color: var(--term-dim); overflow: hidden; text-overflow: ellipsis; }
.lfs .thead .sp { flex: 1; }
.lfs .kind { font: 600 11px var(--mono); padding: 0; letter-spacing: .06em; flex: none; background: none !important; color: var(--text) !important; }
.lfs .kind.fs { background: var(--accent-bg); color: var(--t-blue); }
.lfs .kind.sandbox { background: var(--orange-bg); color: var(--t-orange); }
.lfs .kind.history { background: var(--purple-bg); color: var(--t-purple); }
.lfs .kind.files { background: var(--green-bg); color: var(--t-green); }
.lfs .kind.plain { background: var(--well); color: var(--text-2); }
.lfs .pill { font: 11px var(--mono); padding: 1px 6px; border-radius: 0; background: var(--well); color: var(--term-dim); white-space: nowrap; display: inline-flex; gap: 4px; align-items: center; }
.lfs .pill.warn { background: var(--red-bg); color: var(--t-red); }
.lfs .pill.run { background: var(--green-bg); color: var(--t-green); }
.lfs .pill.ro { background: var(--coral-pale); color: var(--coral-text); }
.lfs .agent-tag { display: inline-flex; align-items: center; gap: 4px; font: 600 11px var(--font); color: var(--ac); background: color-mix(in srgb, var(--ac) 14%, transparent); padding: 0 6px 0 3px; border-radius: 4px; height: 17px; }
.lfs .tbody { flex: 1; min-height: 0; overflow: auto; padding: 10px 12px 8px; font: 12.5px/1.7 var(--mono); color: var(--term-text); white-space: pre-wrap; word-break: break-word; }
.lfs .ln { display: block; white-space: pre-wrap; }
.lfs .ln.new { animation: lfs-fadein .35s ease-out; }
.lfs .ln .cmd { color: var(--term-text); }
.lfs .ln .grp { font: 10px var(--mono); color: var(--term-dim); border: 1px dashed var(--term-border); border-radius: 3px; padding: 0 4px; margin-right: 6px; vertical-align: 1px; }
.lfs .ln.dim, .lfs .ln.dim .cmd { color: var(--term-dim); }
.lfs .out { display: block; color: var(--term-dim); padding-left: 2ch; }
.lfs .out.good { color: var(--t-green); }
.lfs .out.bad { color: var(--t-red); }
.lfs .out.mark { color: var(--t-orange); }
.lfs .prompt { color: var(--text-3); }
.lfs .inrow { flex: none; display: flex; align-items: center; gap: 6px; padding: 5px 10px 7px; font: 12px var(--mono); color: var(--term-dim); border-top: 1px solid var(--term-border); }
.lfs .inrow .prompt { flex: none; white-space: nowrap; }
.lfs .inrow > span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .inrow .caret { width: 7px; height: 14px; background: var(--term-dim); opacity: .5; animation: lfs-blink 1.1s steps(2) infinite; }
/* History: the website's tree (tree.js) */
.lfs .graphwrap { flex: 1; min-height: 0; overflow: auto; padding: 6px 4px; }
.lfs .panel { background: var(--card); border: 1px solid var(--line); box-shadow: 0 1px 0 var(--line), 0 12px 32px rgba(30,37,51,.06); display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.lfs .hist .phead { flex: none; display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-bottom: 1px solid var(--line); background: var(--tab); font: 12px var(--mono); color: var(--text-3); white-space: nowrap; overflow: hidden; }
.lfs .hist .phead .ref { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.lfs .hist .phead .sp { flex: 1; }
.lfs .hist .fbody, .lfs .hist .ftree, .lfs .hist .fview { min-height: 0; }
.lfs .treebox { flex: 1; min-height: 0; display: flex; flex-direction: column; position: relative; }
.lfs .treewrap { flex: 1; min-height: 0; overflow: auto; outline: none; position: relative; cursor: grab; }
.lfs .treewrap.panning { cursor: grabbing; user-select: none; }
.lfs .treewrap [data-node], .lfs .treewrap .tag { cursor: pointer; }
.lfs.tz-key .treewrap, .lfs.tz-key .treewrap [data-node] { cursor: zoom-in; }
.lfs.tz-key.tz-out .treewrap, .lfs.tz-key.tz-out .treewrap [data-node] { cursor: zoom-out; }
.lfs .tzoom { position: absolute; z-index: 5; right: 12px; top: 10px; display: flex; border: 1px solid var(--line); background: rgba(255,255,255,.92); box-shadow: 0 2px 8px rgba(0,0,0,.08); backdrop-filter: blur(4px); }
.lfs .tzoom button { min-width: 28px; height: 26px; border: 0; padding: 0 6px; background: none; font: 13px var(--mono); color: var(--text-2); cursor: pointer; }
.lfs .tzoom button + button { border-left: 1px solid var(--line2); }
.lfs .tzoom button:hover { background: var(--accent-bg); color: var(--accent); }
.lfs .tzoom .tzv { min-width: 48px; font-size: 11px; }
.lfs .treewrap:focus-visible { box-shadow: inset 0 0 0 2px var(--accent); }
.lfs svg.tree { display: block; font-family: var(--mono); font-size: 10px; }
.lfs svg.tree .lane { fill: var(--lane); }
.lfs svg.tree .grid { stroke: #F1EEE8; }
.lfs svg.tree .now { stroke: var(--text); stroke-opacity: .35; stroke-dasharray: 2 3; }
.lfs svg.tree .nowt { font-weight: 600; fill: var(--text); }
.lfs svg.tree .fork { fill: none; stroke-width: 2.5; opacity: .6; stroke-linecap: round; }
.lfs svg.tree .publish { fill: none; stroke-width: 1.6; stroke-dasharray: 4 3; opacity: .75; }
.lfs svg.tree .graft { fill: none; stroke-width: 1.8; opacity: .6; }
.lfs svg.tree .bough { fill: none; stroke-linecap: round; opacity: .9; }
.lfs svg.tree .twig { fill: none; stroke: var(--twig); stroke-width: 2.4; stroke-linecap: round; }
.lfs svg.tree .trunk { fill: none; stroke: var(--trunk); stroke-linecap: round; }
.lfs svg.tree .band { stroke: #fff; stroke-width: 1; }
.lfs svg.tree .lid { font-weight: 600; pointer-events: none; }
.lfs svg.tree .hit { fill: transparent; }
.lfs svg.tree .knot circle:not(.hit) { fill: var(--card); stroke-width: 1.8; }
.lfs svg.tree .ring { fill: #fff; stroke-width: 2.4; }
.lfs svg.tree .vein { stroke: #fff; stroke-opacity: .55; stroke-width: .9; stroke-linecap: round; fill: none; }
.lfs svg.tree .node { cursor: pointer; }
.lfs svg.tree .node:hover path:not(.vein), .lfs svg.tree .node.sel path:not(.vein) { stroke: var(--text); stroke-width: 1.4; }
.lfs svg.tree .node.sel .ring, .lfs svg.tree .node.sel .band, .lfs svg.tree .knot.sel circle:not(.hit) { stroke: var(--text); }
.lfs svg.tree .leader { stroke: var(--twig); stroke-width: 1; stroke-dasharray: 2 2; }
.lfs svg.tree .tag { cursor: pointer; }
.lfs svg.tree .tag rect { fill: var(--tc); stroke: var(--tc); }
.lfs svg.tree .tag text { font-weight: 600; fill: #fff; }
.lfs svg.tree .tag.idle rect { fill: #fff; }
.lfs svg.tree .tag.idle text { fill: var(--tc); }
.lfs svg.tree .tag.on rect { stroke: var(--text); stroke-width: 1.5; }
.lfs svg.tree .tavbg { fill: var(--card); stroke-width: 1.2; }
.lfs svg.tree .ground { fill: #F6EEDD; }
.lfs svg.tree .groundline { stroke: #E4D6B8; }
.lfs svg.tree .mbadge circle { fill: var(--orange); stroke: #fff; stroke-width: 1.5; }
.lfs svg.tree .mbadge.stale circle { fill: var(--red); }
.lfs svg.tree .mbadge text { fill: #fff; font: 700 8.5px var(--font); }
.lfs svg.tree .popin { animation: lfs-popin .5s .3s both cubic-bezier(.2,.9,.3,1.35); transform-box: fill-box; transform-origin: center; }
.lfs .ov { flex: none; display: flex; height: 40px; border-top: 1px solid var(--line2); }
.lfs .ovl { width: 110px; flex: none; display: flex; flex-direction: column; justify-content: center; padding: 0 10px; border-right: 1px solid var(--line2); font: 10px/1.4 var(--mono); color: var(--text-3); }
.lfs .ovl button { align-self: flex-start; border: 0; background: none; padding: 0; font: inherit; color: var(--accent); cursor: pointer; }
.lfs .ovstrip { flex: 1; position: relative; cursor: pointer; background: #FAF9F6; }
.lfs .ovs { display: block; width: 100%; height: 100%; }
.lfs .ovs .bar { fill: #D6D1C7; }
.lfs .ovs .tick { fill: var(--trunk); }
.lfs .ovs .nowl { stroke: var(--text); stroke-opacity: .5; stroke-dasharray: 2 2; vector-effect: non-scaling-stroke; }
.lfs .ovbox { position: absolute; top: 1px; bottom: 1px; border: 1.5px solid var(--accent); background: rgba(47,91,181,.08); pointer-events: none; }
.lfs .tlegend { flex: none; display: flex; flex-wrap: wrap; gap: 4px 14px; padding: 8px 12px; border-top: 1px solid var(--line2); font: 11px var(--mono); color: var(--text-2); }
.lfs .tlegend span { display: inline-flex; align-items: center; gap: 6px; }
.lfs .tlegend .dash { width: 16px; border-top: 2px dashed var(--b1); }
.lfs .tlegend .hint { color: var(--text-3); }
.lfs .grow { display: flex; align-items: center; gap: 8px; width: 100%; height: 28px; padding: 0 8px; border: 0; background: transparent; cursor: pointer; font: 12px var(--mono); color: var(--term-text); white-space: nowrap; text-align: left; }
.lfs .grow:hover { background: var(--sep); }
.lfs .grow.sel { background: var(--accent-bg); }
.lfs .grow > * { flex: none; }
.lfs .grow .gid { font: 600 12px var(--mono); min-width: 2.6em; }
.lfs .grow .gid.dim { font-weight: 400; color: var(--term-dim); }
.lfs .grow .gbr { font-weight: 500; }
.lfs .grow .gmsg { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; color: var(--text-2); }
.lfs .grow .gby { font-weight: 500; color: var(--text-2); }
.lfs .grow .ghead { font-size: 11px; line-height: 16px; padding: 0 6px; border-radius: 999px; background: var(--accent-bg); color: var(--t-blue); }
.lfs .grow.popin { animation: lfs-fadein .4s .3s both; }
.lfs .blist { padding: 6px; }
.lfs .brow { height: 32px; }
.lfs .brow .bdot { width: 8px; height: 8px; border-radius: 50%; }
.lfs .brow .gbr { flex: 0 0 26%; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.lfs .brow .age { color: var(--term-dim); min-width: 2.5em; text-align: right; }
@keyframes lfs-popin { from { transform: scale(0); } to { transform: scale(1); } }
.lfs .rows { flex: 1; min-height: 0; overflow: auto; padding: 4px; }
.lfs .brow { display: flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: 0; border-bottom: 1px solid var(--line2); cursor: pointer; min-height: 32px; transition: background .25s; }
.lfs .brow .slot { width: 66px; height: 20px; flex: none; }
.lfs .brow .hd { font: 11px var(--mono); color: var(--text-2); width: 34px; text-align: right; flex: none; }
.lfs .brow:hover { background: var(--well); }
.lfs .brow.flash { animation: lfs-flash 1s ease-out; }
.lfs .brow .sq { width: 9px; height: 9px; background: var(--bc); flex: none; }
.lfs .brow .st { width: 16px; text-align: center; font-size: 12px; flex: none; }
.lfs .brow .nm { font: 600 12px var(--mono); color: var(--bc); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lfs .brow .meta { font: 11px var(--mono); color: var(--text-3); white-space: nowrap; }
.lfs .brow .meta.busy { color: var(--t-green); }
.lfs .brow .meta.pub { color: var(--t-blue); }
.lfs .brow .meta.bad { color: var(--t-red); }
.lfs .brow.idle .nm { opacity: .6; }
.lfs .bench { flex: none; min-height: 48px; background: var(--term); box-shadow: 0 0 0 1px var(--line); display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 11px; color: var(--text-3); position: relative; }
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
.lfs .fsel { font: 12px var(--font); height: 24px; max-width: 200px; min-width: 70px; border: 1px solid var(--term-border); border-radius: 5px; background: var(--term); color: var(--term-text); padding: 0 4px; }
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
.lfs .fdir { display: flex; align-items: center; gap: 6px; padding: 8px 10px 3px; color: var(--text-2); font: 500 11.5px var(--font); }
.lfs .fdir .fr { margin-left: auto; }
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
.lfs .fpathx .sl { color: var(--line); margin: 0 2px; }
.lfs .fpage .sp { flex: 1; }
.lfs .flang { flex: none; font: 11px var(--mono); color: var(--text-3); white-space: nowrap; }
.lfs .fpathx b { color: var(--term-text); }
.lfs .frow { display: flex; align-items: center; gap: 6px; min-height: 24px; padding: 0 10px 0 8px; cursor: pointer; white-space: nowrap; font-family: var(--font); font-size: 12.5px; color: var(--text); border-left: 2px solid transparent; }
.lfs .frow:hover { background: #F4F2EC; }
.lfs .frow.sel { background: var(--accent-bg); border-left-color: var(--accent); }
.lfs .frow.flash { animation: lfs-flash 1.2s ease-out; }
.lfs .frow.dir .nm { font-weight: 500; }
.lfs .frow .car { width: 10px; color: var(--text-3); flex: none; display: inline-grid; place-items: center; }
.lfs .frow .nm { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.lfs .frow .ind { flex: none; align-self: stretch; margin-right: -6px; background: repeating-linear-gradient(90deg, transparent 0 6px, #E8E4DC 6px 7px, transparent 7px 14px); }
.lfs .chev { transition: transform .12s; }
.lfs .chev.open { transform: rotate(90deg); }
.lfs .fico { flex: none; display: inline-block; vertical-align: middle; }
.lfs .fico.badge { display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 3px; background: color-mix(in srgb, var(--fc) 14%, white); color: var(--fc); font: 700 7.5px/1 var(--mono); letter-spacing: -.02em; }
.lfs .fico.badge.w { font-size: 6.5px; }
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
.lfs .code { padding: 4px 0 12px; font: 12px/1.65 var(--mono); tab-size: 2; min-width: max-content; }
.lfs .cl { display: flex; white-space: pre; min-height: 19px; }
.lfs .cl:hover { background: #F6F4EF; }
.lfs .cl .no { flex: none; width: 44px; padding-right: 10px; margin-right: 10px; text-align: right; color: #B4AFA5; user-select: none; border-right: 1px solid var(--line2); }
.lfs .cl:hover .no { color: var(--text-2); }
/* syntax colours (highlight.js), the website's palette */
.lfs .hl-com { color: #9A958B; font-style: italic; }
.lfs .hl-str { color: #2E7D5B; }
.lfs .hl-num, .lfs .hl-lit { color: #B8502C; }
.lfs .hl-kw { color: #6A4DA8; font-weight: 500; }
.lfs .hl-fn { color: #2F5BB5; }
.lfs .hl-typ { color: #1F6B78; }
.lfs .hl-prop { color: #93650F; }
.lfs .hl-tag { color: #C8452F; }
.lfs .hl-attr { color: #93650F; }
.lfs .hl-var { color: #1F6B78; }
.lfs .hl-op { color: #D29A2E; font-weight: 600; }

.lfs .cl .op { flex: none; width: 14px; color: var(--term-dim); }
.lfs .cl .tx { flex: 1; padding-right: 10px; }
.lfs .cl.add { background: var(--t-add-bg); }
.lfs .cl.add .op, .lfs .cl.add .tx { color: var(--t-green); }
.lfs .cl.del { background: var(--t-del-bg); }
.lfs .cl.del .op, .lfs .cl.del .tx { color: var(--t-red); }
/* a diff keeps the syntax colours: the line is tinted, its gutter more */
.lfs .cl.add .tx, .lfs .cl.del .tx { color: var(--term-text); }
.lfs .cl.add .no { background: rgba(46,125,91,.13); color: var(--t-green); }
.lfs .cl.del .no { background: rgba(184,80,44,.13); color: var(--t-red); }
.lfs .cl.del .tx { text-decoration: none; opacity: .85; }
.lfs .bch { flex: none; width: 40px; margin: 0 4px 0 6px; font: 600 10.5px/18px var(--mono); color: var(--bc); border-left: 3px solid var(--bc); padding-left: 5px; cursor: pointer; }
.lfs .bch.cont { opacity: .55; }
.lfs .bch:hover { background: var(--well); }
/* Sandbox / process status bar (tui.html) */
.lfs .statusbar { height: 30px; flex: none; display: flex; align-items: center; gap: 6px; padding: 0 14px; background: var(--card); border-top: 1px solid var(--line2); font-family: var(--mono); overflow-x: auto; scrollbar-width: none; font-size: 11px; }
.lfs .statusbar .lbl { color: var(--text-3); white-space: nowrap; }
.lfs .statusbar .snote { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.lfs .statusbar .snote:empty { display: none; }
.lfs .statusbar .sp { flex: 1; min-width: 10px; }
.lfs .chip { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 0; font: 11px var(--mono); background: var(--card); box-shadow: 0 0 0 .5px var(--sep-strong); white-space: nowrap; }
.lfs .chip .d { width: 7px; height: 7px; border-radius: 50%; background: var(--green); }
.lfs .chip.closed { opacity: .5; }
.lfs .chip.closed .d { background: var(--text-3); }
.lfs .chip.proc .d { background: var(--orange); animation: lfs-blink 1.2s steps(2) infinite; }
.lfs .chip.enter { animation: lfs-grow .3s ease-out; }
.lfs .sblist { flex: 1 1 0; min-height: 120px; }
.lfs .storecard { flex: none; }
.lfs .storecard .store { border-top: 0; background: var(--term); padding: 6px 10px; }
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
.lfs .hcard { position: absolute; z-index: 65; width: 290px; background: var(--card); border-radius: 0; border: 1px solid var(--line); box-shadow: 0 14px 44px rgba(0,0,0,.24), 0 0 0 .5px var(--sep-strong); padding: 8px; display: none; font-size: 12px; }
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
.lfs .empty { flex: 1; display: grid; place-items: center; text-align: center; color: var(--text-2); background: var(--term); border-radius: 0; box-shadow: 0 0 0 1px var(--line); padding: 16px; }
.lfs .empty h3 { margin: 0 0 6px; font-size: 14px; color: var(--text); }
.lfs .empty .recent { white-space: pre; margin-top: 10px; font: 11.5px/1.7 var(--mono); text-align: left; color: var(--term-dim); }
/* heroes stand still and bob while they work (the website's animate-bob); bubbles and blocks fly over the view */
.lfs .lfs-fx { position: absolute; inset: 0; pointer-events: none; z-index: 40; overflow: hidden; }
.lfs .av.bob { animation: lfs-avbob .3s ease-in-out infinite; }
.lfs .av .dup { position: absolute; right: -3px; bottom: -2px; font: 700 8px/10px var(--font); font-style: normal; min-width: 10px; text-align: center; border-radius: 5px; background: var(--card); color: var(--text-2); box-shadow: 0 0 0 .5px var(--sep-strong); }
.lfs .av { position: relative; display: inline-block; width: 20px; height: 16px; flex: none; background-repeat: no-repeat; background-size: contain; background-position: 50% 100%; vertical-align: middle; }
@keyframes lfs-avbob { 50% { translate: 0 -1.5px; } }
.lfs .bubble { position: absolute; z-index: 45; pointer-events: none; transform: translate(-50%, -100%); font: 600 11px var(--mono); padding: 3px 7px; border-radius: 8px; background: var(--card); color: var(--text); box-shadow: 0 4px 14px rgba(0,0,0,.2), 0 0 0 .5px var(--sep-strong); white-space: nowrap; animation: lfs-bubble 1.9s ease-out forwards; }
.lfs .bubble.good { color: var(--t-green); }
.lfs .bubble.bad { color: var(--t-red); }
.lfs .block { position: absolute; z-index: 44; width: 12px; height: 12px; border-radius: 3px; pointer-events: none; transition: transform .6s cubic-bezier(.4,0,.2,1), opacity .2s .55s; box-shadow: 0 2px 8px rgba(0,0,0,.25); }
@keyframes lfs-bob { 50% { transform: translateY(-1.5px); } }
@keyframes lfs-claw { 50% { transform: translateY(-2px); } }
@keyframes lfs-blink { 50% { opacity: .1; } }
@keyframes lfs-grow { from { transform: scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes lfs-leave { 0%, 45% { opacity: 1; filter: none; } 55% { opacity: .85; filter: grayscale(.6); } 100% { opacity: 0; transform: scale(.98); filter: grayscale(1); } }
@keyframes lfs-fadein { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
@keyframes lfs-pop { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes lfs-flash { 0% { background: var(--accent-bg); } 100% { background: transparent; } }
@keyframes lfs-bubble { 0% { opacity: 0; margin-top: 6px; } 12% { opacity: 1; margin-top: 0; } 80% { opacity: 1; } 100% { opacity: 0; margin-top: -8px; } }
@media (prefers-reduced-motion: reduce) {
  .lfs .block { transition: none; }
  .lfs .av.bob { animation: none; }
}
/* the view's own root: position for the overlay, the card and menus */
.lfs { container: lfs / inline-size; position: relative; font: 13px/1.4 var(--font); color: var(--text); -webkit-font-smoothing: antialiased; }
/* standalone layout (the dsh tab): History left; Branch tabs over the work area right; status bar */
.lfs.lfs-app { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--paper); overflow: hidden; }
.lfs .lfs-cols { flex: 1; min-height: 0; display: grid; grid-template-areas: "h s w"; grid-template-columns: minmax(var(--histmin, 360px), var(--histw, 440px)) 14px minmax(560px, 1fr); grid-template-rows: minmax(0, 1fr); gap: 0; padding: 14px; background: var(--paper) radial-gradient(var(--dot) 1px, transparent 1px) 0 0 / 24px 24px; }
.lfs .lfs-cols > .hist { grid-area: h; }
.lfs .lfs-cols > .split { grid-area: s; }
.lfs .lfs-cols > .panel.right { grid-area: w; }
/* where History docks (view.js fitCols): left is the rule above */
.lfs .lfs-cols[data-dock="right"] { grid-template-areas: "w s h"; grid-template-columns: minmax(560px, 1fr) 14px minmax(var(--histmin, 360px), var(--histw, 440px)); }
.lfs .lfs-cols[data-stack] { grid-template-areas: "h" "s" "w"; grid-template-columns: minmax(0, 1fr); grid-template-rows: var(--histh, 560px) 14px var(--workrow, minmax(640px, auto)); overflow-y: auto; }
.lfs .lfs-cols[data-stack][data-dock="bottom"] { grid-template-areas: "w" "s" "h"; grid-template-rows: var(--workrow, minmax(640px, auto)) 14px var(--histh, 560px); }
/* Files widened: History takes 55% whatever its dragged width */
.lfs .lfs-cols.wide:not([data-stack]) { --histw: 55% !important; --histmin: 55% !important; }
/* one window or both (the switch in the status bar); the divider resizes History */
.lfs .lfs-cols[data-panes="history"] { grid-template-areas: "h"; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
.lfs .lfs-cols[data-panes="work"] { grid-template-areas: "w"; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
.lfs .lfs-cols[data-panes="history"] > .split, .lfs .lfs-cols[data-panes="history"] > .panel.right { display: none; }
.lfs .lfs-cols[data-panes="work"] > .split, .lfs .lfs-cols[data-panes="work"] > .hist { display: none; }
.lfs .lfs-cols.dragging { cursor: col-resize; user-select: none; }
.lfs .lfs-cols[data-stack].dragging, .lfs .lfs-cols[data-stack] > .split { cursor: row-resize; }
.lfs .split.cols::after { left: 6.5px; background: transparent; }
.lfs .split.cols:hover::after, .lfs .lfs-cols.dragging .split.cols::after { left: 6px; width: 2px; background: var(--accent); }
.lfs .lfs-cols[data-stack] > .split::after { inset: 6.5px 0 auto 0; width: auto; height: 1px; }
.lfs .lfs-cols[data-stack] > .split:hover::after, .lfs .lfs-cols[data-stack].dragging > .split::after { inset: 6px 0 auto 0; width: auto; height: 2px; }
/* docking: a window is grabbed by its grip (or its header's empty part) */
.lfs .lfs-cols.docking, .lfs .lfs-cols.docking * { cursor: grabbing !important; user-select: none; }
.lfs .grip { display: none; flex: none; width: 10px; height: 18px; margin-right: 2px; cursor: grab; border-radius: 3px; background: radial-gradient(circle, var(--text-3) 1.1px, transparent 1.3px) 0 0 / 5px 5px; opacity: .7; }
.lfs .grip:hover { opacity: 1; background-color: var(--well); }
.lfs .lfs-cols[data-panes="both"] .grip { display: block; }
.lfs .lfs-strip > .grip { align-self: center; margin: 0 4px 0 2px; }
/* the drop targets while a window is dragged (view.js onDockDown) */
.lfs .dockui { position: absolute; }
.lfs .dkprev { position: absolute; display: none; background: rgba(47,91,181,.10); border: 2px dashed var(--accent); border-radius: 10px; transition: left .12s, right .12s, top .12s, bottom .12s; }
.lfs .dkpad { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; grid-template-columns: repeat(3, 72px); grid-template-rows: repeat(3, 58px); gap: 6px; }
.lfs .dkt, .lfs .dkc { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border-radius: 9px; font: 10.5px var(--mono); }
.lfs .dkt { background: var(--card); border: 1px solid var(--line2); color: var(--text-2); box-shadow: 0 4px 14px rgba(30,37,51,.14); transition: background .1s, color .1s; }
.lfs .dkt .dkic { width: 26px; height: 18px; }
.lfs .dkt.cur { border-style: dashed; }
.lfs .dkt.hot { background: var(--accent); border-color: var(--accent); color: #fff; }
.lfs .dkt.off { opacity: .45; box-shadow: none; }
.lfs .dkt[data-z="top"] { grid-area: 1 / 2; } .lfs .dkt[data-z="left"] { grid-area: 2 / 1; } .lfs .dkt[data-z="right"] { grid-area: 2 / 3; } .lfs .dkt[data-z="bottom"] { grid-area: 3 / 2; }
.lfs .dkc { grid-area: 2 / 2; color: var(--accent); font-weight: 600; text-align: center; background: rgba(251,249,245,.9); }
.lfs .dkic { width: 18px; height: 12px; display: block; }
.lfs .dkic rect { fill: none; stroke: currentColor; stroke-width: 1; }
.lfs .dkic rect.f { fill: currentColor; stroke: none; }
.lfs .statusbar .docksw button { padding: 0 6px; }
.lfs .statusbar .docksw button:disabled { opacity: .35; cursor: not-allowed; }
/* the divider's grip: always visible, so it reads as something to drag */
.lfs .split.cols::before { content: ""; position: absolute; left: 4px; top: 50%; width: 6px; height: 40px; margin-top: -20px; border-radius: 3px; background: var(--card) radial-gradient(circle, var(--text-3) 1px, transparent 1.2px) 0 0 / 6px 6px; border: 1px solid var(--line2); z-index: 1; }
.lfs .split.cols:hover::before, .lfs .lfs-cols.dragging .split.cols::before { border-color: var(--accent); }
.lfs .lfs-cols[data-stack] > .split::before { left: 50%; top: 4px; width: 40px; height: 6px; margin: 0 0 0 -20px; }
.lfs .work.histonly { grid-template-columns: minmax(0, 1fr); background: var(--paper); }
.lfs .statusbar .ctl { margin: 0 6px 0 0; align-self: center; }
.lfs .statusbar .ctl button { min-height: 22px; font-size: 11px; }
.lfs .panel.right { overflow: hidden; }
.lfs .panel.right .work { padding: 12px; }
.lfs .lfs-strip { flex: none; display: flex; align-items: flex-end; gap: 8px; padding: 0 10px; background: var(--tab); border-bottom: 1px solid var(--line); }
.lfs .lfs-strip .tabs { flex: 1; }
.lfs .lfs-strip .ib { margin-bottom: 7px; }
/* Narrow widths. The arrangement (the dock rules above) is decided in view.js
   (fitCols): side by side holds while History's minimum (its dragged width,
   else 360 px), 560 px for the work window, the divider and padding fit;
   otherwise the windows stack, History on top, and the view scrolls. */
/* Inside the work window, by the view's width: */
/* under 1280: the main panel's columns share the width evenly */
@container lfs (max-width: 1279px) {
  .lfs .work.mainview { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .lfs .work.mainview.withhist { grid-template-columns: minmax(300px, 360px) minmax(0, 1fr) minmax(0, 1fr); }
  .lfs .work.branchview.withhist { grid-template-columns: minmax(300px, 360px) minmax(0, 1fr); }
  .lfs .tab { min-height: 36px; padding: 6px 10px; font-size: 12.5px; }
}
/* the preview keeps History inside the work area: it stacks under 1000 */
@container lfs (max-width: 999px) {
  .lfs .work.withhist { overflow-y: auto; }
  .lfs .work.mainview.withhist { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: 560px minmax(560px, auto); }
  .lfs .work.branchview.withhist { grid-template-columns: minmax(0, 1fr); grid-template-rows: 560px auto auto minmax(480px, auto); }
  .lfs .work.withhist .hist { grid-column: 1 / -1; grid-row: auto; }
}
/* under 760: one column everywhere; a Branch's terminals one under another */
@container lfs (max-width: 759px) {
  .lfs .lfs-cols { padding: 8px; }
  .lfs .lfs-cols[data-stack] { --workrow: auto; }
  /* stacked, the work window grows with what it holds and the view scrolls */
  .lfs .lfs-cols[data-stack] .panel.right, .lfs .lfs-cols[data-stack] .panel.right .work { overflow: visible; }
  .lfs .lfs-cols[data-stack] .panel.right .work { flex: none; min-height: auto; }
  .lfs .lfs-cols[data-stack] > .panel.right { min-height: auto; }
  /* alone, the work window scrolls inside */
  .lfs .lfs-cols:not([data-stack]) .panel.right .work { overflow-y: auto; }
  .lfs .work .col { min-height: auto; }
  .lfs .work.mainview .wterm { flex: none; height: 300px; }
  .lfs .work.branchview .wgrid { grid-auto-rows: 240px; }
  .lfs .work { padding: 8px; gap: 8px; }
  .lfs .work.mainview, .lfs .work.mainview.withhist { grid-template-columns: minmax(0, 1fr); grid-template-rows: none; }
  .lfs .work.mainview.withhist { grid-template-rows: 480px; }
  .lfs .work.mainview .board { min-height: 320px; }
  .lfs .work.mainview .board.sbp { min-height: 0; max-height: 360px; }
  .lfs .wgrid { grid-template-columns: minmax(0, 1fr); flex: none; overflow: visible; }
  .lfs .binfo { gap: 4px 12px; }
  .lfs .binfo .status { margin-left: 0; }
  .lfs .tab { min-height: 32px; padding: 5px 8px; gap: 6px; }
  .lfs .tab .pin { display: none; }
  .lfs .tlegend .hint { display: none; }
}
`;

/** Adds the stylesheet once per document; returns its element. */
export function injectStyle(doc = document) {
  let el = doc.querySelector("style[data-lfs]");
  if (!el) { el = doc.createElement("style"); el.dataset.lfs = "1"; el.textContent = CSS; doc.head.appendChild(el); }
  return el;
}
