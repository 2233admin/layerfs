# Issue 320: native diagnostic of command launch (one-off)

> **Status:** Dated planning checkpoint; not release evidence or a product contract.
> A labelled diagnostic of 2026-10-13 under owner decision 2 of issue 320. It is
> not a harness arm, not a sample of a registered case and not a performance result.

## What ran

[`tools/native_diagnostic.py`](tools/native_diagnostic.py), once for each of two
cases. It takes the command bodies a sampled case retained (`command-N.sh`, in
order) and runs them against a plain directory: the case's prepared native source
copied into a fresh named volume of a container from the same pinned image, with
the sample's container profile (2 CPUs, 2 GiB, 256 processes) and command identity.
No LayerFS daemon runs, nothing is mounted and nothing is committed.

Each command is launched the way the SDK launches it: three requests to the
container engine, each on its own connection (create the exec, start it and read
its streams to the end, inspect it). Before the steps the same sequence launches
an empty program (`/bin/true`) and an empty shell 20 times each.

Limits: exit codes only (all 0); the resulting tree is not verified; one
observation on a shared 8-CPU, 4-GB container VM; the mounted numbers beside it
are the "before" samples at `196c70fba`, which are `INELIGIBLE` timing rows.
Raw output: [`native-diagnostic/`](native-diagnostic/).

## Result

Mean per command, in milliseconds.

| Run | Commands | Create | Start | Streams | Inspect | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Tier 1 case, mounted (LayerFS) | 100 | 2.16 | 1.72 | 69.40 | 2.47 | 76.16 |
| Tier 1 case, plain directory | 100 | 2.60 | 1.70 | 68.29 | 2.70 | 75.29 |
| History hotset 100, mounted (LayerFS) | 100 | 2.17 | 1.78 | 35.53 | 2.28 | 42.15 |
| History hotset 100, plain directory | 100 | 2.46 | 1.78 | 39.57 | 2.58 | 46.39 |
| Empty program, set 1 | 20 | 2.28 | 1.61 | 37.99 | 2.52 | 44.40 |
| Empty shell, set 1 | 20 | 2.25 | 1.63 | 31.36 | 2.44 | 37.68 |
| Empty program, set 2 | 20 | 2.35 | 1.65 | 35.58 | 2.49 | 42.07 |
| Empty shell, set 2 | 20 | 2.32 | 1.72 | 36.46 | 2.60 | 43.10 |

"Streams" runs from the engine's reply to Start until the command's output ends.
It holds the engine's own process start inside the container, the shells, the
writer and all filesystem work.

## What it shows

- **Launching anything costs 38 to 44 ms.** An empty program takes as long as a
  whole history step. About 6 ms of it is the three engine requests; the rest is
  the engine starting a process in the container.
- **The history step is launch.** 42.2 ms mounted against 46.4 ms on a plain
  directory and 38 to 44 ms for an empty launch. Its 7 filesystem requests a step
  are not visible in the time.
- **The tier 1 command is at its native floor.** 76.2 ms a step mounted against
  75.3 ms on a plain directory: 0.9 ms apart, inside the one-sample spread of
  about 10%. Launch is 50 to 58% of the step; the writer and its file work are
  the rest, on either filesystem.
- **Launch is more than half of the per-step command cost** in both cases. Under
  owner decision 1 this calls for a launcher proposal; no launcher is built here.
- **Command time of these two cases cannot be lowered by filesystem work.** What
  remains to optimize in them is Commit: 36.7 ms a Commit in the tier 1 case and
  8.2 ms in the history case.

## What it does not show

- Nothing about cases whose command is one long launch with many requests (the
  500 MiB prepend, the 25,000-file snapshot): their per-request cost was not
  compared with a plain directory.
- No split of the 32 to 38 ms the engine spends starting a process.
- No repeatability: each run is one observation.
