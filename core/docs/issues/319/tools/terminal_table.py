"""Phase 15: one row per terminal receipt, derived from the receipts and owning CSVs.

Reads only; never replaces a receipt or an owning report. A row is written as PASS
only where its own receipt says so. Timings are not compared.
"""
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path.cwd()
TAG = 'p319t15'
COMMIT = 'fc45a1bc4'
RESULTS = ROOT / 'benchmark-results/fs-bench-pro'
OWNING = ROOT / 'core/benchmark/fs-bench-pro/baselines/core' / ('2026-10-12-' + COMMIT)
DOC = ROOT / 'core/docs/issues/319'
FIELDS = ['family', 'case', 'report_status', 'functional_status', 'proof_status', 'cleanup', 'custody',
          'source_commit', 'product_tree', 'daemon_sha256', 'receipt_sha256', 'requests', 'owner_jobs',
          'statements', 'store_logical_bytes', 'store_allocated_bytes', 'overlay_logical_bytes',
          'overlay_allocated_bytes']


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def folder(family):
    return next(RESULTS.glob('*-issue318-' + TAG + '-run-' + family))


def main():
    build = json.loads(next(RESULTS.glob('*-issue318-' + TAG + '-build/build.json')).read_text())
    rows, families = [], []
    for performance in sorted(OWNING.glob('*/performance.csv')):
        family = performance.parent.name
        proofs = {row['case']: row for row in csv.DictReader(performance.with_name('verification.csv').open())}
        these = []
        for row in csv.DictReader(performance.open()):
            path = folder(family) / row['case'] / 'receipt.json'
            receipt = json.loads(path.read_text())
            assert receipt['source_commit'] == row['source_commit'] == proofs[row['case']]['source_commit']
            assert receipt['proof_status'] == proofs[row['case']]['proof_status']
            these.append({'family': family, 'case': row['case'], 'report_status': row['status'],
                          'functional_status': receipt.get('functional_status'),
                          'proof_status': receipt['proof_status'], 'cleanup': receipt.get('cleanup'),
                          'custody': receipt.get('custody'), 'source_commit': receipt['source_commit'],
                          'product_tree': receipt.get('product_tree'),
                          'daemon_sha256': receipt.get('daemon_sha256'), 'receipt_sha256': digest(path),
                          **{key: row[key] for key in FIELDS[11:]}})
        rows += these
        families.append({'family': family, 'cases': len(these),
                         'functional_pass': sum(r['functional_status'] == 'PASS' for r in these),
                         'proof_pass': sum(r['proof_status'] == 'PASS' for r in these),
                         'both_pass': sum(r['functional_status'] == 'PASS' and r['proof_status'] == 'PASS'
                                          for r in these),
                         'report_statuses': dict(Counter(r['report_status'] for r in these))})
    cells = []
    for index in range(1, 13):
        path = folder('cells') / f'C{index:02}' / 'receipt.json'
        receipt = json.loads(path.read_text())
        cells.append({'case': receipt['case'], 'status': receipt['status'], 'proof_status': receipt['proof_status'],
                      'count_reproduction': receipt['count_reproduction'], 'counts': receipt['counts'],
                      'cleanup': receipt.get('cleanup'), 'custody': receipt.get('custody'),
                      'source_commit': receipt['source_commit'], 'receipt_sha256': digest(path)})
    payload = {
        'schema': 'issue319-terminal-results-v1', 'tag': TAG,
        'source_commits': sorted({r['source_commit'] for r in rows}),
        'product_trees': sorted({str(r['product_tree']) for r in rows}),
        'image': build.get('image'), 'build_sha256': digest(next(RESULTS.glob('*-issue318-' + TAG + '-build/build.json'))),
        'rule': 'One sample per case at one source identity; functional and proof columns are each receipt\'s own; '
                'report_status is the owning performance row (INELIGIBLE timing or N/A for verification-only); '
                'no timing comparison; Durable NOT_RUN — disabled by owner until explicit reauthorization',
        'not_run': {'repository_history': 'NOT_RUN — set aside by owner; 3 cases'},
        'totals': {'cases': len(rows),
                   'both_pass': sum(f['both_pass'] for f in families),
                   'not_both_pass': [r['family'] + ':' + r['case'] for r in rows
                                     if r['functional_status'] != 'PASS' or r['proof_status'] != 'PASS'],
                   'report_statuses': dict(Counter(r['report_status'] for r in rows)),
                   'cleanup': dict(Counter(str(r['cleanup']) for r in rows)),
                   'custody': dict(Counter(str(r['custody']) for r in rows))},
        'families': families, 'cells': cells}
    text = json.dumps(payload, indent=2, sort_keys=True) + '\n'
    assert str(Path.home()) not in text and str(ROOT) not in text
    (DOC / 'checks/phase15-terminal.json').write_text(text)
    with (DOC / 'TERMINAL-RESULTS.csv').open('w', newline='') as stream:
        writer = csv.DictWriter(stream, FIELDS, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps(payload['totals']))
    for family in families:
        print(family['family'], family['cases'], family['both_pass'], family['report_statuses'])
    for cell in cells:
        print(cell['case'], cell['status'], cell['proof_status'], json.dumps(cell['count_reproduction'])[:160])


if __name__ == '__main__':
    main()
