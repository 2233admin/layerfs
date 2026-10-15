// #328 acceptance at the real native/daemon boundary. Historical A9 FAIL is
// retained; this is new evidence at the changed implementation identity.
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { REPO,check,mount,refusal,sh,unmount } from "./lib.mjs";
export const STANDARD={
  async S328(ctx){
    const l=ctx.layerfs,o=ctx.operator;
    check(ctx,"exactly 29 public grouped methods",[l.project,l.fs,l.branch,l.sandbox].reduce((n,g)=>n+Object.keys(g).length,0)===29);
    await l.project.init(ctx.source);await l.branch.fork("feature");
    const first=await l.fs.write("feature","/f.txt","one\ntwo\nthree\n","First\nmessage\t✓");
    const second=await l.fs.edit("feature","/f.txt","two","TWO","Change middle");
    const page=await l.branch.list_commits("feature",1,0);
    check(ctx,"messages and numeric history paging",page.hasMore&&page.items[0].message==="Change middle");
    const old=await l.branch.list_commits("feature",1,1);
    check(ctx,"offset yields older Commit",old.items[0].id===first.head&&!old.hasMore);
    const empty=await l.branch.list_commits("feature",1,1000);
    check(ctx,"deep EOF page",empty.items.length===0&&!empty.hasMore);
    const read=await l.fs.read("feature","/f.txt",2,2);
    check(ctx,"inclusive line range",read.text==="TWO\n"&&read.startLine===2&&read.endLine===2);
    const blame=await l.fs.blame("feature","/f.txt");
    check(ctx,"blame messages and no phantom line",blame.lines.length===3&&blame.lines[1].commit===second.head&&blame.lines[1].message==="Change middle"&&blame.lines[0].commit===first.head,blame);
    const before=await l.branch.list_commits("feature",1);
    const bad=await refusal(l.fs.apply("feature",[{op:"write",path:"/atomic",content:"not published"},{op:"rm",path:"/missing"}]));
    check(ctx,"failed apply identifies index",bad?.detail?.index===1,bad);
    check(ctx,"failed apply publishes nothing",(await l.branch.list_commits("feature",1)).items[0].id===before.items[0].id&&(await refusal(l.fs.stat("feature","/atomic")))?.code==="NoSuchPath");
    check(ctx,"invalid message refuses before work",(await refusal(l.fs.write("feature","/invalid","x","\0")))?.code==="InvalidInput");
    const sandbox=await l.service();const ws=await mount(ctx,sandbox,"feature");
    await sh(ctx,ws,"mkdir -p tree/sub; for i in $(seq 1 130); do printf '%s\\n' \"$i\" >tree/sub/f$i; done; chmod 750 tree; printf 'linked\\n' >tree/sub/link; ln tree/sub/link tree/sub/hard; ln -s ../missing tree/sym; node -e 'require(\"fs\").writeFileSync(\"huge\",\"a\".repeat(300000)+\"\\nneedle Ω\\nlast\\n\")'");
    const dirty=await o.workspace.changes(sandbox,ws.path,2,0);
    check(ctx,"Workspace change pages",dirty.items.length===2&&(dirty.hasMore||dirty.nextPagePos!==null),dirty);
    const overlay=await o.workspace.overlay(sandbox,ws.path);
    check(ctx,"real overlay payload",overlay.payload>300000&&overlay.inodes>100,overlay);
    await l.sandbox.commit(sandbox,ws.path,{message:"Tree and huge line"});
    const huge=await l.fs.read("feature","/huge",1,1);
    check(ctx,"huge line prefix disclosed",huge.lineTruncated&&Buffer.byteLength(huge.text)<=49152&&huge.endLine===1,huge.text.length);
    const next=await l.fs.read("feature","/huge",2,3);
    check(ctx,"following lines remain addressable",next.text==="needle Ω\nlast\n",next);
    check(ctx,"streaming grep finds beyond huge line",(await l.fs.grep("feature","needle","/huge")).items[0].line===2);
    const copied=await l.fs.cp("feature","/tree","/copy","Recursive copy");
    check(ctx,"recursive copy publishes once",copied.kind==="Committed");
    await l.fs.mv("feature","/copy","/moved");await l.fs.rm("feature","/tree");
    await l.fs.edit("feature","/huge","needle Ω","replacement 🌎","Edit large file");
    const v=await mount(ctx,sandbox,"feature");
    const facts=await sh(ctx,v,"test -L moved/sym && test $(stat -c %a moved) = 750 && test $(stat -c %i moved/sub/link) = $(stat -c %i moved/sub/hard) && test $(find moved/sub -type f | wc -l) = 132 && grep -q 'replacement 🌎' huge");
    check(ctx,"copied permissions, hardlinks, symlink and large edit",facts.exitCode===0,facts.stderr);
    await unmount(ctx,v);
    check(ctx,"same-path cp refused",(await refusal(l.fs.cp("feature","/moved","/moved")))?.code==="InvalidInput");
    const list=await l.fs.list("feature","/moved/sub",7,70);
    check(ctx,"directory offset crosses bounded windows",list.items.length===7&&list.hasMore);
    const stats=await o.store.stats(),commits=await o.store.commits("feature",1),history=await o.files.history("feature","/f.txt"),file=await o.files.stats("feature","/f.txt");
    check(ctx,"publication statistics and file revisions",stats.logical>0&&stats.canonical>0&&stats.stored>0&&stats.metadata>0&&commits.items[0].logical>0&&history.items.length===2&&file.revisions===2,{stats,commits,file});
    await l.branch.fork("other");await l.fs.write("other","/other","x");await l.branch.merge("feature","other","merged","Merge message");
    await l.branch.publish("merged");
    check(ctx,"published main text",(await l.fs.read("main","/other")).text==="x");
    check(ctx,"public operator isolation",(await refusal(l.call("operator.store.stats",{})))?.code==="UnknownMethod");
  },
  async XPROCESS(ctx){
    const l=ctx.layerfs;await l.project.init(ctx.source);await l.branch.fork("feature");
    const sandbox=await l.sandbox.create();const ws=await mount(ctx,sandbox,"feature");
    const proc=await ctx.operator.process.start(sandbox,ws.path,"sleep 30");
    const script=`import {LayerFS} from ${JSON.stringify(join(REPO,"sdk/js/src/index.js"))};import {LayerFSOperator} from ${JSON.stringify(join(REPO,"sdk/js/operator/index.js"))};
      const l=new LayerFS("website"),o=new LayerFSOperator(l);const id=${JSON.stringify(sandbox)},path=${JSON.stringify(ws.path)};
      const status=await l.sandbox.status(id,path);const exec=await l.sandbox.exec(id,path,"echo cross-process > cross.txt","External process");
      const commit=await l.sandbox.commit(id,path,{message:"Second process"});const processes=await o.process.list(id);await o.process.cancel(id,${JSON.stringify(proc.process)});
      const read=await l.fs.read("feature","/cross.txt");console.log(JSON.stringify({status:status.kind,exit:exec.exitCode,commit:commit.kind,text:read.text,processes:processes.items.length}));`;
    const out=execFileSync(process.execPath,["--input-type=module","-e",script],{encoding:"utf8",timeout:60000});const value=JSON.parse(out.trim());
    check(ctx,"fresh Node uses saved project and Sandbox without Init/install",value.status==="ok"&&value.exit===0&&value.commit==="Committed"&&value.text==="cross-process\n"&&value.processes===1,value);
    check(ctx,"original process sees external Commit",(await l.sandbox.status(sandbox,ws.path)).base===(await l.branch.list_commits("feature",1)).items[0].id);
    await unmount(ctx,ws);
    noteHistorical(ctx);
  }
};
function noteHistorical(ctx){ctx.notes.push("A9 historical FAIL is retained unchanged. XPROCESS is separate evidence at this source; owner deferrals remain open.");}
