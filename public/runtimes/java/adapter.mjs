let worker;
let sequence=0;
let active;
const workerUrl=new URL('./precap-java.worker.js',import.meta.url);
const jarUrl=new URL('./precap-java-runtime.jar?sha256=d8642fe753cac7aa6f5a01d817dcbcd967482a75184b245dee8144056fb19091',import.meta.url).href;
function terminateWorker(){if(worker)worker.terminate();worker=undefined;}
export function stopJava(){if(active)active.abort();else terminateWorker();}
/** files is an object of {filename: source} or an array of {path, content}. */
export function runJava({files,stage='final',args,onStatus=()=>{},onOutput=()=>{},signal}){
  if(active)return Promise.reject(new Error('A Java program is already running.'));
  if(signal?.aborted)return Promise.reject(new DOMException('Java execution stopped.','AbortError'));
  const entries=Array.isArray(files)?files:Object.entries(files).map(([path,content])=>({path,content}));
  if(!entries.length||entries.some(f=>typeof f.path!=='string'||typeof f.content!=='string'||!f.path.endsWith('.java')))return Promise.reject(new Error('Provide Java source files.'));
  const runArgs=args??['--stage',stage];
  const id=++sequence;
  worker??=new Worker(workerUrl);
  return new Promise((resolve,reject)=>{
    const current=worker;
    const cleanup=()=>{signal?.removeEventListener('abort',abort);current.removeEventListener('message',message);current.removeEventListener('error',error);active=undefined;};
    const abort=()=>{terminateWorker();cleanup();reject(new DOMException('Java execution stopped.','AbortError'));};
    const error=event=>{terminateWorker();cleanup();reject(new Error(event.message||'The browser Java runtime failed.'));};
    const message=({data})=>{
      if(data.type==='status'){onStatus({phase:data.phase,label:data.label});return;}
      if(data.id!==id)return;
      if(data.type==='output'){onOutput(data.stream,data.text);return;}
      if(data.type==='result'){cleanup();if(data.result.restartRuntime)stopJava();resolve(data.result);}
      if(data.type==='error'){terminateWorker();cleanup();reject(new Error(data.message));}
    };
    active={abort};
    signal?.addEventListener('abort',abort,{once:true});
    current.addEventListener('message',message);current.addEventListener('error',error);
    current.postMessage({type:'run',id,files:entries,args:runArgs,jarUrl});
  });
}
