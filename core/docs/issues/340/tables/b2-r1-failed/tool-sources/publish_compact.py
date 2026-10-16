"""Publish compact failed-attempt facts; full derivatives stay outside Git."""
import csv
import hashlib
import json
import shutil
from collections import defaultdict
from pathlib import Path

RUN = Path('/Users/yifanxu/.codex/issue340-independent/b2-r1')
DOC = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs/core/docs/issues/340')
RAW = RUN / 'derived-analysis'
OUT = DOC / 'tables/b2-r1-failed'
CONTROL = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=False)
sources = {}
copied = {}
def pin(path):
    path = Path(path).resolve()
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return {'path': str(path), 'bytes': path.stat().st_size, 'sha256': h.hexdigest()}
def load(path):
    path = Path(path)
    sources[str(path.resolve())] = pin(path)
    return json.loads(path.read_text())
def save(name, value):
    with (OUT / name).open('x') as stream:
        stream.write(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
def table(name, rows, columns):
    with (OUT / ('b2-r1-' + name + '.csv')).open('x', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: 'unavailable' if row.get(key) is None else json.dumps(row[key], sort_keys=True, ensure_ascii=False) if isinstance(row.get(key), (dict, list)) else row[key] for key in columns})

manifest = load(RAW / 'manifest.json')
summary = load(RAW / 'summary.json')
assert summary['sdk_calls_observed'] == summary['full_receipts_joined'] == 145 and summary['quality_issue_count'] == 0
assert all(row['gap'] == 0 for row in summary['reconciliation'])
for row in manifest['sources']:
    assert pin(row['path']) == row
    sources[row['path']] = row
selected = ['methods', 'refusals', 'refusal-summary', 'agents', 'concurrency', 'spans', 'commit-results',
            'commit-summary', 'merges', 'publishes', 'conflicts', 'generations', 'commits', 'storage',
            'storage-attribution', 'reconciliation', 'dependency-summary', 'artifacts', 'quality', 'layers', 'phase-summary']
for stem in selected:
    name = 'b2-r1-' + stem + '.csv'
    path = RAW / name
    expected = manifest['outputs'][name]
    assert pin(path)['sha256'] == expected['sha256'] and pin(path)['bytes'] == expected['bytes']
    shutil.copyfile(path, OUT / name)
    copied[name] = pin(path)
terminal = load(RUN / 'analysis-preparation/terminal-custody-verification.json')
source_pins = load(RUN / 'analysis-preparation/post-close-source-pins.json')
report = load(RUN / 'agents/lead/REPORT.json')
plan = load(RUN / 'agents/lead/acceptance-plan.json')
assert report['status'] == 'FAILED' and report['acceptanceBranch'] is None
gate_rows = [{'gate': f'A{x:02d}', 'status': 'NOT_RUN', 'reason': report['reason'], 'source': str(RUN / 'agents/lead/REPORT.json')} for x in range(1, 16)]
gate_rows += [{'gate': gate, 'status': 'NOT_RUN', 'reason': 'HALT after strict independence failure', 'source': str(RUN / 'agents/lead/REPORT.json')} for gate in ['final10000LOC', 'final120tests', 'P-M1 integration', 'same-Branch W1/W2 overlap', 'same-Branch I1/I2 overlap', 'dependency full-history census']]
gate_rows += [{'gate': 'strict independence', 'status': 'FAILED', 'reason': report['reason'], 'source': str(RUN / 'agents/lead/out/inventory-exposure-transcription.json')}]
table('failed-gates', gate_rows, ['gate', 'status', 'reason', 'source'])
table('lifecycle-verification', [{'check': key, 'status': 'PASS', 'scope': 'retained host-file custody only'} for key in terminal['checks']], ['check', 'status', 'scope'])
table('log-streams', terminal['logs'], ['agent', 'stream', 'path', 'bytes', 'sha256', 'collectionEnd', 'closeStart', 'source'])
table('deployed-source-pins', source_pins['checks'], ['group', 'path', 'bytes', 'sha256', 'matchesPreinit'])
snapshots = []
for key, label in [('mainFoundation', 'Published main foundation'), ('peopleLaneSeparate', 'Separate people.1 lane')]:
    snapshots.append({'snapshot': label, 'productionLOC': report['productionLoc'][key]['total'], 'appTests': report['appTests'][key]['total'],
                      'newPeopleLeaves': report['appTests'][key].get('newPeopleLeaves'), 'integratedAcceptance': False,
                      'status': 'REPORTED_EARLY_SNAPSHOT', 'source': str(RUN / 'agents/lead/REPORT.json')})
