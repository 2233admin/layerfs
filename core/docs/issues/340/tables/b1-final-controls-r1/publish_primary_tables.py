"""Keep full daemon rows in run evidence; publish compact source-pinned report tables."""
import csv
import hashlib
import json
import shutil
import sys
from collections import Counter
from pathlib import Path

REPO=Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN=REPO/'core/target/issue340/b1'
RAW=RUN/'derived-analysis/primary-r2'
OUTPUT=REPO/'core/docs/issues/340/tables/b1-final-primary-r2'
CONTROL=Path(__file__).resolve().parent
sys.path.insert(0,str(REPO/'core/target/issue340/analysis'))
from evidence import Evidence, stamp


def pin(path):
    digest=hashlib.sha256()
    with path.open('rb') as stream:
        for data in iter(lambda:stream.read(1024*1024),b''):
            digest.update(data)
    return {'path':str(path.resolve()),'bytes':path.stat().st_size,'sha256':digest.hexdigest()}


raw_manifest=json.loads((RAW/'manifest.json').read_text())
raw_summary=json.loads((RAW/'summary.json').read_text())
assert raw_summary['quality_issue_count']==0
OUTPUT.mkdir(exist_ok=False)
source_pins=[pin(RAW/'manifest.json'),pin(RUN/'analysis-view-r2/analysis-input.json'),pin(Path(__file__)),
             pin(REPO/'core/target/issue340/analysis/evidence.py'),pin(RUN/'normalized-receipts/calls.jsonl'),
             pin(RUN/'normalized-receipts/normalization.json'),pin(RUN/'analysis-preparation-stage2/supplement-normalization-summary.json')]
source_pins += [pin(path) for path in sorted((RUN/'trace').glob('*.jsonl'))]
for path in sorted(RAW.glob('*.csv')):
    if path.name=='b1-daemon-counters.csv':
        continue
    shutil.copyfile(path,OUTPUT/path.name)
    full_sidecar=RAW/(path.name+'.sources.json')
    raw_sidecar=json.loads(full_sidecar.read_text())
    compact={key:value for key,value in raw_sidecar.items() if key!='sources'}
    compact.update({'sources':source_pins+[pin(full_sidecar),pin(path)],
                    'transitiveProvenance':'Full exact every-source SHA list and all output hashes remain in the immutable run-local primary-r2 manifest/full sidecar. Supplemental every-receipt source pins remain in its six run-local source manifests. This sidecar pins that complete graph without repeating its arrays.'})
    (OUTPUT/(path.name+'.sources.json')).write_text(json.dumps(compact,indent=2)+'\n')
counter_path=RAW/'b1-daemon-counters.csv'
counter_pin=pin(counter_path)
aggregates={}
observed_scopes=set()
observed_traces=set()
counter_groups=set()
incomplete_groups=set()
rows_read=0
with counter_path.open(newline='') as stream:
    for row in csv.DictReader(stream):
        rows_read+=1
        key=(row['daemon'],row['section'],row['counter'])
        aggregate=aggregates.setdefault(key,{'observations':0,'numeric_observations':0,'unavailable_observations':0,'observed_min':None,'observed_max':None})
        aggregate['observations']+=1
        try:
            value=json.loads(row['value'])
        except ValueError:
            value=None
        if isinstance(value,(int,float)) and not isinstance(value,bool):
            aggregate['numeric_observations']+=1
            aggregate['observed_min']=value if aggregate['observed_min'] is None else min(aggregate['observed_min'],value)
            aggregate['observed_max']=value if aggregate['observed_max'] is None else max(aggregate['observed_max'],value)
        else:
            aggregate['unavailable_observations']+=1
        observed_scopes.add(row['scope'])
        if row['trace_id']!='unavailable':
            observed_traces.add(row['trace_id'])
        group=(row['daemon'],row['scope'],row['call'])
        counter_groups.add(group)
        if row['complete']!='True':
            incomplete_groups.add(group)
assert rows_read==raw_summary['table_rows']['daemon-counters']
counter_rows=[dict(zip(['daemon','section','counter'],key),**value,
                   contract='Range of retained cumulative snapshots only; no counter sum/per-call delta, true process peak, or exclusive allocation')
              for key,value in sorted(aggregates.items())]
Evidence.write(None,OUTPUT,'b1-daemon-counter-summary.csv',counter_rows,
               'daemon section counter observations numeric_observations unavailable_observations observed_min observed_max contract'.split())
coverage=json.loads((RUN/'analysis-view-r2/daemon-coverage.json').read_text())
calls=[json.loads(line) for line in (RUN/'normalized-receipts/calls.jsonl').read_text().splitlines()]
traces=[]
for path in sorted((RUN/'trace').glob('*.jsonl')):
    traces.extend(dict(json.loads(line),agent=path.stem) for line in path.read_text().splitlines() if line.strip())
