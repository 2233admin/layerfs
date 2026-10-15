//! The SDK trace route. While a traced call runs, every control exchange it
//! makes travels as a traced observation under the call's scope, and the
//! telemetry of the replies is collected for its trace line. An untraced call
//! sends exactly what it did before. Telemetry never changes a result.
use crate::registry::lock;
use layerfs_api::internal::{self, Control};
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use std::cell::{Cell, RefCell};
use std::ops::{Deref, DerefMut};
use std::sync::{Mutex, MutexGuard};

/// Most telemetry values one call keeps; later ones are dropped.
const TELEMETRY: usize = 64;

thread_local! {
    static SCOPE: Cell<Option<[u8; 32]>> = const { Cell::new(None) };
    static COLLECTED: RefCell<Vec<SdkValue>> = const { RefCell::new(Vec::new()) };
}

/// Takes the trace scope a call's `observe` argument names out of its
/// arguments; an absent or malformed one leaves the call untraced.
pub(crate) fn take_scope(args: &mut SdkValue) -> Option<[u8; 32]> {
    let SdkValue::Map(fields) = args else {
        return None;
    };
    let at = fields.iter().position(|(name, _)| name == "observe")?;
    let SdkValue::Text(hex) = fields.remove(at).1 else {
        return None;
    };
    let scope: [u8; 32] = layerfs_bridge::sdk_values::unhex(&hex)?.try_into().ok()?;
    (scope != [0; 32]).then_some(scope)
}

/// Runs `work` with this thread traced under `scope` and returns the
/// telemetry its exchanges received. The scope is cleared on every exit.
pub(crate) fn run<T>(scope: Option<[u8; 32]>, work: impl FnOnce() -> T) -> (T, Vec<SdkValue>) {
    struct Reset;
    impl Drop for Reset {
        fn drop(&mut self) {
            SCOPE.set(None);
            COLLECTED.with_borrow_mut(Vec::clear);
        }
    }
    let _reset = Reset;
    COLLECTED.with_borrow_mut(Vec::clear);
    SCOPE.set(scope);
    let value = work();
    (value, COLLECTED.with_borrow_mut(std::mem::take))
}

/// A Sandbox's control owner, traced while this thread is.
pub(crate) struct Traced<'a>(MutexGuard<'a, Control>);

/// Locks a control owner for one call's exchanges.
pub(crate) fn control(mutex: &Mutex<Control>) -> Result<Traced<'_>, SdkRefusal> {
    let mut guard = lock(mutex)?;
    internal::trace(&mut guard, SCOPE.get());
    Ok(Traced(guard))
}
impl Drop for Traced<'_> {
    fn drop(&mut self) {
        let telemetry = internal::take_telemetry(&mut self.0);
        internal::trace(&mut self.0, None);
        COLLECTED.with_borrow_mut(|collected| {
            let room = TELEMETRY.saturating_sub(collected.len());
            collected.extend(telemetry.into_iter().take(room));
        });
    }
}
impl Deref for Traced<'_> {
    type Target = Control;
    fn deref(&self) -> &Control {
        &self.0
    }
}
impl DerefMut for Traced<'_> {
    fn deref_mut(&mut self) -> &mut Control {
        &mut self.0
    }
}
