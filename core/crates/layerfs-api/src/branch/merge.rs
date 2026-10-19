//! `branch.merge`.
use crate::base::args::{project, text, Answer};
use layerfs_bridge::control::SdkValue;
use layerfs_store_service::{history::branch, StoreService};

/// `merge(a, b, { name })`: a new Branch from two, fast-forward or one merge Commit; a conflict creates nothing.
pub fn merge(service: &StoreService, args: &SdkValue) -> Answer {
    let stack = project(service, args)?;
    let (left, right, name) = (
        text(args, "branch")?,
        text(args, "with")?,
        text(args, "name")?,
    );
    branch::merge(
        &service.store,
        &stack,
        left,
        right,
        name,
        args.get_text("message"),
    )
}
