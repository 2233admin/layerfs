"""Source-pinned JSON-only metadata tables, using unchanged Evidence.write."""
import hashlib
import json
import sys
from pathlib import Path

REPO = Path('/Users/yifanxu/.codex/worktrees/issue340-node-multiagent/layerfs')
RUN = REPO/'core/target/issue340/b1'
EXPORT = Path('/Users/yifanxu/.codex/issue340-evidence/b1')
CONTROL = Path(__file__).resolve().parent
sys.path.insert(0,str(REPO/'core/target/issue340/analysis'))
from evidence import Evidence
sources = {}


def pin(path):
    data = path.read_bytes()
    return {'path':str(path.resolve()),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}


def load(path):
    sources[str(path.resolve())] = pin(path)
    return json.loads(path.read_text())


verification = load(EXPORT/'verification.json')
raw_files = load(EXPORT/'raw-files.json')
identity = load(EXPORT/'export-identity.json')
profile = load(EXPORT/'portable-destination-profile.json')
assert verification['status']=='PASS' and verification['stopped'] is True
artifact_rows = []
for name,value in raw_files.items():
    artifact_rows.append({'artifact':'raw-store'+name,'bytes':value['bytes'],'sha256':value['sha256'],
                          'exists':value['exists'],'source':'raw-files.json','verification':'root stopped export PASS',
                          'contract':'Derived from retained root JSON verification; analyst did not read/open Store binary'})
for name,key in [('portable-export','portable_store'),('raw-volume-archive','raw_archive'),('checksum-manifest','checksum_manifest')]:
    artifact_rows.append({'artifact':name,**verification[key],'source':'verification.json',
                          'verification':'root stopped export PASS','contract':'Derived from retained root JSON verification; analyst did not read/open Store binary'})
selection = load(CONTROL.parent/'b1-log-filter/summary.json')
selection_rows = []
for stream in selection['streams']:
    selection_rows.append({'stream':stream['name'],'input_bytes':stream['inputBytes'],'input_lines':stream['inputLines'],
                           'selected_bytes':stream['selectedBytes'],'selected_lines':stream['selectedLines'],
                           'omitted_numeric_sections':stream['omittedNumericSections'],'distinct_omitted_scopes':stream['omittedScopes'],
                           'malformed_numeric_retained':stream['malformedNumericLinesRetained'],'parts':stream['partCount'],
                           'original':stream['original'],'selected':stream['selected'],'verification':stream['verification'],
                           'contract':'Derived selected numeric scopes; all originals retained unchanged; external omission counts remain distinct from generator further selection'})
combined=selection['combined']
selection_rows.append({'stream':'combined','input_bytes':combined['inputBytes'],'input_lines':combined['inputLines'],
                       'selected_bytes':combined['selectedBytes'],'selected_lines':combined['selectedLines'],
                       'omitted_numeric_sections':combined['omittedNumericSections'],'distinct_omitted_scopes':combined['distinctOmittedScopes'],
                       'parts':combined['partCount'],'contract':'Distinct omitted scopes from sealed helper combined inventory; no sum of overlapping phase timings'})
installation = load(RUN/'analysis-preparation-stage2/installation-evidence.json')
commits = {row['id']:row for row in load(RUN/'sql-normalization/commits.json')}
install_rows=[]
for row in installation['rows']:
    commit=commits[row['commit']] if row['commitKind']=='Committed' else {}
    install_rows.append({'agent':row['agent'],'sequence':row['sequence'],'install_trace_id':row['installTraceId'],
                         'commit_trace_id':row['commitTraceId'],'commit':row['commit'],'commit_kind':row['commitKind'],
                         'overall_command_exit_code':row['overallCommandExitCode'],'lockfile_sha256':row['lockfileSha256'],
                         'observed_root_census':row['rootCensus'],'whole_save_new_canonical':commit.get('newCanonical'),
                         'whole_save_new_stored':commit.get('newStored'),'whole_save_new_metadata_subset':commit.get('newMetadata'),
                         'source_receipt':row['sourceReceipt'],'command_source':row['commandSource'],
                         'contract':'Census proves npm install completed; later command failures retained; whole-Save increments include all changes; no exclusive dependency allocation; UpToDate borrows no old Save'})
roster = load(RUN/'analysis-preparation/roster-preparation-r1.json')['agents']
calls_path=RUN/'normalized-receipts/calls.jsonl'
sources[str(calls_path.resolve())]=pin(calls_path)
calls=[json.loads(line) for line in calls_path.read_text().splitlines() if line.strip()]
actor_rows=[]
for actor in roster:
    observed=sorted({row['result']['branch'] for row in calls if row['agent']==actor['id'] and row['method']=='sandbox.mount' and isinstance(row.get('result'),dict)})
    actor_rows.append({'agent':actor['id'],'logical_role':actor['role'],'logical_lane':actor['lane'],
                       'assigned_branch':actor.get('actualBranch'),'observed_mount_branches':observed,
                       'source_lane':actor.get('sourceLane'),'source_agent':actor.get('sourceAgent'),
                       'exact_spawn':actor['started'],'exact_termination':actor['ended'],
                       'recorded_boundaries':actor.get('retainedBoundaryFields'),'contract':actor.get('agentClockContract')})
output=REPO/'core/docs/issues/340/tables/b1-final-metadata-r1'
output.mkdir(exist_ok=False)
tables={
 'b1-stopped-artifacts.csv':(artifact_rows,'artifact bytes sha256 exists source verification contract'),
 'b1-daemon-selection.csv':(selection_rows,'stream input_bytes input_lines selected_bytes selected_lines omitted_numeric_sections distinct_omitted_scopes malformed_numeric_retained parts original selected verification contract'),
 'b1-installations.csv':(install_rows,'agent sequence install_trace_id commit_trace_id commit commit_kind overall_command_exit_code lockfile_sha256 observed_root_census whole_save_new_canonical whole_save_new_stored whole_save_new_metadata_subset source_receipt command_source contract'),
 'b1-actor-branches.csv':(actor_rows,'agent logical_role logical_lane assigned_branch observed_mount_branches source_lane source_agent exact_spawn exact_termination recorded_boundaries contract'),
}
for path in [Path(__file__),REPO/'core/target/issue340/analysis/evidence.py']:
    sources[str(path.resolve())]=pin(path)
source_list=sorted(sources.values(),key=lambda row:row['path'])
for name,(rows,columns) in tables.items():
    Evidence.write(None,output,name,rows,columns.split())
    (output/(name+'.sources.json')).write_text(json.dumps({'table':name,'classification':'Diagnostic JSON-only retained metadata derivation; tracing on; unknown cache','sources':source_list,'contract':'Source JSON root verification supports binary artifact sizes; no independent Store binary access by this analyst. Missing values remain unavailable.'},indent=2)+'\n')
summary={'classification':'Diagnostic source-pinned metadata; no Store/SDK/application call','tables':{name:len(rows) for name,(rows,columns) in tables.items()},'disposable':profile,'crossAgentReinstallationComparison':installation['crossAgentReinstallationComparison']}
(output/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
for source in source_list:
    assert pin(Path(source['path']))==source
outputs={str(path.relative_to(output)):pin(path) for path in sorted(output.iterdir()) if path.is_file()}
(output/'manifest.json').write_text(json.dumps({'sources':source_list,'outputs':outputs},indent=2)+'\n')
print(json.dumps({'output':str(output),**summary}))
