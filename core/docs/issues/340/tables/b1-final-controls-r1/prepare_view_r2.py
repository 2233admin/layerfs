"""Append corrected daemon-selection view without changing frozen r1 input bytes."""
import hashlib
import json
import shutil
from pathlib import Path

REPO=Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN=REPO/'core/target/issue340/b1'
CONTROL=Path(__file__).resolve().parent
view=RUN/'analysis-view-r2'
view.mkdir(exist_ok=False)
config=json.loads((RUN/'analysis-input.json').read_text())
selector_keys=['traces','callReceipts','provenanceSources','events','resolutions','lifecycleEvents','storeCommits','branchHistories','layers','dependencyCensus','decodedDaemon','daemonLogs']
for key in selector_keys:
    paths=set()
    for value in config.get(key,[]):
        source=Path(value)
        matches=[source] if source.is_absolute() else list(RUN.glob(value))
        paths.update(str(path.resolve()) for path in matches if path.is_file())
    config[key]=sorted(paths)
for name in ['initialStats','finalStats']:
    config[name]=str((RUN/config[name]).resolve())
coverage=json.loads((CONTROL/'daemon-coverage-r1.json').read_text())
assert coverage['status']=='PASS' and coverage['retainedRawStreams']==62
(view/'daemon-coverage.json').write_bytes((CONTROL/'daemon-coverage-r1.json').read_bytes())
(view/'daemon_coverage.py').write_bytes((CONTROL/'daemon_coverage.py').read_bytes())
(view/'prepare_view_r2.py').write_bytes(Path(__file__).read_bytes())
for name in ['stdout.log','stderr.log']:
    config['daemonLogs'].append(str((RUN/'agents/I2/out/daemon'/name).resolve()))
config['daemonLogs']=sorted(set(config['daemonLogs']))
assert len(config['daemonLogs'])==60
config['provenanceSources'] += [str((view/name).resolve()) for name in ['daemon-coverage.json','daemon_coverage.py','prepare_view_r2.py']]
config['provenanceSources'] += [row['capture']['path'] for row in coverage['rows']]
config['provenanceSources'] += [str((RUN/'analysis-input.json').resolve()),str((RUN/'analysis-preparation-stage2/input-freeze.json').resolve())]
config['provenanceSources']=sorted(set(config['provenanceSources']))
config['selectionRevision']={'revision':2,'reason':'Add exact I2 stdout/stderr pair under out/daemon missed by r1 folder selector',
                             'rawStreamsRetained':62,'closedSandboxes':31,'selectedInputs':60,'observerStdoutProvenanceOnly':2,
                             'priorInputPreserved':str(RUN/'analysis-input.json'),'contract':'r1 remains retained as partial daemon selection; unrelated method/statistical evidence unchanged'}
(view/'analysis-input.json').write_text(json.dumps(config,indent=2)+'\n')
manifest=view/'analysis-input.json'
freeze={'classification':'Append-only B1 diagnostic selection revision2; no SDK/recapture/product change',
        'manifest':{'path':str(manifest),'bytes':manifest.stat().st_size,'sha256':hashlib.sha256(manifest.read_bytes()).hexdigest()},
        'revision':config['selectionRevision']}
(view/'input-freeze.json').write_text(json.dumps(freeze,indent=2)+'\n')
derived=RUN/'derived-analysis'
derived.mkdir(exist_ok=True)
prior=REPO/'core/docs/issues/340/tables/b1-final-primary-r1'
shutil.move(str(prior),str(derived/'primary-r1'))
print(json.dumps({'status':'R2_VIEW_READY','selectedDaemonInputs':60,'manifest':freeze['manifest'],'retainedPriorDerived':str(derived/'primary-r1')}))
