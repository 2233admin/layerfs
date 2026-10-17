// Each demo's run speed: how fast the mock plays its scenario, not how fast a
// view animates it. A speed divides the scenario's pauses and the typing
// between streamed words; 0 (Max) leaves them out. Commands, LayerFS calls
// and waits on other agents take the time they take at any speed. A demo
// starts at its scenario's `speed`; the client's speed button sets it
// (POST /layerfs-demo/<id>/speed), and a pause already under way follows the
// new speed at once.
export const SPEEDS = [1, 2, 4, 0];

export class Pace {
  /** @param {Map<string, { speed?: number }>} scenarios */
  constructor(scenarios) {
    this.scenarios = scenarios;
    this.speeds = new Map();
    this.waiters = new Set();
  }

  get(name) { return this.speeds.get(name) ?? this.scenarios.get(name)?.speed ?? 1; }

  set(name, speed) {
    if (!SPEEDS.includes(speed)) throw Object.assign(new Error(`speed is one of ${SPEEDS.join(", ")}`), { status: 400, code: "invalid-speed" });
    this.speeds.set(name, speed);
    for (const wake of [...this.waiters]) wake();
    return speed;
  }

  /**
   * Waits out `ms` of the scenario's time at `name`'s speed: at 2× a 1000 ms
   * pause takes 500 ms. A speed change mid-pause applies to what is left.
   */
  async wait(name, ms, signal) {
    let left = ms;
    while (left > 0) {
      if (signal?.aborted) throw abortError();
      const speed = this.get(name);
      if (!speed) return;
      const since = Date.now();
      await new Promise((resolve, reject) => {
        const end = () => { clearTimeout(timer); this.waiters.delete(done); signal?.removeEventListener("abort", stop); };
        const done = () => { end(); resolve(); };
        const stop = () => { end(); reject(abortError()); };
        const timer = setTimeout(done, left / speed);
        this.waiters.add(done);
        signal?.addEventListener("abort", stop, { once: true });
      });
      left -= (Date.now() - since) * speed;
    }
  }
}

const abortError = () => Object.assign(new Error("aborted"), { name: "AbortError" });