expected={row['scope']:row for row in traces if row.get('scope') and row.get('daemon')}
missing=[{'traceId':row['id'],'agent':row['agent'],'method':row['method'],'step':row.get('step'),'scope':scope}
         for scope,row in sorted(expected.items()) if scope not in observed_scopes]
stream_rows=[]
for row in coverage['rows']:
    later=[]
    capture_end=row.get('captureEnd')
    close=next(call for call in calls if call['traceId']==row['closeTraceId'])
    if capture_end:
        later=[call['traceId'] for call in calls if call['args'].get('sandbox')==row['sandbox'] and
               stamp(capture_end)<=stamp(call['start'])<stamp(close['start'])]
    stream_rows.append({'agent':row['agent'],'sandbox':row['sandbox'],'stream':row['stream'],
                        'raw':row['raw'],'capture':row['capture'],'capture_end':capture_end,'close_trace_id':row['closeTraceId'],
                        'close_receipt':row['closeReceipt'],'capture_recorded_sha256':row.get('captureRecordedSha256'),
                        'integrity':row['integrity'],'selected_r1':row['selectedInR1'],'selected_r2':row['selectedInR2'],
                        'selected_derivative':row.get('selectedDerivative'),'same_sandbox_calls_after_capture_before_close':later if capture_end else None,
                        'selection_contract':row['selectionContract'],'snapshot_contract':'Saved snapshot at recorded capture; later SDK calls/terminal close may be absent; source coverage does not imply numeric records for every call'})
Evidence.write(None,OUTPUT,'b1-daemon-stream-custody.csv',stream_rows,
               'agent sandbox stream raw capture capture_end close_trace_id close_receipt capture_recorded_sha256 integrity selected_r1 selected_r2 selected_derivative same_sandbox_calls_after_capture_before_close selection_contract snapshot_contract'.split())
extra_sources=source_pins+[counter_pin,pin(RAW/'b1-daemon-counters.csv.sources.json'),pin(RUN/'analysis-view-r2/daemon-coverage.json')]
for name in ['b1-daemon-counter-summary.csv','b1-daemon-stream-custody.csv']:
    (OUTPUT/(name+'.sources.json')).write_text(json.dumps({'table':name,'classification':'Diagnostic retained source snapshots; unknown cache; tracing on',
        'sources':extra_sources,'transitiveProvenance':'Full counter rows and their complete source list remain immutable under RUN/derived-analysis/primary-r2 and in the raw archive. No rows removed from raw evidence.',
        'contract':'Cumulative snapshot ranges are compact reporting, not summed work, a process peak or exclusive allocation. Both captured streams for all31Sandboxes are mapped; two root stdout streams remain provenance only.'},indent=2)+'\n')
raw_pointer={'classification':'Complete raw per-call counter table retained outside Git-facing report tables','table':counter_pin,
             'rows':rows_read,'fullSources':pin(RAW/'b1-daemon-counters.csv.sources.json'),'populationManifest':pin(RAW/'manifest.json'),
             'scopeCoverage':{'observedNumericScopes':len(observed_scopes),'observedJoinedTraceIds':len(observed_traces),
                              'numericGroups':len(counter_groups),'incompleteGroups':len(incomplete_groups),
                              'traceScopesWithDaemonReplies':len(expected),'replyScopesWithoutRetainedNumericGroup':missing},
             'contract':'Numeric group availability follows saved capture snapshots; no invented replacement from nearby calls. Full 4M+ rows remain in run-local/raw-archived evidence; summary ranges are not resource peaks.'}
(OUTPUT/'b1-daemon-counters.raw.json').write_text(json.dumps(raw_pointer,indent=2)+'\n')
summary=dict(raw_summary,rawCounterTable=counter_pin,rawCounterRows=rows_read,compactCounterRows=len(counter_rows),
             daemonStreamCustody={'sandboxes':31,'retainedRawStreams':62,'selectedInputs':60,'rootStdoutProvenanceOnly':2},
             numericScopeCoverage=raw_pointer['scopeCoverage'])
(OUTPUT/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
files={str(path.relative_to(OUTPUT)):pin(path) for path in sorted(OUTPUT.iterdir()) if path.is_file()}
(OUTPUT/'manifest.json').write_text(json.dumps({'classification':'Compact report representation with exact transitive raw evidence provenance',
                                             'fullPopulationManifest':pin(RAW/'manifest.json'),'sources':source_pins,'outputs':files},indent=2)+'\n')
largest=sorted([{'name':path.name,'bytes':path.stat().st_size} for path in OUTPUT.iterdir() if path.is_file()],key=lambda row:row['bytes'],reverse=True)[:6]
print(json.dumps({'status':'PUBLISHED_DIAGNOSTIC_TABLES','rawCounterRows':rows_read,'rawCounterBytes':counter_pin['bytes'],
                  'compactCounterRows':len(counter_rows),'observedNumericScopes':len(observed_scopes),
                  'replyScopesWithoutNumericGroup':len(missing),'largestGitFacingFiles':largest}))
