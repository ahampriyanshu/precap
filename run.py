"""List, validate, or run precap coding chapters (Python 3.11+ CLI)."""
from __future__ import annotations

import argparse
import ast
import json
import math
import os
from pathlib import Path, PurePosixPath
import re
import shlex
import shutil
import signal
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parent
LANGUAGES = ("python", "javascript", "go", "java", "cpp")
SHARED_TRACKS = ("dsa", "lld")
LABELS = {"python": "Python", "javascript": "JavaScript", "go": "Go", "java": "Java", "cpp": "C++"}
SOURCE_FILES = {
    "python": ("exercise.py", "main.py"),
    "javascript": ("exercise.mjs", "main.mjs"),
    "go": ("exercise.go", "main.go"),
    "java": ("Exercise.java", "Main.java"),
    "cpp": ("exercise.hpp", "main.cpp"),
}


class ContentError(ValueError):
    """A curriculum or source contract is incomplete."""


class ToolchainError(RuntimeError):
    """A required local runtime or compiler is unavailable."""


def chapter_directory(value: object) -> str:
    if not isinstance(value, str) or not value or "\\" in value:
        raise ContentError(f"Invalid chapter directory: {value!r}")
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or str(path) != value:
        raise ContentError(f"Invalid chapter directory: {value!r}; use a relative curriculum path")
    return value


def load_chapters(root: Path) -> list[dict]:
    """Accept merged curricula and sidecar fundamentals manifests without duplicates."""
    chapters: list[dict] = []
    by_directory: dict[str, dict] = {}
    paths = [root / "curriculum.json", *sorted(root.glob("curriculum-*.json"))]
    for path in paths:
        try:
            manifest = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            raise ContentError(f"Cannot read {path.name}: {exc}") from exc
        if not isinstance(manifest, dict) or not isinstance(manifest.get("chapters"), list):
            raise ContentError(f"{path.name} must contain a chapters list")
        sidecar_language = path.stem.removeprefix("curriculum-") if path.name != "curriculum.json" else None
        if sidecar_language is not None and sidecar_language not in LANGUAGES[1:]:
            raise ContentError(f"Unsupported curriculum manifest: {path.name}")
        local_directories: set[str] = set()
        for chapter in manifest["chapters"]:
            if not isinstance(chapter, dict):
                raise ContentError(f"{path.name}: every chapter must be an object")
            directory = chapter_directory(chapter.get("directory"))
            track = chapter.get("track")
            if track not in (*LANGUAGES, *SHARED_TRACKS, "hld"):
                raise ContentError(f"{path.name}: unsupported track for {directory}: {track!r}")
            if not directory.startswith(f"{track}/"):
                raise ContentError(f"{path.name}: directory {directory} does not match track {track}")
            if not isinstance(chapter.get("title"), str) or not chapter["title"]:
                raise ContentError(f"{path.name}: missing title for {directory}")
            if sidecar_language is not None and track != sidecar_language:
                raise ContentError(f"{path.name} may only list {sidecar_language} fundamentals: {directory}")
            if directory in local_directories:
                raise ContentError(f"{path.name}: duplicate chapter directory {directory}")
            local_directories.add(directory)
            existing = by_directory.get(directory)
            if existing is not None:
                if existing["track"] != track:
                    raise ContentError(f"Conflicting track for {directory} across manifests")
                continue
            by_directory[directory] = chapter
            chapters.append(chapter)
    return chapters


def is_diagram(chapter: dict) -> bool:
    return chapter.get("practice") == "diagram"


def language_chapters(chapters: list[dict], language: str) -> list[dict]:
    return [chapter for chapter in chapters if is_diagram(chapter) or chapter["track"] in (language, *SHARED_TRACKS)]


def source_folder(root: Path, chapter: dict, language: str) -> Path:
    directory = chapter_directory(chapter["directory"])
    if language != "python" and chapter["track"] in SHARED_TRACKS:
        directory = f"variants/{language}/{directory}"
    folder = root / directory
    if not folder.resolve().is_relative_to(root.resolve()):
        raise ContentError(f"Chapter directory escapes the content root: {directory}")
    return folder


def read_source(path: Path, root: Path) -> str:
    if not path.resolve().is_relative_to(root.resolve()):
        raise ContentError(f"Source escapes the content root: {path}")
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        raise ContentError(f"Missing or unreadable source {path.relative_to(root)}: {exc}") from exc


def python_stub(tree: ast.AST) -> bool:
    for node in ast.walk(tree):
        if isinstance(node, ast.Raise):
            exception = node.exc.func if isinstance(node.exc, ast.Call) else node.exc
            if isinstance(exception, ast.Name) and exception.id == "NotImplementedError":
                return True
    return False


