"""Fail closed on mismatched stopped host-file custody; never opens SQLite or SDK."""
import gzip
import hashlib
import json
from datetime import datetime
from pathlib import Path

RUN = Path('/Users/yifanxu/.codex/issue340-independent/b2-r1')
OUT = RUN / 'analysis-preparation'
DOC = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs/core/docs/issues/340')
sources = {}
def pin(path):
    path = Path(path).resolve()
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
def read(path):
    path = Path(path)
    sources[str(path.resolve())] = pin(path)
    return path.read_bytes()
def load(path):
    return json.loads(read(path))
def stamp(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00')).timestamp()
def save(path, value):
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2, ensure_ascii=False) + '\n')

normalization = load(RUN / 'normalized-receipts/normalization.json')
assert normalization['traceCount'] == normalization['normalizedCount'] == 145
assert normalization['unjoinedRawReceipts'] == normalization['tracesWithoutFullReceipt'] == []
for row in normalization['sources']:
    assert pin(row['path']) == row
    sources[row['path']] = row
calls = [json.loads(line) for line in read(RUN / 'normalized-receipts/calls.jsonl').decode().splitlines()]
traces = []
for path in sorted((RUN / 'trace').glob('*.jsonl')):
    traces += [dict(json.loads(line), agent=path.stem) for line in read(path).decode().splitlines() if line.strip()]
assert len({row['id'] for row in traces}) == len(traces) == 145
assert {row['traceId'] for row in calls} == {row['id'] for row in traces}
by_id = {row['id']: row for row in traces}
assert {agent: sum(row['agent'] == agent for row in traces) for agent in ('lead', 'P1', 'main')} == {'lead': 52, 'P1': 67, 'main': 26}
for agent, count in [('lead', 52), ('P1', 67)]:
    raw = [load(path) for path in sorted((RUN / 'agents' / agent / 'out/calls').glob('*.json'))]
    assert len(raw) == count and sorted(row['sequence'] for row in raw) == list(range(1, count + 1))
    close = raw[-1]
    assert close['method'] == 'sandbox.close' and close['result']['kind'] == 'Closed'
    last = max((row for row in traces if row['agent'] == agent), key=lambda row: stamp(row['start']))
    assert last['method'] == 'sandbox.close' and last['ok'] is True
    assert not [row for row in traces if row['agent'] == agent and stamp(row['start']) > stamp(close['end'])]

active_sandboxes, active_workspaces = set(), set()
service = load(RUN / 'observer-service.json')['id']
active_sandboxes.add(service)
closed, creates, mounts, unmounts = {}, [], [], []
for call in sorted(calls, key=lambda row: stamp(by_id[row['traceId']]['start'])):
    trace = by_id[call['traceId']]
    method, args, result = call['method'], call['args'], call.get('result')
    if not trace['ok']:
        continue
    if method == 'sandbox.create':
        identity = result if isinstance(result, str) else result['id']
        assert identity not in active_sandboxes
        active_sandboxes.add(identity)
        creates.append({'id': identity, 'traceId': trace['id']})
    elif method == 'sandbox.mount':
        identity = (result.get('sandbox', args.get('sandbox')), result['path'])
        assert all(identity) and identity not in active_workspaces
        active_workspaces.add(identity)
        mounts.append({'sandbox': identity[0], 'path': identity[1], 'traceId': trace['id']})
    elif method == 'sandbox.unmount':
        identity = (args['sandbox'], args['path'])
        assert identity in active_workspaces
        active_workspaces.remove(identity)
        unmounts.append({'sandbox': identity[0], 'path': identity[1], 'traceId': trace['id']})
    elif method == 'sandbox.close':
        identity = result['id']
        assert identity in active_sandboxes
        assert not [key for key in active_workspaces if key[0] == identity]
        active_sandboxes.remove(identity)
        closed[identity] = call
assert len(creates) == 2 and len(closed) == 3
assert active_sandboxes == active_workspaces == set()
assert len(mounts) == len(unmounts)
for row in traces:
    sandbox = row.get('args', {}).get('sandbox')
    if sandbox in closed and row['method'] != 'sandbox.close':
        assert stamp(row['start']) < stamp(closed[sandbox]['start'])

log_rows = []
for agent in ('lead', 'P1'):
    folder = RUN / 'agents' / agent
    collection = load(folder / 'daemon/collection.json')
    identity = collection.get('sandbox', 'sb_' + collection.get('container', ''))
    assert collection.get('exitCode', collection.get('status')) == 0
    close = closed[identity]
    assert stamp(collection['end']) < stamp(close['start'])
    for stream in ('stdout', 'stderr'):
        path = folder / 'daemon' / (stream + '.log')
        data = read(path)
        expected = collection.get('streams', {}).get(stream + '.log')
        if expected:
            assert len(data) == expected['bytes'] and hashlib.sha256(data).hexdigest() == expected['sha256']
        else:
            assert len(data) == collection[stream + 'Bytes'] and hashlib.sha256(data).hexdigest() == collection[stream + 'Sha256']
        log_rows.append({'agent': agent, 'stream': stream, **pin(path), 'collectionEnd': collection['end'], 'closeStart': close['start']})
before = load(RUN / 'observer-final-jsonlog/before.json')
after = load(RUN / 'observer-final-jsonlog/after.json')
verified = load(RUN / 'observer-final-jsonlog/verified.json')
assert before == after == verified['source'] and verified['status'] == 'PASS'
archive = RUN / 'observer-final-jsonlog/docker-json.log.gz'
assert pin(archive) == verified['archive']
read(archive)
data = gzip.decompress(archive.read_bytes())
assert len(data) == 561971 == before['bytes'] and hashlib.sha256(data).hexdigest() == before['sha256']
records = [json.loads(line) for line in data.splitlines()]
assert len(records) == verified['records'] == 1430
for stream in ('stdout', 'stderr'):
    path = RUN / 'observer-final-jsonlog' / (stream + '.log')
    decoded = ''.join(row['log'] for row in records if row['stream'] == stream).encode()
    assert read(path) == decoded and pin(path) == verified[stream]
    log_rows.append({'agent': 'main', 'stream': stream, **pin(path), 'source': 'complete retained Docker json-file; per-stream exact decode'})
