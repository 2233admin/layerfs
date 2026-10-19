// Native state snapshots and proof-of-run counts for the native replays (#352
// step 0 of ranges 21–30, liaison 2026-10-20 under the owner's delegation).
//
// A snapshot is the native folder after a run's closure chain (node_modules,
// lib/ and every other untracked file), tarred into a Docker volume. A chain
// entry `{ kind: "native-state", state: { volume, file, sha256 } }` stands for
// the states it was made from: the native replays (nativeChain, nativeSequence)
// extract it instead of replaying them, so the chain stops growing with ranges.
// It is a cache of the same model, never a new one: savestate refuses to write
// an entry unless its replay proved it ran every state.
//
// Proof of run (fail loud, r018 a2's lesson): every native replay prints a
// marker per thing it did; provenRun counts them against what the script was
// built to do. A missing marker is an error, so the proof is NOT_RUN, never a
// silent fallback to a partial replay.

/** The Docker volume the snapshots live in (read-only to a replay, read-write to savestate). */
export const NATIVE_STATES = "layerfs-issue352-native-states";
export const RESTORE_MOUNT = "/nstate";
export const SAVE_MOUNT = "/nsave";

export const isNativeState = (e) => e?.kind === "native-state" || !!e?.state;
/** The command string that stands for a snapshot in cache keys (closure.mjs sequenceKey, nodeproof oracleKey). */
export const stateCommand = (state) => `native-state ${state.sha256}`;

/** Shell that extracts snapshot `state` into folder `at` and proves it (`@@restored <i> <entries>`). */
export const restoreCommand = (i, state, at) => `if tar -x -C ${at} -f ${RESTORE_MOUNT}/${state.file}; then echo "@@restored ${i} $(find ${at} | wc -l)"; else echo "@@restorefail ${i} $?"; fi`;

/** Shell that tars folder `at` into the save volume as `file` and prints `@@saved <sha256> <bytes>`. */
export const saveCommand = (at, file) => `tar -c -C ${at} -f ${SAVE_MOUNT}/${file}.tmp . && mv ${SAVE_MOUNT}/${file}.tmp ${SAVE_MOUNT}/${file} && echo "@@saved $(sha256sum ${SAVE_MOUNT}/${file} | cut -d' ' -f1) $(stat -c %s ${SAVE_MOUNT}/${file})"`;

/** The docker -v arguments a replay of `states` needs for snapshots (restore read-only, save read-write). */
export function stateMounts(states, save = null) {
  const vols = [...new Set(states.filter((s) => s.state).map((s) => s.state.volume ?? NATIVE_STATES))];
  if (vols.length > 1) throw new Error(`native states from ${vols.length} volumes in one chain`);
  return [...(vols.length ? ["-v", `${vols[0]}:${RESTORE_MOUNT}:ro`] : []), ...(save ? ["-v", `${save.volume ?? NATIVE_STATES}:${SAVE_MOUNT}`] : [])];
}

/** A snapshot may only begin a chain. */
export function checkStates(states) {
  const at = states.findIndex((s, i) => i > 0 && s.state);
  if (at > 0) throw new Error(`native chain: a native state at position ${at}; a snapshot may only begin the chain`);
  if (states.length && states.at(-1).state) throw new Error("native chain: the last state is a snapshot; nothing would run");
}

/**
 * What a replay proved it ran (pure): the markers in its stdout against what its script was built to do.
 * `expect`: steps (intermediate states run), exit (the final install), tsc, tests, restored, cleaned (count),
 * removed (count), lanes (captures), saved. Returns { ran, missing }; `missing` empty means every part ran.
 */
export function provenRun(stdout, expect) {
  const lines = String(stdout).split("\n"), pick = (p) => lines.filter((l) => l.startsWith(p)).map((l) => l.slice(p.length));
  const ran = {
    steps: pick("@@step ").length, exit: pick("@@exit ").length, tsc: pick("@@tsc ").length, tests: pick("@@vt ").length,
    restored: pick("@@restored ").map((l) => Number(l.split(" ")[1])), cleaned: pick("@@cleaned ").filter((l) => Number(l.split(" ")[1]) >= 0).length,
    removed: pick("@@removed ").length, lanesCaptured: pick("@@lanecap ").length,
    filesCaptured: pick("@@lanecap ").reduce((n, l) => n + Number(l.split(" ")[1] ?? 0) + Number(l.split(" ")[2] ?? 0), 0),
    mergesApplied: pick("@@twosided ").length, laneFailures: pick("@@lanefail ").length, saved: pick("@@saved ").length,
  };
  const missing = [];
  const want = (name, got, n) => { if (got !== n) missing.push(`${name} ${got} of ${n}`); };
  want("states run", ran.steps, expect.steps ?? 0);
  want("final install", ran.exit, 1);
  if (expect.tsc) want("build", ran.tsc, 1);
  if (expect.tests) want("vitest", ran.tests, 1);
  if (expect.restored) { if (ran.restored.length !== 1 || !(ran.restored[0] > 1)) missing.push(`snapshot restored ${ran.restored.length} of 1${ran.restored.length ? ` (${ran.restored[0]} entries)` : ""}`); }
  else if (ran.restored.length) missing.push(`snapshot restored ${ran.restored.length} of 0`);
  want("native clean", ran.cleaned, expect.cleaned ?? 0);
  want("reconcile removal", ran.removed, expect.removed ?? 0);
  if (expect.lanes) { want("lanes captured", ran.lanesCaptured, expect.lanes); want("lane merges applied", ran.mergesApplied, 1); want("lane failures", ran.laneFailures, 0); }
  if (expect.saved) want("snapshot saved", ran.saved, 1);
  if (pick("@@restorefail ").length) missing.push(`snapshot extraction failed: ${pick("@@restorefail ").join("; ")}`);
  return { ran: { ...ran, restored: ran.restored.length ? ran.restored[0] : 0 }, missing };
}
