// Runs one VERIFICATION case against the real daemon:
//   node sdk/js/test/verify/run.mjs A1
// Fresh volume and Init, the case once, teardown always, then a receipt under
// core/target/issue327/verify/. Exit 0 on PASS or SKIP, 1 on FAIL.
import { STANDARD } from "./cases_standard.mjs";
import { A } from "./cases_a.mjs";
import { B } from "./cases_b.mjs";
import { C } from "./cases_c.mjs";
import { receipt, setup, teardown } from "./lib.mjs";

const CASES = { ...A, ...B, ...C, ...STANDARD };
const id = process.argv[2];
if (!CASES[id]) {
  console.error(`usage: run.mjs <case>; one of ${Object.keys(CASES).join(" ")}`);
  process.exit(2);
}

const started = Date.now();
const ctx = await setup(id);
let error = null;
try {
  await CASES[id](ctx);
} catch (caught) {
  error = { code: caught.code ?? null, message: caught.message, detail: caught.detail ?? null, stack: caught.stack };
}
const problems = await teardown(ctx);
const failed = ctx.checks.filter((c) => !c.ok);
const outcome = ctx.skip ? "SKIP" : error || failed.length || ctx.checks.length === 0 ? "FAIL" : "PASS";
const path = receipt(ctx, { outcome, error, teardown: problems, skip: ctx.skip ?? null, seconds: (Date.now() - started) / 1000 });
for (const c of ctx.checks) console.log(`${c.ok ? "ok  " : "FAIL"} ${c.name}${c.ok ? "" : `: ${JSON.stringify(c.detail).slice(0, 600)}`}`);
if (error) console.log(`ERROR ${error.code ?? ""} ${error.message}`);
if (ctx.skip) console.log(`SKIP ${ctx.skip}`);
for (const n of ctx.notes) console.log(`note ${n}`);
for (const p of problems) console.log(`teardown ${p}`);
console.log(`${outcome} ${id} in ${((Date.now() - started) / 1000).toFixed(1)} s; receipt ${path}`);
process.exit(outcome === "FAIL" ? 1 : 0);
