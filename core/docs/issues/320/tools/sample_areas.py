"""Aggregate a macOS `/usr/bin/sample` call graph of the Commit wall-anatomy loop.

usage: sample_areas.py <sample.txt> [--top N] [--thread NAME-SUBSTRING]

Reads the "Call graph:" section, rebuilds each thread's tree from the
indentation, and attributes every sample to the chain of areas its stack passes
through, outermost first. An area is a substring rule on a frame's symbol; the
rules are listed below and nothing else is inferred. Counts are samples; the
caller converts them with the loop's own wall clock.

Printed for each thread: samples by area chain, then two folded views of the
Commit thread (by outer product area, and by kind of leaf work).
"""
import collections
import re
import sys

LINE = re.compile(r"^(?P<guide>[ +!:|]*?)(?P<count>\d+) (?P<symbol>.*)$")

# First match wins for one frame. A frame that matches nothing keeps the area
# of its caller. Order: leaf work first, then product areas.
RULES = [
    ("wait", ("__psynch_cvwait", "__psynch_mutexwait", "__ulock_wait", "semaphore_wait_trap",
              "swtch_pri", "__workq_kernreturn", "mach_msg2_trap", "__semwait_signal")),
    ("wake", ("__psynch_cvsignal", "__psynch_cvbroad", "__ulock_wake", "__psynch_mutexdrop")),
    ("alloc", ("_malloc", "_free", "malloc_zone", "_xzm_", "xzm_", "nanov2", "_realloc",
               "szone_", "tiny_", "small_", "__rust_alloc", "__rust_dealloc", "__rust_realloc",
               "__rdl_alloc", "__rdl_dealloc", "__rdl_realloc", "mvm_", "madvise", "_calloc",
               "alloc::raw_vec")),
    ("copy", ("_platform_memmove", "_platform_memset", "_platform_memcmp", "__bzero", "_bzero")),
    ("file-io", ("pread ", "pwrite ", "guarded_pwrite", "read  (in libsystem_kernel",
                 "write  (in libsystem_kernel", "fsync", "__fcntl", "fcntl  (in", "ftruncate",
                 "lseek", "fstat", "lstat", "stat  (in libsystem_kernel", "__open", "close  (in",
                 "access  (in", "unlink  (in")),
    # The macOS system SQLite keeps its page cache in purgeable memory and
    # pins it around use; no other SQLite build does.
    ("sqlite-macos-pcache", ("purgeableCache", "mach_vm_purgable", "pcache_", "purgable")),
    ("clock", ("mach_absolute_time", "clock_gettime", "mach_continuous_time",
               "std::time::Instant", "Instant::now", "Instant::elapsed", "Timespec")),
    ("counters", ("DatabaseWork", "StatementWork", "JobSql", "JobWork", "PayloadWork",
                  "AllocationWork", "diagnostics::metrics", "sql_progress", "Shared::progress",
                  "statement_work", "SqlWork", "read::counters", "Diagnostics",
                  "sqlite3_stmt_status", "sqlite3_status", "checkProfileCallback",
                  "sqlite3_profile", "sqlite3_trace")),
    ("sqlite", ("sqlite3", "(in libsqlite3.dylib)", "rusqlite::")),
    ("zstd", ("ZSTD_", "zstd", "HUF_", "FSE_", "ZSTDMT", "XXH")),
    ("hash", ("blake3", "sha2", "sha256", "Sha256", "polyval", "aes_gcm", "chacha")),
    ("chunking", ("fastcdc", "::cdc::", "chunker", "::chunk::")),
    ("owner.submit", ("layerfs_daemon::overlay::owner::OwnerClient", "submit_waiting",
                      "layerfs_daemon::overlay::admission", "layerfs_daemon::overlay::credits",
                      "layerfs_daemon::overlay::queue", "Pending::wait", "PendingJob")),
    ("owner.job", ("layerfs_daemon::overlay::owner::run", "layerfs_daemon::overlay::commands",
                   "layerfs_daemon::overlay::indexed_operation_record",
                   "layerfs_daemon::overlay::native")),
    ("overlay", ("layerfs_overlay::",)),
    ("persistence", ("layerfs_persistence::",)),
    ("history", ("layerfs_history::",)),
    # The Save's own provider and the pool, delta and pack readers serve reads.
    ("storage.read", ("layerfs_storage::read::", "layerfs_storage::port::read",
                      "layerfs_storage::encoding::pool::read", "layerfs_storage::encoding::decode",
                      "layerfs_storage::encoding::delta::read", "layerfs_storage::save::provider",
                      "layerfs_storage::encoding::pack_cache", "layerfs_storage::pack::layout")),
    ("storage.save", ("layerfs_storage::save::", "layerfs_storage::encoding::delta",
                      "layerfs_storage::encoding::full", "layerfs_storage::encoding::pool",
                      "layerfs_storage::pack::assemble", "layerfs_storage::port::pack",
                      "layerfs_storage::encoding::codec::compress",
                      "layerfs_storage::encoding::pack_units")),
    ("storage", ("layerfs_storage::",)),
    ("content.namespace", ("layerfs_content::filesystem::",)),
    ("content.file", ("layerfs_content::file::", "layerfs_content::construct",
                      "layerfs_content::chunk")),
    ("content.object", ("layerfs_content::object", "layerfs_content::")),
    ("workspace.file", ("layerfs_workspace::construction::captured",)),
    ("workspace.namespace", ("layerfs_workspace::construction",)),
    ("workspace.base", ("layerfs_workspace::",)),
    ("store.ports", ("layerfs_daemon::store::ports", "layerfs_daemon::store::read",
                     "layerfs_daemon::store::open", "layerfs_daemon::store::producer")),
    ("commit.driver", ("commit_captured", "commit_admitted", "layerfs_daemon::store::commit",
                       "layerfs_daemon::store::captured", "layerfs_daemon::store::settle")),
    ("telemetry", ("layerfs_telemetry::",)),
    ("diagnostics", ("diagnostics", "Diagnostics")),
    ("test.driver", ("commit_wall_anatomy::", "captured_drive", "namespace_model",
                     "installed_store", "record_counts")),
]
LEAF = {"wait", "wake", "alloc", "copy", "file-io", "sqlite", "sqlite-macos-pcache", "clock",
        "counters", "zstd", "hash", "chunking"}


