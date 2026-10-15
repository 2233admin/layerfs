//! Commands in a mounted Workspace, run by the Sandbox runtime owner.
//!
//! `exec` runs `bash -lc <command>` as the Sandbox's command identity in the
//! Workspace directory and returns the exit code and output when it ends; the
//! daemon is not involved. A background command is started in its own session
//! with its output in a log file, and this binding keeps its process id. The
//! Engine offers no per-exec cancel, so `cancel` signals the process group
//! from a second command and waits (bounded) until it is gone.
use crate::job::{failed, refused, Outcome};
use crate::registry::{lock, sandbox, text, Process, SandboxState};
use layerfs_bridge::control::{SdkRefusal, SdkValue};
use std::io::Write;
use std::time::Duration;

/// Output bytes kept per stream; the rest is counted.
const KEPT: usize = 1 << 20;
/// Checks that a cancelled process group is gone.
const GONE_CHECKS: u32 = 50;
/// Pause between those checks.
const GONE_PAUSE: Duration = Duration::from_millis(100);

/// Keeps the first [`KEPT`] bytes and counts every byte.
#[derive(Default)]
struct Kept {
    bytes: Vec<u8>,
    total: usize,
}

impl Write for Kept {
    fn write(&mut self, data: &[u8]) -> std::io::Result<usize> {
        let room = KEPT.saturating_sub(self.bytes.len());
        self.bytes.extend_from_slice(&data[..room.min(data.len())]);
        self.total += data.len();
        Ok(data.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}

/// One command to its end: exit code, stdout, stderr.
fn run(
    state: &SandboxState,
    directory: &str,
    arguments: Vec<String>,
) -> Result<(i32, Kept, Kept), SdkRefusal> {
    let created = layerfs_api::internal::exec(
        &state.runtime,
        state.identity,
        arguments,
        Vec::new(),
        directory.to_owned(),
        false,
    )
    .map_err(failed)?;
    let attached = created.start().map_err(failed)?;
    let (_input, output, handle) = attached.into_parts().map_err(failed)?;
    let (mut stdout, mut stderr) = (Kept::default(), Kept::default());
    output.copy_to(&mut stdout, &mut stderr).map_err(failed)?;
    let inspected = handle.inspect().map_err(failed)?;
    let code = inspected
        .known_root_exit()
        .ok_or_else(|| refused("Unknown", "the command's exit code is not known"))?;
    Ok((code, stdout, stderr))
}

fn shown(kept: &Kept) -> SdkValue {
    SdkValue::Text(String::from_utf8_lossy(&kept.bytes).into_owned())
}

/// `sandbox.exec(sandbox, path, command, { background? })`.
pub(crate) fn exec(args: &SdkValue) -> Outcome {
    let state = sandbox(args)?;
    let path = text(args, "path")?;
    let command = text(args, "command")?;
    let directory = lock(&state.mounts)?
        .get(path)
        .map(|mount| mount.workspace.ready.directory.clone())
        .ok_or_else(|| refused("NotMounted", format!("{}:{path} is not mounted", state.id)))?;
    if !args.get_bool("background") {
        let (code, stdout, stderr) = run(
            &state,
            &directory,
            vec!["bash".into(), "-lc".into(), command.into()],
        )?;
        return Ok(SdkValue::map([
            ("kind", SdkValue::Text(format!("exit:{code}"))),
            ("exitCode", SdkValue::Int(i64::from(code))),
            ("stdout", shown(&stdout)),
            ("stderr", shown(&stderr)),
            (
                "truncated",
                SdkValue::Bool(stdout.total > KEPT || stderr.total > KEPT),
            ),
        ]));
    }
    let id = format!("proc_{:02}", lock(&state.processes)?.len() + 1);
    let script = format!("setsid bash -lc \"$0\" >/tmp/layerfs-{id}.log 2>&1 </dev/null & echo $!");
    let (code, stdout, stderr) = run(
        &state,
        &directory,
        vec!["bash".into(), "-c".into(), script, command.into()],
    )?;
    let pid = String::from_utf8_lossy(&stdout.bytes)
        .trim()
        .parse::<u32>()
        .map_err(|_| {
            refused(
                "Failed",
                format!(
                    "background start exited {code}: {}",
                    String::from_utf8_lossy(&stderr.bytes)
                ),
            )
        })?;
    lock(&state.processes)?.insert(
        id.clone(),
        Process {
            path: path.to_owned(),
            command: command.to_owned(),
            pid,
            stopped: false,
        },
    );
    Ok(SdkValue::map([
        ("kind", SdkValue::text("running")),
        ("process", SdkValue::Text(id)),
        ("command", SdkValue::text(command)),
    ]))
}

/// True while the process group of `pid` has a member.
fn alive(state: &SandboxState, pid: u32) -> Result<bool, SdkRefusal> {
    let (code, _, _) = run(
        state,
        "/tmp",
        vec![
            "bash".into(),
            "-c".into(),
            format!("kill -0 -- -{pid} 2>/dev/null"),
        ],
    )?;
    Ok(code == 0)
}

/// `sandbox.list_processes(sandbox)`: the processes this binding started.
pub(crate) fn processes(args: &SdkValue) -> Outcome {
    let state = sandbox(args)?;
    let listed = lock(&state.processes)?
        .iter()
        .map(|(id, process)| {
            (
                id.clone(),
                process.path.clone(),
                process.command.clone(),
                process.pid,
                process.stopped,
            )
        })
        .collect::<Vec<_>>();
    let mut items = Vec::new();
    for (id, path, command, pid, stopped) in listed {
        let running = !stopped && alive(&state, pid)?;
        items.push(SdkValue::map([
            ("id", SdkValue::Text(id)),
            ("path", SdkValue::Text(path)),
            ("command", SdkValue::Text(command)),
            (
                "status",
                SdkValue::text(if running {
                    "running"
                } else if stopped {
                    "stopped"
                } else {
                    "exited"
                }),
            ),
        ]));
    }
    Ok(SdkValue::map([
        ("kind", SdkValue::text("ok")),
        ("items", SdkValue::List(items)),
    ]))
}

/// `process.cancel(sandbox, process)`: TERM to the process group, then a
/// bounded wait until it is gone.
pub(crate) fn cancel(args: &SdkValue) -> Outcome {
    let state = sandbox(args)?;
    let id = text(args, "process")?;
    let pid = lock(&state.processes)?
        .get(id)
        .map(|process| process.pid)
        .ok_or_else(|| {
            refused(
                "NoSuchProcess",
                format!("{id} is not owned by {}", state.id),
            )
        })?;
    run(
        &state,
        "/tmp",
        vec![
            "bash".into(),
            "-c".into(),
            format!("kill -TERM -- -{pid} 2>/dev/null; true"),
        ],
    )?;
    let mut gone = false;
    for _ in 0..GONE_CHECKS {
        if !alive(&state, pid)? {
            gone = true;
            break;
        }
        std::thread::sleep(GONE_PAUSE);
    }
    if let Some(process) = lock(&state.processes)?.get_mut(id) {
        process.stopped = gone;
    }
    Ok(SdkValue::map([
        ("kind", SdkValue::text("Stopped")),
        ("process", SdkValue::text(id)),
        (
            "status",
            SdkValue::text(if gone { "stopped" } else { "stopping" }),
        ),
    ]))
}
