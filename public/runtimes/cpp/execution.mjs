// A Window context is required by the Wasmer thread bridge. The owning adapter
// destroys this entire context on completion, cancellation, or its hard deadline.
import {createCppExecutionClient,executeCppArtifact} from './internal.mjs';
let started=false;
addEventListener('message',async({data,source,origin})=>{
  if(started||source!==parent||origin!==location.origin||data?.type!=='precap-cpp-run')return;
  started=true;
  let client;
  const send=value=>parent.postMessage({id:data.id,...value},location.origin);
  try{
    client=await createCppExecutionClient();
    send({type:'precap-cpp-running'});
    const result=await executeCppArtifact({wasm:data.wasm,args:data.args,stdin:data.stdin??'',timeoutMs:data.timeoutMs,client});
    send({type:'precap-cpp-result',result});
  }catch(error){send({type:'precap-cpp-error',message:error instanceof Error?error.message:String(error)});}
  finally{void client?.close().catch(()=>{});}
});
parent.postMessage({type:'precap-cpp-ready'},location.origin);
