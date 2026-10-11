"""Source-only applicability of all original reliability cases; no runtime route.

The 26 ordinary cases require missing exact per-Workspace physical observations.
The two early integrity cases bypass that gate but require a creation-time
container profile absent from the public SDK. Unmet fixture/fault/600s/cleanup
obligations remain in the exact original case metadata. Native partial proofs
and the retained controller prototype do not qualify complete cases.
"""
import hashlib
import json
from pathlib import Path

from . import identity, project, receipts

FAMILY = 'workspace_reliability'
POLICY_SOURCE_SHA256 = 'f45e761b8d97e48975769341dc70bda0786539e7faf70cbe1b2a43a41be8c6d9'
# Pin every complete reviewed case, including exact reasons/needs, original
# scopes/counts/profile/limits and source/product evidence. No caller-supplied
# missing-harness reason or changed classification can suppress an obligation.
POLICY_SHA256 = {
    'workspace-invalid-sdk-edit-compact-v2-proof': '0ca885ad601d3628a756762ac394dacb684c207f43b533470438a3271ed4a225',
    'workspace-invalid-namespace-compact-v2-proof': '1c5c18cf1456dbfacb66f2b5ba5c458b4bd67d4a112f6c86ad84245071620f7c',
    'workspace-lease-lifecycle-compact-v2-proof': 'ee64a7e70f2bde22a2569a6465bbb3a8a2b9b79eb24ebff25d85ad59db4e0f65',
    'workspace-open-writer-busy-compact-v2-proof': 'bae032de3e8215468d6196ddf6c360ade3d23cf85b859677b1b4aa7cd75100dd',
    'workspace-live-execution-busy-compact-v2-proof': 'f1c2544f3db1dcea5c148361af055f22490005601ecc2d471539f9bff4054807',
    'workspace-candidate-failure-retry-compact-v2-proof': 'c839777c899a3dbcdbd935483406702bfb818d79821f7eb87603f4db690023c2',
    'workspace-admission-batch-failure-retry-compact-v2-proof': '864d916a599415670fe4983c2c714a87dc931524ea5171502da84ffb2b5cc029',
    'workspace-final-publication-failure-retry-compact-v2-proof': 'c9423c047cbcee6a69719875db462ce169962bdc6b1c3056183c01b033d0e918',
    'workspace-published-presentation-failure-smoke-v3-proof': '3aa0190cea84e673bfacce79b3d80183fb4f0588b574e36ebb41b6027f9ba49d',
    'workspace-dirty-end-discard-compact-v2-proof': 'a92eee3817eb8df5d36394246de37d71f780a0201e08fa655ffd08845a66c948',
    'workspace-dirty-net-zero-compact-v2-proof': '1217015203136075f32f0194a629f2cf6f71d5e49a4ad10252a0ef59e74e181b',
    'workspace-short-spool-write-compact-v2-proof': '907029c16e81ac942d1750fecf37056d95fff31561bbc1b6c106349289f8d8e0',
    'workspace-deferred-nospace-compact-v2-proof': 'dd2784a3298933593478f6c255e38d19416bf77333f5755290197f180d529ae8',
    'workspace-workload-cancel-compact-v2-proof': '4e490d4963c2755fe4b8634c05ff4d74e6ec4c2e50e73225d5fd6b2394c701a9',
    'workspace-dirty-runtime-disconnect-compact-v2-proof': '7df4b85adcdca4f92799eaf6544e6d91dc6a57e5faf37f0d471259a1a2dcc4e9',
    'workspace-corrupt-descendant-compact-v2-proof': 'c213f28b771b575eab5864412fa636425ab827a378ed49db1f683e001faad4b6',
    'workspace-missing-descendant-compact-v2-proof': 'e520b2a58da3d1eae27420cc66d3a9ff61faa4a5093b5b7ec10bd3274925a0e0',
    'workspace-parallel-read-write-compact-v2-proof': 'd7c3e1924d689cf6268a8637143e7a7a0fd3c6b3e1ef5f6bb6b0045a831efcac',
    'workspace-shared-path-contention-compact-v2-proof': '34203b414b023b023c63ae08c5002ca35c738f69ea78ba69130bd31d28f982d9',
    'workspace-hardlink-alias-compact-v2-proof': '07d3308a1ed6312ac0fc336dec5ce2fe8fc53f440b0def97cb92f3567082958f',
    'workspace-symlink-semantics-compact-v2-proof': 'd6fdc3541f7a5fc5f9370831460564772a917ab85a7602cb3672598ef23296cd',
    'workspace-open-rename-unlink-compact-v2-proof': '51940a5d64539d55010aab9f5e98c25495c6d4333c32278bfcafbc13e430e78f',
    'workspace-metadata-chmod-compact-v2-proof': '0b9490293a6260208bf0bd5133130873995ce195947c03b22618f0f503bd74d6',
    'workspace-metadata-mtime-compact-v2-proof': 'f8a10ff8facd06535e1426f704d2a5987fe7ddd91dbf3dd5bbc364b201f2b946',
    'workspace-metadata-xattr-compact-v2-proof': '49552158b03c9aeced6126c6272b42ed725aee95f120411d302f7bdfb5030d7a',
    'workspace-exec-500-compact-v2-proof': '3e1088b4a70ae14cc47e5e02b0185bad14a547def38eb16407bf3865745f7983',
    'workspace-repeat-publication-compact-v2-proof': '2f5f1dc0fc2a7b1dd77a2ffa13c3b04c25e63255b39db7e6aa7a32af30421e03',
    'workspace-sustained-600s-compact-v2-proof': '6671d3fe84e662447a9a2cf68d6fcd4e562a1961894d72d2f9b91b0eed13c2a0',
}


