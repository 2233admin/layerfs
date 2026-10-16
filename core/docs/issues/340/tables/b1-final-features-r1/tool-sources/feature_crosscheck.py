"""Cross-check final B1 feature references against retained final acceptance streams."""
import base64
import gzip
import importlib.util
import json
from collections import Counter
from pathlib import Path
from prepare import RUN, OUT, pin, save

LEAD = RUN / 'agents/lead'
MATRIX = LEAD / 'FEATURE-MATRIX.json'
ANNOTATION = RUN / 'report-annotations/acceptance-b1-r3-root-r2.json'
PARSER = LEAD / 'scripts/tap-leaves.py'
MODE_BY_STEP = {'A10': 'smoke', 'A11': 'restart', 'A12': 'browser',
                'A13': 'audit', 'A14': 'remount', 'A15': 'closed'}
PACKAGE_BY_STEP = {'A04': 'shared', 'A05': 'server', 'A06': 'web', 'A07': 'cli'}
sources = {}


def register(path):
    path = path.resolve()
    sources[str(path)] = pin(path)
    return path


def load(path):
    register(path)
    return json.loads(path.read_text())


def json_values(text):
    decoder = json.JSONDecoder()
    values, offset = [], 0
    while offset < len(text):
        while offset < len(text) and text[offset].isspace():
            offset += 1
        if offset == len(text):
            break
        value, offset = decoder.raw_decode(text, offset)
        values.append(value)
    return values


register(Path(__file__))
register(PARSER)
matrix, annotation = load(MATRIX), load(ANNOTATION)
spec = importlib.util.spec_from_file_location('b1_retained_tap_parser', PARSER)
tap = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tap)
actual_leaves, actual_modes, steps = [], {}, {}
for step in annotation['steps']:
    identity, sequence = step['id'], step['sequence']
    receipt_path = LEAD / f'out/calls/lead-{sequence:04}.json'
    receipt = load(receipt_path)
    wrapper = json.loads(receipt['result']['stdout'])
    assert receipt['result']['exitCode'] == 0 and receipt['result']['truncated'] is False
    assert wrapper['exitCode'] == 0 and wrapper['signal'] is None and wrapper['error'] is None
    decoded = {}
    for stream_name in ('stdout', 'stderr'):
        stream_path = register(Path(step['streams'][stream_name]['path']))
        stream_bytes = gzip.decompress(base64.b64decode(wrapper[stream_name]['gzipBase64'], validate=True))
        assert stream_path.read_bytes() == stream_bytes
        actual_pin = sources[str(stream_path)]
        assert actual_pin['bytes'] == wrapper[stream_name]['bytes'] == step['streams'][stream_name]['bytes']
        assert actual_pin['sha256'] == wrapper[stream_name]['sha256'] == step['streams'][stream_name]['sha256']
        decoded[stream_name] = stream_bytes.decode()
    if identity in PACKAGE_BY_STEP:
        parsed = tap.parse(decoded['stdout'])
        assert list(parsed['byPackage']) == [PACKAGE_BY_STEP[identity]]
        assert all(row['ok'] is True and row['directive'] is None for row in parsed['leaves'])
        actual_leaves.extend(parsed['leaves'])
    if identity in MODE_BY_STEP:
        values = json_values(decoded['stdout'])
        mode = MODE_BY_STEP[identity]
        final = values[-1]
        assert final['mode'] == mode and final['ok'] is True and final['fail'] == 0
        assert final['pass'] == len(final['checks']) and all(row['ok'] is True for row in final['checks'])
        assert final['checks'] == annotation['modes'][mode]['checks']
        actual_modes[mode] = {'checks': final['checks'], 'pass': final['pass'], 'fail': final['fail'],
                              'source': str(Path(step['streams']['stdout']['path']).resolve())}
    steps[identity] = {'receipt': receipt, 'sequence': sequence, 'step': step,
                       'relativeReceipt': f'out/calls/lead-{sequence:04}.json'}

