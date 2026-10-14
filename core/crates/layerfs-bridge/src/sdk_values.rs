//! Values the SDK shows for history records and merge results, shared by the
//! daemon's SDK calls and the internal API so both encode them one way.
//!
//! Commits and Layers travel as the lowercase hex of their tagged identity.
use crate::control_sdk::SdkValue;
use layerfs_content::merge::{Conflict, LwwDecision};
use layerfs_history::{CommitRecord, CommitVia, LayerRecord, NodeId};

/// Lowercase hex of bytes.
pub fn hex(bytes: &[u8]) -> String {
    const DIGITS: &[u8; 16] = b"0123456789abcdef";
    bytes
        .iter()
        .flat_map(|byte| {
            [
                DIGITS[usize::from(byte >> 4)],
                DIGITS[usize::from(byte & 15)],
            ]
        })
        .map(char::from)
        .collect()
}

/// Bytes of lowercase or uppercase hex.
pub fn unhex(text: &str) -> Option<Vec<u8>> {
    if text.len() % 2 != 0 {
        return None;
    }
    (0..text.len())
        .step_by(2)
        .map(|at| u8::from_str_radix(text.get(at..at + 2)?, 16).ok())
        .collect()
}

/// A node's identity as text.
pub fn node_text(node: NodeId) -> String {
    hex(node.as_slice())
}

/// A short label for marker lines: the first six bytes after the tag.
pub fn short(node: NodeId) -> String {
    hex(&node.as_slice()[1..7])
}

/// How a Commit was made, as the SDK names it.
pub fn via(via: CommitVia) -> &'static str {
    match via {
        CommitVia::Workspace => "exec",
        CommitVia::Files => "fs",
        CommitVia::Merge => "merge",
    }
}

/// A Commit as the SDK shows it.
pub fn commit_value(record: &CommitRecord, branch: Option<&str>) -> SdkValue {
    let meta = &record.meta;
    SdkValue::map([
        ("id", SdkValue::text(hex(record.id.as_slice()))),
        ("branch", SdkValue::opt_text(branch)),
        (
            "parent",
            SdkValue::opt_text(record.parent.map(|id| hex(id.as_slice()))),
        ),
        (
            "secondParent",
            SdkValue::opt_text(record.second_parent.map(node_text)),
        ),
        ("base", SdkValue::text(hex(record.base_layer.as_slice()))),
        ("root", SdkValue::text(hex(record.root.as_bytes()))),
        ("via", SdkValue::text(via(meta.via))),
        ("agent", SdkValue::opt_text(meta.agent.clone())),
        ("call", SdkValue::opt_text(meta.call.clone())),
        (
            "mergedFrom",
            SdkValue::opt_text(meta.merged_from.map(|id| hex(id.as_slice()))),
        ),
        ("time", SdkValue::Int(meta.time_ms)),
    ])
}

/// A Layer as the SDK shows it.
pub fn layer_value(record: &LayerRecord, source_branch: Option<&str>) -> SdkValue {
    SdkValue::map([
        ("id", SdkValue::text(hex(record.id.as_slice()))),
        (
            "parent",
            SdkValue::opt_text(record.parent.map(|id| hex(id.as_slice()))),
        ),
        ("root", SdkValue::text(hex(record.root.as_bytes()))),
        ("sourceBranch", SdkValue::opt_text(source_branch)),
        (
            "sourceCommit",
            SdkValue::opt_text(record.source_commit.map(|id| hex(id.as_slice()))),
        ),
    ])
}

/// Conflicts with their hunks.
pub fn conflicts(values: &[Conflict]) -> SdkValue {
    let lines = |lines: &[String]| SdkValue::List(lines.iter().map(SdkValue::text).collect());
    SdkValue::List(
        values
            .iter()
            .map(|conflict| {
                SdkValue::map([
                    ("path", SdkValue::text(conflict.path.as_str())),
                    ("kind", SdkValue::text(conflict.kind.as_str())),
                    ("blocks", SdkValue::Int(conflict.hunks.len() as i64)),
                    (
                        "hunks",
                        SdkValue::List(
                            conflict
                                .hunks
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

/// `.lww` decisions, labelled with the kept side.
pub fn lww(values: &[LwwDecision]) -> SdkValue {
    SdkValue::List(
        values
            .iter()
            .map(|decision| {
                SdkValue::map([
                    ("path", SdkValue::text(decision.path.as_str())),
                    (
                        "kept",
                        SdkValue::text(if decision.kept_ours { "ours" } else { "theirs" }),
                    ),
                    ("deleted", SdkValue::Bool(decision.deleted)),
                    ("rule", SdkValue::text(decision.rule.as_str())),
                ])
            })
            .collect(),
    )
}
