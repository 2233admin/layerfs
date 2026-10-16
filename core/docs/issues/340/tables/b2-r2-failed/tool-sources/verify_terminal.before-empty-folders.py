"""Verify closed-r2 custody from retained files only; no mutable ledger input."""
import gzip
import hashlib
import json
from datetime import datetime
from pathlib import Path

RUN = Path('/Users/yifanxu/.codex/issue340-independent/b2-r2')
DOC = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs/core/docs/issues/340')
OUT = RUN / 'analysis-preparation'
sources = {}
def pin(path):
    path = Path(path).resolve()
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
def read(path):
    path = Path(path)
    assert path.name != 'MAIN-LEDGER.md'
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
assert normalization['traceCount'] == normalization['normalizedCount'] == 61
assert normalization['unjoinedRawReceipts'] == normalization['tracesWithoutFullReceipt'] == []
for row in normalization['sources']:
    assert pin(row['path']) == row and Path(row['path']).name != 'MAIN-LEDGER.md'
    sources[row['path']] = row
calls = [json.loads(line) for line in read(RUN / 'normalized-receipts/calls.jsonl').decode().splitlines()]
traces = []
for path in sorted((RUN / 'trace').glob('*.jsonl')):
    traces += [dict(json.loads(line), agent=path.stem) for line in read(path).decode().splitlines() if line.strip()]
assert len({row['id'] for row in traces}) == 61
assert {row['traceId'] for row in calls} == {row['id'] for row in traces}
by_id = {row['id']: row for row in traces}
population = {agent: sum(row['agent'] == agent for row in traces) for agent in ('lead', 'P1', 'main')}
assert population == {'lead': 27, 'P1': 10, 'main': 24}
for agent, count in [('lead', 27), ('P1', 10)]:
    raw = [load(path) for path in sorted((RUN / 'agents' / agent / 'out/calls').glob('*.json'))]
    assert len(raw) == count and sorted(row['sequence'] for row in raw) == list(range(1, count + 1))
    assert raw[-1]['method'] == 'sandbox.close' and raw[-1]['result']['kind'] == 'Closed'
    last = max((row for row in traces if row['agent'] == agent), key=lambda row: stamp(row['start']))
    assert last['method'] == 'sandbox.close' and last['ok'] is True
active_sandboxes = {load(RUN / 'observer-service.json')['id']}
active_workspaces, closed, mounts, unmounts = set(), {}, [], []
for call in sorted(calls, key=lambda row: stamp(by_id[row['traceId']]['start'])):
    trace = by_id[call['traceId']]
    method, args, result = call['method'], call['args'], call.get('result')
    assert trace['ok'] is True
    if method == 'sandbox.create':
        identity = result if isinstance(result, str) else result['id']
        assert identity not in active_sandboxes
        active_sandboxes.add(identity)
    elif method == 'sandbox.mount':
        key = (result.get('sandbox', args.get('sandbox')), result['path'])
        assert all(key) and key not in active_workspaces
        active_workspaces.add(key); mounts.append(key)
    elif method == 'sandbox.unmount':
        key = (args['sandbox'], args['path'])
        assert key in active_workspaces
        active_workspaces.remove(key); unmounts.append(key)
    elif method == 'sandbox.close':
        identity = result['id']
        assert identity in active_sandboxes and not [key for key in active_workspaces if key[0] == identity]
        active_sandboxes.remove(identity)
        closed[identity] = {'traceId': trace['id'], 'start': trace['start'], 'end': stamp(trace['start']) + trace['ms'] / 1000}
assert len(closed) == 3 and active_sandboxes == active_workspaces == set()
assert len(mounts) == len(unmounts) == 3
for row in traces:
    sandbox = row.get('args', {}).get('sandbox')
    if sandbox in closed and row['method'] != 'sandbox.close':
        assert stamp(row['start']) < stamp(closed[sandbox]['start'])
logs = []
for agent in ('lead', 'P1'):
    folder = RUN / 'agents' / agent
    capture = load(folder / 'daemon/capture.json')
    assert capture['exitCode'] == 0
    life = load(folder / 'lifecycle.json')
    sandbox = life.get('sandbox', (life.get('sandboxes') or [None])[0])
    at = capture.get('endedUtc', capture.get('timeUTC'))
    assert stamp(at) < stamp(closed[sandbox]['start'])
    for stream in ('stdout', 'stderr'):
        path = folder / 'daemon' / (stream + '.log')
        data = read(path)
        if stream + 'Bytes' in capture:
            assert len(data) == capture[stream + 'Bytes']
        assert len(data) == {'lead': {'stdout': 36, 'stderr': 744803}, 'P1': {'stdout': 36, 'stderr': 171085}}[agent][stream]
        logs.append({'agent': agent, 'stream': stream, **pin(path), 'captureEnd': at, 'closeStart': closed[sandbox]['start'],
                     'contract': 'Retained stream hashed now; original capture receipt has no stream hash'})
