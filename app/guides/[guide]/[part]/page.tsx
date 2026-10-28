import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArticleOutline } from "@/components/article-outline";
import { cheatsheets } from "@/lib/cheatsheets";
import { Content } from "@/components/content";
import { GuideShell } from "@/components/guide-shell";
import { guides, getGuideArticle, getGuideRedirect } from "@/lib/guides";
import { guideUrl, cheatsheetUrl } from "@/lib/guide-utils";

export const dynamicParams = false;
export function generateStaticParams() {
  return guides.flatMap((guide) =>
    guide.parts.flatMap((part) => [
      { guide: guide.slug, part: part.slug },
      ...(part.aliases ?? []).map((alias) => ({
        guide: alias.guide ?? guide.slug,
        part: alias.slug,
      })),
    ]),
  );
}
type Props = { params: Promise<{ guide: string; part: string }> };
export async function generateMetadata({ params }: Props) {
  const { guide, part } = await params;
  const article = getGuideArticle(guide, part);
  return article
    ? { title: article.part.title, description: article.part.description }
    : {};
}
export default async function GuidePage({ params }: Props) {
  const { guide, part } = await params;
  const destination = getGuideRedirect(guide, part);
  if (destination) {
    return (
      <main className="redirect-notice">
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
        <h1>This recap has moved</h1>
        <p>
          <a href={destination}>Continue to the complete recap</a>
        </p>
      </main>
    );
  }
  const article = getGuideArticle(guide, part);
  if (!article) notFound();
  const sequential = article.guide.sequential !== false;
  const next = sequential
    ? article.guide.parts[article.position + 1]
    : undefined;
  const reference = cheatsheets.find(
    (sheet) => sheet.slug === article.part.cheatsheet,
  );
  return (
    <GuideShell
      guide={article.guide}
      partSlug={part}
      guides={guides}
      cheatsheets={cheatsheets}
    >
      <article
        className="lesson-reader guide-reader"
        tabIndex={0}
        aria-label={`${article.part.label || article.part.title} guide`}
      >
        <div className="reading-inner">
          <p className="lesson-kicker">
            {article.guide.title}
            {sequential && article.guide.parts.length > 1
              ? ` · Part ${article.position + 1} of ${article.guide.parts.length}`
              : " · Complete recap"}
          </p>
          <h1>{article.part.title}</h1>
          <p className="lesson-focus">{article.part.description}</p>
          {reference && (
            <Link
              className="reference-context-link"
              href={cheatsheetUrl(reference.slug)}
            >
              Open {reference.title}
            </Link>
          )}
          <ArticleOutline sections={article.sections} />
          <Content
            markdown={article.content}
            highlights={article.highlights}
            anchors
          />
          {!sequential && (
            <nav
              className="related-recaps"
              aria-label={`More in ${article.guide.title}`}
            >
              <h2>More in {article.guide.title}</h2>
              {article.guide.parts
                .filter((entry) => entry.slug !== part)
                .map((entry) => (
                  <Link key={entry.slug} href={guideUrl(guide, entry.slug)}>
                    {entry.label || entry.title}
                    <ArrowRight size={15} />
                  </Link>
                ))}
            </nav>
          )}
          {next ? (
            <Link className="next-lesson" href={guideUrl(guide, next.slug)}>
              <span>
                Continue<strong>{next.title}</strong>
              </span>
              <ArrowRight size={19} />
            </Link>
          ) : (
            <Link className="guide-back" href="/#guides">
              <ArrowLeft size={15} />
              Back to field guides
            </Link>
          )}
        </div>
      </article>
    </GuideShell>
  );
}
