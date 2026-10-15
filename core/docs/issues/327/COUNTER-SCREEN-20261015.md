# #327 publication accounting screen, 2026-10-15

> **Status:** Dated component measurement receipt; not SDK/FUSE performance or release qualification. All samples are retained.

The prospective specifications v2–v5 were each committed before their implementation and samples. Each arm ran once, off then on, using fixed warm in-memory 128 × 32,768-byte xorshift64 seed-327 inputs and a fresh created-in-sample Store. No cold bandwidth claim, previous Store reuse or unchanged resampling. Explicit Disposable/WAL/OFF, one construction worker, release Cargo +1.85.1 locked/offline. No concurrent owned build or measurement; other host activity was uncontrolled.

| Screen | Off operation ns | On operation ns | Time delta | Off/on allocated B | Delta | Separate verifiers | Verdict |
| --- | ---: | ---: | ---: | --- | ---: | --- | --- |
| v2 | 78,462,500 | 103,624,584 | +32.0689% | 4,435,968 / 4,435,968 | +0.0000% | FAIL: native sealed read-only CannotOpen/Uncertain | FAIL speed |
| v3 | 80,572,167 | 97,499,292 | +21.0087% | 4,435,968 / 4,435,968 | +0.0000% | PASS both, public records + independent SQL | FAIL speed |
| v4 | 75,795,542 | 92,652,500 | +22.2400% | 4,435,968 / 4,440,064 | +0.0923% | PASS both, public records + independent SQL | FAIL speed |
| v5 | 82,626,875 | 83,730,000 | +1.3351% | 4,435,968 / 4,435,968 | +0.0000% | PASS both, public records + independent SQL | PASS |

Gate operands: `on / off <= 1.15` operation and `on / off <= 1.05` allocation; delta is `100 × (on − off) / off`. Wrapper command walls are in each `run-command.json`, all under 15 s; verifiers under 10 s. Complete-child time includes fixture generation and receipt work. One sample is not a repeatability/median claim. No RSS observation was made: UNAVAILABLE; no memory-flatness claim.

V2 had 257 extra SQL wrapper calls. V3 integrated logical totals into insert triggers, leaving one storage UPDATE per Save. V4 moved object/pack accounting to insert triggers but repeated per-locator work and remained slower; it was rejected. V5 retains logical insert triggers and one storage publication UPDATE, with a bounded 64-entry prepared cache in both arms. V5 had 3,027 / 3,157 statements and 81,667 / 89,598 runtime VM steps; SQL statement wall was 40,088,343 / 39,753,495 ns. These observations support retaining counters at this workload; they do not establish that cache eviction alone caused every earlier timing difference. EXPLAIN is paired with runtime counts, rather than used as timing evidence.

V2 verification failures remain in both arms. A direct native diagnostic reproduced CannotOpen on the sealed WAL file without sidecars. V3–v5 public verification uses an independent byte copy with explicit Disposable writable ownership provisioning WAL before the read-only public reader opens. No mutation API runs there. An independent immutable SQLite reader verifies original sealed bytes, WAL header, identity 3/schema 16, integrity, 128 exact messages and logical records, terminal lineage, canonical locators, complete pack bytes, metadata-domain bytes, pages/free space, file length and allocation. No native sealed-sidecar-free read-only capability is claimed.

## Identity and reproduction

Raw evidence root: `core/target/issue327/counters-vN/{off,on}/`. Each arm retains identity/dependency manifests, complete patch, binary/harness/lock hashes, source commit/tree, Rust/Cargo/SQLite versions, host topology/config, commands/stdout/stderr, raw operation and complete command metrics, separate verifier metrics and SQL oracle. The source ablations are experimental detached commits and are never merged.

| Version | Off source | On source | Off binary SHA-256 | On binary SHA-256 |
| --- | --- | --- | --- | --- |
| v2 | `6f61f52d90226e03c09bfd79c7ef6da872f381e2` | `48251cf4b92e8747f42f299b3b790ce1ef215f3e` | `39e750075aa251dac92ab77fc301a38ce8d15f37ab2b0e6a86ee08eaf725e969` | `cd85f70832669b9f38e35178962ff2911f445c7461f009a2780e53f6143a19fa` |
| v3 | `614ac9b8d6e16975d42d455dc98c31cd64280851` | `d956247bd2b0ec5943678eaf8d1b212b5149cb03` | `f16b775a55371f8cdd5f5e8fffcd6b8324c2b23921f0a8584a980a806ba59536` | `8f5cc7771825b8925e73de2f02349df07065e25dc67736fabdefcfeb6dbaa1a4` |
| v4 | `f424c001d6dc49427ec790f3ddded79faeec8ca7` | `d0b9ed062aea5cebbfa78ec4146c60b91864e540` | `6c8e2420d7acd431bcb081eb3b5ac9cd591cf4f22abf114dc51ff2305bf1dfd7` | `ea3871197cc62200d4fbcca4327967d3c01f83599f47770b2d5ec5ad61e838bb` |
| v5 | `ffaf9d19abe8a23f5db39f60499ca5388afab6a7` | `67a57b1ec41870d3566d0b9fadf41893e75316e6` | `dce10250ca566432ace99b241103a8824376278f4e43973950063f609f50d57d` | `43de30202cbca920989916f11d8a4c55a7defa20e41ff1e15389d850c4909cf9` |

Each command read `benchmark_agent_report.md` before invocation. Exact selected commands, one arm per invocation:

```sh
perl core/target/r4-locked.pl 15 python3 -B core/benchmark/issue327-counters-vN.py run off /Users/yifanxu/Ephemeral-AI-Lab/layerfs-327-counter-off core/target/issue327/counters-vN/off
perl core/target/r4-locked.pl 15 python3 -B core/benchmark/issue327-counters-vN.py run on /Users/yifanxu/Ephemeral-AI-Lab/layerfs-issue327 core/target/issue327/counters-vN/on
perl core/target/r4-locked.pl 10 python3 -B core/benchmark/issue327-counters-vN.py verify off /Users/yifanxu/Ephemeral-AI-Lab/layerfs-327-counter-off core/target/issue327/counters-vN/off
perl core/target/r4-locked.pl 10 python3 -B core/benchmark/issue327-counters-vN.py verify on /Users/yifanxu/Ephemeral-AI-Lab/layerfs-issue327 core/target/issue327/counters-vN/on
```

N is the recorded version, not a rerun instruction. Product and source LOC comparisons for every product/ablation commit are recorded in Git and the final Phase checkpoint. Prepared build reuse was an APFS writable clone of release artifacts into the separate experimental worktree followed by Cargo rebuild with its own target. No prepared Store or measured sample was reused. Native ARM64 flags came from `.cargo/config.toml`; dependency/Cargo locks did not change.

**Disposition:** v5 PASS permits retaining publication counters for #327. Earlier screen failures remain FAIL. Durable NOT_RUN — disabled by owner until explicit reauthorization. SDK/UI acceptance is separate.
