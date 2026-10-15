//! One blocking operation run off the JavaScript thread and resolved as a
//! Promise.
//!
//! The Promise always resolves: `{ value }` on success, `{ refused: { code,
//! message, detail } }` for a refusal with a stable code. The JavaScript SDK
//! turns a refusal into a typed error. Nothing is retried here.
use crate::convert::to_js;
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use napi::{Env, JsUnknown, Task};

/// What one operation answers.
pub(crate) type Outcome = Result<SdkValue, SdkRefusal>;

/// A refusal with a stable code.
pub(crate) fn refused(code: &str, message: impl Into<String>) -> SdkRefusal {
    SdkRefusal {
        code: code.to_owned(),
        message: message.into(),
        detail: SdkValue::Null,
    }
}

/// A failure that has no SDK code of its own.
pub(crate) fn failed(error: impl std::fmt::Debug) -> SdkRefusal {
    refused("Failed", format!("{error:?}"))
}

/// One queued operation, traced when it has a scope.
pub struct Job {
    work: Option<Box<dyn FnOnce() -> Outcome + Send>>,
    scope: Option<[u8; 32]>,
}

impl Job {
    pub(crate) fn new(work: impl FnOnce() -> Outcome + Send + 'static) -> Self {
        Self {
            work: Some(Box::new(work)),
            scope: None,
        }
    }
    /// Sends this operation's control exchanges as traced observations.
    pub(crate) fn traced(mut self, scope: Option<[u8; 32]>) -> Self {
        self.scope = scope;
        self
    }
}

impl Task for Job {
    type Output = (Outcome, Vec<SdkValue>);
    type JsValue = JsUnknown;

    fn compute(&mut self) -> napi::Result<Self::Output> {
        match self.work.take() {
            Some(work) => Ok(crate::trace::run(self.scope, work)),
            None => Err(napi::Error::from_reason("operation already ran")),
        }
    }

    fn resolve(
        &mut self,
        env: Env,
        (output, telemetry): Self::Output,
    ) -> napi::Result<Self::JsValue> {
        let mut answer = match output {
            Ok(value) => vec![("value".to_owned(), value)],
            Err(refusal) => vec![(
                "refused".to_owned(),
                SdkValue::map([
                    ("code", SdkValue::Text(refusal.code)),
                    ("message", SdkValue::Text(refusal.message)),
                    ("detail", refusal.detail),
                ]),
            )],
        };
        // Only a traced call has telemetry; an untraced answer is unchanged.
        if !telemetry.is_empty() {
            answer.push(("telemetry".to_owned(), SdkValue::List(telemetry)));
        }
        to_js(&env, &SdkValue::Map(answer))
    }
}
