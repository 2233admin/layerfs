# #352 — Fix records

> **Status:** Current, kept by the fixer and the lead. One file per fix, written by
> the fixer before the rerun; BUGS.md and OPTIMIZATIONS.md keep one line each and
> link here.

Each optimize or stop finding that changes code gets one file:
`fixes/NNN-aK-<slug>.md`, where NNN is the range and K the attempt that tripped
the gate (`finding-NNN.aK.json`). A finding with several independent causes gets
one file per cause. A finding closed without a code change (for example a gate
attribution corrected with evidence) still gets a file, with the evidence in
place of the design change.

## Template

```markdown
# <Range NNN aK> · <one-line title>

| | |
| --- | --- |
| Trigger | gate check and value, from range-NNN.md |
| Playbook step | D0–D6 |
| Kind | code path · data written · Store format (SPEC §6) |
| Binaries | old daemon `<id>` → new daemon `<id>` |
| Commits | fix `<id>`, regression test `<path>` |
| Recovery | fork of snapshot `range-NNN`, rerun attempt K+1 |

## Old design
What the code did, where (file:line at the old commit), and why its cost grew
with the wrong variable. The counter that shows it.

## New design
What the code does now, where, and its intended bound (for example
"fork = O(1) in Branch count"). What it costs in storage, schema or complexity.

## Proof
The regression test and what it asserts (for example the counter is equal at
10 and 1,000 Branches).

## Performance, old vs new
Same snapshots, same cache state, one sample per case; each series labeled with
its binary.

| Probe / measure | Snapshot | Cache | Old | New | Change |
| --- | --- | --- | --- | --- | --- |

Counter exponents against depth (and tree size): before → after.

Storage, if touched: stored bytes before → after.

## Left open
```
