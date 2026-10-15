# Defects and deviations — #340

> **Status:** Current planning checklist; no release candidate exists.

The main agent keeps this ledger current from Phase A onward. Each entry keeps its
original evidence; later understanding is added, never rewritten.

## Categories

| Prefix | Category |
| --- | --- |
| `P-` | LayerFS product defect (daemon, Store, FUSE, SDK code) |
| `G-` | Skill or guidance gap |
| `T-` | Codex team mechanics (spawning, messaging, slots, handoffs) |
| `E-` | Environment correction before Init |
| `A-` | Application problem owned by the team, recorded only when it affected LayerFS evidence |

## Entry template

```
### <id> — <one-line symptom>

- Found: <phase/run, agent, step, time>
- Evidence: <paths to receipts, trace lines, daemon logs>
- Diagnosis: <root cause from source>
- Fix: <commit, production LOC before -> after (delta)>, or "none: <reason>"
- Regression: <test name and location>
- Verification: <what was rerun and its result>
- Effect on the run: <halt duration, Branches affected, run ended?>
```

## Entries

None yet.
