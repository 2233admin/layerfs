#!/usr/bin/env python3
"""Original reliability metadata admission and no-fallback shell contracts."""
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[5]
FAMILY = ROOT / 'core/benchmark/fs-bench-pro/families/workspace_reliability'
SOURCE = ROOT / 'benchmark/fs-bench-pro/families/workspace_reliability/mod.rs'
CORE_BASE = 'core/benchmark/fs-bench-pro/families/workspace_reliability/family.json'
BASE_COMMIT = '359c3c7d0cf84f4072a4af1ec8bd37497a75b722'
COMMIT = 'd296981ace76fe751bebf00dee52818fe18a3eef'
TAG = 'ae3310fada4a1fe35cb99ab02270b7538a0d03f7'
INTEGRITY = {'workspace-corrupt-descendant-compact-v2-proof',
             'workspace-missing-descendant-compact-v2-proof'}


def baseline():
    return json.loads(subprocess.check_output(['git', 'show', BASE_COMMIT+':'+CORE_BASE], cwd=ROOT))


def admit(document):
    """Test-only admission mirrors the declared frozen contract, not a runtime oracle."""
    prior = baseline()
    assert document['family'] == 'workspace_reliability'
    assert document['engine'] == 'workspace'
    assert len(document['cases']) == 28
    assert [r['id'] for r in document['cases']] == [r['id'] for r in prior['cases']]
    for row, old in zip(document['cases'], prior['cases']):
        ident = row['id']
        assert row['v016_case'] == ident
        assert row['registry'] == old['registry'] and row['reference'] == old['reference']
        assert row['proof_only'] is True and row['performance_mode'] == 'verification-only'
        assert row['samples'] == 0 and row['original_ordinary_guards'] is True
        assert row['budget'] == {'command_ms': None, 'verifier_ms': 45000,
                                 'verification_hard_watchdog_ms': 59000}
        guard = row['original_reliability_guards']
        assert (guard['verification_work_ms'], guard['cleanup_reserve_ms'],
                guard['publication_guard_seconds'], guard['owner_test_invocation_ceiling_ms']) == (45000, 4000, 0.25, 120000)
        assert guard['container_profile'] == {'cpus': 2, 'memory_bytes': 2147483648,
                                             'memory_swap_bytes': 2147483648, 'pids_limit': 256}
        assert guard['named_spool_limit_bytes'] == 2147483648
        proof = row['reliability_proof']
        physical = proof['physical_state']
        review = row['port_review']
        assert (review['source_commit'], review['source_tag_object']) == (COMMIT, TAG)
        for path, digest in review['files'].items():
            assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest() == digest
        if ident in INTEGRITY:
            assert row['status'] == 'ported'
            assert physical['reachable'] is False
            assert physical['bypass_original_driver_lines'] == [360, 385]
            assert row['applicability']['classification'] == 'expressible'
            integrity = row['reliability_integrity']
            assert integrity['selected_path'] == 'sentinels/f0003.dat'
            assert integrity['selected_mapping_extent'] == 'first'
            assert integrity['commits'] == 0 and integrity['fault_attempts'] == 1
            assert integrity['initial_proof']['complete_original_tree'] is True
            assert integrity['initial_proof']['derive_target_from_authenticated_mapping'] is True
            assert integrity['accepted_detection']['native_read_errno'] == 5
            assert integrity['accepted_detection']['native_read_returned_bytes'] == 0
            assert integrity['accepted_detection']['arbitrary_startup_error_is_pass'] is False
            assert integrity['cleanup']['actual_unmounted'] is True
            assert integrity['cleanup']['zero_new_owned_runtime_files'] is True
            assert integrity['cleanup']['named_spool_files_after_cleanup'] == 0
            assert integrity['cleanup']['known_stop'] is True
            assert [s['index'] for s in row['steps']] == [0, 1, 2, 3]
            assert all(s['commit'] is False for s in row['steps'])
            if 'corrupt-descendant' in ident:
                assert integrity['fault'] == {'kind': 'same-length-canonical-payload-corruption',
                    'supported_raw_target_isolation': True, 'positive_control_canonical_bytes_equal': True,
                    'xor': 1, 'byte': 'last canonical target byte',
                    'preserve_namespace_history_and_unrelated_records': True}
            else:
                assert integrity['fault'] == {'kind': 'missing-selected-payload-locator',
                    'deleted_target_locators': 1, 'audit_fk_and_advisory_references': True,
                    'preserve_namespace_history_and_unrelated_records': True}
        else:
            assert row['status'] == 'not-applicable' and row['steps'] == []
            assert row['applicability']['classification'] == 'not-applicable'
            assert row['not_applicable_reason'] == row['applicability']['reason']
            assert row['not_applicable_reason'] and row['needs']
            assert physical['reachable'] is True
            assert physical['original_call_path'] == ['run:413', 'live:175', 'physical_state:33-82']
            assert physical['required_fields'] == ['physical_spool_allocated_bytes',
                                                  'physical_spool_peak_bytes']
            assert physical['both_fields_must_be_some'] is True
            assert physical['observation_errors_must_equal'] == 0
            assert physical['current_and_peak_limit_bytes'] == 2147483648
            assert physical['replacement_with_sampled_or_logical_counter_allowed'] is False
            assert physical['current_public_scope_available'] is False
            assert proof['original_ordered_obligations'] and proof['original_driver_source']
        if proof['kind'] == 'sustained-600s':
            sustained = proof['sustained_declarations']
            assert sustained == {'workers': 2, 'minimum_active_ms': 600000,
                                  'per_cycle_progress_ms': 30000, 'native_active_watchdog_ms': 900000,
                                  'native_final_watchdog_ms': 600000,
                                  'owner_ceiling_ms': 120000,
                                  'released_optional_status': 'NOT_RUN_OPTIONAL'}


