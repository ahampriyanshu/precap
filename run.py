"""List, validate, or run independent learning chapters (Python 3.11+)."""
from __future__ import annotations
import argparse,ast,json,os,signal,subprocess,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent
def main():
    if sys.version_info<(3,11):raise SystemExit('Use Python 3.11 or later')
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('chapter',nargs='?')
    parser.add_argument('--list',action='store_true')
    parser.add_argument('--check',action='store_true')
    parser.add_argument('--all',action='store_true')
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    parser.add_argument('--timeout',type=float,default=30)
    args=parser.parse_args()
    chapters=json.loads((ROOT/'curriculum.json').read_text())['chapters']
    if args.list:
        for chapter in chapters:print(f"{chapter['directory']}: {chapter['title']}")
        return 0
    if args.check:
        for chapter in chapters:
            folder=ROOT/chapter['directory']
            assert sorted(p.name for p in folder.glob('*.md'))==['README.md'],folder
            for name in ['exercise.py','main.py']:ast.parse((folder/name).read_text(),filename=str(folder/name))
            assert 'NotImplementedError' in (folder/'exercise.py').read_text(),folder
            assert not (folder/'.git').exists(),folder
        print(f"Structure valid: {len(chapters)} independent chapter directories; stubs are intentionally unfinished.")
        return 0
    if args.timeout<=0:parser.error('--timeout must be positive')
    selected=chapters if args.all else [x for x in chapters if x['directory']==args.chapter]
    if not selected:parser.error('Choose a listed chapter, --list, --check or --all')
    failures=0
    for chapter in selected:
        folder=ROOT/chapter['directory']
        print(f"\nRunning {chapter['directory']} ({args.stage})",flush=True)
        child=subprocess.Popen([sys.executable,str(folder/'main.py'),'--stage',args.stage],cwd=folder,start_new_session=os.name=='posix')
        try:
            failures+=child.wait(timeout=args.timeout)!=0
        except subprocess.TimeoutExpired:
            if os.name=='posix':os.killpg(child.pid,signal.SIGTERM)
            else:child.terminate()
            try:child.wait(timeout=2)
            except subprocess.TimeoutExpired:
                if os.name=='posix':os.killpg(child.pid,signal.SIGKILL)
                else:child.kill()
                child.wait()
            print('Safety timeout: inspect loops, waits and shutdown paths.',file=sys.stderr);failures+=1
    return int(bool(failures))
if __name__=='__main__':raise SystemExit(main())
