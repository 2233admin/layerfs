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
The tracked tier driver will locate a preparation by this key and avoid invalidating it merely
because a receipt, external test or documentation changed. The frozen root
definitions and historical receipts remain unchanged.

Before shared retention, the kept originals and distinct masters occupied
3,071,784,966 logical bytes and 3,393,814,528 allocated bytes. Host free space
was 597,182,824,448 bytes; Docker filesystem free space was 171,939,074,048 bytes.
The inventory included 21 Project Init Store preparations and 18 distinct master
volumes. These are the pre-retention observation; the final kept-fixture size
will be reported again with the final baseline.
