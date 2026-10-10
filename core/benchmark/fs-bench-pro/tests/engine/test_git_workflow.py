"""Complete Git custody cannot replace independently authored source/semantics."""
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

BENCH = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BENCH))
from engine import workspace, receipts


def custody(index=b"raw index including stat cache", extra=""):
    return ("workspace-independent-manifest-v1\n"
            ".\tdirectory\t0\t750\t1700000000\t0\t-\n"
            ".git\tdirectory\t0\t750\t1700000000\t0\t-\n"
            f".git/index\tfile\t{len(index)}\t640\t1700000000\t0\t{hashlib.sha256(index).hexdigest()}\n" + extra).encode()


def fields(body):
    return {"repository_manifest_sha256": hashlib.sha256(body).hexdigest(),
            "repository_path_count": str(len(body.splitlines())-2)}


class GitCustody(unittest.TestCase):
    def test_complete_index_bytes_canonical_names_and_identity_are_required(self):
        original = custody()
        self.assertEqual(workspace.git_custody_values(original, fields(original))["repository_paths"], 2)
        for damaged in (original.replace(b".git/index", b"tracked/source.dat"),
                        original + original.splitlines(keepends=True)[-1],
                        original.replace(b".git/index", b".git/../index"),
                        original.replace(b"file\t", b"symlink\t"),
                        original.replace(b"640\t1700000000", b"640\t1700000000\t0"),
                        original.replace(b".git/index", b".git/config")):
            with self.subTest(damaged=damaged), self.assertRaises(ValueError):
                workspace.git_custody_values(damaged, fields(damaged))
        for changed in ({"repository_manifest_sha256": "0"*64}, {"repository_path_count": "0"}):
            with self.assertRaises(ValueError):
                workspace.git_custody_values(original, {**fields(original), **changed})

    def test_fresh_custody_detects_index_stat_byte_change_before_semantic_git(self):
        for fresh_body in (custody(), custody(b"same semantics, DIFFERENT index stat bytes")):
            with self.subTest(fresh=fresh_body), tempfile.TemporaryDirectory() as temporary:
                home = Path(temporary); bodies = [custody(), fresh_body]
                prepared = {"family": "git_tool_workflow", "case": "git-tool-1-compact-v2",
                            "git_reference": {"case": "git-tool-1-compact-v2"}}
                calls = []
                class Runtime:
                    container = "owned-sample"
                    def send(self, operation, key, path, deadline):
                        calls.append((operation, key, Path(path).read_text()))
                        out = Path(path).parent / "capture.stdout"
                        out.write_text("".join(f"{name}={value}\n" for name, value in fields(bodies[len(calls)-1]).items()))
                        return {"fields": {"stdout": str(out)}}
                def exported(argv, folder, label, seconds):
                    self.assertEqual(argv[-3], "cp")
                    self.assertLessEqual(seconds, 15)
                    Path(argv[-1]).write_bytes(bodies[len(calls)-1])
                    return {"status": "PASS"}
                with patch.object(workspace.receipts, "command", side_effect=exported):
                    prior = workspace.before_git_commit(Runtime(), "measured-key", prepared, {"socket": "/socket"}, home, 45)
                    if fresh_body == custody():
                        result = workspace.verify_git_custody(Runtime(), "fresh-key", prepared, {"socket": "/socket"}, home, prior, 45)
                        self.assertEqual(result["status"], "PASS")
                    else:
                        with self.assertRaisesRegex(ValueError, "precommit/reopened"):
                            workspace.verify_git_custody(Runtime(), "fresh-key", prepared, {"socket": "/socket"}, home, prior, 45)
                self.assertEqual([call[0] for call in calls], ["verify", "verify"])
                self.assertTrue(all("workspace-git-custody-out /tmp/" in call[2] for call in calls))
                self.assertTrue(all("workspace-git-verify" not in call[2] for call in calls))
                receipts.verify_manifest(home / "git-precommit")
                receipts.verify_manifest(home / "git-reopened")
                self.assertEqual(Path(prior["path"]).read_bytes(), custody())

    def test_independent_git_semantics_require_all_three_ids_and_original_proof(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); bundle = root / "git-reference"; bundle.mkdir()
            for name in ("head", "tree", "parent"):
                (bundle / ("expected-"+name)).write_text(name+"-independent\n")
            prepared = {"helpers": {"root": str(root)}}
            good = {"git_"+name: name+"-independent" for name in ("head", "tree", "parent")}
            good.update(verification_status="pass", git_semantic_verification_status="pass",
                        git_custody_status="requires_precommit_reopen_comparison")
            self.assertEqual(workspace.verify_git_semantic_fields(good, prepared)["status"], "PASS")
            for name in good:
                damaged = dict(good); damaged[name] = "unknown"
                with self.subTest(name=name), self.assertRaises(ValueError):
                    workspace.verify_git_semantic_fields(damaged, prepared)

    def test_prior_mounted_verification_cannot_be_replaced_by_performance_variant(self):
        case = {"git_workflow": True, "git_qualification": {"run": "qualify"}, "v016_case": "git-tool-1-compact-v2",
                "original_operation_counts": {"git_process_count": 6, "completed_target_count": 1, "benchmark_verifier_count": 0}}
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "original.stdout"
            command = {"fields": {"stdout": str(output)}}
            good = "git_process_count=6\ncompleted_target_count=1\nbenchmark_verifier_count=1\nworkload_status=pass\nscenario_id=git-tool-1-compact-v2\nseed=1\n"
            output.write_text(good)
            self.assertEqual(workspace.verify_git_qualification(command, case)["status"], "PASS")
            for changed in (good.replace("benchmark_verifier_count=1", "benchmark_verifier_count=0"),
                            good.replace("git_process_count=6", "git_process_count=5"), good.replace("seed=1", "seed=2"),
                            good.replace("workload_status=pass", "workload_status=unknown")):
                output.write_text(changed)
                with self.assertRaises(ValueError):
                    workspace.verify_git_qualification(command, case)


if __name__ == "__main__":
    unittest.main()
