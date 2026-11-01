import curriculumJson from "@/curriculum.json";
import guidesJson from "@/guides.json";
import cheatsheetsJson from "@/cheatsheets.json";
import { courses } from "@/lib/courses";
import type { Track } from "@/lib/types";

export interface NavChapter {
  id: string;
  slug: string;
  track: Track;
  number: string;
  title: string;
  concept: string;
  section: string;
  native: boolean;
}

export interface NavGuidePart {
  slug: string;
  title: string;
  label?: string;
  module?: string;
}

export interface NavGuide {
  slug: string;
  title: string;
  parts: NavGuidePart[];
}

export interface NavCheatsheet {
  slug: string;
  title: string;
}

export interface SearchItem {
  title: string;
  category: string;
  url: string;
  searchText: string;
}

// Fixed order of tracks in the sidebar
export const SIDEBAR_TRACKS: Track[] = [
  "dsa",
  "lld",
  "hld",
  "python",
  "javascript",
  "go",
  "java",
  "cpp",
];

// All chapters grouped by track
export const navChaptersByTrack: Record<Track, NavChapter[]> = {
  python: [],
  javascript: [],
  go: [],
  java: [],
  cpp: [],
  dsa: [],
  lld: [],
  hld: [],
};

for (const raw of curriculumJson.chapters) {
  const track = raw.track as Track;
  const slug = raw.directory.split("/")[1];
  const item: NavChapter = {
    id: raw.directory,
    slug,
    track,
    number: slug.slice(0, 2),
    title: raw.title,
    concept: raw.concept,
    section: raw.section,
    native: raw.native === true,
  };
  if (navChaptersByTrack[track]) {
    navChaptersByTrack[track].push(item);
  }
}

// All guides in fixed order
export const navGuides: NavGuide[] = guidesJson.guides.map((g) => ({
  slug: g.slug,
  title: g.title,
  parts: g.parts.map((p) => {
    const part = p as {
      slug: string;
      title: string;
      label?: string;
      module?: string;
    };
    return {
      slug: part.slug,
      title: part.title,
      label: part.label,
      module: part.module,
    };
  }),
}));

// All cheatsheets in fixed order
export const navCheatsheets: NavCheatsheet[] = cheatsheetsJson.cheatsheets.map(
  (c) => ({
    slug: c.slug,
    title: c.title,
  }),
);

// Global search index for navbar search
export const searchItems: SearchItem[] = [
  // Tracks
  ...curriculumJson.chapters.map((ch) => {
    const track = ch.track as Track;
    const trackTitle = courses[track]?.title || track;
    return {
      title: ch.title,
      category: trackTitle,
      url: `/learn/${ch.directory}/`,
      searchText:
        `${trackTitle} ${ch.title} ${ch.concept} ${ch.section}`.toLowerCase(),
    };
  }),
  // Playlists
  ...guidesJson.guides.flatMap((g) =>
    g.parts.map((p) => {
      const part = p as {
        slug: string;
        title: string;
        label?: string;
        module?: string;
        keywords?: string[];
      };
      return {
        title: part.label || part.title,
        category: g.title,
        url: `/guides/${g.slug}/${part.slug}/`,
        searchText:
          `${g.title} ${part.title} ${part.module || ""} ${(part.keywords || []).join(" ")}`.toLowerCase(),
      };
    }),
  ),
  // Cheatsheets
  ...cheatsheetsJson.cheatsheets.map((c) => ({
    title: `${c.title} cheatsheet`,
    category: "Cheatsheet",
    url: `/cheatsheets/${c.slug}/`,
    searchText:
      `${c.title} cheatsheet ${c.description} ${(c.keywords || []).join(" ")}`.toLowerCase(),
  })),
];
