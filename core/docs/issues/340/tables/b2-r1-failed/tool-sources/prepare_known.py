"""Pin explicit retained root result locations for the unchanged receipt normalizer."""
import hashlib
import json
from pathlib import Path

RUN = Path('/Users/yifanxu/.codex/issue340-independent/b2-r1')
CONTROL = Path(__file__).resolve().parent
OUT = RUN / 'analysis-preparation'
OUT.mkdir(exist_ok=False)
checkpoint = Path('/Users/yifanxu/.codex/issue340-control/b2-r1-observation/checkpoint-l0-r1')
known = {
    '8242bbc6-1': {'path': 'init.json'},
    'af38598b-1': {'path': 'observer-service.json', 'resultPath': ['id']},
    'af38598b-2': {'path': 'initial-stats.json'},
    '69301a80-1': {'path': str(checkpoint / 'stats.json'), 'resultPath': ['result']},
    '69301a80-2': {'path': str(checkpoint / 'snapshot.json'), 'resultPath': ['result']},
    '69301a80-3': {'path': str(checkpoint / 'branches-page-0.json'), 'resultPath': ['result']},
}
def pin(path):
    path = Path(path).resolve()
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

(OUT / 'known-root-results.json').write_text(json.dumps(known, indent=2) + '\n')
sources = [pin(RUN / row['path']) for row in known.values()]
sources += [pin(CONTROL.parent / name) for name in ('run-init.mjs', 'run-initial-stats.mjs', 'run-observe.mjs', 'normalize_receipts.py')]
sources += [pin(RUN / 'receipts' / (stem + suffix)) for stem in ('001-init', '002-initial-stats', '004-checkpoint-l0') for suffix in ('.json', '.stdout', '.stderr')]
report = {'classification': 'Explicit exact-result source mapping; no SDK calls or inferred outcomes',
          'contract': 'Init and initial stats retain direct results. service() returns the string stored as observer-service.id by the source script. Checkpoint sources retain complete result envelopes. Trace IDs are mapped explicitly from exact method/step, never timestamp alone.',
          'mapping': pin(OUT / 'known-root-results.json'), 'sources': sources, 'generator': pin(__file__)}
(OUT / 'root-result-provenance.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'status': 'MAPPED', 'resultCount': len(known), 'mapping': report['mapping']}))
