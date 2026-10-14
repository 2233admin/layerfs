//! The merge entry point: candidates, decisions, revival and the build.

use std::collections::BTreeMap;

use layerfs_telemetry::timer::{Active, TimingScope};

use super::{build, decide, MergeInput, MergeOutcome, Rules, RulesFrom};
use crate::compare::DifferenceWork;
use crate::error::ContentResult;
use crate::filesystem::FilesystemObjects;
use crate::object::{AuthenticatedObjects, FinalizedConsumer};

/// Merges ours into theirs against the base.
///
/// Merged and marker files are constructed into `consumer`, followed by the
/// merged root's own objects; `reader` must read what `consumer` accepted.
/// `fresh` returns one never-exposed serial of the roots' scope each call.
pub fn merge_roots(
    reader: &dyn AuthenticatedObjects,
    consumer: &mut dyn FinalizedConsumer,
    input: &MergeInput<'_>,
    fresh: &mut dyn FnMut() -> ContentResult<u64>,
    timing: &TimingScope<'_, Active>,
) -> ContentResult<MergeOutcome> {
    let mut outcome = MergeOutcome {
        root: input.theirs,
        conflicts: Vec::new(),
        lww: Vec::new(),
        decided: 0,
        work: DifferenceWork::default(),
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
        return Err(crate::ContentError::InvalidRecord("merge scope"));
    }
    let candidates = timing
        .child("merge.paths")
        .run(|_| decide::candidates(&resolver, &mut outcome.work))?;
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
    let mut picks = BTreeMap::new();
    for path in &candidates {
        picks.insert(path.clone(), decider.decide(&mut resolver, path)?);
    }
    decide::revive(&mut resolver, &mut picks)?;
    let mut objects = FilesystemObjects::new_with_accepted(reader, consumer, reader);
    let mut writer = build::Writer {
        policy: input.policy,
        capacities: input.capacities,
        fresh,
        timing,
    };
    outcome.root = build::build(&mut objects, &mut resolver, &picks, &mut writer)?;
    outcome.decided = picks.len();
    outcome.conflicts = decider.conflicts;
    outcome.lww = decider.lww;
    Ok(outcome)
}
