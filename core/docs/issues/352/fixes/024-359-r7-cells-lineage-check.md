# #359 · the R7 twelve-cell optimizations are in the current branch (check, no change)

| | |
| --- | --- |
| Trigger | Owner question, 2026-10-18: why the strong R7 C01–C12 results do not show in the #359 command costs |
| Kind | lineage and arithmetic check only. No product change, no new sample |
| Status | checked from source history and existing receipts |

## Lineage

These are ancestors of `issue359-impl` (`git merge-base --is-ancestor`):

- `5969ecaf8`, the source of the 2026-10-10 twelve-cell baseline
  (`core/docs/issues/307/TIMING-BASELINE-20261010.md`);
- `84323b47a`, the R7–R9 close pushed to `main`;
- `9d3f44e4d`, #321, one overlay per Workspace.

No R7 optimization was dropped from the branch.

## Why the cells looked good and the #359 commands do not

The cells and the #359 cases measure different work:

| | R7 cells C01–C12 | #359 cost cases |
| --- | --- | --- |
| Base | empty, or one 64 MiB file | committed tree, `node_modules` of about 40k files |
| Store reads per visited entry | none (all state is in the Workspace overlay) | about 5 reader requests, each about 1.1 statements after A1 |
| Scale | 100–1,000 entries | 7k directories, 40k–51k entries |
| Comparison | A2 ext4 passthrough, about the FUSE floor | native |

The per-kernel-request cost is unchanged between the two:

| Sample | Requests | Time | Per request |
| --- | ---: | ---: | ---: |
| C03 create + remove 1,000 files, 2026-10-10 baseline | 9,022 | 549.5 ms | 61 µs |
| cp-rm-nm / rm-created, A1 sample seq 293 | 203,109 | 12,026 ms | 59 µs |

So the R7 gains still hold. The #359 gap is the same per-request cost over far
more requests per command, plus Store reads per entry that the cells never
paid. That supports the #359 plan:

- fewer kernel requests per entry: negative entries (F-B4), the directory
  listing cache (D-9), batched FORGET (F-B3);
- cheaper requests: grouped overlay commits (D-1), orphan rows only while the
  kernel references the inode, maintenance off the request path (D-4);
- fewer Store reads per entry: A1, a per-directory facts window, the cache
  bound (D-2).

For `rm -rf` the arithmetic is about 5 requests per entry × 40k entries ×
60 µs. The about 3 s target therefore needs both fewer requests and a lower
per-request cost.

## Not done

The twelve cells were not re-run on the current binary. Their inputs still
exist:

- the prepared inputs `/tmp/layerfs-r7-*`;
- the R7 master volumes;
- `core/target/r7-iterate-cell.sh`, in the main checkout.

The masters were sealed on 2026-10-09, and the R7 runner predates #327 and
#352 F-020. A re-run may fail on format or route changes. It is proposed to
the owner as a one-sample regression check, together with the P passthrough
floor, and has not been run.
