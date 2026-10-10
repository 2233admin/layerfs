"""Missing evidence and custody never become a successful mounted sample."""
import json
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from engine import cache, receipts, workspace


class WorkspaceEvidence(unittest.TestCase):
    def test_family_clone_failure_has_no_mount_or_completed_sample_credit(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            current = dict(source_commit="source", product_tree="product", files={})
            build = dict(binaries={name: {"sha256": name} for name in ("runtime", "daemon")})
            prepared = dict(fixture={"fixture_sha256": "fixture"}, helpers={"files": {}})
            case = {"id": "payload", "v016_case": "payload", "fixture": {"recipe": "payload"},
                    "budget": {"command_ms": 15000, "verifier_ms": 45000}}
            with patch.object(workspace.identity, "ROOT", root), \
                    patch.object(workspace.identity, "source_identity", return_value=current), \
                    patch.object(workspace.identity, "load_build", return_value=build), \
                    patch.object(workspace.fixtures, "load", return_value=prepared), \
                    patch.object(workspace.fixtures, "clone", side_effect=ValueError("original clone mismatch")):
                result = workspace.one_family_case("payload_create_read", case, "prepared", "build", root / "case")
            self.assertEqual(result["status"], "FAIL")
            self.assertEqual(result["original_failure"], "original clone mismatch")
            self.assertEqual(result["sample_count"], 0)
            self.assertEqual(result["completed_operation_count"], 0)
            self.assertNotIn("complete_wall_ns", result)
            self.assertEqual(result["retained_mount_keys"], [])
            receipts.verify_manifest(root / "case")

    def test_backing_observer_waits_for_original_reclamation_to_finish(self):
        with tempfile.TemporaryDirectory() as directory:
            states = iter(("Queued", "Gone"))
            observed = []
            def send(operation, key, **options):
                self.assertEqual((operation, key), ("cleanup", "original-key"))
                state = next(states)
                observed.append(state)
                return {"fields": {"state": state}}
            runtime = SimpleNamespace(container="original-container", send=send)
            def command(argv, folder, label, seconds):
                self.assertEqual(observed, ["Queued", "Gone"])
                self.assertNotIn("--evict", argv)
                path = Path(folder) / "observer.stdout"
                path.write_text('{"resident_pages": 1}')
                return {"stdout": str(path)}
            with patch.object(workspace.receipts, "command", side_effect=command):
                cleaned, residency = workspace.terminal_cache_observation(runtime, "original-key", {"socket": "/socket"}, directory)
            self.assertEqual([row["fields"]["state"] for row in cleaned], ["Queued", "Gone"])
            self.assertEqual(residency, {"resident_pages": 1})

    def test_b_requires_original_terminal_cleanup_and_actual_zero_demands(self):
        good = dict(fresh_mount=True, warmup_terminal_unmount=True, warmup_cleanup="Gone", object_demands=0)
        self.assertEqual(cache.validate("B", good), "ELIGIBLE")
        for name in good:
            self.assertEqual(cache.validate("B", {key: value for key, value in good.items() if key != name}), "INELIGIBLE")
        for value in (True, -1, 1, "0", None):
            self.assertEqual(cache.validate("B", {**good, "object_demands": value}), "INELIGIBLE")

    def test_content_pages_alone_do_not_prove_a_and_c_lifetime_is_bounded(self):
        self.assertEqual(cache.validate("A", {"resident_pages": 0}), "INELIGIBLE")
        self.assertEqual(cache.validate("A", {"resident_pages": False, "metadata_state": "VERIFIED_COLD"}), "INELIGIBLE")
        self.assertEqual(cache.validate("C", {"same_mount": True, "warm_interval_ns": 60_000_000_000}), "INELIGIBLE")
        self.assertEqual(cache.validate("C", {"same_mount": True, "warm_interval_ns": 59_999_999_999}), "ELIGIBLE")

    def test_failed_clone_retains_original_failure_and_has_no_sample_credit(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            current = dict(source_commit="source", product_tree="product", files={})
            build = dict(binaries={name: {"sha256": name} for name in ("runtime", "daemon")})
            prepared = dict(fixture={"fixture_sha256": "fixture"})
            with patch.object(workspace.identity, "ROOT", root), \
                    patch.object(workspace.identity, "source_identity", return_value=current), \
                    patch.object(workspace.identity, "load_build", return_value=build), \
                    patch.object(workspace.fixtures, "load", return_value=prepared), \
                    patch.object(workspace.fixtures, "clone", side_effect=ValueError("original clone mismatch")):
                result = workspace.one_cell("C01", "prepared", "build", root / "result")
                self.assertEqual(result["status"], "FAIL")
                self.assertEqual(result["original_failure"], "original clone mismatch")
                self.assertEqual((result["sample_count"], result["completed_operation_count"]), (0, 0))
                self.assertNotIn("complete_wall_ns", result)
                self.assertEqual(receipts.verify_manifest(root / "result")["schema"], "fs-bench-pro-evidence-v1")
                with self.assertRaises(FileExistsError):
                    workspace.one_cell("C01", "prepared", "build", root / "another")

    def test_report_keeps_every_case_and_exceeded_is_independent_of_pass(self):
        selection = {"family": "cluster-two/cells", "cases": [{"id": "C01"}, {"id": "C02"}, {"id": "C03"}]}
        recorded = {"C01": {"status": "PASS", "proof_status": "PASS", "complete_wall_ns": 16,
                            "declared_limit_ns": 15, "counts": {"requests": 0}, "cleanup": "Gone"},
                    "C02": {"status": "FAIL", "original_failure": "original refused operation"}}
        performance, proof = receipts.result_rows(selection, recorded)
        self.assertEqual(len(performance), 3)
        self.assertEqual([row["status"] for row in performance], ["PASS", "FAIL", "NOT_RUN"])
        self.assertEqual(performance[0]["limit_status"], "EXCEEDED")
        self.assertEqual(performance[0]["requests"], 0)
        self.assertEqual(performance[1]["requests"], "UNAVAILABLE")
        self.assertEqual(performance[1]["tag"], "original refused operation")
        self.assertEqual(proof[0]["proof_status"], "PASS")
        self.assertEqual(set(performance[0]), set(receipts.PERFORMANCE_COLUMNS))
        self.assertEqual(set(proof[0]), set(receipts.VERIFICATION_COLUMNS))

    def test_csv_output_is_generated_once_and_missing_metrics_stay_unavailable(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            run = home / "run"
            run.mkdir()
            receipts.write_new(run / "run.json", {"family": "cluster-two/cells", "cases": [{"id": "C01"}],
                                                   "date": "2026-10-10", "source_commit": "commit", "product_tree": "product"})
            result = receipts.report(run, home / "csv")
            self.assertEqual(result["cases"], 1)
            self.assertIn("NOT_RUN", (home / "csv/performance.csv").read_text())
            self.assertIn("UNAVAILABLE", (home / "csv/verification.csv").read_text())
            with self.assertRaises(FileExistsError):
                receipts.report(run, home / "csv")

    def test_report_uses_preserved_source_row_and_never_promotes_proof_time(self):
        selection = {"family": "init_namespace", "cases": [{"id": "namespace-100-compact-v3", "reference": {
            "kind": "performance", "source_file": "release-notes/0.1.5/benchmark-performance.csv", "source_row": "110"}}]}
        performance, _ = receipts.result_rows(selection, {})
        self.assertEqual(performance[0]["reference_release"], "0.1.5")
        self.assertEqual(performance[0]["reference_timer"], "layerstack_init_ns")
        self.assertTrue(performance[0]["reference_ns"].isdigit())
        selection["cases"][0]["reference"]["kind"] = "verification"
        performance, _ = receipts.result_rows(selection, {})
        self.assertEqual(performance[0]["reference_ns"], "")
