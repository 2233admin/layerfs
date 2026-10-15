// Opt-in per-call trace: one JSON line per SDK or operator call, appended to
// the client's `trace` file (LAYERFS_TRACE). Off when no file is named. The
// line never holds file contents, and a failed trace write is dropped: it
// never changes the call's value or refusal.
import { appendFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const RUN = randomBytes(4).toString("hex");
let next = 0;
/** Fields whose text is file content: only their byte length is traced. */
const CONTENT = new Set(["content", "bytes", "oldText", "newText"]);
/** Deployment and discovery settings are not call arguments. */
const SETTINGS = new Set(["deploy", "home", "project"]);
const TEXT = 200;

const size = (value) => (typeof value === "string" ? Buffer.byteLength(value) : value?.length ?? 0);
const short = (text) => (text.length > TEXT ? `${text.slice(0, TEXT)}…` : text);

/** Paths, refs, ids, flags and numbers; content as byte counts; lists as counts. */
export function summary(args = {}) {
  const out = {};
  for (const [name, value] of Object.entries(args)) {
    if (SETTINGS.has(name) || value === undefined) continue;
    if (CONTENT.has(name)) out[`${name}Bytes`] = size(value);
    else if (name === "changes" && Array.isArray(value)) {
      out.changes = value.length;
      out.changeBytes = value.reduce((total, change) => total + [...CONTENT].reduce((sum, field) => sum + size(change?.[field]), 0), 0);
    } else if (typeof value === "string") out[name] = short(value);
    else if (typeof value === "number" || typeof value === "boolean" || value === null) out[name] = value;
    else if (Array.isArray(value)) out[name] = value.length;
  }
  return out;
}

/** The Commit id and its size counters, when the value carries a Commit. */
function committed(value) {
  if (!value || typeof value !== "object") return {};
  const record = value.commit && typeof value.commit === "object" ? value.commit : null;
  const out = {};
  if (value.kind) out.kind = value.kind;
  const id = record?.id ?? (typeof value.commit === "string" ? value.commit : undefined);
  if (id) out.commit = id;
  if (record && "logical" in record) {
    out.sizes = { logical: record.logical, newCanonical: record.newCanonical, newStored: record.newStored, newMetadata: record.newMetadata };
  }
  return out;
}

/** One daemon telemetry value with its flat timing nodes as a tree. */
function daemon(telemetry) {
  const { timing, ...rest } = telemetry ?? {};
  const nodes = [];
  const roots = [];
  for (const [name, parent, us, outcome, incomplete] of timing?.nodes ?? []) {
    const node = { name, ms: us / 1000, ...(outcome === "ok" ? {} : { outcome }), ...(incomplete ? { incomplete } : {}), children: [] };
    nodes.push(node);
    (parent >= 0 && nodes[parent] ? nodes[parent].children : roots).push(node);
  }
  return { timing: roots, ...(timing?.omitted ? { omitted: timing.omitted } : {}), ...rest };
}

/** Sends one call once through `send(scope)` and returns the binding's
 * answer. When `file` is set the call is traced: `send` gets a fresh scope,
 * the answer's telemetry goes to the trace line and is removed from it. */
export async function traced(file, method, args, send) {
  if (!file) return send(null);
  const id = `${RUN}-${++next}`;
  const scope = randomBytes(32).toString("hex");
  const start = new Date();
  const began = performance.now();
  let line;
  try {
    line = { layerfs_trace: 1, id, method, args: summary(args), start: start.toISOString(), scope };
  } catch {
    line = { layerfs_trace: 1, id, method, args: null, start: start.toISOString(), scope };
  }
  let answer;
  try {
    answer = await send(scope);
  } catch (error) {
    write(file, { ...line, ms: elapsed(began), ok: false, code: error?.code ?? null, message: error?.message ?? String(error) });
    throw error;
  }
  const { telemetry, ...plain } = answer;
  const ms = elapsed(began);
  try {
    const result = plain.refused
      ? { ok: false, code: plain.refused.code, message: plain.refused.message }
      : { ok: true, ...committed(plain.value) };
    write(file, { ...line, ms, ...result, ...(telemetry ? { daemon: telemetry.map(daemon) } : {}) });
  } catch {
    write(file, { ...line, ms, ok: !plain.refused });
  }
  return plain;
}

const elapsed = (began) => Math.round((performance.now() - began) * 1000) / 1000;

function write(file, line) {
  try {
    appendFileSync(file, `${JSON.stringify(line)}\n`);
  } catch {
    // A trace is diagnostic; its failure is not the call's.
  }
}
