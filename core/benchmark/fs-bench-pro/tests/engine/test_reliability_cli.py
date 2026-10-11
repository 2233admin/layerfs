"""Reliability routes preserve source NAs and one verification-only attempt."""
from contextlib import ExitStack, redirect_stdout
import importlib.util
import io
import json
from pathlib import Path
import sys
import subprocess
import tempfile
import types
import unittest
from unittest.mock import Mock, patch

BENCH = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BENCH))
import engine
from engine import fixtures, identity, project, receipts, workspace
spec = importlib.util.spec_from_file_location("reliability_bench_cli", BENCH / "bench.py")
bench = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bench)


class ReliabilityCli(unittest.TestCase):
    def test_routing_double_replaces_a_previously_imported_package_attribute(self):
        actual = __import__("engine.reliability", fromlist=["reliability"])
        with patch.object(engine, "reliability", actual):
            self.exercise("run")

    def cases(self):
        # Retained pre-D77 prospective ported metadata is a routing double only.
        # Current source admission tests separately refuse execution of all28.
        original = json.loads(subprocess.check_output(["git","show","b1cc058339c6c884c350711bb3bdf46fc2014e35:core/benchmark/fs-bench-pro/families/workspace_reliability/family.json"],text=True))["cases"]
        return [original[0], next(row for row in original if row["id"] == "workspace-corrupt-descendant-compact-v2-proof")]

    def exercise(self, operation, invalid_na=False):
        with tempfile.TemporaryDirectory() as temporary, ExitStack() as stack:
            root = Path(temporary).resolve()
            cases = self.cases()
            family = {"family":"workspace_reliability", "cases":cases}
            definition = root / "families/workspace_reliability/family.json"
            definition.parent.mkdir(parents=True)
            definition.write_text(json.dumps(family))
            module = types.ModuleType("engine.reliability")
            module.validate_case = Mock()
            module.admit_sources = Mock(side_effect=ValueError("missing applicability source") if invalid_na else None)
            module.prepare = Mock(return_value={"status":"PASS", "master_volume":"owned-master", "fixture":{}})
            module.parity = Mock(return_value={"family":"workspace_reliability", "status":"PASS", "cases":cases})
            module.one_case = Mock(return_value={"case":cases[1]["id"], "status":"PASS", "functional_status":"PASS",
                "proof_status":"PASS", "proof_only":True, "performance_mode":"verification-only",
                "sample_count":0, "verification_attempt_count":1})
            for target, name, options in (
                (bench,"HERE",{"new":root}), (identity,"ROOT",{"new":root}),
                (identity,"source_identity",{"return_value":{"source_commit":"source", "source_tree":"tree", "product_tree":"product"}}),
                (workspace,"one_family_case",{}), (workspace,"dispose_family_resources",{}),
                (fixtures,"prepare",{}), (fixtures,"family_case",{"return_value":(family,cases[1])}),
            ):
                stack.enter_context(patch.object(target,name,**options))
            stack.enter_context(patch.dict(sys.modules,{"engine.reliability":module}))
            stack.enter_context(patch.object(engine,"reliability",module,create=True))
            output = root / "benchmark-results/fs-bench-pro/run"
            args = {"run":["run","workspace_reliability","--build","build","--prepared","prepared","--out",str(output)],
                    "parity":["parity","workspace_reliability","--prepared","prepared","--build","build","--out",str(output)],
                    "prepare":["prepare",cases[1]["id"],"--build","build","--out",str(output)]}[operation]
            with redirect_stdout(io.StringIO()):
                if invalid_na:
                    with self.assertRaisesRegex(ValueError,"applicability source"):
                        bench.main(args)
                    module.one_case.assert_not_called()
                else:
                    bench.main(args)
            workspace.one_family_case.assert_not_called()
            fixtures.prepare.assert_not_called()
            if operation=="run":
                module.admit_sources.assert_called_once_with(cases[0])
                self.assertFalse((output/cases[0]["id"]).exists())
                if not invalid_na:
                    module.one_case.assert_called_once()
                    self.assertEqual(module.one_case.call_args.args[0],cases[1])
                    self.assertEqual(module.one_case.call_args.args[1],Path("prepared")/cases[1]["id"])
                    workspace.dispose_family_resources.assert_called_once()
            if operation=="prepare":module.prepare.assert_called_once_with(cases[1],output,Path("build"))
            if operation=="parity":module.parity.assert_called_once_with(family,Path("prepared"),output,Path("build"))

    def test_na_is_validated_without_an_attempt_and_integrity_uses_one_proof_route(self):
        self.exercise("run")

    def test_invalid_na_source_never_reaches_a_workload_or_verifier(self):
        self.exercise("run",True)

    def test_prepare_uses_the_exact_committed_integrity_definition(self):
        self.exercise("prepare")

    def test_parity_routes_all_original_applicability_and_fixture_selections(self):
        self.exercise("parity")

    def test_verify_na_preserves_actual_reason_and_never_hides_recorded_failure(self):
        cases = json.loads((BENCH / "families/workspace_reliability/family.json").read_text())["cases"]
        selected = [row for row in cases if row["status"] == "not-applicable"]
        self.assertEqual(len(selected), 28)
        selection = {"family":"workspace_reliability", "cases":selected}
        module = types.ModuleType("engine.reliability")
        module.validate_case = Mock()
        with tempfile.TemporaryDirectory() as temporary:
            run = Path(temporary)
            for recorded, expected in [({}, 0), ({selected[0]["id"]:{"proof_status":"FAIL"}}, 1)]:
                output = io.StringIO()
                with patch.dict(sys.modules,{"engine.reliability":module}), patch.object(engine,"reliability",module,create=True), patch.object(receipts,"load_run",return_value=(selection,recorded)), redirect_stdout(output):
                    code = bench.main(["verify",str(run)])
                self.assertEqual(code, expected)
                result = json.loads(output.getvalue())
                self.assertEqual(len(result),28)
                for row, case in zip(result,selected):
                    if case["id"] in recorded:
                        self.assertEqual(row["status"],"FAIL")
                    else:
                        self.assertEqual(row["status"],"NOT_APPLICABLE")
                        self.assertEqual(row["reason"],case["not_applicable_reason"])
        self.assertEqual(module.validate_case.call_count,55)


if __name__ == "__main__":
    unittest.main()
