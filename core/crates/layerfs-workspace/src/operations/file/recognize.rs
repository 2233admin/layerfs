//! Recognition of committed content in the bytes of one write, before its
//! first owner visit.
//!
//! A pass reads the write's own bytes and mapping pages of the file's own
//! committed content. It reads no overlay row and no committed chunk. A whole
//! chunk of the write whose identity equals the committed chunk's is claimed;
//! every other byte is stored as before. A pass that finds nothing, cannot
//! read a page or is not made at all changes nothing about the write.
use crate::{BaseView, FileLengths};
use layerfs_content::file::cdc::{cut_candidates, MAXIMUM_CHUNK_BYTES, MINIMUM_CHUNK_BYTES};
use layerfs_content::file::mapping::{chunk_id, Extent, ExtentCursor, FileState};
use layerfs_content::object::inode_leaf::InodeKind;
use layerfs_content::{
    AuthenticatedObjects, ContentError, ContentResult, MINIMUM_SMALL_FILE_THRESHOLD_BYTES,
};
use layerfs_overlay::{ClaimedRange, WriteClaims, WRITE_CLAIMS};
use layerfs_telemetry::timer::{Active, Timing, TimingScope};

/// A write shorter than one minimum chunk holds no whole chunk.
pub const RECOGNIZE_BYTES: usize = MINIMUM_CHUNK_BYTES;
/// Consecutive bytes of requests that claimed nothing after which a file's
/// writes are no longer examined.
pub const UNMATCHED_BYTES: u64 = 1 << 20;
/// Leading bytes of a request a search scans. Any window of two maximum
/// chunks of matching content holds one whole chunk.
const SEARCH_BYTES: usize = 2 * MAXIMUM_CHUNK_BYTES;
/// How far before the written offset a search without an earlier claim starts.
const SEARCH_BACK: u64 = 16 * MAXIMUM_CHUNK_BYTES as u64;
/// Committed extents one search compares, from each place it starts.
const SEARCH_EXTENTS: usize = 64;
/// Identities one search computes.
const SEARCH_HASHES: usize = 8;
/// Cut candidates one search keeps for each pair alignment.
const CANDIDATES: usize = 128;
/// Consecutive committed chunks that differ before a followed run ends.
const FOLLOW_MISSES: usize = 2;

