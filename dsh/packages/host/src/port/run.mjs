// One binding call of a ported Live project, in the LayerFS box (binding.js).
// stdin: the call, v8-serialized { fn, op, args, open }; stdout: its answer,
// v8-serialized, and nothing else. LAYERFS_NATIVE is the box's Linux binding.
// With `open`, the project's Store is opened before the call and closed after
// it. A spooled exec's output is read here and returned whole, then released,
// because the spool lives in this process. The call is made once.
import { createRequire } from "node:module";
import { deserialize, serialize } from "node:v8";

console.log = console.error; // stdout carries only the answer
const PAGE = 1 << 20;

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const { fn, op, args, open } = deserialize(Buffer.concat(chunks));
const binding = createRequire(import.meta.url)(process.env.LAYERFS_NATIVE);
const store = { project: args.project, home: args.home, storePath: args.storePath };

/** A spooled exec's streams as text (bytes for sinks, `spool`), released after. */
async function whole(answer) {
  const { output, ...value } = answer.value;
  const page = Buffer.allocUnsafe(PAGE);
  try {
    for (const name of ["stdout", "stderr"]) {
      if (value[name] !== null) continue;
      const parts = [];
      for (let offset = 0, end = false; !end; ) {
        const read = await binding.execOutput({ output, stream: name, offset }, page);
        if (read.refused) return read;
        if (!read.value.end && read.value.length === 0) return { refused: { code: "Failed", message: `${name} page at ${offset} was empty`, detail: null } };
        parts.push(Buffer.from(page.subarray(0, read.value.length)));
        offset += read.value.length;
        end = read.value.end;
      }
      const bytes = Buffer.concat(parts);
      value[`${name}Bytes`] = bytes.length;
      value[name] = args.spool ? bytes : bytes.toString("utf8");
    }
  } finally {
    await binding.call("sandbox.exec_release", { output });
  }
  return { ...answer, value };
}

let answer;
try {
  const held = open ? await binding.storeOpen(store) : null;
  if (held?.refused) answer = held;
  else {
    try {
      answer = await binding[fn](op, args);
      if (fn === "call" && op === "sandbox.exec" && answer.value?.output !== undefined) answer = await whole(answer);
    } finally {
      if (held) await binding.storeClose(store);
    }
  }
} catch (error) {
  answer = { thrown: String(error?.stack ?? error) };
}
process.stdout.write(serialize(answer));
