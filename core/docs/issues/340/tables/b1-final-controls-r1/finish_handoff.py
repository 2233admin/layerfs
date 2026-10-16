"""Finish external control/table handoff only; B1 RUN is frozen and read-only."""
import csv
import hashlib
import json
import shutil
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

REPO=Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN=REPO/'core/target/issue340/b1'
CONTROL=Path(__file__).resolve().parent
TABLES=REPO/'core/docs/issues/340/tables'
FOLDERS=[TABLES/name for name in ['b1-final-features-r1','b1-final-metadata-r1','b1-final-populations-r1','b1-final-primary-r2','b1-final-supplement-r1']]


def pin(path):
    data=path.read_bytes()
    return {'path':str(path.resolve()),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}


def load(path):
    return json.loads(path.read_text())


def read_csv(path):
    csv.field_size_limit(path.stat().st_size+1)
    with path.open() as stream:
        return list(csv.DictReader(stream))


primary=load(TABLES/'b1-final-primary-r2/summary.json')
populations=load(TABLES/'b1-final-populations-r1/summary.json')
supplement=load(TABLES/'b1-final-supplement-r1/summary.json')
methods=[row for row in read_csv(TABLES/'b1-final-populations-r1/b1-all-methods.csv') if row['dimension']=='overall']
commits=read_csv(TABLES/'b1-final-primary-r2/b1-commit-results.csv')
refusals=read_csv(TABLES/'b1-final-primary-r2/b1-refusals.csv')
failures={'classification':'Host metadata read errors only; no SDK/original evidence effects',
          'toolChunks':['9888fb','45f033'],'exitCode':1,'error':'_csv.Error: field larger than field limit (131072)',
          'diagnosis':'Each fresh Python process reinstates the default CSV field guard; retained full error/merge JSON fields exceed131072. First preview was corrected, but initial handoff snippet omitted the per-process setting.',
          'changedFollowup':'Central read_csv helper sets field limit to1+actual input file size on every read. No data truncation or source algorithm change.'}
(CONTROL/'csv-field-preview-failures.json').write_text(json.dumps(failures,indent=2)+'\n')
ledger=load(CONTROL/'LEDGER.json')
ledger['events'].extend([failures,{'kind':'daemon-selector-correction','r1':'58selectedinputs; partial I2 selection preserved intact under RUN/derived-analysis/primary-r1',
    'cause':'I2rawpair under agents/I2/out/daemon fell outside simple agents/*/daemon glob',
    'repair':'NEWanalysis-view-r2 with all31Sandbox/62rawstreams mapped;60selectedinputs plus2rootstdoutprovenance-only; originalr1inputunchanged',
    'final':'3624fullcalls/5109sources/0qualityissues/4075702counterrows; unchanged analysis algorithms'},
    {'kind':'RUN-FINAL','at':datetime.now(timezone.utc).isoformat(),'statement':'All RUN writes completed before root RAW-SOURCE-FROZEN marker; no further RUN writes by this analyst','remaining':'ExternalCONTROL/final docs table source snapshots only'}])