/// Whether a file's committed content can supply a claim.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
enum Gate {
    #[default]
    Unknown,
    /// No committed content, or none in chunks.
    Never,
    Chunked {
        root: [u8; 32],
        state: FileState,
    },
}
/// What the writes of one file have established: fixed size, no bytes. The
/// default knows nothing. It belongs to one base; another base starts over.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct WriteRun {
    base: [u8; 32],
    gate: Gate,
    /// File offset less source offset of the last claimed chunk.
    delta: Option<i64>,
    /// End of the last claim in the file and in its source.
    file_end: u64,
    source_end: u64,
    unmatched: u64,
}
/// The result of one pass.
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Recognition {
    Decided(Option<WriteClaims>),
    /// A committed page or fact the pass needs is not in memory. Nothing was
    /// recorded; the same pass over an admitted reader decides.
    NeedsBase,
}
/// Cumulative work of recognition passes.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct RecognizeWork {
    pub passes: u64,
    pub needs_base: u64,
    /// Passes an admitted reader could not finish. Each stored its write.
    pub failed: u64,
    pub scanned_bytes: u64,
    pub hashed_bytes: u64,
    pub extents: u64,
    pub pages: u64,
    pub claims: u64,
    pub claimed_bytes: u64,
}
impl RecognizeWork {
    /// Adds the work of other passes to this total.
    pub fn add(&mut self, other: &Self) {
        self.passes += other.passes;
        self.needs_base += other.needs_base;
        self.failed += other.failed;
        self.scanned_bytes += other.scanned_bytes;
        self.hashed_bytes += other.hashed_bytes;
        self.extents += other.extents;
        self.pages += other.pages;
        self.claims += other.claims;
        self.claimed_bytes += other.claimed_bytes;
    }
}
impl WriteRun {
    /// Whether a write of `length` bytes over `base` is worth a pass. Reads
    /// nothing.
    pub fn wants(&self, base: &BaseView, length: usize) -> bool {
        length >= RECOGNIZE_BYTES
            && (self.base != base.identity().0.to_bytes()
                || (self.gate != Gate::Never && self.unmatched < UNMATCHED_BYTES))
    }
    /// One pass over the bytes of a write at `offset` of file `serial`,
    /// through the client of `base`. A memory-only client that lacks a page
    /// answers [`Recognition::NeedsBase`] and records nothing.
    pub fn recognize(
        &mut self,
        base: &BaseView,
        serial: u64,
        offset: u64,
        data: &[u8],
        work: &mut RecognizeWork,
    ) -> Recognition {
        let identity = base.identity().0.to_bytes();
        let mut next = *self;
        if next.base != identity {
            next = Self {
                base: identity,
                ..Self::default()
            };
        }
        work.passes += 1;
        let pass = Timing::disabled("write.recognize", |scope| {
            next.pass(base, serial, offset, data, work, scope)
        });
        match pass.0 {
            Ok(ranges) => {
                *self = next;
                let Gate::Chunked { root, .. } = next.gate else {
                    return Recognition::Decided(None);
                };
                work.claims += ranges.len() as u64;
                work.claimed_bytes += ranges.iter().map(|range| range.length).sum::<u64>();
                Recognition::Decided((!ranges.is_empty()).then_some(WriteClaims {
                    source: root,
                    after: None,
                    ranges,
                }))
            }
            Err(_) if base.client().is_resident() => {
                work.needs_base += 1;
                Recognition::NeedsBase
            }
            Err(_) => {
                // A reader that cannot answer is charged like bytes that
                // match nothing, so a failing Store is not asked for long.
                if self.base != identity {
                    *self = Self {
                        base: identity,
                        ..Self::default()
                    };
                }
                self.unmatched = self.unmatched.saturating_add(data.len() as u64);
                work.failed += 1;
                Recognition::Decided(None)
            }
        }
    }
    fn pass(
        &mut self,
        base: &BaseView,
        serial: u64,
        offset: u64,
        data: &[u8],
        work: &mut RecognizeWork,
        scope: &TimingScope<'_, Active>,
    ) -> ContentResult<Vec<ClaimedRange>> {
        if self.gate == Gate::Unknown {
            self.gate = gate(base, serial)?;
        }
        let Gate::Chunked { state, .. } = self.gate else {
            return Ok(Vec::new());
        };
        let client = base.client();
        let mut pass = Pass {
            cursor: ExtentCursor::new(state),
            client: client.as_ref(),
            scope,
            offset,
            data,
            ranges: Vec::new(),
            work,
        };
        let (mut at, mut searched) = (0, false);
        loop {
            if let Some(delta) = self.delta {
                at = pass.follow(delta, at)?;
            }
            // One search a request, and none once the known shift has
            // matched in it: a second shift in the same bytes is found by
            // the next request.
            if searched || !pass.ranges.is_empty() || data.len() - at < RECOGNIZE_BYTES {
                break;
            }
            searched = true;
            match pass.search(self, at)? {
                Some((delta, start)) => (self.delta, at) = (Some(delta), start),
                None => break,
            }
        }
        pass.work.pages += pass.cursor.pages();
        match pass.ranges.last() {
            Some(last) => {
                self.file_end = last.offset + last.length;
                self.source_end = last.source_offset + last.length;
                self.unmatched = 0;
            }
            None => self.unmatched = self.unmatched.saturating_add(data.len() as u64),
        }
        Ok(pass.ranges)
    }
    /// Whether a chunk found at `file` that names `source` keeps the source
    /// moving forward through the file after the last claim.
    fn admits(&self, delta: i64, file: u64, source: u64) -> bool {
        match self.delta {
            None => true,
            Some(last) => last == delta || (file >= self.file_end && source >= self.source_end),
        }
    }
}
/// The committed file of `serial` in `base`, when its content is in chunks.
fn gate(base: &BaseView, serial: u64) -> ContentResult<Gate> {
    let value = match base.inode(serial) {
        Ok(found) => found.value,
        Err(ContentError::PathNotFound) => return Ok(Gate::Never),
        Err(error) => return Err(error),
    };
    if value.kind != InodeKind::RegularFile {
        return Ok(Gate::Never);
    }
    // A length below the smallest whole-file threshold is never in chunks:
    // the root object of such a file is its payload and is not read here.
    let length = base.client().file_length(value.content_root).map_err(|_| {
        ContentError::ProviderFailure {
            what: "recognizer file length",
        }
    })?;
    if length < MINIMUM_SMALL_FILE_THRESHOLD_BYTES {
        return Ok(Gate::Never);
    }
    let root = value.content_root.to_bytes();
    Ok(match base.content(root)?.state()? {
        Some(state) => Gate::Chunked { root, state },
        None => Gate::Never,
    })
}
struct Pass<'a, 's> {
    cursor: ExtentCursor,
    client: &'a dyn AuthenticatedObjects,
    scope: &'a TimingScope<'s, Active>,
    offset: u64,
    data: &'a [u8],
    ranges: Vec<ClaimedRange>,
    work: &'a mut RecognizeWork,
}
impl Pass<'_, '_> {
    fn next(&mut self) -> ContentResult<Option<Extent>> {
        let extent = self.cursor.next(self.client, self.scope)?;
        self.work.extents += u64::from(extent.is_some());
        Ok(extent)
    }
    /// Whether bytes `[start, end)` of the write are the whole chunk of
    /// `extent`: equal identity is the proof, and a slice of a chunk has none.
    fn equal(&mut self, extent: &Extent, start: usize, end: usize) -> bool {
        if extent.chunk_offset != 0 {
            return false;
        }
        self.work.hashed_bytes += (end - start) as u64;
        chunk_id(&self.data[start..end]).is_ok_and(|id| id == extent.chunk)
    }
    /// Claims the chunk at `start`; false when the write can hold no more
    /// ranges. A chunk that continues the last range in the file and in the
    /// source extends it.
    fn claim(&mut self, start: usize, extent: &Extent) -> bool {
        let range = ClaimedRange {
            offset: self.offset + start as u64,
            length: u64::from(extent.length),
            source_offset: extent.offset,
        };
        let full = self.ranges.len() == WRITE_CLAIMS;
        match self.ranges.last_mut() {
            Some(last)
                if last.offset + last.length == range.offset
                    && last.source_offset + last.length == range.source_offset =>
            {
                last.length += range.length;
            }
            _ if full => return false,
            _ => self.ranges.push(range),
        }
        true
    }
    /// Compares the committed chunks that lie, shifted by `delta`, wholly
    /// inside the bytes from `from`. Returns where the first chunk of the
    /// final run of differing chunks begins, or the length of the bytes.
    fn follow(&mut self, delta: i64, from: usize) -> ContentResult<usize> {
        let first = i128::from(self.offset) + from as i128;
        let source = u64::try_from((first - i128::from(delta)).max(0)).unwrap_or(u64::MAX);
        self.cursor.seek(source);
        let (mut misses, mut resume) = (0, None);
        while let Some(extent) = self.next()? {
            let file = i128::from(extent.offset) + i128::from(delta);
            // The extent that holds the first byte may begin before it.
            if file < first {
                continue;
            }
            let start = (file - i128::from(self.offset)) as usize;
            let end = start.saturating_add(extent.length as usize);
            if end > self.data.len() {
                break;
            }
            if self.equal(&extent, start, end) {
                if !self.claim(start, &extent) {
                    break;
                }
                (misses, resume) = (0, None);
            } else {
                resume.get_or_insert(start);
                misses += 1;
                if misses == FOLLOW_MISSES {
                    break;
                }
            }
        }
        Ok(resume.unwrap_or(self.data.len()))
    }
    /// Looks for one committed chunk in the bytes from `from`: a chunk that
    /// begins and ends where the frozen scanner could have cut, has the
    /// length of a nearby committed extent, and its identity. Returns the
    /// shift and where the chunk begins.
    fn search(&mut self, run: &WriteRun, from: usize) -> ContentResult<Option<(i64, usize)>> {
        let window = &self.data[from..self.data.len().min(from + SEARCH_BYTES)];
        let first = self.offset + from as u64;
        // Ends by the parity of the chunk's first byte in the window.
        let mut ends = [Vec::new(), Vec::new()];
        for (parity, ends) in ends.iter_mut().enumerate() {
            cut_candidates(&window[parity..], &mut |at| {
                if ends.len() < CANDIDATES {
                    ends.push(at + parity);
                }
            });
        }
        self.work.scanned_bytes += 2 * window.len() as u64;
        // A chunk begins where the one before it ended, or with the bytes.
        let mut starts: Vec<usize> = ends.iter().flatten().copied().collect();
        starts.push(0);
        starts.sort_unstable();
        starts.dedup();
        // Committed extents after the last claim, then those around the
        // written offset when they lie further on.
        let near = first.saturating_sub(SEARCH_BACK);
        let hints = match run.delta {
            Some(_) if first >= run.file_end => [
                Some(run.source_end),
                Some(near).filter(|near| *near > run.source_end),
            ],
            _ => [Some(near), None],
        };
        let mut hashes = 0;
        for hint in hints.into_iter().flatten() {
            self.cursor.seek(hint);
            for _ in 0..SEARCH_EXTENTS {
                let Some(extent) = self.next()? else {
                    break;
                };
                let length = extent.length as usize;
                for &start in &starts {
                    let end = start + length;
                    if end > window.len() {
                        break;
                    }
                    // A chunk cut at the maximum size ends where no scanner
                    // chose: nothing but its identity would point at it, so
                    // a search leaves it to the run that follows a shift.
                    if ends[start % 2].binary_search(&end).is_err() {
                        continue;
                    }
                    let file = first + start as u64;
                    let Ok(delta) = i64::try_from(i128::from(file) - i128::from(extent.offset))
                    else {
                        continue;
                    };
                    if !run.admits(delta, file, extent.offset) {
                        continue;
                    }
                    if hashes == SEARCH_HASHES {
                        return Ok(None);
                    }
                    hashes += 1;
                    if self.equal(&extent, from + start, from + end) {
                        return Ok(Some((delta, from + start)));
                    }
                }
            }
        }
        Ok(None)
    }
}
