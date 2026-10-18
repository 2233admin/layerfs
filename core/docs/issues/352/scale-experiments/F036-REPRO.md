# F-036 repro: concurrent first-install Commits, "object … is not stored"

Written 2026-10-18 by the #352 scale-experiments session. This note sits
beside `lww/`, not inside it, because the lead froze that folder.
Nothing was retried. The failing state is still live: container
`layerfs-issue352-scale-s4-b`, its mounted Workspace on `s4l-d` (Dirty, 256
uncommitted changes), and volume `layerfs-issue352-scale-s4`.

## Setup

- **Binaries:**
  - daemon `128a959c` (`core/target/issue352/daemon-128a959c/layerfs-daemon` in the main checkout);
  - Linux addon `74d08425` (`.../sdk-linux-74d08425/layerfs.node`);
  - Sandbox and runner image `sha256:d3773b4eac6a7a644887b17e36956cd1553786d47103f0170a3bb2b0ff6988de`;
  - `LAYERFS_CONSTRUCTION_WORKERS=1`;
  - Store `/layerfs-store/global/store.sqlite`, Disposable.
- **Runner:** container `layerfs-issue352-scale-runner`, started by `../run.sh <stage>`.
  - It runs `../s4.mjs`, with SDK JS from worktree `layerfs-352-scale` at `d3c7e1261`.
  - SDK Store calls run in the runner process (F-020).
- **pnpm store:** the crew's pnpm store volume, mounted read-only at `/pnpm-store`.
- **Install command:** `closure.mjs installCommand`.

## Base

1. **Snapshot:** `~/lfs-history/snapshots/range-014.json` (run p2-main-f, range 14, dsh `6e5c908a1`, 48,726,016 bytes). It was rebuilt with `snapshot.mjs rebuild` and copied into the new volume `layerfs-issue352-scale-s4`. The project record was copied from p2-main-f.
   - The Store had **no `node_modules` content**: range 14 is before the first install.
2. **Stage `lww-prep` (07:10:29Z):**
   - `branch.fork s4l-base` from main.
   - Then 9 × `fs.apply` (100 changes each) of `../r15-changes.json`, produced by `../gen-r15.mjs`: 19 mkdirs, then the 789 changes `6e5c908a1` → `b4ec4060a` (78 A, 704 M, 7 D), then `/.lww`.
   - `/.lww` is `../lww.txt` (27 lines, sha256 `1932f2d6…`, from `../gen-lww.mjs`). dsh has only the root `.gitignore` at `b4ec4060a`.
   - Final head: `125f72a132979e1c0e0a493325414da11767321451b6a6f79593593a2cbd281116`.
   - The tree was checked: 776 changed paths are byte-exact, the 13 that `fs.read` truncates match in size, and the 7 deletions are absent.

## Calls (stage `lww-play`, from `lww/trace-lww-play.jsonl`)

| Start (UTC) | ms | Call | Sandbox / daemon | Outcome |
| --- | --- | --- | --- | --- |
| 07:11:27.473 | 3 | `branch.fork s4l-c` from s4l-base | runner (in-process) | Forked |
| 07:11:27.479 | 0 | `branch.fork s4l-d` from s4l-base | runner | Forked |
| 07:11:27.480 | 607 | `sandbox.create a` | — | Ready |
| 07:11:28.088 | 551 | `sandbox.create b` | — | Ready |
| 07:11:28.640 | 15 | `sandbox.mount a s4l-base` (placeholder) | a | `/workspaces/1` |
| 07:11:28.656 | 8 | `sandbox.mount a s4l-c` | a | `/workspaces/2` |
| 07:11:28.665 | 10 | `sandbox.mount b s4l-d` | b | `/workspaces/1` |
| 07:11:28.675 | 16,481 | exec install in c | a | exit 0 |
| 07:11:28.675 | 16,487 | exec install in d | b | exit 0 |
| **07:11:45.165** | 25,364 | `sandbox.commit` c | **daemon in Sandbox a** | **Committed**: Commit `12602ebaeae7d493ede2d5877014d12203fe2268214fd4a8846feb7145582882cc`, parent `125f72a1…`, newCanonical 194,063,509, newStored 88,350,660, newMetadata 6,472,790 |
| **07:11:45.165** | 15,669 | `sandbox.commit` d | **daemon in Sandbox b** | **Failed**: "object e8775b327467431049f20b8e2fa215332c9f380ab02c13e79ac914560af7ea37 is not stored", detail `{phase: "Commit Construct"}` |
| 07:12:10.531 | 38 | unmount c | a | Unmounted |
| 07:12:10.570 | 642 | unmount d (no discard) | b | **Dirty**: 256 uncommitted changes; left mounted |
| 07:12:11.213 | 8 | unmount placeholder (discard) | a | Unmounted |

Both installs were the same `pnpm install --offline --frozen-lockfile` of
lockfile `4e0a2af9…`, so both Commits held the same new package content.
Both started in the same millisecond. d failed at +15.7 s, while c was still
constructing (c finished at +25.4 s).

## The failing object

- **Id:** `e8775b327467431049f20b8e2fa215332c9f380ab02c13e79ac914560af7ea37`.
- **Frozen copy of the Store.** At about 07:15Z, `store.sqlite`, `-wal` and `-shm` were copied together from the volume, mounted read-only, into `F036-store-copy/` (next to this note), with SHA256SUMS:
  - `store.sqlite`: 249,864,192 B, `229952039e55…`
  - `-wal`: 4,194,304 B, `9ad52415cc58…`
  - `-shm`: 32,768 B, `6607ac2a7fec…`
  - All three have mtime 07:12Z. The checksums still verify after the query. The query ran on a second copy (`F036-query-copy/`), which opening may have checkpointed.
- **`object_location` now (07:3xZ, on the query copy): present.**
  - `object_id E8775B32…EA37`, role 1, canonical_length 1,024, pack_id **45,942,259**, group 0, record 17.
  - Store totals: 452,011 `object_location` rows and 34,684 packs (max pack_id 45,943,223).
- **The base did not have it.** The range-14 snapshot, rebuilt into scratch, has no row for the object and ends at max pack_id 45,895,683 (30,549 packs). So the object was stored after the base. 4,135 packs are new:
  - small blocks of 3–5 packs, consistent with the `fs.apply` steps;
  - a block of 1,610 packs (45,936,641–45,938,250);
  - a block of 2,487 packs (45,940,737–45,943,223), **which holds the object**.
- **Which Commit stored it: not identifiable from the Store alone.** Pack rows carry no writer or Commit. The two large blocks fit one reservation range per concurrently constructing daemon, but which daemon owned which block is not recorded. So it is open whether c's Commit stored the object, or d's failed Commit left it behind.
- **The daemon logs** (`lww/daemon-a.log`, `lww/daemon-b.log`) have no line naming the object. Each has one `ConnectionFailure … UnexpectedEof` from the runner exiting.

## Contrast

S3 (`../play.log`) ran the same overlap of an install and a Commit on two
daemons with the same binaries, from a range-15 snapshot whose Store already
held the `node_modules` content (newStored 6.9 MB per Commit). Nothing failed
there. The difference here is that both Commits stored the same large set of
new objects at once.
