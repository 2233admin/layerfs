"""Prepare immutable B1 analysis inputs from retained JSON/JSONL only."""
import base64
import gzip
import hashlib
import importlib.util
import json
import re
from datetime import datetime, timezone
from pathlib import Path

REPO = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN = REPO / 'core/target/issue340/b1'
OUT = RUN / 'analysis-preparation-stage2'
CONTROL = Path(__file__).resolve().parent
sources = {}


def pin(path):
    path = Path(path).resolve()
    data = path.read_bytes()
    return {'path':str(path),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}


def load(path):
    path = Path(path)
    sources[str(path.resolve())] = pin(path)
    return json.loads(path.read_text())


def write(name, value):
    path = OUT / name
    path.parent.mkdir(exist_ok=True, parents=True)
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
    return path


def write_rows(name, rows):
    path = OUT / name
    with path.open('x') as stream:
        for row in rows:
            stream.write(json.dumps(row, ensure_ascii=False) + '\n')
    return path


normalization = load(RUN / 'normalized-receipts/normalization.json')
assert normalization['traceCount'] == normalization['normalizedCount'] == 3624
assert normalization['unjoinedRawReceipts'] == normalization['tracesWithoutFullReceipt'] == []
calls = [json.loads(line) for line in (RUN / 'normalized-receipts/calls.jsonl').read_text().splitlines() if line.strip()]
sources[str((RUN / 'normalized-receipts/calls.jsonl').resolve())] = pin(RUN / 'normalized-receipts/calls.jsonl')
traces = []
for path in sorted((RUN / 'trace').glob('*.jsonl')):
    sources[str(path.resolve())] = pin(path)
    traces.extend(dict(json.loads(line), agent=path.stem) for line in path.read_text().splitlines() if line.strip())
trace_by_id = {row['id']: row for row in traces}
assert len(trace_by_id) == len(traces) == 3624
stamp = lambda text: datetime.fromisoformat(text.replace('Z','+00:00')).timestamp()
iso = lambda value: datetime.fromtimestamp(value,timezone.utc).isoformat()
window_start = min(stamp(row['start']) for row in traces)
window_end = max(stamp(row['start']) + row['ms'] / 1000 for row in traces)

fragment = load(RUN / 'sql-normalization/analysis-fragment.json')
sql_commits = load(RUN / 'sql-normalization/commits.json')
sql_layers = load(RUN / 'sql-normalization/layers.json')
initial = load(RUN / 'initial-stats.json')
init = load(RUN / 'init.json')
initial_layer = next(row for row in sql_layers if row['id'] == init['layer'])
assert initial_layer['logical'] == initial['logical'] == 88
assert fragment['baselineInventory'] == {'complete':True,'commits':[],'layers':[init['layer']]}
assert all(row['time'] / 1000 > stamp(trace_by_id['9a9b2406-2']['start']) for row in sql_commits)
public_ids = set()
history_paths, size_paths = [], []
history_pages = []
for pattern, target, kind in [('*-history-page-*.json',history_paths,'history'),('*-sizes-page-*.json',size_paths,'sizes')]:
    for path in sorted((RUN / 'final-collection').glob(pattern)):
        raw = load(path)
        if 'error' in raw:
            continue
        page = raw['result']
        assert isinstance(page['items'],list)
        branch = raw['args']['branch']
        rows = [dict(item, branch=branch, sourceReceipt=str(path.resolve())) for item in page['items']]
        public_ids.update(row.get('id',row.get('commit')) for row in rows)
        normalized = write('public-histories/' + path.name, {'items':rows,'hasMore':page['hasMore'],'nextPagePos':page.get('nextPagePos')})
        target.append(str(normalized.relative_to(RUN)))
        history_pages.append({'path':str(path.resolve()),'branch':branch,'kind':kind,'count':len(rows),'hasMore':page['hasMore']})
assert public_ids == {row['id'] for row in sql_commits}
write('public-history-coverage.json',{'classification':'Exact unwrapped retained public history/size pages; stopped SQL identity coverage agrees','commitCount':len(public_ids),'pages':history_pages,'sourcePins':list(sources.values())})

census_summary = load(RUN / 'supplement-collection/combined-wave5-summary/summary.json')
censuses = [load(Path(row['source'])) for row in census_summary['rows']]
assert len(censuses) == 562 and {row['ref'] for row in censuses} == public_ids
assert all(row['complete'] is True and row['installation'] is False for row in censuses)
census_path = write_rows('commit-dependency-censuses.jsonl',censuses)
census_by_id = {row['ref']:row for row in censuses}

spec = importlib.util.spec_from_file_location('b1_current_normalizer',CONTROL.parent / 'normalize_receipts.py')
normalizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normalizer)
install_candidates = {}
raw_by_sequence = {}
for call in calls:
    if call['agent'] != 'lead':
        continue
    raw = load(Path(call['normalizedFrom']['path']))
    raw_by_sequence[raw['sequence']] = (call, raw)
    inputs = raw.get('inputs',{})
    if call['method'] == 'sandbox.exec' and re.search(r'\bnpm\s+(?:ci|install)\b',inputs.get('command','')):
        install_candidates[raw['sequence']] = (call, raw, 'retained full direct command')
