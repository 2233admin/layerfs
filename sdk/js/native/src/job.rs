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

/// One queued operation.
pub struct Job {
    work: Option<Box<dyn FnOnce() -> Outcome + Send>>,
}

impl Job {
    pub(crate) fn new(work: impl FnOnce() -> Outcome + Send + 'static) -> Self {
        Self {
            work: Some(Box::new(work)),
        }
    }
}

impl Task for Job {
    type Output = Outcome;
    type JsValue = JsUnknown;

    fn compute(&mut self) -> napi::Result<Self::Output> {
        match self.work.take() {
            Some(work) => Ok(work()),
            None => Err(napi::Error::from_reason("operation already ran")),
        }
    }

    fn resolve(&mut self, env: Env, output: Self::Output) -> napi::Result<Self::JsValue> {
        let answer = match output {
            Ok(value) => SdkValue::Map(vec![("value".to_owned(), value)]),
            Err(refusal) => SdkValue::Map(vec![(
                "refused".to_owned(),
                SdkValue::map([
                    ("code", SdkValue::Text(refusal.code)),
                    ("message", SdkValue::Text(refusal.message)),
                    ("detail", refusal.detail),
                ]),
            )]),
        };
        to_js(&env, &answer)
    }
}
