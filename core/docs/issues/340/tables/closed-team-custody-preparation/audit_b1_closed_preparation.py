"""Verify retained pre-close streams for the 18 already-closed B1 team Sandboxes.
This is a source-pinned partial preparation inventory, never final run cleanup.
"""
import csv
from datetime import datetime
import hashlib
import json
from pathlib import Path
import sys

RUN = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs/core/target/issue340/b1')
SELECTIONS = [
    ('I1', 'I1-144', 'out/daemon-capture.json', 'daemon', ''),
    ('I2', 'I2-284', 'out/daemon/receipt.json', 'out/daemon', ''),
    ('I2b', 'I2b-082', 'daemon/capture.json', 'daemon', ''),
    ('W1', 'W1-159', 'out/daemon-log-capture.json', 'daemon', ''),
    ('W1b', 'W1b-050', 'out/daemon-log-capture.json', 'daemon', ''),
    ('W1c', 'W1c-130', 'daemon/capture.json', 'daemon', ''),
    ('W1d', 'W1d-082', 'daemon/capture.json', 'daemon', ''),
    ('W1e', 'W1e-148', 'daemon/capture.json', 'daemon', ''),
    ('W2', 'W2-102', 'daemon/log-collection.json', 'daemon', ''),
    ('W2', 'W2-111', 'daemon/review-log-collection.json', 'daemon', 'review-'),
    ('W2b', 'W2b-082', 'daemon/log-collection.json', 'daemon', ''),
    ('W2c', 'W2c-173', 'daemon/capture.json', 'daemon', ''),
    ('P1', 'P1-082', 'daemon/capture.json', 'daemon', ''),
    ('P1b', 'P1b-203', 'daemon/capture.json', 'daemon', ''),
    ('P1c', 'P1c-173', 'daemon/capture.json', 'daemon', ''),
    ('P1d', 'P1d-096', 'daemon/capture.json', 'daemon', ''),
    ('lead', 'lead-0113', 'daemon/lead-initial/capture.json', 'daemon/lead-initial', ''),
    ('lead', 'lead-0230', 'daemon/lead-halt-20261016T002724Z/capture.json', 'daemon/lead-halt-20261016T002724Z', ''),
]


def pin(path):
    result = hashlib.sha256()
    with path.open('rb') as stream:
        while chunk := stream.read(1024 * 1024):
            result.update(chunk)
    return {'path': str(path), 'bytes': path.stat().st_size, 'sha256': result.hexdigest()}


def clock(value, end=False):
    keys = ('end', 'endUTC', 'endUtc', 'endedAt', 'ended') if end else ('start', 'startUTC', 'startUtc', 'startedAt', 'started')
    return next((value[key] for key in keys if value.get(key)), None)


def generate(output):
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    rows, sources, late = [], {}, []
    for agent, receipt_name, capture_name, directory, prefix in SELECTIONS:
        root = RUN / 'agents' / agent
        close_path = root / 'out/calls' / (receipt_name + '.json')
        capture_path = root / capture_name
        close = json.loads(close_path.read_text())
        capture = json.loads(capture_path.read_text())
        for path in (close_path, capture_path):
            sources[str(path)] = pin(path)
        assert close['method'] == 'sandbox.close' and close['result']['kind'] == 'Closed'
        sandbox = close['result']['id']
        captured_sandbox = capture.get('sandbox', capture.get('selectedSandbox'))
        command = capture.get('command', capture.get('argv'))
        if not captured_sandbox and command:
            captured_sandbox = 'sb_' + command[-1]
        if not captured_sandbox and capture.get('container'):
            captured_sandbox = 'sb_' + capture['container']
        assert captured_sandbox == sandbox
        assert capture.get('exitCode', capture.get('exit', capture.get('status'))) == 0
        capture_end, close_start, close_end = clock(capture, True), clock(close), clock(close, True)
        assert datetime.fromisoformat(capture_end) < datetime.fromisoformat(close_start)
        after_capture = []
        for call_path in sorted((root / 'out/calls').glob('*.json')):
            call = json.loads(call_path.read_text())
            started = clock(call)
            if started and call.get('method') != 'sandbox.close' and datetime.fromisoformat(capture_end) <= datetime.fromisoformat(started) < datetime.fromisoformat(close_start):
                sources[str(call_path)] = pin(call_path)
                after_capture.append({'source': str(call_path), 'method': call.get('method'), 'start': started})
        late.extend({'sandbox': sandbox, **row} for row in after_capture)
        for stream_name in ('stdout', 'stderr'):
            path = root / directory / (prefix + stream_name + '.log')
            actual = pin(path)
            sources[str(path)] = actual
            choices = capture.get('streams', capture)
            expected = next((value for key, value in choices.items() if isinstance(value, dict) and stream_name in key), None)
            if expected is None:
                expected = {'bytes': capture[stream_name + 'Bytes']}
            assert actual['bytes'] == expected['bytes']
            if expected.get('sha256'):
                assert actual['sha256'] == expected['sha256']
            rows.append({'agent': agent, 'sandbox': sandbox, 'close_receipt': str(close_path),
                         'capture_receipt': str(capture_path), 'capture_end': capture_end,
                         'close_start': close_start, 'close_end': close_end,
                         'stream': stream_name, **actual,
                         'recorded_digest_matched': expected.get('sha256') is not None,
                         'same_agent_calls_between_capture_and_close': len(after_capture),
                         'contract': 'Saved snapshot before close; later calls/close terminal output may not be included. W1 original capture records byte counts only; its digest is independently observed now.'})
    for source in sources.values():
        assert pin(Path(source['path'])) == source
    columns = list(rows[0])
    table = output / 'b1-closed-team-custody-preparation.csv'
    with table.open('x', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    report = {'classification': 'Partial preparation: exact 18 already-closed team Sandboxes only; not final B1 cleanup',
              'sandboxes': len(SELECTIONS), 'streams': len(rows),
              'generator': pin(Path(__file__)), 'sources': list(sources.values()),
              'sameAgentCallsAfterCaptureBeforeClose': late,
              'requiredFinalDaemonSelection': 'agents/**/daemon/**/*.log includes I2/out/daemon and nested lead streams; root complete observer streams selected separately; partial captures excluded from daemon derivation, retained in raw archives'}
    (output / (table.name + '.sources.json')).write_text(json.dumps(report, indent=2) + '\n')
    (output / Path(__file__).name).write_bytes(Path(__file__).read_bytes())
    print(json.dumps({'sandboxes':len(SELECTIONS), 'streams':len(rows), 'lateCalls':len(late), 'sourceCount':len(sources), 'table':pin(table)}))


if __name__ == '__main__':
    generate(sys.argv[1])
