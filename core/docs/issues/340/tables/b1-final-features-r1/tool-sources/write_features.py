"""Write source-pinned B1 feature tables through the existing Evidence CSV writer."""
import importlib.util
import json
import sys
from pathlib import Path
from prepare import REPO, OUT, pin

analysis = REPO / 'core/target/issue340/analysis'
sys.path.insert(0, str(analysis))
from evidence import Evidence

source_path = OUT / 'final-feature-reference-crosscheck-r1.json'
data = json.loads(source_path.read_text())
assert data['status'] == 'PASS' and data['featureCount'] == 109
sources = {source['path']: source for source in data['sources']}
for source in sources.values():
    assert pin(Path(source['path'])) == source
for path in [source_path, Path(__file__), analysis / 'evidence.py']:
    source = pin(path)
    sources[source['path']] = source
output = REPO / 'core/docs/issues/340/tables/b1-final-features-r1'
output.mkdir(exist_ok=False)
tables = {
    'b1-features.csv': (data['features'],
        'feature_id owner feature state final_qualification final_main final_acceptance_branch '
        'verified_final_leaf_count final_leaf_references verified_final_acceptance_reference_count '
        'final_acceptance_references resource_evidence historical_evidence historical_prior_state '
        'historical_prior_qualification historical_original_failure current_scoped_evidence '
        'reference_contract crosscheck'),
    'b1-feature-leaf-references.csv': (data['leafReferenceRows'],
        'feature_id package hierarchy exec_receipt trace_step passed_exact_final_leaf'),
    'b1-feature-acceptance-references.csv': (data['acceptanceReferenceRows'],
        'feature_id acceptance_id mode exec_receipt trace_step stdout_sha256 command '
        'mode_checks passed_final_acceptance_reference'),
}
source_list = sorted(sources.values(), key=lambda source: source['path'])
contract = {
    'classification': 'Diagnostic read-only final feature reference derivation; tracing enabled, unknown OS cache state; no test/app/SDK replay',
    'sources': source_list,
    'method': 'Existing Evidence.write serializes verified retained rows; exact final package+hierarchy and raw acceptance mode checks are source-pinned; historical references remain separate',
    'missingValues': 'CSV unavailable; JSON null; never substituted zero',
}
for filename, (rows, columns) in tables.items():
    path = Evidence.write(None, output, filename, rows, columns.split())
    (output / (path.name + '.sources.json')).write_text(json.dumps({'table': filename, **contract}, indent=2) + '\n')
summary = {'classification': contract['classification'], 'status': 'PASS',
           'features': len(data['features']), 'uniquePassingFinalPackageLeaves': data['passingFinalPackageLeaves'],
           'exactFinalLeafReferences': len(data['leafReferenceRows']),
           'exactFinalAcceptanceReferences': len(data['acceptanceReferenceRows']),
           'finalModeChecks': {name: value['pass'] for name, value in data['modeChecks'].items()},
           'tables': {name: len(rows) for name, (rows, columns) in tables.items()}}
(output / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
for path in [Path(__file__), analysis / 'evidence.py', Path(__file__).parent / 'feature_crosscheck.py']:
    target = output / 'tool-sources' / path.name
    target.parent.mkdir(exist_ok=True)
    target.write_bytes(path.read_bytes())
for source in source_list:
    assert pin(Path(source['path'])) == source
outputs = {str(path.relative_to(output)): pin(path) for path in sorted(output.rglob('*')) if path.is_file()}
(output / 'manifest.json').write_text(json.dumps({'sources': source_list, 'outputs': outputs}, indent=2) + '\n')
print(json.dumps({'folder': str(output), **summary}))
