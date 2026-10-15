// The Bash tool result envelope an agent sees after one tool call.

const CONFLICT_NOTE = "markers written, your next call runs in the same Workspace";

function commitPart(commit) {
  if (!commit) return null;
  return { kind: commit.kind, head: commit.head ?? null, merged: commit.merged ?? null, lww: commit.lww ?? [] };
}

function conflictPart(refusal) {
  if (!refusal) return null;
  const detail = refusal.detail ?? {};
  return {
    code: refusal.code,
    head: detail.head ?? null,
    markers: Boolean(detail.markers),
    files: (detail.conflicts ?? []).map((conflict) => ({ path: conflict.path, kind: conflict.kind, blocks: conflict.blocks ?? 0 })),
    lww: detail.lww ?? [],
    message: refusal.code === "Conflict" ? CONFLICT_NOTE : refusal.message,
  };
}

/**
 * One envelope: exit code and output, the Commit outcome (or the conflict
 * that kept the Workspace), and where the Workspace is now.
 */
export function toolResult({ exec, commit, refusal, unmount, workspace }) {
  const output = [exec?.stdout ?? "", exec?.stderr ?? ""].filter(Boolean).join("");
  return {
    exitCode: exec?.exitCode ?? null,
    output,
    truncated: Boolean(exec?.truncated),
    commit: commitPart(commit),
    conflict: conflictPart(refusal),
    unmount: unmount ?? null,
    workspace: workspace ? { sandbox: workspace.sandbox.id, path: workspace.path, kept: workspace.kept } : null,
  };
}
