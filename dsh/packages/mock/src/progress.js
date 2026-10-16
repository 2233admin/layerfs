// How far each scenario's latest run got, from the replies the adapter sends.
// A run starts when the root agent of a new root Session asks for its first
// reply; its subagents add their own steps. One run per scenario is kept: the
// demo workspace has one Session per scenario, and Replay starts a new one.
//   { root, state: running | done | stopped, done, of, phase, error, started, ended }
// A run stops on a scenario error, or when one of its requests is aborted.
// `done` and `of` sum every agent's finished and total steps.

export class Progress {
  /** @param {Map<string, object>} scenarios compiled scenarios by model id */
  constructor(scenarios) {
    this.scenarios = scenarios;
    /** scenario id -> run */
    this.runs = new Map();
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
      run = { root: sessionId, state: "running", agents: Object.fromEntries(steps.map(([name, list]) => [name, { done: 0, of: list.length }])), phase: null, error: null, started: Date.now(), ended: null };
      this.runs.set(scenario, run);
    }
    if (!run || run.state !== "running") return;
    run.agents[agent] = { done: reply.done, of: reply.of };
    if (agent === "root" && reply.phase) run.phase = reply.phase;
    if (reply.kind === "error") Object.assign(run, { state: "stopped", error: `${agent}: ${reply.message}`, ended: Date.now() });
    else if (agent === "root" && reply.done === reply.of) Object.assign(run, { state: "done", ended: Date.now() });
  }

  /** A request of the run was aborted (the user stopped the agents): the run is stopped. */
  stop(scenario, agent) {
    const run = this.runs.get(scenario);
    if (run?.state === "running") Object.assign(run, { state: "stopped", error: `stopped while ${agent} worked`, ended: Date.now() });
  }

  /**
   * @param {string} scenario model id
   * @returns {object | null} the latest run's summary, or null before any run
   */
  get(scenario) {
    const run = this.runs.get(scenario);
    if (!run) return null;
    const agents = Object.values(run.agents);
    const { agents: _, ...rest } = run;
    return { ...rest, done: agents.reduce((n, a) => n + a.done, 0), of: agents.reduce((n, a) => n + a.of, 0) };
  }
}
