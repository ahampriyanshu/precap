"""List, validate, or run precap coding chapters (Python 3.11+)."""
from __future__ import annotations

import argparse
import ast
import json
import os
import signal
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main():
    if sys.version_info < (3, 11):
        raise SystemExit("Use Python 3.11 or later")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("chapter", nargs="?")
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--stage", choices=["prototype", "final"], default="final")
    parser.add_argument("--timeout", type=float, default=30)
    args = parser.parse_args()
    chapters = json.loads((ROOT / "curriculum.json").read_text())["chapters"]
    coding = [chapter for chapter in chapters if chapter.get("practice") != "diagram"]
    if args.list:
        for chapter in chapters:
            kind = "diagram" if chapter.get("practice") == "diagram" else "code"
            print(f"{chapter['directory']}: {chapter['title']} [{kind}]")
        return 0
    if args.check:
        for chapter in chapters:
            folder = ROOT / chapter["directory"]
            assert sorted(p.name for p in folder.glob("*.md")) == ["README.md"], folder
            assert not (folder / ".git").exists(), folder
            if chapter.get("practice") == "diagram":
                assert not list(folder.glob("*.py")), folder
                readme = (folder / "README.md").read_text()
                assert "### Draw and explain" in readme, folder
                continue
            for name in ["exercise.py", "main.py"]:
                ast.parse((folder / name).read_text(), filename=str(folder / name))
            assert "NotImplementedError" in (folder / "exercise.py").read_text(), folder
        print(f"Structure valid: {len(coding)} coding exercises and {len(chapters) - len(coding)} diagram briefs. Coding stubs are intentionally unfinished.")
        return 0
    if args.timeout <= 0:
        parser.error("--timeout must be positive")
    chosen = next((chapter for chapter in chapters if chapter["directory"] == args.chapter), None)
    if chosen and chosen.get("practice") == "diagram":
        parser.error(f"HLD uses Excalidraw. Open /learn/{chosen['directory']}/practice/ on the website.")
    selected = coding if args.all else ([chosen] if chosen else [])
    if not selected:
        parser.error("Choose a listed coding chapter, --list, --check or --all")
    failures = 0
    for chapter in selected:
        folder = ROOT / chapter["directory"]
        print(f"\nRunning {chapter['directory']} ({args.stage})", flush=True)
        child = subprocess.Popen([sys.executable, str(folder / "main.py"), "--stage", args.stage], cwd=folder, start_new_session=os.name == "posix")
        try:
            failures += child.wait(timeout=args.timeout) != 0
        except subprocess.TimeoutExpired:
            if os.name == "posix":
                os.killpg(child.pid, signal.SIGTERM)
            else:
                child.terminate()
            try:
                child.wait(timeout=2)
            except subprocess.TimeoutExpired:
                if os.name == "posix":
                    os.killpg(child.pid, signal.SIGKILL)
                else:
                    child.kill()
                child.wait()
            print("Safety timeout: inspect loops, waits and shutdown paths.", file=sys.stderr)
            failures += 1
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
