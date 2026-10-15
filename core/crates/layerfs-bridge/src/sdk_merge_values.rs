//! Byte-bounded merge diagnostics; omitted details never change merge semantics.
use crate::control_sdk::SdkValue;
use layerfs_content::merge::{Conflict, LwwDecision};

// Separate windows leave room for source identities, outcome and observation.
const WINDOW: usize = 16 * 1024;

fn spend(remaining: &mut usize, cost: usize) -> bool {
    match remaining.checked_sub(cost) {
        Some(next) => {
            *remaining = next;
            true
        }
        None => false,
    }
}

fn conflict_window(values: &[Conflict]) -> Vec<usize> {
    let mut remaining = WINDOW;
    let mut hunks = Vec::new();
    for conflict in values {
        if !spend(&mut remaining, conflict.path.len().saturating_add(256)) {
            break;
        }
        let mut count = 0;
        for hunk in &conflict.hunks {
            let cost = hunk
                .ours
                .iter()
                .chain(&hunk.theirs)
                .fold(96usize, |sum, line| {
                    sum.saturating_add(line.len().saturating_add(8))
                });
            if !spend(&mut remaining, cost) {
                break;
            }
            count += 1;
        }
        hunks.push(count);
    }
    hunks
}

/// Whether the byte window omitted any conflict paths. Individual records also
/// report `hunksOmitted` when their full marker text did not fit.
pub fn conflicts_truncated(values: &[Conflict]) -> bool {
    conflict_window(values).len() != values.len()
}

/// Conflict paths and bounded whole hunks. `blocks` always reports the original
/// block count, and `hunksOmitted` explicitly identifies incomplete hunk text.
pub fn conflicts(values: &[Conflict]) -> SdkValue {
    let lines = |lines: &[String]| SdkValue::List(lines.iter().map(SdkValue::text).collect());
    SdkValue::List(
        values
            .iter()
            .zip(conflict_window(values))
            .map(|(conflict, count)| {
                SdkValue::map([
                    ("path", SdkValue::text(&conflict.path)),
                    ("kind", SdkValue::text(conflict.kind.as_str())),
                    ("blocks", SdkValue::Int(conflict.hunks.len() as i64)),
                    (
                        "hunksOmitted",
                        SdkValue::Bool(count != conflict.hunks.len()),
                    ),
                    (
                        "hunks",
                        SdkValue::List(
                            conflict.hunks[..count]
                                .iter()
                                .map(|hunk| {
                                    SdkValue::map([
                                        ("line", SdkValue::Int(hunk.line as i64)),
                                        ("ours", lines(&hunk.ours)),
                                        ("theirs", lines(&hunk.theirs)),
                                    ])
                                })
                                .collect(),
                        ),
                    ),
                ])
            })
            .collect(),
    )
}

fn lww_count(values: &[LwwDecision]) -> usize {
    let mut remaining = WINDOW;
    values
        .iter()
        .take_while(|decision| {
            spend(
                &mut remaining,
                decision
                    .path
                    .len()
                    .saturating_add(decision.rule.len())
                    .saturating_add(96),
            )
        })
        .count()
}

/// Whether the byte window omitted any generated-path decisions.
pub fn lww_truncated(values: &[LwwDecision]) -> bool {
    lww_count(values) != values.len()
}

/// `.lww` decisions in one byte window. SDK results pair this list with
/// `lwwTruncated`; this bounds diagnostics, never the merge's total work.
pub fn lww(values: &[LwwDecision]) -> SdkValue {
    SdkValue::List(
        values[..lww_count(values)]
            .iter()
            .map(|decision| {
                SdkValue::map([
                    ("path", SdkValue::text(&decision.path)),
                    (
                        "kept",
                        SdkValue::text(if decision.kept_ours { "ours" } else { "theirs" }),
                    ),
                    ("deleted", SdkValue::Bool(decision.deleted)),
                    ("rule", SdkValue::text(&decision.rule)),
                ])
            })
            .collect(),
    )
}