# Preserve string literals while removing comments; native sources are never parsed as Python.
NATIVE_TOKEN = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`[^`]*`|//[^\n]*|/\*.*?\*/', re.DOTALL)
STUB_PATTERNS = {
    "javascript": r'\{\s*throw\s+new\s+Error\s*\(\s*["\'](?:Not implemented|Implement)',
    "go": r'\{\s*panic\s*\(\s*"(?:Not implemented|Implement)',
    "java": r'\{\s*throw\s+new\s+UnsupportedOperationException\s*\(\s*"(?:Not implemented|Implement)',
    "cpp": r'\{\s*throw\s+std::logic_error\s*\(\s*"(?:Not implemented|Implement)',
}


def native_stub(source: str, language: str) -> bool:
    without_comments = NATIVE_TOKEN.sub(lambda match: " " if match[0].startswith(("//", "/*")) else match[0], source)
    return re.search(STUB_PATTERNS[language], without_comments) is not None


def check_structure(root: Path, chapters: list[dict]) -> tuple[int, int]:
    for language in LANGUAGES:
        if not any(chapter["track"] == language and not is_diagram(chapter) for chapter in chapters):
            raise ContentError(f"Missing {language} fundamentals; include its curriculum-{language}.json manifest or merge it into curriculum.json")
    coding_count = diagram_count = 0
    for chapter in chapters:
        languages = ("python",) if is_diagram(chapter) else (LANGUAGES if chapter["track"] in SHARED_TRACKS else (chapter["track"],))
        for language in languages:
            folder = source_folder(root, chapter, language)
            readme = read_source(folder / "README.md", root)
            if sorted(path.name for path in folder.glob("*.md")) != ["README.md"]:
                raise ContentError(f"{folder.relative_to(root)} must contain exactly one Markdown file: README.md")
            if (folder / ".git").exists():
                raise ContentError(f"Nested .git directory in {folder.relative_to(root)}")
            if is_diagram(chapter):
                if list(folder.glob("*.py")) or "### Draw and explain" not in readme:
                    raise ContentError(f"{folder.relative_to(root)} must be a diagram brief with '### Draw and explain' and no Python files")
                diagram_count += 1
                continue
            exercise_name, main_name = SOURCE_FILES[language]
            exercise = read_source(folder / exercise_name, root)
            main_source = read_source(folder / main_name, root)
            if language == "python":
                try:
                    tree = ast.parse(exercise, filename=str(folder / exercise_name))
                    ast.parse(main_source, filename=str(folder / main_name))
                except SyntaxError as exc:
                    raise ContentError(f"Invalid Python source {exc.filename}:{exc.lineno}: {exc.msg}") from exc
                unfinished = python_stub(tree)
            else:
                unfinished = native_stub(exercise, language)
            if not unfinished:
                raise ContentError(f"{(folder / exercise_name).relative_to(root)} must retain an executable unfinished stub")
            coding_count += 1
    return coding_count, diagram_count


def require_tool(name: str, language: str, hint: str, configured: str | None = None) -> str:
    executable = configured or name
    found = shutil.which(executable)
    if found is None:
        raise ToolchainError(f"{LABELS[language]} tool '{executable}' was not found. {hint}")
    return found


def toolchain(language: str) -> dict[str, list[str]]:
    if language == "python":
        return {"run": [sys.executable]}
    if language == "javascript":
        return {"run": [require_tool("node", language, "Install Node.js 20+ and put node on PATH.")]}
    if language == "go":
        return {"build": [require_tool("go", language, "Install Go 1.22+ and put go on PATH.", os.environ.get("GO"))]}
    if language == "java":
        java_home = os.environ.get("JAVA_HOME")
        suffix = ".exe" if os.name == "nt" else ""
        hint = "Install a JDK 17+ and put its bin directory on PATH, or set JAVA_HOME to that JDK."
        configured = lambda name: str(Path(java_home) / "bin" / (name + suffix)) if java_home else None
        return {"build": [require_tool("javac", language, hint, configured("javac"))], "run": [require_tool("java", language, hint, configured("java"))]}
    compiler = shlex.split(os.environ.get("CXX", "c++"))
    if not compiler:
        raise ToolchainError("C++ compiler is empty. Set CXX to a C++20 compiler or put c++ on PATH.")
    compiler[0] = require_tool(compiler[0], language, "Install a C++20 compiler and put c++ on PATH, or set CXX.")
    return {"build": compiler}


def stop_process_tree(child: subprocess.Popen) -> None:
    """Reap the leader and kill survivors even if it exits before its descendants."""
    if os.name == "posix":
        try:
            os.killpg(child.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            child.wait(timeout=2)
        except subprocess.TimeoutExpired:
            pass
        # Waiting only for the leader can leave a TERM-resistant descendant alive.
        try:
            os.killpg(child.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    else:
        # taskkill /T terminates descendants, unlike Popen.terminate on Windows.
        try:
            subprocess.run(["taskkill", "/PID", str(child.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5, check=False)
        except (OSError, subprocess.TimeoutExpired):
            if child.poll() is None:
                child.kill()
    child.wait()


def run_command(command: list[str], cwd: Path, deadline: float, env: dict[str, str]) -> int:
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise subprocess.TimeoutExpired(command, 0)
    child = subprocess.Popen(command, cwd=cwd, env=env, start_new_session=os.name == "posix")
    try:
        return child.wait(timeout=remaining)
    except (subprocess.TimeoutExpired, KeyboardInterrupt):
        stop_process_tree(child)
        raise


def run_chapter(root: Path, chapter: dict, language: str, stage: str, timeout: float, tools: dict[str, list[str]]) -> bool:
    folder = source_folder(root, chapter, language)
    exercise, main_source = SOURCE_FILES[language]
    # Fail before invoking a compiler when an archive is incomplete.
    for name in (exercise, main_source):
        read_source(folder / name, root)
    deadline = time.monotonic() + timeout
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    try:
        if language in ("python", "javascript"):
            return run_command([*tools["run"], str(folder / main_source), "--stage", stage], folder, deadline, env) == 0
        with tempfile.TemporaryDirectory(prefix=f"precap-{language}-") as scratch:
            temporary = Path(scratch)
            binary = temporary / ("practice.exe" if os.name == "nt" else "practice")
            if language == "go":
                compile_command = [*tools["build"], "build", "-o", str(binary), str(folder / main_source), str(folder / exercise)]
                execute_command = [str(binary), "--stage", stage]
            elif language == "java":
                compile_command = [*tools["build"], "-encoding", "UTF-8", "-d", str(temporary), str(folder / exercise), str(folder / main_source)]
                execute_command = [*tools["run"], "-cp", str(temporary), "Main", "--stage", stage]
            else:
                compile_command = [*tools["build"], "-std=c++20", "-O2", "-Wall", "-Wextra", "-pedantic", "-pthread", str(folder / main_source), "-o", str(binary)]
                execute_command = [str(binary), "--stage", stage]
            if run_command(compile_command, temporary, deadline, env) != 0:
                return False
            return run_command(execute_command, folder, deadline, env) == 0
    except subprocess.TimeoutExpired:
        print("Safety timeout: inspect loops, waits and shutdown paths. Compilation and execution share --timeout.", file=sys.stderr)
        return False


def main(argv: list[str] | None = None) -> int:
    if sys.version_info < (3, 11):
        raise SystemExit("Use Python 3.11 or later")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("chapter", nargs="?")
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--check", action="store_true", help="validate all language manifests, sources and unfinished stubs")
    parser.add_argument("--all", action="store_true", help="run selected-language fundamentals plus DSA and LLD")
    parser.add_argument("--language", choices=LANGUAGES, default="python")
    parser.add_argument("--stage", choices=["prototype", "final"], default="final")
    parser.add_argument("--timeout", type=float, default=30, help="positive total seconds per chapter, including compilation")
    args = parser.parse_args(argv)
    try:
        chapters = load_chapters(ROOT)
    except ContentError as exc:
        parser.error(str(exc))
    visible = language_chapters(chapters, args.language)
    coding = [chapter for chapter in visible if not is_diagram(chapter)]
    if args.list:
        for chapter in visible:
            kind = "diagram" if is_diagram(chapter) else "code"
            if args.language != "python" and not is_diagram(chapter):
                kind += f", {LABELS[args.language]}"
            print(f"{chapter['directory']}: {chapter['title']} [{kind}]")
        return 0
    if args.check:
        try:
            coding_count, diagram_count = check_structure(ROOT, chapters)
        except ContentError as exc:
            print(f"Structure check failed: {exc}", file=sys.stderr)
            return 1
        print(f"Structure valid: {coding_count} coding exercises across {len(LANGUAGES)} languages and {diagram_count} diagram briefs. Coding stubs are intentionally unfinished.")
        return 0
    if not math.isfinite(args.timeout) or args.timeout <= 0:
        parser.error("--timeout must be finite and positive")
    chosen = next((chapter for chapter in chapters if chapter["directory"] == args.chapter), None)
    if chosen is not None and is_diagram(chosen):
        parser.error(f"HLD uses Excalidraw. Open /learn/{chosen['directory']}/practice/ on the website.")
    if chosen is not None and chosen["track"] in LANGUAGES and chosen["track"] != args.language:
        parser.error(f"{chosen['directory']} is a {LABELS[chosen['track']]} fundamental. Use --language {chosen['track']}.")
    selected = coding if args.all else ([chosen] if chosen is not None else [])
    if not selected:
        parser.error("Choose a listed coding chapter, --list, --check or --all")
    try:
        tools = toolchain(args.language)
    except ToolchainError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    failures = 0
    try:
        for chapter in selected:
            suffix = "" if args.language == "python" else f" [{LABELS[args.language]}]"
            print(f"\nRunning {chapter['directory']}{suffix} ({args.stage})", flush=True)
            try:
                failures += not run_chapter(ROOT, chapter, args.language, args.stage, args.timeout, tools)
            except (ContentError, OSError) as exc:
                print(f"Cannot run {chapter['directory']}: {exc}", file=sys.stderr)
                failures += 1
    except KeyboardInterrupt:
        print("Interrupted; stopped the active chapter process group.", file=sys.stderr)
        return 130
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
