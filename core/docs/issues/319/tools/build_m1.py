"""Four bounded build steps; reuse seven exact binaries, rebuild two M1 helpers."""
import argparse
import json
import os
from pathlib import Path
import shlex
import shutil
import sys
import uuid

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0,str(ROOT/'core/benchmark/fs-bench-pro'))
from engine import identity,receipts


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('stage',choices=('register','host','linux','seal'))
    parser.add_argument('output')
    parser.add_argument('--previous',default='benchmark-results/fs-bench-pro/2026-10-11-issue318-p319-final-build')
    args=parser.parse_args()
    out=ROOT/args.output
    now=identity.source_identity()
    if args.stage=='register':
        previous=ROOT/args.previous
        receipts.verify_manifest(previous)
        old=json.loads((previous/'build.json').read_text())
        if set(old['binaries'])!=identity.BINARY_KEYS or old['status']!='PASS':
            raise ValueError('nine original PASS binaries required')
        left=identity.compilation_files(old['identity']['files'])
        right=identity.compilation_files(now['files'])
        delta=[p for p in sorted(left.keys()|right.keys()) if left.get(p)!=right.get(p)]
        helper='core/benchmark/fs-bench-pro/writers/v016_m1.rs'
        if delta!=[helper] or now['product_tree']!=old['identity']['product_tree']:
            raise ValueError('only the new core M1 helper may differ: '+repr(delta))
        # The final runtime reuse seal binds its immutable original full build.
        origin=ROOT/'benchmark-results/fs-bench-pro/2026-10-11-issue318-p319-12-build'
        original=json.loads((origin/'build.json').read_text())
        identity.original_build_evidence(origin,original)
        reuse=json.loads((previous/'reuse-scope.json').read_text())
        if reuse['previous_manifest_sha256']!=identity.sha256(origin/'manifest.json'):
            raise ValueError('final seal lacks exact original full-build custody')
        for binary in old['binaries'].values():
            if identity.sha256(binary['path'])!=binary['sha256']:
                raise ValueError('old binary changed')
        if old['global_profile']!='Disposable/WAL/OFF' or old['construction_workers']!=1:
            raise ValueError('profile changed')
        out.mkdir(parents=True,exist_ok=False)
        receipts.write_new(out/'source-before.json',now)
        receipts.write_new(out/'reuse-scope.json',{
            'previous_build':str(previous),'previous_manifest_sha256':identity.sha256(previous/'manifest.json'),
            'changed_compiled_inputs':delta,'unchanged_compiled_files':left,
            'reused_binaries':{k:v for k,v in old['binaries'].items() if k not in ('workload-host','workload-linux')},
            'reason':'Only M1 include changes; seven other binaries still compile the exact original reference sources.'})
        receipts.write_new(out/'previous.json',old)
        source=identity.workload_source()
        receipts.write_new(out/'generated-source.json',{'path':str(source),'sha256':identity.sha256(source)})
        (out/'container-source.sha256').write_text(''.join(d+'  /work/'+p+'\n' for p,d in now['files'].items()))
    else:
        if now!=json.loads((out/'source-before.json').read_text()):
            raise ValueError('source changed between bounded build steps')
        generated=json.loads((out/'generated-source.json').read_text())
        if identity.sha256(generated['path'])!=generated['sha256']:
            raise ValueError('generated source changed')
        if args.stage=='host':
            receipts.command(['rustup','run','1.85.1','rustc','--edition=2021','-O',*identity.ARM64_FLAGS,
                generated['path'],'-o',str(out/'workload-host')],out,'host-m1',110,cwd=ROOT)
        elif args.stage=='linux':
            old=json.loads((out/'previous.json').read_text())
            docker=['docker','--host','unix://'+old['socket']]
            inspected=receipts.command([*docker,'image','inspect',identity.IMAGE,'--format','{{.Id}}'],out,'image',10)
            if Path(inspected['stdout']).read_text().strip()!=identity.IMAGE:
                raise ValueError('pinned image differs')
            name='layerfs-319b-build-'+uuid.uuid4().hex[:16]
            receipts.write_new(out/'linux-container.json',{'name':name})
            inside='/work/'+str(out.relative_to(ROOT))
            body=('set -eu; sha256sum --quiet -c '+shlex.quote(inside+'/container-source.sha256')+'; cd /work; '
                  'rustc --version; rustc --edition=2021 -O '+shlex.join(identity.ARM64_FLAGS)+' '+
                  shlex.quote('/work/'+str(Path(generated['path']).relative_to(ROOT)))+' -o /output/workload-linux; '
                  'sha256sum --quiet -c '+shlex.quote(inside+'/container-source.sha256'))
            try:
                receipts.command([*docker,'run','--name',name,'--network','none','-v',str(ROOT)+':/work:ro',
                    '-v',str(out)+':/output','-e','LAYERFS_CONSTRUCTION_WORKERS=1',identity.IMAGE,
                    '/bin/bash','-c',body],out,'linux-m1',105)
            finally:
                receipts.command([*docker,'rm','--force',name],out,'linux-remove-owned',5,allow_failure=True)
        else:
            old=json.loads((out/'previous.json').read_text())
            binaries={k:v for k,v in old['binaries'].items() if k not in ('workload-host','workload-linux')}
            builds=[]
            for arch in ('host','linux'):
                completion=json.loads((out/(arch+'-m1.completion.json')).read_text())
                if completion['status']!='PASS':
                    raise ValueError('both helper builds must PASS')
                builds.append(completion)
                path=out/('workload-'+arch);digest=identity.sha256(path)
                archive=ROOT/'benchmark-results/fs-bench-pro/binary-archive'/digest/path.name
                archive.parent.mkdir(parents=True,exist_ok=True)
                if not archive.exists():
                    shutil.copy2(path,archive)
                if identity.sha256(archive)!=digest:
                    raise ValueError('immutable helper archive changed')
                binaries['workload-'+arch]={'path':str(archive),'sha256':digest,'bytes':path.stat().st_size}
            receipts.write_new(out/'source-after.json',now)
            result={**old,'identity':now,'binaries':binaries,'builds':builds,
                    'incremental_reuse':'seven exact sealed binaries; host/Linux M1 helpers rebuilt at this clean source'}
            receipts.write_new(out/'build.json',result)
            receipts.manifest(out)
            identity.load_build(out)
    print('BUILD_STEP',args.stage,'PASS',str(out.relative_to(ROOT)))


if __name__=='__main__':
    main()
