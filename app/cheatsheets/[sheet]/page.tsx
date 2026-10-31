import Link from "next/link";
import { notFound } from "next/navigation";
import { Content } from "@/components/content";
import { ArticleOutline } from "@/components/article-outline";
import { GuideShell } from "@/components/guide-shell";
import { cheatsheets, getCheatsheetArticle } from "@/lib/cheatsheets";
import { guides } from "@/lib/guides";
import { guideUrl } from "@/lib/guide-utils";

const legacySheets: Record<string, string> = {
  frontend: "frontend",
  backend: "backend",
  devops: "devops",
};
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...cheatsheets.map((sheet) => ({ sheet: sheet.slug })),
    ...Object.keys(legacySheets).map((sheet) => ({ sheet })),
  ];
}
type Props = { params: Promise<{ sheet: string }> };
export async function generateMetadata({ params }: Props) {
  const article = getCheatsheetArticle((await params).sheet);
  return article
    ? { title: article.sheet.title, description: article.sheet.description }
    : {};
}
export default async function CheatsheetPage({ params }: Props) {
  const { sheet } = await params;
  if (legacySheets[sheet]) {
    const destination = `/guides/${legacySheets[sheet]}/`;
    return (
      <main className="redirect-notice">
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
        <h1>This topic has a curriculum</h1>
        <p>
          <a href={destination}>Open the playlist</a>
        </p>
      </main>
    );
  }
  const article = getCheatsheetArticle(sheet);
  if (!article) notFound();
  const guide = guides.find((entry) => entry.slug === article.sheet.guide.slug);
  const part = guide?.parts.find(
    (entry) => entry.slug === article.sheet.guide.part,
  );
  if (!guide || !part) notFound();
  return (
    <GuideShell
      guide={guide}
      partSlug={article.sheet.guide.part}
      guides={guides}
      cheatsheets={cheatsheets}
      cheatsheet={article.sheet}
    >
      <article
        className="lesson-reader guide-reader cheatsheet-reader"
        tabIndex={0}
        aria-label={`${part.label || part.title} cheatsheet`}
      >
        <div className="reading-inner">
          <p className="lesson-kicker">
            Cheatsheets · {part.label || part.title}
          </p>
          <h1>{article.sheet.title}</h1>
          <p className="lesson-focus">{article.sheet.description}</p>
          <Link
            className="reference-context-link"
            href={guideUrl(guide.slug, article.sheet.guide.part)}
          >
            Read {part.label || part.title}
          </Link>
          <ArticleOutline sections={article.sections} />
          <Content
            markdown={article.content}
            highlights={article.highlights}
            anchors
          />
          <Link className="guide-back" href="/#cheatsheets">
            Back to cheatsheets
          </Link>
        </div>
      </article>
    </GuideShell>
  );
}
