import hashlib,json
from pathlib import Path
R=Path('benchmark-results/fs-bench-pro');out=[]
for i in range(1,13):
 case=f'C{i:02}'; pair=[]
 for tag in ['b1','p319-final']:
  p=next(R.glob('*-issue318-'+tag+'-run-cells'))/case/'receipt.json';r=json.loads(p.read_text())
  pair.append({'receipt':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),**{k:r.get(k) for k in ['case','source_commit','product_tree','status','proof_status','count_reproduction','counts','cleanup','custody']}})
 assert pair[0]['counts']==pair[1]['counts']
 out.append({'case':case,'b1':pair[0],'final':pair[1],'counts_equal_b1':True})
p=Path('core/docs/issues/319/checks/final-cells.json');p.write_text(json.dumps({'rule':'No retargeted frozen oracle; all 12 triples equal b1; C10 retains its original FAIL','cells':out},indent=2)+'\n')
for x in out:print(x['case'],x['final']['counts'],x['final']['status'],x['final']['proof_status'],x['final']['count_reproduction'])
