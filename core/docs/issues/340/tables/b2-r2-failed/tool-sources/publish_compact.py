"""Compact closed-r2 diagnostic facts, with original inputs and unavailable gates retained."""
import csv
import hashlib
import json
import shutil
from collections import defaultdict
from pathlib import Path

RUN = Path('/Users/yifanxu/.codex/issue340-independent/b2-r2')
DOC = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs/core/docs/issues/340')
RAW = RUN / 'derived-analysis'
OUT = DOC / 'tables/b2-r2-failed'
CONTROL = Path(__file__).resolve().parent
EXPORT = Path('/Users/yifanxu/.codex/issue340-evidence/b2-r2')
OUT.mkdir(parents=True, exist_ok=False)
sources, copied = {}, {}
def pin(path):
    path = Path(path).resolve()
    assert path.name != 'MAIN-LEDGER.md', path
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
    with (OUT / ('b2-r2-' + name + '.csv')).open('x', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: 'unavailable' if row.get(key) is None else json.dumps(row[key], sort_keys=True, ensure_ascii=False) if isinstance(row.get(key), (dict, list)) else row[key] for key in columns})

manifest, analysis = load(RAW / 'manifest.json'), load(RAW / 'summary.json')
assert analysis['sdk_calls_observed'] == analysis['full_receipts_joined'] == 61 and analysis['quality_issue_count'] == 0
assert all(row['gap'] == 0 for row in analysis['reconciliation'])
for row in manifest['sources']:
    assert pin(row['path']) == row
    sources[row['path']] = row
selected = ['methods', 'refusals', 'refusal-summary', 'agents', 'concurrency', 'spans', 'commit-results', 'commit-summary',
            'merges', 'publishes', 'conflicts', 'generations', 'commits', 'storage', 'storage-attribution', 'reconciliation',
            'dependency-summary', 'artifacts', 'quality', 'layers', 'phase-summary']
for stem in selected:
    name = 'b2-r2-' + stem + '.csv'
    path = RAW / name
    expected = manifest['outputs'][name]
    current = pin(path)
    assert current['sha256'] == expected['sha256'] and current['bytes'] == expected['bytes']
    shutil.copyfile(path, OUT / name)
    copied[name] = current
terminal = load(RUN / 'analysis-preparation/terminal-custody-verification.json')
original_pins = load(RUN / 'analysis-preparation/post-close-source-pins.json')
limits = load(RUN / 'analysis-view/analysis-input.json')['limitations']
reason = terminal['rootReason']
gates = [{'gate': f'A{x:02d}', 'status': 'NOT_RUN', 'reason': 'HALT for T006 root input-custody concern; no app acceptance result'} for x in range(1, 16)]
gates += [{'gate': gate, 'status': 'NOT_RUN', 'reason': 'HALT before final qualification'} for gate in ['final10000LOC', 'final120tests', 'P-M1', 'P-M2', 'P-M3', 'W-M1', 'W-M2', 'W-M3', 'I-M1', 'I-M2', 'I-M3', 'same-Branch W1/W2 overlap', 'same-Branch I1/I2 overlap', 'dependency full-history census']]
gates.append({'gate': 'independent attempt eligibility', 'status': 'FAILED_CONSERVATIVE_HALT', 'reason': reason})
table('failed-gates', gates, ['gate', 'status', 'reason'])
table('log-streams', terminal['logs'], ['agent', 'stream', 'path', 'bytes', 'sha256', 'captureEnd', 'closeStart', 'contract'])
table('deployed-source-pins', original_pins['checks'], ['group', 'path', 'bytes', 'sha256', 'matchesPreinit'])
table('custody', [{'check': 'Exact trace/full-result join', 'status': 'PASS', 'count': 61}, {'check': 'Successful Sandbox close', 'status': 'PASS', 'count': 3},
                  {'check': 'Balanced terminal mount/unmount', 'status': 'PASS', 'count': 3}, {'check': 'No SDK after owner close', 'status': 'PASS', 'count': None},
                  {'check': 'Both actor log captures before close', 'status': 'PASS', 'count': 2}, {'check': 'Full observer Docker json-file decode', 'status': 'PASS', 'count': 1306},
                  {'check': 'Mutable MAIN ledger source pins', 'status': 'EXCLUDED', 'count': 0}], ['check', 'status', 'count'])
