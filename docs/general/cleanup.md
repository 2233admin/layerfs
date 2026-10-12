# Development workspace cleanup

> **Status:** Current general guide.

This guide covers development worktrees, build caches, agent logs, temporary test
files, benchmark payloads, and Docker resources. It applies when the user has
authorized cleanup. Authorization and the selected scope carry through the pass;
routine removal of confirmed disposable resources does not need repeated approval.

Follow [repository instructions](../../AGENTS.md), the owning campaign's evidence
requirements, and the [measurement workflow](agent-measurement-policy.md).
Preserve unrelated work and current execution ownership. Use filesystem and
runtime metadata to inspect resources; cleanup does not require starting product
tests, benchmarks, or Store sessions.

## 1. Define the pass and protect ongoing work

Create a fresh pass directory outside the tracked source tree. Record the user's
scope, requested free-space target and unit, start time, and protected resources.
Keep machine-specific paths, task identifiers, inventories, and results in that
directory. This guide describes the procedure and remains independent of a
particular cleanup pass.

Resolve active task or thread identifiers to actual working directories. An app's
worktree field may be empty even after an agent creates an isolated checkout;
cross-check task instructions, events, Git registrations, and the filesystem.
Read application metadata without editing its state.

Protect the active worktree and its dependencies, including:

- reference checkouts and untracked helper scripts;
- original input trees, inventories, prepared fixture masters, and sealed Stores;
- binaries and images selected for build or proof reuse;
- containers, volumes, mounts, open files, and measurement locks owned by current
  work.

Search current task instructions and harness defaults for dependency paths before
classifying an older directory as disposable. Keep resources whose ownership or
dependency role remains uncertain and continue with independently safe candidates.
Avoid cleanup I/O on measured inputs during an active measurement. Record known
interference and follow the owning campaign's isolation requirements.

## 2. Inventory space and ownership

Run read-only inspection first. From the repository root, useful commands are:

```sh
df -k /System/Volumes/Data
git worktree list --porcelain
git status --porcelain=v1
docker system df -v
docker ps -a
```

The filesystem command above is for macOS; select the actual data filesystem on
other hosts. Use focused `du` scans, per-worktree Git status, process and open-file
inspection, and container metadata as needed. Record running commands, bind
mounts, volume consumers, and source identities alongside allocation estimates.

Record free bytes and derive both units:

- GB = bytes / 1,000,000,000;
- GiB = bytes / 1,073,741,824.

Treat directory allocation as a candidate estimate. Shared files, APFS clones,
hard links, Docker virtual disks, and delayed reclamation can prevent directory
totals from matching recovered physical space. Report the observed change in
filesystem free bytes. Record concurrent builds or other writes that affect that
net change; do not attribute an unisolated change entirely to one removal.

## 3. Classify each candidate

| Resource | Required check | Permitted cleanup action |
| --- | --- | --- |
| Cargo dependency, incremental, build, and fingerprint caches | Outside protected targets; no current build or measurement uses them | Remove generated caches together as appropriate; keep required executables, scripts, locks, manifests, and records |
| Registered Git worktree | Local changes, unique commits, ignored helpers, active processes, and container binds | Preserve recovery refs and verified source/record backups before removal |
| Workspace copy without Git metadata | Ownership and complete contents | Archive complete source and useful records before removing generated payloads |
| Benchmark receipts, logs, and verdicts | Owning campaign and evidence requirements | Retain in place or in a verified archive when archival is within the authorized scope |
| Historical sample databases, exports, and payloads | Closed run, no current consumer, records preserved, disposal authorized | Remove selected payloads and record that they are unavailable for future proof reuse |
| Prepared fixture masters, inventories, sealed Stores, binaries, and images | Current task, harness defaults, source identities, and reuse records | Keep resources selected for ongoing work or qualifying reuse |
| Docker sample containers and volumes | Exact mapping to closed run records, current processes, consumers, and ownership | Stop and remove the identified resources after ownership is established |
| Inactive agent transcripts and text records | No writer; no pinned file identity or current allocation requirement | Prefer verified transparent compression where supported |
| Live application databases, WAL files, active logs, and session state | Owning application and current use | Preserve |
| Download, installer, browser, and package caches | Current consumers, installation activity, and supported pruning behavior | Remove unused staging files or prune through the appropriate installed tool |
| Personal files and application data | Explicit user-selected scope | Preserve during development cleanup unless the user selects them |

Age, a passing historical receipt, a clean Git status, or an ignored-file rule
alone does not establish that a resource is disposable. A running container may
be an abandoned sample daemon, but an idle process can also own useful mutable
state. Combine task ownership, closed-run records, volume mappings, and current
process/consumer inspection before deciding.

## 4. Preserve recovery state before removing a worktree

