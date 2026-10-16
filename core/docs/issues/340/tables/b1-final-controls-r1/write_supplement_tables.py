"""Stream supplemental evidence into explicit refusal/phase population tables."""
import csv
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

REPO=Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN=REPO/'core/target/issue340/b1'
sys.path.insert(0,str(REPO/'core/target/issue340/analysis'))
from evidence import Evidence, stamp
from operations import operation_tables
from generate import COLUMNS


def pin(path):
    digest=hashlib.sha256()
    with path.open('rb') as stream:
        for data in iter(lambda:stream.read(1024*1024),b''):
            digest.update(data)
    return {'path':str(path.resolve()),'bytes':path.stat().st_size,'sha256':digest.hexdigest()}


config=json.loads((RUN/'analysis-input.json').read_text())
agents={row['id']:row for row in config['agents']}
refusals=[]
phase_calls=[]
source_paths=[RUN/'analysis-input.json',RUN/'analysis-preparation-stage2/supplement-normalization-summary.json',Path(__file__)]
for population,paths in [('primary',sorted((RUN/'trace').glob('*.jsonl'))),('supplement',[RUN/'supplement/dependency-census.jsonl'])]:
    for path in paths:
        source_paths.append(path)
        with path.open() as stream:
            for number,line in enumerate(stream,1):
                row=json.loads(line)
                actor=path.stem if population=='primary' else 'main'
                lane=agents[actor]['lane'] if population=='primary' else 'observer-metadata'
                if row.get('ok') is False:
                    refusals.append({'population':population,'trace_id':row['id'],'agent':actor,'role':agents[actor]['role'],
                                     'lane':lane,'method':row['method'],'step':row.get('step'),'code':row.get('code'),
                                     'message':row.get('message'),'args':row.get('args'),'source':str(path)+':'+str(number)})
                if population=='supplement' and any(part.get('timing') for part in row.get('daemon',[])):
                    row.update(_agent='main',_source=str(path)+':'+str(number),_start=stamp(row['start']),_duration=row['ms'])
                    row['_end']=row['_start']+row['ms']/1000
                    phase_calls.append(row)
needed={row['trace_id'] for row in refusals}|{row['id'] for row in phase_calls}
receipts={}
normalized=[RUN/'normalized-receipts/calls.jsonl']+sorted((RUN/'normalized-supplement').glob('*-r2/calls.jsonl'))
for path in normalized:
    source_paths.append(path)
    with path.open() as stream:
        for number,line in enumerate(stream,1):
            row=json.loads(line)
            if row['traceId'] in needed:
                receipts[row['traceId']]=dict(row,_source=str(path)+':'+str(number))
for row in refusals:
    receipt=receipts[row['trace_id']]
    error=receipt.get('error',{})
    row.update(message=error.get('message',row['message']),detail=error.get('detail'),full_receipt=receipt['_source'],
               raw_receipt=receipt.get('normalizedFrom'),handling='Exact original refusal retained; primary handling lives in b1-refusals.csv, supplementary observer outcomes remain separate')
grouped=Counter()
for row in refusals:
    for population in [row['population'],'combined']:
        for dimension,group in [('overall','all'),('agent',row['agent']),('lane',row['lane'])]:
            grouped[(population,dimension,group,row['method'],row['code'])]+=1
refusal_summary=[dict(zip(['population','dimension','group','method','code'],key),count=count) for key,count in sorted(grouped.items(),key=lambda item:str(item[0]))]
ev=Evidence.__new__(Evidence)
ev.root=RUN
ev.repo=REPO
ev.config={'resolutions':[]}
ev.sources={}
ev.issues=[]
ev.agents={'main':{'role':'observer','lane':'observer-metadata'}}
ev.calls=phase_calls
ev.receipts=receipts
phase_tables=operation_tables(ev)
output=REPO/'core/docs/issues/340/tables/b1-final-supplement-r1'
output.mkdir(exist_ok=False)
tables={
 'b1-all-refusals.csv':(refusals,'population trace_id agent role lane method step code message args detail full_receipt raw_receipt handling source'),
 'b1-all-refusal-summary.csv':(refusal_summary,'population dimension group method code count'),
 'b1-supplement-phases.csv':(phase_tables['phases'],COLUMNS['phases']),
 'b1-supplement-phase-summary.csv':(phase_tables['phase-summary'],COLUMNS['phase-summary']),
}
source_paths += [REPO/'core/target/issue340/analysis'/name for name in ['evidence.py','operations.py','generate.py']]
sources=[pin(path) for path in sorted(set(source_paths))]
for name,(rows,columns) in tables.items():
    Evidence.write(None,output,name,rows,columns.split())
    (output/(name+'.sources.json')).write_text(json.dumps({'table':name,'classification':'Diagnostic raw-trace populations; unknown cache; tracing on',
        'sources':sources,'contract':'Refusal counts derive raw ok=false traces; exact full replies joined through separately verified normalization. Supplement phases use unchanged operation_tables on every trace carrying a nonempty phase tree; inclusive phase paths are never added. Full every-receipt source pins live transitively in immutable population manifests.'},indent=2)+'\n')
summary={'classification':'Diagnostic supplemental populations, not performance comparison','primaryRefusals':sum(row['population']=='primary' for row in refusals),
         'supplementRefusals':sum(row['population']=='supplement' for row in refusals),'combinedRefusals':len(refusals),
         'supplementPhaseCalls':len(phase_calls),'supplementPhaseRows':len(phase_tables['phases']),
         'supplementPhaseQuality':ev.issues,'tables':{name:len(rows) for name,(rows,columns) in tables.items()}}
(output/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
(output/'manifest.json').write_text(json.dumps({'sources':sources,'outputs':{str(path.relative_to(output)):pin(path) for path in sorted(output.iterdir()) if path.is_file()}},indent=2)+'\n')
print(json.dumps(summary))
