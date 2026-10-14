"""Tabulate the evidence lines of the long_branch_session test.

usage: long_branch_table.py <log> [<log> ...]

Reads `LONG_BRANCH`, `LONG_BRANCH_LEAF` and `LONG_BRANCH_LATER` lines and
prints one Markdown table per kind. It reads logs only and runs nothing.
"""
import re
import sys


def structs(line):
    """name=Struct { a: 1, b: 2 } -> {name: {a: 1, b: 2}}; bare k=v too."""
    out = {}
    for name, body in re.findall(r"(\w+)=\w+ \{ ([^}]*) \}", line):
        out[name] = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", body)}
    bare = re.sub(r"\w+=\w+ \{ [^}]*\}", "", line)
    for key, value in re.findall(r"(\w+)=(\S+)", bare):
        out[key] = int(value) if value.isdigit() else value
    return out


def table(header, rows):
    print("| " + " | ".join(header) + " |")
    print("| " + " | ".join("---" if i == 0 else "---:" for i, _ in enumerate(header)) + " |")
    for row in rows:
        print("| " + " | ".join(str(cell) for cell in row) + " |")
    print()


def main(paths):
    steps, leaves, later = [], [], []
    for path in paths:
        for line in open(path, errors="replace"):
            if line.startswith("LONG_BRANCH_LEAF "):
                leaves.append(structs(line))
            elif line.startswith("LONG_BRANCH_LATER "):
                later.append(structs(line))
            elif line.startswith("LONG_BRANCH "):
                steps.append(structs(line))
    for shape in sorted({s["shape"] for s in steps}):
        print(f"### {shape}: steps of a new session\n")
        rows = []
        for s in steps:
            if s["shape"] != shape or s["step"] == "open":
                continue
            if s["step"] == "commit" and s["n"] not in (1, 2, 50):
                continue
            if s["step"] == "lookup_read" and s["n"] != 1:
                continue
            p, w, r, rs = s.get("producer", {}), s["writer"], s["readers"], s.get("reader_storage", {})
            rows.append([
                s["P"], f'{s["step"]} {s["n"]}' if s["step"] == "commit" else s["step"], s["wall_us"],
                p.get("selections", 0), p.get("catalogue", 0), p.get("locate", 0), p.get("read_bytes", 0),
                w["transactions"], w["statements"], w["vm_steps"], w["fullscan_steps"], w["sorts"], w["reprepares"],
                rs.get("selections", 0), rs.get("catalogue", 0), r["transactions"], r["statements"], r["blob_bytes"],
            ])
        table(["P", "step", "wall us", "prod pack reads", "prod catalogue", "prod locate", "prod bytes",
               "writer tx", "writer stmts", "writer VM steps", "writer fullscan", "writer sorts", "writer reprep",
               "reader pack reads", "reader catalogue", "reader tx", "reader stmts", "reader bytes"], rows)
    print("### Commits 2..N of the session, summed\n")
    table(["shape", "P", "commits", "wall us", "pack reads", "catalogue", "locate", "bytes read", "writer tx",
           "writer stmts", "writer VM steps", "fullscan", "sorts", "reprep", "writer tx us"],
          [[l["shape"], l["P"], l["commits"], l["wall_us"], l["selections"], l["catalogue"], l["locate"],
            l["read_bytes"], l["writer_transactions"], l["writer_statements"], l["writer_vm_steps"],
            l["writer_fullscan"], l["writer_sorts"], l["writer_reprepares"], l["writer_transaction_us"]]
           for l in later])
    print("### One cold reader, one inode leaf\n")
    table(["shape", "P", "wall us", "pack reads", "whole", "ranges", "catalogue", "locate", "bytes",
           "chain edges", "records", "value groups decoded", "pooled fetches", "tx", "stmts", "sorts"],
          [[l["shape"], l["P"], l["wall_us"], l["storage"]["selections"], l["storage"]["whole"],
            l["storage"]["ranges"], l["storage"]["catalogue"], l["storage"]["locate"], l["storage"]["read_bytes"],
            l["pooled"]["chain_edges"], l["pooled"]["physical_record_calls"], l["pooled"]["value_group_decodes"],
            l["pooled"]["pack_fetches"], l["sql"]["transactions"], l["sql"]["statements"], l["sql"]["sorts"]]
           for l in leaves])


if __name__ == "__main__":
    main(sys.argv[1:])
