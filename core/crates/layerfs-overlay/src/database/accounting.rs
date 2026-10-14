//! Backed logical counts and real shared allocation observations.
use crate::{db::unsigned, AllocationState, Overlay, OverlayResult, Route, StatementKind};
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct StoredCounts {
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
    pub owner_rows: u64,
    pub source_rows: u64,
    pub owner_details: u64,
    /// Pending reply tickets, held in the engine's memory.
    pub reply_tickets: u64,
    pub maintenance_targets: u64,
    pub ready_targets: u64,
}
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct Resources {
    pub counts: StoredCounts,
    pub open: crate::OpenStateCounts,
    pub allocation: AllocationState,
    pub database_pages: u64,
    pub free_pages: u64,
    /// Declared logical bytes/metadata upper bound, not exclusive physical debt.
    pub debt_upper_bytes: u64,
}
const COUNTS: &str = "SELECT namespaces,inode_rows,directory_entry_rows,payload_cells,payload_bytes,shrink_rows,operation_record_rows,operation_record_bytes,owner_rows,source_rows,owner_details,maintenance_targets,ready_targets,reference_rows FROM accounting WHERE id=1";
impl Overlay {
    /// The exact counts of this database's Workspace; a route also checks it.
    /// Page/file observations remain shared and never imply exclusive attribution.
    pub fn resources(&self, route: Option<Route>) -> OverlayResult<Resources> {
        self.available()?;
        if let Some(route) = route {
            self.state(route)?;
        }
        // The triggers write the one row of this database's Workspace; the
        // daemon sums the rows of its Workspace files where it reads them.
        let counts = self
            .query(StatementKind::Startup, COUNTS, &[], 8, |r| {
                Ok(StoredCounts {
                    namespaces: unsigned(r, 0)?,
                    inode_rows: unsigned(r, 1)?,
                    directory_entry_rows: unsigned(r, 2)?,
                    payload_cells: unsigned(r, 3)?,
                    payload_bytes: unsigned(r, 4)?,
                    shrink_rows: unsigned(r, 5)?,
                    reference_rows: unsigned(r, 13)?,
                    operation_record_rows: unsigned(r, 6)?,
                    operation_record_bytes: unsigned(r, 7)?,
                    owner_rows: unsigned(r, 8)?,
                    source_rows: unsigned(r, 9)?,
                    owner_details: unsigned(r, 10)?,
                    reply_tickets: 0,
                    maintenance_targets: unsigned(r, 11)?,
                    ready_targets: unsigned(r, 12)?,
                })
            })?
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
            .saturating_add(counts.owner_rows)
            .saturating_add(counts.source_rows)
            .saturating_add(counts.owner_details)
            .saturating_add(counts.reply_tickets)
            .saturating_add(counts.maintenance_targets);
        let debt_upper_bytes = if counts.maintenance_targets == 0 {
            0
        } else {
            counts
                .payload_bytes
                .saturating_add(counts.operation_record_bytes)
                .saturating_add(metadata.saturating_mul(1024))
        };
        Ok(Resources {
            counts,
            open: self.open.borrow().snapshot(),
            allocation: self.allocation()?,
            database_pages,
            free_pages,
            debt_upper_bytes,
        })
    }
    pub fn explain_accounting(&self) -> OverlayResult<Vec<String>> {
        self.query(
            StatementKind::Explain,
            &format!("EXPLAIN QUERY PLAN {COUNTS}"),
            &[],
            8,
            |r| r.get(3),
        )
    }
}

impl Resources {
    /// Adds disjoint connection snapshots. It is an aggregate observation,
    /// not an atomic cross-Workspace snapshot or exclusive freed-page claim.
    pub fn accumulate(&mut self, next: &Self) {
        self.open.accumulate(next.open);
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
