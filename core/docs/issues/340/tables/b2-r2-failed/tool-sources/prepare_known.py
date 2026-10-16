"""Exact stopped root-result mapping and original deployed pin check; no ledger input."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

RUN = Path('/Users/yifanxu/.codex/issue340-independent/b2-r2')
CONTROL = Path(__file__).resolve().parent
OUT = RUN / 'analysis-preparation'
OUT.mkdir(exist_ok=False)
checkpoint = CONTROL.parent / 'b2-r2-observation/checkpoint-l0-r1'
known = {
    'e67a968f-1': {'path': 'init.json'},
    '7e57e004-1': {'path': 'observer-service.json', 'resultPath': ['id']},
    '7e57e004-2': {'path': 'initial-stats.json'},
    '428bb74c-1': {'path': str(checkpoint / 'stats.json'), 'resultPath': ['result']},
    '428bb74c-2': {'path': str(checkpoint / 'snapshot.json'), 'resultPath': ['result']},
    '428bb74c-3': {'path': str(checkpoint / 'branches-page-0.json'), 'resultPath': ['result']},
}
def pin(path):
    path = Path(path).resolve()
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
def save(name, value):
    with (OUT / name).open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')
save('known-root-results.json', known)
sources = [pin(RUN / row['path']) for row in known.values()]
sources += [pin(CONTROL.parent / name) for name in ('run-init.mjs', 'run-initial-stats.mjs', 'run-observe.mjs', 'normalize_receipts.py')]
sources += [pin(RUN / 'receipts' / (stem + suffix)) for stem in ('001-init', '002-initial-stats', '003-checkpoint-l0') for suffix in ('.json', '.stdout', '.stderr')]
save('root-result-provenance.json', {'classification': 'Explicit exact retained result mapping; no outcome guessed', 'sources': sources,
                                   'mapping': pin(OUT / 'known-root-results.json'), 'generator': pin(__file__),
                                   'contract': 'service() string retained as observer-service.id by root source. Checkpoint results unwrapped from complete envelopes; exact trace IDs/method/step mapping.'})
source = CONTROL.parent / 'report-preparation/independent-b2-r2-preinit-check-r1.json'
before = json.loads(source.read_text())
checks = []
for row in before['checks']:
    current = pin(row['path'])
    current.update(group=row['group'], matchesPreinit=current['bytes'] == row['bytes'] and current['sha256'] == row['sha256'])
    checks.append(current)
assert len(checks) == 65 and all(row['matchesPreinit'] for row in checks)
save('post-close-source-pins.json', {'status': 'PASS', 'matched': len(checks), 'checks': checks, 'source': pin(source),
                                  'utc': datetime.now(timezone.utc).isoformat(),
                                  'scope': 'Only original content pins checked; no preinit HOME/volume assertion or SDK execution replayed.'})
print(json.dumps({'status': 'READY', 'mappedResults': 6, 'sourcePinsUnchanged': len(checks)}))