Record the original HEAD, branch or detached state, and Git status. Create a
valid recovery ref in the owning repository so an unmerged or detached commit
remains reachable. Preserve staged and unstaged binary patches, untracked source,
and useful ignored files. Inspect build directories for helper scripts, case
lists, journals, and measurement wrappers before treating their contents as cache.

For a copy without usable Git metadata, preserve complete source instead of
assuming a patch and an existing commit can recover it. For an independent
repository, ensure its required Git objects remain recoverable before removing
its object database.

Archive retained benchmark records and record the selected payload exclusions.
Verify archive contents against a manifest, including hashes for regular files
and targets for symlinks. Check that recovery refs resolve to the recorded commits.
An archive's existence or successful compression alone is insufficient.

Recheck local changes and current ownership immediately before removal. If work
changed during archival, preserve the new state before proceeding. Use Git's
worktree removal and pruning facilities for registered worktrees; prune stale
registrations only after confirming their working directories are gone.

## 5. Remove identified runtime and temporary resources

Use exact container, image, volume, and path identifiers from the inventory.
Reinspect current processes and consumers before acting. Protect newly created
resources even if they resemble an older selected run. Do not stop another
owner's current execution or unlink an active measurement lock.

For retired private mutable state selected for recovery, stop its owning daemon
before copying the complete volume. Verify the stopped-state backup before
removing the container and volume. Record the shutdown outcome and any uncertainty;
a partial copy of a live SQLite database does not establish a recoverable backup.

Inspect temporary test directories for ownership, age, open files, and current
task dependencies. Preserve useful records before removing selected test payloads.
Keep prepared masters and original inputs that current harnesses reference even
when they live under a temporary directory.

Prune caches using the appropriate installed tool and version where possible.
Inspect a failed launcher before choosing a corrected invocation; do not repair
unrelated application installations merely to finish a cleanup pass.

## 6. Preserve evidence meaning and accessible transcripts

Removing a historical payload does not change its original verdict. Record the
disposal in a separate cleanup ledger, with its original location and identity
where available. Mark deleted payloads and executable copies as unavailable for
new proof reuse. Preserve failed, ineligible, and unrun outcomes. Do not rewrite
or promote an original receipt after cleanup.

Transparent filesystem compression can reduce allocation while keeping text
records accessible at their existing paths. Confirm platform support first. For
each selected inactive file:

1. Capture its logical size, hash, allocation, and relevant metadata.
2. Write a compressed temporary copy and verify its logical bytes and hash.
3. Check that the original did not change during copying.
4. Replace it atomically only when the copy is verified and saves allocation.
5. Record the before/after allocation and preserved hash.

Preserve file location, ownership, mode, and modification time as required.
Inode, change time, and allocation can change during replacement; exclude files
whose identities or current measurement contracts require those properties.
Keep live databases, WAL files, active logs, measurement inputs, and fixture
masters out of this process.

## 7. Diagnose failures from the remaining state

Record the command, exit status, output, and remaining files or registrations.
Inspect what changed before selecting a corrective action. Do not automatically
retry a failed operation or assume it had no effect.

Git can partially remove files and delete a worktree registration before reporting
a filesystem failure. Determine whether the registration still exists before
choosing the next action. Any direct removal of leftover files requires verified
backups, the recorded recovery ref, and a fresh ownership check.

Read-only fixture directories can prevent deletion of their children. Adjust
owner permissions only within explicitly selected, backed-up disposable paths
after diagnosing the failure. Preserve inaccessible, immutable, or uncertain
remnants when safe removal is not established; record their paths and remaining
allocation where measurable.

## 8. Verify completion and write the report

Append progress and failures to the pass ledger. Write a fresh final report with:

- start and finish time, authorization, scope, target, and units;
- protected tasks, actual worktree paths, and required dependencies;
- free bytes before and after, GB/GiB values, and concurrent disk activity;
- removed paths and exact runtime identifiers, with disposal reasons;
- verified archives, manifests, recovery refs, and stopped-state backups;
- compression hashes and allocation changes;
- failures, partial removals, skipped resources, and remaining large resources;
- final Git state and checks that protected helpers and inputs remain present;
- explicit availability limits for deleted benchmark payloads and builds.

Reinspect the protected task's state and resources. Compare unrelated checkouts'
Git state with the initial inventory; distinguish their owners' concurrent changes
from cleanup changes. Measure final free space after removals have completed and
record the observation time, since ongoing builds can continue to consume space.

Stop after the authorized, confirmed disposable resources are cleared. Report
the achieved space and the remaining protected or uncertain resources. A disk
target guides the search; it does not expand authorization to remove needed
inputs, unrelated state, or personal data.

Follow the [documentation policy](documentation-policy.md) when maintaining this
guide. A documentation-only commit still needs the exact unchanged production
LOC comparison required by [repository instructions](../../AGENTS.md).