for path in sorted((RUN / 'agents/lead/out').glob('acceptance-b1-r*-manifest.json')):
    manifest = load(path)
    step = next(row for row in manifest['steps'] if row['id'] == 'A01')
    sequence = int(re.search(r'lead-(\d+)\.json',step['execReceipt']).group(1))
    call, raw = raw_by_sequence[sequence]
    assert 'npm ci' in step['command'] and raw['method'] == 'sandbox.exec'
    install_candidates[sequence] = (call, raw, str(path.resolve()))
installs, workspaces, install_details = [], [], []
for sequence, (call, raw, command_source) in sorted(install_candidates.items()):
    stdout = raw['result']['stdout']
    if stdout.lstrip().startswith('{'):
        wrapper = json.loads(stdout)
        if wrapper.get('kind') == 'acceptance-streams-v1':
            stdout = gzip.decompress(base64.b64decode(wrapper['stdout']['gzipBase64'],validate=True)).decode()
    census_rows = []
    for line in stdout.splitlines():
        if line.startswith('{'):
            try:
                row = json.loads(line)
            except ValueError:
                continue
            if row.get('type') == 'dependency-census':
                census_rows.append(row)
    assert len(census_rows) == 1
    observed = census_rows[0]
    next_call, commit_raw = raw_by_sequence[sequence + 1]
    assert next_call['method'] == 'sandbox.commit'
    assert raw['inputs']['path'] == commit_raw['inputs']['path']
    commit_result = commit_raw['result']
    commit_id = commit_result['head']
    snapshot = census_by_id[commit_id]
    assert observed['lockfileSha256'] == snapshot['lockfileSha256']
    assert observed['bytes'] == snapshot['logicalBytes']
    install = dict(snapshot, installation=True, agent='lead', lane='L0/integration', at=raw['endUTC'],
                   installTraceId=call['traceId'],commitTraceId=next_call['traceId'],
                   saveCommit=commit_id if commit_result['kind']=='Committed' else None,
                   commandSource=command_source,overallCommandExitCode=raw['result']['exitCode'],
                   installProof='Census emitted after successful npm install/ci; later command/test failure remains preserved',
                   sourceReceipt=call['normalizedFrom']['path'])
    installs.append(install)
    workspace_ref = raw['selectedSandbox'] + ':' + raw['inputs']['path']
    workspaces.append({'refType':'workspace','ref':workspace_ref,'commit':commit_id,'agent':'lead','lane':'L0/integration',
                       'at':raw['endUTC'],'complete':False,'trees':[{'path':'/'+row['root'].lstrip('/'),'logicalBytes':row['bytes']} for row in observed['roots']],
                       'lockfileSha256':observed['lockfileSha256'],'installation':False,
                       'contract':'Observed recursive root census only; nested tree buckets and all Workspace history not separately established',
                       'sourceReceipt':call['normalizedFrom']['path']})
    install_details.append({'agent':'lead','sequence':sequence,'installTraceId':call['traceId'],'commitTraceId':next_call['traceId'],
                            'commit':commit_id,'commitKind':commit_result['kind'],'overallCommandExitCode':raw['result']['exitCode'],
                            'lockfileSha256':observed['lockfileSha256'],'rootCensus':observed,
                            'sourceReceipt':call['normalizedFrom']['path'],'commandSource':command_source})
assert len(installs) == 10
install_path = write_rows('installation-dependency-censuses.jsonl',installs)
workspace_path = write_rows('observed-workspace-dependency-roots.jsonl',workspaces)
write('installation-evidence.json',{'classification':'Actual retained npm installs with post-install census and exact next publishing Commit/UpToDate reply; no exclusive dependency allocation','count':len(installs),'agents':['lead'],'crossAgentReinstallationComparison':'unavailable; no other-agent install evidenced','rows':install_details})

roster = load(RUN / 'analysis-preparation/roster-preparation-r1.json')['agents']
observer_service = trace_by_id['9a9b2406-1']
service_result = next(row['result'] for row in calls if row['traceId']=='9a9b2406-1')
lifecycle = [{'kind':'sandbox','resource':service_result,'action':'open',
              'at':iso(stamp(observer_service['start']) + observer_service['ms']/1000),
              'traceId':'9a9b2406-1','boundary':'Initial observer first successful service-ready reply; not creation instant','agent':'main','lane':'observer'}]
