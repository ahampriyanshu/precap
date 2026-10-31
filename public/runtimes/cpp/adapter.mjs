let active;
function aborted(){return new DOMException('C++ execution stopped.','AbortError');}
/** Immediate teardown is scoped to the current invocation; no SDK join is awaited. */
export function stopCpp(){active?.cancel();}
function diagnostics(text){
  const out=[];
  const pattern=/^(.+?):(\d+):(\d+):\s*(fatal error|error|warning|note):\s*(.+)$/gm;
  for(const m of text.matchAll(pattern))out.push({file:m[1].replace(/^\/project\//,''),line:Number(m[2]),column:Number(m[3]),severity:m[4]==='fatal error'?'error':m[4],message:m[5],source:'clang'});
  return out;
}
function dispose(token){
  token.worker?.terminate();token.worker=undefined;
  token.frame?.remove();token.frame=undefined;
  for(const timer of token.timers)clearTimeout(timer);token.timers.clear();
  for(const cleanup of token.cleanups)cleanup();token.cleanups.clear();
}
function executeInFrame(token,wasm,{args,stdin,runTimeoutMs,onRunning}){
  return new Promise((resolve,reject)=>{
    const id=crypto.randomUUID();
    const frame=document.createElement('iframe');token.frame=frame;
    frame.hidden=true;frame.dataset.precapCppExecution='true';frame.title='C++ execution';
    const started=performance.now();let running=false;
    const schedule=(fn,ms)=>{const timer=setTimeout(()=>{token.timers.delete(timer);fn()},ms);token.timers.add(timer);return timer};
    const finish=result=>{dispose(token);resolve(result)};
    const timeout=()=>finish({code:137,reason:'timeout',ok:false,stdout:'',stderr:'C++ execution exceeded its browser time limit.',runMs:performance.now()-started});
    const startupTimer=schedule(timeout,120000);
    const receive=event=>{
      if(event.source!==frame.contentWindow||event.origin!==location.origin)return;
      const data=event.data;
      if(data?.type==='precap-cpp-ready'){
        frame.contentWindow.postMessage({type:'precap-cpp-run',id,wasm,args,stdin,timeoutMs:runTimeoutMs},location.origin,[wasm.buffer]);return;
      }
      if(data?.id!==id)return;
      if(data.type==='precap-cpp-running'&&!running){running=true;clearTimeout(startupTimer);token.timers.delete(startupTimer);onRunning();if(!token.canceled)schedule(timeout,runTimeoutMs+500);}
      if(data.type==='precap-cpp-result')finish(data.result);
      if(data.type==='precap-cpp-error'){dispose(token);reject(new Error(data.message));}
    };
    addEventListener('message',receive);token.cleanups.add(()=>removeEventListener('message',receive));
    frame.src=new URL('./execution.html',import.meta.url).href;
    document.body.append(frame);
  });
}
/** Call from the page. Compilation and execution both use disposable contexts. */
export async function runCpp({files,stage='final',args,stdin='',onStatus=()=>{},onOutput=()=>{},signal,runTimeoutMs=20000}){
  if(active)throw new Error('A C++ program is already running.');
  if(signal?.aborted)throw aborted();
  if(stage!=='prototype'&&stage!=='final')throw new TypeError('Unknown exercise stage.');
  const sources=Array.isArray(files)?Object.fromEntries(files.map(f=>[f.path,f.content])):files;
  if(!sources||typeof sources['main.cpp']!=='string'||typeof sources['exercise.hpp']!=='string')throw new TypeError('C++ execution requires exercise.hpp and main.cpp source.');
  if(!crossOriginIsolated||typeof SharedArrayBuffer==='undefined')throw new Error('C++ requires a secure, cross-origin-isolated page with shared memory.');
  if(typeof WebAssembly.Suspending!=='function')throw new Error('This browser does not support the JavaScript Promise Integration required by the C++ runtime.');
  if(!Number.isFinite(runTimeoutMs)||runTimeoutMs<1||runTimeoutMs>120000)throw new TypeError('C++ execution time limit must be between 1 and 120000 milliseconds.');
  let canceled=false,rejectCancellation;
  const cancellation=new Promise((_,reject)=>{rejectCancellation=reject});
  const token={worker:undefined,frame:undefined,canceled:false,timers:new Set(),cleanups:new Set(),cancel(){if(canceled)return;canceled=true;token.canceled=true;dispose(token);if(active===token)active=undefined;rejectCancellation(aborted());}};
  active=token;
  const abort=()=>token.cancel();signal?.addEventListener('abort',abort,{once:true});
  const begin=performance.now();let phase='compile';
  try{
    onStatus({phase:'loading',label:'Loading C++20 compiler…'});
    const compile=new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('./compiler.worker.mjs',import.meta.url),{type:'module'});token.worker=worker;
      let deadline;
      const setDeadline=ms=>{if(deadline){clearTimeout(deadline);token.timers.delete(deadline)}deadline=setTimeout(()=>{token.timers.delete(deadline);worker.terminate();reject(new Error('C++ compiler loading or compilation exceeded its browser time limit.'))},ms);token.timers.add(deadline)};
      setDeadline(180000);
      worker.onmessage=({data})=>{
        if(data.type==='status'){onStatus({phase:data.phase,label:data.label});if(data.phase==='compiling')setDeadline(120000);return;}
        clearTimeout(deadline);token.timers.delete(deadline);data.type==='error'?reject(new Error(data.error)):resolve(data);
      };
      worker.onerror=event=>{clearTimeout(deadline);token.timers.delete(deadline);reject(new Error(event.message||'The C++ compiler worker failed.'))};
      worker.postMessage({files:sources,entry:'main.cpp'});
    });
    const compiled=await Promise.race([compile,cancellation]);token.worker.terminate();token.worker=undefined;
    if(compiled.build.stdout)onOutput('stdout',compiled.build.stdout);if(compiled.build.stderr)onOutput('stderr',compiled.build.stderr);
    const buildDiagnostics=diagnostics(compiled.build.stderr);
    if(!compiled.build.success)return{phase:'compile',code:1,exitCode:1,stdout:compiled.build.stdout,stderr:compiled.build.stderr,diagnostics:buildDiagnostics,termination:'compile-error',durationMs:performance.now()-begin};
    if(canceled)throw aborted();
    phase='run';onStatus({phase:'compiling',label:'Preparing C++ runtime…'});
    const result=await Promise.race([executeInFrame(token,compiled.wasm,{args:args??['--stage',stage],stdin,runTimeoutMs,onRunning:()=>onStatus({phase:'running',label:'Running C++ checks…'})}),cancellation]);
    if(result.stdout)onOutput('stdout',result.stdout);if(result.stderr)onOutput('stderr',result.stderr);
    return{phase:'run',code:result.code,exitCode:result.code,stdout:result.stdout,stderr:result.stderr,diagnostics:buildDiagnostics,termination:result.reason,durationMs:performance.now()-begin,executionDurationMs:result.runMs,compileDurationMs:compiled.build.compileMs};
  }catch(error){
    if(canceled||signal?.aborted)throw aborted();
    const message=error instanceof Error?error.message:String(error);onOutput('stderr',message+'\n');
    return{phase,code:1,exitCode:1,stdout:'',stderr:message,diagnostics:[],termination:phase==='compile'?'compile-error':'runtime-error',durationMs:performance.now()-begin};
  }finally{dispose(token);signal?.removeEventListener('abort',abort);if(active===token)active=undefined;}
}