snapshots.append({'snapshot': 'Final integrated acceptance', 'productionLOC': None, 'appTests': None, 'newPeopleLeaves': None, 'integratedAcceptance': False, 'status': 'NOT_RUN', 'source': str(RUN / 'agents/lead/REPORT.json')})
table('app-snapshots', snapshots, ['snapshot', 'productionLOC', 'appTests', 'newPeopleLeaves', 'integratedAcceptance', 'status', 'source'])
features = []
for milestone, entries in plan['milestones'].items():
    counts = defaultdict(int)
    for row in entries:
        counts[row['status']] += 1
    features.extend({'milestone': milestone, 'status': status, 'featureCount': count, 'integratedAcceptance': False} for status, count in sorted(counts.items()))
table('milestones', features, ['milestone', 'status', 'featureCount', 'integratedAcceptance'])
calls_path = RUN / 'normalized-receipts/calls.jsonl'
calls = [json.loads(line) for line in calls_path.read_text().splitlines()]
commands = []
for row in calls:
    if row['method'] == 'sandbox.exec':
        raw = load(row['normalizedFrom']['path'])
        result = raw['result']
        commands.append({'traceId': row['traceId'], 'agent': row['agent'], 'step': row['step'], 'exitCode': result.get('exitCode'),
                         'stdoutBytes': len(result.get('stdout', '').encode()), 'stderrBytes': len(result.get('stderr', '').encode()),
                         'source': row['normalizedFrom']['path'], 'contract': 'Retained command result; exit status is separate from SDK transport success'})
table('command-outcomes', commands, ['traceId', 'agent', 'step', 'exitCode', 'stdoutBytes', 'stderrBytes', 'source', 'contract'])
install_rows = []
for row in load(RUN / 'agents/lead/out/install-map-v1.json'):
    original = load(RUN / 'agents/lead/out/calls' / row['installReceipt'])
    commit = load(RUN / 'agents/lead/out/calls' / row['publishingCommitReceipt'])
    assert commit['result'] == row['save']
    observed = [json.loads(line) for line in original['result']['stdout'].splitlines() if line.lstrip().startswith('{')]
    assert row['census'] in observed
    assert any(call.get('result') == row['mountIdentity'] for call in calls if call['method'] == 'sandbox.mount')
    install_rows.append({'agent': row['agent'], 'lane': row['lane'], 'installStep': row['installTraceStep'], 'mount': row['mountIdentity']['path'],
                         'branch': row['mountIdentity']['branch'], 'originalCensusIdentityFields': {k: row['census'].get(k) for k in ['agent', 'lane', 'mount', 'installTraceStep']},
                         'lockfileSha256': row['census']['lockfileSha256'], 'observedRoots': row['census']['roots'], 'commit': row['save']['head'],
                         'wholeSaveNewCanonical': row['save']['commit']['newCanonical'], 'wholeSaveNewStored': row['save']['commit']['newStored'],
                         'wholeSaveNewMetadata': row['save']['commit']['newMetadata'], 'coverage': 'Observed installation roots only; full-history census NOT_RUN',
                         'contract': row['note'], 'source': str(RUN / 'agents/lead/out/install-map-v1.json')})
table('install-observations', install_rows, list(install_rows[0]))
final = load(RUN / 'final-collection/summary.json')
table('branches', final['branches'], ['name', 'id', 'base', 'head', 'forkedFrom'])
layers = load(RUN / 'sql-normalization/layers.json')
table('layer-identities', layers, ['id', 'parent', 'root', 'sourceBranch', 'sourceCommit', 'logical', 'time'])
export = Path('/Users/yifanxu/.codex/issue340-evidence/b2-r1')
seal = load(export / 'verification.json')
assert seal['status'] == 'PASS' and seal['raw_untouched']
export_rows = []
for name in ['store-volume.tar', 'raw/global/store.sqlite', 'raw/global/store.sqlite-wal', 'raw/global/store.sqlite-shm', 'portable/store.sqlite', 'SHA256.json', 'verification.json']:
    export_rows.append({'artifact': name, **pin(export / name), 'profile': 'Disposable/WAL/synchronous=OFF', 'custodyStatus': 'PASS'})