write_rows('observer-lifecycle.jsonl',lifecycle)
events = [json.loads(line) for line in (RUN / 'analysis-preparation/dispatch-events-preparation-r1.jsonl').read_text().splitlines()]
for call in calls:
    method = call['method']
    if method in ['project.init','branch.fork','branch.merge','branch.publish','sandbox.close'] or (method=='sandbox.exec' and re.search(r'\bA\d\d\b',call['step'] or '')):
        trace = trace_by_id[call['traceId']]
        result = call.get('result')
        events.append({'at':iso(stamp(trace['start'])+trace['ms']/1000),'kind':'sdk-reply:'+method,
                       'agent':call['agent'],'role':next(row['role'] for row in roster if row['id']==call['agent']),
                       'lane':next(row['lane'] for row in roster if row['id']==call['agent']),
                       'branch':call['args'].get('branch',call['args'].get('name')),
                       'traceId':call['traceId'],'message':call['step'],'result':result,'error':call.get('error'),
                       'sourceReceipt':call['normalizedFrom']['path'],'boundary':'successful or refused SDK reply; labels do not infer milestone content'})
write_rows('timeline-events.jsonl',events)
ledger_bytes = (RUN / 'MAIN-LEDGER.md').read_bytes()
captured_at = datetime.now(timezone.utc).isoformat()
(OUT / 'MAIN-LEDGER-captured-prefix.md').write_bytes(ledger_bytes[:ledger_bytes.rfind(b'\n')+1])
write('MAIN-LEDGER-capture.json',{'capturedAt':captured_at,'source':str(RUN/'MAIN-LEDGER.md'),
                               'contract':'Immutable captured complete-line prefix only; root ledger may continue changing; not claimed as final complete ledger',
                               'captured':pin(OUT/'MAIN-LEDGER-captured-prefix.md')})
filter_snippet = load(CONTROL.parent / 'b1-log-filter/analysis-input-snippet.json')
daemon_files = []
for folder in sorted((RUN / 'agents').iterdir()):
    for path in sorted((folder/'daemon').rglob('*')):
        if path.is_file() and (path.name.endswith('.log') or path.suffix in ['.stdout','.stderr']):
            daemon_files.append(str(path.relative_to(RUN)))
provenance = [source['path'] for source in normalization['sources']]
provenance += list(sources)
provenance += filter_snippet['provenanceSources']
provenance += ['analysis-preparation-stage2/*.json','analysis-preparation-stage2/*.jsonl','analysis-preparation-stage2/MAIN-LEDGER-captured-prefix.md',
               'normalized-receipts/normalization.json','normalized-receipts/normalize_receipts.py',
               'report-annotations/dependency-sql-coverage-r1.json','sql-normalization/normalization.json',
               'sql-normalization/normalize_store_inventory.py',str(CONTROL.parent/'b1-log-filter/summary.json'),str(Path(__file__))]
config = {'run':'b1','traces':['trace/*.jsonl'],'callReceipts':['normalized-receipts/calls.jsonl'],
          'provenanceSources':sorted(set(provenance)),'agents':roster,'agentRosterComplete':True,
          'window':{'start':iso(window_start),'end':iso(window_end),'traceComplete':True,'callReceiptsComplete':True,'lifecycleComplete':True,
                    'initialSandboxes':[],'initialWorkspaces':[],'finalSandboxes':[],'finalWorkspaces':[]},
          'events':['analysis-preparation-stage2/timeline-events.jsonl'],
          'resolutions':['report-annotations/resolutions-architecture.jsonl','report-annotations/resolutions-work5.jsonl'],
          'lifecycleEvents':['analysis-preparation-stage2/observer-lifecycle.jsonl'],
          'initialStats':'initial-stats.json','finalStats':'final-collection/final-stats.json',
          'storeCommits':fragment['storeCommits']+size_paths,'branchHistories':history_paths,'layers':fragment['layers'],
          'baselineInventory':fragment['baselineInventory'],'historyInventory':fragment['historyInventory'],
          'dependencyCensus':[str(path.relative_to(RUN)) for path in [census_path,install_path,workspace_path]],
          'dependencyCensusComplete':{'commit':True,'workspace':False},
          'dependencyInventory':{'commit':sorted(public_ids),'workspace':sorted(row['ref'] for row in workspaces)},
          'daemonLogs':daemon_files+filter_snippet['daemonLogs'],'daemonScopeFilter':'selected-trace-scopes','decodedDaemon':[],
          'artifacts':{},'artifactContract':'Stopped binary sizes/checksums will be derived separately from retained root JSON manifests; this analyst does not read/open Store files'}
write('analysis-input-final-candidate.json',config)
write('preparation-summary.json',{'classification':'Diagnostic retained JSON derivation only','primaryCalls':len(calls),'allPrimaryFullReceiptsJoined':True,
      'publicSQLCommitCoverage':len(public_ids),'layers':len(sql_layers),'commitDependencyCensuses':len(censuses),
      'observedInstallations':len(installs),'installationAgents':['lead'],'observedWorkspaceRootCensuses':len(workspaces),
      'window':config['window'],'daemonFiles':len(config['daemonLogs']),'timelineEvents':len(events),'sources':list(sources.values())})
print(json.dumps({'status':'INPUT_CANDIDATE_READY','primaryCalls':len(calls),'commits':len(public_ids),'installs':len(installs),'daemonFiles':len(config['daemonLogs']),'timelineEvents':len(events)}))
