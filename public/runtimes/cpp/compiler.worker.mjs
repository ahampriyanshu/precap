// Compile in a disposable worker. Execute with runCpp() in the page context;
// the current Wasmer runtime creates and manages its own program workers.
import {compileCpp} from './internal.mjs';
self.onmessage = async ({data}) => {
  try {
    const build = await compileCpp({...data,onStatus:status=>postMessage({type:'status',...status})});
    if(!build.success) {postMessage({type:'result',build});return;}
    const wasm=build.bytes;
    postMessage({type:'result',build:{success:true,compileMs:build.compileMs,bytes:wasm.length,stdout:build.stdout,stderr:build.stderr},wasm},[wasm.buffer]);
  } catch(error) {postMessage({type:'error',error:String(error),stack:error.stack});}
};
