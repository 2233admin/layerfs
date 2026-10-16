"""Status: Current diagnostic tooling. Count primary and supplemental SDK traces explicitly."""
import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path
from evidence import Evidence, numeric, file_sha256
from operations import family, statistics_ms


def populations(primary, supplement, agents):
    groups=defaultdict(list)
    seen=set()
    for population,calls in [('primary',primary),('supplement',supplement)]:
        for call in calls:
            if call['id'] in seen:
                raise ValueError('duplicate trace identity across populations: '+call['id'])
            seen.add(call['id'])
            agent=call['_agent']
            lane=call.get('_lane',agents.get(agent,{}).get('lane'))
            for selection in (population,'combined'):
                for dimension,group in [('overall','all'),('agent',agent),('lane',lane)]:
                    groups[(selection,dimension,group,family(call.get('method')),call.get('method'))].append(call)
    output=[]
    for key,calls in sorted(groups.items(),key=lambda item:str(item[0])):
        output.append(dict(zip(('population','dimension','group','class','method'),key),
                           count=len(calls),**statistics_ms([row.get('_duration') for row in calls]),
                           timing_coverage='complete-observed-calls'if all(numeric(row.get('_duration')) for row in calls)else'partial'))
    return output


def generate(run,output,repo,prefix):
    ev=Evidence(run,repo)
    if any(issue['kind']=='conflicting-trace-id'for issue in ev.issues):
        raise ValueError('ambiguous primary trace identities require audit')
    supplement=[]
    for path in sorted((ev.root/'supplement').glob('*.jsonl')):
        for call in ev.iter_jsonl(path):
            if call.get('layerfs_trace')!=1 or not call.get('id'):
                raise ValueError('supplement is not an SDK trace: '+call['_source'])
            duration=call.get('ms')
            supplement.append(dict(id=call['id'],method=call.get('method'),_agent='main',_lane='observer-metadata',
                                   _duration=duration if numeric(duration)and duration>=0 else None))
    rows=populations(ev.calls,supplement,ev.agents)
    for path in Path(__file__).parent.glob('*.py'):
        if not path.name.startswith('test_'):ev.register(path)
    for source in ev.sources.values():
        if file_sha256(source['path'])!=source['sha256']:
            raise ValueError('source changed during derivation: '+source['path'])
    output=Path(output).resolve();output.mkdir(parents=True,exist_ok=False)
    name=f'{prefix}-all-methods.csv'
    columns='population dimension group class method count duration_count median_ms p95_ms max_ms timing_coverage'.split()
    ev.write(output,name,rows,columns)
    sources=sorted(ev.sources.values(),key=lambda row:row['path'])
    (output/(name+'.sources.json')).write_text(json.dumps({'table':name,'sources':sources,
        'contract':'Primary scenario and supplemental root metadata census are separate populations. Supplemental observation may overlap active team development; that interference remains disclosed. Combined statistics are recomputed from every raw call duration, never averages of medians. Supplement actor is main, not a new agent. Diagnostics only; unknown cache state.'},indent=2)+'\n')
    for path in Path(__file__).parent.glob('*.py'):
        if not path.name.startswith('test_'):
            target=output/'tool-sources'/path.name;target.parent.mkdir(exist_ok=True)
            target.write_bytes(path.read_bytes())
    summary={'classification':'diagnostic; primary/supplement/combined explicitly separated; not benchmark evidence',
             'primaryCalls':len(ev.calls),'supplementCalls':len(supplement),'combinedCalls':len(ev.calls)+len(supplement),
             'sourceCount':len(sources),'rows':len(rows)}
    (output/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    files={str(path.relative_to(output)):{'bytes':path.stat().st_size,'sha256':file_sha256(path)}
           for path in output.rglob('*')if path.is_file()}
    (output/'manifest.json').write_text(json.dumps({'sources':sources,'outputs':files},indent=2)+'\n')
    print(json.dumps(summary))


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('run',type=Path);parser.add_argument('output',type=Path)
    parser.add_argument('--repo-root',type=Path,default=Path(__file__).resolve().parents[4])
    parser.add_argument('--prefix',required=True)
    args=parser.parse_args()
    if any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-'for c in args.prefix):
        raise ValueError('simple prefix required')
    generate(args.run,args.output,args.repo_root,args.prefix)
