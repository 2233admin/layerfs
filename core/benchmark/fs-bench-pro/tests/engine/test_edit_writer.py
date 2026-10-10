"""Native qualification of the shared bounded Unix splice writer."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(ROOT / "core/benchmark/fs-bench-pro"))
from engine import identity


class NativeSpliceWriter(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Compilation precedes this invocation. A shared immutable build is
        # reusable only when every compiled input and binary still matches.
        cls.build = identity.load_build(Path(os.environ["LAYERFS_EDIT_WRITER_BUILD"]))
        cls.writer = cls.build["binaries"]["edit-host"]["path"]
        cls.fixture = cls.build["binaries"]["workspace-writer"]["path"]
        cls.temporary = tempfile.TemporaryDirectory(prefix="edit-writer-native-", dir=ROOT / "core/target")
        cls.folder = Path(cls.temporary.name)

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    def fixture_root(self, case, label):
        path = self.folder / label
        completed = subprocess.run([self.fixture, "fixture", case, str(path)], cwd=ROOT,
                                   capture_output=True, text=True, timeout=15)
        self.assertEqual(completed.returncode, 0, completed.stderr)
        return path

    def command(self, root, *args):
        return subprocess.run([self.writer, *args], cwd=root, capture_output=True, text=True, timeout=15)

    def test_original_overwrite_and_all_splice_shapes_preserve_complete_tree(self):
        ids = ["overwrite-head-4k-on-1mib-ops-1", "overwrite-middle-4k-on-1mib-ops-1",
               "overwrite-tail-4k-on-1mib-ops-1", "insert-middle-4k-on-1mib-ops-1",
               "delete-middle-4k-on-1mib-ops-1", "append-tail-4k-on-1mib-ops-1",
               "prepend-head-4k-on-1mib-ops-1", "replace-grow-middle-2k-to-4k-on-1mib-ops-1",
               "replace-shrink-middle-4k-to-2k-on-1mib-ops-1", "truncate-tail-4k-on-1mib-ops-1",
               "zero-extend-tail-4k-on-1mib-ops-1"]
        for index, case in enumerate(ids):
            with self.subTest(case=case):
                root = self.fixture_root(case, "splice-" + str(index))
                inode = (root / "payload.bin").stat().st_ino
                changed = self.command(root, "apply", case)
                self.assertEqual(changed.returncode, 0, changed.stderr)
                self.assertEqual((root / "payload.bin").stat().st_ino, inode)
                verified = self.command(root, "verify", case, "1")
                self.assertEqual(verified.returncode, 0, verified.stderr)
                fields = dict(line.split("=", 1) for line in verified.stdout.splitlines())
                self.assertEqual(fields["verification_status"], "pass")
                self.assertEqual(int(fields["verified_paths"]), 2)

    def test_wrong_input_length_is_refused_before_mutation(self):
        case = "overwrite-middle-4k-on-1mib-ops-1"
        root = self.fixture_root(case, "wrong-length")
        with (root / "payload.bin").open("r+b") as file:
            file.truncate(1_048_575)
        before = (root / "payload.bin").read_bytes()
        refused = self.command(root, "apply", case)
        self.assertNotEqual(refused.returncode, 0)
        self.assertIn("fixture length differs", refused.stderr)
        self.assertEqual((root / "payload.bin").read_bytes(), before)

    def test_unchanged_byte_corruption_is_rejected_by_original_full_oracle(self):
        case = "overwrite-middle-4k-on-1mib-ops-1"
        root = self.fixture_root(case, "corrupted")
        changed = self.command(root, "apply", case)
        self.assertEqual(changed.returncode, 0, changed.stderr)
        with (root / "payload.bin").open("r+b") as file:
            original = file.read(1)
            file.seek(0)
            file.write(bytes([original[0] ^ 1]))
        os.utime(root / "payload.bin", ns=(1_700_000_000_000_000_000,) * 2)
        refused = self.command(root, "verify", case, "1")
        self.assertNotEqual(refused.returncode, 0)
        self.assertIn("native content mismatch: payload.bin", refused.stderr)

    def test_named_boundary_sdk_steps_preserve_complete_bytes_metadata_and_inodes(self):
        schedules = {"small-control": [4096]*3, "below": [131071]*3,
                     "exact": [131072]*3, "above": [131073]*3,
                     "large-control": [1048576]*3,
                     "roundtrip": [131071,131072,131073,131072,131071]}
        for name, lengths in schedules.items():
            case = "v016-boundary-" + name + "-v1"
            with self.subTest(case=case):
                root = self.fixture_root(case, "named-"+name)
                target = root / "data/target.bin"
                witness = root / "data/witness.bin"
                initial_inode, witness_bytes = target.stat().st_ino, witness.read_bytes()
                for step, length in enumerate(lengths[1:], 1):
                    changed = self.command(root, "apply-sdk-step", case, str(step))
                    self.assertEqual(changed.returncode, 0, changed.stderr)
                    self.assertEqual(target.stat().st_size, length)
                    self.assertEqual(target.stat().st_ino, initial_inode)
                    self.assertEqual(witness.read_bytes(), witness_bytes)
                    self.assertEqual(target.stat().st_mode & 0o7777, 0o640)
                    self.assertEqual(target.stat().st_mtime_ns, 1700000000000000000)
                    verified = self.command(root, "verify", case, str(step))
                    self.assertEqual(verified.returncode, 0, verified.stderr)
                    self.assertIn("verification_status=pass", verified.stdout)

    def test_named_sdk_selection_and_wrong_length_refuse_before_mutation(self):
        case = "v016-boundary-small-control-v1"
        root = self.fixture_root(case, "named-refusal")
        target = root / "data/target.bin"
        before = target.read_bytes()
        for args in (("0",), ("1", "0"), ("1", "2")):
            refused = self.command(root, "apply-sdk-step", case, *args)
            self.assertNotEqual(refused.returncode, 0)
            self.assertEqual(target.read_bytes(), before)
        with target.open("r+b") as file:
            file.truncate(4095)
        before = target.read_bytes()
        refused = self.command(root, "apply-sdk-step", case, "1", "1")
        self.assertNotEqual(refused.returncode, 0)
        self.assertIn("fixture length differs", refused.stderr)
        self.assertEqual(target.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
