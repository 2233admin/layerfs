"""Keep owning output privately and publish location-portable CSV text."""
import csv, hashlib, io, json
from pathlib import Path
ROOT=Path.cwd(); HOME=ROOT/'core/target/issue319'; dest=HOME/'owning-csv';dest.mkdir(exist_ok=True)
paths=list((ROOT/'core/benchmark/fs-bench-pro/baselines/core/2026-10-11-5ff40d53c').rglob('*.csv'))+list((ROOT/'core/benchmark/cluster-two/baselines/2026-10-11-5ff40d53c').glob('*.csv'))
assert len(paths)==52
out=[]
for p in paths:
 raw=p.read_text(); rel=p.relative_to(ROOT); saved=dest/rel;saved.parent.mkdir(parents=True,exist_ok=True)
 with saved.open('x') as f:f.write(raw)
 new=raw.replace(str(ROOT),'[worktree]').replace(str(Path.home()),'[home]')
 assert str(Path.home()) not in new
 oldrows=list(csv.DictReader(io.StringIO(raw)));newrows=list(csv.DictReader(io.StringIO(new)))
 assert len(oldrows)==len(newrows)
 for a,b in zip(oldrows,newrows):
  for key in a:
   assert b[key]==a[key].replace(str(ROOT),'[worktree]').replace(str(Path.home()),'[home]')
 p.write_text(new)
 out.append({'path':str(rel),'owning_sha256':hashlib.sha256(raw.encode()).hexdigest(),'published_sha256':hashlib.sha256(new.encode()).hexdigest(),'rows':len(newrows),'location_redacted':raw!=new})
Path('core/docs/issues/319/checks/final-csv-publication.json').write_text(json.dumps({'rule':'Only text location substitutions [worktree] and [home]; every other field, metric, identity, classification and reason retained. Original owning CSVs remain ignored, with recorded digests. No receipt or oracle change.','files':out},indent=2)+'\n')
print('Published',len(out),'CSVs; location substitutions in',sum(r['location_redacted'] for r in out))
