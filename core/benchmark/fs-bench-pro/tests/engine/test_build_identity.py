"""Build admission rejects dirty/untracked source before external operations."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

BENCH = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BENCH))
from engine import identity


class BuildIdentity(unittest.TestCase):
    def test_changed_edit_model_or_writer_refuses_an_old_build_before_binary_use(self):
        from engine import receipts
        for name in ("core/benchmark/fs-bench-pro/engine/recipes/edit_model.rs",
                     "core/benchmark/fs-bench-pro/writers/edit.rs"):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as directory:
                folder = Path(directory)
                (folder / "build.json").write_text(json.dumps({"identity": {"files": {name: "old"}},
                                                               "binaries": {}}))
                with patch.object(receipts, "verify_manifest"), \
                        patch.object(identity, "source_identity", return_value={"files": {name: "changed"}}), \
                        patch.object(identity, "sha256", side_effect=AssertionError("cannot use old executable")):
                    with self.assertRaisesRegex(ValueError, "build inputs differ"):
                        identity.load_build(folder)

    def test_dirty_tracked_source_is_refused_before_hashing(self):
        with patch.object(identity, "git", return_value="core/crates/changed.rs"), \
                patch.object(identity, "sha256", side_effect=AssertionError("must not seal dirty input")):
            with self.assertRaisesRegex(ValueError, "commit the tracked source"):
                identity.source_identity()

    def test_an_untracked_source_cannot_enter_the_build(self):
        def git(root, *arguments):
            return "core/benchmark/fs-bench-pro/engine/unsealed.py" if arguments[0] == "ls-files" else ""
        with patch.object(identity, "git", side_effect=git):
            with self.assertRaisesRegex(ValueError, "untracked source"):
                identity.source_identity()

    def test_protected_handoff_is_recorded_without_becoming_compilation_input(self):
        protected = "core/docs/issues/307/PROMPT-R8-R9-NEXT-AGENT-20261010.md"
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / protected).parent.mkdir(parents=True)
            (root / protected).write_text("retained handoff")
            def git(root, *arguments):
                if arguments[0] == "diff":
                    return ""
                if arguments[:2] == ("ls-files", "--others"):
                    return protected
                if arguments[0] == "ls-files":
                    return ""
                return "a" * 40
            with patch.object(identity, "git", side_effect=git):
                result = identity.source_identity(root)
            self.assertEqual(result["files"], {})
            self.assertEqual(result["excluded_untracked"][0]["path"], protected)
            self.assertEqual(len(result["excluded_untracked"][0]["sha256"]), 64)
