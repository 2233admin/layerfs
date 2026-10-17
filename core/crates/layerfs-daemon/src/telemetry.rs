//! Phase timing for SDK-traced observations.
//!
//! A traced request turns recording on for its own thread through a
//! [`Recording`] guard, which turns it off again on every exit, unwinding
//! included, so no later untraced request on that thread records. Product
//! roots call [`timed`]: untraced it is `Timing::disabled`, with no clocks or
//! nodes; traced it records and keeps the finished report for the reply.
//! Recording never changes an operation's result. A caller that drives
//! [`crate::control::Service`] directly can start a [`Recording`] around one
//! operation to get the same Commit and read phase reports.
use crate::control::{Failure, Success};
use layerfs_bridge::control::SdkValue;
use layerfs_persistence::SqlWork;
use layerfs_telemetry::timer::{
    Active, NodeOutcome, Timing, TimingNode, TimingReport, TimingScope,
};
use std::{
    cell::{Cell, RefCell},
    marker::PhantomData,
};

/// Most finished root reports one traced request keeps.
const REPORTS: usize = 16;
/// Most timing nodes one reply carries; the rest are counted as omitted.
const NODES: usize = 256;

thread_local! {
    static RECORDING: Cell<bool> = const { Cell::new(false) };
    static FINISHED: RefCell<Vec<TimingReport>> = const { RefCell::new(Vec::new()) };
}

/// Recording for one traced request on this thread, one at a time; dropping
/// it ends recording and discards what was not finished.
pub struct Recording {
    thread: PhantomData<*const ()>,
}
impl Recording {
    /// Starts recording this thread's timing roots.
    pub fn start() -> Self {
        FINISHED.with_borrow_mut(Vec::clear);
        RECORDING.set(true);
        Self {
            thread: PhantomData,
        }
    }
    /// The root reports finished while recording.
    pub fn finish(self) -> Vec<TimingReport> {
        FINISHED.with_borrow_mut(std::mem::take)
    }
}
impl Drop for Recording {
    fn drop(&mut self) {
        RECORDING.set(false);
        FINISHED.with_borrow_mut(Vec::clear);
    }
}

/// True while this thread serves a traced request.
pub fn recording() -> bool {
    RECORDING.get()
}

