"use client";
import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { EditorView, keymap } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const highlighting = HighlightStyle.define([
  { tag: tags.keyword, color: "#78537b" },
  { tag: [tags.string, tags.docString], color: "#47714d" },
  { tag: [tags.number, tags.bool, tags.null], color: "#8a643b" },
  { tag: [tags.function(tags.variableName), tags.className], color: "#3c6d7a" },
  { tag: [tags.comment, tags.meta], color: "#64715c" },
  { tag: [tags.typeName, tags.standard(tags.variableName)], color: "#596e7b" },
]);

const theme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#fbfcfa",
    color: "#273a35",
    fontSize: "13px",
  },
  ".cm-scroller": {
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
    lineHeight: "1.8",
    overflow: "auto",
  },
  ".cm-content": { padding: "24px 0", caretColor: "#1e5f4d" },
  ".cm-line": { padding: "0 22px 0 12px" },
  ".cm-gutters": {
    backgroundColor: "#fbfcfa",
    color: "#596c5c",
    border: "none",
    minWidth: "45px",
  },
  ".cm-activeLineGutter": { color: "#406052", backgroundColor: "transparent" },
  ".cm-selectionBackground": { backgroundColor: "#dcebdc !important" },
  "&.cm-focused": { outline: "none" },
  ".cm-foldGutter": { color: "#596c5c" },
});

export default function CodeEditor({
  code,
  onChange,
  onRun,
  readOnly = false,
}: {
  code: string;
  onChange?: (value: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
}) {
  const extensions = useMemo(
    () => [
      python(),
      syntaxHighlighting(highlighting),
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
        "aria-label": onChange ? "Python code editor" : "Python test source",
        "aria-readonly": String(readOnly),
        tabindex: "0",
        spellcheck: "false",
      }),
    ],
    [onRun, onChange, readOnly],
  );
  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      height="100%"
      theme={theme}
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
