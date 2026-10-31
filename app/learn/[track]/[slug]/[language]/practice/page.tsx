import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { chapters, chaptersForLanguage, getLesson } from "@/lib/curriculum";
import { isLanguage, isSharedTrack, languageInfo } from "@/lib/languages";
export const dynamicParams = false;
export function generateStaticParams() {
  return chapters
    .filter((chapter) => isSharedTrack(chapter.track))
    .flatMap((chapter) =>
      chapter.languages
        .filter((language) => language !== "python")
        .map((language) => ({
          track: chapter.track,
          slug: chapter.slug,
          language,
        })),
    );
}
type Props = {
  params: Promise<{ track: string; slug: string; language: string }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track, slug, language } = await params;
  return {
    title: isLanguage(language)
      ? `Practice: ${getLesson(track, slug, language)?.title ?? "Not found"} · ${languageInfo[language].label}`
      : "Not found",
  };
}
export default async function LanguagePracticePage({ params }: Props) {
  const { track, slug, language } = await params;
  if (!isLanguage(language) || !isSharedTrack(track)) notFound();
  const lesson = getLesson(track, slug, language);
  if (!lesson) notFound();
  return (
    <Workspace
      key={lesson.id}
      lesson={lesson}
      chapters={chaptersForLanguage(language)}
      practice
    />
  );
}
