import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { CODES, isRefusal, LayerFS } from '../src/index.js';
import { LayerFSOperator } from '../operator/index.js';
import { native } from '../src/native.js';

process.env.LAYERFS_NATIVE = fileURLToPath(new URL('./fixture/service-native.cjs', import.meta.url));
process.env.LAYERFS_HOME = '/private/selection-test';
const binding = native();

test('an explicitly selected existing Sandbox serves the client without automatic discovery', async () => {
  binding.calls.length = 0;
  const client = new LayerFS('selection', { sandbox: 'sb_worker' });
  assert.equal(await client.service(), 'sb_worker');
  assert.equal(await client.service(), 'sb_worker');
  assert.deepEqual(binding.calls, []);
});

test('public file and Branch operations retain the selected Sandbox and project', async () => {
  binding.calls.length = 0;
  const client = new LayerFS('selection', { sandbox: 'sb_worker' });
  await client.fs.read('work', '/README.md');
  await client.branch.fork('next', 'work');
  assert.deepEqual(binding.calls.map(v => v.op), ['fs.read', 'branch.fork']);
  assert.ok(binding.calls.every(v => v.args.sandbox === 'sb_worker' && v.args.project === 'selection'));
});

test('operator Store observations use the same explicitly selected route', async () => {
  binding.calls.length = 0;
  const client = new LayerFS('selection', { sandbox: { id: 'sb_worker' } });
  const stats = await new LayerFSOperator(client).store.stats();
  assert.equal(stats.sandbox, 'sb_worker');
  assert.equal(stats.dedupe, 2);
  assert.deepEqual(binding.calls.map(v => v.op), ['operator.store.stats']);
});

test('default clients still discover one reusable automatic service', async () => {
  binding.calls.length = 0;
  const client = new LayerFS('selection');
  await client.fs.read('work', '/README.md');
  await client.fs.read('work', '/README.md');
  assert.deepEqual(binding.calls.map(v => v.op), ['sandbox.service', 'fs.read', 'fs.read']);
  assert.ok(binding.calls.slice(1).every(v => v.args.sandbox === 'sb_automatic'));
});

test('a refused selected route remains refused without creating or replaying a service', async () => {
  binding.calls.length = 0;
  const client = new LayerFS('selection', { sandbox: 'sb_missing' });
  await assert.rejects(client.fs.read('work', '/README.md'), { code: 'NoSuchSandbox' });
  assert.deepEqual(binding.calls.map(v => v.op), ['fs.read']);
});

test('binary text reads preserve the daemon refusal and advertise its stable code', async () => {
  binding.calls.length = 0;
  const client = new LayerFS('selection', { sandbox: 'sb_worker' });
  await assert.rejects(client.fs.read('work', '/binary.dat'), error => {
    assert.equal(isRefusal(error, 'Binary'), true);
    assert.equal(error.detail, null);
    assert.equal(CODES.includes(error.code), true);
    return true;
  });
  assert.deepEqual(binding.calls.map(v => v.op), ['fs.read']);
  assert.equal(binding.calls[0].args.sandbox, 'sb_worker');
});

test('invalid explicit selections are rejected before any native call', () => {
  binding.calls.length = 0;
  for (const sandbox of [null, '', {}, 1]) {
    assert.throws(() => new LayerFS('selection', { sandbox }), { code: 'InvalidInput' });
  }
  assert.deepEqual(binding.calls, []);
});

test('constructing an explicitly selected client performs no native operation', () => {
  binding.calls.length = 0;
  new LayerFS('selection', { sandbox: 'sb_worker' });
  assert.deepEqual(binding.calls, []);
});
