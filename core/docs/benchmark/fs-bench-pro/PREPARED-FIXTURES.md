# Kept fixture preparation

> **Status:** Implemented setup machinery; final simplified-source count gate and baseline remain pending.

The current selection has 108 everyday and 49 heavy cases. Setup retains closed
inputs between runs. Each measured case still receives its own writable Store
byte copy; a prepared input is never reused as a mutated measurement. Keeping
inputs changes setup ownership, and makes no cold-cache or performance claim.

The native input cache stores one real directory per declared initial-input
identity. Its key binds initial bytes, metadata, seed, UID/GID, native producer
binaries and compilation flags. SDK edit operations with the same initial file
share that file; command shape and Commit cadence are excluded from that key.
Full portable metadata, file hashes, symlinks and hardlink relationships are
checked against the closed cache record before reuse. Original producer argv
and stdout remain immutable and attributed to their original case. A reuse
record declares the requesting case; it does not claim another generator run.

Every case retains its original independent native verification and expected
states. Contextual cases additionally qualify the shared initial tree with the
original verifier for the requesting case and role, using the exact original
empty-observation header at step zero. Full initial-byte verification remains.
Selected later checkpoints, automatic-mode evidence, SDK payloads, Storage
readback and proofs retain their original scope and limits.

Prepared Workspace inputs include a Store built by Project Init. Their Store
reuse key therefore includes the product crates' Rust/SQL/manifests, dependency
lock, runtime production code, image, profile and flags. It excludes external
tests and documentation. Reuse requires the same complete initial fixture hash
and UID/GID, an intact closed Store and installed manifest, and matching builder
identity. A corrupt or incomplete input is retained and refused; it is never
refreshed or replayed automatically. Native-only Init cases keep their original
Init inside the measured operation and have no setup Store.

A complete case preparation has a separate producer key covering its declared
case, native tools, setup producers and required Store builder. Case-specific
expectations and helper assets remain separate from the shared initial input.
The tracked tier driver locates a preparation by this key and avoids invalidating it merely
because a receipt, external test or documentation changed. The frozen root
definitions and historical receipts remain unchanged.

Before shared retention, the kept originals and distinct masters occupied
3,071,784,966 logical bytes and 3,393,814,528 allocated bytes. Host free space
was 597,182,824,448 bytes; Docker filesystem free space was 171,939,074,048 bytes.
The inventory included 21 Project Init Store preparations and 18 distinct master
volumes. These are the pre-retention observation; the final kept-fixture size
will be reported again with the final baseline.

The tracked entry point is `core/benchmark/fs-bench-pro/tier.py`. `all` is for
the owner's terminal and executes a whole declared tier as sequential bounded
case invocations. `next` advances exactly one unrun case. It requires that
case's closed preparation first; a missing fixture produces the exact tracked
`bench.py prepare` argv and starts no sample. Agents execute that preparation
under its existing bound, then invoke `next`. Agents never invoke `all`.

Examples use a clean committed source and its exact sealed build:

```sh
python3 core/benchmark/fs-bench-pro/tier.py next everyday --tag baseline --build "$SEALED_BUILD"
python3 core/benchmark/fs-bench-pro/tier.py all heavy --tag baseline --build "$SEALED_BUILD"
```

The entry point serializes on the worktree-local measurement lock. Each case
gets append-only output and an exact-source campaign identity; an existing
attempted directory is never replayed. The journal retains command wall, phase
metrics, count comparison, original verdicts and cleanup. Counts are compared
with each case's own terminal row, including unavailable fields. A count,
functional, proof or cleanup failure stops whole-tier advancement for diagnosis.
The next explicit invocation can advance to an unrun case after that diagnosis.

Cleanup scans only explicit resources created by that sample. A container is
stopped/removed only when Docker ties it to one of those sample volumes.
Pre-existing volumes are protected. Exported Store/test-copy data is removed
after checking its complete manifest; removed hashes are retained. Closed
masters remain. Default invocations stay below two minutes; only the owner's
six named large runs and two preparations receive the 300-second allowance.
The case's product, verifier, proof and reporting limits are unchanged.
