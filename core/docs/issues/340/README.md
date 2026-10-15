# Issue #340 — Crew multi-agent team build

> **Status:** Current planning checklist; no release candidate exists.

Owner objective: a team of agents builds **Crew**, a Node.js team work tracker of at
least 10,000 production lines, in parallel through the LayerFS JavaScript SDK. The run
shows concurrent Workspaces on one Branch, parallel feature Branches, merge-time
conflict detection, `/.lww` rules for generated state and storage deduplication across
many `node_modules` trees. The workload is natural: merges and conflicts are recorded
as they happen, not planned.

Issue [#340](https://github.com/Ephemeral-AI-Lab/layerfs/issues/340), collection
[#336](https://github.com/Ephemeral-AI-Lab/layerfs/issues/336).

## Documents

| File | Contents |
| --- | --- |
| [SPEC.md](SPEC.md) | The application: stack, folder structure, features per lane, tests, full acceptance |
| [TEAM.md](TEAM.md) | Roles, Branches, worker step loop, messages, split of work, in-build rollout, integration, halts |
| [ROLLOUT.md](ROLLOUT.md) | The main agent's instructions for every phase |
| [REPORT.md](REPORT.md) | What `RESULTS.md` must contain |
| [BUGS.md](BUGS.md) | Defect and deviation ledger |

Phase A adds `ENVIRONMENT.json`, `DEPENDENCIES.md`, `LEAD-PROMPT.md`,
`WORKER-PROMPT.md`, the lane briefs, `ACCEPTANCE.md`, `count-loc.mjs` and
`FREEZE.json`. Phase D adds `RESULTS.md` and `tables/`.

## Team

| Agent | Codex slot | Lane |
| --- | --- | --- |
| Main agent | primary | all phases; LayerFS fixes in Build 1 |
| Team lead | 1 | skeleton, integration, acceptance |
| W1, W2 | 2 | `work` |
| I1, I2 | 2 | `insight` |
| P1 | 1 | `people` |

## Progress

- [ ] Phase 0: documents approved by owner.
- [ ] Phase A: environment pinned, team mechanics and LayerFS team load proved, inputs frozen.
- [ ] Build 1 complete with full acceptance.
- [ ] Product rebuilt; Build 2 standalone inputs frozen.
- [ ] Build 2 complete with full acceptance.
- [ ] Results, exports and issue updates ready for owner closure review.

Global Store: explicit Disposable / WAL / synchronous=OFF only. Durable:
**NOT_RUN — disabled by owner until explicit reauthorization**. All numerical
observations are diagnostic, not benchmarks. No push, PR or merge to main without
owner authorization.
