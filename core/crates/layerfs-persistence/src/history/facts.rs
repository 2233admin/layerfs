//! Persistent history facts and constant-size Store accounting reads.
use super::{provider::HistoryProvider, rows::cell};
use layerfs_content::merge::LwwDecision;
use layerfs_history::{HistoryError, HistoryResult, StoreStatistics};

pub(crate) fn encode(values: &[LwwDecision]) -> HistoryResult<Vec<u8>> {
    let mut out = Vec::new();
    for value in values {
        for text in [&value.path, &value.rule] {
            let length = u32::try_from(text.len())
                .map_err(|_| HistoryError::Capacity("history fact text"))?;
            out.extend_from_slice(&length.to_be_bytes());
            out.extend_from_slice(text.as_bytes());
        }
        out.push(u8::from(value.kept_ours) | (u8::from(value.deleted) << 1));
    }
    Ok(out)
}
pub(crate) fn decode(mut bytes: &[u8]) -> HistoryResult<Vec<LwwDecision>> {
    fn text(bytes: &mut &[u8]) -> HistoryResult<String> {
        let count = bytes
            .get(..4)
            .ok_or(HistoryError::Integrity("history fact length"))?;
        let length = u32::from_be_bytes(
            count
                .try_into()
                .map_err(|_| HistoryError::Integrity("history fact length"))?,
        ) as usize;
        *bytes = &bytes[4..];
        let text = bytes
            .get(..length)
            .ok_or(HistoryError::Integrity("history fact text"))?;
        let out = std::str::from_utf8(text)
            .map_err(|_| HistoryError::Integrity("history fact UTF-8"))?
            .to_owned();
        *bytes = &bytes[length..];
        Ok(out)
    }
    let mut out = Vec::new();
    while !bytes.is_empty() {
        let path = text(&mut bytes)?;
        let rule = text(&mut bytes)?;
        let flags = *bytes
            .first()
            .ok_or(HistoryError::Integrity("history fact flags"))?;
        if flags > 3 {
            return Err(HistoryError::Integrity("history fact flags"));
        }
        bytes = &bytes[1..];
        out.push(LwwDecision {
            path,
            rule,
            kept_ours: flags & 1 != 0,
            deleted: flags & 2 != 0,
        });
    }
    Ok(out)
}
impl HistoryProvider {
    pub(crate) fn statistics(&self) -> HistoryResult<StoreStatistics> {
        self.read(|tx| {
            let rows = tx.query("statistics_totals", Vec::new())?;
            let row = rows
                .first()
                .filter(|_| rows.len() == 1)
                .ok_or(HistoryError::Integrity("Store totals"))?;
            let get = |index| -> HistoryResult<u64> {
                u64::try_from(cell::<i64>(row, index)?)
                    .map_err(|_| HistoryError::Integrity("negative Store size"))
            };
            let (pages, free, page_size) = (get(4)?, get(5)?, get(6)?);
            let (file, free) = (pages.checked_mul(page_size), free.checked_mul(page_size));
            let (file, free) = (
                file.ok_or(HistoryError::Capacity("Store size"))?,
                free.ok_or(HistoryError::Capacity("Store size"))?,
            );
            let stored = get(2)?;
            let overhead = file
                .checked_sub(free)
                .and_then(|used| used.checked_sub(stored))
                .ok_or(HistoryError::Integrity("Store allocation accounting"))?;
            Ok(StoreStatistics {
                logical: get(0)?,
                canonical: get(1)?,
                stored,
                metadata: get(3)?
                    .checked_add(overhead)
                    .ok_or(HistoryError::Capacity("metadata size"))?,
                file,
                free,
            })
        })
    }
}
