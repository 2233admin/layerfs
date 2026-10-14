//! Merge results as SDK values.
use layerfs_bridge::control::SdkValue;
use layerfs_content::merge::{Conflict, LwwDecision};

/// Conflicts with their hunks.
pub(crate) fn conflicts(values: &[Conflict]) -> SdkValue {
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
pub(crate) fn lww(values: &[LwwDecision]) -> SdkValue {
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
