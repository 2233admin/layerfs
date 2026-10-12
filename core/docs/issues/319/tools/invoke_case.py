"""One bounded driver call; D-5 seven selections plus owner E-1's named proof."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import time
import uuid

ROOT = Path(__file__).resolve().parents[5]
EXTENDED = frozenset(
    [('run', 'dedup_branch_history:' + case) for case in (
        'dedup-history-distributed-500', 'dedup-history-hotset-500',
        'dedup-history-recurring-500', 'dedup-history-metadata-500',
        'dedup-history-unrelated-500-mixed-v2')]
    + [('prepare', 'mixed_load_bearing:v016-mixed-exhaustive-500mb-30000-k100-v1'),
       ('prepare', 'branch_development:v016-branch-mixed-500mb-30000-k100-v1')])

EXTREME = frozenset([('run','mixed_load_bearing:v016-mixed-exhaustive-500mb-30000-k100-v1')])

# Owner decision 2026-10-12 (phase 13): three 500 MiB mixed runs hold two or three
# mounted role proofs of 18 to 21 s each and do not fit one 2-minute command.
LARGE_ROOT_RUNS = frozenset([
    ('run','multi_workspace_development:v016-workspace-mixed-500mb-30000-k100-v1'),
    ('run','branch_development:v016-branch-mixed-500mb-30000-k10-v1'),
    ('run','branch_development:v016-branch-mixed-500mb-30000-k100-v1')])


def call_policy(kind, item):
    if (kind, item) in LARGE_ROOT_RUNS:
        return {'outer_seconds':300,'driver_seconds':288,
                'reason':'owner 2026-10-12 phase 13: exact three 500MiB mixed runs with two or three mounted role proofs; case verification, command, Commit and performance limits unchanged'}
    if (kind, item) in EXTREME:
        return {'outer_seconds':300,'driver_seconds':288,
                'reason':'expanded owner E-1: exact500MiB exhaustive verification-only run; original300s proof and ordinary individual calls unchanged; complete invocation ceiling120->275s with13s driver return margin'}
    if (kind, item) in EXTENDED and kind == 'run':
        return {'outer_seconds':300,'driver_seconds':288,
                'reason':'owner D-5 outer allowance; expanded owner E-1 five500-step cumulative execution120->210s; individual<=120s/proof/reporting target unchanged'}
    if (kind, item) in EXTENDED:
        return {'outer_seconds':300, 'driver_seconds':288,
                'reason':'owner D-5: exact five500-step runs/two large preparations; inner case watchdog unchanged'}
    return {'outer_seconds':118, 'driver_seconds':110,
            'reason':'ordinary <=120s call; case watchdog unchanged'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('tag')
    parser.add_argument('kind', choices=('prepare', 'run', 'clean', 'report', 'rows'))
    parser.add_argument('item')
    args = parser.parse_args()
    policy = call_policy(args.kind, args.item)
    report = (ROOT / 'benchmark_agent_report.md').read_bytes()
    head = subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    command = ['python3','-B','core/target/issue318/go.py',args.tag,
               str(policy['driver_seconds']),args.kind,args.item]
    home = ROOT / 'core/target/issue319b'
    (home / 'logs').mkdir(parents=True,exist_ok=True)
    log = home / 'logs' / (args.tag + '-' + args.kind + '-' + uuid.uuid4().hex + '.txt')
    started = time.monotonic()
    child = subprocess.Popen(command,cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,
                             text=True,start_new_session=True,
                             env={**os.environ,'LAYERFS_CONSTRUCTION_WORKERS':'1'})
    expired = False
    try:
        output,_ = child.communicate(timeout=policy['outer_seconds']-2)
    except subprocess.TimeoutExpired:
        expired = True
        os.killpg(child.pid,signal.SIGKILL)
        output,_ = child.communicate(timeout=1)
        output += '\nFAILED outer wall stop; retained, never replayed\n'
    record = {'tag':args.tag,'kind':args.kind,'item':args.item,'argv':command,
              'source_commit':head,'policy':policy,'exit':child.returncode,'expired':expired,
              'wall_seconds':time.monotonic()-started,
              'report_template_sha256':hashlib.sha256(report).hexdigest(),
              'log':str(log.relative_to(ROOT))}
    with log.open('x') as stream:
        stream.write(json.dumps(record)+'\n'+output)
    with (home / 'journal.jsonl').open('a') as stream:
        stream.write(json.dumps(record)+'\n')
    print(json.dumps(record))
    for line in output.splitlines():
        # Counts and dispositions only; receipts retain raw phase durations.
        print(' | '.join(p for p in line.split(' | ') if not p.startswith(('exec ', 's '))))
    return child.returncode


if __name__ == '__main__':
    raise SystemExit(main())
