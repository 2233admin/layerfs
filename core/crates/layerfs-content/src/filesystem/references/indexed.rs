//! Direct fixed reference rows, fresh membership and touched witnesses.
use super::indexed_window::{Step, Window};
use super::{indexed_wire as wire, meaning, record::Row, reduce::ReferenceWork};
use crate::filesystem::{
    rows::view::OperationInput,
    state::{DroppedParents, SerialState},
};
use crate::object::inode_leaf::InodeValue;
use crate::{ConstructionRecordChange, ContentError, ContentResult};

/// Rows one job of a touched-row pass reads: three records each, inside the
/// 64 keys of one read job.
pub(super) const PASS_ROWS: usize = 21;

pub(super) struct IndexedReducer<'s, 'b> {
    pub state: &'s SerialState<'b>,
    input: &'s dyn OperationInput,
    dropped: &'s dyn DroppedParents,
    pub work: ReferenceWork,
    pub touched: u64,
    pub(super) window: Window,
}
pub(super) struct Transition {
    pub before: Row,
    pub row: Row,
    pub changes: Vec<ConstructionRecordChange>,
    created: bool,
}
impl<'s, 'b> IndexedReducer<'s, 'b> {
    pub fn new(
        state: &'s SerialState<'b>,
        input: &'s dyn OperationInput,
        dropped: &'s dyn DroppedParents,
    ) -> Self {
        Self {
            state,
            input,
            dropped,
            work: ReferenceWork::default(),
            touched: 0,
            window: Window::default(),
        }
    }
    pub fn declare_new(&mut self, serial: u64) -> ContentResult<()> {
        if serial == 0 || !self.input.is_new(serial)? || self.dropped.contains(serial)? {
            return Err(ContentError::InvalidRecord("filesystem fresh declaration"));
        }
        self.defer(serial, Step::Declare)
    }
    /// Whether the input declares the serial fresh in the result.
    pub(super) fn expected(&self, serial: u64) -> ContentResult<bool> {
        Ok(self.input.is_new(serial)? && !self.dropped.contains(serial)?)
    }
    /// A stored row is only read once every held meaning is written.
    fn settled(&self) -> ContentResult<()> {
        if self.window.is_empty() {
            Ok(())
        } else {
            Err(ContentError::InvalidRecord("filesystem reference window"))
        }
    }
    /// The fresh member, the row and the touched witness of one serial, read
    /// as one job, and whether the serial is fresh. The three are checked in
    /// the order they were once read in.
    #[allow(clippy::type_complexity)]
    fn stored(&self, serial: u64) -> ContentResult<(bool, Option<Vec<u8>>, Option<Vec<u8>>)> {
        self.settled()?;
        let expected = self.expected(serial)?;
        let [member, row, touch] = self
            .state
            .read_kinds([wire::FRESH, wire::ROW, wire::TOUCH], serial)?;
        self.fresh(expected, member.as_deref())?;
        Ok((expected, row, touch))
    }
    /// Checks one serial's fresh member against what the input declares.
    pub(super) fn fresh(&self, expected: bool, member: Option<&[u8]>) -> ContentResult<()> {
        if let Some(bytes) = member {
            wire::membership(bytes)?;
        }
        if expected != member.is_some() {
            return Err(ContentError::InvalidRecord("filesystem fresh membership"));
        }
        Ok(())
    }
    pub fn row(&self, serial: u64) -> ContentResult<Option<Row>> {
        let (fresh, raw, touch) = self.stored(serial)?;
        self.decoded(serial, fresh, raw.as_deref(), touch.as_deref())
    }
    /// The required rows of at most [`PASS_ROWS`] serials, their three records
    /// each read in one job. Every row is checked as `row` checks one, in the
    /// order of `serials`.
    pub fn required_many(&self, serials: &[u64]) -> ContentResult<Vec<Row>> {
        self.settled()?;
        if serials.len() > PASS_ROWS {
            return Err(ContentError::InvalidRecord("filesystem touched window"));
        }
        let mut keys = [wire::key(wire::FRESH, 0); 3 * PASS_ROWS];
        for (slot, serial) in keys.chunks_exact_mut(3).zip(serials) {
            slot[0] = wire::key(wire::FRESH, *serial);
            slot[1] = wire::key(wire::ROW, *serial);
            slot[2] = wire::key(wire::TOUCH, *serial);
        }
        let mut values = self
            .state
            .read_keys(&keys[..3 * serials.len()])?
            .into_iter();
        let mut rows = Vec::with_capacity(serials.len());
        for serial in serials {
            let mut next = || values.next().ok_or(ContentError::UnexpectedEof);
            let (member, raw, touch) = (next()?, next()?, next()?);
            let expected = self.expected(*serial)?;
            self.fresh(expected, member.as_deref())?;
            rows.push(
                self.decoded(*serial, expected, raw.as_deref(), touch.as_deref())?
                    .ok_or(ContentError::InvalidRecord(
                        "filesystem reference row missing",
                    ))?,
            );
        }
        Ok(rows)
    }
    /// Decodes one serial's row and checks it against its fresh tag and its
    /// touched witness.
    pub(super) fn decoded(
        &self,
        serial: u64,
        fresh: bool,
        raw: Option<&[u8]>,
        touch: Option<&[u8]>,
    ) -> ContentResult<Option<Row>> {
        let row = raw.map(|bytes| wire::row(bytes, serial)).transpose()?;
        if row.is_some_and(|row| matches!(row, Row::Count { .. }) != fresh) {
            return Err(ContentError::InvalidRecord(
                "filesystem reference fresh tag",
            ));
        }
        if let Some(bytes) = touch {
            wire::membership(bytes)?;
        }
        if row.is_some() != touch.is_some() {
            return Err(ContentError::InvalidRecord(
                "filesystem reference row missing",
            ));
        }
        Ok(row)
    }
    pub fn required(&self, serial: u64) -> ContentResult<Row> {
        self.row(serial)?.ok_or(ContentError::InvalidRecord(
            "filesystem reference row missing",
        ))
    }
    fn prepare(
        &self,
        serial: u64,
        mutation: impl FnOnce(&mut Row) -> ContentResult<()>,
    ) -> ContentResult<Transition> {
        if serial == 0 {
            return Err(ContentError::InvalidRecord("inode serial"));
        }
        let (fresh, old, touch) = self.stored(serial)?;
        let created = old.is_none();
        let mut row = match old.as_deref() {
            Some(bytes) => wire::row(bytes, serial)?,
            None if fresh => Row::Count {
                serial,
                value: None,
                count: 0,
            },
            None => Row::Effect {
                serial,
                value: None,
                delta: 0,
            },
        };
        if matches!(row, Row::Count { .. }) != fresh {
            return Err(ContentError::InvalidRecord(
                "filesystem reference fresh tag",
            ));
        }
        if let Some(bytes) = touch.as_deref() {
            wire::membership(bytes)?;
        }
        if old.is_some() != touch.is_some() {
            return Err(ContentError::InvalidRecord(
                "filesystem reference row missing",
            ));
        }
        let before = row;
        mutation(&mut row)?;
        // Even an unchanged touched witness is an exact coupled guard. It is not
        // a second resident set and a lost witness cannot reset an existing row.
        let changes = vec![
            wire::change(wire::ROW, serial, old, Some(row.encode()?.to_vec())),
            wire::change(wire::TOUCH, serial, touch, Some(vec![1])),
        ];
        Ok(Transition {
            before,
            row,
            changes,
            created,
        })
    }
    pub fn prepare_removed(&self, serial: u64) -> ContentResult<Transition> {
        self.prepare(serial, meaning::removed)
    }
    pub fn apply_transition(
        &mut self,
        mut transition: Transition,
        additional: Vec<ConstructionRecordChange>,
    ) -> ContentResult<()> {
        let touched = if transition.created {
            self.touched
                .checked_add(1)
                .ok_or(ContentError::LengthOverflow)?
        } else {
            self.touched
        };
        transition.changes.extend(additional);
        transition.changes.sort_by_key(|change| change.key);
        self.state.apply(transition.changes)?;
        self.touched = touched;
        self.work.rows_touched = self
            .work
            .rows_touched
            .saturating_add(u64::from(transition.created));
        Ok(())
    }
    pub fn note_retained_binding(&mut self, serial: u64) -> ContentResult<()> {
        self.note(serial, Step::Retained)
    }
    pub fn note_removed_binding(&mut self, serial: u64) -> ContentResult<()> {
        self.note(serial, Step::Removed)
    }
    pub fn note_value(&mut self, serial: u64, value: InodeValue) -> ContentResult<()> {
        self.note(serial, Step::Value(value))
    }
    fn note(&mut self, serial: u64, step: Step) -> ContentResult<()> {
        if serial == 0 {
            return Err(ContentError::InvalidRecord("inode serial"));
        }
        self.defer(serial, step)
    }
}
