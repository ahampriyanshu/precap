import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/code-block";
import { headingId, headingText } from "@/lib/guide-utils";
import { codeKey, type CodeHighlights } from "@/lib/code-theme";

export function Content({
  markdown,
  anchors = false,
  highlights,
}: {
  markdown: string;
  anchors?: boolean;
  highlights: CodeHighlights;
}) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children, node }) => {
            const code = node?.children.find(
              (child) => child.type === "element" && child.tagName === "code",
            );
            if (!code || code.type !== "element") return <pre>{children}</pre>;
            const classes = code.properties.className;
            const language =
              (Array.isArray(classes) ? classes : [])
                .map(String)
                .find((name) => name.startsWith("language-"))
                ?.slice(9) || "";
            const source = headingText(code);
            return (
              <CodeBlock
                code={source}
                language={language}
                tokens={highlights[codeKey(language, source)]}
              />
            );
          },
          h2: ({ children, node }) => (
            <h2 id={anchors ? headingId(headingText(node)) : undefined}>
              {children}
            </h2>
          ),
          a: ({ children, href }) =>
            href &&
            ((href.startsWith("/") && !href.startsWith("//")) ||
              href.startsWith("#")) ? (
              <a href={href}>{children}</a>
            ) : (
              <>{children}</>
            ),
          img: ({ src, alt }) =>
            typeof src === "string" && src.startsWith("/diagrams/") ? (
              <span
                className="diagram-frame"
                role="region"
                aria-label={`Diagram: ${alt || "mechanism illustration"}`}
                tabIndex={0}
              >
                <img
                  src={src}
                  alt={alt || ""}
                  loading="lazy"
                  className="lesson-diagram"
                />
              </span>
            ) : null,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
