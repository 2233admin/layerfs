"""Exact argument-identity supplement joins, explicitly authorized by root; no runtime calls."""
import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

METHODS = {'fs.list':('ref','path','pageSize','pagePos'), 'fs.stat':('ref','path'), 'fs.read':('ref','path')}
RELEVANT = ('ref','path','pageSize','pagePos','startLine','endLine','fromLine','pattern','encoding')


def exact_key(row):
    method, args = row.get('method'), row.get('args')
    if method not in METHODS or not isinstance(args,dict):
        raise ValueError('unsupported or missing method/argument object')
    if not all(isinstance(row.get(key),str) and row[key] for key in ('agent','step','method')):
        raise ValueError('missing agent/step/method discriminator')
    if len(row['step']) >= 200 or row.get('argsTruncated') or row.get('stepTruncated'):
        raise ValueError('missing/truncated discriminator')
    fields = dict(args)
    if 'branch' in fields:
        if 'ref' in fields and (type(fields['ref']) is not type(fields['branch']) or fields['ref'] != fields['branch']):
            raise ValueError('ref/branch alias mismatch')
        fields['ref'] = fields.pop('branch')
    if any('truncat' in key.lower() and value for key,value in fields.items()):
        raise ValueError('truncated argument discriminator')
    if any(key not in fields for key in METHODS[method]):
        raise ValueError('missing required argument discriminator')
    if not isinstance(fields['ref'],str) or not re.fullmatch('[0-9a-f]{64}',fields['ref']):
        raise ValueError('immutable full Commit ref required')
    if not isinstance(fields['path'],str) or not fields['path'].startswith('/') or fields['path'].endswith(('…','...')):
        raise ValueError('complete absolute path required')
    for key in ('pageSize','pagePos','startLine','endLine','fromLine'):
        if key in fields and (type(fields[key]) is not int or fields[key] < 0):
            raise ValueError('exact integer discriminator required: '+key)
    selected = {key:fields[key] for key in RELEVANT if key in fields}
    return json.dumps([row['agent'],row['step'],method,selected],sort_keys=True,separators=(',',':'),ensure_ascii=False)


def decide(key, trace_index, receipt_counts):
    if receipt_counts[key] != 1 or len(trace_index.get(key,[])) > 1:
        return 'ambiguous'
    return 'matched' if len(trace_index.get(key,[])) == 1 else 'unmatched'


def pin_bytes(path, data):
    return {'path':str(path.resolve()),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}


def normalize(run, output, population):
    run, output = Path(run).resolve(), Path(output).resolve()
    output.mkdir(parents=True,exist_ok=False)
    trace = run/'supplement/dependency-census.jsonl'
    trace_bytes = trace.read_bytes()
    trace_pin = pin_bytes(trace,trace_bytes)
    index, invalid_traces = defaultdict(list), []
    for number,line in enumerate(trace_bytes.splitlines(),1):
        row = json.loads(line)
        row['agent'] = 'main'
        try:
            key = exact_key(row)
        except ValueError as error:
            invalid_traces.append({'line':number,'id':row.get('id'),'error':str(error)})
            continue
        index[key].append({'id':row['id'],'line':number})
    del trace_bytes
    folders = [run/'supplement-collection/qualification-output'] if population=='qualification' else sorted((run/'supplement-collection').glob(population+'-*'))
    entries, counts, invalid = [], Counter(), []
    with (output/'sources.jsonl').open('x') as source_stream:
        for folder in folders:
            for path in sorted((folder/'calls').glob('*.json')):
                data = path.read_bytes()
                source = pin_bytes(path,data)
                source_stream.write(json.dumps(source)+'\n')
                row = json.loads(data)
                try:
                    key = exact_key(row)
                except ValueError as error:
                    invalid.append({'source':source,'reason':str(error)})
                    continue
                entries.append((path,key,source))
                counts[key] += 1
    outcomes = Counter()
    with (output/'calls.jsonl').open('x') as calls, (output/'mapping.jsonl').open('x') as mappings, (output/'quarantine.jsonl').open('x') as quarantine:
        for path,key,source in entries:
            outcome = decide(key,index,counts)
            outcomes[outcome] += 1
            if outcome != 'matched':
                quarantine.write(json.dumps({'source':source,'reason':outcome,'argumentIdentity':json.loads(key),'traceCandidates':index.get(key,[])})+'\n')
                continue
            data = path.read_bytes()
            if pin_bytes(path,data) != source:
                raise RuntimeError('source changed during normalization: '+str(path))
            raw = json.loads(data)
            joined = index[key][0]
            result = {'traceId':joined['id'],'agent':'main','role':'observer','lane':'observer-metadata',
                      'step':raw['step'],'method':raw['method'],'args':raw['args'],'start':raw.get('start'),'end':raw.get('end'),
                      'normalizedFrom':source,'population':population,
                      'normalization':'Exact unique agent+step+method+all recorded relevant immutableRef/path/page/line/pattern argument identity; ref->branch justified by actual census/SDK trace aliases; no timestamp/order join'}
            if 'error' in raw:
                result['error'] = raw['error']
            elif 'result' in raw:
                result['result'] = raw['result']
            else:
                raise ValueError('missing full result/error: '+str(path))
            calls.write(json.dumps(result,ensure_ascii=False)+'\n')
            mappings.write(json.dumps({'traceId':joined['id'],'source':source,'traceLine':joined['line'],'argumentIdentity':json.loads(key)},ensure_ascii=False)+'\n')
        for row in invalid:
            quarantine.write(json.dumps(row)+'\n')
    if pin_bytes(trace,trace.read_bytes()) != trace_pin:
        raise RuntimeError('supplement trace changed')
    summary = {'classification':'Diagnostic external argument-identity normalization; root-authorized; original receipts unchanged',
               'population':population,'trace':trace_pin,'matched':outcomes['matched'],'unmatched':outcomes['unmatched'],
               'ambiguous':outcomes['ambiguous'],'invalidReceipts':len(invalid),'invalidTraceDiscriminators':invalid_traces,
               'sourceReceiptCount':len(entries)+len(invalid),'sourceManifest':'sources.jsonl','mapping':'mapping.jsonl',
               'contract':'Raw trace remains authoritative for method counts; quarantined identities never inferred; complete original raw results retained for matched calls; no full-content claim from trace previews',
               'generator':pin_bytes(Path(__file__),Path(__file__).read_bytes())}
    (output/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    (output/'supplement_adapter.py').write_bytes(Path(__file__).read_bytes())
    print(json.dumps({key:summary[key] for key in ['population','matched','unmatched','ambiguous','invalidReceipts','sourceReceiptCount']}))


if __name__=='__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('run',type=Path)
    parser.add_argument('output',type=Path)
    parser.add_argument('population',choices=['qualification','wave1','wave2','wave3','wave4','wave5'])
    args = parser.parse_args()
    normalize(args.run,args.output,args.population)
