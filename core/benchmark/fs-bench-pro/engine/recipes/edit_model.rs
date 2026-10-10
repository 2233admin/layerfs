//! Original product-neutral SDK edit algebra, adapted to native semantic trees.
use crate::reference;
use reference::sdk_edit_common::{ReplacementKind, Scenario};
use reference::workspace_common::{Content, Entry, EntryKind};

pub fn scenario(id: &str) -> Option<Scenario> {
    reference::edit_length_preserving::registry()
        .into_iter()
        .chain(reference::edit_length_changing::registry())
        .chain(reference::edit_canonical_chunk_count::registry())
        .chain(reference::edit_length_changing_capped::registry())
        .find(|row| row.id == id)
}

/// Complete expected tree, including the canonical family's final byte digest.
pub fn entries(id: &str, step: usize) -> reference::Result<Vec<Entry>> {
    let entries = descriptors(id, step)?;
    let canonical = scenario(id)
        .filter(|row| row.family_id == reference::edit_canonical_chunk_count::FAMILY_ID);
    if let (1, Some(row)) = (step, canonical) {
        if original_fixture_hash(&entries)?
            != reference::edit_canonical_chunk_count::expected(&row).final_sha256
        {
            return Err("original canonical final byte digest differs".into());
        }
    }
    Ok(entries)
}

/// The same tree without generating its bytes. The timed writer needs only the
/// metadata descriptors; preparation, verification and the oracle keep the
/// digest check through `entries`.
pub fn descriptors(id: &str, step: usize) -> reference::Result<Vec<Entry>> {
    let Some(row) = scenario(id) else {
        let case = reference::workspace_registry::resolve(id)?;
        return reference::workspace_registry::expected(&case, 1, step);
    };
    if step > 1 {
        return Err("original SDK edit has only initial and one final state".into());
    }
    if row
        .start
        .checked_add(row.delete_len)
        .is_none_or(|end| end > row.fixture_bytes)
        || row.final_bytes != row.fixture_bytes - row.delete_len + row.replacement_len
    {
        return Err("original SDK scenario algebra differs".into());
    }
    let initial = Content::Seed {
        seed: reference::edit_length_changing_capped::GENERATOR_SEED,
        len: row.fixture_bytes,
    };
    let content = if step == 0 {
        initial
    } else {
        let replacement = match row.replacement_kind {
            ReplacementKind::Inline => {
                let bytes = reference::sdk_edit_common::replacement_bytes(&row);
                if bytes.len() as u64 != row.replacement_len
                    || reference::sdk_edit_common::sha256_hex(&bytes) != row.payload_sha256
                {
                    return Err("original SDK inline payload seal differs".into());
                }
                Content::Literal(bytes)
            }
            ReplacementKind::Zero => Content::Zero {
                len: row.replacement_len,
            },
        };
        initial.splice(row.start, row.delete_len, replacement)?
    };
    if content.len()
        != if step == 0 {
            row.fixture_bytes
        } else {
            row.final_bytes
        }
    {
        return Err("original SDK expected file length differs".into());
    }
    let entries = vec![Entry::directory("."), Entry::file("payload.bin", content)];
    reference::workspace_common::validate_entries(&entries)?;
    Ok(entries)
}

pub fn fixture_sha256(id: &str) -> reference::Result<Option<&'static str>> {
    scenario(id)
        .map(|row| {
            reference::sdk_edit_common::fixture_index(row.fixture_bytes)
                .map(|index| reference::sdk_edit_common::FIXTURE_SHA256[index])
                .ok_or_else(|| "original SDK fixture size has no frozen digest".into())
        })
        .transpose()
}

pub fn original_fixture_hash(entries: &[Entry]) -> reference::Result<String> {
    let EntryKind::File(content) = &entries[1].kind else {
        return Err("SDK fixture file descriptor missing".into());
    };
    content.digest()
}
