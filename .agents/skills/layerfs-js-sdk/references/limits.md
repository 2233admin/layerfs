# Limits in 0.1.7

> **Status:** Current general guide. Part of the `layerfs-js-sdk` skill. Source of truth:
> the [SDK reference](../../../../sdk/js/README.md) and the
> [known limits](../../../../docs/versioned/0.1.7/sdk-and-ui.md#7-known-limits).

| Area | Limit | What it means for you |
| --- | --- | --- |
| `exec` duration | No timeout | Put `timeout 110` inside the command; keep each step under 2 minutes |
| `exec` output | First 1 MiB of stdout and of stderr kept; `truncated` beyond that | Redirect big output to `/tmp/x.log` and `tail` it in a second `exec` |
| `exec` and background jobs | `exec` waits until everything holding its output ends | Redirect a background process's output (`>/tmp/server.log 2>&1 &`) and stop it in the same command |
| Reads | At most 2000 lines and 48 KiB per `read`/`blame` answer; binary is `NotText` | Loop on `nextLine` |
| Pages | `pageSize` 1–1000, default 50; deep offsets skip linearly | Prefer narrower paths and patterns over deep paging |
| Messages | UTF-8, at most 4096 bytes; newline and tab allowed, other controls refused | Short, descriptive messages |
| Commit content | Everything in a Workspace is committed, including `node_modules`, caches and build output | Intended. Keep junk in `/tmp`, outside the Workspace |
| `main` | Changes only through `branch.publish` | `fs.*` on `main` is `ReadOnly` |
| Concurrency | One operation at a time per Sandbox in a process; discovery changes are locked across processes | Run step scripts one after another; parallel scripts get `Busy` |
| Restart recovery | None: if a daemon or container dies, its Sandbox and mounts are gone, and uncertain operations aren't replayed | Stop and report; don't try to recover or recreate state silently |
| Background processes | Through the internal operator only; a cancelled one can leave a zombie | Prefer start-probe-stop inside one `exec` |
| Per-file storage | Physical bytes per file are not reported | Use the Store totals and per-Commit counters |
| Store profile | Disposable only (WAL, `synchronous=OFF`); Durable is disabled | Nothing to choose |
