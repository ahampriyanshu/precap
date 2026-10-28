export function cheatsheetUrl(slug: string) {
  return `/cheatsheets/${slug}/`;
}

export function guideUrl(guide: string, part: string) {
  return `/guides/${guide}/${part}/`;
}

export function headingId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function headingText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const entry = node as { value?: unknown; children?: unknown[] };
  if (typeof entry.value === "string") return entry.value;
  return Array.isArray(entry.children)
    ? entry.children.map(headingText).join("")
    : "";
}

export function guideSections(markdown: string) {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((match) => {
    const title = match[1].replace(/[`*_]/g, "").trim();
    return { title, id: headingId(title) };
  });
}
