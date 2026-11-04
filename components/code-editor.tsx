"use client";
import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { go } from "@codemirror/lang-go";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { languageInfo } from "@/lib/languages";
import type { Language } from "@/lib/types";
const syntax = { python, javascript, go, java, cpp };
import { EditorView, keymap } from "@codemirror/view";
import { githubLight, githubDarkInit } from "@uiw/codemirror-theme-github";
import { useTheme } from "@/hooks/use-theme";

const githubDark = githubDarkInit({
  settings: {
    gutterBackground: "#0d1117",
    gutterForeground: "#8b949e",
  },
});

const editorLayout = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
  },
  ".cm-scroller": {
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
    lineHeight: "1.8",
    overflow: "auto",
  },
  ".cm-content": { padding: "24px 0" },
  ".cm-line": { padding: "0 22px 0 12px" },
  ".cm-gutters": {
    border: "none",
    minWidth: "45px",
  },
  "&.cm-focused": { outline: "none" },
});

export default function CodeEditor({
  code,
  onChange,
  onRun,
  readOnly = false,
  language = "python",
}: {
  code: string;
  language?: Language;
  onChange?: (value: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
}) {
  const { isDark } = useTheme();
  const extensions = useMemo(
    () => [
      syntax[language](),
      editorLayout,
      EditorView.lineWrapping,
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            onRun?.();
            return true;
          },
        },
      ]),
      EditorView.contentAttributes.of({
        "aria-label": onChange
          ? `${languageInfo[language].label} code editor`
          : `${languageInfo[language].label} test source`,
        "aria-readonly": String(readOnly),
        tabindex: "0",
        spellcheck: "false",
      }),
    ],
    [onRun, onChange, readOnly, language],
  );
  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      height="100%"
      theme={isDark ? githubDark : githubLight}
      extensions={extensions}
      basicSetup={{
        syntaxHighlighting: false,
        highlightActiveLine: false,
        highlightSelectionMatches: true,
        foldGutter: true,
      }}
    />
  );
}
