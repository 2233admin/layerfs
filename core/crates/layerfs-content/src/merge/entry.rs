//! The merge entry point: candidates, decisions, revival and the build.

use layerfs_telemetry::timer::{Active, TimingScope};

use super::codec::decided;
use super::spill::{digest, Resident, RunWriter, Spill, ANCESTOR};
use super::{build, candidates, decide, revive, MergeInput, MergeOutcome, Rules, RulesFrom, Side};
use crate::compare::DifferenceWork;
use crate::error::{ContentError, ContentResult};
use crate::filesystem::FilesystemObjects;
use crate::object::{AuthenticatedObjects, FinalizedConsumer};
use crate::IndexedConstructionBacking;

/// Merges ours into theirs against the base.
///
/// Merged and marker files are constructed into `consumer`, followed by the
/// merged root's own objects; `reader` must read what `consumer` accepted.
/// `fresh` returns one never-exposed serial of the roots' scope each call.
/// `records` holds the merge's working state: its sorted runs, its plan and
/// the update's validation and reference state (#355). The caller owns their
/// scope and releases it after this call returns. Without records the same
/// state is kept in memory; a caller passes none only with a `bound`.
pub fn merge_roots(
    reader: &dyn AuthenticatedObjects,
    consumer: &mut dyn FinalizedConsumer,
    input: &MergeInput<'_>,
    fresh: &mut dyn FnMut() -> ContentResult<u64>,
    records: Option<&mut dyn IndexedConstructionBacking>,
    timing: &TimingScope<'_, Active>,
) -> ContentResult<MergeOutcome> {
    let mut outcome = MergeOutcome {
        root: input.theirs,
        conflicts: Vec::new(),
        lww: Vec::new(),
        decided: 0,
        work: DifferenceWork::default(),
        hinted: false,
        naming: Default::default(),
    };
    if input.ours == input.base || input.ours == input.theirs {
        return Ok(outcome);
    }
    if input.theirs == input.base {
        outcome.root = input.ours;
        return Ok(outcome);
    }
    let mut resolver = decide::Resolver::new(reader, [input.base, input.ours, input.theirs])?;
    if resolver.trees[decide::OURS].root.scope() != resolver.trees[decide::THEIRS].root.scope() {
        return Err(ContentError::InvalidRecord("merge scope"));
    }
    let (from, into) = match input.decide_from {
        Side::Ours => (decide::OURS, decide::THEIRS),
        Side::Theirs => (decide::THEIRS, decide::OURS),
    };
    let mut resident = Resident::default();
    let spill = Spill::new(match records {
        Some(records) => records,
        None => &mut resident,
    });
    let (mut paths, hinted) = timing.child("merge.paths").run(|scope| {
        candidates::candidates(
            &resolver,
            from,
            input.bound,
            input.hints,
            &mut outcome.work,
            &mut outcome.naming,
            &spill,
            scope,
        )
    })?;
    outcome.hinted = hinted;
    let rules_side = match input.rules_from {
        RulesFrom::Ours => decide::OURS,
        RulesFrom::Theirs => decide::THEIRS,
    };
    let mut decider = decide::Decider {
        labels: input.labels,
        rules: &Rules::default(),
        timing,
        conflicts: Vec::new(),
        lww: Vec::new(),
    };
    let rules = Rules::load(&mut |path| {
        let entry = resolver.entry(rules_side, path)?;
        decider.text(reader, entry)
    })?;
    decider.rules = &rules;
    // Decisions in path order. Each decided path that has decided paths
    // below it is also a point record, for revival's parent lookups; the
    // decided ancestors of the current path are the stack's entries, which
    // all prefix it.
    let mut out = RunWriter::new(&spill);
    let mut ancestors: Vec<(String, decide::Pick, bool)> = Vec::new();
    let mut write = |bytes| spill.put_text(bytes);
    while let Some(path) = paths.next(&spill)? {
        let path =
            String::from_utf8(path).map_err(|_| ContentError::InvalidRecord("merge path"))?;
        let pick = decider.decide(&mut resolver, &path, &mut write)?;
        let here = resolver.entry(into, &path)?;
        while ancestors
            .last()
            .is_some_and(|(above, _, _)| !path.starts_with(above.as_str()))
        {
            ancestors.pop();
        }
        for (above, pick, recorded) in &mut ancestors {
            let below = above == "/" || path.as_bytes().get(above.len()) == Some(&b'/');
            if below && !*recorded {
                spill.insert(ANCESTOR, digest(above), decided(above, pick, None)?)?;
                *recorded = true;
            }
        }
        out.push(&spill, &decided(&path, &pick, here.as_ref())?)?;
        ancestors.push((path, pick, false));
    }
    let decisions = out.finish(&spill)?;
    outcome.conflicts = std::mem::take(&mut decider.conflicts);
    outcome.lww = std::mem::take(&mut decider.lww);
    let (revived, count) = revive::revive(&mut resolver, decisions, into, &spill)?;
    let mut objects = FilesystemObjects::new_with_accepted(reader, consumer, reader);
    let mut writer = build::Writer {
        policy: input.policy,
        capacities: input.capacities,
        fresh,
        timing,
    };
    outcome.root = build::build(
        &mut objects,
        &mut resolver,
        (decisions, revived),
        into,
        &spill,
        &mut writer,
    )?;
    outcome.decided = count;
    Ok(outcome)
}
