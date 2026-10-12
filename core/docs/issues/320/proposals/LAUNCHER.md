# Issue 320 proposal P1: an in-container command launcher

> **Status:** Proposal for the owner; not selected, not built, not a contract.
> Written 2026-10-13 under owner decision 1 of issue 320, because launch is more
> than half of the per-step command cost. No code accompanies it.

## What was measured

From the [native diagnostic](../NATIVE-DIAGNOSTIC.md), one observation each:

| Launch through the container engine | Time a command |
| --- | ---: |
| Create the exec (one request, one connection) | 2.2 to 2.6 ms |
| Start it (one request, connection upgraded to the streams) | 1.6 to 1.8 ms |
| Engine starts the process in the container, until the streams end, for an empty program | 31 to 38 ms |
| Inspect the exit status (one request, one connection) | 2.3 to 2.7 ms |
| Whole launch of an empty program or shell | 38 to 44 ms |

A tier 1 step is 76 ms and a history step 42 ms, on LayerFS and on a plain
directory alike. The engine's process start is 40 to 50% of the first and
nearly all of the second. It was not split further.

## What is proposed

A small launcher process that the Sandbox starts once inside each container and
that starts commands on request, so a command no longer goes through the
engine's exec path.

- The Sandbox owns it, as it owns command launch today. The filesystem daemon
  still supervises no commands and gains no Exec registration.
- `WorkspaceApi::exec` keeps its meaning: the same program, arguments,
  environment, working directory, user and group; separate output and error
  streams delivered to the caller; the exit status; explicit cancellation by
  the caller. No timeout, implicit Commit or automatic unmount is added.
- One request starts one process. No kept-alive shell and no process pool: a
  command never inherits state from an earlier one.
- The engine path stays as the fallback only where the owner says so; a silent
  fallback would be an error-driven substitute.

## What the owner would decide

1. **Whether launch is in scope at all.** The issue's target is filesystem work
   per request and Commit. With no launcher, command time of the tier 1 and
   history cases stays where it is.
2. **Ownership.** Sandbox, or the external executor that already owns launch in
   the per-tool-call model.
3. **The contract.** A launcher is a new long-lived process in every container
   and a new channel into it: a public behaviour of the Sandbox, with its own
   identity, permission and failure rules.
4. **Privilege.** It must start commands as the Workspace user. Either it runs
   with the right to change user, or one launcher runs per user.
5. **Measurement.** Nothing started before the timer may reduce a measured
   step. A launcher is started with the container, so the harness contract
   would have to say whether its start is setup or measured.

## What is not known

- How much of the 31 to 38 ms a launcher removes. A process start inside a
  running container was not measured here; the first step of this proposal
  would be that one measurement, as a labelled diagnostic.
- The cost in the per-tool-call model, where a container may serve one command.
- Behaviour under cancellation and with descendants that outlive the command.

## What is done instead, without this proposal

Work continues on Commit and on per-request cost. One allowed item stays on the
candidate list: reusing one engine connection for the create and inspect
requests (about 2 ms of a command, no launcher).
