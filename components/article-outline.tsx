export function ArticleOutline({
  sections,
}: {
  sections: { title: string; id: string }[];
}) {
  const links = (
    <nav className="guide-toc" aria-label="On this page">
      {sections.map((section) => (
        <a href={`#${section.id}`} key={section.id}>
          {section.title}
        </a>
      ))}
    </nav>
  );
  return sections.length > 6 ? (
    <details className="article-outline">
      <summary>
        On this page <span>{sections.length} sections</span>
      </summary>
      {links}
    </details>
  ) : (
    links
  );
}
