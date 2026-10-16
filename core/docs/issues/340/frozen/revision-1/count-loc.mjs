// Status: Current planning checklist; no release candidate exists.
// Frozen Crew counter v1. No packages, parser downloads, or source transformations.
import { readdir, readFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const COUNTER_VERSION = 'crew-production-loc-v1';
const controlWords = new Set(['if', 'while', 'for', 'with', 'switch', 'catch']);
const expressionWords = new Set(['return', 'throw', 'case', 'delete', 'void', 'typeof',
  'new', 'in', 'instanceof', 'yield', 'await', 'of', 'extends']);
const blockWords = new Set(['else', 'do', 'try', 'finally']);
const identifierStart = /[\p{ID_Start}_$]/u;
const identifierPart = /[\p{ID_Continue}$\u200c\u200d]/u;

// The lexer records non-whitespace token characters, including literal payloads.
// It tracks regex/division context, template substitutions, and nested JSX modes.
export function countSource(source) {
  const s = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = new Set();
  let i = 0;
  let line = 1;
  const error = message => { throw new Error(`${message} at line ${line}`); };
  function consume(code = true) {
    const c = s[i++];
    if (c === '\n') line++;
    else if (code && !/\s/u.test(c)) lines.add(line);
    return c;
  }
  function take(n, code = true) { while (n-- > 0) consume(code); }
  function comment() {
    if (s.startsWith('//', i) || (i === 0 && s.startsWith('#!', i))) {
      while (i < s.length && s[i] !== '\n') consume(false);
      return true;
    }
    if (s.startsWith('/*', i)) {
      take(2, false);
      while (i < s.length && !s.startsWith('*/', i)) consume(false);
      if (i === s.length) error('Unterminated block comment');
      take(2, false);
      return true;
    }
    return false;
  }
  function quoted(quote, multiline = false, escapes = true) {
    consume();
    while (i < s.length) {
      const c = consume();
      if (c === '\\' && escapes) {
        if (i === s.length) error('Unterminated string escape');
        consume();
      } else if (c === quote) return;
      else if (c === '\n' && !multiline) error('Unescaped newline in string');
    }
    error('Unterminated string');
  }
  function regex() {
    consume();
    let inClass = false;
    while (i < s.length) {
      const c = consume();
      if (c === '\n') error('Unterminated regular expression');
      if (c === '\\') {
        if (i === s.length) error('Unterminated regular expression escape');
        consume();
      } else if (c === '[') inClass = true;
      else if (c === ']') inClass = false;
      else if (c === '/' && !inClass) {
        while (i < s.length && identifierPart.test(s[i])) consume();
        return;
      }
    }
    error('Unterminated regular expression');
  }
  function template() {
    consume();
    while (i < s.length) {
      if (s[i] === '\\') { consume(); if (i < s.length) consume(); }
      else if (s[i] === '`') { consume(); return; }
      else if (s.startsWith('${', i)) { take(2); js(true); }
      else consume();
    }
    error('Unterminated template');
  }
  function jsx() {
    let depth = 0;
    while (i < s.length) {
      if (s[i] === '<') {
        const closing = s[i + 1] === '/';
        take(closing ? 2 : 1);
        if (!closing) depth++;
        let selfClosing = false;
        let ended = false;
        while (i < s.length) {
          if (s[i] === '"' || s[i] === "'") quoted(s[i], true, false);
          else if (s[i] === '{') { consume(); js(true); }
          else if (s.startsWith('/>', i)) {
            take(2); selfClosing = true; ended = true; break;
          } else if (s[i] === '>') { consume(); ended = true; break; }
          else consume();
        }
        if (!ended) error('Unterminated JSX tag');
        if (closing || selfClosing) depth--;
        if (depth === 0) return;
      } else if (s[i] === '{') { consume(); js(true); }
      else consume();
    }
    error('Unterminated JSX');
  }
  function js(stopAtBrace = false) {
    let expr = true;
    let statement = !stopAtBrace;
    let last = '';
    let pendingFunction = null;
    let pendingClass = null;
    let body = null;
    let labelCandidate = false;
    let casePending = false;
    let restrictedStatement = false;
    const stack = [];
    while (i < s.length) {
      const c = s[i];
      if (/\s/u.test(c)) {
        if (c === '\n' && restrictedStatement) { expr = true; statement = true; restrictedStatement = false; }
        consume(false); continue;
      }
      if (comment()) continue;
      if (c === '"' || c === "'") { quoted(c); expr = false; statement = false; last = 'literal'; continue; }
      if (c === '`') { template(); expr = false; statement = false; last = 'literal'; continue; }
      if (c === '/' && expr) { regex(); expr = false; statement = false; last = 'literal'; continue; }
      if (c === '<' && expr && /[A-Za-z_>]/.test(s[i + 1] ?? '')) {
        jsx(); expr = false; statement = false; last = 'literal'; continue;
      }
      if (identifierStart.test(c) || c === '\\') {
        const start = i;
        consume();
        while (i < s.length && (identifierPart.test(s[i]) || s[i] === '\\')) consume();
        const word = s.slice(start, i);
        const property = last === '.' || last === '?.';
        labelCandidate = statement && !property;
        if (!property && (word === 'case' || word === 'default')) casePending = true;
        if (!property && ['break', 'continue', 'return'].includes(word)) restrictedStatement = true;
        if (!property && word === 'function') pendingFunction = statement ? 'declaration' : 'expression';
        if (!property && word === 'class') pendingClass = statement ? 'declaration' : 'expression';
        expr = !property && (expressionWords.has(word) || blockWords.has(word) ||
          controlWords.has(word) || ['const', 'let', 'var', 'default', 'export', 'import'].includes(word));
        if (word !== 'async' && word !== 'export' && word !== 'default') statement = blockWords.has(word);
        last = property ? 'identifier' : word;
        continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1] ?? ''))) {
        consume();
        while (i < s.length && /[0-9a-fA-F_xXoObBn.eE]/.test(s[i])) consume();
        expr = false; statement = false; last = 'literal'; continue;
      }
      if (c === '(') {
        const kind = pendingFunction ? `function-${pendingFunction}` : controlWords.has(last) ? 'control' : 'expression';
        pendingFunction = null;
        stack.push({ close: ')', kind });
        consume(); expr = true; statement = false; last = '('; continue;
      }
      if (c === '[') {
        stack.push({ close: ']', kind: 'expression' });
        consume(); expr = true; statement = false; last = '['; continue;
      }
      if (c === '{') {
        let kind;
        if (body) { kind = body; body = null; }
        else if (pendingClass) { kind = `class-${pendingClass}`; pendingClass = null; }
        else if (last === '=>') kind = 'function-expression';
        else kind = statement || last === ')' || blockWords.has(last) ? 'block' : 'object';
        stack.push({ close: '}', kind });
        consume(); expr = true; statement = kind !== 'object'; last = '{'; continue;
      }
      if (c === ')' || c === ']' || c === '}') {
        if (c === '}' && stack.length === 0 && stopAtBrace) { consume(); return; }
        const context = stack.pop();
        if (!context || context.close !== c) error(`Unmatched ${c}`);
        consume();
        if (context.kind.startsWith('function-') && c === ')') body = context.kind;
        expr = context.kind === 'control' || context.kind === 'block' ||
          (c === '}' && ['function-declaration', 'class-declaration'].includes(context.kind));
        statement = expr;
        last = c; continue;
      }
      let token = ['>>>=', '===', '!==', '**=', '&&=', '||=', '??=', '>>>', '...',
        '=>', '==', '!=', '<=', '>=', '++', '--', '&&', '||', '??', '?.', '**',
        '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>'].find(t => s.startsWith(t, i)) ?? c;
      take(token.length);
      if (token === ';') { expr = true; statement = true; }
      else if (token === '++' || token === '--') { statement = false; }
      else if (token === '.' || token === '?.') { expr = false; statement = false; }
      else {
        expr = true;
        statement = token === ':' && (labelCandidate || casePending);
        if (statement) casePending = false;
      }
      labelCandidate = false;
      last = token;
    }
    if (stopAtBrace || stack.length) error('Unclosed JavaScript delimiter');
  }
  js();
  return lines.size;
}