table('export-identities', export_rows, ['artifact', 'path', 'bytes', 'sha256', 'profile', 'custodyStatus'])
counter_source = RAW / 'b2-r1-daemon-counters.csv'
sources[str(counter_source)] = pin(counter_source)
counter_groups = defaultdict(lambda: {'rows': 0, 'groups': set(), 'complete': set()})
with counter_source.open(newline='') as stream:
    for row in csv.DictReader(stream):
        group = counter_groups[(row['source'], row['operation'])]
        key = (row['daemon'], row['scope'], row['call'])
        group['rows'] += 1
        group['groups'].add(key)
        if row['complete'] == 'True':
            group['complete'].add(key)
table('daemon-counter-coverage', [{'source': key[0], 'operation': key[1], 'counterRows': value['rows'], 'uniqueGroups': len(value['groups']), 'completeGroups': len(value['complete']), 'contract': 'Counts only; counter values are cumulative scope snapshots, not summed per-call deltas'} for key, value in sorted(counter_groups.items())], ['source', 'operation', 'counterRows', 'uniqueGroups', 'completeGroups', 'contract'])
save('summary.json', {'status': 'FAILED', 'reason': report['reason'], 'acceptanceBranch': None, 'allFinalA01ToA15': 'NOT_RUN',
                      'analysisStatus': summary['status'], 'sdkCalls': 145, 'fullReceipts': 145, 'qualityIssues': 0,
                      'commits': 13, 'layers': 3, 'branches': 9, 'closedSandboxes': 3, 'workspaceMounts': 15, 'workspaceUnmounts': 15,
                      'deployedPinsUnchanged': 65, 'counterTestsExcludedFromApplicationGate': 45,
                      'finalStats': terminal['finalStats'], 'allAccountingGaps': 0, 'sourceManifest': 'sources.json',
                      'largeRunOnlyDerivatives': [{'path': str(counter_source), 'rows': summary['table_rows']['daemon-counters'], **pin(counter_source)}, {'path': str(RAW / 'b2-r1-phases.csv'), 'rows': summary['table_rows']['phases']}],
                      'limits': load(RUN / 'analysis-view/analysis-input.json')['limitations']})
for path in sorted(CONTROL.glob('*.py')):
    dest = OUT / 'tool-sources' / path.name
    dest.parent.mkdir(exist_ok=True)
    shutil.copyfile(path, dest)
    sources[str(path)] = pin(path)
for path in sorted((RAW / 'tool-sources').rglob('*.py')):
    dest = OUT / 'tool-sources/unchanged-analysis' / path.relative_to(RAW / 'tool-sources')
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, dest)
for path in sorted(CONTROL.glob('*')):
    if path.is_file() and path.suffix in ('.json', '.stdout', '.stderr'):
        sources[str(path)] = pin(path)
save('sources.json', {'classification': 'Diagnostic failed-attempt facts, never acceptance or performance qualification',
                      'sources': sorted(sources.values(), key=lambda row: row['path']), 'exactCopiedTables': copied,
                      'transitiveManifests': [pin(RAW / 'manifest.json'), pin(RUN / 'normalized-receipts/normalization.json'), pin(RUN / 'sql-normalization/normalization.json'), pin(RUN / 'analysis-preparation/analysis-preparation.json'), pin(DOC / 'verbatim/b2-r1/source-manifest.json')],
                      'generator': pin(__file__)})
save('manifest.json', {'classification': 'Compact failed-b2-r1 diagnostic tables; full derivatives retained in RUN',
                       'outputs': {str(path.relative_to(OUT)): pin(path) for path in sorted(OUT.rglob('*')) if path.is_file()}})
print(json.dumps({'status': 'PUBLISHED_FAILED_ATTEMPT', 'tables': len(list(OUT.glob('*.csv'))), 'sources': len(sources),
                  'output': str(OUT), 'manifest': pin(OUT / 'manifest.json')}))
