"""Explicit B1 elapsed boundary intervals; not inferred agent or exclusive phase time."""
import csv
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

REPO=Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN=REPO/'core/target/issue340/b1'
OUT=REPO/'core/docs/issues/340/tables/b1-final-phase-boundaries-r1'
OUT.mkdir(exist_ok=False)


def pin(path):
    data=path.read_bytes()
    return {'path':str(path.resolve()),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}


def start(row):
    return datetime.fromisoformat(row['start'].replace('Z','+00:00')).timestamp()


def end(row):
    return start(row)+row['ms']/1000


paths=[RUN/'trace/lead.jsonl',RUN/'trace/main.jsonl']
calls=[]
for path in paths:
    calls.extend(dict(json.loads(line),agent=path.stem) for line in path.read_text().splitlines() if line.strip())
by_id={row['id']:row for row in calls}
lead=[row for row in calls if row['agent']=='lead']
init=next(row for row in calls if row['method']=='project.init')
first_lead=min(lead,key=start)
publishes=sorted((row for row in lead if row['method']=='branch.publish'),key=start)
lead_close=max((row for row in lead if row['method']=='sandbox.close'),key=end)
root_close=by_id['2060acd5-1']
normalized=[json.loads(line) for line in (RUN/'normalized-receipts/calls.jsonl').read_text().splitlines()]
sequence={int(Path(row['normalizedFrom']['path']).stem.split('-')[-1]):by_id[row['traceId']] for row in normalized if row['agent']=='lead'}
definitions=[('Init SDK call',init,'start',init,'end'),
 ('L0 lead SDK workflow',first_lead,'start',publishes[0],'end'),
 ('Post-L0 integration elapsed',publishes[0],'end',publishes[-1],'end'),
 ('Final acceptance r3 fork through A15 unmount',sequence[502],'start',sequence[562],'end'),
 ('Lead closure metadata tail',sequence[562],'end',lead_close,'end'),
 ('Observer collection tail after lead close',lead_close,'end',root_close,'end'),
 ('Lead SDK workflow total',first_lead,'start',lead_close,'end'),
 ('B1 complete SDK custody window',init,'start',root_close,'end')]
rows=[]
for label,left,left_point,right,right_point in definitions:
    a=start(left) if left_point=='start' else end(left)
    b=start(right) if right_point=='start' else end(right)
    rows.append({'interval':label,'start':datetime.fromtimestamp(a,timezone.utc).isoformat(),
                 'end':datetime.fromtimestamp(b,timezone.utc).isoformat(),'seconds':b-a,
                 'start_trace_id':left['id'],'start_boundary':left_point,'end_trace_id':right['id'],'end_boundary':right_point,
                 'contract':'Explicit elapsed SDK boundary interval; inclusive/overlapping rows are not additive; no exact agent spawn, exclusive work, CPU or benchmark claim'})
with (OUT/'b1-phase-boundaries.csv').open('x',newline='') as stream:
    writer=csv.DictWriter(stream,fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
sources=[pin(path) for path in paths+[RUN/'normalized-receipts/calls.jsonl',RUN/'analysis-view-r2/analysis-input.json',Path(__file__)]]
(OUT/'b1-phase-boundaries.csv.sources.json').write_text(json.dumps({'table':'b1-phase-boundaries.csv','sources':sources,
    'classification':'Diagnostic explicit elapsed intervals from quiescent UTC SDK traces; tracing on/cacheunknown',
    'unavailable':'Phase0/A/rebuild/B2 and actual agent start/termination boundaries are outside this B1 analysis source population; do not infer them from these rows'},indent=2)+'\n')
(OUT/'summary.json').write_text(json.dumps({'classification':'Explicit boundary durations, not inferred discrete phase work','rows':rows,
    'unavailable':['Phase0','PhaseA','rebuild','Build2','exact agent start/termination','exclusive active-work time']},indent=2)+'\n')
shutil.copyfile(Path(__file__),OUT/'phase_boundaries.py')
(OUT/'manifest.json').write_text(json.dumps({'sources':sources,'outputs':{path.name:pin(path) for path in sorted(OUT.iterdir()) if path.is_file()}},indent=2)+'\n')
print(json.dumps({'manifest':pin(OUT/'manifest.json'),'rows':rows},indent=2))
