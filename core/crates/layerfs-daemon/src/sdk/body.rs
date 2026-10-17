//! Write bodies that follow one SDK call's record on its connection.
//!
//! A file write's bytes do not fit one control record, so the caller names
//! each body's length (`streamed`) in the call and sends the bytes after it,
//! in change order, in records of at most one channel plaintext. They are
//! read here a record at a time and written as they arrive; nothing holds a
//! whole body. Whatever the call does not consume, refused or not, is read
//! and dropped before its answer, so the connection stays in step.
use super::args;
use layerfs_bridge::control::{Request, SdkRefusal, SdkValue};
use layerfs_bridge::duplex::{ChannelError, Receiver};

/// The streamed bodies of the call being served.
pub(crate) struct Bodies<'a> {
    receive: Option<&'a mut Receiver>,
    remaining: u64,
    broken: Option<ChannelError>,
}

impl<'a> Bodies<'a> {
    /// A call with no bodies.
    pub(crate) fn none() -> Self {
        Self {
            receive: None,
            remaining: 0,
            broken: None,
        }
    }

    /// The bodies `request` declares, read from `receive`.
    pub(crate) fn of(request: &Request, receive: &'a mut Receiver) -> Self {
        Self {
            receive: Some(receive),
            remaining: declared(request),
            broken: None,
        }
    }

    /// Hands the next body, `length` bytes, to `each` with its offset, one
    /// received record at a time. A refusal from `each` stops the body; its
    /// rest is dropped with the call's other unread bytes.
    pub(crate) fn take(
        &mut self,
        length: u64,
        mut each: impl FnMut(u64, &[u8]) -> Result<(), SdkRefusal>,
    ) -> Result<(), SdkRefusal> {
        if length > self.remaining {
            return Err(args::invalid("streamed body beyond the declared bytes"));
        }
        let mut offset = 0;
        while offset < length {
            let record = next(&mut self.receive, &mut self.broken)?;
            let size = record.len() as u64;
            if size == 0 || size > length - offset {
                self.broken = Some(ChannelError::Invalid("streamed body record length"));
                return Err(args::failed("streamed body record length"));
            }
            self.remaining -= size;
            each(offset, record)?;
            offset += size;
        }
        Ok(())
    }

    /// Reads and drops what the call left; the channel's failure, if any.
    pub(crate) fn finish(mut self) -> Result<(), ChannelError> {
        while self.remaining > 0 && self.broken.is_none() {
            let size = match next(&mut self.receive, &mut self.broken) {
                Ok(record) => record.len() as u64,
                Err(_) => break,
            };
            if size == 0 || size > self.remaining {
                return Err(ChannelError::Invalid("streamed body record length"));
            }
            self.remaining -= size;
        }
        self.broken.map_or(Ok(()), Err)
    }
}

/// The next record of the call's bodies.
fn next<'r>(
    receive: &'r mut Option<&mut Receiver>,
    broken: &mut Option<ChannelError>,
) -> Result<&'r [u8], SdkRefusal> {
    if broken.is_some() {
        return Err(args::failed("streamed body channel failed"));
    }
    let Some(receive) = receive.as_mut() else {
        return Err(args::invalid("no streamed bodies on this call"));
    };
    match receive.receive() {
        Ok(record) => Ok(record),
        Err(error) => {
            let message = format!("streamed body: {error}");
            *broken = Some(error);
            Err(args::failed(message))
        }
    }
}

/// Bytes the call's `streamed` write fields declare: `fs.write`'s own, or
/// each `fs.apply` write change's. Other calls declare none.
fn declared(request: &Request) -> u64 {
    let call = match request {
        Request::Sdk(call) => call,
        Request::Observed { request, .. } => match request.as_ref() {
            Request::Sdk(call) => call,
            _ => return 0,
        },
        _ => return 0,
    };
    let length = |change: &SdkValue| match change.get("streamed") {
        Some(SdkValue::Int(n)) if *n > 0 => *n as u64,
        _ => 0,
    };
    match call.method.as_str() {
        "fs.write" => length(&call.args),
        "fs.apply" => match call.args.get("changes") {
            Some(SdkValue::List(changes)) => changes
                .iter()
                .filter(|change| change.get_text("op") == Some("write"))
                .map(length)
                .fold(0u64, u64::saturating_add),
            _ => 0,
        },
        _ => 0,
    }
}
