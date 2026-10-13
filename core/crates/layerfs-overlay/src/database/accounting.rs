//! Backed logical counts and real shared allocation observations.
use crate::{db::unsigned, AllocationState, Overlay, OverlayResult, Route, StatementKind};
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct StoredCounts {
    pub wait_refs: u64,
    pub namespaces: u64,
    pub inode_rows: u64,
    pub directory_entry_rows: u64,
    pub payload_cells: u64,
    pub payload_bytes: u64,
    pub shrink_rows: u64,
    /// Reference pieces: rows that name committed content and hold no bytes.
    pub reference_rows: u64,
    pub operation_record_rows: u64,
    pub operation_record_bytes: u64,
    pub orphan_rows: u64,
    pub owner_rows: u64,
    pub source_rows: u64,
    pub owner_details: u64,
    /// Pending reply tickets, held in the engine's memory.
    pub reply_tickets: u64,
    pub retire_targets: u64,
    pub maintenance_targets: u64,
    pub ready_targets: u64,
}
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct Resources {
    pub counts: StoredCounts,
    pub allocation: AllocationState,
    pub database_pages: u64,
    pub free_pages: u64,
    /// Declared logical bytes/metadata upper bound, not exclusive physical debt.
    pub debt_upper_bytes: u64,
}
const COUNTS: &str = "SELECT namespaces,inode_rows,directory_entry_rows,payload_cells,payload_bytes,shrink_rows,operation_record_rows,operation_record_bytes,orphan_rows,owner_rows,source_rows,owner_details,retire_targets,maintenance_targets,ready_targets,wait_refs,reference_rows FROM accounting WHERE ns=?1";
const TOTALS: &str = "SELECT ifnull(sum(namespaces),0),ifnull(sum(inode_rows),0),ifnull(sum(directory_entry_rows),0),ifnull(sum(payload_cells),0),ifnull(sum(payload_bytes),0),ifnull(sum(shrink_rows),0),ifnull(sum(operation_record_rows),0),ifnull(sum(operation_record_bytes),0),ifnull(sum(orphan_rows),0),ifnull(sum(owner_rows),0),ifnull(sum(source_rows),0),ifnull(sum(owner_details),0),ifnull(sum(retire_targets),0),ifnull(sum(maintenance_targets),0),ifnull(sum(ready_targets),0),ifnull(sum(wait_refs),0),ifnull(sum(reference_rows),0) FROM accounting WHERE ns>?1";
impl Overlay {
    /// None is the daemon aggregate; a route reads one namespace's exact counts.
    /// Page/file observations remain shared and never imply exclusive attribution.
    pub fn resources(&self, route: Option<Route>) -> OverlayResult<Resources> {
        self.available()?;
        let ns = if let Some(route) = route {
            self.state(route)?;
            route.namespace()
        } else {
            0
        };
        // The triggers write each namespace's own row. The aggregate is the
        // sum of those rows, one per namespace the engine still holds.
        let counts = self
            .query(
                StatementKind::Startup,
                if route.is_some() { COUNTS } else { TOTALS },
                &[&ns],
                8,
                |r| {
                    Ok(StoredCounts {
                        wait_refs: unsigned(r, 15)?,
                        namespaces: unsigned(r, 0)?,
                        inode_rows: unsigned(r, 1)?,
                        directory_entry_rows: unsigned(r, 2)?,
                        payload_cells: unsigned(r, 3)?,
                        payload_bytes: unsigned(r, 4)?,
                        shrink_rows: unsigned(r, 5)?,
                        reference_rows: unsigned(r, 16)?,
                        operation_record_rows: unsigned(r, 6)?,
                        operation_record_bytes: unsigned(r, 7)?,
                        orphan_rows: unsigned(r, 8)?,
                        owner_rows: unsigned(r, 9)?,
                        source_rows: unsigned(r, 10)?,
                        owner_details: unsigned(r, 11)?,
                        reply_tickets: 0,
                        retire_targets: unsigned(r, 12)?,
                        maintenance_targets: unsigned(r, 13)?,
                        ready_targets: unsigned(r, 14)?,
                    })
                },
            )?
            .pop()
            .unwrap_or_default();
        // Reply tickets are held in the engine's memory, not in a row.
        let counts = StoredCounts {
            reply_tickets: self.tickets.count(route.map(|route| route.namespace())),
            ..counts
        };
        let (database_pages, free_pages) = self.pages()?;
        let metadata = counts
            .namespaces
            .saturating_add(counts.inode_rows)
            .saturating_add(counts.directory_entry_rows)
            .saturating_add(counts.payload_cells)
            .saturating_add(counts.shrink_rows)
            .saturating_add(counts.reference_rows)
            .saturating_add(counts.operation_record_rows)
            .saturating_add(counts.orphan_rows)
            .saturating_add(counts.owner_rows)
            .saturating_add(counts.source_rows)
            .saturating_add(counts.owner_details)
            .saturating_add(counts.wait_refs)
            .saturating_add(counts.reply_tickets)
            .saturating_add(counts.retire_targets)
            .saturating_add(counts.maintenance_targets);
        let debt_upper_bytes = if counts.maintenance_targets + counts.retire_targets == 0 {
            0
        } else {
            counts
                .payload_bytes
                .saturating_add(counts.operation_record_bytes)
                .saturating_add(metadata.saturating_mul(1024))
        };
        Ok(Resources {
            counts,
            allocation: self.allocation()?,
            database_pages,
            free_pages,
            debt_upper_bytes,
        })
    }
    pub fn explain_accounting(&self) -> OverlayResult<Vec<String>> {
        let mut plans = Vec::new();
        for statement in [COUNTS, TOTALS] {
            plans.extend(self.query(
                StatementKind::Explain,
                &format!("EXPLAIN QUERY PLAN {statement}"),
                &[&0_i64],
                8,
                |r| r.get(3),
            )?);
        }
        Ok(plans)
    }
}

