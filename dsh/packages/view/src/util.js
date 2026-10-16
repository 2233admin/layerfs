// Small text helpers shared by the view's modules.

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export const fmtBytes = (n) => (n == null ? "not reported" : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);

export const ratio = (a, b) => (b > 0 ? `×${(a / b).toFixed(a / b >= 10 ? 0 : 1)}` : "–");

export const bar = (p, m) => `<span class="sbar"><i class="p" style="flex:${p} 0 0"></i><i class="m" style="flex:${m} 0 0"></i></span>`;

// Diagnostic timing per call (issue #329 C), as tui.html shows it: live is the
// SDK call, the server's refresh and the HTTP round trip; sim is the in-page
// model and says nothing about the product. Neither is a measurement.
export const fmtMs = (ms) => (ms < 1 ? ms.toFixed(2) : ms < 1000 ? ms.toFixed(0) : (ms / 1000).toFixed(2) + " s").replace(/(\d)$/, "$1 ms").replace(/ s ms$/, " s");

export function timingText(t) {
  if (!t) return "";
  if (t.simulated) return `${fmtMs(t.totalMs)} in the page (sim)`;
  if (t.reset) return `${fmtMs(t.totalMs)} · server reset: new volume + Init`;
  if (t.traced) return `${fmtMs(t.sdkMs)} SDK call, from its trace line`;
  const http = Math.max(0, t.totalMs - (t.sdkMs || 0) - (t.refreshMs || 0));
  return `sdk ${fmtMs(t.sdkMs || 0)} · refresh ${fmtMs(t.refreshMs || 0)} · http ${fmtMs(http)}`;
}

export function cmdTime(calls) {
  const ts = (calls || []).map((c) => c.timing).filter(Boolean);
  if (!ts.length) return "";
  const sum = ts.reduce((a, t) => a + (t.simulated || t.reset ? t.totalMs : t.sdkMs || 0), 0);
  return `<span class="tm" title="${ts[0].simulated ? "Time of the simulator in the page, not the product" : "SDK call time, summed over this line's calls"}">${fmtMs(sum)}${ts[0].simulated ? " sim" : ""}</span>`;
}
