//! Write bodies streamed after an SDK call's record instead of inside it.
//!
//! One control record holds at most one channel plaintext, so a file write's
//! bytes are not encoded into the call: each body above [`INLINE_BYTES`] is
//! replaced by its length (`streamed`) and sent after the record, in order,
//! where the daemon writes it a record at a time. No file size is capped.
use layerfs_bridge::control::SdkValue;

/// Bodies up to this size stay inside the call record.
const INLINE_BYTES: usize = 4096;

/// The call's arguments with large write bodies replaced by their lengths,
/// and those bodies in the order the daemon reads them.
pub(crate) fn split(method: &str, args: SdkValue) -> (SdkValue, Vec<Vec<u8>>) {
    let mut bodies = Vec::new();
    let args = match (method, args) {
        ("fs.write", args) => take(args, &mut bodies),
        ("fs.apply", SdkValue::Map(fields)) => SdkValue::Map(
            fields
                .into_iter()
                .map(|(name, value)| match (name.as_str(), value) {
                    ("changes", SdkValue::List(changes)) => {
                        let changes = changes
                            .into_iter()
                            .map(|change| {
                                if change.get_text("op") == Some("write") {
                                    take(change, &mut bodies)
                                } else {
                                    change
                                }
                            })
                            .collect();
                        (name, SdkValue::List(changes))
                    }
                    (_, value) => (name, value),
                })
                .collect(),
        ),
        (_, args) => args,
    };
    (args, bodies)
}

/// One write's `content` or `bytes`, when large, moved to `bodies`.
fn take(value: SdkValue, bodies: &mut Vec<Vec<u8>>) -> SdkValue {
    let SdkValue::Map(fields) = value else {
        return value;
    };
    SdkValue::Map(
        fields
            .into_iter()
            .map(|(name, value)| {
                let body = match (name.as_str(), value) {
                    ("content", SdkValue::Text(text)) if text.len() > INLINE_BYTES => {
                        text.into_bytes()
                    }
                    ("bytes", SdkValue::Bytes(bytes)) if bytes.len() > INLINE_BYTES => bytes,
                    (_, value) => return (name, value),
                };
                let length = SdkValue::Int(body.len() as i64);
                bodies.push(body);
                ("streamed".to_owned(), length)
            })
            .collect(),
    )
}