def validate_case(case):
    """Pure exact policy admission, before any applicability skip or side effect."""
    if not isinstance(case, dict) or type(case.get('id')) is not str:
        raise ValueError('complete reviewed original reliability case required')
    try:
        body = json.dumps(case, sort_keys=True, separators=(',', ':'), ensure_ascii=True).encode()
    except (TypeError, ValueError, UnicodeError) as error:
        raise ValueError('canonical original reliability case required') from error
    if hashlib.sha256(body).hexdigest() != POLICY_SHA256.get(case['id']):
        raise ValueError('original reliability case/policy/source evidence differs from reviewed metadata')
    return {'case': case['id'], 'classification': 'not-applicable', 'reason': case['not_applicable_reason'],
            'needs': case['needs'], 'policy_sha256': POLICY_SHA256[case['id']],
            'scope': 'source applicability only; no runtime proof or performance claim'}


def admit_sources(case):
    """Check actual frozen/public source and exact current product, not a runtime."""
    policy = validate_case(case)
    current = identity.git(identity.ROOT, 'rev-parse', 'HEAD:core/crates')
    if current != case['applicability']['reviewed_product_tree']:
        raise ValueError('reviewed reliability product source tree changed; applicability needs new review')
    if identity.git(identity.ROOT, 'status', '--porcelain=v1', '--', 'core/crates'):
        raise ValueError('current product source differs from its reviewed clean tree')
    seals = {**case['port_review']['files'], **case['applicability']['current_public_source_hashes']}
    for relative, wanted in seals.items():
        try:
            actual = identity.sha256(identity.ROOT / relative)
        except OSError as error:
            raise ValueError('required reliability applicability source unavailable: ' + relative) from error
        if actual != wanted:
            raise ValueError('original reliability applicability source changed: ' + relative)
    return {'status': 'PASS', 'runtime_proof_status': 'NOT_APPLICABLE', 'policy': policy,
            'product_tree': current, 'files': seals,
            'scope': 'exact source applicability only; no case operation, native proof, resource observation or full-case PASS'}


def prepare(case, folder, build_folder=None):
    """Explicitly refuse every original case before folder/build/resource work."""
    admitted = validate_case(case)
    raise ValueError('reliability not applicable: ' + admitted['reason'] + '; needs: ' + admitted['needs'])


def one_case(case, prepared_folder, build_folder, output):
    """No setup/sample/attempt is manufactured for source-inapplicable cases."""
    admitted = validate_case(case)
    raise ValueError('reliability not applicable: ' + admitted['reason'] + '; needs: ' + admitted['needs'])


def parity(family, prepared_parent, output, build_folder=None):
    """All28 source checks; fixture/native/runtime parity is explicitly NOT_RUN.

    Prepared inputs and the optional build argument are unused. No lost source
    pin or malformed case becomes an NA mask. Every per-case source failure is
    retained in append-only aggregate evidence before raising ParityFailure.
    """
    if (not isinstance(family, dict) or family.get('family') != FAMILY
            or [case.get('id') for case in family.get('cases', [])] != list(POLICY_SHA256)):
        raise ValueError('all28 ordered original reliability selections required')
    output = Path(output).resolve(); output.mkdir(parents=True, exist_ok=False)
    result = {'schema': 'fs-bench-pro-reliability-source-parity-v1', 'family': FAMILY,
        'status': 'PASS', 'mode': 'source-applicability-only', 'scope': '26 missing exact per-Workspace physical observations; two missing creation-time SDK container profiles; no whole-case reused proof',
        'sample_count': 0, 'samples': 0, 'verification_attempt_count': 0, 'proof_attempts': 0,
        'runtime_parity': 'NOT_RUN', 'cases': []}
    for case in family['cases']:
        row = {'case': case['id'], 'runtime_parity': 'NOT_RUN', 'sample_count': 0,
               'verification_attempt_count': 0}
        try:
            row['source_applicability'] = admit_sources(case)
            row.update(status='NOT_APPLICABLE', applicability_status='PASS',
                       reason=case['not_applicable_reason'], needs=case['needs'])
        except Exception as error:
            row.update(status='FAIL', applicability_status='FAIL', reason=str(error), errorType=type(error).__name__)
            result['status'] = 'FAIL'
        result['cases'].append(row)
    receipts.write_new(output / 'parity.json', result); receipts.manifest(output)
    if result['status'] != 'PASS':
        raise project.ParityFailure(result, output)
    return result
