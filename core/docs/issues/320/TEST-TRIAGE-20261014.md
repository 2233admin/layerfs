# Separate test pass — issue #320

Status: in progress. Product source is 437cfd4aa. The prescribed Cargo 1.85.1
test --no-run --keep-going rejected its unsupported flag before compilation.
Equivalent build --all-targets --profile test --keep-going compiles test harnesses
without execution. Host completed in about 30 s; Linux hit its explicit 120 s
build wall stop and its container was removed. This is an incomplete build, not
a timed-out test. No test executed in either compilation. Retained JSON includes
all reported diagnostics; targets not reached on Linux remain a compile gap.

Counts below are error diagnostics attributed to the failing target file,
including errors in shared helpers. A zero means no error reported by that arm,
not proof that the incomplete Linux build reached that file.

| Test target file | Host errors | Linux errors | Triage |
| --- | ---: | ---: | --- |
| `core/crates/layerfs-api/sdk/tests/observed_control.rs` | 1 | 1 | Pending |
| `core/crates/layerfs-api/sdk/tests/sandbox_operations.rs` | 3 | 3 | Pending |
| `core/crates/layerfs-bridge/tests/control_golden.rs` | 17 | 17 | Delete: Internal wire snapshots/private setup shape; runtime control and forced mounted proofs remain. |
| `core/crates/layerfs-bridge/tests/control_records.rs` | 13 | 13 | Pending |
| `core/crates/layerfs-bridge/tests/daemon_records.rs` | 1 | 1 | Delete: Internal wire snapshots/private setup shape; runtime control and forced mounted proofs remain. |
| `core/crates/layerfs-bridge/tests/forced_records.rs` | 8 | 8 | Delete: Internal wire snapshots/private setup shape; runtime control and forced mounted proofs remain. |
| `core/crates/layerfs-daemon/tests/captured_commit.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-daemon/tests/captured_edge_retention.rs` | 4 | 4 | Pending |
| `core/crates/layerfs-daemon/tests/captured_lifecycle_admission.rs` | 10 | 10 | Pending |
| `core/crates/layerfs-daemon/tests/captured_namespace.rs` | 22 | 22 | Pending |
| `core/crates/layerfs-daemon/tests/captured_runs.rs` | 13 | 13 | Pending |
| `core/crates/layerfs-daemon/tests/cleanup_control.rs` | 6 | 6 | Delete: Former global resource observer/receipt routing; per-Workspace reclamation remains in mounted_cycles and terminal proofs. |
| `core/crates/layerfs-daemon/tests/cold_failure_scope.rs` | 24 | 24 | Pending |
| `core/crates/layerfs-daemon/tests/commit_record_anatomy.rs` | 8 | 8 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/commit_wall_anatomy.rs` | 15 | 15 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/complete_installed_roots.rs` | 2 | 2 | Pending |
| `core/crates/layerfs-daemon/tests/completion_ownership.rs` | 27 | 27 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/construction_cursor.rs` | 6 | 6 | Pending |
| `core/crates/layerfs-daemon/tests/device_capacity.rs` | 0 | 13 | Pending |
| `core/crates/layerfs-daemon/tests/direct_workspace.rs` | 8 | 8 | Pending |
| `core/crates/layerfs-daemon/tests/directory_cost.rs` | 20 | 20 | Delete: Internal visit/reader counts and envelope shape; mounted directory, install, read and rewind proofs cover behavior. |
| `core/crates/layerfs-daemon/tests/edit_backing.rs` | 15 | 15 | Pending |
| `core/crates/layerfs-daemon/tests/fenced_port.rs` | 34 | 34 | Pending |
| `core/crates/layerfs-daemon/tests/filesystem_port.rs` | 30 | 30 | Pending |
| `core/crates/layerfs-daemon/tests/forced_producers.rs` | 0 | 34 | Pending |
| `core/crates/layerfs-daemon/tests/forced_smoke.rs` | 0 | 23 | Pending |
| `core/crates/layerfs-daemon/tests/forced_unavailable.rs` | 0 | 19 | Pending |
| `core/crates/layerfs-daemon/tests/forced_unmount.rs` | 0 | 57 | Pending |
| `core/crates/layerfs-daemon/tests/fp21_detach_stages.rs` | 0 | 38 | Pending |
| `core/crates/layerfs-daemon/tests/fp27_reader_health.rs` | 0 | 29 | Pending |
| `core/crates/layerfs-daemon/tests/fp2_negotiation_flags.rs` | 0 | 19 | Pending |
| `core/crates/layerfs-daemon/tests/fp31_forget_underflow.rs` | 0 | 28 | Pending |
| `core/crates/layerfs-daemon/tests/host_handoff.rs` | 1 | 1 | Pending |
| `core/crates/layerfs-daemon/tests/indexed_operation_record.rs` | 13 | 13 | Pending |
| `core/crates/layerfs-daemon/tests/installed_qualification.rs` | 8 | 8 | Delete: Internal qualification traversal/job receipts; complete root and mounted install proofs remain. |
| `core/crates/layerfs-daemon/tests/installed_store.rs` | 7 | 7 | Pending |
| `core/crates/layerfs-daemon/tests/job_cost.rs` | 10 | 10 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/long_branch_session.rs` | 5 | 5 | Delete: Diagnostic cache/branch counts or timing; bounded cache pressure and mounted concurrent read semantics remain. |
| `core/crates/layerfs-daemon/tests/mount_debt.rs` | 10 | 10 | Delete: Retired owner scheduling/receipt debt mechanics; mounted Commit boundary, device capacity and terminal custody proofs remain. |
| `core/crates/layerfs-daemon/tests/mounted_commit.rs` | 0 | 19 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_commit_failures.rs` | 0 | 31 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_concurrency.rs` | 0 | 26 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_cycles.rs` | 0 | 24 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_drain.rs` | 0 | 26 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_execute.rs` | 0 | 16 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_failure_scope.rs` | 0 | 29 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_fusectl.rs` | 0 | 24 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_install.rs` | 0 | 22 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_links.rs` | 0 | 17 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_low_water.rs` | 0 | 23 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_parallel_commits.rs` | 0 | 16 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_patterns.rs` | 0 | 16 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_recognizer.rs` | 0 | 16 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_rewind.rs` | 0 | 17 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_serial_admission.rs` | 0 | 18 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_sqlite_full.rs` | 0 | 13 | Pending |
| `core/crates/layerfs-daemon/tests/mounted_store_read.rs` | 0 | 44 | Pending |
| `core/crates/layerfs-daemon/tests/multi_workspace_commits.rs` | 22 | 22 | Pending |
| `core/crates/layerfs-daemon/tests/native_application.rs` | 0 | 2 | Pending |
| `core/crates/layerfs-daemon/tests/native_coherence.rs` | 0 | 24 | Pending |
| `core/crates/layerfs-daemon/tests/native_control.rs` | 6 | 6 | Pending |
| `core/crates/layerfs-daemon/tests/native_custody.rs` | 0 | 24 | Pending |
| `core/crates/layerfs-daemon/tests/native_install.rs` | 1 | 1 | Pending |
| `core/crates/layerfs-daemon/tests/native_jobs.rs` | 19 | 19 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/native_mount.rs` | 0 | 26 | Pending |
| `core/crates/layerfs-daemon/tests/native_mount_routes.rs` | 0 | 21 | Pending |
| `core/crates/layerfs-daemon/tests/native_mutation.rs` | 0 | 18 | Pending |
| `core/crates/layerfs-daemon/tests/observed_application.rs` | 0 | 3 | Pending |
| `core/crates/layerfs-daemon/tests/owner.rs` | 52 | 52 | Delete: Retired owner scheduling/receipt debt mechanics; mounted Commit boundary, device capacity and terminal custody proofs remain. |
| `core/crates/layerfs-daemon/tests/piece_commit.rs` | 6 | 6 | Pending |
| `core/crates/layerfs-daemon/tests/product_commit.rs` | 17 | 17 | Pending |
| `core/crates/layerfs-daemon/tests/product_commit_cost.rs` | 17 | 17 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/product_commit_history_cost.rs` | 4 | 4 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/r4_2_topology_rows.rs` | 12 | 12 | Delete: Internal producer topology/error matrix; mounted Commit failures and captured construction custody coverage remain. |
| `core/crates/layerfs-daemon/tests/r4_9_driver_causes.rs` | 16 | 16 | Delete: Internal producer topology/error matrix; mounted Commit failures and captured construction custody coverage remain. |
| `core/crates/layerfs-daemon/tests/r5_10_producer_profile.rs` | 0 | 20 | Pending |
| `core/crates/layerfs-daemon/tests/r5_1_actual_daemon_commit.rs` | 0 | 19 | Pending |
| `core/crates/layerfs-daemon/tests/r5_5_install_survival.rs` | 0 | 19 | Pending |
| `core/crates/layerfs-daemon/tests/r5_6_failure_matrix.rs` | 0 | 41 | Pending |
| `core/crates/layerfs-daemon/tests/r5_9_dirty_mapping.rs` | 0 | 19 | Pending |
| `core/crates/layerfs-daemon/tests/read_cost.rs` | 20 | 20 | Delete: Internal visit/reader counts and envelope shape; mounted directory, install, read and rewind proofs cover behavior. |
| `core/crates/layerfs-daemon/tests/recognizer.rs` | 6 | 6 | Pending |
| `core/crates/layerfs-daemon/tests/recognizer_diagnostics.rs` | 8 | 8 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/recognizer_patterns.rs` | 7 | 7 | Pending |
| `core/crates/layerfs-daemon/tests/request_path_anatomy.rs` | 16 | 16 | Delete: Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain. |
| `core/crates/layerfs-daemon/tests/resources_observation.rs` | 21 | 23 | Delete: Former global resource observer/receipt routing; per-Workspace reclamation remains in mounted_cycles and terminal proofs. |
| `core/crates/layerfs-daemon/tests/root_qualification.rs` | 6 | 6 | Delete: Internal qualification traversal/job receipts; complete root and mounted install proofs remain. |
| `core/crates/layerfs-daemon/tests/shared_cache_branches.rs` | 7 | 7 | Delete: Diagnostic cache/branch counts or timing; bounded cache pressure and mounted concurrent read semantics remain. |
| `core/crates/layerfs-daemon/tests/shared_cache_pressure.rs` | 11 | 11 | Pending |
| `core/crates/layerfs-daemon/tests/shared_cache_replay.rs` | 8 | 8 | Delete: Diagnostic cache/branch counts or timing; bounded cache pressure and mounted concurrent read semantics remain. |
| `core/crates/layerfs-daemon/tests/shared_cache_seeding.rs` | 7 | 7 | Delete: Diagnostic cache/branch counts or timing; bounded cache pressure and mounted concurrent read semantics remain. |
| `core/crates/layerfs-daemon/tests/shared_processes.rs` | 6 | 6 | Pending |
| `core/crates/layerfs-daemon/tests/store_commit.rs` | 13 | 13 | Pending |
| `core/crates/layerfs-daemon/tests/store_read_drain.rs` | 26 | 26 | Delete: Removed shared scheduler lanes/grants/leases; mounted_store_read retains drain behavior and new reader lifecycle qualification is required. |
| `core/crates/layerfs-daemon/tests/store_read_service.rs` | 24 | 24 | Delete: Removed shared scheduler lanes/grants/leases; mounted_store_read retains drain behavior and new reader lifecycle qualification is required. |
| `core/crates/layerfs-daemon/tests/visit_port.rs` | 34 | 34 | Delete: Internal visit/reader counts and envelope shape; mounted directory, install, read and rewind proofs cover behavior. |
| `core/crates/layerfs-daemon/tests/workspace_databases.rs` | 7 | 7 | Pending |
| `core/crates/layerfs-fuse/tests/requests.rs` | 2 | 2 | Pending |
| `core/crates/layerfs-overlay/tests/accounting_reference.rs` | 11 | 11 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/captured_namespace.rs` | 33 | 33 | Pending |
| `core/crates/layerfs-overlay/tests/captured_runs.rs` | 32 | 32 | Pending |
| `core/crates/layerfs-overlay/tests/cleanup_observation.rs` | 17 | 17 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/close_custody.rs` | 22 | 22 | Pending |
| `core/crates/layerfs-overlay/tests/compound.rs` | 22 | 22 | Delete: Internal row composition/source SQL and counted work; captured semantic and mounted mutation/install coverage remain. |
| `core/crates/layerfs-overlay/tests/costs.rs` | 14 | 14 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/descriptor_request.rs` | 15 | 15 | Delete: Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs. |
| `core/crates/layerfs-overlay/tests/device_capacity.rs` | 0 | 20 | Pending |
| `core/crates/layerfs-overlay/tests/directory_links.rs` | 21 | 21 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/engine.rs` | 79 | 79 | Pending |
| `core/crates/layerfs-overlay/tests/forget_release.rs` | 14 | 14 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/frontier.rs` | 40 | 40 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/indexed_operation_record.rs` | 21 | 21 | Pending |
| `core/crates/layerfs-overlay/tests/indexed_operation_record_cursor.rs` | 8 | 8 | Pending |
| `core/crates/layerfs-overlay/tests/indexed_operation_record_fence.rs` | 20 | 20 | Pending |
| `core/crates/layerfs-overlay/tests/job_name_rows.rs` | 15 | 15 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/job_rows.rs` | 11 | 11 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/kernel_memory.rs` | 10 | 10 | Pending |
| `core/crates/layerfs-overlay/tests/lifetimes.rs` | 22 | 22 | Pending |
| `core/crates/layerfs-overlay/tests/native_directory.rs` | 56 | 56 | Delete: Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs. |
| `core/crates/layerfs-overlay/tests/native_lookup.rs` | 95 | 95 | Delete: Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs. |
| `core/crates/layerfs-overlay/tests/native_revocation.rs` | 12 | 12 | Delete: Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs. |
| `core/crates/layerfs-overlay/tests/native_visit_fence.rs` | 70 | 70 | Delete: Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs. |
| `core/crates/layerfs-overlay/tests/native_visit_row.rs` | 14 | 14 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/orphans.rs` | 77 | 77 | Pending |
| `core/crates/layerfs-overlay/tests/payload.rs` | 14 | 14 | Pending |
| `core/crates/layerfs-overlay/tests/payload_fragmentation.rs` | 4 | 4 | Pending |
| `core/crates/layerfs-overlay/tests/payload_runs.rs` | 20 | 20 | Pending |
| `core/crates/layerfs-overlay/tests/piece_lifetimes.rs` | 36 | 36 | Pending |
| `core/crates/layerfs-overlay/tests/pieces.rs` | 27 | 27 | Pending |
| `core/crates/layerfs-overlay/tests/reclaim_cost.rs` | 12 | 12 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/reply_tickets.rs` | 81 | 81 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/resources.rs` | 39 | 39 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/source.rs` | 22 | 22 | Delete: Internal row composition/source SQL and counted work; captured semantic and mounted mutation/install coverage remain. |
| `core/crates/layerfs-overlay/tests/template.rs` | 11 | 11 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/transactions.rs` | 23 | 23 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-overlay/tests/write_shapes.rs` | 6 | 6 | Delete: Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain. |
| `core/crates/layerfs-persistence/tests/acquisition_batching.rs` | 16 | 0 | Pending |
| `core/crates/layerfs-persistence/tests/acquisition_disposal.rs` | 5 | 0 | Pending |
| `core/crates/layerfs-persistence/tests/acquisition_reads.rs` | 5 | 0 | Pending |
| `core/crates/layerfs-persistence/tests/acquisition_units.rs` | 18 | 0 | Pending |
| `core/crates/layerfs-persistence/tests/space_reclamation.rs` | 4 | 0 | Pending |
| `core/crates/layerfs-persistence/tests/sqlite_group_rows.rs` | 1 | 1 | Pending |
| `core/crates/layerfs-project/tests/acquisition_custody.rs` | 19 | 19 | Pending |
| `core/crates/layerfs-project/tests/backed_acquisition.rs` | 19 | 19 | Pending |
| `core/crates/layerfs-project/tests/complete_root.rs` | 19 | 19 | Pending |
| `core/crates/layerfs-project/tests/init_memory.rs` | 19 | 19 | Pending |
| `core/crates/layerfs-project/tests/init_sqlite.rs` | 19 | 19 | Pending |
| `core/crates/layerfs-project/tests/namespace_scaling.rs` | 19 | 19 | Pending |
| `core/crates/layerfs-storage/tests/physical_formats.rs` | 10 | 10 | Pending |
| `core/crates/layerfs-storage/tests/selected_group_reads.rs` | 2 | 2 | Pending |
| `core/crates/layerfs-workspace/tests/base.rs` | 37 | 37 | Pending |
| `core/crates/layerfs-workspace/tests/captured_file_edits.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_cursor.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_custody.rs` | 10 | 10 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_fragments.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_holds.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_metadata.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_order.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_perturbed.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_rebound.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_namespace_states.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/captured_piece_edits.rs` | 8 | 8 | Pending |
| `core/crates/layerfs-workspace/tests/directory_links.rs` | 25 | 25 | Pending |
| `core/crates/layerfs-workspace/tests/directory_links_install.rs` | 10 | 10 | Pending |
| `core/crates/layerfs-workspace/tests/mutation_plan.rs` | 14 | 14 | Pending |
| `core/crates/layerfs-workspace/tests/namespace.rs` | 14 | 14 | Pending |
| `core/crates/layerfs-workspace/tests/namespace_daemon.rs` | 23 | 23 | Pending |
| `core/crates/layerfs-workspace/tests/namespace_profile.rs` | 5 | 5 | Delete: Counts produced by removed routing/job machinery; mounted mutation semantics remain. |
| `core/crates/layerfs-workspace/tests/namespace_view.rs` | 9 | 9 | Pending |
| `core/crates/layerfs-workspace/tests/native_data.rs` | 15 | 15 | Pending |
| `core/crates/layerfs-workspace/tests/native_directory.rs` | 26 | 26 | Pending |
| `core/crates/layerfs-workspace/tests/native_unlink_cost.rs` | 36 | 36 | Delete: Counts produced by removed routing/job machinery; mounted mutation semantics remain. |
| `core/crates/layerfs-workspace/tests/native_visit.rs` | 40 | 40 | Pending |
| `core/crates/layerfs-workspace/tests/native_visit_cost.rs` | 15 | 15 | Delete: Counts produced by removed routing/job machinery; mounted mutation semantics remain. |
| `core/crates/layerfs-workspace/tests/nonfile.rs` | 16 | 16 | Pending |
| `core/crates/layerfs-workspace/tests/operation_scope.rs` | 7 | 7 | Pending |
| `core/crates/layerfs-workspace/tests/payload.rs` | 10 | 10 | Pending |

## Deleted mechanism tests — first cut

Coverage given up: direct private wire snapshots, scheduler fairness/admission
ordering, job/receipt envelope layout, SQL plans/statement and row counts,
publication ticket bookkeeping and cache/timing anatomy. These are intentionally
not rebuilt around the new architecture. Required mounted behavioral proofs
remain; new reader lifecycle qualification remains pending.

- `core/crates/layerfs-bridge/tests/control_golden.rs` — Internal wire snapshots/private setup shape; runtime control and forced mounted proofs remain.
- `core/crates/layerfs-bridge/tests/forced_records.rs` — Internal wire snapshots/private setup shape; runtime control and forced mounted proofs remain.
- `core/crates/layerfs-bridge/tests/daemon_records.rs` — Internal wire snapshots/private setup shape; runtime control and forced mounted proofs remain.
- `core/crates/layerfs-daemon/tests/commit_record_anatomy.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/commit_wall_anatomy.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/completion_ownership.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/job_cost.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/native_jobs.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/product_commit_cost.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/product_commit_history_cost.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/request_path_anatomy.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/recognizer_diagnostics.rs` — Removed job/receipt mechanism and counted-work or timing anatomy; mounted behavior and harness suites remain.
- `core/crates/layerfs-daemon/tests/directory_cost.rs` — Internal visit/reader counts and envelope shape; mounted directory, install, read and rewind proofs cover behavior.
- `core/crates/layerfs-daemon/tests/read_cost.rs` — Internal visit/reader counts and envelope shape; mounted directory, install, read and rewind proofs cover behavior.
- `core/crates/layerfs-daemon/tests/visit_port.rs` — Internal visit/reader counts and envelope shape; mounted directory, install, read and rewind proofs cover behavior.
- `core/crates/layerfs-daemon/tests/store_read_service.rs` — Removed shared scheduler lanes/grants/leases; mounted_store_read retains drain behavior and new reader lifecycle qualification is required.
- `core/crates/layerfs-daemon/tests/store_read_drain.rs` — Removed shared scheduler lanes/grants/leases; mounted_store_read retains drain behavior and new reader lifecycle qualification is required.
- `core/crates/layerfs-daemon/tests/resources_observation.rs` — Former global resource observer/receipt routing; per-Workspace reclamation remains in mounted_cycles and terminal proofs.
- `core/crates/layerfs-daemon/tests/cleanup_control.rs` — Former global resource observer/receipt routing; per-Workspace reclamation remains in mounted_cycles and terminal proofs.
- `core/crates/layerfs-daemon/tests/installed_qualification.rs` — Internal qualification traversal/job receipts; complete root and mounted install proofs remain.
- `core/crates/layerfs-daemon/tests/root_qualification.rs` — Internal qualification traversal/job receipts; complete root and mounted install proofs remain.
- `core/crates/layerfs-daemon/tests/long_branch_session.rs` — Diagnostic cache/branch counts or timing; bounded cache pressure and mounted concurrent read semantics remain.
- `core/crates/layerfs-daemon/tests/shared_cache_branches.rs` — Diagnostic cache/branch counts or timing; bounded cache pressure and mounted concurrent read semantics remain.
- `core/crates/layerfs-daemon/tests/shared_cache_replay.rs` — Diagnostic cache/branch counts or timing; bounded cache pressure and mounted concurrent read semantics remain.
- `core/crates/layerfs-daemon/tests/shared_cache_seeding.rs` — Diagnostic cache/branch counts or timing; bounded cache pressure and mounted concurrent read semantics remain.
- `core/crates/layerfs-daemon/tests/r4_2_topology_rows.rs` — Internal producer topology/error matrix; mounted Commit failures and captured construction custody coverage remain.
- `core/crates/layerfs-daemon/tests/r4_9_driver_causes.rs` — Internal producer topology/error matrix; mounted Commit failures and captured construction custody coverage remain.
- `core/crates/layerfs-daemon/tests/owner.rs` — Retired owner scheduling/receipt debt mechanics; mounted Commit boundary, device capacity and terminal custody proofs remain.
- `core/crates/layerfs-daemon/tests/mount_debt.rs` — Retired owner scheduling/receipt debt mechanics; mounted Commit boundary, device capacity and terminal custody proofs remain.
- `core/crates/layerfs-overlay/tests/accounting_reference.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/cleanup_observation.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/costs.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/directory_links.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/forget_release.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/frontier.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/job_name_rows.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/job_rows.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/native_visit_row.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/reclaim_cost.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/reply_tickets.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/resources.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/template.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/transactions.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/write_shapes.rs` — Accounting rows, SQL/statement/fence shape or publication ticket internals; mounted semantic/custody/reclamation proofs remain.
- `core/crates/layerfs-overlay/tests/native_directory.rs` — Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs.
- `core/crates/layerfs-overlay/tests/native_lookup.rs` — Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs.
- `core/crates/layerfs-overlay/tests/native_revocation.rs` — Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs.
- `core/crates/layerfs-overlay/tests/native_visit_fence.rs` — Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs.
- `core/crates/layerfs-overlay/tests/descriptor_request.rs` — Kernel ownership/visit mechanics duplicate mounted rewind, install, custody, permission and drain proofs.
- `core/crates/layerfs-overlay/tests/compound.rs` — Internal row composition/source SQL and counted work; captured semantic and mounted mutation/install coverage remain.
- `core/crates/layerfs-overlay/tests/source.rs` — Internal row composition/source SQL and counted work; captured semantic and mounted mutation/install coverage remain.
- `core/crates/layerfs-workspace/tests/native_unlink_cost.rs` — Counts produced by removed routing/job machinery; mounted mutation semantics remain.
- `core/crates/layerfs-workspace/tests/native_visit_cost.rs` — Counts produced by removed routing/job machinery; mounted mutation semantics remain.
- `core/crates/layerfs-workspace/tests/namespace_profile.rs` — Counts produced by removed routing/job machinery; mounted mutation semantics remain.
