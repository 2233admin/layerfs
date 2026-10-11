"""Exact Git-tree production LOC with the repository's pinned counter."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import sys
root = Path(__file__).resolve().parents[5]
counter = root / 'tools/production_loc.py'
spec = importlib.util.spec_from_file_location('production_loc', counter)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
def count(revision):
    tree = subprocess.check_output(['git', 'rev-parse', revision + '^{tree}'], cwd=root, text=True).strip()
    records = subprocess.check_output(['git','ls-tree','-r','-z',tree,'core/crates','crates'],cwd=root).split(b'\0')
    chosen = []
    for record in records:
        if not record: continue
        metadata, path = record.split(b'\t',1)
        parts = path.decode().split('/')
        relative = parts[2:] if parts[0]=='core' else parts[1:]
        if len(relative) >= 3 and (relative[1] in ('src','sql') or (relative[0]=='layerfs-api' and len(relative)>3 and relative[1] in ('core','sdk') and relative[2] in ('src','sql'))) and path.endswith((b'.rs',b'.sql')):
            chosen.append((metadata.split()[2],path))
    process = subprocess.run(['git','cat-file','--batch'], input=b''.join(oid+b'\n' for oid,_ in chosen), cwd=root, capture_output=True, check=True)
    data=process.stdout; offset=0
    with tempfile.TemporaryDirectory(dir=root/'core/target/issue319-terminal') as directory:
        base=Path(directory)
        for oid,path in chosen:
            end=data.index(b'\n',offset); header=data[offset:end].split(); length=int(header[2]); offset=end+1
            destination=base/path.decode(); destination.parent.mkdir(parents=True,exist_ok=True)
            destination.write_bytes(data[offset:offset+length]); offset+=length+1
        report=module.scan(base); report.pop('root')
    return {'product_tree': subprocess.check_output(['git','rev-parse',tree+':core/crates'],cwd=root,text=True).strip(),**report}
mode=sys.argv[1]
a,b=('HEAD',subprocess.check_output(['git','write-tree'],cwd=root,text=True).strip()) if mode=='staged' else ('HEAD^','HEAD')
left,right=count(a),count(b)
print(json.dumps({'schema':'issue319-exact-production-loc-v1','method':'Git ls-tree/cat-file exact snapshots; tools/production_loc.py scan, same src/sql classification and inline-test exclusions','counter_sha256':hashlib.sha256(counter.read_bytes()).hexdigest(),'reference':'reference absent (retired R9c; last counted 65,417 at tree 498dd1917812)','before':left,'after':right,'delta':right['combined']-left['combined']},indent=2))
