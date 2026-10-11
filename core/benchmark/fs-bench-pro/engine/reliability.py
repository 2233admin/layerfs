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
    'workspace-invalid-sdk-edit-compact-v2-proof': 'a863e116c61bd459cc9336b1869f65e8c6cea331b3cf1fa7217ed52903e21970',
    'workspace-invalid-namespace-compact-v2-proof': '035bf5311fb30f1746ec9188bb2e10051220e313acb39ee1980d3542da5e6d64',
    'workspace-lease-lifecycle-compact-v2-proof': 'ed1c17f1c3da4c85516258c2fd4e16d37e596989d8e4e9809fb4dcb92d5d4a57',
    'workspace-open-writer-busy-compact-v2-proof': '3cdb84c8576ee09315858b5341b1498cb288654cc34a47f81a43ce4c271b4115',
    'workspace-live-execution-busy-compact-v2-proof': 'da55fbe48ea9e2d11615d466fd078ad6a17b132a4688044e24f76c18e5bb871d',
    'workspace-candidate-failure-retry-compact-v2-proof': 'e33e584be5bc01b5988e0c1876395d6cef4b7d1773a749f3ef318d3911a34e3b',
    'workspace-admission-batch-failure-retry-compact-v2-proof': 'ed9973980c70a72333cbeaef39510302230d201dfa5f8500c5fdba82ad1cb8a3',
    'workspace-final-publication-failure-retry-compact-v2-proof': '746dc2526446a57390d38440dd59f1d6665e16740e3854d07f118433a5ce5a1f',
    'workspace-published-presentation-failure-smoke-v3-proof': '11d1b69b940a529a872fcec34a8992ba1e6c93d30ec5e2a8e1749220f1d63f3e',
    'workspace-dirty-end-discard-compact-v2-proof': 'e479cf73e4ed7e132f8a8167982596c21822b1670b3e31f9bfacc65a2a41ef7b',
    'workspace-dirty-net-zero-compact-v2-proof': 'dbae5e1ebf420122a11036bea2fbe87984f1633d4199a93c81ce0b66d6d7ec6c',
    'workspace-short-spool-write-compact-v2-proof': '79837be1e1e20212d02a65c9948aeda138f903f43e9b1c6478b9e261e6454e5f',
    'workspace-deferred-nospace-compact-v2-proof': '61179e394947cd3e83df3320bc3292a5b4210b6adfb9e2d3f5b2f83fbb731283',
    'workspace-workload-cancel-compact-v2-proof': '446d54b06103d9ab517b9e62788e177cc04e8b5c22579bb419c744352e2c5ec2',
    'workspace-dirty-runtime-disconnect-compact-v2-proof': 'c95246e19e2159e2dc6aea6e589c932a0e19bbaf353d905c0ca1cc4af2b1e4cc',
    'workspace-corrupt-descendant-compact-v2-proof': '50c6a2a4c1ebd00a53238db8879d82a316c45a6f97af0ef03018ea1ba165c567',
    'workspace-missing-descendant-compact-v2-proof': 'dd273e4da69305bc71db2e145d77ccd1940c75618d4fe60e4ad2cce90dc52be0',
    'workspace-parallel-read-write-compact-v2-proof': 'a8a50548c7fcec5459f7283aba72fc01ccec6ae8fe28ddec11918782ef6ae12d',
    'workspace-shared-path-contention-compact-v2-proof': '1841dcafe454a164eb808a91265d3d764a4dd29e3f12cf494abf2d791fee87d2',
    'workspace-hardlink-alias-compact-v2-proof': 'b0643a2eb4d83e065a68f335de35d20e488b979d14d264228c035ce2e1847c2a',
    'workspace-symlink-semantics-compact-v2-proof': 'def505ee6d2d84f574580d4763420b72609ce0afe00d79656e27bf8572e91e7d',
    'workspace-open-rename-unlink-compact-v2-proof': '65ef5936670996efdb609b4e61fc2c79cd0e2eda68f49f4a0ee04b2230a3da37',
    'workspace-metadata-chmod-compact-v2-proof': '4562c59913d57d107034e0859b1068e30ca240c8282c169280202891b543af0a',
    'workspace-metadata-mtime-compact-v2-proof': '736b46ee7e7b1c9a2c64293500f23940cfa30d2389b4cb732ec18a086cf2b800',
    'workspace-metadata-xattr-compact-v2-proof': '608e0a58ce945a51ceda27699327afe7b8e9864815a493725800e3a522129162',
    'workspace-exec-500-compact-v2-proof': '1c5cafc265714990b143aa04a3e2f2de0c18b8cd759b87c1dc55a74e3c91c1e4',
    'workspace-repeat-publication-compact-v2-proof': 'c9777d1026fdf148883cc2729729316431c0e8d7db06ae7ed1409b5a8e16b04c',
    'workspace-sustained-600s-compact-v2-proof': 'cdc1bdef30a4a5f753e0f8d582acfa032f31bf2158cd3e874bd8d5ecba65bcb6',
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