def area(symbol):
    for name, needles in RULES:
        if any(needle in symbol for needle in needles):
            return name
    return None


def threads(path):
    """Yield (thread name, [(depth, count, symbol)]) from the call graph."""
    name, rows, inside = None, [], False
    for raw in open(path, errors="replace"):
        line = raw.rstrip("\n")
        if line.startswith("Call graph:"):
            inside = True
            continue
        if not inside:
            continue
        if line.startswith("Total number in stack") or line.startswith("Binary Images"):
            break
        match = LINE.match(line)
        if not match:
            continue
        depth, symbol = len(match["guide"]), match["symbol"]
        if symbol.startswith("Thread_"):
            if name is not None:
                yield name, rows
            name, rows = symbol, []
            continue
        rows.append((depth, int(match["count"]), symbol))
    if name is not None:
        yield name, rows


def chains(rows):
    """Self samples by area chain (tuple, outermost first)."""
    totals = collections.Counter()
    # Stack of (depth, count, chain, children_total)
    stack = []

    def close(until):
        while stack and stack[-1][0] >= until:
            depth, count, chain, children = stack.pop()
            own = count - children
            if own > 0:
                totals[chain] += own
            if stack:
                stack[-1][3] += count  # noqa: updated below through list

    for depth, count, symbol in rows:
        close(depth)
        parent = stack[-1][2] if stack else ()
        found = area(symbol)
        chain = parent if found is None or (parent and parent[-1] == found) else parent + (found,)
        stack.append([depth, count, chain, 0])
    close(-1)
    return totals


def fold(totals, key):
    out = collections.Counter()
    for chain, count in totals.items():
        out[key(chain)] += count
    return out


def show(title, counter, total, top):
    print(f"  {title}")
    for name, count in counter.most_common(top):
        label = name if isinstance(name, str) else " > ".join(name)
        print(f"    {count:8d} {100.0 * count / total:6.2f}%  {label}")


def main():
    arguments = sys.argv[1:]
    path = arguments[0]
    top = int(arguments[arguments.index("--top") + 1]) if "--top" in arguments else 40
    wanted = arguments[arguments.index("--thread") + 1] if "--thread" in arguments else None
    for name, rows in threads(path):
        if wanted and wanted not in name:
            continue
        totals = chains(rows)
        total = sum(totals.values())
        print(f"{name}: {total} samples")
        if total == 0:
            continue
        show("by area chain", totals, total, top)
        commit = {chain: count for chain, count in totals.items() if "commit.driver" in chain}
        if commit:
            inside = sum(commit.values())
            print(f"  inside the Commit driver: {inside} samples "
                  f"({100.0 * inside / total:.2f}% of the thread)")

            def product(chain):
                at = chain[chain.index("commit.driver"):]
                names = [part for part in at if part not in LEAF]
                return " > ".join(names[:4])

            def leaf(chain):
                return chain[-1] if chain[-1] in LEAF else "(own code)"

            def owner(chain):
                names = [part for part in chain if part not in LEAF]
                return names[-1]

            requesters = {"content.namespace", "content.file", "workspace.namespace",
                          "workspace.file", "workspace.base", "commit.driver"}
            services = {"owner.submit", "storage.read", "storage.save", "storage", "persistence",
                        "history", "store.ports"}

            def phase(chain):
                at = chain[chain.index("commit.driver"):]
                asker = "commit.driver"
                for part in at:
                    if part in requesters:
                        asker = part
                    elif part in services:
                        return f"{part} for {asker}"
                return f"{owner(chain)} own code"

            show("Commit: by first service reached, and who asked", fold(commit, phase), inside, top)
            show("Commit: first service x leaf kind",
                 fold(commit, lambda chain: f"{phase(chain)} / {leaf(chain)}"), inside, top)
            show("Commit: by product path (first four areas)", fold(commit, product), inside, top)
            show("Commit: by innermost product area", fold(commit, owner), inside, top)
            show("Commit: by kind of leaf work", fold(commit, leaf), inside, top)
            show("Commit: innermost product area x leaf kind",
                 fold(commit, lambda chain: f"{owner(chain)} / {leaf(chain)}"), inside, top)


if __name__ == "__main__":
    main()
