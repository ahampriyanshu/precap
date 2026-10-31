"""CLI behavior tests. All writable content is disposable synthetic fixtures."""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
import unittest

RUNNER=Path(__file__).resolve().parents[1]/'run.py'
LANGUAGES=('python','javascript','go','java','cpp')
FILES={'python':('exercise.py','main.py'),'javascript':('exercise.mjs','main.mjs'),'go':('exercise.go','main.go'),'java':('Exercise.java','Main.java'),'cpp':('exercise.hpp','main.cpp')}
STUBS={
 'python':'def prototype():\n    raise NotImplementedError("Implement")\n',
 'javascript':'export function prototype() { throw new Error("Not implemented"); }\n',
 'go':'package main\nfunc Prototype() { panic("Implement") }\n',
 'java':'public class Exercise { public static void prototype() { throw new UnsupportedOperationException("Implement"); } }\n',
 'cpp':'#pragma once\ninline void prototype() { throw std::logic_error("Not implemented"); }\n',
}
DRIVER='''import json,os,sys\nfrom pathlib import Path\np=Path(os.environ["PRECAP_RUN_LOG"])\nwith p.open("a") as f:f.write(json.dumps({"phase":"python","cwd":os.getcwd(),"args":sys.argv[1:]})+"\\n")\n'''
TOOL='''#!PYTHON
import json,os,sys
from pathlib import Path
name=Path(sys.argv[0]).name
log=Path(os.environ["PRECAP_RUN_LOG"])
with log.open("a") as f:f.write(json.dumps({"phase":name,"cwd":os.getcwd(),"args":sys.argv[1:]})+"\\n")
if name in ("go","c++"):
    target=Path(sys.argv[sys.argv.index("-o")+1])
    target.write_text("#!PYTHON\\nimport json,os,sys\\nfrom pathlib import Path\\nwith Path(os.environ['PRECAP_RUN_LOG']).open('a') as f:f.write(json.dumps({'phase':'binary','cwd':os.getcwd(),'args':sys.argv[1:]})+'\\\\n')\\n")
    target.chmod(0o755)
elif name=="javac":
    target=Path(sys.argv[sys.argv.index("-d")+1]);(target/"compiled.marker").write_text("compiled")
elif name=="java":
    target=Path(sys.argv[sys.argv.index("-cp")+1]);assert (target/"compiled.marker").is_file()
'''.replace('PYTHON',sys.executable)

class RunnerTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='precap-cli-test-')
        self.addCleanup(self.temp.cleanup)
        self.workspace=Path(self.temp.name)
        self.root=self.workspace/'product';self.root.mkdir()
        shutil.copy2(RUNNER,self.root/'run.py')
        self.log=self.workspace/'calls.jsonl'
        self.bin=self.workspace/'bin';self.bin.mkdir()
        for name in ['node','go','javac','java','c++']:
            p=self.bin/name;p.write_text(TOOL);p.chmod(0o755)
        self.env=os.environ.copy();self.env.update(PATH=str(self.bin),PRECAP_RUN_LOG=str(self.log),PYTHONDONTWRITEBYTECODE='1')
        for key in ['JAVA_HOME','CXX','GO']:
            self.env.pop(key,None)
        self.shared=[{'directory':f'{track}/{i:02}-shared','track':track,'title':f'{track} {i}'} for track,n in [('dsa',28),('lld',15)] for i in range(1,n+1)]
        self.python=[{'directory':f'python/{i:02}-fundamental','track':'python','title':f'Python {i}'} for i in range(1,21)]
        self.native=[{'directory':f'{language}/01-native','track':language,'title':f'{language} fundamentals','native':True} for language in LANGUAGES[1:]]
        self.diagrams=[{'directory':f'hld/{i:02}-diagram','track':'hld','title':f'Diagram {i}','practice':'diagram'} for i in range(1,3)]
        # Model merged curriculum plus sidecar manifests: neither may duplicate listings.
        self.manifest(self.root/'curriculum.json',self.python+self.shared+self.diagrams+self.native)
        for language,chapter in zip(LANGUAGES[1:],self.native):
            self.manifest(self.root/f'curriculum-{language}.json',[chapter])
        for chapter in self.python+self.shared:self.lesson(chapter['directory'],'python')
        for language,chapter in zip(LANGUAGES[1:],self.native):
            self.lesson(chapter['directory'],language)
            for shared in self.shared:self.lesson(f"variants/{language}/{shared['directory']}",language)
        for chapter in self.diagrams:
            d=self.root/chapter['directory'];d.mkdir(parents=True);(d/'README.md').write_text('# Diagram\n### Draw and explain\n')

    def manifest(self,path,chapters):path.write_text(json.dumps({'chapters':chapters}))
    def lesson(self,directory,language):
        d=self.root/directory;d.mkdir(parents=True,exist_ok=True)
        (d/'README.md').write_text('# Synthetic fixture\n## Practice\n')
        exercise,main=FILES[language]
        (d/exercise).write_text(STUBS[language])
        (d/main).write_text(DRIVER if language=='python' else '// Test fixture, intentionally not Python syntax.\n')
    def cli(self,*args,timeout=15):
        return subprocess.run([sys.executable,'-B',str(self.root/'run.py'),*args],cwd=self.workspace,env=self.env,capture_output=True,text=True,timeout=timeout)
    def calls(self):return [json.loads(x) for x in self.log.read_text().splitlines()] if self.log.exists() else []
    def digest(self):return {str(p.relative_to(self.root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in self.root.rglob('*') if p.is_file()}

    def test_all_defaults_to_63_python_coding_chapters(self):
        result=self.cli('--all','--stage','prototype')
        self.assertEqual(result.returncode,0,result.stderr)
        calls=self.calls();self.assertEqual(len(calls),63)
        self.assertTrue(all(c['phase']=='python' and c['args']==['--stage','prototype'] for c in calls))
        self.assertFalse(any('/go/' in c['cwd'] or '/hld/' in c['cwd'] for c in calls))

    def test_python_default_single_chapter_keeps_original_arguments(self):
        result=self.cli('dsa/01-shared');self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual(self.calls(),[{'phase':'python','cwd':str((self.root/'dsa/01-shared').resolve()),'args':['--stage','final']}])

    def test_list_filters_fundamentals_but_keeps_shared_diagrams(self):
        result=self.cli('--list','--language','go');self.assertEqual(result.returncode,0,result.stderr)
        self.assertIn('go/01-native:',result.stdout);self.assertIn('dsa/01-shared:',result.stdout);self.assertIn('hld/01-diagram:',result.stdout)
        self.assertNotIn('python/01-fundamental:',result.stdout);self.assertNotIn('java/01-native:',result.stdout)
        self.assertEqual(result.stdout.count('go/01-native:'),1)
        self.assertFalse(self.calls())

    def test_default_listing_preserves_python_chapters_and_diagrams(self):
        result=self.cli('--list');self.assertEqual(result.returncode,0,result.stderr)
        self.assertIn('python/01-fundamental: Python 1 [code]',result.stdout)
        self.assertIn('hld/01-diagram: Diagram 1 [diagram]',result.stdout)
        self.assertNotIn('go/01-native:',result.stdout)

    def test_native_shared_chapter_resolves_variant_and_cleans_output(self):
        for language,phase in [('javascript','node'),('go','go'),('java','javac'),('cpp','c++')]:
            with self.subTest(language=language):
                if self.log.exists():self.log.unlink()
                before=self.digest();result=self.cli('lld/01-shared','--language',language,'--stage','prototype')
                self.assertEqual(result.returncode,0,result.stderr)
                calls=self.calls();self.assertEqual(calls[0]['phase'],phase)
                source_name=FILES[language][1]
                self.assertTrue(any(f'variants/{language}/lld/01-shared/{source_name}' in a for a in calls[0]['args']),calls)
                if language in ['go','java','cpp']:
                    native_flag='-d' if language=='java' else '-o'
                    artifact=Path(calls[0]['args'][calls[0]['args'].index(native_flag)+1])
                    self.assertFalse(artifact.exists());self.assertFalse(artifact.is_relative_to(self.root))
                    self.assertEqual(calls[-1]['args'][-2:],['--stage','prototype'])
                self.assertEqual(self.digest(),before)

    def test_native_fundamentals_are_runnable(self):
        result=self.cli('go/01-native','--language','go');self.assertEqual(result.returncode,0,result.stderr)
        self.assertTrue(any('/go/01-native/main.go' in a for a in self.calls()[0]['args']))

    def test_all_language_matches_fundamentals_and_43_shared_variants(self):
        result=self.cli('--all','--language','javascript');self.assertEqual(result.returncode,0,result.stderr)
        calls=self.calls();self.assertEqual(len(calls),44)
        self.assertTrue(all(c['phase']=='node' for c in calls))
        paths=[c['args'][0] for c in calls]
        self.assertEqual(sum('/variants/javascript/dsa/' in p for p in paths),28)
        self.assertEqual(sum('/variants/javascript/lld/' in p for p in paths),15)
        self.assertEqual(sum('/javascript/01-native/' in p for p in paths),1)

    def test_sidecar_only_manifest_layout_is_supported(self):
        self.manifest(self.root/'curriculum.json',self.python+self.shared+self.diagrams)
        result=self.cli('--list','--language','java');self.assertEqual(result.returncode,0,result.stderr);self.assertIn('java/01-native:',result.stdout)

    def test_check_validates_all_languages_without_toolchains_or_python_parsing_them(self):
        self.env['PATH']='';before=self.digest();result=self.cli('--check')
        self.assertEqual(result.returncode,0,result.stderr);self.assertIn('Structure valid:',result.stdout)
        self.assertEqual(self.digest(),before);self.assertFalse(self.calls())

    def test_check_rejects_missing_shared_native_source(self):
        (self.root/'variants/go/dsa/01-shared/exercise.go').unlink()
        result=self.cli('--check');self.assertNotEqual(result.returncode,0);self.assertIn('variants/go/dsa/01-shared',result.stderr)

    def test_check_rejects_missing_language_fundamentals(self):
        self.manifest(self.root/'curriculum.json',self.python+self.shared+self.diagrams+[c for c in self.native if c['track']!='go'])
        (self.root/'curriculum-go.json').unlink()
        result=self.cli('--check');self.assertNotEqual(result.returncode,0);self.assertIn('go',result.stderr.lower())

    def test_check_rejects_comment_only_native_stub_marker(self):
        (self.root/'variants/java/lld/01-shared/Exercise.java').write_text('// throw new UnsupportedOperationException("Implement");\npublic class Exercise {}\n')
        result=self.cli('--check');self.assertNotEqual(result.returncode,0);self.assertIn('Exercise.java',result.stderr)

    def test_check_python_stub_requires_raise_not_comment(self):
        (self.root/'python/01-fundamental/exercise.py').write_text('# NotImplementedError\ndef prototype(): return 1\n')
        result=self.cli('--check');self.assertNotEqual(result.returncode,0);self.assertIn('exercise.py',result.stderr)

    def test_check_rejects_python_syntax_errors(self):
        (self.root/'python/01-fundamental/main.py').write_text('def broken(\n')
        result=self.cli('--check');self.assertNotEqual(result.returncode,0);self.assertIn('main.py',result.stderr)

    def test_check_rejects_escaping_manifest_directory(self):
        self.manifest(self.root/'curriculum-go.json',[{'directory':'../outside','track':'go','title':'invalid'}])
        result=self.cli('--check');self.assertNotEqual(result.returncode,0);self.assertIn('directory',result.stderr.lower())

    def test_fundamental_language_mismatch_suggests_correct_flag(self):
        result=self.cli('go/01-native');self.assertNotEqual(result.returncode,0);self.assertIn('--language go',result.stderr)

    def test_hld_remains_diagram_only(self):
        result=self.cli('hld/01-diagram','--language','cpp');self.assertEqual(result.returncode,2);self.assertIn('Excalidraw',result.stderr)

    def test_missing_toolchain_has_actionable_error(self):
        self.env['PATH']='';result=self.cli('go/01-native','--language','go')
        self.assertNotEqual(result.returncode,0);self.assertIn('Go',result.stderr);self.assertIn('PATH',result.stderr);self.assertNotIn('Traceback',result.stderr)

    def test_compile_failure_does_not_attempt_runtime(self):
        (self.bin/'javac').write_text(f'#!{sys.executable}\nraise SystemExit(7)\n');(self.bin/'javac').chmod(0o755)
        result=self.cli('java/01-native','--language','java');self.assertEqual(result.returncode,1);self.assertFalse(self.calls())

    def test_invalid_options_fail_without_running(self):
        for args in [('--language','ruby'),('--timeout','0','dsa/01-shared'),('--timeout','nan','dsa/01-shared'),('--timeout','inf','dsa/01-shared'),('missing',)]:
            with self.subTest(args=args):self.assertEqual(self.cli(*args).returncode,2)
        self.assertFalse(self.calls())

    @unittest.skipUnless(os.name=='posix','POSIX process-group test')
    def test_timeout_kills_descendants_even_when_parent_exits_on_term(self):
        pidfile=self.workspace/'descendant.pid'
        child='import os,signal,time;from pathlib import Path;signal.signal(signal.SIGTERM,signal.SIG_IGN);Path('+repr(str(pidfile))+').write_text(str(os.getpid()));time.sleep(60)'
        main=self.root/'python/01-fundamental/main.py'
        main.write_text('import subprocess,sys,time\nsubprocess.Popen([sys.executable,"-c",'+repr(child)+'])\ntime.sleep(60)\n')
        result=self.cli('python/01-fundamental','--timeout','0.4',timeout=8)
        self.assertEqual(result.returncode,1,result.stderr);self.assertIn('Safety timeout',result.stderr)
        self.assertTrue(pidfile.exists());pid=int(pidfile.read_text())
        self.addCleanup(lambda: self.kill_if_alive(pid))
        deadline=time.monotonic()+2
        while time.monotonic()<deadline:
            try:os.kill(pid,0)
            except ProcessLookupError:break
            # Linux may retain a dead orphan briefly as a zombie.
            stat=Path(f'/proc/{pid}/stat')
            if stat.exists() and stat.read_text().split()[2]=='Z':break
            time.sleep(0.01)
        else:self.fail(f'descendant remains running: {pid}')

    def kill_if_alive(self,pid):
        try:os.kill(pid,9)
        except ProcessLookupError:pass

if __name__=='__main__':unittest.main(verbosity=2)