(CONTROL/'LEDGER.json').write_text(json.dumps(ledger,indent=2)+'\n')
result={
 'classification':'B1 final retained-evidence analysis; diagnostic only; tracing on/cacheunknown; no performance comparison',
 'status':'COMPLETE','at':datetime.now(timezone.utc).isoformat(),'RUN_FINAL':True,'noFurtherRunWrites':True,
 'finalInput':pin(RUN/'analysis-view-r2/analysis-input.json'),'priorFrozenInput':pin(RUN/'analysis-input.json'),
 'primary':{'summary':pin(TABLES/'b1-final-primary-r2/summary.json'),'calls':3624,'fullReplies':3624,'sources':5109,'qualityIssues':0,
            'commitResults':dict(Counter(row['classification'] for row in commits)),
            'headMoved':dict(Counter(row['head_moved_since_mount'] for row in commits)),
            'refusalCodes':dict(Counter(row['code'] for row in refusals))},
 'populations':populations,'supplement':supplement,'overallMethodRows':methods,
 'concurrency':primary['concurrency'],'reconciliation':primary['reconciliation'],
 'daemon':{'closedSandboxes':31,'retainedRawStreams':62,'selectedInputs':60,'rootStdoutProvenanceOnly':2,
           'rawCounterRows':primary['rawCounterRows'],'rawCounterTable':primary['rawCounterTable'],
           'compactCounterRows':primary['compactCounterRows'],'numericScopeCoverage':primary['numericScopeCoverage'],
           'externalOmittedNumericSections':31723230,'externalDistinctOmittedScopes':511665,
           'contract':'Cumulative snapshot ranges only; no counter sum/per-call delta/truepeak/exclusiveallocation; full raw rows retained'},
 'acceptance':{'features':109,'uniquePassingLeaves':716,'packages':{'shared':127,'server':369,'web':153,'cli':67},
               'exactLeafReferences':1180,'exactAcceptanceReferences':121,'originalR1A10AndR2A12FailuresPreserved':True},
 'history':{'commits':562,'layers':10,'logical':25276569623,'logicalGap':0,'commitDependencyBuckets':1116,
            'commitDependencyLogicalBytes':13239014814,'workspaceAllHistory':'partial/unavailable',
            'actualInstallations':10,'installationActors':['lead'],'crossAgentReinstallComparison':'unavailable'},
 'merges':{'branchMergeCalls':22,'fastForward':11,'newMergeCommits':9,'branchMergeConflicts':2,'publishesAdded':9,'nonemptyOverwrote':0},
 'checks':{'existingAnalysis17Tests':'reused unchanged; not rerun','existingNormalizer13Tests':'reused unchanged; not rerun',
           'externalSupplementAdapter':'5meaningfulchecksPASS after retained failing tagged-ref regression; compilation first; each invocation30s',
           'SDKDockerStoreAppProductTests':'none','RustRuntimeChecks':'inapplicable: data/control only; no product implementation edits'},
 'failures':{'ledger':pin(CONTROL/'LEDGER.json'),'adapter':'Original3populationallquarantined64digestassumption retained; fresh-r2 exactSQLmembership fixed it',
             'selector':'r1 preserved as partial daemon selection; fresh r2 covers I2pair','CSVPreview':pin(CONTROL/'csv-field-preview-failures.json')},
 'limitations':['All timings diagnostic/tracingon/cacheunknown','4actualslots includingroot;5logicalroles inwaves; exactspawn/termination and5-roleoverlapunavailable',
   'Logicalroles/lanes distinct from actual mountedBranches','Save gaps319999canonical/108199stored/22133metadata remainunattributed',
   'No exclusive dependencyphysicalallocation or processCPU/RSSpeak','WholeWorkspacehistorypartial;10observedrootcensuses do not establish allnestedtreecoverage',
   'Earlier supplemental census overlapped active team development','Stopped binary sizes/checksums derive rootJSON; analyst never read/opened Store binary',
   '0qualityissues/emptytables do not prove unselected capabilities or absence outside exactinventories'],
 'tableFolders':[str(folder) for folder in FOLDERS],
 'sourcePins':[pin(folder/'manifest.json') for folder in FOLDERS],
 'rawDerivedManifests':[pin(RUN/'derived-analysis/primary-r1/manifest.json'),pin(RUN/'derived-analysis/primary-r2/manifest.json')],
 'controls':'External control source/receipts snapshotted separately under b1-final-controls-r1; immutable feature tables and frozen RUN unchanged',
}
(CONTROL/'FINAL-HANDOFF.json').write_text(json.dumps(result,indent=2)+'\n')
snapshot=TABLES/'b1-final-controls-r1'
snapshot.mkdir(exist_ok=False)
aliases=[]
for path in sorted(CONTROL.iterdir()):
    if path.is_file() and path.suffix in ['.py','.json','.stdout','.stderr']:
        target=snapshot/path.name
        shutil.copyfile(path,target)
        aliases.append({'original':pin(path),'snapshot':pin(target)})
(snapshot/'manifest.json').write_text(json.dumps({'classification':'Exact final external analysis-control source/receipt snapshots; original paths retained as aliases','aliases':aliases},indent=2)+'\n')
files=[path for folder in FOLDERS+[snapshot] for path in folder.rglob('*') if path.is_file()]
sizes={'fileCount':len(files),'bytes':sum(path.stat().st_size for path in files),
       'largest':[{'path':str(path),'bytes':path.stat().st_size} for path in sorted(files,key=lambda path:path.stat().st_size,reverse=True)[:8]],
       'largestSidecar':max(({'path':str(path),'bytes':path.stat().st_size} for path in files if path.name.endswith('.sources.json')),key=lambda row:row['bytes'])}
(CONTROL/'FINAL-SIZES.json').write_text(json.dumps(sizes,indent=2)+'\n')
print(json.dumps({'handoff':pin(CONTROL/'FINAL-HANDOFF.json'),'controlsManifest':pin(snapshot/'manifest.json'),'sizes':sizes},indent=2))
