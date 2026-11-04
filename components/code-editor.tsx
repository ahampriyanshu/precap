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
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { useTheme } from "@/hooks/use-theme";

const lightHighlighting = HighlightStyle.define([
  { tag: tags.keyword, color: "#78537b" },
  { tag: [tags.string, tags.docString], color: "#0969da" },
  { tag: [tags.number, tags.bool, tags.null], color: "#0550ae" },
  { tag: [tags.function(tags.variableName), tags.className], color: "#3c6d7a" },
  { tag: [tags.comment, tags.meta], color: "#767676" },
  { tag: [tags.typeName, tags.standard(tags.variableName)], color: "#596e7b" },
]);

const darkHighlighting = HighlightStyle.define([
  { tag: tags.keyword, color: "#ff7b72" },
  { tag: [tags.string, tags.docString], color: "#a5d6ff" },
  { tag: [tags.number, tags.bool, tags.null], color: "#79c0ff" },
  { tag: [tags.function(tags.variableName), tags.className], color: "#d2a8ff" },
  { tag: [tags.comment, tags.meta], color: "#8b949e" },
  { tag: [tags.typeName, tags.standard(tags.variableName)], color: "#7ee787" },
]);

const lightTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#f6f8fa",
    color: "#111111",
    fontSize: "13px",
  },
  ".cm-scroller": {
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
    lineHeight: "1.8",
    overflow: "auto",
  },
  ".cm-content": { padding: "24px 0", caretColor: "#111111" },
  ".cm-line": { padding: "0 22px 0 12px" },
  ".cm-gutters": {
    backgroundColor: "#f6f8fa",
    color: "#707070",
    border: "none",
    minWidth: "45px",
  },
  ".cm-activeLineGutter": { color: "#111111", backgroundColor: "transparent" },
  ".cm-selectionBackground": { backgroundColor: "#dbe9f9 !important" },
  "&.cm-focused": { outline: "none" },
  ".cm-foldGutter": { color: "#707070" },
});

const darkTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "#0d1117",
      color: "#f0f6fc",
      fontSize: "13px",
    },
    ".cm-scroller": {
      fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
      lineHeight: "1.8",
      overflow: "auto",
    },
    ".cm-content": { padding: "24px 0", caretColor: "#f0f6fc" },
    ".cm-line": { padding: "0 22px 0 12px" },
    ".cm-gutters": {
      backgroundColor: "#0d1117",
      color: "#8b949e",
      border: "none",
      minWidth: "45px",
    },
    ".cm-activeLineGutter": {
      color: "#f0f6fc",
      backgroundColor: "transparent",
    },
    ".cm-selectionBackground": { backgroundColor: "#264f78 !important" },
    "&.cm-focused": { outline: "none" },
    ".cm-foldGutter": { color: "#8b949e" },
  },
  { dark: true },
);

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
      syntaxHighlighting(isDark ? darkHighlighting : lightHighlighting),
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
    [onRun, onChange, readOnly, language, isDark],
  );
  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      height="100%"
      theme={isDark ? darkTheme : lightTheme}
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
