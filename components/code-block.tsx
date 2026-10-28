"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { CodeTokens } from "@/lib/code-theme";

const languageLabels: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  html: "HTML",
  css: "CSS",
  ini: "INI",
  lua: "Lua",
  sql: "SQL",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  http: "HTTP",
  bash: "Shell",
  sh: "Shell",
  dockerfile: "Dockerfile",
  nginx: "Nginx",
  hcl: "Terraform",
  terraform: "Terraform",
  groovy: "Groovy",
  promql: "PromQL",
  text: "Text",
  pseudocode: "Pseudocode",
};

export function CodeBlock({
  code,
  language,
  tokens,
}: {
  code: string;
  language: string;
  tokens?: CodeTokens;
}) {
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const label = languageLabels[language] || language || "Code";

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Copy unavailable; select the code to copy it.");
    }
    timer.current = setTimeout(() => setStatus(""), 3000);
  }

  return (
    <figure
      className="code-example"
      data-theme="github-dark"
      data-language={language}
    >
      <figcaption className="code-example-bar">
        <span>{label}</span>
        <span className="code-example-actions">
          <span className="code-copy-status" role="status">
            {status}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${label} code`}
          >
            Copy
          </button>
        </span>
      </figcaption>
      <pre tabIndex={0} aria-label={`${label} example`}>
        <code className={language ? `language-${language}` : undefined}>
          {tokens
            ? tokens.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 ? "\n" : ""}
                  {line.map(([content, color, fontStyle], tokenIndex) => (
                    <span
                      className="code-token"
                      key={tokenIndex}
                      style={{
                        color,
                        fontStyle: fontStyle & 1 ? "italic" : undefined,
                        fontWeight: fontStyle & 2 ? 700 : undefined,
                        textDecoration: fontStyle & 4 ? "underline" : undefined,
                      }}
                    >
                      {content}
                    </span>
                  ))}
                </Fragment>
              ))
            : code.replace(/\n$/, "")}
        </code>
      </pre>
    </figure>
  );
}
