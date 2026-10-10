//! Plan/program of the actual metadata seek; physical I/O remains separate.
use crate::{
    db::integer, sql, CapturedRunCursor, Overlay, OverlayResult, StatementKind, CELL_BYTES,
    RUN_BYTES,
};

impl Overlay {
    /// Exact query plan and VM of captured-cell metadata discovery under the
    /// retained reader. Diagnostic preparation is separate from measured jobs.
    pub fn explain_captured_run(&self, cursor: CapturedRunCursor) -> OverlayResult<Vec<String>> {
        self.check_captured_reader(cursor.reader())?;
        let ns = cursor.reader().capture().route().ns;
        let serial = integer(cursor.serial())?;
        let generation = cursor.reader().capture().generation.number();
        let offset = integer(cursor.offset() - cursor.offset() % CELL_BYTES as u64)?;
        let after = integer(cursor.offset() - cursor.offset() % RUN_BYTES as u64)?;
        let size = integer(cursor.logical_size())?;
        let params: [&dyn rusqlite::ToSql; 6] = [&ns, &serial, &generation, &after, &size, &offset];
        let mut rows = self.query(
            StatementKind::Explain,
            &format!("EXPLAIN QUERY PLAN {}", sql::CAPTURED_CELL_METADATA),
            &params,
            40,
            |row| {
                Ok(format!(
                    "captured-cell-metadata: {}",
                    row.get::<_, String>(3)?
                ))
            },
        )?;
        rows.extend(self.query(
            StatementKind::Explain,
            &format!("EXPLAIN {}", sql::CAPTURED_CELL_METADATA),
            &params,
            40,
            |row| {
                Ok(format!(
                    "captured-cell-metadata-vm: {} {} {} {} {} {:?} {}",
                    row.get::<_, i64>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, i64>(2)?,
                    row.get::<_, i64>(3)?,
                    row.get::<_, i64>(4)?,
                    row.get::<_, Option<String>>(5)?,
                    row.get::<_, i64>(6)?
                ))
            },
        )?);
        Ok(rows)
    }
    /// Plans of the piece statements of a claimed write, a shrink and a
    /// layered read, at the active generation of an owned source. The insert
    /// has no plan row: its line is its VM program.
    pub fn explain_pieces(&self, source: crate::BaseSource) -> OverlayResult<Vec<String>> {
        let state = self.source_state(source)?;
        let (ns, gen, one) = (source.route().ns, state.active.0, 1_i64);
        let root: &[u8] = &[0; 32];
        let mut plans = Vec::new();
        for (label, statement, params) in [
            (
                "piece-cover",
                sql::PIECE_COVER,
                vec![&ns as &dyn rusqlite::ToSql, &gen, &one, &one],
            ),
            (
                "piece-window",
                sql::PIECE_WINDOW,
                vec![&ns, &gen, &one, &one, &one],
            ),
            (
                "piece-length",
                sql::PIECE_LENGTH,
                vec![&ns, &gen, &one, &one, &one],
            ),
            (
                "pieces-take",
                sql::PIECES_TAKE,
                vec![&ns, &gen, &one, &one, &one],
            ),
            ("piece-cut", sql::PIECE_CUT, vec![&ns, &gen, &one, &one]),
            (
                "layer-referenced",
                sql::LAYER_REFERENCED,
                vec![&ns, &one, &gen],
            ),
        ] {
            plans.extend(self.query(
                StatementKind::Explain,
                &format!("EXPLAIN QUERY PLAN {statement}"),
                &params,
                32,
                |row| Ok(format!("{label}: {}", row.get::<_, String>(3)?)),
            )?);
        }
        let put: [&dyn rusqlite::ToSql; 8] = [&ns, &gen, &one, &0_i64, &one, &0_i64, &root, &0_i64];
        plans.push(self.explain_program("piece-put", sql::PIECE_PUT, &put)?);
        Ok(plans)
    }
}
