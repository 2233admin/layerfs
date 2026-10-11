//! Coalesced final changes, never chronological mutation replay or an edit Vec.
use super::{
    context,
    edges::Edges,
    owner::Facts,
    scan::Scan,
    script::Script,
    state::{change, encode, key, Shared, CONTEXT, EDITS},
};
use crate::{BaseView, OverlayCapturedRuns, OverlayOperationRecords};
use layerfs_content::{
    ContentError, ContentResult, Edit, EditRecordChange, EditRecordExpected, FileView,
};
use std::cell::Cell;

const BATCH: usize = 64;
struct Writer {
    changes: Vec<EditRecordChange>,
    count: usize,
}
impl Writer {
    fn flush<P: OverlayOperationRecords + ?Sized>(
        &mut self,
        shared: &Shared<'_, P>,
    ) -> ContentResult<()> {
        if !self.changes.is_empty() {
            let changes = std::mem::replace(&mut self.changes, Vec::with_capacity(BATCH));
            shared.borrow_mut().apply(changes)?;
        }
        Ok(())
    }
    fn push<P: OverlayOperationRecords + ?Sized>(
        &mut self,
        shared: &Shared<'_, P>,
        edit: Edit,
    ) -> ContentResult<()> {
        let number = u64::try_from(self.count).map_err(|_| ContentError::LengthOverflow)?;
        self.changes.push(change(EDITS, number, encode(edit)));
        self.count = self
            .count
            .checked_add(1)
            .ok_or(ContentError::LengthOverflow)?;
        if self.changes.len() == BATCH {
            self.flush(shared)?;
        }
        Ok(())
    }
}
pub(super) fn prepare<'a, P: OverlayCapturedRuns + OverlayOperationRecords + ?Sized>(
    provider: &'a P,
    shared: &Shared<'a, P>,
    facts: Facts,
    base: Option<&BaseView>,
    file: Option<&FileView>,
) -> ContentResult<(usize, Vec<u8>)> {
    let initial = context::encode(facts, 0, None)?;
    shared
        .borrow_mut()
        .apply(vec![change(CONTEXT, 0, initial.clone())])?;
    let mut scan = Scan::shapes(
        facts.reader,
        facts.serial,
        facts.final_size,
        facts.base_size,
    )?;
    let mut writer = Writer {
        changes: Vec::with_capacity(BATCH),
        count: 0,
    };
    let mut script = Script::new(facts.file_root.map(|root| root.to_bytes()), facts.base_size);
    let scripted = Cell::new(false);
    let mut edges = Edges::new(provider, shared, facts, base, file);
    let mut emit = |edit| match edges.trim(edit, scripted.get())? {
        Some(edit) => writer.push(shared, edit),
        None => Ok(()),
    };
    let mut at = 0;
    let surviving = facts.base_size.min(facts.final_size);
    // In a file without pieces, bytes beyond the surviving base are one
    // trailing insert whatever they hold; the construction source reads them
    // once and rejects an inherited one there, so this pass does not visit
    // them. A file with pieces is visited to its end: a piece there may name
    // base bytes that an earlier edit has not consumed.
    let mut limit = surviving;
    while at < limit {
        let span = scan.span(provider, shared, at, true)?;
        if scan.referenced() {
            scripted.set(true);
            limit = facts.final_size;
        }
        let end = span.end.min(limit);
        if end <= at {
            return Err(ContentError::InvalidRecord(
                "captured normalization progress",
            ));
        }
        script.span(end - at, span.origin, &mut emit)?;
        at = end;
    }
    let scripted = scan.referenced();
    if !scripted {
        script.overwrite(&mut emit)?;
    }
    script.finish(facts.final_size, &mut emit)?;
    writer.flush(shared)?;
    let sealed = context::encode(facts, writer.count, Some(scripted))?;
    shared.borrow_mut().apply(vec![EditRecordChange {
        key: key(CONTEXT, 0),
        expected: EditRecordExpected::ExactBytes(initial),
        value: Some(sealed.clone()),
    }])?;
    shared.borrow_mut().work.normalized_edits =
        u64::try_from(writer.count).map_err(|_| ContentError::LengthOverflow)?;
    Ok((writer.count, sealed))
}
