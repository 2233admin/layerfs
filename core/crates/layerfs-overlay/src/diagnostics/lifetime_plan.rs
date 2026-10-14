//! Strategy diagnostics of the exact indexed lifetime/custody statements.
use crate::{sql, Overlay, OverlayResult, Route, StatementKind};
impl Overlay {
    /// Actual production templates; counters of complete jobs remain separate.
    pub fn explain_lifetimes(&self, route: Route) -> OverlayResult<Vec<String>> {
        self.state(route)?;
        let mut plans = Vec::new();
        for (label, statement) in [
            ("operation", sql::OPERATION_CUSTODY),
            ("generation-held", sql::GENERATION_HELD),
        ] {
            plans.extend(self.query(
                StatementKind::Explain,
                &format!("EXPLAIN QUERY PLAN {statement}"),
                &[&1_i64],
                16,
                |r| Ok(format!("{label}: {}", r.get::<_, String>(3)?)),
            )?);
        }
        plans.extend(self.query(
            StatementKind::Explain,
            &format!("EXPLAIN QUERY PLAN {}", sql::OPERATION_FENCE),
            &[&route.incarnation.as_slice(), &1_i64],
            48,
            |r| Ok(format!("operation-fence: {}", r.get::<_, String>(3)?)),
        )?);
        Ok(plans)
    }
}
