// Status: Current planning checklist; no release candidate exists.
// External tests; fixtures are made under an owned temporary directory and removed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { countSource, countProject, isProductionPath } from './count-loc.mjs';

const cases = [
  ['empty and whitespace', '\n \t\n', 0],
  ['BOM hashbang', '\uFEFF#!/usr/bin/env node\nconsole.log(1);\n', 1],
  ['line comments', '// one\n  // two\n', 0],
  ['block comments', '/* one\n * two\n */\n', 0],
  ['mixed line comments', 'const x = 1; // comment\n// only\nx++;\n', 2],
  ['mixed block comments', '/* comment */ const x = 1; /* tail */\n/*\n*/ x++;\n', 2],
  ['hashbang', '#!/usr/bin/env node\nconsole.log(1);\n', 1],
  ['quoted comment markers', 'const x = "// comment";\nconst y = \'/* comment */\';\n', 2],
  ['escaped quotes', 'const x = "a\\\"//b"; // tail\n', 1],
  ['continued strings', 'const x = "a\\\n//b";\n', 2],
  ['multiline template raw', 'const x = `a\n// b\n/* c */\n`;\n', 4],
  ['template comments', 'const x = `${\n/* hidden\n*/\n1\n}`;\n', 3],
  ['nested templates', 'const x = `${`a${\n// hidden\n2\n}`}z`;\n', 3],
  ['regex comment tokens', 'const re = /[/*]+\\/\\//g; // tail\n', 1],
  ['regex after return', 'function f() {\nreturn /[/*]/;\n}\n', 3],
  ['regex after labeled block', 'label: {}\n/[/*]/.test(x);\n', 2],
  ['regex after continue label newline', 'label: while (x) { continue label\n/[/*]/.test(x); }\n', 2],
  ['regex after switch case block', 'switch (x) { case 1: {}\n/[/*]/.test(x); }\n', 2],
  ['regex after control', 'if (ok) /[/*]/.test(x);\n// hidden\n', 1],
  ['regex after block', 'if (ok) {}\n/[/*]/.test(x);\n', 2],
  ['regex after function declaration', 'function f() {}\n/[/*]/.test(x);\n', 2],
  ['division after function expression', 'const f = function () {} / 2; // tail\n', 1],
  ['division after object', 'const n = { n: 4 }.n / 2; // tail\n', 1],
  ['division then block comment', 'const x = a / /* hidden\n*/ b;\n', 2],
  ['division assignment', 'x /= 2;\n// hidden\n', 1],
  ['regex after arrow', 'const f = () => /[/*]/;\n', 1],
  ['regex after keyword property is division', 'const n = a.return / 2; // hidden\n', 1],
  ['regex inside template expression', 'const x = `${/[/*]/.test("/")}`;\n', 1],
  ['jsx text comment markers', 'const v = <p>\n// text\n/* text */\n</p>;\n', 4],
  ['jsx comments', 'const v = <p>\n{/* hidden\ncomment */}\ntext\n</p>;\n', 5],
  ['jsx comment middle line', 'const v = <p>\n{/* start\nhidden line\nend */}\n</p>;\n', 4],
  ['jsx mixed nested expression', 'const v = <><A title="//">{\n// hidden\nx ? <b>{`//${x}`}</b> : null\n}</A></>;\n', 3],
  ['jsx multiline attribute', 'const v = <A title="a\n/* text */\n" />;\n', 3],
  ['less than operator', 'const x = a < b && c > d; // hidden\n', 1],
  ['CRLF normalization', '// hidden\r\nconst x = 1;\r\n', 1],
  ['class expression division', 'const X = class {};\nconst n = X / 2;\n', 2],
  ['function declaration export', 'export default function f() {}\n/[/*]/.test(x);\n', 2],
];
for (const [name, source, expected] of cases) {
  test(name, () => assert.equal(countSource(source), expected));
}
for (const [name, source] of [
  ['comment', '/* missing'], ['string', '"missing'], ['template', '`missing'],
  ['regex', 'const x = /missing'], ['jsx', 'const x = <p>missing'],
  ['delimiter', 'const x = (1;'],
]) test(`reject unterminated ${name}`, () => assert.throws(() => countSource(source)));

test('production scope includes only declared application source', () => {
  for (const name of ['packages/shared/src/a.js', 'packages/web/src/a.jsx', 'packages/cli/bin/crew.js']) assert.equal(isProductionPath(name), true, name);
  for (const name of ['scripts/a.js', 'packages/server/test/a.js', 'packages/web/src/a.css',
    'packages/server/src/a.test.js', 'packages/server/src/test/a.js', 'packages/server/src/fixtures/a.js',
    'packages/server/src/__tests__/a.js', 'packages/server/src/a.mock.js',
    'packages/server/src/generated/a.js', 'packages/server/src/vendor/a.js', 'packages/server/bin/a.js']) {
    assert.equal(isProductionPath(name), false, name);
  }
});

test('temporary project has deterministic per-file/per-package and CLI counts', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'crew-loc-test-'));
  try {
    const fixtures = {
      'packages/web/src/view.jsx': 'export const view = <p>\n// text\n</p>;\n',
      'packages/shared/src/index.js': '// hidden\nexport const a = 1;\n',
      'packages/cli/bin/crew.js': '#!/usr/bin/env node\nconsole.log(1);\n',
      'packages/cli/src/client.js': 'export const url = "http://localhost";\n',
      'packages/server/src/nested/logic.js': '/* hidden */\nexport const n = 2;\n',
      'packages/server/src/nested/logic.test.js': 'test("x", () => {});\n',
      'packages/server/src/tests/example.js': 'test("x", () => {});\n',
      'packages/web/dist/app.js': 'console.log(1);\n',
      'scripts/task.js': 'console.log(1);\n',
    };
    for (const [name, content] of Object.entries(fixtures)) {
      await mkdir(path.dirname(path.join(root, name)), { recursive: true });
      await writeFile(path.join(root, name), content);
    }
    const first = await countProject(root);
    const second = await countProject(root);
    assert.deepEqual(first, second);
    assert.equal(first.total, 7);
    assert.deepEqual(first.packages, { cli: 2, server: 1, shared: 1, web: 3 });
    assert.deepEqual(first.files.map(f => f.path), [...first.files.map(f => f.path)].sort());
    const cli = JSON.parse(execFileSync(process.execPath, [fileURLToPath(new URL('./count-loc.mjs', import.meta.url)), root], { timeout: 5000, encoding: 'utf8' }));
    assert.deepEqual(cli, first);
    assert.throws(() => execFileSync(process.execPath, [fileURLToPath(new URL('./count-loc.mjs', import.meta.url)), root, '--check'], { timeout: 5000, stdio: 'pipe' }));
    await symlink('client.js', path.join(root, 'packages/cli/src/link.js'));
    await assert.rejects(countProject(root), /Symlink/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
