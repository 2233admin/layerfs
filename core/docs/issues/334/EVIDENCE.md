# Issue #334 preserved diagnostic evidence

> **Status:** Archived; retained for historical evidence only.

The [diagnostic evidence publication](https://github.com/Ephemeral-AI-Lab/layerfs/releases/tag/issue334-diagnostic-evidence-20261016)
holds the portable receipts and all three stopped Store exports. It is a
non-latest diagnostic prerelease asset container, not a LayerFS product release
or release qualification. Every size, count, timing and ratio is diagnostic.
The original campaign ends at `28eb06c8d59fac5c1c3c69acdd2ab9c4c0b1a714`;
the separate closure product check uses `02e0409cbaa7ebe38305a739422a4eb859ed8d60`.
[RESULTS.md](RESULTS.md) retains the original build identities and measurements.

## Download and verification

| Asset | Bytes | SHA256 |
| --- | --- | --- |
| [issue334-diagnostic-evidence.tar.gz](https://github.com/Ephemeral-AI-Lab/layerfs/releases/download/issue334-diagnostic-evidence-20261016/issue334-diagnostic-evidence.tar.gz) | 19,255,006 | `a1a9a9646dd673b77054184b9c581d393aea33dd280eacf02c432cf6296c55ef` |
| [issue334-evidence-manifest.json](https://github.com/Ephemeral-AI-Lab/layerfs/releases/download/issue334-diagnostic-evidence-20261016/issue334-evidence-manifest.json) | 156,169 | `12a150c30a2ba70d5fcb400cc507da9e951c5f0d6d90f305996bf3f88aaecc5b` |
| [SHA256SUMS](https://github.com/Ephemeral-AI-Lab/layerfs/releases/download/issue334-diagnostic-evidence-20261016/SHA256SUMS) | 200 | Contains the two hashes above |

Download the three assets into an empty directory, verify the two SHA256 values,
then extract the tarball into another empty directory. Its embedded
`MANIFEST.json` is identical to the external manifest. It describes every member's
relative path, bytes and SHA256, every exclusion and every public redaction.
All 823 payload members were checked against the manifest before publication.

The archive paths corresponding to the report's former ignored worktree links are:

- `issue334/phase-a/`: live examples, trace, fixtures and retained daemon logs.
- `issue334/phase-b/`: Builder 1 scripts, `REPORT.md`, trace, histories, snapshots,
  decoded logs and analysis tables.
- `issue334/phase-c/`: independent run, `builder2/REPORT.md`, histories, trace,
  decoded logs, analysis tables and initial-statistics reconstruction.
- `builder2-working-folder/`: the independent builder's supplied folder, scripts,
  copied skill, specification and outputs.
- `volume-exports/`: full stopped Docker volume exports, including WAL and SHM.
- `closure/`: BUG-002 failing regression, passing final checks, build identities,
  live SDK proof, unchanged Store totals and export restoration verification.

The original campaign has 512 SDK trace rows, including observers and internal
service rows; 97 are `fs.*` calls (A 51, B 31, C 15). The independent C workload
has 99 rows: 84 public calls and 15 internal service rows. Its 15 filesystem calls
are eight `fs.apply`, five `fs.read` and two `fs.write`; the apply calls contain
40 change entries. Ordinary filesystem activity inside Bash is below the SDK
method trace boundary and is not a per-syscall operation counter. Closure proof
has its own trace and is excluded from these original campaign counts.

## Stopped Store preservation

Each volume was exported only after its Sandbox owners had closed. Every export
was extracted to a temporary folder and opened read-only with WAL visible. The
exact product statistics query and formulas reproduced its original final totals;
the main database and WAL hashes remained unchanged. The verification receipt is
`closure/volume-restoration-verification.json` in the portable archive.

| Volume export | Bytes | SHA256 |
| --- | --- | --- |
| `layerfs-334-a-20261016.tar` | 3,409,920 | `1f1ac15a14579bc4cf10ab7dae65a2dac0ef4a5e80a9ce0f417691da323ff87d` |
| `layerfs-334-b-20261016.tar` | 10,147,840 | `0b04b7452aa22bb8e8d8128340a2bd29d7aba027408c9d0a5309fae8ac66dfa2` |
| `layerfs-334-c-20261016.tar` | 10,045,440 | `3ebd8864c236bdf3920a97573af739129aa5161b5182ef3522cd0ed7c43cc435` |

For inspection, extract an export into an empty working copy, preserve the
database and its WAL/SHM together, and use a read-only SQLite connection with
WAL processing enabled. Do not use SQLite's immutable option on this export:
it would ignore retained WAL contents. Product reopening requires the matching
recorded runtime/build and an independent writable volume. Select
Disposable/WAL/OFF explicitly and `LAYERFS_CONSTRUCTION_WORKERS=1`; Durable
remains `NOT_RUN — disabled by owner until explicit reauthorization`.
No claim of a production backup/recovery qualification is made by this diagnostic.

## Exact private originals and public projection

The exact original raw run and outside builder folder were archived before the
closure rebuild, with SDK links dereferenced, at the owner's local directory:
`/Users/yifanxu/LayerFS-evidence/issue334/20261016-closure-28eb06c8d/`.
Its `original-full-private.tar.gz` is 27,079,338 bytes, SHA256
`896c4ddd38a7754a3e59674d26f390f9edb31fbbed1b84ff91c87bae9ce6e6e5`.
All 820 regular members were hashed and verified. This private archive, the full
volume exports, rebuilt closure binaries and closure receipts remain outside the
managed worktree before its archival.

The public bundle omits 29 discovery/authority or compiled binary files. Exact
original binaries and local discovery material remain in the private archive;
build commands and artifact hashes remain public. Three diagnostic output files
have long opaque tokens redacted: Phase A `065-observe.out`, and B/C
`final-snapshot-final.json`. The manifest lists original and public hashes and
the redaction counts. No original file was edited. The source, traces, logs,
histories, analysis, Store exports and both reports retain reviewable evidence.

Two original collection deviations remain: C's initial statistics are a
read-only reconstruction from the unchanged sealed Init file, and one Phase A
group Sandbox's stderr log was not retained before removal. Publication and
checksums do not recreate that missing log or convert the reconstruction into a
contemporaneous operator capture. See [CLOSURE.md](CLOSURE.md).
