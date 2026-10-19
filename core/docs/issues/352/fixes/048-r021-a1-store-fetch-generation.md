# Range 021 a1 · the store lacked ranges 21–30's lockfile versions; cached oracles ignored the store

> **Status:** Current fix record. Harness and preparation fix in `dsh/tools/history`; no product change.

| | |
| --- | --- |
| Trigger | range-021.md a1: Node proofs, `r021-1-root.end` P1 and P2 stop ("exit 0, native 1") |
| Playbook step | D0 (oracle checked before the product) |
| Kind | none: preparation (the pnpm store) and the oracle cache key; daemon, addon and Store format unchanged |
| Binaries | daemon `44ac6c91` and addon `77597adb` unchanged |
| Commits | this commit: `nodeproof.mjs` (`storeGeneration` in `cachedOracle`'s key); test in `tests/p3.mjs` |
| Recovery | range 21 attempt 2, `p3-main-r`, a fork of `p3-main-p`'s r020 snapshot |

## What went wrong

- The plan's intermediate lockfile versions for ranges 21–30 had never been
  fetched into `layerfs-issue352-pnpm-store` (`fetch-store.mjs --versions`
  listed 74). The root lane's install at `r021-1-root.end` wrote one of them.
- Natively (network off) pnpm's supply-chain check could not reach the
  registry: `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, exit 1. In LayerFS's
  Sandbox the same install verified the lockfile online and passed. So the
  Sandboxes reach the registry during an install (an environment fact, not
  a LayerFS defect).
- After the fetch (74 versions, exit 0, 160 s) a re-judge of a1 on its
  retained state (`--rejudge "fix 048"`) left one difference: P2's second
  line. Native now reads the fetched verification ("verified <t> ago");
  LayerFS had verified online. The store at play time cannot be rebuilt, so
  a1 stays a stop and a2 replays on the fetched store.
- The native oracles' cache key named the tree, chain, tail and image, not
  the store: an oracle cached before the fetch would have been reused.

## Fix

- Every range's intermediate lockfile versions are fetched before its play
  (done for 21–30 in one batch; ledger entry 2026-10-19T19:50:10Z).
- `cachedOracle`'s key carries the store's generation (the count and time
  of the ledger's `pnpm-fetch` batches), so a fetch invalidates every cached
  native oracle.

## Result

a2 (`p3-main-r`): `r021-1-root.end` P1–P5 pass; all 5 points pass.

## Owner decision (2026-10-20)

Sandboxes may keep reaching the npm registry during an install: keep the
current behaviour. Nothing is changed for it; the store fetch above remains
what keeps the native oracle comparable.
