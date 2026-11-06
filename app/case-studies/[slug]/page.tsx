import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleOutline } from "@/components/article-outline";
import { Content } from "@/components/content";
import { CaseStudyShell } from "@/components/case-study-shell";
import { caseStudies, getCaseStudyArticle } from "@/lib/case-studies";
import { guideUrl, caseStudyUrl } from "@/lib/guide-utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getCaseStudyArticle(slug);
  return article
    ? { title: article.study.title, description: article.study.description }
    : {};
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const article = getCaseStudyArticle(slug);
  if (!article) notFound();

  const { study, content, highlights, sections } = article;

  return (
    <CaseStudyShell caseStudies={caseStudies} currentSlug={slug}>
      <article
        className="lesson-reader guide-reader"
        tabIndex={0}
        aria-label={`${study.title} case study`}
      >
        <div className="reading-inner">
          <p className="lesson-kicker">
            Case Study · {study.company} · {study.year}
          </p>
          <h1>{study.title}</h1>
          <div className="case-study-article-meta">
            <span className={`case-study-tag tag-${study.tag}`}>{study.tag}</span>
          </div>
          <p className="lesson-focus">{study.description}</p>
          <ArticleOutline sections={sections} />
          <Content markdown={content} highlights={highlights} anchors />
          <nav className="related-recaps" aria-label="Related content">
            {study.relatedGuide && (
              <div className="case-study-related">
                <h2>Related guide</h2>
                <Link href={guideUrl(study.relatedGuide.slug, study.relatedGuide.part)}>
                  Read: {study.relatedGuide.slug} / {study.relatedGuide.part}
                </Link>
              </div>
            )}
            {study.relatedHld && (
              <div className="case-study-related">
                <h2>Related HLD</h2>
                <Link href={`/learn/hld/${study.relatedHld}/`}>
                  HLD lesson: {study.relatedHld}
                </Link>
              </div>
            )}
          </nav>
          <Link className="guide-back" href="/case-studies/">
            Back to case studies
          </Link>
        </div>
      </article>
    </CaseStudyShell>
  );
}
