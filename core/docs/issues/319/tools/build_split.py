"""Seal nine rebuilt binaries; invoke each stage under r4-locked.pl 118."""
import argparse
import json
import os
from pathlib import Path
import shlex
import shutil
import sys
import uuid

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(ROOT/'core/benchmark/fs-bench-pro'))
from engine import identity, receipts

STAGES = ('register','host-runtime','host-helpers','linux-daemon','linux-helpers','seal')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('stage',choices=STAGES)
    parser.add_argument('output')
    args = parser.parse_args()
    out = (ROOT/args.output).resolve()
    out.relative_to(ROOT)
    flags_pin = {'RUSTFLAGS':os.environ.get('RUSTFLAGS'),'CARGO_ENCODED_RUSTFLAGS':os.environ.get('CARGO_ENCODED_RUSTFLAGS')}
    if flags_pin['CARGO_ENCODED_RUSTFLAGS'] is not None:
        raise ValueError('encoded Cargo flag override not admitted')
    explicit=flags_pin['RUSTFLAGS']
    if explicit is not None and any(f not in explicit for f in ('aes_armv8','polyval_armv8','chacha20_force_neon','+aes,+sha2')):
        raise ValueError('ARM64 flags missing')
    now = identity.source_identity()
    if args.stage == 'register':
        out.mkdir(parents=True,exist_ok=False)
        receipts.write_new(out/'source-before.json',now)
        receipts.write_new(out/'flags.json',flags_pin)
        socket = identity.docker_socket()
        receipts.write_new(out/'socket.json',{'socket':socket})
        checked = receipts.command(['python3','-B','core/tools/check_fuser_integrity.py'],out,'fuser-integrity',15,allow_failure=True)
        if checked['exit_code'] and (checked['exit_code']!=1 or set(json.loads(Path(checked['stdout']).read_text()).get('errors',[]))!=identity.FUSER_REFUSALS):
            raise ValueError('new fuser integrity refusal')
        image = receipts.command(['docker','--host','unix://'+socket,'image','inspect',identity.IMAGE,'--format','{{.Id}}'],out,'image',10)
        if Path(image['stdout']).read_text().strip()!=identity.IMAGE:
            raise ValueError('pinned image differs')
        source = identity.workload_source()
        receipts.write_new(out/'generated-source.json',{'path':str(source),'sha256':identity.sha256(source)})
        (out/'container-source.sha256').write_text(''.join(d+'  /work/'+p+'\n' for p,d in now['files'].items())+identity.sha256(source)+'  /work/'+str(source.relative_to(ROOT))+'\n')
    else:
        if flags_pin!=json.loads((out/'flags.json').read_text()):
            raise ValueError('build flag environment changed between stages')
        if now!=json.loads((out/'source-before.json').read_text()):
            raise ValueError('source changed between bounded build stages')
        generated=json.loads((out/'generated-source.json').read_text())
        if identity.sha256(generated['path'])!=generated['sha256']:
            raise ValueError('generated workload changed')
        environment={**os.environ,'LAYERFS_CONSTRUCTION_WORKERS':'1','CARGO_TARGET_DIR':str(ROOT/'core/target/r7-host-release')}
        flags=environment.get('RUSTFLAGS')
        if flags is not None and any(f not in flags for f in ('aes_armv8','polyval_armv8','chacha20_force_neon','+aes,+sha2')):
            raise ValueError('ARM64 flags missing')
        host_helpers=(('namespace-writer','engine/recipes/namespace.rs'),('workspace-writer','engine/recipes/workspace.rs'),('workload-host',generated['path']),('edit-host','writers/edit.rs'))
        linux_helpers=(('workload-linux',generated['path']),('edit-linux','writers/edit.rs'),('workspace-linux','engine/recipes/workspace.rs'))
        if args.stage=='host-runtime':
            receipts.command(['cargo','+1.85.1','build','--manifest-path','core/benchmark/fs-bench-pro/runtime/Cargo.toml','--locked','--offline','--release','-j','3'],out,args.stage,110,environment=environment,cwd=ROOT)
            shutil.copy2(ROOT/'core/target/r7-host-release/release/layerfs-r7-runtime',out/'runtime')
        elif args.stage=='host-helpers':
            for name,source in host_helpers:
                path=Path(source) if Path(source).is_absolute() else ROOT/'core/benchmark/fs-bench-pro'/source
                receipts.command(['rustup','run','1.85.1','rustc','--edition=2021','-O',*identity.ARM64_FLAGS,str(path),'-o',str(out/name)],out,name,25,cwd=ROOT)
        elif args.stage.startswith('linux-'):
            name='layerfs-319-build-'+uuid.uuid4().hex[:16]
            socket=json.loads((out/'socket.json').read_text())['socket']
            docker=['docker','--host','unix://'+socket]
            check='/work/'+str((out/'container-source.sha256').relative_to(ROOT))
            if args.stage=='linux-daemon':
                body='cargo build --manifest-path core/Cargo.toml --locked --offline --release -j 3 -p layerfs-daemon --bin layerfs-daemon; cp /target/release/layerfs-daemon /output/daemon'
            else:
                commands=['rustc --version']
                for binary,source in linux_helpers:
                    path=Path(source) if Path(source).is_absolute() else ROOT/'core/benchmark/fs-bench-pro'/source
                    commands.append('rustc --edition=2021 -O '+shlex.join(identity.ARM64_FLAGS)+' '+shlex.quote('/work/'+str(path.relative_to(ROOT)))+' -o /output/'+binary)
                body='; '.join(commands)
            script='set -eu; sha256sum --quiet -c '+shlex.quote(check)+'; cd /work; '+body+'; sha256sum --quiet -c '+shlex.quote(check)
            receipts.write_new(out/(args.stage+'-container.json'),{'name':name})
            try:
                receipts.command([*docker,'run','--name',name,'--network','none','-v',str(ROOT)+':/work:ro','-v',str(out)+':/output','-v',str(ROOT/'core/target/r7-linux-release')+':/target','-v',str(ROOT/'core/target/cluster2-linux-cargo')+':/cargo-home','-e','CARGO_HOME=/cargo-home','-e','CARGO_TARGET_DIR=/target','-e','LAYERFS_CONSTRUCTION_WORKERS=1',identity.IMAGE,'/bin/bash','-c',script],out,args.stage,108)
            finally:
                receipts.command([*docker,'rm','--force',name],out,args.stage+'-remove-owned',5,allow_failure=True)
        else:
            completions=[]
            for stage in STAGES[1:-1]:
                labels=[name for name,_ in host_helpers] if stage=='host-helpers' else [stage]
                for label in labels:
                    row=json.loads((out/(label+'.completion.json')).read_text())
                    if row['status']!='PASS':
                        raise ValueError('all original build stages must PASS')
                    completions.append(row)
            binaries={}
            for name in sorted(identity.BINARY_KEYS):
                path=out/name;digest=identity.sha256(path)
                stage = 'host-runtime' if name=='runtime' else 'linux-daemon' if name=='daemon' else 'linux-helpers' if name in ('workload-linux','edit-linux','workspace-linux') else 'host-helpers'
                pinned=json.loads((out/(stage+'-outputs.json')).read_text())[name]
                if digest!=pinned['sha256'] or path.stat().st_size!=pinned['bytes']:
                    raise ValueError('compiled output changed after original stage')
                archive=ROOT/'benchmark-results/fs-bench-pro/binary-archive'/digest/name
                archive.parent.mkdir(parents=True,exist_ok=True)
                if not archive.exists(): shutil.copy2(path,archive)
                if identity.sha256(archive)!=digest: raise ValueError('archive changed')
                binaries[name]={'path':str(archive),'sha256':digest,'bytes':path.stat().st_size}
            if identity.source_identity()!=now:
                raise ValueError('source changed before final seal')
            if identity.sha256(generated['path'])!=generated['sha256']:
                raise ValueError('generated source changed before final seal')
            receipts.write_new(out/'source-after.json',now)
            receipts.write_new(out/'build.json',{'schema':'fs-bench-pro-build-v1','status':'PASS','identity':now,'binaries':binaries,'image':identity.IMAGE,'socket':json.loads((out/'socket.json').read_text())['socket'],'builds':completions,'flags':'.cargo/config.toml ARM64; helpers explicit matching profile','explicit_rustflags':flags,'incremental_reuse':'worktree-local Cargo compilation cache; all nine binaries rebuilt in bounded stages','global_profile':'Disposable/WAL/OFF','overlay_profile':'MEMORY/OFF/EXCLUSIVE','construction_workers':1,'fuser_check':json.loads((out/'fuser-integrity.completion.json').read_text()),'fuser_disposition':'two known passthrough refusals retained; no overall checker PASS','durable':'NOT_RUN — disabled by owner until explicit reauthorization'})
            receipts.manifest(out);identity.load_build(out)
    if identity.source_identity()!=json.loads((out/'source-before.json').read_text()):
        raise ValueError('source changed during bounded stage')
    generated=json.loads((out/'generated-source.json').read_text())
    if identity.sha256(generated['path'])!=generated['sha256']:
        raise ValueError('generated source changed during bounded stage')
    if args.stage not in ('register','seal'):
        names = ['runtime'] if args.stage=='host-runtime' else ['daemon'] if args.stage=='linux-daemon' else [n for n,_ in host_helpers] if args.stage=='host-helpers' else [n for n,_ in linux_helpers]
        receipts.write_new(out/(args.stage+'-outputs.json'),{n:{'sha256':identity.sha256(out/n),'bytes':(out/n).stat().st_size} for n in names})
    print('BUILD_STEP',args.stage,'PASS',str(out.relative_to(ROOT)))


if __name__=='__main__': main()
