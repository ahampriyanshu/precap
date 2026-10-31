"""Assemble verified compiler/API assets and browser-built helper classes."""
from pathlib import Path
import argparse,base64,hashlib,json,re,zipfile

parser=argparse.ArgumentParser()
for option in ('ecj','bootstrap','classes','output'):
    parser.add_argument('--'+option,required=True,type=Path)
args=parser.parse_args()
here=Path(__file__).resolve().parent
inputs=json.loads((here/'build-inputs.json').read_text())
result=json.loads(args.classes.read_text())
assert not result['errors'],result['errors']
for file,key in ((args.ecj,'ecj'),(args.bootstrap,'bootstrap')):
    binary=file.read_bytes()
    assert len(binary)==inputs[key]['bytes'] and hashlib.sha256(binary).hexdigest()==inputs[key]['sha256'],file
entries={}
with zipfile.ZipFile(args.ecj) as ecj,zipfile.ZipFile(args.bootstrap) as bootstrap:
    for name in ecj.namelist():
        if name.endswith('/') or name=='META-INF/MANIFEST.MF' or re.match(r'^META-INF/[^/]+\.(SF|RSA|DSA|EC)$',name,re.I):
            continue
        entries[name]=ecj.read(name)
    signatures=0
    for name in bootstrap.namelist():
        if name.startswith('META-INF/java17-api') and not name.endswith('/'):
            entries[name]=bootstrap.read(name)
            signatures+=name.endswith('.sig')
    assert signatures==inputs['apiSignatures']['entries'],signatures
for item in result['classes']:
    name=item['name'].replace('.','/')+'.class'
    assert name.startswith('precap/runtime/PrecapJavaRunner') and '..' not in name,name
    entries[name]=base64.b64decode(item['base64'],validate=True)
entries['META-INF/MANIFEST.MF']=b'Manifest-Version: 1.0\nCreated-By: Precap browser compiler\n\n'
entries['META-INF/PRECAP-NOTICE.txt']=(
    'ECJ 3.42.0: Eclipse Public License 2.0.\n'
    'Java 17 API signatures: OpenJDK GPL-2.0 with Classpath Exception.\n'
    'Helper derived from cyberspace-cs/zero2Leetcode, upstream MIT License copyright 2026.\n'
    'See THIRD_PARTY_NOTICES.txt and original license files distributed beside this JAR.\n'
).encode()
args.output.mkdir(parents=True,exist_ok=True)
destination=args.output/'precap-java-runtime.jar'
with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as output:
    for name,data in sorted(entries.items()):
        info=zipfile.ZipInfo(name,(2026,10,28,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        output.writestr(info,data,compresslevel=9)
binary=destination.read_bytes()
digest=hashlib.sha256(binary).hexdigest()
manifest={'file':destination.name,'bytes':len(binary),'sha256':digest,'ecj':inputs['ecj'],'compilerOptions':inputs['compilerOptions'],
          'apiSignatures':inputs['apiSignatures'],'bootstrap':inputs['bootstrap'],'runtime':inputs['runtime'],
          'helperSourceSha256':hashlib.sha256((here/'PrecapJavaRunner.java').read_bytes()).hexdigest(),
          'helperCompiledIn':'Chromium worker, CheerpJ 4.3 Java 17 and ECJ 3.42.0; no local Java compiler'}
(args.output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
worker=args.output/'precap-java.worker.js'
worker.write_text(re.sub(r"const EXPECTED_JAR_SHA256='[0-9a-f]+';",f"const EXPECTED_JAR_SHA256='{digest}';",worker.read_text()))
adapter=args.output/'adapter.mjs'
text=adapter.read_text()
text=re.sub(r"const jarUrl=new URL\('[^']*precap-java-runtime\.jar(?:\?[^']*)?',import\.meta\.url\)\.href;",
            f"const jarUrl=new URL('./precap-java-runtime.jar?sha256={digest}',import.meta.url).href;",text)
adapter.write_text(text)
print(json.dumps({'file':str(destination),'bytes':len(binary),'sha256':digest,'signatureEntries':signatures},indent=2))
