#!/usr/bin/env python3
"""Docs-only classification from frozen B1 JSON metadata; no Store or app access."""
from pathlib import Path
import csv
import hashlib
import json
import shutil

ROOT = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
LEAD = ROOT / 'core/target/issue340/b1/agents/lead/out'
OUT = ROOT / 'core/docs/issues/340/tables/b1-final-source-classification-r1'

def pin(p):
    return {'path': str(p), 'bytes': p.stat().st_size,
            'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}

def read(name):
    return json.loads((LEAD / name).read_text())

def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + '\n')

assert not OUT.exists(), 'fresh append-only output required'
stdout = LEAD / 'final-acceptance-source-dependencies.stdout'
lines = [json.loads(line) for line in stdout.read_text().splitlines()]
assert len(lines) == 3 and lines[1]['kind'] == 'final-source-inventory-v1'
inv = lines[1]
qualified = read('final-qualified-int-final-b1-r7.json')
proof = read('final-acceptance-source-dependency-proof.json')
quality = read('source-quality-review-10037.json')
prior = read('final-qualified-int-final-b1-r5.json')['sourceInventory']
assert inv == qualified['sourceInventory']
assert proof['verified'] and all(proof[k] for k in (
    'allProductionByteIdentical', 'allMaintainedByteIdentical',
    'allConfigurationByteIdentical'))
assert pin(stdout)['sha256'] == proof['proof']['streams']['stdout']['sha256']
assert proof['sourceIdentity'] == quality['sourceIdentity'] == inv['sourceIdentity']
prod = {x['path']: x for x in inv['production']}
maint = {x['path']: x for x in inv['maintained']}
assert len(prod) == 197 and len(maint) == 370 and prod.keys() <= maint.keys()
assert all(prod[k] == maint[k] for k in prod)
assert max(x['physicalLines'] for x in prod.values()) == 230
assert proof['productionLOC'] == quality['actualLOC'] == 10037
added = sorted(maint.keys() - {x['path'] for x in prior['maintained']})
assert len(prior['maintained']) == quality['maintainedFiles'] == 366
assert not ({x['path'] for x in prior['maintained']} - maint.keys())
assert len(added) == 4 and not (set(added) & prod.keys())
OUT.mkdir()
script = OUT / Path(__file__).name
shutil.copyfile(__file__, script)
sources = [pin(LEAD / n) for n in (
    'final-acceptance-source-dependencies.stdout',
    'final-acceptance-source-dependency-proof.json',
    'final-qualified-int-final-b1-r7.json',
    'final-qualified-int-final-b1-r5.json',
    'source-quality-review-10037.json')]
sources.append(pin(script))

def table(name, rows, fields):
    path = OUT / name
    with path.open('w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    write_json(Path(str(path) + '.sources.json'), {
        'table': pin(path), 'sources': sources,
        'method': 'Exact retained sourceInventory arrays, integer byte sums, path-membership classification; all rows included; no app source reads.',
        'finalIdentityProof': proof['main'],
        'scope': inv['scope'],
        'limits': 'Regular maintained code inventory only; configuration list has hashes but no byte counts. Production is a subset of maintained. No dependency/build/generated/data bytes or exclusive physical allocation.'})

rows = []
for path, item in sorted(maint.items()):
    category = 'production' if path in prod else ('scripts_nonproduction' if path.startswith('scripts/') else 'packages_nonproduction')
    rows.append({'path': path, 'classification': category,
                 'bytes': item['bytes'], 'sha256': item['sha256'],
                 'physicalLines': item['physicalLines']})
table('b1-maintained-files.csv', rows,
      ['path', 'classification', 'bytes', 'sha256', 'physicalLines'])
summary = []
for category in ['production', 'packages_nonproduction', 'scripts_nonproduction']:
    selected = [x for x in rows if x['classification'] == category]
    summary.append({'population': category, 'files': len(selected),
                    'bytes': sum(x['bytes'] for x in selected),
                    'productionLOC': 10037 if category == 'production' else '',
                    'maximumPhysicalLines': max(x['physicalLines'] for x in selected),
                    'relation': 'disjoint classification'})
summary.append({'population': 'all_maintained', 'files': len(rows),
                'bytes': sum(x['bytes'] for x in rows),
                'productionLOC': '',
                'maximumPhysicalLines': max(x['physicalLines'] for x in rows),
                'relation': 'sum of three disjoint classification rows'})
table('b1-source-summary.csv', summary,
      ['population', 'files', 'bytes', 'productionLOC', 'maximumPhysicalLines', 'relation'])
largest = quality['largestByProductionLOC']
for item in largest:
    assert {k: item[k] for k in ['path','bytes','sha256','physicalLines']} == prod[item['path']]
table('b1-largest-production-sources.csv', largest, list(largest[0]))
details = {
    'finalMain': proof['main'], 'sourceIdentity': inv['sourceIdentity'],
    'finalMetadataAt': proof['at'], 'finalMetadataTraceStep': proof['traceStep'],
    'classificationScope': inv['scope'],
    'productionScope': quality['classification'],
    'qualityReviewAt': quality['at'],
    'qualityReviewHistoricalLimitation': quality['qualificationLimitation'],
    'finalSourceIdentityApplicability': 'Historical quality review production paths/bytes/hashes and source identity match final metadata; acceptance qualification is established by the separate final proof, not the earlier quality review.',
    'maintainedHistoricalCount': 366, 'maintainedFinalCount': 370,
    'addedMaintainedNonproductionPathsSinceR5': added,
    'unchangedProductionBytes': 663586, 'maintainedBytes': 1600579,
    'configurationFiles': len(lines[2]['files']),
    'configurationBytes': None,
    'configurationByteLimit': 'Eight configuration paths are hash-only in this receipt; bytes unavailable from this source.',
    'summary': summary,
    'noRunWrites': True, 'sources': sources}
write_json(OUT / 'summary.json', details)
write_json(OUT / 'manifest.json', {'sources': sources,
           'outputs': [pin(p) for p in sorted(OUT.iterdir())]})
files = [p for p in (ROOT / 'core/docs/issues/340/tables').rglob('*')
         if p.is_file() and p.parts[-2].startswith('b1-')]
print(json.dumps({'classificationSummary': summary,
                  'newManifest': pin(OUT/'manifest.json'),
                  'addedNonproduction': added,
                  'gitFacingTableFiles': len(files),
                  'gitFacingTableBytes': sum(p.stat().st_size for p in files),
                  'largest': [pin(p) for p in sorted(files, key=lambda p:p.stat().st_size, reverse=True)[:6]]}, indent=2))
