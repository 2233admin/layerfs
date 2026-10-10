"""Exact source applicability and refusal guards; no SDK/native/Docker operation."""
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

BENCH = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BENCH))
from engine import reliability

DECLARATIONS = BENCH / 'families/workspace_reliability/family.json'


def family():
    return json.loads(DECLARATIONS.read_text())


class ReliabilityApplicability(unittest.TestCase):
    def test_all28_complete_original_policies_are_source_nas(self):
        rows = family()['cases']
        self.assertEqual(len(rows), 28)
        self.assertEqual(len({row['id'] for row in rows}), 28)
        for row in rows:
            admitted = reliability.validate_case(row)
            self.assertEqual(admitted['classification'], 'not-applicable')
            self.assertTrue(row['proof_only']); self.assertEqual(row['samples'], 0)
            self.assertEqual(row['performance_mode'], 'verification-only')
        self.assertEqual([step['index'] for step in rows[15]['steps']], [0, 1, 2, 3])
        self.assertEqual([step['index'] for step in rows[16]['steps']], [0, 1, 2, 3])
        self.assertEqual(rows[27]['reliability_proof']['sustained_declarations']['minimum_active_ms'], 600000)

    def test_reason_source_profile_and_original_scope_cannot_be_rewritten(self):
        for index in (0, 15, 16, 27):
            original = family()['cases'][index]
            changes = [lambda row: row.update(status='ported'),
                       lambda row: row.update(not_applicable_reason='missing harness'),
                       lambda row: row['applicability'].update(reviewed_product_tree='0'*40),
                       lambda row: row.update(samples=1),
                       lambda row: row['original_reliability_guards'].update(cleanup_reserve_ms=0),
                       lambda row: row['original_reliability_guards']['container_profile'].update(pids_limit=0),
                       lambda row: row['port_review']['files'].update({'benchmark/fs-bench-pro/src/workspace_reliability.rs':'0'*64})]
            if index in (15, 16):
                changes.append(lambda row: row['applicability']['creation_time_sandbox_profile'].update(post_start_update_is_equivalent=True))
                changes.append(lambda row: row['reliability_integrity']['accepted_detection'].update(native_read_returned_bytes=1))
            for change in changes:
                bad = copy.deepcopy(original); change(bad)
                with self.subTest(index=index,change=change), self.assertRaises(ValueError):
                    reliability.validate_case(bad)
        for invalid in (None, {}, {'id':[]}, {'id':'unknown'}):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError): reliability.validate_case(invalid)

    def test_prepare_and_case_refuse_every_id_before_build_folder_or_operation(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(reliability.identity, 'load_build', side_effect=AssertionError('build must not be admitted')):
            for row in family()['cases']:
                output = Path(temporary) / row['id']
                with self.subTest(case=row['id']), self.assertRaisesRegex(ValueError, 'not applicable:'):
                    reliability.prepare(row, output, object())
                self.assertFalse(output.exists())
                with self.subTest(case=row['id']), self.assertRaisesRegex(ValueError, 'not applicable:'):
                    reliability.one_case(row, object(), object(), output)
                self.assertFalse(output.exists())

    def test_source_byte_product_and_dirty_tree_changes_are_not_masked_as_na(self):
        row = family()['cases'][15]
        admitted = reliability.admit_sources(row)
        self.assertEqual(admitted['status'], 'PASS')
        self.assertEqual(admitted['runtime_proof_status'], 'NOT_APPLICABLE')
        with patch.object(reliability.identity, 'sha256', return_value='0'*64), self.assertRaises(ValueError):
            reliability.admit_sources(row)
        with patch.object(reliability.identity, 'git', return_value='0'*40), self.assertRaises(ValueError):
            reliability.admit_sources(row)
        def dirty(root,*args):
            return row['applicability']['reviewed_product_tree'] if args[0]=='rev-parse' else ' M core/crates/changed.rs'
        with patch.object(reliability.identity, 'git', side_effect=dirty), self.assertRaises(ValueError):
            reliability.admit_sources(row)

    def test_parity_reports_all28_source_checks_and_zero_actual_proofs(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(reliability.identity, 'load_build', side_effect=AssertionError('build unused')):
            out = Path(temporary) / 'parity'
            result = reliability.parity(family(), object(), out, object())
            self.assertEqual(result['status'], 'PASS')
            self.assertEqual(result['sample_count'], 0)
            self.assertEqual(result['verification_attempt_count'], 0)
            self.assertEqual(result['runtime_parity'], 'NOT_RUN')
            self.assertEqual(len(result['cases']), 28)
            self.assertTrue(all(row['status']=='NOT_APPLICABLE' for row in result['cases']))
            self.assertTrue(all(row['runtime_parity']=='NOT_RUN' for row in result['cases']))
            self.assertEqual(json.loads((out/'parity.json').read_text()), result)
            reliability.receipts.verify_manifest(out)
            before = (out/'parity.json').read_bytes()
            with self.assertRaises(FileExistsError): reliability.parity(family(), object(), out)
            self.assertEqual((out/'parity.json').read_bytes(), before)

    def test_failed_source_parity_retains_every_selection_and_exact_failure(self):
        declared=family(); row=declared['cases'][16]
        path='core/crates/layerfs-api/sdk/src/sandbox/lifecycle.rs'
        original=reliability.identity.sha256
        def changed(filename):
            return '0'*64 if str(filename).endswith(path) else original(filename)
        with tempfile.TemporaryDirectory() as temporary, patch.object(reliability.identity, 'sha256', side_effect=changed):
            out=Path(temporary)/'parity'
            with self.assertRaises(reliability.project.ParityFailure) as raised:
                reliability.parity(declared, object(), out)
            result=raised.exception.result
            self.assertEqual(result['status'],'FAIL');self.assertEqual(len(result['cases']),28)
            self.assertEqual(result['verification_attempt_count'],0)
            failed=[value for value in result['cases'] if value['status']=='FAIL']
            self.assertEqual({value['case'] for value in failed}, {declared['cases'][15]['id'],row['id']})
            self.assertTrue(all(path in value['reason'] for value in failed))
            reliability.receipts.verify_manifest(out)


if __name__ == '__main__':
    unittest.main()
