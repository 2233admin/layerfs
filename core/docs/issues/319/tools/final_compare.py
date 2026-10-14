"""Derive b1 count comparisons; never replace an owning report or receipt."""
import csv, hashlib, json
from collections import Counter
from pathlib import Path
ROOT=Path.cwd(); RESULTS=ROOT/'benchmark-results/fs-bench-pro'; HOME=ROOT/'core/target/issue319'
plan=json.loads((HOME/'final-plan.json').read_text()); journal=[json.loads(l) for l in (HOME/'final-journal.jsonl').read_text().splitlines()]
assert sum(r['kind']=='clean' and r['result']=='COMPLETE' for r in journal)==242
OUT=ROOT/'core/docs/issues/319/checks'; DOC=ROOT/'core/docs/issues/319'
metrics=['requests','owner_jobs','statements','overlay_logical_bytes','overlay_allocated_bytes','store_logical_bytes','store_allocated_bytes']
def folder(tag,family): return next(RESULTS.glob('*-issue318-'+tag+'-run-'+family))
def read(tag,family,case):
 p=folder(tag,family)/case/'receipt.json'
 return (json.loads(p.read_text()),str(p.relative_to(ROOT)),hashlib.sha256(p.read_bytes()).hexdigest()) if p.exists() else ({},None,None)
def values(r):
 return {k:r.get('counts',{}).get(k) if k in metrics[:3] else r.get('observations',{}).get(k,{}).get('value') for k in metrics}
def brief(r,p,h):
 return {'receipt':p,'receipt_sha256':h,'source_commit':r.get('source_commit'),'product_tree':r.get('product_tree'),'status':r.get('status'),'functional_status':r.get('functional_status'),'proof_status':r.get('proof_status'),'cleanup':r.get('cleanup'),'custody':r.get('custody'),'metrics':values(r)}
def safe(t):
 t=str(t).replace(str(ROOT),'[worktree]').replace(str(Path.home()),'[home]')
 assert str(Path.home()) not in t
 return t
rows=[]; summaries=[]
for fam in plan['families']:
 perf=ROOT/'core/benchmark/fs-bench-pro/baselines/core/2026-10-11-5ff40d53c'/fam/'performance.csv'
 proof=perf.with_name('verification.csv')
 pmap={r['case']:r for r in csv.DictReader(perf.open())}; vmap={r['case']:r for r in csv.DictReader(proof.open())}
 these=[]
 for item in [c for c in plan['cases'] if c['family']==fam]:
  case=item['case']; b,bp,bh=read('b1',fam,case); n,np,nh=read('p319-final',fam,case); prior,pp,ph=read('p319-12',fam,case) if fam in ['edit_length_preserving','edit_length_changing','dedup_workspace_reuse','store_footprint'] else ({},None,None)
  history=[r for r in journal if r['family']==fam and r['case']==case]
  why=None
  if item['selection']=='excluded-by-owner-handoff': why='NOT_RUN: repository_history excluded by owner handoff'
  elif item['selection']=='already-source-dispositioned': why='NOT_APPLICABLE: final whole-core source review; original reason unchanged'
  elif any(r['result']=='FAILED_PREPARATION' for r in history): why='NOT_RUN: one preparation expired; never retried'
  elif not n and prior: why='Final attempt refused before execution by existing same-treatment claim; earlier receipt remains separate'
  elif not n: why='One sample invocation failed without completed receipt; retained partial output, no retry'
  else: why='Fresh final-tag receipt'
  detail={'family':fam,'case':case,'baseline':brief(b,bp,bh),'final':brief(n,np,nh),'owning_report_status':pmap[case]['status'],'owning_report_proof_status':vmap[case]['proof_status'],'disposition':why,'journal':history,'comparison':{k:{'before':values(b)[k],'after':values(n)[k],'delta':values(n)[k]-values(b)[k] if type(values(n)[k]) is int and type(values(b)[k]) is int else None} for k in metrics}}
  if prior:
   # The refusal's immutable claim is the earlier measurement's exact key.
   claim=RESULTS/'claims'/prior['claim']; assert claim.exists(); assert str(folder('p319-12',fam)/case) in claim.read_text()
   logs=[(ROOT/r['log']).read_text() for r in history if r['kind']=='run']
   underlying=ROOT/'core/target/issue318/logs'/('p319-final-run-'+fam+'-'+case+'.stderr')
   err=underlying.read_text() if underlying.exists() else ''
   assert prior['claim'] in err and 'FileExistsError' in err, 'same-treatment refusal must bind exact prior claim'
   detail['prior_matching_evidence']={**brief(prior,pp,ph),'claim_sha256_key':prior['claim'],'reason':'Existing immutable treatment claim refused final attempt; source metadata alone is not new treatment','comparison':{k:{'before':values(b)[k],'after':values(prior)[k],'delta':values(prior)[k]-values(b)[k] if type(values(prior)[k]) is int and type(values(b)[k]) is int else None} for k in metrics}}
  rows.append(detail);these.append(detail)
 summaries.append({'family':fam,'cases':len(these),'b1_dual_pass':sum(r['baseline']['functional_status']=='PASS' and r['baseline']['proof_status']=='PASS' for r in these),'final_dual_pass':sum(r['final']['functional_status']=='PASS' and r['owning_report_proof_status']=='PASS' for r in these),'prior_matching_dual_pass':sum(r.get('prior_matching_evidence',{}).get('functional_status')=='PASS' and r.get('prior_matching_evidence',{}).get('proof_status')=='PASS' for r in these),'final_statuses':dict(Counter(r['owning_report_status'] for r in these)),'final_proof_statuses':dict(Counter(r['owning_report_proof_status'] for r in these))})