notes_path = RUN / 'agents/lead/NOTES.md'
sources[str(notes_path)] = pin(notes_path)
table('app-observations', [{'observation': 'L0 skeleton unique package tests', 'status': 'EARLY_SKELETON_ONLY', 'tests': 4, 'productionLOC': None,
                            'integratedAcceptance': False, 'source': str(notes_path)},
                           {'observation': 'P1 eight application reads; no implementation', 'status': 'READ_ONLY', 'tests': 0, 'productionLOC': None, 'integratedAcceptance': False, 'source': str(RUN / 'agents/P1/NOTES.md')},
                           {'observation': 'Unpublished lead-acceptance scaffold', 'status': 'UNVERIFIED', 'tests': None, 'productionLOC': None, 'integratedAcceptance': False, 'source': str(notes_path)},
                           {'observation': 'Final integrated acceptance', 'status': 'NOT_RUN', 'tests': None, 'productionLOC': None, 'integratedAcceptance': False, 'source': str(notes_path)}],
      ['observation', 'status', 'tests', 'productionLOC', 'integratedAcceptance', 'source'])
calls_path = RUN / 'normalized-receipts/calls.jsonl'
calls = [json.loads(line) for line in calls_path.read_text().splitlines()]
commands, installs = [], []
for call in calls:
    if call['method'] != 'sandbox.exec':
        continue
    raw = load(call['normalizedFrom']['path'])
    result = raw['result']
    commands.append({'traceId': call['traceId'], 'agent': call['agent'], 'step': call['step'], 'exitCode': result['exitCode'],
                     'stdoutBytes': len(result.get('stdout', '').encode()), 'stderrBytes': len(result.get('stderr', '').encode()),
                     'source': call['normalizedFrom']['path'], 'contract': 'Retained original result, no app execution repeated'})
    for line in result['stdout'].splitlines():
        if not line.startswith('{'):
            continue
        census = json.loads(line)
        if census.get('kind') != 'dependency-census':
            continue
        mount = load(RUN / 'agents/lead/out/calls' / ('lead-' + str(raw['sequence'] - 1).zfill(4) + '.json'))
        commit = load(RUN / 'agents/lead/out/calls' / ('lead-' + str(raw['sequence'] + 1).zfill(4) + '.json'))
        assert mount['method'] == 'sandbox.mount' and commit['method'] == 'sandbox.commit'
        assert census['workspace'] == mount['result']['path'] == raw['input']['path']
        assert result['exitCode'] == 0 and commit['result']['kind'] == 'Committed'
        save_result = commit['result']['commit']
        installs.append({'agent': census['agent'], 'lane': census['lane'], 'workspace': census['workspace'], 'branch': mount['result']['branch'],
                         'lockfileSha256': census['lockfileSha256'], 'observedRoots': census['roots'], 'observedTotal': census['total'],
                         'installTraceId': call['traceId'], 'commit': save_result['id'], 'wholeSaveNewCanonical': save_result['newCanonical'],
                         'wholeSaveNewStored': save_result['newStored'], 'wholeSaveNewMetadata': save_result['newMetadata'], 'source': call['normalizedFrom']['path'],
                         'coverage': 'Observed install roots only; full-history dependency census NOT_RUN; whole-Save counters do not allocate exclusive dependency cost'})
assert len(commands) == 3 and len(installs) == 2
table('command-outcomes', commands, list(commands[0]))
table('install-observations', installs, list(installs[0]))
final = load(RUN / 'final-collection/summary.json')
table('branches', final['branches'], ['name', 'id', 'base', 'head', 'forkedFrom'])
table('layer-identities', load(RUN / 'sql-normalization/layers.json'), ['id', 'parent', 'root', 'sourceBranch', 'sourceCommit', 'logical', 'time'])
seal = load(EXPORT / 'verification.json')
assert seal['status'] == 'PASS' and seal['raw_untouched']
table('export-identities', [{'artifact': name, **pin(EXPORT / name), 'profile': 'Disposable/WAL/synchronous=OFF', 'custodyStatus': 'PASS'} for name in
                           ['store-volume.tar', 'raw/global/store.sqlite', 'raw/global/store.sqlite-wal', 'raw/global/store.sqlite-shm', 'portable/store.sqlite', 'SHA256.json', 'verification.json']],
      ['artifact', 'path', 'bytes', 'sha256', 'profile', 'custodyStatus'])
