import "server-only";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubDark from "shiki/themes/github-dark-default.mjs";
import go from "shiki/langs/go.mjs";
import java from "shiki/langs/java.mjs";
import cpp from "shiki/langs/cpp.mjs";
import python from "shiki/langs/python.mjs";
import javascript from "shiki/langs/javascript.mjs";
import typescript from "shiki/langs/typescript.mjs";
import jsx from "shiki/langs/jsx.mjs";
import tsx from "shiki/langs/tsx.mjs";
import html from "shiki/langs/html.mjs";
import css from "shiki/langs/css.mjs";
import lua from "shiki/langs/lua.mjs";
import sql from "shiki/langs/sql.mjs";
import json from "shiki/langs/json.mjs";
import yaml from "shiki/langs/yaml.mjs";
import http from "shiki/langs/http.mjs";
import shell from "shiki/langs/shellscript.mjs";
import docker from "shiki/langs/docker.mjs";
import nginx from "shiki/langs/nginx.mjs";
import hcl from "shiki/langs/hcl.mjs";
import groovy from "shiki/langs/groovy.mjs";
import ini from "shiki/langs/ini.mjs";
import { codeKey, type CodeHighlights, type CodeTokens } from "./code-theme";

// PromQL is used by the observability recaps and has no bundled grammar.
const promql = {
  name: "promql",
  scopeName: "source.promql",
  repository: {},
  patterns: [
    { name: "comment.line.number-sign.promql", match: "#.*$" },
    {
      name: "string.quoted.double.promql",
      begin: '"',
      end: '"',
      patterns: [{ name: "constant.character.escape.promql", match: "\\\\." }],
    },
    {
      name: "keyword.control.promql",
      match:
        "\\b(?:by|without|on|ignoring|group_left|group_right|bool|offset|and|or|unless)\\b",
    },
    {
      name: "support.function.promql",
      match: "\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\s*\\()",
    },
    {
      name: "constant.numeric.promql",
      match: "\\b\\d+(?:\\.\\d+)?(?:ms|[smhdwy])?\\b",
    },
    { name: "keyword.operator.promql", match: "[=!<>~+*/%^|-]+" },
  ],
};

const logql = {
  ...promql,
  name: "logql",
  scopeName: "source.logql",
  patterns: [
    ...promql.patterns,
    {
      name: "keyword.control.logql",
      match: "\\b(?:json|logfmt|line_format|label_format|unwrap|drop|keep)\\b",
    },
  ],
};

const highlighter = createHighlighterCoreSync({
  themes: [githubDark],
  langs: [
    python,
    go,
    java,
    cpp,
    javascript,
    typescript,
    jsx,
    tsx,
    html,
    css,
    lua,
    sql,
    json,
    yaml,
    http,
    shell,
    docker,
    nginx,
    hcl,
    groovy,
    ini,
    promql,
    logql,
  ],
  engine: createJavaScriptRegexEngine(),
});
const languages = new Set(highlighter.getLoadedLanguages());
const cache = new Map<string, CodeTokens>();

export function getCodeHighlights(markdown: string): CodeHighlights {
  const highlights: CodeHighlights = {};
  for (const match of markdown.matchAll(
    /^```([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm,
  )) {
    const language = match[1].trim().split(/\s+/)[0].toLowerCase();
    const code = match[2].replace(/\r\n/g, "\n").replace(/\n$/, "");
    const key = codeKey(language, code);
    let tokens = cache.get(key);
    if (!tokens) {
      tokens = highlighter
        .codeToTokens(code, {
          lang: languages.has(language) ? language : "text",
          theme: "github-dark-default",
        })
        .tokens.map((line) =>
          line.map((token) => [
            token.content,
            token.color || "#e6edf3",
            token.fontStyle || 0,
          ]),
        );
      cache.set(key, tokens);
    }
    highlights[key] = tokens;
  }
  return highlights;
}