class ReliabilityMetadata(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.document = json.loads((FAMILY/'family.json').read_text())

    def test_exact_full_case_applicability_and_frozen_source_admission(self):
        admit(self.document)

    def test_unavailable_physical_peak_cannot_be_promoted_or_replaced(self):
        admit(self.document)
        for change in [lambda d: d['cases'][0].update(status='ported'),
                       lambda d: d['cases'][0]['reliability_proof']['physical_state'].update(both_fields_must_be_some=False),
                       lambda d: d['cases'][0]['reliability_proof']['physical_state'].update(replacement_with_sampled_or_logical_counter_allowed=True),
                       lambda d: d['cases'][0]['original_reliability_guards'].update(publication_guard_seconds=0)]:
            bad=copy.deepcopy(self.document);change(bad)
            with self.assertRaises(AssertionError): admit(bad)

    def test_integrity_scope_cannot_accept_other_faults_bytes_or_cleanup(self):
        admit(self.document)
        index = next(i for i,r in enumerate(self.document['cases']) if 'corrupt-descendant' in r['id'])
        for field, value in [('selected_path','sentinels/f0002.dat'), ('commits',1)]:
            bad=copy.deepcopy(self.document);bad['cases'][index]['reliability_integrity'][field]=value
            with self.assertRaises(AssertionError):admit(bad)
        for field,value in [('native_read_returned_bytes',1),('arbitrary_startup_error_is_pass',True)]:
            bad=copy.deepcopy(self.document);bad['cases'][index]['reliability_integrity']['accepted_detection'][field]=value
            with self.assertRaises(AssertionError):admit(bad)
        bad=copy.deepcopy(self.document);bad['cases'][index]['reliability_integrity']['cleanup']['actual_unmounted']=False
        with self.assertRaises(AssertionError):admit(bad)

    def test_shell_requires_bound_absolute_mount_and_preserves_native_argv(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary).resolve();mount=root/'mount';mount.mkdir();log=root/'log.json'
            helper=root/'helper';helper.write_text('#!/usr/bin/env python3\nimport json,os,sys\nfrom pathlib import Path\nPath(os.environ["HELPER_LOG"]).write_text(json.dumps({"argv":sys.argv[1:],"cwd":os.getcwd()}))\n')
            helper.chmod(0o755)
            env={**os.environ,'WORKLOAD_HELPER':str(helper),'HELPER_LOG':str(log)}
            for ident in sorted(INTEGRITY):
                for action, expected in [('verify-initial',['workspace-reliability-verify',ident,'initial','0']),
                                         ('read-corrupt',['workspace-reliability-workload',ident,'read-corrupt','0'])]:
                    out=subprocess.run(['/bin/bash',str(FAMILY/'workload.sh'),action,ident],cwd=root,
                                       env={**env,'LAYERFS_WORKSPACE_ROOT':str(mount)},capture_output=True,timeout=3)
                    self.assertEqual(out.returncode,0,out.stderr)
                    self.assertEqual(json.loads(log.read_text()),{'argv':expected,'cwd':str(mount)})
                    log.unlink()
            for env_extra in [{},{'LAYERFS_WORKSPACE_ROOT':'relative'}]:
                out=subprocess.run(['/bin/bash',str(FAMILY/'workload.sh'),'read-corrupt',sorted(INTEGRITY)[0]],
                                   cwd=root,env={**env,**env_extra},capture_output=True,timeout=3)
                self.assertNotEqual(out.returncode,0)
                self.assertFalse(log.exists())
            out=subprocess.run(['/bin/bash',str(FAMILY/'workload.sh'),'apply',sorted(INTEGRITY)[0]],
                               env={**env,'LAYERFS_WORKSPACE_ROOT':str(mount)},capture_output=True,timeout=3)
            self.assertNotEqual(out.returncode,0);self.assertFalse(log.exists())

    def test_all26_na_routes_refuse_before_helper_and_name_exact_reason(self):
        admit(self.document)
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary).resolve();sentinel=root/'called';helper=root/'helper'
            helper.write_text('#!/bin/sh\ntouch "$HELPER_LOG"\n');helper.chmod(0o755)
            env={**os.environ,'WORKLOAD_HELPER':str(helper),'HELPER_LOG':str(sentinel)}
            for row in self.document['cases']:
                if row['id'] in INTEGRITY:continue
                result=subprocess.run(['/bin/bash',str(FAMILY/'workload.sh'),'read-corrupt',row['id']],
                                      cwd=root,env=env,capture_output=True,text=True,timeout=3)
                self.assertEqual(result.returncode,3)
                self.assertEqual(result.stdout,'')
                self.assertIn('case='+row['id'],result.stderr)
                self.assertIn('reason='+row['not_applicable_reason'],result.stderr)
                self.assertIn('needs='+row['needs'],result.stderr)
                self.assertFalse(sentinel.exists())


if __name__ == '__main__':
    unittest.main()
