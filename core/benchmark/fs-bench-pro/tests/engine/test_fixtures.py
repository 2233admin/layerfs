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