/// One timing root: recorded only while this thread is traced.
pub fn timed<T, E>(
    name: &'static str,
    operation: impl FnOnce(&TimingScope<'_, Active>) -> Result<T, E>,
) -> Result<T, E> {
    if !recording() {
        return Timing::disabled(name, operation).0;
    }
    let (result, report) = Timing::record(name, operation);
    FINISHED.with_borrow_mut(|finished| {
        if finished.len() < REPORTS {
            finished.push(report);
        }
    });
    result
}

/// One phase below `scope`. Roots finished inside it are attached beneath it.
pub fn phase<T, E>(
    scope: &TimingScope<'_, Active>,
    name: &'static str,
    operation: impl FnOnce() -> Result<T, E>,
) -> Result<T, E> {
    scope.child(name).run(|phase| {
        let mark = phase.is_recording().then(|| FINISHED.with_borrow(Vec::len));
        let result = operation();
        if let Some(mark) = mark {
            let inner =
                FINISHED.with_borrow_mut(|finished| finished.split_off(mark.min(finished.len())));
            inner
                .into_iter()
                .for_each(|report| phase.attach(Some(report)));
        }
        result
    })
}

/// The telemetry of one traced request: its timing, its Store SQL work, the
/// Workspace's kernel opcode counts when given, the Commit's storage
/// diagnostics and construction receipt when it committed, and the failed
/// diagnostic write, if any.
pub(crate) fn value(
    reports: Vec<TimingReport>,
    outcome: &Result<Success, Failure>,
    diagnostic: Option<&std::io::Error>,
    sql: Option<SdkValue>,
    fuse: Option<SdkValue>,
) -> SdkValue {
    let mut fields = vec![("timing".to_owned(), timing(&reports))];
    fields.extend(sql.map(|sql| ("sql".to_owned(), sql)));
    fields.extend(fuse.map(|fuse| ("fuse".to_owned(), fuse)));
    let (namespace, storage) = crate::application::commit_parts(outcome);
    if let Some(storage) = storage {
        fields.push((
            "storage".to_owned(),
            named(
                &STORAGE_FIELDS,
                &crate::application::storage_values(storage),
            ),
        ));
    }
    if let Some(work) = namespace.and_then(|namespace| namespace.work) {
        fields.push((
            "construction".to_owned(),
            named(
                &NAMESPACE_FIELDS,
                &crate::application::namespace_values(&work),
            ),
        ));
    }
    if let Some(error) = diagnostic {
        fields.push(("diagnosticError".to_owned(), error_value(error)));
    }
    SdkValue::Map(fields)
}

/// Store SQL sessions' totals: the writer's, and all readers' summed.
pub(crate) type SqlTotals = (Option<SqlWork>, Option<SqlWork>);

/// The call's SQL work: each session group's totals after the call minus
/// before it. Concurrent calls on the same sessions are included. A group
/// whose counters were unavailable at either end is left out; None when both are.
pub(crate) fn sql(before: SqlTotals, after: SqlTotals) -> Option<SdkValue> {
    let difference = |before: Option<SqlWork>, after: Option<SqlWork>| {
        let (before, after) = (sql_values(&before?), sql_values(&after?));
        let delta: Vec<u64> = after
            .iter()
            .zip(before)
            .map(|(after, before)| after.saturating_sub(before))
            .collect();
        Some(named(&SQL_FIELDS, &delta))
    };
    let fields: Vec<_> = [
        ("writer", difference(before.0, after.0)),
        ("readers", difference(before.1, after.1)),
    ]
    .into_iter()
    .filter_map(|(name, value)| Some((name.to_owned(), value?)))
    .collect();
    (!fields.is_empty()).then_some(SdkValue::Map(fields))
}

/// The scalar `SqlWork` counters, in `SQL_FIELDS` order (observation
/// sections 13 and 14 begin with them).
pub(crate) fn sql_values(w: &SqlWork) -> [u64; 27] {
    [
        w.statements,
        w.vm_steps,
        w.fullscan_steps,
        w.sorts,
        w.autoindex_rows,
        w.reprepares,
        w.returned_rows,
        w.bound_bytes,
        w.statement_ns,
        w.commit_ns,
        w.transactions,
        w.write_transactions,
        w.write_commits,
        w.commits,
        w.read_snapshots,
        w.rollbacks,
        w.transaction_ns,
        w.read_snapshot_ns,
        w.sealed_inserts,
        w.sealed_body_bytes,
        w.blob_open_calls,
        w.blob_reopen_calls,
        w.blob_read_calls,
        w.blob_requested_bytes,
        w.blob_read_bytes,
        w.blob_read_ns,
        w.blob_close_calls,
    ]
}

/// The Workspace's kernel opcode counts, frame dispositions and largest
/// request sizes since attach.
#[cfg(target_os = "linux")]
pub(crate) fn fuse(w: &layerfs_fuse::request::OpcodeWork) -> SdkValue {
    use layerfs_fuse::request::Opcode;
    let extra = [
        ("served", w.served),
        ("inline", w.inline),
        ("refused", w.refused),
        ("terminal", w.terminal),
        ("forget_units", w.forget_units),
        ("store_units", w.store_units),
        ("largest_read", w.largest_read),
        ("largest_write", w.largest_write),
    ];
    SdkValue::Map(
        Opcode::NAMES
            .iter()
            .copied()
            .zip(w.opcodes)
            .chain(extra)
            .map(|(name, value)| (name.to_owned(), SdkValue::Int(value as i64)))
            .collect(),
    )
}

/// Telemetry that did not fit the reply frame beside the reply.
pub(crate) fn oversized() -> SdkValue {
    SdkValue::map([(
        "diagnosticError",
        SdkValue::map([
            ("kind", SdkValue::text("Oversized")),
            (
                "message",
                SdkValue::text("telemetry does not fit the reply frame"),
            ),
        ]),
    )])
}

fn error_value(error: &std::io::Error) -> SdkValue {
    SdkValue::map([
        ("kind", SdkValue::text(format!("{:?}", error.kind()))),
        ("message", SdkValue::text(error.to_string())),
    ])
}

fn named(names: &[&str], values: &[u64]) -> SdkValue {
    SdkValue::Map(
        names
            .iter()
            .zip(values)
            .map(|(name, value)| ((*name).to_owned(), SdkValue::Int(*value as i64)))
            .collect(),
    )
}

/// Pre-order nodes `[name, parent, microseconds, outcome, incomplete]`;
/// parent is the index of an earlier node, -1 for a root. Over the bound the
/// shallowest levels are kept whole and the next level is filled in
/// pre-order, so top-level phases are never dropped for deep detail; the
/// rest is counted as omitted.
fn timing(reports: &[TimingReport]) -> SdkValue {
    let roots: Vec<&TimingNode> = reports.iter().filter_map(TimingReport::root).collect();
    let mut levels = Vec::new();
    roots.iter().for_each(|root| count(root, 0, &mut levels));
    let (mut whole, mut kept) = (0, 0);
    while whole < levels.len() && kept + levels[whole] <= NODES {
        kept += levels[whole];
        whole += 1;
    }
    let mut budget = NODES - kept;
    let mut nodes = Vec::new();
    for root in roots {
        flatten(root, -1, 0, whole, &mut budget, &mut nodes);
    }
    let omitted = levels.iter().sum::<usize>() - nodes.len();
    SdkValue::map([
        ("nodes", SdkValue::List(nodes)),
        ("omitted", SdkValue::Int(omitted as i64)),
    ])
}

fn count(node: &TimingNode, depth: usize, levels: &mut Vec<usize>) {
    if levels.len() == depth {
        levels.push(0);
    }
    levels[depth] += 1;
    node.children()
        .iter()
        .for_each(|child| count(child, depth + 1, levels));
}

/// Emits `node` and its kept descendants: every level above `whole`, and
/// `budget` nodes of level `whole`.
fn flatten(
    node: &TimingNode,
    parent: i64,
    depth: usize,
    whole: usize,
    budget: &mut usize,
    nodes: &mut Vec<SdkValue>,
) {
    if depth > whole || (depth == whole && *budget == 0) {
        return;
    }
    if depth == whole {
        *budget -= 1;
    }
    let index = nodes.len() as i64;
    let outcome = match node.outcome() {
        NodeOutcome::Ok => "ok",
        NodeOutcome::Error => "error",
        NodeOutcome::Unknown => "unknown",
    };
    nodes.push(SdkValue::List(vec![
        SdkValue::text(node.name()),
        SdkValue::Int(parent),
        SdkValue::Int(i64::try_from(node.elapsed().as_micros()).unwrap_or(i64::MAX)),
        SdkValue::text(outcome),
        SdkValue::Bool(node.is_incomplete()),
    ]));
    for child in node.children() {
        flatten(child, index, depth + 1, whole, budget, nodes);
    }
}

/// The scalar Store SQL work counters, `SqlWork` names.
pub(crate) const SQL_FIELDS: [&str; 27] = [
    "statements",
    "vm_steps",
    "fullscan_steps",
    "sorts",
    "autoindex_rows",
    "reprepares",
    "returned_rows",
    "bound_bytes",
    "statement_ns",
    "commit_ns",
    "transactions",
    "write_transactions",
    "write_commits",
    "commits",
    "read_snapshots",
    "rollbacks",
    "transaction_ns",
    "read_snapshot_ns",
    "sealed_inserts",
    "sealed_body_bytes",
    "blob_open_calls",
    "blob_reopen_calls",
    "blob_read_calls",
    "blob_requested_bytes",
    "blob_read_bytes",
    "blob_read_ns",
    "blob_close_calls",
];

/// The Commit storage diagnostics, in observation section 16 order.
pub(crate) const STORAGE_FIELDS: [&str; 42] = [
    "policy",
    "locate",
    "read_packs",
    "read_pack_selections",
    "whole_selected",
    "whole_due_density",
    "whole_due_singleton",
    "whole_due_small",
    "whole_due_reuse",
    "range_selected",
    "range_scan_bytes",
    "range_acquired_bytes",
    "range_materialized_bytes",
    "value_groups",
    "signatures",
    "reserve",
    "initial_reservations",
    "reservation_refills",
    "publish",
    "payload_reads",
    "payload_read_bytes",
    "pack_read_bytes",
    "pack_write_bytes",
    "pooled_packs",
    "pooled_groups",
    "reserved_directory_bytes",
    "ordinal_reservations",
    "locator_hits",
    "locator_misses",
    "locator_evictions",
    "locator_eviction_probes",
    "locator_second_chances",
    "locator_bookkeeping_live_peak_bytes",
    "pack_hits",
    "pack_misses",
    "pack_evictions",
    "pack_evicted_bytes",
    "directory_validations",
    "directory_unshared_walks",
    "directory_entry_bounds",
    "prefetch_group_decodes",
    "forced_seals",
];

/// The Commit captured namespace work, in observation section 15 order.
pub(crate) const NAMESPACE_FIELDS: [&str; 31] = [
    "inode_rows",
    "entry_rows",
    "inode_pages",
    "entry_pages",
    "change_pages",
    "largest_page",
    "parent_points",
    "base_lookups",
    "headers_written",
    "headers_dropped",
    "values_written",
    "fresh_serials",
    "tombstones_skipped",
    "files_constructed",
    "files_unchanged",
    "symlinks",
    "metadata_built",
    "metadata_patched",
    "record_jobs",
    "header_opens",
    "header_rows",
    "header_points",
    "change_opens",
    "change_rows",
    "change_points",
    "value_opens",
    "value_rows",
    "value_points",
    "fresh_opens",
    "fresh_rows",
    "fresh_points",
];
