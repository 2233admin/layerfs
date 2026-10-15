# Depot frozen fixture recipe

> **Status:** Current planning checklist; no release candidate exists.

Scope: #337. Generate inside the Workspace using image Python 3.11, never a
host fixture copy. All object uploads and downloads use bounded streaming.
The many-small-files set is exactly 64 files, 256 bytes each. The large binary
is 33,554,432 bytes; its identical version and one-byte edit must both appear
in committed artifact history. The edit is at zero-based offset 1,048,583.

```python
from pathlib import Path
import hashlib, random, shutil
root = Path("fixtures")
root.mkdir(exist_ok=True)
(root / "empty.bin").write_bytes(b"")
(root / "text.txt").write_bytes(b"Depot fixture v1\n")
(root / "binary.bin").write_bytes(bytes(range(256)) * 16)
(root / "nested/input/deep").mkdir(parents=True, exist_ok=True)
(root / "nested/input/deep/object.bin").write_bytes(bytes(range(256)) * 16)
(root / "small").mkdir(exist_ok=True)
for i in range(64):
    (root / "small" / f"item-{i:03}.bin").write_bytes(hashlib.sha256(f"small:{i}".encode()).digest() * 8)
rng = random.Random(337)
with (root / "large-v1.bin").open("wb") as stream:
    for _ in range(512):
        stream.write(rng.randbytes(65536))
shutil.copyfile(root / "large-v1.bin", root / "large-identical.bin")
shutil.copyfile(root / "large-v1.bin", root / "large-v2.bin")
with (root / "large-v2.bin").open("r+b") as stream:
    stream.seek(1048583)
    old = stream.read(1)
    stream.seek(1048583)
    stream.write(bytes([old[0] ^ 255]))
```

[FIXTURE-HASHES.json](FIXTURE-HASHES.json) freezes byte identities.
