# Issue #340 — Crew multi-agent team build

> **Status:** Archived; retained for historical evidence only.

Phase A and both qualifying Crew builds passed their full acceptance. Build 1
finished with **10,037 production LOC and 716 meaningful passing package tests**.
Independent Build 2-r3 finished with **10,005 production LOC and 624 meaningful
passing package tests**, with no LayerFS, SDK, skill or native-artifact change
during that run. Each build passed all 15 final acceptance gates, including
restart, browser interactions and a fresh Workspace remount.

The [final twelve-section report](RESULTS.md) records the actual topology,
operations, merges, failures, storage reconciliation, application outcomes and
limits. [BUGS.md](BUGS.md) retains original failures and later dispositions.
All figures are diagnostics with tracing enabled and unknown OS cache state;
the independently built applications are compared side by side without a
performance winner.

Issue [#340](https://github.com/Ephemeral-AI-Lab/layerfs/issues/340), collection
[#336](https://github.com/Ephemeral-AI-Lab/layerfs/issues/336), campaign
[PR #344](https://github.com/Ephemeral-AI-Lab/layerfs/pull/344).

| Document | Contents |
| --- | --- |
| [SPEC.md](SPEC.md) | Frozen application requirements |
| [TEAM.md](TEAM.md) | Team, Branch and step-loop contracts |
| [ROLLOUT.md](ROLLOUT.md) | Owner-approved campaign procedure |
| [REPORT.md](REPORT.md) | Required report sections |
| [PHASE-A-RESULTS.md](PHASE-A-RESULTS.md) | Passed environment/live gates and retained failures |
| [RESULTS.md](RESULTS.md) | Final application, SDK, storage and evidence results |
| [BUGS.md](BUGS.md) | Product fixes, application failures and protocol/evidence deviations |
| [FREEZE.json](FREEZE.json) | Selected revision4 inputs; prior revisions remain under `frozen/` |
| [Verbatim Build 2 report](verbatim/b2-r3/lead-REPORT.md) | Final lead outcome; full JSON and every worker note are linked from RESULTS |

The available capacity was four agents total, including root. The lead scheduled
the five logical worker roles in waves, with two workers at a time. Natural
same-Branch Commit merging occurred in both `work` and `insight`; Build 1 also
retains two real source-conflict resolutions. Build 2 recorded two merged
Commits, 30 Branch merges and 17 Added publications, with zero reported conflict
paths and eight generated-bundle newer-wins decisions. Clean textual merges did
not eliminate application integration failures; their original receipts and
repairs remain in the report.

Build 2-r1 failed its independence boundary and Build 2-r2 ended conservatively
over root input custody. Both attempts remain closed, exported and archived;
their outcomes were not relabelled. B2-r3 excluded one unused startup after an
external skill read and accepted a clean successor with zero contribution from
that startup. Its failed parent Busy close, overlapping create, observed terminal
effects and unknown physical termination time remain explicit.

Final terminal checks confirmed 2,796 primary trace/full-receipt joins, 305
balanced Workspace cycles, 19 selected Closed clients and zero users of the
current volume. Caller-local400 and the unused Busy cleanup are separate
exceptions. Both daemon streams precede every selected close. Verified stopped
Stores, complete raw archives, source hashes and the external support boundary
are indexed by the report. No further SDK calls or writes occur in sealed runs.

The global Store profile was explicitly Disposable / WAL / synchronous=OFF.
Durable execution is **NOT_RUN — disabled by owner until explicit
reauthorization**. Filesystem history is not a process checkpoint.

This document is frozen before the final support snapshot and publication
actions. The owner authorized the campaign push and PR merge after the checks.
The actual documentation commit, main merge, production-LOC comparisons and issue
disposition are retained in the final comments on #340/#336 and the external
publication SUPPLEMENT, avoiding a self-referential commit hash in this snapshot.
