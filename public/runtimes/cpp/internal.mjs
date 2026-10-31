// Self-hosted C++20 compiler + WASIX runtime. This module runs in a disposable Web Worker.
const base = new URL('./', import.meta.url);
const asset = (path) => new URL(path, base);
let compilerState;

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sha256(bytes) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), n => n.toString(16).padStart(2, '0')).join('');
}
async function pinned(path, expected) {
  const url=asset(path);url.searchParams.set('sha256',expected);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load C++ asset: ${response.status} ${path}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const actual = await sha256(bytes);
  if (actual !== expected) throw new Error(`C++ asset checksum mismatch for ${path}: ${actual}`);
  return bytes;
}
async function gunzip(bytes) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
}
function tarFiles(bytes) {
  const text = (start, count) => decoder.decode(bytes.subarray(start, start + count)).replace(/\0.*$/s, '');
  const out = {};
  for (let offset = 0; offset + 512 <= bytes.length; ) {
    const name = text(offset, 100);
    if (!name) break;
    const prefix = text(offset + 345, 155);
    const fullName = prefix ? `${prefix}/${name}` : name;
    const size = parseInt(text(offset + 124, 12).trim() || '0', 8);
    const type = text(offset + 156, 1);
    const start = offset + 512;
    if ((type === '0' || type === '') && fullName.startsWith('wasix-sysroot-eh/sysroot/')) {
      const relative = fullName.slice('wasix-sysroot-eh/'.length);
      if (relative.startsWith('sysroot/include/') || relative.startsWith('sysroot/lib/')) out[`/${relative}`] = bytes.slice(start, start + size);
    }
    offset = start + Math.ceil(size / 512) * 512;
  }
  if (!out['/sysroot/include/c++/v1/thread'] || !out['/sysroot/lib/wasm32-wasi/libunwind.a']) throw new Error('WASIX sysroot archive is incomplete');
  return out;
}
async function loadCompiler() {
  compilerState ??= (async () => {
    const sdk = await import('./sdk10/index.mjs');
    await sdk.init({workerUrl: asset('sdk10/worker.mjs')});
    const [compilerBytes, rootBytes] = await Promise.all([
      pinned('clang-22.0.0-git20542-10.webc.gz.bin', '7f10d90b8e52b270f04874641a1d0bf9e94e85b4f6c7573a774cebbc6d32552a'),
      pinned('sysroot-eh-v2026-10-02.1.tar.gz', '9fcd78df833720c5a02c41c4380df1b5eb8977957ffb77caf81f22cb298383ea'),
    ]);
    const runtime = new sdk.Runtime({registry:null});
    const pkg = await sdk.Wasmer.fromFile(await gunzip(compilerBytes), runtime);
    const root = new sdk.Directory(tarFiles(await gunzip(rootBytes)));
    return {sdk,pkg,root,runtime};
  })();
  return compilerState;
}
function hasCompilerError(text){
  return text.split(/\r?\n/).some(line=>{
    if(/^[ \t]*(?:\d+[ \t]*\||\||>>>)/.test(line))return false;
    return /^(?:fatal error|error):(?:[ \t]|$)/.test(line)
      ||/^[^:\r\n]+:\d+(?::\d+)?:[ \t]*(?:fatal error|error):(?:[ \t]|$)/.test(line)
      ||/^(?:wasm-ld|lld|clang(?:-\d+)?):[ \t]*(?:fatal error|error):(?:[ \t]|$)/.test(line)
      ||/^LLVM ERROR:/.test(line);
  });
}
function capture(stream){
  const reader=stream.getReader();
  const limit=2*1024*1024; // Two streams together are bounded to 4 MiB.
  let text='',bytes=0,truncated=false,lastChanged=performance.now();
  void(async()=>{try{for(;;){const{done,value}=await reader.read();if(done)break;lastChanged=performance.now();const remaining=Math.max(0,limit-bytes);if(value.byteLength>remaining)truncated=true;if(remaining)text+=decoder.decode(value.subarray(0,remaining),{stream:true});bytes+=value.byteLength;}}catch{}})();
  return{text:()=>text,truncated:()=>truncated,lastChanged:()=>lastChanged,cancel:()=>reader.cancel().catch(()=>{})};
}
async function stage(command,args,project,state,output,timeoutMs) {
  const instance = await command.run({args,cwd:'/project',env:{PATH:'/bin',TZ:'UTC',LC_ALL:'C'},mount:{'/project':project,'/wasix':state.root}});
  const stdout = capture(instance.stdout), stderr = capture(instance.stderr);
  const deadline = performance.now() + timeoutMs;
  let previousHash,stableSince=0;
  try {
    while(performance.now() < deadline) {
      if(stdout.truncated()||stderr.truncated())return{success:false,stdout:stdout.text(),stderr:stderr.text()+'\nCompiler diagnostic output exceeded its 4 MiB limit.'};
      if (hasCompilerError(stderr.text())) { await sleep(30); return {success:false,stdout:stdout.text(),stderr:stderr.text()}; }
      try {
        const bytes = await project.readFile(output);
        if(bytes.length>0&&WebAssembly.validate(bytes)){
          const hash=await sha256(bytes);
          if(hash!==previousHash){previousHash=hash;stableSince=performance.now();}
          if(performance.now()-stableSince>=100 && performance.now()-stderr.lastChanged()>=100){
            await sleep(30);
            if(hasCompilerError(stderr.text()))return{success:false,stdout:stdout.text(),stderr:stderr.text()};
            if(stdout.truncated()||stderr.truncated())return{success:false,stdout:stdout.text(),stderr:stderr.text()+'\nCompiler diagnostic output exceeded its 4 MiB limit.'};
            const confirmed=await project.readFile(output);
            if(await sha256(confirmed)===hash&&WebAssembly.validate(confirmed))return{success:true,bytes:confirmed,stdout:stdout.text(),stderr:stderr.text()};
          }
        }
      } catch {}
      await sleep(10);
    }
    return {success:false,stdout:stdout.text(),stderr:stderr.text() + `\nCompiler stage timed out after ${timeoutMs} ms.`};
  } finally {
    await Promise.all([stdout.cancel(),stderr.cancel()]);
    instance.free();
  }
}
const common = [
  '-cc1','-triple','wasm32-unknown-wasi','-emit-obj','-O0','-mrelocation-model','static','-mframe-pointer=none','-ffp-contract=on','-fno-rounding-math','-mconstructor-aliases',
  '-target-feature','+atomics','-target-feature','+bulk-memory','-target-feature','+mutable-globals','-target-feature','+sign-ext','-target-cpu','generic',
  '-fvisibility=hidden','-resource-dir','/usr','-D','_WASI_EMULATED_MMAN','-D','_WASI_EMULATED_SIGNAL','-D','_WASI_EMULATED_PROCESS_CLOCKS','-D','USE_TIMEGM',
  '-isysroot','/wasix/sysroot','-internal-isystem','/wasix/sysroot/include/c++/v1','-internal-isystem','/usr/include','-internal-isystem','/wasix/sysroot/include',
  '-I','/project','-std=c++20','-fdeprecated-macro','-ferror-limit','30','-ftls-model=local-exec','-pthread','-fgnuc-version=4.2.1','-fno-implicit-modules',
  '-fcxx-exceptions','-fexceptions','-exception-model=wasm','-target-feature','+exception-handling','-mllvm','-wasm-enable-eh','-mllvm','-wasm-use-legacy-eh=true',
];
const link = [
  '-m','wasm32','-L/wasix/sysroot/lib/wasm32-wasi','/wasix/sysroot/lib/wasm32-wasi/crt1-command.o',
  '--shared-memory','--max-memory=4294967296','--import-memory','--export-dynamic','--export=__heap_base','--export=__stack_pointer','--export=__data_end','--export=__wasm_init_tls','--export=__wasm_signal','--export=__tls_size','--export=__tls_align','--export=__tls_base',
  '/project/app.o','-lc++','-lc++abi','-lunwind','-lpthread','-lc','/wasix/sysroot/lib/wasm32-wasi/libclang_rt.builtins-wasm32.a','-o','/project/app.wasm',
];
export async function compileCpp({files,entry='main.cpp',timeoutMs=60000,onStatus=()=>{}}) {
  const start = performance.now();
  const state = await loadCompiler();onStatus({phase:'compiling',label:'Compiling C++20…'});
  if (!files[entry]) throw new Error(`Missing C++ entry file ${entry}`);
  const project = new state.sdk.Directory(Object.fromEntries(Object.entries(files).map(([path,text]) => {
    if(path.startsWith('/') || path.split('/').includes('..') || !/\.(?:cpp|cc|cxx|hpp|h|hxx)$/.test(path)) throw new Error(`Invalid virtual source path ${path}`);
    return [`/${path}`,encoder.encode(text)];
  })));
  try {
    const object = await stage(state.pkg.commands.clang,[...common,'-main-file-name',entry,'-o','/project/app.o','-x','c++',`/project/${entry}`],project,state,'app.o',timeoutMs);
    if (!object.success) return {...object,compileMs:performance.now()-start};
    const linked = await stage(state.pkg.commands['wasm-ld'],link,project,state,'app.wasm',timeoutMs);
    return {...linked,stdout:object.stdout+linked.stdout,stderr:object.stderr+linked.stderr,compileMs:performance.now()-start};
  } finally { project.free(); }
}
export async function createCppExecutionClient(){
  const {Wasmer}=await import('./sdk19/dist/index.js');
  const client=new Wasmer({cache:false,parallelism:4});
  try{await client.ready();return client;}catch(error){await client.close().catch(()=>{});throw error;}
}
export async function executeCppArtifact({wasm,args=[],stdin='',timeoutMs=20000,client}){
  if(!client)throw new Error('A per-invocation C++ execution client is required.');
  const pkg=await client.packages.load(wasm);
  const sandbox=await client.sandboxes.create({packages:[pkg],network:{mode:'disabled'}});
  const start=performance.now();
  try{
    const result=await sandbox.command(pkg,args).run({check:false,stdin,timeoutMs,outputBytes:4194304});
    return{code:result.exitCode,reason:result.reason,ok:result.ok,stdout:result.stdout.text(),stderr:result.stderr.text(),runMs:performance.now()-start};
  }finally{await sandbox.close().catch(()=>{});}
}