const excludedDirectory = /^(?:test|tests|__tests__|__mocks__|fixtures?|mocks?|examples?|bench(?:marks?)?|node_modules|dist|coverage|generated|vendor|third_party)$/i;
const excludedFile = /(?:^|[._-])(?:test|spec|fixture|mock|bench|generated)(?:[._-]|$)/i;
export function isProductionPath(name) {
  const parts = name.split('/');
  if (parts[0] !== 'packages' || parts.length < 4) return false;
  if (!(parts[2] === 'src' || (parts[1] === 'cli' && parts[2] === 'bin'))) return false;
  if (!/\.(?:js|jsx|mjs|cjs)$/.test(parts.at(-1))) return false;
  return !parts.slice(3, -1).some(p => excludedDirectory.test(p)) && !excludedFile.test(parts.at(-1));
}

export async function countProject(root) {
  const files = [];
  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (const entry of entries) {
      const full = path.join(directory, entry.name);
      const relative = path.relative(root, full).split(path.sep).join('/');
      if (entry.isSymbolicLink()) throw new Error(`Symlink in count scope: ${relative}`);
      if (entry.isDirectory()) {
        if (!excludedDirectory.test(entry.name)) await walk(full);
      } else if (entry.isFile() && isProductionPath(relative)) {
        files.push({ path: relative, package: relative.split('/')[1], prod: countSource(await readFile(full, 'utf8')) });
      }
    }
  }
  const packageRoot = path.join(root, 'packages');
  if ((await lstat(packageRoot)).isSymbolicLink()) throw new Error('Symlink in count scope: packages');
  for (const entry of (await readdir(packageRoot, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    if (entry.isSymbolicLink()) throw new Error(`Symlink in count scope: packages/${entry.name}`);
    if (!entry.isDirectory()) continue;
    for (const folder of entry.name === 'cli' ? ['src', 'bin'] : ['src']) {
      const location = path.join(packageRoot, entry.name, folder);
      try { await lstat(location); } catch (e) { if (e.code === 'ENOENT') continue; throw e; }
      if ((await lstat(location)).isSymbolicLink()) throw new Error(`Symlink in count scope: packages/${entry.name}/${folder}`);
      await walk(location);
    }
  }
  files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const packages = {};
  for (const file of files) packages[file.package] = (packages[file.package] ?? 0) + file.prod;
  return { counter: COUNTER_VERSION, scope: 'packages/*/src/** and packages/cli/bin/**; JS/JSX/MJS/CJS; no tests/generated/vendor',
    total: files.reduce((sum, file) => sum + file.prod, 0), packages, files };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const root = path.resolve(args.find(a => !a.startsWith('--')) ?? '.');
  const unknown = args.filter(a => a.startsWith('--') && a !== '--check');
  if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(', ')}`);
  const result = await countProject(root);
  console.log(JSON.stringify(result, null, 2));
  if (args.includes('--check') && result.total < 10_000) process.exitCode = 1;
}
