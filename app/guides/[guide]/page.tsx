import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ConceptIllustration } from "@/components/concept-illustration";
import { hasConceptArt } from "@/lib/concept-art";
import { guides } from "@/lib/guides";
import { guideUrl } from "@/lib/guide-utils";

export const dynamicParams = false;
export function generateStaticParams() {
  return guides.flatMap((guide) => [
    { guide: guide.slug },
    ...(guide.indexAliases || []).map((slug) => ({ guide: slug })),
  ]);
}
type Props = { params: Promise<{ guide: string }> };
export async function generateMetadata({ params }: Props) {
  const { guide: slug } = await params;
  const guide = guides.find((entry) => entry.slug === slug);
  return guide ? { title: guide.title, description: guide.description } : {};
}
export default async function PlaylistPage({ params }: Props) {
  const { guide: slug } = await params;
  const guide = guides.find((entry) => entry.slug === slug);
  if (!guide) {
    const moved = guides.find((entry) => entry.indexAliases?.includes(slug));
    if (!moved) notFound();
    const destination = `/guides/${moved.slug}/`;
    return (
      <main className="redirect-notice">
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
        <h1>This playlist has moved</h1>
        <p>
          <a href={destination}>Continue to {moved.title}</a>
        </p>
      </main>
    );
  }
  const modules = [
    ...new Set(guide.parts.map((part) => part.module || "The curriculum")),
  ];
  return (
    <div className="catalog playlist-index">
      <a className="skip-link" href="#main-content">
        Skip to curriculum
      </a>
      <SiteHeader
        showBrand={true}
        searchAriaLabel="Search course lessons"
        breadcrumb={<span className="breadcrumb-title">{guide.title}</span>}
      />
      <main className="catalog-main" id="main-content" tabIndex={-1}>
        <header className="playlist-intro">
          <div className="playlist-intro-copy">
            <p className="intro-kicker">
              {guide.slug === "last-mile-prep"
                ? `${modules.length} modules`
                : guide.moduleLabel === "Track"
                  ? `${modules.length} tracks`
                  : "Engineering curriculum"}{" "}
              · {guide.parts.length} lessons
            </p>
            <h1>{guide.title}</h1>
            <p className="intro-copy">{guide.description}</p>
            <Link
              className="text-link"
              href={guideUrl(guide.slug, guide.parts[0].slug)}
            >
              Start with {guide.parts[0].title}
            </Link>
          </div>
          {hasConceptArt(guide.slug) && (
            <ConceptIllustration concept={guide.slug} />
          )}
        </header>
        <div className="playlist-layout">
          <nav className="module-index" aria-label="Modules">
            <p>In this playlist</p>
            {modules.map((module, index) => (
              <a key={module} href={`#module-${index + 1}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {module}
              </a>
            ))}
          </nav>
          <div className="playlist-modules">
            {modules.map((module, index) => (
              <section
                className="playlist-module"
                id={`module-${index + 1}`}
                key={module}
                aria-labelledby={`module-title-${index + 1}`}
              >
                <p className="module-number">
                  {guide.moduleLabel || "Module"} {index + 1}
                </p>
                <h2 id={`module-title-${index + 1}`}>{module}</h2>
                <ol>
                  {guide.parts
                    .filter(
                      (part) => (part.module || "The curriculum") === module,
                    )
                    .map((part) => (
                      <li key={part.slug}>
                        <Link href={guideUrl(guide.slug, part.slug)}>
                          <span className="lesson-index-number">
                            {String(guide.parts.indexOf(part) + 1).padStart(
                              2,
                              "0",
                            )}
                          </span>
                          <span>
                            <h3>{part.title}</h3>
                            <p>{part.description}</p>
                          </span>
                        </Link>
                      </li>
                    ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
        <footer className="catalog-footer">
          <Link href="/#guides">All playlists</Link>
          <span>
            made by{" "}
            <a
              href="https://ahampriyanshu.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              ahampriyanshu
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
}
