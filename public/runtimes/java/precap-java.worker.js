/* CheerpJ Core stays on its official CDN; only the ECJ/API/bridge JAR is hosted by the app. */
let initializePromise;
let runner;
const EXPECTED_JAR_SHA256='d8642fe753cac7aa6f5a01d817dcbcd967482a75184b245dee8144056fb19091';
const status=(phase,label)=>postMessage({type:'status',phase,label});
async function initialize(jarUrl) {
  if(initializePromise)return initializePromise;
  initializePromise=(async()=>{
    status('initializing','Loading Java 17 runtime…');
    importScripts('https://cjrtnc.leaningtech.com/4.3/loader.js');
    const response=await fetch(jarUrl);
    if(!response.ok)throw new Error(`The Java compiler could not be loaded (${response.status}).`);
    const bytes=await response.arrayBuffer();
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hash=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
    if(hash!==EXPECTED_JAR_SHA256)throw new Error('The Java compiler asset did not match its expected checksum.');
    await cheerpjInit({version:17,status:'none',overrideDocumentBase:new URL('.',self.location.href).href,
      execCallback(){throw new Error('External processes are unavailable in this browser runtime.');}});
    status('initializing','Loading Java compiler…');
    // An in-memory string mount avoids requiring HTTP Range support from the app server.
    cheerpOSAddStringFile('/str/precap-java-runtime.jar',new Uint8Array(bytes));
    const library=await cheerpjRunLibrary('/str/precap-java-runtime.jar');
    runner=await library.precap.runtime.PrecapJavaRunner;
    const warmup=await runner.warmup();
    if(warmup!=='ok')throw new Error(String(warmup));
    return runner;
  })();
  return initializePromise;
}
async function describe(error){try{return error instanceof Error?error.message:await error.toString();}catch{return 'The browser Java runtime failed.';}}
onmessage=async({data})=>{
  if(data.type!=='run')return;
  const begin=performance.now();
  try{
    await initialize(data.jarUrl);
    status('compiling','Compiling Java…');
    for(const file of data.files)cheerpOSAddStringFile('/str/'+file.path,file.content);
    const compilation=JSON.parse(await runner.compileSources(data.files.map(f=>f.path),data.files.map(f=>f.content)));
    if(compilation.error){
      postMessage({type:'output',id:data.id,stream:'stderr',text:compilation.error+'\n'});
      postMessage({type:'result',id:data.id,result:{...compilation,duration:(performance.now()-begin)/1000,exitCode:1}});
      return;
    }
    status('running','Running Java checks…');
    const raw=await runner.runPrepared(data.args,1024*1024);
    const result=JSON.parse(raw);
    const explicitExit=/^precap\.runtime\.PrecapJavaRunner\$ExitSignal: Program exited with code (-?\d+)/.exec(result.error||'');
    if(result.stdout)postMessage({type:'output',id:data.id,stream:'stdout',text:result.stdout});
    if(result.warning)postMessage({type:'output',id:data.id,stream:'stderr',text:result.warning+'\n'});
    if(result.error)postMessage({type:'output',id:data.id,stream:'stderr',text:result.error+'\n'});
    postMessage({type:'result',id:data.id,result:{...result,duration:(performance.now()-begin)/1000,exitCode:explicitExit?Number(explicitExit[1]):result.error?1:0}});
  }catch(error){postMessage({type:'error',id:data.id,message:await describe(error)});}
};
