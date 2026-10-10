"""External native fixture CLI proof, using an explicitly compiled private binary."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


CASE = "workspace-corrupt-descendant-compact-v2-proof"


class ReliabilityFixture(unittest.TestCase):
    def setUp(self):
        self.binary = Path(os.environ["LAYERFS_RELIABILITY_RECIPE"]).resolve(strict=True)
        self.home = Path(tempfile.mkdtemp(prefix="layerfs-b7-native-fixture-test-"))
        print("RETAINED_RELIABILITY_NATIVE_FIXTURE=" + str(self.home))

    def command(self, *args):
        return subprocess.run([str(self.binary), *map(str, args)],
                              capture_output=True, timeout=30, check=False)

    def materialize(self):
        root = self.home / "tree"
        result = self.command("materialize-reliability", CASE, root)
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        row = json.loads(result.stdout)
        self.assertEqual(row["schema"], "fs-bench-pro-native-reliability-fixture-v1")
        self.assertEqual(row["case"], CASE)
        self.assertEqual((row["seed"], row["entries"], row["logical_bytes"]),
                         (1, 23, 1048576))
        self.assertEqual((row["status"], row["verification_status"]), ("PASS", "pass"))
        return root

    def test_complete_fixture_and_unchanged_full_native_oracle(self):
        root = self.materialize()
        self.assertTrue(root.with_suffix(".manifest.tsv").is_file())
        self.assertEqual((root / "links/alias.dat").stat().st_ino,
                         (root / "sentinels/f0000.dat").stat().st_ino)
        self.assertEqual(os.readlink(root / "links/relative"), "../sentinels/f0001.dat")
        verify = self.command("verify-reliability-native", CASE, root)
        self.assertEqual(verify.returncode, 0, verify.stderr.decode())
        self.assertEqual(json.loads(verify.stdout)["verification_status"], "pass")
        refused = self.command("materialize-reliability", CASE, root)
        self.assertNotEqual(refused.returncode, 0)
        self.assertIn(b"fresh reliability fixture", refused.stderr)

    def test_full_original_oracle_refuses_payload_and_extra_name(self):
        root = self.materialize()
        target = root / "sentinels/f0003.dat"
        with target.open("r+b") as out:
            original = out.read(1)
            out.seek(0)
            out.write(bytes([original[0] ^ 1]))
        os.utime(target, ns=(1700000000000000000, 1700000000000000000))
        verify = self.command("verify-reliability-native", CASE, root)
        self.assertNotEqual(verify.returncode, 0)
        self.assertIn(b"native content mismatch", verify.stderr)
        with target.open("r+b") as out:
            out.write(original)
        os.utime(target, ns=(1700000000000000000, 1700000000000000000))
        (root / "work/extra").write_bytes(b"extra")
        verify = self.command("verify-reliability-native", CASE, root)
        self.assertNotEqual(verify.returncode, 0)
        self.assertIn(b"complete native path-set mismatch", verify.stderr)

    def test_unrelated_original_case_has_no_integrity_fixture_route(self):
        result = self.command("materialize-reliability",
                              "workspace-hardlink-alias-compact-v2-proof", self.home / "tree")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(b"only original integrity reliability fixtures", result.stderr)
        self.assertFalse((self.home / "tree").exists())


if __name__ == "__main__":
    unittest.main()
