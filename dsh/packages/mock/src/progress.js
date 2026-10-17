// How far each scenario's latest run got, from the replies the adapter sends.
// A run starts when the root agent of a new root Session asks for its first
// reply; its subagents add their own steps. One run per scenario is kept: the
// demo workspace has one Session per scenario, and Replay starts a new one.
//   { root, state: running | done | stopped, done, of, phase, error, started, ended }
// A run stops on a scenario error, or when one of its requests is aborted.
// `done` and `of` sum every agent's finished and total steps.
//
// Checkpoints (#352): a scenario's root steps may each reach one
// (scenario.js). When the root agent finishes such a step, the run records it
// with the time, and writes the scenario's journal,
// <journalDir>/<scenario>.json, whole. A run that is no longer in memory (dsh
// web restarted) reads as its journal: the checkpoints it reached stay shown,
// and the run reads as interrupted.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export class Progress {
  /**
   * @param {Map<string, object>} scenarios compiled scenarios by model id
   * @param {string | null} journalDir where each scenario's checkpoint journal is kept; null keeps none
   */
  constructor(scenarios, journalDir = null) {
    this.scenarios = scenarios;
    this.journalDir = journalDir;
    /** scenario id -> run */
    this.runs = new Map();
  }

  /** The scenario's journal, or null. */
  journal(scenario) {
    if (!this.journalDir) return null;
    try { return JSON.parse(readFileSync(join(this.journalDir, `${scenario}.json`), "utf8")); } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }

  write(scenario, run) {
    if (!this.journalDir) return;
    mkdirSync(this.journalDir, { recursive: true, mode: 0o700 });
    const file = join(this.journalDir, `${scenario}.json`);
    const agents = Object.values(run.agents);
    const counts = { done: agents.reduce((n, a) => n + a.done, 0), of: agents.reduce((n, a) => n + a.of, 0) };
    writeFileSync(`${file}.tmp`, JSON.stringify({ root: run.root, started: run.started, state: run.state, ended: run.ended, error: run.error, ...counts, reached: run.reached }, null, 2));
    renameSync(`${file}.tmp`, file);
  }

  /**
   * Records the reply about to be sent to `agent` of `scenario`.
   * @param {string} scenario model id
   * @param {string} agent the scenario's agent name
   * @param {{ kind: string, done: number, of: number, phase: string | null, message?: string }} reply from nextReply
   * @param {string | undefined} sessionId the requesting agent's Session
   */
  report(scenario, agent, reply, sessionId) {
    let run = this.runs.get(scenario);
    if (agent === "root" && run?.root !== sessionId) {
      const steps = Object.entries(this.scenarios.get(scenario).agents);
      run = { root: sessionId, state: "running", agents: Object.fromEntries(steps.map(([name, list]) => [name, { done: 0, of: list.length }])), phase: null, error: null, started: Date.now(), ended: null, reached: [] };
      this.runs.set(scenario, run);
      this.write(scenario, run);
    }
    if (!run || run.state !== "running") return;
    run.agents[agent] = { done: reply.done, of: reply.of };
    if (agent === "root" && reply.phase) run.phase = reply.phase;
    let changed = false;
    if (agent === "root") {
      for (const c of this.scenarios.get(scenario).checkpoints ?? []) {
        if (c.index < reply.done && !run.reached.some((r) => r.index === c.index)) { run.reached.push({ index: c.index, at: Date.now() }); changed = true; }
      }
    }
    if (reply.kind === "error") { Object.assign(run, { state: "stopped", error: `${agent}: ${reply.message}`, ended: Date.now() }); changed = true; }
    else if (agent === "root" && reply.done === reply.of) { Object.assign(run, { state: "done", ended: Date.now() }); changed = true; }
    if (changed) this.write(scenario, run);
  }

  /** A request of the run was aborted (the user stopped the agents): the run is stopped. */
  stop(scenario, agent) {
    const run = this.runs.get(scenario);
    if (run?.state === "running") {
      Object.assign(run, { state: "stopped", error: `stopped while ${agent} worked`, ended: Date.now() });
      this.write(scenario, run);
    }
  }

  /**
   * The scenario's checkpoints with the latest run's progress through them:
   * { label, verdict, note, reachedAt } each, reachedAt null until reached.
   */
  checkpoints(scenario) {
    const defined = this.scenarios.get(scenario)?.checkpoints ?? [];
    const reached = this.runs.get(scenario)?.reached ?? this.journal(scenario)?.reached ?? [];
    return defined.map(({ index, ...c }) => ({ ...c, reachedAt: reached.find((r) => r.index === index)?.at ?? null }));
  }

  /**
   * @param {string} scenario model id
   * @returns {object | null} the latest run's summary, or null before any run
   */
  get(scenario) {
    const run = this.runs.get(scenario);
    if (!run) {
      // a run from before dsh web restarted: what its journal kept
      const saved = this.journal(scenario);
      if (!saved) return null;
      const cut = saved.state === "running";
      return { root: saved.root, state: cut ? "stopped" : saved.state, error: cut ? "interrupted: dsh web restarted" : saved.error ?? null,
        phase: null, started: saved.started, ended: saved.ended ?? (cut ? saved.started : null), reached: saved.reached, done: saved.done, of: saved.of, journal: true };
    }
    const agents = Object.values(run.agents);
    const { agents: _, ...rest } = run;
    return { ...rest, done: agents.reduce((n, a) => n + a.done, 0), of: agents.reduce((n, a) => n + a.of, 0) };
  }
}
