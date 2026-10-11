"""D-3 admission is confined to the six named large-check failures."""
import copy
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

BENCH = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BENCH))
from engine import workspace

LARGE = {
    'dedup_cdc_locality': ['dedup-cdc-scattered-500'],
    'dedup_workspace_reuse': ['dedup-workspace-exact-500', 'dedup-workspace-local-500',
                              'dedup-workspace-unique-500'],
    'store_footprint': ['store-footprint-unique-100000', 'store-footprint-metadata-cardinality-100000'],
}


def cases(family):
    return json.loads((BENCH / 'families' / family / 'family.json').read_text())['cases']


class LargeChecks(unittest.TestCase):
    def test_six_large_allowances_are_validated_together_with_deadlines(self):
        for family, selected in LARGE.items():
            for case in cases(family):
                with self.subTest(case=case['id']):
                    trial = copy.deepcopy(case)
                    if case['id'] in selected:
                        trial['budget'].update(verifier_ms=75000, verification_hard_watchdog_ms=89000)
                        expected = {'work':169, 'cleanup':173, 'publication':187}
                    else:
                        expected = {'work':139, 'cleanup':143, 'publication':157}
                    with patch.object(workspace.time, 'monotonic', return_value=100):
                        self.assertEqual(workspace.import_proof_deadlines(trial, 2_000_000_000), expected)
                    trial['budget']['verifier_ms'] += 1
                    with self.assertRaises(ValueError):
                        workspace.import_proof_deadlines(trial)

    def test_small_checks_cannot_acquire_the_large_allowance(self):
        case = copy.deepcopy(cases('dedup_workspace_reuse')[0])
        case['budget'].update(verifier_ms=75000, verification_hard_watchdog_ms=89000)
        with self.assertRaises(ValueError):
            workspace.import_proof_deadlines(case)


if __name__ == '__main__':
    unittest.main()
