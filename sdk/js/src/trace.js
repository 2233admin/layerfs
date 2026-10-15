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

/** Runs `call` once and, when `file` is set, appends its trace line. */
export async function traced(file, method, args, call) {
  if (!file) return call();
  const id = `${RUN}-${++next}`;
  const start = new Date();
  const began = performance.now();
  let line;
  try {
    line = { layerfs_trace: 1, id, method, args: summary(args), start: start.toISOString() };
  } catch {
    line = { layerfs_trace: 1, id, method, args: null, start: start.toISOString() };
  }
  try {
    const value = await call();
    write(file, { ...line, ms: elapsed(began), ok: true, ...committed(value) });
    return value;
  } catch (error) {
    write(file, { ...line, ms: elapsed(began), ok: false, code: error?.code ?? null, message: error?.message ?? String(error) });
    throw error;
  }
}

const elapsed = (began) => Math.round((performance.now() - began) * 1000) / 1000;

function write(file, line) {
  try {
    appendFileSync(file, `${JSON.stringify(line)}\n`);
  } catch {
    // A trace is diagnostic; its failure is not the call's.
  }
}