impl Resources {
    /// Adds disjoint connection snapshots. It is an aggregate observation,
    /// not an atomic cross-Workspace snapshot or exclusive freed-page claim.
    pub fn accumulate(&mut self, next: &Self) {
        self.counts.wait_refs = self.counts.wait_refs.saturating_add(next.counts.wait_refs);
        self.counts.namespaces = self
            .counts
            .namespaces
            .saturating_add(next.counts.namespaces);
        self.counts.inode_rows = self
            .counts
            .inode_rows
            .saturating_add(next.counts.inode_rows);
        self.counts.directory_entry_rows = self
            .counts
            .directory_entry_rows
            .saturating_add(next.counts.directory_entry_rows);
        self.counts.payload_cells = self
            .counts
            .payload_cells
            .saturating_add(next.counts.payload_cells);
        self.counts.payload_bytes = self
            .counts
            .payload_bytes
            .saturating_add(next.counts.payload_bytes);
        self.counts.shrink_rows = self
            .counts
            .shrink_rows
            .saturating_add(next.counts.shrink_rows);
        self.counts.reference_rows = self
            .counts
            .reference_rows
            .saturating_add(next.counts.reference_rows);
        self.counts.operation_record_rows = self
            .counts
            .operation_record_rows
            .saturating_add(next.counts.operation_record_rows);
        self.counts.operation_record_bytes = self
            .counts
            .operation_record_bytes
            .saturating_add(next.counts.operation_record_bytes);
        self.counts.orphan_rows = self
            .counts
            .orphan_rows
            .saturating_add(next.counts.orphan_rows);
        self.counts.owner_rows = self
            .counts
            .owner_rows
            .saturating_add(next.counts.owner_rows);
        self.counts.source_rows = self
            .counts
            .source_rows
            .saturating_add(next.counts.source_rows);
        self.counts.owner_details = self
            .counts
            .owner_details
            .saturating_add(next.counts.owner_details);
        self.counts.reply_tickets = self
            .counts
            .reply_tickets
            .saturating_add(next.counts.reply_tickets);
        self.counts.retire_targets = self
            .counts
            .retire_targets
            .saturating_add(next.counts.retire_targets);
        self.counts.maintenance_targets = self
            .counts
            .maintenance_targets
            .saturating_add(next.counts.maintenance_targets);
        self.counts.ready_targets = self
            .counts
            .ready_targets
            .saturating_add(next.counts.ready_targets);
        self.allocation.logical_bytes = self
            .allocation
            .logical_bytes
            .saturating_add(next.allocation.logical_bytes);
        self.allocation.allocated_bytes = self
            .allocation
            .allocated_bytes
            .saturating_add(next.allocation.allocated_bytes);
        self.allocation.high_water_allocated_bytes = self
            .allocation
            .high_water_allocated_bytes
            .saturating_add(next.allocation.high_water_allocated_bytes);
        self.allocation.reserved_tail_bytes = self
            .allocation
            .reserved_tail_bytes
            .saturating_add(next.allocation.reserved_tail_bytes);
        self.allocation.cleanup_headroom_bytes = self
            .allocation
            .cleanup_headroom_bytes
            .saturating_add(next.allocation.cleanup_headroom_bytes);
        self.allocation.work.accumulate(next.allocation.work);
        self.database_pages = self.database_pages.saturating_add(next.database_pages);
        self.free_pages = self.free_pages.saturating_add(next.free_pages);
        self.debt_upper_bytes = self.debt_upper_bytes.saturating_add(next.debt_upper_bytes);
    }
}
