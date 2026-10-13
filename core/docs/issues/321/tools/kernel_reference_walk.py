"""One allocation/population diagnostic on the original tier-1 tree; no performance eligibility."""
import fcntl, hashlib, json, secrets, subprocess, sys, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[5]
sys.path.insert(0,str(ROOT/'core/benchmark/fs-bench-pro'))
sys.path.insert(0,str(ROOT/'core/benchmark/cluster-two'))
from engine import fixtures
from cells import counts,runner,workloads
build_path,original,out=map(Path,sys.argv[1:4]); out.mkdir(parents=True,exist_ok=False)
lock=(ROOT/'core/target/issue320/measurement.lock').open('a');fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
build=json.loads((build_path/'build.json').read_text());prepared=json.loads((original/'prepared.json').read_text())
clone=fixtures.clone(prepared,out/'clone',build); docker=['docker','--host','unix://'+build['socket']]
env=out/'environment.txt';env.write_text(''.join(k+'='+v+'\n' for k,v in workloads.ENV.items()))
argv=[build['binaries']['runtime']['path'],'serve','--socket',build['socket'],'--volume',clone['volume'],'--daemon',build['binaries']['daemon']['path'],'--manifest',prepared['provision']['manifest'],'--receipt',str(out/'runtime.events.jsonl'),'--uid',str(prepared['source_uid']),'--gid',str(prepared['source_gid']),'--environment-file',str(env),'--observation-scope',secrets.token_hex(32)]
runtime=runner.EventProcess(argv,out,'runtime'); key=secrets.token_hex(32)
result={'label':'original tier-1 mounted lstat walk; allocation/population diagnostic; no timing eligibility or residency bound','source_commit':build['identity']['source_commit'],'source_tree':build['identity']['source_tree'],'case':prepared['case'],'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'cache_scope':'metadata demands after ordinary mount; no cold claim','interference':subprocess.run([*docker,'ps','--format','{{.Names}}'],capture_output=True,text=True,timeout=10).stdout.split()}
try:
 runtime.event('protocol_ready',time.monotonic()+15)
 mounted=runtime.send('mount',key,deadline=time.monotonic()+15)
 runtime.send('snapshot',key,deadline=time.monotonic()+15)
 body=out/'walk.sh';body.write_text("""set -eu
python3 - <<'WALK'
import json,os,stat
seen={'paths':0,'regular_files':0,'directories':0,'symlinks':0,'regular_logical_bytes':0}
for parent,dirs,files in os.walk(b'.',followlinks=False):
 for path in ([parent] if parent==b'.' else [])+[os.path.join(parent,n) for n in dirs+files]:
  s=os.lstat(path);seen['paths']+=1
  if stat.S_ISREG(s.st_mode):seen['regular_files']+=1;seen['regular_logical_bytes']+=s.st_size
  elif stat.S_ISDIR(s.st_mode):seen['directories']+=1
  elif stat.S_ISLNK(s.st_mode):seen['symlinks']+=1
print(json.dumps(seen,sort_keys=True))
WALK
""")
 command=runtime.send('command',key,body,deadline=time.monotonic()+30);result['command']=command
 runtime.send('snapshot',key,deadline=time.monotonic()+15)
 resident=subprocess.run([*docker,'exec','--user','0:0',runtime.container,'/bin/bash','-c',"cat /proc/1/status; for f in /layerfs-local/overlay/*.sqlite; do stat -c '%n %s %b %B' \"$f\"; done"],capture_output=True,text=True,timeout=10)
 (out/'resident.stdout').write_text(resident.stdout);(out/'resident.stderr').write_text(resident.stderr)
 result['resident_exit']=resident.returncode
 log=subprocess.run([*docker,'logs','--timestamps=false',runtime.container],capture_output=True,timeout=10)
 (out/'daemon.log').write_bytes(log.stdout+log.stderr)
 views=[counts.decode(group) for group in runner.telemetry(out/'daemon.log').values()]
 result['open_snapshots']=[{'identity':v['identity'],'operation':v['operation_tag'],'namespace':v['namespace'],'open':v['open_state'],'sql':v.get('stored_counts'),'pages':v.get('pages')} for v in views if 'open_state' in v]
 assert len(result['open_snapshots']) >= 4, 'original before/after numeric endpoints absent'
 before,after=result['open_snapshots'][-2:]
 assert after['open']['kernel_entries'] > before['open']['kernel_entries'], 'walk population did not grow'
 result['measurement_status']='AVAILABLE'
 runtime.send('unmount',key,deadline=time.monotonic()+15)
 deadline=time.monotonic()+10
 while runtime.send('cleanup',key,deadline=deadline)['fields']['state']!='Gone':
  if time.monotonic()>=deadline:raise TimeoutError('cleanup did not establish physical Gone')
 runtime.send('stop',deadline=time.monotonic()+15);runtime.event('finished',time.monotonic()+15)
 result['runtime_exit']=runtime.process.wait(timeout=5);result['functional_status']='PASS'
except BaseException as error:
 result['functional_status']='FAIL';result['failure']=repr(error)
 if runtime.process.poll() is None:runtime.process.kill();runtime.process.wait(timeout=5)
finally:
 if runtime.container:
  inspected=subprocess.run([*docker,'inspect',runtime.container],capture_output=True,text=True,timeout=10)
  (out/'owned-container-inspect.json').write_text(inspected.stdout)
  data=json.loads(inspected.stdout)
  if not any(m.get('Name')==clone['volume'] for row in data for m in row.get('Mounts',[])):raise RuntimeError('container not tied to this diagnostic volume; removal refused')
  removed=subprocess.run([*docker,'rm','--force',runtime.container],capture_output=True,text=True,timeout=10);result['container_removal_exit']=removed.returncode
 removed=subprocess.run([*docker,'volume','rm',clone['volume']],capture_output=True,text=True,timeout=10);result['volume_removal_exit']=removed.returncode
 (out/'result.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
