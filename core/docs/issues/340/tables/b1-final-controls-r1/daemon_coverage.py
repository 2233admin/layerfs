"""Map every actual B1 Sandbox to both retained daemon streams and exact selection."""
import hashlib
import json
from pathlib import Path

REPO=Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN=REPO/'core/target/issue340/b1'
CONTROL=Path(__file__).resolve().parent
output=CONTROL/'daemon-coverage-r1.json'


def pin(path):
    data=path.read_bytes()
    return {'path':str(path.resolve()),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}


calls=[json.loads(line) for line in (RUN/'normalized-receipts/calls.jsonl').read_text().splitlines()]
closed={row['result']['id']:row for row in calls if row['method']=='sandbox.close' and isinstance(row.get('result'),dict)}
config=json.loads((RUN/'analysis-input.json').read_text())
selected={str((RUN/path).resolve()) for path in config['daemonLogs']}
paths=set((RUN/'agents').glob('*/daemon/**/*.json'))
for name in ['I1/out/daemon-capture.json','W1/out/daemon-log-capture.json','W1b/out/daemon-log-capture.json','W1f/out/daemon-capture.json','I2/out/daemon/receipt.json']:
    paths.add(RUN/'agents'/name)
rows=[]
captures=[]
for path in sorted(paths):
    obj=json.loads(path.read_text())
    streams=obj.get('streams')
    if not streams and all(isinstance(obj.get(name),dict) for name in ['stdout','stderr']):
        streams={name:obj[name] for name in ['stdout','stderr']}
    if not streams and isinstance(obj.get('files'),list):
        streams={Path(row['path']).name.split('.')[0]:row for row in obj['files']}
    if not streams and all(name+'Bytes' in obj for name in ['stdout','stderr']):
        streams={name:{'bytes':obj[name+'Bytes'],'sha256':None} for name in ['stdout','stderr']}
    if not streams:
        continue
    command=obj.get('argv',obj.get('command',obj.get('actualCommand',[])))
    sandbox=obj.get('sandbox',obj.get('selectedSandbox',obj.get('container')))
    if sandbox is None:
        sandbox=next((token for token in reversed(command) if isinstance(token,str) and len(token)==64 and all(char in '0123456789abcdef' for char in token)),None)
    if not sandbox.startswith('sb_'):
        sandbox='sb_'+sandbox
    assert sandbox in closed
    agent=path.relative_to(RUN).parts[1]
    agent_root=RUN/'agents'/agent
    for key,info in streams.items():
        stream='stdout' if 'stdout' in key else 'stderr' if 'stderr' in key else None
        if stream is None:
            continue
        candidates=[]
        if info.get('path'):
            supplied=Path(info['path'])
            candidates.extend([supplied,agent_root/supplied,path.parent/supplied])
        candidates.extend([path.parent/Path(key).name,agent_root/key,agent_root/'daemon'/(stream+'.log')])
        stream_path=next(candidate for candidate in candidates if candidate.is_file() and candidate.stat().st_size==info['bytes'])
        actual=pin(stream_path)
        assert info.get('sha256') in [None,actual['sha256']]
        rows.append({'agent':agent,'sandbox':sandbox,'stream':stream,'raw':actual,'capture':pin(path),
                     'captureEnd':obj.get('endUTC',obj.get('endUtc',obj.get('endedAt',obj.get('end')))),
                     'closeTraceId':closed[sandbox]['traceId'],'closeReceipt':closed[sandbox]['normalizedFrom'],
                     'captureRecordedSha256':info.get('sha256'),'integrity':'actual bytes+SHA match recorded capture' if info.get('sha256') else 'capture recorded byte count only; current SHA observed independently',
                     'selectedInR1':str(stream_path.resolve()) in selected,'selectedInR2':True,
                     'selectionContract':'original agent daemon stream; complete saved snapshot, later close reply may not appear in preclose stream'})
    captures.append(pin(path))
for folder,filter_name in [('observer-halt-p003-jsonlog','observer-halt-r1'),('observer-final-jsonlog','observer-final-r1')]:
    path=RUN/folder/'verified.json'
    obj=json.loads(path.read_text())
    sandbox='sb_'+obj['source']['logs'][0].split('-json.log')[0]
    assert sandbox in closed and obj['status']=='PASS'
    for stream in ['stdout','stderr']:
        rows.append({'agent':'main','sandbox':sandbox,'stream':stream,'raw':obj[stream],'capture':pin(path),
                     'closeTraceId':closed[sandbox]['traceId'],'closeReceipt':closed[sandbox]['normalizedFrom'],
                     'integrity':'root complete json-file extraction verified and source-pinned; not recaptured/rehashed by this mapping',
                     'selectedInR1':stream=='stderr','selectedInR2':stream=='stderr',
                     'selectedDerivative':str((RUN/'daemon-scope-filter'/filter_name/'selected.log').resolve()) if stream=='stderr' else None,
                     'selectionContract':'stderr selected through sealed scope derivative; stdout retained as provenance, no numeric observation input' if stream=='stderr' else 'retained original stdout provenance only; no telemetry metric selection'})
    captures.append(pin(path))
keys={(row['sandbox'],row['stream']) for row in rows}
assert len(closed)==31 and len(rows)==len(keys)==62
assert keys=={(sandbox,stream) for sandbox in closed for stream in ['stdout','stderr']}
result={'classification':'Exact retained daemon-stream custody/selection map; no recapture or SDK call','status':'PASS',
        'closedSandboxes':31,'retainedRawStreams':62,'selectedR1Inputs':58,'selectedR2Inputs':60,
        'r1OmittedAgentStreams':[row for row in rows if row['agent']=='I2'],
        'rootStdoutProvenanceOnly':2,'sourceContract':'31 ids come from exact successful close replies; W2 both ids, all three lead ids, and both observer ids represented; original timestamps/limits retained',
        'rows':rows,'captureSources':captures,'generator':pin(Path(__file__))}
output.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'status':'PASS','sandboxes':31,'rawStreams':62,'selectedR1':58,'selectedR2':60,'omission':'I2 stdout+stderr found under agents/I2/out/daemon'}))