assert len(rows)==273 and sum(s['b1_dual_pass'] for s in summaries)==184
payload={'schema':'issue319-b1-count-comparison-v1','tag':'p319-final','source_commit':plan['source_commit'],'product_tree':plan['product_tree'],'rule':'Owning final statuses are unchanged; seven prior same-treatment receipts are separate, never fresh final PASS. Unknown metrics/deltas remain null. No timing comparison.','decision':'Decided by agent, pending owner review: retain matched prior evidence instead of bypassing one-treatment guard.','families':summaries,'cases':rows}
text=json.dumps(payload,indent=2,sort_keys=True)+'\n';safe(text);(OUT/'final-counts.json').write_text(text)
with (DOC/'FINAL-COUNTS.csv').open('x',newline='') as f:
 fields=['family','case','evidence_kind','status','functional_status','proof_status','cleanup','custody','source_commit','receipt']+[side+'_'+k for k in metrics for side in ['b1','observed','delta']]
 w=csv.DictWriter(f,fields,lineterminator='\n');w.writeheader()
 for r in rows:
  for kind,ob,c in [('final',r['final'],r['comparison'])]+([('prior-matching',r['prior_matching_evidence'],r['prior_matching_evidence']['comparison'])] if 'prior_matching_evidence' in r else []):
   row={k:ob.get(k) for k in fields if k in ob};row.update(family=r['family'],case=r['case'],evidence_kind=kind,status=r['owning_report_status'] if kind=='final' else ob['status'],proof_status=r['owning_report_proof_status'] if kind=='final' else ob['proof_status'])
   for k in metrics:
    for side,sub in [('b1','before'),('observed','after'),('delta','delta')]:row[side+'_'+k]=c[k][sub] if c[k][sub] is not None else 'UNAVAILABLE'
   w.writerow(row)
def fmt(v):return str(v) if v is not None else '—'
lines=['# Final count comparison against b1','','> Status: Dated planning checkpoint; not release evidence or a product contract.','',f"Source `{plan['source_commit']}`, complete core tree `{plan['product_tree']}`. Derived from immutable receipts and owning CSVs; no timing comparisons.",'','A dash is unavailable, not zero. Status/proof columns are the owning final report. Rows marked prior evidence retain their original source/tag and do not turn a refused final attempt into a PASS. Exact metric deltas and storage axes are in [CSV](FINAL-COUNTS.csv) and [JSON](checks/final-counts.json).','','| Family | Cases | b1 both checks PASS | Fresh final both PASS | Separate prior both PASS | Final owning statuses |','| --- | ---: | ---: | ---: | ---: | --- |']
for s in summaries:lines.append('| '+' | '.join([s['family'],str(s['cases']),str(s['b1_dual_pass']),str(s['final_dual_pass']),str(s['prior_matching_dual_pass']),str(s['final_statuses'])])+' |')
for fam in plan['families']:
 lines+=['',f'## {fam}','','| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |','| --- | --- | --- | ---: | ---: | ---: | ---: |']
 for r in [r for r in rows if r['family']==fam]:
  def emit(kind,ob,c,status):
   lines.append('| '+' | '.join([r['case'],status+' / '+str(r['owning_report_proof_status'] if kind!='prior p319-12; separate' else ob.get('proof_status')),kind]+[fmt(c[k]['before'])+' → '+fmt(c[k]['after']) for k in metrics[:4]])+' |')
  emit('fresh receipt' if r['final']['receipt'] else r['disposition'],r['final'],r['comparison'],r['owning_report_status'])
  if 'prior_matching_evidence' in r:emit('prior p319-12; separate',r['prior_matching_evidence'],r['prior_matching_evidence']['comparison'],r['prior_matching_evidence']['status'])
(DOC/'FINAL-COUNTS.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(summaries,indent=2));print('dual totals',sum(s['b1_dual_pass'] for s in summaries),sum(s['final_dual_pass'] for s in summaries),sum(s['prior_matching_dual_pass'] for s in summaries))