counter = RAW / 'b2-r2-daemon-counters.csv'
sources[str(counter)] = pin(counter)
groups = defaultdict(lambda: {'rows': 0, 'groups': set(), 'complete': set()})
with counter.open(newline='') as stream:
    for row in csv.DictReader(stream):
        group = groups[(row['source'], row['operation'])]
        key = (row['daemon'], row['scope'], row['call'])
        group['rows'] += 1; group['groups'].add(key)
        if row['complete'] == 'True':
            group['complete'].add(key)
table('daemon-counter-coverage', [{'source': key[0], 'operation': key[1], 'counterRows': value['rows'], 'uniqueGroups': len(value['groups']),
      'completeGroups': len(value['complete']), 'contract': 'Counts only; cumulative scope counter values are not added into per-call deltas'} for key, value in sorted(groups.items())],
      ['source', 'operation', 'counterRows', 'uniqueGroups', 'completeGroups', 'contract'])
save('summary.json', {'status': 'FAILED_CONSERVATIVE_HALT', 'event': 'T006', 'reason': reason,
      'actorStatements': terminal['actorStatements'], 'observedActorLedgerReadOrExposure': 'NONE ASSERTED', 'productDefect': 'NONE ASSERTED',
      'allFinalA01ToA15': 'NOT_RUN', 'finalLOC': 'NOT_RUN', 'fullHistoryDependencyCensus': 'NOT_RUN',
      'unverifiedInfrastructureBranch': 'lead-acceptance', 'finalAcceptanceBranch': None, 'sdkCalls': 61, 'fullReceipts': 61, 'qualityIssues': 0,
      'commits': 5, 'layers': 2, 'branches': 8, 'closedSandboxes': 3, 'mounts': 3, 'unmounts': 3, 'deployedPinsUnchanged': 65,
      'finalStats': terminal['finalStats'], 'allAccountingGaps': 0, 'mutableLedgerInput': False,
      'largeRunOnlyDerivatives': [{'path': str(counter), 'rows': analysis['table_rows']['daemon-counters'], **pin(counter)},
                                  {'path': str(RAW / 'b2-r2-phases.csv'), 'rows': analysis['table_rows']['phases']}],
      'controlError': '007 terminal check rejected prepared empty role directories;008 retained source/diagnosis;009 corrected check passed. No SDK/app operation replayed.', 'limits': limits})
for path in sorted(CONTROL.glob('*.py')):
    dest = OUT / 'tool-sources' / path.name
    dest.parent.mkdir(exist_ok=True)
    shutil.copyfile(path, dest); sources[str(path)] = pin(path)
for path in sorted((RAW / 'tool-sources').rglob('*.py')):
    dest = OUT / 'tool-sources/unchanged-analysis' / path.relative_to(RAW / 'tool-sources')
    dest.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(path, dest)
for path in CONTROL.glob('*'):
    if path.is_file() and path.suffix in ('.json', '.stdout', '.stderr'):
        sources[str(path)] = pin(path)
save('sources.json', {'classification': 'Halted-r2 diagnostic facts; no acceptance or performance claim', 'sources': sorted(sources.values(), key=lambda row: row['path']),
      'exactCopiedTables': copied, 'mutableLedgerInput': False, 'generator': pin(__file__),
      'transitiveManifests': [pin(RAW / 'manifest.json'), pin(RUN / 'normalized-receipts/normalization.json'), pin(RUN / 'sql-normalization/normalization.json'),
                              pin(RUN / 'analysis-preparation/analysis-preparation.json'), pin(DOC / 'verbatim/b2-r2/source-manifest.json')]})
save('manifest.json', {'classification': 'Compact closed-r2 diagnostic output; full counter/phase derivatives stay in RUN',
      'outputs': {str(path.relative_to(OUT)): pin(path) for path in sorted(OUT.rglob('*')) if path.is_file()}})
print(json.dumps({'status': 'PUBLISHED_HALTED_ATTEMPT', 'tables': len(list(OUT.glob('*.csv'))), 'sources': len(sources), 'manifest': pin(OUT / 'manifest.json')}))
