#!/usr/bin/env bash
set -euo pipefail
# Frozen reliability primitives only; controller owns all fault/SDK/custody work.
if [[ $# -ne 2 ]]; then printf "%s\n" "usage: workload.sh verify-initial|read-corrupt ORIGINAL_CASE" >&2; exit 64; fi
action=$1
id=$2
case "$id" in
  workspace-corrupt-descendant-compact-v2-proof|workspace-missing-descendant-compact-v2-proof) ;;
  workspace-invalid-sdk-edit-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: Missing public SDK atomic file-range edit/rejection; ordinary pwrite beyond EOF extends a file, and a harness prevalidation rejection would not prove product rejection.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: Missing public SDK atomic file-range edit/rejection; ordinary pwrite beyond EOF extends a file, and a harness prevalidation rejection would not prove product rejection.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-invalid-namespace-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-lease-lifecycle-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: Current EndSession ends only Control session; no Workspace closes. Bound Workspace/Sandbox owners have explicit terminal unmount/stop, not the old Client-drop lease-release contract.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: Current EndSession ends only Control session; no Workspace closes. Bound Workspace/Sandbox owners have explicit terminal unmount/stop, not the old Client-drop lease-release contract.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-open-writer-busy-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-live-execution-busy-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-candidate-failure-retry-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: Current public SDK has no exact Candidate fault arming or hit-count receipt. Busy, transport loss or arbitrary IO failure cannot substitute for this production boundary.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: Current public SDK has no exact Candidate fault arming or hit-count receipt. Busy, transport loss or arbitrary IO failure cannot substitute for this production boundary.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-admission-batch-failure-retry-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: No public production later-admission fault/receipt interface, including exact once and early-transaction count.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: No public production later-admission fault/receipt interface, including exact once and early-transaction count.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-final-publication-failure-retry-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: No public exact final-publication fault injection or reachability receipt.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: No public exact final-publication fault injection or reachability receipt.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-published-presentation-failure-smoke-v3-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: Current public Commit returns typed publication/install custody, but no retired PresentationResume switch/status bit/recover_workspace_presentation API.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: Current public Commit returns typed publication/install custody, but no retired PresentationResume switch/status bit/recover_workspace_presentation API.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-dirty-end-discard-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: Current public terminal Unmount has no Clean-vs-Discard End mode or exact WorkspaceDirty rejection contract; EndSession closes no Workspace.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: Current public terminal Unmount has no Clean-vs-Discard End mode or exact WorkspaceDirty rejection contract; EndSession closes no Workspace.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-dirty-net-zero-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-short-spool-write-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: No public remote append fault arming/receipt, no exact retired spool_segment_bytes rollback counter; ordinary filesystem exhaustion or simulated user error cannot prove ambiguous owner append rollback.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: No public remote append fault arming/receipt, no exact retired spool_segment_bytes rollback counter; ordinary filesystem exhaustion or simulated user error cannot prove ambiguous owner append rollback.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-deferred-nospace-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: No public exact append NoSpace fault/reachability receipt or retired segment accounting; cannot replace with arbitrary quota/resource failure.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: No public exact append NoSpace fault/reachability receipt or retired segment accounting; cannot replace with arbitrary quota/resource failure.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-workload-cancel-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: Existing Docker ExecHandle.cancel explicitly refuses Unsupported; no public equivalent old per-Exec stop with qualified descendant termination. A separately qualified ordinary external executor may cover process semantics, but its existence is not a full frozen SDK receipt proof.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: Existing Docker ExecHandle.cancel explicitly refuses Unsupported; no public equivalent old per-Exec stop with qualified descendant termination. A separately qualified ordinary external executor may cover process semantics, but its existence is not a full frozen SDK receipt proof.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-dirty-runtime-disconnect-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: No verification_disconnect_workspace_execution API or original InfrastructureLost output-reader state; closing an attached stream does not terminate process/descendants or establish that state.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: No verification_disconnect_workspace_execution API or original InfrastructureLost output-reader state; closing an attached stream does not terminate process/descendants or establish that state.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-parallel-read-write-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-shared-path-contention-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-hardlink-alias-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-symlink-semantics-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-open-rename-unlink-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-metadata-chmod-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-metadata-mtime-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-metadata-xattr-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-exec-500-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-repeat-publication-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  workspace-sustained-600s-compact-v2-proof)
    reason='The original initial live proof unconditionally requires exact per-Workspace physical_spool_allocated_bytes and mutation-event physical_spool_peak_bytes as Some, observation_errors=0 and both <=2GiB. Current shared-overlay public accounting does not expose these physical axes; no sampled shared database size, logical count or lifetime peak substitutes. Additional original scope: Independent policy blocker: unchanged mandatory600s active duration cannot finish under owner120s whole invocation ceiling; released selected row is NOT_RUN_OPTIONAL/long_test_exclusion. This does not mean ordinary long execution is unsupported.'
    needs='Exact original-scope per-Workspace physical current/peak/error observability and a public proof interface are required. Adding that product observability feature is prohibited in this iteration. Additional requirements: Independent policy blocker: unchanged mandatory600s active duration cannot finish under owner120s whole invocation ceiling; released selected row is NOT_RUN_OPTIONAL/long_test_exclusion. This does not mean ordinary long execution is unsupported.'
    printf "%s\n" "not-applicable case=$id reason=$reason needs=$needs" >&2
    exit 3 ;;
  *) printf "%s\n" "unknown original reliability case: $id" >&2; exit 64 ;;
esac
root=${LAYERFS_WORKSPACE_ROOT:?controller-authenticated original mount directory required}
case "$root" in /*) ;; *) printf "%s\n" "absolute authenticated mount directory required" >&2; exit 64 ;; esac
cd -- "$root"
helper=${WORKLOAD_HELPER:-/code/writers/workload}
case "$action" in
  verify-initial) exec "$helper" workspace-reliability-verify "$id" initial 0 ;;
  read-corrupt) exec "$helper" workspace-reliability-workload "$id" read-corrupt 0 ;;
  *) printf "%s\n" "unsupported reliability action: $action" >&2; exit 64 ;;
esac