leaf_ids = {(row['package'], tuple(row['hierarchy'])) for row in actual_leaves}
assert len(actual_leaves) == len(leaf_ids) == 716
assert leaf_ids == {(row['package'], tuple(row['hierarchy'])) for row in annotation['leaves']}
package_steps = {package: step for step, package in PACKAGE_BY_STEP.items()}
features, reference_rows, acceptance_rows = [], [], []
for row in matrix['rows']:
    assert row['finalMain'] == matrix['finalMain'] == annotation['mainLayer']['id']
    assert row['finalAcceptanceBranch'] == matrix['finalAcceptance'] == annotation['branch']
    verified_leaves = []
    for reference in row['passingLeafReferences']:
        package = reference['package']
        identity = (package, tuple(reference['hierarchy']))
        step = steps[package_steps[package]]
        assert identity in leaf_ids
        assert reference['execReceipt'] == step['relativeReceipt']
        assert reference['traceStep'] == step['receipt']['traceStep']
        verified_leaves.append({'package': package, 'hierarchy': reference['hierarchy'],
                                'execReceipt': reference['execReceipt'], 'traceStep': reference['traceStep'],
                                'verified': True})
        reference_rows.append({'feature_id': row['id'], 'package': package,
                               'hierarchy': reference['hierarchy'], 'exec_receipt': reference['execReceipt'],
                               'trace_step': reference['traceStep'], 'passed_exact_final_leaf': True})
    verified_acceptance = []
    for reference in row['acceptanceEvidence']:
        identity = reference['id']
        step = steps[identity]
        assert reference['receipt'] == step['relativeReceipt']
        assert reference['traceStep'] == step['receipt']['traceStep']
        assert reference['command'] == step['step']['command']
        assert reference['exitCode'] == step['receipt']['result']['exitCode'] == 0
        expected_stream = step['step']['streams']['stdout']
        assert reference['stdout']['sha256'] == expected_stream['sha256']
        assert reference['stdout']['bytes'] == expected_stream['bytes']
        assert Path(reference['stdout']['file']).resolve() == Path(expected_stream['path']).resolve()
        mode = MODE_BY_STEP.get(identity)
        checks = actual_modes[mode]['checks'] if mode else None
        value = {'id': identity, 'receipt': reference['receipt'], 'traceStep': reference['traceStep'],
                 'command': reference['command'], 'stdoutSha256': reference['stdout']['sha256'],
                 'mode': mode, 'modeChecks': checks, 'verified': True}
        verified_acceptance.append(value)
        acceptance_rows.append({'feature_id': row['id'], 'acceptance_id': identity, 'mode': mode,
                                'exec_receipt': reference['receipt'], 'trace_step': reference['traceStep'],
                                'stdout_sha256': reference['stdout']['sha256'], 'command': reference['command'],
                                'mode_checks': checks, 'passed_final_acceptance_reference': True})
    resource = row.get('resourceEvidence')
    if resource:
        register(LEAD / resource)
    assert verified_leaves or verified_acceptance or resource
    features.append({'feature_id': row['id'], 'owner': row['owner'], 'feature': row['feature'],
                     'state': row['state'], 'final_qualification': row['finalQualification'],
                     'final_main': row['finalMain'], 'final_acceptance_branch': row['finalAcceptanceBranch'],
                     'verified_final_leaf_count': len(verified_leaves), 'final_leaf_references': verified_leaves,
                     'verified_final_acceptance_reference_count': len(verified_acceptance),
                     'final_acceptance_references': verified_acceptance, 'resource_evidence': resource,
                     'historical_evidence': row['evidence'], 'historical_prior_state': row.get('priorState'),
                     'historical_prior_qualification': row.get('priorFinalQualification'),
                     'historical_original_failure': row.get('originalFailure'),
                     'current_scoped_evidence': row.get('currentScopedEvidence'),
                     'reference_contract': 'Exact final package+hierarchy and acceptance stream/check identities verified; historical evidence is retained separately, never relabeled as final',
                     'crosscheck': 'PASS'})
assert len(features) == len({row['feature_id'] for row in features}) == 109
for source in sources.values():
    assert pin(Path(source['path'])) == source
result = {'classification': 'Diagnostic read-only reference cross-check, no application/test/SDK execution',
          'status': 'PASS', 'featureCount': len(features), 'passingFinalPackageLeaves': len(actual_leaves),
          'packageCounts': dict(Counter(row['package'] for row in actual_leaves)),
          'modeChecks': actual_modes, 'exactFinalLeafReferenceCount': len(reference_rows),
          'exactFinalAcceptanceReferenceCount': len(acceptance_rows),
          'features': features, 'leafReferenceRows': reference_rows,
          'acceptanceReferenceRows': acceptance_rows, 'sources': sorted(sources.values(), key=lambda row: row['path'])}
save('final-feature-reference-crosscheck-r1.json', result)
print(json.dumps({key: result[key] for key in ('status', 'featureCount', 'passingFinalPackageLeaves',
                                              'packageCounts', 'exactFinalLeafReferenceCount',
                                              'exactFinalAcceptanceReferenceCount')}))