root_close = load(RUN / 'observer-close.json')
assert root_close['result']['kind'] == 'Closed' and root_close['result']['id'] == service
root_trace = max(traces, key=lambda row: stamp(row['start']))
assert root_trace['agent'] == 'main' and root_trace['method'] == 'sandbox.close'
for number in range(5, 13):
    path = next((RUN / 'receipts').glob(f'{number:03d}-*.json'))
    row = load(path)
    assert row['exitCode'] == 0 and row['timedOut'] is False
    read(path.with_suffix('.stdout')); read(path.with_suffix('.stderr'))
    if number == 10:
        assert stamp(row['started']) + row['elapsed'] < stamp(root_close['start'])
    if number == 12:
        assert 'ps' in row['command'] and '-a' in row['command']
        assert path.with_suffix('.stdout').read_bytes() == b''
        assert stamp(row['started']) > stamp(root_close['end'])
summary = load(RUN / 'final-collection/summary.json')
assert len(summary['branches']) == 9 and len(summary['layers']) == 3 and summary['moreLayers'] is False
stats = load(RUN / 'final-collection/final-stats.json')
final_calls = [row for row in calls if row['agent'] == 'main' and (row['step'] or '').startswith('main-final-')]
assert len(final_calls) == 19 and max(final_calls, key=lambda row: stamp(by_id[row['traceId']]['start']))['method'] == 'operator.store.stats'
assert stats['result'] == summary['stats']
report = load(RUN / 'agents/lead/REPORT.json')
assert report['status'] == 'FAILED' and report['acceptanceBranch'] is None
assert all(f'A{x:02d}' in report['unrunGates'] for x in range(1, 16))
for agent in ('W1', 'W2', 'I1', 'I2'):
    assert not [p for p in (RUN / 'agents' / agent).rglob('*') if p.is_file()]
    assert agent in report['unrunRoles']
expected_notes = {'agents/lead/NOTES.md': '20995b128520392f00f5abfd8e1e705ac1e289c421f64b0487b994b51266e529',
                  'agents/P1/NOTES.md': '039c1c5a2ebde6c8af0ef95bfbe9156f542138bf11e18ffeaaac00e3a46883c9'}
for name, sha in expected_notes.items():
    assert pin(RUN / name)['sha256'] == sha
assert read(RUN / 'agents/P1/NOTES.md') == read(RUN / 'agents/lead/workers/P1-NOTES.md')
verbatim = DOC / 'verbatim/b2-r1'
verbatim.mkdir(parents=True, exist_ok=False)
copied = []
for name, dest in [('agents/lead/REPORT.json', 'lead-REPORT.json'), ('agents/lead/NOTES.md', 'lead-NOTES.md'),
                   ('agents/P1/NOTES.md', 'P1-NOTES.md'), ('agents/lead/out/inventory-exposure-transcription.json', 'inventory-exposure-transcription.json')]:
    content = read(RUN / name)
    (verbatim / dest).write_bytes(content)
    assert pin(verbatim / dest)['sha256'] == pin(RUN / name)['sha256']
    copied.append({'source': pin(RUN / name), 'copy': pin(verbatim / dest)})
save(verbatim / 'source-manifest.json', {'classification': 'Verbatim failed-attempt records; manual exposure transcription preserves its stated provenance', 'copies': copied})
checks = {'trace_receipt_bijection': True, 'all_sandbox_closes_successful': True, 'balanced_workspace_custody': True,
          'no_sdk_after_each_owner_close': True, 'both_team_log_captures_before_close': True,
          'observer_full_json_file_decode_before_close': True, 'final_stats_last_collection_sdk_call': True,
          'final_stopped_ps_a_empty': True, 'verbatim_hashes_match': True}
answer = {'status': 'PASS', 'classification': 'Host-file custody verification only; run independence remains FAILED',
          'checks': checks, 'sdkTraces': len(traces), 'fullReceipts': len(calls), 'callPopulation': {'lead': 52, 'P1': 67, 'main': 26},
          'createdTeamSandboxes': creates, 'closedSandboxes': [{'id': key, 'closeStart': value['start'], 'closeEnd': value['end']} for key, value in closed.items()],
          'workspaceMounts': len(mounts), 'workspaceUnmounts': len(unmounts), 'logs': log_rows,
          'finalStats': stats['result'], 'branches': 9, 'layers': 3, 'observerDockerRecords': len(records),
          'verbatim': copied, 'sourcePins': list(sources.values()), 'generator': pin(__file__),
          'limits': ['Terminal resource facts are independently checked retained host-file evidence, not a fresh SDK execution.',
                     'No application acceptance or dependency full-history census was run after HALT.',
                     'Exact exposure invocation time was not supplied; copied JSON is a later manual transcription of the original tool response.',
                     'Only lead and P1 ran. W1/W2/I1/I2 were never spawned. Separate test snapshots do not establish integrated acceptance.',
                     'No performance, cold-cache, exclusive allocation, or Durable execution claim.']}
for row in sources.values():
    assert pin(row['path']) == row
save(OUT / 'terminal-custody-verification.json', answer)
print(json.dumps({key: answer[key] for key in ('status', 'sdkTraces', 'fullReceipts', 'callPopulation', 'workspaceMounts', 'workspaceUnmounts', 'branches', 'layers')}))
