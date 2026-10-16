"""Freeze final B1 run-local analysis inputs after exact supplemental identity coverage."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

REPO=Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN=REPO/'core/target/issue340/b1'
PREP=RUN/'analysis-preparation-stage2'
CONTROL=Path(__file__).resolve().parent


def pin(path):
    digest=hashlib.sha256()
    with path.open('rb') as stream:
        for data in iter(lambda:stream.read(1024*1024),b''):
            digest.update(data)
    return {'path':str(path.resolve()),'bytes':path.stat().st_size,'sha256':digest.hexdigest()}


populations=[]
joined=set()
for folder in sorted((RUN/'normalized-supplement').glob('*-r2')):
    summary=json.loads((folder/'summary.json').read_text())
    assert summary['unmatched']==summary['ambiguous']==summary['invalidReceipts']==0
    assert summary['invalidTraceDiscriminators']==[]
    count=0
    with (folder/'mapping.jsonl').open() as stream:
        for line in stream:
            row=json.loads(line)
            assert row['traceId'] not in joined
            joined.add(row['traceId'])
            count+=1
    assert count==summary['matched']==summary['sourceReceiptCount']
    populations.append({'population':summary['population'],'matched':count,'unmatched':0,'ambiguous':0,'invalidReceipts':0,
                        'sources':[pin(folder/name) for name in ['summary.json','sources.jsonl','mapping.jsonl','calls.jsonl','supplement_adapter.py']]})
raw_ids=set()
raw_count=0
with (RUN/'supplement/dependency-census.jsonl').open() as stream:
    for line in stream:
        row=json.loads(line)
        assert row['id'] not in raw_ids
        raw_ids.add(row['id'])
        raw_count+=1
assert joined==raw_ids and len(joined)==511665 and len(populations)==6
summary={'classification':'Diagnostic exact argument-identity supplemental normalization; no SDK calls','status':'PASS',
         'traceCount':raw_count,'matched':len(joined),'unmatched':0,'ambiguous':0,'invalidReceipts':0,
         'contract':'Full relevant typed argument identity including exact stopped-SQL Commit membership; step aliases alone never joined; no timestamp/order guess. Raw trace remains authoritative for method totals.',
         'populations':populations,'failedPriorAttempts':['normalized-supplement/qualification','normalized-supplement/wave1','normalized-supplement/wave2'],
         'adapterChecks':'5 external checks PASS after retained tagged-ref regression failure and SQL-membership correction; original analysis/normalizer algorithms unchanged'}
(PREP/'supplement-normalization-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
final_controls=PREP/'final-controls'
final_controls.mkdir(exist_ok=False)
for pattern in ['*.py','*.stdout','*.stderr']:
    for path in sorted(CONTROL.glob(pattern)):
        (final_controls/path.name).write_bytes(path.read_bytes())
config=json.loads((PREP/'analysis-input-final-candidate.json').read_text())
config['provenanceSources'] += ['normalized-supplement/*-r2/summary.json','normalized-supplement/*-r2/sources.jsonl',
    'normalized-supplement/*-r2/mapping.jsonl','normalized-supplement/*-r2/calls.jsonl','normalized-supplement/*-r2/supplement_adapter.py',
    'normalized-supplement/qualification/summary.json','normalized-supplement/wave1/summary.json','normalized-supplement/wave2/summary.json',
    'analysis-preparation-stage2/final-controls/*','analysis-preparation-stage2/supplement-normalization-summary.json']
for name in ['verification.json','SHA256.json','raw-files.json','export-identity.json','export-reconciliation.json','sqlite-verification.json','readonly-inventory.json','portable-inventory.json','portable-destination-profile.json']:
    config['provenanceSources'].append(str(Path('/Users/yifanxu/.codex/issue340-evidence/b1')/name))
config['provenanceSources']=sorted(set(config['provenanceSources']))
with (RUN/'analysis-input.json').open('x') as stream:
    stream.write(json.dumps(config,indent=2)+'\n')
frozen={'classification':'Final B1 analysis-input freeze; diagnostic only','at':datetime.now(timezone.utc).isoformat(),
        'manifest':pin(RUN/'analysis-input.json'),'supplementCoverage':pin(PREP/'supplement-normalization-summary.json'),
        'primaryNormalization':pin(RUN/'normalized-receipts/normalization.json'),
        'window':config['window'],'profile':'Disposable/WAL/OFF','Durable':'NOT_RUN — disabled by owner until explicit reauthorization',
        'limits':['Exact agent spawn/termination unavailable; five-role overlap unavailable','Workspace all-history dependency census partial','Save counter gaps retained without attribution','Numeric daemon source selection excludes supplemental scopes; external omitted counts retained separately','Stopped binary sizes/checksums derive root JSON verification only; analyst never reads/opens Store files']}
(PREP/'input-freeze.json').write_text(json.dumps(frozen,indent=2)+'\n')
print(json.dumps({'status':'FROZEN','primaryCalls':3624,'supplementCalls':len(joined),'combinedCalls':3624+len(joined),'manifest':frozen['manifest']}))