verified = load(RUN / 'observer-final-jsonlog/verified.json')
assert verified['status'] == 'PASS'
assert load(RUN / 'observer-final-jsonlog/before.json') == load(RUN / 'observer-final-jsonlog/after.json') == verified['source']
archive = RUN / 'observer-final-jsonlog/docker-json.log.gz'
assert pin(archive) == verified['archive']
raw = gzip.decompress(read(archive))
assert len(raw) == verified['source']['bytes'] == 514232 and hashlib.sha256(raw).hexdigest() == verified['source']['sha256']
records = [json.loads(line) for line in raw.splitlines()]
assert len(records) == verified['records'] == 1306
for stream in ('stdout', 'stderr'):
    path = RUN / 'observer-final-jsonlog' / (stream + '.log')
    assert read(path) == ''.join(row['log'] for row in records if row['stream'] == stream).encode()
    assert pin(path) == verified[stream]
    logs.append({'agent': 'main', 'stream': stream, **pin(path), 'contract': 'Exact original-order stream decode from complete retained Docker json-file archive'})
root_close = load(RUN / 'observer-close.json')
assert root_close['result']['kind'] == 'Closed'
last = max(traces, key=lambda row: stamp(row['start']))
assert last['method'] == 'sandbox.close' and last['agent'] == 'main'
for number in range(4, 12):
    path = next((RUN / 'receipts').glob(f'{number:03d}-*.json'))
    row = load(path)
    assert row['exitCode'] == 0 and row['timedOut'] is False
    read(path.with_suffix('.stdout')); read(path.with_suffix('.stderr'))
    if number == 9:
        assert stamp(row['started']) + row['elapsed'] < stamp(root_close['start'])
    if number == 11:
        assert 'ps' in row['command'] and '-a' in row['command'] and path.with_suffix('.stdout').read_bytes() == b''
        assert stamp(row['started']) > stamp(root_close['end'])
summary = load(RUN / 'final-collection/summary.json')
assert len(summary['branches']) == 8 and len(summary['layers']) == 2 and summary['moreLayers'] is False
assert summary['calls'] == 17
stats = load(RUN / 'final-collection/final-stats.json')
assert stats['result'] == summary['stats']
final_calls = [row for row in calls if row['agent'] == 'main' and row['step'].startswith('main-final-')]
assert len(final_calls) == 17 and max(final_calls, key=lambda row: stamp(by_id[row['traceId']]['start']))['method'] == 'operator.store.stats'
for agent in ('W1', 'W2', 'I1', 'I2'):
    assert not list((RUN / 'agents' / agent).rglob('*'))
lead_notes = read(RUN / 'agents/lead/NOTES.md')
p1_notes = read(RUN / 'agents/P1/NOTES.md')
assert read(RUN / 'agents/lead/out/P1-NOTES-verbatim.md') == p1_notes
assert b'Never read' in lead_notes and b'RUN/MAIN-LEDGER.md' in lead_notes
assert b'has NOT read RUN/MAIN-LEDGER.md' in p1_notes
assert len([row for row in calls if row['agent'] == 'P1' and row['method'] == 'fs.read']) == 8
assert not [row for row in calls if row['agent'] == 'P1' and row['method'] not in ('fs.read', 'branch.list_commits', 'sandbox.close')]
verbatim = DOC / 'verbatim/b2-r2'
verbatim.mkdir(parents=True, exist_ok=False)
copies = []
for source, name in [('agents/lead/NOTES.md', 'lead-NOTES.md'), ('agents/lead/terminal-custody.json', 'lead-terminal-custody.json'),
                     ('agents/lead/lifecycle.json', 'lead-lifecycle.json'), ('agents/P1/NOTES.md', 'P1-NOTES.md'), ('agents/P1/lifecycle.json', 'P1-lifecycle.json')]:
    (verbatim / name).write_bytes(read(RUN / source))
    assert pin(verbatim / name)['sha256'] == pin(RUN / source)['sha256']
    copies.append({'source': pin(RUN / source), 'copy': pin(verbatim / name)})
save(verbatim / 'source-manifest.json', {'classification': 'Verbatim halted-attempt records; no actor reports reading the root ledger', 'copies': copies})
answer = {'status': 'PASS', 'classification': 'Stopped host-file custody only; failed attempt remains conservatively halted for T006 root input-custody concern',
          'traceCount': 61, 'fullReceipts': 61, 'population': population, 'closedSandboxes': closed, 'mounts': 3, 'unmounts': 3,
          'logs': logs, 'observerRecords': len(records), 'finalStats': stats['result'], 'branches': 8, 'layers': 2, 'copies': copies,
          'actorStatements': {'lead': 'reports never reading RUN/MAIN-LEDGER.md', 'P1': 'reports never reading RUN/MAIN-LEDGER.md'},
          'rootReason': 'Root reported copying prior-run archive bookkeeping into the run ledger and ended the attempt conservatively regardless of exposure. No observed actor read/exposure or product defect is asserted.',
          'sourcePins': list(sources.values()), 'generator': pin(__file__),
          'limits': ['All final A01-A15 NOT_RUN; no final LOC or full-history dependency census', 'Only fresh lead/P1 ran; W1/W2/I1/I2 never spawned',
                     'Lead acceptance infrastructure Branch exists but remains unpublished/unverified; no final acceptance was run',
                     'Actor streams were captured before close; close-time daemon output not claimed complete',
                     'Original actor capture receipts lack stream hashes; current exact hashes are pinned here',
                     'No SDK/application execution during closure; no performance/cold/exclusive allocation claim; Durable NOT_RUN']}
for row in sources.values():
    assert pin(row['path']) == row
save(OUT / 'terminal-custody-verification.json', answer)
print(json.dumps({key: answer[key] for key in ('status', 'traceCount', 'fullReceipts', 'population', 'mounts', 'unmounts', 'branches', 'layers')}))
