# Daemon logs and observation records

> **Status:** Current general guide. Part of the `layerfs-sdk-observe` skill. The records,
> traced SDK calls requesting them and the decoder (#333) are on `main`.

## What the daemon writes

Each Sandbox daemon writes to its stderr, which Docker keeps as the container log. The
container identifier is the Sandbox id without `sb_`.

- **Failures:** a fatal startup cause, or a control-connection failure.
- **Observation records (tracing on):** for every traced control exchange,
  fixed-schema numeric records marked `"layerfs_observation":1`:
  - SQL work (statements, steps);
  - owner lock wait and hold times per job family;
  - Store reader and cache work;
  - FUSE kernel counters (Linux);
  - Workspace resources.

There is no general log level or logging framework.

## Decoding and joining

```bash
docker logs <container> > <run>/daemon-<container>.log 2>&1
# from the LayerFS checkout
python3 tools/decode_observations.py --trace <run>/trace.jsonl < <run>/daemon-<container>.log > <run>/daemon-<container>.jsonl
```

Each output line is one daemon call: `daemon`, `scope`, `call`, `operation`,
`complete`, the joined trace line's `id` as `trace`, and named `sections`. Unavailable
sections are `null`, never zero. Values are **cumulative** daemon counters at that call:
subtract the previous call's values to get per-call work.

Save the logs before closing a Sandbox: `sandbox.close` deletes the container and its
log.

## When a diagnostic write fails

If the daemon can't write its records, or the telemetry doesn't fit the reply, the trace
line's `daemon` entry carries `diagnosticError: { kind, message }`. With SDK tracing the
call's result and its connection are unaffected.
