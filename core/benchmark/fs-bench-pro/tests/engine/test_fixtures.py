"""Preparation is deterministic and cloning cannot reuse a mutated sample."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

BENCH = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BENCH))
from engine import fixtures


class Fixtures(unittest.TestCase):
    def test_master_reuse_requires_exact_input_profile_product_and_identity(self):
        good = {"schema": "fs-bench-pro-prepared-workspace-v1", "status": "PASS",
                "global_profile": "Disposable/WAL/OFF", "identity": {"product_tree": "product"},
                "source_uid": 501, "source_gid": 20, "fixture": {"fixture_sha256": "fixture"},
                "master_volume": "immutable-master", "provision": {"store_sha256": "sealed"}}
        variants = ({}, {"global_profile": "Durable"}, {"identity": {"product_tree": "other"}},
                    {"source_uid": 502}, {"source_gid": 21}, {"fixture": {"fixture_sha256": "other"}},
                    {"status": "FAIL"})
        for changed in variants:
            with self.subTest(changed=changed), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                prior = root / "prior"
                prior.mkdir()
                (prior / "prepared.json").write_text(json.dumps({**good, **changed}))
                (prior / "manifest.json").write_text("sealed prior evidence")
                with patch.object(fixtures, "load", return_value=good) as checked:
                    reused, record = fixtures.compatible_master(root / "new", {"fixture_sha256": "fixture"},
                                                               {"product_tree": "product"}, 501, 20)
                self.assertEqual(checked.call_count, 0 if changed else 1)
                if changed:
                    self.assertIsNone(reused)
                    self.assertIsNone(record)
                else:
                    self.assertEqual(reused["master_volume"], "immutable-master")
                    self.assertEqual(record["store_sha256"], "sealed")

    def test_a_matching_corrupt_master_is_refused_without_fallback(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            prior = root / "prior"
            prior.mkdir()
            (prior / "prepared.json").write_text(json.dumps({"schema": "fs-bench-pro-prepared-workspace-v1",
                "status": "PASS", "global_profile": "Disposable/WAL/OFF", "identity": {"product_tree": "product"},
                "source_uid": 501, "source_gid": 20, "fixture": {"fixture_sha256": "fixture"}}))
            with patch.object(fixtures, "load", side_effect=ValueError("retained evidence changed")):
                with self.assertRaisesRegex(ValueError, "retained evidence changed"):
                    fixtures.compatible_master(root / "new", {"fixture_sha256": "fixture"}, {"product_tree": "product"}, 501, 20)

    def test_recipe_is_independent_of_output_path_and_never_overwrites(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            first = fixtures.generate("empty", home / "first")
            second = fixtures.generate("empty", home / "second")
            self.assertEqual(first, second)
            self.assertEqual((first["files"], first["logical_bytes"]), (0, 0))
            self.assertEqual((home / "first").stat().st_mtime_ns, fixtures.MTIME_NS)
            with self.assertRaises(FileExistsError):
                fixtures.generate("empty", home / "first")

    def test_cell_membership_has_exact_empty_and_base_file_recipes(self):
        self.assertEqual(len(fixtures.CELL_RECIPES), 12)
        self.assertEqual([c for c, r in fixtures.CELL_RECIPES.items() if r == "big64m"], ["C09", "C10", "C11"])
        self.assertEqual(fixtures.BIG_BYTES, 67_108_864)

    def test_clone_checks_exact_sealed_bytes_and_retains_a_mismatch(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory) / "clone"
            prepared = {"master_volume": "new-master", "provision": {"store_sha256": "a" * 64}}
            calls = []
            def command(argv, out, label, seconds, **options):
                calls.append((label, argv))
                path = Path(out) / (label + ".stdout")
                path.write_text("b" * 64 + " /source/global/store.sqlite\n" + "b" * 64 + " /dest/global/store.sqlite\n")
                return {"stdout": str(path), "status": "PASS"}
            with patch.object(fixtures.receipts, "command", side_effect=command):
                with self.assertRaisesRegex(ValueError, "clone differs"):
                    fixtures.clone(prepared, folder, {"socket": "/socket"})
            self.assertFalse(any(label == "copy-remove-passing" for label, _ in calls))
            self.assertTrue((folder / "resource-claim.json").is_file())
            copy = next(argv for label, argv in calls if label == "copy-create")
            self.assertIn("new-master:/source:ro", copy)
            self.assertIn("--reflink=never", copy[-1])
            self.assertIn("--sparse=never", copy[-1])

    def test_helper_seal_matches_every_actual_copied_file(self):
        with tempfile.TemporaryDirectory() as directory:
            result = fixtures.assets(Path(directory) / "code")
            for relative, digest in result["files"].items():
                self.assertEqual(fixtures.identity.sha256(Path(result["root"]) / relative), digest)
            self.assertIn("engine/oracle.py", result["files"])
            self.assertIn("cells/git_index_oracle.py", result["files"])
            self.assertIn("cache/residency.py", result["files"])
