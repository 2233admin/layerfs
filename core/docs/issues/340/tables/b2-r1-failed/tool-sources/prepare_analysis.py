"""Prepare failed-attempt diagnostic inputs from stopped JSON/JSONL and exact copies."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

RUN = Path('/Users/yifanxu/.codex/issue340-independent/b2-r1')
REPO = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
CONTROL = Path(__file__).resolve().parent
PREP = RUN / 'analysis-preparation'
VIEW = RUN / 'analysis-view'
VIEW.mkdir(exist_ok=False)
sources = {}
def pin(path):
    path = Path(path).resolve()
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
def load(path):
    path = Path(path)
    sources[str(path.resolve())] = pin(path)
    return json.loads(path.read_text())
def write(path, value):
    path.parent.mkdir(exist_ok=True, parents=True)
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
def stamp(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00')).timestamp()
def iso(value):
    return datetime.fromtimestamp(value, timezone.utc).isoformat()

terminal = load(PREP / 'terminal-custody-verification.json')
pins = load(PREP / 'post-close-source-pins.json')
assert terminal['status'] == pins['status'] == 'PASS' and pins['matched'] == 65
normalization = load(RUN / 'normalized-receipts/normalization.json')
assert normalization['traceCount'] == normalization['normalizedCount'] == 145
assert normalization['unjoinedRawReceipts'] == normalization['tracesWithoutFullReceipt'] == []
fragment = load(RUN / 'sql-normalization/analysis-fragment.json')
init, initial = load(RUN / 'init.json'), load(RUN / 'initial-stats.json')
assert fragment['baselineInventory'] == {'complete': True, 'commits': [], 'layers': [init['layer']]}
commits, layers = load(RUN / 'sql-normalization/commits.json'), load(RUN / 'sql-normalization/layers.json')
assert next(row for row in layers if row['id'] == init['layer'])['logical'] == initial['logical'] == 88
traces = []
for path in sorted((RUN / 'trace').glob('*.jsonl')):
    sources[str(path.resolve())] = pin(path)
    traces += [dict(json.loads(line), agent=path.stem) for line in path.read_text().splitlines() if line.strip()]
by_id = {row['id']: row for row in traces}
assert all(row['time'] / 1000 > stamp(by_id['af38598b-2']['start']) for row in commits)
start = min(stamp(row['start']) for row in traces)
end = max(stamp(row['start']) + row['ms'] / 1000 for row in traces)
histories, sizes, public_ids = [], [], set()
for pattern, target in [('*-history-page-*.json', histories), ('*-sizes-page-*.json', sizes)]:
    for path in sorted((RUN / 'final-collection').glob(pattern)):
        raw = load(path)
        assert raw['result']['hasMore'] is False
        rows = [dict(row, branch=raw['args']['branch'], sourceReceipt=str(path.resolve())) for row in raw['result']['items']]
        public_ids.update(row.get('id', row.get('commit')) for row in rows)
        out = PREP / 'public-histories' / path.name
        write(out, {'items': rows, 'hasMore': False, 'nextPagePos': raw['result'].get('nextPagePos')})
        target.append(str(out))
assert public_ids == {row['id'] for row in commits}
lead_life = load(RUN / 'agents/lead/lifecycle.json')
p1_life = load(RUN / 'agents/P1/lifecycle.json')
workers = load(RUN / 'agents/lead/worker-lifecycle.json')
assert len(workers['agents']) == 1
roster = [{'id': 'main', 'role': 'observer', 'lane': 'observer', 'started': iso(start), 'ended': iso(end),
           'sandboxes': [load(RUN / 'observer-service.json')['id']], 'replacementReason': None},
          {'id': 'lead', 'role': 'lead', 'lane': 'L0', 'started': lead_life['start'], 'ended': lead_life['end'],
           'sandboxes': [row['id'] for row in lead_life['sandboxes']], 'replacementReason': None},
          {'id': 'P1', 'role': 'P1', 'lane': 'people', 'started': workers['agents'][0]['startedAt'],
           'ended': workers['agents'][0]['endedAt'], 'sandboxes': [p1_life['sandbox']], 'replacementReason': None}]
write(PREP / 'roster.json', {'agents': roster, 'absentUnspawnedRoles': ['W1', 'W2', 'I1', 'I2'],
                           'contract': 'Roster contains only the two fresh team agents and root observer; no all-five overlap acceptance.'})
service = by_id['af38598b-1']
observer_life = [{'kind': 'sandbox', 'resource': roster[0]['sandboxes'][0], 'action': 'open',
                 'at': iso(stamp(service['start']) + service['ms'] / 1000), 'traceId': service['id'],
                 'boundary': 'First successful service-ready reply; creation instant unavailable', 'agent': 'main', 'lane': 'observer'}]
write(PREP / 'observer-lifecycle.json', observer_life)
test_control = CONTROL.parent / 'report-preparation'
test_manifest = load(test_control / 'analysis-covering-002-sources/manifest.json')
analysis = REPO / 'core/target/issue340/analysis'
reused = []
for name in ('generate.py', 'evidence.py', 'operations.py', 'concurrency.py', 'storage.py', 'test_analysis.py'):
    current = pin(analysis / name)
    assert current['sha256'] == test_manifest[name]['sha256'] and current['bytes'] == test_manifest[name]['bytes']
    reused.append(current)
normalizer_capture = load(test_control / 'normalizer-actual-arguments-final-sources/CAPTURE.json')
for row in normalizer_capture:
    if Path(row['path']).name in ('normalize_receipts.py', 'test_normalize_receipts.py'):
        assert pin(row['path']) == row
        reused.append(row)
test_receipts = [test_control / 'analysis-covering-002.json', test_control / 'normalizer-covering-014.json',
                 CONTROL.parent / 'store-inventory-normalizer-tests.json']
for path in test_receipts:
    result = load(path)
    assert result['exitCode'] == 0 and result['timedOut'] is False
    for suffix in ('.stdout', '.stderr'):
        sources[str(path.with_suffix(suffix))] = pin(path.with_suffix(suffix))
write(PREP / 'reused-tests.json', {'status': 'REUSED_PASS', 'noTestsRerun': True, 'unchangedExecutedAnalysisSources': reused,
                                 'receipts': [pin(path) for path in test_receipts],
                                 'limits': 'Unused method_populations.py and README differ from the old analysis snapshot; neither is an executed dependency of generate.py. SQL normalizer is reused unchanged with its existing three passing external tests.'})
provenance = set(sources)
provenance.update(row['path'] for row in normalization['sources'])
provenance.update(row['path'] for row in pins['checks'])
provenance.update(row['path'] for row in terminal['sourcePins'])
provenance.update(str(path.resolve()) for path in PREP.rglob('*') if path.is_file())
provenance.update(str(path.resolve()) for path in (RUN / 'agents').glob('*/scripts/*') if path.is_file())
provenance.update(str(path.resolve()) for path in (RUN / 'agents/lead/out').glob('*.json'))
provenance.update(str(path.resolve()) for path in (RUN / 'receipts').glob('*') if path.is_file())
provenance.update(str(path.resolve()) for path in (RUN / 'sql-normalization').glob('*') if path.is_file())
provenance.update(str(path.resolve()) for path in CONTROL.parent.joinpath('export').glob('*.py'))
provenance.update(str(path.resolve()) for path in CONTROL.glob('*.py'))
export = Path('/Users/yifanxu/.codex/issue340-evidence/b2-r1')
provenance.update(str(export / name) for name in ('verification.json', 'SHA256.json', 'sqlite-verification.json', 'export-reconciliation.json', 'readonly-inventory.json'))
daemon_logs = [str(RUN / 'agents' / agent / 'daemon' / (stream + '.log')) for agent in ('lead', 'P1') for stream in ('stdout', 'stderr')]
daemon_logs += [str(RUN / 'observer-final-jsonlog' / (stream + '.log')) for stream in ('stdout', 'stderr')]
config = {'run': 'b2-r1-failed', 'traces': [str(path) for path in sorted((RUN / 'trace').glob('*.jsonl'))], 'callReceipts': [str(RUN / 'normalized-receipts/calls.jsonl')],
          'provenanceSources': sorted(provenance), 'agents': roster, 'agentRosterComplete': True,
          'window': {'start': iso(start), 'end': iso(end), 'traceComplete': True, 'callReceiptsComplete': True,
                     'lifecycleComplete': True, 'initialSandboxes': [], 'initialWorkspaces': [], 'finalSandboxes': [], 'finalWorkspaces': []},
          'events': [], 'resolutions': [], 'lifecycleEvents': [str(PREP / 'observer-lifecycle.json')],
          'initialStats': str(RUN / 'initial-stats.json'), 'finalStats': str(RUN / 'final-collection/final-stats.json'),
          'storeCommits': fragment['storeCommits'] + sizes, 'branchHistories': histories, 'layers': fragment['layers'],
          'baselineInventory': fragment['baselineInventory'], 'historyInventory': fragment['historyInventory'],
          'dependencyCensus': [], 'dependencyCensusComplete': {'commit': False, 'workspace': False},
          'dependencyInventory': {'commit': sorted(public_ids), 'workspace': []},
          'daemonLogs': daemon_logs, 'daemonScopeFilter': 'selected-trace-scopes', 'decodedDaemon': [],
          'artifacts': {'raw_store_archive': str(export / 'store-volume.tar'), 'portable_store': str(export / 'portable/store.sqlite'),
                        'raw_main': str(export / 'raw/global/store.sqlite'), 'raw_wal': str(export / 'raw/global/store.sqlite-wal'),
                        'raw_shm': str(export / 'raw/global/store.sqlite-shm'), 'observer_json_gzip': str(RUN / 'observer-final-jsonlog/docker-json.log.gz')},
          'limitations': ['Strict independence FAILED. All A01–A15 NOT_RUN; no acceptance Branch. Only fresh lead/P1 ran.',
                          'No post-HALT application checks or full-history dependency census; absent census is NOT_RUN.',
                          'Existing normalizer keeps original generic lead input.arguments as nested data and uses retained trace metadata for named fields. Normalized commandPayload can describe the bounded trace preview. Original inputs, caller scripts, supplements and full result receipts remain pinned; no full-command completeness claim.',
                          'Capture streams end before Sandbox close, so close-time daemon output is not claimed complete.',
                          'All durations/counters are diagnostic; OS cache unknown, tracing enabled, no performance/cold/exclusive-allocation claim.']}
write(VIEW / 'analysis-input.json', config)
write(PREP / 'analysis-preparation.json', {'classification': 'Stopped retained-evidence input mapping only; unchanged algorithms',
                                        'manifest': pin(VIEW / 'analysis-input.json'), 'sourcePins': [pin(path) for path in sorted(provenance)],
                                        'publicAndSQLUniqueCommits': len(public_ids), 'layers': len(layers), 'sdkTraces': len(traces),
                                        'fullHistoryDependencyCensus': 'NOT_RUN', 'generator': pin(__file__), 'limits': config['limitations']})
print(json.dumps({'status': 'READY', 'manifest': pin(VIEW / 'analysis-input.json'), 'sources': len(provenance),
                  'commits': len(public_ids), 'layers': len(layers), 'calls': len(traces)}))
