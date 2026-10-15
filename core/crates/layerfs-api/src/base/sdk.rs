//! One SDK call over the control channel, and its failure.
//!
//! Every non-Workspace JavaScript method is one daemon call: its arguments
//! and result are plain values, and a refusal carries a stable code.
use crate::{base::failure::exchange, internal::Control, OperationFailure};
use layerfs_bridge::control::{Reply, Request, SdkCall, SdkRefusal, SdkValue};
use std::fmt;

/// The failure of one SDK call.
#[derive(Debug)]
pub enum SdkError {
    /// The daemon refused the call; its `code` decides.
    Refused(SdkRefusal),
    /// The exchange or the daemon's control layer failed.
    Operation(Box<OperationFailure>),
    /// A mount stopped at bind or attach, with what it acknowledged.
    Mount(Box<crate::MountFailure>),
}

/// The answer of one SDK call.
pub type SdkResult = Result<SdkValue, SdkError>;

impl From<Box<OperationFailure>> for SdkError {
    fn from(failure: Box<OperationFailure>) -> Self {
        Self::Operation(failure)
    }
}

impl fmt::Display for SdkError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Refused(refusal) => write!(f, "{}: {}", refusal.code, refusal.message),
            Self::Operation(failure) => failure.fmt(f),
            Self::Mount(failure) => failure.failure.fmt(f),
        }
    }
}
impl std::error::Error for SdkError {}

/// Calls one daemon SDK method once; nothing is retried.
pub fn call(control: &mut Control, method: &str, args: SdkValue) -> SdkResult {
    if method.starts_with("operator.") {
        return Err(SdkError::Refused(SdkRefusal {
            code: "UnknownMethod".into(),
            message: "operator methods require operator::call".into(),
            detail: SdkValue::Null,
        }));
    }
    exchange_call(control, method, args)
}

pub(crate) fn exchange_call(control: &mut Control, method: &str, args: SdkValue) -> SdkResult {
    let request = Request::Sdk(SdkCall {
        method: method.to_owned(),
        args,
    });
    match exchange(control, request.clone())? {
        Reply::Sdk(value) => Ok(value),
        Reply::SdkRefused(refusal) => Err(SdkError::Refused(refusal)),
        reply => Err(SdkError::Operation(OperationFailure::unexpected(
            request, reply,
        ))),
    }
}
